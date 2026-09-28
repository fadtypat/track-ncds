// Error type ที่ normalize ได้จากทั้ง callableHistorySource (FirebaseError "functions/*")
// และ clientHistorySource (throw ตรงจากโค้ดเอง) — ตาม api-spec.md error code: not-found,
// invalid-argument, permission-denied, internal (unauthenticated ไม่เกิดที่ชั้นนี้ เพราะ AuthProvider
// กันไว้ก่อนแล้วที่ App.tsx)

import {FirebaseError} from "firebase/app";

export type HistoryErrorCode = "not-found" | "invalid-argument" | "permission-denied" | "internal";

const MESSAGES: Record<HistoryErrorCode, string> = {
  "not-found": "ไม่พบผู้ป่วยรายนี้ในระบบ",
  "invalid-argument": "ช่วงเวลาที่ระบุไม่ถูกต้อง กรุณาตรวจสอบวันที่เริ่มต้น/สิ้นสุดแล้วลองใหม่",
  "permission-denied": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
  internal: "ไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
};

export class HistoryError extends Error {
  readonly code: HistoryErrorCode;

  constructor(code: HistoryErrorCode) {
    super(MESSAGES[code]);
    this.code = code;
  }

  get userMessage(): string {
    return MESSAGES[this.code];
  }
}

/** คลุมทั้งข้อผิดพลาดที่ throw เองใน clientHistorySource และ FirebaseError จาก httpsCallable */
export function normalizeHistoryError(error: unknown): HistoryError {
  if (error instanceof HistoryError) return error;
  if (error instanceof FirebaseError) {
    const code = error.code.replace(/^functions\//, "");
    if (code === "not-found" || code === "invalid-argument" || code === "permission-denied") {
      return new HistoryError(code);
    }
    return new HistoryError("internal");
  }
  return new HistoryError("internal");
}
