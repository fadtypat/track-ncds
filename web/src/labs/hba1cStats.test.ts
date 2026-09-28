import {describe, expect, it} from "vitest";

import {buildHba1cPrompt, computeVisitStats, fiscalYearOf} from "./hba1cStats";

const d = (iso: string) => new Date(`${iso}T09:00:00`);

describe("fiscalYearOf (Thai fiscal year 1 Oct – 30 Sep)", () => {
  it.each([
    ["2026-09-27", 2569],
    ["2026-09-30", 2569],
    ["2026-10-01", 2570],
    ["2025-10-01", 2569],
    ["2026-01-15", 2569],
  ])("%s → ปีงบ %i", (iso, year) => {
    expect(fiscalYearOf(d(iso)).year).toBe(year);
  });

  it("covers 1 Oct 2568 up to, but not including, 1 Oct 2569", () => {
    const fy = fiscalYearOf(d("2026-09-27"));
    expect(fy.start).toEqual(new Date(2025, 9, 1));
    expect(fy.end).toEqual(new Date(2026, 9, 1));
  });
});

describe("computeVisitStats (FR-18 steps 1–2)", () => {
  const fy2569 = fiscalYearOf(d("2026-09-27"));

  it("counts visits and day intervals in date order, ignoring tests outside the fiscal year", () => {
    const stats = computeVisitStats(
      [d("2026-04-22"), d("2025-10-15"), d("2025-09-30"), d("2026-01-20"), d("2026-10-01")],
      fy2569,
    );
    expect(stats).toEqual({
      visitCount: 3,
      intervalsDays: [97, 92],
      intervalMinDays: 92,
      intervalAvgDays: 94.5,
      intervalMaxDays: 97,
    });
  });

  it("counts several tests on the same day as one visit", () => {
    expect(computeVisitStats([d("2026-03-10"), new Date("2026-03-10T15:30:00")], fy2569).visitCount).toBe(1);
  });

  it("returns no intervals for a single visit", () => {
    expect(computeVisitStats([d("2026-03-10")], fy2569)).toEqual({
      visitCount: 1, intervalsDays: [], intervalMinDays: null, intervalAvgDays: null, intervalMaxDays: null,
    });
  });

  it("returns zero visits when nothing falls in the fiscal year", () => {
    expect(computeVisitStats([d("2025-06-12")], fy2569).visitCount).toBe(0);
  });

  it("includes the first and last day of the fiscal year", () => {
    expect(computeVisitStats([d("2025-10-01"), d("2026-09-30")], fy2569).intervalsDays).toEqual([364]);
  });
});

describe("buildHba1cPrompt (NFR-21)", () => {
  it("contains only the counts and intervals", () => {
    const prompt = buildHba1cPrompt(
      {visitCount: 3, intervalsDays: [97, 92], intervalMinDays: 92, intervalAvgDays: 94.5, intervalMaxDays: 97},
      2569,
    );
    expect(prompt).toContain("จำนวนครั้งที่ตรวจ HbA1c: 3");
    expect(prompt).toContain("97, 92");
    expect(prompt).not.toMatch(/\d{7}/); // ไม่มี HN
    expect(prompt).not.toMatch(/20\d\d-\d\d-\d\d/); // ไม่มีวันที่ตรวจ
    expect(prompt).not.toMatch(/\d+\.\d+ ?%/); // ไม่มีค่า HbA1c
  });

  it("omits interval lines when there are none", () => {
    const prompt = buildHba1cPrompt(
      {visitCount: 0, intervalsDays: [], intervalMinDays: null, intervalAvgDays: null, intervalMaxDays: null},
      2569,
    );
    expect(prompt).not.toContain("ระยะห่าง");
  });
});
