import { TimeLockPuzzleAnswer, TimeLockPuzzleParameters } from './proofOfWork/timeLockPuzzleSolver';
import {
  GraphPebblingPuzzleAnswer,
  GraphPebblingPuzzleParameters
} from './proofOfSpace/graphPebblingPuzzleSolver';

export enum SolverType {
  TIME_LOCK_PUZZLE,
  GRAPH_PEBBLING_PUZZLE
}

type SolverCommonParameters = {
  solverType: SolverType;
};

type SolverSpecificParameters<T extends SolverType> = {
  [SolverType.TIME_LOCK_PUZZLE]: TimeLockPuzzleParameters;
  [SolverType.GRAPH_PEBBLING_PUZZLE]: GraphPebblingPuzzleParameters;
}[T];

export type SolverParameters<T extends SolverType> = {
  solverParameters: SolverSpecificParameters<T>;
} & SolverCommonParameters;

export type SolverAnswer<T extends SolverType> = {
  [SolverType.TIME_LOCK_PUZZLE]: TimeLockPuzzleAnswer;
  [SolverType.GRAPH_PEBBLING_PUZZLE]: GraphPebblingPuzzleAnswer;
}[T];
