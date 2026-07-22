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
- Neu: ein **Dashboard** mit Übersicht über die aktuelle Prüfung, erreichbar
  über einen eigenen Button im Kopfbereich der App. Es zeigt auf einen Blick:
  - die Gesamtzahl der Geräte sowie die Anzahl aktiver und ausgemusterter
    Geräte,
  - den Prüfstatus (aktuell geprüft / offen / ausgemustert) als Diagramm,
  - das Prüfergebnis (bestanden / nicht bestanden / kein Ergebnis) als
    Diagramm,
  - den Gerätezustand (vorhanden / defekt / außer Betrieb / nicht
    auffindbar) als Diagramm.
  Alle Zahlen und Diagramme beziehen sich auf die aktuell eingestellte
  Prüfung.
- Im Dashboard gibt es jetzt einen Button „Bericht erzeugen“, mit dem sich
  ein PDF-Bericht zur aktuellen Prüfung herunterladen lässt. Der Bericht
  enthält:
  - ein Deckblatt mit den Angaben zum Prüfobjekt, Namen, Anschrift, Ort und
    der aktuellen Prüfung,
  - eine Übersichtsseite mit den Diagrammen zu Prüfstatus, Prüfergebnis und
    Gerätezustand,
  - Listen aller geprüften Geräte, getrennt nach den Ergebnissen „Bestanden“,
    „Nicht bestanden“ und „Kein Ergebnis“, jeweils mit Standort, Seriennummer,
    den einzelnen Prüfwerten (Sichtprüfung, Funktionsprüfung, Messung,
    Gesamtergebnis) als Tabelle sowie einem eventuell hinterlegten Hinweis,
  - eigene Listen für Geräte mit dem Zustand „Nicht auffindbar“ und
    „Außer Betrieb“,
  - eine Seitenzahl am Ende jeder Seite.
  Geräte ohne aktuelle Prüfung oder mit einem anderen Gerätezustand tauchen
  in diesen Listen nicht auf.
- In der Geräteliste gibt es jetzt am rechten Rand jeder Karte einen
  zusätzlichen Schnellzugriff auf die Prüfung: Ist noch keine aktuelle
  Prüfung vorhanden, erscheint ein grünes „+“-Feld zum Anlegen einer neuen
  Prüfung; ist bereits eine aktuelle Prüfung vorhanden, erscheint ein gelbes
  Stift-Feld zum Bearbeiten. Beide öffnen direkt den Prüfungs-Editor, ohne
  den Umweg über die Geräteansicht.
- Neben Bildern können bei einem Gerät und bei einer Prüfung jetzt auch
  **PDF-Dateien** (z. B. Datenblätter oder Prüfprotokolle) hochgeladen
  werden, per Klick oder Drag & Drop, bis zu 20 MB je Datei. PDFs werden in
  einer eigenen Liste getrennt von den Bildern angezeigt, mit einem
  PDF-Symbol und dem Dateinamen. Ein Klick öffnet die Datei in einem neuen
  Tab.
- Hochgeladene Bilder und PDFs lassen sich jetzt auch wieder löschen: Beim
  Überfahren mit der Maus erscheint ein roter Papierkorb (bei Bildern oben
  rechts auf der Vorschau, bei PDFs rechts neben dem Dateinamen). Vor dem
  endgültigen Löschen erscheint eine Sicherheitsabfrage.
- Im Admin-Bereich gibt es jetzt zusätzlich einen Link „Anleitung“. Darüber
  öffnet sich eine ausführliche Bedienungsanleitung der App direkt als
  Fenster, ganz ohne Internetverbindung.

### Verbessert
- Die App startet jetzt merklich schneller, da der Code für den PDF-Bericht
  und für Backup/Wiederherstellung erst bei tatsächlicher Nutzung geladen
  wird, statt beim App-Start immer mitgeladen zu werden.
- Der Kopfbereich der App mit Logo, Titel und den Buttons für Dashboard und
  Administration wird jetzt einheitlich in allen Bereichen angezeigt (bisher
  nur in der Geräteliste). Von Dashboard und Administration kann dadurch
  direkt zum jeweils anderen Bereich gewechselt werden, ohne zuerst zur
  Geräteliste zurückzukehren.
- Alle „Zurück“-Schaltflächen (in der Geräte-Detailansicht, im Dashboard und
  in der Administration) sehen jetzt einheitlich aus.
