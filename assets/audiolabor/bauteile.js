/* Audiolabor: die Bauteilbibliothek. Jeder Eintrag beschreibt ein Bauteil vollständig:
   Anschlüsse, Werte mit Einheiten, Schaltzeichen (nach EN 60617, wo es eines gibt), Steckbrett-Form, Modellangabe
   und die Übersetzung in elektrische Grundelemente (ausbauen). Aus diesen Grundelementen entstehen die ngspice-Netlist
   und der Live-Plan; ein Bauteil, das nur gezeichnet wäre, gibt es hier nicht.

   Grundelemente (siehe auch netlist.js und live-plan.js):
     R, C, L      {a, b, wert}                     C und L optional mit Anfangswert ic
     V, I         {a, b, welle}                    Strom von a durch die Quelle nach b, wie in SPICE
     E            {a, b, cp, cn, gain}             spannungsgesteuerte Spannungsquelle
     GT           {a, b, cp, cn, gm, imax}         spannungsgesteuerte Stromquelle mit tanh-Begrenzung
     D            {a, k, modell}
     Q            {c, b, e, modell, flaeche}
     M            {d, g, s, modell}
     ST           {ein, aus, vdd, vss, modell, startHoch}   Schmitt-Trigger-Gatter */

import { DIODEN, BIPOLAR, MOSFET, OPV, SCHMITT, zenerModell } from './modelle.js';
import { fmtWert, komma } from './einheiten.js';

const zahl = (key, label, einheit, def, extra = {}) => ({key, label, einheit, def, typ: 'zahl', ...extra});
const wahl = (key, label, optionen, def, extra = {}) => ({key, label, optionen, def, typ: 'wahl', ...extra});
const schalter = (key, label, def, extra = {}) => ({key, label, def, typ: 'schalter', ...extra});
const text = (key, label, def, extra = {}) => ({key, label, def, typ: 'text', ...extra});

const modellOptionen = (tab, filter = () => true) => Object.entries(tab).filter(([, m]) => filter(m)).map(([id, m]) => [id, m.name]);

const IDEAL = (txt) => ({art: 'ideal', name: 'ideal', version: 'osci-audiolabor 1', quelle: '', text: txt});

/* Anzeige eines Zahlenwerts mit Einheit */
const zeige = (t, key, einheit) => fmtWert(t.werte[key], einheit);

/* ---------- Zeichenhelfer: alles läuft durch die Klassen s (Linie), f (gefüllt), b (Fläche in Hintergrundfarbe) ---------- */
const L = d => `<path class="s" d="${d}"/>`;
const F = d => `<path class="f" d="${d}"/>`;
const pol = '<text class="sz" x="-26" y="-8">+</text>';

function quellenKreis(innen) {
  return L('M0 -40V-20M0 20V40') + '<circle class="b" r="20"/>' + innen;
}

/* Rechteckiges IC-Gehäuse von oben: Pin 1 links oben, Zählung gegen den Uhrzeigersinn wie beim echten DIP. */
function dipPins(namen) {
  const n = namen.length, h = n / 2, pins = [];
  /* Alle Pins liegen auf dem 20er-Raster, sonst könnte kein Draht sie treffen. */
  const y0 = -Math.floor(h / 2) * 20;
  for (let i = 0; i < h; i++) {
    pins.push({id: String(i + 1), x: -80, y: y0 + i * 20, name: namen[i]});
    pins.push({id: String(n - i), x: 80, y: y0 + i * 20, name: namen[n - i - 1]});
  }
  return pins;
}

function dipZeichen(pins, titel) {
  const ys = pins.map(p => p.y), oben = Math.min(...ys) - 16, unten = Math.max(...ys) + 16;
  let s = `<rect class="b" x="-52" y="${oben}" width="104" height="${unten - oben}"/>`;
  s += L(`M-8 ${oben}a8 8 0 0 0 16 0`);
  for (const p of pins) {
    const links = p.x < 0;
    s += L(`M${p.x} ${p.y}H${links ? -52 : 52}`);
    s += `<text class="pn" x="${links ? -48 : 48}" y="${p.y + 3}" text-anchor="${links ? 'start' : 'end'}">${p.name}</text>`;
    s += `<text class="pz" x="${links ? -56 : 56}" y="${p.y - 3}" text-anchor="${links ? 'end' : 'start'}">${p.id}</text>`;
  }
  s += `<text class="pn" x="0" y="${unten - 5}" text-anchor="middle">${titel}</text>`;
  return s;
}

/* ---------- gemeinsame Teile der Übersetzung ---------- */

/* Innenwiderstand einer Quelle: Bei 0 Ω liegt die Quelle direkt am Pin. */
function mitInnenwiderstand(ctx, t, plus, ri) {
  if (!(ri > 0)) return plus;
  const n = ctx.knoten('ri');
  ctx.add({k: 'R', id: `R${t.id}i`, a: n, b: plus, wert: ri});
  return n;
}

function opvEinheit(ctx, praefix, modell, pinPlus, pinMinus, pinAus, vp, vm) {
  /* Makromodell mit Grundelementen. Eingangsstrom begrenzt (Slew Rate), ein Pol auf Knoten n1,
     Klemmdioden gegen Hilfsspannungen, die den Versorgungspins folgen. */
  const m = modell;
  const c1 = 30e-12;
  const gm = 2 * Math.PI * m.gbw * c1;
  const r1 = m.a0 / gm;
  const imax = m.sr * c1;
  const n1 = ctx.knoten(`${praefix}n1`), b = ctx.knoten(`${praefix}b`);
  const hx = ctx.knoten(`${praefix}hx`), h = ctx.knoten(`${praefix}h`), lx = ctx.knoten(`${praefix}lx`), l = ctx.knoten(`${praefix}l`);
  const id = `${ctx.teil.id}${praefix}`;
  ctx.add({k: 'R', id: `R${id}in`, a: pinPlus, b: pinMinus, wert: m.rin});
  ctx.add({k: 'GT', id: `G${id}`, a: '0', b: n1, cp: pinPlus, cn: pinMinus, gm, imax});
  ctx.add({k: 'R', id: `R${id}1`, a: n1, b: '0', wert: r1});
  /* Der Live-Löser rechnet dieses C gedämpft: Sein Knoten reagiert weit schneller als ein Zeitschritt, und Mitkopplung reißt ihn in einem Schritt von Klemme zu Klemme. */
  ctx.add({k: 'C', id: `C${id}1`, a: n1, b: '0', wert: c1, gedaempft: true});
  ctx.add({k: 'E', id: `E${id}o`, a: b, b: '0', cp: n1, cn: '0', gain: 1});
  ctx.add({k: 'R', id: `R${id}o`, a: b, b: pinAus, wert: m.rout});
  ctx.add({k: 'E', id: `E${id}h`, a: hx, b: '0', cp: vp, cn: '0', gain: 1});
  ctx.add({k: 'V', id: `V${id}h`, a: hx, b: h, welle: {art: 'dc', v: m.hubPlus}});
  ctx.add({k: 'E', id: `E${id}l`, a: lx, b: '0', cp: vm, cn: '0', gain: 1});
  ctx.add({k: 'V', id: `V${id}l`, a: l, b: lx, welle: {art: 'dc', v: m.hubMinus}});
  /* startAus: Das Knie ist so scharf, dass ngspice beim Arbeitspunkt sonst auf einem falschen Stand an der Klemme landen kann.
     Gemessen am Resonanzfilter: −10,5 V statt −2,5 V am Ausgang. */
  ctx.add({k: 'D', id: `D${id}h`, a: n1, k_: h, modell: KLEMME, startAus: true});
  ctx.add({k: 'D', id: `D${id}l`, a: l, k_: n1, modell: KLEMME, startAus: true});
}

/* Klemmdiode des Makromodells: scharfes Knie nahe 0 V. Sie gehört zum Modell und ist kein Bauteil. */
const KLEMME = {name: 'KLEMME', art: 'naeherung', version: 'osci-audiolabor 1', quelle: '', text: '', karte: {IS: 1e-9, N: 0.1}};

function diodenElement(ctx, id, a, k, m) {
  ctx.add({k: 'D', id, a, k_: k, modell: m});
  if (m.rp) ctx.add({k: 'R', id: `R${id}p`, a, b: k, wert: m.rp});
}

function bipolarElement(ctx, m, c, b, e) {
  const id = `Q${ctx.teil.id}`;
  const z = m.zusatz;
  if (ctx.ziel === 'live' || !z) {
    ctx.add({k: 'Q', id, c, b, e, modell: m, flaeche: 1});
    if (z && ctx.ziel === 'live') ctx.naeherung(`${ctx.teil.id}: Der Live-Löser rechnet nur den Haupttransistor von ${m.name}: Fläche 1, Basiswiderstand fest, ohne die Hilfszweige der Herstellerdatei.`);
    return;
  }
  const npn = m.pol === 'NPN';
  ctx.add({k: 'Q', id, c, b, e, modell: m, flaeche: z.flaeche1 ?? 1});
  if (z.flaeche2) {
    const c2 = ctx.knoten('c2');
    const e2 = z.q2EmitterOffen ? ctx.knoten('e2') : e;
    ctx.add({k: 'Q', id: `${id}x`, c: c2, b, e: e2, modell: m, flaeche: z.flaeche2});
    ctx.add({k: 'R', id: `R${ctx.teil.id}q`, a: c2, b: c, wert: z.rq});
  }
  if (z.diode) {
    const dm = {name: `${m.name}_D`, art: m.art, version: m.version, quelle: m.quelle, text: '', karte: z.diode};
    if (npn) ctx.add({k: 'D', id: `D${ctx.teil.id}x`, a: b, k_: c, modell: dm});
    else ctx.add({k: 'D', id: `D${ctx.teil.id}x`, a: c, k_: b, modell: dm});
  }
}

/* Spannungsverlauf einer Generatorquelle */
export function generatorWelle(w) {
  const f = w.f, per = 1 / f;
  const hub = w.amp, off = w.off;
  const flanke = Math.min(w.flanke, per / 4);
  switch (w.form) {
    case 'dreieck':
      return {art: 'puls', low: off - hub, high: off + hub, td: 0, tr: per / 2, tf: per / 2, pw: 0, per, dc: off};
    case 'rechteck': {
      const hoch = Math.min(Math.max(w.tast / 100, 0.001), 0.999) * per;
      return {art: 'puls', low: off - hub, high: off + hub, td: 0, tr: flanke, tf: flanke, pw: Math.max(hoch - flanke, 0), per, dc: off};
    }
    case 'saege': {
      const rampe = Math.max(per - flanke, flanke);
      return {art: 'puls', low: off - hub, high: off + hub, td: 0, tr: rampe, tf: flanke, pw: 0, per, dc: off};
    }
    default:
      return {art: 'sin', off, amp: hub, f, phase: 0, dc: off};
  }
}

export function gateWelle(w) {
  /* Mit Taster gibt es im Renderbetrieb genau ein Ereignis. */
  const taster = w.ausloesung === 'taster';
  const per = taster ? 3600 : w.per;
  const flanke = 1e-5;
  const gemeinsam = {dc: 0, manuell: true, ausloesung: w.ausloesung};
  switch (w.modus) {
    case 'trigger':
      return {art: 'puls', low: 0, high: w.hoch, td: w.td, tr: flanke, tf: flanke, pw: w.triggerDauer, per, ...gemeinsam};
    case 'huelle':
      return {art: 'huelle', v: w.hoch, a: w.anstieg, tau: w.abfall, per, ...gemeinsam};
    default:
      return {art: 'puls', low: 0, high: w.hoch, td: w.td, tr: flanke, tf: flanke, pw: w.gateDauer, per, haltend: true, ...gemeinsam};
  }
}

const zweipol = [{id: '1', x: -40, y: 0}, {id: '2', x: 40, y: 0}];
const quellenPins = [{id: '+', x: 0, y: -40}, {id: '-', x: 0, y: 40}];

export const BAUTEILE = {
  /* ---------- Passiv ---------- */
  r: {
    kurz: 'Widerstand',
    koerper: [-20, -8, 20, 8],
    name: 'Widerstand', gruppe: 'passiv', praefix: 'R', pins: zweipol,
    werte: [zahl('R', 'Widerstand', 'Ω', 10000, {min: 1e-3, max: 1e12, reihe: true})],
    zeichen: () => L('M-40 0H-20M20 0H40') + '<rect class="b" x="-20" y="-8" width="40" height="16"/>',
    wert: t => zeige(t, 'R', 'Ω'),
    modell: () => IDEAL('Idealer ohmscher Widerstand: ohne Toleranz, Rauschen, Temperaturgang und Leistungsgrenze.'),
    steck: 'axial',
    ausbauen(ctx, t, p) { ctx.add({k: 'R', id: t.id, a: p['1'], b: p['2'], wert: t.werte.R}); }
  },
  c: {
    kurz: 'Kondensator',
    koerper: [-5, -14, 5, 14],
    name: 'Kondensator', gruppe: 'passiv', praefix: 'C', pins: zweipol,
    werte: [zahl('C', 'Kapazität', 'F', 10e-9, {min: 1e-15, max: 10, reihe: true}), zahl('ic', 'Anfangsspannung', 'V', 0, {min: -1000, max: 1000, hilfe: 'Gilt nur beim Start aus Anfangswerten (UIC).'})],
    zeichen: () => L('M-40 0H-5M5 0H40M-5 -14V14M5 -14V14'),
    wert: t => zeige(t, 'C', 'F'),
    modell: () => IDEAL('Idealer Kondensator: speichert Ladung, ohne Serienwiderstand, Leckstrom und Spannungsgrenze.'),
    steck: 'radial',
    ausbauen(ctx, t, p) { ctx.add({k: 'C', id: t.id, a: p['1'], b: p['2'], wert: t.werte.C, ic: t.werte.ic}); }
  },
  elko: {
    kurz: 'Elko',
    koerper: [-5, -14, 10, 14],
    name: 'Elko', gruppe: 'passiv', praefix: 'C', pins: [{id: '+', x: -40, y: 0}, {id: '-', x: 40, y: 0}],
    werte: [zahl('C', 'Kapazität', 'F', 10e-6, {min: 1e-9, max: 10, reihe: true}), zahl('ic', 'Anfangsspannung', 'V', 0, {min: -1000, max: 1000, hilfe: 'Gilt nur beim Start aus Anfangswerten (UIC).'})],
    zeichen: () => L('M-40 0H-5M7 0H40M-5 -14V14') + F('M4 -14h6v28h-6z') + pol,
    wert: t => zeige(t, 'C', 'F'),
    modell: () => IDEAL('Idealer Kondensator mit Polaritätsmarke. Verpolung zerstört ihn im Modell nicht; die Bauteilkarte sagt es am Arbeitspunkt.'),
    steck: 'radial',
    ausbauen(ctx, t, p) { ctx.add({k: 'C', id: t.id, a: p['+'], b: p['-'], wert: t.werte.C, ic: t.werte.ic}); }
  },
  l: {
    kurz: 'Spule',
    koerper: [-24, -8, 24, 2],
    name: 'Spule', gruppe: 'passiv', praefix: 'L', pins: zweipol,
    werte: [zahl('L', 'Induktivität', 'H', 10e-3, {min: 1e-12, max: 1000, reihe: true}), zahl('rs', 'Serienwiderstand', 'Ω', 0, {min: 0, max: 1e6}), zahl('ic', 'Anfangsstrom', 'A', 0, {min: -100, max: 100, hilfe: 'Gilt nur beim Start aus Anfangswerten (UIC).'})],
    zeichen: () => L('M-40 0H-24a6 6 0 0 1 12 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0H40'),
    wert: t => zeige(t, 'L', 'H'),
    modell: () => IDEAL('Ideale Spule mit optionalem Serienwiderstand, ohne Sättigung und Wicklungskapazität.'),
    steck: 'axial',
    ausbauen(ctx, t, p) {
      if (t.werte.rs > 0) {
        const n = ctx.knoten('rs');
        ctx.add({k: 'L', id: t.id, a: p['1'], b: n, wert: t.werte.L, ic: t.werte.ic});
        ctx.add({k: 'R', id: `R${t.id}s`, a: n, b: p['2'], wert: t.werte.rs});
      } else ctx.add({k: 'L', id: t.id, a: p['1'], b: p['2'], wert: t.werte.L, ic: t.werte.ic});
    }
  },
  pot: {
    kurz: 'Poti',
    koerper: [-20, -15, 20, 8],
    name: 'Potentiometer', gruppe: 'passiv', praefix: 'P', pins: [{id: '1', x: -40, y: 0}, {id: '2', x: 0, y: -40, name: 'S'}, {id: '3', x: 40, y: 0}],
    werte: [zahl('R', 'Gesamtwiderstand', 'Ω', 100000, {min: 1, max: 1e9, reihe: true}), zahl('pos', 'Schleiferstellung', '%', 50, {min: 0, max: 100, regler: true}), wahl('kurve', 'Kennlinie', [['lin', 'linear'], ['log', 'logarithmisch (Audio)']], 'lin')],
    zeichen: () => L('M-40 0H-20M20 0H40M0 -40V-14') + '<rect class="b" x="-20" y="-8" width="40" height="16"/>' + F('M-4 -15L0 -8L4 -15Z'),
    wert: t => `${fmtWert(t.werte.R, 'Ω')} · ${komma(Math.round(t.werte.pos))} %`,
    modell: () => IDEAL('Zwei ideale Teilwiderstände, die Stellung bestimmt die Aufteilung. Anschlagwiderstand 1 mΩ.'),
    steck: 'dreibein',
    ausbauen(ctx, t, p) {
      const x = Math.min(Math.max(t.werte.pos / 100, 0), 1);
      const anteil = t.werte.kurve === 'log' ? (Math.pow(10, 2 * x) - 1) / 99 : x;
      ctx.add({k: 'R', id: `${t.id}a`, a: p['1'], b: p['2'], wert: Math.max(t.werte.R * anteil, 1e-3)});
      ctx.add({k: 'R', id: `${t.id}b`, a: p['2'], b: p['3'], wert: Math.max(t.werte.R * (1 - anteil), 1e-3)});
    }
  },
  schalter: {
    kurz: 'Schalter',
    koerper: [-14, -14, 14, 3],
    name: 'Schalter', gruppe: 'passiv', praefix: 'S', pins: zweipol,
    werte: [schalter('zu', 'Geschlossen', false), zahl('ron', 'Widerstand geschlossen', 'Ω', 0.01, {min: 1e-6, max: 1e3}), zahl('roff', 'Widerstand offen', 'Ω', 1e9, {min: 1e3, max: 1e15})],
    zeichen: t => L(`M-40 0H-14M14 0H40M-14 0L${t.werte.zu ? '14 0' : '12 -14'}`) + '<circle class="b" cx="-14" r="2.5"/><circle class="b" cx="14" r="2.5"/>',
    wert: t => t.werte.zu ? 'zu' : 'offen',
    modell: () => IDEAL('Idealer Schalter als zwei feste Widerstandswerte, ohne Prellen.'),
    steck: 'dreibein',
    ausbauen(ctx, t, p) { ctx.add({k: 'R', id: `R${t.id}`, a: p['1'], b: p['2'], wert: t.werte.zu ? t.werte.ron : t.werte.roff}); }
  },
  umschalter: {
    kurz: 'Umschalter',
    koerper: [-14, -22, 14, 22],
    name: 'Umschalter', gruppe: 'passiv', praefix: 'S', pins: [{id: '1', x: -40, y: 0, name: 'M'}, {id: '2', x: 40, y: -20, name: 'A'}, {id: '3', x: 40, y: 20, name: 'B'}],
    werte: [wahl('lage', 'Stellung', [['a', 'A'], ['b', 'B']], 'a'), zahl('ron', 'Widerstand geschlossen', 'Ω', 0.01, {min: 1e-6, max: 1e3}), zahl('roff', 'Widerstand offen', 'Ω', 1e9, {min: 1e3, max: 1e15})],
    zeichen: t => L(`M-40 0H-14M14 -20H40M14 20H40M-14 0L${t.werte.lage === 'a' ? '12 -18' : '12 18'}`) + '<circle class="b" cx="-14" r="2.5"/><circle class="b" cx="14" cy="-20" r="2.5"/><circle class="b" cx="14" cy="20" r="2.5"/>',
    wert: t => `Stellung ${t.werte.lage.toUpperCase()}`,
    modell: () => IDEAL('Idealer Umschalter als zwei feste Widerstandspaare, ohne Prellen.'),
    steck: 'dreibein',
    ausbauen(ctx, t, p) {
      const a = t.werte.lage === 'a';
      ctx.add({k: 'R', id: `R${t.id}a`, a: p['1'], b: p['2'], wert: a ? t.werte.ron : t.werte.roff});
      ctx.add({k: 'R', id: `R${t.id}b`, a: p['1'], b: p['3'], wert: a ? t.werte.roff : t.werte.ron});
    }
  },

  /* ---------- Halbleiter ---------- */
  d: {
    kurz: 'Diode',
    koerper: [-12, -12, 12, 12],
    name: 'Diode', gruppe: 'halbleiter', praefix: 'D', pins: [{id: 'A', x: -40, y: 0}, {id: 'K', x: 40, y: 0}],
    werte: [wahl('modell', 'Modell', modellOptionen(DIODEN, m => m.name !== DIODEN.LED.name), '1N4148')],
    zeichen: () => L('M-40 0H-12M12 0H40') + F('M-12 -12V12L12 0Z') + L('M12 -12V12'),
    wert: t => DIODEN[t.werte.modell].kurz ?? DIODEN[t.werte.modell].name,
    modell: t => DIODEN[t.werte.modell],
    steck: 'axial',
    ausbauen(ctx, t, p) { diodenElement(ctx, `D${t.id}`, p.A, p.K, DIODEN[t.werte.modell]); }
  },
  led: {
    kurz: 'LED',
    koerper: [-12, -24, 16, 12],
    name: 'LED', gruppe: 'halbleiter', praefix: 'D', pins: [{id: 'A', x: -40, y: 0}, {id: 'K', x: 40, y: 0}],
    werte: [],
    zeichen: () => L('M-40 0H-12M12 0H40') + F('M-12 -12V12L12 0Z') + L('M12 -12V12M-2 -16L6 -24M6 -14L14 -22') + F('M6 -24l-5 1l4 4zM14 -22l-5 1l4 4z'),
    wert: () => 'LED rot',
    modell: () => DIODEN.LED,
    steck: 'radial',
    ausbauen(ctx, t, p) { diodenElement(ctx, `D${t.id}`, p.A, p.K, DIODEN.LED); }
  },
  zener: {
    kurz: 'Z-Diode',
    koerper: [-12, -15, 17, 15],
    name: 'Z-Diode', gruppe: 'halbleiter', praefix: 'D', pins: [{id: 'A', x: -40, y: 0}, {id: 'K', x: 40, y: 0}],
    werte: [zahl('uz', 'Durchbruchspannung', 'V', 5.1, {min: 1, max: 200})],
    zeichen: () => L('M-40 0H-12M12 0H40') + F('M-12 -12V12L12 0Z') + L('M7 -15L12 -12V12L17 15'),
    wert: t => zeige(t, 'uz', 'V'),
    modell: t => zenerModell(t.werte.uz),
    steck: 'axial',
    ausbauen(ctx, t, p) { diodenElement(ctx, `D${t.id}`, p.A, p.K, zenerModell(t.werte.uz)); }
  },
  npn: {
    kurz: 'NPN',
    koerper: [-20, -26, 32, 26],
    name: 'NPN-Transistor', gruppe: 'halbleiter', praefix: 'T', pins: [{id: 'B', x: -40, y: 0}, {id: 'C', x: 20, y: -40}, {id: 'E', x: 20, y: 40}],
    werte: [wahl('modell', 'Modell', modellOptionen(BIPOLAR, m => m.pol === 'NPN'), 'BC847B')],
    zeichen: () => '<circle class="b" cx="6" r="26"/>' + L('M-40 0H-8M-8 -16V16M-8 -7L20 -24V-40M-8 7L20 24V40') + F('M20 24l-10 -1l5 -8z'),
    wert: t => BIPOLAR[t.werte.modell].kurz ?? BIPOLAR[t.werte.modell].name,
    modell: t => BIPOLAR[t.werte.modell],
    steck: 'to92',
    ausbauen(ctx, t, p) { bipolarElement(ctx, BIPOLAR[t.werte.modell], p.C, p.B, p.E); }
  },
  pnp: {
    kurz: 'PNP',
    koerper: [-20, -26, 32, 26],
    name: 'PNP-Transistor', gruppe: 'halbleiter', praefix: 'T', pins: [{id: 'B', x: -40, y: 0}, {id: 'C', x: 20, y: 40}, {id: 'E', x: 20, y: -40}],
    werte: [wahl('modell', 'Modell', modellOptionen(BIPOLAR, m => m.pol === 'PNP'), 'BC857B')],
    zeichen: () => '<circle class="b" cx="6" r="26"/>' + L('M-40 0H-8M-8 -16V16M-8 -7L20 -24V-40M-8 7L20 24V40') + F('M-8 -7l10 -1l-5 8z'),
    wert: t => BIPOLAR[t.werte.modell].kurz ?? BIPOLAR[t.werte.modell].name,
    modell: t => BIPOLAR[t.werte.modell],
    steck: 'to92',
    ausbauen(ctx, t, p) { bipolarElement(ctx, BIPOLAR[t.werte.modell], p.C, p.B, p.E); }
  },
  nmos: {
    kurz: 'N-MOS',
    koerper: [-20, -26, 32, 26],
    name: 'N-MOSFET', gruppe: 'halbleiter', praefix: 'M', pins: [{id: 'G', x: -40, y: 0}, {id: 'D', x: 20, y: -40}, {id: 'S', x: 20, y: 40}],
    werte: [wahl('modell', 'Modell', modellOptionen(MOSFET, m => m.pol === 'NMOS'), 'NMOS-GEN')],
    zeichen: () => '<circle class="b" cx="6" r="26"/>' + L('M-40 0H-10M-10 -14V14M-4 -16V-8M-4 -4V4M-4 8V16M-4 -12H20V-40M-4 12H20V40M-4 0H20V12') + F('M-4 0l9 -4v8z'),
    wert: t => MOSFET[t.werte.modell].kurz,
    modell: t => MOSFET[t.werte.modell],
    steck: 'to92',
    ausbauen(ctx, t, p) { ctx.add({k: 'M', id: `M${t.id}`, d: p.D, g: p.G, s: p.S, modell: MOSFET[t.werte.modell]}); }
  },
  pmos: {
    kurz: 'P-MOS',
    koerper: [-20, -26, 32, 26],
    name: 'P-MOSFET', gruppe: 'halbleiter', praefix: 'M', pins: [{id: 'G', x: -40, y: 0}, {id: 'D', x: 20, y: 40}, {id: 'S', x: 20, y: -40}],
    werte: [wahl('modell', 'Modell', modellOptionen(MOSFET, m => m.pol === 'PMOS'), 'PMOS-GEN')],
    zeichen: () => '<circle class="b" cx="6" r="26"/>' + L('M-40 0H-10M-10 -14V14M-4 -16V-8M-4 -4V4M-4 8V16M-4 -12H20V-40M-4 12H20V40M-4 0H20V-12') + F('M20 0l-9 -4v8z'),
    wert: t => MOSFET[t.werte.modell].kurz,
    modell: t => MOSFET[t.werte.modell],
    steck: 'to92',
    ausbauen(ctx, t, p) { ctx.add({k: 'M', id: `M${t.id}`, d: p.D, g: p.G, s: p.S, modell: MOSFET[t.werte.modell]}); }
  },

  /* ---------- ICs ---------- */
  opv: {
    kurz: 'OPV',
    koerper: [-40, -40, 40, 40],
    name: 'Operationsverstärker', gruppe: 'ic', praefix: 'U', pins: [{id: '+', x: -60, y: -20}, {id: '-', x: -60, y: 20}, {id: 'A', x: 60, y: 0}, {id: 'V+', x: 0, y: -40}, {id: 'V-', x: 0, y: 40}],
    werte: [wahl('modell', 'Modell', modellOptionen(OPV), 'TL07X')],
    zeichen: () => L('M-60 -20H-40M-60 20H-40M40 0H60M0 -40V-20M0 40V20') + '<path class="b" d="M-40 -40L40 0L-40 40Z"/><path class="s" d="M-40 -40L40 0L-40 40Z"/>' + '<text class="sz" x="-36" y="-15">+</text><text class="sz" x="-36" y="25">−</text>',
    wert: t => OPV[t.werte.modell].kurz,
    modell: t => OPV[t.werte.modell],
    steck: 'dip8einzeln',
    ausbauen(ctx, t, p) { opvEinheit(ctx, '', OPV[t.werte.modell], p['+'], p['-'], p.A, p['V+'], p['V-']); }
  },
  tl072: {
    kurz: 'TL072',
    koerper: [-52, -56, 52, 36],
    name: 'TL072 (zwei OPV)', gruppe: 'ic', praefix: 'U',
    pins: dipPins(['1OUT', '1IN−', '1IN+', 'VCC−', '2IN+', '2IN−', '2OUT', 'VCC+']),
    werte: [],
    zeichen() { return dipZeichen(this.pins, 'TL072'); },
    wert: () => '',
    modell: () => OPV.TL07X,
    steck: 'dip8',
    ausbauen(ctx, t, p) {
      if (ctx.belegt('1') || ctx.belegt('2') || ctx.belegt('3')) opvEinheit(ctx, 'a', OPV.TL07X, p['3'], p['2'], p['1'], p['8'], p['4']);
      if (ctx.belegt('5') || ctx.belegt('6') || ctx.belegt('7')) opvEinheit(ctx, 'b', OPV.TL07X, p['5'], p['6'], p['7'], p['8'], p['4']);
    }
  },
  cd40106: {
    kurz: 'CD40106',
    koerper: [-52, -76, 52, 76],
    name: 'CD40106 (sechs Schmitt-Inverter)', gruppe: 'ic', praefix: 'U',
    pins: dipPins(['1A', '1Y', '2A', '2Y', '3A', '3Y', 'VSS', '4Y', '4A', '5Y', '5A', '6Y', '6A', 'VDD']),
    werte: [],
    zeichen() { return dipZeichen(this.pins, 'CD40106'); },
    wert: () => '',
    modell: () => SCHMITT.CD40106,
    steck: 'dip14',
    ausbauen(ctx, t, p) {
      const gatter = [['1', '2'], ['3', '4'], ['5', '6'], ['9', '8'], ['11', '10'], ['13', '12']];
      gatter.forEach(([ein, aus], i) => {
        if (!ctx.belegt(ein)) {
          if (ctx.belegt(aus)) ctx.warnung(`${t.id}: Der Eingang von Gatter ${i + 1} (Pin ${ein}) ist offen. Dieses Gatter wird nicht gerechnet, sein Ausgang treibt nichts. In Hardware wäre ein offener CMOS-Eingang undefiniert.`);
          return;
        }
        ctx.add({k: 'ST', id: `${t.id}g${i + 1}`, ein: p[ein], aus: p[aus], vdd: p['14'], vss: p['7'], modell: SCHMITT.CD40106});
      });
    }
  },

  /* ---------- Versorgung und Quellen ---------- */
  rail: {
    kurz: 'Versorgung',
    koerper: t => t.werte.u >= 0 ? [-14, -14, 14, 0] : [-14, 0, 14, 14],
    name: 'Versorgung', gruppe: 'quelle', praefix: 'V', pins: [{id: '1', x: 0, y: 0}],
    werte: [zahl('u', 'Spannung', 'V', 12, {min: -1000, max: 1000})],
    zeichen: t => t.werte.u >= 0 ? L('M0 0V-14M-14 -14H14') : L('M0 0V14M-14 14H14'),
    wert: t => `${t.werte.u > 0 ? '+' : ''}${fmtWert(t.werte.u, 'V')}`,
    keineRef: true,
    modell: () => IDEAL('Ideale Gleichspannung gegen die gemeinsame Masse. Alle Versorgungszeichen gleicher Spannung bilden ein Netz.'),
    steck: 'schiene',
    netzName: t => railName(t.werte.u),
    ausbauen(ctx, t, p) { ctx.railQuelle(t.werte.u, p['1']); }
  },
  v: {
    kurz: 'U-Quelle',
    koerper: [-20, -20, 20, 20],
    name: 'Spannungsquelle', gruppe: 'quelle', praefix: 'V', pins: quellenPins,
    werte: [zahl('v', 'Spannung', 'V', 9, {min: -1000, max: 1000}), zahl('ri', 'Innenwiderstand', 'Ω', 0, {min: 0, max: 1e9})],
    zeichen: () => quellenKreis(L('M0 -20V20') + '<text class="sz" x="10" y="-8">+</text>'),
    wert: t => zeige(t, 'v', 'V'),
    modell: t => t.werte.ri > 0 ? {art: 'endlich', name: 'endlich', version: 'osci-audiolabor 1', quelle: '', text: 'Ideale Spannungsquelle mit Innenwiderstand.'} : IDEAL('Ideale Spannungsquelle.'),
    steck: 'extern',
    ausbauen(ctx, t, p) {
      const n = mitInnenwiderstand(ctx, t, p['+'], t.werte.ri);
      ctx.quelle({k: 'V', id: `V${t.id}`, a: n, b: p['-'], welle: {art: 'dc', v: t.werte.v}});
    }
  },
  i: {
    kurz: 'I-Quelle',
    koerper: [-20, -20, 20, 20],
    name: 'Stromquelle', gruppe: 'quelle', praefix: 'I', pins: [{id: 'a', x: 0, y: -40}, {id: 'b', x: 0, y: 40}],
    werte: [zahl('i', 'Strom', 'A', 1e-3, {min: -1000, max: 1000})],
    zeichen: () => quellenKreis(L('M0 -14V14') + F('M0 16l-5 -9h10z')),
    wert: t => zeige(t, 'i', 'A'),
    modell: () => IDEAL('Ideale Stromquelle. Der Strom fließt in Pfeilrichtung durch die Quelle.'),
    steck: 'extern',
    ausbauen(ctx, t, p) { ctx.quelle({k: 'I', id: `I${t.id}`, a: p.a, b: p.b, welle: {art: 'dc', v: t.werte.i}}); }
  },
  gen: {
    kurz: 'Generator',
    koerper: [-20, -20, 20, 20],
    name: 'Signalgenerator', gruppe: 'quelle', praefix: 'G', pins: quellenPins,
    werte: [
      wahl('form', 'Kurvenform', [['sinus', 'Sinus'], ['dreieck', 'Dreieck'], ['rechteck', 'Rechteck / Puls'], ['saege', 'Sägezahn']], 'rechteck', {liveQuelle: true}),
      zahl('f', 'Frequenz', 'Hz', 220, {min: 0.01, max: 96000, regler: 'log', liveQuelle: true}),
      zahl('amp', 'Amplitude', 'V', 5, {min: 0, max: 100, regler: true, liveQuelle: true, hilfe: 'Scheitelwert um den Offset.'}),
      zahl('off', 'Offset', 'V', 0, {min: -100, max: 100, liveQuelle: true}),
      zahl('tast', 'Pulsbreite', '%', 50, {min: 0.1, max: 99.9, liveQuelle: true, nurWenn: w => w.form === 'rechteck'}),
      zahl('flanke', 'Flankenzeit', 's', 1e-6, {min: 1e-9, max: 1e-2, nurWenn: w => w.form === 'rechteck' || w.form === 'saege', hilfe: 'Softwarewert. Live begrenzt die Abtastrate die Flanke.'}),
      zahl('ri', 'Innenwiderstand', 'Ω', 0, {min: 0, max: 1e9, hilfe: 'Softwarewert. 0 Ω ist die ideale Quelle.'})
    ],
    zeichen: t => quellenKreis({
      sinus: L('M-13 0C-9 -16 -4 -16 0 0C4 16 9 16 13 0'),
      dreieck: L('M-13 0L-6 -11L6 11L13 0'),
      rechteck: L('M-13 10V-10H0V10H13V-10'),
      saege: L('M-13 10L9 -10V10')
    }[t.werte.form] || ''),
    wert: t => `${fmtWert(t.werte.f, 'Hz')} · ${fmtWert(t.werte.amp, 'V')}`,
    modell: t => t.werte.ri > 0 ? {art: 'endlich', name: 'endlich', version: 'osci-audiolabor 1', quelle: '', text: 'Idealer Generator mit Innenwiderstand. Frequenz, Pegel und Innenwiderstand sind Softwarewerte.'} : IDEAL('Idealer Generator. Frequenz und Pegel sind Softwarewerte.'),
    steck: 'extern',
    ausbauen(ctx, t, p) {
      const n = mitInnenwiderstand(ctx, t, p['+'], t.werte.ri);
      ctx.quelle({k: 'V', id: `V${t.id}`, a: n, b: p['-'], welle: generatorWelle(t.werte), ac: 1, teilQuelle: t.id});
    }
  },
  cv: {
    kurz: 'CV',
    koerper: [-20, -20, 20, 20],
    name: 'Steuerquelle', gruppe: 'quelle', praefix: 'CV', pins: quellenPins,
    werte: [zahl('v', 'Spannung', 'V', 1, {min: -8, max: 8, regler: true, liveQuelle: true}), zahl('ri', 'Innenwiderstand', 'Ω', 0, {min: 0, max: 1e9})],
    zeichen: () => quellenKreis('<text class="sz" x="0" y="4" text-anchor="middle" font-size="11">CV</text>'),
    wert: t => zeige(t, 'v', 'V'),
    modell: () => IDEAL('Gepufferte Gleichspannung −8 V bis +8 V. Der Bereich ist ein Softwarewert.'),
    steck: 'extern',
    ausbauen(ctx, t, p) {
      const n = mitInnenwiderstand(ctx, t, p['+'], t.werte.ri);
      ctx.quelle({k: 'V', id: `V${t.id}`, a: n, b: p['-'], welle: {art: 'dc', v: t.werte.v}, teilQuelle: t.id});
    }
  },
  gate: {
    kurz: 'Gate',
    koerper: [-20, -20, 20, 20],
    name: 'Gate / Trigger / Hüllkurve', gruppe: 'quelle', praefix: 'GT', pins: quellenPins,
    werte: [
      wahl('modus', 'Betriebsart', [['gate', 'Gate'], ['trigger', 'Trigger'], ['huelle', 'Hüllkurve']], 'gate', {liveQuelle: true}),
      wahl('ausloesung', 'Auslösung', [['takt', 'Takt'], ['taster', 'Taster']], 'takt', {liveQuelle: true, hilfe: 'Mit Taster löst live die Taste aus; im Renderbetrieb gibt es ein einzelnes Ereignis.'}),
      zahl('hoch', 'Höhe', 'V', 5, {min: 0, max: 30, liveQuelle: true, hilfe: 'Softwarewert.'}),
      zahl('per', 'Wiederholung', 's', 0.5, {min: 1e-3, max: 60, liveQuelle: true, nurWenn: w => w.ausloesung !== 'taster'}),
      zahl('td', 'Erste Auslösung', 's', 0.05, {min: 0, max: 60, liveQuelle: true, nurWenn: w => w.modus !== 'huelle'}),
      zahl('gateDauer', 'Gate-Länge', 's', 0.1, {min: 1e-4, max: 60, liveQuelle: true, nurWenn: w => w.modus === 'gate'}),
      zahl('triggerDauer', 'Trigger-Länge', 's', 1e-3, {min: 1e-5, max: 1, liveQuelle: true, nurWenn: w => w.modus === 'trigger', hilfe: 'Softwarewert.'}),
      zahl('anstieg', 'Anstieg', 's', 2e-3, {min: 1e-5, max: 10, liveQuelle: true, nurWenn: w => w.modus === 'huelle'}),
      zahl('abfall', 'Abfall (τ)', 's', 0.1, {min: 1e-4, max: 60, liveQuelle: true, nurWenn: w => w.modus === 'huelle'}),
      zahl('ri', 'Innenwiderstand', 'Ω', 0, {min: 0, max: 1e9})
    ],
    zeichen: t => quellenKreis(t.werte.modus === 'huelle' ? L('M-13 10L-8 -11C-4 2 2 8 13 10') : L('M-13 10H-6V-10H6V10H13')),
    wert: t => ({gate: 'Gate', trigger: 'Trigger', huelle: 'Hüllkurve'})[t.werte.modus],
    modell: () => IDEAL('Ideale Quelle. Höhe, Dauer und Abfall sind Softwarewerte und keine gemessenen Hardwaredaten.'),
    steck: 'extern',
    ausbauen(ctx, t, p) {
      const n = mitInnenwiderstand(ctx, t, p['+'], t.werte.ri);
      ctx.quelle({k: 'V', id: `V${t.id}`, a: n, b: p['-'], welle: gateWelle(t.werte), teilQuelle: t.id});
    }
  },
  rausch: {
    kurz: 'Rauschen',
    koerper: [-20, -20, 20, 20],
    name: 'Rauschquelle', gruppe: 'quelle', praefix: 'NS', pins: quellenPins,
    werte: [
      zahl('rms', 'Effektivwert', 'V', 1, {min: 0, max: 100, regler: true, liveQuelle: true}),
      zahl('rate', 'Stützstellenrate', 'Hz', 48000, {min: 100, max: 192000, hilfe: 'Bestimmt die Bandbreite. Hohe Raten verlängern die Rechenzeit in ngspice.'}),
      zahl('seed', 'Seed', '', 1, {min: 1, max: 4294967295, ganz: true, hilfe: 'Gleicher Seed, gleiches Rauschen, in beiden Rechenwegen.'}),
      zahl('ri', 'Innenwiderstand', 'Ω', 0, {min: 0, max: 1e9})
    ],
    zeichen: () => quellenKreis(L('M-13 3L-9 -8L-5 6L-1 -11L3 9L7 -5L10 4L13 -1')),
    wert: t => `${fmtWert(t.werte.rms, 'V')} eff`,
    modell: () => IDEAL('Gaußsches Rauschen aus einer festen Zufallsfolge, linear zwischen den Stützstellen. Kein thermisches Bauteilrauschen.'),
    steck: 'extern',
    ausbauen(ctx, t, p) {
      const n = mitInnenwiderstand(ctx, t, p['+'], t.werte.ri);
      ctx.quelle({k: 'V', id: `V${t.id}`, a: n, b: p['-'], welle: {art: 'rauschen', rms: t.werte.rms, off: 0, rate: t.werte.rate, seed: t.werte.seed, dc: 0}, teilQuelle: t.id});
    }
  },
  audioein: {
    kurz: 'Digital',
    koerper: [-20, -20, 20, 20],
    name: 'Digitaler Eingang', gruppe: 'quelle', praefix: 'AE', pins: quellenPins,
    werte: [
      wahl('quelle', 'Signal', [['faust', 'Faust-Quelle'], ['datei', 'Audiodatei']], 'faust'),
      zahl('volt', 'Pegel bei Vollaussteuerung', 'V', 10, {min: 0.001, max: 100, hilfe: 'Digital 1,0 entspricht dieser Spannung. Festlegung der Software.'}),
      zahl('ri', 'Ausgangswiderstand', 'Ω', 0, {min: 0, max: 1e9, hilfe: 'Softwarewert. Die Grenze ist gepuffert: Die Schaltung wirkt nicht auf das digitale Modul zurück.'})
    ],
    zeichen: () => quellenKreis('<text class="sz" x="0" y="4" text-anchor="middle" font-size="10">DSP</text>'),
    wert: t => `1,0 → ${fmtWert(t.werte.volt, 'V')}`,
    modell: () => ({art: 'grenze', name: 'gepufferte Grenze', version: 'osci-audiolabor 1', quelle: '', text: 'Virtuelle Quelle zwischen digitalem Modul und Schaltung. Gerichtet und rückwirkungsfrei. Ein Hin und Her zwischen Faust und Schaltung wäre keine elektrische Verbindung.'}),
    steck: 'extern',
    ausbauen(ctx, t, p) {
      const n = mitInnenwiderstand(ctx, t, p['+'], t.werte.ri);
      ctx.quelle({k: 'V', id: `V${t.id}`, a: n, b: p['-'], welle: {art: 'digital', faktor: t.werte.volt, teil: t.id, dc: 0}, teilQuelle: t.id});
    }
  },

  /* ---------- Bezug und Messen ---------- */
  gnd: {
    kurz: 'Masse',
    koerper: [-14, 0, 14, 22],
    name: 'Masse', gruppe: 'mess', praefix: 'GND', pins: [{id: '1', x: 0, y: 0}],
    werte: [],
    keineRef: true,
    zeichen: () => L('M0 0V12M-14 12H14M-9 17H9M-4 22H4'),
    wert: () => '',
    modell: () => IDEAL('Bezugspunkt aller Spannungen. In der Netlist Knoten 0.'),
    steck: 'schiene',
    netzName: () => '0',
    ausbauen() {}
  },
  label: {
    kurz: 'Netzname',
    koerper: t => [0, -7, 22 + String(t.werte.name).length * 7, 7],
    name: 'Netzname', gruppe: 'mess', praefix: 'N', pins: [{id: '1', x: 0, y: 0}],
    werte: [text('name', 'Name', 'aus')],
    keineRef: true,
    zeichen: t => {
      const b = 22 + String(t.werte.name).length * 7;
      return L(`M0 0L8 -7H${b}V7H8Z`);
    },
    wert: t => t.werte.name,
    wertInnen: true,
    modell: () => IDEAL('Verbindet alle Stellen mit demselben Namen zu einem Netz, ohne sichtbaren Draht.'),
    steck: 'keins',
    netzName: t => netzTextName(t.werte.name),
    ausbauen() {}
  },
  sonde: {
    kurz: 'Sonde U',
    koerper: [7, -33, 33, -7],
    name: 'Spannungssonde', gruppe: 'mess', praefix: 'CH', pins: [{id: '1', x: 0, y: 0}],
    werte: [],
    zeichen: () => L('M0 0L10 -10') + '<circle class="b kanal" cx="20" cy="-20" r="13"/>',
    wert: () => '',
    keinWert: true,
    istMessung: true,
    modell: () => IDEAL('Misst die Spannung des Netzes gegen Masse, ohne das Netz zu belasten.'),
    steck: 'keins',
    ausbauen(ctx, t, p) { ctx.sonde({id: t.id, art: 'u', netz: p['1'], name: t.id}); }
  },
  amper: {
    kurz: 'Sonde I',
    koerper: [-16, -16, 16, 16],
    name: 'Stromsonde', gruppe: 'mess', praefix: 'A', pins: zweipol,
    werte: [],
    zeichen: () => L('M-40 0H-16M16 0H40') + '<circle class="b kanal" r="16"/><text class="sz" x="0" y="5" text-anchor="middle">A</text>',
    wert: () => '',
    keinWert: true,
    modell: () => IDEAL('Idealer Strommesser in Reihe: eine Quelle mit 0 V, deren Strom gemessen wird. Positiv von Pin 1 nach Pin 2.'),
    steck: 'axial',
    ausbauen(ctx, t, p) {
      ctx.add({k: 'V', id: `V${t.id}`, a: p['1'], b: p['2'], welle: {art: 'dc', v: 0}});
      ctx.sonde({id: t.id, art: 'i', quelle: `V${t.id}`, name: t.id});
    }
  },
  hoer: {
    kurz: 'Hörpunkt',
    koerper: [6, -24, 26, 0],
    name: 'Hörpunkt', gruppe: 'mess', praefix: 'H', pins: [{id: '1', x: 0, y: 0}],
    werte: [],
    keineRef: true,
    zeichen: () => L('M0 0L8 -8') + '<path class="f akzent" d="M8 -14h6l10 -8v22l-10 -8h-6z"/>',
    wert: () => 'hören',
    istMessung: true,
    modell: () => IDEAL('Legt fest, welche Spannung auf den Monitorweg geht. Belastet die Schaltung nicht. Es zählt ein Hörpunkt.'),
    steck: 'keins',
    ausbauen(ctx, t, p) { ctx.hoerpunkt(p['1'], t.id); }
  }
};

export function railName(u) {
  const b = Math.abs(u);
  const s = String(Number(b.toPrecision(6))).replace('.', 'v');
  return `${u < 0 ? 'm' : 'p'}${s}`;
}

/* Netzname für die Netlist: nur Buchstaben, Ziffern und Unterstrich. */
export function netzTextName(text) {
  const s = String(text ?? '').trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  if (!s) return 'netz';
  return /^[0-9]/.test(s) || s === '0' ? `n${s}` : s;
}

/* Standardwerte eines neuen Bauteils */
export function standardWerte(typ) {
  const w = {};
  for (const p of BAUTEILE[typ].werte) w[p.key] = p.def;
  return w;
}

/* Weltkoordinate eines Pins: erst spiegeln, dann drehen, Drehpunkt ist der Ursprung des Bauteils. */
export function pinOrt(teil, pin) {
  let x = pin.x, y = pin.y;
  if (teil.spiegel) x = -x;
  switch (teil.rot || 0) {
    case 90: [x, y] = [-y, x]; break;
    case 180: [x, y] = [-x, -y]; break;
    case 270: [x, y] = [y, -x]; break;
  }
  return {x: teil.x + x, y: teil.y + y};
}

function koerperVon(t) {
  const k = BAUTEILE[t.typ].koerper;
  return typeof k === 'function' ? k(t) : k;
}

/* Körper eines Bauteils in Weltkoordinaten */
export function weltRechteck(t) {
  const [a, b, c, d] = koerperVon(t);
  const p = pinOrt({...t, x: 0, y: 0}, {x: a, y: b}), q = pinOrt({...t, x: 0, y: 0}, {x: c, y: d});
  return {x0: t.x + Math.min(p.x, q.x), y0: t.y + Math.min(p.y, q.y), x1: t.x + Math.max(p.x, q.x), y1: t.y + Math.max(p.y, q.y)};
}

/* Körper und Anschlussleitungen zusammen: Das belegt ein Teil auf dem Blatt. */
export function platzVon(t) {
  const k = {...weltRechteck(t)};
  for (const pin of BAUTEILE[t.typ].pins) {
    const o = pinOrt(t, pin);
    k.x0 = Math.min(k.x0, o.x); k.y0 = Math.min(k.y0, o.y);
    k.x1 = Math.max(k.x1, o.x); k.y1 = Math.max(k.y1, o.y);
  }
  return k;
}

/* Wohin zeigt die Anschlussleitung eines Pins? 0 rechts, 1 unten, 2 links, 3 oben, in Weltkoordinaten. */
export function pinRichtung(t, pin) {
  const o = pinOrt(t, pin), k = weltRechteck(t);
  if (o.x <= k.x0) return 2;
  if (o.x >= k.x1) return 0;
  if (o.y <= k.y0) return 3;
  if (o.y >= k.y1) return 1;
  return -1;
}

export const GRUPPEN = [
  ['quelle', 'Quellen'],
  ['passiv', 'Passiv'],
  ['halbleiter', 'Halbleiter'],
  ['ic', 'ICs'],
  ['mess', 'Bezug & Messen']
];
