/* Messplatz (messplatz/index.html): Steckbrett mit Bauteilen und Laborkabeln, dazu Funktionsgenerator, Oszilloskop,
   Multimeter und Netzgerät. Gerechnet wird mit assets/schaltung.js (Knotenanalyse wie SPICE).

   Elektrisch gilt: Ein Kabel verbindet Buchsen ideal (0 Ω). Alle Buchsen, die über Kabel zusammenhängen, bilden einen Knoten.
   Die ⏚-Buchsen von Funktionsgenerator und Oszilloskop liegen wie im echten Labor auf Schutzleiter = Masse.
   Netzgerät und Multimeter sind potentialfrei. */
'use strict';
(() => {
const $ = id => document.getElementById(id);
if (!$('mp-board')) return;
const S = OSCISchaltung, fmt = S.formatSI;
const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const num = (v, d = 3) => new Intl.NumberFormat('de-DE', {maximumSignificantDigits: d}).format(v);

/* ---------- Bauteile ----------
   geom: Größe und Buchsen (ungedreht), sym: Schaltzeichen nach IEC 60617 in diesem Rahmen.
   param: Hauptwert mit E12-Schritten, rating: Grenzwerte, ab denen ein Bauteil heiß wird oder durchbrennt. */
const G2 = {w: 88, h: 40, pins: [[0, 20], [88, 20]]};
const PARTS = {
  R: {name: 'Widerstand', short: 'R', lex: 'widerstand', geom: G2, pinNames: ['1', '2'],
    param: {key: 'R', unit: 'Ω', min: 1, max: 22e6, init: 1000, e12: true}, rating: {P: .25},
    sym: () => '<path d="M0 20H26M62 20H88"/><rect x="26" y="13" width="36" height="14"/>'},
  C: {name: 'Kondensator', short: 'C', lex: 'kapazitaet', geom: G2, pinNames: ['1', '2'],
    param: {key: 'C', unit: 'F', min: 1e-12, max: 1e-4, init: 100e-9, e12: true}, rating: {U: 63},
    sym: () => '<path d="M0 20H40M48 20H88M40 7V33M48 7V33" class="thick"/>'},
  E: {name: 'Elko', short: 'C', lex: 'kapazitaet', geom: G2, pinNames: ['+', '−'],
    param: {key: 'C', unit: 'F', min: 1e-7, max: 1e-2, init: 100e-6, e12: true}, rating: {U: 25, rev: 1},
    sym: () => '<path d="M0 20H37M51 20H88"/><rect x="37" y="7" width="4" height="26"/><rect x="47" y="7" width="4" height="26" class="fill"/><path d="M27 7H33M30 4V10"/>'},
  L: {name: 'Spule', short: 'L', lex: 'induktivitaet', geom: G2, pinNames: ['1', '2'],
    param: {key: 'L', unit: 'H', min: 1e-6, max: 10, init: 10e-3, e12: true},
    sym: () => '<path d="M0 20H24M64 20H88M24 20a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0"/>'},
  D: {name: 'Diode 1N4148', short: 'D', lex: 'diode', geom: G2, pinNames: ['A', 'K'], model: '1N4148', rating: {I: .5},
    sym: () => '<path d="M0 20H32M56 20H88M56 8V32"/><path d="M32 8L56 20L32 32Z" class="fill"/>'},
  LED: {name: 'LED rot', short: 'LED', lex: 'diode', geom: G2, pinNames: ['A', 'K'], model: 'LED', rating: {I: .05},
    sym: () => '<path d="M0 20H32M56 20H88M56 8V32"/><path d="M32 8L56 20L32 32Z" class="fill"/><path d="M50 6L58 -2M54 -2H58V2M58 8L66 0M62 0H66V4" class="thin"/>'},
  Z: {name: 'Z-Diode 5,1 V', short: 'Z', lex: 'diode', geom: G2, pinNames: ['A', 'K'], model: 'ZD5V1', rating: {P: .5},
    sym: () => '<path d="M0 20H32M56 20H88M51 8H56V32H61"/><path d="M32 8L56 20L32 32Z" class="fill"/>'},
  SW: {name: 'Schalter', short: 'S', lex: 'widerstand', geom: G2, pinNames: ['1', '2'],
    sym: p => `<path d="M0 20H28M60 20H88"/><circle cx="28" cy="20" r="2.5" class="fill"/><circle cx="60" cy="20" r="2.5" class="fill"/><path d="${p.zu ? 'M28 20L60 19' : 'M28 20L57 6'}" class="thick"/>`},
  POT: {name: 'Potentiometer', short: 'P', lex: 'spannungsteiler', geom: {w: 88, h: 56, pins: [[0, 20], [88, 20], [44, 56]]}, pinNames: ['A', 'E', 'S'],
    param: {key: 'R', unit: 'Ω', min: 100, max: 1e6, init: 10e3, e12: true}, rating: {P: .25},
    sym: () => '<path d="M0 20H26M62 20H88M44 56V31"/><rect x="26" y="13" width="36" height="14"/><path d="M39 35L44 28L49 35" class="thin"/>'},
  OP: {name: 'Operationsverstärker', short: 'OPV', lex: 'opv', geom: {w: 88, h: 64, pins: [[0, 16], [0, 48], [88, 32]]}, pinNames: ['−', '+', 'A'],
    sym: () => '<path d="M0 16H16M0 48H16M72 32H88"/><path d="M16 4V60L72 32Z"/><path d="M21 16H27M21 48H27M24 45V51" class="thin"/>'},
  NPN: {name: 'NPN BC547', short: 'T', lex: 'transistor', geom: {w: 64, h: 80, pins: [[0, 40], [48, 0], [48, 80]]}, pinNames: ['B', 'C', 'E'], model: 'BC547', pol: 1, rating: {I: .2, P: .5},
    sym: () => '<circle cx="34" cy="40" r="21" class="thin"/><path d="M0 40H25M25 27V53" /><path d="M25 34L48 21V0M25 46L48 59V80"/><path d="M40 50L48 59L36 57Z" class="fill"/>'},
  PNP: {name: 'PNP BC557', short: 'T', lex: 'transistor', geom: {w: 64, h: 80, pins: [[0, 40], [48, 0], [48, 80]]}, pinNames: ['B', 'C', 'E'], model: 'BC557', pol: -1, rating: {I: .2, P: .5},
    sym: () => '<circle cx="34" cy="40" r="21" class="thin"/><path d="M0 40H25M25 27V53" /><path d="M25 34L48 21V0M25 46L48 59V80"/><path d="M33 48L25 46L31 54Z" class="fill"/>'},
  GND: {name: 'Masse', short: '⏚', lex: 'potential', geom: {w: 40, h: 40, pins: [[20, 0]]}, pinNames: ['⏚'],
    sym: () => '<path d="M20 0V18M7 18H33M12 25H28M17 32H23"/>'},
  /* Geräte: nur ein Anschlussfeld auf dem Brett, die Bedienung steht im Geräteregal darunter */
  FG: {name: 'Funktionsgenerator', board: 'Generator', short: 'FG', lex: 'funktionsgenerator', instr: true, geom: {w: 128, h: 72, pins: [[128, 22], [128, 52]]}, pinNames: ['OUT', '⏚'], colors: ['red', 'black']},
  PSU: {name: 'Netzgerät', short: 'NG', lex: 'netzgeraet', instr: true, geom: {w: 128, h: 72, pins: [[128, 22], [128, 52]]}, pinNames: ['+', '−'], colors: ['red', 'black']},
  OSZ: {name: 'Oszilloskop', board: 'Oszi', short: 'OSZ', lex: 'oszilloskop-messen', instr: true, geom: {w: 128, h: 100, pins: [[0, 22], [0, 50], [0, 78]]}, pinNames: ['CH1', 'CH2', '⏚'], colors: ['ch1', 'ch2', 'black']},
  DMM: {name: 'Multimeter', board: 'Multimeter', short: 'DMM', lex: 'multimeter', instr: true, geom: {w: 128, h: 100, pins: [[0, 22], [0, 50], [0, 78]]}, pinNames: ['VΩ', 'COM', 'A'], colors: ['red', 'black', 'red']}
};
const PALETTE = ['R', 'C', 'E', 'L', 'D', 'LED', 'Z', 'SW', 'POT', 'OP', 'NPN', 'PNP', 'GND'];
const INSTR = {fg: 'FG', psu: 'PSU', osz: 'OSZ', dmm: 'DMM'};
const BOARD = {w: 1200, h: 720};

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
function pinColor(key) {
  const [id, i] = key.split(':'), part = getPart(id);
  return part && PARTS[part.type].colors ? PARTS[part.type].colors[Number(i)] : '';
}
function partLabel(p) {
  const d = PARTS[p.type];
  if (d.param) return fmt(p.p[d.param.key], d.param.unit, 3) + (p.type === 'POT' ? ` · ${Math.round(p.p.pos * 100)} %` : '');
  if (p.type === 'SW') return p.p.zu ? 'geschlossen' : 'offen';
  if (p.type === 'OP') return '±15 V';
  return d.name.replace(/^(Diode|NPN|PNP) /, '');
}

/* ---------- Zustand ---------- */
const STORAGE = 'osci-log-messplatz-v1';
function instruments() {
  return [
    {id: 'fg', type: 'FG', x: 24, y: 40, rot: 0, p: {}},
    {id: 'psu', type: 'PSU', x: 24, y: 560, rot: 0, p: {}},
    {id: 'osz', type: 'OSZ', x: 1048, y: 40, rot: 0, p: {}},
    {id: 'dmm', type: 'DMM', x: 1048, y: 540, rot: 0, p: {}}
  ];
}
function defaults() {
  return {
    parts: instruments(), wires: [],
    fg: {on: true, wave: 'sine', f: 1000, vpp: 2, off: 0, duty: 50},
    psu: {on: true, V: 5, I: .5},
    osz: {tdiv: 1e-3, ch: [{on: true, vdiv: 1, pos: 1, cpl: 'DC'}, {on: true, vdiv: 1, pos: -2, cpl: 'DC'}], trig: {src: 0, lvl: 0, slope: 1, mode: 'auto'}, xy: false, run: true},
    dmm: {mode: 'VDC'}, versuch: null
  };
}
let nextId = 1;
function newPart(type, x, y, rot = 0) {
  const d = PARTS[type], p = {};
  if (d.param) p[d.param.key] = d.param.init;
  if (type === 'POT') p.pos = .5;
  if (type === 'SW') p.zu = false;
  return {id: 'p' + nextId++, type, x, y, rot, p};
}
/* gespeicherte oder geteilte Aufbauten prüfen, bevor sie geladen werden */
function sanitize(raw) {
  try {
    if (!raw || !Array.isArray(raw.parts) || !Array.isArray(raw.wires) || raw.parts.length > 60 || raw.wires.length > 160) return null;
    const base = defaults(), parts = [], ids = new Set();
    for (const r of raw.parts) {
      if (!r || !Object.hasOwn(PARTS, r.type) || typeof r.id !== 'string' || ids.has(r.id) || !/^(p\d{1,5}|fg|psu|osz|dmm)$/.test(r.id)) continue;
      const isInstr = !!PARTS[r.type].instr;
      if (isInstr !== Object.hasOwn(INSTR, r.id) || (isInstr && INSTR[r.id] !== r.type)) continue;
      const d = PARTS[r.type], part = {id: r.id, type: r.type, x: clamp(Number(r.x) || 0, 0, BOARD.w - 40), y: clamp(Number(r.y) || 0, 0, BOARD.h - 40), rot: d.instr ? 0 : ((Number(r.rot) | 0) % 4 + 4) % 4, p: {}};
      if (d.param) part.p[d.param.key] = clamp(Number(r.p?.[d.param.key]) || d.param.init, d.param.min, d.param.max);
      if (r.type === 'POT') part.p.pos = clamp(Number(r.p?.pos ?? .5), 0, 1);
      if (r.type === 'SW') part.p.zu = !!r.p?.zu;
      if (r.broken && !d.instr) part.broken = String(r.broken).slice(0, 80);
      ids.add(r.id); parts.push(part);
    }
    for (const inst of base.parts) if (!ids.has(inst.id)) parts.push(inst);
    const pinOk = key => { const m = /^([\w]+):(\d)$/.exec(key); const part = m && parts.find(p => p.id === m[1]); return !!part && Number(m[2]) < PARTS[part.type].geom.pins.length; };
    const wires = [];
    for (const w of raw.wires) if (w && pinOk(w.a) && pinOk(w.b) && w.a !== w.b && !wires.some(x => (x.a === w.a && x.b === w.b) || (x.a === w.b && x.b === w.a))) wires.push({a: w.a, b: w.b});
    const fg = raw.fg || {}, psu = raw.psu || {}, osz = raw.osz || {}, dmm = raw.dmm || {};
    return {
      parts, wires,
      fg: {on: fg.on !== false, wave: ['sine', 'square', 'triangle', 'saw'].includes(fg.wave) ? fg.wave : 'sine', f: clamp(Number(fg.f) || 1000, .1, 1e6), vpp: clamp(Number(fg.vpp ?? 2), 0, 20), off: clamp(Number(fg.off) || 0, -10, 10), duty: clamp(Number(fg.duty) || 50, 5, 95)},
      psu: {on: psu.on !== false, V: clamp(Number(psu.V ?? 5), 0, 30), I: clamp(Number(psu.I) || .5, .001, 3)},
      osz: {
        tdiv: clamp(Number(osz.tdiv) || 1e-3, 1e-6, 2),
        ch: [0, 1].map(i => { const c = osz.ch?.[i] || {}, b = base.osz.ch[i]; return {on: c.on !== false, vdiv: clamp(Number(c.vdiv) || b.vdiv, 1e-3, 20), pos: clamp(Number(c.pos ?? b.pos), -4, 4), cpl: ['DC', 'AC', 'GND'].includes(c.cpl) ? c.cpl : 'DC'}; }),
        trig: {src: osz.trig?.src === 1 ? 1 : 0, lvl: Number(osz.trig?.lvl) || 0, slope: osz.trig?.slope === -1 ? -1 : 1, mode: ['auto', 'normal'].includes(osz.trig?.mode) ? osz.trig.mode : 'auto'},
        xy: !!osz.xy, run: true
      },
      dmm: {mode: ['VDC', 'VAC', 'ADC', 'AAC', 'OHM', 'DIODE'].includes(dmm.mode) ? dmm.mode : 'VDC'},
      versuch: typeof raw.versuch === 'string' ? raw.versuch : null
    };
  } catch { return null; }
}
function load() { try { return sanitize(JSON.parse(localStorage.getItem(STORAGE))); } catch { return null; } }
let saveTimer = 0;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(STORAGE, JSON.stringify({...state, sel: undefined})); } catch { /* ohne Speicher */ } }, 250);
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
   dazu die Geräteeinstellungen. Die Kabel-Kürzel: 'r1:0' = Buchse 0 von Bauteil r1, Geräte heißen fg, psu, osz, dmm. */
const VERSUCHE = [
  {id: 'messfehler', title: 'Messen belastet', kurz: 'Spannungsteiler mit Multimeter: Warum zeigt es nicht 5 V?',
    teile: [['r1', 'R', 440, 300, 1, {R: 1e6}], ['r2', 'R', 440, 460, 1, {R: 1e6}], ['g', 'GND', 280, 640]],
    kabel: [['psu:0', 'r1:0'], ['r1:1', 'r2:0'], ['r2:1', 'psu:1'], ['psu:1', 'g:0'], ['dmm:0', 'r1:1'], ['dmm:1', 'r2:1']],
    geraete: {psu: {on: true, V: 10, I: .1}, dmm: {mode: 'VDC'}, fg: {on: false}},
    aufgaben: ['Zwei gleiche Widerstände an 10 V — erwartet sind 5 V am unteren. Was zeigt das Multimeter?', 'Wähle beide Widerstände mit 1 kΩ statt 1 MΩ. Warum stimmt die Messung jetzt?', 'Miss den Strom: Kabel vom Netzgerät lösen und das Multimeter mit A und COM in Reihe schalten (Modus A⎓).'],
    theorie: 'Ein Digitalmultimeter misst Spannung mit $R_i = 10\\,\\mathrm{M\\Omega}$ Innenwiderstand. Der liegt parallel zu $R_2$: $R_2 \\parallel R_i = 909\\,\\mathrm{k\\Omega}$, also $U_2 = 10\\,\\mathrm{V} \\cdot \\frac{909}{1909} = 4{,}76\\,\\mathrm{V}$. Messgeräte verändern immer ein wenig, was sie messen — nur bei kleinen Widerständen fällt es nicht auf.'},
  {id: 'sprung', title: 'RC-Sprungantwort', kurz: 'Rechteck auf einen Tiefpass: die Zeitkonstante τ messen.',
    teile: [['r', 'R', 420, 120, 0, {R: 1000}], ['c', 'C', 640, 220, 1, {C: 1e-6}], ['g', 'GND', 640, 360]],
    kabel: [['fg:0', 'r:0'], ['r:1', 'c:0'], ['c:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'r:1']],
    geraete: {fg: {on: true, wave: 'square', f: 100, vpp: 4, off: 2, duty: 50}, psu: {on: false}, osz: {tdiv: 2e-3, ch: [{vdiv: 1, pos: -3}, {vdiv: 1, pos: -3}], trig: {src: 0, lvl: 2, slope: 1}}},
    aufgaben: ['CH1 zeigt den Sprung am Eingang, CH2 die Kondensatorspannung. Lies ab, wann CH2 63 % von 4 V erreicht (2,53 V).', 'Verdopple R oder C: Wie ändert sich τ?', 'Stell 1 kHz ein: Der Kondensator wird nicht mehr voll — das Signal wird zum Dreieck verschliffen.'],
    theorie: 'Laden: $u_C(t) = U_0\\,(1 - e^{-t/\\tau})$ mit $\\tau = RC$. Achtung: Der Generator hat $50\\,\\Omega$ Innenwiderstand, die liegen mit in Reihe: $\\tau = 1050\\,\\Omega \\cdot 1\\,\\mathrm{\\mu F} = 1{,}05\\,\\mathrm{ms}$.'},
  {id: 'frequenzgang', title: 'Tiefpass: Betrag und Phase', kurz: 'Sinus durch RC: Amplitudenverhältnis, Phase und Lissajous-Figur.',
    teile: [['r', 'R', 420, 120, 0, {R: 1000}], ['c', 'C', 640, 220, 1, {C: 100e-9}], ['g', 'GND', 640, 360]],
    kabel: [['fg:0', 'r:0'], ['r:1', 'c:0'], ['c:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'r:1']],
    geraete: {fg: {on: true, wave: 'sine', f: 1000, vpp: 4, off: 0}, psu: {on: false}, osz: {tdiv: 200e-6, ch: [{vdiv: 1, pos: 0}, {vdiv: 1, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['Lies unter dem Schirm ab: Verhältnis der Spitze-Spitze-Werte und die Phase von CH2 gegenüber CH1.', 'Such die Frequenz, bei der CH2 nur noch 0,707 von CH1 hat. Wie groß ist die Phase dort?', 'Schalte auf XY: Die Ellipse ist die Lissajous-Figur. Bei 0° wäre sie eine Gerade, bei 90° ein Kreis.'],
    theorie: '$\\underline{H} = \\frac{1}{1 + j\\omega RC}$, also $|\\underline{H}| = 1/\\sqrt{1 + (\\omega RC)^2}$ und $\\varphi = -\\arctan(\\omega RC)$. CH1 misst direkt an der Generatorbuchse, dadurch kürzen sich dessen 50 Ω aus dem Verhältnis heraus: $f_g = \\frac{1}{2\\pi RC} \\approx 1{,}59\\,\\mathrm{kHz}$, dort $-45°$.'},
  {id: 'schwingkreis', title: 'Reihenschwingkreis', kurz: 'R, L, C in Reihe: Resonanz suchen und Ausschwingen beobachten.',
    teile: [['r', 'R', 760, 300, 1, {R: 10}], ['l', 'L', 380, 120, 0, {L: 10e-3}], ['c', 'C', 580, 120, 0, {C: 100e-9}], ['g', 'GND', 760, 460]],
    kabel: [['fg:0', 'l:0'], ['l:1', 'c:0'], ['c:1', 'r:0'], ['r:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'r:0']],
    geraete: {fg: {on: true, wave: 'sine', f: 4000, vpp: 4, off: 0}, psu: {on: false}, osz: {tdiv: 100e-6, ch: [{vdiv: 1, pos: 2}, {vdiv: .5, pos: -2}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['CH2 misst die Spannung an R — sie ist proportional zum Strom. Dreh die Frequenz, bis CH2 am größten ist und die Phase 0° wird.', 'Vergleiche mit der Formel. Was macht der Innenwiderstand des Generators mit der Güte?', 'Rechteck mit 200 Hz und 2 ms/div: Jetzt siehst du die gedämpfte Schwingung nach jeder Flanke.'],
    theorie: 'Resonanz bei $f_0 = \\frac{1}{2\\pi\\sqrt{LC}} = 5{,}03\\,\\mathrm{kHz}$. Die Güte $Q = \\frac{1}{R_\\text{ges}}\\sqrt{L/C}$ hängt am Gesamtwiderstand: mit $R_\\text{ges} = 10\\,\\Omega + 50\\,\\Omega$ ist $Q \\approx 5{,}3$.'},
  {id: 'gleichrichter', title: 'Gleichrichter mit Glättung', kurz: 'Diode und Elko machen aus Wechsel- eine wellige Gleichspannung.',
    teile: [['d', 'D', 380, 120, 0], ['e', 'E', 600, 220, 1, {C: 100e-6}], ['rl', 'R', 760, 220, 1, {R: 1000}], ['g', 'GND', 680, 380]],
    kabel: [['fg:0', 'd:0'], ['d:1', 'e:0'], ['e:0', 'rl:0'], ['e:1', 'g:0'], ['rl:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'd:1']],
    geraete: {fg: {on: true, wave: 'sine', f: 50, vpp: 20, off: 0}, psu: {on: false}, osz: {tdiv: 10e-3, ch: [{vdiv: 5, pos: 0}, {vdiv: 5, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['Lies die Brummspannung ab (Spitze-Spitze von CH2). Stell CH2 dazu auf AC und 0,5 V/div.', 'Verdopple die Kapazität: Wie ändert sich das Brummen?', 'Warum erreicht CH2 nie den Scheitelwert von CH1? (Zwei Gründe.)'],
    theorie: 'Zwischen den Ladepulsen entlädt die Last den Elko: $\\Delta U \\approx \\frac{I_L}{f\\,C}$. Die Spitze liegt unter $\\hat{u}$, weil an der Diode rund 0,7 V abfallen und die Ladeströme am Innenwiderstand des Generators (50 Ω) Spannung kosten.'},
  {id: 'zdiode', title: 'Z-Diode stabilisiert', kurz: 'Eine Z-Diode hält die Spannung, auch wenn das Netzgerät schwankt.',
    teile: [['r', 'R', 380, 120, 0, {R: 470}], ['z', 'Z', 600, 260, 3], ['p', 'POT', 760, 240, 1, {R: 10e3}], ['g', 'GND', 600, 460]],
    kabel: [['psu:0', 'r:0'], ['r:1', 'z:1'], ['z:0', 'g:0'], ['psu:1', 'g:0'], ['r:1', 'p:0'], ['p:2', 'g:0'], ['dmm:0', 'z:1'], ['dmm:1', 'z:0']],
    geraete: {psu: {on: true, V: 12, I: .2}, fg: {on: false}, dmm: {mode: 'VDC'}},
    aufgaben: ['Verstelle das Netzgerät zwischen 7 und 15 V. Wie stark ändert sich die Spannung an der Z-Diode?', 'Dreh das Poti (die Last) herunter. Ab wann bricht die Spannung ein?', 'Berechne den Strom durch den Vorwiderstand und vergleiche mit dem Netzgerät-Display.'],
    theorie: 'Im Durchbruch fließt fast beliebig viel Strom bei fast gleicher Spannung $U_Z \\approx 5{,}1\\,\\mathrm{V}$. Der Vorwiderstand nimmt die Differenz auf: $I_R = (U - U_Z)/R$. Dieser Strom teilt sich auf Z-Diode und Last auf — wird die Last zu groß, bleibt für die Z-Diode nichts übrig.'},
  {id: 'opv', title: 'Invertierender Verstärker', kurz: 'Ein OPV verstärkt zehnfach — bis er an seine Versorgung stößt.',
    teile: [['ri', 'R', 340, 200, 0, {R: 1000}], ['rf', 'R', 540, 100, 0, {R: 10e3}], ['op', 'OP', 540, 220, 0], ['g', 'GND', 460, 380]],
    kabel: [['fg:0', 'ri:0'], ['ri:1', 'op:0'], ['op:0', 'rf:0'], ['rf:1', 'op:2'], ['op:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'op:2']],
    geraete: {fg: {on: true, wave: 'sine', f: 1000, vpp: 1, off: 0}, psu: {on: false}, osz: {tdiv: 200e-6, ch: [{vdiv: .5, pos: 0}, {vdiv: 5, pos: 0}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['Vergleiche die Amplituden: Wie groß ist die Verstärkung, und welche Phase hat der Ausgang?', 'Erhöhe die Generator-Amplitude auf 3 V: Der Ausgang wird bei rund ±13,5 V abgeschnitten.', 'Stell 100 kHz ein: Die Verstärkung sinkt — das Verstärkungs-Bandbreite-Produkt (1 MHz) begrenzt.'],
    theorie: 'Der OPV regelt seinen Ausgang so, dass zwischen + und − fast keine Spannung liegt. Der −-Eingang ist damit eine „virtuelle Masse“: $V = -\\frac{R_f}{R_i} = -10$. Bei hohen Frequenzen bleibt nur $|V| \\approx \\frac{f_T}{f\\,(1 + R_f/R_i)}$ übrig, mit $f_T = 1\\,\\mathrm{MHz}$.'},
  {id: 'integrator', title: 'OPV-Integrator', kurz: 'Aus Rechteck wird Dreieck: Ein Kondensator in der Rückkopplung integriert.',
    teile: [['ri', 'R', 340, 200, 0, {R: 10e3}], ['cf', 'C', 540, 110, 0, {C: 10e-9}], ['rp', 'R', 540, 30, 0, {R: 1e6}], ['op', 'OP', 540, 220, 0], ['g', 'GND', 460, 380]],
    kabel: [['fg:0', 'ri:0'], ['ri:1', 'op:0'], ['op:0', 'cf:0'], ['cf:1', 'op:2'], ['op:0', 'rp:0'], ['rp:1', 'op:2'], ['op:1', 'g:0'], ['osz:0', 'fg:0'], ['osz:1', 'op:2']],
    geraete: {fg: {on: true, wave: 'square', f: 1000, vpp: 2, off: 0, duty: 50}, psu: {on: false}, osz: {tdiv: 200e-6, ch: [{vdiv: 1, pos: 2}, {vdiv: 2, pos: -2}], trig: {src: 0, lvl: 0, slope: 1}}},
    aufgaben: ['Miss die Spitze-Spitze-Spannung des Dreiecks und vergleiche mit der Formel.', 'Halbiere die Frequenz: Was passiert mit der Dreieck-Amplitude?', 'Wozu ist der 1-MΩ-Widerstand parallel zum Kondensator da? Entferne ihn und warte.'],
    theorie: 'Der Strom $u_e/R$ lädt den Kondensator: $u_a = -\\frac{1}{RC}\\int u_e\\,\\mathrm{d}t$. Bei ±1 V für je 0,5 ms und $RC = 100\\,\\mathrm{\\mu s}$ ergibt das $5\\,\\mathrm{V}$ Spitze-Spitze. Ohne Parallelwiderstand integriert der OPV auch jeden kleinen Gleichanteil auf, bis er in die Sättigung läuft.'},
  {id: 'transistor', title: 'Transistor als Schalter', kurz: 'Ein kleiner Basisstrom schaltet einen großen Kollektorstrom.',
    teile: [['s', 'SW', 300, 300, 0], ['rb', 'R', 460, 300, 0, {R: 10e3}], ['q', 'NPN', 640, 260, 0], ['led', 'LED', 664, 140, 3], ['rc', 'R', 520, 100, 0, {R: 220}], ['g', 'GND', 664, 420]],
    kabel: [['psu:0', 's:0'], ['s:1', 'rb:0'], ['rb:1', 'q:0'], ['psu:0', 'rc:0'], ['rc:1', 'led:0'], ['led:1', 'q:1'], ['q:2', 'g:0'], ['psu:1', 'g:0'], ['dmm:0', 'q:1'], ['dmm:1', 'q:2']],
    geraete: {psu: {on: true, V: 5, I: .5}, fg: {on: false}, dmm: {mode: 'VDC'}},
    aufgaben: ['Leg den Schalter um (im Inspektor oder per Doppelklick): Die LED geht an. Was zeigt das Multimeter an der Kollektor-Emitter-Strecke?', 'Wähle den Basiswiderstand mit 1 MΩ: Reicht der Basisstrom noch?', 'Wähle den Kollektorwiderstand mit 22 Ω: Was passiert mit der LED?'],
    theorie: 'Durchgeschaltet fällt am Transistor nur $U_{CE,sat}$ von etwa 0,1 V ab. Der Kollektorstrom ist durch $R_C$ und LED begrenzt: $I_C \\approx \\frac{5\\,\\mathrm{V} - 1{,}8\\,\\mathrm{V}}{220\\,\\Omega} \\approx 14\\,\\mathrm{mA}$. Dafür braucht es nur $I_B > I_C/B$, also einige zehn Mikroampere.'}
];
function buildVersuch(v) {
  const s = defaults(), map = {};
  nextId = 1;
  for (const [key, type, x, y, rot = 0, p = {}] of v.teile) { const part = newPart(type, x, y, rot); Object.assign(part.p, p); map[key] = part.id; s.parts.push(part); }
  const pin = ref => { const [k, i] = ref.split(':'); return (map[k] || k) + ':' + i; };
  s.wires = v.kabel.map(([a, b]) => ({a: pin(a), b: pin(b)}));
  const g = v.geraete;
  Object.assign(s.fg, g.fg || {}); Object.assign(s.psu, g.psu || {}); Object.assign(s.dmm, g.dmm || {});
  if (g.osz) { const o = g.osz; if (o.tdiv) s.osz.tdiv = o.tdiv; o.ch?.forEach((c, i) => Object.assign(s.osz.ch[i], c)); if (o.trig) Object.assign(s.osz.trig, o.trig); }
  s.versuch = v.id;
  return s;
}
if (!state) state = buildVersuch(VERSUCHE[1]);
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
  return `<span class="mp-instr-name">${d.board || d.name}</span><span class="mp-instr-state" data-instr-state="${part.id}"></span>${labels}`;
}
function partHtml(part) {
  const d = PARTS[part.type], {w, h} = dims(part);
  const sockets = d.geom.pins.map((pt, i) => {
    const [x, y] = rotPoint(part, pt), key = `${part.id}:${i}`, color = d.colors ? d.colors[i] : '';
    return `<button type="button" class="mp-sock ${color}${pending === key ? ' pending' : ''}" data-pin="${key}" style="left:${x}px;top:${y}px" aria-label="${esc(d.name)} ${esc(d.pinNames[i])}" title="${esc(d.pinNames[i])}"></button>`;
  }).join('');
  const inner = d.instr ? instrumentInner(part) : `${symbolSvg(part)}<span class="mp-val">${esc(partLabel(part))}</span>`;
  const remove = d.instr ? '' : `<button type="button" class="mp-x" data-remove="${part.id}" aria-label="${esc(d.name)} entfernen">×</button>`;
  return `<div class="mp-part mp-${part.type.toLowerCase()}${part.rot % 2 ? ' v' : ''}${d.instr ? ' mp-instr' : ''}${sel === part.id ? ' selected' : ''}${part.broken ? ' broken' : ''}" data-id="${part.id}" style="left:${part.x}px;top:${part.y}px;width:${w}px;height:${h}px">
    <div class="mp-grab" data-grab="${part.id}" tabindex="0" role="button" aria-label="${esc(d.name)} ${esc(partLabel(part))}: auswählen und verschieben">${inner}</div>${remove}${sockets}</div>`;
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
function pinName(key) { const [id, i] = key.split(':'), p = getPart(id); return p ? `${partTitle(p)} ${PARTS[p.type].pinNames[Number(i)]}` : key; }
function partTitle(p) {
  const d = PARTS[p.type];
  if (d.instr) return d.name;
  const same = state.parts.filter(q => PARTS[q.type].short === d.short && !PARTS[q.type].instr);
  return d.short + (same.length > 1 || d.short.length === 1 ? same.indexOf(p) + 1 : '');
}

/* ---------- Bedienen: verschieben, verbinden, auswählen ---------- */
let dragging = null, wireDrag = null, pending = null;
const capture = ev => { try { board.setPointerCapture(ev.pointerId); } catch { /* Zeiger schon weg: dann eben ohne Capture */ } };
function boardPoint(ev) { const r = board.getBoundingClientRect(); return {x: (ev.clientX - r.left) / zoom, y: (ev.clientY - r.top) / zoom}; }
partsEl.addEventListener('pointerdown', ev => {
  const sock = ev.target.closest('[data-pin]');
  if (sock) {
    ev.preventDefault();
    wireDrag = {pin: sock.dataset.pin, start: {x: ev.clientX, y: ev.clientY}, point: boardPoint(ev), moved: false, pointer: ev.pointerId};
    capture(ev);
    return;
  }
  const grab = ev.target.closest('[data-grab]');
  if (!grab || ev.button !== 0) return;
  const part = getPart(grab.dataset.grab);
  dragging = {part, start: {x: ev.clientX, y: ev.clientY}, x: part.x, y: part.y, moved: false, el: grab.closest('.mp-part')};
  capture(ev);
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
  sel = sel === id ? sel : id;
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
  hint(`${PARTS[part.type].name} entfernt. ↶ holt es zurück.`);
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
function toggleSwitch(part) { remember(); part.p.zu = !part.p.zu; hint(part.p.zu ? 'Schalter geschlossen.' : 'Schalter offen.'); changed(true); }
function addPart(type) {
  if (state.parts.length >= 60) { hint('Das Brett ist voll.'); return; }
  remember();
  const g = PARTS[type].geom, vx = scrollEl.scrollLeft / zoom + scrollEl.clientWidth / zoom / 2, vy = scrollEl.scrollTop / zoom + scrollEl.clientHeight / zoom / 2;
  let x = clamp(Math.round((vx - g.w / 2) / 8) * 8, 0, BOARD.w - g.w), y = clamp(Math.round((vy - g.h / 2) / 8) * 8, 0, BOARD.h - g.h);
  const free = (px, py) => !state.parts.some(p => { const d = dims(p); return px < p.x + d.w + 28 && px + g.w + 28 > p.x && py < p.y + d.h + 36 && py + g.h + 36 > p.y; });
  for (let k = 1; k < 60 && !free(x, y); k++) { const ring = Math.ceil(k / 8), a = k * Math.PI / 4; x = clamp(Math.round((vx - g.w / 2 + Math.cos(a) * ring * 120) / 8) * 8, 0, BOARD.w - g.w); y = clamp(Math.round((vy - g.h / 2 + Math.sin(a) * ring * 80) / 8) * 8, 0, BOARD.h - g.h); }
  const part = newPart(type, x, y);
  state.parts.push(part);
  sel = part.id;
  hint(`${PARTS[type].name} eingesetzt. Zieh von einer Buchse ein Kabel zur nächsten.`);
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
    controls += `<div class="mp-field"><label for="mp-val">${k === 'R' ? 'Widerstand' : k === 'C' ? 'Kapazität' : 'Induktivität'}</label>
      <div class="mp-stepper"><button type="button" class="button small" data-e12="-1" aria-label="kleiner (E12)">−</button><input id="mp-val" class="mp-input" value="${esc(fmt(part.p[k], d.param.unit, 3))}" inputmode="text" spellcheck="false"><button type="button" class="button small" data-e12="1" aria-label="größer (E12)">+</button></div></div>`;
  }
  if (part.type === 'POT') controls += `<div class="mp-field"><label for="mp-pos">Schleifer</label><input id="mp-pos" type="range" min="0" max="100" value="${Math.round(part.p.pos * 100)}"></div>`;
  if (part.type === 'SW') controls += `<button type="button" class="button small" data-toggle-sw>${part.p.zu ? 'Öffnen' : 'Schließen'}</button>`;
  const tools = d.instr ? '' : `<button type="button" class="button small" data-rotate>⟳ Drehen</button><button type="button" class="button small" data-del>Entfernen</button>`;
  const broken = part.broken ? `<p class="mp-broken">${esc(part.broken)} <button type="button" class="button small" data-repair>Ersetzen</button></p>` : '';
  inspector.innerHTML = `<header><b>${esc(partTitle(part))}</b> · ${esc(d.name)} <button type="button" class="lex-q" data-lex="${d.lex}" aria-label="${esc(d.name)} im Lexikon">?</button></header>
    ${broken}${d.instr ? `<p class="mp-insp-empty">Bedienung im Geräteregal unten. Buchsen: ${d.pinNames.join(', ')}.</p>` : ''}
    <div class="mp-insp-controls">${controls}${tools}</div><dl class="mp-live" id="mp-live"></dl>`;
}
inspector.addEventListener('click', ev => {
  const part = sel && getPart(sel);
  if (!part) return;
  const d = PARTS[part.type], t = ev.target;
  if (t.closest('[data-e12]')) { remember(); const k = d.param.key; part.p[k] = clamp(S.stepE12(part.p[k], Number(t.closest('[data-e12]').dataset.e12)), d.param.min, d.param.max); changed(true); }
  else if (t.closest('[data-rotate]')) rotate(part);
  else if (t.closest('[data-del]')) removePart(part.id);
  else if (t.closest('[data-toggle-sw]')) toggleSwitch(part);
  else if (t.closest('[data-repair]')) { remember(); delete part.broken; hint(`${partTitle(part)} ersetzt.`); changed(true); }
});
inspector.addEventListener('change', ev => {
  const part = sel && getPart(sel);
  if (!part) return;
  const d = PARTS[part.type];
  if (ev.target.id === 'mp-val') {
    const v = S.parseSI(ev.target.value);
    if (!Number.isFinite(v) || v <= 0) { hint(`„${ev.target.value}“ verstehe ich nicht. Beispiele: 4k7, 100n, 2.2u, 10m`); ev.target.value = fmt(part.p[d.param.key], d.param.unit, 3); return; }
    remember(); part.p[d.param.key] = clamp(v, d.param.min, d.param.max); changed(true);
  }
});
inspector.addEventListener('input', ev => {
  const part = sel && getPart(sel);
  if (part && ev.target.id === 'mp-pos') { part.p.pos = Number(ev.target.value) / 100; partsEl.querySelector(`[data-id="${part.id}"] .mp-val`).textContent = partLabel(part); dirty = true; save(); }
});
inspector.addEventListener('keydown', ev => { if (ev.target.id === 'mp-val' && ev.key === 'Enter') ev.target.blur(); });

/* ---------- Schaltung → Netzliste ---------- */
let net = null, dirty = true;
function buildNet() {
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
  const devices = [], f = state.fg, ps = state.psu, mode = state.dmm.mode;
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
      case 'NPN': case 'PNP': devices.push({k: 'Q', id, n: [n(p, 1), n(p, 0), n(p, 2)], m: PARTS[p.type].model, pol: PARTS[p.type].pol}); break;
      case 'FG': if (f.on) devices.push({k: 'NS', id: 'fg', n: [n(p, 0)], G: 1 / 50, e: fgValue}); break;
      case 'PSU': if (ps.on) devices.push({k: 'LS', id: 'psu', n: [n(p, 0), n(p, 1)], V: ps.V, I: ps.I, Rs: .01}); break;
      case 'OSZ': devices.push({k: 'R', id: 'osz.1', n: [n(p, 0), 0], R: 1e6}, {k: 'R', id: 'osz.2', n: [n(p, 1), 0], R: 1e6}); break;
      case 'DMM':
        devices.push({k: 'R', id: 'dmm.A', n: [n(p, 2), n(p, 1)], R: dmm.fuse ? SHUNT : 1e12});
        if (mode === 'OHM' || mode === 'DIODE') devices.push({k: 'LS', id: 'dmm.src', n: [n(p, 0), n(p, 1)], V: mode === 'DIODE' ? 3 : 5, I: mode === 'DIODE' ? 1e-3 : OHM_RANGES[dmm.range], Rs: .1});
        else devices.push({k: 'R', id: 'dmm.V', n: [n(p, 0), n(p, 1)], R: 10e6});
        break;
    }
  }
  /* Schwebende Teilschaltungen (z. B. Netzgerät ohne Masse): Ihre Potentiale gegen Masse wären unbestimmt.
     Ein Knoten jeder solchen Insel bekommt einen Bezug über 1 kΩ — es ist ihre einzige Verbindung, also fließt dort nie Strom. */
  const adj = Array.from({length: N + 1}, () => []);
  for (const d of devices) {
    if (d.k === 'R' && d.R > 1e8) continue; // offener Schalter verbindet nicht
    const ns = d.n;
    for (let i = 1; i < ns.length; i++) { adj[ns[0]].push(ns[i]); adj[ns[i]].push(ns[0]); }
  }
  const seen = new Uint8Array(N + 1);
  const flood = start => { const stack = [start]; seen[start] = 1; while (stack.length) for (const m of adj[stack.pop()]) if (!seen[m]) { seen[m] = 1; stack.push(m); } };
  flood(0);
  let floating = 0;
  for (let k = 1; k <= N; k++) if (!seen[k]) { flood(k); devices.push({k: 'R', id: 'bezug.' + k, n: [k, 0], R: 1e3}); if (adj[k].length) floating++; }
  const nodeOf = key => parent.has(key) ? (ids.get(find(key)) ?? 0) : 0;
  return {netlist: {nodes: N, devices}, nodeOf, nodes: N, ids, find, floating};
}
/* Schrittweite: 1000 Punkte pro Schirmbreite, aber fein genug für Generator und LC-Resonanz */
function chooseDt() {
  let dt = state.osz.tdiv / 100;
  if (state.fg.on) dt = Math.min(dt, 1 / (state.fg.f * (state.fg.wave === 'sine' ? 120 : 400)));
  const Ls = state.parts.filter(p => p.type === 'L' && !p.broken).map(p => p.p.L), Cs = state.parts.filter(p => (p.type === 'C' || p.type === 'E') && !p.broken).map(p => p.p.C);
  if (Ls.length && Cs.length) dt = Math.min(dt, 2 * Math.PI * Math.sqrt(Math.min(...Ls) * Math.min(...Cs)) / 100);
  return clamp(dt, 5e-9, 2e-3);
}

/* ---------- Funktionsgenerator ---------- */
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
  return f.off + amp * y;
}

/* ---------- Multimeter ---------- */
const SHUNT = .1, FUSE = .4, OHM_RANGES = [1e-3, 1e-4, 1e-5, 1e-6, 1e-7];
const dmm = {fuse: true, range: 0, acc: {n: 0, s: 0, s2: 0, t: 0}, shown: '', overI: 0, lastShow: 0, rangeHold: 0};
const DMM_MODES = {VDC: ['V⎓', 'V'], VAC: ['V~', 'V'], ADC: ['A⎓', 'A'], AAC: ['A~', 'A'], OHM: ['Ω', 'Ω'], DIODE: ['▷|', 'V']};

/* ---------- Simulation ---------- */
const sim = S.create();
let nodes = {ch1: 0, ch2: 0, dmmV: 0, dmmC: 0, dmmA: 0};
function rebuild() {
  net = buildNet();
  sim.load(net.netlist);
  sim.setStep(chooseDt());
  nodes = {ch1: net.nodeOf('osz:0'), ch2: net.nodeOf('osz:1'), dmmV: net.nodeOf('dmm:0'), dmmC: net.nodeOf('dmm:1'), dmmA: net.nodeOf('dmm:2')};
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
   Flanke; eine Teilung vor dem Triggerpunkt ist schon zu sehen (Vortrigger). */
const COLS = 500, PRE = 50, RING = COLS * 3;
const ringBuf = [0, 1].map(() => ({min: new Float32Array(RING), max: new Float32Array(RING), first: new Float32Array(RING), last: new Float32Array(RING), sum: new Float64Array(RING), sum2: new Float64Array(RING), n: new Uint32Array(RING)}));
const shown = [0, 1].map(() => ({min: new Float32Array(COLS), max: new Float32Array(COLS), first: new Float32Array(COLS), last: new Float32Array(COLS), mean: new Float32Array(COLS), valid: new Uint8Array(COLS)}));
const acq = {binW: 1e-5, bin: -1, state: 'armed', trigBin: 0, armT: 0, prev: [0, 0], hp: [0, 0], hpIn: [0, 0], have: false, status: 'WARTEN', meas: null, holdUntil: 0, live: 0};
function acqReset(clear) {
  acq.binW = state.osz.tdiv * 10 / COLS;
  acq.bin = -1; acq.state = 'armed'; acq.armT = sim.t; acq.holdUntil = sim.t;
  for (const r of ringBuf) r.n.fill(0);
  if (clear) { for (const s of shown) s.valid.fill(0); acq.have = false; acq.meas = null; }
}
function sample() {
  const t = sim.t, o = state.osz;
  const raw = [sim.v(nodes.ch1), sim.v(nodes.ch2)], v = [0, 0];
  for (let c = 0; c < 2; c++) {
    const cpl = o.ch[c].cpl;
    if (cpl === 'AC') { // Hochpass 1. Ordnung, Grenzfrequenz 10 Hz wie bei echten Oszilloskopen
      const rc = 1 / (2 * Math.PI * 10), a = rc / (rc + sim.step());
      acq.hp[c] = a * (acq.hp[c] + raw[c] - acq.hpIn[c]);
      v[c] = acq.hp[c];
    } else v[c] = cpl === 'GND' ? 0 : raw[c];
    acq.hpIn[c] = raw[c];
  }
  const b = Math.floor(t / acq.binW);
  if (b !== acq.bin) {
    /* langsame Zeitbasis: fertige Spalten sofort zeigen, die Spur läuft von links ein */
    if (acq.state === 'sweep' && slowSweep() && acq.bin >= acq.trigBin) copyBin(acq.bin - acq.trigBin, acq.bin);
    for (let k = acq.bin + 1; k <= b && k >= 0; k++) { if (k > acq.bin + RING) break; const i = k % RING; for (const r of ringBuf) r.n[i] = 0; }
    acq.bin = b;
  }
  const i = b % RING;
  for (let c = 0; c < 2; c++) {
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
  for (let c = 0; c < 2; c++) {
    const r = ringBuf[c], s = shown[c], ok = bi >= 0 && r.n[i] > 0;
    s.valid[col] = ok ? 1 : 0;
    if (ok) { s.min[col] = r.min[i]; s.max[col] = r.max[i]; s.first[col] = r.first[i]; s.last[col] = r.last[i]; s.mean[col] = r.sum[i] / r.n[i]; }
  }
}
function startSweep(b) {
  acq.state = 'sweep'; acq.trigBin = b - PRE;
  if (slowSweep()) { for (let k = 0; k < COLS; k++) { if (k < b - acq.trigBin) copyBin(k, acq.trigBin + k); else { shown[0].valid[k] = 0; shown[1].valid[k] = 0; } } acq.have = true; }
}
function finishSweep() {
  for (let c = 0; c < 2; c++) {
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
  for (let c = 0; c < 2; c++) {
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
    const binT = acq.binW, period = cross.length > 1 && vpp > 1e-6 ? (cross[cross.length - 1] - cross[0]) / (cross.length - 1) * binT : 0;
    /* Effektivwert über ganze Perioden, falls möglich */
    let rms = Math.sqrt(Math.max(0, sum2 / n));
    if (cross.length > 1) {
      let n2 = 0, q = 0;
      for (let k = Math.ceil(cross[0]); k < Math.floor(cross[cross.length - 1]); k++) { const bi = acq.trigBin + k, i = ((bi % RING) + RING) % RING; n2 += r.n[i]; q += r.sum2[i]; }
      if (n2) rms = Math.sqrt(q / n2);
    }
    out.push({mean, vpp, min: mn, max: mx, rms, f: period ? 1 / period : 0, cross});
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
const SCOPE_COLORS = ['#e8ff5a', '#4cc9f0'];
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
  const yOf = (c, v) => H / 2 - (v / o.ch[c].vdiv + o.ch[c].pos) * dy;
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
    for (let c = 0; c < 2; c++) { // CH2 zuletzt, damit es auf einem breiten CH1-Band sichtbar bleibt
      if (!o.ch[c].on) continue;
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
  if (!o.xy) for (let c = 0; c < 2; c++) {
    if (!o.ch[c].on) continue;
    const y = yOf(c, 0);
    if (y < 0 || y > H) continue;
    pen.fillStyle = SCOPE_COLORS[c];
    pen.beginPath(); pen.moveTo(0, y - 6); pen.lineTo(9, y); pen.lineTo(0, y + 6); pen.fill();
    pen.fillStyle = '#0d0f0b'; pen.fillText(String(c + 1), 1, y + 3.5);
  }
  if (!o.xy) {
    const tc = o.trig.src, ty = yOf(tc, o.trig.lvl);
    if (ty > 0 && ty < H) { pen.fillStyle = SCOPE_COLORS[tc]; pen.beginPath(); pen.moveTo(W, ty - 6); pen.lineTo(W - 9, ty); pen.lineTo(W, ty + 6); pen.fill(); }
    const tx = PRE / COLS * W;
    pen.fillStyle = 'rgba(232, 255, 90, .8)'; pen.beginPath(); pen.moveTo(tx - 5, 0); pen.lineTo(tx + 5, 0); pen.lineTo(tx, 7); pen.fill();
  }
  pen.fillStyle = 'rgba(220, 228, 210, .82)';
  const top = o.ch.map((ch, c) => ch.on ? `CH${c + 1} ${fmt(ch.vdiv, 'V', 3)}/div ${ch.cpl}` : '').filter(Boolean).join('   ');
  pen.fillText(top, 8, 14);
  pen.textAlign = 'right';
  pen.fillText(!o.run ? 'STOP' : acq.status, W - 8, 14);
  pen.fillText(o.xy ? 'XY: CH1 → x, CH2 → y' : `T: CH${o.trig.src + 1} ${o.trig.slope > 0 ? '↗' : '↘'} ${fmt(o.trig.lvl, 'V', 3)} ${o.trig.mode === 'auto' ? 'AUTO' : 'NORMAL'}`, W - 8, H - 8);
  pen.textAlign = 'left';
  pen.fillText(o.xy ? '' : `${fmt(o.tdiv, 's', 3)}/div`, 8, H - 8);
}
function showMeasurements() {
  const m = acq.meas, rows = [0, 1].map(c => {
    const x = m?.[c], on = state.osz.ch[c].on;
    if (!x || !on) return `<tr class="ch${c + 1}"><th>CH${c + 1}</th><td colspan="5">${on ? '—' : 'aus'}</td></tr>`;
    return `<tr class="ch${c + 1}"><th>CH${c + 1}</th><td>${fmt(x.vpp, 'V')}</td><td>${fmt(x.rms, 'V')}</td><td>${fmt(x.mean, 'V')}</td><td>${x.f ? fmt(x.f, 'Hz', 4) : '—'}</td><td>${fmt(x.max, 'V')} / ${fmt(x.min, 'V')}</td></tr>`;
  }).join('');
  const ratio = m?.[0]?.vpp && m?.[1]?.vpp ? `CH2/CH1 = ${num(m[1].vpp / m[0].vpp, 3)}` : '';
  const ph = m?.phase !== undefined ? `Phase CH2 gegen CH1: ${num(m.phase, 3)}°` : '';
  $('osz-meas').innerHTML = `<table><thead><tr><th></th><th>Spitze-Spitze</th><th>Effektiv</th><th>Mittel</th><th>Frequenz</th><th>Max / Min</th></tr></thead><tbody>${rows}</tbody></table><p>${[ratio, ph].filter(Boolean).join(' · ') || '&nbsp;'}</p>`;
}

/* ---------- Geräte bedienen ---------- */
const rack = $('mp-rack');
function updateFgControls() {
  const f = state.fg;
  $('fg-display').innerHTML = f.on ? `<b>${FG_WAVES[f.wave]}</b> ${fmt(f.f, 'Hz', 4)} · ${num(f.vpp, 3)} Vss${f.off ? ` · Offset ${num(f.off, 3)} V` : ''}${f.wave === 'square' && f.duty !== 50 ? ` · ${Math.round(f.duty)} %` : ''}` : '<b>Ausgang aus</b>';
  rack.querySelectorAll('[data-fg-wave]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fgWave === f.wave)));
  $('fg-on').setAttribute('aria-pressed', String(f.on)); $('fg-on').textContent = f.on ? 'Ausgang an' : 'Ausgang aus';
  $('fg-f').value = Math.log10(f.f).toFixed(3); $('fg-vpp').value = f.vpp; $('fg-off').value = f.off; $('fg-duty').value = f.duty;
  $('fg-duty-row').hidden = f.wave !== 'square';
  liveBoard(true);
}
function updatePsuControls() {
  const p = state.psu;
  $('psu-v').value = p.V; $('psu-i').value = Math.log10(p.I).toFixed(3);
  $('psu-set').textContent = `Soll: ${num(p.V, 3)} V · Grenze ${fmt(p.I, 'A', 3)}`;
  $('psu-on').setAttribute('aria-pressed', String(p.on)); $('psu-on').textContent = p.on ? 'Ausgang an' : 'Ausgang aus';
}
function updateDmmControls() {
  rack.querySelectorAll('[data-dmm]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.dmm === state.dmm.mode)));
  const m = state.dmm.mode;
  $('dmm-hint').textContent = m.startsWith('A') ? 'Strom: Multimeter in Reihe, Buchsen A und COM.' : m === 'OHM' ? 'Widerstand: nur an spannungsfreien Bauteilen messen (VΩ und COM).' : m === 'DIODE' ? 'Diodentest: 1 mA Prüfstrom, angezeigt wird die Durchlassspannung.' : 'Spannung: parallel messen, Buchsen VΩ und COM.';
  $('dmm-fuse').hidden = dmm.fuse;
}
function updateOszControls() {
  const o = state.osz;
  for (let c = 0; c < 2; c++) {
    const ch = o.ch[c];
    $(`osz-v${c}`).textContent = `${fmt(ch.vdiv, 'V', 3)}/div`;
    $(`osz-pos${c}`).value = ch.pos;
    $(`osz-on${c}`).setAttribute('aria-pressed', String(ch.on));
    rack.querySelectorAll(`[data-cpl="${c}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === ch.cpl)));
  }
  $('osz-t').textContent = `${fmt(o.tdiv, 's', 3)}/div`;
  $('osz-xy').setAttribute('aria-pressed', String(o.xy));
  rack.querySelectorAll('[data-trig-src]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.trigSrc) === o.trig.src)));
  rack.querySelectorAll('[data-trig-slope]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.trigSlope) === o.trig.slope)));
  rack.querySelectorAll('[data-trig-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.trigMode === o.trig.mode)));
  const vd = o.ch[o.trig.src].vdiv, lvl = $('osz-lvl');
  lvl.min = -4 * vd; lvl.max = 4 * vd; lvl.step = vd / 25; lvl.value = o.trig.lvl;
  $('osz-lvl-val').textContent = fmt(o.trig.lvl, 'V', 3);
  $('osz-run').textContent = o.run ? '■ Stop' : '▶︎ Run';
  $('osz-run').setAttribute('aria-pressed', String(o.run));
}
function updateAll() { updateFgControls(); updatePsuControls(); updateDmmControls(); updateOszControls(); }
rack.addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  const f = state.fg, o = state.osz, d = b.dataset;
  if (d.fgWave) { f.wave = d.fgWave; sim.setStep(chooseDt()); updateFgControls(); }
  else if (b.id === 'fg-on') { f.on = !f.on; dirty = true; updateFgControls(); }
  else if (d.fgF) { f.f = clamp(d.fgF === 'x10' ? f.f * 10 : d.fgF === 'd10' ? f.f / 10 : S.step125(f.f, Number(d.fgF)), .1, 1e6); sim.setStep(chooseDt()); updateFgControls(); }
  else if (d.fgA) { f.vpp = clamp(Number((f.vpp + Number(d.fgA)).toFixed(2)), 0, 20); updateFgControls(); }
  else if (b.id === 'psu-on') { state.psu.on = !state.psu.on; dirty = true; updatePsuControls(); }
  else if (d.psuV) { state.psu.V = clamp(Number((state.psu.V + Number(d.psuV)).toFixed(2)), 0, 30); dirty = true; updatePsuControls(); }
  else if (d.dmm) { state.dmm.mode = d.dmm; dmm.range = 0; dmm.acc = {n: 0, s: 0, s2: 0, t: 0}; dirty = true; updateDmmControls(); }
  else if (b.id === 'dmm-fuse') { dmm.fuse = true; dirty = true; hint('Sicherung getauscht. Strom nur in Reihe messen!'); updateDmmControls(); }
  else if (d.vdiv) { const c = Number(d.vdiv); o.ch[c].vdiv = clamp(S.step125(o.ch[c].vdiv, Number(d.dir)), 1e-3, 20); updateOszControls(); }
  else if (d.cpl) { o.ch[Number(d.cpl)].cpl = d.value; acq.hp = [0, 0]; updateOszControls(); }
  else if (d.chOn) { const c = Number(d.chOn); o.ch[c].on = !o.ch[c].on; updateOszControls(); }
  else if (d.tdiv) { o.tdiv = clamp(S.step125(o.tdiv, Number(d.tdiv)), 1e-6, 2); sim.setStep(chooseDt()); acqReset(true); updateOszControls(); }
  else if (b.id === 'osz-xy') { o.xy = !o.xy; updateOszControls(); }
  else if (d.trigSrc) { o.trig.src = Number(d.trigSrc); updateOszControls(); }
  else if (d.trigSlope) { o.trig.slope = Number(d.trigSlope); updateOszControls(); }
  else if (d.trigMode) { o.trig.mode = d.trigMode; o.single = false; o.run = true; updateOszControls(); }
  else if (b.id === 'osz-single') { o.single = true; o.run = true; acq.state = 'armed'; acq.armT = sim.t; acq.status = 'WARTEN'; updateOszControls(); }
  else if (b.id === 'osz-run') { o.run = !o.run; o.single = false; if (o.run) { acq.state = 'armed'; acq.armT = sim.t; } updateOszControls(); }
  else if (b.id === 'osz-auto') autoset();
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
/* Autoset: Zeitbasis für etwa drei Perioden, Ablenkung für etwa sechs Teilungen, Trigger in die Mitte */
function autoset() {
  const o = state.osz, m = acq.meas;
  let f = m?.[0]?.f || m?.[1]?.f || (state.fg.on ? state.fg.f : 0);
  if (f) { let t = 1e-6; while (t * 10 < 2 / f && t < 2) t = S.step125(t, 1); o.tdiv = t; } // etwa zwei Perioden
  for (let c = 0; c < 2; c++) {
    const x = m?.[c];
    if (!x) continue;
    const span = Math.max(Math.abs(x.max - x.mean) * 2, x.vpp, 1e-3);
    let vd = 1e-3; while (vd * 6 < span && vd < 20) vd = S.step125(vd, 1);
    o.ch[c].vdiv = vd; o.ch[c].cpl = 'DC'; o.ch[c].on = true;
    o.ch[c].pos = clamp(-x.mean / vd, -3, 3);
  }
  o.trig.src = m?.[0] ? 0 : 1;
  const grid = o.ch[o.trig.src].vdiv / 25; o.trig.lvl = Math.round((m?.[o.trig.src]?.mean || 0) / grid) * grid || 0; // auf das Raster des Pegelreglers o.trig.mode = 'auto'; o.run = true; o.xy = false;
  if (o.ch[0].on && o.ch[1].on && m?.[0] && m?.[1]) { o.ch[0].pos = clamp(2 - m[0].mean / o.ch[0].vdiv, -3, 3); o.ch[1].pos = clamp(-2 - m[1].mean / o.ch[1].vdiv, -3, 3); }
  sim.setStep(chooseDt()); acqReset(true); updateOszControls(); save();
  hint('Autoset: Zeitbasis, Ablenkung und Trigger an das Signal angepasst.');
}

/* ---------- Live-Werte auf dem Brett und im Inspektor ---------- */
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
  st('dmm', dmm.shown || DMM_MODES[state.dmm.mode][0]);
  const live = $('mp-live'), part = sel && getPart(sel);
  if (live && part && !PARTS[part.type].instr) {
    let rows = [];
    if (part.broken) rows = [['Zustand', 'defekt']];
    else if (part.type === 'NPN' || part.type === 'PNP') { const q = sim.info(part.id); if (q) rows = [['I_C', fmt(q.ic, 'A')], ['I_B', fmt(q.ib, 'A')], ['U_CE', fmt(q.uce, 'V')], ['U_BE', fmt(q.ube, 'V')], ['B = I_C/I_B', q.ib ? num(q.ic / q.ib, 3) : '—']]; }
    else if (part.type === 'OP') { const q = sim.info(part.id); if (q) rows = [['U_A', fmt(q.u, 'V')], ['I_A', fmt(q.i, 'A')], ['U_D (+ − −)', fmt(q.ud, 'V')]]; }
    else if (part.type === 'POT') { const a = sim.info(part.id + '.a'), b = sim.info(part.id + '.b'); if (a && b) rows = [['U (A–S)', fmt(a.u, 'V')], ['U (S–E)', fmt(b.u, 'V')], ['I (A→S)', fmt(a.i, 'A')]]; }
    else if (part.type !== 'GND') { const q = sim.info(part.id); if (q) rows = [['U', fmt(q.u, 'V')], ['I', fmt(q.i, 'A')], ['P', fmt(Math.abs(q.u * q.i), 'W')]]; }
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
    if (seen.has(n)) return;
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
function checkDamage(dtReal) {
  void dtReal;
  for (const p of state.parts) {
    const r = PARTS[p.type].rating;
    if (!r || p.broken) continue;
    let over = 0, why = '';
    if (p.type === 'NPN' || p.type === 'PNP') { const q = sim.info(p.id); if (!q) continue; const P = Math.abs(q.ic * q.uce); over = Math.max(Math.abs(q.ic) / r.I, P / r.P); why = `Überlastet: ${fmt(Math.abs(q.ic), 'A')}, ${fmt(P, 'W')}`; }
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
  const a = sim.info('dmm.A');
  if (dmm.fuse && a && Math.abs(a.i) > FUSE) { dmm.overI++; if (dmm.overI > 3) { dmm.fuse = false; dmm.overI = 0; dirty = true; hint('Peng: Die 400-mA-Sicherung im Multimeter ist durchgebrannt. Die A-Buchse ist fast ein Kurzschluss — Strom nur in Reihe messen!'); updateDmmControls(); } }
  else dmm.overI = 0;
}

/* ---------- Multimeter-Anzeige ---------- */
function dmmSample() {
  const m = state.dmm.mode;
  let q;
  if (m === 'ADC' || m === 'AAC') q = dmm.fuse ? (sim.v(nodes.dmmA) - sim.v(nodes.dmmC)) / SHUNT : 0;
  else q = sim.v(nodes.dmmV) - sim.v(nodes.dmmC);
  const a = dmm.acc, h = sim.step();
  a.n += h; a.s += q * h; a.s2 += q * q * h; a.t += h;
}
/* vier feste Stellen wie auf einem Multimeter-Display: 4,700 kΩ, 583,9 mV */
function dmmFmt(value, unit) {
  if (value === 0) return `0,000 ${unit}`;
  const pre = [[1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n']], abs = Math.abs(value);
  const [f, p] = pre.find(([x]) => abs >= x * .99995) || pre[pre.length - 1];
  return `${(value / f).toPrecision(4).replace('.', ',')} ${p}${unit}`;
}
function dmmShow(now) {
  const a = dmm.acc, m = state.dmm.mode;
  const need = state.fg.on ? clamp(3 / state.fg.f, .02, 1) : .02; // über ganze Generatorperioden mitteln
  if (a.t < need || now - dmm.lastShow < 250) return;
  dmm.lastShow = now;
  const mean = a.s / a.n, ac = Math.sqrt(Math.max(0, a.s2 / a.n - mean * mean));
  dmm.acc = {n: 0, s: 0, s2: 0, t: 0};
  let text, unit = DMM_MODES[m][1];
  if (m === 'VDC' || m === 'ADC') text = Math.abs(mean) > (m === 'VDC' ? 1000 : FUSE) ? 'OL' : dmmFmt(mean, unit);
  else if (m === 'VAC' || m === 'AAC') text = dmmFmt(ac, unit);
  else if (m === 'DIODE') text = mean > 2 ? 'OL' : dmmFmt(mean, 'V');
  else {
    const I = OHM_RANGES[dmm.range];
    if (mean > 2.2 && dmm.range < OHM_RANGES.length - 1 && now > dmm.rangeHold) { dmm.range++; dmm.rangeHold = now + 300; dirty = true; text = '…'; }
    else if (mean < .18 && dmm.range > 0 && now > dmm.rangeHold) { dmm.range--; dmm.rangeHold = now + 300; dirty = true; text = '…'; }
    if (text === '…') dmm.acc = {n: 0, s: 0, s2: 0, t: 0};
    else text = mean > 2.2 ? 'OL' : dmmFmt(Math.max(0, mean) / I, 'Ω');
  }
  if (!dmm.fuse && m.startsWith('A')) text = 'FUSE';
  dmm.shown = text;
  $('dmm-display').innerHTML = `<b>${esc(text)}</b><small>${DMM_MODES[m][0]}${m === 'OHM' ? ' · Prüfstrom ' + fmt(OHM_RANGES[dmm.range], 'A') : ''}</small>`;
}
function psuShow() {
  const ps = sim.info('psu');
  const fix = (v, d) => Math.max(0, v).toFixed(d).replace('.', ','); // wie das Display eines Labornetzgeräts: 10,00 V · 0,015 A
  $('psu-display').innerHTML = state.psu.on && ps ? `<b>${fix(ps.u, 2)} V</b><b>${fix(ps.i, 3)} A</b>` : '<b>—,— V</b><b>—,— A</b>';
  $('psu-cv').classList.toggle('on', !!(state.psu.on && ps && !ps.cc));
  $('psu-cc').classList.toggle('on', !!(state.psu.on && ps?.cc));
}

/* ---------- Hauptschleife: rechnen, so schnell es geht, höchstens in Echtzeit ---------- */
const simClock = {target: 0, last: 0, ratio: 1, simRate: 0};
function frame(now) {
  const real = Math.min(.1, (now - (simClock.last || now)) / 1000);
  simClock.last = now;
  if (dirty) rebuild();
  if (!document.hidden && !sim.error) {
    simClock.target += real;
    const t0 = sim.t, deadline = performance.now() + 10;
    while (sim.t < simClock.target && performance.now() < deadline) {
      for (let k = 0; k < 40 && sim.t < simClock.target; k++) { if (!sim.advance()) break; sample(); dmmSample(); }
      if (sim.error) break;
    }
    if (sim.t < simClock.target - .05) simClock.target = sim.t; // Rückstand nicht aufsummieren: dann eben Zeitlupe
    simClock.ratio = simClock.ratio * .9 + (real ? (sim.t - t0) / real : 1) * .1;
    checkDamage(real);
    dmmShow(now); psuShow();
  }
  drawScope();
  if (acq.meas !== showMeasurements.last) { showMeasurements(); showMeasurements.last = acq.meas; }
  liveBoard(false);
  status();
  requestAnimationFrame(frame);
}
let statusTimer = 0;
function status() {
  const now = performance.now();
  if (now - statusTimer < 300) return;
  statusTimer = now;
  const r = simClock.ratio, speed = r > .97 ? 'Echtzeit' : r > .01 ? `Zeitlupe ${num(r * 100, 2)} %` : `Zeitlupe 1 : ${num(1 / Math.max(r, 1e-9), 2)}`;
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
  else if (b.dataset.zoom) setZoom(b.dataset.zoom === 'fit' ? fitZoom() : zoom * Number(b.dataset.zoom));
});
$('mp-palette').addEventListener('click', ev => { const b = ev.target.closest('[data-add]'); if (b) addPart(b.dataset.add); });
function share() {
  const json = JSON.stringify({...state, sel: undefined}), bytes = new TextEncoder().encode(json);
  let bin = ''; bytes.forEach(x => { bin += String.fromCharCode(x); });
  const link = `${location.origin}${location.pathname}#aufbau=${btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  const done = () => hint('Link kopiert: Er enthält Aufbau und Geräteeinstellungen.');
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
versuchList.innerHTML = VERSUCHE.map((v, i) => `<button type="button" class="mp-v" data-versuch="${v.id}"><span class="mp-v-nr">${String(i + 1).padStart(2, '0')}</span><b>${esc(v.title)}</b><small>${esc(v.kurz)}</small></button>`).join('');
versuchList.addEventListener('click', ev => {
  const b = ev.target.closest('[data-versuch]');
  if (!b) return;
  const v = VERSUCHE.find(x => x.id === b.dataset.versuch);
  undoStack.past.push(snapshot()); undoStack.future = [];
  state = buildVersuch(v);
  sel = null; ropes.clear();
  restart(); updateAll(); renderVersuch(); changed(true);
  hint(`Versuch „${v.title}“ aufgebaut.`);
  $('bench').scrollIntoView({block: 'start', behavior: reducedMotion.matches ? 'auto' : 'smooth'});
});
function renderVersuch() {
  versuchList.querySelectorAll('[data-versuch]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.versuch === state.versuch)));
  const v = VERSUCHE.find(x => x.id === state.versuch);
  anleitung.hidden = !v;
  if (!v) return;
  const math = t => esc(t).replace(/\$([^$]+)\$/g, (_, tex) => `<span class="math math-inline">${tex}</span>`);
  anleitung.innerHTML = `<span class="eyebrow">Versuch ${String(VERSUCHE.indexOf(v) + 1).padStart(2, '0')}</span><h3>${esc(v.title)}</h3>
    <ol>${v.aufgaben.map(a => `<li>${esc(a)}</li>`).join('')}</ol>
    <details><summary>Was die Theorie sagt</summary><p>${math(v.theorie)}</p></details>`;
  OSCI.loadKatex().then(() => anleitung.querySelectorAll('.math').forEach(el => { const tex = el.textContent; try { window.katex.render(tex, el, {throwOnError: false, strict: 'ignore'}); } catch { el.textContent = tex; } })).catch(() => {});
}

/* ---------- Start ---------- */
$('mp-palette').innerHTML = PALETTE.map(t => `<button type="button" data-add="${t}" title="${esc(PARTS[t].name)}"><svg viewBox="0 0 ${PARTS[t].geom.w} ${PARTS[t].geom.h}" aria-hidden="true">${PARTS[t].sym({})}</svg><span>${esc(PARTS[t].name.replace(/ (1N4148|BC547|BC557)$/, ''))}</span></button>`).join('');
setZoom(matchMedia('(max-width: 760px)').matches ? .55 : fitZoom());
renderParts(); updateAll(); renderVersuch(); updateTools();
if (fromLink) { window.history.replaceState(null, '', location.pathname + location.search); hint('Geteilter Aufbau geladen.'); }
addEventListener('resize', () => { if (!matchMedia('(max-width: 760px)').matches) setZoom(fitZoom()); });
document.addEventListener('visibilitychange', () => { simClock.last = 0; simClock.target = sim.t; });
requestAnimationFrame(frame);
window.OSCIMessplatz = {state: () => state, sim, acq, shown, versuche: VERSUCHE, load: id => versuchList.querySelector(`[data-versuch="${id}"]`)?.click()};
})();
