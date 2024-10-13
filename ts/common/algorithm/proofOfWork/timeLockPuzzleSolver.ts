import bigInt, { BigInteger } from 'big-integer';

// The compute resolution used to report the progress. Resolution 100 will
// report progress every 1%.
const PROGRESS_RESOLUTION = 1000;

// Used by `runAsync` to yield periodically in browsers that do not support Web
// Workers. The solver will sleep after a certain number of iterations to allow
// UI interactions with the DOM.
const DEFAULT_YIELD_AFTER_ITERATIONS = 200;

/**
 * A type representing the input parameters to solve a TimeLock RSW puzzle.
 */
export type TimeLockPuzzleParameters = {
  N: string;
  A: number;
  T: number;
};

/**
 * A type representing the messages sent by the worker, reporting the progress
 * of the compute.
 */
export type TimeLockPuzzleMessage = {
  progress: number;
  answer?: string;
};

export type TimeLockPuzzleAnswer = string;

export type ProgressReportCallback = (progress: number) => unknown;
export type AnswerCallback = (answer: TimeLockPuzzleAnswer | null) => unknown;

/**
 * A class that performs repeated modular exponentiation on some base value
 * according to the parameters described in the following paper:
 *
 * https://people.csail.mit.edu/rivest/pubs/RSW96.pdf
 */
export class TimeLockPuzzleSolver {
  // Input parameters:
  private n: BigInteger;

  private a: BigInteger;

  private t: number;

  // Intermediate results:
  private curBase: BigInteger;

  private curT: number;

  // Used to cancel in-progress computation (for `runAsync` only).
  private isCancelled: boolean;

  constructor(params: TimeLockPuzzleParameters) {
    this.n = bigInt(params.N);
    this.a = bigInt(params.A);
    this.t = params.T;

    this.curBase = this.a;
    this.curT = 0;

    this.isCancelled = false;
  }

  run(inProgressCallback: ProgressReportCallback, answerCallback: AnswerCallback): void {
    const batchSize = Math.max(1, this.t / PROGRESS_RESOLUTION);
    while (!this.isDone()) {
      this.doRepeatedSquaring(batchSize);
      inProgressCallback(this.progress());
    }
    answerCallback(this.answer());
  }

  // A tight loop that yields periodically, to be used as a fallback solver in
  // browsers that do not support Web Workers.
  runAsync(
    inProgressCallback: ProgressReportCallback,
    answerCallback: AnswerCallback,
    yieldAfterIterations?: number
  ): void {
    const runIterations = () => {
      this.doRepeatedSquaring(yieldAfterIterations || DEFAULT_YIELD_AFTER_ITERATIONS);
      inProgressCallback(this.progress());
      if (this.isCancelled) return;
      if (this.isDone()) {
        answerCallback(this.answer());
      } else {
        setTimeout(runIterations, 0);
      }
    };
    setTimeout(runIterations, 0);
  }

  cancelRunAsync(): void {
    this.isCancelled = true;
  }

  doRepeatedSquaring(iterations?: number): void {
    const targetT =
      typeof iterations !== 'undefined' ? Math.min(this.t, this.curT + iterations) : this.t;
    for (; this.curT < targetT; this.curT += 1) {
      this.curBase = this.curBase.square().mod(this.n);
    }
  }

  answer(): TimeLockPuzzleAnswer | null {
    if (!this.isDone()) return null;
    return this.curBase.toString();
  }

  progress(): number {
    return this.curT / this.t;
  }

  isDone(): boolean {
    return this.curT === this.t;
  }
}
