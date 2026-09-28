import {describe, expect, it, vi} from "vitest";

// ทดสอบเฉพาะกฎของ Operation 11 — ไม่ต่อ Firebase จริง
vi.mock("../firebase", () => ({db: {}}));

import {checkApproval, isPendingApproval} from "./accountApproval";

describe("isPendingApproval (FR-08)", () => {
  it.each([
    [{isActive: false}, true],
    [{isActive: false, role: null}, true],
    [{isActive: false, role: ""}, true],
    [{isActive: false, role: "แพทย์"}, false],
    [{isActive: true}, false],
    [undefined, false],
  ])("%j → %s", (data, expected) => {
    expect(isPendingApproval(data)).toBe(expected);
  });
});

describe("checkApproval (Operation 11, FR-11)", () => {
  const pending = {isActive: false};

  it.each(["แพทย์", "พยาบาล"])("allows approving a pending account as %s", (role) => {
    expect(checkApproval(pending, role, "target", "admin-uid")).toBeNull();
  });

  it("rejects the admin role — admin is only assignable through Operation 12", () => {
    expect(checkApproval(pending, "admin", "target", "admin-uid")).toBe("invalid-role");
  });

  it("rejects a missing target", () => {
    expect(checkApproval(undefined, "แพทย์", "target", "admin-uid")).toBe("not-found");
  });

  it("rejects an account that already has a role", () => {
    expect(checkApproval({isActive: false, role: "พยาบาล"}, "แพทย์", "target", "admin-uid")).toBe("already-approved");
  });

  it("rejects approving one's own account", () => {
    expect(checkApproval(pending, "แพทย์", "admin-uid", "admin-uid")).toBe("self");
  });
});
