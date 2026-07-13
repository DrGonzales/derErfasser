// Aggregiert die im Bestand vorkommenden Prüfungsnamen (Inspection.inspectionName)
// über alle Geräte/Records hinweg, damit diese im Prüfobjekt-Formular
// (Feld "Aktuelle Prüfung") als Vorschläge (Dropdown mit optionaler Eingabe /
// <datalist>) angeboten werden können.
//
// Aus Performance-Gründen wird die Aggregation einmalig beim Start der App
// vorgenommen (siehe `initInspectionNameSuggestions`, aufgerufen z.B. in
// AppRoot.svelte) und danach zur Laufzeit inkrementell mitgeführt: Jeder
// neu vergebene Prüfungsname wird per `rememberInspectionName` ergänzt, ohne
// dass erneut der komplette Datenbestand gelesen werden muss.

import { getRecords } from '../db';

type DeviceLike = {
	inspections?: { inspectionName?: string }[];
};

let inspectionNames = $state<string[]>([]);

let initPromise: Promise<void> | null = null;

function sortUnique(values: Iterable<string>): string[] {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'de'));
}

function addUnique(list: string[], rawValue: string): string[] {
	const value = rawValue.trim();
	if (!value || list.includes(value)) {
		return list;
	}
	return sortUnique([...list, value]);
}

/**
 * Liest einmalig alle vorhandenen Datensätze aus der Datenbank und befüllt
 * die Vorschlagsliste mit den distincten `inspectionName`-Werten aller
 * Inspektionen aller Geräte. Nachfolgende Aufrufe liefern denselben, bereits
 * laufenden/abgeschlossenen Promise zurück (keine erneute DB-Abfrage), es sei
 * denn `resetInspectionNameSuggestions` wurde zuvor aufgerufen (z.B. nach
 * Backup-Restore oder Löschen aller Daten).
 */
export function initInspectionNameSuggestions(): Promise<void> {
	if (!initPromise) {
		initPromise = (async () => {
			const records = await getRecords();
			const names = new Set<string>();

			for (const record of records) {
				const device = record.device as DeviceLike | undefined;
				for (const inspection of device?.inspections ?? []) {
					if (inspection.inspectionName?.trim()) {
						names.add(inspection.inspectionName.trim());
					}
				}
			}

			inspectionNames = sortUnique(names);
		})();
	}

	return initPromise;
}

/**
 * Trägt einen neu eingegebenen Prüfungsnamen in die Vorschlagsliste ein,
 * damit er sofort (ohne Neuladen der App) für zukünftige Eingaben zur
 * Verfügung steht.
 */
export function rememberInspectionName(name: string): void {
	if (name) inspectionNames = addUnique(inspectionNames, name);
}

/**
 * Setzt die Aggregation zurück, sodass beim nächsten
 * `initInspectionNameSuggestions` erneut aus der Datenbank gelesen wird.
 * Sollte nach Vorgängen aufgerufen werden, die den Datenbestand grundlegend
 * ändern (z.B. Restore, "Alle Daten löschen").
 */
export function resetInspectionNameSuggestions(): void {
	inspectionNames = [];
	initPromise = null;
}

export const inspectionNameSuggestions = {
	get names() {
		return inspectionNames;
	}
};
