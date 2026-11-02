/* Audiolabor: prüft die Versuchssammlung. Jeder Versuch muss sauber aufgebaut sein, rechnen und halten, was sein Text verspricht.
   Die Sollwerte kommen aus der Theorie, die Messwerte aus ngspice. */

import { VERSUCHE } from './versuche.js';
import { baueSchaltung } from './netz.js';
import { spiceText, spiceName } from './netlist.js';
import { spalte } from './spice.js';
import { BAUTEILE, pinOrt } from './bauteile.js';
import { RASTER } from './router.js';
import { pegelZeit, frequenzAusDurchgaengen, zuAudio, klirr, frequenzgang, verlaufArt } from './messung.js';
import { vergleiche, schwingVergleich } from './vergleich.js';
import { erzeugePlan } from './live-plan.js';
import { LiveKern, arbeitspunkt } from './live-kern.js';
import { fmtMess, komma } from './einheiten.js';

const FS = 48000;
const zahl = (x, n = 1) => komma(x.toFixed(n));

function baue(id, aenderung = {}) {
  const p = VERSUCHE.find(v => v.id === id).bau();
  for (const [wo, wert] of Object.entries(aenderung)) {
    const [t, key] = wo.split('.');
    p.teile.find(q => q.id === t).werte[key] = wert;
  }
  return p;
}

export async function pruefeVersuche({gruppe, zeile, spice}) {
  /* Zeitverlauf an einem Pin, ausgewertet ab dem Anteil von der Dauer */
  const lauf = async (p, pin, {von = 0.5, dauer = p.analyse.dauer, klirrMit = false} = {}) => {
    const ir = baueSchaltung(p);
    const netz = ir.netzInfo.pinNetz.get(pin);
    const r = await spice.rechne(spiceText(ir, {art: 'tran', dauer, tmax: 1 / 192000, start: p.analyse.start, speichern: [`v(${netz})`]}));
    const t = spalte(r.ergebnis, 'time').values, v = spalte(r.ergebnis, `v(${netz})`).values;
    const ab = dauer * von;
    const m = pegelZeit(t, v, ab);
    const f = frequenzAusDurchgaengen(t, v, ab);
    let thd = null;
    if (klirrMit && f) {
      const x = zuAudio(t, v, FS);
      thd = klirr(x.subarray(Math.floor(x.length * von)), FS, f.f, 6).thd;
    }
    return {...m, f: f?.f ?? null, thd, t, v, ms: r.rechenMs};
  };
  const opRechnen = async p => {
    const ir = baueSchaltung(p);
    const r = await spice.rechne(spiceText(ir, {art: 'op'}));
    const wert = n => (spalte(r.ergebnis, n) ?? spalte(r.ergebnis, `i(${n})`))?.values?.[0];
    return {ir, wert, an: pin => wert(`v(${ir.netzInfo.pinNetz.get(pin)})`)};
  };
  const gang = async (p, pin) => {
    const ir = baueSchaltung(p);
    const gen = ir.elemente.find(e => e.ac);
    const r = await spice.rechne(spiceText(ir, {art: 'ac', von: 1, bis: 1e5, jeDekade: 200, stim: gen.id}));
    const f = spalte(r.ergebnis, 'frequency'), v = spalte(r.ergebnis, `v(${ir.netzInfo.pinNetz.get(pin)})`);
    return frequenzgang(f.re, v.re, v.im);
  };

  gruppe(`Alle ${VERSUCHE.length} Versuche`, 'Aufbau, Rechnung und Schritte. Für jeden Versuch ein ngspice-Lauf.');
  for (const v of VERSUCHE) {
    const p = v.bau();
    const neben = p.teile.flatMap(t => BAUTEILE[t.typ].pins.map(pin => pinOrt(t, pin))).filter(o => o.x % RASTER || o.y % RASTER).length;
    const namen = p.teile.filter(t => t.typ === 'label' && /^n\d+$/.test(t.werte.name)).length;
    const ir = baueSchaltung(p);
    const r = await spice.rechne(spiceText(ir, {art: 'tran', dauer: p.analyse.dauer, tmax: 1 / 192000, start: p.analyse.start}));
    const spannung = () => undefined;
    const vorab = v.schritte.filter(q => q.ziel({p, spannung})).length;
    zeile(v.titel, 'alle Pins auf dem Raster, keine Ersatz-Netznamen, keine Fehler, kein Schritt schon erfüllt',
      `${p.teile.length} Teile, ${p.draehte.length} Drähte, ${v.schritte.length} Schritte, ${zahl(r.rechenMs / 1000, 2)} s für ${zahl(p.analyse.dauer, 1)} s`,
      !neben && !namen && !ir.fehler.length && !vorab && r.ergebnis.numPoints > 10);
  }

  /* Zwei unabhängige Löser: Stimmen sie im Arbeitspunkt überein, ist keiner von beiden in einer falschen Lösung hängen geblieben. */
  gruppe('Arbeitspunkt: ngspice gegen Live-Löser', 'Alle Netze jedes Versuchs. Beim BC847B rechnet Live nur den Haupttransistor, dort ist die Grenze weiter');
  for (const v of VERSUCHE) {
    const p = v.bau();
    if (p.analyse.start !== 'op') continue;
    /* Beide starten mit den Quellen auf ihrem Wert bei t = 0. So beginnt auch der Zeitverlauf. */
    const ir = baueSchaltung(p);
    const netze = [...ir.netzInfo.netze.keys()].filter(n => n !== '0');
    const r = await spice.rechne(spiceText(ir, {art: 'tran', dauer: 1e-6, tmax: 1e-6, start: 'op', speichern: netze.map(n => `v(${n})`)}));
    const irL = baueSchaltung(p, {ziel: 'live'});
    const kern = new LiveKern(erzeugePlan(irL, {h: 1e4, theta: 1, mess: netze.map(netz => ({id: netz, art: 'u', netz}))}), {maxIter: 200});
    arbeitspunkt(kern);
    let groesste = 0, wo = '';
    netze.forEach((n, i) => {
      const d = Math.abs(kern.p[i] - spalte(r.ergebnis, `v(${n})`).values[0]);
      if (d > groesste) { groesste = d; wo = n; }
    });
    const grenze = p.teile.some(t => t.werte?.modell === 'BC847B') ? 0.25 : 0.02;
    zeile(v.titel, `größte Abweichung unter ${fmtMess(grenze, 'V', 2)}`, `${fmtMess(groesste, 'V', 3)}${wo ? ` an ${wo}` : ''}, ${netze.length} Netze`, groesste < grenze);
  }

  gruppe('Versuche gegen die Theorie', 'Was die Texte versprechen, nachgerechnet');

  const led = await opRechnen(baue('led'));
  const uLed = led.an('D1.A');
  const dLed = led.ir.elemente.find(e => e.k === 'D');
  const iLed = led.wert(`@${spiceName('D', dLed.id).toLowerCase()}[id]`);
  zeile('LED: Strom aus dem Vorwiderstand', `(9 V − U_LED) / 470 Ω`, `${fmtMess(uLed, 'V', 4)}, ${fmtMess(iLed, 'A', 4)}`, Math.abs(iLed - (9 - uLed) / 470) < 1e-5 && uLed > 1.6 && uLed < 2.1);

  const gl = await lauf(baue('gleichrichter'), 'CH1.1');
  const gl5 = await lauf(baue('gleichrichter', {'C1.C': 470e-6}), 'CH1.1');
  const sollBrumm = gl.mittel / 1000 / (50 * 100e-6);
  zeile('Gleichrichter: Brummspannung', `etwa I / (f·C) = ${fmtMess(sollBrumm, 'V', 3)}; bei 470 µF rund ein Fünftel`, `${fmtMess(gl.spitze, 'V', 3)}; bei 470 µF ${fmtMess(gl5.spitze, 'V', 3)}`, Math.abs(gl.spitze - sollBrumm) < 0.25 * sollBrumm && gl5.spitze / gl.spitze < 0.3);

  const sw = await lauf(baue('schalter'), 'CH1.1', {von: 0.1});
  const sw1 = await lauf(baue('schalter', {'R2.R': 1e6}), 'CH1.1', {von: 0.1});
  zeile('Transistor als Schalter', 'gesättigt unter 0,2 V; mit 1 MΩ nicht mehr', `kleinster Wert ${fmtMess(sw.min, 'V', 3)}; mit 1 MΩ ${fmtMess(sw1.min, 'V', 3)}`, sw.min < 0.2 && sw1.min > 3);

  const fWien = 1 / (2 * Math.PI * 1e4 * 1e-8);
  const w = await lauf(baue('wien'), 'CH1.1', {von: 0.6, klirrMit: true});
  zeile('Wien-Brücke: Frequenz und Klirr', `${fmtMess(fWien, 'Hz', 5)}, Klirr unter 3 %, stehende Amplitude`, `${fmtMess(w.f, 'Hz', 5)}, ${zahl(w.thd * 100, 2)} %, Hub ${fmtMess(w.spitze, 'V', 3)}`, Math.abs(w.f - fWien) < 0.02 * fWien && w.thd < 0.03 && w.spitze > 5 && w.spitze < 21);
  const wAus = await lauf(baue('wien', {'R4.R': 1000}), 'CH1.1');
  zeile('… mit Verstärkung unter 3', 'schwingt nicht an', `Hub ${fmtMess(wAus.spitze, 'V', 3)}`, wAus.spitze < 0.05);

  for (const [pos, q] of [[60, 2], [65, 1 / (3 - 1 / 0.35)]]) {
    const g = await gang(baue('resonanz', {'P1.pos': pos}), 'CH1.1');
    let spitze = -Infinity;
    for (const d of g.db) if (d > spitze) spitze = d;
    const soll = 20 * Math.log10(q / Math.sqrt(1 - 1 / (4 * q * q)));
    zeile(`Resonanzfilter bei ${pos} %: Überhöhung`, `Q = ${zahl(q, 1)}, also ${zahl(soll, 1)} dB über dem Durchlass`, `${zahl(spitze - g.db[0], 1)} dB, Art ${verlaufArt(g)}`, Math.abs(spitze - g.db[0] - soll) < 1 && verlaufArt(g) === 'Tiefpass');
  }
  /* Der Ausgang muss am Arbeitspunkt auf K mal dem Eingang stehen. Das scharfe Knie der Klemmdioden hatte ngspice hier schon an die Klemme geführt. */
  const opR = await opRechnen(baue('resonanz', {'P1.pos': 60, 'G1.off': -1, 'G1.amp': 0}));
  zeile('Resonanzfilter: Arbeitspunkt bei −1 V am Eingang', 'K = 2,5, also −2,5 V am Ausgang', fmtMess(opR.an('CH1.1'), 'V', 4), Math.abs(opR.an('CH1.1') + 2.5) < 0.01);
  const rs = await lauf(baue('resonanz', {'P1.pos': 70}), 'CH1.1');
  zeile('Resonanzfilter bei 70 %', 'schwingt von selbst bei rund 1,5 kHz, bis an den Hub des OPV', `${fmtMess(rs.f, 'Hz', 4)}, Hub ${fmtMess(rs.spitze, 'V', 3)}`, Math.abs(rs.f - 1500) < 200 && rs.spitze > 15);

  const fKipp = f => 1 / (2 * 1e4 * f * Math.log(3));
  const ki = await lauf(baue('kippstufe'), 'CH1.1', {dauer: 0.1, von: 0.2});
  const ki2 = await lauf(baue('kippstufe', {'C1.C': 200e-9}), 'CH1.1', {dauer: 0.1, von: 0.2});
  zeile('Rechteckgenerator: Frequenz', `1 / (2·R·C·ln 3) = ${fmtMess(fKipp(100e-9), 'Hz', 4)}, mit 200 nF die Hälfte`, `${fmtMess(ki.f, 'Hz', 4)}, Hub ${fmtMess(ki.spitze, 'V', 3)}; mit 200 nF ${fmtMess(ki2.f, 'Hz', 4)}`, Math.abs(ki.f - fKipp(100e-9)) < 0.02 * fKipp(100e-9) && Math.abs(ki2.f - fKipp(200e-9)) < 0.02 * fKipp(200e-9) && ki.spitze > 18);

  const vc = await lauf(baue('vca'), 'H1.1', {von: 0.25});
  const hk = await lauf(baue('vca'), 'CH1.1', {von: 0.25});
  zeile('VCA: Hüllkurve steuert die Lautstärke', 'Gleichanteil fast 0: kein Knacken durch die Steuerspannung; Ton nur mit Hüllkurve', `Hub ${fmtMess(vc.spitze, 'V', 3)}, Mittelwert ${fmtMess(vc.mittel, 'V', 2)}; Hüllkurve ${fmtMess(hk.spitze, 'V', 3)}`, vc.spitze > 1 && vc.spitze < 20 && Math.abs(vc.mittel) < 0.05 && hk.spitze > 3);

  const fT = 1 / (2 * Math.PI * 82e-9 * Math.sqrt(1e3 * 1e6));
  const tr = await lauf(baue('trommel'), 'H1.1', {von: 0.04, dauer: 0.3});
  const ende = pegelZeit(tr.t, tr.v, 0.2);
  zeile('Bridged-T: gedämpfter Sinus', `um ${fmtMess(fT, 'Hz', 3)}, klingt aus`, `${fmtMess(tr.f, 'Hz', 3)}, Hub am Anfang ${fmtMess(tr.spitze, 'V', 3)}, nach 180 ms ${fmtMess(ende.spitze, 'V', 3)}`, Math.abs(tr.f - fT) < 0.08 * fT && tr.spitze > 5 && tr.spitze < 21 && ende.spitze < 0.35 * tr.spitze);

  const fz = await lauf(baue('fuzz', {'G1.amp': 0.0005}), 'H1.1', {dauer: 0.3, klirrMit: true});
  const fzL = await lauf(baue('fuzz'), 'H1.1', {dauer: 0.3, klirrMit: true});
  const fz9 = await lauf(baue('fuzz', {'G1.amp': 0.0005, 'P1.pos': 90}), 'H1.1', {dauer: 0.3});
  const fz1 = await lauf(baue('fuzz', {'G1.amp': 0.0005, 'P1.pos': 10}), 'H1.1', {dauer: 0.3});
  zeile('Fuzz: Pegel entscheidet', 'bei 0,5 mV fast linear, bei 20 mV über 50 % Klirr', `${zahl(fz.thd * 100, 1)} % bei Verstärkung ${zahl(fz.spitze / 2 / 0.0005, 0)}; ${zahl(fzL.thd * 100, 1)} %`, fz.thd < 0.05 && fzL.thd > 0.5);
  zeile('… P1 stellt die Gegenkopplung', '90 % weniger, 10 % mehr Verstärkung als 50 %', `Hub ${fmtMess(fz9.spitze, 'V', 3)} / ${fmtMess(fz.spitze, 'V', 3)} / ${fmtMess(fz1.spitze, 'V', 3)}`, fz9.spitze < fz.spitze && fz1.spitze > fz.spitze);

  gruppe('Neue Versuche: Live-Löser gegen ngspice', 'Wie oben: gleiche Schaltung, gleicher Start, 48 kHz × 4. Fehler bezogen auf Spitze-Spitze');
  const netzVon = (p, pin) => baueSchaltung(p).netzInfo.pinNetz.get(pin);
  const fall = async (titel, id, pin, opt, grenze, aenderung = {}) => {
    const p = baue(id, aenderung);
    const v = await vergleiche(spice, p, {netz: netzVon(p, pin), start: p.analyse.start, ...opt});
    zeile(titel, `Effektivfehler unter ${komma(grenze)} %`, `${zahl(v.rmsProzent, 3)} %, Newton ⌀ ${zahl(v.newtonMittel, 2)}, ohne Konvergenz ${v.nichtKonvergiert}`, v.rmsProzent < grenze && v.nichtKonvergiert === 0);
  };
  await fall('Gleichrichter', 'gleichrichter', 'CH1.1', {dauer: 0.06}, 1);
  await fall('Transistor als Schalter', 'schalter', 'CH1.1', {dauer: 0.02}, 3);
  await fall('Resonanzfilter, 60 %', 'resonanz', 'CH1.1', {dauer: 0.03}, 1, {'P1.pos': 60});
  await fall('VCA mit Hüllkurve', 'vca', 'H1.1', {dauer: 0.1}, 3);
  await fall('Bridged-T-Trommel', 'trommel', 'H1.1', {dauer: 0.1}, 3);
  await fall('Fuzz', 'fuzz', 'H1.1', {dauer: 0.05}, 5);
  const pW = baue('wien');
  const vW = await vergleiche(spice, pW, {netz: netzVon(pW, 'CH1.1'), start: 'uic', dauer: 0.15, ab: 0.1});
  const sW = schwingVergleich(vW, 0.1);
  zeile('Wien-Brücke: Frequenz und Hub', 'Abweichung unter 2 %', `${fmtMess(sW.fSpice, 'Hz', 5)} / ${fmtMess(sW.fLive, 'Hz', 5)}; Hub ${fmtMess(sW.ampSpice, 'V', 4)} / ${fmtMess(sW.ampLive, 'V', 4)}`, Math.abs(sW.fAbw) < 2 && Math.abs(sW.ampAbw) < 2);
  const pK = baue('kippstufe');
  const vK = await vergleiche(spice, pK, {netz: netzVon(pK, 'CH1.1'), start: 'uic', dauer: 0.05, ab: 0.01});
  const sK = schwingVergleich(vK, 0.01);
  zeile('Rechteckgenerator: Frequenz und Hub', 'Abweichung unter 1 %, ohne Nichtkonvergenz', `${fmtMess(sK.fSpice, 'Hz', 5)} / ${fmtMess(sK.fLive, 'Hz', 5)}; Hub ${fmtMess(sK.ampSpice, 'V', 4)} / ${fmtMess(sK.ampLive, 'V', 4)}; ohne Konvergenz ${vK.nichtKonvergiert}`, Math.abs(sK.fAbw) < 1 && Math.abs(sK.ampAbw) < 1 && vK.nichtKonvergiert === 0);
  const pR = baue('resonanz', {'P1.pos': 70});
  const vR = await vergleiche(spice, pR, {netz: netzVon(pR, 'CH1.1'), dauer: 0.1, ab: 0.05});
  const sR = schwingVergleich(vR, 0.05);
  zeile('Resonanzfilter, selbstschwingend', 'Abweichung unter 3 %', `${fmtMess(sR.fSpice, 'Hz', 5)} / ${fmtMess(sR.fLive, 'Hz', 5)}; Hub ${fmtMess(sR.ampSpice, 'V', 4)} / ${fmtMess(sR.ampLive, 'V', 4)}`, Math.abs(sR.fAbw) < 3 && Math.abs(sR.ampAbw) < 3);
}
