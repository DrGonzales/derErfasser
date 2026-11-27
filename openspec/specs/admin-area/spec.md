# Admin Area Specification

## Purpose

Bündelt verwaltende Aufgaben: Prüfobjekt-Daten, Backup-Wiederherstellung und -Zusammenführung, Excel-Import/-Export sowie das Löschen aller Daten. Diese Aufgaben bleiben von der täglichen Prüferfassung getrennt.

## Requirements

### Requirement: Prüfobjekt-Daten verwalten

Die Anwendung SHALL im Admin-Bereich die Prüfobjekt-Daten als zentrale Angaben bearbeiten und speichern können.

#### Scenario: Prüfobjekt umziehen

- **WHEN** ein Nutzer Namen, Anschrift oder Ort des Prüfobjekts ändert
- **THEN** sind die neuen Angaben nach dem Speichern im gesamten Datenbestand maßgeblich

### Requirement: Zugriff auf Datenwerkzeuge

Die Anwendung SHALL im Admin-Bereich Backup wiederherstellen, Backup zusammenführen, Excel importieren, Excel exportieren und Daten löschen anbieten.

#### Scenario: Admin-Bereich öffnen

- **WHEN** ein Nutzer den Admin-Bereich öffnet
- **THEN** stehen alle Verwaltungsfunktionen als eigene Einstiege zur Verfügung

### Requirement: Kontrolliertes Löschen

Die Anwendung SHALL das Löschen des Datenbestands nur über den Admin-Bereich auslösen und den Erfolg sichtbar melden; fehlgeschlagene Löschvorgänge SHALL nicht als Erfolg dargestellt werden.

#### Scenario: Datenbestand löschen

- **WHEN** ein Nutzer das Löschen im Admin-Bereich ausführt
- **THEN** ist der Datenbestand anschließend entfernt und der Vorgang sichtbar bestätigt
