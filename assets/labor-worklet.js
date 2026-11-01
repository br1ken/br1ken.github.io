/* osci//lab — Rechenwerk im Audio-Thread (AudioWorklet), geladen von labor.js.
   Zwei kleine Prozessoren:
   osci-onepole  Tiefpass oder Hochpass erster Ordnung (RC bzw. CR, bilinear transformiert mit Vorverzerrung) —
                 wie LabModels.lowpass, nur mit Grenzfrequenz als AudioParam und einem zweiten Eingang „Mod“,
                 über den ein LFO die Grenzfrequenz in Oktaven verschiebt: f = cutoff · 2^(mod · octaves).
   osci-lfo      Langsamer Oszillator mit Sinus, Dreieck, Rechteck oder Zufall (Sample & Hold), Ausgang −1 … 1.
   Fällt das Worklet aus (alte Browser), nimmt labor.js IIRFilter und OscillatorNode — nur ohne Modulation. */
'use strict';

class OnePole extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {name: 'cutoff', defaultValue: 1000, minValue: 1, maxValue: 20000, automationRate: 'k-rate'},
      {name: 'octaves', defaultValue: 0, minValue: 0, maxValue: 8, automationRate: 'k-rate'}
    ];
  }
  constructor(options) {
    super();
    this.highpass = options.processorOptions?.mode === 'highpass';
    this.z = [];   // Filterzustand je Kanal: [y_alt, x_alt]
  }
  process(inputs, outputs, parameters) {
    const audio = inputs[0], out = outputs[0], mod = inputs[1]?.[0];
    if (!audio || !audio.length) return true;
    /* Grenzfrequenz einmal pro Block (128 Samples): LFOs sind langsam, das reicht und spart den Tangens. */
    const m = mod ? mod[0] : 0;
    const f = Math.min(Math.max(parameters.cutoff[0] * Math.pow(2, m * parameters.octaves[0]), 1), sampleRate * .45);
    const k = Math.tan(Math.PI * f / sampleRate), a = (k - 1) / (k + 1);
    const bLow = k / (1 + k), bHigh = 1 / (1 + k);
    /* Je Ausgangskanal; ein Mono-Eingang speist beide Kanäle. */
    for (let c = 0; c < out.length; c++) {
      const x = audio[c] || audio[0], y = out[c];
      if (!this.z[c]) this.z[c] = [0, 0];
      const z = this.z[c];
      let y1 = z[0], x1 = z[1];
      if (this.highpass) {
        for (let i = 0; i < x.length; i++) { const v = bHigh * (x[i] - x1) - a * y1; y1 = v; x1 = x[i]; y[i] = v; }
      } else {
        for (let i = 0; i < x.length; i++) { const v = bLow * (x[i] + x1) - a * y1; y1 = v; x1 = x[i]; y[i] = v; }
      }
      /* Denormals und Unendlichkeiten nicht in den nächsten Block schleppen */
      z[0] = Number.isFinite(y1) ? y1 : 0; z[1] = Number.isFinite(x1) ? x1 : 0;
    }
    return true;
  }
}

class Lfo extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{name: 'rate', defaultValue: .5, minValue: .01, maxValue: 50, automationRate: 'k-rate'}];
  }
  constructor(options) {
    super();
    this.shape = options.processorOptions?.shape || 'sine';
    this.phase = 0; this.held = Math.random() * 2 - 1; this.next = 0;
    this.port.onmessage = e => { if (e.data?.shape) this.shape = e.data.shape; };
  }
  process(inputs, outputs, parameters) {
    const y = outputs[0][0]; if (!y) return true;
    const step = parameters.rate[0] / sampleRate;
    for (let i = 0; i < y.length; i++) {
      const p = this.phase;
      switch (this.shape) {
        case 'triangle': y[i] = 1 - 4 * Math.abs(p - .5); break;
        case 'square': y[i] = p < .5 ? 1 : -1; break;
        case 'random': y[i] = this.held; break;
        default: y[i] = Math.sin(2 * Math.PI * p);
      }
      this.phase += step;
      if (this.phase >= 1) { this.phase -= 1; this.held = Math.random() * 2 - 1; }
    }
    return true;
  }
}

registerProcessor('osci-onepole', OnePole);
registerProcessor('osci-lfo', Lfo);
