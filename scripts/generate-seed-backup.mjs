#!/usr/bin/env node
/**
 * Erzeugt eine Backup-ZIP-Datei mit 1000 synthetischen Geräten (je 1-3
 * Prüfungen) im exakten Format, das die App beim Wiederherstellen eines
 * Backups erwartet (siehe src/lib/zipService.ts und src/lib/db.ts).
 *
 * Nutzung:
 *   node scripts/generate-seed-backup.mjs
 *   npm run seed
 *
 * Die erzeugte "seed-backup.zip" liegt danach im Projekt-Root und kann in
 * der App unter Administration -> "Backup wiederherstellen" importiert
 * werden. ACHTUNG: Das Wiederherstellen überschreibt alle vorhandenen
 * Daten vollständig - nur auf einer Test-/Entwicklungsinstanz verwenden.
 *
 * Enthält bewusst keine Bilder/PDFs (pictures/pdfs bleiben überall leer),
 * damit die ZIP klein bleibt und kein images/-Ordner nötig ist.
 */

import JSZip from 'jszip';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEVICE_COUNT = 1000;
const OUTPUT_FILENAME = 'seed-backup.zip';

// ── Zufalls-Helfer ──────────────────────────────────────────────────────

/** Einfacher, abhängigkeitsfreier Pseudo-Zufallszahlengenerator mit festem
 * Seed, damit die erzeugten Daten bei wiederholten Läufen reproduzierbar
 * sind (praktisch zum Debuggen/Vergleichen). */
function createRng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0xffffffff;
    };
}

const rng = createRng(42);

function pick(list) {
    return list[Math.floor(rng() * list.length)];
}

function pickWeighted(entries) {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = rng() * total;
    for (const [value, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return value;
    }
    return entries[entries.length - 1][0];
}

function randomInt(min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    const value = rng() * (max - min) + min;
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

// ── Stammdaten-Pools ────────────────────────────────────────────────────

const DEVICE_TYPES = [
    'Bohrmaschine', 'Winkelschleifer', 'Kaffeemaschine', 'Laptop-Netzteil',
    'Verlängerungskabel', 'Lötkolben', 'Staubsauger', 'Aktenvernichter',
    'Monitor', 'Drucker', 'Wasserkocher', 'Heizlüfter', 'Ladegerät',
    'Tischlampe', 'Multimeter', 'Kabeltrommel', 'Handkreissäge', 'Fön',
];

const MANUFACTURERS = [
    'Bosch', 'Makita', 'Metabo', 'Siemens', 'AEG', 'Fein', 'Hilti',
    'DeWalt', 'Einhell', 'Kärcher', 'Miele', 'Braun', 'Philips',
    'HP', 'Dell', 'Lenovo', 'Brennenstuhl', 'Gardena',
];

const MODEL_PREFIXES = ['GBH', 'HD', 'PS', 'X', 'Pro', 'Compact', 'Duo', 'Neo', 'Vario'];

const BUILDINGS = ['Hauptgebäude', 'Nebengebäude A', 'Nebengebäude B', 'Werkstatt', 'Lagerhalle', 'Verwaltung'];
const ROOMS = ['Raum 101', 'Raum 102', 'Werkbank 1', 'Werkbank 2', 'Lager', 'Büro', 'Empfang', 'Serverraum', 'Küche', 'Werkstatt 3'];
const LOCATION_NAMES = ['Standort Nord', 'Standort Süd', 'Zentrale', 'Außenlager'];

const PROTECTION_CLASSES = ['I', 'II', 'III', ''];
const PROTECTION_CLASS_WEIGHTS = [
    ['I', 40],
    ['II', 40],
    ['III', 10],
    ['', 10],
];

const INSPECTION_NAMES = ['2025-Q1', '2025-Q3', '2026-Q1'];

const RESULT_WEIGHTS = [
    ['passed', 80],
    ['failed', 12],
    ['no_result', 8],
];

const STATUS_WEIGHTS = [
    ['vorhanden', 88],
    ['defekt', 6],
    ['ausser_betrieb', 3],
    ['nicht_auffindbar', 3],
];

const DESCRIPTIONS = [
    '', '', '', '', // die meisten Prüfungen bleiben ohne Hinweis
    'Leichte Gehäuseschäden festgestellt.',
    'Kabel wies Abnutzung auf, wurde ausgetauscht.',
    'Keine Auffälligkeiten.',
    'Gerät wirkte stärker verschmutzt, gereinigt.',
];

// ── Messwert-Grenzwerte je Schutzklasse (siehe protectionClassMeasurementLimits) ──

function measurementsForProtectionClass(protectionClass, passed) {
    // Werte innerhalb (passed) bzw. leicht außerhalb (failed) der in
    // src/lib/models/Device.ts hinterlegten Grenzwerte je Schutzklasse.
    switch (protectionClass) {
        case 'I':
            return {
                protectiveConductorResistanceOhm: passed ? randomFloat(0.05, 0.3) : randomFloat(0.31, 1.5),
                isolationResistanceMohm: passed ? randomFloat(1, 500) : randomFloat(0.2, 0.99),
                substituteLeakageCurrentMa: passed ? randomFloat(0.1, 3.5) : randomFloat(3.6, 8),
                touchCurrentMa: passed ? randomFloat(0.01, 0.5) : randomFloat(0.51, 2),
            };
        case 'II':
            return {
                protectiveConductorResistanceOhm: 0,
                isolationResistanceMohm: passed ? randomFloat(2, 500) : randomFloat(0.2, 1.9),
                substituteLeakageCurrentMa: passed ? randomFloat(0.01, 0.5) : randomFloat(0.51, 2),
                touchCurrentMa: passed ? randomFloat(0.01, 0.5) : randomFloat(0.51, 2),
            };
        case 'III':
            return {
                protectiveConductorResistanceOhm: 0,
                isolationResistanceMohm: passed ? randomFloat(0.25, 100) : randomFloat(0.05, 0.24),
                substituteLeakageCurrentMa: 0,
                touchCurrentMa: 0,
            };
        default:
            return {
                protectiveConductorResistanceOhm: randomFloat(0.05, 1),
                isolationResistanceMohm: randomFloat(0.2, 500),
                substituteLeakageCurrentMa: randomFloat(0.01, 5),
                touchCurrentMa: randomFloat(0.01, 2),
            };
    }
}

// ── Erzeugung eines einzelnen Geräts ────────────────────────────────────

function isoDateForInspectionName(name) {
    const map = {
        '2025-Q1': '2025-02-15',
        '2025-Q3': '2025-08-20',
        '2026-Q1': '2026-02-10',
    };
    return map[name] ?? '2026-01-01';
}

function createInspection(protectionClass, inspectionName) {
    const overallResult = pickWeighted(RESULT_WEIGHTS);
    const status = pickWeighted(STATUS_WEIGHTS);
    const passed = overallResult === 'passed';
    const measurements = measurementsForProtectionClass(protectionClass, passed);

    return {
        ...measurements,
        visualTestResult: passed ? 'passed' : pickWeighted(RESULT_WEIGHTS),
        measurementTestResult: passed ? 'passed' : pickWeighted(RESULT_WEIGHTS),
        functionTestResult: passed ? 'passed' : pickWeighted(RESULT_WEIGHTS),
        overallResult,
        status,
        description: pick(DESCRIPTIONS),
        inspectionDate: isoDateForInspectionName(inspectionName),
        inspectionName,
        pictures: [],
        pdfs: [],
    };
}

function createDevice(index) {
    const protectionClass = pickWeighted(PROTECTION_CLASS_WEIGHTS);
    const inspectionCount = randomInt(1, 3);
    // Die letzten `inspectionCount` Prüfrunden verwenden, damit die
    // "aktuelle Prüfung" (letzte Runde) möglichst viele Geräte abdeckt.
    const usedNames = INSPECTION_NAMES.slice(-inspectionCount);

    const device = {
        type: pick(DEVICE_TYPES),
        manufacturer: pick(MANUFACTURERS),
        model: `${pick(MODEL_PREFIXES)}-${randomInt(100, 999)}`,
        serialNumber: `SN-${String(index).padStart(5, '0')}-${randomInt(1000, 9999)}`,
        protectionClass,
        ratedVoltage: pick([230, 400, 24, 12]),
        ratedPower: randomInt(50, 3000),
        inspection: true,
        deactivated: false,
        pictures: [],
        pdfs: [],
        inspections: usedNames.map((name) => createInspection(protectionClass, name)),
    };

    // Ausmusterung konsistent zur letzten Prüfung setzen, analog zur
    // App-Logik (Gerätezustand "außer Betrieb" -> deactivated = true).
    const lastInspection = device.inspections[device.inspections.length - 1];
    device.deactivated = lastInspection?.status === 'ausser_betrieb';

    const location = {
        locationName: pick(LOCATION_NAMES),
        building: pick(BUILDINGS),
        room: pick(ROOMS),
    };

    return { device, location };
}

// ── Hauptprogramm ────────────────────────────────────────────────────────

async function main() {
    const now = Date.now();
    const records = [];

    for (let i = 1; i <= DEVICE_COUNT; i++) {
        const { device, location } = createDevice(i);
        records.push({
            id: i,
            createdAt: now - randomInt(0, 1000 * 60 * 60 * 24 * 365),
            updatedAt: now,
            device,
            location,
        });
    }

    const meta = {
        id: 'singleton',
        pruefObjekt: 'Beispiel-Prüfobjekt (Seed-Daten)',
        namen: 'Max Mustermann',
        anschrift: 'Musterstraße 1',
        ort: '12345 Musterstadt',
        aktuellePruefung: INSPECTION_NAMES[INSPECTION_NAMES.length - 1],
    };

    const zip = new JSZip();
    zip.file('records.json', JSON.stringify({ records }, null, 2));
    zip.file('meta.json', JSON.stringify(meta, null, 2));

    const blob = await zip.generateAsync({ type: 'nodebuffer' });

    const outputPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '..',
        OUTPUT_FILENAME,
    );
    await writeFile(outputPath, blob);

    console.log(`Seed-Backup mit ${DEVICE_COUNT} Geräten erzeugt: ${outputPath}`);
    console.log('Import in der App unter Administration -> "Backup wiederherstellen".');
    console.log('ACHTUNG: Das Wiederherstellen überschreibt alle vorhandenen Daten vollständig.');
}

main().catch((err) => {
    console.error('Fehler beim Erzeugen des Seed-Backups:', err);
    process.exitCode = 1;
});
