import {FirebaseError} from "firebase/app";
import {describe, expect, it} from "vitest";

import {HistoryError, normalizeHistoryError} from "./historyErrors";

describe("normalizeHistoryError", () => {
  it("ส่งต่อ HistoryError เดิม (จาก clientHistorySource) โดยไม่เปลี่ยนแปลง", () => {
    const error = new HistoryError("invalid-argument");
    expect(normalizeHistoryError(error)).toBe(error);
  });

  it.each([
    ["functions/not-found", "not-found"],
    ["functions/invalid-argument", "invalid-argument"],
    ["functions/permission-denied", "permission-denied"],
  ] as const)("แปลง FirebaseError code %s เป็น %s (จาก callableHistorySource)", (code, expectedCode) => {
    const error = new FirebaseError(code, "boom");
    expect(normalizeHistoryError(error).code).toBe(expectedCode);
  });

  it("แปลง FirebaseError code ที่ไม่รู้จักเป็น internal", () => {
    const error = new FirebaseError("functions/unavailable", "boom");
    expect(normalizeHistoryError(error).code).toBe("internal");
  });

  it("แปลง error ชนิดอื่นที่ไม่ใช่ FirebaseError/HistoryError เป็น internal", () => {
    expect(normalizeHistoryError(new Error("unexpected")).code).toBe("internal");
    expect(normalizeHistoryError("plain string").code).toBe("internal");
    expect(normalizeHistoryError(undefined).code).toBe("internal");
  });

  it("มีข้อความไทยสำหรับผู้ใช้ต่อแต่ละ code", () => {
    expect(new HistoryError("not-found").userMessage).toContain("ไม่พบผู้ป่วย");
    expect(new HistoryError("invalid-argument").userMessage).toContain("ช่วงเวลา");
    expect(new HistoryError("permission-denied").userMessage).toContain("สิทธิ์");
    expect(new HistoryError("internal").userMessage).toBeTruthy();
  });
});
