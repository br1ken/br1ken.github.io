/* Schaltungssimulator für den Messplatz (messplatz/index.html) — ohne Oberfläche, damit er sich einzeln testen lässt.

   Verfahren wie in SPICE, nur kleiner:
   - Modifizierte Knotenanalyse: Unbekannte sind die Knotenpotentiale (Masse = Knoten 0) und je OPV ein innerer Zustand.
   - Zeitschritt mit BDF2 (Gear 2. Ordnung). Nach dem Start oder einer Schrittweitenänderung ein Schritt implizites Euler.
     Beide sind A-stabil und dämpfen steife Anteile, ohne dass es wie bei der Trapezregel nachschwingt.
   - Nichtlineare Bauteile (Diode, Transistor, OPV, strombegrenzte Quellen) per Newton-Raphson,
     Sperrschichtspannungen begrenzt wie in SPICE (pnjlim), damit die Exponentialfunktion nicht überläuft.
   - Es gibt keine idealen Spannungsquellen: Funktionsgenerator = Norton-Quelle mit 50 Ω, Netzgerät und Ohmmeter =
     strombegrenzte Quellen. Dazu hängt jeder Knoten mit GMIN an Masse. Die Matrix bleibt so immer lösbar.

   Netzliste: {nodes: N, devices: [...]}, Knoten 1…N, 0 = Masse.
     {k: 'R',  id, n: [a, b], R}                 Widerstand
     {k: 'C',  id, n: [a, b], C}                 Kondensator
     {k: 'L',  id, n: [a, b], L}                 Spule
     {k: 'D',  id, n: [anode, kathode], m}       Diode, LED, Z-Diode (Modell aus MODELS)
     {k: 'Q',  id, n: [c, b, e], m, pol}         Bipolartransistor, pol = +1 NPN, −1 PNP (Ebers-Moll)
     {k: 'OP', id, n: [plus, minus, out], m}     Operationsverstärker (GBW, Sättigung, Strombegrenzung)
     {k: 'NS', id, n: [out], G, e(t)}            Spannung e(t) hinter Innenleitwert G, gegen Masse
     {k: 'LS', id, n: [plus, minus], V, I, Rs}   Quelle V mit Strombegrenzung I (Konstantspannung / Konstantstrom) */
'use strict';
const OSCISchaltung = (() => {
  const VT = 0.025852;   // Temperaturspannung kT/q bei 300 K
  const GMIN = 1e-12;    // Leitwert jedes Knotens und jeder Sperrschicht

  const MODELS = {
    '1N4148': {Is: 2.52e-9, n: 1.752},
    'LED': {Is: 1e-18, n: 1.9},                               // rot, etwa 1,8 V bei 10 mA
    'ZD5V1': {Is: 1e-14, n: 1, BV: 5.1, Ibv: 5e-3, nb: 4},    // Z-Diode: 5,1 V bei 5 mA, r_z ≈ 20 Ω
    'BC547': {Is: 1e-14, BF: 300, BR: 5},
    'BC557': {Is: 1e-14, BF: 300, BR: 5},
    'OPV': {gbw: 1e6, a0: 2e5, vsat: 13.5, ro: 50, ilim: 0.025} // ±15 V Versorgung (intern)
  };

  /* Exponentialfunktion, ab e^80 linear fortgesetzt (bleibt endlich, Ableitung stetig) */
  const EXPMAX = 80, EMAX = Math.exp(EXPMAX);
  const expl = u => u < EXPMAX ? Math.exp(u) : EMAX * (1 + u - EXPMAX);
  const dexpl = u => u < EXPMAX ? Math.exp(u) : EMAX;
  /* SPICE-Spannungsbegrenzung für pn-Übergänge */
  function pnjlim(vnew, vold, vt, vcrit, flag) {
    if (vnew > vcrit && Math.abs(vnew - vold) > 2 * vt) {
      if (vold > 0) {
        const arg = 1 + (vnew - vold) / vt;
        vnew = arg > 0 ? vold + vt * Math.log(arg) : vcrit;
      } else vnew = vt * Math.log(vnew / vt);
      flag.limited = true;
    }
    return vnew;
  }
  const tanh = u => u > 20 ? 1 : u < -20 ? -1 : Math.tanh(u);
  const sech2 = u => { const a = Math.abs(u); if (a > 20) return 4 * Math.exp(-2 * a); const c = Math.cosh(u); return 1 / (c * c); };
  /* glatte Begrenzung für den OPV-Ausgang: softplus mit Knick k */
  const KNEE = 0.05;
  const softplus = u => { const q = u / KNEE; return q > 30 ? u + KNEE * Math.exp(-q) : q < -30 ? KNEE * Math.exp(q) : KNEE * Math.log1p(Math.exp(q)); };
  const sigma = u => { const q = u / KNEE; return q > 30 ? 1 : q < -30 ? Math.exp(q) : 1 / (1 + Math.exp(-q)); };

  function create() {
    let N = 0, size = 0, devs = [], nonlin = false, version = 0;
    let x = new Float64Array(0), xk = x, A = x, z = x, lu = x, perm = new Int32Array(0), luKey = '';
    let h = 1e-5, lastH = 0;
    const states = new Map(); // Bauteilzustände über Neuaufbauten hinweg (Kondensatorspannung, Spulenstrom, …)
    const sim = {t: 0, fails: 0, iters: 0, error: ''};

    /* ---------- Einträge in Matrix und rechte Seite (Index −1 = Masse) ---------- */
    const ix = node => node - 1;
    function addG(i, j, g) {
      if (i >= 0) A[i * size + i] += g;
      if (j >= 0) A[j * size + j] += g;
      if (i >= 0 && j >= 0) { A[i * size + j] -= g; A[j * size + i] -= g; }
    }
    /* Strom cur fließt von Knoten i durch das Bauteil zu Knoten j */
    function addI(i, j, cur) { if (i >= 0) z[i] -= cur; if (j >= 0) z[j] += cur; }
    const volt = (v, i) => i >= 0 ? v[i] : 0;

    /* ---------- Netzliste laden; Zustände gleichnamiger Bauteile bleiben erhalten ---------- */
    sim.load = (net) => {
      for (const d of devs) states.set(d.id + '|' + d.k, d.s);
      N = net.nodes;
      let extra = 0;
      devs = net.devices.map(src => {
        const d = {...src, i: src.n.map(ix), s: states.get(src.id + '|' + src.k)};
        if (!d.s) {
          d.s = d.k === 'C' ? {v1: 0, v2: 0, i: 0} : d.k === 'L' ? {i1: 0, i2: 0, v: 0}
            : d.k === 'D' ? {vd: 0, i: 0} : d.k === 'Q' ? {vbe: 0, vbc: 0, ic: 0, ib: 0}
            : d.k === 'OP' ? {x1: 0, x2: 0, x: 0, io: 0} : d.k === 'LS' ? {mode: 'CV'} : {i: 0};
        }
        if (d.k === 'D' || d.k === 'Q' || d.k === 'OP') d.mm = MODELS[d.m];
        if (d.k === 'D') { const m = d.mm, nvt = m.n * VT; d.nvt = nvt; d.vcrit = nvt * Math.log(nvt / (Math.SQRT2 * m.Is)); if (m.BV) { d.nbvt = m.nb * VT; d.vcritb = d.nbvt * Math.log(d.nbvt / (Math.SQRT2 * m.Ibv)); } }
        if (d.k === 'Q') d.vcrit = VT * Math.log(VT / (Math.SQRT2 * d.mm.Is));
        if (d.k === 'OP') { d.si = N + extra++; const m = d.mm; d.wt = 2 * Math.PI * m.gbw; d.tau0 = m.a0 / d.wt; d.waw = 10 * d.wt; }
        return d;
      });
      states.clear();
      size = N + extra;
      nonlin = devs.some(d => d.k === 'D' || d.k === 'Q' || d.k === 'OP' || d.k === 'LS');
      const old = x;
      x = new Float64Array(size); xk = new Float64Array(size);
      if (old.length === size) x.set(old); // gleiche Größe: alte Potentiale als Startwert
      for (const d of devs) if (d.k === 'OP') x[d.si] = d.s.x1;
      A = new Float64Array(size * size); lu = new Float64Array(size * size); z = new Float64Array(size); perm = new Int32Array(size);
      version++; luKey = ''; lastH = 0; sim.error = '';
    };
    sim.reset = () => { states.clear(); for (const d of devs) d.s = null; const net = {nodes: N, devices: devs.map(({i, s, mm, ...rest}) => rest)}; sim.t = 0; sim.fails = 0; x = new Float64Array(0); sim.load(net); };
    sim.setStep = (dt) => { h = dt; };
    sim.step = () => h;

    /* ---------- Gleichungssystem für einen Zeitschritt aufbauen ---------- */
    function assemble(v, hh, ord, t1, withMatrix) {
      if (withMatrix) A.fill(0);
      z.fill(0);
      const a0 = ord === 2 ? 1.5 / hh : 1 / hh;
      let limited = false;
      const flag = {limited: false};
      if (withMatrix) for (let i = 0; i < N; i++) A[i * size + i] += GMIN;
      for (const d of devs) {
        const [a, b, c] = d.i;
        switch (d.k) {
          case 'R': if (withMatrix) addG(a, b, 1 / d.R); break;
          case 'C': {
            const s = d.s, g = a0 * d.C, hist = ord === 2 ? (-2 * s.v1 + 0.5 * s.v2) / hh : -s.v1 / hh;
            if (withMatrix) addG(a, b, g);
            addI(a, b, d.C * hist); d.g = g; d.ieq = d.C * hist;
            break;
          }
          case 'L': {
            const s = d.s, g = ord === 2 ? 2 * hh / (3 * d.L) : hh / d.L, ieq = ord === 2 ? (4 * s.i1 - s.i2) / 3 : s.i1;
            if (withMatrix) addG(a, b, g);
            addI(a, b, ieq); d.g = g; d.ieq = ieq;
            break;
          }
          case 'NS': {
            const e = d.e(t1);
            if (withMatrix) addG(a, -1, d.G);
            if (a >= 0) z[a] += d.G * e;
            d.ecur = e;
            break;
          }
          case 'LS': {
            /* wie ein Labornetzgerät: Konstantspannung (V hinter Rs) oder Konstantstrom I, je nachdem was die Last verlangt */
            const s = d.s, vpm = volt(v, a) - volt(v, b);
            if (s.mode === 'CV' && (d.V - vpm) / d.Rs > d.I * (1 + 1e-9)) { s.mode = 'CC'; limited = true; }
            else if (s.mode === 'CC' && vpm > d.V - d.I * d.Rs) { s.mode = 'CV'; limited = true; }
            if (s.mode === 'CC') { addG(a, b, GMIN); addI(a, b, -d.I); }
            else { addG(a, b, 1 / d.Rs); addI(a, b, -d.V / d.Rs); }
            break;
          }
          case 'D': {
            const m = d.mm, s = d.s;
            let vd = volt(v, a) - volt(v, b);
            flag.limited = false;
            vd = pnjlim(vd, s.vd, d.nvt, d.vcrit, flag);
            if (m.BV) { const w = pnjlim(-vd - m.BV, -s.vd - m.BV, d.nbvt, d.vcritb, flag); vd = -w - m.BV; }
            if (flag.limited) limited = true;
            const u = vd / d.nvt;
            let id = m.Is * (expl(u) - 1), gd = m.Is / d.nvt * dexpl(u);
            if (m.BV) { const ub = -(vd + m.BV) / d.nbvt; id -= m.Ibv * expl(ub); gd += m.Ibv / d.nbvt * dexpl(ub); }
            id += GMIN * vd; gd += GMIN;
            addG(a, b, gd); addI(a, b, id - gd * vd);
            s.vd = vd; d.cur = id;
            break;
          }
          case 'Q': {
            const m = d.mm, s = d.s, p = d.pol, cN = a, bN = b, eN = c; // Reihenfolge c, b, e
            const vB = volt(v, bN), vC = volt(v, cN), vE = volt(v, eN);
            flag.limited = false;
            const vbe = pnjlim(p * (vB - vE), s.vbe, VT, d.vcrit, flag), vbc = pnjlim(p * (vB - vC), s.vbc, VT, d.vcrit, flag);
            if (flag.limited) limited = true;
            const ef = expl(vbe / VT), er = expl(vbc / VT);
            const IF = m.Is * (ef - 1) + GMIN * vbe, IR = m.Is * (er - 1) + GMIN * vbc;
            const gF = m.Is / VT * dexpl(vbe / VT) + GMIN, gR = m.Is / VT * dexpl(vbc / VT) + GMIN;
            const ic = p * (IF - IR * (1 + 1 / m.BR)), ib = p * (IF / m.BF + IR / m.BR);
            const ac = p * gF, bc = -p * gR * (1 + 1 / m.BR), ab = p * gF / m.BF, bb = p * gR / m.BR;
            const terms = [[cN, ic, ac, bc], [bN, ib, ab, bb], [eN, -ic - ib, -ac - ab, -bc - bb]];
            for (const [T, I, aT, bT] of terms) {
              if (T < 0) continue;
              const row = T * size;
              if (bN >= 0) A[row + bN] += p * (aT + bT);
              if (eN >= 0) A[row + eN] -= p * aT;
              if (cN >= 0) A[row + cN] -= p * bT;
              z[T] -= I - aT * vbe - bT * vbc;
            }
            s.vbe = vbe; s.vbc = vbc; s.ic = ic; s.ib = ib;
            break;
          }
          case 'OP': {
            const m = d.mm, s = d.s, si = d.si, xs = v[si], vo = volt(v, c);
            /* innerer Zustand: dx/dt = ωt·(v+ − v−) − x/τ0 − ωaw·w(x)  (Verstärkung a0, GBW, Anti-Windup jenseits der Sättigung) */
            const w = softplus(xs - m.vsat) - softplus(-xs - m.vsat), dw = sigma(xs - m.vsat) + sigma(-xs - m.vsat);
            const nn = -xs / d.tau0 - d.waw * w, dnn = -1 / d.tau0 - d.waw * dw;
            const hist = ord === 2 ? (-2 * s.x1 + 0.5 * s.x2) / hh : -s.x1 / hh;
            const row = si * size;
            A[row + si] += (a0 - dnn) / d.wt;
            if (a >= 0) A[row + a] -= 1;
            if (b >= 0) A[row + b] += 1;
            z[si] += (-hist + nn - dnn * xs) / d.wt;
            /* Ausgang: begrenzte Spannung x − w(x) hinter R_o, Strom höchstens ±ilim */
            if (c >= 0) {
              const k = m.ro * m.ilim, u = (xs - w - vo) / k, io = m.ilim * tanh(u), s2 = sech2(u);
              const fx = -s2 * (1 - dw) / m.ro, fo = s2 / m.ro;
              A[c * size + si] += fx; A[c * size + c] += fo;
              z[c] -= -io - fx * xs - fo * vo;
              s.io = io;
            }
            s.x = xs;
            break;
          }
        }
      }
      return limited;
    }

    /* ---------- LU-Zerlegung mit Spaltenpivotsuche ---------- */
    function factor() {
      lu.set(A);
      const n = size;
      for (let i = 0; i < n; i++) perm[i] = i;
      for (let k = 0; k < n; k++) {
        let p = k, max = Math.abs(lu[k * n + k]);
        for (let i = k + 1; i < n; i++) { const a = Math.abs(lu[i * n + k]); if (a > max) { max = a; p = i; } }
        if (!(max > 1e-300)) return false;
        if (p !== k) {
          for (let j = 0; j < n; j++) { const tmp = lu[k * n + j]; lu[k * n + j] = lu[p * n + j]; lu[p * n + j] = tmp; }
          const tp = perm[k]; perm[k] = perm[p]; perm[p] = tp;
        }
        const piv = lu[k * n + k];
        for (let i = k + 1; i < n; i++) {
          const f = lu[i * n + k] / piv;
          if (f === 0) continue;
          lu[i * n + k] = f;
          for (let j = k + 1; j < n; j++) lu[i * n + j] -= f * lu[k * n + j];
        }
      }
      return true;
    }
    function solve(out) {
      const n = size;
      for (let i = 0; i < n; i++) { let s = z[perm[i]]; for (let j = 0; j < i; j++) s -= lu[i * n + j] * out[j]; out[i] = s; }
      for (let i = n - 1; i >= 0; i--) { let s = out[i]; for (let j = i + 1; j < n; j++) s -= lu[i * n + j] * out[j]; out[i] = s / lu[i * n + i]; }
    }

    /* ---------- ein Zeitschritt der Länge hh; true = konvergiert ---------- */
    const trial = new Float64Array(0);
    let xn = trial;
    function tryStep(hh, ord) {
      if (!size) { sim.t += hh; return true; }
      if (xn.length !== size) xn = new Float64Array(size);
      const t1 = sim.t + hh;
      xk.set(x);
      if (!nonlin) {
        const key = hh + '|' + ord + '|' + version;
        const fresh = key !== luKey;
        assemble(xk, hh, ord, t1, fresh);
        if (fresh) { if (!factor()) { sim.error = 'Die Schaltung ist so nicht lösbar.'; return false; } luKey = key; }
        solve(xn); x.set(xn); sim.iters = 1;
        accept(hh);
        return true;
      }
      luKey = '';
      for (let it = 0; it < 60; it++) {
        const limited = assemble(xk, hh, ord, t1, true);
        if (!factor()) { sim.error = 'Die Schaltung ist so nicht lösbar.'; return false; }
        solve(xn);
        let conv = !limited;
        for (let i = 0; i < size; i++) {
          if (!Number.isFinite(xn[i])) return false;
          if (Math.abs(xn[i] - xk[i]) > 1e-6 + 1e-6 * Math.abs(xn[i])) conv = false;
        }
        xk.set(xn);
        if (conv && it > 0) { x.set(xn); sim.iters = it + 1; accept(hh); return true; }
      }
      return false;
    }
    /* Zustände nach einem gelungenen Schritt fortschreiben */
    function accept(hh) {
      for (const d of devs) {
        const [a, b] = d.i, s = d.s;
        if (d.k === 'C') { const vv = volt(x, a) - volt(x, b); s.i = d.g * vv + d.ieq; s.v2 = s.v1; s.v1 = vv; }
        else if (d.k === 'L') { const vv = volt(x, a) - volt(x, b); s.v = vv; s.i2 = s.i1; s.i1 = d.g * vv + d.ieq; }
        else if (d.k === 'OP') { s.x2 = s.x1; s.x1 = x[d.si]; }
      }
      sim.t += hh;
    }
    /* Schritt mit der eingestellten Weite; klappt Newton nicht, in vier Teilschritten mit implizitem Euler */
    sim.advance = () => {
      if (sim.error) return false;
      const ord = lastH === h ? 2 : 1;
      if (tryStep(h, ord)) { lastH = h; return true; }
      if (sim.error) return false;
      const saved = sim.t;
      for (let k = 0; k < 4; k++) {
        if (!tryStep(h / 4, 1)) { sim.fails++; x.set(xk); accept(h / 4); }
      }
      sim.t = saved + h; lastH = 0;
      return true;
    };

    /* ---------- Messwerte ---------- */
    sim.v = node => node > 0 && node <= N ? x[node - 1] : 0;
    /* Strom und Spannung eines Bauteils (Zählpfeile von n[0] nach n[1]); bei Transistor und OPV die Klemmenströme */
    sim.info = (id) => {
      const d = devs.find(e => e.id === id);
      if (!d) return null;
      const [a, b, c] = d.i, u = volt(x, a) - volt(x, b);
      switch (d.k) {
        case 'R': return {u, i: u / d.R};
        case 'C': return {u, i: d.s.i};
        case 'L': return {u, i: d.s.i1};
        case 'D': return {u, i: d.cur ?? 0};
        case 'NS': return {u: volt(x, a), i: d.G * ((d.ecur ?? 0) - volt(x, a)), e: d.ecur ?? 0};
        case 'LS': return {u, i: d.s.mode === 'CC' ? d.I : (d.V - u) / d.Rs, cc: d.s.mode === 'CC'};
        case 'Q': return {ic: d.s.ic, ib: d.s.ib, ie: -(d.s.ic + d.s.ib), uce: volt(x, a) - volt(x, c), ube: volt(x, b) - volt(x, c)};
        case 'OP': return {u: volt(x, c), i: d.s.io, ud: volt(x, a) - volt(x, b)};
      }
      return null;
    };
    sim.size = () => size;
    return sim;
  }

  /* ---------- Zahlen mit SI-Vorsätzen ---------- */
  const PREFIX = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
  /* „4k7“, „2.2u“, „100n“, „1,5 M“ → Zahl */
  function parseSI(text) {
    const s = String(text).trim().replace(/\s+/g, '').replace(',', '.').replace(/[ΩVAFHzs]+$/i, '');
    const m = s.match(/^([-+]?\d*\.?\d+)(?:([GMkmuµnp])(\d*))?$/) || s.match(/^([-+]?\d+)([GMkmuµnp])(\d+)$/);
    if (!m) return NaN;
    const mult = {G: 1e9, M: 1e6, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, n: 1e-9, p: 1e-12}[m[2]] ?? 1;
    const num = m[3] ? Number(m[1] + '.' + m[3]) : Number(m[1]);
    return num * mult;
  }
  /* 0.0047 → „4,7 m“ (+ Einheit), digits = signifikante Stellen */
  function formatSI(value, unit = '', digits = 3) {
    if (!Number.isFinite(value)) return '—';
    if (value === 0) return `0 ${unit}`.trim();
    const abs = Math.abs(value);
    const [mult, pre] = PREFIX.find(([f]) => abs >= f * 0.9995) || PREFIX[PREFIX.length - 1];
    const scaled = value / mult;
    const text = new Intl.NumberFormat('de-DE', {maximumSignificantDigits: digits}).format(scaled);
    return `${text} ${pre}${unit}`;
  }
  /* E12-Reihe: nächster Wert nach oben (dir = +1) oder unten (dir = −1) */
  const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  function stepE12(value, dir) {
    const exp = Math.floor(Math.log10(value) + 1e-9), base = value / 10 ** exp;
    let i = E12.findIndex(e => Math.abs(e - base) < 1e-6);
    if (i < 0) { i = E12.findIndex(e => e > base); if (i < 0) i = 12; if (dir > 0) i--; }
    i += dir;
    const e = exp + Math.floor(i / 12);
    return Number((E12[((i % 12) + 12) % 12] * 10 ** e).toPrecision(3));
  }
  /* 1-2-5-Raster für Oszilloskop und Generator */
  function step125(value, dir) {
    const exp = Math.floor(Math.log10(value) + 1e-9), base = value / 10 ** exp, seq = [1, 2, 5];
    let i = seq.findIndex(s => Math.abs(s - base) < 1e-6);
    if (i < 0) i = base < 2 ? 0 : base < 5 ? 1 : 2;
    i += dir;
    return Number((seq[((i % 3) + 3) % 3] * 10 ** (exp + Math.floor(i / 3))).toPrecision(3));
  }

  return {create, MODELS, VT, parseSI, formatSI, stepE12, step125};
})();
