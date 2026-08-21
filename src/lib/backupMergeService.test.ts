import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mergeBackupIntoCurrentData, type MergeResult } from './backupMergeService';
import { Device, DeviceStatus, Inspection, Meta } from './models';
import type { StoredRecord, StoredImage } from './db';

const {
	getRecords,
	getMeta,
	getImage,
	updateRecord,
	importRecord,
	importImage,
	loadIndexedDBBackupZip
} = vi.hoisted(() => ({
	getRecords: vi.fn(),
	getMeta: vi.fn(),
	getImage: vi.fn(),
	updateRecord: vi.fn(),
	importRecord: vi.fn(),
	importImage: vi.fn(),
	loadIndexedDBBackupZip: vi.fn()
}));

vi.mock('./db', () => ({ getRecords, getMeta, getImage, updateRecord, importRecord, importImage }));
vi.mock('./zipService', () => ({ loadIndexedDBBackupZip }));

beforeEach(() => {
	vi.resetAllMocks();
	updateRecord.mockResolvedValue(undefined);
	importRecord.mockResolvedValue('key');
	importImage.mockResolvedValue('key');
});

function buildMeta(overrides: Partial<Meta> = {}): Meta {
	return new Meta({
		pruefObjekt: 'Prüfobjekt A',
		namen: 'Musterfirma',
		anschrift: 'Musterweg 1',
		ort: 'Musterstadt',
		aktuellePruefung: 'Prüfung 2026',
		auditor: { name: 'Auditor', anschrift: 'A-Weg 2', ort: 'Musterstadt', auditorname: 'Prüfer' },
		...overrides
	});
}

function buildRecord(
	id: string,
	deviceData: Partial<Device>,
	extras: Partial<StoredRecord> = {}
): StoredRecord {
	return {
		id,
		createdAt: 1000,
		updatedAt: 1000,
		device: new Device(deviceData) as unknown as Record<string, unknown>,
		...extras
	} as StoredRecord;
}

function buildImage(id: string): StoredImage {
	return {
		id,
		blob: new Blob(['data'], { type: 'image/jpeg' }),
		name: `${id}.jpg`,
		type: 'image/jpeg',
		size: 4,
		createdAt: 1000
	};
}

/** Führt den Merge mit gestubbtem Backup aus. */
async function runMerge(options: {
	currentRecords?: StoredRecord[];
	currentMeta?: Meta | undefined;
	backupMeta?: Meta | undefined;
	backupRecords?: StoredRecord[];
	backupImages?: StoredImage[];
	existingImageIds?: string[];
}): Promise<MergeResult> {
	getMeta.mockResolvedValue(options.currentMeta ?? null);
	getRecords.mockResolvedValue(options.currentRecords ?? []);
	getImage.mockImplementation(async (id: string) =>
		(options.existingImageIds ?? []).includes(id) ? buildImage(id) : undefined
	);
	loadIndexedDBBackupZip.mockResolvedValue({
		records: options.backupRecords ?? [],
		images: options.backupImages ?? [],
		meta: options.backupMeta
	});

	return mergeBackupIntoCurrentData(new Blob(['zip']));
}

describe('mergeBackupIntoCurrentData — Meta-Abgleich', () => {
	it('bricht ab, wenn die aktuellen Prüfobjekt-Daten fehlen', async () => {
		await expect(
			runMerge({ backupMeta: buildMeta() })
		).rejects.toThrow('Prüfobjekt-Daten');
		expect(importRecord).not.toHaveBeenCalled();
		expect(updateRecord).not.toHaveBeenCalled();
	});

	it('bricht ab, wenn das Backup keine Meta-Daten enthält', async () => {
		await expect(
			runMerge({ currentMeta: buildMeta(), backupMeta: undefined })
		).rejects.toThrow('Prüfobjekt-Daten');
		expect(importRecord).not.toHaveBeenCalled();
	});

	it('bricht ab, wenn sich ein Meta-Feld unterscheidet', async () => {
		await expect(
			runMerge({
				currentMeta: buildMeta(),
				backupMeta: buildMeta({ pruefObjekt: 'Anderes Prüfobjekt' })
			})
		).rejects.toThrow('unterscheiden sich');
		expect(importRecord).not.toHaveBeenCalled();
	});

	it('bricht ab, wenn sich ein Auditor-Feld unterscheidet', async () => {
		await expect(
			runMerge({
				currentMeta: buildMeta(),
				backupMeta: buildMeta({
					auditor: { name: 'Anders', anschrift: '', ort: '', auditorname: '' }
				})
			})
		).rejects.toThrow('unterscheiden sich');
	});
});

describe('mergeBackupIntoCurrentData — bekannte Geräte', () => {
	const currentMeta = buildMeta();

	it('hängt Inspectionen mit neuem inspectionName an und setzt deactivated bei Ausmusterung', async () => {
		const current = buildRecord('rec-1', {
			type: 'Bohrer',
			manufacturer: 'ACME',
			model: 'X-1',
			serialNumber: 'SN-1',
			inspections: [new Inspection({ inspectionName: 'Prüfung 2025' })]
		});
		const backup = buildRecord('rec-1', {
			type: 'Bohrer',
			inspections: [
				new Inspection({ inspectionName: 'Prüfung 2026' }),
				new Inspection({
					inspectionName: 'Prüfung 2027',
					status: DeviceStatus.AusserBetrieb
				})
			]
		});

		const result = await runMerge({
			currentMeta,
			backupMeta: currentMeta,
			currentRecords: [current],
			backupRecords: [backup]
		});

		expect(result.mergedInspections).toHaveLength(2);
		expect(result.insertedDevices).toHaveLength(0);
		expect(result.skippedInspections).toEqual([]);
		expect(updateRecord).toHaveBeenCalledTimes(1);

		const savedDevice = updateRecord.mock.calls[0][0].device as Device;
		expect(savedDevice.inspections.map((i) => i.inspectionName)).toEqual([
			'Prüfung 2025',
			'Prüfung 2026',
			'Prüfung 2027'
		]);
		expect(savedDevice.deactivated).toBe(true);
		expect(result.mergedInspections.map((entry) => entry.inspectionName)).toEqual([
			'Prüfung 2026',
			'Prüfung 2027'
		]);
	});

	it('überspringt Inspectionen mit bereits vorhandenem inspectionName und meldet das Gerät dedupliziert', async () => {
		const current = buildRecord('rec-1', {
			type: 'Bohrer',
			manufacturer: 'ACME',
			model: 'X-1',
			serialNumber: 'SN-1',
			inspections: [new Inspection({ inspectionName: 'Prüfung 2026' })]
		});
		const backup = buildRecord('rec-1', {
			type: 'Bohrer',
			inspections: [
				new Inspection({ inspectionName: 'Prüfung 2026' }),
				new Inspection({ inspectionName: 'Prüfung 2025' })
			]
		});

		const result = await runMerge({
			currentMeta,
			backupMeta: currentMeta,
			currentRecords: [current],
			backupRecords: [backup]
		});

		expect(result.mergedInspections).toHaveLength(1);
		expect(result.skippedInspections).toHaveLength(1);
		expect(result.skippedInspections[0]).toMatchObject({
			recordId: 'rec-1',
			type: 'Bohrer',
			manufacturer: 'ACME',
			model: 'X-1',
			serialNumber: 'SN-1',
			inspectionName: 'Prüfung 2026'
		});
	});

	it('meldet ein Gerät nur einmal, auch wenn mehrere Inspectionen übersprungen werden', async () => {
		const current = buildRecord('rec-1', {
			type: 'Schleifer',
			manufacturer: 'ACME',
			model: 'S-9',
			serialNumber: 'SN-9',
			inspections: [
				new Inspection({ inspectionName: 'Prüfung 2025' }),
				new Inspection({ inspectionName: 'Prüfung 2026' })
			]
		});
		const backup = buildRecord('rec-1', {
			type: 'Schleifer',
			inspections: [
				new Inspection({ inspectionName: 'Prüfung 2025' }),
				new Inspection({ inspectionName: 'Prüfung 2026' })
			]
		});

		const result = await runMerge({
			currentMeta,
			backupMeta: currentMeta,
			currentRecords: [current],
			backupRecords: [backup]
		});

		expect(result.mergedInspections).toHaveLength(0);
		expect(updateRecord).not.toHaveBeenCalled();
		expect(result.skippedInspections).toHaveLength(2);
		expect(result.skippedInspections.map((entry) => entry.inspectionName)).toEqual([
			'Prüfung 2025',
			'Prüfung 2026'
		]);
	});
});

describe('mergeBackupIntoCurrentData — neue Geräte', () => {
	const currentMeta = buildMeta();

	it('übernimmt neue Geräte vollständig mit ursprünglicher id', async () => {
		const backup = buildRecord('rec-neu', {
			type: 'Kompressor',
			manufacturer: 'ACME',
			model: 'K-2',
			serialNumber: 'SN-2'
		});

		const result = await runMerge({
			currentMeta,
			backupMeta: currentMeta,
			backupRecords: [backup]
		});

		expect(result.insertedDevices).toHaveLength(1);
		expect(result.mergedInspections).toHaveLength(0);
		expect(importRecord).toHaveBeenCalledTimes(1);
		expect(importRecord.mock.calls[0][0].id).toBe('rec-neu');
		expect(updateRecord).not.toHaveBeenCalled();
		expect(result.insertedDevices[0]).toMatchObject({
			recordId: 'rec-neu',
			type: 'Kompressor',
			manufacturer: 'ACME',
			model: 'K-2',
			serialNumber: 'SN-2'
		});
	});
});

describe('mergeBackupIntoCurrentData — Bilder und PDFs', () => {
	const currentMeta = buildMeta();

	it('kopiert fehlende Anhänge einer übernommenen Inspection', async () => {
		const current = buildRecord('rec-1', {
			type: 'Bohrer',
			inspections: []
		});
		const backup = buildRecord('rec-1', {
			type: 'Bohrer',
			inspections: [
				new Inspection({
					inspectionName: 'Prüfung 2026',
					pictures: [{ id: 'img-1' }],
					pdfs: [{ id: 'pdf-1', name: 'protokoll.pdf' }]
				})
			]
		});

		await runMerge({
			currentMeta,
			backupMeta: currentMeta,
			currentRecords: [current],
			backupRecords: [backup],
			backupImages: [buildImage('img-1'), buildImage('pdf-1')]
		});

		expect(importImage).toHaveBeenCalledTimes(2);
		expect(importImage.mock.calls.map((c) => (c[0] as StoredImage).id)).toEqual([
			'img-1',
			'pdf-1'
		]);
	});

	it('überschreibt bereits vorhandene Anhänge nicht', async () => {
		const current = buildRecord('rec-1', {
			type: 'Bohrer',
			inspections: []
		});
		const backup = buildRecord('rec-1', {
			type: 'Bohrer',
			inspections: [
				new Inspection({
					inspectionName: 'Prüfung 2026',
					pictures: [{ id: 'img-1' }]
				})
			]
		});

		await runMerge({
			currentMeta,
			backupMeta: currentMeta,
			currentRecords: [current],
			backupRecords: [backup],
			backupImages: [buildImage('img-1')],
			existingImageIds: ['img-1']
		});

		expect(importImage).not.toHaveBeenCalled();
	});

	it('kopiert Anhänge komplett übernommener Geräte', async () => {
		const backup = buildRecord('rec-neu', {
			type: 'Kompressor',
			pictures: [{ id: 'img-2' }],
			inspections: [
				new Inspection({
					inspectionName: 'Prüfung 2026',
					pdfs: [{ id: 'pdf-2', name: 'protokoll.pdf' }]
				})
			]
		});

		const result = await runMerge({
			currentMeta,
			backupMeta: currentMeta,
			backupRecords: [backup],
			backupImages: [buildImage('img-2'), buildImage('pdf-2')]
		});

		expect(result.insertedDevices).toHaveLength(1);
		expect(importImage).toHaveBeenCalledTimes(2);
	});
});
