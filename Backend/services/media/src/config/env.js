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
  port: numberFromEnv("PORT", 3002),

  jwt: {
    secret: process.env.JWT_SECRET
  },

  internalApiKey: process.env.MEDIA_INTERNAL_API_KEY || null,

  auth: {
    internalBaseUrl: process.env.AUTH_INTERNAL_BASE_URL || "http://auth-service:3001",
    internalApiKey: process.env.AUTH_INTERNAL_API_KEY || null,
    tokenVerifyTimeoutMs: numberFromEnv("AUTH_TOKEN_VERIFY_TIMEOUT_MS", 3000)
  },

  arvan: {
    region: process.env.ARVAN_REGION || "default",
    endpoint: process.env.ARVAN_ENDPOINT,
    accessKey: process.env.ARVAN_ACCESS_KEY,
    secretKey: process.env.ARVAN_SECRET_KEY,
    bucket: process.env.ARVAN_BUCKET,
    publicBaseUrl: process.env.ARVAN_PUBLIC_BASE_URL || "",
    forcePathStyle: String(process.env.ARVAN_FORCE_PATH_STYLE ?? "true") === "true",
    defaultAcl: process.env.ARVAN_DEFAULT_ACL || "public-read"
  },

  uploads: {
    presignExpiresSeconds: numberFromEnv("MEDIA_PRESIGN_EXPIRES_SECONDS", 600),
    profileMaxSizeBytes: numberFromEnv("MEDIA_PROFILE_MAX_SIZE_BYTES", 5 * 1024 * 1024),
    dishMaxSizeBytes: numberFromEnv("MEDIA_DISH_MAX_SIZE_BYTES", 10 * 1024 * 1024)
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
  requireValue(currentEnv.jwt.secret, "JWT_SECRET");
  requireValue(currentEnv.internalApiKey, "MEDIA_INTERNAL_API_KEY");
  requireValue(currentEnv.auth.internalApiKey, "AUTH_INTERNAL_API_KEY");
  requireValue(currentEnv.arvan.endpoint, "ARVAN_ENDPOINT");
  requireValue(currentEnv.arvan.accessKey, "ARVAN_ACCESS_KEY");
  requireValue(currentEnv.arvan.secretKey, "ARVAN_SECRET_KEY");
  requireValue(currentEnv.arvan.bucket, "ARVAN_BUCKET");

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
