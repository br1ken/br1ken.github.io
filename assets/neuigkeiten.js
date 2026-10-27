/* Neuigkeiten: Rufzeichen unten rechts auf jeder Seite, dahinter ein Fenster mit den letzten Notizen und Neuerungen.
   Gibt es etwas Ungesehenes, ist das Rufzeichen groß, gelb und wackelt ab und zu. Nach dem Öffnen weicht es
   klein und unauffällig in die Ecke aus, bleibt aber erreichbar, bis wieder etwas Neues dazukommt.
   Was schon gesehen wurde, merkt sich der Browser (localStorage).
   Neue Notizen kommen von selbst aus notizen/beitraege.js, Neuerungen an der Seite aus neuigkeiten.js. */
'use strict';
const OSCINeuigkeiten = (() => {
  const KEY = 'osci-log-neuigkeiten';
  const MAX = 14;
  let seite = [];
  let bereit = null, fab = null, box = null, list = null, zuvor = null;

  const gesehenLesen = () => { try { const v = localStorage.getItem(KEY); return v ? new Set(JSON.parse(v)) : null; } catch { return null; } };
  const gesehenMerken = keys => { try { localStorage.setItem(KEY, JSON.stringify(keys)); } catch { /* ohne Speicher meldet sich das Rufzeichen eben wieder */ } };
  const laden = src => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.append(s);
  });
  const seiteKey = e => `s:${e.datum}:${e.titel}`;
  const notizKey = slug => `n:${slug}`;
  const alleKeys = () => [...seite.map(seiteKey), ...OSCI.notizenSlugs().map(notizKey)];
  const kurz = (text, n = 150) => { const t = String(text || ''); return t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n)) + ' …'; };
  const href = link => /^https?:/.test(link) ? link : OSCI.url(link);

  function knopf(neu) {
    if (!fab) {
      fab = document.createElement('button');
      fab.type = 'button'; fab.className = 'news-fab';
      fab.innerHTML = '<span aria-hidden="true">!</span>';
      fab.addEventListener('click', open);
      document.body.append(fab);
    }
    fab.classList.toggle('is-new', neu > 0);
    fab.title = neu > 0 ? 'Neuigkeiten' : 'Neuigkeiten ansehen';
    fab.setAttribute('aria-label', neu > 0 ? `Neuigkeiten öffnen: ${neu} neu` : 'Neuigkeiten öffnen');
  }

  /* Daten holen und entscheiden, ob das Rufzeichen auffällig sein soll. */
  function start() {
    if (!bereit) {
      bereit = Promise.all([
        laden(OSCI.url('neuigkeiten.js')).catch(() => {}),
        OSCI.notizenSlugs().length ? null : laden(OSCI.url('notizen/beitraege.js')).catch(() => {})
      ]).then(() => {
        const gesehen = gesehenLesen();
        knopf(alleKeys().filter(k => !gesehen || !gesehen.has(k)).length);
      });
    }
    return bereit;
  }

  function bauen() {
    box = document.createElement('div');
    box.className = 'news'; box.hidden = true;
    box.innerHTML = `<div class="news-backdrop" data-news-close></div><section class="news-panel" role="dialog" aria-modal="true" aria-labelledby="news-title"><header class="news-head"><div><span class="eyebrow">osci//log</span><h2 id="news-title">Neuigkeiten</h2></div><button class="news-close" type="button" data-news-close aria-label="Neuigkeiten schließen">×</button></header><ol class="news-list"></ol><p class="news-foot"><a href="${OSCI.url('notizen/')}">Alle Notizen →</a><span>Neue Notizen erscheinen hier von selbst.</span></p></section>`;
    list = box.querySelector('.news-list');
    box.addEventListener('click', e => { if (e.target.closest('[data-news-close]') || e.target.closest('.news-item a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
    document.body.append(box);
  }

  function eintrag(e, neu) {
    const kicker = `${neu ? '<span class="news-neu">Neu</span>' : ''}${OSCI.escape(e.kicker)}`;
    const inhalt = `<span class="news-kicker"><span>${kicker}</span><time datetime="${OSCI.escape(e.datum)}">${OSCI.date(e.datum)}</time></span><b>${OSCI.escape(e.titel)}</b>${e.text ? `<span class="news-text">${OSCI.escape(kurz(e.text))}</span>` : ''}`;
    const extern = /^https?:/.test(e.href || '');
    return `<li class="news-item${neu ? ' is-new' : ''}">${e.href ? `<a href="${OSCI.escape(e.href)}"${extern ? ' rel="noopener"' : ''}>${inhalt}</a>` : `<div>${inhalt}</div>`}</li>`;
  }

  function zeigen(notizen, gesehen) {
    const items = [
      ...notizen.map(n => ({
        key: notizKey(n.slug), datum: n.datum, titel: n.titel, text: n.teaser,
        kicker: ['Notiz', OSCI.ARTEN[n.art]?.name, n.aufgabe && `A${n.aufgabe}`].filter(Boolean).join(' · '),
        href: OSCI.url(`notizen/beitrag.html?b=${encodeURIComponent(n.slug)}`)
      })),
      ...seite.map(e => ({key: seiteKey(e), datum: e.datum, titel: e.titel, text: e.text, kicker: e.bereich || 'Seite', href: e.link ? href(e.link) : ''}))
    ].sort((a, b) => String(b.datum).localeCompare(String(a.datum))).slice(0, MAX);
    list.innerHTML = items.length ? items.map(e => eintrag(e, gesehen && !gesehen.has(e.key))).join('') : '<li class="news-empty">Gerade gibt es nichts Neues.</li>';
  }

  async function open() {
    await start();
    if (!box) bauen();
    zuvor = document.activeElement;
    const gesehen = gesehenLesen();
    gesehenMerken(alleKeys());
    knopf(0);
    list.innerHTML = '<li class="news-empty">Lädt …</li>';
    box.hidden = false;
    document.documentElement.classList.add('news-open');
    requestAnimationFrame(() => box.classList.add('is-open'));
    box.querySelector('.news-close').focus();
    zeigen(await OSCI.notizenLaden().catch(() => []), gesehen);
  }

  function close() {
    if (!box || box.hidden) return;
    box.classList.remove('is-open');
    document.documentElement.classList.remove('news-open');
    setTimeout(() => { box.hidden = true; }, 200);
    if (zuvor && zuvor.isConnected) zuvor.focus({preventScroll: true});
  }

  return {start, open, close, liste: l => { seite = Array.isArray(l) ? l.filter(e => e && e.datum && e.titel) : []; }};
})();
