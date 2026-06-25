import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./infrastructure/database/sequelize.js";
import { initModels } from "./infrastructure/database/models/index.js";

async function bootstrap() {
  initModels();

  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`ticket-service listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Ticket service failed to start", error);
  process.exit(1);
});
