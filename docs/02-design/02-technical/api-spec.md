# API Spec (Logical Operation Contract)

เอกสารนี้อธิบายสัญญาการทำงาน (operation contract) ของความสามารถที่
[[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Backend Service]] และ
[[architecture#บริการยืนยันตัวตน (Authentication Service)|Authentication Service]] ใน [[architecture]]
ต้องมี เพื่อรองรับฟีเจอร์ทั้งหกใน [[feature-list]] และทั้งสาม journey ใน [[user-journey]] อ้างอิงความ
ต้องการต้นทางจาก [[backlog]],
[[20260917-01-patient-ncd-history-lab-complication-risk]],
[[20260921-01-pdpa-data-protection-compliance]] (ฟีเจอร์ที่ 4 — คุ้มครองข้อมูลส่วนบุคคลตาม PDPA,
NFR-03–NFR-08),
[[20260922-01-operational-quality-nfr]] (ฟีเจอร์ที่ 5 — รับประกันคุณภาพเชิงปฏิบัติการของระบบ,
NFR-09–NFR-16) และ
[[20260923-01-user-authentication-email-password]] (ฟีเจอร์ที่ 6 — สมัครบัญชี เข้าสู่ระบบ และจัดการ
รหัสผ่านด้วยอีเมล, FR-07–FR-10, NFR-17–NFR-18) field ของ input/output แต่ละ operation ตรงกับ
attribute ของ entity ใน [[db-spec]] เสมอ

**อัปเดต 2026-09-24 (รอบ sync ที่ห้า) — สอดคล้องกับ `[[technology-stack]]` รอบสาม (decision area
7 แก้ไข + 13-19 ใหม่):** แก้ไขทุกจุดที่เคยอ้างอิง "Custom Claims เก็บบทบาท/isActive" ให้ตรงกับการ
ตัดสินใจใหม่ว่า **ไม่ sync ไปยัง Custom Claims เลย** — Firestore `users/{uid}` เป็น source of truth
เดียวที่ทั้ง Security Rules (Operation 0) และ Cloud Functions (Operation 1-6) อ่านตรงทุกครั้ง (ดู
Output/Technical Binding ของ Operation 7 และ Technical Binding ของ Operation ร่วม Access Control)
เพิ่มการตรวจสอบ `email_verified` ซ้ำที่ Operation ร่วม Access Control (กฎข้อ 2.5 ใหม่ + error case ใหม่
+ Technical Binding) ตาม decision area 19, ปรับ Technical Binding ของ Operation 8/9 ให้ระบุกลไกจริง
ตาม decision area 13 (password policy), 14 (email enumeration prevention), 15 (เทมเพลตอีเมล), 17
(การสร้าง `users/{uid}` + rollback) และแก้ Operation 9 ให้แยก Technical Binding เป็น 9a/9b ให้ตรงกับ
ความจริงที่ `confirmPasswordReset` ไม่ผ่าน Cloud Function ปิดรายการ "ประเด็นรอตัดสินใจ" ที่ตัดสินใจแล้ว

**อัปเดต 2026-09-23 (รอบ sync ที่สี่) — เพิ่ม Operation สำหรับฟีเจอร์ที่ 6 (Authentication):**
เพิ่ม Operation 7 (เข้าสู่ระบบ — FR-07), Operation 8 (สมัครบัญชี — FR-08/FR-09, NFR-17, NFR-18)
และ Operation 9 (ขอรีเซ็ตรหัสผ่าน — FR-10, NFR-17, NFR-18) ด้านล่าง พร้อมหัวข้อใหม่
[[#Cross-cutting: Authentication ที่ครอบคลุมทุก Operation หลัง Login (FR-07–FR-10, NFR-17, NFR-18)]]
ที่อธิบายผลกระทบต่อ Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" — สอดคล้องกับการตัดสินใจ
สถาปัตยกรรมที่ผู้ใช้ยืนยันแล้วผ่าน `NEEDS_USER_INPUT` ใน [[architecture]] (ดูหมายเหตุการอัปเดตล่าสุด
ต้นเอกสาร [[architecture]])

**หมายเหตุสำคัญ:** เอกสารนี้อธิบายเป็นหลักในระดับ operation เชิงตรรกะ (ชื่อ operation, ผู้เรียกได้/
บทบาท, input, output, กฎทางธุรกิจ, กรณี error) — field ของ input/output แต่ละ operation ตรงกับ
attribute ของ entity ใน [[db-spec]] เสมอ

**อัปเดต 2026-09-22 (รอบ sync ที่สอง) — ตรวจสอบความสอดคล้องกับฟีเจอร์ที่ 5 (NFR-09–NFR-16):** หลังจาก
[[architecture]] ถูกอัปเดตให้ map NFR-09–NFR-16 เข้ากับ component เดิมทั้ง 5 ตัวแล้ว (ไม่มี component
ใหม่) พบว่าฟีเจอร์ที่ 5 **ไม่ต้องเพิ่ม operation ใหม่ในเอกสารนี้** เช่นกัน เนื่องจากเป็นข้อกำหนดเชิง
คุณภาพ (quality attribute) ที่ผูกกับ operation ที่มีอยู่แล้วทั้งหมด — ดูหัวข้อใหม่
[[#Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)]] ด้านล่าง
สำหรับสรุปว่าแต่ละรหัส NFR กระทบ operation ใดอย่างไร และดูหมายเหตุเพิ่มเติมที่แทรกไว้ใน Operation ร่วม
"ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (NFR-12) และ Operation 3 (NFR-11, NFR-13)

**อัปเดต 2026-09-22 — เสริมรายละเอียดเทคโนโลยีจริง (ตาม `[[technology-stack]]`):** `[[technology-stack]]`
มีเนื้อหาแล้วและตัดสินใจว่าระบบเป็นสถาปัตยกรรม Firebase-native — **ไม่มี REST/GraphQL/gRPC API แบบ
ดั้งเดิม** แต่แบ่งเป็น 2 กลไกจริงตาม
[[technology-stack#3. สถาปัตยกรรม Backend Service — Firebase-native (ไม่มี Backend Service แยกแบบดั้งเดิม)|decision area 3]]:
**Operation 0** implement เป็น **Client อ่าน Cloud Firestore ตรงผ่าน Firebase SDK + Firestore
Security Rules** (ไม่ผ่าน Cloud Functions) ส่วน **Operation 1-6** implement เป็น **Cloud Functions
(2nd gen, Node.js + TypeScript) — HTTPS Callable Functions** (Operation 1-5) หรือ **scheduled
function ผ่าน Cloud Scheduler** (Operation 6) — ทุก operation ด้านล่างจึงมีหัวข้อย่อย **"Technical
Binding"** ต่อท้ายระบุกลไกจริง (ชื่อ Cloud Function/query pattern จริง) พร้อม error code จริงที่ใช้
สื่อสารแต่ละกรณี error (Firebase Callable Functions ใช้ `functions.https.HttpsError` พร้อม error
code มาตรฐานของ Firebase เช่น `unauthenticated`, `permission-denied`, `invalid-argument`,
`not-found`, `failed-precondition`, `internal`) รายละเอียดเนื้อหาเชิง logical เดิม (input/output/
กฎทางธุรกิจ) ยังคงอยู่ครบทุกจุด รายการที่ยังไม่ถูกตัดสินใจสรุปไว้ในหัวข้อ "ประเด็นรอตัดสินใจ" ท้ายเอกสาร

## บทบาทผู้เรียกใช้ (Roles)

มีบทบาทเดียวในขอบเขตนี้ตามที่ระบุใน [[user-journey]]:

- **แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD** — บทบาท "แพทย์" หรือ "พยาบาล" ของ entity ผู้ใช้ (User) ใน
  [[db-spec#ผู้ใช้ (User)|db-spec]] ([[backlog#Non-Functional Requirements|NFR-02]]) — บทบาทเดียวกันนี้
  ทำหน้าที่เป็น "เจ้าหน้าที่ที่มีสิทธิ์" เมื่อดำเนินการตามคำขอสิทธิของเจ้าของข้อมูล (Operation 4) หรือ
  สืบค้น audit trail (Operation 5) ตาม [[user-journey#Journey เจ้าหน้าที่ดำเนินการตามคำขอใช้สิทธิของเจ้าของข้อมูล และสนับสนุนการสืบสวนกรณีข้อมูลส่วนบุคคลรั่วไหล (PDPA)|journey ที่สอง]] —
  [[20260921-01-pdpa-data-protection-compliance#บทบาทที่เกี่ยวข้อง|spec PDPA ยืนยันว่าไม่มีการเพิ่มบทบาทใหม่]]
  (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสารว่าควรจำกัดเพิ่มเติมหรือไม่)
- **ผู้สมัครบัญชี (บุคคลทั่วไปที่ยังไม่มีบัญชี หรือมีบัญชีแต่ยังไม่ได้รับอนุมัติ)** — เรียกได้เฉพาะ
  Operation 7 (เข้าสู่ระบบ), Operation 8 (สมัครบัญชี) และ Operation 9 (ขอรีเซ็ตรหัสผ่าน) ด้านล่าง
  เท่านั้น **ใหม่จากฟีเจอร์ที่ 6** ([[20260923-01-user-authentication-email-password#บทบาทที่เกี่ยวข้อง|spec Authentication ยืนยันว่าไม่ใช่บทบาท (role) ใหม่ในระบบ ไม่มี Custom Claims ของตัวเอง]])
  — บุคคลกลุ่มนี้**ไม่มีสิทธิ์เรียก Operation 0-6 ใดๆ** จนกว่าบัญชีจะผ่านการอนุมัติ (`role` ถูกกำหนด +
  `isActive=true`) และยืนยันอีเมลแล้ว (FR-09) ตามที่ Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูล
  ผู้ป่วย" กำหนด
- **ผู้ดูแลระบบ (system administrator)** — ดำเนินการอนุมัติบัญชี (กำหนด `role` + `isActive=true`)
  ผ่าน Firebase Console/Firestore โดยตรง **ไม่ใช่ผู้เรียก operation ใดในเอกสารนี้** (ไม่มีหน้าจอ/
  operation อนุมัติบัญชีในระบบสำหรับ MVP — ยืนยันแล้วโดยผู้ใช้ ดู
  [[20260923-01-user-authentication-email-password#นอกขอบเขต (Out of scope) ของเอกสารนี้|หัวข้อนอกขอบเขตของ spec Authentication]])

ทุก operation ในเอกสารนี้ (Operation 0-6) เรียกได้เฉพาะบทบาทแพทย์/พยาบาลเท่านั้น และต้องผ่าน operation
"ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (ด้านล่าง) ก่อนเสมอ — Operation 7-9 (Authentication) เรียกได้
โดยไม่ต้องผ่านการตรวจสอบนี้ก่อน เพราะเป็น precondition ของการมีบทบาทตั้งแต่แรก (ดูหัวข้อ Operation 7-9
ด้านล่าง)

## Operation ร่วม — ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย (Access Control)

รองรับ [[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Access Control]] ใน architecture และ
[[backlog#Non-Functional Requirements|NFR-02]] — เป็น precondition ที่ทุก operation อื่นในเอกสารนี้
ต้องเรียกใช้ก่อนประมวลผลต่อเสมอ ไม่ใช่ operation ที่ Client เรียกตรงด้วยตัวเอง

- **ผู้เรียกได้/บทบาท:** internal (เรียกจาก Backend Service เอง ก่อนทุก operation ที่ Client ร้องขอ)
- **Input:**
  - ข้อมูลยืนยันตัวตนของผู้ใช้ (auth context) — จำเป็น
  - รหัสผู้ป่วย (Patient.id) ที่ถูกร้องขอ — ไม่บังคับ (ระบุเมื่อเป็น precondition ของ operation ที่
    เข้าถึงข้อมูลผู้ป่วยรายบุคคล เช่น Operation 1, 2, 3 ด้านล่าง; ไม่ระบุเมื่อเป็น precondition ของ
    Operation 0 "ค้นหา/แสดงรายชื่อผู้ป่วยในความดูแล" ซึ่งยังไม่มีผู้ป่วยรายใดถูกเลือก)
- **Output:** อนุญาต/ปฏิเสธ พร้อมข้อมูล User (id, บทบาท, สถานะการใช้งานบัญชี) ถ้าอนุญาต
- **กฎทางธุรกิจ:** แบ่งเป็น 2 ระดับตาม [[backlog#Non-Functional Requirements|NFR-02]] ฉบับขยายความ
  (เชื่อมโยงกับ [[backlog#สูง (MVP)|FR-05]]):
  1. **ตรวจสอบระดับบทบาท (role-level)** — ตรวจสอบทุกครั้งไม่ว่าจะระบุรหัสผู้ป่วยหรือไม่: อนุญาตเฉพาะ
     เมื่อ User.บทบาท เป็น "แพทย์" หรือ "พยาบาล" และ User.สถานะการใช้งานบัญชี เป็นจริง — **ใหม่จาก
     ฟีเจอร์ที่ 6:** บัญชีที่เพิ่งสมัคร (Operation 8) แต่ยังไม่ได้รับอนุมัติจากผู้ดูแลระบบ มี
     User.บทบาท เป็นค่าว่าง/ไม่มีค่าและ User.สถานะการใช้งานบัญชี เป็นเท็จโดยดีฟอลต์ (ดู
     [[db-spec#ผู้ใช้ (User)|db-spec]]) จึง**ไม่ผ่านการตรวจสอบระดับบทบาทนี้โดยอัตโนมัติอยู่แล้ว**
     ไม่ต้องเพิ่มเงื่อนไขใหม่ (FR-08, NFR-02)
  2. **ตรวจสอบระดับรายผู้ป่วย (patient-level)** — ตรวจสอบเพิ่มเติมเฉพาะเมื่อมีการระบุรหัสผู้ป่วย:
     ต้องมีระเบียน [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|PatientAssignment]]
     ที่เชื่อมโยง User นี้กับ Patient รายนี้อยู่จริง มิฉะนั้นปฏิเสธการเข้าถึงข้อมูลผู้ป่วยรายนี้แม้ผ่าน
     การตรวจสอบระดับบทบาทแล้วก็ตาม
  2.5. **ตรวจสอบสถานะยืนยันอีเมล (`email_verified`) — เพิ่มใหม่ 2026-09-24 (FR-09, ใช้ทุกครั้งไม่ว่าจะ
     ระบุรหัสผู้ป่วยหรือไม่ เช่นเดียวกับข้อ 1):** ตาม
     [[technology-stack#19. การตรวจสอบ `emailVerified` ซ้ำฝั่ง Backend (FR-09, ฟีเจอร์ที่ 6) — ตรวจทั้ง Cloud Functions และ Security Rules|decision area 19 ใน technology-stack]]
     อนุญาตเฉพาะเมื่อ `email_verified` ในข้อมูลยืนยันตัวตน (Firebase ID token) เป็นจริงเท่านั้น — ปิด
     ช่องว่างที่ [[20260923-01-user-authentication-email-password#Edge Case และวิธีจัดการ|detailed-design ของฟีเจอร์ที่ 6 ระบุไว้ว่าเป็นความเสี่ยงจริง]]
     (Client ที่ถูกดัดแปลง/บั๊กข้ามการตรวจสอบ `emailVerified` ที่ชั้น UX แล้วเรียก Operation 0-6 ตรง) —
     เดิม (ก่อน 2026-09-24) operation ร่วมนี้พึ่งพา Client ตรวจสอบเพียงอย่างเดียว ปัจจุบันตรวจซ้ำที่นี่
     ด้วยเสมอ
  3. **บังคับหลัก purpose limitation (NFR-03)** — เมื่อผ่านทั้งสองระดับข้างต้นแล้ว Backend Service
     ต้องจำกัดขอบเขตข้อมูล/การประมวลผลที่ส่งต่อให้ operation อื่น (Operation 0-6 ด้านล่าง) เฉพาะเท่าที่
     จำเป็นตามวัตถุประสงค์การดูแลรักษาผู้ป่วยในขอบเขตของ FR-01–FR-04 หรือขอบเขตคำขอสิทธิของเจ้าของ
     ข้อมูลตาม NFR-07 เท่านั้น ไม่ส่งต่อ/เปิดเผยข้อมูลนอกวัตถุประสงค์โดยไม่มีฐานทางกฎหมายรองรับ — ฐาน
     ทางกฎหมายที่ชัดเจนยังรอฝ่ายกฎหมาย/DPO ยืนยัน (ดู [[architecture#ประเด็นรอตัดสินใจอื่น (ไม่เกี่ยวกับ technology stack)|ประเด็นรอตัดสินใจอื่นใน architecture]])
  - ต้องตรวจสอบทั้งสามข้อที่เกี่ยวข้องก่อนที่ Backend Service จะเข้าถึง
    [[architecture#ที่เก็บข้อมูลหลัก (Primary Data Store)|Primary Data Store]] ทุกครั้ง
  - เมื่อผ่านการตรวจสอบระดับรายผู้ป่วยสำเร็จ (มีการระบุรหัสผู้ป่วยและได้รับอนุญาต) Backend Service
    ต้องเรียก "บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)" (ด้านล่าง) ก่อนดำเนินการต่อไปยัง
    Operation 1, 2, 3 หรือ Operation 4 เสมอ ตาม [[backlog#Non-Functional Requirements|NFR-06]]
  4. **ความสัมพันธ์กับ Session Timeout (NFR-12)** — operation นี้เป็นจุดเดียวกันที่ใช้บังคับ
     "ปฏิเสธคำขอที่ไม่มี token ที่ถูกต้องแนบมา" หลังผู้ใช้ถูก auto-logout จาก Client แล้ว (ไม่ใช่ operation
     ใหม่แยกต่างหาก) — เมื่อ Client ตรวจพบว่าไม่มีการใช้งาน (inactivity) เกิน 30 นาทีตาม
     [[architecture#ขอบเขตความรับผิดชอบของแต่ละ Component|หน้าที่ของ Client ใน architecture]] แล้ว
     auto-logout (ลบ/เพิกถอน token ในเครื่อง), คำขอถัดไปใดๆ ที่ไม่มี auth context ที่ถูกต้องแนบมาจะถูก
     ปฏิเสธที่ operation นี้โดยอัตโนมัติผ่านเงื่อนไข "ไม่มีข้อมูลยืนยันตัวตน" ด้านล่างอยู่แล้ว **กลไกฝั่ง
     เซิร์ฟเวอร์เพิ่มเติมเพื่อเพิกถอน token ที่ยังไม่หมดอายุจริง (เช่น revoke ทันทีที่ idle เกิน 30 นาที
     แม้ token ยังไม่ expire) ยังไม่ถูกตัดสินใจ** (ดู
     [[architecture#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน architecture]] และหัวข้อ "ประเด็นรอตัดสินใจ"
     ท้ายเอกสารนี้) — **ทางเลือก "ตรวจสอบ `lastActivityAt` ทุกคำขอ" ถูกพิจารณาแล้วและตัดสินใจไม่เลือก**
     (กระทบ NFR-09 โดยตรง) จึงไม่มี field นี้ใน [[db-spec#ผู้ใช้ (User)|User]] ดูเหตุผลเต็มที่
     [[db-spec#ผู้ใช้ (User)|หมายเหตุ NFR-12 ในหัวข้อ User ของ db-spec]]
- **กรณี error:**
  - ไม่มีข้อมูลยืนยันตัวตน หรือข้อมูลยืนยันตัวตนไม่ถูกต้อง → ปฏิเสธการเข้าถึง
  - บทบาทผู้ใช้ไม่ใช่แพทย์/พยาบาล หรือบัญชีถูกระงับ → ปฏิเสธการเข้าถึง (NFR-02)
  - บทบาทผู้ใช้ถูกต้อง แต่ระบุรหัสผู้ป่วยที่ไม่มี PatientAssignment เชื่อมโยงกับผู้ใช้นี้ → ปฏิเสธการ
    เข้าถึงข้อมูลผู้ป่วยรายนี้ (NFR-02, FR-05) — ผู้ใช้ยังคงเห็นรายชื่อผู้ป่วยรายอื่นที่ตนดูแลอยู่ได้ปกติ
  - บทบาท/สถานะการใช้งานบัญชี/PatientAssignment ถูกต้องครบ แต่ `email_verified` เป็นเท็จ → ปฏิเสธการ
    เข้าถึง (FR-09 — เพิ่มใหม่ 2026-09-24 ตาม decision area 19 ใน technology-stack)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-02]], [[backlog#สูง (MVP)|FR-05]],
  [[backlog#Non-Functional Requirements|NFR-03]],
  [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|PatientAssignment]]
- **Technical Binding (ตาม [[technology-stack#3. สถาปัตยกรรม Backend Service — Firebase-native (ไม่มี Backend Service แยกแบบดั้งเดิม)|decision area 3 ใน technology-stack]]):**
  ไม่ใช่ Cloud Function แยกที่ถูกเรียกเป็น operation เดี่ยว — implement เป็น 2 กลไกคู่ขนานตามเส้นทาง
  ที่ operation นั้นใช้:
  - **สำหรับ Operation 0:** ตรวจสอบระดับบทบาท+สถานะบัญชีใน **Firestore Security Rules** ผ่าน
    `get(/databases/$(database)/documents/users/$(request.auth.uid))` (ดู
    [[db-spec#ผู้ใช้ (User)|Firestore Technical Binding ของ User ใน db-spec]]); ตรวจสอบระดับ
    รายผู้ป่วยผ่าน field `userId` บนเอกสาร `patientAssignments` ที่ query ตรง (ดู
    [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|Firestore Technical Binding ของ
    PatientAssignment]]) — **เพิ่มเงื่อนไข `request.auth.token.email_verified == true` ในรอบ
    2026-09-24** ตาม
    [[technology-stack#19. การตรวจสอบ `emailVerified` ซ้ำฝั่ง Backend (FR-09, ฟีเจอร์ที่ 6) — ตรวจทั้ง Cloud Functions และ Security Rules|decision area 19]]
    (อ่านจาก token ที่ verify อยู่แล้ว ไม่ต้องเพิ่ม Firestore read)
  - **สำหรับ Operation 1-6:** เขียนเป็น shared helper module ภายในโค้ด Cloud Functions (Node.js +
    TypeScript) เรียกจากทุก callable function ก่อนดำเนินการ — ตรวจสอบบทบาท/สถานะบัญชีจาก Firestore
    `users/{uid}` และตรวจสอบ patient-level ผ่าน `exists()` บน `patientAssignments/{uid}_{patientId}`
    ด้วย Admin SDK — **เพิ่มการตรวจสอบ `decodedToken.email_verified` ในโมดูลเดียวกันในรอบ 2026-09-24**
    (decision area 19) **ไม่มี custom claims บทบาท/isActive ให้อ่านจาก token อีกต่อไป (decision area
    18) — ต้อง query Firestore `users/{uid}` โดยตรงเสมอ**
  - **Error code:** ไม่มีสิทธิ์ระดับบทบาท/บัญชีถูกระงับ → `functions.https.HttpsError('permission-denied', ...)`;
    ไม่มี auth token เลย → `functions.https.HttpsError('unauthenticated', ...)`; ไม่มี PatientAssignment
    เชื่อมโยงกับผู้ป่วยที่ระบุ → `functions.https.HttpsError('permission-denied', ...)`;
    `email_verified` เป็นเท็จ → `functions.https.HttpsError('permission-denied', ...)` (สำหรับ
    Operation 0 กรณีเดียวกันคือ Security Rules ปฏิเสธ query/read โดยอัตโนมัติ ไม่มี error code แบบ
    Callable Function เพราะไม่ใช่ Cloud Function)

## Operation ร่วม — บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)

รองรับ [[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Audit Logging \& Accountability]] ใน
architecture และ [[backlog#Non-Functional Requirements|NFR-06]] — เป็น internal operation ที่ Backend
Service เรียกอัตโนมัติทุกครั้งที่ "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ผ่านระดับรายผู้ป่วยสำเร็จ
(ไม่ใช่ operation ที่ Client เรียกตรง) ก่อนที่ Backend Service จะดึง/แก้ไขข้อมูลจริงจาก
[[architecture#ที่เก็บข้อมูลหลัก (Primary Data Store)|Primary Data Store]] เสมอ ตามลำดับใน
[[architecture#Data Flow Diagram — Journey หลัก|Data Flow Diagram ของ architecture]]

- **ผู้เรียกได้/บทบาท:** internal (เรียกจาก Backend Service เอง)
- **Input:**
  - รหัสผู้ใช้ (User.id) ที่ผ่านการตรวจสอบสิทธิ์แล้ว — จำเป็น
  - รหัสผู้ป่วย (Patient.id) ที่ถูกเข้าถึง — จำเป็น
  - การดำเนินการ (ค้นหา/ดูข้อมูลผู้ป่วย/แก้ไขข้อมูลตามคำขอสิทธิ/ลบข้อมูลตามคำขอสิทธิ/สกัดข้อมูลตามคำขอสิทธิ/
    คัดค้านการประมวลผลตามคำขอสิทธิ — ตามค่าที่กำหนดไว้ล่วงหน้าใน
    [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord.การดำเนินการ]]) — จำเป็น
  - รหัสคำขอสิทธิที่เกี่ยวข้อง (DataSubjectRequest.id) — ไม่บังคับ (ระบุเฉพาะเมื่อถูกเรียกจาก
    Operation 4)
- **Output:** ยืนยันบันทึกสำเร็จ พร้อม id ของ
  [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]] ที่สร้างขึ้น
- **กฎทางธุรกิจ:**
  - ต้องบันทึกก่อนที่ Backend Service จะดึง/แก้ไขข้อมูลจริงจาก Primary Data Store เสมอ (NFR-06)
  - ระเบียนที่สร้างแล้วต้องคงสภาพเดิมตลอดระยะเวลาที่ต้องเก็บรักษาไว้เพื่อการตรวจสอบ (append-only/
    immutable ในเชิงหลักการ) — เอกสารนี้จึงไม่มี operation สำหรับแก้ไข/ลบ AuditLogRecord รายบุคคล
    (การลบเมื่อพ้นระยะเวลาเก็บรักษาเป็นหน้าที่ของ Operation 6 เท่านั้น)
  - หากบันทึกไม่สำเร็จ Backend Service ต้องไม่ดำเนินการต่อไปดึง/แก้ไขข้อมูลจริง (fail-safe) เพื่อไม่ให้
    เกิดการเข้าถึงข้อมูลที่ไม่มีร่องรอย
- **กรณี error:**
  - บันทึกลง [[architecture#ที่เก็บบันทึกการเข้าถึง (Audit Log Store)|Audit Log Store]] ไม่สำเร็จ →
    ยกเลิก operation ที่เรียกใช้ (Operation 1, 2, 3 หรือ 4) และแจ้งข้อผิดพลาดแก่ผู้ใช้ ไม่ส่งข้อมูลผู้ป่วย
    กลับไปแม้ Access Control จะผ่านแล้วก็ตาม
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-06]],
  [[backlog#Non-Functional Requirements|NFR-08]],
  [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]]
- **Technical Binding (ตาม [[technology-stack#5. Audit Log Store — Cloud Firestore collection แยก เขียนผ่าน Cloud Functions เท่านั้น|decision area 5 ใน technology-stack]]):**
  เขียนเป็น shared helper module ภายในโค้ด Cloud Functions เรียกจากภายใน callable function ของ
  Operation 1-4 เอง (ไม่ใช่ operation แยกที่ Client เรียก) — เขียนระเบียนลง Firestore collection
  `auditLogRecords` ผ่าน **Firebase Admin SDK เท่านั้น** (bypass Security Rules) ก่อนดำเนินการ
  อ่าน/แก้ไขข้อมูลจริงภายใน callable function เดียวกันเสมอ (แนวทาง fail-safe — ถ้าการเขียนนี้ throw
  exception ให้ callable function ปล่อย error ต่อทันทีโดยไม่ทำ logic ที่เหลือ) — **Error code:**
  เขียนไม่สำเร็จ → `functions.https.HttpsError('internal', 'audit-log-write-failed')` ส่งกลับแทน
  operation ที่เรียกใช้ (Operation 1, 2, 3 หรือ 4) ทันที

## Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)

รองรับฟีเจอร์ที่ 5 ([[feature-list#5. รับประกันคุณภาพเชิงปฏิบัติการของระบบ (Performance, Availability, Clinical Safety, Session Security, Accessibility, Compatibility, Interoperability)|feature-list]])
เช่นเดียวกับที่ [[architecture#Cross-cutting: คุณภาพเชิงปฏิบัติการของระบบ (NFR-09–NFR-16)|architecture]]
ออกแบบไว้ว่า NFR-09–NFR-16 ไม่ต้องการ component ใหม่ — ในระดับ operation contract นี้ก็เช่นกัน **ไม่มี
operation ใหม่ถูกเพิ่มสำหรับฟีเจอร์ที่ 5** เพราะเป็นคุณสมบัติเชิงคุณภาพที่ผูกกับ operation ที่มีอยู่แล้ว
ทั้งหมด (Operation 0-6 และ Operation ร่วมทั้งสอง) สรุปผลกระทบต่อ operation แต่ละกลุ่มดังนี้:

- **Performance < 2 วินาที (NFR-09):** ครอบคลุมทุก operation ที่ Client เรียกโดยตรง (Operation 0-5)
  โดยเฉพาะ Operation 0 (ค้นหา/แสดงรายชื่อ), Operation 1 (ประวัติวินิจฉัย), Operation 2 (ผลตรวจ lab)
  และ Operation 3 (วิเคราะห์ความเสี่ยง) ซึ่งเป็น operation หลักที่ผู้ใช้รอผลระหว่างใช้งานจริง — แต่ละ
  operation ด้านล่างจึงระบุ composite index ที่ต้องมีไว้ล่วงหน้าใน Technical Binding ของตนเองแล้ว (ดู
  [[db-spec]] สำหรับรายละเอียด index แต่ละ entity) ตาม
  [[technology-stack#9. กลไกรองรับ Performance < 2 วินาที (NFR-09) — Firestore Composite Index เท่านั้น (ไม่มี caching layer เพิ่มเติม)|decision area 9 ใน technology-stack]]
  **ตัดสินใจแล้วว่าใช้ composite index เท่านั้นโดยเจตนาสำหรับ MVP นี้ ไม่มี caching layer เพิ่มเติม
  (ไม่ใช่ยังไม่ตัดสินใจ)** — trade-off: ทุก request ยังอ่าน Cloud Firestore ทุกครั้งแม้เป็นข้อมูลอ้างอิง
  คงที่ (เช่น `ComplicationRiskThreshold` ที่ Operation 3 อ่านทุกครั้งที่ประมวลผล) ถ้าผลทดสอบ
  performance จริงพบว่าไม่พอ ขั้นตอนถัดไปคือ in-memory caching ใน Cloud Functions ก่อนพิจารณา managed
  caching layer แยก (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)
- **Availability (NFR-10):** ไม่กระทบ operation contract โดยตรง (เป็นคุณสมบัติระดับ SLA ของ
  infrastructure ทั้งหมดที่ทุก operation รันอยู่บน — ดู
  [[architecture#ตาราง Mapping NFR ไปยัง Component|ตาราง Mapping NFR ใน architecture]])
- **Clinical Safety Validation (NFR-11):** กระทบเฉพาะ Operation 3 (`assessComplicationRisk`) ทางอ้อม —
  ข้อมูล [[db-spec#threshold มาตรฐานของโรคแทรกซ้อน (ComplicationRiskThreshold)|ComplicationRiskThreshold]]
  ที่ operation นี้อ่านมาเปรียบเทียบต้องผ่านการยืนยันจากแพทย์ผู้เชี่ยวชาญก่อน deploy เสมอ — เป็น
  **กระบวนการเชิงองค์กรก่อน deploy โค้ด ไม่ใช่ business rule ที่ operation ต้องตรวจสอบขณะรันจริง** (ตาม
  [[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|หัวข้อ Risk Rule Engine ใน architecture]]) จึง
  ไม่มีการเพิ่ม input/output/กฎทางธุรกิจใหม่ใน Operation 3 สำหรับข้อนี้
- **Session Timeout (NFR-12):** กระทบ Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (ดูหมายเหตุ
  ข้อ 4 ในหัวข้อนั้นด้านบน) — auto-logout เองเป็นหน้าที่ของ Client (ไม่มี operation ฝั่งนี้)
- **Accessibility (NFR-13):** กระทบ Operation 3 เฉพาะระดับการตีความ output — field
  [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding.ระดับความเสี่ยงที่ประเมินได้]]
  เป็นค่าข้อความที่กำหนดไว้ล่วงหน้าอยู่แล้ว (ไม่ใช่สีหรือรหัสตัวเลข) จึงมีข้อความกำกับพร้อมใช้งานให้ Client
  แสดงคู่กับสี/ไอคอนได้ทันทีตามที่ NFR-13 กำหนด โดยไม่ต้องเพิ่ม field ใหม่ — รายละเอียดการนำไปแสดงผล
  (icon/contrast) เป็นเรื่องของ [[DESIGN]] และ `detailed-design/`
- **Security Rules Verification (NFR-14):** ไม่กระทบ operation contract โดยตรง (เป็นข้อกำหนดด้าน
  testing ของกลไกจริงที่ Technical Binding แต่ละ operation ระบุไว้ — ดู
  [[db-spec#คุณสมบัติร่วม (Cross-cutting Property) — Security Rules Verification (NFR-14)|หัวข้อ
  Security Rules Verification ใน db-spec]] สำหรับรายการ collection/Security Rules ที่ต้องมี automated
  test ครอบคลุม)
- **Browser/Device Compatibility (NFR-15):** ไม่กระทบ operation contract (เป็นเรื่องของ Client
  implementation ล้วนๆ)
- **Interoperability — future (NFR-16, Won't have เฟสนี้):** ไม่กระทบ operation ใดในเอกสารนี้ขณะนี้ —
  เกี่ยวข้องเฉพาะเมื่อเชื่อมต่อ [[architecture#แหล่งข้อมูลคลินิกภายนอก (External Clinical Data Source เช่น HOSxP)|External Clinical Data Source]]
  จริงในอนาคต ซึ่งอยู่นอกขอบเขต MVP

## Cross-cutting: Authentication ที่ครอบคลุมทุก Operation หลัง Login (FR-07–FR-10, NFR-17, NFR-18)

รองรับฟีเจอร์ที่ 6 ([[feature-list#6. สมัครบัญชี เข้าสู่ระบบ และจัดการรหัสผ่านด้วยอีเมล (Authentication)|feature-list]])
ซึ่งเป็น **precondition ก่อน Operation 0-6 ทั้งหมด** ตามที่ [[architecture]] ระบุไว้ — สรุปผลกระทบต่อ
operation ที่มีอยู่แล้ว (ไม่มี operation ใดใน Operation 0-6 ต้องเพิ่ม input/output ใหม่สำหรับข้อนี้
เพราะ Authentication ควบคุมที่ "ก่อนจะได้ auth context ที่ถูกต้อง" ซึ่งเป็นคนละชั้นกับ Operation
ร่วม Access Control ที่ควบคุม "หลังมี auth context แล้วมีสิทธิ์เข้าถึงข้อมูลผู้ป่วยหรือไม่"):

- **Password Policy (NFR-17):** บังคับใช้ที่ Operation 8 (สมัครบัญชี) และ Operation 9 (ตั้งรหัสผ่าน
  ใหม่จากการรีเซ็ต) เท่านั้น — ไม่กระทบ Operation 0-7 อื่น
- **Account Enumeration Prevention (NFR-18):** บังคับใช้ที่ Operation 7 (เข้าสู่ระบบผิดพลาด),
  Operation 8 (สมัครด้วยอีเมลซ้ำ) และ Operation 9 (รีเซ็ตรหัสผ่านด้วยอีเมลที่ไม่มีในระบบ) — ทั้งสาม
  operation ต้องคืนข้อความ/พฤติกรรมที่สังเกตได้จากภายนอก (ข้อความ, error code, เวลาตอบสนอง) แบบ
  เดียวกันเสมอไม่ว่าอีเมลจะมีอยู่ในระบบหรือไม่ — **กลไกจริง (ตัดสินใจแล้วในรอบ 2026-09-24):** Operation
  8/9 คืนข้อความ generic จากโค้ด Cloud Function เอง (ดู Technical Binding ของแต่ละ operation) ส่วน
  Operation 7 (ไม่มี Cloud Function คั่นกลาง) พึ่ง **Firebase "Email Enumeration Protection"**
  ระดับโปรเจกต์ ตาม
  [[technology-stack#14. กลไกป้องกัน Account Enumeration (NFR-18, ฟีเจอร์ที่ 6) — Firebase Email Enumeration Protection|decision area 14 ใน technology-stack]]
  — **ยังไม่ปิด timing side-channel** (ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว ดูหัวข้อความเสี่ยงใน
  [[technology-stack#ความเสี่ยงเพิ่มเติม: NFR-18 Account Enumeration — Timing Side-channel ยังไม่ปิด (ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้ว)|technology-stack]]) — ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร
  สำหรับ fixed minimum delay ที่ควรพิจารณาก่อน production จริง
- **ผลกระทบต่อ Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" (Access Control):** ดูหมายเหตุที่
  แทรกไว้ในกฎข้อ 1 (role-level) ของ operation นั้นด้านบนแล้ว — บัญชีที่ยังไม่ผ่าน Operation 8 +
  การอนุมัติของผู้ดูแลระบบ จะไม่ผ่านการตรวจสอบระดับบทบาทโดยอัตโนมัติ
- **สถานะยืนยันอีเมล (`emailVerified` — FR-09) — แก้ไข 2026-09-24 (เดิมเป็นช่องว่าง ปัจจุบันปิดแล้ว
  บางส่วน):** การตรวจสอบและบล็อกการเข้าถึงฟีเจอร์อื่นเมื่อยังไม่ยืนยันอีเมลที่ชั้น UX ยังคงเป็นหน้าที่
  ของ **Client** (อ่านค่า `emailVerified` จาก Firebase ID token โดยตรง) เช่นเดิม **แต่ตั้งแต่รอบ
  2026-09-24 Operation ร่วม Access Control ในเอกสารนี้ตรวจสอบ `email_verified` ซ้ำที่ฝั่งเซิร์ฟเวอร์
  ด้วยแล้ว** (ดูข้อ 2.5 ในกฎทางธุรกิจของ operation ร่วมนั้นด้านบน) ตาม
  [[technology-stack#19. การตรวจสอบ `emailVerified` ซ้ำฝั่ง Backend (FR-09, ฟีเจอร์ที่ 6) — ตรวจทั้ง Cloud Functions และ Security Rules|decision area 19 ใน technology-stack]]
  ปิดช่องว่างที่ client ถูกดัดแปลง/บั๊กข้ามการตรวจสอบนี้แล้วเรียก Operation 0-6 ตรง — **ความเสี่ยงที่ยัง
  เหลืออยู่:** Operation 7 (เข้าสู่ระบบ) เองยังไม่มีจุดตรวจ `emailVerified`/`isActive` ที่ระดับการออก
  token (ไม่ใช้ Auth Blocking Functions ตาม
  [[technology-stack#16. Auth Blocking Functions (ฟีเจอร์ที่ 6) — ไม่ใช้|decision area 16]]) — token
  ที่ `emailVerified=false`/`isActive=false` ยังคงถูกออกให้ได้ตามปกติ เพียงแต่ถูกปฏิเสธที่ Operation
  ร่วม Access Control ก่อนเข้าถึงข้อมูลผู้ป่วยจริงเสมอ

## Operation 7 — เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน

รองรับ [[backlog#สูง (MVP)|FR-07]] — **ใหม่จากฟีเจอร์ที่ 6** เป็นขั้นตอนแรกสุดก่อน Operation 0-6
ทั้งหมด แต่**ไม่ผ่าน Backend Service** (ต่างจาก Operation 1-6 ทุกตัว) — Client เรียก
[[architecture#บริการยืนยันตัวตน (Authentication Service)|Authentication Service]] ตรง ตามที่ผู้ใช้
ยืนยันแล้วผ่าน `NEEDS_USER_INPUT` ระหว่างรอบ sync architecture (ไม่มีข้อกำหนด NFR-17/NFR-18 ใดบังคับ
ให้ต้องผ่าน Backend Service สำหรับ operation นี้ เพราะไม่มีการสร้าง/แก้ไขข้อมูลที่ต้อง fail-safe)

- **ผู้เรียกได้/บทบาท:** ผู้สมัครบัญชี (ทุกคนที่มีบัญชีอีเมล/รหัสผ่านแล้ว ไม่ว่าจะผ่านการอนุมัติหรือไม่)
- **Input:**
  - อีเมล (เทียบกับ [[db-spec#ผู้ใช้ (User)|User.อีเมล]]) — จำเป็น
  - รหัสผ่าน — จำเป็น
- **Output:** ข้อมูลยืนยันตัวตน (Firebase ID token) พร้อมค่า `email_verified` ในตัว token เอง — **ไม่มี
  custom claims บทบาท/สถานะการใช้งานบัญชีแนบมากับ token นี้อีกต่อไป** (แก้ไข 2026-09-24 ตาม
  [[technology-stack#18. การ Sync role/isActive ระหว่าง Firestore กับ Custom Claims (ฟีเจอร์ที่ 6) — ไม่ Sync, Firestore เป็น Source of Truth เดียว|decision area 18 ใน technology-stack]]) — `บทบาท`/
  `สถานะการใช้งานบัญชี` ต้อง query จาก [[db-spec#ผู้ใช้ (User)|Firestore `users/{uid}`]] แยกต่างหากเสมอ
  ที่ Operation ร่วม Access Control (ทั้ง Security Rules ของ Operation 0 และ Cloud Functions ของ
  Operation 1-6) ใช้ token นี้เป็น auth context สำหรับ Operation 0-6 ต่อไป
- **กฎทางธุรกิจ:**
  - ตรวจสอบเฉพาะว่าอีเมล/รหัสผ่านที่กรอกตรงกับที่จัดเก็บไว้หรือไม่ (ดำเนินการโดย Authentication
    Service เอง) — **ไม่ตรวจสอบ `บทบาท`/`สถานะการใช้งานบัญชี`/`สถานะการยืนยันอีเมล` ใน operation นี้**
    (การตรวจสอบเหล่านั้นเกิดขึ้นแยกต่างหากที่ Operation ร่วม Access Control และที่ Client ตามลำดับ —
    ดู [[#Cross-cutting: Authentication ที่ครอบคลุมทุก Operation หลัง Login (FR-07–FR-10, NFR-17, NFR-18)|Cross-cutting Authentication ด้านบน]])
  - เข้าสู่ระบบสำเร็จไม่ได้แปลว่าเข้าถึงข้อมูลผู้ป่วยได้ทันที ยังต้องผ่าน Operation ร่วม Access Control
    และ FR-09 (ยืนยันอีเมล) ต่อไปเสมอ
- **กรณี error:**
  - อีเมล/รหัสผ่านไม่ถูกต้อง (ไม่ว่าจะเป็นเพราะไม่มีบัญชีอีเมลนี้ หรือรหัสผ่านผิด) →
    แจ้งข้อความรวมเดียวกันเสมอ **"อีเมลหรือรหัสผ่านไม่ถูกต้อง"** ไม่แยกแยะว่าอีเมลมีอยู่ในระบบหรือไม่
    (NFR-18)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-07]], [[backlog#Non-Functional Requirements|NFR-18]],
  [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** **ไม่ใช่ Cloud Function** — Client เรียก **Firebase Authentication SDK
  ตรง** (`signInWithEmailAndPassword`) ตาม [[technology-stack#7. Authentication/Authorization — Firebase Authentication (ไม่ใช้ Custom Claims เก็บบทบาท — แก้ไขในรอบสาม 2026-09-24)|decision area 7 ใน technology-stack]] — token ที่ได้รับกลับมา**ไม่มี custom claims บทบาท/isActive**
  (decision area 18); Client ยังคงต้องอ่าน `email_verified` จาก token นี้เพื่อบล็อกการใช้งานฟีเจอร์
  อื่นที่ชั้น UX (FR-09) ส่วนการตรวจสอบ `role`/`isActive`/`email_verified` ที่บังคับใช้จริงเกิดขึ้นที่
  Operation ร่วม Access Control (ทั้ง Security Rules และ Cloud Functions) แยกต่างหากเสมอ
  — **Error/สถานะ:** ไม่มี error code แบบ Callable Function — Firebase Authentication SDK คืน error
  code มาตรฐานของตนเอง (เช่น `auth/invalid-credential`) ซึ่ง Client **ต้อง**แปลงเป็นข้อความรวม
  เดียวกันเสมอที่ชั้น UI โดยไม่แสดง error code ดิบให้ผู้ใช้เห็น (NFR-18) — กลไก suppress ที่ระดับ
  error code/เวลาตอบสนองอย่างสมบูรณ์ยังไม่ตัดสินใจ (ดู "ประเด็นรอตัดสินใจ")

## Operation 8 — สมัครบัญชีผู้ใช้งานด้วยตนเอง (Self Sign-up)

รองรับ [[backlog#สูง (MVP)|FR-08]] (สมัครบัญชี), [[backlog#สูง (MVP)|FR-09]] (ส่งอีเมลยืนยันตัวตน),
[[backlog#Non-Functional Requirements|NFR-17]] (password policy) และ
[[backlog#Non-Functional Requirements|NFR-18]] (account enumeration prevention) — **ใหม่จากฟีเจอร์
ที่ 6** ต้องผ่าน Backend Service เป็นตัวกลางเสมอ (ยืนยันโดยผู้ใช้แล้วผ่าน `NEEDS_USER_INPUT` — ดู
[[architecture#หมายเหตุการอัปเดตล่าสุด (2026-09-23, รอบ sync ที่สี่)|หมายเหตุการอัปเดตล่าสุดต้นเอกสาร architecture]])
เพื่อให้ Backend Service เป็นจุดเดียวที่บังคับ password policy และคืนข้อความ generic ได้แน่นอน

- **ผู้เรียกได้/บทบาท:** ผู้สมัครบัญชี (บุคคลทั่วไปที่ยังไม่มีบัญชี หรือคิดว่ายังไม่มีบัญชี)
- **Input:**
  - อีเมล (จะกลายเป็น [[db-spec#ผู้ใช้ (User)|User.อีเมล]]) — จำเป็น
  - รหัสผ่าน (จะกลายเป็น [[db-spec#ผู้ใช้ (User)|User.รหัสผ่านที่จัดเก็บ]] หลัง hash) — จำเป็น
- **Output:** ข้อความ generic เดียวกันเสมอ (เช่น "หากสมัครสำเร็จ ระบบจะส่งอีเมลยืนยันตัวตนไปยังอีเมล
  ที่กรอก") ไม่ว่าอีเมลที่กรอกจะซ้ำกับบัญชีเดิมหรือไม่ก็ตาม (NFR-18) — **ไม่คืนค่า id ของ User ที่สร้าง
  หรือสถานะสำเร็จ/ล้มเหลวที่แยกแยะได้จากภายนอก**
- **กฎทางธุรกิจ:**
  - ตรวจสอบรหัสผ่านตามนโยบายขั้นต่ำก่อนเสมอ (ความยาว ≥ 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลขอย่างน้อย
    อย่างละ 1 ตัว — NFR-17) — ถ้าไม่ผ่าน ปฏิเสธและแจ้งเตือนทันที (กรณีนี้**ไม่ใช่**ข้อมูลที่ต้อง
    generic เพราะไม่เกี่ยวกับว่าอีเมลมีบัญชีอยู่แล้วหรือไม่)
  - เมื่อรหัสผ่านผ่านนโยบายแล้ว สร้างบัญชีใหม่ที่ Authentication Service ผ่าน Admin SDK
  - เมื่อสร้างบัญชี Authentication สำเร็จ ต้องสร้างเอกสาร [[db-spec#ผู้ใช้ (User)|users/{uid}]] ใหม่
    ทันทีในขั้นตอนเดียวกันด้วย `สถานะการใช้งานบัญชี = เท็จ` และ `บทบาท` ไม่มีค่า (ยืนยันแล้วโดยผู้ใช้ —
    Client ไม่มีสิทธิ์เขียนเอกสารนี้เอง)
  - สั่งส่งอีเมลยืนยันตัวตนผ่าน Authentication Service ทันทีหลังสร้างบัญชีสำเร็จ (FR-09)
  - **ไม่ว่าอีเมลที่กรอกจะซ้ำกับบัญชีเดิมหรือไม่ก็ตาม ต้องคืนข้อความ generic เดียวกันเสมอ** (NFR-18) —
    กรณีอีเมลซ้ำ **ไม่สร้างบัญชีใหม่ซ้ำ และไม่ส่งอีเมลยืนยันตัวตนซ้ำ** แต่ผลลัพธ์ที่ผู้ใช้เห็นต้อง
    เหมือนกับกรณีสมัครสำเร็จทุกประการ
- **กรณี error:**
  - รหัสผ่านไม่ผ่านนโยบายขั้นต่ำ → แจ้งเตือนให้แก้ไขรหัสผ่านทันที (NFR-17 — ไม่ใช่กรณีที่ต้อง generic)
  - อีเมลรูปแบบไม่ถูกต้อง → แจ้งว่า input ไม่ถูกต้อง
  - อีเมลมีบัญชีอยู่แล้ว → **ไม่แจ้ง error ที่แยกแยะได้** คืนข้อความ generic เดียวกับกรณีสำเร็จ (NFR-18)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-08]], [[backlog#สูง (MVP)|FR-09]],
  [[backlog#Non-Functional Requirements|NFR-17]], [[backlog#Non-Functional Requirements|NFR-18]],
  [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `signUpUser`** (กลุ่มงาน Account Onboarding & Authentication Gateway ตาม [[architecture]]) —
  ตรวจสอบ password policy ด้วย **regex ในโค้ดเดียวกัน** (ความยาว ≥ 8 ตัวอักษร มีตัวอักษร+ตัวเลข ตาม
  [[technology-stack#13. กลไก Validate Password Policy ฝั่งเซิร์ฟเวอร์ (NFR-17, ฟีเจอร์ที่ 6) — Regex ใน Cloud Function + Identity Platform เป็น Backstop|decision area 13 ใน technology-stack]]),
  เรียก Firebase Admin SDK `createUser` สร้างบัญชี Authentication, เขียน `users/{uid}` ผ่าน Admin SDK
  ในฟังก์ชันเดียวกัน (**rollback ด้วย Admin SDK `deleteUser` ถ้าเขียน Firestore ล้มเหลว** ตาม
  [[technology-stack#17. กลไกสร้าง `users/{uid}` อัตโนมัติ (FR-08, ฟีเจอร์ที่ 6) — ภายใน Cloud Function `signUpUser` เดียวกัน|decision area 17]]),
  เรียก Admin SDK สั่งส่งอีเมลยืนยันตัวตนด้วย **template เริ่มต้นของ Firebase Authentication ปรับ
  locale ไทย + ชื่อผู้ส่งผ่าน Console** ตาม
  [[technology-stack#15. เทมเพลตอีเมลยืนยันตัวตน/รีเซ็ตรหัสผ่าน (FR-09/FR-10, ฟีเจอร์ที่ 6) — Template เริ่มต้นของ Firebase + ปรับภาษาไทยผ่าน Console|decision area 15]]
  — **Error code:** รหัสผ่านไม่ผ่านนโยบาย → `functions.https.HttpsError('invalid-argument', 'weak-password')`;
  รูปแบบอีเมลไม่ถูกต้อง → `invalid-argument`; เขียน Firestore ล้มเหลวหลัง rollback →
  `internal`; **กรณีอีเมลซ้ำต้องคืน response สำเร็จแบบเดียวกับกรณีสร้างบัญชีสำเร็จเสมอ ห้ามคืน error
  `auth/email-already-in-use` ให้ Client เห็นเด็ดขาด** (NFR-18 — บังคับใช้ด้วย Firebase "Email
  Enumeration Protection" ระดับโปรเจกต์ตาม
  [[technology-stack#14. กลไกป้องกัน Account Enumeration (NFR-18, ฟีเจอร์ที่ 6) — Firebase Email Enumeration Protection|decision area 14]]
  ร่วมกับ generic response ที่คืนจากโค้ดนี้เอง) — **ยังไม่เพิ่ม fixed minimum delay** เพื่อปิด timing
  side-channel ในรอบนี้โดยเจตนา (ผู้ใช้รับทราบความเสี่ยงแล้ว ดู "ประเด็นรอตัดสินใจ")

## Operation 9 — ขอรีเซ็ตรหัสผ่านทางอีเมล (Forgot Password)

รองรับ [[backlog#สูง (MVP)|FR-10]], [[backlog#Non-Functional Requirements|NFR-17]] (รหัสผ่านใหม่ต้อง
เป็นไปตามนโยบาย), [[backlog#Non-Functional Requirements|NFR-18]] — **ใหม่จากฟีเจอร์ที่ 6** ต้องผ่าน
Backend Service เป็นตัวกลางเสมอเช่นเดียวกับ Operation 8 (ยืนยันโดยผู้ใช้แล้ว)

- **ผู้เรียกได้/บทบาท:** ผู้สมัครบัญชี (ทุกคนที่คิดว่าตนมีบัญชีอยู่ในระบบ)
- **Input:**
  - อีเมล (เทียบกับ [[db-spec#ผู้ใช้ (User)|User.อีเมล]]) — จำเป็น
- **Output:** ข้อความ generic เดียวกันเสมอ: **"หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่านทาง
  อีเมล"** ไม่ว่าอีเมลที่กรอกจะมีบัญชีอยู่จริงหรือไม่ (NFR-18)
- **กฎทางธุรกิจ:**
  - ตรวจสอบว่ามีบัญชีที่ใช้อีเมลนี้อยู่จริงหรือไม่**ภายในขอบเขตของ operation นี้เท่านั้น** (ไม่ส่งต่อ
    ผลการตรวจสอบนี้ออกไปให้ Client ทราบไม่ว่ากรณีใด)
  - สั่ง Authentication Service ส่งอีเมลลิงก์รีเซ็ตรหัสผ่าน **เฉพาะเมื่อพบบัญชีจริง** — ถ้าไม่พบบัญชี
    ไม่ทำการใดๆ เพิ่มเติม
  - คืนข้อความ generic เดียวกันให้ Client เสมอไม่ว่าผลลัพธ์การตรวจสอบข้างต้นจะเป็นอย่างไร (NFR-18)
  - เมื่อผู้ใช้ตั้งรหัสผ่านใหม่ผ่านลิงก์ที่ได้รับ รหัสผ่านใหม่ต้องเป็นไปตามนโยบายขั้นต่ำเช่นเดียวกับ
    Operation 8 (NFR-17)
- **กรณี error:**
  - อีเมลรูปแบบไม่ถูกต้อง → แจ้งว่า input ไม่ถูกต้อง (กรณีนี้ไม่เกี่ยวกับ NFR-18 เพราะเป็นการตรวจสอบ
    รูปแบบ ไม่ใช่การเปิดเผยว่าอีเมลมีบัญชีอยู่หรือไม่)
  - ไม่พบบัญชีที่ใช้อีเมลนี้ → **ไม่แจ้ง error ที่แยกแยะได้** คืนข้อความ generic เดียวกับกรณีพบบัญชี
    (NFR-18)
  - รหัสผ่านใหม่ที่ตั้ง (หลังคลิกลิงก์) ไม่ผ่านนโยบายขั้นต่ำ → แจ้งเตือนให้แก้ไขทันที (NFR-17 — ไม่ใช่
    กรณีที่ต้อง generic)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-10]], [[backlog#Non-Functional Requirements|NFR-17]],
  [[backlog#Non-Functional Requirements|NFR-18]], [[db-spec#ผู้ใช้ (User)|User]]
- **Technical Binding (Operation 9a — ขอลิงก์รีเซ็ต):** Cloud Functions (2nd gen, Node.js +
  TypeScript) — **HTTPS Callable Function ชื่อ `requestPasswordReset`** (กลุ่มงาน Account Onboarding &
  Authentication Gateway) — ตรวจสอบว่ามีบัญชีอยู่จริงผ่าน Firebase Admin SDK แล้วเรียก Admin SDK สั่ง
  ส่งอีเมลลิงก์รีเซ็ตเฉพาะเมื่อพบบัญชี ด้วย **template เริ่มต้นของ Firebase Authentication ปรับ locale
  ไทย + ชื่อผู้ส่งผ่าน Console** ตาม
  [[technology-stack#15. เทมเพลตอีเมลยืนยันตัวตน/รีเซ็ตรหัสผ่าน (FR-09/FR-10, ฟีเจอร์ที่ 6) — Template เริ่มต้นของ Firebase + ปรับภาษาไทยผ่าน Console|decision area 15]]
  — **Error code:** รูปแบบอีเมลไม่ถูกต้อง → `invalid-argument`; **ไม่พบบัญชีต้องคืน response สำเร็จ
  แบบเดียวกับกรณีพบบัญชีเสมอ ห้ามคืน error ที่แยกแยะได้** (NFR-18)
- **Technical Binding (Operation 9b — ตั้งรหัสผ่านใหม่จริงหลังคลิกลิงก์):** **ไม่ใช่ Cloud Function** —
  Client เรียก **Firebase Authentication SDK ตรง** (`confirmPasswordReset`) ตามที่
  [[20260923-01-user-authentication-email-password#Sequence Diagram — ขอรีเซ็ตรหัสผ่านทางอีเมล (Operation 9, FR-10)|
  sequence diagram ของ detailed-design ระบุไว้]] — **ไม่มี Cloud Function คั่นกลาง** จึงไม่มี regex
  ตรวจ password policy ในโค้ดของระบบเอง บังคับใช้ policy ที่จุดนี้ผ่าน **Google Cloud Identity
  Platform password policy** ที่เปิดใช้เป็น backstop ฝั่งเซิร์ฟเวอร์แทน ตาม
  [[technology-stack#13. กลไก Validate Password Policy ฝั่งเซิร์ฟเวอร์ (NFR-17, ฟีเจอร์ที่ 6) — Regex ใน Cloud Function + Identity Platform เป็น Backstop|decision area 13 ใน technology-stack]]
  — **Error/สถานะ:** ไม่มี error code แบบ Callable Function — Firebase Authentication SDK คืน error
  code มาตรฐานของตนเอง (เช่น รหัสผ่านไม่ผ่านนโยบายของ Identity Platform) ซึ่ง Client ต้องแปลงเป็น
  ข้อความแจ้งเตือนที่ชั้น UI (NFR-17 — ไม่ใช่กรณีที่ต้อง generic เพราะไม่เกี่ยวกับ NFR-18) — **ยังไม่เพิ่ม
  fixed minimum delay** เพื่อปิด timing side-channel ของทั้ง Operation 9a/9b ในรอบนี้โดยเจตนา (ผู้ใช้
  รับทราบความเสี่ยงแล้ว ดู "ประเด็นรอตัดสินใจ")

## Operation 0 — ค้นหา/แสดงรายชื่อผู้ป่วยในความดูแล (ค้นหาเฉพาะรายด้วยเลข HN)

รองรับ [[backlog#สูง (MVP)|FR-05]] และ [[backlog#สูง (MVP)|FR-06]] — เป็นขั้นตอนแรกสุดของ journey
เสมอ ก่อน Operation 1, 2, 3 ด้านล่าง ตามลำดับใน
[[architecture#Data Flow Diagram — Journey หลัก|Data Flow Diagram ของ architecture]] **การค้นหาเฉพาะราย
รองรับเฉพาะเลข HN เท่านั้น ไม่รองรับการค้นหาด้วยชื่อ-นามสกุลอีกต่อไป** (FR-06 ยืนยันแล้ว 2026-09-21
แทนที่สมมติฐานเดิมที่เคยรองรับคำค้นอิสระ)

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD
- **Input:**
  - เลข HN (เทียบกับ Patient.เลขประจำตัวผู้ป่วย) — ไม่บังคับ (ถ้าไม่ระบุ คืนรายชื่อผู้ป่วยทั้งหมดที่อยู่
    ในความดูแลตาม FR-05; ถ้าระบุ ต้องเป็นค่าที่ผู้ใช้กรอกแล้ว "กดค้นหา" เท่านั้น — client ไม่ตรวจสอบ
    รูปแบบ/ความยาวเองแบบ real-time ระหว่างพิมพ์ Backend Service เป็นผู้ตรวจสอบรูปแบบหลังเรียก
    operation นี้เท่านั้น ตาม FR-06)
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ Patient ที่อยู่ในความดูแลของผู้ใช้ที่ร้องขอเท่านั้น แต่ละรายการประกอบด้วย: id,
  เลขประจำตัวผู้ป่วย, ชื่อ-นามสกุล (ดู
  [[db-spec#ผู้ป่วย (Patient)|Patient ใน db-spec]])
- **กฎทางธุรกิจ:**
  - ต้องผ่านการตรวจสอบสิทธิ์ระดับบทบาทของ "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02)
    (ขั้นตอนนี้ยังไม่มีรหัสผู้ป่วยเฉพาะเจาะจง จึงไม่มีการตรวจสอบระดับรายผู้ป่วยในขั้นตอนนี้)
  - แสดงเฉพาะผู้ป่วยที่มีระเบียน
    [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|PatientAssignment]] เชื่อมโยงกับผู้ใช้
    ที่ร้องขอเท่านั้น ไม่ใช่ผู้ป่วยทั้งหมดตามแผนก/หน่วยงานที่สังกัด (FR-05, NFR-02)
  - ถ้าระบุเลข HN ต้องตรวจสอบก่อนว่าเป็นรูปแบบตัวเลขล้วน (numeric เท่านั้น ไม่มีตัวอักษร) ความยาว
    ครบ 7 หลักหรือไม่ — การตรวจสอบนี้เกิดขึ้น**หลัง operation นี้ถูกเรียกแล้วเท่านั้น (คือหลังผู้ใช้กด
    ค้นหา) ไม่ใช่การตรวจสอบฝั่ง client แบบ real-time** (FR-06):
    1. ถ้าไม่ครบรูปแบบตัวเลขล้วน 7 หลัก → หยุดทันที ไม่ค้นหาต่อ และคืน error "HN ไม่ครบ 7 หลัก" (ดู
       กรณี error ด้านล่าง)
    2. ถ้าครบรูปแบบแล้ว จึงค้นหาแบบ**ตรงกันทั้งหมด (exact match)** กับ Patient.เลขประจำตัวผู้ป่วย เฉพาะ
       ภายในกลุ่มผู้ป่วยที่มีระเบียน PatientAssignment เชื่อมโยงกับผู้ใช้ที่ร้องขอเท่านั้น (ไม่ใช่การ
       ค้นหาบางส่วน/partial match แบบคำค้นอิสระเดิม)
  - ผลลัพธ์ใช้เป็น input ให้ผู้ใช้เลือกผู้ป่วยรายบุคคลก่อนเรียก Operation 1, 2, 3 ต่อ (FR-05 เป็น
    precondition ของทั้งสาม operation)
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึงระดับบทบาท → ปฏิเสธการเข้าถึง (NFR-02)
  - ระบุเลข HN แต่ไม่ครบรูปแบบตัวเลขล้วน 7 หลัก → แจ้งเตือน "HN ไม่ครบ 7 หลัก" ให้ผู้ใช้กรอกค้นหาใหม่ได้
    ทันที โดยไม่บล็อกการเรียกดูรายชื่อผู้ป่วยทั้งหมด (ไม่ระบุ HN) (FR-06)
  - ระบุเลข HN ครบ 7 หลักแล้ว แต่ค้นหาไม่พบผู้ป่วยที่ตรงกัน (รวมถึงกรณีมีผู้ป่วยที่มี HN นี้จริงแต่ไม่ได้
    อยู่ในความดูแลของผู้ใช้งานคนนี้) → แจ้งเตือน "ไม่พบผู้ป่วย" ให้ผู้ใช้กรอกค้นหาใหม่ได้ทันที
    โดยไม่บล็อกการเรียกดูรายชื่อผู้ป่วยทั้งหมด (FR-06)
  - ไม่มีผู้ป่วยรายใดอยู่ในความดูแลของผู้ใช้ (กรณีไม่ระบุ HN) → คืนรายการว่าง (ไม่ถือเป็น error)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-05]], [[backlog#สูง (MVP)|FR-06]],
  [[backlog#Non-Functional Requirements|NFR-02]],
  [[db-spec#ผู้ป่วย (Patient)|Patient]],
  [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|PatientAssignment]]
- **Technical Binding (ตาม [[technology-stack#3. สถาปัตยกรรม Backend Service — Firebase-native (ไม่มี Backend Service แยกแบบดั้งเดิม)|decision area 3 ใน technology-stack]]):**
  **ไม่ใช่ Cloud Function** — Client เรียก **Firestore SDK query ตรง** บน collection
  `patientAssignments` (ดู [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|Firestore
  Technical Binding ของ PatientAssignment ใน db-spec]]) กรองด้วย Firestore Security Rules:
  - **ไม่ระบุ HN (แสดงรายชื่อทั้งหมด):**
    `query(collection(db,'patientAssignments'), where('userId','==',uid), orderBy('patientFullName'))`
    ใช้ composite index `(userId ASC, patientFullName ASC)`
  - **ระบุ HN (หลังกดค้นหาและผ่านการตรวจสอบรูปแบบ 7 หลักที่ฝั่ง Client แล้ว — ดูหมายเหตุด้านล่าง):**
    `query(collection(db,'patientAssignments'), where('userId','==',uid), where('patientHn','==',enteredHn))`
    ใช้ composite index `(userId ASC, patientHn ASC)`
  - **หมายเหตุสำคัญเรื่องตำแหน่งของการตรวจสอบรูปแบบ HN 7 หลัก:** เนื่องจาก Operation 0 ไม่มี Cloud
    Function เป็นตัวกลาง (ตามที่ตัดสินใจใน decision area 3) การตรวจสอบ "ครบรูปแบบตัวเลขล้วน 7 หลัก
    หรือไม่" ซึ่งเดิมเอกสารนี้ระบุว่าเป็นหน้าที่ของ Backend Service **ในทางเทคนิคต้องย้ายไปอยู่ในโค้ด
    Client (React + TypeScript) ทันทีหลังผู้ใช้กดปุ่มค้นหา** (ก่อนยิง Firestore query) แทน — ยังคง
    หลักการเดิมว่า**ต้องตรวจสอบหลังกดค้นหาแล้วเท่านั้น ไม่ใช่ real-time ระหว่างพิมพ์** (FR-06) เพียง
    แต่ผู้ดำเนินการตรวจสอบจริงเปลี่ยนจาก "Backend Service" เป็น "Client" เนื่องจากไม่มี server-side
    logic ให้ตรวจสอบแทนในเส้นทางนี้ — Firestore query แบบ exact-match ไม่มีกลไกปฏิเสธ input รูปแบบ
    ผิดในตัวเอง (จะคืน "ไม่พบผลลัพธ์" เฉยๆ) จึงยังจำเป็นต้องมี validation logic ฝั่ง Client ก่อนยิง
    query เสมอเพื่อแยกแยะข้อความแจ้งเตือนสองแบบ ("HN ไม่ครบ 7 หลัก" กับ "ไม่พบผู้ป่วย") ตามที่ FR-06
    กำหนด
  - **Firestore Security Rules ที่บังคับใช้จริง:** ดูกฎเต็มที่
    [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|Firestore Technical Binding ของ
    PatientAssignment ใน db-spec]]
  - **Error/สถานะ:** ไม่มี error code แบบ Callable Function (ไม่ใช่ Cloud Function) — "ไม่มีสิทธิ์
    เข้าถึงระดับบทบาท" คือ Firestore query ถูก Security Rules ปฏิเสธ (client ได้รับ
    `permission-denied` จาก Firestore SDK เอง ไม่ใช่ custom error code); "HN ไม่ครบ 7 หลัก" และ
    "ไม่พบผู้ป่วย" ทั้งสองกรณีเป็น client-side logic (ไม่ใช่ error จาก server) ตามที่อธิบายข้างต้น

## Operation 1 — ดึงประวัติการวินิจฉัยโรค NCD ของผู้ป่วย

รองรับ [[backlog#สูง (MVP)|FR-01]]

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ NcdDiagnosis ของผู้ป่วยรายนั้น เรียงตาม "วันที่วินิจฉัย" (จากใหม่ไปเก่า หรือ
  เก่าไปใหม่ตามช่วงเวลา) แต่ละรายการประกอบด้วย: id, รหัส ICD-10, กลุ่มโรคหลัก, วันที่วินิจฉัย,
  บันทึกเพิ่มเติมจากแพทย์ (ถ้ามี), แหล่งข้อมูลต้นทาง (ดู [[db-spec#ประวัติการวินิจฉัยโรค NCD (NcdDiagnosis)|NcdDiagnosis ใน db-spec]])
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02)
  - แสดงเฉพาะการวินิจฉัยที่ กลุ่มโรคหลัก อยู่ในขอบเขต: เบาหวาน (E10–E14), ความดันโลหิตสูง
    (I10–I14), ถุงลมโป่งพอง (J44) ตาม
    [[20260917-01-patient-ncd-history-lab-complication-risk#ขอบเขต|ขอบเขตของ spec]]
  - ข้อมูลอ้างอิงจากแหล่งข้อมูล HOSxP หรือข้อมูลจำลองระหว่างพัฒนา/ทดสอบ (NFR-01)
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง หรือผู้ป่วยรายนี้ไม่ได้อยู่ในความดูแลของผู้ใช้งานคนนี้ตาม PatientAssignment) → ปฏิเสธการเข้าถึง (NFR-02, FR-05) พร้อมข้อความแจ้งผู้ใช้ตาม [[architecture]]
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ไม่พบประวัติการวินิจฉัยของผู้ป่วยรายนี้เลย → คืนรายการว่าง (ไม่ถือเป็น error)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-01]], [[backlog#Non-Functional Requirements|NFR-01]],
  [[backlog#Non-Functional Requirements|NFR-02]], [[db-spec#ประวัติการวินิจฉัยโรค NCD (NcdDiagnosis)|NcdDiagnosis]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `getNcdDiagnoses`** — อ่าน collection `ncdDiagnoses` ผ่าน Firebase Admin SDK ด้วย
  composite index `(patientId ASC, diagnosedAt DESC)` (ดู
  [[db-spec#ประวัติการวินิจฉัยโรค NCD (NcdDiagnosis)|Firestore Technical Binding ใน db-spec]])
  หลังผ่าน Access Control + Audit Logging (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง
  → `permission-denied`; ไม่พบผู้ป่วย → `not-found`; บันทึก Audit Log ไม่สำเร็จ → `internal`

## Operation 2 — ดึงผลตรวจ lab ย้อนหลังของผู้ป่วย

รองรับ [[backlog#สูง (MVP)|FR-02]]

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น
  - ช่วงเวลาที่ต้องการดูย้อนหลัง (วันที่เริ่มต้น/สิ้นสุด) — ไม่บังคับ (ถ้าไม่ระบุ คืนทั้งหมดที่มี)
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ LabResult ของผู้ป่วยรายนั้น เรียงตาม "วันที่ตรวจ" เพื่อให้เห็นแนวโน้ม
  แต่ละรายการประกอบด้วย: id, ชนิดการตรวจ, ค่าผลตรวจ, หน่วยของค่าผลตรวจ, วันที่ตรวจ, แหล่งข้อมูล
  ต้นทาง (ดู [[db-spec#ผลตรวจ lab (LabResult)|LabResult ใน db-spec]])
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02)
  - แสดงเฉพาะชนิดการตรวจ lab มาตรฐานที่เกี่ยวข้องกับกลุ่มโรคหลักและโรคแทรกซ้อนในขอบเขต (เช่น
    HbA1c, eGFR, LDL, ความดันโลหิต)
  - ข้อมูลอ้างอิงจากแหล่งข้อมูล HOSxP หรือข้อมูลจำลองระหว่างพัฒนา/ทดสอบ (NFR-01)
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง หรือผู้ป่วยรายนี้ไม่ได้อยู่ในความดูแลของผู้ใช้งานคนนี้ตาม PatientAssignment) → ปฏิเสธการเข้าถึง (NFR-02, FR-05)
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ช่วงเวลาที่ระบุไม่ถูกต้อง (เช่น วันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด) → แจ้งว่า input ไม่ถูกต้อง
  - ไม่พบผลตรวจ lab ในช่วงเวลาที่ระบุ → คืนรายการว่าง (ไม่ถือเป็น error)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-02]], [[backlog#Non-Functional Requirements|NFR-01]],
  [[backlog#Non-Functional Requirements|NFR-02]], [[db-spec#ผลตรวจ lab (LabResult)|LabResult]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `getLabResults`** — อ่าน collection `labResults` ผ่าน Firebase Admin SDK ด้วย composite
  index `(patientId ASC, testedAt DESC)` และเพิ่ม range filter บน `testedAt` เมื่อระบุช่วงเวลา (ดู
  [[db-spec#ผลตรวจ lab (LabResult)|Firestore Technical Binding ใน db-spec]]) หลังผ่าน Access
  Control + Audit Logging (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง →
  `permission-denied`; ไม่พบผู้ป่วย → `not-found`; ช่วงเวลาไม่ถูกต้อง → `invalid-argument`;
  บันทึก Audit Log ไม่สำเร็จ → `internal`

## Operation 3 — วิเคราะห์และแสดงผลความเสี่ยงโรคแทรกซ้อนของผู้ป่วย

รองรับ [[backlog#สูง (MVP)|FR-03]] (วิเคราะห์) และ [[backlog#สูง (MVP)|FR-04]] (แสดง/แจ้งผล) —
รวมเป็น operation เดียวเพราะผลการวิเคราะห์ถูกส่งกลับให้ Client แสดงผลทันทีตาม sequence diagram ใน
[[architecture#Data Flow Diagram — Journey หลัก|architecture]]

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** ComplicationRiskAssessment หนึ่งรายการ ประกอบด้วย: id, วันที่-เวลาในการประเมิน,
  พบความเสี่ยงหรือไม่ (จริง/เท็จ), และรายการ RiskFinding ย่อยต่อโรคแทรกซ้อนแต่ละชนิดที่ถูกประเมิน
  (โรคแทรกซ้อนที่ประเมิน, เข้าเงื่อนไขความเสี่ยงหรือไม่, ระดับความเสี่ยงที่ประเมินได้ถ้ามี) — ดู
  [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|ComplicationRiskAssessment]]
  และ [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding ใน db-spec]]
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02)
  - ประมวลผลค่าผลตรวจ lab ล่าสุดของผู้ป่วย (จาก [[db-spec#ผลตรวจ lab (LabResult)|LabResult]])
    เทียบกับ threshold มาตรฐานที่เกี่ยวข้อง (จาก
    [[db-spec#threshold มาตรฐานของโรคแทรกซ้อน (ComplicationRiskThreshold)|ComplicationRiskThreshold]])
    แบบ rule-based เท่านั้น **ห้ามใช้ AI/Machine Learning model** ตามขอบเขต MVP (FR-03)
  - ครอบคลุมเฉพาะโรคแทรกซ้อนในขอบเขต: ไตวายเรื้อรัง (N18.3–N18.9), โรคหัวใจ (I20–I25),
    โรคหลอดเลือดสมอง (I60–I69)
  - แต่ละ RiskFinding ที่สร้างขึ้นต้องบันทึก ค่า threshold และตัวดำเนินการเปรียบเทียบที่ใช้ ณ เวลา
    ประเมินแบบ snapshot แยกจากค่าปัจจุบันใน ComplicationRiskThreshold เสมอ (ดูเหตุผลใน
    [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding ใน db-spec]])
  - ComplicationRiskAssessment.พบความเสี่ยงหรือไม่ เป็นจริง ก็ต่อเมื่อมี RiskFinding อย่างน้อยหนึ่ง
    รายการที่ "เข้าเงื่อนไขความเสี่ยงหรือไม่" เป็นจริง
  - ถ้าไม่พบความเสี่ยงเลย ต้องคืนผลลัพธ์ที่สื่อความหมายว่า "ไม่พบความเสี่ยงเพิ่มเติม" อย่างชัดเจน
    ไม่ใช่ error (ตาม [[user-journey]])
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง หรือผู้ป่วยรายนี้ไม่ได้อยู่ในความดูแลของผู้ใช้งานคนนี้ตาม PatientAssignment) → ปฏิเสธการเข้าถึง (NFR-02, FR-05)
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ไม่พบผลตรวจ lab ที่เพียงพอสำหรับประเมิน rule ใดๆ เลย → คืนผลลัพธ์ "ข้อมูลไม่เพียงพอสำหรับการ
    ประเมิน" (ไม่ใช่ error แต่เป็นผลลัพธ์ประเภทหนึ่งที่ Client ต้องแสดงข้อความอธิบาย)
- **อ้างอิง:** [[backlog#สูง (MVP)|FR-03]], [[backlog#สูง (MVP)|FR-04]],
  [[backlog#Non-Functional Requirements|NFR-01]], [[backlog#Non-Functional Requirements|NFR-02]],
  [[backlog#Non-Functional Requirements|NFR-11]] (threshold ที่อ่านต้องผ่านการยืนยันจากแพทย์
  ผู้เชี่ยวชาญก่อน deploy เสมอ — กระบวนการนอกระบบ ดู
  [[#Cross-cutting: ข้อกำหนดคุณภาพเชิงปฏิบัติการที่ครอบคลุมทุก Operation (NFR-09–NFR-16)|Cross-cutting
  NFR-09–NFR-16 ด้านบน]]), [[backlog#Non-Functional Requirements|NFR-13]] (field ระดับความเสี่ยงเป็น
  ข้อความกำกับ ไม่ใช่สีอย่างเดียว),
  [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|ComplicationRiskAssessment]],
  [[db-spec#รายละเอียดผลการประเมินต่อโรคแทรกซ้อน (RiskFinding)|RiskFinding]]
- **Technical Binding (ตาม [[technology-stack#2. ภาษา/Framework ฝั่ง Backend Logic — Node.js + TypeScript บน Cloud Functions|decision area 2 ใน technology-stack]]):**
  Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function ชื่อ
  `assessComplicationRisk`** — อ่าน `labResults` (composite index `(patientId ASC, testType ASC,
  testedAt DESC)` เพื่อดึงค่าล่าสุดต่อชนิดการตรวจ) และ `complicationRiskThresholds` ผ่าน Admin SDK
  แล้วเขียนผลลัพธ์ลง `complicationRiskAssessments/{assessmentId}` พร้อม subcollection
  `riskFindings` (ดู [[db-spec#ผลการประเมินความเสี่ยงโรคแทรกซ้อน (ComplicationRiskAssessment)|
  Firestore Technical Binding ใน db-spec]]) เขียน logic เปรียบเทียบ threshold เป็นโค้ด TypeScript
  โดยตรง (ไม่ใช้ Firestore Security Rules สำหรับส่วนนี้) หลังผ่าน Access Control + Audit Logging
  (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง → `permission-denied`; ไม่พบผู้ป่วย →
  `not-found`; บันทึก Audit Log ไม่สำเร็จ → `internal`

## Operation 4 — ยื่นและดำเนินการคำขอใช้สิทธิของเจ้าของข้อมูล (Data Subject Rights Request)

รองรับ [[backlog#Non-Functional Requirements|NFR-07]] — ใช้ Operation 0 ค้นหา/เลือกผู้ป่วยเดียวกันก่อน
เสมอตาม [[user-journey#Journey เจ้าหน้าที่ดำเนินการตามคำขอใช้สิทธิของเจ้าของข้อมูล และสนับสนุนการสืบสวนกรณีข้อมูลส่วนบุคคลรั่วไหล (PDPA)|journey ที่สอง]]
ระบบเป็นระบบภายในที่เจ้าหน้าที่ดำเนินการแทนผู้ป่วย ไม่มีช่องทาง self-service ในขอบเขต MVP (ดู
[[20260921-01-pdpa-data-protection-compliance#นอกขอบเขต (Out of scope) ของเอกสารนี้|หัวข้อนอกขอบเขตของ spec PDPA]])

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD (ในฐานะเจ้าหน้าที่ที่มีสิทธิ์)
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — จำเป็น (มาจากผลลัพธ์ของ Operation 0)
  - ประเภทคำขอ (ขอเข้าถึง/ขอสำเนา/ขอแก้ไข/ขอลบ/คัดค้านการประมวลผล) — จำเป็น
  - รายละเอียดคำขอ (เช่น ข้อมูลที่ต้องการแก้ไข หรือเหตุผลการคัดค้าน) — จำเป็นเมื่อประเภทคำขอเป็น
    "ขอแก้ไข" หรือ "คัดค้านการประมวลผล", ไม่บังคับสำหรับประเภทอื่น
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:**
  - [[db-spec#คำขอใช้สิทธิของเจ้าของข้อมูล (DataSubjectRequest)|DataSubjectRequest]] ที่สร้าง/อัปเดต:
    id, ประเภทคำขอ, สถานะคำขอ, วันที่ยื่นคำขอ, วันที่ดำเนินการเสร็จสิ้น (ถ้ามี)
  - ผลลัพธ์การดำเนินการตามประเภทคำขอ: กรณี "ขอเข้าถึง"/"ขอสำเนา" คืนชุดข้อมูลส่วนบุคคลของผู้ป่วยรายนั้น
    (ประวัติวินิจฉัย, ผลตรวจ lab, ผลวิเคราะห์ความเสี่ยง, ข้อมูลระบุตัวตนที่ใช้ค้นหา — ตามขอบเขตของ
    [[20260921-01-pdpa-data-protection-compliance#ขอบเขต|spec PDPA]]); กรณี "ขอแก้ไข"/"ขอลบ"/
    "คัดค้านการประมวลผล" คืนการยืนยันผลการดำเนินการ
- **กฎทางธุรกิจ:**
  - ต้องผ่าน "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ทั้งระดับบทบาทและระดับรายผู้ป่วย และผ่านการตรวจสอบ
    purpose limitation ก่อนเสมอ (NFR-02, NFR-03)
  - ต้องเรียก "บันทึกร่องรอยการเข้าถึงข้อมูลผู้ป่วย (Audit Logging)" ก่อนดำเนินการค้นหา/สกัด/แก้ไข/ลบ
    ข้อมูลจริงเสมอ โดยระบุรหัส DataSubjectRequest ที่เกี่ยวข้อง (NFR-06)
  - กรณีคำขอ "ขอลบ" ต้องพิจารณาร่วมกับนโยบายใน
    [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)|RetentionPolicy]] (NFR-05) — ไม่ลบข้อมูลที่
    ยังมีความจำเป็นตามฐานทางกฎหมายอื่น (เช่น ข้อบังคับเวชระเบียน) โดยไม่มีการยืนยันเพิ่มเติม
  - กระบวนการยืนยันตัวตน/ความถูกต้องของคำขอจากผู้ป่วยก่อนที่เจ้าหน้าที่จะยื่นคำขอนี้ในระบบ เป็น
    กระบวนการเชิงองค์กรที่อยู่นอกขอบเขตของ operation นี้ (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)
  - เมื่อดำเนินการเสร็จสิ้น (สำเร็จหรือปฏิเสธ) ต้องปรับสถานะคำขอและบันทึกวันที่ดำเนินการเสร็จสิ้น
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึง (บทบาทไม่ถูกต้อง หรือผู้ป่วยรายนี้ไม่ได้อยู่ในความดูแลของผู้ใช้งานคนนี้ตาม
    PatientAssignment) → ปฏิเสธการเข้าถึง (NFR-02, FR-05)
  - ไม่พบผู้ป่วยตามรหัสที่ระบุ → แจ้งว่าไม่พบผู้ป่วย
  - ประเภทคำขอไม่ถูกต้อง/ไม่อยู่ในรายการที่กำหนด หรือระบุประเภท "ขอแก้ไข"/"คัดค้านการประมวลผล" โดยไม่มี
    รายละเอียดคำขอ → แจ้งว่า input ไม่ถูกต้อง
  - บันทึก Audit Logging ไม่สำเร็จ → ยกเลิกการดำเนินการตามคำขอทั้งหมด (ดู Operation ร่วม Audit Logging)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-07]],
  [[backlog#Non-Functional Requirements|NFR-05]], [[backlog#Non-Functional Requirements|NFR-06]],
  [[backlog#Non-Functional Requirements|NFR-02]], [[backlog#Non-Functional Requirements|NFR-03]],
  [[db-spec#คำขอใช้สิทธิของเจ้าของข้อมูล (DataSubjectRequest)|DataSubjectRequest]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `submitDataSubjectRequest`** — เขียน/อัปเดต `dataSubjectRequests/{requestId}` ผ่าน Admin SDK
  หลังผ่าน Access Control + Audit Logging (internal) แล้วเท่านั้น — **Error code:** ปฏิเสธการเข้าถึง
  → `permission-denied`; ไม่พบผู้ป่วย → `not-found`; ประเภทคำขอไม่ถูกต้อง/ขาดรายละเอียดที่จำเป็น →
  `invalid-argument`; บันทึก Audit Log ไม่สำเร็จ → `internal`
  - **ข้อกำหนดเพิ่มเติมเฉพาะกรณี "ขอแก้ไข" (สำคัญ ผลจากการ denormalize ข้อมูลใน db-spec):** เมื่อ
    แก้ไข `Patient.hn` หรือ `Patient.fullName` ตาม field ที่ถูกร้องขอ ฟังก์ชัน `submitDataSubjectRequest`
    **ต้อง**อัปเดตสำเนา `patientHn`/`patientFullName` ในทุกเอกสาร `patientAssignments` ที่มี
    `patientId` ตรงกันภายใน transaction/batch เดียวกันเสมอ (query ด้วย composite index `(patientId
    ASC)` ก่อนเพื่อหารายการที่ต้องอัปเดต) มิฉะนั้น Operation 0 จะแสดงข้อมูลที่ไม่ตรงกับ `patients`
    จริง — ดู [[db-spec#การมอบหมายผู้ป่วยในความดูแล (PatientAssignment)|Firestore Technical Binding
    ของ PatientAssignment ใน db-spec]]

## Operation 5 — สืบค้นบันทึกการเข้าถึงข้อมูล (Audit Trail Retrieval)

รองรับ [[backlog#Non-Functional Requirements|NFR-08]] — สนับสนุนการสืบสวน/แจ้งเหตุละเมิดข้อมูลส่วนบุคคล
ตาม [[user-journey#Journey เจ้าหน้าที่ดำเนินการตามคำขอใช้สิทธิของเจ้าของข้อมูล และสนับสนุนการสืบสวนกรณีข้อมูลส่วนบุคคลรั่วไหล (PDPA)|journey ที่สอง]]

- **ผู้เรียกได้/บทบาท:** แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD (ในฐานะเจ้าหน้าที่ที่มีสิทธิ์ — ดู "ประเด็นรอ
  ตัดสินใจ" ท้ายเอกสารเรื่องบทบาทที่ควรเรียก operation นี้ได้)
- **Input:**
  - รหัสผู้ป่วย (Patient.id) — ไม่บังคับ (ระบุเพื่อจำกัดผลลัพธ์เฉพาะผู้ป่วยรายนั้น)
  - ช่วงเวลาที่ต้องการสืบค้น (วันที่-เวลาเริ่มต้น/สิ้นสุด) — ไม่บังคับ
  - รหัสผู้ใช้ที่ต้องการตรวจสอบ (User.id) — ไม่บังคับ
  - ข้อมูลยืนยันตัวตน/บทบาทผู้ใช้ (auth context) — จำเป็น
- **Output:** รายการ [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]] ที่ตรงเงื่อนไข
  เรียงตามวันที่-เวลาที่เข้าถึง แต่ละรายการประกอบด้วย: id, ผู้ใช้, ผู้ป่วย, การดำเนินการ, วันที่-เวลาที่
  เข้าถึง, คำขอสิทธิที่เกี่ยวข้อง (ถ้ามี)
- **กฎทางธุรกิจ:**
  - ต้องผ่านการตรวจสอบสิทธิ์ระดับบทบาทของ "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ก่อนเสมอ (NFR-02) —
    operation นี้ไม่ผูกกับผู้ป่วยรายใดรายหนึ่งโดยเฉพาะเมื่อไม่ระบุ Patient.id จึงไม่มีการตรวจสอบระดับ
    รายผู้ป่วยในกรณีนั้น
  - เมื่อระบุรหัสผู้ป่วย ต้องตรวจสอบระดับรายผู้ป่วยตาม PatientAssignment เพิ่มเติมก่อนคืนผลลัพธ์ที่
    เจาะจงผู้ป่วยรายนั้น (NFR-02)
  - การเรียก operation นี้เองก็ต้องถูกบันทึกลง Audit Log เช่นกัน (การดำเนินการ = "ดูข้อมูลผู้ป่วย" ตามค่า
    ที่กำหนดไว้ล่วงหน้าใน [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord.การดำเนินการ]])
    เพื่อรักษาความสมบูรณ์ของหลัก Accountability (NFR-06)
  - ต้องให้ผลลัพธ์เพียงพอต่อการสืบสวน/แจ้งเหตุละเมิดภายในกรอบเวลาที่กฎหมายกำหนด (NFR-08) — กรอบเวลา
    ที่แน่นอนยังไม่ถูกกำหนดในเอกสารต้นทาง
- **กรณี error:**
  - ไม่มีสิทธิ์เข้าถึงระดับบทบาท → ปฏิเสธการเข้าถึง (NFR-02)
  - ระบุรหัสผู้ป่วยที่ไม่มี PatientAssignment เชื่อมโยงกับผู้ใช้นี้ → ปฏิเสธการเข้าถึงข้อมูล audit trail
    ของผู้ป่วยรายนั้น (NFR-02)
  - ช่วงเวลาที่ระบุไม่ถูกต้อง (เช่น วันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด) → แจ้งว่า input ไม่ถูกต้อง
  - ไม่พบบันทึกที่ตรงเงื่อนไข → คืนรายการว่าง (ไม่ถือเป็น error)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-08]],
  [[backlog#Non-Functional Requirements|NFR-06]], [[backlog#Non-Functional Requirements|NFR-02]],
  [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|AuditLogRecord]]
- **Technical Binding:** Cloud Functions (2nd gen, Node.js + TypeScript) — **HTTPS Callable Function
  ชื่อ `getAuditTrail`** — สืบค้น collection `auditLogRecords` ผ่าน Admin SDK ด้วย composite index
  ที่ตรงกับเงื่อนไขที่ระบุ (ดู [[db-spec#บันทึกการเข้าถึงข้อมูล (AuditLogRecord)|Firestore Technical
  Binding ใน db-spec]] สำหรับรายการ composite index ทั้งหมด) หลังผ่าน Access Control (internal —
  เฉพาะระดับบทบาท และระดับรายผู้ป่วยเมื่อระบุ Patient.id) แล้วเท่านั้น การเรียก operation นี้เองก็ถูก
  บันทึกลง Audit Log เช่นกัน — **Error code:** ปฏิเสธการเข้าถึงระดับบทบาท →
  `permission-denied`; ระบุผู้ป่วยที่ไม่มี PatientAssignment → `permission-denied`; ช่วงเวลาไม่
  ถูกต้อง → `invalid-argument`

## Operation 6 — บังคับใช้นโยบายเก็บรักษาและลบข้อมูลที่พ้นระยะเวลา (Retention Enforcement)

รองรับ [[backlog#Non-Functional Requirements|NFR-05]] — เป็น internal operation ที่
[[architecture#บริการฝั่งเซิร์ฟเวอร์ (Backend Service)|Data Subject Rights \& Retention Management]]
บังคับใช้กับ Primary Data Store และ Audit Log Store กลไก trigger จริง (scheduled job อัตโนมัติ หรือ
manual process ในช่วงแรก) ยังไม่ถูกตัดสินใจ (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)

- **ผู้เรียกได้/บทบาท:** internal (เรียกโดยกลไก automation ของ Backend Service เอง — ไม่ใช่ operation
  ที่ Client เรียกตรงในขอบเขต MVP)
- **Input:**
  - [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)|RetentionPolicy]] ที่จะใช้บังคับ (ระบุ
    ประเภทข้อมูลที่บังคับใช้) — จำเป็น
- **Output:** จำนวน/รายการระเบียนที่ถูกลบ/ทำลายในรอบการบังคับใช้นี้ (ระบุ entity และ id ที่ถูกลบ เพื่อ
  ใช้อ้างอิงในการตรวจสอบย้อนหลัง)
- **กฎทางธุรกิจ:**
  - ตรวจสอบระเบียนของ entity ที่ RetentionPolicy.ประเภทข้อมูลที่บังคับใช้ระบุ (NcdDiagnosis/LabResult
    ที่ผูกกับ Patient สำหรับหมวด Primary Data Store หรือ AuditLogRecord สำหรับหมวด Audit Log Store)
    เทียบกับ RetentionPolicy.ระยะเวลาเก็บรักษา (จำนวนวัน) นับจากเงื่อนไขเริ่มนับที่กำหนด แล้วลบ/ทำลาย
    ระเบียนที่พ้นระยะเวลาแล้ว (NFR-05)
  - ค่าระยะเวลาเก็บรักษาจริงยังไม่ถูกกำหนด — ห้าม hardcode ค่าใดๆ จนกว่าจะได้รับการยืนยันจากหน่วยงาน/
    ฝ่ายกฎหมาย (ดู "ประเด็นรอตัดสินใจ" ท้ายเอกสาร)
  - Audit Log Store อาจมีนโยบาย retention ที่ต่างจาก Primary Data Store (เก็บนานกว่า เพื่อรองรับการ
    สืบสวน/แจ้งเหตุละเมิดตาม NFR-08) — ต้องใช้ RetentionPolicy คนละรายการกัน ไม่ใช้ค่าเดียวกัน
  - การลบตามนโยบายนี้แตกต่างจากการลบตามคำขอสิทธิของเจ้าของข้อมูล (Operation 4 กรณี "ขอลบ") ซึ่งเป็น
    การลบตามคำขอเฉพาะราย ไม่ใช่ตามรอบเวลาอัตโนมัติ — ทั้งสอง operation ต้องบันทึก Audit Log แยกกัน
    (NFR-06)
- **กรณี error:**
  - RetentionPolicy ที่ระบุไม่มีค่าระยะเวลาเก็บรักษา (ยังไม่ถูกกำหนด) → ข้ามการบังคับใช้สำหรับ
    ประเภทข้อมูลนั้นในรอบนี้ (ไม่ใช่ error แต่เป็นผลลัพธ์ที่ต้องรายงานให้ผู้ดูแลระบบทราบ)
- **อ้างอิง:** [[backlog#Non-Functional Requirements|NFR-05]],
  [[backlog#Non-Functional Requirements|NFR-06]],
  [[db-spec#นโยบายเก็บรักษาและลบข้อมูล (RetentionPolicy)|RetentionPolicy]]
- **Technical Binding (ตาม [[technology-stack#6. Hosting/Deployment Environment|decision area 6 ใน technology-stack]]):**
  Cloud Functions (2nd gen) — **scheduled function ชื่อ `enforceRetentionPolicy` trigger ผ่าน
  Cloud Scheduler** (ไม่ใช่ HTTPS Callable Function — Client ไม่เรียก operation นี้ในขอบเขต MVP)
  อ่าน `retentionPolicies` แล้วลบระเบียนที่พ้นระยะเวลาใน `ncdDiagnoses`/`labResults`/
  `auditLogRecords` ผ่าน Admin SDK — ความถี่ schedule ที่แน่นอนยังรอค่า `RetentionPolicy.ระยะเวลา
  เก็บรักษา` จริงก่อน (ดู "ประเด็นรอตัดสินใจ") — **Error/ผลลัพธ์:** RetentionPolicy ที่ระบุไม่มีค่า
  ระยะเวลาเก็บรักษา → ข้ามการบังคับใช้และบันทึก log ภายใน (ไม่ใช่ HttpsError เพราะไม่มี caller ที่
  รอผลลัพธ์แบบ synchronous)

## กรณี Error ทั่วไปที่ใช้ร่วมกันทุก Operation

| กรณี | อธิบาย | Error code จริง (Cloud Functions Callable — Operation 1-6 เท่านั้น) | อ้างอิง |
| --- | --- | --- | --- |
| ปฏิเสธการเข้าถึง | ผู้ใช้ไม่ผ่านการตรวจสิทธิ์ตาม Operation ร่วม "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" ไม่ว่าจะเป็นระดับบทบาท ระดับรายผู้ป่วย (ไม่มี PatientAssignment เชื่อมโยงกับผู้ใช้) ขอบเขตวัตถุประสงค์ (purpose limitation) หรือ `email_verified` เป็นเท็จ (เพิ่มใหม่ 2026-09-24) | `permission-denied` (หรือ `unauthenticated` ถ้าไม่มี auth token เลย); สำหรับ Operation 0 คือ Firestore Security Rules ปฏิเสธ query/read โดยตรง (`permission-denied` จาก Firestore SDK ไม่ใช่ HttpsError) | [[backlog#Non-Functional Requirements\|NFR-02]], [[backlog#สูง (MVP)\|FR-05]], [[backlog#Non-Functional Requirements\|NFR-03]], [[backlog#สูง (MVP)\|FR-09]] |
| ไม่พบผู้ป่วย | รหัสผู้ป่วยที่ระบุไม่มีอยู่ในระบบ | `not-found` | [[db-spec#ผู้ป่วย (Patient)\|Patient]] |
| HN ไม่ครบ 7 หลัก | เฉพาะ Operation 0: เลข HN ที่กรอกไม่ครบรูปแบบตัวเลขล้วน 7 หลัก ตรวจสอบหลังกดค้นหาแล้วเท่านั้น (ไม่ real-time) ต้องแจ้งเตือนและให้กรอกค้นหาใหม่ได้ทันที | ไม่มี (ตรวจสอบในโค้ด Client ก่อนยิง Firestore query — ไม่ใช่ Cloud Function ดู Technical Binding ของ Operation 0) | [[backlog#สูง (MVP)\|FR-06]] |
| ค้นหาด้วย HN ไม่พบผู้ป่วย | เฉพาะ Operation 0: เลข HN ครบ 7 หลักแล้วแต่ไม่พบผู้ป่วยที่ตรงกัน (หรือพบแต่ไม่อยู่ในความดูแลของผู้ใช้นี้) ต้องแจ้งเตือนและให้กรอกค้นหาใหม่ได้ทันที | ไม่มี (Firestore query คืนผลลัพธ์ว่างตามปกติ — Client ตีความเป็นข้อความแจ้งเตือน ไม่ใช่ error จาก server) | [[backlog#สูง (MVP)\|FR-06]] |
| Input ไม่ถูกต้อง | รูปแบบ/ค่าของ input ที่ส่งมาไม่ตรงตามที่ operation กำหนด (เช่น ช่วงเวลาไม่ถูกต้อง, ประเภทคำขอสิทธิไม่ถูกต้อง) | `invalid-argument` | — |
| บันทึก Audit Log ไม่สำเร็จ | Backend Service บันทึกร่องรอยการเข้าถึงข้อมูลไม่สำเร็จ จึงยกเลิกการดำเนินการที่เรียกใช้ทั้งหมด (fail-safe) | `internal` | [[backlog#Non-Functional Requirements\|NFR-06]] |
| อีเมล/รหัสผ่านไม่ถูกต้อง (เข้าสู่ระบบ) | เฉพาะ Operation 7: ปฏิเสธการเข้าสู่ระบบด้วยข้อความรวมเดียวกันเสมอ ไม่แยกแยะว่าอีเมลหรือรหัสผ่านผิด | ไม่มี error code แบบ Callable Function (Firebase Authentication SDK คืน error code ของตนเอง — Client ต้องแปลงเป็นข้อความรวมเสมอ) | [[backlog#สูง (MVP)\|FR-07]], [[backlog#Non-Functional Requirements\|NFR-18]] |
| รหัสผ่านไม่ผ่านนโยบายขั้นต่ำ | เฉพาะ Operation 8, 9: รหัสผ่านที่กรอกไม่ผ่านเงื่อนไข ≥ 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข — **ไม่ใช่กรณีที่ต้อง generic** เพราะไม่เกี่ยวกับการเปิดเผยว่าอีเมลมีบัญชีอยู่หรือไม่ | `invalid-argument` (`weak-password`) | [[backlog#Non-Functional Requirements\|NFR-17]] |
| ผลลัพธ์ generic เมื่ออีเมลซ้ำ/ไม่พบบัญชี | เฉพาะ Operation 8 (สมัครด้วยอีเมลซ้ำ), Operation 9 (รีเซ็ตด้วยอีเมลที่ไม่มีในระบบ): **ต้องคืนข้อความ/response สำเร็จแบบเดียวกับกรณีปกติเสมอ ห้ามคืน error ที่แยกแยะได้ทั้งเนื้อหาและ error code** | ไม่มี — คืนผลลัพธ์สำเร็จแบบเดียวกันเสมอ (ไม่ใช่ error) | [[backlog#Non-Functional Requirements\|NFR-18]] |

## ประเด็นรอตัดสินใจ

`[[technology-stack]]` มีเนื้อหาแล้วและตัดสินใจประเด็นส่วนใหญ่ที่เคยค้างไว้ในหัวข้อนี้ไปแล้ว (กลไก
การสื่อสารจริง — Firestore direct read สำหรับ Operation 0 + Cloud Functions Callable/scheduled
สำหรับ Operation 1-6, กลไก authentication/authorization พื้นฐาน — **Firebase Authentication โดยไม่ใช้
Custom Claims เก็บบทบาท/isActive** (แก้ไข 2026-09-24 — Firestore `users/{uid}` เป็น source of truth
เดียว), กลไกเข้ารหัสพื้นฐาน, กลไก automation ของ Operation 6, กลไกเฉพาะของฟีเจอร์ที่ 6 ทั้งหมด —
password policy, account enumeration prevention, เทมเพลตอีเมล, การสร้าง `users/{uid}`, การตรวจสอบ
`email_verified` ซ้ำ) — รายการเหล่านี้ถูกนำไประบุไว้ในเอกสารนี้แล้วตามขั้นตอน 5.7 (ดูหัวข้อ "Technical
Binding" ของแต่ละ operation ด้านบน) รายการที่ **ยังไม่ตัดสินใจจริง** มีดังนี้:

- ค่า threshold ตัวเลขจริงที่ operation 3 ใช้เปรียบเทียบยังไม่ถูกกำหนด (ดู
  [[db-spec#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน db-spec]])
- กลไก/ผู้กำหนดการมอบหมายผู้ป่วยให้ผู้ดูแล (PatientAssignment) ที่ Operation 0 และ operation ร่วม
  "ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ป่วย" อ้างอิงถึง ยังไม่ถูกยืนยันจากผู้ใช้ — จึงยังไม่มี operation
  สำหรับสร้าง/แก้ไข/ยกเลิก PatientAssignment ในเอกสารนี้ (ดู
  [[db-spec#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน db-spec]])
- **Customer-Managed Encryption Keys (CMEK)/field-level encryption เพิ่มเติมสำหรับ NFR-04** — กลไก
  พื้นฐาน (Google-managed keys + TLS) ถูกตัดสินใจแล้วสำหรับ MVP แต่ควรทบทวนก่อนใช้ข้อมูลผู้ป่วยจริง
  (ดู [[technology-stack#8. กลไกเข้ารหัสข้อมูล (NFR-04) และการบริหารกุญแจเข้ารหัส|decision area 8
  ใน technology-stack]])
- ค่าระยะเวลาเก็บรักษาจริง (RetentionPolicy) ที่ Operation 6 ใช้บังคับ — กลไก automation (Cloud
  Functions scheduled function ผ่าน Cloud Scheduler) ถูกตัดสินใจแล้ว แต่ค่าจำนวนวันจริงยังรอยืนยัน
  จากหน่วยงาน/ฝ่ายกฎหมาย (ดู [[db-spec#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน db-spec]])
- กระบวนการยืนยันตัวตนผู้ยื่นคำขอสิทธิของเจ้าของข้อมูลก่อนเรียก Operation 4 (NFR-07) ยังไม่ถูกยืนยันจาก
  ผู้ใช้ (ดู [[architecture#ประเด็นรอตัดสินใจอื่น (ไม่เกี่ยวกับ technology stack)|ประเด็นรอตัดสินใจอื่นใน architecture]])
- บทบาทที่ควรเรียก Operation 5 (สืบค้น audit trail) ได้ — ปัจจุบันออกแบบให้ใช้บทบาทเดียวกับที่เข้าถึง
  ข้อมูลผู้ป่วยได้ (แพทย์/พยาบาล) เพราะ spec ต้นทางไม่ได้แยกบทบาทใหม่สำหรับงานนี้ (ดู
  [[20260921-01-pdpa-data-protection-compliance#บทบาทที่เกี่ยวข้อง|หัวข้อบทบาทที่เกี่ยวข้องของ spec PDPA]])
  ควรให้ผู้ใช้ยืนยันว่าจำเป็นต้องจำกัดเฉพาะบทบาทเพิ่มเติม (เช่น ผู้ดูแลระบบ/DPO) หรือไม่
- ฐานทางกฎหมาย (lawful basis) ที่ชัดเจนของ purpose limitation (NFR-03) ที่ operation ร่วม "ตรวจสอบ
  สิทธิ์การเข้าถึงข้อมูลผู้ป่วย" บังคับใช้ ยังไม่ถูกยืนยันจากฝ่ายกฎหมาย/DPO (ดู
  [[architecture#ประเด็นรอตัดสินใจอื่น (ไม่เกี่ยวกับ technology stack)|ประเด็นรอตัดสินใจอื่นใน architecture]])
- **ขั้นตอนถัดไปสำหรับ Performance (NFR-09) หากพบว่ายังไม่พอ — In-memory caching / Managed caching
  layer** — composite index ต่อ operation ถูกระบุไว้แล้วใน Technical Binding ของแต่ละ operation
  (อ้างอิง [[db-spec]]) และ
  [[technology-stack#9. กลไกรองรับ Performance < 2 วินาที (NFR-09) — Firestore Composite Index เท่านั้น (ไม่มี caching layer เพิ่มเติม)|decision area 9 ใน technology-stack]]
  ตัดสินใจใช้ composite index เท่านั้นโดยเจตนาสำหรับรอบนี้ (**ไม่ใช่ยังไม่ตัดสินใจ**) — แต่ถ้าผลทดสอบ
  performance จริง (ดู [[test-plan]]) พบว่าไม่สามารถทำ < 2 วินาทีได้อย่างสม่ำเสมอ ขั้นตอนถัดไปที่ควร
  พิจารณาคือ in-memory caching ใน Cloud Functions สำหรับข้อมูลอ้างอิงคงที่ (เช่น
  `ComplicationRiskThreshold`) ก่อนพิจารณา managed caching layer แยก (Memorystore/Redis) (ดู
  [[architecture#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน architecture]])
- **กลไกฝั่งเซิร์ฟเวอร์เพื่อบังคับใช้ Session Timeout ซ้ำ (NFR-12)** — เช่นเดียวกับที่ระบุใน
  [[architecture#ประเด็นรอตัดสินใจ|ประเด็นรอตัดสินใจใน architecture]]: Client ตรวจจับ inactivity เอง
  เป็นกลไกหลักที่ตัดสินใจแล้ว ส่วนกลไกเพิกถอน token ฝั่งเซิร์ฟเวอร์เพิ่มเติม (เช่น revoke ทันทีที่ idle
  เกิน 30 นาที) ยังไม่ถูกตัดสินใจ — หากมีการตัดสินใจในอนาคต อาจต้องเพิ่ม operation ใหม่ (เช่น
  "เพิกถอน session") ในเอกสารนี้
- **ฟีเจอร์ที่ 6 (Authentication) — ปิดแล้วในรอบ 2026-09-24 (เดิมเป็นประเด็นรอตัดสินใจ):**
  `[[technology-stack]]` รอบสาม (decision area 13-19) ตัดสินใจกลไกจริงที่เคยค้างไว้ทั้งหมดแล้ว และ
  เอกสารนี้ปรับปรุง Technical Binding ของ Operation 7-9 และ Operation ร่วม Access Control ให้ตรงกัน
  ครบแล้ว (ดูหัวข้อที่เกี่ยวข้องด้านบน) รายการที่ยังคง**เป็นความเสี่ยงที่ต้องบันทึกไว้ต่อ** (ไม่ใช่
  "ยังไม่ตัดสินใจ" — ผู้ใช้รับทราบและยืนยันให้ดำเนินการต่อแล้วในรอบ MVP นี้):
  - **Timing side-channel ของ NFR-18** — เปิดเฉพาะ Firebase "Email Enumeration Protection" โดยเจตนา
    ไม่เพิ่ม fixed minimum delay (decision area 14) — ควรเพิ่มก่อน production จริงกับข้อมูลผู้ป่วยจริง
  - **Auth Blocking Functions สำหรับ Operation 7** — ตัดสินใจไม่ใช้ในรอบนี้ (decision area 16) —
    Operation 7 จึงยังไม่มีจุดตรวจ `emailVerified`/`isActive` ที่ระดับการออก token (ปิดช่องว่างระดับ
    การเข้าถึงข้อมูลผู้ป่วยแล้วด้วย decision area 19 — ดู Operation ร่วม Access Control ด้านบน)
  - **การติดตาม billing/quota ของ Google Cloud Identity Platform** ที่ถูกอัปเกรดใช้บางส่วนสำหรับ
    password policy ของ Operation 9 (decision area 13) — ควรติดตามแยกจาก Firebase Authentication เปล่า
  - **Custom email service** แทน template เริ่มต้นของ Firebase (decision area 15) — ควรทบทวนก่อน
    production จริงเพื่อความน่าเชื่อถือของอีเมลที่ส่งถึงแพทย์/พยาบาล

## เอกสารที่เกี่ยวข้อง

- [[db-spec]]
- [[architecture]]
- [[technology-stack]]
- [[feature-list]]
- [[user-journey]]
- [[backlog]]
- [[20260917-01-patient-ncd-history-lab-complication-risk]]
- [[20260921-01-pdpa-data-protection-compliance]]
- [[20260922-01-operational-quality-nfr]]
- [[20260923-01-user-authentication-email-password]]
