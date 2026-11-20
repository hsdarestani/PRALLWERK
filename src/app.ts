import {createState,fire,step,drainEvents,lockRemaining,chooseRune,runeMode,RUNES,DT} from './engine.ts';
import type {GameEvent,Rune} from './engine.ts';
import {CHAPTERS,ROLES,PER_CHAPTER,chapterIndex,stageMotif} from './campaign.ts';
import {LEVELS} from './levels.ts';
import {message,number,nodeCount} from './locale.ts';
import type {Key,Language} from './locale.ts';
import {SAVE_KEY,LEGACY_KEY,masteryTarget,readProfile,recordClear} from './save.ts';
import {icon} from './icons.ts';
import {makeRenderer} from './render.ts';
import {AudioBus} from './audio.ts';

const el=(id:string)=>document.getElementById(id)!;
const canvas=el('game') as HTMLCanvasElement;
const modal=el('modal') as HTMLDialogElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const query=new URL(location.href).searchParams.get('lang');
let stored:string|null=null,canSave=true;
try {
  stored=localStorage.getItem(SAVE_KEY);
  if(stored===null)stored=localStorage.getItem(LEGACY_KEY);
  else {
    try{if(JSON.parse(stored)?.version!==2)throw Error();}catch{
      localStorage.setItem(SAVE_KEY+'.backup.'+Date.now(),stored);
      stored=localStorage.getItem(LEGACY_KEY);
    }
  }
}catch{canSave=false;}
const profile=readProfile(stored,reduced.matches,query);
const synth=new AudioBus();
const renderer=makeRenderer(canvas);
const fmt=(n:number)=>number(profile.settings.language,n);
const t=(key:Key,vars:Record<string,string|number>={})=>message(profile.settings.language,key,vars);
const localized=(pair:readonly [string,string])=>pair[profile.settings.language==='en'?1:0];
const stageName=(id:number)=>id<=2?t(id===1?'s1':'s2'):localized(stageMotif(id));
const digits=(id:number)=>String(id).padStart(2,'0');
let practice=false;
let selectedChapter=chapterIndex(profile.unlocked);
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
  el('start').querySelector('span')!.textContent=t(profile.unlocked>1?'resumeCampaign':'start');
  el('progress').textContent=t('progress')+' · '+profile.completed.length+' / '+LEVELS.length;
  el('migration').hidden=!profile.legacy;
  if(profile.legacy)el('migration').textContent=t('migration',{n:profile.legacy.completed.length});
  el('chapter-picker').innerHTML=chapterPicker();
  el('stage-cards').innerHTML=cards();
  el('stage-code').textContent=(practice?t('practice')+' · ':'')+stageNumber(s.level.id)+' · '+localized(ROLES[(s.level.id-1)%6]);
  el('board-name').textContent=stageName(s.level.id);el('stage-name').textContent=stageName(s.level.id);
  el('chapter-name').textContent=localized(CHAPTERS[chapterIndex(s.level.id)].name);
  el('stage-tip').textContent=s.level.id<=2?t(s.level.id===1?'tip1':'tip2'):boardTip();
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
  const palette={core:'#ffbf75',conductor:'#99e7cb',armor:'#c2c8cd',mirror:'#bdadf5',crystal:'#8ac8e3',charge:'#ff8e79',gate:'#85deeb',rotor:'#e6bcff'};
  const art=LEVELS[id-1].tiles.map(tile=>{
    const x=5+tile.x/5.5,y=2+(tile.y-64)/7,c=palette[tile.kind];
    if(tile.kind==='mirror')return '<path d="M'+x+' '+(y+(tile.flip?0:5))+'l5 '+(tile.flip?5:-5)+'" stroke="'+c+'" stroke-width="2"/>';
    if(tile.kind==='core'||tile.kind==='crystal')return '<path d="M'+x+' '+y+'l3 3-3 3-3-3z" fill="'+c+'"/>';
    return '<rect x="'+x+'" y="'+y+'" width="5" height="5" fill="'+c+'"/>';
  }).join('');
  return '<span class="map-symbol"><svg viewBox="0 0 80 42" aria-hidden="true">'+art+'</svg></span>';
}
function chapterPicker(){
  const options=CHAPTERS.map((chapter,i)=>{
    const range=(i*PER_CHAPTER+1)+'–'+((i+1)*PER_CHAPTER);
    return '<option value="'+i+'" '+(i===selectedChapter?'selected':'')+'>'+digits(i+1)+' · '+localized(chapter.name)+' ('+range+')</option>';
  }).join('');
  return '<label class="chapter-select"><span>'+t('chooseChapter')+'</span><select data-chapters>'+options+'</select></label>';
}
function cards(){
  return LEVELS.slice(selectedChapter*PER_CHAPTER,(selectedChapter+1)*PER_CHAPTER).map(level=>{
    const id=level.id,locked=id>profile.unlocked,done=profile.completed.includes(id);
    const best=profile.best[id]||0,mastered=done&&best>=masteryTarget(id);
    const subtitle=done?t('personal')+' · '+fmt(best):t(locked?'locked':'unlocked',{n:digits(id-1)});
    return '<button class="stage-card" data-act="level" data-stage="'+id+'" '+(locked?'disabled':'')+'>'+schematic(id)+'<span><span class="stage-no">'+stageNumber(id)+' · '+localized(ROLES[(id-1)%6])+'</span><strong>'+stageName(id)+'</strong><small>'+subtitle+'</small></span><i>'+icon(locked?'lock':mastered?'medal':done?'check':'play')+'</i></button>';
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
function runeDescription(r:Rune):Key{
  const mode=runeMode(s,r);
  return mode==='normal'?({surge:'surgeDesc',bank:'bankDesc',pierce:'pierceDesc'} as const)[r]:mode;
}
function boardTip(){
  const special=s.level.special;
  return special?t(special==='circuit'?'circuitFinal':special):localized(CHAPTERS[chapterIndex(s.level.id)].tip);
}
function updateHud(){
  const core=s.tiles.find(tile=>tile.kind==='core')!;
  const left=lockRemaining(s);
  const key=[left,s.hearts,s.volley,s.score,s.status,core.hp,s.returned,fast,phase(),hintKey,s.rune,s.runePending,s.phase,s.warning].join('|');
  if(previousHud===key)return;
  previousHud=key;
  el('score').textContent=fmt(s.score);el('shots').textContent=String(s.level.maxVolleys-s.volley)+' / '+s.level.maxVolleys;
  el('shields').innerHTML=[0,1,2].map(i=>'<i class="'+(i>=s.hearts?'spent':'')+'">'+icon('shield')+'</i>').join('');
  el('shields').setAttribute('aria-label',t('shields')+' '+Math.max(0,s.hearts));
  const shield=el('lock-status');
  shield.hidden=left===0&&!s.level.boss;
  if(left&&s.level.lock)shield.textContent=t(({armor:'armorLock',conductor:'conductorLock',crystal:'crystalLock',charge:'chargeLock'} as const)[s.level.lock.kind],{n:left});
  if(s.level.boss){const state=t('bossPhase',{n:s.phase});shield.textContent=left?state+' · '+shield.textContent:state;}
  el('core').textContent=core.hp+' / '+core.maxHp;(el('core-meter') as HTMLProgressElement).value=core.hp/core.maxHp;
  el('phase').textContent=t(phase());el('orb-status').textContent=s.rune?t(s.rune):s.status==='flying'?t('balls')+' '+(5-s.returned)+'/5':t('balls')+' ×5';
  const flying=s.status==='flying',ended=s.status==='lost'||s.status==='won';
  el('fire-label').textContent=t(s.runePending?'chooseRune':ended?(s.status==='won'?'clearedLevel':'lostLevel'):flying?(fast?'normal':'fast'):'fire')+(flying?(fast?' ×1':' ×3'):'');
  el('fire-btn').querySelector('i')!.innerHTML=icon(ended?'medal':flying?'speed':'charge');
  el('control-hint').textContent=hintKey?t(hintKey):s.level.boss&&s.phase===1?t(s.level.boss):s.level.id<=2?t(s.volley===0?(s.level.id===2?'tip2':'drag'):'goal'):boardTip();
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
function startLevel(id:number,training=false){
  if(!Number.isInteger(id)||id<1||(!training&&id>profile.unlocked)||id>LEVELS.length)return;
  practice=training;selectedChapter=chapterIndex(id);
  closeDialog();cancelPointer();s=createState(LEVELS[id-1]);
  playing=true;angle=0;fast=false;resultTimer=0;accum=0;feedback=null;hintKey=null;
  renderer.reset();el('home-screen').hidden=true;el('game-screen').hidden=false;
  document.body.classList.add('game-active');localize();renderer.resize();
  canvas.focus({preventScroll:true});window.scrollTo(0,0);
  notify(stageNumber(id)+'. '+t('goal'));
}
function home(){
  closeDialog();cancelPointer();playing=false;practice=false;resultTimer=0;feedback=null;selectedChapter=chapterIndex(profile.unlocked);
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
  const titles:Record<string,Key>={runes:'chooseRune',pause:'paused',help:'guide',privacy:'privacy',settings:'settings',stages:'stages',exit:'exitAsk',restart:'restartAsk',change:'exitAsk',result:s.status==='won'?(s.level.id===LEVELS.length?(profile.completed.length===LEVELS.length?'campaignEnd':'endRun'):s.level.id%6===0?'finaleClear':s.level.id===1?'clear1':'clear2'):'defeat'};
  let content='',actions='';
  switch(view){
    case 'runes':
      content='<p class="kicker">'+t('runeTime')+'</p><div class="rune-list">'+RUNES.map((r,i)=>'<button class="rune" data-rune="'+r+'"><i aria-hidden="true">'+['ϟ','↗','⤓'][i]+'</i><span><strong>'+t(r)+'</strong><small>'+t(runeDescription(r))+'</small></span></button>').join('')+'</div>';break;
    case 'pause':
      actions=button('close','resume',true)+button('restart','restart')+button('stages','stages')+button('home','menu');break;
    case 'stages':
      content=chapterPicker()+'<div class="modal-cards">'+cards()+'</div>';break;
    case 'settings':
      content='<div class="settings-row"><span>'+t('language')+'</span>'+languageButtons()+'</div>';
      for(const [name,key] of [['sound','audio'],['motion','motion'],['contrast','contrast']] as const){
        content+='<div class="settings-row"><label for="opt-'+name+'">'+t(key)+'</label><input id="opt-'+name+'" data-opt="'+name+'" type="checkbox" '+(settings[name]?'checked':'')+'></div>';
      }
      content+='<div class="settings-row"><label for="volume">'+t('volume')+'</label><input id="volume" type="range" min="0" max="100" value="'+Math.round(settings.volume*100)+'"><output id="volume-val">'+Math.round(settings.volume*100)+'%</output></div>';
      if(profile.legacy){
        const history=profile.legacy;
        content+='<details class="archive"><summary>'+t('archive')+'</summary><p>'+t('oldReached',{n:history.unlocked})+'</p><small>'+t('oldRecord')+'</small><ol>'+Array.from(new Set([...history.completed,...Object.keys(history.best).map(Number)])).sort((a,b)=>a-b).map(i=>'<li>'+stageNumber(i)+' · '+fmt(history.best[i]||0)+(history.mastered.includes(i)?' · '+t('sealed'):'')+'</li>').join('')+'</ol></details>';
      }
      actions=button('close','back',true);break;
    case 'help':
      for(const [symbol,heading,desc] of [['target','helpAim','howAim'],['charge','helpChain','howChain'],['mirror','helpMirror','howMirror'],['shield','helpRisk','howRisk']] as const){
        content+='<div class="help-row"><i>'+icon(symbol)+'</i><div><strong>'+t(heading)+'</strong><p>'+t(desc)+'</p></div></div>';
      }
      content+='<p class="dialog-copy">'+t('keyboard')+'</p><p class="dialog-copy">'+t('shieldRule')+'</p>';actions=button('close','back',true);break;
    case 'privacy':content='<p class="dialog-copy">'+t('privacyBody')+'</p>';actions=button('close','back',true);break;
    case 'exit':case 'restart':case 'change':
      content='<p class="dialog-copy">'+t('abandonText')+'</p>';actions=button('confirm',view==='restart'?'restart':view==='change'?'play':'home',true)+button('cancel','back');break;
    case 'result':{
      const won=s.status==='won';
      content='<p class="kicker">'+stageNumber(s.level.id)+' / '+t(won?'clearedLevel':'lostLevel')+'</p><div class="result-total">'+fmt(s.score)+'</div>';
      if(!practice&&won&&s.score>=masteryTarget(s.level.id))content+='<div class="award">'+icon('medal')+t('earned')+'</div>';
      if(newBest&&won)content+='<p class="notice">'+t('newBest')+'</p>';
      content+=row('baseScore',fmt(s.destroyScore))+row('chainScore',fmt(s.chainScore))+row('spare',fmt(s.bonus))+row('bestChain',nodeCount(settings.language,s.bestChain));
      if(!practice&&won&&s.level.id%6===0){
        const chapter=chapterIndex(s.level.id),complete=LEVELS.slice(chapter*6,chapter*6+6).every(l=>profile.completed.includes(l.id));
        content+='<div class="chapter-seal">'+icon('medal')+'<strong>'+localized(CHAPTERS[chapter].name)+'</strong><small>'+t(complete?'chapterClear':'finaleClear')+'</small></div>';
        if(chapter+1<CHAPTERS.length)content+='<p class="notice">'+t('arrival',{name:localized(CHAPTERS[chapter+1].name)})+'</p>';
      }
      if(newUnlock&&won&&s.level.id%6!==0)content+='<p class="notice">'+t('nextUnlock',{n:digits(s.level.id+1)})+'</p>';
      if(!won)content+='<p class="dialog-copy">'+t(s.hearts<=0?'broke':'out')+'</p>';
      if(practice)content+='<p class="notice">'+t('practiceNote')+'</p>';
      actions=(!practice&&won&&s.level.id<LEVELS.length?button('next','next',true):'')+button('again',won?'replay':'retry',!won||s.level.id===LEVELS.length)+button('stages','stages');break;
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
    case 'again':startLevel(s.level.id,practice);break;
    case 'next':startLevel(s.level.id+1);break;
    case 'fire':
      if(s.status==='ready')launch();else if(s.status==='flying'){fast=!fast;updateHud();}else show('result');break;
    case 'home':
      if(activeRun()){returnView=dialogView;show('exit');}else home();break;
    case 'restart':
      if(activeRun()){returnView='pause';show('restart');}else startLevel(s.level.id,practice);break;
    case 'confirm':
      if(dialogView==='exit')home();else startLevel(dialogView==='change'?pendingStage:s.level.id,dialogView!=='change'&&practice);break;
    case 'cancel':
      if(returnView)show(returnView);else closeDialog();break;
    case 'pause':case 'help':case 'privacy':case 'settings':case 'stages':show(name);break;
    case 'audio':
      settings.sound=!settings.sound;applySettings();synth.unlock();synth.play('menu');writeSave();localize();break;
    case 'close':closeDialog();break;
  }
}
document.addEventListener('change',event=>{
  const select=event.target;
  if(!(select instanceof HTMLSelectElement)||!select.hasAttribute('data-chapters'))return;
  selectedChapter=Number(select.value);
  document.querySelectorAll<HTMLSelectElement>('[data-chapters]').forEach(other=>other.value=select.value);
  el('stage-cards').innerHTML=cards();
  const grid=modal.querySelector('.modal-cards');
  if(grid)grid.innerHTML=cards();
});
document.addEventListener('click',event=>{
  const target=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if(!target||target.disabled)return;
  if(target.dataset.rune){if(chooseRune(s,target.dataset.rune as Rune)){closeDialog();updateHud();}return;}
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
function launch(){if(s.runePending){show('runes');return;}if(!playing||modal.open||!fire(s,angle))return;fast=false;hintKey=null;updateHud();}
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
  if(s.status==='won'&&!practice){
    const id=s.level.id;newBest=s.score>(profile.best[id]||0);
    newUnlock=id===profile.unlocked&&id<LEVELS.length;
    recordClear(profile,id,s.score);
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
    case 'guard':synth.play('armor');break;
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
      if(s.status!=='flying'){fast=false;accum=0;if(s.runePending)show('runes');}
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
applySettings();localize();if(profile.legacy||query==='en'||query==='de')writeSave();requestAnimationFrame(frame);

const practiceId=Number(new URL(location.href).searchParams.get('practice'));
if(Number.isInteger(practiceId)&&practiceId>0&&practiceId<=LEVELS.length)startLevel(practiceId,true);
