import {sendEmailVerification, type User} from "firebase/auth";
import {useState} from "react";

import {useAuth} from "../auth/AuthProvider";
import {GENERIC_ERROR, TOO_MANY_ATTEMPTS} from "../auth/errors";
import {AuthCard, Callout} from "../components/AuthCard";
import {Link} from "../router";
import {FirebaseError} from "firebase/app";

// FR-09 — เข้าสู่ระบบได้แต่ยังไม่ยืนยันอีเมล: บล็อกทุกฟีเจอร์และให้ยืนยันก่อน (T-1-05)
export function VerifyEmailPage({user}: {user: User}) {
  const {refresh, logout} = useAuth();
  const [message, setMessage] = useState<{tone: "info" | "warn"; text: string} | null>(null);
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    try {
      // ผู้ใช้เข้าสู่ระบบแล้ว ส่งซ้ำจาก Client ได้โดยไม่เสี่ยงเปิดเผยว่าอีเมลมีบัญชี
      await sendEmailVerification(user);
      setMessage({tone: "info", text: "ส่งอีเมลยืนยันอีกครั้งแล้ว"});
    } catch (err) {
      const tooMany = err instanceof FirebaseError && err.code === "auth/too-many-requests";
      setMessage({tone: "warn", text: tooMany ? TOO_MANY_ATTEMPTS : GENERIC_ERROR});
    } finally {
      setBusy(false);
    }
  }

  async function checkAgain() {
    setBusy(true);
    await refresh();
    setBusy(false);
  }

  return (
    <AuthCard title="กรุณายืนยันอีเมล">
      <Callout tone="note" title="ยังไม่ได้ยืนยันอีเมล">
        เปิดลิงก์ในอีเมลที่ส่งไปยัง {user.email} ก่อนใช้งานระบบ
      </Callout>
      <button className="btn btn-primary" onClick={checkAgain} disabled={busy}>ยืนยันแล้ว ตรวจสอบอีกครั้ง</button>
      <button className="btn btn-secondary" onClick={resend} disabled={busy}>ส่งอีเมลยืนยันอีกครั้ง</button>
      {message && <Callout tone={message.tone} title={message.text} />}
      <p className="auth-footer"><button className="btn btn-secondary btn-sm" onClick={logout}>ออกจากระบบ</button></p>
    </AuthCard>
  );
}

// FR-08 — ยืนยันอีเมลแล้วแต่ผู้ดูแลยังไม่กำหนด role/isActive
export function PendingApprovalPage() {
  const {refresh, logout} = useAuth();
  return (
    <AuthCard title="บัญชีรอการอนุมัติ">
      <Callout tone="note" title="รอผู้ดูแลระบบอนุมัติ">
        ผู้ดูแลระบบต้องกำหนดบทบาทและเปิดใช้งานบัญชีก่อน คุณจึงจะเข้าถึงข้อมูลผู้ป่วยได้
      </Callout>
      <button className="btn btn-primary" onClick={refresh}>ตรวจสอบสถานะอีกครั้ง</button>
      <p className="auth-footer"><button className="btn btn-secondary btn-sm" onClick={logout}>ออกจากระบบ</button></p>
    </AuthCard>
  );
}

// จุดเริ่มของ Phase 2 (ค้นหา/เลือกผู้ป่วย) — ตอนนี้ยืนยันแค่ว่าผ่านการยืนยันตัวตนครบแล้ว
export function HomePage({displayName, role}: {displayName: string; role: string}) {
  const {logout} = useAuth();
  return (
    <AuthCard title={`สวัสดี ${displayName}`}>
      <Callout tone="tip" title={`เข้าสู่ระบบในบทบาท${role}`}>
        หน้าค้นหาและรายชื่อผู้ป่วยจะเพิ่มใน Phase 2
      </Callout>
      {role === "admin" && <Link to="/admin/approvals" className="btn btn-primary">อนุมัติบัญชีผู้ใช้งานใหม่</Link>}
      <button className="btn btn-secondary" onClick={logout}>ออกจากระบบ</button>
    </AuthCard>
  );
}
