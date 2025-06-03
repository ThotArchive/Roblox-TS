import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const rostileServiceUrl = `${apiGatewayUrl}/rostile`;

export enum RostileError {
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
  url: `${rostileServiceUrl}/v1/verify`,
  timeout: 10000
};

export type VisibleSolution = {
  buttonClicked: boolean;
  click: { x: number; y: number; timestamp: number; duration: number };
  completionTime: number;
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  screenSize: { width: number; height: number };
  buttonLocation: { x: number; y: number; width: number; height: number };
  windowSize: { width: number; height: number };
  isMobile: boolean;
};

export type InvisibleSolution = {};

export type Solution = VisibleSolution | InvisibleSolution;

export type VerifyPuzzleReturnType = {
  redemptionToken: string;
};
