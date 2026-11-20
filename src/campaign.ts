import type {Level, Tile, Kind} from './engine.ts';
type Name=readonly [string,string];
type Chapter={name:Name;tip:Name;color:string};
export const CHAPTERS:Chapter[]=[
 {name:['Alte Werkstatt','Old Workshop'],tip:['Ein Treffer auf einen Leiter schickt Strom durch seine Kabel.','A conductor hit sends current through its cables.'],color:'#81c7ac'},
 {name:['Spiegelhof','Mirror Court'],tip:['Lies die gestrichelte Flugbahn. Ein Spiegel öffnet den Seitenwinkel.','Read the dotted sightline. A mirror opens a side angle.'],color:'#b2aff1'},
 {name:['Gießerei','Foundry'],tip:['Brich die markierten Panzer, um den Kern freizulegen.','Break the required plates to expose the core.'],color:'#ffac70'},
 {name:['Pulvergarten','Powder Garden'],tip:['Zünde eine rote Kapsel. Ihr Ring trifft nach kurzer Verzögerung alle Nachbarn.','Ignite a red capsule. Its ring hits nearby parts after a short fuse.'],color:'#ee9390'},
 {name:['Glasarchiv','Glass Archive'],tip:['Spiegel mit Achsstift drehen sich nach jeder Salve. Plane den zweiten Winkel.','Pivot mirrors turn after every volley. Plan for the second angle.'],color:'#9edcf6'},
 {name:['Schaltkai','Switchyard Quay'],tip:['Ventile lassen Kugeln nur in Pfeilrichtung passieren. Nutze den Rückweg.','Valves pass orbs in the arrow direction. Use the return trip.'],color:'#83bed9'},
 {name:['Prismenhalle','Prism Hall'],tip:['Spiele über die Drehspiegel zu den Leitern hinter den Ventilen.','Use pivot mirrors to reach conductors behind valves.'],color:'#dfabef'},
 {name:['Eisenkammer','Iron Chamber'],tip:['Eine Ladung sprengt benachbarte Panzer. Suche kurze Zündketten.','A charge blasts nearby armor. Look for short fuse chains.'],color:'#da9e82'},
 {name:['Kupfernetz','Copper Grid'],tip:['Räume die Leiter am Schild. Mehrere Zweige teilen sich einen Rückleiter.','Clear the shield relays. Several branches share a return wire.'],color:'#fac17d'},
 {name:['Nachtdepot','Night Depot'],tip:['Lass eine Salve durch das Ventil, um sie am Spiegel zurückzuholen.','Send a volley through a valve and catch it on the return mirror.'],color:'#b6a6ed'},
 {name:['Hochspannwerk','High Voltage Works'],tip:['Strom kann eine Kapsel zünden. Achte auf die Reichweite ihres Rings.','Current can ignite a capsule. Watch the range of its ring.'],color:'#a3e48a'},
 {name:['Leitwarte','Control Room'],tip:['Öffne zuerst das Schild. Achte vor der nächsten Salve auf die Mechanik des Kerns.','Open the shield first. Watch the core mechanism before your next volley.'],color:'#e6bb75'}
];
export const ROLES:Name[]=[['Einstieg','Introduction'],['Entdeckung','Discovery'],['Prüfung','Challenge'],['Verbund','Combination'],['Sonderprüfung','Special'],['Kapitelfinale','Chapter finale']];
// Rows run from ceiling toward launcher. Spaces separate rows. Each board is authored in full.
// Digits are not seeds: each entry explicitly selects its shield quota, volley budget and geometry.
const plan=(de:string,en:string,grid:string,shield='',budget=8)=>({name:[de,en] as Name,grid,shield,budget});
const boards=[
 plan('Zündfunke','First Spark',''),plan('Doppelkontakt','Double Contact',''),
 plan('Drahtleiter','Wire Ladder','..K.... ..+.*.. .+.*... +...*..','+1'),
 plan('Quersteg','Crossbeam','....K.. ..+.++* .*...*. .+...*.','+1'),
 plan('Seiteneingang','Service Entrance','K...... .*..+.. ..+..*. ...*... ....+..','+2'),
 plan('Der Schaltkranz','The Switch Ring','...K... .+...+. *..*..* .+...+. ...+...','+3'),
 plan('Lichtschacht','Light Shaft','.....K. ....*.. .../...'),
 plan('Linke Galerie','Left Gallery','.K..... .*..b.. .../... ....+..'),
 plan('Spiegelsaum','Mirror Hem','...K... ..*.*.. ./...b. *.....*','*2'),
 plan('Kabelknick','Cable Elbow','K..+... ./.+... ..*..b. ....+..','+1'),
 plan('Flüsterwinkel','Whisper Angle','......K ....*.* .b..... ...../.','*1',6),
 plan('Das Periskop','The Periscope','K...*.. .*./... ..b.... .+...b. .../..+','*2'),
 plan('Gussnaht','Casting Seam','...K... ...#... ..*..+.','#1'),
 plan('Nietengang','Rivet Alley','.....K. ....##. ..+.... .#.....','#2'),
 plan('Formschluss','Interlock','..K.... .#.#... ..##... ....*..','#3'),
 plan('Ambossleitung','Anvil Line','...K.+. .##.+.. .../..# .+.....','#2'),
 plan('Hohlguss','Hollow Casting','K.....# .#...#. ..b./.. ...+...','#2'),
 plan('Der Wanderofen','The Walking Kiln','.K..... ###..+. .../#.. .+...b.','#2',9),
 plan('Zündsaat','Fuse Seed','...K... ...o... ....*..'),
 plan('Kapselpaar','Capsule Pair','.....K. ....oo. ...*...','o1'),
 plan('Lunte','Slow Match','.K..... .#o.... ..o*... ...o...','o2'),
 plan('Funkenbeet','Spark Bed','...K... ..o+... .#.o+.. ....... ..+....','o2'),
 plan('Fernzündung','Remote Ignition','K...... .o#.... ..o#... ...o... ....o..','o3'),
 plan('Die Blütenuhr','The Bloom Clock','...K... ..o#o.. .o...o. .*.+.*. ...o...','o4'),
 plan('Drehpunkt','Pivot Point','...K... ...r... ....*..'),
 plan('Gegentakt','Counterbeat','..K.... .r...R. ....*.. ...+...'),
 plan('Glaspendel','Glass Pendulum','.....K. ....*R. ..r.*.. .R.....','*2'),
 plan('Lesezeichen','Bookmark','K...+.. .r.+... ..o../. ....+..','+2'),
 plan('Wechselgang','Change of Track','.K...*. ..R.... .r...R. ...*...','*2',7),
 plan('Das Astrolabium','The Astrolabe','...K... .r.*.R. .*...*. .R.+.r. ...*...','*3'),
 plan('Einlass','Intake','...K... ...^... ..*....'),
 plan('Rücklauf','Backflow','.K..... .v...+. ....^.. ...*...'),
 plan('Druckkammer','Pressure Chamber','....K.. .*.v.*. ..^.^.. ...+...','*2'),
 plan('Kaimauer','Quay Wall','K..#... .#v.... ..r.+.. ...^...','#2'),
 plan('Siphon','Siphon','......K .....v. ..^..*. .b...+. ..*....','*1',6),
 plan('Das Fluttor','The Floodgate','...K... .v.#.v. .+...+. ..^.^.. ...+...','+2',9),
 plan('Spaltlicht','Split Light','....K.. .+..r.. ..v.... ....+..','+1'),
 plan('Doppelbrechung','Double Refraction','.K...+. ..R.v.. .^..r.. ...+...','+1'),
 plan('Dreiklang','Triad','...K... .+..R.+ ..v.^.. ..+.r..','+3'),
 plan('Lichtfänger','Light Catcher','K....+. .o.r... ..v.... ...+..R','o1'),
 plan('Blindwinkel','Blind Corner','......K .v..R.+ ..r..+. ...v...','+2',7),
 plan('Das Kaleidoskop','The Kaleidoscope','...K... R.+.+.r .v...^. ..r.R.. +.....+','+3'),
 plan('Erzader','Ore Seam','...K... ..#o#.. .....+.','#2'),
 plan('Bohrkern','Drill Core','.K..... .#o#... ..o.... ....#..','#2'),
 plan('Streb','Coalface','....K.. ..##o#. .o#.o.. ...#...','#4'),
 plan('Sprengbrücke','Blast Bridge','K...+.. .#o+... ..#R... ...o.#.','#3'),
 plan('Untertage','Underground','.....K. ..#o#.. .#o.... .v..#.. ...o...','o3'),
 plan('Der Stollenbruch','The Cave-in','...K... .##o##. ..o.o.. .#...#. ...o...','#5'),
 plan('Sammelschiene','Busbar','...K... ..+.++. .+.....','+2'),
 plan('Ringleitung','Ring Main','.K...+. ..+..+. .*..+..','+2'),
 plan('Knotenlast','Node Load','.....K. ...+.+. .+..+.. ..+.*..','+4'),
 plan('Kontaktbrand','Contact Fire','..K.... .#o+.+. ..v.+.. ...+...','+3'),
 plan('Erdschluss','Ground Fault','K.....+ .#...+. ..R.+.. .+.v...','+3',7),
 plan('Der Kommutator','The Commutator','...K... r.+.+.R .+...+. ..v.^..','+2',9),
 plan('Nachtschleuse','Night Lock','.K..... .v.*... ....R.. ....+..','*1'),
 plan('Gleiswechsel','Track Change','....K.. ..r..v. .^..R.. ..+..*.','*1'),
 plan('Schattenzug','Shadow Train','K....*. .v..R.. ..^.*.. .r...*.','*3'),
 plan('Laderampe','Loading Ramp','.....K. .#o..v. ..R.+.. .^..#..','#2'),
 plan('Letzte Fähre','Last Ferry','..K.... .v...^. ....R.. .*....* ..r....','*2',6),
 plan('Der Rangierstern','The Switching Star','...K... R.*v*.r ..^.^.. .r...R. *..+..*','*3'),
 plan('Funkenpost','Spark Post','...K... .+o#... ....+..','o1'),
 plan('Übersprung','Flashover','.K..... .o.o+.. ..+.... ...o...','o2'),
 plan('Lichtbogen','Arc Flash','.....K. ..+o#o. .o+..o. ...+...','o3'),
 plan('Starkstrom','High Current','K..o... .#o.+.. ..R.v.. ...o+..','#1'),
 plan('Kettenblitz','Chain Lightning','......K ....o+. ...o#.. ..o+... .o.....','o3',7),
 plan('Der Tesla-Chor','The Tesla Choir','...K... .+o#o+. ..+.+.. .o...o. ...+...','o4'),
 plan('Schaltpult','Switchboard','..K.... .o#v... ..+..R. ....#..','#2'),
 plan('Gegenprobe','Crosscheck','.....K. ..r.+o. .#v.+.. ....^..','+2'),
 plan('Dreifachsicherung','Triple Fuse','K...... .o#.+.. ..o.R.. .v.+o..','o3'),
 plan('Hauptleitung','Main Feed','....K.. .#+o#.. ..v.R.. .+..o+.','#2'),
 plan('Schwarzstart','Black Start','.K....+ ..o..R. .#v.#.. ..+..o. ...^...','+2',7),
 plan('Das Uhrwerk','The Clockwork Heart','...K... R+#o#+r .o.v.o. .+.^.+. ..r.R..','#2',10)
];
export const PER_CHAPTER=6,CAMPAIGN_SIZE=boards.length;
export const chapterIndex=(id:number)=>Math.floor((id-1)/PER_CHAPTER);
export const stageMotif=(id:number)=>boards[id-1].name;
const kinds:Record<string,Kind>={K:'core','+':'conductor','#':'armor','*':'crystal','/':'mirror',b:'mirror',o:'charge',r:'rotor',R:'rotor','^':'gate',v:'gate'};
export function buildStage(id:number):Level {
 const {grid,shield,budget}=boards[id-1],chapter=chapterIndex(id),slot=(id-1)%6,tiles:Tile[]=[];
 grid.split(' ').forEach((row,y)=>[...row].forEach((mark,x)=>{
   if(mark==='.')return;
   const kind=kinds[mark],hp=kind==='core'?10+chapter+slot*2+(slot===5?7:0):kind==='armor'?4:kind==='conductor'?2:kind==='crystal'?2:1;
   tiles.push({id:kind==='core'?'core':x+'_'+y,kind,x:32+52*x,y:56+50*y,w:44,h:44,hp,maxHp:hp,links:[],flip:['b','R','v'].includes(mark),flash:0});
 }));
 const core=tiles.find(t=>t.kind==='core')!;
 const relays=tiles.filter(t=>t.kind==='conductor');
 const dist=(a:Tile,b:Tile)=>Math.hypot(a.x-b.x,a.y-b.y);
 // Each relay feeds its closest upstream node. Adjacent consumables are branch loads.
 const wired=[core];
 for(const relay of relays.sort((a,b)=>dist(a,core)-dist(b,core))){
   const nearest=wired.reduce((a,b)=>dist(a,relay)<=dist(b,relay)?a:b);
   relay.links.push(nearest.id);if(nearest!==core)nearest.links.push(relay.id);
   wired.push(relay);
   for(const t of tiles)if(['charge','crystal','armor'].includes(t.kind)&&dist(t,relay)<78)relay.links.push(t.id);
 }
 const boss=({18:'walk',36:'tide',54:'commute',72:'clock'} as const)[id];
 const special=({6:"circuit",12:"bankOnly",24:"garden",30:"bankOnly",42:"invert",48:"shrapnel",60:"invert",66:"induction"} as Record<number,Level["special"]>)[id];
 return {id,tiles,special,orbCount:5,maxVolleys:budget,boss,lock:shield?{kind:kinds[shield[0]] as 'armor'|'conductor'|'charge'|'crystal',count:Number(shield[1])}:undefined};
}
