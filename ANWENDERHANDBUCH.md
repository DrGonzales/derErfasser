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
- [Prüfrunden und Prüfhistorie](#prüfrunden-und-prüfhistorie)
- [Dashboard](#dashboard)
- [PDF-Bericht erzeugen](#pdf-bericht-erzeugen)
- [Backup und Wiederherstellung](#backup-und-wiederherstellung)
- [Backup zusammenführen](#backup-zusammenführen)
- [Arbeiten mit mehreren Prüfern](#arbeiten-mit-mehreren-prüfern)
- [Geräte aus Excel importieren](#geräte-aus-excel-importieren)
- [Excel-Import und Massendaten](#excel-import-und-massendaten)
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

   Darunter befindet sich ein eigener Bereich **„Auditor“** mit weiteren, optionalen Feldern zur prüfenden Person bzw. Firma:
   - **Name** – Name oder Firmenname des Auditors
   - **Anschrift**
   - **Ort**
   - **Prüfer** – Name der Person, die die Prüfung tatsächlich durchführt und später den Bericht unterschreibt

   Diese Auditor-Angaben erscheinen später auf dem Deckblatt des PDF-Berichts sowie im Unterschriftenfeld am Ende des Berichts (siehe [PDF-Bericht erzeugen](#pdf-bericht-erzeugen)).

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
- **Seriennummer** – Ist eine Kamera am Gerät vorhanden, erscheint neben diesem Feld zusätzlich ein **Barcode-Symbol**. Ein Tipp darauf öffnet einen Kamera-Dialog; der erkannte Barcode oder QR-Code wird automatisch als Seriennummer übernommen, ohne dass er von Hand abgetippt werden muss. Solange das Feld leer ist, wird es mit einem roten Rahmen hervorgehoben; sobald ein Wert eingetragen wird, verschwindet dieser wieder.
- **Schutzklasse** – Auswahl über drei Schaltflächen (Schutzklasse I, II oder III). Solange keine Schutzklasse ausgewählt wurde, ist dieser Bereich rötlich hinterlegt; nach der Auswahl verschwindet die Hervorhebung.
- **Nennspannung (V)**
- **Nennleistung (W)**

Sobald eine Schutzklasse ausgewählt wurde, blendet die App direkt darunter einen Hinweis mit dem typischen **Kennzeichen** dieser Schutzklasse (z. B. „Schutzleiter (PE) vorhanden“) sowie den dafür **erforderlichen Prüfungen** (z. B. „Sichtprüfung, Schutzleiterwiderstand, …“) ein. Dieser Hinweis dient nur zur Orientierung bei der Geräteerfassung und hat keinen Einfluss auf die spätere Prüfung – welche Prüfwerte tatsächlich erfasst werden, wird weiterhin im Prüfungs-Editor entschieden (siehe [Eine Prüfung durchführen](#eine-prüfung-durchführen)).

Sowie der **Standort** des Geräts:

- **Standortname**
- **Gebäude**
- **Raum**

Für die Standortfelder schlägt die App bereits verwendete Werte in einem Dropdown vor. Es kann trotzdem jederzeit ein neuer, freier Text eingegeben werden.

> **Hinweis:** Die rote Hervorhebung bei leerer Seriennummer bzw. fehlender Schutzklasse ist nur ein optischer Hinweis. Das Gerät lässt sich auch ohne diese Angaben speichern.

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

### Gerät klonen

Beim Bearbeiten eines bereits gespeicherten Geräts erscheint in der Fußzeile des Bearbeitungsformulars ein blauer Button **„Klonen"** (mit Klon-/Kopier-Symbol). Mit Klonen lässt sich schnell ein neues Gerät basierend auf den Daten eines bestehenden Geräts anlegen, ohne alle Felder von Hand neu eintragen zu müssen.

**Verfügbarkeit:**
Der Klonen-Button ist nur verfügbar, wenn:
- das Gerät bereits mindestens einmal gespeichert wurde (nicht bei der Neuanlage eines Geräts),
- und keine ungespeicherten Änderungen im Formular vorhanden sind.

Sobald ein Feld verändert wird, deaktiviert sich der Button automatisch (mit dem Tooltip-Hinweis „Klonen ist erst nach dem Speichern der Änderungen möglich"). Nach dem Speichern oder Verwerfen der Änderungen ist der Button wieder einsatzbereit.

**Was wird geklont:**
Beim Klick auf „Klonen" wird sofort ein neues Gerät als Kopie angelegt und erhält folgende Daten vom Original:
- Typ, Hersteller, Modell
- Schutzklasse, Nennspannung, Nennleistung
- Standortname, Gebäude, Raum

**Was wird NICHT geklont:**
- **Seriennummer** – bleibt leer, da jedes Gerät eine eigene Seriennummer benötigt,
- **Ausmusterungs-Status** – der Klon startet als aktives Gerät,
- **Bilder und PDFs** – werden nicht übernommen,
- **Prüfhistorie** – der Klon hat keine früheren Prüfungen; Prüfungen werden von Anfang an dokumentiert.

**Nach dem Klonen:**
Der Nutzer bleibt im Bearbeitungsformular des **Original-Geräts**; es öffnet sich kein neuer Editor für den Klon. Stattdessen zeigt ein Bestätigungsdialog die Meldung „<Hersteller> – <Modell> wurden geklont." mit einem „Ok"-Button an.

**Klone in der Geräteliste finden:**
Geklonte Geräte, die noch nicht bearbeitet oder gespeichert wurden, lassen sich in der Geräteliste über einen Filter-Chip **„Neu“** (blau, mit Klon-Symbol) gezielt finden und sortieren. Über denselben Filter-Chip erscheinen außerdem Geräte, die per Excel-Import neu angelegt wurden (siehe [Geräte aus Excel importieren](#geräte-aus-excel-importieren)). Der Nutzer kann dort alle frisch geklonten oder importierten Geräte auf einen Blick sehen, um ihnen beispielsweise eine Seriennummer zuzuweisen. Der Chip „Neu“ wird nur angezeigt, wenn tatsächlich entsprechend markierte Geräte vorhanden sind.

Sobald ein geklontes oder importiertes Gerät einmal bearbeitet und gespeichert wurde (z. B. nach dem Eintragen einer Seriennummer), verschwindet es automatisch aus dieser Filteransicht – es gilt dann als reguläres, vollständig erfasstes Gerät. War der Filter „Neu“ gerade aktiv und wurde dabei das letzte so markierte Gerät bearbeitet, springt die Ansicht automatisch zurück zum Filter „Offen“, damit keine leere Liste angezeigt wird.

## Geräteliste – Filtern und Sortieren

Die Geräteliste bietet folgende Werkzeuge:

- **Filter** – Freitextfeld, das Hersteller, Modell, Seriennummer, Standort, Gebäude und Raum durchsucht. Erkennt die App eine nutzbare Kamera, erscheint rechts neben dem Filterfeld zusätzlich ein **Barcode-Symbol**: Ein Tipp darauf öffnet einen Kamera-Dialog, in dem sich Barcodes und QR-Codes scannen lassen. Sobald ein Code erkannt wurde, wird er automatisch als Filtertext übernommen und der Dialog schließt sich selbstständig. Ergibt der gescannte Code eine **eindeutige** Übereinstimmung mit genau einer Seriennummer (unter Berücksichtigung des aktuell gewählten Status-Chips), öffnet sich zusätzlich sofort die Geräteansicht dieses Geräts – ein weiterer Tipp auf die Liste ist dann nicht nötig. Beim Zurückgehen aus dieser automatisch geöffneten Geräteansicht wird der Filter wieder geleert, sodass die vollständige Geräteliste erneut sichtbar ist. Passt der gescannte Code auf mehrere oder gar kein Gerät, bleibt lediglich der Filtertext gesetzt und die Liste zeigt die entsprechenden Treffer wie gewohnt an. Ohne erkannte Kamera bleibt das Symbol ausgeblendet und der Filter wird ausschließlich per Tastatur bedient.
- **Status-Chips**:
  - **Offen** – Geräte ohne Prüfung in der aktuellen Prüfrunde
  - **Abgearbeitet** – Geräte, die in der aktuellen Prüfrunde bereits geprüft wurden
  - **Alle** – alle aktiven (nicht ausgemusterten) Geräte
  - **Ausgemustert** – nur ausgemusterte Geräte (siehe [Eine Prüfung durchführen](#eine-prüfung-durchführen))
  - **Neu** – geklonte oder per Excel-Import neu angelegte Geräte, die noch nicht bearbeitet oder gespeichert wurden; wird nur angezeigt, wenn solche Geräte vorhanden sind (siehe [Gerät klonen](#gerät-klonen))
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

In der Geräte-Detailansicht listet der Bereich „Inspektionen“ alle bisherigen Prüfungen des Geräts, sortiert nach Datum. Die Tabelle zeigt zu jeder Prüfung das Datum, den Namen der Prüfung, den Gerätezustand und das Ergebnis. Die Prüfung der aktuellen Prüfrunde ist farblich hervorgehoben. Ein Klick auf eine vergangene Prüfung öffnet sie in einer reinen Übersichtsansicht (nicht mehr bearbeitbar), ein Klick auf die aktuelle Prüfung öffnet sie zur Bearbeitung.

## Prozessübersicht: Abarbeitung und Prüfung

Der Status eines Geräts ("Offen" oder "Abgearbeitet") wird nicht fest gespeichert, sondern bei jeder Anzeige neu ermittelt: Ein Gerät gilt als abgearbeitet, sobald es eine Prüfung besitzt, die zur aktuell eingestellten Prüfrunde gehört. Das folgende Diagramm fasst den gesamten Ablauf zusammen:

![Ablaufdiagramm: Abarbeitung und Prüfung](assets/prozess-pruefung.svg)

**Wichtig:**

- Die vier Teilergebnisse (Sichtprüfung, Funktionsprüfung, Messung, Gesamtergebnis) werden unabhängig voneinander erfasst – das Gesamtergebnis wird nicht automatisch aus den anderen abgeleitet, sondern muss manuell gesetzt werden.
- Ein „Nicht bestanden“-Ergebnis führt zu keiner automatischen Statusänderung; es wird lediglich im Dashboard und im PDF-Bericht separat ausgewiesen.
- Alte Prüfungen bleiben dauerhaft als Historie erhalten (siehe [Historie vergangener Prüfungen](#historie-vergangener-prüfungen)).

Eine vertiefte Erklärung, wie Prüfrunden und Prüfhistorie genau zusammenwirken, findet sich im Abschnitt [Prüfrunden und Prüfhistorie](#prüfrunden-und-prüfhistorie).

## Prüfrunden und Prüfhistorie

Jedes Prüfobjekt arbeitet mit einer **Prüfrunde**. Die Prüfrunde legt fest, zu welcher Prüfung die erfassten Prüfergebnisse gehören.

Der Wert der Prüfrunde ist dabei ein wichtiger Bestandteil der Prüfung. Er wird verwendet, um die Prüfungen eines Gerätes eindeutig einer Prüfrunde zuzuordnen.

Beispielsweise können Prüfrunden so bezeichnet werden:

```text
2026
2026-Q1
2026-Q2
Jahresprüfung 2026
Nachprüfung 2026
```

Die Bezeichnung kann frei gewählt werden. Wichtig ist, dass für eine zusammengehörige Prüfung immer derselbe Wert verwendet wird.

### Aktuelle Prüfung

Im Prüfobjekt wird festgelegt, welche Prüfrunde die **aktuelle Prüfung** ist.

Beispielsweise:

```text
Aktuelle Prüfung: 2026
```

Alle Prüfungen, die während dieser Prüfrunde durchgeführt werden, werden unter diesem Wert gespeichert.

Wird später eine neue Prüfrunde gestartet, beispielsweise:

```text
Aktuelle Prüfung: 2027
```

werden die neu durchgeführten Prüfungen der Prüfrunde **2027** zugeordnet.

Die bereits vorhandenen Prüfungen der Prüfrunde **2026** bleiben dabei erhalten.

> **Wichtig:** Das Ändern der aktuellen Prüfrunde löscht keine vorhandenen Prüfungen. Es wird lediglich festgelegt, unter welchem Wert neue Prüfungen angelegt werden.

### Neue Geräte

Ein neu angelegtes Gerät besitzt zunächst **keine Prüfung**.

Das Gerät wird zunächst nur mit seinen Gerätedaten angelegt.

Beispielsweise:

```text
Gerät:
Steckdosenleiste
Seriennummer: SL-00125
Lokation: Büro 12

Prüfungen:
keine
```

Erst wenn für das Gerät eine Prüfung durchgeführt und gespeichert wurde, besitzt das Gerät eine Prüfung für die aktuelle Prüfrunde.

Beispiel:

```text
Aktuelle Prüfung: 2026

Gerät:
Steckdosenleiste
Seriennummer: SL-00125

Prüfungen:
2026
```

### Prüfungen über mehrere Prüfrunden

Ein Gerät kann im Laufe seiner Lebensdauer mehrere Prüfungen besitzen.

Beispielsweise:

```text
Gerät
│
├── Prüfung 2024
├── Prüfung 2025
└── Prüfung 2026
```

Die Prüfungen bilden damit die **Prüfhistorie** des Gerätes.

Wird die aktuelle Prüfrunde von `2025` auf `2026` geändert, wird die Prüfung von 2025 nicht überschrieben.

Wird das Gerät anschließend geprüft, entsteht eine zusätzliche Prüfung für 2026.

Damit bleiben die Ergebnisse der vergangenen Prüfrunden erhalten und können weiterhin eingesehen werden.

### Filter „Abgearbeitet" und „Offen"

Die Filter **„Abgearbeitet"** und **„Offen"** beziehen sich auf die **aktuelle Prüfrunde**.

Dabei wird geprüft, ob für das Gerät eine Prüfung mit dem Wert der aktuellen Prüfrunde vorhanden ist.

Beispiel:

```text
Aktuelle Prüfung: 2026
```

Gerät A besitzt:

```text
Prüfungen:
2025
2026
```

Gerät A ist damit für die aktuelle Prüfrunde **abgearbeitet**.

Gerät B besitzt dagegen:

```text
Prüfungen:
2025
```

Für die aktuelle Prüfrunde `2026` existiert noch keine Prüfung.

Gerät B ist damit **offen**.

Ein neu angelegtes Gerät besitzt zunächst überhaupt keine Prüfung und wird deshalb ebenfalls als **offen** angezeigt.

### Beispiel

Der Gerätebestand enthält drei Geräte:

| Gerät | Prüfungen | Aktuelle Prüfrunde | Status |
|---|---|---|---|
| Gerät A | 2025, 2026 | 2026 | Abgearbeitet |
| Gerät B | 2025 | 2026 | Offen |
| Gerät C | keine | 2026 | Offen |

Nach der Prüfung von Gerät B:

| Gerät | Prüfungen | Aktuelle Prüfrunde | Status |
|---|---|---|---|
| Gerät A | 2025, 2026 | 2026 | Abgearbeitet |
| Gerät B | 2025, 2026 | 2026 | Abgearbeitet |
| Gerät C | keine | 2026 | Offen |

Der Filter **„Abgearbeitet"** zeigt damit die Geräte, für die bereits eine Prüfung zur aktuellen Prüfrunde vorhanden ist.

Der Filter **„Offen"** zeigt die Geräte, für die noch keine Prüfung zur aktuellen Prüfrunde vorhanden ist.

### Neue Prüfrunde beginnen

Um eine neue Prüfrunde zu beginnen, wird der Wert der aktuellen Prüfung geändert.

Beispiel:

```text
Bisher:
Aktuelle Prüfung: 2026

Danach:
Aktuelle Prüfung: 2027
```

Die vorhandenen Prüfungen bleiben erhalten.

Für die neue Prüfrunde sind zunächst alle Geräte offen, für die noch keine Prüfung mit dem Wert `2027` vorhanden ist.

Beispiel:

```text
Gerät A
├── 2026
└── 2027   ← neu geprüft

Gerät B
└── 2026

Gerät C
└── keine
```

Bei der Prüfrunde `2027` sind damit Gerät A abgearbeitet und Gerät B sowie Gerät C offen.

### Bedeutung für die Prüfplanung

Die Prüfrunde kann damit auch verwendet werden, um den Fortschritt einer Prüfung zu verfolgen.

Beispielsweise:

```text
Aktuelle Prüfrunde: 2026

Gesamt:        100 Geräte
Abgearbeitet:   72 Geräte
Offen:          28 Geräte
```

Der Filter **„Offen"** zeigt dabei genau die Geräte, für die in der aktuellen Prüfrunde noch keine Prüfung angelegt wurde.

Dies ermöglicht es, die noch ausstehenden Geräte gezielt abzuarbeiten.

### Prüfhistorie eines Gerätes

Die Prüfhistorie bleibt unabhängig von der aktuellen Prüfrunde am Gerät erhalten.

Beispielsweise:

```text
Steckdosenleiste
Seriennummer: SL-00125

Prüfhistorie:
2024  → bestanden
2025  → bestanden
2026  → bestanden
```

Wird die aktuelle Prüfrunde auf `2027` geändert, bleiben die drei vorhandenen Prüfungen erhalten:

```text
2024
2025
2026
```

Das Gerät wird lediglich für die neue Prüfrunde `2027` als offen betrachtet, solange noch keine Prüfung für diese Prüfrunde vorhanden ist.

### Wichtig für die Arbeit mit Prüfrunden

Die Bezeichnung der Prüfrunde sollte mit Bedacht gewählt werden.

Wenn mehrere Prüfer am selben Prüfobjekt arbeiten, müssen sie für dieselbe Prüfrunde **denselben Wert für die aktuelle Prüfung** verwenden.

Beispielsweise müssen alle beteiligten Geräte verwenden:

```text
2026
```

und nicht beispielsweise:

```text
2026
Prüfung 2026
Jahresprüfung 2026
2026-01
```

Diese Werte werden als unterschiedliche Prüfrunden behandelt.

> **Wichtig:** Der Wert der Prüfrunde ist der Schlüssel für die Zuordnung der Prüfungen. Unterschiedliche Bezeichnungen für dieselbe fachliche Prüfrunde führen daher zu unterschiedlichen Prüfungen.

### Zusammenfassung

Die wichtigsten Zusammenhänge sind:

- Jedes Prüfobjekt besitzt immer eine **aktuelle Prüfrunde**.
- Der Wert der aktuellen Prüfrunde wird zur Zuordnung neu angelegter Prüfungen verwendet.
- Ein neu angelegtes Gerät besitzt zunächst **keine Prüfung**.
- Ein Gerät kann Prüfungen aus mehreren Prüfrunden besitzen.
- Die bisherigen Prüfungen werden beim Start einer neuen Prüfrunde nicht gelöscht.
- **„Abgearbeitet"** bedeutet, dass für das Gerät eine Prüfung mit dem Wert der aktuellen Prüfrunde vorhanden ist.
- **„Offen"** bedeutet, dass für das Gerät noch keine Prüfung mit dem Wert der aktuellen Prüfrunde vorhanden ist.
- Die Prüfhistorie eines Gerätes bleibt über mehrere Prüfrunden erhalten.
- Bei der Zusammenarbeit mehrerer Prüfer muss für dieselbe Prüfrunde derselbe Wert verwendet werden.

## Dashboard

Über das Diagramm-Symbol im Kopfbereich der App gelangt man zum **Dashboard**. Es zeigt eine Übersicht zur aktuell eingestellten Prüfung:

- **Übersicht** – Gesamtzahl der Geräte sowie Anzahl aktiver und ausgemusterter Geräte.
- **Prüfstatus** (Diagramm) – wie viele Geräte bereits aktuell geprüft, noch offen oder ausgemustert sind.
- **Prüfergebnis** (Diagramm) – Verteilung nach Bestanden / Nicht bestanden / Kein Ergebnis.
- **Gerätezustand** (Diagramm) – Verteilung nach Vorhanden / Defekt / Außer Betrieb / Nicht auffindbar.

Alle Zahlen und Diagramme beziehen sich ausschließlich auf die aktuell im Prüfobjekt eingestellte Prüfung.

## PDF-Bericht erzeugen

Im Dashboard steht der Button **„Bericht erzeugen“** zur Verfügung. Er erstellt einen PDF-Bericht zur aktuellen Prüfung mit folgendem Inhalt:

- ein **Deckblatt** mit den Angaben zum Prüfobjekt (Namen, Anschrift, Ort, aktuelle Prüfung) sowie – sofern hinterlegt – den Auditor-Angaben (Name, Anschrift, Ort und Prüfer),
- eine **Übersichtsseite** mit den drei Diagrammen aus dem Dashboard,
- Listen aller geprüften Geräte, getrennt nach den Ergebnissen **Bestanden**, **Nicht bestanden** und **Kein Ergebnis** – jeweils mit Standort, Seriennummer und den einzelnen Prüfwerten (Sichtprüfung, Funktionsprüfung, Messung inkl. Schutzleiterwiderstand, Isolationswiderstand, Ersatzableitstrom und Berührungsstrom, Gesamtergebnis) sowie einem eventuell hinterlegten Hinweis,
- eigene Listen für Geräte mit dem Zustand **„Nicht auffindbar“** und **„Außer Betrieb“**,
- ein **Unterschriftenfeld** am Ende des Berichts mit dem Namen des Prüfers und dem aktuellen Datum, gefolgt von einer Linie zum Unterschreiben. Wurde kein Prüfer hinterlegt, erscheint stattdessen ein Platzhalter-Strich mit dem Datum,
- eine Seitenzahl am Ende jeder Seite.

Geräte ohne aktuelle Prüfung oder mit abweichendem Gerätezustand tauchen in diesen Listen nicht auf. Der Bericht wird als PDF-Datei herunterladen.

## Backup und Wiederherstellung

### Backup erstellen

In der Geräteliste steht oben rechts der Button **„Backup herunterladen“** zur Verfügung. Er erstellt eine ZIP-Datei mit sämtlichen Geräten, Bildern, PDFs und Prüfobjekt-Informationen und lädt sie herunter. Das Datum des letzten Backups wird direkt daneben angezeigt.

Das Backup ist ein vollständiger, in sich geschlossener Datenstand und enthält:

- alle Geräte und deren gesamte **Prüfhistorie** (alle Prüfrunden, nicht nur die aktuelle),
- alle zu den Geräten und Prüfungen hochgeladenen **Bilder und PDF-Dokumente**,
- die **Prüfobjekt-Angaben** (Name, Namen, Anschrift, Ort, aktuelle Prüfung, sowie die Auditor-Angaben).

Der Dateiname des Backups enthält bereits den Namen des Prüfobjekts sowie Datum und Uhrzeit der Erstellung, analog zum PDF-Bericht und zum Excel-Export.

> **Empfehlung:** Regelmäßig ein Backup erstellen, insbesondere vor größeren Änderungen oder dem Wechsel auf ein anderes Gerät.

### Backup wiederherstellen

Im Administrationsbereich lässt sich unter „Backup wiederherstellen“ eine zuvor erstellte ZIP-Datei laden.

> **Achtung:** Beim Wiederherstellen werden alle vorhandenen Daten (Geräte, Bilder, PDFs, Prüfobjekt-Informationen) vollständig überschrieben.

Sollen die Daten eines Backups dagegen **zusätzlich** in den vorhandenen Bestand übernommen werden, statt alles zu ersetzen, steht dafür die Funktion „Backup zusammenführen“ zur Verfügung (siehe [Backup zusammenführen](#backup-zusammenführen)).

### Backup zusammenführen

Im Administrationsbereich steht unter der Kachel **„Backup zusammenführen“** eine Funktion zur Verfügung, mit der sich ein Backup **zusätzlich** in den vorhandenen Datenbestand übernehmen lässt – im Gegensatz zum „Backup wiederherstellen“, das alle vorhandenen Daten vollständig überschreibt (siehe [Backup wiederherstellen](#backup-wiederherstellen)).

Die Funktion ist dafür gedacht, dass **mehrere Prüfer gleichzeitig am selben Prüfobjekt arbeiten** können: Jeder Prüfer erfasst seine Prüfungen auf seinem eigenen Gerät. Anschließend werden die Backups der Beteiligten zu einem gemeinsamen Datenstand zusammengeführt, sodass keine Erfassung verloren geht. Ein typischer Ablauf:

1. Jeder Prüfer erfasst seine Prüfungen wie gewohnt in seiner App.
2. Jeder Prüfer erstellt ein Backup und gibt die Datei an die Person weiter, die den zusammengeführten Datenstand führen soll (siehe [Backup erstellen](#backup-erstellen)).
3. Diese Person führt die empfangenen Backups **einzeln nacheinander** in ihren Datenstand zusammen.
4. Der Ergebnisbericht zeigt bei jedem Vorgang, was übernommen wurde. Der vereinigte Stand kann anschließend erneut als Backup exportiert und an alle Beteiligten verteilt werden.

Auf der Kachel auf den Button **„Zusammenführen öffnen“** tippen. Es öffnet sich eine eigene Seite im gleichen Aufbau wie der Administrationsbereich, oben mit einem Zurück-Button zur Übersicht. Dort die gewünschte Backup-ZIP-Datei auswählen und den Vorgang starten.

Die Zusammenführung funktioniert nur, wenn die Prüfobjekt-Angaben im Backup und in der App vorhanden sind und in allen Feldern übereinstimmen (Prüfobjekt, Namen, Anschrift, Ort, Aktuelle Prüfung sowie die Auditor-Angaben). Stimmen diese Angaben nicht überein, bricht der Vorgang mit einer Fehlermeldung ab, ohne dass etwas geändert wird. So wird verhindert, dass versehentlich Daten zweier verschiedener Prüfobjekte vermischt werden.

> **Empfehlung:** Vor dem Zusammenführen ein Backup des aktuellen Datenstands erstellen (siehe [Backup erstellen](#backup-erstellen)), damit der Stand vor dem Vorgang gesichert ist.

Beim Zusammenführen gilt:

- Geräte, die im Backup neu sind, werden vollständig übernommen – inklusive Standort, Bilder, PDFs und allen Prüfungen.
- Bei Geräten, die bereits vorhanden sind, werden nur Prüfungen übernommen, deren Prüfungsname dort noch nicht existiert – inklusive der zu diesen Prüfungen gehörenden Bilder und PDFs. Prüfungen mit einem bereits vorhandenen Prüfungsnamen werden übersprungen.
- Wurde im Backup ein Gerät mit einer übernommenen Prüfung als „Außer Betrieb“ geführt, wird das vorhandene Gerät ebenfalls als ausgemustert markiert (siehe [Automatische Ausmusterung](#automatische-ausmusterung)).
- Bereits vorhandene Bilder und PDFs werden nicht überschrieben.
- Dasselbe Backup kann mehrfach zusammengeführt werden, ohne dass Duplikate entstehen.

Nach Abschluss des Vorgangs bleibt die Seite geöffnet und zeigt einen Ergebnisbericht an: eine Kennzahlenzeile (wie viele Geräte eingefügt, wie viele Prüfungen zusammengeführt und wie viele nicht übernommen wurden) sowie drei Tabellen mit jeweils einer Zeile je Prüfung bzw. Gerät:

- **Eingefügte Geräte** – Typ, Hersteller, Modell und Seriennummer jedes neu übernommenen Geräts,
- **Zusammengeführte Inspectionen** – Prüfungsname und Datum jeder Prüfung, die an bereits vorhandenen Geräten ergänzt wurde,
- **Nicht übernommene Inspectionen** – Prüfungsname und Datum jeder übersprungenen Prüfung.

Die übernommenen Geräte erscheinen beim nächsten Öffnen in der Geräteliste (siehe [Geräteliste – Filtern und Sortieren](#geräteliste--filtern-und-sortieren)).

Eine ausführlichere Anleitung zum praktischen Ablauf mit mehreren Prüfern findet sich im Abschnitt [Arbeiten mit mehreren Prüfern](#arbeiten-mit-mehreren-prüfern).

### Mehrere Klienten oder Standorte verwalten

Da jedes Backup einen vollständigen, eigenständigen Datenstand (ein Prüfobjekt mit allen zugehörigen Geräten) enthält, lässt sich die App auch für **mehrere unabhängige Kunden, Prüfobjekte oder Standorte** einsetzen, ohne dass sich die Daten gegenseitig überschneiden:

1. Vor dem Wechsel zu einem anderen Klienten den aktuellen Stand über „Backup herunterladen“ sichern.
2. Anschließend im Administrationsbereich das Backup des gewünschten anderen Klienten über „Backup wiederherstellen“ laden.
3. Die App zeigt danach ausschließlich die Geräte und Prüfobjekt-Angaben des geladenen Backups an.

> **Achtung:** Die App verwaltet immer nur **einen** Datenstand gleichzeitig. Vor jedem Wechsel unbedingt zuerst ein Backup des aktuellen Klienten erstellen, da das Laden eines anderen Backups die aktuell angezeigten Daten vollständig überschreibt. Es empfiehlt sich, die Backup-Dateien sprechend zu benennen und pro Klient an einem festen Ort (z. B. einem eigenen Ordner) zu archivieren.

## Arbeiten mit mehreren Prüfern

Da die App vollständig offline arbeitet und die Daten ausschließlich lokal auf dem jeweiligen Gerät gespeichert werden, können mehrere Prüfer unabhängig voneinander am selben Prüfobjekt arbeiten.

Die Backups der einzelnen Prüfer können anschließend über **„Backup zusammenführen"** zu einem gemeinsamen Datenstand zusammengeführt werden (siehe [Backup zusammenführen](#backup-zusammenführen)).

### Gemeinsamen Ausgangsstand verteilen

Sollen mehrere Prüfer am selben Prüfobjekt arbeiten, sollte zunächst auf einem Gerät der gemeinsame Ausgangsstand vorbereitet werden.

1. Den gewünschten Datenstand öffnen.
2. Über **„Backup herunterladen"** ein Backup erstellen.
3. Die Backup-ZIP-Datei an die beteiligten Prüfer weitergeben.
4. Die Prüfer laden das Backup über **„Backup wiederherstellen"** auf ihrem jeweiligen Gerät.

Nach dem Wiederherstellen verfügen alle Prüfer über denselben Ausgangsstand und können unabhängig voneinander arbeiten.

> **Hinweis:** Beim Wiederherstellen wird der vorhandene Datenbestand vollständig überschrieben. Das Backup daher nur auf einem Gerät wiederherstellen, auf dem der vorhandene Datenbestand nicht benötigt wird. Vorher gegebenenfalls ein eigenes Backup erstellen.

### Prüfungen durchführen

Jeder Prüfer arbeitet anschließend auf seinem eigenen Gerät und erfasst die ihm zugewiesenen Prüfungen.

Zum Beispiel können die Prüfer unterschiedliche Bereiche eines Prüfobjekts bearbeiten:

- Prüfer 1 prüft das Erdgeschoss.
- Prüfer 2 prüft das Obergeschoss.
- Prüfer 3 prüft die Werkstatt.

Die Geräte und Prüfungen werden dabei wie gewohnt erfasst. Auch Bilder und PDFs können den Geräten bzw. Prüfungen hinzugefügt werden.

Da die App vollständig offline funktioniert, ist während der Erfassung keine Internetverbindung erforderlich.

### Backups der Prüfer erstellen

Nach Abschluss der Arbeiten erstellt jeder Prüfer über **„Backup herunterladen"** ein eigenes Backup.

Das Backup enthält immer den vollständigen Datenbestand des jeweiligen Geräts, nicht nur die während der aktuellen Arbeit neu erfassten Prüfungen.

Die Backups sollten deshalb eindeutig zugeordnet werden können. Der von der App erzeugte Dateiname enthält bereits das Prüfobjekt sowie Datum und Uhrzeit der Erstellung.

> **Empfehlung:** Bei mehreren Prüfern die Backups nach Möglichkeit direkt nach Abschluss der Arbeiten weitergeben und nicht über längere Zeit aufbewahren, bevor sie zusammengeführt werden.

### Backups zusammenführen

Die Backups werden anschließend auf einem Gerät zu einem gemeinsamen Datenstand zusammengeführt.

1. Das Gerät mit dem gemeinsamen Datenstand öffnen.
2. Vor dem Zusammenführen über **„Backup herunterladen"** ein Backup des aktuellen Datenstands erstellen.
3. Im Administrationsbereich **„Backup zusammenführen"** öffnen.
4. Das Backup eines Prüfers auswählen.
5. Den Vorgang starten.
6. Den angezeigten Ergebnisbericht prüfen.
7. Die weiteren Backups **einzeln nacheinander** zusammenführen.

Die Funktionsweise der Zusammenführung ist im Abschnitt [Backup zusammenführen](#backup-zusammenführen) beschrieben.

> **Wichtig:** Die Backups sollten nicht gleichzeitig zusammengeführt werden. Jedes Backup wird einzeln verarbeitet. Nach jedem Vorgang zeigt die App einen Ergebnisbericht an.

### Beispiel

Ein Prüfobjekt enthält 100 Geräte. Zwei Prüfer teilen sich die Arbeit.

Beide Prüfer erhalten zunächst ein Backup mit den 100 Geräten.

**Prüfer 1** prüft die Geräte 1 bis 50 und erstellt anschließend ein Backup.

**Prüfer 2** prüft die Geräte 51 bis 100 und erstellt ebenfalls ein Backup.

Anschließend werden beide Backups nacheinander in den gemeinsamen Datenbestand übernommen.

Da die Prüfer unterschiedliche Geräte bearbeitet haben, werden die jeweiligen Prüfungen zu den bereits vorhandenen Geräten hinzugefügt.

Der gemeinsame Datenbestand enthält danach die Prüfungen beider Prüfer.

### Bereits vorhandene Geräte

Die Zusammenführung kann auch verwendet werden, wenn mehrere Prüfer Prüfungen an Geräten durchführen, die bereits im gemeinsamen Datenbestand vorhanden sind.

Bei einem bereits vorhandenen Gerät werden Prüfungen übernommen, deren **Prüfungsname** im vorhandenen Gerät noch nicht existiert.

Prüfungen mit einem bereits vorhandenen Prüfungsnamen werden nicht erneut übernommen.

> **Wichtig:** Die Funktion „Backup zusammenführen" ist keine automatische Synchronisation. Änderungen an derselben Prüfung werden nicht miteinander verglichen oder automatisch zusammengeführt. Für die Zusammenarbeit sollten die Prüfer daher möglichst unterschiedliche Geräte bzw. Prüfungen bearbeiten.

### Ergebnis kontrollieren

Nach jedem Zusammenführen zeigt die App einen Ergebnisbericht an.

Dort wird angezeigt:

- wie viele Geräte eingefügt wurden,
- wie viele Prüfungen zusammengeführt wurden,
- wie viele Prüfungen nicht übernommen wurden.

Zusätzlich werden die einzelnen Vorgänge in den Tabellen **„Eingefügte Geräte"**, **„Zusammengeführte Inspectionen"** und **„Nicht übernommene Inspectionen"** aufgeführt.

Der Ergebnisbericht sollte nach jedem Zusammenführen kontrolliert werden.

### Gemeinsamen Datenstand wieder verteilen

Nach dem Zusammenführen kann der vollständige Datenstand über **„Backup herunterladen"** erneut gesichert werden.

Dieses Backup kann anschließend wieder auf die Geräte der beteiligten Prüfer verteilt werden.

Dabei ist zu beachten:

> **Achtung:** Das Wiederherstellen des gemeinsamen Backups überschreibt den vorhandenen Datenbestand auf dem jeweiligen Gerät vollständig.

Daher sollte das gemeinsame Backup erst verteilt werden, wenn alle benötigten Backups der einzelnen Prüfer zusammengeführt wurden.

### Empfohlener Ablauf

Für die Zusammenarbeit mehrerer Prüfer ergibt sich damit folgender Ablauf:

1. Gemeinsamen Ausgangsstand vorbereiten.
2. Backup des Ausgangsstands erstellen.
3. Backup an die Prüfer verteilen.
4. Prüfer stellen das Backup auf ihren Geräten wieder her.
5. Prüfer führen ihre Prüfungen unabhängig voneinander durch.
6. Jeder Prüfer erstellt nach Abschluss ein eigenes Backup.
7. Gemeinsamen Datenstand sichern.
8. Backups der Prüfer einzeln nacheinander zusammenführen.
9. Nach jedem Vorgang den Ergebnisbericht kontrollieren.
10. Nach Abschluss ein Backup des gemeinsamen Datenstands erstellen.

> **Empfehlung:** Die ursprünglichen Backups der einzelnen Prüfer sollten bis zur Kontrolle des zusammengeführten Datenstands aufbewahrt werden. Dadurch kann bei einem Fehler jederzeit auf den jeweiligen Ausgangsstand zurückgegriffen werden.

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
- Neu importierte Geräte werden – ebenso wie geklonte Geräte – als „neu" markiert und lassen sich über den Filter-Chip „Neu" in der Geräteliste auffinden, bis sie einmal bearbeitet und gespeichert wurden (siehe [Gerät klonen](#gerät-klonen)).

Eine ausführlichere Anleitung zur Vorbereitung großer Gerätebestände in Excel findet sich im Abschnitt [Excel-Import und Massendaten](#excel-import-und-massendaten).

## Excel-Import und Massendaten

Der Excel-Import ermöglicht es, eine größere Anzahl von Geräten in einem Arbeitsschritt in die App zu übernehmen.

Dies ist insbesondere dann hilfreich, wenn viele gleichartige Geräte erfasst werden müssen, beispielsweise:

- Steckdosenleisten
- Verlängerungsleitungen
- Netzteile
- Ladegeräte
- ortsveränderliche Geräte mit ähnlichen Stammdaten
- Geräte, deren Seriennummern und Lokationen bereits bekannt sind

Statt jedes Gerät einzeln anzulegen, können die Daten zunächst in Excel vorbereitet und anschließend importiert werden.

### Vorbereitung der Excel-Datei

Für den Import wird eine Excel-Datei mit den entsprechenden Spalten benötigt.

Die Spalten der Excel-Datei entsprechen den Feldern, die beim Anlegen eines Gerätes in der App verwendet werden.

Dabei sollte jede Zeile genau **ein Gerät** darstellen.

Beispiel:

| Bezeichnung | Hersteller | Typ | Seriennummer | Lokation |
|---|---|---|---|---|
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00001 | Büro 1 |
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00002 | Büro 1 |
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00003 | Büro 2 |
| Steckdosenleiste | Brennenstuhl | Premium-Line | STL-00004 | Büro 2 |

Die gemeinsamen Angaben können dabei für viele Geräte identisch sein.

### Massendaten vorbereiten

Bei größeren Mengen empfiehlt es sich, zunächst ein einzelnes Gerät vollständig zu beschreiben und anschließend die wiederkehrenden Angaben in Excel für die weiteren Zeilen zu übernehmen.

Beispielsweise müssen bei 200 identischen Steckdosenleisten nicht jedes Mal Hersteller und Typ manuell eingetragen werden.

In Excel können die Werte einfach nach unten kopiert werden.

```text
Hersteller       Typ             Seriennummer    Lokation
Brennenstuhl     Premium-Line    STL-00001       Büro 1
Brennenstuhl     Premium-Line    STL-00002       Büro 1
Brennenstuhl     Premium-Line    STL-00003       Büro 1
...
Brennenstuhl     Premium-Line    STL-00200       Büro 5
```

Dadurch lassen sich auch größere Mengen von Geräten schnell vorbereiten.

### Seriennummern in Excel erzeugen

Wenn für die Geräte noch keine Seriennummern vorhanden sind, können diese für die Erfassung in Excel erzeugt werden.

Eine einfache Möglichkeit ist eine fortlaufende Nummer.

Beispielsweise:

```text
STL-00001
STL-00002
STL-00003
STL-00004
...
STL-00200
```

In Excel kann dafür beispielsweise folgende Formel verwendet werden:

```excel
="STL-"&TEXT(ZEILE(A1);"00000")
```

Beim Herunterziehen der Formel entstehen automatisch fortlaufende Nummern.

Die verwendete Nummerierung sollte dabei so gewählt werden, dass die erzeugten Seriennummern innerhalb des Datenbestands eindeutig sind.

> **Wichtig:** Die auf diese Weise erzeugten Seriennummern sind keine vom Hersteller vergebenen Seriennummern. Sie dienen lediglich als eigene eindeutige Kennzeichnung der Geräte.

Eine solche Kennzeichnung kann beispielsweise verwendet werden, wenn ein Gerät keine Hersteller-Seriennummer besitzt oder die vorhandene Seriennummer für die praktische Erfassung nicht geeignet ist.

### Eigene Inventarnummern verwenden

Für die praktische Prüfung kann es sinnvoll sein, eine eigene Nummerierung zu verwenden.

Beispielsweise:

```text
SL-2026-00001
SL-2026-00002
SL-2026-00003
```

Dabei kann die Nummerierung Informationen über den Bestand enthalten.

Zum Beispiel:

```text
SL    = Steckdosenleiste
2026  = Jahr der Erfassung
00001 = fortlaufende Nummer
```

Die genaue Struktur kann frei gewählt werden.

> **Hinweis:** Bei einer eigenen Nummerierung sollte die Nummer einmalig vergeben werden und anschließend dauerhaft demselben Gerät zugeordnet bleiben.

### Lokationen in Excel vorbereiten

Auch Lokationen können bereits vor dem Import in Excel festgelegt werden.

Beispielsweise:

```text
Gebäude 1 / Erdgeschoss / Büro 01
Gebäude 1 / Erdgeschoss / Büro 02
Gebäude 1 / Erdgeschoss / Büro 03
Gebäude 1 / Obergeschoss / Büro 01
```

Wenn mehrere Geräte dieselbe Lokation haben, kann der entsprechende Wert für alle Geräte übernommen werden.

Beispiel:

| Seriennummer | Lokation |
|---|---|
| STL-00001 | Gebäude 1 / EG / Büro 01 |
| STL-00002 | Gebäude 1 / EG / Büro 01 |
| STL-00003 | Gebäude 1 / EG / Büro 01 |
| STL-00004 | Gebäude 1 / EG / Büro 02 |

Damit steht die Lokation bereits bei der ersten Erfassung zur Verfügung und muss nicht für jedes Gerät einzeln eingetragen werden.

### Lokationen automatisch erzeugen

Bei großen Beständen können auch die Lokationen mit Excel-Formeln erzeugt werden.

Beispielsweise kann eine Liste der Räume vorbereitet werden:

```text
Büro 01
Büro 02
Büro 03
Büro 04
...
```

Anschließend können diese Werte den Geräten zugeordnet werden.

Bei einem regelmäßigen Aufbau, beispielsweise zehn Steckdosenleisten pro Büro, kann die Lokation auch anhand der laufenden Nummer automatisch erzeugt werden.

Damit lassen sich beispielsweise 100 Geräte auf zehn Räume verteilen, ohne jede Lokation einzeln eingeben zu müssen.

### Kombination aus Seriennummer und Lokation

Besonders effektiv ist die Kombination aus automatisch erzeugter Seriennummer und vorbereiteter Lokation.

Beispiel:

| Bezeichnung | Seriennummer | Lokation |
|---|---|---|
| Steckdosenleiste | SL-00001 | Büro 01 |
| Steckdosenleiste | SL-00002 | Büro 01 |
| Steckdosenleiste | SL-00003 | Büro 01 |
| Steckdosenleiste | SL-00004 | Büro 02 |
| Steckdosenleiste | SL-00005 | Büro 02 |
| Steckdosenleiste | SL-00006 | Büro 02 |

Nach dem Import sind die Geräte bereits mit den vorbereiteten Stammdaten angelegt.

Die eigentliche Prüfung kann anschließend direkt in der App durchgeführt werden.

### Beispiel: 100 Steckdosenleisten

Angenommen, in einem Gebäude sollen 100 Steckdosenleisten geprüft werden.

Die Geräte sind baugleich und besitzen keine für die Prüfung verwendete Seriennummer.

In Excel werden zunächst die erforderlichen Daten vorbereitet:

```text
Bezeichnung:     Steckdosenleiste
Hersteller:      Beispielhersteller
Typ:             Beispieltyp
Seriennummer:    SL-00001 bis SL-00100
Lokation:        Büro 01 bis Büro 20
```

Anschließend wird die Excel-Datei importiert.

Die 100 Geräte stehen danach in der App zur Verfügung und können einzeln geprüft werden.

### Excel als Vorbereitung der Erfassung

Der Excel-Import sollte insbesondere für die **Vorbereitung von Stammdaten** verwendet werden.

Die eigentliche Prüfung erfolgt anschließend in der App.

Das hat den Vorteil, dass die wiederkehrenden Informationen nicht während der Prüfung manuell eingegeben werden müssen.

Der Ablauf kann beispielsweise so aussehen:

```text
Excel
  │
  ├── Geräte erzeugen
  ├── Seriennummern vergeben
  ├── Lokationen zuordnen
  └── Stammdaten vorbereiten
          │
          ▼
     Excel-Import
          │
          ▼
        App
          │
          ├── Geräte prüfen
          ├── Messwerte erfassen
          ├── Bilder hinzufügen
          └── Prüfung abschließen
```

### Vor dem Import kontrollieren

Vor dem Import sollte die Excel-Datei kontrolliert werden.

Insbesondere sollte geprüft werden:

- Ist jede Zeile einem Gerät zugeordnet?
- Sind Pflichtfelder ausgefüllt?
- Sind Seriennummern eindeutig?
- Sind Lokationen korrekt geschrieben?
- Gibt es versehentlich doppelte Geräte?
- Sind die Spalten den richtigen Feldern zugeordnet?
- Enthalten die Zellen unerwünschte Leerzeichen oder zusätzliche Zeichen?

Bei großen Datenmengen ist eine Kontrolle in Excel wesentlich einfacher als eine nachträgliche Korrektur in der App.

### Empfehlung bei großen Datenmengen

Bei sehr großen Datenmengen empfiehlt es sich, den Import zunächst mit einer kleinen Anzahl von Geräten zu testen.

Beispielsweise können zunächst fünf bis zehn Geräte importiert und anschließend kontrolliert werden.

Erst wenn die Zuordnung der Spalten und die erzeugten Daten korrekt sind, sollte der vollständige Datenbestand importiert werden.

> **Achtung:** Vor einem größeren Import sollte ein Backup des aktuellen Datenbestands erstellt werden. Dadurch kann bei Bedarf auf den vorherigen Stand zurückgegriffen werden.

### Zusammenspiel mit dem Arbeiten mit mehreren Prüfern

Der Excel-Import kann auch mit dem [Arbeiten mit mehreren Prüfern](#arbeiten-mit-mehreren-prüfern) kombiniert werden.

Beispielsweise kann der vollständige Gerätebestand zunächst über Excel erzeugt und importiert werden.

Anschließend wird der Datenbestand als Backup an die beteiligten Prüfer verteilt.

Die Prüfer führen ihre Prüfungen unabhängig voneinander durch und erstellen anschließend jeweils ein Backup.

Die einzelnen Backups können danach über **„Backup zusammenführen"** wieder zu einem gemeinsamen Datenbestand zusammengeführt werden.

Damit eignet sich der Excel-Import insbesondere für die **Vorbereitung großer Gerätebestände**, während **Backup und Backup zusammenführen** für die anschließende Zusammenarbeit mehrerer Prüfer verwendet werden können.

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

**Kann ich ein Backup hinzufügen, ohne meine vorhandenen Daten zu überschreiben?**
Ja. Im Administrationsbereich unter „Backup zusammenführen“ (siehe [Backup zusammenführen](#backup-zusammenführen)). Dabei wird das Backup zusätzlich in den vorhandenen Bestand übernommen; bereits vorhandene Geräte, Bilder und PDFs bleiben unverändert. Voraussetzung ist, dass die Prüfobjekt-Angaben in beiden Datenständen übereinstimmen.
