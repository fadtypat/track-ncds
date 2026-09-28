import {describe, expect, it, vi} from "vitest";

// historyTypes.ts re-export MOCK_DATA_SOURCE จาก patients.ts ซึ่งต่อ Firebase จริง — mock กันไว้ (ไม่ต่อ Firebase จริงในเทสต์นี้)
vi.mock("../firebase", () => ({db: {}}));

import {
  filterDiagnosesInScope,
  filterLabResultsInRange,
  isIcd10InScope,
  isStandardLabType,
  sortDiagnosesNewestFirst,
  sortLabResultsNewestFirst,
  validateDateRange,
} from "./historyFilters";
import type {LabResultDto, NcdDiagnosisDto} from "./historyTypes";

const diagnosis = (id: string, icd10Code: string): NcdDiagnosisDto => ({
  id, icd10Code, diseaseGroup: "เบาหวาน", diagnosedAt: "2026-01-01T00:00:00.000Z", dataSource: "ข้อมูลจำลอง",
});

const lab = (id: string, testType: string, testedAt: string, value = 1): LabResultDto => ({
  id, testType: testType as LabResultDto["testType"], value, unit: "%", testedAt, dataSource: "ข้อมูลจำลอง",
});

describe("isIcd10InScope (FR-01 ขอบเขต ICD-10: E10–E14, I10–I14, J44)", () => {
  it.each([
    ["E11.9", true],
    ["E10", true],
    ["E14.9", true],
    ["I10", true],
    ["I13.2", true],
    ["J44", true],
    ["J44.1", true],
  ])("%s อยู่ในขอบเขต", (code, expected) => {
    expect(isIcd10InScope(code)).toBe(expected);
  });

  it.each([
    ["E15", false],
    ["E09", false],
    ["I15", false],
    ["K21.9", false],
    ["J45", false],
    ["", false],
  ])("%s ไม่อยู่ในขอบเขต", (code, expected) => {
    expect(isIcd10InScope(code)).toBe(expected);
  });
});

describe("filterDiagnosesInScope (TC-01-01)", () => {
  it("ตัดรายการที่นอกขอบเขต ICD-10 ออก", () => {
    const result = filterDiagnosesInScope([diagnosis("1", "E11.9"), diagnosis("2", "K21.9"), diagnosis("3", "I10")]);
    expect(result.map((d) => d.id)).toEqual(["1", "3"]);
  });
});

describe("isStandardLabType", () => {
  it.each(["HbA1c", "eGFR", "LDL", "ความดันโลหิตซิสโตลิก", "ความดันโลหิตไดแอสโตลิก"])("%s เป็นชนิดมาตรฐาน", (t) => {
    expect(isStandardLabType(t)).toBe(true);
  });

  it("ชนิดอื่นไม่ใช่ชนิดมาตรฐาน", () => {
    expect(isStandardLabType("FBS")).toBe(false);
  });
});

describe("sortDiagnosesNewestFirst / sortLabResultsNewestFirst", () => {
  it("เรียงประวัติวินิจฉัยใหม่→เก่า", () => {
    const result = sortDiagnosesNewestFirst([
      {...diagnosis("old", "E11"), diagnosedAt: "2025-01-01T00:00:00.000Z"},
      {...diagnosis("new", "E11"), diagnosedAt: "2026-01-01T00:00:00.000Z"},
    ]);
    expect(result.map((d) => d.id)).toEqual(["new", "old"]);
  });

  it("เรียงผล lab ใหม่→เก่า", () => {
    const result = sortLabResultsNewestFirst([lab("old", "HbA1c", "2025-01-01T00:00:00.000Z"), lab("new", "HbA1c", "2026-01-01T00:00:00.000Z")]);
    expect(result.map((r) => r.id)).toEqual(["new", "old"]);
  });
});

describe("validateDateRange (TC-01-05/TC-01-06 — ตรวจก่อนอ่านข้อมูลใดๆ เสมอ)", () => {
  it("ไม่ระบุช่วงเวลาเลย = valid ไม่จำกัด", () => {
    expect(validateDateRange()).toEqual({valid: true, start: null, end: null});
  });

  it("start ก่อน end = valid", () => {
    const result = validateDateRange("2026-01-01", "2026-06-30");
    expect(result.valid).toBe(true);
  });

  it("start อยู่หลัง end = invalid (TC-01-06)", () => {
    expect(validateDateRange("2026-06-30", "2026-01-01").valid).toBe(false);
  });

  it("start เท่ากับ end = valid (ช่วงเวลาวันเดียว)", () => {
    expect(validateDateRange("2026-01-01", "2026-01-01").valid).toBe(true);
  });

  it("วันที่แปลงไม่ได้ (unparseable) = invalid", () => {
    expect(validateDateRange("ไม่ใช่วันที่", "2026-01-01").valid).toBe(false);
    expect(validateDateRange("2026-01-01", "ไม่ใช่วันที่").valid).toBe(false);
  });

  it("date-only end เป็น inclusive end-of-day", () => {
    const result = validateDateRange(undefined, "2026-01-01");
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.end?.toISOString()).toBe(new Date("2026-01-01T23:59:59.999").toISOString());
  });

  it("date-only start เป็นต้นวัน", () => {
    const result = validateDateRange("2026-01-01", undefined);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.start?.toISOString()).toBe(new Date("2026-01-01T00:00:00.000").toISOString());
  });
});

describe("filterLabResultsInRange (TC-01-04/TC-01-05/TC-01-07)", () => {
  const all = [
    lab("in-range", "HbA1c", "2026-03-15T09:00:00.000Z"),
    lab("before-range", "HbA1c", "2025-12-01T09:00:00.000Z"),
    lab("after-range", "HbA1c", "2026-08-01T09:00:00.000Z"),
    lab("non-standard-type", "FBS", "2026-03-15T09:00:00.000Z"),
  ];

  it("ไม่จำกัดช่วงเวลา (start/end เป็น null) แสดงทั้งหมดที่เป็นชนิดมาตรฐาน (TC-01-04)", () => {
    const result = filterLabResultsInRange(all, {start: null, end: null});
    expect(result.map((r) => r.id)).toEqual(["in-range", "before-range", "after-range"]);
  });

  it("กรองเฉพาะที่อยู่ในช่วงเวลาที่ระบุ (TC-01-05)", () => {
    const range = validateDateRange("2026-01-01", "2026-06-30");
    if (!range.valid) throw new Error("unexpected");
    expect(filterLabResultsInRange(all, range).map((r) => r.id)).toEqual(["in-range"]);
  });

  it("ไม่มีผลตรวจในช่วงเวลาที่ระบุ = รายการว่าง (TC-01-07)", () => {
    const range = validateDateRange("2020-01-01", "2020-01-31");
    if (!range.valid) throw new Error("unexpected");
    expect(filterLabResultsInRange(all, range)).toEqual([]);
  });

  it("ตัด testType ที่ไม่ใช่ชนิดมาตรฐานออกเสมอ", () => {
    const result = filterLabResultsInRange(all, {start: null, end: null});
    expect(result.find((r) => r.id === "non-standard-type")).toBeUndefined();
  });
});
