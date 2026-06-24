import pinoHttp from "pino-http";
import { logger } from "../../../infrastructure/logging/logger.js";

export const requestLogger = pinoHttp({
  logger,

  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "durationMs"
  },

  customLogLevel(req, res, error) {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },

  customSuccessMessage(req, res) {
    return `HTTP ${req.method} ${req.url} completed with ${res.statusCode}`;
  },

  customErrorMessage(req, res) {
    return `HTTP ${req.method} ${req.url} failed with ${res.statusCode}`;
  },

  autoLogging: {
    ignore(req) {
      return [
        "/health",
        "/auth/health",
        "/admin/auth/health"
      ].includes(req.url);
    }
  }
});