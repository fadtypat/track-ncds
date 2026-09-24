import {initializeApp} from "firebase-admin/app";
import {FirebaseAuthError, getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
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
