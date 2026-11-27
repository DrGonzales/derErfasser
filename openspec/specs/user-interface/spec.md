# User Interface Specification

## Purpose

Hält die Bedienung einfach und übersichtlich, mit Priorität für Mobilgeräte und Tablets. Große Touch-Ziele, gute Lesbarkeit, helle und dunkle Darstellung sowie verständliche Fehlermeldungen sind Teil des Bedienkonzepts.

## Requirements

### Requirement: Mobile Bedienung

Die Anwendung SHALL auf Mobilgeräten und Tablets gut bedienbar sein und große Schaltflächen für Touch-Bedienung anbieten.

#### Scenario: Prüfung auf einem Tablet

- **WHEN** ein Prüfer eine Prüfung auf einem Tablet durchführt
- **THEN** kann er alle Schritte mit Touch-Bedienung abschließen

### Requirement: Helles und dunkles Design

Die Anwendung SHALL ein helles und ein dunkles Design unterstützen.

#### Scenario: Design wechseln

- **WHEN** ein Nutzer zwischen hellem und dunklem Design wechselt
- **THEN** bleibt die Oberfläche lesbar und vollständig bedienbar

### Requirement: Verständliche Fehlermeldungen

Die Anwendung SHALL Fehler nicht stillschweigend übergehen und stattdessen verständliche Meldungen auf Deutsch anzeigen.

#### Scenario: Speichern schlägt fehl

- **WHEN** das Speichern einer Prüfung fehlschlägt
- **THEN** erhält der Nutzer eine verständliche deutsche Meldung und der Fehler bleibt sichtbar

### Requirement: Flüssige Bedienung bei großen Datenmengen

Die Anwendung SHALL auch bei vielen Messungen und Bildern flüssig bedienbar bleiben.

#### Scenario: Viele Prüfungen und Bilder

- **WHEN** ein Gerät viele Prüfungen und Bilder enthält
- **THEN** bleibt die Oberfläche reaktionsfähig
