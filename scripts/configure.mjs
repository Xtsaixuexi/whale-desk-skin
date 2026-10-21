import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import '../tools/config-core.js';
export const { normalize, compile } = globalThis.WhaleDeskConfig;
export const START = '/* WHALE DESK DIY START */';
export const END = '/* WHALE DESK DIY END */';
const root = fileURLToPath(new URL('../', import.meta.url));
export function stripCustomization(text) {
  const start = text.indexOf(START), end = text.indexOf(END);
  if (start < 0 && end < 0) return text.trimEnd() + '\n';
  if (start < 0 || end < start || text.indexOf(START, start + START.length) >= 0 || text.indexOf(END, end + END.length) >= 0 || text.slice(end + END.length).trim()) throw Error('DIY 标记不完整或不在文件末尾；请恢复备份');
  return text.slice(0, start).trimEnd() + '\n';
}
export function applyConfiguration(target, value, { reset = false } = {}) {
  const skin = path.resolve(target);
  if (fs.lstatSync(skin).isSymbolicLink()) throw Error('不写入符号链接皮肤目录');
  const canonical = fs.realpathSync(skin);
  if (path.basename(skin) !== 'whale-desk') throw Error('目录名必须是 whale-desk');
  for (const name of ['skin.json', 'patches.css', 'whale-desk.config.json', '.whale-desk-backups']) {
    const file = path.join(skin, name);
    if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) throw Error('拒绝符号链接：' + name);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(skin, 'skin.json'), 'utf8'));
  if (manifest.id !== 'whale-desk' || manifest.skinManifestVersion !== 2) throw Error('目标不是 Whale Desk v2 皮肤');
  const config = normalize(value);
  const patchPath = path.join(canonical, 'patches.css');
  const old = fs.readFileSync(patchPath, 'utf8'), base = stripCustomization(old);
  const next = reset ? base : base + '\n' + START + '\n' + compile(config) + END + '\n';
  const configPath = path.join(canonical, 'whale-desk.config.json');
  const backups = path.join(canonical, '.whale-desk-backups');
  fs.mkdirSync(backups, { recursive: true });
  const backup = fs.mkdtempSync(path.join(backups, new Date().toISOString().replace(/[:.]/g, '-') + '-'));
  fs.copyFileSync(patchPath, path.join(backup, 'patches.css'));
  if (fs.existsSync(configPath)) fs.copyFileSync(configPath, path.join(backup, 'whale-desk.config.json'));
  fs.writeFileSync(patchPath, next);
  fs.writeFileSync(configPath, JSON.stringify(reset ? normalize({}) : config, null, 2) + '\n');
  return { skin: canonical, backup, reset, bytes: Buffer.byteLength(next) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2); let file, target = path.join(root, 'skins/whale-desk'), reset = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--reset') reset = true;
      else if (args[i] === '--config' && args[i + 1]) file = args[++i];
      else if (args[i] === '--skin' && args[i + 1]) target = args[++i];
      else throw Error('用法：node scripts/configure.mjs --config FILE [--skin DIR] 或 --reset [--skin DIR]');
    }
    if ((!file && !reset) || (file && reset)) throw Error('请选择 --config FILE 或 --reset');
    if (file && fs.statSync(file).size > 64 * 1024 * 1024) throw Error('配置文件超过 64 MB');
    const value = file ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    console.log(JSON.stringify(applyConfiguration(target, value, { reset }), null, 2));
    console.log('已写入并备份。请在 DSH 重新选择皮肤，必要时重启。');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
