import { ForbiddenError, UnauthorizedError } from "../../../application/errors/AppError.js";
import { AUTH_SCOPES } from "../../../domain/constants/authScopes.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createAdminAuthMiddleware({ tokenService }) {
  return function adminAuthMiddleware(req, res, next) {
    try {
      const token = extractBearerToken(req);

      if (!token) {
        throw new UnauthorizedError("Access token is required");
      }

      const payload = tokenService.verifyAccessToken(token);

      if (payload.scope !== AUTH_SCOPES.ADMIN) {
        throw new ForbiddenError("Admin access token required");
      }

      req.auth = {
        scope: payload.scope,
        adminId: payload.sub,
        phone: payload.phone,
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        role: payload.role,
        profileImageUrl: payload.profileImageUrl,
        isManager: Boolean(payload.isManager),
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
