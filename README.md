# derErfasser

Eine kleine Svelte-PWA zum lokalen Erfassen von Daten und Bildern. Alle Eintraege werden offline in IndexedDB gespeichert.
[https://drgonzales.github.io/derErfasser/] 

## Über die App

**derErfasser** / „Prüftool“  erfasst und verwaltet elektrische Sicherheitsprüfungen von Geräten – vollständig offline, alle Daten bleiben lokal im Browser (IndexedDB).

- **Geräte verwalten**: Anlegen mit Stammdaten (Typ, Hersteller, Modell, Seriennummer, Schutzklasse, Nennwerte) und Standort, inklusive Bildern und PDFs.
- **Prüfungen durchführen**: Sichtprüfung, Funktionsprüfung, Messung (Schutzleiterwiderstand, Isolationswiderstand, Ersatzableitstrom, Berührungsstrom) und Gesamtergebnis erfassen, jeweils mit Gerätezustand. Geräte mit Zustand „Außer Betrieb“ werden automatisch ausgemustert.
- **Geräteliste**: Filter- und Sortiermöglichkeiten, Status-Chips (Offen / Abgearbeitet / Alle / Ausgemustert) sowie Schnellzugriff zum Prüfen direkt aus der Liste.
- **Prüfrunden-Historie**: Alle vergangenen Prüfungen bleiben je Gerät erhalten; eine neue Prüfrunde wird einfach über einen neuen Namen im Prüfobjekt gestartet.
- **Dashboard**: Übersicht und Diagramme zu Prüfstatus, Prüfergebnis und Gerätezustand der aktuellen Prüfrunde.
- **PDF-Bericht**: Erzeugt einen vollständigen Prüfbericht mit Deckblatt, Diagrammen und Gerätelisten nach Ergebnis.
- **Backup & Wiederherstellung**: Export/Import aller Daten als ZIP-Datei, z. B. für den Gerätewechsel.

Eine ausführliche Beschreibung inklusive Ablaufdiagramm befindet sich im [Anwenderhandbuch](./ANWENDERHANDBUCH.md) (auch direkt in der App unter „Anleitung“ abrufbar).

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

