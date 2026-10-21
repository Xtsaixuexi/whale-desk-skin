// Reproducible documentation rendering; never connects to DSH or a real account.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { scenes, fullScene, documentHtml } from './preview-scenes.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(process.env.PLAYWRIGHT_MODULE_PATH ? path.join(process.env.PLAYWRIGHT_MODULE_PATH,'_entry.cjs') : import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const context=await browser.newContext({viewport:{width:1200,height:850},deviceScaleFactor:1,reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[]; let html='';
const mime={'.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.jpg':'image/jpeg'};
await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!=='https://whale-desk.preview')return route.abort();
  if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
  const target=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!target.startsWith(root))return route.abort();
  try{await route.fulfill({contentType:mime[path.extname(target)]||'application/octet-stream',body:await fs.readFile(target)});}
  catch{errors.push(url.pathname);await route.fulfill({status:404,body:'Missing preview asset'});}
});
const manifest={schema:1,skinVersion:'1.1.1',kind:'static-css-fixtures',notice:'Fictional fixture data, rendered using the shipped skin CSS and documentation layout. Not native DSH screenshots or runtime test evidence.',components:[],screens:[],artwork:[]};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function record(file,extra){const b=await fs.readFile(path.join(root,file));return {...extra,file,sha256:sha(b),width:b.readUInt32BE(16),height:b.readUInt32BE(20)};}
async function render(file,content,title,theme,full=false){
  html=documentHtml(content,title,theme,{full});
  await page.setViewportSize({width:full?1600:1200,height:full?1080:850});
  await page.goto('https://whale-desk.preview/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const bad=await page.locator('img').evaluateAll(xs=>xs.filter(x=>!x.complete||!x.naturalWidth).map(x=>x.src));
  if(bad.length)throw new Error('Broken image: '+bad.join(','));
  await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});
  await page.screenshot({path:path.join(root,file),fullPage:true,animations:'disabled'});
  console.log(file);
  return record(file,{theme,title,kind:'static-css-fixture'});
}
try{
  const sample=process.argv.includes('--sample');
  for(const theme of sample?['light']:['light','dark']){
    for(const kind of sample?['home']:['home','messages','settings']){
      const file=`evidence/whale-desk${kind==='home'?'':'-'+kind}-${theme}.png`;
      manifest.screens.push(await render(file,fullScene(kind),{home:'首页',messages:'对话',settings:'设置'}[kind],theme,true));
    }
    for(const scene of sample?scenes.filter(s=>s.id==='composer'):scenes){
      manifest.components.push({...await render(`docs/components/${scene.id}-${theme}.png`,scene.render(),scene.title,theme),id:scene.id,group:scene.group});
    }
  }
  if(errors.length)throw new Error('Missing assets: '+[...new Set(errors)].join(','));
  if(!sample){
    await fs.mkdir(path.join(root,'docs/artwork'),{recursive:true});
    for(const id of ['home','account','general','models','plugins','presets','archive','web','skins','pets','workshop','usage','settings-sidebar','main-sidebar']){
      const source=id==='home'?'skins/whale-desk/assets/desk/home.png':`skins/whale-desk/assets/diy-generated/${id}.svg`;
      const bytes=await fs.readFile(path.join(root,source));
      const raster=id==='home'?bytes:[...bytes.toString().matchAll(/data:image\/[^;]+;base64,([^"']+)/g)].map(m=>Buffer.from(m[1],'base64')).sort((a,b)=>b.length-a.length)[0];
      if(!raster)throw new Error('Missing artwork '+id);
      const file=`docs/artwork/${id}.png`;await fs.writeFile(path.join(root,file),raster);
      manifest.artwork.push(await record(file,{id,source,kind:'original-raster-extraction'}));
    }
    await fs.writeFile(path.join(root,'docs/PREVIEW-MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
  }
}finally{await browser.close();}
