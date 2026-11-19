import {createState,fire,step,drainEvents,DT} from './engine.ts';
import type {GameEvent} from './engine.ts';
import {LEVELS} from './levels.ts';
import {message,number,nodeCount} from './locale.ts';
import type {Key,Language} from './locale.ts';
import {SAVE_KEY,masteryTarget,readProfile} from './save.ts';
import {icon} from './icons.ts';
import {makeRenderer} from './render.ts';
import {AudioBus} from './audio.ts';

const el=(id:string)=>document.getElementById(id)!;
const canvas=el('game') as HTMLCanvasElement;
const modal=el('modal') as HTMLDialogElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const query=new URL(location.href).searchParams.get('lang');
let stored:string|null=null,canSave=true;
try {stored=localStorage.getItem(SAVE_KEY);}catch{canSave=false;}
const profile=readProfile(stored,reduced.matches,query);
const synth=new AudioBus();
const renderer=makeRenderer(canvas);
const fmt=(n:number)=>number(profile.settings.language,n);
const t=(key:Key,vars:Record<string,string|number>={})=>message(profile.settings.language,key,vars);
const stageName=(id:number)=>t(id===1?'s1':'s2');
const stageNumber=(id:number)=>t('stage',{n:String(id).padStart(2,'0')});
const settings=profile.settings;
const notify=(text:string)=>{el('live').textContent=text;};
let s=createState(LEVELS[0]),playing=false,angle=0,activePointer:number|null=null,fast=false;
let frameTime=0,accum=0,previousHud='',slowFrames=0,qualityLow=false;
let resultTimer=0,newBest=false,newUnlock=false,lastChain=0,toastUntil=0;
let hintKey:Key|null=null,hintUntil=0,dialogView='',returnView='',pendingStage=0;
let feedback:'chain'|'breach'|null=null,pulseIndex=0;

function writeSave(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(profile));}catch{canSave=false;}
  el('save-status').textContent=t(canSave?'local':'noSave');
}
function label(element:HTMLElement,key:Key){
  element.setAttribute('aria-label',t(key));element.title=t(key);
}
function languageButtons(){
  return '<div class="lang" role="group" aria-label="'+t('language')+'">'+['de','en'].map(lang=>
    '<button data-lang="'+lang+'" lang="'+lang+'" aria-label="'+t(lang as Key)+'" aria-pressed="'+(settings.language===lang)+'">'+lang.toUpperCase()+'</button>').join('')+'</div>';
}
function localize(){
  document.documentElement.lang=settings.language==='de'?'de-DE':'en';
  document.title=t('title');document.querySelector('meta[name="description"]')!.setAttribute('content',t('description'));
  document.querySelectorAll<HTMLElement>('[data-t]').forEach(node=>node.textContent=t(node.dataset.t as Key));
  document.querySelectorAll<HTMLElement>('[data-label]').forEach(node=>label(node,node.dataset.label as Key));
  document.querySelectorAll<HTMLElement>('[data-lang]').forEach(node=>{
    node.setAttribute('aria-pressed',String(node.dataset.lang===settings.language));
    node.setAttribute('aria-label',t(node.dataset.lang as Key));
  });
  el('brand').setAttribute('aria-label',t('home')+' · PRALLWERK');
  el('save-status').textContent=t(canSave?'local':'noSave');
  el('start').querySelector('span')!.textContent=t(profile.completed.length?'resumeCampaign':'start');
  el('progress').textContent=t('progress')+' · '+profile.completed.length+' / 2';
  el('stage-cards').innerHTML=cards();
  el('stage-code').textContent=stageNumber(s.level.id);
  el('board-name').textContent=stageName(s.level.id);el('stage-name').textContent=stageName(s.level.id);
  el('stage-tip').textContent=t(s.level.id===1?'tip1':'tip2');
  el('target').textContent=t('targetRule',{n:fmt(masteryTarget(s.level.id))});
  el('best').textContent=profile.best[s.level.id]?fmt(profile.best[s.level.id]):t('first');
  el('audio').innerHTML=icon(settings.sound?'sound':'mute');label(el('audio'),settings.sound?'mute':'unmute');
  el('live').textContent='';
  previousHud='';updateHud();updateToast();
}
function changeLanguage(lang:Language){
  if(lang!=='en'&&lang!=='de')return;
  settings.language=lang;
  const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
  writeSave();localize();
  if(dialogView){drawDialog();modal.querySelector<HTMLElement>('[data-lang="'+lang+'"]')?.focus();}
}
function applySettings(){
  document.body.classList.toggle('high',settings.contrast);
  document.body.classList.toggle('still',!settings.motion);
  synth.enabled=settings.sound;synth.level(settings.volume);
  renderer.settings(settings.motion,settings.contrast,qualityLow);
}
function schematic(id:number){
  const first=id===1;
  const art=first?'<path d="M8 28h17V16h31v12h16" stroke="#70cabc"/><path d="m12 21 5 7-5 7-5-7zM68 21l5 7-5 7-5-7z" fill="#375961" stroke="#aed3db"/><rect x="33" y="8" width="15" height="15" rx="2" fill="#2b6258" stroke="#a2eccd"/><path d="m42 10-6 7h4l-1 5 6-9h-4z" fill="#a2eccd" stroke="none"/>':'<path d="m6 35 17-19 18 14 22-20" stroke="#8ba19c" stroke-dasharray="2 3"/><path d="m14 23 13-13m24 24 13-13" stroke="#b8acf2" stroke-width="4"/><path d="m39 7 6 7-6 7-6-7z" fill="#c68f55" stroke="#ffd8a2"/>';
  return '<span class="map-symbol"><svg viewBox="0 0 80 42" aria-hidden="true">'+art+'</svg></span>';
}
function cards(){
  return LEVELS.map(level=>{
    const id=level.id,locked=id>profile.unlocked,done=profile.completed.includes(id);
    const best=profile.best[id]||0,mastered=done&&best>=masteryTarget(id);
    const subtitle=done?t('personal')+' · '+fmt(best):t(locked?'locked':'unlocked');
    return '<button class="stage-card" data-act="level" data-stage="'+id+'" '+(locked?'disabled':'')+'>'+schematic(id)+'<span><span class="stage-no">'+stageNumber(id)+'</span><strong>'+stageName(id)+'</strong><small>'+subtitle+'</small></span><i>'+icon(locked?'lock':mastered?'medal':done?'check':'play')+'</i></button>';
  }).join('');
}
function phase():Key{
  if(s.status==='won'||s.status==='lost')return 'ended';
  if(s.status==='ready')return activePointer!==null?'aiming':'aim';
  if(s.volleyTick<30)return 'launch';
  if(s.pulses.length)return 'resolving';
  if(s.balls.filter(b=>b.alive).every(b=>!b.delay&&b.vy>0))return 'returning';
  return 'flying';
}
function updateHud(){
  const core=s.tiles.find(tile=>tile.kind==='core')!;
  const key=[s.hearts,s.volley,s.score,s.status,core.hp,s.returned,fast,phase(),hintKey].join('|');
  if(previousHud===key)return;
  previousHud=key;
  el('score').textContent=fmt(s.score);el('shots').textContent=String(s.level.maxVolleys-s.volley)+' / '+s.level.maxVolleys;
  el('shields').innerHTML=[0,1,2].map(i=>'<i class="'+(i>=s.hearts?'spent':'')+'">'+icon('shield')+'</i>').join('');
  el('shields').setAttribute('aria-label',t('shields')+' '+Math.max(0,s.hearts));
  el('core').textContent=core.hp+' / '+core.maxHp;(el('core-meter') as HTMLProgressElement).value=core.hp/core.maxHp;
  el('phase').textContent=t(phase());el('orb-status').textContent=s.status==='flying'?t('balls')+' '+(5-s.returned)+'/5':t('balls')+' ×5';
  const flying=s.status==='flying',ended=s.status==='lost'||s.status==='won';
  el('fire-label').textContent=t(ended?(s.status==='won'?'clearedLevel':'lostLevel'):flying?(fast?'normal':'fast'):'fire')+(flying?(fast?' ×1':' ×3'):'');
  el('fire-btn').querySelector('i')!.innerHTML=icon(ended?'medal':flying?'speed':'charge');
  el('control-hint').textContent=t(hintKey??(s.volley===0?(s.level.id===2?'tip2':'drag'):'goal'));
}
function updateToast(){
  const box=el('callout');box.hidden=!feedback;
  if(feedback==='chain')box.innerHTML=t(lastChain>=5?'overload':'chain')+'<small>'+nodeCount(settings.language,lastChain)+' · +'+fmt(lastChain*40)+'</small>';
  else if(feedback==='breach')box.textContent=t('breach');
}
function cancelPointer(){
  const id=activePointer;activePointer=null;
  if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
}
function startLevel(id:number){
  if(id<1||id>profile.unlocked)return;
  closeDialog();cancelPointer();s=createState(LEVELS[id-1]);
  playing=true;angle=0;fast=false;resultTimer=0;accum=0;feedback=null;hintKey=null;
  renderer.reset();el('home-screen').hidden=true;el('game-screen').hidden=false;
  document.body.classList.add('game-active');localize();renderer.resize();
  canvas.focus({preventScroll:true});window.scrollTo(0,0);
  notify(stageNumber(id)+'. '+t('goal'));
}
function home(){
  closeDialog();cancelPointer();playing=false;resultTimer=0;feedback=null;
  document.body.classList.remove('game-active');el('game-screen').hidden=true;el('home-screen').hidden=false;localize();
  el('start').focus({preventScroll:true});window.scrollTo(0,0);
}
function show(view:string){
  cancelPointer();dialogView=view;drawDialog();
  if(!modal.open)modal.showModal();accum=0;frameTime=0;
}
function closeDialog(){
  if(modal.open)modal.close();dialogView='';frameTime=0;accum=0;
  if(playing)canvas.focus({preventScroll:true});
}
function button(act:string,key:Key,primary=false){
  return '<button class="'+(primary?'primary':'secondary')+'" data-act="'+act+'">'+t(key)+'</button>';
}
function row(key:Key,value:string){
  return '<div class="result-row"><span>'+t(key)+'</span><b>'+value+'</b></div>';
}
function drawDialog(){
  const view=dialogView;
  const titles:Record<string,Key>={pause:'paused',help:'guide',privacy:'privacy',settings:'settings',stages:'stages',exit:'exitAsk',restart:'restartAsk',change:'exitAsk',result:s.status==='won'?(s.level.id===1?'clear1':'clear2'):'defeat'};
  let content='',actions='';
  switch(view){
    case 'pause':
      actions=button('close','resume',true)+button('restart','restart')+button('stages','stages')+button('home','menu');break;
    case 'stages':
      content='<div class="modal-cards">'+cards()+'</div>';break;
    case 'settings':
      content='<div class="settings-row"><span>'+t('language')+'</span>'+languageButtons()+'</div>';
      for(const [name,key] of [['sound','audio'],['motion','motion'],['contrast','contrast']] as const){
        content+='<div class="settings-row"><label for="opt-'+name+'">'+t(key)+'</label><input id="opt-'+name+'" data-opt="'+name+'" type="checkbox" '+(settings[name]?'checked':'')+'></div>';
      }
      content+='<div class="settings-row"><label for="volume">'+t('volume')+'</label><input id="volume" type="range" min="0" max="100" value="'+Math.round(settings.volume*100)+'"><output id="volume-val">'+Math.round(settings.volume*100)+'%</output></div>';
      actions=button('close','back',true);break;
    case 'help':
      for(const [symbol,heading,desc] of [['target','helpAim','howAim'],['charge','helpChain','howChain'],['mirror','helpMirror','howMirror'],['shield','helpRisk','howRisk']] as const){
        content+='<div class="help-row"><i>'+icon(symbol)+'</i><div><strong>'+t(heading)+'</strong><p>'+t(desc)+'</p></div></div>';
      }
      content+='<p class="dialog-copy">'+t('keyboard')+'</p>';actions=button('close','back',true);break;
    case 'privacy':content='<p class="dialog-copy">'+t('privacyBody')+'</p>';actions=button('close','back',true);break;
    case 'exit':case 'restart':case 'change':
      content='<p class="dialog-copy">'+t('abandonText')+'</p>';actions=button('confirm',view==='restart'?'restart':view==='change'?'play':'home',true)+button('cancel','back');break;
    case 'result':{
      const won=s.status==='won';
      content='<p class="kicker">'+stageNumber(s.level.id)+' / '+t(won?'clearedLevel':'lostLevel')+'</p><div class="result-total">'+fmt(s.score)+'</div>';
      if(won&&s.score>=masteryTarget(s.level.id))content+='<div class="award">'+icon('medal')+t('earned')+'</div>';
      if(newBest&&won)content+='<p class="notice">'+t('newBest')+'</p>';
      content+=row('baseScore',fmt(s.destroyScore))+row('chainScore',fmt(s.chainScore))+row('spare',fmt(s.bonus))+row('bestChain',nodeCount(settings.language,s.bestChain));
      if(newUnlock&&won)content+='<p class="notice">'+t('nextUnlock')+'</p>';
      if(!won)content+='<p class="dialog-copy">'+t(s.hearts<=0?'broke':'out')+'</p>';
      actions=(won&&s.level.id===1?button('next','next',true):'')+button('again',won?'replay':'retry',!won||s.level.id===2)+button('stages','stages');break;
    }
  }
  el('modal-body').innerHTML='<div class="dialog-head"><h2 id="dialog-title">'+t(titles[view])+'</h2>'+(view==='settings'?'':languageButtons())+'<button class="icon" data-act="close" aria-label="'+t('close')+'">'+icon('close')+'</button></div>'+content+(actions?'<div class="actions">'+actions+'</div>':'');
}
function activeRun(){return playing&&(s.status==='ready'||s.status==='flying')&&(s.volley>0||activePointer!==null);}
function action(name:string,id=0){
  synth.unlock();if(!['fire','audio'].includes(name))synth.play('menu');
  switch(name){
    case 'start':startLevel(profile.unlocked);break;
    case 'level':
      if(activeRun()){pendingStage=id;returnView='stages';show('change');}else startLevel(id);break;
    case 'again':startLevel(s.level.id);break;
    case 'next':startLevel(2);break;
    case 'fire':
      if(s.status==='ready')launch();else if(s.status==='flying'){fast=!fast;updateHud();}else show('result');break;
    case 'home':
      if(activeRun()){returnView=dialogView;show('exit');}else home();break;
    case 'restart':
      if(activeRun()){returnView='pause';show('restart');}else startLevel(s.level.id);break;
    case 'confirm':
      if(dialogView==='exit')home();else startLevel(dialogView==='change'?pendingStage:s.level.id);break;
    case 'cancel':
      if(returnView)show(returnView);else closeDialog();break;
    case 'pause':case 'help':case 'privacy':case 'settings':case 'stages':show(name);break;
    case 'audio':
      settings.sound=!settings.sound;applySettings();synth.unlock();synth.play('menu');writeSave();localize();break;
    case 'close':closeDialog();break;
  }
}
document.addEventListener('click',event=>{
  const target=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if(!target||target.disabled)return;
  if(target.dataset.lang)changeLanguage(target.dataset.lang as Language);
  else if(target.dataset.act)action(target.dataset.act,Number(target.dataset.stage));
});
modal.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
modal.addEventListener('input',event=>{
  const input=event.target as HTMLInputElement;
  if(input.id==='volume'){
    settings.volume=Number(input.value)/100;el('volume-val').textContent=input.value+'%';synth.level(settings.volume);
  }
});
modal.addEventListener('change',event=>{
  const input=event.target as HTMLInputElement;
  if(input.id==='volume'){writeSave();synth.play('menu');return;}
  const key=input.dataset.opt;
  if(key==='sound'||key==='motion'||key==='contrast'){
    settings[key]=input.checked;applySettings();synth.unlock();synth.play('menu');writeSave();localize();
  }
});
function aimAt(event:PointerEvent){
  const box=canvas.getBoundingClientRect();
  const x=(event.clientX-box.left)*420/box.width,y=(event.clientY-box.top)*560/box.height;
  angle=Math.max(-1.32,Math.min(1.32,Math.atan2(x-210,Math.max(24,500-y))));
}
function transient(key:Key){hintKey=key;hintUntil=performance.now()+1500;notify(t(key));updateHud();}
function launch(){if(!playing||modal.open||!fire(s,angle))return;fast=false;hintKey=null;updateHud();}
canvas.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0||modal.open||activePointer!==null)return;
  if(s.status!=='ready'){if(s.status==='flying')transient('busy');return;}
  event.preventDefault();synth.unlock();synth.play('charge');activePointer=event.pointerId;
  canvas.setPointerCapture(activePointer);canvas.focus({preventScroll:true});aimAt(event);updateHud();
});
canvas.addEventListener('pointermove',event=>{if(event.pointerId===activePointer)aimAt(event);});
canvas.addEventListener('pointerup',event=>{
  if(event.pointerId!==activePointer)return;
  aimAt(event);cancelPointer();launch();
});
for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,event=>{
  if((event as PointerEvent).pointerId===activePointer){cancelPointer();transient('cancelAim');}
});
document.addEventListener('keydown',event=>{
  if(modal.open||!playing)return;
  if(event.key==='Escape'){event.preventDefault();show('pause');return;}
  if(event.target instanceof HTMLButtonElement||event.target instanceof HTMLInputElement)return;
  if(['ArrowLeft','ArrowRight'].includes(event.key)&&s.status==='ready'){
    event.preventDefault();angle=Math.max(-1.32,Math.min(1.32,angle+(event.key==='ArrowLeft'?-.045:.045)));
  }else if(event.code==='Space'||event.key==='Enter'){
    event.preventDefault();if(!event.repeat)action('fire');
  }
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&playing&&s.status==='flying'&&!modal.open)show('pause');
  frameTime=0;accum=0;
});
function resolveRun(){
  newBest=false;newUnlock=false;
  if(s.status==='won'){
    const id=s.level.id;newBest=s.score>(profile.best[id]||0);
    newUnlock=id===1&&profile.unlocked===1;
    if(!profile.completed.includes(id))profile.completed.push(id);
    profile.unlocked=2;profile.best[id]=Math.max(profile.best[id]||0,s.score);
    writeSave();localize();
  }
  resultTimer=settings.motion?.58:.12;fast=false;
}
function consume(event:GameEvent,now:number){
  renderer.addEvent(event);
  switch(event.type){
    case 'chain':
      pulseIndex=0;lastChain=event.value||1;feedback='chain';toastUntil=now+1300;
      updateToast();notify(el('callout').textContent||'');synth.play(lastChain>=5?'overload':'chain');break;
    case 'pulse':synth.play('pulse',++pulseIndex);break;
    case 'hit':synth.play(event.kind||'crystal');break;
    case 'destroy':synth.play(event.kind==='armor'?'fracture':'destroy');break;
    case 'breach':feedback='breach';toastUntil=now+800;updateToast();synth.play('breach');break;
    case 'won':case 'lost':synth.play(event.type);resolveRun();break;
    default:synth.play(event.type);
  }
}
function frame(now:number){
  const delta=frameTime?(now-frameTime)/1000:0;frameTime=now;
  if(playing&&!modal.open&&!document.hidden){
    if(delta>.027)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
    if(slowFrames>16&&!qualityLow){qualityLow=true;applySettings();}
    const dt=Math.min(.14,delta);
    if(s.status==='flying'){
      accum+=dt*(fast?3:1);
      while(accum>=DT&&s.status==='flying'){step(s);accum-=DT;for(const event of drainEvents(s))consume(event,now);}
      if(s.status!=='flying'){fast=false;accum=0;}
    }
    if(feedback&&now>toastUntil){feedback=null;updateToast();}
    if(hintKey&&now>hintUntil)hintKey=null;
    if(resultTimer>0){resultTimer-=dt;if(resultTimer<=0)show('result');}
    updateHud();renderer.draw(s,angle,activePointer!==null,now,dt);
  }
  requestAnimationFrame(frame);
}
document.querySelectorAll<HTMLElement>('[data-icon]').forEach(node=>node.innerHTML=icon(node.dataset.icon!));
new ResizeObserver(()=>renderer.resize()).observe(canvas);
applySettings();localize();if(query==='en'||query==='de')writeSave();requestAnimationFrame(frame);
