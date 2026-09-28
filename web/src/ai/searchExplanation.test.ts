import {describe, expect, it, vi} from "vitest";

// ทดสอบเฉพาะการสร้าง prompt — ไม่เรียก AI จริง
vi.mock("./client", () => ({createModel: vi.fn()}));

import {buildSearchPrompt} from "./searchExplanation";

describe("buildSearchPrompt (FR-17, NFR-21)", () => {
  it.each([
    [{hn: "9900001", status: "found", count: 1}, "พบผู้ป่วย 1 ราย"],
    [{hn: "9999999", status: "not-found", count: 0}, "ไม่พบผู้ป่วย"],
    [{hn: "12345", status: "invalid-hn", count: 0}, "ไม่ใช่ตัวเลขล้วน 7 หลัก"],
  ] as const)("describes %j", (summary, expected) => {
    const prompt = buildSearchPrompt(summary);
    expect(prompt).toContain(summary.hn);
    expect(prompt).toContain(expected);
  });

  it("sends only the fields of SearchSummary even if a caller passes patient details", () => {
    const leaky = {hn: "9900001", status: "found", count: 1, fullName: "นายทดสอบ หนึ่ง", patientId: "abc"} as const;
    const prompt = buildSearchPrompt(leaky);
    expect(prompt).not.toContain("นายทดสอบ");
    expect(prompt).not.toContain("abc");
  });

  it("caps very long input", () => {
    expect(buildSearchPrompt({hn: "1".repeat(500), status: "invalid-hn", count: 0}).length).toBeLessThan(300);
  });
});
