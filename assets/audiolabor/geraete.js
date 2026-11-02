/* Audiolabor: die Messgeräte. Oszilloskop, Spektrum und Bode-Diagramm zeichnen auf dunklem Schirm, unabhängig vom Seitenthema.
   Sie zeigen immer die Werte aus der Schaltung, nie den skalierten Lautsprecherweg. */

import { fmtMess, fmtWert, komma } from './einheiten.js';
import { pegel, pegelZeit, frequenzAusDurchgaengen, spektrum } from './messung.js';

/* Kupfer, Ultramarin (aufgehellt für den dunklen Schirm), Kreide, Messing, Patina, Altrosa */
export const KANAL_FARBEN = ['#ff5a2e', '#8d89ff', '#efece2', '#d9b44a', '#7fb7a3', '#c98fb0'];
const SCHIRM = '#0a0a14', RASTER = '#26263a', ACHSE = '#3f3f58', TEXT = '#a9a69c';
const SCHRIFT = "10px 'Meslo', ui-monospace, Menlo, monospace";

class Flaeche {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = 0;
    this.h = 0;
    this.beiGroesse = null;
    this.ro = new ResizeObserver(() => { this.passe(); this.beiGroesse?.(); });
    this.ro.observe(canvas);
    this.passe();
  }
  passe() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.w = Math.max(r.width, 1);
    this.h = Math.max(r.height, 1);
    const bw = Math.round(this.w * dpr), bh = Math.round(this.h * dpr);
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  loesche() {
    const c = this.ctx;
    c.fillStyle = SCHIRM;
    c.fillRect(0, 0, this.w, this.h);
    c.font = SCHRIFT;
    c.textBaseline = 'alphabetic';
  }
}

/* Binäre Suche im aufsteigenden Zeitarray */
function indexBei(t, x) {
  let a = 0, b = t.length - 1;
  if (x <= t[0]) return 0;
  if (x >= t[b]) return b;
  while (b - a > 1) {
    const m = (a + b) >> 1;
    if (t[m] < x) a = m; else b = m;
  }
  return a;
}

const STUFEN = [1, 2, 5];
function naechsteStufe(x) {
  if (!(x > 0)) return 1;
  const e = Math.floor(Math.log10(x));
  const b = 10 ** e;
  for (const s of STUFEN) if (s * b >= x * 0.999) return s * b;
  return 10 * b;
}

export const ZEIT_STUFEN = [1e-5, 2e-5, 5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2, 0.1, 0.2, 0.5, 1];

/* Zeichnet eine Spur auf nicht gleichmäßigem Zeitraster. Bei mehr Punkten als Pixeln pro Spalte Minimum und Maximum. */
function spurZeichnen(c, t, v, tVon, tBis, x0, y0, b, hoehe, yMitte, yJeEinheit, farbe, breite = 1.3, faktor = 1) {
  const i0 = Math.max(indexBei(t, tVon) - 1, 0), i1 = Math.min(indexBei(t, tBis) + 1, t.length - 1);
  if (i1 <= i0) return;
  const pxJeZeit = b / (tBis - tVon);
  const yPx = w => {
    const y = y0 + hoehe / 2 - (w * faktor - yMitte) * yJeEinheit;
    return y < y0 - 4 ? y0 - 4 : y > y0 + hoehe + 4 ? y0 + hoehe + 4 : y;
  };
  c.strokeStyle = farbe;
  c.lineWidth = breite;
  c.lineJoin = 'round';
  c.beginPath();
  const dicht = (i1 - i0) > b * 2;
  if (!dicht) {
    for (let i = i0; i <= i1; i++) {
      const x = x0 + (t[i] - tVon) * pxJeZeit, y = yPx(v[i]);
      if (i === i0) c.moveTo(x, y); else c.lineTo(x, y);
    }
  } else {
    let i = i0;
    for (let px = 0; px <= b; px++) {
      const grenze = tVon + (px + 1) / pxJeZeit;
      let min = Infinity, max = -Infinity;
      while (i <= i1 && t[i] < grenze) {
        const w = v[i];
        if (w < min) min = w;
        if (w > max) max = w;
        i++;
      }
      if (min === Infinity) continue;
      const x = x0 + px;
      c.lineTo(x, yPx(min));
      if (max !== min) c.lineTo(x, yPx(max));
    }
  }
  c.stroke();
}

/* ---------- Oszilloskop ---------- */

const RINGGROESSE = 1 << 18; /* gut 5 s bei 48 kHz */

export class Oszilloskop {
  constructor(canvas, {beiMessung} = {}) {
    this.f = new Flaeche(canvas);
    this.f.beiGroesse = () => this.zeichne();
    this.beiMessung = beiMessung;
    this.daten = null;      /* {t, kanaele:[{id,name,einheit,werte,farbe}], dauer} */
    this.alt = null;
    this.zeitDiv = 'auto';
    this.position = 1;
    this.triggern = true;
    this.ring = null;
    this.cursor = null;
    this._yU = null;
    this._yI = null;
    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      this.cursor = {x: e.clientX - r.left, y: e.clientY - r.top};
      this.zeichne();
    });
    canvas.addEventListener('pointerleave', () => { this.cursor = null; this.zeichne(); });
  }

  /* Berechneter Lauf */
  setzeRender(daten, {alsAltBehalten = true} = {}) {
    if (alsAltBehalten && this.daten && !this.ring) this.alt = this.daten;
    this.ring = null;
    this.daten = daten;
    this._yU = null;
    this._yI = null;
    this.zeichne();
  }

  loesche() {
    this.daten = null;
    this.alt = null;
    this.ring = null;
    this.zeichne();
  }

  /* Live-Betrieb: Rahmen vom Audio-Thread landen in einem Ringpuffer. */
  liveBeginn(kanaele, fs) {
    this.alt = null;
    this.daten = null;
    this.ring = {
      fs, schreib: 0, voll: 0,
      kanaele: kanaele.map(k => ({...k, werte: new Float32Array(RINGGROESSE)})),
      tEnde: 0
    };
    this._yU = null;
    this._yI = null;
  }

  liveKanaele(kanaele, fs) {
    if (!this.ring || this.ring.kanaele.map(k => k.id).join() !== kanaele.map(k => k.id).join()) this.liveBeginn(kanaele, fs);
  }

  liveRahmen(rahmen, t) {
    const r = this.ring;
    if (!r) return;
    const n = rahmen[0]?.length || 0;
    const m = Math.min(rahmen.length, r.kanaele.length);
    for (let c = 0; c < m; c++) {
      const z = r.kanaele[c].werte, q = rahmen[c];
      let p = r.schreib;
      for (let i = 0; i < n; i++) { z[p] = q[i]; p = (p + 1) & (RINGGROESSE - 1); }
    }
    r.schreib = (r.schreib + n) & (RINGGROESSE - 1);
    r.voll = Math.min(r.voll + n, RINGGROESSE);
    r.tEnde = t;
  }

  /* Daten des letzten Abschnitts als lineare Arrays. Für Spektrum und Messwerte. */
  liveAbschnitt(n) {
    const r = this.ring;
    if (!r) return null;
    const m = Math.min(n, r.voll);
    const start = (r.schreib - m + RINGGROESSE) & (RINGGROESSE - 1);
    const t = new Float64Array(m);
    for (let i = 0; i < m; i++) t[i] = r.tEnde - (m - i) / r.fs;
    const kanaele = r.kanaele.map(k => {
      const w = new Float32Array(m);
      let p = start;
      for (let i = 0; i < m; i++) { w[i] = k.werte[p]; p = (p + 1) & (RINGGROESSE - 1); }
      return {id: k.id, name: k.name, einheit: k.einheit, farbe: k.farbe, werte: w};
    });
    return {t, kanaele, fs: r.fs, dauer: m / r.fs};
  }

  _autoZeit(d) {
    /* Etwa vier Perioden der Grundfrequenz auf zehn Teilungen */
    const k = d.kanaele[0];
    if (k) {
      const f = frequenzAusDurchgaengen(d.t, k.werte, d.t[0] + (d.t[d.t.length - 1] - d.t[0]) * 0.3);
      if (f && f.f > 0) return naechsteStufe(4 / f.f / 10);
    }
    return naechsteStufe(Math.max(d.t[d.t.length - 1] - d.t[0], 1e-5) / 10);
  }

  _triggerStart(d, tVon, tBis) {
    /* Softwaretrigger: steigende Flanke durch die Mitte von Kanal 1 */
    const k = d.kanaele[0];
    if (!k) return null;
    const i0 = indexBei(d.t, tVon), i1 = indexBei(d.t, tBis);
    if (i1 - i0 < 3) return null;
    let min = Infinity, max = -Infinity;
    const schritt = Math.max(1, Math.floor((i1 - i0) / 4000));
    for (let i = i0; i <= i1; i += schritt) { const w = k.werte[i]; if (w < min) min = w; if (w > max) max = w; }
    if (!(max - min > 1e-9)) return null;
    const m = (min + max) / 2;
    for (let i = i0 + 1; i <= i1; i++) {
      if (k.werte[i - 1] < m && k.werte[i] >= m) {
        const a = (m - k.werte[i - 1]) / (k.werte[i] - k.werte[i - 1]);
        return d.t[i - 1] + a * (d.t[i] - d.t[i - 1]);
      }
    }
    return null;
  }

  zeichne() {
    const f = this.f, c = f.ctx;
    f.passe();
    f.loesche();
    const d = this.ring ? this.liveAbschnitt(Math.min(this.ring.voll, 96000)) : this.daten;
    const rand = {l: 6, r: 6, o: 6, u: 18};
    const b = f.w - rand.l - rand.r, h = f.h - rand.o - rand.u;
    const x0 = rand.l, y0 = rand.o;
    const tx = 10, ty = 8;
    c.strokeStyle = RASTER;
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i <= tx; i++) { const x = Math.round(x0 + b * i / tx) + 0.5; c.moveTo(x, y0); c.lineTo(x, y0 + h); }
    for (let i = 0; i <= ty; i++) { const y = Math.round(y0 + h * i / ty) + 0.5; c.moveTo(x0, y); c.lineTo(x0 + b, y); }
    c.stroke();
    c.strokeStyle = ACHSE;
    c.beginPath();
    const ym = Math.round(y0 + h / 2) + 0.5, xm = Math.round(x0 + b / 2) + 0.5;
    c.moveTo(x0, ym); c.lineTo(x0 + b, ym);
    c.moveTo(xm, y0); c.lineTo(xm, y0 + h);
    c.stroke();

    if (!d || !d.kanaele.length || d.t.length < 2) {
      c.fillStyle = TEXT;
      c.textAlign = 'center';
      c.fillText(this.ring ? 'Warte auf Daten …' : 'Noch keine Messung.', f.w / 2, f.h / 2 - 10);
      c.textAlign = 'left';
      this.beiMessung?.(null);
      return;
    }

    const tAnfang = d.t[0], tEnde = d.t[d.t.length - 1];
    const dauer = tEnde - tAnfang;
    const zeitDiv = this.zeitDiv === 'auto' ? this._autoZeit(d) : this.zeitDiv;
    const fenster = Math.min(zeitDiv * 10, dauer);
    let tVon = tAnfang + (dauer - fenster) * this.position;
    if (this.triggern && fenster < dauer) {
      /* Trigger suchen: im Render ab der Position, live im letzten sicheren Abschnitt */
      const tSuch = this.ring ? tEnde - fenster - Math.min(dauer - fenster, Math.max(zeitDiv * 4, 0.02)) : Math.max(tVon - zeitDiv * 2, tAnfang);
      const tr = this._triggerStart(d, Math.max(tSuch, tAnfang), Math.min(tVon + fenster, tEnde - fenster));
      if (tr !== null) tVon = tr;
    }
    const tBis = tVon + zeitDiv * 10;

    /* Senkrechte Skalen: Spannungen und Ströme getrennt, mit Haltebereich gegen Zappeln im Live-Betrieb */
    const bereich = (einheit) => {
      let min = Infinity, max = -Infinity;
      for (const k of d.kanaele) {
        if (k.einheit !== einheit) continue;
        const i0 = indexBei(d.t, tVon), i1 = indexBei(d.t, Math.min(tBis, tEnde));
        const schritt = Math.max(1, Math.floor((i1 - i0) / 6000));
        for (let i = i0; i <= i1; i += schritt) { const w = k.werte[i]; if (w < min) min = w; if (w > max) max = w; }
      }
      return min === Infinity ? null : {min, max};
    };
    const skala = (bereichNeu, alt) => {
      if (!bereichNeu) return null;
      let {min, max} = bereichNeu;
      if (max - min < 1e-9) { const m = Math.max(Math.abs(max), 1e-3); min -= m * 0.1 + 1e-6; max += m * 0.1 + 1e-6; }
      const voll = Math.max(max - min, 1e-9) * 1.1;
      const div = naechsteStufe(voll / ty);
      let mitte = (max + min) / 2;
      mitte = Math.round(mitte / div) * div;
      if ((Math.abs(max) + Math.abs(min)) > 0 && Math.abs(max + min) < 0.25 * (max - min)) mitte = 0;
      const neu = {div, mitte};
      if (alt && alt.div >= div && alt.div <= div * 2.6 && min >= alt.mitte - alt.div * ty / 2 && max <= alt.mitte + alt.div * ty / 2) return alt;
      return neu;
    };
    this._yU = skala(bereich('V'), this.ring ? this._yU : null);
    this._yI = skala(bereich('A'), this.ring ? this._yI : null);

    c.save();
    c.beginPath();
    c.rect(x0, y0, b, h);
    c.clip();
    if (this.alt && !this.ring) {
      /* Vorheriger Lauf als blasse Spur, zum direkten Vergleich */
      for (const k of this.alt.kanaele) {
        const s = k.einheit === 'A' ? this._yI : this._yU;
        if (!s) continue;
        c.globalAlpha = 0.32;
        spurZeichnen(c, this.alt.t, k.werte, tVon, tBis, x0, y0, b, h, s.mitte, h / ty / s.div, k.farbe, 1);
        c.globalAlpha = 1;
      }
    }
    for (const k of d.kanaele) {
      const s = k.einheit === 'A' ? this._yI : this._yU;
      if (!s) continue;
      spurZeichnen(c, d.t, k.werte, tVon, tBis, x0, y0, b, h, s.mitte, h / ty / s.div, k.farbe);
    }
    c.restore();

    /* Beschriftung */
    c.fillStyle = TEXT;
    const unten = f.h - 5;
    let txt = `${fmtWert(zeitDiv, 's')}/T`;
    if (this._yU) txt += `   ${fmtWert(this._yU.div, 'V')}/T`;
    if (this._yI) txt += `   ${fmtWert(this._yI.div, 'A')}/T`;
    if (this._yU && this._yU.mitte !== 0) txt += `   Mitte ${fmtWert(this._yU.mitte, 'V')}`;
    c.fillText(txt, x0, unten);
    c.textAlign = 'right';
    let xr = x0 + b;
    for (let i = d.kanaele.length - 1; i >= 0; i--) {
      const k = d.kanaele[i];
      c.fillStyle = k.farbe;
      c.fillText(k.name, xr, unten);
      xr -= c.measureText(k.name).width + 10;
    }
    if (this.alt && !this.ring) { c.fillStyle = TEXT; c.fillText('blass: vorheriger Lauf', xr, unten); }
    c.textAlign = 'left';

    if (this.cursor && this.cursor.x > x0 && this.cursor.x < x0 + b && this.cursor.y > y0 && this.cursor.y < y0 + h) {
      const tc = tVon + (this.cursor.x - x0) / b * (tBis - tVon);
      c.strokeStyle = ACHSE;
      c.beginPath();
      c.moveTo(Math.round(this.cursor.x) + 0.5, y0);
      c.lineTo(Math.round(this.cursor.x) + 0.5, y0 + h);
      c.stroke();
      const i = indexBei(d.t, tc);
      c.font = SCHRIFT;
      let zy = y0 + 12;
      c.fillStyle = TEXT;
      c.fillText(`t = ${fmtMess(tc, 's', 5)}`, Math.min(this.cursor.x + 6, x0 + b - 110), zy);
      for (const k of d.kanaele) {
        zy += 12;
        c.fillStyle = k.farbe;
        c.fillText(`${k.name} ${fmtMess(k.werte[i], k.einheit, 4)}`, Math.min(this.cursor.x + 6, x0 + b - 110), zy);
      }
    }

    this.beiMessung?.({daten: d, tVon, tBis: Math.min(tBis, tEnde), zeitDiv});
  }

  /* Messwerte je Kanal im sichtbaren Fenster, Frequenz aus dem ganzen Datensatz */
  static messwerte(info) {
    if (!info) return [];
    const {daten: d, tVon, tBis} = info;
    return d.kanaele.map(k => {
      const p = d.fs ? pegel(k.werte, indexBei(d.t, tVon), Math.max(indexBei(d.t, tBis), indexBei(d.t, tVon) + 1)) : pegelZeit(d.t, k.werte, tVon, tBis);
      const f = frequenzAusDurchgaengen(d.t, k.werte, d.t[0] + (d.t[d.t.length - 1] - d.t[0]) * 0.2);
      return {id: k.id, name: k.name, einheit: k.einheit, farbe: k.farbe, ...p, f: f ? f.f : null};
    });
  }
}

/* ---------- Logarithmische Frequenzachse ---------- */

function logAchse(c, fVon, fBis, x0, y0, b, h, mitText) {
  const xF = fr => x0 + (Math.log10(fr) - Math.log10(fVon)) / (Math.log10(fBis) - Math.log10(fVon)) * b;
  const e0 = Math.floor(Math.log10(fVon)), e1 = Math.ceil(Math.log10(fBis));
  c.lineWidth = 1;
  for (let e = e0; e <= e1; e++) {
    for (let m = 1; m < 10; m++) {
      const fr = m * 10 ** e;
      if (fr < fVon || fr > fBis) continue;
      c.strokeStyle = m === 1 ? ACHSE : RASTER;
      const x = Math.round(xF(fr)) + 0.5;
      c.beginPath();
      c.moveTo(x, y0);
      c.lineTo(x, y0 + h);
      c.stroke();
      if (mitText && m === 1) {
        c.fillStyle = TEXT;
        c.textAlign = 'center';
        c.fillText(fr >= 1000 ? `${fr / 1000} k` : String(fr), x, y0 + h + 12);
        c.textAlign = 'left';
      }
    }
  }
  return xF;
}

/* ---------- Bode-Diagramm ---------- */

export class Bode {
  constructor(canvas) {
    this.f = new Flaeche(canvas);
    this.f.beiGroesse = () => this.zeichne();
    this.kurven = [];
    this.alt = [];
    this.cursor = null;
    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      this.cursor = {x: e.clientX - r.left, y: e.clientY - r.top};
      this.zeichne();
    });
    canvas.addEventListener('pointerleave', () => { this.cursor = null; this.zeichne(); });
  }

  setze(kurven, {alsAltBehalten = true} = {}) {
    if (alsAltBehalten && this.kurven.length) this.alt = this.kurven;
    this.kurven = kurven;
    this.zeichne();
  }

  loesche() { this.kurven = []; this.alt = []; this.zeichne(); }

  zeichne() {
    const f = this.f, c = f.ctx;
    f.passe();
    f.loesche();
    const k = this.kurven;
    if (!k.length) {
      c.fillStyle = TEXT;
      c.textAlign = 'center';
      c.fillText('Noch kein Frequenzgang.', f.w / 2, f.h / 2);
      c.textAlign = 'left';
      return;
    }
    const rl = 40, rr = 8, ro = 8, abstand = 18, ru = 18;
    const b = f.w - rl - rr;
    const hGes = f.h - ro - ru - abstand;
    const hMag = Math.round(hGes * 0.6), hPh = hGes - hMag;
    const y1 = ro, y2 = ro + hMag + abstand;
    const fv = k[0].f[0], fb = k[0].f[k[0].f.length - 1];

    /* Betrag: Bereich auf volle 10 dB */
    let min = Infinity, max = -Infinity, pMin = Infinity, pMax = -Infinity;
    for (const g of [...k, ...this.alt]) {
      for (let i = 0; i < g.db.length; i++) {
        if (g.db[i] < min) min = g.db[i];
        if (g.db[i] > max) max = g.db[i];
        if (g.phase[i] < pMin) pMin = g.phase[i];
        if (g.phase[i] > pMax) pMax = g.phase[i];
      }
    }
    if (min < -120) min = -120;
    const dbOben = Math.ceil((max + 1) / 10) * 10, dbUnten = Math.max(Math.floor((min - 1) / 10) * 10, dbOben - 160);
    const phOben = Math.ceil((pMax + 1) / 45) * 45, phUnten = Math.floor((pMin - 1) / 45) * 45;
    const yMag = d => y1 + (dbOben - d) / (dbOben - dbUnten || 1) * hMag;
    const yPh = p => y2 + (phOben - p) / (phOben - phUnten || 1) * hPh;

    const xF = logAchse(c, fv, fb, rl, y1, b, hMag, false);
    logAchse(c, fv, fb, rl, y2, b, hPh, true);

    c.fillStyle = TEXT;
    c.textAlign = 'right';
    const stufeDb = (dbOben - dbUnten) > 80 ? 40 : 20;
    for (let d = dbOben; d >= dbUnten; d -= stufeDb) {
      const y = Math.round(yMag(d)) + 0.5;
      c.strokeStyle = d === 0 ? ACHSE : RASTER;
      c.beginPath(); c.moveTo(rl, y); c.lineTo(rl + b, y); c.stroke();
      c.fillText(`${komma(d)} dB`, rl - 4, y + 3);
    }
    const stufePh = (phOben - phUnten) > 200 ? 90 : 45;
    for (let p = phOben; p >= phUnten; p -= stufePh) {
      const y = Math.round(yPh(p)) + 0.5;
      c.strokeStyle = RASTER;
      c.beginPath(); c.moveTo(rl, y); c.lineTo(rl + b, y); c.stroke();
      c.fillText(`${komma(p)}°`, rl - 4, y + 3);
    }
    c.textAlign = 'left';

    const kurve = (g, wahl, yW, y0, hoehe, farbe, alpha, breite) => {
      c.save();
      c.beginPath(); c.rect(rl, y0, b, hoehe); c.clip();
      c.globalAlpha = alpha;
      c.strokeStyle = farbe;
      c.lineWidth = breite;
      c.beginPath();
      for (let i = 0; i < g.f.length; i++) {
        const x = xF(g.f[i]), y = yW(g[wahl][i]);
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
      c.restore();
    };
    for (const g of this.alt) { kurve(g, 'db', yMag, y1, hMag, g.farbe, 0.32, 1); kurve(g, 'phase', yPh, y2, hPh, g.farbe, 0.32, 1); }
    for (const g of k) { kurve(g, 'db', yMag, y1, hMag, g.farbe, 1, 1.4); kurve(g, 'phase', yPh, y2, hPh, g.farbe, 1, 1.4); }

    /* Grenzfrequenz markieren */
    for (const g of k) {
      if (!g.fc) continue;
      const x = xF(g.fc.fc), y = yMag(g.fc.db);
      c.strokeStyle = g.farbe;
      c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(x, y1); c.lineTo(x, y2 + hPh); c.stroke();
      c.setLineDash([]);
      c.fillStyle = g.farbe;
      c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill();
      c.fillText(`${fmtMess(g.fc.fc, 'Hz', 5)}`, Math.min(x + 6, rl + b - 80), y1 + 12);
    }

    if (this.cursor && this.cursor.x > rl && this.cursor.x < rl + b) {
      const fr = 10 ** (Math.log10(fv) + (this.cursor.x - rl) / b * (Math.log10(fb) - Math.log10(fv)));
      const x = Math.round(this.cursor.x) + 0.5;
      c.strokeStyle = ACHSE;
      c.beginPath(); c.moveTo(x, y1); c.lineTo(x, y2 + hPh); c.stroke();
      let zy = y1 + hMag - 4 - k.length * 12;
      const tx = Math.min(this.cursor.x + 6, rl + b - 170);
      c.fillStyle = TEXT;
      c.fillText(fmtMess(fr, 'Hz', 4), tx, zy);
      for (const g of k) {
        zy += 12;
        const i = Math.max(Math.min(indexBei(g.f, fr), g.f.length - 1), 0);
        c.fillStyle = g.farbe;
        c.fillText(`${g.name} ${komma(g.db[i].toFixed(2))} dB  ${komma(g.phase[i].toFixed(1))}°`, tx, zy);
      }
    }
  }
}

/* ---------- Spektrum ---------- */

export class Spektrum {
  constructor(canvas) {
    this.f = new Flaeche(canvas);
    this.f.beiGroesse = () => this.zeichne();
    this.kurven = [];
    this.alt = [];
    this.cursor = null;
    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      this.cursor = {x: e.clientX - r.left, y: e.clientY - r.top};
      this.zeichne();
    });
    canvas.addEventListener('pointerleave', () => { this.cursor = null; this.zeichne(); });
  }

  /* kanaele: [{name, einheit, farbe, werte (gleichmäßig), fs}] */
  setze(kanaele, {alsAltBehalten = false} = {}) {
    if (alsAltBehalten && this.kurven.length) this.alt = this.kurven;
    this.kurven = kanaele.map(k => {
      const s = spektrum(k.werte, k.fs, 32768);
      return {...k, s};
    });
    this.zeichne();
  }

  loesche() { this.kurven = []; this.alt = []; this.zeichne(); }

  zeichne() {
    const f = this.f, c = f.ctx;
    f.passe();
    f.loesche();
    if (!this.kurven.length) {
      c.fillStyle = TEXT;
      c.textAlign = 'center';
      c.fillText('Noch kein Spektrum.', f.w / 2, f.h / 2);
      c.textAlign = 'left';
      return;
    }
    const rl = 44, rr = 8, ro = 8, ru = 18;
    const b = f.w - rl - rr, h = f.h - ro - ru;
    const fv = 20, fb = Math.min(this.kurven[0].fs / 2, 24000);
    const xF = logAchse(c, fv, fb, rl, ro, b, h, true);
    const oben = 20, unten = -100;
    const yD = d => ro + (oben - d) / (oben - unten) * h;
    c.textAlign = 'right';
    c.fillStyle = TEXT;
    for (let d = oben; d >= unten; d -= 20) {
      const y = Math.round(yD(d)) + 0.5;
      c.strokeStyle = RASTER;
      c.beginPath(); c.moveTo(rl, y); c.lineTo(rl + b, y); c.stroke();
      c.fillText(`${komma(d)} dB`, rl - 4, y + 3);
    }
    c.textAlign = 'left';
    const zeichneKurve = (k, alpha) => {
      const {f: fr, a} = k.s;
      c.save();
      c.beginPath(); c.rect(rl, ro, b, h); c.clip();
      c.globalAlpha = alpha;
      c.strokeStyle = k.farbe;
      c.lineWidth = 1.2;
      c.beginPath();
      let beg = false, xAlt = -1, spitze = -300;
      for (let i = 1; i < fr.length; i++) {
        if (fr[i] < fv) continue;
        if (fr[i] > fb) break;
        const x = Math.round(xF(fr[i]));
        const d = 20 * Math.log10(Math.max(a[i], 1e-9));
        if (x === xAlt) { if (d > spitze) spitze = d; continue; }
        if (xAlt >= 0) {
          const y = yD(spitze);
          if (!beg) { c.moveTo(xAlt, y); beg = true; } else c.lineTo(xAlt, y);
        }
        xAlt = x;
        spitze = d;
      }
      c.stroke();
      c.restore();
    };
    for (const k of this.alt) zeichneKurve(k, 0.3);
    for (const k of this.kurven) zeichneKurve(k, 1);

    /* Stärkste Linie */
    let zy = ro + 12;
    for (const k of this.kurven) {
      const {f: fr, a} = k.s;
      let iMax = 1;
      for (let i = 1; i < fr.length; i++) if (fr[i] >= fv && a[i] > a[iMax]) iMax = i;
      c.fillStyle = k.farbe;
      c.fillText(`${k.name}: ${fmtMess(fr[iMax], 'Hz', 4)}, ${fmtMess(a[iMax], k.einheit, 3)} Spitze`, rl + 6, zy);
      zy += 12;
    }
    if (this.cursor && this.cursor.x > rl && this.cursor.x < rl + b) {
      const fr = 10 ** (Math.log10(fv) + (this.cursor.x - rl) / b * (Math.log10(fb) - Math.log10(fv)));
      const x = Math.round(this.cursor.x) + 0.5;
      c.strokeStyle = ACHSE;
      c.beginPath(); c.moveTo(x, ro); c.lineTo(x, ro + h); c.stroke();
      c.fillStyle = TEXT;
      c.fillText(fmtMess(fr, 'Hz', 4), Math.min(this.cursor.x + 6, rl + b - 70), ro + h - 6);
    }
  }
}
