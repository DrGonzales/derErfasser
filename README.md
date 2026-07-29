# derErfasser

Eine kleine Svelte-PWA zum lokalen Erfassen von Daten und Bildern. Alle Eintraege werden offline in IndexedDB gespeichert.

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

Die App liegt fest auf `base: '/'` ausgelegt und kann so unverändert auf
einem eigenen Server unter der Domain-Root deployt werden (siehe
`npm run pideploy`, kopiert `dist/` per `scp` auf einen Raspberry Pi).

Zusätzlich wird die App bei jedem Push auf `main` automatisch per GitHub
Actions (`.github/workflows/deploy-pages.yml`) auf **GitHub Pages** unter
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

## Dokumentation

Eine ausführliche Anleitung zur Bedienung der App befindet sich in
[`ANWENDERHANDBUCH.md`](./ANWENDERHANDBUCH.md). Sie wird außerdem direkt in
der App im Administrationsbereich über den Link „Anleitung“ angezeigt
(`src/components/admin/HelpModal.svelte`).

