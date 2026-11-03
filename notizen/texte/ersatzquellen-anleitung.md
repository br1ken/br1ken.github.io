---
titel: Ersatzquellen — die Betriebsanleitung für Thévenin und Norton
datum: 2026-11-03
fach: Grundlagen der E-Technik
art: theorie
tags: [Ersatzspannungsquelle, Ersatzstromquelle, Thévenin, Norton, Innenwiderstand, Kennlinie, Quellenumwandlung, How-to]
teaser: Was eine Ersatzquelle eigentlich ist, warum jede lineare Schaltung an zwei Klemmen eine Gerade ist, und Anleitungen zum Nachmachen für Thévenin, Norton, Umwandlung, Testquelle und Leistungsanpassung. Ohne Zahlen, nur mit Buchstaben.
welle: sinus
---

Stell dir eine Schaltung vor, die du nicht aufmachen darfst. Ein Kasten mit zwei Klemmen. Drinnen stecken Quellen und Widerstände, vielleicht Dutzende. Draußen hängt etwas dran: eine Lampe, ein Messgerät, der Rest einer größeren Schaltung. Gefragt ist immer dasselbe: Welche Spannung liegt an den Klemmen, und welcher Strom fließt heraus?

Die gute Nachricht dieses Kapitels: Für die Antwort brauchst du vom Inneren genau **zwei Größen**, egal wie verwinkelt der Kasten ist. Er muss nur linear sein. Diese Notiz erklärt, warum das so ist, und gibt dir für jeden Rechenweg eine Anleitung, die du Schritt für Schritt abarbeiten kannst.

Der rote Faden folgt den Folien der ET1-Vorlesung, Kapitel 1.3.5 bis 1.3.9 (im Lehrbuch von Albach Kapitel 3.6 bis 3.9). Durchgerechnete Aufgaben mit Zahlen gibt es in [A3.2](beitrag.html?b=ersatzspannungsquelle), [A3.3](beitrag.html?b=ersatzquellen) und [A3.4](beitrag.html?b=gesteuerte-quellen).

## Auf einen Blick

<figure class="dia"><svg viewBox="0 0 380 176" role="img" aria-label="Links die Ersatzspannungsquelle: Spannungsquelle U0 mit dem Innenwiderstand Ri in Reihe, an den Klemmen A und B die Spannung U und der Strom I. Rechts die Ersatzstromquelle: Stromquelle I0 mit Ri parallel, an denselben Klemmen dieselbe Spannung U und derselbe Strom I.">
<defs><marker id="eb3-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="eb3-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="s" d="M40 40V71M40 99V130M40 40H70M110 40H146.5M40 130H146.5"/>
<circle class="b" cx="40" cy="85" r="14"/><path class="s" d="M40 71V99"/><text x="50" y="70">+</text>
<rect class="b" x="70" y="32" width="40" height="16"/><text class="c" x="90" y="25">R<tspan dy="3" font-size="9">i</tspan></text>
<path class="pu" d="M62 72V98" marker-end="url(#eb3-u)"/><text class="tu" x="67" y="90">U<tspan dy="3" font-size="9">0</tspan></text>
<circle class="b" cx="150" cy="40" r="3.5"/><circle class="b" cx="150" cy="130" r="3.5"/>
<text class="c" x="150" y="27" font-weight="700">A</text><text class="c" x="150" y="149" font-weight="700">B</text>
<path class="pi" d="M118 30H139" marker-end="url(#eb3-i)"/><text class="ti c" x="128" y="23">I</text>
<path class="pu" d="M166 48V122" marker-end="url(#eb3-u)"/><text class="tu" x="171" y="90">U</text>
<text class="c" x="198" y="94" style="font-size:22px">⇔</text>
<path class="s" d="M232 40V71M232 99V130M232 40H336.5M232 130H336.5M288 40V65M288 105V130"/>
<circle class="b" cx="232" cy="85" r="14"/><path class="s" d="M218 85H246"/>
<rect class="b" x="280" y="65" width="16" height="40"/><text x="302" y="90">R<tspan dy="3" font-size="9">i</tspan></text>
<circle class="f" cx="288" cy="40" r="3"/><circle class="f" cx="288" cy="130" r="3"/>
<path class="pi" d="M256 98V72" marker-end="url(#eb3-i)"/><text class="ti" x="261" y="90">I<tspan dy="3" font-size="9">0</tspan></text>
<circle class="b" cx="340" cy="40" r="3.5"/><circle class="b" cx="340" cy="130" r="3.5"/>
<text class="c" x="340" y="27" font-weight="700">A</text><text class="c" x="340" y="149" font-weight="700">B</text>
<path class="pi" d="M306 30H327" marker-end="url(#eb3-i)"/><text class="ti c" x="316" y="23">I</text>
<path class="pu" d="M356 48V122" marker-end="url(#eb3-u)"/><text class="tu" x="361" y="90">U</text>
<text class="k c" x="95" y="172">THÉVENIN · REIHE</text><text class="k c" x="288" y="172">NORTON · PARALLEL</text>
</svg><figcaption>Zwei Ersatzschaltungen, die sich an den Klemmen nicht unterscheiden lassen. Der Innenwiderstand R<sub>i</sub> ist in beiden derselbe, und I<sub>0</sub> = U<sub>0</sub>/R<sub>i</sub>.</figcaption></figure>

::: merke Das ganze Kapitel in fünf Zeilen
- Jede lineare Schaltung ist an zwei Klemmen eine **Gerade** im U-I-Diagramm. Zwei Größen legen sie fest.
- **Thévenin:** $U = U_0 - R_i\,I$ — ideale Spannungsquelle $U_0$, Innenwiderstand $R_i$ in Reihe.
- **Norton:** $I = I_K - \dfrac{U}{R_i}$ — ideale Stromquelle $I_0 = I_K$, derselbe $R_i$ parallel.
- **Umrechnen:** $U_0 = R_i\,I_K$. Der Widerstand bleibt, er wandert nur von Reihe nach parallel.
- **$R_i$ finden:** unabhängige Quellen null setzen (Spannungsquelle → Draht, Stromquelle → offen) und den Widerstand zwischen den Klemmen ausrechnen. Oder $R_i = U_0/I_K$.
:::

## Worum es eigentlich geht

<figure class="dia"><svg viewBox="0 0 360 150" role="img" aria-label="Ein Kasten mit der Aufschrift lineares Netz, darin Quellen, Widerstände und gesteuerte Quellen. Zwei Leitungen führen zu den Klemmen A und B. Der Strom I fließt bei A heraus, die Spannung U zeigt von A nach B.">
<defs><marker id="eb1-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="eb1-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<rect class="b" x="40" y="18" width="170" height="114"/>
<text class="c" x="125" y="62" font-weight="700">LINEARES NETZ</text>
<text class="k c" x="125" y="82">QUELLEN · WIDERSTÄNDE</text><text class="k c" x="125" y="96">GESTEUERTE QUELLEN</text>
<path class="s" d="M210 40H276.5M210 110H276.5"/>
<circle class="b" cx="280" cy="40" r="3.5"/><circle class="b" cx="280" cy="110" r="3.5"/>
<text class="c" x="280" y="27" font-weight="700">A</text><text class="c" x="280" y="130" font-weight="700">B</text>
<path class="pi" d="M226 30H258" marker-end="url(#eb1-i)"/><text class="ti c" x="242" y="23">I</text>
<path class="pu" d="M300 48V102" marker-end="url(#eb1-u)"/><text class="tu" x="307" y="80">U</text>
</svg><figcaption>Von außen siehst du nur zwei Klemmen, eine Spannung U und einen Strom I. Zählpfeile wie in der Vorlesung: U von A nach B, I fließt bei A heraus.</figcaption></figure>

„Ersatz“ heißt: Du ersetzt das Innere durch etwas Einfacheres, das sich **an den Klemmen** genau gleich verhält. Hängst du an beide Kästen dieselbe Last, misst du dieselbe Spannung und denselben Strom. Drinnen sieht es völlig anders aus, aber das merkt draußen niemand.

Wozu das gut ist:

- **Last wechseln, ohne neu zu rechnen.** Willst du wissen, was an zehn verschiedenen Lasten passiert, rechnest du das große Netz einmal auf $U_0$ und $R_i$ herunter. Danach ist jede Last ein einfacher Spannungsteiler.
- **Eine Quelle beurteilen.** $R_i$ sagt dir, wie stark die Spannung einbricht, wenn du Strom ziehst. Das ist der Grund, warum das Licht im Auto kurz dunkler wird, wenn der Anlasser läuft.
- **Messfehler verstehen.** Ein Voltmeter ist selbst eine Last. Was es anzeigt, liest du an der Ersatzquelle ab.
- **Leistung optimieren.** Wann eine Last am meisten Leistung bekommt, folgt direkt aus $U_0$ und $R_i$.

::: info Zählpfeile
Wie in den Folien gilt an den Klemmen das [[Erzeugerzählpfeilsystem|zaehlpfeile]]: $U$ zeigt von A nach B, $I$ fließt bei A heraus. Dann ist $P = U \cdot I$ die Leistung, die der Kasten nach außen abgibt. Wer andere Pfeile wählt, bekommt dieselben Ergebnisse mit anderen Vorzeichen. Wichtig ist nur, dass du dich festlegst und dabei bleibst.
:::

## Warum es immer eine Gerade ist

Hier steckt der ganze Trick, und er braucht nur eine Idee: das [[Überlagerungsprinzip|ueberlagerung]]. In einer linearen Schaltung darfst du die Ursachen einzeln betrachten und die Wirkungen addieren.

Zieh also einen Strom $I$ aus der Klemme A und frag, was mit der Spannung $U$ passiert. Es gibt genau zwei Ursachen:

1. **Die Quellen im Kasten.** Sie allein, ohne dass du Strom ziehst, erzeugen die Leerlaufspannung $U_0$. Die hängt nicht davon ab, wie viel Strom du später ziehst.
2. **Dein Strom.** Er allein, mit allen Quellen im Kasten abgeschaltet: Jetzt ist der Kasten nur noch ein Haufen Widerstände, und ein Haufen Widerstände zwischen zwei Klemmen ist ein einziger Widerstand. Wir nennen ihn $R_i$. Dein Strom fließt bei B hinein, durch $R_i$ und bei A heraus. An $R_i$ fällt dabei $R_i\,I$ ab, und zwar gegen die Richtung, in der $U$ gezählt wird.

Zusammen:

$$U = U_0 - R_i\,I$$

Mehr Möglichkeiten gibt es nicht: ein fester Anteil plus ein Anteil, der proportional zum Strom ist. Das ist eine Geradengleichung, und das ist der **Satz von Thévenin** (in den Folien auch Satz von Helmholtz). Die Spannungsquelle $U_0$ drückt, der Innenwiderstand $R_i$ bremst.

Dieselbe Gerade kannst du auch nach $I$ auflösen:

$$I = \frac{U_0}{R_i} - \frac{U}{R_i} = I_K - \frac{U}{R_i}$$

Das ist der **Satz von Norton**. Gleiche Gerade, nur nach der anderen Größe aufgelöst.

::: tipp Thévenin ist eine Masche, Norton ist ein Knoten
Beide Gleichungen kannst du dir an den Ersatzschaltungen in einem Satz herleiten.

**Thévenin**, Maschenumlauf durch $U_0$, $R_i$ und die Klemmen: $U_0 = R_i\,I + U$, also $U = U_0 - R_i\,I$.

**Norton**, [[Knotenregel]] am oberen Knoten: Der Quellstrom $I_0$ teilt sich auf in den Strom durch $R_i$ und den Strom nach außen, $I_0 = \dfrac{U}{R_i} + I$, also $I = I_0 - \dfrac{U}{R_i}$.
:::

::: herleitung Etwas genauer: Überlagerung mit einer Stromquelle an den Klemmen
Häng gedanklich an die Klemmen eine ideale Stromquelle, die den Strom $I$ aus A herauszieht. Die ganze Anordnung enthält dann nur Quellen und lineare Bauteile, also ist jede Spannung darin eine Summe von Beiträgen, und jeder Beitrag ist proportional zu der Quelle, von der er stammt.

Die Beiträge der inneren Quellen zur Klemmenspannung sind zusammen die Spannung bei $I = 0$, also $U_0$. Der Beitrag der äußeren Stromquelle ist proportional zu $I$. Den Proportionalitätsfaktor schreiben wir als $-R_i$. Er ist der Widerstand, den der Kasten mit abgeschalteten inneren Quellen zwischen A und B hat. Damit gilt $U = U_0 - R_i\,I$ für jedes $I$, also für jede Last, die man anschließen kann.

Gesteuerte Quellen sind keine Ursachen in diesem Sinn. Sie hängen von Strömen und Spannungen im Kasten ab und gehören zum linearen Inneren. Deshalb werden sie nie abgeschaltet, und die Gerade gilt trotzdem.

Dieselbe Überlegung trägt bis in die Wechselstromtechnik. Dort stehen Impedanzen statt Widerständen, sonst bleibt alles gleich (ET2).
:::

## Die Gerade lesen

<figure class="dia"><svg viewBox="0 0 360 214" role="img" aria-label="Zwei Diagramme derselben Kennlinie. Links U über I: Die Gerade beginnt bei U0 auf der U-Achse und endet bei IK auf der I-Achse, Steigung minus Ri. Rechts I über U wie in den Folien: Die Gerade beginnt bei IK auf der I-Achse und endet bei U0 auf der U-Achse, Steigung minus 1 durch Ri.">
<defs><marker id="eb2-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M34 160H172" marker-end="url(#eb2-e)"/><path class="s" d="M34 160V22" marker-end="url(#eb2-e)"/>
<text x="42" y="30">U</text><text class="c" x="172" y="177">I</text>
<path class="s" d="M34 46L148 160" stroke-width="2"/><circle class="f" cx="34" cy="46" r="3.5"/><circle class="f" cx="148" cy="160" r="3.5"/>
<text x="28" y="50" text-anchor="end">U<tspan dy="3" font-size="9">0</tspan></text><text class="c" x="148" y="177">I<tspan dy="3" font-size="9">K</tspan></text>
<path class="m" d="M58 70H88V100"/><text class="k c" x="73" y="64">ΔI</text><text class="k" x="92" y="89">ΔU</text>
<text class="k" x="100" y="68">Steigung −R<tspan dy="3" font-size="8">i</tspan></text>
<text class="k c" x="96" y="194">THÉVENIN: U ÜBER I</text>
<text class="c" x="96" y="210" font-size="12">U = U<tspan dy="3" font-size="9">0</tspan><tspan dy="-3"> − R</tspan><tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> I</tspan></text>
<path class="s" d="M214 160H352" marker-end="url(#eb2-e)"/><path class="s" d="M214 160V22" marker-end="url(#eb2-e)"/>
<text x="222" y="30">I</text><text class="c" x="350" y="177">U</text>
<path class="s" d="M214 46L328 160" stroke-width="2"/><circle class="f" cx="214" cy="46" r="3.5"/><circle class="f" cx="328" cy="160" r="3.5"/>
<text x="208" y="50" text-anchor="end">I<tspan dy="3" font-size="9">K</tspan></text><text class="c" x="328" y="177">U<tspan dy="3" font-size="9">0</tspan></text>
<path class="m" d="M238 70H268V100"/><text class="k c" x="253" y="64">ΔU</text><text class="k" x="272" y="89">ΔI</text>
<text class="k" x="272" y="68">Steigung −1/R<tspan dy="3" font-size="8">i</tspan></text>
<text class="k c" x="283" y="194">NORTON: I ÜBER U</text>
<text class="c" x="283" y="210" font-size="12">I = I<tspan dy="3" font-size="9">K</tspan><tspan dy="-3"> − U/R</tspan><tspan dy="3" font-size="9">i</tspan></text>
</svg><figcaption>Dieselbe Gerade zweimal. Links nach U aufgelöst (Thévenin), rechts nach I aufgelöst, so wie sie in den Folien gezeichnet ist (Norton).</figcaption></figure>

Was du an der Geraden ablesen kannst:

- **Die zwei Endpunkte sind die zwei Grenzfälle.** Im **Leerlauf** sind die Klemmen offen, es fließt kein Strom, und es liegt die volle Spannung $U_0$ an. Im **Kurzschluss** sind die Klemmen mit einem Draht verbunden, die Spannung ist null, und es fließt der größtmögliche Strom $I_K$. Zwei Punkte legen eine Gerade fest, deshalb reichen diese zwei „Messungen“ (siehe [[Leerlauf und Kurzschluss|leerlauf-kurzschluss]]).
- **Die Steigung ist der Innenwiderstand.** In der Thévenin-Ansicht ist sie $-R_i$: um so viel sinkt die Spannung, wenn du ein Ampere mehr ziehst. Aus den Endpunkten folgt sofort $R_i = U_0 / I_K$.
- **Beide Formen in einer Gleichung.** Teilst du die Thévenin-Gleichung durch $U_0$, steht die Achsenabschnittsform da, an der du beide Endpunkte direkt siehst:

$$\frac{U}{U_0} + \frac{I}{I_K} = 1$$

- **Ideale Quellen sind die Extremfälle.** Bei $R_i \to 0$ hält die Quelle ihre Spannung bei jedem Strom: eine [[ideale Spannungsquelle|quelle]]. Bei $R_i \to \infty$ treibt sie ihren Strom bei jeder Spannung: eine ideale Stromquelle. Eine gute Spannungsquelle hat also ein kleines $R_i$, eine gute Stromquelle ein großes.

### Der Arbeitspunkt

Eine Last $R_L$ hat ihre eigene Gerade, $U = R_L\,I$, und die geht durch den Ursprung. Wo sie die Quellengerade schneidet, liegt der [[Arbeitspunkt|arbeitspunkt]]: Dort sind Quelle und Last gleichzeitig zufrieden. Ausgerechnet heißt das:

$$I = \frac{U_0}{R_i + R_L}, \qquad U = U_0\,\frac{R_L}{R_i + R_L}$$

Die zweite Formel ist ein [[Spannungsteiler]] aus $R_i$ und $R_L$. Mit der Norton-Form bekommst du dasselbe als [[Stromteiler]]: $I = I_K\,\dfrac{R_i}{R_i + R_L}$.

Zum Ausprobieren: Oben steht eine Schaltung, unten ihre Ersatzquelle, beide an derselben Last. Schalte zwischen Leerlauf, Last und Kurzschluss um und sieh zu, wie der Arbeitspunkt auf der Geraden wandert.

::: sim ersatzquelle u=12 r1=1k r2=1k r3=500 rl=1k modus=last
Die Simulation zeichnet U über I, also die Thévenin-Ansicht.
:::

::: tipp Zwei-Punkte-Form: wenn Leerlauf oder Kurzschluss nicht gehen
Eine echte Batterie schließt man nicht kurz, und manches Netzgerät regelt im Leerlauf anders als unter Last. Für eine Gerade reichen aber zwei **beliebige** Punkte. Miss die Spannung bei zwei verschiedenen Lasten, $(I_1, U_1)$ und $(I_2, U_2)$:

$$R_i = \frac{U_1 - U_2}{I_2 - I_1}, \qquad U_0 = U_1 + R_i\,I_1$$
:::

## Thévenin oder Norton: die Umwandlung

Die zwei Ersatzschaltungen oben auf der Seite sind gleichwertig, wenn sie dieselbe Gerade haben (Folien 1.3.5, „Äquivalente Quellen“). Daraus folgen drei Regeln:

1. **Der Widerstand bleibt derselbe.** Er wandert nur von Reihe nach parallel oder zurück.
2. **Quellgröße umrechnen:** $I_0 = \dfrac{U_0}{R_i}$ beziehungsweise $U_0 = R_i\,I_0$.
3. **Richtung:** Der Pfeil der Stromquelle zeigt zu der Klemme, an der bei der Spannungsquelle das Plus liegt. Kontrolle: Schließ beide kurz. Beide müssen den Strom in dieselbe Richtung durch den Draht schicken.

::: achtung Gleich nur von außen
Die Umwandlung stimmt nur an den Klemmen. Innen verhalten sich die beiden genau gegensätzlich: Im Leerlauf verbraucht die Spannungsquelle nichts, in der Stromquelle fließt dagegen der ganze Strom $I_0$ durch $R_i$. Im Kurzschluss ist es umgekehrt. Verlustleistung und Wirkungsgrad des Originals kannst du deshalb aus keiner Ersatzschaltung ablesen.

Ideale Quellen haben kein Gegenstück: Bei $R_i = 0$ gibt es keine Ersatzstromquelle, bei $R_i \to \infty$ keine Ersatzspannungsquelle.
:::

### Umwandeln als Werkzeug: das Pendeln

Die Umwandlung ist mehr als Formsache. Mit ihr kannst du ganze Ketten aus Quellen und Widerständen zusammenfalten, weil sich jede Form für eine Schaltungsart besonders leicht zusammenfassen lässt:

- **In Reihe** addieren sich Spannungen und Widerstände. Also Thévenin-Form: $U_0 = U_{01} + U_{02}$ (vorzeichenrichtig) und $R_i = R_{i1} + R_{i2}$.
- **Parallel** addieren sich Ströme und [[Leitwerte|leitwert]]. Also Norton-Form: $I_0 = I_{01} + I_{02}$ und $G_i = G_{i1} + G_{i2}$ mit $G = 1/R$.

Das Rezept: Fang an der Quelle an, die am weitesten von den Klemmen weg ist. Schau, wie das nächste Element angeschlossen ist. Liegt es in Reihe, bring deinen Zwischenstand in Thévenin-Form und addiere. Liegt es parallel, bring ihn in Norton-Form und addiere. So pendelst du dich bis zu den Klemmen vor.

::: info Mehrere Spannungsquellen parallel (Folien 1.3.8)
Real heißt: jede mit ihrem Innenwiderstand $R_j$. Wandle jede in eine Stromquelle $U_j G_j$ mit $R_j$ parallel um, addiere Ströme und Leitwerte und wandle zurück:

$$U_0 = \frac{\sum_j U_j\,G_j}{\sum_j G_j}, \qquad R_i = \frac{1}{\sum_j G_j}$$

$U_0$ ist also ein gewichteter Mittelwert der Quellspannungen, gewichtet mit den Leitwerten. Für zwei Quellen ausgeschrieben:

$$U_0 = \frac{U_{01}\,R_{i2} + U_{02}\,R_{i1}}{R_{i1} + R_{i2}}, \qquad R_i = R_{i1} \parallel R_{i2}$$

Sind die Spannungen verschieden, fließt schon im Leerlauf ein Ausgleichsstrom $\dfrac{U_{01} - U_{02}}{R_{i1} + R_{i2}}$ von einer Quelle in die andere. Deshalb der Rat aus den Folien: Spannungsquellen möglichst nur in Reihe schalten, Stromquellen nur parallel.
:::

## Anleitung 1: der Innenwiderstand

<figure class="dia"><svg viewBox="0 0 360 154" role="img" aria-label="Was beim Null-Setzen passiert. Eine Spannungsquelle wird zum Draht, eine Stromquelle wird zur Unterbrechung, eine gesteuerte Quelle, als Raute gezeichnet, bleibt in der Schaltung.">
<defs><marker id="eb4-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<text class="k c" x="60" y="10">SPANNUNGSQUELLE</text><text class="k c" x="180" y="10">STROMQUELLE</text><text class="k c" x="300" y="10">GESTEUERTE QUELLE</text>
<path class="s" d="M60 16V26M60 54V64"/><circle class="b" cx="60" cy="40" r="14"/><path class="s" d="M60 26V54"/><text x="70" y="27">+</text>
<path class="s" d="M180 16V26M180 54V64"/><circle class="b" cx="180" cy="40" r="14"/><path class="s" d="M166 40H194"/>
<path class="s" d="M300 16V26M300 54V64"/><path class="b" d="M300 26L314 40L300 54L286 40Z"/>
<path class="s" d="M60 72V92" marker-end="url(#eb4-e)"/><path class="s" d="M180 72V92" marker-end="url(#eb4-e)"/><path class="s" d="M300 72V92" marker-end="url(#eb4-e)"/>
<path class="s" d="M60 100V130"/>
<path class="s" d="M180 100V105.5M180 124.5V130"/><circle class="b" cx="180" cy="109" r="3.5"/><circle class="b" cx="180" cy="121" r="3.5"/>
<path class="s" d="M300 100V102M300 128V130"/><path class="b" d="M300 102L313 115L300 128L287 115Z"/>
<text class="k c" x="60" y="148">DRAHT · U = 0</text><text class="k c" x="180" y="148">OFFEN · I = 0</text><text class="k c" x="300" y="148">BLEIBT DRIN</text>
</svg><figcaption>Null setzen heißt: Die Quelle liefert nichts mehr. Eine Spannungsquelle mit 0 V ist ein Draht, eine Stromquelle mit 0 A ist eine Unterbrechung. Gesteuerte Quellen bleiben.</figcaption></figure>

$R_i$ ist das, was dein Strom sieht, wenn im Kasten alle Quellen aus sind. Genau so rechnest du ihn auch aus.

1. **Last abklemmen.** Alles, was außerhalb von A und B hängt, gehört nicht zum Kasten.
2. **Unabhängige Quellen null setzen.** Spannungsquelle → Draht, Stromquelle → Unterbrechung. Innenwiderstände von Quellen bleiben stehen, nur die ideale Quelle verschwindet. Gesteuerte Quellen bleiben, dafür gibt es Anleitung 5.
3. **Neu zeichnen, von den Klemmen aus gesehen.** Stell dir ein Ohmmeter an A und B vor und verfolge, welche Wege sein Messstrom nehmen kann. Zwei Dinge fallen dabei weg: Zweige mit einem offenen Ende, weil durch sie kein Strom fließt, und Widerstände, die jetzt kurzgeschlossen sind, weil an ihnen keine Spannung liegt.
4. **Zusammenfassen**, mit Reihe und parallel, und wenn das nicht reicht, mit der [Stern-Dreieck-Umwandlung](beitrag.html?b=stern-dreieck).

::: achtung Null setzen ist etwas anderes als Kurzschluss
„Kurzschluss“ und „Leerlauf“ beziehen sich auf die **Klemmen**. „Null setzen“ bezieht sich auf die **Quellen im Inneren**. Für $R_i$ setzt du die Quellen null und lässt die Klemmen offen, sonst misst dein gedachtes Ohmmeter nur den Draht.
:::

## Anleitung 2: Ersatzspannungsquelle (Thévenin)

<figure class="dia"><svg viewBox="0 0 370 160" role="img" aria-label="Links Leerlauf: Die Klemmen des Netzes sind offen, zwischen A und B liegt U0. Rechts Kurzschluss: Die Klemmen sind mit einem Draht verbunden, durch den der Strom IK von A nach B fließt.">
<defs><marker id="eb5-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="eb5-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<rect class="b" x="14" y="24" width="96" height="96"/><text class="c" x="62" y="77" font-weight="700">NETZ</text>
<path class="s" d="M110 44H146.5M110 100H146.5"/><circle class="b" cx="150" cy="44" r="3.5"/><circle class="b" cx="150" cy="100" r="3.5"/>
<text class="c" x="150" y="32" font-weight="700">A</text><text class="c" x="150" y="120" font-weight="700">B</text>
<path class="pu" d="M168 52V92" marker-end="url(#eb5-u)"/><text class="tu" x="173" y="77">U<tspan dy="3" font-size="9">0</tspan></text>
<text class="k c" x="92" y="140">LEERLAUF</text><text class="c" x="92" y="156" font-size="12">I = 0, U = U<tspan dy="3" font-size="9">0</tspan></text>
<rect class="b" x="200" y="24" width="96" height="96"/><text class="c" x="248" y="77" font-weight="700">NETZ</text>
<path class="s" d="M296 44H310.5M317.5 44H334V100H317.5M310.5 100H296"/><circle class="b" cx="314" cy="44" r="3.5"/><circle class="b" cx="314" cy="100" r="3.5"/>
<text class="c" x="314" y="32" font-weight="700">A</text><text class="c" x="314" y="120" font-weight="700">B</text>
<path class="pi" d="M346 56V88" marker-end="url(#eb5-i)"/><text class="ti" x="351" y="77">I<tspan dy="3" font-size="9">K</tspan></text>
<text class="k c" x="270" y="140">KURZSCHLUSS</text><text class="c" x="270" y="156" font-size="12">U = 0, I = I<tspan dy="3" font-size="9">K</tspan></text>
</svg><figcaption>Die zwei Gedankenexperimente. Im Leerlauf liest du U<sub>0</sub> ab, im Kurzschluss I<sub>K</sub>. Am echten Netz muss dafür niemand etwas kurzschließen, es wird nur gerechnet.</figcaption></figure>

1. **Klemmen und Zählpfeile festlegen.** $U$ von A nach B, $I$ fließt bei A heraus. Last abklemmen.
2. **$R_i$ bestimmen**, nach Anleitung 1.
3. **$U_0$ im Leerlauf rechnen.** Die Klemmen bleiben offen, also ist $I = 0$. Gesucht ist die Spannung von A nach B.
   - Durch Widerstände, die in Reihe zu einer offenen Klemme liegen, fließt nichts. An ihnen fällt keine Spannung ab, im Leerlauf sind sie wie ein Draht.
   - Werkzeuge: [[Spannungsteiler]], ein Maschenumlauf von A nach B, Knotenpotentiale. Bei mehreren Quellen hilft die Überlagerung: Rechne den Beitrag jeder Quelle einzeln, die anderen null gesetzt, und addiere.
4. **Ersatzschaltung zeichnen.** $U_0$ mit dem Plus an A, $R_i$ in Reihe.
5. **Probe.** Stimmen die Einheiten? Passt ein Grenzfall, etwa ein Widerstand gegen null oder unendlich? Wenn Zeit bleibt, rechne $I_K$ direkt aus und vergleiche mit $U_0 / R_i$.

## Anleitung 3: Ersatzstromquelle (Norton)

1. **Klemmen und Zählpfeile** wie oben.
2. **$R_i$ bestimmen**, nach Anleitung 1. Er ist derselbe wie bei Thévenin.
3. **$I_K$ im Kurzschluss rechnen.** Verbinde A und B mit einem Draht, dann ist $U = 0$. Gesucht ist der Strom durch diesen Draht, von A nach B.
   - Was direkt zwischen A und B liegt, ist jetzt kurzgeschlossen. Daran liegt keine Spannung, also fließt kein Strom hindurch, und du kannst es weglassen.
   - Werkzeuge: [[Knotenregel]] am Knoten A, [[Stromteiler]], Überlagerung.
4. **Ersatzschaltung zeichnen.** Stromquelle $I_0 = I_K$ mit dem Pfeil zur Klemme A, $R_i$ parallel.
5. **Probe:** $U_0 = R_i\,I_K$.

::: tipp Zwei von dreien reichen
$U_0$, $I_K$ und $R_i$ hängen über $U_0 = R_i\,I_K$ zusammen. Rechne also die zwei, die am wenigsten Arbeit machen, und nimm die dritte als Kontrolle. Faustregel: Viel in Reihe zur Klemme spricht für den Leerlauf. Viel parallel zu den Klemmen spricht für den Kurzschluss, weil dort alles Parallele wegfällt.
:::

## Anleitung 4: die Gerade direkt ausrechnen

Dieser Weg funktioniert immer, auch wenn die anderen hakeln. Die Folien nennen ihn Koeffizientenvergleich.

1. **Lass an den Klemmen den Strom $I$ als Unbekannte stehen**, als würde eine Last ihn herausziehen.
2. **Stell die Gleichungen auf**, mit Knoten- und Maschenregel, und schleppe $I$ als Buchstaben mit.
3. **Löse nach $U$ auf und sortiere:**

$$U = \underbrace{(\ldots)}_{U_0} - \underbrace{(\ldots)}_{R_i} \cdot I$$

Was nicht von $I$ abhängt, ist $U_0$. Was vor $I$ steht, ist $R_i$. Löst du stattdessen nach $I$ auf, stehen $I_K$ und $1/R_i$ da.

## Anleitung 5: mit gesteuerten Quellen

Eine [[gesteuerte Quelle|gesteuerte-quelle]] hängt an einer Spannung oder einem Strom irgendwo im Netz. Sie ist Teil des Kastens und keine eigene Ursache. Daraus folgt die wichtigste Regel aus den Folien: **Gesteuerte Quellen werden nie null gesetzt.** Anleitung 1 fällt damit weg. Es bleiben drei Wege:

- **Leerlauf und Kurzschluss:** $U_0$ und $I_K$ der ursprünglichen Schaltung rechnen, dann $R_i = U_0 / I_K$. Das geht, solange es unabhängige Quellen gibt. Rechnerisch ist es oft aufwendig.
- **Die Gerade direkt** nach Anleitung 4.
- **Testquelle:** Unabhängige Quellen null setzen, gesteuerte bleiben drin. Dann einen bekannten Strom $I_t$ in die Klemme A einprägen und die Spannung $U_t$ von A nach B ausrechnen. Es gilt $R_i = U_t / I_t$. Dieser Weg liefert nur $R_i$, aber nicht $U_0$.

<figure class="dia"><svg viewBox="0 0 360 150" role="img" aria-label="Testquelle: Ein Netz, in dem die unabhängigen Quellen null gesetzt sind und die gesteuerten bleiben. An die Klemmen A und B ist eine Stromquelle angeschlossen, die den Strom It in die Klemme A schickt. Zwischen A und B liegt die Spannung Ut.">
<defs><marker id="eb6-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="eb6-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<rect class="b" x="14" y="20" width="150" height="100"/><text class="c" x="89" y="52" font-weight="700">NETZ</text>
<text class="k c" x="89" y="72">UNABHÄNGIGE QUELLEN</text><text class="k c" x="89" y="86">NULL GESETZT,</text><text class="k c" x="89" y="100">GESTEUERTE BLEIBEN</text>
<path class="s" d="M164 40H196.5M164 100H196.5M203.5 40H264V56M264 84V100H203.5"/>
<circle class="b" cx="200" cy="40" r="3.5"/><circle class="b" cx="200" cy="100" r="3.5"/>
<text class="c" x="200" y="28" font-weight="700">A</text><text class="c" x="200" y="120" font-weight="700">B</text>
<circle class="b" cx="264" cy="70" r="14"/><path class="s" d="M250 70H278"/>
<path class="pi" d="M250 30H218" marker-end="url(#eb6-i)"/><text class="ti" x="236" y="23">I<tspan dy="3" font-size="9">t</tspan></text>
<path class="pu" d="M222 48V92" marker-end="url(#eb6-u)"/><text class="tu" x="227" y="74">U<tspan dy="3" font-size="9">t</tspan></text>
<text class="c" x="180" y="144" font-size="12">R<tspan dy="3" font-size="9">i</tspan><tspan dy="-3"> = U</tspan><tspan dy="3" font-size="9">t</tspan><tspan dy="-3"> / I</tspan><tspan dy="3" font-size="9">t</tspan></text>
</svg><figcaption>Testquelle: I<sub>t</sub> fließt in die Klemme A hinein, U<sub>t</sub> wird von A nach B gezählt. Statt eines Stroms darfst du auch eine Testspannung anlegen und den Strom ausrechnen.</figcaption></figure>

::: achtung Was bei gesteuerten Quellen anders sein kann
- **Ohne unabhängige Quellen** ist $U_0 = 0$ und $I_K = 0$, und $0/0$ hilft nicht weiter. Der Kasten ist dann ein reiner Widerstand, und den liefert nur die Testquelle oder Anleitung 4.
- **$R_i$ kann null oder negativ werden.** Das ist kein Rechenfehler: Die gesteuerte Quelle speist Energie nach. Ohne gesteuerte Quellen dagegen ist ein negatives $R_i$ immer ein Vorzeichenfehler.
:::

Ein vollständig durchgerechnetes Beispiel mit zwei gekoppelten Kreisen steht in [A3.4](beitrag.html?b=gesteuerte-quellen).

## Drei Beispiele, nur mit Buchstaben

Hier spielst du die Anleitungen einmal durch. Es gibt keine Zahlen, nur Buchstaben, und jedes Ergebnis lässt sich mit $U_0 = R_i\,I_K$ kontrollieren.

### Beispiel 1: der Spannungsteiler

<figure class="dia"><svg viewBox="0 0 360 150" role="img" aria-label="Spannungsquelle Uq, oben R1 in Reihe zum Knoten, vom Knoten R2 nach unten. Die Klemmen A und B liegen an R2.">
<defs><marker id="eb8-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker></defs>
<path class="s" d="M90 40V71M90 99V130M90 40H130M170 40H276.5M90 130H276.5M220 40V65M220 105V130"/>
<circle class="b" cx="90" cy="85" r="14"/><path class="s" d="M90 71V99"/><text x="100" y="70">+</text>
<path class="pu" d="M112 72V98" marker-end="url(#eb8-u)"/><text class="tu" x="117" y="90">U<tspan dy="3" font-size="9">q</tspan></text>
<rect class="b" x="130" y="32" width="40" height="16"/><text class="c" x="150" y="25">R<tspan dy="3" font-size="9">1</tspan></text>
<rect class="b" x="212" y="65" width="16" height="40"/><text x="234" y="90">R<tspan dy="3" font-size="9">2</tspan></text>
<circle class="f" cx="220" cy="40" r="3"/><circle class="f" cx="220" cy="130" r="3"/>
<circle class="b" cx="280" cy="40" r="3.5"/><circle class="b" cx="280" cy="130" r="3.5"/>
<text class="c" x="280" y="27" font-weight="700">A</text><text class="c" x="280" y="149" font-weight="700">B</text>
</svg><figcaption>Beispiel 1: Spannungsquelle U<sub>q</sub> mit dem Teiler aus R<sub>1</sub> und R<sub>2</sub>, die Klemmen liegen an R<sub>2</sub>.</figcaption></figure>

1. **$R_i$:** $U_q$ wird zum Draht. Vom Ohmmeter an A und B aus liegen $R_1$ und $R_2$ dann zwischen denselben zwei Knoten, also parallel: $R_i = R_1 \parallel R_2 = \dfrac{R_1 R_2}{R_1 + R_2}$.
2. **$U_0$:** Die Klemmen sind offen, durch $R_1$ und $R_2$ fließt derselbe Strom. Spannungsteiler: $U_0 = U_q\,\dfrac{R_2}{R_1 + R_2}$.
3. **$I_K$:** Der Draht zwischen A und B schließt $R_2$ kurz. Übrig bleibt $U_q$ an $R_1$: $I_K = \dfrac{U_q}{R_1}$.
4. **Probe:** $\dfrac{U_0}{I_K} = U_q\,\dfrac{R_2}{R_1 + R_2} \cdot \dfrac{R_1}{U_q} = \dfrac{R_1 R_2}{R_1 + R_2} = R_i$. ✓

Die Moral: Ein Spannungsteiler ist eine Spannungsquelle mit dem Innenwiderstand $R_1 \parallel R_2$. Deshalb bricht er ein, sobald man ihn belastet (mehr dazu in [Widerstandsnetzwerke](beitrag.html?b=spannungsteiler) und [A2.4](beitrag.html?b=belastetes-potentiometer)).

### Beispiel 2: Stromquelle mit Reihenwiderstand

<figure class="dia"><svg viewBox="0 0 360 150" role="img" aria-label="Stromquelle Iq mit Pfeil nach oben, parallel dazu R1. Oben führt R2 in Reihe zur Klemme A, unten geht die Leitung direkt zur Klemme B.">
<defs><marker id="eb9-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="s" d="M90 40V71M90 99V130M90 40H200M240 40H276.5M90 130H276.5M160 40V65M160 105V130"/>
<circle class="b" cx="90" cy="85" r="14"/><path class="s" d="M76 85H104"/>
<path class="pi" d="M114 98V72" marker-end="url(#eb9-i)"/><text class="ti" x="119" y="90">I<tspan dy="3" font-size="9">q</tspan></text>
<rect class="b" x="152" y="65" width="16" height="40"/><text x="174" y="90">R<tspan dy="3" font-size="9">1</tspan></text>
<circle class="f" cx="160" cy="40" r="3"/><circle class="f" cx="160" cy="130" r="3"/>
<rect class="b" x="200" y="32" width="40" height="16"/><text class="c" x="220" y="25">R<tspan dy="3" font-size="9">2</tspan></text>
<circle class="b" cx="280" cy="40" r="3.5"/><circle class="b" cx="280" cy="130" r="3.5"/>
<text class="c" x="280" y="27" font-weight="700">A</text><text class="c" x="280" y="149" font-weight="700">B</text>
</svg><figcaption>Beispiel 2: Stromquelle I<sub>q</sub> mit R<sub>1</sub> parallel, dazu R<sub>2</sub> in Reihe zur Klemme A.</figcaption></figure>

1. **$R_i$:** $I_q$ wird zur Unterbrechung. Vom Ohmmeter aus liegen $R_2$ und $R_1$ in Reihe: $R_i = R_1 + R_2$.
2. **$U_0$:** Die Klemme A ist offen, durch $R_2$ fließt nichts, an ihm fällt nichts ab. Der ganze Strom $I_q$ fließt durch $R_1$: $U_0 = I_q\,R_1$.
3. **$I_K$:** Mit dem Draht an den Klemmen teilt sich $I_q$ auf $R_1$ und den Weg über $R_2$ auf. Stromteiler: $I_K = I_q\,\dfrac{R_1}{R_1 + R_2}$.
4. **Probe:** $\dfrac{U_0}{I_K} = I_q R_1 \cdot \dfrac{R_1 + R_2}{I_q R_1} = R_1 + R_2 = R_i$. ✓

Die Moral: Ein Widerstand in Reihe zur Klemme ändert $U_0$ nicht. Er erhöht $R_i$ und verkleinert damit $I_K$.

### Beispiel 3: zwei Quellen, zwei Wege

<figure class="dia"><svg viewBox="0 0 360 150" role="img" aria-label="Spannungsquelle Uq mit R1 in Reihe zum Knoten A. Am Knoten A speist eine Stromquelle Iq von unten ein, daneben führt R2 nach unten. Die Klemmen A und B liegen an R2.">
<defs><marker id="eb10-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="eb10-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="s" d="M60 40V71M60 99V130M60 40H100M140 40H276.5M60 130H276.5M190 40V71M190 99V130M250 40V65M250 105V130"/>
<circle class="b" cx="60" cy="85" r="14"/><path class="s" d="M60 71V99"/><text x="70" y="70">+</text>
<path class="pu" d="M82 72V98" marker-end="url(#eb10-u)"/><text class="tu" x="87" y="90">U<tspan dy="3" font-size="9">q</tspan></text>
<rect class="b" x="100" y="32" width="40" height="16"/><text class="c" x="120" y="25">R<tspan dy="3" font-size="9">1</tspan></text>
<circle class="b" cx="190" cy="85" r="14"/><path class="s" d="M176 85H204"/>
<path class="pi" d="M212 98V72" marker-end="url(#eb10-i)"/><text class="ti" x="217" y="90">I<tspan dy="3" font-size="9">q</tspan></text>
<rect class="b" x="242" y="65" width="16" height="40"/><text x="264" y="90">R<tspan dy="3" font-size="9">2</tspan></text>
<circle class="f" cx="190" cy="40" r="3"/><circle class="f" cx="250" cy="40" r="3"/><circle class="f" cx="190" cy="130" r="3"/><circle class="f" cx="250" cy="130" r="3"/>
<circle class="b" cx="280" cy="40" r="3.5"/><circle class="b" cx="280" cy="130" r="3.5"/>
<text class="c" x="280" y="27" font-weight="700">A</text><text class="c" x="280" y="149" font-weight="700">B</text>
</svg><figcaption>Beispiel 3: Spannungsquelle U<sub>q</sub> mit R<sub>1</sub>, Stromquelle I<sub>q</sub> und R<sub>2</sub>, alle am Knoten A.</figcaption></figure>

1. **$R_i$:** $U_q$ wird zum Draht, $I_q$ zur Unterbrechung. Übrig bleiben $R_1$ und $R_2$ parallel: $R_i = R_1 \parallel R_2$.
2. **$U_0$ mit Überlagerung.** Nur $U_q$ aktiv ($I_q$ offen): Spannungsteiler, $U_q\,\dfrac{R_2}{R_1 + R_2}$. Nur $I_q$ aktiv ($U_q$ als Draht): $I_q$ fließt in $R_1 \parallel R_2$, das ergibt $I_q\,(R_1 \parallel R_2)$. Zusammen:

$$U_0 = U_q\,\frac{R_2}{R_1 + R_2} + I_q\,\frac{R_1 R_2}{R_1 + R_2}$$

3. **Dasselbe durch Pendeln.** Wandle $U_q$ mit $R_1$ in eine Stromquelle $U_q/R_1$ mit $R_1$ parallel um. Jetzt liegt alles parallel. Ströme addieren: $I_0 = \dfrac{U_q}{R_1} + I_q$. Leitwerte addieren: $G_i = \dfrac{1}{R_1} + \dfrac{1}{R_2}$. Zurück in Thévenin-Form:

$$U_0 = \frac{I_0}{G_i} = \left(\frac{U_q}{R_1} + I_q\right)\frac{R_1 R_2}{R_1 + R_2}$$

Ausmultipliziert ist das genau das Ergebnis aus Schritt 2.

4. **$I_K$:** Der Draht schließt $R_2$ kurz. Durch $R_1$ fließt $U_q/R_1$ in den Knoten A, die Stromquelle liefert $I_q$ dazu: $I_K = \dfrac{U_q}{R_1} + I_q$. Das ist das $I_0$ aus dem Pendeln. ✓

Die Moral: Überlagerung und Umwandlung führen zum selben Ergebnis. Liegt alles parallel, ist die Norton-Form fast immer der kürzere Weg.

## Leistung: wie viel an der Last ankommt

<figure class="dia"><svg viewBox="0 0 360 206" role="img" aria-label="Quellengerade U über I von U0 bis IK. Unter dem Mittelpunkt der Geraden ist das größte Rechteck eingefärbt, mit der Fläche P gleich U mal I. Die Ecke liegt bei U0 halbe und IK halbe. Durch den Mittelpunkt läuft gestrichelt die Lastgerade für RL gleich Ri. Zwei gestrichelte Rechtecke an anderen Punkten der Geraden sind kleiner.">
<defs><marker id="eb7-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<rect class="hl" x="48" y="110" width="120" height="66"/>
<path class="m d" d="M48 60.5H78V176M48 159.5H258V176"/>
<path class="s" d="M48 176H336" marker-end="url(#eb7-e)"/><path class="s" d="M48 176V22" marker-end="url(#eb7-e)"/>
<text x="56" y="28">U</text><text class="c" x="334" y="194">I</text>
<path class="s" d="M48 44L288 176" stroke-width="2"/>
<path class="s d" d="M48 176L222 80.3"/><text x="226" y="78">R<tspan dy="3" font-size="9">L</tspan><tspan dy="-3"> = R</tspan><tspan dy="3" font-size="9">i</tspan></text>
<circle class="f" cx="168" cy="110" r="4"/><circle class="fm" cx="78" cy="60.5" r="3"/><circle class="fm" cx="258" cy="159.5" r="3"/>
<text x="42" y="48" text-anchor="end">U<tspan dy="3" font-size="9">0</tspan></text><text x="42" y="114" text-anchor="end">U<tspan dy="3" font-size="9">0</tspan><tspan dy="-3">/2</tspan></text>
<text class="c" x="288" y="194">I<tspan dy="3" font-size="9">K</tspan></text><text class="c" x="168" y="194">I<tspan dy="3" font-size="9">K</tspan><tspan dy="-3">/2</tspan></text>
<text class="c" x="88" y="128">P = U · I</text>
<text class="k" x="196" y="40">GRÖSSTES RECHTECK:</text><text class="k" x="196" y="54">MITTE DER GERADEN</text>
</svg><figcaption>Die Leistung an der Last ist die Fläche des Rechtecks unter dem Arbeitspunkt. Am größten ist sie in der Mitte der Geraden. Die gestrichelten Rechtecke weiter oben und weiter unten sind kleiner.</figcaption></figure>

Die Last bekommt $P = U \cdot I$. Im U-I-Diagramm ist das die **Fläche des Rechtecks** zwischen dem Arbeitspunkt und den Achsen. Wandert der Arbeitspunkt Richtung Leerlauf, wird das Rechteck hoch und schmal. Wandert er Richtung Kurzschluss, wird es breit und flach. Dazwischen liegt ein Maximum, und unter einer Geraden liegt es genau in der Mitte: bei $U = U_0/2$ und $I = I_K/2$.

Nachgerechnet: Setz $U = U_0 - R_i\,I$ ein, dann ist

$$P = U_0\,I - R_i\,I^2$$

Das ist eine nach unten offene Parabel mit den Nullstellen $I = 0$ und $I = I_K$. Ihr Scheitel liegt in der Mitte, bei $I = I_K/2$. Daraus folgt die **[[Leistungsanpassung|leistungsanpassung]]**:

$$R_L = R_i \quad\Rightarrow\quad P_{L,\max} = \frac{U_0\,I_K}{4} = \frac{U_0^2}{4\,R_i}$$

In den Folien steht derselbe Satz als Ableitung nach $R_L$: $P_L = U_0^2\,\dfrac{R_L}{(R_i + R_L)^2}$ wird maximal bei $R_L = R_i$.

Für eine reale Spannungsquelle ist der [[Wirkungsgrad|wirkungsgrad]] das Verhältnis von Lastleistung zur Leistung der idealen Quelle, $P_{ges} = U_0\,I$:

$$\eta = \frac{P_L}{P_{ges}} = \frac{R_L}{R_L + R_i} = \frac{U}{U_0} = 1 - \frac{I}{I_K}$$

Auf der Geraden ist $\eta$ einfach, wie hoch dein Arbeitspunkt steht. Bei Anpassung ist er genau in der Mitte, also $\eta = 50\,\%$. Die Hälfte der Leistung bleibt im Innenwiderstand.

::: tipp Wie man Quellen betreibt
- **Energie** (Netz, Akku, Netzteil): weit weg von der Anpassung, mit $R_L \gg R_i$. Dann ist der Strom klein gegen $I_K$ und der Wirkungsgrad hoch.
- **Signale** (Antenne, Sensor, Messkette): Anpassung, wenn die Leistung zählt. Ein Wirkungsgrad von 50 % stört dort niemanden.
- **Messen:** Ein Voltmeter mit dem Innenwiderstand $R_V$ zeigt $U_0\,\dfrac{R_V}{R_i + R_V}$ an, also etwas zu wenig. Damit der Fehler klein bleibt, muss $R_V \gg R_i$ sein (Folien 1.3.4, belasteter Spannungsteiler).
:::

::: achtung Wirkungsgrad gilt fürs Modell
Die Formel für $\eta$ beschreibt eine reale Spannungsquelle, die tatsächlich aus $U_0$ und $R_i$ besteht. Ist die Ersatzquelle nur ein Ersatz für ein größeres Netz, stimmt die Leistung an der Last, aber nicht die Verlustleistung im Inneren. Der echte Wirkungsgrad des Netzes kann dann weit unter 50 % liegen (siehe [A3.6](beitrag.html?b=wirkungsgrad-spannungsquelle)).
:::

## Welcher Weg wann?

| Situation | Am schnellsten |
|---|---|
| Nur unabhängige Quellen, $R_i$ gesucht | Quellen null setzen (Anleitung 1) |
| Viel liegt in Reihe zu den Klemmen | Thévenin, $U_0$ im Leerlauf |
| Viel liegt parallel zu den Klemmen | Norton, $I_K$ im Kurzschluss |
| Kette aus Reihe und parallel mit Quellen | Pendeln mit der Umwandlung |
| Mehrere unabhängige Quellen | Überlagerung für $U_0$ oder $I_K$ |
| Gesteuerte Quellen dabei | $U_0$ und $I_K$, Testquelle oder Anleitung 4, nie null setzen |
| Keine unabhängigen Quellen | Testquelle, denn $U_0 = I_K = 0$ |
| Echte Quelle, die man nicht kurzschließen darf | Zwei-Punkte-Form mit zwei Lasten |

## Typische Fehler

- **Stromquelle kurzgeschlossen statt aufgetrennt** (oder Spannungsquelle aufgetrennt statt überbrückt). Merksatz: Null Volt ist ein Draht, null Ampere ist eine Lücke.
- **Innenwiderstände der Quellen mit entfernt.** Null gesetzt wird nur die ideale Quelle, ihr Widerstand bleibt.
- **Gesteuerte Quellen null gesetzt.** Nie.
- **Last vergessen.** Für $U_0$, $I_K$ und $R_i$ ist die Last abgeklemmt. Sie kommt erst an die fertige Ersatzquelle.
- **Pfeilrichtung verdreht.** Das Plus von $U_0$ gehört an die Klemme, an der der $U$-Pfeil beginnt, und der Pfeil von $I_0$ zeigt dorthin. Ohne gesteuerte Quellen muss $U_0/I_K$ positiv herauskommen. Wird es negativ, ist eine Richtung falsch.
- **Leerlauf falsch verstanden.** Leerlauf heißt: kein Strom **an den Klemmen**. Im Inneren können trotzdem Ströme fließen, zum Beispiel durch einen Spannungsteiler.
- **Ersatzschaltung für das Innere benutzt.** Ströme, Spannungen und Leistungen im Original liest man an der Ersatzschaltung nicht ab. Sie gilt nur von außen.

## Begriffe und Schreibweisen

| Größe | Name | in den Folien | hier im Lexikon |
|---|---|---|---|
| $U_0$ | Leerlaufspannung, Ersatzspannung | $U_0$, bei der realen Quelle auch $U_q$ | $U_0$ |
| $I_K$ | Kurzschlussstrom | $I_K$ | $I_k$ |
| $I_0$ | Quellstrom der Ersatzstromquelle, $I_0 = I_K$ | $I_0$ | $I_q$ |
| $R_i$ | Innenwiderstand, Ersatzwiderstand | $R_i$, bei der Stromquelle $R_{i2}$ | $R_i$ |
| $G_i$ | Innenleitwert, $1/R_i$ | – | – |
| $R_L$ | Lastwiderstand | $R_L$ | $R_L$ |

Gleiche Größen, nur andere Indizes. Im Lexikon stehen auch die Einträge [[Ersatzspannungsquelle|ersatzquelle]] und [[Ersatzstromquelle|ersatzstromquelle]].

## Zum Nachdenken

::: aufgabe Spannungsquelle mit Widerstand parallel
Eine ideale Spannungsquelle $U_q$, parallel dazu ein Widerstand $R$, beides zwischen A und B. Wie sieht die Ersatzquelle aus?
???
$U_0 = U_q$ und $R_i = 0$. Beim Null-Setzen wird $U_q$ zum Draht und schließt $R$ kurz. Der Widerstand ändert an den Klemmen nichts, er belastet nur die Quelle. Für alles außerhalb gilt: Was parallel zu einer idealen Spannungsquelle liegt, darf man weglassen.
:::

::: aufgabe Stromquelle mit Widerstand in Reihe
Eine ideale Stromquelle $I_q$, in Reihe dazu ein Widerstand $R$, zwischen A und B. Was ist die Ersatzquelle?
???
Eine ideale Stromquelle $I_0 = I_q$ mit $R_i \to \infty$. Beim Null-Setzen wird $I_q$ zur Lücke, und das Ohmmeter sieht einen offenen Kreis. Den Strom bestimmt die Quelle allein, $R$ ändert an den Klemmen nichts. Was in Reihe zu einer idealen Stromquelle liegt, darf man für die Außenwelt weglassen. Eine Ersatzspannungsquelle gibt es hier nicht.
:::

::: aufgabe Steile und flache Geraden
Zwei Quellen haben dieselbe Leerlaufspannung. Bei der ersten fällt die Gerade in der Thévenin-Ansicht steil ab, bei der zweiten kaum. Welche taugt als Netzteil?
???
Die zweite. Flach heißt kleines $R_i$: Die Spannung bleibt fast gleich, egal wie viel Strom die Last zieht. Die steile Gerade gehört zu einer Quelle mit großem $R_i$, deren Spannung unter Last stark einbricht. Ein Netzteil soll aber eine möglichst feste Spannung liefern.
:::

::: aufgabe Negativer Innenwiderstand
Du rechnest in einer Schaltung ohne gesteuerte Quellen $R_i = U_0 / I_K$ und bekommst einen negativen Wert. Was ist passiert?
???
Ein Vorzeichen- oder Richtungsfehler. Ohne gesteuerte Quellen ist $R_i$ ein Netz aus gewöhnlichen Widerständen und damit positiv. Prüfe, ob $U_0$ von A nach B und $I_K$ von A über den Draht nach B gezählt sind. Beide müssen zu denselben Zählpfeilen gehören.
:::

::: aufgabe Leistung im Inneren
Kann man an der Ersatzstromquelle ablesen, wie viel Leistung im Original in Wärme umgesetzt wird?
???
Nein. Die Ersatzschaltungen stimmen nur an den Klemmen überein. Im Leerlauf setzt die Ersatzspannungsquelle innen gar nichts um, die Ersatzstromquelle dagegen $I_0^2\,R_i$. Beide können also nicht gleichzeitig das Original beschreiben, und meistens tut es keine. Für die Verluste im Inneren muss man das Original rechnen.
:::

## Checkpoints

::: tipp Checkpoint
- [ ] Ich kann in einem Satz sagen, was eine Ersatzquelle ist und was sie nicht ist.
- [ ] Ich kann begründen, warum die Kennlinie einer linearen Schaltung eine Gerade ist.
- [ ] Ich kann die Thévenin-Gleichung aus einer Masche und die Norton-Gleichung aus einem Knoten herleiten.
- [ ] Ich weiß, was beim Null-Setzen mit Spannungsquellen, Stromquellen und gesteuerten Quellen passiert.
- [ ] Ich kann zwischen Thévenin und Norton umrechnen, mit der richtigen Pfeilrichtung.
- [ ] Ich kenne vier Wege zu $R_i$ und weiß, wann welcher geht.
- [ ] Ich kann eine Kette aus Quellen und Widerständen durch Pendeln vereinfachen.
- [ ] Ich kann erklären, warum die Last bei $R_L = R_i$ die meiste Leistung bekommt und der Wirkungsgrad dann nur 50 % ist.
:::
