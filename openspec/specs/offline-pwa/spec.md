# Offline PWA Specification

## Purpose

Hält die Anwendung auch ohne Netzwerkverbindung vollständig nutzbar und installierbar. Prüfer arbeiten vor Ort, oft ohne Empfang; jede Funktion muss deshalb lokal aus dem installierten App-Stand kommen.

## Requirements

### Requirement: Vollständige Offline-Nutzung

Die Anwendung SHALL auch ohne Internetverbindung alle Funktionen bereitstellen, insbesondere Geräteerfassung, Prüfungen, Auswertungen, Berichte, Import, Export und Backup.

#### Scenario: Arbeiten ohne Empfang

- **WHEN** ein Prüfer die Anwendung ohne Netzwerkverbindung öffnet
- **THEN** kann er Geräte anlegen, Prüfungen speichern und einen Bericht erzeugen

### Requirement: Keine externen Laufzeit-Ressourcen

Die Anwendung SHALL zur Laufzeit keine Daten, Skripte, Schriften, Bilder oder anderen Ressourcen aus dem Internet laden und SHALL keine externen APIs, Cloud-Dienste, Telemetrie, Tracking oder Analytics verwenden.

#### Scenario: Start der Offline-App

- **WHEN** die Anwendung offline oder mit aktivierter Netzwerksperre startet
- **THEN** werden alle benötigten Ressourcen aus dem lokalen App-Stand geladen und es entstehen keine externen Anfragen

### Requirement: Installierbare Progressive Web App

Die Anwendung SHALL als Progressive Web App installierbar sein und nach der Installation wie eine eigenständige App starten.

#### Scenario: Installation auf einem Mobilgerät

- **WHEN** ein Nutzer die Anwendung über den Browser installiert
- **THEN** steht ein Startsymbol zur Verfügung und die App startet ohne Internetverbindung

### Requirement: Konsistente Auslieferung unter einem Unterordner

Die Anwendung SHALL bei GitHub Pages unter `/derErfasser/` vollständig funktionieren, einschließlich Assets, Manifest, Service Worker und navigierbarer Startseite.

#### Scenario: Produktions-Build für GitHub Pages

- **WHEN** der Build mit `BASE_PATH=/derErfasser/` erstellt und ausgeliefert wird
- **THEN** laden alle Ressourcen aus demselben Pfad und die Anwendung ist offline erreichbar
