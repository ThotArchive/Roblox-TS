import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const proofOfWorkServiceUrl = `${apiGatewayUrl}/proof-of-work-service`;

export enum ProofOfWorkError {
  UNKNOWN = 0,
  REQUEST_INVALID = 1,
  SESSION_INACTIVE = 2
}

export enum PuzzleType {
  TIME_LOCK = 0
}

export type GetPuzzleReturnType = {
  puzzleType: PuzzleType;
  artifacts: string;
};

/**
 * Request Type: `GET`.
 */
export const GET_PUZZLE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${proofOfWorkServiceUrl}/v1/pow-puzzle`,
  timeout: 10000
};

export type VerifyPuzzleReturnType = {
  answerCorrect: boolean;
  redemptionToken: string;
  message: string;
};

/**
 * Request Type: `POST`.
 */
export const VERIFY_PUZZLE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${proofOfWorkServiceUrl}/v1/pow-puzzle`,
  timeout: 10000
};
