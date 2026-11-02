/* Audiolabor: Lernhilfen. Was ein Bauteil tut, welche Werte es gerade hat und was die letzte Änderung bewirkt hat.
   Alle Zahlen kommen aus ngspice und von den Sonden. Die festen Texte sagen nur, was physikalisch gemeint ist. */

import { fmtMess, komma } from './einheiten.js';
import { pegelZeit, frequenzAusDurchgaengen } from './messung.js';
import { spiceName } from './netlist.js';

/* Je Bauteil ein Satz, was es tut, und der passende Eintrag im Lexikon */
export const ERKLAERUNG = {
  r: {was: 'Begrenzt den Strom: U = R · I. In Reihe addieren sich die Widerstände, parallel die Leitwerte.', lex: 'widerstand'},
  pot: {was: 'Ein Widerstand mit Abgriff: Der Schleifer teilt ihn in zwei Teile. So wird aus ihm ein einstellbarer Spannungsteiler.', lex: 'spannungsteiler'},
  c: {was: 'Speichert Ladung: Q = C · U. Gleichstrom sperrt er, und je höher die Frequenz, desto besser leitet er: X = 1 / (2π·f·C).', lex: 'kapazitaet'},
  elko: {was: 'Großer Kondensator mit Polung. Plus muss höher liegen als Minus. Das Modell hier ist ein idealer Kondensator.', lex: 'kapazitaet'},
  l: {was: 'Speichert Energie im Magnetfeld. Gleichstrom lässt sie durch, schnelle Änderungen bremst sie: X = 2π·f·L.', lex: 'induktivitaet'},
  schalter: {was: 'Offen hochohmig, geschlossen fast ein Draht. Beides sind hier Widerstände, so wie die Daten es angeben.', lex: 'leerlauf-kurzschluss'},
  umschalter: {was: 'Verbindet den Mittelanschluss mit einer von zwei Seiten.', lex: 'leerlauf-kurzschluss'},
  d: {was: 'Leitet nur von Anode zu Kathode, bei Silizium ab rund 0,6 V. Der Strom wächst danach exponentiell.', lex: 'diode'},
  led: {was: 'Diode, die leuchtet. Ihre Flussspannung ist höher, je nach Farbe rund 2 V. Sie braucht einen Vorwiderstand.', lex: 'diode'},
  zener: {was: 'In Sperrrichtung bricht sie bei ihrer Z-Spannung gezielt durch und hält die Spannung dort fest.', lex: 'diode'},
  npn: {was: 'Ein kleiner Basisstrom steuert einen großen Kollektorstrom: Ic ≈ β · Ib. Im aktiven Bereich liegt Ube bei rund 0,65 V.', lex: 'transistor'},
  pnp: {was: 'Wie der NPN mit umgekehrten Vorzeichen: Der Emitter liegt oben, Basisstrom fließt aus der Basis heraus.', lex: 'transistor'},
  nmos: {was: 'Die Spannung am Gate steuert den Kanal, in das Gate fließt kein Gleichstrom. Unterhalb der Schwelle sperrt er.', lex: 'mosfet'},
  pmos: {was: 'Wie der N-MOSFET mit umgekehrten Vorzeichen: Er leitet, wenn das Gate tiefer liegt als die Source.', lex: 'mosfet'},
  opv: {was: 'Verstärkt die Differenz seiner Eingänge sehr stark. Mit Gegenkopplung stellt sich der Ausgang so ein, dass U+ und U− gleich werden.', lex: 'opv'},
  tl072: {was: 'Zwei Operationsverstärker in einem Gehäuse mit gemeinsamer Versorgung an den Pins 8 und 4.', lex: 'opv'},
  cd40106: {was: 'Sechs Schmitt-Inverter. Sie kippen bei zwei verschiedenen Schwellen, das macht sie robust und gut für einfache Oszillatoren.', lex: 'oszillator'},
  rail: {was: 'Versorgung gegen Masse. Alle Zeichen gleicher Spannung sind dasselbe Netz, auch ohne Draht.', lex: 'quelle'},
  v: {was: 'Ideale Spannungsquelle: Sie hält ihre Spannung, egal wie viel Strom fließt.', lex: 'quelle'},
  i: {was: 'Ideale Stromquelle: Sie treibt ihren Strom, egal welche Spannung dafür nötig ist.', lex: 'quelle'},
  gen: {was: 'Funktionsgenerator mit Sinus, Rechteck, Dreieck oder Sägezahn. Im Frequenzgang regt er die Schaltung mit 1 V an.', lex: 'funktionsgenerator'},
  cv: {was: 'Einstellbare Steuerspannung, zum Beispiel für die Basis eines Transistors oder einen Filter.', lex: 'quelle'},
  gate: {was: 'Rechteckpuls als Auslöser, für Hüllkurven und alles, was einen Anstoß braucht.', lex: 'huellkurve'},
  rausch: {was: 'Weißes Rauschen: Alle Frequenzen gleich stark. Gut, um Filter hörbar zu machen.', lex: 'rauschen'},
  audioein: {was: 'Grenze zur Digitaltechnik: Eine gepufferte Quelle mit dem Signal der digitalen Module. Das ist keine Schaltungsberechnung.', lex: 'quelle'},
  gnd: {was: 'Der Bezugspunkt: Alle angezeigten Spannungen werden gegen ihn gemessen. Ohne Masse gibt es keine Rechnung.', lex: 'potential'},
  label: {was: 'Gleiche Namen sind dasselbe Netz, auch ohne sichtbaren Draht. Das hält große Pläne übersichtlich.', lex: 'knotenregel'},
  sonde: {was: 'Misst die Spannung gegen Masse und zeigt sie auf dem Oszilloskop. Sie belastet die Schaltung nicht.', lex: 'oszilloskop-messen'},
  amper: {was: 'Misst den Strom durch diesen Zweig. Im Rechner ist sie eine Quelle mit 0 V, sie ändert also nichts.', lex: 'multimeter'},
  hoer: {was: 'Legt fest, welche Spannung du hörst. Es gilt immer 10 V = 1,0 digital.', lex: 'pegel'}
};

const STATT = {spitze: 'ss', mittel: 'DC', rms: 'eff'};

const u = (op, netz) => (netz === '0' ? 0 : op.wert(`v(${netz})`));
const mess = (w, einheit, stellen = 4) => (Number.isFinite(w) ? fmtMess(w, einheit, stellen) : '–');

/* Betriebsart eines Bipolartransistors aus den Spannungen an seinen Übergängen */
export function regionBJT(vbe, vbc) {
  if (vbe > 0.4 && vbc > 0.4) return 'Sättigung: Beide Übergänge leiten, der Kollektorstrom folgt nicht mehr dem Basisstrom.';
  if (vbe > 0.4) return 'Aktiver Bereich: Er verstärkt.';
  return 'Gesperrt: Die Basis-Emitter-Spannung reicht nicht.';
}

/* Werte eines Bauteils am Arbeitspunkt. Gibt Zeilen [Name, Wert] und einen Satz zum Zustand zurück. */
export function arbeitspunktVon(t, ir, op) {
  const eigene = ir.elemente.filter(e => e.teil === t.id);
  const zeilen = [];
  let zustand = '';
  const widerstand = eigene.filter(e => e.k === 'R');
  switch (t.typ) {
    case 'r': case 'schalter': {
      const e = widerstand[0];
      const du = u(op, e.a) - u(op, e.b), i = du / e.wert;
      zeilen.push(['U', mess(du, 'V')], ['I', mess(i, 'A')], ['P', mess(du * i, 'W')]);
      if (t.typ === 'schalter') zustand = t.werte.zu ? 'Geschlossen.' : 'Offen.';
      break;
    }
    case 'pot': {
      const [a, b] = widerstand;
      zeilen.push(['Schleifer', mess(u(op, a.b), 'V')], ['U oben', mess(u(op, a.a) - u(op, a.b), 'V')], ['U unten', mess(u(op, b.a) - u(op, b.b), 'V')]);
      break;
    }
    case 'c': case 'elko': {
      const e = eigene.find(x => x.k === 'C');
      const du = u(op, e.a) - u(op, e.b);
      zeilen.push(['U', mess(du, 'V')]);
      zustand = t.typ === 'elko' && du < -0.1 ? 'Verpolt: Plus liegt tiefer als Minus. Ein echter Elko nimmt das übel.' : 'Am Arbeitspunkt fließt durch den Kondensator kein Strom.';
      break;
    }
    case 'l': {
      const e = eigene.find(x => x.k === 'L');
      zeilen.push(['I', mess(op.wert(`i(${spiceName('L', e.id)})`), 'A')]);
      zustand = 'Am Arbeitspunkt wirkt die Spule wie ein Draht.';
      break;
    }
    case 'd': case 'led': case 'zener': {
      const e = eigene.find(x => x.k === 'D');
      const du = u(op, e.a) - u(op, e.k_);
      const i = op.wert(`@${spiceName('D', e.id).toLowerCase()}[id]`);
      zeilen.push(['U', mess(du, 'V')], ['I', mess(i, 'A')]);
      zustand = du < -0.5 && Math.abs(i) > 1e-6 ? 'Durchbruch: Sie hält die Spannung in Sperrrichtung.' : i > 1e-6 ? 'Sie leitet.' : 'Sie sperrt.';
      break;
    }
    case 'npn': case 'pnp': {
      const q = eigene.find(x => x.k === 'Q' && !x.id.endsWith('x'));
      const name = spiceName('Q', q.id).toLowerCase();
      const ic = op.wert(`@${name}[ic]`), ib = op.wert(`@${name}[ib]`);
      const vb = u(op, q.b), vc = u(op, q.c), ve = u(op, q.e), vor = q.modell.pol === 'NPN' ? 1 : -1;
      zeilen.push(['Ic', mess(ic, 'A')], ['Ib', mess(ib, 'A', 3)], ['β', Number.isFinite(ic / ib) ? komma((ic / ib).toFixed(0)) : '–'], ['Ube', mess(vb - ve, 'V')], ['Uce', mess(vc - ve, 'V')]);
      zustand = regionBJT(vor * (vb - ve), vor * (vb - vc));
      break;
    }
    case 'nmos': case 'pmos': {
      const m = eigene.find(x => x.k === 'M');
      const vor = t.typ === 'nmos' ? 1 : -1;
      const ugs = u(op, m.g) - u(op, m.s), uds = u(op, m.d) - u(op, m.s);
      const schwelle = Math.abs(m.modell.karte.VTO ?? 0);
      zeilen.push(['Id', mess(op.wert(`@${spiceName('M', m.id).toLowerCase()}[id]`), 'A')], ['Ugs', mess(ugs, 'V')], ['Uds', mess(uds, 'V')]);
      if (vor * ugs < schwelle) zustand = 'Gesperrt: Ugs liegt unter der Schwelle.';
      else if (vor * uds < vor * ugs - schwelle) zustand = 'Linearer Bereich: Der Kanal wirkt wie ein Widerstand.';
      else zustand = 'Sättigung: Der Strom hängt fast nur noch an Ugs.';
      break;
    }
    case 'rail': case 'v': case 'gen': case 'cv': {
      const e = eigene.find(x => x.k === 'V');
      if (!e) break;
      const i = op.wert(`i(${spiceName('V', e.id)})`), du = u(op, e.a) - u(op, e.b);
      zeilen.push(['U', mess(du, 'V')], ['I', mess(i, 'A')], ['liefert', mess(-du * i, 'W')]);
      break;
    }
  }
  return {zeilen, zustand};
}

/* Kennwerte der Sonden aus der zweiten Hälfte des Laufs: Einschwingen zählt nicht. */
export function kennwerte(t, kanaele) {
  const von = t[0] + (t[t.length - 1] - t[0]) / 2;
  return kanaele.map(k => {
    const p = pegelZeit(t, k.werte, von);
    const f = frequenzAusDurchgaengen(t, k.werte, von);
    return {name: k.name, einheit: k.einheit, spitze: p.spitze, mittel: p.mittel, rms: p.rms, f: f ? f.f : null};
  });
}

/* Änderungen unter 0,5 % zählen nicht, auch nicht gemessen am Hub des Signals: Rest-Gleichspannung am Koppelkondensator ist keine Wirkung. */
function geaendert(alt, neu, hub, einheit) {
  if (!Number.isFinite(alt) || !Number.isFinite(neu)) return false;
  const klein = einheit === 'A' ? 1e-7 : 1e-3;
  return Math.abs(neu - alt) > Math.max(klein, 0.005 * Math.abs(alt), 0.005 * hub);
}

/* Was hat sich an den Sonden geändert? Leer, wenn sich nichts Messbares getan hat. */
export function wirkungAnSonden(vorher, jetzt) {
  const teile = [];
  for (const k of jetzt) {
    const a = vorher.find(q => q.name === k.name);
    if (!a) continue;
    const stuecke = [];
    const groesse = k.einheit === 'A' ? 'I' : 'U';
    const zeige = key => stuecke.push(`${groesse}${STATT[key]} ${fmtMess(a[key], k.einheit, 3)} → ${fmtMess(k[key], k.einheit, 3)}`);
    /* Bleibt der Hub gleich, kann sich trotzdem die Form ändern: Dann sagt es der Effektivwert. */
    if (geaendert(a.spitze, k.spitze, 0, k.einheit)) zeige('spitze');
    else if (geaendert(a.rms, k.rms, 0, k.einheit)) zeige('rms');
    if (geaendert(a.mittel, k.mittel, k.spitze, k.einheit)) zeige('mittel');
    if (a.f && k.f && Math.abs(k.f - a.f) > 0.005 * a.f) stuecke.push(`f ${fmtMess(a.f, 'Hz', 4)} → ${fmtMess(k.f, 'Hz', 4)}`);
    if (stuecke.length) teile.push(`${k.name}: ${stuecke.join(', ')}`);
  }
  return teile.join(' · ');
}

/* Was hat sich an der Grenzfrequenz geändert? */
export function wirkungAnFrequenz(vorher, jetzt) {
  const teile = [];
  for (const k of jetzt) {
    const a = vorher.find(q => q.name === k.name);
    if (a?.fc && k.fc && Math.abs(k.fc.fc - a.fc.fc) > 0.005 * a.fc.fc) teile.push(`${k.name}: −3 dB bei ${fmtMess(a.fc.fc, 'Hz', 4)} → ${fmtMess(k.fc.fc, 'Hz', 4)}`);
  }
  return teile.join(' · ');
}
