---
titel: Ersatzspannungs- und Ersatzstromquelle — drei Quellen, ein Knoten
datum: 2026-10-27
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.3
tags: [Ersatzspannungsquelle, Ersatzstromquelle, Thévenin, Norton, Knotenpotential, Innenwiderstand]
teaser: Aufgabe 3.3 komplett, Schritt für Schritt: Zwei Spannungsquellen, eine Stromquelle und fünf Widerstände werden zu einer einzigen Quelle mit Innenwiderstand. Der Trick ist, dass es nur einen unbekannten Knoten gibt. Dazu ein Widerstand, der gar nichts tut, und die Frage, warum die Knotenspannung im Kurzschluss eine andere ist.
welle: rechteck
---

In [A3.2](beitrag.html?b=ersatzspannungsquelle) war das Netzwerk hinter den Klemmen noch klein: eine Quelle, drei Widerstände. Hier stecken drei Quellen drin, davon eine Stromquelle, und fünf Widerstände. Das Ziel ist dasselbe: Von den Klemmen A und B aus soll das Ganze durch eine einzige [[Ersatzquelle|ersatzquelle]] ersetzt werden, einmal als Spannungsquelle mit Widerstand in Reihe (Thévenin), einmal als Stromquelle mit Widerstand parallel (Norton).

Das klingt nach viel Rechnerei, ist aber überschaubar, sobald man eine Sache sieht: Die Schaltung hat nur **einen** Knoten, dessen Potential unbekannt ist. Eine Unbekannte, eine Gleichung. Wer das erkennt, braucht kein Gleichungssystem.

Die Rechnung unten ist vollständig, jeder Umformungsschritt steht da. Zwischendurch gibt es Tipps, Abkürzungen für die Prüfung und am Ende die typischen Fehler. Gebraucht werden die [[Knotenregel|knotenregel]], die [[Maschenregel|maschenregel]] und [Reihe und parallel](beitrag.html?b=spannungsteiler).

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

1. **(i)** die **Ersatzspannungsquelle**: Quellenspannung $U_q$ und Innenwiderstand $R_i$,
2. **(ii)** die **Ersatzstromquelle**: Quellenstrom $I_q$ und Innenwiderstand $R_i'$.

Die Angabe ist allgemein, die Ergebnisse sind Formeln. Damit man auch Zahlen sieht, rechne ich nebenher mit Beispielwerten. Sie stehen nicht in der Angabe und sind so gewählt, dass glatte Zahlen herauskommen:

| Größe | Wert | Größe | Wert |
|:---|---:|:---|---:|
| $U_{q1}$ | $12\,\mathrm{V}$ | $R_1$, $R_4$ | je $2\,\Omega$ |
| $U_{q2}$ | $4\,\mathrm{V}$ | $R_2$ | $4\,\Omega$ |
| $I_{q3}$ | $1\,\mathrm{A}$ | $R_3$ | $10\,\Omega$ |
| | | $R_5$ | $3\,\Omega$ |

## 0. Das Wesen

- Von den Klemmen A–B aus gesehen ist die Schaltung eine Black Box.
- Eine lineare Black Box zeigt nach außen nur eine Gerade im $U$-$I$-Diagramm.
- Eine Gerade ist durch zwei Punkte festgelegt.
- **Leerlauf:** $I = 0 \;\Rightarrow\; U = U_q$.
- **Kurzschluss:** $U = 0 \;\Rightarrow\; I = I_q$.
- Die Steigung dazwischen ist der Innenwiderstand: $R_i = \dfrac{U_q}{I_q}$.

Warum das so ist und warum zwei Punkte wirklich reichen, steht ausführlich in [A3.2](beitrag.html?b=ersatzspannungsquelle).

::: tipp Reihenfolge, die sich fast immer lohnt
Zuerst $R_i$, weil es nur Reihe und parallel braucht und keinen einzigen Strom. Dann den Leerlauf oder den Kurzschluss, je nachdem, was einfacher aussieht. Den dritten Wert über $U_q = R_i \cdot I_q$, und wenn Zeit ist, direkt als Probe. Diese Lösung rechnet alle drei aus, damit am Ende eine echte Probe dasteht.
:::

## 1. Vorbemerkung: $R_3$ ist wirkungslos

- $R_3$ liegt in Reihe mit der idealen Stromquelle $I_{q3}$.
- Der Strom in diesem Zweig ist immer $I_{q3}$, unabhängig von $R_3$.
- Beim Deaktivieren wird $I_{q3}$ zur Unterbrechung, dann hängt $R_3$ ins Leere.
- $R_3$ taucht daher weder in $R_i$ noch in $U_q$ noch in $I_q$ auf.

Eine ideale Stromquelle erzwingt ihren Strom, egal was sonst im Zweig hängt. Für den Rest der Schaltung sieht der Zweig deshalb immer gleich aus: Er schiebt $I_{q3}$ in den Knoten $K$, Punkt. Ob $R_3 = 1\,\Omega$ oder $1\,\mathrm{M\Omega}$ ist, merkt man an den Klemmen nicht.

::: info Wofür ist $R_3$ dann gut?
Wirkungslos heißt nur: nach außen. Innen ändert $R_3$ die Spannung an der Stromquelle und damit, wie viel Leistung sie liefern muss. Das ist die Aufgabe „Wer zahlt für $R_3$?“ [ganz unten](#zum-weiterdenken). Genauso gilt umgekehrt: Ein Widerstand **parallel** zu einer idealen Spannungsquelle ist nach außen wirkungslos, die Quelle hält ihre Spannung trotzdem.
:::

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

Der Grund: Eine Spannungsquelle mit $U_q = 0$ hält null Volt zwischen ihren Anschlüssen, bei jedem Strom. Das macht ein Draht. Eine Stromquelle mit $I_q = 0$ lässt null Ampere durch, bei jeder Spannung. Das macht ein Loch.

::: tipp Eselsbrücke
Man setzt die Größe null, die die Quelle festhält. Spannung null ist ein Draht, Strom null ist ein Loch.
:::

**Von A–B in die Schaltung schauen**

Ein Ohmmeter an A und B schickt einen Prüfstrom in Klemme A. Der muss zuerst durch $R_5$ und kommt dann in $K$ an. Von dort hat er zwei Wege zum Bezugsknoten: nach links über $R_4$, den Draht anstelle von $U_{q1}$ und $R_1$, oder nach unten über den Draht anstelle von $U_{q2}$ und $R_2$. Der Weg über $R_3$ ist durch die offene Stromquelle versperrt.

- Zwischen $K$ und Bezug liegen $R_1 + R_4$ und $R_2$ parallel.
- Dazu liegt $R_5$ in Reihe.

$$R_i = R_5 + R_2 \parallel (R_1 + R_4)$$

**Parallelschaltung ausgeschrieben**

Abkürzung: $R_p = R_2 \parallel (R_1 + R_4)$.

$$R_p = \frac{(R_1 + R_4)\,R_2}{R_1 + R_2 + R_4}$$

::: beispiel Mit Zahlen
$$\begin{aligned} R_p &= \frac{(2 + 2) \cdot 4}{2 + 4 + 2}\,\Omega = \frac{16}{8}\,\Omega = 2\,\Omega \\ R_i &= 3\,\Omega + 2\,\Omega = 5\,\Omega \end{aligned}$$
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

**Knotengleichung an K**

Stromrichtungen: $I_1$ nach oben in $K$ hinein, $I_2$ nach unten aus $K$ hinaus, $I_{q3}$ nach oben in $K$ hinein. Was hineinfließt, fließt hinaus:

$$I_1 + I_{q3} = I_2$$

**Variante: K als zwei Punkte angeschrieben**

In der Zeichnung sieht $K$ aus wie zwei Punkte: einer am $U_{q2}$-Zweig, einer am $I_{q3}$-Zweig. Zwischen ihnen fließe im Draht ein Strom $I_x$ nach rechts. Dann gibt es zwei Knotengleichungen:

$$\begin{aligned} I_1 - I_2 - I_x &= 0 \\ I_x + I_{q3} &= 0 \end{aligned}$$

Beide Gleichungen addiert:

$$I_1 - I_2 + I_{q3} = 0$$

$I_x$ fällt heraus, und es bleibt dieselbe Gleichung wie oben. Im Original heißt dieser Drahtstrom $I_k$. Ich nenne ihn $I_x$, weil $I_k$ weiter unten der Kurzschlussstrom ist und die beiden nichts miteinander zu tun haben.

::: merke Ein Draht, ein Knoten
Punkte, die nur durch einen idealen Draht verbunden sind, haben dasselbe Potential. Sie bilden einen einzigen Knoten. Die Ströme im Draht dazwischen braucht man nie.
:::

**Warum hier keine Maschenanalyse nötig ist**

- Es gibt nur einen unbekannten Knoten, nämlich $K$. Die obere linke Ecke ist kein Knoten, dort zweigt nichts ab.
- Alle Zweige liegen zwischen $K$ und dem Bezugsknoten.
- Knotenweg: eine Unbekannte, eine Gleichung.
- Pro Zweig braucht man nur eine Zweiggleichung, die den Strom durch $U_K$ ausdrückt.

::: tipp Regeln für den Potentialweg
- Durch einen Widerstand **in** Stromrichtung: Das Potential sinkt um $I \cdot R$. Gegen die Stromrichtung steigt es um $I \cdot R$.
- Durch eine Spannungsquelle von $-$ nach $+$: Das Potential steigt um $U_q$. Von $+$ nach $-$ sinkt es um $U_q$.
- Ein idealer Draht ändert nichts.
:::

**Zweigströme durch $U_K$ ausdrücken**

Linker Zweig, vom Bezugsknoten ($0\,\mathrm{V}$) nach oben bis $K$. Durch $R_1$ in Stromrichtung, durch $U_{q1}$ von $-$ nach $+$, durch $R_4$ in Stromrichtung:

$$\begin{aligned} 0 - I_1 R_1 + U_{q1} - I_1 R_4 &= U_K \\ U_{q1} - I_1 (R_1 + R_4) &= U_K \\ I_1 (R_1 + R_4) &= U_{q1} - U_K \\ I_1 &= \frac{U_{q1} - U_K}{R_1 + R_4} \end{aligned}$$

$R_1$ und $R_4$ liegen in Reihe, auch wenn $U_{q1}$ dazwischen sitzt. Durch alle drei fließt derselbe Strom $I_1$, und in einer Reihenschaltung ist die Reihenfolge egal.

Mittlerer Zweig, von $K$ nach unten zum Bezugsknoten. Durch $U_{q2}$ von $+$ nach $-$, durch $R_2$ in Stromrichtung:

$$\begin{aligned} U_K - U_{q2} - I_2 R_2 &= 0 \\ I_2 R_2 &= U_K - U_{q2} \\ I_2 &= \frac{U_K - U_{q2}}{R_2} \end{aligned}$$

Beide Formeln lesen sich auch ohne Rechnung: Der Strom im Zweig ist die Spannung, die am Widerstand übrig bleibt, geteilt durch den Widerstand.

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

Im Beispiel: $U_q = \frac{12 \cdot 4 + 4 \cdot 4 + 1 \cdot 4 \cdot 4}{8}\,\mathrm{V} = \frac{80}{8}\,\mathrm{V} = 10\,\mathrm{V}$.
:::

**Probe mit den Zweigströmen.** $I_1 = \frac{12 - 10}{4}\,\mathrm{A} = 0{,}5\,\mathrm{A}$ und $I_2 = \frac{10 - 4}{4}\,\mathrm{A} = 1{,}5\,\mathrm{A}$. Knotenregel: $0{,}5\,\mathrm{A} + 1\,\mathrm{A} = 1{,}5\,\mathrm{A}$ ✓

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

Im Beispiel: $U_q = 2\,\Omega \cdot (3\,\mathrm{A} + 1\,\mathrm{A} + 1\,\mathrm{A}) = 10\,\mathrm{V}$ ✓
:::

Diese Form ist mehr als Kosmetik. Jeder Summand in der Klammer ist ein Strom: $\frac{U_{q1}}{R_1 + R_4}$ wäre der Strom, den der linke Zweig in einen kurzgeschlossenen Knoten $K$ treiben würde, $\frac{U_{q2}}{R_2}$ genauso für den mittleren Zweig, und $I_{q3}$ ist sowieso ein Strom. Die Spannung am Knoten ist die Summe dieser Ströme mal dem Widerstand, den der Knoten nach unten sieht.

**Vorzeichen von $I_{q3}$**

- Die Richtung von $I_{q3}$ muss man in der Angabe genau ablesen.
- $+I_{q3}$ gilt, wenn $I_{q3}$ in $K$ hineinfließt, wie in Bild 1.
- Fließt $I_{q3}$ aus $K$ heraus, wird daraus $-I_{q3}$.

Genauso bei den Spannungsquellen: Liegt das $+$ unten, kehrt sich das Vorzeichen von $U_{q1}$ oder $U_{q2}$ um.

::: tipp Die Formel für alle Ein-Knoten-Schaltungen
Hängen an einem Knoten nur Zweige zum Bezugsknoten, jeder mit einer Spannungsquelle $U_k$ in Reihe mit $R_k$ oder einer Stromquelle $I_k$, dann gilt immer

$$U_K = \frac{\sum U_k / R_k + \sum I_k}{\sum 1/R_k}$$

Das ist der Satz von Millman. Er spart in der Prüfung die ganze Herleitung 3a und 3b, aber nur, wenn die Vorzeichen stimmen: $+U_k$, wenn das $+$ der Quelle zum Knoten zeigt, $+I_k$, wenn der Strom in den Knoten fließt. Stromquellenzweige zählen im Nenner nicht mit, ihr Leitwert ist null. Hier: $\sum 1/R_k = \frac{1}{R_1 + R_4} + \frac{1}{R_2} = \frac{1}{R_p}$, und es kommt genau die Lösungsform heraus.
:::

::: beispiel Gegenprobe mit Überlagerung
Nach dem [Überlagerungsprinzip aus A3.1](beitrag.html?b=ueberlagerung-leistungsbilanz) muss $U_q$ die Summe der Beiträge der einzelnen Quellen sein, jede allein, die anderen deaktiviert:

- **nur $U_{q1}$:** unbelasteter Teiler aus $R_1 + R_4$ und $R_2$, also $12\,\mathrm{V} \cdot \frac{4}{8} = 6\,\mathrm{V}$
- **nur $U_{q2}$:** derselbe Teiler von der anderen Seite, $4\,\mathrm{V} \cdot \frac{4}{8} = 2\,\mathrm{V}$
- **nur $I_{q3}$:** der Strom fließt durch $R_p$, also $1\,\mathrm{A} \cdot 2\,\Omega = 2\,\mathrm{V}$

Zusammen $6 + 2 + 2 = 10\,\mathrm{V}$ ✓. Genau diese drei Summanden stehen auch im Zähler der Formel.
:::

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
- Grund: belasteter Spannungsteiler. $R_5$ hängt jetzt als Last an $K$, Strom fließt ab, die Spannung an $K$ sinkt.

$$|U_K'| < |U_K| = |U_q|$$

Die Betragsstriche stehen da, weil $U_q$ bei anderen Werten auch negativ sein kann. Dann ist $U_K'$ zwar dem Betrag nach kleiner, als Zahl aber größer. Warum das genau so ist, zeigt Abschnitt 8.

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

$$I_1 - I_2 - I_5 + I_{q3} = 0 \qquad\text{mit } I_5 = I_k$$

### 4a. Regeln für den Umlauf

Potential-Sicht, beim Entlanggehen:

- In Stromrichtung durch einen Widerstand: Das Potential sinkt um $I \cdot R$.
- Durch eine Spannungsquelle von $-$ nach $+$: Das Potential steigt um $U_q$.

Maschen-Sicht, mit Umlaufpfeil:

- Ein Spannungspfeil, der mit dem Umlauf zeigt, wird mit $+$ gezählt.
- Ein Spannungspfeil, der gegen den Umlauf zeigt, wird mit $-$ gezählt.
- Die Summe aller Spannungen in einer Masche ist null.
- Am idealen Kurzschlussdraht fällt keine Spannung ab.

Der Gang von $K$ bis zum Bezugsknoten ist selbst ein Maschenumlauf. Die Masche wird durch den Spannungspfeil $U_K'$ geschlossen.

::: info Zwei Sichten, dieselbe Gleichung
Im Leerlauf habe ich die Zweigströme mit der Potential-Sicht hergeleitet, hier mit der Maschen-Sicht, so wie in der Übung. Es kommen dieselben Formeln heraus, nur anders sortiert. Nimm in der Prüfung, womit du schneller bist.
:::

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

Links stehen nur Quellen, rechts nur die Unbekannte. Das ist wieder der Satz von Millman, diesmal mit $R_5$ als drittem Zweig.

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

Im Beispiel: $U_K' = \frac{144 + 48 + 48}{12 + 12 + 16}\,\mathrm{V} = \frac{240}{40}\,\mathrm{V} = 6\,\mathrm{V}$.
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

Der Zähler ist derselbe wie bei $U_q$ im Leerlauf. Nur der Nenner ist anders.

Im Beispiel: $I_k = \frac{80}{12 + 12 + 16}\,\mathrm{A} = \frac{80}{40}\,\mathrm{A} = 2\,\mathrm{A}$, und $U_K' = 2\,\mathrm{A} \cdot 3\,\Omega = 6\,\mathrm{V}$ ✓
:::

**Probe mit den Zweigströmen.** $I_1 = \frac{12 - 6}{4}\,\mathrm{A} = 1{,}5\,\mathrm{A}$, $I_2 = \frac{6 - 4}{4}\,\mathrm{A} = 0{,}5\,\mathrm{A}$, $I_5 = 2\,\mathrm{A}$. Knotenregel: $1{,}5 + 1 = 0{,}5 + 2$ ✓

Man sieht schön, wie sich die Ströme umverteilen. Im Leerlauf floss $I_2 = 1{,}5\,\mathrm{A}$ durch $R_2$, jetzt nur noch $0{,}5\,\mathrm{A}$. Der neue Weg über $R_5$ zieht den Knoten herunter, und dadurch liefert $U_{q1}$ mehr Strom.

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

Im Beispiel: $I_k = \frac{10\,\mathrm{V}}{5\,\Omega} = 2\,\mathrm{A}$ ✓, derselbe Wert wie in Abschnitt 6, ohne einen einzigen langen Bruch.

::: tipp Der Kurzschluss als Spannungsteiler
Stellt man $\frac{U_q}{R_p} = U_K' \left( \frac{1}{R_p} + \frac{1}{R_5} \right)$ nach $U_K'$ um, steht da

$$U_K' = U_q \cdot \frac{R_5}{R_p + R_5}$$

Das ist ein [[Spannungsteiler|spannungsteiler]]. Links von $K$ sieht die Schaltung aus wie eine Quelle $U_q$ mit Innenwiderstand $R_p$, und an diese Quelle hängt im Kurzschluss $R_5$ als Last. Genau das meint „belasteter Spannungsteiler“ in Abschnitt 4. Im Beispiel: $10\,\mathrm{V} \cdot \frac{3}{5} = 6\,\mathrm{V}$ ✓
:::

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

Beides gilt nur für $R_p = 0$. Im Beispiel wären das $\frac{10}{3}\,\mathrm{A} \approx 3{,}33\,\mathrm{A}$ statt richtig $2\,\mathrm{A}$.

Außerdem: In Abschnitt 7 müsste die Klammer rechts dann $\frac{1}{R_p}$ sein. Sie ist wegen $\frac{1}{R_5}$ aber größer, also ist $U_K'$ dem Betrag nach kleiner als $U_q$. Genau sagt es der Spannungsteiler oben: $U_K' = U_q \cdot \frac{R_5}{R_p + R_5}$, und der Faktor ist kleiner als $1$.

Im Kurzschluss ist $U_{AB} = 0$, nicht $U_K'$.

::: achtung Leerlauf und Kurzschluss sind zwei verschiedene Schaltungen
Der häufigste Fehler in dieser Aufgabe: Man rechnet im Kurzschluss mit $U_K = U_q$ weiter, weil man die Knotenspannung ja schon hat. Im Kurzschluss ist $U_K'$ aber eine neue Unbekannte, die man neu ausrechnen muss.
:::

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

Beide Wege landen beim selben $I_q$. Mit Zahlen: $3 \cdot 8 + 16 = 40$ und $12 + 12 + 16 = 40$ ✓

## 10. Ergebnis (ii) und Thévenin ↔ Norton

::: merke Ersatzstromquelle
$$R_i' = R_i \qquad I_q = \frac{U_q}{R_i}$$

Im Beispiel: $R_i' = 5\,\Omega$ und $I_q = 2\,\mathrm{A}$.
:::

<figure class="dia"><svg viewBox="0 0 360 172" role="img" aria-label="Bild 8: Links die Ersatzspannungsquelle mit U_q gleich 10 V und R_i gleich 5 Ohm in Reihe. Rechts die Ersatzstromquelle mit I_q gleich 2 A, Pfeil nach oben zu Klemme A, und R_i gleich 5 Ohm parallel.">
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
<text class="k c" x="80" y="168">10 V, 5 Ω</text><text class="k c" x="270" y="168">2 A, 5 Ω</text>
</svg><figcaption>Bild 8: zwei Ersatzquellen, eine Kennlinie. Der Pfeil von I<sub>q</sub> zeigt zu Klemme A, also dorthin, wo bei U<sub>q</sub> das Plus liegt.</figcaption></figure>

- Die Ersatzstromquelle hat denselben Innenwiderstand wie die Ersatzspannungsquelle.
- Thévenin und Norton beschreiben dieselbe Gerade im $U$-$I$-Diagramm.
- Zwei der drei Größen $U_q$, $I_q$, $R_i$ legen die dritte fest.
- Der Zusammenhang ist $U_q = I_q \cdot R_i$.
- Meist rechnet man $R_i$ und dann entweder Leerlauf oder Kurzschluss.

Warum $R_i' = R_i$: Bei der Ersatzstromquelle deaktiviert man $I_q$ zur Unterbrechung, an den Klemmen bleibt $R_i'$ übrig. Bei der Ersatzspannungsquelle wird $U_q$ zum Draht, an den Klemmen bleibt $R_i$ übrig. Beide müssen den Widerstand des deaktivierten Originals zeigen, also sind sie gleich.

Probe am Norton-Modell: Im Leerlauf fließt der ganze Quellenstrom durch $R_i$ und erzeugt $2\,\mathrm{A} \cdot 5\,\Omega = 10\,\mathrm{V}$ ✓. Im Kurzschluss überbrückt der Draht $R_i$, und der ganze Strom geht durch den Draht, $2\,\mathrm{A}$ ✓.

**Grenzen**

- Bei $R_i = 0$ gibt es keine Ersatzstromquelle, der Kurzschlussstrom wäre unendlich.
- Bei $R_i \to \infty$ gibt es keine Ersatzspannungsquelle, die Leerlaufspannung wäre unendlich.

**Richtung beim Umwandeln**

Der Pfeil von $I_q$ zeigt zu der Klemme, an der bei $U_q$ das $+$ liegt. Die Stromquelle treibt den Strom also dort heraus, wo die Spannungsquelle ihren Pluspol hat.

<figure class="dia"><svg viewBox="0 0 360 220" role="img" aria-label="Bild 9: Kennlinie U über I. Die Gerade läuft von 10 V auf der U-Achse bis 2 A auf der I-Achse. Die gestrichelte Lastgerade für R_L gleich 5 Ohm schneidet sie bei 5 V und 1 A. Grau eine parallele Gerade von 6 V bis 1,2 A für umgedrehtes I_q3.">
<defs><marker id="aq-a5" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M50 200V20" marker-end="url(#aq-a5)"/><path class="s" d="M40 190H346" marker-end="url(#aq-a5)"/>
<text x="42" y="22" text-anchor="end">U</text><text x="340" y="210">I</text>
<path class="m d" d="M50 190L320 28"/>
<path class="m" d="M50 100L200 190" style="stroke-width:2"/>
<path class="s" d="M50 40L300 190" style="stroke-width:2.4"/>
<circle class="b" cx="50" cy="40" r="4.5"/><circle class="b" cx="300" cy="190" r="4.5"/><circle class="a" cx="175" cy="115" r="5.5"/>
<text x="42" y="44" text-anchor="end">10 V</text><text x="42" y="104" text-anchor="end">6 V</text>
<text class="c" x="300" y="210">2 A</text><text class="c" x="200" y="210">1,2 A</text>
<text class="k" x="214" y="120">5 V, 1 A</text>
<text x="244" y="40">R<tspan dy="3" font-size="9">L</tspan><tspan dy="-3"> = 5 Ω</tspan></text>
<text x="206" y="182">−I<tspan dy="3" font-size="9">q3</tspan></text>
</svg><figcaption>Bild 9: die Kennlinie an den Klemmen, Steigung −R<sub>i</sub>. Mit R<sub>L</sub> = 5 Ω = R<sub>i</sub> liegt der Arbeitspunkt genau in der Mitte. Grau: Wird I<sub>q3</sub> umgedreht, verschiebt sich die Gerade parallel, weil R<sub>i</sub> von den Quellen nicht abhängt.</figcaption></figure>

## 11. Zusammenfassung

- Der Innenwiderstand wird mit deaktivierten Quellen bestimmt: Spannungsquellen kurzschließen, Stromquellen auftrennen.
- Ein Widerstand in Reihe mit einer idealen Stromquelle hat keinen Einfluss nach außen.
- Im Leerlauf fließt durch $R_5$ kein Strom, also gilt $U_{AB} = U_K$.
- $U_K$ folgt aus einer einzigen Knotengleichung an $K$.
- Im Kurzschluss ist die Knotenspannung eine andere, $U_K' \neq U_q$.

::: merke Ergebnisse
$$R_i = R_5 + R_2 \parallel (R_1 + R_4)$$

$$U_q = \bigl(R_2 \parallel (R_1 + R_4)\bigr) \left( \frac{U_{q1}}{R_1 + R_4} + \frac{U_{q2}}{R_2} + I_{q3} \right)$$

$$R_i' = R_i \qquad I_q = \frac{U_q}{R_i}$$

Im Beispiel: $R_i = 5\,\Omega$, $U_q = 10\,\mathrm{V}$, $I_q = 2\,\mathrm{A}$.
:::

## Typische Fehler

::: achtung Sieben Klassiker
- **$R_3$ mitrechnen:** $R_3$ in Reihe mit einer idealen Stromquelle wirkt nach außen nicht. Er kommt in keinem Ergebnis vor.
- **Stromquelle beim Deaktivieren kurzschließen:** Dann läge $R_3$ parallel zu $R_p$, und man bekäme $R_i = 3\,\Omega + (4 \parallel 4 \parallel 10)\,\Omega \approx 4{,}82\,\Omega$. Stromquelle auf null ist eine Unterbrechung.
- **$R_4$ vergessen:** $R_4$ liegt in Reihe mit $R_1$ und $U_{q1}$, auch wenn die Quelle dazwischen sitzt. Im linken Zweig zählt $R_1 + R_4$.
- **$R_5$ im Leerlauf mitnehmen:** Ohne Strom fällt an $R_5$ nichts ab, also $U_q = U_K$. Kein Spannungsteiler mit $R_5$.
- **Im Kurzschluss mit $U_K$ statt $U_K'$ rechnen:** gibt $I_k = U_q/R_5 \approx 3{,}33\,\mathrm{A}$ statt $2\,\mathrm{A}$. Neue Schaltung, neue Knotenspannung.
- **Vorzeichen der Quellen:** $+$, wenn das Plus der Spannungsquelle zum Knoten zeigt und wenn der Strom der Stromquelle in den Knoten fließt. Mit umgedrehtem $I_{q3}$ wären es $6\,\mathrm{V}$ statt $10\,\mathrm{V}$.
- **Norton-Pfeil falsch herum:** $I_q$ zeigt zu der Klemme, an der bei $U_q$ das $+$ liegt.
:::

## Zum Weiterdenken

::: aufgabe Stromquelle umgedreht
Der Pfeil von $I_{q3}$ zeigt jetzt nach unten, aus $K$ heraus. Was wird aus $R_i$, $U_q$ und $I_q$?
???
$R_i$ bleibt $5\,\Omega$, denn beim Deaktivieren ist die Richtung egal, eine Unterbrechung ist eine Unterbrechung. In der Formel wird aus $+I_{q3}$ ein $-I_{q3}$:

$$U_q = 2\,\Omega \cdot (3\,\mathrm{A} + 1\,\mathrm{A} - 1\,\mathrm{A}) = 6\,\mathrm{V}$$

und $I_q = 6\,\mathrm{V} / 5\,\Omega = 1{,}2\,\mathrm{A}$. Im $U$-$I$-Diagramm verschiebt sich die Kennlinie parallel nach unten (Bild 9, grau). Mit Überlagerung sieht man es sofort: Der Beitrag von $I_{q3}$ ist $\pm 2\,\mathrm{V}$, also $6 + 2 - 2 = 6\,\mathrm{V}$.
:::

::: aufgabe Last anschließen
An A und B kommt $R_L = 5\,\Omega$. Wie groß sind Klemmenspannung, Laststrom und Lastleistung? Ist das die größtmögliche Leistung?
???
Mit der Ersatzspannungsquelle ist das ein einfacher Reihenkreis:

$$\begin{aligned} I_L &= \frac{U_q}{R_i + R_L} = \frac{10\,\mathrm{V}}{10\,\Omega} = 1\,\mathrm{A} \\ U_L &= R_L I_L = 5\,\mathrm{V} \\ P_L &= U_L I_L = 5\,\mathrm{W} \end{aligned}$$

Wegen $R_L = R_i$ ist das die [[Leistungsanpassung|leistungsanpassung]], also die größtmögliche Leistung: $P_{\max} = \frac{U_q^2}{4 R_i} = \frac{100}{20}\,\mathrm{W} = 5\,\mathrm{W}$ ✓. Zur Kontrolle direkt am Original mit zwei Knoten ($K$ und A) gerechnet kommt ebenfalls $U_L = 5\,\mathrm{V}$ heraus. Ohne Ersatzquelle wäre das ein Gleichungssystem gewesen, mit Ersatzquelle eine Zeile.
:::

::: aufgabe Wer zahlt für $R_3$?
Welche Spannung liegt im Leerlauf an der Stromquelle $I_{q3}$, und welche Leistung gibt sie ab? Wie hängt das von $R_3$ ab?
???
Der Strom $I_{q3}$ fließt vom Bezugsknoten nach oben durch $R_3$. In Stromrichtung sinkt das Potential, der Punkt zwischen $R_3$ und der Quelle liegt also bei $0 - I_{q3} R_3 = -10\,\mathrm{V}$. Oben an der Quelle liegt $K$ mit $10\,\mathrm{V}$. Die Quelle hebt das Potential also um

$$U_{I_{q3}} = U_K + I_{q3} R_3 = 10\,\mathrm{V} + 10\,\mathrm{V} = 20\,\mathrm{V}$$

und gibt $P = 20\,\mathrm{V} \cdot 1\,\mathrm{A} = 20\,\mathrm{W}$ ab. Davon verheizt $R_3$ allein $I_{q3}^2 R_3 = 10\,\mathrm{W}$, der Rest geht in den Knoten. Je größer $R_3$, desto mehr muss die Quelle leisten, an den Klemmen ändert sich aber nichts. Eine echte Stromquelle hat deshalb eine maximale Spannung, und ein großes $R_3$ kann sie überfordern.
:::

::: aufgabe Grenzfall $R_2 \to \infty$
$R_2$ wird entfernt, der mittlere Zweig ist offen. Was wird aus $R_i$, $U_q$ und $I_q$? Warum verschwindet $U_{q2}$ aus dem Ergebnis?
???
$R_p = R_2 \parallel (R_1 + R_4) \to R_1 + R_4 = 4\,\Omega$, also $R_i = 3\,\Omega + 4\,\Omega = 7\,\Omega$. In der Lösungsform wird $U_{q2}/R_2 \to 0$:

$$\begin{aligned} U_q &= (R_1 + R_4) \left( \frac{U_{q1}}{R_1 + R_4} + I_{q3} \right) \\ &= U_{q1} + I_{q3} (R_1 + R_4) \\ &= 12\,\mathrm{V} + 4\,\mathrm{V} = 16\,\mathrm{V} \end{aligned}$$

und $I_q = 16\,\mathrm{V} / 7\,\Omega \approx 2{,}29\,\mathrm{A}$. $U_{q2}$ verschwindet, weil durch einen offenen Zweig kein Strom fließt: Die Quelle kann nichts treiben und hat keinen Einfluss auf $K$. Anschaulich: Der ganze Strom $I_{q3}$ muss jetzt rückwärts durch den linken Zweig, $I_1 = -1\,\mathrm{A}$, und hebt $K$ um $I_{q3}(R_1 + R_4) = 4\,\mathrm{V}$ über $U_{q1}$.
:::
