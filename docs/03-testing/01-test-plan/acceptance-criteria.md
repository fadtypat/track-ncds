# Acceptance Criteria

เอกสารนี้กำหนดเกณฑ์ยอมรับ (Given-When-Then) ของทุกรหัส FR/NFR ใน [[feature-list]] จัดกลุ่มตามฟีเจอร์
เดียวกับ `feature-list.md` เป๊ะๆ (ชื่อ/ลำดับหัวข้อตรงกัน) รายละเอียดพฤติกรรม/ข้อความ/edge case อ้างอิง
จาก spec ต้นทาง ([[20260917-01-patient-ncd-history-lab-complication-risk]],
[[20260921-01-pdpa-data-protection-compliance]], [[20260922-01-operational-quality-nfr]]) และเอกสาร
ออกแบบระดับ component ใน `docs/02-design/02-technical/detailed-design/` (sequence/state diagram,
edge case table) — ไม่ใช่การตีความ/เดาเอาเองของเอกสารนี้

**ระดับความสำคัญ (สูง/กลาง/ต่ำ) ที่กำกับต่อท้ายรหัสทุกหัวข้อ FR/NFR ด้านล่าง ดึงค่าจาก [[backlog]]
โดยตรงเสมอ** ตรวจสอบล่าสุด 2026-09-22: NFR-01 และ NFR-02 มีระดับความสำคัญ = สูง กำกับครบแล้วใน
[[backlog]] (แก้ไขระดับความสำคัญให้ล่าสุดผ่าน `capture-requirement` เมื่อ 2026-09-22) — ตรวจสอบเพิ่มเติม
2026-09-22 (รอบสอง): เพิ่มหัวข้อ "5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ" (NFR-09–NFR-15) ที่ขาดหายไป
ทั้งหมดจากรอบก่อนหน้า (feature-list.md เพิ่งมีฟีเจอร์ที่ 5 ใหม่) — NFR-16 (Won't have ยืนยันโดยผู้ใช้แล้ว)
ไม่มี AC ในรอบนี้ ดูเหตุผลที่หัวข้อ NFR-16 ด้านล่าง — ตรวจสอบเพิ่มเติม 2026-09-22 (รอบสาม, ขอบเขตจำกัด
เฉพาะฟีเจอร์ที่ 4/NFR-03–NFR-08 เทียบกับ [[technology-stack]]): แก้ไข NFR-04 AC-1/AC-2 ที่ยังเขียนว่า
"รอ technology-stack.md" ทั้งที่ [[technology-stack]] มีเนื้อหาจริงแล้ว (Google-managed encryption keys
+ HTTPS/TLS) — ดูหมายเหตุที่หัวข้อ NFR-04 ด้านล่าง

อ้างอิง: [[feature-list]], [[user-journey]], [[backlog]]

## 1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD

ดู [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD|รายละเอียดฟีเจอร์นี้ใน feature-list]]
และ [[user-journey#Journey แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD ค้นหาผู้ป่วย ดูประวัติ และรับการแจ้งเตือนความเสี่ยงโรคแทรกซ้อน|user-journey ขั้นตอนที่ 10–11]]
พฤติกรรมระดับ component อ้างอิงจาก
[[../../02-design/02-technical/detailed-design/patient-ncd-diagnosis-lab-history|detailed-design — ดูประวัติการวินิจฉัยและผลตรวจ lab]]

#### FR-01 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)|แสดงประวัติการวินิจฉัยโรค NCD ของผู้ป่วย]]

- **AC-1 (Happy path):** Given ผู้ใช้ผ่านการตรวจสอบสิทธิ์ระดับบทบาทและระดับรายผู้ป่วยแล้ว และผู้ป่วย
  รายที่เลือกมีประวัติวินิจฉัยอย่างน้อย 1 รายการในขอบเขต ICD-10 (เบาหวาน E10–E14, ความดันโลหิตสูง
  I10–I14, ถุงลมโป่งพอง J44), When ผู้ใช้เปิดดูประวัติการวินิจฉัยของผู้ป่วยรายนั้น, Then ระบบแสดง
  รายการประวัติวินิจฉัยเรียงตามวันที่วินิจฉัย เฉพาะรหัส ICD-10 ที่อยู่ในขอบเขตเท่านั้น
- **AC-2 (ไม่มีประวัติวินิจฉัย — edge case):** Given ผู้ป่วยรายที่เลือกไม่มีประวัติการวินิจฉัยในขอบเขต
  เลยแม้แต่รายการเดียว, When ผู้ใช้เปิดดูประวัติวินิจฉัย, Then ระบบคืนรายการว่างและแสดงข้อความว่าไม่มี
  ประวัติการวินิจฉัย (ไม่ใช่ error)
- **AC-3 (ไม่พบผู้ป่วยตามรหัสที่ระบุ):** Given รหัสผู้ป่วยที่ระบุไม่มีอยู่จริงในระบบ, When เรียกดูประวัติ
  วินิจฉัย (Operation 1), Then ระบบแจ้งว่าไม่พบผู้ป่วย และหยุดก่อนอ่านประวัติวินิจฉัยใดๆ

#### FR-02 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)|แสดงผลตรวจ lab ที่เกี่ยวข้องกับโรค NCD ย้อนหลัง]]

- **AC-1 (Happy path — ดูทั้งหมด):** Given ผู้ป่วยรายที่เลือกมีผลตรวจ lab อย่างน้อย 1 รายการ, When
  ผู้ใช้ขอดูผลตรวจ lab ย้อนหลังโดยไม่ระบุช่วงเวลา, Then ระบบแสดงผลตรวจ lab มาตรฐานที่เกี่ยวข้อง (เช่น
  HbA1c, eGFR, LDL, ค่าความดันโลหิต) ทั้งหมดเรียงตามวันที่ตรวจเพื่อดูแนวโน้ม
- **AC-2 (ระบุช่วงเวลาถูกต้อง):** Given ผู้ใช้ระบุวันที่เริ่มต้นอยู่ก่อนวันที่สิ้นสุด (ช่วงเวลาถูกต้อง),
  When กดดูผลตรวจ lab, Then ระบบแสดงเฉพาะผลตรวจ lab ที่อยู่ในช่วงเวลาที่ระบุ
- **AC-3 (ช่วงเวลาไม่ถูกต้อง — edge case):** Given ผู้ใช้ระบุวันที่เริ่มต้นอยู่**หลัง**วันที่สิ้นสุด, When
  กดดูผลตรวจ lab, Then ระบบแจ้งว่า input ไม่ถูกต้อง และไม่เรียกข้อมูลผลตรวจ lab จนกว่าผู้ใช้จะแก้ไข
  ช่วงเวลาให้ถูกต้อง
- **AC-4 (ไม่พบผลตรวจในช่วงเวลาที่ระบุ — edge case):** Given ช่วงเวลาที่ระบุถูกต้องแต่ไม่มีผลตรวจ lab
  ของผู้ป่วยรายนี้อยู่ในช่วงนั้นเลย, When ระบบค้นหา, Then ระบบคืนรายการว่างและแสดงข้อความว่าไม่มีผลตรวจ
  ในช่วงเวลานี้ (ไม่ใช่ error)

#### NFR-01 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|แหล่งข้อมูล/Integration]]

- **AC-1:** Given ระบบยังไม่ได้เชื่อมต่อกับ HOSxP จริง (อยู่ในช่วงพัฒนา/ทดสอบ), When ผู้ใช้เรียกดูประวัติ
  วินิจฉัย (FR-01) หรือผลตรวจ lab (FR-02) ของผู้ป่วยรายบุคคล, Then ระบบต้องสามารถใช้ข้อมูล mockup แทน
  แหล่งข้อมูล HOSxP ได้โดยไม่กระทบพฤติกรรม/ผลลัพธ์ที่ผู้ใช้เห็น (โครงสร้างและลำดับขั้นตอนต้องเหมือนกับ
  กรณีเชื่อมต่อ HOSxP จริงทุกประการ)

#### NFR-02 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Security / Access Control]]

- **AC-1 (ปฏิเสธระดับบทบาท):** Given ผู้ใช้ไม่มีบทบาทแพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD หรือบัญชีถูกระงับ,
  When ผู้ใช้พยายามเข้าถึงระบบ (ก่อนเรียก operation ใดๆ เกี่ยวกับข้อมูลผู้ป่วย), Then ระบบปฏิเสธการเข้าถึง
  ทันที และ Client แสดงข้อความไม่มีสิทธิ์เข้าถึงระบบ
- **AC-2 (ปฏิเสธระดับรายผู้ป่วย):** Given ผู้ใช้มีบทบาทถูกต้องแต่ผู้ป่วยรายที่เลือกไม่ได้อยู่ในความดูแล
  ของตน (ไม่มี PatientAssignment เชื่อมโยง), When ผู้ใช้พยายามเข้าถึงประวัติวินิจฉัย/ผลตรวจ lab ของ
  ผู้ป่วยรายนั้น, Then ระบบปฏิเสธการเข้าถึงข้อมูลผู้ป่วยรายนี้เท่านั้น (ผู้ใช้ยังเห็นรายชื่อผู้ป่วยรายอื่น
  ที่ตนดูแลอยู่ได้ตามปกติ)
- **AC-3 (จำกัด/ล้างข้อมูลฝั่ง Client):** Given ผู้ใช้กำลังดูประวัติวินิจฉัย/ผลตรวจ lab ของผู้ป่วยรายหนึ่ง
  อยู่, When ผู้ใช้ออกจากหน้าจอนี้เพื่อเลือกผู้ป่วยรายอื่น หรือออกจากระบบ (logout)/session สิ้นสุด, Then
  Client ต้องล้างประวัติวินิจฉัย/ผลตรวจ lab ของผู้ป่วยรายเดิมที่เคยแสดงไว้ทันที ไม่เก็บ/cache ไว้เกิน
  ความจำเป็น ก่อนแสดงข้อมูลผู้ป่วยรายใหม่ (ถ้ามี) หรือกลับสู่หน้าจอเข้าสู่ระบบ

## 2. วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน

ดู [[feature-list#2. วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน|รายละเอียดฟีเจอร์นี้ใน feature-list]]
และ [[user-journey#Journey แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD ค้นหาผู้ป่วย ดูประวัติ และรับการแจ้งเตือนความเสี่ยงโรคแทรกซ้อน|user-journey ขั้นตอนที่ 12–13]]
พฤติกรรมระดับ component อ้างอิงจาก
[[../../02-design/02-technical/detailed-design/complication-risk-analysis-alert|detailed-design — วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน]]

#### FR-03 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)|วิเคราะห์ความเสี่ยงโรคแทรกซ้อนแบบ rule-based ตาม threshold ค่า lab]]

- **AC-1 (พบความเสี่ยง):** Given ผู้ป่วยมีผลตรวจ lab ที่ตรงกับ threshold ของโรคแทรกซ้อนในขอบเขต (ไตวาย
  เรื้อรัง N18.3–N18.9, โรคหัวใจ I20–I25, โรคหลอดเลือดสมอง I60–I69) อย่างน้อยหนึ่งค่าที่เข้าเงื่อนไข,
  When ระบบประมวลผล Risk Rule Engine แบบ rule-based (ไม่ใช้ AI/ML), Then ระบบบันทึกและส่งคืนผลประเมิน
  ที่ระบุว่า "พบความเสี่ยง" อย่างน้อยหนึ่งโรคแทรกซ้อน
- **AC-2 (ไม่พบความเสี่ยงเพิ่มเติม):** Given ผู้ป่วยมีผลตรวจ lab ที่ตรงกับ threshold อย่างน้อยหนึ่งค่า
  (มีข้อมูลเพียงพอสำหรับประเมิน) แต่ไม่มีค่าใดเข้าเงื่อนไขความเสี่ยงเลย, When ระบบประมวลผล, Then ระบบ
  บันทึกผลประเมินเป็น "ไม่พบความเสี่ยงเพิ่มเติม" (RiskFinding ทุกรายการมี "เข้าเงื่อนไขหรือไม่" = เท็จ)
- **AC-3 (ข้อมูลไม่เพียงพอสำหรับการประเมิน — edge case):** Given ผู้ป่วยไม่มีผลตรวจ lab ใดตรงกับ
  threshold ใดเลยแม้แต่รายการเดียว, When ระบบประมวลผล, Then ระบบไม่สร้าง RiskFinding ใดๆ (จำนวน
  RiskFinding = 0) และผลลัพธ์ต้องแยกจากกรณี "ไม่พบความเสี่ยงเพิ่มเติม" ชัดเจน
- **AC-4 (ใช้ค่า lab ล่าสุด):** Given ผู้ป่วยมีผลตรวจ lab มากกว่า 1 ค่าสำหรับชนิดการตรวจเดียวกัน (คนละ
  วันที่ตรวจ), When ระบบเปรียบเทียบกับ threshold, Then ระบบต้องใช้เฉพาะค่าที่มี "วันที่ตรวจ" ล่าสุด
  เท่านั้นในการเปรียบเทียบ
- **AC-5 (ไม่พบผู้ป่วยตามรหัสที่ระบุ):** Given รหัสผู้ป่วยที่ระบุไม่มีอยู่จริงในระบบ, When เรียก Operation
  3, Then ระบบแจ้งว่าไม่พบผู้ป่วย และหยุดก่อนเริ่มประมวลผล Risk Rule Engine ใดๆ

#### FR-04 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)|แสดง/แจ้งผลการประเมินความเสี่ยงโรคแทรกซ้อนแก่ผู้ดูแล]]

- **AC-1 (แสดง flag เมื่อพบความเสี่ยง):** Given ผลประเมินจาก FR-03 คือ "พบความเสี่ยง", When Client ได้รับ
  ผลลัพธ์, Then ระบบแสดง flag/สัญญาณเตือนที่มองเห็นได้ชัดเจนบนหน้าจอของผู้ดูแลต่อผู้ป่วยรายนั้น (มี
  ข้อความกำกับคู่กับสีเสมอ ไม่ใช้สีเป็นสัญญาณเดียว)
- **AC-2 (แสดงผลไม่พบความเสี่ยง):** Given ผลประเมินจาก FR-03 คือ "ไม่พบความเสี่ยงเพิ่มเติม", When Client
  ได้รับผลลัพธ์, Then ระบบแสดงข้อความว่าไม่พบความเสี่ยงเพิ่มเติมอย่างชัดเจน (ไม่ใช่ error) และไม่มีการ
  แจ้งเตือน
- **AC-3 (แสดงผลข้อมูลไม่เพียงพอ):** Given ผลประเมินจาก FR-03 คือ "ข้อมูลไม่เพียงพอสำหรับการประเมิน",
  When Client ได้รับผลลัพธ์, Then ระบบแสดงข้อความ "ข้อมูลไม่เพียงพอสำหรับการประเมิน" ซึ่งต้องแยกจาก
  ข้อความ "ไม่พบความเสี่ยงเพิ่มเติม" อย่างชัดเจน ไม่ใช้ข้อความเดียวกัน

#### NFR-01 (สูง) — แหล่งข้อมูล/Integration

ดู AC ของ NFR-01 ที่หัวข้อ [[#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD|1. ดูประวัติการวินิจฉัย
และผลตรวจ lab ของผู้ป่วย NCD]] (AC เดียวกัน — ผลตรวจ lab ที่ใช้เป็น input ของ Risk Rule Engine ในฟีเจอร์
นี้มาจากแหล่งข้อมูลเดียวกัน)

#### NFR-02 (สูง) — Security / Access Control

ดู AC ของ NFR-02 ที่หัวข้อ [[#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD|1. ดูประวัติการวินิจฉัย
และผลตรวจ lab ของผู้ป่วย NCD]] — เพิ่มเติมเฉพาะฟีเจอร์นี้ 1 ข้อ:

- **AC-4 (จำกัด/ล้าง flag ความเสี่ยงฝั่ง Client):** Given ผู้ใช้กำลังดู flag/ผลวิเคราะห์ความเสี่ยงของ
  ผู้ป่วยรายหนึ่งอยู่, When ผู้ใช้ออกจากหน้าจอนี้เพื่อเลือกผู้ป่วยรายอื่น หรือออกจากระบบ, Then Client
  ต้องล้าง flag/สัญญาณเตือนและผลการประเมินของผู้ป่วยรายเดิมที่เคยแสดงไว้ทันที ไม่คงค้างเกินความจำเป็น

## 3. ค้นหา/เลือกผู้ป่วยในความดูแล

ดู [[feature-list#3. ค้นหา/เลือกผู้ป่วยในความดูแล|รายละเอียดฟีเจอร์นี้ใน feature-list]] และ
[[user-journey#Journey แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD ค้นหาผู้ป่วย ดูประวัติ และรับการแจ้งเตือนความเสี่ยงโรคแทรกซ้อน|user-journey ขั้นตอนที่ 1–8]]
พฤติกรรมระดับ component อ้างอิงจาก
[[../../02-design/02-technical/detailed-design/patient-search-selection|detailed-design — ค้นหา/เลือกผู้ป่วยในความดูแล]]

#### FR-05 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)|ค้นหา/แสดงรายชื่อผู้ป่วย NCD ที่อยู่ในความดูแล]]

- **AC-1 (Happy path — ดูรายชื่อทั้งหมด):** Given ผู้ใช้ผ่านการตรวจสอบสิทธิ์ระดับบทบาทแล้ว และมีผู้ป่วย
  อย่างน้อย 1 รายที่อยู่ในความดูแล (มี PatientAssignment), When ผู้ใช้เปิดหน้าจอโดยไม่กรอกค้นหา, Then
  ระบบแสดงรายชื่อผู้ป่วย NCD ทั้งหมดที่อยู่ในความดูแลของผู้ใช้งานคนนั้นเท่านั้น (ไม่แสดงผู้ป่วยรายอื่นที่
  ไม่ได้อยู่ในความดูแล)
- **AC-2 (ไม่มีผู้ป่วยในความดูแลเลย — edge case):** Given ผู้ใช้ไม่มีผู้ป่วยรายใดอยู่ในความดูแลเลย (ไม่มี
  ระเบียน PatientAssignment เลย), When เปิดหน้าจอ, Then ระบบคืนรายการว่างและแสดงข้อความว่าไม่มีผู้ป่วย
  ในความดูแล (ไม่ใช่ error)
- **AC-3 (เลือกผู้ป่วยรายบุคคล):** Given ผู้ใช้เห็นรายชื่อ/ผลค้นหาผู้ป่วยที่อยู่ในความดูแลของตน, When
  ผู้ใช้เลือกผู้ป่วยรายบุคคลจากรายชื่อ/ผลค้นหา, Then ระบบต้องตรวจสอบสิทธิ์ระดับรายผู้ป่วยซ้ำที่ Backend
  Service ก่อนอนุญาตให้เข้าถึงข้อมูลของผู้ป่วยรายนั้น (ไม่พึ่งพาการกรองฝั่ง Client เพียงอย่างเดียว)

#### FR-06 (สูง) — [[20260917-01-patient-ncd-history-lab-complication-risk#ความต้องการเชิงฟังก์ชัน (Functional Requirements)|ค้นหาผู้ป่วยด้วยเลข HN แบบ 7 หลัก พร้อม validation]]

- **AC-1 (Happy path):** Given ผู้ใช้กรอกเลข HN ตัวเลขล้วน 7 หลักที่ตรงกับผู้ป่วยรายหนึ่งในความดูแลของ
  ตน, When ผู้ใช้กดปุ่ม "ค้นหา", Then ระบบแสดงผู้ป่วยที่ตรงกับ HN นั้นให้เลือก
- **AC-2 (HN ไม่ครบรูปแบบ — edge case, ตรวจหลังกดค้นหาเท่านั้น):** Given ผู้ใช้กรอก HN ที่ไม่ใช่ตัวเลข
  ล้วน หรือความยาวไม่ครบ 7 หลัก, When ผู้ใช้กดปุ่ม "ค้นหา" (การตรวจสอบนี้เกิดขึ้น**หลังกดค้นหาแล้วเท่านั้น**
  ไม่ใช่แบบ real-time ระหว่างพิมพ์), Then ระบบแจ้งเตือน "HN ไม่ครบ 7 หลัก" หยุดทันทีโดยไม่ค้นหาต่อ และ
  ให้ผู้ใช้กรอกค้นหาใหม่ได้ทันที โดยไม่บล็อกการเรียกดูรายชื่อทั้งหมด (FR-05)
- **AC-3 (ค้นหาไม่พบผู้ป่วย — edge case):** Given ผู้ใช้กรอก HN ครบรูปแบบตัวเลขล้วน 7 หลักแล้ว แต่ไม่พบ
  ผู้ป่วยที่ตรงกันภายในขอบเขตความดูแลของตน (รวมถึงกรณี HN นี้มีอยู่จริงแต่ผู้ป่วยไม่ได้อยู่ในความดูแล
  ของผู้ใช้คนนั้น), When ระบบค้นหาแบบ exact match, Then ระบบแจ้งเตือน "ไม่พบผู้ป่วย" ด้วยข้อความเดียวกัน
  ทั้งสองกรณี (ไม่เปิดเผยว่า HN มีอยู่จริงแต่อยู่นอกความดูแล) และให้กรอกค้นหาใหม่ได้ทันที โดยไม่บล็อกการ
  เรียกดูรายชื่อทั้งหมด

#### NFR-02 (สูง) — Security / Access Control

ดู AC-1, AC-2 ของ NFR-02 ที่หัวข้อ
[[#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD|1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD]]
(ปฏิเสธระดับบทบาท/ระดับรายผู้ป่วยเป็นหลักการเดียวกัน — ครอบคลุมกรณีเลือก/ระบุรหัสผู้ป่วยที่ไม่ได้อยู่ใน
ความดูแลในฟีเจอร์นี้ด้วย เช่น ผ่านการปลอมแปลงรหัสผู้ป่วยฝั่ง Client) — เพิ่มเติมเฉพาะฟีเจอร์นี้ 1 ข้อ
(เป็นจุดแรกสุดของ journey ที่แสดงข้อมูลระบุตัวตนผู้ป่วย หมายเลข AC ต่อจาก AC-4 ของ
[[#2. วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน|หัวข้อ 2]] เพื่อไม่ให้ซ้ำเลขกัน):

- **AC-5 (จำกัด/ล้างรายชื่อ/ผลค้นหาฝั่ง Client):** Given ผู้ใช้เห็นรายชื่อ/ผลค้นหาผู้ป่วยอยู่บนหน้าจอ,
  When ผู้ใช้ออกจากหน้าจอนี้ไปยังหน้าจออื่นโดยไม่ได้เลือกผู้ป่วย หรือค้นหา/เลือกผู้ป่วยรายใหม่แทนที่
  รายชื่อ/ผลค้นหาเดิม หรือออกจากระบบ (logout), Then Client ต้องล้างรายชื่อ/ผลค้นหาผู้ป่วยที่เคยแสดงไว้
  ทันที ไม่คงค้างในสถานะที่ยังเข้าถึงได้ต่อเนื่องเกินความจำเป็น

## 4. คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA

ดู [[feature-list#4. คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA|รายละเอียดฟีเจอร์นี้ใน feature-list]] และ
ทั้งสอง journey ใน [[user-journey]] พฤติกรรมระดับ component อ้างอิงจาก
[[../../02-design/02-technical/detailed-design/pdpa-data-protection-compliance|detailed-design — คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA]]

#### NFR-03 (สูง) — [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|PDPA / หลักการประมวลผลข้อมูลส่วนบุคคล (Lawful Basis & Purpose Limitation)]]

- **AC-1:** Given ระบบประมวลผลข้อมูลส่วนบุคคล/ข้อมูลสุขภาพของผู้ป่วยผ่าน FR-01–FR-04, When มีการเข้าถึง/
  ใช้ข้อมูลนั้น, Then การประมวลผลต้องจำกัดเฉพาะเท่าที่จำเป็นต่อวัตถุประสงค์การดูแลรักษาผู้ป่วยเท่านั้น
  ห้ามนำไปใช้นอกวัตถุประสงค์โดยไม่มีฐานทางกฎหมายรองรับ
- **AC-2 (ตรวจสอบ purpose limitation ในคำขอ PDPA):** Given เจ้าหน้าที่ยื่นคำขอ Operation 4 (คำขอใช้
  สิทธิของเจ้าของข้อมูล) สำหรับผู้ป่วยรายหนึ่ง, When ระบบตรวจสอบสิทธิ์ก่อนดำเนินการ, Then ระบบต้องตรวจสอบ
  purpose limitation ร่วมกับสิทธิ์ระดับบทบาท/ระดับรายผู้ป่วย (NFR-02) ก่อนสร้าง DataSubjectRequest ใดๆ

#### NFR-04 (สูง) — [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|PDPA / การเข้ารหัสข้อมูล (Encryption)]]

**อัปเดต 2026-09-22 (รอบสาม — เทียบกับ [[technology-stack]] เฉพาะฟีเจอร์ที่ 4):** [[technology-stack]]
มีเนื้อหาแล้วและระบุกลไกจริงของ NFR-04 ไว้ชัดเจนที่
[[technology-stack#8. กลไกเข้ารหัสข้อมูล (NFR-04) และการบริหารกุญแจเข้ารหัส|decision area 8]] — AC
ด้านล่างจึงปรับจาก "รอ technology-stack.md" เป็นอ้างอิงกลไกจริงที่เลือกไว้แล้ว

- **AC-1 (Encryption at rest — Google-managed encryption keys):** Given ข้อมูลส่วนบุคคล/ข้อมูลสุขภาพ
  ของผู้ป่วยถูกจัดเก็บใน Primary Data Store (Cloud Firestore) หรือ Audit Log Store (collection
  `auditLogRecords` ใน Firestore เดียวกัน) ตามที่
  [[technology-stack#8. กลไกเข้ารหัสข้อมูล (NFR-04) และการบริหารกุญแจเข้ารหัส|technology-stack]]
  กำหนด, When ข้อมูลถูกบันทึกลงที่เก็บข้อมูล, Then ข้อมูลต้องถูกเข้ารหัสขณะจัดเก็บ (at rest) ด้วย
  **Google-managed encryption keys** ซึ่งเป็นค่าเริ่มต้นของ Cloud Firestore โดยไม่ต้องตั้งค่าเพิ่มเติม
  (ยังไม่มีการตั้งค่า Customer-Managed Encryption Keys (CMEK) หรือ field-level encryption เพิ่มเติมใน
  ขั้นนี้ — ดูหมายเหตุขอบเขตด้านล่าง)
- **AC-2 (Encryption in transit — HTTPS/TLS บังคับโดย platform):** Given ข้อมูลส่วนบุคคล/ข้อมูลสุขภาพ
  ของผู้ป่วยถูกส่งระหว่าง Client กับ Backend Service (Cloud Functions) หรือระหว่าง Client กับ Firebase
  Hosting, When ข้อมูลถูกส่งผ่านเครือข่าย, Then ข้อมูลต้องถูกเข้ารหัสขณะส่งผ่าน (in transit) ด้วย
  **HTTPS/TLS ที่บังคับใช้โดยอัตโนมัติจาก Firebase Hosting และ Cloud Functions** (HTTPS Callable
  Functions) ตามที่
  [[technology-stack#8. กลไกเข้ารหัสข้อมูล (NFR-04) และการบริหารกุญแจเข้ารหัส|technology-stack]]
  ระบุไว้ — ไม่มีช่องทางที่ Client เรียก Backend Service ผ่าน HTTP ที่ไม่เข้ารหัสได้

หมายเหตุ (ขอบเขตการทดสอบ): กลไกทั้งสองข้างต้นเป็นค่าเริ่มต้น (default) ของแพลตฟอร์ม Firebase/Google
Cloud ที่ไม่ต้องเขียนโค้ดเพิ่มเติม การทดสอบจึงเป็นการทวนสอบเชิงการตั้งค่า (configuration review) ว่า
ไม่มีการปิด/override ค่าเริ่มต้นเหล่านี้โดยไม่ได้ตั้งใจ ไม่ใช่การทดสอบ algorithm การเข้ารหัสเชิงลึก —
Customer-Managed Encryption Keys (CMEK) และ field-level encryption ถูกบันทึกไว้เป็น "ประเด็นรอตัดสินใจ"
ใน [[technology-stack#ประเด็นรอตัดสินใจ|technology-stack]] สำหรับทบทวนเมื่อระบบเปลี่ยนจากข้อมูลจำลอง
เป็นข้อมูลผู้ป่วยจริง ไม่อยู่ในขอบเขตของ AC นี้ในรอบปัจจุบัน

#### NFR-05 (กลาง) — [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|PDPA / การจำกัดระยะเวลาเก็บรักษาและการลบข้อมูล (Retention & Deletion)]]

- **AC-1 (ยังไม่กำหนดค่าระยะเวลาเก็บรักษา — edge case):** Given RetentionPolicy ของประเภทข้อมูลหนึ่งยัง
  ไม่ถูกกำหนดค่าระยะเวลาเก็บรักษา (จำนวนวัน), When ระบบรันกลไกบังคับใช้ retention (Operation 6) รอบนี้,
  Then ระบบข้ามการบังคับใช้สำหรับประเภทข้อมูลนั้นในรอบนี้ (ไม่ใช่ error) และรายงานผลให้ผู้ดูแลระบบทราบ
- **AC-2 (บังคับใช้ retention สำเร็จ):** Given RetentionPolicy มีค่าระยะเวลาเก็บรักษาแล้ว และมีระเบียน
  ข้อมูลที่พ้นระยะเวลาตามเงื่อนไข, When Operation 6 ทำงาน, Then ระบบลบ/ทำลายระเบียนที่พ้นระยะเวลา และ
  สรุปจำนวน/รายการ entity+id ที่ถูกลบในรอบนี้
- **AC-3 (คำขอ "ขอลบ" ถูกระงับ):** Given เจ้าหน้าที่ยื่นคำขอประเภท "ขอลบ" ผ่าน Operation 4 และข้อมูลของ
  ผู้ป่วยรายนั้นยังมีความจำเป็นตามฐานทางกฎหมายอื่น (เช่น ข้อบังคับเวชระเบียน), When ระบบตรวจสอบ
  RetentionPolicy, Then ระบบระงับการลบ ไม่ลบข้อมูลโดยไม่มีการยืนยันเพิ่มเติม และปรับสถานะ
  DataSubjectRequest เป็น "ปฏิเสธคำขอ"
- **AC-4 (คำขอ "ขอลบ" สำเร็จ):** Given เจ้าหน้าที่ยื่นคำขอประเภท "ขอลบ" และไม่มีข้อจำกัดเพิ่มเติมตาม
  RetentionPolicy, When ระบบดำเนินการ, Then ระบบลบข้อมูลตามคำขอ และปรับสถานะ DataSubjectRequest เป็น
  "ดำเนินการสำเร็จ"

#### NFR-06 (สูง) — [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|PDPA / บันทึกการเข้าถึงข้อมูล (Audit Log & Accountability)]]

- **AC-1 (บันทึกก่อนเข้าถึงข้อมูล):** Given ผู้ใช้ผ่านการตรวจสอบสิทธิ์แล้วและเข้าถึงข้อมูลผู้ป่วยรายบุคคล
  (ประวัติวินิจฉัย/ผลตรวจ lab/ผลวิเคราะห์ความเสี่ยง) เป็นครั้งแรกในคำขอ/เซสชันเดียวกัน, When ระบบประมวลผล
  คำขอ, Then ระบบต้องบันทึกร่องรอยการเข้าถึง (ผู้ใช้ใด/ผู้ป่วยรายใด/เมื่อใด) **ก่อน**อ่านข้อมูลจริงเสมอ
- **AC-2 (fail-safe เมื่อบันทึกไม่สำเร็จ):** Given การบันทึก Audit Log ไม่สำเร็จ, When ระบบพยายามเข้าถึง
  ข้อมูลผู้ป่วย, Then ระบบต้องยกเลิกการดำเนินการทั้งหมด ไม่แสดงข้อมูลผู้ป่วยใดๆ และแจ้งข้อผิดพลาดแก่ผู้ใช้
- **AC-3 (ไม่บันทึกซ้ำในคำขอ/เซสชันเดียวกัน):** Given เคยบันทึก Audit Log สำหรับผู้ป่วยรายเดียวกันแล้ว
  ในคำขอ/เซสชันเดียวกัน (เช่น ดู FR-01 แล้วต่อด้วย FR-02/FR-03 ของผู้ป่วยรายเดิม), When เรียก operation
  ถัดไปสำหรับผู้ป่วยรายเดียวกัน, Then ระบบไม่ต้องบันทึกซ้ำอีก

#### NFR-07 (กลาง) — [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|PDPA / สิทธิของเจ้าของข้อมูลส่วนบุคคล (Data Subject Rights)]]

- **AC-1 (ขอเข้าถึง/ขอสำเนา):** Given เจ้าหน้าที่ที่มีสิทธิ์ค้นหาและเลือกผู้ป่วยแล้ว (ผ่าน Operation 0),
  When ยื่นคำขอประเภท "ขอเข้าถึง" หรือ "ขอสำเนา" ผ่าน Operation 4, Then ระบบค้นหา/สกัดข้อมูลส่วนบุคคล
  ของผู้ป่วย (ประวัติวินิจฉัย, ผลตรวจ lab, ผลวิเคราะห์ความเสี่ยง, ข้อมูลระบุตัวตนที่ใช้ค้นหา) และส่งผล
  ลัพธ์กลับให้เจ้าหน้าที่ พร้อมปรับสถานะคำขอเป็น "ดำเนินการสำเร็จ"
- **AC-2 (ขอแก้ไข/คัดค้านการประมวลผล พร้อมรายละเอียดครบถ้วน):** Given เจ้าหน้าที่ยื่นคำขอประเภท "ขอแก้ไข"
  หรือ "คัดค้านการประมวลผล" พร้อมรายละเอียดคำขอครบถ้วน, When ระบบตรวจสอบ input, Then ระบบบันทึกการ
  ดำเนินการตามรายละเอียดคำขอ และปรับสถานะคำขอเป็น "ดำเนินการสำเร็จ"
- **AC-3 (input ไม่ถูกต้อง — edge case):** Given เจ้าหน้าที่ยื่นคำขอประเภทที่ไม่ถูกต้อง/ไม่อยู่ในรายการ
  ที่กำหนด หรือยื่นคำขอ "ขอแก้ไข"/"คัดค้านการประมวลผล" โดยไม่มีรายละเอียดคำขอ, When กดส่งคำขอ, Then
  ระบบแจ้งว่า input ไม่ถูกต้อง และไม่สร้าง DataSubjectRequest ใดๆ
- **AC-4 (ไม่มีสิทธิ์ — edge case):** Given เจ้าหน้าที่ไม่มีสิทธิ์เข้าถึงผู้ป่วยรายนั้น (บทบาทไม่ถูกต้อง
  หรือไม่มี PatientAssignment), When ยื่นคำขอ Operation 4, Then ระบบปฏิเสธการเข้าถึงก่อนสร้าง
  DataSubjectRequest ใดๆ
- **AC-5 (ไม่พบผู้ป่วย — edge case):** Given ระบุรหัสผู้ป่วยที่ไม่มีอยู่จริง, When ยื่นคำขอ Operation 4,
  Then ระบบแจ้งว่าไม่พบผู้ป่วย และหยุดก่อนสร้าง DataSubjectRequest

#### NFR-08 (กลาง) — [[20260921-01-pdpa-data-protection-compliance#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|PDPA / การสนับสนุนการแจ้งเหตุละเมิดข้อมูลส่วนบุคคล (Breach Notification Support)]]

- **AC-1 (สืบค้น audit trail สำเร็จ):** Given เจ้าหน้าที่ที่มีสิทธิ์ต้องการสืบสวนกรณีสงสัยข้อมูลรั่วไหล,
  When สืบค้น audit trail ผ่าน Operation 5 (ระบุผู้ป่วย/ช่วงเวลา/ผู้ใช้ — ไม่บังคับ) ด้วย input ที่
  ถูกต้อง, Then ระบบส่งข้อมูลจาก audit log ที่ตรงเงื่อนไข เรียงตามวันที่-เวลาที่เข้าถึง เพียงพอต่อการ
  สืบสวน/สนับสนุนกระบวนการแจ้งเหตุละเมิดข้อมูลส่วนบุคคล
- **AC-2 (ช่วงเวลาไม่ถูกต้อง — edge case):** Given ระบุช่วงเวลาที่วันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด,
  When สืบค้น Operation 5, Then ระบบแจ้งว่า input ไม่ถูกต้อง และไม่เรียก Audit Log Store จนกว่าจะแก้ไข
  ช่วงเวลา
- **AC-3 (ไม่มีสิทธิ์เข้าถึงผู้ป่วยรายนั้น — edge case):** Given ระบุรหัสผู้ป่วยที่ไม่มี PatientAssignment
  เชื่อมโยงกับผู้ใช้นี้, When สืบค้น Operation 5 เฉพาะผู้ป่วยรายนั้น, Then ระบบปฏิเสธการเข้าถึงข้อมูล
  audit trail ของผู้ป่วยรายนั้น (ไม่กระทบการสืบค้นแบบไม่ระบุผู้ป่วย)
- **AC-4 (ไม่พบผลลัพธ์ — edge case):** Given ไม่พบบันทึกที่ตรงเงื่อนไขการสืบค้น, When Operation 5
  ทำงาน, Then ระบบคืนรายการว่าง ไม่ถือเป็น error

## 5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)

ดู [[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)|รายละเอียดฟีเจอร์นี้ใน feature-list]]
และ [[user-journey#Journey แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD ค้นหาผู้ป่วย ดูประวัติ และรับการแจ้งเตือนความเสี่ยงโรคแทรกซ้อน|user-journey — ขั้นตอนที่ 3 (Session Timeout) และหมายเหตุคุณภาพเชิงปฏิบัติการ]]
ฟีเจอร์นี้เป็นข้อกำหนดเชิง cross-cutting ที่ครอบคลุมฟีเจอร์ที่ 1-4 ทั้งหมด ไม่มี operation/component ใหม่
และไม่มี detailed-design แยกของตัวเอง — พฤติกรรมระดับ component อ้างอิงจากหัวข้อ "Cross-cutting:
คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)" ใน
[[../../02-design/02-technical/detailed-design/patient-search-selection#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)|patient-search-selection]],
[[../../02-design/02-technical/detailed-design/patient-ncd-diagnosis-lab-history#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)|patient-ncd-diagnosis-lab-history]] และ
[[../../02-design/02-technical/detailed-design/complication-risk-analysis-alert#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)|complication-risk-analysis-alert]]

#### NFR-09 (สูง) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Performance]]

- **AC-1 (ตอบสนองภายใน 2 วินาที):** Given ผู้ใช้ผ่านการตรวจสอบสิทธิ์แล้วและระบบทำงานในสภาพปกติ (ไม่มี
  ปัญหาเชิง infrastructure), When ผู้ใช้สั่งการค้นหา/แสดงรายชื่อผู้ป่วย (Operation 0), เปิดดูประวัติ
  วินิจฉัย (Operation 1), เปิดดูผลตรวจ lab (Operation 2) หรือเปิดดูผลวิเคราะห์ความเสี่ยง (Operation 3),
  Then ระบบต้องแสดงข้อมูลครบถ้วนบนหน้าจอภายในเวลาน้อยกว่า 2 วินาที นับจากผู้ใช้งานสั่งการ
- **AC-2 (ขอบเขตการทดสอบ — ไม่ใช่ load/stress test):** Given เป้าหมาย < 2 วินาทีตาม AC-1, When ทีม
  ทดสอบออกแบบการทดสอบ performance, Then ทดสอบเฉพาะเวลาตอบสนองของคำขอเดี่ยว (single-request response
  time) ในสภาพแวดล้อมทดสอบเท่านั้น ไม่ครอบคลุมการทดสอบ load/stress/concurrency เชิงปริมาณ (เครื่องมือ/
  environment/threshold การรับ-ไม่รับผลทดสอบเชิงเทคนิคยังไม่ถูกกำหนดใน spec ต้นทาง — นอกขอบเขตของรอบ
  ทดสอบนี้ตามที่ spec ระบุไว้)
- **AC-3 (กลไกจริง — Firestore composite index ต้องครบตาม db-spec, ไม่มี unindexed query):** Given
  [[technology-stack#9. กลไกรองรับ Performance < 2 วินาที (NFR-09) — Firestore Composite Index เท่านั้น (ไม่มี caching layer เพิ่มเติม)|technology-stack]]
  เลือกใช้ **Firestore composite index เท่านั้น** เป็นกลไกรองรับ NFR-09 (ไม่มี in-memory/managed
  caching layer เพิ่มเติม) และ [[db-spec]] ระบุ composite index ที่ต้องสร้างไว้ล่วงหน้าใน
  `firestore.indexes.json` ต่อ entity ไว้ครบแล้ว (เช่น `patientAssignments (userId, patientHn)` และ
  `(userId, patientFullName)` สำหรับ Operation 0, `ncdDiagnoses (patientId, diagnosedAt)` สำหรับ
  Operation 1, `labResults (patientId, testedAt)` และ `(patientId, testType, testedAt)` สำหรับ
  Operation 2/3, `auditLogRecords` 4 composite index สำหรับ Operation 5), When ทีมทดสอบรัน query จริง
  ของแต่ละ operation ข้างต้นในสภาพแวดล้อมทดสอบ (Firebase Emulator Suite หรือ dev project ที่ deploy
  `firestore.indexes.json` แล้ว), Then ต้องไม่พบ Firestore error/warning ประเภท "The query requires
  an index" (unindexed query) ในทุก operation ที่ [[db-spec]] ระบุ composite index ไว้ — ยืนยันว่า
  query pattern จริงตรงกับ index ที่ deploy ไว้ล่วงหน้าครบทุกจุด ก่อนที่จะวัดเวลาตอบสนองตาม AC-1
- **AC-4 (Trade-off ที่ต้องบันทึกเป็น known limitation ไม่ใช่ defect):** Given [[technology-stack]]
  บันทึกไว้ชัดเจนว่าแนวทาง composite-index-only ทำให้ **ทุก request ยังอ่าน Cloud Firestore ทุกครั้งแม้
  เป็นข้อมูลอ้างอิงคงที่** (เช่น `ComplicationRiskThreshold` ที่ Operation 3 อ่านทุกครั้งที่ประมวลผล
  ความเสี่ยง แทนที่จะ cache ไว้ในหน่วยความจำ), When ทีมทดสอบวัดเวลาตอบสนองตาม AC-1 ที่สเกลประมาณ 20
  concurrent users (ขนาดผู้ใช้งานเป้าหมายของ MVP), Then ผลลัพธ์ที่ยังผ่านเกณฑ์ < 2 วินาทีถือเป็นพฤติกรรม
  ที่ยอมรับได้ตามการออกแบบปัจจุบัน (ไม่ใช่ defect ที่ต้องแก้โค้ด) — ทีมทดสอบต้องบันทึกผลเวลาตอบสนองไว้
  เป็น baseline สำหรับเปรียบเทียบซ้ำเมื่อปริมาณข้อมูลจริงเพิ่มขึ้น ถ้าพบว่าไม่ผ่านเกณฑ์อย่างสม่ำเสมอใน
  การทดสอบซ้ำครั้งต่อไป ให้รายงานเป็นข้อเสนอแนะให้พิจารณา in-memory caching ใน Cloud Functions ตามที่
  [[technology-stack]] ระบุไว้เป็นขั้นตอนถัดไป ไม่ใช่ถือเป็นความล้มเหลวของรอบทดสอบนี้

#### NFR-10 (กลาง) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Availability]]

- **AC-1:** Given ระบบ deploy บน Firebase/Google Cloud ตามที่ [[technology-stack]] กำหนดไว้แล้ว, When
  ประเมินเป้าหมาย uptime ของระบบ, Then ระบบต้องอ้างอิง SLA มาตรฐานของ Firebase/Google Cloud เป็น
  เป้าหมาย uptime เท่านั้น ห้ามตั้ง SLA ที่เข้มงวดกว่ามาตรฐานที่ผู้ให้บริการรับประกันไว้ (การตรวจสอบเป็น
  การทวนสอบเชิงเอกสาร/การตั้งค่า ไม่ใช่การทดสอบเชิงปริมาณ เพราะอยู่นอกการควบคุมของระบบเอง)

#### NFR-11 (สูง) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Clinical Safety Validation]]

- **AC-1 (Permanent gate — ทุกครั้งที่เปลี่ยนแปลง rule):** Given มีการเพิ่ม/แก้ไขการจับคู่โรคหลัก→
  โรคแทรกซ้อน หรือค่า threshold ผลตรวจ lab ที่ใช้ใน Risk Rule Engine (Operation 3), When ทีมพัฒนาเตรียม
  deploy การเปลี่ยนแปลงนั้นสู่ระบบที่ใช้งานจริง, Then ต้องมีการยืนยันจากแพทย์ผู้เชี่ยวชาญก่อน deploy
  ทุกครั้งเสมอ ไม่มีข้อยกเว้นแม้เป็นการแก้ไขเพียงเล็กน้อย (ข้อกำหนดถาวร ไม่ใช่ gate ที่ตรวจสอบครั้งเดียว
  ตอนเริ่มโครงการ)
- **AC-2 (ไม่ deploy โดยไม่มีการยืนยัน — edge case):** Given rule/threshold ใหม่หรือที่ถูกแก้ไขยังไม่
  ผ่านการยืนยันจากแพทย์ผู้เชี่ยวชาญ, When ทีมพัฒนาเตรียม deploy, Then ต้องไม่ deploy โค้ด Risk Rule
  Engine ที่มี rule นั้นจนกว่าจะผ่านการยืนยัน (เป็นกระบวนการเชิงองค์กร/deployment approval gate ที่
  ตรวจสอบนอกระบบก่อน deploy โค้ด ไม่ใช่ behavior ที่ระบบ implement เป็น runtime check)

#### NFR-12 (สูง) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Session Timeout]]

**กลไกจริง (ตาม [[technology-stack#10. กลไก Session Timeout (NFR-12) — Client Custom Inactivity Timer เท่านั้น (ไม่มี Server-side Token Revocation)|technology-stack decision area 10]]):**
Client custom inactivity timer เขียนเองด้วย `setTimeout` + event listener บน mouse/keyboard/touch
event มาตรฐานของ browser เมื่อ idle ครบ 30 นาทีเรียก Firebase Authentication `signOut()` ทันที —
**ไม่มี library ภายนอกและไม่มีกลไกฝั่งเซิร์ฟเวอร์เพิกถอน token** ข้อ AC-1/AC-2/AC-3 ด้านล่างทดสอบ
พฤติกรรมที่ผู้ใช้สังเกตเห็นได้ ส่วน AC-4 ทดสอบ/บันทึกความเสี่ยงด้านความปลอดภัยที่กลไกนี้ยังไม่ปิดไว้
อย่างชัดเจนตามที่ [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component|architecture]] และ
[[technology-stack#ความเสี่ยงเพิ่มเติม: NFR-12 Session Timeout เป็น Best-effort ฝั่ง Client เท่านั้น (ไม่มี Server-side Token Revocation)|technology-stack]] บันทึกไว้

- **AC-1 (Auto-logout เมื่อ idle เกิน 30 นาที):** Given ผู้ใช้ล็อกอินเข้าระบบแล้วและไม่มีการโต้ตอบกับ
  ระบบ (inactivity) ต่อเนื่อง (ไม่มี mouse/keyboard/touch event ใดๆ), When ระยะเวลาที่ไม่มีการใช้งานเกิน
  30 นาที (client inactivity timer นับครบ), Then ระบบต้องเรียก Firebase Authentication `signOut()`
  โดยอัตโนมัติ และนำผู้ใช้กลับไปยังหน้าจอเข้าสู่ระบบ
- **AC-2 (ใช้งานต่อเนื่องไม่ถูก logout):** Given ผู้ใช้มีการโต้ตอบกับระบบต่อเนื่อง (มี mouse/keyboard/
  touch event เกิดขึ้นก่อนครบ 30 นาทีเสมอ ทำให้ client inactivity timer ถูก reset), When ระบบตรวจสอบ
  สถานะ inactivity, Then ระบบต้องไม่เรียก `signOut()` และอนุญาตให้ใช้งานต่อได้ตามปกติ
- **AC-3 (คำขอหลัง auto-logout ถูกปฏิเสธ — edge case):** Given ผู้ใช้ถูก auto-logout ไปแล้วเนื่องจาก
  inactivity เกิน 30 นาที (`signOut()` ถูกเรียกสำเร็จ), When มีคำขอถัดไปใดๆ (เช่น จาก tab ที่ยังค้างอยู่)
  ถูกส่งไปโดยไม่มี auth context ที่ถูกต้องแนบมา, Then ระบบต้องปฏิเสธคำขอนั้นที่ขั้นตอนตรวจสอบสิทธิ์ระดับ
  บทบาทเช่นเดียวกับกรณี "ไม่มีข้อมูลยืนยันตัวตน" (NFR-02)
- **AC-4 (Security awareness — token ที่ถูกขโมย/intercept ไว้ก่อนหน้ายังใช้ได้ต่อจนหมดอายุตามธรรมชาติ
  — ไม่ใช่ defect แต่เป็นความเสี่ยงที่ต้องบันทึกไว้):** Given ผู้ใช้ idle เกิน 30 นาทีแต่ client ไม่
  สามารถเรียก `signOut()` ได้ทันเวลา (เช่น อุปกรณ์สูญหาย/ถูกขโมยพร้อม Firebase ID token ที่ถูก
  intercept ไว้ล่วงหน้า หรือ client ถูกดัดแปลง/บั๊กจนไม่ trigger timer จริง), When token เดิมที่ยังไม่
  หมดอายุตามธรรมชาติของ Firebase ID token (สูงสุดประมาณ 1 ชั่วโมงนับจาก issue — นานกว่า 30 นาทีที่
  NFR-12 กำหนดไว้เกือบ 2 เท่า) ถูกนำไปเรียก Backend Service (Cloud Functions)/Primary Data Store
  โดยตรงนอกช่องทาง Client UI ปกติ, Then Backend Service ยังคงอนุญาตคำขอนั้น เพราะตรวจสอบเพียงว่า token
  ถูกต้องและยังไม่หมดอายุเท่านั้น (NFR-02) **ไม่มีกลไกตรวจสอบ inactivity ฝั่งเซิร์ฟเวอร์** — นี่คือ
  พฤติกรรมที่ทราบและยอมรับแล้วตามการออกแบบปัจจุบัน (client-only best-effort mechanism ที่ผู้ใช้ยืนยัน
  ให้ดำเนินการต่อแล้วตาม [[technology-stack]]) **ทีมทดสอบต้องไม่รายงานผลนี้เป็น defect** แต่ต้องบันทึก
  ผลการทดสอบนี้ไว้เป็นหลักฐานความเสี่ยงด้านความปลอดภัยที่ยังไม่ถูกปิดใน MVP รอบนี้ พร้อมแนบข้อเสนอแนะ
  mitigation (ลด TTL ของ token, เพิ่ม server-side token revocation ด้วย `react-idle-timer` + Cloud
  Function `revokeRefreshTokens()`) ก่อนใช้งานกับข้อมูลผู้ป่วยจริง ตามที่
  [[technology-stack#ความเสี่ยงเพิ่มเติม: NFR-12 Session Timeout เป็น Best-effort ฝั่ง Client เท่านั้น (ไม่มี Server-side Token Revocation)|technology-stack]] แนะนำไว้

#### NFR-13 (กลาง) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Accessibility]]

- **AC-1 (ห้ามใช้สีเป็นสัญญาณเดียว):** Given ระบบแสดง flag/สัญญาณเตือนความเสี่ยงโรคแทรกซ้อนบนหน้าจอ
  (FR-04), When ผู้ใช้เปิดดูผลวิเคราะห์ความเสี่ยงของผู้ป่วย, Then ต้องมีข้อความระบุระดับความเสี่ยงกำกับ
  คู่กับสี/ไอคอนเสมอ ห้ามใช้สีเพียงอย่างเดียวเป็นสัญญาณให้ผู้ใช้ตีความเอง
- **AC-2 (ตรวจสอบทุกสถานะผลลัพธ์):** Given ผลการประเมินความเสี่ยงมีได้ 3 แบบ (พบความเสี่ยง/ไม่พบความ
  เสี่ยงเพิ่มเติม/ข้อมูลไม่เพียงพอ ตาม FR-03/FR-04), When ระบบแสดงผลลัพธ์แต่ละแบบบนหน้าจอ, Then ทุกแบบ
  ต้องมีข้อความกำกับที่อ่านเข้าใจได้ชัดเจนโดยไม่ต้องพึ่งพาสีเพียงอย่างเดียวเช่นเดียวกัน
- **AC-3 (กลไกจริง — WCAG 2.1 AA + Heroicons ตรวจสอบด้วย Lighthouse Accessibility Audit ก่อน deploy):**
  Given [[technology-stack#11. Design Token/Icon Library สำหรับ Accessibility (NFR-13) — WCAG 2.1 Level AA + Heroicons + Lighthouse|technology-stack]]
  กำหนดมาตรฐาน **WCAG 2.1 Level AA** (contrast ratio ≥ 4.5:1 สำหรับข้อความปกติ, ≥ 3:1 สำหรับข้อความ
  ขนาดใหญ่/UI component) กำกับ design token สีใน [[DESIGN]] ทุกจุด และใช้ **Heroicons** กำกับคู่กับสี
  ทุกจุดที่สื่อความหมาย (โดยเฉพาะ flag ความเสี่ยงจาก FR-04), When ทีมทดสอบรัน **Lighthouse
  Accessibility Audit** (Chrome DevTools) บนทุกหน้าจอหลัก (ค้นหา/รายชื่อผู้ป่วย, ประวัติวินิจฉัย,
  ผลตรวจ lab, ผลวิเคราะห์ความเสี่ยง) ก่อน deploy ทุกครั้ง, Then ผลตรวจต้องไม่มี failed audit ในหมวด
  "Contrast" (contrast ratio ไม่พอตามเกณฑ์ AA) หรือหมวดที่เกี่ยวกับการสื่อความหมายด้วยสีเพียงอย่างเดียว
  และต้องผ่านเกณฑ์คะแนน Accessibility ที่ทีมกำหนด (เช่น ≥ 90 คะแนน) ก่อนอนุญาตให้ deploy — ถ้าไม่ผ่าน
  ต้องแก้ไข design token/mapping ไอคอนใน [[DESIGN]]/`detailed-design/` ก่อน แล้วรันซ้ำจนผ่าน

#### NFR-14 (สูง) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Security Rules Verification]]

- **AC-1 (Automated test ผ่าน Firebase Emulator Suite ก่อน deploy):** Given Firestore Security Rules
  ที่ควบคุมสิทธิ์ role-level/patient-level (NFR-02) ถูกเขียนหรือแก้ไข, When ทีมพัฒนาเตรียม deploy
  Security Rules เหล่านั้นสู่ระบบที่ใช้กับข้อมูลผู้ป่วยจริง, Then ต้องมี automated test ผ่าน Firebase
  Emulator Suite ที่ครอบคลุมอย่างน้อย 4 กรณี ได้แก่ (ก) ผู้ใช้ที่ไม่มี PatientAssignment กับผู้ป่วยรายใด
  เลย (ข) ผู้ใช้ที่มี PatientAssignment กับผู้ป่วยบางรายเท่านั้นต้องไม่เห็นผู้ป่วยรายอื่น (ค) ผู้ใช้ที่
  บัญชีถูกระงับ และ (ง) ผู้ใช้ที่ไม่มี custom claims บทบาทที่ถูกต้อง — ทั้งหมดต้องผ่านก่อน deploy จริงเสมอ
- **AC-2 (ไม่ผ่านการทดสอบ — edge case):** Given automated test ชุดใดชุดหนึ่งใน 4 กรณีข้างต้นไม่ผ่าน,
  When เตรียม deploy Security Rules, Then ต้องไม่ deploy Security Rules ชุดนั้นจนกว่า automated test
  จะผ่านครบทุกกรณี

#### NFR-15 (กลาง) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Browser/Device Compatibility]]

- **AC-1:** Given ผู้ใช้เปิดระบบผ่าน browser หลักเวอร์ชันล่าสุด (Chrome, Edge หรือ Firefox) บนอุปกรณ์
  desktop หรือ tablet, When ผู้ใช้ใช้งานหน้าจอใดๆ ในระบบ (ค้นหา/รายชื่อผู้ป่วย, ประวัติวินิจฉัย, ผลตรวจ
  lab, ผลวิเคราะห์ความเสี่ยง), Then หน้าจอต้องแสดงผลและทำงานได้ถูกต้องครบถ้วนบน browser/อุปกรณ์เหล่านั้น
- **AC-2 (กลไกจริง — browserslist matrix ต้องตรงตามที่ technology-stack กำหนด):** Given
  [[technology-stack#12. Browserslist/Matrix การทดสอบสำหรับ Browser Compatibility (NFR-15)|technology-stack]]
  กำหนด browserslist config เป็น **`">0.5%, last 2 versions, Firefox ESR, not dead"`** ในไฟล์ build
  config ของ React SPA (`package.json`/`.browserslistrc`) และกำหนดให้ทดสอบ tablet ด้วย Chrome DevTools
  device emulation (ไม่ใช้บริการ cross-browser testing เสียเงิน), When ทีมทดสอบตรวจสอบไฟล์ build config
  ก่อน build/deploy แต่ละรอบ และจัดทำ browser test matrix ตามรายการ browser/เวอร์ชันที่ preset นี้
  ครอบคลุม (Chrome ล่าสุด, Edge ล่าสุด, Firefox ล่าสุดและ Firefox ESR), Then ค่าที่ตั้งไว้จริงต้องตรงกับ
  browserslist string ข้างต้นเป๊ะ และการทดสอบ manual ต้องครอบคลุมทั้ง desktop จริงและ tablet ที่จำลองผ่าน
  Chrome DevTools device emulation ตามแนวทางที่ตัดสินใจไว้ ไม่ใช้บริการ cross-browser testing เสียเงินใน
  รอบ MVP นี้

#### NFR-16 (ต่ำ — Won't have, out of scope เฟสนี้ทั้งหมด) — [[20260922-01-operational-quality-nfr#ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)|Interoperability (future)]]

NFR-16 ถูกกำหนดสถานะ **Won't have** ยืนยันโดยผู้ใช้แล้ว (ดู
[[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)|feature-list — หมายเหตุ NFR-16]]
และ [[backlog]]) ตามหลักการ MoSCoW รหัสที่เป็น Won't have ไม่ต้องมี AC/test case ในรอบทดสอบปัจจุบัน
เพราะอยู่นอกขอบเขตของเฟสนี้ทั้งหมด (ยังไม่ใช่ข้อกำหนดบังคับของระบบ — ดู
[[20260922-01-operational-quality-nfr#นอกขอบเขต (Out of scope) ของเอกสารนี้|หัวข้อนอกขอบเขตของ spec
ต้นทาง]]) เอกสารนี้จึงตั้งใจไม่กำหนด Acceptance Criteria สำหรับ NFR-16 ในรอบนี้ หากมีการนำ NFR-16
กลับเข้าขอบเขตในอนาคต ให้เพิ่ม AC ที่นี่ในรอบถัดไป

## เอกสารที่เกี่ยวข้อง

- [[feature-list]]
- [[user-journey]]
- [[backlog]]
- [[20260917-01-patient-ncd-history-lab-complication-risk]]
- [[20260921-01-pdpa-data-protection-compliance]]
- [[20260922-01-operational-quality-nfr]]
- [[technology-stack]]
- [[architecture]]
- [[db-spec]]
- [[DESIGN]]
- [[../../02-design/02-technical/detailed-design/patient-search-selection|detailed-design — ค้นหา/เลือกผู้ป่วยในความดูแล]]
- [[../../02-design/02-technical/detailed-design/patient-ncd-diagnosis-lab-history|detailed-design — ดูประวัติการวินิจฉัยและผลตรวจ lab]]
- [[../../02-design/02-technical/detailed-design/complication-risk-analysis-alert|detailed-design — วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน]]
- [[../../02-design/02-technical/detailed-design/pdpa-data-protection-compliance|detailed-design — คุ้มครองข้อมูลส่วนบุคคลของผู้ป่วยตาม PDPA]]
- [[test-plan]]
