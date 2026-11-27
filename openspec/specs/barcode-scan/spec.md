# Barcode Scan Specification

## Purpose

Ermöglicht das Erfassen von Seriennummern per Kamera, damit Geräte schnell gefunden oder neu angelegt werden können. Der Scan folgt den Einschränkungen des aktuellen Statusfilters.

## Requirements

### Requirement: Seriennummer per Kamera scannen

Die Anwendung SHALL die Kamera nutzen, um einen Barcode oder QR-Code als Seriennummer zu lesen.

#### Scenario: Gerät finden

- **WHEN** ein Prüfer den Barcode eines Geräts scannt
- **THEN** wird die gelesene Seriennummer für die Suche oder Eingabe verwendet

### Requirement: Filterbewusster Scan

Die Anwendung SHALL beim Suchen per Barcode nur Geräte berücksichtigen, die zum aktuell gewählten Statusfilter passen.

#### Scenario: Ausgemustertes Gerät scannen

- **WHEN** ein ausgemustertes Gerät bei einem anderen Statusfilter gescannt wird
- **THEN** wird es nicht gefunden

#### Scenario: Scan im Filter Ausgemustert

- **WHEN** der Filter `Ausgemustert` aktiv ist
- **THEN** kann das ausgemusterte Gerät gefunden werden

### Requirement: Fehlerverhalten

Die Anwendung SHALL bei fehlender Kameraberechtigung oder nicht lesbarem Code eine verständliche Meldung anzeigen und die manuelle Eingabe der Seriennummer weiterhin erlauben.

#### Scenario: Kamera nicht verfügbar

- **WHEN** kein Kamerazugriff besteht
- **THEN** erscheint eine verständliche Meldung und die Seriennummer kann manuell eingegeben werden
