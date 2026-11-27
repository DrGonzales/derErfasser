# AGENTS.md

## Project Description

**derErfasser** ist eine **Progressive Web App (PWA)** zur Erfassung, Verwaltung und Archivierung von Prüfdaten für **ortsveränderliche elektrische Geräte** (elektrische Sicherheitsprüfungen).

Die Anwendung wird von Prüfern direkt vor Ort eingesetzt und muss daher auch ohne Internetverbindung zuverlässig funktionieren.

## Core Principles

* Die Anwendung muss **vollständig offline** funktionieren.
* Es dürfen **keine Daten, Skripte oder sonstigen Ressourcen** während der Laufzeit aus dem Internet geladen werden.
* Alle Funktionen müssen auch ohne Netzwerkverbindung verfügbar sein.
* Datenschutz und Datensicherheit haben höchste Priorität; alle Daten bleiben ausschließlich lokal auf dem Gerät des Nutzers.

## Spezifikationen und Änderungen mit OpenSpec

OpenSpec ist die verbindliche Grundlage für **Planung und Umsetzung**. Jede Änderung an beobachtbarem Verhalten — auch kleine Features und Bugfixes mit Verhaltenswirkung — beginnt mit einem Change. Ohne Change wird kein Code geändert; ausgenommen sind Änderungen ohne Verhaltenswirkung wie Formatierung, Kommentare, Tippfehler und reine Dokumentationspflege.

| Schritt | Befehl / Skill | Ergebnis |
| --- | --- | --- |
| Klären (nur bei unklarer Aufgabe) | `/openspec-explore "<Frage>"` | Analyse ohne Artefakte |
| Planen | `/openspec-propose "<Idee>"` | `openspec/changes/<name>/` mit `proposal.md`, Delta-Specs, `design.md`, `tasks.md` |
| Validieren | `npx @fission-ai/openspec@latest validate --all --strict --no-color` | gültige Artefakte vor der Umsetzung |
| Umsetzen | `/openspec-apply-change` | Code-Änderungen, abgehakte Tasks |
| Verifizieren | `npm test` und `npm run check` | grüne Tests und Typprüfung |
| Abschließen | `/openspec-archive-change` | Delta in `openspec/specs/` übernehmen, Change archivieren |

Regeln:

* `openspec/config.yaml` steuert Schema, Kontext und Regeln; es wird nur bewusst geändert.
* `openspec/specs/<capability>/spec.md` beschreibt das gültige Verhalten und wird **nicht direkt** bearbeitet. Änderungen fließen aus einem Change über `/openspec-sync-specs` oder das Archivieren ein.
* Anforderungen verwenden `SHALL`/`MUST` und mindestens ein Szenario mit `WHEN`/`THEN`. Beschrieben wird nur beobachtbares Verhalten, keine Datei-, Klassen- oder Funktionsnamen.
* Delta-Specs gehören in den Change (`ADDED`, `MODIFIED`, `REMOVED`, `RENAMED Requirements`); neue Capabilities als kebab-case-Pfad, bestehende Pfade werden nicht umbenannt.
* Tasks als Checkboxen `- [ ] X.Y ...`; bei Code-Änderungen sind `npm test` und `npm run check` als Verifikation eingeplant.
* Die Skills liegen in `.agents/skills/`. Die CLI ist nicht global installiert, daher immer `npx @fission-ai/openspec@latest ...` (benötigt Node >= 22.20.0, nur für OpenSpec).
* Planung und Änderungsdokumentation erfolgen ausschließlich in `openspec/changes/`. Ein etwaiger Ordner `Plan/` ist kein Quellcode und wird von Agenten weder gelesen noch verändert.
* Nach Abschluss die Nutzerdokumentation über `/docu` aktualisieren und die Commit-Nachricht über den Subagenten `conventional-commit` ermitteln.

## Features

* Umsetzung als PWA (installierbar, offline-fähig)
* Verwaltung ortsveränderlicher Geräte: Stammdaten, Schutzklasse, Nennspannung/-leistung, Standort
* Prüfungen mit Messwerten und Grenzwert-Hinweisen je Schutzklasse
* Automatische Ausmusterung über den Gerätezustand „Außer Betrieb"
* Gerät klonen für baugleiche Geräte
* Dashboard mit Kennzahlen sowie PDF-Berichte
* Excel-Import (mit Spaltenzuordnung) und Excel-Export der Geräteliste
* Backup als ZIP-Datei:
  * Restore (überschreibt den kompletten Datenbestand)
  * additives Zusammenführen eines Backups in den bestehenden Datenstand
* Barcode-Scan für Seriennummern (Kamera)
* Bilder und PDF-Anhänge pro Gerät und Prüfung
* Eingabe-Vorschläge für Standorte und Prüfungsnamen
* Admin-Bereich: Prüfobjekt-Daten (Meta), Backup wiederherstellen/zusammenführen, Excel-Import/-Export, Daten löschen

## Technology Stack

* Node.js >= 20 (LTS)
* Svelte 5 mit **Runes** (`$state`, `$derived`, `$props`, `$effect`)
* TypeScript
* Vite
* IndexedDB
* PWA via `vite-plugin-pwa`
* JSZip (Backup-ZIP), SheetJS `xlsx` (Excel), jsPDF (Berichte), `@zxing/browser` (Barcode)
* Vitest (Tests), svelte-check (Typisierung)
* OpenSpec 2.2.0 (Spec-Driven Development, via `npx`)

## Coding Guidelines

* Verwende ausschließlich TypeScript.
* Nutze moderne ES-Module.
* Schreibe möglichst kleine und gut lesbare Komponenten.
* Vermeide unnötige externe Bibliotheken.
* Neue Abhängigkeiten dürfen nur eingeführt werden, wenn sie einen deutlichen Mehrwert bieten.
* Bestehenden Code möglichst erweitern statt neu schreiben.
* Vorhandene Namenskonventionen beibehalten.
* Änderungen sollen möglichst klein und nachvollziehbar sein.
* Nutze Svelte-5-Best-Practices:
  * Runes verwenden (`$state`, `$derived`, `$props`), keine Legacy-Reaktivität (`export let`, `$:`)
  * `onclick={...}` statt `on:click={...}`
  * Keyed Each-Blöcke (`{#each ... as item (item.id)}`)
  * Keine UI-Frameworks, natives HTML und CSS
* Fachlogik gehört in Services unter `src/lib/` (Muster: `zipService`, `importService`, `backupMergeService`), nicht in Komponenten.
* Schwere Bibliotheken (JSZip, SheetJS, jsPDF) werden bewusst erst bei Bedarf dynamisch nachgeladen (`await import(...)`), um das initiale Bundle schlank zu halten.

## Offline Requirements

Die Offline-Fähigkeit ist ein Kernbestandteil der Anwendung.

Agenten dürfen keine Funktionen implementieren, die eine Internetverbindung voraussetzen.

Insbesondere sind folgende Punkte nicht zulässig:

* CDN-Abhängigkeiten
* externe APIs
* Cloud-Datenbanken
* Telemetrie
* Tracking
* Analytics
* externe Schriftarten
* externe Bilder
* externe JavaScript-Dateien

Alle benötigten Ressourcen müssen lokal Bestandteil des Projekts sein.

## Data Storage

Alle Daten werden lokal in der IndexedDB gespeichert (Datenbank `der-erfasser-db`) mit drei Object Stores:

* `records` – Geräte-Datensätze `{ id, createdAt, updatedAt, device, location?, metadata? }`; `id` ist eine UUID (ältere Installationen können noch numerische Auto-Increment-Ids haben, beide Formen bleiben gültig)
* `images` – Bilder und PDFs als Blobs (`StoredImage`), referenziert per Id aus `device.pictures/pdfs` bzw. `inspection.pictures/pdfs`
* `meta` – Prüfobjekt-Daten als Singleton (`id: "singleton"`)

Zugriff ausschließlich über den DB-Layer `src/lib/db.ts`. Domänen-Modelle (Device, Location, Inspection, Meta, …) liegen unter `src/lib/models/`.

Es dürfen keine Benutzerdaten auf externe Server übertragen werden.

## Import / Export

Der Datenaustausch erfolgt über ZIP-Backups und Excel-Dateien.

* Backup-ZIP-Aufbau: `records.json`, optional `meta.json`, Ordner `images/` mit Anhängen (`{id}.{ext}`).
* **Restore** überschreibt den kompletten Datenbestand.
* **Backup zusammenführen** ist additiv: Voraussetzung sind identische Meta-Daten auf beiden Seiten; Geräte werden anhand ihrer Record-Id zugeordnet, Inspectionen anhand ihres Prüfungsnamens (Details siehe `docs/specs/backup-zusammenfuehren.md`).
* Excel-Import mit interaktiver Spaltenzuordnung; Export enthält die Geräteliste ohne Bilder/PDFs.
* Bestehende Exportformate kompatibel halten; Importfunktionen fehlertolerant umsetzen; Datenintegrität gewährleisten.

## Testing

Tests laufen mit Vitest (`npm test`), Typisierung mit svelte-check (`npm run check`). Beide Befehle müssen nach Änderungen grün sein.

* Service-Logik wird mit Unit-Tests abgedeckt; das `./db`-Modul wird dabei per `vi.mock` gemockt (Muster: `src/lib/importService.test.ts`, `src/lib/backupMergeService.test.ts`).
* `fake-indexeddb` ist für DB-nahe Tests verfügbar.
* Besonders wichtig sind: IndexedDB-Zugriff, Backup-Restore/Zusammenführen, Excel-Import/-Export, Bild-/PDF-Speicherung, Modell-Konstruktoren.

## Project Structure

```
src/
├── lib/            Fachlogik: db.ts, Services, models/, stores/
├── components/
│   ├── mobiles/    Fachmodul Geräte-Erfassung und -Prüfung
│   ├── dashboard/  Kennzahlen
│   ├── admin/      Administration (Meta, Backup, Import/Export)
│   └── shared/     modulübergreifende Bausteine (Modal, Button, …)
docs/
└── specs/          technische Detaildokumentation je Feature
openspec/
├── config.yaml     Schema, Kontext und Regeln
├── specs/          gültiges Verhalten als OpenSpec-Anforderungen
└── changes/        laufende Changes mit Proposal, Delta-Specs, Design und Tasks
```

## Komponenten-Struktur

`src/components/` ist in fachliche Module gegliedert (ein Ordner pro Modul,
flach, kein Barrel-Export):

* `mobiles/` – Erfassung und Prüfung ortsveränderlicher Geräte
  (Einträge-Liste, Gerät, Inspektionen).
* `dashboard/` und `admin/` stehen den Fach-Modulen übergeordnet (eigene
  Navigationsebene, kein Bestandteil eines Fach-Moduls).
* `images/`, `icons/`, `shared/`, `charts/` sind modulübergreifend nutzbare,
  generische Bausteine ohne Fachlogik (z. B. Bild-/PDF-Upload und -Anzeige).

Neue Fach-Module (z. B. für RCD-Prüfungen) folgen demselben Muster: ein
flacher Ordner unter `src/components/`, benannt nach der fachlichen Domäne,
ohne Barrel-Export. Generische Bausteine (`images/`, `icons/`, `shared/`)
werden von mehreren Fach-Modulen gemeinsam genutzt statt dupliziert.

Größere Funktionsbereiche werden als eigene Ansichtskomponente gekapselt
(Muster: `admin/BackupMerge.svelte` wird aus der Administration über einen
Button geöffnet) statt sie in bestehende Seiten einzubetten.

## Dokumentation

* `openspec/specs/*.md` – verbindliche Verhaltensspezifikation; Änderungen laufen über Changes.
* `docs/specs/*.md` – technische Detaildokumentation je Feature (ein Dokument pro
  Feature, Muster: `geraet-klonen.md`, `backup-zusammenfuehren.md`,
  `ausmusterung.md`). Kopf mit Status/Stand/betroffenen Komponenten, danach
  Zweck, Regeln, Sonderfälle und Fehlerverhalten. Definiertes Verhalten wird
  explizit als solches dokumentiert. Bei Abweichungen gilt OpenSpec; die
  Detaildokumente bleiben erhalten.
* `ANWENDERHANDBUCH.md` – nutzerorientierte Anleitung (kein technischer Inhalt).
* `CHANGELOG.md` – pflegt der Subagent `changelog-writer` über `/docu` (siehe unten).

## User Interface

* Die Oberfläche soll einfach und übersichtlich bleiben.
* Mobile Geräte und Tablets haben Priorität.
* Große Schaltflächen für Touch-Bedienung.
* Gute Lesbarkeit.
* Dunkles und helles Design unterstützen.

## Error Handling

* Fehler verständlich protokollieren.
* Keine stillschweigenden Fehler.
* Benutzern verständliche Fehlermeldungen anzeigen (deutsch).
* Datenverlust vermeiden — schreibende Operationen nur nach erfolgreicher Validierung (Beispiel: Backup-Zusammenführung bricht beim Meta-Abgleich ab, bevor etwas geschrieben wird).

## Performance

Beim Arbeiten mit vielen Messungen oder Bildern soll die Anwendung flüssig bleiben.

Beim Implementieren neuer Funktionen ist darauf zu achten:

* unnötige Speicherbelegung vermeiden
* Bilder/Blobs nur bei Bedarf laden
* große Datenmengen effizient verarbeiten (bei langen Schleifen den Hauptthread periodisch freigeben, Muster: `zipService.ts`)
* unnötige Neuberechnungen vermeiden

## Agent Instructions

Beim Arbeiten an diesem Projekt gilt:

1. Jede Verhaltensänderung über OpenSpec planen und umsetzen; Main Specs nicht direkt bearbeiten.
2. Änderungen möglichst klein halten.
3. Bestehende Architektur respektieren.
4. Keine unnötigen Refactorings durchführen.
5. Keine Dateien ohne Grund umbenennen.
6. Kommentare nur hinzufügen, wenn sie echten Mehrwert bieten.
7. Keine Lizenztexte entfernen.
8. Keine sensiblen Daten speichern.
9. Keine Online-Dienste integrieren.
10. Die Offline-Fähigkeit darf niemals beeinträchtigt werden.
11. Nach Änderungen `npm test`, `npm run check` und die OpenSpec-Validierung ausführen.
12. Im Zweifel Stabilität gegenüber neuen Features bevorzugen.

## Changelog Pflege

Im Projektroot existiert eine `CHANGELOG.md`.

Die Pflege erfolgt gemeinsam mit dem Anwenderhandbuch über den Befehl **`/docu`** (`.opencode/command/docu.md`). Er ruft die Subagenten **`changelog-writer`** (`.opencode/agents/changelog-writer.md`) und **`anwenderhandbuch`** (`.opencode/agents/anwenderhandbuch.md`) nacheinander auf — nicht automatisch bei jeder Änderung.

Format eines Eintrags (neuester Eintrag immer **oben**, direkt nach der Einleitung der Datei):

```
## DD.MM.YYYY - Kurze Zusammenfassung

Ein bis wenige Fließtext-Sätze, keine Bulletpoints.
```

Beispiel: `## 20.01.2022 - Anpassung des Farbschema.`

Dabei gilt:

* Einträge werden in **einfacher, umgangssprachlicher deutscher Sprache**
  formuliert — verständlich für Nutzer ohne technischen Hintergrund, keine
  Code- oder Dateireferenzen, keine Bulletpoints.
* Rein interne/technische Änderungen ohne erkennbare Auswirkung für den
  Nutzer (z. B. reines Refactoring, Formatierung, Kommentare) werden nicht
  im Changelog erwähnt.
* Bestehende Einträge werden nie überschrieben oder verändert, nur ein neuer
  Eintrag oben ergänzt.
* Die Datei bleibt Teil des normalen Commits der jeweiligen Änderung.

## Commit-Nachrichten

Commit-Nachrichten in diesem Projekt folgen dem
**Conventional-Commits-Schema** mit deutschem Text:

```
type(scope): kurzer deutscher Text

Optionaler Body mit fachlicher Beschreibung.
```

Übliche Types: `feat`, `fix`, `refactor`, `docs`, `test`, `style`, `perf`,
`build`, `ci`, `chore`. Der `scope` ist optional und benennt das betroffene
Modul (z. B. `admin`, `mobiles`, `dashboard`, `db`, `import`, `backup`).

Die Formulierung der Commit-Message erfolgt über den spezialisierten
Subagenten **`conventional-commit`**
(`.opencode/agents/conventional-commit.md`), der per Task-Aufruf ausgelöst
wird. Der Agent ermittelt Type/Scope/Text aus dem Änderungsumfang (Diff)
und gibt ausschließlich den fertigen Message-Text zurück — er führt selbst
keinen `git commit` aus, das Committen bleibt dem aufrufenden Kontext
vorbehalten.

## Goal

Das Ziel ist eine robuste, schnelle und vollständig offline nutzbare Anwendung zur Dokumentation elektrischer Sicherheitsprüfungen mit langfristig wartbarem Quellcode.
