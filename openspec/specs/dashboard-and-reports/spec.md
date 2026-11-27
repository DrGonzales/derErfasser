# Dashboard and Reports Specification

## Purpose

Zeigt den aktuellen Stand einer Prüfrunde und erzeugt einen vollständigen PDF-Prüfbericht. Auswertungen und Berichte helfen, Prüffortschritt und Ergebnisse nachvollziehbar darzustellen.

## Requirements

### Requirement: Dashboard-Kennzahlen

Die Anwendung SHALL im Dashboard die Anzahl geprüfter Geräte, offene Prüfungen, bestandene und nicht bestandene Prüfungen sowie Gerätezustände und passende Diagramme anzeigen.

#### Scenario: Prüfrunde eröffnen

- **WHEN** ein Nutzer das Dashboard öffnet
- **THEN** sieht er Kennzahlen und Diagramme zum aktuellen Stand der Prüfrunde

### Requirement: Vollständiger PDF-Prüfbericht

Die Anwendung SHALL mit einem Klick einen PDF-Bericht mit Deckblatt, Zusammenfassung, Diagrammen, Listen geprüfter Geräte und Ergebnissen der Prüfungen erzeugen.

#### Scenario: Bericht erzeugen

- **WHEN** ein Nutzer den Bericht auslöst
- **THEN** enthält das PDF die vorgesehenen Abschnitte und die Ergebnisse der gespeicherten Prüfungen

### Requirement: Lokale Berichterzeugung

Die Anwendung SHALL den Bericht vollständig lokal erzeugen, ohne Netzwerkverbindung oder externe Dienste.

#### Scenario: Bericht ohne Empfang

- **WHEN** ein Prüfer den Bericht ohne Internetverbindung auslöst
- **THEN** wird das PDF lokal erzeugt
