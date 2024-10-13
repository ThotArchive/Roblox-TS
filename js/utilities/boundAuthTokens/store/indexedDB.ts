/**
 * A util lib for indexed DB
 * Exposed via Roblox Core Utility DataStore
 */
let databaseName: string;
let databaseObjectStoreName: string;
/**
 * @param {string} dbName
 * @param {string} objStoreName
 * @param {string} key
 * @returns {Promise<CryptoKeyPair>} Value for key.
 */
export const getCryptoKeyPair = async (
  dbName: string,
  objStoreName: string,
  key: string
): Promise<CryptoKeyPair | null> => {
  try {
    return new Promise((resolve, reject) => {
      databaseName = dbName;
      databaseObjectStoreName = objStoreName;
      const request = indexedDB.open(databaseName, 1);
      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        try {
          const transaction = db.transaction(databaseObjectStoreName, 'readonly');
          const objectStore = transaction.objectStore(databaseObjectStoreName);
          const getRequest = objectStore.get(key);
          getRequest.onsuccess = (e: Event) => {
            const keyPair = (e.target as IDBRequest).result as CryptoKeyPair;
            resolve(keyPair);
          };

          getRequest.onerror = (e: Event) => {
            reject((event.target as IDBRequest).error);
          };
          transaction.oncomplete = (e: Event) => {
            db.close();
          };
        } catch (transactionError) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(transactionError);
        }
      };
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
      // This is to handle the case when objectStore is manually deleted by a user.
      // based on https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
      // If the database doesn't already exist, it is created by the open operation,
      // then an onupgradeneeded event is triggered and you create the database schema in the handler for this event.
      request.onupgradeneeded = event => {
        const db = request.result;
        if (!db.objectStoreNames.contains(databaseObjectStoreName)) {
          const objectStore = db.createObjectStore(databaseObjectStoreName);
        }
      };
    });
  } catch (e) {
    console.warn('get value from indexedDB error: ', e);
    return <Promise<CryptoKeyPair>>{};
  }
};

/**
 * @param {string} dbName
 * @param {string} objStoreName
 * @param {string} key
 * @param {CryptoKeyPair} value
 * @returns {<void>} Nothing.
 */
export const putCryptoKeyPair = async (
  dbName: string,
  objStoreName: string,
  key: string,
  value: CryptoKeyPair
  // eslint-disable-next-line consistent-return
): Promise<void> => {
  try {
    databaseName = dbName;
    databaseObjectStoreName = objStoreName;
    const request = indexedDB.open(databaseName, 1);

    return new Promise<void>((resolve, reject) => {
      request.onerror = event => {
        console.error(`indexeddb request error`);
        reject();
      };
      // only handle create objectStore within onupgradeneed
      request.onupgradeneeded = event => {
        const db = request.result;
        if (!db.objectStoreNames.contains(databaseObjectStoreName)) {
          const objectStore = db.createObjectStore(databaseObjectStoreName);
        }
      };
      // request will success even no object store is found.
      request.onsuccess = event => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(databaseObjectStoreName, 'readwrite');
          const objectStore = transaction.objectStore(databaseObjectStoreName);
          const setRequest = objectStore.put(value, key);
          setRequest.onsuccess = () => {
            resolve();
          };
        } catch (error) {
          console.error(`indexeddb transaction error`);
          reject();
        }
      };
    });
  } catch (e) {
    console.warn('updating indexedDB error: ', e);
  }
};

/**
 * @param {string} dbName
 * @param {string} objStoreName
 * @param {string} key
 * @returns {Promise<void>} Nothing.
 */
export const deleteCryptoKeyPair = async (
  dbName: string,
  objStoreName: string,
  key: string
): Promise<void> => {
  try {
    return new Promise((resolve, reject) => {
      databaseName = dbName;
      databaseObjectStoreName = objStoreName;
      const request = indexedDB.open(databaseName, 1);
      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(databaseObjectStoreName)) {
          db.close();
          resolve();
        } else {
          const transaction = db.transaction(databaseObjectStoreName, 'readwrite');
          const objectStore = transaction.objectStore(databaseObjectStoreName);
          const deleteRequest = objectStore.delete(key);

          deleteRequest.onsuccess = () => {
            db.close();
            resolve();
          };

          deleteRequest.onerror = (e: Event) => {
            reject((event.target as IDBRequest).error);
          };

          transaction.oncomplete = (e: Event) => {
            db.close();
          };
        }
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (e) {
    console.warn('delete crypto record error: ', e);
    return <Promise<void>>{};
  }
};

/**
 * @returns {Promise<void>} Nothing.
 */
export const deleteCryptoDB = async (): Promise<void> => {
  try {
    const databaseDeleteRequest = indexedDB.deleteDatabase(databaseName);
    return new Promise((resolve, reject) => {
      databaseDeleteRequest.onerror = () => reject(databaseDeleteRequest.error);
      databaseDeleteRequest.onsuccess = () => resolve();
    });
  } catch (e) {
    console.warn('delete crypto db error: ', e);
    return <Promise<void>>{};
  }
};

export default {
  getCryptoKeyPair,
  putCryptoKeyPair,
  deleteCryptoDB,
  deleteCryptoKeyPair
};
