/* Audiolabor: Auswertung berechneter Verläufe. Alles rechnet mit den Spannungen und Strömen aus der Schaltung,
   die Skalierung für den Lautsprecher kommt erst danach. */

const RAD = 180 / Math.PI;
export const DB_3 = 20 * Math.log10(Math.SQRT1_2); /* −3,0103 dB */

/* ---------- Frequenzgang ---------- */

export function frequenzgang(frequenz, re, im) {
  const n = frequenz.length;
  const db = new Float64Array(n), phase = new Float64Array(n);
  let sprung = 0, vorher = 0;
  for (let i = 0; i < n; i++) {
    db[i] = 20 * Math.log10(Math.max(Math.hypot(re[i], im[i]), 1e-30));
    let p = Math.atan2(im[i], re[i]) * RAD;
    if (i > 0) {
      const d = p + sprung - vorher;
      if (d > 180) sprung -= 360; else if (d < -180) sprung += 360;
    }
    p += sprung;
    phase[i] = p;
    vorher = p;
  }
  return {f: frequenz, db, phase};
}

/* Wert an einer Frequenz, logarithmisch zwischen den Rasterpunkten interpoliert */
export function wertBei(f, y, f0) {
  const n = f.length;
  if (f0 <= f[0]) return y[0];
  if (f0 >= f[n - 1]) return y[n - 1];
  let i = 1;
  while (f[i] < f0) i++;
  const t = (Math.log(f0) - Math.log(f[i - 1])) / (Math.log(f[i]) - Math.log(f[i - 1]));
  return y[i - 1] + t * (y[i] - y[i - 1]);
}

/* Erste Stelle, an der der Betrag um 3,01 dB unter den Bezug fällt. Bezug: ein Wert in dB oder der Betrag bei der kleinsten Frequenz. */
export function grenzfrequenz(gang, bezugDb = gang.db[0]) {
  const {f, db} = gang, ziel = bezugDb + DB_3;
  for (let i = 1; i < f.length; i++) {
    if (db[i - 1] > ziel && db[i] <= ziel) {
      const t = (ziel - db[i - 1]) / (db[i] - db[i - 1]);
      const fc = Math.exp(Math.log(f[i - 1]) + t * (Math.log(f[i]) - Math.log(f[i - 1])));
      return {fc, phase: wertBei(f, gang.phase, fc), db: ziel, bezugDb};
    }
  }
  return null;
}

/* Hochpass und Bandpass: Stelle, an der der Betrag von unten kommend auf 3,01 dB unter das Maximum steigt */
export function grenzfrequenzUnten(gang) {
  const {f, db} = gang;
  let max = -Infinity;
  for (const d of db) if (d > max) max = d;
  const ziel = max + DB_3;
  for (let i = 1; i < f.length; i++) {
    if (db[i - 1] < ziel && db[i] >= ziel) {
      const t = (ziel - db[i - 1]) / (db[i] - db[i - 1]);
      const fc = Math.exp(Math.log(f[i - 1]) + t * (Math.log(f[i]) - Math.log(f[i - 1])));
      return {fc, phase: wertBei(f, gang.phase, fc), db: ziel, bezugDb: max};
    }
  }
  return null;
}

/* Art des Frequenzgangs aus den Steigungen an beiden Enden. Das gilt auch mit Resonanzspitze, wo der Betrag bei tiefen Frequenzen weit unter dem Maximum liegt. */
export function verlaufArt(gang) {
  const {f, db} = gang, n = f.length;
  const steigung = (a, b) => Math.abs(wertBei(f, db, b) - wertBei(f, db, a)) / Math.log10(b / a);
  const untenFlach = steigung(f[0], Math.min(f[0] * 10, f[n - 1])) < 3;
  const obenFlach = steigung(Math.max(f[n - 1] / 10, f[0]), f[n - 1]) < 3;
  if (untenFlach) return obenFlach ? 'flach' : 'Tiefpass';
  return obenFlach ? 'Hochpass' : 'Bandpass';
}

/* ---------- Zeitverläufe ---------- */

export function pegel(v, von = 0, bis = v.length) {
  let min = Infinity, max = -Infinity, sum = 0, sum2 = 0;
  const n = bis - von;
  for (let i = von; i < bis; i++) {
    const x = v[i];
    if (x < min) min = x;
    if (x > max) max = x;
    sum += x;
    sum2 += x * x;
  }
  const mittel = sum / n, rms = Math.sqrt(sum2 / n);
  return {min, max, spitze: max - min, mittel, rms, acRms: Math.sqrt(Math.max(sum2 / n - mittel * mittel, 0))};
}

/* Mittelwert und Effektivwert über nicht äquidistante Zeitpunkte (Trapezregel), wie sie ngspice liefert */
export function pegelZeit(t, v, tVon = t[0], tBis = t[t.length - 1]) {
  let min = Infinity, max = -Infinity, flaeche = 0, flaeche2 = 0, dauer = 0;
  for (let i = 1; i < t.length; i++) {
    if (t[i] < tVon || t[i - 1] > tBis) continue;
    const dt = t[i] - t[i - 1], a = v[i - 1], b = v[i];
    if (a < min) min = a;
    if (b < min) min = b;
    if (a > max) max = a;
    if (b > max) max = b;
    flaeche += dt * (a + b) / 2;
    flaeche2 += dt * (a * a + a * b + b * b) / 3;
    dauer += dt;
  }
  const mittel = flaeche / dauer, rms = Math.sqrt(flaeche2 / dauer);
  return {min, max, spitze: max - min, mittel, rms, acRms: Math.sqrt(Math.max(rms * rms - mittel * mittel, 0))};
}

/* Grundfrequenz aus den steigenden Durchgängen durch den Mittelwert, linear zwischen den Punkten interpoliert. */
export function frequenzAusDurchgaengen(t, v, tVon = t[0], tBis = t[t.length - 1]) {
  const p = pegelZeit(t, v, tVon, tBis);
  if (!(p.spitze > 1e-9)) return null;
  const schwelle = p.mittel, hyst = p.spitze * 0.1;
  const durchgaenge = [];
  let unten = true;
  for (let i = 1; i < t.length; i++) {
    if (t[i] < tVon || t[i] > tBis) continue;
    if (unten && v[i - 1] < schwelle && v[i] >= schwelle) {
      const a = (schwelle - v[i - 1]) / (v[i] - v[i - 1]);
      durchgaenge.push(t[i - 1] + a * (t[i] - t[i - 1]));
      unten = false;
    } else if (!unten && v[i] < schwelle - hyst) unten = true;
  }
  if (durchgaenge.length < 2) return null;
  const perioden = durchgaenge.length - 1;
  return {f: perioden / (durchgaenge[perioden] - durchgaenge[0]), perioden, durchgaenge};
}

/* Amplitude und Phase einer bestimmten Frequenz in gleichmäßig abgetasteten Daten. Für exakte Werte über ganze Perioden auswerten. */
export function amplitudeBei(x, fs, f, von = 0, bis = x.length) {
  const w = 2 * Math.PI * f / fs;
  const perioden = Math.floor((bis - von) * f / fs);
  if (perioden < 1) return {amplitude: 0, phase: 0};
  const n = Math.round(perioden * fs / f);
  let re = 0, im = 0;
  for (let i = 0; i < n; i++) {
    const s = x[von + i];
    re += s * Math.cos(w * i);
    im -= s * Math.sin(w * i);
  }
  return {amplitude: 2 * Math.hypot(re, im) / n, phase: Math.atan2(im, re) * RAD + 90};
}

/* ---------- Von adaptiven Schritten auf ein festes Raster ---------- */

/* Lineare Interpolation auf ein gleichmäßiges Raster ab tVon. */
export function aufRaster(t, v, rate, tVon, n) {
  const aus = new Float64Array(n);
  let i = 1;
  const letzter = t.length - 1;
  for (let k = 0; k < n; k++) {
    const tk = tVon + k / rate;
    while (i < letzter && t[i] < tk) i++;
    if (tk <= t[0]) aus[k] = v[0];
    else if (tk >= t[letzter]) aus[k] = v[letzter];
    else {
      const a = (tk - t[i - 1]) / (t[i] - t[i - 1]);
      aus[k] = v[i - 1] + a * (v[i] - v[i - 1]);
    }
  }
  return aus;
}

/* Linearphasiger Tiefpass (gefensterter Sinc, Blackman), normiert auf Verstärkung 1 bei Gleichspannung */
export function tiefpassKern(grenzeRelativ, laenge) {
  const m = laenge - 1, h = new Float64Array(laenge);
  let sum = 0;
  for (let i = 0; i < laenge; i++) {
    const x = i - m / 2;
    const si = x === 0 ? 2 * grenzeRelativ : Math.sin(2 * Math.PI * grenzeRelativ * x) / (Math.PI * x);
    const f = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / m) + 0.08 * Math.cos(4 * Math.PI * i / m);
    h[i] = si * f;
    sum += h[i];
  }
  for (let i = 0; i < laenge; i++) h[i] /= sum;
  return h;
}

/* Bringt einen ngspice-Verlauf auf die Abtastrate des Audioausgangs.
   Erst linear auf vierfache Rate, dann Tiefpass mit Grenze 0,45·fs und Verringern um den Faktor 4.
   Die Laufzeit des Filters ist ausgeglichen, das Ergebnis bleibt also zeitrichtig. */
export function zuAudio(t, v, fs) {
  const faktor = 4, fein = fs * faktor;
  const dauer = t[t.length - 1] - t[0];
  const nAus = Math.max(Math.floor(dauer * fs), 1);
  const laenge = 8 * faktor * 2 + 1;
  const h = tiefpassKern(0.45 / faktor, laenge);
  const halb = (laenge - 1) / 2;
  const nFein = nAus * faktor + 1;
  const roh = aufRaster(t, v, fein, t[0], nFein);
  const aus = new Float64Array(nAus);
  for (let k = 0; k < nAus; k++) {
    const mitte = k * faktor;
    let s = 0;
    for (let j = -halb; j <= halb; j++) {
      const q = mitte + j;
      /* Am Rand wird der erste bzw. letzte Wert gehalten. */
      s += h[j + halb] * roh[q < 0 ? 0 : q >= nFein ? nFein - 1 : q];
    }
    aus[k] = s;
  }
  return aus;
}

/* ---------- Spektrum ---------- */

function fftReal(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const w = -2 * Math.PI / len, wr = Math.cos(w), wi = Math.sin(w);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let j = 0; j < len / 2; j++) {
        const a = i + j, b = a + len / 2;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi;
        re[a] += xr; im[a] += xi;
        const c = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = c;
      }
    }
  }
}

/* Betragsspektrum mit Hann-Fenster. Ein Sinus der Amplitude A erscheint mit A in seinem Maximum. */
export function spektrum(x, fs, groesseWunsch = 16384) {
  let n = 1024;
  while (n * 2 <= Math.min(x.length, groesseWunsch)) n *= 2;
  const start = Math.max(x.length - n, 0);
  const re = new Float64Array(n), im = new Float64Array(n);
  const m = Math.min(n, x.length);
  for (let i = 0; i < m; i++) re[i] = x[start + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (m - 1)));
  fftReal(re, im);
  const h = n / 2;
  const f = new Float64Array(h), a = new Float64Array(h);
  for (let i = 0; i < h; i++) { f[i] = i * fs / n; a[i] = 4 * Math.hypot(re[i], im[i]) / m; }
  a[0] /= 2;
  return {f, a, n, fs};
}

/* Klirrfaktor aus den ersten Oberwellen einer bekannten Grundfrequenz. */
export function klirr(x, fs, f0, oberwellen = 8) {
  const g = amplitudeBei(x, fs, f0).amplitude;
  if (!(g > 0)) return {thd: 0, grund: 0, harmonische: []};
  let summe = 0;
  const harmonische = [g];
  for (let k = 2; k <= oberwellen + 1 && k * f0 < fs / 2; k++) {
    const a = amplitudeBei(x, fs, k * f0).amplitude;
    harmonische.push(a);
    summe += a * a;
  }
  return {thd: Math.sqrt(summe) / g, grund: g, harmonische};
}

/* ---------- WAV ---------- */

/* 32-Bit-Float: Pegel über 1,0 und Gleichanteil bleiben erhalten. */
export function wavFloat32(proben, fs) {
  const n = proben.length, puffer = new ArrayBuffer(44 + n * 4), d = new DataView(puffer);
  const text = (o, s) => { for (let i = 0; i < s.length; i++) d.setUint8(o + i, s.charCodeAt(i)); };
  text(0, 'RIFF'); d.setUint32(4, 36 + n * 4, true); text(8, 'WAVE');
  text(12, 'fmt '); d.setUint32(16, 16, true); d.setUint16(20, 3, true); d.setUint16(22, 1, true);
  d.setUint32(24, fs, true); d.setUint32(28, fs * 4, true); d.setUint16(32, 4, true); d.setUint16(34, 32, true);
  text(36, 'data'); d.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) d.setFloat32(44 + i * 4, proben[i], true);
  return puffer;
}
