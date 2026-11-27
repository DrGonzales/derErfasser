# Excel Import Export Specification

## Purpose

Erlaubt den Austausch der Geräteliste über Excel-Dateien. Der Import beginnt mit interaktiver Spaltenzuordnung, der Export bleibt kompatibel mit bestehenden Dateien und enthält keine Anhänge.

## Requirements

### Requirement: Interaktive Spaltenzuordnung

Die Anwendung SHALL beim Excel-Import eine Zuordnung der Dateispalten zu den Gerätefeldern durch den Nutzer ermöglichen.

#### Scenario: Abweichende Spaltenreihenfolge

- **WHEN** eine Excel-Datei mit anderer Spaltenreihenfolge importiert wird
- **THEN** kann der Nutzer die Spalten zuordnen und anschließend den Import starten

### Requirement: Export der Geräteliste

Die Anwendung SHALL die Geräteliste in einem bestehenden Excel-Format exportieren und dabei Bilder und PDFs ausschließen.

#### Scenario: Excel-Export starten

- **WHEN** ein Nutzer den Excel-Export aufruft
- **THEN** enthält die Datei die Geräteliste ohne Anhänge

### Requirement: Fehlertoleranter Import

Die Anwendung SHALL Importfehler verständlich melden und die Datenintegrität wahren, statt fehlerhafte Daten stillschweigend zu übernehmen.

#### Scenario: Ungültige Excel-Datei

- **WHEN** eine ungültige Excel-Datei ausgewählt wird
- **THEN** erscheint eine verständliche Fehlermeldung und der bestehende Bestand bleibt unverändert

### Requirement: Importierte Geräte

Die Anwendung SHALL neu importierte Geräte als neu markieren und sie über den Filter `Neu` auffindbar machen; der Ausmusterungsstatus SHALL nicht importiert werden.

#### Scenario: Import mehrerer Geräte

- **WHEN** der Import neue Geräte anlegt
- **THEN** erscheinen sie unter `Neu` und starten als aktive Geräte
