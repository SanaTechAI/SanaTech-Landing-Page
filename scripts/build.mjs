import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
export function contactValues(c){
 const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const phone=(c.WHATSAPP_NUMBER||'').replace(/[\s()+-]/g,'');
 const email=(c.CONTACT_EMAIL||'').trim();
 const instagram=(c.INSTAGRAM_URL||'').trim();
 if(phone&&!/^[1-9]\d{7,14}$/.test(phone))throw Error('WHATSAPP_NUMBER: informe DDI + DDD + número.');
 if(email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw Error('CONTACT_EMAIL inválido.');
 if(instagram){const u=new URL(instagram);if(u.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(u.hostname)||u.username||u.password)throw Error('INSTAGRAM_URL: use um perfil HTTPS do Instagram.');}
 const ext='target="_blank" rel="noopener noreferrer"';
 const wa=message=>phone?'https://wa.me/'+phone+'?text='+encodeURIComponent(message):'#contato';
 return {whatsappHref:esc(wa(c.message)),initialHref:esc(wa('Olá, SanaTech! Quero agendar o plano IA Inicial — Grátis.')),essentialHref:esc(wa('Olá, SanaTech! Tenho interesse no plano IA Essencial — R$ 49.')),strategicHref:esc(wa('Olá, SanaTech! Tenho interesse no plano IA Estratégica — R$ 149.')),emailHref:esc(email?'mailto:'+email+'?subject='+encodeURIComponent('Vamos conversar — SanaTech'):'#contato'),instagramHref:esc(instagram||'#contato'),whatsappAttrs:phone?ext:'',instagramAttrs:instagram?ext:'',whatsappLabel:phone?esc('+'+phone):'Canal em preparação',emailLabel:email?esc(email):'Canal em preparação',instagramLabel:instagram?'Conheça a SanaTech':'Canal em preparação',contactNotice:!phone&&!email&&!instagram?'<p class="contact-notice" role="status">Nossos canais de contato estão em preparação. Em breve, você poderá conversar com a SanaTech por aqui.</p>':''};
}
export async function build(){
 const config=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
 const production=process.argv.includes('--production');
 const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 let url='';if(config.url){const u=new URL(config.url);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('Informe domínio HTTPS válido.');url=u.href.replace(/\/$/,'')+'/';}
 const pending=['WHATSAPP_NUMBER','CONTACT_EMAIL','INSTAGRAM_URL'].filter(k=>!config[k]);
 if(production&&(!url||pending.length===3))throw Error('Para publicar, configure url e pelo menos um canal de contato.');
 const values={...Object.fromEntries(Object.entries(config).filter(([,v])=>typeof v==='string').map(([k,v])=>[k,esc(v)])),...contactValues(config),year:new Date().getUTCFullYear(),robots:production?'index, follow, max-image-preview:large':'noindex, nofollow',socialMeta:url?`<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(url)}assets/hero.webp">`:'',schema:JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'SanaTech',...(url?{url,logo:url+'assets/brand.webp'}:{})}).replace(/</g,'\\u003c')};
 const html=(await readFile(path.join(root,'src/index.html'),'utf8')).replace(/\{\{(\w+)\}\}/g,(_,k)=>{if(!(k in values))throw Error('Variável desconhecida: '+k);return values[k]});
 const out=path.join(root,'dist');await mkdir(out,{recursive:true});
 for(const folder of ['styles','scripts'])await cp(path.join(root,'src',folder),path.join(out,folder),{recursive:true});
 await mkdir(path.join(out,'assets'),{recursive:true});
 await cp(path.join(root,'assets/fonts'),path.join(out,'assets/fonts'),{recursive:true});
 for(const file of ['brand.webp','hero.webp'])await cp(path.join(root,'assets',file),path.join(out,'assets',file));
 await writeFile(path.join(out,'index.html'),html);
 await writeFile(path.join(out,'robots.txt'),production?`User-agent: *\nAllow: /\nSitemap: ${url}sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
 await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${production?`<url><loc>${esc(url)}</loc></url>`:''}</urlset>`);
 console.log('Build concluído: dist ('+(production?'produção':'revisão, noindex')+'). Contatos pendentes: '+pending.join(', '));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
