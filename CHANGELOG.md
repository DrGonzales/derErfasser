# Changelog

Alle wichtigen Änderungen an diesem Projekt werden hier dokumentiert.

## Unreleased

### Neu
- Geräte können jetzt als „ausgemustert“ markiert werden. In der Geräteliste
  gibt es dafür einen eigenen Filter-Chip „Ausgemustert“. Ausgemusterte
  Geräte werden in allen anderen Ansichten (Offen/Abgearbeitet/Alle) nicht
  mehr angezeigt und tauchen nur noch unter „Ausgemustert“ auf – unabhängig
  davon, ob eine aktuelle Prüfung für das Gerät vorliegt. Das Prüf-Symbol
  solcher Geräte wird zur besseren Erkennbarkeit rot dargestellt.
- Wird bei einer Prüfung der Gerätezustand auf „Außer Betrieb“ gesetzt, wird
  das Gerät automatisch als „ausgemustert“ markiert und erscheint danach nur
  noch im „Ausgemustert“-Filter der Geräteliste. Wird bei einer späteren
  Prüfung ein anderer Gerätezustand gewählt, wird die Markierung als
  „ausgemustert“ wieder aufgehoben.
- Neues Logo (Messleitungen-Symbol) für App-Icon, Startbildschirm und
  Splash-Screen eingesetzt. Der Titel der App wurde von „Der Erfasser!“ in
  „Prüftool“ geändert und wird zusammen mit dem neuen Logo im Kopfbereich
  der App sowie beim Start (Splash-Screen) angezeigt.
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
- Im Admin-Bereich gibt es jetzt unten einen Link „Changelog“. Darüber lässt
  sich diese Liste der Änderungen direkt in der App als Fenster (Modal)
  anzeigen, ganz ohne Internetverbindung.
