// ฟังก์ชัน pure ล้วน (ไม่แตะ Firestore) แยกมาให้ unit test ได้ตรงๆ — ใช้โดย historyApi.ts (clientHistorySource)
// เพื่อจำลองกฎเดียวกับที่ Cloud Function (getNcdDiagnoses/getLabResults) จะบังคับใช้ตาม api-spec.md

import {STANDARD_LAB_TYPES, type LabResultDto, type LabTestType, type NcdDiagnosisDto} from "./historyTypes";

// ขอบเขต ICD-10 ตาม spec (20260917-01, FR-01): เบาหวาน E10–E14, ความดันโลหิตสูง I10–I14, ถุงลมโป่งพอง J44
const ICD10_PREFIX_RANGES: {letter: string; from: number; to: number}[] = [
  {letter: "E", from: 10, to: 14},
  {letter: "I", from: 10, to: 14},
];
const ICD10_EXACT_PREFIXES = ["J44"];

/** true เมื่อรหัส ICD-10 อยู่ในขอบเขต (เช่น "E11.9" ผ่าน, "E15"/"K21.9" ไม่ผ่าน) */
export function isIcd10InScope(icd10Code: string): boolean {
  const code = icd10Code.trim().toUpperCase();
  if (ICD10_EXACT_PREFIXES.some((prefix) => code.startsWith(prefix))) return true;
  const match = /^([A-Z])(\d{2})/.exec(code);
  if (!match) return false;
  const [, letter, digits] = match;
  const num = Number(digits);
  return ICD10_PREFIX_RANGES.some((range) => range.letter === letter && num >= range.from && num <= range.to);
}

export function isStandardLabType(testType: string): testType is LabTestType {
  return (STANDARD_LAB_TYPES as readonly string[]).includes(testType);
}

/** เรียงใหม่→เก่าตาม diagnosedAt (api-spec: GetNcdDiagnosesResponse เรียงจากใหม่ไปเก่า) */
export function sortDiagnosesNewestFirst(diagnoses: NcdDiagnosisDto[]): NcdDiagnosisDto[] {
  return [...diagnoses].sort((a, b) => b.diagnosedAt.localeCompare(a.diagnosedAt));
}

/** เรียงใหม่→เก่าตาม testedAt (api-spec: GetLabResultsResponse เรียงจากใหม่ไปเก่า) */
export function sortLabResultsNewestFirst(labResults: LabResultDto[]): LabResultDto[] {
  return [...labResults].sort((a, b) => b.testedAt.localeCompare(a.testedAt));
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** วันที่เดียว (YYYY-MM-DD) ตีความเป็นต้นวัน (00:00:00.000) ของ dateStart */
function parseAsRangeStart(input: string): Date | null {
  const date = DATE_ONLY_PATTERN.test(input) ? new Date(`${input}T00:00:00.000`) : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** วันที่เดียว (YYYY-MM-DD) ตีความเป็นปลายวัน (23:59:59.999) ของ dateEnd แบบ inclusive */
function parseAsRangeEnd(input: string): Date | null {
  const date = DATE_ONLY_PATTERN.test(input) ? new Date(`${input}T23:59:59.999`) : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type DateRangeValidation =
  | {valid: true; start: Date | null; end: Date | null}
  | {valid: false};

/**
 * ตรวจช่วงเวลาก่อนอ่านข้อมูลใดๆ เสมอ (TC-01-06): วันที่แปลงไม่ได้ หรือ start > end → invalid
 * ไม่ระบุ dateStart/dateEnd เลย = ไม่กรองช่วงเวลา (valid เสมอ)
 */
export function validateDateRange(dateStart?: string, dateEnd?: string): DateRangeValidation {
  const start = dateStart ? parseAsRangeStart(dateStart) : null;
  const end = dateEnd ? parseAsRangeEnd(dateEnd) : null;
  if (dateStart && !start) return {valid: false};
  if (dateEnd && !end) return {valid: false};
  if (start && end && start.getTime() > end.getTime()) return {valid: false};
  return {valid: true, start, end};
}

/** กรองเฉพาะ testType มาตรฐาน + อยู่ในช่วงเวลา (start/end เป็น null แปลว่าไม่จำกัดด้านนั้น) */
export function filterLabResultsInRange(
  labResults: LabResultDto[],
  range: {start: Date | null; end: Date | null},
): LabResultDto[] {
  return labResults.filter((result) => {
    if (!isStandardLabType(result.testType)) return false;
    const testedAt = new Date(result.testedAt).getTime();
    if (range.start && testedAt < range.start.getTime()) return false;
    if (range.end && testedAt > range.end.getTime()) return false;
    return true;
  });
}

export function filterDiagnosesInScope(diagnoses: NcdDiagnosisDto[]): NcdDiagnosisDto[] {
  return diagnoses.filter((d) => isIcd10InScope(d.icd10Code));
}
