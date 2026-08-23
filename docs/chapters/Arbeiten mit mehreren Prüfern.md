## Arbeiten mit mehreren Prüfern

Da die App vollständig offline arbeitet und die Daten ausschließlich lokal auf dem jeweiligen Gerät gespeichert werden, können mehrere Prüfer unabhängig voneinander am selben Prüfobjekt arbeiten.

Die Backups der einzelnen Prüfer können anschließend über **„Backup zusammenführen“** zu einem gemeinsamen Datenstand zusammengeführt werden (siehe [Backup zusammenführen](#backup-zusammenführen)).

### Gemeinsamen Ausgangsstand verteilen

Sollen mehrere Prüfer am selben Prüfobjekt arbeiten, sollte zunächst auf einem Gerät der gemeinsame Ausgangsstand vorbereitet werden.

1. Den gewünschten Datenstand öffnen.
2. Über **„Backup herunterladen“** ein Backup erstellen.
3. Die Backup-ZIP-Datei an die beteiligten Prüfer weitergeben.
4. Die Prüfer laden das Backup über **„Backup wiederherstellen“** auf ihrem jeweiligen Gerät.

Nach dem Wiederherstellen verfügen alle Prüfer über denselben Ausgangsstand und können unabhängig voneinander arbeiten.

> **Hinweis:** Beim Wiederherstellen wird der vorhandene Datenbestand vollständig überschrieben. Das Backup daher nur auf einem Gerät wiederherstellen, auf dem der vorhandene Datenbestand nicht benötigt wird. Vorher gegebenenfalls ein eigenes Backup erstellen.

### Prüfungen durchführen

Jeder Prüfer arbeitet anschließend auf seinem eigenen Gerät und erfasst die ihm zugewiesenen Prüfungen.

Zum Beispiel können die Prüfer unterschiedliche Bereiche eines Prüfobjekts bearbeiten:

- Prüfer 1 prüft das Erdgeschoss.
- Prüfer 2 prüft das Obergeschoss.
- Prüfer 3 prüft die Werkstatt.

Die Geräte und Prüfungen werden dabei wie gewohnt erfasst. Auch Bilder und PDFs können den Geräten bzw. Prüfungen hinzugefügt werden.

Da die App vollständig offline funktioniert, ist während der Erfassung keine Internetverbindung erforderlich.

### Backups der Prüfer erstellen

Nach Abschluss der Arbeiten erstellt jeder Prüfer über **„Backup herunterladen“** ein eigenes Backup.

Das Backup enthält immer den vollständigen Datenbestand des jeweiligen Geräts, nicht nur die während der aktuellen Arbeit neu erfassten Prüfungen.

Die Backups sollten deshalb eindeutig zugeordnet werden können. Der von der App erzeugte Dateiname enthält bereits das Prüfobjekt sowie Datum und Uhrzeit der Erstellung.

> **Empfehlung:** Bei mehreren Prüfern die Backups nach Möglichkeit direkt nach Abschluss der Arbeiten weitergeben und nicht über längere Zeit aufbewahren, bevor sie zusammengeführt werden.

### Backups zusammenführen

Die Backups werden anschließend auf einem Gerät zu einem gemeinsamen Datenstand zusammengeführt.

1. Das Gerät mit dem gemeinsamen Datenstand öffnen.
2. Vor dem Zusammenführen über **„Backup herunterladen“** ein Backup des aktuellen Datenstands erstellen.
3. Im Administrationsbereich **„Backup zusammenführen“** öffnen.
4. Das Backup eines Prüfers auswählen.
5. Den Vorgang starten.
6. Den angezeigten Ergebnisbericht prüfen.
7. Die weiteren Backups **einzeln nacheinander** zusammenführen.

Die Funktionsweise der Zusammenführung ist im Abschnitt [Backup zusammenführen](#backup-zusammenführen) beschrieben.

> **Wichtig:** Die Backups sollten nicht gleichzeitig zusammengeführt werden. Jedes Backup wird einzeln verarbeitet. Nach jedem Vorgang zeigt die App einen Ergebnisbericht an.

### Beispiel

Ein Prüfobjekt enthält 100 Geräte. Zwei Prüfer teilen sich die Arbeit.

Beide Prüfer erhalten zunächst ein Backup mit den 100 Geräten.

**Prüfer 1** prüft die Geräte 1 bis 50 und erstellt anschließend ein Backup.

**Prüfer 2** prüft die Geräte 51 bis 100 und erstellt ebenfalls ein Backup.

Anschließend werden beide Backups nacheinander in den gemeinsamen Datenbestand übernommen.

Da die Prüfer unterschiedliche Geräte bearbeitet haben, werden die jeweiligen Prüfungen zu den bereits vorhandenen Geräten hinzugefügt.

Der gemeinsame Datenbestand enthält danach die Prüfungen beider Prüfer.

### Bereits vorhandene Geräte

Die Zusammenführung kann auch verwendet werden, wenn mehrere Prüfer Prüfungen an Geräten durchführen, die bereits im gemeinsamen Datenbestand vorhanden sind.

Bei einem bereits vorhandenen Gerät werden Prüfungen übernommen, deren **Prüfungsname** im vorhandenen Gerät noch nicht existiert.

Prüfungen mit einem bereits vorhandenen Prüfungsnamen werden nicht erneut übernommen.

> **Wichtig:** Die Funktion „Backup zusammenführen“ ist keine automatische Synchronisation. Änderungen an derselben Prüfung werden nicht miteinander verglichen oder automatisch zusammengeführt. Für die Zusammenarbeit sollten die Prüfer daher möglichst unterschiedliche Geräte bzw. Prüfungen bearbeiten.

### Ergebnis kontrollieren

Nach jedem Zusammenführen zeigt die App einen Ergebnisbericht an.

Dort wird angezeigt:

- wie viele Geräte eingefügt wurden,
- wie viele Prüfungen zusammengeführt wurden,
- wie viele Prüfungen nicht übernommen wurden.

Zusätzlich werden die einzelnen Vorgänge in den Tabellen **„Eingefügte Geräte“**, **„Zusammengeführte Inspectionen“** und **„Nicht übernommene Inspectionen“** aufgeführt.

Der Ergebnisbericht sollte nach jedem Zusammenführen kontrolliert werden.

### Gemeinsamen Datenstand wieder verteilen

Nach dem Zusammenführen kann der vollständige Datenstand über **„Backup herunterladen“** erneut gesichert werden.

Dieses Backup kann anschließend wieder auf die Geräte der beteiligten Prüfer verteilt werden.

Dabei ist zu beachten:

> **Achtung:** Das Wiederherstellen des gemeinsamen Backups überschreibt den vorhandenen Datenbestand auf dem jeweiligen Gerät vollständig.

Daher sollte das gemeinsame Backup erst verteilt werden, wenn alle benötigten Backups der einzelnen Prüfer zusammengeführt wurden.

### Empfohlener Ablauf

Für die Zusammenarbeit mehrerer Prüfer ergibt sich damit folgender Ablauf:

1. Gemeinsamen Ausgangsstand vorbereiten.
2. Backup des Ausgangsstands erstellen.
3. Backup an die Prüfer verteilen.
4. Prüfer stellen das Backup auf ihren Geräten wieder her.
5. Prüfer führen ihre Prüfungen unabhängig voneinander durch.
6. Jeder Prüfer erstellt nach Abschluss ein eigenes Backup.
7. Gemeinsamen Datenstand sichern.
8. Backups der Prüfer einzeln nacheinander zusammenführen.
9. Nach jedem Vorgang den Ergebnisbericht kontrollieren.
10. Nach Abschluss ein Backup des gemeinsamen Datenstands erstellen.

> **Empfehlung:** Die ursprünglichen Backups der einzelnen Prüfer sollten bis zur Kontrolle des zusammengeführten Datenstands aufbewahrt werden. Dadurch kann bei einem Fehler jederzeit auf den jeweiligen Ausgangsstand zurückgegriffen werden.