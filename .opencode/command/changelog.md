---
description: Erstellt einen neuen, datierten Eintrag in der CHANGELOG.md basierend auf den aktuellen Änderungen (oder einem übergebenen Kontext).
agent: changelog-writer
---

Erstelle einen neuen Changelog-Eintrag in `CHANGELOG.md` gemäß deinen
Anweisungen.

$ARGUMENTS

Falls oben kein Text steht: Ermittle die relevanten Änderungen selbst über
`git status` und `git diff` (unstaged und ggf. staged) im aktuellen
Arbeitsverzeichnis und fasse sie in einem neuen Eintrag zusammen. Falls oben
ein Text, eine Commit-Range oder eine Beschreibung übergeben wurde, nutze
diese als primäre Grundlage für den Eintrag statt (oder zusätzlich zu) dem
aktuellen Diff.
