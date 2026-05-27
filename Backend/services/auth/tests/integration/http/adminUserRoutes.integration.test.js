import request from "supertest";
import { describe, expect, it } from "vitest";

import {
  createBaseTestContext,
  createHttpTestApp,
  registerAdminAccessToken
} from "./helpers/createTestAuthApp.js";

import { ADMIN_ROLES } from "../../../src/domain/constants/roles.js";
import { ADMIN_STATUS } from "../../../src/domain/constants/statuses.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

function makeAdminUsersContext() {
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

describe("Admin user HTTP routes", () => {
  it("requires authentication for admin user management", async () => {
    const { app } = makeAdminUsersContext();

    const response = await request(app)
      .post("/admin/admin-users")
      .send({ phone: "09124445555" });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects normal admin access to manager-only routes", async () => {
    const { app, context } = makeAdminUsersContext();
    registerAdminAccessToken(context, "admin-token", {
      sub: "admin-1",
      phone: "+989121111111",
      role: ADMIN_ROLES.ADMIN,
      isManager: false
    });

    const response = await request(app)
      .post("/admin/admin-users")
      .set("Authorization", "Bearer admin-token")
      .send({ phone: "09124445555" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("lets manager add and list admin users through HTTP", async () => {
    const { app, context } = makeAdminUsersContext();
    registerAdminAccessToken(context, "manager-token");

    const addResponse = await request(app)
      .post("/admin/admin-users")
      .set("Authorization", "Bearer manager-token")
      .send({ phone: "09124445555" });

    expect(addResponse.status).toBe(201);
    expect(addResponse.body.admin).toMatchObject({
      phone: "+989124445555",
      role: ADMIN_ROLES.ADMIN,
      status: ADMIN_STATUS.ACTIVE,
      createdBy: "manager-1"
    });

    const listResponse = await request(app)
      .get("/admin/admin-users")
      .set("Authorization", "Bearer manager-token");

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.admins.map((admin) => admin.phone)).toContain("+989124445555");
  });

  it("changes a normal admin phone and revokes its refresh tokens", async () => {
    const { app, context } = makeAdminUsersContext();
    registerAdminAccessToken(context, "manager-token");

    await context.refreshTokenRepository.create({
      id: "old-admin-refresh",
      ownerId: "admin-1",
      ownerType: TOKEN_OWNER_TYPES.ADMIN,
      scope: "admin",
      selectedRole: ADMIN_ROLES.ADMIN,
      tokenHash: "hash:old-refresh",
      expiresAt: new Date(Date.now() + 60_000)
    });

    const response = await request(app)
      .patch("/admin/admin-users/admin-1/phone")
      .set("Authorization", "Bearer manager-token")
      .send({ newPhone: "09125556666" });

    expect(response.status).toBe(200);
    expect(response.body.admin).toMatchObject({
      id: "admin-1",
      phone: "+989125556666",
      role: ADMIN_ROLES.ADMIN,
      status: ADMIN_STATUS.ACTIVE
    });
    expect(context.refreshTokenRepository.revokedOwners).toContainEqual({
      ownerId: "admin-1",
      ownerType: TOKEN_OWNER_TYPES.ADMIN
    });
  });

  it("does not let manager change its own phone from admin user management route", async () => {
    const { app, context } = makeAdminUsersContext();
    registerAdminAccessToken(context, "manager-token");

    const response = await request(app)
      .patch("/admin/admin-users/manager-1/phone")
      .set("Authorization", "Bearer manager-token")
      .send({ newPhone: "09125556666" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("CANNOT_CHANGE_SELF_PHONE");
  });

  it("disables a normal admin user", async () => {
    const { app, context } = makeAdminUsersContext();
    registerAdminAccessToken(context, "manager-token");

    const response = await request(app)
      .patch("/admin/admin-users/admin-1/disable")
      .set("Authorization", "Bearer manager-token");

    expect(response.status).toBe(200);
    expect(response.body.admin).toMatchObject({
      id: "admin-1",
      status: ADMIN_STATUS.DISABLED
    });
    expect(context.adminUserRepository.disabledIds).toEqual(["admin-1"]);
  });
});
