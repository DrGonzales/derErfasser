# Release-Artifact Zip

## Kontext

Projekt: `derErfasser` (Svelte/Vite)
Build-Command: `npm run build` mit `BASE_PATH=/derErfasser/`
Bestehender Workflow: `.github/workflows/deploy-pages.yml`
Trigger: Tags `v*.*.*` auf `release` Branch oder `workflow_dispatch`

## Anforderung

Nach erfolgreichem Build des Release-Branches soll ein Zip-Archiv des `dist/` Ordners als Release-Artifact erstellt werden.

## Vorschlag

Neuen Job `release-artifact` zum bestehenden Workflow hinzufügen:

1. Läuft parallel zu `build` und `deploy`
2. Installiert Dependencies (`npm ci`)
3. Führt `npm run build` mit `BASE_PATH=/derErfasser/` aus
4. Zippt `dist/` Ordner zu `dist.zip`
5. Lädt Zip als GitHub Release Asset hoch

### Option A (empfohlen): GitHub Release Asset

- Nutzt `softprops/action-gh-release`
- `dist.zip` wird automatisch als Asset zum Tag verknüpft
- Verfügbar auf der Release-Seite

### Option B: Workflow Artifact

- Nutzt `actions/upload-artifact`
- Zip als Workflow-Artifact verfügbar
- Manuelles Herunterladen erforderlich

## Status

- [ ] Entscheidung: Option A oder B
- [ ] Workflow YAML aktualisieren
- [ ] Testen
