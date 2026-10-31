#!/usr/bin/env python3
"""osci//log · Reel „Von Newton bis Ohm": der Track.

120 BPM, e-Moll, 14 Takte + Nachklang. Der Track baut sich additiv auf: jede der acht Größen
(Takt 3 bis 10) bringt eine neue Spur — Kraft die Kick, Arbeit die Hats, Ladung die Zähl-Blips,
Feld die Snare, Potential das Pad, Spannung den Akkordwechsel, Strom das Arpeggio, Widerstand den
Filter. Takt 11–12 ist die Summe, Takt 13–14 der Ausklang.

Schreibt daneben alles, was das Bild braucht: Zeitpunkte von Kick, Snare, Hat, Blips, Arpeggio
und Stabs, Grenzfrequenz je Frame, Lautstärke je Frame und den Mix als 16-Bit-Spur.

Aufruf: python3 track.py <ausgabe-ordner>   →  track.wav, data.js, spektrogramm.png
"""
import sys, os, json, base64, math
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 14
TAIL = 2.0
DUR = BARS * BAR + TAIL
N = int(DUR * SR)
FPS = 30
rng = np.random.default_rng(20261101)
t_all = np.arange(N) / SR

def sec(bar, beat=0.0, step=0): return (bar - 1) * BAR + beat * BEAT + step * BEAT / 4
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i >= len(buf): return
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n] * gain
def env_ad(n, a, d, sus=0.0, rel=0.03, gate=None):
    tt = np.arange(n) / SR
    e = np.minimum(tt / max(a, 1e-4), 1.0) * (sus + (1 - sus) * np.exp(-np.maximum(tt - a, 0) / d))
    if gate is not None: e = e * (1 - np.clip((tt - gate) / rel, 0, 1))
    return e
def biquad_lp(fc, q):
    w = 2 * math.pi * min(fc, SR * 0.45) / SR; al = math.sin(w) / (2 * q); c = math.cos(w)
    b = np.array([(1 - c) / 2, 1 - c, (1 - c) / 2]); a = np.array([1 + al, -2 * c, 1 - al])
    return b / a[0], a / a[0]
def lowpass_var(x, cutoff, q=0.9, block=256):
    y = np.zeros_like(x); zi = np.zeros(2)
    for i in range(0, len(x), block):
        b, a = biquad_lp(float(cutoff[min(i + block // 2, len(cutoff) - 1)]), q)
        y[i:i + block], zi = signal.lfilter(b, a, x[i:i + block], zi=zi)
    return y
def lowpass(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'low', fs=SR, output='sos'), x)
def highpass(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x)
def bandpass(x, lo, hi): return signal.sosfilt(signal.butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def saw(f, n, det=0.0): return signal.sawtooth(2 * np.pi * f * (1 + det) * np.arange(n) / SR + rng.uniform(0, 2 * np.pi))
def square(f, n): return signal.square(2 * np.pi * f * np.arange(n) / SR)
def sine(f, n): return np.sin(2 * np.pi * f * np.arange(n) / SR)

# ---------- Instrumente ----------
def kick():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 42 + 140 * np.exp(-tt / 0.026)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.2)
    click = rng.standard_normal(n) * np.exp(-tt / 0.003) * 0.5
    return np.tanh((body + click) * 1.8) * 0.95
def hat(open_=False):
    n = int((0.3 if open_ else 0.08) * SR); tt = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 8000, 4) * np.exp(-tt / (0.1 if open_ else 0.025)) * 0.9
def snare():
    n = int(0.28 * SR); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * (175 + 60 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.06)
    noise = bandpass(rng.standard_normal(n), 1200, 9000) * np.exp(-tt / 0.11)
    return np.tanh((body * 0.9 + noise * 0.8) * 1.5)
def pluck(f, dur=0.35, index=3.0, ratio=2.0):
    """2-Operator-FM: Glocke/Pluck, Modulationsindex klingt ab."""
    n = int(dur * SR); tt = np.arange(n) / SR
    idx = index * np.exp(-tt / 0.07)
    mod = np.sin(2 * np.pi * f * ratio * tt) * idx
    return np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt / 0.12)
def bell(f, dur=2.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f * 3.5 * tt) * 2.0 * np.exp(-tt / 0.5)
    return np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt / 0.9)

# ---------- Spuren ----------
K = np.zeros(N); H = np.zeros(N); S = np.zeros(N); SUB = np.zeros(N); Braw = np.zeros(N)
BL = np.zeros(N); A = np.zeros(N); P = np.zeros(N); ST = np.zeros(N); FX = np.zeros(N)
kick_t, snare_t, hat_t, blip_ev, arp_ev, stab_t = [], [], [], [], [], []
k_smp, hc, ho, sn = kick(), hat(), hat(True), snare()

# Takt 1–2: Zähl-Ticks und ein Sub-Puls auf jedem Schlag; Kick ab Takt 3 (Kraft)
tick = highpass(rng.standard_normal(int(0.02 * SR)), 3000, 4) * np.exp(-np.arange(int(0.02 * SR)) / SR / 0.003)
for bar in (1, 2):
    for s in range(0, 16, 2): place(H, tick, sec(bar, 0, s), 0.3)
    for beat in range(4):
        n = int(0.4 * SR); place(SUB, sine(midi(28), n) * env_ad(n, 0.005, 0.25), sec(bar, beat), 0.8)
for bar in range(3, BARS + 1):
    for beat in range(4):
        if bar == 11 and beat < 1: continue           # Impact-Loch
        if bar >= 13 and beat not in (0, 2): continue  # Ausklang: halbe Dichte
        if bar == 14 and beat > 0: continue
        t0 = sec(bar, beat); kick_t.append(t0); place(K, k_smp, t0)

# Sub-Bass (Sinus + Dreieck) ab Takt 3 in Achteln; obendrauf ein Sägezahn-Bass, der ab Takt 10 durch den Filter kommt
bass_pat = [28, None, 28, 28, None, 28, None, 35]  # E1 … B1, Achtel
for bar in range(3, BARS + 1):
    pat = [28, None, None, None, 28, None, None, None] if bar >= 13 else bass_pat
    for s, note in enumerate(pat):
        if note is None: continue
        gate = BEAT / 2 * 0.85; n = int((gate + 0.06) * SR)
        e = env_ad(n, 0.004, 0.4, 0.85, 0.04, gate)
        place(SUB, (0.7 * sine(midi(note), n) + 0.3 * signal.sawtooth(2 * np.pi * midi(note) * np.arange(n) / SR, 0.5)) * e, sec(bar, s / 2), 0.9)
        place(Braw, saw(midi(note + 12), n) * e, sec(bar, s / 2), 0.8)

# Hats ab Takt 4 (Arbeit): Offbeat-Achtel; ab Takt 10 Sechzehntel; offene Hat auf 4und ab Takt 7
for bar in range(4, 13):
    for s in range(16):
        if s % 4 == 2: t0 = sec(bar, 0, s); hat_t.append(t0); place(H, hc, t0, 1.0)
        elif bar >= 10 and s % 2 == 1: place(H, hc, sec(bar, 0, s), 0.45)
    if bar >= 7: place(H, ho, sec(bar, 3, 2), 0.6)

# Zähl-Blips in Takt 5 (Ladung): 16 Blips auf E5, jeder ein Elektron, aufsteigend lauter
for s in range(16):
    t0 = sec(5, 0, s); blip_ev.append(round(t0, 4))
    place(BL, pluck(midi(88 if s % 4 else 76), 0.3, 2.5), t0, 0.35 + 0.4 * s / 15)

# Snare auf 2 und 4 ab Takt 6 (Feld)
for bar in range(6, 13):
    for beat in (1, 3):
        if bar == 11 and beat == 1: continue
        t0 = sec(bar, beat); snare_t.append(t0); place(S, sn, t0)

# Pad ab Takt 7 (Potential): Em; Takt 8 (Spannung): Wechsel nach C; danach Folge
chords = {7: (sec(7), BAR, [52, 55, 59]), 8: (sec(8), BAR, [48, 52, 55]), 9: (sec(9), 2 * BAR, [52, 55, 59]),
          11: (sec(11), BAR / 2, [48, 52, 55]), 11.5: (sec(11, 2), BAR / 2, [43, 47, 50]), 12: (sec(12), BAR / 2, [50, 54, 57]), 12.5: (sec(12, 2), BAR / 2, [52, 55, 59]),
          13: (sec(13), 2 * BAR + 1.5, [52, 55, 59, 64])}
for _, (t0, dauer, notes) in chords.items():
    n = int((dauer + 0.7) * SR); e = env_ad(n, 0.25, 10, 1.0, 0.6, dauer)
    for note in notes:
        for det in (-0.005, 0, 0.005): place(P, saw(midi(note), n, det) * e, t0, 0.1)
P = lowpass(P, 1100)

# Arpeggio ab Takt 9 (Strom): Sechzehntel, e-Moll-Pentatonik, FM-Pluck; läuft bis Takt 12
rows = [64, 67, 71, 74, 76, 79, 83, 86]   # E4 G4 B4 D5 E5 G5 B5 D6
pat_a = [64, 67, 71, 76, 74, 71, 67, 71]
pat_b = [76, 79, 83, 86, 83, 79, 76, 74]
for bar in range(9, 13):
    pat = pat_a if bar < 11 else pat_b
    for half in range(2):
        for s, note in enumerate(pat):
            t0 = sec(bar, half * 2, s); arp_ev.append({'t': round(t0, 4), 'step': s, 'row': rows.index(note)})
            place(A, pluck(midi(note), 0.3, 2.2), t0, 0.5)

# Stabs in Takt 11–12 (Summe): Akkord-Stiche auf 1 und 3
stab_chords = {sec(11, 1): [64, 67, 71], sec(11, 2): [60, 64, 67], sec(12): [62, 66, 69], sec(12, 2): [64, 67, 71]}
for t0, notes in stab_chords.items():
    stab_t.append(round(t0, 4)); n = int(0.5 * SR)
    for note in notes: place(ST, (0.5 * saw(midi(note), n) + 0.5 * square(midi(note), n)) * env_ad(n, 0.003, 0.16), t0, 0.3)
ST = lowpass(ST, 3800)

# Riser in Takt 10, Impact auf Takt 11, Glocke auf Takt 13
n = int(BAR * SR); tt = np.arange(n) / SR
place(FX, lowpass_var(highpass(rng.standard_normal(n), 200), 250 * (24 ** (tt / BAR)), 1.2) * (tt / BAR) ** 2, sec(10), 0.5)
n = int(0.9 * SR); tt = np.arange(n) / SR
place(FX, np.sin(2 * np.pi * (36 + 70 * np.exp(-tt / 0.05)) * tt) * np.exp(-tt / 0.35) + lowpass(rng.standard_normal(n), 3000) * np.exp(-tt / 0.08) * 0.5, sec(11), 0.9)
place(BL, bell(midi(88), 2.5), sec(13), 0.5)
place(BL, bell(midi(76), 3.0), sec(14), 0.35)

# ---------- Filter für den Sägezahn-Bass: zu bis Takt 10 (Widerstand), dann auf ----------
def cutoff_at(t):
    b = t / BAR + 1
    if b < 10: return 180
    if b < 11: return 180 * (3200 / 180) ** (b - 10)
    if b < 13: return 3200
    return 3200 * np.exp(-(b - 13) * 2.5) + 150
grid = np.arange(0, DUR, 1 / 200)
cut_smp = np.interp(t_all, grid, np.array([cutoff_at(x) for x in grid]))
B = np.tanh(lowpass_var(Braw, cut_smp, q=2.4) * 1.6) / 1.6

# ---------- Sidechain ----------
sc = np.ones(N)
for tk in kick_t:
    i = int(tk * SR); sc[i:] = 1 - 0.85 * np.exp(-(t_all[i:] - tk) / 0.13)
def duck(x, depth): return x * (1 - depth * (1 - sc))

# Delay fürs Arpeggio (punktierte Achtel, Ping-Pong) und für die Blips
d = int(BEAT * 0.75 * SR)
AL = A.copy() + BL.copy(); AR = A.copy() * 0.9 + BL.copy()
for k in range(1, 5):
    g = 0.4 ** k; tap = np.zeros(N); tap[k * d:] = (A + BL * 0.7)[:N - k * d] * g
    if k % 2: AR += tap
    else: AL += tap

# ---------- Mix ----------
VOR = 0.4
def mix(side):
    arp = AL if side == 'L' else AR
    return VOR * (K * 1.0 + H * 0.24 * (1.12 if side == 'R' else 1) + S * 0.55 + duck(SUB, 0.9) * 0.7 + duck(B, 1.0) * 0.45
                  + duck(arp, 0.45) * 0.36 + duck(P, 0.9) * 0.6 + duck(ST, 0.6) * 0.7 + FX * 0.7)
def master(x): return np.tanh(x * 1.25) / math.tanh(1.25)
mix_L, mix_R = master(mix('L')), master(mix('R'))
peak = max(np.abs(mix_L).max(), np.abs(mix_R).max()); mix_L *= 0.95 / peak; mix_R *= 0.95 / peak
mono = (mix_L + mix_R) / 2

out = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(out, exist_ok=True)
wavfile.write(os.path.join(out, 'track.wav'), SR, np.stack([mix_L, mix_R], 1).astype(np.float32))

# ---------- Daten fürs Bild ----------
frames = int(math.ceil(DUR * FPS)); ft = np.arange(frames) / FPS
rms = np.array([np.sqrt(np.mean(mono[int(x * SR):int(x * SR) + SR // FPS] ** 2)) if int(x * SR) < N else 0 for x in ft]); rms /= rms.max()
def spur(x):
    y = x[::2]; m = np.abs(y).max() or 1
    return base64.b64encode((np.clip(y / m, -1, 1) * 32767).astype('<i2').tobytes()).decode()
data = {
    'sr': SR // 2, 'fps': FPS, 'bpm': BPM, 'beat': BEAT, 'bar': BAR, 'bars': BARS, 'dur': DUR,
    'kick': [round(x, 4) for x in kick_t], 'snare': [round(x, 4) for x in snare_t], 'hat': [round(x, 4) for x in hat_t],
    'blip': blip_ev, 'arp': arp_ev, 'stab': stab_t, 'rows': rows,
    'rms': [round(float(x), 3) for x in rms], 'cut': [round(float(x), 1) for x in np.interp(ft, t_all, cut_smp)], 'sc': [round(float(x), 3) for x in np.interp(ft, t_all, sc)],
    'sig': {'mix': spur(mono), 'bass': spur(B + SUB), 'arp': spur(A)}
}
with open(os.path.join(out, 'data.js'), 'w') as f: f.write('window.REEL = ' + json.dumps(data) + ';\n')

try:
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    f_, t_, Sx = signal.spectrogram(mono, SR, nperseg=2048, noverlap=1536)
    fig, ax = plt.subplots(2, 1, figsize=(14, 7), gridspec_kw={'height_ratios': [3, 1]})
    ax[0].pcolormesh(t_, f_, 10 * np.log10(Sx + 1e-12), shading='auto', vmin=-110, vmax=-30, cmap='magma'); ax[0].set_yscale('symlog', linthresh=200); ax[0].set_ylim(20, 16000)
    for b in range(1, BARS + 2): ax[0].axvline((b - 1) * BAR, color='w', lw=.5, alpha=.5); ax[0].text((b - 1) * BAR + .05, 12000, str(b), color='w', fontsize=8)
    ax[1].plot(t_all[::20], mono[::20], lw=.3, color='#ff4a1c'); ax[1].set_xlim(0, DUR); plt.tight_layout(); plt.savefig(os.path.join(out, 'spektrogramm.png'), dpi=90)
except Exception as e: print('kein Spektrogramm:', e)
print(f'track.wav: {DUR:.2f} s, Spitze {peak:.2f} vor Normierung, RMS {np.sqrt(np.mean(mono**2)):.3f}, {frames} Frames, {len(kick_t)} Kicks, {len(arp_ev)} Arp-Schritte, {len(blip_ev)} Blips')
