---
titel: Ersatzwiderstand einer Brücke mit der Dreieck-Stern-Umwandlung
datum: 2026-10-23
fach: ET1 · Rechenübung 2
art: rechnung
aufgabe: 2.5
tags: [Dreieck-Stern, Brückenschaltung, Ersatzwiderstand]
teaser: Aufgabe 2.5 Schritt für Schritt: Dreieck A–C–D in einen Stern umwandeln, neu zeichnen, zusammenfassen. Ergebnis 164,77 Ω.
welle: dreieck
---

Die komplette Rechnung zu Aufgabe 2.5 aus der Rechenübung 2. Wie die Umwandlung allgemein funktioniert und woher die Formeln kommen, steht in der eigenen Notiz [Stern-Dreieck-Umwandlung — so geht's](beitrag.html?b=stern-dreieck).

## Die Aufgabe

> **A2.5** Berechnen Sie den Ersatzwiderstand der skizzierten Schaltung mit Hilfe der Dreieck-Stern-Umwandlung.

Gesucht ist $R_{AB}$ zwischen den Klemmen A und B. In der Angabe tragen die Widerstände nur Werte. Damit man über sie reden kann, bekommen sie Namen nach den Knoten, zwischen denen sie liegen:

| Widerstand | zwischen | Wert |
|:---|:---|---:|
| $R_{AC}$ | A und C | $220\,\Omega$ |
| $R_{AD}$ | A und D | $100\,\Omega$ |
| $R_{CD}$ | C und D | $1000\,\Omega$ |
| $R_{CB}$ | C und B | $130\,\Omega$ |
| $R_{DB}$ | D und B | $220\,\Omega$ |

<figure class="dia"><svg viewBox="0 0 360 230" role="img" aria-label="Brückenschaltung zwischen A und B: oben R_AC und R_CB über Knoten C, unten R_AD und R_DB über Knoten D, in der Mitte R_CD von C nach D. Das Dreieck aus R_AC, R_AD und R_CD ist markiert.">
<rect class="hl" x="40" y="46" width="140" height="138"/>
<path class="s" d="M16 115H40M40 46V184M40 46H320M40 184H320M180 46V184M320 46V184M320 115H344"/>
<rect class="b" x="88" y="38" width="44" height="16"/><rect class="b" x="228" y="38" width="44" height="16"/>
<rect class="b" x="88" y="176" width="44" height="16"/><rect class="b" x="228" y="176" width="44" height="16"/>
<rect class="b" x="172" y="93" width="16" height="44"/>
<circle class="f" cx="40" cy="115" r="3"/><circle class="f" cx="320" cy="115" r="3"/><circle class="f" cx="180" cy="46" r="3"/><circle class="f" cx="180" cy="184" r="3"/>
<circle class="b" cx="12" cy="115" r="4"/><circle class="b" cx="348" cy="115" r="4"/>
<text class="c" x="12" y="100">A</text><text class="c" x="348" y="100">B</text><text class="c" x="180" y="34">C</text><text class="c" x="180" y="207">D</text>
<text class="k c" x="110" y="14">R<tspan dy="3" font-size="8">AC</tspan></text><text class="c" x="110" y="29">220 Ω</text>
<text class="k c" x="250" y="14">R<tspan dy="3" font-size="8">CB</tspan></text><text class="c" x="250" y="29">130 Ω</text>
<text class="c" x="110" y="209">100 Ω</text><text class="k c" x="110" y="223">R<tspan dy="3" font-size="8">AD</tspan></text>
<text class="c" x="250" y="209">220 Ω</text><text class="k c" x="250" y="223">R<tspan dy="3" font-size="8">DB</tspan></text>
<text class="k" x="196" y="111">R<tspan dy="3" font-size="8">CD</tspan></text><text x="196" y="127">1000 Ω</text>
<text class="k c" x="108" y="119">DREIECK A–C–D</text>
</svg><figcaption>Die Schaltung aus der Angabe. Das markierte Dreieck A–C–D wird in einen Stern umgewandelt.</figcaption></figure>

## 1. Warum umwandeln?

- **Keine Reihe:** $R_{AC}$ und $R_{CB}$ liegen nicht in Reihe, weil am Knoten C $R_{CD}$ abzweigt. Unten gilt dasselbe für D.
- **Keine Parallelschaltung:** $R_{AC}$ und $R_{AD}$ teilen sich nur den Knoten A, enden aber an C und D.
- **Kein Abgleich:** Wäre die Brücke abgeglichen, flösse durch $R_{CD}$ kein Strom, und man könnte ihn weglassen (siehe [Brückenschaltung](beitrag.html?b=brueckenschaltung)). Dafür müssten beide Zweige im selben Verhältnis teilen. Das tun sie nicht:

$$\begin{aligned} \frac{R_{AC}}{R_{CB}} &= \frac{220}{130} \approx 1{,}69 \\ \frac{R_{AD}}{R_{DB}} &= \frac{100}{220} \approx 0{,}45 \end{aligned}$$

Also muss eine Umwandlung her, und die Aufgabe verlangt Dreieck → Stern.

## 2. Das Dreieck in einen Stern umwandeln

Umgewandelt wird das Dreieck aus $R_{AC}$, $R_{AD}$ und $R_{CD}$. An seine Stelle tritt ein Stern mit $R_A$, $R_C$, $R_D$ und einem neuen Sternpunkt S.

::: merke
Sternwiderstand am Knoten X = Produkt der **zwei Dreieckswiderstände, die an X anliegen**, geteilt durch die Summe aller drei. Die Herleitung steht in der [How-to-Notiz](beitrag.html?b=stern-dreieck).
:::

$$\begin{aligned} S &= R_{AC} + R_{AD} + R_{CD} \\ &= 220\,\Omega + 100\,\Omega + 1000\,\Omega = 1320\,\Omega \end{aligned}$$

$$\begin{aligned} R_A &= \frac{R_{AC}\,R_{AD}}{S} = \frac{220 \cdot 100}{1320}\,\Omega \\ &\approx 16{,}67\,\Omega \\[6pt] R_C &= \frac{R_{AC}\,R_{CD}}{S} = \frac{220 \cdot 1000}{1320}\,\Omega \\ &\approx 166{,}67\,\Omega \\[6pt] R_D &= \frac{R_{AD}\,R_{CD}}{S} = \frac{100 \cdot 1000}{1320}\,\Omega \\ &\approx 75{,}76\,\Omega \end{aligned}$$

Exakt sind das $R_A = \frac{50}{3}\,\Omega$, $R_C = \frac{500}{3}\,\Omega$ und $R_D = \frac{2500}{33}\,\Omega$.

**Probe** mit der Messung A–C, also D offen. Im Stern liegen dann nur $R_A$ und $R_C$ in Reihe, im Dreieck liegt $R_{AC}$ parallel zum Umweg über D. Beides muss gleich sein:

$$\begin{aligned} R_A + R_C &= 16{,}67\,\Omega + 166{,}67\,\Omega \\ &= 183{,}33\,\Omega \\[6pt] R_{AC} \parallel (R_{AD} + R_{CD}) &= \frac{220 \cdot 1100}{1320}\,\Omega \\ &= 183{,}33\,\Omega \;\checkmark \end{aligned}$$

## 3. Ersatzschaltung zeichnen

Die Knoten A, C und D bleiben, der Sternpunkt S kommt dazu, die drei Dreieckswiderstände verschwinden. $R_{CB}$ und $R_{DB}$ hängen unverändert an C und D.

<figure class="dia"><svg viewBox="0 0 360 230" role="img" aria-label="Ersatzschaltung: Von A über R_A zum Sternpunkt S. Von S oben über R_C, Knoten C und R_CB nach B, unten über R_D, Knoten D und R_DB nach B.">
<rect class="hl" x="40" y="36" width="160" height="158"/>
<path class="s" d="M16 115H120M120 46V184M120 46H320M120 184H320M320 46V184M320 115H344"/>
<rect class="b" x="44" y="107" width="44" height="16"/>
<rect class="b" x="148" y="38" width="44" height="16"/><rect class="b" x="248" y="38" width="44" height="16"/>
<rect class="b" x="148" y="176" width="44" height="16"/><rect class="b" x="248" y="176" width="44" height="16"/>
<circle class="f" cx="120" cy="115" r="3"/><circle class="f" cx="320" cy="115" r="3"/><circle class="f" cx="220" cy="46" r="3"/><circle class="f" cx="220" cy="184" r="3"/>
<circle class="b" cx="12" cy="115" r="4"/><circle class="b" cx="348" cy="115" r="4"/>
<text class="c" x="12" y="100">A</text><text class="c" x="348" y="100">B</text><text class="c" x="220" y="34">C</text><text class="c" x="220" y="207">D</text>
<text class="k" x="128" y="110">S</text><text class="k c" x="164" y="119">STERN</text>
<text class="k c" x="66" y="87">R<tspan dy="3" font-size="8">A</tspan></text><text class="c" x="66" y="101">16,67 Ω</text>
<text class="k c" x="170" y="14">R<tspan dy="3" font-size="8">C</tspan></text><text class="c" x="170" y="29">166,67 Ω</text>
<text class="k c" x="270" y="14">R<tspan dy="3" font-size="8">CB</tspan></text><text class="c" x="270" y="29">130 Ω</text>
<text class="c" x="170" y="209">75,76 Ω</text><text class="k c" x="170" y="223">R<tspan dy="3" font-size="8">D</tspan></text>
<text class="c" x="270" y="209">220 Ω</text><text class="k c" x="270" y="223">R<tspan dy="3" font-size="8">DB</tspan></text>
</svg><figcaption>Nach der Umwandlung: R<sub>A</sub> vorn in Reihe, dahinter zwei Zweige von S nach B, die parallel liegen.</figcaption></figure>

Jetzt passt alles: Durch $R_A$ fließt der gesamte Strom. Von S nach B führen zwei Zweige, in denen jeweils zwei Widerstände ohne Abzweig hintereinander liegen.

## 4. Zusammenfassen

**Reihe im oberen Zweig:**

$$R_C + R_{CB} = 166{,}67\,\Omega + 130\,\Omega = 296{,}67\,\Omega$$

**Reihe im unteren Zweig:**

$$R_D + R_{DB} = 75{,}76\,\Omega + 220\,\Omega = 295{,}76\,\Omega$$

**Beide Zweige parallel**, denn beide liegen zwischen S und B:

$$\frac{296{,}67 \cdot 295{,}76}{296{,}67 + 295{,}76}\,\Omega = 148{,}11\,\Omega$$

**$R_A$ in Reihe davor:**

$$R_{AB} = 16{,}667\,\Omega + 148{,}106\,\Omega = \boxed{164{,}77\,\Omega}$$

Als eine Formel:

$$R_{AB} = R_A + \frac{(R_C + R_{CB})(R_D + R_{DB})}{R_C + R_{CB} + R_D + R_{DB}}$$

::: achtung Rundung
Exakt ist $R_{AB} = \frac{64426}{391}\,\Omega = 164{,}772\ldots\,\Omega$. Wer die schon gerundeten Werte $16{,}67 + 148{,}11$ addiert, bekommt $164{,}78\,\Omega$. Das ist ein Rundungsartefakt. Deshalb Zwischenergebnisse mit einer Stelle mehr mitnehmen oder mit Brüchen rechnen.
:::

## 5. Kontrolle

**Grenzfälle:** Ersetzt man den Querwiderstand $R_{CD}$ durch einen Kurzschluss ($R_{AB,0}$) bzw. eine Unterbrechung ($R_{AB,\infty}$), lässt sich alles direkt rechnen. Das echte Ergebnis muss dazwischen liegen:

$$\begin{aligned} R_{AB,0} &= (220 \parallel 100)\,\Omega + (130 \parallel 220)\,\Omega \\ &= 150{,}46\,\Omega \\[6pt] R_{AB,\infty} &= (220 + 130)\,\Omega \parallel (100 + 220)\,\Omega \\ &= 167{,}16\,\Omega \end{aligned}$$

$$150{,}46\,\Omega < 164{,}77\,\Omega < 167{,}16\,\Omega \;\checkmark$$

Weil $R_{CD} = 1\,\mathrm{k\Omega}$ groß ist gegenüber den anderen Widerständen, liegt das Ergebnis nah am offenen Fall.

::: herleitung Probe ohne Umwandlung: Knotenpotentiale
Man schickt gedanklich $1\,\mathrm{A}$ in A hinein und legt B auf $0\,\mathrm{V}$. Dann ist $\varphi_A$ in Volt zahlenmäßig gleich $R_{AB}$ in Ohm. [[Knotenregel]] an A, C und D:

$$\begin{aligned} \text{A:} \quad \frac{\varphi_A - \varphi_C}{220\,\Omega} + \frac{\varphi_A - \varphi_D}{100\,\Omega} &= 1\,\mathrm{A} \\ \text{C:} \quad \frac{\varphi_C - \varphi_A}{220\,\Omega} + \frac{\varphi_C - \varphi_D}{1000\,\Omega} + \frac{\varphi_C}{130\,\Omega} &= 0 \\ \text{D:} \quad \frac{\varphi_D - \varphi_A}{100\,\Omega} + \frac{\varphi_D - \varphi_C}{1000\,\Omega} + \frac{\varphi_D}{220\,\Omega} &= 0 \end{aligned}$$

Gelöst: $\varphi_C \approx 64{,}90\,\mathrm{V}$, $\varphi_D \approx 110{,}17\,\mathrm{V}$, $\varphi_A \approx 164{,}77\,\mathrm{V}$. Also $R_{AB} = 164{,}77\,\Omega$ ✓
:::

::: aufgabe Anderer Weg: Dreieck C–D–B
Statt A–C–D lässt sich auch das Dreieck C–D–B in einen Stern umwandeln. Kommt dasselbe heraus?
???
Das Dreieck besteht aus $R_{CD} = 1000\,\Omega$, $R_{CB} = 130\,\Omega$ und $R_{DB} = 220\,\Omega$, also ist $S' = 1350\,\Omega$:

$$\begin{aligned} R_C' &= \frac{1000 \cdot 130}{1350}\,\Omega \approx 96{,}30\,\Omega \\ R_D' &= \frac{1000 \cdot 220}{1350}\,\Omega \approx 162{,}96\,\Omega \\ R_B' &= \frac{130 \cdot 220}{1350}\,\Omega \approx 21{,}19\,\Omega \end{aligned}$$

Jetzt laufen von A zwei Zweige zum neuen Sternpunkt, und $R_B'$ hängt dahinter:

$$\begin{aligned} R_{AC} + R_C' &= 316{,}30\,\Omega \\ R_{AD} + R_D' &= 262{,}96\,\Omega \\ \frac{316{,}30 \cdot 262{,}96}{579{,}26}\,\Omega &= 143{,}59\,\Omega \\ R_{AB} &= 143{,}59\,\Omega + 21{,}19\,\Omega \\ &= 164{,}77\,\Omega \;\checkmark \end{aligned}$$

Ja. Welches Dreieck man umwandelt, ist für das Ergebnis egal.
:::

## Zum Weiterdenken

::: aufgabe Strom durch $R_{CD}$
Wie groß ist der Strom durch $R_{CD}$, wenn $1\,\mathrm{A}$ in A hineinfließt? Rechne mit der Ersatzschaltung.
???
In der Ersatzschaltung gibt es die Knoten C und D noch, und ihre Potentiale stimmen mit dem Original überein. Mit B auf $0\,\mathrm{V}$:

$$\begin{aligned} \varphi_S &= 1\,\mathrm{A} \cdot 148{,}11\,\Omega = 148{,}11\,\mathrm{V} \\ I_{\text{oben}} &= \frac{148{,}11\,\mathrm{V}}{296{,}67\,\Omega} = 0{,}4992\,\mathrm{A} \\ I_{\text{unten}} &= \frac{148{,}11\,\mathrm{V}}{295{,}76\,\Omega} = 0{,}5008\,\mathrm{A} \end{aligned}$$

$$\begin{aligned} \varphi_C &= I_{\text{oben}} \cdot R_{CB} = 64{,}90\,\mathrm{V} \\ \varphi_D &= I_{\text{unten}} \cdot R_{DB} = 110{,}17\,\mathrm{V} \end{aligned}$$

Erst jetzt zurück in die Originalschaltung, in der $R_{CD}$ wirklich zwischen C und D liegt:

$$\begin{aligned} I_{CD} &= \frac{\varphi_D - \varphi_C}{R_{CD}} = \frac{45{,}27\,\mathrm{V}}{1000\,\Omega} \\ &\approx 45{,}3\,\mathrm{mA} \end{aligned}$$

Der Strom fließt von D nach C, weil D höher liegt. Die Ströme durch die Sternwiderstände selbst ($I_A = 1\,\mathrm{A}$ usw.) gibt es im Original nicht.
:::

::: aufgabe $R_{CD}$ verdoppeln
$R_{CD}$ wird von $1\,\mathrm{k\Omega}$ auf $2\,\mathrm{k\Omega}$ verdoppelt. Wird $R_{AB}$ größer oder kleiner? Erst ohne Rechnung überlegen.
???
Größer: Ein größerer Einzelwiderstand macht den Ersatzwiderstand nie kleiner. Über $167{,}16\,\Omega$ (Querzweig offen) kommt er aber nie hinaus.

Gerechnet: $S = 2320\,\Omega$, $R_A = 9{,}48\,\Omega$, $R_C = 189{,}66\,\Omega$, $R_D = 86{,}21\,\Omega$, damit $R_{AB} \approx 165{,}88\,\Omega$.
:::

::: aufgabe Brücke abgleichen
Welchen Wert müsste $R_{CB}$ haben, damit die Brücke abgeglichen ist? Wie groß ist $R_{AB}$ dann?
???
Abgleich: $R_{AC}\,R_{DB} = R_{AD}\,R_{CB}$, also

$$R_{CB} = \frac{R_{AC}\,R_{DB}}{R_{AD}} = \frac{220 \cdot 220}{100}\,\Omega = 484\,\Omega$$

Dann fließt durch $R_{CD}$ kein Strom, und man darf ihn weglassen:

$$\begin{aligned} R_{AB} &= (220 + 484)\,\Omega \parallel (100 + 220)\,\Omega \\ &= 704\,\Omega \parallel 320\,\Omega = 220\,\Omega \end{aligned}$$

Das gilt für jeden Wert von $R_{CD}$.
:::

## Ergebnis auf einen Blick

| Schritt | Ergebnis |
|:---|:---|
| Summe der Dreieckswiderstände | $S = 1320\,\Omega$ |
| Sternwiderstand $R_A$ | $16{,}67\,\Omega$ |
| Sternwiderstand $R_C$ | $166{,}67\,\Omega$ |
| Sternwiderstand $R_D$ | $75{,}76\,\Omega$ |
| oberer Zweig $R_C + R_{CB}$ | $296{,}67\,\Omega$ |
| unterer Zweig $R_D + R_{DB}$ | $295{,}76\,\Omega$ |
| beide Zweige parallel | $148{,}11\,\Omega$ |
| **Ersatzwiderstand** $R_{AB}$ | $\mathbf{164{,}77\,\Omega}$ |

## Nachgerechnet in Python

Mit `Fraction` rechnet Python exakt mit Brüchen, Rundungsfehler gibt es dann gar nicht erst:

```python
from fractions import Fraction

def parallel(Rx, Ry):
    return Rx * Ry / (Rx + Ry)

def dreieck_zu_stern(R_AC, R_AD, R_CD):
    S = R_AC + R_AD + R_CD
    R_A = R_AC * R_AD / S      # die zwei Widerstände, die an A anliegen
    R_C = R_AC * R_CD / S
    R_D = R_AD * R_CD / S
    return R_A, R_C, R_D

R_A, R_C, R_D = dreieck_zu_stern(Fraction(220), Fraction(100), Fraction(1000))
R_AB = R_A + parallel(R_C + 130, R_D + 220)
print(R_AB, float(R_AB))   # 64426/391 164.77237851662403
```
