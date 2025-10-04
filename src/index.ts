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
  console.error('[DEBUG] Starting main()');
  const mode = (process.env.MODE || "local").toLowerCase();
  console.error(`[DEBUG] Mode: ${mode}`);

  const server = new McpServer(
    { name: NAME, version: VERSION },
    {
      capabilities: {
        tools: {},
        resources: {}
      }
    }
  );
  console.error('[DEBUG] McpServer created');

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

  console.error('[DEBUG] Creating StdioServerTransport');
  const transport = new StdioServerTransport();
  console.error('[DEBUG] Calling server.connect()');
  await server.connect(transport);
  console.error('[DEBUG] Server connected successfully');
  
  // Keep the event loop alive with a timer
  // This prevents Node.js from exiting after main() completes
  console.error('[DEBUG] Setting up keepAlive interval');
  const keepAlive = setInterval(() => {
    console.error('[DEBUG] keepAlive tick');
  }, 5000); // Every 5 seconds for debugging
  
  console.error('[DEBUG] main() function completed, keepAlive active');
  
  // Clean up on process termination
  process.on('SIGINT', () => {
    console.error('[DEBUG] Received SIGINT');
    clearInterval(keepAlive);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.error('[DEBUG] Received SIGTERM');
    clearInterval(keepAlive);
    process.exit(0);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal:", err);
  process.exit(1);
});
