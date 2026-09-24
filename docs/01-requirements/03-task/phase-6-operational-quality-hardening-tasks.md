# Phase 6 — ตรวจสอบ/รับรองคุณภาพเชิงปฏิบัติการทั้งระบบ (Hardening & Verification): งานย่อย

ส่วนหนึ่งของ [[release-plan]] (Phase 6) ครอบคลุม NFR-09, NFR-10, NFR-12, NFR-13, NFR-14, NFR-15 จาก
[[backlog]] (ส่วนที่เหลือของ
[[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)|feature-list ฟีเจอร์ที่ 5]]
หลังจากย้าย NFR-11 ไป [[phase-4-complication-risk-analysis-alerting-tasks|Phase 4]] แล้ว — NFR-16 เป็น
Won't have ไม่รวมในแผนนี้) งานย่อยด้านล่างเขียนด้วยภาษาเชิงพฤติกรรม/ผลลัพธ์เท่านั้น **ไม่ระบุเทคโนโลยี
การ implement** เป็นงานตรวจสอบ/รับรองที่ต้องมีฟีเจอร์จาก Phase 1-5 อยู่ครบก่อนจึงทดสอบได้จริง แม้บาง
task จะเริ่มเตรียมการคู่ขนานกับ Phase ก่อนหน้าได้ในทางปฏิบัติ

| รหัส | ชื่องาน | FR/NFR ที่เกี่ยวข้อง | หมายเหตุ dependency ภายใน phase |
| --- | --- | --- | --- |
| T-6-01 | ทดสอบและยืนยันว่าหน้าจอค้นหา/ประวัติวินิจฉัย/ผลตรวจ lab/ผลวิเคราะห์ความเสี่ยงตอบสนองภายในเวลาน้อยกว่า 2 วินาที | NFR-09 | อาศัยฟีเจอร์จาก Phase 2-4 ครบแล้ว |
| T-6-02 | กำหนดและติดตามเป้าหมายความพร้อมใช้งาน (uptime) ของระบบตาม SLA มาตรฐานที่อ้างอิง | NFR-10 | ไม่มี dependency ภายใน phase (ตั้งค่าได้ตั้งแต่ระบบเริ่มใช้งานจริง) |
| T-6-03 | ทดสอบและยืนยันว่าระบบ auto-logout ผู้ใช้งานโดยอัตโนมัติเมื่อไม่มีการใช้งานต่อเนื่องเกิน 30 นาที | NFR-12 | อาศัยฟีเจอร์เข้าสู่ระบบจาก [[phase-1-authentication-tasks|Phase 1]] ครบแล้ว |
| T-6-04 | ตรวจสอบว่าองค์ประกอบ UI ทุกจุดที่สื่อความหมายด้วยสี (โดยเฉพาะ flag ความเสี่ยงจาก FR-04) มีข้อความกำกับคู่กับสีเสมอ ไม่ใช้สีเป็นสัญญาณเดียว | NFR-13 | อาศัย flag ความเสี่ยงจาก [[phase-4-complication-risk-analysis-alerting-tasks|Phase 4]] ครบแล้ว |
| T-6-05 | ทดสอบอัตโนมัติครอบคลุมทุกกรณีสิทธิ์การเข้าถึงข้อมูล (ผู้ป่วยในความดูแล/นอกความดูแล, บทบาทต่างๆ, บัญชียังไม่ยืนยันอีเมล ฯลฯ) ก่อนใช้งานกับข้อมูลผู้ป่วยจริงทุกครั้ง | NFR-14 | อาศัยกลไกควบคุมสิทธิ์จาก [[phase-2-patient-search-selection-data-protection-foundation-tasks|Phase 2]] และ [[phase-1-authentication-tasks|Phase 1]] ครบแล้ว |
| T-6-06 | ทดสอบว่าระบบแสดงผลได้ถูกต้องบน browser หลักเวอร์ชันล่าสุด (Chrome/Edge/Firefox) บนอุปกรณ์ desktop/tablet | NFR-15 | อาศัยหน้าจอทั้งหมดจาก Phase 1-5 ครบแล้ว |

## อ้างอิง

- [[release-plan]]
- [[backlog]]
- [[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)|feature-list ฟีเจอร์ที่ 5]]
