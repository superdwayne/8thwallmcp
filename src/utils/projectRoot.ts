import fs from "node:fs";
import path from "node:path";
import os from "node:os";

let cachedProjectRoot: string | null = null;

const desktopMarkers = [".expanse.json", "expanse.json", "project.json", "scene.json", "app.json", "Config.json"]; // best-effort markers

export function isLikelyDesktopProject(dir: string): boolean {
  for (const marker of desktopMarkers) {
    const candidate = path.join(dir, marker);
    try {
      if (fs.existsSync(candidate)) return true;
    } catch {}
  }
  try {
    const spaces = path.join(dir, "spaces");
    if (fs.existsSync(spaces) && fs.statSync(spaces).isDirectory()) return true;
  } catch {}
  try {
    const configDir = path.join(dir, "config");
    if (fs.existsSync(configDir) && fs.statSync(configDir).isDirectory()) return true;
  } catch {}
  return false;
}

function discoverDesktopProject(base: string): string | null {
  try {
    const entries = fs.readdirSync(base, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const projectDir = path.join(base, entry.name);
      if (isLikelyDesktopProject(projectDir)) return projectDir;
    }
  } catch {}
  return null;
}

export function getProjectRoot(): string {
  if (process.env.PROJECT_ROOT) {
    cachedProjectRoot = process.env.PROJECT_ROOT;
    return process.env.PROJECT_ROOT;
  }
  if (cachedProjectRoot) return cachedProjectRoot;

  const candidates: string[] = [];
  if (process.env.EIGHTHWALL_DESKTOP_ROOT) {
    candidates.push(process.env.EIGHTHWALL_DESKTOP_ROOT);
  }
  const home = os.homedir();
  candidates.push(path.join(home, "Documents", "8th-Wall"));
  candidates.push(path.join(home, "Documents", "8th Wall"));

  for (const base of candidates) {
    const detected = discoverDesktopProject(base);
    if (detected) {
      process.env.PROJECT_ROOT = detected;
      cachedProjectRoot = detected;
      return detected;
    }
  }

  const fallback = path.resolve(process.cwd(), "project");
  cachedProjectRoot = fallback;
  return fallback;
}

export function resetCachedProjectRoot(root?: string) {
  cachedProjectRoot = root ?? null;
  if (root) {
    process.env.PROJECT_ROOT = root;
  }
}
