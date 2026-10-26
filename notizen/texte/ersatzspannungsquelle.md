---
titel: Ersatzspannungsquelle — ein ganzes Netzwerk in zwei Zahlen
datum: 2026-10-26
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.2
tags: [Ersatzspannungsquelle, Thévenin, Leerlauf, Kurzschluss, Innenwiderstand, Stromteiler]
teaser: Aufgabe 3.2: Eine Quelle mit drei Widerständen wird zu einer einzigen Quelle mit Innenwiderstand. Leerlauf und Kurzschluss legen beide Werte fest, und mit null gesetzter Quelle kommt derselbe Innenwiderstand noch einmal heraus, ganz ohne Stromrechnung.
welle: saege
---

Eine Last an zwei Klemmen bekommt vom Netzwerk dahinter nur eines mit: welche Spannung bei welchem Strom anliegt. Bei einem linearen Netzwerk ist dieser Zusammenhang eine Gerade, und eine Gerade hat genau zwei Kennzahlen. Darum lässt sich jedes lineare Netzwerk, egal wie verschachtelt, durch eine ideale Quelle $U_0$ mit einem Widerstand $R_i$ in Reihe ersetzen: die [[Ersatzspannungsquelle|ersatzquelle]]. Diese Aufgabe rechnet das an einem kleinen Netzwerk komplett durch. $R_i$ kommt dabei auf zwei völlig verschiedenen Wegen heraus, und beide liefern denselben Wert.

Gebraucht werden der [Spannungsteiler](beitrag.html?b=spannungsteiler) und für den Beweis am Ende das [Überlagerungsprinzip aus A3.1](beitrag.html?b=ueberlagerung-leistungsbilanz).

## Die Aufgabe

Das Netzwerk links soll in eine Ersatzspannungsquelle mit $U_0$ und $R_i$ umgerechnet werden. Beide sollen sich gegenüber einem Lastwiderstand $R_L$ an den Klemmen gleich verhalten.

<figure class="dia"><svg viewBox="0 0 380 340" role="img" aria-label="Bild 1: Oben das Original. Links die Spannungsquelle U_q mit Zählpfeil nach unten, oben R1 zu einem Knoten, vom Knoten R2 nach unten zur unteren Leitung, vom Knoten R3 oben zur Klemme. Unten die Ersatzspannungsquelle: Quelle U_0 mit Zählpfeil nach unten und R_i in Reihe. An beiden Klemmenpaaren hängt gestrichelt eine Last R_L.">
<defs><marker id="eq-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="eq-m1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text class="k" x="4" y="12">ORIGINAL</text>
<path class="s" d="M80 79V40H120M164 40H226M270 40H296.5M80 111V150H296.5M190 40V73M190 117V150"/>
<circle class="b" cx="80" cy="95" r="16"/><path class="s" d="M80 79V111"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="206" y="99">R<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M48 79V111" marker-end="url(#eq-a1)"/><text x="40" y="99" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="m d" d="M303.5 40H340V73M340 117V150H303.5"/><rect class="m d" x="332" y="73" width="16" height="44"/><text x="356" y="99">R<tspan dy="3" font-size="9">L</tspan></text>
<path class="m" d="M190 166V194" marker-end="url(#eq-m1)"/><text class="k" x="202" y="184">AN DEN KLEMMEN GLEICH</text>
<text class="k" x="4" y="212">ERSATZSPANNUNGSQUELLE</text>
<path class="s" d="M80 264V240H170M214 240H296.5M80 296V320H296.5"/>
<circle class="b" cx="80" cy="280" r="16"/><path class="s" d="M80 264V296"/>
<rect class="b" x="170" y="232" width="44" height="16"/>
<circle class="b" cx="300" cy="240" r="3.5"/><circle class="b" cx="300" cy="320" r="3.5"/>
<text class="c" x="192" y="224">R<tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> = ?</tspan></text>
<path class="s" d="M112 264V296" marker-end="url(#eq-a1)"/><text x="120" y="284">U<tspan dy="3" font-size="9">0</tspan><tspan dy="-3"> = ?</tspan></text>
<path class="m d" d="M303.5 240H340V258M340 302V320H303.5"/><rect class="m d" x="332" y="258" width="16" height="44"/><text x="356" y="284">R<tspan dy="3" font-size="9">L</tspan></text>
</svg><figcaption>Bild 1: oben das Original, unten die gesuchte Ersatzspannungsquelle. Die kleinen Kreise sind die Klemmen, gestrichelt die Last. Beide Spannungspfeile zeigen nach unten: Der obere Anschluss liegt auf dem höheren Potential.</figcaption></figure>

Die vier Teilaufgaben:

1. $U_0$ so wählen, dass beide Netzwerke im Leerlauf dieselbe Spannung liefern.
2. $R_i$ so wählen, dass beide im Kurzschluss denselben Strom liefern.
3. Prüfen, ob sie sich dann für jedes beliebige $R_L$ gleich verhalten.
4. $R_i$ noch einmal bestimmen, diesmal über null gesetzte Quellen. Was fällt auf?

Die Angabe ist allgemein, alle Ergebnisse sind Formeln. Damit man auch Zahlen sieht, rechne ich nebenher mit Beispielwerten. Sie stehen nicht in der Angabe und sind so gewählt, dass glatte Ergebnisse herauskommen:

| Größe | Beispielwert |
|:---|---:|
| Quellenspannung $U_q$ | $12\,\mathrm{V}$ |
| $R_1$ | $1\,\mathrm{k\Omega}$ |
| $R_2$ | $1\,\mathrm{k\Omega}$ |
| $R_3$ | $500\,\Omega$ |

## Die Grundidee: Warum zwei Zahlen genügen

Die Ersatzquelle hat zwei Unbekannte, $U_0$ und $R_i$. Zwei Unbekannte brauchen zwei Gleichungen, und die Aufgabe liefert genau zwei Bedingungen: gleicher Leerlauf, gleicher Kurzschluss. Warum das reicht, sieht man an der **Kennlinie** der Klemmen.

Die Klemmenspannung $U$ zählt von der oberen zur unteren Klemme, der Strom $I$ fließt oben heraus in die Last. Für die Ersatzquelle liefert die [[Maschenregel|maschenregel]] sofort

$$U = U_0 - R_i \cdot I$$

Das ist eine Gerade im $U$-$I$-Diagramm: Achsenabschnitt $U_0$, Steigung $-R_i$. Zwei Punkte legen sie fest:

- **Leerlauf**, Klemmen offen: $I = 0$, also $U = U_0$. Das ist der Punkt $(0 \mid U_0)$.
- **Kurzschluss**, Klemmen mit einem Draht verbunden: $U = 0$, also $I = I_k = U_0 / R_i$. Das ist der Punkt $(I_k \mid 0)$.

Eine Last $R_L$ erzwingt zusätzlich $U = R_L \cdot I$, ebenfalls eine Gerade, diesmal durch den Ursprung. Wo sich beide Geraden schneiden, stellt sich der [[Arbeitspunkt|arbeitspunkt]] ein.

<figure class="dia"><svg viewBox="0 0 380 230" role="img" aria-label="Bild 2: Kennlinie U über I. Eine fallende Gerade von U_0 auf der U-Achse (Leerlauf) bis I_k auf der I-Achse (Kurzschluss). Eine gestrichelte Gerade durch den Ursprung ist die Last U = R_L mal I. Der Schnittpunkt ist der Arbeitspunkt mit U_L und I_L.">
<defs><marker id="eq-a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M50 200V24" marker-end="url(#eq-a2)"/><path class="s" d="M40 190H346" marker-end="url(#eq-a2)"/>
<text x="42" y="24" text-anchor="end">U</text><text x="340" y="210">I</text>
<path class="m d" d="M50 115H175V190"/>
<path class="m d" d="M50 190L320 28"/>
<path class="s" d="M50 40L300 190" style="stroke-width:2.4"/>
<circle class="b" cx="50" cy="40" r="4.5"/><circle class="b" cx="300" cy="190" r="4.5"/><circle class="a" cx="175" cy="115" r="5.5"/>
<text x="42" y="44" text-anchor="end">U<tspan dy="3" font-size="9">0</tspan></text><text x="42" y="119" text-anchor="end">U<tspan dy="3" font-size="9">L</tspan></text>
<text class="c" x="175" y="210">I<tspan dy="3" font-size="9">L</tspan></text><text class="c" x="300" y="210">I<tspan dy="3" font-size="9">k</tspan></text>
<text class="k" x="62" y="34">LEERLAUF</text><text class="k" x="308" y="180">KURZSCHLUSS</text><text class="k" x="192" y="138">ARBEITSPUNKT</text>
<text x="112" y="64">U = U<tspan dy="3" font-size="9">0</tspan><tspan dy="-3"> − R</tspan><tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> I</tspan></text>
<text x="240" y="98">U = R<tspan dy="3" font-size="9">L</tspan><tspan dy="-3"> I</tspan></text>
</svg><figcaption>Bild 2: die Kennlinie einer Quelle mit Innenwiderstand (durchgezogen) und die Kennlinie der Last (gestrichelt). Leerlauf und Kurzschluss sind die beiden Endpunkte.</figcaption></figure>

Wenn auch das Original eine gerade Kennlinie hat, folgt daraus alles: Stimmen beide Endpunkte überein, stimmt die ganze Gerade, und dann liefert jede Last denselben Arbeitspunkt. Dass das Original wirklich eine Gerade hat, ist der eigentliche Inhalt des Satzes von Thévenin. Teil 3 prüft es an dieser Schaltung, der Abschnitt [Warum das immer klappt](#warum-das-immer-klappt) beweist es für jedes lineare Netzwerk.

::: info Gegenbeispiel: Ein Punkt reicht nicht
Box A hat $U_0 = 10\,\mathrm{V}$ und $R_i = 10\,\Omega$, Box B hat $U_0 = 1\,\mathrm{V}$ und $R_i = 1\,\Omega$. Im Kurzschluss liefern beide $I_k = 1\,\mathrm{A}$, nach dieser einen Messung sind sie nicht zu unterscheiden. Mit $R_L = 10\,\Omega$:

$$\begin{aligned} I_A &= \frac{10\,\mathrm{V}}{10\,\Omega + 10\,\Omega} = 0{,}5\,\mathrm{A} \\ I_B &= \frac{1\,\mathrm{V}}{1\,\Omega + 10\,\Omega} \approx 0{,}09\,\mathrm{A} \end{aligned}$$

Ein Faktor 5,5 Unterschied. Erst der zweite Punkt legt die Gerade fest.
:::

<figure class="dia"><svg viewBox="0 0 380 230" role="img" aria-label="Bild 3: Zwei Kennlinien mit demselben Kurzschlussstrom 1 A. Box A startet bei 10 V, Box B bei 1 V. Die gestrichelte Lastgerade für 10 Ohm schneidet A bei 0,5 A und B bei 0,09 A.">
<defs><marker id="eq-a3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M50 200V24" marker-end="url(#eq-a3)"/><path class="s" d="M40 190H346" marker-end="url(#eq-a3)"/>
<text x="42" y="24" text-anchor="end">U</text><text x="340" y="210">I</text>
<path class="m d" d="M175 115V190M72.7 176.4V190"/>
<path class="m d" d="M50 190L320 28"/>
<path class="s" d="M50 40L300 190" style="stroke-width:2.4"/><path class="s" d="M50 175L300 190" style="stroke-width:2.4"/>
<circle class="b" cx="300" cy="190" r="4.5"/><circle class="a" cx="175" cy="115" r="5.5"/><circle class="a" cx="72.7" cy="176.4" r="5"/>
<text x="42" y="44" text-anchor="end">10 V</text><text x="42" y="179" text-anchor="end">1 V</text>
<text class="c" x="80" y="210">0,09 A</text><text class="c" x="175" y="210">0,5 A</text><text class="c" x="300" y="210">1 A</text>
<text class="k" x="112" y="64">A: 10 V, 10 Ω</text><text class="k" x="184" y="173">B: 1 V, 1 Ω</text>
<text class="k" x="308" y="180">BEIDE</text>
<text x="240" y="98">R<tspan dy="3" font-size="9">L</tspan><tspan dy="-3"> = 10 Ω</tspan></text>
</svg><figcaption>Bild 3: gleicher Kurzschlussstrom, völlig verschiedene Quellen. Erst der Leerlaufpunkt trennt die beiden Geraden.</figcaption></figure>

Der Plan für die Aufgabe ist damit klar: Teil 1 liefert den Leerlaufpunkt und damit $U_0$, Teil 2 den Kurzschlusspunkt und damit $R_i$. Teil 3 prüft, ob dazwischen wirklich alles stimmt.

## Teil 1: Leerlaufspannung $U_0$

<figure class="dia"><svg viewBox="0 0 380 190" role="img" aria-label="Bild 4: Leerlauf. Die Klemmen sind offen. R3 ist gestrichelt gezeichnet, durch ihn fließt kein Strom. Der Strom I fließt durch R1 und R2. Neben R2 der Zählpfeil U_R2, an den Klemmen der Zählpfeil U_0.">
<defs><marker id="eq-a4" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M80 79V40H120M164 40H190M80 111V150H296.5M190 40V73M190 117V150"/>
<path class="m d" d="M190 40H226M270 40H296.5"/><rect class="m d" x="226" y="32" width="44" height="16"/>
<circle class="b" cx="80" cy="95" r="16"/><path class="s" d="M80 79V111"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text x="174" y="99" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text>
<text class="k c" x="248" y="22">R<tspan dy="3" font-size="8">3</tspan><tspan dy="-3">: I</tspan><tspan dy="3" font-size="8">3</tspan><tspan dy="-3"> = 0</tspan></text>
<path class="s" d="M128 60H156" marker-end="url(#eq-a4)"/><text class="c" x="142" y="76">I</text>
<path class="s" d="M214 79V111" marker-end="url(#eq-a4)"/><text x="222" y="99">U<tspan dy="3" font-size="9">R2</tspan></text>
<path class="s" d="M330 48V142" marker-end="url(#eq-a4)"/><text x="338" y="99">U<tspan dy="3" font-size="9">0</tspan></text>
<path class="s" d="M48 79V111" marker-end="url(#eq-a4)"/><text x="40" y="99" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
</svg><figcaption>Bild 4: Leerlauf. Durch R<sub>3</sub> fließt nichts, übrig bleibt der Kreis aus U<sub>q</sub>, R<sub>1</sub> und R<sub>2</sub>.</figcaption></figure>

**Schritt 1: Leerlauf heißt Klemmen offen.** Es hängt keine Last an den Klemmen, also fließt kein Klemmenstrom.

**Schritt 2: $R_3$ ansehen.** $R_3$ führt zur offenen Klemme. Auf diesem Weg gibt es keinen geschlossenen Kreis, also

$$I_3 = 0 \quad\Rightarrow\quad U_{R_3} = R_3 \cdot I_3 = 0$$

**Schritt 3: die Klemmenspannung.** Von der oberen zur unteren Klemme geht es durch $R_3$ zum Knoten und durch $R_2$ zur unteren Leitung. Die Masche entlang dieses Wegs:

$$U_0 = U_{R_3} + U_{R_2} = U_{R_2}$$

$R_3$ ist im Leerlauf unsichtbar. An den Klemmen liegt einfach die Spannung von $R_2$.

**Schritt 4: der Restkreis.** Durch $R_1$ und $R_2$ fließt derselbe Strom, nichts zweigt ab. Sie liegen in Reihe und bilden einen unbelasteten [[Spannungsteiler|spannungsteiler]]:

$$I = \frac{U_q}{R_1 + R_2} \qquad U_{R_2} = R_2 \cdot I = U_q \cdot \frac{R_2}{R_1 + R_2}$$

::: merke Leerlaufspannung
$$U_0 = U_q \cdot \frac{R_2}{R_1 + R_2}$$

Im Beispiel: $U_0 = 12\,\mathrm{V} \cdot \frac{1\,\mathrm{k\Omega}}{2\,\mathrm{k\Omega}} = 6\,\mathrm{V}$, bei $I = 6\,\mathrm{mA}$ im Restkreis.
:::

Auf der Seite der Ersatzquelle ist der Leerlauf noch einfacher. Durch $R_i$ fließt kein Strom, an $R_i$ fällt nichts ab, und $U_0$ liegt direkt an den Klemmen. Damit beide Leerlaufspannungen gleich sind, muss die Ersatzquelle genau dieses $U_0$ haben.

## Teil 2: Kurzschlussstrom und $R_i$

Jetzt werden die Klemmen mit einem Draht verbunden. Vorher eine Unterscheidung, über die viele stolpern:

::: achtung Kurzschluss ist nicht „Quelle null setzen“
- **Kurzschluss (Teil 2):** Die **Klemmen** werden verbunden. Die Quelle bleibt eingeschaltet, sie treibt den Kurzschlussstrom.
- **Quelle null setzen (Teil 4):** Die **Quelle** wird durch einen Draht ersetzt. Die Klemmen bleiben offen.

Beides heißt „Draht einsetzen“, aber an ganz verschiedenen Stellen.
:::

<figure class="dia"><svg viewBox="0 0 380 190" role="img" aria-label="Bild 5: Kurzschluss. Die Klemmen sind mit einem dicken Draht verbunden. Der Strom I1 fließt durch R1 zum Knoten und teilt sich in I2 durch R2 und I_k durch R3 und den Kurzschluss. Neben R2 der Zählpfeil U_p. R2 und R3 liegen parallel.">
<defs><marker id="eq-a5" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M80 79V40H120M164 40H226M270 40H300M80 111V150H300M190 40V73M190 117V150"/>
<path class="s" d="M300 40H320V150H300" style="stroke-width:3"/>
<circle class="b" cx="80" cy="95" r="16"/><path class="s" d="M80 79V111"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="174" y="99" text-anchor="end">R<tspan dy="3" font-size="9">2</tspan></text>
<path class="f" d="M106 40l-9 -5v10z"/><text class="c" x="100" y="30">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="f" d="M190 64l-5 -9h10z"/><text x="182" y="64" text-anchor="end">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="f" d="M290 40l-9 -5v10z"/><text class="c" x="286" y="30">I<tspan dy="3" font-size="9">k</tspan></text>
<path class="s" d="M214 79V111" marker-end="url(#eq-a5)"/><text x="222" y="99">U<tspan dy="3" font-size="9">p</tspan></text>
<text x="232" y="132">R<tspan dy="3" font-size="9">2</tspan><tspan dy="-3"> || R</tspan><tspan dy="3" font-size="9">3</tspan></text>
<text class="k" x="328" y="92">KURZ-</text><text class="k" x="328" y="106">SCHLUSS</text>
<path class="s" d="M48 79V111" marker-end="url(#eq-a5)"/><text x="40" y="99" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
</svg><figcaption>Bild 5: Kurzschluss. R<sub>3</sub> führt jetzt über den Draht zur unteren Leitung und liegt damit parallel zu R<sub>2</sub>. U<sub>p</sub> ist die gemeinsame Spannung der beiden.</figcaption></figure>

**Schritt 1: Struktur erkennen.** Parallel heißt: beide Enden an denselben zwei Punkten. $R_2$ hängt zwischen Knoten und unterer Leitung. $R_3$ hängt über den Kurzschlussdraht ebenfalls zwischen Knoten und unterer Leitung. Also liegen $R_2$ und $R_3$ parallel, und dieser Block liegt in Reihe mit $R_1$.

**Schritt 2: Gesamtwiderstand.**

$$R_\text{ges} = R_1 + \frac{R_2 R_3}{R_2 + R_3} = \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_2 + R_3}$$

Der Zähler kommt in dieser Aufgabe noch mehrmals vor. Er bekommt eine Abkürzung, die Summe aller Produkte aus je zwei Widerständen:

$$S = R_1 R_2 + R_1 R_3 + R_2 R_3$$

**Schritt 3: Strom aus der Quelle.**

$$I_1 = \frac{U_q}{R_\text{ges}} = \frac{U_q\,(R_2 + R_3)}{S}$$

**Schritt 4: Spannung am Parallelblock.** Sie liegt an $R_2$ und $R_3$ gleichermaßen:

$$U_p = I_1 \cdot \frac{R_2 R_3}{R_2 + R_3} = \frac{U_q\,R_2 R_3}{S}$$

**Schritt 5: Kurzschlussstrom.** Er fließt durch $R_3$, also

$$I_k = I_3 = \frac{U_p}{R_3} = \frac{U_q\,R_2}{S}$$

### Abkürzung: der Stromteiler

Statt über $U_p$ geht es auch direkt. Parallele Widerstände haben dieselbe Spannung, also $I_2 R_2 = I_3 R_3$. Zusammen mit der [[Knotenregel|knotenregel]] $I_2 + I_3 = I_1$:

$$I_3 = I_1 \cdot \frac{R_2}{R_2 + R_3}$$

Im Zähler steht der **andere** Widerstand. Das klingt verkehrt, ist aber logisch: Je größer $R_2$, desto schwerer kommt der Strom durch $R_2$, und desto mehr nimmt den Weg über $R_3$. Eingesetzt:

$$I_k = \frac{U_q\,(R_2 + R_3)}{S} \cdot \frac{R_2}{R_2 + R_3} = \frac{U_q\,R_2}{S} \;\checkmark$$

### Zahlen

| Größe | Rechnung | Wert |
|:---|:---|---:|
| $R_2 \parallel R_3$ | $\frac{1000 \cdot 500}{1500}\,\Omega$ | $333{,}3\,\Omega$ |
| $R_\text{ges}$ | $1000\,\Omega + 333{,}3\,\Omega$ | $1333{,}3\,\Omega$ |
| $I_1$ | $12\,\mathrm{V} / 1333{,}3\,\Omega$ | $9\,\mathrm{mA}$ |
| $U_p$ | $9\,\mathrm{mA} \cdot 333{,}3\,\Omega$ | $3\,\mathrm{V}$ |
| $I_k$ | $3\,\mathrm{V} / 500\,\Omega$ | $6\,\mathrm{mA}$ |
| $I_2$ | $3\,\mathrm{V} / 1000\,\Omega$ | $3\,\mathrm{mA}$ |

Probe mit der Knotenregel: $I_2 + I_k = 3\,\mathrm{mA} + 6\,\mathrm{mA} = 9\,\mathrm{mA} = I_1$ ✓

### $R_i$ aus dem Kurzschlussstrom

Bei der Ersatzquelle liegt im Kurzschluss nur $R_i$ an $U_0$, also $I_k = U_0 / R_i$. Damit beide Kurzschlussströme gleich sind:

$$\begin{aligned} R_i = \frac{U_0}{I_k} &= \frac{U_q \cdot \frac{R_2}{R_1 + R_2}}{U_q \cdot \frac{R_2}{S}} = \frac{S}{R_1 + R_2} \\ &= \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_1 + R_2} \end{aligned}$$

$U_q$ und $R_2$ kürzen sich heraus. Das ist kein Zufall: $R_i$ hängt nur von den Widerständen ab, nicht davon, wie stark die Quelle ist. Im Beispiel:

$$R_i = \frac{6\,\mathrm{V}}{6\,\mathrm{mA}} = 1\,\mathrm{k\Omega}$$

und mit der Formel:

$$R_i = \frac{(10^6 + 5 \cdot 10^5 + 5 \cdot 10^5)\,\Omega^2}{2000\,\Omega} = 1\,\mathrm{k\Omega} \;\checkmark$$

## Teil 3: Gleiches Verhalten für jede Last?

Leerlauf und Kurzschluss stimmen jetzt per Konstruktion. Spannend ist, ob auch alles dazwischen stimmt. Dazu hängt an beiden Netzwerken eine beliebige Last $R_L$.

<figure class="dia"><svg viewBox="0 0 380 190" role="img" aria-label="Bild 6: Das Original mit Last. R3 und R_L liegen in Reihe, zusammen parallel zu R2. Die Ströme I1 durch R1, I2 durch R2 und I_L durch R3 und R_L sind eingezeichnet.">
<path class="s" d="M80 79V40H120M164 40H226M270 40H340V73M340 117V150H80V111M190 40V73M190 117V150"/>
<circle class="b" cx="80" cy="95" r="16"/><path class="s" d="M80 79V111"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<rect class="a" x="332" y="73" width="16" height="44"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="206" y="99">R<tspan dy="3" font-size="9">2</tspan></text><text x="356" y="99">R<tspan dy="3" font-size="9">L</tspan></text>
<path class="f" d="M106 40l-9 -5v10z"/><text class="c" x="100" y="30">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="f" d="M190 64l-5 -9h10z"/><text x="182" y="64" text-anchor="end">I<tspan dy="3" font-size="9">2</tspan></text>
<path class="f" d="M290 40l-9 -5v10z"/><text class="c" x="286" y="30">I<tspan dy="3" font-size="9">L</tspan></text>
<text x="40" y="99" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
<text class="k c" x="200" y="180">R<tspan dy="3" font-size="8">3</tspan><tspan dy="-3"> + R</tspan><tspan dy="3" font-size="8">L</tspan><tspan dy="-3"> IN REIHE, ZUSAMMEN PARALLEL ZU R</tspan><tspan dy="3" font-size="8">2</tspan></text>
</svg><figcaption>Bild 6: das Original mit Last. Derselbe Rechenweg wie im Kurzschluss, nur steht statt R<sub>3</sub> jetzt R<sub>3</sub> + R<sub>L</sub>.</figcaption></figure>

**Original.** $R_3$ und $R_L$ führen denselben Strom $I_L$, sie liegen in Reihe. Diese Kette hängt zwischen Knoten und unterer Leitung, also parallel zu $R_2$. Das Ganze liegt in Reihe mit $R_1$. Es ist genau die Rechnung aus Teil 2, nur mit $R_3 + R_L$ statt $R_3$:

$$R_\text{ges} = R_1 + \frac{R_2\,(R_3 + R_L)}{R_2 + R_3 + R_L} = \frac{N}{R_2 + R_3 + R_L}$$

mit dem Zähler

$$\begin{aligned} N &= R_1 R_2 + R_1 R_3 + R_1 R_L + R_2 R_3 + R_2 R_L \\ &= S + (R_1 + R_2)\,R_L \end{aligned}$$

Strom aus der Quelle und Stromteiler wie oben:

$$\begin{aligned} I_1 &= \frac{U_q\,(R_2 + R_3 + R_L)}{N} \\ I_L &= I_1 \cdot \frac{R_2}{R_2 + R_3 + R_L} = \frac{U_q\,R_2}{N} \end{aligned}$$

**Ersatzquelle.** Hier ist es ein einfacher Reihenkreis:

$$I_L = \frac{U_0}{R_i + R_L} = \frac{U_q \cdot \frac{R_2}{R_1 + R_2}}{\frac{S}{R_1 + R_2} + R_L}$$

Zähler und Nenner mit $(R_1 + R_2)$ erweitern:

$$I_L = \frac{U_q\,R_2}{S + (R_1 + R_2)\,R_L} = \frac{U_q\,R_2}{N} \;\checkmark$$

Derselbe Ausdruck, und zwar für **jedes** $R_L$, nicht nur für $0$ und $\infty$. Die beiden Grenzfälle stecken mit drin: $R_L \to \infty$ gibt $I_L \to 0$ und $U_L \to U_0$, $R_L = 0$ gibt $N = S$ und damit $I_L = I_k$.

| $R_L$ | $I_L$ Original | $I_L$ Ersatz | $U_L$ |
|---:|---:|---:|---:|
| $220\,\Omega$ | $4{,}918\,\mathrm{mA}$ | $4{,}918\,\mathrm{mA}$ | $1{,}082\,\mathrm{V}$ |
| $1\,\mathrm{k\Omega}$ | $3{,}000\,\mathrm{mA}$ | $3{,}000\,\mathrm{mA}$ | $3{,}000\,\mathrm{V}$ |
| $10\,\mathrm{k\Omega}$ | $0{,}5455\,\mathrm{mA}$ | $0{,}5455\,\mathrm{mA}$ | $5{,}455\,\mathrm{V}$ |

Zum Ausprobieren: Oben hängt das Original, unten die Ersatzquelle, beide an derselben Last. Der Strom im Original wird direkt aus der Schaltung gerechnet, nicht über $U_0$ und $R_i$.

::: sim ersatzquelle u=12 r1=1k r2=1k r3=500 rl=1k
Zwischen Leerlauf, Last und Kurzschluss umschalten und an $R_1$, $R_2$, $R_3$ drehen: Die beiden Ströme bleiben immer gleich. Im Diagramm wandert der Arbeitspunkt auf der Geraden zwischen ihren Endpunkten.
:::

## Teil 4: $R_i$ über null gesetzte Quellen

Jetzt ein ganz anderer Weg zu $R_i$, ohne einen einzigen Strom auszurechnen.

<figure class="dia"><svg viewBox="0 0 380 190" role="img" aria-label="Bild 7: Quelle null gesetzt. Die Spannungsquelle ist durch einen dicken Draht ersetzt. An den Klemmen hängt ein Ohmmeter. Sein Prüfstrom fließt durch R3 und teilt sich am Knoten auf R1 und R2. R1 und R2 sind gemeinsam hinterlegt, sie liegen parallel.">
<path class="hl" d="M66 26H204V162H66Z"/>
<path class="s" d="M80 40H120M164 40H226M270 40H296.5M80 150H296.5M190 40V73M190 117V150"/>
<path class="s" d="M80 40V150" style="stroke-width:3"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="20">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="206" y="99">R<tspan dy="3" font-size="9">2</tspan></text>
<text x="60" y="92" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan><tspan dy="-3"> = 0</tspan></text><text class="k" x="60" y="108" text-anchor="end">DRAHT</text>
<text class="c" x="135" y="104">R<tspan dy="3" font-size="9">1</tspan><tspan dy="-3"> || R</tspan><tspan dy="3" font-size="9">2</tspan></text>
<path class="f" d="M282 40l9 -5v10z"/><path class="f" d="M172 40l9 -5v10z"/><path class="f" d="M190 64l-5 -9h10z"/>
<path class="s" d="M303.5 40H340V79M340 111V150H303.5"/><circle class="b" cx="340" cy="95" r="16"/><text class="c" x="340" y="100">Ω</text>
<text x="318" y="134" text-anchor="end">R<tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> = ?</tspan></text>
</svg><figcaption>Bild 7: Quelle null gesetzt, ein Ohmmeter an den Klemmen. Die Dreiecke zeigen den Prüfstrom: durch R<sub>3</sub>, dann aufgeteilt auf R<sub>1</sub> und R<sub>2</sub>. Hinterlegt ist der Parallelblock.</figcaption></figure>

**Schritt 1: Quelle null setzen.** Eine Spannungsquelle mit $U_q = 0$ hält zwischen ihren Anschlüssen null Volt, egal welcher Strom fließt. Genau das macht ein Draht. Die Klemmen bleiben offen.

**Schritt 2: von den Klemmen hineinschauen.** Man stellt sich ein Ohmmeter an den Klemmen vor. Es schickt einen Prüfstrom in die obere Klemme. Der muss durch $R_3$ und teilt sich am Knoten auf $R_1$ und $R_2$ auf.

**Schritt 3: Struktur erkennen.** $R_2$ hängt zwischen Knoten und unterer Leitung. $R_1$ hängt über den Draht, der früher die Quelle war, ebenfalls zwischen Knoten und unterer Leitung. Also liegen $R_1$ und $R_2$ parallel, und $R_3$ liegt in Reihe zu diesem Block:

$$R_i = R_3 + R_1 \parallel R_2 = R_3 + \frac{R_1 R_2}{R_1 + R_2}$$

Im Beispiel: $R_i = 500\,\Omega + 500\,\Omega = 1\,\mathrm{k\Omega}$.

**Schritt 4: mit Teil 2 vergleichen.** Auf einen Bruch gebracht:

$$\begin{aligned} R_3 + \frac{R_1 R_2}{R_1 + R_2} &= \frac{R_3\,(R_1 + R_2) + R_1 R_2}{R_1 + R_2} \\ &= \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_1 + R_2} \\ &= \frac{S}{R_1 + R_2} \end{aligned}$$

Genau der Wert aus Teil 2, auf einem völlig anderen Weg.

::: info Kontrast zu Teil 1
In Teil 1 sitzt die Quelle innen und die Klemmen sind offen. Darum bleibt $R_3$ stromlos und spielt keine Rolle. In Teil 4 kommt der Prüfstrom von den Klemmen selbst, darum fließt er zuerst durch $R_3$. Derselbe Widerstand, eine ganz andere Rolle, je nachdem, wo die Anregung sitzt.
:::

::: merke Erkenntnis
Der Innenwiderstand ist der Widerstand zwischen den Klemmen, wenn alle unabhängigen Quellen null gesetzt sind: **Spannungsquellen → Draht, Stromquellen → Unterbrechung.** Das ist derselbe Wert wie $U_0 / I_k$, aber ohne Stromrechnung.
:::

Zwei Feinheiten, die in der Übung gern gefragt werden:

- **$U_0 / I_k$ kann versagen.** Ist $U_0 = 0$, etwa weil $U_q = 0$ oder $R_2 = 0$, dann ist auch $I_k = 0$, und der Quotient $0/0$ sagt nichts. Ein Innenwiderstand existiert trotzdem. Der Weg über null gesetzte Quellen funktioniert immer.
- **Gesteuerte Quellen nie null setzen.** Kommen gesteuerte Quellen vor, zum Beispiel im Kleinsignalmodell eines Transistors, bleiben sie stehen, weil sie von Größen im Netzwerk abhängen. Dann legt man eine Prüfquelle an die Klemmen und rechnet $R_i = U_\text{Prüf} / I_\text{Prüf}$.

## Warum das immer klappt

Teil 3 hat gezeigt, dass sich dieses Netzwerk durch $U_0$ und $R_i$ ersetzen lässt. Mit dem [Überlagerungsprinzip aus A3.1](beitrag.html?b=ueberlagerung-leistungsbilanz) zeigt man das in wenigen Zeilen für **jedes** lineare Netzwerk.

**1. Die Last durch eine Stromquelle ersetzen.** Angenommen, an den Klemmen fließt der Strom $I$. Dem Netzwerk ist es egal, ob ihn ein Widerstand zieht oder eine ideale Stromquelle, die genau $I$ erzwingt. Ersetzt man die Last durch diese Stromquelle, ändert sich im Netzwerk nichts.

**2. Überlagern.** Jetzt gibt es zwei Arten von Quellen, die inneren und die Stromquelle $I$:

- **(a) nur die inneren Quellen:** Die Stromquelle wird abgeschaltet, also zur Unterbrechung. Das ist der Leerlauf, und an den Klemmen liegt $U^{(a)} = U_0$.
- **(b) nur die Stromquelle:** Die inneren Quellen werden null gesetzt. Übrig bleiben nur Widerstände, von den Klemmen aus gesehen genau $R_i$. Der Strom $I$ wird oben aus dem Netzwerk herausgezogen, fließt im Netzwerk also von der unteren zur oberen Klemme. Damit liegt die obere Klemme tiefer: $U^{(b)} = -R_i \cdot I$.

**3. Addieren.**

$$U = U^{(a)} + U^{(b)} = U_0 - R_i \cdot I$$

<figure class="dia"><svg viewBox="0 0 380 150" role="img" aria-label="Bild 8: Beweis mit Überlagerung. Links das lineare Netz mit Stromquelle I an den Klemmen. Gleich: Netz mit eingeschalteten Quellen und offenen Klemmen, Spannung U_0. Plus: Netz mit ausgeschalteten Quellen und Stromquelle I, Spannung minus R_i mal I.">
<defs><marker id="eq-a8" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<rect class="b" x="4" y="34" width="66" height="72"/><text class="k c" x="37" y="66">LINEARES</text><text class="k c" x="37" y="80">NETZ</text>
<path class="s" d="M70 50H96V56M70 90H96V84"/><circle class="b" cx="96" cy="70" r="14"/><path class="s" d="M96 60V80" marker-end="url(#eq-a8)"/><text x="104" y="48">I</text>
<text class="c" x="124" y="76">=</text>
<rect class="b" x="138" y="34" width="66" height="72"/><text class="k c" x="171" y="66">QUELLEN</text><text class="k c" x="171" y="80">AN</text>
<path class="s" d="M204 50H223M204 90H223"/><circle class="b" cx="226.5" cy="50" r="3.5"/><circle class="b" cx="226.5" cy="90" r="3.5"/>
<text class="c" x="246" y="76">+</text>
<rect class="b" x="258" y="34" width="66" height="72"/><text class="k c" x="291" y="66">QUELLEN</text><text class="k c" x="291" y="80">AUS</text>
<path class="s" d="M324 50H350V56M324 90H350V84"/><circle class="b" cx="350" cy="70" r="14"/><path class="s" d="M350 60V80" marker-end="url(#eq-a8)"/><text x="358" y="48">I</text>
<text class="c" x="56" y="134">U</text>
<text class="c" x="180" y="134">U<tspan dy="-7" font-size="9">(a)</tspan><tspan dy="7"> = U</tspan><tspan dy="3" font-size="9">0</tspan></text>
<text class="c" x="304" y="134">U<tspan dy="-7" font-size="9">(b)</tspan><tspan dy="7"> = −R</tspan><tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> I</tspan></text>
</svg><figcaption>Bild 8: der Beweis in einem Bild. Die Last wird zur Stromquelle I, dann wird überlagert: Leerlauf plus Netz ohne Quellen.</figcaption></figure>

Das ist genau die Kennlinie der Ersatzquelle. Jede Last sucht sich auf dieser Geraden ihren Punkt, und der ist für Original und Ersatzquelle derselbe. Nebenbei erklärt der Beweis, warum Teil 2 und Teil 4 dasselbe $R_i$ liefern: In beiden Fällen ist es der Widerstand des Netzes ohne Quellen. Im Kurzschluss gilt $U = 0$, also $I_k = U_0 / R_i$.

Voraussetzung ist ein **lineares** Netzwerk: Widerstände, ideale Quellen, lineare gesteuerte Quellen. Eine Diode hat eine gekrümmte Kennlinie. Dann gilt die Ersatzquelle nur noch näherungsweise in der Nähe eines [[Arbeitspunkts|arbeitspunkt]]. Ein Sonderfall: Liegt eine ideale Stromquelle direkt in Reihe mit einer Klemme, legt sie den Klemmenstrom fest. Leerlauf ist dann gar nicht möglich, denn die Quelle müsste ihren Strom durch eine Unterbrechung treiben, und $R_i$ wäre unendlich. Eine Ersatzspannungsquelle gibt es dann nicht, wohl aber die Ersatzstromquelle aus der ersten Aufgabe unten.

## Was die Ersatzquelle nicht kann

Gleich ist nur, was **an den Klemmen** passiert. Im Inneren geht es ganz anders zu. Am deutlichsten sieht man das an den Leistungen, hier mit $R_L = 1\,\mathrm{k\Omega}$. Im Original ist $I_1 = 7{,}5\,\mathrm{mA}$, der Knoten liegt bei $12\,\mathrm{V} - 7{,}5\,\mathrm{V} = 4{,}5\,\mathrm{V}$, also $I_2 = 4{,}5\,\mathrm{mA}$ und $I_L = 3\,\mathrm{mA}$. Die Quelle gibt $12\,\mathrm{V} \cdot 7{,}5\,\mathrm{mA} = 90\,\mathrm{mW}$ ab. Davon heizen $R_1$ mit $56{,}25\,\mathrm{mW}$, $R_2$ mit $20{,}25\,\mathrm{mW}$ und $R_3$ mit $4{,}5\,\mathrm{mW}$, der Rest geht in die Last. Die Ersatzquelle gibt nur $6\,\mathrm{V} \cdot 3\,\mathrm{mA} = 18\,\mathrm{mW}$ ab.

| | Original | Ersatzquelle |
|:---|---:|---:|
| Quelle gibt ab | $90\,\mathrm{mW}$ | $18\,\mathrm{mW}$ |
| innen verheizt | $81\,\mathrm{mW}$ | $9\,\mathrm{mW}$ |
| Last $R_L$ | $9\,\mathrm{mW}$ | $9\,\mathrm{mW}$ |
| Wirkungsgrad | $10\,\%$ | $50\,\%$ |

Die Last bekommt in beiden Fällen $9\,\mathrm{mW}$, das muss so sein. Aber die Ersatzquelle behauptet einen [[Wirkungsgrad|wirkungsgrad]] von $50\,\%$, während das echte Netzwerk nur $10\,\%$ schafft. Noch krasser im Leerlauf: Die Ersatzquelle verbraucht nichts, das Original heizt weiter $\frac{U_q^2}{R_1 + R_2} = 72\,\mathrm{mW}$ in $R_1$ und $R_2$.

::: merke
Die Ersatzquelle stimmt für alles, was an den Klemmen und in der Last passiert. Ströme, Spannungen und Leistungen im Inneren des Originals kann man aus ihr nicht ablesen.
:::

## Typische Fehler

::: achtung Sechs Klassiker
- **Kurzschluss und Quelle null verwechseln:** Kurzschluss heißt Klemmen verbinden, Quelle aktiv. Quelle null heißt Quelle durch Draht ersetzen, Klemmen offen.
- **$R_3$ in den Leerlauf-Teiler einbauen:** Im Leerlauf fließt durch $R_3$ nichts, er gehört nicht zum Teiler. $U_0 = U_q \frac{R_2}{R_1 + R_2}$, ohne $R_3$.
- **$R_2$ im Kurzschluss vergessen:** $I_k = U_q / (R_1 + R_3) = 8\,\mathrm{mA}$ wäre falsch, denn $R_2$ zweigt Strom ab. Richtig sind $6\,\mathrm{mA}$.
- **Stromteiler mit dem falschen Widerstand im Zähler:** $I_1 \cdot \frac{R_3}{R_2 + R_3} = 3\,\mathrm{mA}$ ist der Strom durch $R_2$, nicht durch $R_3$. Im Zähler steht immer der andere Widerstand.
- **Null gesetzte Spannungsquelle auftrennen statt kurzschließen:** Dann fiele $R_1$ heraus, und man bekäme $R_i = R_3 + R_2 = 1{,}5\,\mathrm{k\Omega}$. Eine Spannungsquelle auf null ist ein Draht.
- **Innere Leistungen aus der Ersatzquelle berechnen:** Sie gilt nur an den Klemmen, siehe oben.
:::

## Ergebnis

| Zustand | Was passiert | Ergebnis | Beispiel |
|:---|:---|:---|---:|
| Leerlauf | $I_3 = 0$, $R_1$ und $R_2$ in Reihe | $U_0 = U_q \frac{R_2}{R_1 + R_2}$ | $6\,\mathrm{V}$ |
| Kurzschluss | $R_2 \parallel R_3$, Stromteiler | $I_k = \frac{U_q R_2}{S}$, $R_i = \frac{U_0}{I_k} = \frac{S}{R_1 + R_2}$ | $6\,\mathrm{mA}$, $1\,\mathrm{k\Omega}$ |
| Last $R_L$ | $R_3 + R_L$ parallel zu $R_2$ | $I_L = \frac{U_0}{R_i + R_L}$, links wie rechts | $3\,\mathrm{mA}$ bei $1\,\mathrm{k\Omega}$ |
| Quelle null | $R_1 \parallel R_2$, $R_3$ in Reihe | $R_i = R_3 + \frac{R_1 R_2}{R_1 + R_2}$ | $1\,\mathrm{k\Omega}$ |

mit $S = R_1 R_2 + R_1 R_3 + R_2 R_3$.

::: merke Merksätze
- Ein lineares Netzwerk hat an zwei Klemmen eine gerade Kennlinie $U = U_0 - R_i I$. Zwei Punkte legen sie fest.
- $U_0$ ist die Leerlaufspannung, $R_i = U_0 / I_k$.
- Schneller: $R_i$ ist der Widerstand zwischen den Klemmen bei null gesetzten Quellen. Spannungsquelle → Draht, Stromquelle → Unterbrechung.
- Stromteiler: Im Zähler steht der andere Widerstand.
- Die Ersatzquelle stimmt nur an den Klemmen, nicht im Inneren.
:::

## Zum Weiterdenken

::: aufgabe Die Ersatzstromquelle
Dasselbe Netzwerk lässt sich auch durch eine ideale Stromquelle mit einem Widerstand **parallel** ersetzen (Satz von Norton). Wie groß müssen Quellenstrom und Widerstand sein? Rechne zur Probe $I_L$ für $R_L = 1\,\mathrm{k\Omega}$.
???
Im Kurzschluss fließt der ganze Quellenstrom durch den Draht, also ist der Quellenstrom $I_k = 6\,\mathrm{mA}$. Im Leerlauf fließt er ganz durch den Parallelwiderstand und erzeugt dort $I_k \cdot R = U_0$, also $R = U_0 / I_k = R_i = 1\,\mathrm{k\Omega}$. Derselbe Innenwiderstand, nur parallel statt in Reihe.

Probe mit dem Stromteiler:

$$I_L = I_k \cdot \frac{R_i}{R_i + R_L} = 6\,\mathrm{mA} \cdot \frac{1\,\mathrm{k\Omega}}{2\,\mathrm{k\Omega}} = 3\,\mathrm{mA} \;\checkmark$$

Beide Ersatzquellen haben dieselbe Kennlinie, also sind sie an den Klemmen nicht zu unterscheiden. Umrechnen geht immer mit $U_0 = R_i \cdot I_k$.
:::

::: aufgabe Wie viel Leistung geht höchstens heraus?
Für welches $R_L$ bekommt die Last die meiste Leistung, und wie viel ist das? Wie viel liefert die echte Quelle $U_q$ in diesem Moment?
???
Mit der Ersatzquelle:

$$P_L = R_L I_L^2 = \frac{U_0^2\,R_L}{(R_i + R_L)^2}$$

Ableiten nach $R_L$ (Quotientenregel) und null setzen:

$$\frac{\mathrm{d}P_L}{\mathrm{d}R_L} = U_0^2\,\frac{R_i - R_L}{(R_i + R_L)^3} = 0 \quad\Rightarrow\quad R_L = R_i$$

Das ist die [[Leistungsanpassung|leistungsanpassung]]:

$$P_{L,\max} = \frac{U_0^2}{4 R_i} = \frac{(6\,\mathrm{V})^2}{4 \cdot 1\,\mathrm{k\Omega}} = 9\,\mathrm{mW}$$

Die echte Quelle liefert dabei $90\,\mathrm{mW}$, siehe [Was die Ersatzquelle nicht kann](#was-die-ersatzquelle-nicht-kann). Leistungsanpassung maximiert die Leistung an der Last, nicht den Wirkungsgrad. Eine ganze Aufgabe dazu: [Brückenschaltung](beitrag.html?b=brueckenschaltung).
:::

::: aufgabe Messen ohne Kurzschluss
Eine echte Quelle schließt man besser nicht kurz. Mit $R_L = 10\,\mathrm{k\Omega}$ misst du $U = 5{,}455\,\mathrm{V}$, mit $R_L = 1\,\mathrm{k\Omega}$ misst du $U = 3{,}000\,\mathrm{V}$. Bestimme $U_0$ und $R_i$ aus diesen zwei Messungen.
???
Zuerst die Ströme: $I = U / R_L$, also $0{,}5455\,\mathrm{mA}$ und $3{,}000\,\mathrm{mA}$. Beide Punkte liegen auf $U = U_0 - R_i I$. Die Differenz der beiden Gleichungen eliminiert $U_0$:

$$\begin{aligned} R_i &= \frac{U_1 - U_2}{I_2 - I_1} \\ &= \frac{5{,}455\,\mathrm{V} - 3\,\mathrm{V}}{3\,\mathrm{mA} - 0{,}5455\,\mathrm{mA}} \\ &= \frac{2{,}455\,\mathrm{V}}{2{,}4545\,\mathrm{mA}} \approx 1\,\mathrm{k\Omega} \end{aligned}$$

$$U_0 = U_2 + R_i I_2 = 3\,\mathrm{V} + 1\,\mathrm{k\Omega} \cdot 3\,\mathrm{mA} = 6\,\mathrm{V}$$

Es braucht nicht unbedingt Leerlauf und Kurzschluss. Zwei beliebige Punkte legen die Gerade genauso fest.
:::

::: aufgabe Grenzfälle
Was wird aus $U_0$ und $R_i$, wenn $R_2 \to \infty$ geht (der Widerstand wird entfernt)? Und wenn $R_2 = 0$ ist?
???
**$R_2 \to \infty$:** $U_0 = U_q \frac{R_2}{R_1 + R_2} \to U_q$ und $R_i = R_3 + R_1 \parallel R_2 \to R_3 + R_1$. Klar: Ohne $R_2$ ist alles eine Reihenschaltung aus $U_q$, $R_1$ und $R_3$.

**$R_2 = 0$:** $U_0 = 0$ und $R_i = R_3 + 0 = R_3$. Der Draht anstelle von $R_2$ schließt die Quelle samt $R_1$ kurz, an den Klemmen sieht man nur noch $R_3$. Hier ist auch $I_k = 0$, und $U_0 / I_k$ wäre $0/0$. Der Weg über die null gesetzte Quelle liefert trotzdem sofort $R_i = R_3$.
:::
