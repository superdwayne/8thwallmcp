import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { getProjectRoot } from "../utils/projectRoot.js";

type Server = any;

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

function resolvePathStrict(relPath: string): string {
  const root = getProjectRoot();
  const full = path.resolve(root, relPath);
  const rel = path.relative(root, full);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Path escapes project root");
  }
  return full;
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

// --- Minimal JSON Pointer helpers (RFC6901-ish) ---
function parseJsonLoose(text: string): any {
  const first = JSON.parse(text);
  if (typeof first === "string") {
    try {
      return JSON.parse(first);
    } catch {
      return first;
    }
  }
  return first;
}

function isExpanseFile(rel: string): boolean {
  const name = path.basename(rel).toLowerCase();
  return name.endsWith(".expanse.json") || name === ".expanse.json";
}

function repairExpanseScene(raw: any): any {
  if (!raw || typeof raw !== "object") return raw;
  const objects = raw.objects;
  const spaces = raw.spaces;
  if (!objects || typeof objects !== "object" || !spaces || typeof spaces !== "object") return raw;
  const entry = raw.entrySpaceId || Object.keys(spaces)[0];
  if (!entry) return raw;
  if (!raw.entrySpaceId) raw.entrySpaceId = entry;
  if (!raw.activeCamera && spaces[entry]?.activeCamera) {
    raw.activeCamera = spaces[entry].activeCamera;
  }
  const space = spaces[entry];
  if (!space || typeof space !== "object") return raw;

  // Ensure every object entry is parsed JSON
  Object.keys(objects).forEach((id) => {
    const value = objects[id];
    if (typeof value === "string") {
      try {
        objects[id] = JSON.parse(value);
      } catch {
        // leave as-is
      }
    }
  });

  const ensureVec = (arr: any, length: number, fallback: number): number[] => {
    if (!Array.isArray(arr)) arr = Array.from({ length }, () => fallback);
    const out = [] as number[];
    for (let i = 0; i < length; i++) {
      const v = Number(arr[i]);
      out.push(Number.isFinite(v) ? v : fallback);
    }
    return out;
  };

  const ensureNumber = (value: any, fallback: number): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  Object.values(objects).forEach((obj: any) => {
    if (!obj || typeof obj !== "object") return;
    obj.position = ensureVec(obj.position, 3, 0);
    obj.scale = ensureVec(obj.scale, 3, 1);
    obj.rotation = ensureVec(obj.rotation, 4, 0);
    if (obj.rotation[3] === 0) obj.rotation[3] = 1;
    obj.order = ensureNumber(obj.order, 0);
    if (obj.light && typeof obj.light === "object") {
      obj.light.intensity = ensureNumber(obj.light.intensity, 1);
    }
    if (obj.geometry && typeof obj.geometry === "object") {
      const geo = obj.geometry;
      const numericProps = [
        "width",
        "height",
        "depth",
        "radius",
        "innerRadius",
        "outerRadius",
        "tube",
        "radialSegments",
        "tubularSegments",
        "thetaStart",
        "thetaLength",
        "arc",
        "angle",
        "segments",
        "detail"
      ];
      numericProps.forEach((key) => {
        if (key in geo) geo[key] = ensureNumber((geo as any)[key], key.includes("Segments") ? 8 : 1);
      });
    }
    if (obj.material && typeof obj.material === "object") {
      const mat = obj.material;
      if ("roughness" in mat) mat.roughness = ensureNumber(mat.roughness, 0.5);
      if ("metalness" in mat) mat.metalness = ensureNumber(mat.metalness, 0);
      if ("emissiveIntensity" in mat) mat.emissiveIntensity = ensureNumber(mat.emissiveIntensity, 0);
    }
  });

  const children = Object.keys(objects).filter((id) => {
    const obj = objects[id];
    if (!obj || typeof obj !== "object") return false;
    if (!obj.parentId) obj.parentId = entry;
    return obj.parentId === entry;
  });

  if (!Array.isArray(space.children)) {
    space.children = []; // overwrite undefined/null/non-array entries
  }
  space.children = children;
  return raw;
}

async function readJsonFile(rel: string): Promise<{ data: any; text: string; full: string }> {
  const full = resolvePathStrict(rel);
  const text = await fs.readFile(full, "utf-8");
  let data: any;
  try {
    data = parseJsonLoose(text);
  } catch (e: any) {
    throw new Error(`Invalid JSON at ${rel}: ${e?.message || String(e)}`);
  }
  if (isExpanseFile(rel)) data = repairExpanseScene(data);
  if (isExpanseFile(rel)) {
    const normalized = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    if (normalized !== text) {
      await fs.writeFile(full, normalized, "utf-8");
    }
  }
  return { data, text, full };
}

async function writeJsonFile(rel: string, data: any): Promise<void> {
  const full = resolvePathStrict(rel);
  const clone = typeof data === "string" ? data : JSON.parse(JSON.stringify(data));
  const normalized = isExpanseFile(rel) && typeof clone !== "string" ? repairExpanseScene(clone) : clone;
  const serialized = typeof normalized === "string" ? normalized : JSON.stringify(normalized, null, 2);
  await fs.writeFile(full, serialized, "utf-8");
}

function decodePointerToken(token: string): string {
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

function parsePointer(pointer: string): string[] {
  if (pointer === "" || pointer === "/") return [];
  if (!pointer.startsWith("/")) throw new Error("Pointer must start with '/'");
  return pointer
    .slice(1)
    .split("/")
    .map(decodePointerToken);
}

function isIndexKey(k: string): boolean {
  return /^\d+$/.test(k);
}

function getAtPointer(root: any, pointer: string): any {
  const parts = parsePointer(pointer);
  let node = root;
  for (const p of parts) {
    if (node == null) return undefined;
    if (Array.isArray(node) && isIndexKey(p)) node = node[Number(p)];
    else node = node[p as keyof typeof node];
  }
  return node;
}

function setAtPointer(root: any, pointer: string, value: any): void {
  const parts = parsePointer(pointer);
  if (parts.length === 0) throw new Error("Cannot set root via pointer; write the whole file instead");
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const nextK = parts[i + 1];
    if (Array.isArray(node)) {
      const idx = isIndexKey(k) ? Number(k) : NaN;
      if (Number.isNaN(idx)) throw new Error(`Expected array index at '${k}'`);
      if (node[idx] == null) node[idx] = isIndexKey(nextK) ? [] : {};
      node = node[idx];
    } else {
      if (!(k in node) || node[k] == null) (node as any)[k] = isIndexKey(nextK) ? [] : {};
      node = (node as any)[k];
    }
  }
  const leaf = parts[parts.length - 1];
  if (Array.isArray(node) && isIndexKey(leaf)) node[Number(leaf)] = value;
  else (node as any)[leaf] = value;
}

function removeAtPointer(root: any, pointer: string): boolean {
  const parts = parsePointer(pointer);
  if (parts.length === 0) throw new Error("Cannot remove root");
  const parentPtr = "/" + parts.slice(0, -1).map(p => p.replace(/~/g, "~0").replace(/\//g, "~1")).join("/");
  const key = parts[parts.length - 1];
  const parent = parts.length === 1 ? root : getAtPointer(root, parentPtr);
  if (parent == null) return false;
  if (Array.isArray(parent) && isIndexKey(key)) {
    const idx = Number(key);
    if (idx < 0 || idx >= parent.length) return false;
    parent.splice(idx, 1);
    return true;
  }
  if (Object.prototype.hasOwnProperty.call(parent, key)) {
    delete parent[key];
    return true;
  }
  return false;
}

function pushAtPointer(root: any, pointer: string, value: any): void {
  const arr = getAtPointer(root, pointer);
  if (!Array.isArray(arr)) throw new Error(`Target at ${pointer} is not an array`);
  arr.push(value);
}

function mergeAtPointer(root: any, pointer: string, value: any): void {
  const obj = getAtPointer(root, pointer);
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) throw new Error(`Target at ${pointer} is not an object`);
  Object.assign(obj, value);
}

type ArrayHit = { pointer: string; key: string; length: number };
function findCandidateArrays(root: any, keys: string[] = ["entities", "nodes", "objects", "scenes", "spaces", "children"]): ArrayHit[] {
  const hits: ArrayHit[] = [];
  function walk(node: any, ptrParts: string[]) {
    if (!node || typeof node !== "object") return;
    if (!Array.isArray(node)) {
      for (const k of Object.keys(node)) {
        const v = (node as any)[k];
        if (Array.isArray(v) && keys.includes(k)) {
          const pointer = "/" + [...ptrParts, k].map(p => p.replace(/~/g, "~0").replace(/\//g, "~1")).join("/");
          hits.push({ pointer, key: k, length: v.length });
        }
        walk(v, [...ptrParts, k]);
      }
    } else {
      for (let i = 0; i < node.length; i++) {
        walk(node[i], [...ptrParts, String(i)]);
      }
    }
  }
  walk(root, []);
  return hits;
}

export function registerDesktopTools(server: Server) {
  // desktop_guess_scene
  server.tool(
    "desktop_guess_scene",
    "Heuristically find scene/config JSON files used by 8th Wall Desktop",
    { maxDepth: z.number().optional(), maxFiles: z.number().optional() },
    async (args: any) => {
      const root = getProjectRoot();
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

  // desktop_read_json
  server.tool(
    "desktop_read_json",
    "Read a JSON file (optionally at a JSON Pointer)",
    { path: z.string(), pointer: z.string().optional(), maxBytes: z.number().optional() },
    async (args: any) => {
      const rel = String(args.path);
      const maxBytes = typeof args.maxBytes === "number" ? args.maxBytes : 4 * 1024 * 1024;
      const { data, text } = await readJsonFile(rel);
      const truncated = text.length > maxBytes;
      if (args.pointer) {
        const value = getAtPointer(data, String(args.pointer));
        const payload = { path: rel, pointer: args.pointer, truncated, value };
        return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
      }
      const payload = { path: rel, truncated, json: data };
      return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
    }
  );

  // desktop_write_json
  server.tool(
    "desktop_write_json",
    "Write a whole JSON object to a file (optionally create parent dirs)",
    { path: z.string(), json: z.any(), createDirs: z.boolean().optional(), backup: z.boolean().optional() },
    async (args: any) => {
      const rel = String(args.path);
      const full = resolvePathStrict(rel);
      if (args.createDirs) await ensureDir(path.dirname(full));
      let payload = args.json;
      if (typeof payload === "string") {
        try {
          payload = parseJsonLoose(payload);
        } catch (e: any) {
          throw new Error(`Invalid JSON payload: ${e?.message || String(e)}`);
        }
      }
      if (args.backup) {
        try { const orig = await fs.readFile(full, "utf-8"); await fs.writeFile(full + ".bak", orig, "utf-8"); } catch {}
      }
      await writeJsonFile(rel, payload);
      const info = { path: rel };
      return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
    }
  );

  // desktop_patch_json
  server.tool(
    "desktop_patch_json",
    "Patch a JSON file using simple ops: set/remove/push/merge with JSON Pointer paths",
    {
      path: z.string(),
      ops: z.array(
        z.union([
          z.object({ op: z.literal("set"), pointer: z.string(), value: z.any() }),
          z.object({ op: z.literal("remove"), pointer: z.string() }),
          z.object({ op: z.literal("push"), pointer: z.string(), value: z.any() }),
          z.object({ op: z.literal("merge"), pointer: z.string(), value: z.record(z.any()) })
        ])
      ),
      backup: z.boolean().optional()
    },
    async (args: any) => {
      const rel = String(args.path);
      const { data, text } = await readJsonFile(rel);
      const obj = data;
      const results: { op: string; pointer: string; ok: boolean; error?: string }[] = [];
      for (const op of args.ops as any[]) {
        try {
          if (op.op === "set") setAtPointer(obj, op.pointer, op.value);
          else if (op.op === "remove") removeAtPointer(obj, op.pointer);
          else if (op.op === "push") pushAtPointer(obj, op.pointer, op.value);
          else if (op.op === "merge") mergeAtPointer(obj, op.pointer, op.value);
          results.push({ op: op.op, pointer: op.pointer, ok: true });
        } catch (e: any) {
          results.push({ op: op.op, pointer: op.pointer, ok: false, error: e?.message || String(e) });
        }
      }
      if (args.backup) {
        try {
          const full = resolvePathStrict(rel);
          await fs.writeFile(full + ".bak", text, "utf-8");
        } catch {}
      }
      await writeJsonFile(rel, obj);
      const payload = { path: rel, results };
      return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
    }
  );

  // desktop_find_arrays
  server.tool(
    "desktop_find_arrays",
    "Find likely arrays for scene contents (entities/nodes/objects/scenes/spaces)",
    { path: z.string(), keys: z.array(z.string()).optional() },
    async (args: any) => {
      const rel = String(args.path);
      const { data } = await readJsonFile(rel);
      const obj = data;
      const keys = (args.keys as string[] | undefined) || ["entities", "nodes", "objects", "scenes", "spaces", "children"];
      const hits = findCandidateArrays(obj, keys);
      const payload = { path: rel, hits };
      return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
    }
  );

  // desktop_add_entity_best_effort
  server.tool(
    "desktop_add_entity_best_effort",
    "Add an object into the first matching array (entities/nodes/objects/children) in a JSON config",
      { path: z.string(), entity: z.record(z.any()), preferPath: z.string().optional(), keys: z.array(z.string()).optional(), backup: z.boolean().optional() },
    async (args: any) => {
      const rel = String(args.path);
      const { data, text } = await readJsonFile(rel);
      const obj = data;
      const entity = args.entity as Record<string, any>;
      const keys = (args.keys as string[] | undefined) || ["entities", "nodes", "objects", "children"];

      let targetPtr: string | null = null;
      if (args.preferPath) {
        const arr = getAtPointer(obj, String(args.preferPath));
        if (Array.isArray(arr)) targetPtr = String(args.preferPath);
      }
      if (!targetPtr) {
        const hits = findCandidateArrays(obj, keys);
        if (hits.length > 0) targetPtr = hits[0].pointer;
      }
      if (!targetPtr) throw new Error("No suitable array found to insert entity. Try desktop_find_arrays to locate one or pass preferPath.");
      pushAtPointer(obj, targetPtr, entity);
      if (args.backup) {
        try {
          const full = resolvePathStrict(rel);
          await fs.writeFile(full + ".bak", text, "utf-8");
        } catch {}
      }
      await writeJsonFile(rel, obj);
      const payload = { path: rel, insertedAt: targetPtr };
      return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
    }
  );
}
