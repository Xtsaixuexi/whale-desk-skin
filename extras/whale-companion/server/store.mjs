import { DatabaseSync } from 'node:sqlite';
import { randomUUID, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const hash = value => createHash('sha256').update(value).digest('hex');
export const secret = () => randomBytes(32).toString('base64url');
export const equalSecret = (a, b) => timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b)));
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export function bounded(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new HttpError(400, `${label}需要 1–${max} 个字符`);
  return value.trim();
}
export function uuid(value) {
  if (typeof value !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value)) throw new HttpError(400, '无效的消息编号');
  return value;
}

export class Store {
  constructor(path, now = Date.now) {
    this.now = now;
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS devices (id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, token TEXT UNIQUE NOT NULL, created INTEGER NOT NULL, expires INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS pairs (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS messages (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE NOT NULL, role TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL, created INTEGER NOT NULL, replyTo TEXT UNIQUE, error TEXT, attempts INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, text TEXT NOT NULL, created INTEGER NOT NULL);
    `);
    if (!this.get('profile')) this.put('profile', { name: '鲸鲸', callName: '你', tone: '温柔陪伴', version: 0 });
    if (!this.get('revision')) this.put('revision', 1);
    // Never silently re-submit a model request after a server crash.
    const recovered = this.db.prepare("UPDATE messages SET status='failed', error='服务重启，上一条尚未完成。可手动重试。' WHERE status IN ('queued','thinking')").run();
    if (recovered.changes) this.bump();
  }
  get(k) { const row = this.db.prepare('SELECT value FROM kv WHERE key=?').get(k); return row ? JSON.parse(row.value) : undefined; }
  put(k, v) { this.db.prepare('INSERT INTO kv VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, JSON.stringify(v)); }
  bump() { this.put('revision', (this.get('revision') || 0) + 1); }
  tx(fn) { this.db.exec('BEGIN IMMEDIATE'); try { const result = fn(); this.db.exec('COMMIT'); return result; } catch (e) { this.db.exec('ROLLBACK'); throw e; } }
  device(name, role = 'member') {
    const token = secret(), id = randomUUID();
    this.db.prepare('INSERT INTO devices (id,name,role,token,created,expires) VALUES (?,?,?,?,?,?)')
      .run(id, bounded(name, 40, '设备名'), role, hash(token), this.now(), this.now() + 30 * 86400000);
    return { token, id, role };
  }
  auth(token, bridge = false) {
    if (!token || token.length > 150) return null;
    return this.db.prepare("SELECT id,name,role,expires FROM devices WHERE token=? AND revoked=0 AND expires>? AND (role='bridge')=?")
      .get(hash(token), this.now(), bridge ? 1 : 0) || null;
  }
  listDevices() { return this.db.prepare('SELECT id,name,role,created,expires,revoked FROM devices ORDER BY created DESC').all(); }
  revoke(id) { this.db.prepare('UPDATE devices SET revoked=1 WHERE id=?').run(id); this.bump(); }
  pair() {
    const code = randomBytes(12).toString('hex'), expires = this.now() + 300000;
    this.db.prepare('DELETE FROM pairs WHERE expires<=?').run(this.now());
    this.db.prepare('INSERT INTO pairs VALUES (?,?)').run(hash(code), expires);
    return { code, expires };
  }
  accept(code, name) {
    return this.tx(() => {
      const row = this.db.prepare('DELETE FROM pairs WHERE token=? AND expires>? RETURNING token').get(hash(code), this.now());
      if (!row) throw new HttpError(401, '配对码无效、已使用或已过期');
      return this.device(name);
    });
  }
  profile(p) {
    const current = this.get('profile');
    if (p.version !== current.version) throw new HttpError(409, '另一台设备刚修改过设置，请重新打开设置后保存');
    const next = { name: bounded(p.name, 20, '她的名字'), callName: bounded(p.callName, 20, '对你的称呼'), tone: bounded(p.tone, 30, '相处方式'), version: current.version + 1 };
    this.put('profile', next); this.bump(); return next;
  }
  addNote(text) {
    if (this.db.prepare('SELECT count(*) AS n FROM notes').get().n >= 40) throw new HttpError(400, '记忆最多保存 40 条，请先整理旧记忆');
    this.db.prepare('INSERT INTO notes VALUES (?,?,?)').run(randomUUID(), bounded(text, 300, '记忆'), this.now()); this.bump();
  }
  deleteNote(id) { this.db.prepare('DELETE FROM notes WHERE id=?').run(id); this.bump(); }
  message(id, text) {
    uuid(id); text = bounded(text, 4000, '消息');
    const old = this.db.prepare('SELECT * FROM messages WHERE id=?').get(id);
    if (old) {
      if (old.role !== 'user' || old.text !== text) throw new HttpError(409, '同一编号的消息内容不同');
      return old;
    }
    const count = this.db.prepare("SELECT count(*) AS n FROM messages WHERE status IN ('queued','thinking')").get().n;
    if (count >= 5) throw new HttpError(429, '消息正在排队，请稍后再试');
    this.db.prepare("INSERT INTO messages (id,role,text,status,created) VALUES (?,'user',?,'queued',?)").run(id, text, this.now());
    this.bump(); return this.db.prepare('SELECT * FROM messages WHERE id=?').get(id);
  }
  next() { return this.db.prepare("SELECT * FROM messages WHERE role='user' AND status='queued' ORDER BY seq LIMIT 1").get(); }
  thinking(id) { this.db.prepare("UPDATE messages SET status='thinking',attempts=attempts+1 WHERE id=?").run(id); this.bump(); }
  finish(id, text) {
    this.tx(() => {
      this.db.prepare("INSERT INTO messages (id,role,text,status,created,replyTo) VALUES (?,'assistant',?,'done',?,?)")
        .run(randomUUID(), text, this.now(), id);
      this.db.prepare("UPDATE messages SET status='done',error=NULL WHERE id=?").run(id); this.bump();
    });
  }
  fail(id, error) { this.db.prepare("UPDATE messages SET status='failed',error=? WHERE id=?").run(error, id); this.bump(); }
  retry(id) {
    uuid(id);
    const row = this.db.prepare("SELECT * FROM messages WHERE id=? AND role='user' AND status='failed'").get(id);
    if (!row) throw new HttpError(409, '这条消息现在不能重试');
    if (row.attempts >= 3) throw new HttpError(409, '已尝试 3 次，请检查服务配置后重新发送');
    this.db.prepare("UPDATE messages SET status='queued',error=NULL WHERE id=?").run(id); this.bump();
  }
  history(beforeSeq) {
    return this.db.prepare(`SELECT role,text FROM (
      SELECT m.role,m.text,coalesce(u.seq,m.seq) AS turnSeq,CASE WHEN m.role='user' THEN 0 ELSE 1 END AS part
      FROM messages m LEFT JOIN messages u ON m.replyTo=u.id
      WHERE m.status='done' AND coalesce(u.seq,m.seq)<?
      ORDER BY turnSeq DESC,part DESC LIMIT 24
    ) ORDER BY turnSeq,part`).all(beforeSeq);
  }
  snapshot() {
    return {
      revision: this.get('revision'), profile: this.get('profile'),
      messages: this.db.prepare('SELECT * FROM (SELECT * FROM messages ORDER BY seq DESC LIMIT 200) ORDER BY seq').all(),
      notes: this.db.prepare('SELECT * FROM notes ORDER BY created DESC').all(),
      activity: this.get('activity') || null, serverTime: this.now()
    };
  }
  close() { this.db.close(); }
}
