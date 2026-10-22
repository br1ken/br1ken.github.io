---
titel: Der Spannungsteiler — und warum die Last alles ändert
datum: 2026-10-21
fach: Grundlagen der E-Technik
tags: [Widerstand, Kirchhoff, Last]
teaser: Zwei Widerstände, eine Formel. Bis man etwas anschließt. Eine kurze Notiz über belastete Teiler.
welle: rechteck
---

Der Spannungsteiler ist die erste Schaltung, die man im Studium wirklich *benutzt*: Potentiometer, Sensoren, Pegelanpassung — überall stecken zwei Widerstände in Reihe.

## Die Formel in einer Zeile

Durch $R_1$ und $R_2$ fließt derselbe Strom $I = \dfrac{U}{R_1 + R_2}$. Über $R_2$ fällt also

$$U_2 = I \cdot R_2 = U \cdot \frac{R_2}{R_1 + R_2}$$

ab. Das Verhältnis der Spannungen ist das Verhältnis der Widerstände. Zwei gleiche Widerstände halbieren die Spannung.

::: sim teiler u=12 r1=10k r2=10k rl=10k
Zuerst ohne Last spielen. Dann „Last anschließen“ anhaken und $R_L$ klein ziehen.
:::

## Der Haken: die Last

Sobald man am Ausgang etwas anschließt — einen Sensor-Eingang, einen Lautsprecher, ein Messgerät — liegt dessen Widerstand $R_L$ **parallel** zu $R_2$. Der untere Teil des Teilers wird kleiner:

$$R_2 \parallel R_L = \frac{R_2 \cdot R_L}{R_2 + R_L}$$

Und damit sinkt $U_2$. Wie stark, hängt davon ab, wie groß $R_L$ im Vergleich zu $R_2$ ist:

| $R_1 = R_2$ | $R_L$ | $U_2 / U$ |
|---|---|---:|
| 10 kΩ | ∞ (keine Last) | 0,500 |
| 10 kΩ | 100 kΩ | 0,476 |
| 10 kΩ | 10 kΩ | 0,333 |
| 10 kΩ | 1 kΩ | 0,083 |

::: merke
Ein Spannungsteiler liefert nur dann die berechnete Spannung, wenn die Last deutlich größer ist als $R_2$. Faustregel: $R_L \geq 10 \cdot R_2$ — dann bleibt der Fehler unter 10 %.
:::

::: aufgabe
Ein Teiler aus $R_1 = R_2 = 1\,\text{k}\Omega$ hängt an $12\,\text{V}$. Jemand schließt eine Last mit $R_L = 1\,\text{k}\Omega$ an. Welche Spannung misst man jetzt an $R_2$?
???
Parallelschaltung: $R_2 \parallel R_L = \frac{1\,\text{k}\Omega \cdot 1\,\text{k}\Omega}{2\,\text{k}\Omega} = 500\,\Omega$.

$$U_2 = 12\,\text{V} \cdot \frac{500\,\Omega}{1\,000\,\Omega + 500\,\Omega} = 4\,\text{V}$$

Statt der erwarteten 6 V nur noch 4 V — ein Drittel weniger.
:::

## Im Labor

Der Baustein **Widerstand** im [Labor](../labor/) ist genau so ein Teiler: Dein $R$ sitzt in Reihe vor einer festen Last von 10 kΩ. Bei $R = 10\,\text{k}\Omega$ kommt die halbe Spannung an — das hörst du als leiseren Ton.
