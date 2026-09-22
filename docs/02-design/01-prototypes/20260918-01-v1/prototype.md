# Prototype v1 — NCDs History & Complication Risk

Clickable HTML Prototype เวอร์ชันแรกของโปรเจกต์ สร้างจาก [[../../feature-list|feature-list]],
[[../../user-journey|user-journey]], [[../../../01-requirements/backlog|backlog]] และยึด
[[../../DESIGN.md|DESIGN.md]] เป็น single source of truth ด้าน visual design ทั้งหมด
(สี/ตัวอักษร/ระยะห่าง/องค์ประกอบ UI/accessibility/responsive)

บทบาทผู้ใช้ของทุกหน้าจอ: **แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD** เท่านั้น (ตาม NFR-02)

**อัปเดตล่าสุด (20260922):** แก้ไข `patient-list.html` ให้ค้นหาด้วยเลข HN 7 หลักเท่านั้น (FR-06,
เดิมเป็น free-text) และเพิ่มหน้าจอใหม่ 2 หน้ารองรับฟีเจอร์ที่ 4 "คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม
PDPA" (NFR-03–NFR-08) — ดูรายละเอียดในหัวข้อ "ขอบเขตที่ครอบคลุม (อัปเดต)" ด้านล่าง

## ขอบเขตที่ครอบคลุม (อัปเดต)

ครอบคลุมทั้ง 4 ฟีเจอร์ Must have ใน [[../../feature-list|feature-list]] และทั้ง 2 journey ใน
[[../../user-journey|user-journey]]:

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

## ตาราง journey/ฟีเจอร์ ↔ ไฟล์ ↔ รหัส FR/NFR

| ไฟล์ | Journey step / ฟีเจอร์ (feature-list.md) | รหัส FR/NFR ที่ครอบคลุม |
| --- | --- | --- |
| `index.html` | หน้ารวมลิงก์ทุกหน้าจอ จัดกลุ่มตาม journey (2 journey) พร้อม badge บทบาทผู้ใช้ | — |
| `patient-list.html` | ฟีเจอร์ 3 — ค้นหา/เลือกผู้ป่วยในความดูแล (Journey 1 ขั้นตอนที่ 3–8, รวม validation D1–D5) | FR-05, FR-06, NFR-02 |
| `patient-detail-risk-found.html` | ฟีเจอร์ 1 (ขั้นตอนที่ 10–11) + ฟีเจอร์ 2 (ขั้นตอนที่ 12–13 แขนง "พบ") — ผู้ป่วยตัวอย่าง นายสมชาย ใจกล้า | FR-01, FR-02, FR-03, FR-04, NFR-01 |
| `patient-detail-no-risk.html` | ฟีเจอร์ 1 (ขั้นตอนที่ 10–11) + ฟีเจอร์ 2 (ขั้นตอนที่ 12–13 แขนง "ไม่พบ") — ผู้ป่วยตัวอย่าง นายวิชัย ถุงลมดี | FR-01, FR-02, FR-03, FR-04, NFR-01 |
| `access-denied.html` | สถานะ guard ก่อนเข้าถึงข้อมูลผู้ป่วยรายบุคคล (Journey 1 ขั้นตอนที่ 1–2 แขนง "ไม่มีสิทธิ์") | NFR-02 |
| `pdpa-data-subject-request.html` | ฟีเจอร์ 4 — Journey 2 เส้นทางคำขอใช้สิทธิของเจ้าของข้อมูล (ขั้นตอนที่ 2–3) | NFR-03, NFR-05, NFR-06, NFR-07 (precondition: FR-05, FR-06) |
| `pdpa-audit-trail.html` | ฟีเจอร์ 4 — Journey 2 เส้นทางสงสัยข้อมูลรั่วไหล (ขั้นตอนที่ 4–5) | NFR-02, NFR-06, NFR-08 |
| `style.css` | CSS custom properties + component class แปลงจาก DESIGN.md §2–§7 ทั้งหมด (รวม form control class ที่ประกอบเพิ่มสำหรับ 2 หน้าจอ PDPA) | — |

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
- **ยังไม่ได้ตรวจด้วยเบราว์เซอร์จริง** (agent นี้ไม่มีเครื่องมือเปิดเบราว์เซอร์) — ตรวจได้เพียงอ่าน
  โครงสร้างไฟล์กลับเท่านั้น แนะนำให้เปิดไฟล์จริงในเบราว์เซอร์ (โดยเฉพาะ interactive JS ของ 3 ไฟล์
  ข้างต้น และ breakpoint มือถือ/แท็บเล็ต) เป็น follow-up ในเทรดหลัก

## เอกสารที่เกี่ยวข้อง

- [[../../feature-list|feature-list]]
- [[../../user-journey|user-journey]]
- [[../../DESIGN.md|DESIGN.md]]
- [[../../../01-requirements/backlog|backlog]]
- [[../../../01-requirements/01-spec/20260917-01-patient-ncd-history-lab-complication-risk|spec ต้นทาง (NCD history)]]
- [[../../../01-requirements/01-spec/20260921-01-pdpa-data-protection-compliance|spec ต้นทาง (PDPA)]]
- [[../../02-technical/detailed-design/pdpa-data-protection-compliance|detailed-design (PDPA)]]
