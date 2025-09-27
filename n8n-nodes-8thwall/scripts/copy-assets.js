// Copy non-TS assets (e.g., icons) from src to dist in the same relative paths
// Minimal, no extra deps
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

async function ensureDir(p){ await fsp.mkdir(p, { recursive: true }); }

async function copyIfExists(rel){
  const src = path.join(__dirname, '..', 'src', rel);
  const dst = path.join(__dirname, '..', 'dist', rel);
  try {
    await fsp.access(src);
  } catch {
    return; // no source
  }
  await ensureDir(path.dirname(dst));
  await fsp.copyFile(src, dst);
}

(async () => {
  // Known assets
  await copyIfExists('nodes/EighthWall/wall.svg');
})().catch((e) => { console.error(e); process.exit(1); });

