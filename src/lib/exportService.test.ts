import { describe, expect, it } from 'vitest';
import { buildExportRows, buildExportFilename, createExportWorkbook, EXPORT_HEADERS } from './exportService';
import { Device, Location, Inspection, InspectionResult, DeviceStatus, ProtectionClass } from './models';
import type { StoredRecord } from './db';

function record(overrides: Partial<StoredRecord> = {}): StoredRecord {
	return {
		id: 1,
		createdAt: 0,
		updatedAt: 0,
		device: new Device(),
		location: new Location(),
		...overrides
	};
}

describe('buildExportRows', () => {
	it('exportiert Gerätedaten auch ohne passende Prüfung (leere Prüfungs-Zellen)', () => {
		const device = new Device({
			type: 'Kaffeemaschine',
			manufacturer: 'ACME',
			model: 'X-1000',
			serialNumber: 'SN-1',
			protectionClass: ProtectionClass.II,
			ratedVoltage: 230,
			ratedPower: 1000,
			inspection: true,
			deactivated: false
		});
		const location = new Location({ locationName: 'Hauptgebäude', building: 'A', room: '101' });

		const rows = buildExportRows([record({ device, location })], 'Prüfung 2026');

		expect(rows).toHaveLength(1);
		expect(rows[0]).toEqual([
			'Kaffeemaschine',
			'ACME',
			'X-1000',
			'SN-1',
			'II',
			230,
			1000,
			'Hauptgebäude',
			'A',
			'101',
			'Ja',
			'Nein',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			''
		]);
	});

	it('fügt die Werte der Prüfung an, deren inspectionName der aktuellen Prüfung entspricht', () => {
		const inspection = new Inspection({
			inspectionName: 'Prüfung 2026',
			inspectionDate: '2026-03-15',
			status: DeviceStatus.Vorhanden,
			visualTestResult: InspectionResult.Passed,
			functionTestResult: InspectionResult.Passed,
			measurementTestResult: InspectionResult.Passed,
			protectiveConductorResistanceOhm: 0.2,
			isolationResistanceMohm: 5,
			substituteLeakageCurrentMa: 0.3,
			touchCurrentMa: 0.1,
			overallResult: InspectionResult.Passed,
			description: 'alles ok'
		});
		const device = new Device({ manufacturer: 'ACME', inspections: [inspection] });

		const rows = buildExportRows([record({ device })], 'Prüfung 2026');

		const dateColIndex = EXPORT_HEADERS.indexOf('Prüfdatum');
		expect(rows[0][EXPORT_HEADERS.indexOf('Prüfungsname')]).toBe('Prüfung 2026');
		expect(rows[0][dateColIndex]).toEqual(new Date(2026, 2, 15));
		expect(rows[0][EXPORT_HEADERS.indexOf('Status')]).toBe('In Betrieb');
		expect(rows[0][EXPORT_HEADERS.indexOf('Sichtprüfung')]).toBe('Bestanden');
		expect(rows[0][EXPORT_HEADERS.indexOf('Gesamtergebnis')]).toBe('Bestanden');
		expect(rows[0][EXPORT_HEADERS.indexOf('Hinweis')]).toBe('alles ok');
	});

	it('lässt die Prüfungs-Spalten leer, wenn keine Prüfung mit passendem inspectionName existiert', () => {
		const inspection = new Inspection({ inspectionName: 'Andere Prüfung', description: 'x' });
		const device = new Device({ manufacturer: 'ACME', inspections: [inspection] });

		const rows = buildExportRows([record({ device })], 'Prüfung 2026');

		expect(rows[0][EXPORT_HEADERS.indexOf('Hinweis')]).toBe('');
	});

	it('exportiert Geräte auch ohne gesetzte aktuellePruefung', () => {
		const device = new Device({ manufacturer: 'ACME' });
		const rows = buildExportRows([record({ device })], '');

		expect(rows[0][EXPORT_HEADERS.indexOf('Hinweis')]).toBe('');
	});

	it('überspringt Records ohne Gerät', () => {
		const rows = buildExportRows([{ id: 1, createdAt: 0, updatedAt: 0 }], 'Prüfung 2026');
		expect(rows).toEqual([]);
	});
});

describe('buildExportFilename', () => {
	it('nutzt pruefObjekt und Zeitstempel im Dateinamen', () => {
		const filename = buildExportFilename('Mein Prüfobjekt', new Date(2026, 0, 5, 8, 30, 0));
		expect(filename).toBe('Export_Mein_Prüfobjekt_2026-01-05_08-30-00.xlsx');
	});

	it('fällt auf einen generischen Namen zurück, wenn kein pruefObjekt gesetzt ist', () => {
		const filename = buildExportFilename(undefined, new Date(2026, 0, 5, 8, 30, 0));
		expect(filename).toBe('Export_der-erfasser-export_2026-01-05_08-30-00.xlsx');
	});
});

describe('createExportWorkbook', () => {
	it('erzeugt einen nicht-leeren Blob im xlsx-Format', async () => {
		const device = new Device({ manufacturer: 'ACME' });
		const blob = await createExportWorkbook([record({ device })], '');

		expect(blob.size).toBeGreaterThan(0);
		expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	});
});
