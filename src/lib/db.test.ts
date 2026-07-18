import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	addRecord,
	clearRecords,
	deleteDatabase,
	deleteRecord,
	getAllImages,
	getImage,
	getMeta,
	getRecord,
	getRecords,
	restoreDatabaseFromBackup,
	saveImageBlob,
	saveMeta,
	updateRecord,
	upsertDevice,
	type StoredImage,
	type StoredRecord
} from './db';
import { Device, Location, Meta, Metadata } from './models';

// Jede Testdatei/jeder Test bekommt eine frische IndexedDB-Instanz,
// damit Tests sich nicht gegenseitig beeinflussen.
beforeEach(() => {
	globalThis.indexedDB = new IDBFactory();
});

describe('addRecord / getRecords', () => {
	it('legt ein Record an und setzt createdAt/updatedAt', async () => {
		const before = Date.now();
		const key = await addRecord({ title: 'Testgerät' });
		const after = Date.now();

		expect(key).toBeDefined();

		const records = await getRecords();
		expect(records).toHaveLength(1);
		expect(records[0].title).toBe('Testgerät');
		expect(records[0].createdAt).toBeGreaterThanOrEqual(before);
		expect(records[0].createdAt).toBeLessThanOrEqual(after);
		expect(records[0].updatedAt).toBe(records[0].createdAt);
	});

	it('liefert Records absteigend nach createdAt sortiert', async () => {
		await addRecord({ title: 'Erstes' });
		await new Promise((resolve) => setTimeout(resolve, 5));
		await addRecord({ title: 'Zweites' });
		await new Promise((resolve) => setTimeout(resolve, 5));
		await addRecord({ title: 'Drittes' });

		const records = await getRecords();

		expect(records.map((r) => r.title)).toEqual(['Drittes', 'Zweites', 'Erstes']);
	});

	it('hydriert device/location/metadata zu echten Klassen-Instanzen', async () => {
		await addRecord({
			title: 'Mit Zusatzdaten',
			device: { manufacturer: 'Acme' },
			location: { locationName: 'Keller' },
			metadata: { inspector: 'Max' }
		});

		const [record] = await getRecords();

		expect(record.device).toBeInstanceOf(Device);
		expect((record.device as Device).manufacturer).toBe('Acme');
		expect(record.location).toBeInstanceOf(Location);
		expect((record.location as Location).locationName).toBe('Keller');
		expect(record.metadata).toBeInstanceOf(Metadata);
		expect((record.metadata as Metadata).inspector).toBe('Max');
	});

	it('lässt device/location/metadata undefined, wenn nicht angegeben', async () => {
		await addRecord({ title: 'Ohne Zusatzdaten' });

		const [record] = await getRecords();

		expect(record.device).toBeUndefined();
		expect(record.location).toBeUndefined();
		expect(record.metadata).toBeUndefined();
	});

	it('liefert ein leeres Array, wenn keine Records existieren', async () => {
		const records = await getRecords();
		expect(records).toEqual([]);
	});
});

describe('getRecord', () => {
	it('liefert ein hydriertes Record per ID', async () => {
		await addRecord({ title: 'A', device: { manufacturer: 'Foo' } });
		const [{ id }] = await getRecords();

		const record = await getRecord(id);

		expect(record).toBeDefined();
		expect(record?.title).toBe('A');
		expect(record?.device).toBeInstanceOf(Device);
	});

	it('liefert undefined für eine unbekannte ID', async () => {
		const record = await getRecord(999999);
		expect(record).toBeUndefined();
	});
});

describe('updateRecord', () => {
	it('aktualisiert Felder und setzt updatedAt neu', async () => {
		await addRecord({ title: 'Original' });
		const [record] = await getRecords();
		const originalUpdatedAt = record.updatedAt;

		await new Promise((resolve) => setTimeout(resolve, 5));

		const updated: StoredRecord = { ...record, title: 'Geändert' };
		await updateRecord(updated);

		const [result] = await getRecords();
		expect(result.title).toBe('Geändert');
		expect(result.updatedAt).toBeGreaterThan(originalUpdatedAt);
		expect(result.createdAt).toBe(record.createdAt);
	});
});

describe('deleteRecord / clearRecords', () => {
	it('löscht ein einzelnes Record', async () => {
		await addRecord({ title: 'A' });
		await addRecord({ title: 'B' });
		const records = await getRecords();
		const toDelete = records.find((r) => r.title === 'A')!;

		await deleteRecord(toDelete.id);

		const remaining = await getRecords();
		expect(remaining).toHaveLength(1);
		expect(remaining[0].title).toBe('B');
	});

	it('leert alle Records', async () => {
		await addRecord({ title: 'A' });
		await addRecord({ title: 'B' });

		await clearRecords();

		expect(await getRecords()).toEqual([]);
	});
});

describe('saveImageBlob / getImage / getAllImages', () => {
	it('speichert ein Blob und liefert Metadaten', async () => {
		const blob = new Blob(['hello'], { type: 'image/png' });

		const image = await saveImageBlob(blob, 'foto.png');

		expect(image.id).toBeTruthy();
		expect(image.name).toBe('foto.png');
		expect(image.type).toBe('image/png');
		expect(image.size).toBe(blob.size);
		expect(image.createdAt).toBeGreaterThan(0);
	});

	it('fällt auf image/jpeg zurück, wenn der Blob keinen Typ hat', async () => {
		const blob = new Blob(['hello']);

		const image = await saveImageBlob(blob);

		expect(image.type).toBe('image/jpeg');
	});

	it('liest ein zuvor gespeichertes Bild per ID', async () => {
		const blob = new Blob(['data'], { type: 'image/png' });
		const saved = await saveImageBlob(blob, 'foto.png');

		const loaded = await getImage(saved.id);

		expect(loaded).toBeDefined();
		expect(loaded?.id).toBe(saved.id);
		expect(loaded?.name).toBe('foto.png');
	});

	it('liefert undefined bei leerer ID', async () => {
		const loaded = await getImage('');
		expect(loaded).toBeUndefined();
	});

	it('liefert undefined für eine unbekannte Bild-ID', async () => {
		const loaded = await getImage('unbekannt');
		expect(loaded).toBeUndefined();
	});

	it('liefert alle gespeicherten Bilder', async () => {
		await saveImageBlob(new Blob(['a'], { type: 'image/png' }), 'a.png');
		await saveImageBlob(new Blob(['b'], { type: 'image/png' }), 'b.png');

		const images = await getAllImages();

		expect(images).toHaveLength(2);
		expect(images.map((i) => i.name).sort()).toEqual(['a.png', 'b.png']);
	});
});

describe('deleteDatabase', () => {
	it('entfernt alle Records und Bilder komplett', async () => {
		await addRecord({ title: 'A' });
		await saveImageBlob(new Blob(['a']), 'a.png');

		await deleteDatabase();

		expect(await getRecords()).toEqual([]);
		expect(await getAllImages()).toEqual([]);
	});
});

describe('restoreDatabaseFromBackup', () => {
	it('ersetzt bestehende Daten komplett durch die Backup-Daten', async () => {
		await addRecord({ title: 'Wird gelöscht' });

		const backupRecords: StoredRecord[] = [
			{ id: 1, title: 'Backup A', createdAt: 100, updatedAt: 100 },
			{ id: 2, title: 'Backup B', createdAt: 200, updatedAt: 200 }
		];
		const backupImages: StoredImage[] = [
			{
				id: 'img-1',
				blob: new Blob(['x'], { type: 'image/png' }),
				name: 'x.png',
				type: 'image/png',
				size: 1,
				createdAt: 100
			}
		];
		const backupMeta = new Meta({ pruefObjekt: 'Objekt X' });

		await restoreDatabaseFromBackup(backupRecords, backupImages, backupMeta);

		const records = await getRecords();
		expect(records.map((r) => r.title).sort()).toEqual(['Backup A', 'Backup B']);

		const images = await getAllImages();
		expect(images).toHaveLength(1);
		expect(images[0].name).toBe('x.png');

		const meta = await getMeta();
		expect(meta?.pruefObjekt).toBe('Objekt X');
	});

	it('funktioniert auch ohne meta-Parameter', async () => {
		await restoreDatabaseFromBackup([], []);

		expect(await getRecords()).toEqual([]);
		expect(await getMeta()).toBeUndefined();
	});
});

describe('upsertDevice', () => {
	it('legt ein neues Record an, wenn recordId null ist', async () => {
		const key = await upsertDevice(null, { manufacturer: 'Acme' }, { locationName: 'Keller' });

		expect(key).toBeDefined();

		const [record] = await getRecords();
		expect(record.device).toBeInstanceOf(Device);
		expect((record.device as Device).manufacturer).toBe('Acme');
		expect((record.device as Device).inspection).toBe(true);
		expect(record.location).toBeInstanceOf(Location);
		expect((record.location as Location).locationName).toBe('Keller');
	});

	it('aktualisiert device/location eines bestehenden Records', async () => {
		await addRecord({ title: 'Bestehend', device: { manufacturer: 'Alt' } });
		const [existing] = await getRecords();

		await upsertDevice(existing.id, { manufacturer: 'Neu' }, { locationName: 'Dachboden' });

		const updated = await getRecord(existing.id);
		expect((updated?.device as unknown as Device).manufacturer).toBe('Neu');
		expect((updated?.device as unknown as Device).inspection).toBe(true);
		expect((updated?.location as unknown as Location).locationName).toBe('Dachboden');
		expect(updated?.title).toBe('Bestehend');
	});

	it('legt ein neues Record an, wenn die angegebene recordId nicht existiert', async () => {
		const key = await upsertDevice(999999, { manufacturer: 'Fallback' });

		expect(key).toBeDefined();
		const records = await getRecords();
		expect(records).toHaveLength(1);
		expect((records[0].device as unknown as Device).manufacturer).toBe('Fallback');
	});

	it('behält location bei, wenn keine locationData übergeben wird', async () => {
		await addRecord({ title: 'Bestehend', location: { locationName: 'Keller' } });
		const [existing] = await getRecords();

		await upsertDevice(existing.id, { manufacturer: 'Neu' });

		const updated = await getRecord(existing.id);
		expect((updated?.location as unknown as Location).locationName).toBe('Keller');
	});
});

describe('getMeta / saveMeta', () => {
	it('liefert undefined, wenn noch keine Meta gespeichert wurde', async () => {
		expect(await getMeta()).toBeUndefined();
	});

	it('speichert und liest Meta als Meta-Instanz', async () => {
		const meta = new Meta({ pruefObjekt: 'Objekt', namen: 'Max Mustermann' });

		await saveMeta(meta);
		const loaded = await getMeta();

		expect(loaded).toBeInstanceOf(Meta);
		expect(loaded?.pruefObjekt).toBe('Objekt');
		expect(loaded?.namen).toBe('Max Mustermann');
	});

	it('überschreibt vorhandene Meta beim erneuten Speichern', async () => {
		await saveMeta(new Meta({ pruefObjekt: 'Erst' }));
		await saveMeta(new Meta({ pruefObjekt: 'Zweit' }));

		const loaded = await getMeta();
		expect(loaded?.pruefObjekt).toBe('Zweit');
	});
});
