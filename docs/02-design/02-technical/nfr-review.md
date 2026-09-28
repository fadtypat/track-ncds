# NFR Review

เอกสารนี้ตรวจสอบว่า NFR ทุกตัวใน [[backlog#Non-Functional Requirements|backlog]] ถูกออกแบบมารองรับ
จริงหรือไม่ในเอกสารเชิงเทคนิคทั้งหมด ได้แก่ [[architecture]], [[api-spec]], [[db-spec]], [[technology-stack]]
และไฟล์ทั้ง 6 ใน `detailed-design/` ([[patient-search-selection]], [[patient-ncd-diagnosis-lab-history]],
[[complication-risk-analysis-alert]], [[pdpa-data-protection-compliance]],
[[user-authentication-email-password]], [[admin-role-account-management]]) **เอกสารนี้เป็นผลการตรวจสอบ
เท่านั้น ไม่ใช่การออกแบบ** — ถ้าพบช่องว่าง ให้รัน skill ที่แนะนำในคอลัมน์สุดท้ายเพื่อแก้ไขเอกสารเชิงเทคนิค
ที่เกี่ยวข้อง ห้ามแก้ไข `architecture.md`/`api-spec.md`/`db-spec.md`/`technology-stack.md`/
`detailed-design/*` จากเอกสารนี้โดยตรง

อัปเดตล่าสุด: 2026-09-28 (ตรวจสอบรอบที่สิบเอ็ด — ประเมินผลกระทบของการ sync FR-18/Operation 18/entity
`Hba1cVisitSummary` เข้า [[architecture]], [[api-spec]], [[db-spec]] และ [[patient-search-selection]]
วันนี้ ต่อ **NFR-06, NFR-14, NFR-20, NFR-21** โดยเฉพาะ) อ่าน Operation 18 ทั้งฉบับใน [[api-spec]],
entity `Hba1cVisitSummary` + ตาราง Security Rules Verification (NFR-14) ใน [[db-spec]], ตาราง Mapping
NFR แถว NFR-06/NFR-20/NFR-21 ใน [[architecture]] และหัวข้อ Operation 18 ใน [[patient-search-selection]]
ทั้งหมดอย่างละเอียด ผลสรุปรอบนี้:

- ทั้ง 4 เอกสาร (architecture/api-spec/db-spec/patient-search-selection) **sync กันครบและสม่ำเสมอ** —
  ไม่มีข้อความขัดแย้งกันเรื่อง Operation 18 ระหว่างเอกสาร ทุกจุดยืนยันตรงกันว่า Operation 18 เป็น
  Client-direct read/write ทั้งหมด (อ่าน `labResults` ตรง + เขียน `hba1cVisitSummaries` ตรง) ไม่ผ่าน
  Cloud Function เลยแม้แต่ขั้นตอนเดียว — เป็นผลจากข้อจำกัด "โปรเจกต์ยังไม่อยู่แพ็กเกจ Blaze" เดียวกับที่
  ระบุใน `CLAUDE.md`
- **NFR-06 (Audit Log & Accountability) — ลดสถานะจาก "รองรับแล้ว" เป็น "รองรับบางส่วน (Partial)"**:
  ต่างจาก Operation 17 (ไม่แตะข้อมูลผู้ป่วยรายบุคคลเลย จึงไม่ต้องมี audit log ตามเจตนาเดิมของ
  architecture) Operation 18 **อ่านค่าผลตรวจ lab รายบุคคลของผู้ป่วยจริงโดยตรง** (แม้จะไม่ส่งค่าที่อ่านได้
  ไปให้ AI ก็ตาม) แต่**ไม่มีการบันทึก audit log ฝั่งเซิร์ฟเวอร์เลยแม้แต่รายการเดียว** — เป็นการเปิดช่องทาง
  ใหม่ที่เข้าถึงข้อมูลผู้ป่วยรายบุคคลโดยไม่ทิ้งร่องรอยใดๆ ทั้งที่ทุก operation อื่นที่แตะข้อมูลระดับผู้ป่วย
  รายบุคคล (Operation 1-6, 16) มี audit log แบบ fail-safe ครบทุกตัว นี่คือความล้มเหลวสมบูรณ์ของหลักการ
  NFR-06 สำหรับเส้นทางนี้เส้นทางเดียว ไม่ใช่แค่ความเสี่ยงคงเหลือบางส่วนแบบ NFR-12/NFR-18/NFR-21 (ที่ยังมี
  มาตรการหลักทำงานอยู่บางส่วน) แม้ [[api-spec]]/[[db-spec]]/[[architecture]] จะบันทึกช่องว่างนี้ไว้อย่าง
  ชัดเจนและมี target design (ย้ายเป็น Cloud Function `computeHba1cVisitSummary` เมื่ออยู่แพ็กเกจ Blaze)
  ก็ตาม — การบันทึกช่องว่างไว้ไม่ได้ทำให้ NFR-06 "รองรับแล้ว" สำหรับเส้นทางนี้
- **NFR-20 (Audit Log แบบ fail-safe ของ Admin) — ลดสถานะจาก "รองรับแล้ว" เป็น "รองรับบางส่วน (Partial)"**
  ด้วยเหตุผลเดียวกับ NFR-06: เมื่อ Admin กดปุ่ม Operation 18 ก็ไม่มี audit log ฝั่งเซิร์ฟเวอร์เช่นกัน (ไม่มี
  `isAdminAccess` ถูกบันทึกเลย เพราะไม่ผ่าน Cloud Function) — [[architecture]] และ [[db-spec]] ระบุไว้ตรง
  กันว่าเป็น "ข้อยกเว้นเดียวกับ NFR-06" อย่างชัดเจน แต่ยังคงเป็นช่องว่างจริงที่ต้องรายงาน ไม่ใช่ Addressed
- **NFR-14 (Security Rules Verification) — ลดสถานะจาก "รองรับแล้ว" เป็น "รองรับบางส่วน (Partial)"**:
  [[db-spec]] เพิ่มแถวใหม่สำหรับ `hba1cVisitSummaries` ในตาราง Security Rules Verification แล้วจริง
  แต่ระบุไว้เองว่า **"ยังไม่มี automated test เฉพาะสำหรับ collection นี้"** และกฎที่ใช้งานจริงในปัจจุบัน
  (`firestore.rules` ที่ root เปิดกว้างทั้งฐานข้อมูล) **ไม่ตรงกับกฎที่ตั้งใจออกแบบไว้แม้แต่ในช่วงเปลี่ยนผ่าน**
  (ตั้งใจไว้ว่าควรเป็น `allow read, write: if false` เหมือน `labResults` แต่ปัจจุบันเปิดกว้างเพราะกฎรวม
  ของทั้งโปรเจกต์) — คือมีทั้ง "รู้ว่าต้องทดสอบแต่ยังไม่ได้ทดสอบ" และ "รู้ว่ากฎควรเข้มงวดแต่ปัจจุบันหลวม
  กว่าที่ตั้งใจ" พร้อมกัน จึงไม่ถือว่า NFR-14 รองรับ `hba1cVisitSummaries` ได้อย่างสมบูรณ์
- **NFR-21 (Data Minimization for External AI Service) — คงสถานะ "รองรับแล้ว (Addressed — มีความเสี่ยง
  เชิงสถาปัตยกรรมที่ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว)"** เหมือนเดิม: ส่วนขยายที่ครอบคลุม FR-18
  (จำกัดข้อมูลที่ส่งให้ AI เหลือเฉพาะจำนวนครั้งตรวจ/ระยะห่างเป็นวันที่คำนวณแล้ว ห้ามส่ง HN/ชื่อ/วันที่จริง/
  ค่าผล HbA1c) สอดคล้องกันครบทั้ง [[architecture]]/[[api-spec]]/[[db-spec]]/[[patient-search-selection]]
  — ต่างจาก NFR-06/NFR-14/NFR-20 ตรงที่ **เจตนาหลักของ NFR-21 (ห้ามส่งข้อมูลระบุตัวตนให้ AI) ยังคงทำงานได้
  จริงที่ชั้น prompt construction** แม้ไม่มีชั้นตรวจสอบซ้ำฝั่งเซิร์ฟเวอร์ จึงยังคงถือเป็น Addressed พร้อม
  ความเสี่ยงที่บันทึกไว้ชัดเจน (รูปแบบเดียวกับการประเมิน NFR-21 เดิมสำหรับ Operation 17)
- **สรุปสิ่งที่แนะนำให้รันต่อ:** `sync-api-db` เพื่อ (1) เพิ่มกรณีทดสอบ automated test จริงสำหรับ
  `hba1cVisitSummaries` ใน [[db-spec]] ให้ตรงกับสถานะปัจจุบัน (เปิดกว้างชั่วคราว) อย่างน้อยเพื่อยืนยันว่า
  พฤติกรรมปัจจุบันเป็นไปตามที่ตั้งใจ (NFR-14) และ (2) พิจารณากับผู้ใช้ว่าจะยอมรับความเสี่ยง NFR-06/NFR-20
  ของ Operation 18 ต่อไปจนกว่าจะอัปเกรดเป็นแพ็กเกจ Blaze หรือควรบล็อกฟีเจอร์นี้ไว้ก่อน (เป็นการตัดสินใจ
  เชิงผลิตภัณฑ์/ความเสี่ยงที่อยู่นอกเหนือขอบเขตของ nfr-reviewer ให้รายงานกลับผู้ใช้โดยตรง)

ก่อนหน้านั้น ผลตรวจสอบรอบที่สิบ (2026-09-26) มีดังนี้ (คงไว้เพื่อ traceability):

อัปเดตรอบที่สิบ: ประเมินใหม่ **NFR-02, NFR-07, NFR-14, NFR-19, NFR-20**
หลังยกเลิกกลไก PatientAssignment ทั้งหมด (2026-09-25) และประเมินใหม่ **NFR-21** ซึ่งเป็น NFR ใหม่จาก
FR-17 (AI ช่วยอธิบายผลการค้นหาผู้ป่วยด้วย HN, เพิ่ม 2026-09-26) อ่าน [[architecture]], [[api-spec]]
(Operation 0–17), [[db-spec]], [[technology-stack]] และ `detailed-design/` ทั้ง 6 ไฟล์ใหม่ทั้งไฟล์
ผลสรุปรอบนี้:

- **NFR-02 (Access Control), NFR-07 (Data Subject Rights), NFR-14 (Security Rules Verification),
  NFR-19 (สิทธิ์ของ Admin — ไม่ใช่ "ข้อยกเว้น" อีกต่อไป) และ NFR-20 (Audit Log fail-safe ของ Admin) —
  คงสถานะ "รองรับแล้ว (Addressed)"** ทุกตัวหลังยกเลิกกลไก PatientAssignment: [[architecture]],
  [[api-spec]] และ [[db-spec]] ถูกแก้ไขให้สอดคล้องกันครบว่าแพทย์/พยาบาล/Admin เข้าถึงผู้ป่วยทุกรายในระบบ
  เหมือนกันแล้ว (เหลือเพียงการตรวจสอบระดับบทบาท/`isActive`/`email_verified`) ไม่มี entity/collection
  `PatientAssignment`/`patientAssignments` หลงเหลืออยู่ในทั้ง 3 เอกสาร และ `detailed-design/` ทั้ง 6
  ไฟล์ถูกแก้ไขให้ตรงกันครบ (ระบุชัดว่า "ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไป — ยกเลิก
  PatientAssignment 2026-09-25" ในทุกจุดที่เคยอ้างอิงกลไกเดิม) [[db-spec]] อัปเดตตาราง Security Rules
  Verification (NFR-14) แทนที่กรณีทดสอบเดิม "ไม่มี assignment/assignment บางส่วน" ด้วยกรณีทดสอบใหม่
  "บทบาทถูกต้องครบทุกค่า (`แพทย์`/`พยาบาล`/`admin`)" — ไม่มีการลบกรณีทดสอบโดยไม่มีสิ่งทดแทน ดูรายละเอียด
  ที่หัวข้อ NFR-02/NFR-07/NFR-14/NFR-19/NFR-20 ด้านล่าง
- **NFR-21 (ใหม่ — Data Minimization for External AI Service) — สถานะ "รองรับแล้ว (Addressed — มีความ
  เสี่ยงเชิงสถาปัตยกรรมที่ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว)"**: [[architecture]] (component ใหม่
  `AIService` + ตาราง Mapping NFR แถวใหม่ + หัวข้อ "บริการ AI ภายนอก"), [[api-spec]] (Operation 17 ใหม่
  ระบุ input จำกัดเฉพาะ 3 ค่า), [[db-spec]] (หัวข้อคุณสมบัติร่วมใหม่ "จำกัดข้อมูลที่ส่งให้บริการ AI
  ภายนอก") และ [[patient-search-selection]] (sequence diagram ขั้นตอน "จำกัดข้อมูล NFR-21" + edge case)
  สอดคล้องกันครบทุกจุด — ความเสี่ยงที่ NFR-21 บังคับได้เฉพาะฝั่ง Client เท่านั้น (ไม่มี Cloud Function
  ตัวกลางกรอง prompt ซ้ำ เพราะโปรเจกต์ยังไม่อยู่แพ็กเกจ Blaze) และไม่มี audit log ของการเรียก AI เลย ถูก
  บันทึกไว้อย่างเด่นชัดสอดคล้องกันทั้ง [[architecture]]/[[db-spec]]/[[api-spec]] ว่าผู้ใช้รับทราบและยืนยัน
  ให้ดำเนินการต่อแล้ว (รูปแบบเดียวกับที่เคยประเมิน NFR-12/NFR-18) ไม่ใช่ gap ที่ตกหล่น
- **ข้อสังเกตสำคัญ (ไม่กระทบสถานะ Addressed ของ NFR ใดในรอบนี้ แต่ควรแก้ไข):**
  [[technology-stack]] **ยังไม่ sync การยกเลิก PatientAssignment** — พบการอ้างอิง
  `PatientAssignment`/`patientAssignments` เป็นกลไกที่ยังใช้งานอยู่จริงหลายจุด (เช่น decision area
  เกี่ยวกับโครงสร้างข้อมูล, Component Diagram ที่ยังวาด `patientAssignments` เป็นส่วนหนึ่งของ Primary
  Data Store, ตัวอย่างกรณีทดสอบ Security Rules ของ NFR-14 ที่ยังอ้างอิง PatientAssignment) ซึ่ง**ขัดแย้ง
  กับ [[architecture]]/[[api-spec]]/[[db-spec]] ที่ยืนยันแล้วว่าลบกลไกนี้ออกทั้งหมดตั้งแต่ 2026-09-25**
  — [[architecture]] เองก็ระบุไว้ในหัวข้อ "ประเด็นรอตัดสินใจ" ว่า
  `[[technology-stack]]` ยังไม่ sync เช่นกัน (ตรวจสอบแล้วว่าเป็นข้อความที่ยังเป็นจริง ไม่ใช่ข้อความ
  ล้าสมัย) เนื่องจาก `technology-stack.md` ไม่ใช่หนึ่งใน 4 เอกสารที่ NFR reviewer ตรวจสอบโดยตรงตามขอบเขต
  งานนี้ (architecture/api-spec/db-spec/detailed-design) จึงไม่กระทบสถานะ Addressed ของ NFR ใดที่ประเมิน
  ในรอบนี้ (เพราะเนื้อหาการออกแบบระดับ logical ใน 4 เอกสารหลักสอดคล้องกันครบแล้ว) แต่**ควรรัน
  `/build-tech-stack` ซ้ำโดยเร็ว** เพื่อความสอดคล้องข้ามเอกสารทั้งหมด — ไม่อยู่ในขอบเขตคำแนะนำ 3 skill
  ของ nfr-reviewer (`sync-architecture`/`sync-api-db`/`sync-detailed-design`) จึงแจ้งแยกไว้ตรงนี้
- **[[architecture]] หัวข้อ "ประเด็นรอตัดสินใจ" ของฟีเจอร์ที่ 7 (Admin) ยังคงมีข้อความล้าสมัยที่เคยแนะนำ
  ให้แก้ไขด้วย `sync-architecture` ตั้งแต่รอบที่เก้า (2026-09-24) แต่ยังไม่ถูกแก้ไข** — ยังคงเขียนว่า
  "กลไกจริงของ FR-15/NFR-19 ... ยังไม่ระบุ" และ "กลไกจริงของ NFR-20 ... ยังไม่ระบุว่าจะใช้ collection
  เดียวกับ NFR-06 ... หรือแยก collection ใหม่" ทั้งที่ [[db-spec]]/[[admin-role-account-management]]
  ตัดสินใจและบันทึกคำตอบไว้ชัดเจนแล้ว (ใช้ `auditLogRecords` เดิม + `isAdminAccess`, shared helper
  module เดียวกับ Operation 1-6) — คงเป็นข้อสังเกตที่ไม่บล็อกสถานะ Addressed เหมือนรอบก่อน แต่ยืนยันซ้ำ
  ว่า `sync-architecture` ยังไม่ได้ถูกรันจริงตั้งแต่คำแนะนำรอบที่เก้า

ก่อนหน้านั้น ผลตรวจสอบรอบที่เก้า (2026-09-24) สำหรับ Admin/NFR-19/NFR-20 มีดังนี้ (คงไว้เพื่อ traceability):

อัปเดตรอบที่เก้า: ประเมินใหม่ **NFR-01 ถึง NFR-20 ทั้งหมด** หลังเพิ่มบทบาท
Admin (FR-11–FR-15, NFR-19, NFR-20) และไฟล์ใหม่ [[admin-role-account-management]]) อ่าน [[architecture]],
[[api-spec]] (Operation 0–16), [[db-spec]], [[technology-stack]] และ `detailed-design/` ทั้ง 6 ไฟล์ใหม่
ทั้งไฟล์ ผลสรุปรอบนี้:

- **NFR-19 (ข้อยกเว้น Access Control ของ Admin) และ NFR-20 (Audit Log fail-safe ของ Admin) — สถานะ
  "รองรับแล้ว (Addressed)"**: [[architecture]] (ตาราง Mapping NFR แถวใหม่), [[api-spec]] (Operation
  ร่วม Access Control ข้อ 2 มีข้อยกเว้น NFR-19 ระบุขอบเขตชัดเจนว่าใช้ได้เฉพาะ Operation 1/2/3/15
  เท่านั้น + Operation ร่วม Audit Logging เพิ่ม field `เข้าถึงในฐานะ Admin หรือไม่`), [[db-spec]]
  (`User.บทบาท` เพิ่มค่า `"admin"`, `AuditLogRecord` เพิ่ม attribute `isAdminAccess` พร้อม test case
  ใหม่ของ NFR-14 ที่ระบุชัดเจนแล้ว) และ [[admin-role-account-management]] (sequence diagram 4 + ตาราง
  Operation↔Entity + หมายเหตุการ Implement ระบุชื่อ Cloud Function/field/error code จริงครบ) สอดคล้อง
  กันครบทุกจุด — ดูรายละเอียดที่หัวข้อ NFR-19/NFR-20 ด้านล่าง
- **พบความไม่สอดคล้องเล็กน้อยระหว่างเอกสาร (ไม่ถึงกับทำให้สถานะเป็น Partial แต่ควรแก้ไข)**:
  [[architecture]] หัวข้อ "ประเด็นรอตัดสินใจ" ยังคงระบุว่า "กลไกจริงของ NFR-19", "กลไกจริงของ NFR-20"
  และ "กรณีทดสอบใหม่ของ NFR-14 สำหรับข้อยกเว้น Admin" เป็นเรื่อง **ยังไม่ตัดสินใจ**/รอ
  `technology-stack.md` — แต่ในความเป็นจริง [[api-spec]] และ [[db-spec]] (ทั้งสองไฟล์ระบุไว้ชัดเจนว่า
  "ได้รับคำตอบยืนยันจากผู้ใช้แล้วผ่าน `NEEDS_USER_INPUT`") ได้ปิดคำถามเหล่านี้ไปแล้วอย่างเป็นรูปธรรม
  (ใช้ `AuditLogRecord` เดิมเพิ่ม attribute, ข้าม `exists()` check ด้วย shared helper module เดิม, และ
  db-spec เพิ่มรายการกรณีทดสอบ NFR-14 ใหม่ 4 ข้อสำหรับ Admin ไว้ครบแล้ว) กล่าวคือ **ข้อความ
  "ประเด็นรอตัดสินใจ" ใน architecture.md ล้าสมัยกว่าที่ api-spec/db-spec ตัดสินใจไปแล้วจริง** — แนะนำรัน
  `sync-architecture` เพื่อปรับปรุงหัวข้อนี้ให้ตรงกับสถานะล่าสุดของ api-spec/db-spec (ไม่ใช่การออกแบบใหม่
  เพียงแค่ทำให้ 3 ชั้นเอกสารสอดคล้องกัน)
- **ตรวจสอบการถดถอยของ NFR-02/NFR-06/NFR-14 จากการเพิ่มบทบาท Admin**: ไม่พบการถดถอย — [[NFR-02]]
  (Operation 0 ของแพทย์/พยาบาลใน [[patient-search-selection]] ไม่ถูกแตะต้อง Admin ใช้ Operation 15
  แยกต่างหาก), [[NFR-06]] (audit log ของแพทย์/พยาบาลยังคง fail-safe แบบเดิมทุกประการ มีเพียง field
  ใหม่ที่เป็น optional เพิ่มเข้ามา) และ [[NFR-14]] (test case เดิมทั้งหมดยังคงอยู่ครบ มีเพียงเพิ่มกรณี
  ทดสอบใหม่ ไม่ได้ลบ/แก้กรณีทดสอบเดิม) — ดูรายละเอียดที่หัวข้อ "หมายเหตุรวม" ท้ายเอกสาร

ก่อนหน้านั้น ผลตรวจสอบรอบที่แปด (2026-09-24) สำหรับ NFR-17/NFR-18 มีดังนี้ (คงไว้เพื่อ traceability):

อัปเดตรอบที่แปด: ประเมินใหม่เฉพาะ **NFR-17, NFR-18** หลัง
`[[technology-stack]]` เพิ่ม decision area 13–19 และแก้ไข decision area 7 (เลิกใช้ Custom Claims เก็บ
บทบาท/isActive, ตรวจ `email_verified` ซ้ำทั้ง Cloud Functions/Security Rules, ตัดสินใจกลไก password
policy และ Email Enumeration Protection แบบเจาะจง) อ่าน [[architecture]], [[api-spec]], [[db-spec]],
[[user-authentication-email-password]] และ [[technology-stack]] ทั้งไฟล์ใหม่ พบว่าทั้ง 4 เอกสารถูก
แก้ไขให้สอดคล้องกับการตัดสินใจทางเทคนิคใหม่ครบถ้วนแล้ว (รวมถึงลบร่องรอยของ "custom claims" เดิมออกจน
หมดและแทนที่ด้วยการตรวจ Firestore `users/{uid}` โดยตรง) **ผลสรุปรอบนี้: NFR-17 และ NFR-18 เปลี่ยนสถานะ
จาก "รองรับบางส่วน (Partial)" เป็น "รองรับแล้ว (Addressed)"** เพราะกลไกทางเทคนิคที่แน่นอนที่เคยเป็น
ช่องว่าง (regex + Identity Platform password policy backstop สำหรับ NFR-17; Firebase "Email
Enumeration Protection" สำหรับ NFR-18) ถูกตัดสินใจและ trace ไว้ตรงกันครบทุกชั้นเอกสารแล้ว — เหลือเพียง
ความเสี่ยงคงเหลือ (timing side-channel ของ NFR-18, ไม่มี `beforeSignIn` ตรวจซ้ำระดับ token issuance)
ที่ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อในรอบ MVP นี้แล้วอย่างชัดเจน ไม่ใช่ gap ที่ตกหล่น ดูรายละเอียด
ที่หัวข้อ NFR-17/NFR-18 ด้านล่าง ตรวจสอบซ้ำแล้วว่า NFR-01 ถึง NFR-16 ไม่ได้รับผลกระทบ/ไม่ถดถอยจากการแก้
decision area 7/18 (การลบ custom claims) เพราะทุกจุดที่เคยอ้างอิง custom claims (โดยเฉพาะ test case
ของ NFR-14) ถูกแก้ไขให้ตรงกันเป็น "อ่าน role/isActive จาก Firestore" ครบทุกจุดแล้วเช่นกัน

ก่อนหน้านั้น ผลตรวจสอบรอบที่หก (2026-09-22) สำหรับ NFR-01–NFR-08 มีดังนี้ (คงไว้เพื่อ traceability):

1. [[pdpa-data-protection-compliance]] ตอนนี้มีหัวข้อ "ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อน
   ฝั่ง Client (NFR-02)" แล้ว ครอบคลุมผลลัพธ์ที่ Operation 4 (กรณี "ขอเข้าถึง"/"ขอสำเนา") ส่งให้ Client
   แสดง พร้อม edge case ที่เกี่ยวข้องในตาราง Edge Case ท้ายไฟล์ — สอดคล้องกับหลักการเดียวกันใน
   [[patient-search-selection]], [[patient-ncd-diagnosis-lab-history]], [[complication-risk-analysis-alert]]
   ครบทั้ง 4 ไฟล์แล้ว
2. Sequence diagram ของขั้นตอน Access Control ใน [[patient-search-selection]],
   [[patient-ncd-diagnosis-lab-history]] และ [[complication-risk-analysis-alert]] ระบุ tag
   "(NFR-02, NFR-03)" ต่อท้ายครบแล้วทุกไฟล์ สอดคล้องกับ [[pdpa-data-protection-compliance]]

ตารางสรุปและรายละเอียดการตรวจสอบด้านล่างถูกปรับปรุงให้ตรงกับสถานะปัจจุบันนี้ — ไม่มีช่องว่างใดเหลืออยู่
ที่ต้องรัน `sync-architecture`/`sync-api-db`/`sync-detailed-design` เพิ่มเติมในรอบนี้ แม้แต่ข้อสังเกต
เสริมที่ไม่บังคับก็ไม่มีเหลือแล้ว

<details>
<summary>ประวัติผลตรวจสอบรอบที่สี่ (2026-09-22) — อ้างอิงไว้เพื่อ traceability</summary>

ตรวจซ้ำเฉพาะช่องว่างของ NFR-02 ที่พบในรอบที่สาม [2026-09-21]: ข้อกำหนด "Client ต้องไม่แสดง/cache
ข้อมูลผู้ป่วยที่ละเอียดอ่อนไว้เกินความจำเป็น" ที่ [[architecture]] ระบุไว้ ถูกส่งต่อเข้า
`detailed-design/` แล้วในไฟล์ [[patient-search-selection]], [[patient-ncd-diagnosis-lab-history]],
[[complication-risk-analysis-alert]] (เพิ่มหัวข้อ "ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง
Client (NFR-02)" พร้อม edge case ครบทั้ง 3 ไฟล์) ผลสรุป: NFR-02 เปลี่ยนสถานะจาก "รองรับบางส่วน" เป็น
"รองรับแล้ว (Addressed)" (มีข้อสังเกตเล็กน้อยที่ไม่บล็อกสถานะ Addressed เรื่อง
[[pdpa-data-protection-compliance]] ยังไม่มีข้อความลักษณะเดียวกันสำหรับผลลัพธ์ที่ Client แสดงใน
Operation 4) NFR อื่นทั้งหมด (NFR-01, NFR-03–NFR-08) ตรวจสอบซ้ำแล้วว่ายังคงสถานะเดิมจากรอบที่สาม
[2026-09-21] ไม่มีการถดถอย

</details>

## ตารางสรุป

| รหัส NFR | คำอธิบายสั้น | สถานะ | เอกสาร/ส่วนที่พบ | สิ่งที่ยังขาด | แนะนำให้รันอะไรต่อ |
| --- | --- | --- | --- | --- | --- |
| NFR-01 | แหล่งข้อมูล/Integration (HOSxP จริง หรือ mockup ระหว่างพัฒนา) | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component\|architecture — ขอบเขตความรับผิดชอบ]], [[api-spec#Operation 1 — ดึงประวัติการวินิจฉัยโรค NCD ของผู้ป่วย\|api-spec Operation 1]], [[api-spec#Operation 2 — ดึงผลตรวจ lab ย้อนหลังของผู้ป่วย\|Operation 2]], [[db-spec#ผู้ป่วย (Patient)\|db-spec Patient]], [[db-spec#ประวัติการวินิจฉัยโรค NCD (NcdDiagnosis)\|NcdDiagnosis]], [[db-spec#ผลตรวจ lab (LabResult)\|LabResult]], [[patient-ncd-diagnosis-lab-history#Sequence Diagram\|patient-ncd-diagnosis-lab-history — sequence diagram + State Transition]] | ไม่มีช่องว่างในระดับ logical design — รายละเอียดการเชื่อมต่อจริงรอ `technology-stack.md` ซึ่งเป็นการตัดสินใจที่บันทึกไว้แล้วอย่างมีเจตนา ไม่ใช่ gap ที่ตกหล่น (ตรวจสอบซ้ำรอบนี้ว่าการแก้ไข FR-05/FR-06 ไม่กระทบ NFR-01 — ยังคง canonical data model เดิมที่ไม่ผูกแหล่งข้อมูล) | ไม่มี (เมื่อ `technology-stack.md` ถูกตัดสินใจในอนาคต ควรกลับมารัน `nfr-reviewer` อีกครั้ง) |
| NFR-02 | Security / Access Control (แพทย์/พยาบาล/Admin ที่ผ่านเงื่อนไข role/isActive/email_verified เห็นผู้ป่วยทุกรายในระบบ — แก้ไข 2026-09-25 ยกเลิกกลไก PatientAssignment) | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-02, แก้ไข 2026-09-25)]], [[api-spec#Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)\|api-spec — Operation ร่วม (role-level เท่านั้น)]], [[api-spec#Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วยทั้งหมดในระบบ (ค้นหาเฉพาะรายด้วยเลข HN)\|api-spec Operation 0]], [[db-spec#ผู้ใช้ (User)\|db-spec User]], [[patient-search-selection#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|patient-search-selection — หัวข้อ NFR-02]], [[patient-ncd-diagnosis-lab-history#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|patient-ncd-diagnosis-lab-history — หัวข้อ NFR-02]], [[complication-risk-analysis-alert#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|complication-risk-analysis-alert — หัวข้อ NFR-02]], [[pdpa-data-protection-compliance#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|pdpa-data-protection-compliance — หัวข้อ NFR-02]] | ไม่มีช่องว่างเชิงออกแบบ — ยืนยันในรอบที่สิบ (2026-09-26) ว่าการยกเลิก PatientAssignment (2026-09-25) ถูกสะท้อนตรงกันครบทั้ง 3 เอกสารหลักและ `detailed-design/` ทั้ง 6 ไฟล์ ไม่มี entity/collection PatientAssignment หลงเหลืออยู่เลย — มีเพียง [[technology-stack]] ที่ยังไม่ sync (ยังอ้างอิง `patientAssignments` เป็นกลไกที่ใช้งานอยู่จริงหลายจุด) ซึ่งอยู่นอกขอบเขต 4 เอกสารที่ nfr-reviewer ตรวจสอบโดยตรง | ไม่มี (แนะนำรัน `/build-tech-stack` ซ้ำเพื่อ sync `technology-stack.md` — อยู่นอกขอบเขต 3 skill ของ nfr-reviewer) |
| NFR-03 | PDPA / Lawful Basis & Purpose Limitation — จำกัดการประมวลผลข้อมูลเฉพาะเท่าที่จำเป็นตามวัตถุประสงค์การดูแลรักษา | **รองรับแล้ว (Addressed)** | [[architecture#Cross-cutting: การคุ้มครองข้อมูลส่วนบุคคล (PDPA)\|architecture — Cross-cutting PDPA]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)\|api-spec — Operation ร่วม กฎข้อ 3 (purpose limitation)]], [[patient-search-selection#Sequence Diagram\|patient-search-selection — Sequence Diagram (tag NFR-02, NFR-03)]], [[patient-ncd-diagnosis-lab-history#Sequence Diagram\|patient-ncd-diagnosis-lab-history — Sequence Diagram]], [[complication-risk-analysis-alert#Sequence Diagram\|complication-risk-analysis-alert — Sequence Diagram]], [[pdpa-data-protection-compliance#Sequence Diagram 1 — คำขอใช้สิทธิของเจ้าของข้อมูล (Operation 4)\|pdpa-data-protection-compliance — Sequence Diagram 1]] | ไม่มีช่องว่างเชิงออกแบบ — Access Control ใน Backend Service ถูกกำหนดเป็นจุดบังคับ purpose limitation เดียวสำหรับทุก operation อย่างสอดคล้องกันตั้งแต่ architecture ถึง detailed-design ยืนยันในรอบนี้ว่าขั้นตอน Access Control ในทั้ง 4 ไฟล์ระบุ tag "(NFR-02, NFR-03)" ตรงกันครบแล้ว (ข้อสังเกตเรื่องความไม่สม่ำเสมอของ label ในรอบที่สี่/ห้าได้รับการแก้ไขแล้วจริง) | ไม่มี |
| NFR-04 | PDPA / การเข้ารหัสข้อมูล (Encryption at rest & in transit) | **รองรับแล้ว (Addressed)** | [[architecture#Component Diagram\|architecture — Component Diagram (หมายเหตุเข้ารหัสทุกเส้นทาง)]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[db-spec#คุณสมบัติร่วม (Cross-cutting Property) — การเข้ารหัสข้อมูล (NFR-04)\|db-spec — คุณสมบัติร่วม NFR-04]], [[pdpa-data-protection-compliance#ขอบเขตของเอกสารนี้\|pdpa-data-protection-compliance — คำอธิบายว่าเหตุใดไม่มี sequence diagram แยก]] | ไม่มีช่องว่าง — ถูกออกแบบเป็น cross-cutting property ที่สอดคล้องกันทุกชั้นเอกสารอย่างมีเจตนา (ไม่ผูก operation ใด operation หนึ่ง) กลไก/อัลกอริทึมเข้ารหัสจริงรอ `technology-stack.md` ซึ่งเป็นการตัดสินใจที่บันทึกไว้แล้ว ไม่ใช่ gap | ไม่มี (รอ `technology-stack.md` ในอนาคต แล้วกลับมารัน `nfr-reviewer` อีกครั้ง) |
| NFR-05 | PDPA / Retention & Deletion — จำกัดระยะเวลาเก็บรักษาและรองรับการลบข้อมูล | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation 6 — บังคับใช้นโยบายเก็บรักษาและลบข้อมูลที่พ้นระยะเวลา (Retention Enforcement)\|api-spec Operation 6]], [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)\|db-spec RetentionPolicy]], [[pdpa-data-protection-compliance#Sequence Diagram 3 — บังคับใช้นโยบายเก็บรักษาและลบข้อมูลที่พ้นระยะเวลา (Operation 6)\|pdpa-data-protection-compliance — Sequence Diagram 3]] | ไม่มีช่องว่างเชิงออกแบบ logical — ค่าระยะเวลาเก็บรักษาจริง (จำนวนวัน) และกลไก trigger จริง (scheduled job/manual) ยังไม่ถูกกำหนด แต่ถูกบันทึกไว้อย่างชัดเจนในทุกชั้นเอกสารว่าเป็นประเด็นรอยืนยันจากหน่วยงาน/ฝ่ายกฎหมายและรอ `technology-stack.md` ไม่ใช่ gap ที่ตกหล่น | ไม่มี (รอการยืนยันค่าระยะเวลาจากหน่วยงาน/ฝ่ายกฎหมาย และรอ `technology-stack.md` — ไม่ใช่งานของชั้นเอกสารเชิงเทคนิคปัจจุบัน) |
| NFR-06 | PDPA / Audit Log & Accountability — บันทึกร่องรอยการเข้าถึงข้อมูล | **รองรับบางส่วน (Partial — ลดสถานะ 2026-09-28 จากผลกระทบของ Operation 18/FR-18)** | [[architecture#Data Flow Diagram — Journey หลัก\|architecture — Data Flow Diagram Journey หลัก]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-06/NFR-20 มีข้อยกเว้น Operation 18)]], [[api-spec#Operation ร่วม — บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)\|api-spec — Operation ร่วม Audit Logging]], [[api-spec#Operation 18 — สรุปจำนวนครั้งตรวจ HbA1c และระยะห่างระหว่างการตรวจในปีงบประมาณ (คำนวณโดยระบบ + AI เขียนสรุป)\|api-spec Operation 18 (Technical Binding — ไม่มี audit log)]], [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)\|db-spec AuditLogRecord]], [[patient-search-selection#Operation 18 — สรุปจำนวนครั้งตรวจ HbA1c และระยะห่างระหว่างการตรวจในปีงบประมาณ (FR-18)\|patient-search-selection — Operation 18]], [[patient-ncd-diagnosis-lab-history#Sequence Diagram\|patient-ncd-diagnosis-lab-history — sequence diagram (audit log step)]], [[complication-risk-analysis-alert#Sequence Diagram\|complication-risk-analysis-alert — sequence diagram (audit log step)]] | **Operation 18 (FR-18, เพิ่ม 2026-09-28) อ่านค่าผลตรวจ lab รายบุคคลของผู้ป่วยจริง (`labResults`) ตรงจาก Client โดยไม่ผ่าน Cloud Function และไม่มีการบันทึก audit log ฝั่งเซิร์ฟเวอร์เลยแม้แต่รายการเดียว** — ต่างจาก Operation 1-6/16 ที่มี audit log แบบ fail-safe ครบทุกตัว และต่างจาก Operation 0/17 ที่ไม่แตะข้อมูลผู้ป่วยรายบุคคลจึงไม่ต้องมี audit log ตามเจตนาเดิม ถือเป็นความล้มเหลวสมบูรณ์ของหลักการ NFR-06 สำหรับเส้นทางนี้เส้นทางเดียว แม้จะถูกบันทึกไว้ชัดเจนในทุกเอกสารพร้อม target design (ย้ายเป็น Cloud Function `computeHba1cVisitSummary` เมื่ออยู่แพ็กเกจ Blaze) ก็ตาม | รอการตัดสินใจของผู้ใช้ว่าจะยอมรับความเสี่ยงนี้ต่อจนกว่าจะอัปเกรดเป็นแพ็กเกจ Blaze หรือบล็อกฟีเจอร์ FR-18 ไว้ก่อน (เป็นการตัดสินใจเชิงผลิตภัณฑ์/ความเสี่ยง ไม่ใช่ gap ที่ `sync-api-db`/`sync-architecture` แก้ได้ตรงๆ เพราะกลไก Client-direct ถูกตัดสินใจแล้วใน `technology-stack` decision area 23) |
| NFR-07 | PDPA / Data Subject Rights — รองรับคำขอเข้าถึง/สำเนา/แก้ไข/ลบ/คัดค้านการประมวลผลข้อมูลสำหรับผู้ป่วยทุกรายในระบบ (แก้ไข 2026-09-25 — ยกเลิกกลไก PatientAssignment) | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-07, แก้ไข 2026-09-25)]], [[api-spec#Operation 4 — ยื่นและดำเนินการคำขอใช้สิทธิของเจ้าของข้อมูล (Data Subject Rights Request)\|api-spec Operation 4]], [[db-spec#คำขอใช้สิทธิของเจ้าของข้อมูล (DataSubjectRequest)\|db-spec DataSubjectRequest]], [[pdpa-data-protection-compliance#Sequence Diagram 1 — คำขอใช้สิทธิของเจ้าของข้อมูล (Operation 4)\|pdpa-data-protection-compliance — Sequence Diagram 1 + State Diagram]] | ไม่มีช่องว่างเชิงออกแบบ logical — ครอบคลุมสิทธิทั้ง 5 ประเภท (เข้าถึง/สำเนา/แก้ไข/ลบ/คัดค้าน) สำหรับผู้ป่วยทุกรายในระบบ (ยืนยันในรอบที่สิบว่า [[pdpa-data-protection-compliance]] แก้ไขแล้วว่า "ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไป (ยกเลิก PatientAssignment ทั้งหมด)" ตรงกับ [[api-spec]]/[[architecture]]) พร้อม state diagram และ edge case ครบ กระบวนการยืนยันตัวตนผู้ยื่นคำขอก่อนเจ้าหน้าที่บันทึกคำขอในระบบยังไม่ถูกยืนยันจากผู้ใช้ แต่ถูกบันทึกไว้อย่างชัดเจนว่าเป็นกระบวนการเชิงองค์กรที่อยู่นอกขอบเขตของ operation นี้ ไม่ใช่ gap ของการออกแบบระดับเอกสารเชิงเทคนิค | ไม่มี (ควรให้ผู้ใช้/เจ้าของ requirement ยืนยันกระบวนการยืนยันตัวตนผู้ยื่นคำขอ — เป็นคำถามเชิง requirement ไม่ใช่ gap ของ technical spec) |
| NFR-08 | PDPA / Breach Notification Support — สนับสนุนข้อมูลสำหรับการแจ้งเหตุละเมิดข้อมูลส่วนบุคคล | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation 5 — สืบค้นบันทึกการเข้าถึงข้อมูล (Audit Trail Retrieval)\|api-spec Operation 5]], [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)\|db-spec AuditLogRecord]], [[pdpa-data-protection-compliance#Sequence Diagram 2 — สืบค้น Audit Trail เพื่อสนับสนุนการสืบสวน/แจ้งเหตุละเมิด (Operation 5)\|pdpa-data-protection-compliance — Sequence Diagram 2]] | ไม่มีช่องว่างเชิงออกแบบ logical — Operation 5 ให้บริการค้นคืน audit trail พร้อม edge case ครบ (ไม่มีสิทธิ์, ช่วงเวลาไม่ถูกต้อง, ไม่พบข้อมูล) กรอบเวลาที่กฎหมายกำหนดจริงยังไม่ถูกระบุในเอกสารต้นทาง แต่ถูกบันทึกไว้อย่างชัดเจนว่าเป็นประเด็นรอข้อมูลเพิ่มเติม ไม่ใช่ gap ของการออกแบบ | ไม่มี |
| NFR-09 | Performance — หน้าจอค้นหา/ประวัติวินิจฉัย/lab/ผลวิเคราะห์ความเสี่ยงตอบสนอง < 2 วินาที | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-09)]], [[api-spec#Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)\|api-spec — Cross-cutting NFR-09–16]], [[patient-search-selection#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|patient-search-selection]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่าง — กลไกจริง (Firestore composite index ต่อ query pattern ของแต่ละ operation ไม่มี caching layer เพิ่มเติมโดยเจตนา) ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 9 และระบุ index จริงไว้ครบในทุก entity ของ [[db-spec]] และทุกไฟล์ที่เกี่ยวข้องใน `detailed-design/` | ไม่มี |
| NFR-10 | Availability — อ้างอิง SLA มาตรฐานของ Firebase/Google Cloud | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-10)]] | ไม่มีช่องว่าง — เป็นคุณสมบัติระดับ infrastructure ที่ไม่ต้องออกแบบ component/operation เพิ่มเติมตามที่ระบุไว้แล้วอย่างมีเจตนา ผูกกับ SLA ของ Firebase services ที่ `[[technology-stack]]` เลือกใช้โดยตรง | ไม่มี |
| NFR-11 | Clinical Safety Validation — ยืนยันการจับคู่โรค/threshold โดยแพทย์ผู้เชี่ยวชาญก่อน deploy ทุกครั้ง | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-11)]], [[db-spec#threshold มาตรฐานของโรคแทรกซ้อน (ComplicationRiskThreshold)\|db-spec — หมายเหตุ NFR-11 ใน ComplicationRiskThreshold]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่างเชิงออกแบบ — ถูกบันทึกไว้อย่างชัดเจนว่าเป็นกระบวนการเชิงองค์กร (deployment approval gate) นอกระบบ ไม่ใช่ behavior ที่ต้อง implement เป็นโค้ด/UI/attribute ใหม่ ค่า threshold จริงยังไม่ถูกกำหนด (ประเด็นรอยืนยันจากแพทย์ผู้เชี่ยวชาญ ไม่ใช่ gap ของเอกสารเทคนิค) | ไม่มี |
| NFR-12 | Session Timeout — auto-logout เมื่อไม่ใช้งานเกิน 30 นาที | **รองรับแล้ว (Addressed — มีความเสี่ยงที่บันทึกไว้ชัดเจน)** | [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component\|architecture — หัวข้อ Client/Backend Service]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-12)]], [[api-spec#Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)\|api-spec — Operation ร่วม ข้อ 4]], [[db-spec#ผู้ใช้ (User)\|db-spec — หมายเหตุ NFR-12 ใน User]], [[patient-search-selection#Sequence Diagram\|patient-search-selection — loop inactivity ใน Sequence Diagram]] | ไม่มีช่องว่างเชิงออกแบบ — กลไก client custom inactivity timer (`setTimeout` + event listener เรียก `signOut()`) ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 10 และระบุคู่กันในทุกชั้นเอกสาร **ความเสี่ยงด้านความปลอดภัย (ไม่มี server-side token revocation, token ยังใช้ได้ต่อจนถึง ~1 ชม.) ถูกบันทึกไว้อย่างเด่นชัดและผู้ใช้รับทราบ/ยืนยันให้ดำเนินการต่อแล้ว — เป็น mitigation ที่ควรทำก่อนใช้ข้อมูลผู้ป่วยจริง ไม่ใช่ gap ของการออกแบบเอกสารในรอบ MVP นี้** | ไม่มี (แนะนำเพิ่ม server-side token revocation ก่อนใช้ข้อมูลผู้ป่วยจริง — บันทึกไว้แล้วใน "ประเด็นรอตัดสินใจ" ของ architecture) |
| NFR-13 | Accessibility — ห้ามใช้สีเป็นสัญญาณเดียว ต้องมีข้อความกำกับคู่กับสีเสมอ | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-13)]], [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)\|db-spec RiskFinding — field ระดับความเสี่ยงที่ประเมินได้]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่าง — field ข้อความ (ไม่ใช่รหัสสี) พร้อมใช้งานแล้วใน db-spec, กลไกจริง (WCAG 2.1 AA + Heroicons + Lighthouse Audit) ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 11 รายละเอียด mapping สี/ไอคอนเฉพาะจุดเป็นหน้าที่ของ [[DESIGN]] ต่อไปตามที่ระบุไว้แล้ว | ไม่มี |
| NFR-14 | Security Rules Verification — automated test ผ่าน Firebase Emulator Suite ครอบคลุมทุกกรณีสิทธิ์ (แก้ไข 2026-09-25 — ยกเลิกกรณีทดสอบ PatientAssignment) | **รองรับบางส่วน (Partial — ลดสถานะ 2026-09-28 จากผลกระทบของ `hba1cVisitSummaries`/Operation 18)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-14)]], [[db-spec#คุณสมบัติร่วม (Cross-cutting Property) — Security Rules Verification (NFR-14)\|db-spec — คุณสมบัติร่วม NFR-14 (แถวใหม่ `hba1cVisitSummaries`)]], [[patient-search-selection#หมายเหตุการ Implement\|patient-search-selection]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]], [[user-authentication-email-password#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|user-authentication-email-password]] | เนื้อหาเดิม (role/isActive/email_verified ของ `users`/`patients`/Cloud Functions Admin) ยังคงครบเหมือนรอบที่สิบ ไม่มีการถดถอย — แต่ [[db-spec]] เพิ่มแถวใหม่ `hba1cVisitSummaries` ในตาราง NFR-14 แล้วระบุเองว่า **"ยังไม่มี automated test เฉพาะสำหรับ collection นี้"** และกฎที่ใช้งานจริง (`firestore.rules` ที่ root เปิดกว้างทั้งฐานข้อมูล) ไม่ตรงกับกฎที่ตั้งใจออกแบบไว้ (ควรเป็น `allow read, write: if false` เหมือน `labResults`) แม้แต่ในช่วงเปลี่ยนผ่าน — มีทั้ง "รู้ว่าต้องทดสอบแต่ยังไม่ได้ทดสอบ" และ "กฎหลวมกว่าที่ตั้งใจ" พร้อมกัน จึงไม่ถือว่า NFR-14 รองรับ collection นี้ได้สมบูรณ์ (ข้อสังเกตเดิมเรื่อง [[architecture]] "ประเด็นรอตัดสินใจ" ล้าสมัยของฟีเจอร์ที่ 7 ยังคงค้างอยู่เช่นเดิม ไม่เกี่ยวกับการลดสถานะรอบนี้) | `sync-api-db` (เพิ่มกรณีทดสอบ automated test จริงสำหรับ `hba1cVisitSummaries` ใน [[db-spec]] ให้ตรงกับสถานะปัจจุบันอย่างน้อย — ถ้าจะให้ตรงกับ target design ต้องรอ Cloud Function `computeHba1cVisitSummary` ก่อน) และ `sync-architecture` (ค้างจากรอบที่เก้า — ปรับปรุงหัวข้อ "ประเด็นรอตัดสินใจ" ของฟีเจอร์ที่ 7 ให้ตรงกับ db-spec/api-spec) |
| NFR-15 | Browser/Device Compatibility — Chrome/Edge/Firefox ล่าสุดบน desktop/tablet | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-15)]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่าง — browserslist config ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 12 เป็นเรื่องของ Client build config ล้วนๆ ไม่กระทบ operation/entity | ไม่มี |
| NFR-16 | Interoperability (future, Won't have เฟสนี้) — พิจารณา HL7/FHIR เมื่อเชื่อมต่อ HOSxP จริง | **รองรับแล้ว (Addressed — Won't have โดยเจตนา)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-16)]] | ไม่มีช่องว่าง — ยืนยันแล้วว่าเป็น Won't have ของเฟสนี้ ไม่ต้องออกแบบ component/operation เพิ่มเติมจนกว่าจะเชื่อมต่อ HOSxP จริงในอนาคต | ไม่มี |
| NFR-17 | Security / Password Policy — รหัสผ่านขั้นต่ำ 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข | **รองรับแล้ว (Addressed)** | [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component\|architecture — หัวข้อ Client/Backend Service ฟีเจอร์ที่ 6]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-17)]], [[api-spec#Operation 8 — สมัครบัญชีผู้ใช้งานด้วยตนเอง (Self Sign-up)\|api-spec Operation 8]], [[api-spec#Operation 9 — ขอรีเซ็ตรหัสผ่านทางอีเมล (Forgot Password)\|Operation 9]], [[db-spec#ผู้ใช้ (User)\|db-spec User — attribute รหัสผ่านที่จัดเก็บ]], [[user-authentication-email-password#Sequence Diagram — สมัครบัญชี ยืนยันอีเมล และรออนุมัติ (Operation 8, FR-08/FR-09)\|user-authentication-email-password — Sequence Diagram Operation 8/9]], [[technology-stack#13. กลไก Validate Password Policy ฝั่งเซิร์ฟเวอร์ (NFR-17, ฟีเจอร์ที่ 6) — Regex ใน Cloud Function + Identity Platform เป็น Backstop\|technology-stack decision area 13]] | ไม่มีช่องว่าง — กลไกทางเทคนิคจริงถูกตัดสินใจแล้วในรอบ 2026-09-24: **regex ในโค้ด Cloud Function `signUpUser`** (Operation 8) + **Google Cloud Identity Platform password policy เป็น backstop** สำหรับ Operation 9 (`confirmPasswordReset` ที่ไม่ผ่าน Cloud Function) — ตรวจสอบแล้วว่า [[architecture]] (หัวข้อ Client/Backend Service ฟีเจอร์ที่ 6 + ประเด็นรอตัดสินใจ), [[api-spec]] (Operation 8/9 Technical Binding), [[db-spec]] (attribute รหัสผ่านที่จัดเก็บ) และ [[user-authentication-email-password]] (sequence diagram Operation 8/9 + หมายเหตุการ Implement) อ้างอิงกลไกเดียวกันนี้ตรงกันครบทุกไฟล์แล้ว ไม่มีข้อความ "ยังไม่ตัดสินใจ" หลงเหลืออยู่ | ไม่มี |
| NFR-18 | Security / Account Enumeration Prevention — ไม่เปิดเผยว่าอีเมลมีบัญชีในระบบหรือไม่ | **รองรับแล้ว (Addressed — มีความเสี่ยงคงเหลือที่บันทึกไว้ชัดเจน)** | [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component\|architecture — หัวข้อ Client/Backend Service ฟีเจอร์ที่ 6]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-18)]], [[api-spec#Operation 7 — เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน\|api-spec Operation 7]], [[api-spec#Operation 8 — สมัครบัญชีผู้ใช้งานด้วยตนเอง (Self Sign-up)\|Operation 8]], [[api-spec#Operation 9 — ขอรีเซ็ตรหัสผ่านทางอีเมล (Forgot Password)\|Operation 9]], [[user-authentication-email-password#Edge Case และวิธีจัดการ\|user-authentication-email-password — Edge Case]], [[technology-stack#14. กลไกป้องกัน Account Enumeration (NFR-18, ฟีเจอร์ที่ 6) — Firebase Email Enumeration Protection\|technology-stack decision area 14]] | ไม่มีช่องว่างเชิงออกแบบ — กลไกทางเทคนิคจริงถูกตัดสินใจแล้ว: เปิด **Firebase "Email Enumeration Protection"** ระดับโปรเจกต์ ปิด error code ที่แยกแยะได้ของ Operation 7 ตรงกับที่ [[architecture]]/[[api-spec]]/[[user-authentication-email-password]] อ้างอิงกลไกเดียวกันครบแล้ว **ความเสี่ยง timing side-channel ที่ยังไม่ถูกปิด (ไม่มี fixed minimum delay) ถูกบันทึกไว้อย่างเด่นชัดในทุกชั้นเอกสาร (technology-stack หัวข้อ "ความเสี่ยงเพิ่มเติม", architecture หัวข้อ "ประเด็นรอตัดสินใจ") ว่าผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อในรอบ MVP นี้แล้ว — ไม่ใช่ gap ที่ตกหล่น แต่เป็น mitigation ที่ควรทำก่อนใช้ข้อมูลผู้ป่วยจริง** เช่นเดียวกับรูปแบบที่ใช้กับ NFR-12 | ไม่มี (แนะนำเพิ่ม fixed minimum delay ใน Cloud Function ก่อนใช้ข้อมูลผู้ป่วยจริง — บันทึกไว้แล้วใน "ประเด็นรอตัดสินใจ"/"ความเสี่ยงที่ต้องพิจารณาเพิ่มเติม" ของ technology-stack) |
| NFR-19 | Security / Access Control สำหรับบทบาท Admin — เข้าถึงประวัติ/ผล lab/ผลวิเคราะห์ความเสี่ยงของผู้ป่วยทุกรายได้ (เฉพาะอ่าน — แก้ไข 2026-09-25: ไม่ใช่ "ข้อยกเว้น" อีกต่อไป เพราะแพทย์/พยาบาลเข้าถึงผู้ป่วยทุกรายอยู่แล้วเช่นกัน) | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-19, แก้ไข 2026-09-25)]], [[api-spec#Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)\|api-spec — Operation ร่วม Access Control]], [[db-spec#ผู้ใช้ (User)\|db-spec User — ค่า role เพิ่ม "admin"]], [[admin-role-account-management#Sequence Diagram — Admin ดูข้อมูลผู้ป่วยทุกรายแบบอ่านอย่างเดียว\|admin-role-account-management]], [[patient-ncd-diagnosis-lab-history]], [[complication-risk-analysis-alert]] | ไม่มีช่องว่างเชิงออกแบบ — ยืนยันในรอบที่สิบว่าทั้ง 6 ไฟล์ใน `detailed-design/` ระบุตรงกันครบว่า "ไม่มีการตรวจสอบระดับรายผู้ป่วยเหลือให้ข้ามอีกต่อไป" (Admin ผ่านการตรวจสอบ role-level เดียวกับแพทย์/พยาบาลทุกประการ ต่างกันเพียงสิทธิ์อ่านอย่างเดียว) [[db-spec]] เพิ่มกรณีทดสอบ NFR-14 ที่ยืนยัน Admin เข้าถึง Operation 1/2/3 สำเร็จเหมือนบทบาทอื่น มีเพียงข้อสังเกตเดิม (ยังไม่ถูกแก้ไข) ว่า [[architecture]] หัวข้อ "ประเด็นรอตัดสินใจ" ยังเขียนว่า "ยังไม่มี decision area ใน technology-stack ระบุไว้โดยตรง"/"ยังไม่ระบุว่าจะเขียนเป็น shared helper module" ทั้งที่ api-spec/db-spec/admin-role-account-management ตัดสินใจและยืนยันคำตอบไปแล้วชัดเจน (ไม่ใช่ gap เชิงพฤติกรรม แต่เป็นข้อความล้าสมัยที่ยังไม่ถูกปรับปรุงตามคำแนะนำเดิมจากรอบที่เก้า) | `sync-architecture` (ยังไม่ถูกรันตามคำแนะนำเดิมจากรอบที่เก้า — ปรับปรุงหัวข้อ "ประเด็นรอตัดสินใจ" ของฟีเจอร์ที่ 7 ให้ตรงกับข้อสรุปที่ api-spec/db-spec/admin-role-account-management ยืนยันไปแล้ว — ไม่บังคับเพราะไม่กระทบ behavior ที่ออกแบบไว้) |
| NFR-20 | PDPA / Audit Log แบบ fail-safe สำหรับการเข้าถึงข้อมูลผู้ป่วยของ Admin | **รองรับบางส่วน (Partial — ลดสถานะ 2026-09-28 จากผลกระทบของ Operation 18/FR-18)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-20 มีข้อยกเว้น Operation 18)]], [[api-spec#Operation ร่วม — บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)\|api-spec — Operation ร่วม Audit Logging]], [[api-spec#Operation 18 — สรุปจำนวนครั้งตรวจ HbA1c และระยะห่างระหว่างการตรวจในปีงบประมาณ (คำนวณโดยระบบ + AI เขียนสรุป)\|api-spec Operation 18]], [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)\|db-spec AuditLogRecord — attribute `isAdminAccess`]], [[admin-role-account-management]] | กลไก fail-safe เดิม (Operation 1-3/16 ผ่าน Cloud Functions) ยังคงครบเหมือนรอบที่สิบ ไม่มีการถดถอย — แต่เมื่อ Admin กดปุ่ม Operation 18 (FR-18 — ทุกบทบาทกดได้เหมือนกันรวม Admin) **ไม่มีการบันทึก `isAdminAccess`/audit log ใดๆ เลย เพราะไม่ผ่าน Cloud Function** [[architecture]]/[[db-spec]] ระบุตรงกันว่าเป็น "ข้อยกเว้นเดียวกับ NFR-06" อย่างชัดเจน แต่ยังคงเป็นช่องว่างจริงสำหรับเส้นทางนี้ ไม่ใช่ Addressed แล้วอย่างสมบูรณ์อีกต่อไป (ข้อสังเกตเดิมเรื่อง [[architecture]] "ประเด็นรอตัดสินใจ" ล้าสมัยของฟีเจอร์ที่ 7 ยังคงค้างอยู่เช่นเดิม ไม่เกี่ยวกับการลดสถานะรอบนี้) | รอการตัดสินใจของผู้ใช้เช่นเดียวกับ NFR-06 (ยอมรับความเสี่ยงต่อจนกว่าจะอัปเกรด Blaze หรือบล็อกฟีเจอร์ FR-18 — ไม่ใช่ gap ที่ `sync-*` แก้ได้ตรงๆ) และ `sync-architecture` (ค้างจากรอบที่เก้า — ปรับปรุงหัวข้อ "ประเด็นรอตัดสินใจ" เช่นเดียวกับ NFR-19) |
| NFR-21 | PDPA / Data Minimization for External AI Service — ห้ามส่งชื่อ/ข้อมูลระบุตัวตนของผู้ป่วยให้บริการ AI ภายนอก ส่งได้เฉพาะเลข HN ที่พิมพ์และผลการค้นหาแบบไม่ระบุตัวตน (เพิ่ม 2026-09-26, ขยายเพิ่ม 2026-09-27/2026-09-28 ครอบคลุม FR-18) | **รองรับแล้ว (Addressed — มีความเสี่ยงเชิงสถาปัตยกรรมที่ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว)** | [[architecture#บริการ AI ภายนอก (External AI Service)\|architecture — บริการ AI ภายนอก]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-21, ขยายครอบคลุม FR-18)]], [[api-spec#Operation 17 — อธิบายผลการค้นหาผู้ป่วยด้วย HN โดยบริการ AI ภายนอก (AI-assisted Search Result Explanation)\|api-spec Operation 17]], [[api-spec#Operation 18 — สรุปจำนวนครั้งตรวจ HbA1c และระยะห่างระหว่างการตรวจในปีงบประมาณ (คำนวณโดยระบบ + AI เขียนสรุป)\|api-spec Operation 18]], [[db-spec#คุณสมบัติร่วม (Cross-cutting Property) — จำกัดข้อมูลที่ส่งให้บริการ AI ภายนอก (NFR-21, เพิ่ม 2026-09-26)\|db-spec — คุณสมบัติร่วม NFR-21 (ส่วนขยาย FR-18)]], [[patient-search-selection#Sequence Diagram\|patient-search-selection — ขั้นตอน "จำกัดข้อมูล NFR-21"]], [[patient-search-selection#Operation 18 — สรุปจำนวนครั้งตรวจ HbA1c และระยะห่างระหว่างการตรวจในปีงบประมาณ (FR-18)\|patient-search-selection — Operation 18]] | ไม่มีช่องว่างเชิงออกแบบระดับ logical — Input ของ Operation 17 จำกัดไว้ชัดเจนเพียง 3 ค่า และ Input ของ Operation 18 (เพิ่ม 2026-09-28) จำกัดเฉพาะจำนวนครั้งตรวจ/ระยะห่างเป็นวันที่คำนวณแล้ว ห้ามส่ง HN/ชื่อ/วันที่จริง/ค่าผล HbA1c ใดๆ — สอดคล้องกันครบทั้ง [[architecture]]/[[api-spec]]/[[db-spec]]/[[patient-search-selection]] รวม edge case **ความเสี่ยงที่บันทึกไว้ชัดเจนและผู้ใช้ยืนยันให้ดำเนินการต่อแล้ว:** บังคับได้เฉพาะฝั่ง Client เท่านั้นทั้ง Operation 17/18 ไม่มี Cloud Function ตัวกลางกรอง prompt ซ้ำ — แต่ **ต่างจาก NFR-06/NFR-14/NFR-20 ตรงที่เจตนาหลักของ NFR-21 (ห้ามส่งข้อมูลระบุตัวตนให้ AI) ยังคงทำงานได้จริงที่ชั้น prompt construction แม้ไม่มีชั้นตรวจสอบซ้ำฝั่งเซิร์ฟเวอร์** จึงยังคงถือเป็น Addressed พร้อมความเสี่ยงที่บันทึกไว้ชัดเจน (รูปแบบเดียวกับ NFR-12/NFR-18) | ไม่มี (แนะนำเพิ่มชั้นตรวจสอบฝั่งเซิร์ฟเวอร์/audit log เมื่ออัปเกรดเป็นแพ็กเกจ Blaze — บันทึกไว้แล้วใน "ประเด็นรอตัดสินใจ" ของ architecture/db-spec) |

## รายละเอียดการตรวจสอบ

### NFR-01 — แหล่งข้อมูล/Integration

ผลการตรวจสอบไม่เปลี่ยนแปลงจากรอบก่อน (2026-09-17 และรอบที่สอง 2026-09-21): ครบทั้ง 4 ชั้นเอกสารในระดับ
logical design ส่วนรายละเอียดการเชื่อมต่อจริง (protocol/field mapping) ถูกบันทึกไว้แล้วว่าอยู่นอกขอบเขต
MVP และรอ `technology-stack.md` — เป็นการตัดสินใจที่ทำไว้แล้วอย่างมีเจตนา ไม่ใช่ gap **ตรวจสอบเพิ่มเติม
ในรอบที่สามนี้ (2026-09-21):** การแก้ไข FR-05/FR-06 (ค้นหาด้วย HN 7 หลักแทนคำค้นอิสระ) ไม่กระทบ NFR-01
เพราะ Patient entity ใน [[db-spec]] ยังคงใช้ canonical/logical data model เดียวเดิมที่ไม่ผูกกับ
HOSxP/mockup โดยตรง มีเพียงการเพิ่ม constraint รูปแบบ "เลขประจำตัวผู้ป่วย" (ตัวเลขล้วน 7 หลัก) ซึ่งเป็น
เรื่องของ FR-06 ไม่ใช่แหล่งข้อมูล — ไม่ถือเป็นการถดถอยของ NFR-01

### NFR-02 — Security / Access Control

**ตรวจสอบรอบที่หก (2026-09-22):** role-level + patient-level access control (ตรวจสอบสิทธิ์ตามบทบาทและ
ตาม PatientAssignment) ยังคงถูกออกแบบไว้อย่างละเอียดและสอดคล้องกันครบทุกชั้นเอกสารเหมือนเดิม ไม่มีการ
เปลี่ยนแปลงในส่วนนี้ ข้อกำหนด "Client ต้องไม่แสดงหรือ cache ข้อมูลผู้ป่วยที่ละเอียดอ่อนไว้เกินความจำเป็น
บนฝั่งผู้ใช้" ตามที่ [[architecture#ตาราง Mapping NFR ไปยัง Component|architecture — ตาราง Mapping NFR
(แถว NFR-02)]] กำหนดไว้ ถูกอ่านทั้ง 4 ไฟล์ใน `detailed-design/` ใหม่ทั้งไฟล์ในรอบนี้ พบว่า:

- [[patient-search-selection]] — มีหัวข้อ "ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง
  Client (NFR-02)" อธิบายหลักการ (แสดงเฉพาะเท่าที่จำเป็น, ล้างเมื่อออกจากหน้าจอ/ค้นหาซ้ำ/logout) พร้อม
  3 แถวใน Edge Case ครอบคลุมทั้งสามสถานการณ์นี้อย่างชัดเจน
- [[patient-ncd-diagnosis-lab-history]] — มีหัวข้อเดียวกัน (อ้างอิงหลักการจาก
  [[patient-search-selection]]) ครอบคลุมประวัติวินิจฉัย/แนวโน้มผล lab ที่แสดงอยู่ พร้อม edge case
  1 แถว (ออกจากหน้าจอ/logout ต้องล้างทันที)
- [[complication-risk-analysis-alert]] — มีหัวข้อเดียวกันอีกเช่นกัน ครอบคลุมผลการประเมิน/flag เตือน
  ความเสี่ยงที่แสดงอยู่ พร้อม edge case 1 แถว
- [[pdpa-data-protection-compliance]] — **ยืนยันในรอบนี้ว่ามีหัวข้อ "ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วย
  ที่ละเอียดอ่อนฝั่ง Client (NFR-02)" แล้ว** (ต่อจาก Sequence Diagram 1) ครอบคลุมผลลัพธ์ที่ Operation 4
  กรณี "ขอเข้าถึง"/"ขอสำเนา" ส่งให้ Client แสดง พร้อมแถว edge case ที่เกี่ยวข้องในตาราง Edge Case ท้ายไฟล์
  (เจ้าหน้าที่ออกจากหน้าจอ/ยื่นคำขอใหม่แทนที่ผลลัพธ์เดิม/logout ต้องล้างทันที) — ข้อสังเกตเดิมในรอบที่สี่/
  ห้าที่ระบุว่าไฟล์นี้ "ยังไม่มีการเพิ่มข้อความลักษณะเดียวกัน" ไม่ตรงกับเนื้อหาปัจจุบันของไฟล์อีกต่อไป
  (ได้รับการแก้ไขแล้วจริง)

**สรุป: NFR-02 ยังคงสถานะ "รองรับแล้ว (Addressed)" และตอนนี้สอดคล้องกันครบทั้ง 4 ไฟล์โดยไม่มีข้อสังเกต
เสริมค้างอยู่อีกต่อไป**

### NFR-03 — PDPA / Lawful Basis & Purpose Limitation

- [[architecture]]: หัวข้อ "Cross-cutting: การคุ้มครองข้อมูลส่วนบุคคล (PDPA)" ระบุชัดว่า NFR-03 บังคับใช้
  ที่ Access Control ใน Backend Service เป็นจุดเดียวที่ทุกคำขอต้องผ่านก่อนส่งต่อไปยังกลุ่มงานอื่น และ
  ตาราง Mapping NFR ระบุแนวทางเชิงหลักการไว้ครบ
- [[api-spec]]: Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" มีกฎทางธุรกิจข้อ 3 ระบุ purpose
  limitation อย่างชัดเจน เป็น precondition ของทุก operation อื่น (Operation 0-6)
- `detailed-design/`: ตรวจสอบซ้ำในรอบที่หก (2026-09-22) พบว่า sequence diagram ของขั้นตอน Access
  Control ใน [[pdpa-data-protection-compliance]] (Sequence Diagram 1, Operation 4),
  [[patient-search-selection]], [[patient-ncd-diagnosis-lab-history]] และ
  [[complication-risk-analysis-alert]] ระบุ tag "(NFR-02, NFR-03)" ตรงกันครบทั้ง 4 ไฟล์แล้ว — ข้อสังเกต
  เรื่องความไม่สม่ำเสมอของ label ที่รอบก่อนหน้าเคยบันทึกไว้ไม่ตรงกับเนื้อหาปัจจุบันของไฟล์อีกต่อไป
- สรุป: รองรับแล้วครบทุกชั้นเอกสาร ไม่มีช่องว่างที่ต้องรัน sync-* เพิ่มเติม ไม่มีข้อสังเกตเสริมค้างอยู่

### NFR-04 — PDPA / Encryption at rest & in transit

- [[architecture]]: Component Diagram มีหมายเหตุระบุชัดว่าทุกเส้นทางสื่อสารที่มีข้อมูลส่วนบุคคล/สุขภาพ
  ไหลผ่านต้องเข้ารหัสขณะส่งผ่านเครือข่าย และ Primary Data Store กับ Audit Log Store ต้องเข้ารหัสขณะพัก
  หัวข้อ Cross-cutting และตาราง Mapping NFR ระบุรายละเอียดครบ
- [[db-spec]]: มีหัวข้อ "คุณสมบัติร่วม (Cross-cutting Property) — การเข้ารหัสข้อมูล (NFR-04)" แยกต่างหาก
  ระบุรายชื่อทุก entity ที่มีข้อมูลส่วนบุคคล/สุขภาพที่ต้องเข้ารหัสขณะจัดเก็บอย่างครบถ้วน
- [[api-spec]]: ระบุในหัวข้อ "ประเด็นรอตัดสินใจ" อย่างชัดเจนว่าเป็นคุณสมบัติร่วมที่บังคับใช้กับทุกช่องทาง
  สื่อสาร ไม่ผูกกับ operation ใด operation หนึ่งโดยเฉพาะ
- `detailed-design/`: [[pdpa-data-protection-compliance]] อธิบายไว้ชัดเจนในหัวข้อ "ขอบเขตของเอกสารนี้"
  ว่าเหตุใดจึงไม่มี sequence diagram แยกสำหรับ NFR-04 (เป็น cross-cutting property ไม่ใช่ operation)
- สรุป: รองรับแล้วครบทุกชั้นเอกสารอย่างสอดคล้องกัน เป็นการออกแบบที่มีเจตนาชัดเจน ไม่มีช่องว่าง

### NFR-05 — PDPA / Retention & Deletion

- [[architecture]]: ตาราง Mapping NFR และหัวข้อ Cross-cutting ระบุ Backend Service (Data Subject
  Rights & Retention Management) + Primary Data Store เป็นผู้รับผิดชอบ
- [[api-spec]]: Operation 6 "บังคับใช้นโยบายเก็บรักษาและลบข้อมูลที่พ้นระยะเวลา" ระบุ input/output/กฎทาง
  ธุรกิจ/กรณี error ครบถ้วน รวมถึงแยกความแตกต่างจากการลบตามคำขอสิทธิ (Operation 4)
- [[db-spec]]: entity RetentionPolicy ระบุโครงสร้างเชิงตรรกะครบ (แม้ค่าจริงยังไม่ถูกกำหนด)
- `detailed-design/`: [[pdpa-data-protection-compliance]] Sequence Diagram 3 แสดงลำดับการบังคับใช้
  นโยบายอย่างละเอียด รวมถึงกรณี RetentionPolicy ยังไม่มีค่าระยะเวลา (ข้ามการบังคับใช้ ไม่ใช่ error)
- สรุป: รองรับแล้วครบทุกชั้นเอกสารในระดับ logical — ค่าระยะเวลาจริงและกลไก trigger จริงเป็นประเด็นรอ
  ยืนยันจากหน่วยงาน/ฝ่ายกฎหมายและ `technology-stack.md` ที่ถูกบันทึกไว้อย่างมีเจตนา ไม่ใช่ gap

### NFR-06 — PDPA / Audit Log & Accountability

- [[architecture]]: เพิ่ม component ใหม่ "ที่เก็บบันทึกการเข้าถึง (Audit Log Store)" และกลุ่มงาน "Audit
  Logging & Accountability" ใน Backend Service, Data Flow Diagram ทั้งสอง journey แสดงขั้นตอนบันทึก
  audit log ก่อนเข้าถึงข้อมูลจริงเสมอ
- [[api-spec]]: มี Operation ร่วม "บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)" ระบุ fail-safe
  (ยกเลิก operation ถ้าบันทึกไม่สำเร็จ) และคุณสมบัติ append-only/immutable ชัดเจน
- [[db-spec]]: entity AuditLogRecord ระบุ attribute ครบ (ผู้ใช้, ผู้ป่วย, การดำเนินการ, เวลา, คำขอสิทธิที่
  เกี่ยวข้อง) พร้อมหมายเหตุเรื่อง immutability
- `detailed-design/`: ยืนยันแล้วว่า [[patient-ncd-diagnosis-lab-history]] และ
  [[complication-risk-analysis-alert]] ถูกแก้ไขให้มีขั้นตอน `[Audit Logging]` ก่อนอ่าน
  Patient/NcdDiagnosis/LabResult/ComplicationRiskThreshold จริงเสมอ พร้อม edge case "บันทึก Audit Log
  ไม่สำเร็จ" ครบทั้งสองไฟล์; [[pdpa-data-protection-compliance]] ครอบคลุม Operation 4/5 เพิ่มเติม;
  [[patient-search-selection]] (Operation 0) ไม่มีขั้นตอนนี้อย่างถูกต้องตามเจตนาของ architecture เพราะ
  ยังไม่มีการระบุ/ตรวจสอบสิทธิ์ระดับรายผู้ป่วย (ตัว trigger การบันทึก) ในขั้นตอนนี้

**ตรวจสอบรอบที่สิบเอ็ด (2026-09-28 — ผลกระทบของ FR-18/Operation 18):** [[api-spec]] Operation 18
(Technical Binding) และ [[patient-search-selection]] (หัวข้อ Operation 18 + ตาราง Operation↔Entity
แถวที่ 5) ระบุตรงกันชัดเจนว่า Operation 18 **อ่าน `labResults` รายบุคคลของผู้ป่วยจริงตรงจาก Client โดย
ไม่ผ่าน Cloud Function และไม่มีการบันทึก audit log ฝั่งเซิร์ฟเวอร์เลยแม้แต่รายการเดียว** ต่างจาก
Operation 1-6/16 ที่มี audit log แบบ fail-safe ครบทุกตัว และต่างจาก Operation 0/17 ที่ไม่แตะข้อมูล
ผู้ป่วยรายบุคคลจึงไม่ต้องมี audit log ตามเจตนาเดิม — นี่คือช่องทางใหม่ที่เข้าถึงข้อมูลผู้ป่วยรายบุคคลโดย
ไม่ทิ้งร่องรอยใดๆ เลย [[architecture]] (ตาราง Mapping NFR แถว NFR-06) และ [[db-spec]] (ประเด็นรอตัดสินใจ)
บันทึกช่องว่างนี้ไว้ชัดเจนพร้อม target design (ย้ายเป็น Cloud Function `computeHba1cVisitSummary` เมื่อ
อยู่แพ็กเกจ Blaze) แต่การบันทึกไว้ไม่ได้ทำให้ NFR-06 "รองรับแล้ว" สำหรับเส้นทางนี้ — **สรุป: NFR-06
ลดสถานะจาก "รองรับแล้ว" เป็น "รองรับบางส่วน (Partial)"** เฉพาะเพราะ Operation 18 เท่านั้น (Operation
0-6/16 ยังคงรองรับครบเหมือนเดิม ไม่มีการถดถอยในส่วนอื่น)

### NFR-07 — PDPA / Data Subject Rights

- [[architecture]]: กลุ่มงาน "Data Subject Rights & Retention Management" ใน Backend Service และ
  Journey ที่สองใน Data Flow Diagram ครอบคลุมคำขอสิทธิทั้ง 5 ประเภท
- [[api-spec]]: Operation 4 ระบุ input/output/กฎทางธุรกิจ/กรณี error ครบทั้ง 5 ประเภทคำขอ (เข้าถึง/
  สำเนา/แก้ไข/ลบ/คัดค้าน) และเชื่อมโยงกับ Operation 0 (ค้นหาผู้ป่วย), NFR-02/NFR-03 (access control),
  NFR-05 (retention เมื่อขอลบ), NFR-06 (audit logging)
- [[db-spec]]: entity DataSubjectRequest ระบุโครงสร้างครบ (ประเภทคำขอ, สถานะคำขอ, วันที่ยื่น/เสร็จสิ้น)
- `detailed-design/`: [[pdpa-data-protection-compliance]] Sequence Diagram 1 ครอบคลุมทุกเส้นทาง (ผ่าน/
  ไม่ผ่านสิทธิ์, input ไม่ถูกต้อง, บันทึก audit log ไม่สำเร็จ, แต่ละประเภทคำขอ) พร้อม State Diagram
  ของสถานะคำขอ และตาราง Edge Case ครบ
- สรุป: รองรับแล้วครบทุกชั้นเอกสารในระดับ logical — กระบวนการยืนยันตัวตนผู้ยื่นคำขอจริงเป็นประเด็นเชิง
  องค์กรที่ถูกบันทึกไว้อย่างชัดเจนว่ารอการยืนยันจากผู้ใช้ ไม่ใช่ gap ของเอกสารเชิงเทคนิค

### NFR-08 — PDPA / Breach Notification Support

- [[architecture]]: Audit Log Store ให้บริการ audit trail แก่ Backend Service เพื่อสนับสนุนการสืบสวน/
  แจ้งเหตุละเมิด ตามที่ระบุในหัวข้อ Cross-cutting และ Data Flow Diagram Journey ที่สอง
- [[api-spec]]: Operation 5 "สืบค้นบันทึกการเข้าถึงข้อมูล (Audit Trail Retrieval)" ระบุ input (ผู้ป่วย/
  ช่วงเวลา/ผู้ใช้ — ทั้งหมดไม่บังคับ), output, กฎทางธุรกิจ (รวมถึงต้องบันทึก audit log การเรียก
  operation นี้เองด้วย) และกรณี error ครบ
- [[db-spec]]: AuditLogRecord ระบุว่าใช้สืบค้น audit trail ได้ตาม NFR-08 โดยตรง
- `detailed-design/`: [[pdpa-data-protection-compliance]] Sequence Diagram 2 ครอบคลุมทั้งเส้นทางไม่ระบุ
  ผู้ป่วยและระบุผู้ป่วย พร้อม edge case (ไม่มีสิทธิ์, ไม่มี PatientAssignment, ช่วงเวลาไม่ถูกต้อง, ไม่พบ
  ข้อมูล, บันทึก audit log ไม่สำเร็จ)
- สรุป: รองรับแล้วครบทุกชั้นเอกสารในระดับ logical — กรอบเวลาที่กฎหมายกำหนดจริงยังไม่ถูกระบุในเอกสาร
  ต้นทาง แต่ไม่กระทบความสมบูรณ์ของการออกแบบระดับ logical ที่มีอยู่แล้ว

### NFR-09 — Performance < 2 วินาที

- [[architecture]]: ตาราง Mapping NFR ระบุ Client + Backend Service + Primary Data Store เป็นผู้
  รับผิดชอบร่วมกัน กลไกจริง (Firestore composite index เท่านั้น ไม่มี caching layer เพิ่มเติมโดยเจตนา)
  ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 9
- [[api-spec]]: หัวข้อ Cross-cutting ระบุว่าไม่มี operation ใหม่ ครอบคลุม Operation 0-3 ที่ผู้ใช้รอผล
  โดยตรง แต่ละ operation อ้างอิง composite index ของตนเองใน [[db-spec]]
- [[db-spec]]: ทุก entity ที่ถูก query บ่อย (`patientAssignments`, `ncdDiagnoses`, `labResults`,
  `complicationRiskThresholds`, `complicationRiskAssessments`) มี composite index ระบุไว้ครบตาม query
  pattern จริงของแต่ละ operation
- `detailed-design/`: [[patient-search-selection]] และ [[complication-risk-analysis-alert]] อ้างอิง
  index เดียวกันกับ db-spec ในหัวข้อ Cross-cutting NFR-09–16 ตรงกัน
- สรุป: รองรับแล้วครบทุกชั้นเอกสาร ไม่มีช่องว่าง — trade-off (ไม่มี caching, ทุก request อ่าน Firestore
  ทุกครั้ง) ถูกบันทึกไว้อย่างมีเจตนาพร้อมขั้นตอนถัดไปถ้าพบว่าไม่พอ (in-memory caching)

### NFR-10 — Availability

- [[architecture]]: ตาราง Mapping NFR ระบุว่าเป็นคุณสมบัติ cross-cutting ระดับ infrastructure ผูกกับ
  SLA ของ Firebase/Google Cloud services ที่ `[[technology-stack]]` เลือกใช้ทั้งหมด ไม่ต้องออกแบบ
  redundancy/failover เพิ่มเติมเอง
- [[api-spec]]/[[db-spec]]/`detailed-design/`: ไม่มีผลกระทบต่อ operation/entity ใด ตามที่ [[api-spec]]
  ระบุไว้ชัดเจนแล้วในหัวข้อ Cross-cutting
- สรุป: รองรับแล้ว ไม่มีช่องว่าง — เป็นการออกแบบที่มีเจตนาว่าไม่ต้องมี component/operation ใหม่

### NFR-11 — Clinical Safety Validation

- [[architecture]]: ตาราง Mapping NFR และหัวข้อ Backend Service (Risk Rule Engine) ระบุชัดว่าเป็น
  manual approval gate ในกระบวนการ deployment ไม่ใช่ behavior ที่ต้อง implement เป็นโค้ด/UI
- [[db-spec]]: entity ComplicationRiskThreshold มีหมายเหตุเฉพาะอธิบายเหตุผลที่ไม่เพิ่ม attribute ใหม่
  (เช่น "ผู้ยืนยัน"/"วันที่ยืนยัน") สำหรับข้อนี้ พร้อมข้อเสนอแนะถ้าต้องการบันทึกหลักฐานในอนาคต
- `detailed-design/`: [[complication-risk-analysis-alert]] มี edge case "threshold/rule ยังไม่ผ่านการ
  ยืนยัน" ระบุว่าไม่ deploy โค้ดที่มี rule ใหม่จนกว่าจะผ่านการยืนยัน
- สรุป: รองรับแล้วครบทุกชั้นเอกสารในระดับที่เหมาะสมกับธรรมชาติของข้อกำหนด (กระบวนการองค์กร) ไม่มีช่องว่าง
  เชิงออกแบบเอกสารเทคนิค — ค่า threshold จริงยังรอแพทย์ผู้เชี่ยวชาญยืนยัน (ไม่ใช่ gap ของเอกสาร)

### NFR-12 — Session Timeout

- [[architecture]]: หัวข้อ Client และ Backend Service (Access Control) อธิบายกลไก client custom
  inactivity timer อย่างละเอียด พร้อม**เน้นย้ำความเสี่ยงด้านความปลอดภัย** (ไม่มี server-side token
  revocation, token ยังใช้ได้ต่อจนถึง ~1 ชม. ซึ่งนานกว่า 30 นาทีที่กำหนดเกือบ 2 เท่า) ครบถ้วนในหลายจุด
  ของเอกสาร
- [[api-spec]]: Operation ร่วม Access Control ข้อ 4 อธิบายความสัมพันธ์กับ NFR-12 และยืนยันว่าไม่มี
  กลไกเซิร์ฟเวอร์เพิ่มเติมเพื่อเพิกถอน token ก่อนหมดอายุธรรมชาติ
- [[db-spec]]: หัวข้อ User มีหมายเหตุอธิบายเหตุผลที่ไม่มี field `lastActivityAt` (ตัดสินใจไม่เลือกแล้ว
  เพราะกระทบ NFR-09)
- `detailed-design/`: [[patient-search-selection]] มี `loop` block ตรวจสอบ inactivity ใน Sequence
  Diagram จริง พร้อม edge case "ถูก auto-logout แล้วส่งคำขอถัดไป"; [[complication-risk-analysis-alert]]
  อ้างอิงจุดเดียวกัน
- สรุป: **รองรับแล้ว (Addressed)** ในแง่การออกแบบครบทุกชั้นเอกสารตรงกัน — แต่มีความเสี่ยงด้านความ
  ปลอดภัยที่สำคัญซึ่งถูกบันทึกไว้อย่างเด่นชัดแล้วว่าผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อในรอบ MVP นี้
  ไม่ใช่ gap ที่ตกหล่นในเอกสาร แต่เป็น mitigation ที่ควรทำก่อนใช้ข้อมูลผู้ป่วยจริง (เพิ่ม server-side
  token revocation)

### NFR-13 — Accessibility

- [[architecture]]: ตาราง Mapping NFR ระบุ Client เป็นผู้รับผิดชอบ กลไกจริง (WCAG 2.1 AA + Heroicons +
  Lighthouse Accessibility Audit) ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 11
- [[db-spec]]: field `ระดับความเสี่ยงที่ประเมินได้` ใน RiskFinding เป็นค่าข้อความที่กำหนดไว้ล่วงหน้า
  (ไม่ใช่รหัสสี) โดยเจตนาเพื่อให้ Client แสดงคู่กับสี/ไอคอนได้ทันที
- `detailed-design/`: [[complication-risk-analysis-alert]] อธิบายกลไกจริงและ mapping กับ field นี้
  ครบในหัวข้อ Cross-cutting และหมายเหตุการ Implement
- สรุป: รองรับแล้วครบทุกชั้นเอกสาร ไม่มีช่องว่าง — รายละเอียด mapping สี/ไอคอนเฉพาะจุดเป็นหน้าที่ของ
  [[DESIGN]] ต่อไปตามที่ระบุไว้แล้ว ไม่ใช่ gap ของชั้นเอกสารเทคนิคนี้

### NFR-14 — Security Rules Verification

- [[architecture]]: ตาราง Mapping NFR ระบุ Firebase Emulator Suite เป็นกลไกจริง ครอบคลุม collection
  `patients`, `patientAssignments`, `auditLogRecords` ฯลฯ
- [[db-spec]]: หัวข้อคุณสมบัติร่วม "Security Rules Verification (NFR-14)" ระบุรายการกรณีทดสอบบังคับ
  (ไม่มี assignment, assignment บางส่วน, บัญชีถูกระงับ, ไม่มี custom claims ที่ถูกต้อง) ครบ
- `detailed-design/`: [[patient-search-selection]], [[complication-risk-analysis-alert]] อ้างอิงกรณี
  ทดสอบเดียวกันตรงกัน; [[user-authentication-email-password]] เพิ่มกรณีทดสอบใหม่เฉพาะฟีเจอร์นี้ (บัญชี
  ที่เพิ่งสมัครยังไม่มี role/isActive=false) สอดคล้องกับที่ db-spec ระบุไว้แล้ว
- สรุป (ก่อนรอบที่สิบเอ็ด): รองรับแล้วครบทุกชั้นเอกสาร รวมไฟล์ Authentication ใหม่ ไม่มีช่องว่าง

**ตรวจสอบรอบที่สิบเอ็ด (2026-09-28 — ผลกระทบของ FR-18/Operation 18/entity `Hba1cVisitSummary`):**
[[db-spec]] เพิ่มแถวใหม่ `hba1cVisitSummaries` ในตาราง "Security Rules Verification (NFR-14)" แล้วจริง
แต่ระบุไว้เองอย่างตรงไปตรงมาว่า **"ยังไม่มี automated test เฉพาะสำหรับ collection นี้"** และกฎที่ใช้งาน
จริงในปัจจุบัน (`firestore.rules` ที่ root เปิดกว้างทั้งฐานข้อมูล `allow read, write: if request.auth !=
null`) **ไม่ตรงกับกฎที่ตั้งใจออกแบบไว้แม้แต่ในสถานะชั่วคราว** (ตั้งใจไว้ว่าควรเป็น
`allow read, write: if false` เหมือน `labResults` เพื่อบังคับผ่าน Cloud Function ในอนาคต) — กล่าวคือมี
ทั้ง (1) กรณีทดสอบที่รู้ว่าต้องมีแต่ยังไม่ถูกเขียน และ (2) กฎจริงที่หลวมกว่าที่ตั้งใจไว้แม้ในช่วงเปลี่ยน
ผ่าน พร้อมกัน — **สรุป: NFR-14 ลดสถานะจาก "รองรับแล้ว" เป็น "รองรับบางส่วน (Partial)"** เฉพาะสำหรับ
collection `hba1cVisitSummaries` เท่านั้น (collection อื่นทั้งหมด — `users`, `patients`, `ncdDiagnoses`,
`labResults`, `auditLogRecords` ฯลฯ — ยังคงมีกรณีทดสอบครบเหมือนเดิม ไม่มีการถดถอย)

### NFR-15 — Browser/Device Compatibility

- [[architecture]]: ตาราง Mapping NFR ระบุ browserslist config ที่ตัดสินใจแล้วใน `[[technology-stack]]`
  decision area 12 เป็นเรื่องของ Client build config ล้วนๆ
- [[api-spec]]/[[db-spec]]: ไม่กระทบ operation/entity ตามที่ [[api-spec]] ระบุไว้ชัดเจนแล้ว
- `detailed-design/`: [[complication-risk-analysis-alert]] ระบุว่าหน้าจอ flag ความเสี่ยงต้องแสดงผล
  ถูกต้องบน browser หลักเช่นเดียวกับทุกหน้าจอในระบบ
- สรุป: รองรับแล้ว ไม่มีช่องว่าง — เป็นเรื่องของ Client implementation ล้วนๆ ตามที่ออกแบบไว้อย่างมีเจตนา

### NFR-16 — Interoperability (future, Won't have เฟสนี้)

- [[architecture]]: ตาราง Mapping NFR ยืนยันว่าเป็น Won't have ของเฟสนี้ ไม่มีผลต่อการออกแบบ component
  จนกว่าจะเชื่อมต่อ HOSxP จริงในอนาคต
- [[api-spec]]/[[db-spec]]/`detailed-design/`: ไม่มีการอ้างอิงเพิ่มเติม สอดคล้องกับสถานะ Won't have
- สรุป: รองรับแล้วในความหมายว่าถูกจัดสถานะ Won't have อย่างถูกต้องและสม่ำเสมอทุกชั้นเอกสาร ไม่มีช่องว่าง

### NFR-17 — Security / Password Policy

**ตรวจสอบรอบที่แปด (2026-09-24) — ประเมินใหม่หลัง `[[technology-stack]]` เพิ่ม decision area 13:**

- [[technology-stack]]: decision area 13 ตัดสินใจกลไกจริงแบบ hybrid — **regex ในโค้ด Cloud Function
  `signUpUser`** (ความยาว ≥ 8 ตัวอักษร มีตัวอักษรและตัวเลขอย่างน้อยอย่างละ 1 ตัว) สำหรับ Operation 8 และ
  **Google Cloud Identity Platform password policy เป็น backstop ฝั่งเซิร์ฟเวอร์** สำหรับ Operation 9
  (`confirmPasswordReset` ที่ไม่ผ่าน Cloud Function) พร้อมเหตุผลที่ต้องใช้ 2 กลไกและผลกระทบต่อ
  project setup (อัปเกรดเป็น Identity Platform) ที่บันทึกไว้ชัดเจน
- [[architecture]]: หัวข้อ Client/Backend Service ของฟีเจอร์ที่ 6 และ "ประเด็นรอตัดสินใจ" ท้ายเอกสาร
  ถูกแก้ไขให้ระบุกลไกที่ตัดสินใจแล้วนี้ตรงกัน ไม่มีข้อความ "ยังไม่ตัดสินใจ" หลงเหลืออยู่อีกต่อไป
  (ยืนยันด้วยการอ่านทั้งไฟล์ใหม่ในรอบนี้)
- [[api-spec]]: Technical Binding ของ Operation 8 ระบุ regex ในโค้ดเดียวกัน อ้างอิง decision area 13
  ตรงๆ; Operation 9 ระบุว่าใช้ Identity Platform password policy เป็น backstop แทน regex เพราะไม่มี
  Cloud Function คั่นกลางในลำดับนี้ — สอดคล้องกับเหตุผลใน technology-stack ทุกประการ
- [[db-spec]]: attribute `รหัสผ่านที่จัดเก็บ` ใน User ไม่เปลี่ยนแปลง (ยังคงจัดเก็บโดย Firebase
  Authentication) — ไม่กระทบสถานะ
- `detailed-design/`: [[user-authentication-email-password]] sequence diagram ของ Operation 8/9 และ
  หัวข้อ "หมายเหตุการ Implement" อ้างอิงกลไก 2 จุดนี้ตรงกันครบ ไม่มีข้อความ "ยังไม่ระบุว่าเลือกแบบใด"
  หลงเหลืออยู่
- สรุป: **เปลี่ยนจาก "รองรับบางส่วน (Partial)" เป็น "รองรับแล้ว (Addressed)"** — ช่องว่างที่เคยพบใน
  รอบที่เจ็ด (กลไกทางเทคนิคจริงยังไม่ถูกตัดสินใจ) ถูกปิดแล้วอย่างสมบูรณ์และสอดคล้องกันครบทุกชั้นเอกสาร
  ไม่มีช่องว่างเหลืออยู่

### NFR-18 — Security / Account Enumeration Prevention

**ตรวจสอบรอบที่แปด (2026-09-24) — ประเมินใหม่หลัง `[[technology-stack]]` เพิ่ม decision area 14:**

- [[technology-stack]]: decision area 14 ตัดสินใจเปิด **Firebase "Email Enumeration Protection"**
  ระดับโปรเจกต์ เป็นกลไกเดียวสำหรับปิดช่องว่างของ Operation 7 (จุดเดียวที่ไม่มี Cloud Function คั่นกลาง
  คอยแปลง error code) โดยผู้ใช้ยืนยัน**ไม่เพิ่ม fixed minimum delay/normalize เวลาตอบสนองเพิ่มเติม** —
  หัวข้อ "ความเสี่ยงเพิ่มเติม" ท้ายเอกสารบันทึก timing side-channel ที่ยังไม่ปิดไว้อย่างเด่นชัดพร้อม
  คำแนะนำ mitigation ก่อนใช้ข้อมูลผู้ป่วยจริง
- [[architecture]]: หัวข้อ Client/Backend Service ฟีเจอร์ที่ 6, ตาราง Mapping NFR และ "ประเด็นรอ
  ตัดสินใจ" ท้ายเอกสาร ถูกแก้ไขให้ระบุกลไกนี้ตรงกัน พร้อมคงคำเตือนเรื่อง timing side-channel ที่ยังไม่ปิด
  ไว้อย่างชัดเจนเช่นเดียวกับ technology-stack — ไม่มีข้อความ "ยังไม่ตัดสินใจ" หลงเหลืออยู่
- [[api-spec]]: Cross-cutting Authentication และ Technical Binding ของ Operation 7/8/9 อ้างอิงกลไก
  เดียวกันนี้ตรงกัน (Operation 8/9 ใช้ข้อความ generic ที่ Cloud Function ควบคุมเองอยู่แล้วโดยไม่ต้องพึ่ง
  setting นี้; Operation 7 พึ่ง Email Enumeration Protection เพราะไม่มี Cloud Function คั่นกลาง)
- [[db-spec]]: ไม่มี attribute ใหม่ที่เกี่ยวข้องโดยตรง (เป็นเรื่องของ behavior ของ operation ไม่ใช่
  data model) — ไม่กระทบสถานะ
- `detailed-design/`: [[user-authentication-email-password]] sequence diagram ของ Operation 7 อ้างอิง
  "Email Enumeration Protection เปิดใช้" ตรงกัน และยังคงระบุ "timing side-channel ที่ยังไม่ปิด" ไว้ใน
  Note ของ sequence diagram เดียวกัน — สอดคล้องครบ
- สรุป: **เปลี่ยนจาก "รองรับบางส่วน (Partial)" เป็น "รองรับแล้ว (Addressed — มีความเสี่ยงคงเหลือที่
  บันทึกไว้ชัดเจน)"** — กลไกทางเทคนิคหลัก (error code ที่แยกแยะได้) ถูกปิดแล้วด้วยการตัดสินใจที่ชัดเจน
  ส่วนความเสี่ยง timing side-channel ที่ยังไม่ปิดเป็นการตัดสินใจที่ผู้ใช้รับทราบและยืนยันให้ดำเนินการ
  ต่อแล้วอย่างมีเจตนา (บันทึกไว้สอดคล้องกันทุกชั้นเอกสาร) เช่นเดียวกับรูปแบบที่ใช้ประเมิน NFR-12 ไม่ใช่
  gap ที่ตกหล่นของการออกแบบเอกสารเชิงเทคนิค

### NFR-19 — Security / Access Control ข้อยกเว้นสำหรับบทบาท Admin

**ตรวจสอบรอบที่เก้า (2026-09-24) — NFR ใหม่จากฟีเจอร์ที่ 7 (Admin):**

- [[architecture]]: ตาราง Mapping NFR แถว NFR-19 ระบุ Backend Service (Access Control + การจัดการบัญชี
  ผู้ใช้และสิทธิ์) เป็นผู้รับผิดชอบ พร้อมเงื่อนไขครบ (ตรวจ `role = admin` ก่อนข้ามการตรวจสอบระดับราย
  ผู้ป่วย, ยังคงตรวจ role/isActive/emailVerified ตามปกติ, ไม่มีสิทธิ์แก้ไขข้อมูลทางคลินิก/Operation 16)
  — หัวข้อ "ประเด็นรอตัดสินใจ" ระบุว่า "ยังไม่มี decision area ใน technology-stack ระบุไว้โดยตรง" ซึ่ง
  **ล้าสมัยกว่าที่ api-spec/db-spec ตัดสินใจไปแล้วจริง** (ดูข้อสังเกตด้านล่าง)
- [[api-spec]]: Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ข้อ 2 มีอนุข้อ "ข้อยกเว้นสำหรับ
  บทบาท Admin (NFR-19)" ระบุขอบเขตที่จำกัดและชัดเจนมาก: ใช้ได้เฉพาะเมื่อเรียกผ่าน Operation 1, 2, 3
  หรือ 15 เท่านั้น, ยังคง**ไม่มีสิทธิ์**เรียก Operation 16/4/5/8/9, และต้องเรียก Audit Logging (NFR-20)
  ก่อนคืนข้อมูลเสมอ — Operation 15 (`listAllPatientsForAdmin`) ก็ระบุไว้ครบว่าไม่กรองด้วย
  PatientAssignment
- [[db-spec]]: `User.บทบาท` เพิ่มค่าที่เป็นไปได้ `"admin"` และหัวข้อ Security Rules Verification (NFR-14)
  เพิ่มกรณีทดสอบใหม่ที่ครอบคลุม NFR-19 โดยตรง (Admin ต้องเข้าถึง Operation 1/2/3/15/16 ได้สำเร็จโดยไม่มี
  PatientAssignment ต่างจากแพทย์/พยาบาลที่ต้องถูกปฏิเสธในกรณีเดียวกัน)
- `detailed-design/`: [[admin-role-account-management]] Sequence Diagram 4 แสดงลำดับเต็ม (ตรวจ role,
  ข้าม patient-level check, บันทึก audit log fail-safe, แล้วจึงอ่านข้อมูล) พร้อมตาราง Operation↔Entity
  และ edge case ครบ (รวมกรณี Admin พยายามเรียก Operation 16/4/5/8/9 ที่ต้องถูกปฏิเสธ);
  [[patient-ncd-diagnosis-lab-history]] และ [[complication-risk-analysis-alert]] ถูกแก้ไขให้ระบุข้อ
  ยกเว้นนี้ในตาราง Operation↔Entity และ edge case ตรงกัน; [[patient-search-selection]] ยืนยันว่า Admin
  ไม่เรียก Operation 0 (ใช้ Operation 15 แทน) จึงไม่กระทบเอกสารนั้นเลย
- **ข้อสังเกต (ไม่บล็อกสถานะ Addressed):** [[architecture]] หัวข้อ "ประเด็นรอตัดสินใจ" ยังคงมีข้อความว่า
  "กลไกจริงของ FR-15/NFR-19 ... ยังไม่ระบุว่าจะเขียนเป็น shared helper module เดียวกัน ... หรือเป็น
  logic แยกต่างหาก" แต่ [[admin-role-account-management]] หัวข้อ "หมายเหตุการ Implement" ได้ระบุคำตอบ
  ที่ชัดเจนแล้วว่า "shared helper module เดียวกับที่ Operation 1-6 ใช้" — สรุปได้ว่า architecture.md
  ยังไม่ถูกปรับปรุงให้ตรงกับข้อสรุปล่าสุดของ api-spec/db-spec/detailed-design
- สรุป: **รองรับแล้ว (Addressed)** — ออกแบบครบทุกชั้นเอกสารสอดคล้องกัน มีเพียงข้อความ "ประเด็นรอตัดสินใจ"
  ใน architecture.md ที่ล้าสมัย ควรปรับปรุงด้วย `sync-architecture` (ไม่บังคับเพราะไม่กระทบ behavior)

### NFR-20 — PDPA / Audit Log แบบ fail-safe สำหรับการเข้าถึงข้อมูลผู้ป่วยของ Admin

**ตรวจสอบรอบที่เก้า (2026-09-24) — NFR ใหม่จากฟีเจอร์ที่ 7 (Admin):**

- [[architecture]]: ตาราง Mapping NFR แถว NFR-20 ระบุ Backend Service (Audit Logging & Accountability +
  การจัดการบัญชีผู้ใช้และสิทธิ์) + Audit Log Store เป็นผู้รับผิดชอบ ระบุ fail-safe รูปแบบเดียวกับ NFR-06
  ชัดเจน (ปฏิเสธการเข้าถึงทันทีถ้าบันทึกไม่สำเร็จ)
- [[api-spec]]: Operation ร่วม "บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย" เพิ่ม field `เข้าถึงในฐานะ Admin
  หรือไม่` และระบุว่าต้องตั้งเป็นจริงเสมอเมื่อ Operation 1/2/3/15 ถูกเรียกผ่านข้อยกเว้น NFR-19 — Error
  code เขียนไม่สำเร็จเหมือน NFR-06 ทุกประการ
- [[db-spec]]: `AuditLogRecord` เพิ่ม attribute `isAdminAccess` (boolean, optional, default false) โดย
  ยืนยันชัดเจนว่าใช้ collection `auditLogRecords` เดียวกับ NFR-06 (ไม่แยก collection ใหม่ — คำตอบยืนยัน
  จากผู้ใช้ผ่าน `NEEDS_USER_INPUT`) Security Rules ของ `auditLogRecords` ไม่เปลี่ยนแปลง
  (`allow read, write: if false;` สำหรับ Client ทั้งหมด)
- `detailed-design/`: [[admin-role-account-management]] Sequence Diagram 4 แสดง fail-safe เต็มรูปแบบ
  (บันทึก audit log ก่อน แล้วค่อยอ่านข้อมูลจริง, ถ้าบันทึกไม่สำเร็จปฏิเสธการเข้าถึงทันที);
  [[pdpa-data-protection-compliance]] ระบุว่า Operation 5 (audit trail retrieval) อาจคืนระเบียนที่มี
  `isAdminAccess = true` ปะปนอยู่ด้วย — ไม่กระทบ sequence diagram เดิมของ Operation 4/5;
  [[patient-ncd-diagnosis-lab-history]]/[[complication-risk-analysis-alert]] ระบุการตั้ง
  `isAdminAccess = true` ในหัวข้อหมายเหตุการ Implement ตรงกัน
- **ข้อสังเกต (ไม่บล็อกสถานะ Addressed ในรอบที่เก้า):** เช่นเดียวกับ NFR-19 — [[architecture]] หัวข้อ
  "ประเด็นรอตัดสินใจ" ยังคงเขียนว่า "กลไกจริงของ NFR-20 ... ยังไม่ระบุว่าจะใช้ collection เดียวกับ NFR-06
  ... หรือแยก collection ใหม่" ทั้งที่ [[db-spec]] ระบุคำตอบที่ยืนยันแล้วชัดเจนว่าใช้ collection เดิม
- สรุป (ก่อนรอบที่สิบเอ็ด): **รองรับแล้ว (Addressed)** — กลไก fail-safe และโครงสร้างข้อมูลสอดคล้องกันครบ
  ทุกชั้นเอกสาร มีเพียงข้อความ "ประเด็นรอตัดสินใจ" ใน architecture.md ที่ล้าสมัย ควรปรับปรุงด้วย
  `sync-architecture` (ไม่บังคับ)

**ตรวจสอบรอบที่สิบเอ็ด (2026-09-28 — ผลกระทบของ FR-18/Operation 18):** Operation 18 เปิดให้**ทุกบทบาท
กดได้เหมือนกันรวม Admin** (ต่างจาก Operation 16 ที่จำกัดเฉพาะแพทย์/พยาบาล) แต่เมื่อ Admin กดปุ่มนี้
**ไม่มีการบันทึก `isAdminAccess`/audit log ใดๆ เลย เพราะ Operation 18 ไม่ผ่าน Cloud Function** —
[[architecture]] (ตาราง Mapping NFR แถว NFR-20) และ [[db-spec]] (แถว NFR-20 ในตาราง NFR-14 ของ
`hba1cVisitSummaries`) ระบุตรงกันชัดเจนว่าเป็น "ข้อยกเว้นเดียวกับ NFR-06" — สอดคล้องกันทั้งสองเอกสาร ไม่มี
ข้อขัดแย้ง แต่ยังคงเป็นช่องว่างจริงของการเข้าถึงข้อมูลผู้ป่วยโดย Admin ที่ไม่ทิ้งร่องรอยเลย ไม่ต่างจาก
เหตุผลที่ NFR-06 ถูกลดสถานะ — **สรุป: NFR-20 ลดสถานะจาก "รองรับแล้ว" เป็น "รองรับบางส่วน (Partial)"**
เฉพาะเพราะ Operation 18 เท่านั้น (Operation 1/2/3/15 ที่ Admin ใช้ปกติยังคงมี fail-safe audit log ครบ
เหมือนเดิม ไม่มีการถดถอยในส่วนอื่น)

### NFR-21 — PDPA / Data Minimization for External AI Service

**ตรวจสอบรอบที่สิบเอ็ด (2026-09-28 — ผลกระทบของ FR-18/Operation 18, ต่อจากที่เคยประเมินสำหรับ FR-17 ใน
รอบที่แปดและเก้า):**

- [[architecture]]: ตาราง Mapping NFR แถว NFR-21 ขยายคำอธิบายให้ครอบคลุม FR-18 แล้ว ระบุชัดว่าข้อมูลที่
  ส่งให้ AI จำกัดเฉพาะจำนวนครั้งตรวจ/ระยะห่างเป็นวันที่คำนวณแล้ว (FR-18) เพิ่มเติมจาก HN ที่พิมพ์/สถานะ
  ผลลัพธ์ (FR-17) — component "บริการ AI ภายนอก (External AI Service)" เดิมถูก reuse ไม่มี component ใหม่
- [[api-spec]]: Operation 18 ระบุกฎทางธุรกิจข้อ 3 ชัดเจนว่า "ส่งให้ AI ได้เฉพาะจำนวนครั้งตรวจและระยะห่าง
  เป็นวันของแต่ละคู่ (หรือค่าต่ำสุด/เฉลี่ย/สูงสุดที่คำนวณแล้ว) เท่านั้น ห้ามส่ง HN, ชื่อ-นามสกุลผู้ป่วย,
  วันที่ตรวจจริง หรือค่าผล HbA1c ใดๆ เด็ดขาด" ตรงกับ [[db-spec]]
- [[db-spec]]: หัวข้อคุณสมบัติร่วม NFR-21 เพิ่มหัวข้อย่อย "ส่วนขยาย FR-18" ระบุรายการข้อมูลที่ส่งได้/ห้ามส่ง
  ตรงกับ [[api-spec]] ทุกประการ พร้อมระบุว่า Operation 18 ต่างจาก Operation 17 ตรงที่บันทึกผลลง Firestore
  จริง (`hba1cVisitSummaries`) — เป็นข้อยกเว้นเดียวที่บันทึกผลลัพธ์ AI ถาวร
- [[patient-search-selection]]: sequence diagram ของ Operation 18 มีขั้นตอน "[จำกัดข้อมูล NFR-21 ขยาย]"
  ระบุชัดว่าห้ามใส่ HN/ชื่อ-นามสกุล/วันที่ตรวจจริง/ค่าผล HbA1c เด็ดขาด พร้อม edge case แถวท้ายตาราง Edge
  Case ที่ครอบคลุมกรณีข้อมูลระบุตัวตนปะปนอยู่ในสิ่งที่ส่งให้ AI
- **ความเสี่ยงที่บันทึกไว้ตรงกันครบทั้ง 4 เอกสาร:** บังคับได้เฉพาะฝั่ง Client เท่านั้น ไม่มี Cloud
  Function ตัวกลางกรอง prompt ซ้ำ (เหตุผลเดียวกับ FR-17 — โปรเจกต์ยังไม่อยู่แพ็กเกจ Blaze)
- สรุป: **คงสถานะ "รองรับแล้ว (Addressed — มีความเสี่ยงเชิงสถาปัตยกรรมที่ผู้ใช้รับทราบและยืนยันให้ดำเนินการ
  ต่อแล้ว)"** เหมือนเดิม เพราะเจตนาหลักของ NFR-21 (ห้ามส่งข้อมูลระบุตัวตนให้ AI ภายนอก) ยังคงทำงานได้จริง
  ที่ชั้น prompt construction ของทั้ง Operation 17 และ 18 แม้ไม่มีชั้นตรวจสอบซ้ำฝั่งเซิร์ฟเวอร์ก็ตาม —
  ต่างจาก NFR-06/NFR-14/NFR-20 ที่ล้มเหลวสมบูรณ์สำหรับ Operation 18 (ไม่มี audit log/automated test เลย)
  NFR-21 ยังมีมาตรการหลักทำงานอยู่จริง จึงไม่ลดสถานะ

### หมายเหตุรวม — ผลกระทบของ FR-18/Operation 18/entity Hba1cVisitSummary ต่อ NFR อื่นทั้งหมด (ตรวจสอบรอบที่สิบเอ็ด 2026-09-28)

ตรวจสอบซ้ำ NFR-01 ถึง NFR-19 ทั้งหมด (ยกเว้น NFR-06/NFR-14/NFR-20/NFR-21 ที่มีผลกระทบโดยตรงตามที่ระบุ
ไว้ข้างต้น) พบว่า**ไม่มี NFR ใดถดถอย**:

- **NFR-02 (Access Control)**: Operation 18 ผ่านการตรวจสอบ role/isActive/email_verified เดียวกับ
  operation อื่นตามที่ [[api-spec]] ระบุ (ทุกบทบาทกดได้เหมือนกันตามเจตนา ไม่ใช่การลดเงื่อนไข) — ไม่ถดถอย
- **NFR-09 (Performance)**: [[architecture]] ระบุ composite index ใหม่สำหรับ query `labResults` ของ
  FR-18 ไว้แล้ว (ดูหัวข้อ "ประเด็นรอตัดสินใจ" ของฟีเจอร์ที่ 3) — ไม่ถดถอย
- **NFR-13 (Accessibility)**: ข้อความ "ข้อมูลประกอบ ไม่ใช่คำแนะนำทางการแพทย์" กำกับผลสรุปจาก AI เสมอ
  ตรงตามหลักการห้ามใช้สีเป็นสัญญาณเดียว (ไม่เกี่ยวกับสีในกรณีนี้ แต่สอดคล้องเจตนาเดียวกัน) — ไม่ถดถอย
- NFR อื่นที่เหลือ (NFR-01, NFR-03–NFR-05, NFR-07–NFR-08, NFR-10–NFR-12, NFR-15–NFR-19) ไม่มีการอ้างอิงถึง
  FR-18/Operation 18 เลยในทั้ง 4 เอกสาร จึงไม่มีผลกระทบ

**สรุปรวมรอบที่สิบเอ็ด: NFR-06, NFR-14, NFR-20 ลดสถานะเป็น Partial เฉพาะเพราะ Operation 18 เท่านั้น
(เป็นช่องว่างที่บันทึกไว้ชัดเจนในทุกเอกสารแล้ว แต่ยังคงเป็นช่องว่างจริงที่ไม่ควรปิดสถานะเป็น Addressed);
NFR-21 คงสถานะ Addressed (พร้อมความเสี่ยงที่บันทึกไว้); NFR อื่นทั้งหมดไม่ถดถอย**

### หมายเหตุรวม — ผลกระทบของการเพิ่มบทบาท Admin (FR-11–FR-15, NFR-19, NFR-20) ต่อ NFR-02/NFR-06/NFR-14 (ตรวจสอบรอบที่เก้า 2026-09-24)

ตรวจสอบซ้ำครบทุกจุดที่ NFR-02 (Access Control), NFR-06 (Audit Log ของแพทย์/พยาบาล) และ NFR-14
(Security Rules Verification) เคยถูกออกแบบไว้ในรอบก่อนหน้า พบว่า:

- **NFR-02**: กลไก role-level + patient-level เดิมของแพทย์/พยาบาลไม่ถูกแก้ไขเลย มีเพียงการเพิ่มค่า
  `role = "admin"` เป็นอีกหนึ่งค่าที่ผ่านการตรวจสอบระดับบทบาทได้ (เหมือนเพิ่มตัวเลือกใหม่ ไม่ใช่การลด
  เงื่อนไขเดิม) และ Admin ใช้ Operation 15 แยกต่างหาก ไม่ยุ่งกับ Operation 0/[[patient-search-selection]]
  ของแพทย์/พยาบาลเลย — ไม่ถดถอย
- **NFR-06**: ทุก sequence diagram fail-safe เดิมของ Operation 1/2/3 (เมื่อผู้เรียกเป็นแพทย์/พยาบาล)
  ไม่ถูกแก้ไขพฤติกรรม มีเพียงการเพิ่ม field `isAdminAccess` แบบ optional (default false) ที่ไม่กระทบ
  ระเบียนเดิมที่เขียนไปแล้วหรือ query pattern เดิม — ไม่ถดถอย
- **NFR-14**: กรณีทดสอบเดิมทั้งหมด (ไม่มี assignment, assignment บางส่วน, บัญชีถูกระงับ,
  emailVerified=false) ยังคงอยู่ครบใน [[db-spec]] ไม่มีการลบ/แก้ไขกรณีทดสอบเดิม มีเพียงการเพิ่มกรณี
  ทดสอบใหม่ 4 ข้อสำหรับ Admin ต่อท้าย — ไม่ถดถอย (มีเพียงข้อสังเกตเรื่อง architecture.md ล้าสมัยตามที่
  ระบุไว้ในหัวข้อ NFR-14/NFR-19/NFR-20 ด้านบน ซึ่งไม่ใช่การถดถอยของการออกแบบเชิงพฤติกรรม)

**สรุป: ไม่มี NFR ใดใน NFR-01–NFR-18 ถดถอยจากการเพิ่มบทบาท Admin** มีเพียงข้อสังเกตเรื่องเอกสาร
`architecture.md` ล้าสมัยกว่าที่ api-spec/db-spec ตัดสินใจไปแล้วจริง ซึ่งควรแก้ไขด้วย `sync-architecture`
แต่ไม่ใช่ gap เชิงพฤติกรรมของระบบ

### หมายเหตุรวม — ผลกระทบของการแก้ไข decision area 7/18 (ยกเลิก Custom Claims) ต่อ NFR อื่น (ตรวจสอบรอบที่แปด 2026-09-24)

`[[technology-stack]]` แก้ไข decision area 7 และเพิ่ม decision area 18 ให้เลิกเก็บ `role`/`isActive`
ใน Custom Claims โดยสิ้นเชิง (เดิมเคยเก็บ) ตรวจสอบแล้วว่า [[architecture]] และ [[db-spec]] ถูกแก้ไขให้
ลบร่องรอยของ "custom claims" เดิมออกครบทุกจุดที่เคยอ้างถึง และแทนที่ด้วย "อ่าน role/isActive จาก
Firestore `users/{uid}` โดยตรงทุกครั้ง" อย่างสอดคล้องกัน — โดยเฉพาะรายการกรณีทดสอบของ **NFR-14** ที่เคย
มีเคส "ไม่มี custom claims ที่ถูกต้อง" ถูกแก้ไขให้ตรงกับสถาปัตยกรรมใหม่ (ไม่มี custom claims ให้ตรวจ
อีกต่อไป) และเพิ่มเคสใหม่ "`email_verified=false`" แทน (ตาม decision area 19) ครบทั้ง [[db-spec]] และ
[[architecture]] **ผลคือ NFR-01 ถึง NFR-16 ไม่มีตัวใดถดถอยจากการแก้ไขนี้** — เป็นการทำให้เอกสารสอดคล้อง
กับสถาปัตยกรรมจริงมากขึ้น ไม่ใช่การลดทอนการออกแบบ

### หมายเหตุรวม — ผลกระทบของการแก้ไข FR-05/FR-06 ต่อ NFR-03 ถึง NFR-08 (ตรวจสอบรอบที่สาม 2026-09-21)

NFR-03 ถึง NFR-08 (หมวด PDPA) ไม่มีการอ้างอิงถึงรายละเอียดวิธีค้นหาผู้ป่วย (ชื่อ/คำค้นอิสระ หรือ HN)
โดยตรงในเอกสารใดๆ — ทั้งหมดอ้างอิง Operation 0 ("ค้นหา/เลือกผู้ป่วย") แบบ black-box ผ่าน
[[patient-search-selection]] เท่านั้น (เช่น Operation 4 ใน [[api-spec]] ระบุว่า "ใช้ Operation 0
ค้นหา/เลือกผู้ป่วยเดียวกันก่อนเสมอ" โดยไม่ผูกกับวิธีค้นหาที่แน่นอน) ตรวจสอบแล้วว่าการเปลี่ยน Operation 0
จากคำค้นอิสระเป็น HN-only (FR-06) ไม่กระทบ logic ของ NFR-03–NFR-08 แต่อย่างใด เพราะทั้งหมดเริ่มทำงาน
*หลัง* ผู้ป่วยถูกเลือกแล้วเสมอ — **ไม่พบการถดถอยของ NFR ใดในหมวดนี้**

### หมายเหตุรวม — ผลกระทบของการแก้ไข NFR-02 ต่อ NFR อื่นทั้งหมด (ตรวจสอบรอบที่สี่ 2026-09-22)

รอบที่สี่แก้ไขเฉพาะ 3 ไฟล์ใน `detailed-design/` ([[patient-search-selection]],
[[patient-ncd-diagnosis-lab-history]], [[complication-risk-analysis-alert]]) โดยเป็นการ **เพิ่มหัวข้อ
ใหม่และแถว edge case ใหม่เท่านั้น** ไม่มีการแก้ไข sequence diagram/state diagram/ตาราง Operation↔Entity
เดิมที่มีอยู่ก่อนหน้า และ [[architecture]], [[api-spec]], [[db-spec]] ไม่ถูกแก้ไขเลยในรอบนั้น จึงสรุปได้
ว่า **ไม่มี NFR อื่นใดถดถอย** — NFR-01, NFR-03–NFR-08 ยังคงสถานะ "รองรับแล้ว (Addressed)" เดิมจากรอบที่
สาม (2026-09-21) ทุกประการ มีเพียง NFR-02 เท่านั้นที่เปลี่ยนสถานะ (จาก Partial เป็น Addressed) ตามที่ระบุ
ไว้ในหัวข้อ NFR-02 ด้านบน

### หมายเหตุรวม — ผลตรวจสอบรอบที่หก (2026-09-22)

อ่านทั้ง [[architecture]], [[api-spec]], [[db-spec]] และไฟล์ทั้ง 4 ใน `detailed-design/` ใหม่ทั้งไฟล์
พบว่าเนื้อหาปัจจุบันของ [[pdpa-data-protection-compliance]] มีหัวข้อ "ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วย
ที่ละเอียดอ่อนฝั่ง Client (NFR-02)" และ tag "(NFR-02, NFR-03)" ที่ขั้นตอน Access Control ของทั้ง 4 ไฟล์
ครบสอดคล้องกันแล้ว ซึ่งไม่ตรงกับที่รอบที่สี่/ห้าเคยบันทึกไว้ว่ายังเป็นข้อสังเกตเสริมที่ยังไม่แก้ไข —
สันนิษฐานว่าไฟล์ถูกปรับปรุงเพิ่มเติมหลังรอบที่ห้าถูกบันทึกไว้ (ไม่ใช่ความผิดพลาดของการตรวจสอบรอบนี้)
ผลคือ **ไม่มี NFR ใดถดถอยและไม่มีข้อสังเกตเสริมเหลืออยู่อีกต่อไปในรอบนี้** — NFR-01 ถึง NFR-08 ทั้งหมด
มีสถานะ "รองรับแล้ว (Addressed)" ครบทุกตัวโดยไม่มีช่องว่างเชิงออกแบบระดับ logical ที่ต้องรัน
`sync-architecture`/`sync-api-db`/`sync-detailed-design` เพิ่มเติม (มีเพียงประเด็นที่รอการตัดสินใจ/ยืนยัน
จากภายนอกเอกสารเชิงเทคนิค เช่น `technology-stack.md`, ค่า threshold จริง, ระยะเวลาเก็บรักษาจริง,
ฐานทางกฎหมายที่ชัดเจน ซึ่งถูกบันทึกไว้อย่างมีเจตนาในทุกชั้นเอกสารแล้วว่าไม่ใช่ gap ที่ตกหล่น)

### ผลตรวจสอบรอบที่สิบ (2026-09-26) — ยกเลิก PatientAssignment (NFR-02/07/14/19/20) และ NFR-21 ใหม่ (FR-17)

**บริบท:** (1) 2026-09-25 ผู้ใช้สั่งยกเลิกกลไก PatientAssignment ทั้งหมด — แพทย์/พยาบาล/Admin เข้าถึง
ผู้ป่วยทุกรายในระบบเหมือนกันแล้ว เหลือเพียงเงื่อนไขระดับบทบาท/`isActive`/`email_verified` (2) 2026-09-26
เพิ่ม FR-17/NFR-21 (AI ช่วยอธิบายผลการค้นหาด้วย HN ผ่าน Operation 17 ที่ Client เรียก Firebase AI Logic
ตรง) อ่าน [[architecture]], [[api-spec]] (Operation 0–17), [[db-spec]] และ `detailed-design/` ทั้ง 6
ไฟล์ใหม่ทั้งไฟล์ในรอบนี้ ผลตรวจสอบ:

- **NFR-02 (Access Control):** [[architecture]] ตาราง Mapping NFR แถว NFR-02 แก้ไขให้ระบุ "แพทย์/
  พยาบาล/Admin ที่ผ่านเงื่อนไข role/isActive/email_verified เห็นผู้ป่วยทุกรายในระบบ" แทนคำอธิบายเดิมที่
  ผูกกับ PatientAssignment [[api-spec]] Operation ร่วม Access Control ตัดขั้นตอน "ตรวจสอบระดับรายผู้ป่วย
  (patient-level)" ออกทั้งหมด เหลือเฉพาะ role-level [[db-spec]] ลบ entity PatientAssignment และ
  collection `patientAssignments` ออกทั้งหมด ปรับ Firestore Security Rules ของ `patients` ให้ Client
  (ทุกบทบาท) อ่านตรงได้เมื่อผ่านเงื่อนไขบทบาท/isActive/email_verified — ไม่มีการกรองตามผู้ป่วยรายบุคคล
  อีกต่อไป `detailed-design/` ทั้ง 6 ไฟล์ถูกแก้ไขให้ระบุตรงกันครบว่า "ไม่มีการตรวจสอบระดับรายผู้ป่วยอีก
  ต่อไป (ยกเลิก PatientAssignment 2026-09-25)" ในทุกจุดที่เคยอ้างอิงกลไกเดิม รวมถึงหัวข้อ "ข้อกำหนด: การ
  จำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)" เดิมยังคงอยู่ครบไม่ถูกลบ — **สรุป: คงสถานะ
  Addressed ไม่มีการถดถอย**
- **NFR-07 (Data Subject Rights):** [[pdpa-data-protection-compliance]] Sequence Diagram 1 แก้ไข
  ขั้นตอนตรวจสอบสิทธิ์ให้ตรงกับ role-level เท่านั้น (ไม่มีการตรวจสอบระดับรายผู้ป่วยอีกต่อไป) ครอบคลุมสิทธิ
  ทั้ง 5 ประเภทสำหรับผู้ป่วยทุกรายในระบบเหมือนเดิม ไม่มีสิทธิ/ประเภทคำขอใดถูกตัดออก — **สรุป: คงสถานะ
  Addressed ไม่มีการถดถอย**
- **NFR-14 (Security Rules Verification):** [[db-spec]] หัวข้อคุณสมบัติร่วม NFR-14 แก้ไขตาราง Security
  Rules Verification โดยตรง — ลบกรณีทดสอบเดิม "(ก) ไม่มี assignment เลย/(ข) มี assignment บางส่วน" และ
  แทนที่ด้วยกรณีทดสอบใหม่ "บทบาทถูกต้องครบทุกค่าที่กำหนดไว้ล่วงหน้า (`แพทย์`/`พยาบาล`/`admin`)" — ไม่ใช่
  การลบกรณีทดสอบโดยไม่มีสิ่งทดแทน กรณีทดสอบเดิมอื่น (บัญชีถูกระงับ, ยังไม่ยืนยันอีเมล) ยังอยู่ครบ พร้อม
  เพิ่ม test case ระดับโค้ด Cloud Functions สำหรับ Admin (NFR-19/NFR-20) 4 ข้อไว้แล้วอย่างเป็นรูปธรรม —
  **สรุป: คงสถานะ Addressed ไม่มีการถดถอย** (ข้อสังเกตเดิมเรื่อง [[architecture]] "ประเด็นรอตัดสินใจ"
  ล้าสมัย ยังคงค้างอยู่ — ดูด้านล่าง)
- **NFR-19 (Admin — ไม่ใช่ "ข้อยกเว้น" อีกต่อไป):** [[architecture]], [[api-spec]], [[db-spec]] และ
  [[admin-role-account-management]] แก้ไขคำอธิบายตรงกันครบว่า Admin ผ่านการตรวจสอบ role-level เดียวกับ
  แพทย์/พยาบาลทุกประการ (ไม่ใช่ "ข้ามการตรวจสอบระดับรายผู้ป่วย" อีกต่อไป เพราะไม่มีการตรวจสอบนี้ให้ข้าม
  แล้ว) ต่างกันเพียงสิทธิ์อ่านอย่างเดียว — Operation 15 เดิมถูกรวมเข้ากับ Operation 0 เป็น operation
  เดียวที่ทุกบทบาทเรียกเหมือนกัน — **สรุป: คงสถานะ Addressed ไม่มีการถดถอย**
- **NFR-20 (Audit Log fail-safe ของ Admin):** ไม่ถูกแตะต้องจากการยกเลิก PatientAssignment เลย —
  กลไก `isAdminAccess` ยังคงเดิมทุกประการใน [[db-spec]]/[[api-spec]]/[[admin-role-account-management]]
  — **สรุป: คงสถานะ Addressed ไม่มีการถดถอย**
- **NFR-21 (ใหม่ 2026-09-26):** ตรวจสอบครบทั้ง [[architecture]] (component `AIService` ใหม่ + ตาราง
  Mapping NFR), [[api-spec]] (Operation 17 ใหม่), [[db-spec]] (คุณสมบัติร่วมใหม่) และ
  [[patient-search-selection]] (sequence diagram + edge case) สอดคล้องกันครบทุกจุดว่า prompt ที่ส่งให้
  Firebase AI Logic จำกัดเฉพาะ 3 ค่า (HN ที่พิมพ์, สถานะผลลัพธ์แบบไม่ระบุตัวตน, จำนวนที่พบ) ห้ามส่งชื่อ/
  `Patient.id` เด็ดขาด — ความเสี่ยงที่ไม่มีชั้นตรวจสอบฝั่งเซิร์ฟเวอร์และไม่มี audit log ของการเรียกนี้เลย
  ถูกบันทึกไว้เด่นชัดและผู้ใช้ยืนยันให้ดำเนินการต่อแล้ว — **สรุป: Addressed (มีความเสี่ยงที่บันทึกไว้
  ชัดเจน)**
- **ข้อสังเกตที่ยังไม่ถูกแก้ไขจากรอบที่เก้า (ยืนยันซ้ำในรอบนี้):** [[architecture]] หัวข้อ "ประเด็นรอ
  ตัดสินใจ" ของฟีเจอร์ที่ 7 (Admin) ยังคงมีข้อความล้าสมัยเดิม 2 รายการที่เคยแนะนำให้รัน `sync-architecture`
  ตั้งแต่รอบที่เก้า (2026-09-24) แต่ยังไม่ถูกแก้ไข: (1) "กลไกจริงของ FR-15/NFR-19 ... ยังไม่ระบุว่าจะเขียน
  เป็น shared helper module" ทั้งที่ [[admin-role-account-management]] ระบุคำตอบชัดเจนแล้ว และ (2)
  "กลไกจริงของ NFR-20 ... ยังไม่ระบุว่าจะใช้ collection เดียวกับ NFR-06" ทั้งที่ [[db-spec]] ยืนยันคำตอบ
  แล้วเช่นกัน — ไม่กระทบสถานะ Addressed ของ NFR-19/NFR-20 (เนื้อหาจริงมีอยู่ครบในเอกสารอื่นแล้ว) แต่ยืนยัน
  ว่า `sync-architecture` ยังไม่ได้ถูกรันจริง
- **ข้อสังเกตใหม่ในรอบนี้ (ไม่กระทบสถานะ Addressed แต่ควรแก้ไขนอกขอบเขต 3 skill ของ nfr-reviewer):**
  [[technology-stack]] **ยังไม่ sync การยกเลิก PatientAssignment** — พบการอ้างอิง
  `PatientAssignment`/`patientAssignments` เป็นกลไกที่ใช้งานอยู่จริงหลายจุด (คำอธิบายโครงสร้างข้อมูล,
  Component Diagram ที่ยังวาด `patientAssignments` เป็นส่วนหนึ่งของ Primary Data Store, ตัวอย่างกรณี
  ทดสอบ Security Rules ของ NFR-14 ที่ยังอ้างอิง PatientAssignment) ซึ่งขัดแย้งกับ
  [[architecture]]/[[api-spec]]/[[db-spec]] ที่ยืนยันการลบกลไกนี้ออกทั้งหมดแล้ว — เนื่องจาก
  `technology-stack.md` ไม่ใช่หนึ่งใน 4 เอกสารที่ nfr-reviewer ตรวจสอบโดยตรงตามขอบเขตงานนี้ (architecture/
  api-spec/db-spec/detailed-design) และไม่มี skill ในสาม skill ที่แนะนำได้ (`sync-architecture`/
  `sync-api-db`/`sync-detailed-design`) ที่ดูแลไฟล์นี้ จึงไม่กระทบสถานะ Addressed ของ NFR ใดในรอบนี้ แต่
  **แนะนำรัน `/build-tech-stack` ซ้ำโดยเร็ว** เพื่อความสอดคล้องข้ามเอกสารทั้งหมด

**สรุปรวม: ไม่มี NFR ใดถดถอยจากการยกเลิก PatientAssignment หรือการเพิ่ม FR-17/NFR-21 — NFR-02, NFR-07,
NFR-14, NFR-19, NFR-20 คงสถานะ "รองรับแล้ว (Addressed)" และ NFR-21 (ใหม่) เข้าสถานะ "รองรับแล้ว
(Addressed — มีความเสี่ยงที่บันทึกไว้ชัดเจน)" ทันทีตั้งแต่รอบแรกที่ประเมิน**

## เอกสารที่เกี่ยวข้อง

- [[architecture]]
- [[api-spec]]
- [[db-spec]]
- [[technology-stack]]
- [[patient-search-selection]]
- [[patient-ncd-diagnosis-lab-history]]
- [[complication-risk-analysis-alert]]
- [[pdpa-data-protection-compliance]]
- [[user-authentication-email-password]]
- [[admin-role-account-management]]
- [[backlog]]
- [[feature-list]]
- [[user-journey]]
