/* osci//lab — Patch-Pult auf der Startseite.
   Bausteine sind ideale, gepufferte Audio-Module (kein Netzwerk-Solver); siehe models.js. */
'use strict';
(() => {
const $ = (id) => document.getElementById(id);
if (!$('patch-board')) return;

const DEFINITIONS = {
  osc: {
    title: 'Oszillator', symbol: '∿', kind: 'Signalquelle', unit: 'f / Frequenz / Hertz [Hz]',
    text: 'Ein Oszillator erzeugt eine regelmäßige Schwingung. Die Frequenz zählt, wie oft sie sich pro Sekunde wiederholt. Mehr Hertz hörst du als höheren Ton.',
    formula: 'T = 1 / f', detail: p => `${number(p.frequency)} Hz · ${waveNames[p.wave]}`,
    result: p => `Eine Periode dauert ${number(1000 / p.frequency)} ms.`,
    nudge: 'Verdopple die Frequenz von 220 auf ungefähr 440 Hz. Du hörst eine Oktave höher. Wähle Sägezahn, um die Wirkung eines Filters deutlicher zu hören.',
    params: {frequency: {label: 'Frequenz', unit: 'Hz', min: 55, max: 1760, initial: 220, log: true}}
  },
  resistor: {
    title: 'Widerstand', symbol: 'R', kind: 'Spannungsteiler', unit: 'R / Widerstand / Ohm [Ω]',
    text: 'Ein Widerstand begrenzt den Strom und wandelt elektrische Energie in Wärme um. Hier sitzt er vor einem festen Lastwiderstand von 10 kΩ: Zusammen teilen sie die Spannung.',
    formula: 'U = R · I', detail: p => `${number(p.r)} kΩ · Serie`,
    result: p => `Uaus / Uein = ${number(LabModels.divider(p.r * 1000, 10000))}. Last: 10 kΩ.`,
    nudge: 'Setze R auf 10 kΩ. Bei zwei gleich großen Widerständen liegt am Ausgang die halbe Eingangsspannung an. Größeres R macht diesen Patch leiser.',
    params: {r: {label: 'Serienwiderstand R', unit: 'kΩ', min: .1, max: 100, initial: 10, log: true}}
  },
  capacitor: {
    title: 'Kondensator', symbol: 'C', kind: 'RC / Tiefpass', unit: 'C / Kapazität / Farad [F] · 1 nF = 10⁻⁹ F',
    text: 'Ein Kondensator speichert Energie im elektrischen Feld. Seine Spannung kann bei endlichem Strom nicht sprunghaft wechseln. Hier liegt C nach einem Serienwiderstand gegen Masse: ein RC-Tiefpass.',
    formula: 'Q = C · U   /   fᶜ = 1 / (2πRC)', detail: p => `${number(p.c)} nF · ${number(p.r)} kΩ`,
    result: p => `Grenzfrequenz: ${hz(LabModels.rcCutoff(p.r * 1000, p.c * 1e-9))}. Zeitkonstante τ: ${number(p.r * p.c / 1000)} ms.`,
    nudge: 'Erhöhe C von 22 auf 100 nF. Die Grenzfrequenz sinkt; der Sägezahn verliert Höhen. Doppeltes C bedeutet bei gleichem R die halbe Grenzfrequenz.',
    params: {c: {label: 'Kapazität C', unit: 'nF', min: 1, max: 2200, initial: 22, log: true}, r: {label: 'Serienwiderstand R', unit: 'kΩ', min: 1, max: 100, initial: 10, log: true}}
  },
  inductor: {
    title: 'Spule', symbol: 'L', kind: 'RL / Tiefpass', unit: 'L / Induktivität / Henry [H] · 1 mH = 10⁻³ H',
    text: 'Eine Spule speichert Energie im magnetischen Feld und wirkt Stromänderungen entgegen. In diesem Modell liegt L in Serie und R gegen Masse. Die Ausgangsspannung wird über R gemessen.',
    formula: 'uᴸ = L · di/dt   /   fᶜ = R / (2πL)', detail: p => `${number(p.l)} mH · ${number(p.r)} Ω`,
    result: p => `Grenzfrequenz: ${hz(LabModels.rlCutoff(p.r, p.l / 1000))}. Zeitkonstante τ: ${number(p.l / p.r)} ms.`,
    nudge: 'Erhöhe L. Die Grenzfrequenz dieses RL-Tiefpasses sinkt. Erhöhe danach R: Hier steigt die Grenzfrequenz — anders als beim RC-Tiefpass.',
    params: {l: {label: 'Induktivität L', unit: 'mH', min: 10, max: 1000, initial: 100, log: true}, r: {label: 'Lastwiderstand R', unit: 'Ω', min: 10, max: 2000, initial: 100, log: true}}
  },
  tremolo: {
    title: 'Tremolo', symbol: '↝', kind: 'Modulation', unit: 'f / Modulationsrate / Hertz [Hz]',
    text: 'Ein langsamer Oszillator bewegt die Lautstärke. Das nennt man Amplitudenmodulation. Die Tonhöhe der Quelle bleibt dabei gleich; der Klang pulsiert.',
    formula: 'g(t) = 1 − d/2 + (d/2) · sin(2πft)', detail: p => `${number(p.rate)} Hz · ${number(p.depth)} %`,
    result: p => `Ein Lautstärkezyklus dauert ${number(1 / p.rate)} s.`,
    nudge: 'Stelle das Tempo auf 2 Hz und die Tiefe auf 100 %. Die Lautstärke schwingt zweimal pro Sekunde zwischen ganz leise und dem vollen Pegel.',
    params: {rate: {label: 'Tempo', unit: 'Hz', min: .2, max: 15, initial: 4, log: true}, depth: {label: 'Tiefe', unit: '%', min: 0, max: 100, initial: 45, log: false}}
  },
  out: {
    title: 'Ausgang', symbol: '↗︎', kind: 'Abhören', unit: 'Pegel / relative Lautstärke [%]',
    text: 'Hier endet dein Signalweg. Ein angeschlossener Oszillator wird hörbar, sobald du den Ton startest. Mehrere Quellen können hier zusammenkommen.',
    formula: 'Quelle → Verarbeitung → Ausgang', detail: p => `${number(p.volume)} % · Ausgang`,
    result: () => 'Der Limiter im Ausgang fängt Pegelspitzen ab.',
    nudge: 'Vergleiche den direkten Weg vom Oszillator zum Ausgang mit dem Weg durch einen Filter. Trenne dazu ein Kabel mit dem × in seiner Mitte; parallele Wege werden zusammengemischt.',
    params: {volume: {label: 'Ausgangspegel', unit: '%', min: 0, max: 25, initial: 10, log: false}}
  }
};
const waveNames = {sine: 'Sinus', triangle: 'Dreieck', sawtooth: 'Sägezahn', square: 'Rechteck'};
const waveIcons = {sine: '∿', triangle: '⋀', sawtooth: '⊿', square: '⊓'};
const BOARD = {w: 1300, h: 860, nodeW: 210, maxX: 1060, maxY: 610};
function number(v) { return new Intl.NumberFormat('de-DE', {maximumFractionDigits: v < 1 ? 3 : v < 20 ? 2 : 1}).format(v); }
function hz(v) { return v >= 1000 ? `${number(v / 1000)} kHz` : `${number(v)} Hz`; }
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- Zustand ---------- */
let nextId = 1;
function makeNode(type, x, y) {
  const p = {};
  for (const [key, spec] of Object.entries(DEFINITIONS[type].params)) p[key] = spec.initial;
  if (type === 'osc') p.wave = 'sawtooth';
  return {id: 'n' + nextId++, type, x, y, p};
}
function starter(kind = 'rc') {
  nextId = 1;
  if (kind === 'beat') {
    const a = makeNode('osc', 40, 40), b = makeNode('osc', 40, 330), out = makeNode('out', 400, 180);
    a.p.wave = b.p.wave = 'sine'; b.p.frequency = 223;
    return {nodes: [a, b, out], edges: [{from: a.id, to: out.id}, {from: b.id, to: out.id}], selected: b.id};
  }
  /* Auf schmalen Bildschirmen im Quadrat statt in einer Reihe, damit der Zoom groß genug zum Tippen bleibt. */
  const narrow = matchMedia('(max-width: 560px)').matches;
  const source = makeNode('osc', narrow ? 20 : 40, narrow ? 20 : 90);
  const effect = makeNode(kind === 'rl' ? 'inductor' : kind === 'pulse' ? 'tremolo' : 'capacitor', narrow ? 280 : 330, narrow ? 20 : 150);
  const output = makeNode('out', narrow ? 280 : 620, narrow ? 260 : 90);
  return {nodes: [source, effect, output], edges: [{from: source.id, to: effect.id}, {from: effect.id, to: output.id}], selected: effect.id};
}
/* Prüft gespeicherte oder geteilte Patches, bevor sie geladen werden. */
function sanitize(saved) {
  try {
    if (!saved || !Array.isArray(saved.nodes) || !saved.nodes.length || saved.nodes.length > 12 || !Array.isArray(saved.edges) || saved.edges.length > 50) return null;
    const ids = new Set();
    const nodes = saved.nodes.map(raw => {
      if (!raw || !Object.hasOwn(DEFINITIONS, raw.type) || !/^n\d{1,6}$/.test(raw.id) || ids.has(raw.id)) throw Error('invalid node');
      ids.add(raw.id);
      const node = {id: raw.id, type: raw.type, x: clamp(Number(raw.x) || 0, 20, BOARD.maxX), y: clamp(Number(raw.y) || 0, 20, BOARD.maxY), p: {}};
      for (const [key, spec] of Object.entries(DEFINITIONS[node.type].params)) node.p[key] = clamp(Number.isFinite(raw.p?.[key]) ? raw.p[key] : spec.initial, spec.min, spec.max);
      if (node.type === 'osc') node.p.wave = Object.hasOwn(waveNames, raw.p?.wave) ? raw.p.wave : 'sawtooth';
      return node;
    });
    if (nodes.filter(n => n.type === 'out').length !== 1 || nodes.filter(n => n.type === 'osc').length > 4) return null;
    const edges = [];
    for (const e of saved.edges) {
      const from = nodes.find(n => n.id === e?.from), to = nodes.find(n => n.id === e?.to);
      if (from && to && from.type !== 'out' && to.type !== 'osc' && LabModels.canConnect(edges, from.id, to.id)) edges.push({from: from.id, to: to.id});
    }
    return {nodes, edges, selected: ids.has(saved.selected) ? saved.selected : nodes[0].id};
  } catch { return null; }
}
function syncNextId() { nextId = Math.max(0, ...state.nodes.map(n => Number(n.id.slice(1)))) + 1; }
const STORAGE = 'osci-log-patch-v2';
function loadSaved() { try { return sanitize(JSON.parse(localStorage.getItem(STORAGE))); } catch { return null; } }
function loadShared() {
  const match = location.hash.match(/^#patch=([\w-]+)$/);
  if (!match) return null;
  try { return sanitize(LabModels.decodePatch(match[1])); } catch { return null; }
}
const shared = loadShared();
const saved = loadSaved();
let state = shared || saved || starter();
syncNextId();
let pending = null;   // {id, dir} beim Verbinden per Klick
let wireDrag = null;  // Kabel, das gerade gezogen wird
let zoom = 1;
const heights = new Map();

const board = $('patch-board'), nodesEl = $('nodes'), wires = $('wires'), handlesEl = $('wire-handles'), scrollArea = $('board-scroll'), sizer = $('board-sizer');
const getNode = id => state.nodes.find(n => n.id === id);
const nodeName = n => `${DEFINITIONS[n.type].title} ${n.id.slice(1)}`;
function save() { try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch { /* Speicher kann deaktiviert sein; das Labor funktioniert trotzdem. */ } }
let hintTimer = 0;
function message(text) {
  $('patch-message').textContent = text;
  /* Auf dem Handy zusätzlich kurz in der mitlaufenden Play-Leiste zeigen, wo man gerade hinschaut. */
  const hint = $('lab-hint');
  hint.textContent = text; hint.classList.add('show');
  clearTimeout(hintTimer); hintTimer = setTimeout(() => hint.classList.remove('show'), 4200);
}

/* ---------- Rückgängig / Wiederholen ---------- */
const history = {past: [], future: []};
let lastGesture = '', lastGestureTime = 0;
const snapshot = () => JSON.stringify({nodes: state.nodes, edges: state.edges, selected: state.selected});
function remember() {
  history.past.push(snapshot());
  if (history.past.length > 80) history.past.shift();
  history.future = [];
  updateHistoryButtons();
}
/* Viele kleine Änderungen hintereinander (Regler ziehen) zählen als ein Schritt. */
function rememberGesture(key) {
  const now = Date.now();
  if (key !== lastGesture || now - lastGestureTime > 900) remember();
  lastGesture = key; lastGestureTime = now;
}
function restoreSnapshot(text) {
  const next = sanitize(JSON.parse(text));
  if (!next) return;
  state = next; syncNextId(); pending = null; lastGesture = '';
  render(); scheduleAudio(true); updateHistoryButtons();
}
function undo() {
  if (!history.past.length) { message('Nichts zum Rückgängigmachen.'); return; }
  history.future.push(snapshot()); restoreSnapshot(history.past.pop()); message('Rückgängig gemacht.');
}
function redo() {
  if (!history.future.length) return;
  history.past.push(snapshot()); restoreSnapshot(history.future.pop()); message('Wiederhergestellt.');
}
function updateHistoryButtons() {
  $('undo').disabled = !history.past.length;
  $('redo').disabled = !history.future.length;
}

/* ---------- Darstellung ---------- */
function sliderPosition(value, spec) { return spec.log ? Math.log(value / spec.min) / Math.log(spec.max / spec.min) * 100 : (value - spec.min) / (spec.max - spec.min) * 100; }
function sliderValue(position, spec) {
  const v = spec.log ? spec.min * Math.pow(spec.max / spec.min, position / 100) : spec.min + (spec.max - spec.min) * position / 100;
  return Number(v.toPrecision(4));
}
function parameterControl(node, key, inline = false) {
  const spec = DEFINITIONS[node.type].params[key];
  const id = `${inline ? 'quick' : 'edit'}-${node.id}-${key}`;
  const title = inline ? `${nodeName(node)}: ${spec.label}` : spec.label;
  const slider = `<input id="${id}" type="range" min="0" max="100" step="0.1" value="${sliderPosition(node.p[key], spec)}" data-node="${node.id}" data-param="${key}" aria-label="${title}" aria-valuetext="${number(node.p[key])} ${spec.unit}">`;
  if (inline) return `<label class="control" for="${id}">${slider}</label>`;
  return `<label class="control" for="${id}"><span class="control-row">${spec.label}<output data-read="${node.id}-${key}" for="${id}">${number(node.p[key])} ${spec.unit}</output></span>${slider}</label><div class="exact-value"><input type="number" min="${spec.min}" max="${spec.max}" step="any" value="${node.p[key]}" data-exact="${node.id}" data-key="${key}" aria-label="${spec.label} exakt eingeben"><span>${spec.unit}</span></div>`;
}
function waveSwitch(n) {
  return `<div class="wave-switch" role="group" aria-label="${nodeName(n)}: Wellenform">${Object.entries(waveNames).map(([v, t]) => `<button type="button" data-quick-wave="${n.id}" data-wave-value="${v}" aria-pressed="${n.p.wave === v}" title="${t}">${waveIcons[v]}</button>`).join('')}</div>`;
}
function nodeResult(n) {
  if (n.type === 'capacitor') return `fᶜ ${hz(LabModels.rcCutoff(n.p.r * 1000, n.p.c * 1e-9))}`;
  if (n.type === 'inductor') return `fᶜ ${hz(LabModels.rlCutoff(n.p.r, n.p.l / 1000))}`;
  if (n.type === 'resistor') return `Spannungsfaktor ${number(LabModels.divider(n.p.r * 1000, 10000))}`;
  if (n.type === 'osc') return 'Signalquelle / periodisch';
  if (n.type === 'tremolo') return 'Lautstärke in Bewegung';
  return audibleSources().length ? 'Hier kommt Signal an' : 'Noch still — verbinde eine Quelle';
}
function focusKey(el) {
  if (!el || !nodesEl.contains(el)) return null;
  for (const attr of ['data-grab', 'data-param', 'data-quick-wave']) if (el.hasAttribute(attr)) return `[${attr}="${el.getAttribute(attr)}"]${el.dataset.node ? `[data-node="${el.dataset.node}"]` : ''}${el.dataset.waveValue ? `[data-wave-value="${el.dataset.waveValue}"]` : ''}`;
  if (el.dataset.port) return `[data-port="${el.dataset.port}"][data-node="${el.dataset.node}"]`;
  return null;
}
function renderNodes() {
  const keep = focusKey(document.activeElement);
  nodesEl.innerHTML = state.nodes.map(n => {
    const d = DEFINITIONS[n.type], key = Object.keys(d.params)[0];
    const incoming = state.edges.some(e => e.to === n.id), outgoing = state.edges.some(e => e.from === n.id);
    const inPort = n.type !== 'osc' ? `<button class="port port-in ${incoming ? 'connected' : ''}" data-port="in" data-node="${n.id}" type="button" aria-label="${nodeName(n)}: Eingang"><span class="port-dot"></span><span class="port-label">IN</span></button>` : '';
    const outPort = n.type !== 'out' ? `<button class="port port-out ${outgoing ? 'connected' : ''}" data-port="out" data-node="${n.id}" type="button" aria-label="${nodeName(n)}: Ausgang — auf einen Eingang ziehen oder klicken"><span class="port-label">OUT</span><span class="port-dot"></span></button>` : '';
    return `<article class="node node-${n.type} ${state.selected === n.id ? 'selected' : ''}" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px" aria-label="${nodeName(n)}"><button class="node-head" data-grab="${n.id}" type="button" aria-label="${nodeName(n)} verschieben (ziehen oder Pfeiltasten)"><span class="node-kind">${d.symbol} / ${d.kind}</span><span class="node-id">${n.id.slice(1).padStart(2, '0')} ⠿</span></button><div class="node-body"><h3 class="node-title">${d.title}</h3><p class="node-reading" data-summary="${n.id}">${d.detail(n.p)}</p><p class="node-sub" data-result="${n.id}">${nodeResult(n)}</p>${n.type === 'osc' ? waveSwitch(n) : ''}${parameterControl(n, key, true)}</div>${inPort}${outPort}</article>`;
  }).join('');
  nodesEl.querySelectorAll('.node').forEach(el => heights.set(el.dataset.id, el.offsetHeight));
  $('master').value = getOut().p.volume;
  $('patch-summary').textContent = `${state.nodes.length} Bausteine · ${state.edges.length} Kabel`;
  markTargets();
  drawWires();
  if (keep) nodesEl.querySelector(keep)?.focus({preventScroll: true});
}
function renderInspector() {
  const n = getNode(state.selected); if (!n) return;
  const d = DEFINITIONS[n.type];
  const cables = state.edges.map((e, i) => e.from === n.id || e.to === n.id ? `<button type="button" data-unlink="${i}">${nodeName(getNode(e.from))} → ${nodeName(getNode(e.to))} <span aria-hidden="true">×</span></button>` : '').join('');
  $('inspector').innerHTML = `<div class="inspector-main"><span class="inspector-kicker">Baustein ${n.id.slice(1).padStart(2, '0')} / Verstehen</span><h3>${d.title}</h3><div class="unit">${d.unit}</div><p>${d.text}</p><div class="formula">${d.formula}</div><p id="model-result">${d.result(n.p)}</p></div><div class="inspector-settings">${n.type === 'osc' ? `<label class="control" for="edit-wave">Wellenform<select id="edit-wave" data-wave="${n.id}">${Object.entries(waveNames).map(([v, t]) => `<option value="${v}" ${n.p.wave === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}${Object.keys(d.params).map(k => parameterControl(n, k)).join('')}<div class="learn-nudge"><strong>Probier das</strong><p>${d.nudge}</p></div><div class="inspector-actions">${n.type !== 'out' ? '<button class="button small" id="auto-connect" type="button">In Patch einsetzen ↗︎</button><button class="button small" id="remove-node" type="button">Entfernen ×</button>' : ''}</div><div class="edge-list"><span class="inspector-kicker">Kabel dieses Bausteins</span>${cables || '<p>Noch keine Verbindung. Zieh von OUT ● zu einem IN ●.</p>'}</div></div>`;
}
function selectNode(id) {
  if (state.selected === id) return;
  state.selected = id;
  nodesEl.querySelectorAll('.node').forEach(el => el.classList.toggle('selected', el.dataset.id === id));
  renderInspector(); drawWires(); save();
}
function render() { renderNodes(); renderInspector(); renderChain(); save(); }

/* Kabel-Geometrie direkt aus den Node-Positionen: OUT sitzt auf der rechten Kante, IN auf der linken,
   der Punkt 6 px unter der halben Höhe (darüber steht die Beschriftung, siehe .port in labor.css). */
function portPoint(id, dir) {
  const n = getNode(id), h = heights.get(id) || 220;
  return {x: dir === 'out' ? n.x + BOARD.nodeW : n.x, y: n.y + h / 2 + 6};
}
function cablePath(a, b) {
  const bend = Math.max(40, Math.abs(b.x - a.x) * .5);
  return `M${a.x},${a.y} C${a.x + bend},${a.y} ${b.x - bend},${b.y} ${b.x},${b.y}`;
}
function drawWires() {
  let paths = '', handles = '';
  state.edges.forEach((e, i) => {
    if (!getNode(e.from) || !getNode(e.to)) return;
    const a = portPoint(e.from, 'out'), b = portPoint(e.to, 'in');
    const active = e.from === state.selected || e.to === state.selected;
    paths += `<path class="wire ${active ? 'selected-wire' : ''}" d="${cablePath(a, b)}"/>`;
    const bend = Math.max(40, Math.abs(b.x - a.x) * .5);
    const mx = (a.x + 3 * (a.x + bend) + 3 * (b.x - bend) + b.x) / 8, my = (a.y + b.y) / 2;
    handles += `<button class="wire-cut ${active ? 'active' : ''}" type="button" data-unlink="${i}" style="left:${mx}px;top:${my}px" aria-label="Kabel ${nodeName(getNode(e.from))} → ${nodeName(getNode(e.to))} trennen" title="Kabel trennen">×</button>`;
  });
  if (wireDrag?.moved) {
    const start = portPoint(wireDrag.id, wireDrag.dir), end = wireDrag.point;
    paths += `<path class="wire draft-wire" d="${wireDrag.dir === 'out' ? cablePath(start, end) : cablePath(end, start)}"/>`;
  }
  wires.innerHTML = paths;
  handlesEl.innerHTML = handles;
}

/* ---------- Verbinden ---------- */
function getOut() { return state.nodes.find(n => n.type === 'out'); }
function linkFor(startId, dir, targetId) {
  return dir === 'out' ? {from: startId, to: targetId} : {from: targetId, to: startId};
}
function canLink(link) {
  const from = getNode(link.from), to = getNode(link.to);
  return !!from && !!to && from.type !== 'out' && to.type !== 'osc' && LabModels.canConnect(state.edges, link.from, link.to);
}
function markTargets() {
  const source = wireDrag || pending;
  board.classList.toggle('is-connecting', !!source);
  nodesEl.querySelectorAll('.node').forEach(el => {
    const id = el.dataset.id;
    const ok = !!source && id !== source.id && canLink(linkFor(source.id, source.dir, id));
    el.classList.toggle('can-drop', ok);
    el.classList.toggle('no-drop', !!source && !ok && id !== source.id);
    el.classList.toggle('is-source', !!source && id === source.id);
  });
  nodesEl.querySelectorAll('[data-port]').forEach(el => {
    const on = !!pending && pending.id === el.dataset.node && pending.dir === el.dataset.port;
    el.classList.toggle('pending', on);
    el.setAttribute('aria-pressed', String(on));
  });
}
function connect(link) {
  const from = getNode(link.from), to = getNode(link.to);
  if (!canLink(link)) {
    const reason = !from || !to ? '' : from.type === 'out' ? 'Der Ausgang hat keinen OUT.' : to.type === 'osc' ? 'Ein Oszillator hat keinen Eingang — er ist selbst die Quelle.' : state.edges.some(e => e.from === link.from && e.to === link.to) ? 'Dieses Kabel gibt es schon.' : 'Das würde eine Rückkopplung bilden.';
    message(`${reason} Wähle einen anderen Baustein.`);
    pending = null; markTargets();
    return false;
  }
  remember();
  state.edges.push(link); pending = null; render(); scheduleAudio(true);
  message(`${nodeName(from)} → ${nodeName(to)}. Kabel steckt.${audio ? '' : ' Starte den Ton, um es zu hören.'}`);
  return true;
}
function startPending(id, dir) {
  pending = pending && pending.id === id && pending.dir === dir ? null : {id, dir};
  markTargets();
  message(pending ? (dir === 'out' ? 'Jetzt einen anderen Baustein antippen (oder seinen IN). Escape bricht ab.' : 'Jetzt den Baustein antippen, dessen Signal hier hinein soll. Escape bricht ab.') : 'Verbinden abgebrochen.');
}
function removeEdge(index) {
  const e = state.edges[index]; if (!e) return;
  remember();
  state.edges.splice(index, 1); render(); scheduleAudio(true);
  message(`Kabel ${nodeName(getNode(e.from))} → ${nodeName(getNode(e.to))} getrennt. ↶ macht es rückgängig.`);
}
nodesEl.addEventListener('click', event => {
  if (event.target.closest('[data-port]')) return; // Ports laufen über Pointer-Events
  const quick = event.target.closest('[data-quick-wave]');
  if (quick) { setWave(getNode(quick.dataset.quickWave), quick.dataset.waveValue); return; }
  const node = event.target.closest('.node');
  if (!node) return;
  if (pending && node.dataset.id !== pending.id) { connect(linkFor(pending.id, pending.dir, node.dataset.id)); return; }
  selectNode(node.dataset.id);
});
handlesEl.addEventListener('click', event => {
  const cut = event.target.closest('[data-unlink]');
  if (cut) removeEdge(Number(cut.dataset.unlink));
});
board.addEventListener('click', event => {
  if (pending && (event.target === board || event.target === nodesEl)) { pending = null; markTargets(); message('Verbinden abgebrochen.'); }
});

/* Kabel ziehen: von OUT auf einen Baustein (oder umgekehrt von IN). Kurzes Antippen = Klick-Modus. */
function boardPoint(event) {
  const r = board.getBoundingClientRect();
  return {x: (event.clientX - r.left) / zoom, y: (event.clientY - r.top) / zoom};
}
nodesEl.addEventListener('pointerdown', event => {
  const port = event.target.closest('[data-port]');
  if (!port || event.button !== 0) return;
  event.preventDefault();
  if (pending && pending.id !== port.dataset.node) {
    connect(linkFor(pending.id, pending.dir, port.dataset.node));
    return;
  }
  wireDrag = {id: port.dataset.node, dir: port.dataset.port, startX: event.clientX, startY: event.clientY, moved: false, point: boardPoint(event), port};
  port.setPointerCapture(event.pointerId);
});
nodesEl.addEventListener('pointermove', event => {
  if (wireDrag) {
    if (!wireDrag.moved && Math.hypot(event.clientX - wireDrag.startX, event.clientY - wireDrag.startY) > 6) { wireDrag.moved = true; pending = null; markTargets(); }
    if (!wireDrag.moved) return;
    wireDrag.point = boardPoint(event);
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.node');
    nodesEl.querySelectorAll('.node.drop-hover').forEach(el => { if (el !== target) el.classList.remove('drop-hover'); });
    if (target?.classList.contains('can-drop')) target.classList.add('drop-hover');
    edgeScroll(event); drawWires();
    return;
  }
  moveDrag(event);
});
function finishWire(event) {
  if (!wireDrag) return;
  const drag = wireDrag; wireDrag = null;
  nodesEl.querySelectorAll('.drop-hover').forEach(el => el.classList.remove('drop-hover'));
  if (!drag.moved) { if (event.type === 'pointerup') startPending(drag.id, drag.dir); return; }
  const target = event.type === 'pointerup' ? document.elementFromPoint(event.clientX, event.clientY)?.closest('.node') : null;
  if (target && target.dataset.id !== drag.id) connect(linkFor(drag.id, drag.dir, target.dataset.id));
  else { message('Kabel losgelassen. Lass es auf einem Baustein fallen, um zu verbinden.'); }
  markTargets(); drawWires();
}
nodesEl.addEventListener('pointerup', event => { if (wireDrag) finishWire(event); else endDrag(); });
nodesEl.addEventListener('pointercancel', event => { if (wireDrag) finishWire(event); else endDrag(); });
/* Tastatur: Enter/Leertaste auf einem Port = Klick-Modus. */
nodesEl.addEventListener('keydown', event => {
  const port = event.target.closest('[data-port]');
  if (port && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    if (pending && pending.id !== port.dataset.node) connect(linkFor(pending.id, pending.dir, port.dataset.node));
    else startPending(port.dataset.node, port.dataset.port);
  }
});

/* ---------- Bausteine hinzufügen, einsetzen, entfernen ---------- */
function overlaps(x, y, except) {
  return state.nodes.some(n => n.id !== except && x < n.x + BOARD.nodeW + 40 && x + BOARD.nodeW + 40 > n.x && y < n.y + (heights.get(n.id) || 240) + 20 && y + 260 > n.y);
}
function freeSpot() {
  const view = {x: scrollArea.scrollLeft / zoom, y: scrollArea.scrollTop / zoom, w: scrollArea.clientWidth / zoom, h: scrollArea.clientHeight / zoom};
  const wanted = {x: clamp(view.x + view.w / 2 - BOARD.nodeW / 2, 20, BOARD.maxX), y: clamp(view.y + 40, 20, BOARD.maxY)};
  const candidates = [];
  for (let y = 20; y <= BOARD.maxY; y += 30) for (let x = 20; x <= BOARD.maxX; x += 30) if (!overlaps(x, y)) candidates.push({x, y});
  candidates.sort((a, b) => Math.hypot(a.x - wanted.x, a.y - wanted.y) - Math.hypot(b.x - wanted.x, b.y - wanted.y));
  return candidates[0] || wanted;
}
function addNode(type) {
  if (state.nodes.length >= 12) { message('Zwölf Bausteine reichen fürs kleine Labor. Entferne erst einen, um einen neuen hinzuzufügen.'); return; }
  if (type === 'osc' && state.nodes.filter(n => n.type === 'osc').length >= 4) { message('Bis zu vier Oszillatoren können zusammen spielen.'); return; }
  remember();
  const spot = freeSpot(), n = makeNode(type, spot.x, spot.y);
  state.nodes.push(n); state.selected = n.id; render();
  message(`${DEFINITIONS[type].title} hinzugefügt. Zieh ein Kabel von OUT ● zu IN ● — oder tippe rechts „In Patch einsetzen“.`);
  revealNode(n);
  nodesEl.querySelector(`[data-id="${n.id}"]`)?.classList.add('just-added');
}
function revealNode(n) {
  const h = heights.get(n.id) || 240;
  const left = n.x * zoom, top = n.y * zoom, right = (n.x + BOARD.nodeW) * zoom, bottom = (n.y + h) * zoom;
  const visible = left >= scrollArea.scrollLeft && top >= scrollArea.scrollTop && right <= scrollArea.scrollLeft + scrollArea.clientWidth && bottom <= scrollArea.scrollTop + scrollArea.clientHeight;
  if (!visible) scrollArea.scrollTo({left: Math.max(0, left - 30), top: Math.max(0, top - 30), behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
}
document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addNode(button.dataset.add)));
function autoConnect() {
  const n = getNode(state.selected), out = getOut();
  if (!n || n.type === 'out') return;
  if (state.edges.some(e => e.from === n.id || e.to === n.id)) { message('Dieser Baustein ist schon verkabelt. Zum Umbauen trenne ein Kabel mit dem × in seiner Mitte.'); return; }
  if (n.type === 'osc') { connect({from: n.id, to: out.id}); return; }
  remember();
  const last = state.edges.find(e => e.to === out.id);
  if (last) {
    state.edges = state.edges.filter(e => e !== last);
    state.edges.push({from: last.from, to: n.id}, {from: n.id, to: out.id});
  } else {
    const osc = state.nodes.find(x => x.type === 'osc');
    if (osc) state.edges.push({from: osc.id, to: n.id});
    state.edges.push({from: n.id, to: out.id});
  }
  pending = null; render(); scheduleAudio(true); message('Eingesetzt. Dein neuer Baustein liegt jetzt direkt vor dem Ausgang.');
}
function removeNode(id = state.selected) {
  const n = getNode(id); if (!n || n.type === 'out') { if (n) message('Den Ausgang brauchst du — er bleibt.'); return; }
  remember();
  state.nodes = state.nodes.filter(x => x.id !== n.id); state.edges = state.edges.filter(e => e.from !== n.id && e.to !== n.id);
  if (pending?.id === n.id) pending = null;
  state.selected = getOut().id; render(); scheduleAudio(true);
  message(`${nodeName(n)} entfernt. ↶ holt ihn zurück.`);
}
$('inspector').addEventListener('click', event => {
  if (event.target.closest('#auto-connect')) autoConnect();
  if (event.target.closest('#remove-node')) removeNode();
  const unlink = event.target.closest('[data-unlink]');
  if (unlink) removeEdge(Number(unlink.dataset.unlink));
});

/* Aufräumen: Spalten nach Signalfluss (Quelle links, Ausgang rechts). */
function flowDepths() {
  const depth = new Map();
  const visit = (id, seen = new Set()) => {
    if (depth.has(id)) return depth.get(id);
    if (seen.has(id)) return 0;
    seen.add(id);
    const ins = state.edges.filter(e => e.to === id);
    const d = ins.length ? Math.max(...ins.map(e => visit(e.from, seen) + 1)) : 0;
    depth.set(id, d); return d;
  };
  state.nodes.forEach(n => visit(n.id));
  return depth;
}
function layoutByFlow() {
  const depth = flowDepths();
  const out = getOut(), maxDepth = Math.max(0, ...state.nodes.filter(n => n !== out).map(n => depth.get(n.id)));
  depth.set(out.id, Math.max(depth.get(out.id), maxDepth + (state.nodes.some(n => n !== out && depth.get(n.id) === maxDepth) ? 1 : 0)));
  const columns = new Map();
  state.nodes.forEach(n => { const d = depth.get(n.id); if (!columns.has(d)) columns.set(d, []); columns.get(d).push(n); });
  const colWidth = (BOARD.maxX - 20) / Math.max(1, Math.max(...columns.keys()));
  for (const [d, list] of columns) {
    const step = Math.min(280, (BOARD.maxY - 20) / Math.max(1, list.length - 1));
    list.forEach((n, i) => {
      n.x = Math.round(20 + d * Math.min(300, colWidth));
      n.y = Math.round(list.length === 1 ? 140 : 20 + i * step);
    });
  }
}
function tidy() {
  remember();
  layoutByFlow();
  render(); fitView(); message('Aufgeräumt: Quellen links, Ausgang rechts. ↶ stellt die alte Anordnung wieder her.');
}

/* ---------- Werte ändern ---------- */
let playHintShown = false;
function updateParam(node, key, value, source) {
  rememberGesture(`${node.id}-${key}`);
  node.p[key] = value;
  const d = DEFINITIONS[node.type], spec = d.params[key];
  document.querySelectorAll(`input[data-node="${node.id}"][data-param="${key}"]`).forEach(input => {
    if (input !== source) input.value = sliderPosition(value, spec);
    input.setAttribute('aria-valuetext', `${number(value)} ${spec.unit}`);
  });
  document.querySelectorAll(`[data-read="${node.id}-${key}"]`).forEach(el => { el.value = `${number(value)} ${spec.unit}`; });
  const summary = nodesEl.querySelector(`[data-summary="${node.id}"]`), result = nodesEl.querySelector(`[data-result="${node.id}"]`);
  if (summary) summary.textContent = d.detail(node.p);
  if (result) result.textContent = nodeResult(node);
  document.querySelectorAll(`[data-chain-result="${node.id}"]`).forEach(el => { el.textContent = chainResult(node); });
  if (node.id === state.selected && $('model-result')) $('model-result').textContent = d.result(node.p);
  if (!audio && !playHintShown) { playHintShown = true; message('Tipp: Drück oben auf ▶︎ Ton starten — dann hörst du jede Änderung sofort.'); }
  document.querySelectorAll(`[data-exact="${node.id}"][data-key="${key}"]`).forEach(input => { if (input !== source) input.value = value; });
  if (node.type === 'out') $('master').value = value;
  save(); liveUpdate(node, key) || scheduleAudio();
}
function setWave(node, wave) {
  if (!node || !Object.hasOwn(waveNames, wave) || node.p.wave === wave) return;
  remember();
  node.p.wave = wave;
  document.querySelectorAll(`[data-quick-wave="${node.id}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.waveValue === wave)));
  const select = document.querySelector(`[data-wave="${node.id}"]`); if (select) select.value = wave;
  const summary = nodesEl.querySelector(`[data-summary="${node.id}"]`);
  if (summary) summary.textContent = DEFINITIONS.osc.detail(node.p);
  save(); liveUpdate(node, 'wave') || scheduleAudio();
  message(`${nodeName(node)}: ${waveNames[wave]}.${wave === 'sine' ? ' Ein Sinus hat keine Obertöne — Filter wirken hier kaum hörbar.' : ''}`);
}
document.addEventListener('input', event => {
  const input = event.target;
  if (input.matches('input[data-exact]')) {
    const node = getNode(input.dataset.exact), spec = DEFINITIONS[node.type].params[input.dataset.key], numeric = input.valueAsNumber;
    if (Number.isFinite(numeric) && numeric >= spec.min && numeric <= spec.max) updateParam(node, input.dataset.key, numeric, input);
  } else if (input.matches('input[data-param]')) {
    const node = getNode(input.dataset.node), spec = DEFINITIONS[node.type].params[input.dataset.param];
    if (node) updateParam(node, input.dataset.param, sliderValue(Number(input.value), spec), input);
  } else if (input.id === 'master') updateParam(getOut(), 'volume', Number(input.value), input);
});
document.addEventListener('change', event => {
  if (event.target.matches('[data-exact]')) {
    const input = event.target, node = getNode(input.dataset.exact), spec = DEFINITIONS[node.type].params[input.dataset.key];
    const numeric = input.valueAsNumber;
    if (!Number.isFinite(numeric)) { input.value = node.p[input.dataset.key]; return; }
    const bounded = clamp(numeric, spec.min, spec.max); input.value = bounded; updateParam(node, input.dataset.key, bounded, input);
    if (bounded !== numeric) message(`${spec.label} geht von ${number(spec.min)} bis ${number(spec.max)} ${spec.unit}.`);
  }
  if (event.target.matches('[data-wave]')) setWave(getNode(event.target.dataset.wave), event.target.value);
});

/* ---------- Bausteine verschieben ---------- */
let dragging = null;
nodesEl.addEventListener('pointerdown', event => {
  const handle = event.target.closest('[data-grab]'); if (!handle || event.button !== 0) return;
  const node = getNode(handle.dataset.grab);
  if (pending && pending.id !== node.id) return; // Klick verbindet (siehe click-Handler)
  selectNode(node.id);
  dragging = {node, el: handle.closest('.node'), startX: event.clientX, startY: event.clientY, x: node.x, y: node.y, moved: false, scrollX: scrollArea.scrollLeft, scrollY: scrollArea.scrollTop};
  handle.setPointerCapture(event.pointerId); dragging.el.classList.add('is-dragging');
});
function moveDrag(event) {
  if (!dragging) return;
  const d = dragging;
  const dx = (event.clientX - d.startX + scrollArea.scrollLeft - d.scrollX) / zoom, dy = (event.clientY - d.startY + scrollArea.scrollTop - d.scrollY) / zoom;
  if (!d.moved && Math.hypot(dx, dy) < 3) return;
  if (!d.moved) { d.moved = true; remember(); }
  d.node.x = Math.round(clamp(d.x + dx, 20, BOARD.maxX)); d.node.y = Math.round(clamp(d.y + dy, 20, BOARD.maxY));
  d.el.style.left = d.node.x + 'px'; d.el.style.top = d.node.y + 'px';
  edgeScroll(event); drawWires();
}
function endDrag() {
  if (!dragging) return;
  dragging.el.classList.remove('is-dragging'); dragging = null; save();
}
nodesEl.addEventListener('lostpointercapture', () => { if (!wireDrag) endDrag(); });
/* Am Rand der Fläche mitscrollen, damit man Bausteine weiter weg ziehen kann. */
function edgeScroll(event) {
  const r = scrollArea.getBoundingClientRect(), zone = 36, speed = 14;
  if (event.clientX > r.right - zone) scrollArea.scrollLeft += speed;
  else if (event.clientX < r.left + zone) scrollArea.scrollLeft -= speed;
  if (event.clientY > r.bottom - zone) scrollArea.scrollTop += speed;
  else if (event.clientY < r.top + zone) scrollArea.scrollTop -= speed;
}
nodesEl.addEventListener('keydown', event => {
  const handle = event.target.closest('[data-grab]'); if (!handle) return;
  const dirs = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
  if (dirs[event.key]) {
    event.preventDefault();
    const n = getNode(handle.dataset.grab), [x, y] = dirs[event.key], step = event.shiftKey ? 40 : 10;
    rememberGesture(`move-${n.id}`);
    n.x = clamp(n.x + x * step, 20, BOARD.maxX); n.y = clamp(n.y + y * step, 20, BOARD.maxY);
    const el = handle.closest('.node'); el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; drawWires(); save();
  }
});

/* ---------- Zoom ---------- */
function setZoom(value, anchor) {
  const old = zoom;
  zoom = clamp(Math.round(value * 100) / 100, .4, 1.25);
  const ax = anchor ? anchor.x : (scrollArea.scrollLeft + scrollArea.clientWidth / 2) / old;
  const ay = anchor ? anchor.y : (scrollArea.scrollTop + scrollArea.clientHeight / 2) / old;
  board.style.transform = `scale(${zoom})`;
  sizer.style.width = BOARD.w * zoom + 'px'; sizer.style.height = BOARD.h * zoom + 'px';
  $('zoom-value').textContent = `${Math.round(zoom * 100)} %`;
  if (!anchor) scrollArea.scrollTo(ax * zoom - scrollArea.clientWidth / 2, ay * zoom - scrollArea.clientHeight / 2);
}
function fitView() {
  if (!state.nodes.length) return;
  const pad = 30;
  const minX = Math.min(...state.nodes.map(n => n.x)) - pad, minY = Math.min(...state.nodes.map(n => n.y)) - pad;
  const maxX = Math.max(...state.nodes.map(n => n.x + BOARD.nodeW)) + pad, maxY = Math.max(...state.nodes.map(n => n.y + (heights.get(n.id) || 240))) + pad;
  const z = Math.min(1, scrollArea.clientWidth / (maxX - minX), scrollArea.clientHeight / (maxY - minY));
  setZoom(z, {x: 0, y: 0});
  scrollArea.scrollTo(Math.max(0, minX * zoom - (scrollArea.clientWidth - (maxX - minX) * zoom) / 2), Math.max(0, minY * zoom));
}
$('zoom-in').addEventListener('click', () => setZoom(zoom + .1));
$('zoom-out').addEventListener('click', () => setZoom(zoom - .1));
$('zoom-fit').addEventListener('click', fitView);

/* ---------- Werkzeuge ---------- */
$('undo').addEventListener('click', undo);
$('redo').addEventListener('click', redo);
$('tidy').addEventListener('click', tidy);
$('share').addEventListener('click', async () => {
  const link = `${location.origin}${location.pathname}#patch=${LabModels.encodePatch(state.nodes, state.edges)}`;
  const touch = matchMedia('(pointer: coarse)').matches;
  try {
    if (touch && navigator.share) { await navigator.share({title: 'Mein Patch auf osci//log', text: 'Hör dir meinen Klang-Patch an:', url: link}); message('Patch geteilt.'); return; }
    await navigator.clipboard.writeText(link);
    message('Link kopiert. Wer ihn öffnet, bekommt genau diesen Patch.');
  } catch (error) {
    if (error?.name === 'AbortError') return;
    window.prompt('Link zu deinem Patch:', link);
  }
});
document.addEventListener('keydown', event => {
  const typing = event.target.closest?.('input, select, textarea, [contenteditable]');
  const inLab = event.target.closest?.('#lab');
  if (event.key === 'Escape' && (pending || wireDrag)) { pending = null; wireDrag = null; markTargets(); drawWires(); message('Verbinden abgebrochen.'); return; }
  if (typing || !inLab) return;
  const mod = event.metaKey || event.ctrlKey;
  if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
  else if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
  else if ((event.key === 'Delete' || event.key === 'Backspace') && event.target.closest('.node')) { event.preventDefault(); removeNode(event.target.closest('.node').dataset.id); }
});
const PRESETS = [
  {id: 'rc', label: 'Weicher · RC'},
  {id: 'rl', label: 'Spule · RL'},
  {id: 'pulse', label: 'Pulsieren'},
  {id: 'beat', label: 'Schwebung'}
];
function loadPreset(kind) {
  remember();
  state = starter(kind); pending = null; pickerAt = null; render(); if (view === 'frei') fitView(); scheduleAudio(true);
  $('preset').value = kind;
  message(`Starter-Patch geladen. Alle Kabel stecken schon.${audio ? '' : ' Drück ▶︎ und verändere einen Wert.'}`);
}
$('load-preset').addEventListener('click', () => loadPreset($('preset').value));

/* ---------- Klang: gerichteter, azyklischer Graph aus gepufferten Audio-Modulen ---------- */
let audio = null, starting = false, audioGeneration = 0, rebuildTimer = 0, scopeFrame = 0;
const scopes = [$('scope'), $('scope-mini')].map(canvas => ({canvas, pen: canvas.getContext('2d')})), reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
function audibleSources() {
  const out = getOut(), visited = new Set();
  function visit(id) { if (visited.has(id)) return; visited.add(id); state.edges.filter(e => e.to === id).forEach(e => visit(e.from)); }
  visit(out.id);
  return state.nodes.filter(n => n.type === 'osc' && visited.has(n.id));
}
function audioStatus() {
  if (!audio) return;
  $('audio-status').textContent = audibleSources().length ? 'Ton läuft. Verändere Werte oder probiere einen anderen Signalweg.' : 'Ton an, aber am Ausgang kommt nichts an. Verbinde eine Quelle mit dem Ausgang.';
  const outResult = nodesEl.querySelector(`[data-result="${getOut().id}"]`);
  if (outResult) outResult.textContent = nodeResult(getOut());
}
function disposeBundle(bundle, ctx) {
  if (!bundle) return;
  const now = ctx.currentTime;
  bundle.bus.gain.cancelScheduledValues(now); bundle.bus.gain.setTargetAtTime(0, now, .008);
  setTimeout(() => {
    bundle.sources.forEach(source => { try { source.stop(); } catch { /* schon gestoppt */ } });
    bundle.nodes.forEach(node => { try { node.disconnect(); } catch { /* schon getrennt */ } });
  }, 90);
}
function buildAudio() {
  if (!audio) return;
  const engine = audio, ctx = engine.ctx, bundle = {bus: ctx.createGain(), sources: [], nodes: [], live: new Map()};
  const lookup = new Map();
  bundle.bus.gain.value = 0; bundle.bus.connect(engine.master); bundle.nodes.push(bundle.bus);
  try {
    for (const n of state.nodes) {
      let input, output;
      const p = n.p;
      if (n.type === 'osc') {
        const osc = ctx.createOscillator(); osc.type = p.wave; osc.frequency.value = p.frequency;
        const gain = ctx.createGain(); gain.gain.value = .5; osc.connect(gain);
        bundle.sources.push(osc); bundle.nodes.push(osc, gain); output = gain;
        bundle.live.set(n.id, {osc});
      } else if (n.type === 'resistor') {
        input = output = ctx.createGain(); input.gain.value = LabModels.divider(p.r * 1000, 10000); bundle.nodes.push(input);
        bundle.live.set(n.id, {gain: input});
      } else if (n.type === 'capacitor' || n.type === 'inductor') {
        const cutoff = n.type === 'capacitor' ? LabModels.rcCutoff(p.r * 1000, p.c * 1e-9) : LabModels.rlCutoff(p.r, p.l / 1000);
        const coeffs = LabModels.lowpass(cutoff, ctx.sampleRate);
        input = output = ctx.createIIRFilter(coeffs.feedforward, coeffs.feedback); bundle.nodes.push(input);
      } else if (n.type === 'tremolo') {
        input = output = ctx.createGain(); const depth = p.depth / 100;
        input.gain.value = 1 - depth / 2;
        const lfo = ctx.createOscillator(), amount = ctx.createGain(); lfo.frequency.value = p.rate; amount.gain.value = depth / 2;
        lfo.connect(amount); amount.connect(input.gain); bundle.sources.push(lfo); bundle.nodes.push(input, lfo, amount);
        bundle.live.set(n.id, {gain: input, lfo, amount});
      } else { input = output = ctx.createGain(); output.connect(bundle.bus); bundle.nodes.push(input); }
      lookup.set(n.id, {input, output});
    }
    for (const e of state.edges) lookup.get(e.from).output.connect(lookup.get(e.to).input);
    bundle.sources.forEach(source => source.start());
    bundle.bus.gain.setTargetAtTime(1 / Math.sqrt(Math.max(1, audibleSources().length)), ctx.currentTime, .012);
    engine.master.gain.setTargetAtTime(getOut().p.volume / 100, ctx.currentTime, .012);
    const old = engine.current; engine.current = bundle; disposeBundle(old, ctx); audioStatus();
  } catch {
    disposeBundle(bundle, ctx); message('Der Patch konnte nicht aktualisiert werden. Lade einen Starter-Patch.');
  }
}
/* Werte, die sich ohne Neuaufbau ändern lassen, gleiten direkt (kein Knacksen beim Regler ziehen). */
function liveUpdate(n, key) {
  if (!audio?.current) return !audio;
  const ctx = audio.ctx, now = ctx.currentTime, live = audio.current.live.get(n.id), p = n.p;
  if (n.type === 'out') { audio.master.gain.setTargetAtTime(p.volume / 100, now, .02); return true; }
  if (!live) return false;
  if (n.type === 'osc' && key === 'frequency') { live.osc.frequency.setTargetAtTime(p.frequency, now, .015); return true; }
  if (n.type === 'osc' && key === 'wave') { live.osc.type = p.wave; return true; }
  if (n.type === 'resistor') { live.gain.gain.setTargetAtTime(LabModels.divider(p.r * 1000, 10000), now, .015); return true; }
  if (n.type === 'tremolo') {
    const depth = p.depth / 100;
    live.lfo.frequency.setTargetAtTime(p.rate, now, .02);
    live.amount.gain.setTargetAtTime(depth / 2, now, .02);
    live.gain.gain.setTargetAtTime(1 - depth / 2, now, .02);
    return true;
  }
  return false;
}
function scheduleAudio(immediate = false) {
  clearTimeout(rebuildTimer);
  if (audio) rebuildTimer = setTimeout(buildAudio, immediate ? 0 : 70);
  else audioStatus();
}
async function startAudio() {
  if (starting) return;
  if (!audibleSources().length) { message('Es fehlt noch ein Signalweg. Zieh ein Kabel von OUT am Oszillator zu IN am Ausgang — direkt oder über andere Bausteine.'); return; }
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) { $('audio-status').textContent = 'Web Audio wird von diesem Browser leider nicht unterstützt.'; return; }
  /* iPhone: ohne "playback" bleibt Web Audio im Lautlos-Modus stumm. */
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* ältere Browser */ }
  starting = true; const generation = ++audioGeneration; $('audio-toggle').disabled = true;
  let ctx;
  try {
    ctx = new Context(); await ctx.resume();
    if (generation !== audioGeneration || document.hidden) { await ctx.close(); return; }
    const master = ctx.createGain(), limiter = ctx.createDynamicsCompressor(), analyser = ctx.createAnalyser();
    master.gain.value = 0; limiter.threshold.value = -12; limiter.knee.value = 12; limiter.ratio.value = 12;
    analyser.fftSize = 2048; master.connect(limiter); limiter.connect(analyser); analyser.connect(ctx.destination);
    audio = {ctx, master, limiter, analyser, samples: new Uint8Array(analyser.fftSize), current: null};
    buildAudio(); $('audio-toggle').textContent = '■ Ton stoppen'; $('audio-toggle').setAttribute('aria-pressed', 'true');
    document.querySelector('.sound-computer').classList.add('is-playing');
    if (matchMedia('(pointer: coarse)').matches) message('Kein Ton? Prüfe Lautstärke und den Lautlos-Schalter deines Handys.');
    drawScopeLoop();
  } catch {
    if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
    audio = null;
    $('audio-status').textContent = 'Ton konnte nicht starten. Bitte versuche es erneut.';
  } finally { starting = false; $('audio-toggle').disabled = false; }
}
function stopAudio(text = 'Ton ist aus.') {
  audioGeneration++; clearTimeout(rebuildTimer); cancelAnimationFrame(scopeFrame);
  const old = audio; audio = null;
  if (old) {
    old.master.gain.cancelScheduledValues(old.ctx.currentTime); old.master.gain.setTargetAtTime(0, old.ctx.currentTime, .008);
    setTimeout(() => old.ctx.close().catch(() => {}), 90);
  }
  $('audio-toggle').textContent = '▶︎ Ton starten'; $('audio-toggle').setAttribute('aria-pressed', 'false'); $('audio-status').textContent = text;
  document.querySelector('.sound-computer').classList.remove('is-playing');
  drawScope();
}
$('audio-toggle').addEventListener('click', () => audio ? stopAudio() : startAudio());

/* Oszilloskop mit Trigger auf steigende Nulldurchgänge, damit das Bild stillsteht.
   Zeichnet ins große Oszilloskop unten und ins kleine in der Play-Leiste (nur sichtbare Flächen). */
function drawScope() {
  let s = null, start = 0;
  if (audio) {
    s = audio.samples;
    audio.analyser.getByteTimeDomainData(s);
    for (let i = 1; i < s.length / 2; i++) if (s[i - 1] < 128 && s[i] >= 128) { start = i; break; }
  }
  for (const {canvas, pen} of scopes) {
    const ratio = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (!pen || !w || !h) continue;
    if (canvas.width !== Math.round(w * ratio) || canvas.height !== Math.round(h * ratio)) { canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio); }
    pen.setTransform(ratio, 0, 0, ratio, 0, 0); pen.clearRect(0, 0, w, h); pen.lineWidth = 1; pen.strokeStyle = '#dadad1'; pen.beginPath();
    for (let x = 0; x < w; x += 25) { pen.moveTo(x, 0); pen.lineTo(x, h); }
    pen.moveTo(0, h / 2); pen.lineTo(w, h / 2); pen.stroke();
    pen.strokeStyle = '#22221e'; pen.lineWidth = 1.6; pen.beginPath();
    if (s) {
      const span = s.length / 2;
      for (let i = 0; i < span; i++) { const x = i / (span - 1) * w, y = h / 2 - (s[start + i] - 128) / 128 * h * .45; if (i) pen.lineTo(x, y); else pen.moveTo(x, y); }
    } else { pen.moveTo(0, h / 2); pen.lineTo(w, h / 2); }
    pen.stroke();
  }
}
function drawScopeLoop() { drawScope(); if (audio && !reducedMotion.matches) scopeFrame = requestAnimationFrame(drawScopeLoop); }
reducedMotion.addEventListener('change', () => { cancelAnimationFrame(scopeFrame); drawScopeLoop(); });
window.addEventListener('resize', () => { drawScope(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && audio) stopAudio('Ton gestoppt, weil du den Tab verlassen hast. Dein Patch bleibt erhalten.'); });
window.addEventListener('pagehide', () => { save(); if (audio) stopAudio(); });

/* ---------- Eine Wiederholungsfrage pro Besuch ---------- */
const LESSONS = [
  {question: 'Du verdoppelst C im RC-Tiefpass. Was passiert mit der Grenzfrequenz?', answers: ['Sie halbiert sich.', 'Sie verdoppelt sich.', 'Sie bleibt gleich.'], correct: 0, why: 'fᶜ = 1 / (2πRC). C steht im Nenner. Bei gleichem R bedeutet doppeltes C die halbe Grenzfrequenz — und weniger Höhen im Klang.'},
  {question: 'Welche Größe wird in Henry gemessen?', answers: ['Kapazität', 'Induktivität', 'Widerstand'], correct: 1, why: 'Henry [H] ist die Einheit der Induktivität L. Eine Spule speichert Energie im magnetischen Feld. Kapazität misst du in Farad, Widerstand in Ohm.'},
  {question: '220 Hz werden zu 440 Hz. Was hörst du?', answers: ['Eine Oktave höher.', 'Doppelte Lautstärke.', 'Eine Oktave tiefer.'], correct: 0, why: 'Die Frequenz verdoppelt sich. Das entspricht einer Oktave nach oben. Die Lautstärke wird durch diese Frequenzänderung nicht festgelegt.'},
  {question: 'Zwei gleiche Widerstände teilen eine Spannung. Wie groß ist Uaus über dem unteren Widerstand, ohne weitere Last?', answers: ['Uein', 'Ein Viertel von Uein', 'Die Hälfte von Uein'], correct: 2, why: 'Uaus = Uein · R₂ / (R₁ + R₂). Bei R₁ = R₂ ergibt das 1/2. Im Widerstandsmodul ist R₂ der feste Lastwiderstand von 10 kΩ.'},
  {question: 'Was bleibt beim Tremolo an der Quelle gleich?', answers: ['Ihre Lautstärke.', 'Ihre Tonhöhe.', 'Beides.'], correct: 1, why: 'Beim Tremolo verändert ein langsamer Oszillator die Lautstärke. Die eingestellte Frequenz der Tonquelle bleibt gleich. Eine veränderliche Tonhöhe wäre Vibrato.'},
  {question: 'Du verdoppelst L im RL-Tiefpass. R bleibt gleich. Was passiert mit fᶜ?', answers: ['Sie verdoppelt sich.', 'Sie bleibt gleich.', 'Sie halbiert sich.'], correct: 2, why: 'Beim RL-Tiefpass mit Ausgang über R gilt fᶜ = R / (2πL). Größeres L senkt die Grenzfrequenz. Größeres R hebt sie hier an.'},
  {question: 'Zwei Sinustöne mit 220 Hz und 223 Hz klingen zusammen. Was hörst du?', answers: ['Einen Ton mit 443 Hz.', 'Ein Pulsieren, dreimal pro Sekunde.', 'Zwei klar getrennte Töne.'], correct: 1, why: 'Liegen zwei Frequenzen dicht beieinander, verstärken und schwächen sie sich abwechselnd: eine Schwebung mit |f₁ − f₂| = 3 Hz. Probier es mit dem Starter-Patch „Schwebung“.'}
];
let lessonIndex = 0;
try {
  const savedLesson = Number(localStorage.getItem('osci-log-lesson'));
  lessonIndex = Number.isSafeInteger(savedLesson) && savedLesson >= 0 ? savedLesson % LESSONS.length : 0;
  localStorage.setItem('osci-log-lesson', String(lessonIndex + 1));
} catch { /* ohne Speicher immer Frage 1 */ }
function renderLesson() {
  const lesson = LESSONS[lessonIndex];
  $('lesson').innerHTML = `<span class="eyebrow">${String(lessonIndex + 1).padStart(2, '0')} / ${LESSONS.length} · Grundlagen</span><h4>${lesson.question}</h4><div class="answers">${lesson.answers.map((answer, i) => `<button type="button" data-answer="${i}">${answer}</button>`).join('')}</div><p id="lesson-feedback">Deine Vermutung?</p><button type="button" class="next-lesson" id="next-lesson">Nächste Frage ↗︎</button>`;
}
$('lesson').addEventListener('click', event => {
  const answer = event.target.closest('[data-answer]');
  if (answer) {
    const lesson = LESSONS[lessonIndex], correct = Number(answer.dataset.answer) === lesson.correct;
    $('lesson').querySelectorAll('[data-answer]').forEach(button => {
      const i = Number(button.dataset.answer);
      button.classList.toggle('right', i === lesson.correct && (correct || button !== answer));
      button.classList.toggle('wrong', button === answer && !correct);
    });
    $('lesson-feedback').textContent = (correct ? 'Genau. ' : 'Nicht ganz — die richtige Antwort ist markiert. ') + lesson.why;
  }
  if (event.target.closest('#next-lesson')) {
    lessonIndex = (lessonIndex + 1) % LESSONS.length; renderLesson();
    try { localStorage.setItem('osci-log-lesson', String(lessonIndex + 1)); } catch { /* egal */ }
  }
});

/* ---------- Einfache Ansicht: die Signalkette ----------
   Für Handy und Einsteiger: Quellen oben, Bausteine darunter, Ausgang unten — das Signal fließt von oben nach unten.
   Intern bleibt es derselbe Patch (Bausteine + Kabel); die Kette baut die Kabel nur automatisch. */
const VIEW_KEY = 'osci-log-ansicht';
let view = (() => {
  try { const v = localStorage.getItem(VIEW_KEY); if (v === 'kette' || v === 'frei') return v; } catch { /* ohne Speicher */ }
  return matchMedia('(max-width: 760px), (pointer: coarse)').matches ? 'kette' : 'frei';
})();
let pickerAt = null; // an welcher Stelle der Baustein-Auswahl gerade offen ist
const EFFECT_TYPES = ['resistor', 'capacitor', 'inductor', 'tremolo'];
const STEP_HINTS = {
  'osc.frequency': ['Halbe Frequenz: eine Oktave tiefer.', 'Doppelte Frequenz: eine Oktave höher.'],
  'capacitor.c': ['Halbes C → doppelte Grenzfrequenz: heller.', 'Doppeltes C → halbe Grenzfrequenz: dumpfer.'],
  'capacitor.r': ['Halbes R → doppelte Grenzfrequenz: heller.', 'Doppeltes R → halbe Grenzfrequenz: dumpfer.'],
  'inductor.l': ['Halbes L → doppelte Grenzfrequenz: heller.', 'Doppeltes L → halbe Grenzfrequenz: dumpfer.'],
  'inductor.r': ['Halbes R → halbe Grenzfrequenz (beim RL-Glied!): dumpfer.', 'Doppeltes R → doppelte Grenzfrequenz (beim RL-Glied!): heller.'],
  'resistor.r': ['Kleineres R → mehr Spannung an der Last: lauter.', 'Größeres R → weniger Spannung an der Last: leiser.'],
  'tremolo.rate': ['Halbes Tempo: langsameres Pulsieren.', 'Doppeltes Tempo: schnelleres Pulsieren.']
};
const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'H'];
function noteName(f) {
  const midi = Math.round(12 * Math.log2(f / 440) + 69);
  return `${NOTE_NAMES[(midi % 12 + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
function chainResult(n) {
  if (n.type === 'osc') return `${number(n.p.frequency)} Hz ≈ Ton ${noteName(n.p.frequency)} · eine Schwingung dauert ${number(1000 / n.p.frequency)} ms`;
  if (n.type === 'out') return audibleSources().length ? 'Hier kommt dein Signal an.' : 'Noch still — es fehlt eine Klangquelle.';
  return DEFINITIONS[n.type].result(n.p);
}
function chainEdges(sources, effects, out) {
  const first = effects[0] || out, edges = sources.map(src => ({from: src.id, to: first.id}));
  effects.forEach((n, i) => edges.push({from: n.id, to: (effects[i + 1] || out).id}));
  return edges;
}
/* Ist der Patch eine einfache Kette? Dann lässt er sich als Liste zeigen. */
function chainModel() {
  const out = getOut(), sources = state.nodes.filter(n => n.type === 'osc'), effects = [];
  for (let cur = out; ;) {
    const ins = state.edges.filter(e => e.to === cur.id).map(e => getNode(e.from)).filter(n => n.type !== 'osc');
    if (ins.length !== 1 || effects.includes(ins[0])) break;
    effects.unshift(ins[0]); cur = ins[0];
  }
  const expected = chainEdges(sources, effects, out);
  const same = expected.length === state.edges.length && expected.every(c => state.edges.some(e => e.from === c.from && e.to === c.to));
  return {sources, effects, out, ok: same && effects.length === state.nodes.length - sources.length - 1};
}
function applyChain(sources, effects) {
  state.edges = chainEdges(sources, effects, getOut());
  layoutByFlow(); // damit das freie Pult danach ordentlich aussieht
}
function chainInsert(index, type) {
  if (state.nodes.length >= 12) { message('Zwölf Bausteine reichen fürs kleine Labor. Entferne erst einen.'); return; }
  const m = chainModel();
  remember();
  const n = makeNode(type, 20, 20);
  state.nodes.push(n); m.effects.splice(index, 0, n);
  applyChain(m.sources, m.effects);
  state.selected = n.id; pickerAt = null; render(); scheduleAudio(true);
  message(`${DEFINITIONS[type].title} eingesetzt. ${DEFINITIONS[type].nudge}`);
  requestAnimationFrame(() => document.querySelector(`[data-chain-id="${n.id}"]`)?.scrollIntoView({block: 'center', behavior: reducedMotion.matches ? 'instant' : 'smooth'}));
}
function chainAddSource() {
  const m = chainModel();
  if (m.sources.length >= 4) { message('Bis zu vier Töne können zusammen spielen.'); return; }
  remember();
  const n = makeNode('osc', 20, 20);
  const base = m.sources[0]?.p.frequency || 220;
  n.p.frequency = Number((m.sources.length ? base * [1.5, 1.25, 2][m.sources.length - 1] : 220).toPrecision(4)); // Quinte, Terz, Oktave
  n.p.wave = 'sine';
  state.nodes.push(n); m.sources.push(n);
  applyChain(m.sources, m.effects);
  state.selected = n.id; render(); scheduleAudio(true);
  message(m.sources.length > 1 ? 'Zweiter Ton dazu — beide werden gemischt. Stell die Frequenzen fast gleich ein, dann hörst du eine Schwebung.' : 'Klangquelle hinzugefügt.');
}
function chainRemove(id) {
  const n = getNode(id); if (!n || n.type === 'out') return;
  const m = chainModel();
  remember();
  state.nodes = state.nodes.filter(x => x.id !== id);
  applyChain(m.sources.filter(x => x.id !== id), m.effects.filter(x => x.id !== id));
  state.selected = getOut().id; render(); scheduleAudio(true);
  message(`${DEFINITIONS[n.type].title} entfernt. ↶ holt ihn zurück.`);
}
function chainLinearize() {
  remember();
  const depth = flowDepths();
  const effects = state.nodes.filter(n => n.type !== 'osc' && n.type !== 'out').sort((a, b) => depth.get(a.id) - depth.get(b.id) || a.x - b.x);
  applyChain(state.nodes.filter(n => n.type === 'osc'), effects);
  render(); scheduleAudio(true);
  message('Als Kette geordnet. ↶ stellt die alten Verbindungen wieder her.');
}
function stepParam(node, key, dir) {
  const spec = DEFINITIONS[node.type].params[key];
  const v = node.p[key];
  const next = clamp(Number((spec.log ? v * 2 ** dir : v + dir * (spec.max - spec.min) / 10).toPrecision(4)), spec.min, spec.max);
  if (next === v) { message(`${spec.label} ist schon am ${dir > 0 ? 'Maximum' : 'Minimum'} (${number(v)} ${spec.unit}).`); return; }
  updateParam(node, key, next, null);
  const hint = STEP_HINTS[`${node.type}.${key}`];
  if (hint) message(hint[dir > 0 ? 1 : 0]);
}
function bigControl(n, key) {
  const spec = DEFINITIONS[n.type].params[key], id = `big-${n.id}-${key}`;
  const less = spec.log ? '÷2' : '−', more = spec.log ? '×2' : '+';
  return `<div class="big-control"><label class="big-label" for="${id}"><span>${spec.label}</span><output data-read="${n.id}-${key}">${number(n.p[key])} ${spec.unit}</output></label><div class="big-row"><button type="button" class="big-step" data-step="${n.id}" data-key="${key}" data-dir="-1" aria-label="${spec.label} ${spec.log ? 'halbieren' : 'verringern'}">${less}</button><input id="${id}" type="range" min="0" max="100" step="0.1" value="${sliderPosition(n.p[key], spec)}" data-node="${n.id}" data-param="${key}" aria-valuetext="${number(n.p[key])} ${spec.unit}"><button type="button" class="big-step" data-step="${n.id}" data-key="${key}" data-dir="1" aria-label="${spec.label} ${spec.log ? 'verdoppeln' : 'erhöhen'}">${more}</button></div></div>`;
}
function chainCard(n) {
  const d = DEFINITIONS[n.type];
  const waves = n.type === 'osc' ? `<div class="big-waves" role="group" aria-label="Wellenform">${Object.entries(waveNames).map(([v, t]) => `<button type="button" data-quick-wave="${n.id}" data-wave-value="${v}" aria-pressed="${n.p.wave === v}"><b>${waveIcons[v]}</b>${t}</button>`).join('')}</div>` : '';
  const remove = n.type !== 'out' ? `<button type="button" class="chain-remove" data-chain-remove="${n.id}" aria-label="${nodeName(n)} entfernen">×</button>` : '';
  return `<article class="chain-card chain-${n.type}" data-chain-id="${n.id}"><header class="chain-head"><span class="chain-sym" aria-hidden="true">${d.symbol}</span><div class="chain-title"><h3>${d.title}</h3><span>${d.kind}</span></div>${remove}</header><p class="chain-result" data-chain-result="${n.id}">${chainResult(n)}</p>${waves}${Object.keys(d.params).map(k => bigControl(n, k)).join('')}<details class="chain-info"><summary>Was passiert hier?</summary><p>${d.text}</p><div class="formula">${d.formula}</div><p><strong>Probier:</strong> ${d.nudge}</p></details></article>`;
}
function chainLink(index) {
  const open = pickerAt === index;
  const options = EFFECT_TYPES.map(t => `<button type="button" data-insert-type="${t}" data-insert-at="${index}"><b>${DEFINITIONS[t].symbol}</b>${DEFINITIONS[t].title}<small>${DEFINITIONS[t].kind}</small></button>`).join('');
  return `<div class="chain-link${open ? ' open' : ''}"><button type="button" class="chain-add" data-picker="${index}" aria-expanded="${open}">${open ? '× Abbrechen' : '+ Baustein einfügen'}</button>${open ? `<div class="chain-picker">${options}</div>` : ''}</div>`;
}
function renderChain() {
  const el = $('chain');
  if (view !== 'kette') return;
  const m = chainModel();
  const presets = `<div class="chain-presets" aria-label="Starter-Patches"><span class="eyebrow">Starter</span>${PRESETS.map(p => `<button type="button" class="tag" data-preset="${p.id}">${p.label}</button>`).join('')}</div>`;
  if (!m.ok) {
    el.innerHTML = `${presets}<div class="chain-warn"><b>Dieser Patch hat Abzweigungen.</b><p>Er wurde im freien Pult gebaut und lässt sich nicht als einfache Kette zeigen.</p><div><button type="button" class="button small" id="chain-linearize">Als Kette ordnen</button><button type="button" class="button small" data-view-switch="frei">Im freien Pult öffnen</button></div></div>`;
    return;
  }
  let html = `${presets}<p class="chain-intro">Das Signal fließt von oben nach unten. Zieh an den Reglern oder tippe <b>÷2</b> / <b>×2</b>.</p>`;
  html += `<section class="chain-sources${m.sources.length > 1 ? ' multi' : ''}" aria-label="Klangquellen">${m.sources.length > 1 ? '<span class="eyebrow chain-group-label">Klangquellen · werden gemischt</span>' : ''}${m.sources.map(chainCard).join('')}${m.sources.length < 4 ? `<button type="button" class="chain-ghost" id="chain-add-source">${m.sources.length ? '+ Weiterer Ton' : '+ Klangquelle hinzufügen'}</button>` : ''}</section>`;
  html += chainLink(0);
  m.effects.forEach((n, i) => { html += chainCard(n) + chainLink(i + 1); });
  html += chainCard(m.out);
  el.innerHTML = html;
}
function setView(next, persist = true) {
  view = next;
  if (persist) { try { localStorage.setItem(VIEW_KEY, view); } catch { /* egal */ } }
  document.querySelector('.sound-computer').dataset.view = view;
  document.querySelectorAll('[data-view-switch]').forEach(b => { if (b.closest('.view-switch')) b.setAttribute('aria-pressed', String(b.dataset.viewSwitch === view)); });
  pending = null; pickerAt = null;
  if (view === 'kette') renderChain();
  else { renderNodes(); fitView(); }
}
$('lab').addEventListener('click', event => {
  const t = event.target;
  const sw = t.closest('[data-view-switch]');
  if (sw) { setView(sw.dataset.viewSwitch); if (sw.dataset.viewSwitch === 'frei' && !sw.closest('.view-switch')) message('Freies Pult: Zieh Kabel von OUT ● auf einen Baustein.'); return; }
  const chain = t.closest('#chain');
  if (!chain) return;
  const preset = t.closest('[data-preset]');
  if (preset) { loadPreset(preset.dataset.preset); return; }
  const wave = t.closest('[data-quick-wave]');
  if (wave) { setWave(getNode(wave.dataset.quickWave), wave.dataset.waveValue); return; }
  const step = t.closest('[data-step]');
  if (step) { stepParam(getNode(step.dataset.step), step.dataset.key, Number(step.dataset.dir)); return; }
  const remove = t.closest('[data-chain-remove]');
  if (remove) { chainRemove(remove.dataset.chainRemove); return; }
  const type = t.closest('[data-insert-type]');
  if (type) { chainInsert(Number(type.dataset.insertAt), type.dataset.insertType); return; }
  const picker = t.closest('[data-picker]');
  if (picker) { const i = Number(picker.dataset.picker); pickerAt = pickerAt === i ? null : i; renderChain(); return; }
  if (t.closest('#chain-add-source')) { chainAddSource(); return; }
  if (t.closest('#chain-linearize')) { chainLinearize(); return; }
  const card = t.closest('[data-chain-id]');
  if (card && state.selected !== card.dataset.chainId) { state.selected = card.dataset.chainId; renderInspector(); save(); }
});

/* ---------- Start ---------- */
setView(view, false);
render(); renderLesson(); updateHistoryButtons();
if (view === 'frei') { if (scrollArea.clientWidth < 760) fitView(); else setZoom(1, {x: 0, y: 0}); }
drawScope();
if (shared) {
  if (saved) history.past.push(JSON.stringify(saved));
  updateHistoryButtons();
  window.history.replaceState(null, '', location.pathname + location.search + '#labor');
  message(saved ? 'Geteilter Patch geladen. ↶ bringt deinen eigenen Patch zurück.' : 'Geteilter Patch geladen. Drück ▶︎ und hör rein.');
  requestAnimationFrame(() => $('labor').scrollIntoView());
}
})();
