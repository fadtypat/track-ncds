# Prototype v1 — NCDs History & Complication Risk

Clickable HTML Prototype เวอร์ชันแรกของโปรเจกต์ สร้างจาก [[../../feature-list|feature-list]],
[[../../user-journey|user-journey]], [[../../../01-requirements/backlog|backlog]] และยึด
[[../../DESIGN.md|DESIGN.md]] เป็น single source of truth ด้าน visual design ทั้งหมด
(สี/ตัวอักษร/ระยะห่าง/องค์ประกอบ UI/accessibility/responsive)

บทบาทผู้ใช้: **แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD** (ตาม NFR-02) สำหรับหน้าจอ Journey 0–2 และ **Admin
(ผู้ดูแลระบบ)** (ตาม NFR-19, NFR-20) สำหรับหน้าจอ Journey 3 (`admin-*.html`) — 2 บทบาทตาม
[[../../user-journey|user-journey]] ล่าสุด

**อัปเดตล่าสุด (20260922):** แก้ไข `patient-list.html` ให้ค้นหาด้วยเลข HN 7 หลักเท่านั้น (FR-06,
เดิมเป็น free-text) และเพิ่มหน้าจอใหม่ 2 หน้ารองรับฟีเจอร์ที่ 4 "คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม
PDPA" (NFR-03–NFR-08) — ดูรายละเอียดในหัวข้อ "ขอบเขตที่ครอบคลุม (อัปเดต)" ด้านล่าง

**อัปเดตล่าสุด (20260924, รอบที่ 1):** เพิ่มหน้าจอใหม่ 5 หน้ารองรับฟีเจอร์ที่ 6 "สมัครบัญชี เข้าสู่ระบบ และ
จัดการรหัสผ่านด้วยอีเมล (Authentication)" (FR-07–FR-10, NFR-17, NFR-18) ตาม
[[../../user-journey#Journey ผู้ใช้งานสมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่านด้วยอีเมล (Authentication)|journey Authentication]]
ซึ่งเป็น precondition ก่อน Journey ที่ 1 และ 2 เดิมทั้งหมด พร้อมอัปเดต proto-bar nav ของทุกหน้าจอเดิม
(7 หน้า) ให้เชื่อมโยงถึง 5 หน้าใหม่ครบ และเพิ่มปุ่ม "ออกจากระบบ"/"จำลอง: เซสชันหมดอายุอัตโนมัติ (NFR-12)"
ใน `patient-list.html` เพื่อสาธิตจุดเชื่อมต่อกลับไปยัง `login.html` — ไม่ได้แก้ไข logic เดิมของ 7
หน้าจอ Journey ที่ 1/2 นอกเหนือจาก proto-bar nav และ header ของ `patient-list.html`

**อัปเดตล่าสุด (20260924, รอบที่ 3 — แก้บั๊ก):** แก้ไข 2 จุดใน `admin-user-directory.html` และ
`admin-patient-detail-readonly.html` ตาม api-spec Operation 12/13 (ดูรายละเอียดในหมายเหตุ
simplification ท้ายเอกสารนี้) — ไม่มีไฟล์ใหม่ ไม่มี class/สี/สไตล์ใหม่นอก DESIGN.md

**อัปเดตล่าสุด (20260924, รอบที่ 2):** เพิ่มหน้าจอใหม่ 6 หน้ารองรับฟีเจอร์ที่ 7 "จัดการบัญชีผู้ใช้งาน
สิทธิ์ และการมอบหมายผู้ป่วย (Admin)" (FR-11–FR-15, NFR-19, NFR-20) ตาม
[[../../user-journey#Journey Admin อนุมัติบัญชีผู้ใช้งาน จัดการสิทธิ์ และดูประวัติผู้ป่วยทุกรายแบบอ่านอย่างเดียว|journey Admin]],
เพิ่มส่วนยืนยัน/แก้ไขผลการประเมินความเสี่ยง (FR-16) ในหน้า `patient-detail-risk-found.html` และ
`patient-detail-no-risk.html`, แก้ข้อความใน `verify-email-notice.html` จาก "รออนุมัติผ่าน Firebase
Console/Firestore" เป็น "รอ Admin อนุมัติผ่านหน้าจอในระบบ" (FR-11 แทนที่กลไกเดิม), เพิ่มบัญชีจำลอง
`admin@ncds-demo.local` ใน `login.html` ที่นำไปยัง `admin-dashboard.html` แทน `patient-list.html`,
และอัปเดต proto-bar nav ของทุกหน้าจอเดิมทั้ง 12 หน้าให้เชื่อมโยงถึง 6 หน้าใหม่ครบ — ไม่ได้แก้ไข logic
เดิมของหน้าจออื่นนอกเหนือจากที่ระบุนี้

## ขอบเขตที่ครอบคลุม (อัปเดต)

ครอบคลุมทั้ง 7 ฟีเจอร์ Must have ใน [[../../feature-list|feature-list]] (ฟีเจอร์ 1–4, 6 และ 7 มีหน้าจอ
โดยตรง — ฟีเจอร์ 5 เป็น cross-cutting quality ที่สะท้อนผ่านพฤติกรรม/หมายเหตุในหน้าจออื่นแทนหน้าจอเฉพาะ)
และทั้ง 4 journey ใน [[../../user-journey|user-journey]]:

- **Journey 0** (precondition ก่อน journey อื่นทั้งหมด, ฟีเจอร์ 6): สมัครบัญชี (`signup.html`,
  แสดงกฎรหัสผ่านขั้นต่ำแบบ live ตาม NFR-17) → ยืนยันอีเมล/รออนุมัติบัญชี (`verify-email-notice.html`,
  สาธิตทั้ง 2 สถานะ) → เข้าสู่ระบบ (`login.html`, ครบ 3 แขนงผลลัพธ์: ผิดพลาด/ยังไม่ยืนยันอีเมล/สำเร็จ
  — ข้อความผิดพลาดเป็นแบบทั่วไปเสมอตาม NFR-18) → ลืมรหัสผ่าน/ตั้งรหัสผ่านใหม่ (`forgot-password.html`,
  `reset-password.html`) เชื่อมต่อกับ `patient-list.html` ทั้งขาเข้า (login สำเร็จ → ไปหน้ารายชื่อผู้ป่วย)
  และขาออก (ปุ่ม "ออกจากระบบ"/"จำลอง: เซสชันหมดอายุอัตโนมัติ" → กลับไป `login.html`)

- **Journey 1** (routine การดูแลผู้ป่วย, ฟีเจอร์ 1–3): ตรวจสิทธิ์ → ค้นหา/เลือกผู้ป่วยด้วยเลข HN
  7 หลัก (รวม validation flow D1–D5: กรอกไม่ครบ 7 หลัก/ค้นหาไม่พบ → แจ้งเตือนแล้วกรอกใหม่ได้ ไม่บล็อก
  รายชื่อทั้งหมด) → ดูประวัติวินิจฉัย → ดูผล lab ย้อนหลัง → วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน
  รวมทั้งสองแขนงของผลลัพธ์ FR-04 (พบ/ไม่พบความเสี่ยง) และสถานะ guard ของ NFR-02 (ปฏิเสธการเข้าถึง)
- **Journey 2** (เหตุการณ์ PDPA, ฟีเจอร์ 4): แยก 2 เส้นทางตาม
  [[../../user-journey#Journey เจ้าหน้าที่ดำเนินการตามคำขอใช้สิทธิของเจ้าของข้อมูล และสนับสนุนการสืบสวนกรณีข้อมูลส่วนบุคคลรั่วไหล (PDPA)|user-journey]]:
  - เส้นทางคำขอใช้สิทธิของเจ้าของข้อมูล — ใช้ Operation 0 (ค้นหาด้วย HN ในหน้าจอที่ 1) เป็น
    precondition แล้วต่อด้วยหน้าจอเลือกประเภทคำขอ (เข้าถึง/สำเนา/แก้ไข/ลบ/คัดค้าน) + แสดงผลลัพธ์
    แบบ interactive ครบทั้ง 3 แขนงผลลัพธ์ตาม state diagram ใน
    [[../../02-technical/detailed-design/pdpa-data-protection-compliance|detailed-design]]
    (ดำเนินการสำเร็จ / ปฏิเสธคำขอเพราะ RetentionPolicy / input ไม่ถูกต้อง)
  - เส้นทางสงสัยข้อมูลรั่วไหล — หน้าจอสืบค้น audit trail (ระบุผู้ป่วย/ช่วงเวลา/ผู้ใช้ — ไม่บังคับ)
    พร้อม validation หลังกดค้นหา (ช่วงเวลาไม่ถูกต้อง / HN รูปแบบผิด / ไม่มีสิทธิ์เข้าถึงผู้ป่วยรายนั้น
    ตาม NFR-02) และแสดงผลลัพธ์ audit log เป็นตาราง

- **Journey 3** (บริหารจัดการ, ฟีเจอร์ 7 — Admin): Admin เข้าสู่ระบบสำเร็จ (บัญชีจำลอง
  `admin@ncds-demo.local` ใน `login.html`) → แผงควบคุม (`admin-dashboard.html`) → เลือกงานอย่างใด
  อย่างหนึ่งแล้ววนกลับมาเลือกงานอื่นต่อได้ (ไม่ใช่ flow เชิงเส้น):
  - อนุมัติบัญชีใหม่ (`admin-account-approval.html`) — เลือก role (แพทย์/พยาบาล) แล้วอนุมัติ
  - เปลี่ยนบทบาท/ระงับ-เปิดใช้งานบัญชี (`admin-user-directory.html`) — ตารางผู้ใช้งานที่อนุมัติแล้ว
    พร้อมปุ่มเปลี่ยน role และสลับสถานะใช้งาน/ระงับ
  - จัดการการมอบหมายผู้ป่วย (`admin-patient-assignment.html`) — มอบหมายผู้ป่วยรายใหม่ + ยกเลิก
    การมอบหมายเดิม
  - ดูประวัติผู้ป่วยทุกรายแบบอ่านอย่างเดียว (`admin-patient-directory.html` →
    `admin-patient-detail-readonly.html`) — ไม่จำกัดด้วย PatientAssignment (NFR-19) พร้อมสาธิต
    audit log แบบ fail-safe ทั้งสองแขนงผลลัพธ์ (สำเร็จ/ไม่สำเร็จ) ตาม NFR-20

  นอกจากนี้ FR-16 (ยืนยัน/แก้ไขผลการประเมินความเสี่ยงของแพทย์/พยาบาล) ถูกเพิ่มเข้าไปในหน้า
  `patient-detail-risk-found.html` และ `patient-detail-no-risk.html` เดิม (Journey 1) เป็น section
  ท้ายหน้า ไม่ใช่หน้าจอแยก เพราะ FR-16 ผูกกับข้อมูลผู้ป่วยรายเดียวกันที่แสดงอยู่แล้วในหน้านั้น

## ตาราง journey/ฟีเจอร์ ↔ ไฟล์ ↔ รหัส FR/NFR

| ไฟล์ | Journey step / ฟีเจอร์ (feature-list.md) | รหัส FR/NFR ที่ครอบคลุม |
| --- | --- | --- |
| `index.html` | หน้ารวมลิงก์ทุกหน้าจอ จัดกลุ่มตาม journey (3 journey) พร้อม badge บทบาทผู้ใช้ | — |
| `login.html` | ฟีเจอร์ 6 — Journey 0 ขั้นตอนที่ 8–11 (เข้าสู่ระบบ, ครบ 3 แขนงผลลัพธ์) + ปลายทาง auto-logout | FR-07, NFR-18, NFR-12 (ปลายทาง) |
| `signup.html` | ฟีเจอร์ 6 — Journey 0 ขั้นตอนที่ 2–4 (สมัครบัญชี + validation รหัสผ่านแบบ live) | FR-08, NFR-17, NFR-18 |
| `verify-email-notice.html` | ฟีเจอร์ 6 — Journey 0 ขั้นตอนที่ 5–7 (ส่งอีเมลยืนยัน + รออนุมัติบัญชี) | FR-09, FR-08 (รออนุมัติ) |
| `forgot-password.html` | ฟีเจอร์ 6 — Journey 0 ขั้นตอนที่ 12–14 (ขอลิงก์รีเซ็ตรหัสผ่าน) | FR-10, NFR-18 |
| `reset-password.html` | ฟีเจอร์ 6 — Journey 0 ขั้นตอนที่ 15–16 (ตั้งรหัสผ่านใหม่ + validation) | FR-10, NFR-17 |
| `patient-list.html` | ฟีเจอร์ 3 — ค้นหา/เลือกผู้ป่วยในความดูแล (Journey 1 ขั้นตอนที่ 3–8, รวม validation D1–D5) + จุดเชื่อมต่อ logout/auto-logout กลับ Journey 0 | FR-05, FR-06, NFR-02, NFR-12 (ปุ่มจำลอง) |
| `patient-detail-risk-found.html` | ฟีเจอร์ 1 (ขั้นตอนที่ 10–11) + ฟีเจอร์ 2 (ขั้นตอนที่ 12–15 รวม override) — ผู้ป่วยตัวอย่าง นายสมชาย ใจกล้า | FR-01, FR-02, FR-03, FR-04, FR-16, NFR-01 |
| `patient-detail-no-risk.html` | ฟีเจอร์ 1 (ขั้นตอนที่ 10–11) + ฟีเจอร์ 2 (ขั้นตอนที่ 12–15 รวม override) — ผู้ป่วยตัวอย่าง นายวิชัย ถุงลมดี | FR-01, FR-02, FR-03, FR-04, FR-16, NFR-01 |
| `access-denied.html` | สถานะ guard ก่อนเข้าถึงข้อมูลผู้ป่วยรายบุคคล (Journey 1 ขั้นตอนที่ 1–2 แขนง "ไม่มีสิทธิ์") | NFR-02 |
| `pdpa-data-subject-request.html` | ฟีเจอร์ 4 — Journey 2 เส้นทางคำขอใช้สิทธิของเจ้าของข้อมูล (ขั้นตอนที่ 2–3) | NFR-03, NFR-05, NFR-06, NFR-07 (precondition: FR-05, FR-06) |
| `pdpa-audit-trail.html` | ฟีเจอร์ 4 — Journey 2 เส้นทางสงสัยข้อมูลรั่วไหล (ขั้นตอนที่ 4–5) | NFR-02, NFR-06, NFR-08 |
| `admin-dashboard.html` | ฟีเจอร์ 7 — Journey 3 ขั้นตอนที่ 1–2 (Admin เข้าสู่ระบบสำเร็จ + เมนูเลือกงาน) | FR-11, FR-12, FR-13, FR-14, FR-15, NFR-19, NFR-20 |
| `admin-account-approval.html` | ฟีเจอร์ 7 — Journey 3 ขั้นตอนที่ 3–4 (อนุมัติบัญชีใหม่ + กำหนด role/isActive) | FR-11 |
| `admin-user-directory.html` | ฟีเจอร์ 7 — Journey 3 ขั้นตอนที่ 5–7 (เปลี่ยน role + ระงับ/เปิดใช้งานบัญชี) | FR-12, FR-13 |
| `admin-patient-assignment.html` | ฟีเจอร์ 7 — Journey 3 ขั้นตอนที่ 8 (มอบหมาย/ยกเลิกมอบหมายผู้ป่วย) | FR-14 |
| `admin-patient-directory.html` | ฟีเจอร์ 7 — Journey 3 ขั้นตอนที่ 9 (เลือกผู้ป่วยรายใดก็ได้ในระบบ ไม่ต้องมี PatientAssignment) | FR-15, NFR-19 |
| `admin-patient-detail-readonly.html` | ฟีเจอร์ 7 — Journey 3 ขั้นตอนที่ 10–11 (audit log แบบ fail-safe + แสดงข้อมูลอ่านอย่างเดียว ทั้งสองแขนงผลลัพธ์) | FR-15, NFR-19, NFR-20 |
| `style.css` | CSS custom properties + component class แปลงจาก DESIGN.md §2–§7 ทั้งหมด (รวม form control class ที่ประกอบเพิ่มสำหรับ 2 หน้าจอ PDPA, class `.auth-shell`/`.auth-card`/`.password-rules` สำหรับ 5 หน้าจอ Authentication — ไม่มี class ใหม่เพิ่มสำหรับ 6 หน้าจอ Admin เพราะใช้ `.chip`/`.status-pill`/`.trend-table`/`.form-field`/`.radio-group`/`.textarea-input`/`.denied-shell` เดิมทั้งหมด) | — |

## หมายเหตุการตีความ/simplification ของ mockup data

- รายชื่อผู้ป่วยใน `patient-list.html` มี 4 การ์ด แต่เชื่อมไปยังหน้าตัวอย่างจริงเพียง 2 หน้า
  (`patient-detail-risk-found.html` และ `patient-detail-no-risk.html`) — จับคู่การ์ด 2 คู่ที่มี
  risk badge ระดับเดียวกันไปยังหน้าเดียวกัน เพื่อไม่ให้ badge บนการ์ดขัดกับ badge ในหน้ารายละเอียด
  ระบบจริงจะมีข้อมูลรายบุคคลแยกกันทุกคน ไม่ใช่ใช้ข้อมูลซ้ำแบบนี้
- ข้อมูลผู้ป่วย/ผลตรวจ lab/ผลวิเคราะห์ความเสี่ยงทั้งหมดเป็น mockup ตาม NFR-01 (HOSxP ยังไม่เชื่อมต่อจริง)
- ตัวเลข % และ threshold ที่ใช้ตัดสินระดับความเสี่ยงเป็นค่าสาธิตเท่านั้น **ยังไม่ยืนยันจากผู้เชี่ยวชาญ**
  ตรงกับหมายเหตุใน [[../../DESIGN.md#2.3 Risk & clinical-value tokens (ใช้กับ FR-03/FR-04 เท่านั้น)|DESIGN.md §2.3]]
  และ spec ต้นทางหัวข้อ "สมมติฐาน" — ทุกหน้า detail มี callout "note" ย้ำหมายเหตุนี้ไว้แล้ว
- ใช้สีที่มีอยู่ใน DESIGN.md §2.1 ครบทุกจุด ยกเว้น `slate-300`, `slate-400`, `sky-300` ซึ่งไม่ได้อยู่ใน
  ตาราง §2.1 แต่ถูกอ้างถึงโดยชื่อ semantic token ในเอกสารเดียวกัน (`--border-strong`, `--text-faint`,
  `--trend-flat`, `--border-hover`) จึงเติมเป็นค่ามาตรฐาน Tailwind ของเฉดเดียวกัน — ไม่ใช่การกำหนดสีใหม่
  นอกจานสี ระบุไว้เป็น comment ใน `style.css` ด้วย
- (อัปเดต 20260922) `patient-list.html` เปลี่ยนจากค้นหา free-text เป็นค้นหาเฉพาะเลข HN 7 หลัก
  (FR-06) — ใช้ JS ฝั่ง client (vanilla, ไม่มี library ภายนอก) จำลอง validation หลังกดปุ่ม "ค้นหา"
  เท่านั้น (ไม่ real-time ตามที่ user-journey กำหนด) จับคู่กับ mock ผู้ป่วย 4 รายเดิมด้วยค่า HN 7 หลัก
  ล้วน (ไม่มี "HN-" prefix ในค่าที่ใช้ค้นหาจริง ต่างจาก label ที่แสดงผล) — ระบบจริงจะ query จากฐานข้อมูล
  แทนอาร์เรย์ในหน้า client
- (ใหม่ 20260922) การ์ดผลลัพธ์ที่ได้จากการค้นหา HN สำเร็จใน `patient-list.html` มีปุ่มรอง
  "ดำเนินการคำขอสิทธิ PDPA สำหรับผู้ป่วยรายนี้" ลิงก์ไป `pdpa-data-subject-request.html` เพื่อสาธิต
  precondition "ใช้ Operation 0 (ค้นหาด้วย HN) ร่วมกับหน้าจอที่ 1" ตาม detailed-design — จงใจไม่เพิ่ม
  ปุ่มนี้ในการ์ดผู้ป่วยของรายชื่อทั้งหมด (4 การ์ดด้านล่าง) เพื่อไม่ให้มีปุ่มที่ 2 ต่อการ์ดโดยไม่จำเป็น และ
  ให้ตรงกับ wording ของ spec ที่เน้นเส้นทางค้นหาด้วย HN
- (ใหม่ 20260922) `pdpa-data-subject-request.html`: banner ผู้ป่วยที่แสดง (นายสมชาย ใจกล้า, HN
  6500123) เป็นข้อมูลตายตัว **ไม่เชื่อมกับค่า HN ที่ผู้ใช้กรอกจริงใน `patient-list.html`** — เป็น
  simplification ของ mockup แบบเดียวกับที่ทำในหน้า patient-detail ทั้งสอง; ช่อง "จำลองสถานการณ์"
  (checkbox ระงับการลบ) เป็นกลไกสาธิต prototype เท่านั้น ไม่มีอยู่ใน sequence diagram จริง (ใช้แทน
  การมี RetentionPolicy จริงที่ยังไม่ถูกกำหนดค่า)
- (ใหม่ 20260922) `pdpa-audit-trail.html`: ข้อมูล audit log ทั้ง 6 แถวเป็น mockup คงที่ ไม่ได้ผูกกับ
  การกระทำจริงในหน้าอื่นของ prototype นี้ (เช่น การค้นหา HN ใน `patient-list.html` จะไม่สร้างแถวใหม่
  ในตารางนี้จริง) — สาธิตเฉพาะรูปแบบการ filter/แสดงผลเท่านั้น
- (ใหม่ 20260922) การเลือกใช้ `callout.note` (สีเหลือง amber) แทน `callout.warn` (สีแดง rose) สำหรับ
  ข้อความ validation ทั่วไป (HN ไม่ครบ 7 หลัก/ไม่พบผู้ป่วย/ช่วงเวลาไม่ถูกต้อง) เป็นการตีความของ agent
  เพราะ `warn` ใน DESIGN.md §5 ผูกความหมายกับ "ปัจจัยเสี่ยงทางคลินิกที่พบ (FR-04)" ไว้แล้ว การใช้สีเดียวกัน
  กับ validation message ทั่วไปอาจทำให้ผู้ใช้สับสนว่าเป็นคำเตือนทางคลินิก — ส่วนกรณี "ปฏิเสธสิทธิ์เข้าถึง"
  (NFR-02 ใน `pdpa-audit-trail.html`) และ "ระงับการลบเพราะ RetentionPolicy" (NFR-05 ใน
  `pdpa-data-subject-request.html`) ยังคงใช้ `callout.warn` เพราะเป็นผลลัพธ์เชิงปฏิเสธที่ควรเด่นชัดกว่า
- (ใหม่ 20260924) DESIGN.md ไม่มี component สำเร็จรูปสำหรับหน้าจอ authentication (login/signup/ฯลฯ)
  จึงประกอบ class ใหม่ 3 กลุ่มจาก token/pattern ที่มีอยู่แล้วทั้งหมด (ไม่มีสี/ค่าใหม่นอกจาน DESIGN.md):
  `.auth-shell`/`.auth-card` ประกอบจากเลย์เอาต์ `.denied-shell`/`.denied-card` เดิม (การ์ดกลางจอ),
  `.auth-icon` ประกอบจาก `.denied-icon` เดิมแต่เพิ่มตัวแปรสี info/pending/success จากสี base scale เดียวกัน
  (sky-100/700, amber-100/800, emerald-100/800 ที่มีอยู่ใน `:root` แล้ว), และ `.password-rules` ประกอบจาก
  ความหมาย "ผ่าน/ไม่ผ่านเงื่อนไข" แบบเดียวกับ `--value-normal-fg`/`--value-abnormal-fg` ของ lab value tile
  (ฟีเจอร์ 1) — นำมาใช้ซ้ำกับความหมาย "รหัสผ่านตรง/ไม่ตรงเงื่อนไขนี้" แทน โดยข้อความกำกับ (เช่น "อย่างน้อย
  8 ตัวอักษร") ยังคงอยู่คู่กับสี/ไอคอนเสมอ ไม่ใช้สีเป็นสัญญาณเดียว
- (ใหม่ 20260924) `login.html`/`signup.html`/`reset-password.html` ใช้ JS ฝั่ง client (vanilla, ไม่มี
  library ภายนอก, มี `escapeHtml` ใน `login.html`) จำลอง flow ทั้งหมดแบบไม่มี backend จริง — บัญชีจำลอง
  ที่กำหนดไว้ใน `login.html` (`doctor@ncds-demo.local`/`Passw0rd1` ยืนยันแล้ว,
  `pending@ncds-demo.local`/`Passw0rd1` ยังไม่ยืนยัน) เป็นข้อมูล mockup ตาม NFR-01 ไม่ใช่บัญชีจริงใน
  Firebase Authentication ระบบจริงจะเรียก Firebase Authentication SDK แทนอาร์เรย์ในหน้า client
- (ใหม่ 20260924) `verify-email-notice.html` อ่าน query string (`?state=just-signed-up` จาก
  `signup.html`, `?state=pending-verify` จาก `login.html`) เพื่อสาธิตทั้งสองเส้นทางที่นำไปสู่หน้านี้ตาม
  user-journey (ขั้นตอนที่ 5–7 และขั้นตอนที่ 10 แขนง "ยังไม่ยืนยัน") — ปุ่ม "จำลอง: กดลิงก์ยืนยันจากอีเมล
  แล้ว" สลับ panel ในหน้าเดียวกันด้วย JS โดยไม่มีการยืนยันอีเมลจริง (ไม่มีอีเมลจริงถูกส่งใน prototype นี้)
- (ใหม่ 20260924) ปุ่ม "จำลอง: เซสชันหมดอายุอัตโนมัติ (NFR-12)" และ "ออกจากระบบ" ใน `patient-list.html`
  ลิงก์ไป `login.html#session-expired` และ `login.html#logged-out` ตามลำดับ ใช้ URL fragment (`#...`)
  เพื่อสาธิตข้อความที่แตกต่างกันโดยไม่ต้องมี session state จริง — เป็นการจำลองปลายทางของ NFR-12
  (auto-logout) ไม่ใช่การ implement inactivity timer จริงในหน้านี้ (out of scope ของ prototype)
- (ใหม่ 20260924 รอบที่ 2) DESIGN.md ไม่มี component สำเร็จรูปสำหรับหน้าจอบริหารจัดการ (ตาราง
  ผู้ใช้งาน/badge บทบาท/สถานะบัญชี) จึงนำ component ที่มีอยู่แล้วมาใช้ซ้ำทั้งหมดโดยไม่เพิ่ม class/สีใหม่:
  ใช้ `.chip.chip-chronic` (sky) แทนป้ายบทบาท "แพทย์", `.chip.chip-ckd` (purple) แทนป้ายบทบาท
  "พยาบาล" และ `.chip.chip-neutral` (slate) แทนข้อความข้อมูลทั่วไป (เช่น "ผู้ดูแล: ...") — นำสีที่เดิมใช้
  สื่อความหมาย "โรคเรื้อรัง/staging" มาสื่อความหมาย "บทบาทผู้ใช้งาน" แทน เพราะเป็นบริบทคนละหน้าจอกัน
  (หน้าจอ Admin ไม่มีข้อมูลโรคของผู้ป่วยปะปนอยู่ จึงไม่ทำให้สับสน) ทุกจุดยังคงมีข้อความกำกับคู่กับสีเสมอ
  ตาม NFR-13; ใช้ `.status-pill.pending/.success/.rejected` (เดิมออกแบบไว้สำหรับสถานะคำขอ PDPA) แทน
  สถานะบัญชี "รออนุมัติ/ใช้งานอยู่/ระงับการใช้งาน" และสถานะการมอบหมายผู้ป่วย "มอบหมายอยู่/ยกเลิกแล้ว"
  ด้วยเหตุผลเดียวกัน; ใช้ `.trend-table`/`.trend-table-wrap` (เดิมออกแบบสำหรับตารางค่า lab) เป็นตาราง
  ผู้ใช้งาน/การมอบหมายผู้ป่วยทั่วไป เพราะโครงสร้างตาราง (thead sticky, responsive overflow-x) ตรงกับ
  ความต้องการโดยไม่ต้องเพิ่ม CSS ใหม่; ใช้ `.denied-shell`/`.denied-card` เดิมแสดงสถานะปฏิเสธการเข้าถึง
  เมื่อจำลอง audit log บันทึกไม่สำเร็จใน `admin-patient-detail-readonly.html` (NFR-20)
- (ใหม่ 20260924 รอบที่ 2) ข้อมูลบัญชี/ผู้ป่วย/การมอบหมายทั้งหมดในหน้าจอ Admin เป็น mockup คงที่ตาม
  NFR-01 ไม่เชื่อมกับข้อมูลในหน้าจออื่นของ prototype จริง (เช่น การอนุมัติบัญชีใน
  `admin-account-approval.html` ไม่ทำให้บัญชีนั้นใช้ login ได้จริงใน `login.html`) — สาธิตเฉพาะรูปแบบ
  การนำเสนอ/ปฏิสัมพันธ์เท่านั้น
- (ใหม่ 20260924 รอบที่ 2) `admin-patient-directory.html`: การ์ดผู้ป่วยทั้ง 6 ใบเชื่อมไปยังหน้าตัวอย่าง
  เดียวกัน (`admin-patient-detail-readonly.html`) ด้วยเหตุผล simplification แบบเดียวกับที่ทำใน
  `patient-list.html` เดิม — ระบบจริงจะมีข้อมูลรายบุคคลของแต่ละคนแยกกัน
- (ใหม่ 20260924 รอบที่ 2) FR-16 (ยืนยัน/แก้ไขผลการประเมินความเสี่ยง) แสดงเป็น section ท้ายหน้า
  `patient-detail-risk-found.html`/`patient-detail-no-risk.html` แทนที่จะแยกหน้าใหม่ เพราะ user-journey
  ระบุว่าขั้นตอนนี้เกิดขึ้นทันทีหลังดูผลวิเคราะห์ความเสี่ยงของผู้ป่วยรายเดียวกัน (ขั้นตอนที่ 15 ของ
  Journey 1) ไม่ใช่ context switch ไปหน้าจอใหม่ — ปุ่ม "แก้ไขผลประเมิน (Override)" บังคับกรอกเหตุผลก่อน
  บันทึกเสมอ (ปุ่ม "บันทึกการแก้ไข" ตรวจสอบ reason ว่างแล้วแจ้งเตือนด้วย `callout.note`)
- (ใหม่ 20260924 รอบที่ 2) `verify-email-notice.html`: แก้ข้อความ panel "รอผู้ดูแลระบบอนุมัติบัญชี"
  จาก "ผ่าน Firebase Console/Firestore ด้วยตนเอง ... ไม่มีหน้าจออนุมัติในระบบสำหรับ MVP" เป็น "Admin
  อนุมัติผ่านหน้าจอในระบบ (FR-11)" ให้ตรงกับทิศทางใหม่ของ spec `20260924-01-admin-role-account-management`
  ที่แทนที่การตัดสินใจเดิมใน spec authentication
- (ใหม่ 20260924 รอบที่ 2) `login.html`: เพิ่มบัญชีจำลอง `admin@ncds-demo.local` / `Passw0rd1`
  (`role: "admin"`) ในอาร์เรย์ `accounts` เดิม เข้าสู่ระบบสำเร็จแล้วนำไปยัง `admin-dashboard.html`
  แทน `patient-list.html` เพื่อสาธิตการแยกเส้นทางตามบทบาทหลัง FR-07 สำเร็จ — เป็น mockup client-side
  ไม่ใช่การตรวจสอบ Custom Claims/Firestore จริง
- **(แก้บั๊ก 20260924 รอบที่ 3) `admin-user-directory.html`:** เพิ่มแถวของ Admin ที่เข้าสู่ระบบอยู่
  (กานดา ตรวจตรา, `data-self="true"`) ไว้บนสุดของตาราง ตาม api-spec Operation 12/13 ที่ระบุว่า admin
  แก้ไขสิทธิ์ (role/isActive) ของตัวเองไม่ได้ — select/ปุ่มของแถวนี้ใส่ `disabled` ทั้งหมดและมีข้อความ
  กำกับ "ไม่สามารถแก้ไขสิทธิ์ของตนเองได้ (Op.12/Op.13)" ต่อท้าย (ไม่ใช้สีเป็นสัญญาณเดียวตาม NFR-13)
  สคริปต์ข้ามการผูก event ให้แถวนี้ด้วยเงื่อนไข `data-self`; เพิ่มตัวเลือก `admin` ในทุก dropdown เปลี่ยน
  role ของผู้ใช้อื่น (u1–u4) และเพิ่มค่า `admin` ใน `roleLabel`/`roleChipClass` ของ JS (ใช้
  `.chip.chip-neutral` แบบเดียวกับที่ใช้แสดงบทบาท Admin ในหน้าจอ Admin อื่นอยู่แล้ว ไม่ใช่สีใหม่)
- **(แก้บั๊ก 20260924 รอบที่ 3) `admin-patient-detail-readonly.html`:** พบว่า `#access-check`
  (`class="callout tip"`) และ `#denied-panel` (`class="denied-shell"`) เดิมใส่ attribute `hidden` ไว้
  บน element เดียวกับ class ที่กำหนด `display:flex` ตรงๆ — ตามกฎ cascade ของ CSS, author rule (class
  ใน `style.css`) ชนะ user-agent rule `[hidden]{display:none}` เสมอไม่ว่าค่า specificity จะเท่ากัน ทำให้
  `element.hidden = true` ทาง JS ไม่ซ่อน element จริง (กล่อง "บันทึก audit log สำเร็จ" ค้างแสดงคู่กับ
  หน้าปฏิเสธหลังกด "จำลอง: บันทึก audit log ไม่สำเร็จ") แก้โดยห่อเนื้อหาเดิมด้วย wrapper `<div>` เปล่า
  (ไม่มี class ที่กำหนด display ใดๆ) แล้วย้าย `id`/`hidden` ไปไว้ที่ wrapper แทน ส่วน class เดิม
  (`.callout tip`, `.denied-shell`) ยังคงอยู่ที่ inner `<div>` เหมือนเดิมทุกประการ — ไม่มีการแก้ `style.css`
  หรือเพิ่มสี/สไตล์ใหม่ใดๆ, ไม่แก้ JS (ยัง toggle `hidden` ที่ id เดิม `#access-check`/`#denied-panel`
  ทำงานถูกต้องแล้วเพราะ wrapper ไม่มี class ขัดแย้ง) ปุ่ม "ลองบันทึก audit log อีกครั้ง" กลับสถานะเดิมได้
  ถูกต้องแล้วด้วยเหตุผลเดียวกัน

## จุดที่เน้นตาม NFR/หลักการออกแบบ (DESIGN.md §1, §6, §7)

- **Clinical clarity / สีไม่ใช่สัญญาณเดียว**: risk badge และ lab value tile ทุกจุดมีข้อความกำกับคู่กับสี
  เสมอ (เช่น "เสี่ยง สูงมาก", "ผิดปกติ") ตามกฎ accessibility §6
- **Rule-based ไม่ใช่ AI**: ทุกหน้า risk analysis แสดง callout "ปัจจัยเสี่ยงที่พบ" (warn) คู่กับ
  "คำแนะนำเชิงระบบ" (tip) เสมอ ไม่สลับสี ตรงกับกฎในข้อ 5 (Component Inventory)
- **Responsive ตาม §7**: ทดสอบด้วยการอ่านโครงสร้าง CSS กลับ (ไม่ได้รันเบราว์เซอร์จริง) —
  stat tile stack แนวตั้งบนมือถือ/desktop เป็น 3 คอลัมน์, patient card grid 1/2/3 คอลัมน์ตาม breakpoint,
  trend table มี sticky คอลัมน์แรก + wrapper `overflow-x:auto`, risk progress bar list เป็น
  `flex-direction:column` ตรึงทุก breakpoint (ไม่มี grid 2 คอลัมน์), visit tabs เป็นแถว flex
  `overflow-x:auto` เดียวรองรับทั้ง scroll บนมือถือและแถวเต็มบน desktop, header/action bar สลับ
  `flex-direction` ที่ breakpoint 1024px ตาม §7
- **Touch target**: ปุ่ม (`.btn`), search input, visit tab กำหนด `min-height` ≥ 40–44px ตามกฎ §6
- **Focus ring**: `:focus-visible` ใช้ `--ring-focus-shadow` กับทุก element ที่กด/พิมพ์ได้ ตามกฎ §6
- **NFR-02 access control**: `access-denied.html` สาธิต guard state ทั้งสองเหตุผล (บทบาทไม่ถูกต้อง /
  ผู้ป่วยไม่อยู่ในความดูแล) — เป็นหน้าจอที่ผู้ใช้จริงจะไม่เห็นบ่อย แต่จำเป็นต่อการสาธิตขอบเขต NFR-02
  ให้ครบตาม user-journey node Z

## ตรวจสอบตัวเอง (self-check ก่อนจบงาน)

- อ่านไฟล์ HTML ทั้ง 7 ไฟล์ + `style.css` กลับมาตรวจแล้ว (20260922): `href` ของ proto-bar และปุ่ม
  primary action ในทุกไฟล์ตรงกับชื่อไฟล์จริงที่สร้าง (`index.html`, `patient-list.html`,
  `patient-detail-risk-found.html`, `patient-detail-no-risk.html`, `access-denied.html`,
  `pdpa-data-subject-request.html`, `pdpa-audit-trail.html`) ไม่มีลิงก์ตาย, ทุกไฟล์
  `<link rel="stylesheet" href="style.css">` ถูกต้อง, proto-bar-nav ของทั้ง 7 ไฟล์เชื่อมโยงถึงกันครบ
  (เพิ่มลิงก์ไปยัง 2 หน้าใหม่ในไฟล์เดิมทั้ง 5 ไฟล์แล้ว)
- ตรวจ JS แบบอ่านโค้ดกลับ (ไม่ได้รันจริง) ในทั้ง 3 ไฟล์ที่มี `<script>` (`patient-list.html`,
  `pdpa-data-subject-request.html`, `pdpa-audit-trail.html`): แท็ก/วงเล็บ/quote ปิดครบ, มีฟังก์ชัน
  `escapeHtml` ป้องกันข้อความที่ผู้ใช้กรอกถูกแสดงกลับโดยไม่ escape, ทุก `getElementById` อ้าง id ที่มีอยู่
  จริงในไฟล์เดียวกัน
- ตรวจ `style.css`: class ใหม่ทั้งหมด (`.form-field`, `.text-input`, `.select-input`,
  `.textarea-input`, `.radio-group`/`.radio-option`, `.checkbox-row`, `.field-row`, `.status-pill`)
  ใช้เฉพาะ CSS custom property ที่นิยามไว้แล้วใน `:root` ของไฟล์เดิม ไม่มีค่าสี/ระยะห่างใหม่
- **(20260924)** อ่านไฟล์ใหม่ทั้ง 5 ไฟล์ (`login.html`, `signup.html`, `verify-email-notice.html`,
  `forgot-password.html`, `reset-password.html`) กลับมาตรวจแล้ว: แท็กเปิด/ปิดครบ, attribute ใส่
  quote ครบคู่, `<link rel="stylesheet" href="style.css">` ถูกต้องทุกไฟล์, proto-bar-nav มีลิงก์ครบ
  ทั้ง 12 หน้าจอ (7 เดิม + 5 ใหม่) และ `class="current"` ตรงกับไฟล์ตัวเอง, ปุ่ม/ลิงก์ทุกจุดที่ navigate
  ระหว่างหน้า (`href="login.html"`, `href="signup.html"`, `href="patient-list.html"`,
  `href="verify-email-notice.html?state=..."`, `href="reset-password.html"`, `href="forgot-password.html"`,
  `href="login.html#session-expired"`, `href="login.html#logged-out"`) ตรงกับชื่อไฟล์จริงที่สร้าง
  ไม่มีลิงก์ตาย
- **(20260924)** อ่าน `<script>` ของ 5 ไฟล์ใหม่กลับมาตรวจแล้ว: วงเล็บ/quote ปิดครบ, ทุก
  `getElementById`/`querySelectorAll` อ้าง id/attribute ที่มีอยู่จริงในไฟล์เดียวกัน, `login.html` มี
  `escapeHtml` ป้องกัน HTML injection จากค่าที่ echo กลับ (อีเมลที่กรอก), `signup.html`/
  `reset-password.html` ใช้ regex เดียวกัน (`length>=8`, `/[A-Za-zก-๙]/`, `/[0-9]/`) ตรงกับนโยบาย
  NFR-17 ที่ระบุใน spec (8 ตัวอักษรขึ้นไป มีทั้งตัวอักษรและตัวเลขอย่างน้อยอย่างละ 1 ตัว)
- **(20260924)** ตรวจการแก้ไขไฟล์เดิม 7 ไฟล์: proto-bar-nav ของทุกไฟล์เพิ่มลิงก์ 5 หน้าใหม่ถูกต้อง
  (ตรวจด้วยการอ่านกลับหลังแก้ทุกไฟล์), `patient-list.html` เพิ่มปุ่ม 2 ปุ่มในส่วน header โดยไม่กระทบ
  ฟอร์ม/สคริปต์ค้นหา HN เดิม, `index.html` เพิ่ม section "Journey ที่ 0" และแถวตารางใหม่ 5 แถวโดยไม่ลบ/
  แก้เนื้อหา Journey ที่ 1/2 เดิม
- ตรวจ `style.css`: class ใหม่ทั้งหมดของ auth screens (`.auth-shell`, `.auth-card`,
  `.auth-card-header`, `.auth-form`, `.auth-footer`, `.auth-icon-row`, `.auth-icon` + ตัวแปร
  `.info`/`.pending`/`.success`, `.password-rules` + `.rule-met`/`.rule-unmet`) ใช้เฉพาะ CSS custom
  property ที่นิยามไว้แล้วใน `:root` ของไฟล์เดิม (รวมสี base scale sky/amber/emerald ที่มีอยู่แล้ว)
  ไม่มีค่าสี/ระยะห่างใหม่
- **(20260924 รอบที่ 2)** อ่านไฟล์ใหม่ทั้ง 6 ไฟล์ (`admin-dashboard.html`, `admin-account-approval.html`,
  `admin-user-directory.html`, `admin-patient-assignment.html`, `admin-patient-directory.html`,
  `admin-patient-detail-readonly.html`) กลับมาตรวจแล้ว: แท็กเปิด/ปิดครบ, attribute ใส่ quote ครบคู่,
  `<link rel="stylesheet" href="style.css">` ถูกต้องทุกไฟล์, proto-bar-nav มีลิงก์ครบทั้ง 18 หน้าจอ
  (12 เดิม + 6 ใหม่) และ `class="current"` ตรงกับไฟล์ตัวเอง, ลิงก์ navigate ระหว่างหน้า
  (`href="admin-dashboard.html"`, `href="admin-account-approval.html"`,
  `href="admin-user-directory.html"`, `href="admin-patient-assignment.html"`,
  `href="admin-patient-directory.html"`, `href="admin-patient-detail-readonly.html"`) ตรงกับชื่อไฟล์
  จริงที่สร้าง ไม่มีลิงก์ตาย — ไม่มี class CSS ใหม่ในไฟล์เหล่านี้ (ใช้ `.chip`, `.status-pill`,
  `.trend-table`, `.form-field`, `.radio-group`, `.textarea-input`, `.denied-shell`, `.callout`,
  `.dx-item`, `.patient-card`, `.stat-grid`, `.section-card` เดิมทั้งหมด)
- **(20260924 รอบที่ 2)** อ่าน `<script>` ของ 6 ไฟล์ใหม่กลับมาตรวจแล้ว: วงเล็บ/quote ปิดครบ, ทุก
  `getElementById`/`querySelectorAll`/`querySelectorAll(...).forEach` อ้าง id/selector ที่มีอยู่จริงใน
  ไฟล์เดียวกัน, มีฟังก์ชัน `escapeHtml` ในทุกไฟล์ที่ echo ข้อความที่มาจาก input/select ของผู้ใช้กลับ
  (`admin-account-approval.html`, `admin-user-directory.html` ไม่ต้อง escape เพราะไม่ echo ค่าที่พิมพ์
  อิสระ, `admin-patient-assignment.html`)
- **(20260924 รอบที่ 2)** ตรวจการแก้ไขไฟล์เดิม 14 ไฟล์: proto-bar-nav ของทั้ง 12 หน้าจอเดิมเพิ่มลิงก์
  6 หน้าใหม่ถูกต้อง (ตรวจด้วยการอ่านกลับหลังแก้ทุกไฟล์ รวมกรณี `class="current"` อยู่บนลิงก์ PDPA ใน
  `pdpa-audit-trail.html`/`pdpa-data-subject-request.html` ที่ทำให้ old_string รอบแรกไม่ match แล้วแก้
  ให้ตรงกับเนื้อหาจริง), `patient-detail-risk-found.html`/`patient-detail-no-risk.html` เพิ่ม section
  FR-16 + proto-code ใหม่โดยไม่กระทบเนื้อหาเดิมด้านบน, `verify-email-notice.html` แก้ข้อความ panel
  รออนุมัติ + เพิ่ม proto-code FR-11, `login.html` เพิ่มบัญชี admin ในอาร์เรย์ + แตกแขนงผลลัพธ์ role
  admin ในฟังก์ชัน submit เดิมโดยไม่กระทบแขนงเดิม (ไม่ถูกต้อง/ยังไม่ยืนยัน/สำเร็จ), `index.html` เพิ่ม
  section "Journey ที่ 3" และแถวตารางใหม่ 6 แถวโดยไม่ลบ/แก้เนื้อหา Journey อื่นเดิม
- **ยังไม่ได้ตรวจด้วยเบราว์เซอร์จริง** (agent นี้ไม่มีเครื่องมือเปิดเบราว์เซอร์) — ตรวจได้เพียงอ่าน
  โครงสร้างไฟล์กลับเท่านั้น แนะนำให้เปิดไฟล์จริงในเบราว์เซอร์ (โดยเฉพาะ interactive JS ของทุกไฟล์
  ข้างต้น, breakpoint มือถือ/แท็บเล็ต, URL fragment/query string ของหน้า auth, และ flow อนุมัติบัญชี/
  เปลี่ยน role/มอบหมายผู้ป่วย/จำลอง audit log ไม่สำเร็จของหน้าจอ Admin) เป็น follow-up ในเทรดหลัก

## เอกสารที่เกี่ยวข้อง

- [[../../feature-list|feature-list]]
- [[../../user-journey|user-journey]]
- [[../../DESIGN.md|DESIGN.md]]
- [[../../../01-requirements/backlog|backlog]]
- [[../../../01-requirements/01-spec/20260917-01-patient-ncd-history-lab-complication-risk|spec ต้นทาง (NCD history)]]
- [[../../../01-requirements/01-spec/20260921-01-pdpa-data-protection-compliance|spec ต้นทาง (PDPA)]]
- [[../../02-technical/detailed-design/pdpa-data-protection-compliance|detailed-design (PDPA)]]
- [[../../../01-requirements/01-spec/20260923-01-user-authentication-email-password|spec ต้นทาง (Authentication)]]
- [[../../../01-requirements/01-spec/20260924-01-admin-role-account-management|spec ต้นทาง (Admin role & account management)]]
