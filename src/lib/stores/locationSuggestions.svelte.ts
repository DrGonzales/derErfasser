// Aggregiert die im Bestand vorkommenden Standort-Werte (Standortname,
// Gebäude, Raum), damit diese im DeviceEditor als Vorschläge (Dropdown mit
// optionaler Eingabe / <datalist>) angeboten werden können.
//
// Aus Performance-Gründen wird die Aggregation einmalig beim Start der App
// vorgenommen (siehe `initLocationSuggestions`, aufgerufen z.B. in
// AppRoot.svelte) und danach zur Laufzeit inkrementell mitgeführt: Jeder
// neu gespeicherte Standort wird per `rememberLocation` ergänzt, ohne dass
// erneut der komplette Datenbestand gelesen werden muss.

import { getRecords } from '../db';

type LocationLike = {
	locationName?: string;
	building?: string;
	room?: string;
};

let locationNames = $state<string[]>([]);
let buildings = $state<string[]>([]);
let rooms = $state<string[]>([]);

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
 * die Vorschlagslisten. Nachfolgende Aufrufe liefern denselben, bereits
 * laufenden/abgeschlossenen Promise zurück (keine erneute DB-Abfrage), es sei
 * denn `resetLocationSuggestions` wurde zuvor aufgerufen (z.B. nach
 * Backup-Restore oder Löschen aller Daten).
 */
export function initLocationSuggestions(): Promise<void> {
	if (!initPromise) {
		initPromise = (async () => {
			const records = await getRecords();
			const names = new Set<string>();
			const blds = new Set<string>();
			const rms = new Set<string>();

			for (const record of records) {
				const location = record.location as LocationLike | undefined;
				if (location?.locationName?.trim()) names.add(location.locationName.trim());
				if (location?.building?.trim()) blds.add(location.building.trim());
				if (location?.room?.trim()) rms.add(location.room.trim());
			}

			locationNames = sortUnique(names);
			buildings = sortUnique(blds);
			rooms = sortUnique(rms);
		})();
	}

	return initPromise;
}

/**
 * Trägt einen neu eingegebenen Standort in die Vorschlagslisten ein, damit
 * er sofort (ohne Neuladen der App) für zukünftige Eingaben zur Verfügung
 * steht.
 */
export function rememberLocation(location: LocationLike): void {
	if (location.locationName) locationNames = addUnique(locationNames, location.locationName);
	if (location.building) buildings = addUnique(buildings, location.building);
	if (location.room) rooms = addUnique(rooms, location.room);
}

/**
 * Setzt die Aggregation zurück, sodass beim nächsten `initLocationSuggestions`
 * erneut aus der Datenbank gelesen wird. Sollte nach Vorgängen aufgerufen
 * werden, die den Datenbestand grundlegend ändern (z.B. Restore, "Alle Daten
 * löschen").
 */
export function resetLocationSuggestions(): void {
	locationNames = [];
	buildings = [];
	rooms = [];
	initPromise = null;
}

export const locationSuggestions = {
	get locationNames() {
		return locationNames;
	},
	get buildings() {
		return buildings;
	},
	get rooms() {
		return rooms;
	}
};
