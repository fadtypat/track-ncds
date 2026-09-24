import {describe, expect, it} from "vitest";

import {checkPassword} from "../src/auth/passwordPolicy.js";

describe("checkPassword (NFR-17)", () => {
  it.each(["Passw0rd1", "abcdefg1", "รหัสผ่าน12", "1234567a"])("accepts %j", (password) => {
    expect(checkPassword(password)).toEqual([]);
  });

  it("reports every failed rule", () => {
    expect(checkPassword("")).toEqual(["minLength", "letter", "digit"]);
    expect(checkPassword("abcdefgh")).toEqual(["digit"]);
    expect(checkPassword("12345678")).toEqual(["letter"]);
    expect(checkPassword("abc1")).toEqual(["minLength"]);
    expect(checkPassword("a1".repeat(2049))).toEqual(["maxLength"]);
  });
});
