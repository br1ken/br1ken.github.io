/* osci//log — gemeinsame Kopfzeile, Fußzeile und kleine Helfer für alle Seiten.
   Persönliche Links hier eintragen; leere Felder werden einfach nicht angezeigt. */
'use strict';
const OSCI_CONFIG = {
  name: 'Brick',
  instagram: '_br1ken_', // ohne @
  github: 'br1ken', // z. B. 'br1ken' oder 'br1ken/osci-log'
  email: ''
};

const OSCI = (() => {
  const root = document.documentElement.dataset.root || './';
  const page = document.body.dataset.page || '';
  /* Auf der Startseite bleiben Sprungmarken im selben Dokument (kein Neuladen). */
  const url = (path = '') => page === 'home' && path.startsWith('#') ? path : root + path;
  const store = { notizen: [], projekte: [] };

  const NAV = [
    {id: 'labor', href: 'labor/', title: 'Labor', text: 'Missionen, Sequencer, Kabel stecken.'},
    {id: 'messplatz', href: 'messplatz/', title: 'Messplatz', text: 'Oszi, Generator, Multimeter: Schaltungen messen.'},
    {id: 'notizen', href: 'notizen/', title: 'Notizen', text: 'Gelerntes aus dem E-Technik-Studium.'},
    {id: 'projekte', href: 'projekte/', title: 'Projekte', text: 'Simulationen, Schaltungen, Code.'},
    {id: 'about', href: '#about', title: 'Über mich', text: 'Wer hinter osci//log steckt.'}
  ];

  function escape(text) {
    return String(text ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  }

  function header() {
    const slot = document.querySelector('[data-site-header]');
    if (!slot) return;
    const links = NAV.map(n => `<a class="nav-link" href="${url(n.href)}"${n.id === page ? ' aria-current="page"' : ''}>${n.title}</a>`).join('');
    const items = NAV.map(n => `<a class="menu-item" href="${url(n.href)}"><b>${n.title}</b><span>${n.text}</span></a>`).join('') + '<a class="menu-item" href="#neuigkeiten" data-news><b>Neuigkeiten</b><span>Neue Notizen und Neuerungen an der Seite.</span></a>';
    slot.outerHTML = `<header class="chrome"><a class="brand-mini" href="${page === 'home' ? '#top' : root}" aria-label="osci//log Startseite"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#1a12ff"/><path d="M55.00 32.00L54.90 33.44L54.59 34.88L54.09 36.31L53.38 37.72L52.49 39.11L51.42 40.47L50.17 41.79L48.77 43.08L47.21 44.32L45.52 45.52L43.71 46.66L41.79 47.74L39.79 48.77L37.72 49.72L35.60 50.61L33.44 51.42L31.28 52.16L29.12 52.81L26.98 53.38L24.89 53.87L22.87 54.28L20.92 54.59L19.07 54.82L17.34 54.95L15.74 55.00L14.28 54.95L12.98 54.82L11.84 54.59L10.89 54.28L10.13 53.87L9.55 53.38L9.18 52.81L9.01 52.16L9.05 51.42L9.28 50.61L9.72 49.72L10.36 48.77L11.19 47.74L12.20 46.66L13.39 45.52L14.75 44.32L16.26 43.08L17.90 41.79L19.68 40.47L21.56 39.11L23.53 37.72L25.58 36.31L27.69 34.88L29.84 33.44L32.00 32.00L34.16 30.56L36.31 29.12L38.42 27.69L40.47 26.28L42.44 24.89L44.32 23.53L46.10 22.21L47.74 20.92L49.25 19.68L50.61 18.48L51.80 17.34L52.81 16.26L53.64 15.23L54.28 14.28L54.72 13.39L54.95 12.58L54.99 11.84L54.82 11.19L54.45 10.62L53.87 10.13L53.11 9.72L52.16 9.41L51.02 9.18L49.72 9.05L48.26 9.00L46.66 9.05L44.93 9.18L43.08 9.41L41.13 9.72L39.11 10.13L37.02 10.62L34.88 11.19L32.72 11.84L30.56 12.58L28.40 13.39L26.28 14.28L24.21 15.23L22.21 16.26L20.29 17.34L18.48 18.48L16.79 19.68L15.23 20.92L13.83 22.21L12.58 23.53L11.51 24.89L10.62 26.28L9.91 27.69L9.41 29.12L9.10 30.56L9.00 32.00L9.10 33.44L9.41 34.88L9.91 36.31L10.62 37.72L11.51 39.11L12.58 40.47L13.83 41.79L15.23 43.08L16.79 44.32L18.48 45.52L20.29 46.66L22.21 47.74L24.21 48.77L26.28 49.72L28.40 50.61L30.56 51.42L32.72 52.16L34.88 52.81L37.02 53.38L39.11 53.87L41.13 54.28L43.08 54.59L44.93 54.82L46.66 54.95L48.26 55.00L49.72 54.95L51.02 54.82L52.16 54.59L53.11 54.28L53.87 53.87L54.45 53.38L54.82 52.81L54.99 52.16L54.95 51.42L54.72 50.61L54.28 49.72L53.64 48.77L52.81 47.74L51.80 46.66L50.61 45.52L49.25 44.32L47.74 43.08L46.10 41.79L44.32 40.47L42.44 39.11L40.47 37.72L38.42 36.31L36.31 34.88L34.16 33.44L32.00 32.00L29.84 30.56L27.69 29.12L25.58 27.69L23.53 26.28L21.56 24.89L19.68 23.53L17.90 22.21L16.26 20.92L14.75 19.68L13.39 18.48L12.20 17.34L11.19 16.26L10.36 15.23L9.72 14.28L9.28 13.39L9.05 12.58L9.01 11.84L9.18 11.19L9.55 10.62L10.13 10.13L10.89 9.72L11.84 9.41L12.98 9.18L14.28 9.05L15.74 9.00L17.34 9.05L19.07 9.18L20.92 9.41L22.87 9.72L24.89 10.13L26.98 10.62L29.12 11.19L31.28 11.84L33.44 12.58L35.60 13.39L37.72 14.28L39.79 15.23L41.79 16.26L43.71 17.34L45.52 18.48L47.21 19.68L48.77 20.92L50.17 22.21L51.42 23.53L52.49 24.89L53.38 26.28L54.09 27.69L54.59 29.12L54.90 30.56Z" fill="none" stroke="#efece2" stroke-width="4.6" stroke-linejoin="round"/></svg><span class="brand-top">osci//log</span></a><nav class="nav" aria-label="Hauptnavigation">${links}<button class="menu-pill" id="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-panel">Menü</button><button class="theme-toggle" type="button" id="theme-toggle" aria-label="Hell oder dunkel umschalten" title="Hell / Dunkel"><span></span></button><button class="lex-toggle" type="button" data-lex="" aria-label="Lexikon öffnen: elektrische Größen und Synthesizer" title="Lexikon: nachschlagen"><span></span><span></span><span></span></button></nav></header><div class="menu-panel" id="menu-panel" inert>${items}</div>`;
    const toggle = document.getElementById('menu-toggle'), panel = document.getElementById('menu-panel');
    const setMenu = (open, focus = false) => {
      panel.classList.toggle('is-open', open); panel.inert = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (!open && focus) toggle.focus();
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    document.getElementById('theme-toggle').addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));
    panel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', e => { if (!panel.contains(e.target) && !toggle.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Hell/Dunkel: ohne Wahl folgt die Seite dem System; die Wahl bleibt im Browser gespeichert.
     Ein kleines Skript im <head> jeder Seite setzt sie schon vor dem ersten Zeichnen (kein Aufblitzen). */
  const darkQuery = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : darkQuery.matches;
  function syncThemeColor() { document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark() ? '#0a0a14' : '#efece2'); }
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('osci-log-theme', theme); } catch { /* egal */ }
    syncThemeColor();
    dispatchEvent(new CustomEvent('osci-theme'));
  }
  darkQuery.addEventListener('change', () => { syncThemeColor(); dispatchEvent(new CustomEvent('osci-theme')); });

  function footer() {
    const slot = document.querySelector('[data-site-footer]');
    if (!slot) return;
    const c = OSCI_CONFIG, social = [];
    if (c.instagram) social.push(`<a href="https://instagram.com/${escape(c.instagram)}" rel="noopener">Instagram</a>`);
    if (c.github) social.push(`<a href="https://github.com/${escape(c.github)}" rel="noopener">GitHub</a>`);
    if (c.email) social.push(`<a href="mailto:${escape(c.email)}">E-Mail</a>`);
    slot.outerHTML = `<footer class="site-footer"><div class="site-footer-inner"><span>osci//log · ${escape(c.name)} · ${new Date().getFullYear()}</span><nav aria-label="Fußzeile">${NAV.map(n => `<a href="${url(n.href)}">${n.title}</a>`).join('')}<a href="#neuigkeiten" data-news>Neuigkeiten</a>${social.join('')}<a href="#top">Nach oben ↑</a></nav></div></footer>`;
  }

  /* Kleiner, deterministischer Zufall: gleiche Notiz → gleiches Titelbild. */
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }
  /* Lissajous-Verhältnis je Wellenform aus dem Notizkopf */
  const FIGUREN = {sinus: [1, 2], rechteck: [3, 2], dreieck: [3, 4], saege: [2, 3], gedaempft: [5, 4], lade: [1, 3], am: [5, 6]};
  /* Titelbild als XY-Oszillogramm: Zwei Sinussignale im festen Verhältnis zeichnen eine Lissajous-Figur auf den Schirm. */
  function cover(seed, wave) {
    const rnd = hash(seed), namen = Object.keys(FIGUREN);
    const kind = FIGUREN[wave] ? wave : namen[Math.floor(rnd() * namen.length)];
    const [fx, fy] = FIGUREN[kind];
    const w = 800, h = 450, phase = .4 + rnd() * 2.2;
    const figur = ph => {
      let d = '';
      for (let i = 0; i <= 260; i++) {
        const u = i / 260 * Math.PI * 2;
        d += `${i ? 'L' : 'M'}${(w / 2 + Math.sin(fx * u + ph) * w * .3).toFixed(1)} ${(h / 2 + Math.sin(fy * u) * h * .4).toFixed(1)}`;
      }
      return d;
    };
    const raster = [];
    for (let x = 80; x < w; x += 80) raster.push(`<path d="M${x} 0V${h}"/>`);
    for (let y = 45; y < h; y += 90) raster.push(`<path d="M0 ${y}H${w}"/>`);
    return `<svg class="cover" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect class="cv-bg" width="${w}" height="${h}"/><g class="cv-raster">${raster.join('')}</g><path class="cv-achse" d="M${w / 2} 0V${h}M0 ${h / 2}H${w}"/><path class="cv-echo" d="${figur(phase - .16)}"/><path class="cv-spur" d="${figur(phase)}"/><text class="cv-text" x="${w - 22}" y="${h - 22}" text-anchor="end">XY ${fx}:${fy}</text></svg>`;
  }

  const dateFormat = new Intl.DateTimeFormat('de-DE', {day: 'numeric', month: 'short', year: 'numeric'});
  function date(iso) {
    const d = new Date(iso + 'T12:00:00');
    return Number.isNaN(d.getTime()) ? escape(iso) : dateFormat.format(d);
  }

  /* Kopfbereich einer Notiz zwischen zwei ---‑Zeilen: "schlüssel: wert", Listen als [a, b]. */
  function frontMatter(text) {
    const meta = {};
    const m = String(text).replace(/\r\n?/g, '\n').match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
    if (!m) return {meta, body: String(text)};
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^\s*([\wäöü]+)\s*:\s*(.*)$/i);
      if (!kv) continue;
      let v = kv[2].trim().replace(/^["']|["']$/g, '');
      if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      meta[kv[1].toLowerCase()] = v;
    }
    return {meta, body: String(text).replace(/\r\n?/g, '\n').slice(m[0].length)};
  }
  const istEntwurf = (meta) => /^(ja|true|yes|1)$/i.test(String(meta.entwurf || ''));

  /* Notizen laden: Liste der Dateinamen aus beitraege.js, Titel/Datum/Tags aus dem Kopf jeder .md-Datei.
     Ergebnis: neueste zuerst, Entwürfe ausgeblendet, mit fortlaufender Nummer (älteste = 001). */
  let notizenPromise = null;
  function notizenLaden({mitEntwuerfen = false} = {}) {
    if (!notizenPromise) {
      notizenPromise = Promise.all(store.notizen.map(async slug => {
        try {
          const res = await fetch(url(`notizen/texte/${encodeURIComponent(slug)}.md`));
          if (!res.ok) throw Error(res.status);
          const {meta} = frontMatter(await res.text());
          return {...meta, slug, tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? String(meta.tags).split(',').map(t => t.trim()) : [], titel: meta.titel || slug, datum: meta.datum || '', art: String(meta.art || '').toLowerCase(), aufgabe: String(meta.aufgabe || ''), entwurf: istEntwurf(meta)};
        } catch { return null; }
      })).then(list => {
        const ok = list.filter(Boolean).sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
        ok.filter(n => !n.entwurf).reverse().forEach((n, i) => { n.nummer = String(i + 1).padStart(3, '0'); });
        return ok;
      });
    }
    return notizenPromise.then(list => mitEntwuerfen ? list : list.filter(n => !n.entwurf));
  }
  /* Art einer Notiz (Feld „art“ im Kopf): durchgerechnete Aufgabe oder allgemeine Theorie.
     Notizen ohne gültige Art landen in der Übersicht unter „Sonstiges“. */
  const ARTEN = {rechnung: {name: 'Rechnung', mehrzahl: 'Rechnungen'}, theorie: {name: 'Theorie', mehrzahl: 'Theorie'}};
  function notizKarte(n) {
    const href = url(`notizen/beitrag.html?b=${encodeURIComponent(n.slug)}`);
    const art = ARTEN[n.art];
    return `<article class="card"><div class="card-cover">${art ? `<span class="card-art" data-art="${n.art}">${art.name}</span>` : ''}${n.bild ? `<img src="${url('notizen/' + escape(n.bild))}" alt="" loading="lazy">` : cover(n.slug, n.welle)}</div><div class="card-body"><div class="card-kicker"><span>${n.nummer ? `N°${n.nummer}` : 'Entwurf'} · ${escape(n.fach || 'Notiz')}${n.aufgabe ? ` · A${escape(n.aufgabe)}` : ''}</span><span>${date(n.datum)}</span></div><h3><a class="card-link" href="${href}">${escape(n.titel)}</a></h3><p>${escape(n.teaser || '')}</p>${n.tags.length ? `<div class="tags">${n.tags.map(t => `<span class="tag">${escape(t)}</span>`).join('')}</div>` : ''}</div></article>`;
  }
  function projektKarte(p) {
    const href = !p.link ? '' : /^https?:/.test(p.link) ? p.link : url(p.link);
    const repo = p.repo ? `<a class="text-link" href="${escape(p.repo)}" rel="noopener">Quellcode ↗︎</a>` : '';
    return `<article class="card"><div class="card-cover">${p.bild ? `<img src="${url(escape(p.bild))}" alt="" loading="lazy">` : cover(p.titel, p.welle)}</div><div class="card-body"><div class="card-kicker"><span>${escape(p.status || 'Projekt')}</span><span>${p.datum ? date(p.datum) : ''}</span></div><h3>${href ? `<a class="card-link" href="${escape(href)}">${escape(p.titel)}</a>` : escape(p.titel)}</h3><p>${escape(p.text || '')}</p>${p.tags?.length ? `<div class="tags">${p.tags.map(t => `<span class="tag">${escape(t)}</span>`).join('')}</div>` : ''}${repo ? `<div class="card-actions">${repo}</div>` : ''}</div></article>`;
  }

  /* KaTeX (Formelsatz) nur laden, wenn eine Seite wirklich Formeln zeigt. */
  let katexLoading = null;
  function loadKatex() {
    if (window.katex) return Promise.resolve();
    if (katexLoading) return katexLoading;
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = url('assets/vendor/katex/katex.min.css');
    document.head.append(css);
    katexLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url('assets/vendor/katex/katex.min.js'); s.onload = resolve; s.onerror = () => { katexLoading = null; reject(); };
      document.head.append(s);
    });
    return katexLoading;
  }

  /* Lexikon der elektrischen Größen: ⋮ oben rechts, [[Begriff]]-Links in Notizen oder #lexikon in der Adresse.
     lexikon.js wird erst beim ersten Öffnen geladen. */
  let lexLoading = null;
  function lexikon(id) {
    if (!lexLoading) {
      lexLoading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url(`assets/lexikon.js?v=${LEX_VERSION}`); s.onload = resolve; s.onerror = () => { lexLoading = null; reject(); };
        document.head.append(s);
      });
    }
    return lexLoading.then(() => OSCILexikon.open(id));
  }
  const LEX_VERSION = 13;
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-lex]');
    if (link) { e.preventDefault(); lexikon(link.dataset.lex).catch(() => {}); }
  });
  function lexFromHash() {
    const m = location.hash.match(/^#lexikon(?:-([\w-]+))?$/);
    if (m) lexikon(m[1]).catch(() => {});
  }
  addEventListener('hashchange', lexFromHash);

  /* Neuigkeiten: Rufzeichen unten rechts (assets/neuigkeiten.js, Einträge in neuigkeiten.js).
     Wird auf jeder Seite nachgeladen, sobald der Browser Zeit hat; „Neuigkeiten“ in Fußzeile und Menü oder #neuigkeiten öffnen das Fenster. */
  let newsLoading = null;
  function neuigkeiten() {
    if (!newsLoading) {
      newsLoading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url(`assets/neuigkeiten.js?v=${NEWS_VERSION}`); s.onload = resolve; s.onerror = () => { newsLoading = null; reject(); };
        document.head.append(s);
      });
    }
    return newsLoading;
  }
  const NEWS_VERSION = 1;
  const newsOeffnen = () => neuigkeiten().then(() => OSCINeuigkeiten.open()).catch(() => {});
  document.addEventListener('click', e => {
    if (e.target.closest('[data-news]')) { e.preventDefault(); newsOeffnen(); }
  });
  addEventListener('hashchange', () => { if (location.hash === '#neuigkeiten') newsOeffnen(); });

  header();
  footer();
  syncThemeColor();
  lexFromHash();
  if (location.hash === '#neuigkeiten') newsOeffnen();
  else (window.requestIdleCallback || (f => setTimeout(f, 600)))(() => neuigkeiten().then(() => OSCINeuigkeiten.start()).catch(() => {}));
  return {
    url, escape, cover, date, frontMatter, notizenLaden, notizKarte, projektKarte, loadKatex, lexikon, isDark, ARTEN,
    projekte: () => store.projekte.slice(),
    notizenSlugs: () => store.notizen.slice(),
    /* Wird von notizen/beitraege.js und projekte/projekte.js aufgerufen. */
    beitraege: list => { store.notizen = Array.isArray(list) ? list.map(x => String(x).replace(/\.md$/, '')) : []; },
    projekteListe: list => { store.projekte = Array.isArray(list) ? list : []; }
  };
})();
