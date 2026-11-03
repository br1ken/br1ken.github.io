/* Audiolabor: prüft das Stecken. Die Gesten laufen als Zeigerereignisse durch den echten Schaltplan und das echte Steckbrett.
   Maßstab ist immer die Aufteilung der Pins in Netze: Verschieben ändert sie nie, Stecken ändert sie genau so, wie gewollt. */

import { Schaltplan } from './editor.js';
import { Steckbrett, abgleichen, gruppenAusBrett, buchsen, lochOrt } from './steckbrett.js';
import { gruppenAusPlan, gleicheGruppen, setzeNetze, koerperStoesst, laeuftDurch } from './umbau.js';
import { BAUTEILE, pinOrt } from './bauteile.js';
import { neuesTeil } from './aufbau.js?v=3';
import { VERSUCHE } from './versuche.js';

const versuch = id => VERSUCHE.find(v => v.id === id).bau();

/* Gleichverteilte Folge mit festem Startwert: Jeder Lauf prüft dieselben Züge. */
export function zufall(start) {
  let x = start >>> 0;
  return n => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return x % n;
  };
}

export class Pruefling {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'al-pult';
    this.el.style.cssText = `position:fixed;left:0;top:0;width:${Math.min(innerWidth, 1200)}px;height:${Math.min(innerHeight, 760)}px;z-index:9999;background:var(--bg)`;
    this.el.innerHTML = '<div class="al-flaeche" style="position:absolute;inset:0"><svg class="al-plan" tabindex="0"></svg><div class="al-brett" hidden></div></div>';
    document.body.append(this.el);
    this.svg = this.el.querySelector('.al-plan');
    this.svg.setPointerCapture = () => {};
    this.brettEl = this.el.querySelector('.al-brett');
    this.p = null;
    this.verlauf = [];
    this.meldung = '';
    const stelle = text => { this.text = text; this.plan.auswahlPruefen(); this.zeichne(); };
    const host = {
      projekt: () => this.p,
      schnappschuss: () => JSON.stringify(this.p),
      mutiere: (text, fn) => { const vorher = JSON.stringify(this.p); fn(this.p); host.uebernimm(text, vorher); },
      uebernimm: (text, vorher) => { this.verlauf.push(vorher); stelle(text); },
      zurueckZu: s => { this.p = JSON.parse(s); stelle(''); },
      rueckgaengig: () => { if (this.verlauf.length) { this.p = JSON.parse(this.verlauf.pop()); stelle(''); } },
      wiederholen: () => {},
      aktiv: () => this.brettEl.hidden,
      meldung: t => { this.meldung = t; }
    };
    this.host = host;
    this.plan = new Schaltplan(this.svg, host);
    this.brett = new Steckbrett(this.brettEl, host, {plan: this.plan, status: () => {}});
    this.brett.svg.setPointerCapture = () => {};
  }

  zeichne() {
    if (this.brettEl.hidden) this.plan.zeichne();
    else this.brett.zeichne();
  }

  lade(p) {
    this.p = p;
    this.verlauf.length = 0;
    this.meldung = '';
    this.plan.auswahl.teile.clear();
    this.plan.auswahl.draehte.clear();
    this.zeigeBrett(false);
    this.plan.alles();
  }

  zeigeBrett(an) {
    this.brettEl.hidden = !an;
    this.svg.style.display = an ? 'none' : '';
    this.zeichne();
  }

  entferne() { this.el.remove(); }

  gruppen() { return gruppenAusPlan(this.p); }

  /* Zeigerereignisse auf die aktive Fläche */
  _ereignis(svg, typ, x, y, zusatz = {}) {
    svg.dispatchEvent(new PointerEvent(typ, {clientX: x, clientY: y, pointerId: 1, button: 0, buttons: 1, bubbles: true, pointerType: 'mouse', ...zusatz}));
  }

  _zieheAuf(svg, a, b) {
    this._ereignis(svg, 'pointerdown', a.x, a.y);
    for (let i = 1; i <= 5; i++) this._ereignis(svg, 'pointermove', a.x + (b.x - a.x) * i / 5, a.y + (b.y - a.y) * i / 5);
    this._ereignis(svg, 'pointerup', b.x, b.y);
  }

  _bild(x, y) { return new DOMPoint(x, y).matrixTransform(this.svg.getScreenCTM()); }

  zieh(von, nach) { this._zieheAuf(this.svg, this._bild(...von), this._bild(...nach)); }

  tippe(ort) {
    const q = this._bild(...ort);
    this._ereignis(this.svg, 'pointerdown', q.x, q.y);
    this._ereignis(this.svg, 'pointerup', q.x, q.y);
  }

  unterZeiger(ort) { const q = this._bild(...ort); return document.elementFromPoint(q.x, q.y); }

  taste(key) { window.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true})); }

  waehle(id) {
    this.plan.auswahl.teile = new Set([id]);
    this.plan.auswahl.draehte.clear();
  }

  /* Griff eines Drahts ziehen: antippen wählt, dann liegt der Griff am Ende */
  zieheGriff(drahtId, ende, nach) {
    const d = this.p.draehte.find(x => x.id === drahtId);
    this.plan.auswahl.teile.clear();
    this.plan.auswahl.draehte = new Set([drahtId]);
    this.plan.zeichne();
    this.zieh(d.punkte[ende === 0 ? 0 : d.punkte.length - 1], nach);
  }

  pin(kennung) {
    const [id, pinId] = kennung.split('.');
    const t = this.p.teile.find(x => x.id === id);
    const o = pinOrt(t, BAUTEILE[t.typ].pins.find(q => q.id === pinId));
    return [o.x, o.y];
  }

  freiesTeil(typ, id, x, y) {
    const t = neuesTeil(typ, id, x, y);
    this.p.teile.push(t);
    this.plan.alles();
    return t;
  }

  netzVon(kennung) { return this.gruppen().find(g => g.has(kennung)); }

  verbunden(a, b) { return this.netzVon(a)?.has(b) ?? false; }

  /* Bein oder Kabelende auf dem Brett ziehen */
  zieheBrett(von, nach) {
    const b = (x, y) => new DOMPoint(x, y).matrixTransform(this.brett.svg.getScreenCTM());
    this._zieheAuf(this.brett.svg, b(von.x, von.y), b(nach.x, nach.y));
  }
}

/* Brettstand ohne Rücksicht auf die Reihenfolge der Einträge */
const brettStand = p => JSON.stringify({beine: Object.entries(p.steckbrett.beine).sort(([a], [b]) => (a < b ? -1 : 1)), kabel: p.steckbrett.kabel});

/* Ein Draht verläuft immer waagrecht oder senkrecht */
const alleGerade = p => p.draehte.every(d => d.punkte.every((q, i) => !i || q[0] === d.punkte[i - 1][0] || q[1] === d.punkte[i - 1][1]));

export async function pruefeStecken({gruppe, zeile}) {
  const f = new Pruefling();
  const pruefe = (name, erwartet, ok, gemessen = ok ? 'wie erwartet' : 'abweichend') => zeile(name, erwartet, gemessen, !!ok);

  try {
    gruppe('Stecken im Schaltplan', 'Echte Zeigerereignisse durch den Schaltplan. Gezählt wird, welche Pins danach verbunden sind.');

    f.lade(versuch('tiefpass'));
    f.freiesTeil('r', 'R9', 400, 200);
    f.zieh(f.pin('R9.1'), f.pin('C1.1'));
    pruefe('Vom Pin auf einen Pin ziehen', 'R9.1 hängt am Netz von C1.1', f.verbunden('R9.1', 'C1.1') && alleGerade(f.p));

    f.zieh(f.pin('R9.2'), [100, 80]);
    pruefe('Vom Pin auf einen Draht ziehen', 'R9.2 liegt auf Masse', f.verbunden('R9.2', 'GND1.1'));

    f.lade(versuch('tiefpass'));
    f.freiesTeil('r', 'R9', 400, 200);
    const vorLeer = JSON.stringify(f.p.draehte);
    f.zieh(f.pin('R9.1'), [400, 300]);
    pruefe('Ins Leere ziehen', 'kein neuer Draht, eine Meldung', JSON.stringify(f.p.draehte) === vorLeer && f.meldung.includes('Nicht eingesteckt'));

    f.zieh([60, 80], f.pin('R9.1'));
    pruefe('Aus einem Draht herausziehen', 'Abzweig: R9.1 liegt auf Masse', f.verbunden('R9.1', 'GND1.1'));

    /* Tippen auf einen Pin hängt das Kabel an den Zeiger: Der nächste Tipp steckt es ein. */
    f.lade(versuch('tiefpass'));
    f.freiesTeil('r', 'R9', 400, 200);
    f.tippe(f.pin('R9.1'));
    const haengt = f.plan.werkzeug?.art === 'draht';
    f.tippe(f.pin('C1.1'));
    pruefe('Pin antippen, Ziel antippen', 'R9.1 hängt am Netz von C1.1', haengt && !f.plan.werkzeug && f.verbunden('R9.1', 'C1.1'));

    /* Griff: Das Ende des Drahts am Kondensator wandert auf den Eingang. */
    f.lade(versuch('tiefpass'));
    const eingang = f.netzVon('G1.+');
    const d3 = f.p.draehte.find(d => d.punkte.some(q => q[0] === 200 && q[1] === -40));
    f.zieheGriff(d3.id, d3.punkte[0][1] === -60 ? 0 : 1, [40, -60]);
    pruefe('Drahtende am Griff umstecken', 'C1.1 liegt am Eingang', f.verbunden('C1.1', [...eingang][0]) && alleGerade(f.p));

    /* Griff an einem Draht, an dem Masse hängt: Der Rest bleibt verbunden. */
    f.lade(versuch('tiefpass'));
    const d4 = f.p.draehte.find(d => d.punkte.some(q => q[1] === 80));
    f.zieheGriff(d4.id, d4.punkte[0][0] === 200 ? 0 : 1, [400, 300]);
    pruefe('Griff ins Leere: Abziehen', 'C1.2 ist frei, Generator und Masse bleiben verbunden', !f.verbunden('C1.2', 'GND1.1') && f.verbunden('G1.-', 'GND1.1'));

    f.lade(versuch('tiefpass'));
    const stand = f.gruppen();
    f.waehle('C1');
    f.zieh(f.pin('C1.1').map((v, i) => v + (i ? 40 : 0)), [320, 40]);
    pruefe('Kondensator verschieben', 'alle Verbindungen unverändert, auch der Massepunkt auf dem Draht', gleicheGruppen(stand, f.gruppen()) && f.p.teile.find(t => t.id === 'C1').x !== 200);

    const vorher = JSON.stringify(f.p);
    f.waehle('C1');
    f.taste('r');
    pruefe('Drehen mit R', 'alle Verbindungen unverändert', gleicheGruppen(stand, f.gruppen()) && JSON.stringify(f.p) !== vorher && alleGerade(f.p));
    f.waehle('C1');
    f.taste('m');
    pruefe('Spiegeln mit M', 'alle Verbindungen unverändert', gleicheGruppen(stand, f.gruppen()));
    f.waehle('C1');
    f.taste('ArrowLeft');
    pruefe('Pfeiltaste', 'alle Verbindungen unverändert', gleicheGruppen(stand, f.gruppen()));

    /* Die Sonde klemmt um: Nur sie wechselt das Netz. */
    f.lade(versuch('tiefpass'));
    f.zieh(f.pin('CH1.1'), [100, 80]);
    pruefe('Sonde auf ein anderes Netz ziehen', 'CH1 misst jetzt dort, sonst bleibt alles', f.verbunden('CH1.1', 'GND1.1') && f.verbunden('R1.2', 'C1.1'));

    f.lade(versuch('tiefpass'));
    const standS = f.gruppen();
    f.zieh(f.pin('CH1.1'), [280, 160]);
    pruefe('Sonde auf freie Fläche ziehen', 'bleibt über einen Draht am alten Netz', gleicheGruppen(standS, f.gruppen()));

    /* Teil mit angeschlossenem Pin auf ein fremdes Netz: abgelehnt */
    f.lade(versuch('teiler'));
    const standK = f.gruppen();
    const vorK = JSON.stringify(f.p);
    f.waehle('R3');
    const r3 = f.p.teile.find(t => t.id === 'R3');
    f.zieh([r3.x, r3.y], [r3.x - 180, r3.y - 20]);
    pruefe('Angeschlossenen Pin auf fremdes Netz', 'bleibt ohne Kurzschluss, die Netze stimmen', gleicheGruppen(standK, f.gruppen()), f.meldung || JSON.stringify(f.p) === vorK ? 'abgelehnt oder umgelegt' : 'umgelegt');

    /* Bauteil auf einen Draht fallen lassen */
    f.lade(versuch('tiefpass'));
    f.plan.setzeWerkzeug('einsetzen', 'r');
    const ziel = f._bild(240, -60);
    f.plan.loslassenVonListe(ziel.x, ziel.y);
    const neu = f.p.teile.find(t => t.typ === 'r' && t.id !== 'R1');
    pruefe('Widerstand auf einen Draht fallen lassen', 'wird in Reihe eingeschleift', neu && f.verbunden(`${neu.id}.1`, 'R1.2') !== f.verbunden(`${neu.id}.2`, 'R1.2'));

    /* Rückgängig stellt den genauen Stand wieder her */
    f.lade(versuch('tiefpass'));
    const urzustand = JSON.stringify(f.p);
    f.waehle('C1');
    f.zieh([200, 0], [320, 40]);
    f.host.rueckgaengig();
    pruefe('Rückgängig', 'derselbe Stand wie vorher', JSON.stringify(f.p) === urzustand);

    /* Ein Drahtstück lässt sich verschieben, aber nicht auf ein fremdes Netz */
    f.lade(versuch('tiefpass'));
    const standD = f.gruppen();
    const d4Stueck = f.p.draehte.find(d => d.punkte.some(q => q[1] === 80));
    f.plan.auswahl.draehte = new Set([d4Stueck.id]);
    f.plan.zeichne();
    f.zieh([40, 80], [40, 120]);
    const nachUnten = JSON.stringify(f.p.draehte.find(d => d.id === d4Stueck.id).punkte);
    pruefe('Drahtstück verschieben', 'der Draht verläuft anders, die Netze bleiben gleich', gleicheGruppen(standD, f.gruppen()) && nachUnten !== JSON.stringify(d4Stueck.punkte));
    f.lade(versuch('tiefpass'));
    const d1Stueck = f.p.draehte.find(d => d.punkte.some(q => q[1] === 80));
    f.plan.auswahl.draehte = new Set([d1Stueck.id]);
    f.plan.zeichne();
    f.zieh([40, 80], [40, -60]);
    pruefe('Drahtstück auf ein fremdes Netz', 'abgelehnt, alles wie vorher', gleicheGruppen(standD, f.gruppen()) && f.meldung.includes('anderes Netz'), f.meldung);

    /* Entfernen hält zusammen, was über den Pin verbunden war */
    f.lade(versuch('tiefpass'));
    f.p.teile.push(neuesTeil('gnd', 'GND7', 300, 80));
    f.p.draehte = f.p.draehte.filter(d => !d.punkte.some(q => q[1] === 80));
    f.p.draehte.push({id: 'D8', punkte: [[0, 40], [0, 80], [300, 80]]}, {id: 'D9', punkte: [[200, 40], [200, 60], [300, 60], [300, 80]]});
    f.p.teile = f.p.teile.filter(t => t.id !== 'GND1');
    f.plan.zeichne();
    f.waehle('GND7');
    f.taste('Delete');
    pruefe('Massezeichen auf der Verzweigung löschen', 'die Drähte daran bleiben verbunden', f.verbunden('G1.-', 'C1.2'));

    /* Zufällige Züge durch alle Versuche */
    let zuege = 0, fehler = '';
    for (const v of VERSUCHE) {
      const r = zufall(v.id.length * 7919 + 13);
      f.lade(v.bau());
      const soll = f.gruppen();
      for (let i = 0; i < 12; i++) {
        const teile = f.p.teile.filter(t => BAUTEILE[t.typ].pins.length > 1);
        const t = teile[r(teile.length)];
        const o = [t.x, t.y];
        const nach = [o[0] + (r(13) - 6) * 40, o[1] + (r(9) - 4) * 40];
        /* Liegt dort ein Pin, wäre das ein Kabel und kein Verschieben. */
        const unten = f.unterZeiger(o);
        if (unten?.dataset.pin || unten?.closest('[data-teil]')?.dataset.teil !== t.id) continue;
        f.waehle(t.id);
        f.zieh(o, nach);
        zuege++;
        if (!gleicheGruppen(soll, f.gruppen())) { fehler = `${v.id}: ${t.id} Zug ${i + 1}`; break; }
        if (!alleGerade(f.p)) { fehler = `${v.id}: schräger Draht nach ${t.id}`; break; }
      }
      if (fehler) break;
      const teile = f.p.teile;
      const stoss = teile.find(t => koerperStoesst(f.p, t));
      if (stoss) { fehler = `${v.id}: ${stoss.id} liegt auf einem anderen Teil`; break; }
      const unter = teile.find(t => f.p.draehte.some(d => laeuftDurch(d, t)));
      if (unter && !v.bau().teile.some(t => t.id === unter.id && v.bau().draehte.some(d => laeuftDurch(d, t)))) { fehler = `${v.id}: Draht unter ${unter.id}`; break; }
    }
    pruefe(`${zuege} zufällige Züge in ${VERSUCHE.length} Versuchen`, 'die Netze ändern sich nie, nichts liegt übereinander', !fehler, fehler || 'keine Abweichung');

    gruppe('Stecken auf dem Brett', 'Brett und Schaltplan müssen dieselbe Aufteilung haben, in beide Richtungen.');

    for (const v of VERSUCHE) {
      const p = v.bau();
      abgleichen(p);
      const einmal = brettStand(p);
      abgleichen(p);
      const gleich = gleicheGruppen(gruppenAusBrett(p), gruppenAusPlan(p));
      zeile(`Aufbau: ${v.titel}`, 'Brett und Plan gleich, zweiter Abgleich ändert nichts', `${Object.keys(p.steckbrett.beine).length} Beine, ${p.steckbrett.kabel.length} Kabel`, gleich && einmal === brettStand(p));
    }

    /* Zwei Finger: Der Brettpunkt unter der Mitte bleibt beim Zoomen fest. */
    f.lade(versuch('tiefpass'));
    f.zeigeBrett(true);
    f.brett.setzeMassstab(1);
    f.brettEl.scrollLeft = 200;
    const rect = f.brettEl.getBoundingClientRect();
    const mx = rect.width / 2, my = Math.min(200, rect.height / 2);
    const wx = (f.brettEl.scrollLeft + mx) / f.brett.massstab;
    const finger = (typ, id, dx) => f._ereignis(f.brett.svg, typ, rect.left + mx + dx, rect.top + my, {pointerId: id, pointerType: 'touch'});
    finger('pointerdown', 11, -60);
    finger('pointerdown', 12, 60);
    finger('pointermove', 11, -100);
    finger('pointermove', 12, 100);
    const ankerFehler = Math.abs((f.brettEl.scrollLeft + mx) / f.brett.massstab - wx);
    const scrollVor = f.brettEl.scrollLeft;
    finger('pointermove', 12, 100);
    pruefe('Zwei Finger: Zoom ohne Wandern', 'Brettpunkt bleibt unter der Mitte, Wiederholung verschiebt nichts', ankerFehler < 1 && Math.abs(f.brettEl.scrollLeft - scrollVor) < 1);
    finger('pointerup', 11, -100);
    finger('pointerup', 12, 100);
    f.brett.alles();

    /* Bein mit dem Zeiger umstecken */
    f.lade(versuch('tiefpass'));
    f.zeigeBrett(true);
    const b0 = f.p.steckbrett.beine['C1.1'];
    const c11 = lochOrt(b0.s, b0.r);
    const frei = lochOrt(50, 2);
    f.zieheBrett(c11, frei);
    pruefe('Bein auf einen freien Streifen stecken', 'C1.1 ist vom Ausgang getrennt, Plan und Brett gleich', !f.verbunden('C1.1', 'R1.2') && gleicheGruppen(gruppenAusBrett(f.p), gruppenAusPlan(f.p)));

    /* Zurückstecken verbindet wieder */
    const r12 = f.p.steckbrett.beine['R1.2'];
    const zurueck = lochOrt(r12.s, r12.r === 4 ? 3 : r12.r === 0 ? 1 : r12.r + 1);
    f.zieheBrett(frei, zurueck);
    pruefe('Bein in den Streifen von R1 stecken', 'C1.1 liegt wieder am Ausgang', f.verbunden('C1.1', 'R1.2') && gleicheGruppen(gruppenAusBrett(f.p), gruppenAusPlan(f.p)));

    const brettGleich = () => gleicheGruppen(gruppenAusBrett(f.p), gruppenAusPlan(f.p));

    /* Kabel von einer freien Messbuchse: Die Sonde entsteht und misst an diesem Streifen. */
    f.lade(versuch('tiefpass'));
    f.zeigeBrett(true);
    const ch3 = buchsen(f.p).find(b => b.id === 'kanal:2');
    const amAusgang = f.p.steckbrett.beine['R1.2'];
    const lochAusgang = lochOrt(amAusgang.s, amAusgang.r === 4 ? 3 : 4);
    f.zieheBrett(ch3.ort, lochAusgang);
    const sonden = f.p.teile.filter(t => t.typ === 'sonde');
    const neueSonde = sonden.find(t => !['CH1', 'CH2'].includes(t.id));
    pruefe('Kabel von der Buchse CH3 auf den Ausgang', 'neue Sonde am Ausgang, sie klemmt ohne eigenen Draht', neueSonde && f.verbunden(`${neueSonde.id}.1`, 'R1.2') && brettGleich());

    const neuesKabel = f.p.steckbrett.kabel.find(c => c.a.id === 'kanal:2' || c.b.id === 'kanal:2');
    const kabelEnde = neuesKabel.a.art === 'loch' ? neuesKabel.a : neuesKabel.b;
    f.zieheBrett(lochOrt(kabelEnde.s, kabelEnde.r), {x: lochOrt(30, 0).x, y: lochOrt(30, 9).y + 60});
    pruefe('Kabelende ins Leere ziehen', 'Kabel weg, die Sonde auch', !f.p.teile.some(t => t.id === neueSonde.id) && brettGleich());

    /* Aus der Liste auf das Brett */
    f.brett.setzeWerkzeug('einsetzen', 'r');
    const zielLoch = new DOMPoint(lochOrt(30, 2).x, lochOrt(30, 2).y).matrixTransform(f.brett.svg.getScreenCTM());
    f.brett.loslassenVonListe(zielLoch.x, zielLoch.y);
    const neuR = f.p.teile.find(t => t.typ === 'r' && t.id !== 'R1');
    const beinA = f.p.steckbrett.beine[`${neuR?.id}.1`];
    pruefe('Widerstand aus der Liste einstecken', 'steht um Spalte 31 herum, im Plan ist er auch da', beinA?.s === 28 && beinA?.r === 2 && brettGleich());

    /* Ganzes Teil versetzen */
    const mitte = lochOrt(30, 2);
    f.zieheBrett(mitte, lochOrt(40, 7));
    const beinB = f.p.steckbrett.beine[`${neuR.id}.1`];
    pruefe('Teil auf dem Brett versetzen', 'beide Beine wandern mit', beinB?.s === 38 && beinB?.r === 7 && brettGleich());

    /* Kabel von einem Loch zum nächsten: Der Widerstand kommt zwischen Ausgang und Masse. */
    const r2Bein = f.p.steckbrett.beine[`${neuR.id}.2`];
    f.zieheBrett(lochOrt(r2Bein.s, 8), lochOrt(amAusgang.s, amAusgang.r === 3 ? 4 : 3));
    pruefe('Kabel zwischen zwei Streifen', `${neuR.id}.2 liegt am Ausgang`, f.verbunden(`${neuR.id}.2`, 'R1.2') && brettGleich());

    /* Umdrehen wie von Hand: Die Diode steckt andersherum in denselben Löchern. */
    f.lade(versuch('clipper'));
    f.zeigeBrett(true);
    const diodeVorher = {A: {...f.p.steckbrett.beine['D1.A']}, K: {...f.p.steckbrett.beine['D1.K']}};
    f.plan.auswahl.teile = new Set(['D1']);
    f.taste('r');
    const gedreht = f.p.steckbrett.beine['D1.A'], gedrehtK = f.p.steckbrett.beine['D1.K'];
    pruefe('Diode auf dem Brett umdrehen (R)', 'Anode und Kathode tauschen die Löcher, im Plan auch', gedreht.s === diodeVorher.K.s && gedrehtK.s === diodeVorher.A.s && f.verbunden('D1.A', 'GND1.1') && brettGleich());

    /* Löschen im Brett: gewähltes Kabel */
    const zahlKabel = f.p.steckbrett.kabel.length;
    f.brett.kabelWahl = f.p.steckbrett.kabel[0].id;
    f.brett.loesche();
    pruefe('Gewähltes Kabel entfernen', 'ein Kabel weniger, Plan und Brett gleich', f.p.steckbrett.kabel.length <= zahlKabel && f.brett.kabelWahl === null && brettGleich());

    /* Zufälliges Umstecken auf dem Brett, ohne Zeiger, aber über denselben Weg ins Projekt */
    let umgesteckt = 0;
    fehler = '';
    for (const v of VERSUCHE) {
      const r = zufall(v.id.charCodeAt(0) * 104729 + 1);
      const p = v.bau();
      abgleichen(p);
      for (let i = 0; i < 10; i++) {
        const beine = Object.keys(p.steckbrett.beine);
        const k = beine[r(beine.length)];
        const t = p.teile.find(x => k.startsWith(`${x.id}.`));
        if (BAUTEILE[t.typ].steck?.startsWith('dip')) continue;
        p.steckbrett.beine[k] = {art: 'loch', s: 40 + r(20), r: r(10)};
        setzeNetze(p, gruppenAusBrett(p));
        umgesteckt++;
        if (!gleicheGruppen(gruppenAusBrett(p), gruppenAusPlan(p))) { fehler = `${v.id}: ${k} Schritt ${i + 1}`; break; }
        abgleichen(p);
        if (!gleicheGruppen(gruppenAusBrett(p), gruppenAusPlan(p))) { fehler = `${v.id}: Abgleich nach ${k}`; break; }
      }
      if (fehler) break;
    }
    pruefe(`${umgesteckt}-mal zufällig umgesteckt`, 'Plan und Brett bleiben gleich', !fehler, fehler || 'keine Abweichung');
  } finally {
    f.entferne();
  }
}
