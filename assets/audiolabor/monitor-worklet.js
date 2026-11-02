/* Audiolabor: letzte Stufe vor dem Lautsprecher, auf dem Audio-Thread.
   Reihenfolge: optionale DC-Sperre, Monitorlautstärke, Schutzbegrenzer. Keine automatische Lautheitsanpassung.
   Die Messgeräte hängen nicht hier: Sie lesen die Werte aus der Schaltung, diese Stufe verändert sie nicht.
   Zusätzlich misst die Stufe den Spitzenwert vor dem Begrenzer und kann das Signal für die Aufnahme und für den Prüfstand abgreifen. */

const KNIE = 0.9;

class AudiolaborMonitor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lautstaerke = 1;
    this.stumm = false;
    this.dcSperre = false;
    this.begrenzer = true;
    this.r = Math.exp(-2 * Math.PI * 5 / sampleRate);
    this.xAlt = [0, 0];
    this.yAlt = [0, 0];
    this.spitzeEin = 0;
    this.spitzeAus = 0;
    this.begrenzt = 0;
    this.seitBericht = 0;
    this.aufnahme = false;
    this.abgriff = null;
    this.port.onmessage = ({data}) => {
      if (data.typ === 'lautstaerke') this.lautstaerke = data.wert;
      else if (data.typ === 'stumm') this.stumm = data.wert;
      else if (data.typ === 'dc') this.dcSperre = data.wert;
      else if (data.typ === 'begrenzer') this.begrenzer = data.wert;
      else if (data.typ === 'aufnahme') this.aufnahme = data.an;
      else if (data.typ === 'abgriff') {
        /* Rohwerte am Eingang und am Ausgang dieser Stufe, für Messungen im Prüfstand */
        this.abgriff = {ein: new Float32Array(data.n), aus: new Float32Array(data.n), pos: 0, id: data.id};
      }
    };
  }

  process(inputs, outputs) {
    const ein = inputs[0], aus = outputs[0];
    const n = aus[0].length;
    const kanaele = Math.min(aus.length, 2);
    let spitzeEin = this.spitzeEin, spitzeAus = this.spitzeAus, begrenzt = this.begrenzt;
    const g = this.stumm ? 0 : this.lautstaerke;
    for (let c = 0; c < kanaele; c++) {
      const q = ein.length ? ein[Math.min(c, ein.length - 1)] : null;
      const z = aus[c];
      let xa = this.xAlt[c], ya = this.yAlt[c];
      for (let i = 0; i < n; i++) {
        const x = q ? q[i] : 0;
        const b = x < 0 ? -x : x;
        if (b > spitzeEin) spitzeEin = b;
        let y = x;
        if (this.dcSperre) { y = x - xa + this.r * ya; xa = x; ya = y; }
        y *= g;
        if (this.begrenzer) {
          const a = y < 0 ? -y : y;
          if (a > KNIE) {
            y = (y < 0 ? -1 : 1) * (KNIE + (1 - KNIE) * Math.tanh((a - KNIE) / (1 - KNIE)));
            begrenzt++;
          }
        }
        const ab = y < 0 ? -y : y;
        if (ab > spitzeAus) spitzeAus = ab;
        z[i] = y;
      }
      this.xAlt[c] = xa;
      this.yAlt[c] = ya;
    }
    if (this.abgriff) {
      const a = this.abgriff, q = ein.length ? ein[0] : null, z = aus[0];
      const m = Math.min(n, a.ein.length - a.pos);
      for (let i = 0; i < m; i++) { a.ein[a.pos + i] = q ? q[i] : 0; a.aus[a.pos + i] = z[i]; }
      a.pos += m;
      if (a.pos >= a.ein.length) {
        this.port.postMessage({typ: 'abgriff', id: a.id, ein: a.ein, aus: a.aus}, [a.ein.buffer, a.aus.buffer]);
        this.abgriff = null;
      }
    }
    if (this.aufnahme) {
      const links = aus[0].slice(), rechts = (aus[1] || aus[0]).slice();
      this.port.postMessage({typ: 'aufnahme', links, rechts}, [links.buffer, rechts.buffer]);
    }
    this.spitzeEin = spitzeEin;
    this.spitzeAus = spitzeAus;
    this.begrenzt = begrenzt;
    this.seitBericht += n;
    if (this.seitBericht >= sampleRate / 20) {
      this.port.postMessage({typ: 'pegel', spitzeEin, spitzeAus, begrenzt});
      this.spitzeEin = 0;
      this.spitzeAus = 0;
      this.begrenzt = 0;
      this.seitBericht = 0;
    }
    return true;
  }
}

registerProcessor('audiolabor-monitor', AudiolaborMonitor);
