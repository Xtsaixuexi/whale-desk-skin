'use strict';
const core = globalThis.WhaleDeskConfig;
let config = core.normalize({}), theme = 'light', selectedRegion = 'home';
const get = id => document.getElementById(id);
const colorLabels = { ink: '正文', muted: '次要文字', accent: '紫粉强调', paper: '奶油底色', soft: '柔和衬色', line: '边线', wood: '木沿' };
function status(message, error = false) { get('status').textContent = message; get('status').classList.toggle('error', error); }
for (const [id, label] of Object.entries(core.regionNames)) { const option = document.createElement('option'); option.value = id; option.textContent = label; get('region').append(option); }
for (const [key, label] of Object.entries(colorLabels)) {
  const row = document.createElement('label'), input = document.createElement('input');
  input.type = 'color'; input.id = 'color-' + key; row.append(document.createTextNode(label), input); get('colors').append(row);
  input.addEventListener('input', () => { config[theme][key] = input.value; renderPreview(); });
}
function syncControls() {
  for (const id of ['motto', 'composerWidth', 'fontSize', 'font']) get(id).value = config[id];
  get('decorations').checked = config.decorations;
  for (const key of Object.keys(colorLabels)) get('color-' + key).value = config[theme][key];
  for (const button of document.querySelectorAll('[data-theme]')) button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
  renderPreview();
}
function renderPreview() {
  const preview = get('preview');
  for (const [key, value] of Object.entries(config[theme])) preview.style.setProperty('--' + key, value);
  get('sample-motto').textContent = config.motto;
  get('vignette').hidden = !config.decorations;
  get('width-value').textContent = config.composerWidth + ' px'; get('size-value').textContent = config.fontSize + ' px';
  get('sample-input').style.fontSize = config.fontSize + 'px';
  preview.style.fontFamily = config.font === 'system' ? '"Microsoft YaHei","Segoe UI",sans-serif' : 'WenKai,sans-serif';
  get('sample-composer').style.width = Math.min(93, config.composerWidth / 10) + '%';
  const current = config.images[selectedRegion];
  get('sample-image-wrap').hidden = current === false;
  get('sample-image-wrap').dataset.home = String(selectedRegion === 'home');
  get('sample-image').src = current || '../skins/whale-desk/assets/' + (selectedRegion === 'home' ? 'desk/home.png' : 'diy-generated/' + selectedRegion + '.svg');
  try { core.normalize(config); status('可导出 · 图片与设置只在本页处理。'); }
  catch (error) { status(error.message, true); }
}
for (const id of ['motto', 'composerWidth', 'fontSize', 'font', 'decorations']) get(id).addEventListener('input', () => { config[id] = id === 'decorations' ? get(id).checked : ['composerWidth', 'fontSize'].includes(id) ? Number(get(id).value) : get(id).value; renderPreview(); });
for (const button of document.querySelectorAll('[data-theme]')) button.addEventListener('click', () => { theme = button.dataset.theme; syncControls(); });
get('region').addEventListener('change', () => { selectedRegion = get('region').value; renderPreview(); });
get('default-image').addEventListener('click', () => { delete config.images[selectedRegion]; renderPreview(); });
get('hide-image').addEventListener('click', () => { config.images[selectedRegion] = false; renderPreview(); });
get('choose-image').addEventListener('click', () => get('image-file').click());
get('image-file').addEventListener('change', async () => {
  const file = get('image-file').files[0], region = selectedRegion; if (!file) return;
  try {
    if (file.size > 8 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw Error('请选择 8 MB 以内的 PNG、JPEG 或 WebP');
    const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(Error('读取图片失败')); reader.readAsDataURL(file); });
    const copy = JSON.parse(JSON.stringify(config)); copy.images[region] = data; config = core.normalize(copy); renderPreview();
  } catch (error) { status(error.message, true); }
  get('image-file').value = '';
});
get('reset').addEventListener('click', () => { config = core.normalize({}); syncControls(); status('已恢复默认；导出并应用后才会改变皮肤。'); });
get('import').addEventListener('click', () => get('import-file').click());
get('import-file').addEventListener('change', async () => {
  const file = get('import-file').files[0]; if (!file) return;
  try { if (file.size > 64 * 1024 * 1024) throw Error('配置文件超过 64 MB'); config = core.normalize(JSON.parse(await file.text())); syncControls(); status('已导入配置。'); }
  catch (error) { status('导入失败：' + error.message, true); }
  get('import-file').value = '';
});
get('export').addEventListener('click', () => {
  try {
    config = core.normalize(config);
    const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'whale-desk.config.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
    status('已导出配置；请按右侧说明应用。');
  } catch (error) { status(error.message, true); }
});
syncControls();
