import http from "node:http";
import { URL } from "node:url";
import path from "node:path";

// Reuse the existing tool registration functions
import { registerDocsTools } from "./tools/docs.js";
import { registerAppTools } from "./tools/app.js";
import { registerProjectTools } from "./tools/project.js";
import { registerAssetTools } from "./tools/assets.js";
import { registerPromptTools } from "./tools/prompts.js";
import { registerDevServerTools } from "./tools/devserver.js";
import { registerSceneTools } from "./tools/scene.js";
import { registerDesktopTools } from "./tools/desktop.js";

type ToolHandler = (args?: any) => Promise<any> | any;

interface ToolDef {
  name: string;
  description: string;
  handler: ToolHandler;
}

class ToolRegistry {
  tools = new Map<string, ToolDef>();

  tool(name: string, description: string, schemaOrHandler: any, maybeHandler?: ToolHandler) {
    // Support both signatures: (name, desc, handler) and (name, desc, schema, handler)
    let handler: ToolHandler;
    if (typeof schemaOrHandler === "function") handler = schemaOrHandler as ToolHandler;
    else handler = (maybeHandler as ToolHandler)!;
    this.tools.set(name, { name, description, handler });
  }
}

function buildRegistry(): ToolRegistry {
  const mode = (process.env.MODE || "local").toLowerCase();
  const reg = new ToolRegistry();

  // Register minimal health tool for parity with MCP entry
  reg.tool(
    "health_ping",
    "Simple health check",
    async (args: any) => {
      const now = new Date().toISOString();
      const message = args?.message ?? "pong";
      return { content: [{ type: "text", text: `[${now}] ${message}` }] };
    }
  );

  if (mode === "docs") {
    registerDocsTools(reg as any);
  } else if (mode === "api") {
    registerAppTools(reg as any);
  } else if (mode === "local") {
    registerProjectTools(reg as any);
    registerAssetTools(reg as any);
    registerPromptTools(reg as any);
    registerDevServerTools(reg as any);
    registerSceneTools(reg as any);
    registerDesktopTools(reg as any);
    // Also include docs tools in local mode for convenience
    registerDocsTools(reg as any);
  }
  return reg;
}

function json(res: http.ServerResponse, code: number, obj: any) {
  const body = JSON.stringify(obj);
  res.statusCode = code;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  res.end(body);
}

function notFound(res: http.ServerResponse) {
  json(res, 404, { error: "Not found" });
}

async function readJson(req: http.IncomingMessage): Promise<any> {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); }
      catch (e: any) { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

const PORT = Number(process.env.HTTP_PORT || 8787);
const HOST = process.env.HTTP_HOST || "127.0.0.1";

const registry = buildRegistry();

const server = http.createServer(async (req, res) => {
  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("access-control-allow-origin", "*");
      res.setHeader("access-control-allow-headers", "content-type");
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
    const pathname = url.pathname.replace(/\/+$/, "");

    if (req.method === "GET" && (pathname === "" || pathname === "/")) {
      json(res, 200, {
        ok: true,
        mode: process.env.MODE || "local",
        endpoints: [
          { path: "/tools", method: "GET", desc: "List available tools" },
          { path: "/tool/:name", method: "POST", desc: "Invoke a tool with JSON args" }
        ]
      });
      return;
    }

    if (req.method === "GET" && pathname === "/tools") {
      const list = Array.from(registry.tools.values()).map((t) => ({ name: t.name, description: t.description }));
      json(res, 200, { tools: list });
      return;
    }

    if (req.method === "POST" && pathname.startsWith("/tool/")) {
      const name = decodeURIComponent(pathname.slice("/tool/".length));
      const def = registry.tools.get(name);
      if (!def) return notFound(res);
      const body = await readJson(req).catch((e) => ({ __error: e }));
      if ((body as any).__error) return json(res, 400, { error: "Invalid JSON body" });
      const args = (body && typeof body === "object" ? (body.args ?? body) : {});
      try {
        const result = await def.handler(args);
        json(res, 200, { ok: true, tool: name, result });
      } catch (e: any) {
        json(res, 500, { ok: false, tool: name, error: e?.message || String(e) });
      }
      return;
    }

    notFound(res);
  } catch (e: any) {
    json(res, 500, { error: e?.message || String(e) });
  }
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`HTTP tool bridge listening at http://${HOST}:${PORT}/ (mode=${process.env.MODE || "local"})`);
});

