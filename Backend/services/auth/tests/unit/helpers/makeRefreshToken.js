import { RefreshToken } from "../../../src/domain/entities/RefreshToken.js";

export function makeRefreshToken({
  id = "refresh-1",
  ownerId,
  ownerType,
  scope,
  selectedRole = null,
  token = "refresh-token-1",
  expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  revokedAt = null
}) {
  return new RefreshToken({
    id,
    ownerId,
    ownerType,
    scope,
    selectedRole,
    tokenHash: `hash:${token}`,
    expiresAt,
    revokedAt,
    createdAt: new Date("2026-01-01T00:00:00.000Z")
  });
}
