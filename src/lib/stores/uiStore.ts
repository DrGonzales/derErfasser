import { writable } from 'svelte/store';

export type EntriesSortKey =
  | 'manufacturer'
  | 'model'
  | 'serialNumber'
  | 'locationName'
  | 'building'
  | 'room';

type EntriesSortDirection = 'ascending' | 'descending';

export type EntriesSort = {
  key: EntriesSortKey;
  direction: EntriesSortDirection;
};

// 'current' = grün (abgearbeitet), 'outdated' = gelb (noch offen), 'all' = alle, 'deactivated' = rot (ausgemustert)
export type EntriesStatusFilter = 'current' | 'outdated' | 'all' | 'deactivated';

// UI-related small stores
export const entriesFilter = writable('');
export const entriesSort = writable<EntriesSort>({
  key: 'manufacturer',
  direction: 'ascending'
});
export const entriesStatusFilter = writable<EntriesStatusFilter>('outdated');
