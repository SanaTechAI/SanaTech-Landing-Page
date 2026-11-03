import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'sharp');
const root=fileURLToPath(new URL('./',import.meta.url));
const specs=[['paisagem',1200,628],['quadrada',1200,1200],['retrato',960,1200],['vertical',1080,1920]];
const result=[];
for(const [key,width,height] of specs){
 const output=path.join(root,`sanatech-${key}-${width}x${height}.jpg`);
 await sharp(path.join(root,'originais',key+'.png')).rotate().resize(width,height,{fit:'cover',position:'centre'}).flatten({background:'#f5f8fb'}).jpeg({quality:92,mozjpeg:true}).toFile(output);
 const metadata=await sharp(output).metadata();
 const size=(await stat(output)).size;
 if(metadata.width!==width||metadata.height!==height||size>5120*1024)throw Error('Formato ou tamanho inválido: '+output);
 result.push({file:path.basename(output),width,height,bytes:size,kb:Math.round(size/1024)});
}
await writeFile(path.join(root,'arquivos.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
