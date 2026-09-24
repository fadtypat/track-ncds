# Test Plan

เอกสารเดียวต่อโปรเจกต์ สรุปภาพรวมกลยุทธ์การทดสอบทั้งหมดของระบบตาม [[feature-list]] และ
[[user-journey]] รายละเอียด test case แบบ step-by-step อยู่ใน `test-cases/{feature-slug}.md` แต่ละ
ไฟล์ (อ้างอิงกลับไปยัง [[acceptance-criteria]]) ระดับความสำคัญของ FR/NFR ทุกจุดในเอกสารนี้ดึงค่าจาก
[[backlog]] โดยตรง

## 1. Scope

### ในขอบเขต

ทดสอบทั้ง 7 ฟีเจอร์ Must have ใน [[feature-list]] ครบทุกรหัส FR/NFR ที่อยู่ในขอบเขต (FR-01–FR-16,
NFR-01–NFR-15, NFR-17–NFR-20 — **ไม่รวม NFR-16** ซึ่งถูกกำหนดเป็น Won't have ยืนยันโดยผู้ใช้แล้ว
ดูหัวข้อ "นอกขอบเขต" ด้านล่าง — **อัปเดต 2026-09-23:** เพิ่มฟีเจอร์ที่ 6 (Authentication) ที่
`feature-list.md`/`user-journey.md` เพิ่งเพิ่มใหม่ — **อัปเดต 2026-09-24 (sync-test-plan รอบสี่):**
เพิ่มฟีเจอร์ที่ 7 (Admin) ที่ `feature-list.md`/`user-journey.md` เพิ่งเพิ่มใหม่ (FR-11–FR-15, NFR-19,
NFR-20) และเพิ่ม FR-16 เข้าฟีเจอร์ที่ 2 (แพทย์/พยาบาลยืนยัน/override ผลประเมินความเสี่ยง)):

| # | ฟีเจอร์ | รหัส FR/NFR | MoSCoW |
| --- | --- | --- | --- |
| 1 | [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD\|ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD]] | FR-01, FR-02, NFR-01, NFR-02 | Must have |
| 2 | [[feature-list#2. วิเคราะห์ แจ้งเตือน และยืนยัน/แก้ไขผลประเมินความเสี่ยงโรคแทรกซ้อน\|วิเคราะห์ แจ้งเตือน และยืนยัน/แก้ไขผลประเมินความเสี่ยงโรคแทรกซ้อน]] | FR-03, FR-04, FR-16, NFR-01, NFR-02 | Must have |
| 3 | [[feature-list#3. ค้นหา/เลือกผู้ป่วยในความดูแล\|ค้นหา/เลือกผู้ป่วยในความดูแล]] | FR-05, FR-06, NFR-02 | Must have |
| 4 | [[feature-list#4. คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA\|คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA]] | NFR-03, NFR-04, NFR-05, NFR-06, NFR-07, NFR-08 | Must have |
| 5 | [[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)\|รับประกันคุณภาพเชิงปฏิบัติการของระบบ]] | NFR-09, NFR-10, NFR-11, NFR-12, NFR-13, NFR-14, NFR-15 (NFR-16 นอกขอบเขต — Won't have) | Must have |
| 6 | [[feature-list#6. สมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่านด้วยอีเมล (Authentication)\|สมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่านด้วยอีเมล (Authentication)]] | FR-07, FR-08, FR-09, FR-10, NFR-17, NFR-18 | Must have |
| 7 | [[feature-list#7. จัดการบัญชีผู้ใช้งาน สิทธิ์ และการมอบหมายผู้ป่วย (Admin)\|จัดการบัญชีผู้ใช้งาน สิทธิ์ และการมอบหมายผู้ป่วย (Admin)]] | FR-11, FR-12, FR-13, FR-14, FR-15, NFR-19, NFR-20 | Must have |

บทบาทผู้ใช้ในขอบเขตของการทดสอบทั้งหมด: **แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD** และ **Admin (ผู้ดูแลระบบ)**
— บทบาทใหม่ที่เพิ่มเข้ามาตามฟีเจอร์ที่ 7 (ตาม [[user-journey]]) ฟีเจอร์ที่ 5 เป็นข้อกำหนดเชิง
cross-cutting ที่ครอบคลุมการใช้งานของบทบาทแพทย์/พยาบาลในทุกฟีเจอร์ (1-4) ไม่ได้เพิ่มบทบาทใหม่ ฟีเจอร์
ที่ 6 (Authentication) เป็น precondition ก่อนฟีเจอร์ที่ 1-5 ทั้งหมด (ต้องเข้าสู่ระบบและยืนยันอีเมล
สำเร็จก่อน) ทั้งแพทย์/พยาบาลและ Admin ใช้กลไกเข้าสู่ระบบเดียวกัน (FR-07) แต่มีสิทธิ์ต่างกันหลังเข้าสู่
ระบบ **อัปเดต 2026-09-24:** Admin ไม่ใช่ "ผู้ดูแลระบบผ่าน Firebase Console/Firestore" อีกต่อไป — เป็น
role ที่ 3 ในระบบ (มี UI ของตัวเองสำหรับอนุมัติบัญชี/เปลี่ยน role/ระงับบัญชี/จัดการ PatientAssignment/
ดูข้อมูลผู้ป่วยทุกราย) ต้องทดสอบผ่าน UI ของระบบเช่นเดียวกับแพทย์/พยาบาล มีเพียงการสร้างบัญชี Admin
คนแรก (bootstrap) เท่านั้นที่ยังคงทำผ่าน Firebase Console/Firestore โดยตรง (นอกขอบเขตการทดสอบ)

### นอกขอบเขต (Out of scope)

ตามที่ spec ต้นทางระบุไว้ชัดเจน จึง **ไม่ทดสอบ** ประเด็นต่อไปนี้ในรอบทดสอบปัจจุบัน:

- การเชื่อมต่อจริงกับระบบ HOSxP (field mapping, protocol, connection จริง) — ยังไม่ตัดสินใจเพราะ
  `technology-stack.md` ยังไม่ถูกกำหนด (ดู [[20260917-01-patient-ncd-history-lab-complication-risk|spec ต้นทาง (NCD history)]])
  ทดสอบเฉพาะพฤติกรรมกับข้อมูล mockup แทน
- การวิเคราะห์ความเสี่ยงด้วย AI/Machine Learning model — ขอบเขต MVP ใช้ rule-based threshold เท่านั้น
- ค่าตัวเลข threshold ของ lab จริงที่ใช้ตัดสิน rule (ยังไม่ถูกกำหนดในระดับ spec/detailed-design —
  ทดสอบเฉพาะ "ลำดับการประมวลผลเชิงตรรกะ" ของ Risk Rule Engine ไม่ใช่ความถูกต้องทางคลินิกของค่า
  threshold จริง)
- การกำหนดฐานทางกฎหมาย (lawful basis) ที่ชัดเจนของ PDPA, ค่าตัวเลขระยะเวลาการเก็บรักษาข้อมูลจริง,
  ช่องทาง self-service ให้ผู้ป่วยยื่นคำขอเอง, กระบวนการแจ้งเหตุละเมิดต่อสำนักงานคณะกรรมการคุ้มครอง
  ข้อมูลส่วนบุคคลเชิงขั้นตอนองค์กร — ทั้งหมดนี้ระบุไว้ใน
  [[20260921-01-pdpa-data-protection-compliance|spec ต้นทาง (PDPA)]] ว่าเป็น "นอกขอบเขต" ของ spec เอง
  จึงนอกขอบเขตการทดสอบด้วย
- **อัปเดต 2026-09-22 (ขอบเขตจำกัดเฉพาะฟีเจอร์ที่ 4):** รายละเอียด algorithm/key management ของการ
  เข้ารหัส เคยถูกระบุว่านอกขอบเขตทั้งหมดเพราะ "ขึ้นกับ `technology-stack.md` ซึ่งยังไม่ถูกตัดสินใจ" ตาม
  spec ต้นทาง (PDPA) — ปัจจุบัน [[technology-stack]] ตัดสินใจแล้วว่าใช้ **Google-managed encryption
  keys** (at rest) และ **HTTPS/TLS บังคับโดย Firebase Hosting/Cloud Functions** (in transit) เป็นค่า
  เริ่มต้นโดยไม่ต้องตั้งค่าเพิ่มเติม กลไกพื้นฐานนี้จึง**อยู่ในขอบเขตการทดสอบแล้ว** ในระดับ
  configuration/design review (ดูแถว NFR-04 ในตารางประเภทการทดสอบด้านล่าง) ส่วนที่ยังคงนอกขอบเขต
  ต่อไปคือ **Customer-Managed Encryption Keys (CMEK) และ field-level encryption** ซึ่ง
  [[technology-stack]] บันทึกไว้เป็น "ประเด็นรอตัดสินใจ" สำหรับทบทวนเมื่อเปลี่ยนไปใช้ข้อมูลผู้ป่วยจริง
- การทดสอบ performance เชิง load/stress/concurrency (เครื่องมือ, environment, threshold การรับ/ไม่รับ
  ผลทดสอบเชิงปริมาณ) — **อัปเดต 2026-09-22:** NFR-09 (Performance, ตอบสนอง < 2 วินาที) ถูกเพิ่มเข้ามา
  ในขอบเขตแล้ว (ดู [[20260922-01-operational-quality-nfr|spec ต้นทาง (Operational Quality)]]) เอกสารนี้
  เคยบันทึกไว้ว่า "ไม่มี NFR ด้าน performance ระบุไว้ใน backlog ณ ปัจจุบัน" ซึ่งไม่เป็นจริงอีกต่อไป —
  ทดสอบเฉพาะเวลาตอบสนองของคำขอเดี่ยว (single-request response time) เท่านั้น ส่วนรายละเอียดเชิงเทคนิค
  ของการทดสอบ load/stress/concurrency ยังคงนอกขอบเขตตามที่ spec ต้นทางระบุไว้ชัดเจน
- การเชื่อมต่อกับมาตรฐาน HL7/FHIR และการเชื่อมต่อ HOSxP จริง (NFR-16 — Interoperability) — ถูกกำหนดเป็น
  **Won't have** ยืนยันโดยผู้ใช้แล้วใน [[feature-list]]/[[backlog]] จึงไม่อยู่ในขอบเขตการทดสอบรอบนี้เลย
  (ไม่มี AC/test case สำหรับ NFR-16 ใน [[acceptance-criteria]])
- ขั้นตอนการยืนยันทางคลินิกของแพทย์ผู้เชี่ยวชาญเชิงองค์กร (แบบฟอร์ม, workflow การอนุมัติ, ผู้มีอำนาจ
  ลงนาม) ตาม NFR-11 — เป็นกระบวนการเชิงองค์กรที่อยู่นอกขอบเขตของระบบ (ดู
  [[20260922-01-operational-quality-nfr|spec ต้นทาง (Operational Quality)]]) ทดสอบเฉพาะว่ามีหลักฐาน/
  checklist การยืนยันก่อน deploy เท่านั้น ไม่ทดสอบกระบวนการองค์กรจริง
- การตั้งค่า SLA เชิงตัวเลขที่เข้มงวดกว่ามาตรฐานของ Firebase/Google Cloud (NFR-10) — ไม่กำหนด/ทดสอบ SLA
  เพิ่มเติมนอกเหนือจากที่ผู้ให้บริการ platform รับประกันไว้เอง
- การเข้าสู่ระบบผ่านผู้ให้บริการอื่น (SSO/Google/SAML) — ระบุไว้ใน
  [[20260923-01-user-authentication-email-password|spec ต้นทาง (Authentication)]] ว่าเป็น "นอกขอบเขต"
  ของ spec เอง จึงนอกขอบเขตการทดสอบด้วย (**อัปเดต 2026-09-24:** หน้าจอ/ฟีเจอร์อนุมัติบัญชีภายในระบบ และ
  การกำหนด/แก้ไขบทบาทของผู้ใช้งานหลังอนุมัติครั้งแรก **ไม่นอกขอบเขตอีกต่อไป** — ย้ายเข้าขอบเขตการทดสอบ
  แล้วในฐานะฟีเจอร์ที่ 7 — FR-11/FR-12/FR-13 ตาม [[20260924-01-admin-role-account-management|spec
  ต้นทาง (Admin)]])
- **เพิ่มใหม่ 2026-09-24 (ฟีเจอร์ที่ 7 — Admin):** การสร้างบัญชี Admin คนแรก (bootstrap) — ยังคง
  ดำเนินการผ่าน Firebase Console/Firestore โดยตรงตามที่ระบุไว้ใน
  [[20260924-01-admin-role-account-management|spec ต้นทาง (Admin)]] ว่าเป็น "นอกขอบเขต" ของ spec เอง
  จึงนอกขอบเขตการทดสอบด้วย เช่นเดียวกับการกำหนดสิทธิ์ระดับละเอียดกว่า role เดียว (fine-grained
  permission/multiple admin levels) ซึ่ง MVP มี admin เพียงระดับเดียวเท่านั้น

## 2. ประเภทการทดสอบ

### Functional Testing (ต่อ FR แต่ละกลุ่ม)

| กลุ่ม FR | ประเภทการทดสอบ | อ้างอิง test case |
| --- | --- | --- |
| FR-01, FR-02 | Functional Testing (การแสดงผลข้อมูล, boundary ของ ICD-10/ช่วงเวลา) | [[test-cases/patient-ncd-diagnosis-lab-history]] |
| FR-03, FR-04, FR-16 | Functional Testing (rule-based logic, การจัดประเภทผลลัพธ์ 3 แบบ, การยืนยัน/แก้ไข override ผลประเมินความเสี่ยงโดยแพทย์/พยาบาล) + Security Testing (audit log ของการยืนยัน/แก้ไข, ปฏิเสธสิทธิ์ของ admin) | [[test-cases/complication-risk-analysis-alert]] |
| FR-05, FR-06 | Functional Testing (ค้นหา/แสดงรายชื่อ, input validation ของ HN) | [[test-cases/patient-search-selection]] |
| FR-07, FR-08, FR-09, FR-10 | Functional Testing (เข้าสู่ระบบ, สมัครบัญชี, ยืนยันอีเมล, รีเซ็ตรหัสผ่าน) + Security Testing (account enumeration prevention, password policy) | [[test-cases/user-authentication-email-password]] |
| FR-11, FR-12, FR-13, FR-14, FR-15 | Functional Testing (อนุมัติบัญชี, เปลี่ยน role, ระงับ/เปิดใช้งานบัญชี, จัดการ PatientAssignment, ดูประวัติผู้ป่วยทุกรายแบบ read-only) + Security Testing (ปฏิเสธสิทธิ์ผู้ใช้ที่ไม่ใช่ admin) | [[test-cases/admin-role-account-management]] |

### Non-Functional Testing (ต่อ NFR แต่ละตัว)

| รหัส NFR | ด้าน | ประเภทการทดสอบ | อ้างอิง test case |
| --- | --- | --- | --- |
| NFR-01 | แหล่งข้อมูล/Integration | Integration Testing (mock data source) | [[test-cases/patient-ncd-diagnosis-lab-history]], [[test-cases/complication-risk-analysis-alert]] |
| NFR-02 | Security / Access Control | Security Testing (role-level + patient-level authorization, client-side data minimization) | [[test-cases/patient-search-selection]], [[test-cases/patient-ncd-diagnosis-lab-history]], [[test-cases/complication-risk-analysis-alert]] |
| NFR-03 | PDPA / Lawful Basis & Purpose Limitation | Compliance Testing | [[test-cases/pdpa-data-protection-compliance]] |
| NFR-04 | PDPA / Encryption | Configuration/Design Review (ทวนสอบว่า Google-managed encryption keys ของ Cloud Firestore และ HTTPS/TLS ของ Firebase Hosting/Cloud Functions เป็นค่าเริ่มต้นที่ไม่ถูกปิด/override — ตาม [[technology-stack#8. กลไกเข้ารหัสข้อมูล (NFR-04) และการบริหารกุญแจเข้ารหัส\|decision area 8]] ไม่ใช่การทดสอบ algorithm เชิงลึก) | [[test-cases/pdpa-data-protection-compliance]] |
| NFR-05 | PDPA / Retention & Deletion | Compliance Testing + Functional Testing (retention enforcement logic) | [[test-cases/pdpa-data-protection-compliance]] |
| NFR-06 | PDPA / Audit Log & Accountability | Security Testing (audit logging, fail-safe) | [[test-cases/pdpa-data-protection-compliance]] |
| NFR-07 | PDPA / Data Subject Rights | Functional Testing + Compliance Testing | [[test-cases/pdpa-data-protection-compliance]] |
| NFR-08 | PDPA / Breach Notification Support | Compliance Testing | [[test-cases/pdpa-data-protection-compliance]] |
| NFR-09 | Performance | Performance Testing (single-request response time เท่านั้น ไม่รวม load/stress) **+ Configuration Review (composite index ใน `firestore.indexes.json` ต้องครบตาม [[db-spec]] ไม่มี unindexed query warning — กลไกจริงคือ Firestore composite index เท่านั้น ไม่มี caching layer ตาม [[technology-stack#9. กลไกรองรับ Performance < 2 วินาที (NFR-09) — Firestore Composite Index เท่านั้น (ไม่มี caching layer เพิ่มเติม)\|technology-stack]])** | [[test-cases/operational-quality-nfr]] |
| NFR-10 | Availability | Design/Configuration Review (ทวนสอบว่าไม่ตั้ง SLA เกินมาตรฐาน Firebase/Google Cloud) | [[test-cases/operational-quality-nfr]] |
| NFR-11 | Clinical Safety Validation | Process/Compliance Review (ตรวจสอบหลักฐานการยืนยันจากแพทย์ผู้เชี่ยวชาญก่อน deploy — ไม่ใช่ runtime behavior) | [[test-cases/operational-quality-nfr]] |
| NFR-12 | Session Timeout | Security Testing (client custom inactivity timer — `setTimeout` + event listener เรียก `signOut()` เมื่อ idle 30 นาที, การปฏิเสธคำขอหลัง idle timeout) **+ Security Awareness Test (ยืนยัน/บันทึกความเสี่ยงที่ token ยังใช้ได้ต่อจนหมดอายุตามธรรมชาติ ~1 ชม. เพราะ**ไม่มี server-side token revocation**ตาม [[technology-stack#10. กลไก Session Timeout (NFR-12) — Client Custom Inactivity Timer เท่านั้น (ไม่มี Server-side Token Revocation)\|technology-stack]] — ไม่ใช่ defect แต่เป็น known risk ที่ต้องบันทึกไว้)** | [[test-cases/operational-quality-nfr]] |
| NFR-13 | Accessibility | Accessibility Testing (ข้อความกำกับคู่กับสี/ไอคอนเสมอ **+ รัน Lighthouse Accessibility Audit จริงตามมาตรฐาน WCAG 2.1 AA + Heroicons ก่อน deploy ทุกครั้ง ตาม [[technology-stack#11. Design Token/Icon Library สำหรับ Accessibility (NFR-13) — WCAG 2.1 Level AA + Heroicons + Lighthouse\|technology-stack]]**) | [[test-cases/operational-quality-nfr]] |
| NFR-14 | Security Rules Verification | Security Testing (automated test ผ่าน Firebase Emulator Suite) | [[test-cases/operational-quality-nfr]] |
| NFR-15 | Browser/Device Compatibility | Compatibility Testing (Chrome/Edge/Firefox บน desktop/tablet **+ ยืนยัน browserslist config `">0.5%, last 2 versions, Firefox ESR, not dead"` ตรงตาม [[technology-stack#12. Browserslist/Matrix การทดสอบสำหรับ Browser Compatibility (NFR-15)\|technology-stack]] และทดสอบ tablet ผ่าน Chrome DevTools device emulation**) | [[test-cases/operational-quality-nfr]] |
| NFR-16 | Interoperability (future) | **ไม่ทดสอบ** — Won't have, out of scope เฟสนี้ทั้งหมด (ยืนยันโดยผู้ใช้แล้ว) | — |
| NFR-17 | Security / Password Policy | Security Testing (validation ความยาว/ความซับซ้อนขั้นต่ำของรหัสผ่านตอนสมัคร/รีเซ็ต) | [[test-cases/user-authentication-email-password]] |
| NFR-18 | Security / Account Enumeration Prevention | Security Testing (ยืนยันข้อความตอบกลับเหมือนกันทุกกรณีที่เข้าสู่ระบบผิดพลาด/สมัครซ้ำ/ขอรีเซ็ตรหัสผ่าน) | [[test-cases/user-authentication-email-password]] |
| NFR-19 | Security / Access Control ข้อยกเว้นสำหรับบทบาท Admin | Security Testing (ยืนยันว่า admin เข้าถึงผู้ป่วยทุกรายได้โดยไม่ต้องมี PatientAssignment แต่ยังตรวจสอบ role/isActive/email verification ครบ, และแพทย์/พยาบาลไม่ได้รับข้อยกเว้นนี้) | [[test-cases/admin-role-account-management]] |
| NFR-20 | PDPA / บันทึกการเข้าถึงข้อมูล (Audit Log สำหรับ Admin) | Security Testing (audit logging แบบ fail-safe ก่อนคืนข้อมูลทุกครั้งที่ admin เข้าถึงข้อมูลผู้ป่วย, แยกบันทึกจากการเข้าถึงของแพทย์/พยาบาล) | [[test-cases/admin-role-account-management]] |

## 3. Environment

`docs/02-design/02-technical/technology-stack.md` **ยังไม่ถูกสร้าง/ยังไม่มีการตัดสินใจ** ณ ปัจจุบัน
— **รอกำหนด tech stack ก่อน** จึงจะสามารถระบุ environment เชิงเทคนิค (runtime, database engine,
เครื่องมือทดสอบอัตโนมัติ, CI/CD) ได้ ห้ามสมมติกรอบเทคโนโลยีใดๆ ล่วงหน้า ในระหว่างนี้การทดสอบทำได้
เฉพาะระดับ:

- **Functional/UAT ผ่าน Prototype**: ใช้ [[../../02-design/01-prototypes/20260918-01-v1/prototype|prototype v1]]
  (clickable HTML mockup) เป็นเครื่องมือสาธิต/ทดสอบ flow และ UX ล่วงหน้าก่อนมีระบบจริง (ข้อมูลทั้งหมด
  เป็น mockup ตาม NFR-01)
- **Design/Logic review**: ตรวจสอบ sequence diagram/state diagram/edge case table ใน
  `docs/02-design/02-technical/detailed-design/` เทียบกับ acceptance criteria เพื่อยืนยันว่า logic
  ที่ออกแบบไว้ครอบคลุมทุก AC ก่อนเริ่มพัฒนาจริง

**หมายเหตุ 2026-09-22:** [[technology-stack]] มีเนื้อหาแล้ว (ตัดสินใจใช้ Firebase-native stack) เอกสารนี้
ยังคงข้อความ "รอกำหนด tech stack ก่อน" ไว้สำหรับ environment เชิง build/deploy/CI-CD ที่ยังไม่ได้กำหนด
รายละเอียดสุดท้าย แต่มีเครื่องมือที่ยืนยันแล้วและเกี่ยวข้องกับการทดสอบ NFR-09/NFR-12/NFR-13/NFR-14/NFR-15
โดยตรง ได้แก่:

- **Firebase Emulator Suite** (`@firebase/rules-unit-testing`) สำหรับ automated test ของ Firestore
  Security Rules (NFR-14) และตรวจสอบ composite index/unindexed query warning (NFR-09) ตามที่
  [[technology-stack#ความเสี่ยงที่ต้องพิจารณาเพิ่มเติม (สำคัญ — ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว)|technology-stack]]
  ระบุไว้
- **Lighthouse Accessibility Audit** (Chrome DevTools, ไม่มีค่าใช้จ่าย/ไม่ต้องติดตั้งเพิ่ม) สำหรับ NFR-13
  ตาม [[technology-stack#11. Design Token/Icon Library สำหรับ Accessibility (NFR-13) — WCAG 2.1 Level AA + Heroicons + Lighthouse|decision area 11]]
- **browserslist config** `">0.5%, last 2 versions, Firefox ESR, not dead"` + **Chrome DevTools device
  emulation** (ทดสอบ tablet, ไม่ใช้บริการ cross-browser testing เสียเงิน) สำหรับ NFR-15 ตาม
  [[technology-stack#12. Browserslist/Matrix การทดสอบสำหรับ Browser Compatibility (NFR-15)|decision area 12]]
- **Client custom inactivity timer** (`setTimeout` + event listener เรียก `signOut()`, **ไม่มี
  server-side token revocation**) สำหรับ NFR-12 ตาม
  [[technology-stack#10. กลไก Session Timeout (NFR-12) — Client Custom Inactivity Timer เท่านั้น (ไม่มี Server-side Token Revocation)|decision area 10]]
  — ทีมทดสอบต้องทดสอบทั้งพฤติกรรม happy path และบันทึกผล security awareness test (TC-05-16) ไว้เป็น
  หลักฐานความเสี่ยงที่ยังไม่ถูกปิดใน MVP นี้เสมอ

- **Firebase Authentication Emulator** (`@firebase/rules-unit-testing`/`firebase-tools emulators`)
  สำหรับทดสอบ FR-07–FR-10, NFR-17, NFR-18 (เข้าสู่ระบบ, สมัครบัญชี, ยืนยันอีเมล, รีเซ็ตรหัสผ่าน, นโยบาย
  รหัสผ่าน, account enumeration prevention) ตามที่
  [[technology-stack#7. Authentication/Authorization — Firebase Authentication (ไม่ใช้ Custom Claims เก็บบทบาท — แก้ไขในรอบสาม 2026-09-24)|decision area 7]]
  ระบุไว้ โดยไม่ต้องส่งอีเมลจริงระหว่างทดสอบอัตโนมัติ (ใช้ Emulator UI ตรวจสอบลิงก์ยืนยัน/รีเซ็ตแทน)
- **เพิ่มใหม่ 2026-09-24 (ฟีเจอร์ที่ 7 — Admin):** ทดสอบ FR-11–FR-15, NFR-19, NFR-20 ด้วยเครื่องมือชุด
  เดียวกับข้างต้น (Firebase Authentication Emulator สำหรับเข้าสู่ระบบของบัญชี admin ทดสอบ, Firebase
  Emulator Suite/Firestore Emulator สำหรับตรวจสอบสิทธิ์ admin ต่อ `users/{uid}`/`patientAssignments`/
  ข้อมูลผู้ป่วยทุกราย และการบันทึก `auditLogRecords` แบบ fail-safe) — ยังไม่มีเครื่องมือ/environment
  เชิงเทคนิคใหม่เพิ่มเติมสำหรับฟีเจอร์นี้โดยเฉพาะ เพราะยังไม่มี detailed-design/prototype ของฟีเจอร์
  Admin ณ ปัจจุบัน (รอสาย technical spec/prototype sync ตาม feature-list/user-journey ที่เพิ่งอัปเดต)

รายละเอียด environment ส่วนที่เหลือ (runtime/CI pipeline เต็มรูปแบบ) ยังต้องรอการตัดสินใจเพิ่มเติมก่อน
เริ่มพัฒนาจริง

## 4. Risk Management

Risk Register ด้านล่างประเมินความเสี่ยงถ้าไม่ทดสอบ/ทดสอบไม่ผ่านของแต่ละรหัส FR/NFR ครอบคลุมทุกฟีเจอร์
Must have ทั้ง 7 ฟีเจอร์ (อัปเดต 2026-09-23: เพิ่มฟีเจอร์ที่ 6 — Authentication; อัปเดต 2026-09-24:
เพิ่มฟีเจอร์ที่ 7 — Admin และ FR-16) และทุก NFR ระดับ "สูง"
ตาม [[backlog]] (NFR-16 ไม่มีแถวเพราะเป็น Won't have
นอกขอบเขตการทดสอบทั้งหมด) Impact ผูกกับระดับความสำคัญใน
[[backlog]] เสมอ (รหัส "สูง" → Impact อย่างน้อย "สูง") Likelihood ประเมินจากความซับซ้อนของ
requirement/จำนวน edge case ที่ spec หรือ [[../../02-design/02-technical/detailed-design/|detailed-design]]
ระบุไว้ (ยิ่งมี AC/edge case มาก หรือพึ่งพา manual/fail-safe logic มาก ยิ่ง likelihood สูงกว่า) สูตร
คำนวณระดับความเสี่ยงรวม: สูง×สูง = วิกฤต, สูง×กลาง หรือ กลาง×สูง = สูง, ที่เหลือ = กลาง/ต่ำ

| รหัส FR/NFR (ฟีเจอร์) | ความเสี่ยงถ้าไม่ทดสอบ/ทดสอบไม่ผ่าน | Likelihood (เหตุผล) | Impact (เหตุผล) | ระดับความเสี่ยงรวม | แนวทางลด/รับมือความเสี่ยง (mitigation) |
| --- | --- | --- | --- | --- | --- |
| FR-01 (สูง) — ฟีเจอร์ 1 | แสดงประวัติวินิจฉัยผิดพลาด/ไม่ครบ ทำให้แพทย์/พยาบาลตัดสินใจทางคลินิกผิดพลาด (พลาดประวัติโรค NCD สำคัญ) | กลาง (มี 3 AC ครอบคลุม happy path + 2 edge case ไม่ซับซ้อนมาก) | สูง (กระทบการตัดสินใจทางคลินิกโดยตรง เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/patient-ncd-diagnosis-lab-history]]) รวม edge case ข้อมูลว่าง/ไม่พบผู้ป่วย ทวนกับ detailed-design ก่อนพัฒนาจริง |
| FR-02 (สูง) — ฟีเจอร์ 1 | แสดงผลตรวจ lab หรือช่วงเวลาผิดพลาด ทำให้แพทย์ประเมินแนวโน้มอาการผิดพลาด | กลาง (4 AC รวม boundary ของช่วงเวลาเริ่ม/สิ้นสุด) | สูง (ใช้เป็น input ของการติดตามแนวโน้มทางคลินิกและของ Risk Rule Engine ใน FR-03) | สูง | ทดสอบ boundary ช่วงเวลาครบ ([[test-cases/patient-ncd-diagnosis-lab-history]]) รวมกรณีช่วงเวลาไม่ถูกต้องและไม่พบผลตรวจ |
| FR-03 (สูง) — ฟีเจอร์ 2 | Risk Rule Engine ประเมินผิดพลาด (พบ/ไม่พบความเสี่ยงผิดจากความเป็นจริง) อาจพลาดแจ้งเตือนโรคแทรกซ้อนร้ายแรง กระทบความปลอดภัยผู้ป่วยโดยตรง | สูง (logic ซับซ้อนที่สุดในระบบ มี 5 AC รวมกฎ "ใช้ค่า lab ล่าสุด" และแยกกรณี "ไม่พบความเสี่ยง" กับ "ข้อมูลไม่เพียงพอ" ที่ต้องไม่ปนกัน) | สูง (ผลกระทบต่อความปลอดภัยผู้ป่วยโดยตรง เป็น Must have/MVP) | วิกฤต | ทดสอบครบทั้ง 5 AC ([[test-cases/complication-risk-analysis-alert]]) เน้น regression กรณีค่า lab ซ้ำชนิด/คนละวันที่ และตรวจสอบ logic แยก 3 ผลลัพธ์ให้ชัดเจนก่อนขึ้นระบบจริง |
| FR-04 (สูง) — ฟีเจอร์ 2 | แสดงผล flag/ข้อความผลประเมินผิดพลาดหรือไม่ชัดเจน ทำให้แพทย์พลาดสังเกตความเสี่ยงที่ระบบตรวจพบแล้ว | กลาง (3 AC แยกตามผลลัพธ์ 3 แบบชัดเจน) | สูง (เป็นจุดที่ผู้ใช้เห็นผลจริง กระทบการตัดสินใจทางคลินิกโดยตรง) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/complication-risk-analysis-alert]]) ตรวจสอบว่ามีข้อความกำกับคู่กับสีเสมอ ไม่ใช้สีเป็นสัญญาณเดียว |
| FR-05 (สูง) — ฟีเจอร์ 3 | แสดงรายชื่อผู้ป่วยผิดพลาด/แสดงผู้ป่วยที่ไม่ได้อยู่ในความดูแล ละเมิดสิทธิ์ความเป็นส่วนตัวของผู้ป่วยรายอื่น | กลาง (3 AC ครอบคลุม happy path, edge case รายการว่าง, การตรวจสอบสิทธิ์ซ้ำตอนเลือกผู้ป่วย) | สูง (กระทบทั้งความปลอดภัยข้อมูลและ PDPA เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/patient-search-selection]]) เน้นยืนยันว่า Backend ตรวจสอบสิทธิ์ระดับรายผู้ป่วยซ้ำเสมอ ไม่พึ่งพาการกรองฝั่ง Client เพียงอย่างเดียว |
| FR-06 (สูง) — ฟีเจอร์ 3 | Validation เลข HN ผิดพลาด (timing/รูปแบบ) หรือข้อความ error เปิดเผยว่า HN มีอยู่จริงหรือไม่ ทำให้ค้นหาผิดคนหรือรั่วไหลข้อมูลว่าเลข HN ใดมีอยู่ในระบบ | สูง (มี edge case ละเอียดเรื่อง timing ตรวจสอบเฉพาะหลังกดค้นหา และข้อความ error ต้องเหมือนกันทั้งกรณี "ไม่พบ" กับ "มีอยู่จริงแต่นอกความดูแล" เพื่อไม่เปิดเผยข้อมูล) | สูง (เป็นจุดแรกสุดของ journey ที่ระบุตัวตนผู้ป่วย เป็น Must have/MVP) | วิกฤต | ทดสอบครบทั้ง 3 AC ([[test-cases/patient-search-selection]]) เน้น TC-03-07/TC-03-08 ที่ต้องได้ข้อความเดียวกันทุกกรณี |
| FR-16 (สูง) — ฟีเจอร์ 2 | แพทย์/พยาบาลยืนยัน/แก้ไข (override) ผลประเมินความเสี่ยงผิดพลาด หรือระบบยอมให้ Admin/ผู้ไม่มี PatientAssignment แก้ไขผลได้ ทำให้ผลการประเมินทางคลินิกที่ใช้จริงคลาดเคลื่อนจากดุลยพินิจแพทย์ หรือละเมิดขอบเขตสิทธิ์ที่กำหนดไว้ | กลาง (5 AC ครอบคลุม happy path ยืนยัน/override 2 แบบ + 3 edge case สิทธิ์/ขอบเขตข้อมูล ไม่ซับซ้อนเชิง logic เท่า FR-03 แต่ต้องแยกสิทธิ์ให้ถูกต้องหลายชั้น) | สูง (กระทบผลการประเมินทางคลินิกที่แพทย์/พยาบาลใช้ตัดสินใจโดยตรง เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 5 AC ([[test-cases/complication-risk-analysis-alert]]) เน้นยืนยันว่า audit log บันทึกทุกครั้งที่ยืนยัน/แก้ไข และปฏิเสธสิทธิ์ของ admin/ผู้ไม่มี PatientAssignment |
| NFR-01 (สูง) — ฟีเจอร์ 1, 2 | ข้อมูล mockup มีพฤติกรรม/โครงสร้างไม่ตรงกับ HOSxP จริง ทำให้ทดสอบผ่านแต่ระบบจริงทำงานผิดพลาดเมื่อเชื่อมต่อจริง | กลาง (1 AC แต่ผูกกับทั้ง FR-01/FR-02/FR-03 ที่ใช้ mock data เป็น input) | สูง (บล็อกการยืนยันความถูกต้องของ integration ก่อนขึ้นระบบจริง เป็น Must have/MVP) | สูง | ทดสอบ TC-01-08 และ TC-02-08 ([[test-cases/patient-ncd-diagnosis-lab-history]], [[test-cases/complication-risk-analysis-alert]]) ยืนยันโครงสร้างผลลัพธ์เหมือนกรณี HOSxP จริงทุกประการ ทบทวนซ้ำเมื่อเชื่อมต่อจริง |
| NFR-02 (สูง) — ฟีเจอร์ 1, 2, 3 | ควบคุมสิทธิ์การเข้าถึงผิดพลาด (role-level/patient-level/client-side data clearing) ทำให้ข้อมูลผู้ป่วยรั่วไหลข้ามสิทธิ์ ละเมิด PDPA และความเป็นส่วนตัวของผู้ป่วยอย่างร้ายแรง | สูง (ครอบคลุมหลายชั้นการป้องกัน: ปฏิเสธระดับบทบาท, ปฏิเสธระดับรายผู้ป่วย, ล้างข้อมูลฝั่ง Client ในทุกฟีเจอร์ที่แสดงข้อมูลระบุตัวตน/ทางคลินิก รวม 5 AC กระจายอยู่ 3 ฟีเจอร์) | สูง (เป็นความเสี่ยงด้านความปลอดภัยข้อมูลผู้ป่วยที่ร้ายแรงที่สุดในระบบ เป็น Must have/MVP) | วิกฤต | ทดสอบครบทุก AC ในทั้ง 3 ไฟล์ test case ที่เกี่ยวข้อง ([[test-cases/patient-search-selection]], [[test-cases/patient-ncd-diagnosis-lab-history]], [[test-cases/complication-risk-analysis-alert]]) รวม security regression test ทุกครั้งที่แก้ไข logic สิทธิ์ |
| NFR-03 (สูง) — ฟีเจอร์ 4 | ไม่บังคับใช้ purpose limitation ทำให้ประมวลผลข้อมูลผู้ป่วยเกินขอบเขตวัตถุประสงค์ ผิดหลักการ PDPA | กลาง (2 AC ตรงไปตรงมา ผูกกับ NFR-02 อยู่แล้ว) | สูง (เป็นหลักการพื้นฐานของ PDPA ที่มีโทษทางกฎหมาย เป็น Must have/MVP) | สูง | ทดสอบ TC-04-01, TC-04-02 ([[test-cases/pdpa-data-protection-compliance]]) ยืนยันการตรวจสอบ purpose limitation ก่อนสร้าง DataSubjectRequest ทุกครั้ง |
| NFR-04 (สูง) — ฟีเจอร์ 4 | ข้อมูลสุขภาพ/ส่วนบุคคลไม่ถูกเข้ารหัสทั้ง at rest/in transit ทำให้รั่วไหลได้ง่ายหากถูกเข้าถึงโดยไม่ได้รับอนุญาต ผิด PDPA อย่างร้ายแรง; เพิ่มเติม (อัปเดต 2026-09-22): [[technology-stack]] เลือกใช้ Google-managed encryption keys (ไม่ใช่ CMEK) ซึ่งเหมาะกับ MVP/ข้อมูลจำลอง แต่ยังไม่รองรับการควบคุม key lifecycle เอง — มีความเสี่ยงเพิ่มเติมหากถูกนำไปใช้กับข้อมูลผู้ป่วยจริงโดยไม่ทบทวนเป็น CMEK ก่อน | กลาง (กลไกเป็นค่าเริ่มต้นของ platform ไม่ต้องเขียนโค้ดเอง ความเสี่ยงหลักจึงอยู่ที่การตั้งค่าถูก override โดยไม่ได้ตั้งใจ ไม่ใช่ความซับซ้อนของ logic เหมือนเดิมที่ยังไม่รู้กลไก) | สูง (ข้อมูลสุขภาพเป็นข้อมูลอ่อนไหวตาม PDPA เป็น Must have/MVP) | สูง | ทดสอบระดับ configuration review (TC-04-03, TC-04-04) ยืนยันว่า Google-managed encryption keys/HTTPS ยังเป็นค่าเริ่มต้นที่ไม่ถูกปิด/override ([[test-cases/pdpa-data-protection-compliance]]) และต้องยกระดับเป็น CMEK พร้อมทดสอบซ้ำก่อนเปลี่ยนไปใช้ข้อมูลผู้ป่วยจริงตามที่ [[technology-stack#ประเด็นรอตัดสินใจ\|technology-stack]] ระบุไว้ |
| NFR-05 (กลาง) — ฟีเจอร์ 4 | ไม่บังคับใช้ retention หรือบังคับใช้/ลบผิดพลาด ทำให้เก็บข้อมูลผู้ป่วยเกินความจำเป็น หรือลบข้อมูลที่ยังต้องใช้ตามกฎหมาย (เช่น ข้อบังคับเวชระเบียน) | สูง (4 AC ซับซ้อนที่สุดในฟีเจอร์ 4 มีหลาย edge case: ยังไม่กำหนดค่า, ระงับการลบ, ลบสำเร็จ, ข้ามรอบ) | กลาง (ตรงกับระดับความสำคัญ "กลาง" ใน [[backlog]]) | สูง | ทดสอบครบทั้ง 4 AC ([[test-cases/pdpa-data-protection-compliance]]) โดยเฉพาะกรณีระงับการลบเมื่อมีฐานทางกฎหมายอื่นขัดแย้งกับคำขอผู้ป่วย |
| NFR-06 (สูง) — ฟีเจอร์ 4 | Audit log ไม่ถูกบันทึกหรือบันทึกไม่ fail-safe ทำให้ไม่สามารถตรวจสอบย้อนหลังได้ กระทบการสืบสวนข้อมูลรั่วไหลและหลัก Accountability ตาม PDPA | กลาง (3 AC รวม fail-safe logic ที่ต้องยกเลิกการดำเนินการทั้งหมดเมื่อบันทึกไม่สำเร็จ) | สูง (เป็นกลไกเดียวที่รองรับการพิสูจน์ความรับผิดชอบ/สืบสวน breach เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/pdpa-data-protection-compliance]]) เน้น fail-safe (TC-04-10) ว่าต้องไม่แสดงข้อมูลใดๆ เมื่อบันทึก log ไม่สำเร็จ |
| NFR-07 (กลาง) — ฟีเจอร์ 4 | ไม่รองรับคำขอใช้สิทธิของเจ้าของข้อมูล (เข้าถึง/สำเนา/แก้ไข/ลบ/คัดค้าน) ทำให้ผู้ป่วยไม่สามารถใช้สิทธิตาม PDPA ได้ นำไปสู่การร้องเรียน/บทลงโทษทางกฎหมาย | กลาง (5 AC ครอบคลุมหลายประเภทคำขอและ edge case input ไม่ถูกต้อง/ไม่มีสิทธิ์/ไม่พบผู้ป่วย) | กลาง (ตรงกับระดับความสำคัญ "กลาง" ใน [[backlog]]) | กลาง | ทดสอบครบทั้ง 5 AC ([[test-cases/pdpa-data-protection-compliance]]) ครอบคลุมทุกประเภทคำขอที่ spec กำหนด |
| NFR-08 (กลาง) — ฟีเจอร์ 4 | ไม่สามารถสืบค้น audit log สนับสนุนการสืบสวน/แจ้งเหตุละเมิดได้ทันเวลา เสี่ยงไม่ทันกรอบเวลาที่กฎหมายกำหนดสำหรับการแจ้งเหตุละเมิดข้อมูลส่วนบุคคล | กลาง (4 AC รวม edge case ช่วงเวลาไม่ถูกต้อง/ไม่มีสิทธิ์/ไม่พบผลลัพธ์) | กลาง (ตรงกับระดับความสำคัญ "กลาง" ใน [[backlog]]) | กลาง | ทดสอบครบทั้ง 4 AC ([[test-cases/pdpa-data-protection-compliance]]) ยืนยันว่าสืบค้นได้ครบทั้งกรณีระบุ/ไม่ระบุผู้ป่วย |
| NFR-09 (สูง) — ฟีเจอร์ 5 | หน้าจอค้นหา/ประวัติวินิจฉัย/ผลตรวจ lab/ผลวิเคราะห์ความเสี่ยงตอบสนองช้ากว่า 2 วินาที ทำให้แพทย์/พยาบาลเสียเวลาในการตัดสินใจทางคลินิกในสถานการณ์เร่งด่วน กระทบคุณภาพการดูแลผู้ป่วย — เพิ่มเติม (อัปเดต 2026-09-22): [[technology-stack]] ยืนยันแล้วว่ากลไกจริงคือ **Firestore composite index เท่านั้น ไม่มี caching layer เพิ่มเติม** ทำให้ทุก request ยังอ่าน Firestore ทุกครั้งแม้เป็นข้อมูลอ้างอิงคงที่ (เช่น threshold) เป็น known trade-off | กลาง (4 AC ครอบคลุม happy path + scope + composite index verification + trade-off baseline แต่ยังไม่เคยทดสอบจริงกับข้อมูลปริมาณมาก และพึ่งพา composite index ที่ต้อง deploy ให้ครบตาม [[db-spec]] เท่านั้น ไม่มี caching สำรอง) | สูง (Must have/MVP กระทบทุกหน้าจอหลักของระบบ) | สูง | ทดสอบ TC-05-01/TC-05-02/TC-05-14/TC-05-15 ([[test-cases/operational-quality-nfr]]) วัดเวลาตอบสนองของคำขอเดี่ยวทุกหน้าจอหลัก ยืนยัน composite index ครบไม่มี unindexed query warning และบันทึก baseline สำหรับทวนซ้ำเมื่อข้อมูลจริงมีปริมาณมากขึ้น |
| NFR-10 (กลาง) — ฟีเจอร์ 5 | ระบบใช้งานไม่ได้เกินมาตรฐาน SLA ของ Firebase ทำให้แพทย์/พยาบาลเข้าถึงข้อมูลผู้ป่วยไม่ได้ในช่วงเวลาที่ต้องการ | ต่ำ (1 AC พึ่งพา SLA มาตรฐานของผู้ให้บริการ ไม่ใช่ logic ที่ทีมพัฒนาต้องเขียนเอง) | กลาง (ตรงกับระดับความสำคัญ "กลาง" ใน [[backlog]]) | กลาง | ทดสอบ TC-05-03 ([[test-cases/operational-quality-nfr]]) ทวนสอบว่าไม่ตั้งค่า SLA ที่ขัดกับมาตรฐาน Firebase/Google Cloud |
| NFR-11 (สูง) — ฟีเจอร์ 5 | Deploy rule/threshold ใหม่ของ Risk Rule Engine โดยไม่ผ่านการยืนยันจากแพทย์ผู้เชี่ยวชาญ ทำให้ค่า threshold/การจับคู่โรคผิดพลาดทางคลินิก กระทบความปลอดภัยผู้ป่วยโดยตรง อาจพลาด/แจ้งเตือนผิดโรคแทรกซ้อนร้ายแรง | สูง (เป็น manual/organizational gate ที่พึ่งพากระบวนการคนล้วนๆ ไม่มีการบังคับทางเทคนิคในระบบ เสี่ยงถูกข้ามขั้นตอนได้ง่ายกว่า automated check) | สูง (ผู้ใช้ระบุว่าเป็นระดับความสำคัญสูงสุดในกลุ่ม NFR ชุดนี้ กระทบความปลอดภัยทางคลินิกโดยตรง เป็น Must have/MVP) | วิกฤต | ทดสอบ TC-05-04/TC-05-05 ([[test-cases/operational-quality-nfr]]) ยืนยันว่ามีหลักฐาน/checklist การอนุมัติก่อน deploy ทุกครั้ง ผนวกเป็นส่วนหนึ่งของ deployment approval gate/CI-CD ในอนาคต |
| NFR-12 (สูง) — ฟีเจอร์ 5 | ไม่ auto-logout เมื่อ idle เกิน 30 นาที ทำให้ผู้ที่ไม่ได้รับอนุญาตเข้าถึงข้อมูลผู้ป่วยผ่านอุปกรณ์ที่ถูกทิ้งไว้โดยไม่ล็อก กระทบความปลอดภัยข้อมูลผู้ป่วยและ PDPA — **เพิ่มเติม (อัปเดต 2026-09-22, ความเสี่ยงที่ยืนยันแล้วในการออกแบบปัจจุบัน ไม่ใช่สมมติฐาน):** [[technology-stack#10. กลไก Session Timeout (NFR-12) — Client Custom Inactivity Timer เท่านั้น (ไม่มี Server-side Token Revocation)\|technology-stack]] เลือกใช้ **client custom inactivity timer เท่านั้น** (`setTimeout` + event listener เรียก `signOut()`) **ไม่มี server-side token revocation** — ถ้า Firebase ID token ถูกขโมย/intercept ไว้ก่อนหน้า หรือ client ถูกดัดแปลง/บั๊กจนไม่เรียก `signOut()` จริง **token นั้นยังใช้เรียก Backend Service/Primary Data Store ได้ต่อจนกว่าจะหมดอายุตามธรรมชาติของ Firebase ID token (สูงสุดประมาณ 1 ชั่วโมง) — นานกว่า 30 นาทีที่ NFR-12 กำหนดไว้เกือบ 2 เท่า** ไม่มีกลไกฝั่งเซิร์ฟเวอร์ใดปิดช่องว่างนี้ (Access Control ตาม NFR-02 ตรวจสอบเพียงว่า token ถูกต้อง/ยังไม่หมดอายุเท่านั้น ไม่ตรวจสอบ inactivity) | **สูง** (ไม่ใช่แค่ 4 AC ที่ต้องทดสอบให้ครบ — ช่องโหว่นี้เป็นข้อจำกัดที่ยืนยันแล้วในสถาปัตยกรรมปัจจุบันเสมอ ไม่ใช่กรณีสมมติที่อาจไม่เกิด ผู้ใช้ที่ทำอุปกรณ์สูญหาย/token รั่วไหลจะเข้าเงื่อนไขนี้ได้ทุกครั้งที่เกิดเหตุการณ์นั้นจริง) | สูง (เชื่อมโยงกับ NFR-02 ที่เป็นความเสี่ยงร้ายแรงที่สุดในระบบ เป็น Must have/MVP กระทบข้อมูลสุขภาพผู้ป่วยโดยตรงหากถูกใช้ประโยชน์) | **วิกฤต** | ทดสอบครบทั้ง 4 AC ([[test-cases/operational-quality-nfr]] — TC-05-06/07/08 สำหรับพฤติกรรม auto-logout ปกติ, **TC-05-16 สำหรับยืนยัน/บันทึกความเสี่ยงด้านความปลอดภัยของ token ที่ยังใช้ได้ต่อ**) โดยเฉพาะยืนยันว่าคำขอหลัง auto-logout ถูกปฏิเสธจริงที่ฝั่งตรวจสอบสิทธิ์ (ไม่ใช่แค่ Client ซ่อน UI เฉยๆ) — **mitigation ที่ต้องทำก่อนใช้งานกับข้อมูลผู้ป่วยจริง (ตามที่ [[technology-stack]] แนะนำไว้แล้ว):** ลด TTL ของ Firebase ID token ให้สั้นลง และเพิ่ม server-side token revocation (`react-idle-timer` + Cloud Function `revokeRefreshTokens()`) — ต้องบันทึกผล TC-05-16 ไว้เป็นหลักฐานความเสี่ยงในทุกรอบทดสอบจนกว่า mitigation นี้จะถูก implement จริง |
| NFR-13 (กลาง) — ฟีเจอร์ 5 | ใช้สีเป็นสัญญาณเดียวในการแสดง flag ความเสี่ยง ทำให้ผู้ใช้ที่มีภาวะมองเห็นสีผิดปกติตีความผลลัพธ์ผิดพลาด พลาดสังเกตความเสี่ยงโรคแทรกซ้อนที่ระบบตรวจพบแล้ว — เพิ่มเติม (อัปเดต 2026-09-22): [[technology-stack]] ยืนยันกลไกจริงคือ WCAG 2.1 AA + Heroicons ตรวจสอบด้วย Lighthouse Accessibility Audit ก่อน deploy | กลาง (3 AC ครอบคลุม happy path + ทุกผลลัพธ์ 3 แบบ + Lighthouse audit ตรงไปตรงมา แต่ขึ้นกับการปฏิบัติตามจริงของทีมออกแบบ UI/prototype และการรัน Lighthouse สม่ำเสมอก่อน deploy ทุกครั้ง) | กลาง (ตรงกับระดับความสำคัญ "กลาง" ใน [[backlog]] แต่กระทบความปลอดภัยทางคลินิกทางอ้อมผ่าน FR-04) | กลาง | ทดสอบครบทั้ง 3 AC ([[test-cases/operational-quality-nfr]] — TC-05-09/10 สำหรับข้อความกำกับคู่กับสี, **TC-05-17 สำหรับ Lighthouse Accessibility Audit จริง**) ตรวจสอบทุกผลลัพธ์ 3 แบบของ FR-04 ว่ามีข้อความกำกับคู่กับสีเสมอ และผ่านเกณฑ์ Lighthouse ก่อน deploy ทุกครั้ง ทวนกับ [[DESIGN]] ก่อน deploy prototype |
| NFR-14 (สูง) — ฟีเจอร์ 5 | Firestore Security Rules ตั้งค่าผิดพลาดโดยไม่มี automated test ครอบคลุม ทำให้ข้อมูลผู้ป่วยรั่วไหลข้ามสิทธิ์ (โดยเฉพาะ Operation 0 ที่ Client อ่าน Firestore ตรง) กระทบ PDPA และความเป็นส่วนตัวของผู้ป่วยอย่างร้ายแรง | สูง (technology-stack ระบุไว้แล้วว่า Security Rules เขียน logic 2 ระดับได้ยากกว่าโค้ด backend ปกติมาก เสี่ยงตั้งค่าผิดพลาดสูง) | สูง (เชื่อมโยงโดยตรงกับ NFR-02 ซึ่งเป็นความเสี่ยงร้ายแรงที่สุดในระบบ เป็น Must have/MVP) | วิกฤต | ทดสอบครบทั้ง 2 AC ([[test-cases/operational-quality-nfr]]) ด้วย Firebase Emulator Suite ครอบคลุมอย่างน้อย 4 กรณีตาม technology-stack ก่อน deploy จริงทุกครั้ง ผนวกเป็นส่วนหนึ่งของ CI/CD pipeline ในอนาคต |
| NFR-15 (กลาง) — ฟีเจอร์ 5 | ระบบแสดงผล/ทำงานผิดพลาดบน browser/อุปกรณ์ที่คลินิก/รพ.สต. ใช้งานจริง ทำให้แพทย์/พยาบาลใช้งานระบบไม่ได้ในหน้างานจริง — เพิ่มเติม (อัปเดต 2026-09-22): [[technology-stack]] ยืนยัน browserslist config `">0.5%, last 2 versions, Firefox ESR, not dead"` เป็นกลไกจริงที่ควบคุม build target | ต่ำ (2 AC ตรงไปตรงมา ใช้ browser หลักที่ได้รับความนิยม/รองรับมาตรฐานเว็บอยู่แล้ว บวก config review ที่ตรวจสอบง่าย) | กลาง (ตรงกับระดับความสำคัญ "กลาง" ใน [[backlog]]) | กลาง | ทดสอบ TC-05-13/TC-05-18 ([[test-cases/operational-quality-nfr]]) บน Chrome/Edge/Firefox เวอร์ชันล่าสุด บน desktop/tablet และยืนยัน browserslist config ตรงตามที่กำหนดก่อนปล่อยแต่ละรอบ |
| FR-07 (สูง) — ฟีเจอร์ 6 | เข้าสู่ระบบผิดพลาด (ปฏิเสธผู้ใช้ที่ควรผ่าน หรือปล่อยให้ผู้ใช้ที่ยังไม่ยืนยันอีเมลเข้าถึงฟีเจอร์อื่นได้) ทำให้ผู้ใช้ที่มีสิทธิ์เข้าใช้งานไม่ได้ หรือผู้ใช้ที่ยังไม่ผ่านเงื่อนไขเข้าถึงข้อมูลผู้ป่วยได้ก่อนเวลาอันควร | กลาง (3 AC ครอบคลุม happy path + ข้อความรวมไม่เปิดเผยข้อมูล + เงื่อนไขยังไม่ยืนยันอีเมล) | สูง (เป็น precondition ก่อนฟีเจอร์ที่ 1-5 ทั้งหมด เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/user-authentication-email-password]]) ยืนยันข้อความรวมและการบล็อกก่อนยืนยันอีเมล |
| FR-08 (สูง) — ฟีเจอร์ 6 | สมัครบัญชีผิดพลาด (สร้างบัญชีที่มี role/isActive ไม่ตรงตามที่กำหนด, เปิดเผยว่าอีเมลซ้ำ, หรือเกิด orphaned Auth account เมื่อเขียน Firestore ล้มเหลว) ทำให้ผู้ใช้เข้าถึงข้อมูลผู้ป่วยก่อนได้รับอนุมัติ รั่วไหลข้อมูลว่าอีเมลใดมีบัญชีอยู่แล้ว หรือมีบัญชี Authentication ค้างที่ไม่มีสิทธิ์ใดๆ | กลาง (5 AC รวม edge case อีเมลซ้ำ, รหัสผ่านไม่ผ่านนโยบาย, เงื่อนไขบัญชีที่ยังไม่อนุมัติ, และ rollback เมื่อเขียน Firestore ล้มเหลว — เพิ่มใหม่ 2026-09-24 ตาม technology-stack decision area 17) | สูง (เป็นจุดเริ่มต้นของการควบคุมสิทธิ์ทั้งระบบ เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 5 AC ([[test-cases/user-authentication-email-password]]) เน้นยืนยัน `isActive=false`/ไม่มี role หลังสมัคร, ข้อความเดียวกันไม่ว่าอีเมลจะซ้ำหรือไม่ และ rollback ลบ Auth user เมื่อเขียน Firestore ล้มเหลว |
| FR-09 (สูง) — ฟีเจอร์ 6 | ไม่บล็อกผู้ใช้ที่ยังไม่ยืนยันอีเมล ไม่ส่งอีเมลยืนยันตัวตน หรือ Client ที่ถูกดัดแปลง/บั๊กข้ามการตรวจสอบแล้วเรียก Operation ตรง ทำให้ผู้ใช้ที่ยังไม่ยืนยันตัวตนเข้าถึงฟีเจอร์อื่นของระบบได้ | กลาง (4 AC ครอบคลุมการส่งอีเมล, ยืนยันสำเร็จ, บล็อกจนกว่าจะยืนยัน, และตรวจสอบ `email_verified` ซ้ำฝั่งเซิร์ฟเวอร์ที่ Operation 0/1-6 — เพิ่มใหม่ 2026-09-24 ตาม technology-stack decision area 19) | สูง (เป็นกลไกยืนยันตัวตนพื้นฐานก่อนเข้าถึงข้อมูลผู้ป่วยใดๆ เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 4 AC ([[test-cases/user-authentication-email-password]]) ยืนยันการบล็อกฟีเจอร์อื่นทั้งหมดจนกว่าจะยืนยันอีเมลสำเร็จ และการปฏิเสธที่ Security Rules/Cloud Functions เมื่อ `email_verified=false` แม้ role/isActive/PatientAssignment ผ่านครบ |
| FR-10 (สูง) — ฟีเจอร์ 6 | ขอรีเซ็ตรหัสผ่านเปิดเผยว่าอีเมลมีบัญชีอยู่หรือไม่ หรือยอมให้ตั้งรหัสผ่านใหม่ที่ไม่ผ่านนโยบาย ทำให้เสี่ยงรั่วไหลข้อมูลบัญชี/ตั้งรหัสผ่านไม่ปลอดภัย | กลาง (3 AC รวม edge case รหัสผ่านใหม่ไม่ผ่านนโยบาย) | สูง (เกี่ยวข้องโดยตรงกับความปลอดภัยของบัญชีผู้ใช้ เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/user-authentication-email-password]]) เน้นข้อความเดียวกันเสมอและการบังคับใช้นโยบายรหัสผ่านใหม่ |
| NFR-17 (สูง) — ฟีเจอร์ 6 | รหัสผ่านที่ไม่ผ่านนโยบายขั้นต่ำหลุดผ่านการตรวจสอบที่ Operation 8 (regex) หรือ Operation 9b (Identity Platform backstop) ทำให้บัญชีผู้ใช้เสี่ยงถูกเดา/โจมตีด้วยรหัสผ่านอ่อนแอ | กลาง (3 AC รวมกลไกที่ต่างกัน 2 จุด — regex ในโค้ดที่ Operation 8 และ Identity Platform password policy backstop ที่ Operation 9b เพราะไม่มี Cloud Function คั่นกลาง — เพิ่มใหม่ 2026-09-24 ตาม technology-stack decision area 13) | สูง (เป็นกลไกความปลอดภัยพื้นฐานที่ FR-08/FR-10 ซึ่งเป็น MVP ต้องพึ่งพา เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/user-authentication-email-password]]) ทั้งฝั่งสมัครบัญชี (regex) และรีเซ็ตรหัสผ่าน (Identity Platform backstop ที่ Operation 9b) |
| NFR-18 (สูง) — ฟีเจอร์ 6 | ข้อความแจ้งเตือนเปิดเผยว่าอีเมลใดมีบัญชีอยู่ในระบบหรือไม่ (account enumeration) ทำให้ผู้ไม่ประสงค์ดีสำรวจหา/โจมตีบัญชีที่มีอยู่จริงในระบบได้ | สูง (ต้องตรวจสอบให้ข้อความเหมือนกันทุกประการใน 3 จุด — เข้าสู่ระบบผิดพลาด, สมัครซ้ำ, รีเซ็ตรหัสผ่าน — เสี่ยงหลุดพลาดได้ง่ายถ้า implement แยกกัน) | สูง (เป็นความเสี่ยงด้านความปลอดภัยบัญชีผู้ใช้ระดับระบบ เป็น Must have/MVP) | วิกฤต | ทดสอบครบทั้ง 1 AC ครอบคลุมทั้ง 3 จุด ([[test-cases/user-authentication-email-password]]) ยืนยันข้อความเหมือนกันทุกประการในทุกสถานการณ์ |
| FR-11 (สูง) — ฟีเจอร์ 7 | อนุมัติบัญชีผิดพลาด (กำหนด role ผิด, อนุมัติโดยไม่กำหนด role, หรือผู้ไม่ใช่ admin อนุมัติได้) ทำให้ผู้ใช้ที่ไม่ควรมีสิทธิ์เข้าถึงข้อมูลผู้ป่วยได้ก่อนเวลาอันควร หรือผู้ใช้ที่สมัครถูกต้องแล้วเข้าใช้งานไม่ได้ | กลาง (4 AC ครอบคลุม happy path + รายการว่าง + ไม่ระบุ role + ปฏิเสธสิทธิ์ผู้ไม่ใช่ admin ไม่ซับซ้อนมาก) | สูง (เป็นจุดเริ่มต้นของการควบคุมสิทธิ์ทั้งระบบหลังแทนที่กลไก Firebase Console เดิม เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 4 AC ([[test-cases/admin-role-account-management]]) เน้นยืนยัน `isActive`/role อัปเดตถูกต้องและปฏิเสธผู้ไม่ใช่ admin |
| FR-12 (สูง) — ฟีเจอร์ 7 | เปลี่ยน role ผิดพลาดหรือผู้ไม่มีสิทธิ์เปลี่ยน role ได้ ทำให้ผู้ใช้ได้สิทธิ์ที่ไม่ตรงกับบทบาทจริงของตน | กลาง (3 AC ตรงไปตรงมา) | สูง (กระทบการควบคุมสิทธิ์ทั้งระบบ เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/admin-role-account-management]]) เน้นปฏิเสธผู้ไม่ใช่ admin และกรณีบัญชียังไม่เคยอนุมัติ |
| FR-13 (สูง) — ฟีเจอร์ 7 | ระงับบัญชีไม่มีผลทันที (ผู้ใช้ที่ถูกระงับยังเข้าถึงข้อมูลผู้ป่วยได้ต่อ) ทำให้เกิดการเข้าถึงข้อมูลผู้ป่วยโดยไม่ได้รับอนุญาต | กลาง (3 AC แต่ต้องยืนยันว่า Backend ตรวจสอบ `isActive` ทุกคำขอ ไม่ใช่แค่ตอน login) | สูง (กระทบความปลอดภัยข้อมูลผู้ป่วยโดยตรง เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/admin-role-account-management]]) เน้นยืนยันว่าคำขอถัดไปหลังถูกระงับถูกปฏิเสธจริงที่ Backend |
| FR-14 (สูง) — ฟีเจอร์ 7 | มอบหมาย/ยกเลิกมอบหมายผู้ป่วยผิดพลาด ทำให้แพทย์/พยาบาลเห็นผู้ป่วยที่ไม่ควรเห็น หรือไม่เห็นผู้ป่วยที่ควรดูแล กระทบทั้งการดูแลผู้ป่วยและ PDPA | กลาง (4 AC รวม edge case มอบหมายซ้ำ/ปฏิเสธสิทธิ์) | สูง (เป็นเงื่อนไข "อยู่ในความดูแล" ที่ควบคุมการมองเห็นผู้ป่วยทั้งหมดของ FR-05 เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 4 AC ([[test-cases/admin-role-account-management]]) และ regression กับ [[test-cases/patient-search-selection]] ว่ารายชื่อผู้ป่วยเปลี่ยนตามการมอบหมายจริง |
| FR-15 (สูง) — ฟีเจอร์ 7 | Admin เข้าถึง/แก้ไขข้อมูลทางคลินิกผิดขอบเขต (แก้ไขได้ทั้งที่ควร read-only เท่านั้น) หรือแสดงข้อมูลผิดผู้ป่วย กระทบความถูกต้องทางคลินิกและ PDPA จากการเข้าถึงแบบไม่จำกัดขอบเขตของ admin | กลาง (3 AC รวม edge case ปฏิเสธการแก้ไขและไม่พบผู้ป่วย) | สูง (Admin เข้าถึงได้ทุกผู้ป่วยในระบบโดยไม่มี PatientAssignment กั้น ความเสี่ยงจึงกว้างกว่าแพทย์/พยาบาล เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/admin-role-account-management]]) เน้นยืนยันว่า admin ไม่มีสิทธิ์แก้ไขข้อมูลทางคลินิกใดๆ เลย |
| NFR-19 (สูง) — ฟีเจอร์ 7 | ข้อยกเว้น PatientAssignment ของ admin ถูก implement ผิดพลาด (เช่น แพทย์/พยาบาลได้รับข้อยกเว้นนี้ไปด้วย หรือ admin ที่ถูกระงับยังเข้าถึงได้) ทำให้ควบคุมสิทธิ์ผิดพลาดทั้งสองทิศทาง | สูง (ต้องแยก logic ชัดเจนระหว่าง role=admin กับ role=แพทย์/พยาบาล ในจุดตรวจสอบสิทธิ์เดียวกัน เสี่ยงเขียนเงื่อนไขผิดพลาดได้ง่าย) | สูง (เชื่อมโยงโดยตรงกับ NFR-02 ซึ่งเป็นความเสี่ยงร้ายแรงที่สุดในระบบ เป็น Must have/MVP) | วิกฤต | ทดสอบครบทั้ง 3 AC ([[test-cases/admin-role-account-management]]) รวม security regression กับ NFR-02/NFR-14 ทุกครั้งที่แก้ไข logic สิทธิ์ |
| NFR-20 (สูง) — ฟีเจอร์ 7 | Audit log ของการเข้าถึงข้อมูลผู้ป่วยโดย admin ไม่ถูกบันทึกหรือไม่ fail-safe ทำให้ไม่สามารถตรวจสอบย้อนหลังการเข้าถึงแบบไม่จำกัดขอบเขตของ admin ได้ กระทบ PDPA อย่างร้ายแรงกว่าการเข้าถึงแบบจำกัดของแพทย์/พยาบาล | กลาง (3 AC รวม fail-safe logic คล้าย NFR-06 แต่ต้องแยกบันทึกจาก audit log ของแพทย์/พยาบาล) | สูง (Admin เข้าถึงได้ทุกผู้ป่วยในระบบ ความเสี่ยงด้าน PDPA จึงสูงกว่าการเข้าถึงแบบจำกัดตาม NFR-06 เป็น Must have/MVP) | สูง | ทดสอบครบทั้ง 3 AC ([[test-cases/admin-role-account-management]]) เน้น fail-safe และการแยกบันทึก audit log ของ admin ออกจากแพทย์/พยาบาลให้ชัดเจน |

## 5. Entry / Exit Criteria

### Entry Criteria (เริ่มทดสอบได้เมื่อ)

- [[backlog]], [[feature-list]], [[user-journey]] และ [[acceptance-criteria]] up to date ตรงกันครบ
  ทุกรหัส FR/NFR (ไม่มี gate ค้างตามกฎของ `test-plan-writer`)
- Test case ใน `test-cases/{feature-slug}.md` ครบทุกฟีเจอร์ และแต่ละ AC มี test case อ้างอิงอย่างน้อย
  1 รายการ
- เมื่อเริ่มพัฒนาจริงแล้ว: `technology-stack.md` ต้องถูกกำหนดแล้ว และมี build/deploy environment ที่
  ทดสอบได้จริง (ไม่ใช่แค่ prototype)

### Exit Criteria (ปิดรอบทดสอบได้เมื่อ)

- Test case ที่มีระดับความสำคัญ "สูง" (ตาม [[backlog]]) ผ่านครบ 100%
- ไม่มี defect ระดับ critical/high ที่ยังเปิดอยู่ในฟีเจอร์ระดับ Must have ใดๆ
- Test case ที่มีระดับความสำคัญ "กลาง"/"ต่ำ" ผ่านอย่างน้อยตามเกณฑ์ที่ทีมตกลงกันก่อนปล่อยแต่ละรอบ
  (release-specific — ยังไม่มี release-plan ให้ยึดในขณะที่เขียนเอกสารนี้)
- ทุก gap ที่พบระหว่างทดสอบถูกบันทึกกลับเข้า backlog/spec ผ่าน workflow ที่ถูกต้อง (ไม่แก้ไขเอกสาร
  ต้นทางโดยตรงจากผลทดสอบ)

## 6. บทบาทผู้ทดสอบ

ระบบนี้มีบทบาทผู้ใช้งานในขอบเขต **2 บทบาท**: **แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD** และ **Admin
(ผู้ดูแลระบบ)** (ตาม [[user-journey]] — ไม่มีบทบาท Manager/Owner อื่นนอกเหนือจากนี้ที่ต้องทดสอบแยกใน
ระบบนี้ — **อัปเดต 2026-09-24:** Admin เป็นบทบาทใหม่ตามฟีเจอร์ที่ 7) ผู้ทดสอบ (QA) จำลองบทบาทแพทย์/
พยาบาลในทุก test case ของฟีเจอร์ 1-6 รวมถึงกรณี "เจ้าหน้าที่ที่มีสิทธิ์" ใน Journey ที่สองของ PDPA
(เป็นบทบาทเดียวกัน ไม่ใช่บทบาทใหม่) และกรณี guard/negative ที่ผู้ทดสอบต้องจำลองบัญชีที่ไม่มีสิทธิ์
(บทบาทอื่น/บัญชีถูกระงับ) เพื่อยืนยันพฤติกรรมปฏิเสธการเข้าถึงตาม NFR-02 สำหรับฟีเจอร์ที่ 7 ผู้ทดสอบต้อง
จำลองบัญชี Admin แยกต่างหาก (สร้างผ่าน Firebase Console/Firestore โดยตรงในสภาพแวดล้อมทดสอบ ตามที่
FR-11–FR-15 ระบุว่าการ bootstrap admin คนแรกอยู่นอกขอบเขตของฟีเจอร์ในระบบ) รวมถึงจำลองบัญชีแพทย์/
พยาบาลเพื่อยืนยันว่าไม่ได้รับข้อยกเว้น NFR-19 ที่เป็นของ admin เท่านั้น

## 7. ตารางสรุปฟีเจอร์ ↔ ไฟล์ test case ↔ จำนวน AC ที่ครอบคลุม

| # | ฟีเจอร์ | ไฟล์ test case | จำนวน AC ที่ครอบคลุม (นับ AC ที่ test case ในไฟล์นี้อ้างอิงถึงจริง รวมที่ cross-reference มาจากฟีเจอร์อื่น) | จำนวน test case |
| --- | --- | --- | --- | --- |
| 1 | ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD | [[test-cases/patient-ncd-diagnosis-lab-history]] | FR-01 (3 AC), FR-02 (4 AC), NFR-01 (1 AC), NFR-02 (2 AC: AC-2, AC-3) = 10 AC | 10 |
| 2 | วิเคราะห์ แจ้งเตือน และยืนยัน/แก้ไขผลประเมินความเสี่ยงโรคแทรกซ้อน | [[test-cases/complication-risk-analysis-alert]] | FR-03 (5 AC), FR-04 (3 AC), FR-16 (5 AC), NFR-01 (1 AC, cross-ref จากฟีเจอร์ 1), NFR-02 (2 AC: AC-2 cross-ref, AC-4 ใหม่) = 16 AC | 13 |
| 3 | ค้นหา/เลือกผู้ป่วยในความดูแล | [[test-cases/patient-search-selection]] | FR-05 (3 AC), FR-06 (3 AC), NFR-02 (2 AC: AC-1 cross-ref, AC-5 ใหม่) = 8 AC | 10 |
| 4 | คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA | [[test-cases/pdpa-data-protection-compliance]] | NFR-03 (2 AC), NFR-04 (2 AC), NFR-05 (4 AC), NFR-06 (3 AC), NFR-07 (5 AC), NFR-08 (4 AC) = 20 AC | 20 |
| 5 | รับประกันคุณภาพเชิงปฏิบัติการของระบบ | [[test-cases/operational-quality-nfr]] | NFR-09 (4 AC), NFR-10 (1 AC), NFR-11 (2 AC), NFR-12 (4 AC), NFR-13 (3 AC), NFR-14 (2 AC), NFR-15 (2 AC) = 18 AC (NFR-16 ไม่มี AC — Won't have) | 18 |
| 6 | สมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่านด้วยอีเมล (Authentication) | [[test-cases/user-authentication-email-password]] | FR-07 (3 AC), FR-08 (5 AC), FR-09 (4 AC), FR-10 (3 AC), NFR-17 (3 AC), NFR-18 (1 AC) = 19 AC | 19 |
| 7 | จัดการบัญชีผู้ใช้งาน สิทธิ์ และการมอบหมายผู้ป่วย (Admin) | [[test-cases/admin-role-account-management]] | FR-11 (4 AC), FR-12 (3 AC), FR-13 (3 AC), FR-14 (4 AC), FR-15 (3 AC), NFR-19 (3 AC), NFR-20 (3 AC) = 23 AC | 23 |

**รวม:** 7 ฟีเจอร์, 34 รหัส FR/NFR ที่อยู่ในขอบเขต (ไม่รวม NFR-16), 113 test case —
[[acceptance-criteria]] มี AC ทั้งหมด 112 ข้อ (รวม NFR-01, NFR-02 ที่ถูกอ้างอิงซ้ำข้ามฟีเจอร์ — อัปเดต
2026-09-23: เพิ่มขึ้นจาก 65 เป็น 81 ข้อ เนื่องจากเพิ่มหัวข้อ "6. สมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่าน
ด้วยอีเมล (Authentication)" ที่ขาดหายไปทั้งหมด 16 AC ใหม่ (FR-07–FR-10, NFR-17, NFR-18); อัปเดต
2026-09-24 (รอบสาม): เพิ่มขึ้นอีกจาก 81 เป็น 84 ข้อ เนื่องจากเทียบกับ [[technology-stack]] รอบสาม
(decision area 13–19) พบ AC ที่ขาดหายไป 3 ข้อใหม่ — FR-08 AC-5 (rollback ลบ Auth user เมื่อเขียน
Firestore ล้มเหลว), FR-09 AC-4 (ตรวจสอบ `email_verified` ซ้ำฝั่งเซิร์ฟเวอร์ที่ Operation 0/1-6), NFR-17
AC-3 (กลไก Identity Platform password policy backstop ที่ Operation 9b); **อัปเดต 2026-09-24 (รอบสี่,
sync-test-plan):** เพิ่มขึ้นอีกจาก 84 เป็น 112 ข้อ เนื่องจาก feature-list/user-journey เพิ่งเพิ่มฟีเจอร์
ที่ 7 (Admin — FR-11–FR-15, NFR-19, NFR-20 = 23 AC ใหม่) และ FR-16 เข้าฟีเจอร์ที่ 2 (5 AC ใหม่) รวม
28 AC ใหม่ — ครอบคลุมครบทุกข้อโดย test case อย่างน้อย 1 รายการต่อ AC

**หมายเหตุ (ขอบเขตฟีเจอร์ที่ 7):** [[test-cases/admin-role-account-management]] เป็นไฟล์ใหม่ที่สร้าง
ในรอบนี้ ยังไม่มี detailed-design/prototype ของฟีเจอร์ Admin ณ ปัจจุบัน test case จึงอ้างอิงพฤติกรรม
จาก [[acceptance-criteria]]/[[user-journey]]/spec ต้นทางโดยตรง (ไม่มีชื่อหน้าจอ prototype ที่แน่นอนให้
อ้างอิง) รอสาย technical spec/prototype sync ตาม feature-list/user-journey ที่เพิ่งอัปเดตในรอบต่อไป

## เอกสารที่เกี่ยวข้อง

- [[acceptance-criteria]]
- [[feature-list]]
- [[user-journey]]
- [[backlog]]
- [[technology-stack]]
- [[architecture]]
- [[db-spec]]
- [[DESIGN]]
- [[test-cases/patient-search-selection]]
- [[test-cases/patient-ncd-diagnosis-lab-history]]
- [[test-cases/complication-risk-analysis-alert]]
- [[test-cases/pdpa-data-protection-compliance]]
- [[test-cases/operational-quality-nfr]]
- [[test-cases/user-authentication-email-password]]
- [[test-cases/admin-role-account-management]]
- [[20260923-01-user-authentication-email-password]]
- [[20260924-01-admin-role-account-management]]
- [[../../02-design/01-prototypes/20260918-01-v1/prototype|prototype v1]]
