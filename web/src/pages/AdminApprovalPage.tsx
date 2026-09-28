import {useCallback, useEffect, useState} from "react";

import {
  APPROVABLE_ROLES,
  APPROVAL_MESSAGES,
  ApprovalError,
  approveAccount,
  listPendingAccounts,
  type PendingAccount,
} from "../admin/accountApproval";
import {GENERIC_ERROR} from "../auth/errors";
import {Callout} from "../components/AuthCard";
import {Link} from "../router";

// FR-11 — Admin อนุมัติบัญชีที่สมัครเองพร้อมกำหนดบทบาท ตาม prototype admin-account-approval.html
// ตอนนี้เรียก Firestore จาก Client ตรงชั่วคราว ดูข้อจำกัดใน ../admin/accountApproval.ts
export function AdminApprovalPage({callerUid}: {callerUid: string}) {
  const [accounts, setAccounts] = useState<PendingAccount[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const fetchAccounts = useCallback(() => {
    listPendingAccounts().then(
      (list) => {
        setAccounts(list);
        setLoadError(false);
      },
      () => setLoadError(true),
    );
  }, []);

  useEffect(fetchAccounts, [fetchAccounts]);

  function load() {
    setAccounts(null);
    setLoadError(false);
    fetchAccounts();
  }

  return (
    <div className="app-bg">
      <main className="container stack gap-section">
        <Link to="/" className="type-caption">← กลับไปหน้าหลัก</Link>
        <header className="stack" style={{gap: 8}}>
          <h1 className="type-page-title">อนุมัติบัญชีผู้ใช้งานใหม่</h1>
          <p className="type-body" style={{maxWidth: 680}}>
            บัญชีที่สมัครเองจะยังไม่มีบทบาทและยังใช้งานไม่ได้ จนกว่าผู้ดูแลระบบจะเลือกบทบาท (แพทย์/พยาบาล)
            และอนุมัติในหน้านี้ ผู้ใช้ต้องยืนยันอีเมลของตนเองด้วยจึงจะเข้าใช้งานได้
          </p>
        </header>

        <section className="section-card">
          <div className="section-head">
            <h2 className="type-section-title">
              บัญชีที่รอการอนุมัติ{accounts ? ` (${accounts.length} บัญชี)` : ""}
            </h2>
            <span className="type-caption">
              เลือกบทบาทให้ถูกต้องก่อนกดอนุมัติ — เปลี่ยนบทบาทภายหลังได้ที่หน้าจัดการผู้ใช้งาน (FR-12)
            </span>
          </div>

          {loadError && (
            <Callout tone="warn" title="โหลดรายชื่อบัญชีไม่สำเร็จ">{GENERIC_ERROR}</Callout>
          )}
          {!loadError && accounts === null && <p className="type-body">กำลังโหลด…</p>}
          {accounts?.length === 0 && (
            <Callout tone="info" title="ไม่มีบัญชีที่รอการอนุมัติ" />
          )}
          {accounts && accounts.length > 0 && (
            <ul className="stack" style={{gap: 16, paddingLeft: 0}}>
              {accounts.map((account) => (
                <PendingAccountItem key={account.uid} account={account} callerUid={callerUid} />
              ))}
            </ul>
          )}
          <div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
              โหลดรายชื่อใหม่
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function PendingAccountItem({account, callerUid}: {account: PendingAccount; callerUid: string}) {
  const [role, setRole] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [approvedRole, setApprovedRole] = useState<string | null>(null);
  const [error, setError] = useState<{title: string; text?: string} | null>(null);

  async function approve() {
    if (!role) {
      setError({title: "กรุณาเลือกบทบาทก่อน", text: APPROVAL_MESSAGES["invalid-role"]});
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await approveAccount(account.uid, role, callerUid);
      setApprovedRole(role);
    } catch (err) {
      const text = err instanceof ApprovalError ? APPROVAL_MESSAGES[err.reason] : GENERIC_ERROR;
      setError({title: "อนุมัติบัญชีไม่สำเร็จ", text});
    } finally {
      setBusy(false);
    }
  }

  const groupName = `role-${account.uid}`;

  return (
    <li className="dx-item" style={{flexDirection: "column", alignItems: "stretch"}}>
      <div className="flex-between">
        <div className="dx-item-main">
          <span className="dx-item-name">{account.displayName}</span>
          <span className="dx-item-meta">UID {account.uid}</span>
        </div>
        {approvedRole
          ? <span className="status-pill success">อนุมัติแล้ว</span>
          : <span className="status-pill pending">รออนุมัติ</span>}
      </div>

      {approvedRole ? (
        <Callout tone="tip" title={`อนุมัติในบทบาท${approvedRole}แล้ว`}>
          ผู้ใช้เข้าสู่ระบบได้ทันทีหลังยืนยันอีเมล (ถ้ายังเปิดหน้ารออนุมัติอยู่ ให้กด "ตรวจสอบสถานะอีกครั้ง")
        </Callout>
      ) : (
        <>
          <div className="radio-group" role="radiogroup" aria-label={`เลือกบทบาทของ ${account.displayName}`}>
            {APPROVABLE_ROLES.map((option) => (
              <label key={option} className={`radio-option${role === option ? " selected" : ""}`}>
                <input type="radio" name={groupName} value={option} checked={role === option}
                  onChange={() => setRole(option)} disabled={busy} />
                <span className="radio-option-text">
                  <span className="radio-option-title">{option}</span>
                  <span className="radio-option-desc">เข้าถึงผู้ป่วยที่ได้รับมอบหมายเท่านั้น (NFR-02)</span>
                </span>
              </label>
            ))}
          </div>
          <div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void approve()} disabled={busy}>
              {busy ? "กำลังอนุมัติ…" : "อนุมัติบัญชีนี้"}
            </button>
          </div>
          {error && <Callout tone="warn" title={error.title}>{error.text}</Callout>}
        </>
      )}
    </li>
  );
}
