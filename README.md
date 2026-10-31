# osci//log

Bricks persönliches Labor für Schaltungen, Klang und Notizen aus dem E-Technik-Studium an der TU Wien.

- **Live:** https://br1ken.github.io
- **Repository:** https://github.com/br1ken/br1ken.github.io (öffentlich, Branch `main`)
- **Dieser Ordner:** `Brikens Festplatte / Extreme pro Backup / Priv / osci-log` ist die Arbeitskopie. Was hier committet und gepusht wird, geht live.

## Tech-Stack

Bewusst minimal: **plain HTML, CSS und JavaScript, ohne Framework und ohne Build-Schritt, gehostet auf GitHub Pages.**

| Bereich | Technik |
|---|---|
| Grundlage | HTML5, CSS3, Vanilla JavaScript (kein React/Vue, kein npm) |
| Hosting | GitHub Pages (statisch), Versionierung mit Git/GitHub |
| Klang | Web Audio API: Oszillatoren, IIR-Filter (RC/RL als digitale Tiefpässe 1. Ordnung, bilineare Transformation), Gain, Kompressor als Limiter, Analyser fürs Oszilloskop |
| Grafik | SVG (Schaltpläne, Diagramme, Titelbilder), Canvas (Oszilloskop) |
| Formeln | KaTeX 0.19, lokal in `assets/vendor/katex`, nur bei Bedarf geladen |
| Notizen | Markdown-Dateien, eigener Renderer (`assets/markdown.js`) mit Kästen, Aufgaben, Simulationen und Lexikon-Links |
| Schrift | MesloLGS Nerd Font (verkleinert, eingebettet) für Text, Helvetica Neue für große Überschriften |
| Rechnungen | in Python/Jupyter entwickelt, auf der Seite live in JavaScript nachgebaut |

## Was drin ist

| Bereich | Adresse | Was es ist |
|---|---|---|
| Startseite | `index.html` | Hero, Labor-Teaser, neueste Notizen und Projekte, „Hinter dem Signal.“ (Bio mit Datenblatt) |
| Crashtest-Labor | `labor/` | Lab 0: Missionen, Sequencer, Effekte, Pult mit baumelnden Kabeln |
| Messplatz | `messplatz/` | Lab 1: Steckbrett mit Funktionsgenerator, Oszilloskop, zwei Multimetern und Netzgerät, Bode-Diagramm, Arbeitspunkt, Messreihe, eigener Schaltungssimulator, 16 Versuche |
| Notizen | `notizen/` | Blog für Gelerntes aus dem Studium, mit Suche und Themenfilter |
| Eine Notiz | `notizen/beitrag.html?b=name` | wird aus `notizen/texte/name.md` erzeugt |
| Schreibstube | `notizen/schreiben.html` | Editor mit Live-Vorschau für neue Notizen (nicht verlinkt) |
| Projekte | `projekte/` | Simulationen, Schaltungen, Code |
| Lexikon | ⋮ oben rechts auf jeder Seite, „?“ an jedem Baustein im Labor, oder `#lexikon` / `#lexikon-spannung` / `#lexikon-synth` an der Adresse | zwei Teile: **Elektro** (55 Größen, Gesetze, Bauelemente und Messgeräte: formal, physikalisch, SI-Einheit) und **Synth** (29 Bausteine und Begriffe eines Synthesizers, mit Verweis auf den passenden Labor-Baustein) |
| Neuigkeiten | Rufzeichen unten rechts auf jeder Seite, „Neuigkeiten“ in Fußzeile und Menü, oder `#neuigkeiten` | neue Notizen kommen von selbst, Neuerungen an der Seite stehen in `neuigkeiten.js`; ungelesen ist das Rufzeichen groß und gelb, danach klein in der Ecke |
| Dunkelmodus | ◐ oben rechts | folgt der Systemeinstellung, per Knopf umschaltbar, wird im Browser gemerkt (`osci-log-theme`) |

**Aktuelle Inhalte**
- Notizen, Rechnungen (ET1, Rechenübung 2): *Knoten- und Maschengleichungen (A2.1)* · *Gemischte Widerstandsschaltung bei Wechselstrom (A2.2)* · *Brückenschaltung (A2.3)* · *Belastetes Potentiometer (A2.4)* · *Ersatzwiderstand mit der Dreieck-Stern-Umwandlung (A2.5)* · *Kurzschlussaufgabe (A2.6)*
- Notizen, Rechnungen (ET1, Rechenübung 3): *Überlagerungsprinzip und Leistungsbilanz (A3.1)* · *Ersatzspannungsquelle (A3.2)* · *Ersatzspannungs- und Ersatzstromquelle (A3.3)* · *Ersatzspannungsquelle mit gesteuerten Quellen (A3.4)* · *Brückenschaltung zur Messwertumsetzung (A3.5)* · *Wirkungsgrad einer Spannungsquelle (A3.6)*
- Notizen, Theorie: *Von Newton bis Ohm* · *Widerstandsnetzwerke* · *Die Kirchhoffschen Gesetze* · *Stern-Dreieck-Umwandlung* · *Strom in Flüssigkeiten* · *Mittelwert, Gleichrichtwert, Effektivwert*
- Notizen, Audiotechnik: *Vom Sinus zum Sound*, ein Kurs in fünf Teilen (19 Abschnitte, 58 Checkpoints, 26 getestete Python-Programme, drei Projekte; `werkzeug.py` in `notizen/dateien/`)
- Notizen, Sonstiges: *Hallo, Labor.*
- Projekte: Messplatz · RC-Filter-Explorer · Crashtest-Labor
- Simulationen zum Einbetten: `rc`, `welle`, `teiler`, `bruecke`, `ueberlagerung`, `ersatzquelle`, `klang` und `abtastung` (die letzten beiden zum Anhören, siehe SCHREIBEN.md)

```
index.html              Startseite mit Labor-Teaser und Bio
labor/index.html        Crashtest-Labor (Lab 0)
messplatz/index.html    Messplatz (Lab 1)
404.html                Seite für falsche Links
favicon.svg             Logo (Signal formt ein N)
neuigkeiten.js          Neuerungen an der Seite für das Neuigkeiten-Fenster (neue Notizen kommen von selbst)
instagram/              Profilbild, Cover-Bilder, Story und Text für @_br1ken_ (nicht verlinkt)
notizen/
  beitraege.js          Liste der Notizen (nur Dateinamen)
  texte/*.md            die Notizen selbst  (_vorlage.md = Vorlage)
  bilder/               Bilder für Notizen
  dateien/              Dateien zum Herunterladen, z. B. werkzeug.py für die Audio-Notiz
  schreiben.html        Schreibstube
projekte/
  projekte.js           Liste der Projekte
  rc-filter/            Beispielprojekt
  _vorlage/             zum Kopieren für neue Projekte
assets/
  site.css / site.js    gemeinsames Design (Farben als Variablen, hell + dunkel), Kopf- und Fußzeile, Menü, ◐-Dunkelmodus, ⋮-Lexikon-Knopf, Links
  labor.css / labor.js  Labor: Bausteine, Sequencer, Kabelphysik, Einfach-Ansicht und freies Pult
  missionen.js          Missionen, XP, Stufen, Abzeichen
  schaltung.js          Schaltungssimulator (Knotenanalyse wie SPICE), ohne Oberfläche
  messplatz.css / .js   Messplatz: Steckbrett, Kabel, Geräte, Analyse, Versuche
  models.js             Formeln des Labors, Patch-Links
  start.js              Startseite: neueste Notizen und Projekte, alte Patch-Links ins Labor
  markdown.js           Markdown → HTML für Notizen
  beitrag.js            zeigt eine Notiz an (beitrag.html?b=…)
  notizen-liste.js      Notizen-Übersicht mit Suche und Filter
  schreiben.js          Schreibstube mit Live-Vorschau
  projekte-liste.js     Projekt-Übersicht
  projekt.js            Projektseiten: Simulationen und Formeln
  sims.js               Simulationen (rc, welle, teiler, bruecke, ueberlagerung, ersatzquelle, klang, abtastung)
  lexikon.js            Einträge des Lexikons (GROESSEN und SYNTH)
  neuigkeiten.js        Rufzeichen unten rechts und Neuigkeiten-Fenster
  notizen.css           Notizen, Simulationen, Schreibstube
  fonts/                MesloLGS Nerd Font (Web-Versionen) + LIZENZ.md
  vendor/katex/         Formelsatz
  og-bild.png           Vorschaubild für geteilte Links
  touch-icon.png        Homescreen-Icon
vorschau.command        Doppelklick = lokale Vorschau
```

## Lokal ansehen

Doppelklick auf **`vorschau.command`**. Ein Terminalfenster startet einen kleinen Server, und der Browser öffnet `http://localhost:4173`. Zum Beenden das Fenster schließen.
Beim ersten Mal blockiert macOS das eventuell: Rechtsklick → *Öffnen* → *Öffnen*.

`labor/index.html` direkt aus dem Finder zu öffnen geht auch. Notizen und Lexikon laden dann aber nicht, weil Browser das Nachladen von Dateien nur über einen Server erlauben.

## Änderungen veröffentlichen

Im Terminal:

```bash
cd "/Volumes/Brikens Festplatte/Extreme pro Backup /Priv/osci-log"
```

```bash
git add -A && git commit -m "Kurze Beschreibung" && git push
```

Etwa eine Minute später ist die Änderung live. Der Zugangs-Token liegt im macOS-Schlüsselbund (Token „osci-log Mac“, gültig bis 22.10.2027, nur für dieses Repo). Danach unter github.com → *Settings → Developer settings → Personal access tokens* einen neuen anlegen.
Dieses Repo committet als **Brick** mit der anonymen GitHub-Adresse (`git config` nur für diesen Ordner). Die TU-Einstellung für andere Projekte bleibt unberührt.

Wichtig: Die versteckte Datei **`.nojekyll`** muss im Repo bleiben. Ohne sie blendet GitHub alle Dateien aus, die mit `_` beginnen, zum Beispiel die Vorlagen.

### Wenn Design oder Code geändert wurde

Browser (vor allem auf dem iPhone) speichern CSS- und JS-Dateien bis zu 10 Minuten zwischen. Damit nach einer Änderung in `assets/` niemand eine halb alte Seite sieht, hängt an jedem Verweis eine Versionsnummer `?v=N`. Nach einer Änderung an einer Datei in `assets/` deren Nummer in allen HTML-Dateien um eins erhöhen. Stand 29.10.2026: `notizen.css` 25, `site.js` 24, `sims.js` 22, `markdown.js` und `beitrag.js` 21, `site.css` 20, alles andere 19. Zum Beispiel für `sims.js` von 22 auf 23:

```bash
grep -rl 'sims.js?v=22' --include='*.html' . | xargs sed -i '' 's/sims.js?v=22/sims.js?v=23/g'
```

Für `assets/lexikon.js` gilt stattdessen `LEX_VERSION` in `assets/site.js`. Für neue Notizen oder Projekte ist beides nicht nötig.

## Eine neue Notiz schreiben

Am einfachsten gemeinsam mit Claude: Notebook, Foto der Papiernotizen oder ein Thema schicken.
Selbst geht es so:

1. `vorschau.command` starten und `http://localhost:4173/notizen/schreiben.html` öffnen.
2. Schreiben. Rechts siehst du sofort, wie es aussieht. Der Entwurf wird automatisch im Browser gespeichert.
3. **.md herunterladen** und die Datei nach `notizen/texte/` legen.
4. In `notizen/beitraege.js` den Dateinamen ergänzen (die Schreibstube zeigt die Zeile zum Kopieren an).
5. Veröffentlichen (siehe oben).

Alle Möglichkeiten (Formeln, Merke-Kästen, Aufgaben mit Lösung, Simulationen, Lexikon-Links, Bilder) stehen in **[SCHREIBEN.md](SCHREIBEN.md)**.
Mit `entwurf: ja` im Kopf bleibt eine Notiz aus allen Listen raus. Über ihren Link ist sie trotzdem erreichbar.

## Ein neues Projekt hinzufügen

1. Ordner `projekte/_vorlage/` kopieren und umbenennen, z. B. `projekte/bandpass/`.
2. `index.html` darin anpassen, oder den Ordner komplett mit einem eigenen Projekt füllen (eigene HTML/JS-Dateien, ein exportierter Build, …).
3. In `projekte/projekte.js` oben einen Eintrag ergänzen. Die Felder sind dort erklärt.
4. In der kopierten `index.html` die Zeile `<meta name="robots" content="noindex">` löschen — die gilt nur für die Vorlage selbst.

Projekte können auch nur auf etwas anderes verlinken (z. B. ein anderes GitHub-Repo): `link: 'https://…'`.

## Persönliches

- **Links in der Fußzeile:** in `assets/site.js` ganz oben (`github: 'br1ken'` und `instagram: '_br1ken_'` sind gesetzt; `email` ist noch leer).
- **Bio und Datenblatt:** in `index.html` im Abschnitt `id="about"`.
- **Lexikon-Einträge:** in `assets/lexikon.js`, elektrische Größen in `GROESSEN`, Synth-Begriffe in `SYNTH` (optional `lab:` = welcher Labor-Baustein dazu passt). Texte dort als `R\`…\`` schreiben, damit LaTeX-Backslashes erhalten bleiben. Nach Änderungen `LEX_VERSION` in `assets/site.js` um eins erhöhen.
- **Farben:** alle in `assets/site.css` ganz oben als Variablen (`--bg`, `--fg`, `--accent` …), einmal für hell und einmal für dunkel. Neue Farben dort ergänzen statt fest in eine Regel zu schreiben.

## Das Crashtest-Labor (`labor/`)

**Missionen:** 13 kurze Aufgaben vom ersten Ton bis zum eigenen Werk — Oktave, Rechteck, Tief- und Hochpass, Tremolo, Schwebung, Melodie, Kopplung, Quinte, Echo, Verzerrer. Ziele werden live geprüft. **Jedes erreichte Ziel gibt sofort +20 XP** (aufsteigende Zahl, Ding, auf Android kurzes Vibrieren), eine geschaffte Mission +50 XP, ohne Tipp +30 XP und 3 Sterne. Dazu 5 Stufen, 6 Abzeichen, eine Tages-Serie und ein „Startaufbau“-Knopf. Geschafft heißt: Konfetti-Explosion und eine kurze Einblendung, die nach ein paar Sekunden von selbst zur nächsten Mission springt („Warum funktioniert das?“ aufklappbar). Fortschritt bleibt im Browser (`osci-log-missionen`). „Frei spielen“ blendet die Missionen aus.
Neue Mission: in `assets/missionen.js` in `MISSIONEN` ergänzen (Ziele = Text + Prüffunktion).

**Bausteine:** Oszillator, Sequencer (8 × 8-Raster in Dur- oder Moll-Pentatonik, Zufall, Tonlage, Tempo), Tiefpass (RC), Hochpass (CR), Spule (RL), Widerstand, Tremolo, Echo (Laufzeit + Rückkopplung), Verzerrer (Diodenbegrenzer, tanh), Ausgang.

**Kopplung:** Ein Sequencer kann Oszillatoren spielen — im Pult per gestricheltem Steuerkabel von OUT des Sequencers in SEQ des Oszillators, in der Einfach-Ansicht per „Gespielt von ♪︎“. Der Oszillator spielt dann die Melodie mit seiner eigenen Wellenform; sein Frequenzregler verschiebt die Tonhöhe relativ zu 220 Hz (×2 = Oktave höher, 330 Hz = Quinte darüber). Mehrere Oszillatoren an einem Sequencer = Akkorde. Ein steuernder Sequencer klingt selbst nur, wenn er zusätzlich per Audiokabel weiterführt.

**Saft:** Bausteine zucken auf jede Note, Kabel werden angezupft, das Pult leuchtet mit der Lautstärke, Stecker machen ein Geräusch. Neue Besucher starten direkt mit „Melodie · Echo“, der Play-Knopf pulsiert, bis man drückt.

**Kabel** hängen mit Schwerkraft durch und schwingen nach (Verlet-Seilsimulation). Mit „Bewegung reduzieren“ hängen sie still.


- Bis zu zwölf Bausteine, davon bis zu vier Klangquellen (Oszillator oder Sequencer).
- **Zwei Ansichten**, umschaltbar über „Einfach“ / „Frei patchen“. Die Wahl wird im Browser gemerkt.
  - **Einfach** (Standard auf Handy und Tablet): der Signalweg als senkrechte Kette mit großen Karten und großen Reglern. **÷2 / ×2** halbiert oder verdoppelt einen Wert und erklärt kurz, was das bewirkt. „+ Baustein einfügen“ zwischen den Karten, „+ Weiterer Ton“ für Akkorde und Schwebungen. Die Play-Leiste mit Mini-Oszilloskop bleibt beim Scrollen oben.
  - **Frei patchen** (Standard am Computer): Pult mit frei verschiebbaren Bausteinen und Kabeln. Ein verzweigter Patch lässt sich in der einfachen Ansicht per Knopf wieder als Kette ordnen.
- **Verbinden (freies Pult):** vom OUT-Punkt ein Kabel auf einen anderen Baustein ziehen, oder OUT antippen und dann das Ziel. Geht auch rückwärts von IN.
- **Trennen:** das × in der Mitte eines Kabels. **Entfernen:** das × oben rechts an einem Baustein.
- **?** an jedem Baustein (Pult, Kette, Einstellungen) und „? Lexikon“ in der Werkzeugleiste öffnen den passenden Eintrag im Synth-Lexikon. Nach einer geschafften Mission führt „Mehr im Lexikon“ zum Hintergrund.
- **↶ Zurück / ↷ Vor** (auch ⌘Z / ⇧⌘Z), **Aufräumen** ordnet nach Signalfluss, **Teilen** erzeugt einen Link mit genau diesem Patch.
- **Zoom** unten rechts, „Alles zeigen“ passt den Patch ein.
- Entf/Backspace auf einem Baustein-Kopf entfernt ihn, Pfeiltasten verschieben ihn (Shift = größere Schritte).
- Patch, Werte und Positionen bleiben lokal im Browser gespeichert. Ton startet erst auf Knopfdruck und stoppt, wenn der Tab verlassen wird.
- Frequenz, Widerstand, Tremolo und Pegel ändern sich beim Regler-Ziehen ohne Knacksen; C und L bauen den Klang kurz neu auf.
- Auf iPhones mit aktuellem iOS soll der Ton auch im Lautlos-Modus spielen (`navigator.audioSession`); zusätzlich erscheint ein Hinweis zum Lautlos-Schalter.

### Was die Modelle bedeuten

Die Kabel sind gerichtete Audiosignale. Jeder Baustein ist ein idealisiertes, gepuffertes Modul. Das ist kein Solver für beliebige elektrische Netze, und die Last eines Moduls wirkt nicht auf andere zurück.

- R: Uaus/Uein = Rlast / (Rserie + Rlast) mit fester Last 10 kΩ.
- RC: Ausgang über C; fc = 1/(2πRC), τ = RC.
- RL: Ausgang über R; fc = R/(2πL), τ = L/R.
- RC und RL sind digitale Tiefpässe erster Ordnung (bilineare Transformation mit Vorverzerrung), Grenzfrequenz auf 45 % der Abtastrate begrenzt. Angezeigte Werte stammen aus den idealen analogen Formeln.
- Mehrere Signale an einem Eingang werden summiert. Der Ausgang gleicht die Zahl der Quellen aus und begrenzt Spitzen.

Die Brücken-Simulation (`bruecke`) rechnet dagegen exakt über die Ersatzspannungsquelle — mit denselben Formeln wie das Jupyter-Notebook zur Rechenübung.

### Grundlagenquellen

- [Widerstand / MathWorks](https://www.mathworks.com/help/simscape/ref/resistor.html)
- [Kondensator / MathWorks](https://www.mathworks.com/help/simscape/ref/capacitor.html)
- [Spule / MathWorks](https://www.mathworks.com/help/simscape/ref/inductor.html)
- [Passive components and circuits / TI Precision Labs](https://www.ti.com/content/dam/videos/external-videos/en-us/4/3816841626001/6119035031001.mp4/subassets/passive_components_and_circuits_2.pdf)

## Der Messplatz (`messplatz/`)

Ein Elektroniklabor auf TU-Niveau, gedacht zum Vorbereiten von Laborübungen und zum Nachrechnen im Labor. Bauteile kommen als Steckbausteine aufs Brett, verbunden wird mit Laborkabeln (4-mm-Buchsen, rot/schwarz, Kanalfarben). Die Geräte stehen im Regal darunter, ihre Buchsen als Anschlussfelder auf dem Brett.

- **Bauteile:** Widerstand, Kondensator, Elko (gepolt), Spule, Potentiometer, Schalter, Diode 1N4148, LED, Z-Diode 5,1 V, NPN BC547, PNP BC557, MOSFET 2N7000 (mit Bodydiode), OPV, Trenntrafo (Übersetzung einstellbar), ideale Spannungs- und Stromquelle, Masse. Jedes Teil hat einen festen Bezeichner (R1, C2, T1 …). Werte in E12-Schritten oder als Text (`4k7`, `100n`, `2.2u`), drehen mit ⟳ oder Taste R. Der Inspektor zeigt Spannung, Strom, Leistung und bei Transistoren den Arbeitsbereich.
- **Geräte:** Funktionsgenerator (Sinus, Rechteck, Dreieck, Säge, 0,1 Hz bis 1 MHz, Offset, Tastgrad, 50 Ω, Anzeige für Leerlauf oder 50-Ω-Last), Oszilloskop (2 Kanäle, Tastkopf ×1 = 1 MΩ ∥ 100 pF oder ×10 = 10 MΩ ∥ 12 pF, DC/AC/GND, INV, Math CH1 ± CH2, Zeit- und Spannungscursor, Trigger links oder in der Mitte, Auto/Normal/Single, XY, Autoset, Messwerte mit Phase und Anstiegszeit, Export als CSV und PNG), zwei Multimeter (V⎓, V~ als Echt-Effektivwert, A⎓, A~, Ω mit automatischem Bereich, Diodentest, 400-mA-Sicherung), Netzgerät (0–30 V, Strombegrenzung, CV/CC).
- **Analyse:** Frequenzgang als Bode-Diagramm (Kleinsignalanalyse wie SPICE .AC, U(CH2)/U(CH1) inklusive Tastkopf, −3-dB-Punkte, Resonanz und Güte, Steigung, Vergleichskurve, CSV); Arbeitspunkt wie .OP (alle Knotenpotentiale und Bauteilwerte, Bereich jedes Transistors); Messreihe (Punkte von Oszi und Multimetern notieren, als CSV speichern, im Bode-Diagramm gegen die Rechnung legen).
- **Physik wie im Labor:** Generator- und Oszilloskop-Masse liegen auf Schutzleiter, Netzgerät, Multimeter und die Trafo-Sekundärseite sind potentialfrei. Überlastete Bauteile werden heiß und brennen durch; „Ersetzen“ im Inspektor repariert sie.
- **Versuche (16):** Messen belastet, Tastkopf ×1 oder ×10, RC-Sprungantwort, Tiefpass (Betrag und Phase), Reihenschwingkreis, Gleichrichter mit Glättung, Brückengleichrichter mit Trafo, Diodenkennlinie im XY-Betrieb, Z-Diode, Transistor als Schalter, Emitterschaltung, MOSFET schaltet eine Spule, invertierender Verstärker, OPV-Integrator, Schmitt-Trigger, aktiver Tiefpass 2. Ordnung (Sallen-Key). Jeder mit Aufgaben und aufklappbarer Theorie; die Zahlen in den Texten sind gegen die Simulation geprüft.
- **Speichern:** Der aktuelle Aufbau bleibt im Browser (`osci-log-messplatz-v1`). Unter „Datei“: benannte Aufbauten speichern (`osci-log-messplatz-aufbauten`), als JSON-Datei speichern und öffnen, SPICE-Netzliste (.cir) für LTspice oder ngspice exportieren. „↗ Teilen“ erzeugt einen Link mit Aufbau und Geräteeinstellungen. Tempo: Pause, 1 %, 10 %, Echtzeit, 10×, so schnell es geht.
- **Rechenkern** (`assets/schaltung.js`): modifizierte Knotenanalyse, BDF2-Zeitschritte mit Schrittteilung bei schwieriger Konvergenz, Newton-Raphson mit SPICE-Spannungsbegrenzung; Modelle nach Shockley (mit Durchbruch), Ebers-Moll, MOSFET Level 1, gekoppelte Spulen, OPV mit Verstärkungs-Bandbreite-Produkt und Sättigung; Arbeitspunkt (.OP) mit Quellen-Hochrampen und Kleinsignalanalyse (.AC). Schwebende Teilschaltungen bekommen automatisch einen stromlosen Bezugspunkt.
- **Gegen die Theorie geprüft:** RC-Tiefpass −3 dB bei 1591,6 Hz und −45,00° (Theorie 1591,5 Hz); Schwingkreis f₀ = 5033,6 Hz, Q = 31,63 bzw. 5,271 (31,62 bzw. 5,270); OPV-Grenzfrequenz 90,8 kHz (f_T/11 = 90,9 kHz); Emitterschaltung I_C = 1,40 mA und v = 253 (−g_m R_C = 253); Tastkopf ×1: 2/3 und t_r = 73,2 µs (73,2 µs); Diode bei 10 mA 0,689 V (Shockley 0,688 V); Messfehler 4,7619 V (4,7619 V).

## Verlauf (Oktober 2026)

**Grundumbau**
- Labor: Kabel ziehen statt zweimal klicken, Trennen per ×, Rückgängig/Wiederholen, Aufräumen, Patch-Links, Wellenform-Schalter, Starter-Patch „Schwebung“, stillstehendes Oszilloskop, Regler ohne Knacksen.
- Behoben: überlappende neue Bausteine, Handy zeigte nur einen Baustein, Tastaturfokus ging verloren.
- Neu: Notizen mit Suche, Filter, KaTeX-Formeln, Kästen, Aufgaben und Simulationen; Schreibstube; Projektbereich; Vorschaubild, Homescreen-Icon, 404-Seite.

**Veröffentlichung**
- Online auf GitHub Pages unter br1ken.github.io, Vorschaubild mit voller Adresse.

**Handy**
- Einfache Ketten-Ansicht mit großen Reglern, ÷2/×2 und mitlaufender Play-Leiste.
- iPhone: Versionsnummern gegen alte Dateien im Cache, ▶ und ↗ nicht mehr als Emoji.

**Labor 2.0**
- Labor auf eigene Seite `labor/` verschoben, Startseite mit animiertem Teaser.
- Missionen mit XP pro Ziel, Stufen, Sternen, Abzeichen und Tages-Serie; Sequencer, der auch Oszillatoren spielen kann; Echo, Verzerrer, Hochpass; baumelnde Kabel, die im Beat zucken.
- Alte Patch-Links (`/#patch=…`) leiten automatisch ins Labor um.
- Synth-Lexikon (29 Einträge) neben dem Elektro-Lexikon, erreichbar über ⋮ und über „?“ an jedem Baustein; × zum Entfernen direkt am Baustein.
- Dunkelmodus für alle Seiten (System oder ◐-Knopf), ohne Aufblitzen beim Laden.
- Behoben: das × auf schwingenden Kabeln ließ sich nicht treffen (die Knöpfe wurden in jedem Bild neu gebaut).
- Notiz *Von Newton bis Ohm*: acht Schritte von Kraft und Arbeit über Ladung, Feld, Potential, Spannung und Strom bis zum Drude-Modell, mit SVG-Diagrammen und Feynman-Momenten.
- Lexikon: lange Formeln auf mehrere Zeilen verteilt, zu breite Formelzeichen werden verkleinert statt abgeschnitten; Formeln passen auf dem Handy ohne Seitwärtsscrollen.
- Messplatz (Lab 1): eigener Schaltungssimulator, Steckbrett mit Laborkabeln, Funktionsgenerator, Oszilloskop, Multimeter, Netzgerät, neun Versuche; sieben neue Lexikon-Einträge zu Bauelementen und Messgeräten.
- Behoben: 13 Farbvariablen im hellen Modus verwiesen auf sich selbst (z. B. waren Kabel im freien Pult unsichtbar).
- Fachlicher Check aller Notizen, Lexikon-Einträge, Labor-Texte und Missionen: präzisere Formulierungen (Impedanz vs. Blindwiderstand, technische Stromrichtung, Ladungsquantelung, Echo bei g = 1, antiparallele Dioden u. a.), Rechenfehler in der Teiler-Simulation („% mehr“) behoben, breite Formeln der Brückenschaltung mehrzeilig.
- Lautstärke: Belohnungs-Töne laufen über den Pegel (waren vorher am Pegel vorbei und viel zu laut), Wellenformen, Verzerrer und Echo-Rückkopplung gleichen sich aus; jede Mission startet mit eigener Sequencer-Melodie statt Dauerton.
- Messplatz als Werkzeug fürs Labor: MOSFET, Trenntrafo, ideale Quellen, zweites Multimeter, Tastkopf ×1/×10 mit Eingangskapazität, INV, Math-Kanal, Cursor, Anstiegszeit, Bode-Diagramm, Arbeitspunkt, Messreihe, benannte Aufbauten, JSON- und SPICE-Export, Tempo-Regler, feste Bezeichner (R1, C1 …); sieben neue Versuche (16 insgesamt), sechs neue Lexikon-Einträge (MOSFET, Transformator, ideale Quellen, Arbeitspunkt, Tastkopf, Bode-Diagramm).
- Behoben im Messplatz: Autoset setzte Triggermodus, Lauf und XY nicht zurück (ein Kommentar hatte den Code verschluckt); der Bezugspunkt für schwebende Teilschaltungen konnte in Sonderfällen einen Generator- oder OPV-Ausgang mit 1 kΩ belasten; die „?“-Knöpfe waren ungestylt; Beschriftungen lagen bei Transistoren und Poti auf einer Buchse.
- Behoben im Messplatz: Falsch gesteckte OPV-Schaltungen (z. B. Ausgang nur noch an Kondensator oder Messbuchsen) trieben den Löser in endlose Fehlschläge — mit Spannungen bis 10¹⁰ V, „verbrannten“ Bauteilen und einer ruckelnden Seite. Jetzt: OPV-Ausgang und Innenzustand pro Newton-Schritt begrenzt, Klemmdioden gegen ±15 V, Startwerte nach dem Umstecken je Buchse statt 0 V, nie mehr unfertige Ergebnisse übernehmen, Stillstand-Erkennung mit Hinweis, frische Messgeräte beim Laden eines Versuchs. Geprüft mit rund 800 zufälligen Fehlverkabelungen in sieben Versuchen.
- Aufräumen: Versionsnummern der Assets waren über drei Stände verteilt (16/17/18), jetzt überall `?v=19`; README-Inhalte nachgezogen (alle fünf Rechnungen, Instagram, `instagram/`-Ordner); Platzhalter-Projekt „Schaltungen zum Anfassen" entfernt, das ist der Messplatz; die Vorlage zeigte in der Schreibstube ein kaputtes Bild, jetzt ein Beispiel-SVG.
- Notiz *Überlagerungsprinzip und Leistungsbilanz* (A3.1): beide Teilschaltungen mit Maschentabelle, warum Überlagerung gilt (am Gleichungssystem dieser Schaltung), Potentialbild „pro Coulomb“, warum die Spannungsquelle geladen wird, warum man Leistungen nicht überlagern darf (Kreuzterm), vorbereiteter Messplatz-Aufbau, drei Aufgaben mit Lösung. Neue Simulation `ueberlagerung` mit Umschalter (a)/(b)/beide und Leistungsbilanz; Lexikon: Überlagerungsprinzip und Zählpfeilsysteme.
- Notizen: Ein Satzzeichen direkt nach einer kurzen Formel rutscht nicht mehr allein an den Zeilenanfang; Simulationen mit breiten Tabellen machen die Seite auf dem Handy nicht mehr breiter.
- Notiz *Ersatzspannungsquelle* (A3.2): kompakt wie in der Übung gerechnet, Leerlauf, Kurzschluss, beliebige Last und null gesetzte Quellen, jeder Schritt mit einem Bild aus Original und Ersatzquelle.
- Notizen A3.3 *Ersatzspannungs- und Ersatzstromquelle* (Thévenin und Norton mit Knotengleichungen wie in der Übung, jeder Umformungsschritt ausgeschrieben, Bilder für deaktivierte Quellen, Leerlauf, Kurzschluss und die drei Maschen) und A2.6 *Kurzschlussaufgabe* (Knoten einfärben, drei Situationen an denselben Klemmen); Theorie-Notizen *Strom in Flüssigkeiten* (Elektrolyse, Faraday) und *Mittelwert, Gleichrichtwert, Effektivwert*.
- Notizen: Formeln in Überschriften stehen im Inhaltsverzeichnis richtig; lange Formeln bleiben einzeilig und werden am Handy auf höchstens 70 % verkleinert; Farbklassen `n0`–`n2` und `t0`–`t2` für eingefärbte Knoten in Schaltbildern.
- Neuigkeiten: Rufzeichen unten rechts auf jeder Seite mit Fenster für neue Notizen und Neuerungen (`neuigkeiten.js`).
- Lexikon: neun neue Einträge (Stromteiler, Stern-Dreieck-Umwandlung, Ersatzstromquelle, Knotenpotentialverfahren mit Millman, Knoten einfärben, Leerlauf und Kurzschluss, Mittelwert, Gleichrichtwert, Faradaysche Gesetze); Einträge verlinken unter „In den Notizen“ auf die passenden Notizen (Feld `notiz`).
- Notiz *Vom Sinus zum Sound*: Kurs in fünf Teilen von Schall, Sinus und Dezibel über Obertöne, Modulation, Abtasten, Bits, komplexe Zeiger und FFT bis zu Filter, Biquad, Faltung und Hall, dazu die Projekte Karplus-Strong, Stimmgerät und Mini-Synthesizer. 26 getestete Python-Programme, 14 SVG-Diagramme, Formelsammlung und Aufgaben zu jedem Teil. Checkpoints (`- [ ]`) lassen sich in jeder Notiz abhaken, der Stand bleibt im Browser (`osci-log-haken`) und steht im Kopf der Notiz. Neue Simulationen `klang` (Obertöne) und `abtastung` (Aliasing), beide mit Ton über Web Audio (ein gemeinsamer AudioContext, immer nur eine Quelle, stoppt beim Verlassen des Tabs). Codeblöcke haben einen Knopf „Kopieren“, Tabellen trennen am Handy Wörter statt seitlich zu scrollen. 16 Synth-Lexikon-Einträge verlinken auf die passenden Abschnitte. Das Inhaltsverzeichnis scrollt bei langen Notizen selbst.
- Notizen A3.4 *Ersatzspannungsquelle mit gesteuerten Quellen* (Leerlauf und Kurzschluss statt Abschalten, Probe mit Testquelle), A3.5 *Brückenschaltung zur Messwertumsetzung* (Thévenin, Stromteiler auf zwei Wegen, Potentiale, Spannungsteiler) und A3.6 *Wirkungsgrad einer Spannungsquelle* (η über R<sub>a</sub>/R<sub>i</sub> mit Graph). Alle Zwischenschritte mit Zufallswerten gegen eine direkte Netzwerkrechnung geprüft. Schaltbilder mit farbigen Zählpfeilen (Klassen `pu`/`pi`), neuer Lexikon-Eintrag *Gesteuerte Quelle*.
- Neues Erscheinungsbild: Schrift überall Meslo LG; Farben aus der Elektronik (Lötstopplack Ultramarin, Kupfer Mennige, Bestückungsdruck Kreide, Oszilloskop Tinte); Logo als Lissajous-Figur. Startseite als geroutete Leiterplatte mit Tastkopf und Oszilloskop (`assets/platine.js`, Beispielsignale), Karten als ICs, Titelbilder als XY-Oszillogramme, Netzlabels und Vias an den Abschnitten. Formen stehen in `assets/design.css`, das auf jeder Seite zuletzt lädt.

**Inhalte**
- Notiz Brückenschaltung (A2.3) mit Simulation `bruecke`: Schaltplan, Potentialskala, Zweig-Tabelle mit Leistungsbilanz, Lastleistungs-Kurve.
- Lexikon der elektrischen Größen hinter ⋮, verlinkbar aus Notizen mit `[[Begriff]]`.
- Bio „Hinter dem Signal.“ mit Datenblatt; Name Brick.
- Schrift: MesloLGS Nerd Font für Text und Überschriften.
- Korrekturen: Formeln in Lexikon-Texten, Formelkästen, Brücken-Seitenleiste, echte Tiefstellungen statt R_L.
