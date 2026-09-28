// ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (NFR-02) — ใช้ร่วมกันโดย Operation 1 (getNcdDiagnoses) และ
// Operation 2 (getLabResults) ต้องผ่านก่อนเสมอ (api-spec.md Op 1/2) เงื่อนไข:
//   1. ผู้เรียกต้อง authenticated
//   2. request.auth.token.email_verified === true (FR-09)
//   3. users/{uid}.isActive === true (ไม่มี custom claims — Firestore เป็น source of truth เดียว)
//   4. users/{uid}.role อยู่ใน ALLOWED_ROLES
// ไม่มีการตรวจสอบระดับรายผู้ป่วย (PatientAssignment) อีกต่อไป — ยกเลิกทั้งระบบตั้งแต่ 2026-09-25

// ต้องตรงกับ ALLOWED_ROLES ใน web/src/auth/AuthProvider.tsx
export const ALLOWED_ROLES = ["แพทย์", "พยาบาล", "admin"] as const;
export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export interface CallerAuth {
  uid: string;
  emailVerified: boolean;
}

export interface CallerUserDoc {
  isActive?: unknown;
  role?: unknown;
}

export type AccessCheckResult =
  | {ok: true; role: AllowedRole; isAdmin: boolean}
  | {ok: false};

function isAllowedRole(role: unknown): role is AllowedRole {
  return typeof role === "string" && (ALLOWED_ROLES as readonly string[]).includes(role);
}

export function checkPatientAccess(
  auth: CallerAuth | undefined,
  userDoc: CallerUserDoc | undefined,
): AccessCheckResult {
  if (!auth || auth.emailVerified !== true) return {ok: false};
  if (!userDoc || userDoc.isActive !== true || !isAllowedRole(userDoc.role)) return {ok: false};
  // role="admin" อ่านได้ทุกรายเหมือนแพทย์/พยาบาล แต่ต้องบันทึก isAdminAccess=true เสมอ (NFR-20)
  return {ok: true, role: userDoc.role, isAdmin: userDoc.role === "admin"};
}
