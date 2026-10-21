---
titel: Brückenschaltung — maximale Leistung, kaum Wirkungsgrad
datum: 2026-10-22
fach: ET1 · Rechenübung 2
tags: [Brückenschaltung, Ersatzquelle, Leistungsanpassung, Wirkungsgrad, Potentiale]
teaser: Aufgabe 2.3 komplett durchgerechnet: Innenwiderstand, Leerlaufspannung, Potentiale, Wirkungsgrad — und warum die Lastleistung bei 10 Ω auf null fällt.
welle: dreieck
---

Vier Widerstände, eine Quelle, eine Last quer in der Mitte. Die Brückenschaltung sieht harmlos aus, versteckt aber gleich drei Aha-Momente: Leistungsanpassung, ein erschreckend kleiner Wirkungsgrad und eine Einstellung, bei der durch die Last überhaupt kein Strom fließt.

## Die Aufgabe

Eine Widerstandsbrücke hängt an einer idealen Gleichspannungsquelle. $R_2$ und $R_3$ sind **gekoppelt** einstellbar, haben also immer denselben Wert. Die Last $R_L$ verbindet die beiden Mittelpunkte $P_1$ und $P_2$.

| Größe | Vorgabe |
|:---|:---|
| Quellenspannung $U_q$ | $30\,\mathrm{V}$ |
| feste Widerstände $R_1 = R_4$ | $10\,\Omega$ |
| einstellbare Widerstände $R_2 = R_3$ | $0$ bis $50\,\Omega$ |
| Arbeitspunkt für Teil 1 und 2 | $R_2 = R_3 = 30\,\Omega$ |

1. Welcher Lastwiderstand $R_L$ bekommt am Arbeitspunkt die maximale Leistung?
2. Wie groß ist dabei der Wirkungsgrad?
3. Wie ändert sich die Lastleistung, wenn man $R_2 = R_3$ von $0$ bis $50\,\Omega$ verstellt und $R_L$ fest lässt?

Hier ist die Schaltung zum Mitspielen. Die [[Potentiale|potential]] beziehen sich auf den unteren Knoten ($\varphi = 0\,\mathrm{V}$). Je kräftiger ein Widerstand gefärbt ist, desto mehr Leistung verheizt er.

::: sim bruecke x=30 u=30 rl=15 anpassen
Starte am Arbeitspunkt (30 Ω, Leistungsanpassung an). Dann den Haken bei „R_L = R_i“ entfernen und $R_2 = R_3$ verschieben: Das ist Teil 3.
:::

## Teil 1: Welches $R_L$ holt das Maximum heraus?

Aus Sicht der Last ist die ganze Brücke nur eine [[Ersatzspannungsquelle|ersatzquelle]] mit Leerlaufspannung $U_0$ und Innenwiderstand $R_i$. Die Last bekommt die meiste Leistung bei [[Leistungsanpassung]]:

$$R_L = R_i$$

**Innenwiderstand:** $R_L$ entfernen, die ideale Quelle $U_q$ durch einen Kurzschluss ersetzen und den Widerstand zwischen $P_1$ und $P_2$ bestimmen. Durch den Kurzschluss werden der obere und der untere Knoten zu **einem** Knoten.

$$R_1 \parallel R_2 = \frac{10 \cdot 30}{10 + 30}\,\Omega = 7{,}5\,\Omega \qquad R_3 \parallel R_4 = \frac{30 \cdot 10}{30 + 10}\,\Omega = 7{,}5\,\Omega$$

$$R_i = (R_1 \parallel R_2) + (R_3 \parallel R_4) = 15\,\Omega \qquad\Rightarrow\qquad \boxed{R_L = 15\,\Omega}$$

::: herleitung Warum parallel und dann in Reihe?
Nach dem Kurzschluss gibt es nur noch drei Knoten: $P_1$, $P_2$ und den zusammengelegten Knoten $K$ (oben = unten).

- $R_1$ verbindet $P_1$ mit oben, $R_2$ verbindet $P_1$ mit unten. Beide führen also von $P_1$ nach $K$: Sie liegen **parallel**.
- Genauso liegen $R_3$ und $R_4$ parallel zwischen $K$ und $P_2$.
- Von $P_1$ über $K$ nach $P_2$ hintereinander: **in Reihe**.
:::

::: merke
Eine ideale Spannungsquelle hat keinen Innenwiderstand. Zum Bestimmen von $R_i$ wird sie deshalb durch einen Kurzschluss ersetzt, eine ideale Stromquelle durch eine Unterbrechung.
:::

## Teil 2: Wirkungsgrad

### a) Leerlaufspannung

Ohne Last sind beide Zweige unbelastete [[Spannungsteiler|spannungsteiler]]:

$$\varphi_{1,0} = U_q \frac{R_2}{R_1 + R_2} = 30\,\mathrm{V} \cdot \frac{30}{40} = 22{,}5\,\mathrm{V}$$

$$\varphi_{2,0} = U_q \frac{R_4}{R_3 + R_4} = 30\,\mathrm{V} \cdot \frac{10}{40} = 7{,}5\,\mathrm{V}$$

$$U_0 = \varphi_{1,0} - \varphi_{2,0} = 15\,\mathrm{V}$$

### b) Strom und Leistung in der Last

Im Ersatzkreis liegen $R_i$ und $R_L$ einfach in Reihe:

$$I_L = \frac{U_0}{R_i + R_L} = \frac{15\,\mathrm{V}}{30\,\Omega} = 0{,}5\,\mathrm{A} \qquad P_L = R_L\, I_L^2 = 15\,\Omega \cdot (0{,}5\,\mathrm{A})^2 = 3{,}75\,\mathrm{W}$$

Probe mit der Formel für Leistungsanpassung: $P_{L,\max} = \frac{U_0^2}{4 R_i} = \frac{225}{60}\,\mathrm{W} = 3{,}75\,\mathrm{W}$ ✓

### c) Potentiale mit Last

Jetzt fließt $I_L$ aus $P_1$ ab und in $P_2$ hinein. [[Knotenregel]] an $P_1$:

$$\frac{U_q - \varphi_1}{R_1} = \frac{\varphi_1}{R_2} + I_L$$

::: herleitung Nach $\varphi_1$ umstellen
$$\varphi_1 \left(\frac{1}{R_1} + \frac{1}{R_2}\right) = \frac{U_q}{R_1} - I_L
\quad\Rightarrow\quad
\varphi_1 = (R_1 \parallel R_2) \left(\frac{U_q}{R_1} - I_L\right) = \underbrace{U_q \frac{R_2}{R_1 + R_2}}_{\varphi_{1,0}} - I_L\,(R_1 \parallel R_2)$$

An $P_2$ fließt $I_L$ hinein statt hinaus, deshalb steht dort ein Plus.
:::

$$\varphi_1 = \varphi_{1,0} - I_L\,(R_1 \parallel R_2) = 22{,}5\,\mathrm{V} - 0{,}5\,\mathrm{A} \cdot 7{,}5\,\Omega = 18{,}75\,\mathrm{V}$$

$$\varphi_2 = \varphi_{2,0} + I_L\,(R_3 \parallel R_4) = 7{,}5\,\mathrm{V} + 0{,}5\,\mathrm{A} \cdot 7{,}5\,\Omega = 11{,}25\,\mathrm{V}$$

Probe: $U_L = \varphi_1 - \varphi_2 = 7{,}5\,\mathrm{V} = R_L\, I_L$ ✓

### d) Was die Quelle liefert

Der Quellenstrom teilt sich oben auf $R_1$ und $R_3$ auf. Mit der Knotenregel an $P_2$ ($I_{R_3} = I_{R_4} - I_L$) braucht man nur die festen Widerstände im Nenner. Das ist praktisch, weil $R_3$ auch $0\,\Omega$ sein darf:

$$I_q = \frac{U_q - \varphi_1}{R_1} + \frac{\varphi_2}{R_4} - I_L = 1{,}125\,\mathrm{A} + 1{,}125\,\mathrm{A} - 0{,}5\,\mathrm{A} = 1{,}75\,\mathrm{A}$$

$$P_q = U_q\, I_q = 30\,\mathrm{V} \cdot 1{,}75\,\mathrm{A} = 52{,}5\,\mathrm{W}$$

Wohin gehen diese 52,5 W? Die Leistungsbilanz ist die beste Probe:

| Widerstand | Strom | [[Leistung]] $P = R\,I^2$ |
|:---|---:|---:|
| $R_1 = 10\,\Omega$ | $1{,}125\,\mathrm{A}$ | $12{,}66\,\mathrm{W}$ |
| $R_2 = 30\,\Omega$ | $0{,}625\,\mathrm{A}$ | $11{,}72\,\mathrm{W}$ |
| $R_3 = 30\,\Omega$ | $0{,}625\,\mathrm{A}$ | $11{,}72\,\mathrm{W}$ |
| $R_4 = 10\,\Omega$ | $1{,}125\,\mathrm{A}$ | $12{,}66\,\mathrm{W}$ |
| $R_L = 15\,\Omega$ | $0{,}5\,\mathrm{A}$ | $3{,}75\,\mathrm{W}$ |
| **Summe** | | $\mathbf{52{,}5\,W}$ ✓ |

### e) Wirkungsgrad

$$\eta = \frac{P_L}{P_q} = \frac{3{,}75\,\mathrm{W}}{52{,}5\,\mathrm{W}} \approx 7{,}14\,\%$$

::: merke
Leistungsanpassung maximiert die Leistung **an der Last**, nicht den [[Wirkungsgrad]]. Bezogen auf die Ersatzquelle wären es 50 %. In der echten Schaltung ziehen die Brückenwiderstände aber ständig Strom und verheizen fast 49 W — übrig bleiben gut 7 %.
:::

## Teil 3: Die Brücke verstellen, die Last bleibt

Jetzt bleibt $R_L = 15\,\Omega$ fest, und $R_2 = R_3 = x$ läuft von $0$ bis $50\,\Omega$. Mit $a = R_1 = R_4 = 10\,\Omega$ lassen sich alle Größen als Funktion von $x$ schreiben:

$$U_0(x) = U_q \left(\frac{x}{a + x} - \frac{a}{x + a}\right) = U_q\, \frac{x - a}{x + a} \qquad R_i(x) = 2 \cdot \frac{a\,x}{a + x}$$

$$P_L(x) = R_L \left(\frac{U_0}{R_i + R_L}\right)^2 = \frac{R_L\, U_q^2\, (x - a)^2}{\big(2 a x + R_L (x + a)\big)^2}$$

| $R_2 = R_3$ | $0\,\Omega$ | $5\,\Omega$ | $10\,\Omega$ | $20\,\Omega$ | $30\,\Omega$ | $40\,\Omega$ | $50\,\Omega$ |
|:---|---:|---:|---:|---:|---:|---:|---:|
| $P_L$ | $60\,\mathrm{W}$ | $3{,}20\,\mathrm{W}$ | $0\,\mathrm{W}$ | $1{,}87\,\mathrm{W}$ | $3{,}75\,\mathrm{W}$ | $5{,}06\,\mathrm{W}$ | $5{,}98\,\mathrm{W}$ |

Drei Stellen sind besonders:

- **$x = 10\,\Omega$, Brückenabgleich:** Beide Teiler teilen gleich, $\varphi_1 = \varphi_2$. Dann ist $U_0 = 0$ und durch die Last fließt kein Strom, egal wie groß $R_L$ ist.
- **$x = 0\,\Omega$, Maximum im Bereich:** $P_1$ liegt direkt unten, $P_2$ direkt oben. Die Last hängt unmittelbar an der Quelle: $P_L = U_q^2 / R_L = 900 / 15\,\mathrm{W} = 60\,\mathrm{W}$. Der Strom fließt jetzt von $P_2$ nach $P_1$, denn $U_0$ ist negativ.
- **$x = 30\,\Omega$, Arbeitspunkt:** $3{,}75\,\mathrm{W}$ wie in Teil 2. Für sehr große $x$ würde $P_L$ gegen $R_L\,U_q^2 / (2a + R_L)^2 \approx 11{,}0\,\mathrm{W}$ streben.

::: herleitung Allgemeine Abgleichbedingung
$U_0 = 0$ heißt, beide Teiler liefern dasselbe Potential:

$$\frac{R_2}{R_1 + R_2} = \frac{R_4}{R_3 + R_4} \quad\Leftrightarrow\quad R_2 (R_3 + R_4) = R_4 (R_1 + R_2) \quad\Leftrightarrow\quad \boxed{R_1 R_4 = R_2 R_3}$$

Mit $R_2 = R_3 = x$ und $R_1 = R_4 = a$ folgt $x^2 = a^2$, also $x = 10\,\Omega$. Genau so funktioniert die Wheatstone-Brücke zum Messen unbekannter Widerstände.
:::

Probier den Abgleich selbst. Hier startet die Simulation mit fester Last genau bei $10\,\Omega$:

::: sim bruecke x=10 u=30 rl=15
Der Punkt im Diagramm sitzt auf der Nullstelle. Beide Potentiale auf der Skala rechts liegen übereinander, die Last bleibt blass.
:::

::: aufgabe Selbst rechnen
Gleiche Schaltung, aber $R_2 = R_3 = 20\,\Omega$ und die Last wieder angepasst. Berechne $R_i$, $U_0$, $P_L$ und $\eta$.
???
$$R_i = 2 \cdot \frac{10 \cdot 20}{30}\,\Omega \approx 13{,}33\,\Omega \qquad U_0 = 30\,\mathrm{V} \cdot \frac{20 - 10}{20 + 10} = 10\,\mathrm{V}$$

$$P_L = \frac{U_0^2}{4 R_i} = \frac{100}{53{,}33}\,\mathrm{W} = 1{,}875\,\mathrm{W}$$

Mit $I_L = 0{,}375\,\mathrm{A}$ werden $\varphi_1 = 17{,}5\,\mathrm{V}$ und $\varphi_2 = 12{,}5\,\mathrm{V}$, also $I_q = 1{,}25 + 1{,}25 - 0{,}375 = 2{,}125\,\mathrm{A}$ und $P_q = 63{,}75\,\mathrm{W}$:

$$\eta = \frac{1{,}875}{63{,}75} \approx 2{,}9\,\%$$

Kontrolle: Stell in der ersten Simulation $20\,\Omega$ ein und lass den Haken bei der Leistungsanpassung gesetzt.
:::

## Ergebnisse auf einen Blick

| Untersuchung | Ergebnis |
|:---|:---|
| angepasste Last bei $R_2 = R_3 = 30\,\Omega$ | $R_L = R_i = 15\,\Omega$ |
| Lastleistung am Arbeitspunkt | $P_L = 3{,}75\,\mathrm{W}$ |
| Quellenleistung am Arbeitspunkt | $P_q = 52{,}5\,\mathrm{W}$ |
| Wirkungsgrad am Arbeitspunkt | $\eta \approx 7{,}14\,\%$ |
| Nullstelle bei fester Last (Abgleich) | $R_2 = R_3 = 10\,\Omega$ |
| Maximum für $0 \le R_2 = R_3 \le 50\,\Omega$ | $60\,\mathrm{W}$ bei $0\,\Omega$ |

## Nachgerechnet in Python

Im Jupyter-Notebook zur Rechenübung steckt jeder Schritt in einer eigenen Funktion. Der Kern:

```python
def parallel(Rx, Ry):
    return 0 if Rx == Ry == 0 else Rx * Ry / (Rx + Ry)

def inner_resistance(R):           # R = [R1, R2, R3, R4]
    return parallel(R[0], R[1]) + parallel(R[2], R[3])

def open_circuit_voltage(R, Uq):
    phi1 = Uq * R[1] / (R[0] + R[1])
    phi2 = Uq * R[3] / (R[2] + R[3])
    return phi1 - phi2

def load_power(R, Uq, Rl):
    IL = open_circuit_voltage(R, Uq) / (inner_resistance(R) + Rl)
    return Rl * IL ** 2

R, Uq = [10, 30, 30, 10], 30
print(load_power(R, Uq, inner_resistance(R)))   # 3.75
```

Die Simulation oben rechnet mit genau diesen Formeln, nur live im Browser.
