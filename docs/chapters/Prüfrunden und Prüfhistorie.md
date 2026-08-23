## Prüfrunden und Prüfhistorie

Jedes Prüfobjekt arbeitet mit einer **Prüfrunde**. Die Prüfrunde legt fest, zu welcher Prüfung die erfassten Prüfergebnisse gehören.

Der Wert der Prüfrunde ist dabei ein wichtiger Bestandteil der Prüfung. Er wird verwendet, um die Prüfungen eines Gerätes eindeutig einer Prüfrunde zuzuordnen.

Beispielsweise können Prüfrunden so bezeichnet werden:

```text
2026
2026-Q1
2026-Q2
Jahresprüfung 2026
Nachprüfung 2026
```

Die Bezeichnung kann frei gewählt werden. Wichtig ist, dass für eine zusammengehörige Prüfung immer derselbe Wert verwendet wird.

### Aktuelle Prüfung

Im Prüfobjekt wird festgelegt, welche Prüfrunde die **aktuelle Prüfung** ist.

Beispielsweise:

```text
Aktuelle Prüfung: 2026
```

Alle Prüfungen, die während dieser Prüfrunde durchgeführt werden, werden unter diesem Wert gespeichert.

Wird später eine neue Prüfrunde gestartet, beispielsweise:

```text
Aktuelle Prüfung: 2027
```

werden die neu durchgeführten Prüfungen der Prüfrunde **2027** zugeordnet.

Die bereits vorhandenen Prüfungen der Prüfrunde **2026** bleiben dabei erhalten.

> **Wichtig:** Das Ändern der aktuellen Prüfrunde löscht keine vorhandenen Prüfungen. Es wird lediglich festgelegt, unter welchem Wert neue Prüfungen angelegt werden.

### Neue Geräte

Ein neu angelegtes Gerät besitzt zunächst **keine Prüfung**.

Das Gerät wird zunächst nur mit seinen Gerätedaten angelegt.

Beispielsweise:

```text
Gerät:
Steckdosenleiste
Seriennummer: SL-00125
Lokation: Büro 12

Prüfungen:
keine
```

Erst wenn für das Gerät eine Prüfung durchgeführt und gespeichert wurde, besitzt das Gerät eine Prüfung für die aktuelle Prüfrunde.

Beispiel:

```text
Aktuelle Prüfung: 2026

Gerät:
Steckdosenleiste
Seriennummer: SL-00125

Prüfungen:
2026
```

### Prüfungen über mehrere Prüfrunden

Ein Gerät kann im Laufe seiner Lebensdauer mehrere Prüfungen besitzen.

Beispielsweise:

```text
Gerät
│
├── Prüfung 2024
├── Prüfung 2025
└── Prüfung 2026
```

Die Prüfungen bilden damit die **Prüfhistorie** des Gerätes.

Wird die aktuelle Prüfrunde von `2025` auf `2026` geändert, wird die Prüfung von 2025 nicht überschrieben.

Wird das Gerät anschließend geprüft, entsteht eine zusätzliche Prüfung für 2026.

Damit bleiben die Ergebnisse der vergangenen Prüfrunden erhalten und können weiterhin eingesehen werden.

### Filter „Abgearbeitet“ und „Offen“

Die Filter **„Abgearbeitet“** und **„Offen“** beziehen sich auf die **aktuelle Prüfrunde**.

Dabei wird geprüft, ob für das Gerät eine Prüfung mit dem Wert der aktuellen Prüfrunde vorhanden ist.

Beispiel:

```text
Aktuelle Prüfung: 2026
```

Gerät A besitzt:

```text
Prüfungen:
2025
2026
```

Gerät A ist damit für die aktuelle Prüfrunde **abgearbeitet**.

Gerät B besitzt dagegen:

```text
Prüfungen:
2025
```

Für die aktuelle Prüfrunde `2026` existiert noch keine Prüfung.

Gerät B ist damit **offen**.

Ein neu angelegtes Gerät besitzt zunächst überhaupt keine Prüfung und wird deshalb ebenfalls als **offen** angezeigt.

### Beispiel

Der Gerätebestand enthält drei Geräte:

| Gerät | Prüfungen | Aktuelle Prüfrunde | Status |
|---|---|---|---|
| Gerät A | 2025, 2026 | 2026 | Abgearbeitet |
| Gerät B | 2025 | 2026 | Offen |
| Gerät C | keine | 2026 | Offen |

Nach der Prüfung von Gerät B:

| Gerät | Prüfungen | Aktuelle Prüfrunde | Status |
|---|---|---|---|
| Gerät A | 2025, 2026 | 2026 | Abgearbeitet |
| Gerät B | 2025, 2026 | 2026 | Abgearbeitet |
| Gerät C | keine | 2026 | Offen |

Der Filter **„Abgearbeitet“** zeigt damit die Geräte, für die bereits eine Prüfung zur aktuellen Prüfrunde vorhanden ist.

Der Filter **„Offen“** zeigt die Geräte, für die noch keine Prüfung zur aktuellen Prüfrunde vorhanden ist.

### Neue Prüfrunde beginnen

Um eine neue Prüfrunde zu beginnen, wird der Wert der aktuellen Prüfung geändert.

Beispiel:

```text
Bisher:
Aktuelle Prüfung: 2026

Danach:
Aktuelle Prüfung: 2027
```

Die vorhandenen Prüfungen bleiben erhalten.

Für die neue Prüfrunde sind zunächst alle Geräte offen, für die noch keine Prüfung mit dem Wert `2027` vorhanden ist.

Beispiel:

```text
Gerät A
├── 2026
└── 2027   ← neu geprüft

Gerät B
└── 2026

Gerät C
└── keine
```

Bei der Prüfrunde `2027` sind damit Gerät A abgearbeitet und Gerät B sowie Gerät C offen.

### Bedeutung für die Prüfplanung

Die Prüfrunde kann damit auch verwendet werden, um den Fortschritt einer Prüfung zu verfolgen.

Beispielsweise:

```text
Aktuelle Prüfrunde: 2026

Gesamt:        100 Geräte
Abgearbeitet:   72 Geräte
Offen:          28 Geräte
```

Der Filter **„Offen“** zeigt dabei genau die Geräte, für die in der aktuellen Prüfrunde noch keine Prüfung angelegt wurde.

Dies ermöglicht es, die noch ausstehenden Geräte gezielt abzuarbeiten.

### Prüfhistorie eines Gerätes

Die Prüfhistorie bleibt unabhängig von der aktuellen Prüfrunde am Gerät erhalten.

Beispielsweise:

```text
Steckdosenleiste
Seriennummer: SL-00125

Prüfhistorie:
2024  → bestanden
2025  → bestanden
2026  → bestanden
```

Wird die aktuelle Prüfrunde auf `2027` geändert, bleiben die drei vorhandenen Prüfungen erhalten:

```text
2024
2025
2026
```

Das Gerät wird lediglich für die neue Prüfrunde `2027` als offen betrachtet, solange noch keine Prüfung für diese Prüfrunde vorhanden ist.

### Wichtig für die Arbeit mit Prüfrunden

Die Bezeichnung der Prüfrunde sollte mit Bedacht gewählt werden.

Wenn mehrere Prüfer am selben Prüfobjekt arbeiten, müssen sie für dieselbe Prüfrunde **denselben Wert für die aktuelle Prüfung** verwenden.

Beispielsweise müssen alle beteiligten Geräte verwenden:

```text
2026
```

und nicht beispielsweise:

```text
2026
Prüfung 2026
Jahresprüfung 2026
2026-01
```

Diese Werte werden als unterschiedliche Prüfrunden behandelt.

> **Wichtig:** Der Wert der Prüfrunde ist der Schlüssel für die Zuordnung der Prüfungen. Unterschiedliche Bezeichnungen für dieselbe fachliche Prüfrunde führen daher zu unterschiedlichen Prüfungen.

### Zusammenfassung

Die wichtigsten Zusammenhänge sind:

- Jedes Prüfobjekt besitzt immer eine **aktuelle Prüfrunde**.
- Der Wert der aktuellen Prüfrunde wird zur Zuordnung neu angelegter Prüfungen verwendet.
- Ein neu angelegtes Gerät besitzt zunächst **keine Prüfung**.
- Ein Gerät kann Prüfungen aus mehreren Prüfrunden besitzen.
- Die bisherigen Prüfungen werden beim Start einer neuen Prüfrunde nicht gelöscht.
- **„Abgearbeitet“** bedeutet, dass für das Gerät eine Prüfung mit dem Wert der aktuellen Prüfrunde vorhanden ist.
- **„Offen“** bedeutet, dass für das Gerät noch keine Prüfung mit dem Wert der aktuellen Prüfrunde vorhanden ist.
- Die Prüfhistorie eines Gerätes bleibt über mehrere Prüfrunden erhalten.
- Bei der Zusammenarbeit mehrerer Prüfer muss für dieselbe Prüfrunde derselbe Wert verwendet werden.