---
titel: Vom Sinus zum Sound — Audiotechnik und Signalverarbeitung von null an
datum: 2026-10-27
fach: Audiotechnik
art: theorie
tags: [Audio, Sinus, Signalverarbeitung, Python, Dezibel, Abtastung, Fourier, Filter]
teaser: Ein Kurs in fünf Teilen zum Nacharbeiten über viele Stunden: Schall, Sinus, Dezibel, Obertöne, Modulation, Abtasten, Bits, komplexe Zeiger, Spektrum, Filter, Faltung und Hall. Mit über 25 Python-Programmen zum Anhören und drei Projekten, darunter eine Gitarrensaite aus Rauschen, ein Stimmgerät und ein kleiner Synthesizer.
welle: am
---

Audiotechnik ist der freundlichste Einstieg in die Signalverarbeitung, weil man jede Formel hören kann. Ein Sinus mit 440 Hz ist nicht nur eine Kurve, er ist der Kammerton, nach dem ein Orchester stimmt. Aliasing ist nicht nur eine Zeichnung, es pfeift. Ein Filter ist nicht nur eine Gleichung, man hört den Klang dunkler werden.

Diese Notiz ist ein Kurs, an dem du viele Stunden arbeiten kannst. Sie baut das Wissen in der Reihenfolge auf, in der es aufeinander aufbaut: vom Schall über Sinus, Dezibel und Obertöne zum digitalen Signal, dann zu Spektrum, Filter und Faltung, und am Ende baust du drei eigene Projekte. Jeder Abschnitt hat eine Idee, die Formel dazu und ein kleines Python-Programm, das einen Klang erzeugt. Du brauchst Python und Schulmathematik, sonst nichts.

## So arbeitest du mit dieser Notiz

| Teil | Abschnitte | Zeit | Danach kannst du |
|:---|:---|:---|:---|
| I · Schwingungen und Hören | 1 bis 7 | 4 bis 5 h | Töne erzeugen und mischen, in Dezibel rechnen, Klangfarben aus Obertönen bauen, Hüllkurven, Tremolo und FM programmieren |
| II · Digitales Audio | 8 bis 10 | 2 bis 3 h | erklären, was beim Abtasten und Quantisieren passiert, Aliasing vermeiden, eigene Aufnahmen laden und Stereo schreiben |
| III · Signale analysieren | 11 und 12 | 2 bis 3 h | mit komplexen Zeigern rechnen, Spektren und Spektrogramme lesen und richtig skalieren |
| IV · Systeme | 13 bis 16 | 3 bis 4 h | Filter erster und zweiter Ordnung bauen, Frequenzgänge ausrechnen, Echo, Faltung und Hall verstehen |
| V · Projekte | 17 bis 19 | 3 bis 5 h | eine Gitarrensaite, ein Stimmgerät und einen kleinen Synthesizer selbst programmieren |

Zusammen sind das 15 bis 20 Stunden. Teil I ist das Fundament für alles Weitere. Die Teile II bis IV bauen aufeinander auf, Teil V verbindet alles.

So holst du am meisten heraus:

1. **Lesen** bis zum Python-Beispiel.
2. **Vorhersagen:** Was wirst du hören, was zeigt das Bild? Schreib es kurz auf, ein Satz reicht.
3. **Ausführen**, anhören und mit der Vorhersage vergleichen. Wo du falsch lagst, lernst du am meisten.
4. **Verändern:** eine Zahl im Code ändern, wieder vorhersagen, wieder ausführen. Die Aufgaben neben den Beispielen schlagen Änderungen vor.
5. **Abhaken:** Am Ende jedes Abschnitts steht ein Checkpoint. Was du noch nicht abhaken kannst, ist dein Startpunkt für die nächste Sitzung.

Die Häkchen merkt sich dein Browser auf diesem Gerät, oben im Kopf der Notiz steht, wie viele du schon hast. Plane lieber viele kurze Sitzungen als wenige lange: eine halbe bis ganze Stunde, ein Abschnitt pro Sitzung. Lies zum Einstieg jedes Mal die Checkpoints der letzten Sitzung.

Was du brauchst: Python 3.9 oder neuer, Kopfhörer oder Lautsprecher, ein Heft für Vorhersagen und Rechnungen, ab Abschnitt 10 gern ein Handy oder Mikrofon für eigene Aufnahmen. Alle Formeln stehen am Ende noch einmal gesammelt in der [Formelsammlung](#formelsammlung), dazu Übungsaufgaben mit Lösungen zu jedem Teil.

## Werkzeugkasten: Python vorbereiten

Alle Beispiele brauchen nur zwei Pakete: **numpy** rechnet mit langen Zahlenreihen, **matplotlib** zeichnet sie. WAV-Dateien liest und schreibt Python mit dem eingebauten Modul `wave`.

```bash
python3 -m pip install numpy matplotlib
```

Leg einen Ordner an, zum Beispiel `audio`, und darin die Datei `werkzeug.py` mit vier kleinen Helfern. Alle Beispiele unten beginnen mit `from werkzeug import *` und gehören in denselben Ordner. Die Datei gibt es auch [zum Herunterladen](dateien/werkzeug.py).

```python
# werkzeug.py: kleine Helfer für alle Beispiele der Notiz
# „Vom Sinus zum Sound“ auf br1ken.github.io
import wave
import numpy as np

FS = 48_000            # Abtastrate in Hz: 48 000 Werte pro Sekunde


def zeit(dauer, fs=FS):
    """Zeitpunkte von 0 bis dauer (in s), einer pro Abtastwert."""
    return np.arange(round(dauer * fs)) / fs


def ausblenden(x, ms=10, fs=FS):
    """Kurz ein- und ausblenden, damit es am Anfang und
    am Ende nicht knackt. Geht auch für Stereo."""
    n = min(round(ms / 1000 * fs), len(x) // 2)
    rampe = np.linspace(0, 1, n)
    if np.ndim(x) == 2:
        rampe = rampe[:, None]          # gleiche Rampe für beide Kanäle
    x = np.array(x, dtype=float)
    x[:n] *= rampe
    x[len(x) - n:] *= rampe[::-1]
    return x


def speichern(name, x, fs=FS):
    """Signal x (Werte von -1 bis +1) als 16-Bit-WAV speichern.
    Mono: eine Zahlenreihe. Stereo: zwei Spalten (links, rechts)."""
    x = np.clip(x, -1, 1)               # alles darüber würde knacksen
    daten = np.round(x * 32767).astype("<i2")  # 16 Bit, little endian
    with wave.open(name, "wb") as f:
        f.setnchannels(1 if daten.ndim == 1 else daten.shape[1])
        f.setsampwidth(2)               # 2 Byte = 16 Bit
        f.setframerate(fs)
        f.writeframes(daten.tobytes())  # Stereo: L R L R …
    print(f"{name}: {len(x) / fs:.2f} s gespeichert")


def laden(name):
    """16-Bit-WAV lesen. Gibt (x, fs) zurück, Stereo als zwei Spalten."""
    with wave.open(name, "rb") as f:
        if f.getsampwidth() != 2:
            raise ValueError("Bitte als 16-Bit-WAV speichern")
        fs, kanaele = f.getframerate(), f.getnchannels()
        daten = np.frombuffer(f.readframes(f.getnframes()), "<i2")
    x = daten / 32768                   # wieder Werte von -1 bis +1
    return (x.reshape(-1, kanaele) if kanaele > 1 else x), fs
```

Was die Helfer tun:

- `FS = 48_000` ist die **Abtastrate**. Ein Klang ist für den Computer eine Liste von Zahlen, hier 48 000 pro Sekunde. Warum gerade so viele, steht in Abschnitt 8.
- `zeit(dauer)` liefert die Zeitpunkte $t_n = n / f_s$, an denen das Signal ausgerechnet wird. `zeit(1.0)` hat 48 000 Einträge.
- `ausblenden(x)` fährt die Lautstärke in den ersten und letzten 10 ms sanft hoch und runter. Beginnt ein Ton schlagartig mitten in der Schwingung, springt die Lautsprechermembran, und ein Sprung klingt als Knacks (warum, steht in Abschnitt 6).
- `speichern(name, x)` bildet Werte von $-1$ bis $+1$ auf die ganzen Zahlen von $-32\,767$ bis $+32\,767$ ab und schreibt eine WAV-Datei. $\pm 1$ ist die **Vollaussteuerung**, alles darüber wird abgeschnitten. Ein Signal mit zwei Spalten wird zu Stereo.
- `laden(name)` liest eine 16-Bit-WAV-Datei wieder ein. Damit untersuchst du ab Abschnitt 10 auch eigene Aufnahmen.

::: tipp Abspielen
Die WAV-Dateien öffnest du mit jedem Player per Doppelklick. Am Mac geht es auch im Terminal mit `afplay a440.wav`. In Jupyter oder Google Colab spielt `from IPython.display import Audio` und danach `Audio(x, rate=FS)` den Klang direkt im Notebook ab, ganz ohne Datei.
:::

::: achtung Leise anfangen
Dreh die Lautstärke vor dem ersten Abspielen herunter, vor allem mit Kopfhörern. Ein Dauerton ist anstrengender als Musik, und zwischen etwa 2 und 5 kHz ist das Ohr besonders empfindlich.
:::

::: tipp Checkpoint
- [ ] Python, numpy und matplotlib sind installiert.
- [ ] `werkzeug.py` liegt in meinem Ordner, und ein Programm mit `from werkzeug import *` läuft dort ohne Fehler.
:::

<div class="teil"><span>Teil I · etwa 4 bis 5 Stunden</span><strong>Schwingungen und Hören</strong><p>Was Schall ist, warum der Sinus so wichtig ist, wie man mit Dezibel rechnet, woraus Klangfarbe besteht und wie Bewegung in einen Klang kommt.</p></div>

## 1. Was Schall ist

Schall ist eine **Druckschwankung** in der Luft. Eine Lautsprechermembran schiebt die Luft vor sich her und zieht sie wieder zurück. Es entstehen abwechselnd Bereiche mit etwas mehr und etwas weniger Druck, und dieses Muster wandert mit Schallgeschwindigkeit nach außen. Die Luft selbst bleibt dabei im Wesentlichen an ihrem Platz und pendelt nur ein winziges Stück hin und her.

Wie klein diese Schwankungen sind, ist erstaunlich. Der Luftdruck beträgt etwa $101\,325\,\mathrm{Pa}$. Ein Gespräch in einem Meter Abstand ändert ihn um etwa $0{,}02\,\mathrm{Pa}$, also um zwei Zehnmillionstel. Die leisesten Töne, die ein junges Ohr bei 1 kHz gerade noch hört, haben $20\,\mu\mathrm{Pa}$. Ab etwa $20\,\mathrm{Pa}$ tut es weh. Zwischen dem leisesten und dem schmerzhaften Schall liegt ein **Faktor von einer Million**. Darum rechnen Audioleute in Dezibel (Abschnitt 4).

Die Schallgeschwindigkeit in Luft bei 20 °C ist $c \approx 343\,\mathrm{m/s}$. Daraus folgt die Wellenlänge, also der Abstand von einem Druckmaximum zum nächsten:

$$\lambda = \frac{c}{f}$$

| Frequenz | Wellenlänge | Beispiel |
|---:|---:|:---|
| $20\,\mathrm{Hz}$ | $17\,\mathrm{m}$ | tiefste hörbare Töne, große Orgelpfeifen |
| $100\,\mathrm{Hz}$ | $3{,}4\,\mathrm{m}$ | Bass, Grundton einer tiefen Männerstimme |
| $1\,\mathrm{kHz}$ | $34\,\mathrm{cm}$ | Mitte des Sprachbereichs |
| $10\,\mathrm{kHz}$ | $3{,}4\,\mathrm{cm}$ | Zischlaute, Becken |
| $20\,\mathrm{kHz}$ | $1{,}7\,\mathrm{cm}$ | Obergrenze junger Ohren |

Ein Basston ist also so groß wie ein Zimmer. Darum klingen Räume im Bass so unterschiedlich (zwischen den Wänden bilden sich stehende Wellen), darum kann man einen Subwoofer kaum orten (die Welle ist viel größer als der Kopf), und darum brauchen tiefe Töne große Membranen, die viel Luft bewegen.

### Vom Schall zum Computer und zurück

<figure class="dia"><svg viewBox="0 0 360 248" role="img" aria-label="Die Audiokette: Schall trifft auf ein Mikrofon, ein A/D-Wandler macht Zahlen daraus, Python rechnet, ein D/A-Wandler macht wieder Spannung, ein Verstärker treibt den Lautsprecher, der wieder Schall abgibt.">
<defs><marker id="ss-1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-1m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text class="k c" x="50" y="13">SCHALL p(t)</text><path class="s" d="M50 19V42" marker-end="url(#ss-1)"/>
<rect class="b" x="0" y="46" width="100" height="44"/><text class="c" x="50.0" y="65">Mikrofon</text><text class="k c" x="50.0" y="81">Pa → mV</text>
<rect class="b" x="130" y="46" width="100" height="44"/><text class="c" x="180.0" y="65">A/D</text><text class="k c" x="180.0" y="81">48 000 Werte/s</text>
<rect class="b" x="260" y="46" width="100" height="44"/><text class="c" x="310.0" y="65">Python</text><text class="k c" x="310.0" y="81">x[n] → y[n]</text>
<path class="s" d="M101 68H127" marker-end="url(#ss-1)"/><text class="k c" x="115" y="62">u(t)</text>
<path class="s" d="M231 68H257" marker-end="url(#ss-1)"/><text class="k c" x="245" y="62">x[n]</text>
<path class="s" d="M310 91V148" marker-end="url(#ss-1)"/><text class="k" x="318" y="124">y[n]</text>
<rect class="b" x="260" y="152" width="100" height="44"/><text class="c" x="310.0" y="171">D/A</text><text class="k c" x="310.0" y="187">Zahlen → V</text>
<rect class="b" x="130" y="152" width="100" height="44"/><text class="c" x="180.0" y="171">Verstärker</text><text class="k c" x="180.0" y="187">mW → W</text>
<rect class="b" x="0" y="152" width="100" height="44"/><text class="c" x="50.0" y="171">Lautsprecher</text><text class="k c" x="50.0" y="187">V → Pa</text>
<path class="s" d="M259 174H233" marker-end="url(#ss-1)"/><text class="k c" x="245" y="168">u(t)</text>
<path class="s" d="M129 174H103" marker-end="url(#ss-1)"/><text class="k c" x="115" y="168">u, i</text>
<path class="s" d="M50 197V222" marker-end="url(#ss-1)"/><text class="k c" x="50" y="240">SCHALL p(t)</text>
<text class="k c" x="180" y="122">ANALOG → DIGITAL → ANALOG</text>
</svg><figcaption>Die Audiokette. Die Form des Signals bleibt überall dieselbe, nur die Größe wechselt: Schalldruck, Spannung, Zahlen, wieder Spannung, wieder Schalldruck.</figcaption></figure>

Ein **Mikrofon** macht aus dem Schalldruck eine Spannung, ein Kondensatormikrofon typischerweise 10 bis 30 mV pro Pascal, ein dynamisches Gesangsmikrofon um 2 mV/Pa. Ein Vorverstärker hebt das auf einige hundert Millivolt bis gut ein Volt (Line-Pegel). Ein **A/D-Wandler** misst diese Spannung zehntausende Male pro Sekunde und liefert Zahlen. Mit den Zahlen rechnet ein Programm, hier Python. Auf dem Rückweg macht ein **D/A-Wandler** wieder eine Spannung daraus, ein Endverstärker liefert die Leistung, und der Lautsprecher bewegt wieder Luft.

Das Wichtigste steht in der Bildunterschrift: Das Signal ist überall **dieselbe Kurve**. Was Python mit Zahlen macht, macht ein analoges Filter mit Spannungen und ein Raum mit Schalldruck. Darum passen E-Technik, Akustik und Programmieren in der Audiotechnik so nahtlos zusammen.

::: tipp Checkpoint
- [ ] Ich kann erklären, warum Schall eine Druckschwankung ist und die Luft dabei nicht mitwandert.
- [ ] Ich kann die Wellenlänge eines Tons ausrechnen und weiß, warum Bässe zimmergroß sind.
- [ ] Ich kann die Audiokette vom Mikrofon bis zum Lautsprecher aufzählen und sagen, welche Größe jeweils das Signal trägt.
:::

## 2. Der Sinus: das Atom jedes Klangs

Die einfachste Schwingung ist der Sinus:

$$x(t) = A \cdot \sin(2\pi f t + \varphi) = A \cdot \sin(\omega t + \varphi)$$

- $A$ ist die **Amplitude**, wie weit die Schwingung ausschlägt. Sie bestimmt die Lautstärke.
- $f$ ist die [[Frequenz]] in Hertz, Schwingungen pro Sekunde. Sie bestimmt die Tonhöhe.
- $\omega = 2\pi f$ ist die [[Kreisfrequenz]], $T = 1/f$ die [[Periodendauer]].
- $\varphi$ ist die **Nullphase**: wo die Schwingung bei $t = 0$ gerade steht.

Mittelwert, Effektivwert und Gleichrichtwert des Sinus stehen ausführlich in der Notiz [Mittelwert, Gleichrichtwert, Effektivwert](beitrag.html?b=periodische-groessen). Hier geht es um die Frage, warum ausgerechnet der Sinus so wichtig ist.

### Sinus und Kosinus am Kreis

<figure class="dia"><svg viewBox="0 0 360 196" role="img" aria-label="Links dreht sich ein Zeiger der Länge A auf einem Kreis. Seine Höhe, nach rechts übertragen, zeichnet über dem Winkel omega t eine Sinuskurve.">
<defs><marker id="ss-2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-2m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<circle class="m" cx="72" cy="104" r="54"/>
<path class="m" d="M10 104H134M72 42V166"/>
<path class="m" d="M156 104H354M156 42V166"/>
<path class="m" d="M251.0 100V108M346 100V108"/>
<path class="s" d="M90 104A18 18 0 0 0 85.8 92.4"/>
<text class="k" x="94" y="98">ωt</text>
<path class="s" d="M72 104L113.4 69.3" marker-end="url(#ss-2)" style="stroke-width:2"/>
<text x="78" y="70">A</text>
<path class="m d" d="M113.4 69.3H177.1M113.4 69.3V104"/>
<path class="s" d="M156.0 104.0L157.6 101.2L159.2 98.4L160.8 95.6L162.3 92.8L163.9 90.0L165.5 87.3L167.1 84.6L168.7 82.0L170.2 79.5L171.8 77.0L173.4 74.6L175.0 72.3L176.6 70.0L178.2 67.9L179.8 65.8L181.3 63.9L182.9 62.0L184.5 60.3L186.1 58.7L187.7 57.2L189.2 55.9L190.8 54.7L192.4 53.6L194.0 52.6L195.6 51.8L197.2 51.2L198.8 50.7L200.3 50.3L201.9 50.1L203.5 50.0L205.1 50.1L206.7 50.3L208.2 50.7L209.8 51.2L211.4 51.8L213.0 52.6L214.6 53.6L216.2 54.7L217.8 55.9L219.3 57.2L220.9 58.7L222.5 60.3L224.1 62.0L225.7 63.9L227.2 65.8L228.8 67.9L230.4 70.0L232.0 72.3L233.6 74.6L235.2 77.0L236.8 79.5L238.3 82.0L239.9 84.6L241.5 87.3L243.1 90.0L244.7 92.8L246.2 95.6L247.8 98.4L249.4 101.2L251.0 104.0L252.6 106.8L254.2 109.6L255.8 112.4L257.3 115.2L258.9 118.0L260.5 120.7L262.1 123.4L263.7 126.0L265.2 128.5L266.8 131.0L268.4 133.4L270.0 135.7L271.6 138.0L273.2 140.1L274.8 142.2L276.3 144.1L277.9 146.0L279.5 147.7L281.1 149.3L282.7 150.8L284.2 152.1L285.8 153.3L287.4 154.4L289.0 155.4L290.6 156.2L292.2 156.8L293.8 157.3L295.3 157.7L296.9 157.9L298.5 158.0L300.1 157.9L301.7 157.7L303.2 157.3L304.8 156.8L306.4 156.2L308.0 155.4L309.6 154.4L311.2 153.3L312.8 152.1L314.3 150.8L315.9 149.3L317.5 147.7L319.1 146.0L320.7 144.1L322.2 142.2L323.8 140.1L325.4 138.0L327.0 135.7L328.6 133.4L330.2 131.0L331.8 128.5L333.3 126.0L334.9 123.4L336.5 120.7L338.1 118.0L339.7 115.2L341.2 112.4L342.8 109.6L344.4 106.8L346.0 104.0" style="stroke-width:1.8"/>
<circle class="a" cx="177.1" cy="69.3" r="4"/><circle class="a" cx="113.4" cy="69.3" r="3"/>
<text class="k c" x="251.0" y="122">π</text><text class="k c" x="346" y="122">2π</text><text class="k" x="348" y="98">ωt</text>
<text class="k" x="150" y="54" text-anchor="end">A</text><text class="k" x="150" y="162" text-anchor="end">−A</text>
<text class="k c" x="72" y="188">ZEIGER DREHT MIT ω</text><text class="k c" x="251" y="188">HÖHE = A · sin(ωt)</text>
</svg><figcaption>Ein Sinus ist die Höhe eines Zeigers, der gleichmäßig im Kreis läuft. Eine volle Umdrehung ist eine Periode. Die Breite desselben Zeigers ist der Kosinus.</figcaption></figure>

Stell dir einen Zeiger der Länge $A$ vor, der mit der Winkelgeschwindigkeit $\omega$ im Kreis läuft. Seine Höhe über der Achse ist $A\sin(\omega t)$, seine Breite $A\cos(\omega t)$. Der Kosinus ist also kein anderes Signal, sondern derselbe Sinus, eine Viertelperiode früher:

$$\cos(\omega t) = \sin\left(\omega t + \frac{\pi}{2}\right)$$

Ein einzelner Ton klingt mit Sinus und Kosinus genau gleich. Die Phase wird erst wichtig, wenn mehrere Signale zusammenkommen (Abschnitt 5). Und in Abschnitt 11 wird aus dem Zeiger eine komplexe Zahl, mit der sich besonders bequem rechnen lässt.

### Warum gerade der Sinus?

**1. Die Natur schwingt sinusförmig.** Eine Masse an einer Feder, ein Pendel mit kleinem Ausschlag, ein LC-Schwingkreis, jede einzelne Schwingungsform einer Saite: Immer zieht eine Kraft proportional zur Auslenkung zurück. Die Gleichung dafür ist

$$\ddot{x}(t) = -\omega_0^2 \, x(t)$$

Gesucht ist eine Funktion, die zweimal abgeleitet wieder sich selbst ergibt, mit umgekehrtem Vorzeichen. Das schaffen genau Sinus und Kosinus und jede Mischung aus beiden: $\frac{\mathrm{d}^2}{\mathrm{d}t^2}\sin(\omega_0 t) = -\omega_0^2\sin(\omega_0 t)$.

**2. Lineare Systeme lassen den Sinus ein Sinus bleiben.** Ein Filter, ein Verstärker, ein Kabel, ein Raum, ein Lautsprecher, solange er nicht verzerrt: Sie alle addieren, verzögern, leiten ab und integrieren. Ableitung und Integral eines Sinus sind wieder Sinusse derselben Frequenz, nur verschoben. Und eine Summe verschobener Sinusse gleicher Frequenz ist wieder ein Sinus dieser Frequenz. Ein lineares, zeitinvariantes System (kurz LTI) kann einen Sinus deshalb nur lauter oder leiser machen und verschieben. Darum beschreibt man jedes Filter durch seinen **Frequenzgang**: für jede Frequenz, wie stark und mit welcher Verschiebung sie durchkommt.

::: merke
Ein lineares, zeitinvariantes System kann einen Sinus nur verstärken, abschwächen und verschieben. Neue Frequenzen entstehen nur durch Nichtlinearität (Verzerrung) oder durch zeitliche Veränderung (Modulation, Abschnitt 7).
:::

**3. Alles andere lässt sich aus Sinussen bauen.** Jedes periodische Signal ist eine Summe von Sinustönen (Abschnitt 6). Und das Ohr arbeitet ähnlich: In der Hörschnecke schwingt die Basilarmembran bei hohen Tönen nahe am Eingang, bei tiefen weiter hinten. Das Ohr zerlegt Klang also schon mechanisch in Frequenzen.

### Python: der erste Ton

```python
from werkzeug import *
import matplotlib.pyplot as plt

t = zeit(2.0)                          # 2 s = 96 000 Zeitpunkte
x = 0.3 * np.sin(2 * np.pi * 440 * t)  # Kammerton a, 440 Hz

speichern("a440.wav", ausblenden(x))

n = int(0.005 * FS)                    # die ersten 5 ms
plt.plot(t[:n] * 1000, x[:n], ".-")
plt.xlabel("t in ms")
plt.ylabel("x")
plt.show()
```

Im Bild siehst du Punkte statt einer glatten Linie. Das Signal ist für den Computer eine Liste von Abtastwerten, alle $1/48\,000\,\mathrm{s} \approx 20{,}8\,\mu\mathrm{s}$ einer. In 5 ms passen bei 440 Hz genau 2,2 Perioden.

::: aufgabe Ausprobieren
1. Ändere 440 auf 220 und auf 880. Wie verändert sich der Ton?
2. Ersetze `np.sin` durch `np.cos`. Hörst du einen Unterschied?
3. Ändere die Amplitude von 0.3 auf 0.03. Klingt der Ton zehnmal leiser?
???
1. 220 Hz klingt eine Oktave tiefer, 880 Hz eine Oktave höher. Halbe oder doppelte Frequenz ist immer genau eine Oktave.
2. Nein. Der Kosinus ist nur um eine Viertelperiode verschoben, und bei einem einzelnen Ton hört man die Phase nicht.
3. Die Amplitude ist zehnmal kleiner, das sind $-20\,\mathrm{dB}$. Er klingt aber nicht zehnmal, sondern etwa viermal leiser. Als Faustregel klingen $-10\,\mathrm{dB}$ halb so laut, weil wir Lautstärke logarithmisch empfinden. Dazu mehr in Abschnitt 4.
:::

::: achtung Der häufigste Fehler
`np.sin(440 * t)` ist **kein** 440-Hz-Ton. Im Sinus steht die Kreisfrequenz $\omega = 2\pi f$, also muss es `np.sin(2 * np.pi * 440 * t)` heißen. Ohne $2\pi$ entstehen $440/(2\pi) \approx 70\,\mathrm{Hz}$.
:::

::: tipp Checkpoint
- [ ] Ich kenne die Bedeutung von $A$, $f$, $\omega$, $T$ und $\varphi$ und kann zwischen $f$ und $\omega$ umrechnen.
- [ ] Ich kann am Zeiger zeigen, wo Sinus und Kosinus stecken.
- [ ] Ich kann drei Gründe nennen, warum der Sinus in der Signalverarbeitung die Hauptrolle spielt.
- [ ] Ich habe den ersten Ton erzeugt, angehört und Frequenz und Amplitude verändert.
:::

## 3. Tonhöhe, Lautstärke, Klangfarbe

Ein Ton hat für das Ohr drei Eigenschaften, und jede hat ein physikalisches Gegenstück:

| Was wir hören | Was dahintersteckt | Gemessen in |
|:---|:---|:---|
| Tonhöhe | Frequenz des Grundtons | Hz, Oktaven, Halbtönen |
| Lautstärke | Amplitude des Schalldrucks | dB |
| Klangfarbe | Mischung der Obertöne und zeitlicher Verlauf | Spektrum, Hüllkurve |

Bei Tonhöhe und Lautstärke gilt dasselbe Prinzip: **Das Ohr bewertet Verhältnisse, nicht Differenzen.** Der Schritt von 100 auf 200 Hz klingt genauso groß wie der von 1000 auf 2000 Hz, beides ist eine Oktave. Die Lautstärke folgt im nächsten Abschnitt, die Klangfarbe in den Abschnitten 6 und 7.

### Oktaven, Halbtöne und Notennummern

Eine Oktave ist eine Verdopplung der Frequenz. Die westliche Musik teilt sie in zwölf gleich große Halbtonschritte ([[Tonhöhe|tonhoehe]]). Gleich groß heißt hier: gleiches Verhältnis, also jedes Mal der Faktor $\sqrt[12]{2} \approx 1{,}0595$. Mit der MIDI-Notennummer $n$ wird daraus eine einfache Formel:

$$f(n) = 440\,\mathrm{Hz} \cdot 2^{(n - 69)/12}$$

Die 69 ist das A4, der Kammerton mit 440 Hz. Die 60 ist das C4, das „mittlere C“ mit 261,63 Hz, und jede Taste auf dem Klavier zählt eins weiter. Feiner als in Halbtönen rechnet man in **Cent**: 100 Cent sind ein Halbton, 1200 Cent eine Oktave. Den Abstand zweier Frequenzen in Cent liefert $1200 \cdot \log_2(f_2/f_1)$.

::: info Die Quinte ist ein kleiner Kompromiss
Eine reine Quinte hat das Frequenzverhältnis $3 : 2 = 1{,}5$. Sieben gleichstufige Halbtöne ergeben $2^{7/12} \approx 1{,}4983$, das sind 2 Cent zu wenig. Das hört kaum jemand, und dafür klingt jede Tonart gleich gut. Mehr zu Intervallen im Lexikon unter [[Intervalle|intervalle]].
:::

```python
from werkzeug import *

def ton(note, dauer, a=0.3):
    f = 440 * 2 ** ((note - 69) / 12)  # Notennummer → Hz
    t = zeit(dauer)
    return ausblenden(a * np.sin(2 * np.pi * f * t))

# Alle meine Entchen: C D E F G G | A A A A G
# (60 = C4, 62 = D4, …, 69 = A4 mit 440 Hz)
lied = [(60, .3), (62, .3), (64, .3), (65, .3),
        (67, .6), (67, .6),
        (69, .3), (69, .3), (69, .3), (69, .3), (67, 1.2)]
x = np.concatenate([ton(n, d) for n, d in lied])
speichern("entchen.wav", x)
```

Jede Note wird einzeln ein- und ausgeblendet. Die kurzen Pausen dazwischen machen die Töne unterscheidbar, wie beim Anschlagen einer Taste.

::: aufgabe Transponieren
Wie spielst du die Melodie eine Oktave höher? Und wie eine Quinte höher?
???
Eine Oktave sind 12 Halbtöne, also `ton(n + 12, d)`. Eine Quinte sind 7 Halbtöne, also `ton(n + 7, d)`. Die Melodie klingt danach gleich, nur höher, weil alle Verhältnisse zwischen den Tönen erhalten bleiben.
:::

::: tipp Checkpoint
- [ ] Ich kann zu jeder Hörgröße die physikalische Größe nennen.
- [ ] Ich kann aus einer MIDI-Nummer die Frequenz ausrechnen und umgekehrt.
- [ ] Ich kann den Abstand zweier Töne in Cent angeben.
:::

## 4. Dezibel: rechnen mit Verhältnissen

Weil das Ohr einen Faktor von einer Million im Schalldruck verarbeitet und Verhältnisse hört, rechnet die Audiotechnik mit dem Logarithmus des Verhältnisses: dem **Dezibel** ([[Pegel|pegel]]). Für **Leistungen** gilt

$$L = 10 \cdot \log_{10}\frac{P}{P_0}\,\mathrm{dB},$$

für **Amplituden** wie Spannung, Schalldruck oder Abtastwerte

$$L = 20 \cdot \log_{10}\frac{U}{U_0}\,\mathrm{dB}.$$

Warum einmal 10 und einmal 20? Die Leistung wächst mit dem Quadrat der Amplitude, $P = U^2/R$. Im Logarithmus wird aus dem Quadrat ein Faktor 2:

$$10\log_{10}\frac{U^2/R}{U_0^2/R} = 10\log_{10}\left(\frac{U}{U_0}\right)^2 = 20\log_{10}\frac{U}{U_0}$$

So bedeutet ein Dezibelwert dasselbe, egal ob man mit Spannung oder mit Leistung rechnet.

| Amplitude | Leistung | Pegel |
|---:|---:|---:|
| $\times 10$ | $\times 100$ | $+20\,\mathrm{dB}$ |
| $\times 2$ | $\times 4$ | $+6{,}02\,\mathrm{dB}$ |
| $\times \sqrt{2} \approx 1{,}414$ | $\times 2$ | $+3{,}01\,\mathrm{dB}$ |
| $\times 1$ | $\times 1$ | $0\,\mathrm{dB}$ |
| $\times 1/\sqrt{2} \approx 0{,}707$ | $\times 1/2$ | $-3{,}01\,\mathrm{dB}$ |
| $\times 1/2$ | $\times 1/4$ | $-6{,}02\,\mathrm{dB}$ |
| $\times 1/10$ | $\times 1/100$ | $-20\,\mathrm{dB}$ |
| $\times 1/1000$ | $\times 10^{-6}$ | $-60\,\mathrm{dB}$ |

Die $-3\,\mathrm{dB}$ kennst du vom RC-Tiefpass: Bei der Grenzfrequenz ist die Spannung auf $1/\sqrt{2}$ gefallen und die Leistung auf die Hälfte. Umgekehrt rechnet man mit $10^{L/20}$ vom Pegel zurück zum Amplitudenfaktor.

Der große Vorteil: **Aus Multiplizieren wird Addieren.** Ein Mikrofonvorverstärker mit $+40\,\mathrm{dB}$, ein Kabel mit $-1\,\mathrm{dB}$ und ein Regler auf $-10\,\mathrm{dB}$ ergeben zusammen $+29\,\mathrm{dB}$. Das ist ein Faktor $10^{29/20} \approx 28$ in der Spannung, ohne dass man drei Faktoren multiplizieren musste.

### Dezibel mit Bezug: dB SPL, dBFS, dBu

Ein Dezibelwert ist zunächst nur ein Verhältnis. Erst mit einer festen Bezugsgröße wird er zu einem absoluten Pegel. Das Kürzel hinter „dB“ sagt, welche gemeint ist:

| Einheit | Bezug | Wo |
|:---|:---|:---|
| dB SPL | $p_0 = 20\,\mu\mathrm{Pa}$ | Schall in der Luft |
| dBFS | Vollaussteuerung („full scale“), bei uns $\pm 1$ | digital: 0 dBFS ist das Maximum, alles andere ist negativ |
| dBu | $0{,}775\,\mathrm{V}$ effektiv | Studiogeräte, Nennpegel $+4\,\mathrm{dBu} \approx 1{,}23\,\mathrm{V}$ |
| dBV | $1\,\mathrm{V}$ effektiv | Heimgeräte, Nennpegel $-10\,\mathrm{dBV} \approx 0{,}316\,\mathrm{V}$ |

Die krummen $0{,}775\,\mathrm{V}$ stammen aus der Telefontechnik: Das ist die Spannung, bei der an $600\,\Omega$ genau $1\,\mathrm{mW}$ umgesetzt wird, $\sqrt{1\,\mathrm{mW} \cdot 600\,\Omega} \approx 0{,}775\,\mathrm{V}$.

<figure class="dia"><svg viewBox="0 0 360 268" role="img" aria-label="Schalldruckpegel von 0 bis 140 dB mit Beispielen: Hörschwelle 0 dB, Flüstern 30, Gespräch 60, Grenze für acht Stunden 85, ein Pascal 94, Club 100, Schmerzgrenze 120 bis 130 dB. Rechts der Schalldruck, alle 20 dB zehnmal mehr.">
<path class="s" d="M132 252V22"/>
<path class="s" d="M126 252.0H138"/><text x="120" y="256.0" text-anchor="end">0</text><text class="k" x="146" y="256.0">20 µPa</text>
<path class="s" d="M126 219.1H138"/><text x="120" y="223.1" text-anchor="end">20</text><text class="k" x="146" y="223.1">200 µPa</text>
<path class="s" d="M126 186.3H138"/><text x="120" y="190.3" text-anchor="end">40</text><text class="k" x="146" y="190.3">2 mPa</text>
<path class="s" d="M126 153.4H138"/><text x="120" y="157.4" text-anchor="end">60</text><text class="k" x="146" y="157.4">20 mPa</text>
<path class="s" d="M126 120.6H138"/><text x="120" y="124.6" text-anchor="end">80</text><text class="k" x="146" y="124.6">0,2 Pa</text>
<path class="s" d="M126 87.7H138"/><text x="120" y="91.7" text-anchor="end">100</text><text class="k" x="146" y="91.7">2 Pa</text>
<path class="s" d="M126 54.9H138"/><text x="120" y="58.9" text-anchor="end">120</text><text class="k" x="146" y="58.9">20 Pa</text>
<path class="s" d="M126 22.0H138"/><text x="120" y="26.0" text-anchor="end">140</text><text class="k" x="146" y="26.0">200 Pa</text>
<path class="m" d="M129 235.6H135"/>
<path class="m" d="M129 202.7H135"/>
<path class="m" d="M129 169.9H135"/>
<path class="m" d="M129 137.0H135"/>
<path class="m" d="M129 104.1H135"/>
<path class="m" d="M129 71.3H135"/>
<path class="m" d="M129 38.4H135"/>
<circle class="a" cx="132" cy="252.0" r="3.5"/><path class="m d" d="M200 252.0H212"/><text class="k" x="216" y="255.5">Hörschwelle bei 1 kHz</text>
<circle class="a" cx="132" cy="202.7" r="3.5"/><path class="m d" d="M200 202.7H212"/><text class="k" x="216" y="206.2">Flüstern</text>
<circle class="a" cx="132" cy="153.4" r="3.5"/><path class="m d" d="M200 153.4H212"/><text class="k" x="216" y="156.9">Gespräch in 1 m</text>
<circle class="a" cx="132" cy="112.4" r="3.5"/><path class="m d" d="M200 112.4H212"/><text class="k" x="216" y="115.9">Grenze für 8 h am Tag</text>
<circle class="a" cx="132" cy="97.6" r="3.5"/><path class="m d" d="M200 97.6H212"/><text class="k" x="216" y="101.1">1 Pa, Mikrofon-Prüfton</text>
<circle class="a" cx="132" cy="79.5" r="3.5"/><path class="m d" d="M200 79.5H212"/><text class="k" x="216" y="83.0">Club, Kopfhörer voll</text>
<circle class="a" cx="132" cy="46.6" r="3.5"/><path class="m d" d="M200 46.6H212"/><text class="k" x="216" y="50.1">Schmerzgrenze</text>
<text class="k" x="120" y="14" text-anchor="end">dB SPL</text><text class="k" x="146" y="14">DRUCK</text>
</svg><figcaption>Schalldruckpegel mit typischen Beispielen (Richtwerte). Alle 20 dB wird der Schalldruck zehnmal größer. Von der Hörschwelle bis zur Schmerzgrenze ist das ein Faktor von gut einer Million.</figcaption></figure>

Drei Faustregeln für Schall:

- **Abstand:** Doppelter Abstand von einer kleinen Quelle im Freien ergibt $-6\,\mathrm{dB}$, denn der Schalldruck fällt mit $1/r$.
- **Zwei Quellen:** Zwei gleich laute Quellen ergeben $+3\,\mathrm{dB}$, wenn sie Verschiedenes spielen (die Leistungen addieren sich). $+6\,\mathrm{dB}$ gibt es nur, wenn beide exakt dasselbe Signal im Gleichtakt liefern (die Amplituden addieren sich). Warum, steht in Abschnitt 5.
- **Gehör:** $+10\,\mathrm{dB}$ klingen etwa doppelt so laut. Und jede $+3\,\mathrm{dB}$ verdoppeln die Schallenergie. Nach der Regel gleicher Energie sind $85\,\mathrm{dB}$ acht Stunden am Tag vertretbar, $88\,\mathrm{dB}$ nur vier, $100\,\mathrm{dB}$ eine Viertelstunde. Wer Audio macht, sollte seine Ohren schützen, es gibt keine Ersatzteile.

::: info dBFS beim Effektivwert
In dieser Notiz bezieht sich dBFS auf den Wert 1. Ein Sinus, der genau bis $\pm 1$ reicht, hat dann einen Spitzenwert von $0\,\mathrm{dBFS}$ und einen Effektivwert von $-3{,}01\,\mathrm{dBFS}$. Manche Pegelmesser (nach der Norm AES17) zählen den Effektivwert so, dass dieser Sinus $0\,\mathrm{dBFS}$ anzeigt. Bei Zahlen aus fremden Programmen also immer nachsehen, was gemeint ist.
:::

```python
from werkzeug import *

def spitze_db(x):                  # Spitzenwert in dBFS
    return 20 * np.log10(np.max(np.abs(x)))

def rms_db(x):                     # Effektivwert in dBFS
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)))

t = zeit(1.0)
leise = 0.25 * np.sin(2 * np.pi * 440 * t)
laut = 0.50 * np.sin(2 * np.pi * 440 * t)

for name, x in [("leise", leise), ("laut", laut)]:
    print(f"{name:5}: Spitze {spitze_db(x):6.2f} dBFS,"
          f" RMS {rms_db(x):6.2f} dBFS")
speichern("leise_laut.wav",
          np.concatenate([ausblenden(leise), ausblenden(laut)]))
```

```ausgabe
leise: Spitze -12.04 dBFS, RMS -15.05 dBFS
laut : Spitze  -6.02 dBFS, RMS  -9.03 dBFS
```

Doppelte Amplitude ergibt $+6{,}02\,\mathrm{dB}$, genau wie in der Tabelle. Und der Effektivwert (RMS) liegt beim Sinus immer $3{,}01\,\mathrm{dB}$ unter der Spitze, weil $20\log_{10}(1/\sqrt{2}) = -3{,}01$.

::: aufgabe Kopfrechnen mit Dezibel
1. Ein Signal wird um $-12\,\mathrm{dB}$ abgeschwächt. Um welchen Faktor sinkt die Amplitude?
2. Ein Verstärker macht aus $10\,\mathrm{mV}$ genau $2\,\mathrm{V}$. Wie viel dB Verstärkung sind das?
???
1. $-12\,\mathrm{dB}$ sind zweimal $-6\,\mathrm{dB}$, also zweimal halbieren: Faktor $1/4$. Genau: $10^{-12/20} = 0{,}251$.
2. Faktor $200 = 2 \cdot 100$, das sind $6 + 40 = 46\,\mathrm{dB}$. Genau: $20\log_{10} 200 = 46{,}02\,\mathrm{dB}$.
:::

::: tipp Checkpoint
- [ ] Ich weiß, wann 10 log und wann 20 log gilt, und kann es herleiten.
- [ ] Ich kenne die Tabelle im Kopf: 6 dB, 3 dB, 20 dB, und rechne Dezibelketten durch Addieren.
- [ ] Ich kann dB SPL, dBFS, dBu und dBV auseinanderhalten.
:::

## 5. Zwei Töne: Überlagerung und Schwebung

Treffen zwei Schallwellen aufeinander, addieren sich die Drücke einfach. Dasselbe gilt für Spannungen in einem Mischpult und für Zahlen in Python. Das ist das [[Überlagerungsprinzip|ueberlagerung]] aus der E-Technik ([Notiz dazu](beitrag.html?b=ueberlagerung-leistungsbilanz)), und es gilt, solange alles linear bleibt. Spannend wird es, wenn die Frequenzen gleich oder fast gleich sind.

### Gleiche Frequenz: verstärken und auslöschen

Zwei Sinustöne gleicher Frequenz ergeben wieder einen Sinus derselben Frequenz. Mit den Zeigern aus Abschnitt 2 ist das eine Vektoraddition, und der Kosinussatz liefert die Amplitude der Summe. Sie hängt vom Phasenunterschied $\Delta\varphi$ ab:

$$A = \sqrt{A_1^2 + A_2^2 + 2A_1A_2\cos\Delta\varphi}$$

Im **Gleichtakt** ($\Delta\varphi = 0$) ist $A = A_1 + A_2$, zwei gleiche Töne ergeben also die doppelte Amplitude, $+6\,\mathrm{dB}$. Im **Gegentakt** ($\Delta\varphi = 180°$) ist $A = \lvert A_1 - A_2 \rvert$, zwei gleiche Töne löschen sich völlig aus. Das steckt hinter drei Dingen, die dir in der Audiotechnik begegnen werden:

- **Noise Cancelling:** Der Kopfhörer misst den Umgebungslärm mit einem Mikrofon und spielt ihn mit umgekehrtem Vorzeichen dazu. Das klappt am besten bei tiefen, gleichmäßigen Geräuschen wie im Flugzeug.
- **Verpolte Lautsprecher:** Ist ein Lautsprecher falsch herum angeschlossen, löschen sich die Bässe der beiden teilweise aus, und der Klang wird dünn.
- **Kammfilter:** Hört ein Mikrofon den direkten Schall und eine Reflexion vom Tisch, kommen beide leicht versetzt an. Für manche Frequenzen ist das genau Gegentakt, sie fehlen. Der Klang wird hohl (Abschnitt 15).

### Fast gleiche Frequenz: Schwebung

Liegen die Frequenzen dicht beieinander, wandert der Phasenunterschied langsam durch: mal Gleichtakt, mal Gegentakt. Man hört einen Ton, der regelmäßig an- und abschwillt, eine [[Schwebung|schwebung]]. Das folgt aus einer Formel der Trigonometrie:

$$\sin(2\pi f_1 t) + \sin(2\pi f_2 t) = 2\cos\left(2\pi\,\frac{f_2 - f_1}{2}\,t\right) \cdot \sin\left(2\pi\,\frac{f_1 + f_2}{2}\,t\right)$$

Rechts steht ein Ton mit der mittleren Frequenz, dessen Lautstärke ein langsamer Kosinus steuert. Laut ist es, wenn dieser Kosinus bei $+1$ **oder** bei $-1$ steht, also zweimal pro Kosinusperiode. Darum schwebt es mit der vollen Differenzfrequenz:

$$f_\text{Schwebung} = \lvert f_2 - f_1 \rvert$$

<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Zwei Töne mit fast gleicher Frequenz addiert: Die Summe wird im Takt der Differenzfrequenz abwechselnd laut und leise. Eine gestrichelte Hüllkurve umschließt das Signal.">
<defs><marker id="ss-3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-3m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<path class="m" d="M30 92H352M30 14V170"/>
<path class="s" d="M30.0 92.0L30.8 78.9L31.5 66.2L32.3 54.6L33.0 44.4L33.8 36.0L34.5 29.7L35.3 25.9L36.0 24.5L36.8 25.7L37.5 29.4L38.3 35.5L39.0 43.6L39.8 53.6L40.5 64.9L41.3 77.2L42.0 90.0L42.8 102.8L43.5 115.0L44.3 126.3L45.0 136.2L45.8 144.3L46.6 150.4L47.3 154.2L48.1 155.6L48.8 154.6L49.6 151.2L50.3 145.7L51.1 138.2L51.8 129.0L52.6 118.6L53.3 107.3L54.1 95.6L54.8 84.0L55.6 72.8L56.3 62.6L57.1 53.6L57.8 46.2L58.6 40.7L59.3 37.3L60.1 36.0L60.8 36.8L61.6 39.7L62.4 44.5L63.1 51.0L63.9 58.9L64.6 67.8L65.4 77.5L66.1 87.4L66.9 97.3L67.6 106.7L68.4 115.3L69.1 122.8L69.9 128.9L70.6 133.4L71.4 136.2L72.1 137.3L72.9 136.6L73.6 134.2L74.4 130.3L75.1 125.1L75.9 118.9L76.6 111.9L77.4 104.4L78.2 96.7L78.9 89.1L79.7 82.0L80.4 75.6L81.2 70.1L81.9 65.7L82.7 62.6L83.4 60.7L84.2 60.1L84.9 60.7L85.7 62.6L86.4 65.4L87.2 69.1L87.9 73.5L88.7 78.3L89.4 83.3L90.2 88.3L90.9 93.1L91.7 97.4L92.4 101.2L93.2 104.4L94.0 106.7L94.7 108.2L95.5 108.9L96.2 108.9L97.0 108.1L97.7 106.8L98.5 104.9L99.2 102.7L100.0 100.4L100.7 98.0L101.5 95.7L102.2 93.6L103.0 91.9L103.7 90.5L104.5 89.6L105.2 89.1L106.0 89.1L106.7 89.5L107.5 90.1L108.2 91.0L109.0 92.0L109.8 93.0L110.5 93.9L111.3 94.5L112.0 94.9L112.8 94.9L113.5 94.4L114.3 93.5L115.0 92.1L115.8 90.4L116.5 88.3L117.3 86.0L118.0 83.6L118.8 81.3L119.5 79.1L120.3 77.2L121.0 75.9L121.8 75.1L122.5 75.1L123.3 75.8L124.0 77.3L124.8 79.6L125.6 82.8L126.3 86.6L127.1 90.9L127.8 95.7L128.6 100.7L129.3 105.7L130.1 110.5L130.8 114.9L131.6 118.6L132.3 121.4L133.1 123.3L133.8 123.9L134.6 123.3L135.3 121.4L136.1 118.3L136.8 113.9L137.6 108.4L138.3 102.0L139.1 94.9L139.8 87.3L140.6 79.6L141.4 72.1L142.1 65.1L142.9 58.9L143.6 53.7L144.4 49.8L145.1 47.4L145.9 46.7L146.6 47.8L147.4 50.6L148.1 55.1L148.9 61.2L149.6 68.7L150.4 77.3L151.1 86.7L151.9 96.6L152.6 106.5L153.4 116.2L154.1 125.1L154.9 133.0L155.6 139.5L156.4 144.3L157.2 147.2L157.9 148.0L158.7 146.7L159.4 143.3L160.2 137.8L160.9 130.4L161.7 121.4L162.4 111.2L163.2 100.0L163.9 88.4L164.7 76.7L165.4 65.4L166.2 55.0L166.9 45.8L167.7 38.3L168.4 32.8L169.2 29.4L169.9 28.4L170.7 29.8L171.4 33.6L172.2 39.7L173.0 47.8L173.7 57.7L174.5 69.0L175.2 81.2L176.0 94.0L176.7 106.8L177.5 119.1L178.2 130.4L179.0 140.4L179.7 148.5L180.5 154.6L181.2 158.3L182.0 159.5L182.7 158.1L183.5 154.3L184.2 148.0L185.0 139.6L185.7 129.4L186.5 117.8L187.2 105.1L188.0 92.0L188.8 78.9L189.5 66.2L190.3 54.6L191.0 44.4L191.8 36.0L192.5 29.7L193.3 25.9L194.0 24.5L194.8 25.7L195.5 29.4L196.3 35.5L197.0 43.6L197.8 53.6L198.5 64.9L199.3 77.2L200.0 90.0L200.8 102.8L201.5 115.0L202.3 126.3L203.0 136.2L203.8 144.3L204.6 150.4L205.3 154.2L206.1 155.6L206.8 154.6L207.6 151.2L208.3 145.7L209.1 138.2L209.8 129.0L210.6 118.6L211.3 107.3L212.1 95.6L212.8 84.0L213.6 72.8L214.3 62.6L215.1 53.6L215.8 46.2L216.6 40.7L217.3 37.3L218.1 36.0L218.8 36.8L219.6 39.7L220.4 44.5L221.1 51.0L221.9 58.9L222.6 67.8L223.4 77.5L224.1 87.4L224.9 97.3L225.6 106.7L226.4 115.3L227.1 122.8L227.9 128.9L228.6 133.4L229.4 136.2L230.1 137.3L230.9 136.6L231.6 134.2L232.4 130.3L233.1 125.1L233.9 118.9L234.6 111.9L235.4 104.4L236.2 96.7L236.9 89.1L237.7 82.0L238.4 75.6L239.2 70.1L239.9 65.7L240.7 62.6L241.4 60.7L242.2 60.1L242.9 60.7L243.7 62.6L244.4 65.4L245.2 69.1L245.9 73.5L246.7 78.3L247.4 83.3L248.2 88.3L248.9 93.1L249.7 97.4L250.4 101.2L251.2 104.4L252.0 106.7L252.7 108.2L253.5 108.9L254.2 108.9L255.0 108.1L255.7 106.8L256.5 104.9L257.2 102.7L258.0 100.4L258.7 98.0L259.5 95.7L260.2 93.6L261.0 91.9L261.7 90.5L262.5 89.6L263.2 89.1L264.0 89.1L264.7 89.5L265.5 90.1L266.2 91.0L267.0 92.0L267.8 93.0L268.5 93.9L269.3 94.5L270.0 94.9L270.8 94.9L271.5 94.4L272.3 93.5L273.0 92.1L273.8 90.4L274.5 88.3L275.3 86.0L276.0 83.6L276.8 81.3L277.5 79.1L278.3 77.2L279.0 75.9L279.8 75.1L280.5 75.1L281.3 75.8L282.0 77.3L282.8 79.6L283.6 82.8L284.3 86.6L285.1 90.9L285.8 95.7L286.6 100.7L287.3 105.7L288.1 110.5L288.8 114.9L289.6 118.6L290.3 121.4L291.1 123.3L291.8 123.9L292.6 123.3L293.3 121.4L294.1 118.3L294.8 113.9L295.6 108.4L296.3 102.0L297.1 94.9L297.8 87.3L298.6 79.6L299.4 72.1L300.1 65.1L300.9 58.9L301.6 53.7L302.4 49.8L303.1 47.4L303.9 46.7L304.6 47.8L305.4 50.6L306.1 55.1L306.9 61.2L307.6 68.7L308.4 77.3L309.1 86.7L309.9 96.6L310.6 106.5L311.4 116.2L312.1 125.1L312.9 133.0L313.6 139.5L314.4 144.3L315.2 147.2L315.9 148.0L316.7 146.7L317.4 143.3L318.2 137.8L318.9 130.4L319.7 121.4L320.4 111.2L321.2 100.0L321.9 88.4L322.7 76.7L323.4 65.4L324.2 55.0L324.9 45.8L325.7 38.3L326.4 32.8L327.2 29.4L327.9 28.4L328.7 29.8L329.4 33.6L330.2 39.7L331.0 47.8L331.7 57.7L332.5 69.0L333.2 81.2L334.0 94.0L334.7 106.8L335.5 119.1L336.2 130.4L337.0 140.4L337.7 148.5L338.5 154.6L339.2 158.3L340.0 159.5L340.7 158.1L341.5 154.3L342.2 148.0L343.0 139.6L343.7 129.4L344.5 117.8L345.2 105.1L346.0 92.0" style="stroke-width:1"/>
<path class="s d" d="M30.0 24.0L32.6 24.1L35.3 24.4L37.9 24.8L40.5 25.5L43.2 26.3L45.8 27.3L48.4 28.5L51.1 29.9L53.7 31.4L56.3 33.1L59.0 35.0L61.6 37.0L64.2 39.2L66.9 41.5L69.5 43.9L72.1 46.5L74.8 49.2L77.4 52.0L80.0 55.0L82.7 58.0L85.3 61.1L87.9 64.3L90.6 67.6L93.2 71.0L95.8 74.4L98.5 77.9L101.1 81.4L103.7 84.9L106.4 88.4L109.0 92.0L111.6 88.4L114.3 84.9L116.9 81.4L119.5 77.9L122.2 74.4L124.8 71.0L127.4 67.6L130.1 64.3L132.7 61.1L135.3 58.0L138.0 55.0L140.6 52.0L143.2 49.2L145.9 46.5L148.5 43.9L151.1 41.5L153.8 39.2L156.4 37.0L159.0 35.0L161.7 33.1L164.3 31.4L166.9 29.9L169.6 28.5L172.2 27.3L174.8 26.3L177.5 25.5L180.1 24.8L182.7 24.4L185.4 24.1L188.0 24.0L190.6 24.1L193.3 24.4L195.9 24.8L198.5 25.5L201.2 26.3L203.8 27.3L206.4 28.5L209.1 29.9L211.7 31.4L214.3 33.1L217.0 35.0L219.6 37.0L222.2 39.2L224.9 41.5L227.5 43.9L230.1 46.5L232.8 49.2L235.4 52.0L238.0 55.0L240.7 58.0L243.3 61.1L245.9 64.3L248.6 67.6L251.2 71.0L253.8 74.4L256.5 77.9L259.1 81.4L261.7 84.9L264.4 88.4L267.0 92.0L269.6 88.4L272.3 84.9L274.9 81.4L277.5 77.9L280.2 74.4L282.8 71.0L285.4 67.6L288.1 64.3L290.7 61.1L293.3 58.0L296.0 55.0L298.6 52.0L301.2 49.2L303.9 46.5L306.5 43.9L309.1 41.5L311.8 39.2L314.4 37.0L317.0 35.0L319.7 33.1L322.3 31.4L324.9 29.9L327.6 28.5L330.2 27.3L332.8 26.3L335.5 25.5L338.1 24.8L340.7 24.4L343.4 24.1L346.0 24.0" style="stroke-width:1.6"/><path class="s d" d="M30.0 160.0L32.6 159.9L35.3 159.6L37.9 159.2L40.5 158.5L43.2 157.7L45.8 156.7L48.4 155.5L51.1 154.1L53.7 152.6L56.3 150.9L59.0 149.0L61.6 147.0L64.2 144.8L66.9 142.5L69.5 140.1L72.1 137.5L74.8 134.8L77.4 132.0L80.0 129.0L82.7 126.0L85.3 122.9L87.9 119.7L90.6 116.4L93.2 113.0L95.8 109.6L98.5 106.1L101.1 102.6L103.7 99.1L106.4 95.6L109.0 92.0L111.6 95.6L114.3 99.1L116.9 102.6L119.5 106.1L122.2 109.6L124.8 113.0L127.4 116.4L130.1 119.7L132.7 122.9L135.3 126.0L138.0 129.0L140.6 132.0L143.2 134.8L145.9 137.5L148.5 140.1L151.1 142.5L153.8 144.8L156.4 147.0L159.0 149.0L161.7 150.9L164.3 152.6L166.9 154.1L169.6 155.5L172.2 156.7L174.8 157.7L177.5 158.5L180.1 159.2L182.7 159.6L185.4 159.9L188.0 160.0L190.6 159.9L193.3 159.6L195.9 159.2L198.5 158.5L201.2 157.7L203.8 156.7L206.4 155.5L209.1 154.1L211.7 152.6L214.3 150.9L217.0 149.0L219.6 147.0L222.2 144.8L224.9 142.5L227.5 140.1L230.1 137.5L232.8 134.8L235.4 132.0L238.0 129.0L240.7 126.0L243.3 122.9L245.9 119.7L248.6 116.4L251.2 113.0L253.8 109.6L256.5 106.1L259.1 102.6L261.7 99.1L264.4 95.6L267.0 92.0L269.6 95.6L272.3 99.1L274.9 102.6L277.5 106.1L280.2 109.6L282.8 113.0L285.4 116.4L288.1 119.7L290.7 122.9L293.3 126.0L296.0 129.0L298.6 132.0L301.2 134.8L303.9 137.5L306.5 140.1L309.1 142.5L311.8 144.8L314.4 147.0L317.0 149.0L319.7 150.9L322.3 152.6L324.9 154.1L327.6 155.5L330.2 156.7L332.8 157.7L335.5 158.5L338.1 159.2L340.7 159.6L343.4 159.9L346.0 160.0" style="stroke-width:1.6"/>
<path class="m" d="M109.0 98V192M267.0 98V192"/>
<path class="s" d="M188.0 186H111.0" marker-end="url(#ss-3)"/><path class="s" d="M188.0 186H265.0" marker-end="url(#ss-3)"/>
<text class="c" x="188.0" y="206">1 / |f<tspan dy="3" font-size="9">2</tspan><tspan dy="-3"> − f</tspan><tspan dy="3" font-size="9">1</tspan><tspan dy="-3">|</tspan></text>
<text class="k" x="34" y="12">LAUT</text><text class="k c" x="109.0" y="12">LEISE</text><text class="k c" x="188.0" y="12">LAUT</text><text class="k c" x="267.0" y="12">LEISE</text>
<text class="k" x="348" y="86">t</text>
</svg><figcaption>Schwebung: Zwei fast gleiche Töne laufen abwechselnd im Gleichtakt (laut) und im Gegentakt (leise). Die gestrichelte Hüllkurve wiederholt sich mit der Differenzfrequenz.</figcaption></figure>

Musiker nutzen das beim Stimmen: Zwei fast gleich gestimmte Saiten schweben. Je langsamer, desto näher, und ohne Schwebung stimmen sie. Ab etwa 15 Hz Unterschied hört man keine Schwebung mehr, sondern einen rauen Klang, und bei noch größerem Abstand zwei getrennte Töne.

```python
from werkzeug import *
import matplotlib.pyplot as plt

f1, f2 = 440, 442
t = zeit(4.0)
x = 0.2 * np.sin(2 * np.pi * f1 * t) + 0.2 * np.sin(2 * np.pi * f2 * t)
huelle = 0.4 * np.abs(np.cos(np.pi * (f2 - f1) * t))

speichern("schwebung.wav", ausblenden(x))
plt.plot(t, x, lw=0.3)
plt.plot(t, huelle, "r")
plt.xlabel("t in s")
plt.show()
```

::: aufgabe Schweben lassen
Was hörst du mit `f2 = 443`, mit `f2 = 460` und mit `f2 = 440`?
???
Bei 443 Hz schwebt es dreimal pro Sekunde, bei 460 Hz klingt es rau und unruhig, statt zu schweben. Bei 440 Hz sind beide Töne gleich, es gibt keine Schwebung, nur einen Ton mit doppelter Amplitude. Im [Crashtest-Labor](../labor/) gibt es dafür auch den Starter „Schwebung“ mit 220 und 223 Hz.
:::

::: tipp Checkpoint
- [ ] Ich kann die Amplitude der Summe zweier gleich schneller Töne mit dem Kosinussatz ausrechnen.
- [ ] Ich kann erklären, warum zwei gleiche Lautsprecher je nach Signal $+3$ oder $+6\,\mathrm{dB}$ ergeben.
- [ ] Ich kann die Schwebungsformel lesen und weiß, warum die Schwebung $\lvert f_2 - f_1 \rvert$ ist und nicht die Hälfte.
:::

## 6. Obertöne: woraus Klangfarbe besteht

Ein A auf dem Klavier und ein A auf der Geige haben dieselbe Tonhöhe, und trotzdem erkennt man sofort, was was ist. Der Unterschied steckt in der Kurvenform. Eine Saite oder eine Luftsäule schwingt nie nur mit ihrer Grundfrequenz $f_0$, sondern gleichzeitig mit ganzzahligen Vielfachen davon: den [[Obertönen|obertoene]] bei $2f_0$, $3f_0$, $4f_0$ und so weiter. Wie stark welcher Oberton ist, hören wir als **Klangfarbe**.

Vorsicht beim Zählen: Der erste Oberton ist die zweite Harmonische $2f_0$. In dieser Notiz zählt $n$ die Harmonischen, $n = 1$ ist der Grundton.

### Die Fourier-Reihe

Joseph Fourier hat 1807 vorgeschlagen, was später für alle praktisch vorkommenden Signale bewiesen wurde: Jedes periodische Signal mit der Periode $T = 1/f_0$ lässt sich als Summe von Sinus- und Kosinustönen schreiben,

$$x(t) = a_0 + \sum_{n=1}^{\infty} \big( a_n \cos(n\omega_0 t) + b_n \sin(n\omega_0 t) \big), \qquad \omega_0 = 2\pi f_0$$

Dabei ist $a_0$ der Gleichanteil (der Mittelwert). Die Koeffizienten $a_n$ und $b_n$ sagen, wie viel Kosinus und Sinus mit der $n$-fachen Frequenz im Signal steckt. Man bekommt sie, indem man das Signal mit dem gesuchten Teilton multipliziert und über eine Periode mittelt:

$$b_n = \frac{2}{T}\int_0^T x(t)\,\sin(n\omega_0 t)\,\mathrm{d}t, \qquad a_n = \frac{2}{T}\int_0^T x(t)\,\cos(n\omega_0 t)\,\mathrm{d}t$$

::: herleitung Warum Multiplizieren und Mitteln funktioniert
Der Trick ist derselbe wie beim Effektivwert: Über eine volle Periode ist der Mittelwert von $\sin^2$ genau $\tfrac{1}{2}$ (siehe [Periodische Größen](beitrag.html?b=periodische-groessen)). Das Produkt zweier Sinusse mit verschiedenen Vielfachen $n \neq m$ mittelt sich dagegen zu null:

$$\sin(n\omega_0 t)\,\sin(m\omega_0 t) = \tfrac{1}{2}\big[\cos((n-m)\,\omega_0 t) - \cos((n+m)\,\omega_0 t)\big]$$

Rechts stehen zwei Kosinusse mit ganzzahligen Vielfachen von $\omega_0$, und über volle Perioden gemittelt ergibt jeder null. Nur für $n = m$ wird der erste zu $\cos 0 = 1$, und es bleibt $\tfrac{1}{2}$. Genauso mittelt sich jedes Produkt aus einem Sinus und einem Kosinus zu null.

Multipliziert man also $x(t)$ mit $\sin(n\omega_0 t)$ und mittelt, fallen alle anderen Teiltöne weg, und vom gesuchten bleibt $\tfrac{1}{2} b_n$. Der Faktor $2$ vor dem Integral macht daraus $b_n$. Sinus und Kosinus verschiedener Vielfacher verhalten sich wie senkrecht aufeinander stehende Achsen, man nennt sie **orthogonal**.
:::

### Drei Wellenformen, die man kennen sollte

| Form | Teiltöne | Amplitude $b_n$ | Klang |
|:---|:---|:---|:---|
| Rechteck | nur ungerade $n$ | $\frac{4}{\pi n}$ | hohl, ähnlich einer Klarinette in der Tiefe |
| Sägezahn | alle $n$ | $\frac{2}{\pi n}$, Vorzeichen abwechselnd | hell, schnarrend, Streicher und Blech im Synthesizer |
| Dreieck | nur ungerade $n$ | $\frac{8}{\pi^2 n^2}$, Vorzeichen abwechselnd | weich, fast wie ein Sinus, flötenartig |

Die Werte gelten für Wellenformen, die zwischen $-1$ und $+1$ pendeln. Mehr dazu im Lexikon unter [[Wellenformen|wellenformen]].

<figure class="dia"><svg viewBox="0 0 360 214" role="img" aria-label="Oben drei Sinusschwingungen mit der einfachen, dreifachen und fünffachen Frequenz und den Amplituden 1, ein Drittel und ein Fünftel. Unten ihre Summe, die schon fast wie ein Rechteck aussieht.">
<path class="m" d="M30 58H352M30 158H352"/>
<path class="s" d="M30.0 58.0L31.3 56.7L32.6 55.5L34.0 54.2L35.3 53.0L36.6 51.8L37.9 50.6L39.2 49.4L40.5 48.2L41.9 47.1L43.2 46.0L44.5 44.9L45.8 43.9L47.1 42.9L48.4 41.9L49.8 41.0L51.1 40.2L52.4 39.3L53.7 38.6L55.0 37.9L56.3 37.2L57.6 36.6L59.0 36.1L60.3 35.6L61.6 35.2L62.9 34.8L64.2 34.5L65.6 34.3L66.9 34.1L68.2 34.0L69.5 34.0L70.8 34.0L72.1 34.1L73.5 34.3L74.8 34.5L76.1 34.8L77.4 35.2L78.7 35.6L80.0 36.1L81.3 36.6L82.7 37.2L84.0 37.9L85.3 38.6L86.6 39.3L87.9 40.2L89.2 41.0L90.6 41.9L91.9 42.9L93.2 43.9L94.5 44.9L95.8 46.0L97.1 47.1L98.5 48.2L99.8 49.4L101.1 50.6L102.4 51.8L103.7 53.0L105.0 54.2L106.4 55.5L107.7 56.7L109.0 58.0L110.3 59.3L111.6 60.5L113.0 61.8L114.3 63.0L115.6 64.2L116.9 65.4L118.2 66.6L119.5 67.8L120.8 68.9L122.2 70.0L123.5 71.1L124.8 72.1L126.1 73.1L127.4 74.1L128.8 75.0L130.1 75.8L131.4 76.7L132.7 77.4L134.0 78.1L135.3 78.8L136.7 79.4L138.0 79.9L139.3 80.4L140.6 80.8L141.9 81.2L143.2 81.5L144.6 81.7L145.9 81.9L147.2 82.0L148.5 82.0L149.8 82.0L151.1 81.9L152.4 81.7L153.8 81.5L155.1 81.2L156.4 80.8L157.7 80.4L159.0 79.9L160.3 79.4L161.7 78.8L163.0 78.1L164.3 77.4L165.6 76.7L166.9 75.8L168.2 75.0L169.6 74.1L170.9 73.1L172.2 72.1L173.5 71.1L174.8 70.0L176.1 68.9L177.5 67.8L178.8 66.6L180.1 65.4L181.4 64.2L182.7 63.0L184.0 61.8L185.4 60.5L186.7 59.3L188.0 58.0L189.3 56.7L190.6 55.5L191.9 54.2L193.3 53.0L194.6 51.8L195.9 50.6L197.2 49.4L198.5 48.2L199.8 47.1L201.2 46.0L202.5 44.9L203.8 43.9L205.1 42.9L206.4 41.9L207.8 41.0L209.1 40.2L210.4 39.3L211.7 38.6L213.0 37.9L214.3 37.2L215.7 36.6L217.0 36.1L218.3 35.6L219.6 35.2L220.9 34.8L222.2 34.5L223.6 34.3L224.9 34.1L226.2 34.0L227.5 34.0L228.8 34.0L230.1 34.1L231.4 34.3L232.8 34.5L234.1 34.8L235.4 35.2L236.7 35.6L238.0 36.1L239.3 36.6L240.7 37.2L242.0 37.9L243.3 38.6L244.6 39.3L245.9 40.2L247.2 41.0L248.6 41.9L249.9 42.9L251.2 43.9L252.5 44.9L253.8 46.0L255.2 47.1L256.5 48.2L257.8 49.4L259.1 50.6L260.4 51.8L261.7 53.0L263.1 54.2L264.4 55.5L265.7 56.7L267.0 58.0L268.3 59.3L269.6 60.5L270.9 61.8L272.3 63.0L273.6 64.2L274.9 65.4L276.2 66.6L277.5 67.8L278.9 68.9L280.2 70.0L281.5 71.1L282.8 72.1L284.1 73.1L285.4 74.1L286.8 75.0L288.1 75.8L289.4 76.7L290.7 77.4L292.0 78.1L293.3 78.8L294.7 79.4L296.0 79.9L297.3 80.4L298.6 80.8L299.9 81.2L301.2 81.5L302.5 81.7L303.9 81.9L305.2 82.0L306.5 82.0L307.8 82.0L309.1 81.9L310.4 81.7L311.8 81.5L313.1 81.2L314.4 80.8L315.7 80.4L317.0 79.9L318.3 79.4L319.7 78.8L321.0 78.1L322.3 77.4L323.6 76.7L324.9 75.8L326.2 75.0L327.6 74.1L328.9 73.1L330.2 72.1L331.5 71.1L332.8 70.0L334.2 68.9L335.5 67.8L336.8 66.6L338.1 65.4L339.4 64.2L340.7 63.0L342.0 61.8L343.4 60.5L344.7 59.3L346.0 58.0" style="stroke-width:1.8"/>
<path class="s" d="M30.0 58.0L31.3 56.7L32.6 55.5L34.0 54.4L35.3 53.3L36.6 52.3L37.9 51.5L39.2 50.9L40.5 50.4L41.9 50.1L43.2 50.0L44.5 50.1L45.8 50.4L47.1 50.9L48.4 51.5L49.8 52.3L51.1 53.3L52.4 54.4L53.7 55.5L55.0 56.7L56.3 58.0L57.6 59.3L59.0 60.5L60.3 61.6L61.6 62.7L62.9 63.7L64.2 64.5L65.6 65.1L66.9 65.6L68.2 65.9L69.5 66.0L70.8 65.9L72.1 65.6L73.5 65.1L74.8 64.5L76.1 63.7L77.4 62.7L78.7 61.6L80.0 60.5L81.3 59.3L82.7 58.0L84.0 56.7L85.3 55.5L86.6 54.4L87.9 53.3L89.2 52.3L90.6 51.5L91.9 50.9L93.2 50.4L94.5 50.1L95.8 50.0L97.1 50.1L98.5 50.4L99.8 50.9L101.1 51.5L102.4 52.3L103.7 53.3L105.0 54.4L106.4 55.5L107.7 56.7L109.0 58.0L110.3 59.3L111.6 60.5L113.0 61.6L114.3 62.7L115.6 63.7L116.9 64.5L118.2 65.1L119.5 65.6L120.8 65.9L122.2 66.0L123.5 65.9L124.8 65.6L126.1 65.1L127.4 64.5L128.8 63.7L130.1 62.7L131.4 61.6L132.7 60.5L134.0 59.3L135.3 58.0L136.7 56.7L138.0 55.5L139.3 54.4L140.6 53.3L141.9 52.3L143.2 51.5L144.6 50.9L145.9 50.4L147.2 50.1L148.5 50.0L149.8 50.1L151.1 50.4L152.4 50.9L153.8 51.5L155.1 52.3L156.4 53.3L157.7 54.4L159.0 55.5L160.3 56.7L161.7 58.0L163.0 59.3L164.3 60.5L165.6 61.6L166.9 62.7L168.2 63.7L169.6 64.5L170.9 65.1L172.2 65.6L173.5 65.9L174.8 66.0L176.1 65.9L177.5 65.6L178.8 65.1L180.1 64.5L181.4 63.7L182.7 62.7L184.0 61.6L185.4 60.5L186.7 59.3L188.0 58.0L189.3 56.7L190.6 55.5L191.9 54.4L193.3 53.3L194.6 52.3L195.9 51.5L197.2 50.9L198.5 50.4L199.8 50.1L201.2 50.0L202.5 50.1L203.8 50.4L205.1 50.9L206.4 51.5L207.8 52.3L209.1 53.3L210.4 54.4L211.7 55.5L213.0 56.7L214.3 58.0L215.7 59.3L217.0 60.5L218.3 61.6L219.6 62.7L220.9 63.7L222.2 64.5L223.6 65.1L224.9 65.6L226.2 65.9L227.5 66.0L228.8 65.9L230.1 65.6L231.4 65.1L232.8 64.5L234.1 63.7L235.4 62.7L236.7 61.6L238.0 60.5L239.3 59.3L240.7 58.0L242.0 56.7L243.3 55.5L244.6 54.4L245.9 53.3L247.2 52.3L248.6 51.5L249.9 50.9L251.2 50.4L252.5 50.1L253.8 50.0L255.2 50.1L256.5 50.4L257.8 50.9L259.1 51.5L260.4 52.3L261.7 53.3L263.1 54.4L264.4 55.5L265.7 56.7L267.0 58.0L268.3 59.3L269.6 60.5L270.9 61.6L272.3 62.7L273.6 63.7L274.9 64.5L276.2 65.1L277.5 65.6L278.9 65.9L280.2 66.0L281.5 65.9L282.8 65.6L284.1 65.1L285.4 64.5L286.8 63.7L288.1 62.7L289.4 61.6L290.7 60.5L292.0 59.3L293.3 58.0L294.7 56.7L296.0 55.5L297.3 54.4L298.6 53.3L299.9 52.3L301.2 51.5L302.5 50.9L303.9 50.4L305.2 50.1L306.5 50.0L307.8 50.1L309.1 50.4L310.4 50.9L311.8 51.5L313.1 52.3L314.4 53.3L315.7 54.4L317.0 55.5L318.3 56.7L319.7 58.0L321.0 59.3L322.3 60.5L323.6 61.6L324.9 62.7L326.2 63.7L327.6 64.5L328.9 65.1L330.2 65.6L331.5 65.9L332.8 66.0L334.2 65.9L335.5 65.6L336.8 65.1L338.1 64.5L339.4 63.7L340.7 62.7L342.0 61.6L343.4 60.5L344.7 59.3L346.0 58.0" style="stroke-width:1.1"/>
<path class="m" d="M30.0 58.0L31.3 56.8L32.6 55.6L34.0 54.6L35.3 53.8L36.6 53.4L37.9 53.2L39.2 53.4L40.5 53.8L41.9 54.6L43.2 55.6L44.5 56.8L45.8 58.0L47.1 59.2L48.4 60.4L49.8 61.4L51.1 62.2L52.4 62.6L53.7 62.8L55.0 62.6L56.3 62.2L57.6 61.4L59.0 60.4L60.3 59.2L61.6 58.0L62.9 56.8L64.2 55.6L65.6 54.6L66.9 53.8L68.2 53.4L69.5 53.2L70.8 53.4L72.1 53.8L73.5 54.6L74.8 55.6L76.1 56.8L77.4 58.0L78.7 59.2L80.0 60.4L81.3 61.4L82.7 62.2L84.0 62.6L85.3 62.8L86.6 62.6L87.9 62.2L89.2 61.4L90.6 60.4L91.9 59.2L93.2 58.0L94.5 56.8L95.8 55.6L97.1 54.6L98.5 53.8L99.8 53.4L101.1 53.2L102.4 53.4L103.7 53.8L105.0 54.6L106.4 55.6L107.7 56.8L109.0 58.0L110.3 59.2L111.6 60.4L113.0 61.4L114.3 62.2L115.6 62.6L116.9 62.8L118.2 62.6L119.5 62.2L120.8 61.4L122.2 60.4L123.5 59.2L124.8 58.0L126.1 56.8L127.4 55.6L128.8 54.6L130.1 53.8L131.4 53.4L132.7 53.2L134.0 53.4L135.3 53.8L136.7 54.6L138.0 55.6L139.3 56.8L140.6 58.0L141.9 59.2L143.2 60.4L144.6 61.4L145.9 62.2L147.2 62.6L148.5 62.8L149.8 62.6L151.1 62.2L152.4 61.4L153.8 60.4L155.1 59.2L156.4 58.0L157.7 56.8L159.0 55.6L160.3 54.6L161.7 53.8L163.0 53.4L164.3 53.2L165.6 53.4L166.9 53.8L168.2 54.6L169.6 55.6L170.9 56.8L172.2 58.0L173.5 59.2L174.8 60.4L176.1 61.4L177.5 62.2L178.8 62.6L180.1 62.8L181.4 62.6L182.7 62.2L184.0 61.4L185.4 60.4L186.7 59.2L188.0 58.0L189.3 56.8L190.6 55.6L191.9 54.6L193.3 53.8L194.6 53.4L195.9 53.2L197.2 53.4L198.5 53.8L199.8 54.6L201.2 55.6L202.5 56.8L203.8 58.0L205.1 59.2L206.4 60.4L207.8 61.4L209.1 62.2L210.4 62.6L211.7 62.8L213.0 62.6L214.3 62.2L215.7 61.4L217.0 60.4L218.3 59.2L219.6 58.0L220.9 56.8L222.2 55.6L223.6 54.6L224.9 53.8L226.2 53.4L227.5 53.2L228.8 53.4L230.1 53.8L231.4 54.6L232.8 55.6L234.1 56.8L235.4 58.0L236.7 59.2L238.0 60.4L239.3 61.4L240.7 62.2L242.0 62.6L243.3 62.8L244.6 62.6L245.9 62.2L247.2 61.4L248.6 60.4L249.9 59.2L251.2 58.0L252.5 56.8L253.8 55.6L255.2 54.6L256.5 53.8L257.8 53.4L259.1 53.2L260.4 53.4L261.7 53.8L263.1 54.6L264.4 55.6L265.7 56.8L267.0 58.0L268.3 59.2L269.6 60.4L270.9 61.4L272.3 62.2L273.6 62.6L274.9 62.8L276.2 62.6L277.5 62.2L278.9 61.4L280.2 60.4L281.5 59.2L282.8 58.0L284.1 56.8L285.4 55.6L286.8 54.6L288.1 53.8L289.4 53.4L290.7 53.2L292.0 53.4L293.3 53.8L294.7 54.6L296.0 55.6L297.3 56.8L298.6 58.0L299.9 59.2L301.2 60.4L302.5 61.4L303.9 62.2L305.2 62.6L306.5 62.8L307.8 62.6L309.1 62.2L310.4 61.4L311.8 60.4L313.1 59.2L314.4 58.0L315.7 56.8L317.0 55.6L318.3 54.6L319.7 53.8L321.0 53.4L322.3 53.2L323.6 53.4L324.9 53.8L326.2 54.6L327.6 55.6L328.9 56.8L330.2 58.0L331.5 59.2L332.8 60.4L334.2 61.4L335.5 62.2L336.8 62.6L338.1 62.8L339.4 62.6L340.7 62.2L342.0 61.4L343.4 60.4L344.7 59.2L346.0 58.0" style="stroke-width:1.1"/>
<path class="m d" d="M30 158V134.4H109.0V181.6H188.0V134.4H267.0V181.6H346V158"/>
<path class="s" d="M30.0 158.0L31.3 153.3L32.6 148.8L34.0 144.5L35.3 140.7L36.6 137.4L37.9 134.6L39.2 132.5L40.5 131.1L41.9 130.3L43.2 130.0L44.5 130.2L45.8 130.9L47.1 131.8L48.4 132.8L49.8 134.0L51.1 135.0L52.4 135.9L53.7 136.6L55.0 137.1L56.3 137.2L57.6 137.1L59.0 136.7L60.3 136.1L61.6 135.3L62.9 134.5L64.2 133.7L65.6 133.0L66.9 132.5L68.2 132.1L69.5 132.0L70.8 132.1L72.1 132.5L73.5 133.0L74.8 133.7L76.1 134.5L77.4 135.3L78.7 136.1L80.0 136.7L81.3 137.1L82.7 137.2L84.0 137.1L85.3 136.6L86.6 135.9L87.9 135.0L89.2 134.0L90.6 132.8L91.9 131.8L93.2 130.9L94.5 130.2L95.8 130.0L97.1 130.3L98.5 131.1L99.8 132.5L101.1 134.6L102.4 137.4L103.7 140.7L105.0 144.5L106.4 148.8L107.7 153.3L109.0 158.0L110.3 162.7L111.6 167.2L113.0 171.5L114.3 175.3L115.6 178.6L116.9 181.4L118.2 183.5L119.5 184.9L120.8 185.7L122.2 186.0L123.5 185.8L124.8 185.1L126.1 184.2L127.4 183.2L128.8 182.0L130.1 181.0L131.4 180.1L132.7 179.4L134.0 178.9L135.3 178.8L136.7 178.9L138.0 179.3L139.3 179.9L140.6 180.7L141.9 181.5L143.2 182.3L144.6 183.0L145.9 183.5L147.2 183.9L148.5 184.0L149.8 183.9L151.1 183.5L152.4 183.0L153.8 182.3L155.1 181.5L156.4 180.7L157.7 179.9L159.0 179.3L160.3 178.9L161.7 178.8L163.0 178.9L164.3 179.4L165.6 180.1L166.9 181.0L168.2 182.0L169.6 183.2L170.9 184.2L172.2 185.1L173.5 185.8L174.8 186.0L176.1 185.7L177.5 184.9L178.8 183.5L180.1 181.4L181.4 178.6L182.7 175.3L184.0 171.5L185.4 167.2L186.7 162.7L188.0 158.0L189.3 153.3L190.6 148.8L191.9 144.5L193.3 140.7L194.6 137.4L195.9 134.6L197.2 132.5L198.5 131.1L199.8 130.3L201.2 130.0L202.5 130.2L203.8 130.9L205.1 131.8L206.4 132.8L207.8 134.0L209.1 135.0L210.4 135.9L211.7 136.6L213.0 137.1L214.3 137.2L215.7 137.1L217.0 136.7L218.3 136.1L219.6 135.3L220.9 134.5L222.2 133.7L223.6 133.0L224.9 132.5L226.2 132.1L227.5 132.0L228.8 132.1L230.1 132.5L231.4 133.0L232.8 133.7L234.1 134.5L235.4 135.3L236.7 136.1L238.0 136.7L239.3 137.1L240.7 137.2L242.0 137.1L243.3 136.6L244.6 135.9L245.9 135.0L247.2 134.0L248.6 132.8L249.9 131.8L251.2 130.9L252.5 130.2L253.8 130.0L255.2 130.3L256.5 131.1L257.8 132.5L259.1 134.6L260.4 137.4L261.7 140.7L263.1 144.5L264.4 148.8L265.7 153.3L267.0 158.0L268.3 162.7L269.6 167.2L270.9 171.5L272.3 175.3L273.6 178.6L274.9 181.4L276.2 183.5L277.5 184.9L278.9 185.7L280.2 186.0L281.5 185.8L282.8 185.1L284.1 184.2L285.4 183.2L286.8 182.0L288.1 181.0L289.4 180.1L290.7 179.4L292.0 178.9L293.3 178.8L294.7 178.9L296.0 179.3L297.3 179.9L298.6 180.7L299.9 181.5L301.2 182.3L302.5 183.0L303.9 183.5L305.2 183.9L306.5 184.0L307.8 183.9L309.1 183.5L310.4 183.0L311.8 182.3L313.1 181.5L314.4 180.7L315.7 179.9L317.0 179.3L318.3 178.9L319.7 178.8L321.0 178.9L322.3 179.4L323.6 180.1L324.9 181.0L326.2 182.0L327.6 183.2L328.9 184.2L330.2 185.1L331.5 185.8L332.8 186.0L334.2 185.7L335.5 184.9L336.8 183.5L338.1 181.4L339.4 178.6L340.7 175.3L342.0 171.5L343.4 167.2L344.7 162.7L346.0 158.0" style="stroke-width:1.8"/>
<text class="k" x="32" y="26">sin(ωt) + ⅓ sin(3ωt) + ⅕ sin(5ωt)</text>
<text class="k" x="32" y="114">SUMME — FAST SCHON EIN RECHTECK</text>
<text class="k" x="348" y="53">t</text><text class="k" x="348" y="153">t</text>
</svg><figcaption>Drei Sinustöne mit den Frequenzen f, 3f und 5f und den Amplituden 1, ⅓ und ⅕ (oben) ergeben zusammen schon fast ein Rechteck (unten, gestrichelt das Ziel).</figcaption></figure>

Daraus folgt eine allgemeine Regel: **Scharfe Kanten in der Zeit bedeuten viel Inhalt bei hohen Frequenzen.** Ein Sprung wie beim Rechteck braucht unendlich viele Obertöne, die nur mit $1/n$ leiser werden. Ein Knick wie beim Dreieck braucht ebenfalls unendlich viele, aber sie fallen mit $1/n^2$ viel schneller ab. Ein glatter Sinus braucht keinen einzigen. Darum knackt ein Ton, der schlagartig beginnt: Der Sprung enthält kurz alle Frequenzen.

::: sim klang f=220 n=9 form=rechteck
Zieh die Teiltöne von 1 bis 60 hoch und hör zu, wie aus dem Sinus ein Rechteck, ein Sägezahn oder ein Dreieck wird. Bei $n = 1$ bleibt bei allen drei Formen nur ein Sinus übrig, sie unterscheiden sich dann nur in der Amplitude. Leise anfangen.
:::

::: info Das Gibbs-Phänomen
Baut man ein Rechteck aus endlich vielen Teiltönen, schießt die Summe an jeder Kante über, um knapp 9 % der Sprunghöhe. Beim Rechteck von $-1$ auf $+1$ geht die Spitze also bis etwa $1{,}18$. Mit mehr Teiltönen wird der Überschwinger schmaler, aber nicht niedriger. In der Simulation steht der Wert unter „Spitzenwert der Summe“.
:::

```python
from werkzeug import *
import matplotlib.pyplot as plt

f0 = 220
t = zeit(1.0)

def rechteck(n_max):
    x = np.zeros_like(t)
    for n in range(1, n_max + 1, 2):   # nur ungerade n
        x += 4 / np.pi * np.sin(2 * np.pi * n * f0 * t) / n
    return x

stufen = (1, 3, 9, 49)
teile = [rechteck(n) for n in stufen]
speichern("rechteck_aufbau.wav",
          np.concatenate([ausblenden(0.2 * x) for x in teile]))

zwei = int(2 * FS / f0)                # zwei Perioden
for n, x in zip(stufen, teile):
    plt.plot(t[:zwei] * 1000, x[:zwei], label=f"bis n = {n}")
plt.legend()
plt.xlabel("t in ms")
plt.show()
```

In der WAV-Datei hörst du nacheinander 1, 2, 5 und 25 Teiltöne (bis $n = 1$, $3$, $9$ und $49$): vom weichen Sinus bis zum hohlen, summenden Rechteck. Der höchste Teilton liegt bei $49 \cdot 220\,\mathrm{Hz} = 10{,}78\,\mathrm{kHz}$, sicher unter $f_s/2$. Warum das wichtig ist, steht in Abschnitt 8.

### Experiment: Hört das Ohr die Phase?

Gib jedem Teilton eine zufällige Phase. Die Stärken der Teiltöne bleiben gleich, nur ihr zeitlicher Versatz ändert sich:

```python
from werkzeug import *
import matplotlib.pyplot as plt

f0 = 220
t = zeit(1.0)
zufall = np.random.default_rng(7)
x = np.zeros_like(t)
for n in range(1, 50, 2):
    phi = zufall.uniform(0, 2 * np.pi)  # jede Phase zufällig
    x += 4 / np.pi * np.sin(2 * np.pi * n * f0 * t + phi) / n

speichern("rechteck_wirr.wav", ausblenden(0.2 * x / np.max(np.abs(x))))
zwei = int(2 * FS / f0)
plt.plot(t[:zwei] * 1000, x[:zwei])
plt.xlabel("t in ms")
plt.show()
```

Die Kurve sieht danach völlig anders aus, kein Rechteck mehr, sondern ein wirres Gezappel. Und der Klang? Er ist dem Rechteck sehr ähnlich. Bei gleichmäßigen Tönen hört das Ohr vor allem, **wie stark** die einzelnen Teiltöne sind, und nur wenig von ihren Phasen. Deshalb zeigt man Klänge meist als Spektrum der Beträge (Abschnitt 12) und nicht als Kurve.

::: aufgabe Einen Sägezahn bauen
Ändere `rechteck` so, dass ein Sägezahn herauskommt. Was musst du an der Schleife und am Faktor ändern?
???
Alle $n$ statt nur der ungeraden, also `range(1, n_max + 1)`, Faktor $\frac{2}{\pi n}$ und abwechselndes Vorzeichen:

```python
for n in range(1, n_max + 1):
    x += 2 / np.pi * (-1) ** (n + 1) * np.sin(2 * np.pi * n * f0 * t) / n
```

Mit `n_max = 49` liegt der höchste Teilton wieder bei 10,78 kHz. Der Klang ist heller als das Rechteck, weil auch die geraden Obertöne mitspielen.
:::

::: tipp Checkpoint
- [ ] Ich kann erklären, was Grundton, Oberton und Harmonische sind, und zähle sie richtig.
- [ ] Ich kann die Formel für $b_n$ hinschreiben und mit der Orthogonalität begründen.
- [ ] Ich kenne die Spektren von Rechteck, Sägezahn und Dreieck und weiß, warum Kanten hohe Frequenzen bedeuten.
- [ ] Ich habe in der Simulation alle drei Formen aus Teiltönen gebaut und angehört.
:::

## 7. Hüllkurve und Modulation: Klang in Bewegung

Bisher waren alle Töne starr: gleich laut und gleich hoch, vom ersten bis zum letzten Abtastwert. Echte Klänge bewegen sich. Ein Ton setzt ein und klingt aus, eine Stimme vibriert, eine Orgel schwebt. In diesem Abschnitt kommt Bewegung in den Klang, und dabei zeigt sich die zweite Hälfte des Merksatzes aus Abschnitt 2: Zeitliche Veränderung erzeugt neue Frequenzen.

### Die Hüllkurve: ADSR

Ein Klavierton beginnt mit einem harten Anschlag und klingt langsam aus, eine Orgelpfeife setzt weich ein und bleibt gleich laut. Schneidet man bei einer Aufnahme den Anfang ab, sind Instrumente erstaunlich schwer zu erkennen. Der zeitliche Verlauf der Lautstärke gehört also zur Klangfarbe. Synthesizer bilden ihn mit einer [[Hüllkurve|huellkurve]] nach, meist in vier Phasen:

<figure class="dia"><svg viewBox="0 0 360 214" role="img" aria-label="Hüllkurve ADSR: Die Lautstärke steigt beim Drücken der Taste schnell auf das Maximum (Attack), fällt auf einen Haltepegel (Decay), bleibt dort, solange die Taste gedrückt ist (Sustain), und klingt nach dem Loslassen aus (Release).">
<defs><marker id="ss-11" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-11m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<rect class="hl" x="30.0" y="32" width="192.2" height="118"/>
<path class="m" d="M30 150H348M30 150V26"/>
<path class="s" d="M30.0 150.0 L48.6 40.0 L85.8 89.5 L222.2 89.5 L321.4 150.0" style="stroke-width:2.2"/>
<path class="m d" d="M48.6 150V36"/>
<path class="m d" d="M85.8 150V36"/>
<path class="m d" d="M222.2 150V36"/>
<text class="c" x="39.3" y="170">A</text>
<text class="c" x="67.2" y="170">D</text>
<text class="c" x="154.0" y="170">S</text>
<text class="c" x="271.8" y="170">R</text>
<text class="k c" x="39.3" y="184">ATTACK</text><text class="k c" x="75.2" y="196">DECAY</text><text class="k c" x="154.0" y="184">SUSTAIN</text><text class="k c" x="271.8" y="184">RELEASE</text>
<text class="k" x="24" y="44.0" text-anchor="end">1</text><text class="k" x="24" y="93.5" text-anchor="end">s</text><text class="k" x="24" y="154" text-anchor="end">0</text>
<path class="m d" d="M30 89.5H85.8"/>
<text class="k" x="34.0" y="26">TASTE GEDRÜCKT</text><text class="k" x="226.2" y="26">LOSGELASSEN</text>
<text class="k" x="342" y="144">t</text>
</svg><figcaption>Die Hüllkurve ADSR: schneller Anstieg (Attack), Abfall auf den Haltepegel s (Decay), Halten, solange die Taste gedrückt ist (Sustain), Ausklingen nach dem Loslassen (Release).</figcaption></figure>

- **Attack:** Zeit, bis der Ton nach dem Tastendruck seine volle Lautstärke hat. Zupfen und Schlagen: wenige Millisekunden. Streicher und Bläser: 50 bis 200 ms.
- **Decay:** Zeit, um danach auf den Haltepegel abzufallen.
- **Sustain:** der **Pegel**, der gehalten wird, solange die Taste gedrückt bleibt. Vorsicht: Die anderen drei sind Zeiten, Sustain ist eine Lautstärke.
- **Release:** Zeit des Ausklingens nach dem Loslassen.

```python
from werkzeug import *
import matplotlib.pyplot as plt

def adsr(gedrueckt, a=0.01, d=0.15, s=0.6, r=0.3, fs=FS):
    """Hüllkurve: Anstieg a, Abfall d auf den Haltepegel s,
    nach dem Loslassen Ausklingen r. Zeiten in Sekunden."""
    na, nd = round(a * fs), round(d * fs)
    nh = max(round(gedrueckt * fs) - na - nd, 0)
    return np.concatenate([
        np.linspace(0, 1, na, endpoint=False),   # Attack
        np.linspace(1, s, nd, endpoint=False),   # Decay
        np.full(nh, s),                          # Sustain
        np.linspace(s, 0, round(r * fs))])       # Release

kurven = {"orgel": adsr(1.0, a=0.03, d=0.01, s=1.0, r=0.05),
          "zupfen": adsr(1.0, a=0.002, d=0.4, s=0.0, r=0.05),
          "blaeser": adsr(1.0, a=0.12, d=0.2, s=0.7, r=0.25)}

for name, h in kurven.items():
    t = np.arange(len(h)) / FS
    speichern(f"adsr_{name}.wav", 0.3 * h * np.sin(2 * np.pi * 220 * t))
    plt.plot(t, h, label=name)
plt.legend()
plt.xlabel("t in s")
plt.show()
```

::: aufgabe Hüllkurven lesen
1. Wie lang ist `adsr_blaeser.wav`, und warum genau so lang?
2. Was ändert sich beim Bläser, wenn du `s=1.0` setzt?
???
1. 1,25 s: eine Sekunde ist die Taste gedrückt (Attack, Decay und Sustain passen da hinein), danach kommen 0,25 s Release dazu.
2. Der Decay fällt dann von 1 auf 1, verschwindet also. Der Ton steigt in 0,12 s an und bleibt dann voll stehen.
:::

### Tremolo: die Lautstärke schwanken lassen

Ein **Tremolo** multipliziert den Ton mit einer langsam schwankenden Lautstärke. Mit dem Träger $f_c$, der Modulationsfrequenz $f_m$ und der Modulationstiefe $m$:

$$x(t) = \big(1 + m\sin(2\pi f_m t)\big) \cdot \sin(2\pi f_c t)$$

Das ist **Amplitudenmodulation**, genau wie beim Mittelwellenradio. Was dabei im Spektrum passiert, zeigt eine Formel, die du schon aus der Fourier-Herleitung kennst:

$$\sin\alpha \cdot \sin\beta = \tfrac{1}{2}\big[\cos(\alpha - \beta) - \cos(\alpha + \beta)\big]$$

Ausmultipliziert enthält das Tremolo also drei Töne: den Träger $f_c$ mit voller Amplitude und zwei **Seitenlinien** bei $f_c - f_m$ und $f_c + f_m$, jede mit der Amplitude $m/2$. Das ist dieselbe Formel wie bei der Schwebung in Abschnitt 5, nur rückwärts gelesen: Zwei Töne dicht beieinander klingen wie ein einziger, dessen Lautstärke schwankt.

Ist $f_m$ langsam (unter etwa 15 Hz), hört man eine schwankende Lautstärke. Ist $f_m$ schnell, hört man die Seitenlinien als eigene Töne. Lässt man die 1 in der Klammer weg, verschwindet sogar der Träger, und es bleiben nur Summe und Differenz. Das ist die **Ringmodulation**, benannt nach dem Ring aus vier Dioden, mit dem man sie früher analog gebaut hat.

<figure class="dia"><svg viewBox="0 0 360 236" role="img" aria-label="Oben das Spektrum eines Tremolos: eine große Linie beim Träger und zwei kleine Seitenlinien direkt daneben. Unten die Ringmodulation von 300 und 440 Hertz: nur zwei Linien bei 140 und 740 Hertz, die Ausgangstöne fehlen.">
<path class="m" d="M40 96H346"/>
<text class="k" x="40" y="30">TREMOLO: TRÄGER UND ZWEI SEITENLINIEN f ± f<tspan dy="3" font-size="8">m</tspan></text>
<rect class="a" x="182.7" y="40.0" width="8" height="56.0"/><text class="k c" x="186.7" y="110">440</text>
<rect class="a" x="167.7" y="82.0" width="8" height="14.0"/><text class="k c" x="171.7" y="110"></text>
<rect class="a" x="197.7" y="82.0" width="8" height="14.0"/><text class="k c" x="201.7" y="110"></text>
<text class="k" x="165" y="80" text-anchor="end">435</text><text class="k" x="208" y="80">445</text>
<path class="m" d="M40 204H346"/>
<text class="k" x="40" y="138">RINGMODULATION 300 · 440 Hz: NUR SUMME UND DIFFERENZ</text>
<rect class="a" x="82.7" y="176.0" width="8" height="28.0"/><text class="k c" x="86.7" y="218">140</text>
<rect class="a" x="282.7" y="176.0" width="8" height="28.0"/><text class="k c" x="286.7" y="218">740</text>
<rect class="a" x="136.0" y="204.0" width="8" height="0.0"/><text class="k c" x="140.0" y="218"></text>
<rect class="a" x="182.7" y="204.0" width="8" height="0.0"/><text class="k c" x="186.7" y="218"></text>
<path class="m d" d="M140 204V176M186.7 204V176"/><text class="k c" x="140" y="218">300</text><text class="k c" x="186.7" y="218">440</text><text class="k c" x="163" y="170">FEHLEN</text>
</svg><figcaption>Oben: Tremolo ist Amplitudenmodulation. Neben dem Ton entstehen zwei Seitenlinien im Abstand der Modulationsfrequenz (hier 5 Hz, zur Deutlichkeit breiter gezeichnet). Unten: Bei der Ringmodulation bleiben nur Summe und Differenz übrig.</figcaption></figure>

```python
from werkzeug import *

t = zeit(3.0)
traeger = np.sin(2 * np.pi * 440 * t)

# Tremolo: die Lautstärke schwankt 5-mal pro Sekunde um ±50 %
tremolo = (1 + 0.5 * np.sin(2 * np.pi * 5 * t)) / 1.5 * traeger

# Ringmodulation: zwei Töne multipliziert, ohne die 1
ring = np.sin(2 * np.pi * 300 * t) * traeger

speichern("tremolo.wav", ausblenden(0.3 * tremolo))
speichern("ring.wav", ausblenden(0.3 * ring))

# Welche Frequenzen stecken im Ringmodulator? 1 s → 1-Hz-Raster
A = 2 * np.abs(np.fft.rfft(ring[:FS])) / FS
print("Spitzen bei", np.nonzero(A > 0.1)[0], "Hz")
```

```ausgabe
Spitzen bei [140 740] Hz
```

Die beiden Ausgangstöne 300 und 440 Hz sind verschwunden, übrig sind nur $440 - 300 = 140$ und $440 + 300 = 740\,\mathrm{Hz}$. Weil diese beiden in keinem einfachen Verhältnis stehen, klingt das metallisch. So entstehen Glocken- und Roboterstimmen-Effekte.

### Vibrato und FM: die Frequenz schwanken lassen

Beim **Vibrato** schwankt nicht die Lautstärke, sondern die Tonhöhe. Dafür schreibt man die Schwankung in die Phase:

$$x(t) = \sin\big(2\pi f_c t + \beta \sin(2\pi f_m t)\big)$$

Die Momentanfrequenz ist die Ableitung der Phase geteilt durch $2\pi$:

$$f(t) = f_c + \beta f_m \cos(2\pi f_m t)$$

Die Frequenz pendelt also um den **Hub** $\Delta f = \beta f_m$ um $f_c$. $\beta$ heißt **Modulationsindex**. Eine Sängerin singt ihr Vibrato mit etwa 5 bis 7 Schwankungen pro Sekunde und einem Hub von einigen Prozent der Tonhöhe.

Macht man die Modulation schnell, wird daraus **Frequenzmodulation (FM)**, und im Spektrum entstehen Linien bei $f_c \pm k f_m$ für $k = 0, 1, 2, \dots$ Ihre Amplituden sind die Bessel-Funktionen $J_k(\beta)$: Bei $\beta = 1$ hat der Träger $0{,}77$, das erste Paar $0{,}44$, das zweite $0{,}11$, das dritte $0{,}02$. Je größer $\beta$, desto mehr Linien, als Faustregel belegt FM die Bandbreite $2(\Delta f + f_m)$ (Carson-Regel). Mit zwei Sinus-Oszillatoren entstehen so Klänge mit beliebig vielen Teiltönen. John Chowning hat das 1967 in Stanford entdeckt, 1983 kam es im Synthesizer Yamaha DX7 in die Popmusik.

```python
from werkzeug import *

t = zeit(3.0)

# Vibrato: Frequenz schwankt um ±6 Hz, 5-mal pro Sekunde
hub, fm = 6, 5
vibrato = np.sin(2 * np.pi * 440 * t
                 + hub / fm * np.sin(2 * np.pi * fm * t))

# FM-Glocke: schneller Modulator im Verhältnis 1 : 1,4
fc, fm = 200, 280
index = 8 * np.exp(-t / 0.8)           # Modulationsindex klingt ab
glocke = np.sin(2 * np.pi * fc * t
                + index * np.sin(2 * np.pi * fm * t))
glocke *= np.exp(-t / 1.0)             # die Lautstärke auch

speichern("vibrato.wav", ausblenden(0.3 * vibrato))
speichern("glocke.wav", ausblenden(0.4 * glocke))
```

Die Glocke hat Teiltöne bei 80, 200, 360, 480, 640, 760 Hz und so weiter. Das sind keine ganzzahligen Vielfachen von 200 Hz, darum klingt es nicht nach einem Ton mit klarer Höhe, sondern metallisch. Weil der Index abklingt, wird der Klang beim Ausklingen dunkler, wie bei einer echten Glocke.

::: aufgabe Modulation verstehen
1. Ein Tremolo hat $f_c = 1\,\mathrm{kHz}$, $f_m = 8\,\mathrm{Hz}$ und $m = 0{,}4$. Welche Linien hat das Spektrum, und wie viel dB liegen die Seitenlinien unter dem Träger?
2. Ein Vibrato soll um $\pm 50\,\mathrm{Hz}$ schwanken, fünfmal pro Sekunde. Wie groß ist $\beta$?
3. Ändere im FM-Beispiel `fm = 280` in `fm = 200`. Was ändert sich am Klang?
???
1. Linien bei 992, 1000 und 1008 Hz. Die Seitenlinien haben die Amplitude $m/2 = 0{,}2$ relativ zum Träger, das sind $20\log_{10} 0{,}2 = -14\,\mathrm{dB}$.
2. $\beta = \Delta f / f_m = 50 / 5 = 10$.
3. Mit $f_c = f_m = 200\,\mathrm{Hz}$ liegen alle Linien bei $\lvert 200 + 200k \rvert$, also bei 0, 200, 400, 600 Hz: ganzzahlige Vielfache von 200 Hz. Der Klang wird harmonisch und hat eine klare Tonhöhe, eher wie ein Blasinstrument als wie eine Glocke.
:::

::: tipp Checkpoint
- [ ] Ich kann die vier Phasen einer ADSR-Hüllkurve erklären und weiß, dass Sustain ein Pegel ist.
- [ ] Ich kann mit $\sin\alpha \sin\beta = \tfrac{1}{2}[\cos(\alpha-\beta) - \cos(\alpha+\beta)]$ zeigen, wo die Seitenlinien eines Tremolos liegen.
- [ ] Ich weiß, was Hub und Modulationsindex sind und warum FM so viele Teiltöne erzeugt.
- [ ] Ich habe Tremolo, Ringmodulation, Vibrato und die FM-Glocke angehört und Parameter verändert.
:::

<div class="teil"><span>Teil II · etwa 2 bis 3 Stunden</span><strong>Digitales Audio</strong><p>Was beim Abtasten und beim Runden auf Bits passiert, warum Aliasing pfeift und wie du echte Aufnahmen und Stereo in Python holst.</p></div>

## 8. Abtasten: vom Signal zu Zahlen

Ein A/D-Wandler misst die Spannung in festen Abständen $T_s = 1/f_s$. Aus der Kurve $x(t)$ wird die Zahlenfolge

$$x[n] = x(n \cdot T_s), \qquad n = 0, 1, 2, \dots$$

Bei $f_s = 48\,\mathrm{kHz}$ ist $T_s \approx 20{,}8\,\mu\mathrm{s}$. Zwischen den Messpunkten weiß der Computer nichts. Erstaunlicherweise geht trotzdem **keine Information verloren**, wenn eine Bedingung erfüllt ist ([[Abtastrate|abtastrate]]):

::: merke Abtasttheorem (Nyquist-Shannon)
Enthält ein Signal nur Frequenzen unterhalb der halben Abtastrate,

$$f_\text{max} < \frac{f_s}{2},$$

dann ist es durch seine Abtastwerte vollständig bestimmt und lässt sich exakt zurückgewinnen. $f_s/2$ heißt **Nyquist-Frequenz**.
:::

Anschaulich: Durch die Abtastpunkte passen viele Sinusse, aber genau einer davon liegt unterhalb von $f_s/2$. Ein idealer D/A-Wandler, also einer mit einem perfekten Tiefpass bei $f_s/2$, macht genau diesen einen daraus und zeichnet ihn wieder glatt.

### Warum 44,1 und 48 kHz?

Wir hören bis etwa 20 kHz, also braucht man mehr als 40 kHz. Den Rest braucht das **Anti-Aliasing-Filter** vor dem Wandler. Es soll bis 20 kHz alles durchlassen und ab $f_s/2$ alles sperren, und kein Filter schafft das von einer Frequenz auf die nächste. Bei 44,1 kHz hat es dafür den Bereich von 20 bis 22,05 kHz, bei 48 kHz von 20 bis 24 kHz.

- **44,1 kHz** ist die Rate der CD. Die krumme Zahl stammt aus der Zeit, als man Digitalaudio auf Videorekordern speicherte: 3 Abtastwerte pro Bildzeile, 245 nutzbare Zeilen pro Halbbild, 60 Halbbilder pro Sekunde ergibt $3 \cdot 245 \cdot 60 = 44\,100$. Im europäischen Fernsehformat kommt mit $3 \cdot 294 \cdot 50$ dieselbe Zahl heraus.
- **48 kHz** ist der Standard bei Film, Video und Rundfunk, und die meisten Audio-Interfaces laufen damit.
- **96 kHz und mehr** nimmt man in der Produktion, wenn Effekte Platz nach oben brauchen. Für die reine Wiedergabe ist der Vorteil umstritten und, wenn überhaupt, sehr klein.

### Aliasing: wenn Frequenzen falsch ankommen

Liegt eine Frequenz über $f_s/2$, geht es schief. Die Abtastwerte eines Sinus mit $f$ sind genau dieselben wie die eines Sinus mit $f - k f_s$ für jede ganze Zahl $k$:

$$\sin\left(2\pi (f - k f_s)\,\frac{n}{f_s}\right) = \sin\left(2\pi f\,\frac{n}{f_s} - 2\pi k n\right) = \sin\left(2\pi f\,\frac{n}{f_s}\right)$$

Denn $2\pi k n$ ist immer eine ganze Zahl voller Umdrehungen. Der D/A-Wandler nimmt den einzigen Kandidaten unterhalb von $f_s/2$, und das ist die [[Alias-Frequenz|aliasing]]:

$$f_a = \lvert f - k f_s \rvert, \qquad k \text{ so gewählt, dass } f_a \le f_s/2$$

<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Ein schneller Sinus mit 0,9 mal der Abtastrate, dünn gezeichnet. Die Abtastpunkte liegen genau auf einem langsamen Sinus mit 0,1 mal der Abtastrate, dick gezeichnet.">
<path class="m" d="M30 96H352"/>
<path class="m" d="M30.0 96.0L30.7 89.2L31.4 82.6L32.1 76.1L32.8 70.0L33.5 64.3L34.2 59.0L34.9 54.4L35.6 50.4L36.3 47.1L37.0 44.6L37.7 43.0L38.4 42.1L39.1 42.1L39.8 43.0L40.5 44.6L41.2 47.1L41.9 50.4L42.6 54.4L43.3 59.0L44.0 64.3L44.7 70.0L45.4 76.1L46.2 82.6L46.9 89.2L47.6 96.0L48.3 102.8L49.0 109.4L49.7 115.9L50.4 122.0L51.1 127.7L51.8 133.0L52.5 137.6L53.2 141.6L53.9 144.9L54.6 147.4L55.3 149.0L56.0 149.9L56.7 149.9L57.4 149.0L58.1 147.4L58.8 144.9L59.5 141.6L60.2 137.6L60.9 133.0L61.6 127.7L62.3 122.0L63.0 115.9L63.7 109.4L64.4 102.8L65.1 96.0L65.8 89.2L66.5 82.6L67.2 76.1L67.9 70.0L68.6 64.3L69.3 59.0L70.0 54.4L70.7 50.4L71.4 47.1L72.1 44.6L72.8 43.0L73.5 42.1L74.2 42.1L74.9 43.0L75.6 44.6L76.3 47.1L77.0 50.4L77.8 54.4L78.5 59.0L79.2 64.3L79.9 70.0L80.6 76.1L81.3 82.6L82.0 89.2L82.7 96.0L83.4 102.8L84.1 109.4L84.8 115.9L85.5 122.0L86.2 127.7L86.9 133.0L87.6 137.6L88.3 141.6L89.0 144.9L89.7 147.4L90.4 149.0L91.1 149.9L91.8 149.9L92.5 149.0L93.2 147.4L93.9 144.9L94.6 141.6L95.3 137.6L96.0 133.0L96.7 127.7L97.4 122.0L98.1 115.9L98.8 109.4L99.5 102.8L100.2 96.0L100.9 89.2L101.6 82.6L102.3 76.1L103.0 70.0L103.7 64.3L104.4 59.0L105.1 54.4L105.8 50.4L106.5 47.1L107.2 44.6L107.9 43.0L108.6 42.1L109.4 42.1L110.1 43.0L110.8 44.6L111.5 47.1L112.2 50.4L112.9 54.4L113.6 59.0L114.3 64.3L115.0 70.0L115.7 76.1L116.4 82.6L117.1 89.2L117.8 96.0L118.5 102.8L119.2 109.4L119.9 115.9L120.6 122.0L121.3 127.7L122.0 133.0L122.7 137.6L123.4 141.6L124.1 144.9L124.8 147.4L125.5 149.0L126.2 149.9L126.9 149.9L127.6 149.0L128.3 147.4L129.0 144.9L129.7 141.6L130.4 137.6L131.1 133.0L131.8 127.7L132.5 122.0L133.2 115.9L133.9 109.4L134.6 102.8L135.3 96.0L136.0 89.2L136.7 82.6L137.4 76.1L138.1 70.0L138.8 64.3L139.5 59.0L140.2 54.4L141.0 50.4L141.7 47.1L142.4 44.6L143.1 43.0L143.8 42.1L144.5 42.1L145.2 43.0L145.9 44.6L146.6 47.1L147.3 50.4L148.0 54.4L148.7 59.0L149.4 64.3L150.1 70.0L150.8 76.1L151.5 82.6L152.2 89.2L152.9 96.0L153.6 102.8L154.3 109.4L155.0 115.9L155.7 122.0L156.4 127.7L157.1 133.0L157.8 137.6L158.5 141.6L159.2 144.9L159.9 147.4L160.6 149.0L161.3 149.9L162.0 149.9L162.7 149.0L163.4 147.4L164.1 144.9L164.8 141.6L165.5 137.6L166.2 133.0L166.9 127.7L167.6 122.0L168.3 115.9L169.0 109.4L169.7 102.8L170.4 96.0L171.1 89.2L171.8 82.6L172.6 76.1L173.3 70.0L174.0 64.3L174.7 59.0L175.4 54.4L176.1 50.4L176.8 47.1L177.5 44.6L178.2 43.0L178.9 42.1L179.6 42.1L180.3 43.0L181.0 44.6L181.7 47.1L182.4 50.4L183.1 54.4L183.8 59.0L184.5 64.3L185.2 70.0L185.9 76.1L186.6 82.6L187.3 89.2L188.0 96.0L188.7 102.8L189.4 109.4L190.1 115.9L190.8 122.0L191.5 127.7L192.2 133.0L192.9 137.6L193.6 141.6L194.3 144.9L195.0 147.4L195.7 149.0L196.4 149.9L197.1 149.9L197.8 149.0L198.5 147.4L199.2 144.9L199.9 141.6L200.6 137.6L201.3 133.0L202.0 127.7L202.7 122.0L203.4 115.9L204.2 109.4L204.9 102.8L205.6 96.0L206.3 89.2L207.0 82.6L207.7 76.1L208.4 70.0L209.1 64.3L209.8 59.0L210.5 54.4L211.2 50.4L211.9 47.1L212.6 44.6L213.3 43.0L214.0 42.1L214.7 42.1L215.4 43.0L216.1 44.6L216.8 47.1L217.5 50.4L218.2 54.4L218.9 59.0L219.6 64.3L220.3 70.0L221.0 76.1L221.7 82.6L222.4 89.2L223.1 96.0L223.8 102.8L224.5 109.4L225.2 115.9L225.9 122.0L226.6 127.7L227.3 133.0L228.0 137.6L228.7 141.6L229.4 144.9L230.1 147.4L230.8 149.0L231.5 149.9L232.2 149.9L232.9 149.0L233.6 147.4L234.3 144.9L235.0 141.6L235.8 137.6L236.5 133.0L237.2 127.7L237.9 122.0L238.6 115.9L239.3 109.4L240.0 102.8L240.7 96.0L241.4 89.2L242.1 82.6L242.8 76.1L243.5 70.0L244.2 64.3L244.9 59.0L245.6 54.4L246.3 50.4L247.0 47.1L247.7 44.6L248.4 43.0L249.1 42.1L249.8 42.1L250.5 43.0L251.2 44.6L251.9 47.1L252.6 50.4L253.3 54.4L254.0 59.0L254.7 64.3L255.4 70.0L256.1 76.1L256.8 82.6L257.5 89.2L258.2 96.0L258.9 102.8L259.6 109.4L260.3 115.9L261.0 122.0L261.7 127.7L262.4 133.0L263.1 137.6L263.8 141.6L264.5 144.9L265.2 147.4L265.9 149.0L266.6 149.9L267.4 149.9L268.1 149.0L268.8 147.4L269.5 144.9L270.2 141.6L270.9 137.6L271.6 133.0L272.3 127.7L273.0 122.0L273.7 115.9L274.4 109.4L275.1 102.8L275.8 96.0L276.5 89.2L277.2 82.6L277.9 76.1L278.6 70.0L279.3 64.3L280.0 59.0L280.7 54.4L281.4 50.4L282.1 47.1L282.8 44.6L283.5 43.0L284.2 42.1L284.9 42.1L285.6 43.0L286.3 44.6L287.0 47.1L287.7 50.4L288.4 54.4L289.1 59.0L289.8 64.3L290.5 70.0L291.2 76.1L291.9 82.6L292.6 89.2L293.3 96.0L294.0 102.8L294.7 109.4L295.4 115.9L296.1 122.0L296.8 127.7L297.5 133.0L298.2 137.6L299.0 141.6L299.7 144.9L300.4 147.4L301.1 149.0L301.8 149.9L302.5 149.9L303.2 149.0L303.9 147.4L304.6 144.9L305.3 141.6L306.0 137.6L306.7 133.0L307.4 127.7L308.1 122.0L308.8 115.9L309.5 109.4L310.2 102.8L310.9 96.0L311.6 89.2L312.3 82.6L313.0 76.1L313.7 70.0L314.4 64.3L315.1 59.0L315.8 54.4L316.5 50.4L317.2 47.1L317.9 44.6L318.6 43.0L319.3 42.1L320.0 42.1L320.7 43.0L321.4 44.6L322.1 47.1L322.8 50.4L323.5 54.4L324.2 59.0L324.9 64.3L325.6 70.0L326.3 76.1L327.0 82.6L327.7 89.2L328.4 96.0L329.1 102.8L329.8 109.4L330.6 115.9L331.3 122.0L332.0 127.7L332.7 133.0L333.4 137.6L334.1 141.6L334.8 144.9L335.5 147.4L336.2 149.0L336.9 149.9L337.6 149.9L338.3 149.0L339.0 147.4L339.7 144.9L340.4 141.6L341.1 137.6L341.8 133.0L342.5 127.7L343.2 122.0L343.9 115.9L344.6 109.4L345.3 102.8L346.0 96.0"/>
<path class="s" d="M30.0 96.0L30.7 96.8L31.4 97.5L32.1 98.3L32.8 99.0L33.5 99.8L34.2 100.5L34.9 101.3L35.6 102.0L36.3 102.8L37.0 103.5L37.7 104.3L38.4 105.0L39.1 105.7L39.8 106.5L40.5 107.2L41.2 108.0L41.9 108.7L42.6 109.4L43.3 110.2L44.0 110.9L44.7 111.6L45.4 112.3L46.2 113.0L46.9 113.8L47.6 114.5L48.3 115.2L49.0 115.9L49.7 116.6L50.4 117.3L51.1 118.0L51.8 118.7L52.5 119.3L53.2 120.0L53.9 120.7L54.6 121.4L55.3 122.0L56.0 122.7L56.7 123.3L57.4 124.0L58.1 124.6L58.8 125.3L59.5 125.9L60.2 126.5L60.9 127.1L61.6 127.7L62.3 128.3L63.0 128.9L63.7 129.5L64.4 130.1L65.1 130.7L65.8 131.3L66.5 131.9L67.2 132.4L67.9 133.0L68.6 133.5L69.3 134.1L70.0 134.6L70.7 135.1L71.4 135.6L72.1 136.1L72.8 136.6L73.5 137.1L74.2 137.6L74.9 138.1L75.6 138.6L76.3 139.0L77.0 139.5L77.8 139.9L78.5 140.3L79.2 140.8L79.9 141.2L80.6 141.6L81.3 142.0L82.0 142.4L82.7 142.8L83.4 143.1L84.1 143.5L84.8 143.9L85.5 144.2L86.2 144.5L86.9 144.9L87.6 145.2L88.3 145.5L89.0 145.8L89.7 146.1L90.4 146.3L91.1 146.6L91.8 146.9L92.5 147.1L93.2 147.4L93.9 147.6L94.6 147.8L95.3 148.0L96.0 148.2L96.7 148.4L97.4 148.6L98.1 148.7L98.8 148.9L99.5 149.0L100.2 149.2L100.9 149.3L101.6 149.4L102.3 149.5L103.0 149.6L103.7 149.7L104.4 149.8L105.1 149.8L105.8 149.9L106.5 149.9L107.2 150.0L107.9 150.0L108.6 150.0L109.4 150.0L110.1 150.0L110.8 150.0L111.5 149.9L112.2 149.9L112.9 149.8L113.6 149.8L114.3 149.7L115.0 149.6L115.7 149.5L116.4 149.4L117.1 149.3L117.8 149.2L118.5 149.0L119.2 148.9L119.9 148.7L120.6 148.6L121.3 148.4L122.0 148.2L122.7 148.0L123.4 147.8L124.1 147.6L124.8 147.4L125.5 147.1L126.2 146.9L126.9 146.6L127.6 146.3L128.3 146.1L129.0 145.8L129.7 145.5L130.4 145.2L131.1 144.9L131.8 144.5L132.5 144.2L133.2 143.9L133.9 143.5L134.6 143.1L135.3 142.8L136.0 142.4L136.7 142.0L137.4 141.6L138.1 141.2L138.8 140.8L139.5 140.3L140.2 139.9L141.0 139.5L141.7 139.0L142.4 138.6L143.1 138.1L143.8 137.6L144.5 137.1L145.2 136.6L145.9 136.1L146.6 135.6L147.3 135.1L148.0 134.6L148.7 134.1L149.4 133.5L150.1 133.0L150.8 132.4L151.5 131.9L152.2 131.3L152.9 130.7L153.6 130.1L154.3 129.5L155.0 128.9L155.7 128.3L156.4 127.7L157.1 127.1L157.8 126.5L158.5 125.9L159.2 125.3L159.9 124.6L160.6 124.0L161.3 123.3L162.0 122.7L162.7 122.0L163.4 121.4L164.1 120.7L164.8 120.0L165.5 119.3L166.2 118.7L166.9 118.0L167.6 117.3L168.3 116.6L169.0 115.9L169.7 115.2L170.4 114.5L171.1 113.8L171.8 113.0L172.6 112.3L173.3 111.6L174.0 110.9L174.7 110.2L175.4 109.4L176.1 108.7L176.8 108.0L177.5 107.2L178.2 106.5L178.9 105.7L179.6 105.0L180.3 104.3L181.0 103.5L181.7 102.8L182.4 102.0L183.1 101.3L183.8 100.5L184.5 99.8L185.2 99.0L185.9 98.3L186.6 97.5L187.3 96.8L188.0 96.0L188.7 95.2L189.4 94.5L190.1 93.7L190.8 93.0L191.5 92.2L192.2 91.5L192.9 90.7L193.6 90.0L194.3 89.2L195.0 88.5L195.7 87.7L196.4 87.0L197.1 86.3L197.8 85.5L198.5 84.8L199.2 84.0L199.9 83.3L200.6 82.6L201.3 81.8L202.0 81.1L202.7 80.4L203.4 79.7L204.2 79.0L204.9 78.2L205.6 77.5L206.3 76.8L207.0 76.1L207.7 75.4L208.4 74.7L209.1 74.0L209.8 73.3L210.5 72.7L211.2 72.0L211.9 71.3L212.6 70.6L213.3 70.0L214.0 69.3L214.7 68.7L215.4 68.0L216.1 67.4L216.8 66.7L217.5 66.1L218.2 65.5L218.9 64.9L219.6 64.3L220.3 63.7L221.0 63.1L221.7 62.5L222.4 61.9L223.1 61.3L223.8 60.7L224.5 60.1L225.2 59.6L225.9 59.0L226.6 58.5L227.3 57.9L228.0 57.4L228.7 56.9L229.4 56.4L230.1 55.9L230.8 55.4L231.5 54.9L232.2 54.4L232.9 53.9L233.6 53.4L234.3 53.0L235.0 52.5L235.8 52.1L236.5 51.7L237.2 51.2L237.9 50.8L238.6 50.4L239.3 50.0L240.0 49.6L240.7 49.2L241.4 48.9L242.1 48.5L242.8 48.1L243.5 47.8L244.2 47.5L244.9 47.1L245.6 46.8L246.3 46.5L247.0 46.2L247.7 45.9L248.4 45.7L249.1 45.4L249.8 45.1L250.5 44.9L251.2 44.6L251.9 44.4L252.6 44.2L253.3 44.0L254.0 43.8L254.7 43.6L255.4 43.4L256.1 43.3L256.8 43.1L257.5 43.0L258.2 42.8L258.9 42.7L259.6 42.6L260.3 42.5L261.0 42.4L261.7 42.3L262.4 42.2L263.1 42.2L263.8 42.1L264.5 42.1L265.2 42.0L265.9 42.0L266.6 42.0L267.4 42.0L268.1 42.0L268.8 42.0L269.5 42.1L270.2 42.1L270.9 42.2L271.6 42.2L272.3 42.3L273.0 42.4L273.7 42.5L274.4 42.6L275.1 42.7L275.8 42.8L276.5 43.0L277.2 43.1L277.9 43.3L278.6 43.4L279.3 43.6L280.0 43.8L280.7 44.0L281.4 44.2L282.1 44.4L282.8 44.6L283.5 44.9L284.2 45.1L284.9 45.4L285.6 45.7L286.3 45.9L287.0 46.2L287.7 46.5L288.4 46.8L289.1 47.1L289.8 47.5L290.5 47.8L291.2 48.1L291.9 48.5L292.6 48.9L293.3 49.2L294.0 49.6L294.7 50.0L295.4 50.4L296.1 50.8L296.8 51.2L297.5 51.7L298.2 52.1L299.0 52.5L299.7 53.0L300.4 53.4L301.1 53.9L301.8 54.4L302.5 54.9L303.2 55.4L303.9 55.9L304.6 56.4L305.3 56.9L306.0 57.4L306.7 57.9L307.4 58.5L308.1 59.0L308.8 59.6L309.5 60.1L310.2 60.7L310.9 61.3L311.6 61.9L312.3 62.5L313.0 63.1L313.7 63.7L314.4 64.3L315.1 64.9L315.8 65.5L316.5 66.1L317.2 66.7L317.9 67.4L318.6 68.0L319.3 68.7L320.0 69.3L320.7 70.0L321.4 70.6L322.1 71.3L322.8 72.0L323.5 72.7L324.2 73.3L324.9 74.0L325.6 74.7L326.3 75.4L327.0 76.1L327.7 76.8L328.4 77.5L329.1 78.2L329.8 79.0L330.6 79.7L331.3 80.4L332.0 81.1L332.7 81.8L333.4 82.6L334.1 83.3L334.8 84.0L335.5 84.8L336.2 85.5L336.9 86.3L337.6 87.0L338.3 87.7L339.0 88.5L339.7 89.2L340.4 90.0L341.1 90.7L341.8 91.5L342.5 92.2L343.2 93.0L343.9 93.7L344.6 94.5L345.3 95.2L346.0 96.0" style="stroke-width:2"/>
<path class="m" d="M30.0 96V96.0"/><circle class="a" cx="30.0" cy="96.0" r="4"/>
<path class="m" d="M61.6 96V127.7"/><circle class="a" cx="61.6" cy="127.7" r="4"/>
<path class="m" d="M93.2 96V147.4"/><circle class="a" cx="93.2" cy="147.4" r="4"/>
<path class="m" d="M124.8 96V147.4"/><circle class="a" cx="124.8" cy="147.4" r="4"/>
<path class="m" d="M156.4 96V127.7"/><circle class="a" cx="156.4" cy="127.7" r="4"/>
<path class="m" d="M188.0 96V96.0"/><circle class="a" cx="188.0" cy="96.0" r="4"/>
<path class="m" d="M219.6 96V64.3"/><circle class="a" cx="219.6" cy="64.3" r="4"/>
<path class="m" d="M251.2 96V44.6"/><circle class="a" cx="251.2" cy="44.6" r="4"/>
<path class="m" d="M282.8 96V44.6"/><circle class="a" cx="282.8" cy="44.6" r="4"/>
<path class="m" d="M314.4 96V64.3"/><circle class="a" cx="314.4" cy="64.3" r="4"/>
<path class="m" d="M346.0 96V96.0"/><circle class="a" cx="346.0" cy="96.0" r="4"/>
<text class="k" x="30" y="180">DÜNN: f = 0,9 · f<tspan dy="3" font-size="8">s</tspan></text>
<text class="k" x="346" y="180" text-anchor="end">DICK: f<tspan dy="3" font-size="8">a</tspan><tspan dy="-3"> = 0,1 · f</tspan><tspan dy="3" font-size="8">s</tspan></text>
<text class="k" x="348" y="90">t</text>
</svg><figcaption>Aliasing: Die Punkte sind die Abtastwerte eines Sinus mit 0,9 · f<sub>s</sub> (dünn). Genau dieselben Punkte liefert ein Sinus mit 0,1 · f<sub>s</sub> (dick). Aus den Zahlen allein ist nicht mehr zu erkennen, welcher es war.</figcaption></figure>

<figure class="dia"><svg viewBox="0 0 360 210" role="img" aria-label="Gehörte Frequenz über der Eingangsfrequenz: Bis zur halben Abtastrate steigt sie mit, danach fällt sie wieder bis null bei der Abtastrate, steigt wieder und so weiter, eine Zickzacklinie.">
<defs><marker id="ss-6" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-6m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<rect class="hl" x="44" y="40" width="74.0" height="120"/>
<path class="m" d="M44 160H348M44 160V28"/>
<path class="m d" d="M118.0 160V40"/>
<path class="m d" d="M192.0 160V40"/>
<path class="m d" d="M266.0 160V40"/>
<path class="m d" d="M340.0 160V40"/>
<path class="s" d="M44.0 160.0L118.0 40.0L192.0 160.0L266.0 40.0L340.0 160.0" style="stroke-width:2"/>
<path class="m" d="M177.2 160V136.0H48" marker-end="url(#ss-6m)"/><circle class="a" cx="177.2" cy="136.0" r="4"/>
<text class="k c" x="118.0" y="176">f<tspan dy="3" font-size="8">s</tspan><tspan dy="-3">/2</tspan></text><text class="k c" x="192.0" y="176">f<tspan dy="3" font-size="8">s</tspan></text><text class="k c" x="266.0" y="176">1,5 f<tspan dy="3" font-size="8">s</tspan></text><text class="k c" x="340.0" y="176">2 f<tspan dy="3" font-size="8">s</tspan></text>
<text class="k" x="38" y="44.0" text-anchor="end">f<tspan dy="3" font-size="8">s</tspan><tspan dy="-3">/2</tspan></text><text class="k" x="38" y="164" text-anchor="end">0</text>
<text class="k" x="48" y="24">GEHÖRT f<tspan dy="3" font-size="8">a</tspan></text><text class="k" x="340" y="194" text-anchor="end">EINGANG f</text>
</svg><figcaption>Die Frequenzachse wird an f<sub>s</sub>/2 gefaltet wie ein Zollstock. Nur im markierten Bereich bis f<sub>s</sub>/2 kommt heraus, was hineinging. Alles darüber landet gespiegelt irgendwo darin, zum Beispiel 0,9 · f<sub>s</sub> bei 0,1 · f<sub>s</sub> (Punkt).</figcaption></figure>

Ein Beispiel: Bei $f_s = 48\,\mathrm{kHz}$ kommt ein Ton mit 30 kHz als $\lvert 30 - 48 \rvert\,\mathrm{kHz} = 18\,\mathrm{kHz}$ heraus. Er war unhörbar und ist jetzt hörbar, und er hat mit dem ursprünglichen Klang nichts mehr zu tun. Dasselbe kennst du aus Filmen: Ein Wagenrad scheint sich langsam rückwärts zu drehen, wenn es sich zwischen zwei Bildern fast genau um einen Speichenabstand weiterdreht.

Deshalb sitzt vor jedem A/D-Wandler ein Tiefpass. Und deshalb muss man auch beim Rechnen aufpassen: Wer in Python eine Verzerrung oder ein hartes Rechteck erzeugt, erzeugt Obertöne, und die über $f_s/2$ falten sich zurück (siehe Typische Fehler).

::: sim abtastung f=5k fs=8k
„Abgetastet“ spielt, was ein idealer D/A-Wandler aus den Punkten macht. Zieh $f$ langsam von 1 kHz bis 8 kHz: Der gehörte Ton steigt bis $f_s/2 = 4\,\mathrm{kHz}$ und fällt danach wieder.
:::

```python
from werkzeug import *

fs = 8000                       # absichtlich niedrige Abtastrate
dauer = 4.0
t = zeit(dauer, fs)
f_start, f_ende = 100, 8000     # Sweep von 100 Hz bis f_s
k = (f_ende - f_start) / dauer  # Hz pro Sekunde
x = 0.3 * np.sin(2 * np.pi * (f_start * t + k / 2 * t ** 2))
speichern("alias_sweep.wav", ausblenden(x, fs=fs), fs=fs)
```

Was du hörst: Der Ton steigt zwei Sekunden lang bis 4 kHz und fällt danach wieder bis fast null, obwohl die Frequenz im Code stur weitersteigt. Mit `plt.specgram(x, Fs=fs)` siehst du die Faltung als Zickzack.

::: tipp Warum die Phase im Sweep so aussieht
Für einen Ton mit gleichmäßig steigender Frequenz $f(t) = f_\text{start} + k t$ steht im Sinus die aufintegrierte Phase $2\pi\left(f_\text{start}\, t + \tfrac{k}{2} t^2\right)$. Schreibt man einfach $2\pi f(t)\, t$, steigt die Frequenz doppelt so schnell wie gewollt, denn die Momentanfrequenz ist die Ableitung der Phase geteilt durch $2\pi$. Das ist dieselbe Regel wie beim Vibrato in Abschnitt 7.
:::

::: tipp Checkpoint
- [ ] Ich kann das Abtasttheorem in einem Satz sagen und weiß, was die Nyquist-Frequenz ist.
- [ ] Ich kann eine Alias-Frequenz ausrechnen, auch für Frequenzen über $f_s$.
- [ ] Ich kann begründen, warum es 44,1 und 48 kHz sind und wozu das Anti-Aliasing-Filter dient.
- [ ] Ich habe den Sweep gehört und in der Simulation Original und abgetastet verglichen.
:::

## 9. Bits: wie fein die Zahlen sind

Die Abtastrate legt fest, wie oft gemessen wird, die **Bittiefe**, wie genau. Mit $N$ Bit gibt es $2^N$ Stufen: bei 16 Bit (CD) 65 536, bei 24 Bit (Studio) knapp 16,8 Millionen. Jeder Messwert wird auf die nächste Stufe gerundet. Der Rundungsfehler klingt wie ein leises Rauschen, das **Quantisierungsrauschen**.

<figure class="dia"><svg viewBox="0 0 360 206" role="img" aria-label="Ein Sinus und seine Abtastwerte, gerundet auf neun Stufen im Abstand von einem Viertel. Die gerundeten Werte bilden eine Treppe, die den Sinus grob nachzeichnet.">
<path class="m d" d="M44 180.0H346"/>
<text class="k" x="38" y="183.0" text-anchor="end">−1</text>
<path class="m d" d="M44 161.0H346"/>
<path class="m d" d="M44 142.0H346"/>
<text class="k" x="38" y="145.0" text-anchor="end">−0,5</text>
<path class="m d" d="M44 123.0H346"/>
<path class="m" d="M44 104.0H346"/>
<text class="k" x="38" y="107.0" text-anchor="end">0</text>
<path class="m d" d="M44 85.0H346"/>
<path class="m d" d="M44 66.0H346"/>
<text class="k" x="38" y="69.0" text-anchor="end">0,5</text>
<path class="m d" d="M44 47.0H346"/>
<path class="m d" d="M44 28.0H346"/>
<text class="k" x="38" y="31.0" text-anchor="end">1</text>
<path class="m" d="M44.0 104.0L44.8 102.8L45.5 101.6L46.3 100.4L47.0 99.2L47.8 98.0L48.5 96.8L49.3 95.7L50.0 94.5L50.8 93.3L51.5 92.1L52.3 90.9L53.1 89.8L53.8 88.6L54.6 87.4L55.3 86.3L56.1 85.1L56.8 83.9L57.6 82.8L58.3 81.7L59.1 80.5L59.9 79.4L60.6 78.3L61.4 77.1L62.1 76.0L62.9 74.9L63.6 73.8L64.4 72.7L65.1 71.6L65.9 70.6L66.7 69.5L67.4 68.4L68.2 67.4L68.9 66.3L69.7 65.3L70.4 64.3L71.2 63.3L71.9 62.3L72.7 61.3L73.4 60.3L74.2 59.3L75.0 58.4L75.7 57.4L76.5 56.5L77.2 55.6L78.0 54.6L78.7 53.7L79.5 52.9L80.2 52.0L81.0 51.1L81.8 50.3L82.5 49.4L83.3 48.6L84.0 47.8L84.8 47.0L85.5 46.2L86.3 45.4L87.0 44.7L87.8 43.9L88.5 43.2L89.3 42.5L90.1 41.8L90.8 41.1L91.6 40.5L92.3 39.8L93.1 39.2L93.8 38.6L94.6 38.0L95.3 37.4L96.1 36.8L96.9 36.3L97.6 35.7L98.4 35.2L99.1 34.7L99.9 34.3L100.6 33.8L101.4 33.3L102.1 32.9L102.9 32.5L103.6 32.1L104.4 31.7L105.2 31.4L105.9 31.0L106.7 30.7L107.4 30.4L108.2 30.1L108.9 29.8L109.7 29.6L110.4 29.3L111.2 29.1L112.0 28.9L112.7 28.8L113.5 28.6L114.2 28.5L115.0 28.3L115.7 28.2L116.5 28.1L117.2 28.1L118.0 28.0L118.7 28.0L119.5 28.0L120.3 28.0L121.0 28.0L121.8 28.1L122.5 28.1L123.3 28.2L124.0 28.3L124.8 28.5L125.5 28.6L126.3 28.8L127.1 28.9L127.8 29.1L128.6 29.3L129.3 29.6L130.1 29.8L130.8 30.1L131.6 30.4L132.3 30.7L133.1 31.0L133.8 31.4L134.6 31.7L135.4 32.1L136.1 32.5L136.9 32.9L137.6 33.3L138.4 33.8L139.1 34.3L139.9 34.7L140.6 35.2L141.4 35.7L142.2 36.3L142.9 36.8L143.7 37.4L144.4 38.0L145.2 38.6L145.9 39.2L146.7 39.8L147.4 40.5L148.2 41.1L148.9 41.8L149.7 42.5L150.5 43.2L151.2 43.9L152.0 44.7L152.7 45.4L153.5 46.2L154.2 47.0L155.0 47.8L155.7 48.6L156.5 49.4L157.2 50.3L158.0 51.1L158.8 52.0L159.5 52.9L160.3 53.7L161.0 54.6L161.8 55.6L162.5 56.5L163.3 57.4L164.0 58.4L164.8 59.3L165.6 60.3L166.3 61.3L167.1 62.3L167.8 63.3L168.6 64.3L169.3 65.3L170.1 66.3L170.8 67.4L171.6 68.4L172.3 69.5L173.1 70.6L173.9 71.6L174.6 72.7L175.4 73.8L176.1 74.9L176.9 76.0L177.6 77.1L178.4 78.3L179.1 79.4L179.9 80.5L180.7 81.7L181.4 82.8L182.2 83.9L182.9 85.1L183.7 86.3L184.4 87.4L185.2 88.6L185.9 89.8L186.7 90.9L187.5 92.1L188.2 93.3L189.0 94.5L189.7 95.7L190.5 96.8L191.2 98.0L192.0 99.2L192.7 100.4L193.5 101.6L194.2 102.8L195.0 104.0L195.8 105.2L196.5 106.4L197.3 107.6L198.0 108.8L198.8 110.0L199.5 111.2L200.3 112.3L201.0 113.5L201.8 114.7L202.6 115.9L203.3 117.1L204.1 118.2L204.8 119.4L205.6 120.6L206.3 121.7L207.1 122.9L207.8 124.1L208.6 125.2L209.3 126.3L210.1 127.5L210.9 128.6L211.6 129.7L212.4 130.9L213.1 132.0L213.9 133.1L214.6 134.2L215.4 135.3L216.1 136.4L216.9 137.4L217.7 138.5L218.4 139.6L219.2 140.6L219.9 141.7L220.7 142.7L221.4 143.7L222.2 144.7L222.9 145.7L223.7 146.7L224.4 147.7L225.2 148.7L226.0 149.6L226.7 150.6L227.5 151.5L228.2 152.4L229.0 153.4L229.7 154.3L230.5 155.1L231.2 156.0L232.0 156.9L232.8 157.7L233.5 158.6L234.3 159.4L235.0 160.2L235.8 161.0L236.5 161.8L237.3 162.6L238.0 163.3L238.8 164.1L239.5 164.8L240.3 165.5L241.1 166.2L241.8 166.9L242.6 167.5L243.3 168.2L244.1 168.8L244.8 169.4L245.6 170.0L246.3 170.6L247.1 171.2L247.9 171.7L248.6 172.3L249.4 172.8L250.1 173.3L250.9 173.7L251.6 174.2L252.4 174.7L253.1 175.1L253.9 175.5L254.6 175.9L255.4 176.3L256.2 176.6L256.9 177.0L257.7 177.3L258.4 177.6L259.2 177.9L259.9 178.2L260.7 178.4L261.4 178.7L262.2 178.9L262.9 179.1L263.7 179.2L264.5 179.4L265.2 179.5L266.0 179.7L266.7 179.8L267.5 179.9L268.2 179.9L269.0 180.0L269.7 180.0L270.5 180.0L271.3 180.0L272.0 180.0L272.8 179.9L273.5 179.9L274.3 179.8L275.0 179.7L275.8 179.5L276.5 179.4L277.3 179.2L278.1 179.1L278.8 178.9L279.6 178.7L280.3 178.4L281.1 178.2L281.8 177.9L282.6 177.6L283.3 177.3L284.1 177.0L284.8 176.6L285.6 176.3L286.4 175.9L287.1 175.5L287.9 175.1L288.6 174.7L289.4 174.2L290.1 173.7L290.9 173.3L291.6 172.8L292.4 172.3L293.2 171.7L293.9 171.2L294.7 170.6L295.4 170.0L296.2 169.4L296.9 168.8L297.7 168.2L298.4 167.5L299.2 166.9L299.9 166.2L300.7 165.5L301.5 164.8L302.2 164.1L303.0 163.3L303.7 162.6L304.5 161.8L305.2 161.0L306.0 160.2L306.7 159.4L307.5 158.6L308.2 157.7L309.0 156.9L309.8 156.0L310.5 155.1L311.3 154.3L312.0 153.4L312.8 152.4L313.5 151.5L314.3 150.6L315.0 149.6L315.8 148.7L316.6 147.7L317.3 146.7L318.1 145.7L318.8 144.7L319.6 143.7L320.3 142.7L321.1 141.7L321.8 140.6L322.6 139.6L323.4 138.5L324.1 137.4L324.9 136.4L325.6 135.3L326.4 134.2L327.1 133.1L327.9 132.0L328.6 130.9L329.4 129.7L330.1 128.6L330.9 127.5L331.7 126.3L332.4 125.2L333.2 124.1L333.9 122.9L334.7 121.7L335.4 120.6L336.2 119.4L336.9 118.2L337.7 117.1L338.4 115.9L339.2 114.7L340.0 113.5L340.7 112.3L341.5 111.2L342.2 110.0L343.0 108.8L343.7 107.6L344.5 106.4L345.2 105.2L346.0 104.0" style="stroke-width:1.4"/>
<path class="s" d="M44.0 104.0 L56.6 104.0 L56.6 85.0 L69.2 85.0 L69.2 66.0 L81.8 66.0 L81.8 47.0 L94.3 47.0 L94.3 47.0 L106.9 47.0 L106.9 28.0 L119.5 28.0 L119.5 28.0 L132.1 28.0 L132.1 28.0 L144.7 28.0 L144.7 47.0 L157.2 47.0 L157.2 47.0 L169.8 47.0 L169.8 66.0 L182.4 66.0 L182.4 85.0 L195.0 85.0 L195.0 104.0 L207.6 104.0 L207.6 123.0 L220.2 123.0 L220.2 142.0 L232.8 142.0 L232.8 161.0 L245.3 161.0 L245.3 161.0 L257.9 161.0 L257.9 180.0 L270.5 180.0 L270.5 180.0 L283.1 180.0 L283.1 180.0 L295.7 180.0 L295.7 161.0 L308.2 161.0 L308.2 161.0 L320.8 161.0 L320.8 142.0 L333.4 142.0 L333.4 123.0 L346.0 123.0" style="stroke-width:2"/>
<circle class="a" cx="44.0" cy="104.0" r="3"/>
<circle class="a" cx="56.6" cy="85.0" r="3"/>
<circle class="a" cx="69.2" cy="66.0" r="3"/>
<circle class="a" cx="81.8" cy="47.0" r="3"/>
<circle class="a" cx="94.3" cy="47.0" r="3"/>
<circle class="a" cx="106.9" cy="28.0" r="3"/>
<circle class="a" cx="119.5" cy="28.0" r="3"/>
<circle class="a" cx="132.1" cy="28.0" r="3"/>
<circle class="a" cx="144.7" cy="47.0" r="3"/>
<circle class="a" cx="157.2" cy="47.0" r="3"/>
<circle class="a" cx="169.8" cy="66.0" r="3"/>
<circle class="a" cx="182.4" cy="85.0" r="3"/>
<circle class="a" cx="195.0" cy="104.0" r="3"/>
<circle class="a" cx="207.6" cy="123.0" r="3"/>
<circle class="a" cx="220.2" cy="142.0" r="3"/>
<circle class="a" cx="232.8" cy="161.0" r="3"/>
<circle class="a" cx="245.3" cy="161.0" r="3"/>
<circle class="a" cx="257.9" cy="180.0" r="3"/>
<circle class="a" cx="270.5" cy="180.0" r="3"/>
<circle class="a" cx="283.1" cy="180.0" r="3"/>
<circle class="a" cx="295.7" cy="161.0" r="3"/>
<circle class="a" cx="308.2" cy="161.0" r="3"/>
<circle class="a" cx="320.8" cy="142.0" r="3"/>
<circle class="a" cx="333.4" cy="123.0" r="3"/>
<path class="m" d="M352 85.0V104.0"/><text class="k" x="350" y="79.0" text-anchor="end">Δ</text>
<text class="k" x="44" y="200">3 BIT · STUFE Δ = 2/2³ = 0,25</text>
</svg><figcaption>Quantisierung mit 3 Bit: Jeder Abtastwert wird auf die nächste Stufe gerundet. Der Unterschied zur echten Kurve ist der Quantisierungsfehler, höchstens eine halbe Stufe. Bei 16 Bit sind die Stufen 8192-mal feiner.</figcaption></figure>

Wie laut ist dieses Rauschen? Für den Bereich von $-1$ bis $+1$ ist eine Stufe $\Delta = 2/2^N$ breit. Der Rundungsfehler liegt zwischen $-\Delta/2$ und $+\Delta/2$ und ist bei einem lebendigen Signal gleichmäßig verteilt. Daraus folgt eine der bekanntesten Formeln der Audiotechnik:

$$\mathrm{SNR} \approx 6{,}02\,N + 1{,}76\,\mathrm{dB} \qquad \text{(Sinus mit voller Aussteuerung)}$$

::: herleitung Woher die 6,02 und die 1,76 kommen
Ein Sinus mit voller Aussteuerung hat die Amplitude $1$ und die Leistung $\tfrac{1}{2}$ (Mittelwert von $\sin^2$).

Der Fehler $e$ ist gleichmäßig zwischen $-\Delta/2$ und $+\Delta/2$ verteilt. Seine Leistung ist der Mittelwert von $e^2$:

$$P_\text{Rauschen} = \frac{1}{\Delta}\int_{-\Delta/2}^{\Delta/2} e^2\,\mathrm{d}e = \frac{\Delta^2}{12}$$

Mit $\Delta = 2/2^N = 2^{1-N}$ wird das Verhältnis

$$\frac{P_\text{Sinus}}{P_\text{Rauschen}} = \frac{1/2}{\Delta^2/12} = \frac{6}{2^{2-2N}} = 1{,}5 \cdot 2^{2N}$$

und in Dezibel

$$10\log_{10}\!\left(1{,}5 \cdot 2^{2N}\right) = 10\log_{10} 1{,}5 + N \cdot 20\log_{10} 2 = 1{,}76 + 6{,}02\,N$$
:::

| Bittiefe | Stufen | Rauschabstand |
|---:|---:|---:|
| 8 Bit | 256 | $49{,}9\,\mathrm{dB}$ |
| 16 Bit | 65 536 | $98{,}1\,\mathrm{dB}$ |
| 24 Bit | 16 777 216 | $146{,}2\,\mathrm{dB}$ |

Jedes Bit verdoppelt die Auflösung, das sind 6 dB. 16 Bit reichen für die Wiedergabe von fast allem. 24 Bit nimmt man bei der Aufnahme, um Reserve zu haben (Headroom): Man kann vorsichtig aussteuern, ohne ins Rauschen zu geraten, und eine unerwartete Spitze übersteuert nicht. Die 146 dB erreicht kein echter Wandler, das Rauschen der Analogelektronik davor begrenzt sehr gute Geräte auf etwa 120 dB.

```python
from werkzeug import *

def quantisieren(x, bits):
    stufen = 2 ** (bits - 1)           # Stufen pro Halbachse
    return np.round(x * stufen) / stufen

t = zeit(2.0)
x = 0.99 * np.sin(2 * np.pi * 441.3 * t)   # krumme Frequenz

for bits in (4, 8, 12, 16):
    q = quantisieren(x, bits)
    snr = 10 * np.log10(np.mean(x ** 2) / np.mean((q - x) ** 2))
    print(f"{bits:2} Bit: gemessen {snr:5.1f} dB,"
          f" Formel {6.02 * bits + 1.76:5.1f} dB")
    speichern(f"bits_{bits}.wav", quantisieren(ausblenden(x), bits))
```

```ausgabe
 4 Bit: gemessen  25.9 dB, Formel  25.8 dB
 8 Bit: gemessen  49.7 dB, Formel  49.9 dB
12 Bit: gemessen  73.9 dB, Formel  74.0 dB
16 Bit: gemessen  98.0 dB, Formel  98.1 dB
```

Die Messung trifft die Formel auf ein, zwei Zehntel. Hör dir die 4-Bit-Datei an: Bei so groben Stufen klingt der Fehler nicht mehr wie Rauschen, sondern rau und verzerrt, weil er der Kurve folgt.

::: info Dither
Bei sehr leisen Signalen hängt der Rundungsfehler eng mit dem Signal zusammen und klingt als Verzerrung. Mischt man vor dem Runden ein winziges Rauschen von etwa einer Stufe dazu (**Dither**), wird der Fehler zufällig. Aus der Verzerrung wird ein gleichmäßiges, leises Rauschen, mit dem das Ohr viel besser zurechtkommt. Darum fügen gute Programme beim Umrechnen von 24 auf 16 Bit Dither hinzu.
:::

Am anderen Ende der Skala droht **Clipping**: Was über $\pm 1$ hinausgeht, wird digital hart abgeschnitten. Die Spitzen werden flach, und es entstehen neue Obertöne (Abschnitt 12). Darum steuert man bei Aufnahmen mit Reserve aus, zum Beispiel so, dass die Spitzen zwischen $-12$ und $-6\,\mathrm{dBFS}$ liegen.

::: tipp Checkpoint
- [ ] Ich kann die Formel $6{,}02\,N + 1{,}76\,\mathrm{dB}$ herleiten und anwenden.
- [ ] Ich kann erklären, wozu 24 Bit bei der Aufnahme gut sind, obwohl 16 Bit zum Hören reichen.
- [ ] Ich weiß, was Dither und Clipping sind.
:::

## 10. Echte Klänge: WAV-Dateien und Stereo

Bisher hast du Klänge nur erzeugt. Mit `laden` holst du auch Aufnahmen in Python, deine Stimme, eine Gitarre, ein Geräusch aus der Küche, und kannst alles darauf anwenden, was in dieser Notiz vorkommt.

### Was in einer WAV-Datei steht

Eine WAV-Datei ist fast nichts anderes als die Liste der Abtastwerte. Ein kurzer Kopf sagt, wie sie zu lesen ist: Abtastrate, Zahl der Kanäle, Bits pro Wert. Danach folgen die Werte, bei 16 Bit als ganze Zahlen von $-32\,768$ bis $+32\,767$, bei Stereo abwechselnd links und rechts. Daraus folgt die Datenmenge: Eine Minute Stereo mit 48 kHz und 16 Bit sind $48\,000 \cdot 2 \cdot 2\,\mathrm{Byte} \cdot 60 = 11{,}5\,\mathrm{MB}$. MP3 und AAC brauchen für dieselbe Minute je nach Qualität nur ein Sechstel bis ein Zehntel, weil sie weglassen, was man nicht hört.

### Eigene Aufnahmen

Handys speichern Sprachmemos meist als M4A, das ist AAC und kein WAV. Umwandeln geht so:

- **Am Mac im Terminal:** `afconvert -f WAVE -d LEI16 aufnahme.m4a aufnahme.wav`
- **Mit ffmpeg auf jedem System:** `ffmpeg -i aufnahme.m4a -ac 1 -ar 48000 -sample_fmt s16 aufnahme.wav`
- **Mit Audacity** (kostenlos): aufnehmen oder öffnen, dann „Exportieren als WAV“, 16 Bit PCM.

Danach liest `x, fs = laden("aufnahme.wav")` die Datei. Bei Stereo hat `x` zwei Spalten, `x.mean(axis=1)` macht Mono daraus. Nimm die Abtastrate immer aus der Datei und nicht aus `FS`, eine Aufnahme kann auch 44,1 kHz haben.

### Stereo: wie wir Richtungen hören

Das Gehör ortet eine Quelle mit zwei Unterschieden zwischen den Ohren. Schall von der Seite kommt am fernen Ohr bis zu etwa 0,7 ms später an (Laufzeitunterschied), und bei hohen Frequenzen schattet der Kopf das ferne Ohr ab (Pegelunterschied). Der Pan-Regler im Mischpult nutzt nur den zweiten: Er verteilt ein Monosignal mit verschiedenen Lautstärken auf links und rechts.

Wie verteilt man richtig? Teilt man linear auf, also $L = 1 - p$ und $R = p$, haben in der Mitte beide Kanäle 0,5. Die Leistung ist dann $0{,}5^2 + 0{,}5^2 = 0{,}5$, ein Loch von 3 dB, und ein Ton auf dem Weg von links nach rechts wird in der Mitte leiser. Besser ist ein Viertelkreis:

$$L = \cos\theta, \quad R = \sin\theta, \qquad \theta \text{ von } 0 \text{ (links) bis } \tfrac{\pi}{2} \text{ (rechts)}$$

Wegen $\cos^2\theta + \sin^2\theta = 1$ bleibt die Leistung überall gleich. In der Mitte hat jeder Kanal $1/\sqrt{2}$, also $-3\,\mathrm{dB}$. Viele Mischpulte nutzen genau dieses Gesetz.

```python
from werkzeug import *

# Ein Ton wandert in 4 Sekunden von links nach rechts
t = zeit(4.0)
ton = 0.3 * np.sin(2 * np.pi * 330 * t)
winkel = np.pi / 2 * t / t[-1]         # 0 = ganz links, π/2 = ganz rechts
stereo = np.column_stack([np.cos(winkel) * ton,    # linker Kanal
                          np.sin(winkel) * ton])   # rechter Kanal
speichern("wandern.wav", ausblenden(stereo))

# Wieder einlesen und in der Mitte nachmessen
x, fs = laden("wandern.wav")
print(x.shape, fs, "Hz")
m = len(x) // 2
spitzen = np.abs(x[m - 100:m + 100]).max(axis=0)
print("Mitte, links und rechts:", np.round(20 * np.log10(spitzen / 0.3), 1), "dB")
```

```ausgabe
(192000, 2) 48000 Hz
Mitte, links und rechts: [-3. -3.] dB
```

::: aufgabe Mit eigener Aufnahme
Nimm mit dem Handy drei Sekunden lang ein gleichmäßiges „aaa“ auf, wandle es um und lade es. Zeichne 20 ms davon mit `plt.plot`. Was siehst du, und wie lang ist eine Periode?
???
Eine Kurve, die sich regelmäßig wiederholt, aber kein Sinus ist: Die Stimme hat viele Obertöne. Eine Periode ist bei einer tiefen Männerstimme etwa 8 bis 10 ms lang (100 bis 125 Hz), bei einer Frauenstimme etwa 4 bis 5 ms (200 bis 250 Hz). Wie man die Tonhöhe automatisch misst, zeigt das Stimmgerät in Abschnitt 18.
:::

::: tipp Checkpoint
- [ ] Ich kann ausrechnen, wie viel Speicher eine Minute Audio braucht.
- [ ] Ich habe eine eigene Aufnahme in Python geladen und gezeichnet.
- [ ] Ich kann begründen, warum Panning mit Kosinus und Sinus besser ist als linear.
:::

<div class="teil"><span>Teil III · etwa 2 bis 3 Stunden</span><strong>Signale analysieren</strong><p>Zeiger als komplexe Zahlen, die diskrete Fourier-Transformation und das Spektrogramm: die Werkzeuge, mit denen man in einen Klang hineinschaut.</p></div>

## 11. Zeiger als komplexe Zahlen

Seit Abschnitt 2 rechnen wir mit Zeigern: Ein Sinus ist die Höhe eines Zeigers, der im Kreis läuft, zwei Töne gleicher Frequenz addiert man wie Vektoren. Komplexe Zahlen machen daraus Rechnen mit Zahlen statt Zeichnen mit Pfeilen. Für Spektrum und Filter sind sie das wichtigste Werkzeug, darum bekommen sie hier einen eigenen Abschnitt.

### Eine Zahl für Amplitude und Phase

Eine komplexe Zahl $z = a + \mathrm{j}b$ ist ein Punkt in der Ebene: $a$ nach rechts (Realteil), $b$ nach oben (Imaginärteil), mit $\mathrm{j}^2 = -1$. In der E-Technik heißt die imaginäre Einheit $\mathrm{j}$, weil $i$ schon der Strom ist. Statt mit $a$ und $b$ kann man den Punkt auch mit seinem Abstand vom Nullpunkt und seinem Winkel beschreiben: Betrag $\lvert z \rvert = \sqrt{a^2 + b^2}$ und Winkel $\arg z$.

Die Verbindung zum Kreis liefert die **Eulersche Formel**:

$$e^{\mathrm{j}\varphi} = \cos\varphi + \mathrm{j}\sin\varphi$$

$e^{\mathrm{j}\varphi}$ ist also der Punkt auf dem Einheitskreis beim Winkel $\varphi$. Warum gerade die Exponentialfunktion? Ihre Ableitung nach $\varphi$ ist $\mathrm{j}\,e^{\mathrm{j}\varphi}$, und Multiplizieren mit $\mathrm{j}$ dreht um 90°. Die Bewegung zeigt also immer senkrecht zum Zeiger, und genau so bewegt man sich auf einem Kreis.

Damit wird jeder Sinuston zu einem Produkt aus einer festen und einer drehenden Zahl:

$$A\cos(\omega t + \varphi) = \mathrm{Re}\left\{\underbrace{A e^{\mathrm{j}\varphi}}_{\text{komplexe Amplitude}} \cdot \; e^{\mathrm{j}\omega t}\right\}$$

Die **komplexe Amplitude** $\hat{X} = A e^{\mathrm{j}\varphi}$ trägt Amplitude und Phase in einer einzigen Zahl. Aus der Wechselstromrechnung kennst du sie als unterstrichene Größen wie $\underline{U}$ ([Notiz dazu](beitrag.html?b=gemischte-schaltung-wechselstrom)). Bei komplexen Amplituden ist der Bezug der Kosinus, ein Sinus ist $\sin(\omega t) = \cos(\omega t - 90°)$.

### Addieren und Multiplizieren

**Addieren** zweier Töne gleicher Frequenz ist Addieren ihrer komplexen Amplituden. Die Kosinussatz-Formel aus Abschnitt 5 fällt dabei von selbst heraus, als Betrag der Summe.

<figure class="dia"><svg viewBox="0 0 360 200" role="img" aria-label="Komplexe Ebene: Der Zeiger z1 der Länge 1 liegt auf der reellen Achse. Daran hängt der Zeiger z2 der Länge 0,5 unter 120 Grad. Die Summe zeigt mit Länge 0,866 unter 30 Grad.">
<defs><marker id="ss-12" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-12m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<path class="m" d="M20 160H348M60 184V22"/>
<path class="m d" d="M90 160A30 30 0 0 0 86.0 145.0"/><text class="k" x="96" y="154">30°</text>
<path class="s" d="M60 160L210.0 160.0" marker-end="url(#ss-12)" style="stroke-width:2"/>
<path class="s" d="M210.0 160.0L172.5 95.0" marker-end="url(#ss-12)" style="stroke-width:2"/>
<path class="s" d="M60 160L172.5 95.0" marker-end="url(#ss-12)" style="stroke-width:3"/>
<circle class="a" cx="172.5" cy="95.0" r="4"/>
<text x="135.0" y="180" text-anchor="middle">z<tspan dy="3" font-size="9">1</tspan><tspan dy="-3" style="font-size:10px;fill:var(--muted)"> = 1 BEI 0°</tspan></text>
<text x="203.2" y="133.5">z<tspan dy="3" font-size="9">2</tspan><tspan dy="-3" style="font-size:10px;fill:var(--muted)"> = 0,5 BEI 120°</tspan></text>
<text x="172.5" y="69.0" text-anchor="middle">z<tspan dy="3" font-size="9">1</tspan><tspan dy="-3"> + z</tspan><tspan dy="3" font-size="9">2</tspan></text><text class="k" x="172.5" y="83.0" text-anchor="middle">0,866 BEI 30°</text>
<text class="k" x="346" y="154" text-anchor="end">Re</text><text class="k" x="66" y="28">Im</text>
</svg><figcaption>Zwei Töne gleicher Frequenz addieren heißt Zeiger aneinanderhängen. Mit komplexen Zahlen ist das eine einfache Summe: 1 bei 0° plus 0,5 bei 120° ergibt 0,866 bei 30°.</figcaption></figure>

**Multiplizieren** heißt: Beträge multiplizieren, Winkel addieren.

$$A_1 e^{\mathrm{j}\varphi_1} \cdot A_2 e^{\mathrm{j}\varphi_2} = A_1 A_2 \, e^{\mathrm{j}(\varphi_1 + \varphi_2)}$$

Das ist genau, was ein Filter mit einem Sinus macht: Er multipliziert die Amplitude mit einem Faktor und verschiebt die Phase. Darum ist der **Frequenzgang** $H(f)$ eine komplexe Zahl. Der Betrag $\lvert H \rvert$ ist die Verstärkung, der Winkel $\arg H$ die Phasenverschiebung (Abschnitt 13).

### Negative Frequenzen

Aus der Eulerschen Formel folgt, wenn man sie für $+\omega t$ und $-\omega t$ addiert:

$$\cos(\omega t) = \frac{e^{\mathrm{j}\omega t} + e^{-\mathrm{j}\omega t}}{2}$$

Ein reeller Kosinus besteht aus **zwei** Zeigern mit halber Länge, einer dreht links herum, einer rechts herum. Ihre Imaginärteile heben sich in jedem Moment auf, übrig bleibt eine reelle Schwingung. Der rechtsherum drehende Zeiger hat die Frequenz $-f$. Darum zeigt die Fourier-Transformation reeller Signale jede Linie zweimal, bei $+f$ und bei $-f$, und darum ist die zweite Hälfte einer FFT ein Spiegelbild der ersten (Abschnitt 12).

```python
import numpy as np

# Komplexe Amplitude: Betrag = Amplitude, Winkel = Phase
z1 = 1.0 * np.exp(1j * 0)                # 1,0 bei 0°
z2 = 0.5 * np.exp(1j * np.deg2rad(120))  # 0,5 bei 120°
z = z1 + z2
print(f"Rechnung: Amplitude {abs(z):.4f}, Phase {np.degrees(np.angle(z)):.1f}°")

# Probe mit echten Signalen: zwei Kosinusse mit 100 Hz addieren
t = np.arange(48_000) / 48_000
x = (1.0 * np.cos(2 * np.pi * 100 * t)
     + 0.5 * np.cos(2 * np.pi * 100 * t + np.deg2rad(120)))
k = np.argmax(x[:480])                   # Spitze in der ersten Periode
phase = (-360 * 100 * t[k] + 180) % 360 - 180  # in −180° … 180°
print(f"Messung:  Amplitude {x[k]:.4f}, Phase {phase:.1f}°")
```

```ausgabe
Rechnung: Amplitude 0.8660, Phase 30.0°
Messung:  Amplitude 0.8660, Phase 30.0°
```

Eine Zeile komplexe Rechnung ersetzt das Addieren von 48 000 Abtastwerten und das Suchen der Spitze.

::: aufgabe Zeiger rechnen
1. Zwei Töne gleicher Frequenz mit Amplitude 1, der zweite um 90° verschoben. Wie groß ist die Summe, und wie viel dB ist das gegenüber einem einzelnen Ton?
2. Ein Filter hat bei einer Frequenz $H = 0{,}5\,e^{-\mathrm{j}\,60°}$. Was wird aus dem Ton $2\cos(\omega t)$?
???
1. $1 + \mathrm{j}$ hat den Betrag $\sqrt{2}$ und den Winkel 45°. Das sind $+3\,\mathrm{dB}$, genau in der Mitte zwischen Gleichtakt ($+6\,\mathrm{dB}$) und Auslöschung.
2. Die komplexe Amplitude ist $2 e^{\mathrm{j}0}$, mal $H$ ergibt $1\,e^{-\mathrm{j}\,60°}$. Heraus kommt $\cos(\omega t - 60°)$: halbe Amplitude, um 60° verzögert.
:::

::: tipp Checkpoint
- [ ] Ich kann eine komplexe Zahl in Betrag und Winkel umrechnen und zurück.
- [ ] Ich kann die Eulersche Formel aufschreiben und am Einheitskreis erklären.
- [ ] Ich weiß, warum ein Filter seinen Eingang mit einer komplexen Zahl multipliziert.
- [ ] Ich kann erklären, woher negative Frequenzen kommen.
:::

## 12. Das Spektrum: Frequenzen sichtbar machen

Ein Oszilloskop zeigt das Signal über der Zeit. Oft will man aber wissen, **welche Frequenzen** drinstecken: Welcher Oberton ist zu laut, wo brummt es, was hat das Filter weggenommen? Dafür gibt es die diskrete Fourier-Transformation (DFT). Sie macht aus $N$ Abtastwerten $N$ Frequenzwerte:

$$X[k] = \sum_{n=0}^{N-1} x[n] \, e^{-\mathrm{j}2\pi kn/N}, \qquad k = 0, 1, \dots, N-1$$

Mit Abschnitt 11 im Kopf ist das gar nicht wild. $e^{-\mathrm{j}2\pi kn/N}$ ist ein Zeiger, der während der $N$ Werte genau $k$-mal rückwärts im Kreis läuft. Die Summe multipliziert das Signal mit diesem Zeiger und summiert, dasselbe Prinzip wie bei $a_n$ und $b_n$ der Fourier-Reihe: Nur der Anteil, der im Takt mitdreht, bleibt übrig, alles andere mittelt sich weg. Das Ergebnis $X[k]$ ist eine komplexe Zahl. Ihr Betrag sagt, wie stark die Frequenz $k$ vertreten ist, ihr Winkel, mit welcher Phase (bezogen auf den Kosinus).

Die **FFT** (Fast Fourier Transform) ist ein schneller Rechenweg für genau diese Summe. Statt $N^2$ braucht sie nur etwa $N \log_2 N$ Rechenschritte, bei $N = 48\,000$ ist das der Unterschied zwischen gut zwei Milliarden und knapp einer Million.

Was du zum Lesen eines Spektrums wissen musst:

- **Frequenz eines Werts:** $X[k]$ gehört zur Frequenz $f_k = k \cdot f_s / N$.
- **Auflösung:** Benachbarte Werte liegen $\Delta f = f_s / N$ auseinander, und das ist genau eins durch die Dauer des Ausschnitts. Eine Sekunde Signal ergibt 1 Hz Auflösung, 10 ms nur 100 Hz. Feine Frequenzen kosten lange Zeit, das ist eine Grundregel der Signalverarbeitung und keine Schwäche der FFT.
- **Nur die Hälfte zählt:** Bei reellen Signalen ist die obere Hälfte ein Spiegelbild der unteren, das sind die negativen Frequenzen aus Abschnitt 11. `np.fft.rfft` rechnet deshalb nur $k = 0$ bis $N/2$ aus.
- **Skalierung:** Ein Sinus mit Amplitude $A$, der genau auf einen Wert $k$ fällt, ergibt $\lvert X[k] \rvert = A \cdot N/2$. Die Hälfte steckt in der negativen Frequenz. Mal $2/N$ genommen, steht die Amplitude da.
- **Leckeffekt und Fenster:** Passt keine ganze Zahl von Perioden in den Ausschnitt, zerläuft der Sinus über mehrere Nachbarwerte. Ein **Fenster** (zum Beispiel Hann) blendet Anfang und Ende des Ausschnitts sanft aus und hält das Zerlaufen klein. Mit Fenster teilt man durch dessen Summe statt durch $N$, dann stimmen die Amplituden wieder. Liegt ein Ton genau zwischen zwei Werten, zeigt die Spitze mit Hann-Fenster bis zu 1,4 dB zu wenig.

```python
from werkzeug import *
import matplotlib.pyplot as plt

def spektrum(x, fs=FS):
    w = np.hanning(len(x))             # Fenster gegen Leckeffekt
    X = np.fft.rfft(x * w)
    f = np.fft.rfftfreq(len(x), 1 / fs)
    amp = 2 * np.abs(X) / np.sum(w)    # Sinus → seine Amplitude
    return f, 20 * np.log10(amp + 1e-12)

t = zeit(1.0)
sinus = 0.9 * np.sin(2 * np.pi * 500 * t)
weich = np.tanh(3 * sinus) / np.tanh(3)   # sanfte Sättigung
hart = np.clip(3 * sinus, -1, 1)          # harte Begrenzung

signale = [("sauber", sinus), ("weich", weich), ("hart", hart)]
fig, achsen = plt.subplots(3, 1, sharex=True, sharey=True)
for ax, (name, x) in zip(achsen, signale):
    f, db = spektrum(x)
    ax.plot(f, db)
    ax.set_title(name, loc="left")
    ax.set_ylabel("dBFS")
    speichern(f"verzerrt_{name}.wav", ausblenden(0.5 * x))
ax.set_xlim(0, 6000)
ax.set_ylim(-120, 5)
ax.set_xlabel("f in Hz")
plt.tight_layout()
plt.show()
```

Der saubere Sinus hat eine einzige Spitze bei 500 Hz. Die beiden verzerrten haben zusätzliche Spitzen bei 1500, 2500, 3500 Hz und so weiter, nur **ungerade Vielfache**. Das ist kein Zufall. Beide Kennlinien sind symmetrisch, negative Werte werden genauso behandelt wie positive, und eine symmetrische [[Verzerrung|verzerrung]] erzeugt nur ungerade Obertöne. Eine unsymmetrische Kennlinie, etwa eine einzelne Röhren- oder Transistorstufe, erzeugt auch gerade, und das ist ein Teil des Rufs vom „warmen“ Röhrenklang. Die weiche Sättigung hat außerdem viel weniger hohe Obertöne als das harte Abschneiden: beim 21. Teilton etwa $-99$ statt $-43\,\mathrm{dBFS}$. Darum klingt sie milder.

Fällt dir beim harten Clipping etwas auf? Der Grundton liegt bei $+1{,}9\,\mathrm{dBFS}$, also **über** der Vollaussteuerung, obwohl kein einziger Wert über 1 hinausgeht. Das Signal ist fast ein Rechteck, und ein Rechteck mit der Spitze 1 hat einen Grundton mit der Amplitude $4/\pi \approx 1{,}27$. Ein einzelner Teilton kann größer sein als das ganze Signal.

### Das Spektrogramm: Frequenzen über die Zeit

Ein Spektrum über eine ganze Aufnahme verwischt alles, was nacheinander passiert. Ein **Spektrogramm** zerlegt das Signal deshalb in kurze, überlappende Stücke, rechnet für jedes ein Spektrum und malt sie nebeneinander: Zeit nach rechts, Frequenz nach oben, Pegel als Farbe. Hier wirkt die Grundregel von oben ganz direkt. Stücke mit 2048 Werten sind bei 48 kHz 43 ms lang und lösen Frequenzen auf $48\,000/2048 \approx 23\,\mathrm{Hz}$ auf. Längere Stücke trennen Frequenzen besser, verschmieren aber schnelle Änderungen.

```python
from werkzeug import *
import matplotlib.pyplot as plt

def saege(f, dauer):
    """Sägezahn aus Teiltönen bis f_s/2, also ohne Aliasing."""
    t = zeit(dauer)
    x = np.zeros_like(t)
    for n in range(1, int(FS / 2 / f) + 1):
        x += (-1) ** (n + 1) * np.sin(2 * np.pi * n * f * t) / n
    return 2 / np.pi * x

noten = [220, 277.18, 329.63, 440]       # A-Dur-Dreiklang aufwärts
x = np.concatenate([ausblenden(0.3 * saege(f, 0.5)) for f in noten])
speichern("arpeggio.wav", x)

plt.specgram(x, Fs=FS, NFFT=2048, noverlap=1536,
             cmap="magma", vmin=-110)    # Untergrenze, sonst ist alles hell
plt.ylim(0, 5000)
plt.xlabel("t in s")
plt.ylabel("f in Hz")
plt.colorbar(label="dB")
plt.show()
```

Jede Note erscheint als Stapel waagrechter Linien: unten der Grundton, darüber die Obertöne in gleichen Abständen. Bei der höheren Note liegen die Linien weiter auseinander, weil ihr Grundton höher ist.

::: aufgabe Auflösung
1. Du rechnest eine FFT über $N = 4096$ Werte bei 48 kHz. Wie groß ist die Frequenzauflösung? Liegt ein 1-kHz-Ton genau auf einem Wert?
2. Ändere im Spektrogramm `NFFT=2048` auf `NFFT=256` und auf `NFFT=16384` (und `noverlap` jeweils auf drei Viertel davon). Was passiert?
???
1. $\Delta f = 48\,000 / 4096 = 11{,}72\,\mathrm{Hz}$. Der Ton liegt bei $k = 1000 / 11{,}72 = 85{,}33$, also zwischen zwei Werten, und zerläuft. Mit $N = 4800$ ist $\Delta f = 10\,\mathrm{Hz}$, und 1 kHz liegt genau bei $k = 100$.
2. Mit 256 Werten (5,3 ms) sind die Notenwechsel scharf, aber die Obertöne verschwimmen zu breiten Bändern (188 Hz Auflösung). Mit 16 384 Werten (341 ms) sind die Linien messerscharf, aber die Übergänge zwischen den Noten verschmieren.
:::

::: tipp Checkpoint
- [ ] Ich kann die DFT-Formel lesen und erklären, warum Multiplizieren mit einem drehenden Zeiger eine Frequenz herausfischt.
- [ ] Ich kann Frequenz, Auflösung und Amplitude aus einer FFT richtig ablesen, auch mit Fenster.
- [ ] Ich kann den Zusammenhang zwischen Dauer und Frequenzauflösung erklären.
- [ ] Ich habe die Spektren von sauberem und verzerrtem Sinus und ein Spektrogramm erzeugt.
:::

<div class="teil"><span>Teil IV · etwa 3 bis 4 Stunden</span><strong>Systeme</strong><p>Filter erster und zweiter Ordnung, Frequenzgänge, Echo und Kammfilter, Impulsantwort und Faltung: wie man Klang gezielt verändert.</p></div>

## 13. Filter: Frequenzen formen

Ein [[Filter|filter]] lässt manche Frequenzen durch und schwächt andere. Jeder Klangregler am Radio, jeder Equalizer, jede Frequenzweiche im Lautsprecher ist eines.

| Filter | Wirkung | Typischer Einsatz |
|:---|:---|:---|
| Tiefpass | lässt Tiefen durch | Synthesizer weicher machen, Anti-Aliasing |
| Hochpass | lässt Höhen durch | Trittschall und Rumpeln unter etwa 80 Hz aus der Stimme nehmen |
| Bandpass | lässt nur einen Bereich durch | Telefonklang, etwa 300 bis 3400 Hz |
| Kerbfilter (Notch) | schneidet eine schmale Frequenz heraus | Netzbrummen bei 50 Hz |
| Glocke (Peak) | hebt oder senkt einen Bereich | Equalizer im Mischpult |
| Kuhschwanz (Shelf) | hebt oder senkt alles ober- oder unterhalb | Bass- und Höhenregler |

### Der RC-Tiefpass, analog

Den einfachsten [[Tiefpass|tiefpass]] kennst du aus der E-Technik: ein Widerstand und ein Kondensator. Sein Frequenzgang ist

$$H(f) = \frac{1}{1 + \mathrm{j}\,f/f_c}, \qquad \lvert H(f) \rvert = \frac{1}{\sqrt{1 + (f/f_c)^2}}, \qquad f_c = \frac{1}{2\pi RC}$$

Bei $f_c$ ist $\lvert H \rvert = 1/\sqrt{2}$, also $-3\,\mathrm{dB}$, und die Phase ist $-45°$. Weit darüber halbiert jede Oktave die Amplitude: $-6\,\mathrm{dB}$ pro Oktave, gleichbedeutend mit $-20\,\mathrm{dB}$ pro Dekade. So ein Filter heißt **erster Ordnung**.

::: sim rc r=1.6k c=100n
Mit 1,6 kΩ und 100 nF liegt $f_c$ bei knapp 1 kHz, wie im Python-Beispiel unten. „Im Labor anhören“ schickt einen Sägezahn durch genau dieses Filter.
:::

### Derselbe Tiefpass, digital

Wie wird daraus ein Programm? Die Spannung $y$ am Kondensator gehorcht der Differentialgleichung

$$\tau \, \frac{\mathrm{d}y}{\mathrm{d}t} = x(t) - y(t), \qquad \tau = RC = \frac{1}{2\pi f_c}$$

Sie sagt: Der Ausgang läuft dem Eingang hinterher, umso schneller, je größer der Abstand ist. Hält man den Eingang für einen Abtastschritt $T_s$ fest, kennt man die Lösung genau, es ist die Ladekurve mit $e^{-T_s/\tau}$. Daraus folgt Schritt für Schritt:

$$y[n] = y[n-1] + a \cdot \big(x[n] - y[n-1]\big), \qquad a = 1 - e^{-2\pi f_c / f_s}$$

In Worten: **Rücke ein Stück $a$ in Richtung des neuen Eingangswerts.** Das ist alles, eine Zeile Code. Ein kleines $a$ heißt träge, also eine tiefe Grenzfrequenz.

<figure class="dia"><svg viewBox="0 0 360 170" role="img" aria-label="Blockschaltbild des digitalen Tiefpasses: x[n] wird mit a multipliziert und zum verzögerten, mit 1 minus a gewichteten Ausgang addiert. Das Ergebnis ist y[n].">
<defs><marker id="ss-9" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-9m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text x="4" y="52">x[n]</text><path class="s" d="M40 48H78" marker-end="url(#ss-9)"/>
<rect class="b" x="80" y="30" width="56" height="36"/><text class="c" x="108" y="53">· a</text>
<path class="s" d="M136 48H178" marker-end="url(#ss-9)"/>
<circle class="b" cx="194" cy="48" r="15"/><text class="c" x="194" y="53">+</text>
<path class="s" d="M209 48H318" marker-end="url(#ss-9)"/><text x="322" y="52">y[n]</text>
<circle class="f" cx="270" cy="48" r="3"/><path class="s" d="M270 48V108"/>
<rect class="b" x="242" y="108" width="56" height="36"/><text class="c" x="270" y="131">z⁻¹</text>
<path class="s" d="M242 126H222" marker-end="url(#ss-9)"/>
<rect class="b" x="140" y="108" width="80" height="36"/><text class="c" x="180" y="131">· (1−a)</text>
<path class="s" d="M140 126H118V82H194V65" marker-end="url(#ss-9)"/>
<text class="k c" x="270" y="160">1 TAKT SPÄTER</text>
</svg><figcaption>Der digitale Tiefpass: Jeder neue Ausgangswert ist ein Anteil a des Eingangs plus der Rest (1 − a) des letzten Ausgangs. z⁻¹ heißt „ein Abtastwert verzögert“ und spielt die Rolle des Kondensators: Es merkt sich, was war.</figcaption></figure>

```python
from werkzeug import *
import matplotlib.pyplot as plt

def tiefpass(x, fc, fs=FS):
    a = 1 - np.exp(-2 * np.pi * fc / fs)
    y = np.zeros(len(x))
    alt = 0.0
    for n in range(len(x)):
        alt = alt + a * (x[n] - alt)   # y[n] = y[n-1] + a(x[n] - y[n-1])
        y[n] = alt
    return y

rauschen = np.random.default_rng(1).uniform(-0.3, 0.3, 2 * FS)
for fc in (8000, 2000, 500):
    speichern(f"rauschen_{fc}.wav", ausblenden(tiefpass(rauschen, fc)))

# Frequenzgang messen: Impuls hinein, Spektrum der Antwort
impuls = np.zeros(FS)
impuls[0] = 1
H = np.fft.rfft(tiefpass(impuls, 1000))
f = np.fft.rfftfreq(FS, 1 / FS)[1:]
plt.semilogx(f, 20 * np.log10(np.abs(H[1:])), label="digital")
plt.semilogx(f, -10 * np.log10(1 + (f / 1000) ** 2), "--",
             label="RC analog")
plt.axhline(-3, color="gray", lw=0.5)
plt.xlabel("f in Hz")
plt.ylabel("|H| in dB")
plt.legend()
plt.show()
```

Die gemessene Kurve trifft bei 1 kHz genau $-3{,}0\,\mathrm{dB}$ und folgt der analogen bis weit über $f_c$. Erst nahe $f_s/2 = 24\,\mathrm{kHz}$ weicht sie ab: $-23{,}7$ statt $-27{,}6\,\mathrm{dB}$. Der Frequenzgang eines digitalen Filters ist an $f_s/2$ gespiegelt, deshalb kann er dort nicht weiter fallen. Bei den Rauschdateien hörst du, wie das Rauschen mit sinkendem $f_c$ von hellem Zischen zu dumpfem Rauschen wird.

Die Schleife in Python ist langsam, für ein paar Sekunden Klang reicht sie. Schneller rechnet dieselbe Gleichung `scipy.signal.lfilter([a], [1, a - 1], x)` aus dem Paket scipy.

### Den Frequenzgang ausrechnen statt messen

Mit den komplexen Zeigern aus Abschnitt 11 lässt sich $H$ direkt aus der Rechenvorschrift ablesen. Schick einen Zeiger $x[n] = e^{\mathrm{j}\omega n}$ hinein, wobei $\omega = 2\pi f / f_s$ der Winkel pro Abtastwert ist. Weil das Filter linear und zeitinvariant ist, kommt derselbe Zeiger heraus, nur mit einer komplexen Zahl multipliziert: $y[n] = H \cdot e^{\mathrm{j}\omega n}$. Einsetzen und durch $e^{\mathrm{j}\omega n}$ teilen:

$$H = H e^{-\mathrm{j}\omega} + a\left(1 - H e^{-\mathrm{j}\omega}\right) \quad\Rightarrow\quad H(\omega) = \frac{a}{1 - (1 - a)\,e^{-\mathrm{j}\omega}}$$

Eine Verzögerung um einen Abtastwert wird zur Multiplikation mit $e^{-\mathrm{j}\omega}$. Das ist die Idee hinter der z-Transformation, und darum steht im Blockschaltbild $z^{-1}$.

```python
from werkzeug import *

fc = 1000
a = 1 - np.exp(-2 * np.pi * fc / FS)
for f in (100, 1000, 10_000, 24_000):
    w = 2 * np.pi * f / FS             # Winkel pro Abtastwert
    H = a / (1 - (1 - a) * np.exp(-1j * w))
    print(f"{f:6} Hz: {20 * np.log10(abs(H)):6.2f} dB,"
          f" Phase {np.degrees(np.angle(H)):6.1f}°")
```

```ausgabe
   100 Hz:  -0.04 dB, Phase   -5.3°
  1000 Hz:  -3.00 dB, Phase  -41.3°
 10000 Hz: -19.41 dB, Phase  -47.6°
 24000 Hz: -23.69 dB, Phase   -0.0°
```

Die Beträge sind genau die, die das Python-Beispiel oben mit der FFT gemessen hat. Die Phase bei 1 kHz ist $-41{,}3°$ statt $-45°$ wie beim RC-Glied: Das digitale Filter nimmt den neuen Eingangswert schon für den ganzen Schritt an, als käme er einen halben Abtastwert früher, und ein halber Abtastwert sind bei 1 kHz genau $3{,}75°$.

::: info Steilere Filter
Zwei Tiefpässe hintereinander fallen mit $-12\,\mathrm{dB}$ pro Oktave, dann aber schon mit $-6\,\mathrm{dB}$ bei $f_c$. Besser geht es mit einem Filter zweiter Ordnung, dem nächsten Abschnitt. Die Rezepte für alle Formen aus der Tabelle oben stehen im [Audio EQ Cookbook](https://www.w3.org/TR/audio-eq-cookbook/), der Standardquelle dafür.
:::

::: aufgabe Hochpass aus Tiefpass
Ein Hochpass lässt durch, was ein Tiefpass zurückhält. Baue ihn aus der Funktion `tiefpass` und miss seinen Frequenzgang bei 100 Hz, 1 kHz und 10 kHz.
???
Hochpass = Eingang minus Tiefpass:

```python
from werkzeug import *

def tiefpass(x, fc, fs=FS):
    a = 1 - np.exp(-2 * np.pi * fc / fs)
    y = np.zeros(len(x))
    alt = 0.0
    for n in range(len(x)):
        alt += a * (x[n] - alt)
        y[n] = alt
    return y

def hochpass(x, fc):
    return x - tiefpass(x, fc)         # was der Tiefpass nicht durchlässt

impuls = np.zeros(FS)
impuls[0] = 1
H = np.fft.rfft(hochpass(impuls, 1000))
for f in (100, 1000, 10_000):
    print(f"{f:6} Hz: {20 * np.log10(abs(H[f])):6.2f} dB")
```

```ausgabe
   100 Hz: -20.62 dB
  1000 Hz:  -3.58 dB
 10000 Hz:  -0.62 dB
```

Unten fällt er mit 20 dB pro Dekade wie ein CR-Hochpass, oben lässt er fast alles durch. Ganz exakt wie die analoge Vorlage ($-3{,}0$ und $-0{,}04\,\mathrm{dB}$) ist er nicht: $1 - H$ hängt auch von der Phase des Tiefpasses ab, und die weicht digital etwas ab, siehe oben. Für die Ohren ist es trotzdem ein guter Hochpass.
:::

::: tipp Checkpoint
- [ ] Ich kann den Frequenzgang des RC-Tiefpasses aufschreiben und $-3\,\mathrm{dB}$ und $-6\,\mathrm{dB}$ pro Oktave erklären.
- [ ] Ich kann die Zeile $y[n] = y[n-1] + a(x[n] - y[n-1])$ aus der Ladekurve herleiten.
- [ ] Ich kann den Frequenzgang eines digitalen Filters mit $x[n] = e^{\mathrm{j}\omega n}$ ausrechnen.
- [ ] Ich habe Rauschen gefiltert und den Frequenzgang gemessen und berechnet.
:::

## 14. Resonanzfilter: der Biquad

Ein Filter zweiter Ordnung merkt sich die letzten **zwei** Ein- und Ausgangswerte. Seine Rechenvorschrift hat fünf Koeffizienten, darum heißt es nach seinem Frequenzgang aus zwei quadratischen Polynomen **Biquad**:

$$y[n] = \frac{b_0\,x[n] + b_1\,x[n-1] + b_2\,x[n-2] - a_1\,y[n-1] - a_2\,y[n-2]}{a_0}$$

Oberhalb der Grenzfrequenz fällt ein Tiefpass zweiter Ordnung mit $-12\,\mathrm{dB}$ pro Oktave, doppelt so steil wie das RC-Glied. Und er kann etwas Neues: eine [[Resonanz|resonanz]]. Die **Güte** $Q$ bestimmt, wie stark er kurz vor der Grenzfrequenz überhöht. Beim Tiefpass aus dem Audio EQ Cookbook ist die Verstärkung bei $f_c$ genau $Q$:

| $Q$ | bei $f_c$ | Charakter |
|---:|---:|:---|
| $0{,}707$ | $-3\,\mathrm{dB}$ | so flach wie möglich (Butterworth) |
| $2$ | $+6\,\mathrm{dB}$ | deutliche Betonung |
| $8$ | $+18\,\mathrm{dB}$ | pfeifende Resonanz |

Das analoge Gegenstück ist der Reihenschwingkreis aus Widerstand, Spule und Kondensator mit $Q = \frac{1}{R}\sqrt{L/C}$. Synthesizerfilter wie die Moog-Kaskade haben sogar vier Stufen und fallen mit $-24\,\mathrm{dB}$ pro Oktave. Das Drehen an Grenzfrequenz und Resonanz ist der typische Klang der subtraktiven Synthese.

```python
from werkzeug import *
import matplotlib.pyplot as plt

def biquad_tiefpass(x, fc, q, fs=FS):
    """Tiefpass 2. Ordnung nach dem Audio EQ Cookbook."""
    w0 = 2 * np.pi * fc / fs
    alpha = np.sin(w0) / (2 * q)
    b0 = b2 = (1 - np.cos(w0)) / 2
    b1 = 1 - np.cos(w0)
    a0, a1, a2 = 1 + alpha, -2 * np.cos(w0), 1 - alpha
    y = np.zeros(len(x))
    x1 = x2 = y1 = y2 = 0.0            # die letzten zwei Ein- und Ausgänge
    for n in range(len(x)):
        y[n] = (b0 * x[n] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1 = x1, x[n]
        y2, y1 = y1, y[n]
    return y

# Frequenzgang für drei Güten messen
impuls = np.zeros(FS)
impuls[0] = 1
f = np.fft.rfftfreq(FS, 1 / FS)
for q in (0.707, 2, 8):
    H = np.fft.rfft(biquad_tiefpass(impuls, 1000, q))
    print(f"Q = {q}: bei 1 kHz {20 * np.log10(abs(H[1000])):+.1f} dB")
    plt.semilogx(f[1:-1], 20 * np.log10(np.abs(H[1:-1])),  # bei f_s/2 ist H = 0
                 label=f"Q = {q}")
plt.ylim(-40, 25)
plt.legend()
plt.xlabel("f in Hz")
plt.ylabel("|H| in dB")
plt.show()

# Hören: tiefer Sägezahn durch das Filter, immer mehr Resonanz
t = zeit(1.5)
saege = 2 * (110 * t % 1) - 1          # einfacher Sägezahn
for q in (0.707, 4, 12):
    y = biquad_tiefpass(saege, 800, q)
    speichern(f"resonanz_q{q}.wav", ausblenden(0.2 * y / np.max(np.abs(y))))
```

```ausgabe
Q = 0.707: bei 1 kHz -3.0 dB
Q = 2: bei 1 kHz +6.0 dB
Q = 8: bei 1 kHz +18.1 dB
```

Die Messung bestätigt die Tabelle auf ein Zehntel dB, denn $20\log_{10} 8 = 18{,}06$. In den drei WAV-Dateien hörst du, wie der Sägezahn mit wachsendem $Q$ einen pfeifenden Beiklang bei 800 Hz bekommt.

Hier wird ausnahmsweise ein einfacher Sägezahn ohne Rücksicht auf Aliasing benutzt. Bei einem so tiefen Ton stört das kaum: Die stärksten Störtöne liegen fast 50 dB unter dem Grundton, und der Tiefpass dämpft sie zusätzlich.

::: aufgabe Güte in Dezibel
Welche Überhöhung in dB hat der Tiefpass mit $Q = 4$? Und welches $Q$ braucht man für genau $0\,\mathrm{dB}$ bei $f_c$?
???
$20\log_{10} 4 = 12{,}0\,\mathrm{dB}$. Für $0\,\mathrm{dB}$ muss $Q = 1$ sein.
:::

::: tipp Checkpoint
- [ ] Ich kann die Biquad-Gleichung lesen und weiß, welche Werte sich das Filter merkt.
- [ ] Ich kann erklären, was die Güte $Q$ bewirkt, und sie in dB umrechnen.
- [ ] Ich habe die Resonanz gehört und den Frequenzgang für drei Güten gezeichnet.
:::

## 15. Echo und Kammfilter: Zeit als Werkzeug

Filter arbeiten mit winzigen Verzögerungen von einem oder zwei Abtastwerten. Mit großen Verzögerungen entstehen Effekte, die jeder sofort erkennt. Eine Verzögerung um $D$ Abtastwerte ist im Code nur ein Indexzugriff: `y[n - D]`.

### Echo

Ein [[Echo|echo]] mit Rückkopplung schickt einen Teil des Ausgangs verzögert wieder hinein:

$$y[n] = x[n] + g \cdot y[n - D]$$

Jede Wiederholung kommt $D / f_s$ Sekunden später und ist um den Faktor $g$ leiser. Mit $g = 0{,}5$ verliert jedes Echo 6 dB. Für $g \ge 1$ würde es immer lauter, darum muss $g < 1$ bleiben.

```python
from werkzeug import *

t = zeit(0.4)
pling = 0.5 * np.sin(2 * np.pi * 660 * t) * np.exp(-t / 0.06)
pling = ausblenden(pling, ms=1)

def echo(x, verzoegerung, g):
    d = int(verzoegerung * FS)
    y = np.concatenate([x, np.zeros(3 * FS)])  # Platz zum Ausklingen
    for n in range(d, len(y)):
        y[n] += g * y[n - d]           # y[n] = x[n] + g·y[n-d]
    return y

speichern("echo.wav", echo(pling, 0.3, 0.5))
```

Die Spitzen der Wiederholungen messen 0,49, dann 0,25, 0,12, 0,06 und 0,03: jede halb so groß wie die vorige.

### Kammfilter: wenn das Echo zu kurz ist

Unter etwa 30 ms hört man die Wiederholung nicht mehr als eigenes Echo, sie färbt stattdessen den Klang. Bei einer Verzögerung $\tau$ ohne Rückkopplung, $y(t) = x(t) + x(t - \tau)$, kommen Original und Kopie bei manchen Frequenzen im Gegentakt an und löschen sich aus, nämlich bei

$$f = \frac{1}{2\tau}, \; \frac{3}{2\tau}, \; \frac{5}{2\tau}, \; \dots$$

Mit den Zeigern aus Abschnitt 11 sieht man es sofort: Die Verzögerung dreht die Kopie um den Winkel $2\pi f \tau$, und der Frequenzgang ist $H(f) = 1 + e^{-\mathrm{j}2\pi f\tau}$. Er wird null, wo der Winkel ein ungerades Vielfaches von 180° ist, und erreicht 2, also $+6\,\mathrm{dB}$, wo beide im Gleichtakt sind.

Bei $\tau = 1\,\mathrm{ms}$ fehlen also 500 Hz, 1500 Hz, 2500 Hz und so weiter. Das Spektrum sieht aus wie ein Kamm, daher der Name. Genau das passiert mit einem Mikrofon, das den Schall direkt und mit 34 cm Umweg über eine Tischplatte hört, denn $34\,\mathrm{cm} / (343\,\mathrm{m/s}) \approx 1\,\mathrm{ms}$. Ein **Flanger** ist ein Kammfilter, dessen $\tau$ langsam wandert.

### Hall

Ein Raum liefert nicht ein Echo, sondern Tausende: von jeder Wand und von dort zur nächsten, immer dichter und immer leiser. Das ist [[Hall|hall]]. Die wichtigste Zahl dafür ist die **Nachhallzeit** $T_{60}$, die Zeit, bis der Pegel um 60 dB gefallen ist. Ein Wohnzimmer liegt bei etwa einer halben Sekunde, ein Konzertsaal bei etwa zwei, eine große Kirche bei mehreren Sekunden. Wie man den Hall eines Raums nachbaut, zeigt der nächste Abschnitt.

::: aufgabe Kammfilter
Eine Kopie kommt 0,5 ms zu spät. Welche Frequenzen fehlen? Wie viel Umweg hat der Schall dabei genommen?
???
Es fehlen $1/(2 \cdot 0{,}5\,\mathrm{ms}) = 1\,\mathrm{kHz}$, dann 3 kHz, 5 kHz und so weiter. Der Umweg ist $343\,\mathrm{m/s} \cdot 0{,}5\,\mathrm{ms} = 17\,\mathrm{cm}$.
:::

::: tipp Checkpoint
- [ ] Ich kann die Echo-Gleichung erklären und weiß, warum $g < 1$ sein muss.
- [ ] Ich kann die Auslöschungsfrequenzen eines Kammfilters ausrechnen und mit $H(f) = 1 + e^{-\mathrm{j}2\pi f\tau}$ begründen.
- [ ] Ich weiß, was $T_{60}$ bedeutet.
:::

## 16. Faltung: die Impulsantwort sagt alles

Jetzt kommt der Gedanke, der alle linearen Systeme auf einmal beschreibt. Schick einen einzigen Impuls hinein, eine 1 gefolgt von lauter Nullen, und schau, was herauskommt. Diese Antwort heißt **Impulsantwort** $h[n]$. Beim Tiefpass aus Abschnitt 13 ist sie $h[n] = a(1 - a)^n$, ein Wert, der mit jedem Schritt um den Faktor $1 - a$ kleiner wird.

Das Erstaunliche: Wer $h[n]$ kennt, kennt das ganze System. Jedes Eingangssignal ist eine Folge von Impulsen mit verschiedenen Höhen. Weil das System linear ist, antwortet es auf jeden mit einer entsprechend hohen Kopie von $h$. Weil es zeitinvariant ist, beginnt jede Kopie dort, wo ihr Impuls war. Der Ausgang ist die Summe aller Kopien, die **Faltung**:

$$y[n] = \sum_{k} x[k] \cdot h[n - k] = (x * h)[n]$$

<figure class="dia"><svg viewBox="0 0 360 300" role="img" aria-label="Oben drei Impulse unterschiedlicher Höhe. In der Mitte startet jeder Impuls eine eigene, entsprechend skalierte Kopie der Impulsantwort. Unten die Summe aller Kopien, das Ausgangssignal.">
<path class="m" d="M40 52H346"/>
<path class="m" d="M40 150H346"/>
<path class="m" d="M40 256H346"/>
<path class="m" d="M60.0 52V20.0"/><circle class="a" cx="60.0" cy="20.0" r="3.5"/>
<path class="m" d="M110.0 52V71.2"/><circle class="a" cx="110.0" cy="71.2" r="3.5"/>
<path class="m" d="M170.0 52V26.4"/><circle class="a" cx="170.0" cy="26.4" r="3.5"/>
<text class="k" x="40" y="14">EINGANG x[n]: DREI IMPULSE</text>
<path class="m" d="M60.0 150L60.0 110.0 L70.0 122.0 L80.0 130.4 L90.0 136.3 L100.0 140.4 L110.0 143.3 L120.0 145.3 L130.0 146.7 L140.0 147.7 L150.0 148.4 L160.0 148.9 L170.0 149.2 L180.0 149.4 L190.0 149.6 L200.0 149.7 L210.0 149.8 L220.0 149.9 L230.0 149.9 L240.0 149.9 L250.0 150.0 L260.0 150.0 L270.0 150.0 L280.0 150.0 L290.0 150.0 L300.0 150.0 L310.0 150.0 L320.0 150.0 L330.0 150.0" style="stroke-width:1.4"/>
<path class="m d" d="M110.0 150L110.0 174.0 L120.0 166.8 L130.0 161.8 L140.0 158.2 L150.0 155.8 L160.0 154.0 L170.0 152.8 L180.0 152.0 L190.0 151.4 L200.0 151.0 L210.0 150.7 L220.0 150.5 L230.0 150.3 L240.0 150.2 L250.0 150.2 L260.0 150.1 L270.0 150.1 L280.0 150.1 L290.0 150.0 L300.0 150.0 L310.0 150.0 L320.0 150.0 L330.0 150.0" style="stroke-width:1.4"/>
<path class="m" d="M170.0 150L170.0 118.0 L180.0 127.6 L190.0 134.3 L200.0 139.0 L210.0 142.3 L220.0 144.6 L230.0 146.2 L240.0 147.4 L250.0 148.2 L260.0 148.7 L270.0 149.1 L280.0 149.4 L290.0 149.6 L300.0 149.7 L310.0 149.8 L320.0 149.8 L330.0 149.9" style="stroke-width:1.4"/>
<text class="k" x="40" y="98">JEDER IMPULS STARTET EINE KOPIE VON h[n]</text>
<path class="s" d="M40.0 256.0 L50.0 256.0 L60.0 216.0 L70.0 228.0 L80.0 236.4 L90.0 242.3 L100.0 246.4 L110.0 273.3 L120.0 268.1 L130.0 264.5 L140.0 261.9 L150.0 260.1 L160.0 258.9 L170.0 226.0 L180.0 235.0 L190.0 241.3 L200.0 245.7 L210.0 248.8 L220.0 251.0 L230.0 252.5 L240.0 253.5 L250.0 254.3 L260.0 254.8 L270.0 255.2 L280.0 255.4 L290.0 255.6 L300.0 255.7 L310.0 255.8 L320.0 255.9 L330.0 255.9" style="stroke-width:2"/>
<circle class="f" cx="40.0" cy="256.0" r="1.8"/>
<circle class="f" cx="50.0" cy="256.0" r="1.8"/>
<circle class="f" cx="60.0" cy="216.0" r="1.8"/>
<circle class="f" cx="70.0" cy="228.0" r="1.8"/>
<circle class="f" cx="80.0" cy="236.4" r="1.8"/>
<circle class="f" cx="90.0" cy="242.3" r="1.8"/>
<circle class="f" cx="100.0" cy="246.4" r="1.8"/>
<circle class="f" cx="110.0" cy="273.3" r="1.8"/>
<circle class="f" cx="120.0" cy="268.1" r="1.8"/>
<circle class="f" cx="130.0" cy="264.5" r="1.8"/>
<circle class="f" cx="140.0" cy="261.9" r="1.8"/>
<circle class="f" cx="150.0" cy="260.1" r="1.8"/>
<circle class="f" cx="160.0" cy="258.9" r="1.8"/>
<circle class="f" cx="170.0" cy="226.0" r="1.8"/>
<circle class="f" cx="180.0" cy="235.0" r="1.8"/>
<circle class="f" cx="190.0" cy="241.3" r="1.8"/>
<circle class="f" cx="200.0" cy="245.7" r="1.8"/>
<circle class="f" cx="210.0" cy="248.8" r="1.8"/>
<circle class="f" cx="220.0" cy="251.0" r="1.8"/>
<circle class="f" cx="230.0" cy="252.5" r="1.8"/>
<circle class="f" cx="240.0" cy="253.5" r="1.8"/>
<circle class="f" cx="250.0" cy="254.3" r="1.8"/>
<circle class="f" cx="260.0" cy="254.8" r="1.8"/>
<circle class="f" cx="270.0" cy="255.2" r="1.8"/>
<circle class="f" cx="280.0" cy="255.4" r="1.8"/>
<circle class="f" cx="290.0" cy="255.6" r="1.8"/>
<circle class="f" cx="300.0" cy="255.7" r="1.8"/>
<circle class="f" cx="310.0" cy="255.8" r="1.8"/>
<circle class="f" cx="320.0" cy="255.9" r="1.8"/>
<circle class="f" cx="330.0" cy="255.9" r="1.8"/>
<text class="k" x="40" y="204">AUSGANG y[n] = SUMME DER KOPIEN</text>
<text class="k" x="344" y="47">n</text>
<text class="k" x="344" y="145">n</text>
<text class="k" x="344" y="251">n</text>
</svg><figcaption>Faltung: Jeder Eingangswert startet eine Kopie der Impulsantwort h[n], verschoben an seine Stelle und mit seiner Höhe multipliziert. Der Ausgang ist die Summe aller Kopien.</figcaption></figure>

```python
from werkzeug import *

# Impulsantwort des Tiefpasses aus Abschnitt 13 (fc = 1 kHz)
a = 1 - np.exp(-2 * np.pi * 1000 / FS)
h = a * (1 - a) ** np.arange(2000)      # Antwort auf einen einzelnen Impuls

# Faltung: jeder Eingangswert startet eine skalierte Kopie von h
x = np.random.default_rng(3).uniform(-1, 1, 5000)
y_faltung = np.convolve(x, h)[:len(x)]

# Zum Vergleich dieselbe Rechnung als Filter-Schleife
y_filter = np.zeros(len(x))
alt = 0.0
for n in range(len(x)):
    alt += a * (x[n] - alt)
    y_filter[n] = alt
print("größter Unterschied:", np.max(np.abs(y_faltung - y_filter)))
```

```ausgabe
größter Unterschied: 1.6653345369377348e-16
```

Faltung und Filter-Schleife liefern dasselbe, bis auf Rundungsfehler in der 16. Stelle. Das Filter aus Abschnitt 13 *ist* also eine Faltung mit seiner Impulsantwort.

### Der Faltungssatz

Eine Faltung ist teuer: Jeder Ausgangswert ist eine Summe über die ganze Impulsantwort. Für 3,6 s Klang und 1,8 s Hall wären das rund 15 Milliarden Multiplikationen. Hier hilft die wohl nützlichste Tatsache der Signalverarbeitung:

::: merke Faltungssatz
Eine Faltung im Zeitbereich ist eine Multiplikation im Frequenzbereich: $Y(f) = X(f) \cdot H(f)$. Der Frequenzgang ist die Fourier-Transformation der Impulsantwort.
:::

Genau so hast du in Abschnitt 13 den Frequenzgang gemessen: Impuls hinein, FFT der Antwort. Und so faltet man schnell: beide Signale per FFT in den Frequenzbereich, multiplizieren, zurück. Eine Falle gibt es dabei: Die FFT behandelt Signale, als würden sie sich periodisch wiederholen. Damit das Ende der Faltung nicht vorne wieder hereinläuft, füllt man beide mit Nullen auf die volle Länge $N_x + N_h - 1$ auf.

### Faltungshall

Nimm in einem Raum die Antwort auf einen Knall auf, zum Beispiel einen platzenden Luftballon oder ein lautes Klatschen in einem Treppenhaus. Das ist die Impulsantwort des Raums. Faltest du irgendeine trockene Aufnahme damit, klingt sie, als wäre sie in diesem Raum gespielt worden. Das ist **Faltungshall**. Hier wird die Impulsantwort künstlich gebaut: Rauschen, das in $T_{60}$ um 60 dB leiser wird, also um den Faktor 1000 in der Amplitude.

```python
from werkzeug import *

def ton(f, dauer):                     # kurzer, gezupfter Ton
    t = zeit(dauer)
    return ausblenden(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.15), ms=5)

trocken = np.concatenate([ton(f, 0.4) for f in (262, 330, 392, 523)])
trocken = np.concatenate([trocken, np.zeros(2 * FS)])  # Platz für den Hall

# Künstliche Impulsantwort: Rauschen, das in T60 um 60 dB leiser wird
T60 = 1.8
t = zeit(T60)
h = np.random.default_rng(0).normal(0, 1, len(t)) * 10 ** (-3 * t / T60)

# Falten über die FFT: im Frequenzbereich nur Multiplizieren
N = len(trocken) + len(h) - 1
hall = np.fft.irfft(np.fft.rfft(trocken, N) * np.fft.rfft(h, N), N)
hall /= np.max(np.abs(hall))
mix = np.concatenate([trocken, np.zeros(len(hall) - len(trocken))])
mix = mix + 0.5 * hall                 # trocken plus 50 % Hall
speichern("trocken.wav", 0.4 * trocken)
speichern("hall.wav", ausblenden(0.4 * mix / np.max(np.abs(mix))))
```

Echte Räume schlucken hohe Frequenzen schneller als tiefe, darum klingt dieser künstliche Hall etwas zischelig. Mit einer selbst aufgenommenen Impulsantwort, geladen mit `laden`, klingt es echt.

::: aufgabe Faltung in Zahlen
1. Ein Signal hat 1000 Werte, eine Impulsantwort 300. Wie lang ist das Ergebnis der Faltung?
2. In welcher Zeit fällt die künstliche Impulsantwort um 20 dB?
???
1. $1000 + 300 - 1 = 1299$ Werte.
2. Die Amplitude ist $10^{-3t/T_{60}}$, das sind $-60\,t/T_{60}$ dB. 20 dB nach einem Drittel von $T_{60}$, hier nach 0,6 s.
:::

::: tipp Checkpoint
- [ ] Ich kann erklären, was eine Impulsantwort ist und warum sie ein LTI-System vollständig beschreibt.
- [ ] Ich kann die Faltungssumme hinschreiben und an drei Impulsen von Hand ausführen.
- [ ] Ich kenne den Faltungssatz und weiß, warum man beim Falten per FFT Nullen anhängt.
- [ ] Ich habe den Faltungshall gehört und $T_{60}$ verändert.
:::

<div class="teil"><span>Teil V · etwa 3 bis 5 Stunden</span><strong>Projekte</strong><p>Drei kleine Programme, die fast alles aus dieser Notiz verbinden: eine Saite aus Rauschen, ein Stimmgerät für eigene Aufnahmen und ein Synthesizer mit Hüllkurve, Resonanzfilter und Echo.</p></div>

## 17. Projekt: Gitarrensaite aus Rauschen

Kevin Karplus und Alex Strong haben 1983 einen Algorithmus veröffentlicht, der mit wenigen Zeilen eine gezupfte Saite erzeugt und verblüffend echt klingt.

Die Idee: Eine gezupfte Saite ist eine Welle, die zwischen den beiden Enden hin- und herläuft. Ein Hin- und Rückweg dauert genau eine Periode $1/f_0$. Das bildet man nach mit

1. **einem Rauschstoß** als Anfang: Das Zupfen regt alle Frequenzen auf einmal an,
2. **einer Verzögerung** um $D$ Abtastwerte: Alles kommt nach einer Periode wieder, und ein periodisches Signal besteht aus Grundton und Obertönen (Abschnitt 6),
3. **dem Mittelwert zweier Nachbarwerte** bei jedem Umlauf: ein sanfter Tiefpass (Abschnitt 13), der die hohen Obertöne schneller abklingen lässt als die tiefen. Genau das passiert auch in einer echten Saite.

<figure class="dia"><svg viewBox="0 0 360 192" role="img" aria-label="Karplus-Strong: Ein kurzer Rauschstoß läuft in eine Schleife aus Verzögerung um D Abtastwerte, Mittelwert zweier Nachbarn und Dämpfung. Der Ausgang wird aus der Schleife abgegriffen.">
<defs><marker id="ss-10" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="f"/></marker><marker id="ss-10m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="fm"/></marker></defs>
<text class="k" x="2" y="40">RAUSCHSTOSS</text><text class="k" x="2" y="54">(NUR AM ANFANG)</text><path class="s" d="M60 64V92H96" marker-end="url(#ss-10)"/>
<circle class="b" cx="112" cy="92" r="15"/><text class="c" x="112" y="97">+</text>
<path class="s" d="M127 92H160" marker-end="url(#ss-10)"/>
<rect class="b" x="162" y="72" width="96" height="40"/><text class="c" x="210" y="91">z<tspan dy="-6" font-size="9">−D</tspan></text><text class="k c" x="210" y="105">D WERTE WARTEN</text>
<path class="s" d="M258 92H322" marker-end="url(#ss-10)"/><text x="326" y="96">y</text><circle class="f" cx="290" cy="92" r="3"/>
<path class="s" d="M290 92V144H266" marker-end="url(#ss-10)"/>
<rect class="b" x="150" y="122" width="114" height="44"/><text class="c" x="207" y="141">Mitteln</text><text class="k c" x="207" y="157">ZWEI NACHBARN · g</text>
<path class="s" d="M150 144H112V109" marker-end="url(#ss-10)"/>
<text class="k c" x="207" y="184">= SANFTER TIEFPASS</text>
</svg><figcaption>Karplus-Strong: Ein Rauschstoß kreist in einer Verzögerungsschleife. Weil er sich alle D Abtastwerte wiederholt, entsteht ein Ton mit f<sub>0</sub> ≈ f<sub>s</sub>/(D + ½). Das Mitteln dämpft die Höhen bei jedem Umlauf ein bisschen mehr, genau wie bei einer echten Saite.</figcaption></figure>

$$y[n] = g \cdot \frac{y[n - D] + y[n - D - 1]}{2}$$

Das Mitteln verzögert im Schnitt um einen halben Abtastwert zusätzlich. Die Periode ist deshalb $D + \tfrac{1}{2}$ Abtastwerte lang, und

$$f_0 = \frac{f_s}{D + \tfrac{1}{2}}$$

```python
from werkzeug import *

def saite(f0, dauer, verlust=0.996, seed=0):
    D = round(FS / f0 - 0.5)           # Verzögerung in Abtastwerten
    y = np.zeros(int(dauer * FS))
    zufall = np.random.default_rng(seed)
    y[:D + 1] = zufall.uniform(-1, 1, D + 1)   # Zupfen = Rauschstoß
    for n in range(D + 1, len(y)):
        y[n] = verlust * 0.5 * (y[n - D] + y[n - D - 1])
    return y

speichern("saite_a.wav", ausblenden(0.4 * saite(110, 2.0)))

# E-Dur wie auf der Gitarre: sechs Saiten, 30 ms versetzt
akkord = [82.41, 123.47, 164.81, 207.65, 246.94, 329.63]
x = np.zeros(3 * FS)
for i, f in enumerate(akkord):
    start = int(i * 0.03 * FS)
    x[start:] += saite(f, 3.0, seed=i)[:len(x) - start]
speichern("gitarre.wav", ausblenden(0.8 * x / np.max(np.abs(x))))
```

Für $f_0 = 110\,\mathrm{Hz}$ ist $D = 436$, die Formel sagt $48\,000 / 436{,}5 \approx 109{,}97\,\mathrm{Hz}$, und eine FFT der Datei zeigt 109,94 Hz. Was du hörst: ein heller Anschlag, der schnell weicher wird und ausklingt, wie eine Gitarre oder ein Cembalo. Und alles aus Zufallszahlen. Mit `verlust=0.999` klingt die Saite länger nach, mit `0.98` wird sie gedämpft wie mit der Handkante. Ein Spektrogramm (Abschnitt 12) zeigt, wie die hohen Obertöne zuerst verschwinden.

::: info Feinstimmung
$D$ muss eine ganze Zahl sein. Bei tiefen Tönen ist das egal, bei hohen verstimmt das Runden hörbar: Für 1000 Hz wäre $D = 48$ und $f_0 = 48\,000 / 48{,}5 \approx 989{,}7\,\mathrm{Hz}$, 18 Cent zu tief. Gute Umsetzungen schieben deshalb noch eine Verzögerung um einen Bruchteil eines Abtastwerts ein.
:::

::: aufgabe Weiterbauen
1. Spiel den Akkord als Abschlag von der hohen zur tiefen Saite.
2. Zupf eine Melodie mit `saite`, indem du die Töne hintereinanderhängst.
3. Prüf die Stimmung der Saiten mit dem Stimmgerät aus dem nächsten Abschnitt.
???
1. Die Liste umdrehen: `for i, f in enumerate(reversed(akkord)):` und sonst alles gleich lassen.
2. Zum Beispiel mit den MIDI-Nummern aus Abschnitt 3: `np.concatenate([saite(440 * 2 ** ((n - 69) / 12), 0.4) for n in (57, 60, 64, 69)])`.
3. Mit beiden Funktionen in einer Datei liefert `grundton(saite(110, 1.0)[FS // 4:FS // 4 + FS // 5])` etwa 109,97 Hz: ein A2, ein halbes Cent zu tief, genau wie die Formel $48\,000/436{,}5$ sagt.
:::

## 18. Projekt: Stimmgerät

Ein Stimmgerät misst die Grundfrequenz eines Tons. Die naheliegende Idee, die höchste Spitze im Spektrum zu suchen, klappt schlecht. Bei vielen Klängen ist ein Oberton lauter als der Grundton, und bei einer Telefonstimme fehlt der Grundton sogar ganz, man hört die Tonhöhe trotzdem. Außerdem ist die Auflösung zu grob: 0,2 s Signal ergeben 5 Hz Raster, ein Cent bei 110 Hz sind aber nur 0,06 Hz.

Besser ist die **Autokorrelation**: Man vergleicht das Signal mit einer um $k$ Werte verschobenen Kopie von sich selbst,

$$r[k] = \sum_n x[n] \cdot x[n + k]$$

Bei einem periodischen Signal passt die Kopie am besten, wenn sie um genau eine Periode verschoben ist, dann ist $r[k]$ am größten. Die Periode ist also die Verschiebung $k$ mit dem größten $r[k]$ (ohne $k = 0$), und $f_0 = f_s / k$. Damit das schnell geht, nutzt man wieder die FFT: Die Autokorrelation ist die inverse FFT von $\lvert X \rvert^2$, auch hier mit Nullen aufgefüllt. Und damit $k$ keine ganze Zahl sein muss, legt man eine Parabel durch das Maximum und seine zwei Nachbarn.

```python
from werkzeug import *

NOTEN = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "H"]

def grundton(x, fs=FS, fmin=50, fmax=1000):
    """Grundfrequenz über die Autokorrelation finden."""
    x = x - np.mean(x)
    X = np.fft.rfft(x, 2 * len(x))     # mit Nullen, sonst läuft es im Kreis
    r = np.fft.irfft(np.abs(X) ** 2)[:len(x)]   # Autokorrelation
    lo, hi = int(fs / fmax), int(fs / fmin)
    k = lo + np.argmax(r[lo:hi])       # bester Versatz in Abtastwerten
    a, b, c = r[k - 1], r[k], r[k + 1]  # Parabel durch drei Punkte
    k = k + 0.5 * (a - c) / (a - 2 * b + c)
    return fs / k

def notenname(f):
    m = 69 + 12 * np.log2(f / 440)     # MIDI-Nummer mit Nachkommastellen
    n = int(round(m))
    cent = round(100 * (m - n))
    return f"{NOTEN[n % 12]}{n // 12 - 1} {cent:+d} Cent"

# Test mit Tönen, deren Frequenz wir kennen
t = zeit(0.2)
for f in (82.41, 110.0, 196.0, 440.0, 659.3):
    ton = sum(np.sin(2 * np.pi * k * f * t) / k for k in range(1, 20))
    g = grundton(ton)
    print(f"{f:7.2f} Hz → {g:7.2f} Hz  {notenname(g)}")

# Eigene Aufnahme: 0,2 s aus der Mitte nehmen
# x, fs = laden("mein_ton.wav")
# if x.ndim == 2:
#     x = x.mean(axis=1)               # Stereo → Mono
# m = len(x) // 2
# print(notenname(grundton(x[m:m + fs // 5], fs)))
```

```ausgabe
  82.41 Hz →   82.41 Hz  E2 +0 Cent
 110.00 Hz →  110.00 Hz  A2 +0 Cent
 196.00 Hz →  196.01 Hz  G3 +0 Cent
 440.00 Hz →  440.01 Hz  A4 +0 Cent
 659.30 Hz →  659.19 Hz  E5 +0 Cent
```

Auf weniger als einen Cent genau. Nimm nun ein Instrument oder deine Stimme auf (Abschnitt 10), entferne die Rauten in den letzten Zeilen und miss nach. Echte Stimmgeräte nutzen verfeinerte Verfahren, etwa den YIN-Algorithmus, die seltener eine Oktave danebenliegen. Das Prinzip ist dasselbe.

::: aufgabe Stimmgerät testen
1. Was liefert `grundton` für ein Signal, das nur aus dem zweiten und dritten Teilton von 110 Hz besteht, also 220 und 330 Hz ohne den Grundton?
2. Wozu dient `fmax`? Was passiert ohne diese Grenze?
???
1. Etwa 110 Hz. Die Summe aus 220 und 330 Hz wiederholt sich alle $1/110\,\mathrm{s}$, und genau das findet die Autokorrelation. So hört auch das Ohr den fehlenden Grundton.
2. `fmax` legt die kleinste Verschiebung fest, `lo = fs / fmax`. Bei $k = 0$ vergleicht man das Signal mit sich selbst, das passt immer perfekt, und auch sehr kleine $k$ passen fast perfekt. Ohne die Grenze fände die Suche diese nutzlose Lösung, und $f_s / k$ wäre unendlich oder riesig.
:::

## 19. Projekt: Mini-Synthesizer

Zum Schluss alles zusammen: ein kleiner subtraktiver Synthesizer, wie es ihn als Gerät seit den 1970er-Jahren gibt. Ein obertonreicher **Oszillator** (Sägezahn ohne Aliasing, Abschnitt 6) wird mit einer **Hüllkurve** geformt (Abschnitt 7), durch ein **Resonanzfilter** geschickt (Abschnitt 14) und bekommt ein **Echo** (Abschnitt 15). Die Melodie ist ein Bass-Arpeggio in a-Moll mit 120 Schlägen pro Minute.

```python
from werkzeug import *

def saege(f, dauer):
    """Sägezahn aus Teiltönen bis f_s/2, also ohne Aliasing."""
    t = zeit(dauer)
    x = np.zeros_like(t)
    for n in range(1, int(FS / 2 / f) + 1):
        x += (-1) ** (n + 1) * np.sin(2 * np.pi * n * f * t) / n
    return 2 / np.pi * x

def adsr(gedrueckt, a=0.005, d=0.12, s=0.5, r=0.15):
    na, nd = round(a * FS), round(d * FS)
    nh = max(round(gedrueckt * FS) - na - nd, 0)
    return np.concatenate([np.linspace(0, 1, na, endpoint=False),
                           np.linspace(1, s, nd, endpoint=False),
                           np.full(nh, s),
                           np.linspace(s, 0, round(r * FS))])

def biquad_tiefpass(x, fc, q):
    w0 = 2 * np.pi * fc / FS
    alpha = np.sin(w0) / (2 * q)
    b0 = b2 = (1 - np.cos(w0)) / 2
    b1 = 1 - np.cos(w0)
    a0, a1, a2 = 1 + alpha, -2 * np.cos(w0), 1 - alpha
    y = np.zeros(len(x))
    x1 = x2 = y1 = y2 = 0.0
    for n in range(len(x)):
        y[n] = (b0 * x[n] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1 = x1, x[n]
        y2, y1 = y1, y[n]
    return y

def echo(x, verzoegerung, g):
    d = round(verzoegerung * FS)
    y = np.concatenate([x, np.zeros(2 * FS)])
    for n in range(d, len(y)):
        y[n] += g * y[n - d]
    return y

# Ein Bass-Arpeggio in a-Moll: MIDI-Noten, jede eine Achtel lang
takt1 = [45, 57, 45, 55, 45, 52, 55, 57]
takt2 = [43, 55, 43, 53, 43, 50, 53, 55]
noten = (takt1 + takt2) * 2
achtel = 60 / 120 / 2                  # 120 Schläge pro Minute

spur = np.zeros(round((len(noten) + 2) * achtel * FS))
for i, note in enumerate(noten):
    f = 440 * 2 ** ((note - 69) / 12)
    h = adsr(0.8 * achtel)             # Taste 80 % der Achtel gedrückt
    ton = saege(f, len(h) / FS) * h
    start = round(i * achtel * FS)
    spur[start:start + len(ton)] += ton

spur = biquad_tiefpass(spur, 900, 4)   # Resonanzfilter
spur = echo(spur, 3 * achtel / 2, 0.35)  # punktierte Achtel als Echo
speichern("synth.wav", ausblenden(0.8 * spur / np.max(np.abs(spur))))
```

Das Programm rechnet ein paar Sekunden und schreibt gut zehn Sekunden Musik. Jede Zeile darin kennst du jetzt.

::: aufgabe Eigener Sound
1. Mach den Klang dunkler und weicher, dann heller und schärfer. Welche zwei Zahlen musst du dafür ändern?
2. Mach aus dem kurzen Zupfen einen langsam einschwellenden Flächenklang.
3. Füge eine zweite, um 7 Cent verstimmte Stimme hinzu. Was hörst du und warum?
???
1. Grenzfrequenz und Güte im Aufruf `biquad_tiefpass(spur, 900, 4)`: zum Beispiel `500, 1` für dunkel und weich, `2500, 6` für hell und scharf.
2. Längerer Attack und hoher Sustain, etwa `adsr(0.8 * achtel, a=0.08, d=0.1, s=0.9, r=0.3)`. Bei langen Release-Zeiten überlappen sich die Noten, das ist gewollt.
3. Zum Beispiel mit `d = len(h) / FS` und `ton = (saege(f, d) + saege(f * 2 ** (7 / 1200), d)) / 2 * h`. Die beiden Stimmen schweben gegeneinander (Abschnitt 5), bei 110 Hz etwa 0,4-mal pro Sekunde, der Klang wird breiter und lebendiger. So entstehen Chorus und „Supersaw“.
:::

::: aufgabe Drumcomputer
Programmiere einen Beat aus Bassdrum, Snare und Hi-Hat, nur mit Sinus, Rauschen und Hüllkurven. Tipp: Eine Bassdrum ist ein Sinus, dessen Tonhöhe in wenigen Millisekunden fällt, eine Snare ist Rauschen plus ein kurzer Ton, eine Hi-Hat ist sehr kurzes, helles Rauschen.
???
Eine mögliche Lösung mit einem Muster aus 16 Sechzehnteln:

```python
from werkzeug import *

def kick(dauer=0.4):
    t = zeit(dauer)
    f = 50 + 100 * np.exp(-t / 0.03)   # Tonhöhe fällt von 150 auf 50 Hz
    phase = 2 * np.pi * np.cumsum(f) / FS   # Phase aufsummieren!
    return np.sin(phase) * np.exp(-t / 0.15)

def snare(dauer=0.25):
    t = zeit(dauer)
    rauschen = np.random.default_rng(1).uniform(-1, 1, len(t))
    ton = np.sin(2 * np.pi * 190 * t)
    return (0.6 * rauschen + 0.4 * ton) * np.exp(-t / 0.06)

def hihat(dauer=0.08):
    t = zeit(dauer)
    rauschen = np.random.default_rng(2).uniform(-1, 1, len(t))
    hell = np.diff(rauschen, prepend=0)    # Differenz = einfacher Hochpass
    return 0.5 * hell * np.exp(-t / 0.02)

muster = {"kick":  "x...x...x...x...",
          "snare": "....x.......x...",
          "hihat": "x.x.x.x.x.x.x.x."}
klang = {"kick": kick(), "snare": snare(), "hihat": hihat()}

schritt = round(60 / 100 / 4 * FS)    # Sechzehntel bei 100 BPM
takt = np.zeros(16 * schritt + FS)
for name, zeile in muster.items():
    for i, zeichen in enumerate(zeile):
        if zeichen == "x":
            k = klang[name]
            takt[i * schritt:i * schritt + len(k)] += k

beat = np.tile(takt[:16 * schritt], 4)  # vier Takte
speichern("beat.wav", ausblenden(0.5 * beat / np.max(np.abs(beat))))
```

Die Phase der Bassdrum wird aufsummiert, weil sich ihre Frequenz ändert (Abschnitt 7). `np.diff` ist ein einfacher Hochpass: Die Differenz benachbarter Werte ist bei langsamen Änderungen klein und bei schnellen groß.
:::

## Typische Fehler

::: achtung Daran scheitern fast alle am Anfang
1. **$2\pi$ vergessen:** `np.sin(440 * t)` ergibt etwa 70 Hz statt 440 Hz.
2. **Über $\pm 1$ hinaus:** Werte über 1 werden beim Speichern abgeschnitten und klingen verzerrt. Ohne `np.clip` wie in `speichern` kann es noch schlimmer kommen: Beim Umwandeln in 16-Bit-Ganzzahlen laufen sie je nach System über und springen ans andere Ende des Bereichs. Das knallt.
3. **Knacksen an Anfang und Ende:** Jeder Sprung im Signal enthält alle Frequenzen. Immer ein- und ausblenden.
4. **Naive Rechtecke und Sägezähne:** `np.sign(np.sin(...))` hat unendlich viele Obertöne, auch über $f_s/2$, und die falten sich zurück. Bei tiefen Tönen fällt es kaum auf, bei hohen pfeift es unharmonisch: Ein naives 3,1-kHz-Rechteck hat bei 48 kHz einen Störton bei 13,9 kHz, nur 21 dB unter dem Grundton. Besser: Teiltöne nur bis $f_s/2$ addieren wie in Abschnitt 6.
5. **10 log statt 20 log:** Amplituden (Spannung, Druck, Abtastwerte) immer mit 20, Leistungen mit 10.
6. **Veränderliche Frequenz mit $\sin(2\pi f(t)\, t)$:** Bei Sweep, Vibrato oder Bassdrum muss die Phase aufintegriert oder aufsummiert werden, sonst stimmt die Frequenz nicht (Abschnitte 7 und 8).
7. **Spektrum falsch gelesen:** Die Frequenz von $X[k]$ ist $k \cdot f_s/N$, nicht $k$. Ohne Fenster zerlaufen Spitzen, und ohne den Faktor $2/N$ (oder $2/\textstyle\sum w$) stimmen die Amplituden nicht.
8. **Rückkopplung $g \ge 1$:** Echo und Saite werden dann immer lauter, bis alles nur noch abgeschnitten wird.
9. **Faltung per FFT ohne Nullen:** Ohne Auffüllen auf $N_x + N_h - 1$ läuft das Ende der Faltung vorne wieder herein.
10. **Stereo verdreht:** `speichern` erwartet zwei **Spalten**, also die Form `(n, 2)`. Ein Array der Form `(2, n)` erst mit `.T` umdrehen.
:::

## Formelsammlung

**Schwingungen und Hören**

- **Sinus:** $x(t) = A\sin(2\pi f t + \varphi)$, $\omega = 2\pi f$, $T = 1/f$
- **Wellenlänge:** $\lambda = c/f$, $c \approx 343\,\mathrm{m/s}$
- **Tonhöhe:** $f(n) = 440\,\mathrm{Hz} \cdot 2^{(n-69)/12}$, Cent $= 1200\log_2(f_2/f_1)$
- **Pegel:** $L = 20\log_{10}(U/U_0)$, $L = 10\log_{10}(P/P_0)$
- **Merkwerte:** $\times 2 \approx +6\,\mathrm{dB}$, $\times\sqrt{2} \approx +3\,\mathrm{dB}$, $\times 10 = +20\,\mathrm{dB}$
- **Zwei Töne gleicher Frequenz:** $A = \sqrt{A_1^2 + A_2^2 + 2A_1A_2\cos\Delta\varphi}$
- **Schwebung:** $f_\text{S} = \lvert f_2 - f_1 \rvert$
- **Fourier-Koeffizient:** $b_n = \frac{2}{T}\int_0^T x(t)\sin(n\omega_0 t)\,\mathrm{d}t$
- **Rechteck, Sägezahn, Dreieck:** $b_n = \frac{4}{\pi n}$ (ungerade), $\frac{2}{\pi n}$ (alle), $\frac{8}{\pi^2 n^2}$ (ungerade)
- **Tremolo (AM):** Linien bei $f_c$ und $f_c \pm f_m$ mit $m/2$
- **Vibrato, FM:** $f(t) = f_c + \beta f_m\cos(2\pi f_m t)$, Hub $\Delta f = \beta f_m$

**Digitales Audio und Analyse**

- **Abtasttheorem:** $f_\text{max} < f_s/2$
- **Alias:** $f_a = \lvert f - k f_s \rvert \le f_s/2$
- **Rauschabstand:** $\mathrm{SNR} \approx 6{,}02\,N + 1{,}76\,\mathrm{dB}$
- **Datenrate:** $f_s \cdot \text{Kanäle} \cdot \text{Bytes pro Wert}$
- **Panning:** $L = \cos\theta$, $R = \sin\theta$, Mitte $-3\,\mathrm{dB}$
- **Euler:** $e^{\mathrm{j}\varphi} = \cos\varphi + \mathrm{j}\sin\varphi$
- **Kosinus aus Zeigern:** $\cos\omega t = \tfrac{1}{2}(e^{\mathrm{j}\omega t} + e^{-\mathrm{j}\omega t})$
- **DFT:** $X[k] = \sum_n x[n]\,e^{-\mathrm{j}2\pi kn/N}$, $f_k = k f_s/N$
- **Auflösung, Amplitude:** $\Delta f = f_s/N$, $A = 2\lvert X[k]\rvert/N$

**Systeme**

- **RC-Tiefpass:** $H = \frac{1}{1 + \mathrm{j}f/f_c}$, $f_c = \frac{1}{2\pi RC}$
- **Digitaler Tiefpass:** $y[n] = y[n-1] + a(x[n] - y[n-1])$, $a = 1 - e^{-2\pi f_c/f_s}$
- **Sein Frequenzgang:** $H(\omega) = \frac{a}{1 - (1-a)e^{-\mathrm{j}\omega}}$, $\omega = 2\pi f/f_s$
- **Biquad-Tiefpass:** Verstärkung bei $f_c$ gleich $Q$, darüber $-12\,\mathrm{dB}$ pro Oktave
- **Echo:** $y[n] = x[n] + g\,y[n-D]$, $g < 1$
- **Kammfilter:** Nullstellen bei $f = \frac{2k+1}{2\tau}$
- **Faltung:** $y[n] = \sum_k x[k]\,h[n-k]$, Länge $N_x + N_h - 1$
- **Faltungssatz:** $Y(f) = X(f) \cdot H(f)$
- **Karplus-Strong:** $f_0 = f_s/(D + \tfrac{1}{2})$
- **Autokorrelation:** $r[k] = \sum_n x[n]\,x[n+k]$, $f_0 = f_s/k_\text{max}$

**Die zehn wichtigsten Sätze**

- Schall ist Druck, im Mikrofon wird er Spannung, im Computer eine Zahlenliste. Die Form bleibt dieselbe.
- Ein LTI-System ändert an einem Sinus nur Amplitude und Phase, nie die Frequenz.
- Das Ohr hört Verhältnisse: Oktaven bei der Tonhöhe, Dezibel bei der Lautstärke.
- Klangfarbe sind die Stärken der Obertöne und der zeitliche Verlauf.
- Scharfe Kanten in der Zeit bedeuten viel Inhalt bei hohen Frequenzen.
- Multiplizieren und Modulieren erzeugen neue Frequenzen bei Summe und Differenz.
- Abtasten verliert nichts, solange alles unter $f_s/2$ bleibt. Darüber faltet es sich zurück.
- Jedes Bit bringt 6 dB, und Frequenzauflösung kostet Zeit: $\Delta f = f_s/N$.
- Eine komplexe Zahl trägt Amplitude und Phase. Ein Filter multipliziert jede Frequenz mit seinem $H(f)$.
- Die Impulsantwort beschreibt ein LTI-System vollständig. Faltung in der Zeit ist Multiplikation im Frequenzbereich.

## Aufgaben

Zu jedem Teil ein paar Aufgaben zum Rechnen, ohne Computer. Die Lösungen klappst du erst auf, wenn du ein Ergebnis hast.

### Teil I · Schwingungen und Hören

::: aufgabe Wellenlängen
Wie lang sind die Wellen eines 50-Hz-Brummens und eines 5-kHz-Tons in Luft ($c = 343\,\mathrm{m/s}$)?
???
$\lambda = c/f$: Bei 50 Hz sind es $343/50 = 6{,}86\,\mathrm{m}$, bei 5 kHz $343/5000 = 6{,}86\,\mathrm{cm}$. Hundertfache Frequenz, ein Hundertstel der Wellenlänge.
:::

::: aufgabe Zwei Lautsprecher
Ein Lautsprecher erzeugt am Hörplatz 80 dB SPL. Ein zweiter, gleicher kommt dazu. Wie laut ist es, (a) wenn beide unterschiedliche Musik spielen, (b) wenn beide exakt dasselbe Signal liefern und es im Gleichtakt am Hörplatz ankommt?
???
(a) Die Leistungen addieren sich: $80 + 10\log_{10} 2 = 83{,}0\,\mathrm{dB}$.

(b) Die Amplituden addieren sich: $80 + 20\log_{10} 2 = 86{,}0\,\mathrm{dB}$. Kommen die beiden Signale dagegen im Gegentakt an, wird es leiser statt lauter.
:::

::: aufgabe Gitarre stimmen
Die A-Saite einer Gitarre soll auf 110 Hz. Gegen einen Stimmton mit 110 Hz hörst du drei Schwebungen pro Sekunde. Welche Frequenz kann die Saite haben, und wie findest du heraus, welche es ist?
???
Die Schwebung ist $\lvert f - 110\,\mathrm{Hz} \rvert = 3\,\mathrm{Hz}$, also hat die Saite 107 Hz oder 113 Hz. Spann die Saite ein wenig nach: Werden die Schwebungen langsamer, war sie zu tief (107 Hz). Werden sie schneller, war sie zu hoch (113 Hz).
:::

::: aufgabe Halbtöne und Cent
Wie viele Cent liegen zwischen 440 Hz und 466,16 Hz? Und wie weit ist 445 Hz von 440 Hz entfernt?
???
$1200\log_2(466{,}16/440) = 100{,}0$ Cent, genau ein Halbton (A4 zu A♯4). $1200\log_2(445/440) = 19{,}6$ Cent, also knapp ein Fünftel Halbton. Das hört ein geübtes Ohr deutlich.
:::

### Teil II · Digitales Audio

::: aufgabe Aliasing
Bei $f_s = 44{,}1\,\mathrm{kHz}$ gelangen Töne mit 25 kHz und 40 kHz ungefiltert in den Wandler. Was hört man danach?
???
Beide liegen über $f_s/2 = 22{,}05\,\mathrm{kHz}$ und werden gefaltet, jeweils mit $k = 1$:

- $25\,\mathrm{kHz} \to \lvert 25 - 44{,}1 \rvert = 19{,}1\,\mathrm{kHz}$
- $40\,\mathrm{kHz} \to \lvert 40 - 44{,}1 \rvert = 4{,}1\,\mathrm{kHz}$, mitten im empfindlichsten Hörbereich

Zwei unhörbare Töne sind hörbar geworden. Genau das verhindert das Anti-Aliasing-Filter.
:::

::: aufgabe Bittiefe
Wie viele Bit braucht ein Wandler mindestens für 110 dB Rauschabstand?
???
$6{,}02\,N + 1{,}76 \ge 110$ ergibt $N \ge (110 - 1{,}76)/6{,}02 = 17{,}98$, also **18 Bit**.
:::

::: aufgabe Datenmenge
Wie viel Speicher braucht ein Album von 45 Minuten in CD-Qualität (44,1 kHz, 16 Bit, Stereo)?
???
$44\,100 \cdot 2 \cdot 2\,\mathrm{Byte} = 176\,400\,\mathrm{Byte}$ pro Sekunde, mal $45 \cdot 60\,\mathrm{s}$ ergibt $476\,\mathrm{MB}$. Eine Audio-CD fasst bis zu 80 Minuten, also gut 840 MB Audiodaten. Als Daten-CD sind es nur 700 MB, weil dort mehr Fehlerkorrektur mitgespeichert wird.
:::

### Teil III · Signale analysieren

::: aufgabe Komplexe Amplituden
Drei Töne gleicher Frequenz mit Amplitude 1 und den Phasen 0°, 120° und 240° werden addiert. Was kommt heraus?
???
Null. Die drei Zeiger bilden ein gleichseitiges Dreieck und heben sich auf: $1 + e^{\mathrm{j}120°} + e^{\mathrm{j}240°} = 0$. Dasselbe passiert im Drehstromnetz, wo sich die Ströme dreier gleich belasteter Phasen im Neutralleiter aufheben.
:::

::: aufgabe Spektrum ablesen
Eine FFT über 9600 Werte bei 48 kHz zeigt eine Spitze bei $k = 88$ mit $\lvert X[k] \rvert = 2400$ (ohne Fenster). Welche Frequenz und welche Amplitude hat der Ton?
???
$f = 88 \cdot 48\,000 / 9600 = 440\,\mathrm{Hz}$, die Amplitude ist $2 \cdot 2400 / 9600 = 0{,}5$.
:::

### Teil IV · Systeme

::: aufgabe Digitaler Tiefpass
Welches $a$ hat der digitale Tiefpass für $f_c = 100\,\mathrm{Hz}$ bei 48 kHz? Nach wie vielen Abtastwerten hat er nach einem Sprung 63 % erreicht?
???
$a = 1 - e^{-2\pi \cdot 100 / 48\,000} = 1 - e^{-0{,}01309} \approx 0{,}0130$.

Die 63 % erreicht er nach einer Zeitkonstante $\tau = 1/(2\pi f_c) = 1{,}59\,\mathrm{ms}$, das sind $\tau \cdot f_s \approx 76$ Abtastwerte. Das gilt hier sogar exakt, weil $(1 - a)^n = e^{-n T_s / \tau}$ genau die abgetastete Ladekurve ist.
:::

::: aufgabe Faltung von Hand
Falte $x = (1, 2)$ mit $h = (1, 0{,}5, 0{,}25)$.
???
Jeder Eingangswert startet eine Kopie von $h$: $1 \cdot (1, 0{,}5, 0{,}25)$ ab Stelle 0 und $2 \cdot (1, 0{,}5, 0{,}25)$ ab Stelle 1. Summe: $(1,\; 0{,}5 + 2,\; 0{,}25 + 1,\; 0{,}5) = (1;\ 2{,}5;\ 1{,}25;\ 0{,}5)$. Das sind $2 + 3 - 1 = 4$ Werte.
:::

### Teil V · Projekte

::: aufgabe Karplus-Strong
Welche Tonhöhe hat die Saite mit $D = 218$ bei 48 kHz? Welcher Ton ist das ungefähr?
???
$f_0 = 48\,000 / 218{,}5 \approx 219{,}68\,\mathrm{Hz}$. Das ist ein A3 (220 Hz), etwa 2,5 Cent zu tief: $1200 \cdot \log_2(219{,}68/220) \approx -2{,}5$.
:::

::: aufgabe Autokorrelation
Das Maximum der Autokorrelation liegt bei 48 kHz bei $k = 109$. Welcher Ton ist das?
???
$f_0 = 48\,000/109 = 440{,}4\,\mathrm{Hz}$, ein A4, etwa 1,4 Cent zu hoch. Ohne die Parabel wäre das Raster grob: $k = 110$ ergäbe schon 436,4 Hz.
:::

## Wie es weitergeht

Mit dieser Notiz hast du das Fundament. Jeder weitere Schritt baut darauf auf:

- **Ausprobieren ohne Code:** Im [Crashtest-Labor](../labor/) steckst du Oszillatoren, Filter, Echo und Verzerrer zusammen, mit Missionen zu Oktave, Rechteck, Tiefpass, Schwebung und Echo. Am [Messplatz](../messplatz/) misst du den RC-Tiefpass mit Funktionsgenerator und Oszilloskop wie im Labor an der Uni.
- **z-Transformation und Pole:** wie man Filter gezielt entwirft und erkennt, ob sie stabil sind.
- **Dynamik:** Kompressor und Limiter, die laute Stellen automatisch leiser machen ([[Limiter|limiter]]).
- **Echtzeit:** Das Paket `sounddevice` spielt numpy-Arrays direkt ab und kann Mikrofonsignale blockweise verarbeiten. Danach: Pure Data, oder C++ mit JUCE für eigene Plugins.
- **Psychoakustik:** warum leise Töne neben lauten verschwinden (Maskierung), und wie MP3 und AAC das ausnutzen.
- **Raumakustik und Lautsprecher:** Messen mit Sweeps, Raummoden, Frequenzweichen.

Zum Weiterlesen, frei im Netz:

- [Steven W. Smith: The Scientist and Engineer's Guide to Digital Signal Processing](https://www.dspguide.com/), verständlich, mit vielen Bildern und wenig Formeln.
- [Julius O. Smith III, Stanford CCRMA](https://ccrma.stanford.edu/~jos/): vier Online-Bücher von der DFT bis zur physikalischen Klangsynthese. Karplus-Strong steht dort ausführlich.
- [Audio EQ Cookbook](https://www.w3.org/TR/audio-eq-cookbook/): die Formeln für alle gängigen digitalen Filter, auch den Biquad aus Abschnitt 14.
