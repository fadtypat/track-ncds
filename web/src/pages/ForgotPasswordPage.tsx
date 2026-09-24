import {httpsCallable} from "firebase/functions";
import {useState, type FormEvent} from "react";

import {callableErrorMessage} from "../auth/errors";
import {AuthCard, Callout} from "../components/AuthCard";
import {functions} from "../firebase";
import {Link} from "../router";

const requestPasswordReset = httpsCallable<{email: string}, {message: string}>(functions, "requestPasswordReset");

// Operation 9a — ขอลิงก์รีเซ็ตรหัสผ่านผ่าน Cloud Function (FR-10, NFR-18)
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{tone: "info" | "warn"; text: string} | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await requestPasswordReset({email: email.trim()});
      setResult({tone: "info", text: response.data.message});
    } catch (err) {
      setResult({tone: "warn", text: callableErrorMessage(err)});
    } finally {
      setBusy(false);
    }
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
      {result && (
        <Callout tone={result.tone} title={result.tone === "info" ? "ส่งคำขอแล้ว" : "ส่งคำขอไม่สำเร็จ"}>
          {result.text}
        </Callout>
      )}
      <p className="auth-footer"><Link to="/login">กลับไปหน้าเข้าสู่ระบบ</Link></p>
    </AuthCard>
  );
}
