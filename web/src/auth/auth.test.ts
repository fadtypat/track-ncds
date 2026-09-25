import {FirebaseError} from "firebase/app";
import {describe, expect, it} from "vitest";

import {
  GENERIC_ERROR,
  INVALID_EMAIL,
  LOGIN_FAILED,
  PASSWORD_POLICY_FAILED,
  SIGN_UP_DISABLED,
  TOO_MANY_ATTEMPTS,
  callableErrorMessage,
  loginErrorMessage,
  signUpErrorMessage,
} from "./errors";
import {isPasswordValid, passwordRules} from "./passwordPolicy";

describe("passwordRules (NFR-17, mirrors functions/src/auth/passwordPolicy.ts)", () => {
  it.each(["Passw0rd1", "abcdefg1", "รหัสผ่าน12"])("accepts %j", (password) => {
    expect(isPasswordValid(password)).toBe(true);
  });

  it("marks each unmet rule", () => {
    const met = (password: string) => passwordRules(password).map((rule) => rule.met);
    expect(met("")).toEqual([false, false, false]);
    expect(met("abcdefgh")).toEqual([true, true, false]);
    expect(met("12345678")).toEqual([true, false, true]);
  });
});

describe("loginErrorMessage (NFR-18)", () => {
  it.each(["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password", "auth/user-disabled", "auth/invalid-email"])(
    "maps %s to the same generic message",
    (code) => {
      expect(loginErrorMessage(new FirebaseError(code, "x"))).toBe(LOGIN_FAILED);
    },
  );

  it("keeps rate limiting distinguishable", () => {
    expect(loginErrorMessage(new FirebaseError("auth/too-many-requests", "x"))).toBe(TOO_MANY_ATTEMPTS);
  });
});

describe("signUpErrorMessage", () => {
  it.each([
    ["auth/invalid-email", INVALID_EMAIL],
    ["auth/weak-password", PASSWORD_POLICY_FAILED],
    ["auth/operation-not-allowed", SIGN_UP_DISABLED],
    ["auth/internal-error", GENERIC_ERROR],
  ])("maps %s", (code, message) => {
    expect(signUpErrorMessage(new FirebaseError(code, "x"))).toBe(message);
  });
});

describe("callableErrorMessage", () => {
  it("passes through the server's Thai message for invalid-argument", () => {
    expect(callableErrorMessage(new FirebaseError("functions/invalid-argument", "รหัสผ่านสั้นไป"))).toBe("รหัสผ่านสั้นไป");
  });

  it("hides unexpected errors", () => {
    expect(callableErrorMessage(new FirebaseError("functions/internal", "stack trace"))).toBe(GENERIC_ERROR);
  });
});
