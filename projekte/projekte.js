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
    titel: 'Audiolabor',
    text: 'Eigene Schaltungen entwerfen, messen und hören: ngspice im Browser, ein eigener Live-Löser auf dem Audio-Thread, Schaltplan und Steckbrett als zwei Ansichten derselben Schaltung. 19 Versuche mit dokumentierten Prüfungen.',
    link: 'audiolabor/',
    status: 'Spielbar',
    datum: '2026-11-02',
    tags: ['ngspice', 'Web Audio', 'Simulation'],
    welle: 'gedaempft'
  },
  {
    titel: 'Messplatz',
    text: 'Elektroniklabor im Browser: Steckbrett, Oszilloskop, Funktionsgenerator, zwei Multimeter und Netzgerät, dazu Bode-Diagramm und Arbeitspunkt. Eigener Schaltungssimulator wie SPICE, sechzehn Versuche.',
    link: 'messplatz/',
    status: 'Spielbar',
    datum: '2026-10-23',
    tags: ['Simulation', 'Messtechnik', 'SPICE'],
    welle: 'gedaempft'
  },
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
    titel: 'Crashtest-Labor',
    text: 'Bausteine stecken, Melodien sequenzieren, Missionen lösen. Mit Oszillator, Sequencer, Filtern, Echo, Verzerrer und baumelnden Kabeln.',
    link: 'labor/',
    status: 'Spielbar',
    datum: '2026-10-21',
    tags: ['Web Audio', 'Grundlagen'],
    welle: 'saege'
  }
]);
