# Spezifikation: Gerät klonen

* Status: gültig
* Stand: 21.08.2026
* Betroffene Komponenten:
  * `src/components/mobiles/DeviceEditor.svelte` (Klon-Button, Klon-Erstellung)
  * `src/lib/models/Device.ts` (`cloned`-Marker)
  * `src/components/mobiles/EntriesList.svelte` („Neu"-Filter, blaue Markierung)

---

## Zweck

Mit der Klon-Funktion lässt sich schnell ein neues Gerät als Kopie eines bereits gespeicherten Geräts anlegen, ohne alle Stammdaten von Hand neu eintragen zu müssen. Typischer Anwendungsfall: mehrere baugleiche Geräte am selben Standort.

---

## Voraussetzungen

Der Button **„Klonen"** erscheint im Geräte-Editor nur bei bereits gespeicherten Geräten (nicht beim Anlegen eines neuen Geräts) und ist deaktiviert, solange:

* ungespeicherte Änderungen im Formular vorliegen (Tooltip-Hinweis: „Klonen ist erst nach dem Speichern der Änderungen möglich"),
* eine Speicher-, Lösch- oder Klon-Aktion läuft.

Nach dem Speichern oder Verwerfen der Änderungen wird der Button wieder einsatzbereit.

---

## Übernommene Daten

Der Klon erhält vom Original-Gerät:

* Typ
* Hersteller
* Modell
* Schutzklasse
* Nennspannung
* Nennleistung
* Standort (Standortname, Gebäude, Raum)

---

## Bewusst nicht übernommene Daten

Folgende Daten beziehen sich auf ein konkretes physisches Gerät bzw. dessen Prüfhistorie und werden bewusst **nicht** übernommen:

* Seriennummer (bleibt leer und muss neu vergeben werden; leeres Feld wird farblich hervorgehoben)
* Bilder
* PDFs
* Prüfhistorie (Inspektionen)
* Ausmusterungsstatus (der Klon startet als aktives Gerät)

---

## Klon-Marker und „Neu"-Filter

Der Klon wird mit dem Marker `cloned = true` angelegt. Damit gilt:

* Der Klon wird in der Geräteliste blau markiert.
* Der Klon ist über den Filter-Chip **„Neu"** auffindbar (gemeinsam mit per Excel-Import neu angelegten Geräten).
* Der Marker entfällt automatisch bei der ersten gespeicherten Bearbeitung des Klons; danach erscheint das Gerät nicht mehr unter „Neu".

---

## Ablauf nach Klick auf „Klonen"

1. Das Klon-Gerät wird sofort als neuer Datensatz angelegt.
2. Der Editor bleibt für das Original-Gerät geöffnet; ein Hinweis-Dialog („Gerät geklont") bestätigt den erfolgreichen Vorgang.
3. Die Einträge-Liste enthält den neuen Datensatz beim nächsten Öffnen.

---

## Datenstand beim Klonen (definiertes Verhalten)

Der Klon übernimmt die Werte aus der aktuell geöffneten Editor-Sitzung. Daraus folgt:

* Werden Werte des Geräts geändert, gespeichert und anschließend — ohne die Geräteansicht erneut zu öffnen — geklont, enthält der Klon den Datenstand aus der zuvor geöffneten Sitzung. Dies betrifft insbesondere den Standort: Gespeicherte Standort-Änderungen fließen erst nach erneutem Öffnen der Geräteansicht bzw. des Editors in Formular und Klon ein.
* Dieses Verhalten ist definiert und gewollt, kein Fehler.

---

## Fehlerverhalten

Schlägt das Anlegen des Klons fehl (z. B. IndexedDB-Fehler), wird keine Kopie angelegt und eine verständliche Fehlermeldung im Editor angezeigt. Das Original-Gerät bleibt unverändert.
