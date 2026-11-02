/* Audiolabor: Signalquellen als reine Funktionen der Zeit. Derselbe Code liefert die Stützstellen für ngspice (PWL)
   und die Abtastwerte im Live-Löser. Damit bekommen beide Rechenwege bei gleichem Seed und gleicher Zeit denselben Wert.
   Die Bedeutung von PULSE und SIN entspricht der ngspice-Dokumentation. */

const ZWEI_PI = 2 * Math.PI;

/* Eine Periode, tt läuft ab Periodenbeginn */
export function pulsForm(w, tt) {
  if (tt < w.tr) return w.low + (w.high - w.low) * tt / w.tr;
  if (tt < w.tr + w.pw) return w.high;
  if (tt < w.tr + w.pw + w.tf) return w.high + (w.low - w.high) * (tt - w.tr - w.pw) / w.tf;
  return w.low;
}

export function pulsWert(w, t) {
  if (t < w.td) return w.low;
  return pulsForm(w, w.per > 0 ? (t - w.td) % w.per : t - w.td);
}

/* Hüllkurve: linearer Anstieg, dann exponentieller Abfall. Beginnt mit jeder Periode neu. */
export function huellForm(w, tt) {
  if (tt < w.a) return w.v * tt / w.a;
  return w.v * Math.exp(-(tt - w.a) / w.tau);
}

export function huellWert(w, t) {
  return huellForm(w, w.per > 0 ? t % w.per : t);
}

/* Kleiner Zufallsgenerator mit festem Seed (mulberry32): gleicher Seed, gleiche Folge. */
export function zufall(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/* Gaußsches Rauschen als Folge von Stützstellen im festen Raster. Zwischen zwei Stützstellen wird linear übergeblendet,
   genau wie bei einer PWL-Quelle. */
export class Rauschfolge {
  constructor(w) {
    this.w = w;
    this.zuruecksetzen();
  }
  zuruecksetzen() {
    this.z = zufall(this.w.seed);
    this.index = 0;
    this.a = this._gauss();
    this.b = this._gauss();
  }
  _gauss() {
    const u = Math.max(this.z(), 1e-12), v = this.z();
    return this.w.off + this.w.rms * Math.sqrt(-2 * Math.log(u)) * Math.cos(ZWEI_PI * v);
  }
  /* Nur für aufsteigende Zeiten gedacht. */
  wert(t) {
    const pos = t * this.w.rate;
    const i = Math.floor(pos);
    while (this.index < i) { this.a = this.b; this.b = this._gauss(); this.index++; }
    return this.a + (this.b - this.a) * (pos - i);
  }
}

/* Stützstellen für eine PWL-Quelle in ngspice. Liefert {t, v} als gleich lange Arrays. */
export function pwlPunkte(w, dauer) {
  const t = [], v = [];
  if (w.art === 'rauschen') {
    const r = new Rauschfolge(w), n = Math.ceil(dauer * w.rate) + 1;
    for (let i = 0; i <= n; i++) { const ti = i / w.rate; t.push(ti); v.push(r.wert(ti)); }
    return {t, v};
  }
  if (w.art === 'huelle') {
    /* Stützstellen dicht genug für den exponentiellen Abfall: rund 1 % Fehler bei τ/8 */
    const schritt = Math.max(w.tau / 8, 2e-5);
    const per = w.per > 0 ? w.per : dauer + 1;
    for (let start = 0; start < dauer + per; start += per) {
      if (start > dauer) break;
      if (start === 0) { t.push(0); v.push(0); } else { t.push(start - 1e-7); v.push(huellWert(w, per - 1e-7)); t.push(start); v.push(0); }
      t.push(start + w.a); v.push(w.v);
      for (let tt = w.a + schritt; tt < per && start + tt <= dauer + schritt; tt += schritt) { t.push(start + tt); v.push(huellWert(w, tt)); }
    }
    return {t, v};
  }
  if (w.art === 'proben') {
    /* Abtastwerte einer Audiodatei oder eines Faust-Moduls */
    const n = Math.min(w.werte.length, Math.ceil(dauer * w.rate) + 2);
    for (let i = 0; i < n; i++) { t.push(i / w.rate); v.push(w.werte[i] * w.faktor); }
    if (!t.length) { t.push(0); v.push(0); }
    return {t, v};
  }
  throw new Error(`Keine PWL-Darstellung für die Quelle „${w.art}“`);
}
