import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { secret } from './store.mjs';
import { createApp } from './app.mjs';

const host = process.env.HOST || '127.0.0.1', port = Number(process.env.PORT || 4318);
const publicUrl = process.env.PUBLIC_URL || `http://127.0.0.1:${port}`;
const loopback = ['127.0.0.1', 'localhost', '::1'].includes(host);
let adminKey = process.env.ADMIN_KEY;
if (!adminKey && loopback) {
  mkdirSync('.local', { recursive: true });
  const file = '.local/admin-key.txt';
  if (!existsSync(file)) writeFileSync(file, secret(), { mode: 0o600 });
  adminKey = readFileSync(file, 'utf8').trim();
}
if (!adminKey || adminKey.length < 24) throw new Error('ADMIN_KEY 至少需要 24 个字符。公网部署必须自行设置。');
if (!loopback && !publicUrl.startsWith('https://')) throw new Error('公网部署 PUBLIC_URL 必须使用 HTTPS。');
const aiMode = process.env.AI_MODE || 'demo';
if (!['demo', 'deepseek'].includes(aiMode)) throw new Error('AI_MODE 只能是 demo 或 deepseek');
const app = createApp({ publicUrl, adminKey, dbPath: resolve(process.env.DATA_DIR || './data', 'companion.sqlite'), aiMode, apiKey: process.env.DEEPSEEK_API_KEY, model: process.env.DEEPSEEK_MODEL || 'deepseek-flash' });
app.server.listen(port, host, () => console.log(`鲸伴已启动：${publicUrl}\n模式：${aiMode}\n本地初始密钥位置：.local/admin-key.txt（不要公开此文件）`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void app.close().then(() => process.exit(0)); });
