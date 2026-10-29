---
titel: Ersatzspannungsquelle mit gesteuerten Quellen
datum: 2026-10-29
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.4
tags: [Ersatzspannungsquelle, Gesteuerte Quelle, Leerlauf, Kurzschluss, Innenwiderstand]
teaser: Zwei Kreise, die nur über gesteuerte Quellen gekoppelt sind. Quellenspannung und Innenwiderstand über Leerlauf und Kurzschluss, weil man gesteuerte Quellen nicht abschalten darf.
welle: gedaempft
---

## Die Aufgabe

Die Quellen im eingerahmten Schaltungsteil sind linear gesteuert. Gesucht sind die Parameter $U_q$ und $R_i$ einer [[Ersatzspannungsquelle|ersatzquelle]].

<figure class="dia"><svg viewBox="0 0 406 224" role="img" aria-label="Bild 1: Links eine Spannungsquelle U1, oben R1 mit dem Strom I1, rechts davon die gesteuerte Spannungsquelle alpha mal U2 mit Zählpfeil nach oben. Getrennt davon rechts die gesteuerte Stromquelle beta mal I1 mit Strompfeil nach unten, parallel dazu R2 mit dem Strom I R2 nach unten und die Klemmen mit U2 nach unten und I2 nach rechts.">
<defs><marker id="a34-1-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a34-1-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a34-1-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a34-1-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<rect class="m d" x="70" y="24" width="289" height="186" style="fill:none"/>
<circle class="b" cx="48" cy="115" r="15"/><path class="s" d="M48 100V130"/><path class="s" d="M48 60V100M48 130V170"/>
<path class="pu" d="M22 99L22 131" marker-end="url(#a34-1-u)"/><text class="tu" x="16" y="119" text-anchor="end">U<tspan dy="3" font-size="9">1</tspan></text>
<path class="s" d="M48 60H84M128 60H156"/><rect class="b" x="84" y="52" width="44" height="16"/>
<text class="c" x="106" y="86">R<tspan dy="3" font-size="9">1</tspan></text>
<path class="pi" d="M54 46L78 46" marker-end="url(#a34-1-i)"/><text class="ti c" x="58" y="39">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="pu" d="M90 44L122 44" marker-end="url(#a34-1-u)"/><text class="tu c" x="106" y="36">R<tspan dy="3" font-size="9">1</tspan><tspan dy="-3">I</tspan><tspan dy="3" font-size="9">1</tspan></text>
<circle class="b" cx="156" cy="115" r="15"/><path class="s" d="M156 100V130"/><path class="s" d="M156 60V100M156 130V170"/>
<path class="pu" d="M132 131L132 99" marker-end="url(#a34-1-u)"/><text class="tu" x="126" y="119" text-anchor="end">αU<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M48 170H156"/>
<path class="pi" d="M136 186L76 186" marker-end="url(#a34-1-i)"/><text class="ti c" x="106" y="202">I<tspan dy="3" font-size="9">1</tspan></text>
<circle class="b" cx="226" cy="115" r="15"/><path class="s" d="M211 115H241"/><path class="s" d="M226 60V100M226 130V170"/>
<path class="pu" d="M200 99L200 131" marker-end="url(#a34-1-u)"/><text class="tu" x="194" y="119" text-anchor="end">U<tspan dy="3" font-size="9">2</tspan></text>
<path class="pi" d="M250 99L250 131" marker-end="url(#a34-1-i)"/><text class="ti" x="255" y="119">βI<tspan dy="3" font-size="9">1</tspan></text>
<path class="s" d="M226 60H364.5M226 170H364.5"/>
<rect class="b" x="304" y="93" width="16" height="44"/><path class="s" d="M312 60V93M312 137V170"/><circle class="f" cx="312" cy="60" r="3"/><circle class="f" cx="312" cy="170" r="3"/>
<text x="299" y="119" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text>
<path class="pi" d="M330 99L330 131" marker-end="url(#a34-1-i)"/><text class="ti" x="335" y="119">I<tspan dy="3" font-size="9">R2</tspan></text>
<circle class="b" cx="368" cy="60" r="3.5"/><circle class="b" cx="368" cy="170" r="3.5"/>
<path class="pi" d="M374 46L398 46" marker-end="url(#a34-1-i)"/><text class="ti c" x="386" y="39">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="pu" d="M384 99L384 131" marker-end="url(#a34-1-u)"/><text class="tu" x="389" y="119">U<tspan dy="3" font-size="9">2</tspan></text>
<text class="k" x="359" y="17" text-anchor="end">GESTEUERTER TEIL</text>
</svg><figcaption>Bild 1: die Schaltung mit allen Zählpfeilen, Spannungen rot, Ströme blau. Gestrichelt umrahmt ist der Teil mit den gesteuerten Quellen.</figcaption></figure>

Oben gibt es keine Leitung zwischen dem linken und dem rechten Kreis. Die beiden Kreise sind nur über die gesteuerten Quellen gekoppelt: $\alpha U_2$ hängt vom rechten Kreis ab, $\beta I_1$ vom linken.

::: info Was ist eine gesteuerte Quelle?
Eine [[gesteuerte Quelle|gesteuerte-quelle]] liefert keinen festen Wert, sondern ein Vielfaches einer anderen Größe der Schaltung.

- $\alpha U_2$ ist eine **spannungsgesteuerte Spannungsquelle**: Ihre Spannung ist $\alpha$-mal so groß wie $U_2$.
- $\beta I_1$ ist eine **stromgesteuerte Stromquelle**: Ihr Strom ist $\beta$-mal so groß wie $I_1$.

$\alpha$ und $\beta$ sind feste Zahlen ohne Einheit. So sehen Verstärker und Transistoren im Ersatzschaltbild aus.
:::

## Ziel: die Ersatzspannungsquelle

<figure class="dia"><svg viewBox="0 0 380 176" role="img" aria-label="Bild 2: Links die Ersatzspannungsquelle aus U q und R i mit Klemmenstrom I2 und Klemmenspannung U2. Rechts die Kennlinie U2 über I2: eine fallende Gerade vom Leerlaufpunkt U q bis zum Kurzschlusspunkt I K.">
<defs><marker id="a34-2-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a34-2-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a34-2-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a34-2-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<circle class="b" cx="44" cy="94" r="15"/><path class="s" d="M44 79V109"/><path class="s" d="M44 44V79M44 109V144"/>
<path class="pu" d="M20 78L20 110" marker-end="url(#a34-2-u)"/><text class="tu" x="14" y="98" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M44 44H74M118 44H156.5M44 144H156.5"/><rect class="b" x="74" y="36" width="44" height="16"/><text class="c" x="96" y="30">R<tspan dy="3" font-size="9">i</tspan></text>
<circle class="b" cx="160" cy="44" r="3.5"/><circle class="b" cx="160" cy="144" r="3.5"/>
<path class="pi" d="M128 32L152 32" marker-end="url(#a34-2-i)"/><text class="ti c" x="140" y="25">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="pu" d="M172 78L172 110" marker-end="url(#a34-2-u)"/><text class="tu" x="177" y="98">U<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M228 158L228 26" marker-end="url(#a34-2-e)"/><path class="s" d="M220 150L374 150" marker-end="url(#a34-2-e)"/>
<text x="222" y="30" text-anchor="end">U<tspan dy="3" font-size="9">2</tspan></text><text x="374" y="166" text-anchor="end">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="pu" d="M228 52L322 150" style="stroke-width:2.2"/>
<circle class="fu" cx="228" cy="52" r="4"/><circle class="fu" cx="322" cy="150" r="4"/>
<text x="222" y="56" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text><text class="c" x="322" y="166">I<tspan dy="3" font-size="9">K</tspan></text>
<text class="k" x="294" y="92">STEIGUNG −Rᵢ</text>
<text class="k" x="236" y="46">LEERLAUF</text><text class="k" x="300" y="142" text-anchor="end">KURZSCHLUSS</text>
</svg><figcaption>Bild 2: links die gesuchte Ersatzspannungsquelle, rechts ihre Kennlinie. Leerlauf und Kurzschluss sind die beiden Endpunkte der Geraden.</figcaption></figure>

Maschenumlauf im Uhrzeigersinn um die Ersatzquelle:

$$-U_q + R_i I_2 + U_2 = 0$$

$$U_2 = U_q - R_i I_2$$

Diese Gerade beschreibt das Klemmenverhalten vollständig. Zwei Punkte legen sie fest:

**Leerlauf:** Die Klemmen sind offen, also $I_2 = 0$.

$$U_2 = U_q$$

**Kurzschluss:** Die Klemmen sind verbunden, also $U_2 = 0$.

$$0 = U_q - R_i I_K \quad\Rightarrow\quad R_i = \frac{U_q}{I_K}$$

::: achtung Gesteuerte Quellen nicht abschalten
Gesteuerte Quellen dürfen nicht abgeschaltet werden, weder für $R_i$ noch für Superposition. Ihr Wert hängt von Strömen und Spannungen in der Schaltung ab. Schaltet man sie ab, verändert man genau den Zusammenhang, den man berechnen will.

Deshalb bestimmt man $U_q$ und $R_i$ über [[Leerlauf und Kurzschluss|leerlauf-kurzschluss]]. Dort bleiben alle Quellen in der Schaltung.

$U_q$ ist eine feste Eigenschaft der Quelle. $U_2$ hängt von der Last ab.
:::

## 1. Linke Masche

Umlauf im Uhrzeigersinn. $U_1$ zeigt gegen den Umlauf, $R_1 I_1$ mit dem Umlauf, $\alpha U_2$ (Pfeil nach oben) gegen den Umlauf.

$$-U_1 + R_1 I_1 - \alpha U_2 = 0$$

$$I_1 = \frac{U_1 + \alpha U_2}{R_1}$$

::: tipp Vorzeichen im Maschenumlauf
Pfeil in Umlaufrichtung: plus. Pfeil gegen die Umlaufrichtung: minus. Die Summe ist null ([[Maschenregel|maschenregel]]).
:::

## 2. Knoten rechts oben

Alle drei Ströme fließen aus dem Knoten hinaus: $\beta I_1$ nach unten durch die Stromquelle, $I_{R_2}$ nach unten durch $R_2$, $I_2$ nach rechts zur Klemme. An $R_2$ liegt $U_2$, und Strom- und Spannungspfeil zeigen in dieselbe Richtung. Also gilt $I_{R_2} = U_2/R_2$.

$$\beta I_1 + I_{R_2} + I_2 = 0$$

$$\beta I_1 + \frac{U_2}{R_2} + I_2 = 0$$

## 3. Leerlauf: $U_q$

$I_2 = 0$, damit ist $U_2 = U_q$. Aus der Knotengleichung wird:

$$\begin{aligned} \beta I_1 + \frac{U_2}{R_2} &= 0 && \big|\cdot R_2 \\ R_2 \beta I_1 + U_2 &= 0 && \big|-R_2 \beta I_1 \\ U_2 &= -R_2 \beta I_1 \end{aligned}$$

$I_1$ aus der linken Masche einsetzen:

$$\begin{aligned} U_2 &= -R_2 \beta \cdot \frac{U_1 + \alpha U_2}{R_1} && \big|\cdot R_1 \\ R_1 U_2 &= -R_2 \beta U_1 - R_2 \alpha\beta\, U_2 && \big|+R_2 \alpha\beta\, U_2 \\ R_1 U_2 + R_2 \alpha\beta\, U_2 &= -R_2 \beta U_1 && \big|\;U_2 \text{ herausheben} \\ U_2\,(R_1 + R_2 \alpha\beta) &= -R_2 \beta U_1 && \big|:(R_1 + R_2 \alpha\beta) \\ U_2 &= \frac{-R_2 \beta}{R_1 + R_2 \alpha\beta}\, U_1 \end{aligned}$$

Zähler und Nenner durch $R_2$ teilen:

::: merke Quellenspannung
$$U_q = \frac{-\beta}{\dfrac{R_1}{R_2} + \alpha\beta}\, U_1$$
:::

::: tipp Die Unbekannte steht auf beiden Seiten
$U_2$ taucht rechts noch einmal auf, weil die Quelle $\alpha U_2$ von genau der Größe abhängt, die man ausrechnet. Das ist typisch für gesteuerte Quellen. Man bringt alle $U_2$ auf eine Seite und hebt heraus.
:::

## 4. Kurzschluss: $I_K$

$U_2 = 0$, damit ist $I_2 = I_K$. Wegen $U_2 = 0$ ist auch $\alpha U_2 = 0$. Die gesteuerte Quelle wirkt dann wie ein Draht.

$$I_1 = \frac{U_1 + \alpha \cdot 0}{R_1} = \frac{U_1}{R_1}$$

Durch $R_2$ fließt kein Strom, weil $U_2 = 0$ ist.

$$\beta I_1 + 0 + I_K = 0$$

$$I_K = -\beta I_1 = -\frac{\beta U_1}{R_1}$$

::: info Abgeschaltet? Nein.
$\alpha U_2$ liefert hier null, aber nicht, weil sie abgeschaltet wurde. Ihre Steuergröße $U_2$ ist im Kurzschluss null, und sie liefert ehrlich das $\alpha$-Fache davon. Das ist ein Ergebnis der Schaltung, keine Annahme.
:::

## 5. Innenwiderstand

$$R_i = \frac{U_q}{I_K} = \frac{-\beta U_1}{\dfrac{R_1}{R_2} + \alpha\beta} \cdot \frac{R_1}{-\beta U_1}$$

Der Faktor $-\beta U_1$ kürzt sich.

::: merke Innenwiderstand
$$R_i = \frac{R_1}{\dfrac{R_1}{R_2} + \alpha\beta}$$
:::

::: tipp Was die Formel bedeutet
Zähler und Nenner durch $R_1$ geteilt:

$$R_i = \frac{1}{\dfrac{1}{R_2} + \dfrac{\alpha\beta}{R_1}} = R_2 \parallel \frac{R_1}{\alpha\beta}$$

Die beiden gesteuerten Quellen wirken an den Klemmen wie ein zusätzlicher Widerstand $R_1/(\alpha\beta)$ parallel zu $R_2$. Ohne Rückwirkung ($\alpha = 0$) bleibt nur $R_2$. Das passt: Dann sieht man von den Klemmen aus eine Stromquelle mit festem Strom $\beta U_1/R_1$, und eine ideale Stromquelle hat einen unendlich großen Innenwiderstand.
:::

::: herleitung Probe mit einer Testquelle
$R_i$ lässt sich auch direkt bestimmen. Die unabhängige Quelle $U_1$ wird null gesetzt, das darf man, sie ist nicht gesteuert. Die gesteuerten Quellen bleiben drin. An die Klemmen legt man eine Testspannung $U_2$ und rechnet den Strom $I = -I_2$, der hineinfließt.

Linke Masche mit $U_1 = 0$:

$$I_1 = \frac{\alpha U_2}{R_1}$$

Knoten rechts oben:

$$I = -I_2 = \beta I_1 + \frac{U_2}{R_2} = \frac{\alpha\beta}{R_1}\, U_2 + \frac{1}{R_2}\, U_2$$

$$R_i = \frac{U_2}{I} = \frac{1}{\dfrac{\alpha\beta}{R_1} + \dfrac{1}{R_2}} = \frac{R_1}{\dfrac{R_1}{R_2} + \alpha\beta} \quad\checkmark$$

Dieser Weg funktioniert auch bei $\beta = 0$. Dann sind $U_q$ und $I_K$ beide null, und $U_q/I_K$ wäre unbestimmt.
:::

## Ergebnis

::: merke Ergebnis
$$U_q = \frac{-\beta}{\dfrac{R_1}{R_2} + \alpha\beta}\, U_1$$

$$R_i = \frac{R_1}{\dfrac{R_1}{R_2} + \alpha\beta}$$
:::

## Vorgehen für ähnliche Aufgaben

1. Für jeden Kreis eine Gleichung aufstellen, also Masche oder Knoten.
2. Leerlauf $I_2 = 0$ einsetzen. Die Klemmenspannung ist dann $U_q$.
3. Kurzschluss $U_2 = 0$ einsetzen. Der Klemmenstrom ist dann $I_K$.
4. Den Innenwiderstand berechnen: $R_i = U_q/I_K$.

Vor dem Rechnen zwei Fragen stellen: Was will ich am Ende haben? Und welche Zustände liefern mir das?
