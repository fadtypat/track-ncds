// T-3-01 — ข้อมูลจำลอง (NFR-01) สำหรับ Operation 1 (getNcdDiagnoses)/Operation 2 (getLabResults)
// ชั่วคราว: เขียนจาก Client ตรง (addDoc) เหมือน patients.ts/hba1cSummary.ts เพราะยังไม่อยู่แพ็กเกจ Blaze
// ข้อมูลทั้งหมดเป็นข้อมูลสมมติ (nameสมมติ/HN สมมติ/ค่าผลตรวจสมมติ) ไม่ใช่ผู้ป่วยจริง

import {addDoc, collection, getDocs, query, Timestamp, where} from "firebase/firestore";

import {db} from "../firebase";
import {MOCK_DATA_SOURCE} from "../patients/patients";

/** เอกสารดิบก่อนแปลงเป็น Firestore Timestamp — ใช้ทดสอบ generator แบบ pure ได้โดยไม่แตะ Firestore */
export interface MockDiagnosisDoc {
  patientId: string;
  icd10Code: string;
  diseaseGroup: string;
  diagnosedAt: Date;
  note?: string;
  dataSource: string;
}

export interface MockLabResultDoc {
  patientId: string;
  testType: string;
  value: number;
  unit: string;
  testedAt: Date;
  dataSource: string;
}

export interface MockHistory {
  diagnoses: MockDiagnosisDoc[];
  labResults: MockLabResultDoc[];
}

// รหัส ICD-10 ในขอบเขต (เบาหวาน E10–E14, ความดันโลหิตสูง I10–I14, ถุงลมโป่งพอง J44) + 1 นอกขอบเขตเพื่อทดสอบตัวกรอง
const IN_SCOPE_DIAGNOSES: {icd10Code: string; diseaseGroup: string; note?: string}[] = [
  {icd10Code: "E11.9", diseaseGroup: "เบาหวาน", note: "เบาหวานชนิดที่ 2 ควบคุมได้ปานกลาง"},
  {icd10Code: "I10", diseaseGroup: "ความดันโลหิตสูง"},
  {icd10Code: "J44.1", diseaseGroup: "ถุงลมโป่งพอง", note: "มีอาการกำเริบเฉียบพลัน"},
];
const OUT_OF_SCOPE_DIAGNOSIS = {icd10Code: "K21.9", diseaseGroup: "อื่นๆ (นอกขอบเขต)"};

interface LabTypeSpec {
  testType: string;
  unit: string;
  normal: number;
  abnormal: number;
}

// ค่าปกติ/ผิดปกติโดยประมาณต่อชนิดผลตรวจ (ข้อมูลสมมติทั้งหมด NFR-01)
const LAB_TYPES: LabTypeSpec[] = [
  {testType: "HbA1c", unit: "%", normal: 6.5, abnormal: 9.2},
  {testType: "eGFR", unit: "mL/min/1.73m²", normal: 92, abnormal: 48},
  {testType: "LDL", unit: "mg/dL", normal: 95, abnormal: 165},
  {testType: "ความดันโลหิตซิสโตลิก", unit: "mmHg", normal: 122, abnormal: 152},
  {testType: "ความดันโลหิตไดแอสโตลิก", unit: "mmHg", normal: 78, abnormal: 96},
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * MS_PER_DAY);
}

/**
 * Generator ล้วน (ไม่แตะ Firestore) — deterministic ต่อ patientId/index ของผู้ป่วยในรายการ (seededIndex)
 * เพื่อให้ผลลัพธ์เดิมทุกครั้งที่รันด้วย input เดียวกัน (ไม่ใช้ Math.random)
 */
export function buildMockHistory(
  patients: {id: string; hn: string}[],
  today: Date,
): MockHistory {
  const diagnoses: MockDiagnosisDoc[] = [];
  const labResults: MockLabResultDoc[] = [];

  patients.forEach((patient, seededIndex) => {
    // 1–3 การวินิจฉัยในขอบเขตต่อผู้ป่วย (วนตามลำดับผู้ป่วยให้กระจายจำนวน) + นอกขอบเขตทุกๆ ผู้ป่วยรายที่ 3
    const diagnosisCount = (seededIndex % 3) + 1;
    for (let i = 0; i < diagnosisCount; i++) {
      const spec = IN_SCOPE_DIAGNOSES[i % IN_SCOPE_DIAGNOSES.length];
      diagnoses.push({
        patientId: patient.id,
        icd10Code: spec.icd10Code,
        diseaseGroup: spec.diseaseGroup,
        // กระจายวันที่วินิจฉัยย้อนหลังไม่เกิน ~2 ปี ไม่ให้ผู้ป่วยทุกรายมีวันเดียวกัน
        diagnosedAt: addDays(today, -(30 + seededIndex * 17 + i * 90)),
        ...(spec.note ? {note: spec.note} : {}),
        dataSource: MOCK_DATA_SOURCE,
      });
    }
    if (seededIndex % 3 === 2) {
      diagnoses.push({
        patientId: patient.id,
        icd10Code: OUT_OF_SCOPE_DIAGNOSIS.icd10Code,
        diseaseGroup: OUT_OF_SCOPE_DIAGNOSIS.diseaseGroup,
        diagnosedAt: addDays(today, -200),
        dataSource: MOCK_DATA_SOURCE,
      });
    }

    // ~2 ปีของผลตรวจ lab ทุก 3-4 เดือนต่อชนิดผลตรวจมาตรฐานทั้งหมด บางครั้งค่าผิดปกติ
    for (const spec of LAB_TYPES) {
      const intervalDays = 90 + (seededIndex % 2 === 0 ? 0 : 30); // สลับ 3/4 เดือนต่อผู้ป่วย
      const visitCount = Math.floor(730 / intervalDays);
      for (let visit = 0; visit < visitCount; visit++) {
        const daysAgo = visit * intervalDays + (seededIndex * 5);
        // ทำให้ผลตรวจครั้งล่าสุด (visit=0) ของผู้ป่วยบางรายเป็นค่าผิดปกติ เพื่อครอบคลุม case ผิดปกติ
        const isAbnormal = visit === 0 && seededIndex % 2 === 0;
        const value = isAbnormal ? spec.abnormal : spec.normal + (visit % 3) * 0.4;
        labResults.push({
          patientId: patient.id,
          testType: spec.testType,
          value: Math.round(value * 10) / 10,
          unit: spec.unit,
          testedAt: addDays(today, -daysAgo),
          dataSource: MOCK_DATA_SOURCE,
        });
      }
    }
  });

  return {diagnoses, labResults};
}

/**
 * เพิ่มประวัติวินิจฉัย/ผลตรวจ lab จำลองให้ผู้ป่วยจำลองทุกรายที่ยังไม่มีข้อมูล (idempotent ต่อผู้ป่วย —
 * ตรวจจากการมี ncdDiagnoses อย่างน้อย 1 รายการ) คืนจำนวนเอกสารที่เพิ่มจริง
 */
export async function seedMockHistory(): Promise<{diagnoses: number; labResults: number}> {
  const {listPatients} = await import("../patients/patients");
  const patients = await listPatients();

  const patientsNeedingSeed: {id: string; hn: string}[] = [];
  for (const patient of patients) {
    const existing = await getDocs(
      query(collection(db, "ncdDiagnoses"), where("patientId", "==", patient.patientId)),
    );
    if (existing.empty) patientsNeedingSeed.push({id: patient.patientId, hn: patient.hn});
  }

  const {diagnoses, labResults} = buildMockHistory(patientsNeedingSeed, new Date());

  for (const doc of diagnoses) {
    await addDoc(collection(db, "ncdDiagnoses"), {
      ...doc,
      diagnosedAt: Timestamp.fromDate(doc.diagnosedAt),
    });
  }
  for (const doc of labResults) {
    await addDoc(collection(db, "labResults"), {
      ...doc,
      testedAt: Timestamp.fromDate(doc.testedAt),
    });
  }

  return {diagnoses: diagnoses.length, labResults: labResults.length};
}
