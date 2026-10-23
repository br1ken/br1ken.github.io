---
titel: Knoten- und Maschengleichungen — wie viele sind wirklich unabhängig?
datum: 2026-10-24
fach: ET1 · Rechenübung 2
art: rechnung
aufgabe: 2.1
tags: [Kirchhoff, Knotenregel, Maschenregel, Zweigstromanalyse, Unabhängigkeit]
teaser: Aufgabe 2.1: Vier Knoten, sechs Zweige, drei Quellen. Welche Gleichungen man aufstellt, welche überflüssig sind und warum es genau drei plus drei sind, Schritt für Schritt mit Vorzeichen.
welle: rechteck
---

Bevor man eine Schaltung ausrechnet, muss man wissen, **welche** Gleichungen man aufstellt. Zu viele helfen nicht, weil manche nur Wiederholungen sind. Zu wenige reichen nicht. Diese Aufgabe klärt genau das, ganz ohne Zahlen. Am Ende kommt trotzdem ein Zahlenbeispiel, damit man sieht, dass es funktioniert.

Die Regeln selbst stehen ausführlich in [Die Kirchhoffschen Gesetze](beitrag.html?b=kirchhoffsche-gesetze).

## Die Aufgabe

Die Schaltung besteht aus idealen Spannungsquellen und Widerständen und hat $z = 6$ Zweige.

1. Stellen Sie für die $k = 4$ Knoten A bis D die Knotengleichungen auf. Wie viele davon sind voneinander unabhängig? Hinweis: Eliminieren Sie nacheinander die Zweigströme $I_6$, $I_5$ usw.
2. Geben Sie für die Fenster die Maschengleichungen an. Können Sie noch eine weitere, davon unabhängige Maschengleichung finden?

<figure class="dia"><svg viewBox="0 0 360 262" role="img" aria-label="Schaltung mit vier Knoten A, B, C, D. Oben von B nach D: R1 und Uq1. Mitte: B, R4, A, R6, D. Links von B nach C: R2 und Uq2. Mitte von A nach C: R5. Rechts von D nach C: Uq3 und R3.">
<path class="s" d="M60 110V40H300V110M60 110H300M60 110V240H300V110M180 110V240"/>
<rect class="b" x="100" y="33" width="40" height="14"/><rect class="b" x="100" y="103" width="40" height="14"/><rect class="b" x="220" y="103" width="40" height="14"/>
<rect class="b" x="53" y="127" width="14" height="36"/><rect class="b" x="173" y="157" width="14" height="36"/><rect class="b" x="293" y="182" width="14" height="36"/>
<circle class="b" cx="230" cy="40" r="12"/><path class="s" d="M218 40H242"/>
<circle class="b" cx="60" cy="200" r="12"/><path class="s" d="M60 188V212"/>
<circle class="b" cx="300" cy="145" r="12"/><path class="s" d="M300 133V157"/>
<text class="k" x="212" y="32" text-anchor="end">+</text><text class="k" x="72" y="186">+</text><text class="k" x="290" y="131" text-anchor="end">+</text>
<circle class="f" cx="60" cy="110" r="3.5"/><circle class="f" cx="180" cy="110" r="3.5"/><circle class="f" cx="300" cy="110" r="3.5"/><circle class="f" cx="180" cy="240" r="3.5"/>
<text x="48" y="114" text-anchor="end">B</text><text class="c" x="180" y="100">A</text><text x="312" y="106">D</text><text class="c" x="180" y="257">C</text>
<text class="k c" x="120" y="27">R<tspan dy="3" font-size="8">1</tspan></text><text class="k c" x="230" y="22">U<tspan dy="3" font-size="8">q1</tspan></text>
<text class="k c" x="120" y="98">R<tspan dy="3" font-size="8">4</tspan></text><text class="k c" x="240" y="98">R<tspan dy="3" font-size="8">6</tspan></text>
<text class="k" x="46" y="149" text-anchor="end">R<tspan dy="3" font-size="8">2</tspan></text><text class="k" x="46" y="204" text-anchor="end">U<tspan dy="3" font-size="8">q2</tspan></text>
<text class="k" x="194" y="179">R<tspan dy="3" font-size="8">5</tspan></text>
<text class="k" x="318" y="149">U<tspan dy="3" font-size="8">q3</tspan></text><text class="k" x="314" y="204">R<tspan dy="3" font-size="8">3</tspan></text>
</svg><figcaption>Abb. 2.1: vier Knoten A bis D, sechs Zweige, drei Quellen. Das Plus markiert jeweils den Pluspol.</figcaption></figure>

| Zweig | zwischen | Bauteile |
|:---|:---|:---|
| oben | B und D | $R_1$, $U_{q1}$ |
| links | B und C | $R_2$, $U_{q2}$ |
| rechts | D und C | $U_{q3}$, $R_3$ |
| Mitte links | B und A | $R_4$ |
| Mitte unten | A und C | $R_5$ |
| Mitte rechts | A und D | $R_6$ |

::: info Ein schönes Detail
Jeder der vier Knoten ist mit jedem anderen durch genau einen Zweig verbunden. Vier Knoten haben $\frac{4 \cdot 3}{2} = 6$ Paare, deshalb sind es genau sechs Zweige. Als Graph ist das ein Tetraeder.
:::

## Die Begriffe

| Begriff | Bedeutung |
|:---|:---|
| **Zweig** | Verbindung zwischen zwei Knoten, durch die überall derselbe Strom fließt |
| **Knoten** | Verbindungspunkt, an dem mindestens drei Zweige zusammentreffen |
| **Masche** | geschlossener Umlauf über Zweige, der jeden Knoten höchstens einmal berührt |
| **Fenster** | Masche, die keinen anderen Zweig umschließt, im Schaltbild eine leere Fläche |

In Abb. 2.1 gibt es drei Fenster: oben, links unten und rechts unten.

## Schritt 1: Zählpfeile festlegen

Bevor irgendeine Gleichung entsteht, bekommt jeder Zweig einen Strompfeil und jedes Bauteil einen Spannungspfeil. Das ist eine **Wahl**, kein Wissen. Zeigt ein Pfeil gegen die echte Richtung, kommt am Ende einfach ein negativer Wert heraus.

1. Jeder Zweig bekommt genau einen Strom $I_1$ bis $I_6$, Richtung frei wählbar.
2. In den Quellenzweigen wählt man den Strom hier so, dass er am Pluspol austritt. Das ist bequem, aber keine Garantie: Eine Quelle kann auch Leistung aufnehmen, dann wird ihr Strom negativ.
3. An jedem Widerstand zeigt der Spannungspfeil in Stromrichtung. Das ist das **Verbraucherzählpfeilsystem**, und dann gilt $U = R \cdot I$ ohne Minus.
4. An jeder Quelle zeigt der Spannungspfeil von $+$ nach $-$. Das ist eine Konvention, mit der $U_q$ positiv ist. Würde man ihn umdrehen, stünde dort $-U_q$.

<figure class="dia"><svg viewBox="0 0 360 262" role="img" aria-label="Dieselbe Schaltung mit Strompfeilen: I1 von D nach B oben, I2 von C nach B links, I3 von C nach D rechts, I4 von B nach A, I5 von A nach C, I6 von D nach A. Quellenspannungen zeigen von plus nach minus.">
<defs><marker id="ks-a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M60 110V40H300V110M60 110H300M60 110V240H300V110M180 110V240"/>
<rect class="b" x="100" y="33" width="40" height="14"/><rect class="b" x="100" y="103" width="40" height="14"/><rect class="b" x="220" y="103" width="40" height="14"/>
<rect class="b" x="53" y="127" width="14" height="36"/><rect class="b" x="173" y="157" width="14" height="36"/><rect class="b" x="293" y="182" width="14" height="36"/>
<circle class="b" cx="230" cy="40" r="12"/><path class="s" d="M218 40H242"/>
<circle class="b" cx="60" cy="200" r="12"/><path class="s" d="M60 188V212"/>
<circle class="b" cx="300" cy="145" r="12"/><path class="s" d="M300 133V157"/>
<text class="k" x="212" y="32" text-anchor="end">+</text><text class="k" x="72" y="186">+</text><text class="k" x="290" y="131" text-anchor="end">+</text>
<circle class="f" cx="60" cy="110" r="3.5"/><circle class="f" cx="180" cy="110" r="3.5"/><circle class="f" cx="300" cy="110" r="3.5"/><circle class="f" cx="180" cy="240" r="3.5"/>
<text x="48" y="114" text-anchor="end">B</text><text class="c" x="180" y="100">A</text><text x="312" y="106">D</text><text class="c" x="180" y="257">C</text>
<path class="s" d="M292 40H264" marker-end="url(#ks-a2)"/><text class="c" x="278" y="32">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="s" d="M60 186V170" marker-end="url(#ks-a2)"/><text x="46" y="182" text-anchor="end">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M300 236V224" marker-end="url(#ks-a2)"/><text x="312" y="234">I<tspan dy="3" font-size="9">3</tspan></text>
<path class="s" d="M66 110H94" marker-end="url(#ks-a2)"/><text class="c" x="80" y="102">I<tspan dy="3" font-size="9">4</tspan></text>
<path class="s" d="M180 118V148" marker-end="url(#ks-a2)"/><text x="190" y="138">I<tspan dy="3" font-size="9">5</tspan></text>
<path class="s" d="M294 110H266" marker-end="url(#ks-a2)"/><text class="c" x="280" y="102">I<tspan dy="3" font-size="9">6</tspan></text>
<path class="m" d="M216 22H244" marker-end="url(#ks-a2)"/><text class="k c" x="230" y="66">U<tspan dy="3" font-size="8">q1</tspan></text>
<path class="m" d="M40 190V212" marker-end="url(#ks-a2)"/><text class="k" x="34" y="204" text-anchor="end">U<tspan dy="3" font-size="8">q2</tspan></text>
<path class="m" d="M322 135V157" marker-end="url(#ks-a2)"/><text class="k" x="328" y="150">U<tspan dy="3" font-size="8">q3</tspan></text>
</svg><figcaption>Zählpfeile: In jedem Zweig ein Strom. Die Spannung an jedem Widerstand zeigt wie sein Strom, die Quellenspannungen (grau) zeigen von + nach −.</figcaption></figure>

| Zweig | Strom | Richtung | Bauteile |
|:---|:---|:---|:---|
| oben | $I_1$ | D → B | $R_1$, $U_{q1}$ |
| links | $I_2$ | C → B | $R_2$, $U_{q2}$ |
| rechts | $I_3$ | C → D | $R_3$, $U_{q3}$ |
| B–A | $I_4$ | B → A | $R_4$ |
| Mitte | $I_5$ | A → C | $R_5$ |
| A–D | $I_6$ | D → A | $R_6$ |

In den Quellen zeigen Strom und Spannung gegeneinander, weil der Strom am Pluspol austritt. An den Widerständen zeigen beide in dieselbe Richtung.

## Teil (i): Knotengleichungen

### Die vier Gleichungen

Für jeden Knoten: zufließende Ströme mit $+$, abfließende mit $-$. Am einfachsten liest man das direkt aus dem Bild mit den Strompfeilen ab:

| Knoten | fließt zu | fließt ab |
|:---|:---|:---|
| A | $I_4$, $I_6$ | $I_5$ |
| B | $I_1$, $I_2$ | $I_4$ |
| C | $I_5$ | $I_2$, $I_3$ |
| D | $I_3$ | $I_1$, $I_6$ |

$$\begin{aligned} \text{A:} \quad I_4 + I_6 - I_5 &= 0 \\ \text{B:} \quad I_1 + I_2 - I_4 &= 0 \\ \text{C:} \quad I_5 - I_2 - I_3 &= 0 \\ \text{D:} \quad I_3 - I_1 - I_6 &= 0 \end{aligned}$$

### Elimination: Was bleibt übrig?

Einen Strom wirft man heraus, indem man die zwei Gleichungen addiert, in denen er vorkommt. Er steht dort einmal mit $+$ und einmal mit $-$.

**$I_6$ eliminieren:** $I_6$ steht in A mit $+$ und in D mit $-$. Also A + D:

$$\begin{aligned} (I_4 + I_6 - I_5) + (I_3 - I_1 - I_6) &= 0 \\ I_4 - I_5 + I_3 - I_1 &= 0 \quad (E_1) \end{aligned}$$

**$I_5$ eliminieren:** $I_5$ steht in $E_1$ mit $-$ und in C mit $+$. Also $E_1$ + C:

$$\begin{aligned} (I_4 - I_5 + I_3 - I_1) + (I_5 - I_2 - I_3) &= 0 \\ I_4 - I_1 - I_2 &= 0 \quad (E_2) \end{aligned}$$

**$I_4$ eliminieren:** $I_4$ steht in $E_2$ mit $+$ und in B mit $-$. Also $E_2$ + B:

$$(I_4 - I_1 - I_2) + (I_1 + I_2 - I_4) = 0 \quad\Rightarrow\quad 0 = 0$$

### Was das bedeutet

Zusammen liefern alle vier Gleichungen nichts Neues mehr, nur noch $0 = 0$. **Eine von ihnen folgt also aus den anderen drei.** Egal welche man weglässt, die übrigen drei enthalten dieselbe Information.

Dass die übrigen drei wirklich unabhängig sind, sieht man so: Lässt man A weg, hat jede der übrigen Gleichungen einen Strom, den nur sie enthält. In B steht $I_4$, in C steht $I_5$, in D steht $I_6$. Keine kann also aus den anderen beiden folgen.

::: merke Allgemein
Jeder Zweig verbindet genau zwei Knoten. Jeder Zweigstrom kommt deshalb in genau zwei Knotengleichungen vor, einmal mit $+$ und einmal mit $-$. Die Summe aller Knotengleichungen ist immer $0 = 0$.

Unabhängige Knotengleichungen:

$$k - 1 = 4 - 1 = 3$$
:::

### Folge für die Unbekannten

Mit den drei unabhängigen Gleichungen (B, C, D) drückt man drei Ströme durch die anderen aus:

$$\begin{aligned} I_4 &= I_1 + I_2 \\ I_5 &= I_2 + I_3 \\ I_6 &= I_3 - I_1 \end{aligned}$$

Probe mit der weggelassenen Gleichung A: $I_4 + I_6 = I_1 + I_2 + I_3 - I_1 = I_2 + I_3 = I_5$ ✓

Frei bleiben $I_1$, $I_2$ und $I_3$. Für sechs Unbekannte fehlen also noch $z - (k - 1) = 3$ Gleichungen. Die liefern die Maschen.

## Teil (ii): Maschengleichungen

Alle Maschen werden **im Uhrzeigersinn** umlaufen. Für jedes Bauteil vergleicht man seinen Spannungspfeil mit der Umlaufrichtung: Pfeil in Umlaufrichtung zählt $+$, Pfeil dagegen zählt $-$. In den Tabellen stehen die Richtungen so, wie man sie im Bild sieht: ↑ nach oben, ↓ nach unten, ← nach links, → nach rechts.

<figure class="dia"><svg viewBox="0 0 360 262" role="img" aria-label="Dieselbe Schaltung mit den drei Fenstermaschen M1 links unten, M2 rechts unten und M3 oben, alle im Uhrzeigersinn.">
<defs><marker id="ks-a3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<rect class="hl" x="60" y="110" width="120" height="130" opacity=".5"/>
<path class="s" d="M60 110V40H300V110M60 110H300M60 110V240H300V110M180 110V240"/>
<rect class="b" x="100" y="33" width="40" height="14"/><rect class="b" x="100" y="103" width="40" height="14"/><rect class="b" x="220" y="103" width="40" height="14"/>
<rect class="b" x="53" y="127" width="14" height="36"/><rect class="b" x="173" y="157" width="14" height="36"/><rect class="b" x="293" y="182" width="14" height="36"/>
<circle class="b" cx="230" cy="40" r="12"/><path class="s" d="M218 40H242"/>
<circle class="b" cx="60" cy="200" r="12"/><path class="s" d="M60 188V212"/>
<circle class="b" cx="300" cy="145" r="12"/><path class="s" d="M300 133V157"/>
<circle class="f" cx="60" cy="110" r="3.5"/><circle class="f" cx="180" cy="110" r="3.5"/><circle class="f" cx="300" cy="110" r="3.5"/><circle class="f" cx="180" cy="240" r="3.5"/>
<text x="48" y="114" text-anchor="end">B</text><text class="c" x="180" y="100">A</text><text x="312" y="106">D</text><text class="c" x="180" y="257">C</text>
<path class="s" d="M106.8 182.8A14 14 0 1 1 113 190.1" marker-end="url(#ks-a3)"/><text class="k c" x="120" y="182">M1</text>
<path class="s" d="M226.8 182.8A14 14 0 1 1 233 190.1" marker-end="url(#ks-a3)"/><text class="k c" x="240" y="182">M2</text>
<path class="s" d="M166.8 70.8A14 14 0 1 1 173 78.1" marker-end="url(#ks-a3)"/><text class="k c" x="180" y="70">M3</text>
<text class="k c" x="120" y="27">R<tspan dy="3" font-size="8">1</tspan></text><text class="k c" x="230" y="22">U<tspan dy="3" font-size="8">q1</tspan></text>
<text class="k c" x="120" y="98">R<tspan dy="3" font-size="8">4</tspan></text><text class="k c" x="240" y="98">R<tspan dy="3" font-size="8">6</tspan></text>
<text class="k" x="46" y="149" text-anchor="end">R<tspan dy="3" font-size="8">2</tspan></text><text class="k" x="46" y="204" text-anchor="end">U<tspan dy="3" font-size="8">q2</tspan></text>
<text class="k" x="194" y="179">R<tspan dy="3" font-size="8">5</tspan></text>
<text class="k" x="318" y="149">U<tspan dy="3" font-size="8">q3</tspan></text><text class="k" x="314" y="204">R<tspan dy="3" font-size="8">3</tspan></text>
</svg><figcaption>Die drei Fenster M1 (links unten, hier markiert), M2 (rechts unten) und M3 (oben), alle im Uhrzeigersinn. Pfeilrichtungen wie im Bild davor.</figcaption></figure>

### Masche M1: linkes unteres Fenster, B → A → C → B

Oben nach rechts über $R_4$, rechts hinunter über $R_5$, links hinauf über $U_{q2}$ und $R_2$:

| Bauteil | Pfeil | Umlauf | Beitrag |
|:---|:---:|:---:|:---:|
| $R_4$ | → | → | $+U_4$ |
| $R_5$ | ↓ | ↓ | $+U_5$ |
| $U_{q2}$ | ↓ | ↑ | $-U_{q2}$ |
| $R_2$ | ↑ | ↑ | $+U_2$ |

$$U_2 + U_4 + U_5 - U_{q2} = 0$$

### Masche M2: rechtes unteres Fenster, A → D → C → A

Oben nach rechts über $R_6$, rechts hinunter über $U_{q3}$ und $R_3$, links hinauf über $R_5$:

| Bauteil | Pfeil | Umlauf | Beitrag |
|:---|:---:|:---:|:---:|
| $R_6$ | ← | → | $-U_6$ |
| $U_{q3}$ | ↓ | ↓ | $+U_{q3}$ |
| $R_3$ | ↑ | ↓ | $-U_3$ |
| $R_5$ | ↓ | ↑ | $-U_5$ |

$$U_{q3} - U_3 - U_5 - U_6 = 0$$

### Masche M3: oberes Fenster, B → D → A → B

Oben nach rechts über $R_1$ und $U_{q1}$, dann unten zurück nach links über $R_6$ und $R_4$:

| Bauteil | Pfeil | Umlauf | Beitrag |
|:---|:---:|:---:|:---:|
| $R_1$ | ← | → | $-U_1$ |
| $U_{q1}$ | → | → | $+U_{q1}$ |
| $R_6$ | ← | ← | $+U_6$ |
| $R_4$ | → | ← | $-U_4$ |

$$U_{q1} - U_1 + U_6 - U_4 = 0$$

::: tipp So macht man keine Vorzeichenfehler
Nicht im Kopf rechnen, sondern für jedes Bauteil kurz notieren: Wohin zeigt der Pfeil, wohin läuft der Umlauf? Gleich heißt $+$, entgegen heißt $-$. Die Stromrichtung spielt dabei keine Rolle, nur der Spannungspfeil.
:::

### Gibt es eine vierte unabhängige Masche?

Die einzige weitere Masche ist die **Außenmasche** M4, einmal ganz außen herum über $R_1$, $U_{q1}$, $U_{q3}$, $R_3$, $U_{q2}$ und $R_2$:

$$-U_1 + U_{q1} + U_{q3} - U_3 - U_{q2} + U_2 = 0$$

Ist sie neu? Dazu addiert man die drei Fenster Term für Term:

$$\begin{aligned} &(U_2 + U_4 + U_5 - U_{q2}) \\ &+ (U_{q3} - U_3 - U_5 - U_6) \\ &+ (U_{q1} - U_1 + U_6 - U_4) = 0 \end{aligned}$$

$U_4$, $U_5$ und $U_6$ kommen je einmal mit $+$ und einmal mit $-$ vor und heben sich weg. Übrig bleibt

$$U_2 - U_{q2} + U_{q3} - U_3 + U_{q1} - U_1 = 0$$

Das ist genau M4. Also gilt $M_4 = M_1 + M_2 + M_3$, und **eine vierte unabhängige Masche gibt es nicht.**

::: merke Allgemein
Jeder innere Zweig grenzt an zwei Fenster. Bei gleichem Umlaufsinn laufen die beiden Fenster ihn gegensinnig ab, seine Spannung hebt sich in der Summe weg. Übrig bleibt der Rand, also die Außenmasche. Jede andere Masche lässt sich genauso aus Fenstern zusammensetzen.

Unabhängige Maschengleichungen:

$$z - (k - 1) = 6 - 3 = 3$$
:::

Dass die drei Fenster untereinander unabhängig sind, zeigt dasselbe Argument wie bei den Knoten: Jedes Fenster enthält einen Zweig, den kein anderes Fenster hat. M1 hat den linken Zweig, M2 den rechten, M3 den oberen.

## Gesamtbild

Knoten und Maschen liefern zusammen genau so viele unabhängige Gleichungen, wie es Zweigströme gibt:

| | Anzahl |
|:---|---:|
| Knotengleichungen $k - 1$ | 3 |
| Maschengleichungen $z - k + 1$ | 3 |
| **zusammen** | **6 = z** |

::: merke Merksätze
**Knoten:** Eine Knotengleichung ist immer überflüssig. Der Strom, der alle anderen Knoten verlässt, muss im letzten ankommen.

**Maschen:** Fenster sind die Bausteine aller Maschen. Jede größere Masche ist eine Summe von Fenstern, bei der sich die Innenwände wegheben.

**Elimination:** Einen Strom wirft man heraus, indem man die zwei Knotengleichungen addiert, in denen er vorkommt.
:::

## Mit Zahlen: Reichen die sechs Gleichungen wirklich?

Die Aufgabe kommt ohne Werte aus. Mit Zahlen sieht man aber, dass die drei Knoten- und drei Maschengleichungen die Schaltung vollständig festlegen.

::: aufgabe Die Schaltung ausrechnen
Alle sechs Widerstände haben $1\,\Omega$, und es ist $U_{q1} = 2\,\mathrm{V}$, $U_{q2} = U_{q3} = 10\,\mathrm{V}$. Berechne alle sechs Zweigströme.
???
**Ohm einsetzen.** Mit $U_j = R_j I_j = I_j$ (in Ω, V, A) und den Knotengleichungen $I_4 = I_1 + I_2$, $I_5 = I_2 + I_3$, $I_6 = I_3 - I_1$ werden die Maschen zu:

$$\begin{aligned} \text{M1:} \quad I_2 + (I_1 + I_2) + (I_2 + I_3) &= 10 \\ \text{M2:} \quad I_3 + (I_2 + I_3) + (I_3 - I_1) &= 10 \\ \text{M3:} \quad I_1 + (I_1 + I_2) - (I_3 - I_1) &= 2 \end{aligned}$$

Zusammengefasst:

$$\begin{aligned} \text{M1:} \quad I_1 + 3I_2 + I_3 &= 10 \\ \text{M2:} \quad -I_1 + I_2 + 3I_3 &= 10 \\ \text{M3:} \quad 3I_1 + I_2 - I_3 &= 2 \end{aligned}$$

**Lösen.** M2 + M3 ergibt $2I_1 + 2I_2 + 2I_3 = 12$, also $I_1 + I_2 + I_3 = 6$. Das von M1 abgezogen:

$$2I_2 = 4 \quad\Rightarrow\quad I_2 = 2\,\mathrm{A}$$

In M3: $3I_1 + 2 - I_3 = 2$, also $I_3 = 3I_1$. In $I_1 + I_2 + I_3 = 6$:

$$I_1 + 2 + 3I_1 = 6 \quad\Rightarrow\quad I_1 = 1\,\mathrm{A}, \quad I_3 = 3\,\mathrm{A}$$

**Rest aus den Knoten:**

| Strom | Wert |
|:---|---:|
| $I_1$ | $1\,\mathrm{A}$ |
| $I_2$ | $2\,\mathrm{A}$ |
| $I_3$ | $3\,\mathrm{A}$ |
| $I_4 = I_1 + I_2$ | $3\,\mathrm{A}$ |
| $I_5 = I_2 + I_3$ | $5\,\mathrm{A}$ |
| $I_6 = I_3 - I_1$ | $2\,\mathrm{A}$ |

**Proben:**

- Knoten A (nicht benutzt): $I_4 + I_6 = 5\,\mathrm{A} = I_5$ ✓
- Außenmasche M4 (nicht benutzt): $-1 + 2 + 10 - 3 - 10 + 2 = 0$ ✓
- Leistung: Die Quellen geben $2 \cdot 1 + 10 \cdot 2 + 10 \cdot 3 = 52\,\mathrm{W}$ ab, die Widerstände nehmen $1 + 4 + 9 + 9 + 25 + 4 = 52\,\mathrm{W}$ auf ✓
:::

::: tipp Ein Blick nach vorn
Die freien Ströme $I_1$, $I_2$, $I_3$ sind genau die Ströme in den Außenzweigen, und jeder davon gehört zu genau einem Fenster. Man hätte also gleich mit drei Unbekannten starten können, eine pro Fenster. Dieses Vorgehen heißt **Maschenstromverfahren** und kommt in ET1 noch ausführlich.
:::

## Typische Fehler

::: achtung
- **Alle vier Knotengleichungen ins System gesteckt.** Eine ist überflüssig, dafür fehlt dann eine Maschengleichung, und das System lässt sich nicht eindeutig lösen.
- **Die Außenmasche zusätzlich zu den drei Fenstern benutzt.** Sie ist ihre Summe und bringt nichts Neues.
- **Vorzeichen nach dem Strom statt nach dem Spannungspfeil bestimmt.** In der Maschengleichung zählt nur der Spannungspfeil gegen den Umlaufsinn.
- **Umlaufsinn in einer Masche gewechselt.** Einmal im Uhrzeigersinn heißt: für alle Bauteile dieser Masche.
- **Quellenspannung mit dem falschen Pol gelesen.** Erst nachsehen, wo das Plus steht, dann den Pfeil von $+$ nach $-$ zeichnen.
:::
