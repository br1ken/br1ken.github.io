---
titel: Hallo, Labor.
datum: 2026-10-20
fach: Über dieses Log
tags: [Start, Sinus, Wechselspannung]
teaser: Warum es osci//log gibt, wie die Notizen aufgebaut sind — und eine erste Welle zum Anfassen.
welle: sinus
---

Im Studium lerne ich jede Woche Dinge, die erst in Formeln stecken und irgendwann — oft viel später — *klick* machen. Dieses Log ist der Ort, an dem ich diese Klick-Momente festhalte. So, dass sie auch jemand versteht, der nicht in meiner Vorlesung sitzt.

## Wie die Notizen aufgebaut sind

Jede Notiz hat ein Thema und eine Frage. Darin tauchen immer wieder dieselben Bausteine auf:

- **Merke-Kästen** für das, was man wirklich mitnehmen sollte.
- **Formeln** — sauber gesetzt, aber immer mit einem Satz, was sie *bedeuten*.
- **Simulationen**, an denen man ziehen kann, statt nur Bilder anzuschauen.
- **Aufgaben** mit versteckter Lösung. Erst selbst denken, dann aufklappen.

::: merke
Eine Formel ist erst verstanden, wenn man vorhersagen kann, was passiert, wenn man an einer Größe dreht.
:::

## Die erste Welle

Ein großer Teil der Elektrotechnik dreht sich um eine einzige Kurvenform, die Sinusschwingung:

$$u(t) = \hat{u} \cdot \sin(2\pi f t + \varphi)$$

Drei Zahlen beschreiben sie vollständig: die **Amplitude** $\hat{u}$ (wie hoch), die **Frequenz** $f$ (wie oft pro Sekunde) und die **Nullphase** $\varphi$ (wo sie bei $t = 0$ startet). Zieh an den Reglern und beobachte, was sich ändert — und was nicht.

::: sim welle u=5 f=2 phi=0
Die gestrichelte Linie zeigt den Effektivwert. Er hängt nur von der Amplitude ab, nicht von Frequenz oder Phase.
:::

Der **Effektivwert** ist die Gleichspannung, die in einem ohmschen Widerstand im Mittel dieselbe Leistung umsetzen würde — also dieselbe Wärme erzeugt. Für einen Sinus gilt $U_\text{eff} = \hat{u} / \sqrt{2}$.

::: aufgabe Steckdose
Aus der Steckdose kommen „230 V, 50 Hz“. Gemeint ist der Effektivwert. Wie groß ist die Amplitude $\hat{u}$, und wie lange dauert eine Periode?
???
Die Amplitude ist $\hat{u} = \sqrt{2} \cdot 230\,\text{V} \approx 325\,\text{V}$. Die Spannung pendelt also zwischen etwa $+325\,\text{V}$ und $-325\,\text{V}$.

Die Periodendauer ist $T = 1/f = 1/50\,\text{Hz} = 20\,\text{ms}$.
:::

## Was als Nächstes kommt

Grundlagen der E-Technik, Mathe, später Signale und Systeme. Und alles, was sich davon *hören* lässt, landet im [Crashtest-Labor](../labor/).
