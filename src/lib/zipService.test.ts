import JSZip from 'jszip';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	buildBackupFilename,
	createIndexedDBBackupZip,
	downloadBlob,
	loadIndexedDBBackupZip
} from './zipService';
import type { Meta, StoredImage, StoredRecord } from './db';

const { getRecords, getAllImages, getMeta, restoreDatabaseFromBackup } = vi.hoisted(() => ({
	getRecords: vi.fn(),
	getAllImages: vi.fn(),
	getMeta: vi.fn(),
	restoreDatabaseFromBackup: vi.fn()
}));

vi.mock('./db', () => ({
	getRecords,
	getAllImages,
	getMeta,
	restoreDatabaseFromBackup
}));

const sampleRecords: StoredRecord[] = [
	{ id: 1, title: 'Datensatz 1', createdAt: 100, updatedAt: 100 },
	{ id: 2, title: 'Datensatz 2', createdAt: 200, updatedAt: 200 }
];

const sampleImages: StoredImage[] = [
	{
		id: 'img-1',
		blob: new Blob(['bild-inhalt'], { type: 'image/png' }),
		name: 'foto.png',
		type: 'image/png',
		size: 11,
		createdAt: 100
	}
];

const sampleMeta: Meta = {
	id: 'singleton',
	pruefObjekt: 'Objekt X',
	namen: 'Max Mustermann',
	anschrift: '',
	ort: '',
	aktuellePruefung: ''
} as Meta;

beforeEach(() => {
	getRecords.mockReset();
	getAllImages.mockReset();
	getMeta.mockReset();
	restoreDatabaseFromBackup.mockReset();
});

describe('createIndexedDBBackupZip', () => {
	it('erstellt ein Zip mit records.json, meta.json und Bildern', async () => {
		getRecords.mockResolvedValue(sampleRecords);
		getAllImages.mockResolvedValue(sampleImages);
		getMeta.mockResolvedValue(sampleMeta);

		const { blob, meta } = await createIndexedDBBackupZip();

		expect(meta).toEqual(sampleMeta);
		expect(blob.size).toBeGreaterThan(0);

		const zip = await JSZip.loadAsync(blob);

		const recordsText = await zip.file('records.json')!.async('text');
		expect(JSON.parse(recordsText)).toEqual({ records: sampleRecords });

		const metaText = await zip.file('meta.json')!.async('text');
		expect(JSON.parse(metaText)).toEqual(sampleMeta);

		const imageFile = zip.file('images/img-1.png');
		expect(imageFile).not.toBeNull();
		const imageText = await imageFile!.async('text');
		expect(imageText).toBe('bild-inhalt');
	});

	it('lässt meta.json weg, wenn keine Meta vorhanden ist', async () => {
		getRecords.mockResolvedValue([]);
		getAllImages.mockResolvedValue([]);
		getMeta.mockResolvedValue(undefined);

		const { blob, meta } = await createIndexedDBBackupZip();

		expect(meta).toBeUndefined();

		const zip = await JSZip.loadAsync(blob);
		expect(zip.file('meta.json')).toBeNull();
	});

	it('ermittelt die Dateiendung aus dem Bildnamen, falls vorhanden', async () => {
		getRecords.mockResolvedValue([]);
		getAllImages.mockResolvedValue([
			{
				id: 'img-2',
				blob: new Blob(['x'], { type: 'application/octet-stream' }),
				name: 'original.jpeg',
				type: 'application/octet-stream',
				size: 1,
				createdAt: 100
			}
		]);
		getMeta.mockResolvedValue(undefined);

		const { blob } = await createIndexedDBBackupZip();
		const zip = await JSZip.loadAsync(blob);

		expect(zip.file('images/img-2.jpeg')).not.toBeNull();
	});

	it('fällt auf die Endung aus dem MIME-Type zurück, wenn kein Name vorhanden ist', async () => {
		getRecords.mockResolvedValue([]);
		getAllImages.mockResolvedValue([
			{
				id: 'img-3',
				blob: new Blob(['x'], { type: 'image/webp' }),
				type: 'image/webp',
				size: 1,
				createdAt: 100
			}
		]);
		getMeta.mockResolvedValue(undefined);

		const { blob } = await createIndexedDBBackupZip();
		const zip = await JSZip.loadAsync(blob);

		expect(zip.file('images/img-3.webp')).not.toBeNull();
	});
});

describe('loadIndexedDBBackupZip', () => {
	async function buildZipBlob(build: (zip: JSZip) => void): Promise<Blob> {
		const zip = new JSZip();
		build(zip);
		return zip.generateAsync({ type: 'blob' });
	}

	it('lädt records, images und meta aus einem gültigen Backup', async () => {
		const blob = await buildZipBlob((zip) => {
			zip.file('records.json', JSON.stringify({ records: sampleRecords }));
			zip.file('meta.json', JSON.stringify(sampleMeta));
			const images = zip.folder('images')!;
			images.file('img-1.png', 'bild-inhalt');
		});

		const result = await loadIndexedDBBackupZip(blob);

		expect(result.records).toEqual(sampleRecords);
		expect(result.images).toHaveLength(1);
		expect(result.images[0].id).toBe('img-1');
		expect(result.images[0].name).toBe('img-1.png');
		expect(result.meta?.pruefObjekt).toBe('Objekt X');
	});

	it('wirft einen Fehler, wenn records.json fehlt', async () => {
		const blob = await buildZipBlob(() => {
			// kein records.json
		});

		await expect(loadIndexedDBBackupZip(blob)).rejects.toThrow('Backup enthält keine records.json');
	});

	it('wirft einen Fehler, wenn records kein Array ist', async () => {
		const blob = await buildZipBlob((zip) => {
			zip.file('records.json', JSON.stringify({ records: 'kein-array' }));
		});

		await expect(loadIndexedDBBackupZip(blob)).rejects.toThrow('Ungültiges Backup-Format');
	});

	it('ignoriert eine fehlerhafte meta.json und liefert meta als undefined', async () => {
		const blob = await buildZipBlob((zip) => {
			zip.file('records.json', JSON.stringify({ records: [] }));
			zip.file('meta.json', 'kein-gueltiges-json{{{');
		});

		const result = await loadIndexedDBBackupZip(blob);

		expect(result.meta).toBeUndefined();
		expect(result.records).toEqual([]);
	});

	it('liefert meta als undefined, wenn keine meta.json vorhanden ist', async () => {
		const blob = await buildZipBlob((zip) => {
			zip.file('records.json', JSON.stringify({ records: [] }));
		});

		const result = await loadIndexedDBBackupZip(blob);

		expect(result.meta).toBeUndefined();
	});

	it('liefert ein leeres images-Array, wenn kein images-Ordner vorhanden ist', async () => {
		const blob = await buildZipBlob((zip) => {
			zip.file('records.json', JSON.stringify({ records: [] }));
		});

		const result = await loadIndexedDBBackupZip(blob);

		expect(result.images).toEqual([]);
	});
});

describe('downloadBlob', () => {
	it('erstellt einen Download-Link, klickt ihn und räumt danach auf', () => {
		const blob = new Blob(['inhalt']);
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

		const anchor = document.createElement('a');
		const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});
		const removeSpy = vi.spyOn(anchor, 'remove').mockImplementation(() => {});
		const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
		const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);

		downloadBlob(blob, 'backup.zip');

		expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
		expect(createElementSpy).toHaveBeenCalledWith('a');
		expect(anchor.href).toBe('blob:mock-url');
		expect(anchor.download).toBe('backup.zip');
		expect(appendChildSpy).toHaveBeenCalledWith(anchor);
		expect(clickSpy).toHaveBeenCalled();
		expect(removeSpy).toHaveBeenCalled();
		expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

		createObjectURLSpy.mockRestore();
		revokeObjectURLSpy.mockRestore();
		createElementSpy.mockRestore();
		appendChildSpy.mockRestore();
	});
});

describe('buildBackupFilename', () => {
	const fixedDate = new Date(2024, 2, 5, 8, 3, 9); // 2024-03-05 08:03:09 lokal

	it('nutzt pruefObjekt als Basis und formatiert den Zeitstempel', () => {
		const filename = buildBackupFilename('Mein Objekt', fixedDate);
		expect(filename).toBe('Mein_Objekt_2024-03-05_08-03-09.zip');
	});

	it('fällt auf einen generischen Namen zurück, wenn pruefObjekt fehlt', () => {
		const filename = buildBackupFilename(undefined, fixedDate);
		expect(filename).toBe('der-erfasser-backup_2024-03-05_08-03-09.zip');
	});

	it('fällt auf einen generischen Namen zurück, wenn pruefObjekt nur Leerzeichen enthält', () => {
		const filename = buildBackupFilename('   ', fixedDate);
		expect(filename).toBe('der-erfasser-backup_2024-03-05_08-03-09.zip');
	});

	it('ersetzt ungültige Dateinamenzeichen und Leerzeichen durch Unterstriche', () => {
		const filename = buildBackupFilename('Objekt: A/B*C?"<D>|E', fixedDate);
		expect(filename).toBe('Objekt__A_B_C_D_E_2024-03-05_08-03-09.zip');
	});

	it('verwendet das aktuelle Datum, wenn keines übergeben wird', () => {
		const before = new Date();
		const filename = buildBackupFilename('Objekt');
		const after = new Date();

		expect(filename.startsWith('Objekt_')).toBe(true);
		// grobe Plausibilitätsprüfung: Jahr im Dateinamen entspricht dem aktuellen Jahr
		expect(filename).toContain(String(before.getFullYear()));
		expect(before.getTime()).toBeLessThanOrEqual(after.getTime());
	});
});
