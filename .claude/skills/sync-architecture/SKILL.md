---
name: sync-architecture
description: >
  ตรวจสอบและสร้าง/ปรับปรุง docs/02-design/02-technical/architecture.md (hi-level design) ให้
  สอดคล้องกับ docs/02-design/feature-list.md/user-journey.md ล่าสุด — เขียนแบบไม่ผูก tech stack
  ตราบใดที่ technology-stack.md ยังว่างเปล่า และเสริมรายละเอียดเทคโนโลยีจริงเข้าไปทันทีที่
  technology-stack.md มีเนื้อหาแล้ว ใช้เมื่อผู้ใช้พิมพ์ /sync-architecture หรือขอให้ "ทำ
  architecture", "ออกแบบ hi-level design", "เขียน system architecture", "อัปเดต architecture
  จาก feature list", "เติมรายละเอียด architecture จาก tech stack"
---

# Sync Architecture

Skill นี้เป็น workflow มาตรฐานสำหรับตรวจสอบว่า `docs/02-design/02-technical/architecture.md`
สอดคล้อง ("up to date") กับ `docs/02-design/feature-list.md`/`docs/02-design/user-journey.md`
หรือไม่ ถ้าไม่สอดคล้อง ให้สร้าง/ปรับปรุงสถาปัตยกรรมระดับ hi-level (component, data flow, NFR
mapping) พร้อมบันทึก log ตามกฎใน `CLAUDE.md`

**ข้อจำกัดสำคัญของสภาพแวดล้อม:** `AskUserQuestion` ใช้งานไม่ได้จากภายใน subagent ดังนั้น subagent
`architecture-writer` **ไม่มี** เครื่องมือนี้ — เมื่อต้องถามผู้ใช้ มันจะหยุดแล้วส่งคำถามกลับมาในหัวข้อ
`## NEEDS_USER_INPUT` **คุณ (ผู้ดำเนินการ skill นี้ในเทรดหลัก) คือคนที่ต้องใช้ `AskUserQuestion`
ถามผู้ใช้จริงแทน** แล้วส่งคำตอบกลับไปยัง subagent ตัวเดิมผ่าน `SendMessage` เพื่อให้ทำงานต่อ

## เมื่อถูกเรียกใช้

1. **หาวันที่ปัจจุบัน**: ใช้ค่าวันที่ปัจจุบันที่มีอยู่ในบริบทของคุณ (รูปแบบ `YYYYMMDD`)
   เพื่อส่งต่อให้ subagent ใช้กับไฟล์ log ของวันนี้

2. **เรียก subagent `architecture-writer` ครั้งแรก**: ผ่าน Agent tool
   (`subagent_type: architecture-writer`, `run_in_background: false`) โดย prompt ที่ส่งต้องมี:
   - วันที่ปัจจุบัน (YYYYMMDD)
   - บริบทว่า subagent นี้ไม่มีเครื่องมือ `AskUserQuestion` — เมื่อต้องถามผู้ใช้ ให้ออกหัวข้อ
     `## NEEDS_USER_INPUT` ตามรูปแบบที่ระบุไว้ในระบบของ agent แล้วหยุดทำงานทันที
   - เก็บ `agentId` ที่ได้กลับมาไว้ใช้ต่อในข้อ 3

3. **วนรอบถาม-ตอบจนกว่างานจะเสร็จ (สูงสุด 6 รอบ ป้องกัน infinite loop)**: อ่านผลลัพธ์จาก subagent
   ทุกครั้ง —
   - **ถ้าพบ `## NEEDS_USER_INPUT`**: แปลงแต่ละคำถามเป็นคำถามจริงผ่าน `AskUserQuestion` โดยใช้
     ตัวเลือก/ข้อดี-ข้อเสียตามที่ subagent เสนอมาเป๊ะๆ ไม่ตัดทอน/แต่งเพิ่มเอง รอคำตอบผู้ใช้จริงเสมอ
     ห้าม mock คำตอบ จากนั้นเรียก `SendMessage` ไปยัง agent ตัวเดิม (`to: <agentId>`) พร้อมสรุป
     คำตอบต่อแต่ละคำถาม แล้ววนอ่านผลลัพธ์รอบถัดไป
   - **ถ้าไม่พบ**: ออกจากลูป ไปข้อ 4
   - **ถ้าครบ 6 รอบยังไม่เสร็จ**: หยุด แจ้งผู้ใช้ตรงๆ ว่าการสนทนายาวเกินคาด ให้ตรวจสอบสถานะเอง

4. **ตรวจจับสัญญาณ "ต้องการ requirement ใหม่"**: อ่านรายงานสุดท้ายที่ได้กลับมาทั้งหมด
   - **ถ้าไม่มีหัวข้อ `## NEEDS_NEW_REQUIREMENT` ในรายงาน**: ข้ามไปข้อ 7 ตามปกติ
   - **ถ้ามีหัวข้อนี้**: ทำตามข้อ 6 ก่อน (auto-chain ไป `requirement-writer`) แล้วค่อยไปข้อ 7

5. *(สงวนหมายเลขไว้ว่าง — ดูข้อ 3 สำหรับ loop คำถามผู้ใช้)*

6. **Auto-chain ไป `requirement-writer` (เฉพาะเมื่อมีสัญญาณในข้อ 4)**:
   a. แจ้งผู้ใช้สั้นๆ ว่าเจอความต้องการใหม่ระหว่างออกแบบ architecture กำลังส่งต่อให้
      `requirement-writer` เขียนเป็น FR/NFR ให้อัตโนมัติ (ไม่ต้องถามผู้ใช้ก่อน)
   b. เรียก subagent `requirement-writer` ผ่าน Agent tool (`run_in_background: false`) โดย prompt
      มีเนื้อหาใต้หัวข้อ `## NEEDS_NEW_REQUIREMENT` แบบ verbatim + วันที่ปัจจุบัน + บริบท session จริง
   c. รอผลลัพธ์ สุ่มตรวจสอบเองอย่างน้อย 1 จุด (`backlog.md`)
   d. เรียก `sync-feature-journey` ต่อ (ผ่าน Skill tool) เพื่อให้ feature-list/user-journey
      สะท้อนรหัสใหม่ก่อน แล้วเรียก subagent `architecture-writer` ใหม่อีกรอบ (เริ่มลูปข้อ 2-3 ใหม่)
   e. **ป้องกัน infinite loop**: ทำซ้ำได้อีกไม่เกิน 1 รอบ ถ้ายังพบสัญญาณอีก ให้หยุดและรายงาน
      ผู้ใช้ตรงๆ

7. **ตรวจสอบผลลัพธ์ก่อนรายงาน**: สุ่มอ่าน `architecture.md` จริงอย่างน้อย 1-2 จุด (ตรวจว่ามี
   Mermaid diagram จริง, ไม่มีการระบุชื่อ technology/framework ใดๆ หลุดเข้าไปในเอกสารถ้า
   `technology-stack.md` ยังว่างเปล่า — หรือถ้ามีเนื้อหาแล้ว ตรวจว่าเทคโนโลยีที่อ้างถึงตรงกับที่
   `technology-stack.md` ระบุไว้จริง ไม่ใช่เดาเอง) ก่อนสรุปให้ผู้ใช้ฟัง

8. **สรุปให้ผู้ใช้ทราบ**: up to date อยู่แล้วหรือไม่ก่อนตรวจ, ส่วนที่แก้ไข, ความต้องการใหม่ที่
   auto-chain ไปให้ (ถ้ามี), จุดที่ถามผู้ใช้ (ถ้ามี) และจำนวนรอบที่ใช้

## ข้อควรระวัง

- ห้ามข้ามการเรียก subagent แล้วเขียน architecture.md เองตรงๆ ในเทรดหลัก
- **ห้ามข้ามขั้นตอนถาม `AskUserQuestion` จริงแทนคำถามใน `NEEDS_USER_INPUT`** และห้ามเดา/ช่วยตอบแทน
  ผู้ใช้เพื่อให้ลูปจบเร็วขึ้น
- **ต้องใช้ `SendMessage` กลับไปยัง agent ตัวเดิมเสมอ** ห้ามเรียก Agent ใหม่แทน (จะเสียบริบทที่อ่าน
  ไปแล้ว) ยกเว้นกรณี auto-chain รอบใหม่ทั้งหมดตามข้อ 6d ที่ต้องเริ่มใหม่จริงๆ เพราะ feature-list
  เปลี่ยนไปแล้ว
- Subagent นี้ไม่มีเครื่องมือ Bash/AskUserQuestion และห้ามแตะไฟล์ใดๆ นอกจาก `architecture.md` กับไฟล์
  log ของวันนั้น หากผลลัพธ์พูดถึงการแก้ไขไฟล์อื่น (โดยเฉพาะ `backlog.md`, `feature-list.md`,
  `technology-stack.md`) ให้หยุดและแจ้งผู้ใช้ทันที
- **ถ้าผลลัพธ์ที่ได้กลับมาระบุชื่อ technology/framework/database engine ที่ไม่มีอยู่จริงใน
  `technology-stack.md` (หรือระบุทั้งที่ `technology-stack.md` ยังว่างเปล่าอยู่) ให้ถือว่าผิดกฎ**
  หยุดและแจ้งผู้ใช้ทันที
- ห้ามวน auto-chain (ข้อ 6) เกิน 1 รอบเด็ดขาด แยกจาก loop คำถามผู้ใช้ในข้อ 3 (สูงสุด 6 รอบ)
- ถ้า subagent รายงานว่า `feature-list.md`/`user-journey.md` ไม่สอดคล้องกับ `backlog.md` ให้แจ้ง
  ผู้ใช้ให้รัน `sync-feature-journey` ก่อน อย่าฝืนทำต่อ
