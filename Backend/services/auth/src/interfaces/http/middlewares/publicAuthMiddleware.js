import { ForbiddenError, UnauthorizedError } from "../../../application/errors/AppError.js";
import { AUTH_SCOPES } from "../../../domain/constants/authScopes.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createPublicAuthMiddleware({ tokenService }) {
  return function publicAuthMiddleware(req, res, next) {
    try {
      const token = extractBearerToken(req);

      if (!token) {
        throw new UnauthorizedError("Access token is required");
      }

      const payload = tokenService.verifyAccessToken(token);

      if (payload.scope !== AUTH_SCOPES.PUBLIC) {
        throw new ForbiddenError("Public access token required");
      }

      req.auth = {
        scope: payload.scope,
        userId: payload.sub,
        phone: payload.phone,
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        roles: payload.roles || [],
        selectedRole: payload.selectedRole,
        chef: payload.chef || null,
        raw: payload
      };

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Invalid or expired access token"));
      }

      next(error);
    }
  };
}