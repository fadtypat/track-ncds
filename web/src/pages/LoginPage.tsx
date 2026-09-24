import {signInWithEmailAndPassword} from "firebase/auth";
import {useState, type FormEvent} from "react";

import {loginErrorMessage} from "../auth/errors";
import {AuthCard, Callout} from "../components/AuthCard";
import {auth} from "../firebase";
import {Link, useRouter} from "../router";

// Operation 7 — เข้าสู่ระบบ (FR-07, NFR-18) Client เรียก Firebase Authentication ตรง
export function LoginPage() {
  const {navigate} = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="เข้าสู่ระบบ" intro="เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่สมัครไว้">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="login-email">อีเมล</label>
          <input id="login-email" className="text-input" type="email" autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">รหัสผ่าน</label>
          <input id="login-password" className="text-input" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !email || !password}>
          {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
        <Link to="/forgot-password" style={{fontSize: 13, textAlign: "center"}}>ลืมรหัสผ่าน?</Link>
      </form>
      {error && <Callout tone="warn" title="เข้าสู่ระบบไม่สำเร็จ">{error}</Callout>}
      <p className="auth-footer">ยังไม่มีบัญชี? <Link to="/signup">สมัครบัญชีใหม่</Link></p>
    </AuthCard>
  );
}
