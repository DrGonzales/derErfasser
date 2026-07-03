import JSZip from 'jszip';
import { getRecords, getAllImages, StoredImage, StoredRecord } from './db';

export async function createIndexedDBBackupZip(): Promise<Blob> {
    const records = await getRecords();
    const images = await getAllImages();
    const zip = new JSZip();

    zip.file('records.json', JSON.stringify({ records }, null, 2));

    const imageFolder = zip.folder('images');
    for (const image of images) {
        const ext = image.name?.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? image.type.split('/').pop() ?? 'bin';
        const filename = `${image.id}.${ext}`;
        imageFolder?.file(filename, image.blob, { binary: true });
    }

    return zip.generateAsync({ type: 'blob' });
}

export async function loadIndexedDBBackupZip(file: Blob): Promise<{ records: StoredRecord[]; images: StoredImage[] }> {
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
        const fileEntries = Object.values(imageFolder.files).filter((entry) => !entry.dir);

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

    return { records, images };
}

export function downloadBlob(blob: Blob, filename: string) {
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
}
