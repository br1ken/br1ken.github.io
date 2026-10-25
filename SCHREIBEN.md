# Notizen schreiben — Spickzettel

Eine Notiz ist eine Textdatei in `notizen/texte/`, zum Beispiel `notizen/texte/ohmsches-gesetz.md`.
Der Dateiname (ohne `.md`) ist gleichzeitig die Adresse: `notizen/beitrag.html?b=ohmsches-gesetz`.
Nur Kleinbuchstaben, Zahlen und Bindestriche verwenden.

Am bequemsten schreibst du in der **Schreibstube** (`notizen/schreiben.html`) mit Live-Vorschau.
Jeder normale Texteditor geht aber auch.

## 1. Der Kopf

Ganz oben, zwischen zwei `---`-Zeilen:

```
---
titel: Warum der Spannungsteiler unter Last einbricht
datum: 2026-10-22
fach: Grundlagen der E-Technik
art: theorie
tags: [Spannungsteiler, Last, Widerstand]
teaser: Ein, zwei Sätze für die Karte in der Übersicht.
welle: lade
entwurf: ja
---
```

Für eine durchgerechnete Aufgabe sieht der Anfang so aus:

```
fach: ET1 · Rechenübung 2
art: rechnung
aufgabe: 2.5
```

| Feld | Pflicht? | Bedeutung |
|---|---|---|
| `titel` | ja | Überschrift der Notiz. Die Aufgabennummer gehört nicht hinein, die steht in `aufgabe` |
| `datum` | ja | `JJJJ-MM-TT`, bestimmt die Reihenfolge |
| `fach` | empfohlen | Rubrik, z. B. Fach oder Semester. Wird automatisch zum Filter und gliedert die Übersicht |
| `art` | empfohlen | `rechnung` = durchgerechnete Aufgabe aus Vorlesung oder Übung, `theorie` = allgemeine Erklärung oder Herleitung. Die Übersicht trennt danach in „Rechnungen“ und „Theorie“. Ohne Angabe landet die Notiz unter „Sonstiges“ |
| `aufgabe` | bei Rechnungen | Nummer wie `2.5`. Erscheint auf der Karte als „A2.5“, Rechnungen werden danach sortiert |
| `tags` | optional | Schlagworte in eckigen Klammern |
| `teaser` | empfohlen | Kurztext auf der Karte und in Link-Vorschauen |
| `welle` | optional | Titelbild: `sinus`, `rechteck`, `dreieck`, `saege`, `gedaempft`, `lade`, `am`. Ohne Angabe wird eine Welle passend zum Dateinamen erzeugt |
| `bild` | optional | eigenes Titelbild statt Welle, z. B. `bilder/titel.jpg` |
| `entwurf` | optional | `ja` = taucht in keiner Liste auf |

Danach in `notizen/beitraege.js` den Dateinamen eintragen, sonst erscheint die Notiz nicht in den Listen.

## 2. Text

```
## Zwischenüberschrift          (erscheint im Inhaltsverzeichnis)
### Kleinere Überschrift

**fett**, *kursiv*, ==markiert==, ~~durchgestrichen~~, `Code`
[Linktext](https://example.com)       externe Links bekommen automatisch ein ↗
[andere Notiz](beitrag.html?b=spannungsteiler)
[zum Labor](../labor/)

- Aufzählung
  - eingerückt (zwei Leerzeichen)
1. nummeriert
- [x] erledigt   - [ ] offen

> Zitat oder Gedanke, der hervorstechen soll

---                              Trennlinie
```

Eine neue Zeile im selben Absatz: zwei Leerzeichen ans Zeilenende. Eine Leerzeile beginnt einen neuen Absatz.

## 3. Formeln

Formeln werden mit KaTeX gesetzt (LaTeX-Schreibweise).

```
Im Satz: $U = R \cdot I$

Abgesetzt:
$$
f_c = \frac{1}{2\pi RC}
$$
```

Nützlich: `\frac{a}{b}`, `\sqrt{x}`, `x^2`, `x_1`, `\cdot`, `\pi`, `\omega`, `\varphi`, `\tau`, `\Omega`, `\mu`,
`\underline{U}` (komplexe Größe), `\hat{u}` (Amplitude), `\text{V}` (Einheit), `\,` (kleiner Abstand), `0{,}707` (Komma ohne Leerraum).
Ein echtes Dollarzeichen schreibst du als `\$`.

## 4. Kästen

```
::: merke
Das Wichtigste in einem Satz.        → gelber Kasten mit Schatten
:::

::: info Optionaler Titel             → grauer Hintergrund
::: tipp                              → gestrichelter Rahmen
::: achtung                           → Warnung mit rotem Rand
::: beispiel

::: aufgabe Titel
Die Frage.
???
Die Lösung — erst nach dem Aufklappen sichtbar.
:::

::: herleitung Woher kommt das?
Lange Rechnung, standardmäßig zugeklappt.
:::
```

Jeder Kasten endet mit einer Zeile, auf der nur `:::` steht. Kästen dürfen Formeln, Listen und Tabellen enthalten.

## 5. Simulationen

```
::: sim rc r=10k c=22n
Optionaler Satz unter der Simulation.
:::
```

| Name | Was | Startwerte |
|---|---|---|
| `rc` | RC-Tiefpass: Bode-Diagramm + Sprungantwort, mit Knopf „Im Labor anhören“ | `r=10k c=22n` |
| `welle` | Sinus mit Amplitude, Frequenz und Phase, Effektivwert | `u=5 f=2 phi=0` |
| `teiler` | Spannungsteiler mit Schaltplan, optional belastet | `u=12 r1=10k r2=10k rl=10k last` |
| `bruecke` | Brückenschaltung (R₂ = R₃ gekoppelt) mit Potentialen, Strömen, Wirkungsgrad und Lastleistungs-Kurve | `x=30 u=30 rl=15 r1=10 anpassen` |
| `ueberlagerung` | Überlagerungsprinzip: U_q, R und I_q in Reihe, Umschalter (a) nur U_q / (b) nur I_q / beide, Teiltabelle und Leistungsbilanz | `u=3 i=2 r=1 modus=t` (`a`, `b` oder `t`) |

Einheiten-Kürzel für Werte: `p n u µ m k M` (z. B. `4.7u` = 4,7 µF, `2k2` geht nicht, nimm `2.2k`).
Neue Simulationen kommen in `assets/sims.js`. Jede Funktion dort bekommt ein Element und die Startwerte.

## 6. Lexikon-Links

Hinter den drei Punkten ⋮ oben rechts steckt ein Lexikon der elektrischen Größen. Aus einer Notiz verlinkst du hinein mit doppelten eckigen Klammern:

```
[[Leistung]]                    öffnet den Eintrag „Leistung“
[[Potentiale|potential]]        anderer Text, Eintrag „potential“
```

Einträge ergänzt oder änderst du in `assets/lexikon.js`.

## 7. Bilder und Tabellen

Bilder nach `notizen/bilder/` legen:

```
![Beschreibung für Screenreader](bilder/messaufbau.jpg "Bildunterschrift")
```

Am besten JPG oder WebP mit höchstens etwa 1600 px Breite, damit die Seite auf dem Handy schnell lädt.

```
| Größe    | Zeichen | Einheit |
|----------|:-------:|--------:|
| Spannung | $U$     | V       |
```

Doppelpunkte in der Trennzeile richten die Spalte aus: `:---:` mittig, `---:` rechts.

## 8. Eigenes HTML

Eine Zeile, die mit einem HTML-Tag wie `<div`, `<iframe`, `<video` oder `<figure` beginnt, wird bis zur nächsten Leerzeile unverändert übernommen. Zum Beispiel für ein eingebettetes Video oder eine eigene kleine Grafik.

**Eigene Diagramme** als SVG direkt in der Notiz (passen sich hell/dunkel an, siehe `von-newton-zu-ohm.md`). Wichtig: keine Leerzeile innerhalb des Blocks.

```
<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Was zu sehen ist">
<rect class="b" x="10" y="20" width="104" height="40"/><text class="c" x="62" y="45">U = R · I</text>
</svg><figcaption>Bildunterschrift</figcaption></figure>
```

Klassen: `s` Linie, `m` graue Linie, `d` gestrichelt, `b` Kasten, `a` Akzent-Fläche, `hl` zarte Markierung, `f` gefüllt; bei Text `c` zentriert, `k` kleine graue Beschriftung, `ai` Text auf Akzent. Etwa 360 breit zeichnen, dann bleibt die Schrift auf dem Handy lesbar.
