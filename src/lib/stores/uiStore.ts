import { writable } from 'svelte/store';

export type EntriesSortKey =
  | 'manufacturer'
  | 'model'
  | 'serialNumber'
  | 'locationName'
  | 'building'
  | 'room';

export type EntriesSortDirection = 'ascending' | 'descending';

export type EntriesSort = {
  key: EntriesSortKey;
  direction: EntriesSortDirection;
};

// UI-related small stores
export const entriesFilter = writable('');
export const entriesSort = writable<EntriesSort>({
  key: 'manufacturer',
  direction: 'ascending'
});
