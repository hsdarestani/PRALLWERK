// Shared keys keep the two interfaces in step. Numbers are formatted at the boundary.
const copy = {
  circuitFinal:['Direkte Treffer prallen ab. Triff den Kern über Kabel oder Bande.','Straight hits bounce off. Reach the core by cable or bank shot.'],
  bankOnly:['Der Spiegelkern wehrt gerade Schüsse ab. Spiele über Bande, Spiegel oder Kabel.','The mirror core deflects straight shots. Use a wall, mirror or cable.'],
  garden:['Die Blütenkapseln sprengen auch die übernächste Reihe.','Bloom capsules reach two rows away.'],
  invert:['Nach jeder Salve wechseln alle Ventile die Richtung.','Every valve reverses after each volley.'],
  shrapnel:['Gebrochene Panzer explodieren wie Kapseln. Räume fünf Platten.','Broken plates explode like capsules. Clear five plates.'],
  induction:['Der erste Kontakt lädt einen Leiter zur Explosion auf. Nutze die Nachbarreihe.','First contact primes a relay to explode. Use the adjacent row.'],
  practice:['Training','Practice'],practiceNote:['Trainingsrunde · keine Wertung','Practice run · unranked'],
  chooseRune:['Rune wählen','Choose a rune'],runeTime:['Für die nächsten zwei Salven','For the next two volleys'],
  surge:['Überladung','Overcharge'],bank:['Bandenschlag','Ricochet'],pierce:['Durchschlag','Piercing'],
  surgeDesc:['Kabelimpulse treffen doppelt so stark. Kapseln verursachen sechs statt vier Schaden.','Cable pulses hit twice as hard. Capsule blasts deal six damage instead of four.'],
  bankDesc:['Nach einer Reflexion an Wand, Spiegel oder Ventil verursacht der nächste Treffer doppelten Schaden.','After a wall, mirror or valve bounce, the next impact deals double damage.'],
  pierceDesc:['Jeder Funke durchdringt seine erste Panzerplatte oder seinen ersten Splitter und verursacht vier Schaden.','Each spark passes through its first plate or crystal and deals four damage.'],
  chargeLock:['Kernschild · Kapseln räumen: {n}','Core shield · Clear capsules: {n}'],
  arrival:['Nächstes Kapitel · {name}','Next chapter · {name}'],chapterClear:['Kapitel abgeschlossen','Chapter complete'],finaleClear:['Finale geschafft','Finale cleared'],
  bossPhase:['Kernphase {n}/2','Core phase {n}/2'],
  walk:['Bei halber Stärke wechselt der Ofen die Seite.','At half strength the kiln moves to the opposite side.'],
  tide:['Bei halber Stärke kehrt sich die Fließrichtung aller Ventile um.','At half strength every valve reverses flow.'],
  commute:['Bei halber Stärke werden die Leiter erneuert. Räume zwei davon.','At half strength the relays recharge. Clear two of them.'],
  clock:['Bei halber Stärke kehren die Ventile um. Zwei erneuerte Leiter schirmen den Kern ab.','At half strength the valves reverse. Two recharged relays shield the core.'],
  archive:['Archiv der alten Kampagne','Previous campaign archive'],migration:['Dein Zugang wurde übertragen. {n} frühere Abschlüsse sind im Archiv unter Optionen gespeichert.','Your access has carried over. Find {n} previous clears in the archive under Settings.'],
  oldRecord:['Level · Punkte · Meistermarke','Stage · Score · Mastery seal'],oldReached:['Erreichtes Level: {n} von 180','Stage reached: {n} of 180'],sealed:['Meistermarke','Mastery seal'],
  adventure:['Werkreise','Workshop journey'],endRun:['Leitwarte befreit!','Control room restored!'],
  chooseChapter:['Kapitel wählen','Choose chapter'],chapterNo:['Kapitel {n}','Chapter {n}'],campaignEnd:['Alle 72 Level geschafft!','All 72 stages cleared!'],
  armorLock:['Kernschild · Panzer räumen: {n}','Core shield · Clear armor: {n}'],conductorLock:['Kernschild · Leiter räumen: {n}','Core shield · Clear conductors: {n}'],crystalLock:['Kernschild · Splitter räumen: {n}','Core shield · Clear crystals: {n}'],
  shieldRule:['Ein geschützter Kern nimmt erst Schaden, wenn die angezeigten Bauteile vom Feld sind.','A shielded core takes damage once the indicated parts are off the board.'],
  title: ['PRALLWERK · Alte Werkstatt', 'PRALLWERK · Old Workshop'],
  description: ['Ein Physik-Arcadespiel. Lenke fünf Funken durch ein Netz aus Kristallen und Spiegeln.', 'A physics arcade game. Send five sparks through a network of crystals and mirrors.'],
  brand: ['PRALLWERK', 'PRALLWERK'], play: ['Spielen', 'Play'], stages: ['Levelwahl', 'Level select'], settings: ['Optionen', 'Settings'], guide: ['Spielanleitung', 'How to play'], privacy: ['Datenschutz', 'Privacy'], close: ['Schließen', 'Close'], language: ['Sprache', 'Language'], de: ['Deutsch', 'German'], en: ['Englisch', 'English'],
  chapter: ['Kapitel 01', 'Chapter 01'], chapterName: ['Alte Werkstatt', 'Old Workshop'], mode: ['Kampagne', 'Campaign'], chapterTag: ['Physik-Arcade', 'Physics arcade'], preview: ['Spielvorschau', 'Playable preview'],
  hero1: ['Alte', 'Old'], hero2: ['Werkstatt', 'Workshop'], premise: ['Ein Schuss. Eine Kettenreaktion. Bring das alte Energienetz wieder zum Leuchten.', 'One shot. A chain reaction. Bring the old power grid back to life.'],
  start: ['Spiel starten', 'Start game'], resumeCampaign: ['Weiterspielen', 'Continue'], select: ['Level wählen', 'Choose level'], progress: ['Kampagnenfortschritt', 'Campaign progress'], free: ['72 kostenlose Level', '72 free stages'], local: ['Lokal gespeichert', 'Saved on this device'], noSave: ['Speicher nicht verfügbar', 'Storage unavailable'],
  stage: ['Level {n}', 'Stage {n}'], s1: ['Erstes Leuchten', 'First Light'], s2: ['Über Bande', 'Bank Shot'], tip1: ['Triff den mittleren Leiter. Folge dem Funken bis zum Kern.', 'Hit the middle conductor. Follow the spark to the core.'], tip2: ['Nutze die Bande für einen flachen Einfallswinkel. Spiegel lenken den Schuss um.', 'Bank off a wall for a shallower approach. Mirrors turn the shot.'],
  goal: ['Zerstöre den Kern.', 'Break the core.'], objective: ['Auftrag', 'Objective'], target: ['Meisterziel', 'Mastery target'], medal: ['Meistermarke', 'Mastery seal'], earned: ['Meistermarke verdient', 'Mastery seal earned'], targetRule: ['Gewinne mit {n} Punkten.', 'Win with {n} points.'], personal: ['Persönlicher Rekord', 'Personal best'], first: ['Noch kein Rekord', 'No record yet'], locked: ['Erst Level {n} abschließen', 'Complete Stage {n} to unlock'], cleared: ['Abgeschlossen', 'Cleared'], unlocked: ['Spielbereit', 'Ready to play'],
  core: ['Kern', 'Core'], shields: ['Schilde', 'Shields'], shots: ['Salven', 'Volleys'], score: ['Punkte', 'Score'], balls: ['Funken', 'Sparks'], aim: ['Schussbereit', 'Ready'], aiming: ['Zielen', 'Aiming'], launch: ['Zündung', 'Launching'], flying: ['Im Flug', 'In flight'], resolving: ['Entladung', 'Discharging'], returning: ['Rückkehr', 'Returning'], paused: ['Pausiert', 'Paused'], ended: ['Runde beendet', 'Run complete'],
  drag: ['Zum Zielen ziehen. Zum Schießen loslassen.', 'Drag to aim. Release to fire.'], keyboard: ['Pfeiltasten zum Zielen · Leertaste zum Schießen', 'Arrow keys to aim · Space to fire'], cancelAim: ['Zielen abgebrochen', 'Aim cancelled'], busy: ['Salve unterwegs. Tempo unten umschalten.', 'Volley in flight. Use the speed control below.'],
  fire: ['Salve starten', 'Fire volley'], fast: ['Vorspulen', 'Fast-forward'], normal: ['Normales Tempo', 'Normal speed'], restart: ['Neu starten', 'Restart stage'], pause: ['Pause', 'Pause'], resume: ['Fortsetzen', 'Resume'], home: ['Startseite', 'Home'], next: ['Nächstes Level', 'Next stage'], retry: ['Erneut versuchen', 'Try again'], replay: ['Rekord jagen', 'Chase your best'], menu: ['Zum Hauptmenü', 'Main menu'],
  circuit: ['Stromkreis', 'Circuit'], chain: ['Kettenreaktion', 'Chain reaction'], nodes_one: ['{n} Knoten', '{n} node'], nodes_other: ['{n} Knoten', '{n} nodes'], overload: ['Überladung', 'Overload'], warning: ['Grenzlinie', 'Breach line'], breach: ['Schild verloren', 'Shield lost'], mirror: ['Spiegel', 'Mirror'], crystal: ['Splitter', 'Crystal'], conductor: ['Leiter', 'Conductor'], armor: ['Panzer', 'Armor'], coreTile: ['Energiekern', 'Power core'],
  clear1: ['Verbindung steht.', 'Circuit online.'], clear2: ['Das Netz leuchtet.', 'Grid restored.'], defeat: ['Netz unterbrochen.', 'Circuit broken.'], clearedLevel: ['Level geschafft', 'Stage cleared'], lostLevel: ['Versuch beendet', 'Run over'], broke: ['Die letzte Abschirmung ist gefallen.', 'Your last shield gave way.'], out: ['Alle Salven verbraucht. Probiere einen anderen Winkel.', 'Out of volleys. Try a different angle.'], nextUnlock: ['Level {n} freigeschaltet', 'Stage {n} unlocked'], newBest: ['Neuer Rekord', 'New personal best'], baseScore: ['Maschinen & Kern', 'Machines & core'], chainScore: ['Kettenbonus', 'Chain bonus'], spare: ['Schilde & übrige Salven', 'Shields & spare volleys'], bestChain: ['Längste Kette', 'Longest chain'],
  volume: ['Lautstärke', 'Volume'], audio: ['Spielklänge', 'Game audio'], mute: ['Stummschalten', 'Mute audio'], unmute: ['Ton einschalten', 'Enable audio'], motion: ['Bewegungseffekte', 'Motion effects'], contrast: ['Hoher Kontrast', 'High contrast'], soundNote: ['Originale Synthesizerklänge für Treffer und Stromimpulse.', 'Original synth sounds for impacts and electrical pulses.'],
  howAim: ['Ziele auf den Kern oder einen Leiter. Die Linie zeigt den ersten Flug und seinen Abpraller.', 'Aim at the core or a conductor. The line predicts the first flight and its ricochet.'], howChain: ['Ein Leiter schickt Energie durch seine Kabel. Je mehr Knoten verbunden sind, desto höher der Bonus.', 'A conductor sends energy along its cables. More connected nodes mean a bigger bonus.'], howRisk: ['Nach jeder Salve rücken Maschinen vor. Jeder Durchbruch kostet einen Schild. Erreicht der Kern die Linie, endet die Runde.', 'Machines advance after every volley. Each breach costs a shield. If the core reaches the line, the run ends.'], howMirror: ['Spiegel lenken entlang ihrer schrägen Fläche um. Die Zahl auf dem Panzer zeigt seine Stärke.', 'Mirrors reflect off their sloping face. The number on armor shows its strength.'],
  helpAim: ['Flugbahn lesen', 'Read the shot'], helpChain: ['Leiter verbinden', 'Connect the circuit'], helpRisk: ['Linie verteidigen', 'Defend the line'], helpMirror: ['Über Bande spielen', 'Play the angles'],
  privacyBody: ['Rekorde, freigeschaltete Level, Sprache und Einstellungen bleiben im lokalen Speicher dieses Browsers. Du kannst sie über die Website-Daten deines Browsers löschen. Cloudflare verarbeitet die für die Auslieferung erforderlichen Verbindungsdaten. Diese Vorschau verwendet keine Werbung oder Analyse-Dienste.', 'Records, unlocked stages, language and settings stay in this browser’s local storage. You can remove them in your browser’s site data settings. Cloudflare processes connection data needed to deliver the game. This preview uses no advertising or analytics.'],
  fieldLabel: ['Spielfeld. Ziehen und loslassen oder Pfeiltasten und Leertaste verwenden.', 'Playfield. Drag and release, or use the arrow keys and Space.'], restartAsk: ['Diesen Versuch neu starten?', 'Restart this run?'], exitAsk: ['Versuch verlassen?', 'Leave this run?'], abandonText: ['Der laufende Versuch endet. Deine bisherigen Rekorde bleiben gespeichert.', 'This ends the current run. Your saved records are kept.'], back: ['Zurück', 'Back'], previewLabel: ['Vorschau 0.4', 'Preview 0.4'], aimPoint: ['Zielpunkt', 'Aim point'], medalCaption: ['Gewinne für die Meistermarke.', 'Win to earn the mastery seal.'], notFound: ['Nicht gefunden', 'Not found'], method: ['Methode nicht erlaubt', 'Method not allowed']
} as const;
export type Key=keyof typeof copy;
export type Language='de'|'en';
export const keys=Object.keys(copy) as Key[];
export function languageFrom(query:unknown,saved:unknown):Language {
  for (const candidate of [query,saved]) {
    if(candidate==='en') return 'en';
    if(candidate==='de'||candidate==='de-DE') return 'de';
  }
  return 'de';
}
export function dictionary(lang:Language) {
  return Object.fromEntries(keys.map(key=>[key,copy[key][lang==='en'?1:0]])) as Record<Key,string>;
}
export function message(lang:Language,key:Key,vars:Record<string,string|number>={}) {
  const pair=copy[key];
  const pattern=pair?.[lang==='en'?1:0] || pair?.[0] || String(key);
  return pattern.replace(/\{(\w+)\}/g,(_,name)=>String(vars[name]??''));
}
export function number(lang:Language,n:number){return n.toLocaleString(lang==='de'?'de-DE':'en');}
export function nodeCount(lang:Language,n:number){return message(lang,n===1?'nodes_one':'nodes_other',{n:number(lang,n)});}
