// NFR-17 — ต้องตรงกับ web/src/auth/passwordPolicy.ts และ Identity Platform password policy
// (technology-stack decision area 13) ถ้าแก้ที่ใดต้องแก้ให้ตรงกันทุกจุด

export const PASSWORD_MIN_LENGTH = 8;
// Firebase Authentication รับรหัสผ่านได้ไม่เกิน 4096 ตัวอักษร
export const PASSWORD_MAX_LENGTH = 4096;

export type PasswordRule = "minLength" | "maxLength" | "letter" | "digit";

export function checkPassword(password: string): PasswordRule[] {
  const failed: PasswordRule[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) failed.push("minLength");
  if (password.length > PASSWORD_MAX_LENGTH) failed.push("maxLength");
  if (!/\p{L}/u.test(password)) failed.push("letter");
  if (!/[0-9]/.test(password)) failed.push("digit");
  return failed;
}
