/* Audiolabor: Halbleitermodelle mit Herkunft.
   art: 'hersteller'  Parameter unverändert aus der Herstellerdatei
        'generisch'   eigene runde Werte, kein reales Bauteil
        'naeherung'   eigenes Makromodell aus typischen Datenblattwerten
   Die Herstellerparameter sind nicht gegen echte Bauteile nachgemessen. */

const NEXPERIA = 'https://assets.nexperia.com/documents/spice-model/';

export const DIODEN = {
  '1N4148': {
    name: '1N4148', art: 'hersteller', version: 'Nexperia, Datei ohne Datumsangabe', quelle: NEXPERIA + '1N4148.txt',
    text: 'Schnelle Siliziumdiode. Herstellermodell mit dem Parallelwiderstand aus der Datei.',
    karte: {IS: 4.352e-9, N: 1.906, BV: 110, IBV: 1e-4, RS: 0.6458, CJO: 7.048e-13, VJ: 0.869, M: 0.03, FC: 0.5, TT: 3.48e-9}, rp: 5.827e9
  },
  BAT85: {
    name: 'BAT85', art: 'hersteller', version: 'Nexperia, Datei ohne Datumsangabe', quelle: NEXPERIA + 'BAT85.txt',
    text: 'Schottky-Diode mit kleiner Flussspannung. Herstellermodell.',
    karte: {IS: 2.076e-7, N: 1.023, BV: 33, IBV: 1e-5, RS: 2.326, CJO: 1.21e-11, VJ: 0.1319, M: 0.2904, EG: 0.69, XTI: 2}, rp: 5.416e7
  },
  SI: {
    name: 'Si generisch', kurz: 'Si', art: 'generisch', version: 'osci-audiolabor 1', quelle: '',
    text: 'Generische Siliziumdiode nach der Shockley-Gleichung mit kleiner Sperrschichtkapazität. Kein reales Bauteil.',
    karte: {IS: 1e-14, N: 1, RS: 0.1, CJO: 2e-12, TT: 5e-9}
  },
  LED: {
    name: 'LED rot generisch', art: 'generisch', version: 'osci-audiolabor 1', quelle: '',
    text: 'Generische rote LED, etwa 1,8 V bei 10 mA. Kein reales Bauteil.',
    karte: {IS: 1e-18, N: 1.9, RS: 2, CJO: 1e-11}
  }
};

/* Z-Diode: die Durchbruchspannung ist ein Wert des Bauteils, kein fester Typ. */
export function zenerModell(uz) {
  return {
    name: `Z ${uz} V generisch`, art: 'generisch', version: 'osci-audiolabor 1', quelle: '',
    text: 'Generische Z-Diode nach dem SPICE-Diodenmodell mit Durchbruch. Kein reales Bauteil.',
    karte: {IS: 1e-14, N: 1, RS: 5, BV: uz, IBV: 1e-3, CJO: 1e-11}
  };
}

/* zusatz: was die Herstellerdatei neben dem Haupttransistor enthält. ngspice rechnet es mit;
   der Live-Löser rechnet nur den Haupttransistor mit Fläche 1 und festem Basiswiderstand. */
export const BIPOLAR = {
  'NPN-GEN': {
    name: 'NPN generisch', kurz: 'NPN', pol: 'NPN', art: 'generisch', version: 'osci-audiolabor 1', quelle: '',
    text: 'Generischer NPN (Gummel-Poon mit Early-Effekt und kleinen Kapazitäten). Kein BC547 und kein anderes reales Bauteil.',
    karte: {IS: 1e-14, BF: 200, BR: 5, VAF: 100, CJE: 1e-11, CJC: 5e-12, TF: 5e-10}
  },
  'PNP-GEN': {
    name: 'PNP generisch', kurz: 'PNP', pol: 'PNP', art: 'generisch', version: 'osci-audiolabor 1', quelle: '',
    text: 'Generischer PNP (Gummel-Poon mit Early-Effekt und kleinen Kapazitäten). Kein reales Bauteil.',
    karte: {IS: 1e-14, BF: 200, BR: 5, VAF: 100, CJE: 1e-11, CJC: 5e-12, TF: 5e-10}
  },
  BC847B: {
    name: 'BC847B', pol: 'NPN', art: 'hersteller', version: 'Nexperia, Extraktion 24/2021', quelle: NEXPERIA + 'BC847B.txt',
    text: 'Herstellermodell des BC847B. Das ist die SMD-Ausführung derselben Familie wie der BC547B, aber nicht dessen eigenes Modell.',
    karte: {IS: 1.124e-14, NF: 0.9872, ISE: 2.566e-15, NE: 1.661, BF: 281.7, IKF: 0.09455, VAF: 36.27, NR: 0.9859, ISC: 7.015e-18, NC: 0.9228, BR: 7.047, IKR: 0.8167, VAR: 16.61, RB: 150, IRB: 0.0008356, RBM: 0.8289, RE: 0.804, RC: 0.2454, XTB: 1.382, EG: 1.11, XTI: 7.452, CJE: 1.264e-11, VJE: 0.7056, MJE: 0.3401, TF: 6.258e-10, XTF: 25, VTF: 2, ITF: 0.277, PTF: 0, CJC: 3.624e-12, VJC: 0.5036, MJC: 0.365, XCJC: 1, TR: 1.55e-7, CJS: 0, VJS: 0.75, MJS: 0.333, FC: 0.78},
    /* In der Datei hängt der Emitter von Q2 an einem sonst unbenutzten Knoten 33. Das bleibt hier wie veröffentlicht. */
    zusatz: {flaeche1: 0.8636, flaeche2: 0.1364, rq: 324.8, q2EmitterOffen: true, diode: {IS: 1.365e-15, N: 0.988, BV: 1000, IBV: 0.001, RS: 2163, CJO: 0, VJ: 1, M: 0.5, FC: 0, TT: 0, EG: 1.11, XTI: 3}}
  },
  BC857B: {
    name: 'BC857B', pol: 'PNP', art: 'hersteller', version: 'Nexperia, Extraktion 19/2020', quelle: NEXPERIA + 'BC857B.txt',
    text: 'Herstellermodell des BC857B. Das ist die SMD-Ausführung derselben Familie wie der BC557B, aber nicht dessen eigenes Modell.',
    karte: {IS: 1.95e-14, NF: 1.022, ISE: 1.253e-14, NE: 1.577, BF: 297.2, IKF: 0.0831, VAF: 41.13, NR: 1.021, ISC: 1.791e-16, NC: 1.183, BR: 10.02, IKR: 0.02503, VAR: 16.61, RB: 220, IRB: 2.5e-5, RBM: 0.9, RE: 1.045, RC: 0.2657, XTB: 1.28, EG: 1.11, XTI: 2.944, CJE: 1.095e-11, VJE: 0.6608, MJE: 0.375, TF: 1.2e-9, XTF: 3, VTF: 3.813, ITF: 0.1208, PTF: 0, CJC: 5.88e-12, VJC: 0.5428, MJC: 0.39, XCJC: 0.459, TR: 8.8e-8, CJS: 0, VJS: 0.75, MJS: 0.333, FC: 0.9501},
    zusatz: {flaeche1: 0.9607, flaeche2: 0.03929, rq: 561.1, q2EmitterOffen: false, diode: {IS: 7.703e-15, N: 1.146, BV: 1000, IBV: 0.001, RS: 2.826e4, CJO: 0, VJ: 1, M: 0.5, FC: 0, TT: 0, EG: 1.11, XTI: 3}}
  },
  PMBT3904: {
    name: 'PMBT3904', pol: 'NPN', art: 'hersteller', version: 'Nexperia, Extraktion 25/2014', quelle: NEXPERIA + 'PMBT3904.txt',
    text: 'Herstellermodell des PMBT3904, der SMD-Ausführung des 2N3904.',
    karte: {IS: 2.612e-15, NF: 1.005, ISE: 2.958e-15, NE: 1.533, BF: 169, IKF: 0.08351, VAF: 53.92, NR: 0.9982, ISC: 3.177e-16, NC: 1.094, BR: 2.107, IKR: 0.5, VAR: 100, RB: 114, IRB: 0.001, RBM: 6.2, RE: 0.04181, RC: 0.9576, XTB: 1.522, EG: 1.11, XTI: 4.633, CJE: 1.032e-11, VJE: 0.6333, MJE: 0.2056, TF: 3.55e-10, XTF: 10, VTF: 2, ITF: 0.3, PTF: 0, CJC: 3.181e-12, VJC: 0.8831, MJC: 0.3242, XCJC: 1, TR: 1.45e-7, CJS: 0, VJS: 0.75, MJS: 0.333, FC: 0.78},
    zusatz: {diode: {IS: 1.82e-13, N: 1.042, BV: 1000, IBV: 0.001, RS: 380.9, CJO: 0, VJ: 1, M: 0.5, FC: 0, TT: 0, EG: 1.11, XTI: 3}}
  }
};

export const MOSFET = {
  'NMOS-GEN': {
    name: 'N-MOSFET generisch', kurz: 'N-MOS', pol: 'NMOS', art: 'generisch', version: 'osci-audiolabor 1', quelle: '',
    text: 'Quadratisches Modell (SPICE Level 1), Größenordnung eines kleinen Schalt-MOSFET. Kein reales Bauteil.',
    karte: {LEVEL: 1, VTO: 2.1, KP: 0.1, LAMBDA: 0.02}
  },
  'PMOS-GEN': {
    name: 'P-MOSFET generisch', kurz: 'P-MOS', pol: 'PMOS', art: 'generisch', version: 'osci-audiolabor 1', quelle: '',
    text: 'Quadratisches Modell (SPICE Level 1), spiegelbildlich zum N-Typ. Kein reales Bauteil.',
    karte: {LEVEL: 1, VTO: -2.1, KP: 0.05, LAMBDA: 0.02}
  }
};

/* Operationsverstärker als Makromodell: Eingangsstufe mit begrenztem Strom (Slew Rate), ein Pol, Ausgang mit Innenwiderstand,
   Ausgangshub durch die Spannung an den Versorgungspins begrenzt. Die Eckdaten stehen hier, die Schaltung in bauteile.js. */
export const OPV = {
  IDEAL: {
    name: 'OPV idealisiert', kurz: 'ideal', art: 'naeherung', version: 'osci-audiolabor 1', quelle: '',
    text: 'Fast ideal: sehr hohe Verstärkung, große Bandbreite, Hub bis an die Versorgung. Die Versorgungspins müssen trotzdem angeschlossen sein. Kein reales Bauteil.',
    a0: 1e6, gbw: 1e7, sr: 1e9, rin: 1e12, rout: 1, hubPlus: 0, hubMinus: 0
  },
  TL07X: {
    name: 'TL07x Näherung', kurz: 'TL07x', art: 'naeherung', version: 'osci-audiolabor 1, typische Werte aus TI SLOS080', quelle: 'https://www.ti.com/lit/ds/symlink/tl072.pdf',
    text: 'Eigenes Makromodell mit typischen Datenblattwerten (Verstärkung 200 V/mV, 3 MHz, 13 V/µs, 1 TΩ, Hub rund 1,5 V unter der Versorgung bei 10 kΩ Last). Kein Herstellermodell: Rauschen, Offset, Eingangsstrom und Strombegrenzung fehlen.',
    a0: 2e5, gbw: 3e6, sr: 13e6, rin: 1e12, rout: 75, hubPlus: 1.5, hubMinus: 1.5
  }
};

/* Schmitt-Trigger-Inverter: Schwellen und Ausgangswiderstand aus den typischen Werten des Datenblatts.
   VP ≈ 0,59·VDD und VN ≈ 0,385·VDD passen zu 2,9 / 1,9 V bei 5 V, 5,9 / 3,9 V bei 10 V und 8,8 / 5,8 V bei 15 V. */
export const SCHMITT = {
  CD40106: {
    name: 'CD40106 Näherung', art: 'naeherung', version: 'osci-audiolabor 1, typische Werte aus TI SCHS097F', quelle: 'https://www.ti.com/lit/ds/symlink/cd40106b.pdf',
    text: 'Verhaltensmodell eines Gatters: Schwellen proportional zur Versorgung, fester Ausgangswiderstand, kein Transistormodell. Das XSPICE-Digitalmodell steht in diesem ngspice nicht zur Verfügung.',
    vp: 0.59, vn: 0.385, rout: 300, tp: 70e-9, schaerfe: 2000
  }
};

export const VT_27C = 8.617333262e-5 * 300.15; /* kT/q bei 27 °C, wie ngspice */
