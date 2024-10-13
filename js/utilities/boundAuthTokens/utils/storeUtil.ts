import { getHbaMeta } from '../constants/hbaMeta';

import { putCryptoKeyPair } from '../store/indexedDB';

const hbaMeta = getHbaMeta();

const { hbaIndexedDBName, hbaIndexedDBObjStoreName, hbaIndexedDBKeyName } = hbaMeta;

/**
 * Put CryptoKeyPairs to indexedDB
 *
 * @returns Promise<void>
 */
export const storeClientKeyPair = async (clientKeyPair: CryptoKeyPair): Promise<void> => {
  if (hbaIndexedDBName && hbaIndexedDBObjStoreName && hbaIndexedDBKeyName) {
    await putCryptoKeyPair(
      hbaIndexedDBName,
      hbaIndexedDBObjStoreName,
      hbaIndexedDBKeyName,
      clientKeyPair
    ).catch(error => {
      console.error('putting cryptoKeyPair error');
    });
  }
};

export default {
  storeClientKeyPair
};
