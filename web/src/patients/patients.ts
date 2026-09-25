// Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วย (FR-05, FR-06)
// ตั้งแต่ 2026-09-25 ทุกบทบาท (แพทย์/พยาบาล/admin) เห็นผู้ป่วยทุกราย ไม่ใช้ PatientAssignment แล้ว (ดู ACL.md)
// แสดงเฉพาะ dataSource = "ข้อมูลจำลอง" (NFR-01) เพราะ collection patients อาจยังมีข้อมูลจาก Firestore demo
// ที่สร้างจาก dump ของ HOSxP — query แบบ equality ล้วนจึงไม่ต้องมี composite index

import {addDoc, collection, getDocs, query, where, type QueryDocumentSnapshot} from "firebase/firestore";

import {db} from "../firebase";

export const MOCK_DATA_SOURCE = "ข้อมูลจำลอง";

export interface Patient {
  patientId: string;
  hn: string;
  fullName: string;
}

// HN ต้องเป็นตัวเลขล้วน 7 หลัก — ตรวจหลังกดค้นหาเท่านั้น ไม่ตรวจระหว่างพิมพ์ (FR-06)
const HN_PATTERN = /^\d{7}$/;

export function isValidHn(input: string): boolean {
  return HN_PATTERN.test(input);
}

export type HnSearchResult =
  | {status: "invalid-hn"}
  | {status: "not-found"}
  | {status: "found"; patients: Patient[]};

function toPatient(d: QueryDocumentSnapshot): Patient {
  const data = d.data();
  return {patientId: d.id, hn: String(data.hn), fullName: String(data.fullName)};
}

const mockPatients = () => collection(db, "patients");

export async function listPatients(): Promise<Patient[]> {
  const snapshot = await getDocs(query(mockPatients(), where("dataSource", "==", MOCK_DATA_SOURCE)));
  return snapshot.docs.map(toPatient).sort((a, b) => a.fullName.localeCompare(b.fullName, "th"));
}

export async function searchPatientByHn(input: string): Promise<HnSearchResult> {
  const hn = input.trim();
  if (!isValidHn(hn)) return {status: "invalid-hn"};
  const snapshot = await getDocs(
    query(mockPatients(), where("dataSource", "==", MOCK_DATA_SOURCE), where("hn", "==", hn)),
  );
  if (snapshot.empty) return {status: "not-found"};
  return {status: "found", patients: snapshot.docs.map(toPatient)};
}

// ผู้ป่วยจำลองสำหรับทดสอบ (NFR-01) — ชื่อ/HN สมมติทั้งหมด ไม่ได้มาจากข้อมูลจริง
const MOCK_PATIENTS = [
  {hn: "9900001", fullName: "นายทดสอบ หนึ่ง"},
  {hn: "9900002", fullName: "นางทดสอบ สอง"},
  {hn: "9900003", fullName: "นายทดสอบ สาม"},
  {hn: "9900004", fullName: "นางสาวทดสอบ สี่"},
  {hn: "9900005", fullName: "นายทดสอบ ห้า"},
];

/** เพิ่มผู้ป่วยจำลองที่ยังไม่มี (ตรวจจาก HN) — คืนจำนวนที่เพิ่มจริง */
export async function seedMockPatients(): Promise<number> {
  const existing = new Set((await listPatients()).map((p) => p.hn));
  const missing = MOCK_PATIENTS.filter((p) => !existing.has(p.hn));
  for (const patient of missing) {
    await addDoc(mockPatients(), {...patient, dataSource: MOCK_DATA_SOURCE});
  }
  return missing.length;
}
