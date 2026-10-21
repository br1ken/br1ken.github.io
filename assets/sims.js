/* Kleine Simulationen zum Einbetten in Notizen und Projekte.
   Einbinden: <div data-sim="rc"></div>  ·  in Markdown:  ::: sim rc  (optional mit Startwerten: ::: sim rc r=10k c=22n)
   Verfügbare Simulationen: rc (RC-Tiefpass), welle (Sinusgrößen), teiler (Spannungsteiler), bruecke (Brückenschaltung). */
'use strict';
const OSCISims = (() => {
  const PREFIX = [[1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
  function si(value, unit, digits = 3) {
    if (!Number.isFinite(value)) return '∞ ' + unit;
    if (value === 0) return '0 ' + unit;
    const abs = Math.abs(value);
    const [factor, prefix] = PREFIX.find(([f]) => abs >= f * .9995) || PREFIX[PREFIX.length - 1];
    const scaled = value / factor;
    return `${new Intl.NumberFormat('de-DE', {maximumSignificantDigits: digits}).format(scaled)} ${prefix}${unit}`;
  }
  /* "10k", "22n", "4,7µ", "100" → Zahl */
  function parseSI(text, fallback) {
    const m = String(text ?? '').trim().replace(',', '.').match(/^(-?\d*\.?\d+)\s*([pnuµmkM]?)/);
    if (!m) return fallback;
    const f = {p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, '': 1, k: 1e3, M: 1e6}[m[2]];
    return Number(m[1]) * f;
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let uid = 0;

  /* Regler mit optional logarithmischer Skala. */
  function slider({label, min, max, value, log, unit, format}) {
    const id = `sim-${++uid}`;
    const toPos = v => log ? Math.log(v / min) / Math.log(max / min) * 1000 : (v - min) / (max - min) * 1000;
    const fromPos = p => log ? min * Math.pow(max / min, p / 1000) : min + (max - min) * p / 1000;
    const row = document.createElement('label');
    row.className = 'sim-control'; row.htmlFor = id;
    row.innerHTML = `<span class="sim-control-row"><span>${label}</span><output></output></span><input id="${id}" type="range" min="0" max="1000" step="1">`;
    const input = row.querySelector('input'), out = row.querySelector('output');
    const show = v => { const text = format ? format(v) : si(v, unit); out.textContent = text; input.setAttribute('aria-valuetext', text); };
    /* Der genaue Wert wird gemerkt; der Regler rundet beim Ziehen auf drei geltende Stellen. */
    let current = clamp(value, min, max);
    input.value = toPos(current); show(current);
    return {
      el: row,
      get value() { return current; },
      set value(v) { current = clamp(v, min, max); input.value = toPos(current); show(current); },
      on(fn) { input.addEventListener('input', () => { current = clamp(Number(fromPos(Number(input.value)).toPrecision(3)), min, max); show(current); fn(); }); }
    };
  }
  function shell(el, title, formula) {
    el.classList.add('sim');
    el.innerHTML = `<div class="sim-head"><span class="sim-kicker">Simulation / ${title}</span>${formula ? `<span class="sim-formula">${formula}</span>` : ''}</div><div class="sim-body"><div class="sim-plots"></div><div class="sim-side"><div class="sim-controls"></div><dl class="sim-readout"></dl><div class="sim-actions"></div></div></div>`;
    return {plots: el.querySelector('.sim-plots'), controls: el.querySelector('.sim-controls'), readout: el.querySelector('.sim-readout'), actions: el.querySelector('.sim-actions')};
  }
  function readout(dl, rows) { dl.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join(''); }

  /* Ein Diagramm als SVG mit Gitter, Achsen und Pfaden. x/y-Funktionen bilden Werte auf Pixel ab. */
  function plot(container, caption) {
    /* Auf schmalen Bildschirmen ein schmaleres Koordinatensystem, damit die Beschriftung lesbar bleibt. */
    const W = container.clientWidth && container.clientWidth < 500 ? 400 : 560, H = 230, pad = {l: 46, r: 14, t: 14, b: 30};
    const fig = document.createElement('figure');
    fig.className = 'sim-plot';
    fig.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${caption}"></svg><figcaption>${caption}</figcaption>`;
    container.append(fig);
    const svg = fig.querySelector('svg');
    return {
      W, H, pad, svg,
      draw(parts) { svg.innerHTML = parts.join(''); }
    };
  }
  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');

  /* ---------- RC-Tiefpass ---------- */
  function rc(el, opts) {
    const ui = shell(el, 'RC-Tiefpass', 'f<sub>c</sub> = 1 / (2πRC)');
    const R = slider({label: 'Widerstand R', min: 100, max: 100e3, value: parseSI(opts.r, 10e3), log: true, unit: 'Ω'});
    const C = slider({label: 'Kapazität C', min: 1e-9, max: 10e-6, value: parseSI(opts.c, 22e-9), log: true, unit: 'F'});
    ui.controls.append(R.el, C.el);
    const bode = plot(ui.plots, 'Amplitudengang |H(f)| in dB — logarithmische Frequenzachse');
    const step = plot(ui.plots, 'Sprungantwort: Kondensatorspannung nach dem Einschalten');
    const fMin = 10, fMax = 100e3, dbMin = -40;
    const listen = document.createElement('a');
    listen.className = 'button small'; listen.textContent = 'Im Labor anhören ↗︎';
    ui.actions.append(listen);
    function update() {
      const r = R.value, c = C.value, fc = 1 / (2 * Math.PI * r * c), tau = r * c;
      // Bode
      const {W, H, pad} = bode, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
      const fx = f => pad.l + Math.log10(f / fMin) / Math.log10(fMax / fMin) * iw;
      const dy = db => pad.t + (Math.max(db, dbMin) / dbMin) * ih;
      const parts = [];
      for (let d = 1; d <= 1e4; d *= 10) for (let k = 1; k < 10; k++) { const f = fMin * d * k; if (f > fMax) break; parts.push(`<path class="grid${k === 1 ? ' major' : ''}" d="M${fx(f).toFixed(1)},${pad.t}V${pad.t + ih}"/>`); }
      for (let db = 0; db >= dbMin; db -= 10) parts.push(`<path class="grid major" d="M${pad.l},${dy(db)}H${pad.l + iw}"/><text class="tick" x="${pad.l - 6}" y="${dy(db) + 3}" text-anchor="end">${db}</text>`);
      ['10 Hz', '100', '1 k', '10 k', '100 kHz'].forEach((t, i) => parts.push(`<text class="tick" x="${fx(fMin * 10 ** i)}" y="${H - 10}" text-anchor="${i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}">${t}</text>`));
      parts.push(`<path class="ref" d="M${pad.l},${dy(-3)}H${pad.l + iw}"/><text class="tick ref-label" x="${pad.l + iw - 4}" y="${dy(-3) - 5}" text-anchor="end">−3 dB</text>`);
      const pts = [];
      for (let i = 0; i <= 200; i++) { const f = fMin * Math.pow(fMax / fMin, i / 200); pts.push([fx(f), dy(-10 * Math.log10(1 + (f / fc) ** 2))]); }
      parts.push(`<path class="trace" d="${line(pts)}"/>`);
      if (fc >= fMin && fc <= fMax) parts.push(`<path class="marker" d="M${fx(fc)},${pad.t}V${pad.t + ih}"/><circle class="dot" cx="${fx(fc)}" cy="${dy(-3)}" r="4.5"/><text class="tag-label" x="${fx(fc) + (fx(fc) > W - 120 ? -8 : 8)}" y="${pad.t + 14}" text-anchor="${fx(fc) > W - 120 ? 'end' : 'start'}">f<tspan dy="3" font-size="9">c</tspan><tspan dy="-3"> = ${si(fc, 'Hz')}</tspan></text>`);
      else parts.push(`<text class="tag-label" x="${pad.l + 8}" y="${pad.t + 14}">f<tspan dy="3" font-size="9">c</tspan><tspan dy="-3"> = ${si(fc, 'Hz')} (außerhalb)</tspan></text>`);
      bode.draw(parts);
      // Sprungantwort über 5τ
      const s = step, sw = s.W - s.pad.l - s.pad.r, sh = s.H - s.pad.t - s.pad.b;
      const tx = t => s.pad.l + t / (5 * tau) * sw, uy = u => s.pad.t + (1 - u) * sh;
      const sp = [];
      for (let k = 0; k <= 5; k++) sp.push(`<path class="grid${k ? '' : ' major'}" d="M${tx(k * tau)},${s.pad.t}V${s.pad.t + sh}"/><text class="tick" x="${tx(k * tau)}" y="${s.H - 10}" text-anchor="middle">${k ? k + 'τ' : '0'}</text>`);
      [0, .5, 1].forEach(u => sp.push(`<path class="grid major" d="M${s.pad.l},${uy(u)}H${s.pad.l + sw}"/><text class="tick" x="${s.pad.l - 6}" y="${uy(u) + 3}" text-anchor="end">${u === .5 ? '0,5' : u}</text>`));
      const curve = [];
      for (let i = 0; i <= 160; i++) { const t = i / 160 * 5 * tau; curve.push([tx(t), uy(1 - Math.exp(-t / tau))]); }
      sp.push(`<path class="ref" d="M${s.pad.l},${uy(.632)}H${tx(tau)}V${s.pad.t + sh}"/><circle class="dot" cx="${tx(tau)}" cy="${uy(.632)}" r="4.5"/><text class="tag-label" x="${tx(tau) + 8}" y="${uy(.632) + 16}">63 % nach τ = ${si(tau, 's')}</text>`);
      sp.push(`<path class="trace" d="${line(curve)}"/><text class="axis" x="${s.pad.l + sw}" y="${uy(1) - 6}" text-anchor="end">u<tspan dy="3" font-size="9">C</tspan><tspan dy="-3"> / U₀</tspan></text>`);
      step.draw(sp);
      readout(ui.readout, [['Grenzfrequenz f<sub>c</sub>', si(fc, 'Hz')], ['Zeitkonstante τ = RC', si(tau, 's')], ['Bei 10 · f<sub>c</sub>', '−20 dB (≈ 1/10)'], ['Fast geladen nach', `5τ = ${si(5 * tau, 's')}`]]);
      // Labor-Patch: Sägezahn → Kondensator → Ausgang (Werte auf die Labor-Regler begrenzt)
      if (typeof LabModels !== 'undefined' && typeof OSCI !== 'undefined') {
        const patch = LabModels.encodePatch([
          {id: 'n1', type: 'osc', x: 40, y: 90, p: {frequency: 220, wave: 'sawtooth'}},
          {id: 'n2', type: 'capacitor', x: 330, y: 150, p: {c: clamp(+(c * 1e9).toPrecision(4), 1, 2200), r: clamp(+(r / 1e3).toPrecision(4), 1, 100)}},
          {id: 'n3', type: 'out', x: 620, y: 90, p: {volume: 10}}
        ], [{from: 'n1', to: 'n2'}, {from: 'n2', to: 'n3'}]);
        listen.href = OSCI.url('#patch=' + patch);
      } else listen.hidden = true;
    }
    R.on(update); C.on(update); update();
  }

  /* ---------- Sinusgrößen ---------- */
  function welle(el, opts) {
    const ui = shell(el, 'Sinusgrößen', 'u(t) = û · sin(2πft + φ)');
    const A = slider({label: 'Amplitude û', min: 0, max: 10, value: parseSI(opts.u, 5), unit: 'V', format: v => `${v.toFixed(1).replace('.', ',')} V`});
    const F = slider({label: 'Frequenz f', min: .5, max: 10, value: parseSI(opts.f, 2), log: true, unit: 'Hz'});
    const P = slider({label: 'Nullphase φ', min: -180, max: 180, value: parseSI(opts.phi, 0), unit: '°', format: v => `${Math.round(v)}°`});
    const ghost = document.createElement('label');
    ghost.className = 'sim-check'; ghost.innerHTML = '<input type="checkbox" checked> Vergleich: 5 V, 2 Hz, 0° einblenden';
    ui.controls.append(A.el, F.el, P.el, ghost);
    const graph = plot(ui.plots, 'Zeitverlauf über eine Sekunde');
    function update() {
      const a = A.value, f = F.value, phi = P.value * Math.PI / 180;
      const {W, H, pad} = graph, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
      const tx = t => pad.l + t * iw, uy = u => pad.t + ih / 2 - u / 10 * (ih / 2);
      const parts = [];
      for (let k = 0; k <= 10; k++) parts.push(`<path class="grid${k % 5 ? '' : ' major'}" d="M${tx(k / 10)},${pad.t}V${pad.t + ih}"/>`);
      for (let k = 0; k <= 10; k++) parts.push(`<text class="tick" x="${tx(k / 10)}" y="${H - 10}" text-anchor="middle">${k % 5 ? '' : (k / 10).toString().replace('.', ',') + ' s'}</text>`);
      [-10, -5, 0, 5, 10].forEach(u => parts.push(`<path class="grid${u ? '' : ' major'}" d="M${pad.l},${uy(u)}H${pad.l + iw}"/><text class="tick" x="${pad.l - 6}" y="${uy(u) + 3}" text-anchor="end">${u} V</text>`));
      const sample = (amp, freq, ph) => { const pts = []; for (let i = 0; i <= 400; i++) { const t = i / 400; pts.push([tx(t), uy(amp * Math.sin(2 * Math.PI * freq * t + ph))]); } return line(pts); };
      if (ghost.querySelector('input').checked) parts.push(`<path class="ghost" d="${sample(5, 2, 0)}"/>`);
      parts.push(`<path class="ref" d="M${pad.l},${uy(a / Math.SQRT2)}H${pad.l + iw}"/><text class="tick ref-label" x="${pad.l + iw - 4}" y="${uy(a / Math.SQRT2) - 5}" text-anchor="end">U<tspan dy="3" font-size="8">eff</tspan></text>`);
      parts.push(`<path class="trace" d="${sample(a, f, phi)}"/>`);
      graph.draw(parts);
      readout(ui.readout, [['Periodendauer T = 1/f', si(1 / f, 's')], ['Kreisfrequenz ω = 2πf', `${(2 * Math.PI * f).toFixed(2).replace('.', ',')} 1/s`], ['Effektivwert û/√2', si(a / Math.SQRT2, 'V')], ['Spitze-Spitze 2û', si(2 * a, 'V')]]);
    }
    A.on(update); F.on(update); P.on(update); ghost.querySelector('input').addEventListener('change', update); update();
  }

  /* ---------- Spannungsteiler ---------- */
  function teiler(el, opts) {
    const ui = shell(el, 'Spannungsteiler', 'U<sub>2</sub> = U · R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)');
    const U = slider({label: 'Quellspannung U', min: 0, max: 24, value: parseSI(opts.u, 12), unit: 'V', format: v => `${v.toFixed(1).replace('.', ',')} V`});
    const R1 = slider({label: 'R₁ (oben)', min: 100, max: 100e3, value: parseSI(opts.r1, 10e3), log: true, unit: 'Ω'});
    const R2 = slider({label: 'R₂ (unten)', min: 100, max: 100e3, value: parseSI(opts.r2, 10e3), log: true, unit: 'Ω'});
    const RL = slider({label: 'Last R<sub>L</sub>', min: 100, max: 1e6, value: parseSI(opts.rl, 10e3), log: true, unit: 'Ω'});
    const load = document.createElement('label');
    load.className = 'sim-check'; load.innerHTML = `<input type="checkbox"${'last' in opts ? ' checked' : ''}> Last R<sub>L</sub> parallel zu R₂ anschließen`;
    ui.controls.append(U.el, R1.el, R2.el, load, RL.el);
    const fig = document.createElement('figure');
    fig.className = 'sim-plot sim-schematic';
    ui.plots.append(fig);
    function update() {
      const u = U.value, r1 = R1.value, r2 = R2.value, rl = RL.value, loaded = load.querySelector('input').checked;
      RL.el.hidden = !loaded;
      const r2eff = loaded ? r2 * rl / (r2 + rl) : r2;
      const u2 = u * r2eff / (r1 + r2eff), u2free = u * r2 / (r1 + r2), i = u / (r1 + r2eff);
      const share = u ? u2 / u : 0;
      // Schaltplan mit Spannungsbalken
      const barH = 150, top = 40;
      fig.innerHTML = `<svg viewBox="0 0 560 230" role="img" aria-label="Schaltplan Spannungsteiler mit Spannungsverteilung">
        <g class="wire-lines"><path d="M80,40H200V60"/><path d="M200,110V130"/><path d="M200,180V200H80"/><path d="M200,120H300"/>${loaded ? '<path d="M300,120H340V140"/><path d="M340,190V200H200"/>' : ''}</g>
        <circle class="src" cx="80" cy="120" r="22"/><path class="wire-lines" d="M80,40V98M80,142V200"/><text class="tag-label" x="80" y="125" text-anchor="middle">${si(u, 'V', 2)}</text>
        <rect class="res" x="188" y="60" width="24" height="50"/><text class="tick" x="222" y="90">R₁ ${si(r1, 'Ω', 2)}</text>
        <rect class="res" x="188" y="130" width="24" height="50"/><text class="tick" x="222" y="160">R₂ ${si(r2, 'Ω', 2)}</text>
        ${loaded ? `<rect class="res load" x="328" y="140" width="24" height="50"/><text class="tick" x="362" y="170">R<tspan dy="3" font-size="10">L</tspan><tspan dy="-3"> ${si(rl, 'Ω', 2)}</tspan></text>` : ''}
        <circle class="dot" cx="300" cy="120" r="4"/><text class="tag-label" x="${loaded ? 306 : 308}" y="${loaded ? 110 : 124}">U₂ = ${si(u2, 'V')}</text>
        <g transform="translate(470,${top})"><rect class="bar-bg" width="34" height="${barH}"/><rect class="bar-top" width="34" height="${barH * (1 - share)}"/><rect class="bar-low" y="${barH * (1 - share)}" width="34" height="${barH * share}"/><text class="tick" x="-6" y="${barH * (1 - share) / 2 + 3}" text-anchor="end">U₁</text><text class="tick" x="-6" y="${barH * (1 - share) + barH * share / 2 + 3}" text-anchor="end">U₂</text><text class="tick" x="17" y="${barH + 18}" text-anchor="middle">${Math.round(share * 100)} %</text></g>
      </svg><figcaption>Schaltung und Aufteilung der Quellspannung</figcaption>`;
      const rows = [['U₂ am Ausgang', si(u2, 'V')], ['U₁ über R₁', si(u - u2, 'V')], ['Strom durch R₁', si(i, 'A')]];
      if (loaded) rows.push(['ohne Last wären es', `${si(u2free, 'V')} (${u2free ? Math.round((u2free - u2) / u2free * 100) : 0} % mehr)`]);
      readout(ui.readout, rows);
    }
    [U, R1, R2, RL].forEach(s => s.on(update)); load.querySelector('input').addEventListener('change', update); update();
  }

  /* ---------- Brückenschaltung (ET1 A2.3) ----------
     Quelle Uq oben/unten, links R1 (oben) und R2 (unten) mit Mittelpunkt P1, rechts R3 (oben) und R4 (unten) mit P2,
     Last RL zwischen P1 und P2. R2 und R3 sind gekoppelt (R2 = R3 = x). Gelöst über die Ersatzspannungsquelle. */
  function brueckeRechnen(Uq, R1, x, R4, RL) {
    const par = (a, b) => (a + b === 0 ? 0 : a * b / (a + b));
    const R2 = x, R3 = x;
    const phi10 = Uq * R2 / (R1 + R2), phi20 = Uq * R4 / (R3 + R4);
    const U0 = phi10 - phi20, Ri = par(R1, R2) + par(R3, R4);
    const IL = Ri + RL > 0 ? U0 / (Ri + RL) : 0;
    const phi1 = phi10 - IL * par(R1, R2), phi2 = phi20 + IL * par(R3, R4);
    const I1 = (Uq - phi1) / R1, I4 = phi2 / R4, I2 = I1 - IL, I3 = I4 - IL; // Knotenregel an P1 und P2
    const Iq = I1 + I3, PL = RL * IL * IL, Pq = Uq * Iq;
    return {R2, R3, phi10, phi20, U0, Ri, IL, phi1, phi2, UL: phi1 - phi2, I1, I2, I3, I4, Iq, PL, Pq, eta: Pq > 0 ? PL / Pq : 0,
      P: [R1 * I1 * I1, R2 * I2 * I2, R3 * I3 * I3, R4 * I4 * I4]};
  }
  function bruecke(el, opts) {
    const ui = shell(el, 'Brückenschaltung', 'R<sub>2</sub> = R<sub>3</sub> gekoppelt · R<sub>L</sub> zwischen P<sub>1</sub> und P<sub>2</sub>');
    const R1 = parseSI(opts.r1, 10), R4 = parseSI(opts.r4, R1);
    const fmtOhm = v => `${new Intl.NumberFormat('de-DE', {maximumFractionDigits: 1}).format(v)} Ω`;
    const X = slider({label: 'R<sub>2</sub> = R<sub>3</sub>', min: 0, max: 50, value: parseSI(opts.x, 30), unit: 'Ω', format: fmtOhm});
    const U = slider({label: 'Quellenspannung U<sub>q</sub>', min: 0, max: 60, value: parseSI(opts.u, 30), unit: 'V', format: v => `${new Intl.NumberFormat('de-DE', {maximumFractionDigits: 1}).format(v)} V`});
    const RL = slider({label: 'Last R<sub>L</sub>', min: 1, max: 200, value: parseSI(opts.rl, 15), log: true, unit: 'Ω', format: fmtOhm});
    const match = document.createElement('label');
    match.className = 'sim-check';
    match.innerHTML = `<input type="checkbox"${'anpassen' in opts ? ' checked' : ''}> R<sub>L</sub> = R<sub>i</sub> (Leistungsanpassung)`;
    ui.controls.append(X.el, U.el, match, RL.el);
    const fig = document.createElement('figure');
    fig.className = 'sim-plot sim-schematic sim-bridge';
    ui.plots.append(fig);
    const curve = plot(ui.plots, 'Lastleistung P_L über R2 = R3 bei fester Last — der Punkt ist die aktuelle Einstellung');
    const badge = document.createElement('p');
    badge.className = 'sim-badge';
    ui.actions.append(badge);
    const fmt = (v, unit) => si(Math.abs(v) < 1e-12 ? 0 : v, unit, 4);
    const sub = (b, i) => `${b}<tspan dy="3" font-size="9">${i}</tspan><tspan dy="-3">`;
    function update() {
      const x = X.value, Uq = U.value, matched = match.querySelector('input').checked;
      const Ri0 = brueckeRechnen(Uq, R1, x, R4, 1).Ri;
      if (matched) RL.value = Math.max(1, Ri0);
      RL.el.classList.toggle('is-locked', matched);
      RL.el.querySelector('input').disabled = matched;
      const rl = RL.value, r = brueckeRechnen(Uq, R1, x, R4, rl);
      // Schaltplan: Widerstände leuchten je nach Anteil an der umgesetzten Leistung
      const pmax = Math.max(r.PL, ...r.P, 1e-9);
      const heat = p => `style="fill-opacity:${(0.12 + 0.88 * p / pmax).toFixed(2)}"`;
      const arrowV = (xPos, y, I) => Math.abs(I) < 1e-9 ? '' : `<path class="cur" d="M${xPos},${I > 0 ? y - 7 : y + 7} l-5,${I > 0 ? -8 : 8} h10 z"/>`;
      const lab = (xPos, y, name, R, I, anchor) => `<text class="tick" x="${xPos}" y="${y}" text-anchor="${anchor}">${name} = ${fmtOhm(R)}</text><text class="tick strong" x="${xPos}" y="${y + 16}" text-anchor="${anchor}">${fmt(Math.abs(I), 'A')} ${I >= 0 ? '↓' : '↑'}</text>`;
      const scaleY = v => 250 - (Uq > 0 ? v / Uq : 0) * 200; // Potentialskala rechts: 0 V unten, Uq oben
      const balanced = Math.abs(r.U0) < 1e-6 * Math.max(1, Uq);
      const y1 = scaleY(r.phi1), y2 = scaleY(r.phi2), close = Math.abs(y1 - y2) < 16;
      // Layout: Quelle x=40, linker Zweig x=210, rechter Zweig x=370, Potentialskala x=462
      fig.innerHTML = `<svg viewBox="0 0 560 300" role="img" aria-label="Brückenschaltung mit Potentialen und Strömen">
        <g class="wire-lines"><path d="M40,50 H370 M40,250 H370 M40,50 V128 M40,172 V250 M210,50 V70 M210,120 V180 M210,230 V250 M370,50 V70 M370,120 V180 M370,230 V250 M210,150 H255 M325,150 H370"/></g>
        <circle class="src" cx="40" cy="150" r="22"/><path class="wire-lines" d="M30,144 H50 M30,156 H50"/>
        <text class="tick" x="70" y="138">${sub('U', 'q')}</tspan></text><text class="tag-label" x="70" y="160">${fmt(Uq, 'V')}</text>
        <rect class="res heat" ${heat(r.P[0])} x="198" y="70" width="24" height="50"/>${lab(190, 90, 'R₁', R1, r.I1, 'end')}
        <rect class="res heat" ${heat(r.P[1])} x="198" y="180" width="24" height="50"/>${lab(190, 200, 'R₂', r.R2, r.I2, 'end')}
        <rect class="res heat" ${heat(r.P[2])} x="358" y="70" width="24" height="50"/>${lab(390, 90, 'R₃', r.R3, r.I3, 'start')}
        <rect class="res heat" ${heat(r.P[3])} x="358" y="180" width="24" height="50"/>${lab(390, 200, 'R₄', R4, r.I4, 'start')}
        ${arrowV(210, 70, r.I1)}${arrowV(210, 180, r.I2)}${arrowV(370, 70, r.I3)}${arrowV(370, 180, r.I4)}
        <rect class="res heat load" ${heat(r.PL)} x="255" y="140" width="70" height="20"/>
        <text class="tick" x="290" y="132" text-anchor="middle">${sub('R', 'L')} = ${fmtOhm(rl)}</tspan></text>
        <text class="tick strong" x="290" y="178" text-anchor="middle">${balanced ? 'kein Strom' : `${fmt(Math.abs(r.IL), 'A')} ${r.IL > 0 ? '→' : '←'}`}</text>
        <circle class="node" cx="210" cy="150" r="5"/><circle class="node" cx="370" cy="150" r="5"/><circle class="node" cx="210" cy="50" r="3.5"/><circle class="node" cx="210" cy="250" r="3.5"/>
        <text class="tag-label" x="200" y="146" text-anchor="end">${sub('P', '1')}</tspan></text><text class="tag-label" x="380" y="146">${sub('P', '2')}</tspan></text>
        <text class="tick" x="290" y="40" text-anchor="middle">φ = ${fmt(Uq, 'V')}</text><text class="tick" x="290" y="268" text-anchor="middle">φ = 0 V (Bezug)</text>
        <g class="phi-scale"><path class="wire-lines" d="M462,50 V250"/><path class="grid major" d="M456,50 H468 M456,250 H468"/>
          <text class="tick" x="452" y="54" text-anchor="end">${fmt(Uq, 'V')}</text><text class="tick" x="452" y="254" text-anchor="end">0 V</text>
          <path class="ul" d="M462,${y1} V${y2}"/>
          <circle class="dot" cx="462" cy="${y1}" r="5"/><text class="tick strong" x="472" y="${close ? (y1 <= y2 ? y1 - 6 : y1 + 14) : y1 + 4}">${sub('φ', '1')} ${fmt(r.phi1, 'V')}</tspan></text>
          <circle class="dot dot-2" cx="462" cy="${y2}" r="5"/><text class="tick strong" x="472" y="${close ? (y1 <= y2 ? y2 + 14 : y2 - 6) : y2 + 4}">${sub('φ', '2')} ${fmt(r.phi2, 'V')}</tspan></text>
        </g>
      </svg><figcaption>Potentiale bezogen auf den unteren Knoten. Je kräftiger ein Widerstand gefärbt ist, desto mehr Leistung setzt er um.</figcaption>`;
      // Lastleistung über x bei fester Last rl
      const {W, H, pad, svg} = curve, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
      const pts = [];
      let ymax = 0;
      for (let i = 0; i <= 200; i++) { const xv = i / 200 * 50, p = brueckeRechnen(Uq, R1, xv, R4, rl).PL; ymax = Math.max(ymax, p); pts.push([xv, p]); }
      ymax = ymax > 0 ? ymax * 1.08 : 1;
      const px = v => pad.l + v / 50 * iw, py = v => pad.t + (1 - v / ymax) * ih;
      const parts = [];
      for (let v = 0; v <= 50; v += 5) parts.push(`<path class="grid${v % 10 ? '' : ' major'}" d="M${px(v)},${pad.t}V${pad.t + ih}"/>${v % 10 ? '' : `<text class="tick" x="${px(v)}" y="${H - 10}" text-anchor="${v === 50 ? 'end' : 'middle'}">${v}${v === 50 ? ' Ω' : ''}</text>`}`);
      const step = ymax > 40 ? 20 : ymax > 15 ? 5 : ymax > 4 ? 1 : ymax > 1 ? .5 : .1;
      for (let v = 0; v <= ymax; v += step) parts.push(`<path class="grid major" d="M${pad.l},${py(v)}H${pad.l + iw}"/><text class="tick" x="${pad.l - 6}" y="${py(v) + 3}" text-anchor="end">${new Intl.NumberFormat('de-DE').format(Number(v.toPrecision(3)))}</text>`);
      parts.push(`<text class="axis" x="${pad.l + 4}" y="${pad.t + 10}">W</text>`);
      parts.push(`<path class="trace" d="${line(pts.map(([a, b]) => [px(a), py(b)]))}"/>`);
      const xb = Math.sqrt(R1 * R4);
      if (xb <= 50) parts.push(`<path class="marker" d="M${px(xb)},${pad.t}V${pad.t + ih}"/><text class="tick" x="${px(xb) + 5}" y="${pad.t + ih - 6}">Abgleich</text>`);
      parts.push(`<circle class="dot" cx="${px(x)}" cy="${py(r.PL)}" r="5"/><text class="tag-label" x="${px(x) + (px(x) > W - 140 ? -9 : 9)}" y="${py(r.PL) - 9}" text-anchor="${px(x) > W - 140 ? 'end' : 'start'}">${fmt(r.PL, 'W')}</text>`);
      curve.draw(parts);
      readout(ui.readout, [
        ['Innenwiderstand R<sub>i</sub>', fmt(r.Ri, 'Ω')],
        ['Leerlaufspannung U<sub>0</sub>', fmt(r.U0, 'V')],
        ['Potentiale φ<sub>1</sub> / φ<sub>2</sub>', `${fmt(r.phi1, 'V')} / ${fmt(r.phi2, 'V')}`],
        ['Laststrom I<sub>L</sub>', fmt(r.IL, 'A')],
        ['Lastleistung P<sub>L</sub>', fmt(r.PL, 'W')],
        ['Quellenstrom I<sub>q</sub>', fmt(r.Iq, 'A')],
        ['Quellenleistung P<sub>q</sub>', fmt(r.Pq, 'W')],
        ['Wirkungsgrad η', `${new Intl.NumberFormat('de-DE', {maximumFractionDigits: 2}).format(r.eta * 100)} %`]
      ]);
      badge.textContent = balanced ? 'Brücke abgeglichen: φ₁ = φ₂, durch die Last fließt kein Strom.' : r.IL < 0 ? 'U₀ < 0: Der Laststrom fließt von P₂ nach P₁.' : matched ? 'Leistungsanpassung: R_L = R_i, die Last bekommt das Maximum, das diese Brücke liefern kann.' : '';
      badge.hidden = !badge.textContent;
    }
    [X, U, RL].forEach(sl => sl.on(update)); match.querySelector('input').addEventListener('change', update); update();
  }

  const SIMS = {rc, welle, teiler, bruecke};
  /* Alle [data-sim]-Platzhalter in einem Bereich starten. */
  function mount(root = document) {
    root.querySelectorAll('[data-sim]').forEach(el => {
      const kind = el.dataset.sim;
      if (el.dataset.ready || !SIMS[kind]) { if (!SIMS[kind]) el.textContent = `Unbekannte Simulation „${kind}“. Verfügbar: ${Object.keys(SIMS).join(', ')}.`; return; }
      el.dataset.ready = '1';
      const opts = {};
      for (const [k, v] of Object.entries(el.dataset)) if (k !== 'sim' && k !== 'ready') opts[k] = v;
      try { SIMS[kind](el, opts); } catch (error) { el.textContent = 'Diese Simulation konnte nicht starten.'; console.error(error); }
    });
  }
  return {mount, si, parseSI, names: Object.keys(SIMS)};
})();
