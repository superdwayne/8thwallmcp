import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { execFile } from "node:child_process";
import os from "node:os";

type Server = any;

function projectRoot(): string {
  const root = process.env.PROJECT_ROOT || path.resolve(process.cwd(), "project");
  return root;
}

function desktopBaseDir(): string {
  if (process.env.EIGHTHWALL_DESKTOP_ROOT) return process.env.EIGHTHWALL_DESKTOP_ROOT;
  const home = os.homedir();
  const a = path.join(home, "Documents", "8th Wall");
  const b = path.join(home, "Documents", "8th-Wall");
  try { const stA = fs.stat(a); } catch {}
  // Prefer the path that exists
  return (fscExistsSync(a) ? a : (fscExistsSync(b) ? b : a));
}

function fscExistsSync(p: string): boolean {
  try { require("node:fs").accessSync(p); return true; } catch { return false; }
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

function resolvePathStrict(relPath: string): string {
  const root = projectRoot();
  const full = path.resolve(root, relPath);
  const rel = path.relative(root, full);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Path escapes project root");
  }
  return full;
}

async function listAllFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(d: string, baseRel: string) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      const rel = path.join(baseRel, e.name);
      if (e.isDirectory()) await walk(full, rel);
      else out.push(rel);
    }
  }
  await walk(dir, "");
  return out;
}

export function registerProjectTools(server: Server) {
  // project_get_root
  server.tool(
    "project_get_root",
    "Return the current PROJECT_ROOT used by tools",
    async () => {
      const data = { projectRoot: projectRoot() };
      return { content: [ { type: "text", text: JSON.stringify(data, null, 2) } ] };
    }
  );

  // project_set_root
  server.tool(
    "project_set_root",
    "Set PROJECT_ROOT at runtime to target another folder (e.g., 8th Wall Desktop project)",
    { path: z.string() },
    async (args: any) => {
      const candidate = path.resolve(String(args.path));
      const st = await fs.stat(candidate).catch(() => null);
      if (!st || !st.isDirectory()) throw new Error("Path does not exist or is not a directory");
      process.env.PROJECT_ROOT = candidate;
      const data = { projectRoot: candidate };
      return { content: [ { type: "text", text: JSON.stringify(data, null, 2) } ] };
    }
  );

  // desktop_list_projects
  server.tool(
    "desktop_list_projects",
    "List candidate 8th Wall Desktop project folders under ~/Documents/8th Wall",
    async () => {
      const base = desktopBaseDir();
      const out: { name: string; path: string; likely: boolean; hints: { hasIndexRoot: boolean; hasIndexPublic: boolean; hasPackage: boolean } }[] = [];
      const entries = await fs.readdir(base, { withFileTypes: true }).catch(() => [] as any);
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const full = path.join(base, e.name);
        // Heuristics for likely projects
        const candidates = [
          path.join(full, "index.html"),
          path.join(full, "public", "index.html"),
          path.join(full, "package.json")
        ];
        const hasIndexRoot = await fs.access(candidates[0]).then(()=>true).catch(()=>false);
        const hasIndexPublic = await fs.access(candidates[1]).then(()=>true).catch(()=>false);
        const hasPackage = await fs.access(candidates[2]).then(()=>true).catch(()=>false);
        const likely = hasIndexRoot || hasIndexPublic || hasPackage;
        out.push({ name: e.name, path: full, likely, hints: { hasIndexRoot, hasIndexPublic, hasPackage } });
      }
      const data = { base, projects: out };
      return { content: [ { type: "text", text: JSON.stringify(data, null, 2) } ] };
    }
  );

  // desktop_set_project: set PROJECT_ROOT to a child folder under Desktop root by name
  server.tool(
    "desktop_set_project",
    "Set PROJECT_ROOT to ~/Documents/8th Wall/<name> (or EIGHTHWALL_DESKTOP_ROOT/<name>)",
    { name: z.string() },
    async (args: any) => {
      const base = desktopBaseDir();
      const chosen = path.join(base, String(args.name));
      const st = await fs.stat(chosen).catch(() => null);
      if (!st || !st.isDirectory()) throw new Error(`Project folder not found: ${chosen}`);
      process.env.PROJECT_ROOT = chosen;
      const data = { projectRoot: chosen };
      return { content: [ { type: "text", text: JSON.stringify(data, null, 2) } ] };
    }
  );
  // project.get_info (analogous to get_scene_info)
  server.tool(
    "project_get_info",
    "Summarize project structure (files and folders) under PROJECT_ROOT",
    async () => {
      const root = projectRoot();
      await ensureDir(root);
      const files = await listAllFiles(root);
      const stats = await Promise.all(
        files.map(async (rel) => {
          const full = path.join(root, rel);
          const st = await fs.stat(full);
          return { path: rel, size: st.size };
        })
      );
      return { content: [ { type: "text", text: JSON.stringify({ root, files: stats }, null, 2) } ] };
    }
  );

  // project.list_files
  server.tool(
    "project_list_files",
    "List files under a subdirectory of PROJECT_ROOT",
    { dir: z.string().optional(), maxDepth: z.number().optional(), pattern: z.string().optional(), dirsOnly: z.boolean().optional() },
    async (args: any) => {
      const root = projectRoot();
      await ensureDir(root);
      const dir = String(args?.dir || ".");
      const full = resolvePathStrict(dir);
      const maxDepth = typeof args?.maxDepth === "number" ? Math.max(0, Math.floor(args.maxDepth)) : 1;
      const filter = args?.pattern ? new RegExp(String(args.pattern)) : null;
      const dirsOnly = args?.dirsOnly === true;
      const results: { name: string; dir: boolean; size: number }[] = [];
      async function walk(curr: string, depth: number) {
        const entries = await fs.readdir(curr, { withFileTypes: true });
        for (const e of entries) {
          const fullPath = path.join(curr, e.name);
          const relName = path.relative(full, fullPath);
          const st = await fs.stat(fullPath);
          const isDir = e.isDirectory();
          if (!filter || filter.test(relName)) {
            if (!dirsOnly || isDir) {
              results.push({ name: relName, dir: isDir, size: isDir ? 0 : st.size });
            }
          }
          if (depth < maxDepth && isDir) await walk(fullPath, depth + 1);
        }
      }
      await walk(full, 0);
      return { content: [ { type: "text", text: JSON.stringify({ dir, maxDepth, count: results.length, items: results }, null, 2) } ] };
    }
  );

  // project.read_file (analogous to get_object_info)
  server.tool(
    "project_read_file",
    "Read a text file under PROJECT_ROOT",
    { path: z.string(), maxBytes: z.number().optional() },
    async (args: any) => {
      const full = resolvePathStrict(String(args.path));
      const maxBytes = typeof args.maxBytes === "number" ? args.maxBytes : 1024 * 1024;
      const buf = await fs.readFile(full);
      const text = buf.slice(0, maxBytes).toString("utf-8");
      const truncated = buf.length > maxBytes;
      return { content: [ { type: "text", text: JSON.stringify({ path: args.path, truncated, text }, null, 2) } ] };
    }
  );

  // project.write_file (analogous to code execution/change)
  server.tool(
    "project_write_file",
    "Write text to a file under PROJECT_ROOT (creates dirs if needed)",
    { path: z.string(), content: z.string(), createDirs: z.boolean().optional() },
    async (args: any) => {
      const rel = String(args.path);
      const full = resolvePathStrict(rel);
      if (args.createDirs !== false) await ensureDir(path.dirname(full));
      await fs.writeFile(full, args.content, "utf-8");
      return { content: [{ type: "text", text: `Wrote ${rel}` }] };
    }
  );

  // project.delete_file
  server.tool(
    "project_delete_file",
    "Delete a file under PROJECT_ROOT",
    { path: z.string() },
    async (args: any) => {
      const rel = String(args.path);
      const full = resolvePathStrict(rel);
      await fs.rm(full, { force: true });
      return { content: [{ type: "text", text: `Deleted ${rel}` }] };
    }
  );

  // project.move_file
  server.tool(
    "project_move_file",
    "Move/rename a file within PROJECT_ROOT",
    { from: z.string(), to: z.string() },
    async (args: any) => {
      const from = resolvePathStrict(String(args.from));
      const to = resolvePathStrict(String(args.to));
      await ensureDir(path.dirname(to));
      await fs.rename(from, to);
      return { content: [{ type: "text", text: `Moved ${args.from} -> ${args.to}` }] };
    }
  );

  // project.scaffold (creates a minimal 8th Wall-style web app shell)
  server.tool(
    "project_scaffold",
    "Create a minimal web XR app structure (index.html, main.js, styles.css)",
    { overwrite: z.boolean().optional(), template: z.enum(["aframe", "three"]).optional() },
    async (args: any) => {
      const root = projectRoot();
      await ensureDir(root);
      const tmpl = (args?.template || "aframe") as "aframe" | "three";

      const files: Record<string, string> = tmpl === "aframe"
        ? {
            "index.html": `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <title>XR App (A-Frame)</title>\n  <link rel=\"stylesheet\" href=\"styles.css\" />\n  <script src=\"https://aframe.io/releases/1.5.0/aframe.min.js\"></script>\n</head>\n<body>\n  <a-scene background=\"color: #ECECEC\">\n    <a-entity position=\"0 1.6 0\"></a-entity>\n    <a-box position=\"-1 0.5 -3\" rotation=\"0 45 0\" color=\"#4CC3D9\" shadow></a-box>\n    <a-sphere position=\"0 1.25 -5\" radius=\"1.25\" color=\"#EF2D5E\" shadow></a-sphere>\n    <a-cylinder position=\"1 0.75 -3\" radius=\"0.5\" height=\"1.5\" color=\"#FFC65D\" shadow></a-cylinder>\n    <a-plane position=\"0 0 -4\" rotation=\"-90 0 0\" width=\"4\" height=\"4\" color=\"#7BC8A4\" shadow></a-plane>\n    <a-sky color=\"#ECECEC\"></a-sky>\n  </a-scene>\n  <script type=\"module\" src=\"main.js\"></script>\n</body>\n</html>\n`,
            "main.js": `console.log('A-Frame scene ready');`,
            "styles.css": `html,body{height:100%}body{margin:0;font-family:system-ui,sans-serif}`
          }
        : {
            "index.html": `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <title>XR App (Three.js)</title>\n  <link rel=\"stylesheet\" href=\"styles.css\" />\n</head>\n<body>\n  <canvas id=\"app\"></canvas>\n  <script type=\"module\" src=\"main.js\"></script>\n</body>\n</html>\n`,
            "main.js": `import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';\nimport { VRButton } from 'https://unpkg.com/three@0.160.0/examples/jsm/webxr/VRButton.js';\n\nconst canvas = document.querySelector('#app');\nconst renderer = new THREE.WebGLRenderer({ canvas, antialias: true });\nrenderer.setSize(window.innerWidth, window.innerHeight);\nrenderer.setPixelRatio(Math.min(2, window.devicePixelRatio));\nrenderer.xr.enabled = true;\ndocument.body.appendChild(VRButton.createButton(renderer));\n\nconst scene = new THREE.Scene();\nscene.background = new THREE.Color(0xececec);\nconst camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 100);\ncamera.position.set(0, 1.6, 3);\n\nconst light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);\nscene.add(light);\n\nconst geo = new THREE.BoxGeometry(1,1,1);\nconst mat = new THREE.MeshStandardMaterial({ color: 0x4CC3D9 });\nconst cube = new THREE.Mesh(geo, mat);\ncube.position.set(0, 1.5, -2);\nscene.add(cube);\n\nfunction onResize(){\n  camera.aspect = window.innerWidth/window.innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize(window.innerWidth, window.innerHeight);\n}\nwindow.addEventListener('resize', onResize);\n\nfunction animate(){\n  cube.rotation.y += 0.01;\n}\n\nrenderer.setAnimationLoop(()=>{\n  animate();\n  renderer.render(scene, camera);\n});\n`,
            "styles.css": `html,body{height:100%}body{margin:0;font-family:system-ui,sans-serif}#app{display:block;width:100%;height:100%}`
          };
      const created: string[] = [];
      for (const [rel, content] of Object.entries(files)) {
        const full = resolvePathStrict(rel);
        try {
          if (!args.overwrite) {
            await fs.access(full);
            continue; // exists
          }
        } catch {
          // does not exist
        }
        await ensureDir(path.dirname(full));
        await fs.writeFile(full, content, "utf-8");
        created.push(rel);
      }
      return { content: [{ type: "json", json: { root, created, template: tmpl } }] };
    }
  );

  // project.export_zip (best-effort using system zip)
  server.tool(
    "project_export_zip",
    "Export the project directory to a zip archive in the workspace",
    { outPath: z.string().optional() },
    async (args: any) => {
      const root = projectRoot();
      const out = String(args.outPath || `project-export-${Date.now()}.zip`);
      const outFull = path.isAbsolute(out) ? out : path.resolve(process.cwd(), out);
      await new Promise<void>((resolve, reject) => {
        execFile("zip", ["-r", outFull, "."], { cwd: root }, (err, stdout, stderr) => {
          if (err) return reject(new Error(`zip failed: ${stderr || err.message}`));
          resolve();
        });
      });
      return { content: [{ type: "json", json: { archive: outFull } }] };
    }
  );
}
