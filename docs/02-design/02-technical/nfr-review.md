# NFR Review

เอกสารนี้ตรวจสอบว่า NFR ทุกตัวใน [[backlog#Non-Functional Requirements|backlog]] ถูกออกแบบมารองรับ
จริงหรือไม่ในเอกสารเชิงเทคนิคทั้งหมด ได้แก่ [[architecture]], [[api-spec]], [[db-spec]] และไฟล์ทั้ง 4
ใน `detailed-design/` ([[patient-search-selection]], [[patient-ncd-diagnosis-lab-history]],
[[complication-risk-analysis-alert]], [[pdpa-data-protection-compliance]]) **เอกสารนี้เป็นผลการตรวจสอบ
เท่านั้น ไม่ใช่การออกแบบ** — ถ้าพบช่องว่าง ให้รัน skill ที่แนะนำในคอลัมน์สุดท้ายเพื่อแก้ไขเอกสารเชิง
เทคนิคที่เกี่ยวข้อง ห้ามแก้ไข `architecture.md`/`api-spec.md`/`db-spec.md`/`detailed-design/*` จาก
เอกสารนี้โดยตรง

อัปเดตล่าสุด: 2026-09-22 (ตรวจสอบรอบที่หก — ตรวจซ้ำทั้งหมดทุก NFR-01 ถึง NFR-08 เทียบกับ
[[backlog#Non-Functional Requirements|backlog]] ปัจจุบันซึ่งมี NFR-01–NFR-08 ครบระดับความสำคัญแล้ว
โดยอ่าน [[architecture]], [[api-spec]], [[db-spec]] และไฟล์ทั้ง 4 ใน `detailed-design/` ใหม่ทั้งไฟล์
**ผลสรุป: ทุก NFR ยังคงสถานะ "รองรับแล้ว (Addressed)" เหมือนเดิม ไม่มี NFR ใดถดถอยหรือมีช่องว่างใหม่ —
และพบว่าข้อสังเกตเสริม 2 รายการที่รอบที่สี่/ห้าเคยบันทึกไว้ว่ายังไม่บล็อกสถานะ Addressed (แต่เสนอให้
พิจารณาแก้เพื่อความสม่ำเสมอ) ได้รับการแก้ไขแล้วจริงในเนื้อหาปัจจุบันของไฟล์**:

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
- [[patient-search-selection]]
- [[patient-ncd-diagnosis-lab-history]]
- [[complication-risk-analysis-alert]]
- [[pdpa-data-protection-compliance]]
- [[backlog]]
- [[feature-list]]
- [[user-journey]]
