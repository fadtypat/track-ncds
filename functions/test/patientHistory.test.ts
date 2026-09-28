import {describe, expect, it, vi} from "vitest";

import {MOCK_DATA_SOURCE} from "../src/patients/historyTypes.js";
import {
  INVALID_DATE_RANGE,
  INVALID_PATIENT_ID,
  PATIENT_NOT_FOUND,
  PERMISSION_DENIED,
  TEMPORARILY_UNAVAILABLE,
} from "../src/patients/messages.js";
import {
  getLabResults,
  getNcdDiagnoses,
  LabResultsDeps,
  NcdDiagnosesDeps,
  RawLabResult,
  RawNcdDiagnosis,
} from "../src/patients/patientHistory.js";

const AUTH = {uid: "uid-doctor", emailVerified: true};
const DOCTOR_USER = {isActive: true, role: "แพทย์"};
const ADMIN_USER = {isActive: true, role: "admin"};
const MOCK_PATIENT = {dataSource: MOCK_DATA_SOURCE};

function makeDiagnosisDeps(overrides: Partial<NcdDiagnosesDeps> = {}): NcdDiagnosesDeps {
  return {
    getCallerUser: vi.fn(async () => DOCTOR_USER),
    getPatient: vi.fn(async () => MOCK_PATIENT),
    writeAuditLog: vi.fn(async () => undefined),
    logError: vi.fn(),
    queryNcdDiagnoses: vi.fn(async () => []),
    ...overrides,
  };
}

function makeLabDeps(overrides: Partial<LabResultsDeps> = {}): LabResultsDeps {
  return {
    getCallerUser: vi.fn(async () => DOCTOR_USER),
    getPatient: vi.fn(async () => MOCK_PATIENT),
    writeAuditLog: vi.fn(async () => undefined),
    logError: vi.fn(),
    queryLabResults: vi.fn(async () => []),
    ...overrides,
  };
}

function diagnosis(overrides: Partial<RawNcdDiagnosis> = {}): RawNcdDiagnosis {
  return {
    id: "d1",
    icd10Code: "E11.9",
    diagnosedAt: new Date("2026-01-01T00:00:00.000Z"),
    dataSource: MOCK_DATA_SOURCE,
    ...overrides,
  };
}

function lab(overrides: Partial<RawLabResult> = {}): RawLabResult {
  return {
    id: "l1",
    testType: "HbA1c",
    value: 7.2,
    unit: "%",
    testedAt: new Date("2026-01-01T00:00:00.000Z"),
    dataSource: MOCK_DATA_SOURCE,
    ...overrides,
  };
}

describe("getNcdDiagnoses (Operation 1)", () => {
  it("TC-01-01: returns in-scope diagnoses sorted by diagnosedAt desc", async () => {
    const deps = makeDiagnosisDeps({
      queryNcdDiagnoses: vi.fn(async () => [
        diagnosis({id: "old", icd10Code: "I11.0", diagnosedAt: new Date("2025-01-01T00:00:00.000Z")}),
        diagnosis({id: "new", icd10Code: "J44.1", diagnosedAt: new Date("2026-06-01T00:00:00.000Z")}),
      ]),
    });

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.diagnoses.map((d) => d.id)).toEqual(["new", "old"]);
    expect(result.data.diagnoses[0]).toMatchObject({diseaseGroup: "ถุงลมโป่งพอง"});
    expect(result.data.diagnoses[1]).toMatchObject({diseaseGroup: "ความดันโลหิตสูง"});
    expect(deps.writeAuditLog).toHaveBeenCalledWith({
      userId: "uid-doctor",
      patientId: "p1",
      isAdminAccess: false,
    });
  });

  it("filters out-of-scope ICD-10 codes (e.g. E15, K21.9) and non-mock records", async () => {
    const deps = makeDiagnosisDeps({
      queryNcdDiagnoses: vi.fn(async () => [
        diagnosis({id: "out-of-scope", icd10Code: "E15"}),
        diagnosis({id: "unrelated", icd10Code: "K21.9"}),
        diagnosis({id: "non-mock", icd10Code: "E11.0", dataSource: "HOSxP"}),
        diagnosis({id: "in-scope", icd10Code: "E11.9"}),
      ]),
    });

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.diagnoses.map((d) => d.id)).toEqual(["in-scope"]);
  });

  it("TC-01-02: returns an empty list (not an error) when there is no history", async () => {
    const deps = makeDiagnosisDeps({queryNcdDiagnoses: vi.fn(async () => [])});

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: true, data: {diagnoses: []}});
  });

  it("TC-01-03: not-found when the patient does not exist, and stops before reading diagnoses", async () => {
    const deps = makeDiagnosisDeps({getPatient: vi.fn(async () => undefined)});

    const result = await getNcdDiagnoses({patientId: "missing"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "not-found", message: PATIENT_NOT_FOUND});
    expect(deps.writeAuditLog).not.toHaveBeenCalled();
    expect(deps.queryNcdDiagnoses).not.toHaveBeenCalled();
  });

  it("not-found when the patient exists but is not mock data (NFR-01)", async () => {
    const deps = makeDiagnosisDeps({getPatient: vi.fn(async () => ({dataSource: "HOSxP"}))});

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "not-found", message: PATIENT_NOT_FOUND});
    expect(deps.queryNcdDiagnoses).not.toHaveBeenCalled();
  });

  it("invalid-argument when patientId is missing/empty", async () => {
    const deps = makeDiagnosisDeps();

    const result = await getNcdDiagnoses({patientId: "   "}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "invalid-argument", message: INVALID_PATIENT_ID});
    expect(deps.getPatient).not.toHaveBeenCalled();
  });

  it("permission-denied when unauthenticated", async () => {
    const deps = makeDiagnosisDeps();

    const result = await getNcdDiagnoses({patientId: "p1"}, undefined, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
    expect(deps.getCallerUser).not.toHaveBeenCalled();
  });

  it("permission-denied when email is not verified", async () => {
    const deps = makeDiagnosisDeps();

    const result = await getNcdDiagnoses({patientId: "p1"}, {...AUTH, emailVerified: false}, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
  });

  it("permission-denied when the account is inactive", async () => {
    const deps = makeDiagnosisDeps({getCallerUser: vi.fn(async () => ({...DOCTOR_USER, isActive: false}))});

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
  });

  it("permission-denied when the account has no role yet (pending approval)", async () => {
    const deps = makeDiagnosisDeps({getCallerUser: vi.fn(async () => ({isActive: false, role: undefined}))});

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
  });

  it("TC-01-09: admin can read any patient's history and is flagged isAdminAccess=true (NFR-20)", async () => {
    const deps = makeDiagnosisDeps({getCallerUser: vi.fn(async () => ADMIN_USER)});

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result.ok).toBe(true);
    expect(deps.writeAuditLog).toHaveBeenCalledWith({
      userId: "uid-doctor",
      patientId: "p1",
      isAdminAccess: true,
    });
  });

  it("internal and does not read diagnoses when the audit log write fails (NFR-06 fail-safe)", async () => {
    const deps = makeDiagnosisDeps({
      writeAuditLog: vi.fn(async () => {
        throw new Error("write failed");
      }),
    });

    const result = await getNcdDiagnoses({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "internal", message: TEMPORARILY_UNAVAILABLE});
    expect(deps.queryNcdDiagnoses).not.toHaveBeenCalled();
  });
});

describe("getLabResults (Operation 2)", () => {
  it("TC-01-04: returns all standard lab results sorted by testedAt desc when no range is given", async () => {
    const deps = makeLabDeps({
      queryLabResults: vi.fn(async () => [
        lab({id: "old", testedAt: new Date("2025-01-01T00:00:00.000Z")}),
        lab({id: "new", testedAt: new Date("2026-06-01T00:00:00.000Z")}),
      ]),
    });

    const result = await getLabResults({patientId: "p1"}, AUTH, deps);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.labResults.map((r) => r.id)).toEqual(["new", "old"]);
  });

  it("filters out non-standard test types and non-mock records", async () => {
    const deps = makeLabDeps({
      queryLabResults: vi.fn(async () => [
        lab({id: "standard", testType: "eGFR"}),
        lab({id: "non-standard", testType: "CBC"}),
        lab({id: "non-mock", dataSource: "HOSxP"}),
      ]),
    });

    const result = await getLabResults({patientId: "p1"}, AUTH, deps);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.labResults.map((r) => r.id)).toEqual(["standard"]);
  });

  it("TC-01-05: applies dateStart/dateEnd boundaries (inclusive, end-of-day for date-only)", async () => {
    const deps = makeLabDeps({
      queryLabResults: vi.fn(async (patientId, range) => [
        lab({id: "before", testedAt: new Date("2025-12-31T23:59:59.999Z")}),
        lab({id: "start-boundary", testedAt: range.start ?? new Date("2026-01-01T00:00:00.000Z")}),
        lab({id: "inside", testedAt: new Date("2026-03-01T00:00:00.000Z")}),
        lab({id: "end-boundary", testedAt: range.end ?? new Date("2026-06-30T23:59:59.999Z")}),
        lab({id: "after", testedAt: new Date("2026-07-01T00:00:00.000Z")}),
      ]),
    });

    const result = await getLabResults(
      {patientId: "p1", dateStart: "2026-01-01", dateEnd: "2026-06-30"},
      AUTH,
      deps,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.labResults.map((r) => r.id).sort()).toEqual(
      ["start-boundary", "inside", "end-boundary"].sort(),
    );
    expect(deps.queryLabResults).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({
        start: new Date("2026-01-01T00:00:00.000Z"),
        end: new Date("2026-06-30T23:59:59.999Z"),
      }),
    );
  });

  it("TC-01-06: invalid-argument when dateStart is after dateEnd, validated before any read", async () => {
    const deps = makeLabDeps();

    const result = await getLabResults(
      {patientId: "p1", dateStart: "2026-06-30", dateEnd: "2026-01-01"},
      AUTH,
      deps,
    );

    expect(result).toEqual({ok: false, code: "invalid-argument", message: INVALID_DATE_RANGE});
    expect(deps.getPatient).not.toHaveBeenCalled();
    expect(deps.writeAuditLog).not.toHaveBeenCalled();
  });

  it("invalid-argument when a date string cannot be parsed", async () => {
    const deps = makeLabDeps();

    const result = await getLabResults({patientId: "p1", dateStart: "not-a-date"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "invalid-argument", message: INVALID_DATE_RANGE});
    expect(deps.getPatient).not.toHaveBeenCalled();
  });

  it("TC-01-07: returns an empty list (not an error) when no lab results fall within the range", async () => {
    const deps = makeLabDeps({
      queryLabResults: vi.fn(async () => [lab({id: "outside", testedAt: new Date("2026-03-01T00:00:00.000Z")})]),
    });

    const result = await getLabResults(
      {patientId: "p1", dateStart: "2020-01-01", dateEnd: "2020-01-31"},
      AUTH,
      deps,
    );

    expect(result).toEqual({ok: true, data: {labResults: []}});
  });

  it("TC-01-03 (lab): not-found when the patient does not exist", async () => {
    const deps = makeLabDeps({getPatient: vi.fn(async () => undefined)});

    const result = await getLabResults({patientId: "missing"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "not-found", message: PATIENT_NOT_FOUND});
    expect(deps.queryLabResults).not.toHaveBeenCalled();
  });

  it("not-found when the patient exists but is not mock data (NFR-01)", async () => {
    const deps = makeLabDeps({getPatient: vi.fn(async () => ({dataSource: "HOSxP"}))});

    const result = await getLabResults({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "not-found", message: PATIENT_NOT_FOUND});
  });

  it("invalid-argument when patientId is missing/empty", async () => {
    const deps = makeLabDeps();

    const result = await getLabResults({patientId: ""}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "invalid-argument", message: INVALID_PATIENT_ID});
  });

  it("permission-denied when unauthenticated", async () => {
    const deps = makeLabDeps();

    const result = await getLabResults({patientId: "p1"}, undefined, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
  });

  it("permission-denied when email is not verified", async () => {
    const deps = makeLabDeps();

    const result = await getLabResults({patientId: "p1"}, {...AUTH, emailVerified: false}, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
  });

  it("permission-denied when the account is inactive", async () => {
    const deps = makeLabDeps({getCallerUser: vi.fn(async () => ({...DOCTOR_USER, isActive: false}))});

    const result = await getLabResults({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
  });

  it("permission-denied when the account has no role", async () => {
    const deps = makeLabDeps({getCallerUser: vi.fn(async () => undefined)});

    const result = await getLabResults({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "permission-denied", message: PERMISSION_DENIED});
  });

  it("TC-01-09: admin access is flagged isAdminAccess=true (NFR-20)", async () => {
    const deps = makeLabDeps({getCallerUser: vi.fn(async () => ADMIN_USER)});

    await getLabResults({patientId: "p1"}, AUTH, deps);

    expect(deps.writeAuditLog).toHaveBeenCalledWith({
      userId: "uid-doctor",
      patientId: "p1",
      isAdminAccess: true,
    });
  });

  it("internal and does not read lab results when the audit log write fails (NFR-06 fail-safe)", async () => {
    const deps = makeLabDeps({
      writeAuditLog: vi.fn(async () => {
        throw new Error("write failed");
      }),
    });

    const result = await getLabResults({patientId: "p1"}, AUTH, deps);

    expect(result).toEqual({ok: false, code: "internal", message: TEMPORARILY_UNAVAILABLE});
    expect(deps.queryLabResults).not.toHaveBeenCalled();
  });
});
