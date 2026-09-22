# Design System — NCDs History & Complication Risk

Design token และ component guideline สำหรับ mobile app และ web app ของฟีเจอร์ตาม
[[20260917-01-patient-ncd-history-lab-complication-risk]] เอกสารนี้คือ **single source of truth**
ด้าน visual design (สี, ตัวอักษร, ระยะห่าง, องค์ประกอบ UI, accessibility) — เมื่อสร้าง/แก้ไข
Prototype ใดๆ ใน [[../02-design/01-prototypes|01-prototypes]] ให้ยึด token และกติกาในไฟล์นี้เสมอ
ห้ามกำหนดสี/สไตล์ใหม่นอกเอกสารนี้โดยไม่จำเป็น

**ที่มาของ token/component ในเอกสารนี้:** ดึงมาจาก reference prototype
[designsystem.html](01-prototypes/designsystem.html) (หน้ารายชื่อผู้ป่วย + หน้ารายละเอียดผู้ป่วย/
ผลวิเคราะห์ความเสี่ยง ของฟีเจอร์ที่ 1–3 ใน [[feature-list]]) โดยอ่านค่า CSS custom property จริงที่
render ออกมา ไม่ได้เขียนสีขึ้นใหม่ ไฟล์อ้างอิงนี้เป็น demo แบบ desktop-only (ไม่มี responsive
breakpoint ใน CSS จริง) — ส่วน "Responsive / Mobile" ด้านล่างเป็นกติกาที่**เพิ่มเข้ามาในเอกสารนี้**
เพื่อให้ครอบคลุมทั้ง mobile app และ web app ตามที่ผู้ใช้ขอ ให้ยึดกติกาในเอกสารนี้เป็นหลักเมื่อสร้าง
prototype ฉบับใหม่ที่ต้อง responsive จริง

บทบาทผู้ใช้ของทุกหน้าจอ: **แพทย์/พยาบาลผู้ดูแลผู้ป่วย NCD** เท่านั้น (ดู NFR-02) — ดังนั้น tone และ
ความหนาแน่นของข้อมูล (data-dense, clinical) ออกแบบมาเพื่อผู้ใช้กลุ่มนี้โดยเฉพาะ ไม่ใช่ผู้ป่วยทั่วไป

## 1. หลักการออกแบบ (Design Principles)

- **Clinical clarity** — ข้อมูลผลแล็บ/ความเสี่ยงต้องอ่านง่ายและสแกนได้เร็วระหว่างตรวจผู้ป่วย
  ใช้สีเป็นสัญญาณหลัก (ปกติ/ผิดปกติ, ความเสี่ยงต่ำ→สูงมาก) ไม่ใช่ตกแต่ง
- **สอดคล้องกับขอบเขต NFR-02** — ทุกหน้าจอแสดงเฉพาะข้อมูลผู้ป่วยที่อยู่ในความดูแลของผู้ใช้เท่านั้น
  UI ต้องไม่มีทางเรียกดูข้อมูลผู้ป่วยรายอื่นทางลัด (เช่น URL parameter ที่เดาได้) โดยไม่ผ่าน guard
- **Rule-based ไม่ใช่ AI** — ผลวิเคราะห์ความเสี่ยง (FR-03/FR-04) ต้องแสดง "ปัจจัยเสี่ยงที่พบ" และ
  "คำแนะนำเชิงระบบ" คู่กับตัวเลข/badge เสมอ เพื่อให้ผู้ใช้ตรวจสอบเหตุผลได้ (ไม่ใช่ black-box)
- **Mobile-first สำหรับหน้าจอที่ใช้หน้าเตียง/OPD**, web/desktop เป็น layout ที่แสดงข้อมูลแนวโน้ม
  (trend table) ได้เต็มที่กว่า — ดูหมวด 7

## 2. Color Tokens

### 2.1 Base scale

ทุกสีตั้งต้นจาก scale ของ Tailwind (สี่/ห้าเฉด: 50/100/200/300…900) ห้ามเพิ่มเฉดใหม่นอกรายการนี้
โดยไม่จำเป็น — ใช้ semantic token ในหมวด 2.2 แทนการเรียกสี raw ตรงๆ ในโค้ด

| Scale | 50 | 100 | 200 | 500 | 600 | 700 | 800 | 900 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| slate (neutral) | `#f8fafc` | `#f1f5f9` | `#e2e8f0` | `#64748b` | `#475569` | `#334155` | `#1e293b` | `#0f172a` |
| sky (primary/brand) | `#f0f9ff` | `#e0f2fe` | `#bae6fd` | `#0ea5e9` | `#0284c7` | `#0369a1` | `#075985` | `#0c4a6e` |
| emerald (ปกติ/ความเสี่ยงต่ำ) | `#ecfdf5` | `#d1fae5` | `#a7f3d0` | `#10b981` | `#059669` | `#047857` | `#065f46` | `#064e3b` |
| amber (เฝ้าระวัง/ปานกลาง) | `#fffbeb` | `#fef3c7` | `#fde68a` | `#f59e0b` | — | — | `#92400e` | `#78350f` |
| orange (ความเสี่ยงสูง) | `#fff7ed` | `#ffedd5` | `#fed7aa` | `#f97316` | — | — | `#9a3412` | `#7c2d12` |
| rose (ผิดปกติ/ความเสี่ยงสูงมาก) | `#fff1f2` | `#ffe4e6` | `#fecdd3` | `#f43f5e` | `#e11d48` | `#be123c` | `#9f1239` | `#881337` |
| purple (CKD staging) | `#faf5ff` | `#f3e8ff` | `#e9d5ff` | — | — | `#7e22ce` | `#6b21a8` | — |
| indigo (link accent) | `#eef2ff` | `#e0e7ff` | `#a5b4fc` (300) | — | — | — | `#3730a3` | — |

### 2.2 Semantic tokens

```css
/* Text */
--text-heading: var(--slate-900);
--text-body: var(--slate-700);
--text-muted: var(--slate-600);
--text-subtle: var(--slate-500);
--text-faint: var(--slate-400);
--text-inverse: #ffffff;
--text-link: var(--sky-600);
--text-link-hover: var(--sky-700);
--text-eyebrow: var(--sky-700);

/* Surface */
--surface-page: var(--slate-100);
--surface-card: #ffffff;
--surface-sunken: var(--slate-50);
--surface-app-gradient: linear-gradient(to bottom right, var(--slate-50), var(--sky-50), var(--indigo-50));

/* Border / focus */
--border-default: var(--slate-200);
--border-strong: var(--slate-300);
--border-hover: var(--sky-300);
--border-focus: var(--sky-500);
--ring-focus: var(--sky-200);

/* Action (ปุ่ม) */
--action-primary-bg: var(--sky-600);       --action-primary-fg: #ffffff;
--action-secondary-bg: #ffffff;            --action-secondary-fg: var(--slate-700); --action-secondary-border: var(--slate-200);
--action-accent-bg: var(--sky-50);         --action-accent-fg: var(--sky-800);      --action-accent-border: var(--sky-200);
--action-link-bg: var(--indigo-50);        --action-link-fg: var(--indigo-800);     --action-link-border: var(--indigo-300);
```

### 2.3 Risk & clinical-value tokens (ใช้กับ FR-03/FR-04 เท่านั้น)

ระดับความเสี่ยง 4 ขั้น ใช้คู่สีเดียวกันทั้ง badge/progress bar/callout เสมอ — **หมายเหตุสำคัญ**:
threshold ตัวเลข (คะแนน/ช่วง %) ที่แบ่ง 4 ระดับนี้ยังไม่ถูกยืนยันจากผู้เชี่ยวชาญ (สอดคล้องกับหมายเหตุ
threshold lab ที่ยังไม่ระบุใน spec ต้นทาง — ดู "หมายเหตุ" ใต้ FR-03) ให้กำหนดค่าตัวเลขจริงใน
[[../02-design/02-technical/detailed-design/complication-risk-analysis-alert|detailed-design ของฟีเจอร์นี้]]
เอกสารนี้กำหนดเฉพาะ **สี/สัญลักษณ์ที่ผูกกับแต่ละระดับ**

| ระดับ | คำที่แสดง | bar/badge | bg | border | fg |
| --- | --- | --- | --- | --- | --- |
| Low | เสี่ยง ต่ำ | `--risk-low-*` | emerald-50/100 | emerald-200 | emerald-800 |
| Moderate | เสี่ยง ปานกลาง | `--risk-moderate-*` | amber-50/100 | amber-200 | amber-800 |
| High | เสี่ยง สูง | `--risk-high-*` | orange-50/100 | orange-200 | orange-800 |
| Very High | เสี่ยง สูงมาก | `--risk-veryhigh-*` | rose-50/100 | rose-200 | rose-800 |
| track (พื้น progress bar) | — | `--risk-track` | slate-200 | — | — |

ค่าผลแล็บรายตัว (ปกติ/ผิดปกติ) ใช้คู่สีที่ต่างจาก risk badge เพื่อไม่ให้สับสนระหว่าง "ค่าผิดปกติ 1
ค่า" กับ "ระดับความเสี่ยงโรคแทรกซ้อนโดยรวม":

```css
--value-normal-bg: var(--emerald-50);   --value-normal-border: var(--emerald-200);  --value-normal-fg: var(--emerald-700);  --value-normal-strong: var(--emerald-900);
--value-abnormal-bg: var(--rose-50);    --value-abnormal-border: var(--rose-200);   --value-abnormal-fg: var(--rose-700);   --value-abnormal-strong: var(--rose-900);

/* แนวโน้มระหว่าง visit (↓ดีขึ้น / ↑แย่ลง / →คงที่ — ทิศทางที่ "ดีขึ้น" ขึ้นกับตัวแปร ไม่ใช่ทิศทางตายตัว) */
--trend-better: var(--emerald-600);
--trend-worse: var(--rose-600);
--trend-flat: var(--slate-400);
```

### 2.4 Chip tokens (โรคประจำตัว/staging)

| Chip | ตัวอย่าง | bg | fg |
| --- | --- | --- | --- |
| `chip-chronic` | "เบาหวาน+ความดัน" | sky-50 | sky-700 |
| `chip-ckd` | "CKD stage 3" | purple-50 | purple-700 |
| `chip-neutral` | tag ทั่วไป | slate-100 | slate-700 |
| `chip-alert` | tag เตือน | rose-100 | rose-700 |

### 2.5 Callout tokens

| ประเภท | ใช้เมื่อ | bg | border | fg |
| --- | --- | --- | --- | --- |
| info | คำอธิบายวิธีใช้งาน (เช่น การเปิดจาก HosXP) | sky-50 | sky-200 | sky-900 |
| tip | คำแนะนำเชิงระบบจาก risk engine (FR-04) | emerald-50 | emerald-200 | emerald-900 |
| note | หมายเหตุที่ต้องระวังแต่ไม่วิกฤต | amber-50 | amber-200 | amber-900 |
| warn | คำเตือน/ปัจจัยเสี่ยงที่พบ (FR-04) | rose-50 | rose-200 | rose-900 |

## 3. Typography

Font stack: `"Inter", "Noto Sans Thai", ui-sans-serif, system-ui, sans-serif` — **ต้องรวม Noto Sans
Thai เสมอ** เพราะเนื้อหาเป็นภาษาไทยทั้งหมด (ชื่อผู้ป่วย, การวินิจฉัย, คำแนะนำ) ตัวเลข/โค้ด (HN, ICD-10,
ค่า lab แบบ mono) ใช้ `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

| Token | ขนาด/บรรทัด | น้ำหนัก | ใช้กับ |
| --- | --- | --- | --- |
| `--type-page-title` | 30px/36px | 700 | ชื่อหน้าจอหลัก |
| `--type-section-title` | 18px/28px | 600 | หัวข้อ section (เช่น "ความเสี่ยงโรคแทรกซ้อน") |
| `--type-card-title` | 14px/20px | 600 | ชื่อผู้ป่วยในการ์ด |
| `--type-body` | 14px/20px | 400 | ข้อความทั่วไป |
| `--type-caption` | 12px/16px | 400 | HN, วันที่, label รอง |
| `--type-eyebrow` | 12px/16px | 600, tracking 0.05em, ตัวพิมพ์ใหญ่ | หมวดหมู่บนสุดของหน้า เช่น "NCDS CLINIC · HOSXP INTEGRATION DEMO" |
| `--type-metric` | 24px/32px | 700 | ตัวเลขสำคัญ (stat tile, ค่า lab ตัวใหญ่) |
| `--type-code` | 11px/15px | 600, monospace | HN, VN, ICD-10 code, endpoint ตัวอย่าง |

Scale เต็ม: `2xs 10px · xs2 11px · xs 12px · sm 14px · base 16px · lg 18px · xl 20px · 2xl 24px · 3xl 30px`
— ห้ามใช้ขนาดอื่นนอก scale นี้

## 4. Spacing, Radius, Shadow, Motion

```css
/* Spacing scale (4px grid) */
--space-0-5: 2px;  --space-1: 4px;   --space-1-5: 6px; --space-2: 8px;
--space-2-5: 10px; --space-3: 12px;  --space-4: 16px;  --space-5: 20px;
--space-6: 24px;   --space-8: 32px;  --space-10: 40px;

/* ค่าที่ผูกกับ component โดยเฉพาะ */
--gap-card-grid: 16px;  --gap-chip-row: 8px;  --gap-section: 24px;
--pad-card: 20px;       --pad-card-lg: 24px;  --pad-header: 32px;
--pad-chip-x: 10px;     --pad-chip-y: 4px;
--pad-pill-x: 12px;     --pad-pill-y: 4px;    /* badge ความเสี่ยง */
--pad-btn-x: 16px;      --pad-btn-y: 8px;     /* ปุ่มขนาดปกติ */
--pad-btn-sm-x: 10px;   --pad-btn-sm-y: 4px;  /* ปุ่มขนาดเล็ก เช่น "Sync to HosXP" */

/* Radius */
--radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px; /* ปุ่ม, input */
--radius-xl: 12px; --radius-2xl: 16px; /* การ์ด */
--radius-3xl: 24px; --radius-full: 9999px; /* chip, badge */

/* Shadow */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / .05);   /* การ์ดพื้นฐาน */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1); /* การ์ด hover/ยก */
--shadow-btn: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);  /* ปุ่ม primary */
--ring-focus-shadow: 0 0 0 2px var(--ring-focus); /* keyboard focus ทุก element ที่กดได้ */

/* Motion */
--duration-fast: 150ms;
--easing-default: cubic-bezier(.4, 0, .2, 1);
--transition-default: all var(--duration-fast) var(--easing-default);
--lift-hover: -2px; /* translateY ตอน hover การ์ด/ปุ่ม */
```

Layout container: `--page-max: 1280px` (จำกัดความกว้างสูงสุดบนจอ desktop กว้าง), page padding แนวนอน
`--page-pad-x: 16px` (มือถือ) → `--page-pad-x-md: 32px` (แท็บเล็ต/เว็บ ≥768px — ดูหมวด 7)

## 5. Component Inventory

รายการองค์ประกอบ UI ที่พบใน reference prototype จับคู่กับ token ด้านบน และฟีเจอร์ที่ใช้งาน:

| Component | Token ที่ใช้ | ใช้ในฟีเจอร์ | รายละเอียด |
| --- | --- | --- | --- |
| **Stat tile** (การ์ดสรุปตัวเลขบนสุด เช่น "3 ผู้ป่วย NCDS") | `--stat-sky/rose/purple` gradient bg, `--type-metric` | [[feature-list#3. ค้นหา/เลือกผู้ป่วยในความดูแล\|ฟีเจอร์ 3]] | ใช้ gradient 2 เฉดของสีเดียวกัน (เช่น sky-50→sky-100) ไม่ใช้สีทึบ |
| **Patient list card** | `--surface-card`, `--shadow-sm`→`--shadow-md` (hover), `--radius-2xl` | [[feature-list#3. ค้นหา/เลือกผู้ป่วยในความดูแล\|ฟีเจอร์ 3]] | มุมบนขวาเป็น risk badge เสมอ (ดูข้อ 2.3) เพื่อให้ scan ความเสี่ยงได้จากรายการโดยไม่ต้องเปิดราย ตัว (ตรงกับ FR-04) |
| **Risk badge** (pill) | `--risk-*-bg/border/fg`, `--radius-full`, `--pad-pill-x/y` | [[feature-list#2. วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน\|ฟีเจอร์ 2]] | ข้อความ "เสี่ยง {ระดับ}" ต้องมองเห็นชัดจากระยะไกล (FR-04 "flag/สัญญาณเตือนที่มองเห็นได้ชัดเจน") — ห้ามใช้สีเดียวกับ chip โรคประจำตัว |
| **Risk progress bar** (ต่อโรคแทรกซ้อน 1 รายการ) | `--risk-*-bar` (fill), `--risk-track` (พื้น), % แสดงเป็นตัวเลขข้าง label | [[feature-list#2. วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน\|ฟีเจอร์ 2]] | 1 บาร์ต่อโรคแทรกซ้อน 1 ชนิดในขอบเขต (ไตวายเรื้อรัง/โรคหัวใจ/โรคหลอดเลือดสมอง ตาม spec — prototype ปัจจุบันแสดงเผื่อโรคแทรกซ้อนอื่นด้วย ให้ตรวจสอบกับ [[feature-list]] ก่อนเพิ่ม/ลด) |
| **Chip** (โรคประจำตัว / CKD staging) | `--chip-*-bg/fg`, `--radius-full`, `--pad-chip-x/y` | [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD\|ฟีเจอร์ 1]] | แยก token คนละสีต่อประเภท (chronic/ckd/neutral/alert) เพื่อให้ scan กลุ่มโรคได้เร็ว |
| **Lab value tile** (เช่น HBA1C/FBS/BP ในการ์ดผู้ป่วย) | `--value-normal/abnormal-*` | [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD\|ฟีเจอร์ 1]] | สีพื้นตัดสินจาก "ผิดปกติหรือไม่" ต่อค่า ไม่ใช่จาก risk badge โดยรวม |
| **Trend table** (ตารางเทียบค่า lab 3 visit) | `--trend-better/worse/flat` (ลูกศร ↓↑→), `--type-code` สำหรับตัวเลข | [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD\|ฟีเจอร์ 1]] | คอลัมน์ = visit เรียงเก่า→ใหม่ตามซ้าย→ขวา (ตรงกับ FR-01 "เรียงตามช่วงเวลา") บนมือถือ table นี้ scroll แนวนอนได้ ไม่ยอมให้ตัวเลขตัดคำ |
| **Visit tab** (สลับดูรายละเอียดแต่ละ visit) | `--action-accent-*` (tab ที่เลือก), `--action-secondary-*` (tab ที่ไม่เลือก) | [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD\|ฟีเจอร์ 1]] | เรียงจากซ้าย=visit เก่าสุด |
| **Diagnosis/complication chip** (ICD-10 + ป้าย "COMPLICATION") | `--chip-alert-*` สำหรับป้าย COMPLICATION | [[feature-list#1. ดูประวัติการวินิจฉัยและผลตรวจ lab ของผู้ป่วย NCD\|ฟีเจอร์ 1]] | ต้องแสดงรหัส ICD-10 คู่กับชื่อโรคเสมอ (ผู้ใช้อ่าน ICD-10 เป็นหลัก) |
| **Callout** (info/tip/note/warn) | ดูข้อ 2.5 | [[feature-list#2. วิเคราะห์และแจ้งเตือนความเสี่ยงโรคแทรกซ้อน\|ฟีเจอร์ 2]] | "ปัจจัยเสี่ยงที่พบ" = warn, "คำแนะนำเชิงระบบ" = tip — ห้ามสลับสีสองกล่องนี้ |
| **Search / lookup input** | `--border-default`→`--border-focus`, `--ring-focus-shadow` | [[feature-list#3. ค้นหา/เลือกผู้ป่วยในความดูแล\|ฟีเจอร์ 3]] | placeholder ต้องมีตัวอย่างรูปแบบ HN จริง (เช่น "HN เช่น HN-6500123") |
| **Button — primary** | `--action-primary-*`, `--radius-lg`, `--shadow-btn` | ทุกฟีเจอร์ | ใช้กับ action หลักของหน้าเท่านั้น 1 ปุ่มต่อหน้าจอ (เช่น "เปิดประวัติ") |
| **Button — secondary** | `--action-secondary-*` | ทุกฟีเจอร์ | เช่น "Copy link", "เปิดแท็บใหม่" |
| **Button — accent** | `--action-accent-*` | ทุกฟีเจอร์ | เช่น "Sync to HosXP" — สื่อว่าเชื่อมกับ integration ภายนอก (NFR-01) |

## 6. Accessibility

- **สีไม่ใช่สัญญาณเดียว** — risk badge และ lab value tile ทุกจุดต้องมีข้อความกำกับ (เช่น "เสี่ยง สูงมาก",
  "ผิดปกติ") ควบคู่กับสีเสมอ ห้ามสื่อความหมายด้วยสีอย่างเดียว (สำคัญเพราะผู้ใช้บางส่วนอาจตาบอดสี และ
  เป็นข้อมูลทางคลินิกที่ต้องอ่านถูกต้อง 100%)
- **Contrast** — คู่สี fg/bg ทุก token ในหมวด 2 ผ่านเกณฑ์ WCAG AA (4.5:1 สำหรับ text ขนาดปกติ,
  3:1 สำหรับ text ขนาดใหญ่/ตัวหนา) — ห้ามใช้สี 500 เป็นพื้นหลังคู่กับ text สีขาวยกเว้นปุ่ม primary
  (sky-600 ผ่านเกณฑ์แล้ว)
- **Focus ring** — ทุก element ที่กด/พิมพ์ได้ (ปุ่ม, input, tab, link) ต้องมี `--ring-focus-shadow`
  เมื่อ focus ผ่าน keyboard เพราะผู้ใช้งานคลินิกจำนวนมากสลับหน้าด้วยคีย์บอร์ดระหว่างตรวจ
- **Touch target** — บน mobile ปุ่ม/แถวในรายการที่กดได้ต้องสูงอย่างน้อย 44px (ปรับ `--pad-btn-y`/
  ความสูงแถวการ์ดผู้ป่วยให้ถึงเกณฑ์นี้บน breakpoint mobile แม้ token base จะเล็กกว่าบน desktop)
- **ภาษาไทยอ่านง่าย** — line-height ของ body/card-title (`20px` ที่ font-size `14px`) ต้องไม่ลดลง
  เพราะสระ/วรรณยุกต์ไทยต้องการที่ว่างแนวตั้งมากกว่าอังกฤษ

## 7. Responsive / Mobile

Reference prototype ([designsystem.html](01-prototypes/designsystem.html)) เป็น demo แบบ desktop
คงที่ (ไม่พบ `@media` ใน CSS ที่ render จริง) — กติกาในหมวดนี้จึงเป็นส่วนที่**กำหนดเพิ่ม**ในเอกสารนี้
เพื่อให้ครอบคลุมทั้ง mobile app และ web app ให้ prototype ฉบับถัดไปที่ต้อง responsive จริงยึดตามนี้

### Breakpoints

| ชื่อ | ความกว้าง | page padding แนวนอน |
| --- | --- | --- |
| mobile | < 640px | `--page-pad-x` (16px) |
| tablet | 640–1023px | `--page-pad-x` (16px) |
| desktop / web | ≥ 1024px | `--page-pad-x-md` (32px), container กว้างสูงสุด `--page-max` (1280px) |

### กติกาการจัดวางต่อ component ตาม breakpoint

- **Stat tile grid** — desktop: 3 คอลัมน์ในแถวเดียว (`--gap-card-grid`) · mobile: stack แนวตั้งเต็ม
  ความกว้าง หรือ scroll แนวนอน 1 แถว (เลือกอย่างใดอย่างหนึ่งต่อ 1 prototype ห้ามผสม)
- **Patient list card grid** (ฟีเจอร์ 3) — desktop: grid 3 คอลัมน์ · tablet: 2 คอลัมน์ · mobile:
  1 คอลัมน์ (การ์ดเต็มความกว้าง) เพราะ FR-05 ต้องเรียกดูรายชื่อบนหน้าจอมือถือระหว่างเยี่ยมผู้ป่วยได้ด้วย
- **Trend table** (ฟีเจอร์ 1) — desktop: แสดงทุกคอลัมน์ (visit) พร้อมกัน · mobile: คอลัมน์แรก (ชื่อ
  พารามิเตอร์) sticky ซ้าย + เนื้อหา scroll แนวนอน ห้าม wrap ตัวเลขขึ้นบรรทัดใหม่
- **Risk progress bar list** (ฟีเจอร์ 2) — stack แนวตั้งเสมอทุก breakpoint (ไม่มี layout 2 คอลัมน์บน
  mobile แม้ desktop จะแสดง 2 คอลัมน์) เพื่อให้ label + % ไม่ถูกบีบจนอ่านไม่ออก
- **Visit tabs** — desktop: แสดงเป็นแถวปุ่มแนวนอนทั้งหมด · mobile: ถ้าจำนวน visit มากกว่า 3
  ให้ scroll แนวนอนได้ ห้ามยุบเป็น dropdown (ต้องเห็นทุก visit พร้อมสลับได้เร็วระหว่างตรวจ)
- **Header/action bar** (ปุ่ม Copy link / Sync to HosXP / เปิดผ่าน Lookup) — desktop: อยู่แถวเดียวกับ
  ชื่อผู้ป่วย (ชิดขวา) · mobile: ย้ายลงมาเป็นแถวปุ่มใต้ชื่อผู้ป่วย เรียงแนวนอนแบบ wrap

### Native mobile app (นอกเหนือจาก responsive web)

ถ้ามีการพัฒนาเป็น native app (ตัดสินใจใน `technology-stack.md`) ให้คง token สี/ตัวอักษร/spacing ใน
เอกสารนี้เป็นค่าเดียวกัน (แปลงหน่วยเป็น dp/pt ตามระบบ แต่ตัวเลขอัตราส่วนเท่ากับ px ที่ระบุไว้) เพื่อให้
mobile app และ web app มี visual identity เดียวกันตาม NFR ด้าน consistency

## 8. เอกสารที่เกี่ยวข้อง

- [[feature-list]] — รายการฟีเจอร์ทั้งหมดที่ component ในเอกสารนี้ต้องรองรับ
- [[user-journey]] — ลำดับขั้นตอนที่ผู้ใช้เจอ component แต่ละชิ้น
- [[20260917-01-patient-ncd-history-lab-complication-risk]] — spec ต้นทาง (FR-01–FR-05, NFR-01/02)
- [[../01-requirements/backlog|backlog]] — สรุป FR/NFR ทั้งหมด
- [designsystem.html](01-prototypes/designsystem.html) — reference prototype ที่ดึง token/component มา
