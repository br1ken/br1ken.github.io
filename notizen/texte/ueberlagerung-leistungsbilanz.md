---
titel: Überlagerungsprinzip und Leistungsbilanz — wer liefert hier wem Energie?
datum: 2026-10-25
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.1
tags: [Überlagerung, Superposition, Leistungsbilanz, Zählpfeilsysteme, Ideale Quellen, Maschenregel]
teaser: Aufgabe 3.1: Spannungsquelle, Stromquelle und Widerstand in Reihe. Mit dem Überlagerungsprinzip liegen an der Stromquelle 5 V — und die Leistungsbilanz zeigt, dass die Spannungsquelle hier keine Energie liefert, sondern geladen wird.
welle: lade
---

Zwei Quellen in einem Stromkreis: Arbeiten sie zusammen oder gegeneinander? Das [[Überlagerungsprinzip|ueberlagerung]] zerlegt die Frage in zwei einfache: Was macht jede Quelle allein? Die Teilergebnisse addiert man, fertig. Danach kommt die eigentliche Pointe der Aufgabe: Die Leistungsbilanz zeigt, dass eine Quelle keine Energie liefern muss. Hier **nimmt** die Spannungsquelle Leistung auf.

Wer Maschenregel und Zählpfeile auffrischen will: [Die Kirchhoffschen Gesetze](beitrag.html?b=kirchhoffsche-gesetze).

## Die Aufgabe

Ein Widerstand liegt in Reihe mit einer Strom- und einer Spannungsquelle.

1. Berechne die Spannungen im Netzwerk mit dem Überlagerungsprinzip.
2. Stelle eine Leistungsbilanz auf: Welche Elemente nehmen Leistung auf, welche geben sie ab?

| Größe | Wert |
|:---|---:|
| Widerstand $R$ | $1\,\Omega$ |
| Quellenspannung $U_q$ | $3\,\mathrm{V}$ |
| Quellenstrom $I_q$ | $2\,\mathrm{A}$ |

<figure class="dia"><svg viewBox="0 0 380 220" role="img" aria-label="Bild 1: Reihenschaltung. Links die Spannungsquelle U_q = 3 V mit Zählpfeil nach unten, oben der Widerstand R = 1 Ohm mit Zählpfeil U_R nach links, rechts die Stromquelle I_q = 2 A mit Strompfeil nach oben und Zählpfeil U_Iq nach unten.">
<defs><marker id="ue-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M100 50H280V190H100Z"/>
<rect class="b" x="168" y="42" width="44" height="16"/>
<circle class="b" cx="100" cy="120" r="16"/><path class="s" d="M100 104V136"/>
<circle class="b" cx="280" cy="120" r="16"/><path class="s" d="M280 132V110" marker-end="url(#ue-a1)"/>
<text class="c" x="190" y="30">R = 1 Ω</text>
<path class="s" d="M212 76H170" marker-end="url(#ue-a1)"/>
<text class="c" x="190" y="96">U<tspan dy="3" font-size="9">R</tspan></text>
<path class="s" d="M68 104V136" marker-end="url(#ue-a1)"/>
<text x="60" y="116" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text><text x="60" y="134" text-anchor="end">3 V</text>
<text x="256" y="116" text-anchor="end">I<tspan dy="3" font-size="9">q</tspan></text><text x="256" y="134" text-anchor="end">2 A</text>
<path class="s" d="M312 104V136" marker-end="url(#ue-a1)"/>
<text x="320" y="124">U<tspan dy="3" font-size="9">Iq</tspan></text>
</svg><figcaption>Bild 1: die Schaltung mit allen Zählpfeilen aus der Angabe. Ein Spannungspfeil zeigt von + nach −: Der obere Anschluss der Spannungsquelle liegt 3 V über dem unteren.</figcaption></figure>

**Gesucht:** die Spannungen $U_R$ und $U_{Iq}$, der Strom $I$ und die Leistungen aller drei Elemente.

## Vorab: Was ideale Quellen versprechen

Zwei Sätze aus den Folien, die die ganze Aufgabe tragen:

- Eine **ideale Spannungsquelle** hält ihre Spannung, egal welcher Strom fließt. Den Strom bestimmt die Schaltung.
- Eine **ideale Stromquelle** hält ihren Strom, egal welche Spannung dafür nötig ist. Die Spannung bestimmt die Schaltung.

Hier liegt alles in Reihe, also fließt überall derselbe Strom, und die Stromquelle legt ihn fest:

$$I = I_q = 2\,\mathrm{A}$$

Das gilt, egal wie groß $U_q$ oder $R$ sind. Offen ist nur, welche Spannung sich an der Stromquelle einstellt. Genau diese Spannung berechnen wir mit dem Überlagerungsprinzip. Mehr zu idealen und realen Quellen steht im Lexikon unter [[ideale Quellen|quelle]].

## Das Überlagerungsprinzip

### Die Idee

In einem linearen Netz wirkt jede Quelle so, als wären die anderen nicht da. Jede erzeugt ihre eigene Verteilung von Strömen und Spannungen. Die tatsächliche Verteilung ist die Summe dieser Teilverteilungen.

### Warum das stimmt, an genau dieser Schaltung

Für diese Schaltung reichen zwei Gleichungen mit den Unbekannten $I$ und $U_{Iq}$. Die Stromquelle gibt den Strom vor, die [[Maschenregel|maschenregel]] im Uhrzeigersinn liefert die zweite Gleichung (die Vorzeichen leiten wir in Teilschaltung (a) genau her):

$$\begin{aligned} I &= I_q \\ -U_q - R\,I + U_{Iq} &= 0 \end{aligned} \qquad\Longleftrightarrow\qquad \begin{pmatrix} 1 & 0 \\ -R & 1 \end{pmatrix} \begin{pmatrix} I \\ U_{Iq} \end{pmatrix} = \begin{pmatrix} I_q \\ U_q \end{pmatrix}$$

Links steht nur die Schaltung (Verbindungen und Widerstände), rechts stehen nur die Quellen. Die Lösung:

$$I = I_q, \qquad U_{Iq} = \underbrace{1 \cdot U_q}_{\text{nur } U_q} + \underbrace{R \cdot I_q}_{\text{nur } I_q} = 3\,\mathrm{V} + 2\,\mathrm{V}$$

Jede Quelle steht in ihrem eigenen Summanden. Diese beiden Summanden liefern gleich die zwei Teilschaltungen. Allgemein gilt dasselbe für jedes lineare Netz: Aus Kirchhoff und Ohm wird ein Gleichungssystem $A\,\vec{x} = \vec{b}$, und die Lösung $\vec{x} = A^{-1}\vec{b}$ hängt linear von den Quellen in $\vec{b}$ ab. Ist $\vec{b} = \vec{b}_1 + \vec{b}_2$, dann ist $\vec{x} = A^{-1}\vec{b}_1 + A^{-1}\vec{b}_2$.

### Die Regeln

::: merke Überlagerungsprinzip
1. Nur eine Quelle aktiv lassen, alle anderen abschalten.
2. Abgeschaltete **Spannungsquelle → Kurzschluss** ($U = 0$). Abgeschaltete **Stromquelle → Leerlauf** ($I = 0$).
3. Die Zählpfeile des Originals in jeder Teilschaltung beibehalten.
4. Die Teilergebnisse vorzeichenrichtig addieren: $x = x^{(a)} + x^{(b)}$.

Voraussetzung: lineare Bauelemente. **Leistungen darf man nicht überlagern.**
:::

Warum ausgerechnet Kurzschluss und Leerlauf? „Abschalten“ heißt nicht herausnehmen, sondern auf null stellen. Eine Spannungsquelle mit $U_q = 0$ hält zwischen ihren Klemmen null Volt, egal welcher Strom fließt. Genau das macht ein Draht. Eine Stromquelle mit $I_q = 0$ lässt keinen Strom durch, egal welche Spannung anliegt. Genau das macht eine Unterbrechung.

### Das Rezept für jede Teilschaltung

1. **Strom:** zuerst den Strom auf dem geschlossenen Weg bestimmen.
2. **Ohm:** dann die Spannung an jedem Widerstand mit $U = R \cdot I$, und zwar nur am Widerstand selbst.
3. **Masche:** den Rest aus dem Maschenumlauf. Ein Pfeil in Laufrichtung zählt $+$, gegen die Laufrichtung $-$, die Summe ist null.

## Teilschaltung (a): nur $U_q$ aktiv

Die Stromquelle wird abgeschaltet, also durch einen Leerlauf ersetzt.

<figure class="dia"><svg viewBox="0 0 380 220" role="img" aria-label="Bild 2: Teilschaltung a. Die Stromquelle ist durch zwei offene Klemmen ersetzt. Spannungsquelle, Widerstand und alle Zählpfeile bleiben wie im Original. In der Mitte ein gestrichelter Umlaufpfeil im Uhrzeigersinn.">
<defs><marker id="ue-a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ue-m2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<path class="s" d="M280 96V50H100V190H280V144"/>
<rect class="b" x="168" y="42" width="44" height="16"/>
<circle class="b" cx="100" cy="120" r="16"/><path class="s" d="M100 104V136"/>
<circle class="b" cx="280" cy="96" r="3.5"/><circle class="b" cx="280" cy="144" r="3.5"/>
<text class="c" x="190" y="30">R = 1 Ω</text>
<path class="s" d="M212 76H170" marker-end="url(#ue-a2)"/>
<text class="c" x="190" y="96">U<tspan dy="3" font-size="9">R</tspan><tspan dy="-10" font-size="9">(a)</tspan></text>
<path class="s" d="M68 104V136" marker-end="url(#ue-a2)"/>
<text x="60" y="116" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text><text x="60" y="134" text-anchor="end">3 V</text>
<path class="s" d="M312 104V136" marker-end="url(#ue-a2)"/>
<text x="320" y="124">U<tspan dy="3" font-size="9">Iq</tspan><tspan dy="-10" font-size="9">(a)</tspan></text>
<text class="k" x="292" y="174">LEERLAUF</text>
<path class="m d" d="M190 112A20 20 0 1 1 170 132" marker-end="url(#ue-m2)"/>
<text class="k c" x="190" y="170">UMLAUF</text>
</svg><figcaption>Bild 2: Teilschaltung (a). Die Stromquelle ist ein Leerlauf, die Zählpfeile bleiben wie im Original. Der gestrichelte Pfeil zeigt die Umlaufrichtung für die Masche.</figcaption></figure>

**1. Strom.** Durch einen Leerlauf fließt kein Strom. Weil alles in Reihe liegt, gilt das im ganzen Kreis:

$$I^{(a)} = 0$$

**2. Ohm.**

$$U_R^{(a)} = R \cdot I^{(a)} = 1\,\Omega \cdot 0 = 0\,\mathrm{V}$$

**3. Masche.** Umlauf im Uhrzeigersinn, Start links unten. Jeden Pfeil einzeln mit der Laufrichtung vergleichen:

| Abschnitt | Laufrichtung | Pfeil | Beitrag |
|:---|:---|:---|---:|
| links | nach oben | $U_q$ zeigt nach unten | $-U_q$ |
| oben | nach rechts | $U_R$ zeigt nach links | $-U_R^{(a)}$ |
| rechts | nach unten | $U_{Iq}$ zeigt nach unten | $+U_{Iq}^{(a)}$ |
| unten | nach links | kein Element | — |

$$-U_q - U_R^{(a)} + U_{Iq}^{(a)} = 0 \quad\Rightarrow\quad U_{Iq}^{(a)} = U_q + U_R^{(a)} = 3\,\mathrm{V} + 0\,\mathrm{V} = 3\,\mathrm{V}$$

Ein Leerlauf ist also kein Ort ohne Spannung, im Gegenteil: Weil kein Strom fließt, fällt an $R$ nichts ab, und die ganze Quellenspannung liegt an der offenen Stelle. Das ist dieselbe Situation wie beim Messen einer Batterie mit einem Voltmeter.

**Ergebnis (a):** $I^{(a)} = 0$, $\;U_R^{(a)} = 0\,\mathrm{V}$, $\;U_{Iq}^{(a)} = 3\,\mathrm{V}$

## Teilschaltung (b): nur $I_q$ aktiv

Jetzt wird die Spannungsquelle abgeschaltet, also durch einen Kurzschluss ersetzt.

<figure class="dia"><svg viewBox="0 0 380 220" role="img" aria-label="Bild 3: Teilschaltung b. Die Spannungsquelle ist durch einen Draht ersetzt. Die Stromquelle treibt 2 A gegen den Uhrzeigersinn: rechts hinauf, oben nach links durch R, links hinunter.">
<defs><marker id="ue-a3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M100 50H280V190H100Z"/>
<rect class="b" x="168" y="42" width="44" height="16"/>
<circle class="b" cx="280" cy="120" r="16"/><path class="s" d="M280 132V110" marker-end="url(#ue-a3)"/>
<text class="c" x="190" y="30">R = 1 Ω</text>
<path class="s" d="M212 76H170" marker-end="url(#ue-a3)"/>
<text class="c" x="190" y="96">U<tspan dy="3" font-size="9">R</tspan><tspan dy="-10" font-size="9">(b)</tspan></text>
<text x="88" y="114" text-anchor="end">Kurzschluss</text><text x="88" y="132" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan><tspan dy="-3"> → 0</tspan></text>
<text x="256" y="116" text-anchor="end">I<tspan dy="3" font-size="9">q</tspan></text><text x="256" y="134" text-anchor="end">2 A</text>
<path class="s" d="M312 104V136" marker-end="url(#ue-a3)"/>
<text x="320" y="124">U<tspan dy="3" font-size="9">Iq</tspan><tspan dy="-10" font-size="9">(b)</tspan></text>
<path class="a" d="M246 50l9-5v10z"/><path class="a" d="M100 156l-5-9h10z"/><path class="a" d="M196 190l-9-5v10z"/>
<text x="234" y="38">I<tspan dy="-6" font-size="9">(b)</tspan><tspan dy="6"> = 2 A</tspan></text>
</svg><figcaption>Bild 3: Teilschaltung (b). Die Spannungsquelle ist ein Draht. Die gelben Pfeile zeigen den Strom: gegen den Uhrzeigersinn, durch R also von rechts nach links.</figcaption></figure>

**1. Strom.** Die ideale Stromquelle erzwingt ihren Strom im ganzen Kreis:

$$I^{(b)} = I_q = 2\,\mathrm{A}$$

Er fließt rechts hinauf, oben nach links durch $R$ und links durch den Kurzschluss hinunter. Durch $R$ fließt er also in Richtung des $U_R$-Pfeils.

**2. Ohm.**

$$U_R^{(b)} = R \cdot I^{(b)} = 1\,\Omega \cdot 2\,\mathrm{A} = 2\,\mathrm{V}$$

::: achtung Vorzeichen beim ohmschen Gesetz
$U = R \cdot I$ mit Pluszeichen gilt nur, wenn Strom und Spannungspfeil am Widerstand **gleich** gerichtet sind (Verbraucherzählpfeilsystem). Zeigen sie gegeneinander, ist $U = -R \cdot I$. Hier zeigen beide nach links, also $+$.
:::

**3. Masche.** Derselbe Umlauf wie in (a), nur ist jetzt $U_q = 0$:

$$-0 - U_R^{(b)} + U_{Iq}^{(b)} = 0 \quad\Rightarrow\quad U_{Iq}^{(b)} = U_R^{(b)} = 2\,\mathrm{V}$$

**Ergebnis (b):** $I^{(b)} = 2\,\mathrm{A}$, $\;U_R^{(b)} = 2\,\mathrm{V}$, $\;U_{Iq}^{(b)} = 2\,\mathrm{V}$

## Überlagerung: (a) + (b)

| Größe | (a) nur $U_q$ | (b) nur $I_q$ | Summe |
|:---|---:|---:|---:|
| Strom $I$ | $0$ | $2\,\mathrm{A}$ | $\mathbf{2\,A}$ |
| $U_R$ | $0\,\mathrm{V}$ | $2\,\mathrm{V}$ | $\mathbf{2\,V}$ |
| $U_{Iq}$ | $3\,\mathrm{V}$ | $2\,\mathrm{V}$ | $\mathbf{5\,V}$ |
| $U_q$ | $3\,\mathrm{V}$ | kurzgeschlossen | $3\,\mathrm{V}$ (vorgegeben) |

$$U_{Iq} = U_{Iq}^{(a)} + U_{Iq}^{(b)} = 3\,\mathrm{V} + 2\,\mathrm{V} = 5\,\mathrm{V}$$

**Probe** mit der Masche im Original:

$$-U_q - U_R + U_{Iq} = -3\,\mathrm{V} - 2\,\mathrm{V} + 5\,\mathrm{V} = 0 \;\checkmark$$

Hier ist die Schaltung zum Mitspielen. Die Tabelle rechnet beide Teilschaltungen und die Summe mit, darunter steht die Leistungsbilanz.

::: sim ueberlagerung u=3 i=2 r=1
Oben zwischen (a), (b) und beiden umschalten: Die Zählpfeile bleiben, nur die abgeschaltete Quelle wird zu Leerlauf oder Draht. Dann $U_q$ negativ machen und zusehen, wer plötzlich liefert.
:::

## Leistungsbilanz

Jetzt die zweite Teilaufgabe. Zuerst die Regeln:

::: merke Zählpfeilsysteme
- **VZS** (Verbraucherzählpfeilsystem): Spannungs- und Strompfeil zeigen am Element in **dieselbe** Richtung. Dann ist $P = U \cdot I$ die **aufgenommene** Leistung.
- **EZS** (Erzeugerzählpfeilsystem): Die Pfeile zeigen **gegeneinander**. Dann ist $P = U \cdot I$ die **abgegebene** Leistung.
- Ein negatives Ergebnis heißt jeweils: in Wirklichkeit umgekehrt.
- Immer mit den Gesamtwerten rechnen, nie mit den Teilergebnissen.
:::

Mehr dazu im Lexikon unter [[Zählpfeilsysteme|zaehlpfeile]]. Der Strom $I = 2\,\mathrm{A}$ fließt gegen den Uhrzeigersinn: rechts hinauf, oben nach links, links hinunter. Damit ergibt sich an jedem Element:

| Element | Spannungspfeil | Strom | System | Leistung |
|:---|:---|:---|:---:|---:|
| $R$ | $U_R$ nach links | nach links | VZS | $2\,\mathrm{V} \cdot 2\,\mathrm{A} = 4\,\mathrm{W}$ aufgenommen |
| $U_q$ | nach unten | nach unten | VZS | $3\,\mathrm{V} \cdot 2\,\mathrm{A} = 6\,\mathrm{W}$ aufgenommen |
| $I_q$ | $U_{Iq}$ nach unten | nach oben | EZS | $5\,\mathrm{V} \cdot 2\,\mathrm{A} = 10\,\mathrm{W}$ abgegeben |

$$P_\text{ab} = P_{Iq} = 10\,\mathrm{W} \qquad P_\text{auf} = P_R + P_{U_q} = 4\,\mathrm{W} + 6\,\mathrm{W} = 10\,\mathrm{W} \;\checkmark$$

<figure class="dia"><svg viewBox="0 0 380 124" role="img" aria-label="Bild 4: Energiefluss. Ein Balken für die 10 W der Stromquelle teilt sich in 4 W, die im Widerstand zu Wärme werden, und 6 W, die in die Spannungsquelle fließen.">
<rect class="a" x="40" y="14" width="300" height="28"/>
<text class="ai c" x="190" y="33">Stromquelle gibt 10 W ab</text>
<path class="m d" d="M40 42V62M160 42V62M340 42V62"/>
<rect class="b" x="40" y="62" width="120" height="28"/><rect class="b" x="160" y="62" width="180" height="28"/>
<text class="c" x="100" y="81">R: 4 W</text><text class="c" x="250" y="81">U<tspan dy="3" font-size="9">q</tspan><tspan dy="-3">: 6 W</tspan></text>
<text class="k c" x="100" y="110">WÄRME</text><text class="k c" x="250" y="110">IN DIE SPANNUNGSQUELLE</text>
</svg><figcaption>Bild 4: wohin die 10 W gehen. Die Breiten sind maßstäblich.</figcaption></figure>

## Die Überraschung: Eine Quelle nimmt Leistung auf

Die Spannungsquelle heißt Quelle und liefert trotzdem nichts. Sie nimmt $6\,\mathrm{W}$ auf. Am klarsten sieht man das mit [[Potentialen|potential]]: Der untere Draht liegt bei $0\,\mathrm{V}$, der linke obere Knoten bei $3\,\mathrm{V}$ ($U_q$), der rechte obere bei $5\,\mathrm{V}$ ($U_{Iq}$). Jetzt folgt man einer Ladung auf ihrem Weg:

<figure class="dia"><svg viewBox="0 0 380 230" role="img" aria-label="Bild 5: Potential entlang des Stromwegs. Von 0 V springt es in der Stromquelle auf 5 V, fällt im Widerstand auf 3 V und in der Spannungsquelle auf 0 V zurück.">
<path class="m d" d="M54 50H346M54 102H346"/>
<path class="m" d="M54 180H346M54 30V180"/>
<path class="hl" d="M150 50L260 102V180H150Z"/>
<path class="s" d="M70 180H110V50H150L260 102H300V180H340" style="stroke-width:2.6"/>
<text x="46" y="54" text-anchor="end">5 V</text><text x="46" y="106" text-anchor="end">3 V</text><text x="46" y="184" text-anchor="end">0 V</text>
<text x="118" y="118">+5 V</text><text class="k" x="118" y="134">GEHOBEN</text>
<text x="212" y="66">−2 V</text><text class="k" x="212" y="140">WÄRME IN R</text>
<text x="306" y="146">−3 V</text><text class="k" x="306" y="162">GELADEN</text>
<text class="k c" x="70" y="200">UNTEN</text><text class="k c" x="110" y="214">STROMQUELLE</text><text class="k c" x="205" y="200">R</text><text class="k c" x="300" y="214">SPANNUNGSQ.</text><text class="k c" x="340" y="200">UNTEN</text>
</svg><figcaption>Bild 5: das Potential entlang des Stromwegs, unten = 0 V. Nur in der Stromquelle geht es bergauf.</figcaption></figure>

- **Stromquelle:** Die Ladung kommt unten mit $0\,\mathrm{V}$ an und verlässt sie oben mit $5\,\mathrm{V}$. Sie wird bergauf gehoben. Das kann nur ein Element, das Energie hineinsteckt, also eine Quelle im eigentlichen Sinn.
- **Widerstand:** Die Ladung fällt von $5\,\mathrm{V}$ auf $3\,\mathrm{V}$. Die Energie wird zu Wärme.
- **Spannungsquelle:** Die Ladung fällt von $+$ ($3\,\mathrm{V}$) nach $-$ ($0\,\mathrm{V}$), sie läuft **bergab** durch die Quelle. Genau so verhält sich ein Verbraucher.

Pro Ladung ausgedrückt: Jedes Coulomb bekommt in der Stromquelle $5\,\mathrm{J}$, gibt $2\,\mathrm{J}$ an den Widerstand und $3\,\mathrm{J}$ an die Spannungsquelle ab. Bei $2\,\mathrm{A}$ fließen zwei Coulomb pro Sekunde, das ergibt $10\,\mathrm{W}$, $4\,\mathrm{W}$ und $6\,\mathrm{W}$. Wer das Bild „Potential als Höhe“ noch einmal von Grund auf sehen will: [Von Newton bis Ohm](beitrag.html?b=von-newton-zu-ohm).

::: tipp So sieht das in echt aus
Ein Ladegerät lädt einen Akku mit konstantem Strom: Das Ladegerät ist die Stromquelle, der Akku die Spannungsquelle, $R$ der Widerstand von Leitung und Akku. Das Ladegerät muss $3\,\mathrm{V} + 2\,\mathrm{V} = 5\,\mathrm{V}$ aufbringen. Von den $10\,\mathrm{W}$ landen $6\,\mathrm{W}$ im Akku, $4\,\mathrm{W}$ werden warm. Das entspricht einem [[Wirkungsgrad|wirkungsgrad]] von $60\,\%$.
:::

::: merke
Ob ein Element Leistung abgibt oder aufnimmt, entscheidet die Schaltung, nicht der Name auf dem Bauteil.
:::

## Warum man Leistungen nicht überlagern darf

Leistung ist ein Produkt aus Spannung und Strom, und beide sind Summen. Für die Stromquelle:

$$P_{Iq} = \left(U_{Iq}^{(a)} + U_{Iq}^{(b)}\right)\left(I^{(a)} + I^{(b)}\right) = \underbrace{U_{Iq}^{(a)} I^{(a)}}_{0\,\mathrm{W}} + \underbrace{U_{Iq}^{(b)} I^{(b)}}_{4\,\mathrm{W}} + \underbrace{U_{Iq}^{(a)} I^{(b)}}_{6\,\mathrm{W}} + \underbrace{U_{Iq}^{(b)} I^{(a)}}_{0\,\mathrm{W}} = 10\,\mathrm{W}$$

Wer die Teilleistungen addiert, bekommt nur $0\,\mathrm{W} + 4\,\mathrm{W} = 4\,\mathrm{W}$. Es fehlt der **Kreuzterm** $U_{Iq}^{(a)} \cdot I^{(b)} = 6\,\mathrm{W}$: die Spannung aus der einen Teilschaltung mal den Strom aus der anderen. Bei der Spannungsquelle ist es noch deutlicher. In (a) fließt kein Strom, in (b) ist sie kurzgeschlossen, beide Teilleistungen sind null. Tatsächlich nimmt sie $6\,\mathrm{W}$ auf.

Beim Widerstand stimmt die Summe der Teilleistungen hier zufällig: $0\,\mathrm{W} + 4\,\mathrm{W} = 4\,\mathrm{W}$. Das liegt nur an $I^{(a)} = 0$. Allgemein ist

$$P_R = R\left(I^{(a)} + I^{(b)}\right)^2 = R\,{I^{(a)}}^2 + R\,{I^{(b)}}^2 + 2R\,I^{(a)} I^{(b)}$$

und der letzte Summand verschwindet nur, wenn eine der beiden Quellen keinen Strom durch $R$ treibt.

## Probe ohne Überlagerung

Hier geht es auch direkt, mit dem Gedanken vom Anfang: Die Stromquelle legt $I = 2\,\mathrm{A}$ fest, also $U_R = R \cdot I = 2\,\mathrm{V}$, und die Masche liefert

$$U_{Iq} = U_q + U_R = 3\,\mathrm{V} + 2\,\mathrm{V} = 5\,\mathrm{V} \;\checkmark$$

Der direkte Weg ist bei dieser kleinen Schaltung kürzer. Die Aufgabe übt aber das Verfahren, das auch in großen Netzen mit vielen Quellen funktioniert. Dort ist eine Quelle nach der anderen oft viel einfacher als alles auf einmal.

## Im Messplatz nachmessen

Im [Messplatz](../messplatz/) gibt es ideale Spannungs- und Stromquellen. Mit $1\,\Omega$ und $2\,\mathrm{A}$ würde der Widerstand dort durchbrennen ($4\,\mathrm{W}$ an einem $0{,}25$-W-Widerstand). Darum ist der Aufbau mit $R = 100\,\Omega$ und $I_q = 20\,\mathrm{mA}$ vorbereitet: dieselben Spannungen, alle Leistungen durch 100.

[Aufbau A3.1 im Messplatz öffnen ↗︎](../messplatz/#aufbau=eyJwYXJ0cyI6W3siaWQiOiJwMSIsInR5cGUiOiJWIiwieCI6MzAwLCJ5IjoyNjAsInJvdCI6MSwicCI6eyJWIjozfSwicmVmIjoiVTEifSx7ImlkIjoicDIiLCJ0eXBlIjoiUiIsIngiOjQ0MCwieSI6MTgwLCJyb3QiOjIsInAiOnsiUiI6MTAwfSwicmVmIjoiUjEifSx7ImlkIjoicDMiLCJ0eXBlIjoiSSIsIngiOjYyMCwieSI6MjYwLCJyb3QiOjMsInAiOnsiSSI6MC4wMn0sInJlZiI6IkkxIn0seyJpZCI6InA0IiwidHlwZSI6IkdORCIsIngiOjQ2MCwieSI6NDIwLCJyb3QiOjAsInAiOnt9fV0sIndpcmVzIjpbeyJhIjoicDE6MCIsImIiOiJwMjoxIn0seyJhIjoicDI6MCIsImIiOiJwMzoxIn0seyJhIjoicDM6MCIsImIiOiJwMToxIn0seyJhIjoicDE6MSIsImIiOiJwNDowIn0seyJhIjoiZG1tOjAiLCJiIjoicDI6MCJ9LHsiYSI6ImRtbToxIiwiYiI6InAyOjEifSx7ImEiOiJkbW0yOjAiLCJiIjoicDM6MSJ9LHsiYSI6ImRtbTI6MSIsImIiOiJwMzowIn1dLCJmZyI6eyJvbiI6ZmFsc2V9LCJwc3UiOnsib24iOmZhbHNlfSwiZG1tIjp7Im1vZGUiOiJWREMifSwiZG1tMiI6eyJtb2RlIjoiVkRDIn19)

Was du dort siehst:

- **Multimeter 1** misst $U_R$ und zeigt $2{,}000\,\mathrm{V}$, **Multimeter 2** misst $U_{Iq}$ und zeigt $5{,}000\,\mathrm{V}$.
- Ein Klick auf **U1** (die Spannungsquelle): „P abgegeben = −60 mW“. Negativ abgegeben heißt aufgenommen, $3\,\mathrm{V} \cdot 20\,\mathrm{mA}$.
- **I1** gibt $100\,\mathrm{mW}$ ab, **R1** setzt $40\,\mathrm{mW}$ um. Der Inspektor zählt die Spannung der Stromquelle von Anschluss 1 nach 2, also gegen den Pfeil der Angabe, darum steht dort $-5\,\mathrm{V}$.
- Stell U1 auf $-3\,\mathrm{V}$ und schau, wer jetzt liefert. Das ist die erste Aufgabe unten.

## Typische Fehler

::: achtung Fünf Klassiker
- **$I^{(a)} = U_q/R = 3\,\mathrm{A}$:** falsch. In (a) ist die Stromquelle ein Leerlauf, es fließt kein Strom. $U_q/R$ wäre nur richtig, wenn rechts ein Kurzschluss säße.
- **Spannungsquelle in (b) einfach herausnehmen:** Dann wäre der Kreis offen, und die Stromquelle könnte ihren Strom nicht treiben. Abschalten heißt auf null stellen, also Draht.
- **Zählpfeile in den Teilschaltungen umdrehen:** Sie bleiben wie im Original, sonst passen die Teilergebnisse nicht zusammen.
- **Vorzeichen in der Masche raten:** jeden Pfeil einzeln mit der Laufrichtung vergleichen, wie in der Tabelle bei (a).
- **Leistungen überlagern:** erst $U$ und $I$ addieren, dann $P = U \cdot I$.
:::

## Ergebnis

| Größe | Wert |
|:---|---:|
| Strom $I$ (gegen den Uhrzeigersinn) | $2\,\mathrm{A}$ |
| Spannung am Widerstand $U_R$ | $2\,\mathrm{V}$ |
| Spannung an der Stromquelle $U_{Iq}$ | $5\,\mathrm{V}$ |
| $P_R$ | $4\,\mathrm{W}$ aufgenommen |
| $P_{U_q}$ | $6\,\mathrm{W}$ aufgenommen |
| $P_{Iq}$ | $10\,\mathrm{W}$ abgegeben |
| **Bilanz** | $\mathbf{10\,W = 4\,W + 6\,W}$ |

::: merke Merksätze
- Überlagerung: eine Quelle nach der anderen. Spannungsquelle aus heißt Draht, Stromquelle aus heißt Unterbrechung. Zählpfeile bleiben, Teilergebnisse vorzeichenrichtig addieren.
- In Reihe mit einer idealen Stromquelle ist der Strom schon vor jeder Rechnung bekannt.
- Leistungen nie überlagern, sondern aus den Gesamtwerten berechnen.
- Wer abgibt und wer aufnimmt, sagen die Zählpfeile, nicht der Name des Bauteils.
:::

## Zum Weiterdenken

::: aufgabe Die Spannungsquelle umpolen
Jetzt ist $U_q = -3\,\mathrm{V}$, alles andere bleibt. Berechne $U_{Iq}$ und die Leistungsbilanz. Wer liefert jetzt?
???
Der Strom bleibt $I = 2\,\mathrm{A}$, die Stromquelle gibt ihn weiter vor. Damit bleibt auch $U_R = 2\,\mathrm{V}$, und die Masche liefert

$$U_{Iq} = U_q + U_R = -3\,\mathrm{V} + 2\,\mathrm{V} = -1\,\mathrm{V}$$

Die Pfeile bleiben, also auch die Zählpfeilsysteme:

- $R$ (VZS): $2\,\mathrm{V} \cdot 2\,\mathrm{A} = 4\,\mathrm{W}$ aufgenommen.
- $U_q$ (VZS): $-3\,\mathrm{V} \cdot 2\,\mathrm{A} = -6\,\mathrm{W}$ aufgenommen, also $6\,\mathrm{W}$ **abgegeben**.
- $I_q$ (EZS): $-1\,\mathrm{V} \cdot 2\,\mathrm{A} = -2\,\mathrm{W}$ abgegeben, also $2\,\mathrm{W}$ **aufgenommen**.

Bilanz: $6\,\mathrm{W} = 4\,\mathrm{W} + 2\,\mathrm{W}$. Die Rollen haben getauscht, jetzt lädt die Spannungsquelle sozusagen die Stromquelle.
:::

::: aufgabe Die Stromquelle arbeitet umsonst
Bei welcher Quellenspannung $U_q$ gibt die Stromquelle gar keine Leistung ab? Wohin geht dann die Leistung im Widerstand?
???
Die Stromquelle gibt nichts ab, wenn an ihr keine Spannung liegt:

$$U_{Iq} = U_q + R\,I_q = 0 \quad\Rightarrow\quad U_q = -R\,I_q = -2\,\mathrm{V}$$

Dann liefert die Spannungsquelle $2\,\mathrm{V} \cdot 2\,\mathrm{A} = 4\,\mathrm{W}$, und genau die werden im Widerstand warm. Die Stromquelle hält nur noch den Strom fest.
:::

::: aufgabe Langsam laden lohnt sich
Bleib beim Bild Ladegerät und Akku: $U_q = 3\,\mathrm{V}$, $R = 1\,\Omega$. Wie groß ist der Wirkungsgrad $\eta = P_{U_q}/P_{Iq}$ beim Laden mit $2\,\mathrm{A}$ und mit $0{,}5\,\mathrm{A}$?
???
Allgemein ist

$$\eta = \frac{U_q \cdot I}{(U_q + R\,I) \cdot I} = \frac{U_q}{U_q + R\,I}$$

- $I = 2\,\mathrm{A}$: $\eta = \frac{3}{3 + 2} = 60\,\%$.
- $I = 0{,}5\,\mathrm{A}$: $\eta = \frac{3}{3 + 0{,}5} \approx 86\,\%$.

Je kleiner der Strom, desto weniger geht im Widerstand verloren, denn die Verluste wachsen mit $I^2$, die geladene Leistung nur mit $I$. Dafür dauert das Laden länger.
:::
