import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
const request=(path,method='GET')=>worker.fetch(new Request(`https://prallwerk.smarbiz.sbs${path}`,{method}));
test('Worker serves all real assets with correct types',async()=>{for(const [p,m]of [['/','text/html'],['/app.js','text/javascript'],['/engine.js','text/javascript'],['/levels.js','text/javascript'],['/style.css','text/css'],['/icon.svg','image/svg+xml']]){const r=await request(p);assert.equal(r.status,200);assert.ok(r.headers.get('Content-Type').startsWith(m));assert.ok((await r.text()).length>100);}});
test('preview health truthfully exposes two levels',async()=>{assert.deepEqual(await(await request('/api/health')).json(),{status:'ok',version:'0.2.0',preview:true,levels:2});});
test('nonexistent purchase, leaderboard, and QA routes do not pretend success',async()=>{for(const p of ['/api/checkout','/api/leaderboard','/qa.html','/not-found'])assert.equal((await request(p)).status,404);assert.equal((await request('/','POST')).status,405);});
test('preview denies embedding, sniffing, indexing and inline scripts',async()=>{const r=await request('/');assert.equal(r.headers.get('X-Frame-Options'),'DENY');assert.equal(r.headers.get('X-Content-Type-Options'),'nosniff');assert.match(r.headers.get('X-Robots-Tag'),/noindex/);assert.match(r.headers.get('Content-Security-Policy'),/script-src 'self'/);const head=await request('/','HEAD');assert.equal(await head.text(),'');});
