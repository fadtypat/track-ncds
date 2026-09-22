# Backlog

Backlog รวม FR/NFR ทั้งหมดจากทุกเอกสารใน `01-spec/` จัดกลุ่มตามระดับความสำคัญ (สูง/กลาง/ต่ำ)
"สูง" คือสิ่งที่ต้องมีใน MVP นี่คือฉบับแรกของ backlog นำเข้าจาก spec ฉบับแรกของโปรเจกต์
([[20260917-01-patient-ncd-history-lab-complication-risk]])

## สูง (MVP)

| รหัส | หัวข้อ | เอกสารอ้างอิง | สถานะ |
| --- | --- | --- | --- |
| FR-01 | แสดงประวัติการวินิจฉัยโรค NCD ของผู้ป่วย | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)\|FR-01]] | Backlog |
| FR-02 | แสดงผลตรวจ lab ที่เกี่ยวข้องกับโรค NCD ย้อนหลัง | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)\|FR-02]] | Backlog |
| FR-03 | วิเคราะห์ความเสี่ยงโรคแทรกซ้อนแบบ rule-based ตาม threshold ค่า lab | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)\|FR-03]] | Backlog |
| FR-04 | แสดง/แจ้งผลการประเมินความเสี่ยงโรคแทรกซ้อนแก่ผู้ดูแล | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)\|FR-04]] | Backlog |
| FR-05 | ค้นหา/แสดงรายชื่อผู้ป่วย NCD ที่อยู่ในความดูแล | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)\|FR-05]] | Backlog |
| FR-06 | ค้นหาผู้ป่วยด้วยเลข HN แบบ 7 หลัก พร้อม validation | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)\|FR-06]] | Backlog |

## กลาง

_(ยังไม่มีรายการ)_

## ต่ำ

_(ยังไม่มีรายการ)_

## Non-Functional Requirements

| รหัส | ด้าน | เอกสารอ้างอิง | สถานะ |
| --- | --- | --- | --- |
| NFR-01 | แหล่งข้อมูล/Integration (HOSxP, mockup ระหว่างพัฒนา) — สูง | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-01]] | Backlog |
| NFR-02 | Security / Access Control (เฉพาะแพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD และเฉพาะผู้ป่วยที่อยู่ในความดูแลของผู้ใช้งานคนนั้น) — สูง | [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-02]] | Backlog |
| NFR-03 | PDPA / หลักการประมวลผลข้อมูลส่วนบุคคล (Lawful Basis & Purpose Limitation) — สูง | [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-03]] | Backlog |
| NFR-04 | PDPA / การเข้ารหัสข้อมูล (Encryption) — สูง | [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-04]] | Backlog |
| NFR-05 | PDPA / การจำกัดระยะเวลาเก็บรักษาและการลบข้อมูล (Retention & Deletion) — กลาง | [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-05]] | Backlog |
| NFR-06 | PDPA / บันทึกการเข้าถึงข้อมูล (Audit Log & Accountability) — สูง | [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-06]] | Backlog |
| NFR-07 | PDPA / สิทธิของเจ้าของข้อมูลส่วนบุคคล (Data Subject Rights) — กลาง | [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-07]] | Backlog |
| NFR-08 | PDPA / การสนับสนุนการแจ้งเหตุละเมิดข้อมูลส่วนบุคคล (Breach Notification Support) — กลาง | [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-08]] | Backlog |
| NFR-09 | Performance (หน้าจอค้นหา/ประวัติวินิจฉัย/lab/ผลวิเคราะห์ความเสี่ยง ตอบสนอง < 2 วินาที) — สูง | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-09]] | Backlog |
| NFR-10 | Availability (อ้างอิง SLA มาตรฐานของ Firebase/Google Cloud) — กลาง | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-10]] | Backlog |
| NFR-11 | Clinical Safety Validation (ยืนยันการจับคู่โรค/threshold lab โดยแพทย์ผู้เชี่ยวชาญก่อน deploy ทุกครั้ง — ข้อกำหนดถาวร) — สูง | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-11]] | Backlog |
| NFR-12 | Session Timeout (auto-logout เมื่อไม่ใช้งานเกิน 30 นาที) — สูง | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-12]] | Backlog |
| NFR-13 | Accessibility (ห้ามใช้สีเป็นสัญญาณเดียว ต้องมีข้อความกำกับคู่กับสีเสมอ) — กลาง | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-13]] | Backlog |
| NFR-14 | Security Rules Verification (automated test ผ่าน Firebase Emulator Suite ครอบคลุมทุกกรณีสิทธิ์) — สูง | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-14]] | Backlog |
| NFR-15 | Browser/Device Compatibility (Chrome/Edge/Firefox ล่าสุด บน desktop/tablet) — กลาง | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-15]] | Backlog |
| NFR-16 | Interoperability (future — พิจารณา HL7/FHIR เมื่อเชื่อมต่อ HOSxP จริง) — ต่ำ | [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)\|NFR-16]] | Backlog |
