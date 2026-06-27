import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const possibleOpenApiPaths = [
  path.resolve(__dirname, "../../../../../docs/api/media.openapi.yaml"),
  "/docs/api/media.openapi.yaml"
];

export const openApiPath = possibleOpenApiPaths.find((candidatePath) =>
  fs.existsSync(candidatePath)
);

if (!openApiPath) {
  throw new Error("media.openapi.yaml file not found");
}

const swaggerDocument = YAML.load(openApiPath);

export function setupSwagger(app) {
  app.use("/media/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get("/media/openapi.yaml", (req, res) => {
    res.sendFile(openApiPath);
  });
}
