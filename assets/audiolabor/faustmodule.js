/* Audiolabor: FaustWasm einbinden. Der Compiler (rund 6,5 MB) wird erst geladen, wenn ein Modul gebraucht wird.
   Faust-Module sind digitale Signalverarbeitung mit gerichteten Ein- und Ausgängen und bleiben als solche gekennzeichnet.
   Sie sind keine Bauteile: An der Grenze zur Schaltung stehen eine gepufferte Quelle und ein Messabgriff. */

const LIB_URL = new URL('../vendor/faustwasm/index.js', import.meta.url).href;
const WASM_JS = new URL('../vendor/faustwasm/libfaust-wasm/libfaust-wasm.js', import.meta.url).href;

let ladung = null;

export function faustLaden() {
  if (!ladung) {
    ladung = (async () => {
      const t0 = performance.now();
      const fw = await import(LIB_URL);
      const modul = await fw.instantiateFaustModuleFromFile(WASM_JS);
      const lib = new fw.LibFaust(modul);
      const compiler = new fw.FaustCompiler(lib);
      return {fw, lib, compiler, version: lib.version(), ladeMs: performance.now() - t0};
    })();
    ladung.catch(() => { ladung = null; });
  }
  return ladung;
}

let knotenZaehler = 0;

/* Übersetzt Faust-Code. Gibt den Generator zurück, aus dem Knoten oder Offline-Prozessoren entstehen. */
export async function faustUebersetzen(name, code) {
  const {fw, compiler} = await faustLaden();
  const generator = new fw.FaustMonoDspGenerator();
  const t0 = performance.now();
  try {
    const ok = await generator.compile(compiler, name, code, '-ftz 2');
    if (!ok) throw new Error(compiler.getErrorMessage() || 'Faust-Übersetzung fehlgeschlagen');
  } catch (e) {
    throw new Error(String(e?.message || e).replace(/^.*?ERROR : /s, ''));
  }
  return {generator, uebersetzMs: performance.now() - t0};
}

/* Erzeugt einen Knoten im gegebenen Audiokontext. Der Prozessorname ist eindeutig, damit mehrere Module nebeneinander laufen. */
export async function faustKnoten(ctx, name, generator) {
  const einzig = `${name}_${++knotenZaehler}`;
  const knoten = await generator.createNode(ctx, einzig);
  if (!knoten) throw new Error(`Faust-Knoten „${name}“ konnte nicht erzeugt werden.`);
  return knoten;
}

/* Aus dem JSON der Faust-Oberfläche wird eine flache Reglerliste. */
export function faustRegler(knotenOderProzessor) {
  const liste = [];
  const lauf = (gruppe) => {
    for (const e of gruppe) {
      if (e.items) { lauf(e.items); continue; }
      if (['hslider', 'vslider', 'nentry', 'button', 'checkbox'].includes(e.type)) {
        liste.push({typ: e.type, name: e.label, pfad: e.address, def: e.init ?? 0, min: e.min ?? 0, max: e.max ?? 1, schritt: e.step ?? 0.01, einheit: (e.meta || []).find(m => m.unit)?.unit || ''});
      }
    }
  };
  lauf(knotenOderProzessor.getUI());
  return liste;
}

/* Rendert eine Faust-Quelle ohne Audiokontext zu Abtastwerten. So bekommt ngspice im Renderbetrieb dasselbe Signal als PWL-Quelle. */
export async function faustRendern(generator, fs, n, setzen = {}) {
  const proz = await generator.createOfflineProcessor(fs, 1024);
  if (!proz) throw new Error('Faust-Offline-Prozessor konnte nicht erzeugt werden.');
  for (const [pfad, wert] of Object.entries(setzen)) proz.setParamValue(pfad, wert);
  proz.start?.();
  const roh = proz.render(null, n);
  return roh[0];
}

/* Die mitgelieferte Auswahl. Bibliotheken: stdfaust.lib der FaustWasm-Version; siehe Dokumentation unter faustlibraries.grame.fr. */
export const FAUST_MODULE = {
  /* ---------- Quellen ---------- */
  saege: {
    name: 'Sägezahn-Stimme', art: 'quelle', text: 'Bandbegrenzter Sägezahn mit Hüllkurve. os.sawtooth, en.adsr.',
    code: `import("stdfaust.lib");
freq = hslider("Frequenz[unit:Hz]", 110, 20, 5000, 0.1) : si.smoo;
gain = hslider("Pegel", 0.5, 0, 1, 0.01) : si.smoo;
gate = checkbox("Dauerton");
trig = button("Anschlag");
env = en.adsr(0.005, 0.2, 0.7, 0.3, gate + trig);
process = os.sawtooth(freq) * env * gain;`
  },
  fm: {
    name: 'FM-Stimme', art: 'quelle', text: 'Zwei Sinusoszillatoren in Frequenzmodulation. os.osc, en.ar.',
    code: `import("stdfaust.lib");
freq = hslider("Frequenz[unit:Hz]", 220, 20, 5000, 0.1) : si.smoo;
ratio = hslider("Verhältnis", 2, 0.25, 8, 0.01);
index = hslider("Index", 2, 0, 12, 0.01) : si.smoo;
gain = hslider("Pegel", 0.5, 0, 1, 0.01) : si.smoo;
gate = checkbox("Dauerton");
trig = button("Anschlag");
env = en.adsr(0.002, 0.15, 0.6, 0.25, gate + trig);
process = os.osc(freq + os.osc(freq * ratio) * index * freq * env) * env * gain;`
  },
  ks: {
    name: 'Gezupfte Saite', art: 'quelle', text: 'Karplus-Strong-Saite als physikalisches Klangmodell. pm.ks.',
    code: `import("stdfaust.lib");
freq = hslider("Frequenz[unit:Hz]", 196, 40, 1500, 0.1);
daempf = hslider("Dämpfung", 0.25, 0, 1, 0.01);
gain = hslider("Pegel", 0.7, 0, 1, 0.01);
trig = button("Anschlag");
laenge = pm.f2l(freq);
anregung = trig : ba.impulsify : fi.lowpass(2, 6000) * 4;
process = anregung : pm.ks(laenge, daempf) : *(gain);`
  },
  rauschen: {
    name: 'Rosa Rauschen', art: 'quelle', text: 'Rosa Rauschen. no.pink_noise.',
    code: `import("stdfaust.lib");
gain = hslider("Pegel", 0.4, 0, 1, 0.01) : si.smoo;
process = no.pink_noise * gain;`
  },
  /* ---------- Filter ---------- */
  moog: {
    name: 'Moog-Filter', art: 'effekt', text: 'Virtuell analoger Leiterfilter. ve.moog_vcf.',
    code: `import("stdfaust.lib");
fc = hslider("Grenzfrequenz[unit:Hz]", 1200, 40, 12000, 1) : si.smoo;
res = hslider("Resonanz", 0.4, 0, 0.99, 0.001) : si.smoo;
process = ve.moog_vcf(res, fc);`
  },
  korg: {
    name: 'Korg-35-Tiefpass', art: 'effekt', text: 'Virtuell analoger Korg-35-Filter. ve.korg35LPF.',
    code: `import("stdfaust.lib");
fc = hslider("Grenzfrequenz (normiert)", 0.3, 0.01, 0.99, 0.001) : si.smoo;
q = hslider("Güte", 3, 0.5, 10, 0.01) : si.smoo;
process = ve.korg35LPF(fc, q);`
  },
  oberheim: {
    name: 'Oberheim-Filter', art: 'effekt', text: 'Virtuell analoger Multimode-Filter, hier als Tiefpass. ve.oberheimLPF.',
    code: `import("stdfaust.lib");
fc = hslider("Grenzfrequenz (normiert)", 0.3, 0.01, 0.99, 0.001) : si.smoo;
q = hslider("Güte", 3, 0.5, 10, 0.01) : si.smoo;
process = ve.oberheimLPF(fc, q);`
  },
  /* ---------- Effekte ---------- */
  echo: {
    name: 'Echo', art: 'effekt', text: 'Verzögerung mit Rückführung. Digitale Signalverarbeitung, keine Eimerkette. ef.echo.',
    code: `import("stdfaust.lib");
zeit = hslider("Zeit[unit:s]", 0.3, 0.01, 2, 0.001) : si.smoo;
rueck = hslider("Rückführung", 0.45, 0, 0.95, 0.001) : si.smoo;
mix = hslider("Mischung", 0.35, 0, 1, 0.001) : si.smoo;
process = _ <: (*(1 - mix)), (ef.echo(2.1, zeit, rueck) : *(mix)) :> _;`
  },
  hall: {
    name: 'Hall', art: 'effekt', text: 'Faltungsfreier Raumhall. Digitale Signalverarbeitung, keine Hallspirale. re.mono_freeverb.',
    code: `import("stdfaust.lib");
raum = hslider("Raumgröße", 0.7, 0, 1, 0.001);
daempf = hslider("Dämpfung", 0.4, 0, 1, 0.001);
mix = hslider("Mischung", 0.3, 0, 1, 0.001) : si.smoo;
process = _ <: (*(1 - mix)), (re.mono_freeverb(raum, daempf, 0.5, 23) : *(mix)) :> _;`
  },
  flanger: {
    name: 'Flanger', art: 'effekt', text: 'Kammfilter mit moduliertem Abstand. pf.flanger_mono.',
    code: `import("stdfaust.lib");
tiefe = hslider("Tiefe", 0.5, 0, 1, 0.001);
rate = hslider("Rate[unit:Hz]", 0.4, 0.01, 8, 0.001);
rueck = hslider("Rückführung", 0.4, -0.95, 0.95, 0.001);
lfo = (os.osc(rate) + 1) / 2;
process = pf.flanger_mono(512, 8 + lfo * 200 * tiefe, 1, rueck, 1);`
  },
  phaser: {
    name: 'Phaser', art: 'effekt', text: 'Allpasskette mit moduliertem Abstand. pf.phaser2_mono.',
    code: `import("stdfaust.lib");
tiefe = hslider("Tiefe", 1, 0, 1, 0.001);
rate = hslider("Rate[unit:Hz]", 0.5, 0.01, 8, 0.001);
rueck = hslider("Rückführung", 0.4, 0, 0.95, 0.001);
process = pf.phaser2_mono(4, 0, 1000, 400, 1.5, 1500, rate, tiefe, rueck, 1);`
  },
  drive: {
    name: 'Übersteuerung', art: 'effekt', text: 'Kubische Kennlinie als digitaler Effekt, nicht als Schaltung. ef.cubicnl.',
    code: `import("stdfaust.lib");
drive = hslider("Antrieb", 0.4, 0, 1, 0.001) : si.smoo;
offset = hslider("Offset", 0, 0, 1, 0.001) : si.smoo;
process = ef.cubicnl(drive, offset);`
  },
  kompressor: {
    name: 'Kompressor', art: 'effekt', text: 'Dynamikkompressor. co.compressor_mono.',
    code: `import("stdfaust.lib");
ratio = hslider("Verhältnis", 4, 1, 20, 0.1);
schwelle = hslider("Schwelle[unit:dB]", -18, -60, 0, 0.1);
an = hslider("Ansprechzeit[unit:s]", 0.005, 0.0005, 0.2, 0.0001);
ab = hslider("Rücklaufzeit[unit:s]", 0.15, 0.01, 1, 0.001);
process = co.compressor_mono(ratio, schwelle, an, ab);`
  }
};
