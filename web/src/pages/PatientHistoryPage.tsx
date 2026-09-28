import {useEffect, useRef, useState, type FormEvent} from "react";

import {GENERIC_ERROR} from "../auth/errors";
import {Callout} from "../components/AuthCard";
import {HistoryError} from "../history/historyErrors";
import {historySource} from "../history/historyApi";
import {validateDateRange} from "../history/historyFilters";
import {STANDARD_LAB_TYPES, type LabResultDto, type LabTestType, type NcdDiagnosisDto} from "../history/historyTypes";
import {getPatientById, type Patient} from "../patients/patients";
import {Link, useRouter} from "../router";

// Operation 1 (getNcdDiagnoses)/Operation 2 (getLabResults) — FR-01/FR-02, Phase 3
// เปิดจากปุ่ม "ดูประวัติ" บนหน้ารายชื่อผู้ป่วย (PatientListPage) ด้วย ?id={patientId}

type Status<T> = {kind: "loading"} | {kind: "ready"; data: T} | {kind: "not-found"} | {kind: "error"};

function toStatus(error: unknown): Status<never> {
  return error instanceof HistoryError && error.code === "not-found" ? {kind: "not-found"} : {kind: "error"};
}

// ปฏิทินพุทธศักราชตามที่ใช้ทั้งระบบ (เทียบ fiscalYearOf ใน labs/hba1cStats.ts)
function formatThaiDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH-u-ca-buddhist", {day: "numeric", month: "short", year: "numeric"});
}

export function PatientHistoryPage() {
  const {search} = useRouter();
  const patientId = new URLSearchParams(search).get("id") ?? "";

  const [patient, setPatient] = useState<Status<Patient>>({kind: "loading"});
  const [diagnoses, setDiagnoses] = useState<Status<NcdDiagnosisDto[]>>({kind: "loading"});
  const [labs, setLabs] = useState<Status<LabResultDto[]>>({kind: "loading"});
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [rangeInvalid, setRangeInvalid] = useState(false);

  // แยก request id ของ (ผู้ป่วย+ประวัติวินิจฉัย) กับ (ผล lab) เพราะกดค้นหาช่วงเวลาใหม่กระทบเฉพาะ lab
  const mainReq = useRef(0);
  const labsReq = useRef(0);

  function loadPatientAndDiagnoses(id: string) {
    const myId = ++mainReq.current;
    setPatient({kind: "loading"});
    setDiagnoses({kind: "loading"});
    getPatientById(id).then(
      (p) => {
        if (myId === mainReq.current) setPatient(p ? {kind: "ready", data: p} : {kind: "not-found"});
      },
      () => {
        if (myId === mainReq.current) setPatient({kind: "error"});
      },
    );
    historySource.getNcdDiagnoses({patientId: id}).then(
      (res) => {
        if (myId === mainReq.current) setDiagnoses({kind: "ready", data: res.diagnoses});
      },
      (error) => {
        if (myId === mainReq.current) setDiagnoses(toStatus(error));
      },
    );
  }

  function loadLabs(id: string, range: {start: string; end: string}) {
    const myId = ++labsReq.current;
    setLabs({kind: "loading"});
    historySource.getLabResults({patientId: id, dateStart: range.start || undefined, dateEnd: range.end || undefined}).then(
      (res) => {
        if (myId === labsReq.current) setLabs({kind: "ready", data: res.labResults});
      },
      (error) => {
        if (myId === labsReq.current) setLabs(toStatus(error));
      },
    );
  }

  useEffect(() => {
    if (!patientId) {
      setPatient({kind: "not-found"});
      setDiagnoses({kind: "not-found"});
      setLabs({kind: "not-found"});
      return;
    }
    setDateStart("");
    setDateEnd("");
    setRangeInvalid(false);
    loadPatientAndDiagnoses(patientId);
    loadLabs(patientId, {start: "", end: ""});
    // ล้างข้อมูลผู้ป่วยรายเดิมทันทีเมื่อเปลี่ยนผู้ป่วย/ออกจากหน้าจอ (TC-01-10, NFR-02)
    return () => {
      mainReq.current++;
      labsReq.current++;
      setPatient({kind: "loading"});
      setDiagnoses({kind: "loading"});
      setLabs({kind: "loading"});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  function applyRange(event: FormEvent) {
    event.preventDefault();
    const validation = validateDateRange(dateStart || undefined, dateEnd || undefined);
    if (!validation.valid) {
      setRangeInvalid(true);
      return;
    }
    setRangeInvalid(false);
    loadLabs(patientId, {start: dateStart, end: dateEnd});
  }

  function clearRange() {
    setDateStart("");
    setDateEnd("");
    setRangeInvalid(false);
    loadLabs(patientId, {start: "", end: ""});
  }

  return (
    <div className="app-bg">
      <main className="container stack gap-section">
        <header className="stack" style={{gap: 8}}>
          <Link to="/" className="type-caption">← กลับไปหน้ารายชื่อผู้ป่วย</Link>
          {patient.kind === "loading" && <h1 className="type-page-title">กำลังโหลด…</h1>}
          {patient.kind === "not-found" && (
            <Callout tone="warn" title="ไม่พบผู้ป่วย">
              {patientId ? new HistoryError("not-found").userMessage : "ไม่พบรหัสผู้ป่วยที่ต้องการเปิดดู"}
            </Callout>
          )}
          {patient.kind === "error" && (
            <Callout tone="warn" title="โหลดข้อมูลผู้ป่วยไม่สำเร็จ">{GENERIC_ERROR}</Callout>
          )}
          {patient.kind === "ready" && (
            <>
              <h1 className="type-page-title">{patient.data.fullName}</h1>
              <span className="type-eyebrow">HN {patient.data.hn}</span>
            </>
          )}
        </header>

        {patient.kind === "ready" && (
          <>
            <section className="section-card">
              <div className="section-head">
                <h2 className="type-section-title">ประวัติการวินิจฉัย</h2>
              </div>
              <DiagnosisTimeline status={diagnoses} />
            </section>

            <section className="section-card stack" style={{gap: 12}}>
              <div className="section-head">
                <h2 className="type-section-title">ผลตรวจ lab ย้อนหลัง</h2>
                <span className="type-caption">
                  แสดงเฉพาะผลตรวจมาตรฐาน (HbA1c, eGFR, LDL, ความดันโลหิต) เรียงจากเก่าไปใหม่เพื่อดูแนวโน้ม
                </span>
              </div>

              <form className="stack" style={{gap: 8}} onSubmit={applyRange} noValidate>
                <div style={{display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "flex-end"}}>
                  <div className="form-field">
                    <label htmlFor="lab-date-start">วันที่เริ่มต้น</label>
                    <input id="lab-date-start" className="text-input" type="date"
                      value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lab-date-end">วันที่สิ้นสุด</label>
                    <input id="lab-date-end" className="text-input" type="date"
                      value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">ค้นหา</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={clearRange}>ล้างตัวกรอง</button>
                </div>
              </form>
              {rangeInvalid && (
                <Callout tone="warn" title="ช่วงเวลาไม่ถูกต้อง">
                  วันที่เริ่มต้นต้องไม่อยู่หลังวันที่สิ้นสุด กรุณาตรวจสอบแล้วลองใหม่
                </Callout>
              )}
              <LabTrendSection status={labs} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function DiagnosisTimeline({status}: {status: Status<NcdDiagnosisDto[]>}) {
  if (status.kind === "loading") return <p className="type-body">กำลังโหลด…</p>;
  if (status.kind === "not-found") {
    return <Callout tone="warn" title="ไม่พบผู้ป่วย">{new HistoryError("not-found").userMessage}</Callout>;
  }
  if (status.kind === "error") {
    return <Callout tone="warn" title="โหลดประวัติการวินิจฉัยไม่สำเร็จ">{GENERIC_ERROR}</Callout>;
  }
  if (status.data.length === 0) {
    return <Callout tone="info" title="ไม่พบประวัติการวินิจฉัย" />;
  }
  return (
    <ul className="stack" style={{gap: 16, listStyle: "none", margin: 0, padding: 0}}>
      {status.data.map((d) => (
        <li key={d.id} className="stack" style={{gap: 4}}>
          <span className="type-caption">{formatThaiDate(d.diagnosedAt)}</span>
          <span className="chip chip-chronic" style={{alignSelf: "flex-start"}}>{d.icd10Code} · {d.diseaseGroup}</span>
          {d.note && <p className="type-body">{d.note}</p>}
        </li>
      ))}
    </ul>
  );
}

function LabTrendSection({status}: {status: Status<LabResultDto[]>}) {
  if (status.kind === "loading") return <p className="type-body">กำลังโหลด…</p>;
  if (status.kind === "not-found") {
    return <Callout tone="warn" title="ไม่พบผู้ป่วย">{new HistoryError("not-found").userMessage}</Callout>;
  }
  if (status.kind === "error") {
    return <Callout tone="warn" title="โหลดผลตรวจ lab ไม่สำเร็จ">{GENERIC_ERROR}</Callout>;
  }
  if (status.data.length === 0) {
    return <Callout tone="info" title="ไม่พบผลตรวจในช่วงเวลาที่เลือก" />;
  }
  return <LabTrendTable labResults={status.data} />;
}

// เรียงเก่า→ใหม่ตามซ้าย→ขวาต่อแถว (DESIGN.md "Trend table": คอลัมน์ = visit เรียงเก่า→ใหม่)
function LabTrendTable({labResults}: {labResults: LabResultDto[]}) {
  const rows = STANDARD_LAB_TYPES
    .map((testType) => ({
      testType,
      unit: labResults.find((r) => r.testType === testType)?.unit ?? "",
      values: labResults
        .filter((r) => r.testType === testType)
        .slice()
        .sort((a, b) => a.testedAt.localeCompare(b.testedAt)),
    }))
    .filter((row) => row.values.length > 0);
  const maxCols = Math.max(0, ...rows.map((row) => row.values.length));

  return (
    <div className="trend-table-wrap">
      <table className="trend-table">
        <thead>
          <tr>
            <th>รายการตรวจ</th>
            {Array.from({length: maxCols}, (_, i) => <th key={i}>ครั้งที่ {i + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.testType}>
              <td className="param-name">{row.testType}{row.unit ? ` (${row.unit})` : ""}</td>
              {Array.from({length: maxCols}, (_, i) => (
                <td key={i}>{i < row.values.length ? <LabValueCell row={row} index={i} /> : "–"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LabValueCell({row, index}: {row: {testType: LabTestType; values: LabResultDto[]}; index: number}) {
  const current = row.values[index];
  const previous = index > 0 ? row.values[index - 1] : null;
  const trend = previous ? trendOf(current.value, previous.value) : null;
  return (
    <div className="stack" style={{gap: 2}}>
      <span className="type-caption">{formatThaiDate(current.testedAt)}</span>
      <span>{current.value}</span>
      {trend && (
        <span className="trend-arrow">
          {trend === "up" ? "▲ เพิ่มขึ้น" : trend === "down" ? "▼ ลดลง" : "→ คงที่"}
        </span>
      )}
    </div>
  );
}

// ไม่ตัดสินว่า "ดีขึ้น/แย่ลง" เพราะทิศทางที่ดีขึ้นขึ้นกับตัวแปร (DESIGN.md) และยังไม่มี threshold ยืนยัน
// (spec FR-03 หมายเหตุ) — แสดงเพียงทิศทางการเปลี่ยนแปลงเป็นข้อความ+ลูกศรเท่านั้น (NFR-13: ไม่ใช้สีสื่อความหมายเดียว)
function trendOf(current: number, previous: number): "up" | "down" | "flat" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}
