/* Audiolabor: aus der Schaltung wird der ngspice-Text. Jede Zeile lässt sich auch in ngspice oder LTspice nachrechnen.
   Es werden nur Sprachmittel benutzt, die im konkreten Build (eecircuit-engine 1.9.0, ngspice 45.2, ohne XSPICE und OSDI)
   im Browser nachgeprüft sind, siehe den Prüfstand. */

import { spiceZahl as z } from './einheiten.js';
import { pwlPunkte } from './quellen.js';

const karte = (art, id) => id[0].toUpperCase() === art ? id : art + id;
export const spiceName = karte;
const modellName = (praefix, m) => `${praefix}_${m.name}`.toUpperCase().replace(/[^A-Z0-9_]+/g, '_');
const vAusdruck = (p, n) => n === '0' ? `V(${p})` : p === '0' ? `(-V(${n}))` : `V(${p},${n})`;

function umbrechen(werte, breite = 10) {
  const zeilen = [];
  for (let i = 0; i < werte.length; i += breite) zeilen.push('+ ' + werte.slice(i, i + breite).join(' '));
  return zeilen;
}

/* Für .tran steht nur der Zeitverlauf in der Karte: Der Anfangszustand nimmt dann den Wert zur Zeit 0, genau wie der Live-Löser.
   Für .op und .ac gilt der Gleichanteil. */
function quellenText(e, analyse) {
  const w = e.welle;
  const ac = e.ac && analyse.art === 'ac' && (!analyse.stim || analyse.stim === e.id) ? ' AC 1' : '';
  if (w.art === 'dc') return [`DC ${z(w.v)}${ac}`];
  if (analyse.art !== 'tran') return [`DC ${z(w.dc ?? 0)}${ac}`];
  switch (w.art) {
    case 'sin':
      return [`SIN(${z(w.off)} ${z(w.amp)} ${z(w.f)} 0 0 ${z(w.phase * 180 / Math.PI)})`];
    case 'puls':
      return [`PULSE(${z(w.low)} ${z(w.high)} ${z(w.td)} ${z(w.tr)} ${z(w.tf)} ${z(w.pw)} ${z(w.per)})`];
    case 'rauschen': case 'huelle': case 'proben': {
      const {t, v} = pwlPunkte(w, analyse.dauer);
      const paare = t.map((ti, i) => `${z(ti)} ${z(v[i])}`);
      return ['PWL(', ...umbrechen(paare, 6), '+ )'];
    }
    case 'digital': {
      /* Das digitale Signal wird vor dem Lauf berechnet und als Abtastwerte übergeben. */
      const proben = analyse.digital?.[w.teil];
      if (!proben) return ['DC 0'];
      const {t, v} = pwlPunkte({art: 'proben', werte: proben.werte, rate: proben.rate, faktor: w.faktor}, analyse.dauer);
      const paare = t.map((ti, i) => `${z(ti)} ${z(v[i])}`);
      return ['PWL(', ...umbrechen(paare, 6), '+ )'];
    }
    default:
      throw new Error(`Unbekannte Quellenform: ${w.art}`);
  }
}

function zeilenFuer(e, analyse) {
  const uic = analyse.art === 'tran' && analyse.start === 'uic';
  switch (e.k) {
    case 'R': return [`${karte('R', e.id)} ${e.a} ${e.b} ${z(e.wert)}`];
    case 'C': return [`${karte('C', e.id)} ${e.a} ${e.b} ${z(e.wert)}${uic && e.ic ? ` IC=${z(e.ic)}` : ''}`];
    case 'L': return [`${karte('L', e.id)} ${e.a} ${e.b} ${z(e.wert)}${uic && e.ic ? ` IC=${z(e.ic)}` : ''}`];
    case 'V': {
      const [erste, ...rest] = quellenText(e, analyse);
      return [`${karte('V', e.id)} ${e.a} ${e.b} ${erste}`, ...rest];
    }
    case 'I': {
      const [erste, ...rest] = quellenText(e, analyse);
      return [`${karte('I', e.id)} ${e.a} ${e.b} ${erste}`, ...rest];
    }
    case 'E': return [`${karte('E', e.id)} ${e.a} ${e.b} ${e.cp} ${e.cn} ${z(e.gain)}`];
    case 'GT': return [`${karte('B', e.id)} ${e.a} ${e.b} I = ${z(e.imax)}*tanh(${z(e.gm / e.imax)}*${vAusdruck(e.cp, e.cn)})`];
    case 'D': return [`${karte('D', e.id)} ${e.a} ${e.k_} ${modellName('D', e.modell)}${e.startAus ? ' OFF' : ''}`];
    case 'Q': return [`${karte('Q', e.id)} ${e.c} ${e.b} ${e.e} ${modellName('Q', e.modell)}${e.flaeche !== 1 ? ` ${z(e.flaeche)}` : ''}`];
    case 'M': return [`${karte('M', e.id)} ${e.d} ${e.g} ${e.s} ${e.s} ${modellName('M', e.modell)} W=1 L=1`];
    case 'ST': return schmittZeilen(e, uic);
    default: throw new Error(`Unbekanntes Element ${e.k}`);
  }
}

/* Schmitt-Inverter als Verhaltensmodell ohne XSPICE: normierter Zustand y (1 = Ausgang hoch), Rückführung über ein RC-Glied mit
   der Verzögerung aus dem Datenblatt. Die Schwelle hängt vom Zustand ab, das ergibt die Hysterese. */
function schmittZeilen(e, uic) {
  const m = e.modell;
  const y = `${e.id}_y`.toLowerCase(), q = `${e.id}_q`.toLowerCase(), o = `${e.id}_o`.toLowerCase();
  const vdd = vAusdruck(e.vdd, e.vss);
  const rq = 1000;
  const cq = m.tp / rq;
  /* Die Rückführung kippt schon kurz vor der Schwelle, sobald die Schleifenverstärkung 1 erreicht.
     Um diesen Abstand werden die Schwellen nach außen gelegt, damit das Gatter wirklich bei VP und VN schaltet. */
  const abstand = Math.acosh(Math.sqrt(m.schaerfe * (m.vp - m.vn) / 2)) / m.schaerfe;
  const vn = m.vn - abstand, hub = m.vp - m.vn + 2 * abstand;
  return [
    `B${e.id}y ${y} 0 V = 1-0.5*(1+tanh(${z(m.schaerfe)}*(${vAusdruck(e.ein, e.vss)}/max(${vdd},0.5)-(${z(vn)}+${z(hub)}*V(${q})))))`,
    `R${e.id}q ${y} ${q} ${z(rq)}`,
    `C${e.id}q ${q} 0 ${z(cq)}${uic ? ' IC=1' : ''}`,
    `B${e.id}o ${o} 0 V = ${e.vss === '0' ? '' : `V(${e.vss})+`}V(${y})*${vdd}`,
    `R${e.id}o ${o} ${e.aus} ${z(m.rout)}`
  ];
}

function modellZeile(m, typ) {
  const paare = Object.entries(m.karte).map(([k, v]) => `${k}=${z(v)}`).join(' ');
  const praefix = typ === 'D' ? 'D' : typ === 'NPN' || typ === 'PNP' ? 'Q' : 'M';
  return `.model ${modellName(praefix, m)} ${typ}(${paare})`;
}

export function speicherListe(ir) {
  const liste = new Set();
  for (const s of ir.sonden) {
    if (s.art === 'u' && s.netz !== '0') liste.add(`v(${s.netz})`);
    if (s.art === 'i') liste.add(`i(${karte('V', s.quelle)})`);
  }
  if (ir.hoerpunkt && ir.hoerpunkt.netz !== '0') liste.add(`v(${ir.hoerpunkt.netz})`);
  return [...liste];
}

/* analyse: {art:'op'} oder {art:'ac', von, bis, jeDekade} oder {art:'tran', dauer, tmax, start:'op'|'uic', speichern?, digital?} */
export function spiceText(ir, analyse) {
  const zeilen = [`* ${ir.titel}`];
  let aktuellesTeil = Symbol('keins');
  const beschreibung = new Map(ir.teileInfo.map(t => [t.id, t]));
  for (const e of ir.elemente) {
    if (e.teil !== aktuellesTeil) {
      aktuellesTeil = e.teil;
      const t = beschreibung.get(e.teil);
      if (t) zeilen.push(`* ${t.id}: ${t.modell.name}`);
      else if (e.hilf) zeilen.push('* Hilfswiderstand: Netz ohne Gleichstrompfad zur Masse');
    }
    zeilen.push(...zeilenFuer(e, analyse));
  }
  /* Modelle: alle Halbleiter, auch die Klemmdioden des OPV-Makromodells */
  const bekannt = new Set();
  for (const e of ir.elemente) {
    if (!e.modell?.karte) continue;
    const typ = e.k === 'D' ? 'D' : e.modell.pol;
    const zeile = modellZeile(e.modell, typ);
    if (bekannt.has(zeile)) continue;
    bekannt.add(zeile);
    zeilen.push(zeile);
  }
  if (analyse.art === 'op') {
    /* Dazu die Betriebsdaten der Halbleiter, soweit dieses ngspice sie kennt */
    const daten = {Q: ['ic', 'ib', 'gm'], D: ['id'], M: ['id']};
    const extra = ir.elemente.filter(e => daten[e.k]).flatMap(e => daten[e.k].map(g => `@${karte(e.k, e.id).toLowerCase()}[${g}]`));
    if (extra.length) zeilen.push(`.save all ${extra.join(' ')}`);
    zeilen.push('.op');
  } else if (analyse.art === 'ac') {
    zeilen.push(`.ac dec ${analyse.jeDekade ?? 100} ${z(analyse.von ?? 1)} ${z(analyse.bis ?? 100000)}`);
  } else {
    const liste = analyse.speichern ?? speicherListe(ir);
    if (liste.length) zeilen.push(`.save ${liste.join(' ')}`);
    /* Gear statt Trapezregel: Kleine Halbleiterkapazitäten bei großem Zeitschritt lassen die Trapezregel still falsch schwingen
       (gemessen am Multivibrator: rund 40 kHz statt 317 Hz). Gear dämpft das; sehr hohe Güten werden dadurch etwas stärker gedämpft. */
    zeilen.push('.options method=gear');
    zeilen.push(`.tran ${z(analyse.tmax)} ${z(analyse.dauer)} 0 ${z(analyse.tmax)}${analyse.start === 'uic' ? ' uic' : ''}`);
  }
  zeilen.push('.end', '');
  return nurAscii(zeilen.join('\n'));
}

/* eecircuit-engine 1.9.0 sucht den Beginn der Binärdaten im dekodierten Text und nutzt die Stelle als Byte-Versatz.
   Ein Umlaut im Titel verschiebt die Daten, und das Ergebnis wäre falsch oder fehlt. Deshalb steht in der Netlist nur ASCII. */
function nurAscii(text) {
  return text
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
    .replace(/[−–—]/g, '-').replace(/Ω/g, 'Ohm').replace(/µ/g, 'u')
    .replace(/[^\x00-\x7f]/g, '?');
}
