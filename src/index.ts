import { registerDocsTools } from "./tools/docs.js";
import { registerAppTools } from "./tools/app.js";
import { registerProjectTools } from "./tools/project.js";
import { registerAssetTools } from "./tools/assets.js";
import { registerPromptTools } from "./tools/prompts.js";
import { registerDevServerTools } from "./tools/devserver.js";
import { registerSceneTools } from "./tools/scene.js";
import { registerDesktopTools } from "./tools/desktop.js";
import { registerOrchestratorTools } from "./tools/orchestrator.js";
import { registerComponentTools } from "./tools/desktopComponents.js";
import { registerCodeGeneratorTools } from "./tools/codeGenerator.js";
import { registerAssetDiscoveryTools } from "./tools/assetDiscovery.js";
import { registerTemplateTools } from "./tools/templates.js";

// MCP SDK imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NAME = "mcp-8thwall";
const VERSION = "0.2.1";

async function main() {
  const mode = (process.env.MODE || "local").toLowerCase();

  const server = new McpServer(
    { name: NAME, version: VERSION },
    {
      capabilities: {
        tools: {},
        resources: {}
      }
    }
  );

  // health.ping
  server.tool(
    "health_ping",
    "Simple health check",
    { message: z.string().optional() },
    async (args: any) => {
      const now = new Date().toISOString();
      const message = args?.message ?? "pong";
      return { content: [{ type: "text", text: `[${now}] ${message}` }] };
    }
  );

  if (mode === "docs") {
    registerDocsTools(server);
  } else if (mode === "api") {
    registerAppTools(server);
  } else if (mode === "local") {
    registerProjectTools(server);
    registerAssetTools(server);
    registerPromptTools(server);
    registerDevServerTools(server);
    registerSceneTools(server);
    registerDesktopTools(server);
    // New advanced tools
    registerOrchestratorTools(server);
    registerComponentTools(server);
    registerCodeGeneratorTools(server);
    registerAssetDiscoveryTools(server);
    registerTemplateTools(server);
    // Also include docs tools in local mode for convenience
    registerDocsTools(server);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
