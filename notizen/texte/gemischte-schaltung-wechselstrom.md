---
titel: Gemischte Widerstandsschaltung bei Wechselstrom
datum: 2026-10-24
fach: ET1 · Rechenübung 2
art: rechnung
aufgabe: 2.2
tags: [Wechselstrom, Parallelschaltung, Knotenregel, Leistung, Mittelwert]
teaser: Aufgabe 2.2: Gegeben ist nur der Strom durch 5 Ω. Daraus folgen alle Ströme und Spannungen, und über das Integral von sin² die mittlere Leistung von 440 W.
welle: sinus
---

Wechselstrom klingt nach komplexer Rechnung, aber hier nicht: In einer Schaltung nur aus Widerständen sind Strom und Spannung überall **in Phase**. Man rechnet mit Sinusgrößen genauso wie mit Zahlen. Spannend wird erst die Leistung, weil man dafür über eine Periode mitteln muss.

## Die Aufgabe

Durch den $5\,\Omega$-Widerstand fließt der Wechselstrom

$$i_5(t) = 6\,\mathrm{A} \cdot \sin(\omega t)$$

1. Berechnen Sie die Ströme in den beiden anderen Widerständen, die Spannung zwischen A und B und die Spannung zwischen B und C.
2. Wie groß ist der zeitliche Mittelwert der in den drei Widerständen zusammen umgesetzten Leistung?

<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Von A über den 10-Ohm-Widerstand zum Knoten B. Von B zwei parallele Zweige nach C: oben 5 Ohm mit dem Strom i5, unten 15 Ohm mit dem Strom i15. Darunter die Spannungen u_AB und u_BC.">
<defs><marker id="ws-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M20 90H160M160 40V140M160 40H320V140H160M320 90H344"/>
<rect class="b" x="68" y="82" width="44" height="16"/><rect class="b" x="218" y="32" width="44" height="16"/><rect class="b" x="218" y="132" width="44" height="16"/>
<circle class="b" cx="16" cy="90" r="4"/><circle class="b" cx="348" cy="90" r="4"/>
<circle class="f" cx="160" cy="90" r="3"/><circle class="f" cx="320" cy="90" r="3"/>
<text class="c" x="16" y="76">A</text><text class="c" x="348" y="76">C</text><text x="168" y="108">B</text>
<path class="s" d="M26 90H52" marker-end="url(#ws-a1)"/><text class="c" x="38" y="80">i<tspan dy="3" font-size="9">10</tspan></text>
<path class="s" d="M170 40H198" marker-end="url(#ws-a1)"/><text class="c" x="184" y="30">i<tspan dy="3" font-size="9">5</tspan></text>
<path class="s" d="M170 140H198" marker-end="url(#ws-a1)"/><text class="c" x="184" y="160">i<tspan dy="3" font-size="9">15</tspan></text>
<text class="c" x="90" y="72">10 Ω</text><text class="c" x="240" y="24">5 Ω</text><text class="c" x="240" y="164">15 Ω</text>
<path class="m" d="M18 178H158" marker-end="url(#ws-a1)"/><path class="m" d="M162 178H318" marker-end="url(#ws-a1)"/>
<text class="k c" x="88" y="194">u<tspan dy="3" font-size="8">AB</tspan></text><text class="k c" x="240" y="194">u<tspan dy="3" font-size="8">BC</tspan></text>
</svg><figcaption>Die Schaltung: 10 Ω in Reihe vor der Parallelschaltung aus 5 Ω und 15 Ω. Gegeben ist nur i<sub>5</sub>.</figcaption></figure>

::: merke Worum es geht
- Der gegebene Strom fließt nur durch $5\,\Omega$, **nicht** durch die ganze Parallelschaltung.
- Parallele Zweige haben dieselbe Spannung.
- An einem Knoten addieren sich die Ströme.
- An reinen Widerständen sind Strom und Spannung in Phase. Darum darf man Sinusgrößen hier wie Zahlen addieren.
:::

## (i) Ströme und Spannungen

### Schritt 1: Spannung B–C

Die Spannung am $5\,\Omega$-Widerstand folgt aus dem [[ohmschen Gesetz|ohmsches-gesetz]]:

$$\begin{aligned} u_{BC} &= R_5 \cdot i_5 \\ &= 5\,\Omega \cdot 6\,\mathrm{A}\,\sin(\omega t) \\ &= \boxed{30\,\mathrm{V}\,\sin(\omega t)} \end{aligned}$$

::: achtung Typischer Fehler: Spannung mit der Parallelschaltung gerechnet
Falsch: $6\,\mathrm{A} \cdot 3{,}75\,\Omega = 22{,}5\,\mathrm{V}$.

Damit tut man so, als würden die $6\,\mathrm{A}$ durch beide Zweige zusammen fließen. Der Strompfeil $i_5$ sitzt aber nur am $5\,\Omega$-Zweig.
:::

### Schritt 2: Strom durch 15 Ω

Der $15\,\Omega$-Widerstand liegt parallel zu $5\,\Omega$. Er hat also dieselbe Spannung:

$$\begin{aligned} u_{15} &= u_{BC} \\ i_{15} &= \frac{u_{BC}}{R_{15}} = \frac{30\,\mathrm{V}}{15\,\Omega}\,\sin(\omega t) \\ &= \boxed{2\,\mathrm{A}\,\sin(\omega t)} \end{aligned}$$

### Schritt 3: Strom durch 10 Ω

Am Knoten B teilt sich der Strom aus dem $10\,\Omega$-Zweig auf ([[Knotenregel]]):

$$\begin{aligned} i_{10} &= i_5 + i_{15} \\ &= 6\,\mathrm{A}\,\sin(\omega t) + 2\,\mathrm{A}\,\sin(\omega t) \\ &= \boxed{8\,\mathrm{A}\,\sin(\omega t)} \end{aligned}$$

### Schritt 4: Spannung A–B

$$\begin{aligned} u_{AB} &= R_{10} \cdot i_{10} \\ &= 10\,\Omega \cdot 8\,\mathrm{A}\,\sin(\omega t) \\ &= \boxed{80\,\mathrm{V}\,\sin(\omega t)} \end{aligned}$$

<figure class="dia"><svg viewBox="0 0 360 190" role="img" aria-label="Die drei Ströme über eine Periode: i10 mit Amplitude 8 A, i5 mit 6 A und i15 mit 2 A. Alle haben ihre Nullstellen und Maxima an denselben Stellen.">
<path class="m" d="M40 95H346M40 18V176"/>
<path class="m" d="M115 91V99M190 91V99M265 91V99M340 91V99"/>
<path class="s" d="M40.0 95.0L44.7 87.9L49.4 81.0L54.1 74.1L58.8 67.4L63.4 61.1L68.1 55.0L72.8 49.3L77.5 44.1L82.2 39.3L86.9 35.1L91.6 31.5L96.2 28.5L100.9 26.1L105.6 24.4L110.3 23.3L115.0 23.0L119.7 23.3L124.4 24.4L129.1 26.1L133.8 28.5L138.4 31.5L143.1 35.1L147.8 39.3L152.5 44.1L157.2 49.3L161.9 55.0L166.6 61.1L171.2 67.4L175.9 74.1L180.6 81.0L185.3 87.9L190.0 95.0L194.7 102.1L199.4 109.0L204.1 115.9L208.8 122.6L213.4 128.9L218.1 135.0L222.8 140.7L227.5 145.9L232.2 150.7L236.9 154.9L241.6 158.5L246.2 161.5L250.9 163.9L255.6 165.6L260.3 166.7L265.0 167.0L269.7 166.7L274.4 165.6L279.1 163.9L283.8 161.5L288.4 158.5L293.1 154.9L297.8 150.7L302.5 145.9L307.2 140.7L311.9 135.0L316.6 128.9L321.2 122.6L325.9 115.9L330.6 109.0L335.3 102.1L340.0 95.0"/>
<path class="s d" d="M40.0 95.0L44.7 89.7L49.4 84.5L54.1 79.3L58.8 74.3L63.4 69.5L68.1 65.0L72.8 60.7L77.5 56.8L82.2 53.3L86.9 50.1L91.6 47.4L96.2 45.1L100.9 43.3L105.6 42.0L110.3 41.3L115.0 41.0L119.7 41.3L124.4 42.0L129.1 43.3L133.8 45.1L138.4 47.4L143.1 50.1L147.8 53.3L152.5 56.8L157.2 60.7L161.9 65.0L166.6 69.5L171.2 74.3L175.9 79.3L180.6 84.5L185.3 89.7L190.0 95.0L194.7 100.3L199.4 105.5L204.1 110.7L208.8 115.7L213.4 120.5L218.1 125.0L222.8 129.3L227.5 133.2L232.2 136.7L236.9 139.9L241.6 142.6L246.2 144.9L250.9 146.7L255.6 148.0L260.3 148.7L265.0 149.0L269.7 148.7L274.4 148.0L279.1 146.7L283.8 144.9L288.4 142.6L293.1 139.9L297.8 136.7L302.5 133.2L307.2 129.3L311.9 125.0L316.6 120.5L321.2 115.7L325.9 110.7L330.6 105.5L335.3 100.3L340.0 95.0"/>
<path class="m" d="M40.0 95.0L44.7 93.2L49.4 91.5L54.1 89.8L58.8 88.1L63.4 86.5L68.1 85.0L72.8 83.6L77.5 82.3L82.2 81.1L86.9 80.0L91.6 79.1L96.2 78.4L100.9 77.8L105.6 77.3L110.3 77.1L115.0 77.0L119.7 77.1L124.4 77.3L129.1 77.8L133.8 78.4L138.4 79.1L143.1 80.0L147.8 81.1L152.5 82.3L157.2 83.6L161.9 85.0L166.6 86.5L171.2 88.1L175.9 89.8L180.6 91.5L185.3 93.2L190.0 95.0L194.7 96.8L199.4 98.5L204.1 100.2L208.8 101.9L213.4 103.5L218.1 105.0L222.8 106.4L227.5 107.7L232.2 108.9L236.9 110.0L241.6 110.9L246.2 111.6L250.9 112.2L255.6 112.7L260.3 112.9L265.0 113.0L269.7 112.9L274.4 112.7L279.1 112.2L283.8 111.6L288.4 110.9L293.1 110.0L297.8 108.9L302.5 107.7L307.2 106.4L311.9 105.0L316.6 103.5L321.2 101.9L325.9 100.2L330.6 98.5L335.3 96.8L340.0 95.0" style="stroke-width:1.6"/>
<text class="k" x="46" y="14">i IN A</text><text class="k" x="34" y="27" text-anchor="end">8</text><text class="k" x="34" y="171" text-anchor="end">−8</text>
<text class="k c" x="115" y="188">π/2</text><text class="k c" x="190" y="188">π</text><text class="k c" x="265" y="188">3π/2</text><text class="k c" x="334" y="188">2π</text>
<path class="s" d="M214 26H232"/><text class="k" x="238" y="30">i<tspan dy="3" font-size="8">10</tspan><tspan dy="-3">, Î = 8 A</tspan></text>
<path class="s d" d="M214 44H232"/><text class="k" x="238" y="48">i<tspan dy="3" font-size="8">5</tspan><tspan dy="-3">, Î = 6 A</tspan></text>
<path class="m" d="M214 62H232" style="stroke-width:1.6"/><text class="k" x="238" y="66">i<tspan dy="3" font-size="8">15</tspan><tspan dy="-3">, Î = 2 A</tspan></text>
</svg><figcaption>Alle drei Ströme sind phasengleich. In jedem Augenblick gilt i<sub>10</sub> = i<sub>5</sub> + i<sub>15</sub>.</figcaption></figure>

::: merke
$\hat{I}$ ist die Amplitude, also der Abstand von der Nulllinie bis zur Spitze. Der Spitze-Spitze-Wert ist doppelt so groß: $I_{ss} = 2\hat{I}$.
:::

## (ii) Mittlere Gesamtleistung

### Schritt 1: Gesamtwiderstand

Zuerst die Parallelschaltung, dann die Reihenschaltung (siehe [Widerstandsnetzwerke](beitrag.html?b=spannungsteiler)):

$$\begin{aligned} R_\parallel &= \frac{R_5 \cdot R_{15}}{R_5 + R_{15}} = \frac{5 \cdot 15}{5 + 15}\,\Omega = 3{,}75\,\Omega \\ R_{ges} &= R_{10} + R_\parallel = 10\,\Omega + 3{,}75\,\Omega = 13{,}75\,\Omega \end{aligned}$$

### Schritt 2: Momentanleistung

Durch die ganze Schaltung fließt $i_{10}$:

$$\begin{aligned} p(t) &= R_{ges} \cdot i_{10}^2(t) \\ &= 13{,}75\,\Omega \cdot (8\,\mathrm{A})^2 \sin^2(\omega t) \\ &= 880\,\mathrm{W}\,\sin^2(\omega t) \end{aligned}$$

$880\,\mathrm{W}$ ist die Spitzenleistung. Sie tritt nur kurz im Maximum jeder Halbwelle auf.

### Schritt 3: Mittelwert als Integral

Der zeitliche Mittelwert über eine Periode $T = \frac{2\pi}{\omega}$ ist definiert als

$$P = \frac{1}{T}\int_0^T p(t)\,\mathrm{d}t = \frac{880\,\mathrm{W}}{T}\int_0^T \sin^2(\omega t)\,\mathrm{d}t$$

### Schritt 4: sin² umformen

$\sin^2$ lässt sich nicht direkt integrieren. Man ersetzt es mit der Identität

$$\sin^2(x) = \frac{1 - \cos(2x)}{2}, \qquad x = \omega t$$

$$\begin{aligned} P &= \frac{880\,\mathrm{W}}{T}\int_0^T \frac{1 - \cos(2\omega t)}{2}\,\mathrm{d}t \\ &= \frac{440\,\mathrm{W}}{T}\int_0^T \big(1 - \cos(2\omega t)\big)\,\mathrm{d}t \end{aligned}$$

### Schritt 5: Stammfunktion

$$\int \cos(at)\,\mathrm{d}t = \frac{1}{a}\sin(at)$$

Mit $a = 2\omega$ folgt:

$$\int \big(1 - \cos(2\omega t)\big)\,\mathrm{d}t = t - \frac{\sin(2\omega t)}{2\omega}$$

::: achtung Typischer Fehler: innerer Faktor beim Integrieren
Falsch: $\int \cos(at)\,\mathrm{d}t = a\sin(at)$.

Ableiten multipliziert mit dem inneren Faktor (Kettenregel). Integrieren macht das rückgängig, also wird durch $a$ **geteilt**.

Probe: Die Stammfunktion ableiten. Es muss exakt der Integrand herauskommen:

$$\frac{\mathrm{d}}{\mathrm{d}t}\left[\frac{\sin(2\omega t)}{2\omega}\right] = \cos(2\omega t) \;\checkmark$$
:::

### Schritt 6: Grenzen einsetzen

$$F(t) = t - \frac{\sin(2\omega t)}{2\omega}, \qquad \big[F(t)\big]_0^T = F(T) - F(0)$$

Obere Grenze, mit $2\omega T = 2\omega \cdot \frac{2\pi}{\omega} = 4\pi$:

$$F(T) = T - \frac{\sin(4\pi)}{2\omega} = T - 0 = T$$

Untere Grenze:

$$F(0) = 0 - \frac{\sin(0)}{2\omega} = 0$$

Ergebnis:

$$P = \frac{440\,\mathrm{W}}{T} \cdot (T - 0) \quad\Rightarrow\quad \boxed{P = 440\,\mathrm{W}}$$

<figure class="dia"><svg viewBox="0 0 360 176" role="img" aria-label="Momentanleistung p(t) = 880 W mal sin² über eine Periode: zwei Höcker bis 880 W, der Mittelwert 440 W als gestrichelte Linie.">
<path class="m" d="M40 150H346M40 18V156"/>
<path class="m" d="M115 146V154M190 146V154M265 146V154M340 146V154"/>
<path class="hl" d="M40 90H340V150H40Z" style="fill-opacity:.25"/>
<path class="s" d="M40.0 150.0L44.7 148.8L49.4 145.4L54.1 139.9L58.8 132.4L63.4 123.3L68.1 113.0L72.8 101.7L77.5 90.0L82.2 78.3L86.9 67.0L91.6 56.7L96.2 47.6L100.9 40.1L105.6 34.6L110.3 31.2L115.0 30.0L119.7 31.2L124.4 34.6L129.1 40.1L133.8 47.6L138.4 56.7L143.1 67.0L147.8 78.3L152.5 90.0L157.2 101.7L161.9 113.0L166.6 123.3L171.2 132.4L175.9 139.9L180.6 145.4L185.3 148.8L190.0 150.0L194.7 148.8L199.4 145.4L204.1 139.9L208.8 132.4L213.4 123.3L218.1 113.0L222.8 101.7L227.5 90.0L232.2 78.3L236.9 67.0L241.6 56.7L246.2 47.6L250.9 40.1L255.6 34.6L260.3 31.2L265.0 30.0L269.7 31.2L274.4 34.6L279.1 40.1L283.8 47.6L288.4 56.7L293.1 67.0L297.8 78.3L302.5 90.0L307.2 101.7L311.9 113.0L316.6 123.3L321.2 132.4L325.9 139.9L330.6 145.4L335.3 148.8L340.0 150.0"/>
<path class="s d" d="M40 90H340"/>
<text class="k" x="46" y="14">p IN W</text><text class="k" x="34" y="34" text-anchor="end">880</text><text class="k" x="34" y="94" text-anchor="end">440</text><text class="k" x="34" y="154" text-anchor="end">0</text>
<text class="k c" x="190" y="84">P = 440 W</text>
<text class="k c" x="115" y="170">π/2</text><text class="k c" x="190" y="170">π</text><text class="k c" x="265" y="170">3π/2</text><text class="k c" x="334" y="170">2π</text>
</svg><figcaption>p(t) schwingt doppelt so schnell wie i(t): Durch das Quadrieren klappt jedes Tal nach oben. Die Fläche über der Mittellinie füllt genau die Lücken darunter.</figcaption></figure>

### Kontrolle über die Einzelwiderstände

Jeder Widerstand für sich, mit $P = \frac{1}{2} R\,\hat{I}^2$:

$$\begin{aligned} P_{10} &= \tfrac{1}{2} \cdot 10 \cdot 8^2\,\mathrm{W} = 320\,\mathrm{W} \\ P_5 &= \tfrac{1}{2} \cdot 5 \cdot 6^2\,\mathrm{W} = 90\,\mathrm{W} \\ P_{15} &= \tfrac{1}{2} \cdot 15 \cdot 2^2\,\mathrm{W} = 30\,\mathrm{W} \\ \textstyle\sum &= 440\,\mathrm{W} \;\checkmark \end{aligned}$$

::: merke
Der Mittelwert von $\sin^2(\omega t)$ über eine Periode ist $\frac{1}{2}$. Daraus folgt

$$P = \frac{1}{2} R\,\hat{I}^2$$

Erst quadrieren, dann mitteln. Der Mittelwert von $\sin(\omega t)$ selbst ist $0$, weil sich positive und negative Halbwelle aufheben. Beide Halbwellen heizen aber gleich.
:::

::: tipp Noch schneller: Effektivwerte
Mit dem [[Effektivwert]] $I = \frac{\hat{I}}{\sqrt{2}}$ sieht die Leistung aus wie bei Gleichstrom, $P = R\,I^2$. Hier ist $I_{10} = \frac{8\,\mathrm{A}}{\sqrt{2}} \approx 5{,}66\,\mathrm{A}$, also $P = 13{,}75\,\Omega \cdot 32\,\mathrm{A}^2 = 440\,\mathrm{W}$ ✓

Oder über die Gesamtspannung $u_{AC} = u_{AB} + u_{BC} = 110\,\mathrm{V}\,\sin(\omega t)$: $P = \frac{1}{2}\,\hat{U}\,\hat{I} = \frac{1}{2} \cdot 110\,\mathrm{V} \cdot 8\,\mathrm{A} = 440\,\mathrm{W}$ ✓
:::

## Ergebnisse auf einen Blick

| Größe | Ergebnis |
|:---|---:|
| $i_{15}$ | $2\,\mathrm{A}\,\sin(\omega t)$ |
| $i_{10}$ | $8\,\mathrm{A}\,\sin(\omega t)$ |
| $u_{AB}$ | $80\,\mathrm{V}\,\sin(\omega t)$ |
| $u_{BC}$ | $30\,\mathrm{V}\,\sin(\omega t)$ |
| $P$ | $440\,\mathrm{W}$ |
