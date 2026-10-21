/* Eine Notiz anzeigen: notizen/beitrag.html?b=<dateiname-ohne-md> */
'use strict';
(async () => {
  const main = document.getElementById('beitrag');
  const slug = new URLSearchParams(location.search).get('b') || '';
  const fail = (text) => { main.innerHTML = `<div class="post-error"><span class="eyebrow">Signal verloren</span><h1 style="font-weight:300;letter-spacing:-.05em">${text}</h1><a class="button" href="./">Alle Notizen ↗</a></div>`; };
  if (!/^[\w-]+$/.test(slug)) { fail('Diese Notiz gibt es nicht.'); return; }

  let source;
  try {
    const res = await fetch(`texte/${slug}.md`);
    if (!res.ok) throw Error(res.status);
    source = await res.text();
  } catch {
    fail(location.protocol === 'file:' ? 'Notizen lassen sich nicht direkt aus dem Finder öffnen. Starte die Vorschau mit vorschau.command.' : 'Diese Notiz gibt es (noch) nicht.');
    return;
  }
  const doc = OSCIMarkdown.render(source), m = doc.meta;
  const tags = Array.isArray(m.tags) ? m.tags : m.tags ? String(m.tags).split(',').map(t => t.trim()) : [];
  const list = await OSCI.notizenLaden({mitEntwuerfen: true});
  const published = list.filter(n => !n.entwurf);
  const entry = list.find(n => n.slug === slug);
  const index = published.findIndex(n => n.slug === slug);
  const newer = index > 0 ? published[index - 1] : null, older = index >= 0 ? published[index + 1] : null;
  const e = OSCI.escape;
  const titel = m.titel || slug;

  document.title = `${titel} — osci//log`;
  document.querySelector('meta[name="description"]').content = m.teaser || titel;
  for (const [prop, value] of [['og:title', titel], ['og:description', m.teaser || '']]) {
    const tag = document.createElement('meta'); tag.setAttribute('property', prop); tag.content = value; document.head.append(tag);
  }

  main.innerHTML = `
    <header class="post-hero">
      <div class="post-cover">${m.bild ? `<img src="${e(m.bild)}" alt="">` : OSCI.cover(slug, m.welle)}</div>
      <div class="post-head">
        <div>
          <span class="eyebrow">${entry?.nummer ? `Notiz N°${entry.nummer}` : 'Entwurf — nicht in der Liste'} · ${e(m.fach || 'Notiz')}</span>
          <h1>${e(titel)}</h1>
          ${m.teaser ? `<p class="post-teaser">${e(m.teaser)}</p>` : ''}
          ${tags.length ? `<div class="post-tags">${tags.map(t => `<a class="tag" href="./?tag=${encodeURIComponent(t)}">${e(t)}</a>`).join('')}</div>` : ''}
        </div>
        <dl class="post-facts">
          <div><dt>Datum</dt><dd>${m.datum ? OSCI.date(m.datum) : '—'}</dd></div>
          <div><dt>Lesezeit</dt><dd>${doc.minutes} min</dd></div>
          <div><dt>Abschnitte</dt><dd>${doc.toc.length || '—'}</dd></div>
          ${doc.hasSims ? '<div><dt>Zum Anfassen</dt><dd>Simulation ↓</dd></div>' : ''}
        </dl>
      </div>
    </header>
    <div class="post-layout">
      <nav class="toc" aria-label="Inhalt">${doc.toc.length > 1 ? `<span class="eyebrow">Inhalt</span><ol>${doc.toc.map(t => `<li><a href="#${t.id}">${e(t.text)}</a></li>`).join('')}</ol>` : ''}</nav>
      <article class="prose" id="text">${doc.html}</article>
    </div>
    <footer class="post-end">
      <div class="post-share"><span>Gefallen? Teil die Notiz mit jemandem, der gerade dasselbe lernt.</span><button class="button small" id="teilen" type="button">Link teilen ↗</button><a class="button small" href="./">Alle Notizen</a></div>
      <nav class="post-nav" aria-label="Weitere Notizen">
        ${older ? `<a class="prev" href="?b=${encodeURIComponent(older.slug)}"><span>← Vorherige Notiz</span><b>${e(older.titel)}</b></a>` : '<span></span>'}
        ${newer ? `<a class="next" href="?b=${encodeURIComponent(newer.slug)}"><span>Nächste Notiz →</span><b>${e(newer.titel)}</b></a>` : ''}
      </nav>
    </footer>`;

  OSCIMarkdown.typeset(main);
  OSCISims.mount(main);
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();

  document.getElementById('teilen').addEventListener('click', async () => {
    const link = location.href.split('#')[0];
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({title: titel, url: link});
      else { await navigator.clipboard.writeText(link); document.getElementById('teilen').textContent = 'Link kopiert ✓'; }
    } catch { /* abgebrochen */ }
  });

  /* Lesefortschritt und aktiver Abschnitt im Inhaltsverzeichnis */
  const bar = document.getElementById('progress'), text = document.getElementById('text');
  const tocLinks = [...main.querySelectorAll('.toc a')];
  const heads = tocLinks.map(a => document.getElementById(a.hash.slice(1)));
  function onScroll() {
    const r = text.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .4 - r.top) / r.height));
    bar.style.transform = `scaleX(${p})`;
    let current = -1;
    heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top < 140) current = i; });
    tocLinks.forEach((a, i) => a.classList.toggle('active', i === current));
  }
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();
})();
