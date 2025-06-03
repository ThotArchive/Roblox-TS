import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { hbaMeta } from "./hba";
import { generateSigningKeyPairUnextractable, exportPublicKeyAsSpki, sign } from "./crypto";
import { getServerNonce } from "./internal/hbaService";
import { deleteCryptoDB, getCryptoKeyPair, putCryptoKeyPair } from "./internal/indexedDB";
import { sendSAIMissingEvent, sendSAISuccessEvent } from "./internal/events";
import { SecureAuthIntent } from "./internal/types";
import { getErrorMessage } from "./internal/errorMessage";

const {
  hbaIndexedDBName,
  hbaIndexedDBObjStoreName,
  hbaIndexedDBKeyName,
  isSecureAuthenticationIntentEnabled,
} = hbaMeta();

const SEPARATOR = "|";

/**
 * Put CryptoKeyPairs to indexedDB
 *
 * @returns Promise<void>
 */
const storeClientKeyPair = async (clientKeyPair: CryptoKeyPair): Promise<void> => {
  if (hbaIndexedDBName && hbaIndexedDBObjStoreName && hbaIndexedDBKeyName) {
    await putCryptoKeyPair(
      hbaIndexedDBName,
      hbaIndexedDBObjStoreName,
      hbaIndexedDBKeyName,
      clientKeyPair,
    ).catch(() => {
      console.error("putting cryptoKeyPair error");
    });
  }
};

/**
 * Build signup & login request with SecureAuthIntent
 *
 * @returns an auth request parameter
 */
export const generateSecureAuthIntent = async (): Promise<SecureAuthIntent> => {
  if (!isSecureAuthenticationIntentEnabled || getDeviceMeta()?.isInApp) {
    // @ts-expect-error TODO: old, migrated code
    return null;
  }

  try {
    // prerequisite: get serverNonce
    const serverNonce = await getServerNonce();
    if (!serverNonce) {
      console.warn("No hba server nonce available.");
      sendSAIMissingEvent({ message: "NonceUnavailable" });
      // @ts-expect-error TODO: old, migrated code
      return null;
    }
    // step 1 try to get or generate clientKeyPair
    let clientKeyPair: CryptoKeyPair | null = null;
    if (hbaIndexedDBName && hbaIndexedDBObjStoreName && hbaIndexedDBKeyName) {
      try {
        clientKeyPair = await getCryptoKeyPair(
          hbaIndexedDBName,
          hbaIndexedDBObjStoreName,
          hbaIndexedDBKeyName,
        );
      } catch {
        // return empty keyPair upon exception
        clientKeyPair = null;
      }
    }
    if (clientKeyPair == null || Object.keys(clientKeyPair).length === 0) {
      clientKeyPair = await generateSigningKeyPairUnextractable();
      // For reliability, always re-create the IDB if we could not get a key pair.
      // Note that `deleteCryptoDB` never throws.
      await deleteCryptoDB();
      await storeClientKeyPair(clientKeyPair);
      clientKeyPair = await getCryptoKeyPair(
        hbaIndexedDBName,
        hbaIndexedDBObjStoreName,
        hbaIndexedDBKeyName,
      );
    }
    // step 2 sign the payload with client private key.
    // @ts-expect-error TODO: assume clientKeyPair != null because of generation above
    const clientPublicKey = await exportPublicKeyAsSpki(clientKeyPair.publicKey);
    const clientEpochTimestamp = Math.floor(Date.now() / 1000);
    const payload = [clientPublicKey, clientEpochTimestamp, serverNonce].join(SEPARATOR);

    // @ts-expect-error TODO: assume clientKeyPair != null because of generation above
    const saiSignature = await sign(clientKeyPair.privateKey, payload);
    const secureAuthIntent = {
      clientPublicKey,
      clientEpochTimestamp,
      serverNonce,
      saiSignature,
    };
    // step 3 send event and return
    sendSAISuccessEvent();
    return secureAuthIntent;
  } catch (e) {
    sendSAIMissingEvent({ message: getErrorMessage(e) });
    // @ts-expect-error TODO: old, migrated code
    return null;
  }
};
