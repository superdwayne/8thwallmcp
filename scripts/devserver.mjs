import http from 'node:http';
import fs from 'node:fs/promises';
import fscb from 'node:fs';
import path from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const [k, v] = a.split('=');
    if (typeof v === 'undefined') args.set(k.slice(2), process.argv[++i]);
    else args.set(k.slice(2), v);
  }
}

const port = Number(args.get('port') || 5173);
const root = path.resolve(process.cwd(), args.get('root') || 'project');
const host = args.get('host') || '127.0.0.1';

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js':
    case '.mjs': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.hdr':
    case '.exr': return 'application/octet-stream';
    case '.gltf': return 'model/gltf+json';
    case '.glb': return 'model/gltf-binary';
    case '.wasm': return 'application/wasm';
    case '.mp4': return 'video/mp4';
    default: return 'application/octet-stream';
  }
}

function safeJoin(base, reqPath) {
  const decoded = decodeURIComponent((reqPath || '/').split('?')[0]);
  const safe = path.normalize(decoded).replace(/^\/+/, '');
  const full = path.join(base, safe);
  const rel = path.relative(base, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Path escapes root');
  return full;
}

async function fileExists(p) { try { await fs.access(p); return true; } catch { return false; } }

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = req.url || '/';
    let full = safeJoin(root, reqUrl);
    let stat = null;
    try { stat = fscb.statSync(full); } catch { stat = null; }
    if (!stat || stat.isDirectory()) {
      const indexPath = path.join(full, 'index.html');
      if (await fileExists(indexPath)) {
        full = indexPath;
      } else if (path.basename(full) !== 'index.html') {
        const rootIndex = path.join(root, 'index.html');
        if (await fileExists(rootIndex)) full = rootIndex;
      }
    }
    const data = await fs.readFile(full);
    res.statusCode = 200;
    res.setHeader('content-type', contentType(full));
    res.end(data);
  } catch (e) {
    res.statusCode = 404;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Not found');
  }
});

await fs.mkdir(root, { recursive: true });
server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Serving ${root} at http://${host}:${port}/`);
});
