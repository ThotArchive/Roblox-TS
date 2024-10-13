import { DeviceMeta } from 'Roblox';
import { getHbaMeta } from '../constants/hbaMeta';
import cryptoUtil from '../crypto/cryptoUtil';
import { getServerNonce } from '../services/hbaService';
import { deleteCryptoDB, getCryptoKeyPair } from '../store/indexedDB';
import { TSecureAuthIntent } from '../types/hbaTypes';
import { sendSAIMissingEvent, sendSAISuccessEvent } from '../utils/eventUtil';
import { storeClientKeyPair } from '../utils/storeUtil';
import { getErrorMessage } from './errorUtil';

const hbaMeta = getHbaMeta();

const {
  hbaIndexedDBName,
  hbaIndexedDBObjStoreName,
  hbaIndexedDBKeyName,
  isSecureAuthenticationIntentEnabled
} = hbaMeta;

const SEPARATOR = '|';

/**
 * Build signup & login request with SecureAuthIntent
 *
 * @returns an auth request parameter
 */
export const generateSecureAuthIntent = async (): Promise<TSecureAuthIntent> => {
  if (!isSecureAuthenticationIntentEnabled || (DeviceMeta && DeviceMeta().isInApp)) {
    return null;
  }

  try {
    // prerequisite: get serverNonce
    const serverNonce = await getServerNonce();
    if (!serverNonce) {
      // eslint-disable-next-line no-console
      console.warn('No hba server nonce available.');
      sendSAIMissingEvent({ message: 'NonceUnavailable' });
      return null;
    }
    // step 1 try to get or generate clientKeyPair
    let clientKeyPair = {} as CryptoKeyPair;
    if (hbaIndexedDBName && hbaIndexedDBObjStoreName && hbaIndexedDBKeyName) {
      try {
        clientKeyPair = await getCryptoKeyPair(
          hbaIndexedDBName,
          hbaIndexedDBObjStoreName,
          hbaIndexedDBKeyName
        );
      } catch {
        // return empty keyPair upon exception
        clientKeyPair = {} as CryptoKeyPair;
      }
    }
    if (!clientKeyPair || Object.keys(clientKeyPair).length === 0) {
      clientKeyPair = await cryptoUtil.generateSigningKeyPairUnextractable();
      // For reliability, always re-create the IDB if we could not get a key pair.
      // Note that `deleteCryptoDB` never throws.
      await deleteCryptoDB();
      await storeClientKeyPair(clientKeyPair);
      clientKeyPair = await getCryptoKeyPair(
        hbaIndexedDBName,
        hbaIndexedDBObjStoreName,
        hbaIndexedDBKeyName
      );
    }
    // step 2 sign the payload with client private key.
    const clientPublicKey = await cryptoUtil.exportPublicKeyAsSpki(clientKeyPair.publicKey);
    const clientEpochTimestamp = Math.floor(Date.now() / 1000);
    const payload = [clientPublicKey, clientEpochTimestamp, serverNonce].join(SEPARATOR);

    const saiSignature = await cryptoUtil.sign(clientKeyPair.privateKey, payload);
    const secureAuthIntent = {
      clientPublicKey,
      clientEpochTimestamp,
      serverNonce,
      saiSignature
    };
    // step 3 send event and return
    sendSAISuccessEvent();
    return secureAuthIntent;
  } catch (e) {
    sendSAIMissingEvent({ message: getErrorMessage(e) });
    return null;
  }
};

export default {
  generateSecureAuthIntent
};
