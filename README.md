## Über die App

# Prüftool -- Die einfache Prüfdokumentation für ortsveränderliche elektrische Geräte

**Prüfool** ist eine vollständig **offlinefähige Webanwendung** zur
Erfassung und Verwaltung von Sicherheitsprüfungen an
**ortsveränderlichen elektrischen Geräten**. Die Anwendung richtet sich
insbesondere an **kleine Handwerksbetriebe, Hausmeisterservices,
Dienstleister und Werkstätten**, die ihre Prüfungen einfach,
nachvollziehbar und ohne Cloud oder Server dokumentieren möchten.

Alle Daten werden ausschließlich lokal im Browser (IndexedDB)
gespeichert. Es ist keine Internetverbindung, kein Benutzerkonto und
keine Installation einer Datenbank erforderlich. Datensicherheit und
Datenschutz bleiben vollständig in Ihrer Hand.

## Warum Prüftool?

Die regelmäßige Prüfung ortsveränderlicher elektrischer Betriebsmittel
trägt wesentlich zur Arbeitssicherheit bei. In Betrieben müssen Geräte
wie Bohrmaschinen, Verlängerungsleitungen, Netzteile, Ladegeräte,
Kaffeemaschinen oder Computer in festgelegten Intervallen geprüft und
dokumentiert werden. Grundlage hierfür sind unter anderem die
Anforderungen der **DGUV Vorschrift 3** sowie die **DIN VDE 0701-0702**,
welche die Prüfung nach Instandsetzung und die Wiederholungsprüfung
elektrischer Geräte beschreibt.

derErfasser unterstützt den gesamten Ablauf einer Prüfrunde -- von der
Geräteerfassung bis zum fertigen Prüfbericht.

## Funktionen

### Geräteverwaltung

Erfassen und verwalten Sie alle prüfpflichtigen Geräte mit ihren
Stammdaten:

-   Hersteller, Modell und Typ
-   Seriennummer und Inventarnummer
-   Schutzklasse
-   Nennspannung und Leistung
-   Standort und Einsatzbereich
-   Bilder und PDF-Dokumente (z. B. Bedienungsanleitungen)

Alle Informationen bleiben dauerhaft mit dem Gerät verknüpft.

### Durchführung von Sicherheitsprüfungen

Für jedes Gerät können vollständige Prüfungen dokumentiert werden:

-   Sichtprüfung
-   Funktionsprüfung
-   Messwerte
    -   Schutzleiterwiderstand
    -   Isolationswiderstand
    -   Ersatzableitstrom
    -   Berührungsstrom
-   Gesamtbewertung
-   Gerätezustand

Geräte, die als **„Außer Betrieb"** gekennzeichnet werden, werden
automatisch aus der aktiven Prüfliste entfernt und bleiben dennoch
vollständig dokumentiert.

### Übersichtliche Geräteliste

Die Geräteliste bietet:

-   schnelle Suche
-   Filter- und Sortierfunktionen
-   Statusanzeige
    -   Offen
    -   Abgearbeitet
    -   Alle
    -   Ausgemustert
-   direkten Einstieg in die nächste Prüfung

### Prüfrunden mit Historie

Alle durchgeführten Prüfungen bleiben dauerhaft erhalten.

Statt alte Daten zu überschreiben, wird einfach eine neue **Prüfrunde**
angelegt. So lässt sich die gesamte Historie eines Gerätes über viele
Jahre nachvollziehen.

### Dashboard

Das integrierte Dashboard zeigt den aktuellen Stand der Prüfrunde:

-   Anzahl geprüfter Geräte
-   offene Prüfungen
-   bestandene und nicht bestandene Prüfungen
-   Gerätezustände
-   übersichtliche Diagramme

### PDF-Prüfbericht

Mit einem Klick wird ein vollständiger Prüfbericht erzeugt.

Der Bericht enthält unter anderem:

-   Deckblatt
-   Zusammenfassung
-   Diagramme
-   Listen geprüfter Geräte
-   Ergebnisse der Prüfungen

### Backup & Wiederherstellung

Alle Daten können jederzeit als ZIP-Datei exportiert werden.

Ein Backup enthält:

-   Geräte
-   Prüfhistorie
-   Bilder
-   Dokumente

Damit lassen sich Daten einfach sichern oder auf einen anderen Rechner
übertragen.

## Vorteile

-   ✅ 100 % offline nutzbar
-   ✅ Keine Cloud
-   ✅ Keine Registrierung
-   ✅ Keine Datenbankinstallation
-   ✅ Alle Daten bleiben lokal
-   ✅ Einfache Bedienung
-   ✅ Langfristige Prüfhistorie
-   ✅ PDF-Berichte
-   ✅ Datensicherung per ZIP

## Dokumentation

Eine ausführliche Beschreibung der Anwendung, einschließlich
Bedienhinweisen und Ablaufdiagrammen, befindet sich im
**Anwenderhandbuch**. Dieses ist sowohl im Repository als auch direkt in
der Anwendung über den Menüpunkt **„Anleitung"** verfügbar.

------------------------------------------------------------------------

**Prüftool** verfolgt ein einfaches Ziel: **Prüfungen
ortsveränderlicher elektrischer Geräte schnell, übersichtlich und
rechtssicher dokumentieren -- ohne komplizierte Software, ohne Cloud und
ohne unnötigen Verwaltungsaufwand.**

Eine ausführliche Beschreibung inklusive Ablaufdiagramm befindet sich im [Anwenderhandbuch](./ANWENDERHANDBUCH.md) (auch direkt in der App unter „Anleitung“ abrufbar).

## Link zum Prüftool 

[https://drgonzales.github.io/derErfasser/] 


## Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Die App wird bei jedem Push auf `main` automatisch per GitHub Actions
(`.github/workflows/deploy-pages.yml`) auf **GitHub Pages** unter
`https://<user>.github.io/derErfasser/` veröffentlicht. Da GitHub Pages
Projekt-Seiten unter einem Unterordner ausliefert, baut der Workflow mit
`BASE_PATH=/derErfasser/`, wodurch alle Asset-, Icon- und PWA-Manifest-Pfade
entsprechend präfixiert werden (siehe `vite.config.ts`). Lokal lässt sich
dieser Build mit folgendem Script nachvollziehen:

```bash
npm run build:pages
npm run preview
```

Voraussetzung in den Repository-Einstellungen: **Settings → Pages → Source**
muss auf **GitHub Actions** stehen.

