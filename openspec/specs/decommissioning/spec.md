# Decommissioning Specification

## Purpose

Kennzeichnet Geräte als „Außer Betrieb“, ohne dass ein separater Button nötig ist. Der Gerätezustand der zuletzt gespeicherten Prüfung bestimmt, ob ein Gerät aktiv oder ausgemustert ist. Details: `docs/specs/ausmusterung.md`.

## Requirements

### Requirement: Automatische Ausmusterung

Die Anwendung SHALL ein Gerät automatisch als ausgemustert markieren, wenn eine neu oder bearbeitet gespeicherte Prüfung den Gerätezustand `Außer Betrieb` hat.

#### Scenario: Prüfung mit Außer Betrieb speichern

- **WHEN** ein Prüfer eine Prüfung mit dem Gerätezustand `Außer Betrieb` speichert
- **THEN** wird das Gerät automatisch ausgemustert

### Requirement: Automatische Aufhebung

Die Anwendung SHALL eine Ausmusterung beim Speichern einer späteren Prüfung aufheben, wenn deren Gerätezustand nicht `Außer Betrieb` ist.

#### Scenario: Gerät wieder in Betrieb nehmen

- **WHEN** ein Prüfer für ein ausgemustertes Gerät eine Prüfung mit einem anderen Gerätezustand speichert
- **THEN** ist das Gerät wieder aktiv

### Requirement: Sichtbarkeit ausgemusterter Geräte

Die Anwendung SHALL ausgemusterte Geräte aus den Ansichten `Offen`, `Abgearbeitet`, `Alle` und `Neu` ausblenden und ausschließlich unter dem Filter `Ausgemustert` anzeigen.

#### Scenario: Filter Ausgemustert

- **WHEN** ein Nutzer den Filter `Ausgemustert` aktiviert
- **THEN** erscheinen nur ausgemusterte Geräte, deutlich markiert

#### Scenario: Barcode-Scan mit aktivem Statusfilter

- **WHEN** ein Barcode-Scan bei einem anderen Statusfilter ausgeführt wird
- **THEN** werden nur Geräte des aktuellen Filters berücksichtigt

### Requirement: Ausmusterung in Auswertungen und Exporten

Die Anwendung SHALL die Anzahl ausgemusterter Geräte im Dashboard ausweisen, im PDF-Bericht einen Abschnitt `Ergebnisse : Außer Betrieb` erzeugen und den Status im Excel-Export ausgeben; der Excel-Import SHALL den Status nicht übernehmen.

#### Scenario: Bericht und Excel-Austausch

- **WHEN** ein ausgemustertes Gerät im Bericht und im Excel-Export erscheint
- **THEN** sind die Kennzahl, der eigene Berichtsabschnitt und die Exportspalte vorhanden

#### Scenario: Import eines Geräts

- **WHEN** ein Gerät per Excel importiert wird
- **THEN** startet es als aktives Gerät

### Requirement: Ausmusterung bei Klonen und Backup-Zusammenführung

Die Anwendung SHALL einen Klon stets aktiv anlegen und SHALL eine Ausmusterung beim Zusammenführen eines Backups nur setzen, niemals aufheben.

#### Scenario: Klon eines ausgemusterten Geräts

- **WHEN** ein ausgemustertes Gerät geklont wird
- **THEN** startet der Klon als aktives Gerät

#### Scenario: Backup mit Außer-Betrieb-Prüfung zusammenführen

- **WHEN** eine übernommene Prüfung den Zustand `Außer Betrieb` hat
- **THEN** wird das Zielgerät ausgemustert; eine bestehende Ausmusterung bleibt erhalten
