import fs from "fs";
import path from "path";

const possibleOpenApiPaths = [
  "/docs/api/chat.openapi.yaml",
  path.resolve(process.cwd(), "../../docs/api/chat.openapi.yaml"),
  path.resolve(process.cwd(), "docs/api/chat.openapi.yaml")
];

const openApiPath = possibleOpenApiPaths.find((candidatePath) =>
  fs.existsSync(candidatePath)
);

export function setupSwagger(app) {
  app.get("/chat/openapi.yaml", async (request, reply) => {
    if (!openApiPath) {
      return reply.code(404).send({
        error: {
          code: "OPENAPI_NOT_FOUND",
          message: "OpenAPI file not found"
        }
      });
    }

    reply.header("Content-Type", "application/yaml");
    return reply.send(fs.readFileSync(openApiPath, "utf8"));
  });

  app.get("/chat/docs", async (request, reply) => {
    reply.header("Content-Type", "text/html; charset=utf-8");
    return reply.send(`<!doctype html>
<html>
  <head>
    <title>Chat API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/chat/openapi.yaml",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`);
  });
}
