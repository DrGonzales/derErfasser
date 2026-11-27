# Inspections Specification

## Purpose

Dokumentiert Sicherheitsprüfungen je Gerät mit Sichtprüfung, Funktionsprüfung, Messwerten und Bewertung. Jede Prüfung bleibt als Teil der Historie erhalten, damit Prüfverläufe über Jahre nachvollziehbar sind.

## Requirements

### Requirement: Vollständige Prüfdokumentation

Die Anwendung SHALL je Prüfung Sichtprüfung, Funktionsprüfung, Messwerte für Schutzleiterwiderstand, Isolationswiderstand, Ersatzableitstrom und Berührungsstrom, Gesamtbewertung sowie Gerätezustand erfassen.

#### Scenario: Prüfung speichern

- **WHEN** ein Prüfer eine Prüfung mit Messwerten und Gesamtbewertung speichert
- **THEN** sind alle Angaben dauerhaft mit dem Gerät verknüpft

### Requirement: Grenzwert-Hinweise je Schutzklasse

Die Anwendung SHALL beim Erfassen einer Prüfung Grenzwert-Hinweise passend zur Schutzklasse des Geräts anzeigen.

#### Scenario: Gerät der Schutzklasse I prüfen

- **WHEN** ein Prüfer für ein Gerät der Schutzklasse I Messwerte eingibt
- **THEN** werden die Hinweise angezeigt, die zu dieser Schutzklasse passen

### Requirement: Prüfhistorie statt Überschreiben

Die Anwendung SHALL jede Prüfung dauerhaft erhalten und eine neue Prüfrunde als neuen Datensatz anlegen, statt vorhandene Prüfungen zu überschreiben.

#### Scenario: Wiederholungsprüfung

- **WHEN** ein Prüfer eine neue Prüfrunde für ein bereits geprüftes Gerät speichert
- **THEN** bleibt die frühere Prüfung abrufbar und die neue Prüfung wird zusätzlich gespeichert

### Requirement: Vorschläge für Prüfungsnamen

Die Anwendung SHALL bei der Eingabe von Prüfungsnamen vorhandene Werte als Vorschläge anbieten.

#### Scenario: Wiederholter Prüfungsname

- **WHEN** ein Prüfer einen bereits verwendeten Prüfungsnamen neu eingibt
- **THEN** wird der vorhandene Name als Vorschlag angeboten
