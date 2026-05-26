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
    await sequelize.authenticate();

    console.log("Auth database connected successfully");
  } catch (error) {
    console.error("Unable to connect to auth database", error);
    throw error;
  }
}