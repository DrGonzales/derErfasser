# Backup Merge Specification

## Purpose

Führt ein Backup additiv in einen bestehenden Datenbestand zusammen, damit mehrere Prüfer getrennt erfasste Ergebnisse vereinigen können. Vorhandene Daten werden nicht überschrieben oder gelöscht. Details: `docs/specs/backup-zusammenfuehren.md`.

## Requirements

### Requirement: Identische Prüfobjekt-Daten als Voraussetzung

Die Anwendung SHALL das Zusammenführen nur erlauben, wenn die Prüfobjekt-Daten auf beiden Seiten vorhanden und in allen Feldern identisch sind.

#### Scenario: Abweichende Meta-Daten

- **WHEN** Prüfobjekt, Namen, Anschrift, Ort, aktuelle Prüfung oder Auditor-Daten abweichen
- **THEN** bricht die Anwendung mit einer verständlichen Meldung ab, bevor irgendetwas geschrieben wird

#### Scenario: Identische Meta-Daten

- **WHEN** alle Prüfobjekt-Daten übereinstimmen
- **THEN** darf das Zusammenführen fortgesetzt werden

### Requirement: Additive Übernahme neuer Geräte

Die Anwendung SHALL Geräte, deren Id im Bestand fehlt, vollständig übernehmen, einschließlich Standort, Prüfungen, Anhängen, Ausmusterungsstatus und Neu-Marker; die ursprüngliche Id SHALL erhalten bleiben.

#### Scenario: Gerät eines zweiten Prüfers übernehmen

- **WHEN** das Backup ein Gerät mit unbekannter Id enthält
- **THEN** wird es vollständig und mit derselben Id in den Bestand übernommen

### Requirement: Übernahme fehlender Prüfungen

Die Anwendung SHALL bei bereits vorhandenen Geräten nur Prüfungen übernehmen, deren Prüfungsname lokal noch nicht vorhanden ist, inklusive ihrer Bilder und PDFs.

#### Scenario: Prüfung mit neuem Namen

- **WHEN** eine Prüfung im Backup einen noch nicht vorhandenen Prüfungsnamen hat
- **THEN** wird sie samt Anhängen übernommen

#### Scenario: Prüfung mit vorhandenem Namen

- **WHEN** eine Prüfung im Backup denselben Prüfungsnamen wie eine lokale Prüfung hat
- **THEN** wird sie nicht übernommen und im Ergebnisbericht gemeldet

### Requirement: Kein Überschreiben bestehender Anhänge

Die Anwendung SHALL benötigte Anhänge in den lokalen Speicher kopieren, aber Anhänge mit bereits vorhandener Id unangetastet lassen.

#### Scenario: Anhang-Id existiert bereits

- **WHEN** ein Anhang des Backups dieselbe Id wie ein lokaler Anhang hat
- **THEN** bleibt der vorhandene Anhang unverändert

### Requirement: Ausmusterung beim Zusammenführen

Die Anwendung SHALL das Zielgerät ausmusterern, wenn eine übernommene Prüfung den Zustand `Außer Betrieb` hat, und SHALL eine bestehende Ausmusterung nicht aufheben.

#### Scenario: Übernahme einer Außer-Betrieb-Prüfung

- **WHEN** eine Prüfung mit dem Zustand `Außer Betrieb` übernommen wird
- **THEN** wird das Zielgerät ausgemustert

### Requirement: Ergebnisbericht

Die Anwendung SHALL nach dem Zusammenführen die Anzahl eingefügter Geräte sowie übernommener und nicht übernommener Prüfungen anzeigen und die betroffenen Geräte und Prüfungen in Tabellen auflisten.

#### Scenario: Bericht nach dem Zusammenführen

- **WHEN** der Vorgang abgeschlossen ist
- **THEN** bleiben die Ansicht geöffnet und zeigen je übernommener Prüfung eine eigene Zeile

#### Scenario: Aktualisierung der Geräteliste

- **WHEN** die Geräteliste nach dem Zusammenführen erneut geöffnet wird
- **THEN** sind die übernommenen Geräte sichtbar

### Requirement: Wiederholbarkeit

Die Anwendung SHALL dasselbe Backup mehrfach gefahrlos zusammenführen können, ohne Duplikate zu erzeugen.

#### Scenario: Dasselbe Backup erneut zusammenführen

- **WHEN** ein bereits übernommenes Backup erneut ausgewählt wird
- **THEN** entstehen keine doppelten Geräte, Prüfungen oder Anhänge
