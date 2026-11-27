# Device Cloning Specification

## Purpose

Ermöglicht das schnelle Anlegen eines baugleichen Geräts aus einem gespeicherten Gerät. Stammdaten werden übernommen, physisch gerätebezogene Daten und die Prüfhistorie bewusst nicht. Details: `docs/specs/geraet-klonen.md`.

## Requirements

### Requirement: Klonen nur gespeicherter Geräte

Die Anwendung SHALL den Klon-Button nur bei bereits gespeicherten Geräten anbieten und ihn deaktivieren, solange ungespeicherte Änderungen oder eine laufende Speicher-, Lösch- oder Klon-Aktion vorliegen.

#### Scenario: Ungespeicherte Änderungen

- **WHEN** ein Nutzer ein Gerät bearbeitet, aber noch nicht gespeichert hat
- **THEN** ist der Klon-Button deaktiviert und weist auf das Speichern der Änderungen hin

#### Scenario: Klonen nach dem Speichern

- **WHEN** die Änderungen gespeichert wurden
- **THEN** ist der Klon-Button wieder verfügbar

### Requirement: Übernommene Daten

Die Anwendung SHALL für den Klon Typ, Hersteller, Modell, Schutzklasse, Nennspannung, Nennleistung und Standort einschließlich Gebäude und Raum übernehmen.

#### Scenario: Baugleiches Gerät anlegen

- **WHEN** ein Nutzer ein gespeichertes Gerät klont
- **THEN** enthält der Klon dieselben Stammdaten wie das Original

### Requirement: Nicht übernommene Daten

Die Anwendung SHALL Seriennummer, Bilder, PDFs, Prüfhistorie und Ausmusterungsstatus nicht übernehmen; die Seriennummer SHALL leer bleiben und hervorgehoben werden.

#### Scenario: Klon eines geprüften Geräts

- **WHEN** ein Gerät mit Prüfhistorie, Anhängen und Ausmusterung geklont wird
- **THEN** startet der Klon ohne diese Daten, mit leerer hervorgehobener Seriennummer und als aktives Gerät

### Requirement: Klon-Marker und Neu-Filter

Die Anwendung SHALL einen Klon mit `cloned = true` markieren, ihn blau in der Liste anzeigen und über den Filter `Neu` auffindbar machen; der Marker SHALL bei der ersten gespeicherten Bearbeitung entfallen.

#### Scenario: Erste Bearbeitung des Klons

- **WHEN** der Nutzer den Klon bearbeitet und speichert
- **THEN** erscheint er nicht mehr unter dem Filter `Neu`

### Requirement: Definierter Datenstand der Editor-Sitzung

Die Anwendung SHALL für den Klon den Datenstand der aktuell geöffneten Editor-Sitzung verwenden; gespeicherte Änderungen SHALL erst nach erneutem Öffnen der Geräteansicht in Formular und Klon einfließen.

#### Scenario: Standort nach dem Speichern ändern

- **WHEN** ein Standort gespeichert, die Geräteansicht nicht erneut geöffnet und anschließend geklont wird
- **THEN** enthält der Klon den zuletzt im Editor sichtbaren Standort

#### Scenario: Standort nach erneutem Öffnen ändern

- **WHEN** die Geräteansicht erneut geöffnet und danach geklont wird
- **THEN** enthält der Klon den gespeicherten neuen Standort

### Requirement: Fehlerverhalten beim Klonen

Die Anwendung SHALL bei einem Fehler keine Kopie anlegen, das Original unverändert lassen und eine verständliche Fehlermeldung anzeigen.

#### Scenario: IndexedDB-Fehler

- **WHEN** das Anlegen des Klons fehlschlägt
- **THEN** bleibt das Original unverändert und der Nutzer sieht eine verständliche Meldung
