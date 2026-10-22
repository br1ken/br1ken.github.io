/* Missionen im Crashtest-Labor: kurze Aufgaben mit live geprüften Zielen und schnellen Belohnungen.
   Jedes erreichte Ziel: +20 XP sofort (Zahl steigt auf, Ding, Vibration). Mission geschafft: +50 XP, ohne Tipp +30.
   Liest den Zustand des Labors über window.OSCILab (siehe Ende von labor.js).
   Neue Mission: unten in MISSIONEN ergänzen — goals sind [Text, Prüffunktion(c)], setup ist ein Startaufbau als Kette
   ({type, p} je Baustein; control: i heißt „wird vom Sequencer an Position i gespielt“). */
'use strict';
(() => {
  const lab = window.OSCILab, hud = document.getElementById('mission-hud');
  if (!lab || !hud) return;
  const $ = id => document.getElementById(id);
  const KEY = 'osci-log-missionen';
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  /* Vibrieren nur nach dem ersten Antippen (Browser blockieren es sonst) und nur, wo es das gibt (Android). */
  const buzz = pattern => { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(pattern); };
  const XP_GOAL = 20, XP_MISSION = 50, XP_PERFECT = 30;

  const MISSIONEN = [
    {id: 'funke', lex: 'oszillator', title: 'Erster Funke', badge: 'funke',
      story: 'Ein Knopf. Ein Ton. Los geht’s.',
      goals: [['Eine Klangquelle hängt am Ausgang', c => c.audible], ['Der Ton läuft', c => c.playing]],
      hint: 'Drück oben auf „▶︎ Ton starten“. Hörst du nichts? Lautstärke und Lautlos-Schalter prüfen.',
      why: 'Eine Klangquelle schwingt hunderte Male pro Sekunde hin und her. Der Lautsprecher macht daraus Druckwellen in der Luft — dein Ohr hört Töne.',
      setup: [{type: 'seq'}, {type: 'delay'}]},
    {id: 'oktave', lex: 'tonhoehe', title: 'Eine Oktave höher',
      story: 'Stimm den Oszillator auf das A der Musiker: 440 Hz.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Oszillator spielt 440 Hz (± 3 Hz)', c => c.of('osc').some(n => !lab.controllerOf(n) && near(n.p.frequency, 440, 3))]],
      hint: 'Tippe beim Oszillator auf ×2 — das verdoppelt die Frequenz.',
      why: 'Doppelte Frequenz heißt eine Oktave höher. Unser Ohr hört Verhältnisse, nicht Abstände: 110, 220, 440 und 880 Hz sind alles A, jeweils eine Oktave auseinander.',
      setup: [{type: 'osc', p: {frequency: 220, wave: 'triangle'}}]},
    {id: 'rechteck', lex: 'wellenformen', title: 'Kanten statt Kurven',
      story: 'Mach aus der runden Welle eine eckige.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Oszillator spielt Rechteck ⊓', c => c.of('osc').some(n => n.p.wave === 'square')]],
      hint: 'Wähle beim Oszillator die Wellenform ⊓ Rechteck.',
      why: 'Ein Rechteck springt hart zwischen zwei Werten. Darin steckt eine ganze Reihe Sinustöne: f, 3f, 5f, 7f … — die ungeraden Obertöne. Darum klingt es hohl und schnarrend, wie ein alter Videospiel-Sound.',
      setup: [{type: 'osc', p: {frequency: 220, wave: 'sine'}}]},
    {id: 'weich', lex: 'tiefpass', title: 'Mach’s weich', badge: 'filter',
      story: 'Filter dem Sägezahn die Schärfe weg.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Tiefpass (C) ist im Signalweg', c => c.of('capacitor').length > 0], ['Grenzfrequenz unter 300 Hz', c => c.of('capacitor').some(n => lab.rcCutoff(n) < 300)]],
      hint: 'Zweimal ×2 bei der Kapazität C. Jedes Verdoppeln halbiert die Grenzfrequenz.',
      why: 'Beim RC-Tiefpass gilt fᶜ = 1 / (2πRC). Größeres C, kleinere Grenzfrequenz: Alles darüber wird leiser, der Klang dumpf — wie Musik aus dem Nebenzimmer, denn Wände schlucken vor allem die Höhen.',
      setup: [{type: 'osc', p: {frequency: 220, wave: 'sawtooth'}}, {type: 'capacitor', p: {c: 22, r: 10}}]},
    {id: 'puls', lex: 'tremolo', title: 'Puls fühlen', badge: 'takt',
      story: 'Lass den Ton zweimal pro Sekunde pulsieren.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Tremolo ist im Signalweg', c => c.of('tremolo').length > 0], ['Tempo 1,5 bis 2,5 Hz', c => c.of('tremolo').some(n => n.p.rate >= 1.5 && n.p.rate <= 2.5)], ['Tiefe mindestens 80 %', c => c.of('tremolo').some(n => n.p.depth >= 80)]],
      hint: 'Tempo einmal ÷2 (4 → 2 Hz). Die Tiefe mit + hochdrehen.',
      why: 'Ein langsamer Oszillator (2 Hz) steuert die Lautstärke eines schnellen (220 Hz). Das ist Amplitudenmodulation — dasselbe Prinzip wie beim AM-Radio, nur liegt dort der Träger bei rund einer Million Hertz.',
      setup: [{type: 'osc', p: {frequency: 220, wave: 'triangle'}}, {type: 'tremolo', p: {rate: 4, depth: 45}}]},
    {id: 'schwebung', lex: 'schwebung', title: 'Wabern',
      story: 'Zwei fast gleiche Töne — bring sie zum Wabern.',
      goals: [['Der Ton läuft', c => c.playing], ['Zwei Oszillatoren im Signalweg', c => c.of('osc').length >= 2], ['1 bis 5 Hz auseinander', c => { const f = c.of('osc').filter(n => !lab.controllerOf(n)).map(n => n.p.frequency); return f.some((a, i) => f.some((b, j) => i !== j && Math.abs(a - b) >= 1 && Math.abs(a - b) <= 5)); }]],
      hint: 'Zieh den zweiten Ton ganz langsam Richtung 220 Hz. Wird das Wummern langsamer, bist du nah dran.',
      why: 'Zwei dicht beieinander liegende Frequenzen verstärken und schwächen sich abwechselnd. Diese Schwebung pulsiert genau mit |f₁ − f₂|. Gitarristen stimmen so: Verschwindet das Wabern, stimmen die Saiten.',
      setup: [{type: 'osc', p: {frequency: 220, wave: 'sine'}}, {type: 'osc', p: {frequency: 236, wave: 'sine'}}]},
    {id: 'melodie', lex: 'sequencer', title: 'Deine Melodie', badge: 'takt',
      story: 'Tipp dir eine Melodie ins Raster.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Sequencer ist dabei', c => c.of('seq').length > 0], ['Mindestens 6 Noten gesetzt', c => c.of('seq').some(n => lab.seqCount(n.p) >= 6)]],
      hint: 'Tipp auf die Kästchen: Spalten sind Schritte, Zeilen Tonhöhen. Keine Idee? „Zufall“.',
      why: 'Ein Sequencer ist ein Taktgeber mit Gedächtnis: Bei jedem Schritt schaut er nach, welche Töne an sind. Alle Zeilen gehören zur Pentatonik — fünf Töne pro Oktave ohne Halbtonschritte. Deshalb klingt fast jede Kombination gut.',
      setup: [{type: 'seq', p: {grid: [0, 0, 0, 0, 0, 0, 0, 0], tempo: 110}}]},
    {id: 'kopplung', lex: 'cv-gate', title: 'Gekoppelt', badge: 'modular',
      story: 'Lass den Sequencer einen Oszillator spielen.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Sequencer spielt einen Oszillator', c => c.of('osc').some(n => lab.controllerOf(n))]],
      hint: 'Beim Oszillator auf „♪︎ Sequencer“ tippen. Im freien Pult: Kabel von OUT des Sequencers in SEQ des Oszillators.',
      why: 'Jetzt schickt der Sequencer keine Töne mehr, sondern Befehle: welche Tonhöhe, wann an, wann aus. In echten Modular-Synthesizern sind das zwei Spannungen — CV für die Tonhöhe (oft 1 Volt pro Oktave) und Gate für An/Aus.',
      setup: [{type: 'seq'}, {type: 'osc', p: {frequency: 220, wave: 'sawtooth'}}, {type: 'capacitor', p: {c: 10, r: 10}}]},
    {id: 'akkord', lex: 'intervalle', title: 'Zweistimmig', badge: 'modular',
      story: 'Ein Sequencer, zwei Oszillatoren — und eine Quinte.',
      goals: [['Der Ton läuft', c => c.playing], ['Zwei Oszillatoren am selben Sequencer', c => pairs(c).length > 0], ['Verhältnis 3 : 2 (Quinte)', c => pairs(c).some(([a, b]) => near(Math.max(a, b) / Math.min(a, b), 1.5, .02))]],
      hint: 'Stell einen der beiden auf 330 Hz — 330 / 220 = 3/2.',
      why: 'Im Verhältnis 3 : 2 treffen sich die Wellen nach zwei bzw. drei Schwingungen wieder — das Ohr hört das als besonders wohlklingend. Die Quinte ist nach der Oktave (2 : 1) das einfachste Verhältnis überhaupt; Powerchords auf der E-Gitarre sind genau das.',
      setup: [{type: 'seq'}, {type: 'osc', p: {frequency: 220, wave: 'sawtooth'}, control: 0}, {type: 'osc', p: {frequency: 220, wave: 'square'}, control: 0}]},
    {id: 'echo', lex: 'echo', title: 'Echo im Canyon',
      story: 'Bau dir eine Felswand, die antwortet.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Sequencer ist dabei', c => c.of('seq').length > 0], ['Ein Echo im Signalweg', c => c.of('delay').length > 0], ['Rückkopplung mindestens 50 %', c => c.of('delay').some(n => n.p.feedback >= 50)]],
      hint: 'Dreh beim Echo die Rückkopplung g mit + hoch.',
      why: 'Das Echo spielt das Signal nach Δt noch einmal ab, um den Faktor g leiser. Weil es zurück in den Speicher läuft, entsteht g, g², g³, … — eine geometrische Reihe. Solange g < 1 ist, klingt sie ab. Bei g ≥ 1 würde es immer lauter: echte Rückkopplung, wie das Pfeifen eines Mikrofons vor dem Lautsprecher.',
      setup: [{type: 'seq'}, {type: 'delay', p: {time: 273, feedback: 20, mix: 50}}]},
    {id: 'crash', lex: 'verzerrung', title: 'Crashtest', badge: 'crash',
      story: 'Schick einen sauberen Sinus durch zwei Dioden. Übersteuern!',
      goals: [['Der Ton läuft', c => c.playing], ['Oszillator mit Sinus', c => c.of('osc').some(n => n.p.wave === 'sine')], ['Ein Verzerrer im Signalweg', c => c.of('distortion').length > 0], ['Übersteuerung mindestens × 20', c => c.of('distortion').some(n => n.p.drive >= 20)]],
      hint: 'Ein paar Mal ×2 bei der Übersteuerung — und dabei aufs Oszilloskop schauen.',
      why: 'Dioden leiten erst ab etwa 0,7 V. Zwei gegeneinander schneiden alles darüber ab. Je stärker du übersteuerst, desto flacher die Kuppen: Aus dem Sinus wird fast ein Rechteck — mit genau den Obertönen aus Mission 3.',
      setup: [{type: 'osc', p: {frequency: 220, wave: 'sine'}}, {type: 'distortion', p: {drive: 2}}]},
    {id: 'hochpass', lex: 'hochpass', title: 'Nur die Höhen', badge: 'filter',
      story: 'Filter umdrehen: Lass nur die hohen Töne durch.',
      goals: [['Der Ton läuft', c => c.playing], ['Ein Hochpass (CR) im Signalweg', c => c.of('highpass').length > 0], ['Grenzfrequenz über 1 kHz', c => c.of('highpass').some(n => lab.rcCutoff(n) > 1000)]],
      hint: 'Zweimal ÷2 bei der Kapazität C. Halbes C, doppelte Grenzfrequenz.',
      why: 'Der Kondensator hat den Blindwiderstand 1 / (2πfC): Bei tiefen Frequenzen ist er riesig und sperrt, bei hohen fast null. Darum klingt es dünn wie ein altes Telefon. In Lautsprecherboxen trennen genau solche Filter die Höhen für den Hochtöner ab.',
      setup: [{type: 'osc', p: {frequency: 220, wave: 'sawtooth'}}, {type: 'highpass', p: {c: 47, r: 10}}]},
    {id: 'werk', lex: 'modular', title: 'Dein Werk', badge: 'leitung',
      story: 'Keine Regeln. Bau, was dir gefällt — so schräg du willst.',
      goals: [['Der Ton läuft', c => c.playing], ['Mindestens 4 Bausteine im Signalweg', c => c.active.filter(n => n.type !== 'out').length >= 4], ['Mindestens 2 verschiedene Effekte', c => new Set(c.active.filter(n => !['osc', 'seq', 'out'].includes(n.type)).map(n => n.type)).size >= 2]],
      hint: 'Zum Beispiel: Sequencer spielt Oszillator → Verzerrer → Tiefpass → Echo.',
      why: 'Genau so arbeiten Tonstudios, Effektboards und Synthesizer: eine Kette aus Bausteinen, die das Signal jeweils auf ihre Art verändern. Teile dein Werk über „↗︎ Teilen“ — der Link enthält deinen ganzen Aufbau.',
      setup: null}
  ];
  /* Oszillator-Paare am selben Sequencer: [f1, f2] */
  function pairs(c) {
    const played = c.of('osc').filter(n => lab.controllerOf(n)), out = [];
    played.forEach((a, i) => played.slice(i + 1).forEach(b => { if (lab.controllerOf(a) === lab.controllerOf(b)) out.push([a.p.frequency, b.p.frequency]); }));
    return out;
  }
  const BADGES = [
    {id: 'funke', name: 'Erster Funke', sym: '∿', need: ['funke'], text: 'Den ersten Ton gezündet'},
    {id: 'filter', name: 'Filter-Fuchs', sym: 'RC', need: ['weich', 'hochpass'], text: 'Tief- und Hochpass gemeistert'},
    {id: 'takt', name: 'Taktgefühl', sym: '♪︎', need: ['puls', 'melodie'], text: 'Puls und Melodie gebaut'},
    {id: 'modular', name: 'Modular-Kopf', sym: '⇄', need: ['kopplung', 'akkord'], text: 'Oszillatoren per Sequencer gespielt'},
    {id: 'crash', name: 'Crashtest-Pilot', sym: '⊣⊢', need: ['crash'], text: 'Einen Sinus zum Rechteck verbogen'},
    {id: 'leitung', name: 'Laborleitung', sym: '★', need: MISSIONEN.map(m => m.id), text: 'Alle Missionen geschafft'}
  ];
  const LEVELS = [[0, 'Neugier'], [150, 'Bastelei'], [400, 'Tüftelei'], [800, 'Ingenieurskunst'], [1300, 'Laborleitung']];

  /* ---------- Fortschritt ---------- */
  let progress = {done: {}, hinted: {}, goals: {}, current: null, hidden: false, streak: {days: 0, last: ''}};
  try { progress = {...progress, ...JSON.parse(localStorage.getItem(KEY) || '{}')}; } catch { /* ohne Speicher */ }
  progress.goals ||= {}; progress.streak ||= {days: 0, last: ''};
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* egal */ } };
  const doneCount = () => MISSIONEN.filter(m => progress.done[m.id]).length;
  const xp = () => MISSIONEN.reduce((sum, m) => sum + (progress.goals[m.id]?.length || 0) * XP_GOAL + (progress.done[m.id] ? XP_MISSION + (progress.done[m.id] === 3 ? XP_PERFECT : 0) : 0), 0);
  function level(points = xp()) {
    let i = 0;
    while (i + 1 < LEVELS.length && points >= LEVELS[i + 1][0]) i++;
    const next = LEVELS[i + 1]?.[0];
    return {n: i + 1, name: LEVELS[i][1], pct: next ? (points - LEVELS[i][0]) / (next - LEVELS[i][0]) * 100 : 100, next};
  }
  const earned = id => BADGES.find(b => b.id === id).need.every(m => progress.done[m]);
  if (!MISSIONEN.some(m => m.id === progress.current)) progress.current = (MISSIONEN.find(m => !progress.done[m.id]) || MISSIONEN[0]).id;
  const current = () => MISSIONEN.find(m => m.id === progress.current);
  /* Nächste offene Mission nach der aktuellen (in Reihenfolge), sonst die erste offene überhaupt */
  const nextOpen = () => { const i = MISSIONEN.indexOf(current()); return MISSIONEN.slice(i + 1).find(m => !progress.done[m.id]) || MISSIONEN.find(m => !progress.done[m.id]); };
  const stars = n => `<span class="stars" aria-label="${n} von 3 Sternen">${'★'.repeat(n)}<span class="stars-off">${'★'.repeat(3 - n)}</span></span>`;
  /* Tages-Serie: an wie vielen Tagen hintereinander jemand mindestens ein Ziel erreicht hat */
  function day(offset = 0) { const d = new Date(); d.setDate(d.getDate() + offset); return d.toLocaleDateString('sv-SE'); } // lokales JJJJ-MM-TT
  function bumpStreak() {
    const s = progress.streak, today = day();
    if (s.last === today) return false;
    s.days = s.last === day(-1) ? s.days + 1 : 1; s.last = today;
    return true;
  }
  const streakDays = () => (progress.streak.last === day() || progress.streak.last === day(-1)) ? progress.streak.days : 0;

  /* ---------- Prüfen und belohnen ---------- */
  function context() {
    const active = lab.active(), audible = lab.audible().length > 0;
    return {active, audible, playing: lab.playing() && audible, of: type => active.filter(n => n.type === type)};
  }
  function evaluate() {
    if (progress.hidden) return;
    const m = current(), c = context();
    const ok = m.goals.map(([, test]) => { try { return !!test(c); } catch { return false; } });
    const got = progress.goals[m.id] ||= [];
    hud.querySelectorAll('[data-goal]').forEach(li => {
      const i = Number(li.dataset.goal);
      li.classList.toggle('ok', ok[i]);
      if (ok[i] && !got.includes(i)) {
        got.push(i);
        reward(li, `+${XP_GOAL} XP`);
        lab.message(`✓ ${m.goals[i][0]}`);
      }
    });
    store(); updateXp();
    if (ok.every(Boolean) && !progress.done[m.id]) complete(m);
  }
  function reward(el, text) {
    const newDay = bumpStreak();
    lab.sfx('tick');
    buzz(14);
    const pop = document.createElement('span');
    pop.className = 'xp-pop'; pop.textContent = newDay && streakDays() > 1 ? `${text} · Serie ${streakDays()}` : text;
    el.append(pop);
    setTimeout(() => pop.remove(), 1200);
  }
  function updateXp() {
    const lv = level(), bar = hud.querySelector('.mh-bar i'), label = hud.querySelector('[data-xp]'), lvl = hud.querySelector('[data-level]'), streak = hud.querySelector('[data-streak]');
    if (bar) bar.style.width = `${lv.pct.toFixed(1)}%`;
    if (label) label.textContent = `${xp()} XP`;
    if (lvl) lvl.textContent = `Stufe ${lv.n} · ${lv.name}`;
    if (streak) { streak.textContent = streakDays() ? `⚡︎ ${streakDays()} ${streakDays() === 1 ? 'Tag' : 'Tage'}` : ''; streak.hidden = !streakDays(); }
  }
  function complete(m) {
    const before = BADGES.filter(b => earned(b.id)).map(b => b.id), lvBefore = level().n;
    const s = progress.hinted[m.id] ? 2 : 3;
    progress.done[m.id] = s; store();
    const newBadges = BADGES.filter(b => earned(b.id) && !before.includes(b.id));
    renderAll();
    lab.jingle();
    buzz([20, 40, 30]);
    showWin(m, s, XP_MISSION + (s === 3 ? XP_PERFECT : 0), newBadges, level().n > lvBefore);
  }

  /* ---------- Darstellung ---------- */
  function renderHud() {
    const lv = level(), total = MISSIONEN.length;
    if (progress.hidden) {
      hud.innerHTML = `<div class="mh mh-mini"><span><b>Freies Labor.</b> Missionen: ${doneCount()} / ${total} · ${xp()} XP</span><button type="button" class="button small" data-m="show">Missionen einblenden</button></div>`;
      return;
    }
    const m = current(), i = MISSIONEN.indexOf(m), done = progress.done[m.id], got = progress.goals[m.id] || [];
    hud.innerHTML = `<div class="mh${done ? ' is-done' : ''}">
      <div class="mh-head"><span class="mh-kicker">Mission ${String(i + 1).padStart(2, '0')} / ${total}${done ? ` ${stars(done)}` : ''}</span>
        <div class="mh-level"><span class="mh-streak" data-streak hidden></span><span data-level>Stufe ${lv.n} · ${lv.name}</span><span class="mh-bar"><i style="width:${lv.pct.toFixed(1)}%"></i></span><span data-xp>${xp()} XP</span></div></div>
      <div class="mh-body">
        <div class="mh-text"><h2>${m.title}</h2><p>${m.story}</p></div>
        <ol class="mh-goals">${m.goals.map(([text], k) => `<li data-goal="${k}" class="${got.includes(k) ? 'seen' : ''}"><span class="mh-check" aria-hidden="true"></span><span>${text}</span><span class="mh-xp">+${XP_GOAL}</span></li>`).join('')}</ol>
      </div>
      <p class="mh-hint" id="mh-hint"${progress.hinted[m.id] ? '' : ' hidden'}><b>Tipp:</b> ${m.hint}</p>
      <div class="mh-actions">
        ${m.setup ? '<button type="button" class="button small primary" data-m="setup">Startaufbau ↯</button>' : ''}
        <button type="button" class="button small" data-m="hint"${progress.hinted[m.id] ? ' disabled' : ''}>Tipp${done ? '' : ' · −1 ★'}</button>
        <span class="mh-nav"><button type="button" class="button small" data-m="prev"${i ? '' : ' disabled'} aria-label="Vorherige Mission">←</button><button type="button" class="button small" data-m="next"${i + 1 < total ? '' : ' disabled'} aria-label="Nächste Mission">→</button></span>
        <a class="mh-link" href="#missionen">Karte</a><button type="button" class="mh-link" data-m="hide">Frei spielen</button>
      </div></div>`;
    updateXp();
    evaluate();
  }
  function renderMap() {
    const next = MISSIONEN.find(m => !progress.done[m.id]);
    $('mission-map').innerHTML = `<ol class="mm">${MISSIONEN.map((m, i) => {
      const d = progress.done[m.id], cls = [d ? 'done' : '', m.id === progress.current ? 'current' : '', m === next ? 'next' : ''].join(' ');
      return `<li class="${cls}"><button type="button" data-pick="${m.id}"><span class="mm-dot">${d ? '✓' : String(i + 1).padStart(2, '0')}</span><span class="mm-text"><b>${m.title}</b><small>${d ? stars(d) : m === next ? 'als Nächstes' : m.story}</small></span></button></li>`;
    }).join('')}</ol>`;
    $('badge-shelf').innerHTML = `<span class="eyebrow">Abzeichen · ${BADGES.filter(b => earned(b.id)).length} / ${BADGES.length}</span><div class="badges">${BADGES.map(b => `<div class="badge${earned(b.id) ? ' on' : ''}"><span class="badge-sym">${b.sym}</span><b>${b.name}</b><small>${b.text}</small></div>`).join('')}</div>`;
  }
  function renderAll() { renderHud(); renderMap(); }

  /* ---------- Geschafft: Konfetti + kurze Einblendung, springt von selbst weiter ---------- */
  const win = $('mission-win');
  let countdown = 0;
  function burst(big) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div');
    layer.className = 'confetti-burst'; layer.setAttribute('aria-hidden', 'true');
    const n = big ? 90 : 60;
    layer.innerHTML = Array.from({length: n}, (_, k) => {
      const angle = Math.random() * Math.PI * 2, dist = 140 + Math.random() * (big ? 420 : 300);
      return `<i class="${k % 3 ? '' : 'ink'}" style="--dx:${(Math.cos(angle) * dist).toFixed(0)}px;--dy:${(Math.sin(angle) * dist - 120).toFixed(0)}px;--r:${Math.round(Math.random() * 900 - 450)}deg;--d:${(.9 + Math.random() * .8).toFixed(2)}s"></i>`;
    }).join('');
    document.body.append(layer);
    setTimeout(() => layer.remove(), 2000);
  }
  function showWin(m, s, gain, badges, levelUp) {
    const lv = level(), next = nextOpen();
    burst(levelUp || badges.length);
    win.innerHTML = `<div class="mw-card" role="status" aria-live="polite">
      <div class="mw-top"><span class="mw-big">Geschafft!</span>${stars(s)}<span class="mw-xp">+${gain} XP</span></div>
      <p class="mw-title">${m.title}${levelUp ? ` · <b>Stufe ${lv.n}: ${lv.name}</b>` : ''}</p>
      ${badges.map(b => `<div class="mw-badge"><span class="badge-sym">${b.sym}</span><span>Neues Abzeichen<b>${b.name}</b></span></div>`).join('')}
      <details class="mw-why"><summary>Warum funktioniert das?</summary><p>${m.why}</p><button type="button" class="mh-link" data-lex="${m.lex}">Mehr im Lexikon ↗︎</button></details>
      <div class="mw-actions">${next ? '<button type="button" class="button primary" data-w="next">Weiter →</button>' : ''}<button type="button" class="button" data-w="stay">${next ? 'Bleiben' : 'Schließen'}</button></div>
      ${next ? '<span class="mw-timer" aria-hidden="true"><i></i></span>' : ''}
    </div>`;
    win.hidden = false;
    requestAnimationFrame(() => win.classList.add('is-open'));
    clearTimeout(countdown);
    if (next) {
      const ms = badges.length || levelUp ? 9000 : 6000;
      win.querySelector('.mw-timer i').style.animationDuration = `${ms}ms`;
      countdown = setTimeout(() => closeWin(true, false), ms);
    }
  }
  function pause() { clearTimeout(countdown); win.querySelector('.mw-timer')?.classList.add('paused'); }
  /* scroll = false beim automatischen Weiterspringen: nicht mitten beim Basteln die Seite wegziehen */
  function closeWin(goNext, scroll = true) {
    clearTimeout(countdown);
    win.classList.remove('is-open');
    setTimeout(() => { win.hidden = true; win.innerHTML = ''; }, 200);
    if (goNext) {
      const next = nextOpen();
      if (!next) return;
      progress.current = next.id; store(); renderAll();
      if (scroll) hud.scrollIntoView({block: 'start', behavior: 'smooth'});
      else if (hud.getBoundingClientRect().bottom < 0) lab.message(`Nächste Mission oben: „${next.title}“ ↑`);
    }
  }
  win.addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) closeWin(b.dataset.w === 'next'); else pause(); });
  win.addEventListener('toggle', pause, true);
  win.addEventListener('pointerenter', pause);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !win.hidden) closeWin(false); });

  /* ---------- Bedienung ---------- */
  function select(id) { progress.current = id; store(); renderAll(); }
  hud.addEventListener('click', e => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    const m = current(), i = MISSIONEN.indexOf(m);
    switch (b.dataset.m) {
      case 'hint': if (!progress.done[m.id]) progress.hinted[m.id] = true; store(); $('mh-hint').hidden = false; b.disabled = true; break;
      case 'setup': lab.loadChain(m.setup, `Startaufbau für „${m.title}“ geladen. ${lab.playing() ? '' : 'Jetzt ▶︎ drücken!'}`); break;
      case 'prev': if (i > 0) select(MISSIONEN[i - 1].id); break;
      case 'next': if (i + 1 < MISSIONEN.length) select(MISSIONEN[i + 1].id); break;
      case 'hide': progress.hidden = true; store(); renderHud(); lab.message('Freies Labor: keine Aufgaben, nur du und die Bausteine.'); break;
      case 'show': progress.hidden = false; store(); renderAll(); break;
    }
  });
  $('mission-map').addEventListener('click', e => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    progress.hidden = false; select(b.dataset.pick);
    hud.scrollIntoView({block: 'start', behavior: 'smooth'});
  });

  lab.on(evaluate);
  renderMap();
  setTimeout(renderHud, 350); // kurz warten, damit erste Häkchen sichtbar „aufploppen“
})();
