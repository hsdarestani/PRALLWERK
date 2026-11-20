import type {Level,Tile,Kind} from './engine.ts';

type Name = readonly [string,string];
type Chapter = {name:Name; tip:Name; color:string; armor:number; mirrors:number; relays:number};
export const CHAPTERS:Chapter[]=[
  {name:['Alte Werkstatt','Old Workshop'],tip:['Ziele auf die verbundenen Leiter.','Aim for the linked conductors.'],color:'#81c7ac',armor:0,mirrors:0,relays:2},
  {name:['Spiegelhof','Mirror Court'],tip:['Prüfe den ersten Abpraller am Spiegel.','Read the first bounce off the mirror.'],color:'#b2aff1',armor:0,mirrors:2,relays:1},
  {name:['Gießerei','Foundry'],tip:['Öffne zuerst eine Lücke im Panzer.','Open a gap in the armor first.'],color:'#ffac70',armor:3,mirrors:0,relays:1},
  {name:['Relaisgarten','Relay Garden'],tip:['Suche den Leiter mit den meisten Kabeln.','Find the conductor with the most cables.'],color:'#83dbc5',armor:1,mirrors:0,relays:4},
  {name:['Glasarchiv','Glass Archive'],tip:['Nutze Splitter als Sprungbrett für die zweite Bande.','Use crystals to set up a second bank shot.'],color:'#9edcf6',armor:1,mirrors:1,relays:1},
  {name:['Schaltkai','Switchyard Quay'],tip:['Spiele seitlich ins Netz hinter der Abschirmung.','Bank into the network behind the shield.'],color:'#83bed9',armor:2,mirrors:1,relays:3},
  {name:['Prismenhalle','Prism Hall'],tip:['Achte auf die Neigung der Spiegel.','Check which way each mirror faces.'],color:'#dfabef',armor:1,mirrors:3,relays:2},
  {name:['Eisenkammer','Iron Chamber'],tip:['Konzentriere mehrere Funken auf denselben Panzer.','Focus several sparks on the same armor plate.'],color:'#da9e82',armor:4,mirrors:1,relays:1},
  {name:['Kupfernetz','Copper Grid'],tip:['Greife den Kern über zwei verschiedene Leiter an.','Attack the core through two different conductors.'],color:'#fac17d',armor:2,mirrors:1,relays:4},
  {name:['Nachtdepot','Night Depot'],tip:['Die äußere Bande führt hinter die vordere Reihe.','The outer wall opens a route behind the front row.'],color:'#b6a6ed',armor:2,mirrors:3,relays:2},
  {name:['Hochspannwerk','High Voltage Works'],tip:['Räume die untere Reihe vor ihrem Durchbruch.','Clear the bottom row before it breaches.'],color:'#a3e48a',armor:3,mirrors:2,relays:3},
  {name:['Leitwarte','Control Room'],tip:['Wechsle nach jeder Salve zwischen Kern und Leitern.','Reassess core and conductor routes after every volley.'],color:'#e6bb75',armor:3,mirrors:3,relays:4}
];
// Each motif has five rows, from the core end towards the launcher.
// + marks a conductor, # armor, / and \\ mirrors, * a crystal.
const MOTIFS:[Name,string[]][]=[
  [['Keil','Wedge'],['...K...','..*.*..','.+...+.','*..+..*','.......']],
  [['Seitenkanal','Side Channel'],['.K.....','..#..*.','..+..+.','...*..*','....+..']],
  [['Zwillingsbogen','Twin Arches'],['...K...','.*...*.','+.*.*.+','..+.+..','.......']],
  [['Treppe','Staircase'],['.....K.','....+..','..*..+.','.+..*..','*......']],
  [['Schleuse','Sluice'],['..K....','.#.*.#.','..+.+..','.*...*.','.......']],
  [['Kreuzkontakt','Cross Contact'],['...K...','...+...','.+.*.+.','...*...','..*.*..']],
  [['Weiche','Switchback'],['....K..','.+.....','..*.+..','.*...*.','.../..+']],
  [['Gegenstrom','Countercurrent'],['.K.....','..+..*.','...#..+','.*...+.','....*..']],
  [['Doppelring','Double Ring'],['...K...','.+...+.','*..*..*','.+...+.','.......']],
  [['Fallgatter','Portcullis'],['...K...','.#.*.#.','.+...+.','..*.*..','...+...']],
  [['Spalt','Fault Line'],['.....K.','.*..+..','..*..+.','.+..*..','..*....']],
  [['Außenbahn','Outer Lane'],['K......','.+..*..','*...+..','...*..+','..*....']],
  [['Brücke','Bridge'],['..K....','.+...+.','.**.**.','..+.+..','.......']],
  [['Kaskade','Cascade'],['....K..','...+...','..+..*.','.+..+..','*..*...']],
  [['Schlussstein','Keystone'],['...K...','..#.#..','.+.*.+.','*..+..*','..*.*..']]
];
export const PER_CHAPTER=MOTIFS.length;
export const CAMPAIGN_SIZE=CHAPTERS.length*PER_CHAPTER;
export const chapterIndex=(id:number)=>Math.floor((id-1)/PER_CHAPTER);
export const stageMotif=(id:number)=>MOTIFS[(id-1)%PER_CHAPTER][0];
export function buildStage(id:number):Level {
  const chapter=chapterIndex(id),slot=(id-1)%PER_CHAPTER,theme=CHAPTERS[chapter];
  const rows=MOTIFS[slot][1],tiles:Tile[]=[];
  // A reproducible shuffle distributes chapter-specific machinery into free sockets.
  let seed=(id*2654435761)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const sockets:{col:number;row:number}[]=[];
  const add=(kind:Kind,col:number,row:number,flip=false)=>{
    const hp=kind==='core'?12+chapter*2+Math.floor(slot/3):kind==='mirror'?1:kind==='armor'?2:kind==='conductor'?2:1+(col+row+id)%Math.min(3,2+Math.floor(chapter/5));
    tiles.push({id:kind==='core'?'core':'n'+col+'_'+row,kind,x:32+col*52,y:64+row*52,w:44,h:44,hp,maxHp:hp,links:[],flip,flash:0});
  };
  const kinds:Record<string,Kind>={K:'core','+':'conductor','#':'armor','*':'crystal','/':'mirror'};
  rows.forEach((row,y)=>[...row].forEach((mark,x)=>{
    const col=(chapter+slot)%2===0?x:6-x;
    if(mark!=='.')add(kinds[mark],col,y,(chapter+slot)%2===1);
    else if(y>0)sockets.push({col,row:y});
  }));
  for(let i=sockets.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[sockets[i],sockets[j]]=[sockets[j],sockets[i]];}
  for(const [kind,count] of [['mirror',theme.mirrors],['armor',theme.armor],['conductor',theme.relays],['crystal',chapter%3]] as const){
    for(let i=0;i<count;i++){const spot=sockets.pop()!;add(kind,spot.col,spot.row,random()>.5);}
  }
  const relays=tiles.filter(t=>t.kind==='conductor');
  const distance=(a:Tile,b:Tile)=>(a.x-b.x)**2+(a.y-b.y)**2;
  const near=(a:Tile,others:Tile[])=>others.reduce((best,b)=>distance(a,b)<distance(a,best)?b:best);
  const link=(a:Tile,b:Tile)=>{if(!a.links.includes(b.id))a.links.push(b.id);if(!b.links.includes(a.id))b.links.push(a.id);};
  // Two geographically local circuits. A conductor near the core feeds each one.
  relays.sort((a,b)=>a.x-b.x||a.y-b.y);
  const split=Math.ceil(relays.length/2),core=tiles.find(t=>t.kind==='core')!;
  for(const group of [relays.slice(0,split),relays.slice(split)]){
    if(!group.length)continue;
    link(near(core,group),core);
    for(let i=1;i<group.length;i++)link(group[i],near(group[i],group.slice(0,i)));
  }
  for(const tile of tiles.filter(t=>t.kind==='crystal'||t.kind==='armor')){
    const relay=near(tile,relays);
    if(distance(tile,relay)<=110**2)link(relay,tile);
  }
  const order=['conductor','crystal','armor'] as const;
  const kind=order[(slot+chapter)%order.length];
  const available=tiles.filter(t=>t.kind===kind).length;
  const count=Math.min(available,1+Math.floor(chapter/4)+(slot===14?1:0));
  const lock=(chapter>0||slot>=5)&&count>0?{kind,count}:undefined;
  return {id,lock,maxVolleys:7+Math.floor(chapter/4),orbCount:5,tiles};
}
