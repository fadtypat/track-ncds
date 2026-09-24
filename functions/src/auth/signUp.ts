// Operation 8 — สมัครบัญชีด้วยตนเอง (FR-08, FR-09, NFR-17, NFR-18)
// ดู docs/02-design/02-technical/detailed-design/user-authentication-email-password.md

import {IdentityToolkit} from "./identityToolkit.js";
import {checkPassword} from "./passwordPolicy.js";
import {
  INVALID_EMAIL,
  PASSWORD_POLICY_FAILED,
  SIGN_UP_ACCEPTED,
  TEMPORARILY_UNAVAILABLE,
} from "./messages.js";

export class EmailAlreadyExistsError extends Error {}
export class InvalidEmailError extends Error {}
export class PasswordRejectedError extends Error {}

export interface SignUpDeps {
  /** สร้างบัญชี Authentication — โยน EmailAlreadyExistsError/InvalidEmailError/PasswordRejectedError */
  createAuthUser(email: string, password: string): Promise<string>;
  deleteAuthUser(uid: string): Promise<void>;
  /** เขียน users/{uid} ผ่าน Admin SDK (Client เขียนเอกสารนี้ไม่ได้) */
  createUserDoc(uid: string, doc: NewUserDoc): Promise<void>;
  createCustomToken(uid: string): Promise<string>;
  toolkit: IdentityToolkit;
  logError(message: string, error: unknown): void;
}

export interface NewUserDoc {
  displayName: string;
  isActive: false;
}

export type SignUpResult =
  | {ok: true; message: string}
  | {ok: false; code: "invalid-argument" | "unavailable"; message: string};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(
  input: {email?: unknown; password?: unknown},
  deps: SignUpDeps,
): Promise<SignUpResult> {
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!EMAIL_PATTERN.test(email)) {
    return {ok: false, code: "invalid-argument", message: INVALID_EMAIL};
  }
  // ตรวจนโยบายก่อนแตะบัญชีใดๆ — ไม่ใช่ข้อมูลที่ต้อง generic เพราะไม่เกี่ยวกับการมีบัญชี (NFR-17)
  if (checkPassword(password).length > 0) {
    return {ok: false, code: "invalid-argument", message: PASSWORD_POLICY_FAILED};
  }

  let uid: string;
  try {
    uid = await deps.createAuthUser(email, password);
  } catch (error) {
    // อีเมลซ้ำ: ไม่สร้าง ไม่ส่งอีเมล แต่คืนข้อความเดียวกับกรณีสำเร็จ (NFR-18)
    if (error instanceof EmailAlreadyExistsError) return {ok: true, message: SIGN_UP_ACCEPTED};
    if (error instanceof InvalidEmailError) {
      return {ok: false, code: "invalid-argument", message: INVALID_EMAIL};
    }
    if (error instanceof PasswordRejectedError) {
      return {ok: false, code: "invalid-argument", message: PASSWORD_POLICY_FAILED};
    }
    deps.logError("signUpUser: createUser failed", error);
    return {ok: false, code: "unavailable", message: TEMPORARILY_UNAVAILABLE};
  }

  try {
    // บัญชีใหม่ไม่มี role และ isActive=false จนกว่าผู้ดูแลระบบจะอนุมัติ (FR-08)
    // spec ไม่ได้เก็บชื่อตอนสมัคร จึงใช้อีเมลเป็น displayName ชั่วคราวให้ผู้ดูแลแก้ตอนอนุมัติ
    await deps.createUserDoc(uid, {displayName: email, isActive: false});
  } catch (error) {
    deps.logError("signUpUser: users/{uid} write failed, rolling back", error);
    try {
      await deps.deleteAuthUser(uid);
    } catch (rollbackError) {
      deps.logError(`signUpUser: rollback deleteUser failed for ${uid}`, rollbackError);
    }
    return {ok: false, code: "unavailable", message: TEMPORARILY_UNAVAILABLE};
  }

  try {
    const idToken = await deps.toolkit.exchangeCustomToken(await deps.createCustomToken(uid));
    await deps.toolkit.sendVerificationEmail(idToken);
  } catch (error) {
    // บัญชีสร้างแล้ว — ไม่ rollback เพราะผู้ใช้เข้าสู่ระบบแล้วขอส่งอีเมลยืนยันใหม่ได้
    deps.logError(`signUpUser: verification email failed for ${uid}`, error);
  }

  return {ok: true, message: SIGN_UP_ACCEPTED};
}
