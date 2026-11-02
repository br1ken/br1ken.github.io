# Audiolabor: geprüfter Stand vom 2. November 2026

Das Audiolabor ist Lab 2 von osci//log. Schaltplan und Steckbrett beschreiben dasselbe elektrische Netz; Renderbetrieb (ngspice) und Live-Betrieb rechnen daraus die Spannung am Hörpunkt. 19 Versuche sind enthalten.

## Abnahme

**197 bestanden, 0 nicht bestanden, 5 nur gemessen; 126,5 Sekunden.** Vollständiger Lauf im Codex-Browser (Chrome 156) auf Apple M3, acht logische Kerne, 48 kHz, vierfache Überabtastung. Die Browserkennung meldet aus Kompatibilitätsgründen „Intel Mac“; das Gerät wurde separat als Apple M3 ermittelt.

[Gesamtes Messprotokoll als JSON](abnahme-2026-11-02.json). Der [Prüfstand](pruefstand.html) erzeugt jede Zeile neu. Grenzwerte wurden beim Abschluss nicht gelockert. Die fünf informativen Zeilen sind Messungen, keine bestandenen Kriterien; darunter ist bewusst auch die überlastete Kette aus zwölf Transistorstufen.

Abgedeckt sind Netze und Umstecken in beiden Ansichten, Speichern/Laden, alle Versuche, Theorievergleiche, Live gegen ngspice, Pegel, Faust im gemeinsamen Audiokontext und das Rechenbudget.

Im Abschluss korrigiert und geprüft:

- Zwei-Finger-Zoom auf dem Steckbrett hält den ursprünglichen Brettpunkt unter der Fingermitte. Wiederholte Zeigerereignisse lassen ihn nicht mehr wandern.
- Stopp verwirft auch einen noch nicht übernommenen Schaltungsplan. Der Regressionstest „Stopp direkt nach Start“ misst danach exakt null am Monitor-Eingang.
- Beim Wechsel von Render zu Live werden laufende Renderberechnungen abgebrochen und verspätete Ergebnisse verworfen. Dieser abschließende Oberflächenfix wurde nach dem Gesamtlauf gezielt mit einem schnellen Wechsel von Berechnen zu Live geprüft.
- Überlastberichte werden nur für den aktiven Plan ausgewertet; der Zähler beginnt beim Neustart bei null. Die Meldung bietet einen Knopf für „Berechnen und anhören“.

## Ausgewählte Messwerte

Die Werte stammen aus dem verlinkten Abschlusslauf; ältere Zwischenstände werden hier nicht fortgeschrieben.

| Prüfung | Ergebnis |
|---|---|
| RC-Tiefpass 10 kΩ, 10 nF: Grenzfrequenz | 1591,54 Hz (Abweichung −0,000 %) |
| Multivibrator: Schwingfrequenz | ngspice 317,36 Hz, Live 317,36 Hz (−0,00 %), ohne Konvergenz 0 |
| Rechteckgenerator: Frequenz und Hub | 453,98 Hz / 454,98 Hz; Hub 20,90 V / 20,90 V; ohne Konvergenz 0 |
| Wien-Brücke: Frequenz und Hub | 1,5870 kHz / 1,5868 kHz; Hub 16,58 V / 16,56 V |

## Rechenbudget

Jeweils kurze Messung auf dem Audio-Thread, nach zwei verworfenen Anlaufberichten. Prozentwerte sind Rechenzeit relativ zur Audioblockdauer, keine CPU-Anzeige des Betriebssystems. `Date.now` hat dort nur 1 ms Auflösung; Spitzenwerte sind entsprechend grob.

| Schaltung | Messung |
|---|---|
| RC-Tiefpass | 4,7 %; längster Block 1,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 3 Unbekannte, 1 Zustände, 0 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| Diodenbegrenzer 1N4148 | 11,4 %; längster Block 2,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 5 Unbekannte, 0 Zustände, 2 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 1 Transistorstufe | 16,2 %; längster Block 2,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 7 Unbekannte, 2 Zustände, 2 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 2 Transistorstufen | 24,9 %; längster Block 2,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 10 Unbekannte, 4 Zustände, 4 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 4 Transistorstufen | 25,1 %; längster Block 2,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 16 Unbekannte, 8 Zustände, 8 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 8 Transistorstufen | 55,1 %; längster Block 2,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 28 Unbekannte, 16 Zustände, 16 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 12 Transistorstufen | 126,6 %; längster Block 6,0 ms von 2,67 ms; 649 von 752 Blöcken über Budget; 40 Unbekannte, 24 Zustände, 24 nichtlineare Anschlüsse; ohne Konvergenz 1205 |
| 1 OPV | 6,7 %; längster Block 1,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 19 Unbekannte, 2 Zustände, 3 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 4 OPV | 27,4 %; längster Block 2,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 58 Unbekannte, 8 Zustände, 12 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 8 OPV | 42,2 %; längster Block 2,0 ms von 2,67 ms; 0 von 752 Blöcken über Budget; 110 Unbekannte, 16 Zustände, 24 nichtlineare Anschlüsse; ohne Konvergenz 0 |
| 12 OPV | 60,2 %; längster Block 4,0 ms von 2,67 ms; 9 von 752 Blöcken über Budget; 162 Unbekannte, 24 Zustände, 36 nichtlineare Anschlüsse; ohne Konvergenz 0 |

Alle 19 mitgelieferten Versuche blieben unter der Prüfgrenze von 90 % und liefen ohne Nichtkonvergenz. Daraus folgt keine allgemeine Echtzeitzusage für frei gebaute Schaltungen oder andere Geräte. Zwölf Transistorstufen lagen bei 126,6 % und hatten 1205 Rechenschritte ohne Konvergenz.

## Dauertest

Drei Minuten Emitterschaltung BC847B, vierfach überabgetastet, sichtbarer Browser. Poti und Generatorfrequenz wurden währenddessen laufend verändert. [Rohdaten](dauertest-2026-11-02.json).

| Messgröße | Wert |
|---|---|
| Mittlere Last | 20,828 % |
| Höchste Abschnittslast | 33,5106 % |
| Längster Block | 6 ms |
| Blockbudget | 2,6667 ms |
| Blöcke über Budget | 1  |
| Erfasste Blöcke | 67492  |
| Schritte ohne Konvergenz | 0  |
| Verworfene Scope-Werte | 0  |
| Maximale Abweichung Hauptthread-/Audiouhr | 0,0067 s |
| Basislatenz | 5,3333 ms |
| Gemeldete Ausgabelatenz | 40 ms |
| Planänderungen | 3458  |

Die Uhrabweichung vergleicht Hauptthread-Wanduhr und AudioContext-Zeit; sie ist keine Messung der analogen Ende-zu-Ende-Latenz. Einzelne Blöcke über Budget werden ausdrücklich ausgewiesen.

## Überlastprüfung

16 gekoppelte Transistorstufen in der echten Oberfläche. Automatisch angehalten: **ja**, nach 4.28 s ab Rückkehr des Starts. Meldung: Ein Netz trägt mehrere Namen (p12, vcc). Es heißt in der Netlist „p12“.Live angehalten: Die Rechenzeit lag bei rund 10950 % des Budgets. Diese Schaltung ist für den Live-Löser auf diesem Gerät zu groß. Wechsle zu „Berechnen und anhören“ oder senke die Überabtastung. Berechnen und anhören.

## Ergänzende Oberflächenprüfung

- VCA live gestartet und gestoppt; Lastanzeige und Gate-Taster geprüft. Generatorfrequenz mit echter Tastatureingabe auf 440 Hz gesetzt und die Übernahme bestätigt.
- Nach einem schnellen Wechsel von laufender Renderberechnung zu Live blieb die Live-Statusanzeige erhalten.
- Der Überlastknopf schaltete tatsächlich auf Render um (`aria-pressed=true`).
- Kopfzeile bei 761 px und VCA-Steckbrett bei 375 px im Dunkelmodus angesehen. Dokumentbreite bei 375 px: exakt 375 px, kein seitlicher Überlauf der Seite. Das breite Steckbrett scrollt innerhalb seiner eigenen Fläche.
- Keine protokollierten JavaScript-Fehler bei der abschließenden Oberflächenprüfung.

## Hörwarnung und Website-Durchsicht

Vor der ersten Tonfreigabe erscheint jetzt ein gemeinsamer Warnhinweis für Audiolabor, Prüfstand, Crashtest und Hörsimulationen in Notizen. Erst die ausdrückliche Bestätigung gibt Audio frei; Abbrechen oder Escape lassen den Ton aus. Die Bestätigung gilt für die Tab-Sitzung. Sie verändert nicht die Gerätelautstärke. Ein dauerhafter Hinweis steht zusätzlich über den beiden Klanglaboren.

Neue Audiolabor-Projekte starten mit 15 statt 70 Prozent Monitorlautstärke. Bereits gespeicherte Einstellungen bleiben erhalten. Der Aufnahmeknopf behält seinen DOM-Verweis vor dem asynchronen Audiostart; dadurch lässt sich die Aufnahme wieder zuverlässig starten und beenden.

**Gezielte Nachprüfung: 76 bestanden, 0 nicht bestanden, 2 nur gemessen, 25,5 Sekunden.** Erneut ausgeführt wurden Stecken, Stufe 1, Pegel und Audio-Thread. [Rohdaten der Nachprüfung](nachpruefung-2026-11-02.json). Der vollständige Lauf und Dauertest oben stammen aus dem Abschluss vor dieser Ergänzung; sie wurden nicht erneut als Gesamtlauf ausgeführt.

- Audiolabor: frische Sitzung mit 15 Prozent, Warnhinweis abbrechen, erneut öffnen und bestätigen; Live starten/stoppen sowie Aufnahme starten/stoppen geprüft.
- Crashtest: Warnhinweis mit Escape geschlossen; Startknopf danach wieder bedienbar und Ton aus.
- Hörsimulationen: Abbruch, Freigabe, Oberton-Klang und Abtastungs-Klang starten/stoppen geprüft; nach der Bestätigung kein zweiter Hinweis innerhalb derselben Tab-Sitzung.
- Warnfenster auf Desktop und bei 375 × 820 px visuell geprüft; beide Aktionen erreichbar.
- Website: 30 Routen einschließlich aller 20 Notizen bei 1280 und 375 px geladen, insgesamt 60 Ansichten. Keine erfassten JavaScript-/Ressourcenfehler, kaputten Bilder, KaTeX-Fehler oder horizontalen Seitenüberläufe. Jede Ansicht enthielt eine Hauptüberschrift.
- 12 HTML-Dateien statisch auf lokale Verweise, doppelte IDs und einheitliche Asset-Versionen geprüft. Keine offenen Befunde. 19 verschiedene dynamisch erzeugte lokale Linkpfade vorhanden.
- Notizensuche „Kirchhoff“: drei Treffer; nach Leeren wieder 20 Notizen. Lexikonsuche „Oszilloskop“ und Schließen geprüft.
- Veraltete Zahl „18 Versuche“ auf Start- und Projektseite auf 19 korrigiert. Startseite und Labor laden dieselbe Version des Labor-Stylesheets.

Das ist eine technische Durchsicht der vorhandenen Seiten und der betroffenen Bedienwege, keine erneute fachliche Herleitung sämtlicher Notizen oder Prüfung aller möglichen Gerätekombinationen.

## Modelle und Rechenverfahren

- ngspice 45.2 über eecircuit-engine 1.9.0, eigener Worker, Transienten mit Gear. XSPICE-A-Devices und OSDI stehen in diesem Build nicht zur Verfügung. Die Netlist bleibt wegen der Binärdaten-Auswertung der Engine ASCII. Laufkennungen und Zeitwächter verhindern, dass alte Ergebnisse als neue ausgegeben werden.
- Eigener Live-Löser: Knotenanalyse, Nodal-DK-Reduktion, Trapezregel; innere OPV-Kapazität mit implizitem Euler. Newton: erste Suche mit bis zu zwölf Iterationen, danach Kaltstart mit bis zu 32. Begrenzte Halbleiterschritte und Stabilisierung bei negativer Determinante. Ohne Lösung bleiben die Zustände stehen.
- Live fehlen Halbleiterkapazitäten, Hilfszweige der Herstellermodelle und Bauteilrauschen. Das Haupttransistormodell verwendet festes RB. CD40106 schaltet zwischen Rechenschritten.
- Generische Si-Diode, LED, Z-Diode, NPN, PNP, NMOS und PMOS sind keine konkreten Herstellerbauteile. OPV und CD40106 sind eigene Makromodelle: TL07x-Datenblattwerte ohne Strombegrenzung; CD40106-Schwellen 0,59 und 0,385 × VDD, Ausgangswiderstand 300 Ω nach TI SCHS097F.
- Nexperia-Parameter für 1N4148, BAT85, BC847B, BC857B und PMBT3904 sind nicht gegen Hardware geprüft. BC847B ist nicht BC547B. Die genaue Herkunft steht in `assets/audiolabor/modelle.js`.
- Der Hörmaßstab ist fest: 10 V = 1,0 digital. Lautstärke, DC-Sperre und Schutzbegrenzer liegen hinter dem Messabgriff. Faust-Module bleiben digitale Quellen oder Effekte; sie ersetzen keine Schaltungsrechnung.
- Der WDF-Vergleich ist eine eigene JavaScript-Implementierung; chowdsp_wdf wurde nicht portiert.

## Fremdkomponenten und Quellen

| Bestandteil | Version | Lizenz / Herkunft |
|---|---|---|
| eecircuit-engine | 1.9.0 | [MIT](../assets/vendor/eecircuit-engine/LICENSE), [Quellen](https://github.com/eelab-dev/EEcircuit-engine) |
| ngspice | 45.2 | Überwiegend modifizierte BSD; [Projekt und Quellen](https://ngspice.sourceforge.io/) |
| @grame/faustwasm | 0.19.6 | [LGPL-2.1-or-later](../assets/vendor/faustwasm/COPYING.txt), [Quellen](https://github.com/grame-cncm/faustwasm) |
| Faust-Compiler | 2.90.19 laut Laufzeit | LGPL-2.1-or-later; [Quellen](https://github.com/grame-cncm/faust) |
| Mitgelieferte Faust-Bibliotheken | Bestand in libfaust-wasm.data | LGPL mit Faust-Ausnahme sowie Lizenzen je Datei/Funktion, unter anderem STK-4.3, MIT und ISC. [Bestandsaufnahme, Hinweise und Prüfsummen](../assets/vendor/faustwasm/LIZENZEN.md) |

## Grenzen der Abnahme

- Kein Hörurteil und kein Vergleich mit real aufgebauter Hardware. VCA und übrige Versuche sind numerisch geprüft.
- Kein physisches MIDI-Gerät und kein echter Touchscreen geprüft. Die Zoom-Regression verwendet synthetische Zeigerereignisse durch die echte Oberfläche.
- Die bestehende Übergabe dokumentiert frühere Oberflächenprüfungen. Beim Abschluss gab es eine gezielte Codeprüfung der Daten-, Bedienungs- und Audio-Lebenszyklen; keine behauptete zweite manuelle Prüfung jeder einzelnen Zeile.
- WAM, Cardinal, CD4017, CD4015, JFET und Trafo gehören nicht zum abgeschlossenen Funktionsumfang.
- ES-Modul-Importe sind derzeit ohne gemeinsame Versionsnummer. Bei späteren Veröffentlichungen muss die gesamte Importkette versioniert oder das Caching passend geregelt werden; nur `app.js?v=…` reicht dafür nicht. Für diese Abnahme wurde ein separater lokaler Ursprung ohne Cache verwendet.
