/* Startseite: eine Leiterplatte mit Tastkopf und Oszilloskop.
   Die Platine wird beim Laden aus Bussen, ICs, Widerständen und Vias geroutet. Jede Leiterbahn gehört zu einem Netz mit eigenem Beispielsignal.
   Der Zeiger ist der Tastkopf: Die nächste Bahn wird angetastet, ihr Signal läuft auf dem Oszilloskop. */
'use strict';
(() => {
  const hero = document.querySelector('.signal');
  if (!hero) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MASKE = '#1a12ff', BAHN = '#4640ff', KUPFER = '#ff5a2e', DRUCK = '#efece2';

  const zpi = Math.PI * 2;
  const NETZE = [
    {name: 'CLK_1K', art: 'Rechteck', f: 1000, u: 3.3, zyklen: 4, y: x => Math.sin(x) >= 0 ? .8 : -.8},
    {name: 'VCO_OUT', art: 'Sinus', f: 440, u: 2, zyklen: 3, y: x => .8 * Math.sin(x)},
    {name: 'LFO_2', art: 'Dreieck', f: 2.4, u: 5, zyklen: 2, y: x => .8 * 2 / Math.PI * Math.asin(Math.sin(x))},
    {name: 'SAW_A3', art: 'Sägezahn', f: 220, u: 1.5, zyklen: 3, y: x => .8 * (((x / Math.PI + 1) % 2 + 2) % 2 - 1)},
    {name: 'PWM_25', art: 'PWM 25 %', f: 8000, u: 3.3, zyklen: 4, y: x => ((x % zpi) + zpi) % zpi < zpi / 4 ? .8 : -.8},
    {name: 'AM_MOD', art: 'AM', f: 10000, u: 2.4, zyklen: 18, y: x => .8 * Math.sin(x) * (.55 + .45 * Math.sin(x / 18 * 2))},
    {name: 'RC_OUT', art: 'RC-Ladekurve', f: 500, u: 1, zyklen: 3, y: x => { const p = (((x % zpi) + zpi) % zpi) / zpi; return p < .5 ? .8 * (1.25 * (1 - Math.exp(-p * 9)) - .625) * 1.6 : .8 * (1.25 * Math.exp(-(p - .5) * 9) - .625) * 1.6; }},
    {name: 'LC_RING', art: 'gedämpft', f: 16000, u: 4, zyklen: 9, y: x => { const p = (((x % (zpi * 9)) + zpi * 9) % (zpi * 9)) / (zpi * 9); return .85 * Math.sin(x) * Math.exp(-3.6 * p); }}
  ];

  const platine = document.getElementById('platine'), oszi = document.getElementById('oszi');
  const netzText = document.getElementById('oszi-netz'), werteText = document.getElementById('oszi-werte');
  let bahnen = [], hintergrund = null, W = 0, H = 0, d = 1;
  let angetastet = null, bedient = false, wechsel = 0;

  /* Wiederholbarer Zufall: Die Platine sieht bei jedem Besuch gleich aus. */
  function zufall(s) { return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; }; }

  function route() {
    const rnd = zufall(20261022), g = W < 700 ? 9 : 11, busse = Math.max(3, Math.floor(H / 120));
    /* Unter Titel und Oszilloskop werden keine Bauteile platziert */
    const basis = platine.getBoundingClientRect();
    const sperren = [hero.querySelector('.titel'), hero.querySelector('.oszi')].map(el => el.getBoundingClientRect()).map(r => ({l: r.left - basis.left - 16, r: r.right - basis.left + 16, o: r.top - basis.top - 24, u: r.bottom - basis.top + 24}));
    const gesperrt = (x, y, b, h) => sperren.some(s => x < s.r && x + b > s.l && y < s.u && y + h > s.o);
    const stil = {pads: [], vias: [], ics: [], bauteile: []};
    const liste = [];
    let nU = 1, nR = 1, netz = 0;
    for (let b = 0; b < busse; b++) {
      const zone = H / busse, k = 3 + Math.floor(rnd() * 4), oben = zone * b + 14, unten = zone * (b + 1) - k * g - 14;
      /* Der Ablauf eines Busses: Knicke und ICs von links nach rechts */
      let x = -20 + rnd() * 60, y = oben + rnd() * Math.max(1, unten - oben);
      y = Math.round(y / g) * g;
      const y0 = y, ablauf = [];
      while (x < W + 100) {
        x += 80 + rnd() * 170 + k * g;
        const breite = 62 + Math.floor(rnd() * 3) * 20;
        if (rnd() < .3 && x < W - 150 && !gesperrt(x, y - g, breite, (k + 1) * g)) {
          ablauf.push({typ: 'ic', x, breite, y, ref: `U${nU++}`});
          x += breite;
        } else {
          let dy = Math.round((rnd() - .5) * 8) * g;
          if (y + dy < oben || y + dy > unten) dy = -dy;
          if (y + dy < oben || y + dy > unten) dy = 0;
          if (dy) { ablauf.push({typ: 'knick', x, dy}); x += Math.abs(dy); y += dy; }
        }
      }
      const endet = rnd() < .45 ? W - 40 - rnd() * W * .22 : null;
      for (let i = 0; i < k; i++) {
        const pfad = new Path2D(), punkte = [], nz = NETZE[netz++ % NETZE.length];
        let px = -20, py = y0 + i * g, fertig = false;
        pfad.moveTo(px, py);
        const linie = (nx, ny) => {
          const n = Math.max(1, Math.round(Math.hypot(nx - px, ny - py) / 9));
          for (let s = 1; s <= n; s++) punkte.push([px + (nx - px) * s / n, py + (ny - py) * s / n]);
          pfad.lineTo(nx, ny); px = nx; py = ny;
        };
        const ende = endet === null ? W + 20 : endet - i * g * .8;
        for (const op of ablauf) {
          if (fertig) break;
          if (op.typ === 'knick') {
            const xs = op.x + (op.dy > 0 ? -1 : 1) * i * g * .414;
            if (xs + Math.abs(op.dy) > ende) break;
            linie(xs, py);
            linie(xs + Math.abs(op.dy), py + op.dy);
            if (rnd() < .1) stil.vias.push([px, py]);
          } else {
            if (op.x + op.breite > ende) break;
            linie(op.x, py);
            stil.pads.push([op.x, py, 9, g * .62], [op.x + op.breite, py, 9, g * .62]);
            px = op.x + op.breite; pfad.moveTo(px, py);
            if (i === 0) stil.ics.push({x: op.x, y: py - g * .9, b: op.breite, h: (k - 1) * g + g * 1.8, ref: op.ref});
          }
        }
        if (px < ende && rnd() < .28) {
          const rx = px + 14 + rnd() * Math.max(1, Math.min(ende - px - 40, 90));
          if (rx + 22 < ende && !gesperrt(rx, py - 14, 24, 28)) { linie(rx, py); stil.bauteile.push({x: rx, y: py, ref: `R${nR++}`}); pfad.moveTo(rx + 22, py); px = rx + 22; }
        }
        linie(ende, py);
        if (endet !== null) stil.vias.push([px, py]);
        liste.push({pfad, punkte, netz: nz, tempo: 26 + rnd() * 64, luecke: 70 + rnd() * 240, breite: g * .36});
      }
    }
    bahnen = liste;

    /* Alles, was sich nicht bewegt, einmal vorzeichnen */
    hintergrund = document.createElement('canvas');
    hintergrund.width = platine.width; hintergrund.height = platine.height;
    const c = hintergrund.getContext('2d');
    c.scale(d, d);
    c.fillStyle = MASKE; c.fillRect(0, 0, W, H);
    c.lineJoin = 'round'; c.strokeStyle = BAHN;
    for (const b of bahnen) { c.lineWidth = b.breite; c.stroke(b.pfad); }
    c.fillStyle = KUPFER;
    for (const [x, y, w, h] of stil.pads) c.fillRect(x - w / 2, y - h / 2, w, h);
    for (const [x, y] of stil.vias) {
      c.fillStyle = KUPFER; c.beginPath(); c.arc(x, y, g * .46, 0, zpi); c.fill();
      c.fillStyle = MASKE; c.beginPath(); c.arc(x, y, g * .18, 0, zpi); c.fill();
    }
    c.font = '10px Meslo, monospace'; c.strokeStyle = DRUCK; c.lineWidth = 1;
    for (const ic of stil.ics) {
      c.fillStyle = MASKE; c.fillRect(ic.x + 7, ic.y, ic.b - 14, ic.h);
      c.strokeRect(ic.x + 7.5, ic.y + .5, ic.b - 15, ic.h - 1);
      c.beginPath(); c.arc(ic.x + 14, ic.y + 7, 2, 0, zpi); c.fillStyle = DRUCK; c.fill();
      c.fillText(ic.ref, ic.x + 12, ic.y + ic.h / 2 + 4);
    }
    for (const t of stil.bauteile) {
      c.fillStyle = KUPFER; c.fillRect(t.x, t.y - 4, 6, 8); c.fillRect(t.x + 16, t.y - 4, 6, 8);
      c.strokeRect(t.x - 2.5, t.y - 6.5, 27, 13);
      c.fillStyle = DRUCK; c.fillText(t.ref, t.x, t.y - 10);
    }
    /* Befestigungslöcher in den Ecken */
    for (const [x, y] of [[22, 22], [W - 22, 22], [W - 22, H - 22], [22, H - 22]]) {
      c.fillStyle = KUPFER; c.beginPath(); c.arc(x, y, 10, 0, zpi); c.fill();
      c.fillStyle = '#0a0a14'; c.beginPath(); c.arc(x, y, 6, 0, zpi); c.fill();
    }
  }

  function zeichnePlatine(t) {
    const c = platine.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(hintergrund, 0, 0);
    c.setTransform(d, 0, 0, d, 0, 0);
    /* Ladungen, die über die Bahnen laufen */
    c.strokeStyle = DRUCK; c.lineCap = 'round';
    for (const b of bahnen) {
      if (b === angetastet) continue;
      c.lineWidth = b.breite * .55;
      c.setLineDash([7, b.luecke]);
      c.lineDashOffset = -t * b.tempo;
      c.stroke(b.pfad);
    }
    c.setLineDash([]);
    if (angetastet) {
      c.strokeStyle = KUPFER; c.lineWidth = angetastet.breite * 1.5; c.stroke(angetastet.pfad);
      if (angetastet.spitze) {
        const [x, y] = angetastet.spitze;
        c.strokeStyle = DRUCK; c.lineWidth = 1.5;
        c.beginPath(); c.arc(x, y, 9, 0, zpi); c.moveTo(x - 15, y); c.lineTo(x + 15, y); c.moveTo(x, y - 15); c.lineTo(x, y + 15); c.stroke();
      }
    }
  }

  function antasten(b, punkt) {
    b.spitze = punkt;
    if (b === angetastet) return;
    angetastet = b;
    const n = b.netz;
    const f = n.f >= 1000 ? `${String(n.f / 1000).replace('.', ',')} kHz` : `${String(n.f).replace('.', ',')} Hz`;
    netzText.textContent = n.name;
    werteText.textContent = `${n.art} · ${f} · ${String(n.u).replace('.', ',')} Vss`;
  }

  function zeichneOszi(t) {
    const c = oszi.getContext('2d'), w = oszi.width, h = oszi.height;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#0a0a14'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(239,236,226,.17)'; c.lineWidth = d;
    c.beginPath();
    for (let i = 1; i < 10; i++) { c.moveTo(i * w / 10, 0); c.lineTo(i * w / 10, h); }
    for (let i = 1; i < 6; i++) { c.moveTo(0, i * h / 6); c.lineTo(w, i * h / 6); }
    c.stroke();
    c.strokeStyle = 'rgba(239,236,226,.42)';
    c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke();
    if (!angetastet) return;
    const n = angetastet.netz, phase = t * 1.4;
    /* Nachleuchten: die letzten Durchläufe bleiben schwach stehen */
    for (const [schritt, alpha] of [[.28, .16], [.14, .36], [0, 1]]) {
      c.strokeStyle = `rgba(255,90,46,${alpha})`; c.lineWidth = 1.7 * d; c.lineJoin = 'round';
      c.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 - n.y(x / w * n.zyklen * zpi + phase - schritt) * h * .42;
        x ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    }
  }

  function groesse() {
    d = Math.min(devicePixelRatio || 1, 2);
    W = platine.clientWidth; H = platine.clientHeight;
    platine.width = W * d; platine.height = H * d;
    oszi.width = oszi.clientWidth * d; oszi.height = oszi.clientHeight * d;
    route();
    const alt = angetastet;
    angetastet = null;
    const b = bahnen[alt ? bahnen.findIndex(x => x.netz === alt.netz) : 1] || bahnen[0];
    antasten(b, b.punkte[Math.floor(b.punkte.length * .7)]);
    zeichnePlatine(4); zeichneOszi(4);
  }

  hero.addEventListener('pointermove', e => {
    const r = platine.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let beste = null, punkt = null, min = 70 * 70;
    for (const b of bahnen) for (const p of b.punkte) {
      const a = (p[0] - mx) ** 2 + (p[1] - my) ** 2;
      if (a < min) { min = a; beste = b; punkt = p; }
    }
    if (beste) { bedient = true; antasten(beste, punkt); if (still) { zeichnePlatine(4); zeichneOszi(4); } }
  });

  new ResizeObserver(groesse).observe(platine);
  (document.fonts?.load('10px Meslo') || Promise.resolve()).then(groesse);
  if (still) return;

  let sichtbar = true, zuletzt = 0;
  new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; }).observe(hero);
  const lauf = ms => {
    requestAnimationFrame(lauf);
    if (!sichtbar || document.hidden || ms - zuletzt < 30 || !hintergrund) return;
    zuletzt = ms;
    const t = ms / 1000;
    /* Ohne Zeiger wandert der Tastkopf von selbst von Netz zu Netz */
    if (!bedient && t - wechsel > 3.2 && bahnen.length) {
      wechsel = t;
      const b = bahnen[Math.floor(t * 7) % bahnen.length];
      antasten(b, b.punkte[Math.floor(b.punkte.length * (.3 + .4 * Math.abs(Math.sin(t))))]);
    }
    zeichnePlatine(t);
    zeichneOszi(t);
  };
  requestAnimationFrame(lauf);
})();
