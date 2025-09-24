import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { z } from "zod";

type Server = any;

function projectRoot(): string {
  return process.env.PROJECT_ROOT || path.resolve(process.cwd(), "project");
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

function assetsDir(): string {
  return path.join(projectRoot(), "assets");
}

export function registerAssetTools(server: Server) {
  // assets.status
  server.tool(
    "assets_status",
    "Report availability of PolyHaven integration",
    async () => {
      return {
        content: [
          {
            type: "json",
            json: {
              polyhaven: { available: true, info: "Public API endpoints" }
            }
          }
        ]
      };
    }
  );

  // assets.search_polyhaven (naive; requires network access)
  server.tool(
    "assets_search_polyhaven",
    "Search PolyHaven assets (hdris/textures/models) by keyword",
    { query: z.string(), type: z.enum(["hdris", "textures", "models", "all"]).optional(), limit: z.number().optional() },
    async (args: any) => {
      const type = args.type || "all";
      const q = encodeURIComponent(String(args.query));
      const limit = Number(args.limit || 20);
      const base = "https://api.polyhaven.com";
      // Simple endpoint: list assets then filter client-side by name
      const url = `${base}/assets?t=${encodeURIComponent(type)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`PolyHaven fetch failed: ${res.status}`);
      const data = (await res.json()) as Record<string, any>;
      const items = Object.entries(data)
        .map(([id, v]) => ({ id, name: (v as any).name || id, data: v }))
        .filter((it) => it.name.toLowerCase().includes(decodeURIComponent(q).toLowerCase()))
        .slice(0, limit);
      return { content: [{ type: "json", json: items }] };
    }
  );

  // assets.polyhaven_categories: compile categories for a type
  server.tool(
    "assets_polyhaven_categories",
    "List PolyHaven categories for an asset type (hdris/textures/models/all)",
    { type: z.enum(["hdris", "textures", "models", "all"]).optional() },
    async (args: any) => {
      const type = args?.type || "all";
      const base = "https://api.polyhaven.com";
      const url = `${base}/assets?t=${encodeURIComponent(type)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`PolyHaven fetch failed: ${res.status}`);
      const data = (await res.json()) as Record<string, any>;
      const cats = new Set<string>();
      Object.values(data).forEach((v: any) => {
        (v?.categories || []).forEach((c: string) => cats.add(c));
      });
      return { content: [{ type: "json", json: Array.from(cats).sort() }] };
    }
  );

  // assets.polyhaven_files: fetch file metadata for an asset id
  server.tool(
    "assets_polyhaven_files",
    "Get PolyHaven file metadata for a specific asset id",
    { id: z.string() },
    async (args: any) => {
      const id = String(args.id);
      const url = `https://api.polyhaven.com/files/${encodeURIComponent(id)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`PolyHaven files fetch failed: ${res.status}`);
      const meta = await res.json();
      return { content: [{ type: "json", json: meta }] };
    }
  );

  // assets.download_url (generic downloader into assets/)
  server.tool(
    "assets_download_url",
    "Download a file by URL into project/assets/",
    { url: z.string(), filename: z.string().optional() },
    async (args: any) => {
      const url = String(args.url);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
      const buf = new Uint8Array(await resp.arrayBuffer());
      const parsed = new URL(url);
      const name = String(args.filename || path.basename(parsed.pathname) || "download.bin");
      const dir = assetsDir();
      await ensureDir(dir);
      const dest = path.join(dir, name);
      await fs.writeFile(dest, buf);
      return { content: [{ type: "json", json: { path: path.relative(projectRoot(), dest), bytes: buf.length } }] };
    }
  );

  // Sketchfab-related tools removed per request.

  // assets.unzip: unzip an archive into a destination folder under project/assets
  server.tool(
    "assets_unzip",
    "Unzip a .zip file into project assets directory",
    { zipPath: z.string(), destDir: z.string().optional() },
    async (args: any) => {
      const root = projectRoot();
      const zipRel = String(args.zipPath);
      const destRel = String(args.destDir || path.join("assets", "models", path.basename(zipRel, ".zip")));
      const zipFull = path.isAbsolute(zipRel) ? zipRel : path.join(root, zipRel);
      const destFull = path.isAbsolute(destRel) ? destRel : path.join(root, destRel);
      await ensureDir(destFull);
      await new Promise<void>((resolve, reject) => {
        execFile("unzip", ["-o", zipFull, "-d", destFull], (err, stdout, stderr) => {
          if (err) return reject(new Error(`unzip failed: ${stderr || err.message}`));
          resolve();
        });
      });
      return { content: [{ type: "json", json: { dest: path.relative(root, destFull) } }] };
    }
  );
}
