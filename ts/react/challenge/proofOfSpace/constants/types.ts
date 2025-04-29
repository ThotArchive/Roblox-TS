/**
 * A type representing the current state while solving the puzzle.
 */
// eslint-disable-next-line import/prefer-default-export
export enum AnswerState {
  INITIAL,
  READY_TO_COMPUTE,
  COMPUTING,
  COMPUTING_DONE,
  VERIFIED_CORRECT,
  VERIFIED_INCORRECT
}
