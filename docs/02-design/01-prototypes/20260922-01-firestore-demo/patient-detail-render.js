// ==========================================================================
// patient-detail-render.js — DEMO ONLY
//
// ดึงข้อมูลผู้ป่วยรายเดียว (ประวัติวินิจฉัย/ผล lab/ผลวิเคราะห์ความเสี่ยง) จาก Firestore
// ตรงจาก Client แล้ว render ลงโครงสร้าง DOM เดิมของ patient-detail-*.html — ใช้ร่วมกัน
// ทั้งสองหน้า (เรียก renderPatientDetail(patientId) พร้อม patientId คงที่ต่อหน้า)
//
// สถาปัตยกรรมจริงตาม technology-stack.md/db-spec.md กำหนดให้ operation เหล่านี้
// (ประวัติวินิจฉัย=Op.1, ผล lab=Op.2, ผลวิเคราะห์ความเสี่ยง=Op.3) ต้องผ่าน Cloud
// Functions เท่านั้น เพื่อบันทึก audit log แบบ fail-safe ก่อนอ่านข้อมูลจริงเสมอ
// (NFR-06) — ไฟล์นี้ข้ามขั้นตอนนั้นสำหรับ demo เท่านั้น ห้ามใช้กับข้อมูลผู้ป่วยจริง
// ==========================================================================

var THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function thaiDate(tsOrDate, fullYear) {
  var date = tsOrDate && tsOrDate.toDate ? tsOrDate.toDate() : tsOrDate;
  var be = date.getFullYear() + 543;
  var yearLabel = fullYear ? String(be) : String(be).slice(-2);
  return date.getDate() + " " + THAI_MONTHS[date.getMonth()] + " " + yearLabel;
}

function escapeHtmlDetail(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// ICD-10 สำหรับแสดงผลคู่กับโรคแทรกซ้อนที่พบ — เป็น mapping ฝั่ง demo เท่านั้น (RiskFinding ใน db-spec
// ไม่ได้เก็บรหัส ICD-10 ของโรคแทรกซ้อนไว้ตรงๆ ต้องย้อนไปอ่าน complicationRiskThresholds ผ่าน thresholdId
// ซึ่งเป็น Cloud-Functions-only เช่นกัน — demo นี้จึงเลี่ยงด้วยการ hardcode ไว้แสดงผลเฉยๆ)
var COMPLICATION_ICD = { "ไตวายเรื้อรัง": "N18.3", "โรคหัวใจ": "I25", "โรคหลอดเลือดสมอง": "I63" };

var LAB_ORDER = ["HbA1c", "eGFR", "LDL", "ความดันโลหิต"];
var ABNORMAL_RULE = {
  "HbA1c": function (v) { return v > 6.5; },
  "eGFR": function (v) { return v < 60; },
  "LDL": function (v) { return v > 130; },
  "ความดันโลหิต": function (v) { return v.sys >= 130 || v.dia >= 85; }
};
var HIGHER_IS_BETTER = { "HbA1c": false, "eGFR": true, "LDL": false, "ความดันโลหิต": false };

function groupLabsByVisit(labDocs) {
  // labDocs: array ของ { testType, value, unit, testedAt } เรียงตาม testedAt แล้ว
  var visitsByTime = {};
  var order = [];
  labDocs.forEach(function (r) {
    var key = r.testedAt.toMillis ? r.testedAt.toMillis() : +r.testedAt;
    if (!visitsByTime[key]) { visitsByTime[key] = { date: r.testedAt, values: {} }; order.push(key); }
    visitsByTime[key].values[r.testType] = r.value;
  });
  order.sort(function (a, b) { return a - b; });
  return order.map(function (key) {
    var v = visitsByTime[key];
    var merged = {
      "HbA1c": v.values["HbA1c"],
      "eGFR": v.values["eGFR"],
      "LDL": v.values["LDL"],
      "ความดันโลหิต": { sys: v.values["ความดันโลหิตซิสโตลิก"], dia: v.values["ความดันโลหิตไดแอสโตลิก"] }
    };
    return { date: v.date, values: merged };
  });
}

function labDisplay(metric, value) {
  if (metric === "ความดันโลหิต") return value.sys + "/" + value.dia + " mmHg";
  var units = { "HbA1c": "%", "eGFR": "mL/min/1.73m²", "LDL": "mg/dL" };
  return value + " " + units[metric];
}

function labCell(metric, value) {
  if (metric === "ความดันโลหิต") return value.sys + "/" + value.dia;
  return String(value);
}

function trendArrow(metric, prev, curr) {
  var prevNum = metric === "ความดันโลหิต" ? prev.sys : prev;
  var currNum = metric === "ความดันโลหิต" ? curr.sys : curr;
  if (currNum === prevNum) return { cls: "flat", text: "→ คงที่" };
  var improved = HIGHER_IS_BETTER[metric] ? currNum > prevNum : currNum < prevNum;
  return improved ? { cls: "better", text: "↓ ดีขึ้น" } : { cls: "worse", text: "↑ แย่ลง" };
}

async function renderPatientDetail(patientId) {
  var patientDoc = await demoDb.collection("patients").doc(patientId).get();
  if (!patientDoc.exists) {
    document.getElementById("detail-root").innerHTML =
      '<div class="callout warn"><span class="callout-title">ไม่พบข้อมูลผู้ป่วย</span>' +
      '<p class="type-body" style="color:inherit;">ยังไม่ได้ seed ข้อมูลลง Firestore — เปิด seed.html แล้วกดปุ่ม "เริ่ม Seed ข้อมูล" ก่อน</p></div>';
    return;
  }
  var p = patientDoc.data();

  // ---- Header ----
  var initials = document.querySelector(".patient-avatar");
  if (initials) initials.textContent = p.demoAvatarInitials || "";
  document.getElementById("patient-name").textContent = p.fullName;
  document.getElementById("patient-meta").textContent = "HN-" + p.hn + " · " + p.demoMeta;
  var overallBadge = document.getElementById("patient-overall-badge");
  overallBadge.className = "risk-badge " + p.demoRiskLevel;
  overallBadge.textContent = "ความเสี่ยงโดยรวม: " + p.demoRiskLabel.replace("เสี่ยง ", "");
  document.getElementById("patient-header-chips").innerHTML = (p.demoChips || []).map(function (c) {
    return '<span class="chip ' + c.cls + '">' + escapeHtmlDetail(c.label) + "</span>";
  }).join("");

  // ---- ประวัติการวินิจฉัย (ncdDiagnoses) ----
  var dxSnap = await demoDb.collection("ncdDiagnoses").where("patientId", "==", patientId).get();
  var dx = dxSnap.docs.map(function (d) { return d.data(); })
    .sort(function (a, b) { return a.diagnosedAt.toMillis() - b.diagnosedAt.toMillis(); });

  // ---- ผลวิเคราะห์ความเสี่ยง (complicationRiskAssessments + riskFindings) — ต้องดึงก่อนเพื่อเติมแถว COMPLICATION ใน dx-list ----
  var assessSnap = await demoDb.collection("complicationRiskAssessments").where("patientId", "==", patientId).get();
  var assessments = assessSnap.docs.map(function (d) { return { ref: d.ref, data: d.data() }; })
    .sort(function (a, b) { return b.data.assessedAt.toMillis() - a.data.assessedAt.toMillis(); });
  var latestAssessment = assessments[0];
  var findings = [];
  if (latestAssessment) {
    var findingsSnap = await latestAssessment.ref.collection("riskFindings").get();
    findings = findingsSnap.docs.map(function (d) { return d.data(); });
  }

  var dxHtml = dx.map(function (d) {
    return (
      '<li class="dx-item">' +
        '<div class="dx-item-main">' +
          '<span class="dx-item-name">' + escapeHtmlDetail(d.diseaseGroup) + "</span>" +
          '<span class="dx-item-code">ICD-10: ' + escapeHtmlDetail(d.icd10Code) + "</span>" +
        "</div>" +
        '<span class="dx-item-date">' + thaiDate(d.diagnosedAt, true) + "</span>" +
      "</li>"
    );
  });
  findings.filter(function (f) { return f.isRiskMet; }).forEach(function (f) {
    dxHtml.push(
      '<li class="dx-item" style="border-color: var(--rose-200); background: var(--rose-50);">' +
        '<div class="dx-item-main">' +
          '<span class="dx-item-name">' + escapeHtmlDetail(f.complicationType) + "</span>" +
          '<span class="dx-item-code">ICD-10: ' + (COMPLICATION_ICD[f.complicationType] || "-") + "</span>" +
        "</div>" +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<span class="chip chip-alert">COMPLICATION</span>' +
          '<span class="dx-item-date">' + thaiDate(latestAssessment.data.assessedAt, true) + "</span>" +
        "</div>" +
      "</li>"
    );
  });
  document.getElementById("dx-list").innerHTML = dxHtml.join("");

  // ---- ผลตรวจ Lab ย้อนหลัง (labResults) ----
  var labSnap = await demoDb.collection("labResults").where("patientId", "==", patientId).get();
  var labDocs = labSnap.docs.map(function (d) { return d.data(); });
  var visits = groupLabsByVisit(labDocs);

  document.getElementById("visit-tabs").innerHTML = visits.map(function (v, i) {
    var isLast = i === visits.length - 1;
    var label = "Visit " + (i + 1) + (isLast ? " (ล่าสุด)" : "") + " · " + thaiDate(v.date, false);
    return '<div class="visit-tab' + (isLast ? " selected" : "") + '" role="tab"' + (isLast ? ' aria-selected="true"' : "") + ">" + label + "</div>";
  }).join("");

  var latestVisit = visits[visits.length - 1];
  document.getElementById("value-tiles").innerHTML = LAB_ORDER.map(function (metric) {
    var val = latestVisit.values[metric];
    var abnormal = ABNORMAL_RULE[metric](val);
    return (
      '<div class="value-tile ' + (abnormal ? "abnormal" : "normal") + '">' +
        '<span class="value-label">' + metric + " (ล่าสุด)</span>" +
        '<span class="value-number">' + labDisplay(metric, val) + "</span>" +
        '<span class="value-status">' + (abnormal ? "ผิดปกติ" : "ปกติ") + "</span>" +
      "</div>"
    );
  }).join("");

  var theadRow = "<tr><th>พารามิเตอร์</th>" + visits.map(function (v, i) {
    return "<th>Visit " + (i + 1) + "<br>" + thaiDate(v.date, false) + "</th>";
  }).join("") + "<th>แนวโน้ม</th></tr>";
  document.querySelector("#trend-table thead").innerHTML = theadRow;

  var tbodyHtml = LAB_ORDER.map(function (metric) {
    var cells = visits.map(function (v) {
      var abnormal = ABNORMAL_RULE[metric](v.values[metric]);
      return '<td class="' + (abnormal ? "cell-abnormal" : "cell-normal") + '">' + labCell(metric, v.values[metric]) + "</td>";
    }).join("");
    var arrow = trendArrow(metric, visits[visits.length - 2].values[metric], visits[visits.length - 1].values[metric]);
    var label = metric === "ความดันโลหิต" ? "ความดันโลหิต SBP/DBP (mmHg)" : metric + " (" + (metric === "eGFR" ? "mL/min/1.73m²" : metric === "LDL" ? "mg/dL" : "%") + ")";
    return (
      "<tr><td class=\"param-name\">" + label + "</td>" + cells +
      '<td><span class="trend-arrow ' + arrow.cls + '">' + arrow.text + "</span></td></tr>"
    );
  }).join("");
  document.querySelector("#trend-table tbody").innerHTML = tbodyHtml;

  // ---- ผลวิเคราะห์ความเสี่ยงโรคแทรกซ้อน ----
  var riskLabelMap = { veryhigh: "เสี่ยง สูงมาก", high: "เสี่ยง สูง", moderate: "เสี่ยง ปานกลาง", low: "เสี่ยง ต่ำ" };
  document.getElementById("risk-bar-list").innerHTML = findings.map(function (f) {
    return (
      '<div class="risk-bar-item">' +
        '<div class="risk-bar-head">' +
          '<span class="risk-bar-name">' + escapeHtmlDetail(f.complicationType) + (f.complicationType === "ไตวายเรื้อรัง" ? " (CKD)" : "") + "</span>" +
          '<span class="risk-badge ' + f.riskLevel + '">' + (riskLabelMap[f.riskLevel] || f.riskLevel) + "</span>" +
          '<span class="risk-bar-pct">' + f.demoPercent + "%</span>" +
        "</div>" +
        '<div class="risk-bar-track"><div class="risk-bar-fill ' + f.riskLevel + '" style="width:' + f.demoPercent + '%;"></div></div>' +
      "</div>"
    );
  }).join("");

  var summaryBox = document.getElementById("risk-summary");
  if (latestAssessment && latestAssessment.data.hasRisk) {
    summaryBox.innerHTML =
      '<div class="callout warn">' +
        '<span class="callout-title">ผลการประเมิน: พบความเสี่ยง</span>' +
        '<p class="type-body" style="color:inherit; margin:0;">' +
          "ระบบพบปัจจัยเสี่ยงที่เข้าเกณฑ์ต้องเฝ้าระวังในโรคแทรกซ้อน: " +
          findings.filter(function (f) { return f.isRiskMet; }).map(function (f) { return f.complicationType; }).join(", ") +
          " — ข้อมูลนี้เป็นผลประเมินแบบ rule-based (FR-03) โปรดพิจารณาส่งปรึกษาแพทย์เฉพาะทางที่เกี่ยวข้องและติดตามผลตรวจซ้ำ" +
        "</p>" +
      "</div>";
  } else {
    summaryBox.innerHTML =
      '<div class="callout tip">' +
        '<span class="callout-title">ผลการประเมิน: ไม่พบความเสี่ยงเพิ่มเติม</span>' +
        '<p class="type-body" style="color:inherit; margin:0;">' +
          "ค่า lab ทั้งหมดอยู่ในเกณฑ์ปกติต่อเนื่องทุก visit ระบบไม่พบปัจจัยเสี่ยงที่เข้าเกณฑ์ต้องเฝ้าระวังเพิ่มเติมในการประเมินครั้งนี้ (FR-04 — แขนง \"ไม่พบ\")" +
        "</p>" +
      "</div>";
  }
}
