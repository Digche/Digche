import jwt from "jsonwebtoken";

import { UnauthorizedError, ForbiddenError } from "../../../application/errors/AppError.js";
import { PARTICIPANT_TYPES } from "../../../domain/constants/participantTypes.js";
import { extractBearerToken } from "./extractBearerToken.js";

export function createAuthMiddleware({ jwtSecret }) {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  return async function authMiddleware(request) {
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedError("Access token is required");
    }

    request.auth = verifyChatAccessToken({ token, jwtSecret });
  };
}

export function verifyChatAccessToken({ token, jwtSecret }) {
  try {
    const payload = jwt.verify(token, jwtSecret);

    if (!payload.sub) {
      throw new UnauthorizedError("Invalid access token subject");
    }

    if (payload.scope === "admin") {
      return {
        id: payload.sub,
        type: PARTICIPANT_TYPES.ADMIN,
        scope: payload.scope,
        phone: payload.phone,
        role: payload.role,
        displayName: displayNameFromPayload(payload),
        raw: payload
      };
    }

    if (payload.scope === "public") {
      return {
        id: payload.sub,
        type: PARTICIPANT_TYPES.USER,
        scope: payload.scope,
        phone: payload.phone,
        selectedRole: payload.selectedRole,
        displayName: displayNameFromPayload(payload),
        raw: payload
      };
    }

    throw new ForbiddenError("Unsupported access token scope");
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    throw error;
  }
}

function displayNameFromPayload(payload) {
  const fullName = [payload.firstName, payload.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || payload.username || payload.phone || null;
}
