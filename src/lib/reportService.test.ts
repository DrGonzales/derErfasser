import { describe, expect, it, vi } from 'vitest';
import {
	createReportPdf,
	buildReportFilename,
	resolveColor,
	formatMeasurementValue,
	type ReportChartSection,
	type ReportDeviceEntry
} from './reportService';
import { InspectionResult, DeviceStatus } from './models';
import type { Meta, Inspection } from './models';

// chartRenderer nutzt die native Canvas-2D-API, die in jsdom nicht implementiert ist.
// Für den Service-Test genügt ein valides minimales PNG (1x1 transparent) als Platzhalter,
// da jsPDF beim Einfügen eines Bilds dessen PNG-Signatur tatsächlich decodiert.
const MINIMAL_PNG_DATA_URL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

vi.mock('./chartRenderer', () => ({
	renderDonutToDataUrl: vi.fn(() => MINIMAL_PNG_DATA_URL)
}));

function makeMeta(overrides: Partial<Meta> = {}): Meta {
	return {
		id: 'singleton',
		pruefObjekt: 'Musterhaus',
		namen: 'Max Mustermann',
		anschrift: 'Musterstr. 1',
		ort: '12345 Musterstadt',
		aktuellePruefung: 'Prüfung 2026',
		...overrides
	} as Meta;
}

const sampleChartSections: ReportChartSection[] = [
	{
		title: 'Prüfstatus',
		total: 5,
		segments: [
			{ label: 'Aktuell geprüft', value: 3, color: 'var(--color-success)' },
			{ label: 'Offen', value: 2, color: 'var(--color-warning)' }
		]
	},
	{
		title: 'Prüfergebnis',
		total: 0,
		segments: []
	}
];

function makeInspection(overrides: Partial<Inspection> = {}): Inspection {
	return {
		isolationResistanceMohm: 250,
		touchCurrentMa: 0.05,
		visualTestResult: InspectionResult.Passed,
		measurementTestResult: InspectionResult.Passed,
		functionTestResult: InspectionResult.Passed,
		overallResult: InspectionResult.Passed,
		status: DeviceStatus.Vorhanden,
		description: '',
		inspectionDate: '2026-07-17',
		inspectionName: 'Prüfung 2026',
		pictures: [],
		...overrides
	} as Inspection;
}

function makeDeviceEntry(
	overrides: Partial<ReportDeviceEntry['device']> = {},
	hasLocation = true,
	inspection: Inspection | undefined = makeInspection()
): ReportDeviceEntry {
	return {
		device: {
			manufacturer: 'ACME',
			model: 'X-1000',
			serialNumber: 'SN-123',
			...overrides
		} as ReportDeviceEntry['device'],
		location: hasLocation
			? ({ locationName: 'Hauptgebäude', building: 'Bau A', room: 'Raum 101' } as ReportDeviceEntry['location'])
			: undefined,
		inspection
	};
}

describe('resolveColor', () => {
	it('bildet bekannte CSS-Variablen auf Hex-Farben ab', () => {
		expect(resolveColor('var(--color-success)')).toBe('#16a34a');
		expect(resolveColor('var(--color-danger)')).toBe('#dc2626');
	});

	it('gibt unbekannte Farbwerte unverändert zurück', () => {
		expect(resolveColor('#123456')).toBe('#123456');
	});

	it('fällt bei unbekannten CSS-Variablen auf eine neutrale Farbe zurück', () => {
		expect(resolveColor('var(--color-unknown)')).toBe('#667970');
	});
});

describe('formatMeasurementValue', () => {
	it('rundet auf maximal zwei Nachkommastellen', () => {
		expect(formatMeasurementValue(0.30000000000000004)).toBe('0.3');
		expect(formatMeasurementValue(1.005)).toBe('1');
		expect(formatMeasurementValue(250.126)).toBe('250.13');
	});

	it('gibt ganze Zahlen ohne Nachkommastellen zurück', () => {
		expect(formatMeasurementValue(250)).toBe('250');
		expect(formatMeasurementValue(0)).toBe('0');
	});

	it('funktioniert auch mit sehr kleinen und sehr großen Werten', () => {
		expect(formatMeasurementValue(0.0001)).toBe('0');
		expect(formatMeasurementValue(999999.999)).toBe('1000000');
	});
});

describe('createReportPdf', () => {
	it('erzeugt ein PDF-Blob mit nur einer Seite, wenn keine Diagrammdaten übergeben werden', async () => {
		const blob = await createReportPdf(makeMeta());
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.type).toBe('application/pdf');
	});

	it('erzeugt ein PDF-Blob mit Deckblatt und Diagrammseite, wenn chartSections übergeben werden', async () => {
		const blob = await createReportPdf(makeMeta(), sampleChartSections);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('funktioniert auch ohne Meta-Daten', async () => {
		const blob = await createReportPdf(undefined, sampleChartSections);
		expect(blob).toBeInstanceOf(Blob);
	});

	it('erzeugt ein PDF-Blob mit Ergebnisliste, wenn passedDevices übergeben werden', async () => {
		const blob = await createReportPdf(makeMeta(), [], [makeDeviceEntry(), makeDeviceEntry({ model: 'Y-2000' }, false)]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit allen drei Abschnitten (Deckblatt, Diagramme, Ergebnisliste)', async () => {
		const blob = await createReportPdf(makeMeta(), sampleChartSections, [makeDeviceEntry()]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob auch mit vielen Geräten (Seitenumbruch-Logik)', async () => {
		const manyDevices: ReportDeviceEntry[] = Array.from({ length: 30 }, (_, i) =>
			makeDeviceEntry({ serialNumber: `SN-${i}` })
		);
		const blob = await createReportPdf(makeMeta(), [], manyDevices);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit Hinweis-Zeile, wenn description gefüllt ist', async () => {
		const withDescription = makeDeviceEntry({}, true, makeInspection({ description: 'Auffälligkeit am Gehäuse' }));
		const blob = await createReportPdf(makeMeta(), [], [withDescription]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob auch ohne Inspection-Daten am Eintrag', async () => {
		const withoutInspection = makeDeviceEntry({}, true, undefined);
		const blob = await createReportPdf(makeMeta(), [], [withoutInspection]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit abweichendem Gerätezustand in der Status-Spalte', async () => {
		const withStatus = makeDeviceEntry({}, true, makeInspection({ status: DeviceStatus.Defekt }));
		const blob = await createReportPdf(makeMeta(), [], [withStatus]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob auch mit extremen Messwerten in der Ergebnis-Tabelle', async () => {
		const extremeValues = makeDeviceEntry(
			{},
			true,
			makeInspection({
				isolationResistanceMohm: 999999.999,
				touchCurrentMa: 0.0001,
				overallResult: InspectionResult.Failed,
				visualTestResult: InspectionResult.NoResult
			})
		);
		const blob = await createReportPdf(makeMeta(), [], [extremeValues]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit Ergebnisliste "Nicht bestanden", wenn failedDevices übergeben werden', async () => {
		const failedDevice = makeDeviceEntry({}, true, makeInspection({ overallResult: InspectionResult.Failed }));
		const blob = await createReportPdf(makeMeta(), [], [], [failedDevice]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit Ergebnisliste "Kein Ergebnis", wenn noResultDevices übergeben werden', async () => {
		const noResultDevice = makeDeviceEntry({}, true, makeInspection({ overallResult: InspectionResult.NoResult }));
		const blob = await createReportPdf(makeMeta(), [], [], [], [noResultDevice]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit allen drei Ergebnislisten gleichzeitig', async () => {
		const passed = makeDeviceEntry({ serialNumber: 'SN-P' }, true, makeInspection({ overallResult: InspectionResult.Passed }));
		const failed = makeDeviceEntry({ serialNumber: 'SN-F' }, true, makeInspection({ overallResult: InspectionResult.Failed }));
		const noResult = makeDeviceEntry(
			{ serialNumber: 'SN-N' },
			true,
			makeInspection({ overallResult: InspectionResult.NoResult })
		);
		const blob = await createReportPdf(makeMeta(), sampleChartSections, [passed], [failed], [noResult]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit Geräteliste "Nicht auffindbar", wenn notFoundDevices übergeben werden', async () => {
		const notFoundDevice = makeDeviceEntry(
			{ serialNumber: 'SN-NF' },
			true,
			makeInspection({ status: DeviceStatus.NichtAuffindbar })
		);
		const blob = await createReportPdf(makeMeta(), [], [], [], [], [notFoundDevice]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit Geräteliste "Außer Betrieb", wenn outOfServiceDevices übergeben werden', async () => {
		const outOfServiceDevice = makeDeviceEntry(
			{ serialNumber: 'SN-AB' },
			true,
			makeInspection({ status: DeviceStatus.AusserBetrieb })
		);
		const blob = await createReportPdf(makeMeta(), [], [], [], [], [], [outOfServiceDevice]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit Hinweis-Zeile in der Geräteliste "Nicht auffindbar"', async () => {
		const withDescription = makeDeviceEntry(
			{},
			true,
			makeInspection({ status: DeviceStatus.NichtAuffindbar, description: 'Seit letzter Prüfung nicht auffindbar' })
		);
		const blob = await createReportPdf(makeMeta(), [], [], [], [], [withDescription]);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('erzeugt ein PDF-Blob mit allen fünf Geräte-Abschnitten gleichzeitig', async () => {
		const passed = makeDeviceEntry({ serialNumber: 'SN-P' }, true, makeInspection({ overallResult: InspectionResult.Passed }));
		const failed = makeDeviceEntry({ serialNumber: 'SN-F' }, true, makeInspection({ overallResult: InspectionResult.Failed }));
		const noResult = makeDeviceEntry(
			{ serialNumber: 'SN-N' },
			true,
			makeInspection({ overallResult: InspectionResult.NoResult })
		);
		const notFound = makeDeviceEntry(
			{ serialNumber: 'SN-NF' },
			true,
			makeInspection({ status: DeviceStatus.NichtAuffindbar })
		);
		const outOfService = makeDeviceEntry(
			{ serialNumber: 'SN-AB' },
			true,
			makeInspection({ status: DeviceStatus.AusserBetrieb })
		);
		const blob = await createReportPdf(
			makeMeta(),
			sampleChartSections,
			[passed],
			[failed],
			[noResult],
			[notFound],
			[outOfService]
		);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});
});

describe('buildReportFilename', () => {
	it('baut den Dateinamen anhand von pruefObjekt und Zeitstempel', () => {
		const date = new Date(2026, 6, 17, 10, 30, 0);
		expect(buildReportFilename('Musterhaus', date)).toBe('Bericht_Musterhaus_2026-07-17_10-30-00.pdf');
	});

	it('sanitisiert Sonderzeichen und Leerzeichen im pruefObjekt', () => {
		const date = new Date(2026, 6, 17, 10, 30, 0);
		expect(buildReportFilename('Haus A/B: Keller', date)).toBe('Bericht_Haus_A_B__Keller_2026-07-17_10-30-00.pdf');
	});

	it('fällt auf einen generischen Namen zurück, wenn kein pruefObjekt gesetzt ist', () => {
		const date = new Date(2026, 6, 17, 10, 30, 0);
		expect(buildReportFilename(undefined, date)).toBe('Bericht_der-erfasser-bericht_2026-07-17_10-30-00.pdf');
	});
});
