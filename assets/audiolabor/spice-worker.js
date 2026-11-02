/* Audiolabor: ngspice (eecircuit-engine) im eigenen Worker, damit eine lange Berechnung die Oberfläche nicht anhält.
   Der Worker bekommt eine Netlist und gibt das Ergebnis samt ngspice-Ausgabe zurück.
   Zwei Eigenheiten der Version 1.9.0 werden hier abgefangen:
   - Scheitert ein Lauf, bleibt die alte Datei out.raw im virtuellen Dateisystem liegen. Deshalb wird sie vor jedem Lauf
     gelöscht, und der Aufrufer vergleicht den Titel im Ergebnis mit dem Titel seiner Netlist.
   - Ohne lesbare out.raw löst runSim() nie auf. Das fängt der Wächter in spice.js ab: Er beendet den Worker nach einer Frist. */
import { Simulation } from '../vendor/eecircuit-engine/eecircuit-engine.mjs';

const sim = new Simulation();
let bereit = null;

/* Die Ergebnisarrays werden hier in Float64Array umgepackt: spart Speicher und lässt sich ohne Kopie übergeben. */
function verpacke(result) {
  const spalten = [], transfer = [];
  for (const d of result.data) {
    if (result.dataType === 'complex') {
      const n = d.values.length, re = new Float64Array(n), im = new Float64Array(n);
      for (let i = 0; i < n; i++) { const c = d.values[i]; re[i] = c.real; im[i] = c.img; }
      spalten.push({name: d.name, type: d.type, re, im});
      transfer.push(re.buffer, im.buffer);
    } else {
      const v = Float64Array.from(d.values);
      spalten.push({name: d.name, type: d.type, values: v});
      transfer.push(v.buffer);
    }
  }
  return {
    ergebnis: {header: result.header, numPoints: result.numPoints, numVariables: result.numVariables, dataType: result.dataType, spalten},
    transfer
  };
}

function loescheAltesErgebnis() {
  const mod = sim.__getSpiceModuleForTests?.();
  try { mod?.FS?.unlink('out.raw'); } catch { /* gab noch keine */ }
}

/* Scheitert ein Lauf (kein Arbeitspunkt, Syntaxfehler), wartet die Engine schon wieder auf den nächsten Auftrag,
   während das Ergebnis des aktuellen nie kommt. Solange ngspice rechnet, laufen hier keine Zeitgeber; meldet sich dieser
   also und die Engine ist untätig, ist der Lauf vorbei. Die beiden Felder sind intern, passen aber zur festgelegten Version 1.9.0. */
function laufOhneErgebnis() {
  return new Promise(resolve => {
    const wache = setInterval(() => {
      if (!sim.runPromiseResolve) { clearInterval(wache); return; }
      if (sim.continuePromiseResolve) {
        clearInterval(wache);
        sim.runPromiseResolve = null;
        resolve(null);
      }
    }, 20);
  });
}

self.onmessage = async ({data}) => {
  const {id, typ, netlist} = data;
  try {
    if (!bereit) {
      const t0 = performance.now();
      bereit = sim.start().then(() => performance.now() - t0);
    }
    const startMs = await bereit;
    if (typ === 'start') {
      self.postMessage({id, ok: true, startMs, info: sim.getInitInfo()});
      return;
    }
    loescheAltesErgebnis();
    sim.setNetList(netlist);
    const t0 = performance.now();
    const result = await Promise.race([sim.runSim(), laufOhneErgebnis()]);
    const rechenMs = performance.now() - t0;
    if (!result) {
      self.postMessage({id, ok: false, grund: 'ngspice hat den Lauf ohne Ergebnis beendet.', info: sim.getInfo(), fehler: sim.getError()});
      return;
    }
    const {ergebnis, transfer} = verpacke(result);
    self.postMessage({id, ok: true, rechenMs, ergebnis, info: sim.getInfo(), fehler: sim.getError()}, transfer);
  } catch (e) {
    self.postMessage({id, ok: false, grund: String(e?.message || e), info: sim.getInfo(), fehler: sim.getError()});
  }
};
