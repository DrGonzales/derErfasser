# Changelog

Alle wichtigen Änderungen an diesem Projekt werden hier dokumentiert.

## Unreleased

### Neu
- Beim Anlegen/Bearbeiten eines Geräts werden für die Felder **Standortname**,
  **Gebäude** und **Raum** jetzt Vorschläge aus bereits vorhandenen Geräten
  angezeigt. Man kann also entweder einen bekannten Wert per Dropdown
  auswählen oder wie bisher frei Text eingeben.
- Beim Bearbeiten des Prüfobjekts wird für das Feld **Aktuelle Prüfung**
  ebenfalls ein Dropdown mit bereits verwendeten Prüfungsnamen angeboten,
  auch hier weiterhin mit freier Eingabe möglich.
- Diese Vorschlagslisten werden einmalig beim Start der App aus dem
  gesamten vorhandenen Datenbestand zusammengestellt (damit die App dadurch
  nicht langsamer wird) und laufend ergänzt, sobald neue Werte eingegeben
  werden – ganz ohne Neuladen der App.
- Nach dem Wiederherstellen eines Backups oder dem Löschen aller Daten
  werden diese Vorschlagslisten automatisch neu aufgebaut, damit sie immer
  zum aktuellen Datenbestand passen.
