/* Für Projektseiten: Simulationen starten und $…$-Formeln setzen (lädt markdown.js nur bei Bedarf). */
'use strict';
(() => {
  if (typeof OSCISims !== 'undefined') OSCISims.mount(document);
  const prose = document.querySelectorAll('.prose');
  if (![...prose].some(el => /\$[^$]+\$/.test(el.textContent))) return;
  const s = document.createElement('script');
  s.src = OSCI.url('assets/markdown.js');
  s.onload = () => prose.forEach(el => {
    el.querySelectorAll('p, li, td').forEach(node => {
      if (/\$[^$]+\$/.test(node.innerHTML)) node.innerHTML = node.innerHTML.replace(/\$([^$]+)\$/g, (_, tex) => `<span class="math math-inline">${tex}</span>`);
    });
    OSCIMarkdown.typeset(el);
  });
  document.head.append(s);
})();
