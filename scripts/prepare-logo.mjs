import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'sharp');
const source='assets/logo-brain-source.png';
const metadata=await sharp(source).metadata();
if(!metadata.hasAlpha)throw Error('Logo sem transparência');
await sharp(source).resize(320,320,{fit:'inside'}).png().toFile('assets/logo-brain.png');
const favicon=await sharp(source).resize(64,64,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
await writeFile('assets/favicon.png',favicon);
await writeFile('assets/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${favicon.toString('base64')}"/></svg>`);
await sharp(source).resize(180,180,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile('assets/apple-touch-icon.png');
console.log('Logo e ícones PNG/SVG prontos, com transparência.');

