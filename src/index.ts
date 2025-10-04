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
  
  // Explicitly keep process alive by preventing stdin from being garbage collected
  // and ensuring the event loop has active handles
  if (process.stdin.isTTY === false) {
    process.stdin.resume(); // Keep stdin in flowing mode
    process.stdin.ref(); // Ensure this keeps the event loop alive
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal:", err);
  process.exit(1);
});
