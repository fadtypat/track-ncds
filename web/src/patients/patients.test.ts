import {describe, expect, it, vi} from "vitest";

// ทดสอบเฉพาะกฎของ Operation 0 — ไม่ต่อ Firebase จริง
vi.mock("../firebase", () => ({db: {}}));

import {isValidHn, searchPatientByHn} from "./patients";

describe("isValidHn (FR-06)", () => {
  it.each(["6500123", "0000001"])("accepts %j", (hn) => {
    expect(isValidHn(hn)).toBe(true);
  });

  it.each(["", "650012", "65001234", "HN65001", "650 123", "๖๕๐๐๑๒๓"])("rejects %j", (hn) => {
    expect(isValidHn(hn)).toBe(false);
  });
});

describe("searchPatientByHn (FR-06)", () => {
  it("returns invalid-hn without querying Firestore", async () => {
    await expect(searchPatientByHn("12345")).resolves.toEqual({status: "invalid-hn"});
  });
});
