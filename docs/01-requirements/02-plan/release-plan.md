# Release Plan

แผนแบ่ง phase/release ของโปรเจกต์ track-ncds จัดกลุ่ม FR/NFR ทั้งหมดจาก [[backlog]] (FR-01–FR-10,
NFR-01–NFR-18) ให้เป็นลำดับการพัฒนาที่สอดคล้องกับ dependency เชิงธุรกิจ/เทคนิคที่ระบุใน
[[feature-list]] และ [[architecture]] (Component Diagram, ลำดับ journey) แผนนี้**ไม่ผูก tech stack**
— งานย่อยที่แตกต่อจากแผนนี้ (ดู `docs/01-requirements/03-task/`) เขียนด้วยภาษาเชิงพฤติกรรม/ผลลัพธ์
เท่านั้น

**สถานะ:** ยืนยันโดยผู้ใช้แล้วผ่าน AskUserQuestion ในเทรดหลัก (คำตอบ: "ยืนยันตามแผนนี้") เมื่อ
2026-09-24 — เป็นฉบับแรกของเอกสารนี้ (ก่อนหน้านี้ `02-plan/`/`03-task/` ยังว่างเปล่า)

## ภาพรวม

แบ่งเป็น **6 phase** เรียงตามลำดับ dependency เชิงเส้นตรง (Phase N ต้องเสร็จก่อน Phase N+1 จึงเริ่มงาน
หลักได้ แม้บาง task ของ Phase 6 จะเริ่มคู่ขนานกับ Phase 2-5 ได้ในทางปฏิบัติ แต่ปิดจบสมบูรณ์ได้ก็ต่อเมื่อ
feature ที่เกี่ยวข้องพร้อมแล้วเท่านั้น) — NFR-16 (Interoperability — future) เป็น **Won't have** ตามที่
ยืนยันไว้แล้วใน [[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)|feature-list]]
จึงไม่รวมอยู่ใน phase ใดของแผนนี้

**หมายเหตุสำคัญเรื่องการจัดกลุ่ม:** แผนนี้จัดกลุ่ม FR/NFR แตกต่างจาก 6 ฟีเจอร์ใน [[feature-list]]
บางจุด (แม้ทุกรหัสยังครบถ้วนไม่มีตกหล่น) เพราะการวางแผน phase เน้น dependency ของการพัฒนาจริง ในขณะที่
feature-list จัดกลุ่มเพื่อความเข้าใจเชิงธุรกิจ/เอกสาร ทั้งสองมุมมองไม่จำเป็นต้องตรงกัน 1:1 — จุดที่ต่างมี
ดังนี้:

- ฟีเจอร์ที่ 4 (PDPA, NFR-03–NFR-08) ถูกแยกเป็น 2 phase: ส่วนพื้นฐาน (NFR-03/04/06 — ระดับสูง) อยู่
  Phase 2 ติดกับจุดแรกที่ข้อมูลผู้ป่วยเริ่มไหลเข้าสู่ระบบ ส่วนที่เหลือ (NFR-05/07/08 — ระดับกลาง) อยู่
  Phase 5
- NFR-11 (Clinical Safety Validation) ถูกย้ายจากกลุ่มฟีเจอร์ที่ 5 มาอยู่ Phase 4 ร่วมกับ FR-03/FR-04
  เพราะผูกกับ risk rule engine ของฟีเจอร์นั้นโดยตรง ไม่ใช่ข้อกำหนดคุณภาพทั่วไป
- NFR-01 (แหล่งข้อมูล/Integration) ซึ่งไม่ถูกจัดสรร phase ไว้ชัดเจนในรอบเสนอแผนแรก ถูกกำหนดไว้ที่
  Phase 3 ในฉบับนี้ เนื่องจากเป็นจุดแรกที่ประวัติวินิจฉัย/ผล lab (ข้อมูลจาก HOSxP หรือ mockup) เริ่มถูก
  อ่านเข้าสู่ระบบจริง

## ตารางสรุป Phase ↔ FR/NFR ↔ เหตุผลการจัดลำดับ

| Phase | ชื่อ | FR/NFR ที่ครอบคลุม | เหตุผลการจัดลำดับ |
| --- | --- | --- | --- |
| 1 | [[feature-list#6. สมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่านด้วยอีเมล (Authentication)\|สมัครบัญชี/เข้าสู่ระบบ/จัดการรหัสผ่าน (Authentication)]] | FR-07, FR-08, FR-09, FR-10, NFR-17, NFR-18 | precondition ก่อนฟีเจอร์อื่นทั้งหมดตาม [[architecture]] ("ฟีเจอร์ที่ 6 เป็น precondition ก่อนฟีเจอร์ที่ 1-5 ทั้งหมด") ไม่มีข้อมูลผู้ป่วยเกี่ยวข้อง จึงเริ่มก่อนได้โดยไม่ต้องรอส่วนอื่น |
| 2 | ค้นหา/เลือกผู้ป่วย + การป้องกันข้อมูลพื้นฐาน | FR-05, FR-06, NFR-02, NFR-03, NFR-04, NFR-06 | FR-05/FR-06 เป็นขั้นตอนแรกสุดของ journey ก่อนเห็นข้อมูลผู้ป่วยรายบุคคลใดๆ ([[feature-list#3. ค้นหา/เลือกผู้ป่วยในความดูแล]]) เป็นจุดแรกที่ข้อมูลระบุตัวตนผู้ป่วยเริ่มไหลเข้าสู่ระบบ จึงดึง NFR-02 (สิทธิ์เข้าถึงรายผู้ป่วย), NFR-03 (lawful basis), NFR-04 (เข้ารหัส), NFR-06 (audit log) ซึ่งเป็นระดับสูงทั้งหมดขึ้นมาก่อนแทนที่จะรอถึง phase PDPA ท้ายๆ |
| 3 | [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD\|ดูประวัติวินิจฉัยและผลตรวจ lab]] | FR-01, FR-02, NFR-01 | ต้องมีการเลือกผู้ป่วยจาก Phase 2 ก่อนเสมอ (precondition ตรงตาม [[feature-list]]) NFR-01 (แหล่งข้อมูล HOSxP/mockup) ถูกจัดไว้ที่นี่เพราะเป็นจุดแรกที่ข้อมูลประวัติวินิจฉัย/ผล lab จริงเริ่มถูกอ่านเข้าระบบ |
| 4 | [[feature-list#2. วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน\|วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน]] | FR-03, FR-04, NFR-11 | ต้องมีข้อมูล lab จาก Phase 3 ก่อนจึงวิเคราะห์ความเสี่ยงได้ NFR-11 (Clinical Safety Validation) ย้ายมาจากกลุ่มฟีเจอร์ที่ 5 เพราะผูกกับ risk rule engine ของฟีเจอร์นี้โดยตรง |
| 5 | ส่วนขยาย PDPA — สิทธิของเจ้าของข้อมูลและธรรมาภิบาลข้อมูล | NFR-05, NFR-07, NFR-08 | ส่วนที่เหลือของ [[feature-list#4. คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA\|ฟีเจอร์ที่ 4]] ทั้งหมดเป็นระดับกลาง เป็นกระบวนการเชิงบริหารจัดการที่ต้องมีข้อมูลจริงไหลผ่านระบบแล้ว (จาก Phase 2-4) จึงมีความหมาย วางหลังฟีเจอร์แกนหลักได้โดยไม่บล็อกการใช้งานหลัก |
| 6 | [[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)\|ตรวจสอบ/รับรองคุณภาพเชิงปฏิบัติการทั้งระบบ (Hardening & Verification)]] | NFR-09, NFR-10, NFR-12, NFR-13, NFR-14, NFR-15 | cross-cutting concern ที่ต้องทดสอบ/ยืนยันกับฟีเจอร์ที่สร้างเสร็จแล้วทั้งระบบ (performance testing, security rules automated test, accessibility audit, session timeout, browser compatibility) แม้รหัสส่วนใหญ่เป็นระดับสูง แต่เป็นงานตรวจสอบ/รับรองที่ทำได้แน่นอนก็ต่อเมื่อ feature ที่จะตรวจมีอยู่จริงแล้ว จึงเหมาะเป็น phase สุดท้ายก่อนพร้อมใช้งานจริง (ไม่ใช่เพราะความสำคัญต่ำ — NFR-16 ไม่รวมในแผนนี้เพราะเป็น Won't have) |

## ผังลำดับ Phase

```mermaid
flowchart LR
    P1["Phase 1\nAuthentication\nFR-07–10, NFR-17, NFR-18"]
    P2["Phase 2\nค้นหา/เลือกผู้ป่วย +\nการป้องกันข้อมูลพื้นฐาน\nFR-05, FR-06, NFR-02, 03, 04, 06"]
    P3["Phase 3\nประวัติวินิจฉัย/ผล lab\nFR-01, FR-02, NFR-01"]
    P4["Phase 4\nวิเคราะห์/แจ้งเตือนความเสี่ยง\nFR-03, FR-04, NFR-11"]
    P5["Phase 5\nส่วนขยาย PDPA\nNFR-05, NFR-07, NFR-08"]
    P6["Phase 6\nHardening & Verification\nNFR-09, 10, 12, 13, 14, 15"]

    P1 --> P2 --> P3 --> P4 --> P5 --> P6
```

## รายการ Task ต่อ Phase

การแตกงานย่อยระดับ implementation ของแต่ละ phase อยู่ที่ `docs/01-requirements/03-task/`:

- [[phase-1-authentication-tasks]]
- [[phase-2-patient-search-selection-data-protection-foundation-tasks]]
- [[phase-3-ncd-diagnosis-lab-history-tasks]]
- [[phase-4-complication-risk-analysis-alerting-tasks]]
- [[phase-5-pdpa-data-subject-rights-governance-tasks]]
- [[phase-6-operational-quality-hardening-tasks]]

## ข้อจำกัดของแผนนี้

- แผนนี้อ้างอิงจาก [[backlog]] และ [[feature-list]] ฉบับล่าสุด (2026-09-24) หาก spec/backlog มีการ
  เปลี่ยนแปลงในอนาคต ต้องปรับปรุงเอกสารนี้เฉพาะส่วนที่เปลี่ยนตามกฎ `/sync-phase-plan`
- Task ที่แตกในแต่ละไฟล์ `03-task/` เขียนด้วยภาษาเชิงพฤติกรรม/ผลลัพธ์เท่านั้น **ไม่ระบุเทคโนโลยีการ
  implement ใดๆ** เพราะ `technology-stack.md` แม้จะมีเนื้อหาแล้วในเอกสารเชิงเทคนิค แต่การแตก
  phase/task ระดับนี้ยังคงตั้งใจแยกชั้นออกจากรายละเอียดเทคนิคจริงซึ่งอยู่ที่ `detailed-design/` และ
  เอกสารโค้ดจริงเมื่อเริ่ม dev แทน
