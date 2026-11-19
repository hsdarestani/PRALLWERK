import type {Tile,State,GameEvent} from './engine.ts';
import {predict} from './trajectory.ts';
import type {Point,Prediction} from './trajectory.ts';
const C={mint:'#a7f7d8',aqua:'#63f0da',amber:'#ffb266',blue:'#c4b3ff',coral:'#ff8e79'};
type Burst={x:number;y:number;age:number;life:number;size:number;color:string;kind:'ring'|'shard'|'points'|'spark';vx:number;vy:number;value?:number};
export function makeRenderer(canvas:HTMLCanvasElement){
const ctx=canvas.getContext('2d',{alpha:false})!;
let bursts:Burst[]=[],motion=true,contrast=false,low=false,impulse=0;
let cacheKey='',preview:Prediction={points:[],contacts:[]};
let backdrop:HTMLCanvasElement|null=null,lastStage=0,lastContrast=false;
function roundRect(x:number,y:number,w:number,h:number,r:number){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function line(x:number,y:number,x2:number,y2:number,color:string,width=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function circle(x:number,y:number,r:number,fill?:string,stroke?:string,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function text(str:string,x:number,y:number,size:number,color:string,weight='400'){ctx.fillStyle=color;ctx.font=`${weight} ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(str,x,y);}
function diamond(x:number,y:number,r:number,fill:string,stroke:string){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.78,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.78,y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke();}
function drawTile(t:Tile,time:number){if(t.hp<=0)return;const x=t.x,y=t.y,cx=x+22,cy=y+22;ctx.save();
  if(t.kind==='core'){
    const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,49);grad.addColorStop(0,'#f9a35625');grad.addColorStop(1,'#f9a35600');ctx.fillStyle=grad;ctx.fillRect(cx-50,cy-50,100,100);
    circle(cx,cy,27,'#32241c','#8f6949',1);circle(cx,cy,23,'#553324','#ffbf72',1.5);circle(cx,cy,17,'#372015','#bf864f');
    ctx.save();ctx.translate(cx,cy);ctx.rotate(time*.00028);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);line(-6,-25,6,-25,C.amber,3);}ctx.restore();
    diamond(cx,cy,10,'#ffac5a','#fff1c4');circle(cx,cy,4,'#ffedbe');
    ctx.fillStyle='#20372a';ctx.fillRect(x-1,y+56,46,3);ctx.fillStyle=C.amber;ctx.fillRect(x-1,y+56,46*t.hp/t.maxHp,3);text(`${t.hp}`,cx,y+70,9,'#ffd29c','700');
  }else if(t.kind==='conductor'){
    ctx.shadowColor='#65e3cf';ctx.shadowBlur=10;roundRect(x+2,y+4,40,40,7);ctx.fillStyle='#16392f';ctx.fill();ctx.shadowBlur=0;roundRect(x+2,y+1,40,40,7);const g=ctx.createLinearGradient(x,y,x+44,y+44);g.addColorStop(0,'#245e4b');g.addColorStop(1,'#163c32');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#72cbb2';ctx.lineWidth=1;ctx.stroke();roundRect(x+7,y+6,30,30,4);ctx.strokeStyle='#5eaa8b66';ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+3,cy-13);ctx.lineTo(cx-9,cy+2);ctx.lineTo(cx,cy+2);ctx.lineTo(cx-3,cy+13);ctx.lineTo(cx+10,cy-3);ctx.lineTo(cx+1,cy-3);ctx.closePath();ctx.fillStyle='#a2f4d3';ctx.fill();
    for(const [dx,dy] of [[0,22],[0,-22],[22,0],[-22,0]])circle(cx+dx,cy+dy,2,'#91cdb4');
  }else if(t.kind==='crystal'){
    ctx.shadowColor='#83ccdb';ctx.shadowBlur=9;diamond(cx,cy+3,23,'#112931','#487e8d');ctx.shadowBlur=0;diamond(cx,cy-2,23,'#254850','#7ec3ce');ctx.beginPath();ctx.moveTo(cx,cy-25);ctx.lineTo(cx+17,cy-2);ctx.lineTo(cx,cy+21);ctx.lineTo(cx-1,cy-3);ctx.closePath();ctx.fillStyle='#85d1ed64';ctx.fill();line(cx-17,cy-2,cx+17,cy-2,'#9bd9ec88');line(cx,cy-25,cx,cy+21,'#d6f8ff66');text(String(t.hp),cx,cy-1,13,'#e8fdff','700');
  }else if(t.kind==='armor'){
    roundRect(x+2,y+3,40,40,5);ctx.fillStyle=t.hp===t.maxHp?'#353f4d':'#3b3840';ctx.fill();ctx.strokeStyle=t.hp===t.maxHp?'#a4b2c2':'#ffc56e';ctx.lineWidth=1.2;ctx.stroke();roundRect(x+8,y+9,28,28,3);ctx.strokeStyle='#a1b3c04d';ctx.stroke();if(t.hp<t.maxHp){line(x+13,y+5,x+24,y+20,C.amber);line(x+24,y+20,x+17,y+39,C.amber);}text(String(t.hp),cx,cy,13,'#e5edf3','700');for(const dx of [7,37])for(const dy of [8,38])circle(x+dx,y+dy,1.4,'#91a3ae');
  }else{
    roundRect(x+1,y+1,42,42,7);ctx.fillStyle='#1a2d3e88';ctx.fill();ctx.strokeStyle='#587ca755';ctx.stroke();const ax=x+5,ay=t.flip?y+5:y+39,bx=x+39,by=t.flip?y+39:y+5;line(ax+2,ay+3,bx+2,by+3,'#233c59',7);ctx.shadowColor=C.blue;ctx.shadowBlur=10;line(ax,ay,bx,by,C.blue,5);line(ax,ay-1,bx,by-1,'#d5e5ff',1);ctx.shadowBlur=0;circle(ax,ay,3,'#577ba5','#a8c9fa');circle(bx,by,3,'#577ba5','#a8c9fa');
  }
  if(t.flash>0){ctx.globalAlpha=t.flash/24;roundRect(x-2,y-2,48,48,7);ctx.fillStyle='#e4ffe6';ctx.fill();}
  ctx.restore();
}
function resize(){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const w=Math.max(1,Math.round(canvas.clientWidth*dpr));
  const h=Math.round(w*560/420);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(w/420,0,0,h/560,0,0);
}
function background(id:number){
  if(backdrop&&lastStage===id&&lastContrast===contrast)return backdrop;
  const layer=document.createElement('canvas');layer.width=840;layer.height=1120;
  const p=layer.getContext('2d')!;p.scale(2,2);
  const grad=p.createRadialGradient(208,152,15,210,250,390);
  grad.addColorStop(0,id===1?'#213636':'#2b3142');grad.addColorStop(.58,'#132429');grad.addColorStop(1,'#0a1319');
  p.fillStyle=grad;p.fillRect(0,0,420,560);
  for(let y=17;y<550;y+=26)for(let x=16;x<412;x+=26){
    p.fillStyle=contrast?'#74938e':'#78968b44';p.fillRect(x,y,1.4,1.4);
    if((x+y)%52===33){p.fillStyle='#718e8621';p.fillRect(x-2,y,5,1);p.fillRect(x,y-2,1,5);}
  }
  for(const side of [1,-1]){
    p.save();if(side===-1){p.translate(420,0);p.scale(-1,1);}
    p.fillStyle='#121c21';p.fillRect(0,0,17,560);
    p.fillStyle='#586965';p.fillRect(16,17,1,521);
    for(let y=18;y<536;y+=55){
      p.fillStyle='#25353a';p.fillRect(2,y,11,46);
      p.fillStyle='#62736c';p.fillRect(4,y+4,5,1);p.fillRect(5,y+39,3,2);
    }
    for(let y=33;y<475;y+=10){p.fillStyle=y%5===3?'#648678':'#38524c';p.fillRect(19,y,3,1);}
    p.restore();
  }
  p.strokeStyle='#20343a';p.lineWidth=1;
  for(let i=0;i<4;i++){
    p.beginPath();p.moveTo(24,330+i*8);p.lineTo(52+i*10,330+i*8);p.lineTo(77+i*10,355+i*8);p.lineTo(77+i*10,399);p.stroke();
    p.beginPath();p.moveTo(396,118+i*6);p.lineTo(379-i*7,118+i*6);p.lineTo(349-i*7,148+i*6);p.stroke();
  }
  backdrop=layer;lastStage=id;lastContrast=contrast;return layer;
}
function wireRoute(a:Tile,b:Tile):Point[]{
  // Pick the same elbow for travel in either direction.
  const first={x:a.x+22,y:a.y+22},last={x:b.x+22,y:b.y+22};
  const elbow=a.id<b.id?{x:first.x,y:last.y}:{x:last.x,y:first.y};
  return [first,elbow,last];
}
function strokePath(points:Point[],color:string,width:number){
  if(points.length<2)return;
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(const p of points.slice(1))ctx.lineTo(p.x,p.y);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function partial(route:Point[],fraction:number):Point[]{
  const [a,b,c]=route;
  const first=Math.hypot(b.x-a.x,b.y-a.y),second=Math.hypot(c.x-b.x,c.y-b.y);
  const dist=(first+second)*Math.max(0,Math.min(1,fraction));
  const t=dist<first?dist/(first||1):(dist-first)/(second||1);
  const start=dist<first?a:b,end=dist<first?b:c;
  return [...(dist<first?[a]:[a,b]),{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t}];
}
function cables(s:State){
  const seen=new Set<string>();
  for(const a of s.tiles)for(const id of a.links){
    const b=s.tiles.find(t=>t.id===id),key=[a.id,id].sort().join('/');
    if(!b||a.hp<=0||b.hp<=0||seen.has(key))continue;
    seen.add(key);const route=wireRoute(a,b);strokePath(route,'#0a1416',6);strokePath(route,contrast?'#8ac9ae':'#426e65',2);
  }
  for(const flight of s.pulses){
    const progress=1-(flight.at-s.tick)/12;
    if(progress<0)continue;
    const a=s.tiles.find(t=>t.id===flight.from)!,b=s.tiles.find(t=>t.id===flight.to)!;
    const lit=partial(wireRoute(a,b),progress),tip=lit[lit.length-1];
    strokePath(lit,'#52f9d14b',8);strokePath(lit,'#b9ffe7',2.6);circle(tip.x,tip.y,3,'#e8fff5');
  }
}
function sight(s:State,angle:number,held:boolean){
  const key=[s.level.id,s.volley,angle].join('/');
  if(key!==cacheKey){cacheKey=key;preview=predict(s,angle);}
  const hit=preview.contacts[0],split=hit?preview.points.indexOf(hit):-1;
  ctx.save();ctx.setLineDash([3,7]);strokePath(split<0?preview.points:preview.points.slice(0,split+1),held?'#defff1':'#b6f3d3bd',held?2:1.6);
  if(split>=0){ctx.setLineDash([2,6]);strokePath(preview.points.slice(split),'#e8bc7ec9',1.4);ctx.setLineDash([]);circle(hit.x,hit.y,6,undefined,'#ffce8f',1.2);circle(hit.x,hit.y,2,'#ffe8c5');}
  ctx.restore();
}
function launcher(s:State,angle:number,held:boolean){
  const recoil=s.status==='flying'?Math.max(0,1-s.volleyTick/16)*6:0;
  circle(210,505,24,'#0d181d','#465852',2);circle(210,501,19,'#273837','#8fa49b',1.5);
  ctx.save();ctx.translate(210,500);ctx.rotate(angle);ctx.translate(0,recoil);
  roundRect(-8,-34,16,32,4);ctx.fillStyle='#132527';ctx.fill();ctx.strokeStyle='#85b9af';ctx.stroke();
  ctx.fillStyle='#304b49';ctx.fillRect(-7,-29,14,9);ctx.fillStyle=held?'#f5ffde':'#91dac0';ctx.fillRect(-5,-32,10,4);
  circle(0,0,12,'#182421','#a2c9b2',2);circle(0,0,5,'#c3f7c8');ctx.restore();
  for(let i=0;i<5;i++)circle(186+i*12,543,2.6,s.status==='flying'&&i>=s.returned?'#384b49':'#b0edc9');
}
function addEvent(e:GameEvent){
  const color=e.kind==='core'?C.amber:e.kind==='mirror'?C.blue:e.kind==='crystal'?'#9dd9f0':e.kind==='armor'?C.coral:C.aqua;
  const large=e.type==='destroy'||e.type==='won';
  if(!['wall','mirror','destroy','hit','pulse','won','breach','fire'].includes(e.type))return;
  const x=e.type==='pulse'?e.toX!:e.x,y=e.type==='pulse'?e.toY!:e.y;
  const base={x,y,color,age:0,vx:0,vy:0};
  bursts.push({...base,kind:'ring',life:large?.60:.26,size:large?42:14});
  if(e.type==='destroy')bursts.push({...base,kind:'points',life:.68,size:12,value:e.value});
  if(motion){
    const count=large?(low?6:14):e.type==='wall'?1:4;
    for(let i=0;i<count;i++){
      const a=i*2.399+x*.113+y*.017,speed=23+(i%7)*12;
      bursts.push({...base,kind:large?'shard':'spark',life:.32+(i%5)*.06,size:large?2+i%3:1.7,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed});
    }
    if(large)impulse=e.kind==='core'?3:1.2;
  }
  if(bursts.length>(low?65:140))bursts.splice(0,bursts.length-(low?65:140));
}
function paintBursts(dt:number){
  for(const b of bursts){b.age+=dt;if(b.age>=b.life)continue;
    const t=b.age/b.life;ctx.globalAlpha=1-t;
    if(b.kind==='ring')circle(b.x,b.y,3+(motion?t*b.size:5),undefined,b.color,1.3);
    else if(b.kind==='points')text('+'+b.value,b.x,b.y-15-(motion?18*t:0),12,'#ffdab1','700');
    else{const x=b.x+b.age*b.vx,y=b.y+b.age*b.vy+20*b.age*b.age;
      if(b.kind==='shard')diamond(x,y,b.size*(1-t*.6),b.color,b.color);else line(x,y,x-b.vx*.025,y-b.vy*.025,b.color,1.5);}
  }
  ctx.globalAlpha=1;bursts=bursts.filter(b=>b.age<b.life);
}
function draw(s:State,angle:number,held:boolean,now:number,dt:number){
  if(!canvas.clientWidth)return;
  ctx.save();ctx.drawImage(background(s.level.id),0,0,420,560);
  if(motion&&impulse>.05){ctx.translate(Math.sin(now*.067)*impulse,Math.cos(now*.055)*impulse*.5);impulse*=Math.exp(-dt*15);}
  cables(s);
  ctx.setLineDash([2,6]);line(23,448,397,448,'#d0967777');ctx.setLineDash([]);
  for(const x of [27,393]){line(x,444,x,452,'#dd9a78',2);}
  if(s.status==='ready')sight(s,angle,held);
  for(const t of s.tiles)drawTile(t,motion?now:0);
  launcher(s,angle,held);
  for(const b of s.balls){if(!b.alive||b.delay>0)continue;
    const trail=motion?b.trail.slice(low?-4:-8):[];
    for(let i=1;i<trail.length;i++){const a=trail[i-1],z=trail[i];ctx.globalAlpha=i/trail.length*.68;line(a.x,a.y,z.x,z.y,'#9afcce',1+i/trail.length*3.3);}
    ctx.globalAlpha=1;circle(b.x,b.y,7,'#9efbd32b');circle(b.x,b.y,4.2,'#e7ffdc');circle(b.x-1,b.y-1,1.5,'#fff');
  }
  paintBursts(dt);ctx.restore();
}
return {resize,draw,addEvent,settings(m:boolean,c:boolean,l:boolean){motion=m;contrast=c;low=l;},reset(){bursts=[];cacheKey='';impulse=0;}};
}
