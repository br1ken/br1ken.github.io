---
titel: Die Kirchhoffschen Gesetze — Knotenregel und Maschenregel
datum: 2026-10-23
fach: Grundlagen der E-Technik
art: theorie
tags: [Kirchhoff, Knotenregel, Maschenregel, Ladungserhaltung, Netzwerkanalyse]
teaser: Woher die zwei Regeln kommen, wann sie gelten und wie man damit sauber Gleichungen aufstellt. Dazu ein Netzwerk mit zwei Quellen, komplett gelöst, und viele Tipps für die Prüfung.
welle: saege
---

Mit zwei Regeln lässt sich jede Schaltung aus Widerständen, Quellen und anderen Bauteilen berechnen. Die [[Knotenregel]] sagt etwas über Ströme, die [[Maschenregel]] etwas über Spannungen. Zusammen mit den Gleichungen der Bauteile, etwa $U = R \cdot I$, reicht das für jedes Netzwerk.

Diese Notiz folgt dem Stoff aus ET1, Kapitel 1.3.3: Ladungserhaltung, Knotenregel und ihre Erweiterung, Maschenregel. Dazu kommt, warum die Regeln gelten, wie viele Gleichungen man braucht, ein vollständig durchgerechnetes Beispiel und Übungen.

## Auf einen Blick

::: merke Die zwei Regeln
**Knotenregel (KCL, Kirchhoff's Current Law):** In jedem Knoten ist zu jedem Zeitpunkt die Summe der zufließenden Ströme gleich der Summe der abfließenden.

$$\sum I_{\text{zu}} = \sum I_{\text{ab}}$$

**Maschenregel (KVL, Kirchhoff's Voltage Law):** Bei einem vollständigen Umlauf um eine geschlossene Masche ist die Summe aller Spannungen null. Pfeile in Umlaufrichtung zählen plus, Pfeile dagegen minus.

$$\sum_{\text{Masche}} U = 0$$

**Woher sie kommen:** Die Knotenregel folgt aus der Ladungserhaltung, die Maschenregel daraus, dass jeder Punkt ein eindeutiges Potential hat.

**Wie viele Gleichungen:** Bei $k$ Knoten und $z$ Zweigen gibt es $k - 1$ unabhängige Knotengleichungen und $z - k + 1$ unabhängige Maschengleichungen, zusammen genau $z$.
:::

## 1. Ladung geht nicht verloren

Alles beginnt mit einer Erfahrungstatsache: In einem abgeschlossenen System bleibt die Summe aller [[Ladungen|ladung]] konstant. Ladung kann zwar „entstehen“, etwa wenn ein Atom ein Elektron abgibt. Dann entsteht aber immer gleichzeitig genauso viel Ladung mit dem anderen Vorzeichen, hier das positive Ion. Die Summe ändert sich nie.

Für Schaltungen formuliert man das mit einer **Hülle**: einer gedachten, geschlossenen Fläche $A$ um ein Volumen $V$. In der Literatur heißt die Hülle oft $\partial V$, „Rand von $V$“. Die Hülle bekommt einen Orientierungssinn, üblich ist **nach außen**. Dann gilt:

$$I(A, t) = -\frac{\mathrm{d}Q(V, t)}{\mathrm{d}t}$$

In Worten: Der Strom, der insgesamt nach außen durch die Hülle fließt, ist gleich der **Abnahmerate** der eingeschlossenen Ladung. Fließt netto Strom hinaus, muss drinnen Ladung weniger werden. In der Vorlesung steht dafür $\Delta Q / \Delta t$, für kurze Zeitspannen ist das dasselbe.

Bei Leiterbahnen kreuzen nur einzelne Drähte die Hülle. Dann wird aus dem Gesamtstrom eine Summe:

$$\sum I_{\text{ab}} - \sum I_{\text{zu}} = -\frac{\mathrm{d}Q}{\mathrm{d}t}$$

::: tipp Bild im Kopf: der Wassertank
Ein Tank mit mehreren Rohren: Was pro Sekunde hinausfließt minus was hineinfließt, ist genau das, um das der Inhalt pro Sekunde abnimmt. Ladung verhält sich genauso, nur dass der Tank bei einem Knoten praktisch nichts speichern kann.
:::

## 2. Die Knotenregel

Ein **Knoten** ist ein Punkt, an dem mehrere Zweige zusammenkommen. Legt man eine kleine Hülle um ihn, kreuzen nur die Zuleitungen die Hülle.

<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Ein Knoten mit vier Zweigen und einer gestrichelten Hülle. I1 und I2 fließen zu, I3 und I4 fließen ab.">
<defs><marker id="kh-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<circle class="hl" cx="180" cy="100" r="46"/><circle class="m d" cx="180" cy="100" r="46"/>
<path class="s" d="M40 100H320M180 16V184"/>
<circle class="f" cx="180" cy="100" r="4"/>
<path class="s" d="M80 100H112" marker-end="url(#kh-a1)"/>
<path class="s" d="M180 22V48" marker-end="url(#kh-a1)"/>
<path class="s" d="M246 100H278" marker-end="url(#kh-a1)"/>
<path class="s" d="M180 150V176" marker-end="url(#kh-a1)"/>
<text x="92" y="90">I<tspan dy="3" font-size="9">1</tspan></text>
<text x="192" y="38">I<tspan dy="3" font-size="9">2</tspan></text>
<text x="256" y="90">I<tspan dy="3" font-size="9">3</tspan></text>
<text x="192" y="170">I<tspan dy="3" font-size="9">4</tspan></text>
<text class="k" x="230" y="56">HÜLLE</text>
</svg><figcaption>Knoten mit Hülle: Was hineinfließt, muss auch wieder hinaus. Hier gilt I<sub>1</sub> + I<sub>2</sub> = I<sub>3</sub> + I<sub>4</sub>.</figcaption></figure>

Ein Knoten ist nur ein winziges Stück Metall und kann keine nennenswerte Ladung speichern. Damit ist $\frac{\mathrm{d}Q}{\mathrm{d}t} = 0$, und aus der Ladungserhaltung wird die Knotenregel:

$$\sum_{j=1}^{k} I_j = \sum_{j=k+1}^{n} I_j$$

Links stehen die abfließend gezählten Ströme, rechts die zufließend gezählten. Die Knotenregel ist also ein **Sonderfall der Ladungserhaltung**.

Gleichwertig, und oft praktischer: Man zählt **alle** Ströme als abfließend, die zufließenden dann mit Minus. Dann ist einfach

$$\sum_j I_j = 0$$

::: herleitung Warum speichert ein Knoten keine Ladung?
Eine Überschussladung auf einem kleinen Metallstück erzeugt ein starkes elektrisches Feld, das sie sofort wieder wegtreibt. Wie viel ein Knoten speichern könnte, beschreibt seine winzige [[Kapazität|kapazitaet]] gegenüber der Umgebung, typisch im Bereich Pikofarad.

Zahlenbeispiel: $1\,\mathrm{pF}$ bei $1\,\mathrm{V}$ speichert $Q = C\,U = 1\,\mathrm{pC}$. Ein Strom von $1\,\mathrm{mA}$ bewegt diese Ladung in einer Nanosekunde. Bei allem, was langsamer ist als Nanosekunden, ist die Ladung im Knoten also praktisch konstant.

Genau das meint die Voraussetzung in der Vorlesung: In den Schaltverbindungen und Knoten gibt es keine Überschussladung mit **merkbarer Änderungsrate**.
:::

::: info „Zu jedem Zeitpunkt“
Die Knotenregel gilt nicht nur für Gleichstrom, sondern für die **Augenblickswerte** zeitlich veränderlicher Ströme, also auch bei Wechselstrom. Sie gilt auch dann, wenn sich die Ströme schnell ändern, solange der Knoten selbst keine Ladung ansammelt.
:::

### Die Richtung der Pfeile ist frei

Bevor man rechnet, zeichnet man an jeden Zweig einen **Zählpfeil**. Die Richtung ist beliebig. Kommt am Ende ein negativer Wert heraus, fließt der Strom eben andersherum. Das ist kein Fehler, sondern eine Information.

### Knoten dürfen groß sein

Die Hülle muss nicht um einen einzelnen Punkt liegen. Man darf sie um ein ganzes Bauteil oder einen ganzen Schaltungsteil legen. Solange sich drinnen insgesamt keine Ladung ansammelt, gilt die Knotenregel auch für diese große Hülle. Die Vorlesung nennt das die **Erweiterung der Knotenregel**: Sie gilt für jedes konzentrierte Stromkreiselement und für jede Zusammensetzung solcher Elemente.

Ein **konzentriertes Element** ist ein Bauteil, dessen Verhalten vollständig durch die Ströme an seinen Anschlüssen und die Spannungen zwischen den Anschlüssen beschrieben wird. Was im Inneren passiert, interessiert nicht.

- **Zweipol** (z. B. Widerstand): Der Strom, der an einem Ende hineinfließt, fließt am anderen Ende wieder heraus. Durch einen Zweig ohne Abzweig fließt überall derselbe Strom.
- **Dreipol** (z. B. Transistor): Die drei Anschlussströme ergeben zusammen null.

<figure class="dia"><svg viewBox="0 0 360 196" role="img" aria-label="Ein Transistor als Kasten mit den Anschlüssen B, C und E, umgeben von einer gestrichelten Hülle. I_B und I_C fließen hinein, I_E fließt heraus.">
<defs><marker id="kh-a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<ellipse class="hl" cx="180" cy="98" rx="76" ry="62"/><ellipse class="m d" cx="180" cy="98" rx="76" ry="62"/>
<path class="s" d="M40 98H140M180 4V58M180 138V192"/>
<rect class="b" x="140" y="58" width="80" height="80"/>
<text class="k c" x="180" y="102">TRANSISTOR</text>
<text class="c" x="151" y="90">B</text><text class="c" x="180" y="74">C</text><text class="c" x="180" y="130">E</text>
<path class="s" d="M58 98H90" marker-end="url(#kh-a2)"/>
<path class="s" d="M180 8V28" marker-end="url(#kh-a2)"/>
<path class="s" d="M180 166V188" marker-end="url(#kh-a2)"/>
<text x="68" y="88">I<tspan dy="3" font-size="9">B</tspan></text>
<text x="192" y="24">I<tspan dy="3" font-size="9">C</tspan></text>
<text x="192" y="184">I<tspan dy="3" font-size="9">E</tspan></text>
<text class="k" x="262" y="56">HÜLLE</text>
</svg><figcaption>Die Hülle um das ganze Bauteil: I<sub>B</sub> + I<sub>C</sub> = I<sub>E</sub>, ohne dass man wissen muss, was im Transistor passiert.</figcaption></figure>

::: tipp Trick: Hülle um einen großen Teil
Eine Hülle um einen großen Schaltungsteil liefert sofort eine Gleichung zwischen den Strömen, die sie kreuzen. Alle Ströme drinnen fallen heraus. So bekommt man oft in einer Zeile, wofür man sonst mehrere Knotengleichungen addieren müsste. Im Beispiel unten wird das die schnellste Probe.
:::

Damit die Erweiterung gilt, braucht man drei Voraussetzungen:

1. Außerhalb der Elemente fließen Ströme nur in den Verbindungsleitungen.
2. In Knoten und Leitungen ändert sich die Überschussladung nicht.
3. Auch in den Elementen selbst ändert sich die Überschussladung nicht.

::: achtung Wann die Knotenregel scheitert
Legt man die Hülle nur um **eine Platte** eines [[Kondensators|kapazitaet]], fließt Strom hinein, aber keiner heraus. Die Platte lädt sich auf, $\frac{\mathrm{d}Q}{\mathrm{d}t} \neq 0$, und die Knotenregel gilt für diese Hülle nicht.

Legt man die Hülle um den **ganzen Kondensator**, sitzen $+Q$ und $-Q$ beide drinnen. Die Summe bleibt null, und die Knotenregel gilt wieder: Am einen Anschluss fließt genau so viel hinein, wie am anderen herauskommt. Deshalb behandelt man Bauteile immer als Ganzes. Dass trotzdem Strom „durch“ den Kondensator fließt, obwohl die Ladungen den Spalt nicht überqueren, klärt später der Verschiebungsstrom.
:::

## 3. Die Maschenregel

Eine **Masche** ist ein geschlossener Weg durch die Schaltung, der am Ausgangspunkt endet. Jedes Stück des Weges hat eine Spannung. Die Maschenregel sagt: Einmal rundherum ist die Summe aller Spannungen null.

$$\sum_{j=1}^{n} U_j = 0$$

Dabei kommt es auf zwei Richtungen an:

- **Umlaufsinn:** In welche Richtung man die Masche abläuft. Frei wählbar, aber innerhalb einer Masche fest.
- **Bezugssinn** jeder Spannung, also die Richtung ihres Zählpfeils. Zeigt er in Umlaufrichtung, kommt die Spannung mit Plus in die Summe, sonst mit Minus.

### Warum die Summe null ist

Jeder Punkt einer Schaltung hat ein [[Potential]] $\varphi$, so wie jeder Punkt einer Landschaft eine Höhe hat. Eine [[Spannung]] ist eine Potentialdifferenz:

$$U_{AB} = \varphi_A - \varphi_B$$

Läuft man eine Masche A → B → C → D → A ab, heben sich alle Potentiale paarweise weg:

$$\begin{aligned} &U_{AB} + U_{BC} + U_{CD} + U_{DA} \\ &= (\varphi_A - \varphi_B) + (\varphi_B - \varphi_C) \\ &\quad + (\varphi_C - \varphi_D) + (\varphi_D - \varphi_A) = 0 \end{aligned}$$

<figure class="dia"><svg viewBox="0 0 360 222" role="img" aria-label="Potentialverlauf auf einem Rundweg A, B, C, D und zurück zu A. Das Potential fällt von 10 auf 6 und 2 Volt, steigt auf 7 und wieder auf 10 Volt.">
<path class="m d" d="M30 190H344"/>
<path class="s" d="M40 50L115 106L190 162L265 92L340 50"/>
<circle class="f" cx="40" cy="50" r="4"/><circle class="f" cx="115" cy="106" r="4"/><circle class="f" cx="190" cy="162" r="4"/><circle class="f" cx="265" cy="92" r="4"/><circle class="f" cx="340" cy="50" r="4"/>
<text class="c" x="40" y="38">A · 10 V</text>
<text x="108" y="124" text-anchor="end">B · 6 V</text>
<text class="c" x="190" y="182">C · 2 V</text>
<text x="257" y="84" text-anchor="end">D · 7 V</text>
<text x="352" y="38" text-anchor="end">A · 10 V</text>
<text class="k" x="82" y="68">U<tspan dy="3" font-size="8">AB</tspan><tspan dy="-3"> = 4 V</tspan></text>
<text class="k" x="160" y="128">U<tspan dy="3" font-size="8">BC</tspan><tspan dy="-3"> = 4 V</tspan></text>
<text class="k" x="236" y="140">U<tspan dy="3" font-size="8">CD</tspan><tspan dy="-3"> = −5 V</tspan></text>
<text class="k" x="300" y="98">U<tspan dy="3" font-size="8">DA</tspan><tspan dy="-3"> = −3 V</tspan></text>
<text class="k" x="34" y="206">BEZUG 0 V</text>
</svg><figcaption>Ein Rundweg: Wer wieder bei A ankommt, ist auf derselben Höhe wie am Start. Die Summe der Spannungen ist null: 4&nbsp;+&nbsp;4&nbsp;−&nbsp;5&nbsp;−&nbsp;3&nbsp;=&nbsp;0.</figcaption></figure>

Physikalisch heißt das: Trägt man eine Probeladung $Q$ einmal um die Masche herum, verrichtet das elektrische Feld insgesamt keine Arbeit, denn $W = Q \cdot \sum U = 0$. Die Ladung kommt mit derselben Energie an, mit der sie losgelaufen ist.

::: merke
Die Spannung zwischen zwei Punkten hängt nicht vom Weg ab. Das ist die Maschenregel in anderen Worten: Zwei Wege von A nach B bilden zusammen eine Masche.
:::

### Anschlussspannungen und offene Klemmen

Die Vorlesung definiert die Maschenregel über **Anschlussspannungen**: Spannungen zwischen zwei Anschlusspunkten, gemessen entlang einer Linie, die außerhalb der Elemente verläuft. Das hat eine praktische Folge: Eine Masche muss nicht nur über Bauteile laufen. Man darf sie auch über **offene Klemmen** schließen, an denen gar nichts angeschlossen ist, zum Beispiel über eine Ausgangsspannung zwischen zwei Klemmen.

Damit lassen sich unbekannte Spannungen schnell bestimmen: Man sucht eine Masche, in der nur eine Spannung unbekannt ist, und stellt nach ihr um.

### Bezugssinn ändern

Dreht man den Zählpfeil einer Spannung um, wechselt ihr Vorzeichen: $U_{BA} = -U_{AB}$. In der Maschengleichung wird dann aus $+U$ ein $-U$. An der Physik ändert sich nichts, nur an der Buchhaltung.

Beispiel: Aus $U_1 + U_2 + U_3 + U_4 = 0$ wird $U_1 - U_2' + U_3 - U_4' = 0$, wenn man die Pfeile von $U_2$ und $U_4$ umdreht ($U_2' = -U_2$, $U_4' = -U_4$).

### Voraussetzungen

- **Keine Spannung an den Verbindungen:** Leitungen gelten als ideal. Hat eine Leitung einen merklichen Widerstand, zeichnet man ihn als eigenes Bauteil ein.
- **Kein sich änderndes Magnetfeld durch die Masche:** Sonst wird eine Spannung induziert, und die Summe ist nicht mehr null (Induktionsgesetz, kommt später). In Schaltungen aus konzentrierten Elementen steckt das Magnetfeld in den Spulen. Die tauchen als eigene Elemente mit eigener Spannung in der Masche auf, und die Regel gilt wieder.

## 4. Wie viele Gleichungen braucht man?

Ein Netzwerk habe $k$ Knoten und $z$ Zweige. Ein Zweig ist eine Verbindung zwischen zwei Knoten ohne Abzweig, also mit einem einzigen Strom. Unbekannt sind die $z$ Zweigströme.

| Regel | unabhängige Gleichungen |
|:---|:---|
| Knotenregel | $k - 1$ |
| Maschenregel | $z - k + 1$ |
| zusammen | $z$ |

Das passt genau zu den $z$ Unbekannten. Mit $U = R \cdot I$ für jeden Widerstand lassen sich alle Spannungen durch Ströme ausdrücken.

::: herleitung Warum genau so viele?
**Knoten:** Jeder Zweigstrom verlässt genau einen Knoten und kommt in genau einem anderen an. Addiert man alle $k$ Knotengleichungen, taucht jeder Strom einmal mit Plus und einmal mit Minus auf, und es bleibt $0 = 0$. Eine der $k$ Gleichungen folgt also aus den anderen. Es bleiben $k - 1$.

**Maschen:** Man wählt einen **Baum**, also Zweige, die alle $k$ Knoten verbinden, ohne eine Masche zu bilden. Ein Baum hat genau $k - 1$ Zweige. Jeder der übrigen $z - (k - 1)$ Zweige schließt zusammen mit dem Baum genau eine Masche, und diesen Zweig enthält keine andere dieser Maschen. Deshalb sind diese Maschen unabhängig.
:::

::: tipp Unabhängige Maschen finden
Bei einer Schaltung, die sich ohne Kreuzungen zeichnen lässt, nimmt man einfach die **Fenster**, also die kleinsten Maschen. Die sind immer unabhängig. Allgemein gilt: Jede neue Masche muss mindestens einen Zweig enthalten, der in den bisherigen noch nicht vorkam.
:::

## 5. So stellst du die Gleichungen auf

Das Verfahren heißt **Zweigstromanalyse**:

1. **Knoten nummerieren** und einen davon als Bezug wählen, meist die Masse.
2. **Strompfeile** in jeden Zweig zeichnen, Richtung beliebig.
3. **Spannungspfeile:** An Widerständen in Stromrichtung, das ist das Verbraucherzählpfeilsystem. Dann gilt $U = +R \cdot I$. An Spannungsquellen zeigt der Pfeil von $+$ nach $-$.
4. **$k - 1$ Knotengleichungen** aufschreiben.
5. **$z - k + 1$ Maschen** wählen (Fenster), jeweils mit Umlaufsinn, und die Maschengleichungen aufschreiben. Für die Widerstände gleich $R \cdot I$ einsetzen.
6. **Lösen:** Mit den Knotengleichungen Ströme ersetzen, bis nur noch wenige Unbekannte übrig sind.
7. **Proben:** eine Masche, die man nicht benutzt hat, eine Hülle um einen großen Teil, die Leistungsbilanz.
8. **Deuten:** Was bedeutet ein negativer Strom? Welche Quelle gibt Leistung ab, welche nimmt sie auf?

## 6. Beispiel: ein Netzwerk mit zwei Quellen

Eine reale Quelle mit $U_{q1} = 22\,\mathrm{V}$ und Innenwiderstand $R_i = 2\,\Omega$ und eine ideale Quelle mit $U_{q2} = 4\,\mathrm{V}$ speisen gemeinsam vier Widerstände. $R_4$ überbrückt die beiden oberen Widerstände. Das macht die Schaltung zu mehr als einem einfachen Spannungsteiler.

<figure class="dia"><svg viewBox="0 0 360 256" role="img" aria-label="Netzwerk mit vier Knoten 0 bis 3. Links die Quelle U_q1 mit Innenwiderstand R_i von Knoten 0 nach 1. Oben R_1 von 1 nach 2 und R_2 von 2 nach 3, darüber R_4 von 1 nach 3. R_3 von 2 nach 0. Rechts die Quelle U_q2 von 3 nach 0.">
<defs><marker id="kh-a3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M64 104V40H316V104M64 104H316M64 104V232H316V104M190 104V232"/>
<rect class="b" x="56" y="122" width="16" height="36"/>
<rect class="b" x="105" y="96" width="44" height="16"/><rect class="b" x="231" y="96" width="44" height="16"/>
<rect class="b" x="182" y="146" width="16" height="44"/>
<rect class="b" x="168" y="32" width="44" height="16"/>
<circle class="b" cx="64" cy="190" r="14"/><path class="s" d="M64 176V204"/>
<circle class="b" cx="316" cy="168" r="14"/><path class="s" d="M316 154V182"/>
<text class="k" x="46" y="182">+</text><text class="k" x="330" y="160">+</text>
<circle class="f" cx="64" cy="104" r="3"/><circle class="f" cx="190" cy="104" r="3"/><circle class="f" cx="316" cy="104" r="3"/><circle class="f" cx="190" cy="232" r="3"/>
<text class="c" x="50" y="100">1</text><text x="200" y="124">2</text><text class="c" x="330" y="100">3</text><text class="c" x="190" y="250">0</text>
<text class="c" x="127" y="88">R<tspan dy="3" font-size="9">1</tspan><tspan dy="-3"> = 2 Ω</tspan></text>
<text class="c" x="253" y="88">R<tspan dy="3" font-size="9">2</tspan><tspan dy="-3"> = 2 Ω</tspan></text>
<text class="c" x="190" y="24">R<tspan dy="3" font-size="9">4</tspan><tspan dy="-3"> = 4 Ω</tspan></text>
<text class="k" x="206" y="164">R<tspan dy="3" font-size="8">3</tspan></text><text x="206" y="180">3 Ω</text>
<text class="k" x="80" y="136">R<tspan dy="3" font-size="8">i</tspan></text><text x="80" y="152">2 Ω</text>
<path class="s" d="M86 178V202" marker-end="url(#kh-a3)"/>
<text class="k" x="94" y="186">U<tspan dy="3" font-size="8">q1</tspan></text><text x="94" y="202">22 V</text>
<path class="s" d="M294 156V180" marker-end="url(#kh-a3)"/>
<text class="k" x="288" y="164" text-anchor="end">U<tspan dy="3" font-size="8">q2</tspan></text><text x="288" y="180" text-anchor="end">4 V</text>
<path class="s" d="M64 174V162" marker-end="url(#kh-a3)"/>
<text class="k" x="48" y="166" text-anchor="end">I<tspan dy="3" font-size="8">q1</tspan></text>
<path class="s" d="M72 104H96" marker-end="url(#kh-a3)"/><text class="k c" x="84" y="98">I<tspan dy="3" font-size="8">1</tspan></text>
<path class="s" d="M198 104H222" marker-end="url(#kh-a3)"/><text class="k c" x="210" y="98">I<tspan dy="3" font-size="8">2</tspan></text>
<path class="s" d="M190 112V136" marker-end="url(#kh-a3)"/><text class="k" x="180" y="128" text-anchor="end">I<tspan dy="3" font-size="8">3</tspan></text>
<path class="s" d="M96 40H130" marker-end="url(#kh-a3)"/><text class="k c" x="113" y="33">I<tspan dy="3" font-size="8">4</tspan></text>
<path class="s" d="M316 112V136" marker-end="url(#kh-a3)"/><text class="k" x="328" y="130">I<tspan dy="3" font-size="8">q2</tspan></text>
<path class="s" d="M126.8 218.8A14 14 0 1 1 133 226.1" marker-end="url(#kh-a3)"/><text class="k c" x="140" y="218">M1</text>
<path class="s" d="M239.8 218.8A14 14 0 1 1 246 226.1" marker-end="url(#kh-a3)"/><text class="k c" x="253" y="218">M2</text>
<path class="s" d="M176.8 76.8A14 14 0 1 1 183 84.1" marker-end="url(#kh-a3)"/><text class="k c" x="190" y="76">M3</text>
</svg><figcaption>Vier Knoten (0 bis 3) und sechs Zweige. Strompfeile und Umlaufsinn der drei Maschen M1 bis M3 sind frei gewählt, alle Maschen im Uhrzeigersinn.</figcaption></figure>

Gesucht sind alle sechs Zweigströme, die Potentiale der Knoten und die Leistungsbilanz.

### Schritt 1: Zählen

$k = 4$ Knoten und $z = 6$ Zweige. Also braucht man $k - 1 = 3$ Knotengleichungen und $z - k + 1 = 3$ Maschengleichungen. Die drei Fenster M1, M2, M3 sind automatisch unabhängig.

### Schritt 2: Knotengleichungen

Knoten 0 lässt man weg, er wäre die überflüssige vierte Gleichung. Zufließend links, abfließend rechts:

$$\begin{aligned} \text{Knoten 1:} \quad I_{q1} &= I_1 + I_4 \\ \text{Knoten 2:} \quad I_1 &= I_2 + I_3 \\ \text{Knoten 3:} \quad I_2 + I_4 &= I_{q2} \end{aligned}$$

### Schritt 3: Maschengleichungen

Spannungen an den Widerständen zeigen in Stromrichtung, also ist jede $R \cdot I$. Die Quellenspannungen zeigen von $+$ nach $-$, beide nach unten.

**Masche M1** (links): Hinauf durch die Quelle läuft man gegen ihren Pfeil, dann mit dem Strom durch $R_i$, $R_1$ und hinunter durch $R_3$:

$$-U_{q1} + R_i\,I_{q1} + R_1\,I_1 + R_3\,I_3 = 0$$

**Masche M2** (rechts): Hinauf durch $R_3$ gegen den Strom, mit dem Strom durch $R_2$, hinunter durch die Quelle mit ihrem Pfeil:

$$-R_3\,I_3 + R_2\,I_2 + U_{q2} = 0$$

**Masche M3** (oben): Mit dem Strom durch $R_4$, dann zurück durch $R_2$ und $R_1$, beide gegen den Strom:

$$R_4\,I_4 - R_2\,I_2 - R_1\,I_1 = 0$$

### Schritt 4: Lösen

Mit den Knotengleichungen ersetzt man $I_{q1} = I_1 + I_4$ und $I_2 = I_1 - I_3$. Übrig bleiben die Unbekannten $I_1$, $I_3$, $I_4$. Gerechnet wird in Ω, V und A, die Einheiten lässt man in den Zwischenschritten weg:

$$\begin{aligned} \text{M1:} \quad 2(I_1 + I_4) + 2I_1 + 3I_3 &= 22 \\ \text{M2:} \quad -3I_3 + 2(I_1 - I_3) + 4 &= 0 \\ \text{M3:} \quad 4I_4 - 2(I_1 - I_3) - 2I_1 &= 0 \end{aligned}$$

Ausmultipliziert:

$$\begin{aligned} \text{M1:} \quad 4I_1 + 3I_3 + 2I_4 &= 22 \\ \text{M2:} \quad 2I_1 - 5I_3 &= -4 \\ \text{M3:} \quad I_4 &= I_1 - \tfrac{1}{2} I_3 \end{aligned}$$

M3 in M1 eingesetzt:

$$\begin{aligned} 4I_1 + 3I_3 + 2I_1 - I_3 &= 22 \\ \Rightarrow\quad I_3 &= 11 - 3I_1 \end{aligned}$$

Das in M2:

$$\begin{aligned} 2I_1 - 5(11 - 3I_1) &= -4 \\ 17\,I_1 &= 51 \quad\Rightarrow\quad I_1 = 3\,\mathrm{A} \end{aligned}$$

Rückwärts eingesetzt ergeben sich alle anderen:

| Strom | Rechnung | Wert |
|:---|:---|---:|
| $I_1$ | | $3\,\mathrm{A}$ |
| $I_3$ | $11 - 3 \cdot 3$ | $2\,\mathrm{A}$ |
| $I_4$ | $3 - \frac{1}{2} \cdot 2$ | $2\,\mathrm{A}$ |
| $I_2$ | $I_1 - I_3$ | $1\,\mathrm{A}$ |
| $I_{q1}$ | $I_1 + I_4$ | $5\,\mathrm{A}$ |
| $I_{q2}$ | $I_2 + I_4$ | $3\,\mathrm{A}$ |

### Schritt 5: Potentiale

Mit Knoten 0 als Bezug ($\varphi_0 = 0$) folgt jedes Potential aus einem einzigen Spannungsabfall:

$$\begin{aligned} \varphi_3 &= U_{q2} = 4\,\mathrm{V} \\ \varphi_2 &= R_3\,I_3 = 6\,\mathrm{V} \\ \varphi_1 &= U_{q1} - R_i\,I_{q1} = 22 - 10 = 12\,\mathrm{V} \end{aligned}$$

### Schritt 6: Proben

**Masche, die nicht benutzt wurde:** außen herum, über Quelle 1, $R_i$, $R_4$ und Quelle 2:

$$-22 + 2 \cdot 5 + 4 \cdot 2 + 4 = 0 \;\checkmark$$

**Hülle um die Knoten 1, 2 und 3:** Sie kreuzt nur drei Zweige. Hinein fließt $I_{q1}$, hinaus fließen $I_3$ und $I_{q2}$:

$$5\,\mathrm{A} = 2\,\mathrm{A} + 3\,\mathrm{A} \;\checkmark$$

**Spannung zwischen 1 und 3 auf zwei Wegen:** Direkt über $R_4$ sind es $4 \cdot 2 = 8\,\mathrm{V}$. Über $R_1$ und $R_2$ sind es $2 \cdot 3 + 2 \cdot 1 = 8\,\mathrm{V}$ ✓. Die Spannung ist wegunabhängig, wie es die Maschenregel verlangt.

**[[Leistungsbilanz|leistung]]:**

| Element | Leistung |
|:---|---:|
| Quelle 1 gibt ab: $22\,\mathrm{V} \cdot 5\,\mathrm{A}$ | $110\,\mathrm{W}$ |
| $R_i$: $2 \cdot 5^2$ | $50\,\mathrm{W}$ |
| $R_1$: $2 \cdot 3^2$ | $18\,\mathrm{W}$ |
| $R_2$: $2 \cdot 1^2$ | $2\,\mathrm{W}$ |
| $R_3$: $3 \cdot 2^2$ | $12\,\mathrm{W}$ |
| $R_4$: $4 \cdot 2^2$ | $16\,\mathrm{W}$ |
| Quelle 2 nimmt auf: $4\,\mathrm{V} \cdot 3\,\mathrm{A}$ | $12\,\mathrm{W}$ |
| **aufgenommen gesamt** | $\mathbf{110\,W}$ ✓ |

### Schritt 7: Deuten

Der Strom $I_{q2} = 3\,\mathrm{A}$ fließt von oben in den Pluspol von Quelle 2 hinein. Diese Quelle **gibt also keine Leistung ab, sondern nimmt 12 W auf**. Sie verhält sich wie ein Akku, der gerade geladen wird. Das sieht man nur, wenn man die Vorzeichen ernst nimmt. Hätte man vorher angenommen, „Quellen liefern immer“, hätte man den Strompfeil vielleicht andersherum gezeichnet und $I_{q2} = -3\,\mathrm{A}$ erhalten. Die Aussage wäre dieselbe.

## 7. Tipps und Tricks

::: tipp Potentiale statt Spannungen
Gibt man jedem Knoten ein Potential und schreibt jede Spannung als Differenz, ist die Maschenregel automatisch erfüllt. Dann braucht man nur noch die Knotenregel. Im Beispiel ist $\varphi_3 = 4\,\mathrm{V}$ durch die ideale Quelle schon bekannt, es bleiben also nur $\varphi_1$ und $\varphi_2$ unbekannt. Statt sechs Gleichungen sind es zwei. Alle Ströme werden dabei als abfließend gezählt:

**Knoten 1:**

$$\frac{\varphi_1 - 22}{2} + \frac{\varphi_1 - \varphi_2}{2} + \frac{\varphi_1 - 4}{4} = 0$$

**Knoten 2:**

$$\frac{\varphi_2 - \varphi_1}{2} + \frac{\varphi_2 - 4}{2} + \frac{\varphi_2}{3} = 0$$

Mit 4 bzw. 6 durchmultipliziert: $5\varphi_1 - 2\varphi_2 = 48$ und $-3\varphi_1 + 8\varphi_2 = 12$. Daraus folgen $\varphi_1 = 12\,\mathrm{V}$ und $\varphi_2 = 6\,\mathrm{V}$, genau wie oben. Dieses Verfahren heißt **Knotenpotentialverfahren** und kommt in ET1 noch ausführlich.
:::

- **Erst zählen, dann rechnen.** $k - 1$ und $z - k + 1$ aufschreiben, bevor man anfängt. Dann weiß man, wann man fertig ist, und benutzt keine überflüssige Gleichung.
- **Hülle statt vieler Knoten.** Eine große Hülle liefert eine Gleichung, die sonst die Summe mehrerer Knotengleichungen wäre. Ideal als Probe.
- **Maschen um Stromquellen herumlegen.** Eine ideale Stromquelle kennt ihren Strom, aber nicht ihre Spannung. Läuft eine Masche durch sie hindurch, kommt eine neue Unbekannte dazu. Bei einer idealen Spannungsquelle ist es umgekehrt: Die Spannung ist bekannt, der Strom ergibt sich erst aus der Schaltung.
- **Spannung gesucht? Masche suchen.** Wenn eine Spannung zwischen zwei Punkten gefragt ist, nimmt man den Weg mit den wenigsten unbekannten Spannungen. Das darf auch ein Weg über offene Klemmen sein.
- **Negative Ergebnisse stehen lassen.** Ein negativer Strom heißt nur, dass er gegen den Pfeil fließt. Nicht nachträglich Pfeile umdrehen und weiterrechnen, das bringt die Vorzeichen durcheinander.
- **Einheiten am Ende prüfen.** Ω mal A ergibt V, V durch Ω ergibt A. Wer in Ω, V und A rechnet, darf die Einheiten in Zwischenschritten weglassen, muss sie aber am Ergebnis wieder dranschreiben.

## Typische Fehler

::: achtung
- **Umlaufsinn innerhalb einer Masche gewechselt.** Einmal festgelegt, gilt er für die ganze Masche.
- **Vorzeichen in der Maschengleichung falsch.** Es zählt der Spannungspfeil gegen den Umlaufsinn, nicht die Stromrichtung. Bei einem Widerstand fallen beide zusammen, wenn man im Verbraucherzählpfeilsystem zeichnet.
- **$U = R \cdot I$ blind übernommen.** Zeigen Spannungs- und Strompfeil an einem Widerstand in entgegengesetzte Richtungen, gilt $U = -R \cdot I$.
- **Alle $k$ Knotengleichungen benutzt.** Die letzte ist überflüssig. Mit ihr statt einer Maschengleichung fehlt eine Information, und das System ist nicht eindeutig lösbar.
- **Maschen nicht unabhängig.** Zwei Maschen, die zusammen nur eine dritte ergeben, liefern keine neue Information.
- **Zweig mit Knoten verwechselt.** Durch einen Zweig ohne Abzweig fließt überall derselbe Strom. Ein neuer Strom beginnt erst an einem Knoten.
- **$U_{AB}$ und $U_{BA}$ verwechselt.** $U_{AB} = \varphi_A - \varphi_B$, der Pfeil zeigt von A nach B.
- **Spannung an einer Stromquelle als null angenommen.** Sie ist unbekannt und muss mitgerechnet werden.
:::

## Üben

::: aufgabe Vorzeichen am Knoten
An einem Knoten sind vier Ströme eingezeichnet. $I_1 = 2\,\mathrm{A}$ und $I_3 = -1\,\mathrm{A}$ sind zufließend gezählt, $I_2 = 5\,\mathrm{A}$ und $I_4$ abfließend. Wie groß ist $I_4$, und in welche Richtung fließt er wirklich?
???
$$\begin{aligned} I_1 + I_3 &= I_2 + I_4 \\ 2 - 1 &= 5 + I_4 \quad\Rightarrow\quad I_4 = -4\,\mathrm{A} \end{aligned}$$

$I_4$ ist negativ, er fließt also mit $4\,\mathrm{A}$ **in** den Knoten hinein, gegen seinen Pfeil. Probe mit den echten Richtungen: Hinein fließen $2 + 4 = 6\,\mathrm{A}$, hinaus $5 + 1 = 6\,\mathrm{A}$ ✓
:::

::: aufgabe Transistor als Hülle
In einen Transistor fließen $I_B = 20\,\mu\mathrm{A}$ in die Basis und $I_C = 3\,\mathrm{mA}$ in den Kollektor. Wie groß ist der Emitterstrom?
???
Hülle um den ganzen Transistor:

$$I_E = I_B + I_C = 0{,}02\,\mathrm{mA} + 3\,\mathrm{mA} = 3{,}02\,\mathrm{mA}$$

Was im Transistor passiert, muss man dafür nicht wissen.
:::

::: aufgabe Maschengleichung mit gemischten Pfeilen
In einer Masche zeigen $U_1 = 12\,\mathrm{V}$ und $U_3$ in Umlaufrichtung, $U_2 = 5\,\mathrm{V}$ und $U_4 = 3\,\mathrm{V}$ dagegen. Wie groß ist $U_3$?
???
$$\begin{aligned} U_1 - U_2 + U_3 - U_4 &= 0 \\ U_3 &= U_2 + U_4 - U_1 \\ &= 5 + 3 - 12 = -4\,\mathrm{V} \end{aligned}$$

Der Pfeil von $U_3$ zeigt also gegen das echte Gefälle. In Pfeilrichtung steigt das Potential um $4\,\mathrm{V}$.
:::

::: aufgabe Gleichungen zählen
Eine Brückenschaltung besteht aus einer Spannungsquelle und fünf Widerständen: zwei Zweige mit je zwei Widerständen und ein Querwiderstand dazwischen, wie in der Vorlesung oder in [A2.5](beitrag.html?b=ersatzwiderstand-dreieck-stern) mit Quelle. Wie viele Knoten- und Maschengleichungen braucht man?
???
Knoten: die beiden Anschlüsse der Quelle und die zwei Mittelpunkte, also $k = 4$. Zweige: fünf Widerstände und die Quelle, also $z = 6$.

Also braucht man $k - 1 = 3$ Knotengleichungen und $z - k + 1 = 3$ Maschengleichungen, zusammen sechs für die sechs unbekannten Zweigströme.
:::

::: aufgabe Die überflüssige Knotengleichung
Stelle im Beispiel die Knotengleichung für Knoten 0 auf und zeige, dass sie aus den anderen drei folgt.
???
Am Knoten 0 kommen $I_3$ und $I_{q2}$ an, und $I_{q1}$ fließt weg:

$$I_3 + I_{q2} = I_{q1}$$

Bringt man in den drei anderen Gleichungen alles auf eine Seite und addiert:

$$\begin{aligned} &(I_{q1} - I_1 - I_4) + (I_1 - I_2 - I_3) \\ &\quad + (I_2 + I_4 - I_{q2}) = I_{q1} - I_3 - I_{q2} = 0 \end{aligned}$$

Das ist genau die Gleichung für Knoten 0. Sie bringt nichts Neues.
:::

::: aufgabe Die zweite Quelle wird stärker
Rechne das Beispiel noch einmal mit $U_{q2} = 21\,\mathrm{V}$. Welche Ströme ändern ihre Richtung, und welche Quelle gibt jetzt Leistung ab?
???
Am schnellsten mit Potentialen, $\varphi_3 = 21\,\mathrm{V}$:

$$\begin{aligned} \text{Knoten 1:} \quad 5\varphi_1 - 2\varphi_2 &= 44 + 21 = 65 \\ \text{Knoten 2:} \quad -3\varphi_1 + 8\varphi_2 &= 3 \cdot 21 = 63 \end{aligned}$$

Daraus folgen $\varphi_1 = 19\,\mathrm{V}$ und $\varphi_2 = 15\,\mathrm{V}$, und damit die Ströme:

| Strom | Wert |
|:---|---:|
| $I_{q1} = (22 - 19)/2$ | $1{,}5\,\mathrm{A}$ |
| $I_1 = (19 - 15)/2$ | $2\,\mathrm{A}$ |
| $I_2 = (15 - 21)/2$ | $-3\,\mathrm{A}$ |
| $I_3 = 15/3$ | $5\,\mathrm{A}$ |
| $I_4 = (19 - 21)/4$ | $-0{,}5\,\mathrm{A}$ |
| $I_{q2} = I_2 + I_4$ | $-3{,}5\,\mathrm{A}$ |

$I_2$, $I_4$ und $I_{q2}$ sind jetzt negativ. Quelle 2 treibt den Strom nun aus ihrem Pluspol heraus und gibt $21 \cdot 3{,}5 = 73{,}5\,\mathrm{W}$ ab. Quelle 1 liefert $22 \cdot 1{,}5 = 33\,\mathrm{W}$. Probe: Die Widerstände nehmen $4{,}5 + 8 + 18 + 75 + 1 = 106{,}5\,\mathrm{W}$ auf, genau die Summe ✓
:::

::: aufgabe Verständnis: Kondensatorplatte
Warum darf man die Knotenregel nicht auf eine Hülle anwenden, die nur eine Platte eines Kondensators umschließt? Und warum geht es bei einer Hülle um den ganzen Kondensator?
???
Um eine einzelne Platte herum sammelt sich beim Laden Ladung an. Dann ist $\frac{\mathrm{d}Q}{\mathrm{d}t} \neq 0$, und der zufließende Strom ist nicht gleich dem abfließenden, dort fließt gar keiner ab.

Um den ganzen Kondensator herum ändern sich $+Q$ und $-Q$ gleichzeitig und gleich stark. Die eingeschlossene Gesamtladung bleibt null, also gilt die Knotenregel: Was am einen Anschluss hineinfließt, kommt am anderen heraus.
:::
