import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
await mkdir('dist', { recursive: true });
for (const file of ['engine','levels','app']) {
  const source = await readFile(`src/${file}.ts`, 'utf8');
  await writeFile(`dist/${file}.js`, stripTypeScriptTypes(source, { mode: 'strip' }).replaceAll(/from '(\.\/[^']+)\.ts'/g, "from '$1.js'"));
}
await cp('public', 'dist', { recursive: true });
const assets = {};
for (const file of ['index.html','style.css','app.js','engine.js','levels.js','icon.svg']) assets['/'+file] = await readFile(`dist/${file}`,'utf8');
const worker = `const assets=${JSON.stringify(assets)};\nexport default {async fetch(request){const u=new URL(request.url);const p=u.pathname==='/'?'/index.html':u.pathname;const common={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','X-Robots-Tag':'noindex, nofollow'};if(p==='/api/health')return Response.json({status:'ok',version:'0.1.0',preview:true,levels:2});if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Methode nicht erlaubt',{status:405,headers:common});const body=assets[p];if(body===undefined)return new Response('Nicht gefunden',{status:404,headers:common});const ext=p.split('.').pop();const mime={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml'};return new Response(request.method==='HEAD'?null:body,{headers:{...common,'Content-Type':mime[ext]||'text/plain; charset=utf-8','Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"}})}};\n`;
await mkdir('dist/server', {recursive:true});await writeFile('dist/server/index.js',worker);
console.log(`Built 2 levels, ${Object.keys(assets).length} assets, Worker ${(Buffer.byteLength(worker)/1024).toFixed(1)} KB.`);
