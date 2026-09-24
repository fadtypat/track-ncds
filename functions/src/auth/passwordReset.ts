// Operation 9a — ขอลิงก์รีเซ็ตรหัสผ่าน (FR-10, NFR-18)
// Operation 9b (ตั้งรหัสใหม่) Client เรียก confirmPasswordReset ตรง โดยมี Identity Platform
// password policy เป็น backstop (technology-stack decision area 13)

import {IdentityToolkit} from "./identityToolkit.js";
import {PASSWORD_RESET_ACCEPTED} from "./messages.js";

export interface PasswordResetDeps {
  toolkit: IdentityToolkit;
  logError(message: string, error: unknown): void;
}

export async function requestReset(
  input: {email?: unknown},
  deps: PasswordResetDeps,
): Promise<{message: string}> {
  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (email) {
    try {
      await deps.toolkit.sendPasswordResetEmail(email);
    } catch (error) {
      // ไม่มีบัญชี/อีเมลผิดรูปแบบ/ส่งไม่สำเร็จ ต้องได้คำตอบเดียวกันเสมอ (NFR-18)
      deps.logError("requestPasswordReset: sendOobCode failed", error);
    }
  }
  return {message: PASSWORD_RESET_ACCEPTED};
}
