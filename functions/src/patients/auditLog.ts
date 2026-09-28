// บันทึก auditLogRecords ก่อนอ่านข้อมูลผู้ป่วยเสมอแบบ fail-safe (NFR-06) — เขียนผ่าน Admin SDK เท่านั้น
// (Security Rules ปฏิเสธ Client ทั้งหมด) ถ้าเขียนไม่สำเร็จ ต้องไม่อ่าน/ไม่คืนข้อมูลผู้ป่วยใดๆ

export interface AuditLogEntry {
  userId: string;
  patientId: string;
  /** จริง = ผู้เรียกมี role="admin" (NFR-20) */
  isAdminAccess: boolean;
}

export interface AuditLogWriter {
  /** โยน error เมื่อเขียนไม่สำเร็จ — ผู้เรียกต้องปฏิบัติเป็น fail-safe (internal, ไม่อ่านข้อมูลต่อ) */
  writeAuditLog(entry: AuditLogEntry): Promise<void>;
}
