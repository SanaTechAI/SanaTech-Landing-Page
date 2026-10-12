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
 const emailHref=email?'mailto:'+email+'?subject='+encodeURIComponent('Avaliação gratuita de 30 a 45 minutos — SanaTech')+'&body='+encodeURIComponent(c.message||'Olá, SanaTech! Quero agendar minha avaliação gratuita de 30 a 45 minutos.'):'#contato';
 const contactHref=emailHref;
 const whatsappHref=phone?'https://wa.me/'+phone+'?text='+encodeURIComponent(c.message||''):'';
 const optionalContacts=(phone?`<a href="${esc(whatsappHref)}" ${ext}><strong>WhatsApp ↗</strong><small>${esc('+'+phone)}</small></a>`:'')+(instagram?`<a href="${esc(instagram)}" ${ext}><strong>Instagram ↗</strong><small>Conheça a SanaTech</small></a>`:'');
 return {initialHref:esc(contactHref),whatsappAttrs:'',emailHref:esc(emailHref),emailLabel:email?esc(email):'Canal em preparação',optionalContacts,contactChannel:'seu aplicativo de e-mail'};
}
export async function build(){
 const config=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
 const production=process.argv.includes('--production');
 if(!Number.isInteger(config.year)||config.year<2000||config.year>9999)throw Error('Configure year com um ano válido.');
 const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 let url='';if(config.url){const u=new URL(config.url);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('Informe domínio HTTPS válido.');url=u.href.replace(/\/$/,'')+'/';}
 const pending=['WHATSAPP_NUMBER','CONTACT_EMAIL','INSTAGRAM_URL'].filter(k=>!config[k]);
 if(production&&(!url||pending.length===3))throw Error('Para publicar, configure url e pelo menos um canal de contato.');
 const values={...Object.fromEntries(Object.entries(config).filter(([,v])=>typeof v==='string').map(([k,v])=>[k,esc(v)])),...contactValues(config),year:config.year,logoSrc:'data:image/png;base64,'+(await readFile(path.join(root,'assets/logo-brain.png'))).toString('base64'),url:esc(url),socialImage:esc(url+'assets/logo-brain.png'),robots:production?'index, follow, max-image-preview:large':'noindex, nofollow',socialMeta:url?`<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(url)}assets/logo-brain.png"><meta property="og:image:alt" content="Símbolo do cérebro SanaTech">`:'',schema:JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'SanaTech',...(config.CONTACT_EMAIL?{email:config.CONTACT_EMAIL}:{}),...(url?{url,logo:url+'assets/logo-brain.png'}:{})}).replace(/</g,'\\u003c')};
 const source=await readFile(path.join(root,'src/index.html'),'utf8');
 const render=(markup,v)=>{
  for(const [marker,attribute] of [['content','content'],['href','href'],['src','src']]){
   markup=markup.replace(new RegExp('<[a-z][^>]*data-site-'+marker+'="(\\w+)"[^>]*>','g'),(tag,key)=>{
    if(!(key in v))throw Error('Configuração desconhecida: '+key);
    return tag.replace(new RegExp('\\s'+attribute+'="[^"]*"'),' '+attribute+'="'+v[key]+'"');
   });
  }
  markup=markup.replace(/<([a-z][a-z0-9]*)\b([^>]*data-site-text="(\w+)"[^>]*)>[\s\S]*?<\/\1>/g,(_,tag,attrs,key)=>{
   if(!(key in v))throw Error('Configuração desconhecida: '+key);
   return '<'+tag+attrs+'>'+v[key]+'</'+tag+'>';
  });
  markup=markup.replace(/<div id="optional-contacts">[\s\S]*?<\/div>/g,'<div id="optional-contacts">'+v.optionalContacts+'</div>');
  if(markup.includes('{{'))throw Error('O HTML contém uma variável não resolvida.');
  return markup;
 };
 // Keep the source directly usable, including after configuration changes.
 await writeFile(path.join(root,'src/index.html'),render(source,{...values,robots:'noindex, nofollow'}));
 const html=render(source,values).replaceAll('href="../assets/','href="assets/');
 const out=path.join(root,'dist');await mkdir(out,{recursive:true});
 for(const folder of ['styles','scripts'])await cp(path.join(root,'src',folder),path.join(out,folder),{recursive:true});
 await writeFile(path.join(out,'styles/tokens.css'),(await readFile(path.join(root,'src/styles/tokens.css'),'utf8')).replaceAll('../../assets/','../assets/'));
 await mkdir(path.join(out,'assets'),{recursive:true});
 await cp(path.join(root,'assets/fonts'),path.join(out,'assets/fonts'),{recursive:true});
 for(const file of ['logo-brain.png','favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png'])await cp(path.join(root,'assets',file),path.join(out,'assets',file));
 await writeFile(path.join(out,'index.html'),html);
 await writeFile(path.join(out,'robots.txt'),production?`User-agent: *\nAllow: /\nSitemap: ${url}sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
 await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${production?`<url><loc>${esc(url)}</loc></url>`:''}</urlset>`);
 console.log('Build concluído: dist ('+(production?'produção':'revisão, noindex')+'). Contatos pendentes: '+pending.join(', '));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
