---
titel: Warum doppeltes C die Grenzfrequenz halbiert
datum: 2026-10-22
fach: Grundlagen der E-Technik
tags: [RC, Filter, Kondensator, Komplexe Rechnung]
teaser: Der RC-Tiefpass in drei Schritten — Spannungsteiler, Grenzfrequenz, Ladekurve. Mit einer Simulation zum Mitziehen.
welle: lade
---

Ein Widerstand, ein Kondensator — und plötzlich klingt ein Sägezahn dumpf. Der RC-Tiefpass ist vermutlich das meistgebaute Filter der Welt. Hier ist, warum er funktioniert.

## 1. Ein Spannungsteiler, der von der Frequenz abhängt

Schau dir die Schaltung an wie einen [Spannungsteiler](beitrag.html?b=spannungsteiler): oben der Widerstand $R$, unten der Kondensator $C$, abgegriffen wird über $C$. Der Unterschied: Der Kondensator hat keinen festen Widerstand, sondern einen frequenzabhängigen **Blindwiderstand** $X_C = -\frac{1}{\omega C}$. In der komplexen Rechnung schreibt man ihn als **Impedanz**:

$$\underline{Z}_C = jX_C = \frac{1}{j\omega C} \qquad \text{mit} \qquad \omega = 2\pi f$$

Bei tiefen Frequenzen ist $|\underline{Z}_C|$ riesig — fast die ganze Spannung fällt über $C$ ab. Bei hohen Frequenzen wird er winzig, der Kondensator schließt das Signal quasi kurz.

Setzt man das in die Teilerformel ein, bekommt man die **Übertragungsfunktion**:

$$\underline{H}(j\omega) = \frac{\underline{U}_a}{\underline{U}_e} = \frac{\frac{1}{j\omega C}}{R + \frac{1}{j\omega C}} = \frac{1}{1 + j\omega RC}$$

## 2. Die Grenzfrequenz

Uns interessiert vor allem der Betrag — wie viel vom Signal ankommt:

$$|\underline{H}| = \frac{1}{\sqrt{1 + (\omega RC)^2}}$$

Interessant wird es bei $\omega RC = 1$. Dann ist $|\underline{H}| = 1/\sqrt{2} \approx 0{,}707$. Das ist die **Grenzfrequenz**:

$$f_c = \frac{1}{2\pi RC}$$

::: merke
$R$ und $C$ stehen beide im Nenner. Doppeltes $C$ (oder doppeltes $R$) heißt: **halbe Grenzfrequenz**. Weit oberhalb von $f_c$ fällt der Pegel mit 20 dB pro Dekade — zehnfache Frequenz, ein Zehntel der Spannung.
:::

::: herleitung Warum heißt das „−3 dB“?
Spannungsverhältnisse rechnet man in Dezibel mit $20 \cdot \log_{10}$:

$$20 \cdot \log_{10}\left(\tfrac{1}{\sqrt{2}}\right) \approx -3{,}01\,\text{dB}$$

Bei der Grenzfrequenz ist außerdem die *Leistung* an einem ohmschen Verbraucher genau halbiert, denn $P \sim U^2$ und $(1/\sqrt{2})^2 = 1/2$.
:::

Probier es aus: Verdopple $C$ und beobachte, wie der Punkt im Bode-Diagramm nach links wandert.

::: sim rc r=10k c=22n
Oben: wie stark jede Frequenz durchkommt. Unten: wie sich der Kondensator nach dem Einschalten auflädt. Über „Im Labor anhören“ landet genau dieses Filter im Crashtest-Labor.
:::

## 3. Dieselbe Zahl im Zeitbereich

Die Grenzfrequenz hat einen Zwilling: die **Zeitkonstante** $\tau = RC$. Legt man an den anfangs leeren Kondensator über $R$ eine Gleichspannung $U_0$, lädt er sich so auf:

$$u_C(t) = U_0 \left(1 - e^{-t/\tau}\right)$$

| Zeit | erreichte Spannung |
|:-----|-----:|
| $1\tau$ | 63,2 % |
| $2\tau$ | 86,5 % |
| $3\tau$ | 95,0 % |
| $5\tau$ | 99,3 % |

Faustregel: Nach $5\tau$ gilt der Kondensator als voll geladen. Großes $\tau$ heißt langsames Laden — und genau das „Trägheitsverhalten“ glättet schnelle Änderungen im Signal. Tiefpass und Ladekurve sind dieselbe Physik, einmal im Frequenz-, einmal im Zeitbereich.

::: aufgabe Werte aus dem Labor
Im Labor steckt im Starter „Weicher · RC“ ein Kondensator mit $C = 22\,\text{nF}$ und $R = 10\,\text{k}\Omega$. Berechne $\tau$ und $f_c$.
???
$$\tau = RC = 10\,000\,\Omega \cdot 22 \cdot 10^{-9}\,\text{F} = 220\,\mu\text{s}$$

$$f_c = \frac{1}{2\pi\tau} = \frac{1}{2\pi \cdot 220\,\mu\text{s}} \approx 723\,\text{Hz}$$

Mit $C = 44\,\text{nF}$ wären es nur noch etwa $362\,\text{Hz}$.
:::

::: tipp
Hör den Unterschied: Im [Labor](../labor/) einen Sägezahn durch den Kondensator schicken und $C$ von 22 auf 100 nF ziehen. Der Klang wird immer dumpfer, weil die Obertöne oberhalb von $f_c$ immer stärker gedämpft werden.
:::
