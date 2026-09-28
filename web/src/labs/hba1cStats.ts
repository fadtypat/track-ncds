// FR-18 ขั้นที่ 1–2 — คำนวณด้วยโค้ดเท่านั้น (ไม่ให้ AI คำนวณ) ตาม technology-stack.md decision area 23
// ปีงบประมาณราชการไทย: 1 ต.ค. – 30 ก.ย. เช่น ปีงบ 2569 = 1 ต.ค. 2568 – 30 ก.ย. 2569

const DAY_MS = 24 * 60 * 60 * 1000;

export interface FiscalYear {
  /** ปีงบประมาณแบบ พ.ศ. */
  year: number;
  /** วันแรกของปีงบ (รวม) */
  start: Date;
  /** วันแรกของปีงบถัดไป (ไม่รวม) */
  end: Date;
}

export function fiscalYearOf(date: Date): FiscalYear {
  // ต.ค.–ธ.ค. นับเป็นปีงบของปี ค.ศ. ถัดไป
  const endCe = date.getMonth() >= 9 ? date.getFullYear() + 1 : date.getFullYear();
  return {year: endCe + 543, start: new Date(endCe - 1, 9, 1), end: new Date(endCe, 9, 1)};
}

export interface VisitStats {
  visitCount: number;
  intervalsDays: number[];
  intervalMinDays: number | null;
  intervalAvgDays: number | null;
  intervalMaxDays: number | null;
}

/** นับวันตามปฏิทิน ไม่ให้เวลาในวันหรือเวลาออมแสงทำให้ผลคลาดไป 1 วัน */
function calendarDay(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

/** ขั้นที่ 1–2: วันที่ตรวจที่อยู่ในปีงบ → จำนวน visit และระยะห่างเป็นวันระหว่างแต่ละครั้ง */
export function computeVisitStats(testDates: Date[], fiscalYear: FiscalYear): VisitStats {
  // ตรวจหลายรายการในวันเดียวกันนับเป็น visit เดียว
  const days = [...new Set(
    testDates.filter((d) => d >= fiscalYear.start && d < fiscalYear.end).map(calendarDay),
  )].sort((a, b) => a - b);

  const intervalsDays = days.slice(1).map((day, i) => day - days[i]);
  if (intervalsDays.length === 0) {
    return {visitCount: days.length, intervalsDays, intervalMinDays: null, intervalAvgDays: null, intervalMaxDays: null};
  }
  const avg = intervalsDays.reduce((sum, n) => sum + n, 0) / intervalsDays.length;
  return {
    visitCount: days.length,
    intervalsDays,
    intervalMinDays: Math.min(...intervalsDays),
    intervalAvgDays: Math.round(avg * 10) / 10,
    intervalMaxDays: Math.max(...intervalsDays),
  };
}

/** ข้อความที่ส่งให้ AI — มีแต่ตัวเลขสรุป ไม่มี HN/ชื่อ/วันที่ตรวจ/ค่า HbA1c (NFR-21) */
export function buildHba1cPrompt(stats: VisitStats, fiscalYearBe: number): string {
  const lines = [`ปีงบประมาณ ${fiscalYearBe}`, `จำนวนครั้งที่ตรวจ HbA1c: ${stats.visitCount}`];
  if (stats.intervalsDays.length > 0) {
    lines.push(
      `ระยะห่างระหว่างการตรวจแต่ละครั้ง (วัน): ${stats.intervalsDays.join(", ")}`,
      `ระยะห่างต่ำสุด ${stats.intervalMinDays} วัน เฉลี่ย ${stats.intervalAvgDays} วัน สูงสุด ${stats.intervalMaxDays} วัน`,
    );
  }
  lines.push("เขียนสรุปผลนี้ให้ผู้ใช้งานในคลินิกเข้าใจ");
  return lines.join("\n");
}
