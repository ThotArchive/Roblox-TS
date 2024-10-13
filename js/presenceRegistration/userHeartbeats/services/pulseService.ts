import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';

import { pulseUrlSuffix } from '../constants/constants';

function parseSessionCookie() {
  const matches = /sessionid=([a-f0-9-]{36})/.exec(document.cookie);
  if (matches && matches.length >= 2) {
    return matches[1];
  }

  return 'unknown';
}

async function sendPulse() {
  const { apiGatewayUrl } = EnvironmentUrls;
  try {
    await httpService.post(
      {
        url: `${apiGatewayUrl}${pulseUrlSuffix}`,
        withCredentials: true
      },
      {
        clientSideTimestampEpochMs: Date.now(),
        sessionInfo: {
          sessionId: parseSessionCookie()
        },
        locationInfo: {
          robloxWebsiteLocationInfo: {
            url: window.location?.href
          }
        }
      }
    );
  } catch (e) {
    console.error(e);
  }
}

export default sendPulse;
