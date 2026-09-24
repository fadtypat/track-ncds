import {httpsCallable} from "firebase/functions";
import {useState, type FormEvent} from "react";

import {callableErrorMessage} from "../auth/errors";
import {isPasswordValid, passwordRules} from "../auth/passwordPolicy";
import {AuthCard, Callout, PasswordRules} from "../components/AuthCard";
import {functions} from "../firebase";
import {Link} from "../router";

const signUpUser = httpsCallable<{email: string; password: string}, {message: string}>(functions, "signUpUser");

// Operation 8 — สมัครบัญชีผ่าน Cloud Function เสมอ (FR-08, NFR-17, NFR-18)
export function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await signUpUser({email: email.trim(), password});
      setAccepted(result.data.message);
    } catch (err) {
      setError(callableErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (accepted) {
    return (
      <AuthCard title="ส่งคำขอสมัครบัญชีแล้ว">
        <Callout tone="info" title="ตรวจสอบอีเมลของคุณ">{accepted}</Callout>
        <p className="type-body">
          หลังยืนยันอีเมลแล้ว บัญชีต้องรอผู้ดูแลระบบอนุมัติและกำหนดบทบาทก่อนจึงจะเข้าถึงข้อมูลผู้ป่วยได้
        </p>
        <Link to="/login" className="btn btn-primary">ไปหน้าเข้าสู่ระบบ</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="สมัครบัญชีใหม่"
      intro="บัญชีที่สมัครใหม่ต้องยืนยันอีเมล และรอผู้ดูแลระบบอนุมัติก่อนใช้งานข้อมูลผู้ป่วย"
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="signup-email">อีเมล</label>
          <input id="signup-email" className="text-input" type="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="signup-password">รหัสผ่าน</label>
          <input id="signup-password" className="text-input" type="password" autoComplete="new-password"
            aria-describedby="signup-password-rules"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div id="signup-password-rules"><PasswordRules rules={passwordRules(password)} /></div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !email || !isPasswordValid(password)}>
          {busy ? "กำลังส่งคำขอ…" : "สมัครบัญชี"}
        </button>
      </form>
      {error && <Callout tone="warn" title="สมัครบัญชีไม่สำเร็จ">{error}</Callout>}
      <p className="auth-footer">มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link></p>
    </AuthCard>
  );
}
