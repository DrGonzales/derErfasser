# Spezifikation: Ausmusterungsprozess

* Status: gültig
* Stand: 21.08.2026
* Betroffene Komponenten:
  * `src/components/mobiles/InspectionEditor.svelte` (Auslöser: Gerätezustand der Prüfung)
  * `src/lib/models/Device.ts` (`deactivated`-Flag)
  * `src/lib/models/Inspection.ts` (`DeviceStatus.AusserBetrieb`)
  * `src/components/mobiles/EntriesList.svelte` (Sichtbarkeit, Filter-Chip „Ausgemustert", rote Markierung)
  * `src/components/dashboard/Dashboard.svelte` (Kennzahlen und Listen)
  * `src/lib/reportService.ts` (PDF-Bericht, Abschnitt „Ergebnisse : Außer Betrieb")
  * `src/lib/exportService.ts` (Excel-Export-Spalte Ausmusterungsstatus)
  * `src/components/mobiles/DeviceEditor.svelte` (Klonen startet aktiv)
  * `src/lib/backupMergeService.ts` (Übernahme beim Backup-Zusammenführen)

---

## Begriff und Prinzip

Eine **Ausmusterung** kennzeichnet ein Gerät als außer Betrieb. Es gibt dafür **keinen separaten Button**: Die Ausmusterung wird aus dem **Gerätezustand der Prüfung** abgeleitet.

Datenmodell:

* Jede Inspection besitzt einen Gerätezustand (`status`) mit den Werten Vorhanden, Defekt, **Außer Betrieb** (`ausser_betrieb`) und Nicht auffindbar.
* Das Gerät besitzt das Flag `deactivated`. Es ist der **Spiegel des Zustands der zuletzt gespeicherten Prüfung**: `deactivated = true` genau dann, wenn die letzte gespeicherte Prüfung den Zustand „Außer Betrieb" hat.

---

## Auslösen

Wird eine Prüfung (neu oder als Bearbeitung einer bestehenden) mit dem Gerätezustand **„Außer Betrieb"** gespeichert, setzt die App das Gerät automatisch auf **ausgemustert** (`deactivated = true`). Ein manueller Eingriff ist nicht erforderlich.

---

## Aufheben

Wird bei einer späteren Prüfung ein anderer Gerätezustand gewählt (Vorhanden, Defekt oder Nicht auffindbar), wird die Ausmusterung beim Speichern automatisch wieder aufgehoben (`deactivated = false`). Der Zustand der jeweils letzten gespeicherten Prüfung bestimmt stets das Flag.

---

## Auswirkungen einer Ausmusterung

### Einträge-Liste

* Ausgemusterte Geräte werden in den Ansichten **„Offen"**, **„Abgearbeitet"**, **„Alle"** und **„Neu"** nicht mehr angezeigt.
* Sie erscheinen ausschließlich unter dem Filter-Chip **„Ausgemustert"** (rot) — dort unabhängig vom Prüfstatus der aktuellen Prüfung.
* Ausgemusterte Geräte werden in der Liste mit einem **roten Prüf-Symbol** gekennzeichnet.
* Der Barcode-Scan berücksichtigt nur Geräte, die zum aktuell gewählten Status-Filter passen; ein ausgemustertes Gerät wird also nur gefunden, wenn der Filter „Ausgemustert" aktiv ist.

### Dashboard

* Kennzahl „Außer Betrieb" (Anzahl ausgemusterter Geräte) inkl. Darstellung im Prüfstatus-Diagramm.
* Eigene Listen für Geräte mit Zustand „Nicht auffindbar" und „Außer Betrieb" je aktueller Prüfung.

### Bericht (PDF)

Ausgemusterte Geräte erhalten im PDF-Bericht einen eigenen Abschnitt **„Ergebnisse : Außer Betrieb"** (Geräteliste ohne Ergebnistabelle).

### Excel-Export / -Import

* Der Export enthält den Ausmusterungsstatus als Spalte.
* Der Excel-Import übernimmt den Ausmusterungsstatus **nicht**; importierte Geräte starten aktiv.

---

## Sonderfälle

### Gerät klonen

Der Klon startet stets als **aktives Gerät** (`deactivated = false`); der Ausmusterungsstatus des Originals wird bewusst nicht übernommen (siehe [Gerät klonen](./geraet-klonen.md)).

### Backup zusammenführen

Wird beim Zusammenführen eines Backups an ein bereits vorhandenes Gerät eine Inspection übernommen, deren Zustand „Außer Betrieb" ist, setzt die App das `deactivated`-Flag des Zielgeräts auf `true`. Das Zusammenführen hebt eine bestehende Ausmusterung **nie** auf (siehe [Backup zusammenführen](./backup-zusammenfuehren.md)).

### Löschverhalten

Inspectionen können nicht einzeln gelöscht werden. Das `deactivated`-Flag ändert sich daher ausschließlich durch:

1. Speichern einer Prüfung (neu oder bearbeitet),
2. Klonen eines Geräts (Klon startet aktiv),
3. Backup-Zusammenführen (setzt ggf. `true`, hebt nie auf).
