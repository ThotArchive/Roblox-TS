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
  key: string,
): Promise<CryptoKeyPair | null> => {
  try {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return new Promise((resolve, reject) => {
      databaseName = dbName;
      databaseObjectStoreName = objStoreName;
      const request = indexedDB.open(databaseName, 1);
      request.onsuccess = (event: Event) => {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const db = (event.target as IDBOpenDBRequest).result;
        try {
          const transaction = db.transaction(databaseObjectStoreName, "readonly");
          const objectStore = transaction.objectStore(databaseObjectStoreName);
          const getRequest = objectStore.get(key);
          getRequest.onsuccess = (e: Event) => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const keyPair = (e.target as IDBRequest).result as CryptoKeyPair;
            resolve(keyPair);
          };

          getRequest.onerror = () => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors, @typescript-eslint/consistent-type-assertions
            reject((event.target as IDBRequest).error);
          };
          transaction.oncomplete = () => {
            db.close();
          };
        } catch (transactionError) {
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(transactionError);
        }
      };
      request.onerror = (event: Event) => {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors, @typescript-eslint/consistent-type-assertions
        reject((event.target as IDBRequest).error);
      };
      // This is to handle the case when objectStore is manually deleted by a user.
      // based on https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
      // If the database doesn't already exist, it is created by the open operation,
      // then an onupgradeneeded event is triggered and you create the database schema in the handler for this event.
      request.onupgradeneeded = () => {
        const db = request.result;
        // creating duplicate object stores, or attempting to create a new object store outside
        // of this callback throws an exception. IndexedDB's API design predates promises, which
        // is why it uses this style of asynchronous programming.
        if (!db.objectStoreNames.contains(databaseObjectStoreName)) {
          db.createObjectStore(databaseObjectStoreName);
        }
      };
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("get value from indexedDB error: ", e);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as Promise<CryptoKeyPair>;
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
  value: CryptoKeyPair,
  // eslint-disable-next-line consistent-return
): Promise<void> => {
  try {
    databaseName = dbName;
    databaseObjectStoreName = objStoreName;
    const request = indexedDB.open(databaseName, 1);

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return new Promise<void>((resolve, reject) => {
      request.onerror = () => {
        // eslint-disable-next-line no-console
        console.error(`indexeddb request error`);
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors, prefer-promise-reject-errors
        reject();
      };
      // only handle create objectStore within onupgradeneed
      request.onupgradeneeded = () => {
        const db = request.result;
        // creating duplicate object stores, or attempting to create a new object store outside
        // of this callback throws an exception. IndexedDB's API design predates promises, which
        // is why it uses this style of asynchronous programming.
        if (!db.objectStoreNames.contains(databaseObjectStoreName)) {
          db.createObjectStore(databaseObjectStoreName);
        }
      };
      // request will success even no object store is found.
      request.onsuccess = event => {
        try {
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(databaseObjectStoreName, "readwrite");
          const objectStore = transaction.objectStore(databaseObjectStoreName);
          const setRequest = objectStore.put(value, key);
          setRequest.onsuccess = () => {
            resolve();
          };
        } catch {
          // eslint-disable-next-line no-console
          console.error(`indexeddb transaction error`);
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors, prefer-promise-reject-errors
          reject();
        }
      };
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("updating indexedDB error: ", e);
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
  key: string,
): Promise<void> => {
  try {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return new Promise((resolve, reject) => {
      databaseName = dbName;
      databaseObjectStoreName = objStoreName;
      const request = indexedDB.open(databaseName, 1);
      request.onsuccess = (event: Event) => {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(databaseObjectStoreName)) {
          db.close();
          resolve();
        } else {
          const transaction = db.transaction(databaseObjectStoreName, "readwrite");
          const objectStore = transaction.objectStore(databaseObjectStoreName);
          const deleteRequest = objectStore.delete(key);

          deleteRequest.onsuccess = () => {
            db.close();
            resolve();
          };

          deleteRequest.onerror = () => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/prefer-promise-reject-errors
            reject((event.target as IDBRequest).error);
          };

          transaction.oncomplete = () => {
            db.close();
          };
        }
      };

      request.onerror = (event: Event) => {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/prefer-promise-reject-errors
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("delete crypto record error: ", e);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as Promise<void>;
  }
};

/**
 * @returns {Promise<void>} Nothing.
 */
export const deleteCryptoDB = async (): Promise<void> => {
  try {
    const databaseDeleteRequest = indexedDB.deleteDatabase(databaseName);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return new Promise((resolve, reject) => {
      databaseDeleteRequest.onerror = () => {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(databaseDeleteRequest.error);
      };
      databaseDeleteRequest.onsuccess = () => {
        resolve();
      };
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("delete crypto db error: ", e);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as Promise<void>;
  }
};
