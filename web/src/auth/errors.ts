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

// ข้อความเดียวกับ functions/src/auth/messages.ts — ใช้ระหว่างที่สมัคร/รีเซ็ตจาก Client ตรงชั่วคราว
export const SIGN_UP_ACCEPTED =
  "หากสมัครสำเร็จ ระบบจะส่งอีเมลยืนยันตัวตนไปยังอีเมลที่กรอก กรุณาตรวจสอบกล่องจดหมาย";
export const PASSWORD_RESET_ACCEPTED =
  "หากอีเมลนี้มีบัญชีอยู่ในระบบ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลดังกล่าว";
export const INVALID_EMAIL = "รูปแบบอีเมลไม่ถูกต้อง";
export const PASSWORD_POLICY_FAILED = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรและตัวเลข";
export const SIGN_UP_DISABLED = "ระบบยังไม่เปิดให้สมัครบัญชีด้วยอีเมล กรุณาติดต่อผู้ดูแลระบบ";

export function signUpErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : "";
  if (code === "auth/invalid-email") return INVALID_EMAIL;
  if (code === "auth/weak-password" || code === "auth/password-does-not-meet-requirements") {
    return PASSWORD_POLICY_FAILED;
  }
  if (code === "auth/operation-not-allowed") return SIGN_UP_DISABLED;
  if (code === "auth/too-many-requests") return TOO_MANY_ATTEMPTS;
  if (code === "auth/network-request-failed") return NETWORK_ERROR;
  return GENERIC_ERROR;
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
