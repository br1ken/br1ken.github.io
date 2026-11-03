/* Audiolabor: die Seite. Hält das Projekt, verbindet Editor, ngspice, Live-Löser, Messgeräte und Monitorweg.
   Es gibt eine Schaltung: Alles, was gezeichnet, gemessen oder gehört wird, entsteht aus demselben Projekt über netz.js. */

import { BAUTEILE, GRUPPEN, standardWerte } from './bauteile.js';
import { leseWert, fmtWert, fmtMess, komma, naechsterNormwert } from './einheiten.js';
import { leeresProjekt, zuDatei, ausDatei } from './aufbau.js?v=3';
import { baueSchaltung, netlistUnterschied } from './netz.js';
import { spiceText, speicherListe, spiceName } from './netlist.js';
import { Spice, spalte } from './spice.js';
import { frequenzgang, grenzfrequenz, grenzfrequenzUnten, verlaufArt, zuAudio, wavFloat32, wertBei } from './messung.js';
import { Monitorweg } from './klang.js?v=2';
import { LiveBetrieb } from './live.js';
import { Schaltplan } from './editor.js';
import { Oszilloskop, Spektrum, Bode, KANAL_FARBEN, ZEIT_STUFEN } from './geraete.js';
import { VERSUCHE, versuchFinden } from './versuche.js';
import { DigitalBereich } from './digital.js';
import { Steckbrett } from './steckbrett.js';
import { ERKLAERUNG, arbeitspunktVon, regionBJT, kennwerte, wirkungAnSonden, wirkungAnFrequenz } from './lehre.js';
import { $, $$, esc, speichereDatei, dateiName, verzoegert, packe, entpacke } from './hilfen.js';

const SPEICHER = 'osci-log-audiolabor-v1';

const LEXIKON_NAMEN = {
  'spannungsteiler': 'Spannungsteiler', 'reihe-parallel': 'Reihe und parallel', 'tiefpass': 'Tiefpass', 'hochpass': 'Hochpass', 'kapazitaet': 'Kapazität', 'induktivitaet': 'Induktivität',
  'zeitkonstante': 'Zeitkonstante', 'bode-diagramm': 'Bode-Diagramm', 'resonanz': 'Resonanz', 'diode': 'Diode', 'verzerrung': 'Verzerrung', 'obertoene': 'Obertöne',
  'transistor': 'Transistor', 'arbeitspunkt': 'Arbeitspunkt', 'opv': 'Operationsverstärker', 'filter': 'Filter', 'oszillator': 'Oszillator',
  'ohmsches-gesetz': 'Ohmsches Gesetz', 'leistung': 'Leistung', 'mittelwert': 'Mittelwert', 'huellkurve': 'Hüllkurve', 'tremolo': 'Tremolo'
};

const spice = new Spice({fristMs: 180000});
const monitor = new Monitorweg();
const live = new LiveBetrieb(monitor);

const S = {
  projekt: leeresProjekt(),
  vergangen: [],
  zukunft: [],
  modus: 'render',
  rechnet: false,
  nochmal: false,
  letzteDauerMs: 0,
  audio: null,
  audioFs: 48000,
  spielt: false,
  stale: true,
  netlistAktuell: '',
  netlistVorher: '',
  ir: null,
  ansicht: 'plan',
  geraet: 'oszilloskop',
  versuch: null,
  liveSoll: false,
  liveBeginn: false,
  ueberlastZaehler: 0,
  aufnahme: false,
  ladung: 0,
  stand: 0,
  opStand: null,
  bodeStand: null,
  messVorher: null,
  letzteAenderung: '',
  wirkung: {verglichen: false, nach: '', sonden: '', fc: ''},
  geschafft: new Set(),
  tipp: null,
  brettGeoeffnet: false,
  wertVorher: null,
  spitzeHalt: 0,
  spitzeZeit: 0,
  clipHalt: 0
};

/* ---------- Host für den Editor ---------- */
const host = {
  projekt: () => S.projekt,
  schnappschuss: () => JSON.stringify(S.projekt),
  mutiere(text, fn) {
    const vorher = JSON.stringify(S.projekt);
    fn(S.projekt);
    host.uebernimm(text, vorher);
  },
  uebernimm(text, vorher) {
    if (vorher === JSON.stringify(S.projekt)) { zeichneFlaeche(); return; }
    S.vergangen.push(vorher);
    if (S.vergangen.length > 200) S.vergangen.shift();
    S.zukunft.length = 0;
    nachAenderung(text);
  },
  zurueckZu(schnapp) { S.projekt = JSON.parse(schnapp); zeichneFlaeche(); },
  rueckgaengig() {
    if (!S.vergangen.length) return;
    S.zukunft.push(JSON.stringify(S.projekt));
    S.projekt = JSON.parse(S.vergangen.pop());
    nachAenderung('Rückgängig');
  },
  wiederholen() {
    if (!S.zukunft.length) return;
    S.vergangen.push(JSON.stringify(S.projekt));
    S.projekt = JSON.parse(S.zukunft.pop());
    nachAenderung('Wiederholt');
  },
  aktiv: () => S.ansicht === 'plan',
  auswahlGeaendert() { zeigeEigenschaften(); pruefeSchritte(); },
  werkzeugGeaendert(w) {
    $$('.al-b').forEach(b => b.setAttribute('aria-pressed', String(w?.art === 'einsetzen' && w.typ === b.dataset.typ)));
    hinweis();
  },
  hover(netz, zeiger) { hinweis(netz); zeigeTipp(netz, zeiger); },
  meldung(text) { status(text); },
  zoomGeaendert(z) { $('#al-zoom').textContent = `${Math.round(z * 100)} %`; }
};

const plan = new Schaltplan($('#al-plan'), host);
const oszi = new Oszilloskop($('#al-oszi'), {beiMessung: zeigeMesswerte});
const spek = new Spektrum($('#al-spektrum'));
const bode = new Bode($('#al-bode'));
const digital = new DigitalBereich($('#al-digital'), {monitor, live, host, status: t => status(t), aenderung: () => nachDigitalAenderung()});
const brett = new Steckbrett($('#al-brett'), host, {plan, status: t => status(t)});

function zeichneFlaeche() {
  plan.zeichne();
  if (S.ansicht === 'brett') brett.zeichne();
}

/* ---------- Status ---------- */
function status(text, fehler = false) {
  const el = $('#al-status');
  el.textContent = text || '';
  el.classList.toggle('al-status-fehler', !!fehler);
}

/* Multimeter am Zeiger: Spannung des Netzes am Arbeitspunkt. Der Arbeitspunkt wird beim ersten Hinzeigen gerechnet. */
function zeigeTipp(netz, zeiger) {
  const el = $('#al-tipp');
  const neu = netz !== S.tipp?.netz;
  S.tipp = netz && zeiger ? {netz, clientX: zeiger.clientX, clientY: zeiger.clientY} : null;
  if (!S.tipp) { el.hidden = true; return; }
  if (!S.opStand) {
    el.hidden = true;
    if (neu) opHolen().then(() => { if (S.tipp) zeigeTipp(S.tipp.netz, S.tipp); }, () => {});
    return;
  }
  const v = netz === '0' ? 0 : S.opStand.wert(`v(${netz})`);
  el.hidden = v === undefined;
  if (v === undefined) return;
  el.textContent = fmtMess(v, 'V', 4);
  const r = el.parentElement.getBoundingClientRect();
  el.style.left = `${Math.min(zeiger.clientX - r.left + 14, r.width - el.offsetWidth - 4)}px`;
  el.style.top = `${Math.max(zeiger.clientY - r.top - 24, 4)}px`;
}

function hinweis(netz) {
  const w = plan.werkzeug;
  const el = $('#al-hinweis');
  if (w?.art === 'einsetzen') el.textContent = 'Klicken setzt das Bauteil. R dreht, M spiegelt, Esc bricht ab, Umschalt setzt mehrere. Auf einem Draht wird es eingeschleift.';
  else if (w?.art === 'draht') el.textContent = 'Klick auf Pin oder Draht verbindet, Klick ins Leere setzt eine Ecke. Esc bricht ab.';
  else if (netz) {
    const n = plan.netze?.netze.get(netz);
    const spannung = S.opStand && netz !== '0' ? S.opStand.wert(`v(${netz})`) : undefined;
    el.textContent = `Netz ${netz === '0' ? '0 (Masse)' : netz}${n ? ` · ${n.pins.length} Anschlüsse` : ''}${spannung !== undefined ? ` · ${fmtMess(spannung, 'V', 4)} am Arbeitspunkt` : ''}`;
  } else el.textContent = 'Von Pin zu Pin ziehen verbindet. Draht antippen: messen, hören, umstecken.';
}

/* ---------- Nach jeder Änderung ---------- */
const speichernSpaeter = verzoegert(() => {
  try { localStorage.setItem(SPEICHER, JSON.stringify({...zuDatei(S.projekt), versuch: S.versuch})); } catch { /* egal */ }
}, 400);

const autoRechnen = verzoegert(() => {
  if (S.modus !== 'render') return;
  if (S.geraet === 'frequenzgang') rechneBode();
  else if (S.geraet === 'arbeitspunkt') rechneOp();
  if ($('#al-auto').checked && S.letzteDauerMs < 6000) berechne({auto: true});
  else markiereVeraltet();
}, 280);

function nachAenderung(text) {
  S.stand++;
  plan.auswahlPruefen();
  plan.spannungen.clear();
  S.opStand = null;
  S.letzteAenderung = text;
  zeichneFlaeche();
  zeigeEigenschaften();
  zeigeQuellen();
  zeigeModelle();
  $('#al-undo').disabled = !S.vergangen.length;
  $('#al-redo').disabled = !S.zukunft.length;
  $('#al-name').value = S.projekt.titel;
  S.stale = true;
  speichernSpaeter();
  if (text) status(text);
  S.ir = baueSchaltung(S.projekt, {ziel: S.modus === 'live' ? 'live' : 'spice'});
  zeigeMeldungen(S.ir);
  pruefeSchritte();
  if (S.modus === 'live') liveAktualisieren();
  else autoRechnen();
}

function nachDigitalAenderung() {
  speichernSpaeter();
  S.stale = true;
  if (S.modus === 'render') autoRechnen();
}

function markiereVeraltet() {
  if (S.stale) status('Die Schaltung wurde geändert. Mit „Berechnen“ aktualisieren.');
}

/* ---------- Meldungen ---------- */
function zeigeMeldungen(ir, zusatz = []) {
  const alle = [...(ir?.meldungen || []), ...zusatz];
  const liste = $('#al-meldungen');
  liste.innerHTML = alle.length
    ? alle.map(m => `<li class="${esc(m.art)}">${esc(m.text)}</li>`).join('')
    : '<li>Keine Meldungen zu dieser Schaltung.</li>';
  const wichtig = alle.filter(m => m.art === 'fehler' || m.art === 'warnung').length;
  $('#al-meld-zahl').textContent = wichtig ? `(${wichtig})` : '';
  const f = alle.find(m => m.art === 'fehler');
  if (f) status(f.text, true);
}

/* ---------- Bauteilliste ---------- */
function zeigeBauteile() {
  const el = $('#al-bauteile');
  let html = '';
  for (const [g, name] of GRUPPEN) {
    html += `<h4>${esc(name)}</h4>`;
    for (const [typ, def] of Object.entries(BAUTEILE)) {
      if (def.gruppe !== g) continue;
      const t = {id: '', typ, x: 0, y: 0, werte: standardWerte(typ)};
      const xs = def.pins.map(p => p.x), ys = def.pins.map(p => p.y);
      const b = Math.max(84, Math.max(...xs) - Math.min(...xs) + 16), h = Math.max(50, Math.max(...ys) - Math.min(...ys) + 16);
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
      html += `<button type="button" class="al-b" data-typ="${typ}" aria-pressed="false" title="${esc(def.name)}"><svg viewBox="${cx - b / 2} ${cy - h / 2} ${b} ${h}" aria-hidden="true">${def.zeichen(t)}</svg><span>${esc(def.kurz)}</span></button>`;
    }
  }
  el.innerHTML = html;
  /* Bauteil nehmen: auf die Fläche ziehen oder antippen und dann auf die Fläche klicken */
  el.addEventListener('pointerdown', e => {
    const b = e.target.closest('.al-b');
    if (!b || e.button !== 0) return;
    e.preventDefault();
    const ziel = S.ansicht === 'brett' ? brett : plan;
    const lief = ziel.werkzeug?.art === 'einsetzen' && ziel.werkzeug.typ === b.dataset.typ;
    ziel.setzeWerkzeug(lief ? null : 'einsetzen', b.dataset.typ);
    if (lief) return;
    const sx = e.clientX, sy = e.clientY;
    let gezogen = false;
    const bewegt = ev => {
      if (!gezogen && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
      gezogen = true;
      ziel.ziehVonListe(ev.clientX, ev.clientY);
    };
    const hoch = ev => {
      window.removeEventListener('pointermove', bewegt);
      window.removeEventListener('pointerup', hoch);
      if (gezogen) ziel.loslassenVonListe(ev.clientX, ev.clientY);
    };
    window.addEventListener('pointermove', bewegt);
    window.addEventListener('pointerup', hoch);
  });
}

/* ---------- Eigenschaften ---------- */
function ausgewaehlt() {
  if (plan.auswahl.teile.size !== 1) return null;
  const id = [...plan.auswahl.teile][0];
  return S.projekt.teile.find(t => t.id === id) || null;
}

function modellBlock(t) {
  const def = BAUTEILE[t.typ];
  const m = def.modell(t);
  const art = {ideal: 'ideal', hersteller: 'Herstellermodell', generisch: 'generisch', naeherung: 'Näherung', endlich: 'endlich', grenze: 'digitale Grenze'}[m.art] || m.art;
  return `<div class="al-modell"><span class="al-art ${esc(m.art)}">${esc(art)}</span>${esc(m.name)}<br>${esc(m.text)}<br>Version: ${esc(m.version)}${m.quelle ? `<br><a href="${esc(m.quelle)}" target="_blank" rel="noopener">Quelle ↗</a>` : ''}</div>`;
}

function wertFeld(t, p) {
  const v = t.werte[p.key];
  const id = `al-w-${p.key}`;
  if (p.nurWenn && !p.nurWenn(t.werte)) return '';
  let feld = '';
  if (p.typ === 'wahl') {
    feld = `<select id="${id}" class="al-eingabe" data-wert="${p.key}">${p.optionen.map(([w, n]) => `<option value="${esc(w)}"${w === v ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  } else if (p.typ === 'schalter') {
    feld = `<input id="${id}" type="checkbox" data-wert="${p.key}"${v ? ' checked' : ''}>`;
  } else if (p.typ === 'text') {
    feld = `<input id="${id}" type="text" class="al-eingabe" data-wert="${p.key}" value="${esc(v)}" maxlength="24" autocomplete="off" spellcheck="false">`;
  } else {
    feld = `<input id="${id}" type="text" inputmode="decimal" class="al-eingabe" data-wert="${p.key}" value="${esc(fmtWert(v, p.einheit))}" autocomplete="off" spellcheck="false">`;
    if (p.regler) {
      const log = p.regler === 'log';
      const mi = log ? Math.log10(p.min) : p.min, ma = log ? Math.log10(p.max) : p.max;
      const w = log ? Math.log10(v) : v;
      feld += `<input type="range" data-regler="${p.key}" min="${mi}" max="${ma}" step="${(ma - mi) / 400}" value="${w}" aria-label="${esc(p.label)}">`;
    }
  }
  const hilfe = p.hilfe ? `<span class="al-klein">${esc(p.hilfe)}</span>` : '';
  return `<div class="al-wert"><label for="${id}">${esc(p.label)}</label>${feld}${hilfe}</div>`;
}

function zeigeEigenschaften() {
  const el = $('#al-eigenschaften');
  const t = ausgewaehlt();
  const zahlT = plan.auswahl.teile.size, zahlD = plan.auswahl.draehte.size;
  if (!t) {
    if (zahlT + zahlD > 0) {
      if (zahlT === 0 && zahlD === 1) {
        el.innerHTML = '<h3>Draht</h3><p class="al-leer">An den Griffen umstecken, ins Leere ziehen zieht ihn ab. Das Stück dazwischen lässt sich verschieben. Die Knöpfe am Draht messen oder hören genau an dieser Stelle.</p>';
      } else {
        el.innerHTML = `<h3>${zahlT + zahlD} Elemente ausgewählt</h3><p class="al-leer">${zahlT} Bauteile, ${zahlD} Drähte. R dreht, Entf löscht, Strg/⌘ + C kopiert.</p>`;
      }
    } else {
      el.innerHTML = `<h3>Eigenschaften</h3><div class="al-leer">Wähle ein Bauteil aus, um Werte und Modell zu sehen.<ul><li>Zeig auf einen Draht: Das Multimeter sagt die Spannung.</li><li><kbd>R</kbd> drehen · <kbd>M</kbd> spiegeln · <kbd>Entf</kbd> löschen · <kbd>⌘Z</kbd> zurück</li><li>Mausrad verschiebt, <kbd>⌘</kbd> + Mausrad zoomt</li><li>Werte: <kbd>4k7</kbd>, <kbd>100n</kbd>, <kbd>2u2</kbd>; ↑↓ gehen die E24-Reihe durch</li></ul></div>`;
    }
    return;
  }
  const def = BAUTEILE[t.typ];
  const lehre = ERKLAERUNG[t.typ];
  el.innerHTML = `<h3>${esc(t.id)}</h3><div class="al-unterzeile">${esc(def.name)}</div>`
    + `<p class="al-lehre">${esc(lehre.was)} <button type="button" class="al-lex" data-lex="${esc(lehre.lex)}">Lexikon</button></p>`
    + def.werte.map(p => wertFeld(t, p)).join('')
    + `<div class="al-teilwerte" id="al-teilwerte"></div>`
    + modellBlock(t)
    + `<div class="al-aktionen"><button type="button" data-tu="drehen">Drehen</button><button type="button" data-tu="spiegeln">Spiegeln</button><button type="button" data-tu="loeschen">Löschen</button></div>`;
  zeigeTeilwerte(t);
}

/* Spannungen an den Pins und Betriebsdaten, sobald der Arbeitspunkt vorliegt */
async function zeigeTeilwerte(t) {
  const def = BAUTEILE[t.typ];
  const zeichne = op => {
    const el = $('#al-teilwerte');
    if (!el || ausgewaehlt() !== t) return;
    const pins = def.pins.map(pin => {
      const netz = plan.netze?.pinNetz.get(`${t.id}.${pin.id}`);
      const name = netz === '0' ? 'Masse' : netz ?? '';
      const v = op && netz !== '0' ? op.wert(`v(${netz})`) : netz === '0' ? 0 : undefined;
      return `<tr><td>${esc(pin.name || pin.id)}</td><td>${esc(name)}</td><td>${v !== undefined ? fmtMess(v, 'V', 4) : ''}</td></tr>`;
    }).join('');
    const a = op ? arbeitspunktVon(t, op.ir, op) : {zeilen: [], zustand: ''};
    el.innerHTML = (op ? '<p class="al-teilwerte-kopf">Am Arbeitspunkt, also nur die Gleichanteile</p>' : '')
      + `<table class="al-werte"><tr><th>Pin</th><th>Netz</th><th>${op ? 'Spannung' : ''}</th></tr>${pins}</table>`
      + (a.zeilen.length ? `<div class="al-kennwerte">${a.zeilen.map(([n, w]) => `<span><i>${esc(n)}</i> ${esc(w)}</span>`).join('')}</div>` : '')
      + (a.zustand ? `<p class="al-zustand">${esc(a.zustand)}</p>` : '');
  };
  zeichne(S.opStand);
  if (S.opStand) return;
  try { zeichne(await opHolen()); } catch { /* Ohne Arbeitspunkt bleibt die Tabelle ohne Spannungen. */ }
}

function setzeWert(t, p, wert, {endgueltig = false} = {}) {
  if (!S.wertVorher) S.wertVorher = JSON.stringify(S.projekt);
  t.werte[p.key] = wert;
  const nurQuelle = p.liveQuelle && S.modus === 'live' && live.aktiv;
  if (S.modus === 'live' && live.aktiv) {
    if (nurQuelle) live.setzeQuelle(t.id, t.typ, t.werte);
    else liveAktualisierenSofort();
  }
  plan.zeichne();
  if (endgueltig) {
    const vorher = S.wertVorher;
    S.wertVorher = null;
    host.uebernimm(`${t.id}: ${p.label} = ${p.typ === 'zahl' ? fmtWert(wert, p.einheit) : wert}`, vorher);
  }
}

function verbindeWertfelder(el, teilVon) {
  el.addEventListener('input', e => {
    const q = e.target;
    const t = teilVon(q);
    if (!t) return;
    if (q.dataset.regler) {
      const p = BAUTEILE[t.typ].werte.find(x => x.key === q.dataset.regler);
      let w = Number(q.value);
      if (p.regler === 'log') w = Number((10 ** w).toPrecision(5));
      else w = Number(w.toPrecision(5));
      setzeWert(t, p, w);
      const textfeld = el.querySelector(`[data-teil-feld="${t.id}"][data-wert="${p.key}"]`) || (el === $('#al-eigenschaften') ? el.querySelector(`[data-wert="${p.key}"]`) : null);
      if (textfeld) textfeld.value = fmtWert(w, p.einheit);
    }
  });
  el.addEventListener('change', e => {
    const q = e.target;
    const t = teilVon(q);
    if (!t) return;
    if (q.dataset.regler) {
      const p = BAUTEILE[t.typ].werte.find(x => x.key === q.dataset.regler);
      setzeWert(t, p, t.werte[p.key], {endgueltig: true});
      return;
    }
    if (!q.dataset.wert) return;
    const p = BAUTEILE[t.typ].werte.find(x => x.key === q.dataset.wert);
    if (p.typ === 'wahl') { setzeWert(t, p, q.value, {endgueltig: true}); return; }
    if (p.typ === 'schalter') { setzeWert(t, p, q.checked, {endgueltig: true}); return; }
    if (p.typ === 'text') { setzeWert(t, p, q.value.trim() || p.def, {endgueltig: true}); return; }
    const w = leseWert(q.value);
    if (w === null || (p.min !== undefined && w < p.min) || (p.max !== undefined && w > p.max)) {
      q.classList.add('falsch');
      status(`${p.label}: „${q.value}“ geht nicht.${p.min !== undefined ? ` Erlaubt ${fmtWert(p.min, p.einheit)} bis ${fmtWert(p.max, p.einheit)}.` : ''}`, true);
      return;
    }
    q.classList.remove('falsch');
    setzeWert(t, p, p.ganz ? Math.round(w) : w, {endgueltig: true});
  });
  el.addEventListener('keydown', e => {
    const q = e.target;
    if (!q.dataset?.wert || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    const t = teilVon(q);
    if (!t) return;
    const p = BAUTEILE[t.typ].werte.find(x => x.key === q.dataset.wert);
    if (p.typ !== 'zahl') return;
    e.preventDefault();
    const r = e.key === 'ArrowUp' ? 1 : -1;
    const v = t.werte[p.key];
    let n;
    if (p.reihe || (v > 0 && p.einheit !== '%' && !p.regler)) n = naechsterNormwert(v, r);
    else n = Number((v + r * (p.max - p.min) / 100).toPrecision(6));
    n = Math.min(Math.max(n, p.min), p.max);
    q.value = fmtWert(n, p.einheit);
    setzeWert(t, p, n, {endgueltig: true});
  });
}

/* ---------- Quellenleiste ---------- */
function quellenFelder(t, schluessel) {
  const def = BAUTEILE[t.typ];
  return schluessel.map(key => {
    const p = def.werte.find(x => x.key === key);
    if (!p || (p.nurWenn && !p.nurWenn(t.werte))) return '';
    if (p.typ === 'wahl') {
      return `<label class="al-feld">${esc(p.label)} <select class="al-eingabe" data-teil-feld="${esc(t.id)}" data-wert="${key}">${p.optionen.map(([w, n]) => `<option value="${esc(w)}"${w === t.werte[key] ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
    }
    let s = `<label class="al-feld">${esc(p.label)} <input class="al-eingabe al-kurz" data-teil-feld="${esc(t.id)}" data-wert="${key}" value="${esc(fmtWert(t.werte[key], p.einheit))}" autocomplete="off" spellcheck="false"></label>`;
    if (p.regler) {
      const log = p.regler === 'log';
      const mi = log ? Math.log10(p.min) : p.min, ma = log ? Math.log10(p.max) : p.max;
      s += `<input type="range" data-teil-feld="${esc(t.id)}" data-regler="${key}" min="${mi}" max="${ma}" step="${(ma - mi) / 400}" value="${log ? Math.log10(t.werte[key]) : t.werte[key]}" aria-label="${esc(t.id)} ${esc(p.label)}">`;
    }
    return s;
  }).join('');
}

function zeigeQuellen() {
  const el = $('#al-quellen');
  const felder = {gen: ['form', 'f', 'amp', 'off', 'tast'], cv: ['v'], gate: ['modus', 'ausloesung', 'hoch', 'per'], rausch: ['rms'], v: ['v'], audioein: ['quelle']};
  let html = '';
  for (const t of S.projekt.teile) {
    if (!felder[t.typ]) continue;
    html += `<div class="al-quelle"><b>${esc(t.id)}</b>${quellenFelder(t, felder[t.typ])}`;
    if (t.typ === 'gate') html += `<button type="button" class="al-taster" data-taster="${esc(t.id)}">Auslösen</button>`;
    html += '</div>';
  }
  html += `<div class="al-quelle-neu"><span>+ Quelle</span>${['rail', 'gen', 'cv', 'gate', 'rausch', 'audioein'].map(typ => `<button type="button" data-neu="${typ}">${esc({rail: 'Versorgung', gen: 'Generator', cv: 'Steuerquelle', gate: 'Gate', rausch: 'Rauschen', audioein: 'Digitaler Eingang'}[typ])}</button>`).join('')}</div>`;
  el.innerHTML = html;
}

/* ---------- Render ---------- */
function dauerAusFeld() {
  const w = leseWert($('#al-dauer').value);
  if (w === null || w <= 0) return S.projekt.analyse.dauer;
  return Math.min(w, 30);
}

async function berechne({auto = false, anhoeren = false} = {}) {
  if (S.modus !== 'render') return;
  if (S.rechnet) { S.nochmal = {auto, anhoeren}; return; }
  const ladung = S.ladung, geaendert = S.stale;
  const ir = baueSchaltung(S.projekt, {ziel: 'spice'});
  S.ir = ir;
  zeigeMeldungen(ir);
  if (ir.fehler.length) return;
  const speichern = speicherListe(ir);
  if (!speichern.length) { status('Es gibt nichts zu messen: Setze eine Sonde oder einen Hörpunkt.'); return; }

  const fs = monitor.ctx?.sampleRate ?? 48000;
  const dauer = dauerAusFeld();
  const schritt = 1 / Number($('#al-genau').value);
  S.projekt.analyse.dauer = dauer;
  S.projekt.analyse.start = $('#al-start').value;

  let digitalProben = null;
  try { digitalProben = await digital.probenFuer(ir, dauer, fs); } catch (e) {
    if (ladung !== S.ladung) return;
    zeigeMeldungen(ir, [{art: 'fehler', text: e.message}]); status(e.message, true); return;
  }
  if (ladung !== S.ladung) return;

  const text = spiceText(ir, {art: 'tran', dauer, tmax: schritt, start: S.projekt.analyse.start, digital: digitalProben});
  S.rechnet = true;
  const knopf = $('#al-berechnen');
  knopf.textContent = '■ Abbrechen';
  knopf.setAttribute('aria-pressed', 'true');
  const t0 = performance.now();
  const uhr = setInterval(() => {
    if (ladung === S.ladung) status(`ngspice rechnet … ${komma(((performance.now() - t0) / 1000).toFixed(1))} s`);
  }, 200);
  try {
    const r = await spice.rechne(text);
    /* Während des Laufs wurde eine andere Schaltung geladen: Dieses Ergebnis gehört nicht mehr dazu. */
    if (ladung !== S.ladung) return;
    S.letzteDauerMs = r.rechenMs;
    const e = r.ergebnis;
    const t = spalte(e, 'time').values;
    const kanaele = [];
    ir.sonden.forEach(s => {
      const spaltenName = s.art === 'u' ? (s.netz === '0' ? null : `v(${s.netz})`) : `i(${spiceName('V', s.quelle)})`;
      const sp = spaltenName ? spalte(e, spaltenName) : null;
      kanaele.push({id: s.id, name: s.name, einheit: s.art === 'u' ? 'V' : 'A', farbe: farbeVon(s.id), werte: sp ? sp.values : new Float64Array(t.length)});
    });
    oszi.setzeRender({t, kanaele, dauer});
    if (geaendert) wirkungNachLauf(kanaele, t);
    /* Spektrum auf festem Raster */
    const spekKanaele = kanaele.map(k => ({name: k.name, einheit: k.einheit, farbe: k.farbe, fs, werte: zuAudio(t, k.werte, fs)}));
    spek.setze(spekKanaele, {alsAltBehalten: true});

    S.audio = null;
    if (ir.hoerpunkt) {
      const netz = ir.hoerpunkt.netz;
      const sp = netz === '0' ? null : spalte(e, `v(${netz})`);
      S.audio = zuAudio(t, sp ? sp.values : new Float64Array(t.length), fs);
      S.audioFs = fs;
    }
    $('#al-anhoeren').disabled = !S.audio;
    $('#al-wav').disabled = !S.audio;

    S.netlistVorher = S.netlistAktuell;
    S.netlistAktuell = r.netlist;
    zeigeNetlist();
    $('#al-ngspice').textContent = r.info || '';
    const zusatz = (r.fehler || []).filter(z => z && z.trim() && !/^Note:/.test(z.trim())).slice(0, 12).map(z => ({art: 'hinweis', text: `ngspice: ${z}`}));
    zeigeMeldungen(ir, zusatz);
    S.stale = false;
    status(`Gerechnet: ${komma((dauer * 1000).toFixed(0))} ms Schaltungszeit in ${komma((r.rechenMs / 1000).toFixed(2))} s, ${e.numPoints} Zeitschritte, Rechenzeit das ${komma((r.rechenMs / 1000 / dauer).toFixed(1))}-Fache der Schaltungszeit.`);
    if (anhoeren || S.spielt) spiele();
  } catch (e) {
    if (ladung !== S.ladung) return;
    if (e.art === 'abbruch') status('Berechnung abgebrochen.');
    else {
      const meld = (e.meldungen || []).filter(z => z && z.trim()).slice(0, 8).map(z => ({art: 'warnung', text: `ngspice: ${z}`}));
      zeigeMeldungen(ir, [{art: 'fehler', text: `Berechnung fehlgeschlagen: ${e.message} Das Oszilloskop zeigt weiter den letzten gültigen Lauf.`}, ...meld]);
      $('#al-ngspice').textContent = e.info || '';
      if (e.netlist) { S.netlistVorher = S.netlistAktuell; S.netlistAktuell = e.netlist; zeigeNetlist(); }
      zeigeUnten('meldungen');
    }
  } finally {
    clearInterval(uhr);
    S.rechnet = false;
    knopf.textContent = '▶ Berechnen';
    knopf.setAttribute('aria-pressed', 'false');
    if (S.nochmal) {
      const n = S.nochmal;
      S.nochmal = false;
      berechne(n);
    }
  }
}

async function audioBereit() {
  try { await monitor.start(); return true; }
  catch (e) { status(e.message, e.name !== 'AbortError'); return false; }
}

function spiele() {
  if (!S.audio || !monitor.ctx) return;
  monitor.spieleVolt(S.audio, S.audioFs, {schleife: $('#al-schleife').checked});
  S.spielt = true;
  const k = $('#al-anhoeren');
  k.setAttribute('aria-pressed', 'true');
  k.textContent = '■ Anhalten';
}

function stille() {
  monitor.stoppeQuelle();
  S.spielt = false;
  const k = $('#al-anhoeren');
  k.setAttribute('aria-pressed', 'false');
  k.textContent = '♪ Anhören';
}

monitor.beiQuelleEnde = () => { if (S.modus === 'render' && !$('#al-schleife').checked) stille(); };

/* ---------- Wirkung: Was hat die letzte Änderung gebracht? ---------- */
function zeigeWirkung() {
  const w = S.wirkung;
  $('#al-wirkung').hidden = !w.verglichen;
  if (!w.verglichen) return;
  const teile = [w.sonden, w.fc].filter(Boolean);
  $('#al-wirkung-text').textContent = `${w.nach ? `Nach „${w.nach}“: ` : ''}${teile.join(' · ') || 'An den Sonden ändert sich nichts Messbares.'}`;
}

function wirkungNachLauf(kanaele, t) {
  const jetzt = kennwerte(t, kanaele);
  if (S.messVorher) {
    S.wirkung = {...S.wirkung, verglichen: true, nach: S.letzteAenderung, sonden: wirkungAnSonden(S.messVorher, jetzt)};
    zeigeWirkung();
  }
  S.messVorher = jetzt;
}

function wirkungNachBode(kurven) {
  if (S.bodeStand) {
    S.wirkung = {...S.wirkung, verglichen: true, nach: S.letzteAenderung, fc: wirkungAnFrequenz(S.bodeStand, kurven)};
    zeigeWirkung();
  }
}

function vergissWirkung() {
  S.messVorher = null;
  S.wirkung = {verglichen: false, nach: '', sonden: '', fc: ''};
  zeigeWirkung();
}

/* ---------- Farben der Kanäle ---------- */
function farbeVon(id) {
  const k = plan.kanalVon.get(id);
  return KANAL_FARBEN[((k ?? 1) - 1) % KANAL_FARBEN.length];
}

/* ---------- Messwerte ---------- */
let messAlt = 0;
function zeigeMesswerte(info) {
  const jetzt = performance.now();
  if (S.modus === 'live' && jetzt - messAlt < 240) return;
  messAlt = jetzt;
  const tab = $('#al-messwerte');
  if (!info) { tab.innerHTML = ''; return; }
  const zeilen = Oszilloskop.messwerte(info);
  tab.innerHTML = `<tr><th>Kanal</th><th>Min</th><th>Max</th><th>Uss / Iss</th><th>Mittel</th><th>Eff.</th><th>f</th></tr>`
    + zeilen.map(z => `<tr><td class="kanal-name"><span class="al-farbe" style="background:${z.farbe}"></span>${esc(z.name)}</td><td>${fmtMess(z.min, z.einheit, 4)}</td><td>${fmtMess(z.max, z.einheit, 4)}</td><td>${fmtMess(z.spitze, z.einheit, 4)}</td><td>${fmtMess(z.mittel, z.einheit, 4)}</td><td>${fmtMess(z.rms, z.einheit, 4)}</td><td>${z.f ? fmtMess(z.f, 'Hz', 5) : '–'}</td></tr>`).join('');
}

/* ---------- Frequenzgang ---------- */
async function rechneBode() {
  const ladung = S.ladung;
  const ir = baueSchaltung(S.projekt, {ziel: 'spice'});
  if (ir.fehler.length) { zeigeMeldungen(ir); return; }
  const gen = ir.elemente.find(e => e.ac);
  if (!gen) { status('Für den Frequenzgang braucht die Schaltung einen Signalgenerator.'); bode.loesche(); $('#al-bode-werte').innerHTML = ''; return; }
  const sonden = ir.sonden.filter(s => s.art === 'u' && s.netz !== '0');
  if (!sonden.length && !ir.hoerpunkt) { status('Für den Frequenzgang braucht die Schaltung eine Spannungssonde.'); return; }
  const von = leseWert($('#al-ac-von').value) ?? 1, bis = leseWert($('#al-ac-bis').value) ?? 1e5;
  const text = spiceText(ir, {art: 'ac', von, bis, jeDekade: 200, stim: gen.id});
  try {
    const r = await spice.rechne(text);
    if (ladung !== S.ladung) return;
    const f = spalte(r.ergebnis, 'frequency');
    const kurven = [];
    for (const s of sonden) {
      const v = spalte(r.ergebnis, `v(${s.netz})`);
      if (!v) continue;
      const g = frequenzgang(f.re, v.re, v.im);
      const art = verlaufArt(g);
      const fc = art === 'Tiefpass' ? grenzfrequenz(g, g.db[0]) : art === 'flach' ? null : grenzfrequenzUnten(g);
      kurven.push({name: s.name, farbe: farbeVon(s.id), f: f.re, db: g.db, phase: g.phase, fc, art});
    }
    bode.setze(kurven);
    wirkungNachBode(kurven);
    S.bodeStand = kurven;
    $('#al-bode-werte').innerHTML = kurven.length
      ? `<tr><th>Kanal</th><th>Verlauf</th><th>Bezug</th><th>−3 dB bei</th><th>Phase</th><th>Steigung</th></tr>` + kurven.map(k => {
        const fb = k.f[k.f.length - 1], fa = fb / 10;
        const steig = k.db[k.db.length - 1] - wertBei(k.f, k.db, fa);
        return `<tr><td class="kanal-name"><span class="al-farbe" style="background:${k.farbe}"></span>${esc(k.name)}</td><td>${k.art}</td><td>${k.fc ? `${komma(k.fc.bezugDb.toFixed(2))} dB` : '–'}</td><td>${k.fc ? fmtMess(k.fc.fc, 'Hz', 6) : '–'}</td><td>${k.fc ? `${komma(k.fc.phase.toFixed(2))}°` : '–'}</td><td>${komma(steig.toFixed(1))} dB/Dek.</td></tr>`;
      }).join('')
      : '';
    status(`Frequenzgang gerechnet: ${fmtWert(von, 'Hz')} bis ${fmtWert(bis, 'Hz')}, Anregung ${gen.id} mit 1 V.`);
  } catch (e) {
    zeigeMeldungen(ir, [{art: 'fehler', text: `Frequenzgang nicht berechenbar: ${e.message}`}]);
  }
}

/* ---------- Arbeitspunkt ---------- */

/* Der Arbeitspunkt wird einmal je Stand der Schaltung gerechnet. Karte, Tabelle und Schritte teilen sich das Ergebnis. */
let opLauf = null;
function opHolen() {
  if (S.opStand) return Promise.resolve(S.opStand);
  /* Läuft schon oder ist für diesen Stand gescheitert: nicht noch einmal rechnen. */
  if (opLauf?.stand === S.stand) return opLauf.ergebnis;
  const ir = baueSchaltung(S.projekt, {ziel: 'spice'});
  if (ir.fehler.length) return Promise.reject(new Error(ir.fehler[0].text));
  const stand = S.stand;
  const ergebnis = spice.rechne(spiceText(ir, {art: 'op'})).then(r => {
    /* Betriebsdaten der Halbleiter heißen je nach Größe @q1[gm] oder i(@q1[ic]). */
    const op = {ir, wert: n => (spalte(r.ergebnis, n) ?? spalte(r.ergebnis, `i(${n})`))?.values?.[0]};
    if (stand === S.stand) S.opStand = op;
    return op;
  });
  opLauf = {stand, ergebnis};
  return ergebnis;
}

async function rechneOp() {
  const ir = baueSchaltung(S.projekt, {ziel: 'spice'});
  zeigeMeldungen(ir);
  if (ir.fehler.length) { $('#al-op').innerHTML = ''; return; }
  try {
    const op = await opHolen();
    const {wert} = op;
    const netze = [...ir.netzInfo.netze.keys()].filter(n => n !== '0').sort((a, b) => a.localeCompare(b, 'de', {numeric: true}));
    let html = '<h4>Netze gegen Masse</h4><table class="al-werte"><tr><th>Netz</th><th>Spannung</th></tr>';
    plan.spannungen.clear();
    const zeigenImPlan = $('#al-op-plan').checked;
    for (const n of netze) {
      const v = wert(`v(${n})`);
      if (v === undefined) continue;
      html += `<tr><td>${esc(n)}</td><td>${fmtMess(v, 'V', 5)}</td></tr>`;
      if (zeigenImPlan) plan.spannungen.set(n, fmtMess(v, 'V', 4));
    }
    html += '</table>';
    const quellen = ir.elemente.filter(x => x.k === 'V' && x.teil && !x.id.match(/^VU/));
    if (quellen.length) {
      html += '<h4>Ströme der Quellen</h4><table class="al-werte"><tr><th>Quelle</th><th>Strom (von + durch die Quelle nach −)</th></tr>';
      for (const q of quellen) {
        const i = wert(`i(${spiceName('V', q.id)})`);
        if (i !== undefined) html += `<tr><td>${esc(q.teil)}</td><td>${fmtMess(i, 'A', 4)}</td></tr>`;
      }
      html += '</table>';
    }
    const halbleiter = ir.elemente.filter(x => x.k === 'Q' && !x.id.endsWith('x'));
    if (halbleiter.length) {
      html += '<h4>Transistoren</h4><table class="al-werte"><tr><th>Teil</th><th>Ic</th><th>Ib</th><th>β</th><th>Ube</th><th>Uce</th><th>gm</th></tr>';
      let saetze = '';
      for (const q of halbleiter) {
        const nm = spiceName('Q', q.id).toLowerCase();
        const ic = wert(`@${nm}[ic]`), ib = wert(`@${nm}[ib]`), gm = wert(`@${nm}[gm]`);
        const vb = q.b === '0' ? 0 : wert(`v(${q.b})`) ?? 0, vc = q.c === '0' ? 0 : wert(`v(${q.c})`) ?? 0, ve = q.e === '0' ? 0 : wert(`v(${q.e})`) ?? 0;
        const vor = q.modell.pol === 'NPN' ? 1 : -1;
        html += `<tr><td>${esc(q.teil)}</td><td>${fmtMess(ic, 'A', 4)}</td><td>${fmtMess(ib, 'A', 3)}</td><td>${Number.isFinite(ic / ib) ? komma((ic / ib).toFixed(0)) : '–'}</td><td>${fmtMess(vb - ve, 'V', 4)}</td><td>${fmtMess(vc - ve, 'V', 4)}</td><td>${gm !== undefined ? fmtMess(gm, 'S', 3) : '–'}</td></tr>`;
        saetze += `<p class="al-notiz">${esc(q.teil)}: ${esc(regionBJT(vor * (vb - ve), vor * (vb - vc)))}</p>`;
      }
      html += `</table>${saetze}`;
    }
    $('#al-op').innerHTML = html;
    plan.zeichne();
    status('Arbeitspunkt gerechnet: Kondensatoren offen, Spulen kurz, Quellen auf ihrem Gleichanteil.');
  } catch (e) {
    $('#al-op').innerHTML = `<p class="al-notiz">Kein Arbeitspunkt gefunden: ${esc(e.message)}</p>`;
    const meld = (e.meldungen || []).filter(z => z && z.trim()).slice(0, 6).map(z => ({art: 'warnung', text: `ngspice: ${z}`}));
    zeigeMeldungen(ir, [{art: 'fehler', text: 'ngspice findet keinen Arbeitspunkt. Schwingt die Schaltung, starte aus Anfangswerten.'}, ...meld]);
  }
}

/* ---------- Netlist ---------- */
function zeigeNetlist() {
  $('#al-netlist-text').textContent = S.netlistAktuell;
  const d = $('#al-netlist-diff');
  if (!S.netlistVorher) { d.textContent = 'Noch kein vorheriger Lauf.'; return; }
  const u = netlistUnterschied(S.netlistVorher, S.netlistAktuell);
  if (u.gleich) { d.textContent = 'Keine Änderung an der Schaltung.'; return; }
  d.innerHTML = u.weg.map(z => `<span class="weg">− ${esc(z)}</span>`).concat(u.dazu.map(z => `<span class="dazu">+ ${esc(z)}</span>`)).join('\n');
}

/* ---------- Modelle ---------- */
function zeigeModelle() {
  const el = $('#al-modelle');
  const ir = baueSchaltung(S.projekt, {ziel: 'live'});
  const zeilen = ir.teileInfo.filter(t => !['gnd', 'label', 'sonde', 'hoer'].includes(t.typ)).map(t => {
    const m = t.modell;
    const art = {ideal: 'ideal', hersteller: 'Hersteller', generisch: 'generisch', naeherung: 'Näherung', endlich: 'endlich', grenze: 'Grenze'}[m.art] || m.art;
    return `<tr><td>${esc(t.id)}</td><td>${esc(BAUTEILE[t.typ].name)}</td><td><span class="al-art">${esc(art)}</span></td><td>${esc(m.name)}</td><td>${esc(m.version)}${m.quelle ? `<br><a href="${esc(m.quelle)}" target="_blank" rel="noopener">Quelle ↗</a>` : ''}</td><td>${esc(m.text)}</td></tr>`;
  }).join('');
  el.innerHTML = `<p>Was jedes Bauteil dieser Schaltung im Rechner ist. Herstellerparameter sind unverändert übernommen und nicht gegen echte Bauteile nachgemessen.</p>`
    + (zeilen ? `<table class="al-tabelle"><tr><th>Teil</th><th>Bauteil</th><th>Art</th><th>Modell</th><th>Version und Quelle</th><th>Eigenschaften</th></tr>${zeilen}</table>` : '<p>Die Schaltung ist noch leer.</p>')
    + (ir.naeherungen.length ? `<p><b>Im Live-Löser zusätzlich:</b></p><ul class="al-aufgaben">${[...new Set(ir.naeherungen)].map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '');
}

/* ---------- Live ---------- */
function liveKanaele(mess) {
  return mess.filter(m => m.id !== '_hoer').map(m => ({
    id: m.id, name: m.id, einheit: m.art === 'u' ? 'V' : 'A', farbe: farbeVon(m.id)
  }));
}

let schirmSchleife = 0;
function schirmLauf() {
  cancelAnimationFrame(schirmSchleife);
  let zuletzt = 0, spekZuletzt = 0;
  const schritt = (t) => {
    if (S.modus !== 'live') return;
    schirmSchleife = requestAnimationFrame(schritt);
    if (t - zuletzt < 40) return;
    zuletzt = t;
    if (S.geraet === 'oszilloskop') oszi.zeichne();
    else if (S.geraet === 'spektrum' && t - spekZuletzt > 200) {
      spekZuletzt = t;
      const d = oszi.liveAbschnitt(32768);
      if (d && d.t.length > 2048) spek.setze(d.kanaele.map(k => ({name: k.name, einheit: k.einheit, farbe: k.farbe, fs: d.fs, werte: k.werte})));
    }
  };
  schirmSchleife = requestAnimationFrame(schritt);
}

live.beiScope = (rahmen, t) => oszi.liveRahmen(rahmen.slice(0, live.mess.filter(m => m.id !== '_hoer').length), t);
live.beiBericht = b => {
  if (!live.aktiv || b.kennung !== live.kennung) return;
  const el = $('#al-last');
  const p = b.last * 100;
  el.querySelector('i').style.setProperty('--wert', `${Math.min(p, 100)}%`);
  el.querySelector('b').textContent = `${komma(p.toFixed(0))} %`;
  el.classList.toggle('hoch', p > 70);
  el.title = `Rechenzeit ${komma(p.toFixed(1))} % der Blockdauer, längster Block ${komma(b.spitzeMs.toFixed(1))} ms von ${komma(b.budgetMs.toFixed(2))} ms (Uhr: ${b.uhr}, Auflösung bei Date.now 1 ms). Newton im Mittel ${komma(b.newton.toFixed(2))} Schritte, ${b.nk} ohne Konvergenz.`;
  if (b.nk > 0) status(`Live: ${b.nk} Rechenschritte ohne Konvergenz im letzten Abschnitt. Der letzte Stand wurde gehalten. Für diese Schaltung ist „Berechnen und anhören“ verlässlicher.`, true);
  if (p > 95 || b.ueberBudget > b.bloecke * 0.2) S.ueberlastZaehler++;
  else S.ueberlastZaehler = 0;
  if (S.ueberlastZaehler >= 6) ueberlast(p);
};
live.beiNan = () => status('Live: Die Rechnung ist numerisch ausgebrochen (NaN). Die Zustände wurden auf null gesetzt.', true);
live.beiPlan = d => {
  /* Beim Start steht schon der ausführlichere Text in der Statuszeile. */
  if (S.liveBeginn) { S.liveBeginn = false; return; }
  if (d.reset) status('Neu eingeschaltet: Alle Kondensatoren und Spulen wurden neu initialisiert.');
  else if (d.leere?.length) status(`Schaltung übernommen. Neu und leer: ${d.leere.join(', ')}. Alle anderen Zustände bleiben erhalten.`);
};

function ueberlast(p) {
  S.ueberlastZaehler = 0;
  liveStopp();
  const m = [{art: 'warnung', text: `Live angehalten: Die Rechenzeit lag bei rund ${komma(p.toFixed(0))} % des Budgets. Diese Schaltung ist für den Live-Löser auf diesem Gerät zu groß. Wechsle zu „Berechnen und anhören“ oder senke die Überabtastung.`}];
  zeigeMeldungen(S.ir, m);
  const wechsel = document.createElement('button');
  wechsel.type = 'button';
  wechsel.className = 'button small';
  wechsel.textContent = 'Berechnen und anhören';
  wechsel.addEventListener('click', () => setzeModus('render'));
  $('#al-meldungen').lastElementChild.append(' ', wechsel);
  status(m[0].text, true);
  zeigeUnten('meldungen');
}

function liveKnopf(an) {
  const k = $('#al-live-start');
  k.textContent = an ? '■ Stopp' : '▶ Start';
  k.setAttribute('aria-pressed', String(an));
}

async function liveStart() {
  S.ueberlastZaehler = 0;
  try {
    await monitor.start();
    const ueber = Number($('#al-ueber').value);
    const start = $('#al-start').value;
    S.projekt.analyse.start = start;
    S.liveBeginn = true;
    const st = await live.starten(S.projekt, {ueber, start});
    S.ir = st.ir;
    zeigeMeldungen(st.ir);
    S.liveSoll = true;
    oszi.liveBeginn(liveKanaele(st.mess), monitor.ctx.sampleRate);
    await digital.liveVerbinden(st.ir);
    schirmLauf();
    liveKnopf(true);
    let text = `Live läuft: ${st.plan.n} Unbekannte, ${st.plan.S} Zustände, ${st.plan.Mv} nichtlineare Anschlüsse, ${ueber}-fach überabgetastet. Die Leiste zeigt die gemessene Rechenzeit.`;
    if (st.dc && !st.dc.ok) text += ' Kein stabiler Arbeitspunkt gefunden, die Schaltung schwingt vermutlich: Start aus Anfangswerten ist hier sinnvoll.';
    status(text, st.dc && !st.dc.ok);
  } catch (e) {
    S.liveSoll = false;
    liveKnopf(false);
    status(e.message, true);
    if (e.name === 'AbortError') return;
    zeigeMeldungen(S.ir, [{art: 'fehler', text: `Live nicht möglich: ${e.message}`}]);
  }
}

function liveStopp() {
  live.stoppen();
  digital.liveTrennen();
  S.liveSoll = false;
  liveKnopf(false);
  status('Live angehalten.');
}

const liveAktualisieren = verzoegert(() => liveAktualisierenSofort(), 16);

function liveAktualisierenSofort() {
  if (!S.liveSoll) return;
  try {
    if (!live.aktiv) { liveStart(); return; }
    const r = live.aktualisieren(S.projekt);
    if (r) {
      S.ir = r.ir;
      oszi.liveKanaele(liveKanaele(r.mess), monitor.ctx.sampleRate);
      digital.liveVerbinden(r.ir);
    }
  } catch (e) {
    /* Elektrisch nicht lösbar: anhalten und sagen, warum. Die nächste gültige Änderung startet neu. */
    live.stoppen();
    status(`Live angehalten: ${e.message}`, true);
    zeigeMeldungen(S.ir, [{art: 'fehler', text: e.message}]);
  }
}

function setzeModus(modus) {
  if (S.modus === modus) return;
  /* Eine verspätete Renderantwort darf die Live-Anzeige nicht überschreiben. */
  S.ladung++;
  S.nochmal = false;
  if (S.rechnet) spice.abbrechen();
  S.modus = modus;
  $('#al-modus-render').setAttribute('aria-pressed', String(modus === 'render'));
  $('#al-modus-live').setAttribute('aria-pressed', String(modus === 'live'));
  $('#al-render-regler').hidden = modus !== 'render';
  $('#al-live-regler').hidden = modus !== 'live';
  $('#al-wav').hidden = modus !== 'render';
  $$('[data-nur]').forEach(f => { f.hidden = f.dataset.nur !== modus; });
  if (modus === 'live') {
    stille();
    oszi.loesche();
    status('Live: „Start“ drücken. Änderungen werden sofort übernommen, Zustände bleiben erhalten.');
  } else {
    liveStopp();
    oszi.loesche();
    S.stale = true;
    berechne({auto: true});
  }
  zeigeEigenschaften();
}

/* ---------- Ansichten und Reiter ---------- */
function zeigeAnsicht(a) {
  S.ansicht = a;
  $$('[data-ansicht]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.ansicht === a)));
  $('#al-plan').style.display = a === 'plan' ? '' : 'none';
  $('#al-brett').hidden = a !== 'brett';
  $('#al-spiegeln').hidden = a !== 'plan';
  if (a === 'brett') {
    brett.zeichne();
    if (!S.brettGeoeffnet) { S.brettGeoeffnet = true; brett.passend(); } else host.zoomGeaendert(brett.massstab);
  } else {
    plan.zeichne();
    host.zoomGeaendert(plan.ansicht.z);
  }
}

function zeigeGeraet(g) {
  S.geraet = g;
  $$('[data-geraet]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.geraet === g)));
  $$('[data-geraet-seite]').forEach(s => { s.hidden = s.dataset.geraetSeite !== g; });
  if (g === 'oszilloskop') oszi.zeichne();
  if (g === 'spektrum') spek.zeichne();
  if (g === 'frequenzgang') { if (!S.bodeStand || S.stale) rechneBode(); else bode.zeichne(); }
  if (g === 'arbeitspunkt') rechneOp();
}

function zeigeUnten(u) {
  $$('[data-unten]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.unten === u)));
  $$('[data-unten-seite]').forEach(s => { s.hidden = s.dataset.untenSeite !== u; });
  if (u === 'modelle') zeigeModelle();
}

/* ---------- Versuche ---------- */
function zeigeVersuche() {
  const gruppen = [...new Set(VERSUCHE.map(v => v.gruppe))];
  $('#al-versuch').innerHTML = '<option value="">Eigene Schaltung</option>' + gruppen.map(g => `<optgroup label="${esc(g)}">${VERSUCHE.filter(v => v.gruppe === g).map(v => `<option value="${v.id}">${esc(v.titel)}</option>`).join('')}</optgroup>`).join('');
  let nr = 0;
  $('#al-versuche').innerHTML = gruppen.map(g => `<h3 class="al-karten-kopf">${esc(g)}</h3>` + VERSUCHE.filter(v => v.gruppe === g).map(v => `<button type="button" class="al-karte" data-versuch="${v.id}"><span class="nr">${String(++nr).padStart(2, '0')}</span><span><b>${esc(v.titel)}</b><span class="txt">${esc(v.kurz)}</span></span></button>`).join('')).join('');
}

function ladeVersuch(id, {nachOben = true} = {}) {
  const v = versuchFinden(id);
  if (!v) return;
  S.versuch = id;
  S.geschafft.clear();
  ladeProjekt(v.bau(), {text: `Versuch geladen: ${v.titel}`});
  $('#al-versuch').value = id;
  zeigeAnleitung(v);
  zeigeUnten('anleitung');
  if (v.tab) zeigeGeraet(v.tab);
  if (nachOben) $('#pult').scrollIntoView({behavior: 'smooth', block: 'start'});
}

function zeigeAnleitung(v) {
  const el = $('#al-anleitung');
  if (!v) {
    el.innerHTML = `<div class="al-anleitung-kopf"><h3>Freier Entwurf</h3></div><p>Zieh ein Bauteil aus der Liste auf die Fläche und zieh Drähte von Pin zu Pin. Jede Schaltung braucht eine Masse. Eine Spannungssonde zeigt eine Spur auf dem Oszilloskop, der Hörpunkt legt fest, welche Spannung du hörst. Oder lade unten einen Versuch und baue ihn um.</p>`;
    return;
  }
  const schritte = v.schritte.map((q, i) => {
    const fertig = S.geschafft.has(i);
    return `<li class="${fertig ? 'fertig' : ''}"><span class="haken" aria-label="${fertig ? 'geschafft' : 'offen'}"></span><span>${esc(q.text)}</span>${fertig ? `<span class="warum">${esc(q.warum)}</span>` : ''}</li>`;
  }).join('');
  const lex = v.lex.map(id => `<button type="button" class="al-lex" data-lex="${esc(id)}">${esc(LEXIKON_NAMEN[id] ?? id)}</button>`).join(' ');
  el.innerHTML = `<div class="al-anleitung-kopf"><span class="eyebrow">${esc(v.gruppe)}</span><h3>${esc(v.titel)}</h3><span class="al-schrittzahl">${S.geschafft.size} von ${v.schritte.length} geschafft</span><button type="button" data-versuch-neu="${v.id}">Neu aufbauen</button></div><p>${esc(v.text)}</p>`
    + `<ol class="al-schritte">${schritte}</ol>`
    + (v.aufgaben.length ? `<ul class="al-aufgaben">${v.aufgaben.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : '')
    + `<p class="al-nachschlagen">Nachschlagen: ${lex}</p>`;
}

/* Prüft nach jeder Änderung die Schritte des Versuchs. Was einmal geschafft ist, bleibt abgehakt. */
function pruefeSchritte() {
  const v = S.versuch && versuchFinden(S.versuch);
  if (!v) return;
  const spannung = kennung => {
    const netz = plan.netze?.pinNetz.get(kennung);
    if (netz === '0') return 0;
    return netz && S.opStand ? S.opStand.wert(`v(${netz})`) : undefined;
  };
  let neu = false;
  v.schritte.forEach((q, i) => {
    if (!S.geschafft.has(i) && q.ziel({p: S.projekt, spannung, gewaehlt: ausgewaehlt()?.id})) { S.geschafft.add(i); neu = true; }
  });
  if (neu) zeigeAnleitung(v);
  /* Schritte, die eine Spannung brauchen, warten auf den Arbeitspunkt. */
  if (!S.opStand && v.schritte.some((q, i) => q.mitSpannung && !S.geschafft.has(i))) {
    opHolen().then(() => { if (S.opStand) pruefeSchritte(); }, () => {});
  }
}

function ladeProjekt(p, {text = ''} = {}) {
  if (S.modus === 'render') stille();
  S.projekt = p;
  S.ladung++;
  S.vergangen = [];
  S.zukunft = [];
  S.netlistAktuell = '';
  S.netlistVorher = '';
  S.bodeStand = null;
  vergissWirkung();
  oszi.loesche();
  spek.loesche();
  bode.loesche();
  plan.auswahl.teile.clear();
  plan.auswahl.draehte.clear();
  plan.setzeWerkzeug(null);
  $('#al-start').value = p.analyse.start || 'op';
  $('#al-dauer').value = fmtWert(p.analyse.dauer, 's');
  $('#al-laut').value = p.monitor?.lautstaerke ?? 0.15;
  monitor.stelle('lautstaerke', Number($('#al-laut').value));
  $('#al-dc').checked = !!p.monitor?.dc;
  monitor.stelle('dc', !!p.monitor?.dc);
  digital.projektGeladen();
  zeigeNetlist();
  nachAenderung(text);
  plan.alles();
}

/* ---------- Bedienelemente verdrahten ---------- */
function verdrahten() {
  $('#al-undo').addEventListener('click', host.rueckgaengig);
  $('#al-redo').addEventListener('click', host.wiederholen);
  $('#al-name').addEventListener('change', e => {
    const wert = e.target.value.trim() || 'Schaltung';
    host.mutiere(`Name: ${wert}`, p => { p.titel = wert; });
  });
  $('#al-neu').addEventListener('click', () => {
    S.versuch = null;
    $('#al-versuch').value = '';
    ladeProjekt(leeresProjekt('Neue Schaltung'), {text: 'Leere Schaltung.'});
    zeigeAnleitung(null);
  });
  $('#al-oeffnen').addEventListener('click', () => $('#al-datei').click());
  $('#al-datei').addEventListener('change', async e => {
    const datei = e.target.files?.[0];
    e.target.value = '';
    if (!datei) return;
    try {
      const {projekt, meldungen} = ausDatei(JSON.parse(await datei.text()));
      S.versuch = null;
      $('#al-versuch').value = '';
      ladeProjekt(projekt, {text: `Geöffnet: ${datei.name}`});
      if (meldungen.length) zeigeMeldungen(S.ir, meldungen.map(text => ({art: 'warnung', text})));
    } catch (err) { status(`Datei nicht lesbar: ${err.message}`, true); }
  });
  $('#al-speichern').addEventListener('click', () => {
    speichereDatei(`${dateiName(S.projekt.titel)}.audiolabor.json`, JSON.stringify(zuDatei(S.projekt), null, 1), 'application/json');
    status('Projekt als Datei gespeichert.');
  });
  $('#al-teilen').addEventListener('click', async () => {
    const code = await packe(JSON.stringify(zuDatei(S.projekt)));
    const url = `${location.origin}${location.pathname}#p=${code}`;
    try { await navigator.clipboard.writeText(url); status(`Link kopiert (${url.length} Zeichen).`); }
    catch { history.replaceState(null, '', url); status('Der Link steht jetzt in der Adresszeile.'); }
  });
  $('#al-versuch').addEventListener('change', e => { if (e.target.value) ladeVersuch(e.target.value, {nachOben: false}); });
  $('#al-versuche').addEventListener('click', e => { const k = e.target.closest('[data-versuch]'); if (k) ladeVersuch(k.dataset.versuch); });
  $('#al-anleitung').addEventListener('click', e => { const id = e.target.dataset?.versuchNeu; if (id) ladeVersuch(id, {nachOben: false}); });

  /* Das Einstellungsfeld schließt, sobald woanders hingeklickt wird. */
  document.addEventListener('pointerdown', e => {
    const feld = $('.al-klapp');
    if (feld.open && !feld.contains(e.target)) feld.open = false;
  });

  $('#al-modus-render').addEventListener('click', () => setzeModus('render'));
  $('#al-modus-live').addEventListener('click', () => setzeModus('live'));

  $('#al-berechnen').addEventListener('click', async () => {
    if (S.rechnet) { S.nochmal = false; spice.abbrechen(); return; }
    if (!await audioBereit()) return;
    berechne({anhoeren: true});
  });
  $('#al-anhoeren').addEventListener('click', async () => {
    if (!await audioBereit()) return;
    if (S.spielt) stille(); else spiele();
  });
  $('#al-schleife').addEventListener('change', () => { if (S.spielt) spiele(); });
  $('#al-dauer').addEventListener('change', e => {
    const w = leseWert(e.target.value);
    if (w === null || w <= 0 || w > 30) { e.target.classList.add('falsch'); status('Dauer: zwischen 1 ms und 30 s.', true); return; }
    e.target.classList.remove('falsch');
    e.target.value = fmtWert(w, 's');
    S.projekt.analyse.dauer = w;
    S.stale = true;
    if ($('#al-auto').checked) berechne({auto: true});
  });
  $('#al-genau').addEventListener('change', () => { S.stale = true; if ($('#al-auto').checked) berechne({auto: true}); });
  $('#al-start').addEventListener('change', e => {
    host.mutiere(`Start: ${e.target.value === 'op' ? 'Arbeitspunkt' : 'Anfangswerte'}`, p => { p.analyse.start = e.target.value; });
    if (S.modus === 'live' && live.aktiv) live.neuStarten(S.projekt, e.target.value);
  });

  $('#al-live-start').addEventListener('click', () => { if (S.liveSoll) liveStopp(); else liveStart(); });
  $('#al-live-neu').addEventListener('click', () => { if (live.aktiv) live.neuStarten(S.projekt, $('#al-start').value); });
  $('#al-ueber').addEventListener('change', () => { if (S.liveSoll) { live.stoppen(); liveStart(); } });

  $('#al-laut').addEventListener('input', e => { monitor.stelle('lautstaerke', Number(e.target.value)); S.projekt.monitor.lautstaerke = Number(e.target.value); speichernSpaeter(); });
  $('#al-stumm').addEventListener('click', e => {
    const an = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(an));
    monitor.stelle('stumm', an);
  });
  $('#al-dc').addEventListener('change', e => { monitor.stelle('dc', e.target.checked); S.projekt.monitor.dc = e.target.checked; speichernSpaeter(); });
  $('#al-wav').addEventListener('click', () => {
    if (!S.audio) return;
    const x = new Float32Array(S.audio.length);
    for (let i = 0; i < x.length; i++) x[i] = S.audio[i] / 10;
    speichereDatei(`${dateiName(S.projekt.titel)}.wav`, wavFloat32(x, S.audioFs), 'audio/wav');
    status('Hörpunkt als WAV gespeichert: 32 Bit Float, 10 V = 1,0, unbegrenzt und mit Gleichanteil.');
  });
  $('#al-aufnahme').addEventListener('click', async e => {
    const k = e.currentTarget;
    if (!await audioBereit()) return;
    if (!S.aufnahme) {
      S.aufnahme = true;
      monitor.aufnahmeStart();
      k.setAttribute('aria-pressed', 'true');
      k.textContent = '■ Aufnahme';
      status('Aufnahme läuft: Das ist der Ausgang hinter Monitorlautstärke und Begrenzer.');
    } else {
      S.aufnahme = false;
      const a = monitor.aufnahmeStopp();
      k.setAttribute('aria-pressed', 'false');
      k.textContent = '● Aufnahme';
      speichereDatei(`${dateiName(S.projekt.titel)}-aufnahme.wav`, wavFloat32(a.links, a.fs), 'audio/wav');
      status(`Aufnahme gespeichert: ${komma((a.links.length / a.fs).toFixed(1))} s.`);
    }
  });

  const flaeche = () => (S.ansicht === 'brett' ? brett : plan);
  $('#al-drehen').addEventListener('click', () => flaeche().drehe());
  $('#al-spiegeln').addEventListener('click', () => plan.spiegle());
  $('#al-loeschen').addEventListener('click', () => flaeche().loesche());
  $('#al-zoom-ein').addEventListener('click', () => flaeche().zoome(1.25));
  $('#al-zoom-aus').addEventListener('click', () => flaeche().zoome(0.8));
  $('#al-zoom-alles').addEventListener('click', () => flaeche().alles());

  $$('[data-ansicht]').forEach(b => b.addEventListener('click', () => zeigeAnsicht(b.dataset.ansicht)));
  $$('[data-geraet]').forEach(b => b.addEventListener('click', () => zeigeGeraet(b.dataset.geraet)));
  $$('[data-unten]').forEach(b => b.addEventListener('click', () => zeigeUnten(b.dataset.unten)));

  const zeit = $('#al-zeit');
  zeit.innerHTML = '<option value="auto">Auto</option>' + ZEIT_STUFEN.map(z => `<option value="${z}">${fmtWert(z, 's')}/T</option>`).join('');
  zeit.addEventListener('change', e => { oszi.zeitDiv = e.target.value === 'auto' ? 'auto' : Number(e.target.value); oszi.zeichne(); });
  $('#al-pos').addEventListener('input', e => { oszi.position = Number(e.target.value); oszi.zeichne(); });
  $('#al-trigger').addEventListener('change', e => { oszi.triggern = e.target.checked; oszi.zeichne(); });

  $('#al-bode-rechnen').addEventListener('click', rechneBode);
  $('#al-ac-von').addEventListener('change', rechneBode);
  $('#al-ac-bis').addEventListener('change', rechneBode);
  $('#al-op-rechnen').addEventListener('click', rechneOp);
  $('#al-op-plan').addEventListener('change', rechneOp);
  $('#al-cir').addEventListener('click', () => {
    const ir = baueSchaltung(S.projekt, {ziel: 'spice'});
    if (ir.fehler.length) { status(ir.fehler[0].text, true); return; }
    const text = S.netlistAktuell || spiceText(ir, {art: 'tran', dauer: dauerAusFeld(), tmax: 1 / Number($('#al-genau').value), start: $('#al-start').value});
    speichereDatei(`${dateiName(S.projekt.titel)}.cir`, text, 'text/plain');
  });

  const eig = $('#al-eigenschaften');
  verbindeWertfelder(eig, () => ausgewaehlt());
  eig.addEventListener('click', e => {
    const tu = e.target.dataset?.tu;
    if (tu === 'drehen') plan.drehe();
    if (tu === 'spiegeln') plan.spiegle();
    if (tu === 'loeschen') plan.loesche();
  });

  const quellen = $('#al-quellen');
  verbindeWertfelder(quellen, q => S.projekt.teile.find(t => t.id === q.dataset.teilFeld));
  quellen.addEventListener('click', e => {
    const n = e.target.dataset?.neu;
    if (n) { zeigeAnsicht('plan'); plan.setzeWerkzeug('einsetzen', n); }
  });
  quellen.addEventListener('pointerdown', e => {
    const id = e.target.dataset?.taster;
    if (!id) return;
    e.target.classList.add('an');
    e.target.setPointerCapture(e.pointerId);
    live.taste(id, true);
  });
  const lass = e => {
    const id = e.target.dataset?.taster;
    if (!id) return;
    e.target.classList.remove('an');
    live.taste(id, false);
  };
  quellen.addEventListener('pointerup', lass);
  quellen.addEventListener('pointercancel', lass);

  /* Monitorpegel */
  monitor.beiPegel = d => {
    const el = $('#al-spitze');
    const p = d.spitzeEin;
    const jetzt = performance.now();
    if (p > S.spitzeHalt || jetzt - S.spitzeZeit > 400) { S.spitzeHalt = p; S.spitzeZeit = jetzt; }
    el.querySelector('i').style.setProperty('--wert', `${Math.min(S.spitzeHalt * 100, 100)}%`);
    if (d.begrenzt > 0 || p > 1) S.clipHalt = jetzt;
    el.classList.toggle('clip', jetzt - S.clipHalt < 800);
    el.title = `Spitzenwert vor dem Begrenzer: ${komma(p.toFixed(3))} (entspricht ${komma((p * 10).toFixed(2))} V am Hörpunkt)`;
  };
}

/* ---------- Start ---------- */
async function start() {
  zeigeBauteile();
  zeigeVersuche();
  verdrahten();
  hinweis();

  /* Reihenfolge: Link, dann Sitzung, dann der RC-Tiefpass als Einstieg */
  let geladen = false;
  const treffer = location.hash.match(/^#p=(.+)$/);
  if (treffer) {
    try {
      const {projekt, meldungen} = ausDatei(JSON.parse(await entpacke(treffer[1])));
      ladeProjekt(projekt, {text: 'Schaltung aus dem Link geladen.'});
      if (meldungen.length) zeigeMeldungen(S.ir, meldungen.map(text => ({art: 'warnung', text})));
      zeigeAnleitung(null);
      geladen = true;
    } catch (e) { status(`Link nicht lesbar: ${e.message}`, true); }
  }
  if (!geladen) {
    try {
      const roh = localStorage.getItem(SPEICHER);
      if (roh) {
        const daten = JSON.parse(roh);
        const {projekt} = ausDatei(daten);
        if (projekt.teile.length) {
          S.versuch = versuchFinden(daten.versuch) ? daten.versuch : null;
          $('#al-versuch').value = S.versuch ?? '';
          ladeProjekt(projekt, {text: 'Letzte Schaltung wiederhergestellt.'});
          zeigeAnleitung(S.versuch ? versuchFinden(S.versuch) : null);
          geladen = true;
        }
      }
    } catch { /* dann eben nicht */ }
  }
  if (!geladen) ladeVersuch('tiefpass', {nachOben: false});
  host.zoomGeaendert(plan.ansicht.z);
  /* Für den Prüfstand und zum Nachsehen */
  window.audiolabor = {S, plan, host, spice, monitor, live, oszi, spek, bode, digital, brett, berechne, rechneBode, rechneOp, ladeVersuch, ladeProjekt, setzeModus, liveStart, liveStopp, zeigeGeraet, zeigeUnten, zeigeAnsicht};
}

start();
