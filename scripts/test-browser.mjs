// Isolated shipped-CSS and offline-editor regression; never opens a user account.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { scenes, documentHtml, fullScene } from './preview-scenes.mjs';
import '../tools/config-core.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(process.env.PLAYWRIGHT_MODULE_PATH ? path.join(process.env.PLAYWRIGHT_MODULE_PATH, '_entry.cjs') : import.meta.url);
const { chromium } = require('playwright');
const runtime = process.env.SKIN_CENTER_MODULE ? await import(pathToFileURL(process.env.SKIN_CENTER_MODULE)) : null;
const transform = (css, filename) => runtime ? runtime.transformSkinCss(css, {skinId:'whale-desk',filename,deriveFallbacks:filename==='skin.css'}).code : css;
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
const page = await browser.newPage({ viewport: { width: 1200, height: 850 } });
const report = { kind: 'isolated-browser-regression', cssPipeline:process.env.SKIN_CENTER_VERSION || 'source-css', browser: browser.version(), tests: [], notice: 'Owned fixtures and offline editor only; not a native DSH compatibility claim.' };
const errors = [];
page.on('pageerror', error => errors.push(error.message));
let html = '';
const mime = { '.css':'text/css', '.js':'text/javascript', '.ttf':'font/ttf', '.svg':'image/svg+xml', '.png':'image/png', '.html':'text/html' };
await page.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.origin !== 'https://whale-desk.preview') return route.abort();
  if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html });
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return route.abort();
  try {
    let body = await fs.readFile(file);
    if (url.pathname.startsWith('/skins/whale-desk/') && /\/(skin|patches)\.css$/.test(url.pathname)) body = transform(body.toString(),path.basename(file));
    await route.fulfill({ contentType: mime[path.extname(file)] || 'application/octet-stream', body });
  }
  catch { errors.push('Missing asset: ' + url.pathname); await route.fulfill({ status: 404, body: 'Missing asset' }); }
});
async function test(name, fn) {
  try { await fn(); report.tests.push({ name, status:'PASS' }); console.log('PASS ' + name); }
  catch (error) { report.tests.push({ name, status:'FAIL', error:error.message }); console.error('FAIL ' + name + ': ' + error.message); }
}
async function load(content, theme='light', full=false) {
  await page.emulateMedia({ forcedColors:'none', reducedMotion:'no-preference' });
  html = documentHtml(content, 'Regression fixture', theme, {full});
  await page.goto('https://whale-desk.preview');
}
async function config(value) {
  const css = transform(globalThis.WhaleDeskConfig.compile(value),'patches.css');
  await page.evaluate(css => { let s=document.getElementById('diy-test'); if(!s) { s=document.createElement('style');s.id='diy-test';document.head.append(s); } s.textContent=css; }, css);
}
async function style(selector, property, pseudo=null) {
  return page.locator(selector).first().evaluate((el, args)=>getComputedStyle(el,args.pseudo)[args.property],{property,pseudo});
}
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfWQAAAAASUVORK5CYII=','base64');
async function openEditor() { await page.goto('https://whale-desk.preview/tools/editor.html'); await page.waitForFunction(()=>document.getElementById('status').textContent.includes('可导出')); }
async function importConfig(value) { await page.locator('#import-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))}); }
async function holdImport() {
  await page.evaluate(()=>{ const original=File.prototype.text; File.prototype.text=function(){ window.importWaiting=true; return new Promise(resolve=>{window.releaseImport=()=>original.call(this).then(resolve);}); }; });
}
try {
  await test('font switches system -> WenKai without leaving input override', async()=>{
    await load(fullScene('home'),'light',true);
    await config({font:'system'});
    assert.match(await style('[contenteditable]','fontFamily'),/Microsoft YaHei/);
    await config({font:'wenkai'});
    assert.match(await style('[contenteditable]','fontFamily'),/WenKai/);
  });
  for(const width of [1600,1000,700]) await test('decoration toggle and title reclaim space at '+width,async()=>{
    await page.setViewportSize({width,height:900}); await load(fullScene('home'),'light',true);
    await config({decorations:false});
    assert.equal(await style('.Dc7zOa_headerBlank','display','::before'),'none');
    assert.equal(await style('.Dc7zOa_headerBlank','left','::after'),'20px');
    await config({decorations:true});
    assert.notEqual(await style('.Dc7zOa_headerBlank','display','::before'),'none');
    assert.notEqual(await style('.Dc7zOa_headerBlank','left','::after'),'20px');
  });
  for(const theme of ['light','dark']) await test('collapsed native sidebar toggle stays visible and clickable: '+theme,async()=>{
    await load('<style>._2H3hWW_root._2H3hWW_collapsed{width:0;padding:0}._2H3hWW_logoRow{height:0}._2H3hWW_toggle{position:fixed;left:12px;top:6px;width:28px;height:28px;z-index:30}</style><div class="_2H3hWW_root _2H3hWW_collapsed"><div class="_2H3hWW_logoRow"><button class="_2H3hWW_toggle"><svg width="16" height="16"><rect width="16" height="16"/></svg></button></div></div>',theme);
    const rect=await page.locator('._2H3hWW_toggle').boundingBox();
    assert.equal(rect.x,12);assert.equal(rect.y,6);assert.equal(rect.width,28);
    assert.equal(await style('._2H3hWW_toggle svg','opacity'),'1');
    assert.equal(await style('._2H3hWW_logoRow','filter'),'none');
    await page.locator('._2H3hWW_toggle').evaluate(el=>el.addEventListener('click',()=>el.dataset.clicked='yes'));
    await page.locator('._2H3hWW_toggle').click();
    assert.equal(await page.locator('._2H3hWW_toggle').getAttribute('data-clicked'),'yes');
  });
  for(const theme of ['light','dark']) await test('expanded legacy brand receives artwork without styling its toggle: '+theme,async()=>{
    await load('<div class="_2H3hWW_root"><div class="_2H3hWW_logoRow"><button id="legacy-brand"><span>DeepSeek Harness</span></button><button class="_2H3hWW_toggle"><svg width="16" height="16"></svg></button></div></div>',theme);
    assert.match(await style('#legacy-brand','backgroundImage','::after'),/brand\.svg/);
    assert.equal(await style('#legacy-brand span','opacity'),'0');
    assert.equal(await style('._2H3hWW_toggle svg','opacity'),'1');
    assert.equal(await style('._2H3hWW_toggle','backgroundImage','::after'),'none');
  });
  await test('wallpaper hide/replace/default survives light-dark toggle',async()=>{
    await load(fullScene('home'),'light',true);
    for(const dark of [false,true,false]) {
      await page.evaluate(d=>document.body.toggleAttribute('data-ds-dark-theme',d),dark);
      await config({images:{home:false}}); assert.equal(await style('[data-conversation-region="chat"]','display','::before'),'none');
      await config({images:{home:'data:image/png;base64,'+png.toString('base64')}}); assert.match(await style('[data-conversation-region="chat"]','backgroundImage','::before'),/data:image\/png/);
      await config({}); assert.match(await style('[data-conversation-region="chat"]','backgroundImage','::before'),/home.png/);
    }
  });
  for(const [id,selector,pseudo] of [['account','.ET65mq_trigger',null],['question-pad','.mAtvLq_card',null],['trigger-open','[data-turn-trigger] > div',null],['plugin-page','.fO69Vq_card','::before'],['taskboard','._7D6uKa_card','::after']]) {
    await test('dark opaque linen removed: '+id,async()=>{
      await load(scenes.find(s=>s.id===id).render(),'dark');
      assert.equal(await style(selector,'backgroundImage',pseudo),'none');
      if(!pseudo) assert.equal(await style(selector,'backgroundColor'),'rgb(48, 39, 51)');
    });
  }
  for (const theme of ['light','dark']) await test('conversation surface and header stay readable after first message: '+theme,async()=>{
    await load(fullScene('messages'),theme,true);
    for(const selector of ['[data-conversation-region="chat"]','.Dc7zOa_header']) {
      assert.equal(await style(selector,'backgroundImage'),'none','opaque inherited linen must not cover the theme');
      assert.equal(await style(selector,'backgroundColor'),theme==='dark'?'rgb(48, 39, 51)':'rgb(255, 250, 244)');
    }
    assert.equal(await style('[data-conversation-region="chat"]','opacity','::before'),'0.22');
    const luminance=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
    const values=await page.locator('[data-conversation-region="chat"]').evaluate(el=>{const s=getComputedStyle(el);return [s.getPropertyValue('--desk-muted'),s.backgroundColor];});
    const rgb=await page.evaluate(color=>{const el=document.createElement('span');el.style.color=color;document.body.append(el);const v=getComputedStyle(el).color;el.remove();return v;},values[0]);
    const a=luminance(rgb),b=luminance(values[1]);
    assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'conversation status text needs readable contrast');
  });
  for (const theme of ['light','dark']) await test('native task page text and field contrast: '+theme,async()=>{
    await load(`<div class="S0jZwq_page"><div class="S0jZwq_pageContent"><header class="S0jZwq_pageHeading"><h1>自动化任务</h1></header><div class="S0jZwq_searchField"><input placeholder="搜索任务" value="测试输入"></div><div class="S0jZwq_list"><div class="S0jZwq_empty"><h2>还没有自动化任务</h2></div></div><article class="S0jZwq_row"><h2 class="S0jZwq_rowTitle">每日灵感</h2><p class="S0jZwq_rowSummary">暂停</p></article></div></div><div class="_7D6uKa_board"><section class="_7D6uKa_column" data-status="todo"><header class="_7D6uKa_columnHeader"><h2 class="_7D6uKa_columnTitle">待办</h2></header></section></div>`,theme);
    const luminance=rgb=>{const channels=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>{c/=255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;});return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;};
    const check=async(textSelector,surface)=>{const a=luminance(await style(textSelector,'color')),b=luminance(await style(surface,'backgroundColor'));assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,textSelector+' needs readable contrast');};
    await check('.S0jZwq_pageHeading h1','.S0jZwq_pageContent');
    await check('.S0jZwq_empty h2','.S0jZwq_empty');
    await check('.S0jZwq_rowTitle','.S0jZwq_row');
    await check('.S0jZwq_rowSummary','.S0jZwq_row');
    await check('.S0jZwq_searchField input','.S0jZwq_searchField');
    await check('._7D6uKa_columnTitle','._7D6uKa_columnHeader');
    if(theme==='dark') assert.equal(await style('._7D6uKa_columnHeader','backgroundImage'),'none');
    await page.locator('.S0jZwq_searchField input').fill('可正常输入');
    assert.equal(await page.locator('.S0jZwq_searchField input').inputValue(),'可正常输入');
  });
  for (const theme of ['light','dark']) await test('native task creation dialog palette: '+theme,async()=>{
    await load('<div role="dialog" class="_7D6uKa_modal"><h2 class="_7D6uKa_modalTitle">新建任务</h2><label>标题<input class="_7D6uKa_input" placeholder="一句话描述要做什么"></label><footer class="_7D6uKa_modalFooter"><button>取消</button></footer></div>',theme);
    assert.equal(await style('[role="dialog"]','backgroundColor'),theme==='dark'?'rgb(48, 39, 51)':'rgb(255, 250, 244)');
    assert.equal(await style('[role="dialog"]','color'),theme==='dark'?'rgb(241, 221, 234)':'rgb(112, 75, 109)');
    assert.equal((await style('[role="dialog"]','backgroundImage')),'none');
    assert.equal((await page.locator('[role="dialog"]').evaluate(el=>getComputedStyle(el).getPropertyValue('--dsw-alias-label-secondary'))).trim(),theme==='dark'?'#d0b6c8':'#80667d');
  });
  await test('forced colors hides wallpaper with default and customized background',async()=>{
    await load(fullScene('home'),'dark',true); await page.emulateMedia({forcedColors:'active'});
    assert.equal(await style('[data-conversation-region="chat"]','display','::before'),'none');
    await config({images:{home:'data:image/png;base64,'+png.toString('base64')}});
    assert.equal(await style('[data-conversation-region="chat"]','display','::before'),'none');
  });
  for (const theme of ['light','dark']) await test('native account portal has readable surface: '+theme,async()=>{
    await load('',theme);
    await page.evaluate(()=>document.body.insertAdjacentHTML('beforeend','<button class="ET65mq_trigger" aria-expanded="true">Account</button><div role="menu" data-menu-material="true"><div role="presentation"><div><button role="menuitem">Settings</button></div><div><button role="menuitem">Feedback</button></div><div><button role="menuitem">Sign out</button></div></div></div>'));
    assert.equal(await style('body > [role="menu"]','backgroundImage'),'none');
    assert.equal(await style('body > [role="menu"]','backgroundColor'),theme==='dark'?'rgb(48, 39, 51)':'rgb(255, 250, 244)');
    assert.equal(await style('body > [role="menu"] [role="menuitem"]','color'),theme==='dark'?'rgb(241, 221, 234)':'rgb(112, 75, 109)');
  });
  await test('reduced motion disables decorative animation',async()=>{
    await load(fullScene('home'),'light',true); await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await style('.Dc7zOa_headerBlank','animationDuration','::before'),'1e-05s');
  });
  for(const [region,target] of Object.entries(globalThis.WhaleDeskConfig.settingsTargets)) await test('settings identity survives inserted/reordered plugin: '+region,async()=>{
    const first=target.split(',')[0];
    const attr=first.startsWith('.')?'class="'+first.slice(1)+'"':first.startsWith('#')?'id="'+first.slice(1)+'"':first.slice(1,-1);
    const nav=Array.from({length:12},(_,i)=>'<button class="wCInkW_navCell" '+(i===8?'aria-current="true"':'')+'>Custom plugin '+i+'</button>').join('');
    await load('<div data-shortcut-modal="settings" class="wCInkW_panel"><nav><div>'+nav+'</div></nav><div><div class="wCInkW_header"></div><div class="wCInkW_options"><div '+attr+'>Fixture</div></div></div></div>');
    assert.match(await style('.wCInkW_options','backgroundImage','::after'),new RegExp(region+'\\.svg'));
    const titles={account:'账号与余额',general:'通用设置',models:'模型',plugins:'内置插件',presets:'Agent 预设',archive:'已归档会话',web:'Web 插件',skins:'皮肤',pets:'宠物',workshop:'创意工坊',usage:'使用统计'};
    assert.equal(await style('.wCInkW_header','content','::before'),'"'+titles[region]+'"');
    await config({images:{[region]:false}});assert.equal(await style('.wCInkW_options','display','::after'),'none');
    await config({});assert.notEqual(await style('.wCInkW_options','display','::after'),'none');
  });
  await test('unknown settings page does not borrow another section title or artwork',async()=>{
    await load('<div data-shortcut-modal="settings" class="wCInkW_panel"><nav><div><button aria-current="true">New plugin</button></div></nav><div><div class="wCInkW_header"></div><div class="wCInkW_options"><div>New plugin settings</div></div></div></div>');
    assert.equal(await style('.wCInkW_header','content','::before'),'"设置"');
    assert.match(await style('.wCInkW_options','backgroundImage','::after'),/watercolor-vignette/);
  });
  await page.setViewportSize({width:1440,height:1000});
  await test('offline editor exports current settings and imports them back',async()=>{
    await openEditor(); await page.locator('#motto').fill('慢慢来，也很好'); await page.locator('#font').selectOption('system');
    await page.locator('#decorations').uncheck();
    const downloadEvent=page.waitForEvent('download'); await page.locator('#export').click(); const download=await downloadEvent;
    const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));
    assert.equal(exported.motto,'慢慢来，也很好');assert.equal(exported.font,'system');assert.equal(exported.decorations,false);
    await page.locator('#reset').click(); await importConfig(exported);
    await page.waitForFunction(()=>document.getElementById('status').textContent==='已导入配置。');
    assert.equal(await page.locator('#motto').inputValue(),exported.motto);assert.equal(await page.locator('#decorations').isChecked(),false);
  });
  await test('invalid JSON and corrupt image keep the current configuration',async()=>{
    await openEditor(); await page.locator('#motto').fill('保留这句话');
    await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
    await page.waitForFunction(()=>document.getElementById('status').textContent.includes('导入失败'));
    assert.equal(await page.locator('#motto').inputValue(),'保留这句话');
    await importConfig({motto:'不能写入',images:{home:'data:image/png;base64,'+png.subarray(0,12).toString('base64')}});
    await page.waitForFunction(()=>document.getElementById('status').textContent.includes('无法解码'));
    assert.equal(await page.locator('#motto').inputValue(),'保留这句话');
  });
  await test('reset wins over an import still being read',async()=>{
    await openEditor(); await holdImport(); await importConfig({motto:'旧导入'});
    await page.waitForFunction(()=>window.importWaiting); await page.locator('#reset').click();
    await page.evaluate(()=>window.releaseImport()); await page.waitForTimeout(80);
    assert.equal(await page.locator('#motto').inputValue(),globalThis.WhaleDeskConfig.defaults.motto);
  });
  await test('newer manual edits win over an import still being read',async()=>{
    await openEditor(); await holdImport(); await importConfig({motto:'旧导入'});
    await page.waitForFunction(()=>window.importWaiting); await page.locator('#motto').fill('刚刚写的');
    await page.evaluate(()=>window.releaseImport()); await page.waitForTimeout(80);
    assert.equal(await page.locator('#motto').inputValue(),'刚刚写的');
  });
  await test('hide image wins over a pending image decode',async()=>{
    await openEditor();
    await page.evaluate(()=>{ const decode=HTMLImageElement.prototype.decode; HTMLImageElement.prototype.decode=function(){ window.imageWaiting=true;return new Promise(resolve=>{window.releaseImage=()=>decode.call(this).then(resolve);}); }; });
    await page.locator('#image-file').setInputFiles({name:'one.png',mimeType:'image/png',buffer:png});
    await page.waitForFunction(()=>window.imageWaiting); await page.locator('#hide-image').click();
    await page.evaluate(()=>window.releaseImage()); await page.waitForTimeout(80);
    assert.equal(await page.locator('#sample-image-wrap').isHidden(),true);
    await page.locator('#default-image').click();assert.equal(await page.locator('#sample-image-wrap').isVisible(),true);
  });
  await test('no missing assets or uncaught browser errors',async()=>assert.deepEqual(errors,[]));
} finally {
  report.status=report.tests.every(t=>t.status==='PASS')?'PASS':'FAIL';
  await fs.mkdir(path.join(root,'evidence/compatibility'),{recursive:true});
  await fs.writeFile(path.join(root,'evidence/compatibility/browser-tests'+(runtime?'-'+process.env.SKIN_CENTER_VERSION:'')+'.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
  if(report.status!=='PASS') process.exitCode=1;
}
