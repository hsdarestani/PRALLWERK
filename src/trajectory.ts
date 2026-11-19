import {fire,step,drainEvents} from './engine.ts';
import type {State} from './engine.ts';
export type Point={x:number;y:number};
export type Prediction={points:Point[];contacts:Point[]};
// Predict the lead orb using an isolated copy of the entire volley. Other orbs
// may destroy tiles behind it. The live simulation and replay log stay untouched.
export function predict(state:State,angle:number):Prediction {
  const copy=structuredClone(state);
  const points:Point[]=[{x:210,y:500}],contacts:Point[]=[];
  if(!fire(copy,angle))return {points,contacts};
  const lead=copy.balls[0];
  for(let tick=0;tick<200&&lead.alive&&copy.status==='flying';tick++){
    const vx=lead.vx,vy=lead.vy;
    step(copy);drainEvents(copy);
    const position={x:lead.x,y:lead.y};
    if(lead.vx!==vx||lead.vy!==vy){
      points.push(position);contacts.push(position);
      if(contacts.length===2)break;
    } else if(tick%5===0)points.push(position);
    if(contacts.length&&lead.y>490&&lead.vy>0)break;
  }
  return {points,contacts};
}
