---
titel: Belastetes Potentiometer — wie klein muss R sein?
datum: 2026-10-24
fach: ET1 · Rechenübung 2
art: rechnung
aufgabe: 2.4
tags: [Potentiometer, Spannungsteiler, Ersatzquelle, Innenwiderstand, Last]
teaser: Aufgabe 2.4: Ein Poti soll unter Last höchstens 1 % Spannung verlieren. Über die Ersatzquelle folgt R ≤ 40,4 Ω, und warum das in der Praxis teuer wird.
welle: gedaempft
---

Ein Potentiometer ist ein verstellbarer [Spannungsteiler](beitrag.html?b=spannungsteiler). Unbelastet liefert es genau die eingestellte Spannung. Sobald eine Last dranhängt, bricht die Spannung ein. Die Aufgabe fragt: Wie klein muss das Poti sein, damit der Einbruch klein bleibt?

Der Weg ist derselbe wie bei der [Brückenschaltung](beitrag.html?b=brueckenschaltung): Aus Sicht der Last ist die ganze Schaltung eine [[Ersatzspannungsquelle|ersatzquelle]].

## Die Aufgabe

Ein Potentiometer mit dem Gesamtwiderstand $R$ liegt an einer Gleichspannung. Unbelastet liegen am Abgriff $50\,\mathrm{V}$. Mit einer Last von $1\,\mathrm{k\Omega}$ darf die Spannung um höchstens 1 % sinken.

| Größe | Wert |
|:---|---:|
| Quellenspannung $U_q$ | $100\,\mathrm{V}$ |
| Spannung am Abgriff ohne Last $U_0$ | $50\,\mathrm{V}$ |
| Lastwiderstand $R_L$ | $1\,\mathrm{k\Omega}$ |
| erlaubter Spannungseinbruch | höchstens 1 % |

**Gesucht:** der Widerstand $R$ des Potentiometers.

<figure class="dia"><svg viewBox="0 0 360 210" role="img" aria-label="Bild 1: Quelle 100 V links. Das Poti als zwei Hälften R/2 übereinander, der Abgriff in der Mitte. Vom Abgriff führt die Last R_L mit 1 Kiloohm nach unten.">
<defs><marker id="pt-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<rect class="m d" x="160" y="38" width="40" height="144"/>
<path class="s" d="M60 30H180V190H60ZM180 110H280V190H180"/>
<circle class="b" cx="60" cy="110" r="16"/><path class="s" d="M60 94V126"/>
<rect class="b" x="172" y="46" width="16" height="44"/><rect class="b" x="172" y="130" width="16" height="44"/>
<rect class="b" x="272" y="128" width="16" height="44"/>
<circle class="f" cx="180" cy="110" r="3"/><circle class="f" cx="180" cy="190" r="3"/>
<text class="k" x="46" y="92">+</text>
<path class="s" d="M90 96V124" marker-end="url(#pt-a1)"/>
<text class="k" x="98" y="106">U<tspan dy="3" font-size="8">q</tspan></text><text x="98" y="122">100 V</text>
<text x="154" y="72" text-anchor="end">R/2</text><text x="154" y="156" text-anchor="end">R/2</text>
<text class="k" x="210" y="54">POTI R</text><text class="k" x="210" y="102">ABGRIFF</text>
<path class="s" d="M258 128V170" marker-end="url(#pt-a1)"/>
<text class="k" x="252" y="152" text-anchor="end">U<tspan dy="3" font-size="8">L</tspan></text>
<text class="k" x="296" y="146">R<tspan dy="3" font-size="8">L</tspan></text><text x="296" y="162">1 kΩ</text>
</svg><figcaption>Bild 1: die Schaltung. Das Poti ist als zwei Hälften R/2 gezeichnet, warum der Schleifer in der Mitte steht, folgt aus Schritt 2.</figcaption></figure>

## Schritt 1: Das Ziel als Zahl

Mit Last dürfen höchstens 1 % der $50\,\mathrm{V}$ verloren gehen:

$$U_{L,\min} = 50\,\mathrm{V} \cdot 0{,}99 = 49{,}5\,\mathrm{V}$$

## Schritt 2: Wo steht der Schleifer?

Ohne Last fließt durch das ganze Poti derselbe Strom. Die Spannung teilt sich also im Verhältnis der Widerstände, wie bei jedem unbelasteten Teiler:

$$\begin{aligned} U_0 &= U_q \cdot \frac{R_{\text{unten}}}{R} \\ 50 &= 100 \cdot \frac{R_{\text{unten}}}{R} \quad\Rightarrow\quad R_{\text{unten}} = \frac{R}{2} \end{aligned}$$

Der Schleifer steht in der Mitte. Das Poti wirkt wie zwei Widerstände $R/2$ in Reihe (Bild 1).

## Schritt 3: Innenwiderstand

Für den Innenwiderstand entfernt man die Last und ersetzt die ideale Spannungsquelle durch einen Draht. Dann schaut man vom Abgriff aus in die Schaltung hinein.

<figure class="dia"><svg viewBox="0 0 360 210" role="img" aria-label="Bild 2: Die Quelle ist durch einen Draht ersetzt, die Last entfernt. Vom Abgriff aus liegen beide Hälften R/2 parallel zwischen den Klemmen.">
<path class="s" d="M60 30H180V190H60ZM180 110H276M180 190H276"/>
<rect class="b" x="172" y="46" width="16" height="44"/><rect class="b" x="172" y="130" width="16" height="44"/>
<circle class="f" cx="180" cy="110" r="3"/><circle class="f" cx="180" cy="190" r="3"/>
<circle class="b" cx="280" cy="110" r="4"/><circle class="b" cx="280" cy="190" r="4"/>
<text class="k" x="70" y="106">QUELLE →</text><text class="k" x="70" y="120">DRAHT</text>
<text x="154" y="72" text-anchor="end">R/2</text><text x="154" y="156" text-anchor="end">R/2</text>
<text class="c" x="312" y="155">R<tspan dy="3" font-size="9">i</tspan></text>
<text class="k c" x="230" y="102">ABGRIFF</text>
</svg><figcaption>Bild 2: Die obere Hälfte führt über den Draht zum unteren Knoten. Damit liegen beide Hälften zwischen Abgriff und unterem Knoten, also parallel.</figcaption></figure>

$$R_i = \frac{R}{2} \parallel \frac{R}{2} = \frac{\frac{R}{2} \cdot \frac{R}{2}}{\frac{R}{2} + \frac{R}{2}} = \frac{R^2/4}{R} = \frac{R}{4}$$

::: merke
Ideale Spannungsquelle durch einen Draht ersetzen, ideale Stromquelle durch eine Unterbrechung. Dann den Widerstand zwischen den Klemmen bestimmen, an denen die Last hängt.
:::

## Schritt 4: Spannung an der Last

Jetzt ersetzt man alles links vom Abgriff durch die Ersatzquelle: $U_0 = 50\,\mathrm{V}$ mit dem Innenwiderstand $R_i = R/4$ in Reihe. Daran hängt die Last.

<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Bild 3: Ersatzschaltung. Quelle U_0 = 50 V links, oben der Innenwiderstand R_i = R/4, rechts die Last R_L = 1 Kiloohm.">
<defs><marker id="pt-a3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M60 40H280V180H60Z"/>
<circle class="b" cx="60" cy="110" r="16"/><path class="s" d="M60 94V126"/>
<rect class="b" x="138" y="32" width="44" height="16"/>
<rect class="b" x="272" y="88" width="16" height="44"/>
<text class="k" x="46" y="92">+</text>
<path class="s" d="M90 96V124" marker-end="url(#pt-a3)"/>
<text class="k" x="98" y="106">U<tspan dy="3" font-size="8">0</tspan></text><text x="98" y="122">50 V</text>
<text class="c" x="160" y="24">R<tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> = R/4</tspan></text>
<path class="s" d="M204 40H232" marker-end="url(#pt-a3)"/><text class="c" x="218" y="32">I</text>
<path class="s" d="M258 90V130" marker-end="url(#pt-a3)"/>
<text class="k" x="252" y="114" text-anchor="end">U<tspan dy="3" font-size="8">L</tspan></text>
<text class="k" x="296" y="106">R<tspan dy="3" font-size="8">L</tspan></text><text x="296" y="122">1 kΩ</text>
</svg><figcaption>Bild 3: die Ersatzschaltung. Aus Sicht der Last ist das ganze Poti eine Quelle U<sub>0</sub> mit Innenwiderstand R<sub>i</sub>.</figcaption></figure>

$R_i$ und $R_L$ liegen in Reihe, durch beide fließt derselbe Strom:

$$I = \frac{U_0}{R_i + R_L}$$

Die Spannung an der Last folgt aus dem [[ohmschen Gesetz|ohmsches-gesetz]]:

$$U_L = R_L \cdot I = U_0 \cdot \frac{R_L}{R_i + R_L}$$

Das ist wieder ein Spannungsteiler, diesmal aus $R_i$ und $R_L$.

## Schritt 5: Bedingung aufstellen und lösen

$$\begin{aligned} U_0 \cdot \frac{R_L}{R_i + R_L} &\geq 49{,}5\,\mathrm{V} \\ 50 \cdot \frac{1000}{R_i + 1000} &\geq 49{,}5 \end{aligned}$$

Beide Seiten mit $(R_i + 1000)$ multiplizieren und durch $49{,}5$ teilen. Das Ungleichheitszeichen bleibt, weil alles positiv ist:

$$\begin{aligned} R_i + 1000 &\leq \frac{50\,000}{49{,}5} = 1010{,}1 \\ R_i &\leq 10{,}1\,\Omega \end{aligned}$$

## Schritt 6: Zurück zu $R$

$$R = 4 \cdot R_i \leq 4 \cdot 10{,}1\,\Omega = 40{,}4\,\Omega$$

Ein größeres $R$ ergibt ein größeres $R_i$ und damit einen stärkeren Einbruch. Deshalb ist $40{,}4\,\Omega$ eine **Obergrenze**:

$$\boxed{R \leq 40{,}4\,\Omega}$$

::: achtung Richtig runden
Exakt ist $R_{\max} = \frac{4000}{99}\,\Omega = 40{,}404\ldots\,\Omega$. Bei einer Obergrenze rundet man **ab**. Mit $40{,}4\,\Omega$ bricht die Spannung um $0{,}9999\,\%$ ein, das ist gerade noch erlaubt. Aufgerundet auf $40{,}5\,\Omega$ wäre die Bedingung knapp verletzt.
:::

## Probe ohne Ersatzquelle

Direkt gerechnet liegt $R_L$ parallel zur unteren Hälfte. Mit $R = \frac{4000}{99}\,\Omega$ ist $\frac{R}{2} = 20{,}20\,\Omega$:

$$\begin{aligned} \tfrac{R}{2} \parallel R_L &= \frac{20{,}20 \cdot 1000}{1020{,}20}\,\Omega = 19{,}80\,\Omega \\ U_L &= 100\,\mathrm{V} \cdot \frac{19{,}80}{20{,}20 + 19{,}80} = 49{,}5\,\mathrm{V} \;\checkmark \end{aligned}$$

## Was das Ergebnis bedeutet

Ein Poti mit nur $40\,\Omega$ an $100\,\mathrm{V}$ hat einen Haken. Durch das Poti fließen rund $2{,}5\,\mathrm{A}$, durch die Last nur $49{,}5\,\mathrm{mA}$:

| Größe | Wert |
|:---|---:|
| Leistung aus der Quelle | $\approx 250\,\mathrm{W}$ |
| davon in der Last | $\approx 2{,}45\,\mathrm{W}$ |
| [[Wirkungsgrad]] | $\approx 1\,\%$ |

Das Poti wird zur Heizung. Ein **steifer** Spannungsteiler, also einer, der unter Last kaum nachgibt, braucht einen kleinen Innenwiderstand. Dafür muss ein großer Querstrom durch den Teiler fließen, und der kostet Leistung. Genau dieses Spiel zwischen Leistung und Wirkungsgrad zeigt auch die [Brückenschaltung](beitrag.html?b=brueckenschaltung).

::: tipp Wie man das in der Praxis löst
Für eine stabile Spannung unter Last nimmt man keinen reinen Teiler, sondern einen Spannungsregler oder einen Teiler mit nachgeschaltetem Spannungsfolger (Operationsverstärker). Der Teiler sieht dann nur den winzigen Eingangsstrom des Verstärkers und darf hochohmig sein.
:::

## Ergebnis und Merksatz

Allgemein: Darf die Spannung um den Anteil $\varepsilon$ einbrechen, muss gelten

$$\frac{R_L}{R_i + R_L} \geq 1 - \varepsilon \quad\Leftrightarrow\quad R_i \leq R_L \cdot \frac{\varepsilon}{1 - \varepsilon}$$

Für $\varepsilon = 1\,\%$ ist das $R_i \leq \frac{R_L}{99}$.

::: merke
Ein Spannungsteiler bleibt unter Last nur stabil, wenn sein Innenwiderstand klein gegen die Last ist. Der Weg ist immer derselbe: Schaltung auflösen, $U_0$ und $R_i$ bestimmen, Ersatzquelle zeichnen, Last anschließen.
:::

| Schritt | Ergebnis |
|:---|---:|
| erlaubte Lastspannung | $49{,}5\,\mathrm{V}$ |
| Schleiferstellung | Mitte, zweimal $R/2$ |
| Innenwiderstand | $R_i = R/4$ |
| Bedingung | $R_i \leq 10{,}1\,\Omega$ |
| **Potentiometer** | $\mathbf{R \leq 40{,}4\,\Omega}$ |

## Zum Weiterdenken

::: aufgabe 5 % statt 1 %
Wie groß darf $R$ sein, wenn die Spannung um 5 % einbrechen darf?
???
$$\begin{aligned} R_i &\leq 1000\,\Omega \cdot \frac{0{,}05}{0{,}95} = 52{,}6\,\Omega \\ R &\leq 4 \cdot 52{,}6\,\Omega = 210{,}5\,\Omega \end{aligned}$$

Fünfmal so viel Einbruch erlaubt, und das Poti darf gut fünfmal so groß sein. Die Leistung im Poti sinkt entsprechend auf etwa $48\,\mathrm{W}$.
:::

::: aufgabe Schleifer an anderer Stelle
Jetzt sollen unbelastet $25\,\mathrm{V}$ am Abgriff liegen, der Rest bleibt gleich. Wo steht der Schleifer, und wie groß darf $R$ jetzt sein?
???
$25 = 100 \cdot \frac{R_{\text{unten}}}{R}$, also $R_{\text{unten}} = \frac{R}{4}$ und $R_{\text{oben}} = \frac{3R}{4}$.

Innenwiderstand: die beiden Teile parallel,

$$R_i = \frac{\frac{R}{4} \cdot \frac{3R}{4}}{R} = \frac{3}{16}\,R$$

Die Bedingung $R_i \leq \frac{1000}{99}\,\Omega$ bleibt dieselbe, weil wieder 1 % mit $R_L = 1\,\mathrm{k\Omega}$ gefragt ist:

$$R \leq \frac{16}{3} \cdot 10{,}1\,\Omega = 53{,}9\,\Omega$$
:::

::: aufgabe Die ungünstigste Stellung
Steht der Schleifer beim Anteil $\alpha$ von unten, ist $R_i = \alpha(1 - \alpha)\,R$. Bei welcher Stellung ist der Innenwiderstand am größten?
???
$\alpha(1 - \alpha)$ ist eine nach unten geöffnete Parabel mit Nullstellen bei $0$ und $1$. Ihr Maximum liegt in der Mitte, bei $\alpha = \frac{1}{2}$:

$$R_{i,\max} = \tfrac{1}{2} \cdot \tfrac{1}{2} \cdot R = \frac{R}{4}$$

In Mittelstellung gibt das Poti unter Last also am stärksten nach. An den Enden ($\alpha = 0$ oder $1$) ist $R_i = 0$, dort hängt die Last direkt an der Quelle oder an Masse.
:::
