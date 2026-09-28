// ชั่วคราว: สมัคร/ขอรีเซ็ตรหัสผ่านจาก Client ตรง เพราะโปรเจกต์ยังไม่อยู่แพ็กเกจ Blaze จึง deploy
// Cloud Functions (signUpUser, requestPasswordReset) ไม่ได้ — เมื่อ deploy ได้แล้วให้กลับไปใช้
// callable ใน functions/ ตาม api-spec Operation 8/9a
// ข้อจำกัดเทียบกับ Operation 8/9a: NFR-17 ตรวจเฉพาะฝั่ง Client (Firebase บังคับเองแค่ ≥ 6 ตัว
// ถ้ายังไม่เปิด Identity Platform password policy) และ NFR-18 ปิดได้แค่ระดับข้อความบนจอ
// (response ของ Firebase Auth ยังแยกกรณีอีเมลซ้ำได้)

import {FirebaseError} from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";

import {auth, db} from "../firebase";

export type SignUpOutcome = "created" | "email-exists";

export async function signUpFromClient(email: string, password: string): Promise<SignUpOutcome> {
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/email-already-in-use") return "email-exists";
    throw error;
  }

  const user = credential.user;
  try {
    // บัญชีใหม่ไม่มี role และ isActive=false จนกว่า Admin จะอนุมัติ (FR-08)
    await setDoc(doc(db, "users", user.uid), {displayName: email, isActive: false});
  } catch (error) {
    // rollback ตาม Operation 8 — ไม่ปล่อยบัญชี Auth ที่ไม่มี users/{uid} ค้างไว้
    await deleteUser(user).catch(() => undefined);
    throw error;
  }

  // ส่งไม่สำเร็จไม่ถือว่าสมัครล้มเหลว — ผู้ใช้กดส่งซ้ำได้จากหน้ายืนยันอีเมล
  await sendEmailVerification(user).catch(() => undefined);
  return "created";
}

export async function requestPasswordResetFromClient(email: string): Promise<void> {
  // ไม่มีบัญชี/ส่งไม่สำเร็จต้องได้ผลบนจอแบบเดียวกันเสมอ (NFR-18)
  await sendPasswordResetEmail(auth, email).catch(() => undefined);
}
