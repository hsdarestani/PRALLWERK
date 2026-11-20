import {CAMPAIGN_SIZE} from './campaign.ts';
import {TARGETS} from './medals.ts';
import {languageFrom} from './locale.ts';
import type {Language} from './locale.ts';
export const SAVE_KEY='prallwerk.save.v2',LEGACY_KEY='prallwerk.save.v1';
type Records={completed:number[];best:Record<number,number>;unlocked:number};
type Archive=Records&{mastered:number[]};
type Settings={sound:boolean;volume:number;motion:boolean;contrast:boolean;language:Language};
export type Profile=Records&{version:2;settings:Settings;legacy:Archive|null};
const OLD_TARGETS=[1700,2150,2250,1000,2250,2150,1700,2200,2150,2350,1500,1700,2250,2200,2550,2150,2200,2250,2000,2050,2050,2100,2150,2150,2250,1550,2150,2300,2150,2650,2850,2700,2750,2450,2850,2600,2650,2750,2750,2950,2700,2600,2850,2850,3350,2650,2650,2650,2500,2650,2500,1800,2550,2600,2800,2600,2500,2650,2550,3100,2250,2350,2500,2250,2400,2250,2200,2300,2350,2500,2400,2300,2500,2350,2800,3000,2950,3050,2800,3000,2950,2750,2850,2850,3150,2900,2700,2950,2800,3400,2350,2400,2600,2250,2450,2200,2050,2300,2400,2550,2350,2250,2500,2350,2850,2850,2850,2950,2700,2650,2850,2700,2750,2950,3100,2900,2750,3000,2850,3300,3100,3050,3200,3000,3100,3100,2900,3150,3150,3300,3000,2900,3200,3050,3550,2500,2450,2750,2300,2600,2350,2350,2550,2550,2750,2550,2600,2750,2500,3100,3000,2950,3150,2850,3050,3000,2800,3050,3000,3200,2900,2900,3150,2900,3400,3200,3300,3450,3100,3350,3050,3100,3400,3300,3450,3150,3100,3400,3300,3650];
function records(raw:Partial<Records>,limit:number):Records{
 const ids=Array.from({length:limit},(_,i)=>i+1);
 const completed=ids.filter(id=>Array.isArray(raw.completed)&&raw.completed.includes(id));
 const best:Record<number,number>={};
 for(const id of ids){const score=raw.best?.[id];if(typeof score==='number'&&Number.isFinite(score)&&score>=0)best[id]=Math.floor(score);}
 const unlocked=Math.min(limit,Math.max(1,Number.isInteger(raw.unlocked)?raw.unlocked!:1,...completed.map(id=>id+1),...Object.keys(best).map(Number)));
 return {completed,best,unlocked};
}
function archive(raw:Partial<Records>):Archive{
 const progress=records(raw,180);
 return {...progress,mastered:progress.completed.filter(id=>progress.best[id]>=OLD_TARGETS[id-1])};
}
export function mapLegacyStage(id:number){
 const chapter=Math.floor((id-1)/15),slot=(id-1)%15;
 return Math.max(Math.min(id,3),chapter*6+1+Math.ceil(slot*5/14));
}
export function readProfile(json:string|null,reduced:boolean,query:string|null):Profile{
 let data;try{data=JSON.parse(json||'null');}catch{data=null;}
 const raw=data?.version===1||data?.version===2?data:{};
 const legacy=raw.version===1?archive(raw):raw.legacy?archive(raw.legacy):null;
 const current=records(raw.version===2?raw:{},CAMPAIGN_SIZE);
 if(raw.version===1&&legacy)current.unlocked=mapLegacyStage(legacy.unlocked);
 const settings=raw.settings||{};
 return {...current,version:2,legacy,settings:{
  sound:settings.sound===true,contrast:settings.contrast===true,language:languageFrom(query,settings.language),
  volume:Number.isFinite(settings.volume)?Math.min(1,Math.max(0,settings.volume)):.55,
  motion:typeof settings.motion==='boolean'?settings.motion:!reduced
 }};
}
export const masteryTarget=(id:number)=>TARGETS[id-1];
export function recordClear(profile:Profile,id:number,score:number){
 if(!profile.completed.includes(id))profile.completed.push(id);
 profile.unlocked=Math.max(profile.unlocked,Math.min(CAMPAIGN_SIZE,id+1));
 profile.best[id]=Math.max(profile.best[id]||0,score);
}
