const DB_NAME = 'der-erfasser-db';
const DB_VERSION = 1;
const STORE_NAME = 'records';

import { Devices, Device, DeviceEntry, Location } from './models';

export type StoredImage = {
  blob: Blob;
  name: string;
  type: string;
  size: number;
};

// A record in the DB can hold arbitrary payloads. For new device-focused
// workflows we store a `devices` property that hydrates into the `Devices`
// model class on read.
export type NewRecord = {
  title?: string;
  notes?: string;
  image?: StoredImage | null;
  devices?: Devices | Record<string, unknown>;
};

export type StoredRecord = {
  id: number;
  createdAt: number;
  updatedAt: number;
} & NewRecord;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getRecords(): Promise<StoredRecord[]> {
  const raw = await withStore<StoredRecord[]>('readonly', (store) => store.getAll() as IDBRequest<StoredRecord[]>);

  // Hydrate `devices` into model classes when present.
  const records = raw.map((r) => {
    const copy: StoredRecord = { ...r };

    if (copy.devices) {
      copy.devices = new Devices(copy.devices as Partial<Devices>);
    }

    return copy;
  });

  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export function addRecord(record: NewRecord): Promise<IDBValidKey> {
  const payload = {
    ...record,
    // Store a plain representation of `devices`.
    devices: record.devices ? JSON.parse(JSON.stringify(record.devices)) : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return withStore<IDBValidKey>('readwrite', (store) => store.add(payload));
}

export function deleteRecord(id: number): Promise<undefined> {
  return withStore<undefined>('readwrite', (store) => store.delete(id));
}

export function clearRecords(): Promise<undefined> {
  return withStore<undefined>('readwrite', (store) => store.clear());
}

export async function getRecord(id: number): Promise<StoredRecord | undefined> {
  const rec = await withStore<StoredRecord | undefined>('readonly', (store) => store.get(id) as IDBRequest<StoredRecord | undefined>);

  if (!rec) return undefined;

  if (rec.devices) {
    rec.devices = new Devices(rec.devices as Partial<Devices>);
  }

  return rec;
}

/**
 * Update an existing device inside a record, or add it if not present.
 * If `recordId` is null the function creates a new record and stores the
 * device as the first entry.
 */
export async function upsertDevice(recordId: number | null, deviceData: Partial<Device> & { id?: string }, locationData?: Partial<Location>): Promise<IDBValidKey> {
  if (recordId == null) {
    const devices = new Devices({ entries: [new DeviceEntry({ device: new Device(deviceData), location: new Location(locationData) })] });
    return addRecord({ devices });
  }

  const raw = await withStore<any>('readwrite', (store) => store.get(recordId) as IDBRequest<any>);

  if (!raw) {
    // If record not found, create new one with the device.
    return addRecord({ devices: new Devices({ entries: [new DeviceEntry({ device: new Device(deviceData), location: new Location(locationData) })] }) });
  }

  // Ensure we have a plain object for devices.entries
  const devicesObj = raw.devices ? new Devices(raw.devices as Partial<Devices>) : new Devices({ entries: [] });

  const incoming = new Device(deviceData as Partial<Device>);

  // Try to find existing entry by `id` if provided, otherwise by serialNumber.
  let idx = -1;
  if (incoming && (incoming as any).id) {
    idx = devicesObj.entries.findIndex((e) => (e.device as any).id === (incoming as any).id);
  }

  if (idx === -1 && incoming.serialNumber) {
    idx = devicesObj.entries.findIndex((e) => e.device.serialNumber === incoming.serialNumber);
  }

  if (idx !== -1) {
    // Replace device details, keep location unless provided
    const existing = devicesObj.entries[idx];
    existing.device = incoming;
    if (locationData) {
      existing.location = new Location(locationData);
    }
  } else {
    devicesObj.entries.push(new DeviceEntry({ device: incoming, location: new Location(locationData) }));
  }

  raw.devices = JSON.parse(JSON.stringify(devicesObj));
  raw.updatedAt = Date.now();

  return withStore<IDBValidKey>('readwrite', (store) => store.put(raw));
}

export class DBService {
  async getRecords() {
    return getRecords();
  }

  async getRecord(id: number) {
    return getRecord(id);
  }

  async addRecord(r: NewRecord) {
    return addRecord(r);
  }

  async upsertDevice(recordId: number | null, deviceData: Partial<Device> & { id?: string }, locationData?: Partial<Location>) {
    return upsertDevice(recordId, deviceData, locationData);
  }
}

export const DB = new DBService();
