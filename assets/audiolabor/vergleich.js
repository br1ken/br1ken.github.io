/* Audiolabor: Live-Löser und ngspice rechnen dieselbe Schaltung mit denselben Randbedingungen.
   Der Vergleich läuft auf dem festen Zeitraster des Live-Lösers; ngspice wird dorthin linear interpoliert.
   ngspice bekommt einen viermal feineren Höchstschritt, damit vor allem der Live-Löser geprüft wird. */

import { baueSchaltung } from './netz.js';
import { spiceText } from './netlist.js';
import { spalte } from './spice.js';
import { erzeugePlan } from './live-plan.js';
import { LiveKern, rechneOffline } from './live-kern.js';
import { startZustand } from './live.js';
import { pegelZeit, frequenzAusDurchgaengen } from './messung.js';

/* Startzustand wie im Live-Betrieb: Arbeitspunkt oder Anfangswerte */
export function startKern(irLive, {fs = 48000, ueber = 4, theta = 0.5, start = 'op', mess = []} = {}) {
  const plan = erzeugePlan(irLive, {fs, ueber, theta, mess});
  const kern = new LiveKern(plan);
  const {zustand, dc} = startZustand(irLive, {start, mess});
  kern.zustandSetzen(zustand);
  kern.digitalVorbereiten();
  return {kern, plan, dc};
}

export async function vergleiche(spice, projekt, {netz, dauer = 0.05, start = 'op', ueber = 4, fs = 48000, theta = 0.5, ab = 0, feiner = 4, digital = null} = {}) {
  const irS = baueSchaltung(projekt, {ziel: 'spice'});
  if (irS.fehler.length) throw new Error(irS.fehler.map(f => f.text).join(' | '));
  const tmax = 1 / (fs * ueber * feiner);
  const text = spiceText(irS, {art: 'tran', dauer, tmax, start, speichern: [`v(${netz})`], digital});
  const r = await spice.rechne(text);
  const tS = spalte(r.ergebnis, 'time').values, vS = spalte(r.ergebnis, `v(${netz})`).values;

  const irL = baueSchaltung(projekt, {ziel: 'live'});
  const {kern, plan, dc} = startKern(irL, {fs, ueber, theta, start, mess: [{id: 'x', art: 'u', netz}]});
  const n = Math.floor(dauer * fs * ueber);
  const t0 = performance.now();
  const {t, aus} = rechneOffline(kern, n);
  const liveMs = performance.now() - t0;
  const vL = aus[0];

  let i = 1, emax = 0, tBeiMax = 0, summe = 0, zaehl = 0, vmin = Infinity, vmax = -Infinity;
  for (let k = 0; k < n; k++) {
    const tk = t[k];
    while (i < tS.length - 1 && tS[i] < tk) i++;
    const a = (tk - tS[i - 1]) / (tS[i] - tS[i - 1]);
    const s = vS[i - 1] + a * (vS[i] - vS[i - 1]);
    if (tk < ab) continue;
    const e = vL[k] - s;
    if (Math.abs(e) > emax) { emax = Math.abs(e); tBeiMax = tk; }
    summe += e * e;
    zaehl++;
    if (s < vmin) vmin = s;
    if (s > vmax) vmax = s;
  }
  const rms = Math.sqrt(summe / zaehl), spitze = vmax - vmin;
  return {
    emax, tBeiMax, rmsFehler: rms, spitze, rmsProzent: spitze > 0 ? 100 * rms / spitze : 0,
    spiceMs: r.rechenMs, spicePunkte: tS.length, liveMs, echtzeitFaktor: dauer * 1000 / liveMs,
    newtonMittel: kern.newtonSumme / n, newtonMax: kern.newtonMax, nichtKonvergiert: kern.nichtKonvergiert, nan: kern.nanZaehler,
    dc, groesse: {n: plan.n, zustaende: plan.S, eingaenge: plan.U, steuer: plan.Mv, stroeme: plan.Mi},
    tS, vS, t, vL, netlist: r.netlist, naeherungen: irL.naeherungen
  };
}

/* Kennzahlen einer selbstschwingenden Schaltung in beiden Rechenwegen */
export function schwingVergleich(v, ab) {
  const fS = frequenzAusDurchgaengen(v.tS, v.vS, ab), fL = frequenzAusDurchgaengen(v.t, v.vL, ab);
  const pS = pegelZeit(v.tS, v.vS, ab), pL = pegelZeit(v.t, v.vL, ab);
  return {
    fSpice: fS?.f ?? null, fLive: fL?.f ?? null, fAbw: fS && fL ? 100 * (fL.f - fS.f) / fS.f : null,
    ampSpice: pS.spitze, ampLive: pL.spitze, ampAbw: pS.spitze > 0 ? 100 * (pL.spitze - pS.spitze) / pS.spitze : null
  };
}
