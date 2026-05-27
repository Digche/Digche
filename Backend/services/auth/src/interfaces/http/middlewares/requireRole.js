import { ForbiddenError, UnauthorizedError } from "../../../application/errors/AppError.js";
import { AUTH_SCOPES } from "../../../domain/constants/authScopes.js";

export function requireRole(...allowedRoles) {
  return function requireRoleMiddleware(req, res, next) {
    try {
      if (!req.auth) {
        throw new UnauthorizedError("Authentication required");
      }

      if (req.auth.scope !== AUTH_SCOPES.PUBLIC) {
        throw new ForbiddenError("Public authentication required");
      }

      if (!allowedRoles.includes(req.auth.selectedRole)) {
        throw new ForbiddenError("You do not have permission to access this resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}