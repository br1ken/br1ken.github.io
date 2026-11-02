/* Audiolabor: Wellendigitalfilter als Vergleich zum allgemeinen Löser. Nur für den Prüfstand.
   Das ist kein Port von chowdsp_wdf, sondern dieselbe Struktur in JavaScript: Baum aus Adaptern, Blätter sind Bauteile,
   die Nichtlinearität sitzt an der Wurzel. Damit lässt sich prüfen, ob sich der Aufwand einer echten WebAssembly-Portierung lohnt. */

/* RC-Tiefpass: Quelle → Serienadapter(R, C). Liefert die Kondensatorspannung. */
export function wdfRC(R, C, fsRechen, quelle, n) {
  const Rc = 1 / (2 * C * fsRechen);
  const Rs = R + Rc;
  const aus = new Float64Array(n);
  let z = 0;
  for (let k = 0; k < n; k++) {
    const vs = quelle((k + 1) / fsRechen);
    /* hoch: Der Widerstand reflektiert nichts, der Kondensator seinen Speicher. */
    const a1 = 0, a2 = z;
    const hoch = -(a1 + a2);
    /* Wurzel: ideale Spannungsquelle. Am Serienadapter ist die Summe der Tor-Spannungen null, die Quelle liegt also mit −vs an. */
    const runter = -2 * vs - hoch;
    /* runter durch den Serienadapter */
    const s = a1 + a2 + runter;
    const b2 = a2 - (Rc / Rs) * s;
    aus[k] = (b2 + z) / 2;
    z = b2;
  }
  return aus;
}

/* Diodenbegrenzer: Quelle mit Serienwiderstand, zwei antiparallele Dioden an der Wurzel, Newton auf die Knotenspannung. */
export function wdfBegrenzer(R, is, nvt, gmin, fsRechen, quelle, n) {
  const aus = new Float64Array(n);
  let v = 0, iterationen = 0;
  for (let k = 0; k < n; k++) {
    const a = quelle((k + 1) / fsRechen);
    for (let i = 0; i < 16; i++) {
      const ef = Math.exp(v / nvt), er = Math.exp(-v / nvt);
      const f = is * (ef - er) + 2 * gmin * v - (a - v) / R;
      const df = is * (ef + er) / nvt + 2 * gmin + 1 / R;
      const d = f / df;
      v -= d;
      iterationen++;
      if (Math.abs(d) < 1e-9) break;
    }
    aus[k] = v;
  }
  return {aus, iterationen};
}
