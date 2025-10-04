import { registerDocsTools } from "./tools/docs.js";
import { registerAppTools } from "./tools/app.js";
import { registerProjectTools } from "./tools/project.js";
import { registerAssetTools } from "./tools/assets.js";
import { registerPromptTools } from "./tools/prompts.js";
import { registerDevServerTools } from "./tools/devserver.js";
import { registerSceneTools } from "./tools/scene.js";
import { registerDesktopTools } from "./tools/desktop.js";

// MCP SDK imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NAME = "mcp-8thwall";
const VERSION = "0.1.0";

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
    // Also include docs tools in local mode for convenience
    registerDocsTools(server);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Wait indefinitely - the server will handle stdio communication
  // The process will exit when stdin closes or receives a termination signal
  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => resolve());
    process.on("SIGTERM", () => resolve());
    
    // Keep alive until stdin closes
    process.stdin.on("end", () => resolve());
  });
  
  await server.close();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal:", err);
  process.exit(1);
});
