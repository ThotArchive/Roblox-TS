/**
 * Games
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const gamesApiUrl = EnvironmentUrls.gamesApi ?? URL_NOT_FOUND;

// Incomplete type:
export enum GamesError {
  UNKNOWN = 0
}

// Incomplete type (we only care about names):
export type GetDetailsForUniverseIdsReturnType = {
  data: {
    id: number;
    name: string;
  }[];
};

/**
 * Request Type: `GET`.
 */
export const GET_DETAILS_FOR_UNIVERSE_IDS_CONFIG: UrlConfig = {
  url: `${gamesApiUrl}/v1/games`,
  timeout: 10000
};
