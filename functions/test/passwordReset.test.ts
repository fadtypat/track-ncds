import {describe, expect, it, vi} from "vitest";

import {PASSWORD_RESET_ACCEPTED} from "../src/auth/messages.js";
import {requestReset} from "../src/auth/passwordReset.js";

function makeDeps(send: () => Promise<void>) {
  return {
    toolkit: {
      exchangeCustomToken: vi.fn(),
      sendVerificationEmail: vi.fn(),
      sendPasswordResetEmail: vi.fn(send),
    },
    logError: vi.fn(),
  };
}

describe("requestReset (Operation 9a)", () => {
  it("sends the reset email and returns the generic message", async () => {
    const deps = makeDeps(async () => undefined);
    const result = await requestReset({email: " doctor@ncds-demo.local "}, deps);

    expect(result).toEqual({message: PASSWORD_RESET_ACCEPTED});
    expect(deps.toolkit.sendPasswordResetEmail).toHaveBeenCalledWith("doctor@ncds-demo.local");
  });

  it("returns the same message when the email has no account (NFR-18)", async () => {
    const deps = makeDeps(async () => {
      throw new Error("EMAIL_NOT_FOUND");
    });
    const result = await requestReset({email: "nobody@ncds-demo.local"}, deps);

    expect(result).toEqual({message: PASSWORD_RESET_ACCEPTED});
  });

  it("returns the same message for an empty email without calling Authentication", async () => {
    const deps = makeDeps(async () => undefined);
    const result = await requestReset({}, deps);

    expect(result).toEqual({message: PASSWORD_RESET_ACCEPTED});
    expect(deps.toolkit.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});
