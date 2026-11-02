/* Audiolabor: Steuerung des Live-Betriebs im Hauptthread. Baut Pläne und übergibt sie an den Audio-Thread. Die Rechenlast misst dieser selbst. */

import { baueSchaltung } from './netz.js';
import { erzeugePlan, planPuffer, PlanFehler } from './live-plan.js';
import { LiveKern, arbeitspunkt } from './live-kern.js';
import { generatorWelle, gateWelle } from './bauteile.js';

const SCOPE_RAHMEN = 2048;

/* Startzustand aus Arbeitspunkt oder Anfangswerten */
export function startZustand(irLive, {start = 'op', mess = []} = {}) {
  if (start !== 'op') return {zustand: {mitIc: true, schritte: 0, t: 0}, dc: null};
  const planDC = erzeugePlan(irLive, {h: 1e4, theta: 1, mess});
  const kd = new LiveKern(planDC, {maxIter: 200});
  const dc = arbeitspunkt(kd);
  const z = kd.zustandLesen();
  z.schritte = 0;
  z.t = 0;
  z.quellen = null;
  return {zustand: z, dc};
}

export function messListe(ir) {
  const mess = ir.sonden.map(s => s.art === 'u' ? {id: s.id, art: 'u', netz: s.netz} : {id: s.id, art: 'i', quelle: s.quelle});
  let hoerIndex = -1;
  if (ir.hoerpunkt) {
    hoerIndex = mess.findIndex(m => m.art === 'u' && m.netz === ir.hoerpunkt.netz);
    if (hoerIndex < 0) { mess.push({id: '_hoer', art: 'u', netz: ir.hoerpunkt.netz}); hoerIndex = mess.length - 1; }
  }
  return {mess, hoerIndex};
}

export class LiveBetrieb {
  constructor(monitor) {
    this.monitor = monitor;
    this.knoten = null;
    this.modulGeladen = null;
    this.aktiv = false;
    this.beiScope = null;
    this.beiBericht = null;
    this.beiPlan = null;
    this.beiNan = null;
    this.kennung = 0;
    this.ueber = 4;
    this.theta = 0.5;
    this.mess = [];
    this.uhr = null;
    this.eingang = null;
  }

  async _knoten() {
    await this.monitor.start();
    const ctx = this.monitor.ctx;
    if (!this.modulGeladen) this.modulGeladen = ctx.audioWorklet.addModule(new URL('./live-worklet.js', import.meta.url));
    await this.modulGeladen;
    if (this.knoten) return this.knoten;
    const k = new AudioWorkletNode(ctx, 'audiolabor-live', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 1, channelCountMode: 'explicit'});
    k.port.onmessage = ({data}) => this._nachricht(data);
    this.eingang = ctx.createGain();
    this.eingang.connect(k);
    k.connect(this.monitor.eingang);
    this.knoten = k;
    return k;
  }

  _nachricht(d) {
    switch (d.typ) {
      case 'bereit': this.uhr = d.uhr; break;
      case 'scope': {
        this.beiScope?.(d.rahmen, d.t, d.fs);
        /* Puffer zurück in den Vorrat des Audio-Threads */
        const ids = d.rahmen.map(a => a.buffer);
        this.knoten?.port.postMessage({typ: 'scope-zurueck', puffer: d.rahmen}, ids);
        break;
      }
      case 'bericht': this.uhr = d.uhr; this.beiBericht?.(d); break;
      case 'plan-aktiv': this.beiPlan?.(d); break;
      case 'nan': this.beiNan?.(); break;
    }
  }

  /* Baut den Plan für das aktuelle Projekt. Wirft bei nicht unterstützten oder elektrisch unlösbaren Schaltungen. */
  plane(projekt, {ueber = this.ueber, theta = this.theta} = {}) {
    const ir = baueSchaltung(projekt, {ziel: 'live'});
    if (ir.fehler.length) throw new PlanFehler(ir.fehler[0].text);
    const {mess, hoerIndex} = messListe(ir);
    const fs = this.monitor.ctx.sampleRate;
    const plan = erzeugePlan(ir, {fs, ueber, theta, mess});
    return {ir, plan, mess, hoerIndex};
  }

  async starten(projekt, {ueber = 4, theta = 0.5, start = 'op'} = {}) {
    this.ueber = ueber;
    this.theta = theta;
    const k = await this._knoten();
    const {ir, plan, mess, hoerIndex} = this.plane(projekt);
    const {zustand, dc} = startZustand(ir, {start, mess});
    this.mess = mess;
    this.aktiv = true;
    this._sendePlan(k, plan, hoerIndex, zustand);
    return {ir, plan, dc, mess, hoerIndex};
  }

  /* Neue Schaltung oder neue Werte im laufenden Betrieb */
  aktualisieren(projekt) {
    if (!this.aktiv || !this.knoten) return null;
    const {ir, plan, mess, hoerIndex} = this.plane(projekt);
    this.mess = mess;
    this._sendePlan(this.knoten, plan, hoerIndex, null);
    return {ir, plan, mess, hoerIndex};
  }

  /* Zustände verwerfen. Das meldet die Oberfläche ausdrücklich. */
  neuStarten(projekt, start = 'op') {
    if (!this.knoten) return null;
    const {ir, plan, mess, hoerIndex} = this.plane(projekt);
    const {zustand, dc} = startZustand(ir, {start, mess});
    this.mess = mess;
    this._sendePlan(this.knoten, plan, hoerIndex, zustand);
    return {ir, plan, dc, mess, hoerIndex};
  }

  _sendePlan(k, plan, hoerIndex, start) {
    const kennung = ++this.kennung;
    const puffer = [];
    for (let i = 0; i < 4; i++) {
      const rahmen = [];
      for (let c = 0; c < plan.P; c++) rahmen.push(new Float32Array(SCOPE_RAHMEN));
      if (rahmen.length) puffer.push(rahmen);
    }
    const transfer = [...planPuffer(plan)];
    for (const r of puffer) for (const a of r) transfer.push(a.buffer);
    k.port.postMessage({typ: 'plan', plan, hoerIndex, start, kennung, puffer}, transfer);
  }

  setzeQuelle(teil, typ, werte) {
    if (!this.knoten) return;
    let welle = null;
    if (typ === 'gen') welle = generatorWelle(werte);
    else if (typ === 'gate') welle = gateWelle(werte);
    else if (typ === 'cv') welle = {art: 'dc', v: werte.v};
    else if (typ === 'rausch') welle = {art: 'rauschen', rms: werte.rms, off: 0, rate: werte.rate, seed: werte.seed, dc: 0};
    if (welle) this.knoten.port.postMessage({typ: 'quelle', teil, welle});
  }

  taste(teil, an) { this.knoten?.port.postMessage({typ: 'taste', teil, an}); }

  stoppen() {
    this.aktiv = false;
    this.knoten?.port.postMessage({typ: 'stopp'});
  }
}
