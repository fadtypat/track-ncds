import {useState} from "react";

import {Callout} from "../components/AuthCard";

// หน้าทดสอบเรียก AI ผ่าน OpenRouter — ใช้เฉพาะตอนพัฒนา (App.tsx โหลดหน้านี้เมื่อ import.meta.env.DEV เท่านั้น)
// คีย์อยู่ใน web/.env.local และถูกส่งจากเบราว์เซอร์ตรง จึงห้ามนำแนวทางนี้ไปใช้ในเว็บจริง —
// ถ้าจะใช้จริงต้องผ่าน /build-tech-stack และเรียกผ่าน Cloud Function ที่เก็บคีย์ไว้ฝั่งเซิร์ฟเวอร์
// ห้ามส่งข้อมูลผู้ป่วยไปยังบริการนี้ (PDPA)

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MESSAGE = "สวัสดี";

export function AiTestPage() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setReply(null);
    setError(null);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json"},
        body: JSON.stringify({model, messages: [{role: "user", content: MESSAGE}]}),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(`HTTP ${response.status}: ${body?.error?.message ?? "ไม่ทราบสาเหตุ"}`);
        return;
      }
      setReply(String(body?.choices?.[0]?.message?.content ?? "(ไม่มีข้อความตอบกลับ)"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-bg">
      <main className="container stack gap-section">
        <header className="stack" style={{gap: 8}}>
          <span className="type-eyebrow">DEV ONLY · OPENROUTER</span>
          <h1 className="type-page-title">ทดสอบเรียก AI</h1>
          <p className="type-body">
            กดปุ่มเพื่อส่งข้อความ "{MESSAGE}" ไปยังโมเดล <span className="type-code">{model}</span>
          </p>
        </header>

        <section className="section-card">
          {!apiKey ? (
            <Callout tone="warn" title="ยังไม่ได้ตั้งคีย์">
              เพิ่ม VITE_OPENROUTER_API_KEY ใน web/.env.local แล้วรัน npm run dev ใหม่
            </Callout>
          ) : (
            <div>
              <button type="button" className="btn btn-primary" onClick={() => void send()} disabled={busy}>
                {busy ? "กำลังส่ง…" : `ส่ง "${MESSAGE}"`}
              </button>
            </div>
          )}
          {error && <Callout tone="warn" title="เรียก AI ไม่สำเร็จ">{error}</Callout>}
          {reply !== null && (
            <Callout tone="info" title="คำตอบจาก AI">
              <span style={{whiteSpace: "pre-wrap"}}>{reply}</span>
            </Callout>
          )}
        </section>
      </main>
    </div>
  );
}
