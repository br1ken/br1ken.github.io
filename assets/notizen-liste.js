/* Notizen-Übersicht: neueste Notiz groß, darunter alle weiteren; Suche und Filter nach Fach/Tag. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let all = [], active = '';
  const params = new URLSearchParams(location.search);
  active = params.get('tag') || '';
  $('suche').value = params.get('q') || '';

  function matches(n, query) {
    if (active && n.fach !== active && !n.tags.includes(active)) return false;
    if (!query) return true;
    const hay = [n.titel, n.teaser, n.fach, ...n.tags].join(' ').toLowerCase();
    return query.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  }
  function render() {
    const query = $('suche').value.trim();
    const list = all.filter(n => matches(n, query));
    const showFeatured = !query && !active && list.length > 1;
    $('featured').innerHTML = showFeatured ? OSCI.notizKarte(list[0]).replace('class="card"', 'class="card featured"') : '';
    const rest = showFeatured ? list.slice(1) : list;
    $('notes').innerHTML = rest.map(OSCI.notizKarte).join('') || (list.length ? '' : `<p class="empty-state">${all.length ? 'Nichts gefunden. Probier ein anderes Wort oder einen anderen Filter.' : 'Noch keine Notizen veröffentlicht.'}</p>`);
    $('anzahl').textContent = `${list.length} von ${all.length} Notizen`;
    $('filter').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tag === active)));
    const url = new URL(location.href);
    active ? url.searchParams.set('tag', active) : url.searchParams.delete('tag');
    query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }
  OSCI.notizenLaden().then(list => {
    all = list;
    const counts = new Map();
    list.forEach(n => [n.fach, ...n.tags].filter(Boolean).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    /* Fächer immer, Tags erst ab zwei Notizen — damit die Filterleiste übersichtlich bleibt. */
    const faecher = new Set(list.map(n => n.fach).filter(Boolean));
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    let topics = sorted.filter(([t, c]) => faecher.has(t) || c >= 2);
    if (topics.length < 6) topics = topics.concat(sorted.filter(x => !topics.includes(x)).slice(0, 6 - topics.length));
    topics = topics.slice(0, 12);
    $('filter').innerHTML = `<span class="eyebrow">Thema</span><button class="tag" type="button" data-tag="">Alle</button>` + topics.map(([t, c]) => `<button class="tag" type="button" data-tag="${OSCI.escape(t)}">${OSCI.escape(t)} · ${c}</button>`).join('');
    if (!list.length && location.protocol === 'file:') $('notes').innerHTML = '<p class="empty-state">Notizen lassen sich nicht direkt aus dem Finder öffnen. Starte die Vorschau mit <b>vorschau.command</b> (siehe README).</p>';
    else render();
  });
  $('filter').addEventListener('click', e => { const b = e.target.closest('[data-tag]'); if (b) { active = b.dataset.tag; render(); } });
  $('suche').addEventListener('input', () => render());
})();
