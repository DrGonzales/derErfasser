---
description: Aktualisiert CHANGELOG.md und ANWENDERHANDBUCH.md gemeinsam für die aktuellen Änderungen (oder einen übergebenen Kontext).
---

Aktualisiere die Projektdokumentation für die zuletzt gemachten Änderungen.
Dazu müssen **beide** folgenden Subagenten per Task-Tool aufgerufen werden:

1. `changelog-writer` — erstellt einen neuen Eintrag in `CHANGELOG.md`.
2. `anwenderhandbuch` — aktualisiert `ANWENDERHANDBUCH.md` passend zu den
   Änderungen.

$ARGUMENTS

Falls oben ein Text, eine Commit-Range oder eine Beschreibung übergeben
wurde, reiche genau diesen Kontext **unverändert und identisch** an beide
Subagenten weiter, damit beide von derselben Grundlage ausgehen.

Falls oben kein Text steht: Ermittle den relevanten Änderungsumfang einmal
selbst (z. B. über `git status` und `git diff`, unstaged und ggf. staged,
oder delegiere dies über das Task-Tool an den `explore`-Agenten) und gib
diesen ermittelten Kontext dann **identisch** an beide Subagenten weiter,
damit nicht jeder Subagent den Diff separat und ggf. inkonsistent ermittelt.

Rufe zuerst `changelog-writer`, danach `anwenderhandbuch` auf. Fasse am Ende
kurz zusammen, welcher Changelog-Eintrag hinzugefügt und welcher
Handbuch-Abschnitt neu angelegt oder geändert wurde (oder ob einer der beiden
Schritte übersprungen wurde, weil keine nutzerrelevante Änderung vorlag).
