---
titel: Von Newton bis Ohm — Spannung, Strom und Widerstand hergeleitet
datum: 2026-10-23
fach: Grundlagen der E-Technik
art: theorie
tags: [Herleitung, Arbeit, Ladung, Potential, Spannung, Strom, Widerstand, Ohmsches Gesetz]
teaser: Kraft, Arbeit, Ladung, Feld, Potential, Spannung, Strom, Widerstand — jede Größe folgt aus der vorigen. Physikalisch, mathematisch, mit Einheiten, Bildern und so erklärt, wie Feynman es tun würde.
welle: lade
---

In der ersten ET-Vorlesung stehen $U$, $I$ und $R$ an der Tafel, als wären sie vom Himmel gefallen. Sind sie aber nicht. Die Begriffe dahinter bauen auf der Mechanik auf — Kraft, Arbeit, Energie. Neu dazu kommt eine Eigenschaft der Materie mit ihrem eigenen Kraftgesetz: die **Ladung**.

Diese Notiz baut die Kette in acht Schritten auf. Jeder Schritt kommt dreimal: **physikalisch** (was passiert), **mathematisch** (die Herleitung) und **symbolisch** (stimmen die Einheiten?). Wo es hilft, kommt ein **Feynman-Moment** dazu: ohne Formeln, mit einem Bild im Kopf.

<figure class="dia"><svg viewBox="0 0 360 368" role="img" aria-label="Landkarte: Kraft und Ladung führen über Arbeit, Feld, Spannung und Strom zum Widerstand und zum ohmschen Gesetz">
<defs><marker id="dia-p1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<text class="k c" x="62" y="14">MECHANIK</text><text class="k c" x="298" y="14">ELEKTRIK</text>
<rect class="b" x="10" y="24" width="104" height="40"/><text class="k c" x="62" y="39">KRAFT</text><text class="c" x="62" y="56">F = m · a</text>
<rect class="b" x="246" y="24" width="104" height="40"/><text class="k c" x="298" y="39">LADUNG</text><text class="c" x="298" y="56">Q = n · e</text>
<rect class="b" x="10" y="98" width="104" height="40"/><text class="k c" x="62" y="113">ARBEIT</text><text class="c" x="62" y="130">W = ∫ F · ds</text>
<rect class="b" x="128" y="98" width="104" height="40"/><text class="k c" x="180" y="113">FELD</text><text class="c" x="180" y="130">E = F / q</text>
<rect class="b" x="246" y="98" width="104" height="40"/><text class="k c" x="298" y="113">STROM</text><text class="c" x="298" y="130">I = dQ / dt</text>
<rect class="b" x="128" y="172" width="104" height="40"/><text class="k c" x="180" y="187">SPANNUNG</text><text class="c" x="180" y="204">U = W / q</text>
<rect class="b" x="128" y="246" width="104" height="40"/><text class="k c" x="180" y="261">WIDERSTAND</text><text class="c" x="180" y="278">R = U / I</text>
<rect class="a" x="128" y="320" width="104" height="40"/><text class="k c ai" x="180" y="335">OHMSCHES GESETZ</text><text class="c ai" x="180" y="352">U = R · I</text>
<path class="s" d="M62 64V96" marker-end="url(#dia-p1)"/><text class="k" x="68" y="84">· WEG</text>
<path class="s" d="M100 64L148 96" marker-end="url(#dia-p1)"/><path class="s" d="M260 64L212 96" marker-end="url(#dia-p1)"/><text class="k c" x="180" y="80">÷ q</text>
<path class="s" d="M298 64V96" marker-end="url(#dia-p1)"/><text class="k" x="304" y="84">÷ ZEIT</text>
<path class="s" d="M76 138L146 170" marker-end="url(#dia-p1)"/><text class="k" x="104" y="168" text-anchor="end">÷ q</text>
<path class="s" d="M180 138V170" marker-end="url(#dia-p1)"/><text class="k" x="186" y="158">∫ · ds</text>
<path class="s" d="M180 212V244" marker-end="url(#dia-p1)"/><text class="k" x="186" y="232">÷ I</text>
<path class="s" d="M298 138V266H234" marker-end="url(#dia-p1)"/>
<text class="k" x="10" y="262">NEWTON IM DRAHT</text><text class="k" x="10" y="275">+ STÖSSE</text><path class="m" d="M108 266H126" marker-end="url(#dia-p1)"/>
<path class="s" d="M180 286V318" marker-end="url(#dia-p1)"/><text class="k" x="186" y="306">UMSTELLEN</text>
</svg><figcaption>Die Landkarte: links die Mechanik, rechts die Ladung. Wo sich beide treffen, entsteht die Elektrotechnik.</figcaption></figure>

## 1. Newton: Kraft ändert Bewegung

**Physikalisch.** Ein Körper bleibt, wie er ist — in Ruhe oder in gleichförmiger Bewegung —, solange keine resultierende Kraft auf ihn wirkt. Die Kraft bestimmt nicht die Geschwindigkeit, sondern wie schnell sie sich ändert.

**Mathematisch.**

$$\vec{F} = \frac{\mathrm{d}\vec{p}}{\mathrm{d}t} = m\,\vec{a} \qquad (\text{bei konstanter Masse})$$

**Symbolisch.** $[F] = \mathrm{N} = \mathrm{kg\,m/s^2}$

## 2. Arbeit: Kraft mal Weg

**Physikalisch.** Wirkt eine Kraft entlang eines Weges, verrichtet sie Arbeit: Sie überträgt [[Energie|energie]]. Die steckt danach als Bewegung im Körper, als Lage (zum Beispiel Höhe) oder — bei Reibung — als Wärme in der Umgebung. Es zählt nur der Teil der Kraft, der in Wegrichtung zeigt.

**Mathematisch.**

$$W_{12} = \int_1^2 \vec{F} \cdot \mathrm{d}\vec{s}$$

Für die resultierende Kraft eingesetzt, folgt mit Newton der Arbeitssatz: Ihre Arbeit ändert die Bewegungsenergie.

$$W_{12} = \tfrac{1}{2} m v_2^2 - \tfrac{1}{2} m v_1^2$$

::: herleitung Woher der Arbeitssatz kommt
Mit $\vec{F} = m\,\mathrm{d}\vec{v}/\mathrm{d}t$ und $\mathrm{d}\vec{s} = \vec{v}\,\mathrm{d}t$:

$$\begin{aligned} W_{12} &= \int_1^2 m\,\frac{\mathrm{d}\vec{v}}{\mathrm{d}t} \cdot \vec{v}\,\mathrm{d}t \\ &= \int_{v_1}^{v_2} m\,v\,\mathrm{d}v \\ &= \tfrac{1}{2} m v_2^2 - \tfrac{1}{2} m v_1^2 \end{aligned}$$

Der Trick beim zweiten Gleichheitszeichen:

$$\frac{\mathrm{d}\vec{v}}{\mathrm{d}t} \cdot \vec{v} = \frac{1}{2}\,\frac{\mathrm{d}}{\mathrm{d}t}\,v^2$$
:::

Bei manchen Kräften hängt die Arbeit nur von Start und Ziel ab, nicht vom Weg dazwischen — bei der Schwerkraft zum Beispiel. Solche Kräfte heißen **konservativ**, und dann kann man jedem Ort eine **potentielle Energie** zuordnen:

$$W_{12} = E_\text{pot}(1) - E_\text{pot}(2)$$

Bei der Schwerkraft nahe der Erdoberfläche ist das $E_\text{pot} = m\,g\,h$. Einmal im Kreis herum ist die Arbeit dann null: $\oint \vec{F} \cdot \mathrm{d}\vec{s} = 0$. Diese Zeile wird in Schritt 6 zur Maschenregel.

**Symbolisch.** $[W] = \mathrm{N\,m} = \mathrm{J} = \mathrm{kg\,m^2/s^2}$

::: tipp Feynman-Moment
Energie ist Buchhaltung. Es gibt eine Zahl, die bei allem, was passiert, gleich bleibt — man muss nur alle Konten kennen: Bewegung, Höhe, Wärme und gleich auch die elektrische Lage. Feynman erzählt das mit Bauklötzen, die ein Kind im Zimmer versteckt: Man sieht nicht mehr alle, aber wer geschickt nachrechnet, kommt immer auf dieselbe Zahl.
:::

## 3. Ladung: die neue Eigenschaft

**Physikalisch.** Elektronen und Protonen haben eine Eigenschaft, die mit Masse nichts zu tun hat: [[Ladung|ladung]], positiv oder negativ. Gleiche Ladungen stoßen sich ab, ungleiche ziehen sich an. Frei vorkommende Ladung gibt es nur in ganzzahligen Vielfachen der Elementarladung $e$, und die Gesamtladung bleibt immer erhalten: Entsteht irgendwo positive Ladung, entsteht gleichzeitig genauso viel negative.

**Mathematisch.** Das Coulomb-Gesetz für zwei Punktladungen im Vakuum ist gebaut wie Newtons Gravitationsgesetz:

$$F = \frac{1}{4\pi\varepsilon_0} \cdot \frac{Q_1\,Q_2}{r^2}$$

Für frei vorkommende Ladungen gilt $Q = n \cdot e$ mit $e = 1{,}602 \cdot 10^{-19}\,\mathrm{C}$. (Quarks tragen Drittel davon, kommen aber nie einzeln vor.)

**Symbolisch.** $[Q] = \mathrm{C} = \mathrm{A\,s}$. Im SI ist nicht die Ladung Basiseinheit, sondern die Stromstärke: Ein Coulomb ist „ein Ampere, eine Sekunde lang“.

::: tipp Feynman-Moment
Zwei Elektronen stoßen sich elektrisch etwa $4 \cdot 10^{42}$-mal stärker ab, als sie sich durch ihre Masse anziehen. Dass wir davon im Alltag nichts merken, liegt nur daran, dass Materie fast perfekt neutral ist: Plus und Minus heben sich auf, bis auf winzige Reste. Schon winzige Abweichungen davon erzeugen die Felder, die in jedem Stromkreis die Elektronen antreiben.
:::

## 4. Das Feld: Kraft pro Ladung

**Physikalisch.** Die Kraft auf eine kleine Probeladung $q$ ist proportional zu $q$. Teilt man durch $q$, bleibt eine Größe übrig, die nur noch vom Ort abhängt: das [[elektrische Feld|e-feld]]. Es beschreibt den Raum, nicht die Probeladung.

**Mathematisch.**

$$\vec{E} = \frac{\vec{F}}{q} \qquad\Leftrightarrow\qquad \vec{F} = q\,\vec{E}$$

**Symbolisch.** $[E] = \mathrm{N/C} = \mathrm{V/m}$. Die zweite Form folgt aus Schritt 5: $\mathrm{N/C} = \mathrm{J/(C\,m)} = \mathrm{V/m}$.

## 5. Potential: Energie pro Ladung

**Physikalisch.** Das elektrostatische Feld ist konservativ, genau wie die Schwerkraft. Also hat eine Ladung an jedem Ort eine potentielle Energie. Teilt man auch die durch $q$, bekommt man das [[Potential|potential]] $\varphi$: eine „Höhe“ für Ladungen. Auf positive Ladungen wirkt die Kraft in Richtung des niedrigeren Potentials, wie auf Kugeln am Hang. Negative Ladungen wie Elektronen zieht es umgekehrt zum höheren Potential.

<figure class="dia"><svg viewBox="0 0 360 220" role="img" aria-label="Analogie: Eine Masse fällt von Höhe h1 auf h2, eine Ladung wandert im Feld zwischen zwei Platten von Potential phi1 zu phi2">
<defs><marker id="dia-p2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="dia-p2m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<path class="m d" d="M180 8V196"/>
<text class="k c" x="90" y="16">SCHWERKRAFT</text>
<path class="m d" d="M20 60H160"/><text x="20" y="53">h₁</text>
<path class="m d" d="M20 160H160"/><text x="20" y="153">h₂</text>
<path class="s" d="M10 186H170"/>
<circle class="a" cx="100" cy="60" r="9"/>
<path class="s" d="M100 72V146" marker-end="url(#dia-p2)"/><text x="108" y="114">F = m·g</text>
<text class="c" x="90" y="212">W = m g (h₁ − h₂)</text>
<text class="k c" x="272" y="16">ELEKTRISCHES FELD</text>
<rect class="f" x="200" y="54" width="144" height="5"/><text x="200" y="46">φ₁ (+)</text>
<rect class="f" x="200" y="160" width="144" height="5"/><text x="200" y="182">φ₂ (−)</text>
<path class="m" d="M210 64V152" marker-end="url(#dia-p2m)"/><path class="m" d="M232 64V152" marker-end="url(#dia-p2m)"/><path class="m" d="M340 64V152" marker-end="url(#dia-p2m)"/><text class="c" x="221" y="112">E</text>
<circle class="a" cx="278" cy="74" r="9"/><text class="c ai" x="278" y="78">+</text>
<path class="s" d="M278 86V146" marker-end="url(#dia-p2)"/><text x="286" y="118">F = q·E</text>
<text class="c" x="272" y="212">W = q (φ₁ − φ₂) = q U</text>
</svg><figcaption>Gleiche Rechnung, andere Kraft: Lageenergie pro Masse (g·h) wird zu Lageenergie pro Ladung (φ), der Unterschied zur Spannung, das Gewicht m·g zur Kraft q·E.</figcaption></figure>

**Mathematisch.** Mit einem Bezugspunkt $P_0$, an dem $\varphi = 0$ gilt:

$$\varphi(P) = \frac{E_\text{pot}(P)}{q} = -\int_{P_0}^{P} \vec{E} \cdot \mathrm{d}\vec{s}$$

Umgekehrt ist das Feld das Gefälle des Potentials, $\vec{E} = -\operatorname{grad}\varphi$. Es zeigt also immer bergab, von hohem zu niedrigem Potential.

**Symbolisch.** $[\varphi] = \mathrm{J/C} = \mathrm{V}$

## 6. Spannung: der Höhenunterschied

**Physikalisch.** Eine Höhe allein sagt nichts, es kommt immer auf den Unterschied an. Genauso beim Potential: Die [[Spannung|spannung]] zwischen zwei Punkten ist die Arbeit, die das Feld an jedem Coulomb verrichtet, das von 1 nach 2 wandert.

**Mathematisch.**

$$U_{12} = \varphi_1 - \varphi_2 = \int_1^2 \vec{E} \cdot \mathrm{d}\vec{s} = \frac{W_{12}}{q}$$

Weil das Feld konservativ ist, ist der Umlauf null — und das ist schon die [[Maschenregel|maschenregel]]:

$$\oint \vec{E} \cdot \mathrm{d}\vec{s} = 0 \qquad\Rightarrow\qquad \sum_\text{Masche} U = 0$$

::: achtung
Streng genommen gilt das nur, solange sich durch die Masche kein Magnetfluss ändert. Bei Spulen rettet man die Regel, indem man die induzierte Spannung $u_L = L\,\mathrm{d}i/\mathrm{d}t$ als eigenes Bauteil mitzählt.
:::

**Symbolisch.** $[U] = \mathrm{V} = \mathrm{J/C} = \mathrm{W/A} = \mathrm{kg\,m^2/(A\,s^3)}$

::: tipp Feynman-Moment
Eine Batterie ist ein Aufzug. Innen hebt die Chemie jede (gedacht positive) Ladung auf das hohe Potential, außen rollt sie durch den Stromkreis wieder hinunter und gibt dabei ihre Energie ab — an Lampe, Motor oder Widerstand. 9 Volt heißt: Jedes Coulomb bekommt 9 Joule mit auf den Weg. Ein kleiner Teil davon bleibt schon in der Batterie selbst hängen, an ihrem Innenwiderstand. Die Elektronen laufen übrigens andersherum — für die Energiebilanz ist das egal.
:::

## 7. Strom: Ladung pro Zeit

**Physikalisch.** [[Strom|strom]] ist gerichtet bewegte Ladung. Die Elektronen flitzen zwar ohnehin wild durcheinander, aber das hebt sich auf. Gezählt wird nur die gemeinsame Drift: wie viel Ladung pro Sekunde netto durch einen Querschnitt des Leiters fließt.

<figure class="dia"><svg viewBox="0 0 360 156" role="img" aria-label="Ein Leiterstück mit Ladungsträgern; markiert ist ein Zylinder der Länge v_d mal dt vor der Querschnittsfläche A">
<defs><marker id="dia-p3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<rect class="hl" x="150" y="40" width="80" height="70"/>
<path class="s" d="M20 40H330M20 110H330"/>
<ellipse class="m" cx="20" cy="75" rx="10" ry="35"/><ellipse class="m d" cx="150" cy="75" rx="10" ry="35"/>
<ellipse class="a" cx="230" cy="75" rx="10" ry="35" fill-opacity=".6"/><text x="246" y="80">A</text>
<g class="f"><circle cx="40" cy="60" r="2.6"/><circle cx="58" cy="92" r="2.6"/><circle cx="76" cy="52" r="2.6"/><circle cx="92" cy="78" r="2.6"/><circle cx="110" cy="98" r="2.6"/><circle cx="126" cy="58" r="2.6"/><circle cx="164" cy="66" r="2.6"/><circle cx="174" cy="96" r="2.6"/><circle cx="190" cy="52" r="2.6"/><circle cx="204" cy="84" r="2.6"/><circle cx="216" cy="60" r="2.6"/><circle cx="262" cy="96" r="2.6"/><circle cx="270" cy="56" r="2.6"/><circle cx="288" cy="82" r="2.6"/><circle cx="302" cy="100" r="2.6"/><circle cx="314" cy="58" r="2.6"/></g>
<path class="s" d="M150 22V34M150 28H228" marker-end="url(#dia-p3)"/><text class="c" x="190" y="17">v<tspan dy="3" font-size="9">d</tspan><tspan dy="-3"> · dt</tspan></text>
<text class="c" x="180" y="140">dQ = n · q · A · v<tspan dy="3" font-size="9">d</tspan><tspan dy="-3"> · dt</tspan></text>
</svg><figcaption>Alle Ladungsträger im markierten Zylinder der Länge v·dt kommen in der Zeit dt durch die Fläche A.</figcaption></figure>

**Mathematisch.** Makroskopisch ist Strom eine Definition, mikroskopisch eine Zählung. In der Zeit $\mathrm{d}t$ kommen alle Ladungsträger durch $A$, die in einem Zylinder der Länge $v_d\,\mathrm{d}t$ sitzen. Mit $n$ Ladungsträgern pro Kubikmeter, jeder mit Ladung $q$:

$$I = \frac{\mathrm{d}Q}{\mathrm{d}t} \qquad \mathrm{d}Q = n\,q\,A\,v_d\,\mathrm{d}t$$

$$\Rightarrow\qquad I = n\,q\,v_d\,A$$

Pro Fläche ist das die [[Stromdichte|stromdichte]] $j = I/A = n\,q\,v_d$. Und weil Ladung nicht verschwindet, muss in jeden Knoten genauso viel hinein- wie herausfließen — die [[Knotenregel|knotenregel]] $\sum I = 0$.

**Symbolisch.** $[I] = \mathrm{A}$ (SI-Basiseinheit) und $[n\,q\,v_d\,A] = \mathrm{m^{-3} \cdot C \cdot m/s \cdot m^2} = \mathrm{C/s} = \mathrm{A}$ ✓

Wie schnell sind die Elektronen? Kupfer hat etwa ein freies Elektron pro Atom, $n \approx 8{,}5 \cdot 10^{28}\,\mathrm{m^{-3}}$. Für $1\,\mathrm{A}$ durch $1\,\mathrm{mm^2}$:

$$\begin{aligned} n\,e &= 8{,}5 \cdot 10^{28}\,\mathrm{m^{-3}} \cdot 1{,}602 \cdot 10^{-19}\,\mathrm{C} \\ &\approx 1{,}36 \cdot 10^{10}\,\mathrm{C/m^3} \end{aligned}$$

$$\begin{aligned} v_d &= \frac{I}{n\,e\,A} = \frac{1\,\mathrm{A}}{1{,}36 \cdot 10^{10}\,\mathrm{C/m^3} \cdot 10^{-6}\,\mathrm{m^2}} \\ &\approx 7{,}3 \cdot 10^{-5}\,\mathrm{m/s} \approx 0{,}07\,\mathrm{mm/s} \end{aligned}$$

::: tipp Feynman-Moment
Die Elektronen kriechen langsamer als eine Schnecke. Trotzdem geht das Licht sofort an, wenn du den Schalter drückst. Denk an ein Rohr voller Murmeln: Schiebst du vorne eine hinein, fällt hinten sofort eine heraus — obwohl jede einzelne kaum vorankommt. Schnell ist nicht das Elektron, sondern der Schubs: das Feld, das sich mit einem guten Teil der Lichtgeschwindigkeit entlang der Leitung aufbaut.
:::

## 8. Widerstand: Newton im Draht

**Physikalisch.** Im Vakuum würde ein Feld ein Elektron immer schneller machen. Im Metall nicht: Das Elektron wird beschleunigt, stößt — im einfachen klassischen Bild — gegen das Kristallgitter, verliert seine Richtung und fängt von vorne an. Im Mittel bleibt eine konstante Driftgeschwindigkeit — wie bei einer Kugel, die im Flipper durch einen Wald aus Pins springt. Die Energie aus jedem Stoß landet im Gitter: Der Draht wird warm.

<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Drude-Modell: Ein Elektron springt im Zickzack zwischen Gitter-Ionen und driftet entgegen der Feldrichtung">
<defs><marker id="dia-p4" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker></defs>
<text class="k" x="10" y="14">IONEN IM GITTER · STOSS ETWA ALLE 25 fs</text>
<g class="m"><circle cx="40" cy="40" r="8"/><circle cx="96" cy="40" r="8"/><circle cx="152" cy="40" r="8"/><circle cx="208" cy="40" r="8"/><circle cx="264" cy="40" r="8"/><circle cx="320" cy="40" r="8"/><circle cx="40" cy="96" r="8"/><circle cx="96" cy="96" r="8"/><circle cx="152" cy="96" r="8"/><circle cx="208" cy="96" r="8"/><circle cx="264" cy="96" r="8"/><circle cx="320" cy="96" r="8"/><circle cx="40" cy="152" r="8"/><circle cx="96" cy="152" r="8"/><circle cx="152" cy="152" r="8"/><circle cx="208" cy="152" r="8"/><circle cx="264" cy="152" r="8"/><circle cx="320" cy="152" r="8"/></g>
<polyline class="s" points="348,128 329,104 274,150 255,104 216,47 162,92 106,146 88,103 48,48 26,70"/>
<circle class="a" cx="26" cy="70" r="6"/>
<path class="s" d="M30 184H110" marker-end="url(#dia-p4)"/><text x="116" y="188">E</text>
<path class="s" d="M330 184H250" marker-end="url(#dia-p4)"/><text x="244" y="188" text-anchor="end">Drift v<tspan dy="3" font-size="9">d</tspan></text>
</svg><figcaption>Drude-Modell: Das Feld beschleunigt, das Gitter bremst. Übrig bleibt eine langsame Drift — gegen die Feldrichtung, weil Elektronen negativ sind.</figcaption></figure>

**Mathematisch.** Das Drude-Modell schreibt das als Newton mit Reibung. Ein Stoß passiert im Mittel alle $\tau$ Sekunden:

$$m\,\frac{\mathrm{d}\vec{v}}{\mathrm{d}t} = -e\,\vec{E} - \frac{m}{\tau}\,\vec{v}$$

Im Gleichgewicht ist $\mathrm{d}\vec{v}/\mathrm{d}t = 0$, also

$$\vec{v}_d = -\frac{e\,\tau}{m}\,\vec{E}$$

$$\vec{j} = -n\,e\,\vec{v}_d = \underbrace{\frac{n\,e^2\,\tau}{m}}_{\sigma}\,\vec{E}$$

Das ist das ohmsche Gesetz im Kleinen: Stromdichte proportional zum Feld, mit der [[Leitfähigkeit|leitfaehigkeit]] $\sigma$ als Faktor (in der E-Technik oft $\kappa$ geschrieben). In einem gleichförmigen Draht der Länge $l$ mit Querschnitt $A$ ist das Feld überall gleich, also $U = E\,l$ und $I = j\,A$:

$$I = j\,A = \sigma\,\frac{U}{l}\,A$$

$$\boxed{U = R \cdot I} \qquad R = \frac{l}{\sigma A} = \rho\,\frac{l}{A}$$

::: herleitung Wie oft stößt ein Elektron in Kupfer?
Kupfer: $\sigma = 5{,}96 \cdot 10^{7}\,\mathrm{S/m}$, $n = 8{,}5 \cdot 10^{28}\,\mathrm{m^{-3}}$. Nach $\tau$ umgestellt:

$$\begin{aligned} \tau &= \frac{m\,\sigma}{n\,e^2} \\ &= \frac{9{,}11 \cdot 10^{-31}\,\mathrm{kg} \cdot 5{,}96 \cdot 10^{7}\,\mathrm{S/m}}{8{,}5 \cdot 10^{28}\,\mathrm{m^{-3}} \cdot (1{,}602 \cdot 10^{-19}\,\mathrm{C})^2} \\ &\approx 2{,}5 \cdot 10^{-14}\,\mathrm{s} \end{aligned}$$

Etwa alle 25 Femtosekunden — rund 40 Billionen Stöße pro Sekunde.
:::

**Leistung.** Jedes Coulomb verliert auf dem Weg durch den Widerstand die Energie $U$, und pro Sekunde kommen $I$ Coulomb durch. Das ist die [[Leistung|leistung]], die im Widerstand in Wärme umgesetzt wird:

$$P = \frac{\mathrm{d}W}{\mathrm{d}t} = U\,\frac{\mathrm{d}Q}{\mathrm{d}t} = U \cdot I = I^2 R = \frac{U^2}{R}$$

**Symbolisch.** $[R] = \Omega = \mathrm{V/A} = \mathrm{kg\,m^2/(A^2\,s^3)}$ und $[\rho] = \Omega\,\mathrm{m}$. Die Probe für $\sigma = n\,e^2\,\tau/m$:

$$\left[\frac{n\,e^2\,\tau}{m}\right] = \frac{\mathrm{m^{-3}} \cdot \mathrm{A^2\,s^2} \cdot \mathrm{s}}{\mathrm{kg}} = \frac{\mathrm{A^2\,s^3}}{\mathrm{kg\,m^3}} = \frac{1}{\Omega\,\mathrm{m}} \;\checkmark$$

::: tipp Feynman-Moment
Das ohmsche Gesetz ist kein Naturgesetz wie Newtons Gesetze, sondern eine Aussage über Materialien: Bei vielen Metallen ist der Strom zum Feld proportional, solange die Temperatur gleich bleibt. Eine Diode hält sich gar nicht daran, eine Glühlampe nur bei fester Temperatur — kalt hat ihr Draht etwa ein Zehntel des Widerstands im Betrieb. Und das Drude-Modell selbst ist klassisch: In Wirklichkeit streuen die Elektronen nicht an jedem Atom, sondern an Gitterschwingungen und Fehlstellen — das erklärt erst die Quantenmechanik. Die Form $j = \sigma E$ und die Größenordnung von $\tau$ stimmen trotzdem.
:::

## Alles auf einen Blick

| Schritt | Größe | Definition | Einheit | SI-Basis |
|:---|:---|:---|:---|:---|
| 1 | Kraft | $F = m\,a$ | N | $\mathrm{kg\,m/s^2}$ |
| 2 | Arbeit | $W = \int F\,\mathrm{d}s$ | J | $\mathrm{kg\,m^2/s^2}$ |
| 3 | Ladung | $Q = n\,e$ | C | $\mathrm{A\,s}$ |
| 4 | Feldstärke | $E = F/q$ | V/m | $\mathrm{kg\,m/(A\,s^3)}$ |
| 5 | Potential | $\varphi = E_\text{pot}/q$ | V | $\mathrm{kg\,m^2/(A\,s^3)}$ |
| 6 | Spannung | $U = \varphi_1 - \varphi_2$ | V | $\mathrm{kg\,m^2/(A\,s^3)}$ |
| 7 | Strom | $I = \mathrm{d}Q/\mathrm{d}t$ | A | $\mathrm{A}$ |
| 8 | Widerstand | $R = U/I$ | Ω | $\mathrm{kg\,m^2/(A^2\,s^3)}$ |

### Die Wasser-Analogie — und wo sie hinkt

| Stromkreis | Wasserkreislauf |
|:---|:---|
| Potential $\varphi$ | Höhe bzw. Druck |
| Spannung $U$ | Höhen- bzw. Druckunterschied |
| Strom $I$ | Durchfluss in Litern pro Sekunde |
| Widerstand $R$ | langes, enges Rohr |
| Quelle | Pumpe |
| Wärme im Widerstand | Reibung im Rohr |

Sie hinkt an zwei Stellen. Ein Wasserrohr kann leer sein, ein Draht ist immer voller Elektronen — darum geht das Licht sofort an. Und ein offenes Kabelende „läuft nicht aus“: Strom fließt nur im geschlossenen Kreis.

::: merke
Kraft mal Weg ist Arbeit. Arbeit pro Ladung ist Spannung. Ladung pro Zeit ist Strom. Newton plus Stöße im Draht machen beide proportional: $U = R \cdot I$.
:::

## Zum Selberrechnen

::: aufgabe Wie lange braucht ein Elektron durch einen Meter Kabel?
Eine Herdzuleitung aus Kupfer mit $2{,}5\,\mathrm{mm^2}$ führt $16\,\mathrm{A}$. Wie groß ist die Driftgeschwindigkeit, und wie lange braucht ein Elektron für einen Meter?
???
Mit $n\,e \approx 1{,}36 \cdot 10^{10}\,\mathrm{C/m^3}$ von oben:

$$\begin{aligned} v_d &= \frac{I}{n\,e\,A} = \frac{16\,\mathrm{A}}{1{,}36 \cdot 10^{10}\,\mathrm{C/m^3} \cdot 2{,}5 \cdot 10^{-6}\,\mathrm{m^2}} \\ &\approx 4{,}7 \cdot 10^{-4}\,\mathrm{m/s} \approx 0{,}47\,\mathrm{mm/s} \end{aligned}$$

Bei Gleichstrom bräuchte es für einen Meter $t = 1\,\mathrm{m} / v_d \approx 2100\,\mathrm{s}$, also gut eine halbe Stunde. Am Herd fließt aber Wechselstrom mit $50\,\mathrm{Hz}$: Da kommt das Elektron gar nicht voran, sondern zittert mit einer Amplitude von etwa zwei Mikrometern hin und her.
:::

::: aufgabe Das Verlängerungskabel
Ein Verlängerungskabel ist $10\,\mathrm{m}$ lang, Kupfer, $1{,}5\,\mathrm{mm^2}$ pro Ader, $\rho = 1{,}7 \cdot 10^{-8}\,\Omega\,\mathrm{m}$. Ein Heizlüfter zieht $10\,\mathrm{A}$. Wie viel Spannung und Leistung gehen im Kabel verloren?
???
Der Strom fließt hin und zurück, also $l = 20\,\mathrm{m}$:

$$\begin{aligned} R &= \rho\,\frac{l}{A} = 1{,}7 \cdot 10^{-8}\,\Omega\,\mathrm{m} \cdot \frac{20\,\mathrm{m}}{1{,}5 \cdot 10^{-6}\,\mathrm{m^2}} \\ &\approx 0{,}23\,\Omega \end{aligned}$$

$$U = R \cdot I \approx 2{,}3\,\mathrm{V} \qquad P = I^2 R \approx 23\,\mathrm{W}$$

23 Watt Wärme im Kabel. Auf einer Kabeltrommel liegen diese Windungen dicht übereinander und kühlen sich kaum — darum soll man sie bei hoher Last ganz abwickeln.
:::

::: aufgabe Ein Volt im Vakuum
Ein Elektron startet in Ruhe und durchläuft im Vakuum eine Spannung von $1\,\mathrm{V}$. Welche Energie und welche Geschwindigkeit hat es danach?
???
Arbeit ist Ladung mal Spannung: $W = e \cdot U = 1{,}602 \cdot 10^{-19}\,\mathrm{J}$ — genau ein Elektronvolt, $1\,\mathrm{eV}$. Die Energie steckt komplett in der Bewegung:

$$\begin{aligned} \tfrac{1}{2} m v^2 &= e\,U \\ v &= \sqrt{\frac{2\,e\,U}{m}} = \sqrt{\frac{2 \cdot 1{,}602 \cdot 10^{-19}\,\mathrm{C} \cdot 1\,\mathrm{V}}{9{,}11 \cdot 10^{-31}\,\mathrm{kg}}} \\ &\approx 593\,\mathrm{km/s} \end{aligned}$$

Im Kupferdraht kriechen die Elektronen dagegen mit Bruchteilen eines Millimeters pro Sekunde. Den Unterschied machen die Stöße — also genau der Widerstand.
:::

## Wie es weitergeht

Zwei Widerstände in Reihe und das ohmsche Gesetz zweimal angewendet: [Der Spannungsteiler](beitrag.html?b=spannungsteiler). Im [Labor](../labor/) steckt dieselbe Formel im Baustein Widerstand.

**Zum Weiterlesen:** die Feynman Lectures, frei online — [Band I, Kapitel 4](https://www.feynmanlectures.caltech.edu/I_04.html) über Energieerhaltung (mit den Bauklötzen), [Kapitel 13](https://www.feynmanlectures.caltech.edu/I_13.html) und [14](https://www.feynmanlectures.caltech.edu/I_14.html) über Arbeit und potentielle Energie, [Band II, Kapitel 1](https://www.feynmanlectures.caltech.edu/II_01.html) über Elektromagnetismus.
