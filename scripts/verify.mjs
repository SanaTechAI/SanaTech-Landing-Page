import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {contactValues} from './build.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const config=JSON.parse(await readFile('site.config.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('.qa',{recursive:true});
const errors=[];
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 const url=process.env.TEST_URL||'http://127.0.0.1:4173';
 for(const width of [320,360,390,480,640,768,820,900,1024,1280,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('h1').count(),1);
  assert(await page.evaluate(()=>document.fonts.check('600 32px "Space Grotesk"')));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width);
  assert(await page.locator('#hero-title').isVisible());
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  if(width<900){await page.getByRole('button',{name:'Menu'}).click();assert(await page.getByRole('link',{name:'Soluções',exact:true}).isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');assert(await page.locator('.menu-toggle').evaluate(el=>el===document.activeElement));}
  await page.screenshot({path:`.qa/${width}-top.png`});await page.screenshot({path:`.qa/${width}.png`,fullPage:true});
 }
 for(const width of [320,768,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(url);await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow com texto 200% em '+width);
 }
 await page.goto(url);
 for(const id of await page.locator('a[href^="#"]').evaluateAll(a=>a.map(el=>el.hash.slice(1))))assert.equal(await page.locator(`[id="${id}"]`).count(),1);
 const links=await page.locator('a[href^="mailto:"]').evaluateAll(a=>a.map(el=>el.getAttribute('href')));
 assert(links.length>=4);
 for(const link of links){const parsed=new URL(link);assert.equal(parsed.pathname,config.CONTACT_EMAIL);assert(parsed.searchParams.get('subject').includes('30 a 45'));assert(parsed.searchParams.get('body').includes('avaliação gratuita'));}
 assert.equal(await page.locator('a[href*="wa.me"],a[href*="instagram.com"]').count(),0);
 assert(!(await page.locator('body').innerText()).match(/R\$|20 a 30|Canal em preparação/));
 assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),config.url);
 assert((await page.locator('meta[name="robots"]').getAttribute('content')).startsWith('index'));
 const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.equal(schema.email,config.CONTACT_EMAIL);
 assert((await page.locator('.footer').innerText()).includes('© 2026'));
 assert((await page.locator('.nav .brand img').getAttribute('src')).startsWith('data:image/png;base64,'));
 for(const file of ['assets/favicon.svg','assets/favicon.ico','assets/favicon.png','assets/apple-touch-icon.png','robots.txt','sitemap.xml']){
  const resource=new URL(file,url);
  if(resource.protocol==='file:')assert((await readFile(fileURLToPath(resource))).length>0,file);
  else assert((await page.request.get(resource.href)).ok(),file);
 }
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(url);assert(await nojs.getByRole('link',{name:'Soluções',exact:true}).isVisible());assert(await nojs.getByRole('link',{name:'Quero minha avaliação grátis',exact:true}).first().isVisible());
 const contacts=contactValues({WHATSAPP_NUMBER:'5511999999999',CONTACT_EMAIL:'teste@example.com',INSTAGRAM_URL:'https://www.instagram.com/exemplo/',message:'Olá'});
 assert(contacts.initialHref.startsWith('mailto:teste@example.com'));assert(contacts.optionalContacts.includes('instagram.com/exemplo/'));assert(contactValues({CONTACT_EMAIL:'teste@example.com'}).initialHref.startsWith('mailto:teste@example.com'));
 assert.throws(()=>contactValues({INSTAGRAM_URL:'javascript:alert(1)'}));assert.throws(()=>contactValues({CONTACT_EMAIL:'inválido'}));assert.throws(()=>contactValues({WHATSAPP_NUMBER:'abc'}));
 const sourceUrl=new URL('../src/index.html',import.meta.url).href;
 const sourcePage=await browser.newPage();await sourcePage.goto(sourceUrl);await sourcePage.evaluate(()=>document.fonts.ready);
 assert(!(await sourcePage.content()).includes('{{'));
 const sourceLinks=await sourcePage.locator('a[data-site-href="emailHref"]').evaluateAll(a=>a.map(el=>el.getAttribute('href')));assert.equal(sourceLinks.length,4);for(const link of sourceLinks)assert.equal(new URL(link).pathname,config.CONTACT_EMAIL);
 await sourcePage.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert(await sourcePage.evaluate(()=>document.fonts.check('600 32px "Space Grotesk"')));
 for(const resource of await sourcePage.locator('link[href]').evaluateAll(els=>els.map(el=>el.href).filter(href=>href.startsWith('file:'))))assert((await readFile(fileURLToPath(new URL(resource)))).length>0);
 await sourcePage.screenshot({path:'.qa/source-fixed.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: 12 larguras (320–1920px), texto 200%, fontes, menu/teclado, âncoras, imagens e favicons, CTAs de avaliação por e-mail, contatos opcionais, SEO de produção, movimento reduzido, sem JS e ausência de erros.');
}finally{await browser.close()}
