// TODO: delete this once grasshopper clients are usable here.
import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const rotatingClientServiceUrl = `${apiGatewayUrl}/rotating-client-service`;

/**
 * Request type: 'GET'
 */
// eslint-disable-next-line import/prefer-default-export
export const GET_PRELUDE_CONFIG: UrlConfig = {
  url: `${rotatingClientServiceUrl}/v1/prelude/latest`,
  timeout: 1000
};
