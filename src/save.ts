import {CAMPAIGN_SIZE} from './campaign.ts';
import {TARGETS} from './medals.ts';
import {languageFrom} from './locale.ts';
import type {Language} from './locale.ts';
export const SAVE_KEY='prallwerk.save.v1';
export type Profile={version:1;unlocked:number;completed:number[];best:Record<number,number>;settings:{sound:boolean;volume:number;motion:boolean;contrast:boolean;language:Language}};
export function readProfile(json:string|null,reduced:boolean,query:string|null):Profile {
  let data;
  try {data=JSON.parse(json||'null');} catch {data=null;}
  const raw=data?.version===1?data:{};
  const settings=raw.settings||{};
  const ids=Array.from({length:CAMPAIGN_SIZE},(_,i)=>i+1);
  const completed=ids.filter(id=>Array.isArray(raw.completed)&&raw.completed.includes(id));
  const best:Record<number,number>={};
  for(const id of ids)if(Number.isFinite(raw.best?.[id])&&raw.best[id]>=0)best[id]=Math.floor(raw.best[id]);
  return {version:1,completed,best,unlocked:Math.min(CAMPAIGN_SIZE,Math.max(1,Number.isInteger(raw.unlocked)?raw.unlocked:1,...completed.map(id=>id+1))),settings:{
    sound:settings.sound===true,volume:Number.isFinite(settings.volume)?Math.min(1,Math.max(0,settings.volume)):.55,
    motion:typeof settings.motion==='boolean'?settings.motion:!reduced,contrast:settings.contrast===true,
    language:languageFrom(query,settings.language)
  }};
}
export const masteryTarget=(id:number)=>TARGETS[id-1];

export function recordClear(profile:Profile,id:number,score:number){
  if(!profile.completed.includes(id))profile.completed.push(id);
  profile.unlocked=Math.max(profile.unlocked,Math.min(CAMPAIGN_SIZE,id+1));
  profile.best[id]=Math.max(profile.best[id]||0,score);
}
