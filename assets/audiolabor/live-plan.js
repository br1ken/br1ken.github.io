/* Audiolabor: der allgemeine Live-Löser, Teil 1. Übersetzt jede unterstützte Schaltung in einen Rechenplan, außerhalb des Audio-Threads.

   Verfahren: modifizierte Knotenanalyse mit festem Zeitschritt h (θ-Verfahren, θ = 0,5 ist die Trapezregel).
   Das Gleichungssystem wird in lineare und nichtlineare Teile getrennt (Nodal-DK-Verfahren):

       A·x = B·s + C·u − N·i(v)      v = Nv·x

   A    enthält alle linearen Bauteile und die Ersatzleitwerte der Kondensatoren und Spulen. Sie ändert sich nur mit der Schaltung.
   s    Zustände der Kondensatoren und Spulen
   u    zeitabhängige Quellen
   i(v) Ströme der nichtlinearen Bauteile als Funktion ihrer Steuerspannungen v

   A wird hier einmal invertiert. Pro Abtastwert bleibt dann ein kleines Gleichungssystem nur in v übrig:

       v = v0(s, u) + K·i(v),   K = −Nv·A⁻¹·N

   Damit kosten lineare Knoten zur Laufzeit nichts. Der Aufwand hängt von der Zahl der Zustände und der nichtlinearen Anschlüsse ab.
   Die Koeffizienten sind oft fast alle null, weil Versorgung und Koppelkondensatoren die Stufen voneinander trennen. Deshalb sind sie dünn gespeichert.
   Eine Änderung der Schaltung oder eines Widerstands erzeugt einen neuen Plan, der an einer Blockgrenze übernommen wird. */

import { VT_27C } from './modelle.js';
import { luZerlege, luLoese } from './lu.js';

const GMIN = 1e-12;

const QUELLE = {dc: 0, sin: 1, puls: 2, huelle: 3, rauschen: 4, digital: 5, schmitt: 6};

/* Dünn besetzte Matrix, zeilenweise, aus den Spalten von bis bis einer vollen Matrix. Gruppen sind Spaltenbereiche gleicher Einheit:
   Was unter 1e-13 des größten Betrags seiner Gruppe liegt, wäre selbst bei den größten Zuständen weit unter jeder Messgrenze. */
function duenn(voll, zeilen, breite, gruppen) {
  const zeile = new Int32Array(zeilen + 1), spalte = [], wert = [];
  const grenzen = gruppen.map(([von, bis]) => {
    let groesster = 0;
    for (let r = 0; r < zeilen; r++) for (let c = von; c < bis; c++) groesster = Math.max(groesster, Math.abs(voll[r * breite + c]));
    return groesster * 1e-13;
  });
  const anfang = gruppen[0][0];
  for (let r = 0; r < zeilen; r++) {
    gruppen.forEach(([von, bis], g) => {
      for (let c = von; c < bis; c++) {
        const w = voll[r * breite + c];
        if (Math.abs(w) > grenzen[g]) { spalte.push(c - anfang); wert.push(w); }
      }
    });
    zeile[r + 1] = wert.length;
  }
  return {zeile, spalte: Int32Array.from(spalte), wert: Float64Array.from(wert)};
}

export class PlanFehler extends Error {
  constructor(text) { super(text); this.name = 'PlanFehler'; }
}

/* Erzeugt den Plan. optionen: fs (Audio-Abtastrate), ueber (Überabtastung), theta, h (statt fs, für den Arbeitspunkt),
   mess: Liste der gewünschten Messgrößen {id, art: 'u'|'i', netz|quelle}. */
export function erzeugePlan(ir, {fs = 48000, ueber = 4, theta = 0.5, h: hVorgabe = null, mess = []} = {}) {
  const h = hVorgabe ?? 1 / (fs * ueber);

  /* ---------- Knoten und Zweige ---------- */
  const knoten = new Map();
  const nk = name => {
    if (name === '0') return -1;
    if (!knoten.has(name)) knoten.set(name, knoten.size);
    return knoten.get(name);
  };
  const linear = [];     /* {a, b, g} */
  const zustaende = [];  /* {id, art, a, b, wert, ic} */
  const zweige = [];     /* {id, a, b, art:'V'|'E', ...} */
  const quellen = [];    /* {id, zeile|a,b, art, welle} */
  const geraete = [];    /* nichtlineare Bauteile */
  const digitale = [];   /* Schmitt-Trigger */

  const leitwert = (a, b, g) => linear.push({a: nk(a), b: nk(b), g});

  for (const e of ir.elemente) {
    switch (e.k) {
      case 'R': leitwert(e.a, e.b, 1 / e.wert); break;
      case 'C': zustaende.push({id: e.id, art: 'C', a: nk(e.a), b: nk(e.b), wert: e.wert, ic: e.ic || 0, gedaempft: !!e.gedaempft}); break;
      case 'L': zustaende.push({id: e.id, art: 'L', a: nk(e.a), b: nk(e.b), wert: e.wert, ic: e.ic || 0}); break;
      case 'V': zweige.push({id: e.id, art: 'V', a: nk(e.a), b: nk(e.b), welle: e.welle, teilQuelle: e.teilQuelle}); break;
      case 'I': quellen.push({id: e.id, art: 'I', a: nk(e.a), b: nk(e.b), welle: e.welle, teilQuelle: e.teilQuelle}); break;
      case 'E': zweige.push({id: e.id, art: 'E', a: nk(e.a), b: nk(e.b), cp: nk(e.cp), cn: nk(e.cn), gain: e.gain}); break;
      case 'GT':
        geraete.push({typ: 'GT', id: e.id, st: [[nk(e.cp), nk(e.cn)]], aus: [[nk(e.a), nk(e.b)]], gm: e.gm, imax: e.imax});
        break;
      case 'D': {
        const k = e.modell.karte;
        let a = e.a;
        if (k.RS > 0) {
          a = `${e.id}_rs`.toLowerCase();
          leitwert(e.a, a, 1 / k.RS);
        }
        leitwert(a, e.k_, GMIN);
        geraete.push({typ: 'D', id: e.id, st: [[nk(a), nk(e.k_)]], aus: [[nk(a), nk(e.k_)]], is: k.IS, nvt: (k.N || 1) * VT_27C, bv: k.BV || 0, ibv: k.IBV || 1e-3});
        break;
      }
      case 'Q': {
        const k = e.modell.karte;
        const f = e.flaeche ?? 1;
        let b = e.b, c = e.c, em = e.e;
        const rb = k.RB > 0 ? k.RB / f : 0, rc = k.RC > 0 ? k.RC / f : 0, re = k.RE > 0 ? k.RE / f : 0;
        if (rb > 0) { b = `${e.id}_b`.toLowerCase(); leitwert(e.b, b, 1 / rb); }
        if (rc > 0) { c = `${e.id}_c`.toLowerCase(); leitwert(e.c, c, 1 / rc); }
        if (re > 0) { em = `${e.id}_e`.toLowerCase(); leitwert(e.e, em, 1 / re); }
        leitwert(b, em, GMIN);
        leitwert(b, c, GMIN);
        const npn = e.modell.pol === 'NPN';
        /* Bei PNP tauschen alle Anschlusspaare die Richtung. Die Gleichungen bleiben dieselben. */
        const st = npn ? [[nk(b), nk(em)], [nk(b), nk(c)]] : [[nk(em), nk(b)], [nk(c), nk(b)]];
        const aus = npn ? [[nk(c), nk(em)], [nk(b), nk(em)]] : [[nk(em), nk(c)], [nk(em), nk(b)]];
        geraete.push({
          typ: 'Q', id: e.id, st, aus,
          is: k.IS * f, bf: k.BF ?? 100, br: k.BR ?? 1,
          nf: (k.NF ?? 1) * VT_27C, nr: (k.NR ?? 1) * VT_27C,
          ise: (k.ISE ?? 0) * f, ne: (k.NE ?? 1.5) * VT_27C, isc: (k.ISC ?? 0) * f, nc: (k.NC ?? 2) * VT_27C,
          vaf: k.VAF ?? 0, var: k.VAR ?? 0, ikf: (k.IKF ?? 0) * f, ikr: (k.IKR ?? 0) * f
        });
        break;
      }
      case 'M': {
        const k = e.modell.karte;
        const n = e.modell.pol === 'NMOS';
        leitwert(e.d, e.s, GMIN);
        const st = n ? [[nk(e.g), nk(e.s)], [nk(e.d), nk(e.s)]] : [[nk(e.s), nk(e.g)], [nk(e.s), nk(e.d)]];
        const aus = n ? [[nk(e.d), nk(e.s)]] : [[nk(e.s), nk(e.d)]];
        geraete.push({typ: 'M', id: e.id, st, aus, vto: Math.abs(k.VTO), kp: k.KP, lambda: k.LAMBDA || 0});
        break;
      }
      case 'ST': {
        /* Ausgang: gesteuerte Spannung hinter dem Ausgangswiderstand, zwischen den Abtastschritten fortgeschaltet. */
        const m = e.modell;
        const o = `${e.id}_o`.toLowerCase();
        zweige.push({id: `V${e.id}`, art: 'V', a: nk(o), b: nk(e.vss), welle: {art: 'schmitt', v: 0}, schmitt: e.id});
        leitwert(o, e.aus, 1 / m.rout);
        digitale.push({id: e.id, ein: nk(e.ein), vss: nk(e.vss), vdd: nk(e.vdd), vp: m.vp, vn: m.vn});
        break;
      }
      default:
        throw new PlanFehler(`Das Grundelement ${e.k} kann der Live-Löser nicht rechnen.`);
    }
  }

  const nKnoten = knoten.size;
  const n = nKnoten + zweige.length;
  if (n === 0) throw new PlanFehler('Die Schaltung ist leer.');
  const zeileZweig = new Map(zweige.map((z, i) => [z.id, nKnoten + i]));

  /* ---------- Matrix A ---------- */
  const A = new Float64Array(n * n);
  const add = (r, c, w) => { if (r >= 0 && c >= 0) A[r * n + c] += w; };
  for (let i = 0; i < nKnoten; i++) A[i * n + i] += GMIN;
  for (const {a, b, g} of linear) { add(a, a, g); add(b, b, g); add(a, b, -g); add(b, a, -g); }

  const S = zustaende.length;
  const c1 = new Float64Array(S), c2 = new Float64Array(S), gz = new Float64Array(S), alpha = new Float64Array(S);
  zustaende.forEach((z, k) => {
    /* Gedämpft heißt implizites Euler: Weit jenseits seiner Zeitkonstante schwingt ein Zustand nach der Trapezregel ungedämpft von Schritt zu Schritt um. */
    const th = z.gedaempft ? 1 : theta;
    const g = z.art === 'C' ? z.wert / (th * h) : th * h / z.wert;
    alpha[k] = (1 - th) / th;
    gz[k] = g;
    c1[k] = (1 + alpha[k]) * g;
    c2[k] = z.art === 'C' ? -alpha[k] : 1;
    add(z.a, z.a, g); add(z.b, z.b, g); add(z.a, z.b, -g); add(z.b, z.a, -g);
  });

  zweige.forEach((z, i) => {
    const r = nKnoten + i;
    add(z.a, r, 1); add(z.b, r, -1);
    add(r, z.a, 1); add(r, z.b, -1);
    if (z.art === 'E') { add(r, z.cp, -z.gain); add(r, z.cn, z.gain); }
  });

  const lu = A.slice();
  const perm = new Int32Array(n);
  if (!luZerlege(lu, n, perm)) throw new PlanFehler('Das lineare Gleichungssystem der Schaltung ist nicht lösbar. Vermutlich bilden Spannungsquellen eine Masche.');

  /* ---------- Quellen: konstante werden sofort eingerechnet, veränderliche sind Eingänge ---------- */
  const eingaenge = [];
  const konstant = new Float64Array(n);
  const einEinspeisen = (ziel, q, wert) => {
    if (q.istZweig) ziel[q.zeile] += wert;
    else { if (q.a >= 0) ziel[q.a] -= wert; if (q.b >= 0) ziel[q.b] += wert; }
  };
  const alleQuellen = [
    ...zweige.filter(z => z.art === 'V').map(z => ({...z, istZweig: true, zeile: zeileZweig.get(z.id)})),
    ...quellen.map(q => ({...q, istZweig: false}))
  ];
  for (const q of alleQuellen) {
    if (q.welle.art === 'dc' && !q.teilQuelle) einEinspeisen(konstant, q, q.welle.v);
    else eingaenge.push(q);
  }
  const U = eingaenge.length;

  /* Ausgänge der nichtlinearen Bauteile und ihre Steuerspannungen */
  let Mv = 0, Mi = 0;
  for (const g of geraete) { g.v0 = Mv; g.i0 = Mi; Mv += g.st.length; Mi += g.aus.length; }

  /* ---------- Spalten: A⁻¹ auf jede Einspeisung anwenden ---------- */
  const loese = (fuellen) => { const b = new Float64Array(n); fuellen(b); luLoese(lu, perm, n, b); return b; };
  const spaltenS = zustaende.map(z => loese(b => {
    const v = z.art === 'C' ? 1 : -1;
    if (z.a >= 0) b[z.a] += v;
    if (z.b >= 0) b[z.b] -= v;
  }));
  const spaltenU = eingaenge.map(q => loese(b => einEinspeisen(b, q, 1)));
  const spaltenI = [];
  for (const g of geraete) {
    for (const [a, b] of g.aus) {
      spaltenI.push(loese(z => {
        /* Strom von a nach b. Er verlässt Knoten a: Im System steht das auf der linken Seite, also −N·i rechts. */
        if (a >= 0) z[a] -= 1;
        if (b >= 0) z[b] += 1;
      }));
    }
  }
  const spalteK = loese(b => b.set(konstant));

  /* ---------- Zeilen: was pro Schritt wirklich gebraucht wird ---------- */
  const spannung = (x, a, b) => (a >= 0 ? x[a] : 0) - (b >= 0 ? x[b] : 0);
  /* Die Spalten eines Blocks sind Zustände, Eingänge und Ströme hintereinander, so wie sie der Löser in einem Vektor hält. */
  const breite = S + U + Mi;
  const alleSpalten = [...spaltenS, ...spaltenU, ...spaltenI];
  const baueBlock = (zeilen) => {
    const R = zeilen.length;
    const voll = new Float64Array(R * breite), k0 = new Float64Array(R);
    zeilen.forEach((lese, r) => {
      alleSpalten.forEach((spalte, c) => { voll[r * breite + c] = lese(spalte); });
      k0[r] = lese(spalteK);
    });
    return {R, voll, k0};
  };
  const gruppeS = [0, S], gruppeU = [S, S + U], gruppeI = [S + U, breite];

  const zeilenV = [];
  for (const g of geraete) for (const [a, b] of g.st) zeilenV.push(x => spannung(x, a, b));
  const blockV = baueBlock(zeilenV);
  const blockX = baueBlock(zustaende.map(z => x => spannung(x, z.a, z.b)));

  /* Messgrößen: Netzspannungen und Zweigströme, dazu die Eingänge der Schmitt-Trigger */
  const messZeilen = [];
  const messListe = [];
  for (const m of mess) {
    if (m.art === 'u') {
      const k = m.netz === '0' ? -1 : knoten.has(m.netz) ? knoten.get(m.netz) : null;
      if (k === null) { messListe.push({...m, leer: true}); messZeilen.push(() => 0); continue; }
      messListe.push(m);
      messZeilen.push(x => spannung(x, k, -1));
    } else {
      const zeile = zeileZweig.get(m.quelle);
      if (zeile === undefined) { messListe.push({...m, leer: true}); messZeilen.push(() => 0); continue; }
      messListe.push(m);
      messZeilen.push(x => x[zeile]);
    }
  }
  const P = messZeilen.length;
  const digitalPlan = digitale.map(d => {
    const q = eingaenge.findIndex(e => e.schmitt === d.id);
    const pEin = messZeilen.length;
    messZeilen.push(x => spannung(x, d.ein, d.vss));
    const pVdd = messZeilen.length;
    messZeilen.push(x => spannung(x, d.vdd, d.vss));
    return {id: d.id, u: q, pEin, pVdd, vp: d.vp, vn: d.vn};
  });
  const blockP = baueBlock(messZeilen);

  const stromSpalten = ({R, voll}) => {
    const k = new Float64Array(R * Mi);
    for (let r = 0; r < R; r++) for (let c = 0; c < Mi; c++) k[r * Mi + c] = voll[r * breite + S + U + c];
    return k;
  };

  /* ---------- Plan als reine Daten, damit er an den Audio-Thread übergeben werden kann ---------- */
  const plan = {
    fs, ueber, h, theta, alpha,
    n, nKnoten, S, U, Mv, Mi, P, Pgesamt: blockP.R,
    /* Kv ohne die Ströme: die feste Seite von v = v0 + K·i. Kvi und seine volle Form gehören zum Newton-Verfahren. */
    Kv: duenn(blockV.voll, blockV.R, breite, [gruppeS, gruppeU]), Kv0: blockV.k0,
    Kvi: duenn(blockV.voll, blockV.R, breite, [gruppeI]), KviVoll: stromSpalten(blockV),
    Kx: duenn(blockX.voll, blockX.R, breite, [gruppeS, gruppeU, gruppeI]), Kx0: blockX.k0,
    Kp: duenn(blockP.voll, blockP.R, breite, [gruppeS, gruppeU, gruppeI]), Kp0: blockP.k0,
    c1, c2, gz,
    zustaende: zustaende.map(z => ({id: z.id, art: z.art, wert: z.wert, ic: z.ic})),
    eingaenge: eingaenge.map(q => ({id: q.id, teilQuelle: q.teilQuelle ?? null, schmitt: q.schmitt ?? null, welle: q.welle, art: QUELLE[q.welle.art]})),
    geraete: geraete.map(g => {
      const {st, aus, ...rest} = g;
      return {...rest, nSt: st.length, nAus: aus.length};
    }),
    digital: digitalPlan,
    mess: messListe
  };
  return plan;
}

/* Alle Puffer eines Plans, damit postMessage sie ohne Kopie übergeben kann. */
export function planPuffer(plan) {
  const voll = ['KviVoll', 'Kv0', 'Kx0', 'Kp0', 'c1', 'c2', 'gz', 'alpha'].map(k => plan[k].buffer);
  const duenne = ['Kv', 'Kvi', 'Kx', 'Kp'].flatMap(k => [plan[k].zeile.buffer, plan[k].spalte.buffer, plan[k].wert.buffer]);
  return [...voll, ...duenne];
}
