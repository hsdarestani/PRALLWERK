import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readProfile,mapLegacyStage,recordClear} from '../src/save.ts';
import {LEVELS} from '../src/levels.ts';
import {createState,fire,step,replay,playVolley,chooseRune,RUNES} from '../src/engine.ts';
const routes=JSON.parse(readFileSync(new URL('./campaign-routes.json',import.meta.url)));
const settings={language:'en',sound:true,contrast:true,volume:.24,motion:false};
test('v1 historical scores, seals and preferences survive once, with access rounded up and zero new seals',()=>{
 for(const n of [1,2,3,14,15,16,84,90,149,179,180]){
  const completed=Array.from({length:n-1},(_,i)=>i+1);
  if(n===180)completed.push(180);
  const best=Object.fromEntries(completed.map(i=>[i,3400+i]));
  const bytes=JSON.stringify({version:1,completed,best,unlocked:n,settings});
  const p=readProfile(bytes,true,null);
  assert.equal(p.unlocked,mapLegacyStage(n));assert.equal(p.version,2);
  assert.deepEqual(p.completed,[]);assert.deepEqual(p.best,{});
  assert.deepEqual(p.legacy.completed,completed);assert.deepEqual(p.legacy.best,best);
  assert.deepEqual(p.settings,settings);
  if(n>1)assert.ok(p.legacy.mastered.includes(1));
  assert.deepEqual(readProfile(JSON.stringify(p),false,null),p);
  recordClear(p,p.unlocked,2000);assert.deepEqual(p.legacy.best,best);
 }
 assert.equal(mapLegacyStage(16),7);assert.equal(mapLegacyStage(15),6);assert.equal(mapLegacyStage(180),72);
 assert.equal(readProfile(null,false,null).legacy,null);
});
test('72 input logs round trip exactly, including rune selections and all four boss transitions',()=>{
 let bosses=0;
 for(const [i,l] of LEVELS.entries()){
  const path=routes[i].map(n=>typeof n==='number'?n*.045:n);
  const run=replay(l,path);const second=replay(l,run.inputLog);
  assert.deepEqual(run,second);assert.equal(run.inputLog.length,path.length);
  if(l.boss){bosses++;assert.equal(run.phase,2);
    const events=run.events.map(e=>e.type);assert.ok(events.indexOf('warning')<events.indexOf('phase'));assert.ok(events.indexOf('phase')<events.indexOf('won'));
  }
 }
 assert.equal(bosses,4);
});
test('every second surviving volley requires exactly one logged selection',()=>{
 const s=createState(LEVELS[71]);playVolley(s,0);assert.equal(chooseRune(s,'pierce'),false);
 playVolley(s,0);assert.equal(s.runePending,true);assert.equal(fire(s,0),false);
 assert.equal(chooseRune(s,'pierce'),true);assert.equal(chooseRune(s,'surge'),false);
 assert.deepEqual(s.inputLog,[0,0,'pierce']);assert.equal(fire(s,0),true);
});
test('each rune changes an actual legal replay and has a board and shot where it leads on core damage',()=>{
 const leads=new Set();
 for(const id of [3,6,15,18,24,30,36,42,48,54,66,72]){
  const l=LEVELS[id-1];for(const prefix of [routes[id-1].slice(0,2).map(n=>n*.045),[0,0],[.35,.35],[-.24,-.24]]){
  const s=replay(l,prefix);if(!s.runePending)continue;
  for(let i=-29;i<=29&&leads.size<3;i++){
   const hp=RUNES.map(r=>{const trial=structuredClone(s);chooseRune(trial,r);playVolley(trial,i*.045);return trial.tiles.find(t=>t.kind==='core').hp;});
   for(let j=0;j<3;j++)if(hp.every((h,k)=>k===j||h>hp[j]))leads.add(RUNES[j]);
  }
 }
 }
 assert.deepEqual([...leads].sort(),[...RUNES].sort());
});
