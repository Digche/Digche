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
  port: numberFromEnv("PORT", 3002),

  jwt: {
    secret: process.env.JWT_SECRET
  },

  internalApiKey: process.env.MEDIA_INTERNAL_API_KEY || null,

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
  }
};
