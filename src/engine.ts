/** Deterministic simulation. No DOM, clocks, random calls, network or rendering. */
export const WIDTH=420, HEIGHT=560, DT=1/120, SPEED=570, MAX_VOLLEY_TICKS=1680;
export type Kind='crystal'|'conductor'|'mirror'|'armor'|'core';
export interface Tile {id:string;kind:Kind;x:number;y:number;w:number;h:number;hp:number;maxHp:number;links:string[];flip:boolean;flash:number}
export interface Level {id:number;maxVolleys:number;orbCount:number;tiles:Tile[]}
export interface Ball {x:number;y:number;vx:number;vy:number;delay:number;alive:boolean;last:string;cooldown:number;trail:{x:number;y:number}[]}
export interface GameEvent {type:string;x:number;y:number;toX?:number;toY?:number;value?:number;kind?:Kind}
export interface State {level:Level;tiles:Tile[];balls:Ball[];status:'ready'|'flying'|'won'|'lost';tick:number;volleyTick:number;volley:number;hearts:number;score:number;destroyScore:number;chainScore:number;bonus:number;chains:number;bestChain:number;hits:number;returned:number;triggered:string[];pulses:{at:number;from:string;to:string}[];events:GameEvent[];inputLog:number[];capped:boolean}
export function createState(level:Level):State {return {level:structuredClone(level),tiles:structuredClone(level.tiles),balls:[],status:'ready',tick:0,volleyTick:0,volley:0,hearts:3,score:0,destroyScore:0,chainScore:0,bonus:0,chains:0,bestChain:0,hits:0,returned:0,triggered:[],pulses:[],events:[],inputLog:[],capped:false};}
export function fire(s:State,angle:number):boolean {
  if(s.status!=='ready'||!Number.isFinite(angle))return false;
  angle=Math.max(-1.32,Math.min(1.32,Math.round(angle*10000)/10000));
  s.inputLog.push(angle);s.status='flying';s.volley++;s.volleyTick=0;s.triggered=[];s.returned=0;s.capped=false;
  s.balls=Array.from({length:s.level.orbCount},(_,i)=>({x:WIDTH/2,y:500,vx:Math.sin(angle)*SPEED,vy:-Math.cos(angle)*SPEED,delay:i*9,alive:true,last:'',cooldown:0,trail:[]}));
  s.events.push({type:'fire',x:210,y:500});return true;
}
function emit(s:State,type:string,t:Tile,value=0) {s.events.push({type,x:t.x+t.w/2,y:t.y+t.h/2,value,kind:t.kind});}
function circuit(s:State,start:Tile) {
  if(s.triggered.includes(start.id))return;
  const visited=new Set([start.id]), queue=[{id:start.id,depth:0}];
  while(queue.length){const node=queue.shift()!;const t=s.tiles.find(v=>v.id===node.id)!;
    for(const id of t.links){if(visited.has(id))continue;const target=s.tiles.find(v=>v.id===id);if(!target||target.hp<=0)continue;visited.add(id);
      s.pulses.push({at:s.tick+(node.depth+1)*12,from:t.id,to:id});
      if(target.kind==='conductor')queue.push({id,depth:node.depth+1});
    }
  }
  for(const id of visited)s.triggered.push(id);
  const count=visited.size-1;if(count){s.chains++;s.bestChain=Math.max(s.bestChain,count);const points=count*40;s.score+=points;s.chainScore+=points;emit(s,'chain',start,count);}
}
function damage(s:State,t:Tile,power=1,pulse=false) {
  if(t.hp<=0||t.kind==='mirror')return;
  if(t.kind==='conductor'&&!pulse)circuit(s,t);
  t.hp=Math.max(0,t.hp-power);t.flash=12;s.hits++;emit(s,'hit',t,power);
  if(t.hp===0){const points=t.kind==='core'?500:t.kind==='armor'?150:100;s.score+=points;s.destroyScore+=points;emit(s,'destroy',t,points);}
}
function finish(s:State) {
  const core=s.tiles.find(t=>t.kind==='core');
  if(core&&core.hp<=0){s.status='won';s.bonus=s.hearts*100+(s.level.maxVolleys-s.volley)*50;s.score+=s.bonus;s.balls=[];s.pulses=[];emit(s,'won',core,s.score);return;}
  if(s.status!=='flying')return;
  for(const t of s.tiles){if(t.hp<=0||t.kind==='mirror')continue;t.y+=34;
    if(t.y+t.h>=448){s.hearts--;t.hp=0;emit(s,'breach',t);if(t.kind==='core')s.hearts=0;}}
  if(s.hearts<=0||s.volley>=s.level.maxVolleys){s.status='lost';s.events.push({type:'lost',x:210,y:280});}else s.status='ready';
}
function reflectRect(b:Ball,t:Tile):boolean {
  const radius=5, cx=Math.max(t.x,Math.min(b.x,t.x+t.w)), cy=Math.max(t.y,Math.min(b.y,t.y+t.h));
  let dx=b.x-cx,dy=b.y-cy;const d2=dx*dx+dy*dy;if(d2>=radius*radius)return false;
  if(d2<1e-8){const distances=[Math.abs(b.x-t.x),Math.abs(b.x-t.x-t.w),Math.abs(b.y-t.y),Math.abs(b.y-t.y-t.h)],i=distances.indexOf(Math.min(...distances));dx=i===0?-1:i===1?1:0;dy=i===2?-1:i===3?1:0;}else{const d=Math.sqrt(d2);dx/=d;dy/=d;}
  const dot=b.vx*dx+b.vy*dy;if(dot>=0)return false;
  b.vx-=2*dot*dx;b.vy-=2*dot*dy;b.x=cx+dx*(radius+.1);b.y=cy+dy*(radius+.1);return true;
}
function reflectMirror(b:Ball,t:Tile):boolean {
  const ax=t.x+4,ay=t.flip?t.y+4:t.y+t.h-4,bx=t.x+t.w-4,by=t.flip?t.y+t.h-4:t.y+4;
  const ux=bx-ax,uy=by-ay, len=ux*ux+uy*uy, k=Math.max(0,Math.min(1,((b.x-ax)*ux+(b.y-ay)*uy)/len));
  const px=ax+k*ux,py=ay+k*uy,dx=b.x-px,dy=b.y-py,d=Math.hypot(dx,dy);if(d>=8||d<1e-7)return false;
  const nx=dx/d,ny=dy/d,dot=b.vx*nx+b.vy*ny;if(dot>=0)return false;
  b.vx-=2*dot*nx;b.vy-=2*dot*ny;b.x=px+nx*8.1;b.y=py+ny*8.1;return true;
}
export function step(s:State) {
  if(s.status!=='flying')return;s.tick++;s.volleyTick++;
  for(const t of s.tiles)t.flash=Math.max(0,t.flash-1);
  const due=s.pulses.filter(p=>p.at<=s.tick);s.pulses=s.pulses.filter(p=>p.at>s.tick);
  for(const p of due){const a=s.tiles.find(t=>t.id===p.from)!,b=s.tiles.find(t=>t.id===p.to)!;s.events.push({type:'pulse',x:a.x+a.w/2,y:a.y+a.h/2,toX:b.x+b.w/2,toY:b.y+b.h/2});damage(s,b,2,true);}
  for(const b of s.balls){if(!b.alive)continue;if(b.delay>0){b.delay--;continue;}b.cooldown=Math.max(0,b.cooldown-1);b.x+=b.vx*DT;b.y+=b.vy*DT;
    b.trail.push({x:b.x,y:b.y});if(b.trail.length>9)b.trail.shift();
    if(b.x<23||b.x>397||b.y<25)s.events.push({type:"wall",x:b.x,y:b.y});
    if(b.x<23){b.x=46-b.x;b.vx=Math.abs(b.vx);}if(b.x>397){b.x=794-b.x;b.vx=-Math.abs(b.vx);}if(b.y<25){b.y=50-b.y;b.vy=Math.abs(b.vy);}
    if(b.y>535&&b.vy>0){b.alive=false;s.returned++;continue;}
    for(const t of s.tiles){if(t.hp<=0||b.cooldown>0&&b.last===t.id)continue;const hit=t.kind==='mirror'?reflectMirror(b,t):reflectRect(b,t);if(hit){b.last=t.id;b.cooldown=3;if(t.kind==='mirror')emit(s,'mirror',t);else damage(s,t);break;}}
  }
  if(s.tiles.some(t=>t.kind==='core'&&t.hp<=0)&&!s.pulses.length){finish(s);return;}
  if((s.balls.every(b=>!b.alive)&&!s.pulses.length)||s.volleyTick>=MAX_VOLLEY_TICKS){if(s.volleyTick>=MAX_VOLLEY_TICKS){s.capped=true;s.balls.forEach(b=>b.alive=false);s.pulses=[];}finish(s);}
}
export function playVolley(s:State,angle:number) {if(!fire(s,angle))return;while(s.status==='flying')step(s);}
export function drainEvents(s:State):GameEvent[] {return s.events.splice(0);}
export function replay(level:Level,angles:number[]):State {const s=createState(level);for(const a of angles)playVolley(s,a);return s;}
