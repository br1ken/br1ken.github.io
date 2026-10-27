---
titel: Ersatzspannungs- und Ersatzstromquelle — Thévenin und Norton mit Knotengleichungen
datum: 2026-10-27
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.3
tags: [Ersatzspannungsquelle, Ersatzstromquelle, Thévenin, Norton, Knotengleichung, Innenwiderstand]
teaser: Aufgabe 3.3 Schritt für Schritt: Innenwiderstand mit deaktivierten Quellen, Quellenspannung im Leerlauf, Quellenstrom im Kurzschluss. Jeweils mit einer Knotengleichung, jeder Umformungsschritt ausgeschrieben.
welle: rechteck
---

Das Netzwerk hinter den Klemmen A und B wird durch eine [[Ersatzquelle|ersatzquelle]] ersetzt: einmal als Ersatzspannungsquelle (Thévenin), einmal als [[Ersatzstromquelle|ersatzstromquelle]] (Norton).

## Die Aufgabe

<figure class="dia"><svg viewBox="0 0 360 232" role="img" aria-label="Bild 1: Die Schaltung. Links ein Zweig mit Spannungsquelle U_q1, Plus oben, und R1 nach unten zum Bezugsknoten. Oben R4 zum Knoten K. Von K nach unten ein Zweig mit U_q2, Plus oben, und R2. Daneben ein Zweig mit Stromquelle I_q3, Pfeil nach oben, und R3. Von K über R5 zur Klemme A. Die untere Leitung ist der Bezugsknoten und Klemme B. U_AB zeigt von A nach B.">
<defs><marker id="aq-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M46 75V40H82M122 40H252M292 40H302.5M46 105V125M46 165V200H302.5M160 40V75M160 105V125M160 165V200M226 40V75M226 105V125M226 165V200"/>
<circle class="b" cx="46" cy="90" r="15"/><path class="s" d="M46 75V105"/>
<circle class="b" cx="160" cy="90" r="15"/><path class="s" d="M160 75V105"/>
<circle class="b" cx="226" cy="90" r="15"/><path class="s" d="M211 90H241"/>
<rect class="b" x="82" y="32" width="40" height="16"/><rect class="b" x="252" y="32" width="40" height="16"/>
<rect class="b" x="38" y="125" width="16" height="40"/><rect class="b" x="152" y="125" width="16" height="40"/><rect class="b" x="218" y="125" width="16" height="40"/>
<circle class="f" cx="160" cy="40" r="3"/><circle class="f" cx="226" cy="40" r="3"/><circle class="f" cx="160" cy="200" r="3"/><circle class="f" cx="226" cy="200" r="3"/>
<circle class="b" cx="306" cy="40" r="3.5"/><circle class="b" cx="306" cy="200" r="3.5"/>
<text class="c" x="102" y="24">R<tspan dy="3" font-size="9">4</tspan></text><text class="c" x="272" y="24">R<tspan dy="3" font-size="9">5</tspan></text>
<text class="c" x="193" y="30" font-weight="700">K</text><text class="c" x="306" y="26">A</text><text class="c" x="306" y="222">B</text>
<text x="32" y="149" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="146" y="149" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text><text x="242" y="149">R<tspan dy="3" font-size="9">3</tspan></text>
<text x="56" y="74">+</text><text x="170" y="74">+</text>
<path class="s" d="M70 78V102" marker-end="url(#aq-a1)"/><text x="76" y="94">U<tspan dy="3" font-size="9">q1</tspan></text>
<path class="s" d="M136 78V102" marker-end="url(#aq-a1)"/><text x="130" y="94" text-anchor="end">U<tspan dy="3" font-size="9">q2</tspan></text>
<path class="s" d="M250 102V78" marker-end="url(#aq-a1)"/><text x="256" y="94">I<tspan dy="3" font-size="9">q3</tspan></text>
<path class="f" d="M46 178l-5 9h10z"/><text x="36" y="188" text-anchor="end">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="f" d="M160 188l-5 -9h10z"/><text x="168" y="188">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M326 48V192" marker-end="url(#aq-a1)"/><text x="331" y="124">U<tspan dy="3" font-size="9">AB</tspan></text>
<text class="k" x="60" y="220">BEZUGSKNOTEN 0 V</text>
</svg><figcaption>Bild 1: die Schaltung. Kreis mit Strich längs: Spannungsquelle. Kreis mit Strich quer: Stromquelle. Die Dreiecke sind die gewählten Stromrichtungen, die untere Leitung ist der Bezugsknoten mit 0 V.</figcaption></figure>

Gesucht ist, von den Klemmen A und B aus gesehen:

1. **(i)** die Ersatzspannungsquelle: $U_q$ und $R_i$,
2. **(ii)** die Ersatzstromquelle: $I_q$ und $R_i'$.

## 0. Das Wesen

- Von den Klemmen A–B aus gesehen ist die Schaltung eine Black Box.
- Eine lineare Black Box zeigt nach außen nur eine Gerade im $U$-$I$-Diagramm.
- Eine Gerade ist durch zwei Punkte festgelegt.
- [[Leerlauf|leerlauf-kurzschluss]]: $I = 0 \;\Rightarrow\; U = U_q$.
- Kurzschluss: $U = 0 \;\Rightarrow\; I = I_q$.
- Dazwischen fällt die Gerade $U = U_q - R_i\,I$ mit der Steigung $-R_i$. Der Innenwiderstand ist also $R_i = \dfrac{U_q}{I_q}$.

## 1. Vorbemerkung: $R_3$ ist wirkungslos

- $R_3$ liegt in Reihe mit der idealen Stromquelle $I_{q3}$.
- Der Strom in diesem Zweig ist immer $I_{q3}$, unabhängig von $R_3$.
- Beim Deaktivieren wird $I_{q3}$ zur Unterbrechung, dann hängt $R_3$ ins Leere.
- $R_3$ taucht daher weder in $R_i$ noch in $U_q$ noch in $I_q$ auf.

## 2. (i) Innenwiderstand $R_i$

<figure class="dia"><svg viewBox="0 0 360 236" role="img" aria-label="Bild 2: Quellen deaktiviert. Die beiden Spannungsquellen sind durch dicke Drähte ersetzt, der Stromquellenzweig ist offen und mit R3 grau gestrichelt. Hinterlegt sind R1, R4 und R2, die zusammen R_p bilden. An den Klemmen ein Ohmmeter.">
<path class="hl" d="M22 18H184V212H22Z"/>
<path class="s" d="M46 40H82M122 40H226M226 40H252M292 40H302.5M46 40V125M46 165V200H302.5M160 40V125M160 165V200"/>
<path class="s" d="M46 75V105M160 75V105" style="stroke-width:3"/>
<path class="m d" d="M226 40V76M226 104V125M226 165V200"/><rect class="m d" x="218" y="125" width="16" height="40"/>
<rect class="b" x="82" y="32" width="40" height="16"/><rect class="b" x="252" y="32" width="40" height="16"/>
<rect class="b" x="38" y="125" width="16" height="40"/><rect class="b" x="152" y="125" width="16" height="40"/>
<circle class="f" cx="160" cy="40" r="3"/><circle class="f" cx="160" cy="200" r="3"/>
<circle class="b" cx="306" cy="40" r="3.5"/><circle class="b" cx="306" cy="200" r="3.5"/>
<text class="c" x="102" y="24">R<tspan dy="3" font-size="9">4</tspan></text><text class="c" x="272" y="24">R<tspan dy="3" font-size="9">5</tspan></text>
<text x="32" y="149" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="146" y="149" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text><text class="k" x="242" y="149">R<tspan dy="3" font-size="8">3</tspan></text>
<text x="56" y="86">U<tspan dy="3" font-size="9">q1</tspan></text><text x="56" y="104">= 0</text><text x="150" y="86" text-anchor="end">U<tspan dy="3" font-size="9">q2</tspan></text><text x="150" y="104" text-anchor="end">= 0</text>
<text class="k" x="236" y="94">OFFEN</text>
<path class="s" d="M309.5 40H334V77M334 103V200H309.5"/><circle class="b" cx="334" cy="90" r="13"/><text class="c" x="334" y="95">Ω</text>
<text x="318" y="124" text-anchor="end">R<tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> = ?</tspan></text>
<text class="k" x="30" y="228">HINTERLEGT: R<tspan dy="3" font-size="8">p</tspan><tspan dy="-3"> = R</tspan><tspan dy="3" font-size="8">2</tspan><tspan dy="-3"> || (R</tspan><tspan dy="3" font-size="8">1</tspan><tspan dy="-3"> + R</tspan><tspan dy="3" font-size="8">4</tspan><tspan dy="-3">)</tspan></text>
</svg><figcaption>Bild 2: alle Quellen deaktiviert. Spannungsquellen sind Drähte, der Stromquellenzweig ist offen. Was übrig bleibt, misst ein Ohmmeter an den Klemmen.</figcaption></figure>

**Quellen deaktivieren**

- Ideale Spannungsquellen werden durch Kurzschlüsse ersetzt: $U_{q1} \to 0$, $U_{q2} \to 0$.
- Ideale Stromquellen werden durch Unterbrechungen ersetzt: $I_{q3} \to$ offen.

**Von A–B in die Schaltung schauen**

- Zwischen $K$ und Bezug liegen $R_1 + R_4$ und $R_2$ parallel.
- Dazu liegt $R_5$ in Reihe.

$$R_i = R_5 + R_2 \parallel (R_1 + R_4)$$

**Parallelschaltung ausgeschrieben**

Abkürzung: $R_p = R_2 \parallel (R_1 + R_4)$.

::: merke Innenwiderstand
$$R_p = \frac{(R_1 + R_4)\,R_2}{R_1 + R_2 + R_4} \qquad R_i = R_5 + R_p$$
:::

## 3. (i) Quellenspannung $U_q$ im Leerlauf

<figure class="dia"><svg viewBox="0 0 360 232" role="img" aria-label="Bild 3: Leerlauf. Dieselbe Schaltung mit offenen Klemmen. Durch R5 fließt kein Strom. Eingezeichnet sind die Spannungen U_R1 nach oben, U_R4 nach rechts und U_R2 nach unten, die Ströme I1 nach oben, I2 nach unten und I_q3 nach oben, und U_AB gleich U_K.">
<defs><marker id="aq-l1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M46 75V40H82M122 40H252M292 40H302.5M46 105V125M46 165V200H302.5M160 40V75M160 105V125M160 165V200M226 40V75M226 105V125M226 165V200"/>
<circle class="b" cx="46" cy="90" r="15"/><path class="s" d="M46 75V105"/>
<circle class="b" cx="160" cy="90" r="15"/><path class="s" d="M160 75V105"/>
<circle class="b" cx="226" cy="90" r="15"/><path class="s" d="M211 90H241"/>
<rect class="b" x="82" y="32" width="40" height="16"/><rect class="b" x="252" y="32" width="40" height="16"/>
<rect class="b" x="38" y="125" width="16" height="40"/><rect class="b" x="152" y="125" width="16" height="40"/><rect class="b" x="218" y="125" width="16" height="40"/>
<circle class="f" cx="160" cy="40" r="3"/><circle class="f" cx="226" cy="40" r="3"/><circle class="f" cx="160" cy="200" r="3"/><circle class="f" cx="226" cy="200" r="3"/>
<circle class="b" cx="306" cy="40" r="3.5"/><circle class="b" cx="306" cy="200" r="3.5"/>
<text class="c" x="102" y="24">R<tspan dy="3" font-size="9">4</tspan></text><text class="c" x="272" y="24">R<tspan dy="3" font-size="9">5</tspan></text>
<text class="c" x="193" y="30" font-weight="700">K</text><text class="c" x="306" y="26">A</text><text class="c" x="306" y="222">B</text>
<text x="32" y="149" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="174" y="149">R<tspan dy="3" font-size="9">2</tspan></text><text x="242" y="149">R<tspan dy="3" font-size="9">3</tspan></text>
<text x="56" y="74">+</text><text x="170" y="74">+</text>
<path class="s" d="M70 78V102" marker-end="url(#aq-l1)"/><text x="76" y="94">U<tspan dy="3" font-size="9">q1</tspan></text>
<path class="s" d="M136 78V102" marker-end="url(#aq-l1)"/><text x="130" y="94" text-anchor="end">U<tspan dy="3" font-size="9">q2</tspan></text>
<path class="s" d="M250 102V78" marker-end="url(#aq-l1)"/><text x="256" y="94">I<tspan dy="3" font-size="9">q3</tspan></text>
<path class="f" d="M46 178l-5 9h10z"/><text x="36" y="188" text-anchor="end">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="f" d="M160 188l-5 -9h10z"/><text x="168" y="188">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M326 48V192" marker-end="url(#aq-l1)"/><text x="331" y="124">U<tspan dy="3" font-size="9">AB</tspan></text>
<path class="s" d="M88 60H116" marker-end="url(#aq-l1)"/><text class="c" x="102" y="76">U<tspan dy="3" font-size="9">R4</tspan></text>
<path class="s" d="M70 160V130" marker-end="url(#aq-l1)"/><text x="76" y="149">U<tspan dy="3" font-size="9">R1</tspan></text>
<path class="s" d="M136 130V160" marker-end="url(#aq-l1)"/><text x="130" y="149" text-anchor="end">U<tspan dy="3" font-size="9">R2</tspan></text>
<text class="k c" x="272" y="72">I = 0</text>
<text class="k" x="60" y="220">BEZUGSKNOTEN 0 V</text>
</svg><figcaption>Bild 3: Leerlauf. An den Widerständen Verbraucherzählpfeile, also in Stromrichtung. Durch R<sub>5</sub> fließt nichts, deshalb ist U<sub>AB</sub> = U<sub>K</sub>.</figcaption></figure>

**Leerlauf an A–B**

- An A–B hängt nichts, also fließt durch $R_5$ kein Strom.
- Ohne Strom fällt an $R_5$ keine Spannung ab.
- Damit gilt $U_{AB} = U_K$.
- Die Aufgabe reduziert sich auf: Welches Potential hat Knoten $K$?

$$U_q = U_{AB} = U_K$$

**[[Knotengleichung|knotenregel]] an K**

Stromrichtungen: $I_1$ nach oben in $K$ hinein, $I_2$ nach unten aus $K$ hinaus, $I_{q3}$ nach oben in $K$ hinein. Was hineinfließt, fließt hinaus:

$$I_1 + I_{q3} = I_2$$

**Variante: K als zwei Punkte angeschrieben**

Zwischen dem Punkt am $U_{q2}$-Zweig (links) und dem Punkt am $I_{q3}$-Zweig (rechts) fließe der Drahtstrom $I_x$ von links nach rechts. Über $R_5$ fließt im Leerlauf nichts ab. ($I_x$ ist nicht der Kurzschlussstrom $I_k$ von weiter unten.)

$$\begin{aligned} I_1 - I_2 - I_x &= 0 \\ I_x + I_{q3} &= 0 \end{aligned}$$

Beide Gleichungen addiert:

$$I_1 - I_2 + I_{q3} = 0$$

::: merke
Punkte, die nur durch einen idealen Draht verbunden sind, haben dasselbe Potential. Sie bilden einen einzigen Knoten.
:::

**Warum hier keine Maschenanalyse nötig ist**

- Es gibt nur einen unbekannten Knoten, nämlich $K$.
- Alle Zweige liegen zwischen $K$ und dem Bezugsknoten.
- Knotenweg: eine Unbekannte, eine Gleichung.
- Pro Zweig braucht man nur eine Zweiggleichung, die den Strom durch $U_K$ ausdrückt.

**Zweigströme durch $U_K$ ausdrücken**

Linker Zweig, vom Bezugsknoten nach oben bis $K$:

$$\begin{aligned} 0 - I_1 R_1 + U_{q1} - I_1 R_4 &= U_K \\ U_{q1} - I_1 (R_1 + R_4) &= U_K \\ I_1 (R_1 + R_4) &= U_{q1} - U_K \\ I_1 &= \frac{U_{q1} - U_K}{R_1 + R_4} \end{aligned}$$

Mittlerer Zweig, von $K$ nach unten zum Bezugsknoten:

$$\begin{aligned} U_K - U_{q2} - I_2 R_2 &= 0 \\ I_2 R_2 &= U_K - U_{q2} \\ I_2 &= \frac{U_K - U_{q2}}{R_2} \end{aligned}$$

**Eingesetzt in die Knotengleichung $I_1 - I_2 + I_{q3} = 0$**

$$\frac{U_{q1} - U_K}{R_1 + R_4} - \frac{U_K - U_{q2}}{R_2} + I_{q3} = 0$$

Eine Gleichung, eine Unbekannte.

### 3a. Auflösen nach $U_K$ über den Hauptnenner

**1. Ausgangsgleichung**

$$\frac{U_{q1} - U_K}{R_1 + R_4} - \frac{U_K - U_{q2}}{R_2} + I_{q3} = 0$$

**2. Hauptnenner bestimmen**

$$N = (R_1 + R_4)\,R_2$$

**3. Jeden Term auf den Hauptnenner erweitern**

Erster Bruch, mit $R_2$ erweitert:

$$\frac{U_{q1} - U_K}{R_1 + R_4} = \frac{(U_{q1} - U_K)\,R_2}{(R_1 + R_4)\,R_2}$$

Zweiter Bruch, mit $(R_1 + R_4)$ erweitert:

$$\frac{U_K - U_{q2}}{R_2} = \frac{(U_K - U_{q2})(R_1 + R_4)}{(R_1 + R_4)\,R_2}$$

Dritter Term, mit dem ganzen Nenner erweitert:

$$I_{q3} = \frac{I_{q3}\,(R_1 + R_4)\,R_2}{(R_1 + R_4)\,R_2}$$

**4. Alles auf einen Bruchstrich**

$$\frac{(U_{q1} - U_K)R_2 - (U_K - U_{q2})(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2}{(R_1 + R_4)\,R_2} = 0$$

**5. Ein Bruch ist null, wenn der Zähler null ist**

Der Nenner ist nie null, also:

$$(U_{q1} - U_K)R_2 - (U_K - U_{q2})(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2 = 0$$

**6. Erste Klammer ausmultiplizieren**

$$(U_{q1} - U_K)R_2 = U_{q1} R_2 - U_K R_2$$

**7. Zweite Klammer ausmultiplizieren, Minus davor beachten**

$$-(U_K - U_{q2})(R_1 + R_4) = -U_K (R_1 + R_4) + U_{q2} (R_1 + R_4)$$

**8. Eingesetzt**

$$U_{q1} R_2 - U_K R_2 - U_K (R_1 + R_4) + U_{q2} (R_1 + R_4) + I_{q3} (R_1 + R_4) R_2 = 0$$

**9. Die beiden $U_K$-Terme zusammenfassen**

$$-U_K R_2 - U_K (R_1 + R_4) = -U_K\,(R_1 + R_2 + R_4)$$

Also:

$$U_{q1} R_2 + U_{q2} (R_1 + R_4) + I_{q3} (R_1 + R_4) R_2 - U_K (R_1 + R_2 + R_4) = 0$$

**10. $U_K$-Term auf die andere Seite**

$$U_K (R_1 + R_2 + R_4) = U_{q1} R_2 + U_{q2} (R_1 + R_4) + I_{q3} (R_1 + R_4) R_2$$

**11. Durch $(R_1 + R_2 + R_4)$ dividieren**

::: merke Quellenspannung
$$U_q = U_K = \frac{U_{q1} R_2 + U_{q2}(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2}{R_1 + R_2 + R_4}$$
:::

### 3b. Umformen in die Lösungsform

**1. Ausgangspunkt**

$$U_K = \frac{U_{q1} R_2 + U_{q2}(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2}{R_1 + R_2 + R_4}$$

**2. Das Ziel kennen**

Die Parallelschaltung zweier Widerstände ist definiert als

$$R_a \parallel R_b = \frac{R_a\,R_b}{R_a + R_b}$$

Mit $R_a = R_1 + R_4$ und $R_b = R_2$:

$$R_2 \parallel (R_1 + R_4) = \frac{(R_1 + R_4)\,R_2}{R_1 + R_2 + R_4}$$

Der Nenner passt schon. Im Zähler fehlt in jedem Summanden der Faktor $(R_1 + R_4)R_2$.

**3. Erster Summand im Zähler, mit $\frac{R_1 + R_4}{R_1 + R_4} = 1$ multiplizieren**

$$U_{q1} R_2 = U_{q1} R_2 \cdot \frac{R_1 + R_4}{R_1 + R_4} = (R_1 + R_4)R_2 \cdot \frac{U_{q1}}{R_1 + R_4}$$

**4. Zweiter Summand im Zähler, mit $\frac{R_2}{R_2} = 1$ multiplizieren**

$$U_{q2}(R_1 + R_4) = U_{q2}(R_1 + R_4) \cdot \frac{R_2}{R_2} = (R_1 + R_4)R_2 \cdot \frac{U_{q2}}{R_2}$$

**5. Dritter Summand im Zähler, der Faktor steht schon da**

$$I_{q3}(R_1 + R_4)R_2 = (R_1 + R_4)R_2 \cdot I_{q3}$$

**6. Zähler eingesetzt**

$$U_K = \frac{(R_1 + R_4)R_2 \cdot \frac{U_{q1}}{R_1 + R_4} + (R_1 + R_4)R_2 \cdot \frac{U_{q2}}{R_2} + (R_1 + R_4)R_2 \cdot I_{q3}}{R_1 + R_2 + R_4}$$

**7. Gemeinsamen Faktor im Zähler herausheben**

$$U_K = \frac{(R_1 + R_4)R_2 \cdot \left( \frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} \right)}{R_1 + R_2 + R_4}$$

**8. Den Bruch aufteilen**

$$U_K = \frac{(R_1 + R_4)R_2}{R_1 + R_2 + R_4} \cdot \left( \frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} \right)$$

**9. Der erste Faktor ist die Parallelschaltung aus Schritt 2**

::: merke Lösungsform
$$U_q = \bigl(R_2 \parallel (R_1 + R_4)\bigr) \left( \frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} \right)$$
:::

**Vorzeichen von $I_{q3}$**

- In Bild 1 fließt $I_{q3}$ in $K$ hinein, dafür gilt $+I_{q3}$.
- Fließt $I_{q3}$ aus $K$ heraus, wird daraus $-I_{q3}$.
- Genauso bei den Spannungsquellen: Liegt das $+$ von $U_{q1}$ oder $U_{q2}$ auf der Seite des Bezugsknotens, dreht sich ihr Vorzeichen.

## 4. (ii) Ersatzstromquelle: Kurzschluss an A–B

<figure class="dia"><svg viewBox="0 0 360 232" role="img" aria-label="Bild 4: Kurzschluss. Dieselbe Schaltung, die Klemmen A und B sind mit einem dicken Draht verbunden. Durch R5 und den Draht fließt I_k nach unten. Die Knotenspannung heißt jetzt U'_K.">
<defs><marker id="aq-a3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M46 75V40H82M122 40H252M292 40H302.5M46 105V125M46 165V200H302.5M160 40V75M160 105V125M160 165V200M226 40V75M226 105V125M226 165V200"/>
<path class="s" d="M309.5 40H322V200H309.5" style="stroke-width:3"/>
<circle class="b" cx="46" cy="90" r="15"/><path class="s" d="M46 75V105"/>
<circle class="b" cx="160" cy="90" r="15"/><path class="s" d="M160 75V105"/>
<circle class="b" cx="226" cy="90" r="15"/><path class="s" d="M211 90H241"/>
<rect class="b" x="82" y="32" width="40" height="16"/><rect class="b" x="252" y="32" width="40" height="16"/>
<rect class="b" x="38" y="125" width="16" height="40"/><rect class="b" x="152" y="125" width="16" height="40"/><rect class="b" x="218" y="125" width="16" height="40"/>
<circle class="f" cx="160" cy="40" r="3"/><circle class="f" cx="226" cy="40" r="3"/><circle class="f" cx="160" cy="200" r="3"/><circle class="f" cx="226" cy="200" r="3"/>
<circle class="b" cx="306" cy="40" r="3.5"/><circle class="b" cx="306" cy="200" r="3.5"/>
<text class="c" x="102" y="24">R<tspan dy="3" font-size="9">4</tspan></text><text class="c" x="272" y="24">R<tspan dy="3" font-size="9">5</tspan></text>
<text class="c" x="193" y="30" font-weight="700">K</text><text class="c" x="306" y="26">A</text><text class="c" x="306" y="222">B</text>
<text x="32" y="149" text-anchor="end">R<tspan dy="3" font-size="9">1</tspan></text><text x="174" y="149">R<tspan dy="3" font-size="9">2</tspan></text><text x="242" y="149">R<tspan dy="3" font-size="9">3</tspan></text>
<text x="56" y="74">+</text><text x="170" y="74">+</text>
<path class="s" d="M70 78V102" marker-end="url(#aq-a3)"/><text x="76" y="94">U<tspan dy="3" font-size="9">q1</tspan></text>
<path class="s" d="M136 78V102" marker-end="url(#aq-a3)"/><text x="130" y="94" text-anchor="end">U<tspan dy="3" font-size="9">q2</tspan></text>
<path class="s" d="M250 102V78" marker-end="url(#aq-a3)"/><text x="256" y="94">I<tspan dy="3" font-size="9">q3</tspan></text>
<path class="f" d="M46 178l-5 9h10z"/><text x="36" y="188" text-anchor="end">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="f" d="M160 188l-5 -9h10z"/><text x="168" y="188">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M193 50V192" marker-end="url(#aq-a3)"/><text x="197" y="122">U′<tspan dy="3" font-size="9">K</tspan></text>
<path class="f" d="M322 128l-5 -9h10z"/><text x="328" y="128">I<tspan dy="3" font-size="9">k</tspan></text>
<path class="s" d="M88 60H116" marker-end="url(#aq-a3)"/><text class="c" x="102" y="76">U<tspan dy="3" font-size="9">R4</tspan></text>
<path class="s" d="M70 160V130" marker-end="url(#aq-a3)"/><text x="76" y="149">U<tspan dy="3" font-size="9">R1</tspan></text>
<path class="s" d="M136 130V160" marker-end="url(#aq-a3)"/><text x="130" y="149" text-anchor="end">U<tspan dy="3" font-size="9">R2</tspan></text>
<path class="s" d="M258 60H286" marker-end="url(#aq-a3)"/><text class="c" x="272" y="76">U<tspan dy="3" font-size="9">R5</tspan></text>
<text class="k" x="60" y="220">BEZUGSKNOTEN 0 V</text>
</svg><figcaption>Bild 4: Kurzschluss. Der dicke Draht verbindet A und B. Jetzt fließt durch R<sub>5</sub> der Kurzschlussstrom I<sub>k</sub>, und die Knotenspannung bekommt einen Strich, weil sie eine andere ist als im Leerlauf.</figcaption></figure>

**Was sich gegenüber dem Leerlauf ändert**

- $K$ hat jetzt einen vierten Zweig: über $R_5$ und den Kurzschluss zum Bezugsknoten.
- Durch diesen Zweig fließt $I_k$, der gesuchte Ersatzquellenstrom: $I_q = I_k$.
- Die Knotenspannung ist nicht mehr dieselbe wie im Leerlauf. Sie heißt deshalb $U_K'$.
- Grund: belasteter Spannungsteiler. $R_5$ hängt jetzt als Last an $K$, Strom fließt ab, die Spannung an $K$ sinkt dem Betrag nach.

$$|U_K'| < |U_K| = |U_q| \qquad (\text{für } U_q \neq 0)$$

**Fahrplan des Verfahrens**

1. Die Klemmen A und B werden kurzgeschlossen.
2. Die unbekannte Knotenspannung wird festgelegt: $U_K'$ gegen den Bezugsknoten.
3. In jedem Zweig wird eine Stromrichtung festgelegt.
4. Am Knoten $K$ wird die Knotengleichung aufgestellt.
5. Jeder Zweigstrom wird durch $U_K'$ ausgedrückt.
6. Die Ströme werden eingesetzt und die Gleichung nach $U_K'$ aufgelöst.
7. Der Kurzschlussstrom folgt aus $I_k = U_K' / R_5$.

**Knotengleichung an K**

$$I_1 + I_{q3} = I_2 + I_5$$

bzw.

$$I_1 - I_2 - I_5 + I_{q3} = 0 \qquad \text{mit } I_5 = I_k$$

### 4a. Regeln für den Umlauf

Potential-Sicht, beim Entlanggehen:

- In Stromrichtung durch einen Widerstand: Das Potential sinkt um $I \cdot R$.
- Durch eine Spannungsquelle von $-$ nach $+$: Das Potential steigt um $U_q$.

Maschen-Sicht, mit Umlaufpfeil:

- Ein Spannungspfeil, der mit dem Umlauf zeigt, wird mit $+$ gezählt.
- Ein Spannungspfeil, der gegen den Umlauf zeigt, wird mit $-$ gezählt.
- Die Summe aller Spannungen in einer Masche ist null.
- Am idealen Kurzschlussdraht fällt keine Spannung ab.

Der Gang von $K$ bis zum Bezugsknoten ist selbst ein Maschenumlauf. Die Masche wird durch den Spannungspfeil $U_K'$ geschlossen. Das ist keine Maschenanalyse mit Maschenströmen: Jede Masche liefert nur die Zweiggleichung für einen Zweigstrom, genau wie der Potentialweg im Leerlauf, nur mit $U_K'$ statt $U_K$.

### 4b. Linke Masche: $I_1$

<figure class="dia"><svg viewBox="0 0 360 220" role="img" aria-label="Bild 5: Linke Masche. Links von unten nach oben R1 mit Strom I1 nach oben und U_R1 nach oben, darüber U_q1 mit Plus oben und Pfeil nach unten. Oben R4 mit U_R4 nach rechts bis K. Rechts der Spannungspfeil U'_K von K nach unten zum Bezug. In der Mitte ein Umlaufpfeil M im Uhrzeigersinn.">
<defs><marker id="aq-b1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M120 66V40H170M210 40H260M120 94V118M120 158V196H260"/>
<circle class="b" cx="120" cy="80" r="14"/><path class="s" d="M120 66V94"/>
<rect class="b" x="170" y="32" width="40" height="16"/><rect class="b" x="112" y="118" width="16" height="40"/>
<circle class="f" cx="260" cy="40" r="3"/><circle class="f" cx="260" cy="196" r="3"/>
<text class="c" x="260" y="28" font-weight="700">K</text><text class="k c" x="260" y="214">BEZUG</text>
<text class="c" x="190" y="64">R<tspan dy="3" font-size="9">4</tspan></text><text x="136" y="142">R<tspan dy="3" font-size="9">1</tspan></text>
<text x="130" y="62">+</text>
<path class="s" d="M96 68V92" marker-end="url(#aq-b1)"/><text x="90" y="84" text-anchor="end">U<tspan dy="3" font-size="9">q1</tspan></text>
<path class="s" d="M96 152V124" marker-end="url(#aq-b1)"/><text x="90" y="142" text-anchor="end">U<tspan dy="3" font-size="9">R1</tspan></text>
<path class="s" d="M176 18H204" marker-end="url(#aq-b1)"/><text x="210" y="22">U<tspan dy="3" font-size="9">R4</tspan></text>
<path class="f" d="M120 172l-5 9h10z"/><text x="130" y="182">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="s" d="M280 48V188" marker-end="url(#aq-b1)"/><text x="288" y="122">U′<tspan dy="3" font-size="9">K</tspan></text>
<path class="s" d="M176.8 122.8A14 14 0 1 1 183 130.1" marker-end="url(#aq-b1)"/><text class="c" x="190" y="123">M</text>
</svg><figcaption>Bild 5: linke Masche, Umlauf M im Uhrzeigersinn. An den Widerständen Verbraucherzählpfeile, also in Stromrichtung.</figcaption></figure>

**Maschengleichung**

$U_{R1}$, $U_{R4}$, $U_K'$ zeigen mit dem Umlauf, $U_{q1}$ dagegen:

$$U_{R1} - U_{q1} + U_{R4} + U_K' = 0$$

**Die drei anderen Terme nach rechts, jedes Vorzeichen dreht sich um**

$$U_K' = -U_{R1} + U_{q1} - U_{R4}$$

**Ohm einsetzen: $U_{R1} = I_1 R_1$, $U_{R4} = I_1 R_4$**

$$U_K' = U_{q1} - I_1 R_1 - I_1 R_4$$

**$I_1$ herausheben**

$$U_K' = U_{q1} - I_1 (R_1 + R_4)$$

**$I_1$-Term nach links, $U_K'$ nach rechts**

$$I_1 (R_1 + R_4) = U_{q1} - U_K'$$

**Durch $(R_1 + R_4)$ teilen**

$$I_1 = \frac{U_{q1} - U_K'}{R_1 + R_4}$$

Dieselbe Form wie im Leerlauf: Der linke Zweig weiß nicht, was rechts von $K$ passiert.

### 4c. Mittlere Masche: $I_2$

<figure class="dia"><svg viewBox="0 0 360 220" role="img" aria-label="Bild 6: Mittlere Masche. Von K nach unten U_q2 mit Plus oben und Pfeil nach unten, dann R2 mit U_R2 nach unten und Strom I2 nach unten zum Bezug. Rechts gestrichelt zurück, mit dem Spannungspfeil U'_K von K nach unten. Umlaufpfeil M gegen den Uhrzeigersinn.">
<defs><marker id="aq-c1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M180 40V66M180 94V118M180 158V196"/>
<path class="m d" d="M180 40H270M180 196H270"/>
<circle class="b" cx="180" cy="80" r="14"/><path class="s" d="M180 66V94"/>
<rect class="b" x="172" y="118" width="16" height="40"/>
<circle class="f" cx="180" cy="40" r="3"/><circle class="f" cx="180" cy="196" r="3"/>
<text class="c" x="180" y="28" font-weight="700">K</text><text class="k c" x="180" y="214">BEZUG</text>
<text x="196" y="142">R<tspan dy="3" font-size="9">2</tspan></text><text x="190" y="62">+</text>
<path class="s" d="M156 68V92" marker-end="url(#aq-c1)"/><text x="150" y="84" text-anchor="end">U<tspan dy="3" font-size="9">q2</tspan></text>
<path class="s" d="M156 124V152" marker-end="url(#aq-c1)"/><text x="150" y="142" text-anchor="end">U<tspan dy="3" font-size="9">R2</tspan></text>
<path class="f" d="M180 184l-5 -9h10z"/><text x="190" y="184">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M270 48V188" marker-end="url(#aq-c1)"/><text x="278" y="122">U′<tspan dy="3" font-size="9">K</tspan></text>
<path class="s" d="M238.2 122.8A14 14 0 1 0 232 130.1" marker-end="url(#aq-c1)"/><text class="c" x="225" y="123">M</text>
</svg><figcaption>Bild 6: mittlere Masche. Umlauf im Zweig nach unten, über U′<sub>K</sub> zurück nach oben, also gegen den Uhrzeigersinn.</figcaption></figure>

**Maschengleichung**

$U_{q2}$ und $U_{R2}$ zeigen mit dem Umlauf, $U_K'$ dagegen:

$$U_{q2} + U_{R2} - U_K' = 0$$

**Ohm einsetzen: $U_{R2} = I_2 R_2$**

$$U_{q2} + I_2 R_2 - U_K' = 0$$

**$I_2$-Term allein lassen**

$$I_2 R_2 = U_K' - U_{q2}$$

**Durch $R_2$ teilen**

$$I_2 = \frac{U_K' - U_{q2}}{R_2}$$

### 4d. Rechte Masche: $I_5 = I_k$

<figure class="dia"><svg viewBox="0 0 360 220" role="img" aria-label="Bild 7: Rechte Masche. Von K oben nach rechts R5 mit U_R5 und Strom I5 bis Klemme A. Ein dicker Kurzschlussdraht von A nach B, darin I5 nach unten. Unten von B zurück zum Bezug. Links der Spannungspfeil U'_K von K nach unten. Umlaufpfeil M im Uhrzeigersinn.">
<defs><marker id="aq-d1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M110 50H160M200 50H246.5M110 190H246.5"/>
<path class="s" d="M253.5 50H280V190H253.5" style="stroke-width:3"/>
<rect class="b" x="160" y="42" width="40" height="16"/>
<circle class="f" cx="110" cy="50" r="3"/><circle class="f" cx="110" cy="190" r="3"/>
<circle class="b" cx="250" cy="50" r="3.5"/><circle class="b" cx="250" cy="190" r="3.5"/>
<text class="c" x="110" y="38" font-weight="700">K</text><text class="k c" x="110" y="210">BEZUG</text>
<text class="c" x="250" y="38">A</text><text class="c" x="250" y="210">B</text>
<text class="c" x="180" y="78">R<tspan dy="3" font-size="9">5</tspan></text>
<path class="s" d="M166 28H194" marker-end="url(#aq-d1)"/><text x="200" y="32">U<tspan dy="3" font-size="9">R5</tspan></text>
<path class="f" d="M236 50l-9 -5v10z"/><text class="c" x="226" y="74">I<tspan dy="3" font-size="9">5</tspan></text>
<path class="f" d="M280 126l-5 -9h10z"/><text x="288" y="124">I<tspan dy="3" font-size="9">5</tspan></text><text class="k" x="288" y="146">DRAHT: 0 V</text>
<path class="s" d="M90 56V184" marker-end="url(#aq-d1)"/><text x="84" y="124" text-anchor="end">U′<tspan dy="3" font-size="9">K</tspan></text>
<path class="s" d="M166.8 124.8A14 14 0 1 1 173 132.1" marker-end="url(#aq-d1)"/><text class="c" x="180" y="125">M</text>
</svg><figcaption>Bild 7: rechte Masche, Umlauf im Uhrzeigersinn. Der Rest der Schaltung links ist weggelassen.</figcaption></figure>

**Umlauf, Pfeil für Pfeil**

- Oben durch $R_5$: $U_{R5}$ zeigt mit dem Umlauf, also $+U_{R5}$.
- Rechts über den Kurzschluss: idealer Draht, also $0$.
- Unten zurück: kein Bauteil, nichts.
- Links nach oben: $U_K'$ zeigt nach unten, also gegen den Umlauf, $-U_K'$.

**Maschengleichung**

$$U_{R5} + 0 - U_K' = 0$$

**Ohm einsetzen: $U_{R5} = I_5 R_5$**

$$I_5 R_5 = U_K'$$

**Durch $R_5$ teilen**

$$I_5 = I_k = \frac{U_K'}{R_5}$$

**Stromquelle**

$I_{q3}$ bleibt, wie er ist. Die Stromquelle gibt ihn vor.

## 5. Knotengleichung explizit nach $U_K'$

**1. Knotengleichung mit eingesetzten Strömen**

$$\frac{U_{q1} - U_K'}{R_1 + R_4} - \frac{U_K' - U_{q2}}{R_2} - \frac{U_K'}{R_5} + I_{q3} = 0$$

**2. Ersten Bruch aufspalten**

$$\frac{U_{q1} - U_K'}{R_1 + R_4} = \frac{U_{q1}}{R_1 + R_4} - \frac{U_K'}{R_1 + R_4}$$

**3. Zweiten Bruch aufspalten, Minus davor beachten**

$$-\frac{U_K' - U_{q2}}{R_2} = -\frac{U_K'}{R_2} + \frac{U_{q2}}{R_2}$$

**4. Eingesetzt**

$$\frac{U_{q1}}{R_1 + R_4} - \frac{U_K'}{R_1 + R_4} - \frac{U_K'}{R_2} + \frac{U_{q2}}{R_2} - \frac{U_K'}{R_5} + I_{q3} = 0$$

**5. Alle $U_K'$-Terme auf die rechte Seite**

$$\frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} = \frac{U_K'}{R_1 + R_4} + \frac{U_K'}{R_2} + \frac{U_K'}{R_5}$$

**6. $U_K'$ herausheben**

$$\frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} = U_K' \left( \frac{1}{R_1 + R_4} + \frac{1}{R_2} + \frac{1}{R_5} \right)$$

**7. Durch die Klammer dividieren**

$$U_K' = \frac{\dfrac{U_{q1}}{R_1 + R_4} + \dfrac{U_{q2}}{R_2} + I_{q3}}{\dfrac{1}{R_1 + R_4} + \dfrac{1}{R_2} + \dfrac{1}{R_5}}$$

**8. Doppelbruch auflösen: Zähler und Nenner mit $(R_1 + R_4)\,R_2\,R_5$ erweitern**

Zähler, Term für Term:

$$\begin{aligned} \frac{U_{q1}}{R_1 + R_4} \cdot (R_1 + R_4)R_2R_5 &= U_{q1} R_2 R_5 \\ \frac{U_{q2}}{R_2} \cdot (R_1 + R_4)R_2R_5 &= U_{q2} (R_1 + R_4) R_5 \\ I_{q3} \cdot (R_1 + R_4)R_2R_5 &= I_{q3} (R_1 + R_4) R_2 R_5 \end{aligned}$$

Nenner, Term für Term:

$$\begin{aligned} \frac{1}{R_1 + R_4} \cdot (R_1 + R_4)R_2R_5 &= R_2 R_5 \\ \frac{1}{R_2} \cdot (R_1 + R_4)R_2R_5 &= (R_1 + R_4) R_5 \\ \frac{1}{R_5} \cdot (R_1 + R_4)R_2R_5 &= (R_1 + R_4) R_2 \end{aligned}$$

**9. Ergebnis**

::: merke Knotenspannung im Kurzschluss
$$U_K' = \frac{U_{q1} R_2 R_5 + U_{q2}(R_1 + R_4)R_5 + I_{q3}(R_1 + R_4)R_2 R_5}{R_2 R_5 + (R_1 + R_4)R_5 + (R_1 + R_4)R_2}$$
:::

## 6. Kurzschlussstrom $I_k$ aus $U_K'$

**1. Ansatz aus der rechten Masche**

$$I_k = \frac{U_K'}{R_5}$$

**2. $U_K'$ einsetzen**

$$I_k = \frac{1}{R_5} \cdot \frac{U_{q1} R_2 R_5 + U_{q2}(R_1 + R_4)R_5 + I_{q3}(R_1 + R_4)R_2 R_5}{R_2 R_5 + (R_1 + R_4)R_5 + (R_1 + R_4)R_2}$$

**3. $\frac{1}{R_5}$ in den Nenner ziehen**

$$I_k = \frac{U_{q1} R_2 R_5 + U_{q2}(R_1 + R_4)R_5 + I_{q3}(R_1 + R_4)R_2 R_5}{R_5 \bigl(R_2 R_5 + (R_1 + R_4)R_5 + (R_1 + R_4)R_2\bigr)}$$

**4. Im Zähler steckt in jedem Term $R_5$. Herausheben**

$$U_{q1} R_2 R_5 + U_{q2}(R_1 + R_4)R_5 + I_{q3}(R_1 + R_4)R_2 R_5 = R_5 \bigl(U_{q1} R_2 + U_{q2}(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2\bigr)$$

**5. Eingesetzt**

$$I_k = \frac{R_5 \bigl(U_{q1} R_2 + U_{q2}(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2\bigr)}{R_5 \bigl(R_2 R_5 + (R_1 + R_4)R_5 + (R_1 + R_4)R_2\bigr)}$$

**6. $R_5$ kürzen**

::: merke Kurzschlussstrom
$$I_q = I_k = \frac{U_{q1} R_2 + U_{q2}(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2}{R_2 R_5 + (R_1 + R_4)R_5 + (R_1 + R_4)R_2}$$

Der Zähler ist derselbe wie bei $U_q$ im Leerlauf.
:::

## 7. Variante: $I_k$ über $R_p$ und $U_q$

Ausgangspunkt ist Schritt 6 aus Abschnitt 5:

$$\frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} = U_K' \left( \frac{1}{R_1 + R_4} + \frac{1}{R_2} + \frac{1}{R_5} \right)$$

**Kehrwert der Parallelschaltung**

Mit $R_p = R_2 \parallel (R_1 + R_4) = \dfrac{(R_1 + R_4)R_2}{R_1 + R_2 + R_4}$:

$$\begin{aligned} \frac{1}{R_p} &= \frac{R_1 + R_2 + R_4}{(R_1 + R_4)R_2} \\ &= \frac{R_2}{(R_1 + R_4)R_2} + \frac{R_1 + R_4}{(R_1 + R_4)R_2} \\ &= \frac{1}{R_1 + R_4} + \frac{1}{R_2} \end{aligned}$$

Bei Parallelschaltung addieren sich die Kehrwerte.

**Rechte Klammer umschreiben**

$$\frac{1}{R_1 + R_4} + \frac{1}{R_2} + \frac{1}{R_5} = \frac{1}{R_p} + \frac{1}{R_5}$$

**Linke Seite aus dem Leerlauf wiederverwenden**

Die linke Seite enthält kein $U_K'$, nur Quellen. Aus 3b gilt $U_q = R_p \cdot (\ldots)$, also:

$$\frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} = \frac{U_q}{R_p}$$

Wiederverwendet wird nur die Quellenseite, nicht die Knotenspannung. $U_K'$ bleibt eigene Unbekannte.

**Die Gleichung wird zu**

$$\frac{U_q}{R_p} = U_K' \left( \frac{1}{R_p} + \frac{1}{R_5} \right)$$

**$U_K' = I_k R_5$ einsetzen**

$$\frac{U_q}{R_p} = I_k R_5 \left( \frac{1}{R_p} + \frac{1}{R_5} \right)$$

**Klammer ausmultiplizieren**

$$\frac{U_q}{R_p} = I_k \left( \frac{R_5}{R_p} + 1 \right)$$

**Die Eins auf den Nenner $R_p$ bringen**

$$\frac{U_q}{R_p} = I_k \cdot \frac{R_5 + R_p}{R_p}$$

**Beide Seiten mal $R_p$**

$$U_q = I_k\,(R_5 + R_p)$$

**$R_5 + R_p$ ist $R_i$ aus (i)**

$$U_q = I_k\,R_i \qquad\Rightarrow\qquad I_q = I_k = \frac{U_q}{R_i}$$

## 8. Warum $U_K' \neq U_q$

- Richtig ist: $U_q = U_K$. Das ist die Definition aus dem Leerlauf.
- Falsch wäre: $U_K' = U_K$.

Im Leerlauf fließt kein Strom durch $R_5$:

$$U_{AB} = U_K = U_q$$

Im Kurzschluss fließt $I_k$ durch $R_5$, und die rechte Masche liefert:

$$U_K' = U_{R5} = I_k R_5$$

**Widerspruchsprobe**

Wäre $U_K' = U_q$, dann wäre

$$I_k = \frac{U_q}{R_5}$$

Herausgekommen ist aber

$$I_k = \frac{U_q}{R_5 + R_p}$$

Beide Ausdrücke stimmen nur für $R_p = 0$ überein (oder im trivialen Fall $U_q = 0$).

Außerdem: In Abschnitt 7 müsste die Klammer rechts dann $\frac{1}{R_p}$ sein. Sie ist wegen $\frac{1}{R_5}$ aber größer, also ist $U_K'$ dem Betrag nach kleiner als $U_q$ (für $U_q \neq 0$).

Im Kurzschluss ist $U_{AB} = 0$, nicht $U_K'$.

## 9. $I_q = U_q / R_i$ ausgeschrieben und Probe

**Beide Größen als einfacher Bruch**

$$U_q = \frac{U_{q1} R_2 + U_{q2}(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2}{R_1 + R_2 + R_4}$$

$$\begin{aligned} R_i &= R_5 + \frac{(R_1 + R_4)R_2}{R_1 + R_2 + R_4} \\ &= \frac{R_5 (R_1 + R_2 + R_4) + (R_1 + R_4)R_2}{R_1 + R_2 + R_4} \end{aligned}$$

**Dividieren: der Nenner $(R_1 + R_2 + R_4)$ kürzt sich**

$$I_q = \frac{U_q}{R_i} = \frac{U_{q1} R_2 + U_{q2}(R_1 + R_4) + I_{q3}(R_1 + R_4)R_2}{R_5 (R_1 + R_2 + R_4) + (R_1 + R_4)R_2}$$

**Probe gegen $I_k = U_K' / R_5$ aus Abschnitt 6**

Der Zähler ist identisch. Den Nenner ausmultiplizieren:

$$R_5 (R_1 + R_2 + R_4) = R_2 R_5 + (R_1 + R_4) R_5$$

Also:

$$R_5 (R_1 + R_2 + R_4) + (R_1 + R_4)R_2 = R_2 R_5 + (R_1 + R_4) R_5 + (R_1 + R_4) R_2$$

Beide Wege landen beim selben $I_q$.

## 10. Ergebnis (ii) und Thévenin ↔ Norton

::: merke Ersatzstromquelle
$$R_i' = R_i \qquad I_q = \frac{U_q}{R_i}$$
:::

<figure class="dia"><svg viewBox="0 0 360 158" role="img" aria-label="Bild 8: Links die Ersatzspannungsquelle mit U_q und R_i in Reihe. Rechts die Ersatzstromquelle mit I_q, Pfeil nach oben zu Klemme A, und R_i parallel.">
<defs><marker id="aq-a4" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<text class="k" x="4" y="12">ERSATZSPANNUNGSQUELLE</text><text class="k" x="190" y="12">ERSATZSTROMQUELLE</text>
<path class="s" d="M30 70V40H60M100 40H140.5M30 100V130H140.5"/>
<circle class="b" cx="30" cy="85" r="15"/><path class="s" d="M30 70V100"/>
<rect class="b" x="60" y="32" width="40" height="16"/>
<circle class="b" cx="144" cy="40" r="3.5"/><circle class="b" cx="144" cy="130" r="3.5"/>
<text x="40" y="66">+</text>
<path class="s" d="M54 73V97" marker-end="url(#aq-a4)"/><text x="60" y="89">U<tspan dy="3" font-size="9">q</tspan></text>
<text class="c" x="80" y="66">R<tspan dy="3" font-size="9">i</tspan></text>
<text class="c" x="144" y="28">A</text><text class="c" x="144" y="150">B</text>
<path class="s" d="M210 70V40H330.5M210 100V130H330.5M270 40V65M270 105V130"/>
<circle class="b" cx="210" cy="85" r="15"/><path class="s" d="M195 85H225"/>
<rect class="b" x="262" y="65" width="16" height="40"/>
<circle class="f" cx="270" cy="40" r="3"/><circle class="f" cx="270" cy="130" r="3"/>
<circle class="b" cx="334" cy="40" r="3.5"/><circle class="b" cx="334" cy="130" r="3.5"/>
<path class="s" d="M234 97V73" marker-end="url(#aq-a4)"/><text x="240" y="89">I<tspan dy="3" font-size="9">q</tspan></text>
<text x="286" y="89">R<tspan dy="3" font-size="9">i</tspan></text>
<text class="c" x="334" y="28">A</text><text class="c" x="334" y="150">B</text>
<text class="c" x="172" y="90">=</text>
</svg><figcaption>Bild 8: zwei Ersatzquellen, eine Kennlinie. Der Pfeil von I<sub>q</sub> zeigt zu Klemme A, also dorthin, wo bei U<sub>q</sub> das Plus liegt.</figcaption></figure>

- Die Ersatzstromquelle hat denselben Innenwiderstand wie die Ersatzspannungsquelle.
- Thévenin und Norton beschreiben dieselbe Gerade im $U$-$I$-Diagramm.
- Zwei der drei Größen $U_q$, $I_q$, $R_i$ legen die dritte fest.
- Der Zusammenhang ist $U_q = I_q \cdot R_i$.
- Meist rechnet man $R_i$ und dann entweder Leerlauf oder Kurzschluss.

**Grenzen**

- Bei $R_i = 0$ gibt es keine Ersatzstromquelle, der Kurzschlussstrom $U_q / R_i$ wäre unendlich (für $U_q \neq 0$).
- Bei $R_i \to \infty$ gibt es keine Ersatzspannungsquelle, die Leerlaufspannung $I_q \cdot R_i$ wäre unendlich (für $I_q \neq 0$).

**Richtung beim Umwandeln**

Der Pfeil von $I_q$ zeigt zu der Klemme, an der bei $U_q$ das $+$ liegt.

## 11. Zusammenfassung

- Der Innenwiderstand wird mit deaktivierten Quellen bestimmt: Spannungsquellen kurzschließen, Stromquellen auftrennen.
- Ein Widerstand in Reihe mit einer idealen Stromquelle hat keinen Einfluss nach außen.
- Im Leerlauf fließt durch $R_5$ kein Strom, also gilt $U_{AB} = U_K$.
- $U_K$ folgt aus einer einzigen Knotengleichung an $K$.

::: merke Ergebnis
$$R_i = R_5 + R_2 \parallel (R_1 + R_4)$$

$$U_q = \bigl(R_2 \parallel (R_1 + R_4)\bigr) \left( \frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} \right)$$

$$R_i' = R_i \qquad I_q = \frac{U_q}{R_i}$$
:::
