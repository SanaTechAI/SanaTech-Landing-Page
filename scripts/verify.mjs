import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {contactValues} from './build.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('.qa',{recursive:true});
const errors=[];
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 for(const width of [320,360,390,480,640,768,820,900,1024,1280,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4173'));await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('h1').count(),1);
  assert(await page.evaluate(()=>document.fonts.check('600 32px \"Space Grotesk\"')), 'Fonte dos títulos não carregou');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width);
  assert(await page.locator('#hero-title').isVisible());
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  assert.equal(await page.locator('.canvas-ready').count(),2);
  if(width<900){await page.getByRole('button',{name:'Menu'}).click();assert(await page.getByRole('link',{name:'Nosso método',exact:true}).isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');assert(await page.locator('.menu-toggle').evaluate(el=>el===document.activeElement));}
  await page.screenshot({path:`.qa/${width}-top.png`});
  await page.screenshot({path:`.qa/${width}.png`,fullPage:true});
 }
 for(const width of [320,768,1440]){
  await page.setViewportSize({width,height:1000});await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4173'));
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow com texto 200% em '+width);
 }
 await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4173'));
 for(const id of await page.locator('a[href^="#"]').evaluateAll(a=>a.map(el=>el.hash.slice(1))))assert.equal(await page.locator(`[id="${id}"]`).count(),1);
 assert.equal(await page.locator('a[href^="https://wa.me"],a[href^="mailto:"],a[href*="instagram.com"]').count(),0);
 const counters=[];
 for(let i=0;i<5;i++){await page.locator(`[data-node="${i}"]`).evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(120);counters.push(await page.locator('#scene-counter').textContent());}
 assert.deepEqual(counters,['01 / 05','02 / 05','03 / 05','04 / 05','05 / 05']);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 await page.waitForTimeout(100);assert.equal(await page.locator('#scene-counter').textContent(),'01 / 05');
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto((process.env.TEST_URL || 'http://127.0.0.1:4173'));assert(await nojs.getByRole('link',{name:'Nosso método',exact:true}).isVisible());assert(await nojs.locator('.network-fallback').first().isVisible());assert.equal(await nojs.locator('.plan').count(),3);
 const fallback=await browser.newPage();await fallback.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null});await fallback.goto((process.env.TEST_URL || 'http://127.0.0.1:4173'));assert(await fallback.locator('.network-fallback').first().isVisible());
 const links=contactValues({WHATSAPP_NUMBER:'5511999999999',CONTACT_EMAIL:'teste@example.com',INSTAGRAM_URL:'https://www.instagram.com/exemplo/',message:'Olá'});
 assert(links.essentialHref.includes('https://wa.me/5511999999999?text='));assert(decodeURIComponent(links.essentialHref).includes('IA Essencial'));assert(links.emailHref.startsWith('mailto:teste@example.com'));assert(links.instagramHref==='https://www.instagram.com/exemplo/');
 assert.throws(()=>contactValues({INSTAGRAM_URL:'javascript:alert(1)'}));
 JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.deepEqual(errors,[]);
 console.log('PASS: 12 larguras (320–1920px), texto ampliado 200%, fonte local, menu/teclado, âncoras, imagens, rede 3D/5 etapas, movimento reduzido, sem JS/Canvas, links configurados e vazios, JSON-LD e ausência de erros.');
}finally{await browser.close()}

