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
| Startseite + Klanglabor | `index.html` | Hero, interaktives Klanglabor, neueste Notizen und Projekte, „Hinter dem Signal.“ (Bio mit Datenblatt) |
| Notizen | `notizen/` | Blog für Gelerntes aus dem Studium, mit Suche und Themenfilter |
| Eine Notiz | `notizen/beitrag.html?b=name` | wird aus `notizen/texte/name.md` erzeugt |
| Schreibstube | `notizen/schreiben.html` | Editor mit Live-Vorschau für neue Notizen (nicht verlinkt) |
| Projekte | `projekte/` | Simulationen, Schaltungen, Code |
| Lexikon | ⋮ oben rechts auf jeder Seite, oder `#lexikon` / `#lexikon-spannung` an der Adresse | 30 elektrische Größen und Gesetze: formal, physikalisch, SI-Einheit |

**Aktuelle Inhalte**
- Notizen: *Hallo, Labor.* · *Der Spannungsteiler* · *Warum doppeltes C die Grenzfrequenz halbiert* · *Brückenschaltung (ET1, Rechenübung 2, A2.3)*
- Projekte: RC-Filter-Explorer · Klang-Playground · *Schaltungen zum Anfassen* (geplant)
- Simulationen zum Einbetten: `rc`, `welle`, `teiler`, `bruecke` (siehe SCHREIBEN.md)

```
index.html              Startseite mit Labor und Bio
404.html                Seite für falsche Links
notizen/
  beitraege.js          Liste der Notizen (nur Dateinamen)
  texte/*.md            die Notizen selbst  (_vorlage.md = Vorlage)
  bilder/               Bilder für Notizen
  schreiben.html        Schreibstube
projekte/
  projekte.js           Liste der Projekte
  rc-filter/            Beispielprojekt
  _vorlage/             zum Kopieren für neue Projekte
assets/
  site.css / site.js    gemeinsames Design, Kopf- und Fußzeile, Menü, ⋮-Lexikon-Knopf, Links (Instagram/GitHub)
  labor.css / labor.js  Klanglabor (Einfach-Ansicht und freies Pult)
  models.js             Formeln des Labors, Patch-Links
  markdown.js           Markdown → HTML für Notizen
  sims.js               Simulationen (rc, welle, teiler, bruecke)
  lexikon.js            Einträge des Lexikons
  notizen.css           Notizen, Simulationen, Schreibstube
  fonts/                MesloLGS Nerd Font (Web-Versionen) + LIZENZ.md
  vendor/katex/         Formelsatz
  og-bild.png           Vorschaubild für geteilte Links
vorschau.command        Doppelklick = lokale Vorschau
```

## Lokal ansehen

Doppelklick auf **`vorschau.command`**. Ein Terminalfenster startet einen kleinen Server, und der Browser öffnet `http://localhost:4173`. Zum Beenden das Fenster schließen.
Beim ersten Mal blockiert macOS das eventuell: Rechtsklick → *Öffnen* → *Öffnen*.

`index.html` direkt aus dem Finder zu öffnen geht für das Labor auch. Notizen und Lexikon laden dann aber nicht, weil Browser das Nachladen von Dateien nur über einen Server erlauben.

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

Browser (vor allem auf dem iPhone) speichern CSS- und JS-Dateien bis zu 10 Minuten zwischen. Damit nach einer Änderung in `assets/` niemand eine halb alte Seite sieht, hängt an jedem Verweis eine Versionsnummer (aktuell `?v=8`). Nach Änderungen in `assets/` diese Zahl in allen HTML-Dateien um eins erhöhen, zum Beispiel von 8 auf 9:

```bash
grep -rl '?v=8"' --include='*.html' . | xargs sed -i '' 's/?v=8"/?v=9"/g'
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

Projekte können auch nur auf etwas anderes verlinken (z. B. ein anderes GitHub-Repo): `link: 'https://…'`.

## Persönliches

- **Links in der Fußzeile:** in `assets/site.js` ganz oben (`github: 'br1ken'` ist gesetzt; `instagram` und `email` sind noch leer).
- **Bio und Datenblatt:** in `index.html` im Abschnitt `id="about"`.
- **Lexikon-Einträge:** in `assets/lexikon.js`. Texte dort als `R\`…\`` schreiben, damit LaTeX-Backslashes erhalten bleiben.

## Das Klanglabor

- Bis zu zwölf Bausteine, davon bis zu vier Oszillatoren: Oszillator (Sinus, Dreieck, Sägezahn, Rechteck), Widerstand, Kondensator, Spule, Tremolo, Ausgang.
- **Zwei Ansichten**, umschaltbar über „Einfach“ / „Frei patchen“. Die Wahl wird im Browser gemerkt.
  - **Einfach** (Standard auf Handy und Tablet): der Signalweg als senkrechte Kette mit großen Karten und großen Reglern. **÷2 / ×2** halbiert oder verdoppelt einen Wert und erklärt kurz, was das bewirkt. „+ Baustein einfügen“ zwischen den Karten, „+ Weiterer Ton“ für Akkorde und Schwebungen. Die Play-Leiste mit Mini-Oszilloskop bleibt beim Scrollen oben.
  - **Frei patchen** (Standard am Computer): Pult mit frei verschiebbaren Bausteinen und Kabeln. Ein verzweigter Patch lässt sich in der einfachen Ansicht per Knopf wieder als Kette ordnen.
- **Verbinden (freies Pult):** vom OUT-Punkt ein Kabel auf einen anderen Baustein ziehen, oder OUT antippen und dann das Ziel. Geht auch rückwärts von IN.
- **Trennen:** das × in der Mitte eines Kabels.
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

**Inhalte**
- Notiz Brückenschaltung (A2.3) mit Simulation `bruecke`: Schaltplan, Potentialskala, Zweig-Tabelle mit Leistungsbilanz, Lastleistungs-Kurve.
- Lexikon der elektrischen Größen hinter ⋮, verlinkbar aus Notizen mit `[[Begriff]]`.
- Bio „Hinter dem Signal.“ mit Datenblatt; Name Brick.
- Schrift: MesloLGS Nerd Font für Text, Helvetica für Überschriften.
- Korrekturen: Formeln in Lexikon-Texten, Formelkästen, Brücken-Seitenleiste, echte Tiefstellungen statt R_L.
