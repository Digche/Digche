import { Sequelize } from "sequelize";
import { env } from "../../config/env.js";

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "postgres",
    logging: env.nodeEnv === "development" ? console.log : false
  }
);

export async function connectDatabase() {
  try {
    await authenticateWithRetry();

    console.log("Auth database connected successfully");
  } catch (error) {
    console.error("Unable to connect to auth database", error);
    throw error;
  }
}

export async function authenticateWithRetry({
  maxAttempts = 20,
  delayMs = 1000
} = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await sequelize.authenticate();
      return true;
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      console.log(
        `Auth database is not ready yet. Retrying ${attempt}/${maxAttempts}...`
      );

      await wait(delayMs);
    }
  }

  throw lastError;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
