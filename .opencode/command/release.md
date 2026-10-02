---
description: Erstellt einen Release - prüft Vorbedingungen, gleicht den release-Branch mit main ab, aktualisiert Changelog und Anwenderhandbuch, committet, taggt und pusht auf main, release und origin. Argument optional Version (z.B. v2.0.0).
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

## 2. release-Branch in main übernehmen

`origin/release` enthält den zuletzt veröffentlichten Stand und ist
erfahrungsgemäß nicht in `main` enthalten. Ohne diesen Abgleich kann der
Fast-Forward-Push in Schritt 8 scheitern, weil `release` dann Commits enthält,
die in `main` fehlen.

Führe daher zuerst `git fetch origin --quiet` aus und prüfe den Zustand:

- `git rev-list origin/release..HEAD --count` liefert `0`: `origin/release` ist
  vollständig in `main` enthalten, nichts zu tun.
- Der Wert ist größer als `0`: `origin/release` ist Commits voraus. Merge ihn
  mit `git merge --no-ff origin/release -m "Merge release into main"` in `main`.
  Der Merge-Commit wandert später mit dem Push in Schritt 8 auf `main` und
  `release`.
- Merge schlägt fehl oder es gibt Konflikte: **nicht** selbst auflösen. Merge
  mit `git merge --abort` zurücknehmen, abbrechen und den Konflikt dem Nutzer
  melden.

Anschließend `npm run check`, `npm test` und `npm run build` ausführen. Schlägt
einer der drei Schritte fehl, abbrechen und den Fehler melden.

## 3. Version ermitteln

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

### 3a. Version in package.json übernehmen

- Lese das aktuelle `version`-Feld aus der `package.json` im Projektroot.
- Vergleiche es semantisch (major.minor.patch) mit `<version>` (ohne
  führendes `v`). Ist die übergebene/ermittelte Version **kleiner** als die
  aktuelle `package.json`-Version: abbrechen mit Hinweis auf möglichen
  Versions-/Tag-Fehler (Downgrade-Schutz, kein automatisches Zurücksetzen).
- Ist sie **größer**: aktualisiere das `version`-Feld in `package.json` auf
  den neuen Wert (ohne `v`-Präfix). Diese Änderung wird noch nicht separat
  committet, sondern zusammen mit den Doku-Änderungen in Schritt 6
  committet.
- Ist sie **gleich**: keine Änderung an `package.json` nötig (No-op).
- Prüfe zusätzlich, ob der Tag `<version>` schon existiert
  (`git tag --list <version>`). Existiert er bereits, abbrechen mit Hinweis,
  dass diese Version bereits released wurde.
- `package-lock.json` wird dabei bewusst **nicht** angefasst.

## 4. Änderungsumfang für die Doku ermitteln

Ermittle den relevanten Änderungsumfang seit dem letzten bestehenden Tag bis
`HEAD`, z. B. über `git describe --tags --abbrev=0` (letzter Tag) und
anschließend `git log <letzter-tag>..HEAD` bzw. `git diff <letzter-tag>..HEAD`.
Gibt es noch keinen vorherigen Tag, nutze die gesamte Historie bzw. den
aktuellen main-Stand als Grundlage. Dieser Kontext wird identisch an beide
folgenden Subagenten weitergereicht.

## 5. Dokumentation aktualisieren

Rufe über das Task-Tool **beide** folgenden Subagenten mit demselben, in
Schritt 4 ermittelten Kontext auf:

1. `changelog-writer` — erstellt einen neuen Eintrag in `CHANGELOG.md`.
2. `anwenderhandbuch` — aktualisiert `ANWENDERHANDBUCH.md` passend zu den
   Änderungen.

Prüfe anschließend mit `git status --porcelain`, dass beide Agenten tatsächlich
Dateien geändert haben. Hat ein Agent nichts geändert, hole die Änderung selbst
nach — ein Release ohne Doku-Änderung ist ein Fehler.

## 6. Commit

Committe die Versions- und Doku-Änderungen (`package.json` falls in Schritt
3a aktualisiert, `CHANGELOG.md`, `ANWENDERHANDBUCH.md` und ggf. neu
referenzierte Bilder) mit einer passenden Commit-Message, z. B.
`Release <version>: Version & Dokumentation`.

## 7. Tag setzen

Setze den Tag `<version>` auf den aktuellen HEAD (nach dem Doku-Commit):
`git tag <version>`.

## 8. Push

Pushe in dieser Reihenfolge und breche bei jedem Fehler sofort ab:

- `main` nachziehen: `git push origin main`. Nur Fast-Forward, **kein**
  Force-Push.
- `release`-Branch per Fast-Forward aktualisieren:
  `git push origin main:release`. Schlägt dies fehl (z. B. weil `release`
  divergiert ist), abbrechen mit Fehlermeldung — **kein** Force-Push.
- Tag pushen: `git push origin <version>`. Erst dieser Push löst den
  GitHub-Actions-Workflow aus, der GitHub Pages deployed und das Release-ZIP
  erzeugt.

Danach mit `git rev-parse HEAD origin/main origin/release <version>` prüfen, ob
alle vier Referenzen denselben Commit-Zeiger haben, und das Ergebnis in der
Zusammenfassung ausweisen.

## 9. Zusammenfassung

Fasse am Ende kurz zusammen: verwendete Version, ob `package.json` aktualisiert
wurde (und von welcher auf welche Version), ob ein Merge von `release` nach
`main` nötig war, welcher Changelog-Eintrag und welcher Handbuch-Abschnitt
hinzugefügt/geändert wurden sowie dass Commit, Tag und die Pushes auf `main`
und `release` erfolgreich waren.
