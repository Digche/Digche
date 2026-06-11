import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const logPretty = process.env.LOG_PRETTY === "true" && !isProduction;

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      "accessToken",
      "refreshToken",
      "registrationToken",
      "authorization",
      "req.headers.authorization",
      "*.accessToken",
      "*.refreshToken",
      "*.registrationToken"
    ],
    censor: "[REDACTED]"
  },

  transport: logPretty
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname"
        }
      }
    : undefined
});