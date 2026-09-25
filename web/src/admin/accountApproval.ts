// ชั่วคราว: Operation 10 (listUserAccounts) และ 11 (approveUserAccount) จาก Client ตรง เพราะยัง deploy
// Cloud Functions ไม่ได้ (ยังไม่อยู่แพ็กเกจ Blaze) — เมื่อ deploy ได้แล้วให้ย้ายไปเป็น callable ตาม api-spec
// ข้อจำกัดเทียบกับ api-spec: สิทธิ์ Admin ตรวจเฉพาะฝั่ง Client (firestore.rules ตอนนี้เปิดให้ผู้ที่เข้าสู่ระบบ
// เขียน users ได้ทุกคน), ไม่มี audit log ของการอนุมัติ และอ่านอีเมล/สถานะยืนยันอีเมลของผู้อื่นไม่ได้
// (ข้อมูลอยู่ใน Firebase Authentication ซึ่งอ่านได้ผ่าน Admin SDK เท่านั้น)

import {collection, doc, getDocs, query, runTransaction, where} from "firebase/firestore";

import {db} from "../firebase";

// Operation 11 กำหนดได้เฉพาะแพทย์/พยาบาล — "admin" ต้องผ่าน Operation 12 เท่านั้น
export const APPROVABLE_ROLES = ["แพทย์", "พยาบาล"] as const;
export type ApprovableRole = (typeof APPROVABLE_ROLES)[number];

export interface PendingAccount {
  uid: string;
  displayName: string;
}

export type ApprovalFailure = "not-found" | "already-approved" | "invalid-role" | "self";

export class ApprovalError extends Error {
  readonly reason: ApprovalFailure;

  constructor(reason: ApprovalFailure) {
    super(reason);
    this.reason = reason;
  }
}

export const APPROVAL_MESSAGES: Record<ApprovalFailure, string> = {
  "not-found": "ไม่พบผู้ใช้งานนี้ในระบบ",
  "already-approved": "บัญชีนี้ได้รับการอนุมัติแล้ว หากต้องการเปลี่ยนบทบาทหรือระงับบัญชีให้ใช้หน้าจัดการผู้ใช้งาน",
  "invalid-role": "กรุณาเลือกบทบาทแพทย์หรือพยาบาล",
  self: "ไม่สามารถอนุมัติบัญชีของตนเองได้",
};

/** บัญชีรออนุมัติ = ไม่มี role และ isActive=false (FR-08) */
export function isPendingApproval(data: {role?: unknown; isActive?: unknown} | undefined): boolean {
  if (!data) return false;
  return data.isActive !== true && (data.role === undefined || data.role === null || data.role === "");
}

export function checkApproval(
  target: {role?: unknown; isActive?: unknown} | undefined,
  role: string,
  targetUid: string,
  callerUid: string,
): ApprovalFailure | null {
  if (targetUid === callerUid) return "self";
  if (!(APPROVABLE_ROLES as readonly string[]).includes(role)) return "invalid-role";
  if (!target) return "not-found";
  if (!isPendingApproval(target)) return "already-approved";
  return null;
}

// Operation 10 ตัวกรอง "เฉพาะที่รอการอนุมัติ"
export async function listPendingAccounts(): Promise<PendingAccount[]> {
  const snapshot = await getDocs(query(collection(db, "users"), where("isActive", "==", false)));
  return snapshot.docs
    .filter((d) => isPendingApproval(d.data()))
    .map((d) => ({uid: d.id, displayName: String(d.data().displayName ?? d.id)}))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

// Operation 11 — ตรวจสถานะล่าสุดใน transaction เดียวกับการเขียน กันอนุมัติซ้ำจาก Admin สองคนพร้อมกัน
export async function approveAccount(targetUid: string, role: string, callerUid: string): Promise<void> {
  const ref = doc(db, "users", targetUid);
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);
    const failure = checkApproval(snapshot.data(), role, targetUid, callerUid);
    if (failure) throw new ApprovalError(failure);
    tx.update(ref, {role, isActive: true});
  });
}
