import { describe, expect, it, vi } from "vitest";

import { createAdminAuthMiddleware } from "../../../../src/interfaces/http/middlewares/adminAuthMiddleware.js";
import { createPublicAuthMiddleware } from "../../../../src/interfaces/http/middlewares/publicAuthMiddleware.js";
import { requireAdminRole } from "../../../../src/interfaces/http/middlewares/requireAdminRole.js";
import { requireRole } from "../../../../src/interfaces/http/middlewares/requireRole.js";
import { AUTH_SCOPES } from "../../../../src/domain/constants/authScopes.js";
import { ADMIN_ROLES, USER_ROLES } from "../../../../src/domain/constants/roles.js";
import { ADMIN_STATUS, CHEF_STATUS } from "../../../../src/domain/constants/statuses.js";

import { FakeTokenService } from "../../fakes/FakeTokenService.js";
import { FakeAdminUserRepository } from "../../fakes/FakeAdminUserRepository.js";
import { FakeChefAccountRepository } from "../../fakes/FakeChefAccountRepository.js";
import { FakeUserRepository } from "../../fakes/FakeUserRepository.js";

function makeReq({ authorization, auth } = {}) {
  return {
    headers: authorization ? { authorization } : {},
    auth
  };
}

async function runMiddleware(middleware, req) {
  const next = vi.fn();
  await middleware(req, {}, next);
  return next;
}

describe("auth middlewares", () => {
  it("sets req.auth for valid admin access tokens", async () => {
    const tokenService = new FakeTokenService();
    const adminUserRepository = new FakeAdminUserRepository({
      adminUsers: [
        {
          id: "admin-1",
          phone: "+989121234567",
          role: ADMIN_ROLES.MANAGER,
          status: ADMIN_STATUS.ACTIVE
        }
      ]
    });
    tokenService.registerAccessToken("admin-token", {
      sub: "admin-1",
      phone: "+989121234567",
      role: ADMIN_ROLES.MANAGER,
      isManager: true,
      scope: AUTH_SCOPES.ADMIN,
      tokenVersion: 0
    });

    const req = makeReq({ authorization: "Bearer admin-token" });
    const next = await runMiddleware(
      createAdminAuthMiddleware({ tokenService, adminUserRepository }),
      req
    );

    expect(next).toHaveBeenCalledWith();
    expect(req.auth).toMatchObject({
      scope: AUTH_SCOPES.ADMIN,
      adminId: "admin-1",
      phone: "+989121234567",
      role: ADMIN_ROLES.MANAGER,
      isManager: true
    });
  });

  it("rejects public token on admin middleware", async () => {
    const tokenService = new FakeTokenService();
    tokenService.registerAccessToken("public-token", {
      sub: "user-1",
      scope: AUTH_SCOPES.PUBLIC
    });

    const req = makeReq({ authorization: "Bearer public-token" });
    const next = await runMiddleware(
      createAdminAuthMiddleware({
        tokenService,
        adminUserRepository: new FakeAdminUserRepository()
      }),
      req
    );

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("sets req.auth for valid public access tokens", async () => {
    const tokenService = new FakeTokenService();
    const userRepository = new FakeUserRepository({
      users: [
        {
          id: "user-1",
          phone: "+989121234567",
          firstName: "Ali",
          lastName: "Ahmadi",
          username: "ali_ahmadi",
          roles: [USER_ROLES.CLIENT]
        }
      ]
    });
    const chefAccountRepository = new FakeChefAccountRepository();
    tokenService.registerAccessToken("public-token", {
      sub: "user-1",
      phone: "+989121234567",
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT,
      scope: AUTH_SCOPES.PUBLIC,
      tokenVersion: 0
    });

    const req = makeReq({ authorization: "Bearer public-token" });
    const next = await runMiddleware(
      createPublicAuthMiddleware({
        tokenService,
        userRepository,
        chefAccountRepository
      }),
      req
    );

    expect(next).toHaveBeenCalledWith();
    expect(req.auth).toMatchObject({
      scope: AUTH_SCOPES.PUBLIC,
      userId: "user-1",
      phone: "+989121234567",
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT
    });
  });

  it("rejects admin token on public middleware", async () => {
    const tokenService = new FakeTokenService();
    tokenService.registerAccessToken("admin-token", {
      sub: "admin-1",
      scope: AUTH_SCOPES.ADMIN
    });

    const req = makeReq({ authorization: "Bearer admin-token" });
    const next = await runMiddleware(
      createPublicAuthMiddleware({
        tokenService,
        userRepository: new FakeUserRepository(),
        chefAccountRepository: new FakeChefAccountRepository()
      }),
      req
    );

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("requires admin role", async () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.ADMIN,
        role: ADMIN_ROLES.MANAGER
      }
    });

    const next = await runMiddleware(requireAdminRole(ADMIN_ROLES.MANAGER), req);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks disallowed admin role", async () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.ADMIN,
        role: ADMIN_ROLES.ADMIN
      }
    });

    const next = await runMiddleware(requireAdminRole(ADMIN_ROLES.MANAGER), req);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("requires selected public role", async () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole: USER_ROLES.CHEF
      }
    });

    const next = await runMiddleware(requireRole(USER_ROLES.CHEF), req);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks disallowed public role", async () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole: USER_ROLES.CLIENT
      }
    });

    const next = await runMiddleware(requireRole(USER_ROLES.CHEF), req);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });
});
