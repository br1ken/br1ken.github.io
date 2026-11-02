/* Audiolabor: der Prüfstand. Rechnet die Abnahmekriterien aus dem Briefing (Abschnitt 7) im Browser nach und zeigt die echten Zahlen.
   Nichts hiervon ist fest eingetragen: Jede Zeile entsteht beim Lauf aus den Rechenkernen der Seite.
   Die Kriterien für nichtlineare Schaltungen sind einzeln benannt: Arbeitspunkt, Schwingfrequenz, Amplitude, Spektrum, Verlauf. */

import { Spice, spalte } from './spice.js';
import { ausNetzen, zuDatei, ausDatei } from './aufbau.js?v=2';
import { baueSchaltung, netlistUnterschied } from './netz.js';
import { spiceText, spiceName } from './netlist.js';
import { frequenzgang, grenzfrequenz, wertBei, zuAudio, amplitudeBei, pegel, pegelZeit, frequenzAusDurchgaengen, klirr, DB_3, wavFloat32 } from './messung.js';
import { Monitorweg, VOLT_JE_EINS } from './klang.js?v=2';
import { LiveBetrieb } from './live.js';
import { erzeugePlan } from './live-plan.js';
import { LiveKern, rechneOffline } from './live-kern.js';
import { vergleiche, schwingVergleich, startKern } from './vergleich.js';
import { faustLaden, faustUebersetzen, faustKnoten, faustRendern, FAUST_MODULE, faustRegler } from './faustmodule.js';
import { wdfRC, wdfBegrenzer } from './wdf.js';
import { VERSUCHE } from './versuche.js';
import { fmtMess, fmtZahl, komma } from './einheiten.js';
import { DIODEN, VT_27C } from './modelle.js';
import { pruefeStecken } from './pruefstand-stecken.js';
import { pruefeVersuche } from './pruefstand-versuche.js';

const $ = s => document.querySelector(s);
const FS = 48000;

const spice = new Spice({fristMs: 90000});
const monitor = new Monitorweg();
const live = new LiveBetrieb(monitor);

const ergebnisse = [];
let laufendeGruppe = '';

const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

function gruppe(titel, text = '') {
  laufendeGruppe = titel;
  const t = $('#p-tabelle');
  const zeile = document.createElement('tbody');
  zeile.innerHTML = `<tr class="p-gruppe"><th colspan="4"><span>${esc(titel)}</span>${text ? `<small>${esc(text)}</small>` : ''}</th></tr>`;
  t.append(zeile);
}

function zeile(versuch, erwartet, gemessen, ok, notiz = '') {
  const e = {gruppe: laufendeGruppe, versuch, erwartet, gemessen, ok, notiz};
  ergebnisse.push(e);
  const k = $('#p-tabelle').lastElementChild;
  const tr = document.createElement('tr');
  const art = ok === true ? 'ja' : ok === false ? 'nein' : 'info';
  tr.innerHTML = `<td>${esc(versuch)}${notiz ? `<small>${esc(notiz)}</small>` : ''}</td><td>${esc(erwartet)}</td><td>${esc(gemessen)}</td><td class="p-${art}">${ok === true ? 'bestanden' : ok === false ? 'NICHT bestanden' : 'gemessen'}</td>`;
  k.append(tr);
  aktualisiereKopf();
  tr.scrollIntoView({block: 'nearest'});
}

function aktualisiereKopf(text) {
  const ja = ergebnisse.filter(e => e.ok === true).length, nein = ergebnisse.filter(e => e.ok === false).length, info = ergebnisse.filter(e => e.ok === null).length;
  $('#p-stand').textContent = `${text ? `${text} · ` : ''}${ja} bestanden, ${nein} nicht bestanden, ${info} nur gemessen`;
}

const hz = x => fmtZahl(x, 2) + ' Hz';
const prozent = (ist, soll) => 100 * (ist - soll) / soll;
const abw = (ist, soll) => `${komma(prozent(ist, soll).toFixed(3))} %`;
const warte = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Hilfen zum Rechnen ---------- */
async function ac(projekt, {netz, von = 1, bis = 1e5, jeDekade = 400} = {}) {
  const ir = baueSchaltung(projekt);
  const gen = ir.elemente.find(e => e.ac);
  const r = await spice.rechne(spiceText(ir, {art: 'ac', von, bis, jeDekade, stim: gen?.id}));
  const f = spalte(r.ergebnis, 'frequency'), v = spalte(r.ergebnis, `v(${netz})`);
  return {gang: frequenzgang(f.re, v.re, v.im), netlist: r.netlist};
}

async function tran(projekt, {dauer, tmax = 1 / 192000, start = 'op', speichern}) {
  const ir = baueSchaltung(projekt);
  const r = await spice.rechne(spiceText(ir, {art: 'tran', dauer, tmax, start, speichern}));
  return {t: spalte(r.ergebnis, 'time').values, wert: n => spalte(r.ergebnis, n)?.values, r, ir};
}

async function op(projekt) {
  const ir = baueSchaltung(projekt);
  const r = await spice.rechne(spiceText(ir, {art: 'op'}));
  return {wert: n => spalte(r.ergebnis, n)?.values?.[0], r, ir};
}

const rc = (R, C, extra = {}, form = 'sinus', f = 440, amp = 5) => ausNetzen('RC-Tiefpass', [
  {typ: 'gen', id: 'G1', werte: {form, f, amp}, netze: {'+': 'ein', '-': '0'}},
  {typ: 'r', id: 'R1', werte: {R}, netze: {1: 'ein', 2: 'aus'}},
  {typ: 'c', id: 'C1', werte: {C}, netze: {1: extra.cAn || 'aus', 2: '0'}},
  {typ: 'sonde', id: 'CH1', netze: {1: 'aus'}},
  {typ: 'hoer', id: 'H1', netze: {1: 'aus'}}
]);

const emitterstufe = (bezugProzent, amp = 0.02, modell = 'BC847B') => {
  const pos = bezugProzent / 100;
  return ausNetzen('Emitterschaltung', [
    {typ: 'rail', id: 'V1', werte: {u: 12}, netze: {1: 'vcc'}},
    {typ: 'gen', id: 'G1', werte: {form: 'sinus', f: 220, amp}, netze: {'+': 'ein', '-': '0'}},
    {typ: 'c', id: 'C1', werte: {C: 1e-6}, netze: {1: 'ein', 2: 'b'}},
    {typ: 'r', id: 'R1', werte: {R: 120000}, netze: {1: 'vcc', 2: 'x'}},
    {typ: 'pot', id: 'P1', werte: {R: 22000, pos: bezugProzent}, netze: {1: 'x', 2: 'b', 3: 'y'}},
    {typ: 'r', id: 'R2', werte: {R: 18000}, netze: {1: 'y', 2: '0'}},
    {typ: 'r', id: 'R3', werte: {R: 4700}, netze: {1: 'vcc', 2: 'c'}},
    {typ: 'r', id: 'R4', werte: {R: 1000}, netze: {1: 'e', 2: '0'}},
    {typ: 'c', id: 'C2', werte: {C: 100e-6}, netze: {1: 'e', 2: '0'}},
    {typ: 'npn', id: 'T1', werte: {modell}, netze: {B: 'b', C: 'c', E: 'e'}},
    {typ: 'c', id: 'C3', werte: {C: 1e-6}, netze: {1: 'c', 2: 'aus'}},
    {typ: 'r', id: 'R5', werte: {R: 100000}, netze: {1: 'aus', 2: '0'}},
    {typ: 'sonde', id: 'CH1', netze: {1: 'c'}},
    {typ: 'hoer', id: 'H1', netze: {1: 'aus'}}
  ]);
};

const inverter = (amp = 0.5, modell = 'TL07X') => ausNetzen('Inverter', [
  {typ: 'rail', id: 'V1', werte: {u: 12}, netze: {1: 'p'}},
  {typ: 'rail', id: 'V2', werte: {u: -12}, netze: {1: 'm'}},
  {typ: 'gen', id: 'G1', werte: {form: 'sinus', f: 440, amp}, netze: {'+': 'ein', '-': '0'}},
  {typ: 'r', id: 'R1', werte: {R: 10000}, netze: {1: 'ein', 2: 'neg'}},
  {typ: 'r', id: 'R2', werte: {R: 47000}, netze: {1: 'neg', 2: 'aus'}},
  {typ: 'opv', id: 'U1', werte: {modell}, netze: {'+': '0', '-': 'neg', A: 'aus', 'V+': 'p', 'V-': 'm'}},
  {typ: 'sonde', id: 'CH1', netze: {1: 'aus'}}
]);

const schmittOszi = (R = 100000, C = 10e-9, u = 12) => ausNetzen('Schmitt-Oszillator', [
  {typ: 'rail', id: 'V1', werte: {u}, netze: {1: 'p'}},
  {typ: 'cd40106', id: 'U1', netze: {1: 'x', 2: 'y', 7: '0', 14: 'p'}},
  {typ: 'r', id: 'R1', werte: {R}, netze: {1: 'y', 2: 'x'}},
  {typ: 'c', id: 'C1', werte: {C}, netze: {1: 'x', 2: '0'}},
  {typ: 'sonde', id: 'CH1', netze: {1: 'x'}},
  {typ: 'hoer', id: 'H1', netze: {1: 'y'}}
]);

const multivibrator = (ic = 0.5, modell = 'NPN-GEN') => ausNetzen('Astabiler Multivibrator', [
  {typ: 'rail', id: 'V1', werte: {u: 9}, netze: {1: 'p'}},
  {typ: 'r', id: 'R1', werte: {R: 1000}, netze: {1: 'p', 2: 'c1'}},
  {typ: 'r', id: 'R4', werte: {R: 1000}, netze: {1: 'p', 2: 'c2'}},
  {typ: 'r', id: 'R2', werte: {R: 47000}, netze: {1: 'p', 2: 'b2'}},
  {typ: 'r', id: 'R3', werte: {R: 47000}, netze: {1: 'p', 2: 'b1'}},
  {typ: 'c', id: 'C1', werte: {C: 47e-9, ic}, netze: {1: 'c1', 2: 'b2'}},
  {typ: 'c', id: 'C2', werte: {C: 47e-9}, netze: {1: 'c2', 2: 'b1'}},
  {typ: 'npn', id: 'T1', werte: {modell}, netze: {B: 'b1', C: 'c1', E: '0'}},
  {typ: 'npn', id: 'T2', werte: {modell}, netze: {B: 'b2', C: 'c2', E: '0'}},
  {typ: 'sonde', id: 'CH1', netze: {1: 'c1'}},
  {typ: 'hoer', id: 'H1', netze: {1: 'c2'}}
]);

const begrenzer = (zwei = true, gedreht = false, modell = '1N4148') => ausNetzen('Diodenbegrenzer', [
  {typ: 'gen', id: 'G1', werte: {form: 'sinus', f: 220, amp: 5}, netze: {'+': 'ein', '-': '0'}},
  {typ: 'r', id: 'R1', werte: {R: 10000}, netze: {1: 'ein', 2: 'aus'}},
  {typ: 'd', id: 'D1', werte: {modell}, netze: gedreht ? {A: '0', K: 'aus'} : {A: 'aus', K: '0'}},
  ...(zwei ? [{typ: 'd', id: 'D2', werte: {modell}, netze: gedreht ? {A: 'aus', K: '0'} : {A: '0', K: 'aus'}}] : []),
  {typ: 'sonde', id: 'CH1', netze: {1: 'aus'}},
  {typ: 'hoer', id: 'H1', netze: {1: 'aus'}}
]);

/* ---------- Stufe 1: Was kann diese Version wirklich? ---------- */
async function stufe1() {
  gruppe('Stufe 1: Browser-Schnittstelle der konkreten Version', 'eecircuit-engine 1.9.0 und @grame/faustwasm 0.19.6, im Browser befragt');
  const a = await spice.start();
  const banner = (a.info.match(/ngspice-[\d.]+/) || ['?'])[0];
  zeile('ngspice startet im Worker', 'Modul lädt, Banner meldet die Version', `${banner}, Start in ${fmtZahl(a.startMs, 0)} ms`, banner.startsWith('ngspice-'));

  const moeglich = async netlist => {
    try { await spice.rechne(netlist, {fristMs: 15000}); return true; } catch { return false; }
  };
  const grundarten = await Promise.all([
    moeglich('o\nV1 a 0 DC 1\nR1 a 0 1k\n.op\n.end\n'),
    moeglich('a\nV1 a 0 DC 0 AC 1\nR1 a 0 1k\n.ac dec 10 1 1k\n.end\n'),
    moeglich('t\nV1 a 0 SIN(0 1 1k)\nR1 a 0 1k\n.tran 10u 1m\n.end\n')
  ]);
  zeile('Operationspunkt, Frequenzgang, Zeitverlauf', '.op, .ac und .tran liefern Ergebnisse', grundarten.every(x => x) ? 'alle drei laufen' : 'nicht alle', grundarten.every(x => x));
  const bjt = await moeglich('q\nV1 c 0 DC 5\nV2 b 0 DC 0.7\nQ1 c b 0 N\n.model N NPN(IS=1e-14 BF=100)\n.op\n.end\n');
  zeile('Bipolartransistor (Gummel-Poon)', 'vorhanden oder ehrlich fehlend', bjt ? 'vorhanden' : 'fehlt', bjt);
  const mos = await moeglich('m\nV1 d 0 DC 5\nV2 g 0 DC 3\nM1 d g 0 0 N W=1 L=1\n.model N NMOS(LEVEL=1 VTO=1 KP=1m)\n.op\n.end\n');
  zeile('MOSFET Level 1', 'vorhanden oder ehrlich fehlend', mos ? 'vorhanden' : 'fehlt', mos);
  const b = await moeglich('b\nV1 a 0 DC 1\nB1 b 0 V = 2*tanh(V(a))\nR1 b 0 1k\n.op\n.end\n');
  zeile('Verhaltensquellen (B)', 'nötig für CD40106 und Slew Rate', b ? 'vorhanden' : 'fehlt', b);
  const x = await moeglich('x\nV1 a 0 DC 1\nA1 a b VERST\n.model VERST gain(gain=2)\nR1 b 0 1k\n.op\n.end\n');
  zeile('XSPICE-Code-Modelle (A)', 'Laut Docker/run.sh abgeschaltet', x ? 'läuft doch' : 'bestätigt: „unknown device type“', !x, 'CD40106 ist deshalb ein Verhaltensmodell, kein Digitalmodell.');

  let meld = null;
  try { await spice.rechne('s\nV1 a 0 DC 1\nV2 a 0 DC 2\nR1 a 0 1k\n.op\n.end\n', {fristMs: 15000}); } catch (e) { meld = e; }
  const danach = await moeglich('g\nV1 a 0 DC 1\nR1 a 0 1k\n.op\n.end\n');
  zeile('Nicht lösbare Schaltung', 'Meldung statt Hängen oder altem Ergebnis, danach weiter nutzbar', meld ? `Fehler gemeldet: ${meld.message}; nächster Lauf ${danach ? 'korrekt' : 'scheitert'}` : 'kein Fehler', !!meld && danach, 'Die Engine lässt beim Scheitern die alte out.raw liegen. spice-worker.js löscht sie, spice.js prüft die Laufnummer im Ergebnis.');

  const kurz = 'w\nV1 a 0 DC 1\nR1 a 0 1k\n.op\n.end\n';
  const t0 = performance.now();
  let ok = true;
  for (let i = 0; i < 40; i++) { try { await spice.rechne(kurz); } catch { ok = false; } }
  zeile('40 Läufe hintereinander', 'stabil, kein Abriss', `${ok ? 'alle korrekt' : 'Fehler'}, im Mittel ${fmtZahl((performance.now() - t0) / 40, 1)} ms je Lauf`, ok);

  const {version, ladeMs} = await faustLaden();
  zeile('FaustWasm lädt', 'Compiler im Browser', `Faust ${version}, geladen in ${fmtZahl(ladeMs, 0)} ms`, true);
}

/* ---------- Abschnitt 7: Abnahme mit ngspice ---------- */
async function abnahmeRender() {
  gruppe('Abnahme: Schaltungsverhalten, berechnet mit ngspice', 'Versuche aus Abschnitt 7 des Briefings');

  /* Spannungsteiler */
  const teiler = (last) => ausNetzen('Teiler', [
    {typ: 'v', id: 'V1', werte: {v: 10}, netze: {'+': 'ein', '-': '0'}},
    {typ: 'r', id: 'R1', werte: {R: 10000}, netze: {1: 'ein', 2: 'mitte'}},
    {typ: 'r', id: 'R2', werte: {R: 10000}, netze: {1: 'mitte', 2: '0'}},
    ...(last ? [{typ: 'r', id: 'R3', werte: {R: last}, netze: {1: 'mitte', 2: '0'}}] : [])
  ]);
  const u0 = (await op(teiler(0))).wert('v(mitte)');
  zeile('Spannungsteiler, 10 V, zweimal 10 kΩ', '5,000 V', fmtMess(u0, 'V', 6), Math.abs(u0 - 5) < 1e-6);
  const u1 = (await op(teiler(10000))).wert('v(mitte)');
  zeile('Dazu 10 kΩ Last', `${fmtZahl(10 / 3, 4)} V (5 kΩ / 15 kΩ)`, fmtMess(u1, 'V', 6), Math.abs(u1 - 10 / 3) < 1e-5);

  /* RC */
  const fc0 = 1 / (2 * Math.PI * 1e4 * 1e-8);
  const a = await ac(rc(1e4, 1e-8), {netz: 'aus'});
  const g = grenzfrequenz(a.gang);
  zeile('RC-Tiefpass 10 kΩ, 10 nF: Grenzfrequenz', `${hz(fc0)}`, `${hz(g.fc)} (Abweichung ${abw(g.fc, fc0)})`, Math.abs(prozent(g.fc, fc0)) < 1, 'Ziel laut Briefing: unter 1 %');
  const dbBei = wertBei(a.gang.f, a.gang.db, fc0), phBei = wertBei(a.gang.f, a.gang.phase, fc0);
  zeile('… Betrag bei 1591,55 Hz', '−3,01 dB', `${komma(dbBei.toFixed(3))} dB`, Math.abs(dbBei - DB_3) < 0.01);
  zeile('… Phase bei 1591,55 Hz', '−45,00°', `${komma(phBei.toFixed(3))}°`, Math.abs(phBei + 45) < 0.05);

  const a2 = await ac(rc(2e4, 1e-8), {netz: 'aus'});
  const g2 = grenzfrequenz(a2.gang);
  zeile('R auf 20 kΩ: Grenzfrequenz halbiert', `${hz(fc0 / 2)}`, `${hz(g2.fc)} (Verhältnis ${komma((g2.fc / g.fc).toFixed(5))})`, Math.abs(g2.fc / g.fc - 0.5) < 0.005);

  /* Klang: Rechteck, Oberwellen im Hörweg */
  const klang = async (R) => {
    const t = await tran(rc(R, 1e-8, {}, 'rechteck', 220, 5), {dauer: 0.5, tmax: 1 / 192000});
    return zuAudio(t.t, t.wert('v(aus)'), FS);
  };
  const k1 = await klang(1e4), k2 = await klang(2e4);
  const ober = (x, m) => amplitudeBei(x, FS, m * 220, FS / 10 | 0).amplitude;
  const soll = (m, fc) => 4 * 5 / (Math.PI * m) / Math.hypot(1, m * 220 / fc);
  const zeilenK = [5, 11, 21].map(m => [m, ober(k1, m), soll(m, fc0), ober(k2, m), soll(m, fc0 / 2)]);
  const maxAbw = Math.max(...zeilenK.flatMap(z => [Math.abs(prozent(z[1], z[2])), Math.abs(prozent(z[3], z[4]))]));
  zeile('Klang: Rechteck 220 Hz, Oberwellen im Hörweg', 'Theorie 4A/(πm)·|H(mf)| bei 10 kΩ und 20 kΩ',
    zeilenK.map(z => `m=${z[0]}: ${komma(z[1].toFixed(3))} → ${komma(z[3].toFixed(3))} V`).join('; ') + `; größte Abweichung ${komma(maxAbw.toFixed(3))} %`,
    maxAbw < 1, 'Der Pegel jeder Oberwelle ändert sich mit R so, wie der Frequenzgang es verlangt.');

  /* C umstecken */
  const pAus = rc(1e4, 1e-8), pEin = rc(1e4, 1e-8, {cAn: 'ein'});
  const nA = spiceText(baueSchaltung(pAus), {art: 'ac', von: 1, bis: 1e5, jeDekade: 100}), nE = spiceText(baueSchaltung(pEin), {art: 'ac', von: 1, bis: 1e5, jeDekade: 100});
  const u = netlistUnterschied(nA, nE);
  zeile('Kondensator an anderen Knoten: Netlist', 'tatsächlich andere Netlist', `− ${u.weg.join(' | ')}  + ${u.dazu.join(' | ')}`, !u.gleich);
  const aE = await ac(pEin, {netz: 'aus'});
  const gE = grenzfrequenz(aE.gang);
  zeile('… und anderes Ergebnis', 'kein Tiefpass mehr am Ausgang: flach, keine Grenzfrequenz', `Betrag bei 10 kHz: ${komma(wertBei(aE.gang.f, aE.gang.db, 1e4).toFixed(3))} dB statt ${komma(wertBei(a.gang.f, a.gang.db, 1e4).toFixed(2))} dB; Grenzfrequenz ${gE ? hz(gE.fc) : 'keine'}`, !gE && Math.abs(wertBei(aE.gang.f, aE.gang.db, 1e4)) < 0.1);

  /* Diode umdrehen */
  const dv = async gedreht => {
    const t = await tran(begrenzer(false, gedreht), {dauer: 0.02, tmax: 1 / 192000});
    return pegelZeit(t.t, t.wert('v(aus)'), 0.005);
  };
  const d1 = await dv(false), d2 = await dv(true);
  zeile('Diode umdrehen (1N4148, 5 V Sinus, 10 kΩ)', 'Begrenzung wechselt die Seite, Betrag etwa gleich', `vorwärts: ${fmtMess(d1.min, 'V', 4)} bis ${fmtMess(d1.max, 'V', 4)}; umgedreht: ${fmtMess(d2.min, 'V', 4)} bis ${fmtMess(d2.max, 'V', 4)}`,
    d1.max > 0.3 && d1.max < 0.8 && d1.min < -4.9 && d2.min < -0.3 && d2.min > -0.8 && d2.max > 4.9);

  /* Arbeitspunkt */
  const arbeit = async pos => {
    const p = emitterstufe(pos);
    const o = await op(p);
    const nm = spiceName('Q', 'QT1').toLowerCase();
    const ic = o.wert(`i(@${nm}[ic])`) ?? o.wert(`@${nm}[ic]`);
    const t = await tran(p, {dauer: 0.2, tmax: 1 / 192000, speichern: ['v(aus)', 'v(c)']});
    const x = zuAudio(t.t, t.wert('v(aus)'), FS);
    const start = FS / 10 | 0;
    const g220 = amplitudeBei(x, FS, 220, start).amplitude;
    const kl = klirr(x.subarray(start), FS, 220, 6);
    return {ic, uc: o.wert('v(c)'), v: g220 / 0.02, thd: kl.thd};
  };
  const w1 = await arbeit(10), w2 = await arbeit(50), w3 = await arbeit(90);
  const fmtW = w => `Ic ${fmtMess(w.ic, 'A', 3)}, Uc ${fmtMess(w.uc, 'V', 3)}, v = ${komma(w.v.toFixed(0))}, Klirr ${komma((w.thd * 100).toFixed(2))} %`;
  zeile('Transistor-Arbeitspunkt über das Poti (10 / 50 / 90 %)', 'Ruhestrom sinkt mit der Stellung, Verstärkung und Verzerrung ändern sich', `${fmtW(w1)} → ${fmtW(w2)} → ${fmtW(w3)}`, w1.ic > w2.ic && w2.ic > w3.ic && Math.abs(w2.v - w3.v) > 0.15 * w2.v && Math.abs(w3.thd - w2.thd) > 1e-3, 'Bei 10 % fehlt der Stufe Aussteuerung nach unten: Der Klirr steigt, die Verstärkung fällt wieder.');
  const gmTheorie = w2.ic / VT_27C;
  zeile('… Kontrolle bei 50 %: v ≈ gm·(RC ∥ RL)', `rund ${komma((gmTheorie * (4700 * 100000 / 104700)).toFixed(0))} (ideal, ohne Basisbahnwiderstand)`, `${komma(w2.v.toFixed(0))}`, w2.v > 0.6 * gmTheorie * 4489 && w2.v < 1.05 * gmTheorie * 4489, 'Abweichung nach unten erwartet: re′, Rb, Early-Effekt.');

  /* Oszillatoren */
  const fTheorieS = 1 / (1e5 * 1e-8 * Math.log(((1 - 0.385) / (1 - 0.59)) * (0.59 / 0.385)));
  const ts = await tran(schmittOszi(), {dauer: 0.05, tmax: 1 / 192000, start: 'uic', speichern: ['v(x)', 'v(y)']});
  const fs1 = frequenzAusDurchgaengen(ts.t, ts.wert('v(y)'), 0.01);
  zeile('Oszillator ohne Audiokabel: CD40106, 100 kΩ, 10 nF', `${hz(fTheorieS)} aus Schwellen und RC`, fs1 ? `${hz(fs1.f)} über ${fs1.perioden} Perioden, Abweichung ${abw(fs1.f, fTheorieS)}` : 'schwingt nicht', fs1 && Math.abs(prozent(fs1.f, fTheorieS)) < 2);
  const ts5 = await tran(schmittOszi(1e5, 1e-8, 5), {dauer: 0.05, tmax: 1 / 192000, start: 'uic', speichern: ['v(x)', 'v(y)']});
  const fs5 = frequenzAusDurchgaengen(ts5.t, ts5.wert('v(y)'), 0.01);
  zeile('… bei 5 V statt 12 V Versorgung', 'Frequenz fast gleich, Hub folgt der Versorgung', fs5 ? `${hz(fs5.f)}, Hub ${fmtMess(pegelZeit(ts5.t, ts5.wert('v(y)'), 0.01).spitze, 'V', 3)}` : 'schwingt nicht', fs5 && Math.abs(prozent(fs5.f, fTheorieS)) < 3);

  const tm = await tran(multivibrator(), {dauer: 0.05, tmax: 1 / 192000, start: 'uic', speichern: ['v(c1)', 'v(c2)']});
  const fm = frequenzAusDurchgaengen(tm.t, tm.wert('v(c1)'), 0.015);
  const fTheorieM = 1 / (2 * Math.log(2) * 47000 * 47e-9);
  zeile('Astabiler Multivibrator, Start aus Anfangswerten', `um ${hz(fTheorieM)}, Faustformel 1/(2·ln2·R·C); real etwas darunter durch U_BE`, fm ? `${hz(fm.f)} über ${fm.perioden} Perioden` : 'schwingt nicht', fm && Math.abs(prozent(fm.f, fTheorieM)) < 15);
  const tm0 = await tran(multivibrator(0), {dauer: 0.05, tmax: 1 / 192000, start: 'op', speichern: ['v(c1)']});
  const hub0 = pegelZeit(tm0.t, tm0.wert('v(c1)'), 0.015).spitze;
  zeile('… ohne Anstoß: Start aus dem symmetrischen Arbeitspunkt', 'bleibt stehen oder schwingt nur aus numerischem Rauschen an', `Hub ${fmtMess(hub0, 'V', 3)}`, hub0 < 0.05 ? true : null, 'Genau deshalb steht die Startbedingung sichtbar an C1.');

  /* Speichern und Laden */
  const v = VERSUCHE.find(x => x.id === 'emitter').bau();
  const roh = JSON.stringify(zuDatei(v));
  const {projekt: zurueck, meldungen} = ausDatei(JSON.parse(roh));
  const n1 = spiceText(baueSchaltung(v), {art: 'tran', dauer: 0.1, tmax: 1e-5, start: 'op'}), n2 = spiceText(baueSchaltung(zurueck), {art: 'tran', dauer: 0.1, tmax: 1e-5, start: 'op'});
  const ir1 = baueSchaltung(v), ir2 = baueSchaltung(zurueck);
  const gleichTeile = JSON.stringify(v.teile) === JSON.stringify(zurueck.teile) && JSON.stringify(v.draehte) === JSON.stringify(zurueck.draehte);
  zeile('Projekt speichern und laden', 'gleiche Topologie, Modelle, Parameter und Hörpunkte', `Netlist ${n1 === n2 ? 'identisch' : 'verschieden'}, Teile und Drähte ${gleichTeile ? 'identisch' : 'verschieden'}, Hörpunkt ${ir1.hoerpunkt?.netz} = ${ir2.hoerpunkt?.netz}, Datei ${komma((roh.length / 1024).toFixed(1))} kB, ${meldungen.length} Modellhinweise`, n1 === n2 && gleichTeile && ir1.hoerpunkt?.netz === ir2.hoerpunkt?.netz);
  const dat = zuDatei(rc(1e4, 1e-8));
  zeile('… Inhalt der Datei', 'Bauteile mit Modell und Version, Werte mit Einheiten, Netze aus der Geometrie', `R1: ${JSON.stringify(dat.teile.find(t => t.id === 'R1').werte)}, Modell ${JSON.stringify(dat.teile.find(t => t.id === 'R1').modell)}`, dat.teile.find(t => t.id === 'R1').werte.R.einheit === 'Ω');
}

/* ---------- Pegel und Faust ---------- */
async function pegelUebergaenge() {
  gruppe('Daten- und Pegelübergänge im selben Audiokontext', 'Abgriff an der Monitorstufe auf dem Audio-Thread');
  await monitor.start();
  const ctx = monitor.ctx;
  const fs = ctx.sampleRate;
  zeile('Audiokontext', 'läuft nach Nutzeraktion', `${ctx.state}, ${fs} Hz, Basislatenz ${fmtZahl(ctx.baseLatency * 1000, 2)} ms`, ctx.state === 'running');
  monitor.stelle('lautstaerke', 1);
  monitor.stelle('dc', false);

  const t = await tran(rc(1e4, 1e-8), {dauer: 1, tmax: 1 / 192000});
  const volt = zuAudio(t.t, t.wert('v(aus)'), fs);
  const sollV = 5 / Math.hypot(1, 440 / (1 / (2 * Math.PI * 1e4 * 1e-8)));
  const istV = amplitudeBei(volt, fs, 440, fs / 10 | 0).amplitude;
  zeile('Hörweg, Spannung am Hörpunkt nach Resampling', `${fmtMess(sollV, 'V', 5)} Sinus 440 Hz`, `${fmtMess(istV, 'V', 5)} (${abw(istV, sollV)})`, Math.abs(prozent(istV, sollV)) < 0.1);

  monitor.spieleVolt(volt, fs, {schleife: true});
  await warte(250);
  let ab = await monitor.abgreifen(Math.round(fs * 0.25));
  const dig = amplitudeBei(ab.ein, fs, 440).amplitude;
  zeile('Digitaler Pegel am Monitor-Eingang (10 V = 1,0)', `${komma((sollV / VOLT_JE_EINS).toFixed(5))}`, `${komma(dig.toFixed(5))} (${abw(dig, sollV / VOLT_JE_EINS)})`, Math.abs(prozent(dig, sollV / VOLT_JE_EINS)) < 0.2);

  monitor.stelle('lautstaerke', 0.5);
  await warte(60);
  ab = await monitor.abgreifen(Math.round(fs * 0.25));
  const hinter = amplitudeBei(ab.aus, fs, 440).amplitude, davor = amplitudeBei(ab.ein, fs, 440).amplitude;
  zeile('Monitorlautstärke 0,5 wirkt nur dahinter', 'Eingang unverändert, Ausgang halbiert', `Eingang ${komma(davor.toFixed(5))}, Ausgang ${komma(hinter.toFixed(5))}`, Math.abs(hinter / davor - 0.5) < 0.001 && Math.abs(davor - dig) / dig < 0.002);
  monitor.stelle('lautstaerke', 1);

  const dreh = await faustUebersetzen('halb', 'process = *(0.5);');
  const fk = await faustKnoten(ctx, 'halb', dreh.generator);
  monitor.setzeKette([{eingang: fk, ausgang: fk}]);
  await warte(120);
  ab = await monitor.abgreifen(Math.round(fs * 0.25));
  const mitF = amplitudeBei(ab.ein, fs, 440).amplitude;
  zeile('Faust-Knoten im selben Audiokontext (process = *(0.5))', `${komma((dig / 2).toFixed(5))}, Knoten ${fk.constructor.name}`, `${komma(mitF.toFixed(5))} (${abw(mitF, dig / 2)})`, Math.abs(prozent(mitF, dig / 2)) < 0.2 && fk.constructor.name.includes('AudioWorklet'));
  const faust = FAUST_MODULE.moog;
  const gMoog = await faustUebersetzen('moog', faust.code);
  const nMoog = await faustKnoten(ctx, 'moog', gMoog.generator);
  zeile('Faust-Bibliothek vaeffects: Moog-Filter', 'übersetzt und erzeugt Regler', `${fmtZahl(gMoog.uebersetzMs, 0)} ms, Regler ${faustRegler(nMoog).map(r => r.name).join(', ')}`, faustRegler(nMoog).length === 2);
  monitor.setzeKette([]);
  fk.disconnect();
  monitor.stoppeQuelle();

  /* DC-Sperre und Begrenzer */
  const dc = new Float64Array(fs).fill(2);
  for (let i = 0; i < dc.length; i++) dc[i] += 3 * Math.sin(2 * Math.PI * 440 * i / fs);
  monitor.stelle('dc', true);
  monitor.spieleVolt(dc, fs, {schleife: true});
  await warte(1400);
  ab = await monitor.abgreifen(Math.round(fs * 0.1));
  const pe = pegel(ab.ein), pa = pegel(ab.aus);
  zeile('DC-Sperre nur im Lautsprecherweg', 'Eingang behält 0,2 Gleichanteil, Ausgang ≈ 0', `Eingang Mittel ${komma(pe.mittel.toFixed(4))}, Ausgang Mittel ${komma(pa.mittel.toFixed(4))}`, Math.abs(pe.mittel - 0.2) < 0.01 && Math.abs(pa.mittel) < 0.01);
  monitor.stelle('dc', false);
  const laut = new Float64Array(fs);
  for (let i = 0; i < laut.length; i++) laut[i] = 20 * Math.sin(2 * Math.PI * 440 * i / fs);
  monitor.spieleVolt(laut, fs, {schleife: true});
  await warte(120);
  ab = await monitor.abgreifen(Math.round(fs * 0.1));
  zeile('Schutzbegrenzer bei 20 V am Hörpunkt (2,0 digital)', 'Eingang 2,0, Ausgang unter 1,0', `Eingang ${komma(pegel(ab.ein).max.toFixed(3))}, Ausgang ${komma(pegel(ab.aus).max.toFixed(3))}`, pegel(ab.ein).max > 1.9 && pegel(ab.aus).max <= 1.0);
  monitor.stoppeQuelle();

  /* WAV */
  const wav = wavFloat32(new Float32Array([0, 0.5, -0.5, 1.5]), fs);
  const dv = new DataView(wav);
  zeile('WAV-Datei: 32 Bit Float, Pegel über 1,0 bleibt', 'Kopf RIFF/WAVE, Format 3, Wert 1,5', `${String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3))}, Format ${dv.getUint16(20, true)}, letzter Wert ${komma(dv.getFloat32(44 + 12, true).toFixed(1))}`, dv.getUint16(20, true) === 3 && dv.getFloat32(56, true) === 1.5);

  /* Faust-Quelle als PWL in ngspice: Rendern über die Grenze */
  const qf = await faustUebersetzen('sin', 'import("stdfaust.lib"); process = os.osc(440) * 0.5;');
  const proben = await faustRendern(qf.generator, fs, Math.ceil(fs * 0.1) + 2);
  const pDigital = ausNetzen('Faust in RC', [
    {typ: 'audioein', id: 'AE1', werte: {volt: 10}, netze: {'+': 'ein', '-': '0'}},
    {typ: 'r', id: 'R1', werte: {R: 1e4}, netze: {1: 'ein', 2: 'aus'}},
    {typ: 'c', id: 'C1', werte: {C: 1e-8}, netze: {1: 'aus', 2: '0'}},
    {typ: 'sonde', id: 'CH1', netze: {1: 'aus'}}
  ]);
  const irD = baueSchaltung(pDigital);
  const rD = await spice.rechne(spiceText(irD, {art: 'tran', dauer: 0.1, tmax: 1 / 192000, start: 'op', digital: {[irD.elemente.find(e => e.welle?.art === 'digital').welle.teil]: {werte: proben, rate: fs}}}));
  const tD = spalte(rD.ergebnis, 'time').values, vD = spalte(rD.ergebnis, 'v(aus)').values;
  const xD = zuAudio(tD, vD, fs);
  const sollD = 5 / Math.hypot(1, 440 / (1 / (2 * Math.PI * 1e4 * 1e-8)));
  const istD = amplitudeBei(xD, fs, 440, fs / 50 | 0).amplitude;
  zeile('Faust-Sinus über den digitalen Eingang in die Schaltung, gerendert', `${fmtMess(sollD, 'V', 5)} (0,5 digital = 5 V, dann RC)`, `${fmtMess(istD, 'V', 5)}, ${fmtZahl(rD.rechenMs, 0)} ms Rechenzeit (${abw(istD, sollD)})`, Math.abs(prozent(istD, sollD)) < 0.5);
}

/* ---------- Live gegen ngspice ---------- */
async function liveGegenSpice() {
  gruppe('Live-Löser gegen ngspice', 'Gleiche Schaltung, gleiche Quellen, gleicher Start. 48 kHz × 4, ngspice mit viermal feinerem Höchstschritt. Fehlerangaben bezogen auf Spitze-Spitze');
  const fmtV = v => `Effektivfehler ${komma(v.rmsProzent.toFixed(4))} %, größter Einzelfehler ${fmtMess(v.emax, 'V', 3)} bei Spitze ${fmtMess(v.spitze, 'V', 3)}; Newton ⌀ ${komma(v.newtonMittel.toFixed(2))}, max ${v.newtonMax}, ohne Konvergenz ${v.nichtKonvergiert}`;
  const fall = async (name, p, o, grenze, notiz) => {
    const v = await vergleiche(spice, p, o);
    zeile(name, `Effektivfehler unter ${komma(grenze)} %`, fmtV(v), v.rmsProzent < grenze && v.nichtKonvergiert === 0, notiz);
    return v;
  };
  await fall('RC-Tiefpass, Sinus 440 Hz', rc(1e4, 1e-8), {netz: 'aus', dauer: 0.05}, 1, 'lineares Ziel laut Briefing: unter 1 %');
  await fall('RC-Tiefpass, Rechteck 220 Hz', rc(1e4, 1e-8, {}, 'rechteck', 220), {netz: 'aus', dauer: 0.05}, 1, 'Der Einzelfehler sitzt an den Flanken: Der Live-Löser kennt nur das feste Raster.');
  await fall('Schwingkreis 47 Ω, 10 mH, 100 nF, Rechteck', ausNetzen('LC', [
    {typ: 'gen', id: 'G1', werte: {form: 'rechteck', f: 110, amp: 3}, netze: {'+': 'ein', '-': '0'}},
    {typ: 'r', id: 'R1', werte: {R: 47}, netze: {1: 'ein', 2: 'x'}},
    {typ: 'l', id: 'L1', werte: {L: 10e-3}, netze: {1: 'x', 2: 'aus'}},
    {typ: 'c', id: 'C1', werte: {C: 100e-9}, netze: {1: 'aus', 2: '0'}}
  ]), {netz: 'aus', dauer: 0.03}, 1, 'Resonanz bei 5 kHz: Hier zeigt sich die Frequenzverzerrung der Trapezregel.');

  await fall('Diodenbegrenzer 1N4148, Sinus', begrenzer(true), {netz: 'aus', dauer: 0.03}, 0.5, 'Verlauf. Der Live-Löser rechnet ohne Sperrschicht- und Diffusionskapazität.');
  const klirrVgl = await vergleiche(spice, begrenzer(true), {netz: 'aus', dauer: 0.2});
  const rasterS = new Float64Array(klirrVgl.vL.length);
  {
    let i = 1;
    for (let k = 0; k < rasterS.length; k++) {
      const tk = klirrVgl.t[k];
      while (i < klirrVgl.tS.length - 1 && klirrVgl.tS[i] < tk) i++;
      const a = (tk - klirrVgl.tS[i - 1]) / (klirrVgl.tS[i] - klirrVgl.tS[i - 1]);
      rasterS[k] = klirrVgl.vS[i - 1] + a * (klirrVgl.vS[i] - klirrVgl.vS[i - 1]);
    }
  }
  const fsR = 192000;
  const hL = klirr(klirrVgl.vL.subarray(fsR * 0.05), fsR, 220, 8), hS = klirr(rasterS.subarray(fsR * 0.05), fsR, 220, 8);
  zeile('… Spektrum: Klirrfaktor', `ngspice ${komma((hS.thd * 100).toFixed(2))} %`, `Live ${komma((hL.thd * 100).toFixed(2))} %`, Math.abs(hL.thd - hS.thd) < 0.005, 'Kriterium: unter 0,5 Prozentpunkte');

  const vE = await vergleiche(spice, emitterstufe(50, 0.02, 'NPN-GEN'), {netz: 'c', dauer: 0.03});
  zeile('Emitterschaltung, NPN generisch', 'Effektivfehler unter 0,5 %', fmtV(vE), vE.rmsProzent < 0.5 && vE.nichtKonvergiert === 0);
  const vH = await vergleiche(spice, emitterstufe(50, 0.02, 'BC847B'), {netz: 'c', dauer: 0.03});
  zeile('Emitterschaltung, BC847B', 'dokumentierte Abweichung', fmtV(vH), vH.rmsProzent < 5 ? (vH.rmsProzent < 1 ? true : null) : false, 'Live rechnet nur den Haupttransistor mit festem RB und ohne Kapazitäten.');

  await fall('Invertierender OPV-Verstärker (TL07x), linear', inverter(0.5), {netz: 'aus', dauer: 0.02}, 0.5);
  await fall('… übersteuert bis an die Versorgung', inverter(5), {netz: 'aus', dauer: 0.02}, 1, 'Hub und Klemmen sind dieselben Grundelemente wie in ngspice.');

  const vS = await vergleiche(spice, schmittOszi(), {netz: 'y', dauer: 0.05, start: 'uic', ab: 0.01});
  const sS = schwingVergleich(vS, 0.01);
  const fT = 1 / (1e5 * 1e-8 * Math.log(((1 - 0.385) / (1 - 0.59)) * (0.59 / 0.385)));
  zeile('Schmitt-Oszillator: Schwingfrequenz', `Abweichung unter 2 % (Theorie ${hz(fT)})`, `ngspice ${hz(sS.fSpice)}, Live ${hz(sS.fLive)} (${komma(sS.fAbw.toFixed(2))} %)`, Math.abs(sS.fAbw) < 2);
  zeile('… Amplitude', 'Abweichung unter 2 %', `ngspice ${fmtMess(sS.ampSpice, 'V', 4)}, Live ${fmtMess(sS.ampLive, 'V', 4)} (${komma(sS.ampAbw.toFixed(2))} %)`, Math.abs(sS.ampAbw) < 2);

  const vM = await vergleiche(spice, multivibrator(), {netz: 'c1', dauer: 0.05, start: 'uic', ab: 0.015});
  const sM = schwingVergleich(vM, 0.015);
  zeile('Multivibrator: Schwingfrequenz', 'Abweichung unter 1 %, ohne Nichtkonvergenz', `ngspice ${hz(sM.fSpice)}, Live ${hz(sM.fLive)} (${komma(sM.fAbw.toFixed(2))} %), ohne Konvergenz ${vM.nichtKonvergiert}`, Math.abs(sM.fAbw) < 1 && vM.nichtKonvergiert === 0, 'Beim Kippen endet der Lösungszweig: Die Rechnung muss in einem Schritt die Lösung auf der anderen Seite finden.');
  zeile('… Amplitude', 'Abweichung unter 1 %', `ngspice ${fmtMess(sM.ampSpice, 'V', 4)}, Live ${fmtMess(sM.ampLive, 'V', 4)} (${komma(sM.ampAbw.toFixed(2))} %)`, Math.abs(sM.ampAbw) < 1);

  /* Mitkopplung ohne Kondensator: Die Rechnung muss das instabile Gleichgewicht verlassen und darf nicht darauf stehen bleiben. */
  await fall('OPV-Schmitt-Trigger, Sinus', ausNetzen('OPV-Schmitt-Trigger', [
    {typ: 'rail', id: 'V1', werte: {u: 12}, netze: {1: 'p'}},
    {typ: 'rail', id: 'V2', werte: {u: -12}, netze: {1: 'm'}},
    {typ: 'gen', id: 'G1', werte: {form: 'sinus', f: 100, amp: 8}, netze: {'+': 'ein', '-': '0'}},
    {typ: 'r', id: 'R1', werte: {R: 10000}, netze: {1: 'ein', 2: 'plus'}},
    {typ: 'r', id: 'R2', werte: {R: 47000}, netze: {1: 'aus', 2: 'plus'}},
    {typ: 'opv', id: 'U1', werte: {modell: 'TL07X'}, netze: {'+': 'plus', '-': '0', A: 'aus', 'V+': 'p', 'V-': 'm'}},
    {typ: 'sonde', id: 'CH1', netze: {1: 'aus'}}
  ]), {netz: 'aus', dauer: 0.05, ab: 0.005}, 1.5, 'Der Fehler sitzt an den Flanken: Der Live-Löser kippt auf dem festen Raster.');

  /* Arbeitspunkt des Live-Lösers */
  const pE = emitterstufe(50, 0.02, 'NPN-GEN');
  const oE = await op(pE);
  const irL = baueSchaltung(pE, {ziel: 'live'});
  const {kern} = startKern(irL, {mess: [{id: 'c', art: 'u', netz: 'c'}, {id: 'b', art: 'u', netz: 'b'}, {id: 'e', art: 'u', netz: 'e'}], start: 'op'});
  kern._bewerte(kern.v);
  kern._messen();
  const [lc, lb, le] = kern.p;
  zeile('Arbeitspunkt Emitterschaltung: Live gegen ngspice .op', 'Abweichung unter 0,5 %', `Uc ${fmtMess(lc, 'V', 5)} / ${fmtMess(oE.wert('v(c)'), 'V', 5)}; Ub ${fmtMess(lb, 'V', 5)} / ${fmtMess(oE.wert('v(b)'), 'V', 5)}; Ue ${fmtMess(le, 'V', 5)} / ${fmtMess(oE.wert('v(e)'), 'V', 5)}`, Math.abs(prozent(lc, oE.wert('v(c)'))) < 0.5 && Math.abs(prozent(lb, oE.wert('v(b)'))) < 0.5);

  /* Grenzfrequenz aus dem Live-Löser, gemessen mit Sinus */
  const fc0 = 1 / (2 * Math.PI * 1e4 * 1e-8);
  const lp = (over) => {
    const p = rc(1e4, 1e-8, {}, 'sinus', fc0, 1);
    const ir = baueSchaltung(p, {ziel: 'live'});
    const {kern: k} = startKern(ir, {fs: FS, ueber: over, start: 'op', mess: [{id: 'x', art: 'u', netz: 'aus'}]});
    const fsr = FS * over;
    const {aus} = rechneOffline(k, Math.round(fsr * 0.2));
    const a = amplitudeBei(aus[0], fsr, fc0, fsr * 0.05 | 0).amplitude;
    return 20 * Math.log10(a);
  };
  const db1 = lp(1), db4 = lp(4);
  zeile('Betrag bei 1591,55 Hz im Live-Löser', '−3,01 dB; Fehler der Trapezregel sinkt mit Überabtastung', `1×: ${komma(db1.toFixed(3))} dB; 4×: ${komma(db4.toFixed(3))} dB`, Math.abs(db4 - DB_3) < 0.03);

  /* WDF */
  gruppe('WDF-Prüfung', 'Struktur wie chowdsp_wdf, in JavaScript nachgebaut. Die C++-Bibliothek selbst wurde nicht nach WebAssembly portiert');
  const fsr = FS * 4, n = fsr / 2 | 0;
  const quelle = t => 5 * Math.sin(2 * Math.PI * 440 * t);
  const pl = erzeugePlan(baueSchaltung(rc(1e4, 1e-8), {ziel: 'live'}), {fs: FS, ueber: 4, mess: [{id: 'x', art: 'u', netz: 'aus'}]});
  const kL = new LiveKern(pl);
  kL.zustandSetzen({mitIc: true, schritte: 0, t: 0});
  const tA = performance.now();
  const {aus: ausL} = rechneOffline(kL, n);
  const msL = performance.now() - tA;
  const tB = performance.now();
  const ausW = wdfRC(1e4, 1e-8, fsr, quelle, n);
  const msW = performance.now() - tB;
  let dMax = 0;
  for (let i = 0; i < n; i++) dMax = Math.max(dMax, Math.abs(ausL[0][i] - ausW[i]));
  zeile('RC-Tiefpass: WDF gegen allgemeinen Löser', 'beide sind die bilineare Abbildung, also gleiches Ergebnis', `größte Differenz ${fmtMess(dMax, 'V', 2)}; Rechenzeit für 0,5 s: Löser ${fmtZahl(msL, 1)} ms, WDF ${fmtZahl(msW, 1)} ms`, dMax < 1e-6, 'Die Differenz kommt vom Hilfsleitwert 1 pS je Knoten im Löser. Beim linearen Netz gibt es keinen Genauigkeitsgewinn.');

  const si = DIODEN.SI.karte;
  const pD = ausNetzen('Clip', [
    {typ: 'gen', id: 'G1', werte: {form: 'sinus', f: 440, amp: 5}, netze: {'+': 'ein', '-': '0'}},
    {typ: 'r', id: 'R1', werte: {R: 1e4}, netze: {1: 'ein', 2: 'aus'}},
    {typ: 'd', id: 'D1', werte: {modell: 'SI'}, netze: {A: 'aus', K: '0'}},
    {typ: 'd', id: 'D2', werte: {modell: 'SI'}, netze: {A: '0', K: 'aus'}}
  ]);
  /* Serienwiderstand der generischen Diode für den Vergleich weglassen: identisches Modell in beiden Wegen */
  const irD = baueSchaltung(pD, {ziel: 'live'});
  for (const e of irD.elemente) if (e.k === 'D') e.modell = {...e.modell, karte: {IS: si.IS, N: 1}};
  const plD = erzeugePlan(irD, {fs: FS, ueber: 4, mess: [{id: 'x', art: 'u', netz: 'aus'}]});
  const kD = new LiveKern(plD);
  kD.zustandSetzen({mitIc: true, schritte: 0, t: 0});
  const tC = performance.now();
  const {aus: ausD} = rechneOffline(kD, n);
  const msD = performance.now() - tC;
  const tE = performance.now();
  const wd = wdfBegrenzer(1e4, si.IS, VT_27C, 1e-12, fsr, quelle, n);
  const msE = performance.now() - tE;
  let dMaxD = 0;
  for (let i = 0; i < n; i++) dMaxD = Math.max(dMaxD, Math.abs(ausD[0][i] - wd.aus[i]));
  zeile('Diodenbegrenzer: Wurzel-Nichtlinearität gegen allgemeinen Löser', 'gleicher Verlauf; der Spezialfall darf schneller sein', `größte Differenz ${fmtMess(dMaxD, 'V', 2)}; Rechenzeit für 0,5 s: Löser ${fmtZahl(msD, 1)} ms, spezialisiert ${fmtZahl(msE, 1)} ms`, dMaxD < 1e-3, 'Der allgemeine Löser kostet hier etwas mehr, reicht für den Livebetrieb aber aus. WDF scheitert an frei verdrahteten Netzen mit mehreren Nichtlinearitäten ohne eigene Topologie-Zerlegung.');
}

/* ---------- Rechenbudget ---------- */
function stufenBJT(n) {
  /* n Emitterstufen hintereinander, jede mit Kopplungskondensator */
  const liste = [
    {typ: 'rail', id: 'V1', werte: {u: 12}, netze: {1: 'vcc'}},
    {typ: 'gen', id: 'G1', werte: {form: 'sinus', f: 220, amp: 0.01}, netze: {'+': 's0', '-': '0'}}
  ];
  for (let i = 1; i <= n; i++) {
    liste.push(
      {typ: 'c', id: `CK${i}`, werte: {C: 1e-6}, netze: {1: `s${i - 1}`, 2: `b${i}`}},
      {typ: 'r', id: `RA${i}`, werte: {R: 100000}, netze: {1: 'vcc', 2: `b${i}`}},
      {typ: 'r', id: `RB${i}`, werte: {R: 22000}, netze: {1: `b${i}`, 2: '0'}},
      {typ: 'r', id: `RC${i}`, werte: {R: 4700}, netze: {1: 'vcc', 2: `s${i}`}},
      {typ: 'r', id: `RE${i}`, werte: {R: 1000}, netze: {1: `e${i}`, 2: '0'}},
      {typ: 'c', id: `CE${i}`, werte: {C: 22e-6}, netze: {1: `e${i}`, 2: '0'}},
      {typ: 'npn', id: `T${i}`, werte: {modell: 'NPN-GEN'}, netze: {B: `b${i}`, C: `s${i}`, E: `e${i}`}}
    );
  }
  liste.push({typ: 'sonde', id: 'CH1', netze: {1: `s${n}`}}, {typ: 'hoer', id: 'H1', netze: {1: `s${n}`}});
  return ausNetzen(`${n} Stufen`, liste);
}

function ketteOPV(n) {
  const liste = [
    {typ: 'rail', id: 'V1', werte: {u: 12}, netze: {1: 'p'}},
    {typ: 'rail', id: 'V2', werte: {u: -12}, netze: {1: 'm'}},
    {typ: 'gen', id: 'G1', werte: {form: 'sinus', f: 440, amp: 0.5}, netze: {'+': 's0', '-': '0'}}
  ];
  for (let i = 1; i <= n; i++) {
    liste.push(
      {typ: 'r', id: `RA${i}`, werte: {R: 10000}, netze: {1: `s${i - 1}`, 2: `n${i}`}},
      {typ: 'r', id: `RB${i}`, werte: {R: 10000}, netze: {1: `n${i}`, 2: `s${i}`}},
      {typ: 'c', id: `CF${i}`, werte: {C: 1e-9}, netze: {1: `n${i}`, 2: `s${i}`}},
      {typ: 'opv', id: `U${i}`, werte: {modell: 'TL07X'}, netze: {'+': '0', '-': `n${i}`, A: `s${i}`, 'V+': 'p', 'V-': 'm'}}
    );
  }
  liste.push({typ: 'sonde', id: 'CH1', netze: {1: `s${n}`}}, {typ: 'hoer', id: 'H1', netze: {1: `s${n}`}});
  return ausNetzen(`${n} OPV`, liste);
}

/* Last einer Schaltung auf dem Audio-Thread über 2 s Audiozeit. Die ersten beiden Berichte zählen nicht: Da übersetzt der Browser den Code noch.
   Unter schwerer Überlast kommen die Berichte spät oder gar nicht. Das darf nicht als kleine Last durchgehen. */
const KEIN_BERICHT = 'keine Berichte in 8 s: schwere Überlast';
async function messeLast(p, start) {
  const berichte = [];
  live.beiBericht = b => { if (b.kennung === live.kennung) berichte.push(b); };
  const st = await live.starten(p, {ueber: 4, start});
  for (const ende = performance.now() + 8000; berichte.length < 10 && performance.now() < ende;) await warte(100);
  live.stoppen();
  live.beiBericht = null;
  await warte(50);
  const b = berichte.slice(2);
  const summe = feld => b.reduce((s, x) => s + x[feld], 0);
  return {st, gemessen: b.length > 0, last: summe('last') / (b.length || 1), spitze: Math.max(0, ...b.map(x => x.spitzeMs)), ueber: summe('ueberBudget'), bloecke: summe('bloecke'), nk: summe('nk')};
}

async function budget() {
  gruppe('Rechenbudget des Live-Lösers', 'Gemessen auf dem Audio-Thread: Rechenzeit je Block bezogen auf die Blockdauer, 48 kHz × 4, je 2 s. Die Werte gelten nur für dieses Gerät');
  zeile('Gerät und Browser', 'festhalten', `${navigator.userAgent}; ${navigator.hardwareConcurrency} logische Kerne`, null);
  await monitor.start();
  monitor.stelle('lautstaerke', 0);
  const faelle = [
    ['RC-Tiefpass', rc(1e4, 1e-8)],
    ['Diodenbegrenzer 1N4148', begrenzer(true)],
    ['1 Transistorstufe', stufenBJT(1)],
    ['2 Transistorstufen', stufenBJT(2)],
    ['4 Transistorstufen', stufenBJT(4)],
    ['8 Transistorstufen', stufenBJT(8)],
    ['12 Transistorstufen', stufenBJT(12)],
    ['1 OPV', ketteOPV(1)],
    ['4 OPV', ketteOPV(4)],
    ['8 OPV', ketteOPV(8)],
    ['12 OPV', ketteOPV(12)]
  ];
  for (const [name, p] of faelle) {
    const {st, gemessen, last, spitze, ueber, bloecke, nk} = await messeLast(p, 'op');
    zeile(name, 'unter 100 % ist live spielbar', gemessen ? `${komma((last * 100).toFixed(1))} %; längster Block ${fmtZahl(spitze, 1)} ms von 2,67 ms; ${ueber} von ${bloecke} Blöcken über Budget; ${st.plan.n} Unbekannte, ${st.plan.S} Zustände, ${st.plan.Mv} nichtlineare Anschlüsse; ohne Konvergenz ${nk}` : KEIN_BERICHT, gemessen && last < 0.9 && nk === 0 ? true : null);
  }

  gruppe('Jeder Versuch live', 'Dieselbe Messung für alle Versuche: Sie müssen auf diesem Gerät mit 4-facher Überabtastung spielbar sein');
  for (const v of VERSUCHE) {
    const p = v.bau();
    const {gemessen, last, spitze, nk} = await messeLast(p, p.analyse.start);
    zeile(v.titel, 'unter 90 %, ohne Nichtkonvergenz', gemessen ? `${komma((last * 100).toFixed(1))} %, längster Block ${fmtZahl(spitze, 1)} ms, ohne Konvergenz ${nk}` : KEIN_BERICHT, gemessen && last < 0.9 && nk === 0);
  }
  monitor.stelle('lautstaerke', 1);
}

/* ---------- Audio-Thread ---------- */
async function audioThread() {
  gruppe('Live auf dem Audio-Thread', 'AudioWorklet im selben Audiokontext; 128 Abtastwerte bei 48 kHz sind 2,67 ms Budget, keine zugesicherte Latenz');
  await monitor.start();
  const ctx = monitor.ctx, fs = ctx.sampleRate;
  monitor.stelle('lautstaerke', 1);
  const berichte = [];
  live.beiBericht = b => berichte.push(b);
  const planmeldungen = [];
  live.beiPlan = d => planmeldungen.push(d);

  const p = rc(1e4, 1e-8);
  await live.starten(p, {ueber: 4, start: 'op'});
  await warte(600);
  zeile('Uhr auf dem Audio-Thread', 'festhalten', live.uhr === 'Date.now' ? 'performance.now fehlt im AudioWorklet, also Date.now mit 1 ms Auflösung: Mittelwert belastbar, Spitzen nur grob' : String(live.uhr), null);
  let ab = await monitor.abgreifen(Math.round(fs * 0.25));
  const fc0 = 1 / (2 * Math.PI * 1e4 * 1e-8);
  const soll = 5 / Math.hypot(1, 440 / fc0) / 10;
  const ist = amplitudeBei(ab.ein, fs, 440).amplitude;
  zeile('RC live: Pegel am Monitor-Eingang', `${komma(soll.toFixed(5))} (Sinus 440 Hz)`, `${komma(ist.toFixed(5))} (${abw(ist, soll)})`, Math.abs(prozent(ist, soll)) < 1);

  /* R ändern im laufenden Betrieb */
  const p2 = rc(2e4, 1e-8);
  const nPlan = planmeldungen.length;
  live.aktualisieren(p2);
  await warte(120);
  ab = await monitor.abgreifen(Math.round(fs * 0.25));
  const soll2 = 5 / Math.hypot(1, 440 / (fc0 / 2)) / 10;
  const ist2 = amplitudeBei(ab.ein, fs, 440).amplitude;
  zeile('R auf 20 kΩ während der Wiedergabe', `${komma(soll2.toFixed(5))}, neuer Plan an einer Blockgrenze`, `${komma(ist2.toFixed(5))} (${abw(ist2, soll2)}), Übernahme ${fmtZahl(planmeldungen[nPlan]?.uebernahmeMs ?? 0, 1)} ms`, Math.abs(prozent(ist2, soll2)) < 1);

  /* Kondensator umstecken während der Wiedergabe */
  live.aktualisieren(rc(1e4, 1e-8, {cAn: 'ein'}));
  await warte(120);
  ab = await monitor.abgreifen(Math.round(fs * 0.25));
  const ist3 = amplitudeBei(ab.ein, fs, 440).amplitude;
  zeile('Kondensator umstecken während der Wiedergabe', 'Ausgang folgt dem Eingang: 0,5', `${komma(ist3.toFixed(5))}`, Math.abs(ist3 - 0.5) < 0.005);

  /* Audiozweig trennen: gespeicherte Energie klingt aus */
  const mitEntladung = (angeschlossen) => ausNetzen('Trennen', [
    {typ: 'v', id: 'V1', werte: {v: 5}, netze: {'+': 'q', '-': '0'}},
    {typ: 'r', id: 'R1', werte: {R: 100}, netze: {1: 'q', 2: angeschlossen ? 'aus' : 'lose'}},
    {typ: 'c', id: 'C1', werte: {C: 1e-6}, netze: {1: 'aus', 2: '0'}},
    {typ: 'r', id: 'R2', werte: {R: 1e4}, netze: {1: 'aus', 2: '0'}},
    {typ: 'sonde', id: 'CH1', netze: {1: 'aus'}},
    {typ: 'hoer', id: 'H1', netze: {1: 'aus'}}
  ]);
  await live.starten(mitEntladung(true), {ueber: 4, start: 'op'});
  await warte(300);
  const vorMess = amplitudeBeiDC(await monitor.abgreifen(Math.round(fs * 0.02)));
  const fangen = monitor.abgreifen(Math.round(fs * 0.06));
  await warte(10);
  live.aktualisieren(mitEntladung(false));
  const nach = await fangen;
  const ausklang = analysiereAbfall(nach.ein, fs, vorMess);
  zeile('Zweig trennen: Der Kondensator entlädt sich über R2', `τ = R2·C = 10 ms; vorher ${komma((vorMess * 10).toFixed(3))} V`, ausklang.tau ? `gemessene Zeitkonstante ${fmtMess(ausklang.tau, 's', 4)}; kein Sprung im Moment des Trennens` : 'kein Abfall gefunden', ausklang.tau && Math.abs(prozent(ausklang.tau, 0.01)) < 5, 'Der Zweig fällt aus, die gespeicherte Energie klingt modellgerecht ab.');

  /* Oszillator live */
  const berichteVor = berichte.length;
  await live.starten(schmittOszi(), {ueber: 4, start: 'uic'});
  await warte(1000);
  ab = await monitor.abgreifen(Math.round(fs * 0.5));
  const tt = Float64Array.from({length: ab.ein.length}, (_, i) => i / fs);
  const fO = frequenzAusDurchgaengen(tt, ab.ein, 0);
  const fT = 1 / (1e5 * 1e-8 * Math.log(((1 - 0.385) / (1 - 0.59)) * (0.59 / 0.385)));
  zeile('CD40106-Oszillator live, ohne Audiokabel', `${hz(fT)} aus Schwellen und RC`, fO ? `${hz(fO.f)} (${abw(fO.f, fT)}), Hub ${komma((pegel(ab.ein).spitze * 10).toFixed(2))} V` : 'schwingt nicht', fO && Math.abs(prozent(fO.f, fT)) < 2);
  const lb = berichte.slice(berichteVor);
  if (lb.length) zeile('… Rechenlast dabei', 'festhalten', `⌀ ${komma((lb.reduce((s, b) => s + b.last, 0) / lb.length * 100).toFixed(1))} %, längster Block ${fmtZahl(Math.max(...lb.map(b => b.spitzeMs)), 1)} ms`, null);

  /* Faust-Effekt hinter dem Live-Löser */
  const g = await faustUebersetzen('halb2', 'process = *(0.5);');
  const fk = await faustKnoten(ctx, 'halb2', g.generator);
  monitor.setzeKette([{eingang: fk, ausgang: fk}]);
  await warte(100);
  await live.starten(rc(1e4, 1e-8), {ueber: 4, start: 'op'});
  await warte(400);
  ab = await monitor.abgreifen(Math.round(fs * 0.25));
  const istF = amplitudeBei(ab.ein, fs, 440).amplitude;
  zeile('Live-Schaltung → Faust → Monitor', `${komma((soll / 2).toFixed(5))}`, `${komma(istF.toFixed(5))} (${abw(istF, soll / 2)})`, Math.abs(prozent(istF, soll / 2)) < 1);
  monitor.setzeKette([]);
  fk.disconnect();
  /* Start und Stopp können vor derselben Audioblockgrenze eintreffen. */
  await live.starten(rc(1e4, 1e-8), {ueber: 4, start: 'op'});
  live.stoppen();
  await warte(100);
  const still = await monitor.abgreifen(Math.round(fs * 0.1));
  zeile('Stopp direkt nach Start', 'kein wartender Plan startet später wieder', `Spitze ${pegel(still.ein).spitze}`, pegel(still.ein).spitze < 1e-6);
  live.beiBericht = null;
}

function amplitudeBeiDC(ab) { return pegel(ab.ein).mittel; }

function analysiereAbfall(x, fs, start) {
  /* Suche den Beginn des Abfalls und die Zeit bis auf 1/e */
  let i0 = -1;
  for (let i = 0; i < x.length; i++) if (x[i] < start * 0.995) { i0 = i; break; }
  if (i0 < 0) return {tau: null};
  /* Sprung prüfen und Zeitkonstante aus zwei Punkten bestimmen */
  const a = x[i0];
  let i1 = -1;
  for (let i = i0; i < x.length; i++) if (x[i] < a / Math.E) { i1 = i; break; }
  if (i1 < 0) return {tau: null};
  return {tau: (i1 - i0) / fs};
}

/* ---------- Ablauf ---------- */
async function alles(teile) {
  if (!await OSCI.audioFreigabe()) return;
  const knopf = $('#p-start');
  knopf.disabled = true;
  $('#p-tabelle').innerHTML = '<thead><tr><th>Versuch</th><th>Erwartung</th><th>Messwert</th><th>Ergebnis</th></tr></thead>';
  ergebnisse.length = 0;
  const t0 = performance.now();
  const schritte = [['Stecken', () => pruefeStecken({gruppe, zeile})], ['Stufe 1', stufe1], ['ngspice-Abnahme', abnahmeRender], ['Versuche', () => pruefeVersuche({gruppe, zeile, spice})], ['Pegel', pegelUebergaenge], ['Live gegen ngspice', liveGegenSpice], ['Budget', budget], ['Audio-Thread', audioThread]];
  for (const [name, f] of schritte) {
    if (teile && !teile.includes(name)) continue;
    aktualisiereKopf(`läuft: ${name}`);
    try {
      await f();
    } catch (e) {
      zeile(`Abbruch in „${name}“`, 'kein Fehler', `${e.message}`, false);
      console.error(e);
    }
  }
  aktualisiereKopf(`fertig nach ${fmtZahl((performance.now() - t0) / 1000, 1)} s`);
  knopf.disabled = false;
  $('#p-json').disabled = false;
  window.pruefErgebnis = {datum: new Date().toISOString(), browser: navigator.userAgent, ergebnisse};
  document.body.dataset.fertig = 'ja';
}

/* ---------- Dauertest ---------- */
async function dauertest(minuten) {
  if (!await OSCI.audioFreigabe()) return;
  await monitor.start();
  const aus = $('#p-dauer-aus');
  const p = VERSUCHE.find(v => v.id === 'emitter').bau();
  const berichte = [];
  let maxAusstieg = 0;
  live.beiBericht = b => berichte.push(b);
  const st = await live.starten(p, {ueber: 4, start: 'op'});
  const t0 = performance.now();
  const ctx0 = monitor.ctx.currentTime;
  const ende = t0 + minuten * 60000;
  let aenderungen = 0;
  monitor.stelle('lautstaerke', 0.3);
  while (performance.now() < ende) {
    /* Regler bewegen wie beim Spielen: Poti, Generatorfrequenz */
    const phase = (performance.now() - t0) / 1000;
    const poti = p.teile.find(t => t.id === 'P1');
    poti.werte.pos = 50 + 40 * Math.sin(phase / 3);
    live.aktualisieren(p);
    aenderungen++;
    const g = p.teile.find(t => t.id === 'G1');
    live.setzeQuelle('G1', 'gen', {...g.werte, f: 220 * 2 ** Math.sin(phase / 2)});
    /* etwas Arbeit im Hauptthread, wie Zeichnen */
    const c = $('#p-dauer-schirm').getContext('2d');
    c.clearRect(0, 0, 400, 60);
    for (let i = 0; i < 400; i += 2) c.fillRect(i, 30 + Math.sin(i / 20 + phase) * 20, 2, 2);
    await warte(50);
    const verstrichen = (performance.now() - t0) / 1000;
    const audio = monitor.ctx.currentTime - ctx0;
    maxAusstieg = Math.max(maxAusstieg, Math.abs(verstrichen - audio));
    if (berichte.length) {
      const b = berichte[berichte.length - 1];
      aus.textContent = `${fmtZahl(verstrichen, 0)} s · Last ${komma((b.last * 100).toFixed(1))} % · längster Block ${komma(b.spitzeMs.toFixed(1))} ms · ${aenderungen} Pläne`;
    }
  }
  live.stoppen();
  const lasten = berichte.map(b => b.last * 100);
  const erg = {
    minuten, schaltung: 'Emitterschaltung BC847B (Näherung), 4×', plan: {n: st.plan.n, zustaende: st.plan.S, nichtlinear: st.plan.Mv},
    aenderungen, berichte: berichte.length,
    lastMittel: lasten.reduce((a, b) => a + b, 0) / lasten.length, lastMax: Math.max(...lasten),
    laengsterBlockMs: Math.max(...berichte.map(b => b.spitzeMs)), budgetMs: berichte[0]?.budgetMs,
    bloeckeUeberBudget: berichte.reduce((a, b) => a + b.ueberBudget, 0), bloecke: berichte.reduce((a, b) => a + b.bloecke, 0),
    ohneKonvergenz: berichte.reduce((a, b) => a + b.nk, 0), verworfeneScopeWerte: berichte[berichte.length - 1]?.verworfen,
    uhrAbweichungS: maxAusstieg, basisLatenzMs: monitor.ctx.baseLatency * 1000, ausgabeLatenzMs: (monitor.ctx.outputLatency || 0) * 1000,
    uhr: live.uhr, browser: navigator.userAgent
  };
  aus.textContent = JSON.stringify(erg, null, 1);
  window.dauerErgebnis = erg;
  return erg;
}

$('#p-start').addEventListener('click', () => alles());
$('#p-json').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(window.pruefErgebnis, null, 1)], {type: 'application/json'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audiolabor-pruefstand.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});
$('#p-dauer').addEventListener('click', () => dauertest(Number($('#p-dauer-min').value) || 3));

window.pruefstand = {alles, dauertest, stufe1, abnahmeRender, pegelUebergaenge, liveGegenSpice, budget, audioThread, ergebnisse, spice, monitor, live, gruppe, zeile};
