/* osci//log — gemeinsame Kopfzeile, Fußzeile und kleine Helfer für alle Seiten.
   Persönliche Links hier eintragen; leere Felder werden einfach nicht angezeigt. */
'use strict';
const OSCI_CONFIG = {
  name: 'Briken',
  instagram: '',   // z. B. 'osci.log' (ohne @)
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
    {id: 'labor', href: '#labor', title: 'Labor', text: 'Bausteine verbinden. Klang hören.'},
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
    const items = NAV.map(n => `<a class="menu-item" href="${url(n.href)}"><b>${n.title}</b><span>${n.text}</span></a>`).join('');
    slot.outerHTML = `<header class="chrome"><a class="brand-mini" href="${page === 'home' ? '#top' : root}" aria-label="osci//log Startseite"><span class="brand-top">osci//log</span><span class="brand-line"></span></a><nav class="nav" aria-label="Hauptnavigation">${links}<button class="menu-pill" id="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-panel">Menü</button><button class="lex-toggle" type="button" data-lex="" aria-label="Lexikon der elektrischen Größen öffnen" title="Lexikon: elektrische Größen nachschlagen"><span></span><span></span><span></span></button></nav></header><div class="menu-panel" id="menu-panel" inert>${items}</div>`;
    const toggle = document.getElementById('menu-toggle'), panel = document.getElementById('menu-panel');
    const setMenu = (open, focus = false) => {
      panel.classList.toggle('is-open', open); panel.inert = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (!open && focus) toggle.focus();
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    panel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', e => { if (!panel.contains(e.target) && !toggle.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) setMenu(false, true); });
  }

  function footer() {
    const slot = document.querySelector('[data-site-footer]');
    if (!slot) return;
    const c = OSCI_CONFIG, social = [];
    if (c.instagram) social.push(`<a href="https://instagram.com/${escape(c.instagram)}" rel="noopener">Instagram</a>`);
    if (c.github) social.push(`<a href="https://github.com/${escape(c.github)}" rel="noopener">GitHub</a>`);
    if (c.email) social.push(`<a href="mailto:${escape(c.email)}">E-Mail</a>`);
    slot.outerHTML = `<footer class="site-footer"><div class="site-footer-inner"><span>osci//log · ${escape(c.name)} · ${new Date().getFullYear()}</span><nav aria-label="Fußzeile">${NAV.map(n => `<a href="${url(n.href)}">${n.title}</a>`).join('')}${social.join('')}<a href="#top">Nach oben ↑</a></nav></div></footer>`;
  }

  /* Kleiner, deterministischer Zufall: gleiche Notiz → gleiches Titelbild. */
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }
  const WAVES = {
    sinus: (x) => Math.sin(x),
    rechteck: (x) => Math.sin(x) >= 0 ? .82 : -.82,
    dreieck: (x) => 2 / Math.PI * Math.asin(Math.sin(x)),
    saege: (x) => ((x / Math.PI + 1) % 2 + 2) % 2 - 1,
    gedaempft: (x, t) => Math.sin(x) * Math.exp(-2.2 * t),
    lade: (x, t) => 1.6 * (1 - Math.exp(-4.5 * t)) - .8,
    am: (x, t) => Math.sin(x * 2.4) * (.55 + .45 * Math.sin(t * Math.PI * 4))
  };
  /* Titelbild als Oszilloskop-Spur. `wave` erzwingt eine Wellenform (Schlüssel aus WAVES). */
  function cover(seed, wave) {
    const rnd = hash(seed), names = Object.keys(WAVES);
    const kind = WAVES[wave] ? wave : names[Math.floor(rnd() * names.length)];
    const periods = 1.5 + rnd() * 4, phase = rnd() * Math.PI * 2, amp = 62 + rnd() * 30;
    const w = 800, h = 350, mid = h / 2;
    const trace = (shift, scale) => {
      let d = '';
      for (let i = 0; i <= 320; i++) {
        const t = i / 320, x = t * w;
        const y = mid - WAVES[kind](t * periods * Math.PI * 2 + phase + shift, t) * amp * scale;
        d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
      }
      return d;
    };
    const grid = [];
    for (let x = 0; x <= w; x += 80) grid.push(`<path d="M${x},0V${h}"/>`);
    for (let y = 15; y <= h; y += 80) grid.push(`<path d="M0,${y}H${w}"/>`);
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="${w}" height="${h}" fill="#f6f6f1"/><g stroke="#e0e0d8" stroke-width="1">${grid.join('')}</g><path d="M0,${mid}H${w}" stroke="#c9c9c0" stroke-dasharray="3 5"/><path d="${trace(.9, .55)}" fill="none" stroke="#bdbdb4" stroke-width="2"/><path d="${trace(0, 1)}" fill="none" stroke="#111" stroke-width="3" stroke-linejoin="round"/><text x="22" y="${h - 20}" font-family="ui-monospace, Menlo, monospace" font-size="15" fill="#65655f">CH1 · ${kind.toUpperCase()}</text></svg>`;
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
          return {...meta, slug, tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? String(meta.tags).split(',').map(t => t.trim()) : [], titel: meta.titel || slug, datum: meta.datum || '', entwurf: istEntwurf(meta)};
        } catch { return null; }
      })).then(list => {
        const ok = list.filter(Boolean).sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
        ok.filter(n => !n.entwurf).reverse().forEach((n, i) => { n.nummer = String(i + 1).padStart(3, '0'); });
        return ok;
      });
    }
    return notizenPromise.then(list => mitEntwuerfen ? list : list.filter(n => !n.entwurf));
  }
  function notizKarte(n) {
    const href = url(`notizen/beitrag.html?b=${encodeURIComponent(n.slug)}`);
    return `<article class="card"><div class="card-cover">${n.bild ? `<img src="${url('notizen/' + escape(n.bild))}" alt="" loading="lazy">` : cover(n.slug, n.welle)}</div><div class="card-body"><div class="card-kicker"><span>${n.nummer ? `N°${n.nummer}` : 'Entwurf'} · ${escape(n.fach || 'Notiz')}</span><span>${date(n.datum)}</span></div><h3><a class="card-link" href="${href}">${escape(n.titel)}</a></h3><p>${escape(n.teaser || '')}</p>${n.tags.length ? `<div class="tags">${n.tags.map(t => `<span class="tag">${escape(t)}</span>`).join('')}</div>` : ''}</div></article>`;
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
  const LEX_VERSION = 1;
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-lex]');
    if (link) { e.preventDefault(); lexikon(link.dataset.lex); }
  });
  function lexFromHash() {
    const m = location.hash.match(/^#lexikon(?:-([\w-]+))?$/);
    if (m) lexikon(m[1]);
  }
  addEventListener('hashchange', lexFromHash);

  header();
  footer();
  lexFromHash();
  return {
    url, escape, cover, date, frontMatter, notizenLaden, notizKarte, projektKarte, loadKatex, lexikon,
    projekte: () => store.projekte.slice(),
    /* Wird von notizen/beitraege.js und projekte/projekte.js aufgerufen. */
    beitraege: list => { store.notizen = Array.isArray(list) ? list.map(x => String(x).replace(/\.md$/, '')) : []; },
    projekteListe: list => { store.projekte = Array.isArray(list) ? list : []; }
  };
})();
