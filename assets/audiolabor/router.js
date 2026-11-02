/* Audiolabor: legt Drähte automatisch auf dem Raster. A*-Suche mit Richtung im Zustand.
   Regeln, damit nie aus Versehen eine Verbindung entsteht: Ein Draht läuft nicht durch Bauteile, nicht durch fremde Pins,
   nicht auf einem anderen Draht entlang und endet oder knickt nicht auf einem anderen Draht. Kreuzen darf er, das kostet aber. */

import { BAUTEILE, pinOrt, pinRichtung, weltRechteck } from './bauteile.js';

export const RASTER = 20;

const RICHTUNG = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const KOSTEN_KNICK = 3, KOSTEN_KREUZUNG = 6, KOSTEN_FALSCHE_RICHTUNG = 12;
const MAX_SCHRITTE = 40000;

export const punktKey = (x, y) => x * 65536 + y + 32768;
const kanteKey = (x, y, waagrecht) => (x * 65536 + y + 32768) * 2 + (waagrecht ? 1 : 0);

/* Hindernisse aus dem Projekt. Teile und Drähte lassen sich ausnehmen, etwa alles, was gerade gezogen wird. */
export function baueHindernisse(projekt, {ohneDraehte = null, ohneTeile = null} = {}) {
  const punkte = new Set();
  const kanten = new Set();
  const innen = new Set();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const rand = (x, y) => { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; };

  for (const t of projekt.teile) {
    if (ohneTeile?.has(t.id)) continue;
    const def = BAUTEILE[t.typ];
    const k = weltRechteck(t);
    for (let x = Math.ceil(k.x0 / RASTER) * RASTER; x <= k.x1; x += RASTER) {
      for (let y = Math.ceil(k.y0 / RASTER) * RASTER; y <= k.y1; y += RASTER) punkte.add(punktKey(x, y));
    }
    for (const pin of def.pins) {
      const o = pinOrt(t, pin);
      punkte.add(punktKey(o.x, o.y));
      rand(o.x, o.y);
      /* Auch die Rasterpunkte auf der Anschlussleitung sind belegt, wenn sie geradeaus zum Körper führt. */
      const r = pinRichtung(t, pin);
      if (r < 0 || (r % 2 === 0 ? o.y < k.y0 || o.y > k.y1 : o.x < k.x0 || o.x > k.x1)) continue;
      for (let x = o.x, y = o.y; x < k.x0 || x > k.x1 || y < k.y0 || y > k.y1; x -= RICHTUNG[r][0] * RASTER, y -= RICHTUNG[r][1] * RASTER) punkte.add(punktKey(x, y));
    }
    rand(k.x0, k.y0);
    rand(k.x1, k.y1);
  }
  for (const d of projekt.draehte) {
    if (ohneDraehte?.has(d.id)) continue;
    for (let i = 0; i < d.punkte.length; i++) {
      const [x, y] = d.punkte[i];
      punkte.add(punktKey(x, y));
      rand(x, y);
      if (i === 0) continue;
      const [ax, ay] = d.punkte[i - 1];
      if (ay === y) {
        const von = Math.min(ax, x), bis = Math.max(ax, x);
        for (let q = von; q < bis; q += RASTER) {
          kanten.add(kanteKey(q, y, true));
          if (q > von) innen.add(punktKey(q, y));
        }
      } else if (ax === x) {
        const von = Math.min(ay, y), bis = Math.max(ay, y);
        for (let q = von; q < bis; q += RASTER) {
          kanten.add(kanteKey(x, q, false));
          if (q > von) innen.add(punktKey(x, q));
        }
      }
    }
  }
  return {punkte, kanten, innen, x0, y0, x1, y1};
}

/* Kleiner Binärheap für die offene Liste */
class Halde {
  constructor() { this.k = []; this.w = []; }
  get leer() { return this.k.length === 0; }
  rein(schluessel, wert) {
    const k = this.k, w = this.w;
    let i = k.length;
    k.push(schluessel);
    w.push(wert);
    while (i > 0) {
      const v = (i - 1) >> 1;
      if (k[v] <= schluessel) break;
      k[i] = k[v];
      w[i] = w[v];
      i = v;
    }
    k[i] = schluessel;
    w[i] = wert;
  }
  raus() {
    const k = this.k, w = this.w;
    const erg = w[0];
    const lk = k.pop(), lw = w.pop();
    const n = k.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let c = 2 * i + 1;
        if (c >= n) break;
        if (c + 1 < n && k[c + 1] < k[c]) c++;
        if (k[c] >= lk) break;
        k[i] = k[c];
        w[i] = w[c];
        i = c;
      }
      k[i] = lk;
      w[i] = lw;
    }
    return erg;
  }
}

const ordne = pts => {
  const a = [];
  for (const p of pts) {
    const l = a[a.length - 1];
    if (!l || l[0] !== p[0] || l[1] !== p[1]) a.push(p);
  }
  for (let i = a.length - 2; i > 0; i--) {
    const [x0, y0] = a[i - 1], [x1, y1] = a[i], [x2, y2] = a[i + 1];
    if ((x0 === x1 && x1 === x2) || (y0 === y1 && y1 === y2)) a.splice(i, 1);
  }
  return a;
};

/* Sucht einen Weg von start nach ziel. startRichtung und zielRichtung (0 rechts, 1 unten, 2 links, 3 oben; −1 egal)
   sagen, wohin die Anschlussleitung eines Pins zeigt: Der Draht verlässt ihn möglichst in dieser Richtung und kommt von dort an. */
export function findeWeg(h, start, ziel, {startRichtung = -1, zielRichtung = -1} = {}) {
  const [sx, sy] = start, [zx, zy] = ziel;
  if (sx === zx && sy === zy) return [start];
  /* Suchfeld: alles Belegte plus Rand, auf das Raster ausgerichtet (Bauteilkörper enden nicht immer auf dem Raster) */
  const rand = 6 * RASTER;
  const unten = v => Math.floor(v / RASTER) * RASTER, oben = v => Math.ceil(v / RASTER) * RASTER;
  const minX = unten(Math.min(sx, zx, h.x0)) - rand, minY = unten(Math.min(sy, zy, h.y0)) - rand;
  const maxX = oben(Math.max(sx, zx, h.x1)) + rand, maxY = oben(Math.max(sy, zy, h.y1)) + rand;
  const b = Math.round((maxX - minX) / RASTER) + 1, t = Math.round((maxY - minY) / RASTER) + 1;
  const index = (x, y, d) => (((x - minX) / RASTER) + ((y - minY) / RASTER) * b) * 4 + d;
  const zahl = b * t * 4;
  const g = new Float32Array(zahl).fill(Infinity);
  const her = new Int32Array(zahl).fill(-1);
  const zu = new Uint8Array(zahl);
  const offen = new Halde();
  const zielKey = punktKey(zx, zy), startKey = punktKey(sx, sy);
  const schaetze = (x, y) => (Math.abs(x - zx) + Math.abs(y - zy)) / RASTER;

  for (let d = 0; d < 4; d++) {
    const i = index(sx, sy, d);
    g[i] = startRichtung >= 0 && d !== startRichtung ? KOSTEN_FALSCHE_RICHTUNG : 0;
    offen.rein(g[i] + schaetze(sx, sy), i);
  }

  let schritte = 0, ende = -1;
  while (!offen.leer && schritte++ < MAX_SCHRITTE) {
    const i = offen.raus();
    if (zu[i]) continue;
    zu[i] = 1;
    const d = i & 3;
    const zelle = i >> 2;
    const y = minY + Math.floor(zelle / b) * RASTER, x = minX + (zelle % b) * RASTER;
    const key = punktKey(x, y);
    if (key === zielKey) { ende = i; break; }
    const aufDraht = key !== startKey && h.innen.has(key);
    for (let nd = 0; nd < 4; nd++) {
      if (nd === ((d + 2) & 3)) continue;
      if (aufDraht && nd !== d) continue;
      const nx = x + RICHTUNG[nd][0] * RASTER, ny = y + RICHTUNG[nd][1] * RASTER;
      if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
      const nKey = punktKey(nx, ny);
      if (nKey !== zielKey && h.punkte.has(nKey)) continue;
      const waagrecht = nd % 2 === 0;
      const kante = waagrecht ? kanteKey(Math.min(x, nx), y, true) : kanteKey(x, Math.min(y, ny), false);
      if (h.kanten.has(kante)) continue;
      let k = 1;
      if (nd !== d) k += KOSTEN_KNICK;
      if (h.innen.has(nKey) && nKey !== zielKey) k += KOSTEN_KREUZUNG;
      /* Der letzte Schritt soll gegen die Richtung der Anschlussleitung laufen. */
      if (nKey === zielKey && zielRichtung >= 0 && nd !== ((zielRichtung + 2) & 3)) k += KOSTEN_FALSCHE_RICHTUNG;
      const j = index(nx, ny, nd);
      const neu = g[i] + k;
      if (neu < g[j]) {
        g[j] = neu;
        her[j] = i;
        offen.rein(neu + schaetze(nx, ny), j);
      }
    }
  }
  if (ende < 0) return null;
  const weg = [];
  for (let i = ende; i >= 0; i = her[i]) {
    const zelle = i >> 2;
    weg.push([minX + (zelle % b) * RASTER, minY + Math.floor(zelle / b) * RASTER]);
  }
  weg.reverse();
  return ordne(weg);
}

/* Nur für die Vorschau, wenn die Suche nichts findet: ein gerader Strich. Verlegt wird so nie, er könnte fremde Netze berühren. */
export function geraderWeg(a, b) {
  if (a[0] === b[0] || a[1] === b[1]) return [a, b];
  return [a, [b[0], a[1]], b];
}
