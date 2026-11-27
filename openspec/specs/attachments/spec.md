# Attachments Specification

## Purpose

Verknüpft Bilder und PDF-Dokumente dauerhaft mit Geräten und Prüfungen. Anhänge bleiben über Neustarts, Backups und Wiederherstellungen erhalten und werden erst bei Bedarf geladen.

## Requirements

### Requirement: Anhänge je Gerät und Prüfung

Die Anwendung SHALL erlauben, Bilder und PDF-Dokumente einem Gerät oder einer Prüfung hinzuzufügen.

#### Scenario: Bedienungsanleitung hinzufügen

- **WHEN** ein Nutzer ein PDF als Gerätedokument auswählt
- **THEN** ist es dauerhaft mit diesem Gerät verknüpft

#### Scenario: Foto einer Prüfung hinzufügen

- **WHEN** ein Nutzer ein Bild zu einer Prüfung hinzufügt
- **THEN** ist es dauerhaft mit dieser Prüfung verknüpft

### Requirement: Erhalt der Zuordnung

Die Anwendung SHALL die Zuordnung von Anhängen nach dem Neuladen der Anwendung sowie nach Backup und Wiederherstellung erhalten.

#### Scenario: Gerät nach Neustart öffnen

- **WHEN** ein Nutzer ein Gerät mit Anhängen nach einem Neustart öffnet
- **THEN** sind die Anhänge weiterhin zugeordnet

#### Scenario: Backup wiederherstellen

- **WHEN** ein Backup mit Anhängen wiederhergestellt wird
- **THEN** sind die Anhänge ihren Geräten und Prüfungen weiterhin zugeordnet

### Requirement: Bedarfsgerechtes Laden

Die Anwendung SHALL Bilder und Blobs erst laden, wenn sie angezeigt oder weiterverarbeitet werden, damit Listen mit vielen Anhängen flüssig bleiben.

#### Scenario: Geräteliste mit vielen Bildern

- **WHEN** eine Liste mit vielen Geräten und Bildern geöffnet wird
- **THEN** bleibt die Liste bedienbar und lädt Bilder erst bei Bedarf
