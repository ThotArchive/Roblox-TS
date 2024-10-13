/* eslint-disable no-bitwise */

/**
 * A class to approximate a random oracle taking an unsigned 32-bit integer as input and output.
 * Multiple unrolled versions of the hash function are provided as a performance optimization.
 */
export default class Hasher {
  private readonly seed: number; // Unsigned 32-bit integer.

  constructor(seed: string) {
    this.seed = parseInt(seed, 10);
  }

  hash(key: number[]): number {
    let hash = this.seed;

    for (let i = 0; i < key.length; i++) {
      let k = key[i];
      k = Math.imul(k, 0xcc9e2d51); // * (c1=0xcc9e2d51).
      k = (k << 15) | (k >>> 17); // ROL (r1=15).
      k = Math.imul(k >>> 0, 0x1b873593) >>> 0; // * (c2=0x1b873593).

      hash ^= k; // XOR k.
      hash = (hash << 13) | (hash >>> 19); // ROL (r2=19).
      hash = ((Math.imul(hash >>> 0, 5) >>> 0) + 0xe6546b64) >>> 0; // * (m=5) + (n=0xe6546b64).
    }

    hash ^= key.length * 4; // XOR len (in bytes).

    // Finalizer.
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;

    return hash >>> 0;
  }

  hashOneValue(key: number): number {
    let hash = this.seed;

    // Combine key with seed.
    let k = key;
    k = Math.imul(k, 0xcc9e2d51); // * (c1=0xcc9e2d51).
    k = (k << 15) | (k >>> 17); // ROL (r1=15).
    k = Math.imul(k >>> 0, 0x1b873593) >>> 0; // * (c2=0x1b873593).

    hash ^= k; // XOR k.
    hash = (hash << 13) | (hash >>> 19); // ROL (r2=19).
    hash = ((Math.imul(hash >>> 0, 5) >>> 0) + 0xe6546b64) >>> 0; // * (m=5) + (n=0xe6546b64).

    hash ^= 4; // XOR len (in bytes).

    // Finalizer.
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;

    return hash >>> 0;
  }

  hashTwoValues(key1: number, key2: number): number {
    let hash = this.seed;

    // Combine key1.
    let k = key1;
    k = Math.imul(k, 0xcc9e2d51); // * (c1=0xcc9e2d51).
    k = (k << 15) | (k >>> 17); // ROL (r1=15).
    k = Math.imul(k >>> 0, 0x1b873593) >>> 0; // * (c2=0x1b873593).

    hash ^= k; // XOR k.
    hash = (hash << 13) | (hash >>> 19); // ROL (r2=19).
    hash = ((Math.imul(hash >>> 0, 5) >>> 0) + 0xe6546b64) >>> 0; // * (m=5) + (n=0xe6546b64).

    // Combine key2.
    k = key2;
    k = Math.imul(k, 0xcc9e2d51); // * (c1=0xcc9e2d51).
    k = (k << 15) | (k >>> 17); // ROL (r1=15).
    k = Math.imul(k >>> 0, 0x1b873593) >>> 0; // * (c2=0x1b873593).

    hash ^= k; // XOR k.
    hash = (hash << 13) | (hash >>> 19); // ROL (r2=19).
    hash = ((Math.imul(hash >>> 0, 5) >>> 0) + 0xe6546b64) >>> 0; // * (m=5) + (n=0xe6546b64).

    hash ^= 8; // XOR len (in bytes).

    // Finalizer.
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;

    return hash >>> 0;
  }

  hashThreeValues(key1: number, key2: number, key3: number): number {
    let hash = this.seed;

    // Combine key1.
    let k = key1;
    k = Math.imul(k, 0xcc9e2d51); // * (c1=0xcc9e2d51).
    k = (k << 15) | (k >>> 17); // ROL (r1=15).
    k = Math.imul(k >>> 0, 0x1b873593) >>> 0; // * (c2=0x1b873593).

    hash ^= k; // XOR k.
    hash = (hash << 13) | (hash >>> 19); // ROL (r2=19).
    hash = ((Math.imul(hash >>> 0, 5) >>> 0) + 0xe6546b64) >>> 0; // * (m=5) + (n=0xe6546b64).

    // Combine key2.
    k = key2;
    k = Math.imul(k, 0xcc9e2d51); // * (c1=0xcc9e2d51).
    k = (k << 15) | (k >>> 17); // ROL (r1=15).
    k = Math.imul(k >>> 0, 0x1b873593) >>> 0; // * (c2=0x1b873593).

    hash ^= k; // XOR k.
    hash = (hash << 13) | (hash >>> 19); // ROL (r2=19).
    hash = ((Math.imul(hash >>> 0, 5) >>> 0) + 0xe6546b64) >>> 0; // * (m=5) + (n=0xe6546b64).

    // Combine key3.
    k = key3;
    k = Math.imul(k, 0xcc9e2d51); // * (c1=0xcc9e2d51).
    k = (k << 15) | (k >>> 17); // ROL (r1=15).
    k = Math.imul(k >>> 0, 0x1b873593) >>> 0; // * (c2=0x1b873593).

    hash ^= k; // XOR k.
    hash = (hash << 13) | (hash >>> 19); // ROL (r2=19).
    hash = ((Math.imul(hash >>> 0, 5) >>> 0) + 0xe6546b64) >>> 0; // * (m=5) + (n=0xe6546b64).

    hash ^= 12; // XOR len (in bytes).

    // Finalizer.
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;

    return hash >>> 0;
  }
}
