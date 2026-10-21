import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalize, compile, applyConfiguration, stripCustomization, START } from '../scripts/configure.mjs';
const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfWQAAAAASUVORK5CYII=';
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'whale-desk-test-'));
  const skin = path.join(root, 'whale-desk'); fs.mkdirSync(skin);
  fs.writeFileSync(path.join(skin, 'skin.json'), JSON.stringify({ id: 'whale-desk', skinManifestVersion: 2 }));
  fs.writeFileSync(path.join(skin, 'patches.css'), 'body{color:purple;}\n');
  t.after(() => { if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('whale-desk-test-')) throw Error('Unexpected cleanup target'); fs.rmSync(root, { recursive: true, force: true }); });
  return skin;
}
test('defaults keep readable light and dark palettes', () => { const c = normalize({}); assert.equal(c.composerWidth, 760); assert.equal(c.fontSize, 16); assert.equal(Object.keys(c.images).length, 0); assert.match(compile(c), /max-width:760px/); });
test('reject malformed types, unknown fields, sizes and invisible text', () => {
  for (const c of [null, [], { composerWidth: 100 }, { composerWidth: '760' }, { fontSize: 21 }, { schemaVersion: 2 }, { light: null }, { font: 'url(evil)' }, { light: { ink: '#fffaf4' } }, { pet: true }]) assert.throws(() => normalize(c));
});
test('motto is escaped as CSS code points, never as raw selectors', () => { const css = compile({ motto: '"};body{display:none}/*' }); assert.ok(!css.includes('body{display:none}')); assert.match(css, /\\22 /); });
test('all 14 image regions support default, hidden and local raster data', () => {
  for (const region of Object.keys(globalThis.WhaleDeskConfig.regionNames)) {
    assert.match(compile({ images: { [region]: false } }), /display:none!important/);
    assert.ok(compile({ images: { [region]: tinyPng } }).includes(tinyPng));
    assert.ok(!compile({ images: { [region]: null } }).includes(tinyPng));
  }
});
test('remote URLs, SVG payloads and fake image headers are rejected', () => {
  for (const img of ['https://example.com/a.png', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,YWJjZA==']) assert.throws(() => normalize({ images: { home: img } }));
  assert.throws(() => normalize({ images: { mystery: tinyPng } }));
});
test('repeated application replaces one block and keeps a recoverable backup', t => {
  const skin = fixture(t), file = path.join(skin, 'patches.css');
  const first = applyConfiguration(skin, { composerWidth: 680 });
  assert.equal(fs.readFileSync(path.join(first.backup, 'patches.css'), 'utf8'), 'body{color:purple;}\n');
  applyConfiguration(skin, { composerWidth: 720 });
  const text = fs.readFileSync(file, 'utf8'); assert.equal(text.split(START).length, 2); assert.match(text, /max-width:720px/); assert.ok(!text.includes('max-width:680px'));
  applyConfiguration(skin, {}, { reset: true }); assert.equal(fs.readFileSync(file, 'utf8'), 'body{color:purple;}\n');
});
test('bad config causes no mutation or backup', t => {
  const skin = fixture(t); assert.throws(() => applyConfiguration(skin, { composerWidth: 10 }));
  assert.equal(fs.readFileSync(path.join(skin, 'patches.css'), 'utf8'), 'body{color:purple;}\n'); assert.ok(!fs.existsSync(path.join(skin, '.whale-desk-backups')));
});
test('refuses to overwrite another skin', t => { const skin = fixture(t); fs.writeFileSync(path.join(skin, 'skin.json'), '{"id":"diy-journal","skinManifestVersion":2}'); assert.throws(() => applyConfiguration(skin, {})); });
test('corrupted or ambiguous patch markers fail without truncating content', () => {
  for (const text of [START, '/* WHALE DESK DIY END */', START + '\n' + START + '\n/* WHALE DESK DIY END */', START + '\n/* WHALE DESK DIY END */\nbody{color:red}']) assert.throws(() => stripCustomization(text));
});
test('node CLI and browser share the same compiled palette and width rules', () => {
  const result = compile({ composerWidth: 900, dark: { accent: '#e6bad9' } }); assert.match(result, /--desk-accent:#e6bad9/); assert.match(result, /max-width:900px/);
});
