---
name: sync-api-db
description: >
  ตรวจสอบและสร้าง/ปรับปรุง docs/02-design/02-technical/api-spec.md และ
  docs/02-design/02-technical/db-spec.md (เขียนคู่กันเสมอ) ให้สอดคล้องกับ
  docs/02-design/02-technical/architecture.md ล่าสุด — เขียนแบบไม่ผูก tech stack ตราบใดที่
  technology-stack.md ยังว่างเปล่า และเสริมรายละเอียดจริง (HTTP method/path, SQL type ฯลฯ) เข้าไป
  ทันทีที่ technology-stack.md มีเนื้อหาแล้ว ใช้เมื่อผู้ใช้พิมพ์ /sync-api-db หรือขอให้ "ทำ API
  spec", "ออกแบบ database schema", "เขียน db-spec", "อัปเดต api spec จาก architecture",
  "เติมรายละเอียด api/db spec จาก tech stack"
---

# Sync API & DB Spec

Skill นี้เป็น workflow มาตรฐานสำหรับตรวจสอบว่า `api-spec.md` และ `db-spec.md` สอดคล้อง
("up to date") กับ `architecture.md`/`feature-list.md` หรือไม่ ถ้าไม่สอดคล้อง ให้สร้าง/
ปรับปรุงทั้งสองไฟล์พร้อมกัน (operation contract + logical ER model) พร้อมบันทึก log ตามกฎใน
`CLAUDE.md`

**ข้อจำกัดสำคัญของสภาพแวดล้อม:** `AskUserQuestion` ใช้งานไม่ได้จากภายใน subagent ดังนั้น subagent
`api-db-writer` **ไม่มี** เครื่องมือนี้ — เมื่อต้องถามผู้ใช้ มันจะหยุดแล้วส่งคำถามกลับมาในหัวข้อ
`## NEEDS_USER_INPUT` **คุณ (ผู้ดำเนินการ skill นี้ในเทรดหลัก) คือคนที่ต้องใช้ `AskUserQuestion`
ถามผู้ใช้จริงแทน** แล้วส่งคำตอบกลับไปยัง subagent ตัวเดิมผ่าน `SendMessage` เพื่อให้ทำงานต่อ

## เมื่อถูกเรียกใช้

1. **หาวันที่ปัจจุบัน**: รูปแบบ `YYYYMMDD` เพื่อส่งต่อให้ subagent

2. **เรียก subagent `api-db-writer` ครั้งแรก**: ผ่าน Agent tool
   (`subagent_type: api-db-writer`, `run_in_background: false`) โดย prompt ต้องมีวันที่ปัจจุบัน
   และบริบทว่า subagent นี้ไม่มีเครื่องมือ `AskUserQuestion` — เมื่อต้องถามผู้ใช้ ให้ออกหัวข้อ
   `## NEEDS_USER_INPUT` ตามรูปแบบที่ระบุไว้ในระบบของ agent แล้วหยุดทำงานทันที เก็บ `agentId`
   ที่ได้กลับมาไว้ใช้ต่อในข้อ 3

3. **วนรอบถาม-ตอบจนกว่างานจะเสร็จ (สูงสุด 6 รอบ ป้องกัน infinite loop)**: อ่านผลลัพธ์จาก subagent
   ทุกครั้ง —
   - **ถ้าพบ `## NEEDS_USER_INPUT`**: แปลงแต่ละคำถามเป็นคำถามจริงผ่าน `AskUserQuestion` โดยใช้
     ตัวเลือก/ข้อดี-ข้อเสียตามที่ subagent เสนอมาเป๊ะๆ รอคำตอบผู้ใช้จริงเสมอ ห้าม mock คำตอบ จากนั้น
     เรียก `SendMessage` ไปยัง agent ตัวเดิม (`to: <agentId>`) พร้อมสรุปคำตอบต่อแต่ละคำถาม แล้ววน
     อ่านผลลัพธ์รอบถัดไป
   - **ถ้าไม่พบ**: ออกจากลูป ไปข้อ 4
   - **ถ้าครบ 6 รอบยังไม่เสร็จ**: หยุด แจ้งผู้ใช้ตรงๆ ว่าการสนทนายาวเกินคาด ให้ตรวจสอบสถานะเอง

4. **ตรวจจับสัญญาณ "ต้องการ requirement ใหม่"**: อ่านรายงานสุดท้ายทั้งหมด
   - **ไม่มีหัวข้อ `## NEEDS_NEW_REQUIREMENT`**: ข้ามไปข้อ 6
   - **มีหัวข้อนี้**: ทำข้อ 5 ก่อน แล้วค่อยไปข้อ 6

5. **Auto-chain ไป `requirement-writer` (เฉพาะเมื่อมีสัญญาณ)**:
   a. แจ้งผู้ใช้สั้นๆ ว่ากำลังส่งต่อให้ `requirement-writer` อัตโนมัติ (ไม่ต้องถามก่อน)
   b. เรียก subagent `requirement-writer` โดย prompt มีเนื้อหาใต้หัวข้อสัญญาณแบบ verbatim +
      วันที่ + บริบท session จริง
   c. รอผลลัพธ์ สุ่มตรวจ `backlog.md` อย่างน้อย 1 จุด
   d. เรียก `sync-feature-journey` ต่อ (Skill tool) ให้ feature-list/journey สะท้อนรหัสใหม่ก่อน
      แล้วเรียก `sync-architecture` ต่อ (Skill tool) ให้ architecture ครอบคลุมรหัสใหม่ด้วย
      (เพราะ api-spec/db-spec ต้องอ้างอิง component จาก architecture เสมอ) แล้วจึงเรียก
      subagent `api-db-writer` ใหม่อีกรอบ (เริ่มลูปข้อ 2-3 ใหม่)
   e. **ป้องกัน infinite loop**: ทำซ้ำได้อีกไม่เกิน 1 รอบเท่านั้น

6. **ตรวจสอบผลลัพธ์ก่อนรายงาน**: สุ่มอ่าน `api-spec.md`/`db-spec.md` จริงอย่างน้อย 1-2 จุด
   ตรวจว่า field ระหว่างสองไฟล์ตรงกัน และ (ถ้า `technology-stack.md` ยังว่างเปล่า) ไม่มีการระบุ
   HTTP method/path, SQL type, หรือชื่อ technology ใดๆ หลุดเข้าไป — หรือ (ถ้ามีเนื้อหาแล้ว) ตรวจว่า
   รายละเอียดจริงที่อ้างถึงตรงกับที่ `technology-stack.md` ระบุไว้จริง ไม่ใช่เดาเอง

7. **สรุปให้ผู้ใช้ทราบ**: up to date หรือไม่ก่อนตรวจ, ส่วนที่แก้ไขในทั้งสองไฟล์, ความต้องการใหม่
   ที่ auto-chain ไปให้ (ถ้ามี), จุดที่ถามผู้ใช้และจำนวนรอบที่ใช้

## ข้อควรระวัง

- ห้ามข้ามการเรียก subagent แล้วเขียนไฟล์เองตรงๆ ในเทรดหลัก
- **ห้ามข้ามขั้นตอนถาม `AskUserQuestion` จริงแทนคำถามใน `NEEDS_USER_INPUT`** และห้ามเดา/ช่วยตอบแทน
  ผู้ใช้เพื่อให้ลูปจบเร็วขึ้น
- **ต้องใช้ `SendMessage` กลับไปยัง agent ตัวเดิมเสมอ** ห้ามเรียก Agent ใหม่แทน ยกเว้นกรณี
  auto-chain รอบใหม่ตามข้อ 5d ที่ต้องเริ่มใหม่จริงๆ
- Subagent `api-db-writer` ตั้งใจไม่มีเครื่องมือ Bash/AskUserQuestion และห้ามแตะไฟล์ใดๆ นอกจากใน
  `api-spec.md`, `db-spec.md`, และไฟล์ log — หากผลลัพธ์พูดถึงการแก้ไข `architecture.md`/
  `feature-list.md`/`technology-stack.md` ให้หยุดและแจ้งผู้ใช้ทันที
- **ถ้าผลลัพธ์ระบุ HTTP method/path, protocol, SQL type, หรือชื่อ database engine ที่ไม่มีอยู่จริง
  ใน `technology-stack.md` (หรือระบุทั้งที่ยังว่างเปล่า) ให้ถือว่าผิดกฎ** หยุดและแจ้งผู้ใช้ทันที
- ห้ามวน auto-chain (ข้อ 5) เกิน 1 รอบเด็ดขาด แยกจาก loop คำถามผู้ใช้ในข้อ 3 (สูงสุด 6 รอบ)
- ถ้า subagent รายงานว่า `architecture.md` ยังว่างเปล่า/ไม่ครอบคลุม ให้แจ้งผู้ใช้ให้รัน
  `sync-architecture` ก่อน อย่าฝืนทำต่อ
