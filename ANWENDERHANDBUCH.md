# Anwenderhandbuch

Diese Anleitung erklärt die Bedienung des **Prüftools** – einer App zur Erfassung, Verwaltung und Archivierung von Messdaten für elektrische Sicherheitsprüfungen.

Die App richtet sich insbesondere an **kleine Handwerksbetriebe, Hausmeisterservices, Dienstleister und Werkstätten**, die Prüfungen an ortsveränderlichen elektrischen Geräten (z. B. Bohrmaschinen, Verlängerungsleitungen, Netzteile, Ladegeräte, Kaffeemaschinen oder Computer) einfach und nachvollziehbar dokumentieren möchten. Grundlage hierfür sind unter anderem die Anforderungen der **DGUV Vorschrift 3** sowie die **DIN VDE 0701-0702**, welche die Prüfung nach Instandsetzung und die Wiederholungsprüfung elektrischer Geräte beschreibt.

Die App funktioniert **vollständig offline**. Alle Daten (Geräte, Bilder, PDFs, Prüfobjekt-Informationen) werden ausschließlich lokal auf diesem Gerät gespeichert. Es findet keine Übertragung ins Internet statt.

## Inhalt

- [Erste Schritte](#erste-schritte)
- [App installieren und Offline-Nutzung](#app-installieren-und-offline-nutzung)
- [Geräte verwalten](#geräte-verwalten)
- [Geräteliste – Filtern und Sortieren](#geräteliste--filtern-und-sortieren)
- [Eine Prüfung durchführen](#eine-prüfung-durchführen)
- [Prozessübersicht: Abarbeitung und Prüfung](#prozessübersicht-abarbeitung-und-prüfung)
- [Dashboard](#dashboard)
- [PDF-Bericht erzeugen](#pdf-bericht-erzeugen)
- [Backup und Wiederherstellung](#backup-und-wiederherstellung)
- [Geräte aus Excel importieren](#geräte-aus-excel-importieren)
- [Geräte als Excel exportieren](#geräte-als-excel-exportieren)
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

## App installieren und Offline-Nutzung

Diese App ist als **Progressive Web App (PWA)** umgesetzt. Das bedeutet, sie kann wie eine gewöhnliche App auf dem Gerät installiert werden – mit eigenem Symbol auf dem Startbildschirm und ohne die Adressleiste des Browsers. Die Installation ist jedoch **rein optional**: Die App funktioniert unabhängig davon, ob sie installiert wurde oder weiterhin als normaler Browser-Tab genutzt wird, vollständig gleich – siehe [Verhalten im Offline-Betrieb](#verhalten-im-offline-betrieb).

Im Administrationsbereich zeigt die Kachel **„App installieren“** je nach verwendetem Browser und Installationsstatus einen passenden Button oder eine kurze Anleitung an.

### Installation je Browser

- **Chrome / Edge:** In der Kachel „App installieren“ erscheint ein Button **„App installieren“**. Ein Klick darauf öffnet den Installationsdialog des Browsers; nach Bestätigung wird die App installiert und erscheint anschließend mit eigenem Symbol auf dem Startbildschirm bzw. im Anwendungsmenü. Erscheint der Button (noch) nicht, wurde die Installation entweder bereits einmal abgelehnt oder der Browser hat die Installierbarkeit noch nicht erkannt – die App funktioniert in diesem Fall unverändert im Browser-Tab weiter.
- **Safari (iPhone/iPad):** Safari bietet keinen Installations-Button an. Stattdessen zeigt die Kachel eine kurze Anleitung: Auf das **Teilen-Symbol** tippen und anschließend **„Zum Home-Bildschirm“** wählen.
- **Firefox (Android):** Ebenfalls kein Installations-Button; die Kachel zeigt hier den Hinweis, das **Menü (⋮)** zu öffnen und **„Installieren“** bzw. **„Zum Startbildschirm hinzufügen“** auszuwählen.
- **Firefox (Desktop) und andere Browser:** Eine Installation ist hier nicht vorgesehen bzw. wird vom Browser nicht unterstützt. Die Kachel „App installieren“ wird in diesem Fall ausgeblendet – die App bleibt aber ganz normal im Browser-Tab nutzbar.

Wurde die App bereits installiert, zeigt die Kachel stattdessen nur noch den Hinweis **„App ist installiert“** an; ein Button ist dann nicht mehr nötig.

### Verhalten im Online-Betrieb

Sobald eine Internetverbindung besteht, prüft die App im Hintergrund automatisch, ob eine neue Version verfügbar ist, und aktualisiert sich in diesem Fall selbstständig. Ein manuelles Update oder ein erneutes Herunterladen aus einem App-Store ist nicht nötig.

### Verhalten im Offline-Betrieb

Nach dem ersten Laden funktioniert die App **vollständig ohne Internetverbindung** – unabhängig davon, ob sie installiert wurde oder weiterhin im Browser-Tab läuft. Alle Daten (Geräte, Bilder, PDFs, Prüfobjekt-Informationen) werden ausschließlich lokal auf diesem Gerät in der Datenbank des Browsers (IndexedDB) gespeichert; es findet zu keinem Zeitpunkt eine Übertragung ins Internet statt. Die Installation ändert an diesem Verhalten nichts – sie ist lediglich ein Komfortmerkmal (eigenes App-Symbol, kein Browser-Rahmen, schnellerer Start), keine Voraussetzung für die Offline-Nutzung.

## Geräte verwalten

### Neues Gerät anlegen

In der Geräteliste unten rechts auf den runden **„+“-Button** (FAB) tippen. Im Formular können folgende Angaben gemacht werden:

- **Typ**
- **Hersteller**
- **Modell**
- **Seriennummer** – Ist eine Kamera am Gerät vorhanden, erscheint neben diesem Feld zusätzlich ein **Barcode-Symbol**. Ein Tipp darauf öffnet einen Kamera-Dialog; der erkannte Barcode oder QR-Code wird automatisch als Seriennummer übernommen, ohne dass er von Hand abgetippt werden muss.
- **Schutzklasse** – Auswahl über drei Schaltflächen (Schutzklasse I, II oder III)
- **Nennspannung (V)**
- **Nennleistung (W)**

Sobald eine Schutzklasse ausgewählt wurde, blendet die App direkt darunter einen Hinweis mit dem typischen **Kennzeichen** dieser Schutzklasse (z. B. „Schutzleiter (PE) vorhanden“) sowie den dafür **erforderlichen Prüfungen** (z. B. „Sichtprüfung, Schutzleiterwiderstand, …“) ein. Dieser Hinweis dient nur zur Orientierung bei der Geräteerfassung und hat keinen Einfluss auf die spätere Prüfung – welche Prüfwerte tatsächlich erfasst werden, wird weiterhin im Prüfungs-Editor entschieden (siehe [Eine Prüfung durchführen](#eine-prüfung-durchführen)).

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

### Gerät löschen

Beim Bearbeiten eines Geräts (siehe [Gerät bearbeiten](#gerät-bearbeiten)) erscheint unten links im Formular ein Button **„Löschen“**, sofern das Gerät noch **keine Prüfung, keine Bilder und keine PDFs** besitzt. Nach Bestätigung einer Sicherheitsabfrage wird das Gerät **unwiderruflich** entfernt und die Geräteliste erscheint wieder.

> **Hinweis:** Sobald einem Gerät bereits eine Prüfung, ein Bild oder ein PDF hinzugefügt wurde, steht der Button „Löschen“ nicht mehr zur Verfügung, um ein versehentliches Entfernen bereits dokumentierter Geräte zu verhindern. In diesem Fall bleibt nur die Ausmusterung über den Gerätezustand „Außer Betrieb“ (siehe [Automatische Ausmusterung](#automatische-ausmusterung)).

## Geräteliste – Filtern und Sortieren

Die Geräteliste bietet folgende Werkzeuge:

- **Filter** – Freitextfeld, das Hersteller, Modell, Seriennummer, Standort, Gebäude und Raum durchsucht. Erkennt die App eine nutzbare Kamera, erscheint rechts neben dem Filterfeld zusätzlich ein **Barcode-Symbol**: Ein Tipp darauf öffnet einen Kamera-Dialog, in dem sich Barcodes und QR-Codes scannen lassen. Sobald ein Code erkannt wurde, wird er automatisch als Filtertext übernommen und der Dialog schließt sich selbstständig. Ergibt der gescannte Code eine **eindeutige** Übereinstimmung mit genau einer Seriennummer (unter Berücksichtigung des aktuell gewählten Status-Chips), öffnet sich zusätzlich sofort die Geräteansicht dieses Geräts – ein weiterer Tipp auf die Liste ist dann nicht nötig. Beim Zurückgehen aus dieser automatisch geöffneten Geräteansicht wird der Filter wieder geleert, sodass die vollständige Geräteliste erneut sichtbar ist. Passt der gescannte Code auf mehrere oder gar kein Gerät, bleibt lediglich der Filtertext gesetzt und die Liste zeigt die entsprechenden Treffer wie gewohnt an. Ohne erkannte Kamera bleibt das Symbol ausgeblendet und der Filter wird ausschließlich per Tastatur bedient.
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
  - **Schutzleiterwiderstand (Ω)**
  - **Isolationswiderstand (MΩ)**
  - **Ersatzableitstrom (mA)**
  - **Berührungsstrom (mA)**
- **Gesamtergebnis** – Bestanden / Nicht bestanden / Kein Ergebnis
- **Beschreibung** – Freitext für Auffälligkeiten oder Hinweise
- **Bilder** und **PDFs** speziell zu dieser Prüfung

Ist am geprüften Gerät eine Schutzklasse hinterlegt (siehe [Geräte verwalten](#geräte-verwalten)), zeigt die App unter jedem der vier Messwertfelder direkt den dafür zulässigen Grenzwert als Hinweis an (z. B. „Grenzwert: ≥ 1 MΩ (500 V DC)“ beim Isolationswiderstand einer Schutzklasse I). Diese Hinweise dienen nur zur Orientierung; ob ein eingetragener Messwert den Grenzwert einhält, wird nicht automatisch geprüft.

### Automatische Ausmusterung

Wird der Gerätezustand auf **„Außer Betrieb“** gesetzt, markiert die App das Gerät automatisch als **ausgemustert**. Ausgemusterte Geräte:

- werden in den Ansichten „Offen“, „Abgearbeitet“ und „Alle“ nicht mehr angezeigt,
- erscheinen nur noch unter dem Filter „Ausgemustert“,
- werden in der Geräteliste mit einem roten Prüf-Symbol gekennzeichnet.

Wird bei einer späteren Prüfung ein anderer Gerätezustand gewählt, wird die Ausmusterung automatisch wieder aufgehoben.

### Historie vergangener Prüfungen

In der Geräte-Detailansicht listet der Bereich „Inspektionen“ alle bisherigen Prüfungen des Geräts, sortiert nach Datum. Die Prüfung der aktuellen Prüfrunde ist farblich hervorgehoben. Ein Klick auf eine vergangene Prüfung öffnet sie in einer reinen Übersichtsansicht (nicht mehr bearbeitbar), ein Klick auf die aktuelle Prüfung öffnet sie zur Bearbeitung.

## Prozessübersicht: Abarbeitung und Prüfung

Der Status eines Geräts ("Offen" oder "Abgearbeitet") wird nicht fest gespeichert, sondern bei jeder Anzeige neu ermittelt: Ein Gerät gilt als abgearbeitet, sobald es eine Prüfung besitzt, die zur aktuell eingestellten Prüfrunde gehört. Das folgende Diagramm fasst den gesamten Ablauf zusammen:

![Ablaufdiagramm: Abarbeitung und Prüfung](assets/prozess-pruefung.svg)

**Wichtig:**

- Die vier Teilergebnisse (Sichtprüfung, Funktionsprüfung, Messung, Gesamtergebnis) werden unabhängig voneinander erfasst – das Gesamtergebnis wird nicht automatisch aus den anderen abgeleitet, sondern muss manuell gesetzt werden.
- Ein „Nicht bestanden“-Ergebnis führt zu keiner automatischen Statusänderung; es wird lediglich im Dashboard und im PDF-Bericht separat ausgewiesen.
- Alte Prüfungen bleiben dauerhaft als Historie erhalten (siehe [Historie vergangener Prüfungen](#historie-vergangener-prüfungen)).

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
- Listen aller geprüften Geräte, getrennt nach den Ergebnissen **Bestanden**, **Nicht bestanden** und **Kein Ergebnis** – jeweils mit Standort, Seriennummer und den einzelnen Prüfwerten (Sichtprüfung, Funktionsprüfung, Messung inkl. Schutzleiterwiderstand, Isolationswiderstand, Ersatzableitstrom und Berührungsstrom, Gesamtergebnis) sowie einem eventuell hinterlegten Hinweis,
- eigene Listen für Geräte mit dem Zustand **„Nicht auffindbar“** und **„Außer Betrieb“**,
- eine Seitenzahl am Ende jeder Seite.

Geräte ohne aktuelle Prüfung oder mit abweichendem Gerätezustand tauchen in diesen Listen nicht auf. Der Bericht wird als PDF-Datei herunterladen.

## Backup und Wiederherstellung

### Backup erstellen

In der Geräteliste steht oben rechts der Button **„Backup herunterladen“** zur Verfügung. Er erstellt eine ZIP-Datei mit sämtlichen Geräten, Bildern, PDFs und Prüfobjekt-Informationen und lädt sie herunter. Das Datum des letzten Backups wird direkt daneben angezeigt.

Das Backup ist ein vollständiger, in sich geschlossener Datenstand und enthält:

- alle Geräte und deren gesamte **Prüfhistorie** (alle Prüfrunden, nicht nur die aktuelle),
- alle zu den Geräten und Prüfungen hochgeladenen **Bilder und PDF-Dokumente**,
- die **Prüfobjekt-Angaben** (Name, Namen, Anschrift, Ort, aktuelle Prüfung).

Der Dateiname des Backups enthält bereits den Namen des Prüfobjekts sowie Datum und Uhrzeit der Erstellung, analog zum PDF-Bericht und zum Excel-Export.

> **Empfehlung:** Regelmäßig ein Backup erstellen, insbesondere vor größeren Änderungen oder dem Wechsel auf ein anderes Gerät.

### Backup wiederherstellen

Im Administrationsbereich lässt sich unter „Backup wiederherstellen“ eine zuvor erstellte ZIP-Datei laden.

> **Achtung:** Beim Wiederherstellen werden alle vorhandenen Daten (Geräte, Bilder, PDFs, Prüfobjekt-Informationen) vollständig überschrieben.

### Mehrere Klienten oder Standorte verwalten

Da jedes Backup einen vollständigen, eigenständigen Datenstand (ein Prüfobjekt mit allen zugehörigen Geräten) enthält, lässt sich die App auch für **mehrere unabhängige Kunden, Prüfobjekte oder Standorte** einsetzen, ohne dass sich die Daten gegenseitig überschneiden:

1. Vor dem Wechsel zu einem anderen Klienten den aktuellen Stand über „Backup herunterladen“ sichern.
2. Anschließend im Administrationsbereich das Backup des gewünschten anderen Klienten über „Backup wiederherstellen“ laden.
3. Die App zeigt danach ausschließlich die Geräte und Prüfobjekt-Angaben des geladenen Backups an.

> **Achtung:** Die App verwaltet immer nur **einen** Datenstand gleichzeitig. Vor jedem Wechsel unbedingt zuerst ein Backup des aktuellen Klienten erstellen, da das Laden eines anderen Backups die aktuell angezeigten Daten vollständig überschreibt. Es empfiehlt sich, die Backup-Dateien sprechend zu benennen und pro Klient an einem festen Ort (z. B. einem eigenen Ordner) zu archivieren.

## Geräte aus Excel importieren

Im Administrationsbereich steht unter der Kachel **„Geräte aus Excel importieren“** ein Assistent zur Verfügung, mit dem sich viele Geräte auf einmal aus einer Excel- oder CSV-Datei anlegen lassen, statt jedes Gerät einzeln über den „+“-Button einzutragen.

> **Hinweis:** Der Import steht erst zur Verfügung, sobald unter „Prüfobjekt“ Daten hinterlegt wurden (siehe [Erste Schritte](#erste-schritte)). Solange das nicht der Fall ist, ist der Button „Datei auswählen“ deaktiviert und ein entsprechender Hinweistext wird angezeigt.

Der Import läuft in vier Schritten ab:

1. **Datei auswählen** – Eine Excel- (`.xlsx`, `.xls`) oder CSV-Datei hochladen. Die App erwartet, dass die **erste Zeile** der Datei die Spaltenüberschriften enthält; ab der zweiten Zeile folgen die eigentlichen Gerätedaten.
2. **Spalten zuordnen** – Für jedes Gerätefeld (z. B. Hersteller, Modell, Seriennummer, Schutzklasse, Nennspannung, Nennleistung, Standortname, Gebäude, Raum) lässt sich per Dropdown auswählen, welche Spalte der Excel-Datei diesem Feld entspricht. Felder, für die es keine passende Spalte gibt, können auf „– nicht zuordnen –“ stehen bleiben und werden dann leer angelegt.
3. **Vorschau** – Vor dem eigentlichen Import zeigt die App eine Vorschau der ersten Zeilen mit den zugeordneten Werten sowie die Gesamtanzahl der Zeilen, die importiert werden. Enthalten einzelne Zeilen ungültige Werte (z. B. Text in einem Zahlenfeld oder eine Schutzklasse, die nicht „I“, „II“ oder „III“ ist), wird dies bereits hier als Warnung angezeigt; der betroffene Wert wird beim Import leer bzw. auf 0 gesetzt, die Zeile wird aber trotzdem angelegt.
4. **Ergebnis** – Nach dem Import zeigt die App an, wie viele Geräte erfolgreich angelegt wurden. Traten bei einzelnen Zeilen Probleme auf, werden diese in einer Liste mit der jeweiligen Zeilennummer aufgeführt.

**Wichtig:**

- Für jede importierte Zeile wird ein **neues** Gerät angelegt – auch wenn Hersteller, Modell oder Seriennummer mit einem bereits vorhandenen Gerät übereinstimmen. Es findet keine automatische Zusammenführung mit bestehenden Geräten statt.
- Schlägt der Import einzelner Zeilen fehl, werden die übrigen, fehlerfreien Zeilen trotzdem angelegt (kein Abbruch des gesamten Imports).
- Neu importierte Standorte stehen anschließend sofort als Vorschlag zur Verfügung, wenn ein Gerät manuell angelegt oder bearbeitet wird (siehe [Geräte verwalten](#geräte-verwalten)).

## Geräte als Excel exportieren

In derselben Kachel **„Geräte aus Excel importieren“** im Administrationsbereich steht auch der Button **„Excel-Datei exportieren“** zur Verfügung. Damit lässt sich der gesamte Gerätebestand als Excel-Datei (`.xlsx`) herunterladen.

Die exportierte Datei enthält:

- eine **Kopfzeile** mit den Feldnamen (bei Messwerten inklusive Maßeinheit, z. B. „Bemessungsspannung (V)“),
- für **jedes** Gerät eine eigene Zeile mit allen Gerätefeldern (Typ, Hersteller, Modell, Seriennummer, Schutzklasse, Bemessungsspannung, Bemessungsleistung, Standortname, Gebäude, Raum, Prüfpflichtig, Ausgemustert) – unabhängig davon, ob die Felder befüllt sind,
- daran anschließend die Werte der **aktuellen Prüfung** (Prüfungsname, Prüfdatum, Status, Sichtprüfung, Funktionsprüfung, Messung, Schutzleiterwiderstand, Isolationswiderstand, Ersatzableitstrom, Berührungsstrom, Gesamtergebnis, Hinweis) – und zwar nur für die Prüfung, deren Name der aktuell unter „Prüfobjekt“ eingestellten Prüfung entspricht.

**Wichtig:**

- Besitzt ein Gerät keine Prüfung mit dem Namen der aktuellen Prüfung, bleiben die Prüfungs-Spalten für dieses Gerät leer – das Gerät wird aber trotzdem mit exportiert.
- Ältere Prüfungen (aus früheren Prüfrunden) werden nicht exportiert, nur die aktuelle Prüfung.
- Bilder und PDFs werden beim Export **nicht** berücksichtigt.
- Das Prüfdatum wird als echtes Excel-Datum exportiert, sodass es sich in Excel direkt weiterverarbeiten (z. B. sortieren, filtern) lässt.
- Der Dateiname enthält den Namen des Prüfobjekts sowie Datum und Uhrzeit der Erstellung, analog zum PDF-Bericht und zum Backup.

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
