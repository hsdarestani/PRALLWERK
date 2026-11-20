// Offline authoring tool. Stored angles are integer keyboard steps of 0.045 radians.
import {writeFileSync} from 'node:fs';
import {LEVELS} from '../src/levels.ts';
import {createState,playVolley,lockRemaining,replay} from '../src/engine.ts';
const routes=[[0,0],[20,20,20]];
function solve(level,seed) {
  let s=createState(level);
  const path=[];
  while(s.status==='ready'){
    let best=null;
    for(let angle=-29;angle<=29;angle++){
      const copy=structuredClone(s);
      playVolley(copy,angle*.045);
      if(copy.status==='lost')continue;
      const core=copy.tiles.find(t=>t.kind==='core');
      const damage=core.maxHp-core.hp;
      const balance=seed===0?400:180;
      const priority=damage*balance-lockRemaining(copy)*600+copy.hearts*220+copy.destroyScore*.45+copy.hits*2+Math.sin(angle*4+seed)*.5;
      if(copy.status==='won')return [...path,angle];
      if(!best||priority>best.priority)best={priority,angle,copy};
    }
    if(!best)return null;
    s=best.copy;s.events.length=0;path.push(best.angle);
  }
  return null;
}
for(const level of LEVELS.slice(2)){
  const path=solve(level,0)||solve(level,1);
  if(!path)throw Error('No route for '+level.id);
  routes.push(path);
}
writeFileSync('tests/campaign-routes.json',JSON.stringify(routes)+'\n');
console.log(routes.length+' winning routes. Volley counts: '+JSON.stringify(routes.reduce((m,p)=>(m[p.length]=(m[p.length]||0)+1,m),{})));

const targets=routes.map((path,i)=>{
  const score=replay(LEVELS[i],path.map(step=>step*.045)).score;
  return i<2?score:Math.floor(score*.95/50)*50;
});
writeFileSync('src/medals.ts','// Score targets from verified keyboard replays. Regenerate with scripts/solve-campaign.mjs.\nexport const TARGETS='+JSON.stringify(targets)+';\n');
