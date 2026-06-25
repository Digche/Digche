import request from "supertest";
import { describe, expect, it } from "vitest";

import {
  createBaseTestContext,
  createHttpTestApp,
  registerAdminAccessToken
} from "./helpers/createTestAuthApp.js";

import { ADMIN_ROLES, USER_ROLES } from "../../../src/domain/constants/roles.js";
import { CHEF_STATUS } from "../../../src/domain/constants/statuses.js";
import { TOKEN_OWNER_TYPES } from "../../../src/domain/constants/tokenOwnerTypes.js";

function makeChefAdminContext() {
  const context = createBaseTestContext({
    chefAccounts: [
      {
        id: "chef-1",
        userId: "user-1",
        status: CHEF_STATUS.ACTIVE,
        user: {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Sara",
          lastName: "Chef",
          username: "sara_chef",
          photoUrl: "https://cdn.example.com/users/user-1/profile.jpg",
          address: "Tehran",
          roles: [USER_ROLES.CHEF]
        }
      }
    ]
  });

  return {
    context,
    app: createHttpTestApp(context)
  };
}

describe("Chef admin HTTP routes", () => {
  it("requires authentication for chef management", async () => {
    const { app } = makeChefAdminContext();

    const response = await request(app).get("/admin/chefs");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("lets normal admin list all chefs with details", async () => {
    const { app, context } = makeChefAdminContext();
    registerAdminAccessToken(context, "admin-token", {
      sub: "admin-1",
      role: ADMIN_ROLES.ADMIN,
      isManager: false
    });

    const response = await request(app)
      .get("/admin/chefs")
      .set("Authorization", "Bearer admin-token");

    expect(response.status).toBe(200);
    expect(response.body.chefs).toHaveLength(1);
    expect(response.body.chefs[0]).toMatchObject({
      id: "chef-1",
      userId: "user-1",
      status: CHEF_STATUS.ACTIVE,
      user: {
        id: "user-1",
        phone: "+989121234567",
        username: "sara_chef",
        roles: [USER_ROLES.CHEF]
      }
    });
  });

  it("lets manager suspend and activate a chef", async () => {
    const { app, context } = makeChefAdminContext();
    registerAdminAccessToken(context, "manager-token");

    await context.refreshTokenRepository.create({
      id: "chef-refresh",
      ownerId: "user-1",
      ownerType: TOKEN_OWNER_TYPES.USER,
      selectedRole: USER_ROLES.CHEF
    });

    const suspendResponse = await request(app)
      .patch("/admin/chefs/user-1/suspend")
      .set("Authorization", "Bearer manager-token");

    expect(suspendResponse.status).toBe(200);
    expect(suspendResponse.body.chef).toMatchObject({
      userId: "user-1",
      status: CHEF_STATUS.SUSPENDED
    });
    expect(context.refreshTokenRepository.revokedIds).toEqual(["chef-refresh"]);

    const activateResponse = await request(app)
      .patch("/admin/chefs/user-1/activate")
      .set("Authorization", "Bearer manager-token");

    expect(activateResponse.status).toBe(200);
    expect(activateResponse.body.chef).toMatchObject({
      userId: "user-1",
      status: CHEF_STATUS.ACTIVE
    });
  });
});
