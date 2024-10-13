/**
 * A namespace containing sensible-default abstractions around JS crypto functions (e.g. by
 * specifying algorithms and formats to use).
 *
 * Exposed in Roblox Core Utility
 */

import { getHbaMeta } from '../constants/hbaMeta';
import { deleteUserCryptoKeyPairUponLogout } from '../utils/logoutUtil';
import { textEncode } from '../utils/browserCompatibleUtil';
import { generateSecureAuthIntent } from '../http/secureAuthIntentHttpUtil';
// algorithm constants

/** @type{EcKeyGenParams & EcKeyImportParams} */
const SIGNATURE_KEY_SPEC = {
  name: 'ECDSA',
  namedCurve: 'P-256'
};

/** @type{EcdsaParams} */
const SIGNATURE_ALGORITHM_SPEC = {
  name: 'ECDSA',
  hash: { name: 'SHA-256' }
};

/**
 * Converts the passed string to an array buffer.
 *
 * @param {string} rawString
 * @returns An array buffer.
 */
export const stringToArrayBuffer = (rawString: string): ArrayBuffer => {
  const bytes = new Uint8Array(rawString.length);
  for (let i = 0; i < rawString.length; i++) {
    bytes[i] = rawString.charCodeAt(i);
  }
  return bytes.buffer;
};
/**
 * Converts the passed array buffer to a base-64-encoded string.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns A base-64-encoded string.
 */
export const arrayBufferToBase64String = (arrayBuffer: ArrayBuffer): string => {
  let rawString = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    rawString += String.fromCharCode(bytes[i]);
  }
  return btoa(rawString);
};

/**
 * Converts the passed base-64-encoded string to an array buffer.
 *
 * @param {string} base64String
 * @returns An array buffer.
 */
export const base64StringToArrayBuffer = (base64String: string): ArrayBuffer => {
  const rawString = atob(base64String);
  return stringToArrayBuffer(rawString);
};
/**
 * Generates a key pair for signing messages.
 *
 * @returns An ECDSA key pair.
 */
export const generateSigningKeyPairUnextractable = async (): Promise<CryptoKeyPair> => {
  return crypto.subtle.generateKey(SIGNATURE_KEY_SPEC, false, ['sign']);
};

/**
 * Signs the passed data with the passed private key.
 *
 * @param {CryptoKey} privateKey The private key.
 * @param {string} data The string-encoded data to sign.
 * @returns A base-64-encoded signature.
 */
export const sign = async (privateKey: CryptoKey, data: string): Promise<string> => {
  const bufferResult = await crypto.subtle.sign(
    SIGNATURE_ALGORITHM_SPEC,
    privateKey,
    stringToArrayBuffer(data)
  );
  return arrayBufferToBase64String(bufferResult);
};

/**
 * Exports a public key from a JS crypto key into the SPKI format (DER-encoded ASN.1).
 *
 * @param {CryptoKey} publicKey
 * @returns The passed public key in SPKI format (DER-encoded ASN.1).
 */
export const exportPublicKeyAsSpki = async (publicKey: CryptoKey): Promise<string> => {
  const publicKeyArrayBuffer = await crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64String(publicKeyArrayBuffer);
};

/**
 * hash string with sha256 and return the hashed base64 string.
 *
 * @param {string} str
 * @returns {Promise<string>}.
 */
export const hashStringWithSha256 = async (str: string): Promise<string> => {
  const msgUnit8 = textEncode(str);
  const hashBuffer = await crypto.subtle.digest(SIGNATURE_ALGORITHM_SPEC.hash.name, msgUnit8);
  return arrayBufferToBase64String(hashBuffer);
};

export default {
  // crypto utils
  arrayBufferToBase64String,
  base64StringToArrayBuffer,
  exportPublicKeyAsSpki,
  generateSigningKeyPairUnextractable,
  hashStringWithSha256,
  sign,
  stringToArrayBuffer,
  // constants
  getHbaMeta,
  // feature utils
  deleteUserCryptoKeyPairUponLogout,
  // SAI util
  generateSecureAuthIntent
};
