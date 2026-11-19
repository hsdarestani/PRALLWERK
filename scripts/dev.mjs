import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
await import('./build.mjs');
const portArg=process.argv.indexOf('--port');
const port = Number(portArg>=0?process.argv[portArg+1]:(process.env.PORT || 3000));
createServer(async(req,res)=>{try {const path=new URL(req.url,'http://localhost').pathname;const file=path==='/'?'index.html':path.slice(1);if(file.includes('..'))throw Error();const data=await readFile(`dist/${file}`);res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp'})[extname(file)]||'text/plain');res.end(data);}catch{res.writeHead(404);res.end('Nicht gefunden');}}).listen(port,'0.0.0.0',()=>console.log(`PRALLWERK http://localhost:${port}`));
