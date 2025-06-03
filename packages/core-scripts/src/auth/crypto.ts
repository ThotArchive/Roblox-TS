/**
 * A namespace containing sensible-default abstractions around JS crypto functions (e.g. by
 * specifying algorithms and formats to use).
 */

const SIGNATURE_KEY_SPEC = {
  name: "ECDSA",
  namedCurve: "P-256",
};

const SIGNATURE_ALGORITHM_SPEC = {
  name: "ECDSA",
  hash: { name: "SHA-256" },
};

// FNV-1a 32-bit hash constants
const FNV_PRIME = 0x01000193;
const FNV_OFFSET_BASIS = 0x811c9dc5;

/**
 * Converts the passed string to an array buffer.
 *
 * @param {string} rawString
 * @returns An array buffer.
 */
export const stringToArrayBuffer = (rawString: string): ArrayBuffer => {
  const bytes = new Uint8Array(rawString.length);
  for (let i = 0; i < rawString.length; i += 1) {
    // BUG: `charCodeAt` returns a u16, but `bytes` is a u8 array.
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
  let rawString = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (const byte of bytes) {
    rawString += String.fromCharCode(byte);
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
export const generateSigningKeyPairUnextractable = async (): Promise<CryptoKeyPair> =>
  crypto.subtle.generateKey(SIGNATURE_KEY_SPEC, false, ["sign"]);

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
    stringToArrayBuffer(data),
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
  const publicKeyArrayBuffer = await crypto.subtle.exportKey("spki", publicKey);
  return arrayBufferToBase64String(publicKeyArrayBuffer);
};

export const textEncode = (str: string): Uint8Array => new TextEncoder().encode(str);

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

/**
 * Hash string with FNV-1a 32-bit hash function and return the 32-bit FNV-1a hash value.
 *
 * @param {string} str
 * @returns {string} The 32-bit FNV-1a hash of the input string in hex value.
 */
export const hashStringWithFnv1a32 = (str: string): string => {
  const bytes = textEncode(str); // Convert string to UTF-8 bytes

  let hash = FNV_OFFSET_BASIS;
  for (const byte of bytes) {
    // eslint-disable-next-line no-bitwise
    hash ^= byte; // Process each byte

    // eslint-disable-next-line no-bitwise
    hash = Math.imul(hash, FNV_PRIME); // Use Math.imul for 32-bit multiplication
  }

  // Convert to hexadecimal and ensure lowercase
  // eslint-disable-next-line no-bitwise
  let hex = (hash >>> 0).toString(16).toLowerCase();

  // Manually prepend zeros to ensure the string is 8 characters long
  while (hex.length < 8) {
    hex = `0${hex}`;
  }

  return hex;
};
