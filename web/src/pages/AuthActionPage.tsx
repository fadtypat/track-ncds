import {applyActionCode, confirmPasswordReset, verifyPasswordResetCode} from "firebase/auth";
import {FirebaseError} from "firebase/app";
import {useEffect, useState, type FormEvent} from "react";

import {GENERIC_ERROR} from "../auth/errors";
import {isPasswordValid, passwordRules} from "../auth/passwordPolicy";
import {AuthCard, Callout, PasswordRules} from "../components/AuthCard";
import {auth} from "../firebase";
import {Link} from "../router";

// ปลายทางลิงก์ในอีเมลของ Firebase (ตั้ง custom action URL เป็น /auth/action ใน Console)
export function AuthActionPage() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const oobCode = params.get("oobCode") ?? "";

  if (mode === "resetPassword") return <ResetPassword oobCode={oobCode} />;
  if (mode === "verifyEmail") return <VerifyEmail oobCode={oobCode} />;
  return (
    <AuthCard title="ลิงก์ไม่ถูกต้อง">
      <Callout tone="warn" title="ไม่รู้จักลิงก์นี้">กรุณาเปิดลิงก์จากอีเมลล่าสุดอีกครั้ง</Callout>
      <Link to="/login" className="btn btn-primary">ไปหน้าเข้าสู่ระบบ</Link>
    </AuthCard>
  );
}

const EXPIRED_LINK = "ลิงก์หมดอายุหรือถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่";

function VerifyEmail({oobCode}: {oobCode: string}) {
  const [status, setStatus] = useState<"working" | "done" | "failed">("working");

  useEffect(() => {
    applyActionCode(auth, oobCode).then(
      () => setStatus("done"),
      () => setStatus("failed"),
    );
  }, [oobCode]);

  return (
    <AuthCard title="ยืนยันอีเมล">
      {status === "working" && <p className="type-body">กำลังยืนยันอีเมล…</p>}
      {status === "done" && (
        <Callout tone="tip" title="ยืนยันอีเมลเรียบร้อย">
          บัญชียังต้องรอผู้ดูแลระบบอนุมัติก่อนเข้าถึงข้อมูลผู้ป่วย
        </Callout>
      )}
      {status === "failed" && <Callout tone="warn" title="ยืนยันอีเมลไม่สำเร็จ">{EXPIRED_LINK}</Callout>}
      <Link to="/login" className="btn btn-primary">ไปหน้าเข้าสู่ระบบ</Link>
    </AuthCard>
  );
}

// Operation 9b — ตั้งรหัสผ่านใหม่ Client เรียก Authentication ตรง (NFR-17 backstop = Identity Platform)
function ResetPassword({oobCode}: {oobCode: string}) {
  const [codeState, setCodeState] = useState<"checking" | "valid" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    verifyPasswordResetCode(auth, oobCode).then(
      () => setCodeState("valid"),
      () => setCodeState("invalid"),
    );
  }, [oobCode]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : "";
      if (code === "auth/password-does-not-meet-requirements" || code === "auth/weak-password") {
        setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรและตัวเลข");
      } else if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
        setError(EXPIRED_LINK);
      } else {
        setError(GENERIC_ERROR);
      }
    } finally {
      setBusy(false);
    }
  }

  if (codeState === "checking") {
    return <AuthCard title="ตั้งรหัสผ่านใหม่"><p className="type-body">กำลังตรวจสอบลิงก์…</p></AuthCard>;
  }
  if (codeState === "invalid") {
    return (
      <AuthCard title="ตั้งรหัสผ่านใหม่">
        <Callout tone="warn" title="ใช้ลิงก์นี้ไม่ได้">{EXPIRED_LINK}</Callout>
        <Link to="/forgot-password" className="btn btn-primary">ขอลิงก์ใหม่</Link>
      </AuthCard>
    );
  }
  if (done) {
    return (
      <AuthCard title="ตั้งรหัสผ่านใหม่แล้ว">
        <Callout tone="tip" title="เปลี่ยนรหัสผ่านเรียบร้อย">เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที</Callout>
        <Link to="/login" className="btn btn-primary">ไปหน้าเข้าสู่ระบบ</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="ตั้งรหัสผ่านใหม่">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="reset-password">รหัสผ่านใหม่</label>
          <input id="reset-password" className="text-input" type="password" autoComplete="new-password"
            aria-describedby="reset-password-rules"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div id="reset-password-rules"><PasswordRules rules={passwordRules(password)} /></div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !isPasswordValid(password)}>
          {busy ? "กำลังบันทึก…" : "บันทึกรหัสผ่านใหม่"}
        </button>
      </form>
      {error && <Callout tone="warn" title="ตั้งรหัสผ่านไม่สำเร็จ">{error}</Callout>}
    </AuthCard>
  );
}
