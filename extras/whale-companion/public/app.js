const $ = id => document.getElementById(id);
let state, device, events, online = false, outbox = [], flushing = false, profileVersion = 0;
let transient = { row: 0, until: 0 }, lastRevision = -1, lastBeat = 0, toastTimer;
let reduced = localStorage.getItem('whale-reduced') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches;
const phases = { idle: [0, '一起慢慢来'], waiting: [6, '等你把想法说完'], thinking: [8, '正在认真想一想'], tool: [7, '陪你把事情做好'], review: [8, '正在整理回复'], done: [4, '又完成一件事啦'], failed: [6, '遇到一点小波折，慢慢处理'] };
const frames = [6, 8, 8, 4, 5, 8, 6, 6, 6];
const durations = [[500,500,600,500,500,600],[300,300,300,300,300,300,300,400],[300,300,300,300,300,300,300,400],[450,450,450,450],[400,400,400,450,450],[550,550,550,600,650,700,550,550],[550,550,600,550,550,600],[330,330,330,330,330,400],[650,650,650,650,650,650]];
function element(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
function toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 4500); }
function run(fn) { return event => Promise.resolve(fn(event)).catch(e => toast(e.message)); }
async function api(path, data) {
  const response = await fetch('/api/' + path, data === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Whale-Request': '1' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) { const error = new Error(result.error || '连接失败'); error.status = response.status; if (response.status === 401 && path !== 'login') showLogin(); throw error; }
  return result;
}
function syncStatus(ok) { online = ok; $('sync').classList.toggle('offline', !ok); $('sync').replaceChildren(element('i'), document.createTextNode(ok ? '已同步' : '连接中断')); }
function persistOutbox() { try { if (device) sessionStorage.setItem('whale-outbox-' + device.id, JSON.stringify(outbox)); } catch { toast('浏览器无法暂存消息，请保持当前页面打开'); } }
function renderOutbox() {
  $('outbox-status').replaceChildren();
  if (!outbox.length) return;
  $('outbox-status').append(document.createTextNode(`${outbox.length} 条消息等待送达，保留在当前页面。`));
  const retry = element('button', '', '重新发送'); retry.onclick = run(flush); $('outbox-status').append(retry);
}
async function flush() {
  if (flushing || !device || !navigator.onLine) return;
  flushing = true;
  try {
    while (outbox.length) {
      try { await api('messages', outbox[0]); outbox.shift(); persistOutbox(); renderOutbox(); }
      catch (e) { if (e.status && e.status !== 401) toast(e.message); else syncStatus(false); break; }
    }
  } finally { flushing = false; }
}
function renderMessages() {
  const area = $('messages');
  const nearBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 90;
  const oldCount = area.children.length;
  area.replaceChildren();
  if (!state.messages.length) {
    const welcome = element('div', 'welcome'); welcome.append(element('strong', '', '回来啦，今天过得怎么样？'), element('p', '', '可以聊工作，也可以只是待一会儿。'), element('p', '', '左边的小鲸鱼，会跟着我们的对话动起来。')); area.append(welcome);
  }
  for (const message of state.messages) {
    const item = element('article', 'message ' + message.role); item.dataset.id = message.id;
    item.append(element('span', 'sender', message.role === 'user' ? '我' : state.profile.name), element('div', 'text', message.text));
    if (message.status === 'queued' || message.status === 'thinking') item.append(element('span', 'message-meta', message.status === 'thinking' ? '正在认真回复…' : '已经保存，等待回复…'));
    if (message.status === 'failed') {
      item.append(element('span', 'message-meta', message.error));
      const button = element('button', 'retry', '重试这条'); button.onclick = run(() => api('retry', { id: message.id })); item.append(button);
    }
    area.append(item);
  }
  if (nearBottom || !oldCount) area.scrollTop = area.scrollHeight;
}
function renderNotes() {
  $('notes').replaceChildren(); $('note-count').textContent = state.notes.length;
  for (const note of state.notes) {
    const row = element('div', 'note-row'); const button = element('button', '', '忘记');
    button.setAttribute('aria-label', '忘记：' + note.text.slice(0, 30)); button.onclick = run(() => api('notes/delete', { id: note.id })); row.append(element('p', '', note.text), button); $('notes').append(row);
  }
}
function update(next) {
  state = next; lastBeat = Date.now(); syncStatus(true);
  $('last-sync').textContent = '最近同步 ' + new Date(next.serverTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (lastRevision === next.revision) return;
  lastRevision = next.revision;
  $('pet-name').textContent = next.profile.name; $('pet').setAttribute('aria-label', '摸摸' + next.profile.name);
  $('mode-banner').textContent = next.ai.mode === 'demo' ? '演示模式 · 动作与同步真实运行，对话是固定示例' : next.ai.configured ? 'DeepSeek 对话 · 聊天和手动记忆在配对设备间同步' : '尚未配置 DeepSeek 密钥 · 请在服务器端完成设置';
  renderMessages(); renderNotes();
}
function connectEvents() {
  events?.close();
  events = new EventSource('/api/events');
  events.addEventListener('state', event => { update(JSON.parse(event.data)); void flush(); });
  events.addEventListener('heartbeat', () => { lastBeat = Date.now(); syncStatus(true); });
  events.addEventListener('revoked', () => { showLogin(); toast('这台设备已退出或被撤销，请重新配对'); });
  events.onerror = () => { syncStatus(false); };
}
async function start() {
  try {
    const initial = await api('state'); device = initial.device;
    try { const stored = JSON.parse(sessionStorage.getItem('whale-outbox-' + device.id) || '[]'); outbox = Array.isArray(stored) ? stored.slice(0, 10).filter(m => typeof m.id === 'string' && typeof m.text === 'string') : []; } catch { outbox = []; }
    $('owner-controls').hidden = device.role !== 'owner';
    $('login-dialog').close(); update(initial); renderOutbox(); connectEvents();
  } catch (e) { if (e.status === 401) showLogin(); else { syncStatus(false); toast('暂时连不上服务，稍后会自动重连'); } }
}
function showLogin() {
  events?.close(); device = undefined; state = undefined; lastRevision = -1; outbox = [];
  $('messages').replaceChildren(); $('notes').replaceChildren(); $('pair-result').textContent = ''; $('bridge-result').textContent = ''; $('devices').replaceChildren(); renderOutbox();
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  $('login-dialog').showModal(); syncStatus(false);
}
$('login-dialog').addEventListener('cancel', event => event.preventDefault());
$('login-form').addEventListener('submit', async event => {
  event.preventDefault(); const form = event.currentTarget, button = form.querySelector('button'); button.disabled = true;
  try { await api('login', { key: form.elements.key.value.trim(), name: form.elements.deviceName.value }); form.elements.key.value = ''; $('login-error').textContent = ''; await start(); }
  catch (e) { $('login-error').textContent = e.message; } finally { button.disabled = false; }
});
$('chat-form').addEventListener('submit', run(async event => {
  event.preventDefault(); if (!device) return showLogin();
  const input = $('message-input'), text = input.value.trim(); if (!text) return;
  if (outbox.length >= 10) return toast('已有 10 条待发送消息，请先恢复连接');
  outbox.push({ id: crypto.randomUUID(), text }); persistOutbox(); renderOutbox(); input.value = ''; await flush();
}));
$('message-input').addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); $('chat-form').requestSubmit(); } });
document.querySelectorAll('[data-prompt]').forEach(button => button.onclick = () => { $('message-input').value = button.dataset.prompt; $('message-input').focus(); });
document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => $(button.dataset.close).close());
$('memory-open').onclick = () => device ? $('memory-dialog').showModal() : showLogin();
$('note-form').addEventListener('submit', run(async event => { event.preventDefault(); await api('notes', { text: $('note-input').value }); $('note-input').value = ''; toast('已记下，其他设备也会收到'); }));
async function loadDevices() {
  if (device?.role !== 'owner') return;
  const list = await api('devices'); $('devices').replaceChildren();
  for (const item of list) {
    const row = element('div', 'device-row'), name = element('span', '', item.name);
    name.append(element('small', '', (item.id === device.id ? '当前设备 · ' : '') + (item.revoked || item.expires <= Date.now() ? '已失效' : item.role === 'bridge' ? '仅工作状态权限' : item.role === 'owner' ? '主设备' : '已配对')));
    row.append(name);
    if (!item.revoked) { const button = element('button', '', '撤销'); button.onclick = run(async () => { await api('revoke', { id: item.id }); if (item.id !== device?.id) await loadDevices(); }); row.append(button); }
    $('devices').append(row);
  }
}
$('settings-open').onclick = run(async () => {
  if (!device) return showLogin();
  const form = $('profile-form'); for (const key of ['name', 'callName', 'tone']) form.elements.namedItem(key).value = state.profile[key]; profileVersion = state.profile.version;
  $('settings-dialog').showModal(); await loadDevices();
});
$('settings-dialog').addEventListener('close', () => { $('pair-result').textContent = ''; $('pair-result').hidden = true; $('bridge-result').textContent = ''; $('bridge-result').hidden = true; });
$('profile-form').addEventListener('submit', run(async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); await api('profile', { ...data, version: profileVersion }); $('settings-dialog').close(); toast('称呼和相处方式已同步'); }));
$('pair-create').onclick = run(async () => { const pair = await api('pair', {}); $('pair-result').textContent = `打开 ${location.origin}\n配对码：${pair.code}\n到期时间：${new Date(pair.expires).toLocaleTimeString()}`; $('pair-result').hidden = false; });
$('bridge-create').onclick = run(async () => { const result = await api('bridge-key', {}); $('bridge-result').textContent = `WHALE_COMPANION_URL=${location.origin}\nWHALE_BRIDGE_KEY=${result.key}\n只保存到 DSH 主机环境变量，不要写进公开仓库。`; $('bridge-result').hidden = false; await loadDevices(); });
$('logout').onclick = run(async () => { const currentId = device?.id; await api('logout', {}); if (currentId) sessionStorage.removeItem('whale-outbox-' + currentId); showLogin(); });
$('speak').onclick = () => { const latest = state?.messages.filter(m => m.role === 'assistant').at(-1); if (!latest) return toast('有回复后就可以朗读了'); if (!('speechSynthesis' in window)) return toast('当前浏览器不支持朗读'); speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(latest.text); speech.lang = 'zh-CN'; speech.rate = .95; speechSynthesis.speak(speech); };
function reaction(row, text) { transient = { row, until: Date.now() + 4000 }; $('bubble').textContent = text; }
$('pet').onclick = () => reaction(4, '收到一个轻轻的摸头，开心 +1 ✧');
document.querySelectorAll('[data-action]').forEach(button => button.onclick = () => button.dataset.action === 'wave' ? reaction(3, '嗨，我在这里。') : reaction(6, '一起喝口水，歇一小会儿。'));
function setMotion() { document.body.classList.toggle('reduced-motion', reduced); $('motion-toggle').setAttribute('aria-pressed', String(reduced)); $('motion-toggle').textContent = reduced ? '动态已暂停' : '轻柔动态'; }
$('motion-toggle').onclick = () => { reduced = !reduced; localStorage.setItem('whale-reduced', String(reduced)); setMotion(); }; setMotion();
let lastRow = -1, frameIndex = 0, frameAt = 0;
function animate() {
  if (document.hidden) return;
  const now = Date.now(), active = state?.activity, localBusy = state?.messages.some(m => m.status === 'thinking');
  const workOnline = active && now - active.at < 90000;
  let row = 0, line = '今天也一起慢慢来吧。';
  if (workOnline) [row, line] = phases[active.phase] || phases.idle;
  if (localBusy) { row = 8; line = '我在认真想，稍等一小会儿。'; }
  if (transient.until > now) row = transient.row; else $('bubble').textContent = line;
  $('dsh-status').textContent = workOnline ? 'DSH · ' + phases[active.phase][1] : 'DSH 工作状态尚未连接';
  if (lastRow !== row) { lastRow = row; frameIndex = 0; frameAt = now; }
  if (reduced) frameIndex = 0;
  else if (now - frameAt >= durations[row][frameIndex]) { frameIndex = (frameIndex + 1) % frames[row]; frameAt = now; }
  const sprite = $('sprite'), width = sprite.offsetWidth, height = sprite.offsetHeight;
  sprite.style.backgroundPosition = `${-frameIndex * width}px ${-row * height}px`;
}
setInterval(animate, 100); animate();
setInterval(() => { if (device && Date.now() - lastBeat > 35000) syncStatus(false); }, 5000);
window.addEventListener('online', () => { if (device) { connectEvents(); void flush(); } else void start(); });
window.addEventListener('offline', () => syncStatus(false));
document.addEventListener('visibilitychange', () => { if (!document.hidden) { animate(); if (device) void api('state').then(update).catch(() => syncStatus(false)); } });
void start();
