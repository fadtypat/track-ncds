// NFR-17 — ต้องตรงกับ functions/src/auth/passwordPolicy.ts (ตัวจริงที่บังคับฝั่งเซิร์ฟเวอร์)
// ฝั่ง Client ใช้แค่แสดงเช็กลิสต์ระหว่างพิมพ์

export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRuleStatus {
  id: "minLength" | "letter" | "digit";
  label: string;
  met: boolean;
}

export function passwordRules(password: string): PasswordRuleStatus[] {
  return [
    {id: "minLength", label: `อย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`, met: password.length >= PASSWORD_MIN_LENGTH},
    {id: "letter", label: "มีตัวอักษรอย่างน้อย 1 ตัว", met: /\p{L}/u.test(password)},
    {id: "digit", label: "มีตัวเลขอย่างน้อย 1 ตัว", met: /[0-9]/.test(password)},
  ];
}

export function isPasswordValid(password: string): boolean {
  return passwordRules(password).every((rule) => rule.met);
}
