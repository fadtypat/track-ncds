// FR-18 — สรุปการตรวจ HbA1c รายผู้ป่วยต่อปีงบประมาณ แล้วเขียนทับลง hba1cVisitSummaries
// ชั่วคราว: อ่าน labResults / เขียน hba1cVisitSummaries จาก Client ตรง เพราะยังไม่อยู่แพ็กเกจ Blaze
// ตามแบบต้องผ่าน Cloud Function ที่บันทึก audit log ก่อนเสมอ (NFR-06, technology-stack.md decision area 23)

import type {GenerativeModel} from "firebase/ai";
import {addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, Timestamp, where} from "firebase/firestore";

import {createModel} from "../ai/client";
import {GEMINI_MODEL_NAME} from "../ai/config";
import {db} from "../firebase";
import {MOCK_DATA_SOURCE} from "../patients/patients";
import {buildHba1cPrompt, computeVisitStats, fiscalYearOf, type VisitStats} from "./hba1cStats";

const HBA1C = "HbA1c";

const SYSTEM_INSTRUCTION =
  "คุณเป็นผู้ช่วยสรุปสถิติการตรวจ HbA1c ของผู้ป่วยหนึ่งรายในคลินิก เขียนภาษาไทยสั้นๆ 1-3 ประโยค " +
  "จากตัวเลขที่ได้รับเท่านั้น ห้ามคำนวณใหม่ ห้ามเดาข้อมูลเพิ่ม และห้ามให้คำแนะนำทางการแพทย์ " +
  "ถ้าตรวจ 0 ครั้ง ให้บอกว่าไม่มีผลตรวจในปีงบนี้ ถ้าตรวจ 1 ครั้ง ให้บอกว่ายังไม่มีข้อมูลพอประเมินความสม่ำเสมอ";

export interface Hba1cSummary extends VisitStats {
  fiscalYear: number;
  /** null เมื่อ AI ล้มเหลว — ตัวเลขยังถูกบันทึก */
  summaryText: string | null;
}

let model: GenerativeModel | null = null;

async function writeSummaryText(stats: VisitStats, fiscalYearBe: number): Promise<string | null> {
  try {
    model ??= createModel(SYSTEM_INSTRUCTION);
    const result = await model.generateContent(buildHba1cPrompt(stats, fiscalYearBe));
    return result.response.text().trim() || null;
  } catch {
    return null;
  }
}

export async function summarizeHba1c(patientId: string, today = new Date()): Promise<Hba1cSummary> {
  const fiscalYear = fiscalYearOf(today);

  // ขั้นที่ 1 — วันที่ตรวจ HbA1c (equality ล้วน ไม่ต้องมี composite index; กรองช่วงปีงบในโค้ด)
  const snapshot = await getDocs(query(
    collection(db, "labResults"),
    where("patientId", "==", patientId),
    where("testType", "==", HBA1C),
    where("dataSource", "==", MOCK_DATA_SOURCE),
  ));
  const testDates = snapshot.docs.map((d) => (d.data().testedAt as Timestamp).toDate());

  // ขั้นที่ 2 — จำนวน visit และระยะห่าง
  const stats = computeVisitStats(testDates, fiscalYear);

  // ขั้นที่ 3 — AI เขียนสรุป แล้วเขียนทับผลเดิมของผู้ป่วย/ปีงบเดียวกัน
  const summaryText = await writeSummaryText(stats, fiscalYear.year);
  await setDoc(doc(db, "hba1cVisitSummaries", `${patientId}_${fiscalYear.year}`), {
    patientId,
    fiscalYear: fiscalYear.year,
    ...stats,
    summaryText,
    aiModel: GEMINI_MODEL_NAME,
    createdAt: serverTimestamp(),
  });
  return {fiscalYear: fiscalYear.year, ...stats, summaryText};
}

// ผล HbA1c จำลอง (NFR-01) ครอบคลุมกรณีหลายครั้ง/ครั้งเดียว/ไม่มีในปีงบ — ค่าและวันที่สมมติทั้งหมด
const MOCK_HBA1C_BY_HN: Record<string, [string, number][]> = {
  "9900001": [["2025-10-15", 7.8], ["2026-01-20", 7.4], ["2026-04-22", 7.1], ["2026-07-30", 6.9]],
  "9900002": [["2026-03-10", 8.2]],
  "9900003": [["2025-06-12", 7.0]],
  "9900004": [["2025-11-03", 6.8], ["2026-05-18", 6.6]],
  "9900005": [["2025-10-02", 9.1], ["2025-12-01", 8.5], ["2026-02-02", 8.0], ["2026-06-15", 7.6], ["2026-09-01", 7.2]],
};

/** เพิ่มผล HbA1c จำลองให้ผู้ป่วยจำลองที่ยังไม่มี — คืนจำนวนรายการที่เพิ่ม */
export async function seedMockHba1c(patients: {patientId: string; hn: string}[]): Promise<number> {
  let added = 0;
  for (const {patientId, hn} of patients) {
    const results = MOCK_HBA1C_BY_HN[hn];
    if (!results) continue;
    const existing = await getDocs(query(
      collection(db, "labResults"),
      where("patientId", "==", patientId),
      where("testType", "==", HBA1C),
      where("dataSource", "==", MOCK_DATA_SOURCE),
    ));
    if (!existing.empty) continue;
    for (const [date, value] of results) {
      await addDoc(collection(db, "labResults"), {
        patientId,
        testType: HBA1C,
        value,
        unit: "%",
        testedAt: Timestamp.fromDate(new Date(`${date}T09:00:00`)),
        dataSource: MOCK_DATA_SOURCE,
      });
      added++;
    }
  }
  return added;
}
