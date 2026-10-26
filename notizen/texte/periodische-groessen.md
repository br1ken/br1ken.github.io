---
titel: Mittelwert, Gleichrichtwert, Effektivwert — periodische Größen richtig mitteln
datum: 2026-10-26
fach: Grundlagen der E-Technik
art: theorie
tags: [Sinus, Mittelwert, Gleichrichtwert, Effektivwert, Leistung, Integrieren, Rechteck]
teaser: Warum die Steckdose 230 V hat, obwohl die Spannung bis 325 V hochgeht. Drei Arten zu mitteln, sin² = ½ ohne Integral, Rechteck und PWM, und Integrier-Tricks für die Prüfung.
welle: sinus
---

Eine Wechselspannung ändert sich ständig. Trotzdem will man sie mit **einer** Zahl beschreiben: „Die Steckdose hat 230 V.“ Welche Zahl ist das, wenn die Spannung zwischen $-325\,\mathrm{V}$ und $+325\,\mathrm{V}$ pendelt? Es gibt drei sinnvolle Antworten, und jede beantwortet eine andere Frage. Diese Notiz zeigt, wie man sie berechnet, was sie bedeuten und mit welchen Tricks die Integrale fast von selbst gehen.

## Auf einen Blick

::: merke Die drei Mittelwerte
Für eine periodische Größe $u(t)$ mit der Periodendauer $T$:

**Mittelwert** (Gleichanteil): Was bleibt im Schnitt übrig?

$$\bar{u} = \frac{1}{T}\int_0^T u(t)\,\mathrm{d}t$$

**Gleichrichtwert:** Wie groß ist der Betrag im Schnitt?

$$\overline{|u|} = \frac{1}{T}\int_0^T |u(t)|\,\mathrm{d}t$$

**Effektivwert:** Welche Gleichspannung heizt einen Widerstand gleich stark?

$$U = \sqrt{\frac{1}{T}\int_0^T u^2(t)\,\mathrm{d}t}$$

**Für den Sinus** $u = \hat{u}\sin(\omega t)$:

- Mittelwert: $0$
- Gleichrichtwert: $\frac{2}{\pi}\hat{u} \approx 0{,}637\,\hat{u}$
- Effektivwert: $\frac{\hat{u}}{\sqrt{2}} \approx 0{,}707\,\hat{u}$

**Der wichtigste Trick:** Über eine volle Periode ist der Mittelwert von $\sin^2$ und von $\cos^2$ genau $\frac{1}{2}$.
:::

## 1. Sinus und Kosinus

Eine sinusförmige Spannung beschreiben drei Zahlen:

$$u(t) = \hat{u} \cdot \sin(\omega t + \varphi)$$

| Größe | Bedeutung | Netz in Europa |
|:---|:---|:---|
| $\hat{u}$ | Amplitude, der Scheitelwert | $325\,\mathrm{V}$ |
| $f = \frac{1}{T}$ | [[Frequenz]], Perioden pro Sekunde | $50\,\mathrm{Hz}$ |
| $T$ | [[Periodendauer]] | $20\,\mathrm{ms}$ |
| $\omega = 2\pi f$ | [[Kreisfrequenz]] | $314\,\mathrm{s^{-1}}$ |
| $\varphi$ | Nullphase, die Verschiebung beim Start | beliebig |

Der **Kosinus** ist kein neues Signal, sondern ein um eine Viertelperiode vorgezogener Sinus:

$$\cos(x) = \sin\left(x + \frac{\pi}{2}\right)$$

Für alle Mittelwerte über eine volle Periode ist das egal. Eine Verschiebung ändert nur, **wann** etwas passiert, nicht **wie viel**. Deshalb gelten alle Ergebnisse unten für Sinus und Kosinus gleichermaßen, mit jeder Phase $\varphi$.

::: sim welle u=5 f=2 phi=0
Zieh an Amplitude, Frequenz und Phase. Der Effektivwert hängt nur von der Amplitude ab.
:::

## 2. Der Mittelwert (Gleichanteil)

Der Mittelwert ist die Höhe eines Rechtecks, das über eine Periode dieselbe Fläche hat wie die Kurve:

$$\bar{u} = \frac{1}{T}\int_0^T u(t)\,\mathrm{d}t = \frac{\text{Fläche unter der Kurve}}{T}$$

Flächen unter der Nulllinie zählen dabei **negativ**.

<figure class="dia"><svg viewBox="0 0 360 190" role="img" aria-label="Ein Sinus über eine Periode. Die positive Halbwelle oben und die negative Halbwelle unten sind gleich große Flächen, zusammen null.">
<path class="hl" d="M40.0 95.0L46.2 87.2L52.5 79.5L58.8 72.0L65.0 65.0L71.2 58.5L77.5 52.6L83.8 47.4L90.0 43.0L96.2 39.6L102.5 37.0L108.8 35.5L115.0 35.0L121.3 35.5L127.5 37.0L133.8 39.6L140.0 43.0L146.2 47.4L152.5 52.6L158.8 58.5L165.0 65.0L171.2 72.0L177.5 79.5L183.8 87.2L190.0 95.0Z"/><path class="hl" d="M190.0 95.0L196.2 102.8L202.5 110.5L208.8 118.0L215.0 125.0L221.3 131.5L227.5 137.4L233.7 142.6L240.0 147.0L246.2 150.4L252.5 153.0L258.8 154.5L265.0 155.0L271.2 154.5L277.5 153.0L283.8 150.4L290.0 147.0L296.2 142.6L302.5 137.4L308.8 131.5L315.0 125.0L321.2 118.0L327.5 110.5L333.7 102.8L340.0 95.0Z" style="fill-opacity:.15"/>
<path class="m" d="M40 95H346M40 26V164M115 91V99M190 91V99M265 91V99M340 91V99"/>
<path class="s" d="M40.0 95.0L46.2 87.2L52.5 79.5L58.8 72.0L65.0 65.0L71.2 58.5L77.5 52.6L83.8 47.4L90.0 43.0L96.2 39.6L102.5 37.0L108.8 35.5L115.0 35.0L121.3 35.5L127.5 37.0L133.8 39.6L140.0 43.0L146.2 47.4L152.5 52.6L158.8 58.5L165.0 65.0L171.2 72.0L177.5 79.5L183.8 87.2L190.0 95.0"/><path class="s" d="M190.0 95.0L196.2 102.8L202.5 110.5L208.8 118.0L215.0 125.0L221.3 131.5L227.5 137.4L233.7 142.6L240.0 147.0L246.2 150.4L252.5 153.0L258.8 154.5L265.0 155.0L271.2 154.5L277.5 153.0L283.8 150.4L290.0 147.0L296.2 142.6L302.5 137.4L308.8 131.5L315.0 125.0L321.2 118.0L327.5 110.5L333.7 102.8L340.0 95.0"/>
<text class="c" x="115" y="80">+2û/ω</text><text class="c" x="265" y="120">−2û/ω</text>
<text class="k" x="46" y="22">u</text><text class="k" x="34" y="39" text-anchor="end">û</text><text class="k" x="34" y="159" text-anchor="end">−û</text>
<text class="k c" x="190" y="180">T/2</text><text class="k c" x="334" y="180">T</text><text class="k" x="348" y="99">t</text>
</svg><figcaption>Der Sinus hat oben und unten gleich viel Fläche. Zusammen ergibt das null, also ist der Mittelwert null.</figcaption></figure>

**Gerechnet:** Mit der Stammfunktion $\int \sin(\omega t)\,\mathrm{d}t = -\frac{1}{\omega}\cos(\omega t)$:

$$\begin{aligned} \bar{u} &= \frac{\hat{u}}{T}\left[-\frac{\cos(\omega t)}{\omega}\right]_0^T \\ &= \frac{\hat{u}}{\omega T}\big(-\cos(2\pi) + \cos(0)\big) = \frac{\hat{u}}{\omega T}(-1 + 1) = 0 \end{aligned}$$

Ein reiner Sinus hat keinen Gleichanteil. Liegt er auf einer Gleichspannung, $u = U_0 + \hat{u}\sin(\omega t)$, ist der Mittelwert genau dieses $U_0$. Darum heißt der Mittelwert auch **Gleichanteil**: Er ist der Teil, den ein Gleichspannungs-Messgerät anzeigt, und der Teil, der durch einen Kondensator nicht durchkommt.

::: tipp Trick: volle Perioden sind null
Jede Sinus- oder Kosinusschwingung, die über eine **ganze Zahl von Perioden** gemittelt wird, liefert null. Egal welche Amplitude, Frequenz oder Phase. Das spart bei Mischsignalen viel Rechnerei: Nur der konstante Anteil überlebt.
:::

## 3. Der Gleichrichtwert

Der Mittelwert sagt beim Sinus nur „null“, das ist wenig hilfreich. Der **Gleichrichtwert** klappt vorher alles Negative nach oben und mittelt dann:

$$\overline{|u|} = \frac{1}{T}\int_0^T |u(t)|\,\mathrm{d}t$$

Genau das macht ein Brückengleichrichter. Der Gleichrichtwert ist also die Gleichspannung, die nach einem Zweiweg-Gleichrichter im Schnitt herauskommt.

<figure class="dia"><svg viewBox="0 0 360 180" role="img" aria-label="Der Betrag des Sinus: zwei gleiche Höcker über eine Periode. Eine gestrichelte Linie bei 2 durch pi mal û markiert den Gleichrichtwert.">
<path class="hl" d="M40.0 150.0L46.2 135.6L52.5 121.5L58.8 107.9L65.0 95.0L71.2 83.0L77.5 72.2L83.8 62.7L90.0 54.7L96.2 48.4L102.5 43.7L108.8 40.9L115.0 40.0L121.3 40.9L127.5 43.7L133.8 48.4L140.0 54.7L146.2 62.7L152.5 72.2L158.8 83.0L165.0 95.0L171.2 107.9L177.5 121.5L183.8 135.6L190.0 150.0L196.2 135.6L202.5 121.5L208.8 107.9L215.0 95.0L221.3 83.0L227.5 72.2L233.7 62.7L240.0 54.7L246.3 48.4L252.5 43.7L258.8 40.9L265.0 40.0L271.2 40.9L277.5 43.7L283.8 48.4L290.0 54.7L296.2 62.7L302.5 72.2L308.8 83.0L315.0 95.0L321.3 107.9L327.5 121.5L333.8 135.6L340.0 150.0Z" style="fill-opacity:.3"/>
<path class="m" d="M40 150H346M40 26V154M115 146V154M190 146V154M265 146V154M340 146V154"/>
<path class="s" d="M40.0 150.0L46.2 135.6L52.5 121.5L58.8 107.9L65.0 95.0L71.2 83.0L77.5 72.2L83.8 62.7L90.0 54.7L96.2 48.4L102.5 43.7L108.8 40.9L115.0 40.0L121.3 40.9L127.5 43.7L133.8 48.4L140.0 54.7L146.2 62.7L152.5 72.2L158.8 83.0L165.0 95.0L171.2 107.9L177.5 121.5L183.8 135.6L190.0 150.0L196.2 135.6L202.5 121.5L208.8 107.9L215.0 95.0L221.3 83.0L227.5 72.2L233.7 62.7L240.0 54.7L246.3 48.4L252.5 43.7L258.8 40.9L265.0 40.0L271.2 40.9L277.5 43.7L283.8 48.4L290.0 54.7L296.2 62.7L302.5 72.2L308.8 83.0L315.0 95.0L321.3 107.9L327.5 121.5L333.8 135.6L340.0 150.0"/>
<path class="s d" d="M40 80H340"/>
<text class="k" x="46" y="22">|u|</text><text class="k" x="34" y="44" text-anchor="end">û</text><text class="k" x="34" y="154" text-anchor="end">0</text>
<text class="k c" x="190" y="74">2û/π</text>
<text class="k c" x="190" y="170">T/2</text><text class="k c" x="334" y="170">T</text>
</svg><figcaption>Gleichgerichteter Sinus: Beide Halbwellen zeigen nach oben. Die gestrichelte Linie ist der Gleichrichtwert.</figcaption></figure>

**Gerechnet:** Beide Halbwellen sind gleich, also reicht eine. Mit $x = \omega t$ läuft eine Halbwelle von $0$ bis $\pi$:

$$\int_0^\pi \sin(x)\,\mathrm{d}x = \big[-\cos(x)\big]_0^\pi = -(-1) + 1 = 2$$

Die Fläche einer Halbwelle ist also genau $2$ (in Einheiten von $\hat{u}$ und $x$). Geteilt durch die Länge $\pi$ der Halbwelle:

$$\overline{|u|} = \frac{2}{\pi}\,\hat{u} \approx 0{,}637\,\hat{u}$$

::: info Gut zu merken
Die Fläche unter einer Sinus-Halbwelle ist genau $2$. Das braucht man immer wieder, beim Gleichrichtwert, bei Einweggleichrichtung, bei Fourier-Reihen.
:::

## 4. Der Effektivwert

### Was er bedeutet

Hängt man einen Widerstand an eine Wechselspannung, wird er warm. Der **Effektivwert** ist die Gleichspannung, die denselben Widerstand **genau gleich warm** machen würde.

Die Leistung an einem Widerstand ist $p(t) = \frac{u^2(t)}{R}$. Sie hängt vom **Quadrat** der Spannung ab. Darum muss man die Spannung erst quadrieren, dann mitteln. Damit die Einheit wieder Volt ist, zieht man am Ende die Wurzel:

$$U = \sqrt{\frac{1}{T}\int_0^T u^2(t)\,\mathrm{d}t}$$

Englisch heißt das **RMS**, *root mean square*: Wurzel aus dem Mittelwert des Quadrats. Die Reihenfolge steht im Namen, nur rückwärts gelesen.

### Der Effektivwert des Sinus

Gesucht ist der Mittelwert von $\hat{u}^2 \sin^2(\omega t)$. Das Problem: $\sin^2$ lässt sich nicht direkt integrieren. Die Lösung ist eine Identität, die das Quadrat in eine doppelte Frequenz umwandelt:

$$\sin^2(x) = \frac{1 - \cos(2x)}{2}$$

Jetzt ist es leicht. Der Kosinus mittelt sich über eine volle Periode weg (Trick aus Abschnitt 2), übrig bleibt die $\frac{1}{2}$:

$$\begin{aligned} \overline{\sin^2(\omega t)} &= \frac{1}{T}\int_0^T \frac{1 - \cos(2\omega t)}{2}\,\mathrm{d}t \\ &= \frac{1}{2} - \underbrace{\frac{1}{2T}\int_0^T \cos(2\omega t)\,\mathrm{d}t}_{= 0} = \frac{1}{2} \end{aligned}$$

Damit:

$$U = \sqrt{\hat{u}^2 \cdot \frac{1}{2}} = \frac{\hat{u}}{\sqrt{2}} \approx 0{,}707\,\hat{u}$$

<figure class="dia"><svg viewBox="0 0 360 180" role="img" aria-label="sin² und cos² über eine Periode. Beide schwingen zwischen 0 und 1 mit doppelter Frequenz, gegeneinander versetzt. Ihr gemeinsamer Mittelwert liegt bei einhalb.">
<path class="m" d="M40 150H346M40 26V154M115 146V154M190 146V154M265 146V154M340 146V154"/>
<path class="s" d="M40.0 150.0L46.2 148.1L52.5 142.6L58.8 133.9L65.0 122.5L71.2 109.2L77.5 95.0L83.8 80.8L90.0 67.5L96.2 56.1L102.5 47.4L108.8 41.9L115.0 40.0L121.3 41.9L127.5 47.4L133.8 56.1L140.0 67.5L146.2 80.8L152.5 95.0L158.8 109.2L165.0 122.5L171.2 133.9L177.5 142.6L183.8 148.1L190.0 150.0L196.2 148.1L202.5 142.6L208.8 133.9L215.0 122.5L221.3 109.2L227.5 95.0L233.7 80.8L240.0 67.5L246.3 56.1L252.5 47.4L258.8 41.9L265.0 40.0L271.2 41.9L277.5 47.4L283.8 56.1L290.0 67.5L296.2 80.8L302.5 95.0L308.8 109.2L315.0 122.5L321.3 133.9L327.5 142.6L333.8 148.1L340.0 150.0"/><path class="s d" d="M40.0 40.0L46.2 41.9L52.5 47.4L58.8 56.1L65.0 67.5L71.2 80.8L77.5 95.0L83.8 109.2L90.0 122.5L96.2 133.9L102.5 142.6L108.8 148.1L115.0 150.0L121.3 148.1L127.5 142.6L133.8 133.9L140.0 122.5L146.2 109.2L152.5 95.0L158.8 80.8L165.0 67.5L171.2 56.1L177.5 47.4L183.8 41.9L190.0 40.0L196.2 41.9L202.5 47.4L208.8 56.1L215.0 67.5L221.3 80.8L227.5 95.0L233.7 109.2L240.0 122.5L246.3 133.9L252.5 142.6L258.8 148.1L265.0 150.0L271.2 148.1L277.5 142.6L283.8 133.9L290.0 122.5L296.2 109.2L302.5 95.0L308.8 80.8L315.0 67.5L321.3 56.1L327.5 47.4L333.8 41.9L340.0 40.0" style="opacity:.6"/>
<path class="m d" d="M40 95H340"/>
<text class="k" x="34" y="44" text-anchor="end">1</text><text class="k" x="34" y="99" text-anchor="end">½</text><text class="k" x="34" y="154" text-anchor="end">0</text>
<text class="k c" x="190" y="170">T/2</text><text class="k c" x="334" y="170">T</text>
<path class="s" d="M232 14H250"/><text class="k" x="256" y="18">sin²</text><path class="s d" d="M290 14H308" style="opacity:.6"/><text class="k" x="314" y="18">cos²</text>
</svg><figcaption>sin² (durchgezogen) und cos² (gestrichelt) sind Spiegelbilder um die Linie bei ½. Wo das eine hoch ist, ist das andere tief, und die Summe ist immer genau 1.</figcaption></figure>

::: tipp Der schnellste Weg zu ½, ganz ohne Integral
Über eine volle Periode sehen $\sin^2$ und $\cos^2$ gleich aus, nur verschoben. Also haben sie denselben Mittelwert, nennen wir ihn $m$. Gleichzeitig gilt immer $\sin^2 + \cos^2 = 1$. Mittelwerte addieren sich, also

$$m + m = 1 \quad\Rightarrow\quad m = \frac{1}{2}$$

Das funktioniert in der Prüfung in zehn Sekunden und ist ein vollständiger Beweis.
:::

### Die Steckdose

Die 230 V auf dem Typenschild sind der **Effektivwert**. Damit:

$$\begin{aligned} \hat{u} &= \sqrt{2} \cdot 230\,\mathrm{V} \approx 325\,\mathrm{V} \\ \overline{|u|} &= \frac{2}{\pi} \cdot 325\,\mathrm{V} \approx 207\,\mathrm{V} \end{aligned}$$

Der Mittelwert ist $0\,\mathrm{V}$. Ein Wasserkocher an 230 V Wechselspannung heizt genauso wie an 230 V Gleichspannung, obwohl die Spannung kurzzeitig 325 V erreicht und zwischendurch durch null geht.

::: info Messgeräte
Einfache Multimeter messen den Gleichrichtwert und rechnen ihn mit dem Faktor $1{,}11$ auf den Effektivwert um. Das stimmt **nur für Sinus**. Bei Rechteck oder verzerrten Signalen zeigen sie falsche Werte. Geräte mit der Aufschrift **True RMS** rechnen den Effektivwert wirklich aus.
:::

## 5. Leistung bei Wechselstrom

Die Momentanleistung ist das Produkt der Augenblickswerte, $p(t) = u(t) \cdot i(t)$. Was zählt, ist ihr **Mittelwert**, die Wirkleistung $P$. An einem Widerstand gilt mit $u = R \cdot i$:

$$P = \overline{p(t)} = R \cdot \overline{i^2} = R \cdot I^2 = \frac{U^2}{R} = U \cdot I$$

Mit Effektivwerten sehen alle Formeln aus wie bei Gleichstrom. Genau dafür wurden sie erfunden. Für Sinus heißt das ausgeschrieben:

$$P = \frac{1}{2}\,R\,\hat{i}^2 = \frac{1}{2}\,\hat{u}\,\hat{i}$$

Ein durchgerechnetes Beispiel mit Integral steht in [A2.2 · Gemischte Widerstandsschaltung bei Wechselstrom](beitrag.html?b=gemischte-schaltung-wechselstrom).

::: achtung Mittelwert der Leistung ist nicht Produkt der Mittelwerte
$\overline{u \cdot i} \neq \bar{u} \cdot \bar{i}$. Beim Sinus sind $\bar{u}$ und $\bar{i}$ beide null, die Leistung ist es aber nicht. Leistung immer mit Effektivwerten rechnen, oder $p(t)$ erst bilden und dann mitteln.
:::

## 6. Integrier-Tricks für die Prüfung

### Die Identitäten

| Ausdruck | umgeformt | Mittelwert über $T$ |
|:---|:---|:---:|
| $\sin^2 x$ | $\frac{1}{2}\big(1 - \cos 2x\big)$ | $\frac{1}{2}$ |
| $\cos^2 x$ | $\frac{1}{2}\big(1 + \cos 2x\big)$ | $\frac{1}{2}$ |
| $\sin x \cos x$ | $\frac{1}{2}\sin 2x$ | $0$ |
| $\sin^2 x + \cos^2 x$ | $1$ | $1$ |

Woher die ersten beiden kommen: Aus dem Additionstheorem $\cos(2x) = \cos^2 x - \sin^2 x$ und $\sin^2 x + \cos^2 x = 1$. Addiert oder subtrahiert man die beiden Gleichungen, fällt jeweils eins der Quadrate heraus.

### Die Tricks

- **Substituieren:** Mit $x = \omega t$ wird aus $\frac{1}{T}\int_0^T \ldots\,\mathrm{d}t$ einfach $\frac{1}{2\pi}\int_0^{2\pi} \ldots\,\mathrm{d}x$. Dann rechnet man nur noch mit Winkeln, $\omega$ und $T$ verschwinden.
- **Volle Perioden sind null:** $\sin(n x)$ und $\cos(n x)$ mitteln sich über $0$ bis $2\pi$ immer weg, für jede ganze Zahl $n \geq 1$.
- **Innerer Faktor:** $\int \cos(a t)\,\mathrm{d}t = \frac{1}{a}\sin(a t)$. Beim Integrieren wird durch $a$ **geteilt**, beim Ableiten multipliziert.
- **Symmetrie nutzen:** Sind alle Halbwellen gleich, rechnet man nur eine und teilt durch ihre Länge statt durch $T$.
- **Flächen statt Integrale:** Bei Rechteck, Dreieck und Trapez ist das Integral einfach eine Fläche aus der Geometrie. Kein Integral nötig.
- **Mischsignale:** Bei $u = U_0 + \hat{u}\sin(\omega t)$ fällt beim Quadrieren der gemischte Term $2U_0\hat{u}\sin(\omega t)$ beim Mitteln weg. Übrig bleibt

$$U^2 = U_0^2 + \frac{\hat{u}^2}{2}$$

Gleichanteil und Wechselanteil addieren sich also „wie Pythagoras“: Effektivwert zum Quadrat ist Gleichanteil zum Quadrat plus Wechsel-Effektivwert zum Quadrat.

## 7. Rechteck und andere Kurvenformen

### Das Rechteck mit Tastgrad

Eine Spannung springt zwischen $0$ und $\hat{u}$ hin und her. Sie ist für einen Anteil $D$ der Periode eingeschaltet, dem **Tastgrad**. So steuert man LEDs und Motoren mit **PWM** (Pulsweitenmodulation).

<figure class="dia"><svg viewBox="0 0 360 182" role="img" aria-label="Rechteckspannung mit Tastgrad 25 Prozent über zwei Perioden. Sie ist ein Viertel der Zeit auf û, sonst null. Der Mittelwert liegt bei einem Viertel von û, der Effektivwert bei der Hälfte.">
<path class="hl" d="M40 150V40H77.5V150ZM190 150V40H227.5V150Z" style="fill-opacity:.35"/>
<path class="m" d="M40 150H346M40 26V154M190 146V154M340 146V154"/>
<path class="s" d="M40 150V40H77.5V150H190V40H227.5V150H340"/>
<path class="s d" d="M40 122.5H340"/><path class="m d" d="M40 95H340"/>
<text class="k" x="34" y="44" text-anchor="end">û</text><text class="k" x="34" y="154" text-anchor="end">0</text>
<text class="k" x="236" y="118">MITTELWERT D·û = û/4</text><text class="k" x="236" y="90">EFFEKTIV √D·û = û/2</text>
<text class="k c" x="59" y="34">D·T</text>
<text class="k c" x="190" y="170">T</text><text class="k c" x="334" y="170">2T</text>
</svg><figcaption>PWM mit D = 25 %: Die markierte Fläche pro Periode ist û · D · T. Der Mittelwert liegt bei ¼ û, der Effektivwert deutlich höher bei ½ û.</figcaption></figure>

Hier braucht man kein Integral, nur Rechteckflächen:

$$\begin{aligned} \bar{u} &= \frac{\hat{u} \cdot D T}{T} = D \cdot \hat{u} \\ U &= \sqrt{\frac{\hat{u}^2 \cdot D T}{T}} = \sqrt{D} \cdot \hat{u} \end{aligned}$$

Weil die Spannung nie negativ ist, ist der Gleichrichtwert gleich dem Mittelwert.

::: achtung Heizen mit PWM
Eine Heizung mit $6\,\Omega$ hängt an $12\,\mathrm{V}$ PWM mit $D = 25\,\%$. Der Mittelwert ist $3\,\mathrm{V}$. Wer damit rechnet, bekommt $P = \frac{(3\,\mathrm{V})^2}{6\,\Omega} = 1{,}5\,\mathrm{W}$. **Falsch.**

Richtig ist der Effektivwert $\sqrt{0{,}25} \cdot 12\,\mathrm{V} = 6\,\mathrm{V}$:

$$P = \frac{(6\,\mathrm{V})^2}{6\,\Omega} = 6\,\mathrm{W}$$

Probe von Hand: Ein Viertel der Zeit fließen volle $\frac{144}{6} = 24\,\mathrm{W}$, im Schnitt also $6\,\mathrm{W}$ ✓
:::

### Kurvenformen im Vergleich

Alle mit Scheitelwert $\hat{u}$, die Zahlen sind jeweils **mal $\hat{u}$** zu lesen:

| Form | Mittel | Gleichr. | Eff. |
|:---|:---:|:---:|:---:|
| Sinus | $0$ | $0{,}637$ | $0{,}707$ |
| Zweiweg | $0{,}637$ | $0{,}637$ | $0{,}707$ |
| Einweg | $0{,}318$ | $0{,}318$ | $0{,}5$ |
| Rechteck | $0$ | $1$ | $1$ |
| PWM, $D$ | $D$ | $D$ | $\sqrt{D}$ |
| Dreieck | $0$ | $0{,}5$ | $0{,}577$ |

Spalten: Mittelwert, Gleichrichtwert, Effektivwert. Zweiweg und Einweg sind gleichgerichtete Sinusse. Rechteck und Dreieck pendeln symmetrisch zwischen $-\hat{u}$ und $+\hat{u}$, PWM ist das Rechteck von $0$ bis $\hat{u}$ mit Tastgrad $D$.

Die exakten Werte: $\frac{2}{\pi}$, $\frac{1}{\pi}$, $\frac{1}{\sqrt{2}}$, $\frac{1}{\sqrt{3}}$.

Zwei Kennzahlen beschreiben die Form einer Kurve:

$$\text{Formfaktor} = \frac{U}{\overline{|u|}}, \qquad \text{Scheitelfaktor} = \frac{\hat{u}}{U}$$

Für den Sinus sind das $1{,}11$ und $1{,}41$. Ein Rechteck hat beide Faktoren gleich $1$, es ist immer „voll da“.

## Typische Fehler

::: achtung
- **Erst mitteln, dann quadrieren.** Der Effektivwert ist die Wurzel aus dem Mittel **des Quadrats**, nicht das Quadrat des Mittels. Beim Sinus käme sonst $0$ heraus.
- **Über eine halbe Periode gemittelt.** Der Mittelwert über eine Halbwelle ist nicht der Mittelwert des Signals. Immer über die **ganze** Periode mitteln, außer man nutzt bewusst Symmetrie.
- **Faktor $\frac{1}{\sqrt{2}}$ überall verwendet.** Er gilt nur für Sinus. Rechteck, Dreieck und PWM haben andere Faktoren.
- **Mittelwert für die Leistung genommen.** Leistung braucht den Effektivwert.
- **Amplitude und Spitze-Spitze verwechselt.** $\hat{u}$ ist der Abstand von der Nulllinie zur Spitze. Von Spitze zu Spitze sind es $2\hat{u}$, bei der Steckdose $650\,\mathrm{V}$.
- **Innerer Faktor beim Integrieren vergessen.** $\int \cos(2\omega t)\,\mathrm{d}t = \frac{\sin(2\omega t)}{2\omega}$, nicht $2\omega \sin(2\omega t)$.
:::

## Üben

::: aufgabe Gleichanteil plus Sinus
Gegeben ist $u(t) = 3\,\mathrm{V} + 4\,\mathrm{V} \cdot \sin(\omega t)$. Berechne Mittelwert und Effektivwert.
???
**Mittelwert:** Der Sinus mittelt sich weg, $\bar{u} = 3\,\mathrm{V}$.

**Effektivwert:** Mit der Pythagoras-Regel aus Abschnitt 6:

$$\begin{aligned} U &= \sqrt{(3\,\mathrm{V})^2 + \frac{(4\,\mathrm{V})^2}{2}} \\ &= \sqrt{9 + 8}\,\mathrm{V} = \sqrt{17}\,\mathrm{V} \approx 4{,}12\,\mathrm{V} \end{aligned}$$

Ausführlich: $u^2 = 9 + 24\sin(\omega t) + 16\sin^2(\omega t)$. Gemittelt: $9 + 0 + 16 \cdot \frac{1}{2} = 17$.
:::

::: aufgabe Einweggleichrichter
Ein Einweggleichrichter lässt nur die positive Halbwelle eines Sinus mit $\hat{u} = 10\,\mathrm{V}$ durch. Berechne Mittelwert und Effektivwert.
???
**Mittelwert:** Eine Halbwelle hat die Fläche $2\hat{u}$ (mit $x = \omega t$), die volle Periode ist $2\pi$ lang:

$$\bar{u} = \frac{2\hat{u}}{2\pi} = \frac{\hat{u}}{\pi} = 3{,}18\,\mathrm{V}$$

**Effektivwert:** In einer Halbwelle ist der Mittelwert von $\sin^2$ wieder $\frac{1}{2}$, in der anderen ist alles null. Über die volle Periode also $\frac{1}{4}$:

$$U = \sqrt{\hat{u}^2 \cdot \frac{1}{4}} = \frac{\hat{u}}{2} = 5\,\mathrm{V}$$
:::

::: aufgabe Symmetrisches Rechteck
Eine Rechteckspannung springt zwischen $+5\,\mathrm{V}$ und $-5\,\mathrm{V}$, jeweils eine halbe Periode lang. Berechne alle drei Werte.
???
- **Mittelwert:** Gleich viel Zeit oben und unten, also $0\,\mathrm{V}$.
- **Gleichrichtwert:** Der Betrag ist immer $5\,\mathrm{V}$, also $5\,\mathrm{V}$.
- **Effektivwert:** $u^2$ ist immer $25\,\mathrm{V^2}$, also $U = 5\,\mathrm{V}$.

Ein Rechteck mit $5\,\mathrm{V}$ Scheitelwert heizt so stark wie $5\,\mathrm{V}$ Gleichspannung, ein Sinus mit $5\,\mathrm{V}$ Scheitelwert nur wie $3{,}54\,\mathrm{V}$.
:::

::: aufgabe Gleiche Wärme
Ein Sinus und ein PWM-Signal (0 bis $\hat{u}$) haben denselben Scheitelwert. Bei welchem Tastgrad heizen beide einen Widerstand gleich stark?
???
Gleich warm heißt gleicher Effektivwert:

$$\sqrt{D} \cdot \hat{u} = \frac{\hat{u}}{\sqrt{2}} \quad\Rightarrow\quad D = \frac{1}{2}$$

Bei 50 % Tastgrad. Dann ist das PWM-Signal die Hälfte der Zeit voll an, so wie $\sin^2$ im Mittel bei $\frac{1}{2}$ liegt.
:::

::: aufgabe Verständnis: Warum die Wurzel?
Warum ist der Effektivwert als Wurzel aus dem Mittel des Quadrats definiert, und nicht einfach als Gleichrichtwert?
???
Weil die Wärme in einem Widerstand mit $u^2$ wächst, nicht mit $|u|$. Doppelte Spannung heißt vierfache Leistung. Hohe Augenblickswerte tragen deshalb überproportional viel zur Wärme bei. Der Gleichrichtwert würde sie zu schwach gewichten. Erst quadrieren, dann mitteln erfasst genau die Leistung. Die Wurzel am Ende macht daraus wieder eine Spannung in Volt.
:::
