import {describe, expect, it, vi} from "vitest";

import {IdentityToolkit} from "../src/auth/identityToolkit.js";
import {
  INVALID_EMAIL,
  PASSWORD_POLICY_FAILED,
  SIGN_UP_ACCEPTED,
  TEMPORARILY_UNAVAILABLE,
} from "../src/auth/messages.js";
import {EmailAlreadyExistsError, signUp, SignUpDeps} from "../src/auth/signUp.js";

function makeDeps(overrides: Partial<SignUpDeps> = {}) {
  const toolkit: IdentityToolkit = {
    exchangeCustomToken: vi.fn(async () => "id-token"),
    sendVerificationEmail: vi.fn(async () => undefined),
    sendPasswordResetEmail: vi.fn(async () => undefined),
  };
  const deps: SignUpDeps = {
    createAuthUser: vi.fn(async () => "uid-1"),
    deleteAuthUser: vi.fn(async () => undefined),
    createUserDoc: vi.fn(async () => undefined),
    createCustomToken: vi.fn(async () => "custom-token"),
    toolkit,
    logError: vi.fn(),
    ...overrides,
  };
  return deps;
}

const valid = {email: " new@ncds-demo.local ", password: "Passw0rd1"};

describe("signUp (Operation 8)", () => {
  it("creates the account, a pending users doc, and sends the verification email", async () => {
    const deps = makeDeps();
    const result = await signUp(valid, deps);

    expect(result).toEqual({ok: true, message: SIGN_UP_ACCEPTED});
    expect(deps.createAuthUser).toHaveBeenCalledWith("new@ncds-demo.local", "Passw0rd1");
    expect(deps.createUserDoc).toHaveBeenCalledWith("uid-1", {
      displayName: "new@ncds-demo.local",
      isActive: false,
    });
    expect(deps.toolkit.exchangeCustomToken).toHaveBeenCalledWith("custom-token");
    expect(deps.toolkit.sendVerificationEmail).toHaveBeenCalledWith("id-token");
  });

  it("returns the same generic message for an existing email without sending anything (NFR-18)", async () => {
    const deps = makeDeps({
      createAuthUser: vi.fn(async () => {
        throw new EmailAlreadyExistsError();
      }),
    });
    const result = await signUp(valid, deps);

    expect(result).toEqual({ok: true, message: SIGN_UP_ACCEPTED});
    expect(deps.createUserDoc).not.toHaveBeenCalled();
    expect(deps.toolkit.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it.each(["short1", "passwordonly", "12345678", ""])(
    "rejects password %j before touching Authentication (NFR-17)",
    async (password) => {
      const deps = makeDeps();
      const result = await signUp({email: valid.email, password}, deps);

      expect(result).toEqual({
        ok: false,
        code: "invalid-argument",
        message: PASSWORD_POLICY_FAILED,
      });
      expect(deps.createAuthUser).not.toHaveBeenCalled();
    },
  );

  it.each(["", "not-an-email", "a@b", undefined])("rejects email %j", async (email) => {
    const deps = makeDeps();
    const result = await signUp({email, password: valid.password}, deps);

    expect(result).toEqual({ok: false, code: "invalid-argument", message: INVALID_EMAIL});
    expect(deps.createAuthUser).not.toHaveBeenCalled();
  });

  it("rolls back the Authentication account when the users doc write fails", async () => {
    const deps = makeDeps({
      createUserDoc: vi.fn(async () => {
        throw new Error("firestore down");
      }),
    });
    const result = await signUp(valid, deps);

    expect(result).toEqual({ok: false, code: "unavailable", message: TEMPORARILY_UNAVAILABLE});
    expect(deps.deleteAuthUser).toHaveBeenCalledWith("uid-1");
    expect(deps.toolkit.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("still reports success when only the verification email fails", async () => {
    const deps = makeDeps();
    vi.mocked(deps.toolkit.sendVerificationEmail).mockRejectedValue(new Error("smtp"));
    const result = await signUp(valid, deps);

    expect(result).toEqual({ok: true, message: SIGN_UP_ACCEPTED});
    expect(deps.deleteAuthUser).not.toHaveBeenCalled();
    expect(deps.logError).toHaveBeenCalled();
  });
});
