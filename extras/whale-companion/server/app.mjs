import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { Store, HttpError, equalSecret, bounded } from './store.mjs';
import { replyTo } from './model.mjs';

const publicRoot = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' };
const cookieName = 'whale_session';
function sessionToken(req) { return /(?:^|;\s*)whale_session=([^;]+)/.exec(req.headers.cookie || '')?.[1]; }
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, '需要 JSON 请求');
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 20000) throw new HttpError(413, '内容太长'); chunks.push(chunk); }
  try { const data = JSON.parse(Buffer.concat(chunks).toString()); if (data && typeof data === 'object' && !Array.isArray(data)) return data; } catch {}
  throw new HttpError(400, '请求格式不正确');
}
function json(res, status, value, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }); res.end(JSON.stringify(value));
}

export function createApp(config) {
  const origin = new URL(config.publicUrl).origin;
  const secure = origin.startsWith('https:');
  const store = new Store(config.dbPath);
  const streams = new Set(), limits = new Map();
  let working = false, stopping = false, workPromise = Promise.resolve();
  const view = () => ({ ...store.snapshot(), ai: { mode: config.aiMode, configured: config.aiMode === 'demo' || !!config.apiKey } });
  const canStream = stream => !!store.auth(stream.token);
  function publish() {
    for (const stream of streams) {
      if (!canStream(stream)) { stream.res.write('event: revoked\ndata: {}\n\n'); stream.res.end(); streams.delete(stream); continue; }
      if (!stream.res.write(`event: state\ndata: ${JSON.stringify(view())}\n\n`)) { stream.res.end(); streams.delete(stream); }
    }
  }
  function kick() {
    if (working || stopping) return;
    working = true;
    workPromise = (async () => {
      try {
        let row;
        while (!stopping && (row = store.next())) {
          store.thinking(row.id); publish();
          try { store.finish(row.id, await (config.reply || replyTo)(store, row, config)); }
          catch (e) {
            const reason = e.message === 'model-unconfigured' ? '尚未配置模型密钥，请在服务器端配置 DeepSeek。' : '回复未完成，请检查模型额度或网络后手动重试。';
            store.fail(row.id, reason);
          }
          publish();
        }
      } finally { working = false; }
    })();
  }
  function rateLimit(req, group, count, windowMs) {
    const key = `${group}:${req.socket.remoteAddress}`;
    let entry = limits.get(key);
    if (!entry || entry.until <= Date.now()) { entry = { count: 0, until: Date.now() + windowMs }; limits.set(key, entry); }
    if (++entry.count > count) throw new HttpError(429, '操作较频繁，请稍后再试');
  }
  function setSession(res, device) {
    json(res, 200, { ok: true, device: { id: device.id, role: device.role } }, { 'Set-Cookie': `${cookieName}=${device.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure ? '; Secure' : ''}` });
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    try {
      if (req.headers.host !== new URL(origin).host) throw new HttpError(403, '主机地址不匹配');
      const url = new URL(req.url, origin), path = url.pathname;
      const mutation = !['GET', 'HEAD'].includes(req.method);
      if (mutation && path !== '/api/bridge/activity' && (req.headers.origin !== origin || req.headers['x-whale-request'] !== '1')) throw new HttpError(403, '请求来源不匹配');
      if (path === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true, version: '0.1.0' });
      if (path === '/api/login' && req.method === 'POST') {
        rateLimit(req, 'login', 12, 15 * 60000);
        const data = await body(req);
        if (typeof data.key !== 'string' || data.key.length > 256) throw new HttpError(401, '登录密钥或配对码不正确');
        const device = equalSecret(data.key, config.adminKey) ? store.device(data.name || '主设备', 'owner') : store.accept(data.key, data.name || '新设备');
        setSession(res, device); publish(); return;
      }
      if (path === '/api/bridge/activity' && req.method === 'POST') {
        const token = req.headers.authorization?.replace(/^Bearer /, '');
        if (!store.auth(token, true)) throw new HttpError(401, 'DSH 桥接未授权');
        rateLimit(req, 'bridge', 150, 60000);
        const data = await body(req);
        if (!['idle', 'waiting', 'thinking', 'tool', 'review', 'done', 'failed'].includes(data.phase)) throw new HttpError(400, '未知状态');
        store.put('activity', { phase: data.phase, at: Date.now() }); store.bump(); publish(); return json(res, 200, { ok: true });
      }
      if (path.startsWith('/api/')) {
        const token = sessionToken(req), device = store.auth(token);
        if (!device) throw new HttpError(401, '请先登录或配对这台设备');
        const owner = () => { if (device.role !== 'owner') throw new HttpError(403, '请在主设备管理配对'); };
        if (req.method === 'GET' && path === '/api/state') return json(res, 200, { ...view(), device });
        if (req.method === 'GET' && path === '/api/events') {
          if ([...streams].filter(s => s.id === device.id).length >= 8) throw new HttpError(429, '打开的页面太多');
          res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
          const stream = { res, token, id: device.id }; streams.add(stream);
          res.write(`event: state\ndata: ${JSON.stringify(view())}\n\n`);
          res.on('close', () => streams.delete(stream)); return;
        }
        if (path === '/api/devices' && req.method === 'GET') { owner(); return json(res, 200, store.listDevices()); }
        if (path === '/api/export' && req.method === 'GET') { owner(); return json(res, 200, { profile: store.get('profile'), notes: store.snapshot().notes, messages: store.db.prepare('SELECT * FROM messages ORDER BY seq').all() }); }
        if (req.method !== 'POST') throw new HttpError(404, '没有这个接口');
        const data = await body(req);
        rateLimit(req, 'write', 120, 60000);
        if (path === '/api/messages') { rateLimit(req, 'message', 30, 60000); const message = store.message(data.id, data.text); publish(); kick(); return json(res, 202, { message }); }
        if (path === '/api/retry') { store.retry(data.id); publish(); kick(); return json(res, 202, { ok: true }); }
        if (path === '/api/profile') store.profile(data);
        else if (path === '/api/notes') store.addNote(data.text);
        else if (path === '/api/notes/delete') store.deleteNote(bounded(data.id, 50, '记忆编号'));
        else if (path === '/api/pair') { owner(); return json(res, 200, store.pair()); }
        else if (path === '/api/bridge-key') { owner(); const bridge = store.device('DSH 状态桥接', 'bridge'); return json(res, 200, { key: bridge.token, id: bridge.id }); }
        else if (path === '/api/revoke') { owner(); store.revoke(bounded(data.id, 50, '设备编号')); }
        else if (path === '/api/logout') { store.revoke(device.id); publish(); return json(res, 200, { ok: true }, { 'Set-Cookie': `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}` }); }
        else throw new HttpError(404, '没有这个接口');
        publish(); return json(res, 200, { ok: true });
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw new HttpError(405, '请求方式不支持');
      const name = path === '/' ? 'index.html' : decodeURIComponent(path.slice(1));
      const file = resolve(publicRoot, name);
      if (!file.startsWith(publicRoot + sep) && file !== resolve(publicRoot, 'index.html')) throw new HttpError(404, '文件不存在');
      let content;
      try { content = await readFile(file); } catch { throw new HttpError(404, '文件不存在'); }
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (e) {
      if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : '服务暂时出错，请稍后重试' });
      else res.end();
    }
  });
  server.requestTimeout = 15000;
  const heartbeat = setInterval(() => {
    for (const stream of streams) {
      if (!canStream(stream)) { stream.res.write('event: revoked\ndata: {}\n\n'); stream.res.end(); streams.delete(stream); }
      else stream.res.write(`event: heartbeat\ndata: ${Date.now()}\n\n`);
    }
    for (const [key, entry] of limits) if (entry.until < Date.now()) limits.delete(key);
  }, 15000);
  heartbeat.unref();
  return { server, store, publish, async close() { stopping = true; clearInterval(heartbeat); for (const s of streams) s.res.end(); await workPromise; await new Promise(resolve => server.close(resolve)); store.close(); } };
}
