/* Audiolabor: das Steckbrett. Zweite Arbeitsfläche für dieselbe Schaltung, keine zweite Schaltung.

   Modell: 830 Kontakte. Hauptfeld 63 Spalten × 10 Reihen = 630, je fünf Löcher einer Spalte sind verbunden, in der Mitte getrennt.
   Vier Schienen zu je 50 Kontakten = 200, in Fünfergruppen. Dieses Modell hat durchgehende Schienen; sie führen erst Spannung,
   wenn ein Kabel sie mit einer Quelle verbindet. Darüber liegt die Buchsenleiste mit Versorgung, Quellen, Messkanälen und Hörausgang.

   Zwei Richtungen:
   - Schaltplan ändert sich: abgleichen() behält jeden Platz, der elektrisch noch stimmt, und ergänzt nur, was fehlt.
   - Auf dem Brett wird gesteckt: Die Streifen und Kabel ergeben Gruppen von Pins, setzeNetze() verdrahtet den Schaltplan danach.
   Beide Wege laufen über dieselbe Aufteilung der Pins in Netze. */

import { BAUTEILE, standardWerte } from './bauteile.js';
import { loeseNetze } from './netz.js';
import { freieKennung } from './aufbau.js?v=3';
import { setzeNetze, freierPlatz, entferneTeile, gruppenAusPlan, gleicheGruppen } from './umbau.js';
export { gruppenAusPlan, gleicheGruppen };
import { KANAL_FARBEN } from './geraete.js';
import { esc } from './hilfen.js';

export const SPALTEN = 63, REIHEN = 10, SCHIENEN = 4, SCHIENEN_KONTAKTE = 50;

/* ---------- Geometrie ---------- */
const P = 14;                       /* Lochabstand in Zeichenpunkten */
const LINKS = 40;                   /* Rand links bis Spalte 0 */
const KOPF = 92;                    /* Höhe der Buchsenleiste */
const BRETT_OBEN = KOPF + 8;
const SCHIENE_O = BRETT_OBEN + 16;  /* erste obere Schiene */
const FELD_O = SCHIENE_O + 2 * P + 26;
const GRABEN = 2 * P;
const FELD_U = FELD_O + 5 * P + GRABEN - P;
const SCHIENE_U = FELD_U + 4 * P + 26 + P;
const BRETT_UNTEN = SCHIENE_U + 2 * P + 6;
const BREITE = LINKS * 2 + (SPALTEN - 1) * P;
const HOEHE = BRETT_UNTEN + 40;

export function lochOrt(s, r) {
  return {x: LINKS + s * P, y: r < 5 ? FELD_O + r * P : FELD_U + (r - 5) * P};
}

function schienenOrt(n, i) {
  const x = LINKS + P * (1 + i + Math.floor(i / 5));
  return {x, y: n < 2 ? SCHIENE_O + n * P : SCHIENE_U + (n - 2) * P};
}

/* Streifen eines Kontakts: gleiche Kennung bedeutet elektrisch verbunden */
export function streifenVon(k) {
  if (k.art === 'loch') return `${k.r < 5 ? 'o' : 'u'}${k.s}`;
  if (k.art === 'schiene') return `s${k.n}`;
  return `b:${k.id}`;
}

const lochKey = (s, r) => `${s}:${r}`;

/* Wie weit liegen die Beine auseinander, und welches Bein kommt wohin? */
const FORMEN = {
  axial: {abstand: 4}, radial: {abstand: 2}, dreibein: {abstand: 2}, to92: {abstand: 1},
  dip8einzeln: {dip: 8}, dip8: {dip: 8}, dip14: {dip: 14}
};
const BEINFOLGE = {npn: ['C', 'B', 'E'], pnp: ['C', 'B', 'E'], nmos: ['D', 'G', 'S'], pmos: ['D', 'G', 'S'], umschalter: ['2', '1', '3']};
const OPV_NUMMER = {'-': 2, '+': 3, 'V-': 4, A: 6, 'V+': 7};

const formVon = t => FORMEN[BAUTEILE[t.typ].steck] || null;

function beinFolge(t) {
  return BEINFOLGE[t.typ] ?? BAUTEILE[t.typ].pins.map(q => q.id);
}

/* Reihen relativ zur Beinreihe. platz: Körper und Aufschrift, dort steckt kein anderes Teil. koerper: Diese Löcher sind wirklich verdeckt. */
const RAUM = {
  axial: {platz: [-1, 0], koerper: [0, 0]},
  radial: {platz: [-1, 0], koerper: [0, 0]},
  to92: {platz: [-1, 1], koerper: [-1, -1]},
  dreibein: {platz: [-2, 0], koerper: [-2, -1]}
};

function zellen([von, bis], s, r, spanne) {
  const liste = [];
  for (let c = s; c <= s + spanne; c++) for (let q = r + von; q <= r + bis; q++) liste.push(lochKey(c, q));
  return liste;
}

/* Stehen die Beine in einer Reihe, gilt der Raum für das ganze Teil. Einzeln umgesteckte Beine belegen nur ihre Löcher. */
function raumVonTeil(t, beine, art) {
  const raum = RAUM[BAUTEILE[t.typ].steck];
  if (!raum) return [];
  const orte = beinFolge(t).map(id => beine[`${t.id}.${id}`]).filter(k => k?.art === 'loch');
  if (orte.length < 2 || !orte.every(k => k.r === orte[0].r)) return [];
  const spalten = orte.map(k => k.s);
  return zellen(raum[art], Math.min(...spalten), orte[0].r, Math.max(...spalten) - Math.min(...spalten));
}

/* Pin eines DIP-Gehäuses zur Pinnummer. Fehlt die Nummer, ist der Pin nicht belegt. */
function dipPin(t, n) {
  const def = BAUTEILE[t.typ];
  if (def.steck === 'dip8einzeln') return def.pins.find(q => OPV_NUMMER[q.id] === n) ?? null;
  return def.pins.find(q => q.id === String(n)) ?? null;
}

/* Spalte und Reihe jedes Gehäusepins: Pin 1 unten links, Zählung gegen den Uhrzeigersinn */
function dipOrte(s, form) {
  const halb = form.dip / 2, orte = [];
  for (let n = 1; n <= form.dip; n++) orte.push({n, s: n <= halb ? s + n - 1 : s + form.dip - n, r: n <= halb ? 5 : 4});
  return orte;
}

/* ---------- Buchsenleiste ---------- */

/* Ein langer Name braucht links und rechts mehr Platz, sonst ragt er aus der Leiste oder in die Nachbarbuchse. */
const zugabe = b => (b.name.length > 6 ? 8 : 0);

/* Jede Buchse gehört zu einem Pin. Fehlt das Teil noch, entsteht es beim ersten Einstecken. */
export function buchsen(p) {
  const liste = [];
  const rails = [12, 5, -12];
  for (const t of p.teile) if (t.typ === 'rail' && !rails.includes(t.werte.u)) rails.push(t.werte.u);
  for (const u of rails) {
    const t = p.teile.find(x => x.typ === 'rail' && x.werte.u === u);
    liste.push({id: `rail:${u}`, name: `${u > 0 ? '+' : u < 0 ? '−' : ''}${Math.abs(u)} V`, gruppe: 'Versorgung', pin: t ? `${t.id}.1` : null, neu: {typ: 'rail', werte: {u}}, spannung: u});
  }
  const g = p.teile.find(x => x.typ === 'gnd');
  liste.push({id: 'gnd', name: 'GND', gruppe: 'Versorgung', pin: g ? `${g.id}.1` : null, neu: {typ: 'gnd'}, masse: true});

  const quellen = p.teile.filter(t => BAUTEILE[t.typ].steck === 'extern');
  for (const t of quellen) {
    for (const pin of BAUTEILE[t.typ].pins) {
      const haupt = pin === BAUTEILE[t.typ].pins[0];
      liste.push({id: `${t.id}.${pin.id}`, name: haupt ? t.id : `${t.id} −`, gruppe: 'Quellen', pin: `${t.id}.${pin.id}`});
    }
  }
  for (const [typ, name] of [['gen', 'Generator'], ['cv', 'CV'], ['gate', 'Gate']]) {
    if (!quellen.some(t => t.typ === typ)) liste.push({id: `neu:${typ}`, name, gruppe: 'Quellen', pin: null, neu: {typ}, frei: true});
  }

  const sonden = p.teile.filter(t => t.typ === 'sonde').sort((a, b) => a.id.localeCompare(b.id, 'de', {numeric: true}));
  const kanaele = Math.max(4, sonden.length);
  for (let i = 0; i < kanaele; i++) {
    const t = sonden[i];
    liste.push({id: `kanal:${i}`, name: `CH${i + 1}`, gruppe: 'Messen', pin: t ? `${t.id}.1` : null, neu: {typ: 'sonde'}, kanal: i});
  }
  const h = p.teile.find(x => x.typ === 'hoer');
  liste.push({id: 'hoer', name: 'Hören', gruppe: 'Hören', pin: h ? `${h.id}.1` : null, neu: {typ: 'hoer'}, hoeren: true});

  /* Plätze: Gruppen nebeneinander */
  let x = LINKS - 6, gruppe = null;
  for (const b of liste) {
    if (b.gruppe !== gruppe) {
      if (gruppe) x += 18;
      gruppe = b.gruppe;
    }
    b.ort = {x: x + zugabe(b) + 14, y: 62};
    x += 34 + 2 * zugabe(b);
  }
  return liste;
}

function ortVon(k, buchsenListe) {
  if (k.art === 'loch') return lochOrt(k.s, k.r);
  if (k.art === 'schiene') return schienenOrt(k.n, k.i);
  return buchsenListe.find(b => b.id === k.id)?.ort ?? {x: 0, y: 0};
}

/* ---------- Schaltplan → Brett ---------- */

/* Bringt das Brett in Übereinstimmung mit den Netzen des Schaltplans.
   Was stimmt, bleibt liegen. Der zweite Aufruf ändert nichts mehr. */
export function abgleichen(p) {
  const B = p.steckbrett ?? (p.steckbrett = {beine: {}, kabel: []});
  B.beine ??= {};
  B.kabel ??= [];
  const netze = loeseNetze(p);
  const pinNetz = netze.pinNetz;
  const liste = buchsen(p);
  const streifen = new Map();
  const belegt = new Set();
  const platz = new Set();
  const merke = (st, netz) => { streifen.set(st, netz); };

  /* Beine prüfen: Der Streifen darf nur ein Netz tragen, und jedes Teil steckt ganz oder gar nicht. */
  const teile = p.teile.filter(formVon);
  const offen = [];
  const altBeine = B.beine;
  B.beine = {};
  /* Die ICs zuerst, sie brauchen den meisten Platz */
  const reihenfolge = [...teile].sort((a, b) => (formVon(b).dip ?? 0) - (formVon(a).dip ?? 0));
  for (const t of reihenfolge) {
    const pins = BAUTEILE[t.typ].pins;
    let passt = true;
    const form = formVon(t);
    const reserve = [];
    for (const pin of pins) {
      const k = altBeine[`${t.id}.${pin.id}`];
      const st = k ? streifenVon(k) : null;
      const netz = pinNetz.get(`${t.id}.${pin.id}`);
      if (!k || (streifen.has(st) && streifen.get(st) !== netz) || (k.art === 'loch' && belegt.has(lochKey(k.s, k.r))) || reserve.some(x => x.st === st && x.netz !== netz)) { passt = false; break; }
      reserve.push({k, st, netz, pin});
    }
    if (!passt) { offen.push(t); continue; }
    for (const {k, st, netz, pin} of reserve) {
      B.beine[`${t.id}.${pin.id}`] = k;
      merke(st, netz);
      if (k.art === 'loch') belegt.add(lochKey(k.s, k.r));
    }
    if (form.dip) for (const o of dipOrte(dipBasis(t, B.beine), form)) belegt.add(lochKey(o.s, o.r));
  }

  /* Buchsen tragen das Netz ihres Pins */
  const hatBuchse = new Map();
  for (const b of liste) {
    if (!b.pin) continue;
    const netz = pinNetz.get(b.pin);
    if (netz === undefined) continue;
    merke(`b:${b.id}`, netz);
    if (!hatBuchse.has(netz)) hatBuchse.set(netz, []);
    hatBuchse.get(netz).push(b);
  }

  /* Kabel prüfen: Beide Enden müssen im selben Netz liegen. Freie Streifen übernehmen das Netz über das Kabel. */
  const gueltig = k => k.art !== 'buchse' || (liste.find(b => b.id === k.id)?.pin ?? null) !== null;
  let kabel = B.kabel.filter(c => gueltig(c.a) && gueltig(c.b));
  for (let wechsel = true; wechsel;) {
    wechsel = false;
    kabel = kabel.filter(c => {
      const a = streifenVon(c.a), b = streifenVon(c.b);
      const na = streifen.get(a), nb = streifen.get(b);
      if (na !== undefined && nb !== undefined && na !== nb) return false;
      if (na !== undefined && nb === undefined) { merke(b, na); wechsel = true; }
      if (nb !== undefined && na === undefined) { merke(a, nb); wechsel = true; }
      return true;
    });
  }
  /* Kabel, deren beide Enden kein Netz tragen, führen nirgendwohin. */
  kabel = kabel.filter(c => streifen.has(streifenVon(c.a)) && streifen.has(streifenVon(c.b)));
  for (const c of kabel) {
    if (c.a.art === 'loch') belegt.add(lochKey(c.a.s, c.a.r));
    if (c.b.art === 'loch') belegt.add(lochKey(c.b.s, c.b.r));
  }

  /* Fehlende Teile platzieren: Streifen des eigenen Netzes sparen Kabel. Körper und Aufschrift liegen nie übereinander. */
  const netzHatStreifen = n => [...streifen.entries()].some(([st, w]) => w === n && st[0] !== 'b');
  const preis = (st, netz) => {
    if (streifen.has(st)) return streifen.get(st) === netz ? 0 : Infinity;
    return netzHatStreifen(netz) ? 2 : 1;
  };
  const frei = z => !belegt.has(z) && !platz.has(z);
  for (const t of teile) {
    for (const z of raumVonTeil(t, B.beine, 'koerper')) belegt.add(z);
    for (const z of raumVonTeil(t, B.beine, 'platz')) platz.add(z);
  }
  for (const t of offen.sort((a, b) => (formVon(b).dip ?? 0) - (formVon(a).dip ?? 0))) {
    const form = formVon(t);
    if (form.dip) {
      const halb = form.dip / 2;
      let bester = null, bestPreis = Infinity;
      for (let s = 1; s + halb < SPALTEN; s++) {
        let summe = s * 0.001;
        for (const o of dipOrte(s, form)) {
          const pin = dipPin(t, o.n);
          if (!frei(lochKey(o.s, o.r))) { summe = Infinity; break; }
          const st = streifenVon({art: 'loch', s: o.s, r: o.r});
          summe += pin ? preis(st, pinNetz.get(`${t.id}.${pin.id}`)) : (streifen.has(st) ? 0.5 : 0);
          if (summe === Infinity) break;
        }
        if (summe < bestPreis) { bestPreis = summe; bester = s; }
      }
      if (bester === null) continue;
      for (const o of dipOrte(bester, form)) {
        belegt.add(lochKey(o.s, o.r));
        const pin = dipPin(t, o.n);
        if (!pin) continue;
        const k = {art: 'loch', s: o.s, r: o.r};
        B.beine[`${t.id}.${pin.id}`] = k;
        merke(streifenVon(k), pinNetz.get(`${t.id}.${pin.id}`));
      }
      continue;
    }
    const folge = beinFolge(t);
    const raum = RAUM[BAUTEILE[t.typ].steck];
    const spanne = (folge.length - 1) * form.abstand;
    let bester = null, bestPreis = Infinity;
    for (const [nr, r] of [2, 3, 1, 4, 7, 8, 6, 9, 0, 5].entries()) {
      for (let s = 1; s + spanne < SPALTEN - 1; s++) {
        if (!zellen(raum.platz, s, r, spanne).every(frei)) continue;
        let summe = s * 0.001 + nr * 0.004;
        for (let i = 0; i < folge.length; i++) {
          summe += preis(streifenVon({art: 'loch', s: s + i * form.abstand, r}), pinNetz.get(`${t.id}.${folge[i]}`));
        }
        if (summe < bestPreis) { bestPreis = summe; bester = {s, r}; }
      }
    }
    if (!bester) continue;
    folge.forEach((pinId, i) => {
      const k = {art: 'loch', s: bester.s + i * form.abstand, r: bester.r};
      B.beine[`${t.id}.${pinId}`] = k;
      merke(streifenVon(k), pinNetz.get(`${t.id}.${pinId}`));
      belegt.add(lochKey(k.s, k.r));
    });
    for (const z of zellen(raum.koerper, bester.s, bester.r, spanne)) belegt.add(z);
    for (const z of zellen(raum.platz, bester.s, bester.r, spanne)) platz.add(z);
  }

  /* Schienen für die Versorgung: GND auf die Minus-Schienen, die erste positive Spannung oben, die negative unten */
  const netzeMitStreifen = new Map();
  for (const [st, n] of streifen) {
    if (st[0] === 'b') continue;
    if (!netzeMitStreifen.has(n)) netzeMitStreifen.set(n, []);
    netzeMitStreifen.get(n).push(st);
  }
  const schieneVergeben = (n, netz) => {
    const st = `s${n}`;
    if (streifen.has(st) && streifen.get(st) !== netz) return false;
    merke(st, netz);
    if (!netzeMitStreifen.has(netz)) netzeMitStreifen.set(netz, []);
    if (!netzeMitStreifen.get(netz).includes(st)) netzeMitStreifen.get(netz).push(st);
    return true;
  };
  const versorgungen = liste.filter(b => b.pin && (b.spannung !== undefined || b.masse));
  for (const b of versorgungen) {
    const netz = pinNetz.get(b.pin);
    if (!netzeMitStreifen.has(netz)) continue;
    if (b.masse) {
      schieneVergeben(1, netz);
      if (netzeMitStreifen.get(netz).some(st => st[0] === 'u')) schieneVergeben(3, netz);
    } else if (b.spannung > 0) {
      if (!schieneVergeben(0, netz)) schieneVergeben(2, netz);
    } else schieneVergeben(2, netz);
  }

  /* Was noch getrennt ist, bekommt Kabel */
  const uf = new Map();
  const wurzel = x => {
    if (!uf.has(x)) uf.set(x, x);
    let w = x;
    while (uf.get(w) !== w) w = uf.get(w);
    uf.set(x, w);
    return w;
  };
  const vereine = (a, b) => uf.set(wurzel(a), wurzel(b));
  for (const c of kabel) vereine(streifenVon(c.a), streifenVon(c.b));

  const freiesLoch = (st, nahe) => {
    if (st[0] === 's') {
      const n = Number(st.slice(1));
      let best = 0, d0 = Infinity;
      for (let i = 0; i < SCHIENEN_KONTAKTE; i++) {
        if (belegt.has(`s${n}.${i}`)) continue;
        const d = Math.abs(schienenOrt(n, i).x - nahe);
        if (d < d0) { d0 = d; best = i; }
      }
      belegt.add(`s${n}.${best}`);
      return {art: 'schiene', n, i: best};
    }
    const s = Number(st.slice(1));
    const reihen = st[0] === 'o' ? [0, 1, 2, 3, 4] : [9, 8, 7, 6, 5];
    const r = reihen.find(q => !belegt.has(lochKey(s, q))) ?? reihen[0];
    belegt.add(lochKey(s, r));
    return {art: 'loch', s, r};
  };
  const kontaktVon = (st, nahe) => {
    if (st.startsWith('b:')) return {art: 'buchse', id: st.slice(2)};
    return freiesLoch(st, nahe);
  };
  const xVon = st => {
    if (st.startsWith('b:')) return liste.find(b => b.id === st.slice(2))?.ort.x ?? 0;
    if (st[0] === 's') return LINKS + P * 30;
    return LINKS + Number(st.slice(1)) * P;
  };
  const alleNetze = new Map();
  for (const [st, n] of streifen) {
    if (!alleNetze.has(n)) alleNetze.set(n, []);
    alleNetze.get(n).push(st);
  }
  for (const [netz, liste2] of alleNetze) {
    /* Baum über die Streifen des Netzes. Schienen sind zuerst dran, dann hängt alles an ihnen. */
    const geordnet = [...liste2].sort((a, b) => (b[0] === 's') - (a[0] === 's'));
    for (let i = 1; i < geordnet.length; i++) {
      const st = geordnet[i];
      if (geordnet.slice(0, i).some(v => wurzel(v) === wurzel(st))) continue;
      /* Nächster schon erledigter Streifen, Schienen der eigenen Hälfte bevorzugt */
      let beste = geordnet[0], d0 = Infinity;
      for (let j = 0; j < i; j++) {
        const v = geordnet[j];
        const d = v[0] === 's' ? (st[0] === 'o' ? (v === 's0' || v === 's1' ? 1 : 500) : st[0] === 'u' ? (v === 's2' || v === 's3' ? 1 : 500) : 40) : Math.abs(xVon(v) - xVon(st)) + 2;
        if (d < d0) { d0 = d; beste = v; }
      }
      const c = {id: neueKabelId(kabel), a: kontaktVon(beste, xVon(st)), b: kontaktVon(st, xVon(beste)), netz};
      kabel.push(c);
      vereine(beste, st);
    }
  }
  B.kabel = kabel;
  return {streifen, belegt, platz, buchsen: liste, netze};
}

function dipBasis(t, beine) {
  const form = formVon(t);
  for (const o of dipOrte(0, form)) {
    const pin = dipPin(t, o.n);
    const k = pin && beine[`${t.id}.${pin.id}`];
    if (k) return k.s - o.s;
  }
  return 0;
}

function neueKabelId(kabel) {
  const belegt = new Set(kabel.map(c => c.id));
  let n = 1;
  while (belegt.has(`K${n}`)) n++;
  return `K${n}`;
}

/* ---------- Brett → Schaltplan ---------- */

/* Aus Streifen und Kabeln wird die Aufteilung der Pins in Gruppen. */
export function gruppenAusBrett(p) {
  const B = p.steckbrett;
  const liste = buchsen(p);
  const uf = new Map();
  const wurzel = x => {
    if (!uf.has(x)) uf.set(x, x);
    let w = x;
    while (uf.get(w) !== w) w = uf.get(w);
    uf.set(x, w);
    return w;
  };
  for (const c of B.kabel) uf.set(wurzel(streifenVon(c.a)), wurzel(streifenVon(c.b)));

  const gruppen = new Map();
  const dazu = (st, pin) => {
    const w = wurzel(st);
    if (!gruppen.has(w)) gruppen.set(w, new Set());
    gruppen.get(w).add(pin);
  };
  for (const [pin, k] of Object.entries(B.beine)) dazu(streifenVon(k), pin);
  for (const b of liste) if (b.pin) dazu(`b:${b.id}`, b.pin);

  /* Pins ohne eigenen Platz auf dem Brett laufen mit. Massezeichen, Versorgungen und Netznamen gehen zu ihrem Namen, denn ein Partner aus
     dem alten Netz könnte gerade umgesteckt worden sein. Alles andere geht zu dem Stück des alten Netzes, das am meisten Pins hat. */
  const stand = loeseNetze(p);
  const zuGruppe = new Map();
  for (const g of gruppen.values()) for (const k of g) zuGruppe.set(k, g);
  const nameVon = k => {
    const t = p.teile.find(x => x.id === k.split('.')[0]);
    return BAUTEILE[t.typ].netzName?.(t) ?? null;
  };
  for (const t of p.teile) {
    for (const pin of BAUTEILE[t.typ].pins) {
      const k = `${t.id}.${pin.id}`;
      if (zuGruppe.has(k)) continue;
      const name = BAUTEILE[t.typ].netzName?.(t);
      const namensgleich = name ? [...zuGruppe.keys()].find(q => nameVon(q) === name) : null;
      const partner = stand.netze.get(stand.pinNetz.get(k))?.pins.filter(q => zuGruppe.has(q)) ?? [];
      const g = zuGruppe.get(namensgleich) ?? partner.map(q => zuGruppe.get(q)).sort((a, c) => c.size - a.size)[0] ?? new Set();
      if (!g.size) gruppen.set(`f:${k}`, g);
      g.add(k);
      zuGruppe.set(k, g);
    }
  }
  return [...gruppen.values()];
}

/* ---------- Farben ---------- */
const FARBRING = ['#1a1a1a', '#6b3e1e', '#c1270a', '#e0731c', '#e3c21f', '#2d7a3a', '#1f4fbf', '#7a3fa0', '#8a8a8a', '#efece2'];
const KABELFARBEN = ['#c98a1b', '#2d7a3a', '#1f4fbf', '#7a3fa0', '#b5531a', '#2f8f8f', '#8a4a70'];

function farbringe(r) {
  /* Vier Ringe: zwei Ziffern, Multiplikator, Toleranz */
  if (!(r > 0)) return [];
  let e = Math.floor(Math.log10(r));
  let m = Math.round(r / 10 ** (e - 1));
  if (m >= 100) { m = 10; e += 1; }
  const d1 = Math.floor(m / 10), d2 = m % 10, mult = e - 1;
  const multFarbe = mult >= 0 && mult <= 9 ? FARBRING[mult] : mult === -1 ? '#b8962e' : '#b9b9b9';
  return [FARBRING[d1], FARBRING[d2], multFarbe, '#b8962e'];
}

function kabelFarbe(netz, liste) {
  if (netz === '0') return '#14141c';
  const b = liste.find(x => x.spannung !== undefined && x.pin && x.netzName === netz);
  if (b) return b.spannung > 0 ? '#c1270a' : '#1a12ff';
  let h = 0;
  for (const c of String(netz)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return KABELFARBEN[h % KABELFARBEN.length];
}

/* ---------- Oberfläche ---------- */
export class Steckbrett {
  constructor(el, host, {plan, status}) {
    this.el = el;
    this.host = host;
    this.plan = plan;
    this.status = status;
    this.zug = null;
    this.werkzeug = null;
    this.kabelWahl = null;
    this.hover = null;
    this.stand = null;
    this.zeiger = new Map();
    this.griff = null;
    el.innerHTML = `<svg class="al-brett-svg" viewBox="0 0 ${BREITE} ${HOEHE}" role="application" aria-label="Steckbrett mit ${SPALTEN * REIHEN + SCHIENEN * SCHIENEN_KONTAKTE} Kontakten" tabindex="0"></svg>`;
    this.svg = el.firstElementChild;
    this.svg.addEventListener('pointerdown', e => this._runter(e));
    this.svg.addEventListener('pointermove', e => this._bewegt(e));
    this.svg.addEventListener('pointerup', e => this._hoch(e));
    this.svg.addEventListener('pointercancel', e => this._abbruch(e));
    this.svg.addEventListener('pointerleave', () => {
      if (this.hover && !this.zug) { this.hover = null; this.zeichne(); }
      this.host.hover?.(null);
    });
    el.addEventListener('wheel', e => this._rad(e), {passive: false});
    window.addEventListener('keydown', e => this._taste(e));
  }

  get projekt() { return this.host.projekt(); }

  /* ---------- Größe ---------- */
  get massstab() { return this.svg.getBoundingClientRect().width / BREITE; }

  setzeMassstab(m, cx = this.el.clientWidth / 2, cy = this.el.clientHeight / 2) {
    const h = this.el;
    const alt = this.massstab || 1;
    const wx = (h.scrollLeft + cx) / alt, wy = (h.scrollTop + cy) / alt;
    const neu = Math.min(Math.max(m, h.clientWidth / BREITE), 3);
    this.svg.style.width = `${BREITE * neu}px`;
    h.scrollLeft = wx * neu - cx;
    h.scrollTop = wy * neu - cy;
    this.host.zoomGeaendert?.(neu);
  }

  zoome(faktor) { this.setzeMassstab(this.massstab * faktor); }

  alles() { this.setzeMassstab(0); }

  /* Beim Öffnen so groß, dass die Höhe gefüllt und die ganze Buchsenleiste zu sehen ist */
  passend() {
    const liste = buchsen(this.projekt);
    const kopf = liste[liste.length - 1].ort.x + 30;
    this.setzeMassstab(Math.min(this.el.clientHeight / HOEHE, this.el.clientWidth / kopf));
    this.el.scrollLeft = 0;
    this.el.scrollTop = 0;
  }

  _rad(e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = this.el.getBoundingClientRect();
    this.setzeMassstab(this.massstab * Math.exp(-e.deltaY * 0.0022 * (e.deltaMode === 1 ? 16 : 1)), e.clientX - r.left, e.clientY - r.top);
  }

  /* Zwei Finger: schieben und zoomen. Ein laufender Zug wird dabei verworfen. */
  _beginneGriff() {
    const [a, b] = [...this.zeiger.values()];
    this.zug = null;
    const r = this.el.getBoundingClientRect();
    const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
    this.griff = {d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), m0: this.massstab,
      wx: (this.el.scrollLeft + mx) / this.massstab, wy: (this.el.scrollTop + my) / this.massstab};
    this.zeichne();
  }

  _griffBewegt() {
    const [a, b] = [...this.zeiger.values()];
    const g = this.griff;
    const r = this.el.getBoundingClientRect();
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    this.setzeMassstab(g.m0 * Math.hypot(a.x - b.x, a.y - b.y) / g.d0, mx - r.left, my - r.top);
    /* Derselbe Brettpunkt bleibt unter der Fingermitte, unabhängig von der Zahl der Ereignisse. */
    this.el.scrollLeft = g.wx * this.massstab - (mx - r.left);
    this.el.scrollTop = g.wy * this.massstab - (my - r.top);
  }

  /* Beim Ziehen an den Rand rollt das Brett mit. */
  _rollMit(e) {
    const r = this.el.getBoundingClientRect();
    const rand = 36;
    if (e.clientX < r.left + rand) this.el.scrollLeft -= 14;
    else if (e.clientX > r.right - rand) this.el.scrollLeft += 14;
    if (e.clientY < r.top + rand) this.el.scrollTop -= 14;
    else if (e.clientY > r.bottom - rand) this.el.scrollTop += 14;
  }

  /* ---------- Einstecken aus der Bauteilliste ---------- */
  setzeWerkzeug(art, typ) {
    this.werkzeug = null;
    if (art === 'einsetzen') {
      const def = BAUTEILE[typ];
      const form = FORMEN[def.steck];
      if (form) this.werkzeug = {art, typ, form, ziel: null};
      else this._ohneBrettplatz(typ);
    }
    this.zeichne();
    this.host.werkzeugGeaendert?.(this.werkzeug);
  }

  /* Quellen und Messgeräte kommen als Buchsen, nicht als Teile auf dem Brett. */
  _ohneBrettplatz(typ) {
    const def = BAUTEILE[typ];
    if (def.steck === 'extern') {
      const neu = this._neuesTeil(this.projekt, typ);
      this.host.mutiere(`${neu.id} in die Buchsenleiste gesetzt`, p => { p.teile.push(neu); });
      this.status(`${def.name} ${neu.id}: Die Buchse liegt jetzt oben in der Leiste. Zieh von dort ein Kabel.`);
    } else if (def.steck === 'keins' && typ !== 'label') {
      this.status(`${def.name}: Zieh ein Kabel von der passenden Buchse oben.`);
    } else if (def.steck === 'schiene') {
      this.status(`${def.name}: Die Buchsen oben sind schon da. Zieh ein Kabel auf die Schiene.`);
    } else {
      this.status('Netznamen gibt es nur im Schaltplan: Auf dem Brett verbindet das Kabel.');
    }
  }

  _neuesTeil(p, typ, werte = {}) {
    const stand = p.teile.filter(t => BAUTEILE[t.typ].steck !== 'keins');
    const mitte = stand.length ? {x: stand.reduce((s, t) => s + t.x, 0) / stand.length, y: stand.reduce((s, t) => s + t.y, 0) / stand.length} : {x: 0, y: 0};
    const ort = freierPlatz(p, typ, mitte);
    return {id: freieKennung(p, typ), typ, x: ort.x, y: ort.y, rot: 0, spiegel: false, werte: {...standardWerte(typ), ...werte}};
  }

  ziehVonListe(clientX, clientY) {
    if (!this.werkzeug) return false;
    const m = this._weltAus(clientX, clientY);
    this.werkzeug.ziel = this._zielFuerNeu(m);
    this.zeichne();
    return !!this.werkzeug.ziel;
  }

  loslassenVonListe(clientX, clientY) {
    if (this.ziehVonListe(clientX, clientY)) this._setzeNeu();
    else { this.werkzeug = null; this.zeichne(); this.host.werkzeugGeaendert?.(null); }
  }

  /* Wo würde das neue Teil landen? Seine Mitte folgt dem Zeiger. */
  _zielFuerNeu(m) {
    const w = this.werkzeug, k = this._kontaktBei(m, 18);
    if (!k || k.art !== 'loch') return null;
    if (w.form.dip) {
      const halb = w.form.dip / 2;
      const s = Math.min(Math.max(k.s, 0), SPALTEN - halb);
      const orte = dipOrte(s, w.form);
      if (orte.some(o => this.stand.belegt.has(lochKey(o.s, o.r)) || this.stand.platz.has(lochKey(o.s, o.r)))) return null;
      return {s};
    }
    const spanne = (BAUTEILE[w.typ].pins.length - 1) * w.form.abstand;
    const s = k.s - Math.round(spanne / 2);
    if (s < 0 || s + spanne >= SPALTEN) return null;
    if (zellen(RAUM[BAUTEILE[w.typ].steck].platz, s, k.r, spanne).some(z => this.stand.belegt.has(z) || this.stand.platz.has(z))) return null;
    return {s, r: k.r};
  }

  _setzeNeu() {
    const w = this.werkzeug, z = w.ziel;
    this.werkzeug = null;
    this.host.werkzeugGeaendert?.(null);
    let neuId = null;
    this._anwenden(`${BAUTEILE[w.typ].name} eingesteckt`, p => {
      const t = this._neuesTeil(p, w.typ);
      neuId = t.id;
      p.teile.push(t);
      if (w.form.dip) {
        for (const o of dipOrte(z.s, w.form)) {
          const pin = dipPin(t, o.n);
          if (pin) p.steckbrett.beine[`${t.id}.${pin.id}`] = {art: 'loch', s: o.s, r: o.r};
        }
      } else {
        beinFolge(t).forEach((id, i) => { p.steckbrett.beine[`${t.id}.${id}`] = {art: 'loch', s: z.s + i * w.form.abstand, r: z.r}; });
      }
    });
    this.plan.auswahl.teile = new Set([neuId]);
    this.plan.auswahl.draehte.clear();
    this.host.auswahlGeaendert?.();
    this.zeichne();
  }

  /* Eine Änderung am Brett übernehmen: Aufteilung bestimmen, Schaltplan danach verdrahten. */
  _anwenden(text, fn) {
    this.host.mutiere(text, p => {
      fn(p);
      setzeNetze(p, gruppenAusBrett(p));
    });
  }

  /* ---------- Zeichnen ---------- */
  zeichne() {
    const p = this.projekt;
    this.stand = abgleichen(p);
    const liste = this.stand.buchsen;
    for (const b of liste) if (b.pin) b.netzName = this.stand.netze.pinNetz.get(b.pin);
    const hoverNetz = this.hover ? this.stand.streifen.get(this.hover.st) ?? null : null;

    let s = this._kopfSvg(liste, hoverNetz);
    s += `<rect class="platte" x="${LINKS - 26}" y="${BRETT_OBEN}" width="${(SPALTEN - 1) * P + 52}" height="${BRETT_UNTEN - BRETT_OBEN}"/>`;
    s += `<rect class="kerbe" x="${LINKS - 26}" y="${FELD_O + 4 * P + 9}" width="${(SPALTEN - 1) * P + 52}" height="${GRABEN - 4}"/>`;

    /* Schienen: Linien und Beschriftung */
    for (let n = 0; n < SCHIENEN; n++) {
      const a = schienenOrt(n, 0), b = schienenOrt(n, SCHIENEN_KONTAKTE - 1);
      const plus = n % 2 === 0;
      const y = a.y + (n === 0 || n === 2 ? -8 : 8);
      s += `<path class="${plus ? 'schiene-plus' : 'schiene-minus'}" d="M${a.x - 8} ${y}H${b.x + 8}"/>`;
      s += `<text class="beschr" x="${a.x - 18}" y="${a.y + 3}" text-anchor="middle">${plus ? '+' : '−'}</text><text class="beschr" x="${b.x + 18}" y="${a.y + 3}" text-anchor="middle">${plus ? '+' : '−'}</text>`;
    }

    /* Streifen hervorheben: alles, was zum Netz unter dem Zeiger gehört */
    const hebeHervor = (st, klasse) => {
      if (st[0] === 'b') return '';
      if (st[0] === 's') {
        const n = Number(st.slice(1));
        const a = schienenOrt(n, 0), b = schienenOrt(n, SCHIENEN_KONTAKTE - 1);
        return `<path class="${klasse}" d="M${a.x} ${a.y}H${b.x}"/>`;
      }
      const sp = Number(st.slice(1));
      const a = lochOrt(sp, st[0] === 'o' ? 0 : 5), b = lochOrt(sp, st[0] === 'o' ? 4 : 9);
      return `<path class="${klasse}" d="M${a.x} ${a.y}V${b.y}"/>`;
    };
    if (hoverNetz !== null) for (const [st, n] of this.stand.streifen) if (n === hoverNetz) s += hebeHervor(st, 'streifen-netz');
    if (this.hover) s += hebeHervor(this.hover.st, 'streifen-hier');
    const ziel = this.zug?.ziel ?? null;
    if (ziel) s += hebeHervor(streifenVon(ziel), 'streifen-hier');

    /* Löcher */
    let loecher = '';
    for (let n = 0; n < SCHIENEN; n++) for (let i = 0; i < SCHIENEN_KONTAKTE; i++) { const o = schienenOrt(n, i); loecher += `M${o.x - 1.6} ${o.y - 1.6}h3.2v3.2h-3.2z`; }
    for (let sp = 0; sp < SPALTEN; sp++) for (let r = 0; r < REIHEN; r++) { const o = lochOrt(sp, r); loecher += `M${o.x - 1.6} ${o.y - 1.6}h3.2v3.2h-3.2z`; }
    s += `<path class="loch" d="${loecher}"/>`;
    for (let sp = 0; sp < SPALTEN; sp++) {
      if (sp === 0 || (sp + 1) % 5 === 0) {
        const o = lochOrt(sp, 0), u = lochOrt(sp, 9);
        s += `<text class="beschr" x="${o.x}" y="${o.y - 8}" text-anchor="middle">${sp + 1}</text><text class="beschr" x="${u.x}" y="${u.y + 14}" text-anchor="middle">${sp + 1}</text>`;
      }
    }
    'abcdefghij'.split('').forEach((c, r) => {
      const o = lochOrt(0, r), q = lochOrt(SPALTEN - 1, r);
      s += `<text class="beschr" x="${o.x - 13}" y="${o.y + 3}" text-anchor="middle">${c}</text><text class="beschr" x="${q.x + 13}" y="${q.y + 3}" text-anchor="middle">${c}</text>`;
    });

    s += `<text class="erklaerung" x="${LINKS - 26}" y="${BRETT_UNTEN + 16}">Je fünf Löcher einer Spalte sind verbunden, der Graben trennt oben und unten.</text>`;
    s += `<text class="erklaerung" x="${LINKS - 26}" y="${BRETT_UNTEN + 29}">Die Schienen führen erst über ein Kabel Spannung. Zeig auf ein Loch, dann siehst du, was dort verbunden ist.</text>`;

    /* Bauteile */
    for (const t of p.teile) if (formVon(t)) s += this._bauteilSvg(t);
    if (this.werkzeug?.ziel) s += this._geistSvg();

    /* Kabel über allem, wie auf einem echten Brett */
    for (const c of p.steckbrett.kabel) s += this._kabelSvg(c, liste, hoverNetz);
    if (this.zug?.art === 'kabel' || this.zug?.art === 'kabelende') {
      const a = ortVon(this.zug.fest, liste), b = ziel ? ortVon(ziel, liste) : {x: this.zug.x, y: this.zug.y};
      s += `<path class="kabel entwurf" d="${kabelBogen(a, b)}"/>`;
      if (ziel) s += `<circle class="ziel" cx="${b.x}" cy="${b.y}" r="6"/>`;
    }

    /* Griffe der Beine */
    for (const [schluessel, k] of Object.entries(p.steckbrett.beine)) {
      const t = p.teile.find(x => schluessel.startsWith(`${x.id}.`));
      if (!t || formVon(t).dip) continue;
      const o = this.zug?.art === 'bein' && this.zug.schluessel === schluessel ? (ziel ? ortVon(ziel, liste) : {x: this.zug.x, y: this.zug.y}) : ortVon(k, liste);
      s += `<circle class="griff" data-bein="${esc(schluessel)}" cx="${o.x}" cy="${o.y}" r="6"/>`;
    }
    this.svg.innerHTML = s;
  }

  _kopfSvg(liste, hoverNetz) {
    let s = '';
    const gruppen = [...new Set(liste.map(b => b.gruppe))];
    for (const g of gruppen) {
      const teil = liste.filter(b => b.gruppe === g);
      const erste = teil[0], letzte = teil[teil.length - 1];
      const x0 = erste.ort.x - 17 - zugabe(erste), x1 = letzte.ort.x + 17 + zugabe(letzte);
      s += `<rect class="leiste" x="${x0}" y="14" width="${x1 - x0}" height="${KOPF - 20}"/><text class="leiste-titel" x="${x0 + 6}" y="25">${esc(g.toUpperCase())}</text>`;
      for (const b of teil) {
        const an = b.pin && this.stand.netze.pinNetz.get(b.pin) === hoverNetz && hoverNetz !== null;
        const ring = b.kanal !== undefined ? KANAL_FARBEN[b.kanal % KANAL_FARBEN.length] : b.spannung > 0 ? '#ff5a2e' : b.spannung < 0 ? '#8d89ff' : b.hoeren ? '#ff5a2e' : '#efece2';
        s += `<g class="buchse${b.pin ? '' : ' frei'}${an ? ' an' : ''}" data-buchse="${esc(b.id)}"><circle class="buchse-ring" cx="${b.ort.x}" cy="${b.ort.y}" r="8" stroke="${ring}"/><circle class="buchse-loch" cx="${b.ort.x}" cy="${b.ort.y}" r="3.2"/><circle class="buchse-treffer" cx="${b.ort.x}" cy="${b.ort.y}" r="13"/><text class="buchse-text" x="${b.ort.x}" y="${b.ort.y - 13}" text-anchor="middle">${esc(b.name)}</text></g>`;
      }
    }
    return s;
  }

  _kabelSvg(c, liste, hoverNetz) {
    if (this.zug?.art === 'kabelende' && this.zug.kabel === c.id) return '';
    const a = ortVon(c.a, liste), b = ortVon(c.b, liste);
    const netz = this.stand.streifen.get(streifenVon(c.a));
    const farbe = kabelFarbe(netz, liste);
    const aus = this.kabelWahl === c.id;
    const leise = hoverNetz !== null && netz !== hoverNetz;
    return `<path class="kabel${aus ? ' aus' : ''}${leise ? ' leise' : ''}" stroke="${farbe}" d="${kabelBogen(a, b)}"/><path class="kabel-treffer" data-kabel="${esc(c.id)}" d="${kabelBogen(a, b)}"/>`
      + `<g class="kabel-ende" data-kabelende="${esc(c.id)}:a"><rect x="${a.x - 2.4}" y="${a.y - 2.4}" width="4.8" height="4.8" fill="${farbe}"/><circle cx="${a.x}" cy="${a.y}" r="6"/></g>`
      + `<g class="kabel-ende" data-kabelende="${esc(c.id)}:b"><rect x="${b.x - 2.4}" y="${b.y - 2.4}" width="4.8" height="4.8" fill="${farbe}"/><circle cx="${b.x}" cy="${b.y}" r="6"/></g>`;
  }

  /* Bauteile als Draufsicht: flache Flächen, aber so, wie sie im Brett stecken. */
  _bauteilSvg(t) {
    const p = this.projekt, B = p.steckbrett;
    const form = formVon(t);
    const aus = this.plan.auswahl.teile.has(t.id);
    const liste = this.stand.buchsen;
    const zugT = this.zug?.art === 'teil' && this.zug.teil === t.id ? this.zug : null;
    const verschoben = k => zugT ? {...k, s: k.s + zugT.ds, r: k.r + zugT.dr} : k;
    const ortBein = id => {
      const schluessel = `${t.id}.${id}`;
      const k = B.beine[schluessel];
      if (!k) return null;
      if (this.zug?.art === 'bein' && this.zug.schluessel === schluessel) return this.zug.ziel ? ortVon(this.zug.ziel, liste) : {x: this.zug.x, y: this.zug.y};
      return ortVon(verschoben(k), liste);
    };
    const kl = `teil${aus ? ' aus' : ''}`;
    if (form.dip) {
      const basis = dipBasis(t, B.beine) + (zugT ? zugT.ds : 0);
      const halb = form.dip / 2;
      const a = lochOrt(basis, 4), b = lochOrt(basis + halb - 1, 5);
      let s = '';
      for (const o of dipOrte(basis, form)) {
        const q = lochOrt(o.s, o.r);
        s += `<rect class="dip-bein" x="${q.x - 2}" y="${q.y - 2}" width="4" height="4"/>`;
      }
      const x0 = a.x - 7, y0 = a.y + 3, w = b.x - a.x + 14, h = b.y - a.y - 6;
      const name = t.typ === 'opv' ? 'OPV' : t.typ === 'tl072' ? 'TL072' : 'CD40106';
      s += `<g class="${kl}" data-teil="${esc(t.id)}"><rect class="bauteil-ic" x="${x0}" y="${y0}" width="${w}" height="${h}"/><path class="ic-kerbe" d="M${x0} ${y0 + h / 2 - 4}a4 4 0 0 1 0 8z"/><circle class="ic-punkt" cx="${x0 + 5}" cy="${y0 + h - 5}" r="1.3"/><text class="aufdruck" x="${x0 + w / 2}" y="${y0 + h / 2 + 3}" text-anchor="middle">${esc(t.id)} ${name}</text></g>`;
      return s;
    }
    const orte = beinFolge(t).map(ortBein);
    if (orte.some(o => !o)) return '';
    const mx = orte.reduce((a, o) => a + o.x, 0) / orte.length, my = orte.reduce((a, o) => a + o.y, 0) / orte.length;
    if (orte.length === 3 && (t.typ === 'npn' || t.typ === 'pnp' || t.typ === 'nmos' || t.typ === 'pmos')) {
      /* TO-92 von oben: Halbkreis über drei Beinen */
      const c = orte[1];
      const beine = orte.map(o => `<path class="bein" d="M${c.x} ${c.y - 2}L${o.x} ${o.y}"/>`).join('');
      const namen = beinFolge(t).map((n, i) => `<text class="bein-text" x="${orte[i].x}" y="${orte[i].y + 11}" text-anchor="middle">${n}</text>`).join('');
      return `${beine}<g class="${kl}" data-teil="${esc(t.id)}"><path class="bauteil-t" d="M${c.x - 13} ${c.y - 3}a13 13 0 0 1 26 0z"/><text class="aufdruck" x="${c.x}" y="${c.y - 6}" text-anchor="middle">${esc(t.id)}</text></g>${namen}`;
    }
    if (t.typ === 'pot') {
      const beine = orte.map(o => `<path class="bein" d="M${mx} ${my - 8}L${o.x} ${o.y}"/>`).join('');
      const w = t.werte.pos / 100 * 270 - 135;
      return `${beine}<g class="${kl}" data-teil="${esc(t.id)}"><rect class="bauteil-pot" x="${mx - 13}" y="${my - 24}" width="26" height="26"/><circle class="pot-knopf" cx="${mx}" cy="${my - 11}" r="8"/><path class="pot-marke" d="M${mx} ${my - 11}L${mx + 8 * Math.sin(w * Math.PI / 180)} ${my - 11 - 8 * Math.cos(w * Math.PI / 180)}"/><text class="marke" x="${mx}" y="${my - 27}" text-anchor="middle">${esc(t.id)}</text></g>`;
    }
    if (t.typ === 'schalter' || t.typ === 'umschalter') {
      const beine = orte.map(o => `<path class="bein" d="M${mx} ${my - 4}L${o.x} ${o.y}"/>`).join('');
      const an = t.typ === 'schalter' ? t.werte.zu : t.werte.lage === 'a';
      return `${beine}<g class="${kl}" data-teil="${esc(t.id)}"><rect class="bauteil-schalter" x="${mx - 15}" y="${my - 15}" width="30" height="12"/><rect class="schalter-nase" x="${mx + (an ? 1 : -11)}" y="${my - 13}" width="10" height="8"/><text class="marke" x="${mx}" y="${my - 18}" text-anchor="middle">${esc(t.id)}</text></g>`;
    }
    /* Zweipole axial oder stehend */
    const [a, b] = orte;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    const winkel = Math.atan2(dy, dx) * 180 / Math.PI;
    const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    const leitung = `<path class="bein" d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`;
    const lang = Math.min(Math.max(d - 12, 12), 30);
    const gruppe = inhalt => `${leitung}<g class="${kl}" data-teil="${esc(t.id)}" transform="translate(${cx} ${cy}) rotate(${winkel})">${inhalt}</g>`;
    const aufrecht = text => {
      const w = winkel > 90 || winkel < -90 ? winkel + 180 : winkel;
      return `<text class="marke" transform="translate(${cx} ${cy}) rotate(${w})" y="-10" text-anchor="middle">${esc(text)}</text>`;
    };
    switch (t.typ) {
      case 'r': {
        const ringe = farbringe(t.werte.R);
        const breite = lang / 8;
        const koerper = `<rect class="bauteil-r" x="${-lang / 2}" y="-5" width="${lang}" height="10" rx="2"/>`;
        const bander = ringe.map((f, i) => `<rect x="${-lang / 2 + breite * (1 + i * 1.5) + (i === 3 ? breite * 0.5 : 0)}" y="-5" width="${breite}" height="10" fill="${f}"/>`).join('');
        return gruppe(koerper + bander) + aufrecht(t.id);
      }
      case 'c':
        return gruppe(`<rect class="bauteil-c" x="${-Math.min(lang, 16) / 2}" y="-6" width="${Math.min(lang, 16)}" height="12" rx="2"/>`) + aufrecht(t.id);
      case 'elko':
        return gruppe(`<circle class="bauteil-elko" r="9"/><path class="elko-streifen" d="M4 -8a9 9 0 0 1 0 16z"/>`) + aufrecht(t.id);
      case 'l':
        return gruppe(`<rect class="bauteil-l" x="${-lang / 2}" y="-5" width="${lang}" height="10" rx="2"/>`) + aufrecht(t.id);
      case 'led':
        return gruppe(`<circle class="bauteil-led" r="7"/><path class="led-flach" d="M5 -5V5"/>`) + aufrecht(t.id);
      case 'd': case 'zener':
        return gruppe(`<rect class="bauteil-d" x="${-lang / 2}" y="-4" width="${lang}" height="8"/><rect class="dioden-ring" x="${lang / 2 - 5}" y="-4" width="2.5" height="8"/>`) + aufrecht(t.id);
      default:
        return gruppe(`<rect class="bauteil-c" x="-9" y="-6" width="18" height="12"/>`) + aufrecht(t.id);
    }
  }

  _geistSvg() {
    const w = this.werkzeug, z = w.ziel;
    let s = '';
    if (w.form.dip) {
      for (const o of dipOrte(z.s, w.form)) { const q = lochOrt(o.s, o.r); s += `<circle class="ziel" cx="${q.x}" cy="${q.y}" r="4"/>`; }
    } else {
      const n = BAUTEILE[w.typ].pins.length;
      for (let i = 0; i < n; i++) { const q = lochOrt(z.s + i * w.form.abstand, z.r); s += `<circle class="ziel" cx="${q.x}" cy="${q.y}" r="4"/>`; }
    }
    return s;
  }

  /* ---------- Zeiger ---------- */
  _weltAus(clientX, clientY) {
    const r = this.svg.getBoundingClientRect();
    return {x: (clientX - r.left) * BREITE / r.width, y: (clientY - r.top) * HOEHE / r.height};
  }

  /* Nächster Kontakt unter dem Zeiger. Buchsen zählen nur für Kabel. */
  _kontaktBei(m, radius = 11, {mitBuchsen = false, ausser = null} = {}) {
    let best = null, d0 = radius;
    const nimm = (k, o) => {
      const a = Math.hypot(o.x - m.x, o.y - m.y);
      if (a < d0) { d0 = a; best = k; }
    };
    for (let sp = 0; sp < SPALTEN; sp++) for (let r = 0; r < REIHEN; r++) nimm({art: 'loch', s: sp, r}, lochOrt(sp, r));
    for (let n = 0; n < SCHIENEN; n++) for (let i = 0; i < SCHIENEN_KONTAKTE; i++) nimm({art: 'schiene', n, i}, schienenOrt(n, i));
    if (mitBuchsen) for (const b of this.stand.buchsen) if (b.id !== ausser) nimm({art: 'buchse', id: b.id}, b.ort);
    return best;
  }

  /* Wohin ein Stecker wandert: Es zählt der Streifen unter dem Zeiger, darin das nächste freie Loch. */
  _steckplatzBei(m, optionen) {
    const k = this._kontaktBei(m, 12, optionen);
    if (!k || k.art === 'buchse') return k;
    const belegt = this.stand.belegt;
    let best = null, d0 = Infinity;
    const nimm = (kandidat, o) => {
      const a = Math.hypot(o.x - m.x, o.y - m.y);
      if (a < d0) { d0 = a; best = kandidat; }
    };
    if (k.art === 'schiene') {
      for (let i = 0; i < SCHIENEN_KONTAKTE; i++) if (!belegt.has(`s${k.n}.${i}`)) nimm({art: 'schiene', n: k.n, i}, schienenOrt(k.n, i));
    } else {
      for (let r = k.r < 5 ? 0 : 5, ende = r + 5; r < ende; r++) if (!belegt.has(lochKey(k.s, r))) nimm({art: 'loch', s: k.s, r}, lochOrt(k.s, r));
    }
    return best;
  }

  _runter(e) {
    if (e.button !== 0) return;
    this.svg.setPointerCapture(e.pointerId);
    this.zeiger.set(e.pointerId, {x: e.clientX, y: e.clientY});
    this.host.hover?.(null);
    if (this.zeiger.size === 2) { this._beginneGriff(); return; }
    const m = this._weltAus(e.clientX, e.clientY);
    if (this.werkzeug) {
      this.werkzeug.ziel = this._zielFuerNeu(m);
      if (this.werkzeug.ziel) this._setzeNeu();
      return;
    }
    const el = document.elementFromPoint(e.clientX, e.clientY) || e.target;
    const ende = el.closest?.('[data-kabelende]');
    if (ende) {
      const [kabel, seite] = ende.dataset.kabelende.split(':');
      const c = this.projekt.steckbrett.kabel.find(x => x.id === kabel);
      this.kabelWahl = kabel;
      this.zug = {art: 'kabelende', kabel, seite, fest: seite === 'a' ? c.b : c.a, x: m.x, y: m.y, sx: e.clientX, sy: e.clientY, ziel: null};
      return;
    }
    const bein = el.closest?.('[data-bein]');
    if (bein) {
      this.zug = {art: 'bein', schluessel: bein.dataset.bein, x: m.x, y: m.y, sx: e.clientX, sy: e.clientY, ziel: null};
      return;
    }
    const buchse = el.closest?.('[data-buchse]');
    if (buchse) {
      this.zug = {art: 'kabel', fest: {art: 'buchse', id: buchse.dataset.buchse}, x: m.x, y: m.y, sx: e.clientX, sy: e.clientY, ziel: null};
      return;
    }
    const teil = el.closest?.('[data-teil]');
    if (teil) {
      this.plan.auswahl.teile = new Set([teil.dataset.teil]);
      this.plan.auswahl.draehte.clear();
      this.kabelWahl = null;
      this.host.auswahlGeaendert?.();
      this.zug = {art: 'teil', teil: teil.dataset.teil, ds: 0, dr: 0, sm: m, sx: e.clientX, sy: e.clientY};
      this.zeichne();
      return;
    }
    const kabel = el.closest?.('[data-kabel]');
    if (kabel) {
      this.kabelWahl = kabel.dataset.kabel;
      this.plan.auswahl.teile.clear();
      this.host.auswahlGeaendert?.();
      this.zeichne();
      this.status('Kabel gewählt: Entf zieht es ab. An den Enden lässt es sich umstecken.');
      return;
    }
    /* Freier Kontakt: Kabel beginnen */
    const k = this._steckplatzBei(m);
    if (k) {
      this.zug = {art: 'kabel', fest: k, x: m.x, y: m.y, sx: e.clientX, sy: e.clientY, ziel: null};
      return;
    }
    this.kabelWahl = null;
    this.plan.auswahl.teile.clear();
    this.host.auswahlGeaendert?.();
    this.zeichne();
  }

  _bewegt(e) {
    if (this.zeiger.has(e.pointerId)) this.zeiger.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (this.griff) { if (this.zeiger.size === 2) this._griffBewegt(); return; }
    const m = this._weltAus(e.clientX, e.clientY);
    const z = this.zug;
    if (this.werkzeug) {
      const n = this._zielFuerNeu(m);
      if (JSON.stringify(n) !== JSON.stringify(this.werkzeug.ziel)) { this.werkzeug.ziel = n; this.zeichne(); }
      return;
    }
    if (!z) {
      /* Zeigt an, was hier verbunden ist */
      const aufKabel = e.target.closest?.('[data-kabel]')?.dataset.kabel;
      const c = aufKabel && this.projekt.steckbrett.kabel.find(x => x.id === aufKabel);
      const k = c ? c.a : this._kontaktBei(m, 8, {mitBuchsen: true});
      const st = k ? streifenVon(k) : null;
      if (st !== (this.hover?.st ?? null)) {
        this.hover = st ? {st} : null;
        this.zeichne();
        this._zeigeStreifen(k);
      }
      this.host.hover?.(st ? this.stand.streifen.get(st) ?? null : null, e);
      return;
    }
    this._rollMit(e);
    z.x = m.x;
    z.y = m.y;
    switch (z.art) {
      case 'kabel': case 'kabelende':
        z.ziel = this._steckplatzBei(m, {mitBuchsen: true});
        if (z.ziel && streifenVon(z.ziel) === streifenVon(z.fest)) z.ziel = null;
        break;
      case 'bein':
        z.ziel = this._steckplatzBei(m);
        break;
      case 'teil': {
        const t = this.projekt.teile.find(x => x.id === z.teil);
        const k = this._kontaktBei(m, 14), start = this._kontaktBei(z.sm, 14);
        if (k?.art !== 'loch' || start?.art !== 'loch') break;
        z.ds = k.s - start.s;
        z.dr = formVon(t).dip ? 0 : k.r - start.r;
        break;
      }
    }
    this.zeichne();
  }

  _zeigeStreifen(k) {
    if (!k) return;
    const st = streifenVon(k);
    const netz = this.stand.streifen.get(st);
    const ort = k.art === 'loch' ? `Spalte ${k.s + 1}, ${k.r < 5 ? 'a bis e' : 'f bis j'}` : k.art === 'schiene' ? `Schiene ${k.n < 2 ? 'oben' : 'unten'} ${k.n % 2 ? '−' : '+'}` : `Buchse ${this.stand.buchsen.find(b => b.id === k.id)?.name ?? ''}`;
    this.status(netz === undefined ? `${ort}: frei.` : `${ort}: Netz ${netz === '0' ? 'Masse' : netz}. Alle markierten Kontakte sind verbunden.`);
  }

  _hoch(e) {
    this.zeiger.delete(e.pointerId);
    if (this.griff) { if (!this.zeiger.size) this.griff = null; return; }
    const z = this.zug;
    this.zug = null;
    if (!z) return;
    const bewegt = Math.hypot(e.clientX - z.sx, e.clientY - z.sy) >= 4;
    switch (z.art) {
      case 'bein': {
        if (!bewegt || !z.ziel) { this.zeichne(); return; }
        this._anwenden(`${z.schluessel.replace('.', ' Pin ')} umgesteckt`, p => { p.steckbrett.beine[z.schluessel] = z.ziel; });
        return;
      }
      case 'teil': {
        if (!z.ds && !z.dr) { this.zeichne(); return; }
        this._verschiebeTeil(z);
        return;
      }
      case 'kabel': {
        if (bewegt && !z.ziel) this.status('Nicht eingesteckt: Lass das Kabel über einem Loch oder einer Buchse los.');
        if (!bewegt || !z.ziel) { this.zeichne(); return; }
        this._steckeKabel(z.fest, z.ziel);
        return;
      }
      case 'kabelende': {
        if (!bewegt) { this.zeichne(); return; }
        if (!z.ziel) {
          this._anwenden('Kabel abgezogen', p => { p.steckbrett.kabel = p.steckbrett.kabel.filter(c => c.id !== z.kabel); this._lockereBuchsen(p); });
          this.kabelWahl = null;
          return;
        }
        this._anwenden('Kabel umgesteckt', p => {
          const c = p.steckbrett.kabel.find(x => x.id === z.kabel);
          const ziel = this._buchseVerwirklichen(p, z.ziel);
          c[z.seite] = ziel;
        });
      }
    }
  }

  _abbruch(e) {
    this.zeiger.delete(e.pointerId);
    this.griff = null;
    this.zug = null;
    this.zeichne();
  }

  /* Löschen: das gewählte Kabel oder das gewählte Teil */
  loesche() {
    if (this.kabelWahl) {
      const id = this.kabelWahl;
      this.kabelWahl = null;
      this._anwenden('Kabel abgezogen', p => { p.steckbrett.kabel = p.steckbrett.kabel.filter(c => c.id !== id); this._lockereBuchsen(p); });
    } else if (this.plan.auswahl.teile.size) {
      const ids = new Set(this.plan.auswahl.teile);
      this.plan.auswahl.teile.clear();
      this._anwenden(`${[...ids].join(', ')} entfernt`, p => {
        for (const k of Object.keys(p.steckbrett.beine)) if (ids.has(k.split('.')[0])) delete p.steckbrett.beine[k];
        entferneTeile(p, ids);
      });
      this.host.auswahlGeaendert?.();
    }
  }

  /* Umdrehen: Das Teil steckt danach andersherum in denselben Löchern. Wie von Hand bei einer Diode oder einem Transistor. */
  drehe() {
    const ids = [...this.plan.auswahl.teile];
    const t = ids.length === 1 ? this.projekt.teile.find(x => x.id === ids[0]) : null;
    if (!t || !formVon(t) || formVon(t).dip) return;
    const folge = beinFolge(t);
    this._anwenden(`${t.id} umgedreht`, p => {
      const B = p.steckbrett.beine;
      const erstes = `${t.id}.${folge[0]}`, letztes = `${t.id}.${folge[folge.length - 1]}`;
      [B[erstes], B[letztes]] = [B[letztes], B[erstes]];
    });
  }

  /* Eine Buchse ohne Teil bekommt jetzt ihr Teil. */
  _buchseVerwirklichen(p, k) {
    if (k.art !== 'buchse') return k;
    const b = buchsen(p).find(x => x.id === k.id);
    if (!b || b.pin || !b.neu) return k;
    const t = this._neuesTeil(p, b.neu.typ, b.neu.werte);
    p.teile.push(t);
    /* Die Kennung der Buchse bleibt nur bei fester Zuordnung gleich, Quellen heißen danach wie ihr Teil. */
    if (b.frei) return {art: 'buchse', id: `${t.id}.${BAUTEILE[t.typ].pins[0].id}`};
    return k;
  }

  _steckeKabel(a, b) {
    this._anwenden('Kabel eingesteckt', p => {
      const ka = this._buchseVerwirklichen(p, a), kb = this._buchseVerwirklichen(p, b);
      p.steckbrett.kabel.push({id: neueKabelId(p.steckbrett.kabel), a: ka, b: kb});
    });
  }

  /* Sonde oder Hörpunkt ohne Kabel haben keinen Grund mehr zu existieren. */
  _lockereBuchsen(p) {
    const liste = buchsen(p);
    const weg = new Set();
    for (const b of liste) {
      if (!b.pin || (b.kanal === undefined && !b.hoeren)) continue;
      const hatKabel = p.steckbrett.kabel.some(c => (c.a.art === 'buchse' && c.a.id === b.id) || (c.b.art === 'buchse' && c.b.id === b.id));
      if (!hatKabel) weg.add(b.pin.split('.')[0]);
    }
    if (weg.size) entferneTeile(p, weg);
  }

  _verschiebeTeil(z) {
    const p = this.projekt, B = p.steckbrett;
    const t = p.teile.find(x => x.id === z.teil);
    const form = formVon(t);
    const schluessel = Object.keys(B.beine).filter(k => k.startsWith(`${t.id}.`));
    /* Alle Beine verschieben sich gemeinsam. Geht das nicht, bleibt das Teil, wo es war. */
    const eigene = new Set(schluessel.map(k => { const q = B.beine[k]; return q.art === 'loch' ? lochKey(q.s, q.r) : ''; }));
    if (form.dip) for (const o of dipOrte(dipBasis(t, B.beine), form)) eigene.add(lochKey(o.s, o.r));
    for (const c of raumVonTeil(t, B.beine, 'platz')) eigene.add(c);
    const neu = {};
    for (const k of schluessel) {
      const q = B.beine[k];
      neu[k] = q.art === 'loch' ? {art: 'loch', s: q.s + z.ds, r: q.r + z.dr} : q;
    }
    const belegtDort = c => (this.stand.belegt.has(c) || this.stand.platz.has(c)) && !eigene.has(c);
    const ausserhalb = Object.values(neu).some(q => q.art === 'loch' && (q.s < 0 || q.s >= SPALTEN || q.r < 0 || q.r >= REIHEN));
    const ziele = form.dip ? dipOrte(dipBasis(t, B.beine) + z.ds, form).map(o => lochKey(o.s, o.r)) : [...raumVonTeil(t, neu, 'platz'), ...Object.values(neu).filter(q => q.art === 'loch').map(q => lochKey(q.s, q.r))];
    if (ausserhalb || ziele.some(belegtDort)) {
      this.status(`${t.id} passt dort nicht hin: Die Löcher sind belegt oder liegen außerhalb.`);
      this.zeichne();
      return;
    }
    this._anwenden(`${t.id} versetzt`, q => { Object.assign(q.steckbrett.beine, neu); });
  }

  _taste(e) {
    if (this.host.aktiv()) return;
    const ziel = e.target;
    if (ziel && (ziel.tagName === 'INPUT' || ziel.tagName === 'TEXTAREA' || ziel.tagName === 'SELECT' || ziel.isContentEditable)) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.host.wiederholen(); else this.host.rueckgaengig();
      return;
    }
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape') {
      this.zug = null;
      this.werkzeug = null;
      this.kabelWahl = null;
      this.host.werkzeugGeaendert?.(null);
      this.zeichne();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.loesche();
    } else if (e.key === 'r' || e.key === 'R') {
      this.drehe();
    }
  }
}

/* Kabel hängen als Bogen: Aus den Buchsen der Leiste gehen sie nach unten, aus dem Brett nach oben. */
function kabelBogen(a, b) {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const h = Math.min(8 + d * 0.3, 80);
  const auf = q => (q.y < BRETT_OBEN ? q.y + h : q.y - h);
  return `M${a.x} ${a.y}C${a.x} ${auf(a)} ${b.x} ${auf(b)} ${b.x} ${b.y}`;
}
