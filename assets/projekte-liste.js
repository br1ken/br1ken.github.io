/* Projekt-Übersicht aus projekte/projekte.js */
'use strict';
(() => {
  const list = OSCI.projekte();
  document.getElementById('projects').innerHTML = list.length ? list.map(OSCI.projektKarte).join('') : '<p class="empty-state">Noch keine Projekte eingetragen.</p>';
})();
