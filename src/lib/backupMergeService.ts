import {
    getRecords,
    getMeta,
    getImage,
    updateRecord,
    importRecord,
    importImage,
    type StoredImage,
    type Meta,
} from "./db";
import { loadIndexedDBBackupZip } from "./zipService";
import { Device, Location, Inspection, DeviceStatus } from "./models";

/** Zusammenfassende Geräteangabe für den Ergebnisbericht. */
export type DeviceSummary = {
    recordId: number | string;
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
};

/** Inspection mit zugehörigem Gerät für den Ergebnisbericht. */
export type InspectionSummary = DeviceSummary & {
    inspectionName: string;
    inspectionDate: string;
};

export type MergeResult = {
    /** Komplett neu eingefügte Geräte (inkl. ihrer Inspectionen/Anhänge). */
    insertedDevices: DeviceSummary[];
    /** In bestehende Geräte übernommene Inspectionen. */
    mergedInspections: InspectionSummary[];
    /**
     * Nicht übernommene Inspectionen, weil im Zielgerät bereits eine
     * Inspection mit demselben inspectionName existiert.
     */
    skippedInspections: InspectionSummary[];
};

/**
 * Vergleicht zwei Meta-Datensätze inhaltlich über alle Felder (ohne id).
 * Bewusst feldweise statt per JSON-Vergleich, damit abweichende
 * Schlüsselreihenfolgen aus fremden Backups nicht als Unterschied gelten.
 */
function metaEquals(a: Meta, b: Meta): boolean {
    return (
        a.pruefObjekt === b.pruefObjekt &&
        a.namen === b.namen &&
        a.anschrift === b.anschrift &&
        a.ort === b.ort &&
        a.aktuellePruefung === b.aktuellePruefung &&
        a.auditor.name === b.auditor.name &&
        a.auditor.anschrift === b.auditor.anschrift &&
        a.auditor.ort === b.auditor.ort &&
        a.auditor.auditorname === b.auditor.auditorname
    );
}

function collectInspectionImageIds(inspection: Inspection, ids: Set<string>) {
    for (const picture of inspection.pictures ?? []) {
        if (picture?.id) ids.add(picture.id);
    }
    for (const pdf of inspection.pdfs ?? []) {
        if (pdf?.id) ids.add(pdf.id);
    }
}

function collectDeviceImageIds(device: Device, ids: Set<string>) {
    for (const picture of device.pictures ?? []) {
        if (picture?.id) ids.add(picture.id);
    }
    for (const pdf of device.pdfs ?? []) {
        if (pdf?.id) ids.add(pdf.id);
    }
    for (const inspection of device.inspections ?? []) {
        collectInspectionImageIds(inspection, ids);
    }
}

/**
 * Führt ein Backup-ZIP additiv in den bestehenden Datenbestand zusammen
 * (im Gegensatz zum Restore wird nichts überschrieben oder gelöscht):
 *
 * - Voraussetzung ist, dass die Prüfobjekt-Daten (Meta) auf beiden Seiten
 *   vorhanden und in allen Feldern identisch sind; sonst wird mit Fehler
 *   abgebrochen, ohne etwas zu ändern.
 * - Geräte werden anhand ihrer Record-Id zugeordnet. Im Backup neue Geräte
 *   werden inklusive Standort, Bilder, PDFs und Inspectionen vollständig
 *   mit ihrer ursprünglichen Id übernommen.
 * - Bei bereits vorhandenen Geräten werden nur die Inspectionen übernommen,
 *   deren inspectionName dort noch nicht existiert (inkl. ihrer Bilder und
 *   PDFs). Inspectionen mit bereits vorhandenem inspectionName werden
 *   übersprungen und das Gerät für den Ergebnisbericht gemeldet.
 * - Wurde im Backup ein Gerät mit einer übernommenen Inspection
 *   außer Betrieb gesetzt (status "ausser_betrieb"), wird auch das
 *   deactivated-Flag des vorhandenen Geräts gesetzt.
 */
export async function mergeBackupIntoCurrentData(
    file: Blob,
    onProgress?: (current: number, total: number) => void,
): Promise<MergeResult> {
    const backup = await loadIndexedDBBackupZip(file, onProgress);

    const currentMeta = await getMeta();
    if (!currentMeta || !backup.meta) {
        throw new Error(
            "Zusammenführen nicht möglich: Die Prüfobjekt-Daten sind auf einer der beiden Seiten nicht vorhanden.",
        );
    }
    if (!metaEquals(currentMeta, backup.meta)) {
        throw new Error(
            "Zusammenführen nicht möglich: Die Prüfobjekt-Daten des Backups unterscheiden sich von den vorhandenen Daten.",
        );
    }

    const currentRecords = await getRecords();
    const currentById = new Map(currentRecords.map((record) => [record.id, record]));

    const insertedDevices: DeviceSummary[] = [];
    const mergedInspections: InspectionSummary[] = [];
    const skippedInspections: InspectionSummary[] = [];
    const neededImageIds = new Set<string>();

    for (const backupRecord of backup.records) {
        const backupDevice = backupRecord.device
            ? new Device(backupRecord.device as Partial<Device>)
            : undefined;
        if (!backupDevice) continue;

        const existing = currentById.get(backupRecord.id);

        if (!existing) {
            // Neues Gerät: vollständig mit ursprünglicher id übernehmen.
            await importRecord({
                ...backupRecord,
                device: backupDevice,
                location: backupRecord.location
                    ? new Location(backupRecord.location as Partial<Location>)
                    : undefined,
            });
            collectDeviceImageIds(backupDevice, neededImageIds);
            insertedDevices.push({
                recordId: backupRecord.id,
                type: backupDevice.type,
                manufacturer: backupDevice.manufacturer,
                model: backupDevice.model,
                serialNumber: backupDevice.serialNumber,
            });
            continue;
        }

        // Bekanntes Gerät: nur Inspectionen mit neuem inspectionName anhängen.
        const currentDevice = existing.device ? new Device(existing.device as Partial<Device>) : new Device();
        const existingNames = new Set(
            (currentDevice.inspections ?? []).map((inspection) => inspection.inspectionName),
        );

        let changed = false;
        for (const backupInspection of backupDevice.inspections ?? []) {
            if (existingNames.has(backupInspection.inspectionName)) {
                skippedInspections.push({
                    recordId: existing.id,
                    type: currentDevice.type,
                    manufacturer: currentDevice.manufacturer,
                    model: currentDevice.model,
                    serialNumber: currentDevice.serialNumber,
                    inspectionName: backupInspection.inspectionName,
                    inspectionDate: backupInspection.inspectionDate ?? "",
                });
                continue;
            }

            const inspection = new Inspection(backupInspection);
            currentDevice.inspections = [...(currentDevice.inspections ?? []), inspection];
            collectInspectionImageIds(inspection, neededImageIds);

            if (inspection.status === DeviceStatus.AusserBetrieb) {
                currentDevice.deactivated = true;
            }

            mergedInspections.push({
                recordId: existing.id,
                type: currentDevice.type,
                manufacturer: currentDevice.manufacturer,
                model: currentDevice.model,
                serialNumber: currentDevice.serialNumber,
                inspectionName: inspection.inspectionName,
                inspectionDate: inspection.inspectionDate ?? "",
            });
            changed = true;
        }

        if (changed) {
            existing.device = currentDevice;
            await updateRecord(existing);
        }
    }

    // Benötigte Bild-/PDF-Blobs übertragen; bereits vorhandene ids bleiben
    // unangetastet (kein Überschreiben bestehender Anhänge).
    const backupImagesById = new Map<string, StoredImage>(
        backup.images.map((image) => [image.id, image]),
    );
    for (const imageId of neededImageIds) {
        if (await getImage(imageId)) continue;

        const image = backupImagesById.get(imageId);
        if (image) {
            await importImage(image);
        }
    }

    return {
        insertedDevices,
        mergedInspections,
        skippedInspections,
    };
}

