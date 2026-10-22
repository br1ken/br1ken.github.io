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
| Notizen | `notizen/` | Blog für Gelerntes aus dem Studium, mit Suche und Themenfilter |
| Eine Notiz | `notizen/beitrag.html?b=name` | wird aus `notizen/texte/name.md` erzeugt |
| Schreibstube | `notizen/schreiben.html` | Editor mit Live-Vorschau für neue Notizen (nicht verlinkt) |
| Projekte | `projekte/` | Simulationen, Schaltungen, Code |
| Lexikon | ⋮ oben rechts auf jeder Seite, „?“ an jedem Baustein im Labor, oder `#lexikon` / `#lexikon-spannung` / `#lexikon-synth` an der Adresse | zwei Teile: **Elektro** (30 Größen und Gesetze: formal, physikalisch, SI-Einheit) und **Synth** (29 Bausteine und Begriffe eines Synthesizers, mit Verweis auf den passenden Labor-Baustein) |
| Dunkelmodus | ◐ oben rechts | folgt der Systemeinstellung, per Knopf umschaltbar, wird im Browser gemerkt (`osci-log-theme`) |

**Aktuelle Inhalte**
- Notizen: *Hallo, Labor.* · *Der Spannungsteiler* · *Warum doppeltes C die Grenzfrequenz halbiert* · *Brückenschaltung (ET1, Rechenübung 2, A2.3)*
- Projekte: RC-Filter-Explorer · Crashtest-Labor · *Schaltungen zum Anfassen* (geplant)
- Simulationen zum Einbetten: `rc`, `welle`, `teiler`, `bruecke` (siehe SCHREIBEN.md)

```
index.html              Startseite mit Labor-Teaser und Bio
labor/index.html        Crashtest-Labor (Lab 0)
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
  site.css / site.js    gemeinsames Design (Farben als Variablen, hell + dunkel), Kopf- und Fußzeile, Menü, ◐-Dunkelmodus, ⋮-Lexikon-Knopf, Links
  labor.css / labor.js  Labor: Bausteine, Sequencer, Kabelphysik, Einfach-Ansicht und freies Pult
  missionen.js          Missionen, XP, Stufen, Abzeichen
  models.js             Formeln des Labors, Patch-Links
  markdown.js           Markdown → HTML für Notizen
  sims.js               Simulationen (rc, welle, teiler, bruecke)
  lexikon.js            Einträge des Lexikons (GROESSEN und SYNTH)
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

Browser (vor allem auf dem iPhone) speichern CSS- und JS-Dateien bis zu 10 Minuten zwischen. Damit nach einer Änderung in `assets/` niemand eine halb alte Seite sieht, hängt an jedem Verweis eine Versionsnummer (aktuell `?v=11`). Nach Änderungen in `assets/` diese Zahl in allen HTML-Dateien um eins erhöhen, zum Beispiel von 11 auf 12:

```bash
grep -rl '?v=11"' --include='*.html' . | xargs sed -i '' 's/?v=11"/?v=12"/g'
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

**Inhalte**
- Notiz Brückenschaltung (A2.3) mit Simulation `bruecke`: Schaltplan, Potentialskala, Zweig-Tabelle mit Leistungsbilanz, Lastleistungs-Kurve.
- Lexikon der elektrischen Größen hinter ⋮, verlinkbar aus Notizen mit `[[Begriff]]`.
- Bio „Hinter dem Signal.“ mit Datenblatt; Name Brick.
- Schrift: MesloLGS Nerd Font für Text, Helvetica für Überschriften.
- Korrekturen: Formeln in Lexikon-Texten, Formelkästen, Brücken-Seitenleiste, echte Tiefstellungen statt R_L.
