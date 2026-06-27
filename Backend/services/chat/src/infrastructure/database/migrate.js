import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { DataTypes } from "sequelize";

import { authenticateWithRetry, sequelize } from "./sequelize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "migrations");

async function ensureMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS chat_schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
}

async function getExecutedMigrations() {
  const [rows] = await sequelize.query(`
    SELECT name FROM chat_schema_migrations ORDER BY name ASC;
  `);

  return new Set(rows.map((row) => row.name));
}

async function markMigrationAsExecuted(name, transaction) {
  await sequelize.query(
    `INSERT INTO chat_schema_migrations (name) VALUES (:name);`,
    {
      replacements: { name },
      transaction
    }
  );
}

async function runMigrations() {
  await authenticateWithRetry();
  await ensureMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const files = await fs.readdir(migrationsDir);
  const migrationFiles = files
    .filter((file) => file.endsWith(".js"))
    .sort();

  for (const file of migrationFiles) {
    if (executedMigrations.has(file)) {
      continue;
    }

    const migrationPath = path.join(migrationsDir, file);
    const migration = await import(pathToFileURL(migrationPath).href);

    if (typeof migration.up !== "function") {
      throw new Error(`Migration ${file} does not export up()`);
    }

    console.log(`Running chat migration: ${file}`);

    await sequelize.transaction(async (transaction) => {
      const queryInterface = sequelize.getQueryInterface();

      await migration.up({
        queryInterface,
        DataTypes,
        transaction
      });

      await markMigrationAsExecuted(file, transaction);
    });

    console.log(`Chat migration completed: ${file}`);
  }

  console.log("All chat migrations completed");
  await sequelize.close();
}

runMigrations().catch(async (error) => {
  console.error("Chat migration failed", error);

  try {
    await sequelize.close();
  } catch {}

  process.exit(1);
});
