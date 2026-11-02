/* Audiolabor: Werte lesen und schreiben. Intern rechnet alles in V, A, Ω, F, H und Sekunden.
   Gelesen wird, was man im Labor schreibt: 10k, 4k7, 4,7 kΩ, 100n, 2u2, 1M, 1Meg. Groß M ist Mega, klein m ist Milli. */

const VORSATZ = {T: 1e12, G: 1e9, Meg: 1e6, meg: 1e6, M: 1e6, k: 1e3, K: 1e3, m: 1e-3, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, n: 1e-9, p: 1e-12, f: 1e-15};
const ZAHL = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(Meg|meg|[TGMkKmuµμnpf])?(\d+)?$/;

/* Gibt die Zahl in Grundeinheiten zurück oder null, wenn der Text kein Wert ist. */
export function leseWert(text) {
  if (typeof text === 'number') return Number.isFinite(text) ? text : null;
  let s = String(text ?? '').trim().replace(/\s+/g, '').replace(/−/g, '-');
  if (!s) return null;
  if (/^[+-]?\d{1,3}(\.\d{3})+,\d+/.test(s)) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  const direkt = s.match(ZAHL);
  if (direkt) return baue(direkt);
  /* Einheit am Ende abstreifen: 10kΩ, 100nF, 1,5V, 220Hz, 5ms */
  const ohne = s.replace(/(Ω|Ohm|ohm|Hz|hz|F|H|V|A|s|°|%)$/, '');
  const m = ohne !== s ? ohne.match(ZAHL) : null;
  return m ? baue(m) : null;
}

function baue(m) {
  let wert = Number(m[1]);
  if (m[3]) {
    /* 4k7 = 4,7k. Nur sinnvoll, wenn vor dem Vorsatz eine ganze Zahl steht. */
    if (!m[2] || m[1].includes('.') || /e/i.test(m[1])) return null;
    wert = Number(`${m[1]}.${m[3]}`);
  }
  return wert * (m[2] ? VORSATZ[m[2]] : 1);
}

const STUFEN = [[1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f']];

function stufe(betrag) {
  for (const s of STUFEN) if (betrag >= s[0] * 0.9995) return s;
  return STUFEN[STUFEN.length - 1];
}

export const komma = text => String(text).replace('.', ',').replace(/^-/, '−');

/* Bauteilwert: so kurz wie möglich, ohne Rundung sichtbarer Stellen. 10000 → „10 kΩ“, 4,7e-9 → „4,7 nF“. */
export function fmtWert(x, einheit = '') {
  if (!Number.isFinite(x)) return '–';
  if (x === 0) return `0 ${einheit}`.trim();
  const [f, v] = stufe(Math.abs(x));
  const n = Number((x / f).toPrecision(6));
  return `${komma(String(n))} ${v}${einheit}`.trim();
}

/* Messwert: feste Zahl gültiger Stellen, damit die Genauigkeit sichtbar bleibt. */
export function fmtMess(x, einheit = '', stellen = 4) {
  if (!Number.isFinite(x)) return '–';
  /* Unterhalb von Atto ist es Rechenrauschen. */
  if (Math.abs(x) < 1e-18) return `0 ${einheit}`.trim();
  const [f, v] = stufe(Math.abs(x));
  /* 990 mit zwei Stellen würde sonst zu 9.9e+2. */
  const zahl = (x / f).toPrecision(stellen);
  return `${komma(zahl.includes('e') ? String(Number(zahl)) : zahl)} ${v}${einheit}`.trim();
}

/* Reine Dezimalzahl mit Komma: fmtZahl(1591.55, 2) → „1591,55“ */
export const fmtZahl = (x, nachkomma = 2) => Number.isFinite(x) ? komma(x.toFixed(nachkomma)) : '–';

/* Zahl für die Netlist: englische Schreibweise, volle Genauigkeit, keine Vorsätze. */
export const spiceZahl = x => {
  if (!Number.isFinite(x)) throw new Error(`Ungültiger Zahlenwert in der Netlist: ${x}`);
  return Number(x.toPrecision(12)).toString();
};

/* Normreihen zum Durchtippen eines Werts mit den Pfeiltasten */
const E24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
export function naechsterNormwert(x, richtung) {
  if (!(x > 0)) return x;
  const dek = Math.floor(Math.log10(x) + 1e-9);
  const basis = 10 ** dek;
  const m = x / basis;
  if (richtung > 0) {
    for (const w of E24) if (w > m * 1.0005) return Number((w * basis).toPrecision(6));
    return Number((10 * basis).toPrecision(6));
  }
  for (let i = E24.length - 1; i >= 0; i--) if (E24[i] < m * 0.9995) return Number((E24[i] * basis).toPrecision(6));
  return Number((9.1 * basis / 10).toPrecision(6));
}
