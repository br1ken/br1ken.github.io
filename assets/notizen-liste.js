/* Notizen-Übersicht: getrennt nach Art (erst Rechnungen, dann Theorie), darin nach Fach gruppiert.
   Rechnungen nach Aufgabennummer sortiert, Theorie nach Datum (neueste zuerst). Dazu Suche und Filter nach Thema. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const GRUPPEN = [
    {art: 'rechnung', titel: 'Rechnungen', text: 'Durchgerechnete Aufgaben aus Vorlesung und Übung, Schritt für Schritt.'},
    {art: 'theorie', titel: 'Theorie', text: 'Allgemeine Erklärungen und Herleitungen, unabhängig von einer bestimmten Aufgabe.'},
    {art: 'sonstiges', titel: 'Sonstiges', text: 'Alles rund um dieses Log.'}
  ];
  const artVon = n => OSCI.ARTEN[n.art] ? n.art : 'sonstiges';
  let all = [];
  const params = new URLSearchParams(location.search);
  let art = params.get('art') || '', active = params.get('tag') || '';
  $('suche').value = params.get('q') || '';

  /* Aufgabennummern wie 2.3 oder 10.1 als Zahlen vergleichen, nicht als Text. Ohne Nummer ans Ende. */
  function vergleichAufgabe(a, b) {
    if (!a.aufgabe || !b.aufgabe) return !a.aufgabe - !b.aufgabe;
    const x = a.aufgabe.split(/[.,]/).map(Number), y = b.aufgabe.split(/[.,]/).map(Number);
    for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; }
    return 0;
  }
  const sortiert = (list, gruppe) => list.slice().sort((a, b) => gruppe === 'rechnung'
    ? vergleichAufgabe(a, b) || String(a.datum).localeCompare(String(b.datum))
    : String(b.datum).localeCompare(String(a.datum)));
  const nachName = (a, b) => a.localeCompare(b, 'de', {numeric: true});

  function matches(n, query) {
    if (art && artVon(n) !== art) return false;
    if (active && n.fach !== active && !n.tags.includes(active)) return false;
    if (!query) return true;
    const hay = [n.titel, n.teaser, n.fach, n.aufgabe, ...n.tags].join(' ').toLowerCase();
    return query.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  }

  function artFilter() {
    const counts = new Map();
    all.forEach(n => counts.set(artVon(n), (counts.get(artVon(n)) || 0) + 1));
    $('art-filter').innerHTML = `<span class="eyebrow">Art</span><button class="tag" type="button" data-art="">Alle · ${all.length}</button>` +
      GRUPPEN.filter(g => counts.get(g.art)).map(g => `<button class="tag" type="button" data-art="${g.art}">${g.titel} · ${counts.get(g.art)}</button>`).join('');
  }
  /* Themen passend zur gewählten Art: Fächer immer, Tags erst ab zwei Notizen, damit die Leiste übersichtlich bleibt. */
  function themenFilter() {
    const pool = all.filter(n => !art || artVon(n) === art);
    const counts = new Map();
    pool.forEach(n => [n.fach, ...n.tags].filter(Boolean).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    const faecher = new Set(pool.map(n => n.fach).filter(Boolean));
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    let topics = sorted.filter(([t, c]) => faecher.has(t) || c >= 2);
    if (topics.length < 6) topics = topics.concat(sorted.filter(x => !topics.includes(x)).slice(0, 6 - topics.length));
    topics = topics.slice(0, 12);
    if (active && !counts.has(active)) active = '';
    /* Über einen Tag-Link aus einer Notiz gekommen: diesen Tag auch dann zeigen, wenn er sonst nicht in der Leiste stünde. */
    if (active && !topics.some(([t]) => t === active)) topics.push([active, counts.get(active)]);
    $('filter').innerHTML = `<span class="eyebrow">Thema</span><button class="tag" type="button" data-tag="">Alle</button>` + topics.map(([t, c]) => `<button class="tag" type="button" data-tag="${OSCI.escape(t)}">${OSCI.escape(t)} · ${c}</button>`).join('');
  }

  function gruppe(g, notes) {
    const faecher = [...new Set(notes.map(n => n.fach || ''))].sort(nachName);
    const teile = faecher.map(f => {
      const karten = sortiert(notes.filter(n => (n.fach || '') === f), g.art).map(OSCI.notizKarte).join('');
      return `${f ? `<h3 class="notes-fach">${OSCI.escape(f)}</h3>` : ''}<div class="card-grid">${karten}</div>`;
    }).join('');
    return `<section class="notes-group" aria-labelledby="gruppe-${g.art}"><div class="section-heading"><h2 id="gruppe-${g.art}">${g.titel}</h2><span class="eyebrow">${notes.length} ${notes.length === 1 ? 'Notiz' : 'Notizen'}</span></div><p class="notes-group-text">${g.text}</p>${teile}</section>`;
  }
  function render() {
    const query = $('suche').value.trim();
    const list = all.filter(n => matches(n, query));
    const html = GRUPPEN.map(g => { const notes = list.filter(n => artVon(n) === g.art); return notes.length ? gruppe(g, notes) : ''; }).join('');
    $('notes').innerHTML = html || `<p class="empty-state">${all.length ? 'Nichts gefunden. Probier ein anderes Wort oder einen anderen Filter.' : 'Noch keine Notizen veröffentlicht.'}</p>`;
    /* Aktive Filter deutlich anzeigen, mit Knopf zum Aufheben. Auf dem Handy liegt der gedrückte Filterknopf sonst oft außerhalb des Bildschirms. */
    const filter = [art && GRUPPEN.find(g => g.art === art)?.titel, active && `Thema „${OSCI.escape(active)}“`, query && `Suche „${OSCI.escape(query)}“`].filter(Boolean);
    $('anzahl').classList.toggle('is-filtered', filter.length > 0);
    $('anzahl').innerHTML = filter.length
      ? `<span>${list.length} von ${all.length} Notizen · gefiltert: ${filter.join(', ')}</span><button class="tag" type="button" id="filter-reset">Alle anzeigen ×</button>`
      : `${all.length} Notizen`;
    $('art-filter').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.art === art)));
    $('filter').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tag === active)));
    /* Gedrückte Knöpfe in den waagerecht scrollenden Leisten ins Bild holen */
    for (const row of [$('art-filter'), $('filter')]) {
      const b = row.querySelector('[aria-pressed="true"]');
      if (b && row.scrollWidth > row.clientWidth) row.scrollLeft = b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2;
    }
    const url = new URL(location.href);
    art ? url.searchParams.set('art', art) : url.searchParams.delete('art');
    active ? url.searchParams.set('tag', active) : url.searchParams.delete('tag');
    query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  OSCI.notizenLaden().then(list => {
    all = list;
    if (art && !all.some(n => artVon(n) === art)) art = '';
    artFilter();
    themenFilter();
    if (!list.length && location.protocol === 'file:') $('notes').innerHTML = '<p class="empty-state">Notizen lassen sich nicht direkt aus dem Finder öffnen. Starte die Vorschau mit <b>vorschau.command</b> (siehe README).</p>';
    else render();
  });
  $('art-filter').addEventListener('click', e => { const b = e.target.closest('[data-art]'); if (b) { art = b.dataset.art; themenFilter(); render(); } });
  $('filter').addEventListener('click', e => { const b = e.target.closest('[data-tag]'); if (b) { active = b.dataset.tag; render(); } });
  $('suche').addEventListener('input', () => render());
  $('anzahl').addEventListener('click', e => {
    if (e.target.closest('#filter-reset')) { art = ''; active = ''; $('suche').value = ''; themenFilter(); render(); }
  });
})();
