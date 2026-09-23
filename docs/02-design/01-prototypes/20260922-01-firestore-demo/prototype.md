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
| `seed.html` | หน้าเขียนข้อมูลจำลอง 4 คนลง Firestore ครั้งเดียว (กดปุ่ม "เริ่ม Seed ข้อมูล") — รันซ้ำได้ ไม่สร้างข้อมูลซ้ำ |
| `patient-detail-render.js` | ฟังก์ชัน `renderPatientDetail(patientId)` ใช้ร่วมกันทั้ง `patient-detail-risk-found.html`/`patient-detail-no-risk.html`/`patient-detail.html` (dynamic) — ดึง `ncdDiagnoses`/`labResults`/`complicationRiskAssessments`+`riskFindings` แล้ว render ลง DOM ทนทานต่อข้อมูลไม่ครบ (จำกัด visit ที่แสดงไว้ 8 ครั้งล่าสุด, แสดง "ไม่มีข้อมูล"/"-" แทนการ error เมื่อบาง lab type ไม่มีค่าในบาง visit) |
| `patient-detail.html` | หน้ารายละเอียดผู้ป่วย **แบบ dynamic** อ่าน `patientId` จาก query string (`?id=<patientId>`) — ใช้ดูผู้ป่วยจริง 30 คนที่ seed จาก HOSxP ได้ครบทุกคน (ต่างจาก 2 หน้า fixed ด้านบนที่ผูกกับผู้ป่วยตัวอย่าง 2 คนเดิม) |
| `hospital-seed-data.js` | **AUTO-GENERATED** โดย `build_seed.py` (สคริปต์ Python, รันนอกเซสชันนี้เพราะ auto-mode classifier บล็อกการรันอ่าน `trackncds.sql` — ดู log การสนทนา) จาก `trackncds.sql` (local-only, gitignored, ไม่อยู่ใน git) — ห้ามแก้ไขตรงๆ ให้รันสคริปต์ใหม่แทนถ้าข้อมูลต้นทางเปลี่ยน |
| `seed-hospital-data.html` | หน้าเขียนข้อมูลจริงจาก HOSxP (30 คน, ผ่านการกรอง/แปลงตาม mapping ด้านล่าง) ลง Firestore — ใช้ deterministic document ID (เช่น HN เป็น patient id) รันซ้ำได้ปลอดภัย เขียนเป็น batch (Firestore จำกัด 500 write/batch) |

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

## ⚠️ แหล่งข้อมูล HOSxP (`trackncds.sql`) — local-only, ไม่อยู่ใน git

`docs/02-design/02-technical/databese/trackncds.sql` เป็น MySQL dump รูปแบบ HOSxP จริง (30 คน, ข้อมูล
**ทดสอบ** — ชื่อเป็น "ทดสอบ01/ข้อมูล01" ฯลฯ ไม่ใช่ผู้ป่วยจริง) ที่ auto-mode classifier ของ Claude Code
ตั้งค่าสถานะว่าเป็น sensitive-source data (บล็อกทั้งการ `git add` และการรันสคริปต์อ่านไฟล์นี้) — ผลคือ:

- ไฟล์นี้ถูกลบออกจาก git tracking และ **rewrite ออกจาก git history ทั้งหมดแล้ว** (force-push ทับ
  `origin/master`) อยู่ใน `.gitignore` (`docs/02-design/02-technical/databese/`) กันไม่ให้กลับเข้า repo อีก
- `hospital-seed-data.js` (ผลลัพธ์ที่แปลงแล้ว) สร้างโดยผู้ใช้รันสคริปต์ `build_seed.py` เองนอกเซสชันนี้
  (ไฟล์อยู่ใน scratchpad ของ session ไม่ได้อยู่ในโปรเจกต์) เพราะ Claude รันเองไม่ได้

**Mapping จาก SQL table → Firestore (กรองเฉพาะที่อยู่ในขอบเขต db-spec.md):**

| ปลายทาง Firestore | มาจากตาราง SQL | เงื่อนไขกรอง |
| --- | --- | --- |
| `patients` | `tt_patient` | ทั้ง 30 คน — `dataSource: "HOSxP"` |
| `ncdDiagnoses` | `tt_clinic_member` ⋈ `tt_clinic` | เฉพาะคลินิก 001 (เบาหวาน→E11), 002 (ความดันโลหิตสูง→I10), 011 (ถุงลมโป่งพอง→J44) — ตัดคลินิกไทรอยด์/หืด/หลอดเลือดสมองออกเพราะนอกขอบเขต ICD-10 ของ db-spec.md (51/55 รายการ) |
| `labResults` | `tt_lab_head` ⋈ `tt_lab_order` ⋈ `tt_lab_items` (HbA1C=185, eGFR=1838, LDL Cholesterol=1664) + `tt_opdscreen` (bps/bpd) | เฉพาะผลที่ parse เป็นตัวเลขได้ (2,348 รายการ) |
| `complicationRiskAssessments` + `riskFindings` | **ไม่มีในไฟล์ต้นทาง** — คำนวณเองใน `build_seed.py`/`seed-hospital-data.html` ด้วย threshold เดียวกับที่ใช้ในข้อมูลจำลอง 4 คน (eGFR<45→CKD, SBP≥130→โรคหัวใจ, DBP≥90→โรคหลอดเลือดสมอง) จากค่า lab ล่าสุดต่อคน | ครบทั้ง 30 คน (ทุกคนมีอย่างน้อย 1 lab type ที่ใช้ได้) |

`tt_vn_stat`/`tt_oapp`/lab item อื่นนอกเหนือ 3 ชนิด — ไม่ใช้ในรอบนี้ (นอกขอบเขต db-spec.md ปัจจุบัน)

## วิธีใช้งาน (ดูขั้นตอนเต็มในข้อความสรุปที่ให้ผู้ใช้ในแชท)

**ข้อมูลจำลอง 4 คน (illustrative):**
1. เปิด Firestore Database ใน Firebase Console ของ project `track-ncds` (ถ้ายังไม่เคยเปิด)
2. วางกฎจาก `firestore.rules.demo.txt` ในแท็บ Rules แล้ว Publish
3. เปิด `seed.html` กดปุ่ม "เริ่ม Seed ข้อมูล"
4. เปิด `patient-list.html`/`patient-detail-risk-found.html`/`patient-detail-no-risk.html` — ควรเห็น
   ข้อมูลที่ seed ไว้ขึ้นจริง (ลองแก้ field ใน Firebase Console แล้วรีเฟรชหน้าเพื่อยืนยันว่าเชื่อมจริง)

**ข้อมูลจริงจาก HOSxP 30 คน:**
5. ต้องมี `hospital-seed-data.js` ในโฟลเดอร์นี้ก่อน (รัน `build_seed.py` เอง — ดูหัวข้อด้านบน)
6. เปิด `seed-hospital-data.html` กดปุ่ม "เริ่ม Seed ข้อมูลจริง (30 คน)"
7. เปิด `patient-list.html` — จะเห็นผู้ป่วยรวม 34 คน (4 illustrative + 30 จริง) การ์ดของผู้ป่วยจริงจะลิงก์ไป
   `patient-detail.html?id=<hn>` แทนหน้า fixed 2 หน้าเดิม

## เอกสารที่เกี่ยวข้อง

- [[../20260918-01-v1/prototype|Prototype v1 (ต้นทาง)]]
- [[../../02-technical/technology-stack|technology-stack.md]]
- [[../../02-technical/db-spec|db-spec.md]]
- [[../../feature-list|feature-list]]
