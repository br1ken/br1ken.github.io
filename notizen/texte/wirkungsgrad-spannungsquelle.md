---
titel: Wirkungsgrad einer Spannungsquelle
datum: 2026-10-29
fach: ET1 · Rechenübung 3
art: rechnung
aufgabe: 3.6
tags: [Wirkungsgrad, Leistungsanpassung, Spannungsteiler, Innenwiderstand, Leistung]
teaser: Welcher Anteil der Quellenleistung kommt außen an? Wirkungsgrad als Funktion von Ra/Ri, Graph und warum Leistungsanpassung nur 50 % schafft.
welle: lade
---

## Die Aufgabe

Der [[Wirkungsgrad|wirkungsgrad]] ist das Verhältnis der im Außenwiderstand $R_a$ umgesetzten Leistung $P_a$ zur Leistung $P_q$, die die ideale Quelle erzeugt. Gesucht ist $\eta = P_a/P_q$ als Funktion von $R_a/R_i$, graphisch dargestellt.

<figure class="dia"><svg viewBox="0 0 320 160" role="img" aria-label="Bild 1: Spannungsquelle U q mit Innenwiderstand R i, an den Klemmen der Außenwiderstand R a mit der Spannung U a. Durch alle fließt der Strom I.">
<defs><marker id="a36-1-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a36-1-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a36-1-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a36-1-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<circle class="b" cx="50" cy="90" r="15"/><path class="s" d="M50 75V105"/><path class="s" d="M50 40V75M50 105V140"/>
<path class="pu" d="M26 74L26 106" marker-end="url(#a36-1-u)"/><text class="tu" x="20" y="94" text-anchor="end">U<tspan dy="3" font-size="9">q</tspan></text>
<path class="s" d="M50 40H88M132 40H176.5M183.5 40H250V68M250 112V140H183.5M176.5 140H50"/>
<rect class="b" x="88" y="32" width="44" height="16"/><text class="c" x="110" y="26">R<tspan dy="3" font-size="9">i</tspan></text><circle class="b" cx="180" cy="40" r="3.5"/><circle class="b" cx="180" cy="140" r="3.5"/>
<path class="pi" d="M196 28L222 28" marker-end="url(#a36-1-i)"/><text class="ti c" x="209" y="21">I</text>
<rect class="b" x="242" y="68" width="16" height="44"/><text x="236" y="94" text-anchor="end">R<tspan dy="3" font-size="9">a</tspan></text>
<path class="pu" d="M274 74L274 106" marker-end="url(#a36-1-u)"/><text class="tu" x="279" y="94">U<tspan dy="3" font-size="9">a</tspan></text>
</svg><figcaption>Bild 1: reale Spannungsquelle (U<sub>q</sub> mit R<sub>i</sub>) mit Außenwiderstand R<sub>a</sub>. Eine einzige Masche, ein einziger Strom I.</figcaption></figure>

## Lösungsweg

1. Definition $\eta = P_a/P_q$ hinschreiben.
2. Leistungen über den gemeinsamen Strom ausdrücken, $I$ kürzt sich.
3. Spannungsteiler einsetzen.
4. Auf $R_a/R_i$ umformen und zeichnen.

## 1. Gemeinsamer Strom

Die Schaltung hat nur eine Masche und keinen Knoten, an dem etwas abzweigt. Durch $U_q$, $R_i$ und $R_a$ fließt also derselbe Strom $I$.

## 2. Wirkungsgrad als Spannungsverhältnis

Leistung ist Spannung mal Strom. Die Quelle gibt $P_q = U_q I$ ab, beim Verbraucher kommt $P_a = U_a I$ an:

$$\eta = \frac{P_a}{P_q} = \frac{U_a \cdot I}{U_q \cdot I} = \frac{U_a}{U_q}$$

::: merke
Bei gleichem Strom ist der Wirkungsgrad gleich dem Spannungsverhältnis $U_a/U_q$.
:::

## 3. Spannungsteiler

$R_i$ und $R_a$ liegen in Reihe an $U_q$. Beim [[Spannungsteiler|spannungsteiler]] steht der eigene Widerstand im Zähler:

$$U_a = U_q \cdot \frac{R_a}{R_i + R_a}$$

Beide Seiten durch $U_q$ teilen:

$$\eta = \frac{U_a}{U_q} = \frac{R_a}{R_i + R_a}$$

**Alternativer Weg über $P = I^2 R$.** Die Quelle liefert, was $R_i$ und $R_a$ zusammen verbrauchen (Leistungsbilanz):

$$\begin{aligned} P_a &= I^2 R_a \\ P_q &= P_{R_i} + P_a = I^2 R_i + I^2 R_a = I^2 (R_i + R_a) \\ \eta &= \frac{I^2 R_a}{I^2 (R_i + R_a)} = \frac{R_a}{R_i + R_a} \end{aligned}$$

Beide Wege liefern dasselbe.

## 4. Umformen auf $R_a/R_i$

Damit der Bruch $R_a/R_i$ entsteht, muss $R_i$ im Nenner stehen. Also werden Zähler und Nenner durch $R_i$ geteilt:

$$\eta = \frac{R_a}{R_i + R_a} = \frac{\dfrac{R_a}{R_i}}{\dfrac{R_i}{R_i} + \dfrac{R_a}{R_i}} = \frac{\dfrac{R_a}{R_i}}{1 + \dfrac{R_a}{R_i}}$$

::: achtung Durch den richtigen Widerstand teilen
Teilt man durch $R_a$, erhält man $\eta = \dfrac{1}{R_i/R_a + 1}$. Das ist auch richtig, aber eine Funktion von $R_i/R_a$, also verkehrt herum.
:::

::: merke Ergebnis
$$\eta = \frac{R_a/R_i}{1 + R_a/R_i} = \frac{x}{1 + x} \qquad \text{mit } x = \frac{R_a}{R_i}$$
:::

## 5. Graph

Markante Punkte:

$$\begin{aligned} \eta(0) &= \frac{0}{1 + 0} = 0 \\ \eta(1) &= \frac{1}{1 + 1} = \frac{1}{2} \\ \eta(x \to \infty) &= \frac{x}{1 + x} \approx \frac{x}{x} = 1 \end{aligned}$$

Für große $x$ ist die 1 im Nenner neben $x$ vernachlässigbar, darum nähert sich $\eta$ der 1, ohne sie zu erreichen.

Ein paar Werte zum Ablesen: $x = 0{,}5$ ergibt 33 %, $x = 2$ ergibt 67 %, $x = 4$ ergibt 80 %. Für 90 % muss $R_a$ schon neunmal so groß sein wie $R_i$.

<figure class="dia"><svg viewBox="0 0 400 248" role="img" aria-label="Bild 2: Wirkungsgrad eta über R a durch R i. Die Kurve steigt von null, erreicht bei 1 den Wert 0,5 und nähert sich für große Werte der Eins. Gestrichelt die abgegebene Leistung bezogen auf ihr Maximum: Sie ist bei 1 am größten und fällt danach wieder.">
<defs><marker id="a36-2-e" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="a36-2-m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker><marker id="a36-2-u" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fu"/></marker><marker id="a36-2-i" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fi"/></marker></defs>
<path class="m" d="M52 163.5H336" style="opacity:.35"/>
<path class="m" d="M52 121.0H336" style="opacity:.35"/>
<path class="m" d="M52 78.5H336" style="opacity:.35"/>
<path class="m" d="M80.4 206V36" style="opacity:.35"/>
<path class="m" d="M108.8 206V36" style="opacity:.35"/>
<path class="m" d="M165.6 206V36" style="opacity:.35"/>
<path class="m" d="M222.4 206V36" style="opacity:.35"/>
<path class="m" d="M279.2 206V36" style="opacity:.35"/>
<path class="m" d="M336.0 206V36" style="opacity:.35"/>
<path class="s" d="M52 212L52 18" marker-end="url(#a36-2-e)"/><path class="s" d="M46 206L358 206" marker-end="url(#a36-2-e)"/>
<path class="m d" d="M52 36.0H336"/>
<path class="pi" style="stroke-dasharray:5 4" d="M52.0 206.0L52.7 189.8L53.4 175.2L54.1 161.9L54.8 149.8L55.5 138.8L56.3 128.9L57.0 119.8L57.7 111.6L58.4 104.0L59.1 97.2L59.8 91.0L60.5 85.3L61.2 80.1L61.9 75.4L62.6 71.1L63.4 67.2L64.1 63.7L64.8 60.5L65.5 57.5L66.2 54.9L66.9 52.5L67.6 50.3L68.3 48.4L69.0 46.6L69.8 45.1L70.5 43.6L71.2 42.4L71.9 41.3L72.6 40.3L73.3 39.5L74.0 38.7L74.7 38.1L75.4 37.6L76.1 37.1L76.8 36.8L77.6 36.5L78.3 36.3L79.0 36.1L79.7 36.0L80.4 36.0L81.1 36.0L81.8 36.1L82.5 36.2L83.2 36.4L84.0 36.6L84.7 36.8L85.4 37.1L86.1 37.4L86.8 37.7L87.5 38.1L88.2 38.5L88.9 38.9L89.6 39.3L90.3 39.8L91.0 40.2L91.8 40.7L92.5 41.2L93.2 41.7L93.9 42.3L94.6 42.8L95.3 43.3L96.0 43.9L96.7 44.5L97.4 45.1L98.2 45.6L98.9 46.2L99.6 46.8L100.3 47.4L101.0 48.0L101.7 48.6L102.4 49.3L103.1 49.9L103.8 50.5L104.5 51.1L105.2 51.7L106.0 52.4L106.7 53.0L107.4 53.6L108.1 54.3L108.8 54.9L109.5 55.5L110.2 56.1L110.9 56.8L111.6 57.4L112.3 58.0L113.1 58.7L113.8 59.3L114.5 59.9L115.2 60.5L115.9 61.1L116.6 61.8L117.3 62.4L118.0 63.0L118.7 63.6L119.5 64.2L120.2 64.8L120.9 65.4L121.6 66.0L122.3 66.6L123.0 67.2L123.7 67.8L124.4 68.4L125.1 69.0L125.8 69.6L126.5 70.2L127.3 70.7L128.0 71.3L128.7 71.9L129.4 72.5L130.1 73.0L130.8 73.6L131.5 74.1L132.2 74.7L132.9 75.3L133.7 75.8L134.4 76.3L135.1 76.9L135.8 77.4L136.5 78.0L137.2 78.5L137.9 79.0L138.6 79.6L139.3 80.1L140.0 80.6L140.8 81.1L141.5 81.6L142.2 82.1L142.9 82.6L143.6 83.1L144.3 83.6L145.0 84.1L145.7 84.6L146.4 85.1L147.1 85.6L147.8 86.1L148.6 86.6L149.3 87.1L150.0 87.5L150.7 88.0L151.4 88.5L152.1 88.9L152.8 89.4L153.5 89.9L154.2 90.3L154.9 90.8L155.7 91.2L156.4 91.7L157.1 92.1L157.8 92.5L158.5 93.0L159.2 93.4L159.9 93.8L160.6 94.3L161.3 94.7L162.1 95.1L162.8 95.5L163.5 96.0L164.2 96.4L164.9 96.8L165.6 97.2L166.3 97.6L167.0 98.0L167.7 98.4L168.4 98.8L169.2 99.2L169.9 99.6L170.6 100.0L171.3 100.4L172.0 100.8L172.7 101.1L173.4 101.5L174.1 101.9L174.8 102.3L175.5 102.7L176.2 103.0L177.0 103.4L177.7 103.8L178.4 104.1L179.1 104.5L179.8 104.8L180.5 105.2L181.2 105.6L181.9 105.9L182.6 106.3L183.3 106.6L184.1 106.9L184.8 107.3L185.5 107.6L186.2 108.0L186.9 108.3L187.6 108.6L188.3 109.0L189.0 109.3L189.7 109.6L190.4 110.0L191.2 110.3L191.9 110.6L192.6 110.9L193.3 111.2L194.0 111.6L194.7 111.9L195.4 112.2L196.1 112.5L196.8 112.8L197.6 113.1L198.3 113.4L199.0 113.7L199.7 114.0L200.4 114.3L201.1 114.6L201.8 114.9L202.5 115.2L203.2 115.5L203.9 115.8L204.7 116.1L205.4 116.4L206.1 116.6L206.8 116.9L207.5 117.2L208.2 117.5L208.9 117.8L209.6 118.0L210.3 118.3L211.0 118.6L211.8 118.9L212.5 119.1L213.2 119.4L213.9 119.7L214.6 119.9L215.3 120.2L216.0 120.4L216.7 120.7L217.4 121.0L218.1 121.2L218.8 121.5L219.6 121.7L220.3 122.0L221.0 122.2L221.7 122.5L222.4 122.7L223.1 123.0L223.8 123.2L224.5 123.5L225.2 123.7L225.9 124.0L226.7 124.2L227.4 124.4L228.1 124.7L228.8 124.9L229.5 125.1L230.2 125.4L230.9 125.6L231.6 125.8L232.3 126.1L233.1 126.3L233.8 126.5L234.5 126.8L235.2 127.0L235.9 127.2L236.6 127.4L237.3 127.6L238.0 127.9L238.7 128.1L239.4 128.3L240.2 128.5L240.9 128.7L241.6 128.9L242.3 129.2L243.0 129.4L243.7 129.6L244.4 129.8L245.1 130.0L245.8 130.2L246.5 130.4L247.2 130.6L248.0 130.8L248.7 131.0L249.4 131.2L250.1 131.4L250.8 131.6L251.5 131.8L252.2 132.0L252.9 132.2L253.6 132.4L254.3 132.6L255.1 132.8L255.8 133.0L256.5 133.2L257.2 133.4L257.9 133.6L258.6 133.8L259.3 133.9L260.0 134.1L260.7 134.3L261.4 134.5L262.2 134.7L262.9 134.9L263.6 135.1L264.3 135.2L265.0 135.4L265.7 135.6L266.4 135.8L267.1 135.9L267.8 136.1L268.6 136.3L269.3 136.5L270.0 136.6L270.7 136.8L271.4 137.0L272.1 137.2L272.8 137.3L273.5 137.5L274.2 137.7L274.9 137.8L275.6 138.0L276.4 138.2L277.1 138.3L277.8 138.5L278.5 138.7L279.2 138.8L279.9 139.0L280.6 139.2L281.3 139.3L282.0 139.5L282.8 139.6L283.5 139.8L284.2 140.0L284.9 140.1L285.6 140.3L286.3 140.4L287.0 140.6L287.7 140.7L288.4 140.9L289.1 141.1L289.9 141.2L290.6 141.4L291.3 141.5L292.0 141.7L292.7 141.8L293.4 142.0L294.1 142.1L294.8 142.3L295.5 142.4L296.2 142.5L296.9 142.7L297.7 142.8L298.4 143.0L299.1 143.1L299.8 143.3L300.5 143.4L301.2 143.6L301.9 143.7L302.6 143.8L303.3 144.0L304.1 144.1L304.8 144.3L305.5 144.4L306.2 144.5L306.9 144.7L307.6 144.8L308.3 144.9L309.0 145.1L309.7 145.2L310.4 145.3L311.1 145.5L311.9 145.6L312.6 145.7L313.3 145.9L314.0 146.0L314.7 146.1L315.4 146.3L316.1 146.4L316.8 146.5L317.5 146.6L318.2 146.8L319.0 146.9L319.7 147.0L320.4 147.2L321.1 147.3L321.8 147.4L322.5 147.5L323.2 147.7L323.9 147.8L324.6 147.9L325.4 148.0L326.1 148.1L326.8 148.3L327.5 148.4L328.2 148.5L328.9 148.6L329.6 148.7L330.3 148.9L331.0 149.0L331.7 149.1L332.4 149.2L333.2 149.3L333.9 149.5L334.6 149.6L335.3 149.7L336.0 149.8"/>
<path class="s" style="stroke-width:2.2" d="M52.0 206.0L52.7 201.9L53.4 197.9L54.1 194.1L54.8 190.5L55.5 187.1L56.3 183.8L57.0 180.7L57.7 177.7L58.4 174.8L59.1 172.0L59.8 169.3L60.5 166.8L61.2 164.3L61.9 161.9L62.6 159.6L63.4 157.4L64.1 155.3L64.8 153.2L65.5 151.3L66.2 149.3L66.9 147.5L67.6 145.7L68.3 143.9L69.0 142.2L69.8 140.6L70.5 139.0L71.2 137.5L71.9 136.0L72.6 134.6L73.3 133.1L74.0 131.8L74.7 130.4L75.4 129.2L76.1 127.9L76.8 126.7L77.6 125.5L78.3 124.3L79.0 123.2L79.7 122.1L80.4 121.0L81.1 120.0L81.8 118.9L82.5 117.9L83.2 117.0L84.0 116.0L84.7 115.1L85.4 114.2L86.1 113.3L86.8 112.4L87.5 111.6L88.2 110.7L88.9 109.9L89.6 109.1L90.3 108.3L91.0 107.6L91.8 106.8L92.5 106.1L93.2 105.4L93.9 104.7L94.6 104.0L95.3 103.3L96.0 102.7L96.7 102.0L97.4 101.4L98.2 100.8L98.9 100.2L99.6 99.6L100.3 99.0L101.0 98.4L101.7 97.8L102.4 97.3L103.1 96.7L103.8 96.2L104.5 95.6L105.2 95.1L106.0 94.6L106.7 94.1L107.4 93.6L108.1 93.1L108.8 92.7L109.5 92.2L110.2 91.7L110.9 91.3L111.6 90.8L112.3 90.4L113.1 90.0L113.8 89.5L114.5 89.1L115.2 88.7L115.9 88.3L116.6 87.9L117.3 87.5L118.0 87.1L118.7 86.7L119.5 86.4L120.2 86.0L120.9 85.6L121.6 85.3L122.3 84.9L123.0 84.6L123.7 84.2L124.4 83.9L125.1 83.6L125.8 83.2L126.5 82.9L127.3 82.6L128.0 82.3L128.7 81.9L129.4 81.6L130.1 81.3L130.8 81.0L131.5 80.7L132.2 80.4L132.9 80.2L133.7 79.9L134.4 79.6L135.1 79.3L135.8 79.0L136.5 78.8L137.2 78.5L137.9 78.2L138.6 78.0L139.3 77.7L140.0 77.5L140.8 77.2L141.5 77.0L142.2 76.7L142.9 76.5L143.6 76.2L144.3 76.0L145.0 75.8L145.7 75.5L146.4 75.3L147.1 75.1L147.8 74.9L148.6 74.6L149.3 74.4L150.0 74.2L150.7 74.0L151.4 73.8L152.1 73.6L152.8 73.4L153.5 73.2L154.2 73.0L154.9 72.8L155.7 72.6L156.4 72.4L157.1 72.2L157.8 72.0L158.5 71.8L159.2 71.6L159.9 71.4L160.6 71.2L161.3 71.1L162.1 70.9L162.8 70.7L163.5 70.5L164.2 70.3L164.9 70.2L165.6 70.0L166.3 69.8L167.0 69.7L167.7 69.5L168.4 69.3L169.2 69.2L169.9 69.0L170.6 68.9L171.3 68.7L172.0 68.5L172.7 68.4L173.4 68.2L174.1 68.1L174.8 67.9L175.5 67.8L176.2 67.6L177.0 67.5L177.7 67.3L178.4 67.2L179.1 67.1L179.8 66.9L180.5 66.8L181.2 66.6L181.9 66.5L182.6 66.4L183.3 66.2L184.1 66.1L184.8 66.0L185.5 65.8L186.2 65.7L186.9 65.6L187.6 65.4L188.3 65.3L189.0 65.2L189.7 65.1L190.4 64.9L191.2 64.8L191.9 64.7L192.6 64.6L193.3 64.5L194.0 64.3L194.7 64.2L195.4 64.1L196.1 64.0L196.8 63.9L197.6 63.8L198.3 63.6L199.0 63.5L199.7 63.4L200.4 63.3L201.1 63.2L201.8 63.1L202.5 63.0L203.2 62.9L203.9 62.8L204.7 62.7L205.4 62.6L206.1 62.5L206.8 62.4L207.5 62.3L208.2 62.2L208.9 62.1L209.6 62.0L210.3 61.9L211.0 61.8L211.8 61.7L212.5 61.6L213.2 61.5L213.9 61.4L214.6 61.3L215.3 61.2L216.0 61.1L216.7 61.0L217.4 60.9L218.1 60.8L218.8 60.7L219.6 60.6L220.3 60.5L221.0 60.5L221.7 60.4L222.4 60.3L223.1 60.2L223.8 60.1L224.5 60.0L225.2 59.9L225.9 59.9L226.7 59.8L227.4 59.7L228.1 59.6L228.8 59.5L229.5 59.4L230.2 59.4L230.9 59.3L231.6 59.2L232.3 59.1L233.1 59.1L233.8 59.0L234.5 58.9L235.2 58.8L235.9 58.7L236.6 58.7L237.3 58.6L238.0 58.5L238.7 58.4L239.4 58.4L240.2 58.3L240.9 58.2L241.6 58.1L242.3 58.1L243.0 58.0L243.7 57.9L244.4 57.9L245.1 57.8L245.8 57.7L246.5 57.7L247.2 57.6L248.0 57.5L248.7 57.5L249.4 57.4L250.1 57.3L250.8 57.2L251.5 57.2L252.2 57.1L252.9 57.1L253.6 57.0L254.3 56.9L255.1 56.9L255.8 56.8L256.5 56.7L257.2 56.7L257.9 56.6L258.6 56.5L259.3 56.5L260.0 56.4L260.7 56.4L261.4 56.3L262.2 56.2L262.9 56.2L263.6 56.1L264.3 56.1L265.0 56.0L265.7 55.9L266.4 55.9L267.1 55.8L267.8 55.8L268.6 55.7L269.3 55.7L270.0 55.6L270.7 55.5L271.4 55.5L272.1 55.4L272.8 55.4L273.5 55.3L274.2 55.3L274.9 55.2L275.6 55.2L276.4 55.1L277.1 55.0L277.8 55.0L278.5 54.9L279.2 54.9L279.9 54.8L280.6 54.8L281.3 54.7L282.0 54.7L282.8 54.6L283.5 54.6L284.2 54.5L284.9 54.5L285.6 54.4L286.3 54.4L287.0 54.3L287.7 54.3L288.4 54.2L289.1 54.2L289.9 54.1L290.6 54.1L291.3 54.0L292.0 54.0L292.7 53.9L293.4 53.9L294.1 53.8L294.8 53.8L295.5 53.8L296.2 53.7L296.9 53.7L297.7 53.6L298.4 53.6L299.1 53.5L299.8 53.5L300.5 53.4L301.2 53.4L301.9 53.3L302.6 53.3L303.3 53.3L304.1 53.2L304.8 53.2L305.5 53.1L306.2 53.1L306.9 53.0L307.6 53.0L308.3 53.0L309.0 52.9L309.7 52.9L310.4 52.8L311.1 52.8L311.9 52.7L312.6 52.7L313.3 52.7L314.0 52.6L314.7 52.6L315.4 52.5L316.1 52.5L316.8 52.5L317.5 52.4L318.2 52.4L319.0 52.3L319.7 52.3L320.4 52.3L321.1 52.2L321.8 52.2L322.5 52.2L323.2 52.1L323.9 52.1L324.6 52.0L325.4 52.0L326.1 52.0L326.8 51.9L327.5 51.9L328.2 51.9L328.9 51.8L329.6 51.8L330.3 51.7L331.0 51.7L331.7 51.7L332.4 51.6L333.2 51.6L333.9 51.6L334.6 51.5L335.3 51.5L336.0 51.5"/>
<circle class="f" cx="52.0" cy="206" r="3.5"/><circle class="f" cx="80.4" cy="121.0" r="4"/><circle class="fi" cx="80.4" cy="36.0" r="4"/>
<text class="k" x="89.4" y="136">LEISTUNGSANPASSUNG</text><text class="k" x="89.4" y="149">η = 50 %</text>
<text class="k ti" x="89.4" y="30">P<tspan dy="3" font-size="9">a</tspan><tspan dy="-3"> MAXIMAL</tspan></text>
<text x="340" y="55.4545">η</text><text class="ti" x="340" y="153.802">P<tspan dy="3" font-size="9">a</tspan><tspan dy="-3">/P</tspan><tspan dy="3" font-size="9">max</tspan></text>
<text class="k" x="45" y="210" text-anchor="end">0</text>
<text class="k" x="45" y="167.5" text-anchor="end">0,25</text>
<text class="k" x="45" y="125" text-anchor="end">0,5</text>
<text class="k" x="45" y="82.5" text-anchor="end">0,75</text>
<text class="k" x="45" y="40" text-anchor="end">1</text>
<text class="k c" x="52" y="222">0</text>
<text class="k c" x="80.4" y="222">1</text>
<text class="k c" x="108.8" y="222">2</text>
<text class="k c" x="165.6" y="222">4</text>
<text class="k c" x="222.4" y="222">6</text>
<text class="k c" x="279.2" y="222">8</text>
<text class="k c" x="336" y="222">10</text>
<text class="c" x="194" y="240">R<tspan dy="3" font-size="9">a</tspan><tspan dy="-3"> / R</tspan><tspan dy="3" font-size="9">i</tspan></text><text x="44" y="18" text-anchor="end">η</text>
</svg><figcaption>Bild 2: Wirkungsgrad η über R<sub>a</sub>/R<sub>i</sub> (durchgezogen). Gestrichelt zum Vergleich die abgegebene Leistung, bezogen auf ihr Maximum: Sie ist bei Leistungsanpassung am größten, genau dort, wo η erst 50 % beträgt.</figcaption></figure>

## Deutung der drei Fälle

- **Kurzschluss ($R_a = 0$):** Die gesamte Leistung wird in $R_i$ verheizt. $\eta = 0$.
- **[[Leistungsanpassung|leistungsanpassung]] ($R_a = R_i$):** Außen kommt die maximal mögliche Leistung an. Die Hälfte bleibt aber innen. $\eta = 50\,\%$.
- **Leerlauf ($R_a \to \infty$):** Es fließt fast kein Strom, innen geht fast nichts verloren. $\eta \to 1$, aber es wird kaum Leistung übertragen.

::: merke
Maximale abgegebene Leistung und maximaler Wirkungsgrad sind nicht dasselbe. Bei Leistungsanpassung ist $P_a$ maximal, $\eta$ aber nur 50 %.
:::

Darum betreibt man Netze und Netzteile mit $R_a \gg R_i$, dort zählt der Wirkungsgrad. Bei schwachen Signalen wie an einer Antenne zählt dagegen jedes bisschen Leistung, dort passt man an.

::: herleitung Warum $P_a$ bei $R_a = R_i$ am größten ist
Mit $I = \dfrac{U_q}{R_i + R_a}$ und $x = R_a/R_i$:

$$P_a = I^2 R_a = \frac{U_q^2 R_a}{(R_i + R_a)^2} = \frac{U_q^2}{R_i} \cdot \frac{x}{(1 + x)^2}$$

Ableiten nach $x$ (Quotientenregel) und null setzen:

$$\begin{aligned} \frac{\mathrm{d}}{\mathrm{d}x}\,\frac{x}{(1 + x)^2} &= \frac{(1 + x)^2 - x \cdot 2(1 + x)}{(1 + x)^4} \\ &= \frac{(1 + x)(1 - x)}{(1 + x)^4} = \frac{1 - x}{(1 + x)^3} \end{aligned}$$

$$\frac{1 - x}{(1 + x)^3} = 0 \quad\Rightarrow\quad x = 1$$

Bei $x = 1$ ist

$$P_{a,\max} = \frac{U_q^2}{R_i} \cdot \frac{1}{4} = \frac{U_q^2}{4 R_i}$$

Die gestrichelte Kurve in Bild 2 ist $P_a / P_{a,\max} = \dfrac{4x}{(1 + x)^2}$.
:::
