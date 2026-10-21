/* Startseite: die neuesten Notizen und Projekte als Karten. */
'use strict';
(() => {
  const notes = document.getElementById('latest-notes'), projects = document.getElementById('latest-projects');
  notes.innerHTML = '<p class="empty-state">Notizen werden geladen …</p>';
  OSCI.notizenLaden().then(list => {
    notes.innerHTML = list.length ? list.slice(0, 3).map(OSCI.notizKarte).join('') : '<p class="empty-state">Die ersten Notizen sind unterwegs.</p>';
  });
  const list = OSCI.projekte().slice(0, 3);
  projects.innerHTML = list.length ? list.map(OSCI.projektKarte).join('') : '<p class="empty-state">Hier erscheinen bald weitere Projekte.</p>';
})();
