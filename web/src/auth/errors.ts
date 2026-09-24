import {FirebaseError} from "firebase/app";

// NFR-18 — ความผิดพลาดตอนเข้าสู่ระบบทุกแบบที่อาจบอกใบ้ว่าอีเมลมีบัญชีหรือไม่ ต้องได้ข้อความเดียวกัน
export const LOGIN_FAILED = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
export const TOO_MANY_ATTEMPTS = "พยายามหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
export const NETWORK_ERROR = "เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
export const GENERIC_ERROR = "ไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";

export function loginErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : "";
  if (code === "auth/too-many-requests") return TOO_MANY_ATTEMPTS;
  if (code === "auth/network-request-failed") return NETWORK_ERROR;
  return LOGIN_FAILED;
}

/** ข้อความจาก HttpsError ของ Cloud Functions (ข้อความไทยที่ฝั่งเซิร์ฟเวอร์กำหนดไว้แล้ว) */
export function callableErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "functions/invalid-argument" || error.code === "functions/unavailable") {
      return error.message;
    }
    if (error.code === "auth/network-request-failed") return NETWORK_ERROR;
  }
  return GENERIC_ERROR;
}
