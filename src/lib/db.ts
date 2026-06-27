const DB_NAME = 'der-erfasser-db';
const DB_VERSION = 1;
const STORE_NAME = 'records';

export type StoredImage = {
  blob: Blob;
  name: string;
  type: string;
  size: number;
};

export type NewRecord = {
  title: string;
  notes: string;
  image: StoredImage | null;
};

export type StoredRecord = NewRecord & {
  id: number;
  createdAt: number;
  updatedAt: number;
};

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
  const records = await withStore<StoredRecord[]>('readonly', (store) => store.getAll() as IDBRequest<StoredRecord[]>);
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export function addRecord(record: NewRecord): Promise<IDBValidKey> {
  return withStore<IDBValidKey>('readwrite', (store) => {
    return store.add({
      ...record,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  });
}

export function deleteRecord(id: number): Promise<undefined> {
  return withStore<undefined>('readwrite', (store) => store.delete(id));
}

export function clearRecords(): Promise<undefined> {
  return withStore<undefined>('readwrite', (store) => store.clear());
}
