import { ForbiddenError, UnauthorizedError } from "../../../application/errors/AppError.js";
import { AUTH_SCOPES } from "../../../domain/constants/authScopes.js";
import { USER_ROLES } from "../../../domain/constants/roles.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createPublicAuthMiddleware({
  tokenService,
  userRepository,
  chefAccountRepository
}) {
  return async function publicAuthMiddleware(req, res, next) {
    try {
      const token = extractBearerToken(req);

      if (!token) {
        throw new UnauthorizedError("Access token is required");
      }

      const payload = tokenService.verifyAccessToken(token);

      if (payload.scope !== AUTH_SCOPES.PUBLIC) {
        throw new ForbiddenError("Public access token required");
      }

      const user = await userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
        throw new UnauthorizedError("Access token has been revoked");
      }

      if (!user.hasRole(payload.selectedRole)) {
        throw new ForbiddenError("User does not have selected role");
      }

      if (!user.hasCompletedProfile()) {
        throw new ForbiddenError("User profile is not completed");
      }

      let chef = null;

      if (payload.selectedRole === USER_ROLES.CHEF) {
        chef = await chefAccountRepository.findByUserId(user.id);

        if (!chef) {
          throw new ForbiddenError("Chef account not found");
        }

        if (chef.isSuspended()) {
          throw new ForbiddenError("Chef account is suspended");
        }
      }

      req.auth = {
        scope: payload.scope,
        userId: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        address: user.address,
        roles: user.roles || [],
        selectedRole: payload.selectedRole,
        tokenVersion: user.tokenVersion || 0,
        chef: chef ? { status: chef.status } : null,
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
