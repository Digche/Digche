import dotenv from "dotenv";

dotenv.config();

function numberFromEnv(name, fallback) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a number`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv("PORT", 3003),

  db: {
    host: process.env.DB_HOST,
    port: numberFromEnv("DB_PORT", 5432),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },

  jwt: {
    secret: process.env.JWT_SECRET
  },

  auth: {
    internalBaseUrl: process.env.AUTH_INTERNAL_BASE_URL || "http://auth-service:3001",
    internalApiKey: process.env.AUTH_INTERNAL_API_KEY || null,
    profileResolveTimeoutMs: numberFromEnv("AUTH_PROFILE_RESOLVE_TIMEOUT_MS", 3000)
  },

  chat: {
    messageMaxLength: numberFromEnv("CHAT_MESSAGE_MAX_LENGTH", 2000),
    historyDefaultLimit: numberFromEnv("CHAT_HISTORY_DEFAULT_LIMIT", 30),
    historyMaxLimit: numberFromEnv("CHAT_HISTORY_MAX_LIMIT", 100)
  }
};
