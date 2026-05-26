import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
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
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30)
  },

  otp: {
    expiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 2),
    rateLimitPerHour: Number(process.env.OTP_RATE_LIMIT_PER_HOUR || 5)
  }
};