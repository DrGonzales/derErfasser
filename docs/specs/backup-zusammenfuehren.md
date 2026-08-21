# Spezifikation: Backup zusammenführen

* Status: gültig
* Stand: 21.08.2026
* Betroffene Komponenten:
  * `src/components/admin/BackupMerge.svelte` (eigene Ansicht mit Bedienung und Ergebnisbericht)
  * `src/components/admin/AdminPage.svelte` (Wechsel-Kachel in der Administration)
  * `src/AppRoot.svelte` (Aktualisierung der Einträge-Liste nach dem Zusammenführen)
  * `src/lib/backupMergeService.ts` (Zusammenführungs-Logik)
  * `src/lib/db.ts` (`importRecord`/`importImage` — Übernahme mit ursprünglicher Id)

---

## Zweck

Ein Backup-ZIP wird **additiv** in den bestehenden Datenbestand zusammengeführt. Im Gegensatz zum „Backup wiederherstellen" (Restore) werden dabei keine vorhandenen Daten überschrieben oder gelöscht — der Backup-Inhalt ergänzt den lokalen Bestand.

Hauptanwendungsfall ist das **gleichzeitige Arbeiten mehrerer Prüfer an einem Prüfobjekt**: Jeder Prüfer erfasst seine Prüfungen auf seiner eigenen App-Installation. Über die Zusammenführung werden diese Teilergebnisse zu einem gemeinsamen Datenstand vereinigt, ohne dass eine der Erfassungen verloren geht. Die identischen Prüfobjekt-Daten (Meta) stellen dabei sicher, dass nur Backups desselben Prüfobjekts zusammengeführt werden können.

Auch einzeln nutzbar: Auf einem zweiten Gerät erfasste Prüfungen sollen in den eigenen Datenbestand übernommen werden, ohne die lokale Erfassung zu verlieren.

### Typischer Ablauf bei mehreren Prüfern

1. Jeder Prüfer erfasst seine Prüfungen lokal in seiner App-Installation.
2. Jeder Prüfer erstellt ein Backup (ZIP-Datei, siehe „Daten löschen"/Backup-Erstellung im Admin-Bereich) und gibt die Datei an die Person mit dem führenden Datenstand weiter.
3. Diese Person führt die empfangenen Backups **einzeln nacheinander** in ihren Datenstand zusammen.
4. Der Ergebnisbericht zeigt je Vorgang, welche Geräte und Inspectionen übernommen wurden und welche nicht (bereits vorhanden).
5. Der vereinigte Datenstand kann anschließend erneut als Backup exportiert und an alle Beteiligten verteilt werden.

---

## Bedienung

1. In der Administration befindet sich die Kachel **„Backup zusammenführen"** mit kurzem Hinweistext.
2. Der Button **„Zusammenführen öffnen"** wechselt in eine eigene Ansicht (im selben Layout wie die Administration, mit Zurück-Button zur Admin-Übersicht).
3. Dort wird per Button eine Backup-ZIP-Datei ausgewählt; der Vorgang startet sofort.
4. Während des Entpackens erscheint ein Fortschrittsbalken, danach der Ergebnisbericht (siehe unten).

---

## Voraussetzung: Prüfobjekt-Daten (Meta)

Die Zusammenführung ist nur zulässig, wenn die Prüfobjekt-Daten auf beiden Seiten vorhanden sind und in **allen Feldern identisch** sind:

* Prüfobjekt
* Namen
* Anschrift
* Ort
* Aktuelle Prüfung
* Auditor (Name, Anschrift, Ort, Prüfer)

Fehlen die Meta-Daten auf einer Seite oder weichen sie ab, wird der Vorgang mit verständlicher Fehlermeldung abgebrochen, **ohne dass Änderungen am Datenbestand erfolgen**.

---

## Zusammenführungsregeln

### Geräte-Zuordnung

Geräte werden anhand ihrer **Record-Id** zugeordnet.

### Im Backup neue Geräte

Ein Gerät, dessen Id im bestehenden Bestand nicht existiert, wird **vollständig übernommen**:

* Gerät samt allen Feldern (inkl. Ausmusterungsstatus und Neu-Marker)
* Standort
* Inspectionen samt Bilder und PDFs
* Die ursprüngliche Record-Id bleibt erhalten (wichtig für künftige Zusammenführungen).

### Bereits vorhandene Geräte

Bei einem Gerät, das im Bestand bereits existiert, werden nur die **Inspectionen übernommen, deren Prüfungsname (`inspectionName`) dort noch nicht vorhanden ist** — inklusive ihrer Bilder und PDFs.

Inspectionen mit bereits vorhandenem Prüfungsname werden **nicht** übernommen und im Ergebnisbericht gemeldet.

### Ausmusterung

Wurde im Backup ein Gerät mit einer übernommenen Inspection außer Betrieb gesetzt (Inspection-Status `ausser_betrieb`), wird auch das `deactivated`-Flag des bereits vorhandenen Geräts gesetzt.

### Bilder und PDFs

Benötigte Bild-/PDF-Anhänge werden in den lokalen Anhangsspeicher kopiert. Anhänge, deren Id lokal bereits existiert, bleiben unangetastet (kein Überschreiben bestehender Daten).

---

## Ergebnisbericht

Nach erfolgreichem Zusammenführen bleibt die Ansicht geöffnet und zeigt:

1. Eine Kennzahlenzeile: Anzahl eingefügter Geräte, zusammengeführter Inspectionen, nicht übernommener Inspectionen.
2. Drei Tabellen (jeweils nur dargestellt, wenn Einträge vorhanden sind):

| Tabelle | Spalten |
| --- | --- |
| Eingefügte Geräte | Typ, Hersteller, Modell, Seriennummer |
| Zusammengeführte Inspectionen | Typ, Hersteller, Modell, Seriennummer, Prüfungsname, Datum |
| Nicht übernommene Inspectionen (Prüfungsname bereits vorhanden) | Typ, Hersteller, Modell, Seriennummer, Prüfungsname, Datum |

In den Inspection-Tabellen steht **je Inspection eine Zeile** (nicht je Gerät).

Die Einträge-Liste wird nicht automatisch angezeigt; sie lädt die übernommenen Geräte beim nächsten Öffnen.

---

## Fehlerverhalten

Schlägt das Zusammenführen fehl (z. B. Meta-Abweichung, ungültige ZIP-Datei, IndexedDB-Fehler), erscheint eine verständliche Fehlermeldung in der Ansicht. Bei Abbruch wegen Meta-Abgleich erfolgt dies, bevor irgendeine Änderung geschrieben wird.

---

## Wiederholbarkeit

Das Zusammenführen desselben Backups ist mehrfach gefahrlos möglich: Bereits vorhandene Geräte werden anhand ihrer Id erkannt, Inspectionen anhand ihres Prüfungsnamens, Anhänge anhand ihrer Id — es entstehen keine Duplikate.
