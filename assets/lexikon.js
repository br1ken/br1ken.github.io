/* Lexikon der elektrischen Größen — geöffnet über ⋮ oben rechts, über [[Begriff]]-Links in Notizen
   oder über #lexikon / #lexikon-<id> in der Adresse. Einträge: unten in GROESSEN ergänzen.

   id      kurzer Schlüssel (für Links: [[Text|id]])
   name    Bezeichnung        sym  Formelzeichen (LaTeX)        cat  Rubrik
   unit    Einheit in Worten  si   Zerlegung in SI-Basiseinheiten (LaTeX)
   formal  Definitionen/Beziehungen (LaTeX, je eine Zeile)
   phys    physikalische Bedeutung (Text, $…$ für Formeln)
   alias   weitere Suchbegriffe */
'use strict';
const OSCILexikon = (() => {
  const R = String.raw;
  const GROESSEN = [
    // ---------- Grundgrößen ----------
    {id: 'ladung', name: 'Elektrische Ladung', sym: 'Q', cat: 'Grundgrößen', unit: 'Coulomb, C', si: R`1\,\mathrm{C} = 1\,\mathrm{A\,s}`,
      formal: [R`Q = \int_{t_0}^{t_1} i(t)\,\mathrm{d}t`, R`Q = n \cdot e, \qquad e = 1{,}602\,176\,634 \cdot 10^{-19}\,\mathrm{C}`],
      phys: 'Eigenschaft von Teilchen, die elektrische Kräfte erfährt und selbst ein elektrisches Feld erzeugt. Es gibt positive und negative Ladung; gleichnamige stoßen sich ab, ungleichnamige ziehen sich an. Ladung ist gequantelt (Vielfaches der Elementarladung $e$) und bleibt in einem abgeschlossenen System erhalten.',
      alias: ['coulomb', 'elementarladung']},
    {id: 'strom', name: 'Elektrische Stromstärke', sym: 'I', cat: 'Grundgrößen', unit: 'Ampere, A (SI-Basiseinheit)', si: R`1\,\mathrm{A} = 1\,\mathrm{C/s}`,
      formal: [R`i(t) = \frac{\mathrm{d}Q}{\mathrm{d}t}`, R`I = \iint_A \vec{J} \cdot \mathrm{d}\vec{A}`],
      phys: 'Wie viel Ladung pro Zeit durch einen Leiterquerschnitt fließt. Die technische Stromrichtung zeigt von $+$ nach $-$, also entgegen der Bewegung der Elektronen. Seit 2019 ist das Ampere über den festen Wert der Elementarladung definiert.',
      alias: ['stromstaerke', 'ampere', 'i']},
    {id: 'spannung', name: 'Elektrische Spannung', sym: 'U', cat: 'Grundgrößen', unit: 'Volt, V', si: R`1\,\mathrm{V} = 1\,\frac{\mathrm{W}}{\mathrm{A}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A\,s^3}}`,
      formal: [R`U_{12} = \varphi_1 - \varphi_2 = \int_{1}^{2} \vec{E} \cdot \mathrm{d}\vec{s}`, R`U = \frac{W}{Q}`],
      phys: 'Die Arbeit, die das elektrische Feld an einer Ladung verrichtet, geteilt durch diese Ladung — kurz: Energie pro Ladung zwischen zwei Punkten. Spannung ist immer eine Differenz zweier Potentiale; die Richtung legt der Zählpfeil fest.',
      alias: ['volt', 'u', 'potentialdifferenz']},
    {id: 'potential', name: 'Elektrisches Potential', sym: R`\varphi`, cat: 'Grundgrößen', unit: 'Volt, V', si: R`1\,\mathrm{V} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A\,s^3}}`,
      formal: [R`\varphi(P) = \varphi(P_0) - \int_{P_0}^{P} \vec{E} \cdot \mathrm{d}\vec{s}`, R`\vec{E} = -\operatorname{grad}\varphi`, R`U_{12} = \varphi_1 - \varphi_2`],
      phys: 'Die „Höhe“ eines Punktes im elektrischen Feld, gemessen gegen einen frei gewählten Bezugspunkt $P_0$ (Masse, $\varphi = 0\,\mathrm{V}$). Absolute Potentiale hängen von dieser Wahl ab, ihre Differenzen — die Spannungen — nicht.',
      alias: ['phi', 'knotenpotential', 'masse']},
    {id: 'widerstand', name: 'Elektrischer Widerstand', sym: 'R', cat: 'Grundgrößen', unit: 'Ohm, Ω', si: R`1\,\Omega = 1\,\frac{\mathrm{V}}{\mathrm{A}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A^2\,s^3}}`,
      formal: [R`R = \frac{U}{I}`, R`R = \frac{\rho\, l}{A} = \frac{l}{\kappa A}`],
      phys: 'Wie stark ein Bauteil den Stromfluss hemmt. Ein ohmscher Widerstand hat ein konstantes Verhältnis von Spannung zu Strom und wandelt die aufgenommene elektrische Energie vollständig in Wärme um. Er hängt von Material ($\rho$), Länge $l$, Querschnitt $A$ und Temperatur ab.',
      alias: ['ohm', 'r']},
    {id: 'leitwert', name: 'Elektrischer Leitwert', sym: 'G', cat: 'Grundgrößen', unit: 'Siemens, S', si: R`1\,\mathrm{S} = 1\,\frac{1}{\Omega} = 1\,\frac{\mathrm{A^2\,s^3}}{\mathrm{kg\,m^2}}`,
      formal: [R`G = \frac{1}{R} = \frac{I}{U}`],
      phys: 'Der Kehrwert des Widerstands: wie gut ein Bauteil leitet. Bei Parallelschaltungen addieren sich die Leitwerte, das macht Rechnungen oft einfacher.',
      alias: ['siemens', 'g']},
    {id: 'leistung', name: 'Elektrische Leistung', sym: 'P', cat: 'Grundgrößen', unit: 'Watt, W', si: R`1\,\mathrm{W} = 1\,\mathrm{V\,A} = 1\,\frac{\mathrm{J}}{\mathrm{s}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{s^3}}`,
      formal: [R`p(t) = u(t)\, i(t)`, R`P = \frac{\mathrm{d}W}{\mathrm{d}t}`, R`P = U I = I^2 R = \frac{U^2}{R} \quad \text{(ohmsch)}`],
      phys: 'Energie pro Zeit. Im Verbraucher-Zählpfeilsystem (Spannung und Strom gleich gerichtet) bedeutet $P > 0$: das Bauteil nimmt Leistung auf; $P < 0$: es gibt Leistung ab, wie eine Quelle.',
      alias: ['watt', 'p', 'verlustleistung']},
    {id: 'energie', name: 'Elektrische Energie (Arbeit)', sym: 'W', cat: 'Grundgrößen', unit: 'Joule, J', si: R`1\,\mathrm{J} = 1\,\mathrm{W\,s} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{s^2}}`,
      formal: [R`W = \int_{t_0}^{t_1} p(t)\,\mathrm{d}t`, R`W = Q\, U`, R`1\,\mathrm{kWh} = 3{,}6 \cdot 10^{6}\,\mathrm{J}`],
      phys: 'Die über eine Zeitspanne umgesetzte Leistung. Auf der Stromrechnung steht sie in Kilowattstunden.',
      alias: ['arbeit', 'joule', 'kwh']},
    {id: 'wirkungsgrad', name: 'Wirkungsgrad', sym: R`\eta`, cat: 'Grundgrößen', unit: 'dimensionslos (oft in %)', si: R`[\eta] = 1`,
      formal: [R`\eta = \frac{P_\text{ab}}{P_\text{zu}} = \frac{P_\text{Nutz}}{P_\text{Nutz} + P_\text{Verlust}} \le 1`],
      phys: 'Welcher Anteil der zugeführten Leistung dort ankommt, wo er nützt. Der Rest geht als Verlust verloren, meist als Wärme in Widerständen.',
      alias: ['eta']},

    // ---------- Felder ----------
    {id: 'e-feld', name: 'Elektrische Feldstärke', sym: R`\vec{E}`, cat: 'Felder', unit: 'Volt pro Meter, V/m', si: R`1\,\frac{\mathrm{V}}{\mathrm{m}} = 1\,\frac{\mathrm{kg\,m}}{\mathrm{A\,s^3}}`,
      formal: [R`\vec{E} = \frac{\vec{F}}{q}`, R`\vec{E} = -\operatorname{grad}\varphi`],
      phys: 'Kraft pro Ladung an einem Ort. Die Feldlinien zeigen von positiver zu negativer Ladung, also vom höheren zum niedrigeren Potential.',
      alias: ['feldstaerke', 'elektrisches feld', 'e']},
    {id: 'stromdichte', name: 'Stromdichte', sym: R`\vec{J}`, cat: 'Felder', unit: 'Ampere pro Quadratmeter, A/m²', si: R`1\,\frac{\mathrm{A}}{\mathrm{m^2}}`,
      formal: [R`I = \iint_A \vec{J} \cdot \mathrm{d}\vec{A}`, R`\vec{J} = \kappa\, \vec{E} \quad \text{(Ohmsches Gesetz, lokal)}`],
      phys: 'Strom pro Querschnittsfläche und seine Richtung an jedem Ort im Leiter. Zu hohe Stromdichte erwärmt dünne Leiter stark.',
      alias: ['j']},
    {id: 'leitfaehigkeit', name: 'Spezifischer Widerstand und Leitfähigkeit', sym: R`\rho,\ \kappa`, cat: 'Felder', unit: 'Ω·m bzw. S/m', si: R`[\rho] = 1\,\Omega\,\mathrm{m}, \quad [\kappa] = 1\,\frac{\mathrm{S}}{\mathrm{m}}`,
      formal: [R`\kappa = \frac{1}{\rho}`, R`R = \frac{\rho\, l}{A}`],
      phys: 'Materialeigenschaften: wie gut ein Stoff leitet, unabhängig von der Form. Kupfer hat etwa $\kappa \approx 58 \cdot 10^{6}\,\mathrm{S/m}$.',
      alias: ['rho', 'kappa', 'spezifischer widerstand']},
    {id: 'b-feld', name: 'Magnetische Flussdichte', sym: R`\vec{B}`, cat: 'Felder', unit: 'Tesla, T', si: R`1\,\mathrm{T} = 1\,\frac{\mathrm{V\,s}}{\mathrm{m^2}} = 1\,\frac{\mathrm{kg}}{\mathrm{A\,s^2}}`,
      formal: [R`\vec{F} = q\, \vec{v} \times \vec{B}`, R`\vec{B} = \mu_0 \mu_r \vec{H}`],
      phys: 'Beschreibt die Kraftwirkung des Magnetfelds auf bewegte Ladungen (Lorentzkraft). Die Kraft steht senkrecht auf Bewegung und Feld.',
      alias: ['flussdichte', 'tesla', 'b']},
    {id: 'h-feld', name: 'Magnetische Feldstärke', sym: R`\vec{H}`, cat: 'Felder', unit: 'Ampere pro Meter, A/m', si: R`1\,\frac{\mathrm{A}}{\mathrm{m}}`,
      formal: [R`\oint_C \vec{H} \cdot \mathrm{d}\vec{s} = \Theta = \sum I \quad \text{(Durchflutungsgesetz)}`],
      phys: 'Die „Ursache“ des Magnetfelds: Ströme erzeugen ein Wirbelfeld $\vec{H}$ um sich herum. Wie stark daraus $\vec{B}$ wird, entscheidet das Material über $\mu_r$.',
      alias: ['durchflutung', 'h']},
    {id: 'fluss', name: 'Magnetischer Fluss', sym: R`\Phi`, cat: 'Felder', unit: 'Weber, Wb', si: R`1\,\mathrm{Wb} = 1\,\mathrm{V\,s} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A\,s^2}}`,
      formal: [R`\Phi = \iint_A \vec{B} \cdot \mathrm{d}\vec{A}`, R`\Psi = N\, \Phi \quad \text{(Spule mit } N \text{ Windungen)}`, R`\oint_C \vec{E} \cdot \mathrm{d}\vec{s} = -\frac{\mathrm{d}}{\mathrm{d}t} \iint_A \vec{B} \cdot \mathrm{d}\vec{A}`],
      phys: 'Wie viel Magnetfeld durch eine Fläche tritt. Ändert sich der Fluss durch eine Leiterschleife, wird darin eine Spannung induziert (Induktionsgesetz) — das Prinzip von Generator und Transformator.',
      alias: ['weber', 'induktion', 'psi', 'verkettungsfluss']},

    // ---------- Bauelemente ----------
    {id: 'kapazitaet', name: 'Kapazität', sym: 'C', cat: 'Bauelemente', unit: 'Farad, F', si: R`1\,\mathrm{F} = 1\,\frac{\mathrm{C}}{\mathrm{V}} = 1\,\frac{\mathrm{A^2\,s^4}}{\mathrm{kg\,m^2}}`,
      formal: [R`C = \frac{Q}{U}`, R`i_C(t) = C\, \frac{\mathrm{d}u_C}{\mathrm{d}t}`, R`W = \tfrac{1}{2}\, C\, U^2`, R`C = \varepsilon_0 \varepsilon_r \frac{A}{d} \quad \text{(Plattenkondensator)}`],
      phys: 'Wie viel Ladung ein Kondensator pro Volt speichert. Die Energie steckt im elektrischen Feld zwischen den Platten. Die Spannung am Kondensator kann nicht springen, solange der Strom endlich ist.',
      alias: ['kondensator', 'farad', 'c']},
    {id: 'induktivitaet', name: 'Induktivität', sym: 'L', cat: 'Bauelemente', unit: 'Henry, H', si: R`1\,\mathrm{H} = 1\,\frac{\mathrm{V\,s}}{\mathrm{A}} = 1\,\frac{\mathrm{kg\,m^2}}{\mathrm{A^2\,s^2}}`,
      formal: [R`L = \frac{\Psi}{I}`, R`u_L(t) = L\, \frac{\mathrm{d}i_L}{\mathrm{d}t}`, R`W = \tfrac{1}{2}\, L\, I^2`],
      phys: 'Wie stark eine Spule Stromänderungen entgegenwirkt. Die Energie steckt im Magnetfeld. Der Strom durch eine Spule kann nicht springen, solange die Spannung endlich ist.',
      alias: ['spule', 'henry', 'l']},
    {id: 'zeitkonstante', name: 'Zeitkonstante', sym: R`\tau`, cat: 'Bauelemente', unit: 'Sekunde, s', si: R`[\tau] = 1\,\mathrm{s}`,
      formal: [R`\tau = R\, C \qquad \tau = \frac{L}{R}`, R`u_C(t) = U_0 \left(1 - e^{-t/\tau}\right)`],
      phys: 'Wie schnell ein RC- oder RL-Glied auf einen Sprung reagiert: Nach $\tau$ sind 63 % des Endwerts erreicht, nach $5\tau$ gilt der Vorgang als abgeschlossen.',
      alias: ['tau']},

    // ---------- Wechselgrößen ----------
    {id: 'frequenz', name: 'Frequenz', sym: 'f', cat: 'Wechselgrößen', unit: 'Hertz, Hz', si: R`1\,\mathrm{Hz} = 1\,\mathrm{s^{-1}}`,
      formal: [R`f = \frac{1}{T}`],
      phys: 'Wie viele Schwingungen pro Sekunde stattfinden. Im Hörbereich bestimmt sie die Tonhöhe; doppelte Frequenz ist eine Oktave höher.',
      alias: ['hertz', 'f']},
    {id: 'periodendauer', name: 'Periodendauer', sym: 'T', cat: 'Wechselgrößen', unit: 'Sekunde, s', si: R`[T] = 1\,\mathrm{s}`,
      formal: [R`x(t + T) = x(t) \quad \text{für alle } t`, R`T = \frac{1}{f}`],
      phys: 'Die Dauer einer vollständigen Schwingung, nach der sich der Verlauf wiederholt.',
      alias: ['periode']},
    {id: 'kreisfrequenz', name: 'Kreisfrequenz', sym: R`\omega`, cat: 'Wechselgrößen', unit: '1/s (oft rad/s)', si: R`[\omega] = 1\,\mathrm{s^{-1}}`,
      formal: [R`\omega = 2\pi f = \frac{2\pi}{T}`, R`u(t) = \hat{u} \sin(\omega t + \varphi_u)`],
      phys: 'Der überstrichene Winkel pro Sekunde, wenn man die Schwingung als rotierenden Zeiger denkt. Sie macht Formeln für Wechselstrom kürzer.',
      alias: ['omega']},
    {id: 'effektivwert', name: 'Effektivwert', sym: R`U_\text{eff},\ I_\text{eff}`, cat: 'Wechselgrößen', unit: 'V bzw. A', si: R`[U_\text{eff}] = 1\,\mathrm{V}`,
      formal: [R`U_\text{eff} = \sqrt{\frac{1}{T} \int_0^T u^2(t)\,\mathrm{d}t}`, R`U_\text{eff} = \frac{\hat{u}}{\sqrt{2}} \quad \text{(Sinus)}`],
      phys: 'Die Gleichspannung, die in einem Widerstand dieselbe Wärme erzeugen würde. „230 V“ an der Steckdose ist ein Effektivwert; die Spitze liegt bei etwa 325 V.',
      alias: ['rms', 'ueff']},
    {id: 'impedanz', name: 'Impedanz (komplexer Widerstand)', sym: R`\underline{Z}`, cat: 'Wechselgrößen', unit: 'Ohm, Ω', si: R`1\,\Omega`,
      formal: [R`\underline{Z} = \frac{\underline{U}}{\underline{I}} = R + jX`, R`\underline{Z}_R = R, \quad \underline{Z}_L = j\omega L, \quad \underline{Z}_C = \frac{1}{j\omega C}`],
      phys: 'Der Widerstand bei sinusförmigem Wechselstrom: Betrag (wie stark) und Phase (wie weit Strom und Spannung gegeneinander verschoben sind). Spulen und Kondensatoren werden dadurch frequenzabhängig.',
      alias: ['z', 'blindwiderstand', 'reaktanz']},

    // ---------- Netzwerke ----------
    {id: 'ohmsches-gesetz', name: 'Ohmsches Gesetz', sym: R`U = R\,I`, cat: 'Netzwerke', unit: '—', si: R`1\,\mathrm{V} = 1\,\Omega \cdot 1\,\mathrm{A}`,
      formal: [R`U = R\, I`, R`\vec{J} = \kappa\, \vec{E} \quad \text{(lokale Form)}`],
      phys: 'Bei einem ohmschen Bauteil ist der Strom proportional zur Spannung. Gilt für Metalle bei konstanter Temperatur, nicht für Dioden oder Lampen im Allgemeinen.',
      alias: ['ohm-gesetz']},
    {id: 'knotenregel', name: 'Knotenregel (1. Kirchhoffsches Gesetz)', sym: R`\sum I = 0`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`\sum_{k} I_k = 0 \quad \text{(zufließend positiv, abfließend negativ)}`],
      phys: 'In einem Knoten kann sich keine Ladung ansammeln: Was hineinfließt, fließt auch wieder heraus. Folgt aus der Ladungserhaltung.',
      alias: ['kirchhoff', 'knoten', 'kcl']},
    {id: 'maschenregel', name: 'Maschenregel (2. Kirchhoffsches Gesetz)', sym: R`\sum U = 0`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`\sum_{k} U_k = 0 \quad \text{(Umlauf in einer Masche)}`],
      phys: 'Wer einmal im Kreis läuft, kommt am selben Potential an — die Spannungen entlang einer geschlossenen Masche heben sich auf. Gilt, solange sich kein magnetischer Fluss durch die Masche ändert.',
      alias: ['masche', 'kvl']},
    {id: 'reihe-parallel', name: 'Reihen- und Parallelschaltung', sym: R`R_1 \parallel R_2`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`R_\text{Reihe} = R_1 + R_2`, R`R_1 \parallel R_2 = \frac{R_1 R_2}{R_1 + R_2}, \qquad G_\text{parallel} = G_1 + G_2`],
      phys: 'In Reihe fließt derselbe Strom, die Spannungen teilen sich auf. Parallel liegt dieselbe Spannung an, die Ströme teilen sich auf. Eine Parallelschaltung ist immer kleiner als ihr kleinster Widerstand.',
      alias: ['parallelschaltung', 'reihenschaltung', 'serienschaltung']},
    {id: 'spannungsteiler', name: 'Spannungsteiler', sym: R`\frac{R_2}{R_1 + R_2}`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`U_2 = U \cdot \frac{R_2}{R_1 + R_2} \quad \text{(unbelastet)}`],
      phys: 'Zwei Widerstände in Reihe teilen eine Spannung im Verhältnis ihrer Werte. Sobald eine Last parallel zu $R_2$ hängt, sinkt $U_2$.',
      alias: ['teiler']},
    {id: 'ersatzquelle', name: 'Ersatzspannungsquelle (Thévenin)', sym: R`U_0,\ R_i`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`U_0 = U_{\text{Leerlauf}}, \qquad R_i = \frac{U_0}{I_k}`, R`I_L = \frac{U_0}{R_i + R_L}`],
      phys: 'Jedes lineare Netzwerk verhält sich an zwei Klemmen wie eine ideale Quelle $U_0$ mit Innenwiderstand $R_i$. $R_i$ bestimmt man, indem man ideale Spannungsquellen kurzschließt, ideale Stromquellen auftrennt und den Widerstand zwischen den Klemmen berechnet.',
      alias: ['thevenin', 'innenwiderstand', 'leerlaufspannung', 'kurzschlussstrom', 'zweipol']},
    {id: 'leistungsanpassung', name: 'Leistungsanpassung', sym: R`R_L = R_i`, cat: 'Netzwerke', unit: '—', si: '',
      formal: [R`R_L = R_i \;\Rightarrow\; P_{L,\max} = \frac{U_0^2}{4 R_i}`, R`\eta_\text{Ersatzquelle} = 50\,\%`],
      phys: 'Die Last bekommt die größtmögliche Leistung, wenn sie so groß ist wie der Innenwiderstand. Das maximiert die Leistung an der Last, nicht den Wirkungsgrad — in der echten Schaltung kann er deutlich unter 50 % liegen.',
      alias: ['anpassung', 'maximale leistung']}
  ];
  const CATS = ['Alle', ...new Set(GROESSEN.map(g => g.cat))];
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const norm = (t) => String(t).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  /* Text mit $…$ → Formel-Spans */
  const textMath = (t) => esc(t).replace(/\$([^$]+)\$/g, (_, tex) => `<span class="math math-inline">${tex}</span>`);

  let root = null, list = null, search = null, chips = null, cat = 'Alle', lastFocus = null;
  function build() {
    root = document.createElement('div');
    root.className = 'lex';
    root.hidden = true;
    root.innerHTML = `<div class="lex-backdrop" data-lex-close></div>
      <section class="lex-panel" role="dialog" aria-modal="true" aria-labelledby="lex-title">
        <header class="lex-head"><div><span class="eyebrow">Nachschlagen</span><h2 id="lex-title">Elektrische Größen</h2></div><button type="button" class="lex-close" data-lex-close aria-label="Lexikon schließen">×</button></header>
        <input class="lex-search" type="search" placeholder="Suchen: Spannung, Ohm, τ …" aria-label="Größe suchen">
        <div class="lex-chips" role="group" aria-label="Rubrik">${CATS.map(c => `<button type="button" class="tag" data-cat="${c}" aria-pressed="${c === cat}">${c}</button>`).join('')}</div>
        <div class="lex-list"></div>
        <p class="lex-foot">Formal = Definition bzw. Beziehung in Formeln · Physikalisch = was die Größe bedeutet · Einheit zerlegt in SI-Basiseinheiten.</p>
      </section>`;
    document.body.append(root);
    list = root.querySelector('.lex-list'); search = root.querySelector('.lex-search'); chips = root.querySelector('.lex-chips');
    root.addEventListener('click', e => {
      if (e.target.closest('[data-lex-close]')) close();
      const c = e.target.closest('[data-cat]');
      if (c) { cat = c.dataset.cat; render(); }
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
        <h4>Physikalisch</h4><p>${textMath(g.phys)}</p>
        ${g.si ? `<h4>Einheit</h4><div class="math math-display lex-unit">${g.si}</div>` : ''}
      </div></details>`;
  }
  function matches(g, q) {
    if (cat !== 'Alle' && g.cat !== cat) return false;
    if (!q) return true;
    const hay = norm([g.id, g.name, g.unit, g.sym, ...(g.alias || [])].join(' '));
    return norm(q).split('-').filter(Boolean).every(w => hay.includes(w));
  }
  function render() {
    const q = search.value.trim();
    chips.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
    const shown = GROESSEN.filter(g => matches(g, q));
    const byCat = CATS.slice(1).map(c => [c, shown.filter(g => g.cat === c)]).filter(([, gs]) => gs.length);
    list.innerHTML = byCat.length ? byCat.map(([c, gs]) => `<h3 class="lex-cat">${c}</h3>${gs.map(entry).join('')}`).join('') : '<p class="lex-empty">Nichts gefunden. Probier ein anderes Wort oder ein Formelzeichen.</p>';
    OSCI.loadKatex().then(() => list.querySelectorAll('summary .math').forEach(el => typeOne(el))).catch(() => {});
  }
  function typeOne(el) {
    if (el.dataset.done) return;
    const tex = el.textContent;
    el.dataset.done = '1';
    try { window.katex.render(tex, el, {displayMode: el.classList.contains('math-display'), throwOnError: false, strict: 'ignore'}); } catch { el.textContent = tex; }
  }
  function typeset(scope) { scope.querySelectorAll('.math').forEach(typeOne); }
  function find(id) {
    if (!id) return null;
    const key = norm(id);
    return GROESSEN.find(g => g.id === key) || GROESSEN.find(g => norm(g.name) === key || (g.alias || []).some(a => norm(a) === key)) || GROESSEN.find(g => norm(g.name).includes(key));
  }
  function open(id) {
    if (!root) build();
    lastFocus = document.activeElement;
    const target = find(id);
    if (target) { cat = 'Alle'; search.value = ''; }
    render();
    root.hidden = false;
    document.documentElement.classList.add('lex-open');
    requestAnimationFrame(() => root.classList.add('is-open'));
    if (target) {
      const el = list.querySelector(`#lex-${target.id}`);
      el.open = true;
      requestAnimationFrame(() => { el.scrollIntoView({block: 'start'}); el.querySelector('summary').focus({preventScroll: true}); });
    } else search.focus({preventScroll: true});
  }
  function close() {
    if (!root || root.hidden) return;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('lex-open');
    setTimeout(() => { root.hidden = true; }, 200);
    if (/^#lexikon/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    lastFocus?.focus?.({preventScroll: true});
  }
  return {open, close, eintraege: GROESSEN};
})();
