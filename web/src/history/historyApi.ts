// Operation 1 (getNcdDiagnoses) / Operation 2 (getLabResults) — api-spec.md
//
// callableHistorySource คือ target design จริง (httpsCallable ผ่าน Cloud Functions ที่บันทึก audit
// log ก่อนเสมอ ตาม NFR-06) แต่ยัง deploy ไม่ได้เพราะโปรเจกต์ยังไม่อยู่แพ็กเกจ Blaze
//
// clientHistorySource เป็นทางเลือกชั่วคราวเท่านั้น (รูปแบบเดียวกับ web/src/admin/accountApproval.ts
// และ web/src/labs/hba1cSummary.ts): อ่าน Firestore ตรงจาก Client ไม่มี audit log ใดๆ — ขัดกับ NFR-06
// จนกว่าจะ deploy Cloud Functions ได้ ต้องจำลองกฎเดียวกับที่ Cloud Function จะบังคับใช้เอง (ดู
// historyFilters.ts): ตรวจว่าผู้ป่วยมีอยู่จริงและเป็นข้อมูลจำลองก่อนเสมอ, จำกัดเฉพาะ ICD-10/testType
// ในขอบเขต, ตรวจช่วงเวลาก่อนอ่านข้อมูลใดๆ

import {collection, getDocs, query, Timestamp, where, type QueryDocumentSnapshot} from "firebase/firestore";
import {httpsCallable} from "firebase/functions";

import {db, functions} from "../firebase";
import {getPatientById, MOCK_DATA_SOURCE} from "../patients/patients";
import {HistoryError, normalizeHistoryError} from "./historyErrors";
import {filterDiagnosesInScope, filterLabResultsInRange, sortDiagnosesNewestFirst, sortLabResultsNewestFirst, validateDateRange} from "./historyFilters";
import type {
  GetLabResultsRequest,
  GetLabResultsResponse,
  GetNcdDiagnosesRequest,
  GetNcdDiagnosesResponse,
  LabResultDto,
  NcdDiagnosisDto,
} from "./historyTypes";

export interface HistorySource {
  getNcdDiagnoses(req: GetNcdDiagnosesRequest): Promise<GetNcdDiagnosesResponse>;
  getLabResults(req: GetLabResultsRequest): Promise<GetLabResultsResponse>;
}

// ===== Target design (Operation 1/2 ผ่าน Cloud Functions) =====

const callGetNcdDiagnoses = httpsCallable<GetNcdDiagnosesRequest, GetNcdDiagnosesResponse>(functions, "getNcdDiagnoses");
const callGetLabResults = httpsCallable<GetLabResultsRequest, GetLabResultsResponse>(functions, "getLabResults");

export const callableHistorySource: HistorySource = {
  async getNcdDiagnoses(req) {
    try {
      return (await callGetNcdDiagnoses(req)).data;
    } catch (error) {
      throw normalizeHistoryError(error);
    }
  },
  async getLabResults({patientId, dateStart, dateEnd}) {
    // แปลงวันที่ล้วนเป็นเวลาต้นวัน/ท้ายวันตามเวลาท้องถิ่นของผู้ใช้ก่อนส่ง — Function ตีความวันที่ล้วนเป็น UTC
    const range = validateDateRange(dateStart, dateEnd);
    if (!range.valid) throw new HistoryError("invalid-argument");
    try {
      return (await callGetLabResults({
        patientId,
        dateStart: range.start?.toISOString(),
        dateEnd: range.end?.toISOString(),
      })).data;
    } catch (error) {
      throw normalizeHistoryError(error);
    }
  },
};

// ===== ชั่วคราว: Client อ่าน Firestore ตรง =====

async function assertMockPatientExists(patientId: string): Promise<void> {
  const patient = await getPatientById(patientId);
  if (!patient) throw new HistoryError("not-found");
}

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date(String(value)).toISOString();
}

function toDiagnosisDto(d: QueryDocumentSnapshot): NcdDiagnosisDto {
  const data = d.data();
  return {
    id: d.id,
    icd10Code: String(data.icd10Code),
    diseaseGroup: data.diseaseGroup,
    diagnosedAt: toIsoString(data.diagnosedAt),
    note: data.note ? String(data.note) : undefined,
    dataSource: String(data.dataSource),
  };
}

function toLabResultDto(d: QueryDocumentSnapshot): LabResultDto {
  const data = d.data();
  return {
    id: d.id,
    testType: data.testType,
    value: Number(data.value),
    unit: String(data.unit),
    testedAt: toIsoString(data.testedAt),
    dataSource: String(data.dataSource),
  };
}

export const clientHistorySource: HistorySource = {
  async getNcdDiagnoses({patientId}) {
    try {
      await assertMockPatientExists(patientId);
      // query patientId ล้วน (equality) ไม่ต้องมี composite index — กรองขอบเขต ICD-10/dataSource/เรียงในโค้ด
      const snapshot = await getDocs(query(collection(db, "ncdDiagnoses"), where("patientId", "==", patientId)));
      const diagnoses = snapshot.docs
        .map(toDiagnosisDto)
        .filter((d) => d.dataSource === MOCK_DATA_SOURCE);
      return {diagnoses: sortDiagnosesNewestFirst(filterDiagnosesInScope(diagnoses))};
    } catch (error) {
      throw normalizeHistoryError(error);
    }
  },

  async getLabResults({patientId, dateStart, dateEnd}) {
    // ตรวจช่วงเวลาก่อนอ่านข้อมูลใดๆ เสมอ (TC-01-06)
    const range = validateDateRange(dateStart, dateEnd);
    if (!range.valid) throw new HistoryError("invalid-argument");
    try {
      await assertMockPatientExists(patientId);
      const snapshot = await getDocs(query(collection(db, "labResults"), where("patientId", "==", patientId)));
      const labResults = snapshot.docs
        .map(toLabResultDto)
        .filter((r) => r.dataSource === MOCK_DATA_SOURCE);
      return {labResults: sortLabResultsNewestFirst(filterLabResultsInRange(labResults, range))};
    } catch (error) {
      throw normalizeHistoryError(error);
    }
  },
};

// VITE_USE_HISTORY_CALLABLE=true ใช้ callable จริง (target design) — ค่าเริ่มต้น (false/ไม่ตั้ง) ใช้
// clientHistorySource ชั่วคราวเพราะยังไม่อยู่แพ็กเกจ Blaze
export const historySource: HistorySource =
  import.meta.env.VITE_USE_HISTORY_CALLABLE === "true" ? callableHistorySource : clientHistorySource;
