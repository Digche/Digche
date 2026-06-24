import jwt from "jsonwebtoken";

import { ForbiddenError, UnauthorizedError } from "../../../application/errors/AppError.js";
import { ADMIN_ROLES, USER_ROLES } from "../../../domain/constants/roles.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createPublicAuthMiddleware({ jwtSecret }) {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  return function publicAuthMiddleware(req, res, next) {
    try {
      const payload = verifyAccessToken({ req, jwtSecret });

      if (payload.scope !== "public") {
        throw new ForbiddenError("Public access token required");
      }

      if (!Object.values(USER_ROLES).includes(payload.selectedRole)) {
        throw new ForbiddenError("Client or chef role required");
      }

      req.auth = {
        id: payload.sub,
        scope: payload.scope,
        role: payload.selectedRole,
        phone: payload.phone,
        raw: payload
      };

      next();
    } catch (error) {
      next(normalizeAuthError(error));
    }
  };
}

export function createAdminAuthMiddleware({ jwtSecret }) {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  return function adminAuthMiddleware(req, res, next) {
    try {
      const payload = verifyAccessToken({ req, jwtSecret });

      if (payload.scope !== "admin") {
        throw new ForbiddenError("Admin access token required");
      }

      if (!Object.values(ADMIN_ROLES).includes(payload.role)) {
        throw new ForbiddenError("Admin or manager role required");
      }

      req.auth = {
        id: payload.sub,
        scope: payload.scope,
        role: payload.role,
        phone: payload.phone,
        isManager: Boolean(payload.isManager),
        raw: payload
      };

      next();
    } catch (error) {
      next(normalizeAuthError(error));
    }
  };
}

function verifyAccessToken({ req, jwtSecret }) {
  const token = extractBearerToken(req);

  if (!token) {
    throw new UnauthorizedError("Access token is required");
  }

  return jwt.verify(token, jwtSecret);
}

function normalizeAuthError(error) {
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return new UnauthorizedError("Invalid or expired access token");
  }

  return error;
}
