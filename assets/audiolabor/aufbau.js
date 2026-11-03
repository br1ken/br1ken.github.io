/* Audiolabor: Projekte erzeugen und prüfen. Ein Projekt ist die vollständige Beschreibung einer Schaltung:
   Bauteile mit stabiler Kennung, Modell und Version, Werte mit Einheiten, Drähte und Darstellung.
   ausNetzen baut eine Schaltung aus Netznamen, ohne Zeichnung; das nutzt der Prüfstand. */

import { BAUTEILE, standardWerte, pinOrt } from './bauteile.js';

export const FORMAT = 'osci-audiolabor';
export const FORMAT_VERSION = 1;

export function leeresProjekt(titel = 'Neue Schaltung') {
  return {
    format: FORMAT, version: FORMAT_VERSION, titel,
    teile: [], draehte: [],
    analyse: {dauer: 0.5, genauigkeit: 'normal', start: 'op', acVon: 1, acBis: 100000},
    digital: {kette: []},
    monitor: {lautstaerke: 0.15, dc: false},
    steckbrett: null
  };
}

export function neuesTeil(typ, id, x = 0, y = 0, werte = {}, rot = 0, spiegel = false) {
  return {id, typ, x, y, rot, spiegel, werte: {...standardWerte(typ), ...werte}};
}

/* Nächste freie Kennung, etwa R3 */
export function freieKennung(projekt, typ) {
  const p = BAUTEILE[typ].praefix;
  let n = 1;
  const belegt = new Set(projekt.teile.map(t => t.id));
  while (belegt.has(`${p}${n}`)) n++;
  return `${p}${n}`;
}

/* Baut ein Projekt aus {typ, id, werte, netze: {pin: 'name'}}. Jeder Pin bekommt am selben Punkt ein Netzzeichen. */
export function ausNetzen(titel, liste, analyse = {}) {
  const p = leeresProjekt(titel);
  Object.assign(p.analyse, analyse);
  let x = 0;
  let lfd = 0;
  for (const e of liste) {
    const t = neuesTeil(e.typ, e.id, x, 0, e.werte || {});
    p.teile.push(t);
    for (const pin of BAUTEILE[e.typ].pins) {
      const netz = e.netze?.[pin.id];
      if (netz == null) continue;
      const o = pinOrt(t, pin);
      if (netz === '0') p.teile.push(neuesTeil('gnd', `GND${++lfd}`, o.x, o.y));
      else p.teile.push(neuesTeil('label', `N${++lfd}`, o.x, o.y, {name: netz}));
    }
    x += 400;
  }
  return p;
}

/* ---------- Speichern und Laden ---------- */

/* Datei: Werte mit Einheit und Modell mit Version, unabhängig von der Darstellung lesbar. */
export function zuDatei(projekt) {
  return {
    format: FORMAT, version: FORMAT_VERSION, titel: projekt.titel,
    teile: projekt.teile.map(t => {
      const def = BAUTEILE[t.typ];
      const werte = {};
      for (const pd of def.werte) {
        const v = t.werte[pd.key];
        werte[pd.key] = pd.typ === 'zahl' ? {wert: v, einheit: pd.einheit} : v;
      }
      const m = def.modell(t);
      return {id: t.id, typ: t.typ, modell: {name: m.name, art: m.art, version: m.version}, werte, darstellung: {x: t.x, y: t.y, rot: t.rot, spiegel: t.spiegel}};
    }),
    draehte: projekt.draehte.map(d => ({id: d.id, punkte: d.punkte})),
    analyse: projekt.analyse,
    digital: projekt.digital,
    monitor: projekt.monitor,
    steckbrett: projekt.steckbrett
  };
}

/* Datei und geteilter Link sind fremde Eingaben: Kennungen, Koordinaten und Werte landen später in Attributen der Zeichnung.
   Darum nur Kennungen aus Buchstaben und Ziffern, Zahlen als endliche Zahl, Auswahlwerte aus der Liste. */
const KENNUNG = /^[A-Za-z][A-Za-z0-9_]{0,31}$/;
const zahlOder = (v, ersatz) => typeof v === 'number' && Number.isFinite(v) ? v : ersatz;
function wertAusDatei(pd, v, ersatz) {
  if (pd.typ === 'zahl') return zahlOder(v !== null && typeof v === 'object' ? v.wert : v, ersatz);
  if (pd.typ === 'wahl') return pd.optionen.some(([w]) => w === v) ? v : ersatz;
  if (pd.typ === 'schalter') return typeof v === 'boolean' ? v : ersatz;
  return typeof v === 'string' ? v.slice(0, 64) : ersatz;
}
const punktOk = q => Array.isArray(q) && Number.isFinite(q[0]) && Number.isFinite(q[1]);

export function ausDatei(daten) {
  const meldungen = [];
  if (daten?.format !== FORMAT) throw new Error('Das ist keine Audiolabor-Datei.');
  if (daten.version > FORMAT_VERSION) throw new Error(`Die Datei hat Format ${daten.version}; diese Seite kennt bis ${FORMAT_VERSION}.`);
  if (!Array.isArray(daten.teile)) throw new Error('Die Datei enthält keine Bauteilliste.');
  const p = leeresProjekt(typeof daten.titel === 'string' ? daten.titel.slice(0, 120) : undefined);
  const kennungen = new Set();
  for (const roh of daten.teile) {
    const def = Object.hasOwn(BAUTEILE, roh?.typ) ? BAUTEILE[roh.typ] : null;
    if (!def) throw new Error(`Unbekanntes Bauteil „${String(roh?.typ).slice(0, 32)}“.`);
    if (typeof roh.id !== 'string' || !KENNUNG.test(roh.id) || kennungen.has(roh.id)) throw new Error(`Ungültige oder doppelte Kennung „${String(roh.id).slice(0, 32)}“.`);
    kennungen.add(roh.id);
    const werte = standardWerte(roh.typ);
    for (const pd of def.werte) {
      const v = roh.werte?.[pd.key];
      if (v !== undefined) werte[pd.key] = wertAusDatei(pd, v, werte[pd.key]);
    }
    const lage = roh.darstellung;
    const t = {id: roh.id, typ: roh.typ, x: zahlOder(lage?.x, 0), y: zahlOder(lage?.y, 0), rot: zahlOder(lage?.rot, 0), spiegel: !!lage?.spiegel, werte};
    const m = def.modell(t);
    if (roh.modell && (roh.modell.version !== m.version || roh.modell.name !== m.name)) {
      meldungen.push(`${roh.id}: gespeichert mit Modell „${roh.modell.name}“ (${roh.modell.version}), jetzt „${m.name}“ (${m.version}).`);
    }
    p.teile.push(t);
  }
  const draehte = Array.isArray(daten.draehte) ? daten.draehte : [];
  p.draehte = draehte.filter(d => typeof d?.id === 'string' && KENNUNG.test(d.id) && Array.isArray(d.punkte) && d.punkte.length >= 2 && d.punkte.every(punktOk))
    .map(d => ({id: d.id, punkte: d.punkte}));
  const verworfen = draehte.length - p.draehte.length;
  if (verworfen) meldungen.push(`${verworfen === 1 ? 'Ein Draht' : `${verworfen} Drähte`} ohne gültige Kennung oder Punkte ${verworfen === 1 ? 'wurde' : 'wurden'} nicht geladen.`);
  Object.assign(p.analyse, daten.analyse);
  if (daten.digital) p.digital = daten.digital;
  if (daten.monitor) p.monitor = daten.monitor;
  p.steckbrett = daten.steckbrett ?? null;
  return {projekt: p, meldungen};
}
