import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 3001),

  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30),
    registrationTokenExpiresIn: process.env.REGISTRATION_TOKEN_EXPIRES_IN || "10m",
    registrationTokenExpiresMinutes: Number(process.env.REGISTRATION_TOKEN_EXPIRES_MINUTES || 10)
  },

  otp: {
    provider: process.env.OTP_PROVIDER || "dev",
    expiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 2),
    rateLimitPerHour: Number(process.env.OTP_RATE_LIMIT_PER_HOUR || 5),
    cooldownSeconds: Number(process.env.OTP_COOLDOWN_SECONDS || 60)
  },

  kavenegar: {
    apiKey: process.env.KAVENEGAR_API_KEY,
    template: process.env.KAVENEGAR_TEMPLATE
  },

  cache: {
    provider: process.env.CACHE_PROVIDER || "redis"
  },

  redis: {
    host: process.env.REDIS_HOST || "auth-redis",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || null,
    keyPrefix: process.env.REDIS_KEY_PREFIX || "auth:"
  },

  profile: {
    allowedPhotoUrlOrigins: parseCsv(process.env.AUTH_ALLOWED_PHOTO_URL_ORIGINS)
  },

  cors: {
    allowedOrigins: parseOrigins(
      process.env.CORS_ORIGINS,
      ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
  },

  docs: {
    enabled: booleanFromEnv("ENABLE_SWAGGER", !isProduction)
  },

  initialManagerPhone: process.env.INITIAL_MANAGER_PHONE,
  internalApiKey: process.env.AUTH_INTERNAL_API_KEY || null
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
  requireValue(currentEnv.internalApiKey, "AUTH_INTERNAL_API_KEY");

  if (!isProduction) {
    return;
  }

  if (currentEnv.jwt.secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  if (currentEnv.otp.provider === "dev") {
    throw new Error("OTP_PROVIDER=dev is not allowed in production");
  }

  if (currentEnv.otp.provider === "kavenegar") {
    requireValue(currentEnv.kavenegar.apiKey, "KAVENEGAR_API_KEY");
    requireValue(currentEnv.kavenegar.template, "KAVENEGAR_TEMPLATE");
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
