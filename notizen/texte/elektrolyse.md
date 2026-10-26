---
titel: Strom in Flüssigkeiten — Ionen, Elektrolyse und die Faraday-Gesetze
datum: 2026-10-26
fach: Grundlagen der E-Technik
art: theorie
tags: [Elektrolyse, Ionen, Faraday, Stoffmenge, Avogadro, Galvanik]
teaser: Im Draht tragen Elektronen den Strom, im Wasser sind es Ionen. Was an den Elektroden passiert, wie man aus Ampere und Sekunden Gramm macht, und warum Aluminium so viel Strom frisst.
welle: lade
---

Strom im Kupferdraht kennt jeder: Elektronen. Aber Strom durch Salzwasser, durch eine Batterie, durch eine Aluminiumschmelze? Da gibt es keine freien Elektronen. Trotzdem fließt Strom, und zwar getragen von ganzen Atomen mit Ladung, den **Ionen**. Das Schöne daran: Weil jedes Ion Materie ist, kann man mit Strom Stoffe transportieren, abscheiden und herstellen. Und man kann exakt ausrechnen, wie viel. Das ist die Elektrolyse.

Diese Notiz folgt dem Stoff aus ET1, Kapitel 1.2: Leitung in Metallen und Flüssigkeiten, Elektrolyse, Stoffmenge, Faraday-Gesetze.

## Auf einen Blick

::: merke Das Wichtigste
**Wer trägt den Strom?** Im Metall freie Elektronen, in Flüssigkeiten Ionen. Im Draht fließt derselbe Strom wie im Elektrolyten, nur mit anderen Trägern.

**Teilchen zählen:** $N = \dfrac{m}{M} \cdot N_A$ mit der Avogadro-Konstante $N_A = 6{,}022 \cdot 10^{23}\,\mathrm{mol^{-1}}$ und der molaren Masse $M$ aus dem Periodensystem.

**Faraday:** Die bei einer Elektrolyse abgeschiedene Masse ist

$$m = \frac{M}{z \cdot e \cdot N_A} \cdot I \cdot t = \frac{M}{z \cdot F} \cdot Q$$

mit der Wertigkeit $z$ (Ladungen pro Ion) und der Faraday-Konstante $F = e \cdot N_A = 96\,485\,\mathrm{C/mol}$, der Ladung von einem Mol Elektronen.

**Merkhilfe:** Ka**t**ionen (+) wandern zur Ka**t**hode, Anionen (−) zur Anode. An der Kathode wird reduziert, an der Anode oxidiert.
:::

## 1. Wer trägt den Strom?

### Im Metall: Elektronen

In einem Metall sitzen die Atomrümpfe als positive Ionen fest im Gitter. Von jedem Atom hat sich das äußerste Elektron gelöst und schwirrt frei durch das Gitter, ein „Elektronengas“. Ohne Spannung ist diese Bewegung völlig ungeordnet: schnell, aber in alle Richtungen gleich, im Mittel also null.

Legt man eine Spannung an, kommt zur wilden Bewegung eine winzige gemeinsame **Drift** gegen die Feldrichtung dazu. Diese Drift ist der Strom. Mehr dazu, mit Zahlen, in [Von Newton bis Ohm](beitrag.html?b=von-newton-zu-ohm).

### In Flüssigkeiten: Ionen

Reines Wasser leitet fast nicht. Löst man aber Kochsalz darin, zerfällt jedes $\mathrm{NaCl}$ in ein positives Natrium-Ion $\mathrm{Na^+}$ und ein negatives Chlorid-Ion $\mathrm{Cl^-}$. Eine Flüssigkeit mit gelösten Ionen heißt **Elektrolyt**. Legt man jetzt eine Spannung an, wandern die positiven Ionen in die eine Richtung und die negativen in die andere. **Beide** Bewegungen zusammen sind der Strom.

<figure class="dia"><svg viewBox="0 0 360 206" role="img" aria-label="Links ein Metall: feste positive Atomrümpfe im Gitter, kleine Elektronen driften nach links, während das Feld nach rechts zeigt. Rechts ein Elektrolyt: positive Ionen wandern nach rechts, negative nach links.">
<defs><marker id="el-a1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<text class="k" x="8" y="12">METALL</text><text class="k" x="196" y="12">ELEKTROLYT</text>
<path class="m d" d="M180 6V182"/>
<rect class="b" x="8" y="22" width="164" height="130"/>
<g class="m"><circle cx="36" cy="50" r="7"/><circle cx="76" cy="50" r="7"/><circle cx="116" cy="50" r="7"/><circle cx="156" cy="50" r="7"/><circle cx="36" cy="94" r="7"/><circle cx="76" cy="94" r="7"/><circle cx="116" cy="94" r="7"/><circle cx="156" cy="94" r="7"/><circle cx="36" cy="138" r="7"/><circle cx="76" cy="138" r="7"/><circle cx="116" cy="138" r="7"/><circle cx="156" cy="138" r="7"/></g>
<text class="k c" x="36" y="53">+</text><text class="k c" x="76" y="53">+</text><text class="k c" x="116" y="53">+</text><text class="k c" x="156" y="53">+</text><text class="k c" x="36" y="97">+</text><text class="k c" x="76" y="97">+</text><text class="k c" x="116" y="97">+</text><text class="k c" x="156" y="97">+</text><text class="k c" x="36" y="141">+</text><text class="k c" x="76" y="141">+</text><text class="k c" x="116" y="141">+</text><text class="k c" x="156" y="141">+</text>
<g class="f"><circle cx="58" cy="70" r="2.5"/><circle cx="100" cy="116" r="2.5"/><circle cx="140" cy="72" r="2.5"/><circle cx="56" cy="118" r="2.5"/><circle cx="98" cy="68" r="2.5"/><circle cx="138" cy="118" r="2.5"/></g>
<path class="s" d="M70 70H62" marker-end="url(#el-a1)"/><path class="s" d="M112 116H104" marker-end="url(#el-a1)"/><path class="s" d="M152 72H144" marker-end="url(#el-a1)"/><path class="s" d="M68 118H60" marker-end="url(#el-a1)"/><path class="s" d="M110 68H102" marker-end="url(#el-a1)"/><path class="s" d="M150 118H142" marker-end="url(#el-a1)"/>
<text class="k" x="8" y="170">RÜMPFE FEST, e⁻ DRIFTEN</text>
<rect class="b" x="196" y="22" width="156" height="130"/>
<circle class="b" cx="226" cy="54" r="9"/><text class="c" x="226" y="58">+</text><path class="s" d="M238 54H256" marker-end="url(#el-a1)"/>
<circle class="b" cx="300" cy="80" r="9"/><text class="c" x="300" y="84">+</text><path class="s" d="M312 80H330" marker-end="url(#el-a1)"/>
<circle class="b" cx="250" cy="126" r="9"/><text class="c" x="250" y="130">+</text><path class="s" d="M262 126H280" marker-end="url(#el-a1)"/>
<circle class="b" cx="322" cy="46" r="9"/><text class="c" x="322" y="50">−</text><path class="s" d="M310 46H292" marker-end="url(#el-a1)"/>
<circle class="b" cx="256" cy="90" r="9"/><text class="c" x="256" y="94">−</text><path class="s" d="M244 90H226" marker-end="url(#el-a1)"/>
<circle class="b" cx="320" cy="128" r="9"/><text class="c" x="320" y="132">−</text><path class="s" d="M308 128H290" marker-end="url(#el-a1)"/>
<text class="k" x="196" y="170">IONEN: BEIDE RICHTUNGEN</text>
<path class="m" d="M60 192H120" marker-end="url(#el-a1)"/><text class="k" x="126" y="196">E-FELD</text>
<path class="m" d="M240 192H300" marker-end="url(#el-a1)"/><text class="k" x="306" y="196">E-FELD</text>
</svg><figcaption>Zwei Arten zu leiten. Im Metall bewegen sich nur die Elektronen, gegen das Feld. Im Elektrolyten bewegen sich geladene Atome: positive mit dem Feld, negative dagegen.</figcaption></figure>

::: info Und dazwischen: Mischleiter
Manche Festkörper transportieren beides zugleich, Ionen und Elektronen. Das Elektrodenmaterial eines Lithium-Akkus ist so ein **Mischleiter**: Lithium-Ionen wandern durch das Material, während Elektronen über das Gitter abfließen. Auch Festkörper-Brennstoffzellen leiten Sauerstoff-Ionen durch Keramik.
:::

### Wertigkeit: Wie viel Ladung trägt ein Ion?

Ein Ion ist ein Atom oder Molekül, dem Elektronen fehlen oder das zu viele hat. Die Zahl dieser fehlenden oder überzähligen Elektronen ist seine **Wertigkeit** $z$. Jedes Ion trägt also die Ladung $z \cdot e$ mit der Elementarladung $e = 1{,}602 \cdot 10^{-19}\,\mathrm{C}$.

| Ion | $z$ | Ladung |
|:---|:---:|:---|
| $\mathrm{Na^+}$, $\mathrm{Ag^+}$, $\mathrm{H^+}$ | 1 | $+e$ |
| $\mathrm{Cu^{2+}}$, $\mathrm{Mg^{2+}}$, $\mathrm{Zn^{2+}}$ | 2 | $+2e$ |
| $\mathrm{Al^{3+}}$ | 3 | $+3e$ |
| $\mathrm{Cl^-}$ | 1 | $-e$ |
| $\mathrm{O^{2-}}$ | 2 | $-2e$ |

::: achtung z ist nicht Z
Die **Wertigkeit** $z$ (klein) zählt die Ladungen eines Ions. Die **Ordnungszahl** $Z$ (groß) zählt die Protonen im Kern und sagt, welches Element es ist. Aluminium hat $Z = 13$, aber als Ion $z = 3$. In den Faraday-Formeln steht immer das kleine $z$.
:::

## 2. Die Elektrolysezelle

Zwei Elektroden tauchen in den Elektrolyten, dazwischen hängt eine Gleichspannungsquelle. Die Elektrode am Minuspol heißt **Kathode**, die am Pluspol **Anode**.

<figure class="dia"><svg viewBox="0 0 360 236" role="img" aria-label="Eine Elektrolysezelle: Becherglas mit zwei Elektroden, links die Kathode am Minuspol, rechts die Anode am Pluspol. Natrium-Ionen wandern zur Kathode, Chlorid-Ionen zur Anode. Im Draht fließen Elektronen von der Anode über die Quelle zur Kathode.">
<defs><marker id="el-a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<path class="s" d="M60 226H300M60 226V80M300 226V80"/>
<rect class="hl" x="62" y="118" width="236" height="106"/>
<rect class="b" x="70" y="86" width="14" height="124"/><rect class="b" x="276" y="86" width="14" height="124"/>
<path class="s" d="M77 86V30H160M283 86V30H200"/>
<circle class="b" cx="180" cy="30" r="16"/><path class="s" d="M164 30H196"/>
<text class="k" x="150" y="22" text-anchor="end">−</text><text class="k" x="210" y="22">+</text>
<path class="m" d="M250 14H216" marker-end="url(#el-a2)"/><path class="m" d="M144 14H110" marker-end="url(#el-a2)"/>
<text class="k c" x="180" y="60">e⁻ IM DRAHT</text>
<text class="k" x="86" y="80">KATHODE −</text><text class="k" x="274" y="80" text-anchor="end">ANODE +</text>
<circle class="b" cx="170" cy="140" r="11"/><text class="c" x="170" y="144">Na⁺</text><path class="s" d="M156 140H98" marker-end="url(#el-a2)"/>
<circle class="b" cx="200" cy="186" r="11"/><text class="c" x="200" y="190">Cl⁻</text><path class="s" d="M214 186H262" marker-end="url(#el-a2)"/>
<text class="k" x="92" y="176">2 Na⁺ + 2 e⁻</text><text class="k" x="92" y="188">→ 2 Na</text>
<text class="k" x="268" y="140" text-anchor="end">2 Cl⁻ → Cl₂</text><text class="k" x="268" y="152" text-anchor="end">+ 2 e⁻</text>
<text class="k c" x="180" y="218">ELEKTROLYT: NaCl-SCHMELZE</text>
</svg><figcaption>Ein geschlossener Kreis aus zwei Hälften: Im Draht tragen Elektronen den Strom, in der Schmelze tragen ihn die Ionen. An den Elektroden wechseln die Träger.</figcaption></figure>

Was passiert hier, Schritt für Schritt, am Beispiel einer Kochsalzschmelze:

1. Die Quelle pumpt Elektronen auf die Kathode. Dort herrscht Elektronenüberschuss, die Kathode ist negativ.
2. Positive $\mathrm{Na^+}$-Ionen werden von der negativen Kathode angezogen, **Kationen zur Kathode**. Dort nimmt jedes ein Elektron auf und wird zu neutralem Natrium: $\mathrm{2\,Na^+ + 2\,e^- \rightarrow 2\,Na}$. Elektronen aufnehmen heißt **Reduktion**.
3. Negative $\mathrm{Cl^-}$-Ionen wandern zur positiven Anode, **Anionen zur Anode**. Dort geben sie ihr überschüssiges Elektron ab: $\mathrm{2\,Cl^- \rightarrow Cl_2 + 2\,e^-}$. Elektronen abgeben heißt **Oxidation**. Das Chlor steigt als Gas auf.
4. Die abgegebenen Elektronen fließen durch den Draht zurück zur Quelle und von dort zur Kathode. Der Kreis ist geschlossen.

Zusammen ergibt das die Gesamtreaktion $\mathrm{2\,NaCl \rightarrow 2\,Na + Cl_2}$. Die elektrische Energie der Quelle steckt jetzt in den getrennten Stoffen. Deshalb reagieren Natrium und Chlor so heftig miteinander, sie geben diese Energie wieder ab.

::: merke
Elektronen fließen nie durch den Elektrolyten, und Ionen fließen nie durch den Draht. Trotzdem ist der Strom überall im Kreis gleich. An den Elektroden findet der **Trägerwechsel** statt: Jedes Elektron, das an der Kathode verschwindet, taucht als Ladung eines Ions wieder auf.
:::

::: tipp Kathode ist nicht immer Minus
Bei der Elektrolyse ist die Kathode am Minuspol. In einer **Batterie** ist es umgekehrt: Dort ist die Kathode der Pluspol. Was immer gilt: An der Kathode werden Elektronen **aufgenommen** (Reduktion), an der Anode **abgegeben** (Oxidation). Danach benennt man die Elektroden, nicht nach dem Vorzeichen.
:::

## 3. Wofür man das braucht

**Galvanisieren.** Eine Metallschicht auf ein Werkstück bringen: Verchromen, Vergolden, Verzinken gegen Rost. Das Werkstück ist die Kathode, der Elektrolyt enthält Ionen des gewünschten Metalls, die sich dort abscheiden. Es reichen wenige Volt Gleichspannung. Wie dick die Schicht wird, bestimmen Strom und Zeit, dazu gleich mehr.

**Schmelzflusselektrolyse.** Metalle wie Lithium, Natrium, Magnesium und Aluminium lassen sich nicht aus Wasser abscheiden, weil sie sofort mit Wasser reagieren würden. Also schmilzt man ihr Salz und elektrolysiert die Schmelze. Das kostet viel Energie, weil die Schmelze heiß gehalten werden muss und weil pro Atom mehrere Elektronen nötig sind.

| Metall | Rohstoff | Spannung | kWh pro kg |
|:---|:---|:---|:---|
| Natrium | $\mathrm{NaCl}$ | ≈ 7 V | ≈ 11 |
| Aluminium | $\mathrm{Al_2O_3}$ | 4,5–5 V | 14–18 |

Zum Vergleich: Ein Haushalt verbraucht am Tag etwa 10 kWh. Ein Kilo Aluminium kostet also mehr als einen Tag Haushaltsstrom. Darum lohnt sich Alu-Recycling so sehr, Einschmelzen braucht nur etwa 5 % davon.

**Wasserelektrolyse.** Wasser in Wasserstoff und Sauerstoff zerlegen: $\mathrm{2\,H_2O \rightarrow 2\,H_2 + O_2}$. An der Kathode entsteht Wasserstoff, an der Anode Sauerstoff, und zwar doppelt so viel Wasserstoff wie Sauerstoff (dem Volumen nach). Das ist der Weg zu „grünem“ Wasserstoff, wenn der Strom aus Wind oder Sonne kommt. Moderne Zellen trennen beide Gase durch eine Membran.

## 4. Teilchen zählen

Um auszurechnen, wie viel Stoff eine Elektrolyse liefert, muss man Teilchen zählen können. Atome sind unvorstellbar klein, also zählt man sie in Paketen.

### Das Mol

Ein **Mol** ist ein Paket aus $N_A = 6{,}022 \cdot 10^{23}$ Teilchen, das ist die **Avogadro-Konstante**. Die Zahl ist so gewählt, dass ein Mol Kohlenstoff-12 genau 12 Gramm wiegt. Praktische Folge: Die **molare Masse** $M$ in Gramm pro Mol ist zahlenmäßig die Atommasse aus dem Periodensystem.

| Element | $M$ in g/mol |
|:---|---:|
| Wasserstoff $\mathrm{H}$ | 1,008 |
| Kohlenstoff $\mathrm{C}$ | 12,01 |
| Aluminium $\mathrm{Al}$ | 26,98 |
| Kupfer $\mathrm{Cu}$ | 63,55 |
| Silber $\mathrm{Ag}$ | 107,9 |
| Gold $\mathrm{Au}$ | 197,0 |

### Von der Masse zur Teilchenzahl

Zwei Schritte: Masse durch molare Masse ergibt die Stoffmenge $n$ in Mol, Stoffmenge mal Avogadro ergibt die Teilchenzahl.

$$n = \frac{m}{M}, \qquad N = n \cdot N_A = \frac{m}{M} \cdot N_A$$

**Beispiel:** Wie viele Atome stecken in einem Kilogramm Gold?

$$N = \frac{1000\,\mathrm{g}}{197\,\mathrm{g/mol}} \cdot 6{,}022 \cdot 10^{23}\,\mathrm{mol^{-1}} = 3{,}06 \cdot 10^{24}$$

Gut drei Quadrillionen Atome, in einem Würfel von knapp 4 cm Kantenlänge.

<figure class="dia"><svg viewBox="0 0 360 206" role="img" aria-label="Landkarte der Größen: Masse m oben links, Teilchenzahl N oben rechts, Volumen V unten links, Stoffmenge n unten rechts. Verbunden durch molare Masse M, Avogadro-Konstante N_A, Dichte rho und die Masse eines Teilchens.">
<rect class="b" x="14" y="20" width="104" height="44"/><text class="c" x="66" y="38">Masse m</text><text class="k c" x="66" y="54">kg</text>
<rect class="b" x="242" y="20" width="104" height="44"/><text class="c" x="294" y="38">Teilchen N</text><text class="k c" x="294" y="54">Stück</text>
<rect class="b" x="14" y="148" width="104" height="44"/><text class="c" x="66" y="166">Volumen V</text><text class="k c" x="66" y="182">m³</text>
<rect class="b" x="242" y="148" width="104" height="44"/><text class="c" x="294" y="166">Stoffmenge n</text><text class="k c" x="294" y="182">mol</text>
<path class="m" d="M118 42H242"/><text class="k c" x="180" y="36">m = N · m₁</text>
<path class="m" d="M66 64V148"/><text class="k" x="72" y="100">DICHTE</text><text class="k" x="72" y="112">ρ = m / V</text>
<path class="m" d="M294 64V148"/><text class="k" x="288" y="100" text-anchor="end">AVOGADRO</text><text class="k" x="288" y="112" text-anchor="end">N = n · N_A</text>
<path class="m" d="M118 64L242 148"/><text class="k" x="150" y="128">MOLARE MASSE</text><text class="k" x="150" y="140">m = n · M</text>
</svg><figcaption>Vier Größen, vier Umrechnungen. Für die Elektrolyse braucht man den Weg von N über n nach m: durch N<sub>A</sub> teilen, mit M multiplizieren.</figcaption></figure>

## 5. Die Faraday-Gesetze

Michael Faraday hat 1834 gemessen, wie viel Stoff bei einer Elektrolyse entsteht, und zwei Regeln gefunden:

1. Die abgeschiedene Stoffmenge ist **proportional zur geflossenen Ladung** $Q$. Doppelt so lange oder doppelt so viel Strom, doppelt so viel Stoff.
2. Bei gleicher Ladung ist die abgeschiedene Masse proportional zur **Atommasse** und umgekehrt proportional zur **Wertigkeit**. Schwere Atome bringen mehr Gramm pro Ladung, mehrfach geladene Ionen brauchen mehr Ladung pro Atom.

Heute braucht man das nicht mehr zu messen. Man kann es herleiten, indem man einfach Elektronen zählt.

### Herleitung: Elektronen zählen

Jedes abgeschiedene Ion braucht $z$ Elektronen. Für $N$ Ionen muss also die Ladung

$$Q = N \cdot z \cdot e$$

durch die Zelle geflossen sein. Bei Gleichstrom ist diese Ladung einfach Strom mal Zeit, $Q = I \cdot t$. Daraus folgt die Teilchenzahl:

$$N = \frac{Q}{z \cdot e} = \frac{I \cdot t}{z \cdot e}$$

Mit der Landkarte von oben wird aus der Teilchenzahl die Masse, $m = \frac{N}{N_A} \cdot M$:

$$\boxed{m = \frac{M}{z \cdot e \cdot N_A} \cdot I \cdot t}$$

Diese eine Gleichung enthält beide Gesetze: $m \sim I \cdot t$ ist das erste, $m \sim M/z$ das zweite.

<figure class="dia"><svg viewBox="0 0 360 120" role="img" aria-label="Rechenkette von links nach rechts: Strom mal Zeit ergibt Ladung Q, geteilt durch z mal e ergibt die Teilchenzahl N, geteilt durch N_A ergibt die Stoffmenge n, mal M ergibt die Masse m.">
<defs><marker id="el-a3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<rect class="b" x="8" y="40" width="64" height="40"/><text class="c" x="40" y="58">I · t</text><text class="k c" x="40" y="72">A · s</text>
<rect class="a" x="100" y="40" width="48" height="40"/><text class="c ai" x="124" y="58">Q</text><text class="k c" x="124" y="72">C</text>
<rect class="b" x="176" y="40" width="48" height="40"/><text class="c" x="200" y="58">N</text><text class="k c" x="200" y="72">Stück</text>
<rect class="b" x="252" y="40" width="48" height="40"/><text class="c" x="276" y="58">n</text><text class="k c" x="276" y="72">mol</text>
<rect class="a" x="312" y="40" width="40" height="40"/><text class="c ai" x="332" y="58">m</text><text class="k c" x="332" y="72">g</text>
<path class="s" d="M72 60H94" marker-end="url(#el-a3)"/><path class="s" d="M148 60H170" marker-end="url(#el-a3)"/><path class="s" d="M224 60H246" marker-end="url(#el-a3)"/><path class="s" d="M300 60H306" marker-end="url(#el-a3)"/>
<text class="k c" x="83" y="30">=</text><text class="k c" x="162" y="30">÷ (z·e)</text><text class="k c" x="238" y="30">÷ N_A</text><text class="k c" x="306" y="30">· M</text>
<text class="k c" x="180" y="106">ODER DIREKT: n = Q / (z · F)</text>
</svg><figcaption>Die Faraday-Kette. Links kommen Ampere und Sekunden hinein, rechts kommen Gramm heraus. Jeder Pfeil ist eine Umrechnung mit einer Naturkonstante oder einer Stoffgröße.</figcaption></figure>

### Die Faraday-Konstante

Im Nenner steht immer das Produkt $e \cdot N_A$, die Ladung von einem Mol Elektronen. Dafür gibt es einen eigenen Namen:

$$\begin{aligned} F &= e \cdot N_A \\ &= 1{,}602 \cdot 10^{-19}\,\mathrm{C} \cdot 6{,}022 \cdot 10^{23}\,\mathrm{mol^{-1}} \\ &= 96\,485\,\mathrm{\frac{C}{mol}} \end{aligned}$$

Damit wird die Formel handlich:

$$m = \frac{M}{z \cdot F} \cdot Q \qquad\text{bzw.}\qquad n = \frac{Q}{z \cdot F}$$

Ein Gefühl für die Größe: $96\,485\,\mathrm{C}$ sind bei $1\,\mathrm{A}$ fast $27$ Stunden. So lange dauert es, ein Mol einwertige Ionen abzuscheiden, zum Beispiel $108\,\mathrm{g}$ Silber. Für ein Mol Kupfer ($z = 2$) braucht man doppelt so lange.

::: tipp Rechenrezept
1. Ladung ausrechnen: $Q = I \cdot t$, Zeit in Sekunden.
2. Stoffmenge: $n = \dfrac{Q}{z \cdot F}$. Dabei ist $z$ die Zahl der Elektronen **pro abgeschiedenem Teilchen**.
3. Masse: $m = n \cdot M$. Bei Gasen stattdessen Volumen: $V = n \cdot 22{,}4\,\mathrm{L/mol}$ bei $0\,\mathrm{^\circ C}$ und Normaldruck.

Einheitenprobe: $\dfrac{\mathrm{A \cdot s}}{\mathrm{C/mol}} = \dfrac{\mathrm{C}}{\mathrm{C/mol}} = \mathrm{mol}$ ✓
:::

## 6. Drei Beispiele

### Verkupfern

Ein Werkstück hängt eine Stunde lang bei $2\,\mathrm{A}$ in einem Kupfersulfatbad. Kupfer liegt als $\mathrm{Cu^{2+}}$ vor, also $z = 2$, $M = 63{,}55\,\mathrm{g/mol}$.

$$\begin{aligned} Q &= 2\,\mathrm{A} \cdot 3600\,\mathrm{s} = 7200\,\mathrm{C} \\ n &= \frac{7200}{2 \cdot 96\,485}\,\mathrm{mol} = 0{,}0373\,\mathrm{mol} \\ m &= 0{,}0373 \cdot 63{,}55\,\mathrm{g} = 2{,}37\,\mathrm{g} \end{aligned}$$

Verteilt auf $1\,\mathrm{dm^2}$ Oberfläche ist das bei der Dichte $8{,}96\,\mathrm{g/cm^3}$ eine Schicht von etwa $26\,\mathrm{\mu m}$, ein Viertel Millimeter pro zehn Stunden. Galvanik ist Geduldsarbeit.

### Wasserstoff aus Wasser

Eine Stunde lang $1\,\mathrm{A}$ durch Wasser. An der Kathode entsteht Wasserstoff: $\mathrm{2\,H^+ + 2\,e^- \rightarrow H_2}$. Pro **Molekül** $\mathrm{H_2}$ sind das zwei Elektronen, also $z = 2$ und $M = 2{,}016\,\mathrm{g/mol}$.

$$\begin{aligned} n &= \frac{3600\,\mathrm{C}}{2 \cdot 96\,485\,\mathrm{C/mol}} = 0{,}0187\,\mathrm{mol} \\ m &= 0{,}0187 \cdot 2{,}016\,\mathrm{g} = 0{,}038\,\mathrm{g} \\ V &= 0{,}0187 \cdot 22{,}4\,\mathrm{L} \approx 0{,}42\,\mathrm{L} \end{aligned}$$

Gut 0,4 Liter Gas, aber nur 38 Milligramm. Wasserstoff ist leicht. An der Anode entstehen gleichzeitig 0,21 Liter Sauerstoff, die Hälfte, weil pro $\mathrm{O_2}$ vier Elektronen nötig sind.

### Warum Aluminium so teuer ist

Ein Kilogramm Aluminium, $z = 3$, $M = 26{,}98\,\mathrm{g/mol}$. Wie viel Ladung braucht das, und wie viel Energie bei $4{,}5\,\mathrm{V}$?

$$\begin{aligned} n &= \frac{1000}{26{,}98}\,\mathrm{mol} = 37{,}1\,\mathrm{mol} \\ Q &= n \cdot z \cdot F = 37{,}1 \cdot 3 \cdot 96\,485\,\mathrm{C} \\ &= 1{,}07 \cdot 10^7\,\mathrm{C} \\ W &= Q \cdot U = 1{,}07 \cdot 10^7\,\mathrm{C} \cdot 4{,}5\,\mathrm{V} \\ &= 4{,}8 \cdot 10^7\,\mathrm{J} = 13{,}4\,\mathrm{kWh} \end{aligned}$$

Das ist die theoretische Untergrenze. Reale Anlagen brauchen 14 bis 18 kWh, weil nicht jedes Elektron ein Aluminium-Atom abscheidet und weil die Zelle Wärme verliert. Bei $1\,\mathrm{A}$ würde das Kilo übrigens 124 Tage dauern. Aluminiumhütten arbeiten deshalb mit Strömen von einigen hunderttausend Ampere.

## Typische Fehler

::: achtung
- **z und Z verwechselt.** In der Faraday-Formel steht die Wertigkeit des Ions, nicht die Ordnungszahl.
- **z auf das falsche Teilchen bezogen.** $z$ ist die Zahl der Elektronen pro abgeschiedenem Teilchen, und $M$ muss zum selben Teilchen gehören. Bei $\mathrm{H_2}$: $z = 2$ mit $M = 2{,}016$, oder $z = 1$ mit $M = 1{,}008$ pro H-Atom. Beides ergibt dasselbe, gemischt wird es falsch.
- **Zeit in Minuten oder Stunden eingesetzt.** $Q = I \cdot t$ braucht Sekunden, sonst stimmen die Coulomb nicht.
- **Wechselstrom.** Die Formel gilt für Gleichstrom. Bei Wechselstrom wird in jeder Halbwelle wieder aufgelöst, was in der vorigen abgeschieden wurde. Netto passiert nichts.
- **Kathode gleich Minus gesetzt.** Das stimmt bei der Elektrolyse, aber nicht bei der Batterie. Sicher ist nur: Kathode heißt Reduktion.
- **Anionen zur Kathode geschickt.** Merkhilfe: Ka**t**ion und Ka**t**hode haben beide ein t, Anion und Anode beide ein n.
:::

## Üben

::: aufgabe Silber abscheiden
Wie lange dauert es, bei $0{,}5\,\mathrm{A}$ genau $1\,\mathrm{g}$ Silber abzuscheiden? ($\mathrm{Ag^+}$, $M = 107{,}9\,\mathrm{g/mol}$)
???
$$\begin{aligned} n &= \frac{1}{107{,}9}\,\mathrm{mol} = 9{,}27 \cdot 10^{-3}\,\mathrm{mol} \\ Q &= n \cdot z \cdot F \\ &= 9{,}27 \cdot 10^{-3} \cdot 96\,485\,\mathrm{C} = 894\,\mathrm{C} \\ t &= \frac{Q}{I} = \frac{894\,\mathrm{C}}{0{,}5\,\mathrm{A}} \\ &= 1789\,\mathrm{s} \approx 30\,\mathrm{min} \end{aligned}$$
:::

::: aufgabe Nickelschicht
Ein Bauteil wird 30 Minuten lang mit $10\,\mathrm{A}$ vernickelt ($\mathrm{Ni^{2+}}$, $M = 58{,}69\,\mathrm{g/mol}$). Wie viel Nickel scheidet sich ab?
???
$$\begin{aligned} Q &= 10\,\mathrm{A} \cdot 1800\,\mathrm{s} = 18\,000\,\mathrm{C} \\ m &= \frac{M}{z \cdot F} \cdot Q \\ &= \frac{58{,}69}{2 \cdot 96\,485} \cdot 18\,000\,\mathrm{g} = 5{,}47\,\mathrm{g} \end{aligned}$$
:::

::: aufgabe Rückwärts: Wie viele Elektronen?
Durch eine Zelle fließen $1\,\mathrm{A}$. Wie viele Elektronen sind das pro Sekunde, und wie viele Mol pro Stunde?
???
Pro Sekunde fließt $1\,\mathrm{C}$:

$$N = \frac{1\,\mathrm{C}}{1{,}602 \cdot 10^{-19}\,\mathrm{C}} = 6{,}24 \cdot 10^{18}$$

Sechs Trillionen Elektronen pro Sekunde. Pro Stunde sind das $3600\,\mathrm{C}$, also $\frac{3600}{96\,485}\,\mathrm{mol} = 0{,}037\,\mathrm{mol}$. Ein ganzes Mol dauert knapp 27 Stunden.
:::

::: aufgabe Zink gegen Rost
Ein Stahlblech mit $100\,\mathrm{cm^2}$ Fläche soll eine $3\,\mathrm{\mu m}$ dicke Zinkschicht bekommen ($\mathrm{Zn^{2+}}$, $M = 65{,}38\,\mathrm{g/mol}$, Dichte $7{,}14\,\mathrm{g/cm^3}$). Wie lange dauert das bei $5\,\mathrm{A}$?
???
Erst die Masse aus Volumen und Dichte:

$$\begin{aligned} V &= 100\,\mathrm{cm^2} \cdot 3 \cdot 10^{-4}\,\mathrm{cm} = 0{,}03\,\mathrm{cm^3} \\ m &= 7{,}14 \cdot 0{,}03\,\mathrm{g} = 0{,}214\,\mathrm{g} \end{aligned}$$

Dann die Ladung und die Zeit:

$$\begin{aligned} Q &= \frac{m \cdot z \cdot F}{M} \\ &= \frac{0{,}214 \cdot 2 \cdot 96\,485}{65{,}38}\,\mathrm{C} = 632\,\mathrm{C} \\ t &= \frac{632\,\mathrm{C}}{5\,\mathrm{A}} = 126\,\mathrm{s} \approx 2\,\mathrm{min} \end{aligned}$$

Dünne Schichten gehen schnell. Die $26\,\mathrm{\mu m}$ Kupfer von oben haben eine Stunde gebraucht, bei weniger Strom und fast zehnfacher Dicke.
:::

::: aufgabe Verständnis: Warum Gleichstrom?
Warum funktioniert Galvanisieren nicht mit Wechselstrom aus der Steckdose?
???
Bei Wechselstrom wechseln Kathode und Anode 100-mal pro Sekunde die Rolle. In der einen Halbwelle scheidet sich Metall ab, in der nächsten geht es wieder in Lösung. Die Nettoladung über eine Periode ist null, also nach Faraday auch die Nettomasse. Deshalb steht in der Formel ausdrücklich der **Gleich**strom, und Galvanikanlagen haben immer einen Gleichrichter.
:::
