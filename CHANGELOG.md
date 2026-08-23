# Changelog

Alle wichtigen Änderungen an diesem Projekt werden hier dokumentiert.

## 23.08.2026 - Anwenderhandbuch als eigene Seite

Das Anwenderhandbuch öffnet sich nicht mehr als Popup-Fenster, sondern als eigene Seite mit Inhaltsverzeichnis in der Seitenleiste; über die klickbaren Kapitel-Links springt man direkt zum gewünschten Abschnitt, eine „Zurück"-Leiste bleibt dabei immer sichtbar. Zusätzlich wurden drei neue Kapitel ergänzt: „Prüfrunden und Prüfhistorie", „Arbeiten mit mehreren Prüfern" und „Excel-Import und Massendaten". Außerdem wurde die Breite von Geräteliste, Verwaltung, Dashboard und Anwenderhandbuch vereinheitlicht, sodass alle Seiten gleich breit und einheitlich aussehen, und der „Bericht erzeugen"-Button im Dashboard steht jetzt an erster Stelle in einer eigenen Kachel mit kurzem Hinweistext.

## 21.08.2026 - Backup zusammenführen

In der Administration gibt es eine neue Kachel „Backup zusammenführen“. Anders als beim „Backup wiederherstellen“, das alle vorhandenen Daten überschreibt, werden hier die Daten aus einer Backup-Datei zusätzlich in den bestehenden Bestand übernommen: Neue Geräte kommen komplett dazu, bei bereits vorhandenen Geräten werden nur Prüfungen ergänzt, die es dort noch nicht gibt – jeweils inklusive ihrer Bilder und PDFs. Vorher wird geprüft, ob die Angaben zum Prüfobjekt auf beiden Seiten übereinstimmen; ist das nicht der Fall, bricht der Vorgang mit einer Fehlermeldung ab, ohne etwas zu ändern. Nach dem Zusammenführen zeigt die Seite einen Bericht mit den eingefügten Geräten sowie den übernommenen und nicht übernommenen Prüfungen, und dasselbe Backup kann beliebig oft zusammengeführt werden, ohne dass Duplikate entstehen. So lassen sich die Erfassungen mehrerer Prüfer, die gleichzeitig am selben Prüfobjekt arbeiten, zu einem gemeinsamen Datenstand vereinen; vorhandene Bilder und PDFs werden dabei nie überschrieben, und wurde ein Gerät im Backup mit einer übernommenen Prüfung außer Betrieb gesetzt, wird es beim Zusammenführen ebenfalls ausgemustert.

## 13.08.2026 - Prüfungsname in mobiler Prüfungsliste

In der mobilen Ansicht der Prüfungsliste wird jetzt zusätzlich der Name der jeweiligen Prüfung angezeigt, zusammen mit Datum, Gerätezustand und Ergebnis. So lässt sich einfacher erkennen, zu welcher Prüfung ein Eintrag gehört.

## 13.08.2026 - "Klone"-Filter wird zu "Neu", auch für importierte Geräte

Der bisherige Filter-Chip „Klone" in der Geräteliste heißt jetzt „Neu" und zeigt neben geklonten Geräten jetzt auch Geräte an, die per Excel-Import neu angelegt wurden; beide werden weiterhin blau markiert, bis sie einmal bearbeitet wurden. Der Chip erscheint nur noch, wenn es tatsächlich neue Geräte gibt, und wechselt automatisch zurück zum Filter „Offen", wenn das letzte neu markierte Gerät bearbeitet wurde. Zusätzlich werden im Geräte-Editor ein leeres Seriennummer-Feld und eine fehlende Schutzklasse jetzt farblich hervorgehoben, damit sie leichter auffallen.

## 09.08.2026 - Neue Funktion "Gerät klonen"

Im Geräte-Editor gibt es einen neuen „Klonen"-Button, der bei bereits gespeicherten Geräten ohne ungespeicherte Änderungen angezeigt wird. Beim Klicken wird sofort eine Kopie des Geräts angelegt, die Typ, Hersteller, Modell, Schutzklasse, Nennspannung, Nennleistung und Standort übernimmt. Die Seriennummer bleibt leer und muss neu vergeben werden; Ausmusterungsstatus, Bilder, PDFs und Prüfhistorie werden bewusst nicht übernommen. Nach dem Klonen bleibt der Nutzer im Editor und erhält eine Bestätigungsmeldung. In der Geräteübersicht gibt es zudem einen neuen Filter-Chip „Klone", über den frisch geklonte, noch nicht bearbeitete Geräte gefunden werden können.

## 09.08.2026 - Auditor-Daten in Verwaltung und PDF-Bericht

In der Verwaltung unter „Prüfobjekt" können jetzt Angaben zum Auditor erfasst und bearbeitet werden: Name oder Firmenname, Anschrift, Ort und Name des Prüfers. Diese Daten werden auf dem Deckblatt des PDF-Berichts unterhalb der Prüfung angezeigt. Am Ende des Berichts gibt es zudem ein Unterschriftenfeld mit dem Namen des Prüfers, dem aktuellen Datum und einer Unterschriftslinie zum Unterzeichnen.

## 08.08.2026 - Neue Navigation und übersichtlicherer PDF-Bericht

In der Kopfzeile gibt es jetzt einen eigenen „Prüfen“-Button, mit dem sich
von Dashboard oder Administration direkt wieder zur Geräteprüfung wechseln
lässt; die bisherigen Zurück-Buttons in diesen Bereichen wurden dadurch
überflüssig und entfernt. Außerdem wurde das Layout der PDF-Berichte
überarbeitet: Die Tabellen sind kompakter gestaltet, Geräte-Informationen
und Prüfergebnisse sind klarer voneinander abgegrenzt und die Schriftgrößen
wurden vereinheitlicht.

## 07.08.2026 - App installierbar, Anleitung zur Offline-Nutzung, Fehlerbehebung

Im Admin-Bereich gibt es jetzt eine Kachel „App installieren“: Je nach
verwendetem Browser erscheint dort ein Installations-Button oder eine kurze
Anleitung, wie die App zum Startbildschirm hinzugefügt wird; ist die App
bereits installiert, wird das entsprechend angezeigt. Im Anwenderhandbuch
gibt es dazu ein neues Kapitel, das die Installation je Browser sowie das
Online- und Offline-Verhalten der App erklärt. Außerdem wurde ein Fehler
behoben, durch den sich die Geräte-Bearbeitung bei manchen älteren Geräten
mit einer Fehlermeldung nicht mehr öffnen ließ.

## 04.08.2026 - Barcode-Scan öffnet Geräteansicht direkt

Wird beim Scannen eines Barcodes in der Geräteliste genau ein Gerät mit exakt
übereinstimmender Seriennummer gefunden, öffnet sich dessen Geräteansicht
jetzt automatisch, ohne dass die Liste erst manuell durchsucht werden muss.
Beim Zurückgehen aus dieser automatisch geöffneten Ansicht wird der Filter
wieder geleert.

## 02.08.2026 - Excel-Import und -Export für Geräte

Geräte können jetzt über einen Spalten-Mapping-Assistenten aus einer Excel-
oder CSV-Datei importiert werden, inklusive Vorschau vor dem eigentlichen
Import. Fehlerhafte Zeilen werden dabei übersprungen, ohne den restlichen
Import abzubrechen. Ebenfalls neu ist der Excel-Export, mit dem sich der
gesamte Gerätebestand samt den Werten der aktuellen Prüfung als Excel-Datei
herunterladen lässt.

## 30.07.2026 - Schutzklasse mit Kennzeichen, Grenzwerten und neuen Messwerten

Beim Anlegen oder Bearbeiten eines Geräts kann jetzt die Schutzklasse
(I, II oder III) ausgewählt werden. Die App zeigt dazu direkt das typische
Kennzeichen und die erforderlichen Prüfungen an. Im Prüfungs-Editor können
zusätzlich der Schutzleiterwiderstand und der Ersatzableitstrom erfasst
werden, und zu jedem Messwert wird passend zur hinterlegten Schutzklasse der
zulässige Grenzwert eingeblendet.

## 22.07.2026 - Anleitung im Admin-Bereich und einheitlicher Kopfbereich

Im Admin-Bereich steht jetzt eine ausführliche Bedienungsanleitung direkt in
der App zur Verfügung, auch ohne Internetverbindung. Der Kopfbereich mit
Logo, Titel und den Buttons für Dashboard und Administration wird nun in
allen Bereichen der App einheitlich angezeigt, und alle „Zurück“-Schaltflächen
sehen jetzt gleich aus.

## 20.07.2026 - PDF-Upload, Löschen von Dateien und Prüfungs-Schnellzugriff

Neben Bildern können bei einem Gerät und bei einer Prüfung jetzt auch
PDF-Dateien hochgeladen werden, per Klick oder per Drag & Drop. Hochgeladene
Bilder und PDFs lassen sich außerdem wieder löschen, jeweils mit vorheriger
Sicherheitsabfrage. In der Geräteliste gibt es zudem einen Schnellzugriff auf
die Prüfung direkt von jeder Gerätekarte aus.

## 17.07.2026 - Dashboard und PDF-Bericht

Ein neues Dashboard zeigt eine Übersicht zur aktuellen Prüfung mit Diagrammen
zu Prüfstatus, Prüfergebnis und Gerätezustand. Darüber lässt sich außerdem ein
PDF-Bericht mit Deckblatt, Übersichtsseite und Gerätelisten nach Prüfergebnis
erzeugen und herunterladen. Zusätzlich startet die App jetzt merklich
schneller.

## 13.07.2026 - Ausmusterung, neues Logo, Changelog und Eingabe-Vorschläge

Geräte können jetzt als „ausgemustert“ markiert werden und erscheinen dann
nur noch unter einem eigenen Filter in der Geräteliste; das passiert auch
automatisch, wenn der Gerätezustand auf „Außer Betrieb“ gesetzt wird. Die App
trägt außerdem ein neues Logo und heißt jetzt „Prüftool“. Im Admin-Bereich
lässt sich diese Änderungsliste direkt in der App anzeigen, und bei Standort-
und Prüfungsfeldern werden jetzt Vorschläge aus bereits vorhandenen Werten
angeboten.
