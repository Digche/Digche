import { UnauthorizedError, ForbiddenError } from "../../../application/errors/AppError.js";
import { PARTICIPANT_TYPES } from "../../../domain/constants/participantTypes.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createAuthMiddleware({ authTokenClient }) {
  if (!authTokenClient) {
    throw new Error("authTokenClient is required");
  }

  return async function authMiddleware(request) {
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedError("Access token is required");
    }

    request.auth = await verifyChatAccessToken({ token, authTokenClient });
  };
}

export async function verifyChatAccessToken({ token, authTokenClient }) {
  try {
    const actor = await authTokenClient.verify(token);

    if (!actor.id) {
      throw new UnauthorizedError("Invalid access token subject");
    }

    if (actor.scope === "admin") {
      return {
        id: actor.id,
        type: PARTICIPANT_TYPES.ADMIN,
        scope: actor.scope,
        phone: actor.phone,
        role: actor.role,
        displayName: actor.displayName,
        raw: actor
      };
    }

    if (actor.scope === "public") {
      return {
        id: actor.id,
        type: PARTICIPANT_TYPES.USER,
        scope: actor.scope,
        phone: actor.phone,
        selectedRole: actor.selectedRole,
        displayName: actor.displayName,
        raw: actor
      };
    }

    throw new ForbiddenError("Unsupported access token scope");
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.statusCode === 401
    ) {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    throw error;
  }
}
