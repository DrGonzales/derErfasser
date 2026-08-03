import type { WorkBook } from 'xlsx';
import { Device, Location, ProtectionClass } from './models';
import { addRecord } from './db';
import { rememberLocation } from './stores/locationSuggestions.svelte';

/**
 * Zielfeld eines Excel-Spalten-Mappings: entweder ein Feld des Device- oder
 * des Location-Modells. `target` legt fest, in welches Objekt der Wert beim
 * Import geschrieben wird, `type` steuert die Typkonvertierung.
 */
export type ImportTargetField = {
	key: string;
	label: string;
	target: 'device' | 'location';
	type: 'string' | 'number' | 'protectionClass';
};

/**
 * Alle Felder, die beim Excel-Import einer Excel-Spalte zugeordnet werden
 * können. Reihenfolge bestimmt die Anzeige-Reihenfolge im Mapping-Dialog.
 */
export const IMPORT_TARGET_FIELDS: ImportTargetField[] = [
	{ key: 'type', label: 'Typ', target: 'device', type: 'string' },
	{ key: 'manufacturer', label: 'Hersteller', target: 'device', type: 'string' },
	{ key: 'model', label: 'Modell', target: 'device', type: 'string' },
	{ key: 'serialNumber', label: 'Seriennummer', target: 'device', type: 'string' },
	{ key: 'protectionClass', label: 'Schutzklasse (I/II/III)', target: 'device', type: 'protectionClass' },
	{ key: 'ratedVoltage', label: 'Bemessungsspannung', target: 'device', type: 'number' },
	{ key: 'ratedPower', label: 'Bemessungsleistung', target: 'device', type: 'number' },
	{ key: 'locationName', label: 'Standortname', target: 'location', type: 'string' },
	{ key: 'building', label: 'Gebäude', target: 'location', type: 'string' },
	{ key: 'room', label: 'Raum', target: 'location', type: 'string' }
];

/** Ordnet jedem Zielfeld-Key den Index der zu verwendenden Excel-Spalte zu (oder null = nicht zugeordnet). */
export type ColumnMapping = Record<string, number | null>;

export type ParsedExcelSheet = {
	headers: string[];
	rows: unknown[][];
};

/**
 * Liest die erste Tabelle (Sheet) einer Excel-/CSV-Datei ein. Die erste Zeile
 * wird als Kopfzeile (Spaltennamen) interpretiert, alle folgenden Zeilen sind
 * Datenzeilen. Leere Zeilen (alle Zellen leer) werden verworfen.
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelSheet> {
	// xlsx wird bewusst erst hier dynamisch nachgeladen, damit der initiale
	// App-Bundle nicht mit dem (recht großen) Excel-Parsing-Code aufgebläht wird.
	const XLSX = await import('xlsx');
	const buffer = await file.arrayBuffer();
	const workbook: WorkBook = XLSX.read(buffer, { type: 'array' });

	const firstSheetName = workbook.SheetNames[0];
	if (!firstSheetName) {
		throw new Error('Die Datei enthält kein lesbares Tabellenblatt.');
	}

	const sheet = workbook.Sheets[firstSheetName];
	const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

	if (raw.length === 0) {
		throw new Error('Die Tabelle enthält keine Daten.');
	}

	const [headerRow, ...dataRows] = raw;
	const headers = headerRow.map((value, index) => {
		const text = value == null ? '' : String(value).trim();
		return text || `Spalte ${index + 1}`;
	});

	const rows = dataRows.filter((row) =>
		row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
	);

	return { headers, rows };
}

/**
 * Wandelt den Rohwert einer Excel-Zelle abhängig vom Zieltyp in den
 * passenden Wert um. Ungültige Werte führen zu einem Eintrag in `warnings`
 * und werden durch einen sinnvollen Leerwert ersetzt, statt die gesamte
 * Zeile zu verwerfen.
 */
function convertValue(field: ImportTargetField, rawValue: unknown, warnings: string[]): string | number {
	const text = rawValue == null ? '' : String(rawValue).trim();

	if (field.type === 'number') {
		if (text === '') return 0;
		const parsed = Number(text.replace(',', '.'));
		if (Number.isNaN(parsed)) {
			warnings.push(`„${field.label}“: Wert „${text}“ ist keine gültige Zahl, wurde als 0 übernommen.`);
			return 0;
		}
		return parsed;
	}

	if (field.type === 'protectionClass') {
		if (text === '') return '';
		if (text === ProtectionClass.I || text === ProtectionClass.II || text === ProtectionClass.III) {
			return text;
		}
		warnings.push(`„${field.label}“: Wert „${text}“ ist keine gültige Schutzklasse (I/II/III), wurde leer gelassen.`);
		return '';
	}

	return text;
}

export type MappedDeviceRow = {
	rowIndex: number;
	device: Partial<Device>;
	location: Partial<Location>;
	warnings: string[];
};

/**
 * Wendet das Spalten-Mapping auf eine einzelne Datenzeile an und liefert die
 * daraus resultierenden Device-/Location-Teilobjekte sowie eventuelle
 * Warnungen (z. B. ungültige Zahlen) zurück. `rowIndex` ist 0-basiert
 * (Index innerhalb der Datenzeilen, ohne Kopfzeile).
 */
export function mapRowToDeviceAndLocation(row: unknown[], mapping: ColumnMapping, rowIndex: number): MappedDeviceRow {
	const device: Partial<Device> = {};
	const location: Partial<Location> = {};
	const warnings: string[] = [];

	for (const field of IMPORT_TARGET_FIELDS) {
		const columnIndex = mapping[field.key];
		if (columnIndex == null) continue;

		const value = convertValue(field, row[columnIndex], warnings);
		if (field.target === 'device') {
			(device as Record<string, unknown>)[field.key] = value;
		} else {
			(location as Record<string, unknown>)[field.key] = value;
		}
	}

	return { rowIndex, device, location, warnings };
}

/** Wendet das Mapping auf alle Datenzeilen an (Vorschau/Import-Grundlage). */
export function mapRowsToDevices(rows: unknown[][], mapping: ColumnMapping): MappedDeviceRow[] {
	return rows.map((row, index) => mapRowToDeviceAndLocation(row, mapping, index));
}

export type ImportResult = {
	successCount: number;
	errorCount: number;
	errors: string[];
};

/** Anzahl der Zeilen, nach denen der Hauptthread kurz freigegeben wird (siehe importRows). */
const YIELD_EVERY_N_ROWS = 20;

/** Gibt den Hauptthread kurz frei, damit z. B. eine Fortschrittsanzeige neu rendern kann. */
function yieldToMainThread(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Importiert alle gemappten Zeilen als neue Geräte-Datensätze. Jede Zeile
 * wird unabhängig verarbeitet (Teilimport): schlägt eine Zeile fehl, wird sie
 * übersprungen und der Import mit den restlichen Zeilen fortgesetzt.
 * Erfolgreich importierte Standorte werden sofort den Standort-Vorschlägen
 * hinzugefügt, damit sie danach z. B. im Geräte-Editor als Autocomplete
 * verfügbar sind.
 *
 * Über `onProgress` kann der Fortschritt (aktuelle Zeile / Gesamtanzahl)
 * verfolgt werden. Damit eine gebundene Fortschrittsanzeige tatsächlich neu
 * rendern kann, wird der Hauptthread alle `YIELD_EVERY_N_ROWS` Zeilen kurz
 * freigegeben.
 */
export async function importRows(
	mappedRows: MappedDeviceRow[],
	onProgress?: (current: number, total: number) => void
): Promise<ImportResult> {
	let successCount = 0;
	const errors: string[] = [];
	const total = mappedRows.length;

	for (let i = 0; i < mappedRows.length; i++) {
		const mappedRow = mappedRows[i];
		const rowLabel = `Zeile ${mappedRow.rowIndex + 2}`; // +2: 1-basiert + Kopfzeile

		try {
			const device = new Device(mappedRow.device);
			const location = new Location(mappedRow.location);
			await addRecord({ device, location });
			rememberLocation(location);
			successCount++;

			for (const warning of mappedRow.warnings) {
				errors.push(`${rowLabel}: ${warning}`);
			}
		} catch (err) {
			errors.push(`${rowLabel}: ${err instanceof Error ? err.message : String(err)}`);
		}

		onProgress?.(i + 1, total);

		if ((i + 1) % YIELD_EVERY_N_ROWS === 0) {
			await yieldToMainThread();
		}
	}

	return { successCount, errorCount: mappedRows.length - successCount, errors };
}
