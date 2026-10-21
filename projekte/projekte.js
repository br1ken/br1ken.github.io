/* Liste aller Projekte. Neues Projekt: Ordner unter projekte/ anlegen (z. B. _vorlage kopieren)
   und hier oben einen Eintrag ergänzen. Pfade relativ zur Startseite, ohne führenden Schrägstrich.

   titel   Name auf der Karte
   text    ein, zwei Sätze, worum es geht
   link    'projekte/mein-ordner/' oder eine volle https://-Adresse; weglassen = noch nicht klickbar
   status  kurzer Zustand, z. B. 'Spielbar', 'Simulation', 'In Arbeit', 'Geplant'
   datum   'JJJJ-MM-TT'
   tags    Schlagworte
   repo    optional: Link zum Quellcode auf GitHub
   bild    optional: eigenes Titelbild, z. B. 'projekte/mein-ordner/vorschau.jpg' (sonst eine generierte Welle)
   welle   optional: Wellenform des generierten Bildes: sinus, rechteck, dreieck, saege, gedaempft, lade, am */
OSCI.projekteListe([
  {
    titel: 'RC-Filter-Explorer',
    text: 'Bode-Diagramm und Sprungantwort eines RC-Tiefpasses live: R und C verschieben und sehen, wie sich Grenzfrequenz und Ladekurve verändern.',
    link: 'projekte/rc-filter/',
    status: 'Simulation',
    datum: '2026-10-22',
    tags: ['RC', 'Filter', 'Bode'],
    welle: 'lade'
  },
  {
    titel: 'Klang-Playground',
    text: 'Bausteine greifen, Kabel stecken, Grundlagen hören. Mit Oszillatoren, Widerstand, Kondensator, Spule und Tremolo.',
    link: '#labor',
    status: 'Spielbar',
    datum: '2026-10-21',
    tags: ['Web Audio', 'Grundlagen'],
    welle: 'saege'
  },
  {
    titel: 'Schaltungen zum Anfassen',
    text: 'Als Nächstes: echte Schaltungssimulationen mit Knoten und Maschen — und Experimente, mit denen man aus Bauteilen Musik macht.',
    status: 'Geplant',
    tags: ['Simulation'],
    welle: 'am'
  }
]);
