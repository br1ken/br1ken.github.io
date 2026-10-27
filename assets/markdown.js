/* Kleiner Markdown-Renderer für die Notizen — ohne Build-Schritt, ohne externe Abhängigkeit.
   Unterstützt: Überschriften, Absätze, **fett**, *kursiv*, ~~durch~~, ==markiert==, `Code`, Links, Bilder,
   Listen (auch verschachtelt und - [x] Aufgaben), Zitate, Tabellen, Codeblöcke, Trennlinien,
   Formeln ($…$ und $$…$$ mit KaTeX), Kästen (::: merke / info / tipp / achtung / aufgabe … :::)
   Simulationen (::: sim rc r=10k c=22n) und Lexikon-Links ([[Leistung]] oder [[Text|leistung]]).
   Die vollständige Anleitung steht in SCHREIBEN.md. */
'use strict';
const OSCIMarkdown = (() => {
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const safeUrl = (u) => /^\s*(javascript|data|vbscript):/i.test(u) ? '#' : u.trim();
  function slugify(text) {
    return String(text).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'abschnitt';
  }

  /* ---------- Inline ---------- */
  function inline(text) {
    const keep = [];
    const hold = (html) => `\u0000${keep.push(html) - 1}\u0000`;
    let s = String(text);
    s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => hold(`<code>${esc(code.trim())}</code>`));
    s = s.replace(/\\\$/g, () => hold('$'));
    s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, text, id) => hold(`<a class="lex-link" href="#lexikon-${esc(slugify(id || text))}" data-lex="${esc(slugify(id || text))}">${esc(text.trim())}</a>`));
    /* Ein direkt folgendes Satzzeichen bleibt bei kurzen Formeln in derselben Zeile (sonst landet ein Komma allein am
       Zeilenanfang). Lange Formeln dürfen weiter intern umbrechen, darum dort kein Klammern. */
    s = s.replace(/\$([^\s$](?:[^$]*?[^\s$])?)\$(?!\d)([.,;:!?)]?)/g, (_, tex, punct) => {
      const math = `<span class="math math-inline">${esc(tex)}</span>`;
      return punct && tex.length <= 40 ? hold(`<span class="math-nobr">${math}`) + punct + hold('</span>') : hold(math) + punct;
    });
    s = esc(s);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title) => hold(`<img src="${esc(safeUrl(src))}" alt="${alt}"${title ? ` title="${title}"` : ''} loading="lazy">`));
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const url = safeUrl(href.replace(/&amp;/g, '&'));
      const external = /^https?:/.test(url);
      return hold(`<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>`) + label + hold(external ? ' ↗︎</a>' : '</a>');
    });
    s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/==([^=]+)==/g, '<mark>$1</mark>')
      .replace(/ {2,}\n|\\\n/g, '<br>')
      .replace(/\n/g, ' ');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[Number(i)]);
  }

  /* ---------- Blöcke ---------- */
  const isFence = (l) => /^\s*```/.test(l);
  const isHeading = (l) => /^#{1,4}\s/.test(l);
  const isRule = (l) => /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(l);
  const listMatch = (l) => l.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
  const isContainer = (l) => /^:::\s*\S/.test(l);
  const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
  const isHtml = (l) => /^\s*<(div|iframe|video|audio|figure|table|details|svg|p|section|aside|img|canvas|br|hr)\b/i.test(l);
  const startsBlock = (l, next) => isFence(l) || isHeading(l) || isRule(l) || listMatch(l) || isContainer(l) || /^\s*>/.test(l) || /^\s*\$\$/.test(l) || isHtml(l) || (l.includes('|') && next !== undefined && isTableSep(next));

  const CALLOUTS = {merke: 'Merke', info: 'Info', tipp: 'Tipp', achtung: 'Achtung', aufgabe: 'Aufgabe', beispiel: 'Beispiel', herleitung: 'Herleitung'};

  function blocks(lines, ctx) {
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      if (isFence(line)) {
        const lang = line.trim().slice(3).trim();
        const body = [];
        i++;
        while (i < lines.length && !isFence(lines[i])) body.push(lines[i++]);
        i++;
        out.push(`<pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(body.join('\n'))}</code></pre>`);
        continue;
      }

      if (/^\s*\$\$/.test(line)) {
        let tex = line.trim().slice(2);
        if (tex.trim().endsWith('$$') && tex.trim().length > 2) tex = tex.trim().slice(0, -2);
        else {
          const body = [tex];
          i++;
          while (i < lines.length && !lines[i].trim().endsWith('$$')) body.push(lines[i++]);
          if (i < lines.length) body.push(lines[i].trim().slice(0, -2));
          tex = body.join('\n');
        }
        i++;
        ctx.math = true;
        out.push(`<div class="math math-display">${esc(tex.trim())}</div>`);
        continue;
      }

      if (isContainer(line)) {
        const [, kind = '', rest = ''] = line.match(/^:::\s*(\S+)\s*(.*)$/) || [];
        const body = [];
        let depth = 1;
        i++;
        while (i < lines.length) {
          if (isContainer(lines[i])) depth++;
          else if (/^:::\s*$/.test(lines[i])) { depth--; if (!depth) break; }
          body.push(lines[i++]);
        }
        i++;
        out.push(container(kind.toLowerCase(), rest, body, ctx));
        continue;
      }

      const h = line.match(/^(#{1,4})\s+(.*?)\s*#*\s*$/);
      if (h) {
        const level = Math.max(2, h[1].length);
        const html = inline(h[2]);
        let id = slugify(h[2]), n = 2;
        while (ctx.ids.has(id)) id = `${slugify(h[2])}-${n++}`;
        ctx.ids.add(id);
        if (level === 2) ctx.toc.push({id, text: html.replace(/<[^>]+>/g, ''), html});
        out.push(`<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${html}</h${level}>`);
        i++;
        continue;
      }

      if (isRule(line)) { out.push('<hr>'); i++; continue; }

      if (/^\s*>/.test(line)) {
        const body = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
        out.push(`<blockquote>${blocks(body, ctx)}</blockquote>`);
        continue;
      }

      if (listMatch(line)) {
        /* Eine Liste endet, wenn auf gleicher Ebene die Art wechselt (- … ↔ 1. …). */
        const base = listMatch(line), baseIndent = base[1].length, ordered = /\d/.test(base[2]);
        const sameList = (l) => { const m = listMatch(l); return m && (m[1].length > baseIndent || /\d/.test(m[2]) === ordered); };
        const body = [];
        while (i < lines.length && (sameList(lines[i]) || (!listMatch(lines[i]) && lines[i].trim() && /^\s{2,}/.test(lines[i])) || (!lines[i].trim() && i + 1 < lines.length && (sameList(lines[i + 1]) || /^\s{2,}\S/.test(lines[i + 1]))))) body.push(lines[i++]);
        out.push(list(body, ctx));
        continue;
      }

      if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const head = cells(line), align = cells(lines[i + 1]).map(c => c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : '');
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]));
        const td = (tag, c, k) => `<${tag}${align[k] ? ` style="text-align:${align[k]}"` : ''}>${inline(c)}</${tag}>`;
        out.push(`<div class="table-wrap"><table><thead><tr>${head.map((c, k) => td('th', c, k)).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, k) => td('td', c, k)).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }

      if (isHtml(line)) {
        const body = [];
        while (i < lines.length && lines[i].trim()) body.push(lines[i++]);
        out.push(body.join('\n'));
        continue;
      }

      const img = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
      if (img) {
        const caption = img[3] || img[1];
        out.push(`<figure><img src="${esc(safeUrl(img[2]))}" alt="${esc(img[1])}" loading="lazy">${caption ? `<figcaption>${inline(caption)}</figcaption>` : ''}</figure>`);
        i++;
        continue;
      }

      const para = [];
      while (i < lines.length && lines[i].trim() && !(para.length && startsBlock(lines[i], lines[i + 1]))) para.push(lines[i++]);
      const text = para.join('\n');
      if (/\$[^$]+\$/.test(text)) ctx.math = true;
      out.push(`<p>${inline(text)}</p>`);
    }
    return out.join('\n');
  }

  function list(lines, ctx) {
    const first = listMatch(lines[0]);
    const indent = first[1].length, ordered = /\d/.test(first[2]);
    const items = [];
    for (const l of lines) {
      const m = listMatch(l);
      if (m && m[1].length <= indent) items.push([m[3]]);
      else if (items.length) items[items.length - 1].push(l.slice(Math.min(indent + 2, l.length - l.trimStart().length)));
    }
    const lis = items.map(([head, ...rest]) => {
      const task = head.match(/^\[( |x|X)\]\s+(.*)$/);
      const label = task ? `<input type="checkbox" disabled${task[1] !== ' ' ? ' checked' : ''}> ${inline(task[2])}` : inline(head);
      if (/\$[^$]+\$/.test(head)) ctx.math = true;
      const nested = rest.join('\n').trim() ? blocks(rest, ctx) : '';
      return `<li${task ? ' class="task"' : ''}>${label}${nested}</li>`;
    });
    const start = ordered && parseInt(first[2], 10) !== 1 ? ` start="${parseInt(first[2], 10)}"` : '';
    return ordered ? `<ol${start}>${lis.join('')}</ol>` : `<ul>${lis.join('')}</ul>`;
  }

  function container(kind, rest, body, ctx) {
    if (kind === 'sim') {
      const [name = '', ...args] = rest.trim().split(/\s+/);
      const data = args.map(a => a.split('=')).filter(([k]) => /^[a-z][a-z0-9]*$/i.test(k)).map(([k, v = '']) => ` data-${k.toLowerCase()}="${esc(v)}"`).join('');
      ctx.sims = true;
      const note = body.join('\n').trim() ? `<p class="sim-note">${inline(body.join('\n'))}</p>` : '';
      return `<div class="sim-slot"><div data-sim="${esc(name.toLowerCase())}"${data}><p class="sim-loading">Simulation „${esc(name)}“ wird geladen …</p></div>${note}</div>`;
    }
    const label = CALLOUTS[kind] || kind.charAt(0).toUpperCase() + kind.slice(1);
    const title = rest.trim() ? inline(rest.trim()) : '';
    if (kind === 'aufgabe') {
      const split = body.findIndex(l => /^\s*\?\?\?\s*$/.test(l));
      const task = split < 0 ? body : body.slice(0, split), solution = split < 0 ? [] : body.slice(split + 1);
      return `<aside class="callout callout-aufgabe"><div class="callout-label">${label}${title ? ` · <span>${title}</span>` : ''}</div>${blocks(task, ctx)}${solution.length ? `<details class="solution"><summary>Lösung zeigen</summary>${blocks(solution, ctx)}</details>` : ''}</aside>`;
    }
    if (kind === 'herleitung') return `<details class="callout callout-herleitung"><summary class="callout-label">${label}${title ? ` · <span>${title}</span>` : ''}</summary>${blocks(body, ctx)}</details>`;
    return `<aside class="callout callout-${esc(kind)}"><div class="callout-label">${label}${title ? ` · <span>${title}</span>` : ''}</div>${blocks(body, ctx)}</aside>`;
  }

  function render(text) {
    const {meta, body} = OSCI.frontMatter(text);
    const ctx = {ids: new Set(), toc: [], math: false, sims: false};
    const html = blocks(body.split('\n'), ctx);
    const words = body.replace(/\$\$[\s\S]*?\$\$|```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
    return {html, meta, toc: ctx.toc, hasMath: ctx.math, hasSims: ctx.sims, minutes: Math.max(1, Math.round(words / 190))};
  }

  async function typeset(root) {
    const nodes = root.querySelectorAll('.math:not([data-done])');
    if (!nodes.length) return;
    try { await OSCI.loadKatex(); } catch { return; /* Formeln bleiben als lesbarer TeX-Text stehen */ }
    nodes.forEach(el => {
      const tex = el.textContent;
      el.dataset.done = '1'; el.dataset.tex = tex;
      try { window.katex.render(tex, el, {displayMode: el.classList.contains('math-display'), throwOnError: false, strict: 'ignore'}); } catch { el.textContent = tex; }
    });
    fit(root);
    if (document.fonts) document.fonts.ready.then(() => fit(root));
    if (!fitBound) {
      fitBound = true;
      let frame = 0;
      addEventListener('resize', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => fit(document)); });
      document.addEventListener('toggle', e => { if (e.target.open) fit(e.target); }, true);
    }
  }

  /* Formeln, die breiter als die Spalte sind (am Handy), werden verkleinert statt umbrochen, höchstens auf 70 %. Was dann noch übersteht, lässt sich in seinem Kasten seitlich wischen. Auf breiten Bildschirmen bleibt alles in Originalgröße. */
  let fitBound = false;
  function fit(root) {
    root.querySelectorAll('.math-display[data-done] .katex-display').forEach(box => {
      const k = box.querySelector('.katex');
      if (!k) return;
      k.style.fontSize = '';
      const avail = box.clientWidth, need = box.scrollWidth;
      if (!avail || need <= avail) return;
      const scale = Math.max(0.7, avail / need * 0.98);
      k.style.fontSize = `${parseFloat(getComputedStyle(k).fontSize) * scale}px`;
    });
  }
  return {render, typeset, slugify, inline};
})();
