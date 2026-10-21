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
titel: Warum doppeltes C die Grenzfrequenz halbiert
datum: 2026-10-22
fach: Grundlagen der E-Technik
tags: [RC, Filter, Kondensator]
teaser: Ein, zwei Sätze für die Karte in der Übersicht.
welle: lade
entwurf: ja
---
```

| Feld | Pflicht? | Bedeutung |
|---|---|---|
| `titel` | ja | Überschrift der Notiz |
| `datum` | ja | `JJJJ-MM-TT`, bestimmt die Reihenfolge |
| `fach` | empfohlen | Rubrik, z. B. Fach oder Semester. Wird automatisch zum Filter |
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
[zum Labor](../#labor)

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

Einheiten-Kürzel für Werte: `p n u µ m k M` (z. B. `4.7u` = 4,7 µF, `2k2` geht nicht, nimm `2.2k`).
Neue Simulationen kommen in `assets/sims.js`. Jede Funktion dort bekommt ein Element und die Startwerte.

## 6. Bilder und Tabellen

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

## 7. Eigenes HTML

Eine Zeile, die mit einem HTML-Tag wie `<div`, `<iframe`, `<video` oder `<figure` beginnt, wird bis zur nächsten Leerzeile unverändert übernommen. Zum Beispiel für ein eingebettetes Video oder eine eigene kleine Grafik.
