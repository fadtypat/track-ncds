# Firestore Demo — NCDs History & Complication Risk

**สถานะ: technical spike/demo เท่านั้น ไม่ใช่ Prototype เวอร์ชันมาตรฐานของ pipeline เอกสาร**
ไม่ควรถูกตรวจสอบโดย `prototype-auditor`/`build-prototype` เหมือน
[[../20260918-01-v1/prototype|Prototype v1]] เพราะไฟล์นี้เพิ่มโค้ดเชื่อมต่อ backend จริง (Firestore) ซึ่ง
เกินขอบเขตของ "Clickable HTML Prototype" ปกติ (mockup ล้วนไม่มี backend) — สร้างขึ้นตามคำขอผู้ใช้เพื่อ
สาธิตการเชื่อมต่อ Firestore project `track-ncds` จริงแบบเร็วที่สุด (client อ่าน/เขียน Firestore ตรง
ไม่ผ่าน Cloud Functions)

## ที่มา

คัดลอกจาก [[../20260918-01-v1/prototype|Prototype v1]] (`patient-list.html`,
`patient-detail-risk-found.html`, `patient-detail-no-risk.html`, `style.css`, และไฟล์อื่นที่เหลือ
สำหรับ nav link ให้ครบ) แล้วแก้ 3 ไฟล์แรกให้ดึง/แสดงข้อมูลจาก Firestore จริงแทนอาร์เรย์ hardcode
ไฟล์อื่น (`access-denied.html`, `pdpa-*.html`, `index.html`) **ไม่ได้แก้ไข** ยังเป็น static mockup เดิม

## ⚠️ คำเตือนสำคัญ — ต่างจากสถาปัตยกรรมที่ตัดสินใจไว้ใน technology-stack.md/db-spec.md

[[../../02-technical/technology-stack|technology-stack.md]] decision area 3 กำหนดให้ Operation 1–6
(ข้อมูลผู้ป่วยรายบุคคล: ประวัติวินิจฉัย/ผล lab/ผลวิเคราะห์ความเสี่ยง) ต้องผ่าน **Cloud Functions** เสมอ
เพื่อบังคับ audit logging แบบ fail-safe (NFR-06) และ [[../../02-technical/db-spec|db-spec.md]] ระบุ
Security Rules ของ `ncdDiagnoses`/`labResults`/`complicationRiskThresholds`/
`complicationRiskAssessments`/`riskFindings` ไว้ชัดเจนว่า `allow read, write: if false;` สำหรับ Client

**ไฟล์ในโฟลเดอร์นี้ข้ามข้อกำหนดทั้งหมดข้างต้นโดยเจตนา** เพื่อความเร็วของ demo — ใช้
`firestore.rules.demo.txt` (เปิด read/write แบบไม่ต้อง sign-in เลย) แทนกฎ production และ Client อ่าน
ทุก collection ตรงผ่าน Firebase SDK ไม่มี Cloud Functions/audit log ใดๆ **ห้ามนำแนวทางนี้ไปใช้กับข้อมูล
ผู้ป่วยจริงเด็ดขาด** — ถ้าต้องการ implement จริง ต้องกลับไปตามสถาปัตยกรรมใน technology-stack.md/db-spec.md

## ไฟล์ที่เพิ่มใหม่

| ไฟล์ | หน้าที่ |
| --- | --- |
| `firebase-init.js` | init Firebase App + Firestore ด้วย config ของ project `track-ncds` (compat SDK ผ่าน CDN เพราะไฟล์เป็น static HTML ไม่มี build step — เลี่ยงปัญหา CORS ของ ES module บน `file://`) |
| `firestore.rules.demo.txt` | Security Rules แบบ demo (เปิดกว้าง) พร้อมคำเตือน — ต้องคัดลอกไปวางใน Firebase Console เองด้วยตนเอง (agent ไม่มีสิทธิ์เข้า Firebase Console ของผู้ใช้) |
| `seed.html` | หน้าเขียนข้อมูลจำลองลง Firestore ครั้งเดียว (กดปุ่ม "เริ่ม Seed ข้อมูล") — รันซ้ำได้ ไม่สร้างข้อมูลซ้ำ |
| `patient-detail-render.js` | ฟังก์ชัน `renderPatientDetail(patientId)` ใช้ร่วมกันทั้ง 2 หน้า detail — ดึง `ncdDiagnoses`/`labResults`/`complicationRiskAssessments`+`riskFindings` แล้ว render ลง DOM |

## Collection/Field ที่ใช้จริงใน Firestore (ตรงกับชื่อใน db-spec.md ยกเว้นที่ระบุว่าเป็น demo-only)

- `patients/{id}` — `hn`, `fullName`, `dataSource` ตรงกับ db-spec.md ทุก field **บวก field
  demo-only เพิ่มเติม** `demoMeta`, `demoAvatarInitials`, `demoRiskLevel`, `demoRiskLabel`,
  `demoChips`, `demoDetailHref` — ใช้เฉพาะให้หน้า `patient-list.html` แสดงการ์ดได้โดยไม่ต้อง query
  `complicationRiskAssessments` ของทุกคน (production ต้องคำนวณผ่าน Cloud Functions ตามที่ออกแบบไว้จริง
  ไม่ใช่ denormalize แบบนี้)
- `ncdDiagnoses/{id}` — `patientId`, `icd10Code`, `diseaseGroup`, `diagnosedAt`, `dataSource` ตรงกับ
  db-spec.md ทุก field
- `labResults/{id}` — `patientId`, `testType`, `value`, `unit`, `testedAt`, `dataSource` ตรงกับ
  db-spec.md ทุก field (รวม `ความดันโลหิตซิสโตลิก`/`ความดันโลหิตไดแอสโตลิก` เป็นคนละ testType ตาม spec
  แล้วให้ `patient-detail-render.js` รวมแสดงเป็น "SBP/DBP" คู่เดียวบนหน้าจอ)
- `complicationRiskAssessments/{id}` — `patientId`, `requestedByUserId`, `assessedAt`, `hasRisk` ตรงกับ
  db-spec.md ทุก field
- `complicationRiskAssessments/{id}/riskFindings/{id}` — `complicationType`, `comparatorSnapshot`,
  `thresholdValueSnapshot`, `isRiskMet`, `riskLevel` ตรงกับ db-spec.md **ยกเว้น** `riskLevel` ที่ใน demo
  นี้ใช้ค่า `veryhigh`/`high`/`moderate`/`low` (ตรงกับชื่อ CSS class ใน `style.css` เลย) แทนค่า
  "ต่ำ"/"กลาง"/"สูง" ตาม enum ใน db-spec.md — เป็นความไม่ตรงกันที่มีอยู่แล้วในตัว
  [[../20260918-01-v1/prototype|Prototype v1]] เดิม (badge "สูงมาก" ไม่อยู่ใน enum 3 ระดับของ db-spec)
  ไม่ใช่ความคลาดเคลื่อนใหม่ที่เกิดจาก demo นี้ — และ field `demoPercent` (ตัวเลข % ของ progress bar) เป็น
  demo-only เพิ่มเติม ไม่อยู่ใน db-spec.md เช่นกัน (RiskFinding ไม่มี field เปอร์เซ็นต์)

## วิธีใช้งาน (ดูขั้นตอนเต็มในข้อความสรุปที่ให้ผู้ใช้ในแชท)

1. เปิด Firestore Database ใน Firebase Console ของ project `track-ncds` (ถ้ายังไม่เคยเปิด)
2. วางกฎจาก `firestore.rules.demo.txt` ในแท็บ Rules แล้ว Publish
3. เปิด `seed.html` กดปุ่ม "เริ่ม Seed ข้อมูล"
4. เปิด `patient-list.html`/`patient-detail-risk-found.html`/`patient-detail-no-risk.html` — ควรเห็น
   ข้อมูลที่ seed ไว้ขึ้นจริง (ลองแก้ field ใน Firebase Console แล้วรีเฟรชหน้าเพื่อยืนยันว่าเชื่อมจริง)

## เอกสารที่เกี่ยวข้อง

- [[../20260918-01-v1/prototype|Prototype v1 (ต้นทาง)]]
- [[../../02-technical/technology-stack|technology-stack.md]]
- [[../../02-technical/db-spec|db-spec.md]]
- [[../../feature-list|feature-list]]
