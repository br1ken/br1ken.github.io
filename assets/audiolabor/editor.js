/* Audiolabor: der Schaltplan als Arbeitsfläche. Er ändert nur das Projekt; was elektrisch verbunden ist, entscheidet netz.js.

   Gedacht wie echtes Stecken:
   - Bauteil aus der Liste auf die Fläche ziehen. Landet ein Zweipol auf einem Draht, wird er eingeschleift.
   - Vom Pin losziehen und auf einem anderen Pin oder Draht loslassen: Der Draht legt sich selbst, sauber um alles herum.
   - Aus einem Draht herausziehen: Abzweig. Einen Draht antippen: Griffe an den Enden erscheinen, dort lässt er sich umstecken
     oder abziehen. Dazu kleine Knöpfe zum Messen und Hören genau an dieser Stelle.
   - Bauteile verschieben: Die Drähte gehen mit und legen sich neu.

   Tasten: R drehen, M spiegeln, Entf löschen, Esc abbrechen, Strg/⌘ + Z zurück, + C/V kopieren.
   Mausrad verschiebt, Strg/⌘ + Mausrad oder Zwei-Finger-Geste zoomt, Leertaste + Ziehen verschiebt die Ansicht. */

import { BAUTEILE, pinOrt, pinRichtung, weltRechteck, platzVon, standardWerte } from './bauteile.js';
import { loeseNetze } from './netz.js';
import { freieKennung } from './aufbau.js?v=2';
import { baueHindernisse, findeWeg, geraderWeg, RASTER } from './router.js';
import { fang, ordneDraht, neueDrahtId, pinVon, anschlussBei, entferneTeile, schleifeEin, freieDrehung, freierPlatz, koerperStoesst, laeuftDurch, versatzFuerKopie, gruppenAusPlan, gleicheGruppen, schliesstKurz, bewahreVerbindungen } from './umbau.js';
import { esc } from './hilfen.js';

const ZEICHEN_BREITE = 6.35, ZEILE = 12.5;

const ueberlappt = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

export class Schaltplan {
  constructor(svg, host) {
    this.svg = svg;
    this.host = host;
    this.ansicht = {x: -200, y: -160, z: 1};
    this.auswahl = {teile: new Set(), draehte: new Set()};
    this.werkzeug = null;
    this.zug = null;
    this.entwurf = null;
    this.zeiger = new Map();
    this.leertaste = false;
    this.ablage = null;
    this.spannungen = new Map();
    this.hoverNetz = null;
    this.hoverZiel = null;
    this.netze = null;
    this.letzteMaus = {x: 0, y: 0};
    this.kanalVon = new Map();
    this.leistePunkt = null;
    this.leiste = this._baueLeiste();

    /* Solange niemand die Ansicht selbst verschoben hat, passt sich die Schaltung der Fläche an. */
    this.ansichtFest = false;
    this.ro = new ResizeObserver(() => { if (this.ansichtFest) this.zeichne(); else this.alles(); });
    this.ro.observe(svg);
    svg.addEventListener('pointerdown', e => this._runter(e));
    svg.addEventListener('pointermove', e => this._bewegt(e));
    svg.addEventListener('pointerup', e => this._hoch(e));
    svg.addEventListener('pointercancel', e => this._abbruch(e));
    svg.addEventListener('wheel', e => this._rad(e), {passive: false});
    svg.addEventListener('dblclick', () => this._doppel());
    svg.addEventListener('contextmenu', e => e.preventDefault());
    svg.addEventListener('pointerleave', () => {
      if (this.hoverNetz && !this.zug) { this.hoverNetz = null; this.zeichne(); }
      this.host.hover?.(null);
    });
    window.addEventListener('keydown', e => this._taste(e));
    window.addEventListener('keyup', e => {
      if (e.code === 'Space') { this.leertaste = false; this.svg.classList.remove('pan'); }
    });
  }

  get projekt() { return this.host.projekt(); }

  /* ---------- Koordinaten ---------- */
  _weltAus(clientX, clientY) {
    const r = this.svg.getBoundingClientRect();
    return {x: (clientX - r.left) / this.ansicht.z + this.ansicht.x, y: (clientY - r.top) / this.ansicht.z + this.ansicht.y};
  }

  _welt(e) { return this._weltAus(e.clientX, e.clientY); }

  alles() {
    const p = this.projekt;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const t of p.teile) {
      const k = weltRechteck(t);
      x0 = Math.min(x0, k.x0); y0 = Math.min(y0, k.y0); x1 = Math.max(x1, k.x1); y1 = Math.max(y1, k.y1);
    }
    for (const d of p.draehte) {
      for (const [x, y] of d.punkte) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    const r = this.svg.getBoundingClientRect();
    if (x0 === Infinity || !r.width) {
      this.ansicht = {x: -r.width / 2, y: -r.height / 2, z: 1};
    } else {
      const rand = 56;
      const z = Math.min(Math.max(Math.min(r.width / (x1 - x0 + 2 * rand), r.height / (y1 - y0 + 2 * rand)), 0.3), 1.4);
      this.ansicht = {z, x: (x0 + x1) / 2 - r.width / z / 2, y: (y0 + y1) / 2 - r.height / z / 2};
    }
    this.ansichtFest = false;
    this.zeichne();
    this.host.zoomGeaendert?.(this.ansicht.z);
  }

  zoome(faktor, cx, cy) {
    const r = this.svg.getBoundingClientRect();
    const a = this.ansicht;
    const px = cx ?? r.width / 2, py = cy ?? r.height / 2;
    const wx = px / a.z + a.x, wy = py / a.z + a.y;
    const z = Math.min(Math.max(a.z * faktor, 0.25), 4);
    this.ansicht = {z, x: wx - px / z, y: wy - py / z};
    this.ansichtFest = true;
    this.zeichne();
    this.host.zoomGeaendert?.(z);
  }

  /* ---------- Zeichnen ---------- */
  zeichne() {
    const r = this.svg.getBoundingClientRect();
    if (!r.width) return;
    const a = this.ansicht;
    const vb = {x: a.x, y: a.y, w: r.width / a.z, h: r.height / a.z};
    this.svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const p = this.projekt;
    this.netze = loeseNetze(p);
    const n = this.netze;

    /* Kanalnummern der Sonden in fester Reihenfolge */
    this.kanalVon.clear();
    p.teile.filter(t => t.typ === 'sonde' || t.typ === 'amper').map(t => t.id)
      .sort((x, y) => x.localeCompare(y, 'de', {numeric: true}))
      .forEach((id, i) => this.kanalVon.set(id, i + 1));

    const netzDraht = new Map();
    n.segmente.forEach((s, i) => netzDraht.set(s.draht, n.segmentNetz[i]));

    let s = `<defs><pattern id="al-raster" width="${RASTER}" height="${RASTER}" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r="${0.9 / a.z}" class="punkt"/></pattern></defs>`;
    s += `<rect class="blatt" x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="url(#al-raster)"/>`;

    let wege = '';
    for (const d of p.draehte) {
      const pfad = d.punkte.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join('');
      const netz = netzDraht.get(d.id);
      const kl = `draht${this.auswahl.draehte.has(d.id) ? ' aus' : ''}${netz && netz === this.hoverNetz ? ' netz-hover' : ''}`;
      wege += `<path class="${kl}" d="${pfad}"/><path class="draht-treffer" data-draht="${esc(d.id)}" d="${pfad}"/>`;
    }
    s += `<g class="draehte">${wege}</g>`;

    /* Bloße Kreuzung: Bogen ohne Verbindung. Abzweig: Lötpunkt. */
    let bruecken = '';
    for (const k of n.kreuzungen) bruecken += `<path class="bruecke-luecke" d="M${k.x - 6} ${k.y}H${k.x + 6}"/><path class="bruecke" d="M${k.x - 6} ${k.y}a6 6 0 0 1 12 0"/>`;
    s += `<g class="kreuzungen">${bruecken}</g>`;
    s += `<g class="loet">${n.loetpunkte.map(q => `<circle cx="${q.x}" cy="${q.y}" r="3"/>`).join('')}</g>`;

    let teile = '';
    for (const t of p.teile) teile += this._teilSvg(t);
    s += `<g class="teile">${teile}</g>`;
    s += `<g class="pins">${this._pinsSvg()}</g>`;
    s += `<g class="griffe">${this._griffeSvg()}</g>`;
    s += this._beschriftungSvg();
    s += this._entwurfSvg();
    if (this.zug?.art === 'rahmen') {
      const {x0, y0, x1, y1} = this.zug;
      s += `<rect class="rahmen" x="${Math.min(x0, x1)}" y="${Math.min(y0, y1)}" width="${Math.abs(x1 - x0)}" height="${Math.abs(y1 - y0)}"/>`;
    }
    this.svg.innerHTML = s;
    this._leistePlatzieren();
  }

  _teilSvg(t, geist = false) {
    const def = BAUTEILE[t.typ];
    const rot = t.rot || 0, sp = t.spiegel ? -1 : 1;
    const ausg = this.auswahl.teile.has(t.id) && !geist;
    const kanal = this.kanalVon.get(t.id);
    const xs = def.pins.map(q => q.x), ys = def.pins.map(q => q.y);
    const k = typeof def.koerper === 'function' ? def.koerper(t) : def.koerper;
    const hx0 = Math.min(...xs, k[0]) - 3, hy0 = Math.min(...ys, k[1]) - 3;
    const hx1 = Math.max(...xs, k[2]) + 3, hy1 = Math.max(...ys, k[3]) + 3;
    let inner = `<rect class="treffer" x="${hx0}" y="${hy0}" width="${hx1 - hx0}" height="${hy1 - hy0}"/>${def.zeichen(t)}`;
    if (t.typ === 'sonde') inner += `<text class="kz" x="20" y="-16" text-anchor="middle">${kanal ?? ''}</text>`;
    const stoss = ausg && this.zug?.art === 'teile' && this.zug.stoss;
    return `<g class="teil${ausg ? ' aus' : ''}${stoss ? ' stoss' : ''}${geist ? ' geist' : ''}" ${geist ? '' : `data-teil="${esc(t.id)}"`} ${kanal ? `data-kanal="${((kanal - 1) % 6) + 1}"` : ''} style="--gegen:${-rot}deg;--sp:${sp}" transform="translate(${t.x} ${t.y}) rotate(${rot}) scale(${sp} 1)">${inner}</g>`;
  }

  _pinsSvg() {
    let g = '';
    const ziel = this.hoverZiel;
    for (const t of this.projekt.teile) {
      const def = BAUTEILE[t.typ];
      for (const pin of def.pins) {
        const k = `${t.id}.${pin.id}`;
        const q = pinOrt(t, pin);
        const netz = this.netze?.pinNetz.get(k);
        const info = netz ? this.netze.netze.get(netz) : null;
        const frei = info && info.pins.length < 2 && !def.istMessung && def.pins.length > 1;
        g += `<circle class="pin${frei ? ' frei' : ''}${ziel?.kennung === k ? ' ziel' : ''}" cx="${q.x}" cy="${q.y}" r="${frei ? 2.6 : 1.8}"/>`;
        g += `<circle class="pin-treffer" data-pin="${esc(k)}" cx="${q.x}" cy="${q.y}" r="8"/>`;
      }
    }
    return g;
  }

  /* Griffe an den Enden des ausgewählten Drahts: Dort lässt er sich umstecken. */
  _griffeSvg() {
    if (this.auswahl.draehte.size !== 1 || this.auswahl.teile.size || this.zug?.art === 'umstecken') return '';
    const d = this.projekt.draehte.find(x => this.auswahl.draehte.has(x.id));
    if (!d) return '';
    const griff = (q, ende) => `<g class="griff" data-griff="${ende}"><circle class="griff-treffer" cx="${q[0]}" cy="${q[1]}" r="10"/><rect x="${q[0] - 4}" y="${q[1] - 4}" width="8" height="8"/></g>`;
    return griff(d.punkte[0], 0) + griff(d.punkte[d.punkte.length - 1], 1);
  }

  /* Beschriftung ohne Überschneidung: Jede Bezeichnung nimmt die erste Lage, die weder Bauteile, Drähte noch andere Texte berührt. */
  _beschriftungSvg() {
    const p = this.projekt;
    const belegt = [];
    for (const t of p.teile) {
      const k = platzVon(t);
      belegt.push({x0: k.x0 - 1, y0: k.y0 - 1, x1: k.x1 + 1, y1: k.y1 + 1});
    }
    for (const d of p.draehte) {
      for (let i = 1; i < d.punkte.length; i++) {
        const [ax, ay] = d.punkte[i - 1], [bx, by] = d.punkte[i];
        belegt.push({x0: Math.min(ax, bx) - 2, y0: Math.min(ay, by) - 2, x1: Math.max(ax, bx) + 2, y1: Math.max(ay, by) + 2});
      }
    }
    let s = '';
    const wahl = (kandidaten, baue) => {
      let beste = null, wenigste = Infinity;
      for (const c of kandidaten) {
        const treffer = belegt.filter(b => c.rechtecke.some(r => ueberlappt(r, b))).length;
        if (treffer < wenigste) { wenigste = treffer; beste = c; }
        if (treffer === 0) break;
      }
      if (!beste) return;
      belegt.push(...beste.rechtecke);
      s += baue(beste);
    };
    for (const t of p.teile) {
      const def = BAUTEILE[t.typ];
      const wert = !def.keinWert && def.wert ? def.wert(t) : '';
      const name = def.keineRef || t.typ === 'sonde' ? '' : t.id;
      if (def.wertInnen) {
        const o = pinOrt(t, {x: 13, y: 4});
        s += `<text class="wert innen" x="${o.x}" y="${o.y}" text-anchor="${o.x < t.x ? 'end' : 'start'}">${esc(wert)}</text>`;
        continue;
      }
      if (!name && !wert) continue;
      const k = platzVon(t);
      const bN = name.length * ZEICHEN_BREITE, bW = wert.length * ZEICHEN_BREITE;
      const breit = Math.max(bN, bW);
      const cx = (k.x0 + k.x1) / 2, cy = (k.y0 + k.y1) / 2;
      const h = ((name ? 1 : 0) + (wert ? 1 : 0)) * ZEILE;
      const abstand = 5;
      const block = (x, y, anker) => {
        const links = anker === 'middle' ? x - breit / 2 : anker === 'end' ? x - breit : x;
        return {anker, x, y, rechtecke: [{x0: links, y0: y, x1: links + breit, y1: y + h}]};
      };
      const geteilt = {
        geteilt: true, x: cx,
        rechtecke: [
          ...(name ? [{x0: cx - bN / 2, y0: k.y0 - abstand - ZEILE, x1: cx + bN / 2, y1: k.y0 - abstand}] : []),
          ...(wert ? [{x0: cx - bW / 2, y0: k.y1 + abstand, x1: cx + bW / 2, y1: k.y1 + abstand + ZEILE}] : [])
        ],
        yName: k.y0 - abstand - 3, yWert: k.y1 + abstand + ZEILE - 3
      };
      const oben = block(cx, k.y0 - abstand - h, 'middle'), unten = block(cx, k.y1 + abstand, 'middle');
      const rechts = block(k.x1 + abstand, cy - h / 2, 'start'), links = block(k.x0 - abstand, cy - h / 2, 'end');
      const obenRechts = block(k.x1 - breit, k.y0 - abstand - h, 'start'), obenLinks = block(k.x0 + breit, k.y0 - abstand - h, 'end');
      const untenRechts = block(k.x1 - breit, k.y1 + abstand, 'start'), untenLinks = block(k.x0 + breit, k.y1 + abstand, 'end');
      const weitUnten = block(cx, k.y1 + abstand + h, 'middle'), weitRechts = block(k.x1 + abstand + 20, cy - h / 2, 'start');
      const flach = k.x1 - k.x0 >= k.y1 - k.y0;
      wahl(flach
        ? [geteilt, oben, unten, obenRechts, obenLinks, untenRechts, untenLinks, rechts, links, weitUnten]
        : [rechts, links, weitRechts, oben, unten, geteilt], c => {
        if (c.geteilt) {
          return (name ? `<text class="ref" x="${c.x}" y="${c.yName}" text-anchor="middle">${esc(name)}</text>` : '')
            + (wert ? `<text class="wert" x="${c.x}" y="${c.yWert}" text-anchor="middle">${esc(wert)}</text>` : '');
        }
        let z = '', y = c.y + ZEILE - 3;
        if (name) { z += `<text class="ref" x="${c.x}" y="${y}" text-anchor="${c.anker}">${esc(name)}</text>`; y += ZEILE; }
        if (wert) z += `<text class="wert" x="${c.x}" y="${y}" text-anchor="${c.anker}">${esc(wert)}</text>`;
        return z;
      });
    }
    /* Spannungen aus dem Arbeitspunkt: auf dem längsten waagrechten Stück des Netzes, wo Platz ist */
    for (const [netz, text] of this.spannungen) {
      const b = text.length * 6 + 8;
      wahl(this._anzeigeOrte(netz).map(q => ({x: q.x - b / 2, y: q.y - 17, rechtecke: [{x0: q.x - b / 2, y0: q.y - 17, x1: q.x + b / 2, y1: q.y - 4}]})),
        c => `<g class="anzeige" transform="translate(${c.x} ${c.y})"><rect width="${b}" height="13"/><text x="4" y="10">${esc(text)}</text></g>`);
    }
    return s;
  }

  _anzeigeOrte(netz) {
    const n = this.netze, orte = [];
    n.segmente.forEach((q, i) => {
      if (n.segmentNetz[i] !== netz) return;
      if (q.y1 === q.y2) {
        const l = Math.abs(q.x2 - q.x1);
        orte.push({l, x: (q.x1 + q.x2) / 2, y: q.y1}, {l: l / 2, x: (q.x1 * 3 + q.x2) / 4, y: q.y1}, {l: l / 2, x: (q.x1 + q.x2 * 3) / 4, y: q.y1});
      } else orte.push({l: 0, x: q.x1, y: (q.y1 + q.y2) / 2});
    });
    orte.sort((a, b) => b.l - a.l);
    if (!orte.length && n.netze.has(netz)) orte.push(n.netze.get(netz));
    return orte;
  }

  _entwurfSvg() {
    const w = this.werkzeug;
    let s = '';
    if (w?.art === 'einsetzen' && w.sichtbar) {
      s += this._teilSvg({id: '', typ: w.typ, x: w.x, y: w.y, rot: w.rot, spiegel: w.spiegel, werte: standardWerte(w.typ)}, true);
    }
    const e = this.entwurf;
    if (e?.punkte?.length > 1) {
      const pfad = e.punkte.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join('');
      const q = e.punkte[e.punkte.length - 1];
      s += `<path class="draht entwurf" d="${pfad}"/><circle class="entwurf-punkt${e.ziel ? ' treffer' : ''}" cx="${q[0]}" cy="${q[1]}" r="${e.ziel ? 5 : 3.5}"/>`;
    }
    return s;
  }

  /* ---------- Fangen beim Stecken ---------- */

  /* Sucht unter dem Zeiger, wo ein Kabelende landen würde. Pins ziehen stärker als Drähte. */
  _fange(m, {ohneDraht = null, ohnePin = null} = {}) {
    const p = this.projekt, z = this.ansicht.z;
    let best = null, d0 = 15 / z;
    for (const t of p.teile) {
      for (const pin of BAUTEILE[t.typ].pins) {
        const k = `${t.id}.${pin.id}`;
        if (k === ohnePin) continue;
        const o = pinOrt(t, pin);
        const a = Math.hypot(o.x - m.x, o.y - m.y);
        if (a < d0) { d0 = a; best = {x: o.x, y: o.y, art: 'pin', kennung: k, richtung: pinRichtung(t, pin)}; }
      }
    }
    if (best) return best;
    d0 = 10 / z;
    for (const d of p.draehte) {
      if (d.id === ohneDraht) continue;
      for (let i = 1; i < d.punkte.length; i++) {
        const [ax, ay] = d.punkte[i - 1], [bx, by] = d.punkte[i];
        const qx = ay === by ? Math.min(Math.max(fang(m.x), Math.min(ax, bx)), Math.max(ax, bx)) : ax;
        const qy = ay === by ? ay : Math.min(Math.max(fang(m.y), Math.min(ay, by)), Math.max(ay, by));
        /* Auf einer Kreuzung würde das Kabelende beide Drähte verbinden. */
        if (this.netze?.kreuzungen.some(k => k.x === qx && k.y === qy)) continue;
        const a = Math.hypot(qx - m.x, qy - m.y);
        if (a < d0) { d0 = a; best = {x: qx, y: qy, art: 'draht', draht: d.id}; }
      }
    }
    return best || {x: fang(m.x), y: fang(m.y), art: null};
  }

  _zielAus(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY) || e.target;
    const griff = el.closest?.('[data-griff]');
    if (griff) return {art: 'griff', ende: Number(griff.dataset.griff)};
    const pin = el.closest?.('[data-pin]');
    if (pin) return {art: 'pin', id: pin.dataset.pin};
    const d = el.closest?.('[data-draht]');
    if (d) return {art: 'draht', id: d.dataset.draht};
    const t = el.closest?.('[data-teil]');
    if (t) return {art: 'teil', id: t.dataset.teil};
    return {art: 'leer'};
  }

  /* Vorschau eines Kabels: von fest verlegten Punkten über den automatischen Weg bis zum Ziel */
  _entwurfNeu(feste, startRichtung, ziel, hindernisse) {
    const letzter = feste[feste.length - 1];
    const weg = findeWeg(hindernisse, letzter, [ziel.x, ziel.y], {
      startRichtung: feste.length === 1 ? startRichtung : -1,
      zielRichtung: ziel.art === 'pin' ? ziel.richtung : -1
    });
    /* Ohne freien Weg zeigt die Vorschau einen geraden Strich, aber verlegt wird nur ein gefundener Weg. */
    this.entwurf = {punkte: ordneDraht([...feste.slice(0, -1), ...(weg ?? geraderWeg(letzter, [ziel.x, ziel.y]))]), ziel: ziel.art ? ziel : null, frei: !!weg};
    this.hoverZiel = ziel.art === 'pin' ? ziel : null;
  }

  _kabelFertig(punkte, text = 'Verbunden') {
    const pts = ordneDraht(punkte);
    this.entwurf = null;
    this.hoverZiel = null;
    if (pts.length < 2) { this.zeichne(); return; }
    this.host.mutiere(text, p => { p.draehte.push({id: neueDrahtId(p), punkte: pts}); });
  }

  /* ---------- Werkzeuge ---------- */
  setzeWerkzeug(art, typ) {
    this.entwurf = null;
    this.hoverZiel = null;
    if (art === 'einsetzen') {
      const m = this.letzteMaus;
      this.werkzeug = {art, typ, rot: 0, spiegel: false, x: fang(m.x), y: fang(m.y), sichtbar: false};
      this.svg.classList.add('setzen');
    } else {
      this.werkzeug = null;
      this.svg.classList.remove('setzen', 'stecken');
    }
    this.zeichne();
    this.host.werkzeugGeaendert?.(this.werkzeug);
  }

  /* Aus der Bauteilliste auf die Fläche ziehen. Die Liste ruft das auf, solange die Taste gehalten wird. */
  ziehVonListe(clientX, clientY) {
    const w = this.werkzeug;
    if (w?.art !== 'einsetzen') return false;
    const r = this.svg.getBoundingClientRect();
    const drin = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    w.sichtbar = drin;
    if (drin) {
      const m = this._weltAus(clientX, clientY);
      this.letzteMaus = m;
      w.x = fang(m.x);
      w.y = fang(m.y);
    }
    this.zeichne();
    return drin;
  }

  loslassenVonListe(clientX, clientY) {
    if (this.ziehVonListe(clientX, clientY)) this._setzeTeil(this.werkzeug, false);
    else this.setzeWerkzeug(null);
  }

  /* ---------- Zeiger ---------- */
  _runter(e) {
    this.svg.focus?.({preventScroll: true});
    this.svg.setPointerCapture(e.pointerId);
    this.zeiger.set(e.pointerId, {x: e.clientX, y: e.clientY});
    const m = this._welt(e);
    this.letzteMaus = m;
    this._leisteZu();
    this.host.hover?.(null);

    if (this.zeiger.size === 2) { this._beginnePinch(); return; }

    if (e.button === 2 && this.werkzeug) { this.setzeWerkzeug(null); return; }
    if (e.button !== 0 || this.leertaste) {
      this.zug = {art: 'pan', sx: e.clientX, sy: e.clientY, ax: this.ansicht.x, ay: this.ansicht.y};
      return;
    }

    const w = this.werkzeug;
    if (w?.art === 'einsetzen') { this._setzeTeil(w, e.shiftKey); return; }
    if (w?.art === 'draht') { this._drahtKlick(m); return; }

    const ziel = this._zielAus(e);
    switch (ziel.art) {
      case 'griff':
        this._beginneUmstecken(ziel.ende);
        return;
      case 'pin': {
        const v = pinVon(this.projekt, ziel.id);
        this.zug = {art: 'kabel', start: [v.x, v.y], richtung: v.richtung, ohnePin: ziel.id, hindernisse: baueHindernisse(this.projekt), sx: e.clientX, sy: e.clientY};
        this.svg.classList.add('stecken');
        this.zeichne();
        return;
      }
      case 'teil':
        if (e.shiftKey) {
          if (this.auswahl.teile.has(ziel.id)) this.auswahl.teile.delete(ziel.id); else this.auswahl.teile.add(ziel.id);
        } else if (!this.auswahl.teile.has(ziel.id)) {
          this.auswahl.teile.clear();
          this.auswahl.draehte.clear();
          this.auswahl.teile.add(ziel.id);
        }
        this._auswahlGemeldet();
        this._beginneTeileZug(m);
        this.zeichne();
        return;
      case 'draht': {
        const gewaehlt = this.auswahl.draehte.has(ziel.id);
        if (e.shiftKey) {
          if (gewaehlt) this.auswahl.draehte.delete(ziel.id); else this.auswahl.draehte.add(ziel.id);
          this._auswahlGemeldet();
          this.zeichne();
          return;
        }
        /* Noch nicht ausgewählt: Ziehen gibt einen Abzweig, Tippen wählt aus. Ausgewählt: Ziehen verschiebt das Stück. */
        if (gewaehlt && !e.altKey) { this._beginneSegmentZug(ziel.id, m); return; }
        const auf = this._fange(m);
        this.zug = {art: 'ast', draht: ziel.id, start: [auf.x, auf.y], sx: e.clientX, sy: e.clientY};
        return;
      }
    }
    /* Leere Fläche: mit Finger verschieben, mit Maus Rahmen ziehen */
    if (e.pointerType === 'touch') {
      this.zug = {art: 'pan', sx: e.clientX, sy: e.clientY, ax: this.ansicht.x, ay: this.ansicht.y};
      return;
    }
    if (!e.shiftKey) {
      this.auswahl.teile.clear();
      this.auswahl.draehte.clear();
      this._auswahlGemeldet();
    }
    this.zug = {art: 'rahmen', x0: m.x, y0: m.y, x1: m.x, y1: m.y};
    this.zeichne();
  }

  _beginnePinch() {
    const [a, b] = [...this.zeiger.values()];
    this.zug = {art: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), z0: this.ansicht.z, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, ax: this.ansicht.x, ay: this.ansicht.y};
  }

  _bewegt(e) {
    if (this.zeiger.has(e.pointerId)) this.zeiger.set(e.pointerId, {x: e.clientX, y: e.clientY});
    const m = this._welt(e);
    this.letzteMaus = m;
    const q = [fang(m.x), fang(m.y)];
    const z = this.zug;

    if (z) {
      switch (z.art) {
        case 'pinch': {
          if (this.zeiger.size !== 2) return;
          const [a, b] = [...this.zeiger.values()];
          const r = this.svg.getBoundingClientRect();
          const nz = Math.min(Math.max(z.z0 * Math.hypot(a.x - b.x, a.y - b.y) / z.d0, 0.25), 4);
          const wx = (z.mx - r.left) / z.z0 + z.ax, wy = (z.my - r.top) / z.z0 + z.ay;
          this.ansicht = {z: nz, x: wx - ((a.x + b.x) / 2 - r.left) / nz, y: wy - ((a.y + b.y) / 2 - r.top) / nz};
          this.ansichtFest = true;
          this.zeichne();
          this.host.zoomGeaendert?.(nz);
          return;
        }
        case 'pan':
          this.ansichtFest = true;
          this.ansicht.x = z.ax - (e.clientX - z.sx) / this.ansicht.z;
          this.ansicht.y = z.ay - (e.clientY - z.sy) / this.ansicht.z;
          this.zeichne();
          return;
        case 'rahmen':
          z.x1 = m.x;
          z.y1 = m.y;
          this.zeichne();
          return;
        case 'teile':
          this._teileZug(q);
          return;
        case 'segment':
          this._segmentZug(q);
          return;
        case 'ast':
          if (Math.hypot(e.clientX - z.sx, e.clientY - z.sy) < 4) return;
          z.art = 'kabel';
          z.richtung = -1;
          z.hindernisse = baueHindernisse(this.projekt);
          this.svg.classList.add('stecken');
          this._kabelVorschau(z, m);
          return;
        case 'kabel':
          this._kabelVorschau(z, m);
          return;
        case 'umstecken': {
          const ziel = this._fange(m, {ohneDraht: z.draht.id});
          this._entwurfNeu([z.fest], z.festRichtung, ziel, z.hindernisse);
          this.zeichne();
          return;
        }
      }
      return;
    }

    const w = this.werkzeug;
    if (w?.art === 'einsetzen') {
      if (w.x !== q[0] || w.y !== q[1] || !w.sichtbar) { w.x = q[0]; w.y = q[1]; w.sichtbar = true; this.zeichne(); }
      return;
    }
    if (w?.art === 'draht') {
      this._entwurfNeu(w.punkte, w.richtung, this._fange(m, {ohnePin: w.ohnePin}), w.hindernisse);
      this.zeichne();
      return;
    }
    /* Netz unter dem Zeiger hervorheben */
    const ziel = this._zielAus(e);
    let netz = null;
    if (ziel.art === 'pin') netz = this.netze?.pinNetz.get(ziel.id) ?? null;
    else if (ziel.art === 'draht') {
      const i = this.netze?.segmente.findIndex(s => s.draht === ziel.id);
      netz = i >= 0 ? this.netze.segmentNetz[i] : null;
    }
    if (netz !== this.hoverNetz) {
      this.hoverNetz = netz;
      this.zeichne();
    }
    this.host.hover?.(netz, e);
  }

  _kabelVorschau(z, m) {
    this._entwurfNeu([z.start], z.richtung, this._fange(m, {ohnePin: z.ohnePin}), z.hindernisse);
    this.zeichne();
  }

  _hoch(e) {
    this.zeiger.delete(e.pointerId);
    const z = this.zug;
    this.zug = null;
    this.svg.classList.remove('stecken');
    if (!z) return;
    const m = this._welt(e);
    switch (z.art) {
      case 'kabel': {
        if (Math.hypot(e.clientX - z.sx, e.clientY - z.sy) < 4) {
          /* Nur angetippt: Das Kabel hängt am Zeiger, der nächste Klick setzt Ecke oder Ziel. */
          this.werkzeug = {art: 'draht', punkte: [z.start], richtung: z.richtung, ohnePin: z.ohnePin, hindernisse: z.hindernisse};
          this.svg.classList.add('setzen', 'stecken');
          this.host.werkzeugGeaendert?.(this.werkzeug);
          return;
        }
        const ziel = this._fange(m, {ohnePin: z.ohnePin});
        if (ziel.art && this.entwurf?.frei) this._kabelFertig(this.entwurf.punkte);
        else {
          this.entwurf = null;
          this.hoverZiel = null;
          this.zeichne();
          this.host.meldung?.('Nicht eingesteckt: Loslassen auf einem Pin oder Draht verbindet.');
        }
        return;
      }
      case 'ast':
        /* Angetippt, nicht gezogen: Draht auswählen und Knöpfe zeigen */
        this.auswahl.teile.clear();
        this.auswahl.draehte.clear();
        this.auswahl.draehte.add(z.draht);
        this._auswahlGemeldet();
        this._leisteAuf(z.start);
        this.zeichne();
        return;
      case 'umstecken':
        this._umsteckenEnde(z, m);
        return;
      case 'teile':
        this._teileZugEnde(z);
        return;
      case 'segment':
        this._segmentZugEnde(z);
        return;
      case 'rahmen': {
        const x0 = Math.min(z.x0, z.x1), x1 = Math.max(z.x0, z.x1), y0 = Math.min(z.y0, z.y1), y1 = Math.max(z.y0, z.y1);
        if (x1 - x0 > 4 || y1 - y0 > 4) {
          const p = this.projekt;
          for (const t of p.teile) {
            if (BAUTEILE[t.typ].pins.every(pin => { const o = pinOrt(t, pin); return o.x >= x0 && o.x <= x1 && o.y >= y0 && o.y <= y1; })) this.auswahl.teile.add(t.id);
          }
          for (const d of p.draehte) {
            if (d.punkte.every(k => k[0] >= x0 && k[0] <= x1 && k[1] >= y0 && k[1] <= y1)) this.auswahl.draehte.add(d.id);
          }
          this._auswahlGemeldet();
        }
        this.zeichne();
      }
    }
  }

  _abbruch(e) {
    this.zeiger.delete(e.pointerId);
    this._zugVerwerfen();
  }

  /* Laufenden Zug abbrechen und den Stand davor wiederherstellen */
  _zugVerwerfen() {
    const z = this.zug;
    this.zug = null;
    this.entwurf = null;
    this.hoverZiel = null;
    this.svg.classList.remove('stecken');
    if (z?.vorher) this.host.zurueckZu(z.vorher);
    else this.zeichne();
  }

  /* Klick mit hängendem Kabel */
  _drahtKlick(m) {
    const w = this.werkzeug;
    const ziel = this._fange(m, {ohnePin: w.ohnePin});
    this._entwurfNeu(w.punkte, w.richtung, ziel, w.hindernisse);
    const pts = this.entwurf.punkte;
    if (!this.entwurf.frei) { this.host.meldung?.('Kein freier Weg dorthin. Eine Ecke setzen oder ein anderes Ziel wählen.'); return; }
    if (ziel.art) {
      this.werkzeug = null;
      this.svg.classList.remove('setzen', 'stecken');
      this.host.werkzeugGeaendert?.(null);
      this._kabelFertig(pts);
      return;
    }
    /* Leere Fläche: Eckpunkt festlegen */
    w.punkte = pts;
    this.zeichne();
  }

  /* Doppelklick lässt ein hängendes Kabel an dieser Stelle enden. */
  _doppel() {
    if (this.werkzeug?.art !== 'draht') return;
    const pts = this.werkzeug.punkte;
    this.werkzeug = null;
    this.svg.classList.remove('setzen', 'stecken');
    this.host.werkzeugGeaendert?.(null);
    this._kabelFertig(pts, 'Draht mit offenem Ende');
  }

  _rad(e) {
    e.preventDefault();
    const r = this.svg.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) {
      this.zoome(Math.exp(-e.deltaY * 0.0022 * (e.deltaMode === 1 ? 16 : 1)), e.clientX - r.left, e.clientY - r.top);
    } else {
      this._leisteZu();
      this.ansichtFest = true;
      this.ansicht.x += e.deltaX / this.ansicht.z;
      this.ansicht.y += e.deltaY / this.ansicht.z;
      this.zeichne();
    }
  }

  /* ---------- Bauteil setzen ---------- */
  _setzeTeil(w, weiter) {
    let neueId = null, eingeschleift = false;
    this.host.mutiere(`${BAUTEILE[w.typ].name} eingesetzt`, p => {
      neueId = freieKennung(p, w.typ);
      const t = {id: neueId, typ: w.typ, x: w.x, y: w.y, rot: w.rot, spiegel: w.spiegel, werte: standardWerte(w.typ)};
      p.teile.push(t);
      /* Auf ein anderes Teil gefallen: Es rutscht auf den nächsten freien Platz. */
      if (koerperStoesst(p, t)) Object.assign(t, freierPlatz(p, t.typ, {x: t.x, y: t.y}, t.rot));
      else eingeschleift = schleifeEin(p, t);
    });
    if (eingeschleift) this.host.meldung?.(`${neueId} in den Draht eingeschleift.`);
    this.auswahl.teile.clear();
    this.auswahl.draehte.clear();
    this.auswahl.teile.add(neueId);
    this._auswahlGemeldet();
    if (!weiter) {
      this.werkzeug = null;
      this.svg.classList.remove('setzen');
      this.host.werkzeugGeaendert?.(null);
    }
    this.zeichne();
    return neueId;
  }

  /* ---------- Umstecken: ein Drahtende am Griff ziehen ---------- */
  _beginneUmstecken(ende) {
    const p = this.projekt;
    const d = p.draehte.find(x => this.auswahl.draehte.has(x.id));
    if (!d) return;
    const vorher = this.host.schnappschuss();
    /* Umgesteckt wird nur das Stück bis zum ersten Abzweig. Der Rest bleibt mit allem, was an ihm hängt, liegen. */
    const rest = restAbAbzweig(p, d, ende === 0 ? d.punkte : [...d.punkte].reverse(), new Set());
    const fest = rest[0];
    const anFest = rest.length > 1 ? null : anschlussBei(p, fest[0], fest[1], {ohneDraht: d.id});
    let stueck = d;
    if (rest.length > 1) {
      d.punkte = rest;
      stueck = {id: neueDrahtId(p), punkte: [fest, fest]};
      p.draehte.push(stueck);
    } else d.punkte = [fest, fest];
    this.zug = {
      art: 'umstecken', draht: stueck, fest, festRichtung: anFest?.art === 'pin' ? anFest.richtung : -1,
      hindernisse: baueHindernisse(p, {ohneDraehte: new Set([stueck.id])}), vorher
    };
    this.svg.classList.add('stecken');
    this.zeichne();
  }

  _umsteckenEnde(z, m) {
    const ziel = this._fange(m, {ohneDraht: z.draht.id});
    const pts = this.entwurf?.punkte, frei = this.entwurf?.frei;
    this.entwurf = null;
    this.hoverZiel = null;
    if (ziel.art && pts && pts.length >= 2 && frei) {
      z.draht.punkte = ordneDraht(pts);
      this.host.uebernimm('Umgesteckt', z.vorher);
      return;
    }
    /* Ins Leere losgelassen: abgezogen */
    const p = this.projekt;
    p.draehte = p.draehte.filter(d => d !== z.draht);
    this.auswahl.draehte.delete(z.draht.id);
    this._auswahlGemeldet();
    this.host.uebernimm('Kabel abgezogen', z.vorher);
  }

  /* ---------- Bauteile ziehen: Drähte bleiben angeschlossen und legen sich neu ---------- */
  _anbindungen(ids) {
    const p = this.projekt;
    const orte = new Map();
    for (const t of p.teile) {
      if (!ids.has(t.id)) continue;
      for (const pin of BAUTEILE[t.typ].pins) { const o = pinOrt(t, pin); orte.set(`${o.x},${o.y}`, {teil: t, pin}); }
    }
    const enden = [], beide = [];
    for (const d of p.draehte) {
      if (this.auswahl.draehte.has(d.id)) continue;
      const a = d.punkte[0], b = d.punkte[d.punkte.length - 1];
      const anA = orte.get(`${a[0]},${a[1]}`), anB = orte.get(`${b[0]},${b[1]}`);
      if (anA && anB) beide.push({draht: d, orig: d.punkte.map(q => [q[0], q[1]]), anA, anB});
      else if (anA || anB) {
        /* Neu gelegt wird nur bis zum ersten Abzweig. Ab dort bleibt der Draht liegen, sonst verlöre der Abzweig seine Verbindung. */
        const vomTeil = anA ? d.punkte : [...d.punkte].reverse();
        const rest = restAbAbzweig(p, d, vomTeil, ids);
        enden.push({draht: d, an: anA || anB, festPunkt: rest[0], rest});
      }
    }
    return {ids: new Set(ids), enden, beide, gruppen: gruppenAusPlan(p), vorher: this.host.schnappschuss()};
  }

  /* Jedes Drahtende am bewegten Teil bekommt seinen Weg neu. Gibt false zurück, wenn für einen Draht kein freier Weg da war. */
  _legeEndenNeu(enden) {
    if (!enden.length) return true;
    let alle = true;
    const p = this.projekt;
    const ohne = new Set(enden.map(e => e.draht.id));
    /* Die liegen bleibenden Reststücke zählen als Hindernisse. */
    const stand = {teile: p.teile, draehte: [...p.draehte.filter(d => !ohne.has(d.id)), ...enden.filter(e => e.rest.length > 1).map(e => ({id: `rest-${e.draht.id}`, punkte: e.rest}))]};
    const h = baueHindernisse(stand);
    for (const e of enden) {
      const o = pinOrt(e.an.teil, e.an.pin);
      /* Am Abzweig läuft der Draht geradeaus weiter, an einem Pin kommt er von dort, wohin die Anschlussleitung zeigt. */
      const fest = anschlussBei(stand, e.festPunkt[0], e.festPunkt[1]);
      const zielRichtung = e.rest.length > 1 ? (richtungVon(e.rest[0], e.rest[1]) + 2) & 3 : fest?.art === 'pin' ? fest.richtung : -1;
      const weg = findeWeg(h, [o.x, o.y], e.festPunkt, {startRichtung: pinRichtung(e.an.teil, e.an.pin), zielRichtung});
      if (!weg) alle = false;
      e.draht.punkte = ordneDraht([...(weg ?? geraderWeg([o.x, o.y], e.festPunkt)), ...e.rest.slice(1)]);
    }
    return alle;
  }

  /* Nach jedem Verschieben, Drehen oder Spiegeln: Was verbunden war, bleibt verbunden, und es entsteht kein Kurzschluss.
     Eine Sonde, ein Hörpunkt oder ein Massezeichen auf einem anderen Netz klemmt dagegen um. */
  _zugAbschliessen(text, z) {
    const p = this.projekt;
    const bewegte = p.teile.filter(t => z.ids.has(t.id));
    if (bewegte.some(t => koerperStoesst(p, t))) {
      this.host.zurueckZu(z.vorher);
      this.host.meldung?.('Dort liegt schon ein Bauteil. Das Teil bleibt, wo es war.');
      return false;
    }
    /* Drähte unter dem Körper weichen aus: Sie gehen weg, und die Netze werden darum herum neu verbunden. */
    const mitgewandert = new Set(z.beide.map(e => e.draht));
    p.draehte = p.draehte.filter(d => d.punkte.length > 1 && !(mitgewandert.has(d) ? p.teile : bewegte).some(t => laeuftDurch(d, t)));
    let gruppen = z.gruppen;
    const allein = z.ids.size === 1 ? p.teile.find(t => z.ids.has(t.id)) : null;
    if (allein && BAUTEILE[allein.typ].pins.length === 1) {
      const pin = BAUTEILE[allein.typ].pins[0], o = pinOrt(allein, pin), k = `${allein.id}.${pin.id}`;
      const eigene = new Set(z.enden.map(e => e.draht.id));
      if (anschlussBei({teile: p.teile, draehte: p.draehte.filter(d => !eigene.has(d.id))}, o.x, o.y, {ohnePin: k})) {
        for (const e of z.enden) {
          if (e.rest.length > 1) e.draht.punkte = e.rest;
          else p.draehte = p.draehte.filter(d => d !== e.draht);
        }
        gruppen = gruppen.map(g => new Set([...g].filter(q => q !== k)));
      }
    }
    const abgelehnt = !bewahreVerbindungen(p, gruppen, {mitNamen: false}) ? 'Dorthin gibt es keinen freien Weg für die Drähte.'
      : schliesstKurz(gruppen, gruppenAusPlan(p)) ? 'Dort würde ein Pin ein fremdes Netz berühren.' : '';
    if (abgelehnt) {
      this.host.zurueckZu(z.vorher);
      this.host.meldung?.(`${abgelehnt} Das Teil bleibt, wo es war.`);
      return false;
    }
    this.host.uebernimm(text, z.vorher);
    return true;
  }

  _beginneTeileZug(m) {
    const p = this.projekt;
    const ursprung = new Map(p.teile.filter(t => this.auswahl.teile.has(t.id)).map(t => [t.id, {x: t.x, y: t.y}]));
    const draehte = new Map(p.draehte.filter(d => this.auswahl.draehte.has(d.id)).map(d => [d.id, d.punkte.map(q => [q[0], q[1]])]));
    this.zug = {art: 'teile', sx: fang(m.x), sy: fang(m.y), ursprung, draehte, ...this._anbindungen(this.auswahl.teile), dx: 0, dy: 0};
  }

  _teileZug(q) {
    const z = this.zug;
    const dx = q[0] - z.sx, dy = q[1] - z.sy;
    if (dx === z.dx && dy === z.dy) return;
    z.dx = dx;
    z.dy = dy;
    const p = this.projekt;
    for (const t of p.teile) { const u = z.ursprung.get(t.id); if (u) { t.x = u.x + dx; t.y = u.y + dy; } }
    for (const d of p.draehte) { const u = z.draehte.get(d.id); if (u) d.punkte = u.map(k => [k[0] + dx, k[1] + dy]); }
    for (const e of z.beide) e.draht.punkte = e.orig.map(k => [k[0] + dx, k[1] + dy]);
    z.wegFrei = this._legeEndenNeu(z.enden);
    z.stoss = p.teile.some(t => z.ids.has(t.id) && koerperStoesst(p, t));
    this.zeichne();
  }

  _teileZugEnde(z) {
    if (z.dx === 0 && z.dy === 0) return;
    if (z.wegFrei === false) {
      this.host.zurueckZu(z.vorher);
      this.host.meldung?.('Dorthin gibt es keinen freien Weg für die Drähte. Das Teil bleibt, wo es war.');
      return;
    }
    /* Einzelner freier Zweipol auf einem Draht: einschleifen */
    if (z.ursprung.size === 1 && !z.enden.length && !z.beide.length) {
      const t = this.projekt.teile.find(x => z.ursprung.has(x.id));
      const frei = BAUTEILE[t.typ].pins.every(pin => z.gruppen.some(g => g.size === 1 && g.has(`${t.id}.${pin.id}`)));
      if (frei && !koerperStoesst(this.projekt, t) && schleifeEin(this.projekt, t)) { this.host.uebernimm('In den Draht eingeschleift', z.vorher); return; }
    }
    this._zugAbschliessen('Verschoben', z);
  }

  /* ---------- Drahtstück verschieben ---------- */
  _beginneSegmentZug(drahtId, m) {
    const d = this.projekt.draehte.find(x => x.id === drahtId);
    let seg = -1, best = Infinity;
    for (let i = 1; i < d.punkte.length; i++) {
      const [ax, ay] = d.punkte[i - 1], [bx, by] = d.punkte[i];
      const dist = ax === bx
        ? Math.abs(m.x - ax) + Math.max(0, Math.min(ay, by) - m.y, m.y - Math.max(ay, by))
        : Math.abs(m.y - ay) + Math.max(0, Math.min(ax, bx) - m.x, m.x - Math.max(ax, bx));
      if (dist < best) { best = dist; seg = i - 1; }
    }
    this.zug = {art: 'segment', draht: d, i: seg, orig: d.punkte.map(q => [q[0], q[1]]), sx: fang(m.x), sy: fang(m.y), vorher: this.host.schnappschuss(), gruppen: gruppenAusPlan(this.projekt), bewegt: false, punkt: this._fange(m)};
  }

  _segmentZug(q) {
    const z = this.zug;
    const o = z.orig, i = z.i;
    const [ax, ay] = o[i], [bx, by] = o[i + 1];
    const waagrecht = ay === by;
    const d = waagrecht ? q[1] - z.sy : q[0] - z.sx;
    if (d === 0 && !z.bewegt) return;
    z.bewegt = true;
    const n = o.map(k => [k[0], k[1]]);
    const verschiebe = k => { if (waagrecht) k[1] += d; else k[0] += d; };
    if (i > 0) verschiebe(n[i]);
    if (i + 1 < n.length - 1) verschiebe(n[i + 1]);
    /* Am Drahtende bleibt der Anschluss stehen, dafür kommt eine Ecke dazu. */
    if (i === 0) { const neu = [ax, ay]; verschiebe(neu); n.splice(1, 0, neu); }
    if (i + 1 === o.length - 1) { const neu = [bx, by]; verschiebe(neu); n.splice(n.length - 1, 0, neu); }
    z.draht.punkte = n;
    this.zeichne();
  }

  _segmentZugEnde(z) {
    if (!z.bewegt) { this._leisteAuf([z.punkt.x, z.punkt.y]); return; }
    const p = this.projekt;
    z.draht.punkte = ordneDraht(z.draht.punkte);
    /* Ein verschobenes Stück ändert nie, was verbunden ist, und läuft nicht durch Bauteile. */
    const abgelehnt = !gleicheGruppen(z.gruppen, gruppenAusPlan(p)) ? 'Dort würde der Draht ein anderes Netz berühren.'
      : p.teile.some(t => laeuftDurch(z.draht, t)) ? 'Dort läuft der Draht durch ein Bauteil.' : '';
    if (abgelehnt) {
      this.host.zurueckZu(z.vorher);
      this.host.meldung?.(`${abgelehnt} Er bleibt, wo er war.`);
      return;
    }
    this.host.uebernimm('Draht verschoben', z.vorher);
  }

  /* ---------- Knöpfe am Draht: Messen, Hören, Entfernen ---------- */
  _baueLeiste() {
    const el = document.createElement('div');
    el.className = 'al-drahtknoepfe';
    el.hidden = true;
    el.innerHTML = '<button type="button" data-tu="messen">Messen</button><button type="button" data-tu="hoeren">Hier hören</button><button type="button" data-tu="weg">Entfernen</button>';
    this.svg.parentElement.append(el);
    el.addEventListener('click', e => {
      const tu = e.target.dataset?.tu;
      if (!tu || !this.leistePunkt) return;
      const [x, y] = this.leistePunkt;
      this._leisteZu();
      if (tu === 'messen') this.setzeSonde(x, y);
      else if (tu === 'hoeren') this.setzeHoerpunkt(x, y);
      else this.loesche();
    });
    return el;
  }

  _leisteAuf(punkt) {
    this.leistePunkt = punkt;
    this.leiste.hidden = false;
    this._leistePlatzieren();
  }

  _leisteZu() {
    this.leiste.hidden = true;
    this.leistePunkt = null;
  }

  _leistePlatzieren() {
    if (!this.leistePunkt) return;
    const a = this.ansicht;
    const x = (this.leistePunkt[0] - a.x) * a.z, y = (this.leistePunkt[1] - a.y) * a.z;
    const r = this.svg.getBoundingClientRect();
    const b = this.leiste.offsetWidth, h = this.leiste.offsetHeight;
    this.leiste.style.left = `${Math.min(Math.max(x - b / 2, 6), r.width - b - 6)}px`;
    this.leiste.style.top = `${y - h - 12 < 6 ? y + 12 : y - h - 12}px`;
  }

  setzeSonde(x, y) {
    this.host.mutiere('Sonde gesetzt', p => {
      const t = {id: freieKennung(p, 'sonde'), typ: 'sonde', x, y, rot: 0, spiegel: false, werte: standardWerte('sonde')};
      t.rot = freieDrehung(p, t);
      p.teile.push(t);
    });
  }

  setzeHoerpunkt(x, y) {
    this.host.mutiere('Hörpunkt versetzt', p => {
      const alt = p.teile.find(t => t.typ === 'hoer');
      if (alt) entferneTeile(p, new Set([alt.id]));
      const t = {id: alt?.id ?? freieKennung(p, 'hoer'), typ: 'hoer', x, y, rot: 0, spiegel: false, werte: standardWerte('hoer')};
      t.rot = freieDrehung(p, t);
      p.teile.push(t);
    });
  }

  /* ---------- Tasten ---------- */
  _taste(e) {
    const ziel = e.target;
    if (ziel && (ziel.tagName === 'INPUT' || ziel.tagName === 'TEXTAREA' || ziel.tagName === 'SELECT' || ziel.isContentEditable)) return;
    if (!this.host.aktiv()) return;
    const strg = e.ctrlKey || e.metaKey;
    if (e.code === 'Space') { this.leertaste = true; this.svg.classList.add('pan'); e.preventDefault(); return; }
    if (strg) {
      switch (e.key.toLowerCase()) {
        case 'z': e.preventDefault(); if (e.shiftKey) this.host.wiederholen(); else this.host.rueckgaengig(); return;
        case 'y': e.preventDefault(); this.host.wiederholen(); return;
        case 'c': e.preventDefault(); this.kopiere(); return;
        case 'x': e.preventDefault(); this.kopiere(); this.loesche(); return;
        case 'v': e.preventDefault(); this.einfuegen(); return;
        case 'd': e.preventDefault(); this.kopiere(); this.einfuegen(); return;
        case 'a': e.preventDefault(); this.alleWaehlen(); return;
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        this._leisteZu();
        if (this.zug) this._zugVerwerfen();
        else if (this.werkzeug) this.setzeWerkzeug(null);
        else { this.auswahl.teile.clear(); this.auswahl.draehte.clear(); this._auswahlGemeldet(); this.zeichne(); }
        break;
      case 'Delete': case 'Backspace':
        e.preventDefault();
        if (this.werkzeug?.art === 'draht') this.setzeWerkzeug(null);
        else this.loesche();
        break;
      case 'r': case 'R': this.drehe(); break;
      case 'm': case 'M': this.spiegle(); break;
      case 'ArrowLeft': e.preventDefault(); this._schiebe(-RASTER, 0); break;
      case 'ArrowRight': e.preventDefault(); this._schiebe(RASTER, 0); break;
      case 'ArrowUp': e.preventDefault(); this._schiebe(0, -RASTER); break;
      case 'ArrowDown': e.preventDefault(); this._schiebe(0, RASTER); break;
    }
  }

  _schiebe(dx, dy) {
    if (!this.auswahl.teile.size && !this.auswahl.draehte.size) return;
    const p = this.projekt;
    const z = this._anbindungen(this.auswahl.teile);
    for (const t of p.teile) if (z.ids.has(t.id)) { t.x += dx; t.y += dy; }
    for (const d of p.draehte) if (this.auswahl.draehte.has(d.id)) d.punkte = d.punkte.map(q => [q[0] + dx, q[1] + dy]);
    for (const e of z.beide) e.draht.punkte = e.orig.map(k => [k[0] + dx, k[1] + dy]);
    if (!this._legeEndenNeu(z.enden)) { this.host.zurueckZu(z.vorher); this.host.meldung?.('Kein freier Weg für die Drähte.'); return; }
    this._zugAbschliessen('Verschoben', z);
  }

  drehe() {
    if (this.werkzeug?.art === 'einsetzen') { this.werkzeug.rot = ((this.werkzeug.rot || 0) + 90) % 360; this.zeichne(); return; }
    this._umforme('Gedreht', t => { t.rot = ((t.rot || 0) + 90) % 360; });
  }

  spiegle() {
    if (this.werkzeug?.art === 'einsetzen') { this.werkzeug.spiegel = !this.werkzeug.spiegel; this.zeichne(); return; }
    this._umforme('Gespiegelt', t => { t.spiegel = !t.spiegel; });
  }

  /* Drehen und Spiegeln: Jeder Pin wandert anders, die Drähte legen sich neu. */
  _umforme(text, fn) {
    if (!this.auswahl.teile.size) return;
    const p = this.projekt;
    const z = this._anbindungen(this.auswahl.teile);
    for (const t of p.teile) if (z.ids.has(t.id)) fn(t);
    /* Drähte zwischen zwei gedrehten Teilen entstehen neu. */
    p.draehte = p.draehte.filter(d => !z.beide.some(e => e.draht === d));
    if (!this._legeEndenNeu(z.enden)) { this.host.zurueckZu(z.vorher); this.host.meldung?.('So gedreht gibt es keinen freien Weg für die Drähte.'); return; }
    this._zugAbschliessen(text, z);
  }

  loesche() {
    const {teile, draehte} = this.auswahl;
    if (!teile.size && !draehte.size) return;
    this._leisteZu();
    const anzahl = teile.size + draehte.size;
    const text = anzahl > 1 ? `${anzahl} Elemente entfernt` : teile.size ? `${[...teile][0]} entfernt` : 'Kabel entfernt';
    this.host.mutiere(text, p => {
      p.draehte = p.draehte.filter(d => !draehte.has(d.id));
      entferneTeile(p, teile);
    });
    teile.clear();
    draehte.clear();
    this._auswahlGemeldet();
  }

  alleWaehlen() {
    const p = this.projekt;
    p.teile.forEach(t => this.auswahl.teile.add(t.id));
    p.draehte.forEach(d => this.auswahl.draehte.add(d.id));
    this._auswahlGemeldet();
    this.zeichne();
  }

  kopiere() {
    const p = this.projekt;
    const teile = p.teile.filter(t => this.auswahl.teile.has(t.id));
    const draehte = p.draehte.filter(d => this.auswahl.draehte.has(d.id));
    if (!teile.length && !draehte.length) return;
    this.ablage = JSON.parse(JSON.stringify({teile, draehte}));
    this.host.meldung?.(`${teile.length + draehte.length} Elemente kopiert.`);
  }

  einfuegen() {
    if (!this.ablage) return;
    const versatz = versatzFuerKopie(this.projekt, this.ablage, 40);
    const neueTeile = [], neueDraehte = [];
    this.host.mutiere('Eingefügt', p => {
      for (const t of this.ablage.teile) {
        const id = freieKennung(p, t.typ);
        p.teile.push({...JSON.parse(JSON.stringify(t)), id, x: t.x + versatz, y: t.y + versatz});
        neueTeile.push(id);
      }
      for (const d of this.ablage.draehte) {
        const id = neueDrahtId(p);
        p.draehte.push({id, punkte: d.punkte.map(q => [q[0] + versatz, q[1] + versatz])});
        neueDraehte.push(id);
      }
    });
    this.auswahl.teile = new Set(neueTeile);
    this.auswahl.draehte = new Set(neueDraehte);
    /* Nochmal einfügen setzt versetzt zur letzten Kopie an. */
    const p = this.projekt;
    this.ablage = JSON.parse(JSON.stringify({teile: p.teile.filter(t => this.auswahl.teile.has(t.id)), draehte: p.draehte.filter(d => this.auswahl.draehte.has(d.id))}));
    this._auswahlGemeldet();
    this.zeichne();
  }

  _auswahlGemeldet() { this.host.auswahlGeaendert?.(); }

  /* Projekt wurde von außen ersetzt: Auswahl aufräumen */
  auswahlPruefen() {
    const p = this.projekt;
    const t = new Set(p.teile.map(x => x.id)), d = new Set(p.draehte.map(x => x.id));
    for (const id of [...this.auswahl.teile]) if (!t.has(id)) this.auswahl.teile.delete(id);
    for (const id of [...this.auswahl.draehte]) if (!d.has(id)) this.auswahl.draehte.delete(id);
    if (!this.auswahl.draehte.size) this._leisteZu();
  }
}

const richtungVon = (a, b) => (b[0] > a[0] ? 0 : b[1] > a[1] ? 1 : b[0] < a[0] ? 2 : 3);

/* Stück eines Drahts ab dem ersten Abzweig, vom bewegten Ende aus gesehen. Ohne Abzweig bleibt nur der Endpunkt. */
function restAbAbzweig(p, d, vomTeil, ids) {
  const trifft = (x, y) => {
    for (const e of p.draehte) {
      if (e === d) continue;
      for (const q of [e.punkte[0], e.punkte[e.punkte.length - 1]]) if (q[0] === x && q[1] === y) return true;
    }
    for (const t of p.teile) {
      for (const pin of BAUTEILE[t.typ].pins) { const o = pinOrt(t, pin); if (o.x === x && o.y === y && !ids.has(t.id)) return true; }
    }
    return false;
  };
  for (let i = 1; i < vomTeil.length; i++) {
    const [ax, ay] = vomTeil[i - 1], [bx, by] = vomTeil[i];
    const schritte = Math.abs(bx - ax + by - ay) / RASTER;
    for (let k = i === 1 ? 1 : 0; k <= schritte; k++) {
      const x = ax + Math.sign(bx - ax) * k * RASTER, y = ay + Math.sign(by - ay) * k * RASTER;
      if (trifft(x, y)) return ordneDraht([[x, y], ...vomTeil.slice(i)]);
    }
  }
  return [vomTeil[vomTeil.length - 1]];
}
