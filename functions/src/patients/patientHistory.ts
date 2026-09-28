// Operation 1 (getNcdDiagnoses) และ Operation 2 (getLabResults) — api-spec.md
// Logic ล้วน (pure) ตาม DI pattern เดียวกับ auth/signUp.ts — ผูกกับ Admin SDK จริงใน index.ts

import {AccessCheckResult, CallerAuth, CallerUserDoc, checkPatientAccess} from "./accessControl.js";
import {AuditLogWriter} from "./auditLog.js";
import {
  DiseaseGroup,
  GetLabResultsResponse,
  GetNcdDiagnosesResponse,
  LabResultDto,
  LabTestType,
  MOCK_DATA_SOURCE,
  NcdDiagnosisDto,
  STANDARD_LAB_TYPES,
} from "./historyTypes.js";
import {
  INVALID_DATE_RANGE,
  INVALID_PATIENT_ID,
  PATIENT_NOT_FOUND,
  PERMISSION_DENIED,
  TEMPORARILY_UNAVAILABLE,
} from "./messages.js";

export type OperationErrorCode = "permission-denied" | "not-found" | "invalid-argument" | "internal";

export type OperationResult<T> =
  | {ok: true; data: T}
  | {ok: false; code: OperationErrorCode; message: string};

export interface PatientDoc {
  dataSource?: unknown;
}

/** ผู้ป่วยรายที่ถูกอ่าน — ใช้ร่วมกันโดยทั้งสอง operation */
interface CommonDeps extends AuditLogWriter {
  getCallerUser(uid: string): Promise<CallerUserDoc | undefined>;
  getPatient(patientId: string): Promise<PatientDoc | undefined>;
  logError(message: string, error: unknown): void;
}

/** เอกสารดิบก่อนกรอง/แปลง — วันที่เป็น Date เพราะ index.ts แปลงจาก Firestore Timestamp มาให้แล้ว */
export interface RawNcdDiagnosis {
  id: string;
  icd10Code: string;
  diagnosedAt: Date;
  note?: string;
  dataSource: string;
}

export interface RawLabResult {
  id: string;
  testType: string;
  value: number;
  unit: string;
  testedAt: Date;
  dataSource: string;
}

export interface NcdDiagnosesDeps extends CommonDeps {
  /** query ncdDiagnoses where patientId==X orderBy diagnosedAt desc */
  queryNcdDiagnoses(patientId: string): Promise<RawNcdDiagnosis[]>;
}

export interface LabResultsDeps extends CommonDeps {
  /** query labResults where patientId==X [testedAt range] orderBy testedAt desc */
  queryLabResults(patientId: string, range: {start?: Date; end?: Date}): Promise<RawLabResult[]>;
}

const PATIENT_ID_TOO_LONG = 200; // กันค่าผิดปกติหลุดเข้า Firestore query โดยไม่มีเหตุผล

function normalizePatientId(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const patientId = input.trim();
  if (!patientId || patientId.length > PATIENT_ID_TOO_LONG) return undefined;
  return patientId;
}

async function checkAccessOrDeny<T>(
  auth: CallerAuth | undefined,
  deps: CommonDeps,
): Promise<{access: AccessCheckResult & {ok: true}} | {result: OperationResult<T>}> {
  const userDoc = auth ? await deps.getCallerUser(auth.uid) : undefined;
  const access = checkPatientAccess(auth, userDoc);
  if (!access.ok) {
    return {result: {ok: false, code: "permission-denied", message: PERMISSION_DENIED}};
  }
  return {access};
}

async function loadMockPatientOrDeny<T>(
  patientId: string,
  deps: CommonDeps,
): Promise<{patient: PatientDoc} | {result: OperationResult<T>}> {
  const patient = await deps.getPatient(patientId);
  if (!patient || patient.dataSource !== MOCK_DATA_SOURCE) {
    return {result: {ok: false, code: "not-found", message: PATIENT_NOT_FOUND}};
  }
  return {patient};
}

async function writeAuditLogOrFail<T>(
  userId: string,
  patientId: string,
  isAdminAccess: boolean,
  deps: CommonDeps,
  logLabel: string,
): Promise<{ok: true} | {result: OperationResult<T>}> {
  try {
    await deps.writeAuditLog({userId, patientId, isAdminAccess});
    return {ok: true};
  } catch (error) {
    // Fail-safe (NFR-06) — บันทึกไม่สำเร็จต้องไม่อ่าน/ไม่คืนข้อมูลผู้ป่วยต่อ
    deps.logError(`${logLabel}: audit log write failed`, error);
    return {result: {ok: false, code: "internal", message: TEMPORARILY_UNAVAILABLE}};
  }
}

/** กลุ่มโรคหลักในขอบเขต spec ต่อ prefix รหัส ICD-10 (เบาหวาน E10–E14, ความดันโลหิตสูง I10–I14, ถุงลมโป่งพอง J44) */
const DISEASE_GROUP_PREFIXES: readonly [readonly string[], DiseaseGroup][] = [
  [["E10", "E11", "E12", "E13", "E14"], "เบาหวาน"],
  [["I10", "I11", "I12", "I13", "I14"], "ความดันโลหิตสูง"],
  [["J44"], "ถุงลมโป่งพอง"],
];

function diseaseGroupOf(icd10Code: string): DiseaseGroup | undefined {
  const code = icd10Code.trim().toUpperCase();
  for (const [prefixes, group] of DISEASE_GROUP_PREFIXES) {
    if (prefixes.some((prefix) => code.startsWith(prefix))) return group;
  }
  return undefined;
}

function toNcdDiagnosisDto(raw: RawNcdDiagnosis, diseaseGroup: DiseaseGroup): NcdDiagnosisDto {
  return {
    id: raw.id,
    icd10Code: raw.icd10Code,
    diseaseGroup,
    diagnosedAt: raw.diagnosedAt.toISOString(),
    ...(raw.note !== undefined ? {note: raw.note} : {}),
    dataSource: raw.dataSource,
  };
}

export async function getNcdDiagnoses(
  input: {patientId?: unknown},
  auth: CallerAuth | undefined,
  deps: NcdDiagnosesDeps,
): Promise<OperationResult<GetNcdDiagnosesResponse>> {
  const accessOutcome = await checkAccessOrDeny<GetNcdDiagnosesResponse>(auth, deps);
  if ("result" in accessOutcome) return accessOutcome.result;
  const {access} = accessOutcome;

  const patientId = normalizePatientId(input.patientId);
  if (!patientId) return {ok: false, code: "invalid-argument", message: INVALID_PATIENT_ID};

  const patientOutcome = await loadMockPatientOrDeny<GetNcdDiagnosesResponse>(patientId, deps);
  if ("result" in patientOutcome) return patientOutcome.result;

  const auditOutcome = await writeAuditLogOrFail<GetNcdDiagnosesResponse>(
    (auth as CallerAuth).uid,
    patientId,
    access.isAdmin,
    deps,
    "getNcdDiagnoses",
  );
  if ("result" in auditOutcome) return auditOutcome.result;

  let raw: RawNcdDiagnosis[];
  try {
    raw = await deps.queryNcdDiagnoses(patientId);
  } catch (error) {
    deps.logError("getNcdDiagnoses: query failed", error);
    return {ok: false, code: "internal", message: TEMPORARILY_UNAVAILABLE};
  }

  const diagnoses = raw
    .filter((d) => d.dataSource === MOCK_DATA_SOURCE)
    .map((d): [RawNcdDiagnosis, DiseaseGroup | undefined] => [d, diseaseGroupOf(d.icd10Code)])
    .filter((pair): pair is [RawNcdDiagnosis, DiseaseGroup] => pair[1] !== undefined)
    .map(([d, group]) => toNcdDiagnosisDto(d, group))
    .sort((a, b) => b.diagnosedAt.localeCompare(a.diagnosedAt));

  return {ok: true, data: {diagnoses}};
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseBoundaryDate(value: string, boundary: "start" | "end"): Date | undefined {
  // วันที่ล้วน (ไม่มีเวลา) ต้องตีความเป็น UTC เสมอ (ไม่พึ่ง timezone ของเครื่องที่รัน Function)
  const isDateOnly = DATE_ONLY.test(value);
  const parsed = new Date(
    isDateOnly ? `${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z` : value,
  );
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

interface ParsedDateRange {
  start?: Date;
  end?: Date;
}

function parseDateRange(input: {dateStart?: unknown; dateEnd?: unknown}): ParsedDateRange | undefined {
  const range: ParsedDateRange = {};
  if (input.dateStart !== undefined) {
    if (typeof input.dateStart !== "string" || input.dateStart.trim() === "") return undefined;
    const start = parseBoundaryDate(input.dateStart.trim(), "start");
    if (!start) return undefined;
    range.start = start;
  }
  if (input.dateEnd !== undefined) {
    if (typeof input.dateEnd !== "string" || input.dateEnd.trim() === "") return undefined;
    const end = parseBoundaryDate(input.dateEnd.trim(), "end");
    if (!end) return undefined;
    range.end = end;
  }
  if (range.start && range.end && range.start.getTime() > range.end.getTime()) return undefined;
  return range;
}

function isStandardLabType(testType: string): testType is LabTestType {
  return (STANDARD_LAB_TYPES as readonly string[]).includes(testType);
}

function toLabResultDto(raw: RawLabResult & {testType: LabTestType}): LabResultDto {
  return {
    id: raw.id,
    testType: raw.testType,
    value: raw.value,
    unit: raw.unit,
    testedAt: raw.testedAt.toISOString(),
    dataSource: raw.dataSource,
  };
}

export async function getLabResults(
  input: {patientId?: unknown; dateStart?: unknown; dateEnd?: unknown},
  auth: CallerAuth | undefined,
  deps: LabResultsDeps,
): Promise<OperationResult<GetLabResultsResponse>> {
  const accessOutcome = await checkAccessOrDeny<GetLabResultsResponse>(auth, deps);
  if ("result" in accessOutcome) return accessOutcome.result;
  const {access} = accessOutcome;

  const patientId = normalizePatientId(input.patientId);
  if (!patientId) return {ok: false, code: "invalid-argument", message: INVALID_PATIENT_ID};

  // ต้องตรวจก่อนบันทึก audit log/อ่านข้อมูลใดๆ
  const range = parseDateRange(input);
  if (!range) return {ok: false, code: "invalid-argument", message: INVALID_DATE_RANGE};

  const patientOutcome = await loadMockPatientOrDeny<GetLabResultsResponse>(patientId, deps);
  if ("result" in patientOutcome) return patientOutcome.result;

  const auditOutcome = await writeAuditLogOrFail<GetLabResultsResponse>(
    (auth as CallerAuth).uid,
    patientId,
    access.isAdmin,
    deps,
    "getLabResults",
  );
  if ("result" in auditOutcome) return auditOutcome.result;

  let raw: RawLabResult[];
  try {
    raw = await deps.queryLabResults(patientId, range);
  } catch (error) {
    deps.logError("getLabResults: query failed", error);
    return {ok: false, code: "internal", message: TEMPORARILY_UNAVAILABLE};
  }

  const labResults = raw
    .filter((r) => r.dataSource === MOCK_DATA_SOURCE)
    .filter((r): r is RawLabResult & {testType: LabTestType} => isStandardLabType(r.testType))
    .filter((r) => (!range.start || r.testedAt.getTime() >= range.start.getTime()))
    .filter((r) => (!range.end || r.testedAt.getTime() <= range.end.getTime()))
    .map(toLabResultDto)
    .sort((a, b) => b.testedAt.localeCompare(a.testedAt));

  return {ok: true, data: {labResults}};
}
