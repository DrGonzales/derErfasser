# Backup and Restore Specification

## Purpose

Sichert den vollständigen lokalen Datenbestand als ZIP-Datei und stellt ihn wieder her. Ein Backup ist der Transportweg zwischen Geräten und die Grundlage für die Zusammenführung mehrerer Prüfer.

## Requirements

### Requirement: Vollständiger Backup-Export

Die Anwendung SHALL alle Geräte und Prüfhistorien als `records.json`, die Prüfobjekt-Daten optional als `meta.json` und alle Bilder und PDFs im Ordner `images/` in einer ZIP-Datei exportieren.

#### Scenario: Backup erstellen

- **WHEN** ein Nutzer den Backup-Export startet
- **THEN** enthält die erzeugte ZIP-Datei Geräte, Prüfhistorien, vorhandene Meta-Daten und Anhänge

### Requirement: Vollständige Wiederherstellung

Die Anwendung SHALL ein Backup als vollständigen Ersatz für den lokalen Datenbestand wiederherstellen; vorhandene Daten SHALL dabei überschrieben werden.

#### Scenario: Backup auf einem anderen Gerät wiederherstellen

- **WHEN** ein Nutzer ein gültiges Backup importiert
- **THEN** entspricht der lokale Datenbestand anschließend dem Backup

### Requirement: Validierung vor dem Schreiben

Die Anwendung SHALL ein Backup vor dem Schreiben prüfen und bei einer ungültigen Datei oder einem Speicherfehler eine verständliche Meldung anzeigen, ohne den bestehenden Bestand teilweise zu überschreiben.

#### Scenario: Ungültige ZIP-Datei

- **WHEN** ein Nutzer eine beschädigte ZIP-Datei wiederherstellen will
- **THEN** erscheint eine verständliche Fehlermeldung und der bestehende Datenbestand bleibt unverändert

### Requirement: Transport zwischen Geräten

Die Anwendung SHALL ein Backup so erstellen, dass es auf einer anderen Installation wiederhergestellt werden kann.

#### Scenario: Gerätewechsel

- **WHEN** ein Backup von einem Gerät auf ein zweites Gerät übertragen und dort wiederhergestellt wird
- **THEN** sind Geräte, Prüfungen und Anhänge dort vollständig vorhanden
