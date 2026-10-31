#!/usr/bin/env python3
"""osci//log · Intro-Reel: der Track.

Synthetisiert den kompletten Track (124 BPM, a-Moll, 12 Takte + Nachklang) aus Grundbausteinen
und schreibt daneben alles, was das Bild braucht: Zeitpunkte von Kick/Clap/Hat, das Arpeggio als
Sequencer-Schritte, die Filter-Grenzfrequenz je Frame und die Signale selbst (für Oszilloskop und
XY-Betrieb) als 16-Bit-Spuren. Das Bild wird aus denselben Daten gezeichnet, die man hört.

Aufruf: python3 track.py <ausgabe-ordner>   →  track.wav, data.js, spektrogramm.png
"""
import sys, os, json, base64, math
import numpy as np
from scipy import signal

SR = 44100
BPM = 124
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 12
TAIL = 1.8
DUR = BARS * BAR + TAIL
N = int(DUR * SR)
FPS = 30
rng = np.random.default_rng(20261031)

def sec(bar, beat=0.0, step=0):
    """Zeit in Sekunden: Takt (ab 1), Schlag (ab 0), Sechzehntel (ab 0)."""
    return (bar - 1) * BAR + beat * BEAT + step * BEAT / 4

def midi(n):
    return 440 * 2 ** ((n - 69) / 12)

def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i >= len(buf): return
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * gain

def env_ad(n, a, d, sus=0.0, rel=0.03, gate=None):
    """Attack-Decay(-Sustain-Release) in Sekunden; gate = Länge bis zum Release."""
    tt = np.arange(n) / SR
    e = np.minimum(tt / max(a, 1e-4), 1.0)
    dec = sus + (1 - sus) * np.exp(-np.maximum(tt - a, 0) / d)
    e = e * dec
    if gate is not None:
        r = np.clip((tt - gate) / rel, 0, 1)
        e = e * (1 - r)
    return e

def biquad_lp(fc, q):
    w = 2 * math.pi * min(fc, SR * 0.45) / SR
    al = math.sin(w) / (2 * q); c = math.cos(w)
    b = np.array([(1 - c) / 2, 1 - c, (1 - c) / 2]); a = np.array([1 + al, -2 * c, 1 - al])
    return b / a[0], a / a[0]

def lowpass_var(x, cutoff, q=0.9, block=256):
    """Tiefpass 2. Ordnung mit zeitveränderlicher Grenzfrequenz (cutoff: Array über die Zeit)."""
    y = np.zeros_like(x); zi = np.zeros(2)
    for i in range(0, len(x), block):
        fc = float(cutoff[min(i + block // 2, len(cutoff) - 1)])
        b, a = biquad_lp(fc, q)
        y[i:i + block], zi = signal.lfilter(b, a, x[i:i + block], zi=zi)
    return y

def lowpass(x, fc, order=2):
    sos = signal.butter(order, fc, 'low', fs=SR, output='sos'); return signal.sosfilt(sos, x)

def highpass(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos'); return signal.sosfilt(sos, x)

def bandpass(x, lo, hi):
    sos = signal.butter(2, [lo, hi], 'band', fs=SR, output='sos'); return signal.sosfilt(sos, x)

# ---------- Instrumente ----------
def kick():
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 46 + 130 * np.exp(-tt / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.24)
    click = rng.standard_normal(n) * np.exp(-tt / 0.0035) * 0.5
    return np.tanh((body + click) * 1.7) * 0.95

def hat(open_=False):
    n = int((0.32 if open_ else 0.09) * SR); tt = np.arange(n) / SR
    x = highpass(rng.standard_normal(n), 7500, 4) * np.exp(-tt / (0.11 if open_ else 0.03))
    return x * 0.9

def clap():
    n = int(0.3 * SR); tt = np.arange(n) / SR
    noise = bandpass(rng.standard_normal(n), 900, 4500)
    e = np.zeros(n)
    for k, g in [(0, 1), (0.011, .8), (0.022, .7), (0.033, .9)]:
        i = int(k * SR); e[i:] = np.maximum(e[i:], g * np.exp(-(tt[i:] - k) / 0.012))
    e = np.maximum(e, 0.55 * np.exp(-tt / 0.09))
    return noise * e

def saw(f, n, detune=0.0):
    tt = np.arange(n) / SR
    return signal.sawtooth(2 * np.pi * f * (1 + detune) * tt + rng.uniform(0, 2 * np.pi))

def square(f, n):
    tt = np.arange(n) / SR
    return signal.square(2 * np.pi * f * tt)

# ---------- Spuren ----------
kick_t, clap_t, hat_t, arp_ev = [], [], [], []
K = np.zeros(N); H = np.zeros(N); C = np.zeros(N)
Braw = np.zeros(N); A = np.zeros(N); P = np.zeros(N)
LX = np.zeros(N); LY = np.zeros(N); FX = np.zeros(N)

k_smp, hc, ho, cl = kick(), hat(), hat(True), clap()

# Kick: ab Takt 2 auf jeden Schlag; Takt 10 setzt die ersten zwei Schläge aus; Takt 12 nur Schlag 1.
for bar in range(2, BARS + 1):
    for beat in range(4):
        if bar == 10 and beat < 2: continue
        if bar == 12 and beat > 0: continue
        t0 = sec(bar, beat); kick_t.append(t0); place(K, k_smp, t0)

# Takt 1: ein leiser Zähl-Tick auf jedem Achtel, wie ein Tastkopf, der die Bahn antippt.
tick = highpass(rng.standard_normal(int(0.02 * SR)), 3000, 4) * np.exp(-np.arange(int(0.02 * SR)) / SR / 0.003)
for s in range(0, 16, 2): place(H, tick, sec(1, 0, s), 0.35)

# Hats: Offbeat-Achtel ab Takt 2, Sechzehntel ab Takt 6, offene Hat auf der 4und ab Takt 4.
for bar in range(2, BARS):
    if bar == 10: continue
    for s in range(16):
        if s % 4 == 2:
            t0 = sec(bar, 0, s); hat_t.append(t0); place(H, hc, t0, 1.0)
        elif bar >= 6 and s % 2 == 1:
            t0 = sec(bar, 0, s); place(H, hc, t0, 0.45)
    if bar >= 4:
        t0 = sec(bar, 3, 2); place(H, ho, t0, 0.7)

# Clap: 2 und 4 ab Takt 4.
for bar in range(4, BARS):
    for beat in (1, 3):
        if bar == 10 and beat == 1: continue
        t0 = sec(bar, beat); clap_t.append(t0); place(C, cl, t0)

# Bass: Sechzehntel-Muster, roh (Sägezahn), der Filter kommt danach mit Automation.
bass_pat = [33, None, 33, 33, None, 33, None, 45, 33, None, 33, 33, None, 33, 31, None]
for bar in range(1, BARS):
    if bar == 10: pat = [33, None, None, None, None, None, None, None] + bass_pat[8:]
    else: pat = bass_pat
    if bar == 1: pat = [33 if s % 4 == 0 else None for s in range(16)]   # Intro: nur die Viertel, der Filter ist zu
    for s, note in enumerate(pat):
        if note is None: continue
        gate = BEAT * 0.97 if bar == 1 else BEAT / 4 * (0.9 if s % 4 else 1.4); n = int((gate + 0.05) * SR)
        x = saw(midi(note), n) * env_ad(n, 0.004, 0.35, 0.8, 0.03, gate)
        place(Braw, x, sec(bar, 0, s))

# Arpeggio: 8 Schritte je halben Takt, als Sequencer-Raster (Zeile = Tonhöhe).
rows = [57, 60, 62, 64, 67, 69, 72, 76]           # A3 C4 D4 E4 G4 A4 C5 E5
pat_a = [57, 60, 64, 69, 67, 64, 60, 64]
pat_b = [69, 64, 72, 69, 67, 64, 62, 64]
pat_c = [57, 64, 69, 72, 76, 72, 69, 64]
for bar in range(4, BARS):
    pat = pat_a if bar < 8 else (pat_b if bar < 10 else pat_c)
    for half in range(2):
        for s, note in enumerate(pat):
            t0 = sec(bar, half * 2, s)
            n = int(0.3 * SR)
            x = (0.6 * saw(midi(note), n) + 0.4 * square(midi(note), n)) * env_ad(n, 0.003, 0.14)
            place(A, x, t0, 0.5)
            arp_ev.append({'t': round(t0, 4), 'step': s, 'row': rows.index(note)})
A = lowpass(A, 3200)

# Pad: Akkorde, drei verstimmte Sägezähne je Ton.
chords = {6: [45, 48, 52], 7: [41, 45, 48], 8: [48, 52, 55], 9: [43, 47, 50], 10: [45, 48, 52], 11: [41, 45, 48]}
for bar, notes in chords.items():
    n = int((BAR + 0.6) * SR)
    e = env_ad(n, 0.35, 10, 1.0, 0.5, BAR)
    for note in notes:
        for det in (-0.006, 0, 0.006):
            place(P, saw(midi(note), n, det) * e, sec(bar), 0.11)
P = lowpass(P, 900)

# Lissajous-Stimmen: X = 330 Hz (E4) als Kosinus, Y = 220 Hz (A3) als Sinus → x = cos 3θ, y = sin 2θ, das Logo.
t_all = np.arange(N) / SR
t_on = sec(10); t_off = sec(12)
e_l = np.clip((t_all - t_on) / 0.4, 0, 1) * np.where(t_all < t_off, 1.0, np.exp(-(t_all - t_off) / 1.1))
LX = np.cos(2 * np.pi * 330 * t_all) * e_l
LY = np.sin(2 * np.pi * 220 * t_all) * e_l

# Riser (Takt 9) und Impact (Takt 10).
n = int(BAR * SR); tt = np.arange(n) / SR
riser = rng.standard_normal(n)
riser = lowpass_var(highpass(riser, 200), 300 * (20 ** (tt / BAR)), 1.2) * (tt / BAR) ** 2
place(FX, riser, sec(9), 0.5)
n = int(0.9 * SR); tt = np.arange(n) / SR
impact = np.sin(2 * np.pi * (38 + 60 * np.exp(-tt / 0.05)) * tt) * np.exp(-tt / 0.35) + lowpass(rng.standard_normal(n), 3000) * np.exp(-tt / 0.08) * 0.5
place(FX, impact, sec(10), 0.9)

# ---------- Filter-Automation für den Bass ----------
def cutoff_at(t):
    b = t / BAR + 1          # Takt als Bruch (1-basiert)
    if b < 4: return 240
    if b < 6: return 240 + (700 - 240) * (b - 4) / 2
    if b < 8: return 700 * (3500 / 700) ** ((b - 6) / 2)
    if b < 10: return 2600
    if b < 10.5: return 160
    if b < 12: return 3000
    return 3000 * np.exp(-(b - 12) * 3)
cut_all = np.array([cutoff_at(x) for x in np.arange(0, DUR, 1 / 200)])
cut_smp = np.interp(t_all, np.arange(0, DUR, 1 / 200), cut_all)
B = lowpass_var(Braw, cut_smp, q=2.6)
B = np.tanh(B * 1.8) / 1.8

# ---------- Sidechain ----------
sc = np.ones(N)
for tk in kick_t:
    i = int(tk * SR); seg = t_all[i:] - tk
    sc[i:] = 1 - 0.85 * np.exp(-seg / 0.13)
def duck(x, depth): return x * (1 - depth * (1 - sc))

# ---------- Delay fürs Arpeggio (Ping-Pong, punktierte Achtel) ----------
d = int(BEAT * 0.75 * SR)
AL = A.copy(); AR = A.copy() * 0.9
for k in range(1, 5):
    g = 0.42 ** k; tap = np.zeros(N); tap[k * d:] = A[:N - k * d] * g
    if k % 2: AR += tap
    else: AL += tap

# ---------- Mix ----------
VOR = 0.4   # Summe leise genug halten, damit die Sättigung nur die Spitzen rundet
mix_L = VOR * (K * 1.0 + H * 0.26 + C * 0.42 + duck(B, 1.0) * 0.6 + duck(AL, 0.5) * 0.32 + duck(P, 0.9) * 0.55
         + duck(LX, 0.3) * 0.22 + duck(LY, 0.3) * 0.17 + FX * 0.7)
mix_R = VOR * (K * 1.0 + H * 0.26 * 1.15 + C * 0.42 + duck(B, 1.0) * 0.6 + duck(AR, 0.5) * 0.32 + duck(P, 0.9) * 0.55
         + duck(LX, 0.3) * 0.17 + duck(LY, 0.3) * 0.22 + FX * 0.7)
def master(x): return np.tanh(x * 1.25) / math.tanh(1.25)
mix_L, mix_R = master(mix_L), master(mix_R)
peak = max(np.abs(mix_L).max(), np.abs(mix_R).max())
mix_L *= 0.95 / peak; mix_R *= 0.95 / peak
mono = (mix_L + mix_R) / 2

out = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(out, exist_ok=True)
from scipy.io import wavfile
wavfile.write(os.path.join(out, 'track.wav'), SR, np.stack([mix_L, mix_R], 1).astype(np.float32))

# ---------- Daten fürs Bild ----------
frames = int(math.ceil(DUR * FPS))
ft = np.arange(frames) / FPS
rms = np.array([np.sqrt(np.mean(mono[int(x * SR):int(x * SR) + SR // FPS] ** 2)) if int(x * SR) < N else 0 for x in ft])
rms = rms / rms.max()
cut_f = np.interp(ft, t_all, cut_smp)
sc_f = np.interp(ft, t_all, sc)
def spur(x):
    """Spur fürs Bild: halbe Abtastrate, 16 Bit, auf ±1 normiert."""
    y = x[::2]; m = np.abs(y).max() or 1
    return base64.b64encode((np.clip(y / m, -1, 1) * 32767).astype('<i2').tobytes()).decode()
data = {
    'sr': SR // 2, 'fps': FPS, 'bpm': BPM, 'beat': BEAT, 'bar': BAR, 'bars': BARS, 'dur': DUR,
    'kick': [round(x, 4) for x in kick_t], 'clap': [round(x, 4) for x in clap_t], 'hat': [round(x, 4) for x in hat_t],
    'arp': arp_ev, 'rows': rows,
    'rms': [round(float(x), 3) for x in rms], 'cut': [round(float(x), 1) for x in cut_f], 'sc': [round(float(x), 3) for x in sc_f],
    'sig': {'mix': spur(mono), 'bass': spur(B), 'arp': spur(A), 'lx': spur(LX), 'ly': spur(LY)}
}
with open(os.path.join(out, 'data.js'), 'w') as f:
    f.write('window.REEL = ' + json.dumps(data) + ';\n')

# Spektrogramm zur Kontrolle
try:
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    f_, t_, S = signal.spectrogram(mono, SR, nperseg=2048, noverlap=1536)
    fig, ax = plt.subplots(2, 1, figsize=(14, 7), gridspec_kw={'height_ratios': [3, 1]})
    ax[0].pcolormesh(t_, f_, 10 * np.log10(S + 1e-12), shading='auto', vmin=-110, vmax=-30, cmap='magma')
    ax[0].set_yscale('symlog', linthresh=200); ax[0].set_ylim(20, 16000)
    for b in range(1, BARS + 2): ax[0].axvline((b - 1) * BAR, color='w', lw=.5, alpha=.5); ax[0].text((b - 1) * BAR + .05, 12000, str(b), color='w', fontsize=8)
    ax[1].plot(t_all[::20], mono[::20], lw=.3, color='#ff4a1c'); ax[1].plot(ft, cut_f / cut_f.max(), color='#1a12ff', lw=1); ax[1].set_xlim(0, DUR)
    plt.tight_layout(); plt.savefig(os.path.join(out, 'spektrogramm.png'), dpi=90)
except Exception as e:
    print('kein Spektrogramm:', e)

print(f'track.wav: {DUR:.2f} s, Spitze {peak:.2f} vor Normierung, RMS {np.sqrt(np.mean(mono**2)):.3f}, {frames} Frames, {len(kick_t)} Kicks, {len(arp_ev)} Arp-Schritte')
