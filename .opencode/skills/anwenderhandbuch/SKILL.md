---
name: anwenderhandbuch
description: >-
  Erstellt und pflegt das ANWENDERHANDBUCH.md dieses Projekts (derErfasser),
  inklusive Prozess-/Ablaufdiagrammen. Verwenden bei Aufgaben wie "Anwenderhandbuch
  erweitern", "Handbuch-Kapitel schreiben", "Diagramm ins Handbuch einbauen",
  "Prozessdiagramm erstellen" oder wenn ANWENDERHANDBUCH.md bzw.
  src/components/admin/HelpModal.svelte geändert werden sollen. Nicht verwenden
  für allgemeine Svelte-Komponentenarbeit ohne Bezug zum Handbuch, oder für
  das Editieren des CHANGELOG.md.
---

# Anwenderhandbuch-Skill

Dieser Skill bündelt das Wissen, um `ANWENDERHANDBUCH.md` korrekt zu erweitern
und darin **Mermaid-Diagramme** darzustellen – trotz der Einschränkung, dass
die App das Handbuch mit einem selbstgeschriebenen Mini-Markdown-Parser
rendert, der keine Mermaid-Codeblöcke ausführen kann.

## Kontext (wichtig vor jeder Änderung lesen)

- Das Handbuch liegt in `/ANWENDERHANDBUCH.md` (Projekt-Root) und wird von
  `src/components/admin/HelpModal.svelte` per Vite-`?raw`-Import geladen und
  mit einem eigenen, sehr einfachen Markdown-Renderer (`renderMarkdown()` in
  dieser Datei) in HTML umgewandelt.
- Der Mini-Parser unterstützt **nur**: Überschriften (`#`–`######`),
  Aufzählungslisten (`-`/`*`), Blockquotes (`>`), Fett-Text (`**text**`),
  Links `[Text](#anker)` (Anker wird entfernt, nur Text bleibt), Bilder
  `![Alt](pfad)` (siehe unten) sowie das Überspringen von Fenced-Codeblöcken
  (` ``` `). **Keine** Tabellen, keine nummerierten Listen, kein Inline-Code,
  keine echten Codeblöcke.
- Es gibt **keine** Mermaid-Runtime-Dependency im Projekt und es soll auch
  keine hinzugefügt werden (App bleibt schlank/offline-fähig). Mermaid-Syntax
  im rohen Markdown wird NICHT gerendert – Diagramme müssen deshalb als
  **vorgerenderte SVG-Datei** eingebunden werden.

## Workflow: Ein Diagramm ins Handbuch einbauen

1. **Mermaid-Quelle schreiben** (`.mmd`-Datei, z. B. in `/tmp/opencode/`).
   - Nur ASCII in Node-Labels verwenden oder auf Umlaute verzichten, falls es
     beim Rendern zu Encoding-Problemen kommt (in der Praxis funktionieren
     Umlaute mit mermaid-cli, im Zweifel aber ASCII-Fallback nutzen).

2. **SVG rendern** mit dem Helper-Skript dieses Skills:
   ```bash
   .opencode/skills/anwenderhandbuch/scripts/render-mermaid.sh <input.mmd> <output.svg>
   ```
   - Nutzt automatisch ein bereits vorhandenes Playwright-Chromium
     (`~/.cache/ms-playwright/chromium-*`), falls verfügbar, um den
     `mermaid-cli`-Download eines eigenen Chromium zu vermeiden. Andernfalls
     lädt `mermaid-cli` selbst ein Chromium herunter (dauert länger, braucht
     Internetzugriff).
   - Installiert `@mermaid-js/mermaid-cli` temporär in ein Scratch-Verzeichnis
     (nicht ins Projekt) und räumt danach nichts im Projekt an – **nach dem
     Lauf keine `node_modules`/`package.json` im Projekt oder in `/tmp`
     zurücklassen.**

3. **SVG-Datei ins Projekt kopieren** nach `src/assets/<sprechender-name>.svg`
   (Ordner ggf. anlegen, existiert bereits von früheren Diagrammen).

4. **In `HelpModal.svelte` registrieren**:
   - Import ergänzen: `import <name>Svg from "../../assets/<datei>.svg?url";`
   - Eintrag in `imagesByFilename` ergänzen: `"<datei>.svg": <name>Svg`

5. **Im Markdown referenzieren**: An der gewünschten Stelle in
   `ANWENDERHANDBUCH.md` eine normale Markdown-Bild-Zeile einfügen:
   ```markdown
   ![Kurze Bildbeschreibung](assets/<datei>.svg)
   ```
   Der Pfad selbst ist für den Mini-Parser irrelevant (er löst nur den
   Dateinamen über `imagesByFilename` auf) – trotzdem einen plausiblen
   relativen Pfad verwenden, damit das Markdown auch außerhalb der App (z. B.
   auf GitHub) sinnvoll aussieht.

6. **Verifizieren**:
   - `npm run build` (Vite muss das SVG als Asset bündeln, sichtbar als
     `dist/assets/<datei>-<hash>.svg` in der Build-Ausgabe)
   - `npm run check` (svelte-check muss fehlerfrei bleiben)
   - Bei Bedarf `svelte-autofixer`-Tool auf die geänderte `HelpModal.svelte`
     anwenden (bereits vorhandene `{@html}`-Warnung ist bekannt/unkritisch,
     da nur eigener, kontrollierter Markdown-Inhalt gerendert wird).

## Stil-Konventionen für Handbuch-Texte

- Zielgruppe: Endanwender der App, nicht Entwickler. Keine Code-Referenzen,
  keine Modellnamen (`Device.ts` etc.) im Handbuchtext.
- Sprache: Deutsch, Sie-/direkte Anweisungsform ("Klicken Sie auf...", oder
  wie im Bestand: neutral-beschreibend "In der Geräteliste unten rechts auf
  den... tippen").
- Neue Abschnitte immer auch im Inhaltsverzeichnis (`## Inhalt`, Zeilen ~7-18)
  verlinken, Ankerformat `#abschnitt-name-in-kleinbuchstaben-mit-bindestrichen`.
- Abschnittsreihenfolge ist ein logischer Ablauf (Erste Schritte → Geräte
  verwalten → Geräteliste → Prüfung durchführen → Prozessübersicht →
  Dashboard → PDF-Bericht → Backup → Daten löschen → Changelog → FAQ). Neue
  Abschnitte an der inhaltlich passenden Stelle einfügen, nicht ans Ende
  anhängen.
- Diagramme immer mit 1-2 erklärenden Sätzen einleiten und ggf. mit einer
  kurzen "Wichtig"-Liste für Sonderfälle ergänzen (siehe bestehender
  Abschnitt "Prozessübersicht: Abarbeitung und Prüfung" als Vorlage).

## Bekannte Grenzen / bewusste Entscheidungen

- Kein Mermaid-npm-Package im Projekt, kein Laufzeit-Rendering – Diagramme
  sind statische Bilder. Das ist beabsichtigt (Bundle-Größe, Offline-Robustheit).
- Der Mini-Markdown-Parser wird bewusst nicht durch eine vollwertige Library
  ersetzt (siehe Kommentar in `HelpModal.svelte`: "keine zusätzliche
  Bibliothek nötig"). Diesen Ansatz bei Änderungen respektieren, außer der
  Nutzer bittet explizit um eine größere Umstellung.
