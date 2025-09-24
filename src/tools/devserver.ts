import http from "node:http";
import fs from "node:fs/promises";
import fscb from "node:fs";
import path from "node:path";
import { z } from "zod";

type Server = any;

let server: http.Server | null = null;
let serverPort = 0;
let rootDir = "";

function projectRoot(): string {
  return process.env.PROJECT_ROOT || path.resolve(process.cwd(), "project");
}

function contentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".mjs": return "application/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".gif": return "image/gif";
    case ".hdr": return "application/octet-stream";
    case ".exr": return "application/octet-stream";
    case ".gltf": return "model/gltf+json";
    case ".glb": return "model/gltf-binary";
    case ".wasm": return "application/wasm";
    case ".mp4": return "video/mp4";
    default: return "application/octet-stream";
  }
}

function safeJoin(base: string, reqPath: string): string {
  const decoded = decodeURIComponent(reqPath.split("?")[0]);
  const safe = path.normalize(decoded).replace(/^\/+/, "");
  const full = path.join(base, safe);
  const rel = path.relative(base, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error("Path escapes root");
  return full;
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

export function registerDevServerTools(serverApi: Server) {
  serverApi.tool(
    "devserver_start",
    "Start a static file server for PROJECT_ROOT",
    { port: z.number().optional() },
    async (args: any) => {
      if (server) {
        return { content: [{ type: "json", json: { url: `http://localhost:${serverPort}/`, port: serverPort, root: rootDir, running: true } }] };
      }
      const port = Number(args?.port || 5173);
      const root = projectRoot();
      rootDir = root;
      await fs.mkdir(root, { recursive: true });

      server = http.createServer(async (req, res) => {
        try {
          const reqUrl = req.url || "/";
          let full = safeJoin(root, reqUrl);
          let stat: fscb.Stats | null = null;
          try { stat = fscb.statSync(full); } catch { stat = null; }
          if (!stat || stat.isDirectory()) {
            const indexPath = path.join(full, "index.html");
            if (await fileExists(indexPath)) {
              full = indexPath;
            } else if (path.basename(full) !== "index.html") {
              const rootIndex = path.join(root, "index.html");
              if (await fileExists(rootIndex)) full = rootIndex;
            }
          }
          const data = await fs.readFile(full);
          res.statusCode = 200;
          res.setHeader("content-type", contentType(full));
          res.end(data);
        } catch (e: any) {
          res.statusCode = 404;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          res.end("Not found");
        }
      });

      await new Promise<void>((resolve, reject) => {
        server!.once("error", reject);
        server!.listen(port, "127.0.0.1", () => resolve());
      });
      serverPort = port;
      return { content: [{ type: "json", json: { url: `http://127.0.0.1:${port}/`, port, root, running: true } }] };
    }
  );

  serverApi.tool(
    "devserver_stop",
    "Stop the static file server",
    async () => {
      if (!server) {
        return { content: [{ type: "text", text: "Server not running" }] };
      }
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      server = null;
      const port = serverPort;
      serverPort = 0;
      rootDir = "";
      return { content: [{ type: "text", text: `Stopped server on port ${port}` }] };
    }
  );
}
