// ==========================================================================
// firebase-init.js — DEMO ONLY, ไม่ใช่โค้ด production
//
// เชื่อมต่อ Firestore ตรงจาก Client (ไม่ผ่าน Cloud Functions) เพื่อสาธิตการ
// ดึง/เขียนข้อมูลจริงเร็วที่สุดสำหรับ mockup data เท่านั้น — สถาปัตยกรรมจริงตามที่
// technology-stack.md decision area 3 ตัดสินใจไว้ กำหนดให้ Operation 1-6 (ข้อมูล
// ผู้ป่วยรายบุคคล: ประวัติวินิจฉัย/ผล lab/ผลวิเคราะห์ความเสี่ยง) ต้องผ่าน Cloud
// Functions เสมอ เพื่อบังคับ audit logging แบบ fail-safe (NFR-06) — ไฟล์นี้ตั้งใจ
// "ลัด" ขั้นตอนนั้นสำหรับ demo เท่านั้น ห้ามใช้แนวทางนี้กับข้อมูลผู้ป่วยจริงเด็ดขาด
//
// ต้องใช้คู่กับ Firestore Security Rules แบบ demo (ดู firestore.rules.demo.txt ใน
// โฟลเดอร์เดียวกัน) ที่เปิดกว้างกว่ากฎ production ใน db-spec.md มาก
// ==========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyB8Q00nqrBwh5qbYC1-z8aEmWcz3n2GgHQ",
  authDomain: "track-ncds.firebaseapp.com",
  projectId: "track-ncds",
  storageBucket: "track-ncds.firebasestorage.app",
  messagingSenderId: "159527278391",
  appId: "1:159527278391:web:646689bbe436287d59acb2"
};

firebase.initializeApp(firebaseConfig);
var demoDb = firebase.firestore();
