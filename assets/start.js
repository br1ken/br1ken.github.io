/* Startseite: die neuesten Notizen und Projekte als Karten. */
'use strict';
/* Alte geteilte Patch-Links (…/#patch=…) zeigen jetzt aufs Labor */
const toLab = () => { if (/^#patch=/.test(location.hash)) location.replace('labor/' + location.hash); };
toLab();
addEventListener('hashchange', toLab);
(() => {
  const notes = document.getElementById('latest-notes'), projects = document.getElementById('latest-projects');
  notes.innerHTML = '<p class="empty-state">Notizen werden geladen …</p>';
  OSCI.notizenLaden().then(list => {
    notes.innerHTML = list.length ? list.slice(0, 3).map(OSCI.notizKarte).join('') : '<p class="empty-state">Die ersten Notizen sind unterwegs.</p>';
  });
  /* Fortschritt im Labor (Missionen) anzeigen, falls schon gespielt */
  try {
    const p = JSON.parse(localStorage.getItem('osci-log-missionen') || 'null');
    /* Die Gesamtzahl schreibt missionen.js mit; ältere Stände kennen sie noch nicht */
    const gesamt = p?.gesamt || 17, done = p ? Math.min(Object.keys(p.done || {}).length, gesamt) : 0;
    if (done) {
      const box = document.getElementById('teaser-progress');
      box.hidden = false;
      box.innerHTML = `<span>Dein Fortschritt: <b>${done} / ${gesamt} Missionen</b></span><span class="mh-bar"><i style="display:block;height:100%;background:var(--accent);width:${Math.round(done / gesamt * 100)}%"></i></span>`;
    }
  } catch { /* ohne Speicher */ }
  const list = OSCI.projekte().slice(0, 3);
  projects.innerHTML = list.length ? list.map(OSCI.projektKarte).join('') : '<p class="empty-state">Hier erscheinen bald weitere Projekte.</p>';
})();
