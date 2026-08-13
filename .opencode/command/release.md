---
description: Erstellt einen Release - prüft Vorbedingungen, aktualisiert Changelog und Anwenderhandbuch, committet, taggt und pusht auf release. Argument optional Version (z.B. v2.0.0).
---

Führe einen Release durch. Gehe die folgenden Schritte **strikt in dieser
Reihenfolge** durch und brich bei jedem Fehler sofort ab, ohne die
nachfolgenden Schritte auszuführen. Melde bei einem Abbruch klar den Grund.

## 1. Vorbedingungen prüfen

Prüfe per Bash:

- Aktueller Branch ist `main` (`git branch --show-current`). Falls nicht:
  abbrechen mit Hinweis, dass Release nur von `main` aus möglich ist.
- Working tree ist sauber, keine uncommitted Änderungen (`git status --porcelain`
  muss leer sein). Falls nicht: abbrechen mit Hinweis auf uncommitted Änderungen.
- Lokaler `main` ist nicht ahead von `origin/main`, d. h. es gibt keine
  ungepushten Commits (z. B. `git fetch origin --quiet` gefolgt von
  `git rev-list origin/main..HEAD --count`, muss `0` sein). Falls nicht:
  abbrechen mit Hinweis auf ungepushte Commits auf main.

Nur wenn alle drei Bedingungen erfüllt sind, mit Schritt 2 fortfahren.

## 2. Version ermitteln

$ARGUMENTS

- Falls oben eine Version übergeben wurde: validiere sie strikt gegen das
  Muster `v<major>.<minor>.<patch>` (z. B. `v2.0.0`), also `^v\d+\.\d+\.\d+$`.
  Passt sie nicht, abbrechen mit Hinweis auf das erwartete Format.
- Falls oben keine Version übergeben wurde: ermittle die Version über das
  Task-Tool mit dem `explore`-Agenten. Der Agent soll das `version`-Feld aus
  der `package.json` im Projektroot lesen und zurückmelden. Bilde daraus den
  Tag-Namen als `v` + dieser Wert (z. B. `2.0.0` → `v2.0.0`).

Merke dir die final ermittelte Version als `<version>` für die folgenden
Schritte.

### 2a. Version in package.json übernehmen

- Lese das aktuelle `version`-Feld aus der `package.json` im Projektroot.
- Vergleiche es semantisch (major.minor.patch) mit `<version>` (ohne
  führendes `v`). Ist die übergebene/ermittelte Version **kleiner** als die
  aktuelle `package.json`-Version: abbrechen mit Hinweis auf möglichen
  Versions-/Tag-Fehler (Downgrade-Schutz, kein automatisches Zurücksetzen).
- Ist sie **größer**: aktualisiere das `version`-Feld in `package.json` auf
  den neuen Wert (ohne `v`-Präfix). Diese Änderung wird noch nicht separat
  committet, sondern zusammen mit den Doku-Änderungen in Schritt 5
  committet.
- Ist sie **gleich**: keine Änderung an `package.json` nötig (No-op).
- `package-lock.json` wird dabei bewusst **nicht** angefasst.

## 3. Änderungsumfang für die Doku ermitteln

Ermittle den relevanten Änderungsumfang seit dem letzten bestehenden Tag bis
`HEAD`, z. B. über `git describe --tags --abbrev=0` (letzter Tag) und
anschließend `git log <letzter-tag>..HEAD` bzw. `git diff <letzter-tag>..HEAD`.
Gibt es noch keinen vorherigen Tag, nutze die gesamte Historie bzw. den
aktuellen main-Stand als Grundlage. Dieser Kontext wird identisch an beide
folgenden Subagenten weitergereicht.

## 4. Dokumentation aktualisieren

Rufe über das Task-Tool **beide** folgenden Subagenten mit demselben, in
Schritt 3 ermittelten Kontext auf:

1. `changelog-writer` — erstellt einen neuen Eintrag in `CHANGELOG.md`.
2. `anwenderhandbuch` — aktualisiert `ANWENDERHANDBUCH.md` passend zu den
   Änderungen.

## 5. Commit

Committe die Versions- und Doku-Änderungen (`package.json` falls in Schritt
2a aktualisiert, `CHANGELOG.md`, `ANWENDERHANDBUCH.md` und ggf. neu
referenzierte Bilder) mit einer passenden Commit-Message, z. B.
`Release <version>: Version & Dokumentation`.

## 6. Tag setzen

Setze den Tag `<version>` auf den aktuellen HEAD (nach dem Doku-Commit):
`git tag <version>`.

## 7. Push

- Aktualisiere den `release`-Branch per Fast-Forward:
  `git push origin main:release`. Schlägt dies fehl (z. B. weil `release`
  divergiert ist), abbrechen mit Fehlermeldung — **kein** Force-Push.
- Push den Tag: `git push origin <version>`.

Ein separater Push von `main` selbst erfolgt **nicht**.

## 8. Zusammenfassung

Fasse am Ende kurz zusammen: verwendete Version, ob `package.json` aktualisiert
wurde (und von welcher auf welche Version), welcher Changelog-Eintrag und
welcher Handbuch-Abschnitt hinzugefügt/geändert wurden, sowie dass Commit,
Tag und Push auf `release` erfolgreich waren.
