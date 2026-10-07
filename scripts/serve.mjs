import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain','.woff2':'font/woff2','.ttf':'font/ttf'};
const server = createServer(async (req,res)=>{
  try {
    const requested = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root,'.'+(requested === '/' ? '/index.html' : requested));
    const relative = path.relative(root,file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {res.writeHead(403).end();return;}
    const data = await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)] ?? 'application/octet-stream','Cache-Control':'no-store'}).end(data);
  } catch {res.writeHead(404).end('Arquivo não encontrado. Execute npm run build.');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Prévia: http://127.0.0.1:4173'));
