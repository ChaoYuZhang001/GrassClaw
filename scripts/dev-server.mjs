import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';

const args = process.argv.slice(2);
const getArg = (flag, fallback) => { const index = args.indexOf(flag); return index === -1 ? fallback : (args[index + 1] || fallback); };
const port = Number(getArg('--port', '4173'));
const host = getArg('--host', '127.0.0.1');
const root = resolve(process.cwd(), getArg('--root', '.'));
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.icns': 'image/icns', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8' };

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = normalize(rawPath).replace(/^\.+/, '');
  let filePath = resolve(root, `.${safePath}`);
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end(`Not found: ${rawPath}`); return; }
  res.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
});
server.listen(port, host, () => { console.log(`[dev-server] serving ${root}`); console.log(`[dev-server] http://${host}:${port}/apps/web/`); });
