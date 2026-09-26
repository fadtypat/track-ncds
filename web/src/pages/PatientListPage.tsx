import {useCallback, useEffect, useRef, useState, type FormEvent} from "react";

import {explainHnSearch} from "../ai/searchExplanation";
import {useAuth} from "../auth/AuthProvider";
import {GENERIC_ERROR} from "../auth/errors";
import {Callout} from "../components/AuthCard";
import {
  listPatients,
  searchPatientByHn,
  seedMockPatients,
  type HnSearchResult,
  type Patient,
} from "../patients/patients";
import {Link} from "../router";

// Operation 0 — รายชื่อ/ค้นหาผู้ป่วย (FR-05, FR-06) ตาม prototype patient-list.html
// ตั้งแต่ 2026-09-25 ทุกบทบาทเห็นผู้ป่วยทุกราย (ACL.md) — badge/chip ความเสี่ยงและโรคจะเพิ่มใน Phase 3/4
export function PatientListPage({displayName, role}: {displayName: string; role: string}) {
  const {logout} = useAuth();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const isAdmin = role === "admin";

  const fetchPatients = useCallback(() => {
    listPatients().then(
      (list) => {
        setPatients(list);
        setLoadError(false);
      },
      () => setLoadError(true),
    );
  }, []);

  useEffect(fetchPatients, [fetchPatients]);

  return (
    <div className="app-bg">
      <main className="container stack gap-section">
        <header className="stack" style={{gap: 8}}>
          <div className="flex-between">
            <span className="type-eyebrow">ผู้ใช้งาน: {displayName} · {role}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>ออกจากระบบ</button>
          </div>
          <h1 className="type-page-title">ผู้ป่วย NCD</h1>
          <p className="type-body" style={{maxWidth: 640}}>
            ค้นหาเฉพาะรายด้วยเลข HN ตัวเลขล้วน 7 หลัก หรือเลื่อนดูรายชื่อผู้ป่วยทั้งหมดด้านล่างได้โดยไม่ต้องค้นหาก่อน
          </p>
          {isAdmin && (
            <div style={{display: "flex", gap: "var(--space-2)", flexWrap: "wrap"}}>
              <Link to="/admin/approvals" className="btn btn-secondary btn-sm">อนุมัติบัญชีผู้ใช้งานใหม่</Link>
            </div>
          )}
        </header>

        <section className="stat-grid">
          <div className="stat-tile sky">
            <span className="stat-label">ผู้ป่วย NCD ทั้งหมด</span>
            <span className="stat-value">{patients ? `${patients.length} คน` : "–"}</span>
          </div>
        </section>

        <HnSearch />

        <section className="stack" style={{gap: 12}}>
          <h2 className="type-section-title">
            รายชื่อผู้ป่วยทั้งหมด{patients ? ` (${patients.length} คน)` : ""}
          </h2>
          {loadError && (
            <Callout tone="warn" title="โหลดรายชื่อผู้ป่วยไม่สำเร็จ">{GENERIC_ERROR}</Callout>
          )}
          {!loadError && patients === null && <p className="type-body">กำลังโหลด…</p>}
          {patients?.length === 0 && (
            <Callout tone="info" title="ยังไม่มีผู้ป่วยในระบบ">
              {isAdmin ? "เพิ่มผู้ป่วยจำลองด้านล่างเพื่อใช้ทดสอบ" : "กรุณาติดต่อผู้ดูแลระบบ"}
            </Callout>
          )}
          {isAdmin && patients !== null && <SeedMockPatients onDone={fetchPatients} />}
          {patients && patients.length > 0 && <PatientGrid patients={patients} />}
        </section>
      </main>
    </div>
  );
}

// ผู้ป่วยจำลอง 5 ราย (NFR-01) — Admin เท่านั้น เพิ่มเฉพาะ HN ที่ยังไม่มี
function SeedMockPatients({onDone}: {onDone: () => void}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{tone: "tip" | "warn"; title: string} | null>(null);

  async function seed() {
    setBusy(true);
    try {
      const added = await seedMockPatients();
      setMessage({tone: "tip", title: added ? `เพิ่มผู้ป่วยจำลอง ${added} รายแล้ว` : "มีผู้ป่วยจำลองครบแล้ว"});
      onDone();
    } catch {
      setMessage({tone: "warn", title: GENERIC_ERROR});
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack" style={{gap: 8}}>
      <div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void seed()} disabled={busy}>
          เพิ่มผู้ป่วยจำลองสำหรับทดสอบ (HN 9900001–9900005)
        </button>
      </div>
      {message && <Callout tone={message.tone} title={message.title} />}
    </div>
  );
}

// FR-06 ตรวจ/ค้นหา HN ได้ทั้งตอนหยุดพิมพ์และตอนกดค้นหา — FR-17 เรียก AI อธิบายผลเฉพาะตอนกดค้นหา
const SEARCH_DEBOUNCE_MS = 500;

function HnSearch() {
  const [hn, setHn] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<HnSearchResult | "error" | null>(null);
  const [ai, setAi] = useState<{status: "loading"} | {status: "done"; text: string} | {status: "error"} | null>(null);
  // ทิ้งผลของคำขอที่เก่ากว่าคำขอล่าสุด (พิมพ์ต่อระหว่างรอผล)
  const latest = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (input: string, withAi: boolean) => {
    const id = ++latest.current;
    setBusy(true);
    setAi(withAi ? {status: "loading"} : null);
    let found: HnSearchResult;
    try {
      found = await searchPatientByHn(input);
    } catch {
      if (id === latest.current) {
        setResult("error");
        setAi(null);
        setBusy(false);
      }
      return;
    }
    if (id !== latest.current) return;
    setResult(found);
    setBusy(false);
    if (!withAi) return;
    // ส่งเฉพาะ HN + สถานะ/จำนวน (NFR-21) — AI ล้มเหลวไม่กระทบผลค้นหา (FR-17)
    const count = found.status === "found" ? found.patients.length : 0;
    try {
      const text = await explainHnSearch({hn: input.trim(), status: found.status, count});
      if (id === latest.current) setAi({status: "done", text});
    } catch {
      if (id === latest.current) setAi({status: "error"});
    }
  }, []);

  useEffect(() => {
    if (!hn.trim()) return;
    debounce.current = setTimeout(() => void search(hn, false), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounce.current);
  }, [hn, search]);

  function onChange(value: string) {
    setHn(value);
    if (!value.trim()) {
      // ล้างช่องแล้ว ทิ้งผลค้างทั้งหมด
      latest.current++;
      setResult(null);
      setAi(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    // กดค้นหาก่อนครบเวลา debounce — ยกเลิกการค้นหาตอนหยุดพิมพ์ ไม่ให้มาทับผล AI
    clearTimeout(debounce.current);
    void search(hn, true);
  }

  return (
    <section className="section-card">
      <div className="section-head">
        <h2 className="type-section-title">ค้นหาด้วยเลข HN</h2>
        <span className="type-caption">
          พิมพ์เลข HN ตัวเลขล้วน 7 หลัก ระบบค้นหาให้เมื่อหยุดพิมพ์ กด "ค้นหา" เพื่อให้ AI อธิบายผล — ไม่บังคับต้องค้นหาก่อน
          เลื่อนดูรายชื่อทั้งหมดด้านล่างได้ทันที
        </span>
      </div>
      <form className="search-field" style={{maxWidth: "none"}} onSubmit={onSubmit} noValidate>
        <label htmlFor="patient-search">เลขประจำตัวผู้ป่วย (HN)</label>
        <div style={{display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center"}}>
          <input id="patient-search" className="search-input" style={{maxWidth: 220}} type="text"
            inputMode="numeric" placeholder="เช่น 6500123" autoComplete="off"
            value={hn} onChange={(e) => onChange(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "กำลังค้นหา…" : "ค้นหา"}</button>
        </div>
        <span className="type-caption">รองรับเฉพาะตัวเลขล้วน 7 หลักเท่านั้น (ไม่รองรับการค้นหาด้วยชื่อ)</span>
      </form>
      {result === "error" && <Callout tone="warn" title="ค้นหาไม่สำเร็จ">{GENERIC_ERROR}</Callout>}
      {result !== null && result !== "error" && result.status === "invalid-hn" && (
        <Callout tone="warn" title="HN ไม่ครบ 7 หลัก">กรุณากรอกเลข HN เป็นตัวเลขล้วน 7 หลักแล้วค้นหาใหม่</Callout>
      )}
      {result !== null && result !== "error" && result.status === "not-found" && (
        <Callout tone="note" title="ไม่พบผู้ป่วย">ไม่พบผู้ป่วยที่มี HN นี้ กรุณาตรวจสอบแล้วค้นหาใหม่</Callout>
      )}
      {ai?.status === "loading" && <p className="type-caption">AI กำลังอธิบายผลการค้นหา…</p>}
      {ai?.status === "done" && (
        <Callout tone="info" title="คำอธิบายจาก AI">
          {ai.text}
          <br />
          <span className="type-caption">ข้อความจาก AI ใช้ประกอบเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์</span>
        </Callout>
      )}
      {ai?.status === "error" && <p className="type-caption">AI ไม่พร้อมใช้งานในขณะนี้ — ผลการค้นหาด้านบนยังใช้ได้ตามปกติ</p>}
      {result !== null && result !== "error" && result.status === "found" && <PatientGrid patients={result.patients} />}
    </section>
  );
}

function PatientGrid({patients}: {patients: Patient[]}) {
  return (
    <div className="patient-grid">
      {patients.map((patient) => (
        <article key={patient.patientId} className="patient-card">
          <div className="patient-card-top">
            <div>
              <div className="patient-card-name">{patient.fullName}</div>
              <div className="patient-card-meta">HN {patient.hn}</div>
            </div>
          </div>
          <div className="patient-card-action">
            {/* ประวัติวินิจฉัย/lab (Operation 1/2) และ audit log จะมาใน Phase 3 */}
            <button type="button" className="btn btn-primary btn-sm" disabled title="เปิดใช้ใน Phase 3">
              เปิดประวัติ (Phase 3)
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
