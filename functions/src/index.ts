import {initializeApp} from "firebase-admin/app";
import {FirebaseAuthError, getAuth} from "firebase-admin/auth";
import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {defineString} from "firebase-functions/params";
import {HttpsError, onCall} from "firebase-functions/v2/https";

import {createIdentityToolkit} from "./auth/identityToolkit.js";
import {requestReset} from "./auth/passwordReset.js";
import {
  EmailAlreadyExistsError,
  InvalidEmailError,
  PasswordRejectedError,
  signUp,
} from "./auth/signUp.js";
import {CallerAuth, CallerUserDoc} from "./patients/accessControl.js";
import {
  getLabResults as getLabResultsLogic,
  getNcdDiagnoses as getNcdDiagnosesLogic,
  RawLabResult,
  RawNcdDiagnosis,
} from "./patients/patientHistory.js";

// ต้องตรงกับ FUNCTIONS_REGION ใน web/src/firebase.ts
setGlobalOptions({region: "asia-southeast1", maxInstances: 10});

initializeApp();

// Web API key ของโปรเจกต์ (ไม่ใช่ความลับ) — ใช้เรียก Identity Toolkit REST ให้ส่งอีเมล
const webApiKey = defineString("WEB_API_KEY");

function logError(message: string, error: unknown): void {
  logger.error(message, {error: error instanceof Error ? error.message : String(error)});
}

export const signUpUser = onCall(async (request) => {
  const auth = getAuth();
  const result = await signUp(request.data ?? {}, {
    async createAuthUser(email, password) {
      try {
        const user = await auth.createUser({email, password, emailVerified: false});
        return user.uid;
      } catch (error) {
        if (error instanceof FirebaseAuthError) {
          if (error.code === "auth/email-already-exists") throw new EmailAlreadyExistsError();
          if (error.code === "auth/invalid-email") throw new InvalidEmailError();
          if (
            error.code === "auth/invalid-password" ||
            error.code === "auth/password-does-not-meet-requirements"
          ) {
            throw new PasswordRejectedError();
          }
        }
        throw error;
      }
    },
    deleteAuthUser: (uid) => auth.deleteUser(uid),
    async createUserDoc(uid, doc) {
      // create() ล้มเหลวถ้ามีเอกสารอยู่แล้ว — ไม่เขียนทับบัญชีที่ผู้ดูแลอนุมัติไว้
      await getFirestore().collection("users").doc(uid).create(doc);
    },
    createCustomToken: (uid) => auth.createCustomToken(uid),
    toolkit: createIdentityToolkit(webApiKey.value()),
    logError,
  });
  if (!result.ok) throw new HttpsError(result.code, result.message);
  return {message: result.message};
});

export const requestPasswordReset = onCall(async (request) => {
  return requestReset(request.data ?? {}, {
    toolkit: createIdentityToolkit(webApiKey.value()),
    logError,
  });
});

function toCallerAuth(request: {auth?: {uid: string; token: {email_verified?: boolean}}}): CallerAuth | undefined {
  if (!request.auth) return undefined;
  return {uid: request.auth.uid, emailVerified: request.auth.token.email_verified === true};
}

async function getCallerUser(uid: string): Promise<CallerUserDoc | undefined> {
  const snapshot = await getFirestore().collection("users").doc(uid).get();
  return snapshot.exists ? (snapshot.data() as CallerUserDoc) : undefined;
}

async function getPatient(patientId: string): Promise<{dataSource?: unknown} | undefined> {
  const snapshot = await getFirestore().collection("patients").doc(patientId).get();
  return snapshot.exists ? (snapshot.data() as {dataSource?: unknown}) : undefined;
}

async function writeAuditLog(entry: {userId: string; patientId: string; isAdminAccess: boolean}): Promise<void> {
  // เขียนผ่าน Admin SDK เท่านั้น (ข้าม Security Rules) — auditLogRecords เป็น append-only (NFR-06)
  await getFirestore().collection("auditLogRecords").add({
    userId: entry.userId,
    patientId: entry.patientId,
    action: "ดูข้อมูลผู้ป่วย",
    accessedAt: FieldValue.serverTimestamp(),
    isAdminAccess: entry.isAdminAccess,
  });
}

export const getNcdDiagnoses = onCall(async (request) => {
  const auth = toCallerAuth(request);
  const result = await getNcdDiagnosesLogic(request.data ?? {}, auth, {
    getCallerUser,
    getPatient,
    writeAuditLog,
    logError,
    async queryNcdDiagnoses(patientId): Promise<RawNcdDiagnosis[]> {
      const snapshot = await getFirestore()
        .collection("ncdDiagnoses")
        .where("patientId", "==", patientId)
        .orderBy("diagnosedAt", "desc")
        .get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          icd10Code: String(data.icd10Code),
          diagnosedAt: (data.diagnosedAt as Timestamp).toDate(),
          ...(data.note !== undefined ? {note: String(data.note)} : {}),
          dataSource: String(data.dataSource),
        };
      });
    },
  });
  if (!result.ok) throw new HttpsError(result.code, result.message);
  return result.data;
});

export const getLabResults = onCall(async (request) => {
  const auth = toCallerAuth(request);
  const result = await getLabResultsLogic(request.data ?? {}, auth, {
    getCallerUser,
    getPatient,
    writeAuditLog,
    logError,
    async queryLabResults(patientId, range): Promise<RawLabResult[]> {
      let firestoreQuery = getFirestore().collection("labResults").where("patientId", "==", patientId);
      if (range.start) firestoreQuery = firestoreQuery.where("testedAt", ">=", Timestamp.fromDate(range.start));
      if (range.end) firestoreQuery = firestoreQuery.where("testedAt", "<=", Timestamp.fromDate(range.end));
      const snapshot = await firestoreQuery.orderBy("testedAt", "desc").get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          testType: String(data.testType),
          value: Number(data.value),
          unit: String(data.unit),
          testedAt: (data.testedAt as Timestamp).toDate(),
          dataSource: String(data.dataSource),
        };
      });
    },
  });
  if (!result.ok) throw new HttpsError(result.code, result.message);
  return result.data;
});
