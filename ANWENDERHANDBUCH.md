# Anwenderhandbuch

Diese Anleitung erklärt die Bedienung des **Prüftools** – einer App zur Erfassung, Verwaltung und Archivierung von Messdaten für elektrische Sicherheitsprüfungen.

Die App funktioniert **vollständig offline**. Alle Daten (Geräte, Bilder, PDFs, Prüfobjekt-Informationen) werden ausschließlich lokal auf diesem Gerät gespeichert. Es findet keine Übertragung ins Internet statt.

## Inhalt

- [Erste Schritte](#erste-schritte)
- [Geräte verwalten](#geräte-verwalten)
- [Geräteliste – Filtern und Sortieren](#geräteliste--filtern-und-sortieren)
- [Eine Prüfung durchführen](#eine-prüfung-durchführen)
- [Dashboard](#dashboard)
- [PDF-Bericht erzeugen](#pdf-bericht-erzeugen)
- [Backup und Wiederherstellung](#backup-und-wiederherstellung)
- [Daten löschen](#daten-löschen)
- [Changelog](#changelog)
- [Häufige Fragen](#häufige-fragen)

## Erste Schritte

Beim allerersten Start der App sind noch keine Geräte vorhanden. Die App öffnet in diesem Fall automatisch den Bereich **Administration**.

Dort gibt es zwei Möglichkeiten, um zu starten:

1. **Prüfobjekt-Daten eintragen** – Unter der Kachel „Prüfobjekt“ auf „Daten eintragen“ klicken und folgende Felder ausfüllen:
   - **Prüfobjekt** – Bezeichnung des zu prüfenden Objekts (z. B. Gebäudename)
   - **Namen** – Name des Prüfers bzw. der prüfenden Firma
   - **Anschrift**
   - **Ort**
   - **Aktuelle Prüfung** – Name der aktuellen Prüfrunde (z. B. „2026-Q1“). Solange noch keine Geräte angelegt sind, muss dieses Feld ausgefüllt werden, um fortfahren zu können.

   Nach dem Speichern gelangt man über den Button „Weiter zu den Einträgen“ direkt zur Geräteliste, um neue Geräte anzulegen.

2. **Backup wiederherstellen** – Wurde die App schon einmal genutzt und es existiert eine Backup-ZIP-Datei, kann diese unter der Kachel „Backup wiederherstellen“ geladen werden. Alle Geräte, Bilder und Prüfobjekt-Informationen aus dem Backup werden dabei übernommen (siehe [Backup und Wiederherstellung](#backup-und-wiederherstellung)).

Sobald mindestens ein Gerät vorhanden ist, startet die App direkt in der **Geräteliste**. Der Administrationsbereich ist dann jederzeit über das Zahnrad-/Haus-Symbol oben rechts im Kopfbereich erreichbar.

## Geräte verwalten

### Neues Gerät anlegen

In der Geräteliste unten rechts auf den runden **„+“-Button** (FAB) tippen. Im Formular können folgende Angaben gemacht werden:

- **Typ**
- **Hersteller**
- **Modell**
- **Seriennummer**
- **Schutzklasse**
- **Nennspannung (V)**
- **Nennleistung (W)**

Sowie der **Standort** des Geräts:

- **Standortname**
- **Gebäude**
- **Raum**

Für die Standortfelder schlägt die App bereits verwendete Werte in einem Dropdown vor. Es kann trotzdem jederzeit ein neuer, freier Text eingegeben werden.

Mit „Speichern“ wird das Gerät angelegt.

### Gerät bearbeiten

In der Detailansicht eines Geräts (durch Klick auf eine Karte in der Geräteliste geöffnet) steht oben rechts der Button „Bearbeiten“ zur Verfügung, um die Stammdaten und den Standort nachträglich zu ändern.

### Bilder hinzufügen

In der Geräte-Detailansicht sowie im Prüfungs-Formular gibt es einen Bereich „Bilder“. Fotos können auf zwei Wegen hinzugefügt werden:

- Klick auf das Kamera-Symbol öffnet die Kamera bzw. die Dateiauswahl des Geräts.
- Bilder per **Drag & Drop** auf das Symbol ziehen.

Hochgeladene Bilder werden automatisch verkleinert (maximal 1200 Pixel Kantenlänge), damit die App auch bei vielen Fotos flüssig bleibt.

### PDFs hochladen

Neben Bildern können auch **PDF-Dateien** (z. B. Datenblätter oder Prüfprotokolle) hochgeladen werden – ebenfalls per Klick oder Drag & Drop, bis zu **20 MB** je Datei. PDFs erscheinen in einer eigenen Liste mit PDF-Symbol und Dateinamen. Ein Klick auf den Dateinamen öffnet die PDF-Datei in einem neuen Tab.

### Bilder und PDFs löschen

Beim Überfahren eines Bildes bzw. eines PDF-Einträgs mit der Maus erscheint ein roter Papierkorb (bei Bildern oben rechts auf der Vorschau, bei PDFs rechts neben dem Dateinamen). Vor dem endgültigen Löschen erscheint eine Sicherheitsabfrage.

## Geräteliste – Filtern und Sortieren

Die Geräteliste bietet folgende Werkzeuge:

- **Filter** – Freitextfeld, das Hersteller, Modell, Seriennummer, Standort, Gebäude und Raum durchsucht.
- **Status-Chips**:
  - **Offen** – Geräte ohne Prüfung in der aktuellen Prüfrunde
  - **Abgearbeitet** – Geräte, die in der aktuellen Prüfrunde bereits geprüft wurden
  - **Alle** – alle aktiven (nicht ausgemusterten) Geräte
  - **Ausgemustert** – nur ausgemusterte Geräte (siehe [Eine Prüfung durchführen](#eine-prüfung-durchführen))
- **Sortier-Chips** – Sortierung nach Hersteller, Modell, Seriennummer, Standort, Gebäude oder Raum. Ein erneuter Klick auf denselben Chip dreht die Sortierrichtung um.
- **Ergebnis-Zähler** – zeigt an, wie viele Geräte nach Anwendung der Filter sichtbar sind (im Verhältnis zur Gesamtzahl).

Jede Gerätekarte besitzt außerdem einen Schnellzugriff-Button am rechten Rand:

- **Grünes „+“** – noch keine aktuelle Prüfung vorhanden, öffnet direkt eine neue Prüfung für dieses Gerät.
- **Gelber Stift** – aktuelle Prüfung bereits vorhanden, öffnet sie direkt zur Bearbeitung.

Beide Buttons öffnen den Prüfungs-Editor ohne den Umweg über die Geräte-Detailansicht.

## Eine Prüfung durchführen

Der Prüfungs-Editor erfasst folgende Werte:

- **Sichtprüfung** – Bestanden / Nicht bestanden / Kein Ergebnis
- **Funktionsprüfung** – Bestanden / Nicht bestanden / Kein Ergebnis
- **Gerätezustand** – Vorhanden / Defekt / Außer Betrieb / Nicht auffindbar
- **Messung** – Bestanden / Nicht bestanden / Kein Ergebnis, sowie:
  - **Isolationswiderstand (MΩ)**
  - **Berührungsstrom (mA)**
- **Gesamtergebnis** – Bestanden / Nicht bestanden / Kein Ergebnis
- **Beschreibung** – Freitext für Auffälligkeiten oder Hinweise
- **Bilder** und **PDFs** speziell zu dieser Prüfung

### Automatische Ausmusterung

Wird der Gerätezustand auf **„Außer Betrieb“** gesetzt, markiert die App das Gerät automatisch als **ausgemustert**. Ausgemusterte Geräte:

- werden in den Ansichten „Offen“, „Abgearbeitet“ und „Alle“ nicht mehr angezeigt,
- erscheinen nur noch unter dem Filter „Ausgemustert“,
- werden in der Geräteliste mit einem roten Prüf-Symbol gekennzeichnet.

Wird bei einer späteren Prüfung ein anderer Gerätezustand gewählt, wird die Ausmusterung automatisch wieder aufgehoben.

### Historie vergangener Prüfungen

In der Geräte-Detailansicht listet der Bereich „Inspektionen“ alle bisherigen Prüfungen des Geräts, sortiert nach Datum. Die Prüfung der aktuellen Prüfrunde ist farblich hervorgehoben. Ein Klick auf eine vergangene Prüfung öffnet sie in einer reinen Übersichtsansicht (nicht mehr bearbeitbar), ein Klick auf die aktuelle Prüfung öffnet sie zur Bearbeitung.

## Dashboard

Über das Diagramm-Symbol im Kopfbereich der App gelangt man zum **Dashboard**. Es zeigt eine Übersicht zur aktuell eingestellten Prüfung:

- **Übersicht** – Gesamtzahl der Geräte sowie Anzahl aktiver und ausgemusterter Geräte.
- **Prüfstatus** (Diagramm) – wie viele Geräte bereits aktuell geprüft, noch offen oder ausgemustert sind.
- **Prüfergebnis** (Diagramm) – Verteilung nach Bestanden / Nicht bestanden / Kein Ergebnis.
- **Gerätezustand** (Diagramm) – Verteilung nach Vorhanden / Defekt / Außer Betrieb / Nicht auffindbar.

Alle Zahlen und Diagramme beziehen sich ausschließlich auf die aktuell im Prüfobjekt eingestellte Prüfung.

## PDF-Bericht erzeugen

Im Dashboard steht der Button **„Bericht erzeugen“** zur Verfügung. Er erstellt einen PDF-Bericht zur aktuellen Prüfung mit folgendem Inhalt:

- ein **Deckblatt** mit den Angaben zum Prüfobjekt (Namen, Anschrift, Ort, aktuelle Prüfung),
- eine **Übersichtsseite** mit den drei Diagrammen aus dem Dashboard,
- Listen aller geprüften Geräte, getrennt nach den Ergebnissen **Bestanden**, **Nicht bestanden** und **Kein Ergebnis** – jeweils mit Standort, Seriennummer und den einzelnen Prüfwerten (Sichtprüfung, Funktionsprüfung, Messung, Gesamtergebnis) sowie einem eventuell hinterlegten Hinweis,
- eigene Listen für Geräte mit dem Zustand **„Nicht auffindbar“** und **„Außer Betrieb“**,
- eine Seitenzahl am Ende jeder Seite.

Geräte ohne aktuelle Prüfung oder mit abweichendem Gerätezustand tauchen in diesen Listen nicht auf. Der Bericht wird als PDF-Datei herunterladen.

## Backup und Wiederherstellung

### Backup erstellen

In der Geräteliste steht oben rechts der Button **„Backup herunterladen“** zur Verfügung. Er erstellt eine ZIP-Datei mit sämtlichen Geräten, Bildern, PDFs und Prüfobjekt-Informationen und lädt sie herunter. Das Datum des letzten Backups wird direkt daneben angezeigt.

> **Empfehlung:** Regelmäßig ein Backup erstellen, insbesondere vor größeren Änderungen oder dem Wechsel auf ein anderes Gerät.

### Backup wiederherstellen

Im Administrationsbereich lässt sich unter „Backup wiederherstellen“ eine zuvor erstellte ZIP-Datei laden.

> **Achtung:** Beim Wiederherstellen werden alle vorhandenen Daten (Geräte, Bilder, PDFs, Prüfobjekt-Informationen) vollständig überschrieben.

## Daten löschen

Im Administrationsbereich steht unter „Daten löschen“ die Möglichkeit zur Verfügung, den gesamten Datenbestand zu entfernen. Dabei gilt:

- Vor dem Löschen wird **automatisch ein Backup** erstellt und heruntergeladen.
- Nach Bestätigung der Sicherheitsabfrage werden alle Geräte, Bilder, PDFs und Prüfobjekt-Informationen **unwiderruflich** aus der App entfernt.
- Anschließend befindet sich die App wieder im Ausgangszustand wie bei der Ersteinrichtung.

## Changelog

Im Administrationsbereich befindet sich unten der Link **„Changelog“**. Er zeigt eine Liste aller Änderungen und neuen Funktionen der App an – direkt in der App, auch ohne Internetverbindung.

## Häufige Fragen

**Werden meine Daten irgendwohin übertragen?**
Nein. Alle Daten bleiben ausschließlich lokal auf diesem Gerät in der Datenbank des Browsers (IndexedDB) gespeichert. Die App benötigt keine Internetverbindung und lädt keine Inhalte aus dem Internet nach.

**Was bedeutet „Ausgemustert“?**
Ein ausgemustertes Gerät gilt als außer Betrieb und wird in den normalen Ansichten der Geräteliste nicht mehr angezeigt. Es bleibt aber vollständig erhalten und ist über den Filter „Ausgemustert“ weiterhin einsehbar.

**Was passiert, wenn ich die App auf einem anderen Gerät oder Tablet weiter nutzen möchte?**
Ein Backup (ZIP-Datei) erstellen und auf dem neuen Gerät über „Backup wiederherstellen“ einspielen.

**Kann ich mit mehreren Prüfrunden gleichzeitig arbeiten?**
Die App bezieht sich immer auf die im Prüfobjekt eingestellte „Aktuelle Prüfung“. Um eine neue Prüfrunde zu beginnen, im Administrationsbereich unter „Prüfobjekt“ das Feld „Aktuelle Prüfung“ auf einen neuen Namen ändern. Bereits erfasste Prüfungen vorheriger Runden bleiben in der Historie jedes Geräts erhalten.
