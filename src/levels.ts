import type { Level, Tile } from './engine.ts';
const tile = (id:string, kind:Tile['kind'], col:number, row:number, hp=1, links:string[]=[], flip=false):Tile => ({id,kind,x:32+col*52,y:64+row*52,w:44,h:44,hp,maxHp:hp,links,flip,flash:0});
export const CONTENT_VERSION = 'werkstatt-0.1.0';
export const LEVELS:Level[] = [
  {id:1,title:'Erstes Leuchten',subtitle:'Erwecke das alte Energienetz.',goal:'Triff den Leiter in der Mitte. Seine Energie springt auf verbundene Maschinen über.',hint:'Die mintgrünen Kabel zeigen dir den Weg zum Kern.',maxVolleys:6,orbCount:5,
    tiles:[tile('core','core',3,0,9),tile('l1','conductor',2,2,2,['l2','s1']),tile('l2','conductor',3,2,2,['l1','l3','core']),tile('l3','conductor',4,2,2,['l2','s2']),tile('s1','crystal',1,1,2),tile('s2','crystal',5,1,2),tile('s3','crystal',1,3,1),tile('s4','crystal',5,3,1)]},
  {id:2,title:'Über Bande',subtitle:'Ein Umweg voller Energie.',goal:'Nutze die schrägen Spiegel. Knacke die Panzer und schalte den zweiten Energiekern frei.',hint:'Spiegel lenken Funken ab. Panzer brauchen zwei Treffer.',maxVolleys:8,orbCount:5,
    tiles:[tile('core','core',3,0,14),tile('a1','armor',2,1,2),tile('a2','armor',4,1,2),tile('l1','conductor',1,2,2,['l2','s1']),tile('l2','conductor',2,2,2,['l1','core']),tile('l3','conductor',4,2,2,['l4','core']),tile('l4','conductor',5,2,2,['l3','s2']),tile('s1','crystal',0,1,2),tile('s2','crystal',6,1,2),tile('m1','mirror',1,4,1,[],false),tile('m2','mirror',5,4,1,[],true),tile('s3','crystal',3,3,3)]}
];
