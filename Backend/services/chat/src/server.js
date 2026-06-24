import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./infrastructure/database/sequelize.js";
import { initModels } from "./infrastructure/database/models/index.js";

async function bootstrap() {
  initModels();

  await connectDatabase();

  const app = await createApp();

  await app.listen({
    port: env.port,
    host: "0.0.0.0"
  });

  console.log(`chat-service listening on port ${env.port}`);
}

bootstrap().catch((error) => {
  console.error("Chat service failed to start", error);
  process.exit(1);
});
