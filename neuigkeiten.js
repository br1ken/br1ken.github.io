/* Neuigkeiten für das Fenster hinter dem Rufzeichen unten rechts (Code: assets/neuigkeiten.js).
   Neue Notizen erscheinen dort von selbst (aus notizen/beitraege.js). Hier stehen nur Neuerungen an der Seite
   und größere Ergänzungen an bestehenden Notizen. Neuer Eintrag: einfach oben anfügen, Reihenfolge ist egal.
     datum:   JJJJ-MM-TT
     bereich: kurzes Etikett, z. B. Seite, Notizen, Labor, Messplatz (optional)
     titel:   ein paar Wörter
     text:    ein, zwei Sätze
     link:    optional, relativ zur Startseite (z. B. 'messplatz/') oder eine volle Adresse */
OSCINeuigkeiten.liste([
  {datum: '2026-10-27', bereich: 'Lexikon', titel: 'Neun neue Lexikon-Einträge', text: 'Stromteiler, Stern-Dreieck, Ersatzstromquelle, Knotenpotentialverfahren, Knoten einfärben, Leerlauf und Kurzschluss, Mittelwert, Gleichrichtwert und Faraday. Jeder Eintrag verlinkt jetzt die Notizen, in denen es ausführlich steht.', link: '#lexikon'},
  {datum: '2026-10-27', bereich: 'Seite', titel: 'Neuigkeiten auf einen Blick', text: 'Das gelbe Rufzeichen unten rechts zeigt an, wenn es neue Notizen oder Neuerungen gibt. Nach dem Öffnen wartet es klein und grau in der Ecke, bis wieder etwas dazukommt.'},
  {datum: '2026-10-27', bereich: 'Notizen', titel: 'Formeln passen aufs Handy', text: 'Lange Formeln werden am Handy verkleinert statt umbrochen, und das Inhaltsverzeichnis zeigt Formeln in Überschriften richtig an.'},
  {datum: '2026-10-26', bereich: 'Notizen', titel: 'Stromteiler mit Herleitung', text: 'Die Notiz zu Widerstandsnetzwerken hat einen neuen Abschnitt: der Stromteiler, hergeleitet und mit Beispiel.', link: 'notizen/beitrag.html?b=spannungsteiler#6-der-stromteiler'},
  {datum: '2026-10-25', bereich: 'Messplatz', titel: 'Messplatz als Laborwerkzeug', text: 'Analyse, neue Bauteile und 16 fertige Versuche zum Nachbauen und Messen.', link: 'messplatz/'},
  {datum: '2026-10-24', bereich: 'Messplatz', titel: 'MOSFET, Trafo und Arbeitspunkt', text: 'Die Schaltungs-Engine rechnet jetzt auch MOSFETs und Transformatoren, dazu Arbeitspunkt und Kleinsignalanalyse.', link: 'messplatz/'},
  {datum: '2026-10-24', bereich: 'Seite', titel: 'osci//log auf Instagram', text: 'Neue Notizen und Experimente gibt es jetzt auch auf Instagram: @_br1ken_.', link: 'https://instagram.com/_br1ken_'},
  {datum: '2026-10-23', bereich: 'Notizen', titel: 'Rechnungen und Theorie getrennt', text: 'Die Übersicht trennt durchgerechnete Aufgaben aus den Rechenübungen von allgemeiner Theorie und lässt sich danach filtern.', link: 'notizen/'},
  {datum: '2026-10-23', bereich: 'Messplatz', titel: 'Der Messplatz ist da', text: 'Ein Schaltungssimulator mit Oszilloskop, Generator, Multimeter und Netzgerät, direkt im Browser.', link: 'messplatz/'},
  {datum: '2026-10-22', bereich: 'Labor', titel: 'Crashtest-Labor 2.0', text: 'Missionen, Sequencer, Kopplung und ein Synth-Lexikon, jetzt auch im Dunkelmodus.', link: 'labor/'}
]);
