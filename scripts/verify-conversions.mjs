import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist');
const config=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
const headerText=await readFile(path.join(out,'_headers'),'utf8');
const headers=Object.fromEntries(headerText.trim().split('\n').slice(1).map(line=>{
  const colon=line.indexOf(':');return [line.slice(0,colon).trim().toLowerCase(),line.slice(colon+1).trim()];
}));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.ttf':'font/ttf'};
const landing='https://sanatech.test/?gclid=local-test-only#inicio';
const sendTo='AW-18525878213/FT4PCOLrpbIdEMXv6YFF';
const browser=await chromium.launch({channel:'chrome',headless:true});

async function fixture({mode='callback',javaScriptEnabled=true}={}) {
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',javaScriptEnabled});
  const events=[],errors=[],destinations=[];
  await context.exposeFunction('__captureConversion',payload=>events.push(payload));
  await context.addInitScript(({mode})=>{
    window.dataLayer=[];
    const originalPush=window.dataLayer.push;
    window.dataLayer.push=function(...commands) {
      for(const command of commands) {
        if(command[0]!=='event'||command[1]!=='conversion') continue;
        const payload=command[2];
        window.__captureConversion({send_to:payload.send_to,keys:Object.keys(payload)});
        if(mode==='callback') setTimeout(()=>{
          payload.event_callback?.();
          payload.event_callback?.(); // Duplicate callbacks must not navigate twice.
        },0);
      }
      return originalPush.apply(this,commands);
    };
  },{mode});
  // All external requests are intercepted. No test conversions reach Google.
  await context.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.protocol==='file:'){await route.continue();return;}
    if(u.hostname==='www.googletagmanager.com') {
      await route.fulfill({contentType:'text/javascript',body:'/* Offline Google tag fixture. */'});return;
    }
    if(u.hostname==='wa.me') {
      destinations.push(u.href);
      await route.fulfill({contentType:'text/html',body:'<!doctype html><title>WhatsApp test destination</title>'});return;
    }
    if(u.hostname!=='sanatech.test'){await route.abort();return;}
    const file=path.resolve(out,'.'+(u.pathname==='/'?'/index.html':u.pathname));
    if(!file.startsWith(out+path.sep)){await route.abort();return;}
    await route.fulfill({headers:{...headers,'content-type':types[path.extname(file)]||'text/plain'},body:await readFile(file)});
  });
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  // Resource/CSP errors apply to the served build. Chrome may reject font
  // preloads on file://; script exceptions are still checked on that source.
  page.on('console',m=>{if(m.type()==='error'&&!page.url().startsWith('file:'))errors.push(m.text());});
  await page.goto(landing);
  if(mode==='absent') await page.evaluate(()=>{window.gtag=undefined;});
  if(mode==='throws') await page.evaluate(()=>{window.gtag=()=>{throw Error('Tag unavailable');};});
  assert.equal(events.length,0,'Loading the page must not record a WhatsApp conversion.');
  assert.equal(await page.locator('a[href^="https://wa.me/"]').count(),4);
  return {context,page,events,errors,destinations};
}

const cases=[
  {name:'navbar',selector:'.nav-cta'},
  {name:'hero arrow',selector:'.hero .button',child:'span'},
  {name:'contact CTA',selector:'.contact .button'},
  {name:'contact link and keyboard',selector:'#optional-contacts a',keyboard:true,newTab:true},
  {name:'Ctrl+click',selector:'.hero .button',options:{modifiers:['Control']},newTab:true},
  {name:'middle click',selector:'.hero .button',options:{button:'middle'},newTab:true},
  {name:'tag blocked or callback missing',selector:'.hero .button',mode:'silent'},
  {name:'tag unavailable',selector:'.hero .button',mode:'absent',count:0},
  {name:'tag throws',selector:'.hero .button',mode:'throws',count:0},
  {name:'JavaScript disabled',selector:'.hero .button',javaScriptEnabled:false,count:0}
];

try {
  for(const test of cases) {
    const {context,page,events,errors,destinations}=await fixture(test);
    try {
      const link=page.locator(test.selector);
      const href=await link.getAttribute('href');
      const url=new URL(href);
      assert.equal(url.pathname,'/'+config.WHATSAPP_NUMBER);
      assert.equal(url.searchParams.get('text'),config.message);
      const popup=test.newTab?context.waitForEvent('page',{timeout:5000}):null;
      if(test.keyboard){await link.focus();await link.press('Enter');}
      else await (test.child?link.locator(test.child):link).click(test.options);
      const destination=popup?await popup:page;
      if(popup)await destination.bringToFront();
      await destination.waitForURL(href,{timeout:5000});
      assert.equal(events.length,test.count??1,test.name+': conversion count');
      for(const event of events) {
        assert.equal(event.send_to,sendTo);
        assert(event.keys.every(key=>['send_to','event_callback','event_timeout'].includes(key)),'Only conversion routing and callback data should be sent.');
      }
      assert.deepEqual(destinations,[href],test.name+': exactly one navigation');
      if(test.newTab)assert.equal(page.url(),landing,'Keep the landing page and GCLID in the original tab.');
      assert.deepEqual(errors,[],test.name+': script/CSP errors');
    } catch(error) {
      throw new Error(test.name+': '+JSON.stringify({urls:context.pages().map(p=>p.url()),events,errors,destinations}),{cause:error});
    } finally {await context.close();}
  }

  const {context,page,events,errors}=await fixture();
  try {
    await page.locator('.nav-links a[href="#servicos"]').click();
    assert.equal(new URL(page.url()).searchParams.get('gclid'),'local-test-only');
    // Suppress launching the mail client after the document's conversion listener.
    await page.evaluate(()=>window.addEventListener('click',e=>{
      if(e.target.closest?.('a[href^="mailto:"]'))e.preventDefault();
    }));
    await page.locator('a[href^="mailto:"] strong').click();
    assert.equal(events.length,0,'Email and section links must not count as WhatsApp conversions.');
    await page.goto(new URL('../src/index.html',import.meta.url).href);
    await page.locator('.hero .button').click();
    await page.waitForURL('https://wa.me/**');
    assert.equal(events.length,1,'The directly opened source must also bind its contact buttons.');
    assert.equal(events[0].send_to,sendTo);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
  console.log('PASS: all 4 WhatsApp links, exact conversion label, one event per activation, keyboard and new tabs, callback timeout, blocked/absent/throwing tag, no JavaScript, email excluded, source HTML, CSP and GCLID preservation. No real conversion requests sent.');
} finally {await browser.close();}
