# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## สถานะของโปรเจกต์

โปรเจกต์นี้เป็นพื้นที่ทำงานแบบ **docs-first** — งานหลักคือเอกสาร requirements/design/testing ใน `docs/` (Obsidian vault) ยังไม่มีแอปพลิเคชันจริงที่ build/deploy ได้ ความคืบหน้าของแต่ละขั้นตอนไม่เท่ากัน (เช่น `01-requirements/02-plan/` และ `03-task/` ยังว่าง) ให้ตรวจสถานะจริงของแต่ละไฟล์ก่อนอ้างอิงหรือแก้ไขเสมอ อย่าเชื่อคำอธิบายสถานะในเอกสารฉบับเก่า

**Tech stack ตัดสินใจแล้ว** ใน `docs/02-design/02-technical/technology-stack.md` (Firebase-native: React + TypeScript บน Firebase Hosting, Cloud Functions 2nd gen แบบ Node.js + TypeScript, Cloud Firestore Native mode, Firebase Auth + Custom Claims) ให้อ่านไฟล์นั้นก่อนตัดสินใจเรื่องเทคโนโลยีใดๆ และเมื่อ `technology-stack.md` มีเนื้อหาแล้ว agent ในสาย technical spec จะเติมรายละเอียดเทคโนโลยีจริงลงเอกสารอื่นได้

โค้ดที่มีอยู่ตอนนี้มีเพียง:
- **Firestore demo** (`docs/02-design/01-prototypes/20260922-01-firestore-demo/`) — static HTML ที่อ่าน/เขียน Firestore project `track-ncds` ตรงผ่าน Firebase compat SDK จาก CDN (ไม่มี build step) **ตั้งใจข้ามสถาปัตยกรรมใน technology-stack.md** (ไม่ผ่าน Cloud Functions, ไม่มี audit log, ใช้ rules แบบเปิดกว้าง) ดูข้อจำกัดทั้งหมดใน `prototype.md` ของโฟลเดอร์นั้น ห้ามนำแนวทางนี้ไปใช้เป็นต้นแบบของ production และ demo นี้ไม่ใช่ prototype มาตรฐานของ pipeline (`prototype-auditor`/`build-prototype` ไม่ควรตรวจ/แก้)
- **Firebase scaffold ที่ root** (`functions/`, `dataconnect/`, `firestore.rules`, `firestore.indexes.json`) — สร้างจาก `firebase init` แต่ยังไม่มี `firebase.json`/`.firebaserc` คำสั่ง emulator/deploy จึงยังใช้ไม่ได้จนกว่าจะ init ให้ครบ `functions/src/index.ts` ยังไม่มี function จริง
  - `dataconnect/` เป็น schema ตัวอย่างที่ generate มา (User/VitalsLog/Medication บน Cloud SQL PostgreSQL) **ไม่ตรงกับ `db-spec.md` และขัดกับการเลือก Firestore** ใน technology-stack.md — อย่าอ้างอิงเป็นโมเดลข้อมูลของระบบ
  - `firestore.rules` ที่ root เป็น test-mode rule (เปิด read/write ทั้งหมด หมดอายุ 2026-10-22) ไม่ใช่กฎตาม `db-spec.md`

## คำสั่งที่ใช้

ไม่มี lint หรือ test suite ในโปรเจกต์

- เปิดดูเอกสาร/prototype ผ่าน browser: ใช้ preview config `docs-static` ใน `.claude/launch.json` (เสิร์ฟโฟลเดอร์ `docs/` ที่พอร์ต 4873 ด้วย `http-server`) — เช่น `http://localhost:4873/02-design/01-prototypes/20260922-01-firestore-demo/patient-list.html`
- Cloud Functions (รันในโฟลเดอร์ `functions/`, Node engine ตั้งไว้ที่ 24): `npm run build` (tsc → `lib/`), `npm run build:watch`; `npm run serve`/`npm run deploy` ต้องมี `firebase.json` ก่อน

## สถานะของแต่ละส่วน (ตรวจล่าสุด 2026-09-23 — ตรวจซ้ำก่อนอ้างอิงเสมอ)

| ส่วน | สถานะ |
| --- | --- |
| Spec (`01-spec/`) | มี 3 ไฟล์: NCD history/lab/risk (20260917), PDPA (20260921), operational-quality NFR (20260922) |
| `backlog.md` | FR-01–FR-06 (สูงทั้งหมด), NFR-01–NFR-16 — ทุกรายการสถานะ `Backlog` ยังไม่มีรายการใดเริ่มพัฒนา |
| `feature-list.md` / `user-journey.md` / `DESIGN.md` | มีเนื้อหาแล้ว |
| Technical (`architecture`, `api-spec`, `db-spec`, `detailed-design/` 4 ฟีเจอร์, `nfr-review`, `technology-stack`) | มีเนื้อหาครบและผูก Firebase แล้ว |
| Testing (`acceptance-criteria`, `test-plan`, `test-cases/` 5 ไฟล์) | มีเนื้อหาแล้ว |
| `02-test-result/`, `04-retrospectives/`, `00-archived/` | ว่าง |
| `01-requirements/02-plan/`, `03-task/` | ว่าง — ยังไม่ได้รัน `/sync-phase-plan` |
| Prototype `20260918-01-v1` | Clickable HTML mockup มาตรฐานของ pipeline (ข้อมูล hardcode) |
| Prototype `20260922-01-firestore-demo` | Technical spike ต่อ Firestore จริง อยู่นอก pipeline (ดูหัวข้อสถานะโปรเจกต์ด้านบน) |
| Firebase scaffold ที่ root | init ไม่ครบ (ไม่มี `firebase.json`/`.firebaserc`) และยังไม่ถูก track ใน git |

## Firestore collections

ชื่อ collection/document path จริงให้ยึดตามหัวข้อ "โครงสร้างเอกสารจริงใน Cloud Firestore" ใน `docs/02-design/02-technical/db-spec.md` (ถ้าไม่ตรงกับรายการนี้ ให้ถือ db-spec เป็นหลัก):

```
users/{userId}                                   User (document ID = Firebase Auth UID, role อยู่ใน Custom Claims)
patients/{patientId}                             Patient
patientAssignments/{userId}_{patientId}          PatientAssignment (composite ID, denormalize patientHn/patientFullName)
ncdDiagnoses/{diagnosisId}                       NcdDiagnosis (top-level + field patientId)
labResults/{labResultId}                         LabResult (top-level + field patientId)
complicationRiskThresholds/{thresholdId}         ComplicationRiskThreshold
complicationRiskAssessments/{assessmentId}       ComplicationRiskAssessment
  └─ riskFindings/{riskFindingId}                RiskFinding (subcollection)
auditLogRecords/{auditLogRecordId}               AuditLogRecord (เขียนผ่าน Cloud Functions/Admin SDK เท่านั้น)
dataSubjectRequests/{requestId}                  DataSubjectRequest
retentionPolicies/{policyId}                     RetentionPolicy
```

ข้อมูลรายบุคคลของผู้ป่วย (`ncdDiagnoses`, `labResults`, `complicationRiskThresholds`, `complicationRiskAssessments`/`riskFindings`) ออกแบบให้ Security Rules ปฏิเสธ Client ทั้งหมด (`allow read, write: if false`) และเข้าถึงผ่าน callable Cloud Functions ที่บันทึก audit log แบบ fail-safe ก่อนเสมอ (NFR-06) มีเพียง Operation 0 (รายชื่อผู้ป่วยในความดูแล ผ่าน `patientAssignments`) ที่ Client อ่านตรงได้

Firestore demo ใช้ชื่อ collection ชุดเดียวกัน แต่เพิ่ม field เฉพาะ demo (`demo*` ใน `patients`, `demoPercent` ใน `riskFindings`) และใช้ `riskLevel` เป็น `veryhigh`/`high`/`moderate`/`low` แทน enum ต่ำ/กลาง/สูงของ db-spec — ห้ามนำ field หรือค่าเหล่านี้ไปใส่ในเอกสาร design

## ข้อห้ามของโปรเจกต์

**ข้อมูลและ git**
- ห้ามนำ `docs/02-design/02-technical/databese/` (MySQL dump จาก HOSxP `trackncds.sql`) กลับเข้า git — ไฟล์นี้ถูก rewrite ออกจาก history แล้ว และอยู่ใน `.gitignore`
- ห้าม commit หรือแก้ `docs/02-design/01-prototypes/20260922-01-firestore-demo/hospital-seed-data.js` ตรงๆ — เป็นไฟล์ AUTO-GENERATED จาก dump ข้างต้นด้วย `build_seed.py` ที่ผู้ใช้รันเองนอกโปรเจกต์ ให้ใช้ภายในเครื่องเท่านั้น
- ห้าม commit `.firebaserc`, service account key หรือไฟล์ credential ใดๆ — ตรวจ `.gitignore` ก่อนเพิ่มไฟล์ config ของ Firebase
- ห้ามใช้ข้อมูลผู้ป่วยจริงกับระบบในตอนนี้ — ข้อมูลทั้งหมดต้องเป็นข้อมูลจำลอง/ทดสอบ (NFR-01)

**สถาปัตยกรรม**
- ห้ามนำแนวทางของ Firestore demo (Client อ่านข้อมูลผู้ป่วยตรง, rules เปิดกว้าง, ไม่มี audit log) ไปใช้กับ production หรือข้อมูลจริง
- ห้าม deploy `firestore.rules` แบบ test-mode ที่ root หรือ `firestore.rules.demo.txt` เป็นกฎจริง — กฎ production ต้องตรงกับ `db-spec.md` และมี automated test ผ่าน Emulator ตาม NFR-14
- ห้ามใช้ `dataconnect/` เป็นโมเดลข้อมูล และห้ามใส่ tech stack ใหม่นอก `technology-stack.md` โดยไม่ผ่าน `/build-tech-stack`
- ห้ามใช้สีเป็นสัญญาณเดียวในการแสดงระดับความเสี่ยง ต้องมีข้อความกำกับเสมอ (NFR-13) และห้ามกำหนดสี/สไตล์ใหม่นอก `DESIGN.md`

**เอกสาร**
- ห้ามสมมติโดเมน ฟีเจอร์ หรือรหัส FR/NFR โดยไม่เปิดอ่าน spec/backlog จริงก่อน
- ห้ามแก้ไฟล์เอกสารในสายงานตรงๆ เมื่อมี skill ที่ทำหน้าที่นั้นอยู่แล้ว และห้ามเรียก agent ที่ต้องผ่าน orchestrator โดยตรง
- ห้ามสร้างเอกสารในตำแหน่งใหม่นอกโครงสร้าง `docs/` ด้านล่าง
- ห้ามให้ `prototype-auditor`/`build-prototype` ตรวจหรือแก้ Firestore demo

## ภาพรวมระบบที่กำลังวางแผน

เอกสารข้อกำหนดใน `docs/01-requirements/01-spec/` (อาจมีหลายไฟล์ตามความต้องการที่ทยอยเพิ่มเข้ามา ให้ดูรายการไฟล์จริงในโฟลเดอร์) คือแหล่งอ้างอิงเดียวที่บอกว่าระบบคืออะไร มีขอบเขตแค่ไหน และมีบทบาทผู้ใช้แบบใด **ห้ามสมมติโดเมนหรือฟีเจอร์จากความจำหรือจากตัวอย่างโปรเจกต์อื่น** ให้เปิดอ่านไฟล์ spec จริงก่อนตอบคำถามเกี่ยวกับภาพรวมระบบเสมอ (ส่วนนี้ตั้งใจไม่ระบุโดเมนเจาะจงไว้เพื่อไม่ให้ล้าสมัย)

กติกาที่คงที่ของเอกสารทั้งวอลต์:
- ทุกความต้องการมีรหัสกำกับ (`FR-xx` / `NFR-xx`) และระดับความสำคัญ (สูง/กลาง/ต่ำ โดย "สูง" คือสิ่งที่ต้องมีใน MVP) — ดูสรุปล่าสุดที่ `docs/01-requirements/backlog.md` ก่อนอ้างอิงรหัสเสมอ
- เอกสารทุกชั้นอ้างอิงกันด้วย `[[wikilink]]` แบบ Obsidian และควรอ้างอิงกลับไปยัง spec ต้นทางเสมอ
- เอกสารเชิงเทคนิค (`architecture.md`, `api-spec.md`, `db-spec.md`, `detailed-design/`) ออกแบบเชิง logical แล้วเสริมรายละเอียดเทคโนโลยีจริงตาม `technology-stack.md` — ชื่อ collection/field ของ Firestore ให้ยึดตาม `db-spec.md`

## โครงสร้างพื้นที่เอกสาร (`docs/`)

ใช้รูปแบบโฟลเดอร์แบ่งตามขั้นตอน SDLC เมื่อสร้างเอกสารใหม่ให้ใส่ในตำแหน่งที่ตรงกัน อย่าสร้างตำแหน่งใหม่เองหรือสร้างเอกสารคู่ขนานแยกที่อื่น:

```
docs/
  00-archived/                    เอกสารที่เลิกใช้/ถูกแทนที่แล้ว
  01-requirements/
    01-spec/                      1 ไฟล์ต่อ 1 requirement/หัวข้อ ตั้งชื่อ `YYYYMMDD-NN-<slug>.md`
    02-plan/release-plan.md       แผนแบ่ง phase/release (จัดกลุ่ม FR/NFR ตามลำดับพร้อมเหตุผล)
    03-task/{phase-slug}-tasks.md การแตกงานย่อยระดับ implementation ต่อ phase
    backlog.md                    Backlog รวม FR/NFR จากทุกไฟล์ใน 01-spec/
  02-design/
    01-prototypes/<YYYYMMDD>-<NN>-<version>/   HTML mockup + prototype.md
    02-technical/
      architecture.md, api-spec.md, db-spec.md, nfr-review.md, technology-stack.md
      detailed-design/{feature-slug}.md
    feature-list.md, user-journey.md
    DESIGN.md                     Design System หลัก (single source of truth)
  03-testing/
    01-test-plan/
      acceptance-criteria.md      Given-When-Then ต่อ FR/NFR จัดกลุ่มตาม feature-list
      test-plan.md                กลยุทธ์ทดสอบ + Risk Register (1 ไฟล์ต่อโปรเจกต์)
      test-cases/{feature-slug}.md
    02-test-result/               ยังไม่มีเอกสาร/agent ดูแล
  04-retrospectives/
  05-log/{YYYYMMDD}-log.md        บันทึกสรุปงานรายวัน
```

ไฟล์/โฟลเดอร์ที่มีวันที่ใช้รูปแบบ `YYYYMMDD-NN-<slug>` เพื่อให้เรียงตามเวลาได้ถูกต้อง

`docs/02-design/DESIGN.md` คือแหล่งอ้างอิงหลักของ Design System (สี, ตัวอักษร, ระยะห่าง, องค์ประกอบ UI, accessibility) — Prototype ทุกเวอร์ชันต้องยึด token ในไฟล์นี้ หาก Design System ต้องเปลี่ยน ให้แก้ `DESIGN.md` ก่อนแล้วค่อยสะท้อนไปยัง Prototype

## เครื่องมืออัตโนมัติดูแลความสอดคล้องของเอกสาร (agents & skills)

มี custom agents ใน `.claude/agents/` และ skills ใน `.claude/skills/` สำหรับสร้าง/ตรวจสอบเอกสารแต่ละชั้นให้ตรงกับชั้นก่อนหน้า ตามลำดับ: spec → `backlog.md` → `feature-list.md`/`user-journey.md` → แตกขนาน 3 สาย (technical spec ใน `02-technical/`, test plan ใน `03-testing/`, prototype ใน `01-prototypes/`) → phase plan ใน `02-plan/`+`03-task/`

เมื่อผู้ใช้ขอให้ทำงานที่ตรงกับหน้าที่ของ skill ใด **ให้เรียกใช้ skill นั้นแทนการแก้ไฟล์เอกสารตรงๆ เอง** เพื่อให้การตรวจ cross-file consistency และการบันทึกลง `docs/05-log/{YYYYMMDD}-log.md` เป็นไปตามรูปแบบเดิม agent ที่ไม่มีเครื่องมือถามผู้ใช้ (เช่น `requirement-writer`, `architecture-writer`, `api-db-writer`, `detailed-design-writer`, `tech-stack-writer`) ต้องเรียกผ่าน skill ที่เป็น orchestrator เท่านั้น ห้ามเรียก agent ตรงๆ

จุดเริ่มต้นที่ใช้บ่อย:
- `/capture-requirement` — แปลง requirement ดิบเป็น spec ใหม่/แก้ของเดิม พร้อมอัปเดต backlog
- `/audit-backlog`, `/sync-feature-journey`, `/sync-technical-spec`, `/sync-test-plan`, `/sync-phase-plan`, `/build-prototype`, `/build-tech-stack` — sync เอกสารแต่ละชั้น
- `/run-requirements-phase`, `/run-technical-phase`, `/run-prototype-phase` — รวมหลายขั้นตอนในคำสั่งเดียว
- `/audit-pipeline` — ตรวจทั้งสายตั้งแต่ spec ถึงปลายทาง
