import { describe, expect, it, vi } from "vitest";

import { createAdminAuthMiddleware } from "../../../../src/interfaces/http/middlewares/adminAuthMiddleware.js";
import { createPublicAuthMiddleware } from "../../../../src/interfaces/http/middlewares/publicAuthMiddleware.js";
import { requireAdminRole } from "../../../../src/interfaces/http/middlewares/requireAdminRole.js";
import { requireRole } from "../../../../src/interfaces/http/middlewares/requireRole.js";
import { AUTH_SCOPES } from "../../../../src/domain/constants/authScopes.js";
import { ADMIN_ROLES, USER_ROLES } from "../../../../src/domain/constants/roles.js";

import { FakeTokenService } from "../../fakes/FakeTokenService.js";

function makeReq({ authorization, auth } = {}) {
  return {
    headers: authorization ? { authorization } : {},
    auth
  };
}

function runMiddleware(middleware, req) {
  const next = vi.fn();
  middleware(req, {}, next);
  return next;
}

describe("auth middlewares", () => {
  it("sets req.auth for valid admin access tokens", () => {
    const tokenService = new FakeTokenService();
    tokenService.registerAccessToken("admin-token", {
      sub: "admin-1",
      phone: "+989121234567",
      role: ADMIN_ROLES.MANAGER,
      isManager: true,
      scope: AUTH_SCOPES.ADMIN
    });

    const req = makeReq({ authorization: "Bearer admin-token" });
    const next = runMiddleware(createAdminAuthMiddleware({ tokenService }), req);

    expect(next).toHaveBeenCalledWith();
    expect(req.auth).toMatchObject({
      scope: AUTH_SCOPES.ADMIN,
      adminId: "admin-1",
      phone: "+989121234567",
      role: ADMIN_ROLES.MANAGER,
      isManager: true
    });
  });

  it("rejects public token on admin middleware", () => {
    const tokenService = new FakeTokenService();
    tokenService.registerAccessToken("public-token", {
      sub: "user-1",
      scope: AUTH_SCOPES.PUBLIC
    });

    const req = makeReq({ authorization: "Bearer public-token" });
    const next = runMiddleware(createAdminAuthMiddleware({ tokenService }), req);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("sets req.auth for valid public access tokens", () => {
    const tokenService = new FakeTokenService();
    tokenService.registerAccessToken("public-token", {
      sub: "user-1",
      phone: "+989121234567",
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT,
      scope: AUTH_SCOPES.PUBLIC
    });

    const req = makeReq({ authorization: "Bearer public-token" });
    const next = runMiddleware(createPublicAuthMiddleware({ tokenService }), req);

    expect(next).toHaveBeenCalledWith();
    expect(req.auth).toMatchObject({
      scope: AUTH_SCOPES.PUBLIC,
      userId: "user-1",
      phone: "+989121234567",
      roles: [USER_ROLES.CLIENT],
      selectedRole: USER_ROLES.CLIENT
    });
  });

  it("rejects admin token on public middleware", () => {
    const tokenService = new FakeTokenService();
    tokenService.registerAccessToken("admin-token", {
      sub: "admin-1",
      scope: AUTH_SCOPES.ADMIN
    });

    const req = makeReq({ authorization: "Bearer admin-token" });
    const next = runMiddleware(createPublicAuthMiddleware({ tokenService }), req);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("requires admin role", () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.ADMIN,
        role: ADMIN_ROLES.MANAGER
      }
    });

    const next = runMiddleware(requireAdminRole(ADMIN_ROLES.MANAGER), req);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks disallowed admin role", () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.ADMIN,
        role: ADMIN_ROLES.ADMIN
      }
    });

    const next = runMiddleware(requireAdminRole(ADMIN_ROLES.MANAGER), req);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });

  it("requires selected public role", () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole: USER_ROLES.CHEF
      }
    });

    const next = runMiddleware(requireRole(USER_ROLES.CHEF), req);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks disallowed public role", () => {
    const req = makeReq({
      auth: {
        scope: AUTH_SCOPES.PUBLIC,
        selectedRole: USER_ROLES.CLIENT
      }
    });

    const next = runMiddleware(requireRole(USER_ROLES.CHEF), req);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN"
    });
  });
});
