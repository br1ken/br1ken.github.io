/* Lexikon: elektrische Größen und Synthesizer & Klang — geöffnet über ⋮ oben rechts, über „?“ im Labor, über [[Begriff]]-Links in Notizen
   oder über #lexikon / #lexikon-<id> in der Adresse. Einträge: unten in GROESSEN (Elektro) bzw. SYNTH ergänzen.

   id      kurzer Schlüssel (für Links: [[Text|id]])
   name    Bezeichnung        sym  Formelzeichen (LaTeX)        cat  Rubrik
   unit    Einheit in Worten  si   Zerlegung in SI-Basiseinheiten (LaTeX)
   formal  Definitionen/Beziehungen (LaTeX, je eine Zeile)
   phys    physikalische Bedeutung (Text, $…$ für Formeln; als R`…`, damit Backslashes erhalten bleiben)
   alias   weitere Suchbegriffe */
'use strict';
const OSCILexikon = (() => {
  const R = String.raw;
  const GROESSEN = [
    // ---------- Grundgrößen ----------
    {id: 'ladung', name: 'Elektrische Ladung', sym: 'Q', cat: 'Grundgrößen', unit: 'Coulomb, C', si: R`1\,\mathrm{C} = 1\,\mathrm{A\,s}`,
      formal: [R`Q = \int_{t_0}^{t_1} i(t)\,\mathrm{d}t`, R`Q = n \cdot e`, R`e = 1{,}602\,176\,634 \cdot 10^{-19}\,\mathrm{C}`],
      phys: R`Eigenschaft von Teilchen, die elektrische Kräfte erfährt und selbst ein elektrisches Feld erzeugt. Es gibt positive und negative Ladung; gleichnamige stoßen sich ab, ungleichnamige ziehen sich an. Ladung ist gequantelt (Vielfaches der Elementarladung $e$) und bleibt in einem abgeschlossenen System erhalten.`,
      alias: ['coulomb', 'elementarladung']},
    {id: 'strom', name: 'Elektrische Stromstärke', sym: 'I', cat: 'Grundgrößen', unit: 'Ampere, A (SI-Basiseinheit)', si: R`1\,\mathrm{A} = 1\,\mathrm{C/s}`,
      formal: [R`i(t) = \frac{\mathrm{d}Q}{\mathrm{d}t}`, R`I = \iint_A \vec{J} \cdot \mathrm{d}\vec{A}`],
      phys: R`Wie viel Ladung pro Zeit durch einen Leiterquerschnitt fließt. Die technische Stromrichtung zeigt von $+$ nach $-$, also entgegen der Bewegung der Elektronen. Seit 2019 ist das Ampere über den festen Wert der Elementarladung definiert.`,
      alias: ['stromstaerke', 'ampere', 'i']},
    {id: 'spannung', name: 'Elektrische Spannung', sym: 'U', cat: 'Grundgrößen', unit: 'Volt, V', si: R`1\,\mathrm{V} = 1\,\frac{\mathrm{W}}{\mathrm{A}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A\,s^3}}`,
      formal: [R`U_{12} = \varphi_1 - \varphi_2 = \int_{1}^{2} \vec{E} \cdot \mathrm{d}\vec{s}`, R`U = \frac{W}{Q}`],
      phys: R`Die Arbeit, die das elektrische Feld an einer Ladung verrichtet, geteilt durch diese Ladung — kurz: Energie pro Ladung zwischen zwei Punkten. Spannung ist immer eine Differenz zweier Potentiale; die Richtung legt der Zählpfeil fest.`,
      alias: ['volt', 'u', 'potentialdifferenz']},
    {id: 'potential', name: 'Elektrisches Potential', sym: R`\varphi`, cat: 'Grundgrößen', unit: 'Volt, V', si: R`1\,\mathrm{V} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A\,s^3}}`,
      formal: [R`\varphi(P) = \varphi(P_0) - \int_{P_0}^{P} \vec{E} \cdot \mathrm{d}\vec{s}`, R`\vec{E} = -\operatorname{grad}\varphi`, R`U_{12} = \varphi_1 - \varphi_2`],
      phys: R`Die „Höhe“ eines Punktes im elektrischen Feld, gemessen gegen einen frei gewählten Bezugspunkt $P_0$ (Masse, $\varphi = 0\,\mathrm{V}$). Absolute Potentiale hängen von dieser Wahl ab, ihre Differenzen — die Spannungen — nicht.`,
      alias: ['phi', 'knotenpotential', 'masse']},
    {id: 'widerstand', name: 'Elektrischer Widerstand', sym: 'R', cat: 'Grundgrößen', unit: 'Ohm, Ω', si: R`1\,\Omega = 1\,\frac{\mathrm{V}}{\mathrm{A}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A^2\,s^3}}`,
      formal: [R`R = \frac{U}{I}`, R`R = \frac{\rho\, l}{A} = \frac{l}{\kappa A}`],
      phys: R`Wie stark ein Bauteil den Stromfluss hemmt. Ein ohmscher Widerstand hat ein konstantes Verhältnis von Spannung zu Strom und wandelt die aufgenommene elektrische Energie vollständig in Wärme um. Er hängt von Material ($\rho$), Länge $l$, Querschnitt $A$ und Temperatur ab.`,
      alias: ['ohm', 'r']},
    {id: 'leitwert', name: 'Elektrischer Leitwert', sym: 'G', cat: 'Grundgrößen', unit: 'Siemens, S', si: R`1\,\mathrm{S} = 1\,\frac{1}{\Omega} = 1\,\frac{\mathrm{A^2\,s^3}}{\mathrm{kg\,m^2}}`,
      formal: [R`G = \frac{1}{R} = \frac{I}{U}`],
      phys: R`Der Kehrwert des Widerstands: wie gut ein Bauteil leitet. Bei Parallelschaltungen addieren sich die Leitwerte, das macht Rechnungen oft einfacher.`,
      alias: ['siemens', 'g']},
    {id: 'leistung', name: 'Elektrische Leistung', sym: 'P', cat: 'Grundgrößen', unit: 'Watt, W', si: R`1\,\mathrm{W} = 1\,\mathrm{V\,A} = 1\,\frac{\mathrm{J}}{\mathrm{s}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{s^3}}`,
      formal: [R`p(t) = u(t)\, i(t)`, R`P = \frac{\mathrm{d}W}{\mathrm{d}t}`, R`P = U I = I^2 R = \frac{U^2}{R} \quad \text{(ohmsch)}`],
      phys: R`Energie pro Zeit. Im Verbraucher-Zählpfeilsystem (Spannung und Strom gleich gerichtet) bedeutet $P > 0$: das Bauteil nimmt Leistung auf; $P < 0$: es gibt Leistung ab, wie eine Quelle.`,
      alias: ['watt', 'p', 'verlustleistung']},
    {id: 'energie', name: 'Elektrische Energie (Arbeit)', sym: 'W', cat: 'Grundgrößen', unit: 'Joule, J', si: R`1\,\mathrm{J} = 1\,\mathrm{W\,s} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{s^2}}`,
      formal: [R`W = \int_{t_0}^{t_1} p(t)\,\mathrm{d}t`, R`W = Q\, U`, R`1\,\mathrm{kWh} = 3{,}6 \cdot 10^{6}\,\mathrm{J}`],
      phys: R`Die über eine Zeitspanne umgesetzte Leistung. Auf der Stromrechnung steht sie in Kilowattstunden.`,
      alias: ['arbeit', 'joule', 'kwh']},
    {id: 'wirkungsgrad', name: 'Wirkungsgrad', sym: R`\eta`, cat: 'Grundgrößen', unit: 'dimensionslos (oft in %)', si: R`[\eta] = 1`,
      formal: [R`\eta = \frac{P_\text{ab}}{P_\text{zu}} = \frac{P_\text{Nutz}}{P_\text{Nutz} + P_\text{Verlust}} \le 1`],
      phys: R`Welcher Anteil der zugeführten Leistung dort ankommt, wo er nützt. Der Rest geht als Verlust verloren, meist als Wärme in Widerständen.`,
      alias: ['eta']},

    // ---------- Felder ----------
    {id: 'e-feld', name: 'Elektrische Feldstärke', sym: R`\vec{E}`, cat: 'Felder', unit: 'Volt pro Meter, V/m', si: R`1\,\frac{\mathrm{V}}{\mathrm{m}} = 1\,\frac{\mathrm{kg\,m}}{\mathrm{A\,s^3}}`,
      formal: [R`\vec{E} = \frac{\vec{F}}{q}`, R`\vec{E} = -\operatorname{grad}\varphi`],
      phys: R`Kraft pro Ladung an einem Ort. Die Feldlinien zeigen von positiver zu negativer Ladung, also vom höheren zum niedrigeren Potential.`,
      alias: ['feldstaerke', 'elektrisches feld', 'e']},
    {id: 'stromdichte', name: 'Stromdichte', sym: R`\vec{J}`, cat: 'Felder', unit: 'Ampere pro Quadratmeter, A/m²', si: R`1\,\frac{\mathrm{A}}{\mathrm{m^2}}`,
      formal: [R`I = \iint_A \vec{J} \cdot \mathrm{d}\vec{A}`, R`\vec{J} = \kappa\, \vec{E} \quad \text{(Ohmsches Gesetz, lokal)}`],
      phys: R`Strom pro Querschnittsfläche und seine Richtung an jedem Ort im Leiter. Zu hohe Stromdichte erwärmt dünne Leiter stark.`,
      alias: ['j']},
    {id: 'leitfaehigkeit', name: 'Spezifischer Widerstand und Leitfähigkeit', sym: R`\rho,\ \kappa`, cat: 'Felder', unit: 'Ω·m bzw. S/m', si: R`[\rho] = 1\,\Omega\,\mathrm{m}, \quad [\kappa] = 1\,\frac{\mathrm{S}}{\mathrm{m}}`,
      formal: [R`\kappa = \frac{1}{\rho}`, R`R = \frac{\rho\, l}{A}`],
      phys: R`Materialeigenschaften: wie gut ein Stoff leitet, unabhängig von der Form. Kupfer hat etwa $\kappa \approx 58 \cdot 10^{6}\,\mathrm{S/m}$.`,
      alias: ['rho', 'kappa', 'spezifischer widerstand']},
    {id: 'b-feld', name: 'Magnetische Flussdichte', sym: R`\vec{B}`, cat: 'Felder', unit: 'Tesla, T', si: R`1\,\mathrm{T} = 1\,\frac{\mathrm{V\,s}}{\mathrm{m^2}} = 1\,\frac{\mathrm{kg}}{\mathrm{A\,s^2}}`,
      formal: [R`\vec{F} = q\, \vec{v} \times \vec{B}`, R`\vec{B} = \mu_0 \mu_r \vec{H}`],
      phys: R`Beschreibt die Kraftwirkung des Magnetfelds auf bewegte Ladungen (Lorentzkraft). Die Kraft steht senkrecht auf Bewegung und Feld.`,
      alias: ['flussdichte', 'tesla', 'b']},
    {id: 'h-feld', name: 'Magnetische Feldstärke', sym: R`\vec{H}`, cat: 'Felder', unit: 'Ampere pro Meter, A/m', si: R`1\,\frac{\mathrm{A}}{\mathrm{m}}`,
      formal: [R`\underbrace{\oint_C \vec{H} \cdot \mathrm{d}\vec{s} = \Theta = \textstyle\sum I}_{\text{Durchflutungsgesetz}}`],
      phys: R`Die „Ursache“ des Magnetfelds: Ströme erzeugen ein Wirbelfeld $\vec{H}$ um sich herum. Wie stark daraus $\vec{B}$ wird, entscheidet das Material über $\mu_r$.`,
      alias: ['durchflutung', 'h']},
    {id: 'fluss', name: 'Magnetischer Fluss', sym: R`\Phi`, cat: 'Felder', unit: 'Weber, Wb', si: R`1\,\mathrm{Wb} = 1\,\mathrm{V\,s} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A\,s^2}}`,
      formal: [R`\Phi = \iint_A \vec{B} \cdot \mathrm{d}\vec{A}`, R`\Psi = N\, \Phi \quad \text{(Spule mit } N \text{ Windungen)}`, R`\oint_C \vec{E} \cdot \mathrm{d}\vec{s} = -\frac{\mathrm{d}}{\mathrm{d}t} \iint_A \vec{B} \cdot \mathrm{d}\vec{A}`],
      phys: R`Wie viel Magnetfeld durch eine Fläche tritt. Ändert sich der Fluss durch eine Leiterschleife, wird darin eine Spannung induziert (Induktionsgesetz) — das Prinzip von Generator und Transformator.`,
      alias: ['weber', 'induktion', 'psi', 'verkettungsfluss']},

    // ---------- Bauelemente ----------
    {id: 'kapazitaet', name: 'Kapazität', sym: 'C', cat: 'Bauelemente', unit: 'Farad, F', si: R`1\,\mathrm{F} = 1\,\frac{\mathrm{C}}{\mathrm{V}} = 1\,\frac{\mathrm{A^2\,s^4}}{\mathrm{kg\,m^2}}`,
      formal: [R`C = \frac{Q}{U}`, R`i_C(t) = C\, \frac{\mathrm{d}u_C}{\mathrm{d}t}`, R`W = \tfrac{1}{2}\, C\, U^2`, R`C = \varepsilon_0 \varepsilon_r \frac{A}{d} \quad \text{(Plattenkondensator)}`],
      phys: R`Wie viel Ladung ein Kondensator pro Volt speichert. Die Energie steckt im elektrischen Feld zwischen den Platten. Die Spannung am Kondensator kann nicht springen, solange der Strom endlich ist.`,
      alias: ['kondensator', 'farad', 'c']},
    {id: 'induktivitaet', name: 'Induktivität', sym: 'L', cat: 'Bauelemente', unit: 'Henry, H', si: R`1\,\mathrm{H} = 1\,\frac{\mathrm{V\,s}}{\mathrm{A}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A^2\,s^2}}`,
      formal: [R`L = \frac{\Psi}{I}`, R`u_L(t) = L\, \frac{\mathrm{d}i_L}{\mathrm{d}t}`, R`W = \tfrac{1}{2}\, L\, I^2`],
      phys: R`Wie stark eine Spule Stromänderungen entgegenwirkt. Die Energie steckt im Magnetfeld. Der Strom durch eine Spule kann nicht springen, solange die Spannung endlich ist.`,
      alias: ['spule', 'henry', 'l']},
    {id: 'zeitkonstante', name: 'Zeitkonstante', sym: R`\tau`, cat: 'Bauelemente', unit: 'Sekunde, s', si: R`[\tau] = 1\,\mathrm{s}`,
      formal: [R`\tau = R\, C \qquad \tau = \frac{L}{R}`, R`u_C(t) = U_0 \left(1 - e^{-t/\tau}\right)`],
      phys: R`Wie schnell ein RC- oder RL-Glied auf einen Sprung reagiert: Nach $\tau$ sind 63 % des Endwerts erreicht, nach $5\tau$ gilt der Vorgang als abgeschlossen.`,
      alias: ['tau']},

    // ---------- Wechselgrößen ----------
    {id: 'frequenz', name: 'Frequenz', sym: 'f', cat: 'Wechselgrößen', unit: 'Hertz, Hz', si: R`1\,\mathrm{Hz} = 1\,\mathrm{s^{-1}}`,
      formal: [R`f = \frac{1}{T}`],
      phys: R`Wie viele Schwingungen pro Sekunde stattfinden. Im Hörbereich bestimmt sie die Tonhöhe; doppelte Frequenz ist eine Oktave höher.`,
      alias: ['hertz', 'f']},
    {id: 'periodendauer', name: 'Periodendauer', sym: 'T', cat: 'Wechselgrößen', unit: 'Sekunde, s', si: R`[T] = 1\,\mathrm{s}`,
      formal: [R`x(t + T) = x(t) \quad \text{für alle } t`, R`T = \frac{1}{f}`],
      phys: R`Die Dauer einer vollständigen Schwingung, nach der sich der Verlauf wiederholt.`,
      alias: ['periode']},
    {id: 'kreisfrequenz', name: 'Kreisfrequenz', sym: R`\omega`, cat: 'Wechselgrößen', unit: '1/s (oft rad/s)', si: R`[\omega] = 1\,\mathrm{s^{-1}}`,
      formal: [R`\omega = 2\pi f = \frac{2\pi}{T}`, R`u(t) = \hat{u} \sin(\omega t + \varphi_u)`],
      phys: R`Der überstrichene Winkel pro Sekunde, wenn man die Schwingung als rotierenden Zeiger denkt. Sie macht Formeln für Wechselstrom kürzer.`,
      alias: ['omega']},
    {id: 'effektivwert', name: 'Effektivwert', sym: R`U_\text{eff},\ I_\text{eff}`, cat: 'Wechselgrößen', unit: 'V bzw. A', si: R`[U_\text{eff}] = 1\,\mathrm{V}`,
      formal: [R`U_\text{eff} = \sqrt{\frac{1}{T} \int_0^T u^2(t)\,\mathrm{d}t}`, R`U_\text{eff} = \frac{\hat{u}}{\sqrt{2}} \quad \text{(Sinus)}`],
      phys: R`Die Gleichspannung, die in einem Widerstand dieselbe Wärme erzeugen würde. „230 V“ an der Steckdose ist ein Effektivwert; die Spitze liegt bei etwa 325 V.`,
      alias: ['rms', 'ueff']},
    {id: 'impedanz', name: 'Impedanz (komplexer Widerstand)', sym: R`\underline{Z}`, cat: 'Wechselgrößen', unit: 'Ohm, Ω', si: R`1\,\Omega`,
      formal: [R`\underline{Z} = \frac{\underline{U}}{\underline{I}} = R + jX`, R`\underline{Z}_R = R, \quad \underline{Z}_L = j\omega L, \quad \underline{Z}_C = \frac{1}{j\omega C}`],
      phys: R`Der Widerstand bei sinusförmigem Wechselstrom: Betrag (wie stark) und Phase (wie weit Strom und Spannung gegeneinander verschoben sind). Spulen und Kondensatoren werden dadurch frequenzabhängig.`,
      alias: ['z', 'blindwiderstand', 'reaktanz']},

    // ---------- Netzwerke ----------
    {id: 'ohmsches-gesetz', name: 'Ohmsches Gesetz', sym: R`U = R\,I`, cat: 'Netzwerke', unit: '—', si: R`1\,\mathrm{V} = 1\,\Omega \cdot 1\,\mathrm{A}`,
      formal: [R`U = R\, I`, R`\vec{J} = \kappa\, \vec{E} \quad \text{(lokale Form)}`],
      phys: R`Bei einem ohmschen Bauteil ist der Strom proportional zur Spannung. Gilt für Metalle bei konstanter Temperatur, nicht für Dioden oder Lampen im Allgemeinen.`,
      alias: ['ohm-gesetz']},
    {id: 'knotenregel', name: 'Knotenregel (1. Kirchhoffsches Gesetz)', sym: R`\sum I = 0`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`\sum_{k} I_k = 0`, R`\text{zufließend } +, \quad \text{abfließend } -`],
      phys: R`In einem Knoten kann sich keine Ladung ansammeln: Was hineinfließt, fließt auch wieder heraus. Folgt aus der Ladungserhaltung.`,
      alias: ['kirchhoff', 'knoten', 'kcl']},
    {id: 'maschenregel', name: 'Maschenregel (2. Kirchhoffsches Gesetz)', sym: R`\sum U = 0`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`\sum_{k} U_k = 0 \quad \text{(Umlauf in einer Masche)}`],
      phys: R`Wer einmal im Kreis läuft, kommt am selben Potential an — die Spannungen entlang einer geschlossenen Masche heben sich auf. Gilt, solange sich kein magnetischer Fluss durch die Masche ändert.`,
      alias: ['masche', 'kvl']},
    {id: 'reihe-parallel', name: 'Reihen- und Parallelschaltung', sym: R`R_1 \parallel R_2`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`R_\text{Reihe} = R_1 + R_2`, R`R_1 \parallel R_2 = \frac{R_1 R_2}{R_1 + R_2}`, R`G_\text{parallel} = G_1 + G_2`],
      phys: R`In Reihe fließt derselbe Strom, die Spannungen teilen sich auf. Parallel liegt dieselbe Spannung an, die Ströme teilen sich auf. Eine Parallelschaltung ist immer kleiner als ihr kleinster Widerstand.`,
      alias: ['parallelschaltung', 'reihenschaltung', 'serienschaltung']},
    {id: 'spannungsteiler', name: 'Spannungsteiler', sym: R`\frac{R_2}{R_1 + R_2}`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`U_2 = U \cdot \frac{R_2}{R_1 + R_2} \quad \text{(unbelastet)}`],
      phys: R`Zwei Widerstände in Reihe teilen eine Spannung im Verhältnis ihrer Werte. Sobald eine Last parallel zu $R_2$ hängt, sinkt $U_2$.`,
      alias: ['teiler']},
    {id: 'ersatzquelle', name: 'Ersatzspannungsquelle (Thévenin)', sym: R`U_0,\ R_i`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`U_0 = U_{\text{Leerlauf}}, \qquad R_i = \frac{U_0}{I_k}`, R`I_L = \frac{U_0}{R_i + R_L}`],
      phys: R`Jedes lineare Netzwerk verhält sich an zwei Klemmen wie eine ideale Quelle $U_0$ mit Innenwiderstand $R_i$. $R_i$ bestimmt man, indem man ideale Spannungsquellen kurzschließt, ideale Stromquellen auftrennt und den Widerstand zwischen den Klemmen berechnet.`,
      alias: ['thevenin', 'innenwiderstand', 'leerlaufspannung', 'kurzschlussstrom', 'zweipol']},
    {id: 'leistungsanpassung', name: 'Leistungsanpassung', sym: R`R_L = R_i`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`R_L = R_i \;\Rightarrow\; P_{L,\max} = \frac{U_0^2}{4 R_i}`, R`\eta_\text{Ersatzquelle} = 50\,\%`],
      phys: R`Die Last bekommt die größtmögliche Leistung, wenn sie so groß ist wie der Innenwiderstand. Das maximiert die Leistung an der Last, nicht den Wirkungsgrad — in der echten Schaltung kann er deutlich unter 50 % liegen.`,
      alias: ['anpassung', 'maximale leistung']}
  ];
  /* ---------- Zweiter Teil: Synthesizer & Klang (lab = wo man es im Crashtest-Labor ausprobiert) ---------- */
  const SYNTH = [
    // Klang
    {id: 'oszillator', name: 'Oszillator (VCO)', sym: R`\sim`, cat: 'Klang', unit: 'Frequenz in Hz',
      formal: [R`x(t) = \hat{x}\,\sin(2\pi f t + \varphi)`, R`T = \frac{1}{f}`],
      phys: R`Die Klangquelle jedes Synthesizers: eine Schaltung oder ein Programm, das periodisch schwingt. In analogen Synthesizern ist er spannungsgesteuert — VCO, „Voltage Controlled Oscillator“: Eine Steuerspannung legt die Frequenz fest.`,
      lab: 'Baustein „∿ Oszillator“. Mit ×2 / ÷2 springst du Oktaven, oben wählst du die Wellenform.', alias: ['vco', 'tongenerator']},
    {id: 'wellenformen', name: 'Wellenformen', sym: R`\sim\ \wedge\ \sqcap`, cat: 'Klang', unit: 'Sinus, Dreieck, Sägezahn, Rechteck',
      formal: [R`\underbrace{x(t) = \tfrac{4}{\pi}\textstyle\sum_{k = 1, 3, 5, \dots} \tfrac{1}{k}\sin(2\pi k f t)}_{\text{Rechteck}}`, R`\underbrace{x(t) = \tfrac{2}{\pi}\textstyle\sum_{k=1}^{\infty} \tfrac{(-1)^{k+1}}{k}\sin(2\pi k f t)}_{\text{Sägezahn}}`, R`\underbrace{x(t) = \tfrac{8}{\pi^2}\textstyle\sum_{k = 1, 3, 5, \dots} \tfrac{(-1)^{(k-1)/2}}{k^2}\sin(2\pi k f t)}_{\text{Dreieck}}`],
      phys: R`Die Form einer Schwingung bestimmt, welche Obertöne darin stecken. Sinus: nur der Grundton, rein und weich. Dreieck: ungerade Obertöne, die schnell leiser werden ($1/k^2$). Rechteck: ungerade Obertöne mit $1/k$ — hohl. Sägezahn: alle Obertöne mit $1/k$ — hell und scharf.`,
      lab: 'Wellenform-Schalter am Oszillator und am Sequencer. Schau dabei aufs Oszilloskop.', alias: ['sinus', 'dreieck', 'saegezahn', 'rechteck', 'fourier']},
    {id: 'obertoene', name: 'Obertöne & Klangfarbe', sym: R`k \, f_0`, cat: 'Klang', unit: 'Vielfache des Grundtons',
      formal: [R`x(t) = \sum_{k=1}^{\infty} a_k \sin(2\pi k f_0 t + \varphi_k)`],
      phys: R`Jeder periodische Klang lässt sich als Summe von Sinustönen schreiben (Fourier-Reihe): dem Grundton $f_0$ und seinen Vielfachen. Wie laut die einzelnen Obertöne sind, hören wir als Klangfarbe — darum klingen Geige und Flöte beim selben Ton verschieden.`,
      lab: 'Sägezahn durch einen Tiefpass schicken: Die Obertöne verschwinden, der Grundton bleibt.', alias: ['harmonische', 'spektrum', 'timbre', 'klangfarbe']},
    {id: 'tonhoehe', name: 'Tonhöhe, Oktave, Halbton', sym: R`f(n)`, cat: 'Klang', unit: 'Hz bzw. Notenname',
      formal: [R`f_\text{Oktave} = 2 \cdot f`, R`f_\text{Halbton} = \sqrt[12]{2} \cdot f \approx 1{,}0595 \cdot f`, R`f(n) = 440\,\mathrm{Hz} \cdot 2^{(n - 69)/12}`, R`n = \text{MIDI-Notennummer}`],
      phys: R`Wir hören Tonhöhen logarithmisch: Gleiche Verhältnisse klingen wie gleiche Abstände. Eine Oktave ist eine Verdopplung der Frequenz, in der gleichstufigen Stimmung aufgeteilt in zwölf gleich große Halbtonschritte. Der Stimmton A4 liegt bei 440 Hz.`,
      lab: 'Der Oszillator zeigt zur Frequenz den Notennamen. ×2 ist genau eine Oktave.', alias: ['oktave', 'halbton', 'midi', 'stimmton', 'note']},
    {id: 'intervalle', name: 'Intervalle & Quinte', sym: R`3 : 2`, cat: 'Klang', unit: 'Frequenzverhältnisse',
      formal: [R`\text{Oktave } 2 : 1, \quad \text{Quinte } 3 : 2`, R`\text{Quarte } 4 : 3, \quad \text{große Terz } 5 : 4`],
      phys: R`Zwei Töne klingen besonders ruhig zusammen, wenn ihre Frequenzen in einem Verhältnis kleiner ganzer Zahlen stehen: Dann wiederholt sich das gemeinsame Schwingungsmuster schnell. Die Quinte (3 : 2) ist nach der Oktave das einfachste — Powerchords auf der E-Gitarre bestehen genau daraus.`,
      lab: 'Mission „Zweistimmig“: zwei Oszillatoren am selben Sequencer, einer auf 220 Hz, einer auf 330 Hz.', alias: ['quinte', 'terz', 'quarte', 'akkord', 'powerchord']},
    {id: 'pentatonik', name: 'Tonleiter & Pentatonik', sym: R`5`, cat: 'Klang', unit: 'Töne pro Oktave',
      formal: [R`\text{Dur-Pentatonik (C): } \mathrm{C,\ D,\ E,\ G,\ A}`, R`\text{Moll-Pentatonik (A): } \mathrm{A,\ C,\ D,\ E,\ G}`],
      phys: R`Eine Tonleiter wählt aus den zwölf Halbtönen einer Oktave einige aus. Die Pentatonik nimmt nur fünf und lässt die Halbtonschritte weg — dadurch reiben sich fast keine Töne aneinander. Sie steckt in Volksliedern, Blues und Rock auf der ganzen Welt.`,
      lab: 'Alle Zeilen im Sequencer-Raster gehören zu einer Pentatonik — umschaltbar zwischen Dur und Moll.', alias: ['tonleiter', 'skala', 'dur', 'moll']},
    {id: 'schwebung', name: 'Schwebung', sym: R`|f_1 - f_2|`, cat: 'Klang', unit: 'Hz',
      formal: [R`\begin{aligned} &\sin(2\pi f_1 t) + \sin(2\pi f_2 t) \\ &= 2\cos\!\big(\pi (f_1 - f_2) t\big)\,\sin\!\big(\pi (f_1 + f_2) t\big) \end{aligned}`, R`f_\text{Schwebung} = |f_1 - f_2|`],
      phys: R`Zwei fast gleich hohe Töne verstärken und schwächen sich abwechselnd. Man hört einen Ton in der Mitte, dessen Lautstärke mit der Differenzfrequenz pulsiert. So stimmen Musiker ihre Instrumente: Verschwindet das Wabern, sind beide gleich hoch.`,
      lab: 'Starter „Schwebung“ oder Mission „Wabern“: zwei Oszillatoren mit 220 und 223 Hz.', alias: ['wabern', 'interferenz']},
    // Filter & Effekte
    {id: 'filter', name: 'Filter (VCF)', sym: R`|H(f)|`, cat: 'Filter & Effekte', unit: 'Grenzfrequenz in Hz',
      formal: [R`\underbrace{|H(f)| = \frac{1}{\sqrt{1 + (f/f_c)^2}}}_{\text{Tiefpass 1. Ordnung}}`, R`\underbrace{-6\,\mathrm{dB/Oktave} = -20\,\mathrm{dB/Dekade}}_{\text{Flankensteilheit}}`],
      phys: R`Ein Filter lässt manche Frequenzen durch und dämpft andere. Tiefpass: nur das Tiefe. Hochpass: nur das Hohe. Bandpass: ein Bereich in der Mitte. Je höher die Ordnung, desto steiler die Flanke. In Synthesizern formt der Filter (VCF) den Klang mehr als alles andere.`,
      lab: 'Tiefpass (C), Spule (L) und Hochpass (CR) sind Filter erster Ordnung.', alias: ['vcf', 'grenzfrequenz', 'bandpass']},
    {id: 'tiefpass', name: 'Tiefpass (RC)', sym: R`\text{TP}`, cat: 'Filter & Effekte', unit: 'Hz',
      formal: [R`\underline{H}(j\omega) = \frac{1}{1 + j\omega RC}`, R`f_c = \frac{1}{2\pi RC}`],
      phys: R`Ein Widerstand in Serie, ein Kondensator gegen Masse. Für hohe Frequenzen ist der Kondensator fast ein Kurzschluss — sie werden abgeleitet. Klanglich: dumpfer, wärmer, weiter weg.`,
      lab: 'Baustein „C Tiefpass“. Die ausführliche Herleitung steht in der Notiz zum RC-Tiefpass.', alias: ['lowpass', 'rc-filter']},
    {id: 'hochpass', name: 'Hochpass (CR)', sym: R`\text{HP}`, cat: 'Filter & Effekte', unit: 'Hz',
      formal: [R`\underline{H}(j\omega) = \frac{j\omega RC}{1 + j\omega RC}`, R`|H(f)| = \frac{1}{\sqrt{1 + (f_c/f)^2}}`],
      phys: R`Der Kondensator sitzt in Serie, der Widerstand gegen Masse. Tiefe Frequenzen sieht der Kondensator als großen Widerstand — sie kommen kaum durch. Klanglich: dünn, wie aus einem Telefon. In Lautsprecherboxen trennt so ein Filter die Höhen für den Hochtöner ab.`,
      lab: 'Baustein „CR Hochpass“ und Mission „Nur die Höhen“.', alias: ['highpass', 'cr-filter']},
    {id: 'resonanz', name: 'Resonanz & Güte', sym: R`Q`, cat: 'Filter & Effekte', unit: 'Güte Q (dimensionslos)',
      formal: [R`f_0 = \frac{1}{2\pi\sqrt{LC}}`, R`Q = \frac{f_0}{\Delta f}`],
      phys: R`Ein Schwingkreis aus L und C hat eine Eigenfrequenz $f_0$, bei der er besonders stark reagiert. Synthesizer-Filter lassen sich so einstellen, dass sie rund um die Grenzfrequenz eine Spitze bekommen — das typische „Quietschen“ und „Wah“. Je höher die Güte $Q$, desto schmaler und höher die Spitze.`,
      lab: 'Noch nicht im Labor: Die Filter dort sind erster Ordnung und haben keine Resonanzspitze.', alias: ['schwingkreis', 'guete', 'q-faktor']},
    {id: 'echo', name: 'Echo & Delay', sym: R`\Delta t`, cat: 'Filter & Effekte', unit: 'Verzögerung in ms, Rückkopplung in %',
      formal: [R`y(t) = x(t) + g \cdot y(t - \Delta t)`, R`\text{Echo } n \text{ hat die Lautstärke } g^n`],
      phys: R`Das Signal wird gespeichert und nach $\Delta t$ noch einmal abgespielt. Mit Rückkopplung $g$ läuft jedes Echo erneut in den Speicher: Es entstehen immer leisere Wiederholungen $g, g^2, g^3, \dots$ — eine geometrische Reihe, die nur für $g < 1$ abklingt.`,
      lab: 'Baustein „Δt Echo“. Stell Δt auf einen Sequencer-Schritt (60 s / 2 / BPM), dann groovt das Echo mit.', alias: ['delay', 'verzoegerung', 'rueckkopplung', 'feedback']},
    {id: 'hall', name: 'Hall (Reverb)', sym: R`T_{60}`, cat: 'Filter & Effekte', unit: 'Nachhallzeit in s',
      formal: [R`T_{60}: \ \text{Pegel fällt um } 60\,\mathrm{dB}`],
      phys: R`In einem Raum erreicht uns der Schall nicht nur direkt, sondern über tausende Reflexionen an Wänden, Decke und Boden — so dicht, dass man sie nicht mehr einzeln hört. Kleine Räume haben kurzen Hall, Kirchen mehrere Sekunden.`,
      lab: 'Noch nicht im Labor. Ein Echo mit kurzer Zeit und viel Rückkopplung kommt dem schon nahe.', alias: ['reverb', 'nachhall']},
    {id: 'verzerrung', name: 'Verzerrung & Clipping', sym: R`\tanh(kx)`, cat: 'Filter & Effekte', unit: 'Übersteuerung k',
      formal: [R`\underbrace{y = \frac{\tanh(k\,x)}{\tanh(k)}}_{\text{weiche Begrenzung}}`, R`\underbrace{y = \max(-1, \min(1, k\,x))}_{\text{harte Begrenzung}}`],
      phys: R`Wird ein Signal größer, als eine Schaltung verarbeiten kann, wird es abgeschnitten (Clipping). Dioden ab etwa $0{,}7\,\mathrm{V}$, Röhren oder Transistoren begrenzen weich. Dabei entstehen neue Obertöne — der Klang von E-Gitarren-Verzerrern.`,
      lab: 'Baustein „⊣⊢ Verzerrer“ und Mission „Crashtest“: aus dem Sinus wird fast ein Rechteck.', alias: ['distortion', 'clipping', 'overdrive', 'waveshaper']},
    {id: 'tremolo', name: 'Tremolo (Amplitudenmodulation)', sym: R`\text{AM}`, cat: 'Filter & Effekte', unit: 'Tempo in Hz, Tiefe in %',
      formal: [R`y(t) = x(t)\left(1 - \tfrac{d}{2} + \tfrac{d}{2}\sin(2\pi f_m t)\right)`],
      phys: R`Ein langsamer Oszillator bewegt die Lautstärke auf und ab — die Tonhöhe bleibt. Dasselbe Prinzip trägt beim AM-Radio die Sprache auf einer Trägerfrequenz um eine Million Hertz.`,
      lab: 'Baustein „↝ Tremolo“ und Mission „Puls fühlen“.', alias: ['am', 'amplitudenmodulation']},
    {id: 'vibrato', name: 'Vibrato (Frequenzmodulation)', sym: R`\text{FM}`, cat: 'Filter & Effekte', unit: 'Tempo in Hz, Tiefe in Halbtönen',
      formal: [R`f(t) = f_0 \cdot \left(1 + m \sin(2\pi f_m t)\right)`],
      phys: R`Wie Tremolo, nur wackelt die Tonhöhe statt der Lautstärke — so wie Sänger einen langen Ton beleben. Wird die Modulation sehr schnell (hörbar), entsteht FM-Synthese: der Klang vieler Synthesizer der 80er.`,
      lab: 'Noch nicht im Labor.', alias: ['fm', 'frequenzmodulation']},
    {id: 'pegel', name: 'Pegel & Dezibel', sym: R`\mathrm{dB}`, cat: 'Filter & Effekte', unit: 'Dezibel (logarithmisch)',
      formal: [R`L = 20 \cdot \log_{10}\!\left(\frac{U}{U_0}\right)\,\mathrm{dB}`, R`\times 2 \text{ Spannung} \approx +6\,\mathrm{dB}`, R`\times 10 \text{ Spannung} = +20\,\mathrm{dB}`],
      phys: R`Unser Gehör empfindet Lautstärke logarithmisch. Dezibel zählen deshalb Verhältnisse statt Differenzen: Jede Verdopplung der Spannung sind rund 6 dB mehr, egal wie laut es vorher war.`,
      lab: 'Der Pegelregler im Labor und der Widerstand (Spannungsteiler) verändern den Pegel.', alias: ['dezibel', 'db', 'lautstaerke']},
    {id: 'limiter', name: 'Limiter & Kompressor', sym: R`\text{Ratio}`, cat: 'Filter & Effekte', unit: 'Schwelle in dB, Verhältnis',
      formal: [R`\text{oberhalb der Schwelle: } \Delta L_\text{aus} = \frac{\Delta L_\text{ein}}{\text{Ratio}}`],
      phys: R`Ein Kompressor macht laute Stellen leiser, sobald sie eine Schwelle überschreiten. Bei sehr großem Verhältnis heißt er Limiter: Er lässt praktisch nichts mehr darüber. Das schützt Lautsprecher und Ohren.`,
      lab: 'Im Ausgang des Labors sitzt ein Limiter (Schwelle −12 dB, Verhältnis 12 : 1).', alias: ['kompressor', 'compressor', 'dynamik']},
    // Steuerung
    {id: 'sequencer', name: 'Sequencer', sym: R`\text{Step}`, cat: 'Steuerung', unit: 'Schritte, Tempo in BPM',
      formal: [R`t_\text{Schritt} = \frac{60\,\mathrm{s}}{2 \cdot \mathrm{BPM}} \quad \text{(Achtelnoten)}`],
      phys: R`Ein Taktgeber mit Gedächtnis: Er geht Schritt für Schritt durch ein Muster und sagt bei jedem Schritt, welche Töne klingen sollen. Seit den 1960ern Herzstück elektronischer Musik.`,
      lab: 'Baustein „♪︎ Sequencer“: Spalten sind Schritte, Zeilen Tonhöhen. Er kann auch Oszillatoren spielen.', alias: ['step-sequencer', 'pattern']},
    {id: 'tempo', name: 'Tempo (BPM)', sym: R`\mathrm{BPM}`, cat: 'Steuerung', unit: 'Schläge pro Minute',
      formal: [R`T_\text{Schlag} = \frac{60\,\mathrm{s}}{\mathrm{BPM}}`, R`f_\text{Schlag} = \frac{\mathrm{BPM}}{60}\,\mathrm{Hz}`],
      phys: R`Beats per Minute. 120 BPM sind zwei Schläge pro Sekunde, also 2 Hz. Ruhige Lieder liegen um 70 BPM, Pop um 120, Techno um 130 und mehr.`,
      lab: 'Tempo-Regler am Sequencer (60 bis 200 BPM).', alias: ['bpm', 'beat']},
    {id: 'huellkurve', name: 'Hüllkurve (ADSR)', sym: R`\text{ADSR}`, cat: 'Steuerung', unit: 'Zeiten in ms, Sustain-Pegel',
      formal: [R`\text{Attack} \to \text{Decay} \to \text{Sustain} \to \text{Release}`],
      phys: R`Wie ein Ton beginnt und endet: Attack (Anstieg), Decay (Abfall auf das Haltelevel), Sustain (halten, solange die Taste gedrückt ist), Release (Ausklingen). Ein Klavier hat einen schnellen Attack und lässt sofort nach, eine Orgel hält gleichmäßig.`,
      lab: 'Jede Sequencer-Note hat eine kurze Hüllkurve: etwa 8 ms Anstieg, danach exponentielles Abklingen.', alias: ['adsr', 'envelope', 'attack', 'release']},
    {id: 'lfo', name: 'LFO', sym: R`f_\text{LFO}`, cat: 'Steuerung', unit: 'Hz',
      formal: [R`p(t) = p_0 + \Delta p \cdot \sin(2\pi f_\text{LFO}\, t)`],
      phys: R`Low Frequency Oscillator: ein Oszillator, der so langsam schwingt, dass man ihn nicht als Ton hört. Er bewegt stattdessen andere Parameter — Lautstärke (Tremolo), Tonhöhe (Vibrato) oder die Grenzfrequenz eines Filters (Wah).`,
      lab: 'Im Tremolo steckt ein LFO, der die Lautstärke bewegt.', alias: ['low-frequency-oscillator', 'modulation']},
    {id: 'cv-gate', name: 'CV & Gate', sym: R`1\,\mathrm{V/Okt}`, cat: 'Steuerung', unit: 'Steuerspannungen in V',
      formal: [R`f = f_0 \cdot 2^{\,U_\text{CV} / 1\,\mathrm{V}}`, R`U_\text{Gate} > 0 \;\Rightarrow\; \text{Note an}`, R`U_\text{Gate} = 0 \;\Rightarrow\; \text{Note aus}`],
      phys: R`In modularen Synthesizern reden die Module über Spannungen. CV (Control Voltage) stellt die Tonhöhe ein, oft nach der Regel „1 Volt pro Oktave“. Das Gate sagt, wann eine Note an ist. Ein Sequencer gibt beides aus.`,
      lab: 'Ein gestricheltes Steuerkabel vom Sequencer in den SEQ-Eingang eines Oszillators überträgt genau das: Tonhöhe und An/Aus.', alias: ['cv', 'gate', 'steuerspannung', 'volt-pro-oktave']},
    {id: 'modular', name: 'Modularsynthesizer', sym: R`\text{VCx}`, cat: 'Steuerung', unit: 'Module + Patchkabel',
      formal: [R`\underbrace{\text{VCO}}_{\text{Ton}} \to \underbrace{\text{VCF}}_{\text{Klang}} \to \underbrace{\text{VCA}}_{\text{Lautstärke}}`],
      phys: R`Ein Synthesizer aus einzelnen Modulen, die man mit Patchkabeln frei verbindet: Oszillatoren, Filter, Verstärker, Hüllkurven, Sequencer. Die klassische Kette heißt subtraktive Synthese: ein obertonreicher Ton, aus dem ein Filter etwas wegnimmt.`,
      lab: 'Das freie Pult funktioniert genau so — Bausteine stecken, Kabel ziehen.', alias: ['patchkabel', 'eurorack', 'subtraktive-synthese', 'vca', 'synthesizer']},
    // Digital
    {id: 'abtastrate', name: 'Abtastrate & Nyquist', sym: R`f_s`, cat: 'Digital', unit: 'Hz (meist 44,1 oder 48 kHz)',
      formal: [R`f_\text{max} < \frac{f_s}{2} \quad \text{(Nyquist-Shannon)}`],
      phys: R`Digitaler Klang besteht aus Messwerten in festen Zeitabständen. Um eine Frequenz eindeutig darzustellen, braucht man mehr als zwei Messpunkte pro Schwingung. Bei 48 kHz geht das bis knapp 24 kHz — genug, denn wir hören bis etwa 20 kHz.`,
      lab: 'Das Labor rechnet mit der Abtastrate deines Geräts, meist 44,1 oder 48 kHz.', alias: ['samplerate', 'sampling', 'nyquist', 'shannon']},
    {id: 'aliasing', name: 'Aliasing', sym: R`|f - k f_s|`, cat: 'Digital', unit: 'Hz',
      formal: [R`f_\text{Alias} = |f - k \cdot f_s| \quad (k \in \mathbb{Z})`],
      phys: R`Liegt eine Frequenz über der halben Abtastrate, taucht sie als falsche, tiefere Frequenz wieder auf — wie Wagenräder im Film, die sich scheinbar rückwärts drehen. Darum werden Signale vor dem Digitalisieren tiefpassgefiltert.`,
      lab: 'Der Verzerrer rechnet intern mit vierfacher Überabtastung, damit kaum Aliasing entsteht.', alias: ['spiegelfrequenz', 'oversampling']},
    {id: 'bilinear', name: 'Bilineare Transformation', sym: R`s \mapsto z`, cat: 'Digital', unit: 'analog → digital',
      formal: [R`s = \frac{2}{T}\cdot\frac{z - 1}{z + 1}`, R`\text{Vorverzerrung: } \omega_a = \frac{2}{T}\tan\!\left(\frac{\omega_d T}{2}\right)`],
      phys: R`Ein Rezept, um ein analoges Filter (RC, RL) in ein digitales umzurechnen. Weil dabei die Frequenzachse verbogen wird, verzerrt man die gewünschte Grenzfrequenz vorher passend — dann stimmt sie im digitalen Filter genau.`,
      lab: 'So rechnen Tiefpass, Spule und Hochpass im Labor.', alias: ['tustin', 'iir', 'digitales-filter']},
    {id: 'oszilloskop', name: 'Oszilloskop', sym: R`u(t)`, cat: 'Digital', unit: 'Spannung über Zeit',
      formal: [R`\text{Trigger: Start bei } u = 0, \ \dot{u} > 0`],
      phys: R`Ein Messgerät, das den Spannungsverlauf über der Zeit zeichnet. Der Trigger sorgt dafür, dass jedes Bild an derselben Stelle der Schwingung beginnt — dann steht die Kurve still, statt durchzulaufen.`,
      lab: 'Oszilloskop unten im Labor und das kleine in der Play-Leiste.', alias: ['scope', 'trigger']},
    {id: 'web-audio', name: 'Web Audio', sym: R`\text{Node}`, cat: 'Digital', unit: 'Browser-Schnittstelle',
      formal: [R`\text{Quelle} \to \text{Node} \to \dots \to \text{Ausgang}`],
      phys: R`Eine Programmierschnittstelle in jedem modernen Browser: Man baut einen Graphen aus Audio-Knoten — Oszillatoren, Filter, Verzögerungen, Verstärker — und der Browser rechnet daraus in Echtzeit Klang.`,
      lab: 'Jeder Baustein im Labor ist ein kleiner Web-Audio-Graph.', alias: ['webaudio', 'audiocontext']}
  ];
  const SETS = {
    elektro: {title: 'Elektrische Größen', items: GROESSEN, placeholder: 'Suchen: Spannung, Ohm, τ …', foot: 'Formal = Definition bzw. Beziehung in Formeln · Physikalisch = was die Größe bedeutet · Einheit zerlegt in SI-Basiseinheiten.'},
    synth: {title: 'Synth & Klang', items: SYNTH, placeholder: 'Suchen: Filter, Hüllkurve, CV …', foot: 'Formal = Beziehung in Formeln · Was dahintersteckt = die Idee in Worten · Im Labor = wo du es selbst ausprobierst.'}
  };
  const ALL = [...GROESSEN, ...SYNTH];
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const norm = (t) => String(t).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  /* Text mit $…$ → Formel-Spans */
  const textMath = (t) => esc(t).replace(/\$([^$]+)\$/g, (_, tex) => `<span class="math math-inline">${tex}</span>`);
  const catsOf = items => ['Alle', ...new Set(items.map(g => g.cat))];

  let root = null, list = null, search = null, chips = null, tabs = null, cat = 'Alle', tab = 'elektro', lastFocus = null;
  function build() {
    root = document.createElement('div');
    root.className = 'lex';
    root.hidden = true;
    root.innerHTML = `<div class="lex-backdrop" data-lex-close></div>
      <section class="lex-panel" role="dialog" aria-modal="true" aria-labelledby="lex-title">
        <header class="lex-head"><div><span class="eyebrow">Nachschlagen</span><h2 id="lex-title">Lexikon</h2></div><button type="button" class="lex-close" data-lex-close aria-label="Lexikon schließen">×</button></header>
        <div class="lex-tabs" role="tablist">${Object.entries(SETS).map(([k, v]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="false">${v.title}<small>${v.items.length}</small></button>`).join('')}</div>
        <input class="lex-search" type="search" aria-label="Im Lexikon suchen">
        <div class="lex-chips" role="group" aria-label="Rubrik"></div>
        <div class="lex-list"></div>
        <p class="lex-foot"></p>
      </section>`;
    document.body.append(root);
    list = root.querySelector('.lex-list'); search = root.querySelector('.lex-search'); chips = root.querySelector('.lex-chips'); tabs = root.querySelector('.lex-tabs');
    root.addEventListener('click', e => {
      if (e.target.closest('[data-lex-close]')) close();
      const c = e.target.closest('[data-cat]');
      if (c) { cat = c.dataset.cat; render(); }
      const t = e.target.closest('[data-tab]');
      if (t && t.dataset.tab !== tab) { tab = t.dataset.tab; cat = 'Alle'; search.value = ''; render(); list.scrollTop = 0; }
    });
    search.addEventListener('input', render);
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key === 'Tab') { // Fokus im Dialog halten
        const f = [...root.querySelectorAll('button, input, summary, a[href]')].filter(el => el.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    list.addEventListener('toggle', e => { if (e.target.open) OSCI.loadKatex().then(() => typeset(e.target)).catch(() => {}); }, true);
  }
  function entry(g) {
    return `<details class="lex-entry" id="lex-${g.id}" data-id="${g.id}">
      <summary><span class="lex-sym"><span class="math math-inline">${g.sym}</span></span><span class="lex-name">${esc(g.name)}<small>${g.unit === '—' ? esc(g.cat) : esc(g.unit)}</small></span></summary>
      <div class="lex-body">
        <h4>Formal</h4>${g.formal.map(f => `<div class="math math-display">${f}</div>`).join('')}
        <h4>${tab === 'synth' ? 'Was dahintersteckt' : 'Physikalisch'}</h4><p>${textMath(g.phys)}</p>
        ${g.si ? `<h4>Einheit</h4><div class="math math-display lex-unit">${g.si}</div>` : ''}
        ${g.lab ? `<h4>Im Labor</h4><p class="lex-lab">${textMath(g.lab)}${location.pathname.includes('/labor/') ? '' : ` <a href="${OSCI.url('labor/')}">Zum Labor ↗︎</a>`}</p>` : ''}
      </div></details>`;
  }
  function matches(g, q) {
    if (cat !== 'Alle' && g.cat !== cat) return false;
    if (!q) return true;
    const hay = norm([g.id, g.name, g.unit, g.sym, ...(g.alias || [])].join(' '));
    return norm(q).split('-').filter(Boolean).every(w => hay.includes(w));
  }
  function render() {
    const set = SETS[tab], cats = catsOf(set.items), q = search.value.trim();
    tabs.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    search.placeholder = set.placeholder;
    root.querySelector('.lex-foot').textContent = set.foot;
    chips.innerHTML = cats.map(c => `<button type="button" class="tag" data-cat="${c}" aria-pressed="${c === cat}">${c}</button>`).join('');
    const shown = set.items.filter(g => matches(g, q));
    const byCat = cats.slice(1).map(c => [c, shown.filter(g => g.cat === c)]).filter(([, gs]) => gs.length);
    const other = tab === 'synth' ? 'elektro' : 'synth', elsewhere = q ? SETS[other].items.filter(g => matches({...g, cat: 'Alle'}, q)).length : 0;
    list.innerHTML = byCat.length ? byCat.map(([c, gs]) => `<h3 class="lex-cat">${c}</h3>${gs.map(entry).join('')}`).join('')
      : `<p class="lex-empty">Nichts gefunden.${elsewhere ? ` Unter <button type="button" class="lex-switch" data-tab="${other}">${SETS[other].title}</button> gibt es ${elsewhere} Treffer.` : ' Probier ein anderes Wort oder ein Formelzeichen.'}</p>`;
    OSCI.loadKatex().then(() => { list.querySelectorAll('summary .math').forEach(el => typeOne(el)); fitSyms(); }).catch(() => {});
  }
  function typeOne(el) {
    if (el.dataset.done) return;
    const tex = el.textContent;
    el.dataset.done = '1';
    try { window.katex.render(tex, el, {displayMode: el.classList.contains('math-display'), throwOnError: false, strict: 'ignore'}); } catch { el.textContent = tex; }
  }
  /* Formelzeichen, die breiter als ihre Spalte sind, passend verkleinern statt abschneiden */
  function fitSyms() {
    list.querySelectorAll('.lex-sym').forEach(s => { s.style.fontSize = ''; if (s.scrollWidth > s.clientWidth) s.style.fontSize = `${Math.max(9, 16 * s.clientWidth / s.scrollWidth - .5)}px`; });
  }
  function typeset(scope) { scope.querySelectorAll('.math').forEach(typeOne); }
  function find(id) {
    if (!id) return null;
    const key = norm(id);
    return ALL.find(g => g.id === key) || ALL.find(g => norm(g.name) === key || (g.alias || []).some(a => norm(a) === key)) || ALL.find(g => norm(g.name).includes(key));
  }
  /* open('synth') bzw. open('elektro') öffnet einen Reiter, sonst einen Eintrag (aus beiden Teilen) */
  function open(id) {
    if (!root) build();
    lastFocus = document.activeElement;
    const target = SETS[id] ? null : find(id);
    if (SETS[id]) { tab = id; cat = 'Alle'; search.value = ''; }
    else if (target) { tab = SYNTH.includes(target) ? 'synth' : 'elektro'; cat = 'Alle'; search.value = ''; }
    else if (!id) tab = location.pathname.includes('/labor/') ? 'synth' : tab;
    render();
    root.hidden = false;
    document.documentElement.classList.add('lex-open');
    requestAnimationFrame(() => root.classList.add('is-open'));
    if (target) {
      const el = list.querySelector(`#lex-${target.id}`);
      el.open = true;
      requestAnimationFrame(() => { el.scrollIntoView({block: 'start'}); el.querySelector('summary').focus({preventScroll: true}); });
    } else { list.scrollTop = 0; search.focus({preventScroll: true}); }
  }
  function close() {
    if (!root || root.hidden) return;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('lex-open');
    setTimeout(() => { root.hidden = true; }, 200);
    if (/^#lexikon/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    lastFocus?.focus?.({preventScroll: true});
  }
  return {open, close, eintraege: ALL};
})();
