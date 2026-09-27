# API Spec (Logical Operation Contract)

เอกสารนี้อธิบายสัญญาการทำงาน (operation contract) ของความสามารถที่
[[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Backend Service]] และ
[[architecture#บริการยืนยันตัวตน (Authentication Service)|Authentication Service]] ใน [[architecture]]
ต้องมี เพื่อรองรับฟีเจอร์ทั้งเจ็ดใน [[feature-list]] และทั้งสี่ journey ใน [[user-journey]] อ้างอิงความ
ต้องการต้นทางจาก [[backlog]],
[[20260917-01-patient-ncd-history-lab-complication-risk]] (รวม FR-16 — ยืนยัน/แก้ไขผลการประเมิน
ความเสี่ยง),
[[20260921-01-pdpa-data-protection-compliance]] (ฟีเจอร์ที่ 4 — คุ้มครองข้อมูลส่วนบุคคลตาม PDPA,
NFR-03–NFR-08),
[[20260922-01-operational-quality-nfr]] (ฟีเจอร์ที่ 5 — รับประกันคุณภาพเชิงปฏิบัติการของระบบ,
NFR-09–NFR-16),
[[20260923-01-user-authentication-email-password]] (ฟีเจอร์ที่ 6 — สมัครบัญชี เข้าสู่ระบบ และจัดการ
รหัสผ่านด้วยอีเมล, FR-07–FR-10, NFR-17–NFR-18) และ
[[20260924-01-admin-role-account-management]] (ฟีเจอร์ที่ 7 — จัดการบัญชีผู้ใช้งาน สิทธิ์ และการ
มอบหมายผู้ป่วยโดยบทบาท Admin, FR-11–FR-15, NFR-19–NFR-20) field ของ input/output แต่ละ operation
ตรงกับ attribute ของ entity ใน [[db-spec]] เสมอ

**อัปเดต 2026-09-26 (รอบ sync-api-db — เรียกจาก `/audit-pipeline`) — เพิ่ม FR-17/NFR-21 (AI ช่วย
อธิบายผลการค้นหาด้วย HN) และแก้ไขจังหวะ validation ของ FR-06 สอดคล้องกับ [[architecture]]/
[[feature-list]] ที่ sync วันนี้:**

- **Operation 0:** แก้ไขข้อความที่เคยระบุว่า "ตรวจสอบรูปแบบ HN หลังกดค้นหาแล้วเท่านั้น ไม่ใช่
  real-time ระหว่างพิมพ์" (ล้าสมัยแล้ว) — ตอนนี้ระบบตรวจสอบรูปแบบ/ค้นหาด้วย HN **ทั้งตอนหยุดพิมพ์
  ชั่วขณะ (debounce 500ms) และตอนกดปุ่มค้นหา** ทั้งสองจังหวะทำงานเหมือนกันทุกประการ (ตรวจรูปแบบ →
  query → พบ/ไม่พบ) ยกเว้นมีเพียงจังหวะกดค้นหาเท่านั้นที่เรียก Operation 17 ใหม่ด้านล่างต่อ (FR-06
  แก้ไข 2026-09-26)
- **Operation 17 ใหม่:** "อธิบายผลการค้นหาผู้ป่วยด้วย HN โดยบริการ AI ภายนอก" รองรับ FR-17/NFR-21 —
  Client เรียก [[architecture#บริการ AI ภายนอก (External AI Service)|บริการ AI ภายนอก (External AI
  Service)]] ตรง (ไม่ผ่าน Backend Service) เฉพาะตอนกดปุ่มค้นหาเท่านั้น **ไม่มี entity ใหม่ใน
  [[db-spec]]** เพราะไม่มีการเก็บผลลัพธ์ AI ไว้ที่ใดเลย (ดูรายละเอียด operation ด้านล่างและหมายเหตุใน
  [[db-spec#ประเด็นรอตัดสินใจ|db-spec]])

field ของเอกสารนี้ถูกปรับปรุงให้ตรงกับ [[db-spec]] ในรอบเดียวกันนี้แล้ว

**อัปเดต 2026-09-25 (รอบ sync-api-db — เรียกจาก `/audit-pipeline`) — ยกเลิกกลไก PatientAssignment
ทั้งระบบ สอดคล้องกับ [[architecture]] ที่ sync วันนี้:** แพทย์/พยาบาล/Admin ทุกคนเห็นและเข้าถึงผู้ป่วย
**ทุกราย**ในระบบเหมือนกันหลังเข้าสู่ระบบ ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไป — สรุปการเปลี่ยนแปลง:

- **Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (Access Control):** ลบขั้นตอน "ตรวจสอบระดับ
  รายผู้ป่วย (patient-level)" ออกทั้งหมด (ไม่มี `PatientAssignment` ให้ตรวจสอบอีกต่อไป) — เหลือเฉพาะ
  ตรวจสอบระดับบทบาท (role-level, รวม admin), `email_verified` และ purpose limitation — Admin ไม่ใช่
  "ข้อยกเว้น" ของ NFR-19 อีกต่อไป เพราะแพทย์/พยาบาลเข้าถึงผู้ป่วยทุกรายเหมือนกันอยู่แล้ว
- **Operation 0 (ค้นหา/แสดงรายชื่อผู้ป่วย):** รวมเข้ากับ **Operation 15 เดิม** เป็น operation เดียว
  ครอบคลุมทุกบทบาท (แพทย์/พยาบาล/Admin) เพราะไม่มีเหตุผลทางเทคนิค/สิทธิ์ให้ต้องแยกเส้นทางอีกต่อไป —
  Client อ่าน collection `patients` โดยตรงผ่าน Security Rules (แทนที่ `patientAssignments` ที่ถูกลบ)
  ด้วย equality query บน `hn` (ไม่ต้องมี composite index — ตรงกับข้อมูลอ้างอิงจากโค้ดจริงของ `web/`)
- **Operation 14 (จัดการการมอบหมายผู้ป่วย) ถูกลบออกทั้งหมด** (FR-14 ยกเลิกแล้ว)
- **Operation 15 (ค้นหา/แสดงรายชื่อผู้ป่วยสำหรับ Admin) ถูกลบออก — รวมเข้ากับ Operation 0 แล้ว**
- **Operation 1/2/3/4/5/16:** ลบเงื่อนไข/ข้อความอ้างอิง PatientAssignment ทั้งหมด (ไม่มีการตรวจสอบ
  ระดับรายผู้ป่วยอีกต่อไปไม่ว่าบทบาทใด)

field ของเอกสารนี้ถูกปรับปรุงให้ตรงกับ [[db-spec]] ในรอบเดียวกันนี้แล้ว

**อัปเดต 2026-09-24 (รอบ sync ที่หก) — เพิ่มฟีเจอร์ที่ 7 (Admin, FR-11–FR-15, NFR-19, NFR-20) และ FR-16
(ยืนยัน/แก้ไขผลการประเมินความเสี่ยง):** สอดคล้องกับ [[architecture]] ที่อัปเดตวันนี้ เพิ่ม Operation
10-16 ใหม่ (ดูหัวข้อของแต่ละ operation ด้านล่าง) และปรับปรุงหัวข้อ "บทบาทผู้เรียกใช้ (Roles)",
"Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (เพิ่มข้อยกเว้น NFR-19), "Operation ร่วม —
บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย" (เพิ่ม field `เข้าถึงในฐานะ Admin หรือไม่` ตาม NFR-20) และ
Operation 1/2/3 (เพิ่ม Admin เป็นผู้เรียกได้) — สามจุดที่ spec ไม่ได้ระบุรายละเอียดโครงสร้างชัดเจน
(โครงสร้างข้อมูล FR-16, โครงสร้าง audit log NFR-20, การป้องกัน Admin ล็อกตัวเองออกจากสิทธิ์ Admิน) ได้
ถามผู้ใช้จริงผ่าน `NEEDS_USER_INPUT` และได้รับคำตอบยืนยันแล้ว — สรุป: (1) FR-16 บันทึกโดย mutate
attribute ใหม่ลงใน `ComplicationRiskAssessment` เดิมโดยตรง (ไม่สร้าง entity ใหม่) ผ่าน Operation 16
ใหม่, (2) NFR-20 ใช้ `AuditLogRecord` เดียวกับ NFR-06 เพิ่ม attribute `เข้าถึงในฐานะ Admin หรือไม่`,
(3) Operation 12/13 (เปลี่ยน role/ระงับ-เปิดใช้งานบัญชี) ต้องปฏิเสธเมื่อ target userId เป็นของผู้เรียก
เอง (ป้องกัน lockout) — ดูรายละเอียดที่ [[db-spec]] คู่กัน

**อัปเดต 2026-09-24 (รอบ sync ที่ห้า) — สอดคล้องกับ `[[technology-stack]]` รอบสาม (decision area
7 แก้ไข + 13-19 ใหม่):** แก้ไขทุกจุดที่เคยอ้างอิง "Custom Claims เก็บบทบาท/isActive" ให้ตรงกับการ
ตัดสินใจใหม่ว่า **ไม่ sync ไปยัง Custom Claims เลย** — Firestore `users/{uid}` เป็น source of truth
เดียวที่ทั้ง Security Rules (Operation 0) และ Cloud Functions (Operation 1-6) อ่านตรงทุกครั้ง (ดู
Output/Technical Binding ของ Operation 7 และ Technical Binding ของ Operation ร่วม Access Control)
เพิ่มการตรวจสอบ `email_verified` ซ้ำที่ Operation ร่วม Access Control (กฎข้อ 2.5 ใหม่ + error case ใหม่
+ Technical Binding) ตาม decision area 19, ปรับ Technical Binding ของ Operation 8/9 ให้ระบุกลไกจริง
ตาม decision area 13 (password policy), 14 (email enumeration prevention), 15 (เทมเพลตอีเมล), 17
(การสร้าง `users/{uid}` + rollback) และแก้ Operation 9 ให้แยก Technical Binding เป็น 9a/9b ให้ตรงกับ
ความจริงที่ `confirmPasswordReset` ไม่ผ่าน Cloud Function ปิดรายการ "ประเด็นรอตัดสินใจ" ที่ตัดสินใจแล้ว

**อัปเดต 2026-09-23 (รอบ sync ที่สี่) — เพิ่ม Operation สำหรับฟีเจอร์ที่ 6 (Authentication):**
เพิ่ม Operation 7 (เข้าสู่ระบบ — FR-07), Operation 8 (สมัครบัญชี — FR-08/FR-09, NFR-17, NFR-18)
และ Operation 9 (ขอรีเซ็ตรหัสผ่าน — FR-10, NFR-17, NFR-18) ด้านล่าง พร้อมหัวข้อใหม่
[[#Cross-cutting: Authentication ที่ครอบคลุมทุก Operation หลัง Login (FR-07–FR-10, NFR-17, NFR-18)]]
ที่อธิบายผลกระทบต่อ Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" — สอดคล้องกับการตัดสินใจ
สถาปัตยกรรมที่ผู้ใช้ยืนยันแล้วผ่าน `NEEDS_USER_INPUT` ใน [[architecture]] (ดูหมายเหตุการอัปเดตล่าสุด
ต้นเอกสาร [[architecture]])

**หมายเหตุสำคัญ:** เอกสารนี้อธิบายเป็นหลักในระดับ operation เชิงตรรกะ (ชื่อ operation, ผู้เรียกได้/
บทบาท, input, output, กฎทางธุรกิจ, กรณี error) — field ของ input/output แต่ละ operation ตรงกับ
attribute ของ entity ใน [[db-spec]] เสมอ

**อัปเดต 2026-09-22 (รอบ sync ที่สอง) — ตรวจสอบความสอดคล้องกับฟีเจอร์ที่ 5 (NFR-09–NFR-16):** หลังจาก
[[architecture]] ถูกอัปเดตให้ map NFR-09–NFR-16 เข้ากับ component เดิมทั้ง 5 ตัวแล้ว (ไม่มี component
ใหม่) พบว่าฟีเจอร์ที่ 5 **ไม่ต้องเพิ่ม operation ใหม่ในเอกสารนี้** เช่นกัน เนื่องจากเป็นข้อกำหนดเชิง
คุณภาพ (quality attribute) ที่ผูกกับ operation ที่มีอยู่แล้วทั้งหมด — ดูหัวข้อใหม่
[[#Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)]] ด้านล่าง
สำหรับสรุปว่าแต่ละรหัส NFR กระทบ operation ใดอย่างไร และดูหมายเหตุเพิ่มเติมที่แทรกไว้ใน Operation ร่วม
"ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (NFR-12) และ Operation 3 (NFR-11, NFR-13)

**อัปเดต 2026-09-22 — เสริมรายละเอียดเทคโนโลยีจริง (ตาม `[[technology-stack]]`):** `[[technology-stack]]`
มีเนื้อหาแล้วและตัดสินใจว่าระบบเป็นสถาปัตยกรรม Firebase-native — **ไม่มี REST/GraphQL/gRPC API แบบ
ดั้งเดิม** แต่แบ่งเป็น 2 กลไกจริงตาม
[[technology-stack#3. สถาปัตยกรรม Backend Service — Firebase-native (ไม่มี Backend Service แยกแบบดั้งเดิม)|decision area 3]]:
**Operation 0** implement เป็น **Client อ่าน Cloud Firestore ตรงผ่าน Firebase SDK + Firestore
Security Rules** (ไม่ผ่าน Cloud Functions) ส่วน **Operation 1-6** implement เป็น **Cloud Functions
(2nd gen, Node.js + TypeScript) — HTTPS Callable Functions** (Operation 1-5) หรือ **scheduled
function ผ่าน Cloud Scheduler** (Operation 6) — ทุก operation ด้านล่างจึงมีหัวข้อย่อย **"Technical
Binding"** ต่อท้ายระบุกลไกจริง (ชื่อ Cloud Function/query pattern จริง) พร้อม error code จริงที่ใช้
สื่อสารแต่ละกรณี error (Firebase Callable Functions ใช้ `functions.https.HttpsError` พร้อม error
code มาตรฐานของ Firebase เช่น `unauthenticated`, `permission-denied`, `invalid-argument`,
`not-found`, `failed-precondition`, `internal`) รายละเอียดเนื้อหาเชิง logical เดิม (input/output/
กฎทางธุรกิจ) ยังคงอยู่ครบทุกจุด รายการที่ยังไม่ถูกตัดสินใจสรุปไว้ในหัวข้อ "ประเด็นรอตัดสินใจ" ท้ายเอกสาร

## บทบาทผู้เรียกใช้ (Roles)

มีสามบทบาทในขอบเขตนี้ตามที่ระบุใน [[user-journey]] (เพิ่ม Admin ในรอบ sync ที่หก ตาม
[[20260924-01-admin-role-account-management]]):

- **แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD** — บทบาท "แพทย์" หรือ "พยาบาล" ของ entity ผู้ใช้ (User) ใน
  [[db-spec#ผู้ใช้ (User)|db-spec]] ([[backlog#Non-Functional Requirements|NFR-02]]) — บทบาทเดียวกันนี้
  ทำหน้าที่เป็น "เจ้าหน้าที่ที่มีสิทธิ์" เมื่อดำเนินการตามคำขอสิทธิของเจ้าของข้อมูล (Operation 4) หรือ
  สืบค้น audit trail (Operation 5) ตาม [[user-journey#Journey เจ้าหน้าที่ดำเนินการตามคำขอใช้สิทธิของเจ้าของข้อมูล และสนับสนุนการสืบสวนกรณีข้อมูลส่วนบุคคลรั่วไหล (PDPA)|journey ที่สอง]] —
  [[20260921-01-pdpa-data-protection-compliance#บทบาทที่เกี่ยวข้อง|spec PDPA ยืนยันว่าไม่มีการเพิ่มบทบาทใหม่]]
  (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสารว่าควรจำกัดเพิ่มเติมหรือไม่) — เฉพาะบทบาทนี้เท่านั้นที่เรียก
  Operation 16 (FR-16 — ยืนยัน/แก้ไขผลการประเมินความเสี่ยง) ได้ ไม่ใช่สิทธิ์ของ Admin
- **Admin (ผู้ดูแลระบบ)** — บทบาท `"admin"` ของ entity ผู้ใช้ (User) ใน
  [[db-spec#ผู้ใช้ (User)|db-spec]] — **ใหม่จากฟีเจอร์ที่ 7**
  ([[20260924-01-admin-role-account-management#บทบาทที่เกี่ยวข้อง|spec Admin]]) เข้าสู่ระบบด้วยกลไก
  เดียวกับแพทย์/พยาบาล (Operation 7) แล้วเรียก Operation 10-13 ด้านล่าง (อนุมัติบัญชี/เปลี่ยน role/
  ระงับ-เปิดใช้งานบัญชี) และ Operation 0 (ดูรายชื่อผู้ป่วยทุกรายในระบบ — เหมือนแพทย์/พยาบาลทุกประการ
  ตั้งแต่ 2026-09-25) และ Operation 1/2/3 (ดูข้อมูลผู้ป่วยทุกรายแบบอ่านอย่างเดียว) — **ไม่มีสิทธิ์
  เรียก Operation 4 (คำขอสิทธิของเจ้าของข้อมูล), Operation 5 (audit trail — ดู "ประเด็นรอตัดสินใจ" ว่า
  ควรเพิ่มสิทธิ์นี้ให้ Admin หรือไม่), Operation 8/9 (สมัคร/รีเซ็ตรหัสผ่าน — Admin เข้าสู่ระบบด้วยบัญชี
  ที่มีอยู่แล้วเท่านั้น) หรือ Operation 16 (FR-16 — ไม่ใช่สิทธิ์ของ Admin) ใดๆ** — **แก้ไข 2026-09-25:
  ไม่มี "ข้อยกเว้น" ของ Operation ร่วม Access Control อีกต่อไป** (เดิมเคยข้ามการตรวจสอบระดับรายผู้ป่วย
  ผ่าน PatientAssignment — ตอนนี้แพทย์/พยาบาลเข้าถึงผู้ป่วยทุกรายเหมือนกันอยู่แล้ว ไม่มีกลไกนี้ให้ข้าม)
  สิ่งที่ยังคงเป็นลักษณะเฉพาะของ Admin คือสิทธิ์**อ่านอย่างเดียว**เท่านั้นตาม NFR-19 (ไม่มีสิทธิ์แก้ไข
  ข้อมูลทางคลินิกหรือยืนยัน/แก้ไขผลประเมินความเสี่ยงตาม FR-16) และการบันทึก audit log แบบ fail-safe
  พร้อม flag `isAdminAccess=true` ตาม NFR-20 — ดูหมายเหตุในหัวข้อ Operation ร่วม Access Control ด้านล่าง
- **ผู้สมัครบัญชี (บุคคลทั่วไปที่ยังไม่มีบัญชี หรือมีบัญชีแต่ยังไม่ได้รับอนุมัติ)** — เรียกได้เฉพาะ
  Operation 7 (เข้าสู่ระบบ), Operation 8 (สมัครบัญชี) และ Operation 9 (ขอรีเซ็ตรหัสผ่าน) ด้านล่าง
  เท่านั้น ([[20260923-01-user-authentication-email-password#บทบาทที่เกี่ยวข้อง|spec Authentication ยืนยันว่าไม่ใช่บทบาท (role) ใหม่ในระบบ ไม่มี Custom Claims ของตัวเอง]])
  — บุคคลกลุ่มนี้**ไม่มีสิทธิ์เรียก Operation 0-6, 10-16 ใดๆ** จนกว่าบัญชีจะผ่านการอนุมัติของ Admin
  (`role` ถูกกำหนด + `isActive=true` — FR-11) และยืนยันอีเมลแล้ว (FR-09) ตามที่ Operation ร่วม
  "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" กำหนด

**แก้ไข 2026-09-24 (รอบ sync ที่หก):** เดิมหัวข้อนี้เคยระบุว่า "ผู้ดูแลระบบ (system administrator)
ดำเนินการอนุมัติบัญชีผ่าน Firebase Console/Firestore โดยตรง ไม่ใช่ผู้เรียก operation ใดในเอกสารนี้" —
ข้อความนี้**ถูกแทนที่แล้ว** โดย [[20260924-01-admin-role-account-management]] (ดูบทบาท Admin ด้านบน)
บัญชี Admin คนแรก/bootstrap เท่านั้นที่ยังคงตั้งผ่าน Firebase Console/Firestore โดยตรง (อยู่นอกขอบเขต
ของเอกสารนี้) ส่วนงาน routine ทั้งหมด (อนุมัติบัญชี/เปลี่ยน role/ระงับ-เปิดใช้งาน) ดำเนินการผ่าน
Operation 10-13 แล้ว (**แก้ไข 2026-09-25:** เดิมมี Operation 14 "จัดการการมอบหมายผู้ป่วย" และ
Operation 15 "ดูรายชื่อผู้ป่วยทั้งหมดสำหรับ Admin" — ทั้งสองถูกลบ/รวมเข้ากับ Operation 0 แล้ว ดูหัวข้อ
"Operation 14, 15 — ยกเลิกแล้ว" ด้านล่าง)

ทุก operation ในเอกสารนี้ (Operation 0-6, 10-13, 16) เรียกได้เฉพาะบทบาทที่ระบุไว้ของตนเท่านั้น และ
Operation 0-6/10-13/16 ทั้งหมดต้องผ่าน operation "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (ด้านล่าง) ก่อน
เสมอ — Operation 7-9 (Authentication) เรียกได้โดยไม่ต้องผ่านการตรวจสอบนี้ก่อน เพราะเป็น precondition
ของการมีบทบาทตั้งแต่แรก (ดูหัวข้อ Operation 7-9 ด้านล่าง)

## Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)

รองรับ [[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Access Control]] ใน architecture และ
[[backlog#Non-Functional Requirements|NFR-02]] — เป็น precondition ที่ทุก operation อื่นในเอกสารนี้
ต้องเรียกใช้ก่อนประมวลผลต่อเสมอ ไม่ใช่ operation ที่ Client เรียกตรงด้วยตัวเอง

- **ผู้เรียกได้/บทบาท:** internal (เรียกจาก Backend Service เอง ก่อนทุก operation ที่ Client ร้องขอ)
- **Input:**
  - ข้อมูลยืนยันตัวตนของผู้ใช้ (auth context) — จำเป็น
  - รหัสผู้ป่วย (Patient.id) ที่ถูกร้องขอ — ไม่บังคับ (ระบุเมื่อเป็น precondition ของ operation ที่
    เข้าถึงข้อมูลผู้ป่วยรายบุคคล เช่น Operation 1, 2, 3 ด้านล่าง; ไม่ระบุเมื่อเป็น precondition ของ
    Operation 0 "ค้นหา/แสดงรายชื่อผู้ป่วย" ซึ่งยังไม่มีผู้ป่วยรายใดถูกเลือก)
- **Output:** อนุญาต/ปฏิเสธ พร้อมข้อมูล User (id, บทบาท, สถานะการใช้งานบัญชี) ถ้าอนุญาต
- **กฎทางธุรกิจ (แก้ไข 2026-09-25 — ยกเลิกกลไก PatientAssignment ทั้งหมด สอดคล้องกับ [[architecture]]):**
  ตาม [[backlog#Non-Functional Requirements|NFR-02]] ฉบับขยายความ (เชื่อมโยงกับ
  [[backlog#สูง (MVP)|FR-05]]) — **ไม่มีขั้นตอน "ตรวจสอบระดับรายผู้ป่วย (patient-level)" อีกต่อไป**
  (เดิมเคยตรวจสอบผ่าน `PatientAssignment` — entity นี้ถูกลบออกทั้งหมดแล้ว พร้อม FR-14 ที่เคยจัดการ) —
  เหลือเพียง:
  1. **ตรวจสอบระดับบทบาท (role-level)** — ตรวจสอบทุกครั้งไม่ว่าจะระบุรหัสผู้ป่วยหรือไม่: อนุญาตเฉพาะ
     เมื่อ User.บทบาท เป็น "แพทย์", "พยาบาล" หรือ "admin" และ User.สถานะการใช้งานบัญชี เป็นจริง —
     **ใหม่จากฟีเจอร์ที่ 6:** บัญชีที่เพิ่งสมัคร (Operation 8) แต่ยังไม่ได้รับอนุมัติจาก Admin มี
     User.บทบาท เป็นค่าว่าง/ไม่มีค่าและ User.สถานะการใช้งานบัญชี เป็นเท็จโดยดีฟอลต์ (ดู
     [[db-spec#ผู้ใช้ (User)|db-spec]]) จึง**ไม่ผ่านการตรวจสอบระดับบทบาทนี้โดยอัตโนมัติอยู่แล้ว**
     ไม่ต้องเพิ่มเงื่อนไขใหม่ (FR-08, NFR-02) — **ทุกบทบาทที่ผ่านข้อนี้เข้าถึงผู้ป่วยทุกรายในระบบได้
     เหมือนกัน** (FR-05) ยกเว้นสิทธิ์**แก้ไข**ข้อมูลทางคลินิกที่ยังคงจำกัดเฉพาะ "แพทย์"/"พยาบาล" เท่านั้น
     (Admin อ่านอย่างเดียวตาม NFR-19 — บังคับใช้ที่ระดับ operation แต่ละตัว ไม่ใช่ที่ operation ร่วมนี้)
  2. **ตรวจสอบสถานะยืนยันอีเมล (`email_verified`)** ตาม
     [[technology-stack#19. การตรวจสอบ `emailVerified` ซ้ำฝั่ง Backend (FR-09, ฟีเจอร์ที่ 6) — ตรวจทั้ง Cloud Functions และ Security Rules|decision area 19 ใน technology-stack]]
     อนุญาตเฉพาะเมื่อ `email_verified` ในข้อมูลยืนยันตัวตน (Firebase ID token) เป็นจริงเท่านั้น — ปิด
     ช่องว่างที่ [[20260923-01-user-authentication-email-password#Edge Case และวิธีจัดการ|detailed-design ของฟีเจอร์ที่ 6 ระบุไว้ว่าเป็นความเสี่ยงจริง]]
     (Client ที่ถูกดัดแปลง/บั๊กข้ามการตรวจสอบ `emailVerified` ที่ชั้น UX แล้วเรียก Operation 0-6 ตรง)
  3. **บังคับหลัก purpose limitation (NFR-03)** — เมื่อผ่านข้อข้างต้นแล้ว Backend Service ต้องจำกัด
     ขอบเขตข้อมูล/การประมวลผลที่ส่งต่อให้ operation อื่น (Operation 0-6 ด้านล่าง) เฉพาะเท่าที่จำเป็น
     ตามวัตถุประสงค์การดูแลรักษาผู้ป่วยในขอบเขตของ FR-01–FR-04 หรือขอบเขตคำขอสิทธิของเจ้าของข้อมูลตาม
     NFR-07 เท่านั้น ไม่ส่งต่อ/เปิดเผยข้อมูลนอกวัตถุประสงค์โดยไม่มีฐานทางกฎหมายรองรับ — ฐานทางกฎหมายที่
     ชัดเจนยังรอฝ่ายกฎหมาย/DPO ยืนยัน (ดู [[architecture#ประเด็นรอตัดสินใจอื่น (ไม่เกี่ยวกับ technology stack)|ประเด็นรอตัดสินใจอื่นใน architecture]])
  - ต้องตรวจสอบทั้งสามข้อข้างต้นก่อนที่ Backend Service จะเข้าถึง
    [[architecture#ที่เก็บข้อมูลหลัก (Primary Data Store)|Primary Data Store]] ทุกครั้ง
  - เมื่อระบุรหัสผู้ป่วยและผ่านการตรวจสอบสำเร็จ Backend Service ต้องเรียก "บันทึกร่องรอยการเข้าถึงข้อมูล
    ผู้ป่วย (Audit Logging)" (ด้านล่าง) ก่อนดำเนินการต่อไปยัง Operation 1, 2, 3 หรือ Operation 4 เสมอ
    ตาม [[backlog#Non-Functional Requirements|NFR-06]] (รวมถึงกรณี Admin เข้าถึงผ่าน Operation 1/2/3
    ต้องระบุ `เข้าถึงในฐานะ Admin หรือไม่ = จริง` เสมอตาม NFR-20)
  4. **ความสัมพันธ์กับ Session Timeout (NFR-12)** — operation นี้เป็นจุดเดียวกันที่ใช้บังคับ
     "ปฏิเสธคำขอที่ไม่มี token ที่ถูกต้องแนบมา" หลังผู้ใช้ถูก auto-logout จาก Client แล้ว (ไม่ใช่ operation
     ใหม่แยกต่างหาก) — เมื่อ Client ตรวจพบว่าไม่มีการใช้งาน (inactivity) เกิน 30 นาทีตาม
     [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component|หน้าที่ของ Client ใน architecture]] แล้ว
     auto-logout (ลบ/เพิกถอน token ในเครื่อง), คำขอถัดไปใดๆ ที่ไม่มี auth context ที่ถูกต้องแนบมาจะถูก
     ปฏิเสธที่ operation นี้โดยอัตโนมัติผ่านเงื่อนไข "ไม่มีข้อมูลยืนยันตัวตน" ด้านล่างอยู่แล้ว **กลไกฝั่ง
     เซิร์ฟเวอร์เพิ่มเติมเพื่อเพิกถอน token ที่ยังไม่หมดอายุจริง (เช่น revoke ทันทีที่ idle เกิน 30 นาที
     แม้ token ยังไม่ expire) ยังไม่ถูกตัดสินใจ** (ดู
     [[architecture#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน architecture]] และหัวข้อ "ประเด็นรอตัดสินใจ"
     ท้ายเอกสารนี้) — **ทางเลือก "ตรวจสอบ `lastActivityAt` ทุกคำขอ" ถูกพิจารณาแล้วและตัดสินใจไม่เลือก**
     (กระทบ NFR-09 โดยตรง) จึงไม่มี field นี้ใน [[db-spec#ผู้ใช้ (User)|User]] ดูเหตุผลเต็มที่
     [[db-spec#ผู้ใช้ (User)|หมายเหตุ NFR-12 ในหัวข้อ User ของ db-spec]]
- **กรณี error:**
  - ไม่มีข้อมูลยืนยันตัวตน หรือข้อมูลยืนยันตัวตนไม่ถูกต้อง → ปฏิเสธการเข้าถึง
  - บทบาทผู้ใช้ไม่ใช่แพทย์/พยาบาล/admin หรือบัญชีถูกระงับ → ปฏิเสธการเข้าถึง (NFR-02)
  - Admin เรียก Operation 16 (FR-16) หรือ operation ที่แก้ไขข้อมูลทางคลินิกใดๆ → ปฏิเสธการเข้าถึง
    (ไม่ใช่สิทธิ์ของ Admin)
  - บทบาท/สถานะการใช้งานบัญชีถูกต้องครบ แต่ `email_verified` เป็นเท็จ → ปฏิเสธการเข้าถึง (FR-09 ตาม
    decision area 19 ใน technology-stack)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-02]], [[backlog#สูง (MVP)|FR-05]],
  [[backlog#Non-Functional Requirements|NFR-03]]
- **Technical Binding (ตาม [[technology-stack#3. สถาปัตยกรรม Backend Service — Firebase-native (ไม่มี Backend Service แยกแบบดั้งเดิม)|decision area 3 ใน technology-stack]]):**
  ไม่ใช่ Cloud Function แยกที่ถูกเรียกเป็น operation เดี่ยว — implement เป็น 2 กลไกคู่ขนานตามเส้นทาง
  ที่ operation นั้นใช้:
  - **สำหรับ Operation 0:** ตรวจสอบระดับบทบาท+สถานะบัญชีใน **Firestore Security Rules** บน collection
    `patients` โดยตรง (แก้ไข 2026-09-25 — เดิมตรวจผ่าน `patientAssignments` ที่ถูกลบแล้ว) ผ่าน
    `get(/databases/$(database)/documents/users/$(request.auth.uid))` (ดู
    [[db-spec#ผู้ป่วย (Patient)|Firestore Technical Binding ของ Patient ใน db-spec]]) — **ไม่มีการ
    ตรวจสอบระดับรายผู้ป่วยอีกต่อไป** — เงื่อนไข `request.auth.token.email_verified == true` อ่านจาก
    token ที่ verify อยู่แล้ว ไม่ต้องเพิ่ม Firestore read
  - **สำหรับ Operation 1-6, 10-13, 16:** เขียนเป็น shared helper module ภายในโค้ด Cloud Functions
    (Node.js + TypeScript) เรียกจากทุก callable function ก่อนดำเนินการ — ตรวจสอบบทบาท/สถานะบัญชีจาก
    Firestore `users/{uid}` (ค่าบทบาทที่ผ่านคือ `"แพทย์"`, `"พยาบาล"` หรือ `"admin"`) **ไม่มีการตรวจสอบ
    patient-level อีกต่อไป** (แก้ไข 2026-09-25 — เดิมตรวจผ่าน `exists()` บน
    `patientAssignments/{uid}_{patientId}`) — ตรวจสอบ `decodedToken.email_verified` ในโมดูลเดียวกัน
    (decision area 19) **ไม่มี custom claims บทบาท/isActive ให้อ่านจาก token (decision area 18) —
    ต้อง query Firestore `users/{uid}` โดยตรงเสมอ**
  - **Error code:** ไม่มีสิทธิ์ระดับบทบาท/บัญชีถูกระงับ → `functions.https.HttpsError('permission-denied', ...)`;
    ไม่มี auth token เลย → `functions.https.HttpsError('unauthenticated', ...)`;
    `email_verified` เป็นเท็จ → `functions.https.HttpsError('permission-denied', ...)` (สำหรับ
    Operation 0 กรณีเดียวกันคือ Security Rules ปฏิเสธ query/read โดยอัตโนมัติ ไม่มี error code แบบ
    Callable Function เพราะไม่ใช่ Cloud Function)

## Operation ร่วม — บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)

รองรับ [[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Audit Logging \& Accountability]] ใน
architecture และ [[backlog#Non-Functional Requirements|NFR-06]] — เป็น internal operation ที่ Backend
Service เรียกอัตโนมัติทุกครั้งที่ "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ผ่านระดับรายผู้ป่วยสำเร็จ
(ไม่ใช่ operation ที่ Client เรียกตรง) ก่อนที่ Backend Service จะดึง/แก้ไขข้อมูลจริงจาก
[[architecture#ที่เก็บข้อมูลหลัก (Primary Data Store)|Primary Data Store]] เสมอ ตามลำดับใน
[[architecture#Data Flow Diagram — Journey หลัก|Data Flow Diagram ของ architecture]]

- **ผู้เรียกได้/บทบาท:** internal (เรียกจาก Backend Service เอง)
- **Input:**
  - รหัสผู้ใช้ (User.id) ที่ผ่านการตรวจสอบสิทธิ์แล้ว — จำเป็น
  - รหัสผู้ป่วย (Patient.id) ที่ถูกเข้าถึง — จำเป็น
  - การดำเนินการ (ค้นหา/ดูข้อมูลผู้ป่วย/แก้ไขข้อมูลตามคำขอสิทธิ/ลบข้อมูลตามคำขอสิทธิ/สกัดข้อมูลตามคำขอสิทธิ/
    คัดค้านการประมวลผลตามคำขอสิทธิ — ตามค่าที่กำหนดไว้ล่วงหน้าใน
    [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord.การดำเนินการ]]) — จำเป็น
  - รหัสคำขอสิทธิที่เกี่ยวข้อง (DataSubjectRequest.id) — ไม่บังคับ (ระบุเฉพาะเมื่อถูกเรียกจาก
    Operation 4)
  - เข้าถึงในฐานะ Admin หรือไม่ (จริง/เท็จ) — ไม่บังคับ (ดีฟอลต์เท็จ; ระบุเป็นจริงเฉพาะเมื่อถูกเรียก
    จาก Operation 1, 2 หรือ 3 โดยผู้ใช้ที่มีบทบาท `"admin"` — **NFR-20** — แก้ไข 2026-09-25: ลบ
    Operation 15 ออกจากรายการนี้ เพราะรวมเข้ากับ Operation 0 แล้วซึ่งเป็น Client-direct read ไม่มี
    audit log เช่นเดียวกับที่ Operation 0 ไม่เคยมีมาก่อน)
- **Output:** ยืนยันบันทึกสำเร็จ พร้อม id ของ
  [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]] ที่สร้างขึ้น
- **กฎทางธุรกิจ:**
  - ต้องบันทึกก่อนที่ Backend Service จะดึง/แก้ไขข้อมูลจริงจาก Primary Data Store เสมอ (NFR-06) —
    รวมถึงกรณี Admin เข้าถึงผ่าน Operation 1/2/3 (ต้องบันทึกก่อนคืนข้อมูลเช่นเดียวกัน ตาม NFR-20)
  - ระเบียนที่สร้างแล้วต้องคงสภาพเดิมตลอดระยะเวลาที่ต้องเก็บรักษาไว้เพื่อการตรวจสอบ (append-only/
    immutable ในเชิงหลักการ) — เอกสารนี้จึงไม่มี operation สำหรับแก้ไข/ลบ AuditLogRecord รายบุคคล
    (การลบเมื่อพ้นระยะเวลาเก็บรักษาเป็นหน้าที่ของ Operation 6 เท่านั้น)
  - หากบันทึกไม่สำเร็จ Backend Service ต้องไม่ดำเนินการต่อไปดึง/แก้ไขข้อมูลจริง (fail-safe) เพื่อไม่ให้
    เกิดการเข้าถึงข้อมูลที่ไม่มีร่องรอย
- **กรณี error:**
  - บันทึกลง [[architecture#ที่เก็บบันทึกการเข้าถึง (Audit Log Store)|Audit Log Store]] ไม่สำเร็จ →
    ยกเลิก operation ที่เรียกใช้ (Operation 1, 2, 3 หรือ 4) และแจ้งข้อผิดพลาดแก่ผู้ใช้ ไม่ส่งข้อมูลผู้ป่วย
    กลับไปแม้ Access Control จะผ่านแล้วก็ตาม
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-06]],
  [[backlog#Non-Functional Requirements|NFR-08]],
  [[backlog#Non-Functional Requirements|NFR-20]],
  [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]]
- **Technical Binding (ตาม [[technology-stack#5. Audit Log Store — Cloud Firestore collection แยก เขียนผ่าน Cloud Functions เท่านั้น|decision area 5 ใน technology-stack]]):**
  เขียนเป็น shared helper module ภายในโค้ด Cloud Functions เรียกจากภายใน callable function ของ
  Operation 1, 2, 3 หรือ 4 เอง (ไม่ใช่ operation แยกที่ Client เรียก) — เขียนระเบียนลง Firestore
  collection `auditLogRecords` ผ่าน **Firebase Admin SDK เท่านั้น** (bypass Security Rules) ก่อน
  ดำเนินการอ่าน/แก้ไขข้อมูลจริงภายใน callable function เดียวกันเสมอ (แนวทาง fail-safe — ถ้าการเขียนนี้
  throw exception ให้ callable function ปล่อย error ต่อทันทีโดยไม่ทำ logic ที่เหลือ) — ตั้ง
  `isAdminAccess = true` เมื่อเรียกจาก Operation 1, 2 หรือ 3 โดยผู้ใช้ `role === 'admin'` เท่านั้น
  (NFR-20) — **Error code:** เขียนไม่สำเร็จ →
  `functions.https.HttpsError('internal', 'audit-log-write-failed')` ส่งกลับแทน operation ที่เรียกใช้
  (Operation 1, 2, 3 หรือ 4) ทันที

## Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)

รองรับฟีเจอร์ที่ 5 ([[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)|feature-list]])
เช่นเดียวกับที่ [[architecture#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)|architecture]]
ออกแบบไว้ว่า NFR-09–NFR-16 ไม่ต้องการ component ใหม่ — ในระดับ operation contract นี้ก็เช่นกัน **ไม่มี
operation ใหม่ถูกเพิ่มสำหรับฟีเจอร์ที่ 5** เพราะเป็นคุณสมบัติเชิงคุณภาพที่ผูกกับ operation ที่มีอยู่แล้ว
ทั้งหมด (Operation 0-6 และ Operation ร่วมทั้งสอง) สรุปผลกระทบต่อ operation แต่ละกลุ่มดังนี้:

- **Performance < 2 วินาที (NFR-09):** ครอบคลุมทุก operation ที่ Client เรียกโดยตรง (Operation 0-5)
  โดยเฉพาะ Operation 0 (ค้นหา/แสดงรายชื่อ), Operation 1 (ประวัติวินิจฉัย), Operation 2 (ผลตรวจ lab)
  และ Operation 3 (วิเคราะห์ความเสี่ยง) ซึ่งเป็น operation หลักที่ผู้ใช้รอผลระหว่างใช้งานจริง — แต่ละ
  operation ด้านล่างจึงระบุ composite index ที่ต้องมีไว้ล่วงหน้าใน Technical Binding ของตนเองแล้ว (ดู
  [[db-spec]] สำหรับรายละเอียด index แต่ละ entity) ตาม
  [[technology-stack#9. กลไกรองรับ Performance < 2 วินาที (NFR-09) — Firestore Composite Index เท่านั้น (ไม่มี caching layer เพิ่มเติม)|decision area 9 ใน technology-stack]]
  **ตัดสินใจแล้วว่าใช้ composite index เท่านั้นโดยเจตนาสำหรับ MVP นี้ ไม่มี caching layer เพิ่มเติม
  (ไม่ใช่ยังไม่ตัดสินใจ)** — trade-off: ทุก request ยังอ่าน Cloud Firestore ทุกครั้งแม้เป็นข้อมูลอ้างอิง
  คงที่ (เช่น `ComplicationRiskThreshold` ที่ Operation 3 อ่านทุกครั้งที่ประมวลผล) ถ้าผลทดสอบ
  performance จริงพบว่าไม่พอ ขั้นตอนถัดไปคือ in-memory caching ใน Cloud Functions ก่อนพิจารณา managed
  caching layer แยก (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)
- **Availability (NFR-10):** ไม่กระทบ operation contract โดยตรง (เป็นคุณสมบัติระดับ SLA ของ
  infrastructure ทั้งหมดที่ทุก operation รันอยู่บน — ดู
  [[architecture#ตาราง Mapping NFR ไปยัง Component|ตาราง Mapping NFR ใน architecture]])
- **Clinical Safety Validation (NFR-11):** กระทบเฉพาะ Operation 3 (`assessComplicationRisk`) ทางอ้อม —
  ข้อมูล [[db-spec#threshold มาตรฐานของโรคแทรกซ้อน (ComplicationRiskThreshold)|ComplicationRiskThreshold]]
  ที่ operation นี้อ่านมาเปรียบเทียบต้องผ่านการยืนยันจากแพทย์ผู้เชี่ยวชาญก่อน deploy เสมอ — เป็น
  **กระบวนการเชิงองค์กรก่อน deploy โค้ด ไม่ใช่ business rule ที่ operation ต้องตรวจสอบขณะรันจริง** (ตาม
  [[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|หัวข้อ Risk Rule Engine ใน architecture]]) จึง
  ไม่มีการเพิ่ม input/output/กฎทางธุรกิจใหม่ใน Operation 3 สำหรับข้อนี้
- **Session Timeout (NFR-12):** กระทบ Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (ดูหมายเหตุ
  ข้อ 4 ในหัวข้อนั้นด้านบน) — auto-logout เองเป็นหน้าที่ของ Client (ไม่มี operation ฝั่งนี้)
- **Accessibility (NFR-13):** กระทบ Operation 3 เฉพาะระดับการตีความ output — field
  [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding.ระดับความเสี่ยงที่ประเมินได้]]
  เป็นค่าข้อความที่กำหนดไว้ล่วงหน้าอยู่แล้ว (ไม่ใช่สีหรือรหัสตัวเลข) จึงมีข้อความกำกับพร้อมใช้งานให้ Client
  แสดงคู่กับสี/ไอคอนได้ทันทีตามที่ NFR-13 กำหนด โดยไม่ต้องเพิ่ม field ใหม่ — รายละเอียดการนำไปแสดงผล
  (icon/contrast) เป็นเรื่องของ [[DESIGN]] และ `detailed-design/`
- **Security Rules Verification (NFR-14):** ไม่กระทบ operation contract โดยตรง (เป็นข้อกำหนดด้าน
  testing ของกลไกจริงที่ Technical Binding แต่ละ operation ระบุไว้ — ดู
  [[db-spec#คุณสมบัติร่วม (Cross-cutting Property) — Security Rules Verification (NFR-14)|หัวข้อ
  Security Rules Verification ใน db-spec]] สำหรับรายการ collection/Security Rules ที่ต้องมี automated
  test ครอบคลุม)
- **Browser/Device Compatibility (NFR-15):** ไม่กระทบ operation contract (เป็นเรื่องของ Client
  implementation ล้วนๆ)
- **Interoperability — future (NFR-16, Won't have เฟสนี้):** ไม่กระทบ operation ใดในเอกสารนี้ขณะนี้ —
  เกี่ยวข้องเฉพาะเมื่อเชื่อมต่อ [[architecture#แหล่งข้อมูลคลินิกภายนอก (External Clinical Data Source เช่น HOSxP)|External Clinical Data Source]]
  จริงในอนาคต ซึ่งอยู่นอกขอบเขต MVP

## Cross-cutting: Authentication ที่ครอบคลุมทุก Operation หลัง Login (FR-07–FR-10, NFR-17, NFR-18)

รองรับฟีเจอร์ที่ 6 ([[feature-list#6. สมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่านด้วยอีเมล (Authentication)|feature-list]])
ซึ่งเป็น **precondition ก่อน Operation 0-6 ทั้งหมด** ตามที่ [[architecture]] ระบุไว้ — สรุปผลกระทบต่อ
operation ที่มีอยู่แล้ว (ไม่มี operation ใดใน Operation 0-6 ต้องเพิ่ม input/output ใหม่สำหรับข้อนี้
เพราะ Authentication ควบคุมที่ "ก่อนจะได้ auth context ที่ถูกต้อง" ซึ่งเป็นคนละชั้นกับ Operation
ร่วม Access Control ที่ควบคุม "หลังมี auth context แล้วมีสิทธิ์เข้าถึงข้อมูลผู้ป่วยหรือไม่"):

- **Password Policy (NFR-17):** บังคับใช้ที่ Operation 8 (สมัครบัญชี) และ Operation 9 (ตั้งรหัสผ่าน
  ใหม่จากการรีเซ็ต) เท่านั้น — ไม่กระทบ Operation 0-7 อื่น
- **Account Enumeration Prevention (NFR-18):** บังคับใช้ที่ Operation 7 (เข้าสู่ระบบผิดพลาด),
  Operation 8 (สมัครด้วยอีเมลซ้ำ) และ Operation 9 (รีเซ็ตรหัสผ่านด้วยอีเมลที่ไม่มีในระบบ) — ทั้งสาม
  operation ต้องคืนข้อความ/พฤติกรรมที่สังเกตได้จากภายนอก (ข้อความ, error code, เวลาตอบสนอง) แบบ
  เดียวกันเสมอไม่ว่าอีเมลจะมีอยู่ในระบบหรือไม่ — **กลไกจริง (ตัดสินใจแล้วในรอบ 2026-09-24):** Operation
  8/9 คืนข้อความ generic จากโค้ด Cloud Function เอง (ดู Technical Binding ของแต่ละ operation) ส่วน
  Operation 7 (ไม่มี Cloud Function คั่นกลาง) พึ่ง **Firebase "Email Enumeration Protection"**
  ระดับโปรเจกต์ ตาม
  [[technology-stack#14. กลไกป้องกัน Account Enumeration (NFR-18, ฟีเจอร์ที่ 6) — Firebase Email Enumeration Protection|decision area 14 ใน technology-stack]]
  — **ยังไม่ปิด timing side-channel** (ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว ดูหัวข้อความเสี่ยงใน
  [[technology-stack#ความเสี่ยงเพิ่มเติม: NFR-18 Account Enumeration — Timing Side-channel ยังไม่ปิด (ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว)|technology-stack]]) — ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร
  สำหรับ fixed minimum delay ที่ควรพิจารณาก่อน production จริง
- **ผลกระทบต่อ Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (Access Control):** ดูหมายเหตุที่
  แทรกไว้ในกฎข้อ 1 (role-level) ของ operation นั้นด้านบนแล้ว — บัญชีที่ยังไม่ผ่าน Operation 8 +
  การอนุมัติของผู้ดูแลระบบ จะไม่ผ่านการตรวจสอบระดับบทบาทโดยอัตโนมัติ
- **สถานะยืนยันอีเมล (`emailVerified` — FR-09) — แก้ไข 2026-09-24 (เดิมเป็นช่องว่าง ปัจจุบันปิดแล้ว
  บางส่วน):** การตรวจสอบและบล็อกการเข้าถึงฟีเจอร์อื่นเมื่อยังไม่ยืนยันอีเมลที่ชั้น UX ยังคงเป็นหน้าที่
  ของ **Client** (อ่านค่า `emailVerified` จาก Firebase ID token โดยตรง) เช่นเดิม **แต่ตั้งแต่รอบ
  2026-09-24 Operation ร่วม Access Control ในเอกสารนี้ตรวจสอบ `email_verified` ซ้ำที่ฝั่งเซิร์ฟเวอร์
  ด้วยแล้ว** (ดูข้อ 2.5 ในกฎทางธุรกิจของ operation ร่วมนั้นด้านบน) ตาม
  [[technology-stack#19. การตรวจสอบ `emailVerified` ซ้ำฝั่ง Backend (FR-09, ฟีเจอร์ที่ 6) — ตรวจทั้ง Cloud Functions และ Security Rules|decision area 19 ใน technology-stack]]
  ปิดช่องว่างที่ client ถูกดัดแปลง/บั๊กข้ามการตรวจสอบนี้แล้วเรียก Operation 0-6 ตรง — **ความเสี่ยงที่ยัง
  เหลืออยู่:** Operation 7 (เข้าสู่ระบบ) เองยังไม่มีจุดตรวจ `emailVerified`/`isActive` ที่ระดับการออก
  token (ไม่ใช้ Auth Blocking Functions ตาม
  [[technology-stack#16. Auth Blocking Functions (ฟีเจอร์ที่ 6) — ไม่ใช้|decision area 16]]) — token
  ที่ `emailVerified=false`/`isActive=false` ยังคงถูกออกให้ได้ตามปกติ เพียงแต่ถูกปฏิเสธที่ Operation
  ร่วม Access Control ก่อนเข้าถึงข้อมูลผู้ป่วยจริงเสมอ

## Operation 7 — เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน

รองรับ [[backlog#สูง (MVP)|FR-07]] — **ใหม่จากฟีเจอร์ที่ 6** เป็นขั้นตอนแรกสุดก่อน Operation 0-6
ทั้งหมด แต่**ไม่ผ่าน Backend Service** (ต่างจาก Operation 1-6 ทุกตัว) — Client เรียก
[[architecture#บริการยืนยันตัวตน (Authentication Service)|Authentication Service]] ตรง ตามที่ผู้ใช้
ยืนยันแล้วผ่าน `NEEDS_USER_INPUT` ระหว่างรอบ sync architecture (ไม่มีข้อกำหนด NFR-17/NFR-18 ใดบังคับ
ให้ต้องผ่าน Backend Service สำหรับ operation นี้ เพราะไม่มีการสร้าง/แก้ไขข้อมูลที่ต้อง fail-safe)

- **ผู้เรียกได้/บทบาท:** ผู้สมัครบัญชี (ทุกคนที่มีบัญชีอีเมล/รหัสผ่านแล้ว ไม่ว่าจะผ่านการอนุมัติหรือไม่)
- **Input:**
  - อีเมล (เทียบกับ [[db-spec#ผู้ใช้ (User)|User.อีเมล]]) — จำเป็น
  - รหัสผ่าน — จำเป็น
- **Output:** ข้อมูลยืนยันตัวตน (Firebase ID token) พร้อมค่า `email_verified` ในตัว token เอง — **ไม่มี
  custom claims บทบาท/สถานะการใช้งานบัญชีแนบมากับ token นี้อีกต่อไป** (แก้ไข 2026-09-24 ตาม
  [[technology-stack#18. การ Sync role/isActive ระหว่าง Firestore กับ Custom Claims (ฟีเจอร์ที่ 6) — ไม่ Sync, Firestore เป็น Source of Truth เดียว|decision area 18 ใน technology-stack]]) — `บทบาท`/
  `สถานะการใช้งานบัญชี` ต้อง query จาก [[db-spec#ผู้ใช้ (User)|Firestore `users/{uid}`]] แยกต่างหากเสมอ
  ที่ Operation ร่วม Access Control (ทั้ง Security Rules ของ Operation 0 และ Cloud Functions ของ
  Operation 1-6) ใช้ token นี้เป็น auth context สำหรับ Operation 0-6 ต่อไป
- **กฎทางธุรกิจ:**
  - ตรวจสอบเฉพาะว่าอีเมล/รหัสผ่านที่กรอกตรงกับที่จัดเก็บไว้หรือไม่ (ดำเนินการโดย Authentication
    Service เอง) — **ไม่ตรวจสอบ `บทบาท`/`สถานะการใช้งานบัญชี`/`สถานะการยืนยันอีเมล` ใน operation นี้**
    (การตรวจสอบเหล่านั้นเกิดขึ้นแยกต่างหากที่ Operation ร่วม Access Control และที่ Client ตามลำดับ —
    ดู [[#Cross-cutting: Authentication ที่ครอบคลุมทุก Operation หลัง Login (FR-07–FR-10, NFR-17, NFR-18)|Cross-cutting Authentication ด้านบน]])
  - เข้าสู่ระบบสำเร็จไม่ได้แปลว่าเข้าถึงข้อมูลผู้ป่วยได้ทันที ยังต้องผ่าน Operation ร่วม Access Control
    และ FR-09 (ยืนยันอีเมล) ต่อไปเสมอ
- **กรณี error:**
  - อีเมล/รหัสผ่านไม่ถูกต้อง (ไม่ว่าจะเป็นเพราะไม่มีบัญชีอีเมลนี้ หรือรหัสผ่านผิด) →
    แจ้งข้อความรวมเดียวกันเสมอ **"อีเมลหรือรหัสผ่านไม่ถูกต้อง"** ไม่แยกแยะว่าอีเมลมีอยู่ในระบบหรือไม่
    (NFR-18)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-07]], [[backlog#Non-Functional Requirements|NFR-18]],
  [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** **ไม่ใช่ Cloud Function** — Client เรียก **Firebase Authentication SDK
  ตรง** (`signInWithEmailAndPassword`) ตาม [[technology-stack#7. Authentication/Authorization — Firebase Authentication (ไม่ใช้ Custom Claims เก็บบทบาท — แก้ไขในรอบสาม 2026-09-24)|decision area 7 ใน technology-stack]] — token ที่ได้รับกลับมา**ไม่มี custom claims บทบาท/isActive**
  (decision area 18); Client ยังคงต้องอ่าน `email_verified` จาก token นี้เพื่อบล็อกการใช้งานฟีเจอร์
  อื่นที่ชั้น UX (FR-09) ส่วนการตรวจสอบ `role`/`isActive`/`email_verified` ที่บังคับใช้จริงเกิดขึ้นที่
  Operation ร่วม Access Control (ทั้ง Security Rules และ Cloud Functions) แยกต่างหากเสมอ
  — **Error/สถานะ:** ไม่มี error code แบบ Callable Function — Firebase Authentication SDK คืน error
  code มาตรฐานของตนเอง (เช่น `auth/invalid-credential`) ซึ่ง Client **ต้อง**แปลงเป็นข้อความรวม
  เดียวกันเสมอที่ชั้น UI โดยไม่แสดง error code ดิบให้ผู้ใช้เห็น (NFR-18) — กลไก suppress ที่ระดับ
  error code/เวลาตอบสนองอย่างสมบูรณ์ยังไม่ตัดสินใจ (ดู "ประเด็นรอตัดสินใจ")

## Operation 8 — สมัครบัญชีผู้ใช้งานด้วยตนเอง (Self Sign-up)

รองรับ [[backlog#สูง (MVP)|FR-08]] (สมัครบัญชี), [[backlog#สูง (MVP)|FR-09]] (ส่งอีเมลยืนยันตัวตน),
[[backlog#Non-Functional Requirements|NFR-17]] (password policy) และ
[[backlog#Non-Functional Requirements|NFR-18]] (account enumeration prevention) — **ใหม่จากฟีเจอร์
ที่ 6** ต้องผ่าน Backend Service เป็นตัวกลางเสมอ (ยืนยันโดยผู้ใช้แล้วผ่าน `NEEDS_USER_INPUT` — ดู
[[architecture#หมายเหตุการอัปเดตล่าสุด (2026-09-23, รอบ sync ที่สี่)|หมายเหตุการอัปเดตล่าสุดต้นเอกสาร architecture]])
เพื่อให้ Backend Service เป็นจุดเดียวที่บังคับ password policy และคืนข้อความ generic ได้แน่นอน

- **ผู้เรียกได้/บทบาท:** ผู้สมัครบัญชี (บุคคลทั่วไปที่ยังไม่มีบัญชี หรือคิดว่ายังไม่มีบัญชี)
- **Input:**
  - อีเมล (จะกลายเป็น [[db-spec#ผู้ใช้ (User)|User.อีเมล]]) — จำเป็น
  - รหัสผ่าน (จะกลายเป็น [[db-spec#ผู้ใช้ (User)|User.รหัสผ่านที่จัดเก็บ]] หลัง hash) — จำเป็น
- **Output:** ข้อความ generic เดียวกันเสมอ (เช่น "หากสมัครสำเร็จ ระบบจะส่งอีเมลยืนยันตัวตนไปยังอีเมล
  ที่กรอก") ไม่ว่าอีเมลที่กรอกจะซ้ำกับบัญชีเดิมหรือไม่ก็ตาม (NFR-18) — **ไม่คืนค่า id ของ User ที่สร้าง
  หรือสถานะสำเร็จ/ล้มเหลวที่แยกแยะได้จากภายนอก**
- **กฎทางธุรกิจ:**
  - ตรวจสอบรหัสผ่านตามนโยบายขั้นต่ำก่อนเสมอ (ความยาว ≥ 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลขอย่างน้อย
    อย่างละ 1 ตัว — NFR-17) — ถ้าไม่ผ่าน ปฏิเสธและแจ้งเตือนทันที (กรณีนี้**ไม่ใช่**ข้อมูลที่ต้อง
    generic เพราะไม่เกี่ยวกับว่าอีเมลมีบัญชีอยู่แล้วหรือไม่)
  - เมื่อรหัสผ่านผ่านนโยบายแล้ว สร้างบัญชีใหม่ที่ Authentication Service ผ่าน Admin SDK
  - เมื่อสร้างบัญชี Authentication สำเร็จ ต้องสร้างเอกสาร [[db-spec#ผู้ใช้ (User)|users/{uid}]] ใหม่
    ทันทีในขั้นตอนเดียวกันด้วย `สถานะการใช้งานบัญชี = เท็จ` และ `บทบาท` ไม่มีค่า (ยืนยันแล้วโดยผู้ใช้ —
    Client ไม่มีสิทธิ์เขียนเอกสารนี้เอง)
  - สั่งส่งอีเมลยืนยันตัวตนผ่าน Authentication Service ทันทีหลังสร้างบัญชีสำเร็จ (FR-09)
  - **ไม่ว่าอีเมลที่กรอกจะซ้ำกับบัญชีเดิมหรือไม่ก็ตาม ต้องคืนข้อความ generic เดียวกันเสมอ** (NFR-18) —
    กรณีอีเมลซ้ำ **ไม่สร้างบัญชีใหม่ซ้ำ และไม่ส่งอีเมลยืนยันตัวตนซ้ำ** แต่ผลลัพธ์ที่ผู้ใช้เห็นต้อง
    เหมือนกับกรณีสมัครสำเร็จทุกประการ
- **กรณี error:**
  - รหัสผ่านไม่ผ่านนโยบายขั้นต่ำ → แจ้งเตือนให้แก้ไขรหัสผ่านทันที (NFR-17 — ไม่ใช่กรณีที่ต้อง generic)
  - อีเมลรูปแบบไม่ถูกต้อง → แจ้งว่า input ไม่ถูกต้อง
  - อีเมลมีบัญชีอยู่แล้ว → **ไม่แจ้ง error ที่แยกแยะได้** คืนข้อความ generic เดียวกับกรณีสำเร็จ (NFR-18)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-08]], [[backlog#สูง (MVP)|FR-09]],
  [[backlog#Non-Functional Requirements|NFR-17]], [[backlog#Non-Functional Requirements|NFR-18]],
  [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `signUpUser`** (กลุ่มงาน Account Onboarding & Authentication Gateway ตาม [[architecture]]) —
  ตรวจสอบ password policy ด้วย **regex ในโค้ดเดียวกัน** (ความยาว ≥ 8 ตัวอักษร มีตัวอักษร+ตัวเลข ตาม
  [[technology-stack#13. กลไก Validate Password Policy ฝั่งเซิร์ฟเวอร์ (NFR-17, ฟีเจอร์ที่ 6) — Regex ใน Cloud Function + Identity Platform เป็น Backstop|decision area 13 ใน technology-stack]]),
  เรียก Firebase Admin SDK `createUser` สร้างบัญชี Authentication, เขียน `users/{uid}` ผ่าน Admin SDK
  ในฟังก์ชันเดียวกัน (**rollback ด้วย Admin SDK `deleteUser` ถ้าเขียน Firestore ล้มเหลว** ตาม
  [[technology-stack#17. กลไกสร้าง `users/{uid}` อัตโนมัติ (FR-08, ฟีเจอร์ที่ 6) — ภายใน Cloud Function `signUpUser` เดียวกัน|decision area 17]]),
  เรียก Admin SDK สั่งส่งอีเมลยืนยันตัวตนด้วย **template เริ่มต้นของ Firebase Authentication ปรับ
  locale ไทย + ชื่อผู้ส่งผ่าน Console** ตาม
  [[technology-stack#15. เทมเพลตอีเมลยืนยันตัวตน/รีเซ็ตรหัสผ่าน (FR-09/FR-10, ฟีเจอร์ที่ 6) — Template เริ่มต้นของ Firebase + ปรับภาษาไทยผ่าน Console|decision area 15]]
  — **Error code:** รหัสผ่านไม่ผ่านนโยบาย → `functions.https.HttpsError('invalid-argument', 'weak-password')`;
  รูปแบบอีเมลไม่ถูกต้อง → `invalid-argument`; เขียน Firestore ล้มเหลวหลัง rollback →
  `internal`; **กรณีอีเมลซ้ำต้องคืน response สำเร็จแบบเดียวกับกรณีสร้างบัญชีสำเร็จเสมอ ห้ามคืน error
  `auth/email-already-in-use` ให้ Client เห็นเด็ดขาด** (NFR-18 — บังคับใช้ด้วย Firebase "Email
  Enumeration Protection" ระดับโปรเจกต์ตาม
  [[technology-stack#14. กลไกป้องกัน Account Enumeration (NFR-18, ฟีเจอร์ที่ 6) — Firebase Email Enumeration Protection|decision area 14]]
  ร่วมกับ generic response ที่คืนจากโค้ดนี้เอง) — **ยังไม่เพิ่ม fixed minimum delay** เพื่อปิด timing
  side-channel ในรอบนี้โดยเจตนา (ผู้ใช้รับทราบความเสี่ยงแล้ว ดู "ประเด็นรอตัดสินใจ")

## Operation 9 — ขอรีเซ็ตรหัสผ่านทางอีเมล (Forgot Password)

รองรับ [[backlog#สูง (MVP)|FR-10]], [[backlog#Non-Functional Requirements|NFR-17]] (รหัสผ่านใหม่ต้อง
เป็นไปตามนโยบาย), [[backlog#Non-Functional Requirements|NFR-18]] — **ใหม่จากฟีเจอร์ที่ 6** ต้องผ่าน
Backend Service เป็นตัวกลางเสมอเช่นเดียวกับ Operation 8 (ยืนยันโดยผู้ใช้แล้ว)

- **ผู้เรียกได้/บทบาท:** ผู้สมัครบัญชี (ทุกคนที่คิดว่าตนมีบัญชีอยู่ในระบบ)
- **Input:**
  - อีเมล (เทียบกับ [[db-spec#ผู้ใช้ (User)|User.อีเมล]]) — จำเป็น
- **Output:** ข้อความ generic เดียวกันเสมอ: **"หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่านทาง
  อีเมล"** ไม่ว่าอีเมลที่กรอกจะมีบัญชีอยู่จริงหรือไม่ (NFR-18)
- **กฎทางธุรกิจ:**
  - ตรวจสอบว่ามีบัญชีที่ใช้อีเมลนี้อยู่จริงหรือไม่**ภายในขอบเขตของ operation นี้เท่านั้น** (ไม่ส่งต่อ
    ผลการตรวจสอบนี้ออกไปให้ Client ทราบไม่ว่ากรณีใด)
  - สั่ง Authentication Service ส่งอีเมลลิงก์รีเซ็ตรหัสผ่าน **เฉพาะเมื่อพบบัญชีจริง** — ถ้าไม่พบบัญชี
    ไม่ทำการใดๆ เพิ่มเติม
  - คืนข้อความ generic เดียวกันให้ Client เสมอไม่ว่าผลลัพธ์การตรวจสอบข้างต้นจะเป็นอย่างไร (NFR-18)
  - เมื่อผู้ใช้ตั้งรหัสผ่านใหม่ผ่านลิงก์ที่ได้รับ รหัสผ่านใหม่ต้องเป็นไปตามนโยบายขั้นต่ำเช่นเดียวกับ
    Operation 8 (NFR-17)
- **กรณี error:**
  - อีเมลรูปแบบไม่ถูกต้อง → แจ้งว่า input ไม่ถูกต้อง (กรณีนี้ไม่เกี่ยวกับ NFR-18 เพราะเป็นการตรวจสอบ
    รูปแบบ ไม่ใช่การเปิดเผยว่าอีเมลมีบัญชีอยู่หรือไม่)
  - ไม่พบบัญชีที่ใช้อีเมลนี้ → **ไม่แจ้ง error ที่แยกแยะได้** คืนข้อความ generic เดียวกับกรณีพบบัญชี
    (NFR-18)
  - รหัสผ่านใหม่ที่ตั้ง (หลังคลิกลิงก์) ไม่ผ่านนโยบายขั้นต่ำ → แจ้งเตือนให้แก้ไขทันที (NFR-17 — ไม่ใช่
    กรณีที่ต้อง generic)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-10]], [[backlog#Non-Functional Requirements|NFR-17]],
  [[backlog#Non-Functional Requirements|NFR-18]], [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding (Operation 9a — ขอลิงก์รีเซ็ต):** Cloud Functions (2nd gen, Node.js +
  TypeScript) — **HTTPS Callable Function ชื่อ `requestPasswordReset`** (กลุ่มงาน Account Onboarding &
  Authentication Gateway) — ตรวจสอบว่ามีบัญชีอยู่จริงผ่าน Firebase Admin SDK แล้วเรียก Admin SDK สั่ง
  ส่งอีเมลลิงก์รีเซ็ตเฉพาะเมื่อพบบัญชี ด้วย **template เริ่มต้นของ Firebase Authentication ปรับ locale
  ไทย + ชื่อผู้ส่งผ่าน Console** ตาม
  [[technology-stack#15. เทมเพลตอีเมลยืนยันตัวตน/รีเซ็ตรหัสผ่าน (FR-09/FR-10, ฟีเจอร์ที่ 6) — Template เริ่มต้นของ Firebase + ปรับภาษาไทยผ่าน Console|decision area 15]]
  — **Error code:** รูปแบบอีเมลไม่ถูกต้อง → `invalid-argument`; **ไม่พบบัญชีต้องคืน response สำเร็จ
  แบบเดียวกับกรณีพบบัญชีเสมอ ห้ามคืน error ที่แยกแยะได้** (NFR-18)
- **Technical Binding (Operation 9b — ตั้งรหัสผ่านใหม่จริงหลังคลิกลิงก์):** **ไม่ใช่ Cloud Function** —
  Client เรียก **Firebase Authentication SDK ตรง** (`confirmPasswordReset`) ตามที่
  [[20260923-01-user-authentication-email-password#Sequence Diagram — ขอรีเซ็ตรหัสผ่านทางอีเมล (Operation 9, FR-10)|
  sequence diagram ของ detailed-design ระบุไว้]] — **ไม่มี Cloud Function คั่นกลาง** จึงไม่มี regex
  ตรวจ password policy ในโค้ดของระบบเอง บังคับใช้ policy ที่จุดนี้ผ่าน **Google Cloud Identity
  Platform password policy** ที่เปิดใช้เป็น backstop ฝั่งเซิร์ฟเวอร์แทน ตาม
  [[technology-stack#13. กลไก Validate Password Policy ฝั่งเซิร์ฟเวอร์ (NFR-17, ฟีเจอร์ที่ 6) — Regex ใน Cloud Function + Identity Platform เป็น Backstop|decision area 13 ใน technology-stack]]
  — **Error/สถานะ:** ไม่มี error code แบบ Callable Function — Firebase Authentication SDK คืน error
  code มาตรฐานของตนเอง (เช่น รหัสผ่านไม่ผ่านนโยบายของ Identity Platform) ซึ่ง Client ต้องแปลงเป็น
  ข้อความแจ้งเตือนที่ชั้น UI (NFR-17 — ไม่ใช่กรณีที่ต้อง generic เพราะไม่เกี่ยวกับ NFR-18) — **ยังไม่เพิ่ม
  fixed minimum delay** เพื่อปิด timing side-channel ของทั้ง Operation 9a/9b ในรอบนี้โดยเจตนา (ผู้ใช้
  รับทราบความเสี่ยงแล้ว ดู "ประเด็นรอตัดสินใจ")

## Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วยทั้งหมดในระบบ (ค้นหาเฉพาะรายด้วยเลข HN)

รองรับ [[backlog#สูง (MVP)|FR-05]], [[backlog#สูง (MVP)|FR-06]] และ [[backlog#สูง (MVP)|FR-15]] —
เป็นขั้นตอนแรกสุดของ journey เสมอ ก่อน Operation 1, 2, 3 ด้านล่าง ตามลำดับใน
[[architecture#Data Flow Diagram — Journey หลัก|Data Flow Diagram ของ architecture]] **การค้นหาเฉพาะราย
รองรับเฉพาะเลข HN เท่านั้น ไม่รองรับการค้นหาด้วยชื่อ-นามสกุลอีกต่อไป** (FR-06 ยืนยันแล้ว 2026-09-21
แทนที่สมมติฐานเดิมที่เคยรองรับคำค้นอิสระ)

**แก้ไข 2026-09-25 (รวม Operation 15 เดิมเข้าด้วยกัน — ยกเลิกกลไก PatientAssignment ทั้งหมด):**
เดิม operation นี้จำกัดเฉพาะผู้ป่วยที่ "อยู่ในความดูแล" ของผู้ใช้ (ผ่าน `PatientAssignment`) และมี
Operation 15 แยกต่างหากสำหรับ Admin ที่ต้องดูผู้ป่วยทุกราย — เนื่องจาก [[architecture]] ยกเลิกกลไก
PatientAssignment ทั้งหมด (แพทย์/พยาบาล/Admin เห็นผู้ป่วยทุกรายในระบบเหมือนกัน) จึง**ไม่มีเหตุผลทาง
เทคนิค/สิทธิ์ให้ต้องแยกสอง operation อีกต่อไป** — Operation 15 (`listAllPatientsForAdmin`) ถูก**รวม
เข้ากับ Operation 0 นี้** กลายเป็น operation เดียวที่ทุกบทบาท (แพทย์/พยาบาล/Admin) เรียกใช้เหมือนกัน

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD, Admin
- **Input:**
  - เลข HN (เทียบกับ Patient.เลขประจำตัวผู้ป่วย) — ไม่บังคับ (ถ้าไม่ระบุ คืนรายชื่อผู้ป่วย**ทุกราย**
    ในระบบตาม FR-05; ถ้าระบุ operation นี้ถูกเรียก**สองจังหวะ** — (ก) ทุกครั้งที่ผู้ใช้หยุดพิมพ์
    ชั่วขณะ (debounce 500ms) และ (ข) เมื่อผู้ใช้กดปุ่มค้นหา — **แก้ไข 2026-09-26: ทั้งสองจังหวะตรวจสอบ
    รูปแบบ/ค้นหาเหมือนกันทุกประการ** แทนที่ข้อความเดิมที่ระบุว่าเกิดขึ้นเฉพาะหลังกดค้นหาเท่านั้น
    ความแตกต่างเดียวระหว่างสองจังหวะนี้คือ**เฉพาะจังหวะกดค้นหาเท่านั้นที่เรียก
    [[#Operation 17 — อธิบายผลการค้นหาผู้ป่วยด้วย HN โดยบริการ AI ภายนอก (AI-assisted Search Result Explanation)|Operation 17]]
    ต่อ** (FR-17) ส่วนจังหวะ debounce ไม่เรียก AI)
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ Patient ที่ตรงเงื่อนไข (ทุกรายในระบบถ้าไม่ระบุ HN) แต่ละรายการประกอบด้วย: id,
  เลขประจำตัวผู้ป่วย, ชื่อ-นามสกุล (ดู
  [[db-spec#ผู้ป่วย (Patient)|Patient ใน db-spec]])
- **กฎทางธุรกิจ:**
  - ต้องผ่านการตรวจสอบสิทธิ์ระดับบทบาทของ "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02)
    (ขั้นตอนนี้ยังไม่มีรหัสผู้ป่วยเฉพาะเจาะจง จึงไม่มีการตรวจสอบระดับรายผู้ป่วยในขั้นตอนนี้ — และไม่มี
    ขั้นตอนนี้ในทุกกรณีตั้งแต่ 2026-09-25 ไม่ว่าจะระบุ HN หรือไม่)
  - แสดงผู้ป่วย**ทุกราย**ในระบบเท่ากันไม่ว่าผู้เรียกจะมีบทบาทใด (แพทย์/พยาบาล/Admin) ไม่มีการกรองตาม
    assignment/แผนก/หน่วยงานที่สังกัดอีกต่อไป (FR-05, NFR-02 — แก้ไข 2026-09-25)
  - ถ้าระบุเลข HN ต้องตรวจสอบก่อนว่าเป็นรูปแบบตัวเลขล้วน (numeric เท่านั้น ไม่มีตัวอักษร) ความยาว
    ครบ 7 หลักหรือไม่ — **แก้ไข 2026-09-26:** การตรวจสอบนี้เกิดขึ้น**ทั้งตอนหยุดพิมพ์ชั่วขณะ (debounce)
    และตอนกดปุ่มค้นหา** (แทนที่ข้อความเดิมที่ระบุว่าเกิดขึ้นหลังกดค้นหาเพียงจังหวะเดียว) กล่าวคือเป็น
    validation แบบ near-real-time ที่ทำงานซ้ำทุกครั้งที่ผู้ใช้หยุดพิมพ์ ไม่ใช่รอจนกดค้นหาเท่านั้นอีก
    ต่อไป:
    1. ถ้าไม่ครบรูปแบบตัวเลขล้วน 7 หลัก → หยุดทันที ไม่ค้นหาต่อ และคืน error "HN ไม่ครบ 7 หลัก" (ดู
       กรณี error ด้านล่าง) — เกิดขึ้นได้ทั้งตอน debounce และตอนกดค้นหา
    2. ถ้าครบรูปแบบแล้ว จึงค้นหาแบบ**ตรงกันทั้งหมด (exact match)** กับ Patient.เลขประจำตัวผู้ป่วย
       ในผู้ป่วย**ทุกราย**ในระบบ (ไม่ใช่การค้นหาบางส่วน/partial match แบบคำค้นอิสระเดิม) — เกิดขึ้นได้
       ทั้งตอน debounce และตอนกดค้นหาเช่นกัน
    3. **(เพิ่ม 2026-09-26 — เฉพาะตอนกดปุ่มค้นหาเท่านั้น ไม่ใช่ตอน debounce)** หลังได้ผลลัพธ์จากขั้นตอน
       1-2 แล้ว เรียก [[#Operation 17 — อธิบายผลการค้นหาผู้ป่วยด้วย HN โดยบริการ AI ภายนอก (AI-assisted Search Result Explanation)|Operation 17]]
       ต่อทันที ส่งสถานะผลลัพธ์ (HN ไม่ครบ 7 หลัก/ไม่พบ/พบ) ให้ช่วยอธิบายเป็นภาษาคน (FR-17, NFR-21) —
       ถ้า Operation 17 ล้มเหลว/timeout ผลการค้นหาปกติจากขั้นตอน 1-2 ยังคงแสดงได้ตามปกติเสมอ ไม่ถูกบล็อก
  - ผลลัพธ์ใช้เป็น input ให้ผู้ใช้เลือกผู้ป่วยรายบุคคลก่อนเรียก Operation 1, 2, 3 ต่อ (FR-05/FR-15 เป็น
    precondition ของทั้งสาม operation)
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึงระดับบทบาท → ปฏิเสธการเข้าถึง (NFR-02)
  - ระบุเลข HN แต่ไม่ครบรูปแบบตัวเลขล้วน 7 หลัก → แจ้งเตือน "HN ไม่ครบ 7 หลัก" ให้ผู้ใช้กรอกค้นหาใหม่ได้
    ทันที โดยไม่บล็อกการเรียกดูรายชื่อผู้ป่วยทั้งหมด (ไม่ระบุ HN) — เกิดขึ้นได้ทั้งตอน debounce และ
    ตอนกดค้นหา (FR-06 แก้ไข 2026-09-26)
  - ระบุเลข HN ครบ 7 หลักแล้ว แต่ค้นหาไม่พบผู้ป่วยที่ตรงกันในระบบ → แจ้งเตือน "ไม่พบผู้ป่วย" ให้ผู้ใช้
    กรอกค้นหาใหม่ได้ทันที โดยไม่บล็อกการเรียกดูรายชื่อผู้ป่วยทั้งหมด — เกิดขึ้นได้ทั้งตอน debounce และ
    ตอนกดค้นหา (FR-06 แก้ไข 2026-09-26)
  - ไม่มีผู้ป่วยรายใดในระบบเลย (กรณีไม่ระบุ HN) → คืนรายการว่าง (ไม่ถือเป็น error)
  - Operation 17 (AI) ล้มเหลว/timeout → ไม่ใช่ error ของ Operation 0 (ผลการค้นหาปกติยังแสดงได้ตามปกติ
    เสมอ ดูกรณี error ของ Operation 17 ด้านล่าง — FR-17)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-05]], [[backlog#สูง (MVP)|FR-06]],
  [[backlog#สูง (MVP)|FR-15]], [[backlog#กลาง|FR-17]],
  [[backlog#Non-Functional Requirements|NFR-02]],
  [[backlog#Non-Functional Requirements|NFR-19]],
  [[db-spec#ผู้ป่วย (Patient)|Patient]]
- **Technical Binding (ตาม [[technology-stack#3. สถาปัตยกรรม Backend Service — Firebase-native (ไม่มี Backend Service แยกแบบดั้งเดิม)|decision area 3 ใน technology-stack]]):**
  **ไม่ใช่ Cloud Function** — Client เรียก **Firestore SDK query ตรง** บน collection `patients`
  (แก้ไข 2026-09-25 — เดิม query ผ่าน `patientAssignments` ที่ถูกลบแล้ว) กรองด้วย Firestore Security
  Rules เท่านั้น (ตรงกับข้อมูลอ้างอิงจากโค้ดจริงของ `web/` ที่ query ลักษณะนี้อยู่แล้ว):
  - **ไม่ระบุ HN (แสดงรายชื่อทั้งหมด):** `query(collection(db,'patients'))` — อ่านทั้ง collection
    (ไม่ต้องมี composite index)
  - **ระบุ HN (ทั้งตอน debounce และตอนกดค้นหา หลังผ่านการตรวจสอบรูปแบบ 7 หลักที่ฝั่ง Client แล้ว —
    แก้ไข 2026-09-26, ดูหมายเหตุด้านล่าง):**
    `query(collection(db,'patients'), where('hn','==',enteredHn))` — equality query เดี่ยว ใช้
    single-field index ที่ Firestore สร้างอัตโนมัติ (ไม่ต้องประกาศ composite index)
  - **หมายเหตุสำคัญเรื่องตำแหน่งของการตรวจสอบรูปแบบ HN 7 หลัก:** เนื่องจาก Operation 0 ไม่มี Cloud
    Function เป็นตัวกลาง (ตามที่ตัดสินใจใน decision area 3) การตรวจสอบ "ครบรูปแบบตัวเลขล้วน 7 หลัก
    หรือไม่" ซึ่งเดิมเอกสารนี้ระบุว่าเป็นหน้าที่ของ Backend Service **ในทางเทคนิคต้องอยู่ในโค้ด Client
    (React + TypeScript)** แทน — **แก้ไข 2026-09-26:** ตรวจสอบซ้ำ**ทั้งสองจังหวะ** คือ (ก) ทุกครั้งที่
    ผู้ใช้หยุดพิมพ์ชั่วขณะ (debounce timer 500ms ในโค้ด Client) และ (ข) ทันทีหลังผู้ใช้กดปุ่มค้นหา (ก่อน
    ยิง Firestore query ทั้งสองจังหวะ) แทนที่ข้อความเดิมที่ระบุว่าตรวจสอบเฉพาะหลังกดค้นหาจังหวะเดียว —
    ผู้ดำเนินการตรวจสอบจริงยังคงเป็น "Client" เนื่องจากไม่มี server-side logic ให้ตรวจสอบแทนในเส้นทางนี้
    — Firestore query แบบ exact-match ไม่มีกลไกปฏิเสธ input รูปแบบผิดในตัวเอง (จะคืน "ไม่พบผลลัพธ์"
    เฉยๆ) จึงยังจำเป็นต้องมี validation logic ฝั่ง Client ก่อนยิง query เสมอเพื่อแยกแยะข้อความแจ้งเตือน
    สองแบบ ("HN ไม่ครบ 7 หลัก" กับ "ไม่พบผู้ป่วย") ตามที่ FR-06 กำหนด — **เฉพาะจังหวะกดค้นหาเท่านั้น**
    (ไม่ใช่ debounce) ที่มีขั้นตอนเพิ่มเติมเรียก Operation 17 ต่อ (FR-17, ดูด้านล่าง)
  - **Firestore Security Rules ที่บังคับใช้จริง:** ดูกฎเต็มที่
    [[db-spec#ผู้ป่วย (Patient)|Firestore Technical Binding ของ Patient ใน db-spec]]
  - **Error/สถานะ:** ไม่มี error code แบบ Callable Function (ไม่ใช่ Cloud Function) — "ไม่มีสิทธิ์
    เข้าถึงระดับบทบาท" คือ Firestore query ถูก Security Rules ปฏิเสธ (client ได้รับ
    `permission-denied` จาก Firestore SDK เอง ไม่ใช่ custom error code); "HN ไม่ครบ 7 หลัก" และ
    "ไม่พบผู้ป่วย" ทั้งสองกรณีเป็น client-side logic (ไม่ใช่ error จาก server) ตามที่อธิบายข้างต้น

## Operation 17 — อธิบายผลการค้นหาผู้ป่วยด้วย HN โดยบริการ AI ภายนอก (AI-assisted Search Result Explanation)

**เพิ่ม 2026-09-26** รองรับ [[backlog#กลาง|FR-17]] และ [[backlog#Non-Functional Requirements|NFR-21]]
— เป็นส่วนขยายโดยตรงของ [[#Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วยทั้งหมดในระบบ (ค้นหาเฉพาะรายด้วยเลข HN)|Operation 0]]
เรียกต่อทันทีหลัง Operation 0 คืนผลลัพธ์แล้ว **เฉพาะจังหวะที่ผู้ใช้กดปุ่มค้นหาด้วย HN เท่านั้น** (ไม่
เรียกตอนหยุดพิมพ์/debounce — ดูเหตุผลเรื่องประหยัด quota ที่
[[technology-stack#20. AI ช่วยอธิบายผลการค้นหาผู้ป่วยด้วย HN (FR-17, NFR-21) — Firebase AI Logic (Gemini Developer API) เรียกตรงจาก Client|decision area 20 ใน technology-stack]])
AI ทำหน้าที่อธิบายผลลัพธ์ที่แสดงอยู่แล้วเป็นภาษาคนเท่านั้น ไม่ใช่แชตตอบคำถามอิสระและไม่ใช่คำแนะนำ
ทางคลินิก (ไม่เกี่ยวข้องกับฟีเจอร์ที่ 2 — การวิเคราะห์ความเสี่ยงโรคแทรกซ้อน)

**ไม่มี entity ใหม่ใน [[db-spec]]** — operation นี้ไม่อ่าน/ไม่เขียนข้อมูลใดๆ ใน Primary Data Store
และไม่มีการเก็บผลลัพธ์ที่ AI สร้างไว้ที่ใดเลย (ไม่ใช่ Firestore, ไม่ใช่ audit log) ตามที่
`[[technology-stack]]` ตัดสินใจไว้ (ดูหมายเหตุใน [[db-spec#ประเด็นรอตัดสินใจ|db-spec]])

- **ผู้เรียกได้/บทบาท:** เดียวกับ [[#Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วยทั้งหมดในระบบ (ค้นหาเฉพาะรายด้วยเลข HN)|Operation 0]]
  (แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD, Admin) เพราะเป็นส่วนขยายของขั้นตอนค้นหาเดียวกันที่ทุกบทบาทเรียกใช้
- **Input (จำกัดเฉพาะ 3 ค่านี้เท่านั้นตาม NFR-21 — ห้ามส่งเพิ่มเติมเด็ดขาด):**
  - เลข HN ที่ผู้ใช้พิมพ์ (ข้อความ) — จำเป็น (ส่งค่าที่พิมพ์จริง แม้จะไม่ครบ 7 หลักก็ตาม)
  - สถานะผลการค้นหาจาก Operation 0 (ข้อความ ค่าที่กำหนดไว้ล่วงหน้า: `"invalid-hn"` (HN ไม่ครบ 7
    หลัก) \| `"not-found"` (ครบ 7 หลักแต่ไม่พบผู้ป่วย) \| `"found"` (พบผู้ป่วยที่ตรงกัน)) — จำเป็น
  - จำนวนผู้ป่วยที่พบ (ตัวเลข) — จำเป็นเฉพาะเมื่อสถานะ = `"found"` เท่านั้น
  - **ห้ามส่ง:** ชื่อ-นามสกุลผู้ป่วย, Patient.id หรือข้อมูลระบุตัวตนอื่นใดนอกเหนือจาก 3 ค่าข้างต้น
    เด็ดขาด (NFR-21) — การจำกัดนี้บังคับใช้ที่ชั้น prompt construction ในโค้ด Client เท่านั้น
    (ไม่มีชั้นตรวจสอบซ้ำฝั่งเซิร์ฟเวอร์ — ดู Technical Binding ด้านล่าง)
- **Output:** ข้อความอธิบายผลการค้นหาเป็นภาษาคน (ข้อความ) พร้อม**ป้ายกำกับชัดเจนว่าเป็นข้อมูลประกอบ
  ไม่ใช่คำแนะนำทางการแพทย์** (FR-17) — หรือไม่มี output เลยถ้าเรียกล้มเหลว/timeout (ดูกรณี error)
- **กฎทางธุรกิจ:**
  - เรียกเฉพาะครั้งเดียวต่อการกดค้นหาหนึ่งครั้ง ไม่ใช่ operation ที่เรียกซ้ำระหว่างพิมพ์
  - ครอบคลุมทั้ง 3 กรณีสถานะ (`invalid-hn`/`not-found`/`found`) เหมือนกันทุกกรณี
  - ข้อความที่ AI สร้างต้องแสดงพร้อมป้ายกำกับข้อมูลประกอบเสมอ ไม่แสดงลอยๆ โดยไม่มีป้ายกำกับ
  - ความล้มเหลว/การไม่ตอบสนองของ operation นี้**ต้องไม่บล็อก**ผลการค้นหาปกติจาก Operation 0 (FR-17)
- **กรณี error:**
  - บริการ AI ภายนอกใช้งานไม่ได้/ล้มเหลว/timeout → ไม่แสดงคำอธิบายเพิ่มเติม (ผลการค้นหาปกติจาก
    Operation 0 ยังคงแสดงตามปกติ — ไม่ใช่ error ที่ต้องแจ้งเตือนผู้ใช้เป็นพิเศษ)
- **อ้างอิง:** [[backlog#กลาง|FR-17]], [[backlog#Non-Functional Requirements|NFR-21]],
  [[db-spec#ผู้ป่วย (Patient)|Patient]] (เฉพาะ field `เลขประจำตัวผู้ป่วย` ที่ใช้เป็นค่าประกอบ input
  — ไม่มี attribute ใหม่ใดๆ ถูกอ่าน/เขียนจาก entity นี้โดย operation นี้),
  [[architecture#บริการ AI ภายนอก (External AI Service)|บริการ AI ภายนอก (External AI Service) ใน architecture]]
- **Technical Binding (ตาม [[technology-stack#20. AI ช่วยอธิบายผลการค้นหาผู้ป่วยด้วย HN (FR-17, NFR-21) — Firebase AI Logic (Gemini Developer API) เรียกตรงจาก Client|decision area 20]],
  [[technology-stack#21. App Check สำหรับ Firebase AI Logic — reCAPTCHA v3 (production) + Debug Provider (local dev)|decision area 21]],
  [[technology-stack#22. จุดกำหนดชื่อโมเดล AI — Constant เดียวใน `web/src/ai/config.ts`|decision area 22]]
  ใน technology-stack):**
  **ไม่ใช่ Cloud Function** — Client เรียก **Firebase AI Logic** ตรง (ตั้งค่า backend เป็น **Gemini
  Developer API**) ผ่าน `firebase/ai` SDK (`getAI`, `getGenerativeModel`) — **ไม่ผ่าน Backend Service
  และไม่มี Cloud Function ตัวกลาง** เพราะโปรเจกต์ยังไม่อยู่แพ็กเกจ Blaze (Gemini Developer API ใช้งาน
  ได้บนแพ็กเกจ Spark) โมเดลที่ใช้คือ `gemini-3.5-flash-lite` กำหนดเป็น constant เดียวใน
  `web/src/ai/config.ts` (`GEMINI_MODEL_NAME`, decision area 22) ป้องกันด้วย **Firebase App Check**
  (reCAPTCHA v3 บน production, Debug Provider สำหรับ local dev — decision area 21) ที่ Firebase
  บังคับเปิดให้ AI Logic โดยอัตโนมัติ
  - **NFR-21 บังคับได้เฉพาะฝั่ง Client เท่านั้น** — ไม่มีชั้นตรวจสอบ/กรอง prompt ซ้ำฝั่งเซิร์ฟเวอร์ก่อน
    ส่งไปยัง Gemini Developer API เพราะไม่มี Cloud Function ตัวกลางในเส้นทางนี้ (ความเสี่ยงที่ผู้ใช้
    รับทราบแล้ว — ดู [[architecture#บริการ AI ภายนอก (External AI Service)|architecture]] และ
    "ประเด็นรอตัดสินใจ" ท้ายเอกสารนี้)
  - **ไม่มี audit log ฝั่งเซิร์ฟเวอร์ของการเรียก operation นี้เลยในรอบนี้** — ต่างจาก Operation 1-6 ที่
    มี audit log แบบ fail-safe ตาม NFR-06 (ความเสี่ยงที่บันทึกไว้ ดู "ประเด็นรอตัดสินใจ" ด้านล่าง)
  - **Error/สถานะ:** ไม่มี error code แบบ Callable Function (ไม่ใช่ Cloud Function) — ความล้มเหลว/
    timeout ของ `firebase/ai` SDK (เช่น HTTP 404 กรณีโมเดลถูกปิดให้บริการ) ถูก catch ที่โค้ด Client
    และปฏิบัติเป็น "ไม่มีคำอธิบายเพิ่มเติม" เสมอ ไม่ใช่ error ที่ต้องแจ้งเตือนผู้ใช้หรือบล็อกผลการค้นหา
    ปกติจาก Operation 0

## Operation 1 — ดึงประวัติการวินิจฉัยโรค NCD ของผู้ป่วย

รองรับ [[backlog#สูง (MVP)|FR-01]] และ [[backlog#สูง (MVP)|FR-15]] (Admin — อ่านอย่างเดียว, ผู้ป่วย
ทุกรายในระบบเหมือนแพทย์/พยาบาลตั้งแต่ 2026-09-25)

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD, Admin (อ่านอย่างเดียว — ผู้ป่วยทุกรายในระบบ
  เหมือนแพทย์/พยาบาล ตาม FR-15/NFR-19 — แก้ไข 2026-09-25 ไม่ใช่ "ข้อยกเว้น" อีกต่อไป)
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ NcdDiagnosis ของผู้ป่วยรายนั้น เรียงตาม "วันที่วินิจฉัย" (จากใหม่ไปเก่า หรือ
  เก่าไปใหม่ตามช่วงเวลา) แต่ละรายการประกอบด้วย: id, รหัส ICD-10, กลุ่มโรคหลัก, วันที่วินิจฉัย,
  บันทึกเพิ่มเติมจากแพทย์ (ถ้ามี), แหล่งข้อมูลต้นทาง (ดู [[db-spec#ประวัติการวินิจฉัยโรค NCD (NcdDiagnosis)|NcdDiagnosis ใน db-spec]])
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02) — ไม่มีการตรวจสอบระดับรายผู้ป่วย
    อีกต่อไป (แก้ไข 2026-09-25 ยกเลิกกลไก PatientAssignment ทั้งหมด) เมื่อผู้เรียกเป็น Admin ต้องบันทึก
    audit log พร้อม `เข้าถึงในฐานะ Admin หรือไม่ = จริง` เสมอ (NFR-20)
  - แสดงเฉพาะการวินิจฉัยที่ กลุ่มโรคหลัก อยู่ในขอบเขต: เบาหวาน (E10–E14), ความดันโลหิตสูง
    (I10–I14), ถุงลมโป่งพอง (J44) ตาม
    [[20260917-01-patient-ncd-history-lab-complication-risk#ขอบเขต|ขอบเขตของ spec]]
  - ข้อมูลอ้างอิงจากแหล่งข้อมูล HOSxP หรือข้อมูลจำลองระหว่างพัฒนา/ทดสอบ (NFR-01)
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง/บัญชีถูกระงับ) → ปฏิเสธการเข้าถึง (NFR-02, FR-05) พร้อมข้อความแจ้งผู้ใช้ตาม [[architecture]]
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ไม่พบประวัติการวินิจฉัยของผู้ป่วยรายนี้เลย → คืนรายการว่าง (ไม่ถือเป็น error)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-01]], [[backlog#Non-Functional Requirements|NFR-01]],
  [[backlog#Non-Functional Requirements|NFR-02]], [[db-spec#ประวัติการวินิจฉัยโรค NCD (NcdDiagnosis)|NcdDiagnosis]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `getNcdDiagnoses`** — อ่าน collection `ncdDiagnoses` ผ่าน Firebase Admin SDK ด้วย
  composite index `(patientId ASC, diagnosedAt DESC)` (ดู
  [[db-spec#ประวัติการวินิจฉัยโรค NCD (NcdDiagnosis)|Firestore Technical Binding ใน db-spec]])
  หลังผ่าน Access Control + Audit Logging (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง
  → `permission-denied`; ไม่พบผู้ป่วย → `not-found`; บันทึก Audit Log ไม่สำเร็จ → `internal`

## Operation 2 — ดึงผลตรวจ lab ย้อนหลังของผู้ป่วย

รองรับ [[backlog#สูง (MVP)|FR-02]] และ [[backlog#สูง (MVP)|FR-15]] (Admin — อ่านอย่างเดียว, ผู้ป่วย
ทุกรายในระบบเหมือนแพทย์/พยาบาลตั้งแต่ 2026-09-25)

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD, Admin (อ่านอย่างเดียว — ผู้ป่วยทุกรายในระบบ
  เหมือนแพทย์/พยาบาล ตาม FR-15/NFR-19 — แก้ไข 2026-09-25 ไม่ใช่ "ข้อยกเว้น" อีกต่อไป)
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น
  - ช่วงเวลาที่ต้องการดูย้อนหลัง (วันที่เริ่มต้น/สิ้นสุด) — ไม่บังคับ (ถ้าไม่ระบุ คืนทั้งหมดที่มี)
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ LabResult ของผู้ป่วยรายนั้น เรียงตาม "วันที่ตรวจ" เพื่อให้เห็นแนวโน้ม
  แต่ละรายการประกอบด้วย: id, ชนิดการตรวจ, ค่าผลตรวจ, หน่วยของค่าผลตรวจ, วันที่ตรวจ, แหล่งข้อมูล
  ต้นทาง (ดู [[db-spec#ผลตรวจ lab (LabResult)|LabResult ใน db-spec]])
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02) — ไม่มีการตรวจสอบระดับรายผู้ป่วย
    อีกต่อไป (แก้ไข 2026-09-25 ยกเลิกกลไก PatientAssignment ทั้งหมด) เมื่อผู้เรียกเป็น Admin ต้องบันทึก
    audit log พร้อม `เข้าถึงในฐานะ Admin หรือไม่ = จริง` เสมอ (NFR-20)
  - แสดงเฉพาะชนิดการตรวจ lab มาตรฐานที่เกี่ยวข้องกับกลุ่มโรคหลักและโรคแทรกซ้อนในขอบเขต (เช่น
    HbA1c, eGFR, LDL, ความดันโลหิต)
  - ข้อมูลอ้างอิงจากแหล่งข้อมูล HOSxP หรือข้อมูลจำลองระหว่างพัฒนา/ทดสอบ (NFR-01)
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง/บัญชีถูกระงับ) → ปฏิเสธการเข้าถึง (NFR-02, FR-05)
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ช่วงเวลาที่ระบุไม่ถูกต้อง (เช่น วันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด) → แจ้งว่า input ไม่ถูกต้อง
  - ไม่พบผลตรวจ lab ในช่วงเวลาที่ระบุ → คืนรายการว่าง (ไม่ถือเป็น error)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-02]], [[backlog#Non-Functional Requirements|NFR-01]],
  [[backlog#Non-Functional Requirements|NFR-02]], [[db-spec#ผลตรวจ lab (LabResult)|LabResult]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `getLabResults`** — อ่าน collection `labResults` ผ่าน Firebase Admin SDK ด้วย composite
  index `(patientId ASC, testedAt DESC)` และเพิ่ม range filter บน `testedAt` เมื่อระบุช่วงเวลา (ดู
  [[db-spec#ผลตรวจ lab (LabResult)|Firestore Technical Binding ใน db-spec]]) หลังผ่าน Access
  Control + Audit Logging (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง →
  `permission-denied`; ไม่พบผู้ป่วย → `not-found`; ช่วงเวลาไม่ถูกต้อง → `invalid-argument`;
  บันทึก Audit Log ไม่สำเร็จ → `internal`

## Operation 3 — วิเคราะห์และแสดงผลความเสี่ยงโรคแทรกซ้อนของผู้ป่วย

รองรับ [[backlog#สูง (MVP)|FR-03]] (วิเคราะห์), [[backlog#สูง (MVP)|FR-04]] (แสดง/แจ้งผล) และ
[[backlog#สูง (MVP)|FR-15]] (Admin — อ่านอย่างเดียว, ผู้ป่วยทุกรายในระบบเหมือนแพทย์/พยาบาลตั้งแต่
2026-09-25) — รวมเป็น operation เดียวเพราะผลการวิเคราะห์
ถูกส่งกลับให้ Client แสดงผลทันทีตาม sequence diagram ใน
[[architecture#Data Flow Diagram — Journey หลัก|architecture]]

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD, Admin (อ่านอย่างเดียว — ผู้ป่วยทุกรายในระบบ
  เหมือนแพทย์/พยาบาล ตาม FR-15/NFR-19 — แก้ไข 2026-09-25 ไม่ใช่ "ข้อยกเว้น" อีกต่อไป, ไม่มีสิทธิ์เรียก
  Operation 16 ต่อ)
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** ComplicationRiskAssessment หนึ่งรายการ (รวม field สถานะการยืนยัน/แก้ไขล่าสุดตาม FR-16
  ถ้ามี) ประกอบด้วย: id, วันที่-เวลาในการประเมิน,
  พบความเสี่ยงหรือไม่ (จริง/เท็จ), และรายการ RiskFinding ย่อยต่อโรคแทรกซ้อนแต่ละชนิดที่ถูกประเมิน
  (โรคแทรกซ้อนที่ประเมิน, เข้าเงื่อนไขความเสี่ยงหรือไม่, ระดับความเสี่ยงที่ประเมินได้ถ้ามี) — ดู
  [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|ComplicationRiskAssessment]]
  และ [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding ใน db-spec]]
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02) — ไม่มีการตรวจสอบระดับรายผู้ป่วย
    อีกต่อไป (แก้ไข 2026-09-25 ยกเลิกกลไก PatientAssignment ทั้งหมด) เมื่อผู้เรียกเป็น Admin ต้องบันทึก
    audit log พร้อม `เข้าถึงในฐานะ Admin หรือไม่ = จริง` เสมอ (NFR-20)
  - ประมวลผลค่าผลตรวจ lab ล่าสุดของผู้ป่วย (จาก [[db-spec#ผลตรวจ lab (LabResult)|LabResult]])
    เทียบกับ threshold มาตรฐานที่เกี่ยวข้อง (จาก
    [[db-spec#threshold มาตรฐานของโรคแทรกซ้อน (ComplicationRiskThreshold)|ComplicationRiskThreshold]])
    แบบ rule-based เท่านั้น **ห้ามใช้ AI/Machine Learning model** ตามขอบเขต MVP (FR-03)
  - ครอบคลุมเฉพาะโรคแทรกซ้อนในขอบเขต: ไตวายเรื้อรัง (N18.3–N18.9), โรคหัวใจ (I20–I25),
    โรคหลอดเลือดสมอง (I60–I69)
  - แต่ละ RiskFinding ที่สร้างขึ้นต้องบันทึก ค่า threshold และตัวดำเนินการเปรียบเทียบที่ใช้ ณ เวลา
    ประเมินแบบ snapshot แยกจากค่าปัจจุบันใน ComplicationRiskThreshold เสมอ (ดูเหตุผลใน
    [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding ใน db-spec]])
  - ComplicationRiskAssessment.พบความเสี่ยงหรือไม่ เป็นจริง ก็ต่อเมื่อมี RiskFinding อย่างน้อยหนึ่ง
    รายการที่ "เข้าเงื่อนไขความเสี่ยงหรือไม่" เป็นจริง
  - ถ้าไม่พบความเสี่ยงเลย ต้องคืนผลลัพธ์ที่สื่อความหมายว่า "ไม่พบความเสี่ยงเพิ่มเติม" อย่างชัดเจน
    ไม่ใช่ error (ตาม [[user-journey]])
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง/บัญชีถูกระงับ) → ปฏิเสธการเข้าถึง (NFR-02, FR-05)
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ไม่พบผลตรวจ lab ที่เพียงพอสำหรับประเมิน rule ใดๆ เลย → คืนผลลัพธ์ "ข้อมูลไม่เพียงพอสำหรับการ
    ประเมิน" (ไม่ใช่ error แต่เป็นผลลัพธ์ประเภทหนึ่งที่ Client ต้องแสดงข้อความอธิบาย)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-03]], [[backlog#สูง (MVP)|FR-04]],
  [[backlog#Non-Functional Requirements|NFR-01]], [[backlog#Non-Functional Requirements|NFR-02]],
  [[backlog#Non-Functional Requirements|NFR-11]] (threshold ที่อ่านต้องผ่านการยืนยันจากแพทย์
  ผู้เชี่ยวชาญก่อน deploy เสมอ — กระบวนการนอกระบบ ดู
  [[#Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)|Cross-cutting
  NFR-09–NFR-16 ด้านบน]]), [[backlog#Non-Functional Requirements|NFR-13]] (field ระดับความเสี่ยงเป็น
  ข้อความกำกับ ไม่ใช่สีอย่างเดียว),
  [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|ComplicationRiskAssessment]],
  [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding]]
- **Technical Binding (ตาม [[technology-stack#2. ภาษา/Framework ฝั่ง Backend Logic — Node.js + TypeScript บน Cloud Functions|decision area 2 ใน technology-stack]]):**
  Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function ชื่อ
  `assessComplicationRisk`** — อ่าน `labResults` (composite index `(patientId ASC, testType ASC,
  testedAt DESC)` เพื่อดึงค่าล่าสุดต่อชนิดการตรวจ) และ `complicationRiskThresholds` ผ่าน Admin SDK
  แล้วเขียนผลลัพธ์ลง `complicationRiskAssessments/{assessmentId}` พร้อม subcollection
  `riskFindings` (ดู [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|
  Firestore Technical Binding ใน db-spec]]) เขียน logic เปรียบเทียบ threshold เป็นโค้ด TypeScript
  โดยตรง (ไม่ใช้ Firestore Security Rules สำหรับส่วนนี้) หลังผ่าน Access Control + Audit Logging
  (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง → `permission-denied`; ไม่พบผู้ป่วย →
  `not-found`; บันทึก Audit Log ไม่สำเร็จ → `internal`

## Operation 4 — ยื่นและดำเนินการคำขอใช้สิทธิของเจ้าของข้อมูล (Data Subject Rights Request)

รองรับ [[backlog#Non-Functional Requirements|NFR-07]] — ใช้ Operation 0 ค้นหา/เลือกผู้ป่วยเดียวกันก่อน
เสมอตาม [[user-journey#Journey เจ้าหน้าที่ดำเนินการตามคำขอใช้สิทธิของเจ้าของข้อมูล และสนับสนุนการสืบสวนกรณีข้อมูลส่วนบุคคลรั่วไหล (PDPA)|journey ที่สอง]]
ระบบเป็นระบบภายในที่เจ้าหน้าที่ดำเนินการแทนผู้ป่วย ไม่มีช่องทาง self-service ในขอบเขต MVP (ดู
[[20260921-01-pdpa-data-protection-compliance#นอกขอบเขต (Out of scope) ของเอกสารนี้|หัวข้อนอกขอบเขตของ spec PDPA]])

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD (ในฐานะเจ้าหน้าที่ที่มีสิทธิ์)
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น (มาจากผลลัพธ์ของ Operation 0)
  - ประเภทคำขอ (ขอเข้าถึง/ขอสำเนา/ขอแก้ไข/ขอลบ/คัดค้านการประมวลผล) — จำเป็น
  - รายละเอียดคำขอ (เช่น ข้อมูลที่ต้องการแก้ไข หรือเหตุผลการคัดค้าน) — จำเป็นเมื่อประเภทคำขอเป็น
    "ขอแก้ไข" หรือ "คัดค้านการประมวลผล", ไม่บังคับสำหรับประเภทอื่น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:**
  - [[db-spec#คำขอใช้สิทธิของเจ้าของข้อมูล (DataSubjectRequest)|DataSubjectRequest]] ที่สร้าง/อัปเดต:
    id, ประเภทคำขอ, สถานะคำขอ, วันที่ยื่นคำขอ, วันที่ดำเนินการเสร็จสิ้น (ถ้ามี)
  - ผลลัพธ์การดำเนินการตามประเภทคำขอ: กรณี "ขอเข้าถึง"/"ขอสำเนา" คืนชุดข้อมูลส่วนบุคคลของผู้ป่วยรายนั้น
    (ประวัติวินิจฉัย, ผลตรวจ lab, ผลวิเคราะห์ความเสี่ยง, ข้อมูลระบุตัวตนที่ใช้ค้นหา — ตามขอบเขตของ
    [[20260921-01-pdpa-data-protection-compliance#ขอบเขต|spec PDPA]]); กรณี "ขอแก้ไข"/"ขอลบ"/
    "คัดค้านการประมวลผล" คืนการยืนยันผลการดำเนินการ
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ระดับบทบาท และผ่านการตรวจสอบ purpose limitation
    ก่อนเสมอ (NFR-02, NFR-03) — ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไป (แก้ไข 2026-09-25 ยกเลิกกลไก
    PatientAssignment ทั้งหมด)
  - ต้องเรียก "บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)" ก่อนดำเนินการค้นหา/สกัด/แก้ไข/ลบ
    ข้อมูลจริงเสมอ โดยระบุรหัส DataSubjectRequest ที่เกี่ยวข้อง (NFR-06)
  - กรณีคำขอ "ขอลบ" ต้องพิจารณาร่วมกับนโยบายใน
    [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)|RetentionPolicy]] (NFR-05) — ไม่ลบข้อมูลที่
    ยังมีความจำเป็นตามฐานทางกฎหมายอื่น (เช่น ข้อบังคับเวชระเบียน) โดยไม่มีการยืนยันเพิ่มเติม
  - กระบวนการยืนยันตัวตน/ความถูกต้องของคำขอจากผู้ป่วยก่อนที่เจ้าหน้าที่จะยื่นคำขอนี้ในระบบ เป็น
    กระบวนการเชิงองค์กรที่อยู่นอกขอบเขตของ operation นี้ (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)
  - เมื่อดำเนินการเสร็จสิ้น (สำเร็จหรือปฏิเสธ) ต้องปรับสถานะคำขอและบันทึกวันที่ดำเนินการเสร็จสิ้น
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง/บัญชีถูกระงับ) → ปฏิเสธการเข้าถึง (NFR-02, FR-05)
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ประเภทคำขอไม่ถูกต้อง/ไม่อยู่ในรายการที่กำหนด หรือระบุประเภท "ขอแก้ไข"/"คัดค้านการประมวลผล" โดยไม่มี
    รายละเอียดคำขอ → แจ้งว่า input ไม่ถูกต้อง
  - บันทึก Audit Logging ไม่สำเร็จ → ยกเลิกการดำเนินการตามคำขอทั้งหมด (ดู Operation ร่วม Audit Logging)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-07]],
  [[backlog#Non-Functional Requirements|NFR-05]], [[backlog#Non-Functional Requirements|NFR-06]],
  [[backlog#Non-Functional Requirements|NFR-02]], [[backlog#Non-Functional Requirements|NFR-03]],
  [[db-spec#คำขอใช้สิทธิของเจ้าของข้อมูล (DataSubjectRequest)|DataSubjectRequest]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `submitDataSubjectRequest`** — เขียน/อัปเดต `dataSubjectRequests/{requestId}` ผ่าน Admin SDK
  หลังผ่าน Access Control + Audit Logging (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง
  → `permission-denied`; ไม่พบผู้ป่วย → `not-found`; ประเภทคำขอไม่ถูกต้อง/ขาดรายละเอียดที่จำเป็น →
  `invalid-argument`; บันทึก Audit Log ไม่สำเร็จ → `internal`
  - **กรณี "ขอแก้ไข" (แก้ไข 2026-09-25):** แก้ไข `Patient.hn`/`Patient.fullName` โดยตรงบนเอกสาร
    `patients/{patientId}` เท่านั้น — **ไม่มีสำเนา denormalized ให้ sync อีกต่อไป** (เดิมเคยต้องอัปเดต
    สำเนาใน `patientAssignments` ที่ถูกลบแล้ว) เพราะ Operation 0 อ่าน `patients` โดยตรงอยู่แล้ว

## Operation 5 — สืบค้นบันทึกการเข้าถึงข้อมูล (Audit Trail Retrieval)

รองรับ [[backlog#Non-Functional Requirements|NFR-08]] — สนับสนุนการสืบสวน/แจ้งเหตุละเมิดข้อมูลส่วนบุคคล
ตาม [[user-journey#Journey เจ้าหน้าที่ดำเนินการตามคำขอใช้สิทธิของเจ้าของข้อมูล และสนับสนุนการสืบสวนกรณีข้อมูลส่วนบุคคลรั่วไหล (PDPA)|journey ที่สอง]]

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD (ในฐานะเจ้าหน้าที่ที่มีสิทธิ์ — ดู "ประเด็นรอ
  ตัดสินใจ" ท้ายเอกสารเรื่องบทบาทที่ควรเรียก operation นี้ได้)
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — ไม่บังคับ (ระบุเพื่อจำกัดผลลัพธ์เฉพาะผู้ป่วยรายนั้น)
  - ช่วงเวลาที่ต้องการสืบค้น (วันที่-เวลาเริ่มต้น/สิ้นสุด) — ไม่บังคับ
  - รหัสผู้ใช้ที่ต้องการตรวจสอบ (User.id) — ไม่บังคับ
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]] ที่ตรงเงื่อนไข
  เรียงตามวันที่-เวลาที่เข้าถึง แต่ละรายการประกอบด้วย: id, ผู้ใช้, ผู้ป่วย, การดำเนินการ, วันที่-เวลาที่
  เข้าถึง, คำขอสิทธิที่เกี่ยวข้อง (ถ้ามี)
- **กฎทางธุรกิจ:**
  - ต้องผ่านการตรวจสอบสิทธิ์ระดับบทบาทของ "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02) —
    ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไปไม่ว่าจะระบุ Patient.id หรือไม่ (แก้ไข 2026-09-25 ยกเลิกกลไก
    PatientAssignment ทั้งหมด)
  - การเรียก operation นี้เองก็ต้องถูกบันทึกลง Audit Log เช่นกัน (การดำเนินการ = "ดูข้อมูลผู้ป่วย" ตามค่า
    ที่กำหนดไว้ล่วงหน้าใน [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord.การดำเนินการ]])
    เพื่อรักษาความสมบูรณ์ของหลัก Accountability (NFR-06)
  - ต้องให้ผลลัพธ์เพียงพอต่อการสืบสวน/แจ้งเหตุละเมิดภายในกรอบเวลาที่กฎหมายกำหนด (NFR-08) — กรอบเวลา
    ที่แน่นอนยังไม่ถูกกำหนดในเอกสารต้นทาง
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึงระดับบทบาท → ปฏิเสธการเข้าถึง (NFR-02)
  - ช่วงเวลาที่ระบุไม่ถูกต้อง (เช่น วันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด) → แจ้งว่า input ไม่ถูกต้อง
  - ไม่พบบันทึกที่ตรงเงื่อนไข → คืนรายการว่าง (ไม่ถือเป็น error)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-08]],
  [[backlog#Non-Functional Requirements|NFR-06]], [[backlog#Non-Functional Requirements|NFR-02]],
  [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `getAuditTrail`** — สืบค้น collection `auditLogRecords` ผ่าน Admin SDK ด้วย composite index
  ที่ตรงกับเงื่อนไขที่ระบุ (ดู [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|Firestore Technical
  Binding ใน db-spec]] สำหรับรายการ composite index ทั้งหมด) หลังผ่าน Access Control (internal —
  เฉพาะระดับบทบาท เท่านั้น — แก้ไข 2026-09-25 ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไป) แล้วเท่านั้น
  การเรียก operation นี้เองก็ถูกบันทึกลง Audit Log เช่นกัน — **Error code:** ปฏิเสธการเข้าถึงระดับ
  บทบาท → `permission-denied`; ช่วงเวลาไม่ถูกต้อง → `invalid-argument`

## Operation 6 — บังคับใช้นโยบายเก็บรักษาและลบข้อมูลที่พ้นระยะเวลา (Retention Enforcement)

รองรับ [[backlog#Non-Functional Requirements|NFR-05]] — เป็น internal operation ที่
[[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Data Subject Rights \& Retention Management]]
บังคับใช้กับ Primary Data Store และ Audit Log Store กลไก trigger จริง (scheduled job อัตโนมัติ หรือ
manual process ในช่วงแรก) ยังไม่ถูกตัดสินใจ (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)

- **ผู้เรียกได้/บทบาท:** internal (เรียกโดยกลไก automation ของ Backend Service เอง — ไม่ใช่ operation
  ที่ Client เรียกตรงในขอบเขต MVP)
- **Input:**
  - [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)|RetentionPolicy]] ที่จะใช้บังคับ (ระบุ
    ประเภทข้อมูลที่บังคับใช้) — จำเป็น
- **Output:** จำนวน/รายการระเบียนที่ถูกลบ/ทำลายในรอบการบังคับใช้นี้ (ระบุ entity และ id ที่ถูกลบ เพื่อ
  ใช้อ้างอิงในการตรวจสอบย้อนหลัง)
- **กฎทางธุรกิจ:**
  - ตรวจสอบระเบียนของ entity ที่ RetentionPolicy.ประเภทข้อมูลที่บังคับใช้ระบุ (NcdDiagnosis/LabResult
    ที่ผูกกับ Patient สำหรับหมวด Primary Data Store หรือ AuditLogRecord สำหรับหมวด Audit Log Store)
    เทียบกับ RetentionPolicy.ระยะเวลาเก็บรักษา (จำนวนวัน) นับจากเงื่อนไขเริ่มนับที่กำหนด แล้วลบ/ทำลาย
    ระเบียนที่พ้นระยะเวลาแล้ว (NFR-05)
  - ค่าระยะเวลาเก็บรักษาจริงยังไม่ถูกกำหนด — ห้าม hardcode ค่าใดๆ จนกว่าจะได้รับการยืนยันจากหน่วยงาน/
    ฝ่ายกฎหมาย (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)
  - Audit Log Store อาจมีนโยบาย retention ที่ต่างจาก Primary Data Store (เก็บนานกว่า เพื่อรองรับการ
    สืบสวน/แจ้งเหตุละเมิดตาม NFR-08) — ต้องใช้ RetentionPolicy คนละรายการกัน ไม่ใช้ค่าเดียวกัน
  - การลบตามนโยบายนี้แตกต่างจากการลบตามคำขอสิทธิของเจ้าของข้อมูล (Operation 4 กรณี "ขอลบ") ซึ่งเป็น
    การลบตามคำขอเฉพาะราย ไม่ใช่ตามรอบเวลาอัตโนมัติ — ทั้งสอง operation ต้องบันทึก Audit Log แยกกัน
    (NFR-06)
- **กรณี error:**
  - RetentionPolicy ที่ระบุไม่มีค่าระยะเวลาเก็บรักษา (ยังไม่ถูกกำหนด) → ข้ามการบังคับใช้สำหรับ
    ประเภทข้อมูลนั้นในรอบนี้ (ไม่ใช่ error แต่เป็นผลลัพธ์ที่ต้องรายงานให้ผู้ดูแลระบบทราบ)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-05]],
  [[backlog#Non-Functional Requirements|NFR-06]],
  [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)|RetentionPolicy]]
- **Technical Binding (ตาม [[technology-stack#6. Hosting/Deployment Environment|decision area 6 ใน technology-stack]]):**
  Cloud Functions (2nd gen) — **scheduled function ชื่อ `enforceRetentionPolicy` trigger ผ่าน
  Cloud Scheduler** (ไม่ใช่ HTTPS Callable Function — Client ไม่เรียก operation นี้ในขอบเขต MVP)
  อ่าน `retentionPolicies` แล้วลบระเบียนที่พ้นระยะเวลาใน `ncdDiagnoses`/`labResults`/
  `auditLogRecords` ผ่าน Admin SDK — ความถี่ schedule ที่แน่นอนยังรอค่า `RetentionPolicy.ระยะเวลา
  เก็บรักษา` จริงก่อน (ดู "ประเด็นรอตัดสินใจ") — **Error/ผลลัพธ์:** RetentionPolicy ที่ระบุไม่มีค่า
  ระยะเวลาเก็บรักษา → ข้ามการบังคับใช้และบันทึก log ภายใน (ไม่ใช่ HttpsError เพราะไม่มี caller ที่
  รอผลลัพธ์แบบ synchronous)

## Operation 10 — ดูรายชื่อผู้ใช้งานในระบบ (สำหรับ Admin จัดการบัญชี)

รองรับ [[backlog#สูง (MVP)|FR-11]], [[backlog#สูง (MVP)|FR-12]], [[backlog#สูง (MVP)|FR-13]] — **ใหม่
จากฟีเจอร์ที่ 7** เป็น precondition ของ Operation 11/12/13 ด้านล่าง (Admin ต้องเห็นรายชื่อ/สถานะบัญชี
ก่อนเลือกดำเนินการ)

- **ผู้เรียกได้/บทบาท:** Admin เท่านั้น
- **Input:**
  - ตัวกรอง (ไม่บังคับ: "เฉพาะที่รอการอนุมัติ" — `role` ว่างและ `isActive=false`, หรือ "ทั้งหมด")
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ User ทุกคนที่ตรงตัวกรอง แต่ละรายการประกอบด้วย: id, ชื่อ-นามสกุล, อีเมล, บทบาท
  (ถ้ามี), สถานะการใช้งานบัญชี, สถานะการยืนยันอีเมล
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ระดับบทบาทก่อนเสมอ (ตรวจว่าผู้เรียกมี `role = "admin"`
    และ `isActive = true`) — operation นี้ไม่เกี่ยวกับข้อมูลผู้ป่วยโดยตรง จึงไม่ต้องผ่านการตรวจสอบ
    ระดับรายผู้ป่วยหรือข้อยกเว้น NFR-19
  - `อีเมล`/`สถานะการยืนยันอีเมล` อ่านจาก Firebase Authentication ผ่าน Admin SDK คู่กับข้อมูลจาก
    Firestore `users/{uid}` (เช่นเดียวกับที่ [[db-spec#ผู้ใช้ (User)|db-spec]] อธิบายไว้)
- **กรณี error:**
  - ผู้เรียกไม่ใช่ Admin หรือบัญชีถูกระงับ → ปฏิเสธการเข้าถึง (NFR-02)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-11]], [[backlog#สูง (MVP)|FR-12]], [[backlog#สูง (MVP)|FR-13]],
  [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `listUserAccounts`** (กลุ่มงาน Admin — Account, Role & Patient Assignment Management ตาม
  [[architecture]]) — อ่าน collection `users` ผ่าน Firebase Admin SDK (ไม่ผ่าน Security Rules เพราะ
  Client อ่าน `users` ของผู้อื่นไม่ได้โดยตรง) — **Error code:** ปฏิเสธการเข้าถึง →
  `permission-denied`; ไม่มี auth token → `unauthenticated`

## Operation 11 — อนุมัติบัญชีผู้ใช้งานใหม่ผ่านหน้าจอในระบบ

รองรับ [[backlog#สูง (MVP)|FR-11]] — **ใหม่จากฟีเจอร์ที่ 7** แทนที่กลไกเดิมที่เคยระบุไว้ใน
[[20260923-01-user-authentication-email-password]] ว่าดำเนินการผ่าน Firebase Console/Firestore
โดยตรง

- **ผู้เรียกได้/บทบาท:** Admin เท่านั้น
- **Input:**
  - รหัสผู้ใช้เป้าหมาย (User.id ของบัญชีที่รอการอนุมัติ) — จำเป็น
  - บทบาทที่กำหนด (ค่าที่กำหนดไว้ล่วงหน้า: "แพทย์" หรือ "พยาบาล" **เท่านั้น — ไม่รวม "admin"**) —
    จำเป็น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** ยืนยันผลลัพธ์ พร้อมข้อมูล User ที่อัปเดตแล้ว (id, บทบาท, สถานะการใช้งานบัญชี)
- **กฎทางธุรกิจ:**
  - ผู้ใช้เป้าหมายต้องมีสถานะ `บทบาท` ว่าง/ไม่มีค่า และ `สถานะการใช้งานบัญชี = เท็จ` อยู่ก่อน (คือบัญชีที่
    เพิ่งสมัคร (FR-08) ยังไม่เคยถูกอนุมัติ) มิฉะนั้นถือเป็น input ไม่ถูกต้อง (ควรใช้ Operation 12/13
    แทนสำหรับบัญชีที่เคยอนุมัติแล้ว)
  - เมื่อผ่านเงื่อนไขข้างต้น กำหนด `บทบาท` ตามที่ระบุ และเปลี่ยน `สถานะการใช้งานบัญชี = จริง` พร้อมกันใน
    การดำเนินการเดียว
  - ต้องบันทึก audit log การเปลี่ยนแปลงบัญชี/สิทธิ์นี้เช่นเดียวกับกลุ่มงาน Audit Logging &
    Accountability (แม้ไม่ใช่การเข้าถึงข้อมูลผู้ป่วยโดยตรง แต่เป็นเหตุการณ์ที่ต้องตรวจสอบย้อนหลังได้)
- **กรณี error:**
  - ผู้เรียกไม่ใช่ Admin หรือบัญชีถูกระงับ → ปฏิเสธการเข้าถึง (NFR-02)
  - ไม่พบผู้ใช้เป้าหมายตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ใช้งาน
  - ผู้ใช้เป้าหมายเคยถูกอนุมัติแล้ว (มี `บทบาท` อยู่แล้ว) → แจ้งว่า input ไม่ถูกต้อง (ให้ใช้ Operation 12
    หรือ 13 แทน)
  - บทบาทที่ระบุไม่ใช่ "แพทย์"/"พยาบาล" (เช่น พยายามกำหนด "admin" ผ่าน operation นี้) → แจ้งว่า input
    ไม่ถูกต้อง
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-11]], [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `approveUserAccount`** — เขียน `users/{uid}` (`role`, `isActive = true`) ผ่าน Firebase Admin
  SDK เท่านั้น (Client ไม่มีสิทธิ์เขียนเอกสารนี้เองไม่ว่ากรณีใด) — **Error code:** ปฏิเสธการเข้าถึง →
  `permission-denied`; ไม่พบผู้ใช้เป้าหมาย → `not-found`; ผู้ใช้เป้าหมายเคยอนุมัติแล้ว/บทบาทไม่ถูกต้อง →
  `invalid-argument`

## Operation 12 — เปลี่ยนบทบาท (Role) ของผู้ใช้งานที่มีอยู่

รองรับ [[backlog#สูง (MVP)|FR-12]] — **ใหม่จากฟีเจอร์ที่ 7**

- **ผู้เรียกได้/บทบาท:** Admin เท่านั้น
- **Input:**
  - รหัสผู้ใช้เป้าหมาย (User.id) — จำเป็น
  - บทบาทใหม่ (ค่าที่กำหนดไว้ล่วงหน้า: "แพทย์", "พยาบาล" หรือ "admin") — จำเป็น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** ยืนยันผลลัพธ์ พร้อมข้อมูล User ที่อัปเดตแล้ว (id, บทบาทใหม่)
- **กฎทางธุรกิจ:**
  - **ห้าม Admin เปลี่ยนบทบาทของตนเองโดยเด็ดขาด** (รหัสผู้ใช้เป้าหมาย ≠ รหัสผู้ใช้ของผู้เรียกเสมอ) —
    ป้องกันกรณีไม่มี Admin ที่ใช้งานได้เหลือในระบบ (ยืนยันโดยผู้ใช้ผ่าน `NEEDS_USER_INPUT` — ถ้าเป็น
    Admin เพียงคนเดียวและต้องการเปลี่ยนบทบาทตนเอง ต้องให้ Admin คนอื่นดำเนินการแทน หรือใช้ Firebase
    Console/Firestore โดยตรง)
  - ผู้ใช้เป้าหมายต้องเคยถูกอนุมัติแล้ว (มี `บทบาท` อยู่ก่อน) มิฉะนั้นให้ใช้ Operation 11 แทน
  - เปลี่ยน `บทบาท` เป็นค่าใหม่ที่ระบุ ไม่กระทบ `สถานะการใช้งานบัญชี`
- **กรณี error:**
  - ผู้เรียกไม่ใช่ Admin หรือบัญชีถูกระงับ → ปฏิเสธการเข้าถึง (NFR-02)
  - รหัสผู้ใช้เป้าหมายเท่ากับรหัสผู้ใช้ของผู้เรียกเอง (พยายามเปลี่ยนบทบาทตนเอง) → ปฏิเสธการดำเนินการ
    (ป้องกัน lockout)
  - ไม่พบผู้ใช้เป้าหมาย หรือผู้ใช้เป้าหมายยังไม่เคยถูกอนุมัติ (ไม่มี `บทบาท`) → แจ้งว่าไม่พบผู้ใช้งาน/
    ให้ใช้ Operation 11 แทน
  - บทบาทใหม่ไม่ใช่ค่าที่กำหนดไว้ล่วงหน้า → แจ้งว่า input ไม่ถูกต้อง
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-12]], [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `changeUserRole`** — ตรวจสอบ `request.auth.uid !== targetUserId` ก่อนเสมอ (ป้องกัน lockout) แล้ว
  เขียน `users/{uid}.role` ผ่าน Firebase Admin SDK เท่านั้น — **Error code:** ปฏิเสธการเข้าถึง →
  `permission-denied`; พยายามเปลี่ยนบทบาทตนเอง → `functions.https.HttpsError('permission-denied', 'cannot-modify-self')`;
  ไม่พบผู้ใช้เป้าหมาย/ยังไม่เคยอนุมัติ → `not-found`; บทบาทไม่ถูกต้อง → `invalid-argument`

## Operation 13 — ระงับ/เปิดใช้งานบัญชีผู้ใช้งาน

รองรับ [[backlog#สูง (MVP)|FR-13]] — **ใหม่จากฟีเจอร์ที่ 7**

- **ผู้เรียกได้/บทบาท:** Admin เท่านั้น
- **Input:**
  - รหัสผู้ใช้เป้าหมาย (User.id) — จำเป็น
  - สถานะการใช้งานบัญชีใหม่ (จริง/เท็จ) — จำเป็น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** ยืนยันผลลัพธ์ พร้อมข้อมูล User ที่อัปเดตแล้ว (id, สถานะการใช้งานบัญชีใหม่)
- **กฎทางธุรกิจ:**
  - **ห้าม Admin ระงับ/เปิดใช้งานบัญชีของตนเองโดยเด็ดขาด** (รหัสผู้ใช้เป้าหมาย ≠ รหัสผู้ใช้ของผู้เรียก
    เสมอ) — เหตุผลเดียวกับ Operation 12 (ป้องกัน lockout — ยืนยันโดยผู้ใช้)
  - เปลี่ยน `สถานะการใช้งานบัญชี` เป็นค่าใหม่ที่ระบุทันที — ผู้ใช้งานที่ถูกระงับ (`isActive = false`)
    ต้องไม่สามารถเข้าถึงข้อมูลผู้ป่วยใดๆ ได้ทันทีในคำขอถัดไป (บังคับใช้ที่ Operation ร่วม Access Control
    ซึ่งอ่าน `isActive` จาก `users/{uid}` ทุกครั้งอยู่แล้ว ไม่ต้องมีกลไกเพิ่มเติม — ดูข้อจำกัดเรื่อง
    Firebase ID token ที่ยังไม่หมดอายุใน [[architecture#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน
    architecture]] เกี่ยวกับ NFR-12)
- **กรณี error:**
  - ผู้เรียกไม่ใช่ Admin หรือบัญชีถูกระงับ → ปฏิเสธการเข้าถึง (NFR-02)
  - รหัสผู้ใช้เป้าหมายเท่ากับรหัสผู้ใช้ของผู้เรียกเอง (พยายามระงับ/เปิดใช้งานบัญชีตนเอง) → ปฏิเสธการ
    ดำเนินการ (ป้องกัน lockout)
  - ไม่พบผู้ใช้เป้าหมาย → แจ้งว่าไม่พบผู้ใช้งาน
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-13]], [[backlog#Non-Functional Requirements|NFR-02]],
  [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `setUserActiveStatus`** — ตรวจสอบ `request.auth.uid !== targetUserId` ก่อนเสมอ (ป้องกัน
  lockout) แล้วเขียน `users/{uid}.isActive` ผ่าน Firebase Admin SDK เท่านั้น — **Error code:** ปฏิเสธ
  การเข้าถึง → `permission-denied`; พยายามระงับ/เปิดใช้งานตนเอง →
  `functions.https.HttpsError('permission-denied', 'cannot-modify-self')`; ไม่พบผู้ใช้เป้าหมาย →
  `not-found`

## Operation 14, 15 — ยกเลิกแล้ว (2026-09-25)

**Operation 14 (จัดการการมอบหมายผู้ป่วย — `manageAssignedPatient`) และ Operation 15 (ค้นหา/แสดง
รายชื่อผู้ป่วยทั้งหมดในระบบสำหรับ Admin — `listAllPatientsForAdmin`) ถูกลบออกจากเอกสารนี้ทั้งหมด**
สอดคล้องกับ [[architecture]] ที่ยกเลิกกลไก PatientAssignment ทั้งระบบตั้งแต่ 2026-09-25:

- **Operation 14:** FR-14 (จัดการการมอบหมายผู้ป่วยโดย Admin) ถูกยกเลิกทั้งหมด — ไม่มีกลไก
  PatientAssignment ให้จัดการอีกต่อไป
- **Operation 15:** รวมเข้ากับ [[#Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วยทั้งหมดในระบบ (ค้นหาเฉพาะรายด้วยเลข HN)|Operation 0]]
  แล้ว เพราะ Admin ไม่ใช่ "ข้อยกเว้น" ของ Access Control อีกต่อไป — ใช้ operation เดียวกับแพทย์/พยาบาล
  ทุกประการ (Client อ่าน `patients` โดยตรงผ่าน Security Rules)

หมายเลข operation 14/15 จึงว่างเปล่าโดยเจตนา (ไม่ recycle เพื่อรักษาการอ้างอิงประวัติศาสตร์ในเอกสาร
อื่นที่อาจยังอ้างถึงหมายเลขเดิม)

## Operation 16 — ยืนยัน/แก้ไขผลการประเมินความเสี่ยงโรคแทรกซ้อน (Override Risk Assessment)

รองรับ [[backlog#สูง (MVP)|FR-16]] — **ใหม่จาก
[[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)|FR-16]]**
(เพิ่มเข้าไปในฟีเจอร์ที่ 2 เดิม) ต่อจากที่ Client แสดงผล Operation 3 แล้วเสมอ (ดู
[[architecture#Data Flow Diagram — Journey หลัก|sequence diagram ของ architecture]]) — **ไม่ใช่สิทธิ์
ของ Admin**

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD เท่านั้น (เฉพาะผู้ป่วยที่อยู่ในความดูแลของตนตาม
  NFR-02 — **ไม่รวม Admin**)
- **Input:**
  - รหัสการประเมิน (ComplicationRiskAssessment.id) — จำเป็น
  - การดำเนินการ ("ยืนยันผลเดิม" หรือ "แก้ไข") — จำเป็น
  - ผลที่แก้ไข (พบความเสี่ยงหรือไม่ — จริง/เท็จ) — จำเป็นเมื่อการดำเนินการเป็น "แก้ไข", ไม่ใช้เมื่อเป็น
    "ยืนยันผลเดิม"
  - เหตุผล — **จำเป็นเมื่อการดำเนินการเป็น "แก้ไข"**, ไม่บังคับเมื่อเป็น "ยืนยันผลเดิม"
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** ComplicationRiskAssessment ที่อัปเดตแล้ว (สถานะการยืนยัน/แก้ไข, พบความเสี่ยงหรือไม่
  (หลังยืนยัน/แก้ไข), ผู้ยืนยัน/แก้ไข, วันที่-เวลาที่ยืนยัน/แก้ไข, เหตุผล — ดู
  [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|ComplicationRiskAssessment ใน db-spec]])
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ระดับบทบาทก่อนเสมอ (NFR-02) — ไม่มีการตรวจสอบระดับ
    รายผู้ป่วยอีกต่อไป (แก้ไข 2026-09-25 ยกเลิกกลไก PatientAssignment ทั้งหมด — ผู้ป่วยรายใดก็ได้ใน
    ระบบ) — **ปฏิเสธเสมอถ้าผู้เรียกมี `role = "admin"`** (ไม่ใช่สิทธิ์ของ Admin แม้จะอ่านข้อมูลผู้ป่วย
    ทุกรายได้ผ่าน Operation 1/2/3 ก็ตาม)
  - **ค่า `พบความเสี่ยงหรือไม่` ที่ระบบประเมินอัตโนมัติ (attribute เดิม) ต้องไม่ถูกเขียนทับเด็ดขาด** —
    เขียนผลยืนยัน/แก้ไขลง attribute ใหม่ (`พบความเสี่ยงหรือไม่ (หลังยืนยัน/แก้ไข)`) เท่านั้น (ยืนยันโดย
    ผู้ใช้ผ่าน `NEEDS_USER_INPUT` — mutate in place แต่คงค่าอัตโนมัติดั้งเดิมไว้เพื่อ traceability ตาม
    NFR-06)
  - กรณี "ยืนยันผลเดิม": ตั้ง `สถานะการยืนยัน/แก้ไข = "ยืนยันผลเดิม"` และ
    `พบความเสี่ยงหรือไม่ (หลังยืนยัน/แก้ไข) = พบความเสี่ยงหรือไม่` (ค่าเดียวกับผลอัตโนมัติ) โดยไม่ต้อง
    มีเหตุผล
  - กรณี "แก้ไข": ตั้ง `สถานะการยืนยัน/แก้ไข = "แก้ไขแล้ว"`, บันทึกผลใหม่ที่ระบุลง
    `พบความเสี่ยงหรือไม่ (หลังยืนยัน/แก้ไข)` และ**บังคับต้องมีเหตุผล**เสมอ
  - บันทึก `ผู้ยืนยัน/แก้ไขผลการประเมิน` และ `วันที่-เวลาที่ยืนยัน/แก้ไข` เสมอไม่ว่ากรณีใด
  - ต้องเรียก "บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)" ก่อนดำเนินการเขียนผลจริงเสมอ
    (การดำเนินการ = "แก้ไขข้อมูลตามคำขอสิทธิ" ไม่เข้าเงื่อนไข — ใช้ค่า "ดูข้อมูลผู้ป่วย" ร่วมกับที่บันทึก
    ไปแล้วตอนเรียก Operation 3 ก่อนหน้า หรือบันทึกรายการใหม่ระบุ `การดำเนินการ` ที่สื่อถึงการยืนยัน/
    แก้ไข — รายละเอียด enum ค่าที่แน่นอนกำหนดต่อใน `detailed-design/`) (NFR-06)
  - เรียกได้เฉพาะเมื่อ `สถานะการยืนยัน/แก้ไข` ปัจจุบันเป็น "ยังไม่ดำเนินการ" เท่านั้น (ยืนยัน/แก้ไขได้
    เพียงครั้งเดียวต่อการประเมินหนึ่งครั้ง — ถ้าต้องการแก้ไขซ้ำ ต้องรอผลการประเมินรอบถัดไปจาก Operation 3
    เพราะ mutate in place ไม่รองรับประวัติหลายครั้งต่อการประเมินเดียวกัน — ดู "ประเด็นรอตัดสินใจ" ท้าย
    เอกสาร)
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง/บัญชีถูกระงับ หรือผู้เรียกเป็น Admin) → ปฏิเสธการเข้าถึง
    (NFR-02, FR-16)
  - ไม่พบ ComplicationRiskAssessment ตามรหัสที่ระบุ → แจ้งว่าไม่พบข้อมูล
  - การดำเนินการเป็น "แก้ไข" แต่ไม่ระบุเหตุผล หรือไม่ระบุผลที่แก้ไข → แจ้งว่า input ไม่ถูกต้อง
  - `สถานะการยืนยัน/แก้ไข` ปัจจุบันไม่ใช่ "ยังไม่ดำเนินการ" (เคยยืนยัน/แก้ไขไปแล้ว) → แจ้งว่าดำเนินการ
    ซ้ำไม่ได้ (`failed-precondition`)
  - บันทึก Audit Logging ไม่สำเร็จ → ยกเลิกการดำเนินการทั้งหมด (fail-safe)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-16]], [[backlog#Non-Functional Requirements|NFR-02]],
  [[backlog#Non-Functional Requirements|NFR-06]],
  [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|ComplicationRiskAssessment]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `confirmOrOverrideRiskAssessment`** — อ่าน `complicationRiskAssessments/{assessmentId}` แล้ว
  เขียน field `overrideStatus`/`overriddenHasRisk`/`overriddenByUserId`/`overriddenAt`/
  `overrideReason` ผ่าน Firebase Admin SDK เท่านั้น หลังผ่าน Access Control + Audit Logging (internal)
  แล้วเท่านั้น — **ไม่แก้ไข field `hasRisk` เดิมเด็ดขาด** — **Error code:** ปฏิเสธการเข้าถึง →
  `permission-denied`; ไม่พบการประเมิน → `not-found`; input ไม่ถูกต้อง (ขาดเหตุผล/ผลที่แก้ไข) →
  `invalid-argument`; ดำเนินการซ้ำ (`overrideStatus` ไม่ใช่ "ยังไม่ดำเนินการ") →
  `functions.https.HttpsError('failed-precondition', 'already-confirmed-or-overridden')`;
  บันทึก Audit Log ไม่สำเร็จ → `internal`

## กรณี Error ทั่วไปที่ใช้ร่วมกันทุก Operation

| กรณี | อธิบาย | Error code จริง (Cloud Functions Callable — Operation 1-6 เท่านั้น) | อ้างอิง |
| --- | --- | --- | --- |
| ปฏิเสธการเข้าถึง | ผู้ใช้ไม่ผ่านการตรวจสิทธิ์ตาม Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ไม่ว่าจะเป็นระดับบทบาท ขอบเขตวัตถุประสงค์ (purpose limitation) หรือ `email_verified` เป็นเท็จ — **แก้ไข 2026-09-25: ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไป (ยกเลิก PatientAssignment ทั้งหมด)** | `permission-denied` (หรือ `unauthenticated` ถ้าไม่มี auth token เลย); สำหรับ Operation 0 คือ Firestore Security Rules ปฏิเสธ query/read โดยตรง (`permission-denied` จาก Firestore SDK ไม่ใช่ HttpsError) | [[backlog#Non-Functional Requirements\|NFR-02]], [[backlog#สูง (MVP)\|FR-05]], [[backlog#Non-Functional Requirements\|NFR-03]], [[backlog#สูง (MVP)\|FR-09]] |
| ไม่พบผู้ป่วย | รหัสผู้ป่วยที่ระบุไม่มีอยู่ในระบบ | `not-found` | [[db-spec#ผู้ป่วย (Patient)\|Patient]] |
| HN ไม่ครบ 7 หลัก | เฉพาะ Operation 0: เลข HN ที่กรอกไม่ครบรูปแบบตัวเลขล้วน 7 หลัก **ตรวจสอบทั้งตอนหยุดพิมพ์ (debounce) และตอนกดค้นหา** (แก้ไข 2026-09-26 — แทนที่ข้อความเดิมที่ระบุว่าเฉพาะหลังกดค้นหาเท่านั้น) ต้องแจ้งเตือนและให้กรอกค้นหาใหม่ได้ทันที | ไม่มี (ตรวจสอบในโค้ด Client ก่อนยิง Firestore query — ไม่ใช่ Cloud Function ดู Technical Binding ของ Operation 0) | [[backlog#สูง (MVP)\|FR-06]] |
| ค้นหาด้วย HN ไม่พบผู้ป่วย | เฉพาะ Operation 0: เลข HN ครบ 7 หลักแล้วแต่ไม่พบผู้ป่วยที่ตรงกันในระบบ **ตรวจสอบทั้งตอนหยุดพิมพ์ (debounce) และตอนกดค้นหา** (แก้ไข 2026-09-26) ต้องแจ้งเตือนและให้กรอกค้นหาใหม่ได้ทันที | ไม่มี (Firestore query คืนผลลัพธ์ว่างตามปกติ — Client ตีความเป็นข้อความแจ้งเตือน ไม่ใช่ error จาก server) | [[backlog#สูง (MVP)\|FR-06]] |
| บริการ AI ภายนอกล้มเหลว/timeout | เฉพาะ Operation 17: Firebase AI Logic/Gemini Developer API ไม่ตอบสนองหรือคืน error (เช่น model deprecation) — **ไม่บล็อก**ผลการค้นหาปกติจาก Operation 0 | ไม่มี (ไม่ใช่ Cloud Function — จับ error ที่โค้ด Client แล้วไม่แสดงคำอธิบายเพิ่มเติมเงียบๆ) | [[backlog#กลาง\|FR-17]] |
| Input ไม่ถูกต้อง | รูปแบบ/ค่าของ input ที่ส่งมาไม่ตรงตามที่ operation กำหนด (เช่น ช่วงเวลาไม่ถูกต้อง, ประเภทคำขอสิทธิไม่ถูกต้อง) | `invalid-argument` | — |
| บันทึก Audit Log ไม่สำเร็จ | Backend Service บันทึกร่องรอยการเข้าถึงข้อมูลไม่สำเร็จ จึงยกเลิกการดำเนินการที่เรียกใช้ทั้งหมด (fail-safe) | `internal` | [[backlog#Non-Functional Requirements\|NFR-06]] |
| อีเมล/รหัสผ่านไม่ถูกต้อง (เข้าสู่ระบบ) | เฉพาะ Operation 7: ปฏิเสธการเข้าสู่ระบบด้วยข้อความรวมเดียวกันเสมอ ไม่แยกแยะว่าอีเมลหรือรหัสผ่านผิด | ไม่มี error code แบบ Callable Function (Firebase Authentication SDK คืน error code ของตนเอง — Client ต้องแปลงเป็นข้อความรวมเสมอ) | [[backlog#สูง (MVP)\|FR-07]], [[backlog#Non-Functional Requirements\|NFR-18]] |
| รหัสผ่านไม่ผ่านนโยบายขั้นต่ำ | เฉพาะ Operation 8, 9: รหัสผ่านที่กรอกไม่ผ่านเงื่อนไข ≥ 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข — **ไม่ใช่กรณีที่ต้อง generic** เพราะไม่เกี่ยวกับการเปิดเผยว่าอีเมลมีบัญชีอยู่หรือไม่ | `invalid-argument` (`weak-password`) | [[backlog#Non-Functional Requirements\|NFR-17]] |
| ผลลัพธ์ generic เมื่ออีเมลซ้ำ/ไม่พบบัญชี | เฉพาะ Operation 8 (สมัครด้วยอีเมลซ้ำ), Operation 9 (รีเซ็ตด้วยอีเมลที่ไม่มีในระบบ): **ต้องคืนข้อความ/response สำเร็จแบบเดียวกับกรณีปกติเสมอ ห้ามคืน error ที่แยกแยะได้ทั้งเนื้อหาและ error code** | ไม่มี — คืนผลลัพธ์สำเร็จแบบเดียวกันเสมอ (ไม่ใช่ error) | [[backlog#Non-Functional Requirements\|NFR-18]] |
| ผู้เรียกไม่ใช่ Admin | เฉพาะ Operation 10-13 (Operation 14/15 ยกเลิกแล้ว): ผู้เรียกไม่มี `role = "admin"` หรือบัญชีถูกระงับ | `permission-denied` | [[backlog#สูง (MVP)\|FR-11]]–[[backlog#สูง (MVP)\|FR-13]], [[backlog#Non-Functional Requirements\|NFR-02]] |
| พยายามแก้ไขบัญชีตนเอง (ป้องกัน lockout) | เฉพาะ Operation 12, 13: Admin ระบุรหัสผู้ใช้เป้าหมายเป็นของตนเอง — **ยืนยันโดยผู้ใช้ว่าห้ามเด็ดขาด** | `functions.https.HttpsError('permission-denied', 'cannot-modify-self')` | — |
| Admin เรียก operation ที่ไม่ใช่สิทธิ์ของตน | เฉพาะ Operation 16 (FR-16) หรือ operation ที่แก้ไขข้อมูลทางคลินิก: ผู้เรียกมี `role = "admin"` | `permission-denied` | [[backlog#สูง (MVP)\|FR-16]], [[backlog#Non-Functional Requirements\|NFR-19]] |
| ยืนยัน/แก้ไขผลประเมินความเสี่ยงซ้ำ | เฉพาะ Operation 16: `สถานะการยืนยัน/แก้ไข` ของ ComplicationRiskAssessment ที่ระบุไม่ใช่ "ยังไม่ดำเนินการ" | `functions.https.HttpsError('failed-precondition', 'already-confirmed-or-overridden')` | [[backlog#สูง (MVP)\|FR-16]] |

## ประเด็นรอตัดสินใจ

**Operation 17 (FR-17/NFR-21 — AI ช่วยอธิบายผลการค้นหาด้วย HN) — ปิดกลไกทางเทคนิคแล้วในรอบ 2026-09-26:**
`[[technology-stack]]` decision area 20-22 ตัดสินใจกลไกจริงครบแล้ว (Firebase AI Logic/Gemini Developer
API เรียกตรงจาก Client, App Check reCAPTCHA v3/Debug Provider, constant ชื่อโมเดลจุดเดียว) รายการที่
**ยังคงเป็นความเสี่ยงที่ต้องบันทึกไว้ต่อ** (ไม่ใช่ "ยังไม่ตัดสินใจ" — ผู้ใช้รับทราบและยืนยันให้ดำเนินการ
ต่อแล้วในรอบ MVP นี้ ดูรายละเอียดเต็มที่ [[architecture#บริการ AI ภายนอก (External AI Service)|architecture]]):

- **NFR-21 บังคับได้เฉพาะฝั่ง Client เท่านั้น** — ไม่มี Cloud Function ตัวกลางคอยตรวจสอบ/กรอง prompt
  ก่อนส่งไปยัง Gemini Developer API จริง เพราะโปรเจกต์ยังไม่อยู่แพ็กเกจ Blaze
- **ไม่มี audit log ฝั่งเซิร์ฟเวอร์ของการเรียก Operation 17 เลยในรอบนี้** — ต่างจาก Operation 1-6 ที่มี
  audit log แบบ fail-safe ตาม NFR-06
- **ความเสี่ยงเรื่องโมเดล AI ถูกปิดให้บริการกะทันหัน** — เกิดขึ้นจริงแล้วครั้งหนึ่งเมื่อ 2026-09-26
  (`gemini-2.5-flash-lite` ถูกปิดเร็วกว่าประกาศ) แก้ไขด้วยการกำหนดชื่อโมเดลเป็น constant จุดเดียวใน
  `web/src/ai/config.ts` (decision area 22) ทำให้แก้ไขได้เร็ว แต่ยังไม่มี monitoring อัตโนมัติจับ
  HTTP 404/model deprecation ในอนาคต

**ฟีเจอร์ที่ 7 (Admin) และ FR-16 — ปิดแล้วในรอบ sync ที่หก (2026-09-24):** สองจุดที่เคยเป็นประเด็นรอ
ตัดสินใจ (โครงสร้างข้อมูล FR-16, โครงสร้าง audit log NFR-20) ได้รับคำตอบยืนยันจากผู้ใช้แล้วผ่าน
`NEEDS_USER_INPUT` และถูกนำไปออกแบบครบแล้ว — **จุดที่สาม (การป้องกัน Admin ล็อกตัวเองออกจากสิทธิ์
Admin ผ่าน Operation 12/13) ยังคงใช้ได้ตามเดิม** รายการที่**ยังไม่ตัดสินใจจริง**ในส่วนนี้:

- **จำนวน/การแบ่ง Cloud Function สำหรับ Operation 10-13 และ 16** (Operation 14/15 ถูกลบแล้วตั้งแต่
  2026-09-25) — เอกสารนี้ออกแบบให้แยกเป็น 5 callable function ตาม operation (`listUserAccounts`,
  `approveUserAccount`, `changeUserRole`, `setUserActiveStatus`, `confirmOrOverrideRiskAssessment`)
  เพื่อความชัดเจนของ error code/permission ต่อ operation แยกกัน (สอดคล้องกับรูปแบบเดิมของเอกสารนี้ที่
  แยก Cloud Function ตาม FR) — แต่ยังไม่มี decision area ใน `[[technology-stack]]` ยืนยันจำนวนที่แน่นอน
  อาจรวมเป็นฟังก์ชันเดียวได้ในทางเทคนิคถ้าทีมพัฒนาต้องการลดจำนวน deployment unit — แนะนำให้รัน
  `/build-tech-stack` เพื่อยืนยัน
- **การรองรับการยืนยัน/แก้ไขผลประเมินความเสี่ยง (FR-16) ซ้ำหลายครั้งต่อการประเมินเดียวกัน** — เนื่องจาก
  ออกแบบเป็น mutate in place (attribute เดียวต่อการประเมินหนึ่งครั้ง ไม่ใช่ entity ประวัติแยก) Operation
  16 จึงอนุญาตให้ยืนยัน/แก้ไขได้เพียง**ครั้งเดียว**ต่อ ComplicationRiskAssessment หนึ่งรายการ (เรียกซ้ำ
  จะได้ `failed-precondition`) — ถ้าในอนาคตต้องการให้แพทย์/พยาบาลแก้ไขซ้ำได้หลายครั้ง (เช่น เปลี่ยนใจ
  หลังยืนยันไปแล้ว) ต้องยืนยันความต้องการนี้กับผู้ใช้ก่อน แล้วอาจต้องออกแบบใหม่เป็น entity ประวัติแยก
  (ทางเลือกที่ผู้ใช้ไม่ได้เลือกในรอบนี้)
- **บทบาทที่ควรเรียก Operation 5 (สืบค้น audit trail) ได้ — ควรเพิ่ม Admin หรือไม่** — ปัจจุบัน
  Operation 5 ยังคงจำกัดเฉพาะแพทย์/พยาบาลเช่นเดิม (ไม่เปลี่ยนแปลงในรอบนี้) แม้ Admin จะมีเหตุผลที่
  เกี่ยวข้อง (ตรวจสอบการเข้าถึงข้อมูลผู้ป่วยของแพทย์/พยาบาลรวมถึงของ Admin เอง) — spec Admin
  ([[20260924-01-admin-role-account-management]]) ไม่ได้ระบุสิทธิ์นี้ให้ Admin ชัดเจน จึงไม่เพิ่มให้เอง
  ควรยืนยันกับผู้ใช้ในรอบถัดไปถ้าต้องการ
- **enum ค่า "การดำเนินการ" (action) ของ AuditLogRecord ที่ Operation 16 ใช้บันทึก** — ยังไม่ได้กำหนด
  ค่าใหม่ชัดเจนสำหรับ "ยืนยัน/แก้ไขผลประเมินความเสี่ยง" แยกจาก "ดูข้อมูลผู้ป่วย" เดิม — กำหนดรายละเอียด
  ต่อใน `detailed-design/`

`[[technology-stack]]` มีเนื้อหาแล้วและตัดสินใจประเด็นส่วนใหญ่ที่เคยค้างไว้ในหัวข้อนี้ไปแล้ว (กลไก
การสื่อสารจริง — Firestore direct read สำหรับ Operation 0 + Cloud Functions Callable/scheduled
สำหรับ Operation 1-6, กลไก authentication/authorization พื้นฐาน — **Firebase Authentication โดยไม่ใช้
Custom Claims เก็บบทบาท/isActive** (แก้ไข 2026-09-24 — Firestore `users/{uid}` เป็น source of truth
เดียว), กลไกเข้ารหัสพื้นฐาน, กลไก automation ของ Operation 6, กลไกเฉพาะของฟีเจอร์ที่ 6 ทั้งหมด —
password policy, account enumeration prevention, เทมเพลตอีเมล, การสร้าง `users/{uid}`, การตรวจสอบ
`email_verified` ซ้ำ) — รายการเหล่านี้ถูกนำไประบุไว้ในเอกสารนี้แล้วตามขั้นตอน 5.7 (ดูหัวข้อ "Technical
Binding" ของแต่ละ operation ด้านบน) รายการที่ **ยังไม่ตัดสินใจจริง** มีดังนี้:

- ค่า threshold ตัวเลขจริงที่ operation 3 ใช้เปรียบเทียบยังไม่ถูกกำหนด (ดู
  [[db-spec#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน db-spec]])
- **Customer-Managed Encryption Keys (CMEK)/field-level encryption เพิ่มเติมสำหรับ NFR-04** — กลไก
  พื้นฐาน (Google-managed keys + TLS) ถูกตัดสินใจแล้วสำหรับ MVP แต่ควรทบทวนก่อนใช้ข้อมูลผู้ป่วยจริง
  (ดู [[technology-stack#8. กลไกเข้ารหัสข้อมูล (NFR-04) และการบริหารกุญแจเข้ารหัส|decision area 8
  ใน technology-stack]])
- ค่าระยะเวลาเก็บรักษาจริง (RetentionPolicy) ที่ Operation 6 ใช้บังคับ — กลไก automation (Cloud
  Functions scheduled function ผ่าน Cloud Scheduler) ถูกตัดสินใจแล้ว แต่ค่าจำนวนวันจริงยังรอยืนยัน
  จากหน่วยงาน/ฝ่ายกฎหมาย (ดู [[db-spec#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน db-spec]])
- กระบวนการยืนยันตัวตนผู้ยื่นคำขอสิทธิของเจ้าของข้อมูลก่อนเรียก Operation 4 (NFR-07) ยังไม่ถูกยืนยันจาก
  ผู้ใช้ (ดู [[architecture#ประเด็นรอตัดสินใจอื่น (ไม่เกี่ยวกับ technology stack)|ประเด็นรอตัดสินใจอื่นใน architecture]])
- บทบาทที่ควรเรียก Operation 5 (สืบค้น audit trail) ได้ — ปัจจุบันออกแบบให้ใช้บทบาทเดียวกับที่เข้าถึง
  ข้อมูลผู้ป่วยได้ (แพทย์/พยาบาล) เพราะ spec ต้นทางไม่ได้แยกบทบาทใหม่สำหรับงานนี้ (ดู
  [[20260921-01-pdpa-data-protection-compliance#บทบาทที่เกี่ยวข้อง|หัวข้อบทบาทที่เกี่ยวข้องของ spec PDPA]])
  ควรให้ผู้ใช้ยืนยันว่าจำเป็นต้องจำกัดเฉพาะบทบาทเพิ่มเติม (เช่น ผู้ดูแลระบบ/DPO) หรือไม่
- ฐานทางกฎหมาย (lawful basis) ที่ชัดเจนของ purpose limitation (NFR-03) ที่ operation ร่วม "ตรวจสอบ
  สิทธิ์การเข้าถึงข้อมูลผู้ป่วย" บังคับใช้ ยังไม่ถูกยืนยันจากฝ่ายกฎหมาย/DPO (ดู
  [[architecture#ประเด็นรอตัดสินใจอื่น (ไม่เกี่ยวกับ technology stack)|ประเด็นรอตัดสินใจอื่นใน architecture]])
- **ขั้นตอนถัดไปสำหรับ Performance (NFR-09) หากพบว่ายังไม่พอ — In-memory caching / Managed caching
  layer** — composite index ต่อ operation ถูกระบุไว้แล้วใน Technical Binding ของแต่ละ operation
  (อ้างอิง [[db-spec]]) และ
  [[technology-stack#9. กลไกรองรับ Performance < 2 วินาที (NFR-09) — Firestore Composite Index เท่านั้น (ไม่มี caching layer เพิ่มเติม)|decision area 9 ใน technology-stack]]
  ตัดสินใจใช้ composite index เท่านั้นโดยเจตนาสำหรับรอบนี้ (**ไม่ใช่ยังไม่ตัดสินใจ**) — แต่ถ้าผลทดสอบ
  performance จริง (ดู [[test-plan]]) พบว่าไม่สามารถทำ < 2 วินาทีได้อย่างสม่ำเสมอ ขั้นตอนถัดไปที่ควร
  พิจารณาคือ in-memory caching ใน Cloud Functions สำหรับข้อมูลอ้างอิงคงที่ (เช่น
  `ComplicationRiskThreshold`) ก่อนพิจารณา managed caching layer แยก (Memorystore/Redis) (ดู
  [[architecture#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน architecture]])
- **กลไกฝั่งเซิร์ฟเวอร์เพื่อบังคับใช้ Session Timeout ซ้ำ (NFR-12)** — เช่นเดียวกับที่ระบุใน
  [[architecture#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน architecture]]: Client ตรวจจับ inactivity เอง
  เป็นกลไกหลักที่ตัดสินใจแล้ว ส่วนกลไกเพิกถอน token ฝั่งเซิร์ฟเวอร์เพิ่มเติม (เช่น revoke ทันทีที่ idle
  เกิน 30 นาที) ยังไม่ถูกตัดสินใจ — หากมีการตัดสินใจในอนาคต อาจต้องเพิ่ม operation ใหม่ (เช่น
  "เพิกถอน session") ในเอกสารนี้
- **ฟีเจอร์ที่ 6 (Authentication) — ปิดแล้วในรอบ 2026-09-24 (เดิมเป็นประเด็นรอตัดสินใจ):**
  `[[technology-stack]]` รอบสาม (decision area 13-19) ตัดสินใจกลไกจริงที่เคยค้างไว้ทั้งหมดแล้ว และ
  เอกสารนี้ปรับปรุง Technical Binding ของ Operation 7-9 และ Operation ร่วม Access Control ให้ตรงกัน
  ครบแล้ว (ดูหัวข้อที่เกี่ยวข้องด้านบน) รายการที่ยังคง**เป็นความเสี่ยงที่ต้องบันทึกไว้ต่อ** (ไม่ใช่
  "ยังไม่ตัดสินใจ" — ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้วในรอบ MVP นี้):
  - **Timing side-channel ของ NFR-18** — เปิดเฉพาะ Firebase "Email Enumeration Protection" โดยเจตนา
    ไม่เพิ่ม fixed minimum delay (decision area 14) — ควรเพิ่มก่อน production จริงกับข้อมูลผู้ป่วยจริง
  - **Auth Blocking Functions สำหรับ Operation 7** — ตัดสินใจไม่ใช้ในรอบนี้ (decision area 16) —
    Operation 7 จึงยังไม่มีจุดตรวจ `emailVerified`/`isActive` ที่ระดับการออก token (ปิดช่องว่างระดับ
    การเข้าถึงข้อมูลผู้ป่วยแล้วด้วย decision area 19 — ดู Operation ร่วม Access Control ด้านบน)
  - **การติดตาม billing/quota ของ Google Cloud Identity Platform** ที่ถูกอัปเกรดใช้บางส่วนสำหรับ
    password policy ของ Operation 9 (decision area 13) — ควรติดตามแยกจาก Firebase Authentication เปล่า
  - **Custom email service** แทน template เริ่มต้นของ Firebase (decision area 15) — ควรทบทวนก่อน
    production จริงเพื่อความน่าเชื่อถือของอีเมลที่ส่งถึงแพทย์/พยาบาล

## เอกสารที่เกี่ยวข้อง

- [[db-spec]]
- [[architecture]]
- [[technology-stack]]
- [[feature-list]]
- [[user-journey]]
- [[backlog]]
- [[20260917-01-patient-ncd-history-lab-complication-risk]]
- [[20260921-01-pdpa-data-protection-compliance]]
- [[20260922-01-operational-quality-nfr]]
- [[20260923-01-user-authentication-email-password]]
- [[20260924-01-admin-role-account-management]]
