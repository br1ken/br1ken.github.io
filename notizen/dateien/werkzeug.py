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
