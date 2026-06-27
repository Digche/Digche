import { ForbiddenError, UnauthorizedError } from "../../../application/errors/AppError.js";
import { ADMIN_ROLES, USER_ROLES } from "../../../domain/constants/roles.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createPublicAuthMiddleware({ authTokenClient }) {
  if (!authTokenClient) {
    throw new Error("authTokenClient is required");
  }

  return async function publicAuthMiddleware(req, res, next) {
    try {
      const actor = await verifyAccessToken({ req, authTokenClient });

      if (actor.scope !== "public") {
        throw new ForbiddenError("Public access token required");
      }

      if (!Object.values(USER_ROLES).includes(actor.selectedRole)) {
        throw new ForbiddenError("Client or chef role required");
      }

      req.auth = {
        id: actor.id,
        scope: actor.scope,
        role: actor.selectedRole,
        phone: actor.phone,
        raw: actor
      };

      next();
    } catch (error) {
      next(normalizeAuthError(error));
    }
  };
}

export function createAdminAuthMiddleware({ authTokenClient }) {
  if (!authTokenClient) {
    throw new Error("authTokenClient is required");
  }

  return async function adminAuthMiddleware(req, res, next) {
    try {
      const actor = await verifyAccessToken({ req, authTokenClient });

      if (actor.scope !== "admin") {
        throw new ForbiddenError("Admin access token required");
      }

      if (!Object.values(ADMIN_ROLES).includes(actor.role)) {
        throw new ForbiddenError("Admin or manager role required");
      }

      req.auth = {
        id: actor.id,
        scope: actor.scope,
        role: actor.role,
        phone: actor.phone,
        isManager: Boolean(actor.isManager),
        raw: actor
      };

      next();
    } catch (error) {
      next(normalizeAuthError(error));
    }
  };
}

async function verifyAccessToken({ req, authTokenClient }) {
  const token = extractBearerToken(req);

  if (!token) {
    throw new UnauthorizedError("Access token is required");
  }

  return authTokenClient.verify(token);
}

function normalizeAuthError(error) {
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    error.statusCode === 401
  ) {
    return new UnauthorizedError("Invalid or expired access token");
  }

  return error;
}
