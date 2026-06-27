# AGENTS.md

# Project Description

Diese Anwendung ist eine **Progressive Web App (PWA)** zur Erfassung, Verwaltung und Archivierung von Messdaten für **elektrische Sicherheitsprüfungen**.

Die Anwendung wird von Prüfern direkt vor Ort eingesetzt und muss daher auch ohne Internetverbindung zuverlässig funktionieren.

---

# Core Principles

* Die Anwendung muss **vollständig offline** funktionieren.
* Es dürfen **keine Daten, Skripte oder sonstige Ressourcen** während der Laufzeit aus dem Internet geladen werden.
* Alle Funktionen müssen auch ohne Netzwerkverbindung verfügbar sein.
* Datenschutz und Datensicherheit haben höchste Priorität.

---

# Features

* Erfassung von Messdaten
* Speicherung aller Daten in der **IndexedDB**
* Speicherung von:

  * JSON-Dokumenten
  * Bildern
* Import von Projekten über ZIP-Dateien
* Export von Projekten als ZIP-Dateien
* Arbeiten mit mehreren Projekten
* Vollständige Offline-Nutzung

---

# Technology Stack

* Node.js >= 14.x
* npm
* Svelte
* TypeScript
* IndexedDB
* Progressive Web App (PWA)

---

# Coding Guidelines

* Verwende ausschließlich TypeScript.
* Nutze moderne ES-Module.
* Schreibe möglichst kleine und gut lesbare Komponenten.
* Vermeide unnötige externe Bibliotheken.
* Neue Abhängigkeiten dürfen nur eingeführt werden, wenn sie einen deutlichen Mehrwert bieten.
* Bestehenden Code möglichst erweitern statt neu schreiben.
* Vorhandene Namenskonventionen beibehalten.
* Änderungen sollen möglichst klein und nachvollziehbar sein.

---

# Offline Requirements

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

---

# Data Storage

Alle Daten werden lokal in der IndexedDB gespeichert.

Die Datenbank enthält unter anderem:

* Projekte
* Messdaten
* JSON-Dokumente
* Bilder
* Einstellungen

Es dürfen keine Benutzerdaten auf externe Server übertragen werden.

---

# Import / Export

Der Datenaustausch erfolgt ausschließlich über ZIP-Dateien.

Agenten sollen darauf achten, dass:

* bestehende Exportformate kompatibel bleiben
* Importfunktionen möglichst fehlertolerant arbeiten
* Datenintegrität gewährleistet ist

---

# Performance

Beim Arbeiten mit vielen Messungen oder Bildern soll die Anwendung flüssig bleiben.

Beim Implementieren neuer Funktionen ist darauf zu achten:

* unnötige Speicherbelegung vermeiden
* Bilder nur bei Bedarf laden
* große Datenmengen effizient verarbeiten
* unnötige Neuberechnungen vermeiden

---

# Error Handling

* Fehler verständlich protokollieren.
* Keine stillschweigenden Fehler.
* Benutzern verständliche Fehlermeldungen anzeigen.
* Datenverlust vermeiden.

---

# User Interface

* Die Oberfläche soll einfach und übersichtlich bleiben.
* Mobile Geräte und Tablets haben Priorität.
* Große Schaltflächen für Touch-Bedienung.
* Gute Lesbarkeit.
* Dunkles und helles Design unterstützen.

---

# Testing

Neue Funktionen sollten nach Möglichkeit getestet werden.

Besonders wichtig sind:

* IndexedDB
* Import
* Export
* Offline-Betrieb
* Bildspeicherung
* Datenmigration

---

# Project Structure

Der Ordner `Plan` dient ausschließlich der Planung und Dokumentation.

**Agenten dürfen diesen Ordner weder lesen noch verändern.**

Er gehört nicht zum eigentlichen Quellcode.

---

# Agent Instructions

Beim Arbeiten an diesem Projekt gilt:

1. Änderungen möglichst klein halten.
2. Bestehende Architektur respektieren.
3. Keine unnötigen Refactorings durchführen.
4. Keine Dateien ohne Grund umbenennen.
5. Kommentare nur hinzufügen, wenn sie echten Mehrwert bieten.
6. Keine Lizenztexte entfernen.
7. Keine sensiblen Daten speichern.
8. Keine Online-Dienste integrieren.
9. Die Offline-Fähigkeit darf niemals beeinträchtigt werden.
10. Im Zweifel Stabilität gegenüber neuen Features bevorzugen.

---

# Goal

Das Ziel ist eine robuste, schnelle und vollständig offline nutzbare Anwendung zur Dokumentation elektrischer Sicherheitsprüfungen mit langfristig wartbarem Quellcode.
