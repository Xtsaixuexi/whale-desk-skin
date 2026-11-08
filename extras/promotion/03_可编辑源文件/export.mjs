// Export the editable local HTML cards. Does not connect to DSH or Xiaohongshu.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=fileURLToPath(new URL('./',import.meta.url));
const packageRoot=path.dirname(root.replace(/[\\/]$/,''));
const require=createRequire(process.env.PLAYWRIGHT_MODULE_PATH?path.join(process.env.PLAYWRIGHT_MODULE_PATH,'_entry.cjs'):import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1920},deviceScaleFactor:1});
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.ttf':'font/ttf'};
const project=JSON.parse(await fs.readFile(path.join(root,'project.json'),'utf8'));
let contact='';
await page.route('**/*',async route=>{
 const u=new URL(route.request().url());if(u.origin!=='https://whale-cards.preview')return route.abort();
 if(u.pathname==='/contact.html')return route.fulfill({contentType:'text/html; charset=utf-8',body:contact});
 const file=path.resolve(root,'.'+decodeURIComponent(u.pathname));
 if(!file.startsWith(root))return route.abort();
 try{await route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:await fs.readFile(file)});}
 catch{await route.fulfill({status:404,body:'Missing local asset'});}
});
async function ready(){await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));}
try{
 if(!process.argv.includes('--contact-only')){
  await page.goto('https://whale-cards.preview/index.html');await ready();
  await fs.mkdir(path.join(packageRoot,'01_发布图片'),{recursive:true});
  for(const scene of project.scenes)await page.locator('#slide-'+scene.number).screenshot({path:path.join(packageRoot,'01_发布图片',scene.file),animations:'disabled'});
 }
 contact='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><body style="margin:0;padding:20px;background:#efe7e3;display:grid;grid-template-columns:repeat(4,360px);gap:18px;font:18px sans-serif;color:#704b6d">'+(await Promise.all(project.scenes.map(async s=>'<div><img style="width:360px;display:block" src="data:image/png;base64,'+(await fs.readFile(path.join(packageRoot,'01_发布图片',s.file))).toString('base64')+'"><p style="margin:8px 0">'+String(s.number).padStart(2,'0')+' · '+s.title.split('\n')[0]+'</p></div>'))).join('')+'</body></html>';
 await page.setViewportSize({width:1534,height:1100});await page.goto('https://whale-cards.preview/contact.html');await ready();
 await page.screenshot({path:path.join(packageRoot,'图片总览.png'),fullPage:true});
 console.log('Export completed. Uploading and publishing are not performed.');
}finally{await browser.close();}
