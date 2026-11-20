import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS} from '../src/levels.ts';
import {CHAPTERS,PER_CHAPTER} from '../src/campaign.ts';
import {replay,createState,lockRemaining,step,fire} from '../src/engine.ts';
import {readProfile,recordClear,masteryTarget} from '../src/save.ts';
const routes=JSON.parse(readFileSync(new URL('./campaign-routes.json',import.meta.url)));
test('180 distinct physical layouts fit the board and have valid circuits',()=>{
  assert.equal(LEVELS.length,180);assert.equal(CHAPTERS.length*PER_CHAPTER,180);
  const shapes=new Set();
  for(const [i,level] of LEVELS.entries()){
    assert.equal(level.id,i+1);
    assert.equal(level.tiles.filter(t=>t.kind==='core').length,1);
    const cells=new Set(),ids=new Set(level.tiles.map(t=>t.id));assert.equal(ids.size,level.tiles.length);
    for(const t of level.tiles){
      const pos=t.x+','+t.y;assert.ok(!cells.has(pos));cells.add(pos);
      assert.ok(t.x>=23&&t.x+t.w<=397&&t.y>=25&&t.y+t.h<448);
      assert.ok(t.links.every(id=>ids.has(id)));
    }
    const shape=level.tiles.map(t=>[t.x,t.y,t.kind,t.kind==='mirror'&&t.flip].join(':')).sort().join('|');
    assert.ok(!shapes.has(shape),'duplicate board '+level.id);shapes.add(shape);
  }
});
test('every stage can be won and mastered through legal keyboard aim steps; unlocks survive every reload',()=>{
  let p=readProfile(null,false,'en');
  assert.equal(routes.length,180);
  for(const [i,route] of routes.entries()){
    assert.equal(p.unlocked,i+1);
    assert.ok(route.every(n=>Number.isInteger(n)&&Math.abs(n)<=29));
    const state=replay(LEVELS[i],route.map(n=>n*.045));
    assert.equal(state.status,'won','stage '+(i+1));assert.ok(state.hearts>0);
    assert.ok(state.score>=masteryTarget(i+1));
    recordClear(p,i+1,state.score);p=readProfile(JSON.stringify(p),false,null);
    assert.equal(p.completed.length,i+1);assert.equal(p.best[i+1],state.score);
  }
  assert.equal(p.unlocked,180);recordClear(p,2,100);assert.equal(p.best[2],2150);assert.equal(p.unlocked,180);
});
test('a returning two-stage player starts at stage three with their original records',()=>{
  const p=readProfile(JSON.stringify({version:1,completed:[1,2],best:{1:1700,2:2150},unlocked:2}),false,null);
  assert.equal(p.unlocked,3);assert.deepEqual(p.best,{1:1700,2:2150});
});
test('shielded cores ignore physical hits until the required parts are cleared',()=>{
  const s=createState(LEVELS.find(l=>l.lock));const core=s.tiles.find(t=>t.kind==='core');
  function hit(){
    if(s.status==='ready')fire(s,0);
    s.balls=s.balls.slice(0,1);Object.assign(s.balls[0],{x:core.x+22,y:core.y+core.h+6,vy:-570,vx:0,delay:0,alive:true,cooldown:0});step(s);
  }
  assert.ok(lockRemaining(s)>0);hit();assert.equal(core.hp,core.maxHp);assert.ok(s.events.some(e=>e.type==='guard'));
  s.tiles.filter(t=>t.kind===s.level.lock.kind).forEach(t=>t.hp=0);
  assert.equal(lockRemaining(s),0);hit();assert.equal(core.hp,core.maxHp-1);
});
