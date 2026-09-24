// Admin SDK สร้างได้แค่ลิงก์ (generate*Link) แต่ส่งอีเมลเองไม่ได้ — จึงเรียก Identity Toolkit REST
// (accounts:sendOobCode) ให้ Firebase ส่งด้วยเทมเพลตเริ่มต้นภาษาไทย (technology-stack decision area 15)

export interface IdentityToolkit {
  exchangeCustomToken(customToken: string): Promise<string>;
  sendVerificationEmail(idToken: string): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
}

const EMAIL_LOCALE = "th";

function baseUrl(): string {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  return emulatorHost ?
    `http://${emulatorHost}/identitytoolkit.googleapis.com/v1` :
    "https://identitytoolkit.googleapis.com/v1";
}

export function createIdentityToolkit(apiKey: string): IdentityToolkit {
  async function post(method: string, body: object): Promise<Record<string, unknown>> {
    const res = await fetch(`${baseUrl()}/${method}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {"Content-Type": "application/json", "X-Firebase-Locale": EMAIL_LOCALE},
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const error = json.error as {message?: string} | undefined;
      throw new Error(`Identity Toolkit ${method} failed: ${error?.message ?? res.status}`);
    }
    return json;
  }

  return {
    async exchangeCustomToken(customToken) {
      const json = await post("accounts:signInWithCustomToken", {
        token: customToken,
        returnSecureToken: true,
      });
      if (typeof json.idToken !== "string") {
        throw new Error("Identity Toolkit signInWithCustomToken returned no idToken");
      }
      return json.idToken;
    },
    async sendVerificationEmail(idToken) {
      await post("accounts:sendOobCode", {requestType: "VERIFY_EMAIL", idToken});
    },
    async sendPasswordResetEmail(email) {
      await post("accounts:sendOobCode", {requestType: "PASSWORD_RESET", email});
    },
  };
}
