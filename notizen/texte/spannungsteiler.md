---
titel: Widerstandsnetzwerke — Reihe, parallel und der Spannungsteiler
datum: 2026-10-21
fach: Grundlagen der E-Technik
art: theorie
tags: [Widerstand, Reihenschaltung, Parallelschaltung, Leitwert, Spannungsteiler, Stromteiler, Ersatzwiderstand]
teaser: Wie man Widerstände zusammenfasst und warum das aus den Kirchhoffschen Gesetzen folgt. Dazu Leitwert, Strom- und Spannungsteiler, gemischte Schaltungen und was eine Last mit dem Teiler macht.
welle: rechteck
---

Viele Schaltungen bestehen aus Widerständen, die in Reihe oder parallel liegen. Solche Gruppen lassen sich durch **einen einzigen Ersatzwiderstand** ersetzen, und das Netzwerk wird Schritt für Schritt kleiner. Beide Regeln folgen direkt aus den [Kirchhoffschen Gesetzen](beitrag.html?b=kirchhoffsche-gesetze) und dem [[ohmschen Gesetz|ohmsches-gesetz]].

Die wichtigste Anwendung ist der **Spannungsteiler**: Potentiometer, Sensoren, Pegelanpassung, überall stecken zwei Widerstände in Reihe.

Diese Notiz folgt dem Stoff aus ET1, Kapitel 1.3.4.

## Auf einen Blick

::: merke Die Regeln
**Reihe:** Widerstände addieren sich.

$$R = R_1 + R_2 + \dots + R_n$$

**Parallel:** [[Leitwerte|leitwert]] addieren sich.

$$G = G_1 + G_2 + \dots + G_n, \qquad G = \frac{1}{R}$$

**Zwei parallel:** $R_1 \parallel R_2 = \dfrac{R_1\,R_2}{R_1 + R_2}$, also „Produkt durch Summe“. Das gilt nur für zwei.

**Spannungsteiler:** In Reihe teilt sich die Spannung im Verhältnis der Widerstände, $\dfrac{U_j}{U} = \dfrac{R_j}{R}$.

**Stromteiler:** Parallel teilt sich der Strom im Verhältnis der Leitwerte, $\dfrac{I_j}{I} = \dfrac{G_j}{G}$.
:::

## Was ein Ersatzwiderstand ist

Ein **Zweipol** ist ein Bauteil oder eine Kombination von Bauteilen mit zwei Anschlussklemmen. Von außen sieht man nur, welcher Strom bei welcher Spannung fließt, das **Klemmenverhalten**. Was innen verschaltet ist, spielt für den Rest der Schaltung keine Rolle.

Besteht der Zweipol nur aus Widerständen, ist sein Klemmenverhalten einfach $U = R \cdot I$ mit einem einzigen Wert $R$. Diesen Wert nennt man den **Ersatzwiderstand**. Man darf den ganzen Zweipol durch ihn ersetzen, und außen ändert sich nichts.

## 1. Reihenschaltung

Widerstände liegen **in Reihe**, wenn sie hintereinander ohne Abzweig verbunden sind.

<figure class="dia"><svg viewBox="0 0 360 150" role="img" aria-label="Drei Widerstände R1, R2, R3 in Reihe zwischen den Klemmen A und B. Derselbe Strom I fließt durch alle, darunter die Teilspannungen U1, U2, U3 und die Gesamtspannung U.">
<defs><marker id="wn-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M24 50H336"/>
<rect class="b" x="68" y="42" width="44" height="16"/><rect class="b" x="158" y="42" width="44" height="16"/><rect class="b" x="248" y="42" width="44" height="16"/>
<circle class="b" cx="20" cy="50" r="4"/><circle class="b" cx="340" cy="50" r="4"/>
<text class="c" x="20" y="36">A</text><text class="c" x="340" y="36">B</text>
<path class="s" d="M30 50H56" marker-end="url(#wn-a1)"/><text class="c" x="43" y="42">I</text>
<text class="c" x="90" y="34">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="180" y="34">R<tspan dy="3" font-size="9">2</tspan></text><text class="c" x="270" y="34">R<tspan dy="3" font-size="9">3</tspan></text>
<path class="s" d="M70 76H110" marker-end="url(#wn-a1)"/><path class="s" d="M160 76H200" marker-end="url(#wn-a1)"/><path class="s" d="M250 76H290" marker-end="url(#wn-a1)"/>
<text class="c" x="90" y="94">U<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="180" y="94">U<tspan dy="3" font-size="9">2</tspan></text><text class="c" x="270" y="94">U<tspan dy="3" font-size="9">3</tspan></text>
<path class="s" d="M26 116H334" marker-end="url(#wn-a1)"/><text class="c" x="180" y="136">U</text>
</svg><figcaption>Reihe: Durch alle Widerstände fließt derselbe Strom I, die Spannungen addieren sich zu U = U<sub>1</sub> + U<sub>2</sub> + U<sub>3</sub>.</figcaption></figure>

### Herleitung

Zwei Gesetze reichen:

1. **Knotenregel:** An jeder Verbindungsstelle zwischen zwei Widerständen gibt es nur einen Zufluss und einen Abfluss. Durch alle Widerstände fließt also **derselbe Strom** $I$.
2. **Maschenregel:** Schließt man die Masche über die Klemmenspannung $U$, gilt $U_1 + U_2 + \dots + U_n - U = 0$.

Mit $U_j = R_j \cdot I$ für jeden Widerstand:

$$\begin{aligned} U &= R_1 I + R_2 I + \dots + R_n I \\ &= (R_1 + R_2 + \dots + R_n)\,I \end{aligned}$$

Das hat die Form $U = R \cdot I$ mit

$$\boxed{R = \sum_{j=1}^{n} R_j}$$

### Was man daraus ablesen kann

- Der Ersatzwiderstand ist **größer als jeder einzelne** Widerstand. Jeder zusätzliche Widerstand in Reihe macht ihn größer.
- Ein sehr großer Widerstand **dominiert**: $1\,\mathrm{k\Omega}$ in Reihe mit $1\,\Omega$ ist praktisch $1\,\mathrm{k\Omega}$.
- **Die Spannung teilt sich im Verhältnis der Widerstände.** Wegen $U_j = R_j I$ und $U = R\,I$ ist

$$\frac{U_j}{U} = \frac{R_j}{R}$$

Am größten Widerstand fällt die größte Spannung ab. Das ist die **Spannungsteilerregel**, sie gilt für beliebig viele Widerstände in Reihe.

## 2. Parallelschaltung

Widerstände liegen **parallel**, wenn sie alle zwischen denselben zwei Knoten hängen.

<figure class="dia"><svg viewBox="0 0 360 190" role="img" aria-label="Drei Widerstände R1, R2, R3 parallel zwischen einer oberen und einer unteren Leitung. Der Strom I teilt sich in I1, I2, I3, an allen liegt dieselbe Spannung U.">
<defs><marker id="wn-a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M24 40H290M24 160H290M130 40V160M210 40V160M290 40V160"/>
<rect class="b" x="122" y="78" width="16" height="44"/><rect class="b" x="202" y="78" width="16" height="44"/><rect class="b" x="282" y="78" width="16" height="44"/>
<circle class="b" cx="20" cy="40" r="4"/><circle class="b" cx="20" cy="160" r="4"/>
<circle class="f" cx="130" cy="40" r="3"/><circle class="f" cx="210" cy="40" r="3"/><circle class="f" cx="130" cy="160" r="3"/><circle class="f" cx="210" cy="160" r="3"/>
<path class="s" d="M32 40H62" marker-end="url(#wn-a2)"/><text class="c" x="47" y="32">I</text>
<path class="s" d="M130 48V70" marker-end="url(#wn-a2)"/><path class="s" d="M210 48V70" marker-end="url(#wn-a2)"/><path class="s" d="M290 48V70" marker-end="url(#wn-a2)"/>
<text x="140" y="64">I<tspan dy="3" font-size="9">1</tspan></text><text x="220" y="64">I<tspan dy="3" font-size="9">2</tspan></text><text x="300" y="64">I<tspan dy="3" font-size="9">3</tspan></text>
<text x="144" y="106">R<tspan dy="3" font-size="9">1</tspan></text><text x="224" y="106">R<tspan dy="3" font-size="9">2</tspan></text><text x="304" y="106">R<tspan dy="3" font-size="9">3</tspan></text>
<path class="s" d="M80 52V148" marker-end="url(#wn-a2)"/><text x="70" y="104" text-anchor="end">U</text>
</svg><figcaption>Parallel: An allen Widerständen liegt dieselbe Spannung U, die Ströme addieren sich zu I = I<sub>1</sub> + I<sub>2</sub> + I<sub>3</sub>.</figcaption></figure>

### Herleitung

Diesmal sind die Rollen von Strom und Spannung vertauscht:

1. **Maschenregel:** Alle Widerstände hängen zwischen denselben zwei Knoten. An allen liegt also **dieselbe Spannung** $U$.
2. **Knotenregel** am oberen Knoten: $I = I_1 + I_2 + \dots + I_n$.

Mit $I_j = U / R_j$ für jeden Widerstand:

$$\begin{aligned} I &= \frac{U}{R_1} + \frac{U}{R_2} + \dots + \frac{U}{R_n} \\ &= \left(\frac{1}{R_1} + \frac{1}{R_2} + \dots + \frac{1}{R_n}\right) U \end{aligned}$$

Das hat die Form $I = U / R$ mit

$$\boxed{\frac{1}{R} = \sum_{j=1}^{n} \frac{1}{R_j}}$$

### Der Leitwert

Bei Parallelschaltungen rechnet es sich leichter mit dem Kehrwert des Widerstands, dem **Leitwert**:

$$G = \frac{1}{R}, \qquad [G] = 1\,\mathrm{S} = 1\,\frac{1}{\Omega} = 1\,\frac{\mathrm{A}}{\mathrm{V}}$$

Die Einheit heißt **Siemens**. Ein großer Leitwert bedeutet: Der Strom kommt leicht durch. Damit wird die Parallelschaltung genauso einfach wie die Reihe:

$$\boxed{G = \sum_{j=1}^{n} G_j}$$

### Was man daraus ablesen kann

- Der Ersatzwiderstand ist **kleiner als jeder einzelne** Widerstand. Jeder zusätzliche parallele Zweig ist ein weiterer Weg für den Strom.
- Ein sehr kleiner Widerstand **dominiert**: $1\,\Omega$ parallel zu $1\,\mathrm{k\Omega}$ ist praktisch $1\,\Omega$. Im Extremfall schließt ein Draht alles parallel dazu kurz.
- **Zwei parallel:** $R_1 \parallel R_2 = \frac{R_1 R_2}{R_1 + R_2}$. **$n$ gleiche** parallel: $R / n$.
- **Der Strom teilt sich im Verhältnis der Leitwerte.** Wegen $I_j = G_j U$ und $I = G\,U$ ist

$$\frac{I_j}{I} = \frac{G_j}{G}$$

Durch den kleinsten Widerstand fließt der größte Strom. Das ist die **Stromteilerregel**. Für zwei Widerstände in Widerständen geschrieben:

$$I_1 = I \cdot \frac{R_2}{R_1 + R_2}$$

::: achtung Über Kreuz
Beim Stromteiler mit zwei Widerständen steht im Zähler der **andere** Widerstand: Für $I_1$ steht $R_2$ oben. Beim Spannungsteiler steht dagegen der **eigene** Widerstand oben. Wer unsicher ist, prüft mit einem Extremfall: Ist $R_1$ winzig, muss fast der ganze Strom durch $R_1$ fließen.
:::

## 3. Reihe und parallel sind Spiegelbilder

Vertauscht man Strom und Spannung, Widerstand und Leitwert, wird aus der einen Regel die andere:

| | Reihe | parallel |
|:---|:---|:---|
| gemeinsam ist | der Strom | die Spannung |
| es addieren sich | Spannungen | Ströme |
| Ersatzwert | $R = \sum R_j$ | $G = \sum G_j$ |
| Aufteilung | $\frac{U_j}{U} = \frac{R_j}{R}$ | $\frac{I_j}{I} = \frac{G_j}{G}$ |
| Ergebnis ist | größer als jeder | kleiner als jeder |
| es dominiert | der größte | der kleinste |

Dieser Tausch heißt **Dualität**. Er taucht bei der [Stern-Dreieck-Umwandlung](beitrag.html?b=stern-dreieck) wieder auf.

## 4. Gemischte Schaltungen

Die meisten Zweipole sind weder reine Reihe noch reine Parallelschaltung. Man fasst dann **von innen nach außen** zusammen: Man sucht eine Gruppe, die eindeutig in Reihe oder parallel liegt, ersetzt sie durch ihren Ersatzwiderstand und wiederholt das, bis nur noch ein Widerstand übrig ist.

<figure class="dia"><svg viewBox="0 0 360 214" role="img" aria-label="Zweipol mit den Klemmen A und B. Von A führt R1 zum Knoten K. Zwischen K und der unteren Leitung liegen R2 und, daneben, R3 und R4 in Reihe. Die untere Leitung führt zu B.">
<rect class="hl" x="134" y="52" width="32" height="128"/>
<path class="s" d="M60 40H316M60 40V190M150 40V190M60 190H316"/>
<rect class="b" x="52" y="93" width="16" height="44"/>
<rect class="b" x="142" y="58" width="16" height="40"/><rect class="b" x="142" y="132" width="16" height="40"/>
<rect class="b" x="212" y="32" width="44" height="16"/>
<circle class="f" cx="150" cy="40" r="3"/><circle class="f" cx="150" cy="190" r="3"/>
<circle class="b" cx="320" cy="40" r="4"/><circle class="b" cx="320" cy="190" r="4"/>
<text class="c" x="320" y="26">A</text><text class="c" x="320" y="210">B</text><text class="k c" x="150" y="28">K</text>
<text class="c" x="234" y="24">R<tspan dy="3" font-size="9">1</tspan><tspan dy="-3"> = 100 Ω</tspan></text>
<text class="k" x="44" y="111" text-anchor="end">R<tspan dy="3" font-size="8">2</tspan></text><text x="44" y="127" text-anchor="end">300 Ω</text>
<text class="k" x="172" y="76">R<tspan dy="3" font-size="8">3</tspan></text><text x="172" y="92">100 Ω</text>
<text class="k" x="172" y="150">R<tspan dy="3" font-size="8">4</tspan></text><text x="172" y="166">200 Ω</text>
</svg><figcaption>Von innen nach außen: erst R<sub>3</sub> + R<sub>4</sub> (Reihe, markiert), das parallel zu R<sub>2</sub>, dann R<sub>1</sub> in Reihe davor.</figcaption></figure>

**Schritt 1:** $R_3$ und $R_4$ liegen in Reihe, zwischen ihnen zweigt nichts ab.

$$R_3 + R_4 = 100\,\Omega + 200\,\Omega = 300\,\Omega$$

**Schritt 2:** Diese $300\,\Omega$ und $R_2$ hängen beide zwischen dem Knoten K und der unteren Leitung, liegen also parallel.

$$R_2 \parallel (R_3 + R_4) = \frac{300 \cdot 300}{300 + 300}\,\Omega = 150\,\Omega$$

**Schritt 3:** $R_1$ liegt in Reihe davor.

$$R_{AB} = 100\,\Omega + 150\,\Omega = \boxed{250\,\Omega}$$

Allgemein, als eine Formel:

$$\begin{aligned} R_{AB} &= R_1 + R_2 \parallel (R_3 + R_4) \\ &= R_1 + \frac{R_2\,(R_3 + R_4)}{R_2 + R_3 + R_4} \end{aligned}$$

::: tipp Die Klammern gehören dazu
$R_2 \parallel R_3 + R_4$ ist mehrdeutig. Schreib immer $R_2 \parallel (R_3 + R_4)$ oder $(R_2 \parallel R_3) + R_4$, je nachdem, was gemeint ist. Das sind zwei völlig verschiedene Schaltungen.
:::

### Tipps für unübersichtliche Schaltungen

- **Knoten benennen.** Alle Punkte, die nur durch Draht verbunden sind, sind **ein** Knoten, auch wenn sie in der Zeichnung weit auseinanderliegen. Dann prüfen: Welche Widerstände hängen zwischen denselben zwei Knoten? Die liegen parallel.
- **Neu zeichnen.** Klemmen links und rechts, Knoten als dicke Punkte, dazwischen die Widerstände. Oft sieht man die Struktur erst dann.
- **Kurzgeschlossene Widerstände streichen.** Liegen beide Enden eines Widerstands am selben Knoten, fließt durch ihn kein Strom. Er fällt heraus.
- **Offene Enden streichen.** Ein Widerstand, der mit einem Ende nirgends angeschlossen ist, führt keinen Strom und fällt ebenfalls heraus.
- **Die Klemmen entscheiden.** Derselbe Zweipol hat zwischen anderen Klemmen einen anderen Ersatzwiderstand. Immer zuerst klären, zwischen welchen zwei Punkten gefragt ist.
- **Plausibilität prüfen.** Reihe ist größer als der größte Einzelwiderstand, parallel ist kleiner als der kleinste.
- **Wenn nichts in Reihe oder parallel liegt**, etwa bei einer nicht abgeglichenen Brücke, hilft die [Stern-Dreieck-Umwandlung](beitrag.html?b=stern-dreieck) oder das Gleichungssystem mit den [Kirchhoffschen Gesetzen](beitrag.html?b=kirchhoffsche-gesetze).

## 5. Der Spannungsteiler

Zwei Widerstände in Reihe an einer Spannung $U$, abgegriffen wird die Spannung über $R_2$. Durch beide fließt derselbe Strom $I = \dfrac{U}{R_1 + R_2}$. Über $R_2$ fällt also

$$U_2 = I \cdot R_2 = U \cdot \frac{R_2}{R_1 + R_2}$$

ab. Das ist die Spannungsteilerregel aus Abschnitt 1 für zwei Widerstände. Zwei gleiche Widerstände halbieren die Spannung.

::: sim teiler u=12 r1=10k r2=10k rl=10k
Zuerst ohne Last spielen. Dann „Last anschließen“ anhaken und $R_L$ klein ziehen.
:::

### Der Haken: die Last

Sobald man am Ausgang etwas anschließt, etwa einen Sensoreingang, einen Lautsprecher oder ein Messgerät, liegt dessen Widerstand $R_L$ **parallel** zu $R_2$. Der untere Teil des Teilers wird kleiner:

$$R_2 \parallel R_L = \frac{R_2 \cdot R_L}{R_2 + R_L}$$

Damit sinkt $U_2$:

$$U_2 = U \cdot \frac{R_2 \parallel R_L}{R_1 + R_2 \parallel R_L}$$

Wie stark, hängt davon ab, wie groß $R_L$ im Vergleich zu $R_2$ ist:

| $R_1 = R_2$ | $R_L$ | $U_2 / U$ |
|---|---|---:|
| 10 kΩ | ∞ (keine Last) | 0,500 |
| 10 kΩ | 100 kΩ | 0,476 |
| 10 kΩ | 10 kΩ | 0,333 |
| 10 kΩ | 1 kΩ | 0,083 |

::: merke
Ein Spannungsteiler liefert nur dann die berechnete Spannung, wenn die Last deutlich größer ist als $R_2$. Faustregel: Mit $R_L \geq 10 \cdot R_2$ bleibt der Fehler unter 10 %.
:::

::: tipp Zweiter Blick: der Teiler als Ersatzquelle
Aus Sicht der Last ist der Teiler eine [[Ersatzspannungsquelle|ersatzquelle]] mit der Leerlaufspannung und dem Innenwiderstand

$$U_0 = U \cdot \frac{R_2}{R_1 + R_2}, \qquad R_i = R_1 \parallel R_2$$

Den Innenwiderstand sieht man, wenn man die Quelle $U$ durch einen Kurzschluss ersetzt: Dann liegen $R_1$ und $R_2$ parallel. Die Last bekommt

$$U_L = U_0 \cdot \frac{R_L}{R_i + R_L}$$

Der relative Fehler ist also genau $\frac{R_i}{R_i + R_L}$. Weil $R_i \leq R_2$ ist, beträgt er bei $R_L \geq 10 R_2$ höchstens $\frac{1}{11} \approx 9\,\%$. Das ist der Grund für die Faustregel.
:::

::: aufgabe Belasteter Teiler
Ein Teiler aus $R_1 = R_2 = 1\,\mathrm{k\Omega}$ hängt an $12\,\mathrm{V}$. Jemand schließt eine Last mit $R_L = 1\,\mathrm{k\Omega}$ an. Welche Spannung misst man jetzt an $R_2$?
???
Parallelschaltung: $R_2 \parallel R_L = \frac{1\,\mathrm{k\Omega} \cdot 1\,\mathrm{k\Omega}}{2\,\mathrm{k\Omega}} = 500\,\Omega$.

$$U_2 = 12\,\mathrm{V} \cdot \frac{500\,\Omega}{1000\,\Omega + 500\,\Omega} = 4\,\mathrm{V}$$

Statt der erwarteten 6 V nur noch 4 V, ein Drittel weniger.

Mit der Ersatzquelle geht es genauso: $U_0 = 6\,\mathrm{V}$, $R_i = 500\,\Omega$, also $U_L = 6\,\mathrm{V} \cdot \frac{1000}{1500} = 4\,\mathrm{V}$ ✓
:::

## 6. Im Labor

Der Baustein **Widerstand** im [Labor](../labor/) ist genau so ein Teiler: Dein $R$ sitzt in Reihe vor einer festen Last von 10 kΩ. Bei $R = 10\,\mathrm{k\Omega}$ kommt die halbe Spannung an, das hörst du als leiseren Ton.

## Typische Fehler

::: achtung
- **„Produkt durch Summe“ für drei Widerstände.** $\frac{R_1 R_2 R_3}{R_1 + R_2 + R_3}$ ist falsch, schon die Einheit stimmt nicht ($\Omega^2$). Für drei oder mehr: Leitwerte addieren oder schrittweise je zwei zusammenfassen.
- **Kehrwert vergessen.** $\frac{1}{R} = \frac{1}{R_1} + \frac{1}{R_2}$ liefert erst $\frac{1}{R}$. Am Ende muss man noch umdrehen.
- **Reihe gesehen, wo ein Abzweig ist.** Zweigt zwischen zwei Widerständen etwas ab, liegen sie nicht in Reihe, auch wenn sie in der Zeichnung nebeneinander stehen.
- **Parallel gesehen, wo nur ein Knoten gemeinsam ist.** Parallel heißt: **beide** Enden an denselben Knoten.
- **Stromteiler und Spannungsteiler vertauscht.** Beim Stromteiler steht der andere Widerstand im Zähler.
- **Last vergessen.** Die Teilerformel gilt nur unbelastet. Mit Last liegt $R_L$ parallel zu $R_2$.
:::

## Üben

::: aufgabe Reihe
$100\,\Omega$, $220\,\Omega$ und $680\,\Omega$ liegen in Reihe an $10\,\mathrm{V}$. Wie groß ist der Ersatzwiderstand, und welche Spannung fällt an $220\,\Omega$ ab?
???
$R = 100 + 220 + 680 = 1000\,\Omega$, also $I = 10\,\mathrm{mA}$.

$$U_{220} = 10\,\mathrm{V} \cdot \frac{220}{1000} = 2{,}2\,\mathrm{V}$$
:::

::: aufgabe Parallel
Wie groß ist $6\,\Omega \parallel 3\,\Omega$? Und drei Widerstände mit je $300\,\Omega$ parallel?
???
$$6 \parallel 3 = \frac{6 \cdot 3}{6 + 3}\,\Omega = 2\,\Omega$$

In Leitwerten: $\frac{1}{6} + \frac{1}{3} = \frac{1}{2}\,\mathrm{S}$, also $2\,\Omega$ ✓

Drei gleiche: $300\,\Omega / 3 = 100\,\Omega$.
:::

::: aufgabe Stromteiler
In die Parallelschaltung aus $6\,\Omega$ und $3\,\Omega$ fließen $3\,\mathrm{A}$. Wie teilt sich der Strom auf?
???
Über die Spannung: $U = 3\,\mathrm{A} \cdot 2\,\Omega = 6\,\mathrm{V}$, also $I_6 = 1\,\mathrm{A}$ und $I_3 = 2\,\mathrm{A}$.

Mit der Stromteilerregel, der andere Widerstand im Zähler:

$$I_6 = 3\,\mathrm{A} \cdot \frac{3}{6 + 3} = 1\,\mathrm{A}$$

Durch den kleineren Widerstand fließt der größere Strom ✓
:::

::: aufgabe Andere Klemmen
Im Beispiel aus Abschnitt 4: Welchen Widerstand misst man zwischen dem Knoten K und der Klemme B? Und welchen zwischen A und B, wenn man $R_4$ kurzschließt?
???
**Zwischen K und B:** $R_1$ hängt dann mit einem Ende an der offenen Klemme A und führt keinen Strom. Übrig bleibt

$$R_2 \parallel (R_3 + R_4) = 150\,\Omega$$

**$R_4$ kurzgeschlossen:** Aus $R_3 + R_4$ wird $100\,\Omega$.

$$R_{AB} = 100 + 300 \parallel 100 = 100 + 75 = 175\,\Omega$$
:::

<figure class="dia"><svg viewBox="0 0 360 170" role="img" aria-label="Kettenschaltung: Von A über R1 zum Knoten X, von X über R2 nach unten zu B. Von X über R3 zum Knoten Y, von Y über R4 nach unten.">
<path class="s" d="M24 40H240V140H24M130 40V140"/>
<rect class="b" x="50" y="32" width="44" height="16"/><rect class="b" x="160" y="32" width="44" height="16"/>
<rect class="b" x="122" y="68" width="16" height="44"/><rect class="b" x="232" y="68" width="16" height="44"/>
<circle class="f" cx="130" cy="40" r="3"/><circle class="f" cx="130" cy="140" r="3"/>
<circle class="b" cx="20" cy="40" r="4"/><circle class="b" cx="20" cy="140" r="4"/>
<text class="c" x="20" y="26">A</text><text class="c" x="20" y="162">B</text>
<text class="k c" x="130" y="24">X</text><text class="k c" x="240" y="24">Y</text>
<text class="c" x="72" y="24">R<tspan dy="3" font-size="9">1</tspan><tspan dy="-3"> = 10 Ω</tspan></text>
<text class="c" x="182" y="24">R<tspan dy="3" font-size="9">3</tspan><tspan dy="-3"> = 10 Ω</tspan></text>
<text class="k" x="144" y="86">R<tspan dy="3" font-size="8">2</tspan></text><text x="144" y="102">20 Ω</text>
<text class="k" x="254" y="86">R<tspan dy="3" font-size="8">4</tspan></text><text x="254" y="102">10 Ω</text>
</svg><figcaption>Eine Kettenschaltung für die nächste Aufgabe.</figcaption></figure>

::: aufgabe Kettenschaltung
An der Kettenschaltung im Bild liegen $U_{AB} = 10\,\mathrm{V}$. Wie groß sind der Ersatzwiderstand, der Strom aus A und die Spannung an $R_4$?
???
Von hinten nach vorn zusammenfassen:

$$\begin{aligned} R_3 + R_4 &= 20\,\Omega \\ R_2 \parallel 20\,\Omega &= 10\,\Omega \\ R_{AB} = R_1 + 10\,\Omega &= 20\,\Omega \end{aligned}$$

Also fließen $I = 10\,\mathrm{V} / 20\,\Omega = 0{,}5\,\mathrm{A}$ aus A.

Die Spannung an $R_4$ mit zwei Spannungsteilern hintereinander. Am Knoten X teilen $R_1$ und die restlichen $10\,\Omega$ die Spannung halb-halb, $U_X = 5\,\mathrm{V}$. Diese $5\,\mathrm{V}$ teilen sich auf $R_3$ und $R_4$ wieder halb-halb:

$$U_{R4} = 5\,\mathrm{V} \cdot \frac{10}{10 + 10} = 2{,}5\,\mathrm{V}$$
:::

::: aufgabe Wie groß muss die Last sein?
Ein Teiler aus $R_1 = R_2 = 10\,\mathrm{k\Omega}$ soll mit Last höchstens 1 % unter seiner Leerlaufspannung liegen. Wie groß muss $R_L$ mindestens sein?
???
Innenwiderstand $R_i = 10\,\mathrm{k\Omega} \parallel 10\,\mathrm{k\Omega} = 5\,\mathrm{k\Omega}$. Der Fehler ist $\frac{R_i}{R_i + R_L}$:

$$\begin{aligned} \frac{R_i}{R_i + R_L} &\leq 0{,}01 \\ \Rightarrow\quad R_L &\geq 99 \cdot R_i = 495\,\mathrm{k\Omega} \end{aligned}$$

Für 1 % braucht man also rund das Fünfzigfache von $R_2$, nicht das Zehnfache.
:::
