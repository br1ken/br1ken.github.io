/* Audiolabor: Zugang zu ngspice für die Seite. Ein Worker, eine Warteschlange, ein Wächter.
   Jeder Lauf bekommt eine Kennung im Netlist-Titel. Das Ergebnis zählt nur, wenn genau dieser Titel zurückkommt;
   so kann nie still ein altes Ergebnis für eine neue Schaltung angezeigt werden. */

const WORKER_URL = new URL('./spice-worker.js?v=2', import.meta.url);

export class SpiceFehler extends Error {
  constructor(text, {info = '', meldungen = [], netlist = '', art = 'fehler'} = {}) {
    super(text);
    this.name = 'SpiceFehler';
    this.info = info;
    this.meldungen = meldungen;
    this.netlist = netlist;
    this.art = art;
  }
}

export class Spice {
  constructor({fristMs = 120000} = {}) {
    this.fristMs = fristMs;
    this.lauf = 0;
    this.kette = Promise.resolve();
    this.offen = new Map();
    this.nachrichtId = 0;
    this.worker = null;
    this.aktiv = null;
    this.startMs = null;
  }

  _worker() {
    if (this.worker) return this.worker;
    const w = new Worker(WORKER_URL, {type: 'module'});
    w.onmessage = ({data}) => {
      const offen = this.offen.get(data.id);
      if (!offen) return;
      this.offen.delete(data.id);
      offen.resolve(data);
    };
    w.onerror = (e) => {
      const grund = e.message || 'Worker konnte nicht starten';
      for (const offen of this.offen.values()) offen.reject(new SpiceFehler(grund));
      this.offen.clear();
      this.worker = null;
    };
    this.worker = w;
    return w;
  }

  _sende(typ, netlist) {
    const id = ++this.nachrichtId;
    return new Promise((resolve, reject) => {
      this.offen.set(id, {resolve, reject});
      this._worker().postMessage({id, typ, netlist});
    });
  }

  /* Lädt und startet ngspice. Gibt die Ladezeit und den Startbericht zurück. */
  async start() {
    const antwort = await this._sende('start');
    this.startMs = antwort.startMs;
    return antwort;
  }

  /* Bricht den laufenden Lauf ab. ngspice lässt sich innerhalb eines Laufs nicht anhalten; der Worker wird beendet und beim nächsten Lauf neu geladen. */
  abbrechen(grund = 'abgebrochen') {
    if (!this.worker) return;
    this.worker.terminate();
    this.worker = null;
    for (const offen of this.offen.values()) offen.reject(new SpiceFehler(grund, {art: grund === 'abgebrochen' ? 'abbruch' : 'frist'}));
    this.offen.clear();
  }

  /* Rechnet eine Netlist. Die erste Zeile (Titel) wird um die Laufkennung ergänzt. */
  rechne(netlist, {fristMs = this.fristMs} = {}) {
    const lauf = ++this.lauf;
    const auftrag = async () => {
      const zeilen = netlist.split('\n');
      const titel = `${(zeilen[0] || '').replace(/^\*\s*/, '').trim() || 'Schaltung'} [Lauf ${lauf}]`;
      zeilen[0] = titel;
      const text = zeilen.join('\n');
      const wache = setTimeout(() => this.abbrechen(`Keine Antwort von ngspice nach ${Math.round(fristMs / 1000)} s`), fristMs);
      let antwort;
      try {
        antwort = await this._sende('lauf', text);
      } catch (e) {
        if (e instanceof SpiceFehler) e.netlist = text;
        throw e;
      } finally {
        clearTimeout(wache);
      }
      if (!antwort.ok) throw new SpiceFehler(antwort.grund, {info: antwort.info, meldungen: antwort.fehler, netlist: text});
      /* ngspice schreibt den Titel klein. */
      const kopf = (antwort.ergebnis?.header || '').toLowerCase();
      if (!kopf.includes(`[lauf ${lauf}]`)) {
        throw new SpiceFehler('ngspice hat für diese Netlist kein Ergebnis geschrieben.', {info: antwort.info, meldungen: antwort.fehler, netlist: text});
      }
      return {...antwort, netlist: text, lauf};
    };
    /* Die Warteschlange läuft weiter, auch wenn ein Lauf scheitert. */
    const ergebnis = this.kette.then(auftrag, auftrag);
    this.kette = ergebnis.catch(() => {});
    return ergebnis;
  }
}

/* Spalte eines Ergebnisses per Name, ohne Rücksicht auf Groß- und Kleinschreibung. */
export function spalte(ergebnis, name) {
  const gesucht = name.toLowerCase();
  return ergebnis.spalten.find(s => s.name.toLowerCase() === gesucht) || null;
}
