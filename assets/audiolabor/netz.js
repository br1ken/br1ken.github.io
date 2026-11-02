/* Audiolabor: vom gezeichneten Schaltplan zur elektrischen Schaltung.
   1. loeseNetze: Welche Pins und Drähte sind verbunden? Nur die Geometrie entscheidet:
      Drahtenden auf demselben Punkt, ein Drahtende oder Pin auf einem Draht. Eine bloße Kreuzung verbindet nicht.
   2. baueSchaltung: Bauteile in Grundelemente übersetzen, Regeln prüfen, Sonden und Hörpunkt festhalten.
   Das Ergebnis ist die eine Schaltung, aus der Netlist, Live-Plan und Messungen entstehen. */

import { BAUTEILE, pinOrt, railName } from './bauteile.js';

class Vereinigung {
  constructor() { this.eltern = []; }
  neu() { this.eltern.push(this.eltern.length); return this.eltern.length - 1; }
  wurzel(i) {
    while (this.eltern[i] !== i) { this.eltern[i] = this.eltern[this.eltern[i]]; i = this.eltern[i]; }
    return i;
  }
  vereinige(a, b) { const x = this.wurzel(a), y = this.wurzel(b); if (x !== y) this.eltern[x] = y; }
}

const istAufSegment = (x, y, s) => {
  if (s.x1 === s.x2) return x === s.x1 && y >= Math.min(s.y1, s.y2) && y <= Math.max(s.y1, s.y2);
  if (s.y1 === s.y2) return y === s.y1 && x >= Math.min(s.x1, s.x2) && x <= Math.max(s.x1, s.x2);
  return false;
};

const natuerlich = (a, b) => a.localeCompare(b, 'de', {numeric: true, sensitivity: 'base'});

export function loeseNetze(projekt) {
  const v = new Vereinigung();
  const punkte = new Map();
  const punkt = (x, y) => {
    const k = `${x},${y}`;
    if (!punkte.has(k)) punkte.set(k, {i: v.neu(), x, y, grad: 0});
    return punkte.get(k);
  };

  const segmente = [];
  for (const d of projekt.draehte) {
    for (let i = 1; i < d.punkte.length; i++) {
      const [x1, y1] = d.punkte[i - 1], [x2, y2] = d.punkte[i];
      if (x1 === x2 && y1 === y2) continue;
      const a = punkt(x1, y1), b = punkt(x2, y2);
      v.vereinige(a.i, b.i);
      a.grad++; b.grad++;
      segmente.push({x1, y1, x2, y2, draht: d.id, a: a.i});
    }
  }

  const pins = [];
  for (const t of projekt.teile) {
    const def = BAUTEILE[t.typ];
    if (!def) continue;
    for (const pin of def.pins) {
      const o = pinOrt(t, pin);
      const q = punkt(o.x, o.y);
      q.grad++;
      pins.push({teil: t.id, pin: pin.id, x: o.x, y: o.y, i: q.i});
    }
  }

  /* T-Abzweige: ein Punkt, der irgendwo auf einem Segment liegt, gehört dazu. */
  for (const q of punkte.values()) {
    for (const s of segmente) {
      if (!istAufSegment(q.x, q.y, s)) continue;
      v.vereinige(q.i, s.a);
      const istEnde = (q.x === s.x1 && q.y === s.y1) || (q.x === s.x2 && q.y === s.y2);
      if (!istEnde) q.grad += 2;
    }
  }

  /* Netzgruppen: Masse, Versorgung und Netznamen verbinden auch ohne Draht. */
  const namensKnoten = new Map();
  const nameAnPin = new Map();
  for (const t of projekt.teile) {
    const def = BAUTEILE[t.typ];
    if (!def?.netzName) continue;
    const name = def.netzName(t);
    const pin = pins.find(p => p.teil === t.id);
    if (!pin) continue;
    nameAnPin.set(pin, name);
    if (!namensKnoten.has(name)) namensKnoten.set(name, pin.i);
    else v.vereinige(pin.i, namensKnoten.get(name));
  }

  const gruppen = new Map();
  for (const p of pins) {
    const w = v.wurzel(p.i);
    if (!gruppen.has(w)) gruppen.set(w, {pins: [], namen: new Set()});
    gruppen.get(w).pins.push(p);
  }
  for (const [p, name] of nameAnPin) gruppen.get(v.wurzel(p.i)).namen.add(name);

  const meldungen = [];
  const pinNetz = new Map();
  const netze = new Map();
  const wurzelName = new Map();
  for (const [w, g] of gruppen) {
    const istMess = p => {
      const t = projekt.teile.find(x => x.id === p.teil);
      return BAUTEILE[t.typ].istMessung;
    };
    const echte = g.pins.filter(p => !istMess(p));
    const namen = [...g.namen].sort(natuerlich);
    let name;
    if (g.namen.has('0')) name = '0';
    else if (namen.length) name = namen.find(n => /^[pm]\d/.test(n)) || namen[0];
    else {
      /* Der Name kommt vom „festesten“ Anschluss: Wird ein Kondensator umgesteckt, ändert sich nur seine eigene Zeile der Netlist. */
      const rang = q => {
        const typ = projekt.teile.find(x => x.id === q.teil).typ;
        return BAUTEILE[typ].gruppe === 'quelle' ? 0 : typ === 'r' || typ === 'pot' ? 1 : typ === 'c' || typ === 'elko' ? 3 : 2;
      };
      const basis = [...(echte.length ? echte : g.pins)].sort((a, b) => rang(a) - rang(b) || natuerlich(`${a.teil}.${a.pin}`, `${b.teil}.${b.pin}`))[0];
      name = `n_${basis.teil}_${basis.pin}`.toLowerCase().replace(/\+/g, 'p').replace(/-/g, 'm').replace(/[^a-z0-9_]/g, '_');
    }
    const schienen = namen.filter(n => n === '0' || /^[pm]\d/.test(n));
    if (schienen.length > 1) {
      meldungen.push({art: 'fehler', text: `Kurzschluss: ${schienen.map(n => n === '0' ? 'Masse' : n).join(' und ')} liegen auf demselben Netz.`, netz: name});
    } else if (namen.length > 1) {
      meldungen.push({art: 'warnung', text: `Ein Netz trägt mehrere Namen (${namen.join(', ')}). Es heißt in der Netlist „${name}“.`, netz: name});
    }
    wurzelName.set(w, name);
    netze.set(name, {name, pins: g.pins.map(p => `${p.teil}.${p.pin}`), echtePins: echte.length, x: g.pins[0].x, y: g.pins[0].y});
    for (const p of g.pins) pinNetz.set(`${p.teil}.${p.pin}`, name);
  }

  /* Darstellung: Punkte, an denen sich mindestens drei Enden treffen, bekommen einen Lötpunkt; Kreuzungen bleiben offen. */
  const loetpunkte = [];
  for (const q of punkte.values()) if (q.grad >= 3) loetpunkte.push({x: q.x, y: q.y});
  const kreuzungen = [];
  for (let i = 0; i < segmente.length; i++) {
    const a = segmente[i];
    if (a.y1 !== a.y2) continue;
    for (let j = 0; j < segmente.length; j++) {
      const b = segmente[j];
      if (b.x1 !== b.x2) continue;
      const x = b.x1, y = a.y1;
      if (x <= Math.min(a.x1, a.x2) || x >= Math.max(a.x1, a.x2) || y <= Math.min(b.y1, b.y2) || y >= Math.max(b.y1, b.y2)) continue;
      if (!punkte.has(`${x},${y}`)) kreuzungen.push({x, y});
    }
  }
  const segmentNetz = segmente.map(s => wurzelName.get(v.wurzel(s.a)) ?? null);

  return {pinNetz, netze, segmente, segmentNetz, loetpunkte, kreuzungen, meldungen};
}

/* ---------- Schaltung ---------- */

export function baueSchaltung(projekt, {ziel = 'spice'} = {}) {
  const netzInfo = loeseNetze(projekt);
  const {pinNetz, netze} = netzInfo;
  const elemente = [], sonden = [], meldungen = [...netzInfo.meldungen], naeherungen = [], teileInfo = [];
  let hoerpunkt = null;
  const railsErledigt = new Set();

  for (const t of projekt.teile) {
    const def = BAUTEILE[t.typ];
    if (!def) { meldungen.push({art: 'fehler', text: `Unbekanntes Bauteil „${t.typ}“ in ${t.id}.`}); continue; }
    const p = {};
    for (const pin of def.pins) p[pin.id] = pinNetz.get(`${t.id}.${pin.id}`);

    const ctx = {
      teil: t, ziel,
      knoten: suffix => `${t.id}_${suffix}`.toLowerCase(),
      add(el) { el.teil = t.id; elemente.push(el); },
      quelle(el) { this.add(el); },
      railQuelle(u, netz) {
        const name = `V${railName(u)}`;
        if (railsErledigt.has(name)) return;
        railsErledigt.add(name);
        const el = {k: 'V', id: name, a: netz, b: '0', welle: {art: 'dc', v: u}, teil: t.id, rail: u};
        elemente.push(el);
      },
      sonde(s) { sonden.push({...s, teil: t.id}); },
      hoerpunkt(netz, id) {
        if (hoerpunkt) meldungen.push({art: 'warnung', text: `Es gibt mehrere Hörpunkte. ${hoerpunkt.teil} gilt, ${id} wird nicht verwendet.`, teil: id});
        else hoerpunkt = {netz, teil: id};
      },
      belegt: pinId => {
        const n = netze.get(p[pinId]);
        return !!n && n.echtePins >= 2;
      },
      warnung(text) { meldungen.push({art: 'warnung', text, teil: t.id}); },
      naeherung(text) { naeherungen.push(text); }
    };
    def.ausbauen(ctx, t, p);
    teileInfo.push({id: t.id, typ: t.typ, modell: def.modell(t), pins: p});

    /* offene Anschlüsse */
    if (!def.istMessung && def.pins.length > 1 && !t.typ.match(/^(tl072|cd40106)$/)) {
      for (const pin of def.pins) {
        const n = netze.get(p[pin.id]);
        if (n && n.echtePins < 2) meldungen.push({art: 'warnung', text: `${t.id}: Pin ${pin.name || pin.id} ist nicht angeschlossen.`, teil: t.id});
      }
    }
    if (t.typ === 'tl072' && (p['8'] && netze.get(p['8']).echtePins < 2 || netze.get(p['4']).echtePins < 2)) {
      meldungen.push({art: 'fehler', text: `${t.id}: Die Versorgungspins 8 und 4 müssen angeschlossen sein.`, teil: t.id});
    }
    if (t.typ === 'cd40106' && (netze.get(p['14']).echtePins < 2 || netze.get(p['7']).echtePins < 2)) {
      meldungen.push({art: 'fehler', text: `${t.id}: Die Versorgungspins 14 (VDD) und 7 (VSS) müssen angeschlossen sein.`, teil: t.id});
    }
    if (t.typ === 'opv' && (netze.get(p['V+']).echtePins < 2 || netze.get(p['V-']).echtePins < 2)) {
      meldungen.push({art: 'fehler', text: `${t.id}: Ohne Versorgung an V+ und V− arbeitet der Operationsverstärker nicht. Bitte anschließen.`, teil: t.id});
    }
  }

  /* Regeln, die ngspice nicht verständlich meldet oder an denen es hängen bleibt */
  if (!projekt.teile.some(t => t.typ === 'gnd')) {
    meldungen.push({art: 'fehler', text: 'Es fehlt die Masse. Ohne Bezugspunkt gibt es keine Spannungen. Setze ein Massezeichen.'});
  }

  /* Eine Stromsonde, deren beide Pins auf einem Netz liegen, misst nichts und würde das System singulär machen. */
  for (let i = elemente.length - 1; i >= 0; i--) {
    const e = elemente[i];
    if (e.k === 'V' && e.a === e.b && e.welle?.art === 'dc' && e.welle.v === 0) {
      elemente.splice(i, 1);
      const s = sonden.findIndex(x => x.quelle === e.id);
      if (s >= 0) sonden.splice(s, 1);
      meldungen.push({art: 'hinweis', text: `${e.teil}: Beide Anschlüsse liegen auf demselben Netz. Die Stromsonde misst nichts und wird nicht gerechnet.`, teil: e.teil});
    }
  }

  const masche = new Vereinigung();
  const idx = new Map();
  const ix = n => { if (!idx.has(n)) idx.set(n, masche.neu()); return idx.get(n); };
  for (const e of elemente) {
    if (e.k !== 'V' && e.k !== 'E') continue;
    if (e.a === e.b) {
      meldungen.push({art: 'fehler', text: `${e.teil}: Beide Anschlüsse liegen auf demselben Netz „${e.a}“. Das ist ein Kurzschluss.`, teil: e.teil});
      continue;
    }
    if (masche.wurzel(ix(e.a)) === masche.wurzel(ix(e.b))) {
      meldungen.push({art: 'fehler', text: `${e.teil}: Spannungsquellen bilden hier eine Masche ohne Widerstand. Das ist elektrisch nicht lösbar. Setze einen Widerstand dazwischen oder gib der Quelle einen Innenwiderstand.`, teil: e.teil});
    }
    masche.vereinige(ix(e.a), ix(e.b));
  }
  /* Spulen sind bei Gleichstrom Kurzschlüsse */
  for (const e of elemente) {
    if (e.k !== 'L') continue;
    if (masche.wurzel(ix(e.a)) === masche.wurzel(ix(e.b))) {
      meldungen.push({art: 'warnung', text: `${e.teil}: Die Spule schließt eine Spannungsquelle gleichstrommäßig kurz. Der Arbeitspunkt ist dann nicht lösbar. Starte aus Anfangswerten oder ergänze einen Serienwiderstand.`, teil: e.teil});
    }
    masche.vereinige(ix(e.a), ix(e.b));
  }

  /* Netze ohne Gleichstrompfad zur Masse bekommen einen hochohmigen Hilfswiderstand, sichtbar in der Netlist. */
  const pfad = new Vereinigung();
  const pfadIdx = new Map();
  const px = n => { if (!pfadIdx.has(n)) pfadIdx.set(n, pfad.neu()); return pfadIdx.get(n); };
  px('0');
  const verbinde = (...knoten) => { for (let i = 1; i < knoten.length; i++) pfad.vereinige(px(knoten[0]), px(knoten[i])); };
  for (const e of elemente) {
    switch (e.k) {
      case 'R': case 'L': case 'V': verbinde(e.a, e.b); break;
      case 'E': verbinde(e.a, e.b); px(e.cp); px(e.cn); break;
      case 'C': case 'I': px(e.a); px(e.b); break;
      case 'GT': px(e.a); px(e.b); px(e.cp); px(e.cn); break;
      case 'D': verbinde(e.a, e.k_); break;
      case 'Q': verbinde(e.c, e.b, e.e); break;
      case 'M': verbinde(e.d, e.s); px(e.g); break;
      case 'ST': verbinde(e.aus, e.vss); px(e.ein); px(e.vdd); break;
    }
  }
  const nulle = pfad.wurzel(px('0'));
  const zusatz = [];
  for (const n of pfadIdx.keys()) {
    if (pfad.wurzel(px(n)) === nulle) continue;
    const istIntern = !netze.has(n);
    zusatz.push({k: 'R', id: `Rhilf_${n}`, a: n, b: '0', wert: 1e12, teil: null, hilf: true});
    if (!istIntern) meldungen.push({art: 'hinweis', text: `Netz „${n}“ hat keinen Gleichstrompfad zur Masse. Für die Berechnung hängt es über 1 TΩ an Masse.`, netz: n});
    pfad.vereinige(px(n), px('0'));
  }
  elemente.push(...zusatz);

  if (!sonden.length && ziel === 'spice') meldungen.push({art: 'hinweis', text: 'Noch keine Sonde gesetzt. Das Oszilloskop zeigt erst etwas, wenn du eine Spannungs- oder Stromsonde setzt.'});
  if (!hoerpunkt) meldungen.push({art: 'hinweis', text: 'Noch kein Hörpunkt gesetzt. Ohne Hörpunkt bleibt der Monitorweg still.'});

  return {
    titel: projekt.titel || 'Schaltung',
    elemente, sonden, hoerpunkt, meldungen, naeherungen, teileInfo,
    netzInfo,
    fehler: meldungen.filter(m => m.art === 'fehler')
  };
}

/* Zeigt, welche Stellen zweier Netlists sich unterscheiden: ungeordnet, Zeile für Zeile. */
export function netlistUnterschied(alt, neu) {
  /* Die erste Zeile ist der Titel mit der Laufnummer. */
  const zeilen = t => t.split('\n').slice(1).map(z => z.trim()).filter(z => z && !z.startsWith('*') && !/^(\.end|\.options|\.save)/i.test(z));
  const a = zeilen(alt), b = zeilen(neu);
  const az = new Map(), bz = new Map();
  a.forEach(z => az.set(z, (az.get(z) || 0) + 1));
  b.forEach(z => bz.set(z, (bz.get(z) || 0) + 1));
  const weg = [], dazu = [];
  for (const [z, n] of az) if ((bz.get(z) || 0) < n) weg.push(z);
  for (const [z, n] of bz) if ((az.get(z) || 0) < n) dazu.push(z);
  return {weg, dazu, gleich: !weg.length && !dazu.length};
}
