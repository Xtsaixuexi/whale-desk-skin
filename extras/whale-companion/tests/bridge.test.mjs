import test from 'node:test';
import assert from 'node:assert/strict';
import { phaseOf, validEndpoint, apply } from '../dsh-plugin/index.mjs';
test('DSH bridge maps official events without conversation text', () => {
  assert.equal(phaseOf({ type: 'turn/start' }), 'waiting');
  assert.equal(phaseOf({ type: 'tool/call', data: { arguments: 'private' } }), 'tool');
  assert.equal(phaseOf({ type: 'turn/end', data: { reason: { kind: 'completed' } } }), 'done');
  assert.equal(phaseOf({ type: 'turn/end', data: { reason: { kind: 'aborted' } } }), 'idle');
  assert.equal(phaseOf({ type: 'user/message', data: { text: 'private' } }), undefined);
  assert.equal(validEndpoint('https://companion.example'), 'https://companion.example');
  assert.throws(() => validEndpoint('http://public.example')); assert.throws(() => validEndpoint('https://user:pass@companion.example')); assert.throws(() => validEndpoint('file:///C:/'));
});
test('host extension sends only enum status and cleans up on disposal', async () => {
  const oldUrl = process.env.WHALE_COMPANION_URL, oldKey = process.env.WHALE_BRIDGE_KEY, oldFetch = global.fetch;
  const listeners = new Map(), disposers = [], sent = [];
  process.env.WHALE_COMPANION_URL = 'https://companion.example'; process.env.WHALE_BRIDGE_KEY = 'test-bridge';
  global.fetch = async (url, options) => { sent.push({ url, body: JSON.parse(options.body) }); return { ok: true }; };
  try {
    apply({ on: (name, handler) => listeners.set(name, handler), effect: setup => disposers.push(setup()) });
    await new Promise(r => setTimeout(r, 5));
    listeners.get('session/event')({ id: 'private-session' }, { type: 'tool/call', data: { text: 'private-content' } });
    await new Promise(r => setTimeout(r, 300));
    assert.deepEqual(sent.at(-1).body, { phase: 'tool' }); assert.ok(!JSON.stringify(sent).includes('private'));
  } finally { for (const dispose of disposers) dispose(); global.fetch = oldFetch; if (oldUrl === undefined) delete process.env.WHALE_COMPANION_URL; else process.env.WHALE_COMPANION_URL = oldUrl; if (oldKey === undefined) delete process.env.WHALE_BRIDGE_KEY; else process.env.WHALE_BRIDGE_KEY = oldKey; }
});
