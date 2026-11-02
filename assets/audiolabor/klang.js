/* Audiolabor: der eine Audiokontext der Seite und der Weg zum Lautsprecher.

     Schaltung (gerendert oder live) → digitale Kette (Faust, optional) → Monitorstufe → Ausgang

   Die Hörskalierung ist eine feste Festlegung der Software: 10 V am Hörpunkt entsprechen 1,0 digital.
   Sie wird nie automatisch nachgeregelt, damit elektrische Vergleiche auch hörbar vergleichbar bleiben. */

export const VOLT_JE_EINS = 10;

export class Monitorweg {
  constructor() {
    this.ctx = null;
    this.eingang = null;
    this.ausgang = null;
    this.monitor = null;
    this.kette = [];
    this.quelle = null;
    this.beiPegel = null;
    this.beiQuelleEnde = null;
    this.abgriffe = new Map();
    this.abgriffId = 0;
    this.aufnahmeLinks = null;
    this.aufnahmeRechts = null;
    this.startPromise = null;
    this.einstellungen = {lautstaerke: 1, stumm: false, dc: false, begrenzer: true};
  }

  /* Muss nach einer Nutzeraktion aufgerufen werden, sonst bleibt der Kontext angehalten. */
  async start() {
    if (typeof OSCI === 'undefined' || !await OSCI.audioFreigabe()) throw new DOMException('Ton bleibt ausgeschaltet.', 'AbortError');
    if (!this.startPromise) this.startPromise = this._aufbauen();
    return this.startPromise.then(async () => {
      if (this.ctx.state !== 'running') await this.ctx.resume();
      return this;
    });
  }

  async _aufbauen() {
    if (!window.AudioWorkletNode) throw new Error('Dieser Browser kennt AudioWorklet nicht.');
    this.ctx = new AudioContext({latencyHint: 'interactive'});
    await this.ctx.audioWorklet.addModule(new URL('./monitor-worklet.js', import.meta.url));
    this.eingang = this.ctx.createGain();
    this.monitor = new AudioWorkletNode(this.ctx, 'audiolabor-monitor', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2]});
    this.monitor.port.onmessage = ({data}) => this._nachricht(data);
    this.monitor.connect(this.ctx.destination);
    this._verdrahten();
    for (const [typ, wert] of Object.entries(this.einstellungen)) this.monitor.port.postMessage({typ, wert});
  }

  _nachricht(d) {
    if (d.typ === 'pegel') this.beiPegel?.(d);
    else if (d.typ === 'abgriff') {
      const fertig = this.abgriffe.get(d.id);
      this.abgriffe.delete(d.id);
      fertig?.({ein: d.ein, aus: d.aus});
    } else if (d.typ === 'aufnahme') {
      this.aufnahmeLinks?.push(d.links);
      this.aufnahmeRechts?.push(d.rechts);
    }
  }

  _verdrahten() {
    this.eingang.disconnect();
    let letzter = this.eingang;
    for (const k of this.kette) {
      k.eingang.disconnect?.();
      letzter.connect(k.eingang);
      letzter = k.ausgang;
      if (letzter !== k.eingang) letzter.disconnect?.();
    }
    letzter.connect(this.monitor);
  }

  /* Reihenfolge der digitalen Module. Jedes Modul: {eingang: AudioNode, ausgang: AudioNode} */
  setzeKette(module) {
    this.kette = module;
    if (this.ctx) this._verdrahten();
  }

  stelle(typ, wert) {
    this.einstellungen[typ] = wert;
    this.monitor?.port.postMessage({typ, wert});
  }

  /* Spielt Spannungen in Volt, skaliert mit der festen Hörskalierung. */
  spieleVolt(proben, fs, {schleife = false, sanft = true} = {}) {
    this.stoppeQuelle();
    const puffer = this.ctx.createBuffer(1, Math.max(proben.length, 1), fs);
    const k = puffer.getChannelData(0);
    for (let i = 0; i < proben.length; i++) k[i] = proben[i] / VOLT_JE_EINS;
    const q = this.ctx.createBufferSource();
    q.buffer = puffer;
    q.loop = schleife;
    /* Kurzes Ein- und Ausblenden nur gegen das Knacken am Pufferrand. Der Pegel dazwischen bleibt unverändert. */
    const g = this.ctx.createGain();
    if (sanft) {
      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.004);
    }
    q.connect(g);
    g.connect(this.eingang);
    q.onended = () => { if (this.quelle?.q === q) { this.quelle = null; this.beiQuelleEnde?.(); } };
    q.start();
    this.quelle = {q, g, gestartet: this.ctx.currentTime, dauer: puffer.duration, schleife};
    return this.quelle;
  }

  stoppeQuelle() {
    if (!this.quelle) return;
    const {q, g} = this.quelle;
    this.quelle = null;
    try {
      const t = this.ctx.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.004);
      q.stop(t + 0.006);
    } catch { /* schon beendet */ }
    setTimeout(() => g.disconnect(), 40);
  }

  /* Liest n Abtastwerte am Eingang und Ausgang der Monitorstufe. */
  abgreifen(n) {
    return new Promise(resolve => {
      const id = ++this.abgriffId;
      this.abgriffe.set(id, resolve);
      this.monitor.port.postMessage({typ: 'abgriff', id, n});
    });
  }

  aufnahmeStart() {
    this.aufnahmeLinks = [];
    this.aufnahmeRechts = [];
    this.monitor.port.postMessage({typ: 'aufnahme', an: true});
  }

  aufnahmeStopp() {
    this.monitor.port.postMessage({typ: 'aufnahme', an: false});
    const links = this.aufnahmeLinks || [], rechts = this.aufnahmeRechts || [];
    this.aufnahmeLinks = null;
    this.aufnahmeRechts = null;
    const n = links.reduce((s, b) => s + b.length, 0);
    const l = new Float32Array(n), r = new Float32Array(n);
    let pos = 0;
    links.forEach((b, i) => { l.set(b, pos); r.set(rechts[i], pos); pos += b.length; });
    return {links: l, rechts: r, fs: this.ctx.sampleRate};
  }
}
