/* Audiolabor: Änderungen an der Verdrahtung. Schaltplan und Steckbrett benutzen dieselben Bausteine.
   Alles hier ändert nur die Geometrie des Projekts; welche Netze daraus entstehen, entscheidet weiterhin netz.js. */

import { BAUTEILE, pinOrt, pinRichtung, weltRechteck, platzVon, standardWerte } from './bauteile.js';
import { loeseNetze } from './netz.js';
import { freieKennung } from './aufbau.js?v=2';
import { baueHindernisse, findeWeg, punktKey, RASTER } from './router.js';

export const fang = v => Math.round(v / RASTER) * RASTER;

/* Doppelte Punkte und Punkte auf einer Geraden entfernen */
export function ordneDraht(punkte) {
  const a = [];
  for (const p of punkte) {
    const l = a[a.length - 1];
    if (!l || l[0] !== p[0] || l[1] !== p[1]) a.push([p[0], p[1]]);
  }
  for (let i = a.length - 2; i > 0; i--) {
    const [x0, y0] = a[i - 1], [x1, y1] = a[i], [x2, y2] = a[i + 1];
    if ((x0 === x1 && x1 === x2) || (y0 === y1 && y1 === y2)) a.splice(i, 1);
  }
  return a;
}

export function neueDrahtId(p) {
  const belegt = new Set(p.draehte.map(d => d.id));
  let n = 1;
  while (belegt.has(`D${n}`)) n++;
  return `D${n}`;
}

/* Pin aus seiner Kennung „R1.2“ */
export function pinVon(p, kennung) {
  const i = kennung.indexOf('.');
  const t = p.teile.find(x => x.id === kennung.slice(0, i));
  if (!t) return null;
  const pin = BAUTEILE[t.typ].pins.find(q => q.id === kennung.slice(i + 1));
  if (!pin) return null;
  const o = pinOrt(t, pin);
  return {teil: t, pin, x: o.x, y: o.y, richtung: pinRichtung(t, pin), kennung};
}

export function liegtAuf(x, y, a, b) {
  if (a[0] === b[0]) return x === a[0] && y >= Math.min(a[1], b[1]) && y <= Math.max(a[1], b[1]);
  if (a[1] === b[1]) return y === a[1] && x >= Math.min(a[0], b[0]) && x <= Math.max(a[0], b[0]);
  return false;
}

/* Liegt an diesem Rasterpunkt schon ein Pin oder Draht? */
export function anschlussBei(p, x, y, {ohneDraht = null, ohnePin = null} = {}) {
  for (const t of p.teile) {
    for (const pin of BAUTEILE[t.typ].pins) {
      if (ohnePin === `${t.id}.${pin.id}`) continue;
      const o = pinOrt(t, pin);
      if (o.x === x && o.y === y) return {art: 'pin', kennung: `${t.id}.${pin.id}`, richtung: pinRichtung(t, pin)};
    }
  }
  for (const d of p.draehte) {
    if (d.id === ohneDraht) continue;
    for (let i = 1; i < d.punkte.length; i++) {
      if (liegtAuf(x, y, d.punkte[i - 1], d.punkte[i])) return {art: 'draht', draht: d.id};
    }
  }
  return null;
}

/* Neuer Draht auf dem automatischen Weg. Findet sich keiner, gibt es null: Ein geschätzter Weg könnte fremde Netze kurzschließen. */
export function verbindePunkte(p, von, nach, {vonRichtung = -1, nachRichtung = -1} = {}) {
  const weg = findeWeg(baueHindernisse(p), von, nach, {startRichtung: vonRichtung, zielRichtung: nachRichtung});
  if (!weg) return null;
  const punkte = ordneDraht(weg);
  if (punkte.length < 2) return null;
  const d = {id: neueDrahtId(p), punkte};
  p.draehte.push(d);
  return d;
}

/* Bauteile entfernen. Drähte, die nur zu ihnen führten, gehen mit: Es bleiben keine losen Enden im Plan zurück.
   Was über einen ihrer Pins zusammenhing, bleibt verbunden. */
export function entferneTeile(p, ids) {
  const weg = k => ids.has(k.split('.')[0]);
  const gruppen = gruppenAusPlan(p).map(g => new Set([...g].filter(k => !weg(k))));
  const orte = new Set();
  for (const t of p.teile) {
    if (!ids.has(t.id)) continue;
    for (const pin of BAUTEILE[t.typ].pins) { const o = pinOrt(t, pin); orte.add(`${o.x},${o.y}`); }
  }
  p.teile = p.teile.filter(t => !ids.has(t.id));
  const endetAmTeil = d => {
    const a = d.punkte[0], b = d.punkte[d.punkte.length - 1];
    return orte.has(`${a[0]},${a[1]}`) || orte.has(`${b[0]},${b[1]}`);
  };
  const traegtAndere = d => {
    for (const t of p.teile) for (const pin of BAUTEILE[t.typ].pins) {
      const o = pinOrt(t, pin);
      if (innerhalb(o.x, o.y, d)) return true;
    }
    for (const e of p.draehte) {
      if (e === d) continue;
      for (const q of [e.punkte[0], e.punkte[e.punkte.length - 1]]) if (innerhalb(q[0], q[1], d)) return true;
    }
    return false;
  };
  p.draehte = p.draehte.filter(d => !endetAmTeil(d) || traegtAndere(d));
  bewahreVerbindungen(p, gruppen);
}

/* Liegt der Punkt auf dem Draht, aber nicht auf einem seiner Enden? */
function innerhalb(x, y, d) {
  const a = d.punkte[0], b = d.punkte[d.punkte.length - 1];
  if ((a[0] === x && a[1] === y) || (b[0] === x && b[1] === y)) return false;
  for (let i = 1; i < d.punkte.length; i++) if (liegtAuf(x, y, d.punkte[i - 1], d.punkte[i])) return true;
  return false;
}

/* Einschleifen: Liegen beide Pins eines Zweipols auf demselben geraden Drahtstück, wird der Draht dazwischen aufgetrennt. */
export function schleifeEin(p, t) {
  const def = BAUTEILE[t.typ];
  if (def.pins.length !== 2) return false;
  const o1 = pinOrt(t, def.pins[0]), o2 = pinOrt(t, def.pins[1]);
  for (const d of p.draehte) {
    for (let i = 1; i < d.punkte.length; i++) {
      const a = d.punkte[i - 1], b = d.punkte[i];
      if (!liegtAuf(o1.x, o1.y, a, b) || !liegtAuf(o2.x, o2.y, a, b)) continue;
      const abstand = q => Math.abs(q.x - a[0]) + Math.abs(q.y - a[1]);
      const [nah, fern] = abstand(o1) < abstand(o2) ? [o1, o2] : [o2, o1];
      const links = ordneDraht([...d.punkte.slice(0, i), [nah.x, nah.y]]);
      const rechts = ordneDraht([[fern.x, fern.y], ...d.punkte.slice(i)]);
      p.draehte = p.draehte.filter(x => x !== d);
      if (links.length >= 2) p.draehte.push({id: neueDrahtId(p), punkte: links});
      if (rechts.length >= 2) p.draehte.push({id: neueDrahtId(p), punkte: rechts});
      return true;
    }
  }
  return false;
}

/* Körper liegen nie übereinander. Sonden, Massezeichen und Netznamen sind nur Marken am Draht und zählen nicht. */
const hatKoerper = t => BAUTEILE[t.typ].pins.length > 1;

export function koerperStoesst(p, t) {
  if (!hatKoerper(t)) return false;
  const a = platzVon(t);
  return p.teile.some(o => {
    if (o === t || !hatKoerper(o)) return false;
    const b = platzVon(o);
    return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  });
}

/* Läuft dieser Draht durch den Körper des Teils? */
export function laeuftDurch(d, t) {
  if (!hatKoerper(t)) return false;
  const k = weltRechteck(t);
  for (let i = 1; i < d.punkte.length; i++) {
    const [ax, ay] = d.punkte[i - 1], [bx, by] = d.punkte[i];
    if (Math.min(ax, bx) < k.x1 && Math.max(ax, bx) > k.x0 && Math.min(ay, by) < k.y1 && Math.max(ay, by) > k.y0) return true;
  }
  return false;
}

/* Freier Platz für ein neues Bauteil, möglichst nahe an einem Wunschpunkt */
export function freierPlatz(p, typ, nahe = {x: 0, y: 0}, rot = 0) {
  const h = baueHindernisse(p);
  const pruefe = (x, y) => {
    const t = {id: '', typ, x, y, rot, spiegel: false, werte: standardWerte(typ)};
    const k = weltRechteck(t);
    for (let a = Math.floor(k.x0 / RASTER) * RASTER - RASTER; a <= k.x1 + RASTER; a += RASTER) {
      for (let b = Math.floor(k.y0 / RASTER) * RASTER - RASTER * 2; b <= k.y1 + RASTER * 2; b += RASTER) {
        if (h.punkte.has(punktKey(a, b))) return false;
      }
    }
    for (const pin of BAUTEILE[typ].pins) {
      const o = pinOrt(t, pin);
      if (h.punkte.has(punktKey(o.x, o.y)) || h.innen.has(punktKey(o.x, o.y))) return false;
    }
    return true;
  };
  const sx = fang(nahe.x), sy = fang(nahe.y);
  for (let r = 0; r < 60; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = sx + dx * RASTER * 2, y = sy + dy * RASTER * 2;
        if (pruefe(x, y)) return {x, y};
      }
    }
  }
  return {x: sx, y: sy};
}

/* Eine Sonde oder den Hörpunkt so drehen, dass das Zeichen nichts verdeckt */
export function freieDrehung(p, t) {
  const h = baueHindernisse(p, {ohneTeile: new Set([t.id])});
  const andere = p.teile.filter(o => o.id !== t.id).map(weltRechteck);
  for (const rot of [0, 90, 270, 180]) {
    const k = weltRechteck({...t, rot});
    if (andere.some(o => k.x0 < o.x1 && k.x1 > o.x0 && k.y0 < o.y1 && k.y1 > o.y0)) continue;
    let frei = true;
    for (let a = Math.ceil(k.x0 / RASTER) * RASTER; a <= k.x1 && frei; a += RASTER) {
      for (let b = Math.ceil(k.y0 / RASTER) * RASTER; b <= k.y1; b += RASTER) {
        if (h.punkte.has(punktKey(a, b)) || h.innen.has(punktKey(a, b))) { frei = false; break; }
      }
    }
    if (frei) return rot;
  }
  return 0;
}

/* Versatz für eine Kopie: so, dass keiner ihrer Pins und kein Drahtende etwas Bestehendes berührt. */
export function versatzFuerKopie(p, kopie, schritt) {
  const h = baueHindernisse(p);
  const belegt = (x, y) => h.punkte.has(punktKey(x, y)) || h.innen.has(punktKey(x, y));
  for (let v = schritt; ; v += schritt) {
    const pins = kopie.teile.flatMap(t => BAUTEILE[t.typ].pins.map(pin => pinOrt({...t, x: t.x + v, y: t.y + v}, pin)));
    const ecken = kopie.draehte.flatMap(d => d.punkte.map(q => ({x: q[0] + v, y: q[1] + v})));
    if (![...pins, ...ecken].some(o => belegt(o.x, o.y))) return v;
  }
}

/* ---------- Was ist verbunden? ---------- */

/* Aufteilung der Pins in Netze: jede Menge ein Netz */
export function gruppenAusPlan(p) {
  return [...loeseNetze(p).netze.values()].map(n => new Set(n.pins));
}

export function gleicheGruppen(a, b) {
  const norm = l => l.map(g => [...g].sort().join(',')).sort().join(' | ');
  return norm(a) === norm(b);
}

/* Liegen zwei vorher getrennte, schon verdrahtete Netze jetzt zusammen? Ein freier Pin zählt nicht: Er steckt sich gerade ein. */
export function schliesstKurz(vorher, nachher) {
  const heimat = new Map();
  vorher.forEach((g, i) => { if (g.size > 1) for (const k of g) heimat.set(k, i); });
  return nachher.some(g => new Set([...g].map(k => heimat.get(k)).filter(i => i !== undefined)).size > 1);
}

/* Was laut den Gruppen zusammengehört, aber getrennt liegt, bekommt einen Draht vom Pin zum nächsten Punkt des anderen Stücks.
   Findet sich kein Weg, verbinden zwei Netznamen. Ohne mitNamen gibt es dann false zurück, und der Aufrufer nimmt den Zug zurück. */
export function bewahreVerbindungen(p, gruppen, {mitNamen = true} = {}) {
  for (const g of gruppen) {
    for (let runde = g.size; runde > 1; runde--) {
      const stand = loeseNetze(p);
      const stuecke = new Map();
      for (const k of g) {
        const netz = stand.pinNetz.get(k);
        if (netz === undefined) continue;
        if (!stuecke.has(netz)) stuecke.set(netz, []);
        stuecke.get(netz).push(k);
      }
      if (stuecke.size < 2) break;
      const paar = naechstesPaar(p, stand, stuecke);
      const d = verbindePunkte(p, [paar.von.x, paar.von.y], paar.nach, {vonRichtung: paar.von.richtung, nachRichtung: paar.nachRichtung});
      if (d) continue;
      if (!mitNamen) return false;
      verbindeMitNamen(p, paar.von, {x: paar.nach[0], y: paar.nach[1]});
    }
  }
  return true;
}

/* Der nächste Rasterpunkt auf einem Draht dieses Netzes, der den Wunsch erfüllt. Eine Kreuzung mit einem fremden Draht scheidet aus,
   dort würde ein Drahtende beide verbinden. */
function naechsterDrahtpunkt(stand, netz, x, y, erlaubt = () => true) {
  let best = null, d0 = Infinity;
  stand.segmente.forEach((s, i) => {
    if (stand.segmentNetz[i] !== netz) return;
    const schritte = Math.abs(s.x2 - s.x1 + s.y2 - s.y1) / RASTER;
    for (let k = 0; k <= schritte; k++) {
      const qx = s.x1 + Math.sign(s.x2 - s.x1) * k * RASTER, qy = s.y1 + Math.sign(s.y2 - s.y1) * k * RASTER;
      const d = Math.abs(qx - x) + Math.abs(qy - y);
      if (d >= d0 || !erlaubt(qx, qy)) continue;
      if (stand.segmente.some((f, j) => stand.segmentNetz[j] !== netz && liegtAuf(qx, qy, [f.x1, f.y1], [f.x2, f.y2]))) continue;
      d0 = d;
      best = [qx, qy];
    }
  });
  return best;
}

function naechstesPaar(p, stand, stuecke) {
  let best = null, d0 = Infinity;
  const pruefe = (von, x, y, nachRichtung) => {
    const d = Math.abs(von.x - x) + Math.abs(von.y - y);
    if (d < d0) { d0 = d; best = {von, nach: [x, y], nachRichtung}; }
  };
  for (const [netz, pins] of stuecke) {
    for (const k of pins) {
      const von = pinVon(p, k);
      for (const [anderes, ihre] of stuecke) {
        if (anderes === netz) continue;
        for (const q of ihre) { const z = pinVon(p, q); pruefe(von, z.x, z.y, z.richtung); }
        const auf = naechsterDrahtpunkt(stand, anderes, von.x, von.y);
        if (auf) pruefe(von, auf[0], auf[1], -1);
      }
    }
  }
  return best;
}

/* Kein freier Weg: Zwei Netznamen verbinden die Pins elektrisch richtig, auch ohne sichtbaren Draht. */
function verbindeMitNamen(p, a, b) {
  const belegt = new Set(p.teile.filter(t => t.typ === 'label').map(t => t.werte.name));
  let n = 1;
  while (belegt.has(`n${n}`)) n++;
  for (const q of [a, b]) {
    p.teile.push({id: freieKennung(p, 'label'), typ: 'label', x: q.x, y: q.y, rot: 0, spiegel: false, werte: {name: `n${n}`}});
  }
}

/* ---------- Vom Steckbrett zum Schaltplan ---------- */

const istMesspin = (p, k) => BAUTEILE[pinVon(p, k).teil.typ].istMessung;

/* Pins verschiedener Netze, die aufeinanderliegen, trennt kein Draht: Das Teil mit weniger Pins macht Platz. */
function trenneAufeinanderliegende(p, gruppeVon) {
  const ort = new Map();
  for (const t of [...p.teile].sort((a, b) => BAUTEILE[b.typ].pins.length - BAUTEILE[a.typ].pins.length)) {
    const pins = BAUTEILE[t.typ].pins.map(pin => ({k: `${t.id}.${pin.id}`, o: pinOrt(t, pin)}));
    const stoert = pins.some(({k, o}) => { const n = ort.get(`${o.x},${o.y}`); return n !== undefined && n !== gruppeVon.get(k); });
    if (stoert) {
      Object.assign(t, freierPlatz(p, t.typ, {x: t.x, y: t.y}, t.rot));
      for (const {k} of pins) { const o = pinVon(p, k); ort.set(`${o.x},${o.y}`, gruppeVon.get(k)); }
    } else for (const {k, o} of pins) ort.set(`${o.x},${o.y}`, gruppeVon.get(k));
  }
}

/* Sonde und Hörpunkt brauchen keinen eigenen Draht: Sie klemmen direkt auf den nächsten Draht ihres Netzes, sonst auf einen Pin.
   Ist dort schon alles von anderen Messpunkten belegt, bleiben sie stehen und bekommen danach einen Draht. */
function klemmeMessungenAn(p, gruppen) {
  for (const g of gruppen) {
    for (const k of g) {
      if (!istMesspin(p, k)) continue;
      const stand = loeseNetze(p);
      const anderer = [...g].find(q => q !== k && !istMesspin(p, q));
      if (!anderer || stand.pinNetz.get(anderer) === stand.pinNetz.get(k)) continue;
      const v = pinVon(p, k);
      const frei = (x, y) => !p.teile.some(o => o !== v.teil && BAUTEILE[o.typ].istMessung && Math.hypot(o.x - x, o.y - y) < 60);
      const ziel = naechsterDrahtpunkt(stand, stand.pinNetz.get(anderer), v.x, v.y, frei);
      const pin = pinVon(p, anderer);
      const o = ziel ? {x: ziel[0], y: ziel[1]} : frei(pin.x, pin.y) ? pin : null;
      if (!o) {
        /* Stehen bleiben darf er nur, wenn dort kein fremder Draht durchläuft. */
        if (anschlussBei(p, v.x, v.y, {ohnePin: k})) Object.assign(v.teil, freierPlatz(p, v.teil.typ, v.teil, v.teil.rot));
        continue;
      }
      v.teil.x = o.x;
      v.teil.y = o.y;
      v.teil.rot = freieDrehung(p, v.teil);
    }
  }
}

/* gruppen: Liste von Mengen von Pin-Kennungen, je Gruppe ein gewünschtes Netz.
   Netze, die schon stimmen, bleiben unangetastet. Bei allen anderen gehen die Drähte weg und werden neu gelegt. */
export function setzeNetze(p, gruppen) {
  const stand = loeseNetze(p);
  const gruppeVon = new Map();
  gruppen.forEach((g, i) => { for (const k of g) gruppeVon.set(k, i); });

  const schmutzig = new Set();
  for (const netz of stand.netze.values()) {
    if (new Set(netz.pins.map(k => gruppeVon.get(k))).size > 1) schmutzig.add(netz.name);
  }
  for (const g of gruppen) {
    const netze = new Set([...g].map(k => stand.pinNetz.get(k)).filter(n => n !== undefined));
    if (netze.size > 1) for (const n of netze) schmutzig.add(n);
  }
  if (!schmutzig.size) return false;

  const weg = new Set();
  stand.segmente.forEach((s, i) => { if (schmutzig.has(stand.segmentNetz[i])) weg.add(s.draht); });
  p.draehte = p.draehte.filter(d => !weg.has(d.id));
  trenneAufeinanderliegende(p, gruppeVon);

  /* Erst die Bauteile verbinden, dann klemmen die Messpunkte auf das fertige Netz. Solange stehen sie keinem Draht im Weg, sonst liefe er um sie herum.
     Ein Messpunkt ohne Bauteil im Netz klemmt nachher nirgends an und bleibt deshalb ein Hindernis. */
  const nurBauteile = gruppen.map(g => new Set([...g].filter(k => !istMesspin(p, k))));
  const klemmtNachher = new Set();
  gruppen.forEach((g, i) => {
    if (nurBauteile[i].size) for (const k of g) if (!nurBauteile[i].has(k)) klemmtNachher.add(k.split('.')[0]);
  });
  const alleTeile = p.teile;
  p.teile = alleTeile.filter(t => !klemmtNachher.has(t.id));
  bewahreVerbindungen(p, nurBauteile, {mitNamen: false});
  p.teile = alleTeile;
  klemmeMessungenAn(p, gruppen);
  bewahreVerbindungen(p, gruppen);
  return true;
}
