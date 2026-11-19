import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {dictionary,keys,languageFrom,message,nodeCount,number} from '../src/locale.ts';
import {readProfile,masteryTarget} from '../src/save.ts';
import {createState,fire,step,replay} from '../src/engine.ts';
import {predict} from '../src/trajectory.ts';
import {LEVELS} from '../src/levels.ts';
import worker from '../dist/server/index.js';

test('locale dictionaries cover the same UI keys and preserve their interpolation contracts',async()=>{
  const de=dictionary('de'),en=dictionary('en');
  for(const key of keys){
    assert.ok(de[key]?.trim()&&en[key]?.trim(),key);
    assert.deepEqual(de[key].match(/\{\w+\}/g),en[key].match(/\{\w+\}/g),key);
  }
  const html=await readFile('public/index.html','utf8');
  for(const [,key] of html.matchAll(/data-(?:t|label)="(.*?)"/g))assert.ok(key in en,key);
  assert.equal(message('en','stage',{n:'02'}),'Stage 02');
  assert.equal(nodeCount('en',1),'1 node');assert.equal(nodeCount('en',2),'2 nodes');
  assert.equal(number('de',1700),'1.700');assert.equal(number('en',1700),'1,700');
  assert.equal(message('en','unknown'),'unknown');
});
test('explicit locale wins, saved preference survives, unsupported inputs fall back to German',()=>{
  assert.equal(languageFrom('de','en'),'de');assert.equal(languageFrom('en',null),'en');
  assert.equal(languageFrom('fr','en'),'en');assert.equal(languageFrom(null,null),'de');
});
test('legacy profile retains scores, unlocks and accessibility settings',()=>{
  const p=readProfile(JSON.stringify({version:1,best:{1:1700},completed:[1],unlocked:2,settings:{sound:true,motion:false,contrast:true}}),false,null);
  assert.deepEqual(p.best,{1:1700});assert.deepEqual(p.completed,[1]);assert.equal(p.unlocked,2);
  assert.deepEqual(p.settings,{sound:true,motion:false,contrast:true,language:'de',volume:.55});
});
test('malformed and partial profile data can open a new game',()=>{
  for(const data of ['{','null','42','{"version":1,"completed":{"includes":2}}']){
    const p=readProfile(data,true,null);assert.equal(p.unlocked,1);assert.equal(p.settings.motion,false);
  }
});
test('guide predicts live lead-orb collisions and never mutates the run',()=>{
  for(const angle of [0,.9,1.2,-.8])for(const level of LEVELS){
    const s=createState(level),saved=structuredClone(s),guide=predict(s,angle);
    assert.deepEqual(s,saved);assert.ok(guide.contacts.length>0);
    const hits=[];fire(s,angle);const b=s.balls[0];
    for(let i=0;i<200&&b.alive&&s.status==='flying';i++){
      const {vx,vy}=b;step(s);if(b.vx!==vx||b.vy!==vy)hits.push({x:b.x,y:b.y});
    }
    assert.deepEqual(guide.contacts,hits.slice(0,guide.contacts.length));
  }
});
test('triple-speed tick batching preserves the entire scored simulation',()=>{
  for(const level of LEVELS){
    const simulate=count=>{
      const state=createState(level);
      for(const angle of [0,.9,-.3,.9,0]){
        if(!fire(state,angle))break;
        while(state.status==='flying')for(let i=0;i<count&&state.status==='flying';i++)step(state);
      }
      return state;
    };
    assert.deepEqual(simulate(6),simulate(2));
  }
});
test('both mastery targets are backed by achievable winning replays',()=>{
  for(const [i,angles] of [[0,[0,0]],[1,[.9,.9,.9]]]){
    const s=replay(LEVELS[i],angles);assert.equal(s.status,'won');assert.ok(s.score>=masteryTarget(i+1));
  }
});
test('preview serves localized document metadata, errors and the actual scene image',async()=>{
  let res=await worker.fetch(new Request('https://example.org/?lang=en'));
  assert.match(await res.text(),/<html lang="en"/);
  res=await worker.fetch(new Request('https://example.org/missing?lang=en'));
  assert.equal(res.status,404);assert.match(await res.text(),/Not found/);
  res=await worker.fetch(new Request('https://example.org/workshop.webp'));
  assert.equal(res.headers.get('content-type'),'image/webp');
  assert.deepEqual(Buffer.from(await res.arrayBuffer()),await readFile('public/workshop.webp'));
});
