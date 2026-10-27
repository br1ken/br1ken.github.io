---
titel: Kurzschlussaufgabe — ein Netzwerk, drei Situationen
datum: 2026-10-27
fach: ET1 · Rechenübung 2
art: rechnung
aufgabe: 2.6
tags: [Knotenmethode, Spannungsteiler, Ersatzwiderstand, Leerlauf, Kurzschluss, Parallelschaltung]
teaser: Aufgabe 2.6: Dasselbe Netzwerk aus vier Widerständen einmal mit Quelle, einmal mit Ohmmeter und einmal kurzgeschlossen. Mit eingefärbten Knoten sieht man sofort, was parallel liegt, was in Reihe und was ganz wegfällt.
welle: dreieck
---

Vier Widerstände, drei Klemmen und eine Zeichnung, die einen bewusst in die Irre führt. Die Aufgabe fragt dreimal nach etwas anderem: einmal nach einer Spannung, zweimal nach einem Ersatzwiderstand, jedes Mal an anderen Klemmen und mit etwas anderem angeschlossen. Wer jedes Mal neu überlegt, was wo hängt, verheddert sich schnell.

Das Werkzeug, mit dem alle drei Teile fast von selbst gehen, ist die [[Knotenmethode|knoten-faerben]]: Man färbt die Knoten ein und liest dann nur noch ab, zwischen welchen Farben jeder Widerstand liegt. Gebraucht werden [[Reihe und parallel|reihe-parallel]] und der [[Spannungsteiler|spannungsteiler]], ausführlich in der Notiz [Widerstandsnetzwerke](beitrag.html?b=spannungsteiler).

## Die Aufgabe

<figure class="dia"><svg viewBox="0 0 360 266" role="img" aria-label="Bild 1: Die Schaltung aus der Angabe. Links die Quelle U_q zwischen Leitung 1 oben und Leitung 0 unten. In der Mitte eine Spalte mit R1 oben und R2 darunter, rechts davon R3 und R4 waagrecht zur rechten Leitung. Oben läuft ein Draht vom oberen Ende von R1 nach rechts und die rechte Leitung hinunter zur unteren Leitung. Klemme 2 führt zum Punkt zwischen R2 und R4.">
<defs><marker id="ks1-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks1-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="s" d="M40 155V100H215M255 100H300M180 42V30H300V240H40V185M180 82V112M180 152V170M113.5 170H215M255 170H300"/>
<circle class="b" cx="40" cy="170" r="15"/><path class="s" d="M40 155V185"/>
<path class="s" d="M14 152V188" marker-end="url(#ks1-e)"/><text class="c" x="14" y="204">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M125 178V232" marker-end="url(#ks1-e)"/><text x="131" y="210">U<tspan dy="3" font-size="9">2</tspan></text>
<rect class="b" x="172" y="42" width="16" height="40"/><rect class="b" x="172" y="112" width="16" height="40"/><rect class="b" x="215" y="92" width="40" height="16"/><rect class="b" x="215" y="162" width="40" height="16"/>
<circle class="f" cx="180" cy="100" r="3"/><circle class="f" cx="180" cy="170" r="3"/><circle class="f" cx="300" cy="100" r="3"/><circle class="f" cx="300" cy="170" r="3"/>
<circle class="b" cx="110" cy="100" r="3.5"/><circle class="b" cx="110" cy="170" r="3.5"/><circle class="b" cx="110" cy="240" r="3.5"/>
<text class="c" x="110" y="90">1</text><text x="100" y="174" text-anchor="end">2</text><text class="c" x="110" y="258">0</text>
<text x="166" y="66" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="166" y="136" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text><text class="c" x="235" y="86">R<tspan dy="3" font-size="9">3</tspan></text><text class="c" x="235" y="156">R<tspan dy="3" font-size="9">4</tspan></text>
</svg><figcaption>Bild 1: die Schaltung, wie sie in der Angabe gezeichnet ist. Links die Quelle U<sub>q</sub>, die kleinen Kreise sind die Klemmen 1, 2 und 0.</figcaption></figure>

Ein Netzwerk aus $R_1$ bis $R_4$ hat die Klemmen 1, 2 und 0.

1. **(i)** An 1–0 liegt $U_q$. Gesucht ist $U_2$ an 2–0.
2. **(ii)** Statt $U_q$ ist an 1–0 ein Ohmmeter (Leerlauf). Gesucht ist $R_{10}$.
3. **(iii)** Statt $U_q$ ist 1–0 kurzgeschlossen. Gesucht ist $R_{20}$.

Die Angabe ist allgemein, die Ergebnisse sind Formeln. Damit man auch Zahlen sieht, rechne ich nebenher mit Beispielwerten. Sie stehen nicht in der Angabe und sind so gewählt, dass glatte Ergebnisse herauskommen:

| Größe | Wert | Größe | Wert |
|:---|---:|:---|---:|
| $U_q$ | $12\,\mathrm{V}$ | $R_2$ | $3\,\Omega$ |
| $R_1$ | $9\,\Omega$ | $R_4$ | $6\,\Omega$ |
| $R_3$ | $9\,\Omega$ | | |

## Werkzeug: Knotenmethode

::: merke Die Regeln
- Alle Leitungen, die ohne Widerstand verbunden sind, bilden einen Knoten.
- Jeder Knoten bekommt eine eigene Farbe.
- Jeder Widerstand liegt zwischen zwei Farben.
- Gleiche zwei Farben bedeutet: Die Widerstände liegen parallel.
- Ein Kurzschluss verschmilzt zwei Farben zu einer.
- Ein Widerstand mit beiden Enden an derselben Farbe fällt weg.
:::

Warum das funktioniert: Ein idealer Draht hat überall dasselbe Potential. Für die Rechnung ist es also völlig egal, wie lang eine Leitung ist, um wie viele Ecken sie läuft und wo in der Zeichnung sie liegt. Es zählt nur, welche Bauteil-Enden sie miteinander verbindet. Genau das macht die Farbe sichtbar. Zwei Widerstände mit denselben zwei Farben haben an beiden Enden dasselbe Potential, also dieselbe Spannung, und das ist die Definition von parallel.

Und ein Widerstand, dessen beide Enden dieselbe Farbe haben, hat die Spannung null. Nach dem [[Ohmschen Gesetz|ohmsches-gesetz]] fließt dann kein Strom durch ihn, er tut nichts und kann gestrichen werden.

::: tipp So färbt man in der Prüfung
Bleistift oder Textmarker auf eine Klemme setzen und jede Leitung entlangfahren, bis man an ein Bauteil stößt. Alles, was man dabei überstreicht, ist ein Knoten. Dann die nächste Farbe, bis jede Leitung gefärbt ist. Bei vier Widerständen dauert das eine halbe Minute und erspart einem jede Diskussion, ob etwas „eigentlich“ parallel liegt.
:::

## Schritt 0: Knoten einfärben

<figure class="dia"><svg viewBox="0 0 360 266" role="img" aria-label="Bild 2: Dieselbe Schaltung mit eingefärbten Knoten. Blau ist Knoten 1: die Leitung von der Quelle über Klemme 1 bis zum Punkt zwischen R1 und R2 und zum linken Ende von R3. Orange ist Knoten 2: Klemme 2 bis zum Punkt zwischen R2 und R4. Grün ist Knoten 0: der Draht oben, die ganze rechte Leitung und die untere Leitung.">
<defs><marker id="ks2-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks2-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="n0" d="M180 42V30H300V240H40V185M255 100H300M255 170H300"/>
<path class="n1" d="M40 155V100H180V112M180 82V100M180 100H215"/>
<path class="n2" d="M110 170H215M180 152V170"/>
<path class="s" d="M40 155V100H215M255 100H300M180 42V30H300V240H40V185M180 82V112M180 152V170M113.5 170H215M255 170H300"/>
<circle class="b" cx="40" cy="170" r="15"/><path class="s" d="M40 155V185"/>
<path class="s" d="M14 152V188" marker-end="url(#ks2-e)"/><text class="c" x="14" y="204">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M125 178V232" marker-end="url(#ks2-e)"/><text x="131" y="210">U<tspan dy="3" font-size="9">2</tspan></text>
<rect class="b" x="172" y="42" width="16" height="40"/><rect class="b" x="172" y="112" width="16" height="40"/><rect class="b" x="215" y="92" width="40" height="16"/><rect class="b" x="215" y="162" width="40" height="16"/>
<circle class="f" cx="180" cy="100" r="3"/><circle class="f" cx="180" cy="170" r="3"/><circle class="f" cx="300" cy="100" r="3"/><circle class="f" cx="300" cy="170" r="3"/>
<circle class="b" cx="110" cy="100" r="3.5"/><circle class="b" cx="110" cy="170" r="3.5"/><circle class="b" cx="110" cy="240" r="3.5"/>
<text class="c" x="110" y="90">1</text><text x="100" y="174" text-anchor="end">2</text><text class="c" x="110" y="258">0</text>
<text x="166" y="66" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="166" y="136" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text><text class="c" x="235" y="86">R<tspan dy="3" font-size="9">3</tspan></text><text class="c" x="235" y="156">R<tspan dy="3" font-size="9">4</tspan></text>
<text class="k t0" x="8" y="18">KNOTEN 0</text><text class="k t1" x="8" y="32">KNOTEN 1</text><text class="k t2" x="8" y="46">KNOTEN 2</text>
</svg><figcaption>Bild 2: Knoten eingefärbt. Grün ist Knoten 0, dazu gehören auch der Draht ganz oben und die ganze rechte Leitung.</figcaption></figure>

**Die Täuschung der Zeichnung:** Der Draht ganz oben und die Leitung ganz rechts gehören zu Klemme 0. Das obere Ende von $R_1$ liegt also auf Knoten 0, obwohl es oben gezeichnet ist. Wer nur auf die Zeichnung schaut, hält $R_1$ und $R_2$ für eine Reihenschaltung in einer Spalte. Die Farben zeigen: $R_1$ hängt mit dem oberen Ende an Grün, mit dem unteren an Blau.

**Ablesen: Zwischen welchen Knoten liegt jeder Widerstand?**

| Widerstand | Knoten |
|:---:|:---:|
| $R_1$ | 0 – 1 |
| $R_2$ | 1 – 2 |
| $R_3$ | 1 – 0 |
| $R_4$ | 2 – 0 |

::: info Was die Tabelle sagt
$R_1$ und $R_3$ liegen beide zwischen Knoten 1 und Knoten 0. Sie liegen daher parallel: $R_1 \parallel R_3$.

$R_2$ und $R_4$ liegen hintereinander, Knoten 2 ist ihr Abgriff. Das gilt aber nur, solange an Klemme 2 nichts angeschlossen ist. Dann fließt am Knoten 2 kein Strom ab, und durch $R_2$ und $R_4$ fließt derselbe Strom. In Teil (iii) kommt genau dieser Punkt ins Spiel.
:::

## Teil (i): Spannung $U_2$ bei angeschlossener Quelle

### Schritt 1: Schaltung entwirren

Gleiche Farben bleiben gleiche Knoten. Man zeichnet nur übersichtlicher.

<figure class="dia"><svg viewBox="0 0 360 224" role="img" aria-label="Bild 3: Teil i übersichtlich gezeichnet. Links die Quelle zwischen Knoten 1 oben und Knoten 0 unten. In der Mitte R1 parallel R3 grau, ohne Einfluss auf U2. Rechts R2 oben und R4 unten in Reihe, dazwischen Klemme 2, U2 zeigt von Klemme 2 nach 0.">
<defs><marker id="ks3-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks3-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="n0" d="M40 125V190H296M140 130V190M240 170V190"/>
<path class="n1" d="M40 95V30H240V50M140 30V90"/>
<path class="n2" d="M240 90V130M240 110H296"/>
<path class="s" d="M40 95V30H240V50M40 125V190H296.5M140 30V90M140 130V190M240 90V130M240 170V190M240 110H296.5"/>
<circle class="b" cx="40" cy="110" r="15"/><path class="s" d="M40 95V125"/>
<path class="s" d="M16 92V128" marker-end="url(#ks3-e)"/><text class="c" x="16" y="146">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M326 116V184" marker-end="url(#ks3-e)"/><text x="332" y="154">U<tspan dy="3" font-size="9">2</tspan></text>
<text class="k c" x="140" y="218">OHNE EINFLUSS AUF U<tspan dy="3" font-size="8">2</tspan></text>
<rect class="m" x="132" y="90" width="16" height="40"/>
<rect class="b" x="232" y="50" width="16" height="40"/><rect class="b" x="232" y="130" width="16" height="40"/>
<circle class="f" cx="140" cy="30" r="3"/><circle class="f" cx="140" cy="190" r="3"/><circle class="f" cx="240" cy="110" r="3"/><circle class="f" cx="240" cy="190" r="3"/>
<circle class="b" cx="300" cy="110" r="3.5"/><circle class="b" cx="300" cy="190" r="3.5"/>
<text class="c" x="300" y="100">2</text><text class="c" x="300" y="208">0</text>
<text x="30" y="24" text-anchor="end">1</text>
<text x="256" y="74">R<tspan dy="3" font-size="9">2</tspan></text><text x="256" y="154">R<tspan dy="3" font-size="9">4</tspan></text>
<text class="k" x="154" y="114">R<tspan dy="3" font-size="8">1</tspan><tspan dy="-3"> || R</tspan><tspan dy="3" font-size="8">3</tspan></text>
</svg><figcaption>Bild 3: Teil (i) entwirrt. Gleiche Farben, gleiche Knoten, nur übersichtlicher gezeichnet. Grau: R<sub>1</sub> || R<sub>3</sub> hängt direkt an der Quelle.</figcaption></figure>

::: info Warum $R_1 \parallel R_3$ keine Rolle spielt
Eine ideale Spannungsquelle hält die Spannung zwischen Knoten 1 und 0 fest auf $U_q$. $R_1 \parallel R_3$ zieht nur zusätzlichen Strom aus der Quelle. An der Spannung zwischen 1 und 0 ändert das nichts. Übrig bleibt der Pfad $1 \to R_2 \to 2 \to R_4 \to 0$, also ein Spannungsteiler.
:::

### Schritt 2: Unbelasteter Spannungsteiler

An Klemme 2 wird nur gemessen. Es fließt dort kein Strom ab. Durch $R_2$ und $R_4$ fließt daher derselbe Strom:

$$I = \frac{U_q}{R_2 + R_4}$$

Die Spannung $U_2$ fällt an $R_4$ ab:

$$U_2 = I \cdot R_4 = \frac{U_q}{R_2 + R_4} \cdot R_4$$

::: merke Ergebnis (i)
$$U_2 = U_q \cdot \frac{R_4}{R_2 + R_4}$$

Im Beispiel: $I = \frac{12\,\mathrm{V}}{9\,\Omega} = 1{,}33\,\mathrm{A}$ und $U_2 = 12\,\mathrm{V} \cdot \frac{6}{9} = 8\,\mathrm{V}$.
:::

::: tipp Spannungsteiler ohne Rechnen
Die Teilspannung verhält sich zur Gesamtspannung wie der Teilwiderstand zum Gesamtwiderstand. $R_4$ ist $\frac{6}{9} = \frac{2}{3}$ der Kette, also bekommt er $\frac{2}{3}$ von $12\,\mathrm{V}$. Kontrolle: An $R_2$ bleiben $4\,\mathrm{V}$, zusammen $12\,\mathrm{V}$ ✓
:::

::: beispiel Was $R_1 \parallel R_3$ doch verändert
An $U_2$ nichts, an der Quelle schon. Durch $R_1$ und $R_3$ fließen je $\frac{12\,\mathrm{V}}{9\,\Omega} = 1{,}33\,\mathrm{A}$, durch den Teiler noch einmal $1{,}33\,\mathrm{A}$. Die Quelle liefert also $4\,\mathrm{A}$ und $48\,\mathrm{W}$, obwohl für $U_2$ nur ein Drittel davon gebraucht wird. Bei einer echten Quelle mit [[Innenwiderstand|ersatzquelle]] würde dieser Zusatzstrom die Klemmenspannung drücken, dann hätte $R_1 \parallel R_3$ sehr wohl Einfluss. Die Aufgabe sagt aber ideale Quelle.
:::

## Teil (ii): Ersatzwiderstand $R_{10}$ im Leerlauf

[[Leerlauf|leerlauf-kurzschluss]] heißt hier: An Klemme 2 hängt nichts, dort fließt kein Strom heraus. Und an 1–0 sitzt statt der Quelle nur das Ohmmeter.

### Schritt 1: Quelle entfernen

Statt der Quelle hängt ein Ohmmeter an 1–0. An der Stelle der Quelle ist jetzt eine Lücke. Die Färbung bleibt gleich wie in Schritt 0.

<figure class="dia"><svg viewBox="0 0 360 266" role="img" aria-label="Bild 4: Teil ii. Die Quelle ist entfernt, zwischen Klemme 1 und Klemme 0 misst ein Ohmmeter R10. Die Färbung ist dieselbe wie in Bild 2.">
<defs><marker id="ks4-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks4-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="n0" d="M180 42V30H300V240H110M255 100H300M255 170H300"/>
<path class="n1" d="M110 100H180V112M180 82V100M180 100H215"/>
<path class="n2" d="M110 170H215M180 152V170"/>
<path class="s" d="M113.5 100H215M255 100H300M180 42V30H300V240H113.5M180 82V112M180 152V170M113.5 170H215M255 170H300"/>
<path class="s" d="M70 106V234" marker-start="url(#ks4-s)" marker-end="url(#ks4-e)"/><text x="64" y="174" text-anchor="end">R<tspan dy="3" font-size="9">10</tspan></text>
<rect class="b" x="172" y="42" width="16" height="40"/><rect class="b" x="172" y="112" width="16" height="40"/><rect class="b" x="215" y="92" width="40" height="16"/><rect class="b" x="215" y="162" width="40" height="16"/>
<circle class="f" cx="180" cy="100" r="3"/><circle class="f" cx="180" cy="170" r="3"/><circle class="f" cx="300" cy="100" r="3"/><circle class="f" cx="300" cy="170" r="3"/>
<circle class="b" cx="110" cy="100" r="3.5"/><circle class="b" cx="110" cy="170" r="3.5"/><circle class="b" cx="110" cy="240" r="3.5"/>
<text class="c" x="110" y="90">1</text><text x="100" y="174" text-anchor="end">2</text><text class="c" x="110" y="258">0</text>
<text x="166" y="66" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="166" y="136" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text><text class="c" x="235" y="86">R<tspan dy="3" font-size="9">3</tspan></text><text class="c" x="235" y="156">R<tspan dy="3" font-size="9">4</tspan></text>
<text class="k t0" x="8" y="18">KNOTEN 0</text><text class="k t1" x="8" y="32">KNOTEN 1</text><text class="k t2" x="8" y="46">KNOTEN 2</text>
</svg><figcaption>Bild 4: Teil (ii). Statt der Quelle misst ein Ohmmeter zwischen 1 und 0. Die Färbung bleibt wie in Bild 2.</figcaption></figure>

### Schritt 2: Wege von Knoten 1 nach Knoten 0

<figure class="dia"><svg viewBox="0 0 360 206" role="img" aria-label="Bild 5: Drei Wege von Knoten 1 nach Knoten 0, nebeneinander gezeichnet. Weg 1 über R1, Weg 2 über R3, Weg 3 über R2, Knoten 2 und R4.">
<defs><marker id="ks5-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks5-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="n0" d="M63 180H290V160M140 125V180M210 125V180"/>
<path class="n1" d="M63 30H290V50M140 30V85M210 30V85"/>
<path class="n2" d="M290 90V120"/>
<path class="s" d="M63.5 30H290V50M63.5 180H290V160M140 30V85M140 125V180M210 30V85M210 125V180M290 90V120"/>
<rect class="b" x="132" y="85" width="16" height="40"/><rect class="b" x="202" y="85" width="16" height="40"/><rect class="b" x="282" y="50" width="16" height="40"/><rect class="b" x="282" y="120" width="16" height="40"/>
<circle class="f" cx="140" cy="30" r="3"/><circle class="f" cx="210" cy="30" r="3"/><circle class="f" cx="140" cy="180" r="3"/><circle class="f" cx="210" cy="180" r="3"/><circle class="f" cx="290" cy="105" r="3"/>
<circle class="b" cx="60" cy="30" r="3.5"/><circle class="b" cx="60" cy="180" r="3.5"/>
<text x="50" y="34" text-anchor="end">1</text><text x="50" y="184" text-anchor="end">0</text>
<text x="156" y="109">R<tspan dy="3" font-size="9">1</tspan></text><text x="226" y="109">R<tspan dy="3" font-size="9">3</tspan></text><text x="306" y="74">R<tspan dy="3" font-size="9">2</tspan></text><text x="306" y="144">R<tspan dy="3" font-size="9">4</tspan></text>
<text class="t2" x="300" y="109" font-weight="700">2</text>
<path class="s" d="M36 36V174" marker-start="url(#ks5-s)" marker-end="url(#ks5-e)"/><text x="42" y="110">R<tspan dy="3" font-size="9">10</tspan></text>
<text class="k c" x="140" y="200">WEG 1</text><text class="k c" x="210" y="200">WEG 2</text><text class="k c" x="290" y="200">WEG 3</text>
</svg><figcaption>Bild 5: die drei Wege von Knoten 1 nach Knoten 0. Alle beginnen oben in Blau und enden unten in Grün.</figcaption></figure>

::: info Drei Wege
Vom Knoten 1 zum Knoten 0 gibt es drei Wege. Weg 1 führt über $R_1$, Weg 2 über $R_3$. Weg 3 führt über Knoten 2, also durch $R_2$ und $R_4$ in Reihe. Alle drei Wege beginnen in 1 und enden in 0, sie liegen parallel.
:::

$$R_{10} = R_1 \parallel R_3 \parallel (R_2 + R_4)$$

### Schritt 3: Als einen Bruch ausrechnen

**1.** Zuerst $R_1 \parallel R_3$:

$$R_{13} = \frac{R_1 R_3}{R_1 + R_3}$$

**2.** Dann parallel zu $(R_2 + R_4)$:

$$R_{10} = \frac{R_{13}\,(R_2 + R_4)}{R_{13} + R_2 + R_4}$$

**3.** $R_{13}$ einsetzen:

$$R_{10} = \frac{\dfrac{R_1 R_3}{R_1 + R_3}\,(R_2 + R_4)}{\dfrac{R_1 R_3}{R_1 + R_3} + R_2 + R_4}$$

**4.** Zähler und Nenner mit $(R_1 + R_3)$ erweitern:

$$R_{10} = \frac{R_1 R_3\,(R_2 + R_4)}{R_1 R_3 + (R_1 + R_3)(R_2 + R_4)}$$

**5.** Die Klammer im Nenner ausmultiplizieren:

$$(R_1 + R_3)(R_2 + R_4) = R_1 R_2 + R_1 R_4 + R_2 R_3 + R_3 R_4$$

**6.** Ergebnis:

::: merke Ergebnis (ii)
$$R_{10} = \frac{R_1 R_3\,(R_2 + R_4)}{R_1 R_2 + R_1 R_3 + R_1 R_4 + R_2 R_3 + R_3 R_4}$$

Im Beispiel: $R_{13} = \frac{81}{18}\,\Omega = 4{,}5\,\Omega$ und $R_{10} = \frac{4{,}5 \cdot 9}{4{,}5 + 9}\,\Omega = 3\,\Omega$. Mit der Formel: $\frac{81 \cdot 9}{27 + 81 + 54 + 27 + 54}\,\Omega = \frac{729}{243}\,\Omega = 3\,\Omega$ ✓
:::

::: tipp Schneller mit Leitwerten
Bei drei oder mehr parallelen Zweigen addiert man am bequemsten die Kehrwerte:

$$\frac{1}{R_{10}} = \frac{1}{R_1} + \frac{1}{R_3} + \frac{1}{R_2 + R_4} = \frac{1}{9\,\Omega} + \frac{1}{9\,\Omega} + \frac{1}{9\,\Omega} = \frac{1}{3\,\Omega}$$

Das ist gleichzeitig eine Plausibilitätsprobe: Eine Parallelschaltung ist immer kleiner als ihr kleinster Zweig. Hier sind alle drei Zweige $9\,\Omega$, also muss $R_{10}$ unter $9\,\Omega$ liegen, und drei gleiche Zweige geben genau ein Drittel.
:::

## Teil (iii): Ersatzwiderstand $R_{20}$ bei Kurzschluss

### Schritt 1: Kurzschluss einsetzen und neu färben

Statt der Quelle verbindet ein Draht Klemme 1 direkt mit Klemme 0. Knoten 1 und Knoten 0 verschmelzen. Alles, was blau war, wird grün.

<figure class="dia"><svg viewBox="0 0 360 266" role="img" aria-label="Bild 6: Teil iii. Statt der Quelle verbindet ein dicker Draht Klemme 1 mit Klemme 0. Dadurch ist alles grün außer Knoten 2 in Orange. R1 und R3 haben beide Enden auf Grün. Zwischen Klemme 2 und 0 wird R20 gemessen.">
<defs><marker id="ks6-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks6-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="n0" d="M180 42V30H300V240H40V100H215M180 82V112M255 100H300M255 170H300"/>
<path class="n2" d="M110 170H215M180 152V170"/>
<path class="s" d="M40 100H215M255 100H300M180 42V30H300V240H40M180 82V112M180 152V170M113.5 170H215M255 170H300"/>
<path class="s" d="M40 100V240" style="stroke-width:3"/>
<text class="k" x="48" y="204">KURZ-</text><text class="k" x="48" y="218">SCHLUSS</text>
<path class="s" d="M125 176V234" marker-start="url(#ks6-s)" marker-end="url(#ks6-e)"/><text x="131" y="210">R<tspan dy="3" font-size="9">20</tspan></text>
<rect class="b" x="172" y="42" width="16" height="40"/><rect class="b" x="172" y="112" width="16" height="40"/><rect class="b" x="215" y="92" width="40" height="16"/><rect class="b" x="215" y="162" width="40" height="16"/>
<circle class="f" cx="180" cy="100" r="3"/><circle class="f" cx="180" cy="170" r="3"/><circle class="f" cx="300" cy="100" r="3"/><circle class="f" cx="300" cy="170" r="3"/>
<circle class="b" cx="110" cy="100" r="3.5"/><circle class="b" cx="110" cy="170" r="3.5"/><circle class="b" cx="110" cy="240" r="3.5"/>
<text class="c" x="110" y="90">1</text><text x="100" y="174" text-anchor="end">2</text><text class="c" x="110" y="258">0</text>
<text x="166" y="66" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="166" y="136" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text><text class="c" x="235" y="86">R<tspan dy="3" font-size="9">3</tspan></text><text class="c" x="235" y="156">R<tspan dy="3" font-size="9">4</tspan></text>
<text class="k t0" x="8" y="18">KNOTEN 0 = KNOTEN 1</text><text class="k t2" x="8" y="32">KNOTEN 2</text>
</svg><figcaption>Bild 6: Teil (iii). Der Kurzschluss verschmilzt Knoten 1 mit Knoten 0, alles Blaue wird grün. Nur Knoten 2 bleibt orange.</figcaption></figure>

| Widerstand | Knoten | Folge |
|:---:|:---:|:---|
| $R_1$ | 0 – 0 | fällt weg |
| $R_3$ | 0 – 0 | fällt weg |
| $R_2$ | 2 – 0 | bleibt |
| $R_4$ | 2 – 0 | bleibt |

### Schritt 2: Schaltung entwirren

<figure class="dia"><svg viewBox="0 0 360 224" role="img" aria-label="Bild 7: Teil iii übersichtlich gezeichnet. Links der Kurzschlussdraht, in der Mitte R1 parallel R3 grau mit beiden Enden auf Grün, rechts R2 von Grün nach Klemme 2 und R4 von Klemme 2 nach Grün.">
<defs><marker id="ks7-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks7-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="n0" d="M40 30V190H296M40 30H240V50M140 30V90M140 130V190M240 170V190"/>
<path class="n2" d="M240 90V130M240 110H296"/>
<path class="s" d="M40 30H240V50M40 190H296.5M140 30V90M140 130V190M240 90V130M240 170V190M240 110H296.5"/>
<path class="s" d="M40 30V190" style="stroke-width:3"/>
<text class="k" x="48" y="104">KURZ-</text><text class="k" x="48" y="118">SCHLUSS</text>
<path class="s" d="M326 116V184" marker-start="url(#ks7-s)" marker-end="url(#ks7-e)"/><text x="332" y="154">R<tspan dy="3" font-size="9">20</tspan></text>
<text class="k c" x="140" y="218">KURZGESCHLOSSEN</text>
<rect class="m" x="132" y="90" width="16" height="40"/>
<rect class="b" x="232" y="50" width="16" height="40"/><rect class="b" x="232" y="130" width="16" height="40"/>
<circle class="f" cx="140" cy="30" r="3"/><circle class="f" cx="140" cy="190" r="3"/><circle class="f" cx="240" cy="110" r="3"/><circle class="f" cx="240" cy="190" r="3"/>
<circle class="b" cx="300" cy="110" r="3.5"/><circle class="b" cx="300" cy="190" r="3.5"/>
<text class="c" x="300" y="100">2</text><text class="c" x="300" y="208">0</text>
<text x="256" y="74">R<tspan dy="3" font-size="9">2</tspan></text><text x="256" y="154">R<tspan dy="3" font-size="9">4</tspan></text>
<text class="k" x="154" y="114">R<tspan dy="3" font-size="8">1</tspan><tspan dy="-3"> || R</tspan><tspan dy="3" font-size="8">3</tspan></text>
</svg><figcaption>Bild 7: Teil (iii) entwirrt. R<sub>1</sub> || R<sub>3</sub> ist kurzgeschlossen, R<sub>2</sub> führt jetzt von Klemme 2 über den Kurzschluss nach 0.</figcaption></figure>

::: info Zwei Wege von Klemme 2
Das Ohmmeter schickt bei Klemme 2 einen Strom hinein. Weg 1 führt durch $R_4$ direkt nach 0. Weg 2 führt durch $R_2$ nach oben und über den Kurzschluss nach 0. Ohne Kurzschluss wäre Weg 2 eine Sackgasse. $R_2$ und $R_4$ liegen beide zwischen Knoten 2 und Knoten 0, also parallel.
:::

### Schritt 3: Ersatzschaltbild

<figure class="dia"><svg viewBox="0 0 360 160" role="img" aria-label="Bild 8: Ersatzschaltbild für Teil iii. R2 und R4 liegen nebeneinander zwischen Klemme 2 oben und Klemme 0 unten.">
<defs><marker id="ks8-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ks8-s" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M8 0 0 4 8 8z" class="f"/></marker></defs>
<path class="n2" d="M113 30H260V65M180 30V65"/>
<path class="n0" d="M113 140H260V105M180 105V140"/>
<path class="s" d="M113.5 30H260V65M180 30V65M180 105V140M260 105V140H113.5"/>
<rect class="b" x="172" y="65" width="16" height="40"/><rect class="b" x="252" y="65" width="16" height="40"/>
<circle class="f" cx="180" cy="30" r="3"/><circle class="f" cx="180" cy="140" r="3"/>
<circle class="b" cx="110" cy="30" r="3.5"/><circle class="b" cx="110" cy="140" r="3.5"/>
<text x="100" y="34" text-anchor="end">2</text><text x="100" y="144" text-anchor="end">0</text>
<text x="196" y="89">R<tspan dy="3" font-size="9">2</tspan></text><text x="276" y="89">R<tspan dy="3" font-size="9">4</tspan></text>
<path class="s" d="M86 36V134" marker-start="url(#ks8-s)" marker-end="url(#ks8-e)"/><text x="78" y="90" text-anchor="end">R<tspan dy="3" font-size="9">20</tspan></text>
</svg><figcaption>Bild 8: das Ersatzschaltbild. R<sub>2</sub> und R<sub>4</sub> liegen beide zwischen Knoten 2 und Knoten 0, also parallel.</figcaption></figure>

::: merke Ergebnis (iii)
$$R_{20} = R_2 \parallel R_4 = \frac{R_2 R_4}{R_2 + R_4}$$

Im Beispiel: $R_{20} = \frac{3 \cdot 6}{3 + 6}\,\Omega = \frac{18}{9}\,\Omega = 2\,\Omega$.
:::

::: achtung Reihe oder parallel hängt davon ab, wo man hinschaut
In Teil (i) und (ii) liegen $R_2$ und $R_4$ in Reihe, in Teil (iii) parallel. Das ist kein Widerspruch: In (i) und (ii) fließt am Knoten 2 nichts ab, und der Strom geht von 1 durch beide nach 0. In (iii) kommt der Strom bei Knoten 2 herein und teilt sich auf die beiden auf. „Reihe“ und „parallel“ sind keine Eigenschaft der Bauteile, sondern davon, zwischen welchen Klemmen man misst und was dort angeschlossen ist. Darum färbt man in jeder neuen Situation neu.
:::

## Zusammenfassung

::: merke Drei Situationen an denselben Klemmen
- **Quelle:** Die Spannung zwischen 1 und 0 ist fest. Widerstände direkt an der Quelle ändern sie nicht.
- **Leerlauf:** Die Quelle wird entfernt. Die Klemmen 1 und 0 bleiben getrennte Knoten.
- **Kurzschluss:** Die Klemmen 1 und 0 werden zu einem Knoten. Widerstände zwischen ihnen fallen weg.

In jeder neuen Situation färbt man die Knoten neu ein und liest dann ab.
:::

| Teil | Ergebnis | Beispiel |
|:---|:---|---:|
| (i) | $U_2 = U_q \cdot \frac{R_4}{R_2 + R_4}$ | $8\,\mathrm{V}$ |
| (ii) | $R_{10} = R_1 \parallel R_3 \parallel (R_2 + R_4)$ | $3\,\Omega$ |
| (iii) | $R_{20} = \frac{R_2 R_4}{R_2 + R_4}$ | $2\,\Omega$ |

::: tipp (i) und (iii) zusammen sind eine Ersatzspannungsquelle
Von Klemme 2 aus gesehen liefert Teil (i) die Leerlaufspannung $U_2 = 8\,\mathrm{V}$. Und Teil (iii) ist genau das, was man für den Innenwiderstand macht: Die ideale Spannungsquelle wird zum Draht, man misst von Klemme 2 hinein. Also ist $R_{20} = 2\,\Omega$ der Innenwiderstand. Zusammen beschreiben die beiden Teile das ganze Netzwerk an Klemme 2 als eine [[Ersatzspannungsquelle|ersatzquelle]] mit $8\,\mathrm{V}$ und $2\,\Omega$, wie in [A3.2](beitrag.html?b=ersatzspannungsquelle). Die Aufgabe ist also eine Vorübung für Rechenübung 3.
:::

## Typische Fehler

::: achtung Sechs Klassiker
- **Der Zeichnung glauben:** $R_1$ sieht aus, als läge er in einer Spalte mit $R_2$ in Reihe. Sein oberes Ende hängt aber über den Draht oben an Knoten 0. Erst färben, dann rechnen.
- **$R_1 \parallel R_3$ in den Teiler einbauen:** Wer $U_2$ mit allen vier Widerständen ausrechnet, bekommt Unsinn. An einer idealen Quelle ändern parallele Widerstände die Spannung nicht.
- **Produkt durch Summe für drei Zweige:** $\frac{R_1 R_3 (R_2 + R_4)}{R_1 + R_3 + R_2 + R_4}$ ist falsch, das gilt nur für zwei Widerstände. Im Beispiel kämen $27\,\Omega$ statt $3\,\Omega$ heraus, mehr als jeder einzelne Zweig. Bei drei Zweigen zuerst zwei zusammenfassen oder Leitwerte addieren.
- **In (ii) den dritten Weg vergessen:** $R_1 \parallel R_3 = 4{,}5\,\Omega$ allein ist zu groß. Der Weg über Knoten 2 gehört dazu.
- **In (iii) $R_1$ und $R_3$ mitnehmen:** Beide Enden liegen auf Grün, sie sind kurzgeschlossen und fallen weg.
- **In (iii) $R_2$ vergessen:** Ohne Kurzschluss wäre $R_2$ eine Sackgasse. Mit Kurzschluss führt er nach 0. Wer nur $R_4$ nimmt, bekommt $6\,\Omega$ statt $2\,\Omega$.
:::

## Zum Weiterdenken

::: aufgabe Und ohne Kurzschluss?
Wie groß ist der Widerstand zwischen 2 und 0, wenn an 1–0 gar nichts hängt, also weder Quelle noch Kurzschluss?
???
Dann bleiben Knoten 1 und 0 getrennt, und die Farben sind wieder die aus Schritt 0. Von Klemme 2 gibt es zwei Wege nach 0: direkt über $R_4$, oder über $R_2$ zu Knoten 1 und dann über $R_1 \parallel R_3$ nach 0. Der zweite Weg ist eine Reihenschaltung:

$$\begin{aligned} R_{20}^{\text{offen}} &= R_4 \parallel \bigl(R_2 + R_1 \parallel R_3\bigr) \\ &= 6\,\Omega \parallel 7{,}5\,\Omega \\ &= \frac{6 \cdot 7{,}5}{13{,}5}\,\Omega \approx 3{,}33\,\Omega \end{aligned}$$

Mehr als die $2\,\Omega$ mit Kurzschluss. Der Kurzschluss ersetzt die $4{,}5\,\Omega$ von $R_1 \parallel R_3$ durch einen Draht, der zweite Weg wird leichter, der Gesamtwiderstand kleiner.
:::

::: aufgabe Eine Last an Klemme 2
Mit angeschlossener Quelle wie in (i) kommt an 2–0 ein Widerstand $R_L = 2\,\Omega$. Welche Spannung liegt an ihm?
???
Mit der Ersatzspannungsquelle aus dem Tipp oben ($8\,\mathrm{V}$, $2\,\Omega$) ist das ein Spannungsteiler aus Innenwiderstand und Last:

$$U_L = 8\,\mathrm{V} \cdot \frac{2\,\Omega}{2\,\Omega + 2\,\Omega} = 4\,\mathrm{V}$$

Probe direkt am Original mit der [[Knotenregel|knotenregel]] an Knoten 2, Knoten 1 liegt fest auf $12\,\mathrm{V}$:

$$\begin{aligned} \frac{U_L - 12\,\mathrm{V}}{3\,\Omega} + \frac{U_L}{6\,\Omega} + \frac{U_L}{2\,\Omega} &= 0 \\ U_L \left( \frac{1}{3\,\Omega} + \frac{1}{6\,\Omega} + \frac{1}{2\,\Omega} \right) &= \frac{12\,\mathrm{V}}{3\,\Omega} \\ U_L \cdot 1\,\mathrm{S} &= 4\,\mathrm{A} \\ U_L &= 4\,\mathrm{V} \;\checkmark \end{aligned}$$

Die Last halbiert die Spannung, weil sie genauso groß ist wie der Innenwiderstand. Das ist der [belastete Spannungsteiler aus A2.4](beitrag.html?b=belastetes-potentiometer).
:::

::: aufgabe Kurzschluss an der anderen Klemme
Diesmal wird 2–0 kurzgeschlossen. Wie groß ist dann der Widerstand zwischen 1 und 0?
???
Knoten 2 verschmilzt mit Knoten 0. $R_4$ liegt dann zwischen 0 und 0 und fällt weg. $R_2$ liegt jetzt zwischen 1 und 0, also parallel zu $R_1$ und $R_3$:

$$\frac{1}{R_{10}^{\text{kurz}}} = \frac{1}{9\,\Omega} + \frac{1}{9\,\Omega} + \frac{1}{3\,\Omega} = \frac{5}{9\,\Omega} \quad\Rightarrow\quad R_{10}^{\text{kurz}} = 1{,}8\,\Omega$$

Gleiche Regel wie in (iii), nur an der anderen Klemme: Kurzschluss verschmilzt zwei Farben, und was dazwischen lag, fällt weg.
:::
