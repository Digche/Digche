import { describe, expect, it } from "vitest";

import { PhoneNumber } from "../../../src/domain/value-objects/PhoneNumber.js";


describe("PhoneNumber", () => {
  it("normalizes local Iranian mobile numbers", () => {
    expect(PhoneNumber.normalize("0912 123 4567")).toBe("+989121234567");
    expect(PhoneNumber.normalize("0912-123-4567")).toBe("+989121234567");
  });

  it("normalizes international Iranian mobile numbers", () => {
    expect(PhoneNumber.normalize("989121234567")).toBe("+989121234567");
    expect(PhoneNumber.normalize("00989121234567")).toBe("+989121234567");
    expect(PhoneNumber.normalize("+989121234567")).toBe("+989121234567");
  });

  it("converts Persian and Arabic digits", () => {
    expect(PhoneNumber.normalize("۰۹۱۲۱۲۳۴۵۶۷")).toBe("+989121234567");
    expect(PhoneNumber.normalize("٠٩١٢١٢٣٤٥٦٧")).toBe("+989121234567");
  });

  it("rejects invalid mobile numbers", () => {
    expect(() => PhoneNumber.normalize("02112345678")).toThrow("Invalid Iranian mobile number");
    expect(() => PhoneNumber.normalize("0912123")).toThrow("Invalid Iranian mobile number");
  });
});
