/* Schreibstube: Markdown links, Live-Vorschau rechts, Entwurf im Browser gespeichert. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const fields = ['titel', 'datum', 'fach', 'art', 'aufgabe', 'welle', 'teaser', 'tags', 'entwurf'];
  const DRAFT = 'osci-log-schreibstube';
  const now = new Date(), today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const text = $('w-text'), preview = $('w-preview');

  function slug() {
    return OSCIMarkdown.slugify($('w-titel').value).slice(0, 60) || 'neue-notiz';
  }
  function values() {
    const v = {};
    fields.forEach(f => { const el = $('w-' + f); v[f] = el.type === 'checkbox' ? el.checked : el.value.trim(); });
    return v;
  }
  function markdown() {
    const v = values();
    const tags = v.tags.split(',').map(t => t.trim()).filter(Boolean);
    const head = ['---', `titel: ${v.titel || 'Ohne Titel'}`, `datum: ${v.datum || today}`];
    if (v.fach) head.push(`fach: ${v.fach}`);
    if (v.art) head.push(`art: ${v.art}`);
    if (v.aufgabe) head.push(`aufgabe: ${v.aufgabe}`);
    if (tags.length) head.push(`tags: [${tags.join(', ')}]`);
    if (v.teaser) head.push(`teaser: ${v.teaser}`);
    if (v.welle) head.push(`welle: ${v.welle}`);
    if (v.entwurf) head.push('entwurf: ja');
    head.push('---', '');
    return head.join('\n') + text.value.replace(/^\n+/, '') + (text.value.endsWith('\n') ? '' : '\n');
  }
  function load(source) {
    const {meta, body} = OSCI.frontMatter(source);
    fields.forEach(f => {
      const el = $('w-' + f), v = meta[f];
      if (el.type === 'checkbox') el.checked = /^(ja|true|yes|1)$/i.test(String(v || ''));
      else el.value = Array.isArray(v) ? v.join(', ') : (v || (f === 'datum' ? today : ''));
    });
    text.value = body.replace(/^\n+/, '');
    update();
  }

  let timer = 0;
  function update() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const v = values();
      const doc = OSCIMarkdown.render(text.value);
      const art = OSCI.ARTEN[v.art];
      preview.innerHTML = `<span class="eyebrow">${art ? `${art.name} · ` : ''}${OSCI.escape(v.fach || 'Notiz')}${v.aufgabe ? ` · Aufgabe ${OSCI.escape(v.aufgabe)}` : ''} · ${OSCI.date(v.datum || today)} · ${doc.minutes} min</span><h1>${OSCI.escape(v.titel || 'Ohne Titel')}</h1>${v.teaser ? `<p class="post-teaser" style="margin:0 0 28px">${OSCI.escape(v.teaser)}</p>` : ''}<div class="prose">${doc.html}</div>`;
      OSCIMarkdown.typeset(preview);
      OSCISims.mount(preview);
      try { localStorage.setItem(DRAFT, markdown()); $('w-status').textContent = `Entwurf gespeichert · ${new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})}`; } catch { $('w-status').textContent = 'Hinweis: Dieser Browser speichert keine Entwürfe. Lade die Datei zwischendurch herunter.'; }
      steps();
    }, 160);
  }
  function steps() {
    const name = slug();
    $('w-steps').innerHTML = `<b>So kommt die Notiz online</b><ol style="margin:8px 0 0;padding-left:20px">
      <li><b>.md herunterladen</b> und als <code>notizen/texte/${name}.md</code> in deinen Projektordner legen.</li>
      <li>In <code>notizen/beitraege.js</code> die Zeile <code>'${name}',</code> ergänzen <button class="button small" type="button" id="w-zeile" style="margin-left:6px">Zeile kopieren</button></li>
      <li>Hochladen (GitHub Desktop: <i>Commit</i> → <i>Push</i>). Nach etwa einer Minute ist sie live. Bilder kommen nach <code>notizen/bilder/</code> und werden mit <code>![Text](bilder/name.jpg)</code> eingebunden.</li>
    </ol>`;
  }
  const SNIPPETS = {
    h2: ['\n## ', '', '\n'],
    bold: ['**', 'fett', '**'],
    italic: ['*', 'kursiv', '*'],
    mark: ['==', 'wichtig', '=='],
    math: ['$', 'U = R \\cdot I', '$'],
    mathblock: ['\n$$\n', 'P = U \\cdot I', '\n$$\n'],
    merke: ['\n::: merke\n', 'Das Wichtigste in einem Satz.', '\n:::\n'],
    achtung: ['\n::: achtung\n', 'Typischer Fehler: …', '\n:::\n'],
    aufgabe: ['\n::: aufgabe Titel\n', 'Aufgabe …\n???\nLösung …', '\n:::\n'],
    herleitung: ['\n::: herleitung Woher kommt das?\n', 'Rechnung …', '\n:::\n'],
    'sim-rc': ['\n::: sim rc r=10k c=22n\n', 'Satz unter der Simulation (optional).', '\n:::\n'],
    'sim-welle': ['\n::: sim welle u=5 f=2 phi=0\n', '', ':::\n'],
    'sim-teiler': ['\n::: sim teiler u=12 r1=10k r2=10k rl=10k\n', '', ':::\n'],
    table: ['\n| Größe | Zeichen | Einheit |\n|---|---|---|\n| ', 'Spannung', ' | $U$ | V |\n'],
    image: ['\n![', 'Beschreibung', '](bilder/datei.jpg "Bildunterschrift")\n'],
    link: ['[', 'Linktext', '](https://)']
  };
  function insert(kind) {
    const [before, sample, after] = SNIPPETS[kind];
    const start = text.selectionStart, end = text.selectionEnd;
    const selected = text.value.slice(start, end) || sample;
    text.setRangeText(before + selected + after, start, end, 'end');
    text.selectionStart = start + before.length; text.selectionEnd = start + before.length + selected.length;
    text.focus(); update();
  }
  function download() {
    const blob = new Blob([markdown()], {type: 'text/markdown;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = slug() + '.md';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    $('w-status').textContent = `${slug()}.md heruntergeladen. Jetzt die Schritte unten.`;
  }
  async function copy(value, label) {
    try { await navigator.clipboard.writeText(value); $('w-status').textContent = `${label} kopiert.`; } catch { window.prompt('Zum Kopieren:', value); }
  }
  async function vorlage() {
    try { const res = await fetch('texte/_vorlage.md'); load(await res.text()); $('w-datum').value = today; update(); }
    catch { load(`---\ntitel: \ndatum: ${today}\n---\n\nHier beginnt deine Notiz.\n`); }
  }

  document.querySelector('.writer-tools').addEventListener('click', e => { const b = e.target.closest('[data-insert]'); if (b) insert(b.dataset.insert); });
  document.querySelector('.writer-tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-view]'); if (!b) return;
    $('w-panes').dataset.view = b.dataset.view;
    document.querySelectorAll('.writer-tabs button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  fields.forEach(f => $('w-' + f).addEventListener(f === 'entwurf' || f === 'welle' || f === 'art' ? 'change' : 'input', update));
  text.addEventListener('input', update);
  text.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); insert('bold'); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') { e.preventDefault(); insert('italic'); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); download(); }
  });
  $('w-download').addEventListener('click', download);
  $('w-kopieren').addEventListener('click', () => copy(markdown(), 'Text'));
  $('w-steps').addEventListener('click', e => { if (e.target.id === 'w-zeile') copy(`  '${slug()}',`, 'Zeile'); });
  $('w-neu').addEventListener('click', () => { if (!text.value.trim() || confirm('Aktuellen Entwurf verwerfen und mit der Vorlage neu beginnen?')) vorlage(); });
  $('w-datei').addEventListener('change', async e => { const f = e.target.files[0]; if (f) { load(await f.text()); $('w-status').textContent = `${f.name} geöffnet.`; } e.target.value = ''; });

  OSCI.notizenLaden({mitEntwuerfen: true}).then(list => {
    const faecher = [...new Set(list.map(n => n.fach).filter(Boolean))];
    $('w-faecher').innerHTML = faecher.map(f => `<option value="${OSCI.escape(f)}">`).join('');
  });
  let saved = null;
  try { saved = localStorage.getItem(DRAFT); } catch { /* ohne Speicher */ }
  if (saved) { load(saved); $('w-status').textContent = 'Letzten Entwurf wiederhergestellt.'; } else vorlage();
})();
