import jwt from "jsonwebtoken";
import { extractBearerToken } from "./extractBearerToken.js";

export function createAuthMiddleware({ jwtSecret }) {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  return function authMiddleware(req, res, next) {
    try {
      const token = extractBearerToken(req);

      if (!token) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "Access token is required"
          }
        });
      }

      req.auth = jwt.verify(token, jwtSecret);

      return next();
    } catch (error) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired access token"
        }
      });
    }
  };
}

export function createInternalAuthMiddleware({ internalApiKey }) {
  return function internalAuthMiddleware(req, res, next) {
    if (!internalApiKey) {
      return res.status(500).json({
        error: {
          code: "MEDIA_INTERNAL_API_KEY_NOT_CONFIGURED",
          message: "Internal media API key is not configured"
        }
      });
    }

    if (req.headers["x-internal-api-key"] !== internalApiKey) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Invalid internal API key"
        }
      });
    }

    req.auth = {
      id: req.headers["x-actor-id"] || "internal-service",
      scope: "internal",
      role: req.headers["x-actor-role"] || "service"
    };

    return next();
  };
}
