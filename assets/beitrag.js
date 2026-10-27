/* Eine Notiz anzeigen: notizen/beitrag.html?b=<dateiname-ohne-md> */
'use strict';
(async () => {
  const main = document.getElementById('beitrag');
  const slug = new URLSearchParams(location.search).get('b') || '';
  const fail = (text) => { main.innerHTML = `<div class="post-error"><span class="eyebrow">Signal verloren</span><h1 style="font-weight:300;letter-spacing:-.05em">${text}</h1><a class="button" href="./">Alle Notizen ↗︎</a></div>`; };
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
  const art = OSCI.ARTEN[String(m.art || '').toLowerCase()];

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
          <span class="eyebrow">${entry?.nummer ? `Notiz N°${entry.nummer}` : 'Entwurf — nicht in der Liste'}${art ? ` · ${art.name}` : ''} · ${e(m.fach || 'Notiz')}${m.aufgabe ? ` · Aufgabe ${e(m.aufgabe)}` : ''}</span>
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
      <nav class="toc" aria-label="Inhalt">${doc.toc.length > 1 ? `<span class="eyebrow">Inhalt</span><ol>${doc.toc.map(t => `<li><a href="#${t.id}"><span>${t.html}</span></a></li>`).join('')}</ol>` : ''}</nav>
      <article class="prose" id="text">${doc.html}</article>
    </div>
    <footer class="post-end">
      <div class="post-share"><span>Gefallen? Teil die Notiz mit jemandem, der gerade dasselbe lernt.</span><button class="button small" id="teilen" type="button">Link teilen ↗︎</button><a class="button small" href="./">Alle Notizen</a></div>
      <nav class="post-nav" aria-label="Weitere Notizen">
        ${older ? `<a class="prev" href="?b=${encodeURIComponent(older.slug)}"><span>← Vorherige Notiz</span><b>${e(older.titel)}</b></a>` : '<span></span>'}
        ${newer ? `<a class="next" href="?b=${encodeURIComponent(newer.slug)}"><span>Nächste Notiz →</span><b>${e(newer.titel)}</b></a>` : ''}
      </nav>
    </footer>`;

  OSCIMarkdown.typeset(main);
  OSCISims.mount(main);

  /* Codeblöcke: Knopf zum Kopieren, damit sich Beispiele direkt nachmachen lassen */
  main.querySelectorAll('pre.code').forEach(pre => {
    const knopf = document.createElement('button');
    knopf.type = 'button'; knopf.className = 'code-copy'; knopf.textContent = 'Kopieren';
    knopf.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      try { await navigator.clipboard.writeText(code.textContent); knopf.textContent = 'Kopiert ✓'; }
      catch {
        /* Ohne Zugriff auf die Zwischenablage wenigstens alles markieren, dann reicht ⌘C bzw. Strg+C */
        const bereich = document.createRange();
        bereich.selectNodeContents(code);
        getSelection().removeAllRanges(); getSelection().addRange(bereich);
        knopf.textContent = 'Markiert ✓';
      }
      setTimeout(() => { knopf.textContent = 'Kopieren'; }, 1800);
    });
    pre.classList.add('has-copy');
    pre.append(knopf);
  });

  /* Abhakelisten (- [ ] …) lassen sich anklicken. Der Stand bleibt pro Notiz im Browser, im Kopf steht der Fortschritt. */
  const haken = [...main.querySelectorAll('#text li.task > input[type="checkbox"]')];
  if (haken.length) {
    const SPEICHER = 'osci-log-haken';
    let alle = {};
    try { alle = JSON.parse(localStorage.getItem(SPEICHER)) || {}; } catch { /* privat oder gesperrt */ }
    if (Array.isArray(alle[slug])) haken.forEach((box, i) => { box.checked = alle[slug].includes(i); });
    main.querySelector('.post-facts').insertAdjacentHTML('beforeend', '<div><dt>Abgehakt</dt><dd class="fortschritt"></dd></div>');
    const anzeige = main.querySelector('.fortschritt');
    const zeigen = () => { anzeige.textContent = `${haken.filter(box => box.checked).length} von ${haken.length}`; };
    haken.forEach(box => {
      /* Kästchen und Text in ein Label, damit auch ein Klick auf den Text abhakt (Links darin bleiben Links) */
      const li = box.parentElement, label = document.createElement('label'), text = document.createElement('span');
      while (box.nextSibling && !/^(UL|OL|P|DIV|PRE)$/.test(box.nextSibling.tagName || '')) text.append(box.nextSibling);
      box.disabled = false;
      label.append(box, text);
      li.prepend(label);
      box.addEventListener('change', () => {
        alle[slug] = haken.flatMap((b, i) => b.checked ? [i] : []);
        try { localStorage.setItem(SPEICHER, JSON.stringify(alle)); } catch { /* dann gilt es nur für diesen Besuch */ }
        zeigen();
      });
    });
    zeigen();
  }
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
  const toc = main.querySelector('.toc');
  let zuletzt = -1;
  function onScroll() {
    const r = text.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .4 - r.top) / r.height));
    bar.style.transform = `scaleX(${p})`;
    let current = -1;
    heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top < 140) current = i; });
    tocLinks.forEach((a, i) => a.classList.toggle('active', i === current));
    /* Ist das Inhaltsverzeichnis länger als der Bildschirm, läuft es mit, damit der aktive Abschnitt sichtbar bleibt */
    if (current !== zuletzt && current >= 0 && toc.scrollHeight > toc.clientHeight) {
      const a = tocLinks[current];
      if (a.offsetTop < toc.scrollTop || a.offsetTop + a.offsetHeight > toc.scrollTop + toc.clientHeight) toc.scrollTop = a.offsetTop - toc.clientHeight / 3;
    }
    zuletzt = current;
  }
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();
})();
