// Contract ของ Operation 1 (getNcdDiagnoses) และ Operation 2 (getLabResults) — api-spec.md
// ต้องตรงกับ functions/src/patients/historyTypes.ts (ชื่อ field ตาม db-spec.md "Field mapping")

import {MOCK_DATA_SOURCE} from "../patients/patients";

export {MOCK_DATA_SOURCE};

/** กลุ่มโรคหลักในขอบเขต spec: เบาหวาน E10–E14, ความดันโลหิตสูง I10–I14, ถุงลมโป่งพอง J44 */
export type DiseaseGroup = "เบาหวาน" | "ความดันโลหิตสูง" | "ถุงลมโป่งพอง";

/** ชนิดผลตรวจ lab มาตรฐานที่แสดงได้ (db-spec LabResult.testType) */
export const STANDARD_LAB_TYPES = [
  "HbA1c",
  "eGFR",
  "LDL",
  "ความดันโลหิตซิสโตลิก",
  "ความดันโลหิตไดแอสโตลิก",
] as const;
export type LabTestType = (typeof STANDARD_LAB_TYPES)[number];

export interface GetNcdDiagnosesRequest {
  patientId: string;
}

export interface GetLabResultsRequest {
  patientId: string;
  /** ISO 8601 (YYYY-MM-DD หรือ date-time) — ไม่บังคับ */
  dateStart?: string;
  dateEnd?: string;
}

/** วันที่ส่งกลับเป็น ISO 8601 string เพราะ callable serialize เป็น JSON */
export interface NcdDiagnosisDto {
  id: string;
  icd10Code: string;
  diseaseGroup: DiseaseGroup;
  diagnosedAt: string;
  note?: string;
  dataSource: string;
}

export interface LabResultDto {
  id: string;
  testType: LabTestType;
  value: number;
  unit: string;
  testedAt: string;
  dataSource: string;
}

/** เรียงจากใหม่ไปเก่า (diagnosedAt DESC) */
export interface GetNcdDiagnosesResponse {
  diagnoses: NcdDiagnosisDto[];
}

/** เรียงจากใหม่ไปเก่า (testedAt DESC) */
export interface GetLabResultsResponse {
  labResults: LabResultDto[];
}

