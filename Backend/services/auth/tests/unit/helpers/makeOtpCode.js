import { OtpCode } from "../../../src/domain/entities/OtpCode.js";

export function makeOtpCode({
  id = "otp-1",
  phone = "+989121234567",
  purpose,
  code = "123456",
  expiresAt = new Date(Date.now() + 5 * 60 * 1000),
  consumedAt = null
}) {
  return new OtpCode({
    id,
    phone,
    purpose,
    codeHash: `hashed:${code}`,
    expiresAt,
    consumedAt,
    createdAt: new Date("2026-01-01T00:00:00.000Z")
  });
}
