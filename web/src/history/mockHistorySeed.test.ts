import {describe, expect, it, vi} from "vitest";

// ทดสอบเฉพาะ generator ล้วน (buildMockHistory) — ไม่ต่อ Firebase จริง (เหมือน patients.test.ts)
vi.mock("../firebase", () => ({db: {}}));

import {MOCK_DATA_SOURCE} from "../patients/patients";
import {buildMockHistory} from "./mockHistorySeed";
import {STANDARD_LAB_TYPES} from "./historyTypes";

const TODAY = new Date("2026-09-28T00:00:00.000Z");

describe("buildMockHistory (T-3-01, pure generator)", () => {
  it("is deterministic for the same input", () => {
    const patients = [{id: "p1", hn: "9900001"}];

    const first = buildMockHistory(patients, TODAY);
    const second = buildMockHistory(patients, TODAY);

    expect(first).toEqual(second);
  });

  it("generates 1-3 in-scope diagnoses per patient, all mock data", () => {
    const patients = [{id: "p1", hn: "9900001"}, {id: "p2", hn: "9900002"}, {id: "p3", hn: "9900003"}];

    const {diagnoses} = buildMockHistory(patients, TODAY);

    for (const patient of patients) {
      const own = diagnoses.filter((d) => d.patientId === patient.id);
      const inScope = own.filter((d) => /^(E1[0-4]|I1[0-4]|J44)/.test(d.icd10Code));
      expect(inScope.length).toBeGreaterThanOrEqual(1);
      expect(inScope.length).toBeLessThanOrEqual(3);
      expect(own.every((d) => d.dataSource === MOCK_DATA_SOURCE)).toBe(true);
    }
  });

  it("includes at least one out-of-scope ICD-10 code across patients (exercises the ICD scope filter)", () => {
    const patients = Array.from({length: 6}, (_, i) => ({id: `p${i}`, hn: `990000${i}`}));

    const {diagnoses} = buildMockHistory(patients, TODAY);

    const outOfScope = diagnoses.filter((d) => !/^(E1[0-4]|I1[0-4]|J44)/.test(d.icd10Code));
    expect(outOfScope.length).toBeGreaterThan(0);
  });

  it("generates lab results for every standard lab type, all mock data, dated no more than ~2 years back", () => {
    const patients = [{id: "p1", hn: "9900001"}];

    const {labResults} = buildMockHistory(patients, TODAY);

    const typesSeen = new Set(labResults.map((r) => r.testType));
    for (const testType of STANDARD_LAB_TYPES) {
      expect(typesSeen.has(testType)).toBe(true);
    }
    expect(labResults.every((r) => r.dataSource === MOCK_DATA_SOURCE)).toBe(true);
    const twoYearsMs = 2 * 366 * 24 * 60 * 60 * 1000;
    expect(labResults.every((r) => TODAY.getTime() - r.testedAt.getTime() <= twoYearsMs)).toBe(true);
  });

  it("includes some abnormal lab values (not only normal-range values)", () => {
    const patients = Array.from({length: 4}, (_, i) => ({id: `p${i}`, hn: `990000${i}`}));

    const {labResults} = buildMockHistory(patients, TODAY);

    const hba1c = labResults.filter((r) => r.testType === "HbA1c");
    const hasAbnormal = hba1c.some((r) => r.value >= 8.0);
    expect(hasAbnormal).toBe(true);
  });

  it("returns empty arrays for an empty patient list", () => {
    expect(buildMockHistory([], TODAY)).toEqual({diagnoses: [], labResults: []});
  });
});
