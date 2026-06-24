import request from "supertest";
import { describe, expect, it } from "vitest";

import {
  createBaseTestContext,
  createHttpTestApp,
  registerAdminAccessToken,
  registerPublicAccessToken
} from "./helpers/createTestAuthApp.js";

import { USER_ROLES } from "../../../src/domain/constants/roles.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { OTP_PURPOSES } from "../../../src/domain/constants/otpPurposes.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";
import { PUBLIC_AUTH_FLOWS } from "../../../src/domain/constants/authFlows.js";

function makePublicContext(overrides = {}) {
  const context = createBaseTestContext({
    users: overrides.users ?? [
      {
        id: "user-1",
        phone: "+989121234567",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi",
        roles: [USER_ROLES.CLIENT]
      }
    ],
    chefAccounts: overrides.chefAccounts || [],
    ...overrides
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

  it("requests OTP with selected public role", async () => {
    const { app, context } = makePublicContext();

    const response = await request(app)
      .post("/auth/request-otp")
      .send({
        phone: "09121234567",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "OTP sent successfully",
      phone: "+989121234567",
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.LOGIN
    });
    expect(context.otpSender.sentMessages).toEqual([
      {
        phone: "+989121234567",
        code: "123456",
        purpose: OTP_PURPOSES.PUBLIC_LOGIN
      }
    ]);
  });

  it("returns registration token for a new public user", async () => {
    const { app, context } = makePublicContext({ users: [] });

    await request(app)
      .post("/auth/request-otp")
      .send({
        phone: "09121234567",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.REGISTER
      });

    const verifyResponse = await request(app)
      .post("/auth/verify-otp")
      .send({
        phone: "09121234567",
        code: "123456",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.REGISTER
      });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body).toMatchObject({
      requiresRegistration: true,
      registrationToken: "registration-token-1",
      phone: "+989121234567",
      role: USER_ROLES.CLIENT,
      flow: PUBLIC_AUTH_FLOWS.REGISTER
    });
    expect(context.userRepository.createdUsers).toHaveLength(0);
  });

  it("completes client registration and creates a public session", async () => {
    const { app, context } = makePublicContext({ users: [] });

    await request(app)
      .post("/auth/request-otp")
      .send({
        phone: "09121234567",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.REGISTER
      });

    const verifyResponse = await request(app)
      .post("/auth/verify-otp")
      .send({
        phone: "09121234567",
        code: "123456",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.REGISTER
      });

    const completeResponse = await request(app)
      .post("/auth/register/complete")
      .send({
        registrationToken: verifyResponse.body.registrationToken,
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi"
      });

    expect(completeResponse.status).toBe(201);
    expect(completeResponse.body).toMatchObject({
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      user: {
        id: "user-1",
        phone: "+989121234567",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi",
        roles: [USER_ROLES.CLIENT],
        selectedRole: USER_ROLES.CLIENT
      }
    });
    expect(context.refreshTokenRepository.createdRefreshTokens).toHaveLength(1);
  });

  it("completes chef registration with active chef account", async () => {
    const { app, context } = makePublicContext({ users: [] });

    await request(app)
      .post("/auth/request-otp")
      .send({
        phone: "09121234567",
        role: USER_ROLES.CHEF,
        flow: PUBLIC_AUTH_FLOWS.REGISTER
      });

    const verifyResponse = await request(app)
      .post("/auth/verify-otp")
      .send({
        phone: "09121234567",
        code: "123456",
        role: USER_ROLES.CHEF,
        flow: PUBLIC_AUTH_FLOWS.REGISTER
      });

    const completeResponse = await request(app)
      .post("/auth/register/complete")
      .send({
        registrationToken: verifyResponse.body.registrationToken,
        firstName: "Sara",
        lastName: "Chef",
        username: "sara_chef"
      });

    expect(completeResponse.status).toBe(201);
    expect(completeResponse.body.user).toMatchObject({
      selectedRole: USER_ROLES.CHEF,
      chef: {
        status: CHEF_STATUS.ACTIVE
      }
    });
    expect(context.chefAccountRepository.createdChefAccounts[0]).toMatchObject({
      userId: "user-1",
      status: CHEF_STATUS.ACTIVE
    });
  });

  it("logs in an existing completed client", async () => {
    const { app, context } = makePublicContext();

    await request(app)
      .post("/auth/request-otp")
      .send({
        phone: "09121234567",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      });

    const verifyResponse = await request(app)
      .post("/auth/verify-otp")
      .send({
        phone: "09121234567",
        code: "123456",
        role: USER_ROLES.CLIENT,
        flow: PUBLIC_AUTH_FLOWS.LOGIN
      });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body).toMatchObject({
      requiresRegistration: false,
      accessToken: "access-token-1",
      refreshToken: "refresh-token-1",
      user: {
        id: "user-1",
        phone: "+989121234567",
        firstName: "Ali",
        lastName: "Ahmadi",
        username: "ali_ahmadi",
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
      firstName: "Ali",
      lastName: "Ahmadi",
      username: "ali_ahmadi",
      photoUrl: null,
      address: null,
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT
    });
  });

  it("updates public profile fields one by one", async () => {
    const { app, context } = makePublicContext();
    registerPublicAccessToken(context, "public-token");

    const firstNameResponse = await request(app)
      .patch("/auth/me/first-name")
      .set("Authorization", "Bearer public-token")
      .send({ firstName: "Reza" });

    expect(firstNameResponse.status).toBe(200);
    expect(firstNameResponse.body).toMatchObject({
      accessToken: "access-token-1",
      user: {
        id: "user-1",
        firstName: "Reza"
      }
    });

    const lastNameResponse = await request(app)
      .patch("/auth/me/last-name")
      .set("Authorization", "Bearer public-token")
      .send({ lastName: "Karimi" });

    expect(lastNameResponse.status).toBe(200);
    expect(lastNameResponse.body.user).toMatchObject({
      id: "user-1",
      lastName: "Karimi"
    });

    const usernameResponse = await request(app)
      .patch("/auth/me/username")
      .set("Authorization", "Bearer public-token")
      .send({ username: "reza_karimi" });

    expect(usernameResponse.status).toBe(200);
    expect(usernameResponse.body.user).toMatchObject({
      id: "user-1",
      username: "reza_karimi"
    });

    const photoUrlResponse = await request(app)
      .patch("/auth/me/photo-url")
      .set("Authorization", "Bearer public-token")
      .send({ photoUrl: "https://cdn.example.com/users/user-1/profile.jpg" });

    expect(photoUrlResponse.status).toBe(200);
    expect(photoUrlResponse.body.user).toMatchObject({
      id: "user-1",
      photoUrl: "https://cdn.example.com/users/user-1/profile.jpg"
    });

    const addressResponse = await request(app)
      .patch("/auth/me/address")
      .set("Authorization", "Bearer public-token")
      .send({ address: "Tehran, Vanak Square" });

    expect(addressResponse.status).toBe(200);
    expect(addressResponse.body.user).toMatchObject({
      id: "user-1",
      address: "Tehran, Vanak Square"
    });

    expect(context.userRepository.updatedProfileFields).toEqual([
      { userId: "user-1", field: "firstName", value: "Reza" },
      { userId: "user-1", field: "lastName", value: "Karimi" },
      { userId: "user-1", field: "username", value: "reza_karimi" },
      {
        userId: "user-1",
        field: "photoUrl",
        value: "https://cdn.example.com/users/user-1/profile.jpg"
      },
      { userId: "user-1", field: "address", value: "Tehran, Vanak Square" }
    ]);
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
      firstName: "Ali",
      lastName: "Ahmadi",
      username: "ali_ahmadi",
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
