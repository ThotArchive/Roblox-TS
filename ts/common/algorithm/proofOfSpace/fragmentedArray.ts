/* eslint-disable no-bitwise */

/**
 * A class that wraps a list of Uint32Arrays to allow transparent
 * access to an ordered list of values with underlying blocked storage.
 *
 * Type of values must be unsigned 32-bit integers.
 */
export default class FragmentedArray {
  // Internal buffer and properties.
  private blocks: Uint32Array[];

  public readonly blockSize: number; // Must be power of 2.

  public readonly length: number;

  // Derived properties.
  private readonly blockIndexShift: number;

  private readonly blockOffsetMask: number;

  // Internal state.
  private head: number; // Absolute index of element being written to on push.

  constructor(length: number, blockSize: number, deferAllocation?: boolean) {
    // Initialize buffer and properties.
    this.blocks = [];
    this.length = length;
    this.blockSize = 2 ** Math.floor(Math.log2(blockSize)); // Ensure power of 2.

    // Initialize derived properties.
    this.blockIndexShift = Math.log2(this.blockSize) >>> 0;
    this.blockOffsetMask = (this.blockSize - 1) >>> 0;

    // Initialize internal state.
    this.head = 0;

    // Preallocate memory.
    if (!deferAllocation) {
      this.allocate(this.length);
    }
  }

  // Allocate some number of blocks (if deferred allocation in constructor).
  allocate(length: number): void {
    for (let i = 0; i < Math.ceil(length / this.blockSize); i++) {
      this.blocks.push(new Uint32Array(this.blockSize));
    }
  }

  // A "destructor" that simply sets internal buffer to null to encourage
  // garbage collection.
  destructor(): void {
    this.blocks = [];
  }

  // Pushes element to head of array.
  push(element: number): void {
    this.blocks[this.head >>> this.blockIndexShift][this.head & this.blockOffsetMask] = element;
    this.head += 1;
  }

  // Concatenates another FragmentedArray by copying over references to other's
  // array blocks starting from head of own self.blocks.
  concat(other: FragmentedArray): void {
    // Fail if head not at end of allocated memory or block sizes don't match.
    for (let i = 0; i < other.blocks.length; i++) {
      this.blocks.push(other.blocks[i]);
      this.head += this.blockSize;
    }
  }

  // Get from storage by index (transparent access to fragmented storage).
  get(index: number): number {
    return this.blocks[index >>> this.blockIndexShift][index & this.blockOffsetMask];
  }

  // Getter function for head value.
  getHead(): number {
    return this.head;
  }
}
