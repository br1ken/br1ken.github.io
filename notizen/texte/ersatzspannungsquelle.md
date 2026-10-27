---
titel: Ersatzspannungsquelle — Leerlauf, Kurzschluss, Last und null gesetzte Quellen
datum: 2026-10-26
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.2
tags: [Ersatzspannungsquelle, Thévenin, Leerlauf, Kurzschluss, Innenwiderstand, Stromteiler]
teaser: Aufgabe 3.2 Schritt für Schritt: Leerlaufspannung, Innenwiderstand über den Kurzschluss, Prüfung mit beliebiger Last und Innenwiderstand über null gesetzte Quellen.
welle: saege
---

## Die Aufgabe

Das linke Netzwerk soll in eine [[Ersatzspannungsquelle|ersatzquelle]] ($U_0$, $R_i$) umgerechnet werden. Beide Netzwerke sollen sich gegenüber einem Lastwiderstand $R_L$ an den Klemmen gleich verhalten.

<figure class="dia"><svg viewBox="0 0 380 340" role="img" aria-label="Bild 1: Oben das Original: Spannungsquelle U_q mit Zählpfeil nach unten, oben R1 zu einem Knoten, vom Knoten R2 nach unten zur unteren Leitung, vom Knoten R3 oben zur Klemme. Unten die gesuchte Ersatzspannungsquelle: Quelle U_0 mit Zählpfeil nach unten und R_i in Reihe.">
<defs><marker id="a32-1-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a32-1-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text class="k" x="4" y="12">ORIGINAL</text>
<path class="s" d="M80 79V40M80 111V150"/><circle class="b" cx="80" cy="95" r="16"/><path class="s" d="M80 79V111"/>
<path class="s" d="M48 79V111" marker-end="url(#a32-1-e)"/><text x="40" y="99" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M80 40H120M164 40H226M270 40H296.5M80 150H296.5M190 40V73M190 117V150"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="206" y="99">R<tspan dy="3" font-size="9">2</tspan></text>
<path class="m" d="M190 166V194" marker-end="url(#a32-1-m)"/><text class="k" x="202" y="184">AN DEN KLEMMEN GLEICH</text>
<text class="k" x="4" y="212">ERSATZSPANNUNGSQUELLE</text>
<path class="s" d="M80 264V240M80 296V320"/><circle class="b" cx="80" cy="280" r="16"/><path class="s" d="M80 264V296"/>
<path class="s" d="M112 264V296" marker-end="url(#a32-1-e)"/><text x="120" y="284">U<tspan dy="3" font-size="9">0</tspan><tspan dy="-3"> = ?</tspan></text>
<path class="s" d="M80 240H170M214 240H296.5M80 320H296.5"/><rect class="b" x="170" y="232" width="44" height="16"/>
<circle class="b" cx="300" cy="240" r="3.5"/><circle class="b" cx="300" cy="320" r="3.5"/>
<text class="c" x="192" y="224">R<tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> = ?</tspan></text>
</svg><figcaption>Bild 1: oben das Original, unten die gesuchte Ersatzspannungsquelle. Die kleinen Kreise sind die Klemmen.</figcaption></figure>

1. $U_0$ so wählen, dass die Leerlaufspannungen gleich sind.
2. $R_i$ so wählen, dass die Kurzschlussströme gleich sind.
3. Prüfen, ob das Verhalten für beliebiges $R_L$ gleich ist.
4. Innenwiderstände über null gesetzte Quellen bestimmen. Erkenntnis?

## Grundidee

Die Ersatzquelle hat zwei Unbekannte: $U_0$ und $R_i$. Zwei Unbekannte brauchen zwei Gleichungen. Die Aufgabe liefert genau zwei Bedingungen: [[Leerlauf und Kurzschluss|leerlauf-kurzschluss]].

**Warum genügen zwei Messungen?**

- Ein lineares Netzwerk hat an den Klemmen eine gerade Kennlinie $U(I)$. Eine Gerade ist durch zwei Punkte festgelegt.
- Leerlauf liefert den Punkt $(0,\ U_0)$.
- Kurzschluss liefert den Punkt $(I_k,\ 0)$.
- Jede Last $R_L$ stellt einen Punkt auf dieser Geraden ein. Stimmen beide Punkte überein, stimmt die ganze Gerade.

<figure class="dia"><svg viewBox="0 0 380 200" role="img" aria-label="Bild 2: Kennlinie U über I. Eine fallende Gerade vom Leerlaufpunkt U_0 auf der U-Achse bis zum Kurzschlusspunkt I_k auf der I-Achse.">
<defs><marker id="a32-2-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a32-2-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<path class="s" d="M50 182V20" marker-end="url(#a32-2-e)"/><path class="s" d="M40 170H346" marker-end="url(#a32-2-e)"/>
<text x="42" y="22" text-anchor="end">U</text><text x="340" y="190">I</text>
<path class="s" d="M50 40L300 170" style="stroke-width:2.4"/>
<circle class="b" cx="50" cy="40" r="4.5"/><circle class="b" cx="300" cy="170" r="4.5"/>
<text x="42" y="44" text-anchor="end">U<tspan dy="3" font-size="9">0</tspan></text><text class="c" x="300" y="190">I<tspan dy="3" font-size="9">k</tspan></text>
<text class="k" x="62" y="34">LEERLAUF</text><text class="k" x="230" y="154">KURZSCHLUSS</text>
</svg><figcaption>Bild 2: die Kennlinie an den Klemmen. Der Leerlauf liefert den Punkt (0, U<sub>0</sub>), der Kurzschluss den Punkt (I<sub>k</sub>, 0).</figcaption></figure>

::: info Gegenbeispiel: ein Punkt reicht nicht
Box A: $U_0 = 10\,\mathrm{V}$, $R_i = 10\,\Omega$. Box B: $U_0 = 1\,\mathrm{V}$, $R_i = 1\,\Omega$.

Kurzschluss: Beide liefern $I_k = 1\,\mathrm{A}$. Sie sind nicht unterscheidbar. Mit $R_L = 10\,\Omega$:

$$I_A = \frac{10}{10 + 10}\,\mathrm{A} = 0{,}5\,\mathrm{A} \qquad I_B = \frac{1}{1 + 10}\,\mathrm{A} \approx 0{,}09\,\mathrm{A}$$

Völlig verschiedenes Verhalten. Erst der zweite Punkt legt die Gerade fest.
:::

## Teil 1: Leerlaufspannung $U_0$

<figure class="dia"><svg viewBox="0 0 380 190" role="img" aria-label="Bild 3: Leerlauf. Die Klemmen sind offen. R3 ist gestrichelt gezeichnet, durch ihn fließt kein Strom. Der Strom I fließt durch R1 und R2. Neben R2 der Zählpfeil U_R2, an den Klemmen der Zählpfeil U_0.">
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
</svg><figcaption>Bild 3: Leerlauf. Durch R<sub>3</sub> fließt nichts, übrig bleibt der Kreis aus U<sub>q</sub>, R<sub>1</sub> und R<sub>2</sub>.</figcaption></figure>

**Schritt 1: Leerlauf festlegen.** Die Klemmen sind offen, es ist keine Last angeschlossen. Der Klemmenstrom ist daher null.

**Schritt 2: $R_3$ betrachten.** $R_3$ führt zu einer offenen Klemme, es gibt keinen geschlossenen Weg.

$$I_3 = 0 \quad\Rightarrow\quad U_{R_3} = R_3 \cdot I_3 = 0$$

**Schritt 3: Klemmenspannung bestimmen.** Von der oberen zur unteren Klemme liegen nur $R_3$ (ohne Spannung) und $R_2$.

$$U_0 = U_{R_3} + U_{R_2} = U_{R_2}$$

**Schritt 4: Restkreis erkennen.** $R_1$ und $R_2$ werden vom selben Strom durchflossen. Sie liegen in Serie und bilden einen unbelasteten [[Spannungsteiler|spannungsteiler]].

**Schritt 5: Strom im Kreis.**

$$I = \frac{U_q}{R_1 + R_2}$$

**Schritt 6: Spannung über $R_2$.**

$$U_{R_2} = R_2 \cdot I = U_q \cdot \frac{R_2}{R_1 + R_2}$$

::: merke Leerlaufspannung
$$U_0 = U_q \cdot \frac{R_2}{R_1 + R_2}$$

Die Ersatzquelle muss im Leerlauf dieselbe Spannung liefern wie das Original. Rechts fließt im Leerlauf ebenfalls kein Strom durch $R_i$, also liegt $U_0$ direkt an den Klemmen.
:::

## Teil 2: Innenwiderstand $R_i$ über den Kurzschluss

<figure class="dia"><svg viewBox="0 0 380 340" role="img" aria-label="Bild 4: Kurzschluss. Oben das Original, die Klemmen mit einem dicken Draht verbunden, I1 fließt durch R1, I_k durch den Draht nach unten. Unten die Ersatzspannungsquelle, ebenfalls kurzgeschlossen, I_k durch den Draht.">
<defs><marker id="a32-4-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a32-4-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text class="k" x="4" y="12">ORIGINAL</text>
<path class="s" d="M80 79V40M80 111V150"/><circle class="b" cx="80" cy="95" r="16"/><path class="s" d="M80 79V111"/>
<path class="s" d="M48 79V111" marker-end="url(#a32-4-e)"/><text x="40" y="99" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M80 40H120M164 40H226M270 40H296.5M80 150H296.5M190 40V73M190 117V150"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="206" y="99">R<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M303.5 40H330V150H303.5" style="stroke-width:3"/>
<path class="s" d="M346 77V113" marker-end="url(#a32-4-e)"/>
<text x="352" y="99">I<tspan dy="3" font-size="9">k</tspan></text>
<path class="s" d="M128 60H156" marker-end="url(#a32-4-e)"/><text class="c" x="142" y="76">I<tspan dy="3" font-size="9">1</tspan></text>
<path class="m" d="M190 166V194" marker-end="url(#a32-4-m)"/><text class="k" x="202" y="184">GLEICHER KURZSCHLUSSSTROM</text>
<text class="k" x="4" y="212">ERSATZSPANNUNGSQUELLE</text>
<path class="s" d="M80 264V240M80 296V320"/><circle class="b" cx="80" cy="280" r="16"/><path class="s" d="M80 264V296"/>
<path class="s" d="M112 264V296" marker-end="url(#a32-4-e)"/><text x="120" y="284">U<tspan dy="3" font-size="9">0</tspan></text>
<path class="s" d="M80 240H170M214 240H296.5M80 320H296.5"/><rect class="b" x="170" y="232" width="44" height="16"/>
<circle class="b" cx="300" cy="240" r="3.5"/><circle class="b" cx="300" cy="320" r="3.5"/>
<text class="c" x="192" y="224">R<tspan dy="3" font-size="9">i</tspan></text>
<path class="s" d="M303.5 240H330V320H303.5" style="stroke-width:3"/>
<path class="s" d="M346 262V298" marker-end="url(#a32-4-e)"/>
<text x="352" y="284">I<tspan dy="3" font-size="9">k</tspan></text>
</svg><figcaption>Bild 4: Kurzschluss an beiden Schaltungen. U<sub>q</sub> bleibt drin und treibt den Kurzschlussstrom I<sub>k</sub> durch den Draht.</figcaption></figure>

::: achtung Kurzschluss ≠ Quelle null setzen
- **Kurzschluss (Teil 2):** Die Klemmen werden mit einem Draht verbunden. $U_q$ bleibt drin und treibt Strom. Gesucht ist $I_k$.
- **Quelle null setzen (Teil 4):** $U_q$ wird durch einen Draht ersetzt. Die Klemmen bleiben offen. Gesucht ist ein Widerstand.

Ein Draht hat die Spannung $U = 0$. Der Strom darin ist nicht null, er stellt sich durch die Schaltung ein.
:::

**Schritt 1: Kurzschluss festlegen.** Die Klemmen werden mit einem Draht verbunden. Die Quelle $U_q$ bleibt in der Schaltung.

**Schritt 2: Struktur erkennen.** $R_3$ liegt jetzt über den Kurzschlussdraht zwischen oberem Knoten und unterer Leitung, also parallel zu $R_2$. $R_1$ liegt in Serie zu dieser Parallelschaltung.

**Schritt 3: Gesamtwiderstand.**

$$R_\text{ges} = R_1 + \frac{R_2 R_3}{R_2 + R_3}$$

Auf gemeinsamen Nenner:

$$R_\text{ges} = \frac{R_1 (R_2 + R_3)}{R_2 + R_3} + \frac{R_2 R_3}{R_2 + R_3} = \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_2 + R_3}$$

**Schritt 4: Gesamtstrom.**

$$I_1 = \frac{U_q}{R_\text{ges}} = U_q \cdot \frac{R_2 + R_3}{R_1 R_2 + R_1 R_3 + R_2 R_3}$$

**Schritt 5: Spannung über der Parallelschaltung.** Parallele Zweige haben dieselbe Spannung: $U_p = U_{R_2} = U_{R_3}$. $I_1$ fließt durch den Ersatzwiderstand $R_2 \parallel R_3$.

$$U_p = I_1 \cdot \frac{R_2 R_3}{R_2 + R_3} = U_q \cdot \frac{R_2 + R_3}{R_1 R_2 + R_1 R_3 + R_2 R_3} \cdot \frac{R_2 R_3}{R_2 + R_3}$$

$(R_2 + R_3)$ kürzt sich:

$$U_p = U_q \cdot \frac{R_2 R_3}{R_1 R_2 + R_1 R_3 + R_2 R_3}$$

**Schritt 6: Kurzschlussstrom.** Durch $R_3$ fließt der Kurzschlussstrom.

$$I_k = \frac{U_p}{R_3} = U_q \cdot \frac{R_2 R_3}{R_3\,(R_1 R_2 + R_1 R_3 + R_2 R_3)}$$

$R_3$ kürzt sich:

$$I_k = U_q \cdot \frac{R_2}{R_1 R_2 + R_1 R_3 + R_2 R_3}$$

**Schritt 7: Vergleich mit der Ersatzquelle.** Rechts liegt im Kurzschluss nur $R_i$ im Kreis.

$$I_k = \frac{U_0}{R_i} \quad\Rightarrow\quad R_i = \frac{U_0}{I_k}$$

**Schritt 8: Einsetzen.**

$$R_i = \frac{U_q \cdot \dfrac{R_2}{R_1 + R_2}}{U_q \cdot \dfrac{R_2}{R_1 R_2 + R_1 R_3 + R_2 R_3}}$$

Durch einen Bruch teilen heißt mit dem Kehrwert multiplizieren. $U_q$ und $R_2$ kürzen sich.

::: merke Innenwiderstand
$$R_i = \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_1 + R_2}$$

Der Innenwiderstand ist das Verhältnis von Leerlaufspannung zu Kurzschlussstrom.
:::

::: info Der Stromteiler, hergeleitet
Grundsatz: Parallele Zweige haben dieselbe Spannung.

Schritt 1: Gemeinsame Spannung.

$$U_p = I_1 \cdot \frac{R_2 R_3}{R_2 + R_3}$$

Schritt 2: Ohm am einzelnen Zweig.

$$I_3 = \frac{U_p}{R_3}$$

Schritt 3: Einsetzen, $R_3$ kürzt sich.

$$I_3 = \frac{1}{R_3} \cdot I_1 \cdot \frac{R_2 R_3}{R_2 + R_3} = I_1 \cdot \frac{R_2}{R_2 + R_3}$$

Im Zähler steht der *andere* Widerstand.

**Kontrast:** Serie: gleicher Strom, die Spannung teilt sich nach dem eigenen Widerstand. Parallel: gleiche Spannung, der Strom teilt sich bei zwei Zweigen nach dem fremden Widerstand.
:::

## Teil 3: Beliebiger Lastwiderstand $R_L$

<figure class="dia"><svg viewBox="0 0 380 340" role="img" aria-label="Bild 5: Last. Oben das Original mit dem Lastwiderstand R_L an den Klemmen und dem Laststrom I_L. Unten die Ersatzspannungsquelle mit demselben R_L und I_L.">
<defs><marker id="a32-5-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a32-5-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text class="k" x="4" y="12">ORIGINAL</text>
<path class="s" d="M80 79V40M80 111V150"/><circle class="b" cx="80" cy="95" r="16"/><path class="s" d="M80 79V111"/>
<path class="s" d="M48 79V111" marker-end="url(#a32-5-e)"/><text x="40" y="99" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M80 40H120M164 40H226M270 40H296.5M80 150H296.5M190 40V73M190 117V150"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="206" y="99">R<tspan dy="3" font-size="9">2</tspan></text>
<path class="s" d="M303.5 40H330V73M330 117V150H303.5"/>
<rect class="a" x="322" y="73" width="16" height="44"/>
<text x="316" y="99" text-anchor="end">R<tspan dy="3" font-size="9">L</tspan></text>
<path class="s" d="M352 77V113" marker-end="url(#a32-5-e)"/>
<text x="358" y="99">I<tspan dy="3" font-size="9">L</tspan></text>
<path class="m" d="M190 166V194" marker-end="url(#a32-5-m)"/><text class="k" x="202" y="184">GLEICHER LASTSTROM?</text>
<text class="k" x="4" y="212">ERSATZSPANNUNGSQUELLE</text>
<path class="s" d="M80 264V240M80 296V320"/><circle class="b" cx="80" cy="280" r="16"/><path class="s" d="M80 264V296"/>
<path class="s" d="M112 264V296" marker-end="url(#a32-5-e)"/><text x="120" y="284">U<tspan dy="3" font-size="9">0</tspan></text>
<path class="s" d="M80 240H170M214 240H296.5M80 320H296.5"/><rect class="b" x="170" y="232" width="44" height="16"/>
<circle class="b" cx="300" cy="240" r="3.5"/><circle class="b" cx="300" cy="320" r="3.5"/>
<text class="c" x="192" y="224">R<tspan dy="3" font-size="9">i</tspan></text>
<path class="s" d="M303.5 240H330V260M330 300V320H303.5"/>
<rect class="a" x="322" y="260" width="16" height="40"/>
<text x="316" y="284" text-anchor="end">R<tspan dy="3" font-size="9">L</tspan></text>
<path class="s" d="M352 262V298" marker-end="url(#a32-5-e)"/>
<text x="358" y="284">I<tspan dy="3" font-size="9">L</tspan></text>
</svg><figcaption>Bild 5: dieselbe Last R<sub>L</sub> an beiden Schaltungen. Verglichen wird der Laststrom I<sub>L</sub>.</figcaption></figure>

Vorgehen: $R_L$ an beide Schaltungen hängen und $I_L$ vergleichen. $U_0$ und $R_i$ stehen fest. Es wird nicht gleichgesetzt, sondern geprüft.

### Rechte Seite: Ersatzquelle

Eine Masche, alles in Serie:

$$I_L = \frac{U_0}{R_i + R_L}$$

### Linke Seite: Original

**Schritt 1: Struktur erkennen.** $R_3$ und $R_L$ liegen in Serie. Dieser Zweig liegt parallel zu $R_2$. $R_1$ liegt in Serie davor. Es ist dieselbe Struktur wie in Teil 2, mit $R_3 + R_L$ statt $R_3$.

**Schritt 2: Gesamtwiderstand.**

$$R_\text{ges} = R_1 + \frac{R_2 (R_3 + R_L)}{R_2 + R_3 + R_L} = \frac{R_1 R_2 + R_1 R_3 + R_1 R_L + R_2 R_3 + R_2 R_L}{R_2 + R_3 + R_L}$$

Abkürzung für den Zähler:

$$N = R_1 R_2 + R_1 R_3 + R_1 R_L + R_2 R_3 + R_2 R_L$$

**Schritt 3: Gesamtstrom.**

$$I_1 = \frac{U_q}{R_\text{ges}} = U_q \cdot \frac{R_2 + R_3 + R_L}{N}$$

**Schritt 4: Spannung über der Parallelschaltung.**

$$U_p = I_1 \cdot \frac{R_2 (R_3 + R_L)}{R_2 + R_3 + R_L} = U_q \cdot \frac{R_2 + R_3 + R_L}{N} \cdot \frac{R_2 (R_3 + R_L)}{R_2 + R_3 + R_L}$$

$(R_2 + R_3 + R_L)$ kürzt sich:

$$U_p = U_q \cdot \frac{R_2 (R_3 + R_L)}{N}$$

**Schritt 5: Laststrom.** $U_p$ liegt über dem Zweig $R_3 + R_L$, durch ihn fließt $I_L$.

$$I_L = \frac{U_p}{R_3 + R_L} = U_q \cdot \frac{R_2 (R_3 + R_L)}{N \cdot (R_3 + R_L)}$$

$(R_3 + R_L)$ kürzt sich:

$$I_L = U_q \cdot \frac{R_2}{N}$$

### Rechte Seite einsetzen und vergleichen

**Schritt 1: $U_0$ und $R_i$ einsetzen.** Aus Teil 1 und Teil 2:

$$U_0 = U_q \cdot \frac{R_2}{R_1 + R_2} \qquad R_i = \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_1 + R_2}$$

$$I_L = \frac{U_q \cdot \dfrac{R_2}{R_1 + R_2}}{\dfrac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_1 + R_2} + R_L}$$

**Schritt 2: Nenner auf einen Bruch.** $R_L$ auf den Nenner $R_1 + R_2$ bringen:

$$R_L = \frac{R_L (R_1 + R_2)}{R_1 + R_2} = \frac{R_1 R_L + R_2 R_L}{R_1 + R_2}$$

Addieren:

$$R_i + R_L = \frac{R_1 R_2 + R_1 R_3 + R_2 R_3 + R_1 R_L + R_2 R_L}{R_1 + R_2} = \frac{N}{R_1 + R_2}$$

**Schritt 3: Doppelbruch auflösen.** Durch einen Bruch teilen heißt mit dem Kehrwert multiplizieren:

$$I_L = U_q \cdot \frac{R_2}{R_1 + R_2} \cdot \frac{R_1 + R_2}{N}$$

**Schritt 4: Kürzen.** $(R_1 + R_2)$ fällt weg:

$$I_L = U_q \cdot \frac{R_2}{N}$$

::: merke Ergebnis Teil 3
Links und rechts ergibt sich derselbe Laststrom, für jedes $R_L$.

Stimmen Leerlaufspannung und Kurzschlussstrom überein, verhalten sich beide Netzwerke für jede Last gleich.
:::

## Teil 4: Innenwiderstand über null gesetzte Quellen

<figure class="dia"><svg viewBox="0 0 380 340" role="img" aria-label="Bild 6: Quellen null gesetzt. Oben das Original, die Spannungsquelle ist durch einen dicken Draht ersetzt, U_q gleich 0, von den Klemmen aus wird R_i gesucht. Unten die Ersatzspannungsquelle mit U_0 gleich 0, also nur R_i zwischen den Klemmen.">
<defs><marker id="a32-6-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a32-6-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text class="k" x="4" y="12">ORIGINAL</text>
<path class="s" d="M80 40V150" style="stroke-width:3"/>
<text x="70" y="92" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text><text x="70" y="108" text-anchor="end">= 0</text>
<path class="s" d="M80 40H120M164 40H226M270 40H296.5M80 150H296.5M190 40V73M190 117V150"/>
<rect class="b" x="120" y="32" width="44" height="16"/><rect class="b" x="182" y="73" width="16" height="44"/><rect class="b" x="226" y="32" width="44" height="16"/>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="190" cy="150" r="3"/>
<circle class="b" cx="300" cy="40" r="3.5"/><circle class="b" cx="300" cy="150" r="3.5"/>
<text class="c" x="142" y="24">R<tspan dy="3" font-size="9">1</tspan></text><text class="c" x="248" y="24">R<tspan dy="3" font-size="9">3</tspan></text><text x="206" y="99">R<tspan dy="3" font-size="9">2</tspan></text>
<path class="m" d="M370 95H312" marker-end="url(#a32-6-m)"/>
<text class="k c" x="341" y="87">R<tspan dy="3" font-size="8">i</tspan><tspan dy="-3"> = ?</tspan></text>
<path class="m" d="M190 166V194" marker-end="url(#a32-6-m)"/><text class="k" x="202" y="184">BEIDE QUELLEN NULL</text>
<text class="k" x="4" y="212">ERSATZSPANNUNGSQUELLE</text>
<path class="s" d="M80 240V320" style="stroke-width:3"/>
<text x="70" y="277" text-anchor="end">U<tspan dy="3" font-size="9">0</tspan></text><text x="70" y="293" text-anchor="end">= 0</text>
<path class="s" d="M80 240H170M214 240H296.5M80 320H296.5"/><rect class="b" x="170" y="232" width="44" height="16"/>
<circle class="b" cx="300" cy="240" r="3.5"/><circle class="b" cx="300" cy="320" r="3.5"/>
<text class="c" x="192" y="224">R<tspan dy="3" font-size="9">i</tspan></text>
<path class="m" d="M370 280H312" marker-end="url(#a32-6-m)"/>
<text class="k c" x="341" y="272">R<tspan dy="3" font-size="8">i</tspan></text>
</svg><figcaption>Bild 6: beide Quellen null gesetzt, also durch Drähte ersetzt. Die Klemmen bleiben offen, von dort schaut man hinein.</figcaption></figure>

**Schritt 1: Quelle null setzen.** Eine Spannungsquelle mit $U_q = 0$ wird durch einen Draht ersetzt. Die Klemmen bleiben offen.

**Schritt 2: Von den Klemmen hineinschauen.** Man stellt sich ein Ohmmeter an den Klemmen vor. Es schickt einen Prüfstrom von der oberen Klemme in die Schaltung. Dieser muss durch $R_3$ und teilt sich am Knoten auf $R_1$ und $R_2$.

**Schritt 3: Struktur erkennen.** Parallel heißt: Beide Enden hängen an denselben zwei Punkten. $R_2$ hängt zwischen Knoten und unterer Leitung. $R_1$ hängt über den Draht (ehemalige Quelle) ebenfalls zwischen Knoten und unterer Leitung. Also sind $R_1$ und $R_2$ parallel. $R_3$ liegt in Serie zu diesem Block.

::: info Kontrast zu Teil 1
In Teil 1 sitzt die Quelle innen und die Klemmen sind offen, deshalb bleibt $R_3$ stromlos. In Teil 4 kommt der Prüfstrom von den Klemmen selbst, deshalb wird $R_3$ durchflossen.
:::

**Schritt 4: Innenwiderstand.**

$$R_i = R_3 + \frac{R_1 R_2}{R_1 + R_2}$$

**Schritt 5: Vergleich mit Teil 2.** Auf einen Bruch bringen:

$$R_3 + \frac{R_1 R_2}{R_1 + R_2} = \frac{R_3 (R_1 + R_2)}{R_1 + R_2} + \frac{R_1 R_2}{R_1 + R_2} = \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_1 + R_2}$$

Derselbe Wert wie in Teil 2, auf völlig anderem Weg.

::: merke Erkenntnis
Der Innenwiderstand ist der Widerstand zwischen den Klemmen bei null gesetzten Quellen. Das ist derselbe Wert wie $U_0 / I_k$, aber ohne Stromberechnung. Jedes lineare Netzwerk lässt sich so durch $U_0$ und $R_i$ ersetzen (Satz von Thévenin).
:::

## Zusammenfassung

| Zustand | Was passiert |
|:---|:---|
| Leerlauf | $I_3 = 0$, $R_1$ und $R_2$ in Serie |
| Kurzschluss | $R_2 \parallel R_3$, Stromteiler |
| Last $R_L$ | $R_3 + R_L$ parallel zu $R_2$ |
| Quelle null | $R_1 \parallel R_2$, $R_3$ in Serie |

::: merke Ergebnisse
$$U_0 = U_q \cdot \frac{R_2}{R_1 + R_2}$$

$$R_i = \frac{U_0}{I_k} = \frac{R_1 R_2 + R_1 R_3 + R_2 R_3}{R_1 + R_2}$$

$$I_L = \frac{U_0}{R_i + R_L} \quad \text{links wie rechts}$$

$$R_i = R_3 + \frac{R_1 R_2}{R_1 + R_2}$$
:::
