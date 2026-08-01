import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx';
import {
	IMPORT_TARGET_FIELDS,
	importRows,
	mapRowsToDevices,
	mapRowToDeviceAndLocation,
	parseExcelFile,
	type ColumnMapping
} from './importService';
import { ProtectionClass } from './models';

const { addRecord, rememberLocation } = vi.hoisted(() => ({
	addRecord: vi.fn(),
	rememberLocation: vi.fn()
}));

vi.mock('./db', () => ({ addRecord }));
vi.mock('./stores/locationSuggestions.svelte', () => ({ rememberLocation }));

beforeEach(() => {
	addRecord.mockReset();
	rememberLocation.mockReset();
});

/** Baut eine minimale .xlsx-Datei (als File) aus einem Array von Zeilen (Array-of-Arrays). */
function buildExcelFile(rows: unknown[][], filename = 'geraete.xlsx'): File {
	const worksheet = XLSX.utils.aoa_to_sheet(rows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
	const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
	return new File([buffer], filename, { type: 'application/octet-stream' });
}

describe('parseExcelFile', () => {
	it('liest die Kopfzeile und die Datenzeilen aus dem ersten Tabellenblatt', async () => {
		const file = buildExcelFile([
			['Hersteller', 'Modell', 'Seriennummer'],
			['ACME', 'X-1000', 'SN-1'],
			['Contoso', 'Y-2000', 'SN-2']
		]);

		const { headers, rows } = await parseExcelFile(file);

		expect(headers).toEqual(['Hersteller', 'Modell', 'Seriennummer']);
		expect(rows).toEqual([
			['ACME', 'X-1000', 'SN-1'],
			['Contoso', 'Y-2000', 'SN-2']
		]);
	});

	it('verwendet einen generischen Spaltennamen, wenn eine Kopfzelle leer ist', async () => {
		const file = buildExcelFile([
			['Hersteller', '', 'Seriennummer'],
			['ACME', 'X-1000', 'SN-1']
		]);

		const { headers } = await parseExcelFile(file);

		expect(headers).toEqual(['Hersteller', 'Spalte 2', 'Seriennummer']);
	});

	it('lässt vollständig leere Datenzeilen weg', async () => {
		const file = buildExcelFile([
			['Hersteller', 'Modell'],
			['ACME', 'X-1000'],
			['', ''],
			['Contoso', 'Y-2000']
		]);

		const { rows } = await parseExcelFile(file);

		expect(rows).toEqual([
			['ACME', 'X-1000'],
			['Contoso', 'Y-2000']
		]);
	});

	it('wirft einen Fehler, wenn die Tabelle keine Daten enthält', async () => {
		const file = buildExcelFile([]);

		await expect(parseExcelFile(file)).rejects.toThrow('Die Tabelle enthält keine Daten.');
	});
});

describe('mapRowToDeviceAndLocation', () => {
	const mapping: ColumnMapping = {
		manufacturer: 0,
		model: 1,
		serialNumber: 2,
		protectionClass: 3,
		ratedVoltage: 4,
		ratedPower: null,
		locationName: 5
	};

	it('ordnet die Zellwerte gemäß Mapping den Device-/Location-Feldern zu', () => {
		const row = ['ACME', 'X-1000', 'SN-1', 'II', '230', 'Hauptgebäude'];
		const result = mapRowToDeviceAndLocation(row, mapping, 0);

		expect(result.device).toEqual({
			manufacturer: 'ACME',
			model: 'X-1000',
			serialNumber: 'SN-1',
			protectionClass: ProtectionClass.II,
			ratedVoltage: 230
		});
		expect(result.location).toEqual({ locationName: 'Hauptgebäude' });
		expect(result.warnings).toEqual([]);
	});

	it('wandelt eine ungültige Zahl zu 0 um und erzeugt eine Warnung', () => {
		const row = ['ACME', 'X-1000', 'SN-1', 'II', 'nicht-numerisch', 'Hauptgebäude'];
		const result = mapRowToDeviceAndLocation(row, mapping, 0);

		expect(result.device.ratedVoltage).toBe(0);
		expect(result.warnings).toEqual([
			'„Bemessungsspannung“: Wert „nicht-numerisch“ ist keine gültige Zahl, wurde als 0 übernommen.'
		]);
	});

	it('lässt eine ungültige Schutzklasse leer und erzeugt eine Warnung', () => {
		const row = ['ACME', 'X-1000', 'SN-1', 'Schutzklasse 2', '230', 'Hauptgebäude'];
		const result = mapRowToDeviceAndLocation(row, mapping, 0);

		expect(result.device.protectionClass).toBe('');
		expect(result.warnings).toEqual([
			'„Schutzklasse (I/II/III)“: Wert „Schutzklasse 2“ ist keine gültige Schutzklasse (I/II/III), wurde leer gelassen.'
		]);
	});

	it('lässt nicht zugeordnete Zielfelder (mapping = null) im Ergebnis weg', () => {
		const row = ['ACME', 'X-1000', 'SN-1', 'II', '230', 'Hauptgebäude'];
		const result = mapRowToDeviceAndLocation(row, mapping, 0);

		expect(result.device).not.toHaveProperty('ratedPower');
	});

	it('akzeptiert Komma als Dezimaltrennzeichen bei Zahlen', () => {
		const row = ['ACME', 'X-1000', 'SN-1', 'II', '230,5', 'Hauptgebäude'];
		const result = mapRowToDeviceAndLocation(row, mapping, 0);

		expect(result.device.ratedVoltage).toBe(230.5);
		expect(result.warnings).toEqual([]);
	});
});

describe('mapRowsToDevices', () => {
	it('wendet das Mapping auf alle Zeilen an und behält die Zeilen-Reihenfolge/-Indizes', () => {
		const mapping: ColumnMapping = { manufacturer: 0 };
		const rows = [['ACME'], ['Contoso']];

		const result = mapRowsToDevices(rows, mapping);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({ rowIndex: 0, device: { manufacturer: 'ACME' } });
		expect(result[1]).toMatchObject({ rowIndex: 1, device: { manufacturer: 'Contoso' } });
	});
});

describe('IMPORT_TARGET_FIELDS', () => {
	it('enthält alle Device- und Location-Felder, die gemappt werden können', () => {
		const keys = IMPORT_TARGET_FIELDS.map((f) => f.key);
		expect(keys).toEqual([
			'type',
			'manufacturer',
			'model',
			'serialNumber',
			'protectionClass',
			'ratedVoltage',
			'ratedPower',
			'locationName',
			'building',
			'room'
		]);
	});
});

describe('importRows', () => {
	it('importiert jede gemappte Zeile als eigenen Datensatz und merkt sich neue Standorte', async () => {
		addRecord.mockResolvedValue(1);
		const mappedRows = mapRowsToDevices(
			[
				['ACME', 'X-1000', 'SN-1', 'Hauptgebäude'],
				['Contoso', 'Y-2000', 'SN-2', 'Nebengebäude']
			],
			{ manufacturer: 0, model: 1, serialNumber: 2, locationName: 3 }
		);

		const result = await importRows(mappedRows);

		expect(result).toEqual({ successCount: 2, errorCount: 0, errors: [] });
		expect(addRecord).toHaveBeenCalledTimes(2);
		expect(rememberLocation).toHaveBeenCalledTimes(2);
	});

	it('überspringt fehlerhafte Zeilen, importiert aber die restlichen (Teilimport)', async () => {
		addRecord.mockResolvedValueOnce(1).mockRejectedValueOnce(new Error('DB-Fehler')).mockResolvedValueOnce(2);

		const mappedRows = mapRowsToDevices(
			[['ACME'], ['Contoso'], ['Fabrikam']],
			{ manufacturer: 0 }
		);

		const result = await importRows(mappedRows);

		expect(result.successCount).toBe(2);
		expect(result.errorCount).toBe(1);
		expect(result.errors).toEqual(['Zeile 3: DB-Fehler']);
	});

	it('nimmt Warnungen aus dem Mapping (z. B. ungültige Zahl) in die Fehlerliste auf, importiert die Zeile aber trotzdem', async () => {
		addRecord.mockResolvedValue(1);
		const mappedRows = mapRowsToDevices([['ACME', 'nicht-numerisch']], {
			manufacturer: 0,
			ratedVoltage: 1
		});

		const result = await importRows(mappedRows);

		expect(result.successCount).toBe(1);
		expect(result.errors).toEqual([
			'Zeile 2: „Bemessungsspannung“: Wert „nicht-numerisch“ ist keine gültige Zahl, wurde als 0 übernommen.'
		]);
	});
});
