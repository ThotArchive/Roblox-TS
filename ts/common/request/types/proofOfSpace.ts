import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const proofOfSpaceServiceUrl = `${apiGatewayUrl}/proof-of-space`;

export enum ProofOfSpaceError {
  UNKNOWN = 0,
  INTERNAL_ERROR = 1,
  INVALID_REQUEST = 2,
  INVALID_SESSION = 3
}

/**
 * Request Type: `POST`.
 */
export const VERIFY_PUZZLE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${proofOfSpaceServiceUrl}/v1/verify`,
  timeout: 10000
};

export type Solution = {
  commitment: string;
  solutions: string[][];
};

export type VerifyPuzzleResponse = {
  redemptionToken: string;
};
