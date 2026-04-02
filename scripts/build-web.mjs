import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const item of ['apps', 'packages']) cpSync(resolve(root, item), resolve(dist, item), { recursive: true });
for (const file of ['README.md', 'CHANGELOG.md']) if (existsSync(resolve(root, file))) cpSync(resolve(root, file), resolve(dist, file));
console.log(`[build-web] copied static project into ${dist}`);
console.log('[build-web] deploy dist/apps/web as a static site or bundle it with Tauri.');
