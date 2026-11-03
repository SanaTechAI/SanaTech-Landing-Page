import {createRequire} from 'node:module';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist');
// A forgotten file must never survive a new release.
await writeFile(path.join(out,'security-stale-fixture.txt'),'test-only');
execFileSync(process.execPath,['scripts/build.mjs','--production'],{cwd:root});
await assert.rejects(access(path.join(out,'security-stale-fixture.txt')));
const headerText=await readFile(path.join(out,'_headers'),'utf8');
const headers=Object.fromEntries(headerText.trim().split('\n').slice(1).map(line=>{const i=line.indexOf(':');return [line.slice(0,i).trim().toLowerCase(),line.slice(i+1).trim()]}));
assert(!headers['content-security-policy'].includes('unsafe-inline'));
const allowed=new Set(['index.html','robots.txt','sitemap.xml','_headers','styles/tokens.css','styles/components.css','styles/motion.css','scripts/navigation.js','scripts/reveal.js','scripts/effects.js','assets/logo-brain.png','assets/logo-brain.webp','assets/favicon.svg','assets/favicon.png','assets/favicon.ico','assets/apple-touch-icon.png','assets/fonts/space-grotesk-variable.ttf','assets/fonts/dm-sans-regular.woff2','assets/fonts/dm-sans-bold.woff2','assets/fonts/Space-Grotesk-LICENSE.txt','assets/fonts/DM-Sans-LICENSE.txt']);
async function inventory(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())await inventory(full);else assert(allowed.has(path.relative(out,full).replaceAll('\\','/')),'Arquivo fora da lista pública: '+entry.name)}}
await inventory(out);
const html=await readFile(path.join(out,'index.html'),'utf8');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.ttf':'font/ttf'};
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 // Offline response fixtures enforce the actual deployment headers in Chromium.
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.hostname==='www.googletagmanager.com'&&u.pathname==='/gtag/js'){
   assert.equal(u.searchParams.get('id'),'AW-18525878213');
   await route.fulfill({contentType:'text/javascript',body:'window.__googleTagLoaded = true; const adsScript=document.createElement("script"); adsScript.src="https://googleads.g.doubleclick.net/pagead/viewthroughconversion/18525878213/"; document.head.append(adsScript);'});return;
  }
  if(u.hostname==='googleads.g.doubleclick.net'&&u.pathname==='/pagead/viewthroughconversion/18525878213/'){
   await route.fulfill({contentType:'text/javascript',body:'window.__adsEndpointLoaded=true;'});return;
  }
  if(u.hostname==='frame.test'){await route.fulfill({contentType:'text/html',body:'<iframe src="https://sanatech.test/"></iframe>'});return;}
  if(u.hostname!=='sanatech.test'){await route.abort();return;}
  const file=u.pathname==='/'?'index.html':u.pathname.slice(1);
  if(!allowed.has(file)||file==='_headers'){await route.fulfill({status:404,body:'Not found'});return;}
  let body=await readFile(path.join(out,file));
  if(file==='index.html'&&u.searchParams.has('injection'))body=Buffer.from(html.replace('</body>','<script>window.untrustedScriptRan=true</script></body>'));
  await route.fulfill({status:200,headers:{...headers,'content-type':types[path.extname(file)]||'text/plain'},body});
 });
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('https://sanatech.test/');await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>window.__googleTagLoaded===true&&window.__adsEndpointLoaded===true);
 const commands=await page.evaluate(()=>window.dataLayer.map(command=>Array.from(command)));
 assert(commands.some(command=>command[0]==='config'&&command[1]==='AW-18525878213'));
 assert.equal(await page.locator('script[src*="gtag/js"]').count(),1);
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 await page.getByRole('button',{name:'Menu'}).click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
 const card=page.locator('.service-grid article').first();await card.scrollIntoViewIfNeeded();await page.waitForTimeout(1000);assert.equal(await card.evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.waitForTimeout(100);assert(await page.locator('.reading-progress').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a>.99));
 assert.deepEqual(errors,[],'A política não pode bloquear recursos legítimos.');
 const injection=await context.newPage();await injection.goto('https://sanatech.test/?injection=1');assert.equal(await injection.evaluate(()=>window.untrustedScriptRan),undefined);
 const frame=await context.newPage();const frameErrors=[];frame.on('console',m=>frameErrors.push(m.text()));await frame.goto('https://frame.test/');await frame.waitForTimeout(300);assert(frameErrors.some(m=>/frame-ancestors|X-Frame-Options|refused to frame/i.test(m)),'Bloqueio de iframe não confirmado');
 console.log('PASS: CSP bloqueia script injetado e iframe externo; tag Google Ads autorizada e inicializada sem disparos reais; menu, logo, fontes e animações funcionam; build elimina sobras e publica apenas arquivos permitidos.');
}finally{await browser.close()}
