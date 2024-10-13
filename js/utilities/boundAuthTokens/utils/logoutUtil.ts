// a util function to handle hardware backed authentication upon users logout

import { getHbaMeta } from '../constants/hbaMeta';
import { deleteCryptoKeyPair } from '../store/indexedDB';

const hbaMeta = getHbaMeta();
const { hbaIndexedDBName, hbaIndexedDBObjStoreName } = hbaMeta;
/**
 * Delete crypto key pair upon users logout
 *
 * @returns {Promise<void>}
 */
export const deleteUserCryptoKeyPairUponLogout = async (key: string): Promise<void> => {
  if (hbaIndexedDBName && hbaIndexedDBObjStoreName) {
    await deleteCryptoKeyPair(hbaIndexedDBName, hbaIndexedDBObjStoreName, key);
  }
};

export default {
  deleteUserCryptoKeyPairUponLogout
};
