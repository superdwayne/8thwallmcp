import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { z } from "zod";

type Server = any;

function projectRoot(): string {
  return process.env.PROJECT_ROOT || path.resolve(process.cwd(), "project");
}

async function walkLimit(base: string, maxFiles: number, maxDepth: number): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string, depth: number) {
    if (out.length >= maxFiles) return;
    let entries: any[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch { return; }
    for (const e of entries) {
      if (out.length >= maxFiles) break;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (depth < maxDepth) await walk(full, depth + 1);
      } else {
        out.push(full);
      }
    }
  }
  await walk(base, 0);
  return out;
}

export function registerDesktopTools(server: Server) {
  // desktop_guess_scene
  server.tool(
    "desktop_guess_scene",
    "Heuristically find scene/config JSON files used by 8th Wall Desktop",
    { maxDepth: z.number().optional(), maxFiles: z.number().optional() },
    async (args: any) => {
      const root = projectRoot();
      const maxDepth = typeof args?.maxDepth === "number" ? Math.max(0, Math.floor(args.maxDepth)) : 5;
      const maxFiles = typeof args?.maxFiles === "number" ? Math.max(1, Math.floor(args.maxFiles)) : 800;
      const files = await walkLimit(root, maxFiles, maxDepth);
      const candidates: { path: string; size: number; keys?: string[]; score: number }[] = [];
      for (const f of files) {
        const ext = path.extname(f).toLowerCase();
        if (ext && ext !== ".json" && ext !== ".scene" && ext !== ".space") continue;
        let st: any; try { st = await fs.stat(f); } catch { continue; }
        if (!st.isFile()) continue;
        if (st.size > 3 * 1024 * 1024) continue; // skip very large files
        let text: string;
        try { text = await fs.readFile(f, "utf-8"); } catch { continue; }
        let obj: any;
        try { obj = JSON.parse(text); } catch { continue; }
        if (!obj || typeof obj !== "object") continue;
        const keys = Object.keys(obj).slice(0, 50);
        let score = 0;
        const inc = (k: string) => { if (k in obj) score += 2; };
        inc("scene"); inc("scenes"); inc("entities"); inc("objects"); inc("nodes"); inc("components"); inc("spaces"); inc("space");
        if (Array.isArray(obj.entities) || Array.isArray(obj.objects) || Array.isArray(obj.nodes)) score += 3;
        if (String(f).toLowerCase().includes("scene") || String(f).toLowerCase().includes("space")) score += 1;
        if (score > 0) candidates.push({ path: path.relative(root, f), size: st.size, keys, score });
      }
      candidates.sort((a,b)=> b.score - a.score || a.path.localeCompare(b.path));
      const result = { root, candidates: candidates.slice(0, 50) };
      return { content: [ { type: "text", text: JSON.stringify(result, null, 2) } ] };
    }
  );
}

