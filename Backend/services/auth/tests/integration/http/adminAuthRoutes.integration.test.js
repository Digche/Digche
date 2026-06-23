import request from "supertest";
import { describe, expect, it } from "vitest";

import {
  createBaseTestContext,
  createHttpTestApp,
  registerAdminAccessToken,
  registerPublicAccessToken
} from "./helpers/createTestAuthApp.js";

import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

function makeAdminContext() {
  const context = createBaseTestContext({
    adminUsers: [
      {
        id: "manager-1",
        phone: "+989120000000",
        role: ADMIN_ROLES.MANAGER,
        status: ADMIN_STATUS.ACTIVE
      },
      {
        id: "admin-1",
        phone: "+989121111111",
        role: ADMIN_ROLES.ADMIN,
        status: ADMIN_STATUS.ACTIVE,
        createdBy: "manager-1"
      }
    ]
  });

  return {
    context,
    app: createHttpTestApp(context)
  };
}

describe("Admin auth HTTP routes", () => {
  it("returns admin auth health", async () => {
    const { app } = makeAdminContext();

    const response = await request(app).get("/admin/auth/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      service: "auth-service",
      scope: "admin-auth",
      status: "ok"
    });
  });

  it("runs the manager OTP login flow through HTTP", async () => {
    const { app, context } = makeAdminContext();

    const requestOtpResponse = await request(app)
      .post("/admin/auth/request-otp")
      .send({ phone: "09120000000" });

    expect(requestOtpResponse.status).toBe(200);
    expect(requestOtpResponse.body.phone).toBe("+989120000000");
    expect(context.otpSender.sentMessages).toEqual([
      {
        phone: "+989120000000",
        code: "123456",
        purpose: OTP_PURPOSES.ADMIN_LOGIN
      }
    ]);

    const verifyResponse = await request(app)
      .post("/admin/auth/verify-otp")
      .send({ phone: "09120000000", code: "123456" });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      admin: {
        id: "manager-1",
        phone: "+989120000000",
        role: ADMIN_ROLES.MANAGER,
        isManager: true
      }
    });
    expect(context.refreshTokenRepository.createdRefreshTokens).toHaveLength(1);
  });

  it("rejects admin OTP request for a phone outside admin_users", async () => {
    const { app } = makeAdminContext();

    const response = await request(app)
      .post("/admin/auth/request-otp")
      .send({ phone: "09129999999" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns current admin from the bearer token", async () => {
    const { app, context } = makeAdminContext();
    registerAdminAccessToken(context, "manager-token");

    const response = await request(app)
      .get("/admin/auth/me")
      .set("Authorization", "Bearer manager-token");

    expect(response.status).toBe(200);
    expect(response.body.admin).toEqual({
      id: "manager-1",
      phone: "+989120000000",
      firstName: null,
      lastName: null,
      username: null,
      role: ADMIN_ROLES.MANAGER,
      profileImageUrl: null,
      isManager: true
    });
  });

  it("updates admin profile fields one by one", async () => {
    const { app, context } = makeAdminContext();
    registerAdminAccessToken(context, "manager-token");

    const firstNameResponse = await request(app)
      .patch("/admin/auth/me/first-name")
      .set("Authorization", "Bearer manager-token")
      .send({ firstName: "Sara" });

    expect(firstNameResponse.status).toBe(200);
    expect(firstNameResponse.body).toMatchObject({
      accessToken: "access-token-1",
      admin: {
        id: "manager-1",
        firstName: "Sara"
      }
    });

    const lastNameResponse = await request(app)
      .patch("/admin/auth/me/last-name")
      .set("Authorization", "Bearer manager-token")
      .send({ lastName: "Mohammadi" });

    expect(lastNameResponse.status).toBe(200);
    expect(lastNameResponse.body.admin).toMatchObject({
      id: "manager-1",
      lastName: "Mohammadi"
    });

    const usernameResponse = await request(app)
      .patch("/admin/auth/me/username")
      .set("Authorization", "Bearer manager-token")
      .send({ username: "sara_manager" });

    expect(usernameResponse.status).toBe(200);
    expect(usernameResponse.body.admin).toMatchObject({
      id: "manager-1",
      username: "sara_manager"
    });

    expect(context.adminUserRepository.updatedProfileFields).toEqual([
      { id: "manager-1", field: "firstName", value: "Sara" },
      { id: "manager-1", field: "lastName", value: "Mohammadi" },
      { id: "manager-1", field: "username", value: "sara_manager" }
    ]);
  });

  it("rejects public tokens on admin auth routes", async () => {
    const { app, context } = makeAdminContext();
    registerPublicAccessToken(context, "public-token");

    const response = await request(app)
      .get("/admin/auth/me")
      .set("Authorization", "Bearer public-token");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("allows only manager to request manager phone change OTP", async () => {
    const { app, context } = makeAdminContext();
    registerAdminAccessToken(context, "admin-token", {
      sub: "admin-1",
      phone: "+989121111111",
      role: ADMIN_ROLES.ADMIN,
      isManager: false
    });

    const response = await request(app)
      .post("/admin/auth/change-phone/request-otp")
      .set("Authorization", "Bearer admin-token")
      .send({ newPhone: "09123334444" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("changes manager phone with OTP and revokes previous refresh tokens", async () => {
    const { app, context } = makeAdminContext();
    registerAdminAccessToken(context, "manager-token");

    await context.refreshTokenRepository.create({
      id: "old-manager-refresh",
      ownerId: "manager-1",
      ownerType: TOKEN_OWNER_TYPES.ADMIN,
      scope: "admin",
      selectedRole: ADMIN_ROLES.MANAGER,
      tokenHash: "hash:old-refresh",
      expiresAt: new Date(Date.now() + 60_000)
    });

    const requestOtpResponse = await request(app)
      .post("/admin/auth/change-phone/request-otp")
      .set("Authorization", "Bearer manager-token")
      .send({ newPhone: "09123334444" });

    expect(requestOtpResponse.status).toBe(200);
    expect(requestOtpResponse.body.newPhone).toBe("+989123334444");
    expect(context.otpSender.sentMessages.at(-1)).toMatchObject({
      phone: "+989123334444",
      code: "123456",
      purpose: OTP_PURPOSES.ADMIN_CHANGE_PHONE
    });

    const verifyResponse = await request(app)
      .post("/admin/auth/change-phone/verify")
      .set("Authorization", "Bearer manager-token")
      .send({ newPhone: "09123334444", code: "123456" });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.admin).toMatchObject({
      id: "manager-1",
      phone: "+989123334444",
      role: ADMIN_ROLES.MANAGER,
      isManager: true
    });
    expect(context.adminUserRepository.updatedPhones).toEqual([
      { id: "manager-1", newPhone: "+989123334444" }
    ]);
    expect(context.refreshTokenRepository.revokedOwners).toContainEqual({
      ownerId: "manager-1",
      ownerType: TOKEN_OWNER_TYPES.ADMIN
    });
  });
});
