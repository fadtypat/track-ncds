// ข้อความที่คืนให้ Client — สั้น เป็นภาษาไทย และเป็น generic (ไม่รั่วรายละเอียดภายใน) ตามแนวทางเดียวกับ auth/messages.ts

export const PERMISSION_DENIED = "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้";

export const INVALID_PATIENT_ID = "ข้อมูลผู้ป่วยไม่ถูกต้อง";

export const PATIENT_NOT_FOUND = "ไม่พบผู้ป่วยที่ระบุ";

export const INVALID_DATE_RANGE = "ช่วงเวลาที่ระบุไม่ถูกต้อง";

export const TEMPORARILY_UNAVAILABLE = "ไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
