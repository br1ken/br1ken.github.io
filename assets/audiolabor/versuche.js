/* Audiolabor: die Versuchssammlung. Jeder Versuch ist ein gewöhnliches Projekt, das danach frei weiterverändert werden kann.
   Die Zahlen in den Texten sind mit dem Prüfstand nachgerechnet. Sie sind keine Hardwaremessungen. */

import { leeresProjekt, neuesTeil } from './aufbau.js?v=2';
import { gruppenAusPlan, setzeNetze } from './umbau.js';

/* Für die Schritte: Hat der Wert sein Ziel erreicht? Sind die Pins verbunden? Gibt es das Teil noch? */
const wert = (p, id, key) => p.teile.find(t => t.id === id)?.werte[key];
const nahe = (ist, soll) => ist !== undefined && Math.abs(ist - soll) <= 0.02 * Math.abs(soll);
const verbunden = (p, a, b) => gruppenAusPlan(p).find(g => g.has(a))?.has(b) ?? false;
const fehlt = (p, id) => !p.teile.some(t => t.id === id);

/* Knappe Schreibweise für die Aufbauten */
function plan(titel, analyse = {}) {
  const p = leeresProjekt(titel);
  Object.assign(p.analyse, analyse);
  let d = 0;
  const api = {
    t(typ, id, x, y, werte = {}, rot = 0, spiegel = false) { p.teile.push(neuesTeil(typ, id, x, y, werte, rot, spiegel)); return api; },
    d(...punkte) { p.draehte.push({id: `D${++d}`, punkte}); return api; },
    /* Netze als Pin-Listen: Die Drähte legt derselbe Router wie beim Stecken von Hand. */
    netze(...gruppen) { setzeNetze(p, gruppen.map(g => new Set(g))); return api; },
    fertig() { return p; }
  };
  return api;
}

export const VERSUCHE = [
  {
    id: 'teiler', gruppe: 'Grundlagen', titel: 'Spannungsteiler',
    kurz: '10 V und zweimal 10 kΩ. Mit dem Schalter kommt eine Last dazu.',
    text: 'Ohne Last liegt in der Mitte genau die halbe Spannung. Schließe S1: Die Last liegt parallel zum unteren Widerstand, und die Mitte sinkt. Schau unter „Arbeitspunkt“ nach. Der Hörpunkt bleibt hier still, weil nur Gleichspannung anliegt.',
    schritte: [
      {text: 'Wähle S1 aus und schließe ihn.', ziel: ({p}) => wert(p, 'S1', 'zu') === true, warum: 'R2 und R3 liegen jetzt parallel, zusammen 5 kΩ. Die Mitte sinkt auf 10 V · 5 / 15 = 3,33 V. Prüf es unter „Arbeitspunkt“.'},
      {text: 'Ändere R3 auf 1 kΩ.', ziel: ({p}) => nahe(wert(p, 'R3', 'R'), 1000), warum: 'R2 ∥ R3 sind nur noch 909 Ω. Der Teiler bricht auf 0,83 V ein: Eine Last muss groß gegen den Teiler sein, sonst bestimmt sie die Spannung.'}
    ],
    aufgaben: ['Berechne die Mittenspannung mit geschlossenem S1 selbst und vergleiche.'],
    lex: ['spannungsteiler', 'reihe-parallel'],
    tab: 'arbeitspunkt',
    bau: () => plan('Spannungsteiler')
      .t('v', 'V1', 0, 0, {v: 10})
      .t('r', 'R1', 100, -60, {R: 10000})
      .t('r', 'R2', 200, 0, {R: 10000}, 90)
      .t('schalter', 'S1', 300, -60, {zu: false})
      .t('r', 'R3', 380, 0, {R: 10000}, 90)
      .t('gnd', 'GND1', 200, 80)
      .t('label', 'N1', 200, -80, {name: 'mitte'})
      .t('sonde', 'CH1', 200, -60)
      .d([0, -40], [0, -60], [60, -60])
      .d([140, -60], [260, -60])
      .d([200, -80], [200, -40])
      .d([340, -60], [380, -60], [380, -40])
      .d([0, 40], [0, 80], [380, 80], [380, 40])
      .d([200, 40], [200, 80])
      .fertig()
  },
  {
    id: 'led', gruppe: 'Grundlagen', titel: 'LED mit Vorwiderstand',
    kurz: '9 V, 470 Ω und eine rote LED. Der Widerstand bestimmt den Strom.',
    text: 'Die LED hält ihre Flussspannung fast unabhängig vom Strom. Der Rest der Versorgung fällt am Widerstand ab, und das legt den Strom fest: I = (U − U_LED) / R. Wähle R1 oder D1 aus: Die Karte zeigt Spannung, Strom und Leistung.',
    schritte: [
      {text: 'Stelle R1 auf 1 kΩ.', ziel: ({p}) => nahe(wert(p, 'R1', 'R'), 1000), warum: 'Der Strom sinkt ungefähr auf die Hälfte, die Flussspannung der LED kaum: Sie bleibt nahe 1,8 V, weil der Diodenstrom exponentiell von der Spannung abhängt.'},
      {text: 'Stelle V1 auf 5 V.', ziel: ({p}) => nahe(wert(p, 'V1', 'v'), 5), warum: 'Am Widerstand liegen nur noch rund 3,2 V, bei 1 kΩ also 3,2 mA. Für 10 mA müsstest du ihn auf 320 Ω verkleinern. Rechne es nach.'}
    ],
    aufgaben: ['Welche Leistung wird im Widerstand frei? P = U · I, die Karte von R1 zeigt den Wert.'],
    lex: ['ohmsches-gesetz', 'diode', 'leistung'],
    tab: 'arbeitspunkt',
    bau: () => plan('LED mit Vorwiderstand')
      .t('v', 'V1', 0, 0, {v: 9})
      .t('r', 'R1', 120, -60, {R: 470})
      .t('led', 'D1', 240, 0, {}, 90)
      .t('gnd', 'GND1', 120, 80)
      .t('sonde', 'CH1', 200, -60)
      .netze(['V1.+', 'R1.1'], ['R1.2', 'D1.A', 'CH1.1'], ['D1.K', 'V1.-', 'GND1.1'])
      .fertig()
  },
  {
    id: 'tiefpass', gruppe: 'Grundlagen', titel: 'RC-Tiefpass',
    kurz: '10 kΩ und 10 nF: Grenzfrequenz 1591,55 Hz. Das Rechteck wird hörbar dumpfer.',
    text: 'Der Generator speist den Widerstand, dahinter liegt der Kondensator gegen Masse, am Verbindungspunkt wird abgehört. Unter „Frequenzgang“ steht die Grenzfrequenz. Die blasse Kurve ist immer der vorherige Lauf.',
    schritte: [
      {text: 'Stelle R1 auf 20 kΩ.', ziel: ({p}) => nahe(wert(p, 'R1', 'R'), 20000), warum: 'Die Grenzfrequenz fc = 1 / (2π·R·C) halbiert sich auf 795,8 Hz, und der Klang wird dumpfer.'},
      {text: 'Stecke den Kondensator um: Tipp den Draht zu C1 an und zieh seinen Griff vom Ausgang an den Eingang vor R1.', ziel: ({p}) => verbunden(p, 'C1.1', 'G1.+') || verbunden(p, 'C1.2', 'G1.+'), warum: 'C1 liegt jetzt direkt am Generator. Der Ausgang wird nicht mehr gefiltert, und die Netlist sagt das auch.'}
    ],
    aufgaben: ['Vertausche R1 und C1: Aus dem Tiefpass wird ein Hochpass.'],
    lex: ['tiefpass', 'kapazitaet', 'zeitkonstante', 'bode-diagramm'],
    tab: 'frequenzgang',
    bau: () => plan('RC-Tiefpass', {dauer: 0.5})
      .t('gen', 'G1', 0, 0, {form: 'rechteck', f: 220, amp: 5})
      .t('r', 'R1', 100, -60, {R: 10000})
      .t('c', 'C1', 200, 0, {C: 10e-9}, 90)
      .t('gnd', 'GND1', 100, 80)
      .t('sonde', 'CH1', 200, -60)
      .t('sonde', 'CH2', 20, -60)
      .t('hoer', 'H1', 280, -60)
      .d([0, -40], [0, -60], [60, -60])
      .d([140, -60], [280, -60])
      .d([200, -60], [200, -40])
      .d([0, 40], [0, 80], [200, 80], [200, 40])
      .fertig()
  },
  {
    id: 'hochpass', gruppe: 'Grundlagen', titel: 'RC-Hochpass',
    kurz: 'Dieselben Bauteile in anderer Reihenfolge: Bass weg, Knacken bleibt.',
    text: 'Der Kondensator sitzt jetzt in Reihe. Das Rechteck wird zu kurzen Spitzen an den Flanken. Die Grenzfrequenz bleibt 1591,55 Hz, aber der Durchlass liegt oben.',
    schritte: [
      {text: 'Halbiere den Kondensator auf 5 nF.', ziel: ({p}) => nahe(wert(p, 'C1', 'C'), 5e-9), warum: 'Die Grenzfrequenz verdoppelt sich auf 3183 Hz. Es kommt noch weniger Bass durch.'}
    ],
    aufgaben: ['Vergleiche die Phase im Frequenzgang mit dem Tiefpass.'],
    lex: ['hochpass', 'zeitkonstante'],
    tab: 'frequenzgang',
    bau: () => plan('RC-Hochpass', {dauer: 0.5})
      .t('gen', 'G1', 0, 0, {form: 'rechteck', f: 220, amp: 5})
      .t('c', 'C1', 100, -60, {C: 10e-9})
      .t('r', 'R1', 200, 0, {R: 10000}, 90)
      .t('gnd', 'GND1', 100, 80)
      .t('sonde', 'CH1', 200, -60)
      .t('hoer', 'H1', 280, -60)
      .d([0, -40], [0, -60], [60, -60])
      .d([140, -60], [280, -60])
      .d([200, -60], [200, -40])
      .d([0, 40], [0, 80], [200, 80], [200, 40])
      .fertig()
  },
  {
    id: 'schwingkreis', gruppe: 'Grundlagen', titel: 'Reihenschwingkreis',
    kurz: 'Gespeicherte Energie klingt aus. Resonanz bei rund 5 kHz.',
    text: 'Ein Rechteck stößt den Schwingkreis an. Nach jeder Flanke pendelt die Energie zwischen Spule und Kondensator und klingt über R1 ab. Trenne im Live-Betrieb den Draht vom Generator: Der Kreis klingt modellgerecht aus, statt sofort zu verstummen.',
    schritte: [
      {text: 'Erhöhe R1 auf 470 Ω.', ziel: ({p}) => nahe(wert(p, 'R1', 'R'), 470), warum: 'Die Güte Q = √(L/C) / R fällt von 6,7 auf 0,67. Das Ausschwingen ist fast weg, die Spitze im Frequenzgang auch.'},
      {text: 'Ändere C1 auf 400 nF.', ziel: ({p}) => nahe(wert(p, 'C1', 'C'), 400e-9), warum: 'f0 = 1 / (2π·√(L·C)): Vierfaches C bedeutet halbe Resonanzfrequenz, also rund 2,5 kHz.'}
    ],
    aufgaben: [],
    lex: ['resonanz', 'induktivitaet', 'kapazitaet'],
    tab: 'frequenzgang',
    bau: () => plan('Reihenschwingkreis', {dauer: 0.5})
      .t('gen', 'G1', 0, 0, {form: 'rechteck', f: 110, amp: 3})
      .t('r', 'R1', 100, -60, {R: 47})
      .t('l', 'L1', 220, -60, {L: 10e-3})
      .t('c', 'C1', 320, 0, {C: 100e-9}, 90)
      .t('gnd', 'GND1', 160, 80)
      .t('sonde', 'CH1', 320, -60)
      .t('hoer', 'H1', 380, -60)
      .d([0, -40], [0, -60], [60, -60])
      .d([140, -60], [180, -60])
      .d([260, -60], [380, -60])
      .d([320, -60], [320, -40])
      .d([0, 40], [0, 80], [320, 80], [320, 40])
      .fertig()
  },
  {
    id: 'clipper', gruppe: 'Dioden', titel: 'Diodenbegrenzer',
    kurz: 'Zwei 1N4148 gegen Masse kappen das Signal. Dreh eine um und höre die Veränderung.',
    text: 'Bei 5 V Scheitelwert leiten die Dioden und begrenzen auf etwa ±0,6 V. Beide Halbwellen sind gleich, also entstehen vor allem ungerade Oberwellen. Wähle D2 aus, entferne sie oder drehe sie mit R zweimal: Dann ändert sich die Begrenzungsrichtung und der Klang.',
    schritte: [
      {text: 'Wähle D2 aus und entferne sie mit Entf.', ziel: ({p}) => fehlt(p, 'D2'), warum: 'Nur noch die positive Halbwelle wird begrenzt. Unsymmetrie bringt gerade Oberwellen, das hörst du und siehst es im Spektrum.'},
      {text: 'Drehe D1 um 180°: Wähle sie aus und drücke zweimal R.', ziel: ({p}) => !fehlt(p, 'D1') && verbunden(p, 'D1.A', 'GND1.1'), warum: 'Die Begrenzung wechselt die Richtung, jetzt wird die negative Halbwelle gekappt.'},
      {text: 'Stelle D1 auf BAT85.', ziel: ({p}) => wert(p, 'D1', 'modell') === 'BAT85', warum: 'Die Schottky-Diode leitet schon bei rund 0,3 V. Die Begrenzung wird enger.'}
    ],
    aufgaben: [],
    lex: ['diode', 'verzerrung', 'obertoene'],
    tab: 'oszilloskop',
    bau: () => plan('Diodenbegrenzer', {dauer: 0.5})
      .t('gen', 'G1', 0, 0, {form: 'sinus', f: 220, amp: 5})
      .t('r', 'R1', 100, -60, {R: 10000})
      .t('d', 'D1', 200, 0, {modell: '1N4148'}, 90)
      .t('d', 'D2', 280, 0, {modell: '1N4148'}, 270)
      .t('gnd', 'GND1', 140, 80)
      .t('sonde', 'CH1', 200, -60)
      .t('sonde', 'CH2', 20, -60)
      .t('hoer', 'H1', 360, -60)
      .d([0, -40], [0, -60], [60, -60])
      .d([140, -60], [360, -60])
      .d([200, -60], [200, -40])
      .d([280, -60], [280, -40])
      .d([0, 40], [0, 80], [280, 80], [280, 40])
      .d([200, 40], [200, 80])
      .fertig()
  },
  {
    id: 'gleichrichter', gruppe: 'Dioden', titel: 'Einweggleichrichter mit Elko',
    kurz: 'Aus 50 Hz Wechselspannung wird fast glatte Gleichspannung, mit Brummen.',
    text: 'Die Diode lädt den Elko in jeder positiven Halbwelle fast auf den Scheitelwert. Dazwischen entlädt ihn die Last, das ist die Brummspannung: ΔU ≈ I / (f · C). Du hörst sie als 50-Hz-Brummen, wenn du die DC-Sperre unter „Einstellungen“ einschaltest.',
    schritte: [
      {text: 'Stelle C1 auf 470 µF.', ziel: ({p}) => nahe(wert(p, 'C1', 'C'), 470e-6), warum: 'Fünfmal so viel Kapazität, also rund ein Fünftel der Brummspannung. Die Zeile „Wirkung“ zeigt den neuen Hub.'},
      {text: 'Stelle R1 auf 100 Ω.', ziel: ({p}) => nahe(wert(p, 'R1', 'R'), 100), warum: 'Zehnmal so viel Laststrom: Der Elko entlädt sich schneller, und das Brummen wächst wieder.'}
    ],
    aufgaben: ['Rechne die Brummspannung mit ΔU ≈ I / (f · C) nach und vergleiche sie mit CH1.'],
    lex: ['diode', 'kapazitaet', 'mittelwert'],
    tab: 'oszilloskop',
    bau: () => plan('Einweggleichrichter', {dauer: 0.4})
      .t('gen', 'G1', 0, 0, {form: 'sinus', f: 50, amp: 10})
      .t('d', 'D1', 120, -60, {modell: '1N4148'})
      .t('elko', 'C1', 240, 0, {C: 100e-6}, 90)
      .t('r', 'R1', 340, 0, {R: 1000}, 90)
      .t('gnd', 'GND1', 160, 80)
      .t('sonde', 'CH1', 300, -60)
      .t('sonde', 'CH2', 40, -60)
      .t('hoer', 'H1', 400, -60)
      .netze(['G1.+', 'D1.A', 'CH2.1'], ['D1.K', 'C1.+', 'R1.1', 'CH1.1', 'H1.1'], ['G1.-', 'C1.-', 'R1.2', 'GND1.1'])
      .fertig()
  },
  {
    id: 'schalter', gruppe: 'Transistoren', titel: 'Transistor als Schalter',
    kurz: 'Kleiner Basisstrom, großer Laststrom. Sättigung oder gesperrt, dazwischen nichts.',
    text: 'Ein Rechteck schaltet die Basis. Liegt sie hoch, fließt über R2 genug Basisstrom, und der Transistor geht in die Sättigung: Am Kollektor bleiben nur rund 0,1 V, die LED leuchtet. Liegt die Basis tief, sperrt er, und es fließt fast nichts mehr: Die Kollektorspannung steigt auf rund 8 V, den Rest hält die LED.',
    schritte: [
      {text: 'Stelle R2 auf 1 MΩ.', ziel: ({p}) => nahe(wert(p, 'R2', 'R'), 1e6), warum: 'Der Basisstrom reicht nicht mehr für die Sättigung. Der Transistor arbeitet im aktiven Bereich, und die Kollektorspannung sinkt nur noch ein Stück. Als Schalter taugt das nicht: Er wird dabei warm.'},
      {text: 'Wähle T1 aus und schau auf die Karte.', ziel: ({p, gewaehlt}) => gewaehlt === 'T1', warum: 'Die Karte zeigt Ic, Ib und die Betriebsart. Vergleiche β mit Ic / Ib bei kleinem R2: In der Sättigung ist das Verhältnis viel kleiner als β.'}
    ],
    aufgaben: ['Wie groß muss R2 mindestens sein, damit bei 5 V Eingang noch sicher Sättigung herrscht? Rechne mit β = 100.'],
    lex: ['transistor', 'arbeitspunkt'],
    tab: 'oszilloskop',
    bau: () => plan('Transistor als Schalter', {dauer: 0.2})
      .t('rail', 'V1', 240, -180, {u: 9})
      .t('r', 'R1', 240, -140, {R: 470}, 90)
      .t('led', 'D1', 240, -60, {}, 90)
      .t('npn', 'T1', 220, 20, {modell: 'BC847B'})
      .t('r', 'R2', 120, 20, {R: 4700})
      .t('gen', 'G1', 20, 60, {form: 'rechteck', f: 220, amp: 2.5, off: 2.5})
      .t('gnd', 'GND1', 140, 120)
      .t('sonde', 'CH1', 260, -20)
      .t('sonde', 'CH2', 60, 20)
      .t('hoer', 'H1', 300, -20)
      .netze(['V1.1', 'R1.1'], ['R1.2', 'D1.A'], ['D1.K', 'T1.C', 'CH1.1', 'H1.1'], ['G1.+', 'R2.1', 'CH2.1'], ['R2.2', 'T1.B'], ['G1.-', 'T1.E', 'GND1.1'])
      .fertig()
  },
  {
    id: 'emitter', gruppe: 'Transistoren', titel: 'Emitterschaltung',
    kurz: 'NPN-Verstärker mit Poti am Basisteiler. Der Arbeitspunkt verschiebt Ruhestrom, Verstärkung und Verzerrung.',
    text: 'Das Poti P1 stellt die Basisspannung ein. Unter „Arbeitspunkt“ stehen Ruhestrom und Betriebsart des Transistors. Dreh das Poti: Mit dem Ruhestrom ändern sich Verstärkung und Aussteuerung. Am Anschlag verzerrt die Stufe hörbar einseitig.',
    schritte: [
      {text: 'Dreh P1, bis die Kollektorspannung bei 6 V liegt, der halben Versorgung.', mitSpannung: true, ziel: ({spannung}) => { const uc = spannung('T1.C'); return uc !== undefined && Math.abs(uc - 6) < 0.5; }, warum: 'So kann der Ausgang nach oben und unten gleich weit ausschlagen. Das ist die übliche Wahl des Arbeitspunkts.'},
      {text: 'Erhöhe die Generatoramplitude auf 200 mV.', ziel: ({p}) => (wert(p, 'G1', 'amp') ?? 0) >= 0.19, warum: 'Das Signal stößt an: Oben begrenzt die Versorgung, unten die Sättigung des Transistors. Hör es dir an.'},
      {text: 'Entferne C2.', ziel: ({p}) => fehlt(p, 'C2'), warum: 'Ohne den Kondensator koppelt R4 auch für das Signal gegen. Die Verstärkung fällt von über 100 auf rund R3 / R4 ≈ 4,7.'}
    ],
    aufgaben: [],
    lex: ['transistor', 'arbeitspunkt', 'verzerrung'],
    tab: 'arbeitspunkt',
    bau: () => plan('Emitterschaltung', {dauer: 0.5})
      .t('rail', 'V1', 180, -200, {u: 12})
      .t('r', 'R1', 120, -140, {R: 120000}, 90)
      .t('pot', 'P1', 120, -60, {R: 22000, pos: 50}, 90)
      .t('r', 'R2', 120, 20, {R: 18000}, 90)
      .t('r', 'R3', 240, -100, {R: 4700}, 90)
      .t('npn', 'T1', 220, 0, {modell: 'BC847B'})
      .t('r', 'R4', 240, 100, {R: 1000}, 90)
      .t('c', 'C2', 300, 100, {C: 100e-6}, 90)
      .t('c', 'C1', 160, 60, {C: 1e-6}, 90)
      .t('gen', 'G1', 160, 140, {form: 'sinus', f: 220, amp: 0.02})
      .t('c', 'C3', 340, -60, {C: 1e-6})
      .t('r', 'R5', 440, 60, {R: 100000}, 90)
      .t('gnd', 'GND1', 240, 180)
      .t('sonde', 'CH1', 280, -60)
      .t('sonde', 'CH2', 420, -60)
      .t('hoer', 'H1', 500, -60)
      .d([180, -200], [180, -180])
      .d([120, -180], [240, -180], [240, -140])
      .d([160, -60], [160, 20])
      .d([160, 0], [180, 0])
      .d([240, -60], [240, -40])
      .d([240, -60], [300, -60])
      .d([240, 40], [240, 60])
      .d([240, 60], [300, 60])
      .d([380, -60], [500, -60])
      .d([440, -60], [440, 20])
      .d([120, 60], [120, 180], [440, 180], [440, 100])
      .d([240, 140], [240, 180])
      .d([300, 140], [300, 180])
      .fertig()
  },
  {
    id: 'inverter', gruppe: 'Operationsverstärker', titel: 'Invertierender Verstärker',
    kurz: 'Verstärkung über das Rückkopplungspoti. An der Versorgung ist Schluss.',
    text: 'Das Modell rechnet Bandbreite, Slew Rate und den Ausgangshub. Der Hub hängt an den Versorgungspins: Ändere V1 oder V2, und die Begrenzung wandert mit. Das ist kein Regler, sondern die Schaltung.',
    schritte: [
      {text: 'Stelle P1 auf 100 %.', ziel: ({p}) => (wert(p, 'P1', 'pos') ?? 0) >= 99, warum: 'Die Verstärkung ist nun −10. Bei 0,5 V Eingang wären das 5 V am Ausgang. Der Hub reicht noch, das Signal bleibt sauber.'},
      {text: 'Klemme die negative Versorgung an Masse: Zieh den Draht von V− um, oder setze V2 auf 0 V.', ziel: ({p}) => verbunden(p, 'U1.V-', 'GND1.1') || wert(p, 'V2', 'u') === 0, warum: 'Der Ausgang kommt nicht mehr unter 0 V. Eine Halbwelle fehlt. Das ist kein Regler, sondern die Schaltung.'},
      {text: 'Wähle U1 aus und stelle das Modell auf „OPV idealisiert“.', ziel: ({p}) => wert(p, 'U1', 'modell') === 'IDEAL', warum: 'Vergleiche die Kurven: Slew Rate und Ausgangshub des TL07x fehlen jetzt.'}
    ],
    aufgaben: [],
    lex: ['opv', 'verzerrung'],
    tab: 'oszilloskop',
    bau: () => plan('Invertierender Verstärker', {dauer: 0.5})
      .t('gen', 'G1', -60, 60, {form: 'sinus', f: 220, amp: 0.5})
      .t('r', 'R1', 40, 20, {R: 10000})
      .t('pot', 'P1', 180, 120, {R: 100000, pos: 47})
      .t('opv', 'U1', 180, 0, {modell: 'TL07X'})
      .t('rail', 'V1', 180, -40, {u: 12})
      .t('rail', 'V2', 180, 40, {u: -12})
      .t('gnd', 'GND1', -60, 120)
      .t('gnd', 'GND2', 100, -20)
      .t('sonde', 'CH1', 260, 0)
      .t('sonde', 'CH2', -20, 20)
      .t('hoer', 'H1', 320, 0)
      .d([-60, 20], [0, 20])
      .d([80, 20], [120, 20])
      .d([120, -20], [100, -20])
      .d([120, 20], [120, 120], [140, 120])
      .d([220, 120], [260, 120], [260, 0])
      .d([180, 80], [260, 80])
      .d([240, 0], [320, 0])
      .d([-60, 100], [-60, 120])
      .fertig()
  },
  {
    id: 'sallenkey', gruppe: 'Operationsverstärker', titel: 'Sallen-Key-Tiefpass',
    kurz: 'Aktiver Tiefpass zweiter Ordnung, Grenzfrequenz rund 1 kHz.',
    text: 'Zwei RC-Glieder und ein Spannungsfolger mit Mitkopplung über C1. Die Steigung im Frequenzgang beträgt 40 dB pro Dekade. Vergrößere die Rückkopplung mit anderen Kondensatorwerten: Dann entsteht eine Resonanzüberhöhung.',
    schritte: [
      {text: 'Verdopple C1 auf 40 nF.', ziel: ({p}) => nahe(wert(p, 'C1', 'C'), 40e-9), warum: 'Die Mitkopplung über C1 wird stärker. Die Güte steigt von 0,71 auf 1, und die Kurve bekommt vor der Grenzfrequenz eine Überhöhung.'}
    ],
    aufgaben: ['Lies die Steigung oberhalb der Grenzfrequenz ab: −40 dB je Dekade.'],
    lex: ['tiefpass', 'filter', 'opv', 'bode-diagramm'],
    tab: 'frequenzgang',
    bau: () => plan('Sallen-Key-Tiefpass', {dauer: 0.5})
      .t('gen', 'G1', -60, 60, {form: 'saege', f: 110, amp: 3})
      .t('r', 'R1', 40, 0, {R: 11000})
      .t('r', 'R2', 140, 0, {R: 11000})
      .t('c', 'C1', 100, -60, {C: 20e-9}, 90)
      .t('c', 'C2', 200, 60, {C: 10e-9}, 90)
      .t('opv', 'U1', 300, 20, {modell: 'TL07X'})
      .t('rail', 'V1', 300, -20, {u: 12})
      .t('rail', 'V2', 300, 60, {u: -12})
      .t('gnd', 'GND1', 100, 140)
      .t('sonde', 'CH1', 380, 20)
      .t('hoer', 'H1', 440, 20)
      .d([-60, 20], [-60, 0], [0, 0])
      .d([80, 0], [100, 0])
      .d([100, 0], [100, -20])
      .d([100, -100], [100, -120], [380, -120], [380, 20])
      .d([180, 0], [240, 0])
      .d([200, 0], [200, 20])
      .d([240, 40], [220, 40], [220, 120], [380, 120], [380, 20])
      .d([360, 20], [440, 20])
      .d([-60, 100], [-60, 140], [200, 140], [200, 100])
      .fertig()
  },
  {
    id: 'schmitt', gruppe: 'Oszillatoren', titel: 'Schmitt-Trigger-Oszillator',
    kurz: 'Ein CD40106, ein R, ein C. Kein Audiokabel, und er schwingt trotzdem.',
    text: 'Der Kondensator lädt über R1 auf, bis der Eingang die obere Schwelle erreicht. Der Ausgang kippt, der Kondensator entlädt sich bis zur unteren Schwelle, und so weiter. Die Frequenz folgt aus R, C und den Schwellen: rund 1,2 kHz. Start aus Anfangswerten: C1 leer, Ausgang hoch. Es gibt keinen versteckten Oszillator.',
    schritte: [
      {text: 'Verdopple R1 auf 200 kΩ.', ziel: ({p}) => nahe(wert(p, 'R1', 'R'), 200000), warum: 'Das Aufladen dauert doppelt so lang. Die Frequenz halbiert sich, das ist eine Oktave nach unten.'},
      {text: 'Stelle die Versorgung auf 5 V.', ziel: ({p}) => nahe(wert(p, 'V1', 'u'), 5), warum: 'Die Frequenz bleibt fast gleich, weil die Schwellen mit der Versorgung wandern. Nur die Amplitude schrumpft.'}
    ],
    aufgaben: ['Berechne die Frequenz: f = 1 / (R·C·ln(((1 − 0,385)/(1 − 0,59))·(0,59/0,385))).'],
    lex: ['oszillator', 'zeitkonstante'],
    tab: 'oszilloskop',
    bau: () => plan('Schmitt-Trigger-Oszillator', {dauer: 0.5, start: 'uic'})
      .t('rail', 'V1', 300, -100, {u: 12})
      .t('cd40106', 'U1', 180, 0)
      .t('r', 'R1', 180, -120, {R: 100000})
      .t('c', 'C1', 60, 60, {C: 10e-9}, 90)
      .t('gnd', 'GND1', 80, 100)
      .t('sonde', 'CH1', 60, 0)
      .t('sonde', 'CH2', 240, -160)
      .t('hoer', 'H1', 300, -160)
      .d([100, -60], [60, -60], [60, 20])
      .d([140, -120], [60, -120], [60, -60])
      .d([100, -40], [80, -40], [80, -160], [300, -160])
      .d([220, -120], [260, -120], [260, -160])
      .d([60, 100], [80, 100])
      .d([100, 60], [80, 60], [80, 100])
      .d([260, -60], [300, -60], [300, -100])
      .fertig()
  },
  {
    id: 'kippstufe', gruppe: 'Oszillatoren', titel: 'Rechteckgenerator mit OPV',
    kurz: 'Rückführung auf den Pluseingang: Der OPV kippt von Anschlag zu Anschlag, und C1 gibt den Takt.',
    text: 'Hier liegt die Rückführung am Pluseingang. Das ist Mitkopplung: Jede Abweichung wird größer, bis der Ausgang an einem Anschlag steht. R1 und R2 legen die Hälfte davon an den Pluseingang. Über R3 lädt sich C1 in Richtung Ausgang auf, bis der Minuseingang den Pluseingang überholt. Dann kippt der Ausgang, und alles läuft in die andere Richtung. Dazwischen gibt es zwar ein Gleichgewicht, aber es hält so wenig wie ein Bleistift auf der Spitze. CH2 zeigt die Spannung an C1.',
    schritte: [
      {text: 'Verdopple C1 auf 200 nF.', ziel: ({p}) => nahe(wert(p, 'C1', 'C'), 200e-9), warum: 'Doppelte Ladung für denselben Spannungshub: Die Frequenz halbiert sich von 455 Hz auf 228 Hz. Die Höhe des Rechtecks bleibt gleich, sie hängt nur an der Versorgung.'},
      {text: 'Stelle R2 auf 2,2 kΩ.', ziel: ({p}) => nahe(wert(p, 'R2', 'R'), 2200), warum: 'Am Pluseingang liegt jetzt nur noch rund ein Sechstel des Ausgangs. Die Schwellen rücken zusammen, C1 muss weniger weit laden, und die Frequenz steigt etwa auf das Dreifache.'}
    ],
    aufgaben: ['Berechne die Frequenz: f = 1 / (2·R3·C1·ln(1 + 2·R2/R1)). Stimmt sie mit dem Oszilloskop überein?'],
    lex: ['oszillator', 'opv', 'zeitkonstante'],
    tab: 'oszilloskop',
    bau: () => plan('Rechteckgenerator mit OPV', {dauer: 0.5, start: 'uic'})
      .t('opv', 'U1', 260, 0, {modell: 'TL07X'})
      .t('rail', 'V1', 260, -60, {u: 12})
      .t('rail', 'V2', 260, 60, {u: -12})
      .t('r', 'R1', 260, -140, {R: 10000})
      .t('r', 'R2', 120, 20, {R: 10000}, 90)
      .t('gnd', 'GND1', 120, 100)
      .t('r', 'R3', 260, 120, {R: 10000})
      .t('c', 'C1', 180, 180, {C: 100e-9, ic: 0.5}, 90)
      .t('gnd', 'GND2', 180, 260)
      .t('sonde', 'CH1', 360, 0)
      .t('sonde', 'CH2', 160, 40)
      .t('hoer', 'H1', 420, 0)
      .netze(['U1.V+', 'V1.1'], ['U1.V-', 'V2.1'], ['R1.1', 'R2.1', 'U1.+'], ['R2.2', 'GND1.1'], ['U1.-', 'R3.1', 'C1.1', 'CH2.1'], ['C1.2', 'GND2.1'], ['U1.A', 'R1.2', 'R3.2', 'CH1.1', 'H1.1'])
      .fertig()
  },
  {
    id: 'multivibrator', gruppe: 'Oszillatoren', titel: 'Astabiler Multivibrator',
    kurz: 'Zwei NPN, die sich gegenseitig umschalten. Die Startbedingung steht sichtbar an C1.',
    text: 'Der Arbeitspunkt dieser Schaltung ist symmetrisch und instabil. Damit das Anschwingen nicht vom Zufall abhängt, startet sie aus Anfangswerten, und C1 trägt 0,5 V. So ist der Anstoß ein sichtbarer Teil der Schaltung und kein versteckter Oszillator. Stelle unter „Start“ den Arbeitspunkt ein und vergleiche beide Rechenwege im Prüfstand: ngspice schwingt dann aus numerischen Restfehlern an, der Live-Löser kann in der exakten Symmetrie stehen bleiben.',
    schritte: [
      {text: 'Stelle C2 auf 100 nF.', ziel: ({p}) => nahe(wert(p, 'C2', 'C'), 100e-9), warum: 'Beide Halbperioden hängen je an einem R·C. Sind sie verschieden, wird der Puls asymmetrisch.'},
      {text: 'Stelle unter „Einstellungen“ den Start auf „Arbeitspunkt“.', ziel: ({p}) => p.analyse.start === 'op', warum: 'Jetzt fehlt der sichtbare Anstoß. ngspice schwingt nur noch aus numerischen Restfehlern an.'}
    ],
    aufgaben: ['Theorie: f ≈ 1 / (2·ln 2·R·C) für gleiche Teile.'],
    lex: ['oszillator', 'transistor'],
    tab: 'oszilloskop',
    bau: () => plan('Astabiler Multivibrator', {dauer: 0.3, start: 'uic'})
      .t('rail', 'V1', 200, -160, {u: 9})
      .t('r', 'R3', 20, -100, {R: 47000}, 90)
      .t('r', 'R1', 80, -100, {R: 1000}, 90)
      .t('r', 'R4', 340, -100, {R: 1000}, 90)
      .t('r', 'R2', 400, -100, {R: 47000}, 90)
      .t('c', 'C1', 200, -20, {C: 47e-9, ic: 0.5})
      .t('c', 'C2', 200, 40, {C: 47e-9})
      .t('npn', 'T1', 60, 100, {modell: 'NPN-GEN'})
      .t('npn', 'T2', 360, 100, {modell: 'NPN-GEN'}, 0, true)
      .t('gnd', 'GND1', 200, 160)
      .t('sonde', 'CH1', 80, 0)
      .t('sonde', 'CH2', 340, 0)
      .t('hoer', 'H1', 460, 0)
      .d([200, -160], [200, -140])
      .d([20, -140], [400, -140])
      .d([20, -60], [20, 100])
      .d([80, -60], [80, 60])
      .d([340, -60], [340, 60])
      .d([400, -60], [400, 100])
      .d([80, -20], [160, -20])
      .d([240, -20], [240, 20], [400, 20])
      .d([340, 40], [240, 40])
      .d([160, 40], [20, 40])
      .d([340, 0], [460, 0])
      .d([80, 140], [80, 160], [340, 160], [340, 140])
      .fertig()
  },
  {
    id: 'wien', gruppe: 'Oszillatoren', titel: 'Wien-Brücken-Oszillator',
    kurz: 'Ein Sinus mit gut 1 % Klirr, ganz ohne Quelle. Zwei Dioden halten die Amplitude.',
    text: 'Die Wien-Brücke aus R1, C1, R2 und C2 lässt genau bei f = 1 / (2π·R·C) ein Drittel der Spannung durch, ohne Phasenverschiebung. Verstärkt der OPV etwas mehr als dreifach, schwingt die Schaltung an. Die Dioden über R4 senken die Verstärkung bei großer Amplitude. So bleibt der Sinus stehen, statt an die Versorgung zu stoßen. Den Anstoß gibt die kleine Anfangsspannung an C2.',
    schritte: [
      {text: 'Stelle R1 und R2 auf 20 kΩ.', ziel: ({p}) => nahe(wert(p, 'R1', 'R'), 20000) && nahe(wert(p, 'R2', 'R'), 20000), warum: 'Doppeltes R, halbe Frequenz: von rund 1,59 kHz auf 790 Hz, eine Oktave nach unten. Die Amplitude bleibt gleich, sie hängt nur an der Diodenbegrenzung.'},
      {text: 'Stelle R4 auf 1 kΩ.', ziel: ({p}) => nahe(wert(p, 'R4', 'R'), 1000), warum: 'Jetzt ist die Verstärkung auch ohne Dioden nur noch 2,9: Die Schaltung schwingt nicht mehr an, und der Anstoß klingt einfach aus.'}
    ],
    aufgaben: ['Berechne die Verstärkung ohne Dioden: 1 + (R3 + R4) / Rg. Warum muss sie größer als 3 sein?'],
    lex: ['oszillator', 'opv', 'obertoene'],
    tab: 'spektrum',
    bau: () => plan('Wien-Brücken-Oszillator', {dauer: 0.5, start: 'uic'})
      .t('opv', 'U1', 260, 0, {modell: 'TL07X'})
      .t('rail', 'V1', 260, -60, {u: 12})
      .t('rail', 'V2', 260, 60, {u: -12})
      .t('c', 'C1', 200, -120, {C: 10e-9})
      .t('r', 'R1', 80, -120, {R: 10000})
      .t('r', 'R2', 60, 40, {R: 10000}, 90)
      .t('c', 'C2', 120, 40, {C: 10e-9, ic: 0.1}, 90)
      .t('gnd', 'GND1', 100, 120)
      .t('r', 'Rg', 180, 120, {R: 10000}, 90)
      .t('gnd', 'GND2', 180, 180)
      .t('r', 'R3', 280, 140, {R: 18000})
      .t('r', 'R4', 400, 140, {R: 2700})
      .t('d', 'D1', 400, 200, {modell: '1N4148'})
      .t('d', 'D2', 400, 260, {modell: '1N4148'}, 180)
      .t('sonde', 'CH1', 360, 0)
      .t('hoer', 'H1', 460, 0)
      .netze(['U1.V+', 'V1.1'], ['U1.V-', 'V2.1'], ['C1.1', 'R1.2'], ['R1.1', 'R2.1', 'C2.1', 'U1.+'], ['R2.2', 'C2.2', 'GND1.1'], ['U1.-', 'Rg.1', 'R3.1'], ['Rg.2', 'GND2.1'], ['R3.2', 'R4.1', 'D1.A', 'D2.K'], ['U1.A', 'C1.2', 'R4.2', 'D1.K', 'D2.A', 'CH1.1', 'H1.1'])
      .fertig()
  },
  {
    id: 'resonanz', gruppe: 'Klang', titel: 'Resonanzfilter',
    kurz: 'Ein Sallen-Key-Filter, dessen Güte am Poti hängt. Bis er selbst zu pfeifen beginnt.',
    text: 'Das Filter hat die Grenzfrequenz f = 1 / (2π·R·C) ≈ 1,6 kHz. Die Verstärkung K des OPV führt über C1 zurück und bestimmt die Güte: Q = 1 / (3 − K). P1 stellt K ein. Bei 50 % ist K = 2 und Q = 1. Bei zwei Dritteln wird K = 3: Die Resonanz wird unendlich scharf, und die Schaltung schwingt von selbst. Probier es unter „Live spielen“: Dort hörst du es, während du den Regler bewegst.',
    schritte: [
      {text: 'Stelle P1 auf 60 %.', ziel: ({p}) => Math.abs((wert(p, 'P1', 'pos') ?? 0) - 60) < 1.5, warum: 'K = 2,5, also Q = 2. Im Frequenzgang steht eine Spitze um 6 dB, und die Oberwellen des Sägezahns um 1,6 kHz treten hörbar hervor.'},
      {text: 'Stelle P1 auf 65 %.', ziel: ({p}) => Math.abs((wert(p, 'P1', 'pos') ?? 0) - 65) < 0.8, warum: 'K ≈ 2,86, also Q ≈ 7. Das Filter klingt nach jeder Flanke hörbar nach.'},
      {text: 'Stelle P1 auf 70 %.', ziel: ({p}) => (wert(p, 'P1', 'pos') ?? 0) >= 69, warum: 'K liegt über 3: Das ist jetzt ein Oszillator. Der Ton rastet bei rund 1,5 kHz ein und schlägt an den Hub des OPV. Der Eingang spielt kaum noch eine Rolle.'}
    ],
    aufgaben: [],
    lex: ['resonanz', 'filter', 'oszillator'],
    tab: 'frequenzgang',
    bau: () => plan('Resonanzfilter', {dauer: 0.5})
      .t('gen', 'G1', -60, 60, {form: 'saege', f: 110, amp: 1})
      .t('r', 'R1', 40, 0, {R: 10000})
      .t('r', 'R2', 160, 0, {R: 10000})
      .t('c', 'C1', 100, -80, {C: 10e-9}, 90)
      .t('c', 'C2', 220, 80, {C: 10e-9}, 90)
      .t('opv', 'U1', 340, 20, {modell: 'TL07X'})
      .t('rail', 'V1', 340, -40, {u: 12})
      .t('rail', 'V2', 340, 80, {u: -12})
      .t('pot', 'P1', 380, 160, {R: 100000, pos: 50}, 90)
      .t('gnd', 'GND1', 100, 180)
      .t('gnd', 'GND2', 380, 240)
      .t('sonde', 'CH1', 440, 20)
      .t('hoer', 'H1', 500, 20)
      .netze(['U1.V+', 'V1.1'], ['U1.V-', 'V2.1'], ['G1.+', 'R1.1'], ['R1.2', 'C1.2', 'R2.1'], ['R2.2', 'C2.1', 'U1.+'], ['U1.A', 'C1.1', 'P1.1', 'CH1.1', 'H1.1'], ['U1.-', 'P1.2'], ['P1.3', 'GND2.1'], ['G1.-', 'C2.2', 'GND1.1'])
      .fertig()
  },
  {
    id: 'vca', gruppe: 'Klang', titel: 'VCA mit Hüllkurve',
    kurz: 'Ein Differenzverstärker, dessen Strom eine Hüllkurve steuert. So bekommt ein Ton seinen Anschlag.',
    text: 'T1 und T2 bilden ein Differenzpaar. Seine Verstärkung ist proportional zum Strom, den T3 zieht. Der Pulsgeber lädt C1 über R1 und D1 schnell auf, danach entlädt R2 ihn langsam: Das ist die Hüllkurve aus Anstieg und Abfall. Mit ihr atmet die Verstärkung, und aus dem Dauerton wird ein Klang mit Anschlag. Der OPV bildet die Differenz der beiden Kollektoren. So hebt sich das Mitwandern ihrer Gleichspannung auf, das sonst als Knacken zu hören wäre. Es gibt hier keine Multiplikation im Rechner, nur Transistoren.',
    schritte: [
      {text: 'Stelle R2 auf 47 kΩ.', ziel: ({p}) => nahe(wert(p, 'R2', 'R'), 47000), warum: 'τ = R2 · C1 fällt von 100 ms auf 47 ms: Der Ton klingt kurz und knackig aus.'},
      {text: 'Stelle R1 auf 22 kΩ.', ziel: ({p}) => nahe(wert(p, 'R1', 'R'), 22000), warum: 'Jetzt lädt C1 langsam: Der Ton schwillt an, statt anzuschlagen. Weil der Puls nur 50 ms dauert, erreicht er auch nicht mehr die volle Lautstärke. R1 bestimmt den Anstieg.'},
      {text: 'Setze die Generatoramplitude auf 100 mV.', ziel: ({p}) => (wert(p, 'G1', 'amp') ?? 0) >= 0.09, warum: 'Das Differenzpaar ist nur für einige 10 mV linear. Darüber wird der Sinus zum Rechteck, und die Hüllkurve steuert nur noch den Hub.'}
    ],
    aufgaben: ['Warum sitzen Pulsgeber und C1 an der negativen Versorgung und nicht an der Masse?'],
    lex: ['huellkurve', 'transistor', 'tremolo'],
    tab: 'oszilloskop',
    bau: () => plan('VCA mit Hüllkurve', {dauer: 0.6})
      .t('rail', 'V1', 300, -240, {u: 12})
      .t('r', 'R3', 220, -180, {R: 10000}, 90)
      .t('r', 'R4', 380, -180, {R: 10000}, 90)
      .t('npn', 'T1', 200, -100, {modell: 'NPN-GEN'})
      .t('npn', 'T2', 400, -100, {modell: 'NPN-GEN'}, 0, true)
      .t('npn', 'T3', 280, 40, {modell: 'NPN-GEN'})
      .t('r', 'R5', 300, 120, {R: 3300}, 90)
      .t('rail', 'V2', 300, 180, {u: -12})
      .t('gen', 'G1', 80, -60, {form: 'sinus', f: 220, amp: 0.01})
      .t('gnd', 'GND1', 80, 20)
      .t('gnd', 'GND2', 440, -60)
      .t('gate', 'GT1', -80, 80, {modus: 'gate', ausloesung: 'takt', hoch: 5, per: 0.3, td: 0.02, gateDauer: 0.05})
      .t('r', 'R1', 0, 40, {R: 1000})
      .t('d', 'D1', 120, 40, {modell: '1N4148'})
      .t('c', 'C1', 180, 100, {C: 1e-6}, 90)
      .t('r', 'R2', 240, 120, {R: 100000}, 90)
      .t('rail', 'V3', -80, 180, {u: -12})
      .t('rail', 'V4', 180, 180, {u: -12})
      .t('r', 'R9', 500, -140, {R: 10000})
      .t('r', 'R10', 560, -60, {R: 10000}, 90)
      .t('r', 'R7', 500, 40, {R: 10000})
      .t('r', 'R8', 660, 40, {R: 10000})
      .t('opv', 'U1', 660, -100, {modell: 'TL07X'})
      .t('rail', 'V5', 660, -160, {u: 12})
      .t('rail', 'V6', 660, -40, {u: -12})
      .t('gnd', 'GND3', 560, 0)
      .t('sonde', 'CH1', 180, 20)
      .t('sonde', 'CH2', 740, -100)
      .t('hoer', 'H1', 780, -100)
      .netze(['V1.1', 'R3.1', 'R4.1'], ['R4.2', 'T2.C', 'R9.1'], ['R3.2', 'T1.C', 'R7.1'], ['T1.E', 'T2.E', 'T3.C'], ['T3.E', 'R5.1'], ['R5.2', 'V2.1'], ['G1.+', 'T1.B'], ['G1.-', 'GND1.1'], ['T2.B', 'GND2.1'], ['GT1.+', 'R1.1'], ['R1.2', 'D1.A'], ['D1.K', 'C1.1', 'R2.1', 'T3.B', 'CH1.1'], ['GT1.-', 'V3.1'], ['C1.2', 'V4.1', 'R2.2'], ['U1.V+', 'V5.1'], ['U1.V-', 'V6.1'], ['R9.2', 'R10.1', 'U1.+'], ['R10.2', 'GND3.1'], ['R7.2', 'R8.1', 'U1.-'], ['U1.A', 'R8.2', 'CH2.1', 'H1.1'])
      .fertig()
  },
  {
    id: 'trommel', gruppe: 'Klang', titel: 'Bridged-T-Trommel',
    kurz: 'Ein Filter, das fast schwingt. Ein kurzer Puls, und es klingt wie eine Bassdrum.',
    text: 'Das überbrückte T aus C1, C2, R1 und R2 sitzt in der Gegenkopplung des OPV. Die Schaltung ist ein sehr schmales Bandpassfilter bei f = 1 / (2π·C·√(R1·R2)) ≈ 60 Hz mit einer Güte Q = √(R2 / R1) / 2 ≈ 16. Ein Trigger von 1 ms und 0,5 V stößt sie an, und sie klingt als gedämpfter Sinus aus. Mehr Spannung übersteuert sie schnell: Am Resonanzpunkt verstärkt sie R2 / (2·R1) = 500-fach. So funktionieren die Trommeln klassischer Drumcomputer.',
    schritte: [
      {text: 'Stelle C1 und C2 auf 22 nF.', ziel: ({p}) => nahe(wert(p, 'C1', 'C'), 22e-9) && nahe(wert(p, 'C2', 'C'), 22e-9), warum: 'Viermal weniger C, also viermal höher: rund 230 Hz. Aus der Bassdrum wird eine Tom.'},
      {text: 'Stelle R2 auf 220 kΩ.', ziel: ({p}) => nahe(wert(p, 'R2', 'R'), 220000), warum: 'Die Güte sinkt auf rund 7, und auch die Frequenz steigt. Der Schlag wird kürzer und trockener.'}
    ],
    aufgaben: ['Miss unter „Oszilloskop“, nach wie vielen Perioden die Amplitude auf ein Drittel gefallen ist, und vergleiche mit Q.'],
    lex: ['resonanz', 'filter', 'huellkurve'],
    tab: 'oszilloskop',
    bau: () => plan('Bridged-T-Trommel', {dauer: 1})
      .t('gate', 'GT1', -60, 80, {modus: 'trigger', ausloesung: 'takt', hoch: 0.5, per: 0.5, td: 0.02, triggerDauer: 1e-3})
      .t('r', 'R1', 60, 40, {R: 1000})
      .t('c', 'C2', 200, 100, {C: 82e-9}, 90)
      .t('c', 'C1', 200, -40, {C: 82e-9}, 90)
      .t('r', 'R2', 340, 140, {R: 1e6})
      .t('opv', 'U1', 340, 0, {modell: 'TL07X'})
      .t('rail', 'V1', 340, -60, {u: 12})
      .t('rail', 'V2', 340, 60, {u: -12})
      .t('gnd', 'GND1', 240, -20)
      .t('gnd', 'GND2', -60, 160)
      .t('sonde', 'CH1', 440, 0)
      .t('hoer', 'H1', 500, 0)
      .netze(['U1.V+', 'V1.1'], ['U1.V-', 'V2.1'], ['U1.+', 'GND1.1'], ['GT1.+', 'R1.1'], ['R1.2', 'C1.2', 'C2.1'], ['C2.2', 'U1.-', 'R2.1'], ['U1.A', 'C1.1', 'R2.2', 'CH1.1', 'H1.1'], ['GT1.-', 'GND2.1'])
      .fertig()
  },
  {
    id: 'fuzz', gruppe: 'Klang', titel: 'Fuzz mit zwei Transistoren',
    kurz: 'Die klassische Fuzz-Schaltung. Zwei Stufen, viel Verstärkung und eine Gegenkopplung, die den Arbeitspunkt hält.',
    text: 'T1 und T2 verstärken zusammen so stark, dass schon ein kleines Signal an beide Grenzen stößt. Aus dem Sinus wird ein fast rechteckiger, obertonreicher Klang. R4 führt den Emitter von T2 auf die Basis von T1 zurück und stellt so den Arbeitspunkt ein. P1 und C2 bestimmen, wie viel von der Gegenkopplung für das Signal wirksam bleibt.',
    schritte: [
      {text: 'Stelle die Generatoramplitude auf 0,5 mV.', ziel: ({p}) => (wert(p, 'G1', 'amp') ?? 1) <= 0.00055, warum: 'Bei so kleinem Pegel bleibt die Stufe fast linear: gut 1 % Klirr bei einer Verstärkung von rund 1800. Schon 2 mV reichen für 30 % Klirr. Darum reagiert ein Fuzz so stark auf den Anschlag einer Gitarre.'},
      {text: 'Dreh P1 auf 90 %.', ziel: ({p}) => (wert(p, 'P1', 'pos') ?? 0) >= 88, warum: 'Der Schleifer liegt nahe an der Masse. C2 überbrückt kaum noch etwas, fast der ganze Emitterwiderstand koppelt gegen: Die Verstärkung fällt auf gut die Hälfte.'},
      {text: 'Dreh P1 auf 10 %.', ziel: ({p}) => (wert(p, 'P1', 'pos') ?? 100) <= 12, warum: 'Der Schleifer liegt nahe am Emitter. C2 hebt die Gegenkopplung für das Signal fast auf: Die Verstärkung verdreifacht sich, und schon 0,5 mV lassen die Stufe zerren.'}
    ],
    aufgaben: [],
    lex: ['verzerrung', 'transistor', 'obertoene'],
    tab: 'spektrum',
    bau: () => plan('Fuzz', {dauer: 0.5})
      .t('rail', 'V1', 240, -220, {u: 9})
      .t('r', 'R1', 160, -160, {R: 33000}, 90)
      .t('r', 'R2', 320, -180, {R: 8200}, 90)
      .t('r', 'R3', 320, -100, {R: 470}, 90)
      .t('npn', 'T1', 140, -80, {modell: 'BC847B'})
      .t('npn', 'T2', 300, 0, {modell: 'BC847B'})
      .t('pot', 'P1', 320, 80, {R: 1000, pos: 50}, 90)
      .t('elko', 'C2', 400, 120, {C: 22e-6}, 90)
      .t('r', 'R4', 220, 100, {R: 100000})
      .t('gen', 'G1', -80, 0, {form: 'sinus', f: 110, amp: 0.02})
      .t('c', 'C1', 40, -80, {C: 2.2e-6})
      .t('c', 'C3', 420, -140, {C: 10e-9})
      .t('r', 'R5', 500, -80, {R: 500000}, 90)
      .t('gnd', 'GND1', 160, 0)
      .t('gnd', 'GND2', 340, 200)
      .t('gnd', 'GND3', -80, 80)
      .t('gnd', 'GND4', 500, -20)
      .t('sonde', 'CH1', 300, -140)
      .t('sonde', 'CH2', 480, -140)
      .t('hoer', 'H1', 540, -140)
      .netze(['V1.1', 'R1.1', 'R2.1'], ['R1.2', 'T1.C', 'T2.B'], ['R2.2', 'R3.1', 'C3.1', 'CH1.1'], ['R3.2', 'T2.C'], ['T2.E', 'P1.1', 'R4.2'], ['P1.2', 'C2.+'], ['P1.3', 'C2.-', 'GND2.1'], ['R4.1', 'T1.B', 'C1.2'], ['G1.+', 'C1.1'], ['G1.-', 'GND3.1'], ['T1.E', 'GND1.1'], ['C3.2', 'R5.1', 'CH2.1', 'H1.1'], ['R5.2', 'GND4.1'])
      .fertig()
  }
];

export function versuchFinden(id) {
  return VERSUCHE.find(v => v.id === id) || null;
}
