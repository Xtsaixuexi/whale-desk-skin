export const name = 'whale-companion';
export const inject = [];
export function phaseOf(event) {
  if (event.type === 'turn/start' || event.type === 'step/start') return 'waiting';
  if (event.type === 'tool/call') return 'tool';
  if (event.type === 'tool/result') return event.data?.error !== undefined || event.data?.message?.isError ? 'failed' : 'thinking';
  if (event.type === 'assistant/message') return 'review';
  if (event.type === 'turn/end') {
    const reason = event.data?.reason?.kind;
    return reason === 'completed' ? 'done' : reason === 'blocked' ? 'waiting' : ['error','max-tokens','interrupted'].includes(reason) ? 'failed' : 'idle';
  }
}
export function validEndpoint(value) {
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('鲸伴地址应是根地址，不含凭据或查询参数');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) throw new Error('鲸伴公网地址必须使用 HTTPS');
  return url.origin;
}
export function apply(ctx) {
  const address = process.env.WHALE_COMPANION_URL, key = process.env.WHALE_BRIDGE_KEY;
  if (!address || !key) return;
  const origin = validEndpoint(address), sessions = new Map();
  let disposed = false, sending = false, timer, lastSent = 0, lastPhase = '', current = 'idle';
  const controller = new AbortController();
  const priority = { tool: 7, thinking: 6, review: 5, waiting: 4, failed: 3, done: 2, idle: 1 };
  function choose() {
    const now = Date.now();
    for (const [id, value] of sessions) if (now - value.at > (['done','failed'].includes(value.phase) ? 8000 : 300000)) sessions.delete(id);
    current = [...sessions.values()].sort((a,b) => priority[b.phase] - priority[a.phase])[0]?.phase || 'idle';
  }
  async function send() {
    choose();
    if (disposed || sending || (current === lastPhase && Date.now() - lastSent < 25000)) return;
    sending = true; const phase = current;
    try {
      const response = await fetch(origin + '/api/bridge/activity', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, body: JSON.stringify({ phase }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
      if (response.ok) { lastPhase = phase; lastSent = Date.now(); }
    } catch { /* No conversation data, tokens or server errors are logged. Heartbeat retries. */ }
    finally { sending = false; }
  }
  function activity(session, phase) {
    if (!phase || disposed) return;
    sessions.set(session.id, { phase, at: Date.now() });
    clearTimeout(timer); timer = setTimeout(() => void send(), 250);
  }
  ctx.on('session/event', (session, event) => activity(session, phaseOf(event)));
  ctx.on('agent/assistant-stream', ({ agent, frame }) => {
    if (frame.type !== 'chunk') return;
    if (frame.chunk.type === 'reasoning-delta') activity(agent.session, 'thinking');
    if (frame.chunk.type === 'text-delta') activity(agent.session, 'review');
  });
  ctx.on('session/disposed', session => { sessions.delete(session.id); void send(); });
  const heartbeat = setInterval(() => void send(), 1000); heartbeat.unref?.();
  ctx.effect(() => () => { disposed = true; clearInterval(heartbeat); clearTimeout(timer); controller.abort(); sessions.clear(); });
  void send();
}
