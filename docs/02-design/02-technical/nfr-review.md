# NFR Review

เอกสารนี้ตรวจสอบว่า NFR ทุกตัวใน [[backlog#Non-Functional Requirements|backlog]] ถูกออกแบบมารองรับ
จริงหรือไม่ในเอกสารเชิงเทคนิคทั้งหมด ได้แก่ [[architecture]], [[api-spec]], [[db-spec]], [[technology-stack]]
และไฟล์ทั้ง 5 ใน `detailed-design/` ([[patient-search-selection]], [[patient-ncd-diagnosis-lab-history]],
[[complication-risk-analysis-alert]], [[pdpa-data-protection-compliance]],
[[user-authentication-email-password]]) **เอกสารนี้เป็นผลการตรวจสอบเท่านั้น ไม่ใช่การออกแบบ** — ถ้าพบ
ช่องว่าง ให้รัน skill ที่แนะนำในคอลัมน์สุดท้ายเพื่อแก้ไขเอกสารเชิงเทคนิคที่เกี่ยวข้อง ห้ามแก้ไข
`architecture.md`/`api-spec.md`/`db-spec.md`/`technology-stack.md`/`detailed-design/*` จากเอกสารนี้
โดยตรง

อัปเดตล่าสุด: 2026-09-24 (ตรวจสอบรอบที่แปด — ประเมินใหม่เฉพาะ **NFR-17, NFR-18** หลัง
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
| NFR-02 | Security / Access Control (เฉพาะแพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD และเฉพาะผู้ป่วยที่อยู่ในความดูแลของผู้ใช้งานคนนั้นตาม assignment รายผู้ป่วย) | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)\|api-spec — Operation ร่วม (ตรวจสอบ 2 ระดับ)]], [[api-spec#Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วยในความดูแล (ค้นหาเฉพาะรายด้วยเลข HN)\|api-spec Operation 0]], [[db-spec#ผู้ใช้ (User)\|db-spec User]], [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)\|PatientAssignment]], [[patient-search-selection#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|patient-search-selection — หัวข้อ NFR-02]], [[patient-ncd-diagnosis-lab-history#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|patient-ncd-diagnosis-lab-history — หัวข้อ NFR-02]], [[complication-risk-analysis-alert#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|complication-risk-analysis-alert — หัวข้อ NFR-02]], [[pdpa-data-protection-compliance#ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)\|pdpa-data-protection-compliance — หัวข้อ NFR-02]] | ไม่มีช่องว่างแล้ว — ยืนยันในรอบนี้ว่าทั้ง 4 ไฟล์ใน `detailed-design/` (ครอบคลุมทุก operation ที่ส่งข้อมูลผู้ป่วยละเอียดอ่อนให้ Client แสดง: Operation 0/1/2/3 และ Operation 4 กรณี "ขอเข้าถึง"/"ขอสำเนา") มีหัวข้อ "ข้อกำหนด: การจำกัด/ล้างข้อมูลผู้ป่วยที่ละเอียดอ่อนฝั่ง Client (NFR-02)" พร้อม edge case ครบถ้วนสอดคล้องกัน (ออกจากหน้าจอไปเลือกผู้ป่วย/ยื่นคำขอรายอื่น/ค้นหาซ้ำ/logout ต้องล้างข้อมูลที่เคยแสดงทันที) — ข้อสังเกตเดิมในรอบที่สี่/ห้าที่ระบุว่า [[pdpa-data-protection-compliance]] ยังไม่มีหัวข้อนี้ ได้รับการแก้ไขแล้วจริงตามที่ตรวจพบในรอบนี้ | ไม่มี |
| NFR-03 | PDPA / Lawful Basis & Purpose Limitation — จำกัดการประมวลผลข้อมูลเฉพาะเท่าที่จำเป็นตามวัตถุประสงค์การดูแลรักษา | **รองรับแล้ว (Addressed)** | [[architecture#Cross-cutting: การคุ้มครองข้อมูลส่วนบุคคล (PDPA)\|architecture — Cross-cutting PDPA]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)\|api-spec — Operation ร่วม กฎข้อ 3 (purpose limitation)]], [[patient-search-selection#Sequence Diagram\|patient-search-selection — Sequence Diagram (tag NFR-02, NFR-03)]], [[patient-ncd-diagnosis-lab-history#Sequence Diagram\|patient-ncd-diagnosis-lab-history — Sequence Diagram]], [[complication-risk-analysis-alert#Sequence Diagram\|complication-risk-analysis-alert — Sequence Diagram]], [[pdpa-data-protection-compliance#Sequence Diagram 1 — คำขอใช้สิทธิของเจ้าของข้อมูล (Operation 4)\|pdpa-data-protection-compliance — Sequence Diagram 1]] | ไม่มีช่องว่างเชิงออกแบบ — Access Control ใน Backend Service ถูกกำหนดเป็นจุดบังคับ purpose limitation เดียวสำหรับทุก operation อย่างสอดคล้องกันตั้งแต่ architecture ถึง detailed-design ยืนยันในรอบนี้ว่าขั้นตอน Access Control ในทั้ง 4 ไฟล์ระบุ tag "(NFR-02, NFR-03)" ตรงกันครบแล้ว (ข้อสังเกตเรื่องความไม่สม่ำเสมอของ label ในรอบที่สี่/ห้าได้รับการแก้ไขแล้วจริง) | ไม่มี |
| NFR-04 | PDPA / การเข้ารหัสข้อมูล (Encryption at rest & in transit) | **รองรับแล้ว (Addressed)** | [[architecture#Component Diagram\|architecture — Component Diagram (หมายเหตุเข้ารหัสทุกเส้นทาง)]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[db-spec#คุณสมบัติร่วม (Cross-cutting Property) — การเข้ารหัสข้อมูล (NFR-04)\|db-spec — คุณสมบัติร่วม NFR-04]], [[pdpa-data-protection-compliance#ขอบเขตของเอกสารนี้\|pdpa-data-protection-compliance — คำอธิบายว่าเหตุใดไม่มี sequence diagram แยก]] | ไม่มีช่องว่าง — ถูกออกแบบเป็น cross-cutting property ที่สอดคล้องกันทุกชั้นเอกสารอย่างมีเจตนา (ไม่ผูก operation ใด operation หนึ่ง) กลไก/อัลกอริทึมเข้ารหัสจริงรอ `technology-stack.md` ซึ่งเป็นการตัดสินใจที่บันทึกไว้แล้ว ไม่ใช่ gap | ไม่มี (รอ `technology-stack.md` ในอนาคต แล้วกลับมารัน `nfr-reviewer` อีกครั้ง) |
| NFR-05 | PDPA / Retention & Deletion — จำกัดระยะเวลาเก็บรักษาและรองรับการลบข้อมูล | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation 6 — บังคับใช้นโยบายเก็บรักษาและลบข้อมูลที่พ้นระยะเวลา (Retention Enforcement)\|api-spec Operation 6]], [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)\|db-spec RetentionPolicy]], [[pdpa-data-protection-compliance#Sequence Diagram 3 — บังคับใช้นโยบายเก็บรักษาและลบข้อมูลที่พ้นระยะเวลา (Operation 6)\|pdpa-data-protection-compliance — Sequence Diagram 3]] | ไม่มีช่องว่างเชิงออกแบบ logical — ค่าระยะเวลาเก็บรักษาจริง (จำนวนวัน) และกลไก trigger จริง (scheduled job/manual) ยังไม่ถูกกำหนด แต่ถูกบันทึกไว้อย่างชัดเจนในทุกชั้นเอกสารว่าเป็นประเด็นรอยืนยันจากหน่วยงาน/ฝ่ายกฎหมายและรอ `technology-stack.md` ไม่ใช่ gap ที่ตกหล่น | ไม่มี (รอการยืนยันค่าระยะเวลาจากหน่วยงาน/ฝ่ายกฎหมาย และรอ `technology-stack.md` — ไม่ใช่งานของชั้นเอกสารเชิงเทคนิคปัจจุบัน) |
| NFR-06 | PDPA / Audit Log & Accountability — บันทึกร่องรอยการเข้าถึงข้อมูล | **รองรับแล้ว (Addressed)** | [[architecture#Data Flow Diagram — Journey หลัก\|architecture — Data Flow Diagram Journey หลัก]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation ร่วม — บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)\|api-spec — Operation ร่วม Audit Logging]], [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)\|db-spec AuditLogRecord]], [[patient-ncd-diagnosis-lab-history#Sequence Diagram\|patient-ncd-diagnosis-lab-history — sequence diagram (audit log step)]], [[complication-risk-analysis-alert#Sequence Diagram\|complication-risk-analysis-alert — sequence diagram (audit log step)]], [[pdpa-data-protection-compliance#Sequence Diagram 1 — คำขอใช้สิทธิของเจ้าของข้อมูล (Operation 4)\|pdpa-data-protection-compliance — Sequence Diagram 1 และ 2]] | ไม่มีช่องว่าง — ยืนยันแล้วว่า [[patient-ncd-diagnosis-lab-history]] และ [[complication-risk-analysis-alert]] ถูกแก้ไขให้มีขั้นตอนบันทึก Audit Log ก่อนอ่านข้อมูลผู้ป่วยจริงตามที่คาดไว้ พร้อม fail-safe (ยกเลิก operation ถ้าบันทึกไม่สำเร็จ) และมี edge case รองรับครบ; [[patient-search-selection]] (Operation 0) ไม่มีขั้นตอน audit log อย่างถูกต้องตามเจตนา เพราะยังไม่มีการระบุผู้ป่วยรายบุคคล (ไม่ผ่านการตรวจสอบระดับรายผู้ป่วยซึ่งเป็นตัว trigger การบันทึกตาม architecture) — ไม่ใช่ gap | ไม่มี |
| NFR-07 | PDPA / Data Subject Rights — รองรับคำขอเข้าถึง/สำเนา/แก้ไข/ลบ/คัดค้านการประมวลผลข้อมูล | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation 4 — ยื่นและดำเนินการคำขอใช้สิทธิของเจ้าของข้อมูล (Data Subject Rights Request)\|api-spec Operation 4]], [[db-spec#คำขอใช้สิทธิของเจ้าของข้อมูล (DataSubjectRequest)\|db-spec DataSubjectRequest]], [[pdpa-data-protection-compliance#Sequence Diagram 1 — คำขอใช้สิทธิของเจ้าของข้อมูล (Operation 4)\|pdpa-data-protection-compliance — Sequence Diagram 1 + State Diagram]] | ไม่มีช่องว่างเชิงออกแบบ logical — ครอบคลุมสิทธิทั้ง 5 ประเภท (เข้าถึง/สำเนา/แก้ไข/ลบ/คัดค้าน) พร้อม state diagram และ edge case ครบ กระบวนการยืนยันตัวตนผู้ยื่นคำขอก่อนเจ้าหน้าที่บันทึกคำขอในระบบยังไม่ถูกยืนยันจากผู้ใช้ แต่ถูกบันทึกไว้อย่างชัดเจนว่าเป็นกระบวนการเชิงองค์กรที่อยู่นอกขอบเขตของ operation นี้ ไม่ใช่ gap ของการออกแบบระดับเอกสารเชิงเทคนิค | ไม่มี (ควรให้ผู้ใช้/เจ้าของ requirement ยืนยันกระบวนการยืนยันตัวตนผู้ยื่นคำขอ — เป็นคำถามเชิง requirement ไม่ใช่ gap ของ technical spec) |
| NFR-08 | PDPA / Breach Notification Support — สนับสนุนข้อมูลสำหรับการแจ้งเหตุละเมิดข้อมูลส่วนบุคคล | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR]], [[api-spec#Operation 5 — สืบค้นบันทึกการเข้าถึงข้อมูล (Audit Trail Retrieval)\|api-spec Operation 5]], [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)\|db-spec AuditLogRecord]], [[pdpa-data-protection-compliance#Sequence Diagram 2 — สืบค้น Audit Trail เพื่อสนับสนุนการสืบสวน/แจ้งเหตุละเมิด (Operation 5)\|pdpa-data-protection-compliance — Sequence Diagram 2]] | ไม่มีช่องว่างเชิงออกแบบ logical — Operation 5 ให้บริการค้นคืน audit trail พร้อม edge case ครบ (ไม่มีสิทธิ์, ช่วงเวลาไม่ถูกต้อง, ไม่พบข้อมูล) กรอบเวลาที่กฎหมายกำหนดจริงยังไม่ถูกระบุในเอกสารต้นทาง แต่ถูกบันทึกไว้อย่างชัดเจนว่าเป็นประเด็นรอข้อมูลเพิ่มเติม ไม่ใช่ gap ของการออกแบบ | ไม่มี |
| NFR-09 | Performance — หน้าจอค้นหา/ประวัติวินิจฉัย/lab/ผลวิเคราะห์ความเสี่ยงตอบสนอง < 2 วินาที | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-09)]], [[api-spec#Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)\|api-spec — Cross-cutting NFR-09–16]], [[patient-search-selection#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|patient-search-selection]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่าง — กลไกจริง (Firestore composite index ต่อ query pattern ของแต่ละ operation ไม่มี caching layer เพิ่มเติมโดยเจตนา) ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 9 และระบุ index จริงไว้ครบในทุก entity ของ [[db-spec]] และทุกไฟล์ที่เกี่ยวข้องใน `detailed-design/` | ไม่มี |
| NFR-10 | Availability — อ้างอิง SLA มาตรฐานของ Firebase/Google Cloud | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-10)]] | ไม่มีช่องว่าง — เป็นคุณสมบัติระดับ infrastructure ที่ไม่ต้องออกแบบ component/operation เพิ่มเติมตามที่ระบุไว้แล้วอย่างมีเจตนา ผูกกับ SLA ของ Firebase services ที่ `[[technology-stack]]` เลือกใช้โดยตรง | ไม่มี |
| NFR-11 | Clinical Safety Validation — ยืนยันการจับคู่โรค/threshold โดยแพทย์ผู้เชี่ยวชาญก่อน deploy ทุกครั้ง | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-11)]], [[db-spec#threshold มาตรฐานของโรคแทรกซ้อน (ComplicationRiskThreshold)\|db-spec — หมายเหตุ NFR-11 ใน ComplicationRiskThreshold]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่างเชิงออกแบบ — ถูกบันทึกไว้อย่างชัดเจนว่าเป็นกระบวนการเชิงองค์กร (deployment approval gate) นอกระบบ ไม่ใช่ behavior ที่ต้อง implement เป็นโค้ด/UI/attribute ใหม่ ค่า threshold จริงยังไม่ถูกกำหนด (ประเด็นรอยืนยันจากแพทย์ผู้เชี่ยวชาญ ไม่ใช่ gap ของเอกสารเทคนิค) | ไม่มี |
| NFR-12 | Session Timeout — auto-logout เมื่อไม่ใช้งานเกิน 30 นาที | **รองรับแล้ว (Addressed — มีความเสี่ยงที่บันทึกไว้ชัดเจน)** | [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component\|architecture — หัวข้อ Client/Backend Service]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-12)]], [[api-spec#Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)\|api-spec — Operation ร่วม ข้อ 4]], [[db-spec#ผู้ใช้ (User)\|db-spec — หมายเหตุ NFR-12 ใน User]], [[patient-search-selection#Sequence Diagram\|patient-search-selection — loop inactivity ใน Sequence Diagram]] | ไม่มีช่องว่างเชิงออกแบบ — กลไก client custom inactivity timer (`setTimeout` + event listener เรียก `signOut()`) ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 10 และระบุคู่กันในทุกชั้นเอกสาร **ความเสี่ยงด้านความปลอดภัย (ไม่มี server-side token revocation, token ยังใช้ได้ต่อจนถึง ~1 ชม.) ถูกบันทึกไว้อย่างเด่นชัดและผู้ใช้รับทราบ/ยืนยันให้ดำเนินการต่อแล้ว — เป็น mitigation ที่ควรทำก่อนใช้ข้อมูลผู้ป่วยจริง ไม่ใช่ gap ของการออกแบบเอกสารในรอบ MVP นี้** | ไม่มี (แนะนำเพิ่ม server-side token revocation ก่อนใช้ข้อมูลผู้ป่วยจริง — บันทึกไว้แล้วใน "ประเด็นรอตัดสินใจ" ของ architecture) |
| NFR-13 | Accessibility — ห้ามใช้สีเป็นสัญญาณเดียว ต้องมีข้อความกำกับคู่กับสีเสมอ | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-13)]], [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)\|db-spec RiskFinding — field ระดับความเสี่ยงที่ประเมินได้]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่าง — field ข้อความ (ไม่ใช่รหัสสี) พร้อมใช้งานแล้วใน db-spec, กลไกจริง (WCAG 2.1 AA + Heroicons + Lighthouse Audit) ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 11 รายละเอียด mapping สี/ไอคอนเฉพาะจุดเป็นหน้าที่ของ [[DESIGN]] ต่อไปตามที่ระบุไว้แล้ว | ไม่มี |
| NFR-14 | Security Rules Verification — automated test ผ่าน Firebase Emulator Suite ครอบคลุมทุกกรณีสิทธิ์ | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-14)]], [[patient-search-selection#หมายเหตุการ Implement\|patient-search-selection]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]], [[user-authentication-email-password#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|user-authentication-email-password]] | ไม่มีช่องว่าง — รายการ collection/กรณีทดสอบ (ไม่มี assignment, assignment บางส่วน, บัญชีถูกระงับ, ไม่มี custom claims ที่ถูกต้อง, บัญชีที่เพิ่งสมัครยังไม่มี role) ถูกระบุครบใน db-spec และอ้างอิงตรงกันในทุกไฟล์ `detailed-design/` ที่เกี่ยวข้อง รวมไฟล์ Authentication ใหม่ | ไม่มี |
| NFR-15 | Browser/Device Compatibility — Chrome/Edge/Firefox ล่าสุดบน desktop/tablet | **รองรับแล้ว (Addressed)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-15)]], [[complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)\|complication-risk-analysis-alert]] | ไม่มีช่องว่าง — browserslist config ถูกตัดสินใจแล้วใน `[[technology-stack]]` decision area 12 เป็นเรื่องของ Client build config ล้วนๆ ไม่กระทบ operation/entity | ไม่มี |
| NFR-16 | Interoperability (future, Won't have เฟสนี้) — พิจารณา HL7/FHIR เมื่อเชื่อมต่อ HOSxP จริง | **รองรับแล้ว (Addressed — Won't have โดยเจตนา)** | [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-16)]] | ไม่มีช่องว่าง — ยืนยันแล้วว่าเป็น Won't have ของเฟสนี้ ไม่ต้องออกแบบ component/operation เพิ่มเติมจนกว่าจะเชื่อมต่อ HOSxP จริงในอนาคต | ไม่มี |
| NFR-17 | Security / Password Policy — รหัสผ่านขั้นต่ำ 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข | **รองรับแล้ว (Addressed)** | [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component\|architecture — หัวข้อ Client/Backend Service ฟีเจอร์ที่ 6]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-17)]], [[api-spec#Operation 8 — สมัครบัญชีผู้ใช้งานด้วยตนเอง (Self Sign-up)\|api-spec Operation 8]], [[api-spec#Operation 9 — ขอรีเซ็ตรหัสผ่านทางอีเมล (Forgot Password)\|Operation 9]], [[db-spec#ผู้ใช้ (User)\|db-spec User — attribute รหัสผ่านที่จัดเก็บ]], [[user-authentication-email-password#Sequence Diagram — สมัครบัญชี ยืนยันอีเมล และรออนุมัติ (Operation 8, FR-08/FR-09)\|user-authentication-email-password — Sequence Diagram Operation 8/9]], [[technology-stack#13. กลไก Validate Password Policy ฝั่งเซิร์ฟเวอร์ (NFR-17, ฟีเจอร์ที่ 6) — Regex ใน Cloud Function + Identity Platform เป็น Backstop\|technology-stack decision area 13]] | ไม่มีช่องว่าง — กลไกทางเทคนิคจริงถูกตัดสินใจแล้วในรอบ 2026-09-24: **regex ในโค้ด Cloud Function `signUpUser`** (Operation 8) + **Google Cloud Identity Platform password policy เป็น backstop** สำหรับ Operation 9 (`confirmPasswordReset` ที่ไม่ผ่าน Cloud Function) — ตรวจสอบแล้วว่า [[architecture]] (หัวข้อ Client/Backend Service ฟีเจอร์ที่ 6 + ประเด็นรอตัดสินใจ), [[api-spec]] (Operation 8/9 Technical Binding), [[db-spec]] (attribute รหัสผ่านที่จัดเก็บ) และ [[user-authentication-email-password]] (sequence diagram Operation 8/9 + หมายเหตุการ Implement) อ้างอิงกลไกเดียวกันนี้ตรงกันครบทุกไฟล์แล้ว ไม่มีข้อความ "ยังไม่ตัดสินใจ" หลงเหลืออยู่ | ไม่มี |
| NFR-18 | Security / Account Enumeration Prevention — ไม่เปิดเผยว่าอีเมลมีบัญชีในระบบหรือไม่ | **รองรับแล้ว (Addressed — มีความเสี่ยงคงเหลือที่บันทึกไว้ชัดเจน)** | [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component\|architecture — หัวข้อ Client/Backend Service ฟีเจอร์ที่ 6]], [[architecture#ตาราง Mapping NFR ไปยัง Component\|architecture — ตาราง Mapping NFR (แถว NFR-18)]], [[api-spec#Operation 7 — เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน\|api-spec Operation 7]], [[api-spec#Operation 8 — สมัครบัญชีผู้ใช้งานด้วยตนเอง (Self Sign-up)\|Operation 8]], [[api-spec#Operation 9 — ขอรีเซ็ตรหัสผ่านทางอีเมล (Forgot Password)\|Operation 9]], [[user-authentication-email-password#Edge Case และวิธีจัดการ\|user-authentication-email-password — Edge Case]], [[technology-stack#14. กลไกป้องกัน Account Enumeration (NFR-18, ฟีเจอร์ที่ 6) — Firebase Email Enumeration Protection\|technology-stack decision area 14]] | ไม่มีช่องว่างเชิงออกแบบ — กลไกทางเทคนิคจริงถูกตัดสินใจแล้ว: เปิด **Firebase "Email Enumeration Protection"** ระดับโปรเจกต์ ปิด error code ที่แยกแยะได้ของ Operation 7 ตรงกับที่ [[architecture]]/[[api-spec]]/[[user-authentication-email-password]] อ้างอิงกลไกเดียวกันครบแล้ว **ความเสี่ยง timing side-channel ที่ยังไม่ถูกปิด (ไม่มี fixed minimum delay) ถูกบันทึกไว้อย่างเด่นชัดในทุกชั้นเอกสาร (technology-stack หัวข้อ "ความเสี่ยงเพิ่มเติม", architecture หัวข้อ "ประเด็นรอตัดสินใจ") ว่าผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อในรอบ MVP นี้แล้ว — ไม่ใช่ gap ที่ตกหล่น แต่เป็น mitigation ที่ควรทำก่อนใช้ข้อมูลผู้ป่วยจริง** เช่นเดียวกับรูปแบบที่ใช้กับ NFR-12 | ไม่มี (แนะนำเพิ่ม fixed minimum delay ใน Cloud Function ก่อนใช้ข้อมูลผู้ป่วยจริง — บันทึกไว้แล้วใน "ประเด็นรอตัดสินใจ"/"ความเสี่ยงที่ต้องพิจารณาเพิ่มเติม" ของ technology-stack) |

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
- สรุป: รองรับแล้วครบทุกชั้นเอกสาร ไม่มีช่องว่าง

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
- สรุป: รองรับแล้วครบทุกชั้นเอกสาร รวมไฟล์ Authentication ใหม่ ไม่มีช่องว่าง

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
- [[backlog]]
- [[feature-list]]
- [[user-journey]]
