# osci//log

Brikens persönliches Labor für Schaltungen, Klang und Notizen aus dem E-Technik-Studium.
Reine HTML/CSS/JS-Seite: kein Build, keine Installation. Läuft direkt auf GitHub Pages.

## Was drin ist

| Bereich | Adresse | Was es ist |
|---|---|---|
| Startseite + Klanglabor | `index.html` | Hero, interaktives Patch-Pult, neueste Notizen und Projekte |
| Notizen | `notizen/` | Blog für Gelerntes aus dem Studium (Markdown, Formeln, Simulationen) |
| Eine Notiz | `notizen/beitrag.html?b=name` | wird aus `notizen/texte/name.md` erzeugt |
| Schreibstube | `notizen/schreiben.html` | Editor mit Live-Vorschau zum Schreiben neuer Notizen (nicht verlinkt) |
| Projekte | `projekte/` | Übersicht über alles, was du hochlädst |

```
index.html            Startseite mit Labor
404.html              Seite für falsche Links
notizen/
  beitraege.js        Liste der Notizen (nur Dateinamen)
  texte/*.md          die Notizen selbst  (_vorlage.md = Vorlage)
  bilder/             Bilder für Notizen
  schreiben.html      Schreibstube
projekte/
  projekte.js         Liste der Projekte
  rc-filter/          Beispielprojekt
  _vorlage/           zum Kopieren für neue Projekte
assets/               Design, Skripte, KaTeX (Formeln), Vorschaubild
vorschau.command      Doppelklick = lokale Vorschau
```

## Lokal ansehen

Doppelklick auf **`vorschau.command`**. Ein Terminalfenster startet einen kleinen Server, und der Browser öffnet `http://localhost:4173`. Zum Beenden das Fenster schließen.
Beim ersten Mal blockiert macOS das eventuell: Rechtsklick → *Öffnen* → *Öffnen*.

`index.html` direkt aus dem Finder zu öffnen geht für das Labor auch. Notizen laden dann aber nicht: Browser erlauben das Nachladen von `.md`-Dateien nur über einen Server.

## Eine neue Notiz schreiben

1. `vorschau.command` starten und `http://localhost:4173/notizen/schreiben.html` öffnen.
2. Schreiben. Rechts siehst du sofort, wie es aussieht. Der Entwurf wird automatisch im Browser gespeichert.
3. **.md herunterladen** und die Datei nach `notizen/texte/` legen.
4. In `notizen/beitraege.js` den Dateinamen ergänzen (die Schreibstube zeigt die Zeile zum Kopieren an).
5. Hochladen (siehe unten). Fertig.

Alle Möglichkeiten (Formeln, Merke-Kästen, Aufgaben mit Lösung, Simulationen, Bilder) stehen in **[SCHREIBEN.md](SCHREIBEN.md)**.
Mit `entwurf: ja` im Kopf bleibt eine Notiz aus allen Listen raus. Über ihren Link ist sie trotzdem erreichbar, damit du sie online testen kannst.

## Ein neues Projekt hinzufügen

1. Ordner `projekte/_vorlage/` kopieren und umbenennen, z. B. `projekte/bandpass/`.
2. `index.html` darin anpassen (oder den Ordner komplett mit einem eigenen Projekt füllen: eigene HTML/JS-Dateien, ein exportierter Build, …).
3. In `projekte/projekte.js` oben einen Eintrag ergänzen. Die Felder sind dort erklärt.

Projekte können auch nur auf etwas anderes verlinken (z. B. ein anderes GitHub-Repo): `link: 'https://…'`.

## Persönliche Links

In `assets/site.js` ganz oben `instagram`, `github` und `email` eintragen. Sie erscheinen dann in der Fußzeile jeder Seite.

## Auf GitHub Pages veröffentlichen

Am einfachsten mit **GitHub Desktop** (https://desktop.github.com), ganz ohne Terminal:

1. Bei GitHub ein Konto anlegen bzw. einloggen.
2. In GitHub Desktop: *File → Add Local Repository* → diesen Ordner wählen. Er ist schon ein Git-Repository mit allen Dateien.
3. *Publish repository*. Als Namen **`<dein-github-name>.github.io`** nehmen. Dann ist die Seite später direkt unter `https://<dein-github-name>.github.io` erreichbar. Das ist die kürzeste Adresse für die Instagram-Bio.
   Dabei das Häkchen bei „Keep this code private“ **entfernen** (GitHub Pages braucht bei kostenlosen Konten ein öffentliches Repo).
4. Auf github.com im Repo: *Settings → Pages → Build and deployment*: Source **Deploy from a branch**, Branch **main**, Ordner **/ (root)** → *Save*.
5. Nach ein bis zwei Minuten ist die Seite online. Die Adresse in die Instagram-Bio eintragen.

Danach gilt für jede Änderung: in GitHub Desktop eine kurze Beschreibung eintragen → **Commit to main** → **Push origin**. Etwa eine Minute später ist sie live.

Wichtig: Die versteckte Datei **`.nojekyll`** muss mit hochgeladen werden (GitHub Desktop macht das automatisch). Ohne sie blendet GitHub alle Dateien aus, die mit `_` beginnen, zum Beispiel die Vorlagen.

Falls du stattdessen ein Repo mit anderem Namen nimmst (Adresse `…github.io/repo-name/`): Alles funktioniert, nur in `404.html` den Link auf `/repo-name/` ändern.

**Vorschaubild für geteilte Links (WhatsApp, iMessage, …):** Wenn die Adresse feststeht, in `index.html` bei `og:image` die volle Adresse eintragen, z. B. `https://<name>.github.io/assets/og-bild.png`. Manche Apps zeigen das Bild nur mit voller Adresse an.

## Das Klanglabor

- Bis zu zwölf Bausteine, davon bis zu vier Oszillatoren. Oszillator (Sinus, Dreieck, Sägezahn, Rechteck), Widerstand, Kondensator, Spule, Tremolo, Ausgang.
- **Zwei Ansichten**, umschaltbar über „Einfach“ / „Frei patchen“. Die Wahl wird im Browser gemerkt.
  - **Einfach** (Standard auf Handy und Tablet): Der Signalweg als senkrechte Kette mit großen Karten und großen Reglern. Mit **÷2 / ×2** verdoppelst oder halbierst du einen Wert und bekommst sofort erklärt, was das bewirkt. „+ Baustein einfügen“ zwischen den Karten, „+ Weiterer Ton“ für Akkorde und Schwebungen. Die Play-Leiste mit Mini-Oszilloskop bleibt beim Scrollen oben.
  - **Frei patchen** (Standard am Computer): das Pult mit frei verschiebbaren Bausteinen und Kabeln. Ein dort verzweigter Patch lässt sich in der einfachen Ansicht per Knopf wieder als Kette ordnen.
- **Verbinden (freies Pult):** vom OUT-Punkt eines Bausteins ein Kabel auf einen anderen Baustein ziehen. Alternativ OUT antippen und dann den Ziel-Baustein antippen. Das geht auch rückwärts: von IN ziehen.
- **Trennen:** das × in der Mitte eines Kabels.
- **↶ Zurück / ↷ Vor** (auch ⌘Z / ⇧⌘Z), **Aufräumen** ordnet nach Signalfluss, **Teilen** erzeugt einen Link mit genau diesem Patch.
- **Zoom** unten rechts, „Alles zeigen“ passt den Patch ein. Auf dem Handy startet das Labor automatisch eingepasst.
- Entf/Backspace auf einem Baustein-Kopf entfernt ihn. Pfeiltasten verschieben ihn, Shift macht größere Schritte.
- Patch, Werte und Positionen bleiben lokal im Browser gespeichert. Ton startet erst auf Knopfdruck und stoppt, wenn der Tab verlassen wird.
- Frequenz, Widerstand, Tremolo und Pegel ändern sich beim Regler-Ziehen ohne Knacksen. C und L bauen den Klang kurz neu auf.
- Auf iPhones mit aktuellem iOS soll der Ton auch bei eingeschaltetem Lautlos-Schalter spielen (`navigator.audioSession`). Auf Touch-Geräten erscheint zusätzlich ein Hinweis zum Lautlos-Schalter. Auf echten Geräten ist das noch nicht getestet.

### Was die Modelle bedeuten

Die Kabel sind gerichtete Audiosignale. Jeder Baustein ist ein idealisiertes, gepuffertes Modul. Das ist kein Solver für beliebige elektrische Netze, und die Last eines Moduls wirkt nicht auf andere zurück.

- R: Uaus/Uein = Rlast / (Rserie + Rlast) mit fester Last 10 kΩ.
- RC: Ausgang über C; fc = 1/(2πRC), τ = RC.
- RL: Ausgang über R; fc = R/(2πL), τ = L/R.
- RC und RL sind digitale Tiefpässe erster Ordnung (bilineare Transformation mit Vorverzerrung), Grenzfrequenz auf 45 % der Abtastrate begrenzt. Angezeigte Werte stammen aus den idealen analogen Formeln.
- Mehrere Signale an einem Eingang werden summiert. Der Ausgang gleicht die Zahl der Quellen aus und begrenzt Spitzen.

### Grundlagenquellen

- [Widerstand / MathWorks](https://www.mathworks.com/help/simscape/ref/resistor.html)
- [Kondensator / MathWorks](https://www.mathworks.com/help/simscape/ref/capacitor.html)
- [Spule / MathWorks](https://www.mathworks.com/help/simscape/ref/inductor.html)
- [Passive components and circuits / TI Precision Labs](https://www.ti.com/content/dam/videos/external-videos/en-us/4/3816841626001/6119035031001.mp4/subassets/passive_components_and_circuits_2.pdf)

## Änderungen in dieser Version (Oktober 2026)

**Behoben**
- Neue Bausteine landeten über bestehenden (Kollisionsprüfung nutzte feste statt echter Höhen).
- Auf dem Handy war immer nur ein Baustein sichtbar. Jetzt gibt es Zoom, „Alles zeigen“ und ein kompaktes Start-Layout.
- iPhone im Lautlos-Modus: Web Audio blieb stumm. Jetzt wird die Audio-Session auf Wiedergabe gestellt (auf echten Geräten noch ungetestet).
- Regler-Ziehen baute den ganzen Klang alle 45 ms neu auf (Knacksen, Phasensprünge).
- Oszilloskop-Bild lief durch. Jetzt mit Trigger, das Bild steht still.
- Tastaturfokus ging nach jedem Verbinden verloren.

**Neu**
- Kabel ziehen statt zweimal klicken, mögliche Ziele werden hervorgehoben. Trennen per × direkt am Kabel.
- Rückgängig/Wiederholen, Aufräumen, Patch per Link teilen, Wellenform-Schalter direkt am Oszillator, Starter-Patch „Schwebung“.
- Notizen-Bereich mit Suche, Themenfilter, Formeln (KaTeX, lokal), Kästen, Aufgaben mit Lösung und eingebetteten Simulationen.
- Schreibstube mit Live-Vorschau.
- Projekt-Bereich mit Vorlage und einem Beispielprojekt.
- Vorschaubild für geteilte Links, Icon für den iPhone-Homescreen, 404-Seite.
