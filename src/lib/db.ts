const DB_NAME = 'der-erfasser-db';
const DB_VERSION = 2;
const STORE_NAME = 'records';
const IMAGE_STORE_NAME = 'images';

import { Devices, Device, Location, Metadata } from './models';

let hasMigratedLegacyRecords = false;

export type StoredImage = {
  id: string;
  blob: Blob;
  name?: string;
  type: string;
  size: number;
  createdAt: number;
};

// A record in the DB can hold arbitrary payloads. For new device-focused
// workflows we store a `devices` property that hydrates into the `Devices`
// model class on read.
export type NewRecord = {
  title?: string;
  notes?: string;
  image?: StoredImage | null;
  devices?: Devices | Record<string, unknown>;
  device?: Device | Record<string, unknown>;
  location?: Location | Record<string, unknown>;
  metadata?: Metadata | Record<string, unknown>;
};

export type StoredRecord = {
  id: number;
  createdAt: number;
  updatedAt: number;
} & NewRecord;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const ensureStores = (db: IDBDatabase) => {
      return db.objectStoreNames.contains(STORE_NAME) && db.objectStoreNames.contains(IMAGE_STORE_NAME);
    };

    const createStores = (version: number) => {
      const request = indexedDB.open(DB_NAME, version);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('createdAt', 'createdAt');
        }

        if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
          const imageStore = db.createObjectStore(IMAGE_STORE_NAME, {
            keyPath: 'id'
          });
          imageStore.createIndex('createdAt', 'createdAt');
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    };

    const openCurrent = () => {
      const request = indexedDB.open(DB_NAME);

      request.onsuccess = () => {
        const db = request.result;
        if (ensureStores(db)) {
          resolve(db);
        } else {
          const nextVersion = db.version + 1;
          db.close();
          createStores(nextVersion);
        }
      };
      request.onerror = () => reject(request.error);
    };

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

      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        const imageStore = db.createObjectStore(IMAGE_STORE_NAME, {
          keyPath: 'id'
        });
        imageStore.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      if (request.error?.name === 'VersionError') {
        openCurrent();
        return;
      }
      reject(request.error);
    };
  });
}

async function withObjectStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
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

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return withObjectStore(STORE_NAME, mode, callback);
}

function hydrateRecord(record: StoredRecord): StoredRecord {
  const copy: StoredRecord = { ...record };

  if (copy.devices) {
    copy.devices = new Devices(copy.devices as Partial<Devices>);
  }

  if (copy.device) {
    copy.device = new Device(copy.device as Partial<Device>);
  }

  if (copy.location) {
    copy.location = new Location(copy.location as Partial<Location>);
  }

  if (copy.metadata) {
    copy.metadata = new Metadata(copy.metadata as Partial<Metadata>);
  }

  return copy;
}

async function migrateLegacyDeviceEntries(): Promise<void> {
  if (hasMigratedLegacyRecords) {
    return;
  }

  const raw = await withStore<StoredRecord[]>('readonly', (store) => store.getAll() as IDBRequest<StoredRecord[]>);
  const legacyRecords = raw.filter((rec) => rec.devices && Array.isArray((rec.devices as any).entries));

  if (legacyRecords.length === 0) {
    hasMigratedLegacyRecords = true;
    return;
  }

  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    for (const record of raw) {
      if (record.devices && Array.isArray((record.devices as any).entries)) {
        const devices = new Devices(record.devices as Partial<Devices>);
        for (const entry of devices.entries) {
          const payload: NewRecord = {
            title: record.title,
            notes: record.notes,
            metadata: record.metadata ? new Metadata(record.metadata as Partial<Metadata>) : undefined,
            device: entry.device,
            location: entry.location
          };
          store.add(JSON.parse(JSON.stringify(payload)));
        }
        store.delete(record.id);
      }
    }

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });

  hasMigratedLegacyRecords = true;
}

export async function getRecords(): Promise<StoredRecord[]> {
  await migrateLegacyDeviceEntries();
  const raw = await withStore<StoredRecord[]>('readonly', (store) => store.getAll() as IDBRequest<StoredRecord[]>);
  const records = raw.map(hydrateRecord);
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export function addRecord(record: NewRecord): Promise<IDBValidKey> {
  const payload = {
    ...record,
    devices: record.devices ? JSON.parse(JSON.stringify(record.devices)) : undefined,
    device: record.device ? JSON.parse(JSON.stringify(record.device)) : undefined,
    location: record.location ? JSON.parse(JSON.stringify(record.location)) : undefined,
    metadata: record.metadata ? JSON.parse(JSON.stringify(record.metadata)) : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return withStore<IDBValidKey>('readwrite', (store) => store.add(payload));
}

export async function updateRecord(record: StoredRecord): Promise<IDBValidKey> {
  const payload = {
    ...record,
    devices: record.devices ? JSON.parse(JSON.stringify(record.devices)) : undefined,
    device: record.device ? JSON.parse(JSON.stringify(record.device)) : undefined,
    location: record.location ? JSON.parse(JSON.stringify(record.location)) : undefined,
    metadata: record.metadata ? JSON.parse(JSON.stringify(record.metadata)) : undefined,
    updatedAt: Date.now()
  };

  return withStore<IDBValidKey>('readwrite', (store) => store.put(payload));
}

export async function saveImageBlob(blob: Blob, name?: string): Promise<StoredImage> {
  const image: StoredImage = {
    id: crypto.randomUUID?.() ?? `img-${Math.random().toString(36).slice(2)}`,
    blob,
    name,
    type: blob.type || 'image/jpeg',
    size: blob.size,
    createdAt: Date.now()
  };

  await withObjectStore<IDBValidKey>(IMAGE_STORE_NAME, 'readwrite', (store) => store.put(image));
  return image;
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  if (!id) {
    return undefined;
  }

  return withObjectStore<StoredImage | undefined>(IMAGE_STORE_NAME, 'readonly', (store) => store.get(id) as IDBRequest<StoredImage | undefined>);
}

export async function getAllImages(): Promise<StoredImage[]> {
  return withObjectStore<StoredImage[]>(IMAGE_STORE_NAME, 'readonly', (store) => store.getAll() as IDBRequest<StoredImage[]>);
}

export function deleteRecord(id: number): Promise<undefined> {
  return withStore<undefined>('readwrite', (store) => store.delete(id));
}

export function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Datenbanklöschung wurde blockiert. Bitte schließen Sie alle offenen Tabs oder Apps.'));
  });
}

export async function restoreDatabaseFromBackup(records: StoredRecord[], images: StoredImage[]): Promise<void> {
  await deleteDatabase();
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, IMAGE_STORE_NAME], 'readwrite');
    const recordStore = transaction.objectStore(STORE_NAME);
    const imageStore = transaction.objectStore(IMAGE_STORE_NAME);

    for (const record of records) {
      recordStore.put(record as any);
    }

    for (const image of images) {
      imageStore.put(image);
    }

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export function clearRecords(): Promise<undefined> {
  return withStore<undefined>('readwrite', (store) => store.clear());
}

export async function getRecord(id: number): Promise<StoredRecord | undefined> {
  const rec = await withStore<StoredRecord | undefined>('readonly', (store) => store.get(id) as IDBRequest<StoredRecord | undefined>);

  if (!rec) return undefined;

  return hydrateRecord(rec);
}

/**
 * Update an existing device record, or add a new device record if none exists.
 * If `recordId` is null the function creates a new record for the device.
 */
export async function upsertDevice(recordId: number | null, deviceData: Partial<Device> & { id?: string }, locationData?: Partial<Location>): Promise<IDBValidKey> {
  const incoming = new Device({ ...deviceData, inspection: true });
  const payload: NewRecord = {
    device: incoming,
    location: locationData ? new Location(locationData) : undefined
  };

  if (recordId == null) {
    return addRecord(payload);
  }

  const raw = await withStore<any>('readwrite', (store) => store.get(recordId) as IDBRequest<any>);

  if (!raw) {
    return addRecord(payload);
  }

  raw.device = JSON.parse(JSON.stringify(incoming));
  if (locationData) {
    raw.location = JSON.parse(JSON.stringify(new Location(locationData)));
  }
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
