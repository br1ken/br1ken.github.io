---
titel: Brückenschaltung zur Messwertumsetzung
datum: 2026-10-29
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.5
tags: [Brückenschaltung, Dehnungsmessstreifen, Ersatzspannungsquelle, Stromteiler, Spannungsteiler]
teaser: Zwei Dehnungsmessstreifen ändern ihren Widerstand um plus und minus ΔR. Mit Thévenin, Stromteiler und Spannungsteiler wird die Messspannung linear in ΔR.
welle: dreieck
---

## Die Aufgabe

Zwei Dehnungsmessstreifen ändern ihren Widerstand um $+\Delta R$ bzw. $-\Delta R$. Gesucht ist $U_M$ als Funktion von $\Delta R$ für feste $I_q$, $R$ und $R_M$.

<figure class="dia"><svg viewBox="0 0 340 246" role="img" aria-label="Bild 1: Brückenschaltung. Links eine Stromquelle I q. Linker Zweig oben R plus Delta R, unten R, dazwischen der Knoten A. Rechter Zweig oben R minus Delta R, unten R, dazwischen der Knoten C. Zwischen A und C liegt R M mit der Spannung U M, Zählpfeil von C nach A.">
<defs><marker id="a35-1-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a35-1-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a35-1-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a35-1-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="s" d="M60 30H270M60 232H270"/>
<path class="s" d="M150 30V52M150 96V156M150 200V232"/><rect class="b" x="142" y="52" width="16" height="44"/><rect class="b" x="142" y="156" width="16" height="44"/><circle class="f" cx="150" cy="126" r="3"/>
<path class="s" d="M270 30V52M270 96V156M270 200V232"/><rect class="b" x="262" y="52" width="16" height="44"/><rect class="b" x="262" y="156" width="16" height="44"/><circle class="f" cx="270" cy="126" r="3"/>
<circle class="f" cx="150" cy="30" r="3"/><circle class="f" cx="150" cy="232" r="3"/>
<text x="136" y="78" text-anchor="end">R + ΔR</text><text x="284" y="78">R − ΔR</text>
<text x="136" y="182" text-anchor="end">R</text><text x="284" y="182">R</text>
<circle class="b" cx="60" cy="131" r="15"/><path class="s" d="M45 131H75"/><path class="s" d="M60 30V116M60 146V232"/>
<path class="pi" d="M36 147L36 115" marker-end="url(#a35-1-i)"/><text class="ti" x="30" y="135" text-anchor="end">I<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M150 126H188M232 126H270"/><rect class="b" x="188" y="118" width="44" height="16"/><text class="c" x="210" y="112">R<tspan dy="3" font-size="9">M</tspan></text>
<path class="pu" d="M234 146L186 146" marker-end="url(#a35-1-u)"/><text class="tu c" x="210" y="164">U<tspan dy="3" font-size="9">M</tspan></text>
<text x="142" y="121" text-anchor="end">A</text><text x="278" y="121">C</text>
</svg><figcaption>Bild 1: die Messbrücke. Der Zählpfeil von U<sub>M</sub> zeigt von C nach A, also gilt U<sub>M</sub> = φ<sub>C</sub> − φ<sub>A</sub>.</figcaption></figure>

Die Stromquelle speist die Brücke von oben: $I_q$ fließt am oberen Knoten hinein und unten wieder heraus.

::: info Was ist ein Dehnungsmessstreifen?
Ein dünnes Metallgitter auf einer Folie, aufgeklebt auf ein Bauteil. Dehnt sich das Bauteil, wird der Draht länger und dünner, und sein Widerstand steigt. Wird es gestaucht, sinkt er. Die Änderung $\Delta R$ ist winzig, typisch höchstens wenige Promille von $R$.

Einen Streifen mit $+\Delta R$ und einen mit $-\Delta R$ bekommt man zum Beispiel an einem gebogenen Balken: Oben wird gedehnt, unten gestaucht.
:::

## Lösungsidee

$R_M$ ist der einzige Widerstand, der die Brücke „verkoppelt“. Man nimmt ihn heraus und ersetzt den Rest bezüglich der Klemmen A und C durch eine [[Ersatzspannungsquelle|ersatzquelle]] (Thévenin). Das geht in drei Schritten:

1. Innenwiderstand $R_i$ bestimmen.
2. Leerlaufspannung $U_0$ bestimmen.
3. $R_M$ wieder anschließen (Spannungsteiler).

::: tipp Die Idee hinter der Brücke
Eine Messbrücke vergleicht zwei Spannungsteiler. Ohne Dehnung teilen beide gleich, A und C liegen auf demselben Potential, und es ist $U_M = 0$. Ändern sich die Streifen, kippt der linke Teiler in die eine Richtung und der rechte in die andere. Gemessen wird nur der Unterschied, und der ist proportional zu $\Delta R$.
:::

## 1. Innenwiderstand $R_i$

::: merke Regel zum Abschalten von Quellen
Eine Spannungsquelle hält $U$ fest. Abgeschaltet gilt $U = 0$, also wird sie zum Kurzschluss (Draht). Eine Stromquelle hält $I$ fest. Abgeschaltet gilt $I = 0$, also wird sie zum Leerlauf (offen).
:::

Hier: $R_M$ entfernen, Stromquelle durch Leerlauf ersetzen.

<figure class="dia"><svg viewBox="0 0 340 246" role="img" aria-label="Bild 2: Dieselbe Brücke, R M ist entfernt, die Stromquelle ist durch eine Unterbrechung ersetzt. A und C sind offene Klemmen.">
<defs><marker id="a35-2-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a35-2-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a35-2-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a35-2-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="s" d="M60 30H270M60 232H270"/>
<path class="s" d="M150 30V52M150 96V156M150 200V232"/><rect class="b" x="142" y="52" width="16" height="44"/><rect class="b" x="142" y="156" width="16" height="44"/><circle class="f" cx="150" cy="126" r="3"/>
<path class="s" d="M270 30V52M270 96V156M270 200V232"/><rect class="b" x="262" y="52" width="16" height="44"/><rect class="b" x="262" y="156" width="16" height="44"/><circle class="f" cx="270" cy="126" r="3"/>
<circle class="f" cx="150" cy="30" r="3"/><circle class="f" cx="150" cy="232" r="3"/>
<text x="136" y="78" text-anchor="end">R + ΔR</text><text x="284" y="78">R − ΔR</text>
<text x="136" y="182" text-anchor="end">R</text><text x="284" y="182">R</text>
<path class="s" d="M60 30V112.5M60 149.5V232"/><circle class="b" cx="60" cy="116" r="3.5"/><circle class="b" cx="60" cy="146" r="3.5"/>
<text x="50" y="128" text-anchor="end">I<tspan dy="3" font-size="9">q</tspan><tspan dy="-3"> = 0</tspan></text><text class="k" x="50" y="142" text-anchor="end">OFFEN</text>
<path class="s" d="M150 126H172.5M270 126H247.5"/><circle class="b" cx="176" cy="126" r="3.5"/><circle class="b" cx="244" cy="126" r="3.5"/>
<text class="c" x="176" y="146">A</text><text class="c" x="244" y="146">C</text>
</svg><figcaption>Bild 2: R<sub>M</sub> entfernt, Stromquelle abgeschaltet. Eine abgeschaltete Stromquelle ist offen.</figcaption></figure>

Umgezeichnet, sodass A links und C rechts liegt:

<figure class="dia"><svg viewBox="0 0 360 176" role="img" aria-label="Bild 3: Umgezeichnet mit A links und C rechts. Oberer Weg: R plus Delta R, Knoten oben, R minus Delta R. Unterer Weg: R, Knoten unten, R. Beide Wege verbinden A mit C.">
<defs><marker id="a35-3-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a35-3-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a35-3-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a35-3-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="s" d="M33.5 90H60M300 90H326.5"/><circle class="b" cx="30" cy="90" r="3.5"/><circle class="b" cx="330" cy="90" r="3.5"/><circle class="f" cx="60" cy="90" r="3"/><circle class="f" cx="300" cy="90" r="3"/>
<text x="20" y="94" text-anchor="end">A</text><text x="340" y="94">C</text>
<path class="s" d="M60 90V40H96M140 40H220M264 40H300V90"/><rect class="b" x="96" y="32" width="44" height="16"/><rect class="b" x="220" y="32" width="44" height="16"/><circle class="f" cx="180" cy="40" r="3"/>
<text class="c" x="118" y="24">R + ΔR</text><text class="c" x="242" y="24">R − ΔR</text>
<text class="k c" x="180" y="56">OBEN</text>
<path class="s" d="M60 90V140H96M140 140H220M264 140H300V90"/><rect class="b" x="96" y="132" width="44" height="16"/><rect class="b" x="220" y="132" width="44" height="16"/><circle class="f" cx="180" cy="140" r="3"/>
<text class="c" x="118" y="166">R</text><text class="c" x="242" y="166">R</text>
<text class="k c" x="180" y="131">UNTEN</text>
</svg><figcaption>Bild 3: umgezeichnet, A links und C rechts. Zwischen A und C gibt es genau zwei Wege, über „oben“ und über „unten“.</figcaption></figure>

**Reihenschaltung.** Zwei Widerstände liegen in Reihe, wenn am Knoten zwischen ihnen nichts abzweigt. An „oben“ und „unten“ hing vorher die Quelle. Sie ist jetzt offen, also zweigt dort nichts ab.

$$\begin{aligned} R_\text{oben} &= (R + \Delta R) + (R - \Delta R) = 2R \\ R_\text{unten} &= R + R = 2R \end{aligned}$$

**Parallelschaltung.** Beide Wege verbinden A mit C, sie liegen also parallel.

$$R_i = 2R \parallel 2R = \frac{2R \cdot 2R}{2R + 2R} = \frac{4R^2}{4R} = R$$

::: merke Innenwiderstand
$R_i = R$. Der Innenwiderstand hängt nicht von $\Delta R$ ab, weil sich $+\Delta R$ und $-\Delta R$ aufheben.
:::

::: achtung Typischer Fehler
Wer die Stromquelle als Draht ersetzt, macht „oben“ und „unten“ zu einem Knoten. Dann erhielte man $(R + \Delta R) \parallel R + (R - \Delta R) \parallel R$. Das ist hier falsch.
:::

## 2. Leerlaufspannung $U_0$

Die Quelle ist wieder an, $R_M$ bleibt entfernt. $I_q$ teilt sich am oberen Knoten auf den linken und den rechten Zweig auf.

<figure class="dia"><svg viewBox="0 0 340 256" role="img" aria-label="Bild 4: Leerlauf. Die Stromquelle ist wieder an, R M bleibt entfernt. Im linken Zweig fließt I L nach unten, im rechten Zweig I R nach unten. Der untere Knoten ist der Bezug mit Potential null.">
<defs><marker id="a35-4-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a35-4-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a35-4-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a35-4-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="s" d="M60 30H270M60 232H270"/>
<path class="s" d="M150 30V52M150 96V156M150 200V232"/><rect class="b" x="142" y="52" width="16" height="44"/><rect class="b" x="142" y="156" width="16" height="44"/><circle class="f" cx="150" cy="126" r="3"/>
<path class="s" d="M270 30V52M270 96V156M270 200V232"/><rect class="b" x="262" y="52" width="16" height="44"/><rect class="b" x="262" y="156" width="16" height="44"/><circle class="f" cx="270" cy="126" r="3"/>
<circle class="f" cx="150" cy="30" r="3"/><circle class="f" cx="150" cy="232" r="3"/>
<text x="136" y="78" text-anchor="end">R + ΔR</text><text x="284" y="78">R − ΔR</text>
<text x="136" y="182" text-anchor="end">R</text><text x="284" y="182">R</text>
<circle class="b" cx="60" cy="131" r="15"/><path class="s" d="M45 131H75"/><path class="s" d="M60 30V116M60 146V232"/>
<path class="pi" d="M36 147L36 115" marker-end="url(#a35-4-i)"/><text class="ti" x="30" y="135" text-anchor="end">I<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M150 126H172.5M270 126H247.5"/><circle class="b" cx="176" cy="126" r="3.5"/><circle class="b" cx="244" cy="126" r="3.5"/>
<text class="c" x="176" y="146">A</text><text class="c" x="244" y="146">C</text>
<path class="pi" d="M166 58L166 90" marker-end="url(#a35-4-i)"/><text class="ti" x="171" y="78">I<tspan dy="3" font-size="9">L</tspan></text>
<path class="pi" d="M254 58L254 90" marker-end="url(#a35-4-i)"/><text class="ti" x="249" y="78" text-anchor="end">I<tspan dy="3" font-size="9">R</tspan></text>
<text class="k" x="158" y="249">BEZUG: φ<tspan dy="3" font-size="9">unten</tspan><tspan dy="-3"> = 0</tspan></text>
</svg><figcaption>Bild 4: Leerlauf. I<sub>q</sub> teilt sich am oberen Knoten in I<sub>L</sub> und I<sub>R</sub> auf. Der untere Knoten ist der Bezug, φ<sub>unten</sub> = 0.</figcaption></figure>

### 2a. Zweigwiderstände

Durch beide Widerstände eines Zweigs fließt derselbe Strom, sie liegen also in Reihe.

$$\begin{aligned} R_L &= (R + \Delta R) + R = 2R + \Delta R \\ R_R &= (R - \Delta R) + R = 2R - \Delta R \\ R_L + R_R &= (2R + \Delta R) + (2R - \Delta R) = 4R \end{aligned}$$

### 2b. Stromteilerregel herleiten

Beide Zweige liegen zwischen „oben“ und „unten“. An ihnen liegt also dieselbe Spannung $U$. Nach Ohm gilt:

$$I_L = \frac{U}{R_L}, \qquad I_R = \frac{U}{R_R}$$

Im Verhältnis kürzt sich $U$:

$$\frac{I_L}{I_R} = \frac{U/R_L}{U/R_R} = \frac{U}{R_L} \cdot \frac{R_R}{U} = \frac{R_R}{R_L}$$

::: merke Stromteilerregel
Die Ströme verhalten sich umgekehrt wie die Widerstände. Beim Strom eines Zweigs steht der Widerstand des anderen Zweigs im Zähler ([[Stromteiler|stromteiler]]).
:::

Eingesetzt:

$$\frac{I_L}{I_R} = \frac{2R - \Delta R}{2R + \Delta R} \quad\Longrightarrow\quad I_L = I_R \cdot \frac{2R - \Delta R}{2R + \Delta R}$$

Plausibel: Links ist der Widerstand größer, also fließt links weniger Strom.

### 2c. Weg a: über die Knotengleichung

Knotenregel am oberen Knoten:

$$I_q = I_L + I_R$$

$I_R$ durch $I_L$ ausdrücken (Kehrwert von 2b):

$$I_R = I_L \cdot \frac{2R + \Delta R}{2R - \Delta R}$$

Einsetzen:

$$I_q = I_L + I_L \cdot \frac{2R + \Delta R}{2R - \Delta R}$$

$I_L$ herausheben:

$$I_q = I_L \left(1 + \frac{2R + \Delta R}{2R - \Delta R}\right)$$

Klammer auf den Hauptnenner $2R - \Delta R$ bringen:

$$\begin{aligned} 1 + \frac{2R + \Delta R}{2R - \Delta R} &= \frac{2R - \Delta R}{2R - \Delta R} + \frac{2R + \Delta R}{2R - \Delta R} \\ &= \frac{(2R - \Delta R) + (2R + \Delta R)}{2R - \Delta R} \\ &= \frac{4R}{2R - \Delta R} \end{aligned}$$

Also:

$$I_q = I_L \cdot \frac{4R}{2R - \Delta R}$$

Mit dem Kehrwert multiplizieren:

$$I_L = I_q \cdot \frac{2R - \Delta R}{4R}$$

### 2d. Weg b: über die Anteilsformel

Gesamtstrom bei gleicher Spannung $U$:

$$I_q = I_L + I_R = \frac{U}{R_L} + \frac{U}{R_R} = U\left(\frac{1}{R_L} + \frac{1}{R_R}\right) = U \cdot \frac{R_L + R_R}{R_L R_R}$$

Anteil des linken Zweigs, $U$ kürzt sich:

$$\frac{I_L}{I_q} = \frac{U/R_L}{U \cdot \dfrac{R_L + R_R}{R_L R_R}} = \frac{1}{R_L} \cdot \frac{R_L R_R}{R_L + R_R} = \frac{R_R}{R_L + R_R}$$

Eingesetzt:

$$\begin{aligned} I_L &= I_q \cdot \frac{R_R}{R_L + R_R} = I_q \cdot \frac{2R - \Delta R}{4R} \\ I_R &= I_q \cdot \frac{R_L}{R_L + R_R} = I_q \cdot \frac{2R + \Delta R}{4R} \end{aligned}$$

Beide Wege liefern dasselbe. Weg b ist kürzer.

**Probe mit der Knotenregel:**

$$I_L + I_R = I_q \cdot \frac{(2R - \Delta R) + (2R + \Delta R)}{4R} = I_q \cdot \frac{4R}{4R} = I_q \quad\checkmark$$

### 2e. Potentiale und Leerlaufspannung

Der untere Knoten ist der Bezug: $\varphi_\text{unten} = 0$. Fließt Strom durch einen Widerstand, sinkt das [[Potential|potential]] in Stromrichtung um $R \cdot I$. Von unten nach oben, also gegen den Strom, steigt es entsprechend.

Durch das linke untere $R$ fließt $I_L$ von A nach unten:

$$\varphi_A = R \cdot I_L = R \cdot I_q \cdot \frac{2R - \Delta R}{4R} = I_q \cdot \frac{2R - \Delta R}{4}$$

Durch das rechte untere $R$ fließt $I_R$ von C nach unten:

$$\varphi_C = R \cdot I_R = R \cdot I_q \cdot \frac{2R + \Delta R}{4R} = I_q \cdot \frac{2R + \Delta R}{4}$$

Die Leerlaufspannung ist die Potentialdifferenz zwischen den Klemmen. Gleicher Nenner, also Zähler direkt abziehen (Minusklammer beachten):

$$\varphi_A - \varphi_C = I_q \cdot \frac{(2R - \Delta R) - (2R + \Delta R)}{4} = I_q \cdot \frac{-2\Delta R}{4} = -\frac{I_q\,\Delta R}{2}$$

**Vorzeichen.** Es hängt nur von der Richtung des Zählpfeils ab. Der Pfeil von $U_M$ zeigt in der Angabe von C nach A, also gilt $U_M = \varphi_C - \varphi_A$. Mit demselben Zählpfeil:

$$U_0 = \varphi_C - \varphi_A = \frac{I_q\,\Delta R}{2}$$

::: merke Leerlaufspannung
$U_0 = \dfrac{I_q\,\Delta R}{2}$ ist linear in $\Delta R$. Genau das will man von einer Messbrücke.
:::

Plausibel: Bei $\Delta R > 0$ fließt links weniger Strom, am linken unteren $R$ fällt weniger Spannung ab, und A liegt tiefer als C.

## 3. $R_M$ anschließen

Ersatzschaltung: Quelle $U_0$ mit $R_i = R$, belastet mit $R_M$.

<figure class="dia"><svg viewBox="0 0 320 176" role="img" aria-label="Bild 5: Ersatzschaltung. Quelle U 0 mit Zählpfeil nach unten, in Reihe R i gleich R, belastet mit R M. Oben liegt C, unten A. U M zeigt nach unten.">
<defs><marker id="a35-5-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a35-5-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a35-5-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a35-5-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<circle class="b" cx="50" cy="95" r="15"/><path class="s" d="M50 80V110"/><path class="s" d="M50 40V80M50 110V150"/>
<path class="pu" d="M26 79L26 111" marker-end="url(#a35-5-u)"/><text class="tu" x="20" y="99" text-anchor="end">U<tspan dy="3" font-size="9">0</tspan></text>
<path class="s" d="M50 40H84M128 40H250V73M250 117V150H50"/><rect class="b" x="84" y="32" width="44" height="16"/><text class="c" x="106" y="26">R<tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> = R</tspan></text>
<rect class="b" x="242" y="73" width="16" height="44"/><text x="236" y="99" text-anchor="end">R<tspan dy="3" font-size="9">M</tspan></text>
<circle class="f" cx="176" cy="40" r="3"/><circle class="f" cx="176" cy="150" r="3"/><text class="c" x="176" y="30">C</text><text class="c" x="176" y="168">A</text>
<path class="pu" d="M274 79L274 111" marker-end="url(#a35-5-u)"/><text class="tu" x="279" y="99">U<tspan dy="3" font-size="9">M</tspan></text>
</svg><figcaption>Bild 5: die Ersatzspannungsquelle zwischen C (oben) und A (unten), belastet mit R<sub>M</sub>. Beide Zählpfeile zeigen von C nach A.</figcaption></figure>

$R_i$ und $R_M$ liegen in Reihe an $U_0$. Das ist ein [[Spannungsteiler|spannungsteiler]]. Beim Spannungsteiler steht der eigene Widerstand im Zähler:

$$U_M = U_0 \cdot \frac{R_M}{R_i + R_M}$$

Zähler und Nenner durch $R_M$ teilen:

$$\frac{R_M}{R + R_M} = \frac{R_M / R_M}{R / R_M + R_M / R_M} = \frac{1}{1 + \dfrac{R}{R_M}}$$

$U_0$ einsetzen:

$$U_M = \frac{I_q\,\Delta R}{2} \cdot \frac{1}{1 + \dfrac{R}{R_M}}$$

::: merke Ergebnis
$$U_M = \frac{I_q}{2\left(1 + \dfrac{R}{R_M}\right)}\,\Delta R$$
:::

**Probe mit Grenzfall.** Für $R_M \to \infty$ (ideales Voltmeter) gilt:

$$\frac{R}{R_M} \to 0 \quad\Longrightarrow\quad U_M \to \frac{I_q\,\Delta R}{2} = U_0$$

Ein unendlich hochohmiges Messgerät belastet die Brücke nicht. Und ohne Dehnung, $\Delta R = 0$, ist $U_M = 0$: Die Brücke ist abgeglichen.

## Merksätze

1. Thévenin: zuerst $R_i$, dann $U_0$, dann belasten.
2. Abgeschaltet wird eine Stromquelle zum Leerlauf, eine Spannungsquelle zum Kurzschluss.
3. Bei verschachtelten Schaltungen die Wege zwischen den Klemmen nachfahren und umzeichnen.
4. Stromteiler: $\dfrac{I_1}{I} = \dfrac{R_2}{R_1 + R_2}$. Im Zähler steht der andere Zweig.
5. Spannungsteiler: $\dfrac{U_2}{U} = \dfrac{R_2}{R_1 + R_2}$. Im Zähler steht der eigene Widerstand.
