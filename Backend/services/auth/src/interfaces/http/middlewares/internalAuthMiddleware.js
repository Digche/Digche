import { ForbiddenError } from "../../../application/errors/AppError.js";

export function createInternalAuthMiddleware({ internalApiKey }) {
  return function internalAuthMiddleware(req, res, next) {
    try {
      if (!internalApiKey) {
        throw new ForbiddenError("Internal auth API key is not configured");
      }

      if (req.headers["x-internal-api-key"] !== internalApiKey) {
        throw new ForbiddenError("Invalid internal API key");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
