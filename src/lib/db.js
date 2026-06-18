const DB_NAME = 'der-erfasser-db';
const DB_VERSION = 1;
const STORE_NAME = 'records';

function openDatabase() {
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

async function withStore(mode, callback) {
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

export async function getRecords() {
  const records = await withStore('readonly', (store) => store.getAll());
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export function addRecord(record) {
  return withStore('readwrite', (store) => {
    return store.add({
      ...record,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  });
}

export function deleteRecord(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

export function clearRecords() {
  return withStore('readwrite', (store) => store.clear());
}
