import { cryptoUtil, dataStores } from 'core-roblox-utilities';

import { DeviceMeta } from 'Roblox';
import { TLoginParams, TLoginWithVerificationTokenParams } from '../../types/loginTypes';

import { TSignupParams } from '../../types/signupTypes';

import { getServerNonce } from '../services/hbaService';

import { sendSAIMissingEvent, sendSAISuccessEvent } from '../../utils/eventUtils';
import { getErrorMessage } from './errorUtil';
import { storeClientKeyPair } from './storeUtils';

const { getHbaMeta } = cryptoUtil;

const hbaMeta = getHbaMeta();

const {
  hbaIndexedDBName,
  hbaIndexedDBObjStoreName,
  hbaIndexedDBKeyName,
  isSecureAuthenticationIntentEnabled
} = hbaMeta;

const { hbacIndexedDB } = dataStores;

const SEPARATOR = '|';

type TAuthParamsCryptoKeyPairComposite = {
  authParams: TLoginParams | TSignupParams | TLoginWithVerificationTokenParams;
  clientKeyPair?: CryptoKeyPair;
};
/**
 * Build signup & login request with SecureAuthIntent
 *
 * @returns an auth request parameter
 */
export const buildAuthParamsWithSecureAuthIntentAndClientKeyPair = async (
  params: TLoginParams | TSignupParams | TLoginWithVerificationTokenParams
): Promise<TAuthParamsCryptoKeyPairComposite> => {
  if (!isSecureAuthenticationIntentEnabled || (DeviceMeta && DeviceMeta().isInApp)) {
    sendSAIMissingEvent({ message: 'FeatureDisabled' });
    return {
      authParams: params
    };
  }

  try {
    // prerequisite: get serverNonce
    const serverNonce = await getServerNonce();
    if (!serverNonce) {
      // eslint-disable-next-line no-console
      console.warn('No hba server nonce available.');
      sendSAIMissingEvent({ message: 'NonceUnavailable' });
      return {
        authParams: params
      };
    }
    // step 1 try to get or generate clientKeyPair
    let clientKeyPair = {} as CryptoKeyPair;
    if (hbaIndexedDBName && hbaIndexedDBObjStoreName && hbaIndexedDBKeyName) {
      try {
        clientKeyPair = await hbacIndexedDB.getCryptoKeyPair(
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
      await hbacIndexedDB.deleteCryptoDB();
      await storeClientKeyPair(clientKeyPair);
      clientKeyPair = await hbacIndexedDB.getCryptoKeyPair(
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
    // step 3 attach it to a login params
    const authParams = params;
    authParams.secureAuthenticationIntent = secureAuthIntent;
    sendSAISuccessEvent();
    return {
      authParams: params,
      clientKeyPair
    };
  } catch (e) {
    sendSAIMissingEvent({ message: getErrorMessage(e) });
    return {
      authParams: params
    };
  }
};

export default {
  buildAuthParamsWithSecureAuthIntentAndClientKeyPair
};
