/* eslint-disable no-bitwise */

import FragmentedArray from './fragmentedArray';
import Hasher from './hasher';

// The compute resolution used to report the progress. Resolution 100 will
// report progress every 1%.
// eslint-disable-next-line max-classes-per-file
const PROGRESS_RESOLUTION = 1000;

// Used by `runAsync` to yield periodically in browsers that do not support Web
// Workers. The solver will sleep after a certain number of iterations to allow
// UI interactions with the DOM.
const DEFAULT_YIELD_AFTER_ITERATIONS = 2 ** 18;

// The default size of each block in any defined FragmentedArray here, log2.
const DEFAULT_BLOCK_SIZE = 17;

/**
 * A type representing the answer to a graph pebbling PoS puzzle.
 */
export type GraphPebblingPuzzleAnswer = {
  commitment: string;
  solutions: string[][];
};

/**
 * A type representing the messages sent by the worker, reporting the progress
 * of the computation.
 */
export type GraphPebblingPuzzleMessage = {
  progress: number;
  answer?: GraphPebblingPuzzleAnswer;
  error?: string;
};

export type ProgressReportCallback = (progress: number) => unknown;
export type AnswerCallback = (answer: GraphPebblingPuzzleAnswer | null) => unknown;
export type AbortCallback = (error: string) => unknown;

/**
 * A type representing the input parameters to solve a graph pebbling PoS puzzle.
 */
export type GraphPebblingPuzzleParameters = {
  seed: string;
  layers: number;
  rounds: number;
};

/**
 * An enum representing the current stage of the computation.
 */
enum GraphPebblingPuzzleStep {
  INIT_GRAPH,
  PEBBLE_GRAPH,
  CREATE_MERKLE_TREE,
  GENERATE_SOLUTION
}

/**
 * A class that pebbles a hard-to-pebble graph and generates its
 * Merkle tree commitment.
 *
 * https://doi.org/10.1007/978-3-662-48000-7_29
 */
export class GraphPebblingPuzzleSolver {
  // Input parameters:
  private readonly layers: number;

  private readonly rounds: number;

  // Derived parameters:
  private readonly hasher: Hasher;

  private readonly merkleLayers: number;

  private readonly blockSize: number;

  private readonly layerSize: number;

  // Intermediate results:
  private prevLayer: FragmentedArray;

  private curLayer: FragmentedArray;

  private merkleTree: FragmentedArray;

  // Progress information:
  private step: GraphPebblingPuzzleStep;

  private pebblingLayer: number;

  private readonly totalComputedNodes: number;

  // Used to cancel in-progress computation (for `runAsync` only).
  private isCancelled: boolean;

  constructor(params: GraphPebblingPuzzleParameters) {
    this.layers = params.layers;
    this.rounds = params.rounds;

    this.hasher = new Hasher(params.seed);
    // Highest power of 2 less than layers.
    this.merkleLayers = 2 ** Math.floor(Math.log2(this.layers));
    // Do not let blockSize go higher than size of layer.
    this.blockSize = 2 ** Math.min(this.layers, DEFAULT_BLOCK_SIZE);
    this.layerSize = 2 ** this.layers;

    // Defer allocation to actual computational steps so dispatch can handle
    // catching any memory allocation errors.
    this.prevLayer = new FragmentedArray(this.layerSize, this.blockSize, true);
    this.curLayer = new FragmentedArray(this.layerSize, this.blockSize, true);
    // Length of Merkle tree is number of nodes in full binary tree with
    // number of leaves equal to the nodes in merkleLayers layers.
    this.merkleTree = new FragmentedArray(
      2 * this.merkleLayers * this.layerSize - 1,
      this.blockSize,
      true
    );

    this.step = GraphPebblingPuzzleStep.INIT_GRAPH;
    // Current layer being pebbled.
    this.pebblingLayer = 0;
    // Total number of nodes iterated over across all steps for progress purposes.
    this.totalComputedNodes = (this.layers + this.merkleLayers + 1) * this.layerSize - 1;

    this.isCancelled = false;
  }

  // Initialize pebbles of first layer of graph. Pebbles refer to the values
  // returned by a random oracle with input as the node's ID combined with the
  // pebbles of its predecessors. Since the first layer has no predecessors, we
  // initialize the first layer with only the node IDs.
  initPebbling(batchSize: number): void {
    // Allocate curLayer because deferred from constructor, prevLayer unnecessary
    // since it will be overwritten at end of step anyways.
    if (this.curLayer.getHead() === 0) {
      this.curLayer.allocate(this.layerSize);
    }

    // Generate initial pebbles from hash of id (equaling head position).
    for (let i = 0; i < batchSize && this.curLayer.getHead() < this.layerSize; ++i) {
      this.curLayer.push(this.hasher.hashOneValue(this.curLayer.getHead()));
    }

    // Step done.
    if (this.curLayer.getHead() === this.layerSize) {
      this.pebblingLayer += 1;
      this.prevLayer = this.curLayer;
      this.curLayer = new FragmentedArray(this.layerSize, this.blockSize);
      this.step = GraphPebblingPuzzleStep.PEBBLE_GRAPH;
    }
  }

  // Pebble graph and persist relevant layers to Merkle tree leaves. See definition of
  // pebbles above. Since each layer depends only on nodes in the previous layer, we pebble
  // the graph by iteratively pebbling each layer.
  pebble(batchSize: number): void {
    // Pebble current layer.
    for (let i = 0; i < batchSize && this.curLayer.getHead() < this.layerSize; ++i) {
      // Calculate predecessors (without layer in MSB).
      const pred1 = this.curLayer.getHead() | (1 << (this.layers - this.pebblingLayer));
      const pred2 = this.curLayer.getHead() & ~(1 << (this.layers - this.pebblingLayer));

      this.curLayer.push(
        this.hasher.hashThreeValues(
          this.curLayer.getHead() + this.pebblingLayer * this.layerSize,
          this.prevLayer.get(pred1),
          this.prevLayer.get(pred2)
        )
      );
    }

    // Handle layer being finished.
    if (this.curLayer.getHead() === this.layerSize) {
      if (this.layers - this.pebblingLayer < this.merkleLayers) {
        this.merkleTree.concat(this.curLayer);
      }
      this.pebblingLayer += 1;
      this.prevLayer = this.curLayer;
      this.curLayer = new FragmentedArray(this.layerSize, this.blockSize);
    }

    // Step done.
    if (this.pebblingLayer === this.layers + 1) {
      this.prevLayer.destructor();
      this.curLayer.destructor();
      this.step = GraphPebblingPuzzleStep.CREATE_MERKLE_TREE;
      this.merkleTree.allocate(this.merkleLayers * this.layerSize - 1);
    }
  }

  // Generate Merkle tree up to root from leaves. A Merkle tree "commits" a set
  // of values by placing them at leaves of a binary tree and computing each internal
  // node by hashing the value of its children. The root is known as a commitment and
  // a value can be "opened" to confirm it matches the commitment, see below.
  createMerkleTree(batchSize: number): void {
    // Derive start from progress in merkleTree array.
    let readIndex = (this.merkleTree.getHead() - Math.ceil(this.merkleTree.length / 2)) * 2;

    // Repeatedly hash siblings and push to end (note all siblings are contiguous).
    for (let i = 0; i < batchSize && this.merkleTree.getHead() < this.merkleTree.length; i++) {
      this.merkleTree.push(
        this.hasher.hashTwoValues(
          this.merkleTree.get(readIndex),
          this.merkleTree.get(readIndex + 1)
        )
      );
      readIndex += 2;
    }

    if (this.merkleTree.getHead() === this.merkleTree.length) {
      this.step = GraphPebblingPuzzleStep.GENERATE_SOLUTION;
    }
  }

  // Run a batch of the current step. Provides a catch layer that
  // calls a string of any caught error messages.
  dispatch(batchSize: number): string | null {
    try {
      switch (this.step) {
        case GraphPebblingPuzzleStep.INIT_GRAPH:
          this.initPebbling(batchSize);
          break;
        case GraphPebblingPuzzleStep.PEBBLE_GRAPH:
          this.pebble(batchSize);
          break;
        case GraphPebblingPuzzleStep.CREATE_MERKLE_TREE:
          this.createMerkleTree(batchSize);
          break;
        default:
          break;
      }
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
    return null;
  }

  // Repeatedly run batches of compute and report progress.
  run(
    inProgressCallback: ProgressReportCallback,
    answerCallback: AnswerCallback,
    abortCallback: AbortCallback
  ): void {
    const batchSize = Math.ceil(this.totalComputedNodes / PROGRESS_RESOLUTION);
    while (!this.isDone()) {
      const error = this.dispatch(batchSize);
      if (error !== null) {
        abortCallback(error);
        return;
      }
      inProgressCallback(this.progress());
    }
    answerCallback(this.answer());
    this.merkleTree.destructor();
  }

  // A tight loop that yields periodically, to be used as a fallback solver in
  // browsers that do not support Web Workers.
  runAsync(
    inProgressCallback: ProgressReportCallback,
    answerCallback: AnswerCallback,
    abortCallback: AbortCallback,
    yieldAfterIterations?: number
  ): void {
    const runIterations = () => {
      const error = this.dispatch(yieldAfterIterations || DEFAULT_YIELD_AFTER_ITERATIONS);
      if (error !== null) {
        abortCallback(error);
        return;
      }
      inProgressCallback(this.progress());
      if (this.isCancelled) return;
      if (this.isDone()) {
        answerCallback(this.answer());
      } else {
        setTimeout(runIterations, 0);
      }
    };
    setTimeout(runIterations, 0);
    this.merkleTree.destructor();
  }

  cancelRunAsync(): void {
    this.isCancelled = true;
  }

  // Given a seed value, generate a challenge within the range of valid nodes.
  generateChallenge(seed: number): number {
    const challenge = this.hasher.hashOneValue(seed);
    const firstPersistedLayer = this.layers - this.merkleLayers + 1;
    const rangeMin = (firstPersistedLayer + 1) * this.layerSize;
    const rangeSize = (this.merkleLayers - 1) * this.layerSize;
    return (challenge % rangeSize) + rangeMin;
  }

  // Compute opening of a given node. An opening is a list of hash values in the Merkle tree
  // corresponding to the neighbors of all the nodes in the path from the challenged node
  // up to the root. These values can be used to recompute the commitment and make sure
  // the commitment matches.
  open(nodeId: number): number[] {
    const merkleStartDelta = (this.layers - this.merkleLayers + 1) * this.layerSize;
    const opening: number[] = [];
    let curMerkleIndex = nodeId - merkleStartDelta;
    opening.push(this.merkleTree.get(curMerkleIndex));
    for (let i = 0; i < this.layers + Math.log2(this.merkleLayers); i++) {
      // Sibling of current node.
      curMerkleIndex = curMerkleIndex % 2 === 0 ? curMerkleIndex + 1 : curMerkleIndex - 1;
      opening.push(this.merkleTree.get(curMerkleIndex));
      // Parent of current node.
      curMerkleIndex =
        this.merkleTree.length - Math.floor((this.merkleTree.length - curMerkleIndex) / 2);
    }
    return opening;
  }

  // Compute answer to puzzle (commitment + openings). Challenges are generated by taking
  // a hash of the commitment, that way the challenges can't be predicted before the
  // commitment has been computed (i.e. a Fiat–Shamir heuristic).
  answer(): GraphPebblingPuzzleAnswer | null {
    if (!this.isDone()) return null;
    const solutions: string[][] = [];
    const commitment = this.merkleTree.get(this.merkleTree.length - 1); // Root of Merkle tree.
    let challenge = this.generateChallenge(commitment);

    // Repeatedly open a challenge and the challenged node's predecessors.
    for (let i = 0; i < this.rounds; i++) {
      let roundSolution = this.open(challenge);
      // Calculate predecessors (with layer in MSB).
      const nodeLayer = challenge >>> this.layers;
      const pred1 = (challenge | (1 << (this.layers - nodeLayer))) - this.layerSize;
      const pred2 = (challenge & ~(1 << (this.layers - nodeLayer))) - this.layerSize;
      // Open predecessors.
      roundSolution = roundSolution.concat(this.open(pred1));
      roundSolution = roundSolution.concat(this.open(pred2));
      solutions.push(roundSolution.map(value => value.toString()));
      challenge = this.generateChallenge(challenge);
    }

    return {
      commitment: commitment.toString(),
      solutions
    };
  }

  progress(): number {
    // Includes init step.
    const pebblingProgress = this.pebblingLayer * this.layerSize + this.curLayer.getHead();
    // Nodes done computing in tree excluding those calculated during pebbling.
    const merkleProgress = Math.max(
      this.merkleTree.getHead() - this.merkleLayers * this.layerSize,
      0
    );
    return (pebblingProgress + merkleProgress) / this.totalComputedNodes;
  }

  isDone(): boolean {
    return this.step === GraphPebblingPuzzleStep.GENERATE_SOLUTION;
  }
}
