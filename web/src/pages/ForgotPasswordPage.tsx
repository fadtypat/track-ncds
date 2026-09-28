import {useState, type FormEvent} from "react";

import {requestPasswordResetFromClient} from "../auth/clientAuthFlows";
import {PASSWORD_RESET_ACCEPTED} from "../auth/errors";
import {AuthCard, Callout} from "../components/AuthCard";
import {Link} from "../router";

// Operation 9a — ขอลิงก์รีเซ็ตรหัสผ่าน (FR-10, NFR-18) ตอนนี้เรียก Firebase จาก Client ตรงชั่วคราว
// ดูข้อจำกัดใน ../auth/clientAuthFlows.ts
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    await requestPasswordResetFromClient(email.trim());
    setSent(true);
    setBusy(false);
  }

  return (
    <AuthCard title="ลืมรหัสผ่าน" intro="กรอกอีเมลที่ใช้สมัคร ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="forgot-email">อีเมล</label>
          <input id="forgot-email" className="text-input" type="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !email}>
          {busy ? "กำลังส่งคำขอ…" : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
        </button>
      </form>
      {sent && <Callout tone="info" title="ส่งคำขอแล้ว">{PASSWORD_RESET_ACCEPTED}</Callout>}
      <p className="auth-footer"><Link to="/login">กลับไปหน้าเข้าสู่ระบบ</Link></p>
    </AuthCard>
  );
}
