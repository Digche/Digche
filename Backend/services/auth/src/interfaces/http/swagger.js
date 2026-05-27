import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const possibleOpenApiPaths = [
  path.resolve(__dirname, "../../../../../docs/api/auth.openapi.yaml"),
  "/docs/api/auth.openapi.yaml"
];

const openApiPath = possibleOpenApiPaths.find((candidatePath) =>
  fs.existsSync(candidatePath)
);

if (!openApiPath) {
  throw new Error("auth.openapi.yaml file not found");
}

const swaggerDocument = YAML.load(openApiPath);

export function setupSwagger(app) {
  app.use("/auth/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get("/auth/openapi.yaml", (req, res) => {
    res.sendFile(openApiPath);
  });
}