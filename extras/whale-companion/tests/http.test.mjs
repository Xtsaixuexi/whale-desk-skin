import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app.mjs';

test('HTTP authorization, two devices, SSE, deduplication, revocation and persistence', async t => {
  const folder = mkdtempSync(join(tmpdir(), 'whale-tests-'));
  const publicUrl = 'http://127.0.0.1:14318';
  const config = { publicUrl, dbPath: join(folder, 'test.sqlite'), adminKey: 'test-admin-key-32-characters-long', aiMode: 'demo', reply: async (_s, row) => '测试回答：' + row.text };
  let app = createApp(config); await new Promise(r => app.server.listen(14318, '127.0.0.1', r));
  async function req(path, data, cookie, headers = {}) {
    const response = await fetch(publicUrl + '/api/' + path, { method: data === undefined ? 'GET' : 'POST', headers: { Connection: 'close', ...(cookie ? { Cookie: cookie } : {}), ...(data === undefined ? {} : { Origin: publicUrl, 'X-Whale-Request': '1', 'Content-Type': 'application/json' }), ...headers }, body: data === undefined ? undefined : JSON.stringify(data) });
    return { response, data: await response.json() };
  }
  try {
    await t.test('private state requires auth and cross-origin login rejected', async () => {
      assert.equal((await req('state')).response.status, 401);
      assert.equal((await req('login', { key: config.adminKey, name: '电脑' }, undefined, { Origin: 'https://evil.example' })).response.status, 403);
    });
    const login = await req('login', { key: config.adminKey, name: '电脑' }); const owner = login.response.headers.get('set-cookie').split(';')[0];
    assert.match(login.response.headers.get('set-cookie'), /HttpOnly/);
    const pair = await req('pair', {}, owner); const paired = await req('login', { key: pair.data.code, name: '手机' }); const phone = paired.response.headers.get('set-cookie').split(';')[0];
    await t.test('member pairing works once and cannot manage devices', async () => {
      assert.equal((await req('login', { key: pair.data.code, name: '第三台' })).response.status, 401);
      assert.equal((await req('devices', undefined, phone)).response.status, 403);
    });
    await t.test('SSE sends current state to independently paired phone', async () => {
      const ctrl = new AbortController();
      const response = await fetch(publicUrl + '/api/events', { headers: { Cookie: phone }, signal: ctrl.signal });
      const reader = response.body.getReader(); const first = await reader.read();
      assert.match(new TextDecoder().decode(first.value), /event: state/);
      await req('notes', { text: '手机和电脑共享的记忆' }, owner);
      const second = await reader.read(); assert.match(new TextDecoder().decode(second.value), /手机和电脑共享的记忆/);
      ctrl.abort();
    });
    const id = randomUUID();
    await t.test('duplicate transport submits create one user and one assistant message', async () => {
      await Promise.all([req('messages', { id, text: '同步测试' }, owner), req('messages', { id, text: '同步测试' }, phone)]);
      for (let i = 0; i < 30 && app.store.snapshot().messages.length < 2; i++) await new Promise(r => setTimeout(r, 20));
      const mobile = await req('state', undefined, phone); assert.equal(mobile.data.messages.length, 2); assert.equal(mobile.data.messages[1].text, '测试回答：同步测试');
    });
    await t.test('bridge is write-only for activity; cookie sessions cannot use bridge route', async () => {
      const bridge = await req('bridge-key', {}, owner);
      assert.equal((await req('bridge/activity', { phase: 'thinking', text: 'must not be saved' }, undefined, { Authorization: 'Bearer ' + bridge.data.key })).response.status, 200);
      const activity = (await req('state', undefined, phone)).data.activity; assert.deepEqual(Object.keys(activity).sort(), ['at','phase']);
      assert.equal((await req('state', undefined, 'whale_session=' + bridge.data.key)).response.status, 401);
      assert.equal((await req('bridge/activity', { phase: 'idle' }, owner)).response.status, 401);
    });
    await t.test('device revoke invalidates its next request', async () => {
      await req('revoke', { id: paired.data.device.id }, owner); assert.equal((await req('state', undefined, phone)).response.status, 401);
    });
    await t.test('restart persists owner, messages and revocation, and serves assets', async () => {
      await app.close(); app = createApp(config); await new Promise(r => app.server.listen(14318, '127.0.0.1', r));
      assert.equal((await req('state', undefined, owner)).data.messages.length, 2); assert.equal((await req('state', undefined, phone)).response.status, 401);
      const page = await fetch(publicUrl + '/'); assert.equal(page.status, 200); assert.match(await page.text(), /鲸伴/);
      assert.equal((await fetch(publicUrl + '/assets/icon.svg')).status, 200);
    });
  } finally { await app.close(); rmSync(folder, { recursive: true, force: true }); }
});
