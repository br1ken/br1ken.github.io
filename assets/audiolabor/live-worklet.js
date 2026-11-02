/* Audiolabor: der allgemeine Live-Löser auf dem Audio-Thread.
   Pläne entstehen im Hauptthread und werden an einer Blockgrenze übernommen, die Zustände der Kondensatoren und Spulen bleiben erhalten.
   Pro Block wird die Rechenzeit gemessen. Überlast, Nichtkonvergenz und NaN gehen als Bericht an die Oberfläche. */

import { LiveKern } from './live-kern.js';
import { tiefpassKern } from './messung.js';

const uhr = globalThis.performance?.now ? () => globalThis.performance.now() : () => Date.now();
const UHR_ART = globalThis.performance?.now ? 'performance.now' : 'Date.now';

const SCOPE_RAHMEN = 2048;
const POOL = 8;

class AudiolaborLive extends AudioWorkletProcessor {
  constructor() {
    super();
    this.kern = null;
    this.wartend = null;
    this.hoerIndex = -1;
    this.kanaele = 0;
    this.pool = [];
    this.scope = null;
    this.scopePos = 0;
    this.verworfen = 0;
    this.ueber = 1;
    this.fir = null;
    this.firSpeicher = null;
    this.firPos = 0;
    /* Bericht */
    this.summeMs = 0;
    this.spitzeMs = 0;
    this.bloecke = 0;
    this.ueberBudget = 0;
    this.seitBericht = 0;
    this.berichtAb = 0;
    this.nkAlt = 0;
    this.newtonAlt = 0;
    this.uebernahmeMs = 0;
    this.kennung = 0;
    this.port.onmessage = ({data}) => this._nachricht(data);
    this.port.postMessage({typ: 'bereit', uhr: UHR_ART});
  }

  _nachricht(d) {
    switch (d.typ) {
      case 'plan': this.wartend = d; break;
      case 'quelle': this.kern?.setzeQuelle(d.teil, d.welle); break;
      case 'taste': this.kern?.taste(d.teil, d.an); break;
      case 'scope-zurueck': if (this.pool.length < POOL) this.pool.push(d.puffer); break;
      case 'stopp': this.kern = null; this.wartend = null; break;
    }
  }

  _rahmenHolen() {
    const k = this.kanaele;
    if (!k) return null;
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].length === k && this.pool[i][0].length === SCOPE_RAHMEN) return this.pool.splice(i, 1)[0];
    }
    return null;
  }

  _uebernehmen() {
    const t0 = uhr();
    const d = this.wartend;
    this.wartend = null;
    const alt = this.kern;
    const neu = new LiveKern(d.plan);
    let leere = [];
    if (d.start) {
      leere = neu.zustandSetzen(d.start);
    } else if (alt) {
      const z = alt.zustandLesen();
      /* Quellen behalten ihren Lauf, damit das Signal beim Umstecken nicht springt. */
      leere = neu.zustandSetzen(z);
    }
    neu.digitalVorbereiten();
    if (alt) neu.digitalAlt = alt.digitalAlt;
    this.kern = neu;
    this.hoerIndex = d.hoerIndex;
    this.kanaele = d.plan.P;
    if (this.ueber !== d.plan.ueber || !this.fir) {
      this.ueber = d.plan.ueber;
      if (this.ueber > 1) {
        this.fir = tiefpassKern(0.45 / this.ueber, 16 * this.ueber + 1);
        this.firSpeicher = new Float32Array(this.fir.length);
        this.firPos = 0;
      } else this.fir = null;
    }
    if (this.scope && this.scope.length !== this.kanaele) { this.scope = null; this.scopePos = 0; }
    if (d.puffer) for (const p of d.puffer) if (this.pool.length < POOL) this.pool.push(p);
    this.nkAlt = 0;
    this.newtonAlt = 0;
    this.uebernahmeMs = uhr() - t0;
    this.kennung = d.kennung;
    this.berichtAb = uhr();
    this.port.postMessage({typ: 'plan-aktiv', kennung: d.kennung, leere, reset: !!d.start, uebernahmeMs: this.uebernahmeMs, t: neu.t});
  }

  process(inputs, outputs) {
    const t0 = uhr();
    if (this.wartend) this._uebernehmen();
    const aus = outputs[0][0];
    const n = aus.length;
    const kern = this.kern;
    if (!kern) { aus.fill(0); return true; }

    const pl = kern.plan, ueber = this.ueber, hoer = this.hoerIndex;
    const ein = inputs[0]?.[0];
    if (ein) { kern.digitalEin = ein; kern.digitalPos = 0; } else kern.digitalEin = null;

    const fir = this.fir, sp = this.firSpeicher, L = fir ? fir.length : 0;
    const k = this.kanaele;
    let pos = this.firPos;
    for (let i = 0; i < n; i++) {
      let y = 0;
      for (let o = 0; o < ueber; o++) {
        kern.schritt(true);
        y = hoer >= 0 ? kern.p[hoer] : 0;
        if (fir) {
          sp[pos] = y;
          pos = pos + 1 === L ? 0 : pos + 1;
        }
      }
      if (fir) {
        let s = 0, q = pos;
        for (let j = 0; j < L; j++) {
          s += fir[j] * sp[q];
          q = q + 1 === L ? 0 : q + 1;
        }
        y = s;
      }
      /* Feste Hörskalierung: 10 V entsprechen 1,0 */
      aus[i] = y / 10;
      if (k) {
        if (!this.scope) {
          this.scope = this._rahmenHolen();
          this.scopePos = 0;
          if (!this.scope) this.verworfen++;
        }
        if (this.scope) {
          const f = this.scope, p = this.scopePos;
          for (let c = 0; c < k; c++) f[c][p] = kern.p[c];
          if (++this.scopePos === SCOPE_RAHMEN) {
            const ids = [];
            for (let c = 0; c < k; c++) ids.push(f[c].buffer);
            this.port.postMessage({typ: 'scope', rahmen: f, t: kern.t, fs: sampleRate}, ids);
            this.scope = null;
          }
        }
      }
    }
    this.firPos = pos;
    if (ein) kern.digitalAlt = ein[ein.length - 1];

    /* NaN in den Zuständen: definiert auf null zurück und melden, statt den Ausgang zu vergiften. */
    let kaputt = false;
    for (let i = 0; i < pl.S; i++) { const s = kern.s[i]; if (s !== s || s === Infinity || s === -Infinity) { kaputt = true; break; } }
    if (kaputt || aus[n - 1] !== aus[n - 1] || kern.nanZaehler) {
      kern.s.fill(0);
      kern.v.fill(0);
      kern.i.fill(0);
      aus.fill(0);
      kern.nanZaehler = 0;
      this.port.postMessage({typ: 'nan'});
    }

    const dauer = uhr() - t0;
    this.summeMs += dauer;
    if (dauer > this.spitzeMs) this.spitzeMs = dauer;
    const budget = n / sampleRate * 1000;
    if (dauer > budget) this.ueberBudget++;
    this.bloecke++;
    this.seitBericht += n;
    /* Auch nach der Uhr: Unter schwerer Überlast dauert eine Viertelsekunde Audiozeit sonst Minuten, und die Oberfläche erführe nichts davon. */
    if (this.seitBericht >= sampleRate / 4 || t0 - this.berichtAb >= 500) {
      this.port.postMessage({
        typ: 'bericht', kennung: this.kennung,
        last: this.summeMs / (this.seitBericht / sampleRate * 1000),
        spitzeMs: this.spitzeMs, budgetMs: budget, ueberBudget: this.ueberBudget, bloecke: this.bloecke,
        nk: kern.nichtKonvergiert - this.nkAlt,
        newton: (kern.newtonSumme - this.newtonAlt) / (this.seitBericht * ueber),
        newtonMax: kern.newtonMax, verworfen: this.verworfen, uhr: UHR_ART, zeit: currentTime, simZeit: kern.t
      });
      this.nkAlt = kern.nichtKonvergiert;
      this.newtonAlt = kern.newtonSumme;
      kern.newtonMax = 0;
      this.summeMs = 0;
      this.spitzeMs = 0;
      this.ueberBudget = 0;
      this.bloecke = 0;
      this.seitBericht = 0;
      this.berichtAb = t0;
    }
    return true;
  }
}

registerProcessor('audiolabor-live', AudiolaborLive);
