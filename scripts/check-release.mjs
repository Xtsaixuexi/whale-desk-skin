import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import '../tools/config-core.js';
const root = fileURLToPath(new URL('../', import.meta.url)), skin = path.join(root, 'skins/whale-desk');
const failures = [], visited = new Set(); let references = 0, artHashes = 0;
const rel = file => path.relative(root, file).replaceAll('\\', '/');
function reference(from, ref) {
  if (!ref || /^(?:[a-z][\w+.-]*:|#|\/\/)/i.test(ref)) return;
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]); if (!clean) return;
  const target = path.resolve(path.dirname(from), clean); references++;
  if (!target.startsWith(root) || !fs.existsSync(target)) failures.push(rel(from) + ': missing/outside reference ' + ref);
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', '.whale-desk-backups'].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) { failures.push('Unexpected symlink: ' + rel(file)); return []; }
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root);
const manifestPath = path.join(skin, 'skin.json'), manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.skinManifestVersion !== 2 || manifest.id !== 'whale-desk' || manifest.version !== '1.1.1') failures.push('Unexpected manifest identity/version');
if (manifest.facets || manifest.requires) failures.push('Default package must not register hooks');
if (manifest.sourceUrl?.includes('Alphazerolan')) failures.push('Upstream is not this project release URL');
for (const ref of [manifest.contributes.stylesheet, manifest.contributes.patches, ...Object.values(manifest.preview), ...Object.values(manifest.contributes.backgroundMedia).map(x => x.src)]) reference(manifestPath, ref);
for (const file of files) {
  const stat = fs.statSync(file); if (stat.size >= 100 * 1024 * 1024) failures.push('GitHub file too large: ' + rel(file));
  const ext = path.extname(file);
  if (!['.css', '.svg', '.html', '.md', '.js', '.mjs', '.json'].includes(ext)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (/C:[/\\]Users[/\\]/i.test(text)) failures.push('Private machine path: ' + rel(file));
  if (['.css', '.svg', '.html'].includes(ext)) {
    for (const m of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
      reference(file, m[1]); if (/^https?:/i.test(m[1])) failures.push('Remote stylesheet resource: ' + rel(file));
    }
    for (const m of text.matchAll(/(?:src|(?:xlink:)?href)\s*=\s*["']([^"']+)["']/g)) reference(file, m[1]);
  }
  if (ext === '.md') for (const m of text.matchAll(/!?\[[^\]]*\]\(([^\s)]+)\)/g)) reference(file, m[1]);
}
for (const name of ['README.md', 'README.en.md', 'INSTALL.md', 'LICENSE', 'LICENSE-ARTWORK', 'CHANGELOG.md', 'CONTRIBUTING.md', 'docs/PARITY.md', 'docs/COMPONENTS.md', 'docs/TESTING.md', 'tools/editor.html', 'skins/whale-desk/NOTICE', 'skins/whale-desk/ARTWORK.json']) reference(path.join(root, 'check'), name);
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const art = JSON.parse(fs.readFileSync(path.join(skin, 'ARTWORK.json'), 'utf8'));
if (art.images.length !== 14 || art.customImages.length !== 2) failures.push('Expected 14 inherited illustrations and two custom assets');
for (const item of [...art.images, ...art.customImages]) {
  reference(path.join(skin, 'ARTWORK.json'), item.path);
  const file = path.join(skin, item.path);
  if (!fs.existsSync(file)) continue;
  if (hash(fs.readFileSync(file)) !== (item.packagedSha256 || item.sha256)) failures.push('Artwork hash mismatch: ' + item.path);
  artHashes++;
  if (item.packagedSha256) {
    const images = [...fs.readFileSync(file, 'utf8').matchAll(/data:image\/[^;]+;base64,([^"']+)/g)].map(m => Buffer.from(m[1], 'base64')).sort((a, b) => b.length - a.length);
    if (!images.length || hash(images[0]) !== item.sha256) failures.push('Inherited image pixels changed: ' + item.path);
  }
}
const patch = fs.readFileSync(path.join(skin, 'patches.css'), 'utf8');
if (patch.includes('/* WHALE DESK DIY START */')) failures.push('Personal DIY content is present. Save your config and run configure.mjs --reset before publishing.');
const override = fs.readFileSync(path.join(skin, 'DESK-OVERRIDES.css'), 'utf8').trim();
if (!patch.trimEnd().endsWith(override)) failures.push('Finishing layer differs: run scripts/sync-overrides.mjs');
if (hash(fs.readFileSync(path.join(skin, 'preview/desk.png'))) !== hash(fs.readFileSync(path.join(skin, 'assets/desk/home.png')))) failures.push('Catalog art must match documented wallpaper preview');
globalThis.WhaleDeskConfig.normalize({});
for (const font of ['assets/LXGWWenKai-Medium.ttf', 'assets/LongCang-Regular-v215.ttf', 'assets/LXGWWenKai-OFL.txt', 'assets/LongCang-OFL-v215.txt']) reference(manifestPath, font);
const largest = files.map(file => ({ path: rel(file), bytes: fs.statSync(file).size })).sort((a, b) => b.bytes - a.bytes)[0];
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(JSON.stringify({ status: 'PASS', version: manifest.version, files: files.length, localReferences: references, artworkHashes: artHashes, embeddedRasterHashes: 14, largestFile: largest, runtimeRegression: 'pending; see docs/TESTING.md' }, null, 2));
