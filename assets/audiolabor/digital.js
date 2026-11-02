/* Audiolabor: der Bereich „Digitale Module“. Hier hängen die Faust-Module, die Quelle für den digitalen Eingang und die Tastatur.
   Elektrisches Netz und Audiograph bleiben getrennt: Die Kette liegt hinter dem Hörpunkt, die Quelle vor einer gepufferten Grenze. */

import { FAUST_MODULE, faustLaden, faustUebersetzen, faustKnoten, faustRegler, faustRendern } from './faustmodule.js';
import { esc } from './hilfen.js';
import { komma } from './einheiten.js';

const EIGEN_START = `import("stdfaust.lib");
// Ein Eingang, ein Ausgang. Beispiel: Verzerrung mit Regler
drive = hslider("Antrieb", 0.4, 0, 1, 0.001) : si.smoo;
process = ef.cubicnl(drive, 0);`;

/* Tasten der Computertastatur: untere Reihe ab C4 */
const TASTEN = {a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, z: 68, h: 69, u: 70, j: 71, k: 72, o: 73, l: 74, p: 75};
const NAMEN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'H'];
const noteHz = n => 440 * 2 ** ((n - 69) / 12);

export class DigitalBereich {
  constructor(el, {monitor, live, host, status, aenderung}) {
    this.el = el;
    this.monitor = monitor;
    this.live = live;
    this.host = host;
    this.status = status;
    this.aenderung = aenderung;
    this.knoten = new Map();
    this.generatoren = new Map();
    this.quelle = null;
    this.datei = null;
    this.gedrueckt = new Set();
    this.midi = null;
    this.zeichne();
    el.addEventListener('click', e => this._klick(e));
    el.addEventListener('input', e => this._eingabe(e));
    el.addEventListener('change', e => this._geaendert(e));
    el.addEventListener('pointerdown', e => {
      const n = e.target.dataset?.note;
      if (n) { e.target.setPointerCapture(e.pointerId); this.noteAn(Number(n)); }
    });
    const los = e => { const n = e.target.dataset?.note; if (n) this.noteAus(Number(n)); };
    el.addEventListener('pointerup', los);
    el.addEventListener('pointercancel', los);
    window.addEventListener('keydown', e => this._taste(e, true));
    window.addEventListener('keyup', e => this._taste(e, false));
  }

  get d() {
    const p = this.host.projekt();
    if (!p.digital) p.digital = {kette: []};
    if (!p.digital.kette) p.digital.kette = [];
    return p.digital;
  }

  projektGeladen() {
    for (const k of this.knoten.values()) { try { k.node.disconnect(); } catch { /* frei */ } }
    this.knoten.clear();
    this.monitor.setzeKette([]);
    this.liveTrennen();
    this.zeichne();
    if (this.monitor.ctx && this.d.kette.length) this.bereitstellen();
  }

  /* ---------- Kette im Audiokontext ---------- */
  async _generator(code, name) {
    if (this.generatoren.has(code)) return this.generatoren.get(code);
    const {generator, uebersetzMs} = await faustUebersetzen(name, code);
    const e = {generator, uebersetzMs};
    this.generatoren.set(code, e);
    return e;
  }

  _codeVon(eintrag) {
    return eintrag.modul === 'eigen' ? eintrag.code : FAUST_MODULE[eintrag.modul]?.code;
  }

  /* Baut fehlende Knoten und verdrahtet die Kette neu. Muss nach einer Nutzeraktion laufen. */
  async bereitstellen() {
    const kette = this.d.kette;
    if (!kette.length && !this.knoten.size) return;
    await this.monitor.start();
    await faustLaden();
    for (const e of kette) {
      if (this.knoten.has(e.id)) continue;
      const code = this._codeVon(e);
      if (!code) continue;
      const {generator} = await this._generator(code, e.modul);
      const node = await faustKnoten(this.monitor.ctx, e.modul, generator);
      const regler = faustRegler(node);
      this.knoten.set(e.id, {node, regler, code});
      for (const r of regler) {
        const w = e.werte?.[r.pfad];
        if (w !== undefined) node.setParamValue(r.pfad, w);
      }
    }
    for (const id of [...this.knoten.keys()]) {
      if (!kette.find(e => e.id === id)) {
        try { this.knoten.get(id).node.disconnect(); } catch { /* frei */ }
        this.knoten.delete(id);
      }
    }
    const aktiv = kette.filter(e => e.an !== false && this.knoten.has(e.id)).map(e => {
      const k = this.knoten.get(e.id);
      return {eingang: k.node, ausgang: k.node};
    });
    for (const k of this.knoten.values()) { try { k.node.disconnect(); } catch { /* frei */ } }
    this.monitor.setzeKette(aktiv);
    this.zeichne();
  }

  /* ---------- Digitaler Eingang der Schaltung ---------- */
  _digitaleTeile(ir) {
    return ir.elemente.filter(e => e.welle?.art === 'digital');
  }

  async _quellEintrag() {
    const q = this.d.quelle || {modul: 'saege', werte: {}};
    const code = q.modul === 'eigen' ? q.code : FAUST_MODULE[q.modul]?.code;
    const {generator} = await this._generator(code, q.modul);
    return {q, generator};
  }

  /* Render: Das digitale Signal wird vorab zu Abtastwerten, die ngspice als PWL-Quelle bekommt. */
  async probenFuer(ir, dauer, fs) {
    const teile = this._digitaleTeile(ir);
    if (!teile.length) return null;
    const ergebnis = {};
    for (const e of teile) {
      const t = this.host.projekt().teile.find(x => x.id === e.teilQuelle);
      if (t?.werte.quelle === 'datei') {
        if (!this.datei) throw new Error(`${t.id}: Es ist noch keine Audiodatei geladen. Unter „Digitale Module“ wählen.`);
        ergebnis[e.welle.teil] = {werte: this.datei.puffer.getChannelData(0), rate: this.datei.puffer.sampleRate};
      } else {
        const {q, generator} = await this._quellEintrag();
        const pfade = {};
        const probe = await generator.createOfflineProcessor(fs, 256);
        const regler = faustRegler(probe);
        for (const r of regler) {
          if (q.werte?.[r.pfad] !== undefined) pfade[r.pfad] = q.werte[r.pfad];
          if (r.name === 'Dauerton') pfade[r.pfad] = 1;
        }
        /* Ein Faust-Knoten ohne Eingang rendert den Klang. Mit Eingang gäbe es keine Quelle. */
        ergebnis[e.welle.teil] = {werte: await faustRendern(generator, fs, Math.ceil(dauer * fs) + 1, pfade), rate: fs};
      }
    }
    return ergebnis;
  }

  /* Live: Das Modul hängt am Eingang des Live-Lösers, der Pegel folgt der festen Skala. */
  async liveVerbinden(ir) {
    const teile = this._digitaleTeile(ir);
    if (!teile.length) { this.liveTrennen(); return; }
    if (this.quelle) return;
    const erstes = this.host.projekt().teile.find(x => x.id === teile[0].teilQuelle);
    await this.monitor.start();
    if (erstes?.werte.quelle === 'datei') {
      if (!this.datei) { this.status(`${erstes.id}: Es ist noch keine Audiodatei geladen.`, true); return; }
      const s = this.monitor.ctx.createBufferSource();
      s.buffer = this.datei.puffer;
      s.loop = true;
      s.connect(this.live.eingang);
      s.start();
      this.quelle = {art: 'datei', node: s};
    } else {
      const {q, generator} = await this._quellEintrag();
      const node = await faustKnoten(this.monitor.ctx, q.modul, generator);
      const regler = faustRegler(node);
      for (const r of regler) { const w = q.werte?.[r.pfad]; if (w !== undefined) node.setParamValue(r.pfad, w); }
      node.connect(this.live.eingang);
      this.quelle = {art: 'faust', node, regler};
    }
    this.zeichne();
  }

  liveTrennen() {
    if (!this.quelle) return;
    try { if (this.quelle.art === 'datei') this.quelle.node.stop(); this.quelle.node.disconnect(); } catch { /* frei */ }
    this.quelle = null;
  }

  /* ---------- Tastatur und MIDI ---------- */
  _taste(e, an) {
    const z = e.target;
    if (z && (z.tagName === 'INPUT' || z.tagName === 'TEXTAREA' || z.tagName === 'SELECT')) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (this.el.hidden || !this.d.tastaturAn) return;
    const n = TASTEN[e.key];
    if (n === undefined) return;
    if (an) this.noteAn(n); else this.noteAus(n);
  }

  noteAn(n) {
    this.gedrueckt.add(n);
    this.el.querySelector(`[data-note="${n}"]`)?.classList.add('an');
    const hz = noteHz(n);
    const aus = this.d.tastaturAus || {};
    const live = this.live;
    if (!live.aktiv) { this.status('Die Tastatur spielt im Live-Betrieb.'); return; }
    for (const t of this.host.projekt().teile) {
      if (aus[t.id]) continue;
      if (t.typ === 'gen') live.setzeQuelle(t.id, 'gen', {...t.werte, f: hz});
      else if (t.typ === 'cv') live.setzeQuelle(t.id, 'cv', {...t.werte, v: Math.min(Math.max((n - 60) / 12, -8), 8)});
      else if (t.typ === 'gate') live.taste(t.id, true);
    }
    if (this.quelle?.art === 'faust') {
      for (const r of this.quelle.regler) {
        if (r.name === 'Frequenz') this.quelle.node.setParamValue(r.pfad, hz);
        if (r.name === 'Anschlag') this.quelle.node.setParamValue(r.pfad, 1);
      }
    }
  }

  noteAus(n) {
    this.gedrueckt.delete(n);
    this.el.querySelector(`[data-note="${n}"]`)?.classList.remove('an');
    if (this.gedrueckt.size) return;
    const aus = this.d.tastaturAus || {};
    if (!this.live.aktiv) return;
    for (const t of this.host.projekt().teile) {
      if (!aus[t.id] && t.typ === 'gate') this.live.taste(t.id, false);
    }
    if (this.quelle?.art === 'faust') for (const r of this.quelle.regler) if (r.name === 'Anschlag') this.quelle.node.setParamValue(r.pfad, 0);
  }

  async midiVerbinden() {
    if (!navigator.requestMIDIAccess) { this.status('Dieser Browser bietet kein Web MIDI an.', true); return; }
    try {
      const zugriff = await navigator.requestMIDIAccess();
      const verbinde = () => {
        let z = 0;
        for (const ein of zugriff.inputs.values()) {
          z++;
          ein.onmidimessage = m => {
            const [s, a, b] = m.data;
            const art = s & 0xf0;
            if (art === 0x90 && b > 0) this.noteAn(a);
            else if (art === 0x80 || (art === 0x90 && b === 0)) this.noteAus(a);
          };
        }
        this.midi = z;
        this.zeichne();
      };
      zugriff.onstatechange = verbinde;
      verbinde();
      this.status(`MIDI verbunden: ${this.midi} Eingänge.`);
    } catch (e) { this.status(`MIDI nicht verfügbar: ${e.message}`, true); }
  }

  async dateiLaden(datei) {
    await this.monitor.start();
    const roh = await datei.arrayBuffer();
    const puffer = await this.monitor.ctx.decodeAudioData(roh);
    this.datei = {name: datei.name, puffer};
    this.status(`Audiodatei geladen: ${datei.name}, ${komma(puffer.duration.toFixed(1))} s, ${puffer.sampleRate} Hz. Für den Renderbetrieb wird sie auf die Rechendauer gekürzt; die Datei selbst wird nicht im Projekt gespeichert.`);
    this.zeichne();
    this.liveTrennen();
    this.aenderung();
  }

  /* ---------- Oberfläche ---------- */
  _reglerHtml(id, r, wert, gruppe) {
    if (r.typ === 'button') return `<button type="button" data-${gruppe}-knopf="${esc(id)}" data-pfad="${esc(r.pfad)}">${esc(r.name)}</button>`;
    if (r.typ === 'checkbox') return `<label class="al-haken"><input type="checkbox" data-${gruppe}="${esc(id)}" data-pfad="${esc(r.pfad)}"${wert ? ' checked' : ''}> ${esc(r.name)}</label>`;
    const s = Number(r.schritt) || (r.max - r.min) / 200;
    return `<label><span>${esc(r.name)}</span><output>${komma(Number(wert).toPrecision(3))}${r.einheit ? ` ${esc(r.einheit)}` : ''}</output><input type="range" data-${gruppe}="${esc(id)}" data-pfad="${esc(r.pfad)}" min="${r.min}" max="${r.max}" step="${s}" value="${wert}"></label>`;
  }

  zeichne() {
    const d = this.d;
    const effekte = Object.entries(FAUST_MODULE).filter(([, m]) => m.art === 'effekt');
    const quellen = Object.entries(FAUST_MODULE).filter(([, m]) => m.art === 'quelle');
    const bedarf = this.host.projekt().teile.filter(t => t.typ === 'audioein');
    let html = `<p>Faust-Module sind digitale Signalverarbeitung, keine Bauteile. Die Kette liegt hinter dem Hörpunkt: Schaltung → Kette → Monitor. Der digitale Eingang führt ein Modul über eine gepufferte Quelle in die Schaltung. Die Messgeräte lesen weiter die Schaltung selbst.</p>`;
    html += `<div class="al-digital-kopf"><span class="eyebrow">Kette hinter dem Hörpunkt</span><label class="al-feld">Effekt <select class="al-eingabe" id="al-d-effekt">${effekte.map(([k, m]) => `<option value="${k}">${esc(m.name)}</option>`).join('')}</select></label><button type="button" data-tu="effekt">+ Einsetzen</button></div>`;
    html += '<div class="al-kette">';
    if (!d.kette.length) html += '<p class="al-klein">Noch kein Modul. Die Schaltung geht direkt zum Monitor.</p>';
    d.kette.forEach((e, i) => {
      const m = e.modul === 'eigen' ? {name: e.name || 'Eigener Faust-Code', text: 'Eigener Code'} : FAUST_MODULE[e.modul];
      const k = this.knoten.get(e.id);
      if (i > 0) html += '<span class="al-pfeil" aria-hidden="true">→</span>';
      html += `<div class="al-modul${e.an === false ? ' aus' : ''}"><h4>${esc(m?.name || e.modul)}</h4><div class="al-klein">digital · ${esc(m?.text || '')}</div>`;
      if (k) html += k.regler.map(r => this._reglerHtml(e.id, r, e.werte?.[r.pfad] ?? r.def, 'modul')).join('');
      else html += '<div class="al-klein">Wird beim ersten Abspielen übersetzt.</div>';
      html += `<div class="al-kopfaktionen"><button type="button" data-modul-an="${esc(e.id)}">${e.an === false ? 'Einschalten' : 'Umgehen'}</button><button type="button" data-modul-links="${esc(e.id)}">←</button><button type="button" data-modul-rechts="${esc(e.id)}">→</button><button type="button" data-modul-weg="${esc(e.id)}">Entfernen</button></div></div>`;
    });
    html += '</div>';

    const qm = d.quelle?.modul || 'saege';
    html += `<div class="al-digital-kopf" style="margin-top:14px"><span class="eyebrow">Quelle für den digitalen Eingang</span>`;
    html += bedarf.length ? `<span class="al-klein">genutzt von ${bedarf.map(t => esc(t.id)).join(', ')}</span>` : '<span class="al-klein">Setze das Bauteil „Digitaler Eingang“ in die Schaltung, um sie zu nutzen.</span>';
    html += `<label class="al-feld">Faust <select class="al-eingabe" id="al-d-quelle">${quellen.map(([k, m]) => `<option value="${k}"${k === qm ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>`;
    html += `<button type="button" data-tu="datei">Audiodatei wählen</button><input type="file" id="al-d-datei" accept="audio/*" hidden>${this.datei ? `<span class="al-klein">${esc(this.datei.name)}</span>` : ''}</div>`;
    if (this.quelle?.art === 'faust') {
      html += `<div class="al-kette"><div class="al-modul"><h4>${esc(FAUST_MODULE[qm]?.name)}</h4><div class="al-klein">digital · läuft live</div>${this.quelle.regler.map(r => this._reglerHtml('quelle', r, d.quelle?.werte?.[r.pfad] ?? r.def, 'quelle')).join('')}</div></div>`;
    }

    html += `<details class="al-log" style="margin-top:12px"><summary>Eigener Faust-Code</summary><textarea class="al-faustcode" id="al-d-code" spellcheck="false">${esc(d.eigenCode || EIGEN_START)}</textarea><div class="al-digital-kopf" style="margin-top:6px"><button type="button" data-tu="eigen">Übersetzen und einsetzen</button><span class="al-klein" id="al-d-faustmeldung"></span></div></details>`;

    /* Tastatur */
    const lauf = [];
    for (let n = 60; n <= 75; n++) {
      const name = NAMEN[n % 12];
      lauf.push(`<button type="button" data-note="${n}" class="${name.includes('♯') ? 'schwarz' : ''}${this.gedrueckt.has(n) ? ' an' : ''}" aria-label="${esc(name)}">${esc(name)}</button>`);
    }
    const ziele = this.host.projekt().teile.filter(t => ['gen', 'cv', 'gate'].includes(t.typ));
    const aus = d.tastaturAus || {};
    html += `<div class="al-digital-kopf" style="margin-top:14px"><span class="eyebrow">Spielen (live)</span><label class="al-haken"><input type="checkbox" id="al-d-tasten"${d.tastaturAn ? ' checked' : ''}> Computertastatur (A W S E D F …)</label><button type="button" data-tu="midi">MIDI verbinden${this.midi !== null ? ` (${this.midi})` : ''}</button></div>`;
    html += `<div class="al-digital-kopf">${ziele.length ? ziele.map(t => `<label class="al-haken"><input type="checkbox" data-ziel="${esc(t.id)}"${aus[t.id] ? '' : ' checked'}> ${esc(t.id)}${t.typ === 'cv' ? ' (1 V/Oktave, C4 = 0 V)' : t.typ === 'gen' ? ' (Frequenz)' : ' (Auslösen)'}</label>`).join('') : '<span class="al-klein">Generator, Steuerquelle oder Gate in die Schaltung setzen: Die Tasten steuern sie.</span>'}</div>`;
    html += `<div class="al-tasten">${lauf.join('')}</div>`;

    const offen = this.el.querySelector('details')?.open;
    this.el.innerHTML = html;
    if (offen) this.el.querySelector('details').open = true;
  }

  async _klick(e) {
    const q = e.target;
    const tu = q.dataset?.tu;
    if (tu === 'effekt') {
      const modul = this.el.querySelector('#al-d-effekt').value;
      const id = `F${Date.now().toString(36)}`;
      this.d.kette.push({id, modul, an: true, werte: {}});
      await this._nachKette(`${FAUST_MODULE[modul].name} eingesetzt.`);
    } else if (tu === 'datei') {
      this.el.querySelector('#al-d-datei').click();
    } else if (tu === 'midi') {
      this.midiVerbinden();
    } else if (tu === 'eigen') {
      const code = this.el.querySelector('#al-d-code').value;
      const m = this.el.querySelector('#al-d-faustmeldung');
      this.d.eigenCode = code;
      m.textContent = 'Übersetze …';
      try {
        const {uebersetzMs} = await faustUebersetzen('eigen', code);
        this.generatoren.delete(code);
        this.d.kette.push({id: `F${Date.now().toString(36)}`, modul: 'eigen', code, name: 'Eigener Faust-Code', an: true, werte: {}});
        await this._nachKette(`Eigener Code übersetzt in ${Math.round(uebersetzMs)} ms.`);
      } catch (err) {
        m.textContent = err.message;
      }
    }
    const an = q.dataset?.modulAn, links = q.dataset?.modulLinks, rechts = q.dataset?.modulRechts, weg = q.dataset?.modulWeg;
    const k = this.d.kette;
    if (an) { const x = k.find(y => y.id === an); x.an = x.an === false; await this._nachKette(); }
    if (links || rechts) {
      const i = k.findIndex(y => y.id === (links || rechts));
      const j = links ? i - 1 : i + 1;
      if (j >= 0 && j < k.length) { [k[i], k[j]] = [k[j], k[i]]; await this._nachKette(); }
    }
    if (weg) { k.splice(k.findIndex(y => y.id === weg), 1); await this._nachKette('Modul entfernt.'); }
    if (q.dataset?.modulKnopf || q.dataset?.quelleKnopf) {
      /* Faust-Knopf: kurz drücken */
      const id = q.dataset.modulKnopf || q.dataset.quelleKnopf;
      const node = id === 'quelle' ? this.quelle?.node : this.knoten.get(id)?.node;
      if (node) { node.setParamValue(q.dataset.pfad, 1); setTimeout(() => node.setParamValue(q.dataset.pfad, 0), 60); }
    }
  }

  async _nachKette(text) {
    try {
      await this.bereitstellen();
      this.zeichne();
      if (text) this.status(text);
      this.aenderung();
    } catch (e) { this.status(`Faust: ${e.message}`, true); }
  }

  _eingabe(e) {
    const q = e.target;
    const id = q.dataset?.modul, qu = q.dataset?.quelle;
    if (!id && !qu) return;
    const wert = q.type === 'checkbox' ? (q.checked ? 1 : 0) : Number(q.value);
    if (id) {
      const eintrag = this.d.kette.find(x => x.id === id);
      (eintrag.werte ||= {})[q.dataset.pfad] = wert;
      this.knoten.get(id)?.node.setParamValue(q.dataset.pfad, wert);
    } else {
      const dq = (this.d.quelle ||= {modul: 'saege', werte: {}});
      (dq.werte ||= {})[q.dataset.pfad] = wert;
      this.quelle?.node?.setParamValue?.(q.dataset.pfad, wert);
    }
    const o = q.parentElement?.querySelector('output');
    if (o) o.textContent = komma(wert.toPrecision(3));
  }

  _geaendert(e) {
    const q = e.target;
    if (q.id === 'al-d-quelle') {
      this.d.quelle = {modul: q.value, werte: {}};
      this.liveTrennen();
      this.aenderung();
      this.zeichne();
    } else if (q.id === 'al-d-datei') {
      if (q.files?.[0]) this.dateiLaden(q.files[0]).catch(err => this.status(`Audiodatei nicht lesbar: ${err.message}`, true));
    } else if (q.id === 'al-d-tasten') {
      this.d.tastaturAn = q.checked;
    } else if (q.dataset?.ziel) {
      (this.d.tastaturAus ||= {})[q.dataset.ziel] = !q.checked;
    }
  }
}
