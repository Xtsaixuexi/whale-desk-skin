import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Store } from '../server/store.mjs';

test('pairing code is one-use, expires, and rollback preserves invalid-name attempts', () => {
  let time = 1000000; const s = new Store(':memory:', () => time);
  try {
    const pair = s.pair(); assert.throws(() => s.accept(pair.code, ''), { status: 400 });
    const member = s.accept(pair.code, '手机'); assert.equal(s.auth(member.token).role, 'member');
    assert.throws(() => s.accept(pair.code, '另一台'), { status: 401 });
    const expired = s.pair(); time += 300001; assert.throws(() => s.accept(expired.code, '手机'), { status: 401 });
  } finally { s.close(); }
});
test('bridge token cannot read conversations; revoked/expired devices cannot authenticate', () => {
  let time = Date.now(); const s = new Store(':memory:', () => time);
  try {
    const bridge = s.device('状态桥接', 'bridge'), phone = s.device('手机');
    assert.equal(s.auth(bridge.token), null); assert.equal(s.auth(bridge.token, true).role, 'bridge'); assert.equal(s.auth(phone.token, true), null);
    s.revoke(phone.id); assert.equal(s.auth(phone.token), null);
    time += 31 * 86400000; assert.equal(s.auth(bridge.token, true), null);
  } finally { s.close(); }
});
test('message retry is idempotent; conflicting payload rejected; queue context includes previous reply', () => {
  const s = new Store(':memory:');
  try {
    const a = randomUUID(), b = randomUUID();
    s.message(a, '第一条'); s.message(a, '第一条'); assert.equal(s.snapshot().messages.length, 1);
    assert.throws(() => s.message(a, '不同内容'), { status: 409 });
    const second = s.message(b, '第二条'); s.thinking(a); s.finish(a, '第一条的回答');
    assert.deepEqual(s.history(second.seq).map(m => m.text), ['第一条', '第一条的回答']);
    assert.equal(s.next().id, b);
  } finally { s.close(); }
});
test('simultaneous profile edits reject stale revision; notes support deletion', () => {
  const s = new Store(':memory:');
  try {
    const p = s.get('profile'); s.profile({ ...p, callName: '朋友' });
    assert.throws(() => s.profile({ ...p, callName: '旧版本' }), { status: 409 });
    s.addNote('喜欢水彩'); const note = s.snapshot().notes[0]; s.deleteNote(note.id); assert.equal(s.snapshot().notes.length, 0);
  } finally { s.close(); }
});
