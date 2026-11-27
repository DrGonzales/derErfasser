# Local Data Storage Specification

## Purpose

Hält alle Prüfobjekt-, Geräte-, Prüf- und Anhangsdaten ausschließlich lokal im Browser. Die Datenbank `der-erfasser-db` ist die einzige Datenquelle; eine Übertragung an externe Stellen gibt es nicht.

## Requirements

### Requirement: Lokale Persistenz

Die Anwendung SHALL Geräte, Prüfungen, Prüfobjekt-Daten und Anhänge dauerhaft in der lokalen IndexedDB speichern.

#### Scenario: Neustart des Browsers

- **WHEN** ein Nutzer Geräte und Prüfungen erfasst und den Browser anschließend neu startet
- **THEN** sind alle erfassten Daten weiterhin vorhanden

### Requirement: Keine Übertragung von Nutzerdaten

Die Anwendung SHALL Nutzerdaten nicht an externe Server übertragen und SHALL keine Benutzerkonten oder Cloud-Speicherung voraussetzen.

#### Scenario: Arbeiten mit und ohne Netzwerk

- **WHEN** ein Nutzer Geräte, Prüfungen oder Anhänge speichert
- **THEN** verbleiben die Daten ausschließlich auf seinem Gerät und es wird keine externe Speicherung verwendet

### Requirement: Koexistenz alter und neuer Record-Ids

Die Anwendung SHALL bestehende Datensätze mit numerischer Id und neue Datensätze mit UUID gleichermaßen gültig behandeln.

#### Scenario: Wiederherstellen eines älteren Backups

- **WHEN** ein Backup mit numerischen Record-Ids wiederhergestellt wird
- **THEN** werden die Geräte weiterhin korrekt zugeordnet und bleiben bearbeitbar

### Requirement: Getrennte Speicherung der Anhänge

Die Anwendung SHALL Bilder und PDFs als Blobs getrennt von den Geräte- und Prüfdatensätzen speichern und über Referenzen mit ihnen verknüpfen.

#### Scenario: Speichern eines Anhangs

- **WHEN** ein Bild zu einer Prüfung hinzugefügt wird
- **THEN** bleibt das Bild nach dem Neuladen der Prüfung zugeordnet
