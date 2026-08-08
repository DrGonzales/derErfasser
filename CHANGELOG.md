# Changelog

Alle wichtigen Änderungen an diesem Projekt werden hier dokumentiert.

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
