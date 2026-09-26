// FR-17 — AI อธิบายผลการค้นหาด้วย HN เป็นภาษาคน (เรียกเฉพาะตอนกดค้นหา)
// ผ่าน Firebase AI Logic (Gemini Developer API) จาก Client ตรง (technology-stack.md decision area 20)
// NFR-21 — ส่งให้ AI ได้เฉพาะ HN ที่พิมพ์ + สถานะ/จำนวนที่พบ ห้ามส่งชื่อหรือข้อมูลระบุตัวตนใดๆ
// ข้อจำกัด: บังคับ NFR-21 ได้แค่ฝั่ง Client และยังไม่มี audit log ฝั่งเซิร์ฟเวอร์จนกว่าจะอยู่แพ็กเกจ Blaze

import {getAI, getGenerativeModel, GoogleAIBackend} from "firebase/ai";

import {app} from "../firebase";
import {GEMINI_MODEL_NAME} from "./config";

/** ข้อมูลทั้งหมดที่อนุญาตให้ออกไปยังบริการ AI — ไม่มี field ชื่อ/patientId โดยเจตนา */
export interface SearchSummary {
  hn: string;
  status: "invalid-hn" | "not-found" | "found";
  count: number;
}

const SYSTEM_INSTRUCTION =
  "คุณเป็นผู้ช่วยในระบบค้นหาผู้ป่วยของคลินิก อธิบายผลการค้นหาด้วยเลข HN เป็นภาษาไทยสั้นๆ 1-2 ประโยค " +
  "HN ที่ถูกต้องคือตัวเลขล้วน 7 หลัก ห้ามให้คำแนะนำทางการแพทย์ ห้ามเดาข้อมูลผู้ป่วย และห้ามตอบเรื่องอื่น";

/** สร้างข้อความที่ส่งให้ AI จาก SearchSummary เท่านั้น (NFR-21) */
export function buildSearchPrompt({hn, status, count}: SearchSummary): string {
  const outcome =
    status === "invalid-hn"
      ? "รูปแบบ HN ไม่ถูกต้อง (ไม่ใช่ตัวเลขล้วน 7 หลัก) จึงยังไม่ได้ค้นหา"
      : status === "not-found"
        ? "ค้นหาแล้วไม่พบผู้ป่วย"
        : `ค้นหาแล้วพบผู้ป่วย ${count} ราย`;
  return `ผู้ใช้พิมพ์ HN: "${hn.slice(0, 20)}" (${hn.length} ตัวอักษร)\nผลการค้นหา: ${outcome}\nอธิบายผลนี้ให้ผู้ใช้เข้าใจ และบอกว่าควรทำอะไรต่อในหน้าค้นหา`;
}

let model: ReturnType<typeof getGenerativeModel> | null = null;

export async function explainHnSearch(summary: SearchSummary): Promise<string> {
  model ??= getGenerativeModel(getAI(app, {backend: new GoogleAIBackend()}), {
    model: GEMINI_MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION,
  });
  const result = await model.generateContent(buildSearchPrompt(summary));
  return result.response.text().trim();
}
