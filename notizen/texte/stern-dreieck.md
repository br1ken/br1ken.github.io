---
titel: Stern-Dreieck-Umwandlung — so geht's
datum: 2026-10-23
fach: Grundlagen der E-Technik
art: theorie
tags: [Stern-Dreieck, Netzumformung, Ersatzwiderstand, How-to]
teaser: Beide Richtungen sauber hergeleitet, Dreieck → Stern im Leerlauf, Stern → Dreieck im Kurzschluss, und warum die zwei Formeln zusammengehören. Dazu ein Rezept und die typischen Fehler.
welle: dreieck
---

Manche Schaltungen lassen sich mit Reihe und parallel nicht vereinfachen. Typisch ist eine Brücke mit Querwiderstand. Dann hilft die Stern-Dreieck-Umwandlung: Drei Widerstände in einer Form werden durch drei in der anderen Form ersetzt, die sich von außen genau gleich verhalten.

Ein komplett durchgerechnetes Beispiel ist [A2.5 · Ersatzwiderstand einer Brücke](beitrag.html?b=ersatzwiderstand-dreieck-stern).

## Auf einen Blick

<figure class="dia"><svg viewBox="0 0 360 214" role="img" aria-label="Links ein Stern: R_1, R_2 und R_3 führen von den Knoten 1, 2 und 3 zum Sternpunkt S. Rechts ein Dreieck: R_12, R_23 und R_13 verbinden die Knoten direkt.">
<text class="k" x="8" y="12">STERN (Y)</text><text class="k" x="290" y="12">DREIECK (Δ)</text>
<path class="s" d="M90 28V112M90 112L22 180M90 112L158 180"/>
<rect class="b" x="82" y="50" width="16" height="40"/>
<rect class="b" x="36" y="138" width="40" height="16" transform="rotate(135 56 146)"/>
<rect class="b" x="104" y="138" width="40" height="16" transform="rotate(45 124 146)"/>
<circle class="f" cx="90" cy="112" r="3"/><text class="k" x="100" y="116">S</text>
<text class="k" x="104" y="74">R<tspan dy="3" font-size="8">2</tspan></text>
<text class="k" x="34" y="138" text-anchor="end">R<tspan dy="3" font-size="8">1</tspan></text>
<text class="k" x="146" y="138">R<tspan dy="3" font-size="8">3</tspan></text>
<path class="s" d="M270 28L202 180H338Z"/>
<rect class="b" x="216" y="96" width="40" height="16" transform="rotate(-65.9 236 104)"/>
<rect class="b" x="284" y="96" width="40" height="16" transform="rotate(65.9 304 104)"/>
<rect class="b" x="250" y="172" width="40" height="16"/>
<text class="k" x="214" y="100" text-anchor="end">R<tspan dy="3" font-size="8">12</tspan></text>
<text class="k" x="326" y="100">R<tspan dy="3" font-size="8">23</tspan></text>
<text class="k c" x="270" y="204">R<tspan dy="3" font-size="8">13</tspan></text>
<circle class="b" cx="90" cy="28" r="4"/><circle class="b" cx="22" cy="180" r="4"/><circle class="b" cx="158" cy="180" r="4"/>
<circle class="b" cx="270" cy="28" r="4"/><circle class="b" cx="202" cy="180" r="4"/><circle class="b" cx="338" cy="180" r="4"/>
<text class="c" x="72" y="32">2</text><text class="c" x="22" y="202">1</text><text class="c" x="158" y="202">3</text>
<text class="c" x="252" y="32">2</text><text class="c" x="202" y="202">1</text><text class="c" x="338" y="202">3</text>
<text class="c" x="180" y="116">⇔</text>
</svg><figcaption>Gleiche drei Klemmen, andere Innereien. Im Stern führt jeder Widerstand von einer Klemme zum Sternpunkt S, im Dreieck liegt jeder zwischen zwei Klemmen.</figcaption></figure>

::: merke Die Formeln
**Dreieck → Stern:** Produkt der zwei **anliegenden** Dreieckswiderstände durch die Summe aller drei.

$$R_1 = \frac{R_{12}\,R_{13}}{R_{12} + R_{13} + R_{23}}$$

**Stern → Dreieck:** Produkt der zwei **beteiligten** Sternleitwerte durch die Summe aller drei.

$$G_{12} = \frac{G_1\,G_2}{G_1 + G_2 + G_3}$$

In Widerständen geschrieben, mit dem **gegenüberliegenden** Sternwiderstand im Nenner:

$$\begin{aligned} R_{12} &= \frac{R_1R_2 + R_2R_3 + R_3R_1}{R_3} \\ &= R_1 + R_2 + \frac{R_1R_2}{R_3} \end{aligned}$$

**Drei gleiche Widerstände:** $R_Y = R_\Delta / 3$ und $R_\Delta = 3R_Y$.

Die übrigen Formeln entstehen durch Umbenennen $1 \to 2 \to 3 \to 1$.
:::

## Wann braucht man das?

Erst wenn das Einfache nicht reicht:

- **Reihe** heißt: derselbe Strom, kein Abzweig dazwischen.
- **Parallel** heißt: dieselben zwei Knoten an beiden Enden.
- **Brücke abgeglichen?** Teilen beide Zweige einer Brücke im selben Verhältnis, liegen die zwei Mittelknoten auf demselben Potential. Dann fließt durch den Querwiderstand kein Strom, und man darf ihn einfach weglassen (siehe [Brückenschaltung](beitrag.html?b=brueckenschaltung)).

Passt nichts davon, wandelt man ein Dreieck oder einen Stern um, sodass der Rest in Reihe und parallel zerfällt.

## Die Idee: von außen gleich

Die restliche Schaltung sieht vom Stern oder vom Dreieck nur die drei Klemmen 1, 2 und 3. Beide Formen sind also austauschbar, wenn man an den Klemmen keinen Unterschied messen kann. Drei Klemmen ergeben drei Paare, also drei Gleichungen für drei Unbekannte. Das passt genau.

Messen kann man auf zwei Arten, und jede Richtung hat ihre passende:

- **Leerlauf:** zwischen zwei Klemmen messen, die dritte bleibt offen. Man bekommt einen Widerstand. Das passt zu **Dreieck → Stern**.
- **Kurzschluss:** eine Klemme gegen die beiden anderen messen, die miteinander verbunden sind. Man bekommt einen Leitwert. Das passt zu **Stern → Dreieck**.

Der Grund für diese Zuordnung: Man misst immer so, dass die Seite mit den **Unbekannten** möglichst einfach wird. Im Leerlauf wird der Stern zu einer Reihe aus zwei Widerständen. Im Kurzschluss wird das Dreieck zu einer Parallelschaltung aus zwei Leitwerten. In beiden Fällen stehen die Unbekannten dann einfach als Summe da.

::: achtung Gedankenexperiment
Für diese Messungen nimmt man Stern und Dreieck **gedanklich aus der Schaltung heraus**. „Klemme offen“ oder „kurzgeschlossen“ heißt nicht, dass das in der echten Schaltung so ist. Weil die Äquivalenz danach für jede Beschaltung gilt, darf man die neue Form anschließend wieder einsetzen.
:::

::: herleitung Reichen drei Messungen wirklich?
Ein Netz aus Widerständen ohne Quellen mit drei Klemmen ist von außen gesehen durch drei Zahlen vollständig beschrieben. Legt man Klemme 3 als Bezug fest, hängen die Ströme in die Klemmen 1 und 2 über eine symmetrische $2 \times 2$-[[Leitwert|leitwert]]matrix von den Potentialen ab. Die hat genau drei unabhängige Einträge.

Beide Messarten legen diese drei Zahlen eindeutig fest. Im Leerlauf liefern die Messungen 1–3 und 2–3 die Diagonaleinträge der Widerstandsmatrix, und aus 1–2 folgt der gemischte Eintrag. Im Kurzschluss liefern „1 gegen 2 und 3“ und „2 gegen 1 und 3“ die Diagonaleinträge der Leitwertmatrix, und aus „3 gegen 1 und 2“ folgt der gemischte. Stimmen alle drei Messungen überein, verhalten sich Stern und Dreieck in **jeder** Beschaltung gleich.
:::

## Herleitung 1: Dreieck → Stern

Gegeben ist das Dreieck mit $R_{12}$, $R_{13}$, $R_{23}$. Gesucht sind die Sternwiderstände $R_1$, $R_2$, $R_3$. Gemessen wird im **Leerlauf**.

### Messung 1–2, Klemme 3 offen

<figure class="dia"><svg viewBox="0 0 360 220" role="img" aria-label="Messung zwischen 1 und 2 bei offener Klemme 3. Im Stern tragen nur R_1 und R_2 Strom, R_3 ist stromlos. Im Dreieck liegt R_12 parallel zum Umweg über R_13 und R_23.">
<text class="k" x="8" y="12">STERN</text><text class="k" x="306" y="12">DREIECK</text>
<path class="s" d="M90 28V112M90 112L22 180"/><path class="m d" d="M90 112L158 180"/>
<rect class="a" x="82" y="50" width="16" height="40"/>
<rect class="a" x="36" y="138" width="40" height="16" transform="rotate(135 56 146)"/>
<rect class="b" x="104" y="138" width="40" height="16" transform="rotate(45 124 146)"/>
<circle class="f" cx="90" cy="112" r="3"/>
<text class="k" x="104" y="74">R<tspan dy="3" font-size="8">2</tspan></text>
<text class="k" x="34" y="138" text-anchor="end">R<tspan dy="3" font-size="8">1</tspan></text>
<text class="k" x="146" y="138">R<tspan dy="3" font-size="8">3</tspan> STROMLOS</text>
<path class="s" d="M270 28L202 180H338Z"/>
<rect class="a" x="216" y="96" width="40" height="16" transform="rotate(-65.9 236 104)"/>
<rect class="b" x="284" y="96" width="40" height="16" transform="rotate(65.9 304 104)"/>
<rect class="b" x="250" y="172" width="40" height="16"/>
<text class="k" x="214" y="100" text-anchor="end">DIREKT</text>
<text class="k c" x="270" y="204">UMWEG ÜBER 3</text>
<circle class="b" cx="90" cy="28" r="4"/><circle class="b" cx="22" cy="180" r="4"/><circle class="b" cx="158" cy="180" r="4"/>
<circle class="b" cx="270" cy="28" r="4"/><circle class="b" cx="202" cy="180" r="4"/><circle class="b" cx="338" cy="180" r="4"/>
<text class="c" x="72" y="32">2</text><text class="c" x="22" y="202">1</text><text class="c" x="158" y="202">3</text><text class="k c" x="158" y="215">OFFEN</text>
<text class="c" x="252" y="32">2</text><text class="c" x="202" y="202">1</text><text class="c" x="338" y="202">3</text>
</svg><figcaption>Leerlauf: gemessen wird zwischen 1 und 2, Klemme 3 bleibt offen. Hervorgehoben sind die Widerstände, die Strom tragen.</figcaption></figure>

**Stern:** An Klemme 3 hängt nichts, also fließt durch $R_3$ kein Strom. Übrig bleibt ein einziger Weg von 1 über S nach 2: $R_1$ und $R_2$ in Reihe.

$$R_1 + R_2$$

**Dreieck:** Von 1 nach 2 gibt es zwei Wege. Der direkte führt über $R_{12}$, der Umweg über Klemme 3 durch $R_{13}$ und $R_{23}$ in Reihe. Beide Wege liegen parallel:

$$R_{12} \parallel (R_{13} + R_{23}) = \frac{R_{12}\,(R_{13} + R_{23})}{R_{12} + R_{13} + R_{23}}$$

Im Nenner steht die Summe aller drei Dreieckswiderstände:

$$S_\Delta = R_{12} + R_{13} + R_{23}$$

Gleichsetzen ergibt die erste Gleichung:

$$\text{(I)} \quad R_1 + R_2 = \frac{R_{12}\,(R_{13} + R_{23})}{S_\Delta}$$

### Die anderen zwei Gleichungen durch Umbenennen

Die Rechnung hängt nicht davon ab, wie die Klemmen heißen. Vertauscht man in (I) zwei Namen, entsteht die Gleichung für ein anderes Paar. $S_\Delta$ enthält alle drei Widerstände und bleibt gleich.

**Vertauschung 2 ↔ 3:** Aus der Messung 1–2 wird die Messung 1–3.

$$\text{(II)} \quad R_1 + R_3 = \frac{R_{13}\,(R_{12} + R_{23})}{S_\Delta}$$

**Vertauschung 1 ↔ 3:** Aus der Messung 1–2 wird die Messung 3–2.

$$\text{(III)} \quad R_2 + R_3 = \frac{R_{23}\,(R_{12} + R_{13})}{S_\Delta}$$

::: tipp Indizes
$R_{23}$ und $R_{32}$ sind derselbe Widerstand. Beim Umbenennen entsteht manchmal $R_{32}$ oder $R_{31}$. Man schreibt die Indizes einfach wieder sortiert hin.

Hintergrund für Interessierte: Die sechs möglichen Vertauschungen bilden die Gruppe $S_3$. Sie ist gleich ($S_3 \cong D_3$) den Symmetrien eines gleichseitigen Dreiecks. Stern und Dreieck sehen als Schaltungsform nach jeder Vertauschung gleich aus, deshalb gilt jede Gleichung auch mit vertauschten Namen.
:::

### Auflösen nach $R_1$

Gesucht ist eine Kombination, in der $R_2$ und $R_3$ verschwinden: (I) − (III) + (II).

**Linke Seite:**

$$R_1 + R_2 - R_2 - R_3 + R_1 + R_3 = 2R_1$$

**Rechte Seite:** Alle Brüche haben den Nenner $S_\Delta$, es reicht also, die Zähler auszumultiplizieren:

| aus | Zähler ausmultipliziert |
|:---|:---|
| $+$(I) | $+R_{12}R_{13} + R_{12}R_{23}$ |
| $-$(III) | $-R_{23}R_{12} - R_{23}R_{13}$ |
| $+$(II) | $+R_{13}R_{12} + R_{13}R_{23}$ |

- $R_{12}R_{23}$ hebt sich mit $-R_{23}R_{12}$ auf.
- $-R_{23}R_{13}$ hebt sich mit $R_{13}R_{23}$ auf.
- Übrig bleibt zweimal $R_{12}R_{13}$.

$$2R_1 = \frac{2\,R_{12}R_{13}}{S_\Delta} \quad\Rightarrow\quad R_1 = \frac{R_{12}\,R_{13}}{S_\Delta}$$

$R_2$ und $R_3$ folgen durch Umbenennen:

$$\boxed{\begin{aligned} R_1 &= \frac{R_{12}\,R_{13}}{S_\Delta} \\ R_2 &= \frac{R_{12}\,R_{23}}{S_\Delta} \\ R_3 &= \frac{R_{13}\,R_{23}}{S_\Delta} \end{aligned}}$$

Probe der Einheit: $\frac{\Omega \cdot \Omega}{\Omega} = \Omega$ ✓

::: info Anders gelesen
Mit den drei Leerlauf-Messwerten $M_{12}$, $M_{13}$, $M_{23}$ heißt (I) − (III) + (II) einfach:

$$R_1 = \tfrac{1}{2}\,(M_{12} + M_{13} - M_{23})$$

Ein Sternwiderstand ist also klein, wenn der Weg zwischen den anderen beiden Klemmen fast vollständig über seine eigene Klemme führt.
:::

## Herleitung 2: Stern → Dreieck

Jetzt umgekehrt: Gegeben ist der Stern mit $R_1$, $R_2$, $R_3$. Gesucht ist das Dreieck. Diese Herleitung baut **nicht** auf der ersten auf, sondern beginnt von vorn. Gemessen wird im **Kurzschluss**, und gerechnet wird in [[Leitwerten|leitwert]] $G = 1/R$, weil dann das Dreieck zur einfachen Seite wird.

Zwei Regeln für Leitwerte braucht man dafür:

- **Parallel** addieren sich Leitwerte: $G = G_a + G_b$.
- **In Reihe** gilt „Produkt durch Summe“: $G = \frac{G_a\,G_b}{G_a + G_b}$. Das ist dieselbe Form wie bei parallelen Widerständen.

### Messung: Klemme 2 gegen die kurzgeschlossenen Klemmen 1 und 3

<figure class="dia"><svg viewBox="0 0 360 222" role="img" aria-label="Kurzschlussmessung: Klemmen 1 und 3 sind verbunden, gemessen wird zwischen 2 und diesem Knoten. Im Stern tragen alle drei Widerstände Strom. Im Dreieck ist R_13 kurzgeschlossen und stromlos, R_12 und R_23 liegen parallel.">
<text class="k" x="8" y="12">STERN</text><text class="k" x="306" y="12">DREIECK</text>
<path class="s" d="M90 28V112M90 112L22 180M90 112L158 180"/>
<path class="s" d="M22 184V198H158V184"/>
<rect class="a" x="82" y="50" width="16" height="40"/>
<rect class="a" x="36" y="138" width="40" height="16" transform="rotate(135 56 146)"/>
<rect class="a" x="104" y="138" width="40" height="16" transform="rotate(45 124 146)"/>
<circle class="f" cx="90" cy="112" r="3"/>
<text class="k" x="104" y="74">R<tspan dy="3" font-size="8">2</tspan></text>
<text class="k" x="34" y="138" text-anchor="end">R<tspan dy="3" font-size="8">1</tspan></text>
<text class="k" x="146" y="138">R<tspan dy="3" font-size="8">3</tspan></text>
<path class="s" d="M202 180L270 28L338 180"/><path class="m d" d="M202 180H338"/>
<path class="s" d="M202 184V198H338V184"/>
<rect class="a" x="216" y="96" width="40" height="16" transform="rotate(-65.9 236 104)"/>
<rect class="a" x="284" y="96" width="40" height="16" transform="rotate(65.9 304 104)"/>
<rect class="b" x="250" y="172" width="40" height="16"/>
<text class="k" x="214" y="100" text-anchor="end">R<tspan dy="3" font-size="8">12</tspan></text>
<text class="k" x="326" y="100">R<tspan dy="3" font-size="8">23</tspan></text>
<text class="k c" x="270" y="164">R<tspan dy="3" font-size="8">13</tspan> STROMLOS</text>
<circle class="b" cx="90" cy="28" r="4"/><circle class="b" cx="22" cy="180" r="4"/><circle class="b" cx="158" cy="180" r="4"/>
<circle class="b" cx="270" cy="28" r="4"/><circle class="b" cx="202" cy="180" r="4"/><circle class="b" cx="338" cy="180" r="4"/>
<text class="c" x="72" y="32">2</text><text class="c" x="10" y="176">1</text><text class="c" x="170" y="176">3</text>
<text class="c" x="252" y="32">2</text><text class="c" x="190" y="176">1</text><text class="c" x="350" y="176">3</text>
<text class="k c" x="90" y="214">KURZSCHLUSS</text><text class="k c" x="270" y="214">KURZSCHLUSS</text>
</svg><figcaption>Kurzschluss: Klemmen 1 und 3 sind verbunden, gemessen wird zwischen 2 und diesem Knoten. Hervorgehoben sind die Widerstände, die Strom tragen.</figcaption></figure>

**Stern:** Weil 1 und 3 verbunden sind, liegen $R_1$ und $R_3$ parallel zwischen S und dem Kurzschlussknoten, in Leitwerten also $G_1 + G_3$. Davor liegt $R_2$ in Reihe:

$$\frac{G_2\,(G_1 + G_3)}{G_1 + G_2 + G_3}$$

**Dreieck:** $R_{13}$ hat jetzt beide Enden am selben Knoten und trägt keinen Strom. $R_{12}$ und $R_{23}$ führen beide von 2 zum Kurzschlussknoten, liegen also parallel:

$$G_{12} + G_{23}$$

Im Nenner oben steht die Summe aller drei Sternleitwerte:

$$S_Y = G_1 + G_2 + G_3$$

Gleichsetzen ergibt:

$$\text{(IV)} \quad G_{12} + G_{23} = \frac{G_2\,(G_1 + G_3)}{S_Y}$$

### Die anderen zwei Gleichungen durch Umbenennen

**Vertauschung 1 ↔ 2:** Jetzt wird Klemme 1 gegen die kurzgeschlossenen 2 und 3 gemessen.

$$\text{(V)} \quad G_{12} + G_{13} = \frac{G_1\,(G_2 + G_3)}{S_Y}$$

**Vertauschung 2 ↔ 3:** Jetzt wird Klemme 3 gegen die kurzgeschlossenen 1 und 2 gemessen.

$$\text{(VI)} \quad G_{13} + G_{23} = \frac{G_3\,(G_1 + G_2)}{S_Y}$$

### Auflösen nach $G_{12}$

Diesmal sollen $G_{13}$ und $G_{23}$ verschwinden: (IV) + (V) − (VI).

**Linke Seite:**

$$G_{12} + G_{23} + G_{12} + G_{13} - G_{13} - G_{23} = 2G_{12}$$

**Rechte Seite**, wieder nur die Zähler über dem gemeinsamen Nenner $S_Y$:

| aus | Zähler ausmultipliziert |
|:---|:---|
| $+$(IV) | $+G_2G_1 + G_2G_3$ |
| $+$(V) | $+G_1G_2 + G_1G_3$ |
| $-$(VI) | $-G_3G_1 - G_3G_2$ |

- $G_2G_3$ hebt sich mit $-G_3G_2$ auf.
- $G_1G_3$ hebt sich mit $-G_3G_1$ auf.
- Übrig bleibt zweimal $G_1G_2$.

$$2G_{12} = \frac{2\,G_1G_2}{S_Y} \quad\Rightarrow\quad G_{12} = \frac{G_1\,G_2}{S_Y}$$

Die anderen beiden folgen durch Umbenennen:

$$\boxed{\begin{aligned} G_{12} &= \frac{G_1\,G_2}{S_Y} \\ G_{13} &= \frac{G_1\,G_3}{S_Y} \\ G_{23} &= \frac{G_2\,G_3}{S_Y} \end{aligned}}$$

### Zurück in Widerstände

In Prüfungen sind meist Widerstände gegeben. Mit $G = 1/R$:

$$\begin{aligned} R_{12} = \frac{1}{G_{12}} &= \frac{G_1 + G_2 + G_3}{G_1\,G_2} \\ &= \left(\frac{1}{R_1} + \frac{1}{R_2} + \frac{1}{R_3}\right) R_1 R_2 \\ &= R_2 + R_1 + \frac{R_1R_2}{R_3} \end{aligned}$$

Auf den gemeinsamen Nenner $R_3$ gebracht:

$$\boxed{R_{12} = \frac{R_1R_2 + R_2R_3 + R_3R_1}{R_3}}$$

$R_{13}$ und $R_{23}$ folgen durch Umbenennen. Im Nenner steht immer der Sternwiderstand an der Klemme, die **nicht** dazugehört.

::: info Anders gelesen
Mit den drei Kurzschluss-Messwerten $K_1$, $K_2$, $K_3$ (jeweils Klemme $i$ gegen die beiden anderen) heißt (IV) + (V) − (VI) einfach:

$$G_{12} = \tfrac{1}{2}\,(K_1 + K_2 - K_3)$$

Das ist das genaue Spiegelbild zu $R_1 = \frac{1}{2}(M_{12} + M_{13} - M_{23})$ aus Herleitung 1.
:::

## Was beide Herleitungen verbindet

### Sie sind Spiegelbilder

Legt man die zwei Herleitungen nebeneinander, entspricht jeder Schritt der einen genau einem Schritt der anderen:

| Herleitung 1: Δ → Y | Herleitung 2: Y → Δ |
|:---|:---|
| Klemme offen | Klemmen kurzgeschlossen |
| Widerstände $R$ | Leitwerte $G$ |
| Stern wird zur Reihe | Dreieck wird zur Parallelschaltung |
| $R_1 + R_2$ | $G_{12} + G_{23}$ |
| $S_\Delta = R_{12} + R_{13} + R_{23}$ | $S_Y = G_1 + G_2 + G_3$ |
| $R_1 = \frac{R_{12}\,R_{13}}{S_\Delta}$ | $G_{12} = \frac{G_1\,G_2}{S_Y}$ |

Das ist kein Zufall. In der Netzwerktheorie heißt dieser Tausch **Dualität**: Leerlauf und Kurzschluss, Widerstand und Leitwert, Reihe und parallel, Spannung und Strom tauschen die Rollen. Wer eine Herleitung verstanden hat, bekommt die andere durch konsequentes Übersetzen. Deshalb haben beide Ergebnisse dieselbe Form, „Produkt durch Summe“, einmal in Widerständen und einmal in Leitwerten.

### Der gemeinsame Kern: den Sternpunkt herausrechnen

Es gibt noch einen dritten Weg zur Formel Stern → Dreieck, ganz ohne Messtrick. Er zeigt, was bei der Umwandlung eigentlich passiert.

An den Klemmen liegen beliebige Potentiale $\varphi_1$, $\varphi_2$, $\varphi_3$, am Sternpunkt $\varphi_S$. In jede Klemme fließt ein Strom, der durch ihren Sternwiderstand zum Sternpunkt läuft:

$$I_i = G_i\,(\varphi_i - \varphi_S)$$

Am Sternpunkt hängt sonst nichts. Nach der [[Knotenregel]] ist die Summe der drei Ströme also null:

$$\begin{aligned} &G_1(\varphi_1 - \varphi_S) + G_2(\varphi_2 - \varphi_S) \\ &\quad + G_3(\varphi_3 - \varphi_S) = 0 \end{aligned}$$

Nach $\varphi_S$ aufgelöst:

$$\varphi_S = \frac{G_1\varphi_1 + G_2\varphi_2 + G_3\varphi_3}{S_Y}$$

Das Potential des Sternpunkts ist ein **gewichteter Mittelwert** der Klemmenpotentiale. Je größer der Leitwert eines Arms, desto stärker zieht seine Klemme den Sternpunkt zu sich.

Für den Strom an Klemme 1 braucht man $\varphi_1 - \varphi_S$. Dazu schreibt man $\varphi_1$ mit demselben Nenner, also als $\frac{(G_1 + G_2 + G_3)\,\varphi_1}{S_Y}$. Der Anteil mit $G_1$ hebt sich dann weg:

$$\begin{aligned} \varphi_1 - \varphi_S &= \frac{G_2\varphi_1 + G_3\varphi_1 - G_2\varphi_2 - G_3\varphi_3}{S_Y} \\ &= \frac{G_2(\varphi_1 - \varphi_2) + G_3(\varphi_1 - \varphi_3)}{S_Y} \end{aligned}$$

Mal $G_1$ ergibt den Strom:

$$\begin{aligned} I_1 &= \frac{G_1G_2}{S_Y}\,(\varphi_1 - \varphi_2) \\ &\quad + \frac{G_1G_3}{S_Y}\,(\varphi_1 - \varphi_3) \end{aligned}$$

Im Dreieck teilt sich der Strom an Klemme 1 direkt auf $R_{12}$ und $R_{13}$ auf:

$$I_1 = G_{12}\,(\varphi_1 - \varphi_2) + G_{13}\,(\varphi_1 - \varphi_3)$$

Beide Ausdrücke müssen für **alle** Potentiale gleich sein. Also müssen die Faktoren vor den Spannungen gleich sein, und das ergibt wieder $G_{12} = \frac{G_1G_2}{S_Y}$ und $G_{13} = \frac{G_1G_3}{S_Y}$.

::: merke
Stern → Dreieck heißt: den inneren Knoten S **herausrechnen**. Dreieck → Stern heißt: einen inneren Knoten S **hinzufügen**, der von außen unsichtbar bleibt.
:::

### Warum die Formeln genau zueinander passen

Beide Formeln sind unabhängig voneinander entstanden. Trotzdem ist die eine die Umkehrung der anderen, und das lässt sich begründen, ohne irgendetwas einzusetzen:

1. Das Klemmenverhalten legt den **Stern eindeutig** fest, denn $R_1 = \frac{1}{2}(M_{12} + M_{13} - M_{23})$ lässt keine Wahl.
2. Es legt auch das **Dreieck eindeutig** fest, denn $G_{12} = \frac{1}{2}(K_1 + K_2 - K_3)$ lässt ebenfalls keine Wahl.
3. Wandelt man ein Dreieck in einen Stern um, hat der Stern dasselbe Klemmenverhalten (Herleitung 1). Wandelt man diesen Stern zurück, hat das neue Dreieck wieder dasselbe Klemmenverhalten (Herleitung 2). Nach Punkt 2 gibt es zu diesem Verhalten nur ein einziges Dreieck, also ist es das ursprüngliche.

Hin und zurück landet man also immer wieder am Anfang. Mit Zahlen ausprobieren kann man das in der Übung „Hin und zurück“ weiter unten.

### Warum es nur bei drei Klemmen in beide Richtungen geht

Die Rechnung „Sternpunkt herausrechnen“ funktioniert genauso für einen Stern mit $n$ Armen. Heraus kommt ein vollständiges Vieleck mit

$$G_{ij} = \frac{G_i\,G_j}{G_1 + G_2 + \dots + G_n}$$

Ein Stern lässt sich also **immer** in ein Vieleck umwandeln. Umgekehrt muss man Widerstände abzählen: Der Stern hat $n$ Stück, das Vieleck $\frac{n(n-1)}{2}$. Für $n = 3$ sind es beide Male drei, deshalb geht es in beide Richtungen. Ab $n = 4$ (vier gegen sechs) hat das Vieleck mehr Freiheiten, als ein Stern abbilden kann. Ein beliebiges Vieleck lässt sich dann im Allgemeinen nicht mehr in einen Stern verwandeln.

## So gehst du vor

1. **Knoten benennen.** Jeden Verbindungspunkt, dann jeden Widerstand nach seinen zwei Knoten. Ohne Namen keine sauberen Formeln.
2. **Erst das Einfache prüfen.** Reihe? Parallel? Bei einer Brücke den Abgleich testen.
3. **Dreieck oder Stern wählen,** nach dessen Umwandlung der Rest in Reihe und parallel zerfällt. Ein Sternpunkt darf nur genau seine drei Widerstände haben, sonst nichts.
4. **Umwandeln.** Dreieck → Stern: die zwei anliegenden Widerstände in den Zähler. Stern → Dreieck: Summe der Paarprodukte durch den gegenüberliegenden.
5. **Probe in 30 Sekunden** mit einer Leerlauf-Messung: $R_1 + R_2 = R_{12} \parallel (R_{13} + R_{23})$.
6. **Neu zeichnen.** Die drei Eckknoten bleiben. Bei Dreieck → Stern kommt der Sternpunkt dazu, bei Stern → Dreieck verschwindet er. Alles andere unverändert übernehmen.
7. **Zusammenfassen,** ohne zwischendurch zu runden.
8. **Plausibilität prüfen:** Liegt das Ergebnis zwischen „Querwiderstand kurzgeschlossen“ und „Querwiderstand offen“?

## Was die Umwandlung verrät und was nicht

### Von außen gleich, innen anders

Äquivalent heißt nur: **an den drei Klemmen** verhalten sich Stern und Dreieck gleich, also gleiche Potentiale und gleiche Ströme in die Klemmen. Deshalb bleibt alles außerhalb exakt gleich, und auch die gesamte [[Leistung]] im Stern ist dieselbe wie im Dreieck.

Was innen passiert, ist verschieden. Die Ströme und Leistungen der einzelnen Widerstände haben nichts miteinander zu tun. In A2.5 setzen Dreieck und Stern zusammen jeweils $77{,}20\,\mathrm{W}$ um (bei $1\,\mathrm{A}$). Im Dreieck verheizt $R_{AC}$ allein aber $45{,}34\,\mathrm{W}$, im Stern $R_A$ nur $16{,}67\,\mathrm{W}$.

::: achtung
Ströme, Spannungen und Leistungen **einzelner** Widerstände nach der Umwandlung sagen nichts über die Originalschaltung. Einen Sternpunkt, den man selbst eingeführt hat, gibt es in Wirklichkeit nicht.
:::

### Zurück zur Originalschaltung

Fragt eine Aufgabe nach dem Strom durch einen umgewandelten Widerstand, hilft die Ersatzschaltung trotzdem. Die Eckknoten gibt es in ihr noch, und ihre Potentiale stimmen. Man rechnet die Potentiale in der Ersatzschaltung aus und geht dann zurück ins Original:

$$I_{12} = \frac{\varphi_1 - \varphi_2}{R_{12}}$$

Wie das mit Zahlen aussieht, zeigt die Zusatzfrage in [A2.5](beitrag.html?b=ersatzwiderstand-dreieck-stern).

### Plausibel? Grenzfälle

Vergrößert man in einem Widerstandsnetz einen einzelnen Widerstand, kann der Ersatzwiderstand zwischen zwei Klemmen nicht kleiner werden (Monotonie, nach Rayleigh). Deshalb liegt das Ergebnis einer Brücke immer zwischen zwei leicht rechenbaren Fällen: Querwiderstand kurzgeschlossen und Querwiderstand offen. In beiden Fällen braucht man keine Umwandlung.

### Wie groß werden die Sternwiderstände?

Jeder Sternwiderstand ist kleiner als die Parallelschaltung der zwei Dreieckswiderstände an seiner Klemme. Der dritte Widerstand macht den Nenner nur größer:

$$\begin{aligned} R_1 &= \frac{R_{12}\,R_{13}}{R_{12} + R_{13} + R_{23}} \\ &< \frac{R_{12}\,R_{13}}{R_{12} + R_{13}} = R_{12} \parallel R_{13} \end{aligned}$$

::: achtung Häufiger Irrtum
„Sternwiderstände sind immer kleiner als **alle** Dreieckswiderstände“ ist falsch. In A2.5 ist $R_C = 166{,}67\,\Omega$ größer als $R_{AD} = 100\,\Omega$. Die Schranke gilt nur für die zwei Widerstände an der eigenen Klemme.
:::

Umgekehrt ist jeder Dreieckswiderstand größer als die zwei zugehörigen Sternwiderstände in Reihe, denn $R_{12} = R_1 + R_2 + \frac{R_1R_2}{R_3} > R_1 + R_2$.

## Typische Fehler

::: achtung
- **Falscher Zähler:** Bei Dreieck → Stern gehören die zwei **anliegenden** Widerstände in den Zähler, nicht der gegenüberliegende. Bei Stern → Dreieck in Widerständen steht der gegenüberliegende im **Nenner**.
- **Summe unvollständig:** Im Nenner stehen immer alle drei, $S_\Delta$ bzw. $S_Y$.
- **R und G vermischt:** Die Formel $G_{12} = \frac{G_1 G_2}{S_Y}$ gilt nur in Leitwerten. Mit Widerständen eingesetzt ist sie falsch.
- **Zu viel umgewandelt:** Nur die drei Widerstände des Dreiecks (oder Sterns) werden ersetzt. Alles andere bleibt, wie es ist.
- **Nicht neu gezeichnet:** Ohne neue Skizze erkennt man Reihe und parallel in der Ersatzschaltung leicht falsch.
- **Innere Größen übernommen:** Der Strom in $R_1$ ist nicht der Strom in $R_{12}$.
- **Zu früh gerundet:** In A2.5 ergibt $16{,}67 + 148{,}11$ schon $164{,}78\,\Omega$ statt $164{,}77\,\Omega$.
- **Mit dem Drehstrom verwechselt:** Dort heißen Stern- und Dreieckschaltung zwei Arten, **dieselben** drei Verbraucher anzuschließen. Das ist keine äquivalente Umwandlung. Gleiche Widerstände nehmen im Dreieck dreimal so viel Leistung auf wie im Stern.
:::

## Gut zu wissen

- **Herkunft:** Arthur E. Kennelly hat die Umwandlung 1899 veröffentlicht. Deshalb heißt sie manchmal Kennelly-Theorem.
- **T und π:** Zeichnet man den Stern als T und das Dreieck als π, ist es dieselbe Umwandlung. Sie taucht bei Vierpolen und Filtern wieder auf.
- **Wechselstrom:** Beide Herleitungen benutzen nur Reihe, parallel und Algebra. Sie gelten deshalb unverändert für komplexe [[Impedanzen|impedanz]] $\underline{Z}$ und Admittanzen $\underline{Y}$.

## Üben

::: aufgabe Symmetrisches Dreieck
Drei Widerstände mit je $30\,\Omega$ bilden ein Dreieck. Wie groß sind die Sternwiderstände? Prüfe mit dem Widerstand zwischen zwei Klemmen.
???
$R_Y = 30\,\Omega / 3 = 10\,\Omega$.

Probe: Im Stern $10 + 10 = 20\,\Omega$. Im Dreieck liegt ein $30\text{-}\Omega$-Widerstand parallel zu zwei in Reihe: $30 \parallel 60\,\Omega = 20\,\Omega$ ✓
:::

::: aufgabe Hin und zurück
Ein Stern hat $R_1 = 10\,\Omega$, $R_2 = 20\,\Omega$ und $R_3 = 30\,\Omega$. Wandle ihn in ein Dreieck um und das Ergebnis wieder zurück in einen Stern.
???
Summe der Paarprodukte: $10 \cdot 20 + 20 \cdot 30 + 30 \cdot 10 = 1100\,\Omega^2$. Geteilt durch den gegenüberliegenden Sternwiderstand:

$$\begin{aligned} R_{12} &= \frac{1100}{30}\,\Omega \approx 36{,}67\,\Omega \\ R_{13} &= \frac{1100}{20}\,\Omega = 55\,\Omega \\ R_{23} &= \frac{1100}{10}\,\Omega = 110\,\Omega \end{aligned}$$

Zurück: $S_\Delta = 201{,}67\,\Omega$, und zum Beispiel

$$R_1 = \frac{R_{12}\,R_{13}}{S_\Delta} = \frac{36{,}67 \cdot 55}{201{,}67}\,\Omega = 10\,\Omega \;\checkmark$$

Genauso kommen $R_2 = 20\,\Omega$ und $R_3 = 30\,\Omega$ wieder heraus.
:::

::: aufgabe Gleiches Ergebnis, andere Rechnung
Rechne $R_{12}$ aus der vorigen Aufgabe einmal in Leitwerten. Kommt dasselbe heraus?
???
$G_1 = 0{,}1\,\mathrm{S}$, $G_2 = 0{,}05\,\mathrm{S}$, $G_3 = 0{,}0\overline{3}\,\mathrm{S}$, also $S_Y = 0{,}18\overline{3}\,\mathrm{S}$.

$$\begin{aligned} G_{12} &= \frac{0{,}1 \cdot 0{,}05}{0{,}18\overline{3}}\,\mathrm{S} \approx 0{,}02727\,\mathrm{S} \\ R_{12} &= \frac{1}{G_{12}} \approx 36{,}67\,\Omega \;\checkmark \end{aligned}$$
:::

::: aufgabe Grenzfälle der Formel
Was passiert mit $R_1$, $R_2$ und $R_3$, wenn $R_{23} \to \infty$ geht? Und wenn $R_{23} \to 0$ geht? Deute beide Fälle an der Schaltung.
???
**$R_{23} \to \infty$:** $S_\Delta$ wächst mit, also $R_1 \to 0$, $R_2 \to R_{12}$, $R_3 \to R_{13}$. Ohne $R_{23}$ bleiben vom Dreieck nur $R_{12}$ und $R_{13}$, die sich in Klemme 1 treffen. Das ist schon ein Stern mit Sternpunkt 1.

**$R_{23} \to 0$:** $S_\Delta \to R_{12} + R_{13}$, also $R_1 \to R_{12} \parallel R_{13}$, $R_2 \to 0$, $R_3 \to 0$. Die Klemmen 2 und 3 sind kurzgeschlossen, und von 1 führen $R_{12}$ und $R_{13}$ parallel auf diesen einen Knoten.
:::

::: aufgabe Ein Widerspruch?
Bei Herleitung 1 ist Klemme 3 offen und $R_3$ stromlos. In einer fertigen Ersatzschaltung fließt durch $R_3$ aber Strom. Wie passt das zusammen?
???
Die Messungen mit offener Klemme sind nur ein Gedankenexperiment mit herausgelöstem Stern und Dreieck. Sie liefern die drei Gleichungen. Weil drei Zahlen das Verhalten an den Klemmen vollständig festlegen, verhalten sich beide danach in **jeder** Beschaltung gleich, auch wenn an Klemme 3 etwas angeschlossen ist.
:::

::: aufgabe Kleiner Sternwiderstand
Warum wird $R_1$ klein, wenn der gegenüberliegende Widerstand $R_{23}$ groß ist?
???
Es gilt genau

$$R_1 = (R_{12} \parallel R_{13}) \cdot \frac{R_{12} + R_{13}}{S_\Delta}$$

Ein großes $R_{23}$ macht $S_\Delta$ groß und damit den Faktor klein.

Anschaulich: Zwischen den Klemmen 2 und 3 fließt der Strom dann fast nur über Klemme 1, also über $R_{12}$ und $R_{13}$. Klemme 1 liegt praktisch auf dem Weg zwischen 2 und 3. Im Stern heißt das: Der Sternpunkt S liegt nah bei 1.
:::
