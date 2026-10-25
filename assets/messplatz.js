/* Messplatz (messplatz/index.html): Steckbrett mit Bauteilen und Laborkabeln, dazu Funktionsgenerator, Oszilloskop,
   zwei Multimeter und Netzgerät, außerdem Frequenzgang (Bode-Diagramm), Arbeitspunkt und Messreihe.
   Gerechnet wird mit assets/schaltung.js (Knotenanalyse wie SPICE).

   Elektrisch gilt: Ein Kabel verbindet Buchsen ideal (0 Ω). Alle Buchsen, die über Kabel zusammenhängen, bilden einen Knoten.
   Die ⏚-Buchsen von Funktionsgenerator und Oszilloskop liegen wie im echten Labor auf Schutzleiter = Masse.
   Netzgerät und Multimeter sind potentialfrei, ebenso die Sekundärseite des Trenntrafos. */
'use strict';
(() => {
const $ = id => document.getElementById(id);
if (!$('mp-board')) return;
const S = OSCISchaltung;
const fmt = (v, unit, digits) => S.formatSI(v, unit, digits).replace(/^-/, '−');
const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const num = (v, d = 3) => new Intl.NumberFormat('de-DE', {maximumSignificantDigits: d}).format(v).replace(/^-/, '−');

/* ---------- Bauteile ----------
   geom: Größe und Buchsen (ungedreht), sym: Schaltzeichen nach IEC 60617 in diesem Rahmen, ref: Kennbuchstabe (R1, C2, …).
   param: Hauptwert (e12: in E12-Schritten, lin: in festen Schritten, signed: darf negativ sein),
   rating: Grenzwerte, ab denen ein Bauteil heiß wird oder durchbrennt. */
const G2 = {w: 88, h: 40, pins: [[0, 20], [88, 20]]};
const G3 = {w: 64, h: 80, pins: [[0, 40], [48, 0], [48, 80]]};
const PARTS = {
  R: {name: 'Widerstand', ref: 'R', lex: 'widerstand', geom: G2, pinNames: ['1', '2'],
    param: {key: 'R', unit: 'Ω', min: 1, max: 22e6, init: 1000, e12: true}, rating: {P: .25},
    sym: () => '<path d="M0 20H26M62 20H88"/><rect x="26" y="13" width="36" height="14"/>'},
  C: {name: 'Kondensator', ref: 'C', lex: 'kapazitaet', geom: G2, pinNames: ['1', '2'],
    param: {key: 'C', unit: 'F', min: 1e-12, max: 1e-4, init: 100e-9, e12: true}, rating: {U: 63},
    sym: () => '<path d="M0 20H40M48 20H88M40 7V33M48 7V33" class="thick"/>'},
  E: {name: 'Elko', ref: 'C', lex: 'kapazitaet', geom: G2, pinNames: ['+', '−'],
    param: {key: 'C', unit: 'F', min: 1e-7, max: 1e-2, init: 100e-6, e12: true}, rating: {U: 25, rev: 1},
    sym: () => '<path d="M0 20H37M51 20H88"/><rect x="37" y="7" width="4" height="26"/><rect x="47" y="7" width="4" height="26" class="fill"/><path d="M27 7H33M30 4V10"/>'},
  L: {name: 'Spule', ref: 'L', lex: 'induktivitaet', geom: G2, pinNames: ['1', '2'],
    param: {key: 'L', unit: 'H', min: 1e-6, max: 10, init: 10e-3, e12: true},
    sym: () => '<path d="M0 20H24M64 20H88M24 20a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0"/>'},
  POT: {name: 'Potentiometer', ref: 'P', lex: 'spannungsteiler', geom: {w: 88, h: 56, pins: [[0, 20], [88, 20], [44, 56]]}, pinNames: ['A', 'E', 'S'],
    param: {key: 'R', unit: 'Ω', min: 100, max: 1e6, init: 10e3, e12: true}, rating: {P: .25},
    sym: () => '<path d="M0 20H26M62 20H88M44 56V31"/><rect x="26" y="13" width="36" height="14"/><path d="M39 35L44 28L49 35" class="thin"/>'},
  SW: {name: 'Schalter', ref: 'S', lex: 'widerstand', geom: G2, pinNames: ['1', '2'],
    sym: p => `<path d="M0 20H28M60 20H88"/><circle cx="28" cy="20" r="2.5" class="fill"/><circle cx="60" cy="20" r="2.5" class="fill"/><path d="${p.zu ? 'M28 20L60 19' : 'M28 20L57 6'}" class="thick"/>`},
  D: {name: 'Diode 1N4148', ref: 'D', lex: 'diode', geom: G2, pinNames: ['A', 'K'], model: '1N4148', rating: {I: .5},
    sym: () => '<path d="M0 20H32M56 20H88M56 8V32"/><path d="M32 8L56 20L32 32Z" class="fill"/>'},
  LED: {name: 'LED rot', ref: 'LED', lex: 'diode', geom: G2, pinNames: ['A', 'K'], model: 'LED', rating: {I: .05},
    sym: () => '<path d="M0 20H32M56 20H88M56 8V32"/><path d="M32 8L56 20L32 32Z" class="fill"/><path d="M50 6L58 -2M54 -2H58V2M58 8L66 0M62 0H66V4" class="thin"/>'},
  Z: {name: 'Z-Diode 5,1 V', ref: 'Z', lex: 'diode', geom: G2, pinNames: ['A', 'K'], model: 'ZD5V1', rating: {P: .5},
    sym: () => '<path d="M0 20H32M56 20H88M51 8H56V32H61"/><path d="M32 8L56 20L32 32Z" class="fill"/>'},
  NPN: {name: 'NPN BC547', ref: 'T', lex: 'transistor', geom: G3, pinNames: ['B', 'C', 'E'], model: 'BC547', pol: 1, rating: {I: .2, P: .5},
    sym: () => '<circle cx="34" cy="40" r="21" class="thin"/><path d="M0 40H25M25 27V53" /><path d="M25 34L48 21V0M25 46L48 59V80"/><path d="M40 50L48 59L36 57Z" class="fill"/>'},
  PNP: {name: 'PNP BC557', ref: 'T', lex: 'transistor', geom: G3, pinNames: ['B', 'C', 'E'], model: 'BC557', pol: -1, rating: {I: .2, P: .5},
    sym: () => '<circle cx="34" cy="40" r="21" class="thin"/><path d="M0 40H25M25 27V53" /><path d="M25 34L48 21V0M25 46L48 59V80"/><path d="M33 48L25 46L31 54Z" class="fill"/>'},
  NMOS: {name: 'MOSFET 2N7000', ref: 'T', lex: 'mosfet', geom: G3, pinNames: ['G', 'D', 'S'], model: '2N7000', rating: {I: .2, P: .4},
    sym: () => '<circle cx="34" cy="40" r="21" class="thin"/><path d="M0 40H20M20 28V52"/><path d="M26 25V33M26 36V44M26 47V55" class="thick"/><path d="M26 29H48V0M26 51H48V80M34 40H48V51"/><path d="M27 40L35 36V44Z" class="fill"/>'},
  OP: {name: 'Operationsverstärker', ref: 'OPV', lex: 'opv', geom: {w: 88, h: 64, pins: [[0, 16], [0, 48], [88, 32]]}, pinNames: ['−', '+', 'A'],
    sym: () => '<path d="M0 16H16M0 48H16M72 32H88"/><path d="M16 4V60L72 32Z"/><path d="M21 16H27M21 48H27M24 45V51" class="thin"/>'},
  TR: {name: 'Trenntrafo', ref: 'Tr', lex: 'transformator', geom: {w: 96, h: 64, pins: [[0, 12], [0, 52], [96, 12], [96, 52]]}, pinNames: ['1', '2', '3', '4'],
    param: {key: 'n', unit: '', min: .1, max: 20, init: 1, e12: true},
    sym: () => '<path d="M0 12H30M0 52H30M66 12H96M66 52H96"/><path d="M30 12a5 5 0 0 1 0 10a5 5 0 0 1 0 10a5 5 0 0 1 0 10a5 5 0 0 1 0 10M66 12a5 5 0 0 0 0 10a5 5 0 0 0 0 10a5 5 0 0 0 0 10a5 5 0 0 0 0 10"/><path d="M45 8V56M51 8V56" class="thin"/><circle cx="24" cy="5" r="2" class="fill"/><circle cx="72" cy="5" r="2" class="fill"/>'},
  V: {name: 'Spannungsquelle', ref: 'U', lex: 'quelle', geom: G2, pinNames: ['+', '−'],
    param: {key: 'V', unit: 'V', min: -100, max: 100, init: 5, lin: .5, signed: true},
    sym: () => '<path d="M0 20H88"/><circle cx="44" cy="20" r="13"/><path d="M17 7H23M20 4V10" class="thin"/>'},
  I: {name: 'Stromquelle', ref: 'I', lex: 'quelle', geom: G2, pinNames: ['1', '2'],
    param: {key: 'I', unit: 'A', min: -1, max: 1, init: 1e-3, e12: true, signed: true},
    sym: () => '<path d="M0 20H31M57 20H88M44 7V33"/><circle cx="44" cy="20" r="13"/><path d="M32 1H56M51 -3L56 1L51 5" class="thin"/>'},
  GND: {name: 'Masse', ref: '', lex: 'potential', geom: {w: 40, h: 40, pins: [[20, 0]]}, pinNames: ['⏚'],
    sym: () => '<path d="M20 0V18M7 18H33M12 25H28M17 32H23"/>'},
  /* Geräte: nur ein Anschlussfeld auf dem Brett, die Bedienung steht im Geräteregal darunter */
  FG: {name: 'Funktionsgenerator', lex: 'funktionsgenerator', instr: true, geom: {w: 128, h: 72, pins: [[128, 22], [128, 52]]}, pinNames: ['OUT', '⏚'], colors: ['red', 'black']},
  PSU: {name: 'Netzgerät', lex: 'netzgeraet', instr: true, geom: {w: 128, h: 72, pins: [[128, 22], [128, 52]]}, pinNames: ['+', '−'], colors: ['red', 'black']},
  OSZ: {name: 'Oszilloskop', lex: 'oszilloskop-messen', instr: true, geom: {w: 128, h: 100, pins: [[0, 22], [0, 50], [0, 78]]}, pinNames: ['CH1', 'CH2', '⏚'], colors: ['ch1', 'ch2', 'black']},
  DMM: {name: 'Multimeter', lex: 'multimeter', instr: true, geom: {w: 128, h: 100, pins: [[0, 22], [0, 50], [0, 78]]}, pinNames: ['VΩ', 'COM', 'A'], colors: ['red', 'black', 'red']}
};
const PALETTE = ['R', 'C', 'E', 'L', 'POT', 'SW', 'D', 'LED', 'Z', 'NPN', 'PNP', 'NMOS', 'OP', 'TR', 'V', 'I', 'GND'];
const INSTR = {fg: 'FG', psu: 'PSU', osz: 'OSZ', dmm: 'DMM', dmm2: 'DMM'};
const INSTR_NAME = {fg: 'Funktionsgenerator', psu: 'Netzgerät', osz: 'Oszilloskop', dmm: 'Multimeter 1', dmm2: 'Multimeter 2'};
const INSTR_BOARD = {fg: 'Generator', psu: 'Netzgerät', osz: 'Oszi', dmm: 'Multimeter 1', dmm2: 'Multimeter 2'};
const METERS = ['dmm', 'dmm2'];
const BOARD = {w: 1200, h: 720};
const TR = {L1: 10, kc: .999}; // Trenntrafo: 10 H Hauptinduktivität primär, Kopplung 0,999 (Streuung 0,2 %)
const PARAM_LABEL = {R: 'Widerstand', C: 'Kapazität', L: 'Induktivität', V: 'Spannung', I: 'Strom', n: 'Übersetzung ü = N₁ : N₂'};

/* Buchsen bei Drehung (rot · 90° im Uhrzeigersinn) */
function dims(part) { const g = PARTS[part.type].geom; return part.rot % 2 ? {w: g.h, h: g.w} : {w: g.w, h: g.h}; }
function rotPoint(part, [x, y]) {
  const g = PARTS[part.type].geom;
  switch (part.rot % 4) { case 1: return [g.h - y, x]; case 2: return [g.w - x, g.h - y]; case 3: return [y, g.w - x]; default: return [x, y]; }
}
function rotTransform(part) {
  const g = PARTS[part.type].geom;
  return ['', `translate(${g.h} 0) rotate(90)`, `translate(${g.w} ${g.h}) rotate(180)`, `translate(0 ${g.w}) rotate(270)`][part.rot % 4];
}
function pinPoint(key) {
  const [id, i] = key.split(':'), part = getPart(id);
  if (!part) return {x: 0, y: 0};
  const [x, y] = rotPoint(part, PARTS[part.type].geom.pins[Number(i)]);
  return {x: part.x + x, y: part.y + y};
}
const getPart = id => state.parts.find(p => p.id === id);
const wired = pin => state.wires.some(w => w.a === pin || w.b === pin);
function pinColor(key) {
  const [id, i] = key.split(':'), part = getPart(id);
  return part && PARTS[part.type].colors ? PARTS[part.type].colors[Number(i)] : '';
}
function partLabel(p) {
  const d = PARTS[p.type];
  if (p.type === 'TR') return `${num(p.p.n, 3)} : 1`;
  if (d.param) return fmt(p.p[d.param.key], d.param.unit, 3) + (p.type === 'POT' ? ` · ${Math.round(p.p.pos * 100)} %` : '');
  if (p.type === 'SW') return p.p.zu ? 'geschlossen' : 'offen';
  if (p.type === 'OP') return '±15 V';
  return d.name.replace(/^(Diode|NPN|PNP|MOSFET) /, '');
}
function partTitle(p) {
  if (PARTS[p.type].instr) return INSTR_NAME[p.id];
  return p.ref || PARTS[p.type].name;
}
function pinName(key) {
  const [id, i] = key.split(':'), p = getPart(id);
  if (!p) return key;
  const d = PARTS[p.type], pin = d.pinNames[Number(i)];
  return d.instr ? `${INSTR_NAME[p.id]} ${pin}` : p.type === 'GND' ? 'Masse' : `${p.ref}.${pin}`;
}
/* nächster freier Bezeichner: R1, R2, … (C und Elko, NPN, PNP und MOSFET zählen jeweils gemeinsam) */
function freeRef(type, parts) {
  const pre = PARTS[type].ref;
  if (!pre) return '';
  const used = new Set(parts.map(p => p.ref));
  let k = 1;
  while (used.has(pre + k)) k++;
  return pre + k;
}

/* ---------- Zustand ---------- */
const STORAGE = 'osci-log-messplatz-v1', SAVES = 'osci-log-messplatz-aufbauten';
function instruments() {
  return [
    {id: 'fg', type: 'FG', x: 24, y: 40, rot: 0, p: {}},
    {id: 'psu', type: 'PSU', x: 24, y: 560, rot: 0, p: {}},
    {id: 'osz', type: 'OSZ', x: 1048, y: 40, rot: 0, p: {}},
    {id: 'dmm2', type: 'DMM', x: 1048, y: 400, rot: 0, p: {}},
    {id: 'dmm', type: 'DMM', x: 1048, y: 540, rot: 0, p: {}}
  ];
}
const chDefault = pos => ({on: true, vdiv: 1, pos, cpl: 'DC', probe: 1, inv: false});
function defaults() {
  return {
    parts: instruments(), wires: [],
    fg: {on: true, wave: 'sine', f: 1000, vpp: 2, off: 0, duty: 50, load: 'hiz'},
    psu: {on: true, V: 5, I: .5},
    osz: {tdiv: 1e-3, ch: [chDefault(1), chDefault(-2)], trig: {src: 0, lvl: 0, slope: 1, mode: 'auto'}, xy: false, run: true, pre: .1,
      math: 'off', mdiv: 1, cur: 'off', curSrc: 0, curT: [.3, .7], curV: [.3, .7]},
    dmm: {mode: 'VDC'}, dmm2: {mode: 'VDC'},
    bode: {ref: 'ch1', fmin: 10, fmax: 1e6},
    log: [], versuch: null
  };
}
let nextId = 1;
function newPart(type, x, y, rot = 0, parts = state.parts) {
  const d = PARTS[type], p = {};
  if (d.param) p[d.param.key] = d.param.init;
  if (type === 'POT') p.pos = .5;
  if (type === 'SW') p.zu = false;
  return {id: 'p' + nextId++, type, x, y, rot, p, ref: freeRef(type, parts)};
}
const DMM_MODES = {VDC: ['V⎓', 'V'], VAC: ['V~', 'V'], ADC: ['A⎓', 'A'], AAC: ['A~', 'A'], OHM: ['Ω', 'Ω'], DIODE: ['▷|', 'V']};
const fin = v => typeof v === 'number' && Number.isFinite(v) ? v : null;
const decade = (v, lo, hi, d) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? clamp(10 ** Math.round(Math.log10(x)), lo, hi) : d; };
/* gespeicherte oder geteilte Aufbauten prüfen, bevor sie geladen werden */
function sanitize(raw) {
  try {
    if (!raw || !Array.isArray(raw.parts) || !Array.isArray(raw.wires) || raw.parts.length > 70 || raw.wires.length > 160) return null;
    const base = defaults(), parts = [], ids = new Set();
    for (const r of raw.parts) {
      if (!r || !Object.hasOwn(PARTS, r.type) || typeof r.id !== 'string' || ids.has(r.id) || !/^(p\d{1,5}|fg|psu|osz|dmm2?)$/.test(r.id)) continue;
      const isInstr = !!PARTS[r.type].instr;
      if (isInstr !== Object.hasOwn(INSTR, r.id) || (isInstr && INSTR[r.id] !== r.type)) continue;
      const d = PARTS[r.type], part = {id: r.id, type: r.type, x: clamp(Number(r.x) || 0, 0, BOARD.w - 40), y: clamp(Number(r.y) || 0, 0, BOARD.h - 40), rot: d.instr ? 0 : ((Number(r.rot) | 0) % 4 + 4) % 4, p: {}};
      if (d.param) { const v = Number(r.p?.[d.param.key]); part.p[d.param.key] = Number.isFinite(v) && (d.param.signed || v > 0) ? clamp(v, d.param.min, d.param.max) : d.param.init; }
      if (r.type === 'POT') part.p.pos = clamp(Number(r.p?.pos ?? .5) || 0, 0, 1);
      if (r.type === 'SW') part.p.zu = !!r.p?.zu;
      if (r.broken && !d.instr) part.broken = String(r.broken).slice(0, 80);
      if (!d.instr && d.ref && typeof r.ref === 'string' && r.ref.slice(0, d.ref.length) === d.ref && /^\d{1,3}$/.test(r.ref.slice(d.ref.length))) part.ref = r.ref;
      ids.add(r.id); parts.push(part);
    }
    /* Bezeichner eindeutig machen, fehlende vergeben (ältere Aufbauten hatten noch keine) */
    const seen = new Set();
    for (const p of parts) { if (p.ref && seen.has(p.ref)) delete p.ref; if (p.ref) seen.add(p.ref); }
    for (const p of parts) if (!PARTS[p.type].instr && !p.ref) { p.ref = freeRef(p.type, parts); }
    for (const inst of base.parts) if (!ids.has(inst.id)) parts.push(inst);
    const pinOk = key => { const m = /^(\w+):(\d)$/.exec(key); const part = m && parts.find(p => p.id === m[1]); return !!part && Number(m[2]) < PARTS[part.type].geom.pins.length; };
    const wires = [];
    for (const w of raw.wires) if (w && pinOk(w.a) && pinOk(w.b) && w.a !== w.b && !wires.some(x => (x.a === w.a && x.b === w.b) || (x.a === w.b && x.b === w.a))) wires.push({a: w.a, b: w.b});
    const fg = raw.fg || {}, psu = raw.psu || {}, osz = raw.osz || {}, bode = raw.bode || {};
    const pair = (a, d) => Array.isArray(a) && a.length === 2 ? a.map((x, i) => { const v = Number(x); return Number.isFinite(v) ? clamp(v, 0, 1) : d[i]; }) : d.slice();
    const meter = m => ({mode: Object.hasOwn(DMM_MODES, m?.mode) ? m.mode : 'VDC'});
    const fmin = decade(bode.fmin, .1, 1e5, 10);
    return {
      parts, wires,
      fg: {on: fg.on !== false, wave: ['sine', 'square', 'triangle', 'saw'].includes(fg.wave) ? fg.wave : 'sine', f: clamp(Number(fg.f) || 1000, .1, 1e6), vpp: clamp(Number(fg.vpp ?? 2) || 0, 0, 20), off: clamp(Number(fg.off) || 0, -10, 10), duty: clamp(Number(fg.duty) || 50, 5, 95), load: fg.load === '50' ? '50' : 'hiz'},
      psu: {on: psu.on !== false, V: clamp(Number(psu.V ?? 5) || 0, 0, 30), I: clamp(Number(psu.I) || .5, .001, 3)},
      osz: {
        tdiv: clamp(Number(osz.tdiv) || 1e-3, 1e-6, 2),
        ch: [0, 1].map(i => { const c = osz.ch?.[i] || {}, b = base.osz.ch[i]; return {on: c.on !== false, vdiv: clamp(Number(c.vdiv) || b.vdiv, 1e-3, 50), pos: clamp(Number(c.pos ?? b.pos) || 0, -4, 4), cpl: ['DC', 'AC', 'GND'].includes(c.cpl) ? c.cpl : 'DC', probe: c.probe === 10 ? 10 : 1, inv: !!c.inv}; }),
        trig: {src: osz.trig?.src === 1 ? 1 : 0, lvl: clamp(Number(osz.trig?.lvl) || 0, -200, 200), slope: osz.trig?.slope === -1 ? -1 : 1, mode: ['auto', 'normal'].includes(osz.trig?.mode) ? osz.trig.mode : 'auto'},
        xy: !!osz.xy, run: true, pre: osz.pre === .5 ? .5 : .1,
        math: ['off', 'sub', 'add'].includes(osz.math) ? osz.math : 'off', mdiv: clamp(Number(osz.mdiv) || 1, 1e-3, 50),
        cur: ['off', 't', 'v'].includes(osz.cur) ? osz.cur : 'off', curSrc: [0, 1, 2].includes(osz.curSrc) ? osz.curSrc : 0,
        curT: pair(osz.curT, [.3, .7]), curV: pair(osz.curV, [.3, .7])
      },
      dmm: meter(raw.dmm), dmm2: meter(raw.dmm2),
      bode: {ref: bode.ref === 'fg' ? 'fg' : 'ch1', fmin, fmax: Math.max(fmin * 10, decade(bode.fmax, 10, 1e7, 1e6))},
      log: Array.isArray(raw.log) ? raw.log.slice(0, 200).filter(r => r && typeof r === 'object').map(r => ({f: fin(r.f), f1: fin(r.f1), u1: fin(r.u1), u2: fin(r.u2), ph: fin(r.ph), m1: fin(r.m1), m1u: ['V', 'A', 'Ω'].includes(r.m1u) ? r.m1u : '', m2: fin(r.m2), m2u: ['V', 'A', 'Ω'].includes(r.m2u) ? r.m2u : '', v: typeof r.v === 'string' ? r.v.slice(0, 40) : ''})) : [],
      versuch: typeof raw.versuch === 'string' ? raw.versuch : null
    };
  } catch { return null; }
}
function load() { try { return sanitize(JSON.parse(localStorage.getItem(STORAGE))); } catch { return null; } }
let saveTimer = 0, anaStamp = 0;
function save() {
  anaStamp++;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch { /* ohne Speicher */ } }, 250);
}
function shared() {
  const m = location.hash.match(/^#aufbau=([\w-]+)$/);
  if (!m) return null;
  try { return sanitize(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))))); } catch { return null; }
}
const fromLink = shared();
let state = fromLink || load() || null;
let sel = null;

/* ---------- Rückgängig ---------- */
const undoStack = {past: [], future: []};
const snapshot = () => JSON.stringify({parts: state.parts, wires: state.wires});
function remember() { undoStack.past.push(snapshot()); if (undoStack.past.length > 80) undoStack.past.shift(); undoStack.future = []; updateTools(); }
function restore(text) { const s = JSON.parse(text); state.parts = s.parts; state.wires = s.wires; syncId(); sel = null; changed(true); }
function syncId() { nextId = Math.max(0, ...state.parts.filter(p => /^p\d+$/.test(p.id)).map(p => Number(p.id.slice(1)))) + 1; }

/* ---------- Versuche ----------
   Jeder Versuch baut seinen Aufbau mit einer kleinen Beschreibung: Bauteile mit Position, Kabel als Buchsenpaare,
   dazu die Geräteeinstellungen. Die Kabel-Kürzel: 'r1:0' = Buchse 0 von Bauteil r1, Geräte heißen fg, psu, osz, dmm, dmm2.
   Bezeichner (R1, C1, …) werden in der Reihenfolge der Teile vergeben. */
const VERSUCHE = [
  {id: 'messfehler', cat: 'Messtechnik', title: 'Messen belastet', kurz: 'Spannungsteiler mit Multimeter: Warum zeigt es nicht 5 V?',
    teile: [['r1', 'R', 440, 300, 1, {R: 1e6}], ['r2', 'R', 440, 460, 1, {R: 1e6}], ['g', 'GND', 280, 640]],
    kabel: [['psu:0', 'r1:0'], ['r1:1', 'r2:0'], ['r2:1', 'psu:1'], ['psu:1', 'g:0'], ['dmm:0', 'r1:1'], ['dmm:1', 'r2:1']],
    geraete: {psu: {on: true, V: 10, I: .1}, dmm: {mode: 'VDC'}, fg: {on: false}},
    aufgaben: ['Zwei gleiche Widerstände an 10 V — erwartet sind 5 V am unteren. Was zeigt Multimeter 1?', 'Wähle beide Widerstände mit 1 kΩ statt 1 MΩ. Warum stimmt die Messung jetzt?', 'Miss gleichzeitig den Strom: Kabel vom Netzgerät lösen und Multimeter 2 mit A und COM in Reihe schalten (Modus A⎓).'],
    theorie: 'Ein Digitalmultimeter misst Spannung mit $R_i = 10\\,\\mathrm{M\\Omega}$ Innenwiderstand. Der liegt parallel zu $R_2$: $R_2 \\parallel R_i = 909\\,\\mathrm{k\\Omega}$, also $U_2 = 10\\,\\mathrm{V} \\cdot \\frac{909}{1909} = 4{,}76\\,\\mathrm{V}$. Messgeräte verändern immer ein wenig, was sie messen — nur bei kleinen Widerständen fällt es nicht auf.'},
  {id: 'tastkopf', cat: 'Messtechnik', title: 'Tastkopf ×1 oder ×10', kurz: 'Ein hochohmiger Teiler zeigt, wie sehr der Tastkopf die Schaltung belastet.',
    teile: [['r1', 'R', 420, 120, 1, {R: 1e6}], ['r2', 'R', 420, 300, 1, {R: 1e6}], ['g', 'GND', 420, 460]],
    kabel: [['fg:0', 'r1:0'], ['r1:1', 'r2:0'], ['r2:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'r1:1']],
    geraete: {fg: {on: true, wave: 'square', f: 1000, vpp: 2, off: 1, duty: 50}, psu: {on: false}, osz: {tdiv: 100e-6, ch: [{vdiv: .5, pos: -2, probe: 1}, {vdiv: .5, pos: -2, probe: 1}], trig: {src: 0, lvl: 1, slope: 1}}},
    aufgaben: ['Der Teiler aus zwei 1-MΩ-Widerständen sollte die Hälfte liefern, also 1 V Spitze-Spitze. Was zeigt CH2 — Höhe und Form?', 'Stell CH2 auf ×10. Warum wird das Signal größer und die Flanke steiler?', 'Lies die Anstiegszeit (10 → 90 %) unter dem Schirm ab, für ×1 und für ×10, und vergleiche mit 2,2 τ.'],
    theorie: 'Der Tastkopf liegt parallel zu $R_2$: ×1 heißt $1\\,\\mathrm{M\\Omega} \\parallel 100\\,\\mathrm{pF}$ (Eingang plus Kabel), ×10 heißt $10\\,\\mathrm{M\\Omega} \\parallel 12\\,\\mathrm{pF}$. Mit ×1 bleibt vom Teiler $\\frac{R_2 \\parallel R_T}{R_1 + R_2 \\parallel R_T} = \\frac{1}{3}$ statt $\\frac{1}{2}$, die Zeitkonstante ist $\\tau = (R_1 \\parallel R_2 \\parallel R_T)\\,C_T \\approx 33\\,\\mathrm{\\mu s}$. Mit ×10 sind es $0{,}476$ und $\\tau \\approx 5{,}7\\,\\mathrm{\\mu s}$. Die Teilung 10 : 1 rechnet das Oszilloskop selbst heraus.'},
  {id: 'sprung', cat: 'Grundlagen', title: 'RC-Sprungantwort', kurz: 'Rechteck auf einen Tiefpass: die Zeitkonstante τ messen.',
    teile: [['r', 'R', 420, 120, 0, {R: 1000}], ['c', 'C', 640, 220, 1, {C: 1e-6}], ['g', 'GND', 640, 360]],
    kabel: [['fg:0', 'r:0'], ['r:1', 'c:0'], ['c:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'r:1']],
    geraete: {fg: {on: true, wave: 'square', f: 100, vpp: 4, off: 2, duty: 50}, psu: {on: false}, osz: {tdiv: 2e-3, ch: [{vdiv: 1, pos: -3}, {vdiv: 1, pos: -3}], trig: {src: 0, lvl: 2, slope: 1}}},
    aufgaben: ['CH1 zeigt den Sprung am Eingang, CH2 die Kondensatorspannung. Stell die Zeit-Cursor auf Flanke und 63 % (2,53 V): Das ist τ.', 'Verdopple R oder C: Wie ändert sich τ?', 'Stell 1 kHz ein: Der Kondensator wird nicht mehr voll — das Signal wird zum Dreieck verschliffen.'],
    theorie: 'Laden: $u_C(t) = U_0\\,(1 - e^{-t/\\tau})$ mit $\\tau = RC$. Achtung: Der Generator hat $50\\,\\Omega$ Innenwiderstand, die liegen mit in Reihe: $\\tau = 1050\\,\\Omega \\cdot 1\\,\\mathrm{\\mu F} = 1{,}05\\,\\mathrm{ms}$. Die Anstiegszeit 10 → 90 % ist $t_r = \\tau \\ln 9 \\approx 2{,}2\\,\\tau$.'},
  {id: 'frequenzgang', cat: 'Filter', title: 'Tiefpass: Betrag und Phase', kurz: 'Sinus durch RC: Amplitudenverhältnis, Phase und Lissajous-Figur.',
    teile: [['r', 'R', 420, 120, 0, {R: 1000}], ['c', 'C', 640, 220, 1, {C: 100e-9}], ['g', 'GND', 640, 360]],
    kabel: [['fg:0', 'r:0'], ['r:1', 'c:0'], ['c:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'r:1']],
    geraete: {fg: {on: true, wave: 'sine', f: 1000, vpp: 4, off: 0}, psu: {on: false}, osz: {tdiv: 200e-6, ch: [{vdiv: 1, pos: 0}, {vdiv: 1, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}, bode: {fmin: 10, fmax: 1e6}},
    aufgaben: ['Lies unter dem Schirm ab: Verhältnis der Spitze-Spitze-Werte und die Phase von CH2 gegenüber CH1.', 'Such die Frequenz, bei der CH2 nur noch 0,707 von CH1 hat. Wie groß ist die Phase dort?', 'Notiere fünf Frequenzen zwischen 100 Hz und 10 kHz mit „＋ Messreihe“. Im Frequenzgang unten liegen die Punkte auf der gerechneten Kurve.', 'Schalte auf XY: Die Ellipse ist die Lissajous-Figur. Bei 0° wäre sie eine Gerade, bei 90° ein Kreis.'],
    theorie: '$\\underline{H} = \\frac{1}{1 + j\\omega RC}$, also $|\\underline{H}| = 1/\\sqrt{1 + (\\omega RC)^2}$ und $\\varphi = -\\arctan(\\omega RC)$. CH1 misst direkt an der Generatorbuchse, dadurch kürzen sich dessen 50 Ω aus dem Verhältnis heraus: $f_g = \\frac{1}{2\\pi RC} \\approx 1{,}59\\,\\mathrm{kHz}$, dort $-45°$. Darüber fällt der Betrag mit $-20\\,\\mathrm{dB}$ pro Dekade.'},
  {id: 'schwingkreis', cat: 'Grundlagen', title: 'Reihenschwingkreis', kurz: 'R, L, C in Reihe: Resonanz suchen und Ausschwingen beobachten.',
    teile: [['r', 'R', 760, 300, 1, {R: 10}], ['l', 'L', 380, 120, 0, {L: 10e-3}], ['c', 'C', 580, 120, 0, {C: 100e-9}], ['g', 'GND', 760, 460]],
    kabel: [['fg:0', 'l:0'], ['l:1', 'c:0'], ['c:1', 'r:0'], ['r:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'r:0']],
    geraete: {fg: {on: true, wave: 'sine', f: 4000, vpp: 4, off: 0}, psu: {on: false}, osz: {tdiv: 100e-6, ch: [{vdiv: 1, pos: 2}, {vdiv: .5, pos: -2}], trig: {src: 0, lvl: 0, slope: 1}}, bode: {fmin: 100, fmax: 1e5}},
    aufgaben: ['CH2 misst die Spannung an R — sie ist proportional zum Strom. Dreh die Frequenz, bis CH2 am größten ist und die Phase 0° wird.', 'Im Frequenzgang mit Bezug CH1 ist die Güte viel höher als mit Bezug Generator. Warum?', 'Rechteck mit 200 Hz und 2 ms/div: Jetzt siehst du die gedämpfte Schwingung nach jeder Flanke.'],
    theorie: 'Resonanz bei $f_0 = \\frac{1}{2\\pi\\sqrt{LC}} = 5{,}03\\,\\mathrm{kHz}$. Die Güte $Q = \\frac{1}{R_\\text{ges}}\\sqrt{L/C}$ hängt am Gesamtwiderstand. Bezogen auf die Generatorbuchse (CH1) zählt nur $R = 10\\,\\Omega$: $Q \\approx 32$. Was die Schaltung wirklich dämpft, sind $10\\,\\Omega + 50\\,\\Omega$ Innenwiderstand: $Q \\approx 5{,}3$ — das zeigt der Bezug Generator und das Ausschwingen.'},
  {id: 'gleichrichter', cat: 'Dioden', title: 'Gleichrichter mit Glättung', kurz: 'Diode und Elko machen aus Wechsel- eine wellige Gleichspannung.',
    teile: [['d', 'D', 380, 120, 0], ['e', 'E', 600, 220, 1, {C: 100e-6}], ['rl', 'R', 760, 220, 1, {R: 1000}], ['g', 'GND', 680, 380]],
    kabel: [['fg:0', 'd:0'], ['d:1', 'e:0'], ['e:0', 'rl:0'], ['e:1', 'g:0'], ['rl:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'd:1']],
    geraete: {fg: {on: true, wave: 'sine', f: 50, vpp: 20, off: 0}, psu: {on: false}, osz: {tdiv: 10e-3, ch: [{vdiv: 5, pos: 0}, {vdiv: 5, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['Lies die Brummspannung ab (Spitze-Spitze von CH2). Stell CH2 dazu auf AC und 0,5 V/div.', 'Verdopple die Kapazität: Wie ändert sich das Brummen?', 'Warum erreicht CH2 nie den Scheitelwert von CH1? (Zwei Gründe.)'],
    theorie: 'Zwischen den Ladepulsen entlädt die Last den Elko: $\\Delta U \\approx \\frac{I_L}{f\\,C}$. Die Spitze liegt unter $\\hat{u}$, weil an der Diode rund 0,7 V abfallen und die Ladeströme am Innenwiderstand des Generators (50 Ω) Spannung kosten.'},
  {id: 'graetz', cat: 'Dioden', title: 'Brückengleichrichter mit Trafo', kurz: 'Vier Dioden nutzen beide Halbwellen; der Trenntrafo macht die Messung erst möglich.',
    teile: [['tr', 'TR', 250, 120, 0, {n: 1}], ['d1', 'D', 460, 60, 0], ['d2', 'D', 460, 180, 0], ['d3', 'D', 460, 320, 2], ['d4', 'D', 460, 440, 2], ['e', 'E', 660, 200, 1, {C: 100e-6}], ['rl', 'R', 800, 200, 1, {R: 1000}], ['g', 'GND', 660, 480]],
    kabel: [['fg:0', 'tr:0'], ['tr:1', 'fg:1'], ['tr:2', 'd1:0'], ['tr:3', 'd2:0'], ['tr:2', 'd3:1'], ['tr:3', 'd4:1'], ['d1:1', 'e:0'], ['d2:1', 'e:0'], ['e:0', 'rl:0'], ['d3:0', 'e:1'], ['d4:0', 'e:1'], ['e:1', 'rl:1'], ['e:1', 'g:0'],
      ['osz:0', 'e:0'], ['osz:1', 'tr:2'], ['dmm:0', 'rl:0'], ['dmm:1', 'rl:1'], ['dmm2:0', 'rl:0'], ['dmm2:1', 'rl:1']],
    geraete: {fg: {on: true, wave: 'sine', f: 50, vpp: 20, off: 0}, psu: {on: false}, dmm: {mode: 'VDC'}, dmm2: {mode: 'VAC'}, osz: {tdiv: 5e-3, ch: [{vdiv: 2, pos: -3}, {vdiv: 5, pos: -1}], trig: {src: 1, lvl: 1, slope: 1}}},
    aufgaben: ['CH1 zeigt die Ausgangsspannung. Stell CH1 auf AC und 0,2 V/div: Mit welcher Frequenz brummt es — und warum doppelt so schnell wie beim einfachen Gleichrichter?', 'Multimeter 1 misst den Gleichanteil, Multimeter 2 (V~) den Effektivwert des Brummens. Vergleiche mit der Abschätzung unten.', 'Ersetze den Trafo durch zwei Kabel (Generator direkt an die Brücke). Was zeigt das Oszi jetzt, und wohin fließt der Strom in der negativen Halbwelle?'],
    theorie: 'In jeder Halbwelle leiten zwei Dioden in Reihe: Die Spitze liegt um etwa $2 \\cdot 0{,}7\\,\\mathrm{V}$ unter dem Scheitelwert, und der Elko wird $2f = 100\\,\\mathrm{Hz}$ oft nachgeladen. Damit halbiert sich das Brummen bei gleicher Last: $\\Delta U \\approx \\frac{I_L}{2fC} \\approx \\frac{7\\,\\mathrm{mA}}{100\\,\\mathrm{Hz} \\cdot 100\\,\\mathrm{\\mu F}} = 0{,}7\\,\\mathrm{V}$ Spitze-Spitze. Das ist eine obere Grenze: Die Formel tut so, als würde der Elko die ganze Halbperiode entladen. Weil Generator (50 Ω) und Trafo die Ladepulse in die Länge ziehen, bleibt weniger Zeit zum Entladen — gemessen sind es eher 0,45 V. Aus demselben Grund liegt die Spitze noch etwas unter $\\hat{u} - 1{,}4\\,\\mathrm{V}$. Die Sekundärseite des Trafos hat keine Verbindung zur Erde — nur deshalb darf die Masseklemme des Oszis an den Minuspol der Brücke. Ohne Trafo liegt eine Generatorklemme schon auf Erde, und die Masseklemme schließt über den Schutzleiter eine Diode kurz.'},
  {id: 'kennlinie', cat: 'Dioden', title: 'Diodenkennlinie im XY-Betrieb', kurz: 'Spannung nach rechts, Strom nach oben: Das Oszi zeichnet die Kennlinie direkt.',
    teile: [['tr', 'TR', 250, 160, 0, {n: 1}], ['d', 'D', 480, 120, 0], ['r', 'R', 640, 160, 1, {R: 100}], ['g', 'GND', 640, 320]],
    kabel: [['fg:0', 'tr:0'], ['tr:1', 'fg:1'], ['tr:2', 'd:0'], ['d:1', 'r:0'], ['r:0', 'g:0'], ['r:1', 'tr:3'], ['osz:0', 'd:0'], ['osz:1', 'r:1']],
    geraete: {fg: {on: true, wave: 'triangle', f: 50, vpp: 12, off: 0}, psu: {on: false}, osz: {tdiv: 5e-3, xy: true, ch: [{vdiv: 1, pos: 2}, {vdiv: 1, pos: -2, inv: true}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['CH1 misst die Diodenspannung (x), CH2 den Strom als Spannung am 100-Ω-Widerstand (y, invertiert): 1 V/div sind 10 mA/div. Ab welcher Spannung fließt merklich Strom?', 'Warum hängt die Masse zwischen Diode und Widerstand — und warum geht das nur mit dem Trenntrafo?', 'Tausch die Diode gegen die LED und gegen die Z-Diode. Wo liegen Knick und Durchbruch?'],
    theorie: 'Mit der Masse zwischen Diode und Widerstand misst CH1 direkt $U_D$ und CH2 die Spannung $-R\\,I_D$ am Widerstand; INV macht daraus $+R\\,I_D$. Das geht nur, weil die Sekundärseite des Trafos keinen Bezug zur Erde hat. Nach Shockley ist $I_D = I_S\\,(e^{U_D/(n U_T)} - 1)$: Bei $10\\,\\mathrm{mA}$ liegen an der 1N4148 etwa $0{,}69\\,\\mathrm{V}$, je Dekade Strom kommen $n U_T \\ln 10 \\approx 0{,}10\\,\\mathrm{V}$ dazu.'},
  {id: 'zdiode', cat: 'Dioden', title: 'Z-Diode stabilisiert', kurz: 'Eine Z-Diode hält die Spannung, auch wenn das Netzgerät schwankt.',
    teile: [['r', 'R', 380, 120, 0, {R: 470}], ['z', 'Z', 600, 260, 3], ['p', 'POT', 760, 240, 1, {R: 10e3}], ['g', 'GND', 600, 460]],
    kabel: [['psu:0', 'r:0'], ['r:1', 'z:1'], ['z:0', 'g:0'], ['psu:1', 'g:0'], ['r:1', 'p:0'], ['p:2', 'g:0'], ['dmm:0', 'z:1'], ['dmm:1', 'z:0']],
    geraete: {psu: {on: true, V: 12, I: .2}, fg: {on: false}, dmm: {mode: 'VDC'}},
    aufgaben: ['Verstelle das Netzgerät zwischen 7 und 15 V. Wie stark ändert sich die Spannung an der Z-Diode?', 'Dreh das Poti (die Last) herunter. Ab wann bricht die Spannung ein?', 'Berechne den Strom durch den Vorwiderstand und vergleiche mit dem Netzgerät-Display und dem Tab „Arbeitspunkt“.'],
    theorie: 'Im Durchbruch fließt fast beliebig viel Strom bei fast gleicher Spannung $U_Z \\approx 5{,}1\\,\\mathrm{V}$. Der Vorwiderstand nimmt die Differenz auf: $I_R = (U - U_Z)/R$. Dieser Strom teilt sich auf Z-Diode und Last auf — wird die Last zu groß, bleibt für die Z-Diode nichts übrig.'},
  {id: 'transistor', cat: 'Transistor', title: 'Transistor als Schalter', kurz: 'Ein kleiner Basisstrom schaltet einen großen Kollektorstrom.',
    teile: [['s', 'SW', 300, 300, 0], ['rb', 'R', 460, 300, 0, {R: 10e3}], ['q', 'NPN', 640, 260, 0], ['led', 'LED', 664, 140, 3], ['rc', 'R', 520, 100, 0, {R: 220}], ['g', 'GND', 664, 420]],
    kabel: [['psu:0', 's:0'], ['s:1', 'rb:0'], ['rb:1', 'q:0'], ['psu:0', 'rc:0'], ['rc:1', 'led:0'], ['led:1', 'q:1'], ['q:2', 'g:0'], ['psu:1', 'g:0'], ['dmm:0', 'q:1'], ['dmm:1', 'q:2']],
    geraete: {psu: {on: true, V: 5, I: .5}, fg: {on: false}, dmm: {mode: 'VDC'}},
    aufgaben: ['Leg den Schalter um (im Inspektor oder per Doppelklick): Die LED geht an. Was zeigt das Multimeter an der Kollektor-Emitter-Strecke?', 'Wähle den Basiswiderstand mit 1 MΩ: Reicht der Basisstrom noch? Der Inspektor zeigt den Bereich (aktiv oder Sättigung).', 'Wähle den Kollektorwiderstand mit 22 Ω: Was passiert mit der LED?'],
    theorie: 'Durchgeschaltet fällt am Transistor nur $U_{CE,sat}$ von etwa 0,1 V ab. Der Kollektorstrom ist durch $R_C$ und LED begrenzt: $I_C \\approx \\frac{5\\,\\mathrm{V} - 1{,}8\\,\\mathrm{V}}{220\\,\\Omega} \\approx 14\\,\\mathrm{mA}$. Dafür braucht es nur $I_B > I_C/B$, also einige zehn Mikroampere.'},
  {id: 'emitter', cat: 'Transistor', title: 'Emitterschaltung', kurz: 'Ein Transistor verstärkt kleine Wechselspannungen: Arbeitspunkt, Verstärkung, Bandbreite.',
    teile: [['r1', 'R', 420, 60, 1, {R: 47e3}], ['r2', 'R', 420, 300, 1, {R: 10e3}], ['rc', 'R', 620, 40, 1, {R: 4700}], ['q', 'NPN', 592, 180, 0], ['re', 'R', 620, 300, 1, {R: 1000}], ['ce', 'E', 720, 300, 1, {C: 100e-6}], ['cin', 'E', 260, 200, 2, {C: 10e-6}], ['cout', 'E', 740, 120, 0, {C: 10e-6}], ['g', 'GND', 520, 460]],
    kabel: [['psu:0', 'r1:0'], ['r1:0', 'rc:0'], ['r1:1', 'q:0'], ['r2:0', 'q:0'], ['r2:1', 'g:0'], ['rc:1', 'q:1'], ['q:2', 're:0'], ['re:1', 'g:0'], ['q:2', 'ce:0'], ['ce:1', 'g:0'], ['psu:1', 'g:0'],
      ['fg:0', 'cin:1'], ['cin:0', 'q:0'], ['q:1', 'cout:0'], ['osz:0', 'fg:0'], ['osz:1', 'cout:1']],
    geraete: {psu: {on: true, V: 12, I: .1}, fg: {on: true, wave: 'sine', f: 1000, vpp: .01, off: 0}, osz: {tdiv: 500e-6, ch: [{vdiv: 5e-3, pos: 0}, {vdiv: 1, pos: 0, cpl: 'AC'}], trig: {src: 0, lvl: 0, slope: 1}}, bode: {fmin: 1, fmax: 1e7}},
    aufgaben: ['Warte, bis die Kondensatoren geladen sind (etwa eine halbe Sekunde). Wie groß ist die Verstärkung CH2/CH1, und welche Phase hat der Ausgang?', 'CH2 steht auf AC. Schalt auf DC: Warum wandert die Spur so langsam zur Mitte? (Hinter dem Koppelkondensator hängt nur der Tastkopf.)', 'Rechne den Arbeitspunkt nach (Basisteiler, U_BE ≈ 0,65 V) und vergleiche mit dem Tab „Arbeitspunkt“ unten.', 'Öffne den Frequenzgang: Wo liegen untere und obere Grenzfrequenz? Schalte CH2 auf ×10 — warum steigt die obere?', 'Entferne den Emitterkondensator: Die Verstärkung fällt auf etwa R_C/R_E.'],
    theorie: 'Der Basisteiler legt $U_B \\approx 12\\,\\mathrm{V} \\cdot \\frac{10}{57} = 2{,}1\\,\\mathrm{V}$ fest, am Emitter liegen rund $1{,}4\\,\\mathrm{V}$: $I_C \\approx 1{,}4\\,\\mathrm{mA}$, $U_C \\approx 5{,}4\\,\\mathrm{V}$. Mit überbrücktem Emitterwiderstand ist $v \\approx -g_m R_C$ mit $g_m = I_C/U_T \\approx 54\\,\\mathrm{mS}$, also etwa $-250$. Ohne $C_E$ wirkt $R_E$ als Gegenkopplung: $v \\approx -\\frac{R_C}{R_E + 1/g_m} \\approx -4{,}6$. Die untere Grenzfrequenz setzt $C_E$, weil er gegen nur $1/g_m \\approx 18\\,\\Omega$ arbeiten muss: $f_u \\approx \\frac{1}{2\\pi \\cdot 18\\,\\Omega \\cdot C_E} \\approx 90\\,\\mathrm{Hz}$. Oben begrenzt die Kapazität am Ausgang: $f_o \\approx \\frac{1}{2\\pi R_C\\,(C_T + C_{BC})}$, mit dem ×1-Tastkopf (100 pF) gut 300 kHz. Der Koppelkondensator am Ausgang lädt sich nur über den Tastkopf um: $\\tau = 10\\,\\mathrm{\\mu F} \\cdot 1\\,\\mathrm{M\\Omega} = 10\\,\\mathrm{s}$.'},
  {id: 'mosfet', cat: 'Transistor', title: 'MOSFET schaltet eine Spule', kurz: 'Beim Abschalten wehrt sich die Induktivität — die Freilaufdiode fängt sie ab.',
    teile: [['l', 'L', 620, 40, 1, {L: 1}], ['rl', 'R', 620, 160, 1, {R: 1000}], ['d', 'D', 740, 80, 3], ['q', 'NMOS', 592, 300, 0], ['rg', 'R', 400, 320, 0, {R: 100}], ['g', 'GND', 620, 460]],
    kabel: [['psu:0', 'l:0'], ['l:1', 'rl:0'], ['rl:1', 'q:1'], ['psu:0', 'd:1'], ['d:0', 'q:1'], ['fg:0', 'rg:0'], ['rg:1', 'q:0'], ['q:2', 'g:0'], ['psu:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'q:1']],
    geraete: {psu: {on: true, V: 12, I: .5}, fg: {on: true, wave: 'square', f: 100, vpp: 5, off: 2.5, duty: 50}, osz: {tdiv: 1e-3, pre: .5, ch: [{vdiv: 2, pos: -3}, {vdiv: 5, pos: -3}], trig: {src: 0, lvl: 2.5, slope: -1}}},
    aufgaben: ['CH1 zeigt das Gate, CH2 den Drain; getriggert wird auf das Abschalten. Was passiert am Drain in diesem Moment?', 'Entferne die Freilaufdiode (× am Bauteil) und stell CH2 auf 20 V/div. Wie hoch steigt die Spannung jetzt?', 'Miss mit den Zeit-Cursorn, wie lange der Strom nach dem Abschalten noch durch die Diode fließt, und vergleiche mit τ = L/R.'],
    theorie: 'L1 und R1 sind zusammen eine Relaisspule: 1 H mit 1 kΩ Drahtwiderstand. Eine Spule hält ihren Strom fest: $u_L = L\\,\\frac{\\mathrm{d}i}{\\mathrm{d}t}$. Sperrt der MOSFET, fließt der Strom $I \\approx \\frac{12\\,\\mathrm{V}}{1\\,\\mathrm{k\\Omega} + R_{DS,on}} \\approx 12\\,\\mathrm{mA}$ über die Freilaufdiode weiter und klingt mit $\\tau = L/R = 1\\,\\mathrm{ms}$ ab; der Drain liegt dabei nur eine Diodenspannung über $12\\,\\mathrm{V}$. Ohne Diode steigt die Drainspannung, bis der MOSFET im Avalanche-Durchbruch leitet (hier bei etwa 60 V) — die Energie $\\frac{1}{2} L I^2$ landet dann im Transistor.'},
  {id: 'opv', cat: 'OPV', title: 'Invertierender Verstärker', kurz: 'Ein OPV verstärkt zehnfach — bis er an seine Versorgung stößt.',
    teile: [['ri', 'R', 340, 200, 0, {R: 1000}], ['rf', 'R', 540, 100, 0, {R: 10e3}], ['op', 'OP', 540, 220, 0], ['g', 'GND', 460, 380]],
    kabel: [['fg:0', 'ri:0'], ['ri:1', 'op:0'], ['op:0', 'rf:0'], ['rf:1', 'op:2'], ['op:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'op:2']],
    geraete: {fg: {on: true, wave: 'sine', f: 1000, vpp: 1, off: 0}, psu: {on: false}, osz: {tdiv: 200e-6, ch: [{vdiv: .5, pos: 0}, {vdiv: 5, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}, bode: {fmin: 10, fmax: 1e7}},
    aufgaben: ['Vergleiche die Amplituden: Wie groß ist die Verstärkung, und welche Phase hat der Ausgang?', 'Erhöhe die Generator-Amplitude auf 3 V: Der Ausgang wird bei rund ±13,5 V abgeschnitten.', 'Stell 100 kHz ein: Die Verstärkung sinkt — das Verstärkungs-Bandbreite-Produkt (1 MHz) begrenzt. Der Frequenzgang zeigt die Grenzfrequenz direkt.'],
    theorie: 'Der OPV regelt seinen Ausgang so, dass zwischen + und − fast keine Spannung liegt. Der −-Eingang ist damit eine „virtuelle Masse“: $V = -\\frac{R_f}{R_i} = -10$. Bei hohen Frequenzen bleibt nur $|V| \\approx \\frac{f_T}{f\\,(1 + R_f/R_i)}$ übrig, mit $f_T = 1\\,\\mathrm{MHz}$; die Grenzfrequenz liegt bei $f_T/11 \\approx 91\\,\\mathrm{kHz}$.'},
  {id: 'integrator', cat: 'OPV', title: 'OPV-Integrator', kurz: 'Aus Rechteck wird Dreieck: Ein Kondensator in der Rückkopplung integriert.',
    teile: [['ri', 'R', 340, 200, 0, {R: 10e3}], ['cf', 'C', 540, 110, 0, {C: 10e-9}], ['rp', 'R', 540, 30, 0, {R: 1e6}], ['op', 'OP', 540, 220, 0], ['g', 'GND', 460, 380]],
    kabel: [['fg:0', 'ri:0'], ['ri:1', 'op:0'], ['op:0', 'cf:0'], ['cf:1', 'op:2'], ['op:0', 'rp:0'], ['rp:1', 'op:2'], ['op:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'op:2']],
    geraete: {fg: {on: true, wave: 'square', f: 1000, vpp: 2, off: 0, duty: 50}, psu: {on: false}, osz: {tdiv: 200e-6, ch: [{vdiv: 1, pos: 2}, {vdiv: 2, pos: -2}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['Miss die Spitze-Spitze-Spannung des Dreiecks und vergleiche mit der Formel.', 'Halbiere die Frequenz: Was passiert mit der Dreieck-Amplitude?', 'Wozu ist der 1-MΩ-Widerstand parallel zum Kondensator da? Entferne ihn und warte.'],
    theorie: 'Der Strom $u_e/R$ lädt den Kondensator: $u_a = -\\frac{1}{RC}\\int u_e\\,\\mathrm{d}t$. Bei ±1 V für je 0,5 ms und $RC = 100\\,\\mathrm{\\mu s}$ ergibt das $5\\,\\mathrm{V}$ Spitze-Spitze. Ohne Parallelwiderstand integriert der OPV auch jeden kleinen Gleichanteil auf, bis er in die Sättigung läuft.'},
  {id: 'schmitt', cat: 'OPV', title: 'Schmitt-Trigger', kurz: 'Mitkopplung macht aus dem OPV einen Schalter mit zwei Schwellen.',
    teile: [['op', 'OP', 540, 220, 0], ['r1', 'R', 560, 340, 0, {R: 10e3}], ['r2', 'R', 440, 360, 1, {R: 4700}], ['g', 'GND', 440, 520]],
    kabel: [['fg:0', 'op:0'], ['op:2', 'r1:1'], ['r1:0', 'op:1'], ['op:1', 'r2:0'], ['r2:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'op:2']],
    geraete: {fg: {on: true, wave: 'triangle', f: 100, vpp: 12, off: 0}, psu: {on: false}, osz: {tdiv: 2e-3, ch: [{vdiv: 2, pos: 0}, {vdiv: 5, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['Bei welchen Eingangsspannungen kippt der Ausgang? Stell die Zeit-Cursor auf beide Kippstellen und lies CH1 dort ab.', 'Schalte auf XY: Die Hystereseschleife zeigt beide Schwellen auf einen Blick.', 'Ändere R2. Wie hängen die Schwellen davon ab?'],
    theorie: 'Der +-Eingang bekommt über den Teiler einen Teil der Ausgangsspannung: $U_+ = U_A \\cdot \\frac{R_2}{R_1 + R_2}$. Der Ausgang kippt, sobald der −-Eingang diese Schwelle überschreitet. Bei $U_A \\approx \\pm 13{,}5\\,\\mathrm{V}$, $R_1 = 10\\,\\mathrm{k\\Omega}$ und $R_2 = 4{,}7\\,\\mathrm{k\\Omega}$ liegen die Schwellen bei $\\pm 4{,}3\\,\\mathrm{V}$. Weil es zwei Schwellen gibt, schaltet ein verrauschtes Signal nicht mehrfach hin und her.'},
  {id: 'sallenkey', cat: 'Filter', title: 'Aktiver Tiefpass 2. Ordnung', kurz: 'Sallen-Key mit OPV: doppelt so steil wie ein RC-Glied.',
    teile: [['r1', 'R', 300, 200, 0, {R: 10e3}], ['r2', 'R', 440, 200, 0, {R: 10e3}], ['c1', 'C', 440, 80, 0, {C: 22e-9}], ['c2', 'C', 520, 300, 1, {C: 10e-9}], ['op', 'OP', 620, 180, 0], ['g', 'GND', 520, 460]],
    kabel: [['fg:0', 'r1:0'], ['r1:1', 'r2:0'], ['r2:1', 'op:1'], ['op:1', 'c2:0'], ['c2:1', 'g:0'], ['r1:1', 'c1:0'], ['c1:1', 'op:2'], ['op:2', 'op:0'], ['osz:0', 'fg:0'], ['osz:1', 'op:2']],
    geraete: {fg: {on: true, wave: 'sine', f: 1000, vpp: 2, off: 0}, psu: {on: false}, osz: {tdiv: 200e-6, ch: [{vdiv: .5, pos: 0}, {vdiv: .5, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}, bode: {fmin: 10, fmax: 1e6}},
    aufgaben: ['Öffne den Frequenzgang unten: Wo liegt die Grenzfrequenz, und wie steil fällt der Betrag danach ab?', 'Miss bei 1 kHz Amplitudenverhältnis und Phase am Oszilloskop und notiere den Punkt mit „＋ Messreihe“. Passt er zur Kurve?', 'Tausch C1 gegen 47 nF: Die Güte steigt, vor der Grenzfrequenz entsteht eine Überhöhung.', 'Oberhalb von etwa 60 kHz steigt der Betrag wieder an. Wodurch?'],
    theorie: '$\\underline{H} = \\frac{1}{1 + j\\omega C_2 (R_1 + R_2) + (j\\omega)^2 R_1 R_2 C_1 C_2}$, mit $C_1$ in der Rückkopplung und $C_2$ am +-Eingang. Mit $R_1 = R_2 = 10\\,\\mathrm{k\\Omega}$, $C_1 = 22\\,\\mathrm{nF}$, $C_2 = 10\\,\\mathrm{nF}$: $f_0 = \\frac{1}{2\\pi\\sqrt{R_1 R_2 C_1 C_2}} \\approx 1{,}07\\,\\mathrm{kHz}$ und $Q = \\frac{1}{2}\\sqrt{C_1/C_2} \\approx 0{,}74$, fast Butterworth ($Q = 0{,}707$). Der −3-dB-Punkt liegt deshalb knapp über $f_0$, bei etwa 1,12 kHz; darüber fällt der Betrag mit $-40\\,\\mathrm{dB}$ pro Dekade — aber nur bis etwa 60 kHz. Dann steigt er wieder: Der OPV verliert seine Schleifenverstärkung, sein Ausgang wird hochohmiger, und das Signal schlüpft über $R_1$ und $C_1$ direkt zum Ausgang. Echte Sallen-Key-Filter zeigen das genauso.'}
];
function buildVersuch(v) {
  const s = defaults(), map = {};
  nextId = 1;
  for (const [key, type, x, y, rot = 0, p = {}] of v.teile) { const part = newPart(type, x, y, rot, s.parts); Object.assign(part.p, p); map[key] = part.id; s.parts.push(part); }
  const pin = ref => { const [k, i] = ref.split(':'); return (map[k] || k) + ':' + i; };
  s.wires = v.kabel.map(([a, b]) => ({a: pin(a), b: pin(b)}));
  const g = v.geraete;
  Object.assign(s.fg, g.fg || {}); Object.assign(s.psu, g.psu || {}); Object.assign(s.dmm, g.dmm || {}); Object.assign(s.dmm2, g.dmm2 || {});
  if (g.osz) {
    const o = g.osz;
    for (const k of ['tdiv', 'xy', 'pre', 'math', 'mdiv']) if (o[k] !== undefined) s.osz[k] = o[k];
    o.ch?.forEach((c, i) => Object.assign(s.osz.ch[i], c));
    if (o.trig) Object.assign(s.osz.trig, o.trig);
  }
  if (g.bode) Object.assign(s.bode, g.bode);
  if (state) { s.log = state.log; s.bode.ref = state.bode.ref; } // die Messreihe bleibt
  s.versuch = v.id;
  return s;
}
if (!state) state = buildVersuch(VERSUCHE.find(v => v.id === 'sprung'));
syncId();

/* ---------- Brett zeichnen ---------- */
const board = $('mp-board'), partsEl = $('mp-parts'), wiresEl = $('mp-wires'), cutsEl = $('mp-cuts'), scrollEl = $('mp-scroll');
let zoom = 1;
function symbolSvg(part) {
  const d = PARTS[part.type], {w, h} = dims(part);
  return `<svg class="mp-sym" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><g transform="${rotTransform(part)}">${d.sym(part.p)}</g></svg>`;
}
function instrumentInner(part) {
  const d = PARTS[part.type];
  const left = part.type === 'OSZ' || part.type === 'DMM';
  const labels = d.geom.pins.map(([x, y], i) => `<span class="mp-pinlabel ${left ? 'l' : 'r'}" style="top:${y}px">${d.pinNames[i]}</span>`).join('');
  return `<span class="mp-instr-name">${INSTR_BOARD[part.id]}</span><span class="mp-instr-state" data-instr-state="${part.id}"></span>${labels}`;
}
/* Beschriftung auf die erste Seite ohne Buchse: unten, rechts, oben, links */
function labelSide(part) {
  const {w, h} = dims(part), pins = PARTS[part.type].geom.pins.map(pt => rotPoint(part, pt));
  const spots = [['b', w / 2, h], ['r', w, h / 2], ['t', w / 2, 0], ['l', 0, h / 2]];
  return (spots.find(([, x, y]) => pins.every(([px, py]) => Math.hypot(px - x, py - y) > 22)) || spots[0])[0];
}
function partHtml(part) {
  const d = PARTS[part.type], {w, h} = dims(part), title = partTitle(part);
  const sockets = d.geom.pins.map((pt, i) => {
    const [x, y] = rotPoint(part, pt), key = `${part.id}:${i}`, color = d.colors ? d.colors[i] : '';
    return `<button type="button" class="mp-sock ${color}${pending === key ? ' pending' : ''}" data-pin="${key}" style="left:${x}px;top:${y}px" aria-label="${esc(pinName(key))}" title="${esc(pinName(key))}"></button>`;
  }).join('');
  const inner = d.instr ? instrumentInner(part) : `${symbolSvg(part)}<span class="mp-val ${labelSide(part)}">${part.ref ? `<b>${esc(part.ref)}</b> ` : ''}${esc(partLabel(part))}</span>`;
  const remove = d.instr ? '' : `<button type="button" class="mp-x" data-remove="${part.id}" aria-label="${esc(title)} entfernen">×</button>`;
  return `<div class="mp-part mp-${part.type.toLowerCase()}${part.rot % 2 ? ' v' : ''}${d.instr ? ' mp-instr' : ''}${sel === part.id ? ' selected' : ''}${part.broken ? ' broken' : ''}" data-id="${part.id}" style="left:${part.x}px;top:${part.y}px;width:${w}px;height:${h}px">
    <div class="mp-grab" data-grab="${part.id}" tabindex="0" role="button" aria-label="${esc(title)}, ${esc(d.name)} ${esc(partLabel(part))}: auswählen und verschieben">${inner}</div>${remove}${sockets}</div>`;
}
function renderParts() {
  partsEl.innerHTML = state.parts.map(partHtml).join('');
  drawWires(true);
  renderInspector();
  liveBoard(true);
}

/* ---------- Kabel: Seile wie im Crashtest-Labor (Verlet), mit festen Elementen pro Kabel ---------- */
const ROPE_SEGMENTS = 12, GRAVITY = 1400;
const ropes = new Map(), wireEls = new Map();
let ropeFrame = 0, ropeLast = 0;
const wireKey = w => `${w.a}|${w.b}`;
const ropeLength = (a, b) => Math.hypot(b.x - a.x, b.y - a.y) * 1.06 + 40;
function makeRope(a, b, lift = 1) {
  const d = Math.hypot(b.x - a.x, b.y - a.y), L = ropeLength(a, b), sag = Math.sqrt(Math.max(0, L * L - d * d)) * .42 * lift, pts = [];
  for (let i = 0; i <= ROPE_SEGMENTS; i++) { const t = i / ROPE_SEGMENTS, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t + sag * 4 * t * (1 - t); pts.push({x, y, px: x, py: y}); }
  return {pts};
}
function simulateRopes(dt) {
  let energy = 0;
  for (const w of state.wires) {
    const rope = ropes.get(wireKey(w));
    if (!rope) continue;
    const a = pinPoint(w.a), b = pinPoint(w.b), pts = rope.pts, n = pts.length - 1, seg = ropeLength(a, b) / n;
    pts[0].x = a.x; pts[0].y = a.y; pts[n].x = b.x; pts[n].y = b.y;
    for (let i = 1; i < n; i++) {
      const p = pts[i], vx = (p.x - p.px) * .985, vy = (p.y - p.py) * .985;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + GRAVITY * dt * dt;
      energy += vx * vx + vy * vy;
    }
    for (let k = 0; k < 14; k++) for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[i + 1], dx = q.x - p.x, dy = q.y - p.y, dist = Math.hypot(dx, dy) || 1e-6;
      if (dist <= seg) continue;
      const f = (dist - seg) / dist, wp = i === 0 ? 0 : i + 1 === n ? 1 : .5, wq = i + 1 === n ? 0 : i === 0 ? 1 : .5;
      p.x += dx * f * wp; p.y += dy * f * wp; q.x -= dx * f * wq; q.y -= dy * f * wq;
    }
  }
  return energy;
}
function ropePath(pts) {
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2; d += ` Q${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`; }
  const last = pts[pts.length - 1];
  return d + ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
}
function wireColor(w) {
  const c = [pinColor(w.a), pinColor(w.b)];
  return c.includes('ch1') ? 'ch1' : c.includes('ch2') ? 'ch2' : c.includes('red') ? 'red' : c.includes('black') ? 'black' : '';
}
function paintWires() {
  const seen = new Set();
  for (const w of state.wires) {
    const key = wireKey(w), rope = ropes.get(key);
    if (!rope) continue;
    seen.add(key);
    let el = wireEls.get(key);
    if (!el) {
      el = {path: document.createElementNS(SVG_NS, 'path'), a: document.createElementNS(SVG_NS, 'circle'), b: document.createElementNS(SVG_NS, 'circle'), cut: document.createElement('button')};
      for (const c of [el.a, el.b]) c.setAttribute('r', 5);
      el.cut.type = 'button'; el.cut.className = 'mp-cut'; el.cut.textContent = '×'; el.cut.title = 'Kabel abziehen';
      wiresEl.append(el.path, el.a, el.b); cutsEl.append(el.cut);
      wireEls.set(key, el);
    }
    const color = wireColor(w), active = sel && (w.a.startsWith(sel + ':') || w.b.startsWith(sel + ':'));
    el.path.setAttribute('class', `mp-wire ${color}${active ? ' active' : ''}`);
    el.a.setAttribute('class', `mp-plug ${color}`); el.b.setAttribute('class', `mp-plug ${color}`);
    const pts = rope.pts, first = pts[0], last = pts[pts.length - 1], mid = pts[pts.length >> 1];
    el.path.setAttribute('d', ropePath(pts));
    el.a.setAttribute('cx', first.x.toFixed(1)); el.a.setAttribute('cy', first.y.toFixed(1));
    el.b.setAttribute('cx', last.x.toFixed(1)); el.b.setAttribute('cy', last.y.toFixed(1));
    el.cut.style.left = `${mid.x.toFixed(1)}px`; el.cut.style.top = `${mid.y.toFixed(1)}px`;
    el.cut.dataset.wire = key; el.cut.classList.toggle('active', !!active);
    el.cut.setAttribute('aria-label', `Kabel ${pinName(w.a)} – ${pinName(w.b)} abziehen`);
  }
  for (const [key, el] of wireEls) if (!seen.has(key)) { el.path.remove(); el.a.remove(); el.b.remove(); el.cut.remove(); wireEls.delete(key); }
  let draft = wiresEl.querySelector('.mp-draft');
  if (wireDrag?.moved) {
    if (!draft) { draft = document.createElementNS(SVG_NS, 'path'); draft.setAttribute('class', 'mp-wire mp-draft'); wiresEl.append(draft); }
    const a = pinPoint(wireDrag.pin), b = wireDrag.point, sag = Math.min(80, Math.hypot(b.x - a.x, b.y - a.y) * .25);
    draft.setAttribute('d', `M${a.x},${a.y} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 + sag} ${b.x},${b.y}`);
  } else draft?.remove();
}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function ropeTick(time) {
  const dt = Math.min(.033, Math.max(.001, (time - ropeLast) / 1000 || .016));
  ropeLast = time;
  const energy = simulateRopes(dt);
  paintWires();
  ropeFrame = energy > .03 || dragging || wireDrag ? requestAnimationFrame(ropeTick) : 0;
}
function drawWires(newOnes) {
  const keys = new Set(state.wires.map(wireKey));
  for (const key of ropes.keys()) if (!keys.has(key)) ropes.delete(key);
  for (const w of state.wires) {
    const key = wireKey(w);
    if (reducedMotion.matches) { ropes.set(key, makeRope(pinPoint(w.a), pinPoint(w.b))); continue; }
    if (!ropes.has(key)) ropes.set(key, makeRope(pinPoint(w.a), pinPoint(w.b), newOnes ? 1 : .3));
  }
  if (reducedMotion.matches) { paintWires(); return; }
  if (!ropeFrame) { ropeLast = performance.now(); ropeFrame = requestAnimationFrame(ropeTick); }
}

/* ---------- Bedienen: verschieben, verbinden, auswählen ---------- */
let dragging = null, wireDrag = null, pending = null;
const capture = (el, ev) => { try { el.setPointerCapture(ev.pointerId); } catch { /* Zeiger schon weg: dann eben ohne Capture */ } };
function boardPoint(ev) { const r = board.getBoundingClientRect(); return {x: (ev.clientX - r.left) / zoom, y: (ev.clientY - r.top) / zoom}; }
partsEl.addEventListener('pointerdown', ev => {
  const sock = ev.target.closest('[data-pin]');
  if (sock) {
    ev.preventDefault();
    wireDrag = {pin: sock.dataset.pin, start: {x: ev.clientX, y: ev.clientY}, point: boardPoint(ev), moved: false, pointer: ev.pointerId};
    capture(board, ev);
    return;
  }
  const grab = ev.target.closest('[data-grab]');
  if (!grab || ev.button !== 0) return;
  const part = getPart(grab.dataset.grab);
  dragging = {part, start: {x: ev.clientX, y: ev.clientY}, x: part.x, y: part.y, moved: false, el: grab.closest('.mp-part')};
  capture(board, ev);
});
board.addEventListener('pointermove', ev => {
  if (wireDrag) {
    wireDrag.point = boardPoint(ev);
    if (!wireDrag.moved && Math.hypot(ev.clientX - wireDrag.start.x, ev.clientY - wireDrag.start.y) > 6) wireDrag.moved = true;
    if (wireDrag.moved) {
      const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-pin]');
      partsEl.querySelectorAll('.mp-sock.target').forEach(s => s.classList.toggle('target', s === over));
      if (over && over.dataset.pin !== wireDrag.pin) over.classList.add('target');
      drawWires();
    }
    return;
  }
  if (!dragging) return;
  const dx = (ev.clientX - dragging.start.x) / zoom, dy = (ev.clientY - dragging.start.y) / zoom;
  if (!dragging.moved && Math.hypot(dx, dy) < 4) return;
  if (!dragging.moved) { dragging.moved = true; remember(); }
  const {w, h} = dims(dragging.part);
  dragging.part.x = clamp(Math.round((dragging.x + dx) / 4) * 4, 0, BOARD.w - w);
  dragging.part.y = clamp(Math.round((dragging.y + dy) / 4) * 4, 0, BOARD.h - h);
  dragging.el.style.left = dragging.part.x + 'px'; dragging.el.style.top = dragging.part.y + 'px';
  drawWires();
});
function endPointer(ev) {
  if (wireDrag) {
    const wd = wireDrag; wireDrag = null;
    partsEl.querySelectorAll('.mp-sock.target').forEach(s => s.classList.remove('target'));
    if (wd.moved) {
      const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-pin]');
      if (over && over.dataset.pin !== wd.pin) connect(wd.pin, over.dataset.pin);
      else hint('Kabel ins Leere gezogen. Zieh es auf eine andere Buchse.');
      paintWires();
    } else tapSocket(wd.pin);
    return;
  }
  if (!dragging) return;
  const d = dragging; dragging = null;
  if (d.moved) { save(); drawWires(); }
  else select(d.part.id);
}
board.addEventListener('pointerup', endPointer);
board.addEventListener('pointercancel', () => { wireDrag = null; dragging = null; paintWires(); });
/* Antippen: erst eine Buchse, dann die zweite (für Touch und Tastatur) */
function tapSocket(pin) {
  if (!pending) { pending = pin; hint(`${pinName(pin)} gewählt. Jetzt die zweite Buchse antippen.`); markPending(); return; }
  if (pending === pin) { pending = null; hint('Abgebrochen.'); markPending(); return; }
  const a = pending; pending = null; markPending(); connect(a, pin);
}
function markPending() { partsEl.querySelectorAll('.mp-sock').forEach(s => s.classList.toggle('pending', s.dataset.pin === pending)); }
function connect(a, b) {
  if (state.wires.some(w => (w.a === a && w.b === b) || (w.a === b && w.b === a))) { hint('Diese Buchsen sind schon verbunden.'); return; }
  if (state.wires.length >= 160) { hint('Mehr Kabel passen nicht aufs Brett.'); return; }
  remember();
  state.wires.push({a, b});
  hint(`Kabel: ${pinName(a)} → ${pinName(b)}`);
  changed();
  drawWires(false);
}
cutsEl.addEventListener('click', ev => {
  const cut = ev.target.closest('[data-wire]');
  if (!cut) return;
  const i = state.wires.findIndex(w => wireKey(w) === cut.dataset.wire);
  if (i < 0) return;
  remember();
  const [w] = state.wires.splice(i, 1);
  hint(`Kabel ${pinName(w.a)} – ${pinName(w.b)} abgezogen. ↶ steckt es wieder an.`);
  changed();
});
cutsEl.addEventListener('pointerdown', ev => { if (ev.target.closest('[data-wire]')) ev.stopPropagation(); });
partsEl.addEventListener('click', ev => {
  const rm = ev.target.closest('[data-remove]');
  if (rm) removePart(rm.dataset.remove);
  const sock = ev.target.closest('[data-pin]');
  if (sock && ev.detail === 0) tapSocket(sock.dataset.pin); // Tastatur: Enter auf einer Buchse
});
board.addEventListener('pointerdown', ev => {
  if (ev.target.closest('.mp-part, .mp-cut')) return;
  if (pending) { pending = null; markPending(); }
  if (sel) { sel = null; partsEl.querySelectorAll('.mp-part.selected').forEach(el => el.classList.remove('selected')); renderInspector(); paintWires(); }
});
partsEl.addEventListener('dblclick', ev => {
  const grab = ev.target.closest('[data-grab]'), part = grab && getPart(grab.dataset.grab);
  if (part?.type === 'SW') toggleSwitch(part);
});
partsEl.addEventListener('keydown', ev => {
  const grab = ev.target.closest('[data-grab]');
  if (!grab) return;
  const part = getPart(grab.dataset.grab);
  if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (part.type === 'SW' && sel === part.id) toggleSwitch(part); else select(part.id); }
  else if ((ev.key === 'Delete' || ev.key === 'Backspace') && !PARTS[part.type].instr) { ev.preventDefault(); removePart(part.id); }
  else if (ev.key === 'r' || ev.key === 'R') { ev.preventDefault(); rotate(part); }
  else if (ev.key.startsWith('Arrow')) {
    ev.preventDefault(); remember();
    const step = ev.shiftKey ? 40 : 8, {w, h} = dims(part);
    if (ev.key === 'ArrowLeft') part.x = clamp(part.x - step, 0, BOARD.w - w);
    if (ev.key === 'ArrowRight') part.x = clamp(part.x + step, 0, BOARD.w - w);
    if (ev.key === 'ArrowUp') part.y = clamp(part.y - step, 0, BOARD.h - h);
    if (ev.key === 'ArrowDown') part.y = clamp(part.y + step, 0, BOARD.h - h);
    const el = grab.closest('.mp-part'); el.style.left = part.x + 'px'; el.style.top = part.y + 'px';
    drawWires(); save();
  }
});
function select(id) {
  sel = id;
  partsEl.querySelectorAll('.mp-part').forEach(el => el.classList.toggle('selected', el.dataset.id === sel));
  renderInspector(); paintWires();
}
function removePart(id) {
  const part = getPart(id);
  if (!part || PARTS[part.type].instr) return;
  remember();
  state.parts = state.parts.filter(p => p.id !== id);
  state.wires = state.wires.filter(w => !w.a.startsWith(id + ':') && !w.b.startsWith(id + ':'));
  if (sel === id) sel = null;
  hint(`${part.ref ? `${part.ref} (${PARTS[part.type].name})` : PARTS[part.type].name} entfernt. ↶ holt es zurück.`);
  changed(true);
}
function rotate(part) {
  if (PARTS[part.type].instr) return;
  remember();
  part.rot = (part.rot + 1) % 4;
  const {w, h} = dims(part);
  part.x = clamp(part.x, 0, BOARD.w - w); part.y = clamp(part.y, 0, BOARD.h - h);
  for (const wr of state.wires) if (wr.a.startsWith(part.id + ':') || wr.b.startsWith(part.id + ':')) ropes.delete(wireKey(wr));
  changed(true);
}
function toggleSwitch(part) { remember(); part.p.zu = !part.p.zu; hint(part.p.zu ? `${part.ref} geschlossen.` : `${part.ref} offen.`); changed(true); }
function addPart(type) {
  if (state.parts.length >= 70) { hint('Das Brett ist voll.'); return; }
  remember();
  const g = PARTS[type].geom, vx = scrollEl.scrollLeft / zoom + scrollEl.clientWidth / zoom / 2, vy = scrollEl.scrollTop / zoom + scrollEl.clientHeight / zoom / 2;
  let x = clamp(Math.round((vx - g.w / 2) / 8) * 8, 0, BOARD.w - g.w), y = clamp(Math.round((vy - g.h / 2) / 8) * 8, 0, BOARD.h - g.h);
  const free = (px, py) => !state.parts.some(p => { const d = dims(p); return px < p.x + d.w + 28 && px + g.w + 28 > p.x && py < p.y + d.h + 36 && py + g.h + 36 > p.y; });
  for (let k = 1; k < 60 && !free(x, y); k++) { const ring = Math.ceil(k / 8), a = k * Math.PI / 4; x = clamp(Math.round((vx - g.w / 2 + Math.cos(a) * ring * 120) / 8) * 8, 0, BOARD.w - g.w); y = clamp(Math.round((vy - g.h / 2 + Math.sin(a) * ring * 80) / 8) * 8, 0, BOARD.h - g.h); }
  const part = newPart(type, x, y);
  state.parts.push(part);
  sel = part.id;
  hint(`${part.ref || PARTS[type].name} eingesetzt. Zieh von einer Buchse ein Kabel zur nächsten.`);
  changed(true);
}

/* ---------- Inspektor: Werte ändern, drehen, live messen ---------- */
const inspector = $('mp-inspector');
function renderInspector() {
  const part = sel && getPart(sel);
  if (!part) { inspector.innerHTML = '<p class="mp-insp-empty">Bauteil antippen: Werte ändern, drehen, Spannung und Strom ablesen.</p>'; return; }
  const d = PARTS[part.type];
  let controls = '';
  if (d.param) {
    const k = d.param.key;
    controls += `<div class="mp-field"><label for="mp-val">${PARAM_LABEL[k]}</label>
      <div class="mp-stepper"><button type="button" class="button small" data-step="-1" aria-label="kleiner">−</button><input id="mp-val" class="mp-input" value="${esc(fmt(part.p[k], d.param.unit, 4))}" inputmode="text" spellcheck="false"><button type="button" class="button small" data-step="1" aria-label="größer">+</button></div></div>`;
  }
  if (part.type === 'POT') controls += `<div class="mp-field"><label for="mp-pos">Schleifer</label><input id="mp-pos" type="range" min="0" max="100" value="${Math.round(part.p.pos * 100)}"></div>`;
  if (part.type === 'SW') controls += `<button type="button" class="button small" data-toggle-sw>${part.p.zu ? 'Öffnen' : 'Schließen'}</button>`;
  const tools = d.instr ? '' : `<button type="button" class="button small" data-rotate>⟳ Drehen</button><button type="button" class="button small" data-del>Entfernen</button>`;
  const broken = part.broken ? `<p class="mp-broken">${esc(part.broken)} <button type="button" class="button small" data-repair>Ersetzen</button></p>` : '';
  const note = {TR: 'Primär 1–2, sekundär 3–4, Punkte = Wicklungsanfang. 10 H Hauptinduktivität, Kopplung 0,999. Sekundärseite potentialfrei.',
    I: 'Ideal: treibt ihren Strom von 1 nach 2 durch die Quelle, egal welche Spannung dafür nötig ist.',
    V: 'Ideal: 0 Ω Innenwiderstand. Zwei parallel oder ein Kurzschluss machen die Schaltung unlösbar.',
    NMOS: 'n-Kanal, Anreicherung. U_th = 2,1 V, Bodydiode S → D bricht bei 60 V durch.',
    OP: 'Versorgung ±15 V intern, Ausgang bis ±13,5 V und ±25 mA.'}[part.type];
  inspector.innerHTML = `<header><b>${esc(partTitle(part))}</b> · ${esc(d.name)} <button type="button" class="lex-q" data-lex="${d.lex}" aria-label="${esc(d.name)} im Lexikon">?</button></header>
    ${broken}${d.instr ? `<p class="mp-insp-empty">Bedienung im Geräteregal unten. Buchsen: ${d.pinNames.join(', ')}.</p>` : ''}
    <div class="mp-insp-controls">${controls}${tools}</div>${note ? `<p class="mp-insp-note">${esc(note)}</p>` : ''}<dl class="mp-live" id="mp-live"></dl>`;
}
function stepParam(part, dir) {
  const d = PARTS[part.type].param, k = d.key, v = part.p[k];
  let nv;
  if (d.lin) nv = Number((v + dir * d.lin).toFixed(6));
  else if (v === 0) nv = dir * Math.abs(d.init);
  else if (v < 0) nv = -S.stepE12(-v, -dir);
  else nv = S.stepE12(v, dir);
  part.p[k] = clamp(nv, d.min, d.max);
}
inspector.addEventListener('click', ev => {
  const part = sel && getPart(sel);
  if (!part) return;
  const t = ev.target;
  if (t.closest('[data-step]')) { remember(); stepParam(part, Number(t.closest('[data-step]').dataset.step)); changed(true); }
  else if (t.closest('[data-rotate]')) rotate(part);
  else if (t.closest('[data-del]')) removePart(part.id);
  else if (t.closest('[data-toggle-sw]')) toggleSwitch(part);
  else if (t.closest('[data-repair]')) { remember(); delete part.broken; hint(`${partTitle(part)} ersetzt.`); changed(true); }
});
inspector.addEventListener('change', ev => {
  const part = sel && getPart(sel);
  if (!part || ev.target.id !== 'mp-val') return;
  const d = PARTS[part.type].param, v = S.parseSI(ev.target.value.replace(/[−–]/g, '-'));
  if (!Number.isFinite(v) || (!d.signed && v <= 0)) { hint(`„${ev.target.value}“ verstehe ich nicht. Beispiele: 4k7, 100n, 2.2u, 10m${d.signed ? ', -5' : ''}`); ev.target.value = fmt(part.p[d.key], d.unit, 4); return; }
  remember(); part.p[d.key] = clamp(v, d.min, d.max); changed(true);
});
inspector.addEventListener('input', ev => {
  const part = sel && getPart(sel);
  if (part && ev.target.id === 'mp-pos') { part.p.pos = Number(ev.target.value) / 100; const val = partsEl.querySelector(`[data-id="${part.id}"] .mp-val`); if (val) val.innerHTML = `<b>${esc(part.ref)}</b> ${esc(partLabel(part))}`; dirty = true; save(); }
});
inspector.addEventListener('keydown', ev => { if (ev.target.id === 'mp-val' && ev.key === 'Enter') ev.target.blur(); });

/* ---------- Schaltung → Netzliste ---------- */
let net = null, dirty = true;
function buildNet(opts = {}) {
  const parent = new Map();
  const find = k => { while (parent.get(k) !== k) { parent.set(k, parent.get(parent.get(k))); k = parent.get(k); } return k; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  for (const p of state.parts) PARTS[p.type].geom.pins.forEach((_, i) => parent.set(`${p.id}:${i}`, `${p.id}:${i}`));
  parent.set('GND', 'GND');
  for (const p of state.parts) {
    if (p.type === 'GND') union(`${p.id}:0`, 'GND');
    if (p.type === 'FG') union('fg:1', 'GND');
    if (p.type === 'OSZ') union('osz:2', 'GND');
  }
  for (const w of state.wires) if (parent.has(w.a) && parent.has(w.b)) union(w.a, w.b);
  const ids = new Map([[find('GND'), 0]]);
  let N = 0;
  const node = key => { const r = find(key); if (!ids.has(r)) ids.set(r, ++N); return ids.get(r); };
  const n = (p, i) => node(`${p.id}:${i}`);
  const devices = [], f = state.fg, ps = state.psu, emf = f.load === '50' ? 2 : 1;
  for (const p of state.parts) {
    if (p.broken) continue;
    const id = p.id;
    switch (p.type) {
      case 'R': devices.push({k: 'R', id, n: [n(p, 0), n(p, 1)], R: p.p.R}); break;
      case 'C': case 'E': devices.push({k: 'C', id, n: [n(p, 0), n(p, 1)], C: p.p.C}); break;
      case 'L': devices.push({k: 'L', id, n: [n(p, 0), n(p, 1)], L: p.p.L}); break;
      case 'D': case 'LED': case 'Z': devices.push({k: 'D', id, n: [n(p, 0), n(p, 1)], m: PARTS[p.type].model}); break;
      case 'SW': devices.push({k: 'R', id, n: [n(p, 0), n(p, 1)], R: p.p.zu ? .01 : 1e12}); break;
      case 'POT': devices.push({k: 'R', id: id + '.a', n: [n(p, 0), n(p, 2)], R: Math.max(1, p.p.R * p.p.pos)}, {k: 'R', id: id + '.b', n: [n(p, 2), n(p, 1)], R: Math.max(1, p.p.R * (1 - p.p.pos))}); break;
      case 'OP': devices.push({k: 'OP', id, n: [n(p, 1), n(p, 0), n(p, 2)], m: 'OPV'}); break;
      case 'NPN': case 'PNP': {
        /* Sperrschicht- und Diffusionskapazitäten als feste Werte genähert (BC547: C_BC ≈ 4 pF) */
        const c = n(p, 1), b = n(p, 0), e = n(p, 2);
        devices.push({k: 'Q', id, n: [c, b, e], m: PARTS[p.type].model, pol: PARTS[p.type].pol}, {k: 'C', id: id + '.cbe', n: [b, e], C: 25e-12}, {k: 'C', id: id + '.cbc', n: [b, c], C: 4e-12});
        break;
      }
      case 'NMOS': {
        const dr = n(p, 1), g = n(p, 0), s = n(p, 2);
        devices.push({k: 'M', id, n: [dr, g, s], m: '2N7000', pol: 1}, {k: 'D', id: id + '.body', n: [s, dr], m: 'BODY'}, {k: 'C', id: id + '.cgs', n: [g, s], C: 20e-12}, {k: 'C', id: id + '.cgd', n: [g, dr], C: 5e-12});
        break;
      }
      case 'TR': devices.push({k: 'K', id, n: [n(p, 0), n(p, 1), n(p, 2), n(p, 3)], L1: TR.L1, L2: TR.L1 / p.p.n ** 2, kc: TR.kc}); break;
      case 'V': devices.push({k: 'V', id, n: [n(p, 0), n(p, 1)], V: p.p.V}); break;
      case 'I': devices.push({k: 'I', id, n: [n(p, 0), n(p, 1)], I: p.p.I}); break;
      case 'FG': if (f.on || opts.fg) devices.push({k: 'NS', id: 'fg', n: [n(p, 0)], G: 1 / 50, e: fgValue, dc: emf * f.off}); break;
      case 'PSU': if (ps.on) devices.push({k: 'LS', id: 'psu', n: [n(p, 0), n(p, 1)], V: ps.V, I: ps.I, Rs: .01}); break;
      case 'OSZ': state.osz.ch.forEach((ch, c) => { const x10 = ch.probe === 10; devices.push({k: 'R', id: `osz.${c + 1}`, n: [n(p, c), 0], R: x10 ? 10e6 : 1e6}, {k: 'C', id: `osz.c${c + 1}`, n: [n(p, c), 0], C: x10 ? 12e-12 : 100e-12}); }); break;
      case 'DMM': {
        const m = mt[id], mode = state[id].mode;
        devices.push({k: 'R', id: id + '.A', n: [n(p, 2), n(p, 1)], R: m.fuse ? SHUNT : 1e12});
        if (mode === 'OHM' || mode === 'DIODE') devices.push({k: 'LS', id: id + '.src', n: [n(p, 0), n(p, 1)], V: mode === 'DIODE' ? 3 : 5, I: mode === 'DIODE' ? 1e-3 : OHM_RANGES[m.range], Rs: .1});
        else devices.push({k: 'R', id: id + '.V', n: [n(p, 0), n(p, 1)], R: 10e6});
        break;
      }
    }
  }
  /* Schwebende Teilschaltungen (z. B. Netzgerät oder Trafo-Sekundärseite ohne Masse): Ihre Potentiale gegen Masse wären
     unbestimmt. Ein Knoten jeder solchen Insel bekommt einen Bezug über 1 kΩ — es ist ihre einzige Verbindung, also fließt
     dort nie Strom. Was galvanisch trennt, verbindet hier nicht: Trafowicklungen untereinander, OPV- und Gate-Eingänge. */
  const adj = Array.from({length: N + 1}, () => []);
  const link = (a, b) => { adj[a].push(b); adj[b].push(a); };
  for (const d of devices) {
    const ns = d.n;
    if (d.k === 'R' && d.R > 1e8) continue; // offener Schalter, durchgebrannte Sicherung
    if (d.k === 'K') { link(ns[0], ns[1]); link(ns[2], ns[3]); }
    else if (d.k === 'OP') link(ns[2], 0);
    else if (d.k === 'NS') link(ns[0], 0);
    else if (d.k === 'M') link(ns[0], ns[2]);
    else for (let i = 1; i < ns.length; i++) link(ns[0], ns[i]);
  }
  const seen = new Uint8Array(N + 1);
  const flood = start => { const stack = [start]; seen[start] = 1; while (stack.length) for (const m of adj[stack.pop()]) if (!seen[m]) { seen[m] = 1; stack.push(m); } };
  flood(0);
  for (let k = 1; k <= N; k++) if (!seen[k]) { flood(k); devices.push({k: 'R', id: 'bezug.' + k, n: [k, 0], R: 1e3}); }
  const nodeOf = key => parent.has(key) ? (ids.get(find(key)) ?? 0) : 0;
  return {netlist: {nodes: N, devices}, nodeOf, nodes: N};
}
/* Schrittweite: 1000 Punkte pro Schirmbreite, aber fein genug für Generator und LC-Resonanz */
function chooseDt() {
  let dt = state.osz.tdiv / 100;
  if (state.fg.on) dt = Math.min(dt, 1 / (state.fg.f * (state.fg.wave === 'sine' ? 120 : 400)));
  const Ls = state.parts.filter(p => p.type === 'L' && !p.broken).map(p => p.p.L), Cs = state.parts.filter(p => (p.type === 'C' || p.type === 'E') && !p.broken).map(p => p.p.C);
  if (Ls.length && Cs.length) dt = Math.min(dt, 2 * Math.PI * Math.sqrt(Math.min(...Ls) * Math.min(...Cs)) / 100);
  return clamp(dt, 5e-9, 2e-3);
}

/* ---------- Funktionsgenerator ----------
   Einstellung „50 Ω“: Die Anzeige gilt für eine 50-Ω-Last, im Leerlauf liegt das Doppelte an — wie bei echten Geräten. */
const FG_WAVES = {sine: 'Sinus', square: 'Rechteck', triangle: 'Dreieck', saw: 'Sägezahn'};
function fgValue(t) {
  const f = state.fg, ph = (t * f.f) % 1, amp = f.vpp / 2;
  const tr = Math.min(.02, Math.max(2 * sim.step() * f.f, 2e-8 * f.f)); // endliche Flankensteilheit (Anteil der Periode)
  let y;
  switch (f.wave) {
    case 'square': { const d = f.duty / 100; y = ph < tr ? -1 + 2 * ph / tr : ph < d ? 1 : ph < d + tr ? 1 - 2 * (ph - d) / tr : -1; break; }
    case 'triangle': y = ph < .5 ? -1 + 4 * ph : 3 - 4 * ph; break;
    case 'saw': y = ph < 1 - tr ? -1 + 2 * ph / (1 - tr) : 1 - 2 * (ph - 1 + tr) / tr; break;
    default: y = Math.sin(2 * Math.PI * ph);
  }
  return (f.load === '50' ? 2 : 1) * (f.off + amp * y);
}

/* ---------- Multimeter ---------- */
const SHUNT = .1, FUSE = .4, OHM_RANGES = [1e-3, 1e-4, 1e-5, 1e-6, 1e-7];
const mt = Object.fromEntries(METERS.map(id => [id, {fuse: true, range: 0, acc: {n: 0, s: 0, s2: 0, t: 0}, shown: '', value: null, unit: '', overI: 0, lastShow: 0, rangeHold: 0}]));

/* ---------- Simulation ---------- */
const sim = S.create();
let nodes = {ch1: 0, ch2: 0, dmm: {v: 0, c: 0, a: 0}, dmm2: {v: 0, c: 0, a: 0}};
function rebuild() {
  net = buildNet();
  sim.load(net.netlist);
  sim.setStep(chooseDt());
  nodes = {ch1: net.nodeOf('osz:0'), ch2: net.nodeOf('osz:1')};
  for (const id of METERS) nodes[id] = {v: net.nodeOf(id + ':0'), c: net.nodeOf(id + ':1'), a: net.nodeOf(id + ':2')};
  acqReset(false);
  dirty = false;
}
function changed(rerender = false) {
  dirty = true; save(); updateTools();
  if (rerender) renderParts(); else { renderInspector(); liveBoard(true); }
}
function restart() { sim.reset(); simClock.target = sim.t; acqReset(true); for (const p of state.parts) p.heat = 0; hint('Neu eingeschaltet: alle Kondensatoren leer, alle Ströme null.'); }

/* ---------- Oszilloskop: Erfassung ----------
   Wie ein Digitaloszilloskop mit Spitzenwerterfassung: Die Zeitachse ist in COLS Spalten geteilt, jede Spalte merkt sich
   Minimum, Maximum, ersten und letzten Wert sowie Summen für Mittelwert und Effektivwert. Getriggert wird auf eine
   Flanke; ein Teil vor dem Triggerpunkt ist schon zu sehen (Vortrigger, 10 % oder 50 %).
   Spur 0 = CH1, 1 = CH2, 2 = Math (CH1 − CH2 oder CH1 + CH2, nach Invertierung und Kopplung). */
const COLS = 500, RING = COLS * 3, TRACES = 3;
const ringBuf = Array.from({length: TRACES}, () => ({min: new Float32Array(RING), max: new Float32Array(RING), first: new Float32Array(RING), last: new Float32Array(RING), sum: new Float64Array(RING), sum2: new Float64Array(RING), n: new Uint32Array(RING)}));
const shown = Array.from({length: TRACES}, () => ({min: new Float32Array(COLS), max: new Float32Array(COLS), first: new Float32Array(COLS), last: new Float32Array(COLS), mean: new Float32Array(COLS), valid: new Uint8Array(COLS)}));
const acq = {binW: 1e-5, bin: -1, state: 'armed', trigBin: 0, pre: .1, armT: 0, prev: [0, 0, 0], hp: [0, 0], hpIn: [0, 0], have: false, status: 'WARTEN', meas: null, holdUntil: 0};
const preBins = () => Math.round(state.osz.pre * COLS);
function acqReset(clear) {
  acq.binW = state.osz.tdiv * 10 / COLS;
  acq.bin = -1; acq.state = 'armed'; acq.armT = sim.t; acq.holdUntil = sim.t;
  for (const r of ringBuf) r.n.fill(0);
  if (clear) { for (const s of shown) s.valid.fill(0); acq.have = false; acq.meas = null; }
}
function sample() {
  const t = sim.t, o = state.osz;
  const raw = [sim.v(nodes.ch1), sim.v(nodes.ch2)], v = [0, 0, 0];
  for (let c = 0; c < 2; c++) {
    const ch = o.ch[c], x = ch.inv ? -raw[c] : raw[c];
    if (ch.cpl === 'AC') { // Hochpass 1. Ordnung, Grenzfrequenz 10 Hz wie bei echten Oszilloskopen
      const rc = 1 / (2 * Math.PI * 10), a = rc / (rc + sim.step());
      acq.hp[c] = a * (acq.hp[c] + x - acq.hpIn[c]);
      v[c] = acq.hp[c];
    } else v[c] = ch.cpl === 'GND' ? 0 : x;
    acq.hpIn[c] = x;
  }
  v[2] = o.math === 'add' ? v[0] + v[1] : v[0] - v[1];
  const b = Math.floor(t / acq.binW);
  if (b !== acq.bin) {
    /* langsame Zeitbasis: fertige Spalten sofort zeigen, die Spur läuft von links ein */
    if (acq.state === 'sweep' && slowSweep() && acq.bin >= acq.trigBin) copyBin(acq.bin - acq.trigBin, acq.bin);
    for (let k = acq.bin + 1; k <= b && k >= 0; k++) { if (k > acq.bin + RING) break; const i = k % RING; for (const r of ringBuf) r.n[i] = 0; }
    acq.bin = b;
  }
  const i = b % RING;
  for (let c = 0; c < TRACES; c++) {
    const r = ringBuf[c], x = v[c];
    if (r.n[i] === 0) { r.min[i] = r.max[i] = r.first[i] = x; r.sum[i] = 0; r.sum2[i] = 0; }
    else { if (x < r.min[i]) r.min[i] = x; if (x > r.max[i]) r.max[i] = x; }
    r.last[i] = x; r.sum[i] += x; r.sum2[i] += x * x; r.n[i]++;
  }
  if (!o.run) { acq.prev = v; return; }
  const tr = o.trig, src = v[tr.src], prev = acq.prev[tr.src];
  if (acq.state === 'armed' && t >= acq.holdUntil) {
    const crossed = tr.slope > 0 ? prev < tr.lvl && src >= tr.lvl : prev > tr.lvl && src <= tr.lvl;
    if (crossed) { startSweep(b); acq.status = 'TRIG'; acq.armT = t; }
    else if (tr.mode === 'auto' && t - acq.armT > Math.min(.3, Math.max(1.5 * state.osz.tdiv * 10, .04))) { startSweep(b); acq.status = 'AUTO'; }
    else if (tr.mode === 'normal' && t - acq.armT > .2) acq.status = 'WARTEN';
  }
  if (acq.state === 'sweep' && b >= acq.trigBin + COLS) finishSweep();
  acq.prev = v;
}
const slowSweep = () => state.osz.tdiv >= .05;
function copyBin(col, bi) {
  if (col < 0 || col >= COLS) return;
  const i = ((bi % RING) + RING) % RING;
  for (let c = 0; c < TRACES; c++) {
    const r = ringBuf[c], s = shown[c], ok = bi >= 0 && r.n[i] > 0;
    s.valid[col] = ok ? 1 : 0;
    if (ok) { s.min[col] = r.min[i]; s.max[col] = r.max[i]; s.first[col] = r.first[i]; s.last[col] = r.last[i]; s.mean[col] = r.sum[i] / r.n[i]; }
  }
}
function startSweep(b) {
  acq.state = 'sweep'; acq.pre = state.osz.pre; acq.trigBin = b - preBins();
  if (slowSweep()) { for (let k = 0; k < COLS; k++) { if (k < b - acq.trigBin) copyBin(k, acq.trigBin + k); else for (const s of shown) s.valid[k] = 0; } acq.have = true; }
}
function finishSweep() {
  for (let c = 0; c < TRACES; c++) {
    const r = ringBuf[c], s = shown[c];
    for (let k = 0; k < COLS; k++) {
      const bi = acq.trigBin + k, i = ((bi % RING) + RING) % RING;
      const ok = bi >= 0 && bi > acq.bin - RING && r.n[i] > 0;
      s.valid[k] = ok ? 1 : 0;
      if (ok) { s.min[k] = r.min[i]; s.max[k] = r.max[i]; s.first[k] = r.first[i]; s.last[k] = r.last[i]; s.mean[k] = r.sum[i] / r.n[i]; }
    }
  }
  acq.meas = measure();
  acq.have = true;
  acq.state = 'armed'; acq.armT = sim.t; acq.holdUntil = sim.t;
  if (state.osz.single) { state.osz.run = false; state.osz.single = false; acq.status = 'STOP'; updateOszControls(); }
}
/* Messwerte aus der letzten Aufnahme */
function measure() {
  const out = [];
  for (let c = 0; c < TRACES; c++) {
    const r = ringBuf[c], s = shown[c];
    let n = 0, sum = 0, sum2 = 0, mn = Infinity, mx = -Infinity;
    for (let k = 0; k < COLS; k++) {
      if (!s.valid[k]) continue;
      const bi = acq.trigBin + k, i = ((bi % RING) + RING) % RING;
      n += r.n[i]; sum += r.sum[i]; sum2 += r.sum2[i];
      if (s.min[k] < mn) mn = s.min[k]; if (s.max[k] > mx) mx = s.max[k];
    }
    if (!n) { out.push(null); continue; }
    const mean = sum / n, vpp = mx - mn;
    /* Frequenz über steigende Durchgänge durch die Mitte (mit Hysterese) */
    const mid = (mx + mn) / 2, hy = vpp * .1, cross = [];
    let armed = false;
    for (let k = 0; k < COLS; k++) {
      if (!s.valid[k]) continue;
      const y = s.mean[k];
      if (y < mid - hy) armed = true;
      else if (armed && y >= mid) { armed = false; const y0 = k ? s.mean[k - 1] : y; cross.push(k - (y - mid) / ((y - y0) || 1)); }
    }
    const period = cross.length > 1 && vpp > 1e-6 ? (cross[cross.length - 1] - cross[0]) / (cross.length - 1) * acq.binW : 0;
    /* Effektivwert über ganze Perioden, falls möglich */
    let rms = Math.sqrt(Math.max(0, sum2 / n));
    if (cross.length > 1) {
      let n2 = 0, q = 0;
      for (let k = Math.ceil(cross[0]); k < Math.floor(cross[cross.length - 1]); k++) { const bi = acq.trigBin + k, i = ((bi % RING) + RING) % RING; n2 += r.n[i]; q += r.sum2[i]; }
      if (n2) rms = Math.sqrt(q / n2);
    }
    /* Anstiegszeit 10 % → 90 % an der ersten vollständigen steigenden Flanke */
    let rise = 0;
    if (vpp > 1e-6) {
      const lo = mn + .1 * vpp, hi = mn + .9 * vpp;
      let below = false, k0 = -1;
      for (let k = 1; k < COLS; k++) {
        if (!s.valid[k] || !s.valid[k - 1]) { below = false; k0 = -1; continue; }
        const y = s.mean[k], y0 = s.mean[k - 1];
        if (y < lo) { below = true; k0 = -1; continue; }
        if (below && k0 < 0) k0 = k - 1 + (lo - y0) / ((y - y0) || 1);
        if (k0 >= 0 && y >= hi) { rise = (k - 1 + (hi - y0) / ((y - y0) || 1) - k0) * acq.binW; break; }
      }
    }
    out.push({mean, vpp, min: mn, max: mx, rms, f: period ? 1 / period : 0, cross, rise});
  }
  /* Phase CH2 gegen CH1 (positiv = CH2 eilt vor) */
  if (out[0]?.f && out[1]?.f && Math.abs(out[0].f / out[1].f - 1) < .02) {
    const T = 1 / out[0].f / acq.binW, c1 = out[0].cross[0];
    const c2 = out[1].cross.reduce((best, c) => Math.abs(c - c1) < Math.abs(best - c1) ? c : best, out[1].cross[0]);
    let ph = -(c2 - c1) / T * 360;
    ph = ((ph + 180) % 360 + 360) % 360 - 180;
    out.phase = ph;
  }
  return out;
}

/* ---------- Oszilloskop: Bild ---------- */
const screen = $('osz-screen'), pen = screen.getContext('2d');
const SCOPE_COLORS = ['#e8ff5a', '#4cc9f0', '#ff8ad8'];
const traceOn = c => c < 2 ? state.osz.ch[c].on : state.osz.math !== 'off';
const traceDiv = c => c < 2 ? state.osz.ch[c].vdiv : state.osz.mdiv;
const tracePos = c => c < 2 ? state.osz.ch[c].pos : 0;
const MATH_NAME = {sub: 'CH1 − CH2', add: 'CH1 + CH2'};
/* Cursor: Bildschirmanteil u (0…1) → Zeit nach dem Trigger bzw. Spannung der gewählten Spur */
const curTime = u => (u - acq.pre) * 10 * state.osz.tdiv;
const curVolt = (u, c) => (4 - 8 * u - tracePos(c)) * traceDiv(c);
const traceAt = (c, u) => { const k = clamp(Math.floor(u * COLS), 0, COLS - 1); return acq.have && shown[c].valid[k] ? shown[c].mean[k] : null; };
function drawScope() {
  const ratio = Math.min(devicePixelRatio || 1, 2), W = screen.clientWidth, H = W * .8;
  if (screen.width !== Math.round(W * ratio)) { screen.width = Math.round(W * ratio); screen.height = Math.round(H * ratio); screen.style.height = H + 'px'; }
  pen.setTransform(ratio, 0, 0, ratio, 0, 0);
  pen.fillStyle = '#0d0f0b'; pen.fillRect(0, 0, W, H);
  const dx = W / 10, dy = H / 8;
  pen.strokeStyle = 'rgba(200, 210, 190, .16)'; pen.lineWidth = 1; pen.beginPath();
  for (let i = 1; i < 10; i++) { pen.moveTo(i * dx + .5, 0); pen.lineTo(i * dx + .5, H); }
  for (let i = 1; i < 8; i++) { pen.moveTo(0, i * dy + .5); pen.lineTo(W, i * dy + .5); }
  pen.stroke();
  pen.strokeStyle = 'rgba(200, 210, 190, .32)'; pen.beginPath();
  for (let i = 0; i <= 50; i++) { const x = i * dx / 5 + .5; pen.moveTo(x, H / 2 - 3); pen.lineTo(x, H / 2 + 3); }
  for (let i = 0; i <= 40; i++) { const y = i * dy / 5 + .5; pen.moveTo(W / 2 - 3, y); pen.lineTo(W / 2 + 3, y); }
  pen.stroke();
  const o = state.osz;
  const yOf = (c, v) => H / 2 - (v / traceDiv(c) + tracePos(c)) * dy;
  pen.lineJoin = 'round';
  if (acq.have && o.xy) {
    const s1 = shown[0], s2 = shown[1];
    for (const [width, alpha] of [[5, .18], [1.6, 1]]) {
      pen.strokeStyle = SCOPE_COLORS[0]; pen.globalAlpha = alpha; pen.lineWidth = width; pen.beginPath();
      let started = false;
      for (let k = 0; k < COLS; k++) {
        if (!s1.valid[k] || !s2.valid[k]) continue;
        const x = W / 2 + (s1.mean[k] / o.ch[0].vdiv + o.ch[0].pos) * dx, y = yOf(1, s2.mean[k]);
        if (!started) { pen.moveTo(x, y); started = true; } else pen.lineTo(x, y);
      }
      pen.stroke();
    }
    pen.globalAlpha = 1;
  } else if (acq.have) {
    for (const c of [2, 0, 1]) { // CH2 zuletzt, damit es auf einem breiten CH1-Band sichtbar bleibt
      if (!traceOn(c)) continue;
      const s = shown[c], cw = W / COLS;
      for (const [width, alpha] of [[5, .16], [1.5, 1]]) {
        pen.strokeStyle = SCOPE_COLORS[c]; pen.globalAlpha = alpha; pen.lineWidth = width; pen.beginPath();
        let open = false;
        for (let k = 0; k < COLS; k++) {
          if (!s.valid[k]) { open = false; continue; }
          const x = (k + .5) * cw, y1 = clamp(yOf(c, s.first[k]), -2, H + 2), yl = clamp(yOf(c, s.last[k]), -2, H + 2), ymin = clamp(yOf(c, s.max[k]), -2, H + 2), ymax = clamp(yOf(c, s.min[k]), -2, H + 2);
          if (!open) { pen.moveTo(x, y1); open = true; } else pen.lineTo(x, y1);
          if (ymax - ymin > 1.5) { pen.lineTo(x, ymin); pen.lineTo(x, ymax); }
          pen.lineTo(x, yl);
        }
        pen.stroke();
      }
    }
    pen.globalAlpha = 1;
  }
  /* Markierungen: Nulllinien, Triggerpegel, Triggerzeitpunkt */
  pen.font = '600 10px Meslo, ui-monospace, monospace';
  if (!o.xy) for (let c = 0; c < TRACES; c++) {
    if (!traceOn(c)) continue;
    const y = yOf(c, 0);
    if (y < 0 || y > H) continue;
    pen.fillStyle = SCOPE_COLORS[c];
    pen.beginPath(); pen.moveTo(0, y - 6); pen.lineTo(9, y); pen.lineTo(0, y + 6); pen.fill();
    pen.fillStyle = '#0d0f0b'; pen.fillText(c < 2 ? String(c + 1) : 'M', 1, y + 3.5);
  }
  if (!o.xy) {
    const tc = o.trig.src, ty = yOf(tc, o.trig.lvl);
    if (ty > 0 && ty < H) { pen.fillStyle = SCOPE_COLORS[tc]; pen.beginPath(); pen.moveTo(W, ty - 6); pen.lineTo(W - 9, ty); pen.lineTo(W, ty + 6); pen.fill(); }
    const tx = (acq.have ? acq.pre : o.pre) * W;
    pen.fillStyle = 'rgba(232, 255, 90, .8)'; pen.beginPath(); pen.moveTo(tx - 5, 0); pen.lineTo(tx + 5, 0); pen.lineTo(tx, 7); pen.fill();
  }
  /* Cursor */
  if (o.cur !== 'off' && !o.xy) {
    pen.strokeStyle = 'rgba(255, 255, 255, .8)'; pen.fillStyle = 'rgba(255, 255, 255, .9)'; pen.lineWidth = 1; pen.setLineDash([5, 4]);
    pen.beginPath();
    const list = o.cur === 't' ? o.curT : o.curV;
    list.forEach(u => { if (o.cur === 't') { const x = Math.round(u * W) + .5; pen.moveTo(x, 0); pen.lineTo(x, H); } else { const y = Math.round(u * H) + .5; pen.moveTo(0, y); pen.lineTo(W, y); } });
    pen.stroke(); pen.setLineDash([]);
    list.forEach((u, i) => { if (o.cur === 't') pen.fillText(String(i + 1), u * W + 4, 28); else pen.fillText(String(i + 1), W - 30, u * H - 4); });
  }
  pen.fillStyle = 'rgba(220, 228, 210, .82)';
  const top = o.ch.map((ch, c) => ch.on ? `CH${c + 1} ${fmt(ch.vdiv, 'V', 3)}/div ${ch.cpl}${ch.probe === 10 ? ' ×10' : ''}${ch.inv ? ' INV' : ''}` : '').filter(Boolean).join('   ');
  pen.fillText(top, 8, 14);
  if (o.math !== 'off' && !o.xy) { pen.fillStyle = SCOPE_COLORS[2]; pen.fillText(`M: ${MATH_NAME[o.math]} ${fmt(o.mdiv, 'V', 3)}/div`, 8, 28); pen.fillStyle = 'rgba(220, 228, 210, .82)'; }
  pen.textAlign = 'right';
  pen.fillText(!o.run ? 'STOP' : acq.status, W - 8, 14);
  pen.fillText(o.xy ? 'XY: CH1 → x, CH2 → y' : `T: CH${o.trig.src + 1} ${o.trig.slope > 0 ? '↗' : '↘'} ${fmt(o.trig.lvl, 'V', 3)} ${o.trig.mode === 'auto' ? 'AUTO' : 'NORMAL'}`, W - 8, H - 8);
  pen.textAlign = 'left';
  pen.fillText(o.xy ? '' : `${fmt(o.tdiv, 's', 3)}/div`, 8, H - 8);
  showCursor();
}
function showCursor() {
  const o = state.osz, el = $('osz-cursor');
  let html = '';
  if (o.cur === 't' && !o.xy) {
    const [u1, u2] = o.curT, t1 = curTime(u1), t2 = curTime(u2), dt = t2 - t1;
    const rows = [0, 1, 2].filter(traceOn).map(c => {
      const a = traceAt(c, u1), b = traceAt(c, u2), name = c < 2 ? `CH${c + 1}` : 'M';
      return `<span class="c${c + 1}">${name}: ${a === null ? '—' : fmt(a, 'V', 4)} → ${b === null ? '—' : fmt(b, 'V', 4)}${a !== null && b !== null ? ` (Δ ${fmt(b - a, 'V', 4)})` : ''}</span>`;
    });
    html = `<span>t₁ = ${fmt(t1, 's', 4)} · t₂ = ${fmt(t2, 's', 4)} · Δt = ${fmt(dt, 's', 4)}${dt ? ` · 1/Δt = ${fmt(1 / Math.abs(dt), 'Hz', 4)}` : ''}</span>${rows.join('')}`;
  } else if (o.cur === 'v' && !o.xy) {
    const c = o.curSrc, a = curVolt(o.curV[0], c), b = curVolt(o.curV[1], c);
    html = `<span class="c${c + 1}">${c < 2 ? `CH${c + 1}` : 'Math'}: U₁ = ${fmt(a, 'V', 4)} · U₂ = ${fmt(b, 'V', 4)} · ΔU = ${fmt(a - b, 'V', 4)}</span>`;
  }
  if (html !== showCursor.last) { el.innerHTML = html; el.hidden = !html; showCursor.last = html; }
}
function showMeasurements() {
  const m = acq.meas, rows = [0, 1, 2].map(c => {
    const x = m?.[c], on = traceOn(c), name = c < 2 ? `CH${c + 1}` : 'Math';
    if (c === 2 && !on) return '';
    if (!x || !on) return `<tr class="ch${c + 1}"><th>${name}</th><td colspan="6">${on ? '—' : 'aus'}</td></tr>`;
    return `<tr class="ch${c + 1}"><th>${name}</th><td>${fmt(x.vpp, 'V')}</td><td>${fmt(x.rms, 'V')}</td><td>${fmt(x.mean, 'V')}</td><td>${x.f ? fmt(x.f, 'Hz', 4) : '—'}</td><td>${x.rise ? fmt(x.rise, 's') : '—'}</td><td>${fmt(x.max, 'V')} / ${fmt(x.min, 'V')}</td></tr>`;
  }).join('');
  const r = m?.[0]?.vpp && m?.[1]?.vpp ? m[1].vpp / m[0].vpp : 0;
  const ratio = r ? `CH2/CH1 = ${num(r, 4)} (${num(20 * Math.log10(r), 3)} dB)` : '';
  const ph = m?.phase !== undefined ? `Phase CH2 gegen CH1: ${num(m.phase, 3)}°` : '';
  $('osz-meas').innerHTML = `<table><thead><tr><th></th><th>Spitze-Spitze</th><th>Effektiv</th><th>Mittel</th><th>Frequenz</th><th title="10 % → 90 %">Anstieg</th><th>Max / Min</th></tr></thead><tbody>${rows}</tbody></table><p>${[ratio, ph].filter(Boolean).join(' · ') || '&nbsp;'}</p>`;
}
/* Cursor ziehen (Maus, Finger) und mit Pfeiltasten schieben (Umschalt: Cursor 2) */
let curDrag = -1;
function cursorU(ev) { const r = screen.getBoundingClientRect(); return clamp(state.osz.cur === 't' ? (ev.clientX - r.left) / r.width : (ev.clientY - r.top) / r.height, 0, 1); }
screen.addEventListener('pointerdown', ev => {
  const o = state.osz;
  if (o.cur === 'off' || o.xy) return;
  const u = cursorU(ev), list = o.cur === 't' ? o.curT : o.curV;
  curDrag = Math.abs(list[0] - u) <= Math.abs(list[1] - u) ? 0 : 1;
  list[curDrag] = u; ev.preventDefault(); capture(screen, ev);
});
screen.addEventListener('pointermove', ev => { if (curDrag < 0) return; (state.osz.cur === 't' ? state.osz.curT : state.osz.curV)[curDrag] = cursorU(ev); });
const endCursor = () => { if (curDrag >= 0) { curDrag = -1; save(); } };
screen.addEventListener('pointerup', endCursor);
screen.addEventListener('pointercancel', endCursor);
screen.addEventListener('keydown', ev => {
  const o = state.osz;
  if (o.cur === 'off' || o.xy) return;
  const dir = {ArrowLeft: -1, ArrowDown: o.cur === 'v' ? 1 : -1, ArrowRight: 1, ArrowUp: o.cur === 'v' ? -1 : 1}[ev.key];
  if (!dir) return;
  ev.preventDefault();
  const list = o.cur === 't' ? o.curT : o.curV, i = ev.shiftKey ? 1 : 0;
  list[i] = clamp(list[i] + dir * (ev.altKey ? .02 : .002), 0, 1); save();
});

/* ---------- Geräte bedienen ---------- */
const rack = $('mp-rack');
const press = (sel2, test) => rack.querySelectorAll(sel2).forEach(b => b.setAttribute('aria-pressed', String(test(b))));
function updateFgControls() {
  const f = state.fg;
  $('fg-display').innerHTML = f.on ? `<b>${FG_WAVES[f.wave]}</b> ${fmt(f.f, 'Hz', 4)} · ${num(f.vpp, 3)} Vss${f.off ? ` · Offset ${num(f.off, 3)} V` : ''}${f.wave === 'square' && f.duty !== 50 ? ` · ${Math.round(f.duty)} %` : ''}${f.load === '50' ? ' · an 50 Ω' : ''}` : '<b>Ausgang aus</b>';
  press('[data-fg-wave]', b => b.dataset.fgWave === f.wave);
  press('[data-fg-load]', b => b.dataset.fgLoad === f.load);
  $('fg-on').setAttribute('aria-pressed', String(f.on)); $('fg-on').textContent = f.on ? 'Ausgang an' : 'Ausgang aus';
  $('fg-f').value = Math.log10(f.f).toFixed(3); $('fg-vpp').value = f.vpp; $('fg-off').value = f.off; $('fg-duty').value = f.duty;
  $('fg-duty-row').hidden = f.wave !== 'square';
  $('fg-load-hint').textContent = f.load === '50' ? 'Anzeige gilt für 50 Ω Last: Im Leerlauf (hochohmige Schaltung) liegt die doppelte Spannung an.' : 'Anzeige = Leerlaufspannung. An einer 50-Ω-Last bleibt die Hälfte.';
  liveBoard(true);
}
function updatePsuControls() {
  const p = state.psu;
  $('psu-v').value = p.V; $('psu-i').value = Math.log10(p.I).toFixed(3);
  $('psu-set').textContent = `Soll: ${num(p.V, 3)} V · Grenze ${fmt(p.I, 'A', 3)}`;
  $('psu-on').setAttribute('aria-pressed', String(p.on)); $('psu-on').textContent = p.on ? 'Ausgang an' : 'Ausgang aus';
}
function updateDmmControls() {
  for (const id of METERS) {
    const m = state[id].mode, sec = rack.querySelector(`[data-meter="${id}"]`);
    sec.querySelectorAll('[data-dmm]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.dmm === m)));
    $(id + '-hint').textContent = m.startsWith('A') ? 'Strom: in Reihe, Buchsen A und COM.' : m === 'OHM' ? 'Widerstand: nur an spannungsfreien Bauteilen messen (VΩ und COM).' : m === 'DIODE' ? 'Diodentest: 1 mA Prüfstrom, angezeigt wird die Durchlassspannung.' : 'Spannung: parallel, Buchsen VΩ und COM.';
    $(id + '-fuse').hidden = mt[id].fuse;
  }
}
function updateOszControls() {
  const o = state.osz;
  for (let c = 0; c < 2; c++) {
    const ch = o.ch[c];
    $(`osz-v${c}`).textContent = `${fmt(ch.vdiv, 'V', 3)}/div`;
    $(`osz-pos${c}`).value = ch.pos;
    $(`osz-on${c}`).setAttribute('aria-pressed', String(ch.on));
    $(`osz-inv${c}`).setAttribute('aria-pressed', String(ch.inv));
    press(`[data-cpl="${c}"]`, b => b.dataset.value === ch.cpl);
    press(`[data-probe="${c}"]`, b => Number(b.dataset.value) === ch.probe);
  }
  $('osz-t').textContent = `${fmt(o.tdiv, 's', 3)}/div`;
  $('osz-xy').setAttribute('aria-pressed', String(o.xy));
  press('[data-pre]', b => Number(b.dataset.pre) === o.pre);
  press('[data-trig-src]', b => Number(b.dataset.trigSrc) === o.trig.src);
  press('[data-trig-slope]', b => Number(b.dataset.trigSlope) === o.trig.slope);
  press('[data-trig-mode]', b => b.dataset.trigMode === o.trig.mode);
  press('[data-math]', b => b.dataset.math === o.math);
  press('[data-cur]', b => b.dataset.cur === o.cur);
  press('[data-cur-src]', b => Number(b.dataset.curSrc) === o.curSrc);
  $('osz-mv').textContent = `${fmt(o.mdiv, 'V', 3)}/div`;
  $('osz-mstep').hidden = o.math === 'off';
  $('osz-cur-src').hidden = o.cur !== 'v';
  screen.style.touchAction = o.cur !== 'off' && !o.xy ? 'none' : '';
  screen.tabIndex = o.cur !== 'off' ? 0 : -1;
  screen.style.cursor = o.cur === 't' ? 'ew-resize' : o.cur === 'v' ? 'ns-resize' : '';
  const vd = traceDiv(o.trig.src), lvl = $('osz-lvl');
  lvl.min = -4 * vd; lvl.max = 4 * vd; lvl.step = vd / 25; lvl.value = o.trig.lvl;
  $('osz-lvl-val').textContent = fmt(o.trig.lvl, 'V', 3);
  $('osz-run').textContent = o.run ? '■ Stop' : '▶︎ Run';
  $('osz-run').setAttribute('aria-pressed', String(o.run));
}
function updateAll() { updateFgControls(); updatePsuControls(); updateDmmControls(); updateOszControls(); }
rack.addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  const f = state.fg, o = state.osz, d = b.dataset, meter = b.closest('[data-meter]')?.dataset.meter;
  if (d.fgWave) { f.wave = d.fgWave; sim.setStep(chooseDt()); updateFgControls(); }
  else if (b.id === 'fg-on') { f.on = !f.on; dirty = true; updateFgControls(); }
  else if (d.fgLoad) { f.load = d.fgLoad; dirty = true; updateFgControls(); }
  else if (d.fgF) { f.f = clamp(d.fgF === 'x10' ? f.f * 10 : d.fgF === 'd10' ? f.f / 10 : S.step125(f.f, Number(d.fgF)), .1, 1e6); sim.setStep(chooseDt()); updateFgControls(); }
  else if (b.id === 'psu-on') { state.psu.on = !state.psu.on; dirty = true; updatePsuControls(); }
  else if (d.psuV) { state.psu.V = clamp(Number((state.psu.V + Number(d.psuV)).toFixed(2)), 0, 30); dirty = true; updatePsuControls(); }
  else if (d.dmm && meter) { state[meter].mode = d.dmm; mt[meter].range = 0; mt[meter].acc = {n: 0, s: 0, s2: 0, t: 0}; dirty = true; updateDmmControls(); }
  else if (d.fuse !== undefined && meter) { mt[meter].fuse = true; dirty = true; hint('Sicherung getauscht. Strom nur in Reihe messen!'); updateDmmControls(); }
  else if (d.vdiv) { const c = Number(d.vdiv); o.ch[c].vdiv = clamp(S.step125(o.ch[c].vdiv, Number(d.dir)), 1e-3, 50); updateOszControls(); }
  else if (d.cpl) { o.ch[Number(d.cpl)].cpl = d.value; acq.hp = [0, 0]; updateOszControls(); }
  else if (d.probe) { o.ch[Number(d.probe)].probe = Number(d.value); dirty = true; updateOszControls(); }
  else if (d.inv) { const c = Number(d.inv); o.ch[c].inv = !o.ch[c].inv; acq.hp[c] = -acq.hp[c]; updateOszControls(); }
  else if (d.chOn) { const c = Number(d.chOn); o.ch[c].on = !o.ch[c].on; updateOszControls(); showMeasurements(); }
  else if (d.tdiv) { o.tdiv = clamp(S.step125(o.tdiv, Number(d.tdiv)), 1e-6, 2); sim.setStep(chooseDt()); acqReset(true); updateOszControls(); }
  else if (d.pre) { o.pre = Number(d.pre); acqReset(true); updateOszControls(); }
  else if (b.id === 'osz-xy') { o.xy = !o.xy; updateOszControls(); }
  else if (d.trigSrc) { o.trig.src = Number(d.trigSrc); updateOszControls(); }
  else if (d.trigSlope) { o.trig.slope = Number(d.trigSlope); updateOszControls(); }
  else if (d.trigMode) { o.trig.mode = d.trigMode; o.single = false; o.run = true; updateOszControls(); }
  else if (d.math) { o.math = d.math; updateOszControls(); showMeasurements(); }
  else if (d.mdiv) { o.mdiv = clamp(S.step125(o.mdiv, Number(d.mdiv)), 1e-3, 50); updateOszControls(); }
  else if (d.cur) { o.cur = d.cur; updateOszControls(); if (o.cur !== 'off') hint('Cursor: auf dem Schirm ziehen. Tastatur: Pfeile schieben Cursor 1, mit Umschalt Cursor 2.'); }
  else if (d.curSrc) { o.curSrc = Number(d.curSrc); updateOszControls(); }
  else if (b.id === 'osz-single') { o.single = true; o.run = true; acq.state = 'armed'; acq.armT = sim.t; acq.status = 'WARTEN'; updateOszControls(); }
  else if (b.id === 'osz-run') { o.run = !o.run; o.single = false; if (o.run) { acq.state = 'armed'; acq.armT = sim.t; } updateOszControls(); }
  else if (b.id === 'osz-auto') autoset();
  else if (b.id === 'osz-log') addLogPoint();
  else if (b.id === 'osz-csv') scopeCsv();
  else if (b.id === 'osz-png') screen.toBlob(blob => blob && download(`oszi-${stamp()}.png`, blob));
  else return;
  save();
});
rack.addEventListener('input', ev => {
  const t = ev.target, f = state.fg, o = state.osz;
  if (t.id === 'fg-f') { f.f = Number((10 ** Number(t.value)).toPrecision(3)); sim.setStep(chooseDt()); }
  else if (t.id === 'fg-vpp') f.vpp = Number(t.value);
  else if (t.id === 'fg-off') f.off = Number(t.value);
  else if (t.id === 'fg-duty') f.duty = Number(t.value);
  else if (t.id === 'psu-v') { state.psu.V = Number(t.value); dirty = true; updatePsuControls(); save(); return; }
  else if (t.id === 'psu-i') { state.psu.I = Number((10 ** Number(t.value)).toPrecision(2)); dirty = true; updatePsuControls(); save(); return; }
  else if (t.id.startsWith('osz-pos')) { o.ch[Number(t.id.slice(-1))].pos = Number(t.value); save(); return; }
  else if (t.id === 'osz-lvl') { o.trig.lvl = Number(t.value); $('osz-lvl-val').textContent = fmt(o.trig.lvl, 'V', 3); save(); return; }
  else return;
  updateFgControls(); save();
});
/* Autoset: Zeitbasis für etwa zwei Perioden, Ablenkung für etwa sechs Teilungen, Trigger auf den Mittelwert */
function autoset() {
  const o = state.osz, m = acq.meas, use = [0, 1].filter(c => wired(`osz:${c}`) && m?.[c]);
  const f = use.map(c => m[c].f).find(Boolean) || (state.fg.on ? state.fg.f : 0);
  if (f) { let t = 1e-6; while (t * 10 < 2 / f && t < 2) t = S.step125(t, 1); o.tdiv = t; }
  for (const c of use) {
    const x = m[c], span = Math.max(Math.abs(x.max - x.mean) * 2, x.vpp, 1e-3);
    let vd = 1e-3; while (vd * 6 < span && vd < 50) vd = S.step125(vd, 1);
    o.ch[c].vdiv = vd; o.ch[c].cpl = 'DC'; o.ch[c].on = true;
    o.ch[c].pos = clamp(-x.mean / vd, -3, 3);
  }
  if (use.length === 2) { o.ch[0].pos = clamp(2 - m[0].mean / o.ch[0].vdiv, -3, 3); o.ch[1].pos = clamp(-2 - m[1].mean / o.ch[1].vdiv, -3, 3); }
  o.trig.src = use.length ? use.reduce((a, c) => m[c].vpp / o.ch[c].vdiv > m[a].vpp / o.ch[a].vdiv ? c : a, use[0]) : 0;
  const grid = o.ch[o.trig.src].vdiv / 25;
  o.trig.lvl = Math.round((m?.[o.trig.src]?.mean || 0) / grid) * grid || 0; // auf das Raster des Pegelreglers
  o.trig.mode = 'auto'; o.run = true; o.xy = false;
  sim.setStep(chooseDt()); acqReset(true); updateOszControls(); save();
  hint(use.length ? 'Autoset: Zeitbasis, Ablenkung und Trigger an das Signal angepasst.' : 'Autoset: An CH1 und CH2 hängt nichts — erst ein Tastkopfkabel stecken.');
}

/* ---------- Live-Werte auf dem Brett und im Inspektor ---------- */
function bjtRegion(q, pol) {
  const ube = pol * q.ube, ubc = pol * (q.ube - q.uce);
  return ube < .5 ? (ubc > .5 ? 'invers' : 'gesperrt') : ubc > .4 ? 'Sättigung' : 'aktiv (Verstärker)';
}
function mosRegion(q) {
  const vth = S.MODELS['2N7000'].Vth;
  return q.ugs < vth ? 'gesperrt' : q.uds < q.ugs - vth ? 'ohmsch (Triode)' : 'Sättigung';
}
function diodeState(type, q) {
  if (type === 'Z' && q.u < -3) return 'Durchbruch';
  return q.i > 1e-6 ? 'leitet' : 'sperrt';
}
/* Spannungen, Ströme, Leistungen eines Bauteils als Zeilen [Name, Wert]; info = sim.info oder Arbeitspunkt */
function partRows(part, info) {
  const t = part.type;
  if (t === 'NPN' || t === 'PNP') { const q = info(part.id); return q ? [['I_C', fmt(q.ic, 'A')], ['I_B', fmt(q.ib, 'A')], ['U_CE', fmt(q.uce, 'V')], ['U_BE', fmt(q.ube, 'V')], ['B = I_C/I_B', q.ib ? num(q.ic / q.ib, 3) : '—'], ['Bereich', bjtRegion(q, PARTS[t].pol)]] : []; }
  if (t === 'NMOS') { const q = info(part.id), b = info(part.id + '.body'); if (!q) return []; const rows = [['I_D', fmt(q.id, 'A')], ['U_GS', fmt(q.ugs, 'V')], ['U_DS', fmt(q.uds, 'V')], ['Bereich', mosRegion(q)]]; if (b && Math.abs(b.i) > 1e-6) rows.push([b.u > 0 ? 'Bodydiode leitet' : 'Avalanche', fmt(Math.abs(b.i), 'A')]); return rows; }
  if (t === 'OP') { const q = info(part.id); return q ? [['U_A', fmt(q.u, 'V')], ['I_A', fmt(q.i, 'A')], ['U_D = U₊ − U₋', fmt(q.ud, 'V')], ['Zustand', Math.abs(q.u) > 13 ? 'Sättigung' : 'linear']] : []; }
  if (t === 'POT') { const a = info(part.id + '.a'), b = info(part.id + '.b'); return a && b ? [['U (A–S)', fmt(a.u, 'V')], ['U (S–E)', fmt(b.u, 'V')], ['I (A→S)', fmt(a.i, 'A')]] : []; }
  if (t === 'TR') { const q = info(part.id); return q ? [['U₁ (1–2)', fmt(q.u, 'V')], ['I₁', fmt(q.i, 'A')], ['U₂ (3–4)', fmt(q.u2, 'V')], ['I₂ (in 3)', fmt(q.i2, 'A')]] : []; }
  if (t === 'V') { const q = info(part.id); return q ? [['U', fmt(q.u, 'V')], ['I (aus +)', fmt(q.i, 'A')], ['P abgegeben', fmt(q.u * q.i, 'W')]] : []; }
  if (t === 'I') { const q = info(part.id); return q ? [['U (1–2)', fmt(q.u, 'V')], ['I', fmt(q.i, 'A')], ['P abgegeben', fmt(-q.u * q.i, 'W')], ...(Math.abs(q.u) > 1e3 ? [['Achtung', 'Leerlauf?']] : [])] : []; }
  if (t === 'GND') return [];
  const q = info(part.id);
  if (!q) return [];
  const rows = [['U', fmt(q.u, 'V')], ['I', fmt(q.i, 'A')], ['P', fmt(Math.abs(q.u * q.i), 'W')]];
  if (t === 'D' || t === 'LED' || t === 'Z') rows.push(['Zustand', diodeState(t, q)]);
  return rows;
}
let liveTimer = 0;
function liveBoard(force) {
  const now = performance.now();
  if (!force && now - liveTimer < 120) return;
  liveTimer = now;
  if (!net) return;
  for (const p of state.parts) {
    const el = partsEl.querySelector(`[data-id="${p.id}"]`);
    if (!el) continue;
    if (p.type === 'LED') { const i = p.broken ? 0 : sim.info(p.id)?.i || 0; el.style.setProperty('--glow', clamp(i / .015, 0, 1).toFixed(2)); }
    el.classList.toggle('hot', (p.heat || 0) > 0 && !p.broken);
  }
  const st = (id, text) => { const e = partsEl.querySelector(`[data-instr-state="${id}"]`); if (e) e.textContent = text; };
  const f = state.fg; st('fg', f.on ? `${FG_WAVES[f.wave]} ${fmt(f.f, 'Hz', 3)}` : 'aus');
  const ps = sim.info('psu'); st('psu', state.psu.on && ps ? `${num(ps.u, 3)} V\n${fmt(Math.abs(ps.i) < 1e-9 ? 0 : ps.i, 'A', 3)}${ps.cc ? ' · CC' : ''}` : 'aus');
  st('osz', `${fmt(state.osz.tdiv, 's')}/div`);
  for (const id of METERS) st(id, mt[id].shown || DMM_MODES[state[id].mode][0]);
  const live = $('mp-live'), part = sel && getPart(sel);
  if (live && part && !PARTS[part.type].instr) {
    const rows = part.broken ? [['Zustand', 'defekt']] : partRows(part, sim.info);
    live.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  }
  if (showVolts) paintVolts();
}
/* Knotenspannungen gegen Masse an je einer Buchse pro Knoten */
let showVolts = false;
const voltsEl = $('mp-volts');
function paintVolts() {
  if (!showVolts || !net) { voltsEl.innerHTML = ''; return; }
  const seen = new Set(), tags = [];
  for (const p of state.parts) PARTS[p.type].geom.pins.forEach((_, i) => {
    const key = `${p.id}:${i}`, n = net.nodeOf(key);
    if (seen.has(n) || (PARTS[p.type].instr && !wired(key) && n !== 0)) return;
    seen.add(n);
    const pt = pinPoint(key);
    tags.push(`<span class="mp-volt" style="left:${pt.x}px;top:${pt.y}px">${n === 0 ? '0 V' : fmt(sim.v(n), 'V', 3)}</span>`);
  });
  voltsEl.innerHTML = tags.join('');
}
partsEl.addEventListener('pointerover', ev => {
  const s = ev.target.closest('[data-pin]');
  if (!s || !net) return;
  const n = net.nodeOf(s.dataset.pin);
  s.title = `${pinName(s.dataset.pin)}: ${n === 0 ? '0 V (Masse)' : fmt(sim.v(n), 'V', 4)}`;
});

/* ---------- Überlast: heiß werden und durchbrennen ---------- */
function checkDamage() {
  for (const p of state.parts) {
    const r = PARTS[p.type].rating;
    if (!r || p.broken) continue;
    let over = 0, why = '';
    if (p.type === 'NPN' || p.type === 'PNP') { const q = sim.info(p.id); if (!q) continue; const P = Math.abs(q.ic * q.uce); over = Math.max(Math.abs(q.ic) / r.I, P / r.P); why = `Überlastet: ${fmt(Math.abs(q.ic), 'A')}, ${fmt(P, 'W')}`; }
    else if (p.type === 'NMOS') { const q = sim.info(p.id); if (!q) continue; const P = Math.abs(q.id * q.uds); over = Math.max(Math.abs(q.id) / r.I, P / r.P); why = `Überlastet: ${fmt(Math.abs(q.id), 'A')}, ${fmt(P, 'W')}`; }
    else if (p.type === 'POT') { const a = sim.info(p.id + '.a'), b = sim.info(p.id + '.b'); if (!a) continue; const P = Math.abs(a.u * a.i) + Math.abs(b.u * b.i); over = P / r.P; why = `Durchgebrannt: ${fmt(P, 'W')} statt höchstens ${fmt(r.P, 'W')}`; }
    else {
      const q = sim.info(p.id); if (!q) continue;
      if (r.P) { const P = Math.abs(q.u * q.i); over = P / r.P; why = `Durchgebrannt: ${fmt(P, 'W')} statt höchstens ${fmt(r.P, 'W')}`; }
      if (r.I) { over = Math.abs(q.i) / r.I; why = `Durchgebrannt: ${fmt(Math.abs(q.i), 'A')} statt höchstens ${fmt(r.I, 'A')}`; }
      if (r.U) { over = Math.max(over, Math.abs(q.u) / r.U); if (Math.abs(q.u) > r.U) why = `Durchgeschlagen: ${fmt(Math.abs(q.u), 'V')} statt höchstens ${fmt(r.U, 'V')}`; }
      if (r.rev && q.u < -r.rev) { over = 3; why = `Geplatzt: ${fmt(-q.u, 'V')} in Sperrrichtung — ein Elko ist gepolt`; }
    }
    p.heat = over > 1 ? (p.heat || 0) + 1 : 0;
    if (over > 2.5 && p.heat > 8) {
      p.broken = why; p.heat = 0;
      hint(`${partTitle(p)}: ${why}.`);
      if (sel === p.id) renderInspector();
      changed(true);
      return;
    }
  }
  /* Sicherung im Multimeter: mehr als 400 mA durch die A-Buchse (wie am mA-Eingang echter Geräte) */
  for (const id of METERS) {
    const m = mt[id], a = sim.info(id + '.A');
    if (m.fuse && a && Math.abs(a.i) > FUSE) {
      if (++m.overI > 3) { m.fuse = false; m.overI = 0; dirty = true; hint(`Peng: Die 400-mA-Sicherung in ${INSTR_NAME[id]} ist durchgebrannt. Die A-Buchse ist fast ein Kurzschluss — Strom nur in Reihe messen!`); updateDmmControls(); }
    } else m.overI = 0;
  }
}

/* ---------- Multimeter-Anzeige ---------- */
function dmmSample() {
  const h = sim.step();
  for (const id of METERS) {
    const m = state[id].mode, nd = nodes[id], a = mt[id].acc;
    const q = m === 'ADC' || m === 'AAC' ? (mt[id].fuse ? (sim.v(nd.a) - sim.v(nd.c)) / SHUNT : 0) : sim.v(nd.v) - sim.v(nd.c);
    a.n += h; a.s += q * h; a.s2 += q * q * h; a.t += h;
  }
}
/* vier feste Stellen wie auf einem Multimeter-Display: 4,700 kΩ, 583,9 mV */
function dmmFmt(value, unit) {
  if (value === 0) return `0,000 ${unit}`;
  const pre = [[1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n']], abs = Math.abs(value);
  const [f, p] = pre.find(([x]) => abs >= x * .99995) || pre[pre.length - 1];
  return `${(value / f).toPrecision(4).replace('.', ',')} ${p}${unit}`;
}
function meterShow(now) {
  const need = state.fg.on ? clamp(3 / state.fg.f, .02, 1) : .02; // über ganze Generatorperioden mitteln
  for (const id of METERS) {
    const r = mt[id], a = r.acc, m = state[id].mode;
    if (a.t < need || now - r.lastShow < 250) continue;
    r.lastShow = now;
    const mean = a.s / a.n, ac = Math.sqrt(Math.max(0, a.s2 / a.n - mean * mean));
    r.acc = {n: 0, s: 0, s2: 0, t: 0};
    let text, unit = DMM_MODES[m][1], value = null;
    if (m === 'VDC' || m === 'ADC') { const ol = Math.abs(mean) > (m === 'VDC' ? 1000 : FUSE); text = ol ? 'OL' : dmmFmt(mean, unit); value = ol ? null : mean; }
    else if (m === 'VAC' || m === 'AAC') { text = dmmFmt(ac, unit); value = ac; }
    else if (m === 'DIODE') { text = mean > 2 ? 'OL' : dmmFmt(mean, 'V'); value = mean > 2 ? null : mean; }
    else {
      const I = OHM_RANGES[r.range];
      if (mean > 2.2 && r.range < OHM_RANGES.length - 1 && now > r.rangeHold) { r.range++; r.rangeHold = now + 300; dirty = true; text = '…'; }
      else if (mean < .18 && r.range > 0 && now > r.rangeHold) { r.range--; r.rangeHold = now + 300; dirty = true; text = '…'; }
      if (text !== '…') { text = mean > 2.2 ? 'OL' : dmmFmt(Math.max(0, mean) / I, 'Ω'); value = mean > 2.2 ? null : Math.max(0, mean) / I; }
    }
    if (!r.fuse && m.startsWith('A')) { text = 'FUSE'; value = null; }
    if (text === '…') continue;
    r.shown = text; r.value = value; r.unit = unit;
    $(id + '-display').innerHTML = `<b>${esc(text)}</b><small>${DMM_MODES[m][0]}${m === 'OHM' ? ' · Prüfstrom ' + fmt(OHM_RANGES[r.range], 'A') : ''}</small>`;
  }
}
function psuShow() {
  const ps = sim.info('psu');
  const fix = (v, d) => Math.max(0, v).toFixed(d).replace('.', ','); // wie das Display eines Labornetzgeräts: 10,00 V · 0,015 A
  $('psu-display').innerHTML = state.psu.on && ps ? `<b>${fix(ps.u, 2)} V</b><b>${fix(ps.i, 3)} A</b>` : '<b>—,— V</b><b>—,— A</b>';
  $('psu-cv').classList.toggle('on', !!(state.psu.on && ps && !ps.cc));
  $('psu-cc').classList.toggle('on', !!(state.psu.on && ps?.cc));
}

/* ---------- Dateien: CSV (Semikolon, Dezimalkomma — öffnet sich direkt in Excel), PNG, JSON, SPICE ---------- */
const stamp = () => { const d = new Date(), p = x => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };
function download(name, data, type = 'text/plain') {
  const blob = data instanceof Blob ? data : new Blob([data], {type: type + ';charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const csvNum = v => typeof v === 'number' && Number.isFinite(v) ? String(Number(v.toPrecision(7))).replace('.', ',') : '';
const csv = rows => '﻿' + rows.map(r => r.join(';')).join('\r\n') + '\r\n';
function scopeCsv() {
  if (!acq.have) { hint('Noch keine Aufnahme auf dem Schirm.'); return; }
  const used = [0, 1, 2].filter(traceOn), names = ['CH1', 'CH2', `Math ${MATH_NAME[state.osz.math] || ''}`.trim()];
  const rows = [['t nach Trigger (s)', ...used.map(c => `${names[c]} (V)`)]];
  for (let k = 0; k < COLS; k++) rows.push([csvNum(curTime((k + .5) / COLS)), ...used.map(c => shown[c].valid[k] ? csvNum(shown[c].mean[k]) : '')]);
  download(`oszi-${stamp()}.csv`, csv(rows), 'text/csv');
  hint(`CSV: ${COLS} Punkte (Mittelwert je Bildspalte), Semikolon und Dezimalkomma.`);
}

/* ---------- Analyse: Frequenzgang, Arbeitspunkt, Messreihe ---------- */
let anaTab = 'bode';
const ana = {bode: {res: null, keep: null, stamp: -1, at: 0, hover: null}, op: {stamp: -1, at: 0}};
const tabs = $('mp-tabs');
function showTab(name) {
  anaTab = name;
  tabs.querySelectorAll('[role="tab"]').forEach(b => { const on = b.dataset.tab === name; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  for (const id of ['bode', 'op', 'log']) $('ana-' + id).hidden = id !== name;
  if (name === 'bode') { ana.bode.stamp = -1; }
  if (name === 'op') ana.op.stamp = -1;
  if (name === 'log') renderLog();
}
tabs.addEventListener('click', ev => { const b = ev.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
tabs.addEventListener('keydown', ev => {
  const order = ['bode', 'op', 'log'], i = order.indexOf(anaTab);
  const next = ev.key === 'ArrowRight' ? order[(i + 1) % 3] : ev.key === 'ArrowLeft' ? order[(i + 2) % 3] : null;
  if (next) { ev.preventDefault(); showTab(next); tabs.querySelector(`[data-tab="${next}"]`).focus(); }
});
function analysisTick(now) {
  if (anaTab === 'bode' && ana.bode.stamp !== anaStamp && now - ana.bode.at > 300) { ana.bode.stamp = anaStamp; ana.bode.at = now; ana.bode.res = bodeCompute(); drawBode(); }
  if (anaTab === 'op' && ana.op.stamp !== anaStamp && now - ana.op.at > 300) { ana.op.stamp = anaStamp; ana.op.at = now; renderOp(); }
}

/* Frequenzgang: Kleinsignalanalyse wie SPICE .AC, angeregt vom Generator. H = U(CH2) / U(CH1), wie man es am Oszi misst;
   ohne CH1 bezogen auf die Leerlaufspannung des Generators. INV an den Kanälen dreht die Phase wie auf dem Schirm. */
const BODE_PER_DEC = 40;
function bodeCompute() {
  const b = state.bode, out = {f: [], db: [], ph: [], err: '', notes: []};
  if (!wired('osz:1')) { out.err = 'CH2 hängt an nichts. Für den Frequenzgang misst CH2 den Ausgang, CH1 den Eingang (oder Bezug Generator).'; return out; }
  const nb = buildNet({fg: true}), n1 = nb.nodeOf('osz:0'), n2 = nb.nodeOf('osz:1');
  if (n2 === 0) { out.err = 'CH2 liegt auf Masse — dort ist der Frequenzgang null.'; return out; }
  const useCh1 = b.ref === 'ch1' && wired('osz:0') && n1 !== 0;
  if (b.ref === 'ch1' && !useCh1) out.notes.push('CH1 hängt nicht im Signal — bezogen wird auf die Leerlaufspannung des Generators.');
  if (!state.fg.on) out.notes.push('Der Generator ist aus; gerechnet wird, als wäre er an.');
  out.refName = useCh1 ? 'CH1' : 'Generator (Leerlauf)';
  const n = Math.round(Math.log10(b.fmax / b.fmin) * BODE_PER_DEC) + 1;
  const freqs = Array.from({length: n}, (_, i) => b.fmin * 10 ** (i / BODE_PER_DEC));
  const ac = S.create();
  ac.load(nb.netlist);
  const o = state.osz, sign = (o.ch[1].inv ? -1 : 1) * (useCh1 && o.ch[0].inv ? -1 : 1);
  /* komplexes H für eine Liste von Frequenzen; null, wenn die Analyse scheitert */
  const evalH = fs => {
    const r = ac.ac(fs, 'fg', [n1, n2]);
    if (!r.ok) { out.err = r.error || 'Die Kleinsignalanalyse ist gescheitert.'; return null; }
    return fs.map((f, i) => { const [ar, ai] = useCh1 ? r.data[0][i] : [1, 0], [br, bi] = r.data[1][i], d = ar * ar + ai * ai; return [sign * (br * ar + bi * ai) / d, sign * (bi * ar - br * ai) / d]; });
  };
  const H = evalH(freqs);
  if (!H) return out;
  if (useCh1) { const r1 = ac.ac([freqs[0], freqs[freqs.length >> 1], freqs[freqs.length - 1]], 'fg', [n1]); if (r1.ok && r1.data[0].some(([a, b]) => Math.hypot(a, b) < 1e-3)) out.notes.push('CH1 sieht im Arbeitspunkt fast kein Kleinsignal (z. B. weil Dioden sperren) — der Quotient CH2/CH1 sagt dann wenig. Für Gleichrichter ist das Oszi das richtige Werkzeug.'); }
  let prev = null, wrap = 0;
  freqs.forEach((f, i) => {
    const [hr, hi] = H[i], mag = Math.hypot(hr, hi);
    let ph = Math.atan2(hi, hr) * 180 / Math.PI;
    if (prev !== null) { while (ph + wrap - prev > 180) wrap -= 360; while (ph + wrap - prev < -180) wrap += 360; }
    ph += wrap; prev = ph;
    out.f.push(f); out.db.push(Number.isFinite(mag) && mag > 0 ? 20 * Math.log10(mag) : NaN); out.ph.push(Number.isFinite(ph) ? ph : NaN);
  });
  out.mk = bodeMarkers(out, evalH);
  return out;
}
const logspace = (a, b, n) => Array.from({length: n}, (_, i) => a * (b / a) ** (i / (n - 1)));
/* Maximum, −3-dB-Punkte (unter dem Maximum) und Steigung an den Rändern. Grob gerastert sind 40 Punkte je Dekade;
   um Maximum und Schnittpunkte wird fein nachgerechnet, damit auch schmale Resonanzen (Q ≈ 100) genau herauskommen. */
function bodeMarkers(r, evalH) {
  const db = r.db, f = r.f, n = f.length;
  let iMax = 0;
  for (let i = 1; i < n; i++) if (db[i] > db[iMax] || !Number.isFinite(db[iMax])) iMax = i;
  let top = db[iMax], fTop = f[iMax];
  if (iMax > 0 && iMax < n - 1) {
    const fs = logspace(f[iMax - 1], f[iMax + 1], 81), Hf = evalH(fs);
    if (Hf) Hf.forEach(([a, b], i) => { const v = 20 * Math.log10(Math.hypot(a, b)); if (v > top) { top = v; fTop = fs[i]; } });
  }
  const lvl = top - 10 * Math.log10(2), cuts = [];
  for (let i = 1; i < n; i++) {
    const a = db[i - 1], b = db[i];
    if (!(Number.isFinite(a) && Number.isFinite(b) && (a - lvl) * (b - lvl) < 0)) continue;
    const fs = logspace(f[i - 1], f[i], 41), Hf = evalH(fs);
    if (!Hf) break;
    const d = Hf.map(([x, y]) => 20 * Math.log10(Math.hypot(x, y)));
    for (let k = 1; k < fs.length; k++) {
      if ((d[k - 1] - lvl) * (d[k] - lvl) > 0) continue;
      const t = (lvl - d[k - 1]) / ((d[k] - d[k - 1]) || 1), fc = 10 ** (Math.log10(fs[k - 1]) + t * (Math.log10(fs[k]) - Math.log10(fs[k - 1])));
      const [x0, y0] = Hf[k - 1], [x1, y1] = Hf[k], near = r.ph[i - 1] + (r.ph[i] - r.ph[i - 1]) * (k - 1 + t) / 40;
      let ph = Math.atan2(y0 + t * (y1 - y0), x0 + t * (x1 - x0)) * 180 / Math.PI;
      ph += 360 * Math.round((near - ph) / 360);
      cuts.push({f: fc, ph});
      break;
    }
  }
  /* Resonanzspitze nur, wenn die Kurve auf beiden Seiten um 3 dB fällt und das Band schmal ist (Q über etwa 0,6) */
  const below = cuts.filter(c => c.f < fTop).pop(), above = cuts.find(c => c.f > fTop);
  const peak = below && above && above.f / below.f < 3 && iMax > 0 && iMax < n - 1 ? {f: fTop, db: top, Q: fTop / (above.f - below.f)} : null;
  const slope = (i0, i1) => (db[i1] - db[i0]) / (Math.log10(f[i1]) - Math.log10(f[i0]));
  const k = Math.min(BODE_PER_DEC, n - 1);
  return {top, fTop, cuts, peak, band: below && above ? above.f - below.f : null, lo: slope(0, k), hi: slope(n - 1 - k, n - 1)};
}
const bodeAt = (r, f) => {
  const x = (Math.log10(f) - Math.log10(r.f[0])) * BODE_PER_DEC, i = Math.floor(x), t = x - i;
  if (i < 0 || i >= r.f.length - 1) return null;
  return {db: r.db[i] + t * (r.db[i + 1] - r.db[i]), ph: r.ph[i] + t * (r.ph[i + 1] - r.ph[i])};
};
function niceRange(lo, hi, steps, target) {
  if (!(hi - lo > 1e-9)) { lo -= 1; hi += 1; }
  const st = steps.find(s => (hi - lo) / s <= target) || steps[steps.length - 1];
  return {lo: Math.floor(lo / st) * st, hi: Math.ceil(hi / st) * st, st};
}
const bodeEl = $('bode-plot'), bpen = bodeEl.getContext('2d');
/* nur Punkte aus dem Versuch, der gerade aufgebaut ist (bzw. aus eigenen Aufbauten) */
const logPoints = () => state.log.filter(p => p.f && p.u1 && p.u2 && p.v === (state.versuch || '')).map(p => ({f: p.f, db: 20 * Math.log10(p.u2 / p.u1), ph: p.ph}));
const versuchTag = id => { const i = VERSUCHE.findIndex(v => v.id === id); return i < 0 ? 'eigen' : String(i + 1).padStart(2, '0'); };
let bodeGeom = null;
function drawBode() {
  const W = bodeEl.clientWidth;
  if (!W) return;
  const H = Math.round(clamp(W * .52, 300, 500)), ratio = Math.min(devicePixelRatio || 1, 2);
  if (bodeEl.width !== Math.round(W * ratio) || bodeEl.height !== Math.round(H * ratio)) { bodeEl.width = Math.round(W * ratio); bodeEl.height = Math.round(H * ratio); }
  bodeEl.style.height = H + 'px';
  const g = bpen, cs = getComputedStyle(document.documentElement), col = name => cs.getPropertyValue(name).trim();
  const C = {bg: col('--card'), fg: col('--fg'), text: col('--plot-text'), major: col('--grid-major'), minor: col('--grid-minor'), ph: col('--mp-ch2'), red: col('--mp-red'), mark: col('--control'), muted: col('--soft')};
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.font = '10px Meslo, ui-monospace, monospace'; g.textBaseline = 'middle';
  const r = ana.bode.res;
  bodeRead();
  if (!r || r.err) { g.fillStyle = C.text; g.textAlign = 'center'; g.fillText(r ? r.err : 'Rechne …', W / 2, H / 2, W - 30); bodeGeom = null; return; }
  const L = 46, R = 12, T = 12, B = 24, gap = 22, plotH = H - T - B - gap, h1 = Math.round(plotH * .56), h2 = plotH - h1, y1 = T, y2 = T + h1 + gap;
  const lf0 = Math.log10(state.bode.fmin), lf1 = Math.log10(state.bode.fmax), X = f => L + (Math.log10(f) - lf0) / (lf1 - lf0) * (W - L - R);
  const pts = state.bode.ref === 'ch1' ? logPoints() : [], keep = ana.bode.keep;
  const dbs = r.db.concat(keep ? keep.db : [], pts.map(p => p.db)).filter(Number.isFinite), phs = r.ph.concat(keep ? keep.ph : [], pts.map(p => p.ph)).filter(Number.isFinite);
  const dMax = Math.max(...dbs), dMin = Math.max(Math.min(...dbs), dMax - 140);
  const dr = niceRange(dMin - 2, dMax + 2, [1, 2, 5, 10, 20, 40, 50, 100], 7), pr = niceRange(Math.min(...phs) - 5, Math.max(...phs) + 5, [5, 10, 15, 30, 45, 90, 180], 5);
  const Y1 = v => y1 + (dr.hi - v) / (dr.hi - dr.lo) * h1, Y2 = v => y2 + (pr.hi - v) / (pr.hi - pr.lo) * h2;
  bodeGeom = {L, R, W, X, lf0, lf1};
  /* Raster */
  g.lineWidth = 1;
  const perDec = (W - L - R) / (lf1 - lf0), every = perDec >= 48 ? 1 : perDec >= 24 ? 2 : 3; // Beschriftung ausdünnen, wenn es eng wird
  for (let e = Math.floor(lf0); e <= Math.ceil(lf1); e++) for (let k = 1; k < 10; k++) {
    const f = k * 10 ** e;
    if (f < state.bode.fmin * .999 || f > state.bode.fmax * 1.001) continue;
    g.strokeStyle = k === 1 ? C.major : C.minor; g.beginPath();
    const x = Math.round(X(f)) + .5; g.moveTo(x, y1); g.lineTo(x, y1 + h1); g.moveTo(x, y2); g.lineTo(x, y2 + h2); g.stroke();
    if (k === 1 && (e - Math.round(lf0)) % every === 0) { g.fillStyle = C.text; g.textAlign = 'center'; g.fillText(fmt(f, 'Hz'), clamp(x, L + 16, W - R - 18), y2 + h2 + 12); }
  }
  g.textAlign = 'right';
  for (let v = dr.lo; v <= dr.hi + 1e-9; v += dr.st) { const y = Math.round(Y1(v)) + .5; g.strokeStyle = v === 0 ? C.text : C.major; g.beginPath(); g.moveTo(L, y); g.lineTo(W - R, y); g.stroke(); g.fillStyle = C.text; g.fillText(num(v, 3), L - 5, y); }
  for (let v = pr.lo; v <= pr.hi + 1e-9; v += pr.st) { const y = Math.round(Y2(v)) + .5; g.strokeStyle = C.major; g.beginPath(); g.moveTo(L, y); g.lineTo(W - R, y); g.stroke(); g.fillStyle = C.text; g.fillText(num(v, 3) + '°', L - 5, y); }
  g.strokeStyle = C.text; g.strokeRect(L + .5, y1 + .5, W - L - R - 1, h1 - 1); g.strokeRect(L + .5, y2 + .5, W - L - R - 1, h2 - 1);
  g.textAlign = 'left'; g.fillStyle = C.text;
  g.fillText('|H| in dB', L + 6, y1 + 9); g.fillText('φ in °', L + 6, y2 + 9);
  /* Kurven */
  const curve = (ys, Y, color, width, dash) => {
    g.save(); g.beginPath(); g.rect(L, Y === Y1 ? y1 : y2, W - L - R, Y === Y1 ? h1 : h2); g.clip();
    g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash); g.beginPath();
    let open = false;
    r.f.forEach((f, i) => { const v = ys[i]; if (!Number.isFinite(v)) { open = false; return; } const x = X(f), y = Y(v); if (!open) { g.moveTo(x, y); open = true; } else g.lineTo(x, y); });
    g.stroke(); g.restore();
  };
  if (keep && keep.f.length === r.f.length && keep.f[0] === r.f[0]) { curve(keep.db, Y1, C.muted, 1.5, [5, 4]); curve(keep.ph, Y2, C.muted, 1.5, [5, 4]); }
  curve(r.db, Y1, C.fg, 2, []); curve(r.ph, Y2, C.ph, 2, []);
  /* Markierungen */
  const vline = (x, color, dash) => { g.strokeStyle = color; g.lineWidth = 1; g.setLineDash(dash); g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y1 + h1); g.moveTo(x, y2); g.lineTo(x, y2 + h2); g.stroke(); g.setLineDash([]); };
  for (const c of r.mk.cuts) { const x = X(c.f); vline(x, C.text, [2, 3]); g.fillStyle = C.fg; g.beginPath(); g.arc(x, Y1(r.mk.top - 3.0103), 3.5, 0, 7); g.fill(); g.beginPath(); g.arc(x, Y2(c.ph), 3, 0, 7); g.fill(); }
  if (r.mk.peak) { const x = X(r.mk.peak.f), y = Y1(r.mk.peak.db); g.fillStyle = C.fg; g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x - 5, y - 11); g.lineTo(x + 5, y - 11); g.fill(); }
  const ff = state.fg.f;
  if (ff >= state.bode.fmin && ff <= state.bode.fmax) { const x = X(ff); vline(x, C.mark, [6, 3]); g.fillStyle = C.mark; g.textAlign = 'center'; g.fillText('FG', x, y1 + h1 + gap / 2); }
  g.fillStyle = C.red;
  for (const p of pts) { if (p.f < state.bode.fmin || p.f > state.bode.fmax) continue; const x = X(p.f); g.beginPath(); g.arc(x, Y1(p.db), 4, 0, 7); g.fill(); if (Number.isFinite(p.ph)) { g.beginPath(); g.arc(x, Y2(p.ph), 3.5, 0, 7); g.fill(); } }
  const hv = ana.bode.hover;
  if (hv) { const at = bodeAt(r, hv); if (at) { const x = X(hv); vline(x, C.fg, []); g.fillStyle = C.fg; g.beginPath(); g.arc(x, Y1(at.db), 3, 0, 7); g.fill(); g.fillStyle = C.ph; g.beginPath(); g.arc(x, Y2(at.ph), 3, 0, 7); g.fill(); } }
}
function bodeRead() {
  const r = ana.bode.res, el = $('bode-read');
  if (!r || r.err) { el.innerHTML = ''; return; }
  const lines = [], mk = r.mk, lin = db => num(10 ** (db / 20), 4);
  const head = [`Bezug ${r.refName}`, `Maximum ${num(mk.top, 3)} dB (${lin(mk.top)}-fach)`];
  if (mk.peak) head.push(`Resonanz bei ${fmt(mk.peak.f, 'Hz', 4)}, Q = f₀/B ≈ ${num(mk.peak.Q, 3)}`);
  lines.push(head.join(' · '));
  if (mk.cuts.length) lines.push('−3 dB unter dem Maximum: ' + mk.cuts.map(c => `${fmt(c.f, 'Hz', 4)} (φ = ${num(c.ph, 3)}°)`).join(', ') + (mk.band ? ` · Bandbreite B = ${fmt(mk.band, 'Hz', 3)}` : ''));
  const sl = [];
  if (Math.abs(mk.lo) > 3) sl.push(`unten ${mk.lo > 0 ? '+' : ''}${num(mk.lo, 2)} dB/Dekade`);
  if (Math.abs(mk.hi) > 3) sl.push(`oben ${mk.hi > 0 ? '+' : ''}${num(mk.hi, 2)} dB/Dekade`);
  if (sl.length) lines.push('Steigung am Rand: ' + sl.join(', '));
  const at = bodeAt(r, state.fg.f);
  if (at) lines.push(`Bei f_FG = ${fmt(state.fg.f, 'Hz', 4)}: |H| = ${lin(at.db)} (${num(at.db, 3)} dB), φ = ${num(at.ph, 3)}°`);
  const hv = ana.bode.hover, ah = hv && bodeAt(r, hv);
  lines.push(ah ? `<b>Zeiger: ${fmt(hv, 'Hz', 3)} → |H| = ${lin(ah.db)} (${num(ah.db, 3)} dB), φ = ${num(ah.ph, 3)}°</b>` : '<span class="muted">Über das Diagramm fahren oder tippen: Werte ablesen.</span>');
  for (const nt of r.notes) lines.push(`<span class="mp-warn">${esc(nt)}</span>`);
  el.innerHTML = lines.join('<br>');
}
function bodeHover(ev) {
  if (!bodeGeom) return;
  const rect = bodeEl.getBoundingClientRect(), x = ev.clientX - rect.left, {L, R, W, lf0, lf1} = bodeGeom;
  ana.bode.hover = x < L || x > W - R ? null : 10 ** (lf0 + (x - L) / (W - L - R) * (lf1 - lf0));
  drawBode();
}
bodeEl.addEventListener('pointermove', bodeHover);
bodeEl.addEventListener('pointerdown', bodeHover);
bodeEl.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') { ana.bode.hover = null; drawBode(); } });
$('ana-bode').addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  const s = state.bode, d = b.dataset;
  if (d.bodeRef) s.ref = d.bodeRef;
  else if (d.bodeF === 'min') s.fmin = clamp(s.fmin * 10 ** Number(d.dir), .1, s.fmax / 10);
  else if (d.bodeF === 'max') s.fmax = clamp(s.fmax * 10 ** Number(d.dir), s.fmin * 10, 1e7);
  else if (b.id === 'bode-keep') { ana.bode.keep = ana.bode.keep ? null : ana.bode.res && !ana.bode.res.err ? {f: ana.bode.res.f.slice(), db: ana.bode.res.db.slice(), ph: ana.bode.res.ph.slice()} : null; if (ana.bode.keep) hint('Kurve gemerkt (gestrichelt). Jetzt etwas ändern und vergleichen.'); }
  else if (b.id === 'bode-csv') { const r = ana.bode.res; if (!r || r.err) return; download(`frequenzgang-${stamp()}.csv`, csv([['f (Hz)', '|H|', '|H| (dB)', 'Phase (°)'], ...r.f.map((f, i) => [csvNum(f), csvNum(10 ** (r.db[i] / 20)), csvNum(r.db[i]), csvNum(r.ph[i])])]), 'text/csv'); return; }
  else return;
  updateBodeControls(); save(); drawBode();
});
function updateBodeControls() {
  const s = state.bode;
  $('ana-bode').querySelectorAll('[data-bode-ref]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bodeRef === s.ref)));
  $('bode-fmin').textContent = fmt(s.fmin, 'Hz'); $('bode-fmax').textContent = fmt(s.fmax, 'Hz');
  $('bode-keep').textContent = ana.bode.keep ? 'Vergleich löschen' : 'Kurve merken';
}

/* Arbeitspunkt (.OP): Kondensatoren offen, Spulen kurz, der Generator liefert nur seinen Offset */
function renderOp() {
  const el = $('op-out'), nb = buildNet(), s2 = S.create();
  s2.load(nb.netlist);
  const op = s2.operatingPoint();
  if (!op.ok) { el.innerHTML = `<p class="mp-warn">${esc(s2.error || 'Kein Arbeitspunkt gefunden: Die Schaltung kippt oder schwingt im Gleichstromfall.')}</p>`; return; }
  /* Knoten mit Namen aller Buchsen, die daran hängen */
  const nodesMap = new Map();
  for (const p of state.parts) PARTS[p.type].geom.pins.forEach((_, i) => {
    const key = `${p.id}:${i}`, k = nb.nodeOf(key);
    if (PARTS[p.type].instr && !wired(key) && !(p.id === 'fg' && i === 1) && !(p.id === 'osz' && i === 2)) return;
    if (!nodesMap.has(k)) nodesMap.set(k, []);
    nodesMap.get(k).push(pinName(key));
  });
  const nodeRows = [...nodesMap].sort((a, b) => (a[0] === 0) - (b[0] === 0) || op.v(b[0]) - op.v(a[0])).map(([k, list]) => `<tr><td>${k === 0 ? '0 V (Masse)' : fmt(op.v(k), 'V', 4)}</td><td class="l">${esc(list.slice(0, 8).join(', '))}${list.length > 8 ? ' …' : ''}</td></tr>`);
  const partRowsHtml = state.parts.filter(p => !PARTS[p.type].instr && p.type !== 'GND').map(p => {
    const rows = p.broken ? [['Zustand', 'defekt']] : partRows(p, op.info);
    return `<tr><th class="l">${esc(p.ref)}</th><td class="l">${esc(PARTS[p.type].name)}</td><td class="l">${rows.map(([k, v]) => `<span class="op-kv">${k} = <b>${v}</b></span>`).join(' ')}</td></tr>`;
  });
  const ps = op.info('psu'), fgI = op.info('fg');
  const extra = [];
  if (ps) extra.push(`Netzgerät: ${fmt(ps.u, 'V', 4)}, ${fmt(ps.i, 'A', 4)}${ps.cc ? ' (Strombegrenzung)' : ''}`);
  if (fgI && state.fg.on) extra.push(`Generator: Klemme ${fmt(fgI.u, 'V', 4)}, Strom ${fmt(fgI.i, 'A', 3)}`);
  el.innerHTML = `<p class="dev-hint">Gleichstrom-Arbeitspunkt wie SPICE .OP: Kondensatoren offen, Spulen kurzgeschlossen, der Generator liefert nur seinen Offset (${fmt((state.fg.load === '50' ? 2 : 1) * state.fg.off, 'V')}). ${esc(extra.join(' · '))}</p>
    <div class="mp-tablewrap"><table class="mp-table"><thead><tr><th>Potential</th><th class="l">Knoten (Buchsen)</th></tr></thead><tbody>${nodeRows.join('') || '<tr><td colspan="2" class="l">Kein Knoten außer Masse.</td></tr>'}</tbody></table></div>
    <div class="mp-tablewrap"><table class="mp-table"><thead><tr><th class="l">Teil</th><th class="l">Bauteil</th><th class="l">Werte</th></tr></thead><tbody>${partRowsHtml.join('') || '<tr><td colspan="3" class="l">Noch keine Bauteile.</td></tr>'}</tbody></table></div>`;
}

/* Messreihe: Punkte vom Oszi und den Multimetern notieren, als CSV speichern, im Bode-Diagramm zeigen */
function addLogPoint() {
  if (state.log.length >= 200) { hint('Die Messreihe ist voll (200 Punkte).'); return; }
  const m = acq.meas, o = state.osz, on = c => o.ch[c].on && wired(`osz:${c}`) && m?.[c];
  /* ein Multimeter zählt nur, wenn seine Messbuchsen auch stecken */
  const meter = id => wired(id + ':1') && wired(id + (state[id].mode.startsWith('A') ? ':2' : ':0')) && mt[id].value !== null ? [mt[id].value, mt[id].unit] : [null, ''];
  const [m1, m1u] = meter('dmm'), [m2, m2u] = meter('dmm2');
  state.log.push({f: state.fg.on ? state.fg.f : null, f1: on(0) ? m[0].f || null : null, u1: on(0) ? m[0].vpp : null, u2: on(1) ? m[1].vpp : null, ph: on(0) && on(1) ? m.phase ?? null : null, m1, m1u, m2, m2u, v: state.versuch || ''});
  save(); renderLog(); ana.bode.stamp = -1;
  hint(`Messpunkt ${state.log.length} notiert${state.fg.on ? ` (f = ${fmt(state.fg.f, 'Hz', 4)})` : ''}. Tab „Messreihe“ unten.`);
}
function renderLog() {
  $('log-count').textContent = state.log.length ? ` (${state.log.length})` : '';
  const el = $('log-out');
  if (!state.log.length) { el.innerHTML = '<p class="dev-hint">Noch keine Messpunkte. „＋ Messreihe“ am Oszilloskop notiert die Generatorfrequenz, beide Spitze-Spitze-Werte, die Phase und beide Multimeter. Mit Bezug CH1 erscheinen die Punkte des aktuellen Versuchs rot im Bode-Diagramm.</p>'; return; }
  const v = (x, u) => x === null ? '—' : fmt(x, u, 4);
  el.innerHTML = `<div class="mp-tablewrap"><table class="mp-table"><thead><tr><th>Nr.</th><th title="Versuch, in dem der Punkt notiert wurde">Vers.</th><th>f Generator</th><th>f gemessen</th><th>CH1 Uss</th><th>CH2 Uss</th><th>CH2/CH1</th><th>dB</th><th>Phase</th><th>Multimeter 1</th><th>Multimeter 2</th><th></th></tr></thead><tbody>${state.log.map((p, i) => {
    const r = p.u1 && p.u2 ? p.u2 / p.u1 : null;
    return `<tr${p.v === (state.versuch || '') ? '' : ' class="other"'}><td>${i + 1}</td><td>${versuchTag(p.v)}</td><td>${v(p.f, 'Hz')}</td><td>${v(p.f1, 'Hz')}</td><td>${v(p.u1, 'V')}</td><td>${v(p.u2, 'V')}</td><td>${r === null ? '—' : num(r, 4)}</td><td>${r === null ? '—' : num(20 * Math.log10(r), 3)}</td><td>${p.ph === null ? '—' : num(p.ph, 3) + '°'}</td><td>${v(p.m1, p.m1u)}</td><td>${v(p.m2, p.m2u)}</td><td><button type="button" class="mini" data-log-del="${i}" aria-label="Punkt ${i + 1} löschen">×</button></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
$('ana-log').addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  if (b.id === 'log-add') addLogPoint();
  else if (b.dataset.logDel !== undefined) { state.log.splice(Number(b.dataset.logDel), 1); save(); renderLog(); }
  else if (b.id === 'log-clear') { if (state.log.length && confirm(`Alle ${state.log.length} Messpunkte löschen?`)) { state.log = []; save(); renderLog(); } }
  else if (b.id === 'log-csv') {
    if (!state.log.length) { hint('Die Messreihe ist leer.'); return; }
    const rows = [['Nr', 'Versuch', 'f Generator (Hz)', 'f gemessen (Hz)', 'CH1 Uss (V)', 'CH2 Uss (V)', 'CH2/CH1', 'dB', 'Phase (°)', 'Multimeter 1', 'Einheit', 'Multimeter 2', 'Einheit']];
    state.log.forEach((p, i) => { const r = p.u1 && p.u2 ? p.u2 / p.u1 : null; rows.push([i + 1, p.v ? VERSUCHE.find(x => x.id === p.v)?.title || p.v : 'eigener Aufbau', csvNum(p.f), csvNum(p.f1), csvNum(p.u1), csvNum(p.u2), csvNum(r), csvNum(r && 20 * Math.log10(r)), csvNum(p.ph), csvNum(p.m1), p.m1u, csvNum(p.m2), p.m2u]); });
    download(`messreihe-${stamp()}.csv`, csv(rows), 'text/csv');
  }
});

/* ---------- SPICE-Netzliste (für LTspice oder ngspice): gleiche Modelle wie hier ---------- */
const SPICE_MODELS = {
  '1N4148': '.model 1N4148 D(Is=2.52n N=1.752)',
  LED: '.model LEDROT D(Is=1e-18 N=1.9)',
  ZD5V1: '.model ZD5V1 D(Is=1e-14 N=1 BV=5.1 IBV=5m NBV=4)',
  BODY: '.model BODY D(Is=1e-11 N=1.5 BV=60 IBV=1m NBV=2)',
  BC547: '.model BC547 NPN(Is=1e-14 BF=300 BR=5)',
  BC557: '.model BC557 PNP(Is=1e-14 BF=300 BR=5)',
  '2N7000': '.model 2N7000 NMOS(Level=1 Vto=2.1 Kp=0.1 Lambda=0.02)',
  OPV: ['.subckt OPV inp inn out', '* 200 000-fach, 1 MHz Transitfrequenz, Ausgang +-13,5 V hinter 50 Ohm', 'G1 0 x inp inn 1', 'R1 x 0 2e5', 'C1 x 0 159.15n', 'B1 y 0 V=min(max(V(x),-13.5),13.5)', 'R2 y out 50', '.ends OPV'].join('\n')
};
function spiceNetlist() {
  const nb = buildNet(), L = [], models = new Set();
  const P = (p, i) => { const k = nb.nodeOf(`${p.id}:${i}`); return k ? 'N' + String(k).padStart(3, '0') : '0'; };
  const v = x => String(Number(x.toPrecision(6)));
  const nm = (letter, ref) => (ref.toUpperCase().startsWith(letter) ? '' : letter) + ref;
  const vs = VERSUCHE.find(x => x.id === state.versuch);
  L.push(`* osci//log Messplatz: ${vs ? `Versuch „${vs.title}“` : 'eigener Aufbau'}, ${new Date().toLocaleString('de-AT')}`, '* Knoten 0 = Masse (Schutzleiter von Generator und Oszilloskop). Werte in SI-Einheiten.');
  for (const p of state.parts) {
    if (p.broken) { L.push(`* ${p.ref}: defekt, weggelassen`); continue; }
    const r = p.ref;
    switch (p.type) {
      case 'R': L.push(`${nm('R', r)} ${P(p, 0)} ${P(p, 1)} ${v(p.p.R)}`); break;
      case 'C': case 'E': L.push(`${nm('C', r)} ${P(p, 0)} ${P(p, 1)} ${v(p.p.C)}`); break;
      case 'L': L.push(`${nm('L', r)} ${P(p, 0)} ${P(p, 1)} ${v(p.p.L)}`); break;
      case 'POT': L.push(`${nm('R', r)}A ${P(p, 0)} ${P(p, 2)} ${v(Math.max(1, p.p.R * p.p.pos))}`, `${nm('R', r)}B ${P(p, 2)} ${P(p, 1)} ${v(Math.max(1, p.p.R * (1 - p.p.pos)))}`); break;
      case 'SW': L.push(`* ${r}: Schalter ${p.p.zu ? 'geschlossen' : 'offen'}`, `${nm('R', r)} ${P(p, 0)} ${P(p, 1)} ${p.p.zu ? '0.01' : '1e12'}`); break;
      case 'D': case 'LED': case 'Z': { const m = PARTS[p.type].model; models.add(m); L.push(`${nm('D', r)} ${P(p, 0)} ${P(p, 1)} ${m === 'LED' ? 'LEDROT' : m}`); break; }
      case 'NPN': case 'PNP': { const m = PARTS[p.type].model, c = P(p, 1), b = P(p, 0), e = P(p, 2); models.add(m); L.push(`${nm('Q', r)} ${c} ${b} ${e} ${m}`, `${nm('C', r)}BE ${b} ${e} 25p`, `${nm('C', r)}BC ${b} ${c} 4p`); break; }
      case 'NMOS': { const dr = P(p, 1), g = P(p, 0), s = P(p, 2); models.add('2N7000'); models.add('BODY'); L.push(`${nm('M', r)} ${dr} ${g} ${s} ${s} 2N7000`, `${nm('D', r)}B ${s} ${dr} BODY`, `${nm('C', r)}GS ${g} ${s} 20p`, `${nm('C', r)}GD ${g} ${dr} 5p`); break; }
      case 'OP': models.add('OPV'); L.push(`${nm('X', r)} ${P(p, 1)} ${P(p, 0)} ${P(p, 2)} OPV`); break;
      case 'TR': { const a = nm('L', r); L.push(`${a}P ${P(p, 0)} ${P(p, 1)} ${v(TR.L1)}`, `${a}S ${P(p, 2)} ${P(p, 3)} ${v(TR.L1 / p.p.n ** 2)}`, `${nm('K', r)} ${a}P ${a}S ${TR.kc}`); break; }
      case 'V': L.push(`${nm('V', r)} ${P(p, 0)} ${P(p, 1)} DC ${v(p.p.V)}`); break;
      case 'I': L.push(`${nm('I', r)} ${P(p, 0)} ${P(p, 1)} DC ${v(p.p.I)}`); break;
      case 'FG': {
        const f = state.fg;
        if (!f.on) break;
        const k = f.load === '50' ? 2 : 1, amp = k * f.vpp / 2, off = k * f.off, T = 1 / f.f, lo = off - amp, hi = off + amp, tr = T / 1000;
        const src = {square: `PULSE(${v(lo)} ${v(hi)} 0 ${v(tr)} ${v(tr)} ${v(T * f.duty / 100 - tr)} ${v(T)})`, triangle: `PULSE(${v(lo)} ${v(hi)} 0 ${v(T / 2 * (1 - 1e-6))} ${v(T / 2 * (1 - 1e-6))} ${v(T * 1e-6)} ${v(T)})`,
          saw: `PULSE(${v(lo)} ${v(hi)} 0 ${v(T - 2 * tr)} ${v(tr)} ${v(tr)} ${v(T)})`}[f.wave] || `SIN(${v(off)} ${v(amp)} ${v(f.f)})`;
        L.push('* Funktionsgenerator: Leerlaufspannung hinter 50 Ohm', `VFG FGE 0 ${src} AC 1`, `RFG FGE ${P(p, 0)} 50`);
        break;
      }
      case 'PSU': if (state.psu.on) L.push(`* Netzgerät: Strombegrenzung ${fmt(state.psu.I, 'A')} fehlt in dieser Netzliste`, `VNG ${P(p, 0)} ${P(p, 1)} DC ${v(state.psu.V)}`); break;
      case 'OSZ': state.osz.ch.forEach((ch, c) => { const k = P(p, c); if (k === '0' || !wired(`osz:${c}`)) return; const x10 = ch.probe === 10; L.push(`ROSZ${c + 1} ${k} 0 ${x10 ? '10e6' : '1e6'}`, `COSZ${c + 1} ${k} 0 ${x10 ? '12p' : '100p'}`); }); break;
      case 'DMM': {
        const tag = p.id === 'dmm' ? 'DMM1' : 'DMM2', mode = state[p.id].mode;
        if (wired(`${p.id}:2`) && mt[p.id].fuse) L.push(`R${tag}A ${P(p, 2)} ${P(p, 1)} 0.1`);
        if (mode === 'OHM' || mode === 'DIODE') L.push(`* ${INSTR_NAME[p.id]}: Prüfstrom des Ohm-/Diodentests weggelassen`);
        else if (wired(`${p.id}:0`)) L.push(`R${tag}V ${P(p, 0)} ${P(p, 1)} 10e6`);
        break;
      }
    }
  }
  /* Bezug nur für potentialfreie Inseln, die in der Netzliste auch vorkommen */
  const used = new Set(L.filter(l => !l.startsWith('*')).join(' ').match(/\bN\d{3}\b/g) || []);
  const refs = nb.netlist.devices.filter(d => d.id.startsWith('bezug.')).map(d => 'N' + String(d.n[0]).padStart(3, '0')).filter(k => used.has(k));
  if (refs.length) L.push('* Bezug für potentialfreie Teile, sonst ist das Gleichungssystem singulär', ...refs.map(k => `RBEZUG${k.slice(1)} ${k} 0 1e9`));
  for (const m of models) L.push(SPICE_MODELS[m]);
  const dt = v(chooseDt());
  L.push(`.tran ${dt} ${v(state.osz.tdiv * 50)} 0 ${dt}`, `* .ac dec ${BODE_PER_DEC} ${v(state.bode.fmin)} ${v(state.bode.fmax)}`, '* .op', '.end');
  return L.join('\n') + '\n';
}

/* ---------- Gespeicherte Aufbauten, Datei öffnen und speichern ---------- */
const filePanel = $('mp-filepanel');
function savedList() { try { const x = JSON.parse(localStorage.getItem(SAVES)); return Array.isArray(x) ? x.filter(e => e && typeof e.name === 'string' && e.data) : []; } catch { return []; } }
function storeSaved(list) { try { localStorage.setItem(SAVES, JSON.stringify(list)); return true; } catch { return false; } }
function renderSaved() {
  const list = savedList();
  $('mp-saved').innerHTML = list.length ? list.map((e, i) => `<li><button type="button" class="mp-linkbtn" data-load="${i}">${esc(e.name)}</button><small>${new Date(e.at).toLocaleString('de-AT', {dateStyle: 'short', timeStyle: 'short'})}</small><button type="button" class="mini" data-unsave="${i}" aria-label="${esc(e.name)} löschen">×</button></li>`).join('') : '<li class="muted">Noch nichts gespeichert. Gespeichert wird nur in diesem Browser.</li>';
}
function applyState(next, msg) {
  undoStack.past.push(snapshot()); undoStack.future = [];
  state = next; sel = null; ropes.clear(); syncId();
  restart(); updateAll(); updateBodeControls(); renderVersuch(); changed(true); renderLog();
  ana.bode.stamp = -1; ana.op.stamp = -1;
  hint(msg);
}
$('mp-save-form').addEventListener('submit', ev => {
  ev.preventDefault();
  const name = $('mp-save-name').value.trim().slice(0, 40);
  if (!name) { hint('Erst einen Namen eingeben.'); $('mp-save-name').focus(); return; }
  const list = savedList().filter(e => e.name !== name);
  list.unshift({name, at: Date.now(), data: JSON.parse(JSON.stringify(state))});
  if (!storeSaved(list.slice(0, 30))) { hint('Speichern ging nicht: Der Browser-Speicher ist voll oder gesperrt. „Als Datei“ geht immer.'); return; }
  $('mp-save-name').value = ''; renderSaved(); hint(`„${name}“ gespeichert.`);
});
filePanel.addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  const list = savedList();
  if (b.dataset.load !== undefined) { const e = list[Number(b.dataset.load)], s = e && sanitize(e.data); if (s) applyState(s, `„${e.name}“ geladen.`); else hint('Dieser Aufbau lässt sich nicht mehr lesen.'); }
  else if (b.dataset.unsave !== undefined) { const e = list[Number(b.dataset.unsave)]; if (e && confirm(`„${e.name}“ löschen?`)) { list.splice(Number(b.dataset.unsave), 1); storeSaved(list); renderSaved(); } }
  else if (b.id === 'mp-json') download(`messplatz-${stamp()}.json`, JSON.stringify(state, null, 1), 'application/json');
  else if (b.id === 'mp-spice') { download(`messplatz-${stamp()}.cir`, spiceNetlist(), 'text/plain'); hint('SPICE-Netzliste gespeichert: .tran ist aktiv, .ac und .op stehen auskommentiert darunter.'); }
  else if (b.id === 'mp-open-btn') $('mp-open').click();
});
$('mp-open').addEventListener('change', ev => {
  const file = ev.target.files?.[0];
  ev.target.value = '';
  if (!file) return;
  if (file.size > 2e6) { hint('Die Datei ist zu groß für einen Aufbau.'); return; }
  file.text().then(text => { const s = sanitize(JSON.parse(text)); if (s) applyState(s, `${file.name} geöffnet.`); else hint('Das ist keine Messplatz-Datei.'); }).catch(() => hint('Die Datei ließ sich nicht lesen.'));
});

/* ---------- Hauptschleife: rechnen im gewählten Tempo, höchstens so schnell, wie es geht ---------- */
const simClock = {target: 0, last: 0, ratio: 1, speed: 1};
function frame(now) {
  const real = Math.min(.1, (now - (simClock.last || now)) / 1000);
  simClock.last = now;
  if (dirty) rebuild();
  const sp = simClock.speed;
  if (!document.hidden && !sim.error && sp !== 0) {
    const max = sp === 'max', t0 = sim.t, deadline = performance.now() + (max ? 24 : sp > 1 ? 14 : 10);
    simClock.target = max ? Infinity : simClock.target + real * sp;
    while (sim.t < simClock.target && performance.now() < deadline) {
      if (!sim.advance()) break;
      sample(); dmmSample();
    }
    if (max || sim.t < simClock.target - .05 * sp) simClock.target = sim.t; // Rückstand nicht aufsummieren: dann eben Zeitlupe
    simClock.ratio = simClock.ratio * .9 + (real ? (sim.t - t0) / real : 0) * .1;
    checkDamage();
    meterShow(now); psuShow();
  }
  drawScope();
  if (acq.meas !== showMeasurements.last) { showMeasurements(); showMeasurements.last = acq.meas; }
  liveBoard(false);
  analysisTick(now);
  status();
  requestAnimationFrame(frame);
}
let statusTimer = 0;
function status() {
  const now = performance.now();
  if (now - statusTimer < 300) return;
  statusTimer = now;
  const r = simClock.ratio, sp = simClock.speed;
  const rate = x => x >= 1.03 ? `${num(x, 2)}× Echtzeit` : x >= .97 ? 'Echtzeit' : x >= .01 ? `${num(x * 100, 2)} % der Echtzeit` : `1 : ${num(1 / Math.max(x, 1e-9), 2)} der Echtzeit`;
  const speed = sp === 0 ? 'Pause' : sp === 'max' ? `so schnell es geht: ${rate(r)}` : r > sp * .97 ? rate(sp) : `Zeitlupe: ${rate(r)}`;
  $('mp-status').textContent = sim.error ? sim.error : `t = ${fmt(sim.t, 's', 4)} · Δt = ${fmt(sim.step(), 's', 2)} · ${speed}${sim.fails ? ` · ${sim.fails} schwierige Schritte` : ''}`;
}

/* ---------- Hinweise, Werkzeuge, Zoom ---------- */
let hintTimer = 0;
function hint(text) { const el = $('mp-hint'); el.textContent = text; el.classList.add('flash'); clearTimeout(hintTimer); hintTimer = setTimeout(() => el.classList.remove('flash'), 900); }
function updateTools() { $('mp-undo').disabled = !undoStack.past.length; $('mp-redo').disabled = !undoStack.future.length; }
$('mp-tools').addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  if (b.id === 'mp-undo' && undoStack.past.length) { undoStack.future.push(snapshot()); restore(undoStack.past.pop()); hint('Rückgängig.'); }
  else if (b.id === 'mp-redo' && undoStack.future.length) { undoStack.past.push(snapshot()); restore(undoStack.future.pop()); hint('Wiederhergestellt.'); }
  else if (b.id === 'mp-restart') restart();
  else if (b.id === 'mp-clear') { remember(); state.parts = state.parts.filter(p => PARTS[p.type].instr); state.wires = []; sel = null; state.versuch = null; renderVersuch(); changed(true); hint('Brett leer geräumt. ↶ holt alles zurück.'); }
  else if (b.id === 'mp-volts-btn') { showVolts = !showVolts; b.setAttribute('aria-pressed', String(showVolts)); paintVolts(); }
  else if (b.id === 'mp-share') share();
  else if (b.id === 'mp-file-btn') { filePanel.hidden = !filePanel.hidden; b.setAttribute('aria-expanded', String(!filePanel.hidden)); if (!filePanel.hidden) renderSaved(); }
  else if (b.dataset.zoom) setZoom(b.dataset.zoom === 'fit' ? fitZoom() : zoom * Number(b.dataset.zoom));
});
$('mp-speed').addEventListener('change', ev => {
  const v = ev.target.value;
  simClock.speed = v === 'max' ? 'max' : Number(v);
  simClock.target = sim.t; simClock.ratio = simClock.speed === 'max' ? 1 : simClock.speed || 0;
  status();
});
$('mp-palette').addEventListener('click', ev => { const b = ev.target.closest('[data-add]'); if (b) addPart(b.dataset.add); });
function share() {
  const json = JSON.stringify({...state, log: undefined}), bytes = new TextEncoder().encode(json);
  let bin = ''; bytes.forEach(x => { bin += String.fromCharCode(x); });
  const link = `${location.origin}${location.pathname}#aufbau=${btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  const done = () => hint('Link kopiert: Er enthält Aufbau und Geräteeinstellungen (ohne Messreihe).');
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done, () => prompt('Link zum Kopieren:', link));
  else prompt('Link zum Kopieren:', link);
}
function fitZoom() { return clamp(scrollEl.clientWidth / BOARD.w, .3, 1); }
function setZoom(z) {
  zoom = clamp(z, .3, 1.6);
  board.style.transform = `scale(${zoom})`;
  $('mp-sizer').style.width = BOARD.w * zoom + 'px'; $('mp-sizer').style.height = BOARD.h * zoom + 'px';
  $('mp-zoom-val').textContent = Math.round(zoom * 100) + ' %';
}

/* ---------- Versuche ---------- */
const versuchList = $('mp-versuche'), anleitung = $('mp-anleitung');
versuchList.innerHTML = VERSUCHE.map((v, i) => `<button type="button" class="mp-vk" data-versuch="${v.id}"><span class="mp-vk-nr">${String(i + 1).padStart(2, '0')}</span><span class="mp-vk-cat">${esc(v.cat)}</span><b>${esc(v.title)}</b><small>${esc(v.kurz)}</small></button>`).join('');
versuchList.addEventListener('click', ev => {
  const b = ev.target.closest('[data-versuch]');
  if (!b) return;
  const v = VERSUCHE.find(x => x.id === b.dataset.versuch);
  applyState(buildVersuch(v), `Versuch „${v.title}“ aufgebaut.`);
  $('bench').scrollIntoView({block: 'start', behavior: reducedMotion.matches ? 'auto' : 'smooth'});
});
function renderVersuch() {
  versuchList.querySelectorAll('[data-versuch]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.versuch === state.versuch)));
  const v = VERSUCHE.find(x => x.id === state.versuch);
  anleitung.hidden = !v;
  if (!v) return;
  const math = t => esc(t).replace(/\$([^$]+)\$/g, (_, tex) => `<span class="math math-inline">${tex}</span>`);
  anleitung.innerHTML = `<span class="eyebrow">Versuch ${String(VERSUCHE.indexOf(v) + 1).padStart(2, '0')} · ${esc(v.cat)}</span><h3>${esc(v.title)}</h3>
    <ol>${v.aufgaben.map(a => `<li>${esc(a)}</li>`).join('')}</ol>
    <details><summary>Was die Theorie sagt</summary><p>${math(v.theorie)}</p></details>`;
  OSCI.loadKatex().then(() => anleitung.querySelectorAll('.math').forEach(el => { const tex = el.textContent; try { window.katex.render(tex, el, {throwOnError: false, strict: 'ignore'}); } catch { el.textContent = tex; } })).catch(() => {});
}

/* ---------- Start ---------- */
const meterHtml = id => `<header><h3 id="${id}-title">${INSTR_NAME[id]}</h3><span>potentialfrei · 10 MΩ · Strompfad 0,1 Ω, 400 mA</span></header>
  <div class="lcd big" id="${id}-display"><b>—</b></div>
  <span class="seg wide">${Object.entries(DMM_MODES).map(([k, [label]]) => `<button type="button" data-dmm="${k}">${label}</button>`).join('')}</span>
  <p class="dev-hint" id="${id}-hint"></p>
  <button type="button" class="button small" data-fuse id="${id}-fuse" hidden>Sicherung tauschen</button>`;
for (const id of METERS) rack.querySelector(`[data-meter="${id}"]`).innerHTML = meterHtml(id);
const PALETTE_NAME = {POT: 'Poti', Z: 'Z-Diode', NPN: 'NPN', PNP: 'PNP', NMOS: 'MOSFET', OP: 'OPV', TR: 'Trafo', V: 'U-Quelle', I: 'I-Quelle', LED: 'LED'};
$('mp-palette').innerHTML = PALETTE.map(t => `<button type="button" data-add="${t}" title="${esc(PARTS[t].name)} einsetzen" aria-label="${esc(PARTS[t].name)} einsetzen"><svg viewBox="0 -4 ${PARTS[t].geom.w} ${PARTS[t].geom.h + 4}" aria-hidden="true">${PARTS[t].sym({})}</svg><span>${esc(PALETTE_NAME[t] || PARTS[t].name.replace(/ 1N4148$/, ''))}</span></button>`).join('');
setZoom(matchMedia('(max-width: 760px)').matches ? .55 : fitZoom());
renderParts(); updateAll(); updateBodeControls(); renderVersuch(); updateTools(); showTab(anaTab);
if (fromLink) { window.history.replaceState(null, '', location.pathname + location.search); hint('Geteilter Aufbau geladen.'); }
addEventListener('resize', () => { if (!matchMedia('(max-width: 760px)').matches) setZoom(fitZoom()); if (anaTab === 'bode') drawBode(); });
document.addEventListener('visibilitychange', () => { simClock.last = 0; simClock.target = sim.t; });
/* Farben des Bode-Diagramms folgen Hell/Dunkel */
new MutationObserver(() => { if (anaTab === 'bode') drawBode(); }).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (anaTab === 'bode') drawBode(); });
requestAnimationFrame(frame);
window.OSCIMessplatz = {state: () => state, sim, acq, shown, versuche: VERSUCHE, load: id => { const v = VERSUCHE.find(x => x.id === id); if (v) applyState(buildVersuch(v), `Versuch „${v.title}“ aufgebaut.`); },
  bode: () => ana.bode.res, buildNet, spice: spiceNetlist, op: () => { const nb = buildNet(), s2 = S.create(); s2.load(nb.netlist); return {nb, op: s2.operatingPoint()}; }, speed: v => { simClock.speed = v; simClock.target = sim.t; },
  /* für Tests ohne Bildwiederholung: secs Simulationszeit sofort rechnen, Analyse sofort auffrischen */
  run: (secs, maxMs = 4000) => { if (dirty) rebuild(); const end = sim.t + secs, stop = performance.now() + maxMs; while (sim.t < end && !sim.error && performance.now() < stop) { if (!sim.advance()) break; sample(); dmmSample(); } checkDamage(); for (const id of METERS) mt[id].lastShow = -1e9; meterShow(performance.now()); psuShow(); showMeasurements(); drawScope(); liveBoard(true); return {t: sim.t, meas: acq.meas, dmm: mt.dmm.value, dmm2: mt.dmm2.value, err: sim.error, fails: sim.fails}; },
  analyze: () => { ana.bode.res = bodeCompute(); renderOp(); return ana.bode.res; }, touch: () => changed(true), rows: id => partRows(getPart(id), sim.info), restore: sanitize};
})();
