/* Audiolabor: der allgemeine Live-Löser, Teil 2. Rechnet einen Plan Abtastwert für Abtastwert.
   Läuft unverändert im AudioWorklet und, für Vergleiche mit ngspice, im Prüfstand.
   Im Rechenweg wird kein Speicher angefordert. Die Iterationszahl ist begrenzt, NaN und Nichtkonvergenz werden gezählt und behandelt. */

import { pulsWert, pulsForm, huellWert, huellForm, Rauschfolge } from './quellen.js';
import { luZerlege, luLoese, luVorzeichen } from './lu.js';

const SIN = 1, PULS = 2, HUELLE = 3, RAUSCHEN = 4, DIGITAL = 5, SCHMITT = 6;
const ZWEI_PI = 2 * Math.PI;
const TOL_V = 1e-6;
/* Liegt ein Knoten zwischen gesperrten Übergängen, ist K dort riesig: 10 fA verschieben ihn schon um Millivolt. Die Schranke je Zeile
   wächst deshalb mit K, wie abstol in SPICE. Sonst läge sie im Rundungsrauschen, und Newton käme nie zur Ruhe. */
const TOL_I = 1e-14;
/* Grenzen je Abtastwert. Bisher brauchte kein Versuch im laufenden Betrieb mehr als 8 Iterationen, der Kaltstart im Mittel 14. */
const ITER_NEWTON = 12, ITER_KALT = 32;

/* Spannungsbegrenzung für pn-Übergänge, in derselben Form wie DEVpnjlim in ngspice, dazu ein Deckel je Schritt nach oben.
   In einer Kette mit hoher Gesamtverstärkung zeigt der erste Newton-Schritt Milliarden Volt an, und selbst der Logarithmus lässt dann fast 1 V zu.
   Von da baut jeder weitere Schritt den Strom nur um den Faktor e ab, das wären rund 40 Schritte. SPICE verkleinert in so einem Fall den Zeitschritt, das geht hier nicht. */
function pnjlim(vneu, valt, nvt, vkrit) {
  if (vneu > vkrit && Math.abs(vneu - valt) > nvt + nvt) {
    if (valt > 0) {
      const arg = (vneu - valt) / nvt;
      if (arg > 0) {
        const hub = 2 + Math.log(arg - 2);
        return valt + nvt * (hub < 8 ? hub : 8);
      }
      return valt - nvt * (2 + Math.log(2 - arg));
    }
    return nvt * Math.log(vneu / nvt);
  }
  if (vneu < 0) {
    const arg = valt > 0 ? -valt - 1 : 2 * valt - 1;
    if (vneu < arg) return arg;
  }
  return vneu;
}

/* e hoch x. Weit unter null ist das Ergebnis neben der 1 in (e − 1) nicht mehr sichtbar, und gesperrte Übergänge sind der häufigste Fall.
   Die Konstante ist bewusst keine ganze Null: So bleibt das Ergebnis immer eine Gleitkommazahl, und der Compiler muss nichts einpacken. */
const E_UNTEN = Math.exp(-40);
const expBegrenzt = x => (x < -40 ? E_UNTEN : Math.exp(x > 300 ? 300 : x));

/* aus = k0 + M·x für eine dünn besetzte Matrix */
function malDuenn(m, x, k0, aus) {
  const zeile = m.zeile, spalte = m.spalte, wert = m.wert;
  for (let r = 0, j = 0; r < aus.length; r++) {
    const ende = zeile[r + 1];
    let sum = k0[r];
    for (; j < ende; j++) sum += wert[j] * x[spalte[j]];
    aus[r] = sum;
  }
}

/* Ströme und Ableitungen je Bauteilart. Getrennte Funktionen halten jede Stelle einförmig, nur so optimiert der Compiler sie dauerhaft.
   Die Ableitungen stehen in g._j: Zeile = Ausgang, Spalte = Steuerspannung. */
function bewerteDiode(g, v, ii) {
  const x = v[g.v0];
  const e = expBegrenzt(x / g.nvt);
  let i = g.is * (e - 1), d = g.is * e / g.nvt;
  if (g.bv > 0 && x < -g.bv + 40 * g.nvt) {
    const b = expBegrenzt((-g.bv - x) / g.nvt);
    i -= g.ibv * b;
    d += g.ibv * b / g.nvt;
  }
  ii[g.i0] = i;
  g._j[0] = d;
}

function bewerteSteuerquelle(g, v, ii) {
  const a = g.gm / g.imax * v[g.v0];
  /* Mit Gegenkopplung liegt ein OPV fast immer hier: tanh a ≈ a − a³/3 und seine Ableitung, Fehler unter 2·10⁻⁹. */
  if (a > -0.01 && a < 0.01) {
    const a2 = a * a;
    ii[g.i0] = g.imax * a * (1 - a2 / 3);
    g._j[0] = g.gm * (1 - a2);
  } else {
    ii[g.i0] = g.imax * Math.tanh(a);
    const c = Math.cosh(a > 20 ? 20 : a < -20 ? -20 : a);
    g._j[0] = g.gm / (c * c);
  }
}

function bewerteBipolar(g, v, ii) {
  const o = g.i0, j = g._j;
  const vbe = v[g.v0], vbc = v[g.v0 + 1];
  const ef = expBegrenzt(vbe / g.nf), er = expBegrenzt(vbc / g.nr);
  const ibf = g.is * (ef - 1), ibr = g.is * (er - 1);
  const dibf = g.is * ef / g.nf, dibr = g.is * er / g.nr;
  /* Gummel-Poon-Basisladung ohne Parasiten */
  const q1Nenner = 1 - (g.vaf > 0 ? vbc / g.vaf : 0) - (g.var > 0 ? vbe / g.var : 0);
  const q1 = 1 / (q1Nenner > 0.1 ? q1Nenner : 0.1);
  const q2 = (g.ikf > 0 ? ibf / g.ikf : 0) + (g.ikr > 0 ? ibr / g.ikr : 0);
  const wurzel = Math.sqrt(1 + 4 * (q2 > -0.24 ? q2 : -0.24));
  const qb = q1 * (1 + wurzel) / 2;
  const dq1be = (g.var > 0 ? q1 * q1 / g.var : 0), dq1bc = (g.vaf > 0 ? q1 * q1 / g.vaf : 0);
  const dq2be = (g.ikf > 0 ? dibf / g.ikf : 0), dq2bc = (g.ikr > 0 ? dibr / g.ikr : 0);
  const dqbbe = dq1be * (1 + wurzel) / 2 + q1 * dq2be / wurzel;
  const dqbbc = dq1bc * (1 + wurzel) / 2 + q1 * dq2bc / wurzel;
  const it = (ibf - ibr) / qb;
  const ditbe = dibf / qb - it * dqbbe / qb;
  const ditbc = -dibr / qb - it * dqbbc / qb;
  /* Basisströme */
  const ib1 = ibf / g.bf, ib2 = ibr / g.br;
  let ile = 0, dile = 0, ilc = 0, dilc = 0;
  if (g.ise > 0) { const e = expBegrenzt(vbe / g.ne); ile = g.ise * (e - 1); dile = g.ise * e / g.ne; }
  if (g.isc > 0) { const e = expBegrenzt(vbc / g.nc); ilc = g.isc * (e - 1); dilc = g.isc * e / g.nc; }
  /* Ausgang 0: Strom von C nach E (Transportstrom minus Basis-Kollektor-Anteil),
     Ausgang 1: Strom von B nach E. Der B-C-Strom fließt also über beide. */
  const ibc = ib2 + ilc, dibc = dibr / g.br + dilc;
  ii[o] = it - ibc;
  ii[o + 1] = ib1 + ile + ibc;
  j[0] = ditbe;
  j[1] = ditbc - dibc;
  j[2] = dibf / g.bf + dile;
  j[3] = dibc;
}

function bewerteMosfet(g, v, ii) {
  const o = g.i0, j = g._j;
  let vgs = v[g.v0], vds = v[g.v0 + 1];
  const tausch = vds < 0;
  if (tausch) { vgs -= vds; vds = -vds; }
  const vov = vgs - g.vto;
  let id = 0, gm = 0, gds = 0;
  if (vov > 0) {
    const l = 1 + g.lambda * vds;
    if (vds < vov) {
      id = g.kp * (vov - vds / 2) * vds * l;
      gm = g.kp * vds * l;
      gds = g.kp * (vov - vds) * l + g.kp * (vov - vds / 2) * vds * g.lambda;
    } else {
      id = g.kp / 2 * vov * vov * l;
      gm = g.kp * vov * l;
      gds = g.kp / 2 * vov * vov * g.lambda;
    }
  }
  if (tausch) { ii[o] = -id; j[0] = -gm; j[1] = gm + gds; } else { ii[o] = id; j[0] = gm; j[1] = gds; }
}

export class LiveKern {
  constructor(plan, {maxIter = ITER_NEWTON} = {}) {
    this.plan = plan;
    this.maxIter = maxIter;
    const {S, U, Mv, Mi, Pgesamt} = plan;
    /* Zustände, Eingänge und Ströme liegen hintereinander in einem Vektor: Die Koeffizienten des Plans rechnen damit in einem Zug. */
    this.x = new Float64Array(S + U + Mi);
    this.s = this.x.subarray(0, S);
    this.u = this.x.subarray(S, S + U);
    this.i = this.x.subarray(S + U);
    this.vx = new Float64Array(S);
    this.v = new Float64Array(Mv);
    this.vAlt = new Float64Array(Mv);
    this.iAlt = new Float64Array(Mi);
    this.luGut = false;
    this.v0 = new Float64Array(Mv);
    this.F = new Float64Array(Mv);
    this.J = new Float64Array(Mv * Mv);
    this.perm = new Int32Array(Mv);
    this.tolZeile = new Float64Array(Mv);
    for (let r = 0; r < Mv; r++) {
      let groesste = 0;
      for (let j = plan.Kvi.zeile[r]; j < plan.Kvi.zeile[r + 1]; j++) groesste = Math.max(groesste, Math.abs(plan.Kvi.wert[j]));
      this.tolZeile[r] = Math.max(TOL_V, TOL_I * groesste);
    }
    this.p = new Float64Array(Pgesamt);
    this.geraete = plan.geraete.map(g => ({...g, _j: new Float64Array(g.nSt * g.nAus)}));
    /* Grenze für die Spannungsbegrenzung, wie pnjlim in SPICE */
    for (const g of this.geraete) {
      if (g.typ === 'D') g.vkrit = g.nvt * Math.log(g.nvt / (Math.SQRT2 * g.is));
      if (g.typ === 'Q') { g.vkritF = g.nf * Math.log(g.nf / (Math.SQRT2 * g.is)); g.vkritR = g.nr * Math.log(g.nr / (Math.SQRT2 * g.is)); }
    }
    const vonTyp = typ => this.geraete.filter(g => g.typ === typ);
    this.dioden = vonTyp('D');
    this.steuerquellen = vonTyp('GT');
    this.bipolare = vonTyp('Q');
    this.mosfets = vonTyp('M');
    this.quellen = plan.eingaenge.map(q => this._quelle(q));
    this.digital = plan.digital.map(d => ({...d, hoch: true, xAlt: 0}));
    this.schritte = 0;
    this.t = 0;
    /* Überwachung */
    this.nichtKonvergiert = 0;
    this.newtonSumme = 0;
    this.newtonMax = 0;
    this.iter = 0;
    this.nanZaehler = 0;
    this.digitalEin = null;
    this.digitalPos = 0;
    this.digitalAlt = 0;
    this.eingefroren = false;
  }

  _quelle(q) {
    const w = q.welle;
    const z = {art: q.art, w, id: q.id, teil: q.teilQuelle, phase: 0, manuell: !!w.manuell && w.ausloesung === 'taster', an: false, seit: -1e9};
    if (q.art === RAUSCHEN) z.rausch = new Rauschfolge(w);
    return z;
  }

  /* Parameter einer Quelle ändern, ohne neuen Plan. */
  setzeQuelle(teil, welle) {
    for (const z of this.quellen) {
      if (z.teil !== teil) continue;
      if (welle.art === z.w.art || (z.art !== RAUSCHEN && z.art !== DIGITAL)) {
        z.w = welle;
        z.art = {dc: 0, sin: 1, puls: 2, huelle: 3, rauschen: 4, digital: 5}[welle.art];
        z.manuell = !!welle.manuell && welle.ausloesung === 'taster';
        if (z.art === RAUSCHEN && !z.rausch) z.rausch = new Rauschfolge(welle);
        if (z.rausch) z.rausch.w = welle;
      }
    }
  }

  /* Taster und Tastatur: löst Gate, Trigger oder Hüllkurve aus. */
  taste(teil, an) {
    for (const z of this.quellen) {
      if (z.teil !== teil) continue;
      z.an = an;
      if (an) z.seit = this.t;
    }
  }

  _quellenWert(z, t) {
    const w = z.w;
    switch (z.art) {
      case SIN:
        z.phase += w.f * this.plan.h;
        if (z.phase >= 1) z.phase -= Math.floor(z.phase);
        return w.off + w.amp * Math.sin(ZWEI_PI * z.phase + w.phase);
      case PULS:
        if (w.manuell && z.manuell) {
          /* Manuell: läuft ab dem letzten Auslösen, solange kein Takt gewählt ist. */
          const dt = t - z.seit;
          if (z.an && w.haltend) return dt < w.tr ? pulsForm(w, dt) : w.high;
          return dt >= 0 && dt < w.tr + w.pw + w.tf ? pulsForm(w, dt) : w.low;
        }
        if (w.manuell) return pulsWert(w, t);
        /* Generator: Phase läuft mit, damit Frequenzänderungen nicht springen */
        z.phase += this.plan.h / w.per;
        if (z.phase >= 1) z.phase -= Math.floor(z.phase);
        return pulsForm(w, z.phase * w.per);
      case HUELLE:
        if (z.manuell) {
          const dt = t - z.seit;
          return dt >= 0 ? huellForm(w, dt) : 0;
        }
        return huellWert(w, t);
      case RAUSCHEN:
        return z.rausch.wert(t);
      case DIGITAL: {
        const e = this.digitalEin;
        if (!e) return 0;
        /* Lineare Überabtastung des digitalen Eingangssignals */
        const pos = this.digitalPos / this.plan.ueber;
        const i = Math.floor(pos);
        const a = i === 0 ? this.digitalAlt : e[i - 1];
        const b = e[Math.min(i, e.length - 1)];
        return (a + (b - a) * (pos - i)) * w.faktor;
      }
      default:
        return w.v;
    }
  }

  /* Ein Zeitschritt. Am Ende stehen in this.p die Messgrößen (nur wenn messen gesetzt ist). */
  schritt(messen) {
    const pl = this.plan;
    const {S, U, Mv} = pl;
    const s = this.s, u = this.u, vx = this.vx, x = this.x;
    this.schritte++;
    const t = this.schritte * pl.h;
    this.t = t;

    if (!this.eingefroren) {
      for (let k = 0; k < U; k++) {
        const z = this.quellen[k];
        if (z.art !== SCHMITT) u[k] = z.art === 0 ? z.w.v : this._quellenWert(z, t);
      }
      if (this.digitalEin) this.digitalPos++;
    }

    let geloest = true;
    if (Mv > 0) {
      malDuenn(pl.Kv, x, pl.Kv0, this.v0);
      geloest = this._newton();
    }
    malDuenn(pl.Kx, x, pl.Kx0, vx);

    /* Messgrößen und digitale Eingänge verwenden noch die alten Zustände, also vor dem Fortschreiben. */
    const dig = this.digital;
    if (messen || dig.length) this._messen();

    /* Ohne Lösung bleiben die Zustände stehen: Mit alten Strömen weiterzurechnen, würde sie aufschaukeln. */
    if (geloest) {
      const c1 = pl.c1, c2 = pl.c2;
      for (let k = 0; k < S; k++) s[k] = c1[k] * vx[k] + c2[k] * s[k];
    }

    /* Schmitt-Trigger schalten zwischen den Schritten: Der neue Ausgang gilt ab dem nächsten Schritt. */
    for (let d = 0; d < dig.length; d++) {
      const g = dig[d], p = this.p;
      const vdd = p[g.pVdd] > 0.5 ? p[g.pVdd] : 0.5;
      /* Der neue Ausgang wirkt erst im Mittel einen Schritt später. Das gleicht die lineare Vorausschau aus. */
      const x = p[g.pEin] / vdd;
      const vor = this.eingefroren ? x : 2 * x - g.xAlt;
      g.xAlt = x;
      if (g.hoch) { if (vor > g.vp) g.hoch = false; } else if (vor < g.vn) g.hoch = true;
      u[g.u] = g.hoch ? p[g.pVdd] : 0;
    }
  }

  _messen() {
    malDuenn(this.plan.Kp, this.x, this.plan.Kp0, this.p);
  }

  /* Ströme und Ableitungen aller nichtlinearen Bauteile an der Stelle v */
  _bewerte(v) {
    const ii = this.i;
    const {dioden, steuerquellen, bipolare, mosfets} = this;
    for (let k = 0; k < dioden.length; k++) bewerteDiode(dioden[k], v, ii);
    for (let k = 0; k < steuerquellen.length; k++) bewerteSteuerquelle(steuerquellen[k], v, ii);
    for (let k = 0; k < bipolare.length; k++) bewerteBipolar(bipolare[k], v, ii);
    for (let k = 0; k < mosfets.length; k++) bewerteMosfet(mosfets[k], v, ii);
  }

  /* Newton-Schritt Δ auf v anwenden, mit Begrenzung an den pn-Übergängen wie in SPICE */
  _newtonSchritt(v, d) {
    const {dioden, steuerquellen, bipolare, mosfets} = this;
    for (let k = 0; k < dioden.length; k++) {
      const g = dioden[k], q = g.v0, neu = v[q] + d[q];
      if (g.bv > 0 && neu < -g.bv) v[q] = -g.bv - pnjlim(-g.bv - neu, -g.bv - v[q], g.nvt, g.vkrit);
      else v[q] = pnjlim(neu, v[q], g.nvt, g.vkrit);
    }
    for (let k = 0; k < steuerquellen.length; k++) { const q = steuerquellen[k].v0; v[q] += d[q]; }
    for (let k = 0; k < bipolare.length; k++) {
      const g = bipolare[k], q = g.v0;
      v[q] = pnjlim(v[q] + d[q], v[q], g.nf, g.vkritF);
      v[q + 1] = pnjlim(v[q + 1] + d[q + 1], v[q + 1], g.nr, g.vkritR);
    }
    for (let k = 0; k < mosfets.length; k++) {
      const q = mosfets[k].v0;
      for (let m = q; m < q + 2; m++) v[m] += d[m] > 2 ? 2 : d[m] < -2 ? -2 : d[m];
    }
  }

  /* Löst v = v0 + K·i(v) für den aktuellen Abtastwert. */
  _newton() {
    const {Mv, Mi} = this.plan;
    const v = this.v, ii = this.i, vAlt = this.vAlt, iAlt = this.iAlt;
    for (let r = 0; r < Mv; r++) vAlt[r] = v[r];
    for (let r = 0; r < Mi; r++) iAlt[r] = ii[r];
    this.iter = 0;
    let ok = this._suche(this.maxIter);
    if (!ok) {
      /* Kippt eine Schaltung mit Mitkopplung, endet der Lösungszweig: Neben dem alten Stand gibt es keine Lösung mehr, und Newton läuft dort
         im Kreis. Die neue liegt Volt entfernt. Von gesperrten Übergängen aus findet Newton sie zuverlässig. */
      v.fill(0);
      this.luGut = false;
      ok = this._suche(ITER_KALT);
    }
    this.newtonSumme += this.iter;
    if (this.iter > this.newtonMax) this.newtonMax = this.iter;
    if (!ok) {
      /* Definierte Behandlung: Der letzte konvergierte Stand gilt weiter, damit kein Ausreißer in die Zustände gelangt. */
      this.nichtKonvergiert++;
      for (let r = 0; r < Mv; r++) v[r] = vAlt[r];
      for (let r = 0; r < Mi; r++) ii[r] = iAlt[r];
      this.luGut = false;
    }
    for (let r = 0; r < Mv; r++) {
      if (v[r] !== v[r] || v[r] === Infinity || v[r] === -Infinity) { this._nanAuffangen(); return false; }
    }
    return ok;
  }

  /* Newton ab dem aktuellen v, höchstens maxIter Schritte. Die Zerlegung der Jacobi-Matrix wird wiederverwendet, solange sie noch gut genug ist:
     Im Kleinsignalbetrieb ändert sie sich von Abtastwert zu Abtastwert kaum, und die Zerlegung ist der teuerste Teil. */
  _suche(maxIter) {
    const pl = this.plan;
    const {Mv} = pl;
    const v = this.v, v0 = this.v0, F = this.F, J = this.J, ii = this.i, perm = this.perm, tolZeile = this.tolZeile;
    const kz = pl.Kvi.zeile, ks = pl.Kvi.spalte, kw = pl.Kvi.wert;
    let restAlt = Infinity;
    for (let it = 0; it < maxIter; it++) {
      this.iter++;
      this._bewerte(v);
      /* Restfehler: F = v − v0 − K·i (K enthält das Vorzeichen der Einspeisung) */
      let rest = 0, fertig = true;
      for (let r = 0; r < Mv; r++) {
        let sum = v[r] - v0[r];
        for (let j = kz[r], ende = kz[r + 1]; j < ende; j++) sum -= kw[j] * ii[ks[j]];
        F[r] = sum;
        const a = sum < 0 ? -sum : sum;
        if (a > rest) rest = a;
        if (a > tolZeile[r]) fertig = false;
      }
      if (fertig) return true;

      /* Eine alte Zerlegung taugt, solange der Restfehler klein ist und je Schritt um mindestens den Faktor 10 fällt. */
      let geschoben = false;
      if (!this.luGut || rest > 1e-2 || rest > 0.1 * restAlt) {
        this.luGut = this._zerlege(0);
        /* Negative Determinante: Hier koppelt die Schaltung mit, und v liegt auf dem instabilen Zweig zwischen zwei stabilen Zuständen.
           Reiner Newton liefe genau dorthin zurück. In echt kippt die Schaltung weg. Mit dem Zuschlag μ auf der Diagonalen folgt die Rechnung
           dieser Richtung: Jenseits des instabilen Eigenwerts wächst die Abweichung je Schritt um mindestens den Faktor μ / (μ − |λ|). */
        for (let mu = 1; this.luGut && mu < 1e12 && luVorzeichen(J, Mv, perm) < 0; mu *= 2) {
          this.luGut = this._zerlege(mu);
          geschoben = true;
        }
        if (!this.luGut) return false;
      }
      restAlt = geschoben ? Infinity : rest;

      /* J·Δ = −F lösen, ohne Speicher anzufordern. Danach steht Δ in F. */
      for (let r = 0; r < Mv; r++) F[r] = -F[r];
      luLoese(J, perm, Mv, F);
      this._newtonSchritt(v, F);
      /* Eine verschobene Zerlegung taugt nicht für den nächsten Schritt. */
      if (geschoben) this.luGut = false;
    }
    return false;
  }

  /* Zerlegt J + μ·I mit der Jacobi-Matrix J = I − K·G an der zuletzt bewerteten Stelle. */
  _zerlege(mu) {
    const {Mv, Mi, KviVoll} = this.plan;
    const J = this.J, gs = this.geraete;
    J.fill(0);
    for (let r = 0; r < Mv; r++) J[r * Mv + r] = 1 + mu;
    for (let d = 0; d < gs.length; d++) {
      const g = gs[d], nA = g.nAus, nS = g.nSt, jd = g._j;
      for (let a = 0; a < nA; a++) {
        const spalteI = g.i0 + a;
        for (let b = 0; b < nS; b++) {
          const w = jd[a * nS + b];
          if (w === 0) continue;
          const ziel = g.v0 + b;
          for (let r = 0; r < Mv; r++) J[r * Mv + ziel] -= KviVoll[r * Mi + spalteI] * w;
        }
      }
    }
    return luZerlege(J, Mv, this.perm);
  }

  _nanAuffangen() {
    this.nanZaehler++;
    this.v.fill(0);
    this.i.fill(0);
  }

  /* ---------- Zustände zwischen Plänen übertragen ---------- */

  /* Physikalischer Zustand je Kondensator und Spule: Spannung und Strom. Dazu die Steuerspannungen der Halbleiter und die Quellenphasen. */
  zustandLesen() {
    const pl = this.plan;
    const zust = {};
    pl.zustaende.forEach((z, k) => {
      const a = pl.alpha[k], g = pl.gz[k], vx = this.vx[k], s = this.s[k];
      zust[z.id] = z.art === 'C' ? {v: vx, i: a > 0 ? (s - g * vx) / a : 0} : {v: vx, i: s - a * g * vx};
    });
    const halb = {};
    for (const g of this.geraete) halb[g.id] = Array.from(this.v.subarray(g.v0, g.v0 + g.nSt));
    const quellen = {};
    for (const z of this.quellen) quellen[z.id] = {phase: z.phase, an: z.an, seit: z.seit, rausch: z.rausch ? {index: z.rausch.index, a: z.rausch.a, b: z.rausch.b, z: z.rausch.z} : null};
    const digital = {};
    for (const d of this.digital) digital[d.id] = d.hoch;
    return {zust, halb, quellen, digital, schritte: this.schritte, t: this.t};
  }

  zustandSetzen(alt) {
    const pl = this.plan;
    const neu = [];
    pl.zustaende.forEach((z, k) => {
      const a = pl.alpha[k], g = pl.gz[k];
      const w = alt.zust?.[z.id];
      if (w) {
        this.s[k] = z.art === 'C' ? g * w.v + a * w.i : w.i + a * g * w.v;
        this.vx[k] = w.v;
      } else {
        /* neu eingesetzt: leer, oder mit dem eingestellten Anfangswert */
        neu.push(z.id);
        const v = z.art === 'C' ? (alt.mitIc ? z.ic : 0) : 0;
        const i = z.art === 'L' ? (alt.mitIc ? z.ic : 0) : 0;
        this.s[k] = z.art === 'C' ? g * v : i;
        this.vx[k] = v;
      }
    });
    for (const g of this.geraete) {
      const w = alt.halb?.[g.id];
      if (w) for (let m = 0; m < g.nSt; m++) this.v[g.v0 + m] = w[m];
    }
    for (const z of this.quellen) {
      const w = alt.quellen?.[z.id];
      if (!w) continue;
      z.phase = w.phase;
      z.an = w.an;
      z.seit = w.seit;
      if (w.rausch && z.rausch) { z.rausch.index = w.rausch.index; z.rausch.a = w.rausch.a; z.rausch.b = w.rausch.b; z.rausch.z = w.rausch.z; }
    }
    for (const d of this.digital) if (alt.digital?.[d.id] !== undefined) d.hoch = alt.digital[d.id];
    this.schritte = alt.schritte ?? 0;
    this.t = alt.t ?? 0;
    return neu;
  }

  /* Startwerte der Quellenausgänge der Schmitt-Trigger, passend zum aktuellen Zustand */
  digitalVorbereiten() {
    const dig = this.digital;
    if (this.plan.Mv > 0) this._bewerte(this.v);
    if (!dig.length) return;
    this._messen();
    for (const g of dig) { this.u[g.u] = g.hoch ? this.p[g.pVdd] : 0; g.xAlt = this.p[g.pEin] / Math.max(this.p[g.pVdd], 0.5); }
  }
}

/* ---------- Offline: für Vergleiche und den Arbeitspunkt ---------- */

/* Rechnet n Abtastwerte. Liefert je Messgröße ein Float64Array und die Zeitachse. Die Zeit t = k·h entspricht dem k-ten Schritt. */
export function rechneOffline(kern, n) {
  const pl = kern.plan;
  const kanaele = pl.P;
  const aus = [];
  for (let c = 0; c < kanaele; c++) aus.push(new Float64Array(n));
  const t = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    kern.schritt(true);
    t[k] = kern.t;
    for (let c = 0; c < kanaele; c++) aus[c][k] = kern.p[c];
  }
  return {t, aus};
}

/* Wert einer Quelle zum Zeitpunkt 0, wie ngspice ihn für den Anfangszustand eines .tran-Laufs nimmt. */
function wertBeiNull(z) {
  const w = z.w;
  switch (z.art) {
    case SIN: return w.off + w.amp * Math.sin(w.phase);
    case PULS: return pulsWert(w, 0);
    case HUELLE: return huellWert(w, 0);
    case RAUSCHEN: return new Rauschfolge(w).wert(0);
    case DIGITAL: case SCHMITT: return 0;
    default: return w.v;
  }
}

/* Arbeitspunkt für den Live-Betrieb: Pseudozeitschritte mit implizitem Euler und riesigem h, also Kondensatoren offen und
   Spulen kurz, die Quellen bei ihrem Wert zur Zeit 0. Das konvergiert auch aus dem Stand zuverlässig, und zwar immer in einen
   stabilen Zustand. Schwingt die Schaltung auch dabei, gibt es keinen Arbeitspunkt, und ok ist false. */
export function arbeitspunkt(kern, {schritte = 600, tol = 1e-9} = {}) {
  const pl = kern.plan;
  kern.eingefroren = true;
  for (let k = 0; k < pl.U; k++) {
    const z = kern.quellen[k];
    if (z.art !== SCHMITT) kern.u[k] = wertBeiNull(z);
  }
  kern.digitalVorbereiten();
  const alt = new Float64Array(pl.Pgesamt + pl.S);
  let ok = false, n = 0;
  for (; n < schritte; n++) {
    kern.schritt(true);
    let groesste = 0;
    for (let r = 0; r < pl.Pgesamt; r++) { const d = Math.abs(kern.p[r] - alt[r]); if (d > groesste) groesste = d; alt[r] = kern.p[r]; }
    for (let r = 0; r < pl.S; r++) { const d = Math.abs(kern.vx[r] - alt[pl.Pgesamt + r]); if (d > groesste) groesste = d; alt[pl.Pgesamt + r] = kern.vx[r]; }
    if (n > 1 && groesste < tol) { ok = true; break; }
  }
  kern.eingefroren = false;
  return {ok, schritte: n + 1};
}
