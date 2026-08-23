## Excel-Import und Massendaten

Der Excel-Import ermöglicht es, eine größere Anzahl von Geräten in einem Arbeitsschritt in die App zu übernehmen.

Dies ist insbesondere dann hilfreich, wenn viele gleichartige Geräte erfasst werden müssen, beispielsweise:

- Steckdosenleisten
- Verlängerungsleitungen
- Netzteile
- Ladegeräte
- ortsveränderliche Geräte mit ähnlichen Stammdaten
- Geräte, deren Seriennummern und Lokationen bereits bekannt sind

Statt jedes Gerät einzeln anzulegen, können die Daten zunächst in Excel vorbereitet und anschließend importiert werden.

### Vorbereitung der Excel-Datei

Für den Import wird eine Excel-Datei mit den entsprechenden Spalten benötigt.

Die Spalten der Excel-Datei entsprechen den Feldern, die beim Anlegen eines Gerätes in der App verwendet werden.

Dabei sollte jede Zeile genau **ein Gerät** darstellen.

Beispiel:

| Bezeichnung | Hersteller | Typ | Seriennummer | Lokation |
|---|---|---|---|---|
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00001 | Büro 1 |
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00002 | Büro 1 |
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00003 | Büro 2 |
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00004 | Büro 2 |

Die gemeinsamen Angaben können dabei für viele Geräte identisch sein.

### Massendaten vorbereiten

Bei größeren Mengen empfiehlt es sich, zunächst ein einzelnes Gerät vollständig zu beschreiben und anschließend die wiederkehrenden Angaben in Excel für die weiteren Zeilen zu übernehmen.

Beispielsweise müssen bei 200 identischen Steckdosenleisten nicht jedes Mal Hersteller und Typ manuell eingetragen werden.

In Excel können die Werte einfach nach unten kopiert werden.

```text
Hersteller       Typ             Seriennummer    Lokation
Brennenstuhl     Premium-Line    STL-00001       Büro 1
Brennenstuhl     Premium-Line    STL-00002       Büro 1
Brennenstuhl     Premium-Line    STL-00003       Büro 1
...
Brennenstuhl     Premium-Line    STL-00200       Büro 5
```

Dadurch lassen sich auch größere Mengen von Geräten schnell vorbereiten.

### Seriennummern in Excel erzeugen

Wenn für die Geräte noch keine Seriennummern vorhanden sind, können diese für die Erfassung in Excel erzeugt werden.

Eine einfache Möglichkeit ist eine fortlaufende Nummer.

Beispielsweise:

```text
STL-00001
STL-00002
STL-00003
STL-00004
...
STL-00200
```

In Excel kann dafür beispielsweise folgende Formel verwendet werden:

```excel
="STL-"&TEXT(ZEILE(A1);"00000")
```

Beim Herunterziehen der Formel entstehen automatisch fortlaufende Nummern.

Die verwendete Nummerierung sollte dabei so gewählt werden, dass die erzeugten Seriennummern innerhalb des Datenbestands eindeutig sind.

> **Wichtig:** Die auf diese Weise erzeugten Seriennummern sind keine vom Hersteller vergebenen Seriennummern. Sie dienen lediglich als eigene eindeutige Kennzeichnung der Geräte.

Eine solche Kennzeichnung kann beispielsweise verwendet werden, wenn ein Gerät keine Hersteller-Seriennummer besitzt oder die vorhandene Seriennummer für die praktische Erfassung nicht geeignet ist.

### Eigene Inventarnummern verwenden

Für die praktische Prüfung kann es sinnvoll sein, eine eigene Nummerierung zu verwenden.

Beispielsweise:

```text
SL-2026-00001
SL-2026-00002
SL-2026-00003
```

Dabei kann die Nummerierung Informationen über den Bestand enthalten.

Zum Beispiel:

```text
SL    = Steckdosenleiste
2026  = Jahr der Erfassung
00001 = fortlaufende Nummer
```

Die genaue Struktur kann frei gewählt werden.

> **Hinweis:** Bei einer eigenen Nummerierung sollte die Nummer einmalig vergeben werden und anschließend dauerhaft demselben Gerät zugeordnet bleiben.

### Lokationen in Excel vorbereiten

Auch Lokationen können bereits vor dem Import in Excel festgelegt werden.

Beispielsweise:

```text
Gebäude 1 / Erdgeschoss / Büro 01
Gebäude 1 / Erdgeschoss / Büro 02
Gebäude 1 / Erdgeschoss / Büro 03
Gebäude 1 / Obergeschoss / Büro 01
```

Wenn mehrere Geräte dieselbe Lokation haben, kann der entsprechende Wert für alle Geräte übernommen werden.

Beispiel:

| Seriennummer | Lokation |
|---|---|
| STL-00001 | Gebäude 1 / EG / Büro 01 |
| STL-00002 | Gebäude 1 / EG / Büro 01 |
| STL-00003 | Gebäude 1 / EG / Büro 01 |
| STL-00004 | Gebäude 1 / EG / Büro 02 |

Damit steht die Lokation bereits bei der ersten Erfassung zur Verfügung und muss nicht für jedes Gerät einzeln eingetragen werden.

### Lokationen automatisch erzeugen

Bei großen Beständen können auch die Lokationen mit Excel-Formeln erzeugt werden.

Beispielsweise kann eine Liste der Räume vorbereitet werden:

```text
Büro 01
Büro 02
Büro 03
Büro 04
...
```

Anschließend können diese Werte den Geräten zugeordnet werden.

Bei einem regelmäßigen Aufbau, beispielsweise zehn Steckdosenleisten pro Büro, kann die Lokation auch anhand der laufenden Nummer automatisch erzeugt werden.

Damit lassen sich beispielsweise 100 Geräte auf zehn Räume verteilen, ohne jede Lokation einzeln eingeben zu müssen.

### Kombination aus Seriennummer und Lokation

Besonders effektiv ist die Kombination aus automatisch erzeugter Seriennummer und vorbereiteter Lokation.

Beispiel:

| Bezeichnung | Seriennummer | Lokation |
|---|---|---|
| Steckdosenleiste | SL-00001 | Büro 01 |
| Steckdosenleiste | SL-00002 | Büro 01 |
| Steckdosenleiste | SL-00003 | Büro 01 |
| Steckdosenleiste | SL-00004 | Büro 02 |
| Steckdosenleiste | SL-00005 | Büro 02 |
| Steckdosenleiste | SL-00006 | Büro 02 |

Nach dem Import sind die Geräte bereits mit den vorbereiteten Stammdaten angelegt.

Die eigentliche Prüfung kann anschließend direkt in der App durchgeführt werden.

### Beispiel: 100 Steckdosenleisten

Angenommen, in einem Gebäude sollen 100 Steckdosenleisten geprüft werden.

Die Geräte sind baugleich und besitzen keine für die Prüfung verwendete Seriennummer.

In Excel werden zunächst die erforderlichen Daten vorbereitet:

```text
Bezeichnung:     Steckdosenleiste
Hersteller:      Beispielhersteller
Typ:             Beispieltyp
Seriennummer:    SL-00001 bis SL-00100
Lokation:        Büro 01 bis Büro 20
```

Anschließend wird die Excel-Datei importiert.

Die 100 Geräte stehen danach in der App zur Verfügung und können einzeln geprüft werden.

### Excel als Vorbereitung der Erfassung

Der Excel-Import sollte insbesondere für die **Vorbereitung von Stammdaten** verwendet werden.

Die eigentliche Prüfung erfolgt anschließend in der App.

Das hat den Vorteil, dass die wiederkehrenden Informationen nicht während der Prüfung manuell eingegeben werden müssen.

Der Ablauf kann beispielsweise so aussehen:

```text
Excel
  │
  ├── Geräte erzeugen
  ├── Seriennummern vergeben
  ├── Lokationen zuordnen
  └── Stammdaten vorbereiten
          │
          ▼
     Excel-Import
          │
          ▼
        App
          │
          ├── Geräte prüfen
          ├── Messwerte erfassen
          ├── Bilder hinzufügen
          └── Prüfung abschließen
```

### Vor dem Import kontrollieren

Vor dem Import sollte die Excel-Datei kontrolliert werden.

Insbesondere sollte geprüft werden:

- Ist jede Zeile einem Gerät zugeordnet?
- Sind Pflichtfelder ausgefüllt?
- Sind Seriennummern eindeutig?
- Sind Lokationen korrekt geschrieben?
- Gibt es versehentlich doppelte Geräte?
- Sind die Spalten den richtigen Feldern zugeordnet?
- Enthalten die Zellen unerwünschte Leerzeichen oder zusätzliche Zeichen?

Bei großen Datenmengen ist eine Kontrolle in Excel wesentlich einfacher als eine nachträgliche Korrektur in der App.

### Empfehlung bei großen Datenmengen

Bei sehr großen Datenmengen empfiehlt es sich, den Import zunächst mit einer kleinen Anzahl von Geräten zu testen.

Beispielsweise können zunächst fünf bis zehn Geräte importiert und anschließend kontrolliert werden.

Erst wenn die Zuordnung der Spalten und die erzeugten Daten korrekt sind, sollte der vollständige Datenbestand importiert werden.

> **Achtung:** Vor einem größeren Import sollte ein Backup des aktuellen Datenbestands erstellt werden. Dadurch kann bei Bedarf auf den vorherigen Stand zurückgegriffen werden.

### Zusammenspiel mit dem Arbeiten mit mehreren Prüfern

Der Excel-Import kann auch mit dem Arbeiten mit mehreren Prüfern kombiniert werden.

Beispielsweise kann der vollständige Gerätebestand zunächst über Excel erzeugt und importiert werden.

Anschließend wird der Datenbestand als Backup an die beteiligten Prüfer verteilt.

Die Prüfer führen ihre Prüfungen unabhängig voneinander durch und erstellen anschließend jeweils ein Backup.

Die einzelnen Backups können danach über **„Backup zusammenführen“** wieder zu einem gemeinsamen Datenbestand zusammengeführt werden.

Damit eignet sich der Excel-Import insbesondere für die **Vorbereitung großer Gerätebestände**, während **Backup und Backup zusammenführen** für die anschließende Zusammenarbeit mehrerer Prüfer verwendet werden können.