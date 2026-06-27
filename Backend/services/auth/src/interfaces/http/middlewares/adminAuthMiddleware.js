import { ForbiddenError, UnauthorizedError } from "../../../application/errors/AppError.js";
import { AUTH_SCOPES } from "../../../domain/constants/authScopes.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createAdminAuthMiddleware({
  tokenService,
  adminUserRepository
}) {
  return async function adminAuthMiddleware(req, res, next) {
    try {
      const token = extractBearerToken(req);

      if (!token) {
        throw new UnauthorizedError("Access token is required");
      }

      const payload = tokenService.verifyAccessToken(token);

      if (payload.scope !== AUTH_SCOPES.ADMIN) {
        throw new ForbiddenError("Admin access token required");
      }

      const adminUser = await adminUserRepository.findById(payload.sub);

      if (!adminUser) {
        throw new UnauthorizedError("Admin user not found");
      }

      if (!adminUser.isActive()) {
        throw new ForbiddenError("Admin user is disabled");
      }

      if (Number(payload.tokenVersion || 0) !== Number(adminUser.tokenVersion || 0)) {
        throw new UnauthorizedError("Access token has been revoked");
      }

      req.auth = {
        scope: payload.scope,
        adminId: adminUser.id,
        phone: adminUser.phone,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        username: adminUser.username,
        role: adminUser.role,
        photoUrl: adminUser.photoUrl,
        tokenVersion: adminUser.tokenVersion || 0,
        isManager: adminUser.isManager(),
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
