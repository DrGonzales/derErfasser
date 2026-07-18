import JSZip from 'jszip';
import { getRecords, getAllImages, getMeta, StoredImage, StoredRecord } from './db';
import type { Meta } from './db';
import { sanitizeFilenamePart, formatTimestampForFilename } from './filenameUtils';
export { downloadBlob } from './download';

export async function createIndexedDBBackupZip(): Promise<{ blob: Blob; meta?: Meta }> {
    const records = await getRecords();
    const images = await getAllImages();
    const meta = await getMeta();
    const zip = new JSZip();

    zip.file('records.json', JSON.stringify({ records }, null, 2));

    if (meta) {
        zip.file('meta.json', JSON.stringify(meta, null, 2));
    }

    const imageFolder = zip.folder('images');
    for (const image of images) {
        const ext = image.name?.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? image.type.split('/').pop() ?? 'bin';
        const filename = `${image.id}.${ext}`;
        imageFolder?.file(filename, image.blob, { binary: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return { blob, meta };
}

export async function loadIndexedDBBackupZip(file: Blob): Promise<{ records: StoredRecord[]; images: StoredImage[]; meta?: Meta }> {
    const zip = await JSZip.loadAsync(file);
    const recordsFile = zip.file('records.json');

    if (!recordsFile) {
        throw new Error('Backup enthält keine records.json');
    }

    const text = await recordsFile.async('text');
    const parsed = JSON.parse(text);

    if (!parsed || !Array.isArray(parsed.records)) {
        throw new Error('Ungültiges Backup-Format');
    }

    const records = parsed.records as StoredRecord[];
    const images: StoredImage[] = [];
    const imageFolder = zip.folder('images');

    if (imageFolder) {
        const fileEntries: JSZip.JSZipObject[] = [];
        imageFolder.forEach((_relativePath, entry) => {
            if (!entry.dir) {
                fileEntries.push(entry);
            }
        });

        for (const entry of fileEntries) {
            const blob = await entry.async('blob');
            const filename = entry.name.split('/').pop() ?? entry.name;
            const dotIndex = filename.lastIndexOf('.');
            const id = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;

            images.push({
                id,
                blob,
                name: filename,
                type: blob.type || 'application/octet-stream',
                size: blob.size,
                createdAt: Date.now()
            });
        }
    }

    // meta.json ist optional — ältere Backups haben es nicht
    let meta: Meta | undefined;
    const metaFile = zip.file('meta.json');
    if (metaFile) {
        try {
            const metaText = await metaFile.async('text');
            const metaParsed = JSON.parse(metaText);
            if (metaParsed && typeof metaParsed === 'object') {
                const { Meta } = await import('./models');
                meta = new Meta(metaParsed);
            }
        } catch {
            // fehlerhafte meta.json ignorieren
        }
    }

    return { records, images, meta };
}

/**
 * Baut den Dateinamen für den Backup-Download.
 * Nutzt meta.pruefObjekt als Basis, gefolgt von Datum und Uhrzeit.
 * Fällt auf einen generischen Namen zurück, falls kein pruefObjekt gesetzt ist.
 */
export function buildBackupFilename(pruefObjekt: string | undefined, date: Date = new Date()): string {
    const base = pruefObjekt?.trim() ? sanitizeFilenamePart(pruefObjekt) : 'der-erfasser-backup';
    return `${base}_${formatTimestampForFilename(date)}.zip`;
}
