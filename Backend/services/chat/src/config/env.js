import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

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
  nodeEnv,
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
    profileResolveTimeoutMs: numberFromEnv("AUTH_PROFILE_RESOLVE_TIMEOUT_MS", 3000),
    tokenVerifyTimeoutMs: numberFromEnv("AUTH_TOKEN_VERIFY_TIMEOUT_MS", 3000)
  },

  chat: {
    messageMaxLength: numberFromEnv("CHAT_MESSAGE_MAX_LENGTH", 2000),
    historyDefaultLimit: numberFromEnv("CHAT_HISTORY_DEFAULT_LIMIT", 30),
    historyMaxLimit: numberFromEnv("CHAT_HISTORY_MAX_LIMIT", 100)
  },

  cors: {
    allowedOrigins: parseOrigins(
      process.env.CORS_ORIGINS,
      ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
  },

  docs: {
    enabled: booleanFromEnv("ENABLE_SWAGGER", !isProduction)
  }
};

validateEnv(env);

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOrigins(value, fallback) {
  const origins = parseCsv(value);
  return origins.length > 0 ? origins : fallback;
}

function booleanFromEnv(name, fallback) {
  const value = process.env[name];

  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function validateEnv(currentEnv) {
  requireValue(currentEnv.db.host, "DB_HOST");
  requireValue(currentEnv.db.name, "DB_NAME");
  requireValue(currentEnv.db.user, "DB_USER");
  requireValue(currentEnv.db.password, "DB_PASSWORD");
  requireValue(currentEnv.jwt.secret, "JWT_SECRET");
  requireValue(currentEnv.auth.internalApiKey, "AUTH_INTERNAL_API_KEY");

  if (!isProduction) {
    return;
  }

  if (currentEnv.jwt.secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  if (currentEnv.cors.allowedOrigins.length === 0) {
    throw new Error("CORS_ORIGINS is required in production");
  }
}

function requireValue(value, name) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
}
