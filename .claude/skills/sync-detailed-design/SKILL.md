---
name: sync-detailed-design
description: >
  ตรวจสอบและสร้าง/ปรับปรุงไฟล์ใน docs/02-design/02-technical/detailed-design/{feature-slug}.md
  (sequence flow, state transition, edge case ต่อฟีเจอร์) ให้สอดคล้องกับ
  docs/02-design/02-technical/api-spec.md/db-spec.md ล่าสุด — เขียนแบบไม่ผูก tech stack ตราบใดที่
  technology-stack.md ยังว่างเปล่า และเสริมรายละเอียดการ implement จริงเข้าไปทันทีที่
  technology-stack.md มีเนื้อหาแล้ว ใช้เมื่อผู้ใช้พิมพ์ /sync-detailed-design หรือขอให้ "ทำ
  detailed design", "ออกแบบ component ของฟีเจอร์นี้", "อัปเดต detailed design จาก api spec",
  "เติมรายละเอียด detailed design จาก tech stack"
---

# Sync Detailed Design

Skill นี้เป็น workflow มาตรฐานสำหรับตรวจสอบว่าไฟล์ใน `detailed-design/` สอดคล้อง ("up to
date") กับ `api-spec.md`/`db-spec.md`/`feature-list.md` หรือไม่ ถ้าไม่สอดคล้อง ให้สร้าง/
ปรับปรุงการออกแบบระดับ component ต่อฟีเจอร์ พร้อมบันทึก log ตามกฎใน `CLAUDE.md`

**ข้อจำกัดสำคัญของสภาพแวดล้อม:** `AskUserQuestion` ใช้งานไม่ได้จากภายใน subagent ดังนั้น subagent
`detailed-design-writer` **ไม่มี** เครื่องมือนี้ — เมื่อต้องถามผู้ใช้ (ทั้งกรณีไฟล์ล้าสมัย และจุด
ไม่ชัดเจนอื่นๆ) มันจะหยุดแล้วส่งคำถามกลับมาในหัวข้อ `## NEEDS_USER_INPUT` **คุณ (ผู้ดำเนินการ skill
นี้ในเทรดหลัก) คือคนที่ต้องใช้ `AskUserQuestion` ถามผู้ใช้จริงแทน** แล้วส่งคำตอบกลับไปยัง subagent
ตัวเดิมผ่าน `SendMessage` เพื่อให้ทำงานต่อ

## เมื่อถูกเรียกใช้

1. **หาวันที่ปัจจุบัน**: รูปแบบ `YYYYMMDD` เพื่อส่งต่อให้ subagent

2. **เรียก subagent `detailed-design-writer` ครั้งแรก**: ผ่าน Agent tool
   (`subagent_type: detailed-design-writer`, `run_in_background: false`) โดย prompt ต้องมีวันที่
   ปัจจุบันและบริบทว่า subagent นี้ไม่มีเครื่องมือ `AskUserQuestion` — เมื่อต้องถามผู้ใช้ ให้ออก
   หัวข้อ `## NEEDS_USER_INPUT` ตามรูปแบบที่ระบุไว้ในระบบของ agent แล้วหยุดทำงานทันที เก็บ
   `agentId` ที่ได้กลับมาไว้ใช้ต่อในข้อ 3

3. **วนรอบถาม-ตอบจนกว่างานจะเสร็จ (สูงสุด 6 รอบ ป้องกัน infinite loop)**: อ่านผลลัพธ์จาก subagent
   ทุกครั้ง —
   - **ถ้าพบ `## NEEDS_USER_INPUT`**: แปลงแต่ละคำถามเป็นคำถามจริงผ่าน `AskUserQuestion` โดยใช้
     ตัวเลือก/ข้อดี-ข้อเสียตามที่ subagent เสนอมาเป๊ะๆ รอคำตอบผู้ใช้จริงเสมอ ห้าม mock คำตอบ จากนั้น
     เรียก `SendMessage` ไปยัง agent ตัวเดิม (`to: <agentId>`) พร้อมสรุปคำตอบต่อแต่ละคำถาม แล้ววน
     อ่านผลลัพธ์รอบถัดไป
   - **ถ้าไม่พบ**: ออกจากลูป ไปข้อ 4
   - **ถ้าครบ 6 รอบยังไม่เสร็จ**: หยุด แจ้งผู้ใช้ตรงๆ ว่าการสนทนายาวเกินคาด ให้ตรวจสอบสถานะเอง

4. **ตรวจสอบผลลัพธ์ก่อนรายงาน**: สุ่มอ่านไฟล์ใน `detailed-design/` จริงอย่างน้อย 1-2 จุด ตรวจว่า
   operation/entity ที่อ้างถึงมีอยู่จริงใน `api-spec.md`/`db-spec.md` และ (ถ้า `technology-stack.md`
   ยังว่างเปล่า) ไม่มีการระบุ framework/library เฉพาะภาษาใดๆ หลุดเข้าไป — หรือ (ถ้ามีเนื้อหาแล้ว)
   ตรวจว่ารายละเอียดที่อ้างถึงตรงกับที่ `technology-stack.md` ระบุไว้จริง

5. **สรุปให้ผู้ใช้ทราบ**: up to date หรือไม่ก่อนตรวจ, ไฟล์ที่สร้าง/แก้ไข, จุดที่ถามผู้ใช้ (ถ้ามี)
   และจำนวนรอบที่ใช้, ช่องว่างของ api-spec/db-spec ที่ subagent รายงาน (ถ้ามี)

## ข้อควรระวัง

- ห้ามข้ามการเรียก subagent แล้วเขียนไฟล์เองตรงๆ ในเทรดหลัก
- **ห้ามข้ามขั้นตอนถาม `AskUserQuestion` จริงแทนคำถามใน `NEEDS_USER_INPUT`** และห้ามเดา/ช่วยตอบแทน
  ผู้ใช้เพื่อให้ลูปจบเร็วขึ้น
- **ต้องใช้ `SendMessage` กลับไปยัง agent ตัวเดิมเสมอ** ห้ามเรียก Agent ใหม่แทน (จะเสียบริบทที่อ่าน
  ไปแล้ว)
- Subagent นี้ตั้งใจไม่มีเครื่องมือ Bash/AskUserQuestion และห้ามแตะไฟล์ใดๆ นอกจากไฟล์ใน
  `detailed-design/` กับไฟล์ log — หากผลลัพธ์พูดถึงการแก้ไข `api-spec.md`/`db-spec.md`/
  `architecture.md`/`feature-list.md`/`technology-stack.md` ให้หยุดและแจ้งผู้ใช้ทันที
- **ถ้าผลลัพธ์ระบุ framework/library/pattern เฉพาะภาษาใดๆ ที่ไม่มีอยู่จริงใน `technology-stack.md`
  (หรือระบุทั้งที่ยังว่างเปล่า) ให้ถือว่าผิดกฎ** หยุดและแจ้งผู้ใช้ทันที
- ถ้า subagent รายงานว่า `api-spec.md`/`db-spec.md` ยังไม่ครอบคลุมฟีเจอร์ที่ต้องออกแบบ ให้แจ้ง
  ผู้ใช้ให้รัน `sync-api-db` ก่อน อย่าฝืนทำต่อ
- ไม่มี auto-chain ไป `requirement-writer` ในชั้นนี้ (agent นี้ถูกจำกัดให้ใช้ operation/entity ที่
  มีอยู่แล้วเท่านั้น ถ้าขาดให้แนะนำ `sync-api-db` แทนเสมอ ไม่ใช่ requirement ใหม่โดยตรง)
