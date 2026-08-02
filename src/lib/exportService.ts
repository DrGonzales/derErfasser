import type { WorkBook, WorkSheet } from 'xlsx';
import type { StoredRecord } from './db';
import {
	Device,
	Location,
	InspectionResult,
	DeviceStatus,
	inspectionResultLabels,
	deviceStatusLabels,
	protectionClassLabels
} from './models';
import { sanitizeFilenamePart, formatTimestampForFilename } from './filenameUtils';

/**
 * Kopfzeile der Export-Tabelle. Maßeinheiten stehen in der Überschrift,
 * die Werte in der Tabelle selbst bleiben ohne Einheit (reine Zahlen/Text).
 * Die ersten Spalten entsprechen dem Gerät (analog zu IMPORT_TARGET_FIELDS in
 * importService.ts), danach folgen die Prüfungs-Spalten der aktuellen Prüfung.
 */
const EXPORT_HEADERS: string[] = [
	'Typ',
	'Hersteller',
	'Modell',
	'Seriennummer',
	'Schutzklasse (I/II/III)',
	'Bemessungsspannung (V)',
	'Bemessungsleistung (W)',
	'Standortname',
	'Gebäude',
	'Raum',
	'Prüfpflichtig',
	'Ausgemustert',
	'Prüfungsname',
	'Prüfdatum',
	'Status',
	'Sichtprüfung',
	'Funktionsprüfung',
	'Messung',
	'Schutzleiterwiderstand (Ω)',
	'Isolationswiderstand (MΩ)',
	'Ersatzableitstrom (mA)',
	'Berührungsstrom (mA)',
	'Gesamtergebnis',
	'Hinweis'
];

function boolLabel(value: boolean): string {
	return value ? 'Ja' : 'Nein';
}

function resultLabel(value: InspectionResult): string {
	return inspectionResultLabels[value] ?? '';
}

/**
 * Wandelt einen ISO-Datumsstring ("YYYY-MM-DD") in ein echtes JS-Date um,
 * damit die Zelle beim Export als Excel-Datum (nicht als Text) geschrieben
 * werden kann. Ungültige/leere Werte liefern null.
 */
function parseIsoDate(value: string): Date | null {
	if (!value || !value.trim()) return null;
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
	if (!match) return null;
	const [, y, m, d] = match;
	const date = new Date(Number(y), Number(m) - 1, Number(d));
	return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Baut die Datenzeilen für den Export. Jede Zeile beginnt mit den
 * Gerätefeldern, gefolgt von den Feldern der Prüfung, deren inspectionName
 * mit `aktuellePruefung` übereinstimmt (falls vorhanden, sonst leere Zellen).
 */
export function buildExportRows(records: StoredRecord[], aktuellePruefung: string): unknown[][] {
	const normalizedCurrent = (aktuellePruefung ?? '').trim();

	return records
		.filter((record) => record.device)
		.map((record) => {
			const device = record.device as Device;
			const location = record.location as Location | undefined;

			const inspection = normalizedCurrent
				? device.inspections?.find((ins) => (ins.inspectionName ?? '').trim() === normalizedCurrent)
				: undefined;

			const deviceCells: unknown[] = [
				device.type ?? '',
				device.manufacturer ?? '',
				device.model ?? '',
				device.serialNumber ?? '',
				device.protectionClass ?? '',
				device.ratedVoltage ?? 0,
				device.ratedPower ?? 0,
				location?.locationName ?? '',
				location?.building ?? '',
				location?.room ?? '',
				boolLabel(device.inspection),
				boolLabel(device.deactivated)
			];

			const inspectionCells: unknown[] = inspection
				? [
						inspection.inspectionName ?? '',
						parseIsoDate(inspection.inspectionDate),
						deviceStatusLabels[inspection.status] ?? '',
						resultLabel(inspection.visualTestResult),
						resultLabel(inspection.functionTestResult),
						resultLabel(inspection.measurementTestResult),
						inspection.protectiveConductorResistanceOhm ?? 0,
						inspection.isolationResistanceMohm ?? 0,
						inspection.substituteLeakageCurrentMa ?? 0,
						inspection.touchCurrentMa ?? 0,
						resultLabel(inspection.overallResult),
						inspection.description ?? ''
					]
				: ['', '', '', '', '', '', '', '', '', '', '', ''];

			return [...deviceCells, ...inspectionCells];
		});
}

/**
 * Erzeugt die Export-Arbeitsmappe (.xlsx) mit allen Geräten und – sofern
 * vorhanden – den Werten der aktuellen Prüfung (meta.aktuellePruefung).
 * Bilder und PDFs werden bewusst nicht berücksichtigt.
 */
export async function createExportWorkbook(
	records: StoredRecord[],
	aktuellePruefung: string
): Promise<Blob> {
	// xlsx wird bewusst erst hier dynamisch nachgeladen, damit der initiale
	// App-Bundle nicht mit dem (recht großen) Excel-Code aufgebläht wird.
	const XLSX = await import('xlsx');

	const rows = buildExportRows(records, aktuellePruefung);
	const sheet: WorkSheet = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS, ...rows], { cellDates: true });

	// Prüfdatum-Spalte als Excel-Datum formatieren.
	const dateColIndex = EXPORT_HEADERS.indexOf('Prüfdatum');
	for (let r = 0; r < rows.length; r++) {
		const cellRef = XLSX.utils.encode_cell({ r: r + 1, c: dateColIndex });
		const cell = sheet[cellRef];
		if (cell && cell.v instanceof Date) {
			cell.t = 'd';
			cell.z = 'dd.mm.yyyy';
		}
	}

	const workbook: WorkBook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, sheet, 'Geräte');

	const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx', cellDates: true });
	return new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
}

/**
 * Baut den Dateinamen für den Excel-Export. Nutzt meta.pruefObjekt als
 * Basis, gefolgt von Datum und Uhrzeit, analog zu buildReportFilename und
 * buildBackupFilename.
 */
export function buildExportFilename(pruefObjekt: string | undefined, date: Date = new Date()): string {
	const base = pruefObjekt?.trim() ? sanitizeFilenamePart(pruefObjekt) : 'der-erfasser-export';
	return `Export_${base}_${formatTimestampForFilename(date)}.xlsx`;
}

// Nur für Tests/Wiederverwendung exportiert.
export { EXPORT_HEADERS };

// Referenziert protectionClassLabels, um sicherzustellen, dass zukünftige
// Änderungen an den Labels hier auffallen (aktuell wird die Schutzklasse als
// Rohwert I/II/III exportiert, analog zum Import).
void protectionClassLabels;
void DeviceStatus;
