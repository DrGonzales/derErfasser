# Device Management Specification

## Purpose

Verwaltet ortsveränderliche elektrische Geräte mit ihren Stammdaten und bietet eine schnelle Übersicht für die nächste Prüfung. Geräte sind die Grundlage für Prüfungen, Auswertungen, Exporte und Backups.

## Requirements

### Requirement: Gerätestammdaten

Die Anwendung SHALL zu jedem Gerät Typ, Hersteller, Modell, Seriennummer, Inventarnummer, Schutzklasse, Nennspannung, Nennleistung, Standort und Einsatzbereich dauerhaft speichern.

#### Scenario: Neues Gerät anlegen

- **WHEN** ein Prüfer die Stammdaten eines Geräts eingibt und speichert
- **THEN** sind alle Angaben dauerhaft mit diesem Gerät verknüpft

### Requirement: Vorschläge für Standorte

Die Anwendung SHALL bei der Eingabe von Standorten vorhandene Werte als Vorschläge anbieten.

#### Scenario: Wiederholter Standort

- **WHEN** ein Prüfer einen bereits verwendeten Standort erneut eingibt
- **THEN** wird der vorhandene Standort als Vorschlag angeboten

### Requirement: Suche, Filter und Sortierung

Die Anwendung SHALL in der Geräteliste Suche, Filter und Sortierung bieten und die Statusansichten `Offen`, `Abgearbeitet`, `Alle` und `Ausgemustert` bereitstellen.

#### Scenario: Gerät für die nächste Prüfung finden

- **WHEN** ein Prüfer einen Suchbegriff eingibt oder einen Statusfilter wählt
- **THEN** zeigt die Liste nur die passenden Geräte und ermöglicht den direkten Einstieg in die Prüfung
