import request from "supertest";
import { describe, expect, it } from "vitest";

import {
  createBaseTestContext,
  createHttpTestApp,
  registerAdminAccessToken,
  registerPublicAccessToken
} from "./helpers/createTestAuthApp.js";

import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

function makePublicContext() {
  const context = createBaseTestContext({
    users: [
      {
        id: "user-1",
        phone: "+989121234567",
        roles: [USER_ROLES.CLIENT]
      }
    ]
  });

  return {
    context,
    app: createHttpTestApp(context)
  };
}

describe("Public auth HTTP routes", () => {
  it("returns public auth health", async () => {
    const { app } = makePublicContext();

    const response = await request(app).get("/auth/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      service: "auth-service",
      scope: "public-auth",
      status: "ok"
    });
  });

  it("runs the public client OTP login flow through HTTP", async () => {
    const { app, context } = makePublicContext();

    const requestOtpResponse = await request(app)
      .post("/auth/request-otp")
      .send({ phone: "09121234567" });

    expect(requestOtpResponse.status).toBe(200);
    expect(requestOtpResponse.body.phone).toBe("+989121234567");
    expect(context.otpSender.sentMessages).toEqual([
      {
        phone: "+989121234567",
        code: "123456",
        purpose: OTP_PURPOSES.PUBLIC_LOGIN
      }
    ]);

    const verifyResponse = await request(app)
      .post("/auth/verify-otp")
      .send({ phone: "09121234567", code: "123456", role: USER_ROLES.CLIENT });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      user: {
        id: "user-1",
        phone: "+989121234567",
        roles: [USER_ROLES.CLIENT],
        selectedRole: USER_ROLES.CLIENT
      }
    });
    expect(context.refreshTokenRepository.createdRefreshTokens).toHaveLength(1);
  });

  it("rejects admin tokens on public auth routes", async () => {
    const { app, context } = makePublicContext();
    registerAdminAccessToken(context, "manager-token");

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer manager-token");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns current public user from bearer token", async () => {
    const { app, context } = makePublicContext();
    registerPublicAccessToken(context, "public-token");

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer public-token");

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: "user-1",
      phone: "+989121234567",
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT
    });
  });

  it("changes public user phone with OTP and revokes previous refresh tokens", async () => {
    const { app, context } = makePublicContext();
    registerPublicAccessToken(context, "public-token");

    await context.refreshTokenRepository.create({
      id: "old-public-refresh",
      ownerId: "user-1",
      ownerType: TOKEN_OWNER_TYPES.USER,
      scope: "public",
      selectedRole: USER_ROLES.CLIENT,
      tokenHash: "hash:old-refresh",
      expiresAt: new Date(Date.now() + 60_000)
    });

    const requestOtpResponse = await request(app)
      .post("/auth/change-phone/request-otp")
      .set("Authorization", "Bearer public-token")
      .send({ newPhone: "09127778888" });

    expect(requestOtpResponse.status).toBe(200);
    expect(requestOtpResponse.body.newPhone).toBe("+989127778888");
    expect(context.otpSender.sentMessages.at(-1)).toMatchObject({
      phone: "+989127778888",
      code: "123456",
      purpose: OTP_PURPOSES.PUBLIC_CHANGE_PHONE
    });

    const verifyResponse = await request(app)
      .post("/auth/change-phone/verify")
      .set("Authorization", "Bearer public-token")
      .send({ newPhone: "09127778888", code: "123456" });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.user).toMatchObject({
      id: "user-1",
      phone: "+989127778888",
      selectedRole: USER_ROLES.CLIENT
    });
    expect(context.userRepository.updatedPhones).toEqual([
      { userId: "user-1", newPhone: "+989127778888" }
    ]);
    expect(context.refreshTokenRepository.revokedOwners).toContainEqual({
      ownerId: "user-1",
      ownerType: TOKEN_OWNER_TYPES.USER
    });
  });

  it("logs out by revoking the provided refresh token", async () => {
    const { app, context } = makePublicContext();

    await context.refreshTokenRepository.create({
      id: "refresh-logout",
      ownerId: "user-1",
      ownerType: TOKEN_OWNER_TYPES.USER,
      scope: "public",
      selectedRole: USER_ROLES.CLIENT,
      tokenHash: "hash:refresh-token-to-logout",
      expiresAt: new Date(Date.now() + 60_000)
    });

    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "refresh-token-to-logout" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Logged out successfully",
      success: true
    });
    expect(context.refreshTokenRepository.revokedIds).toEqual(["refresh-logout"]);
  });
});
