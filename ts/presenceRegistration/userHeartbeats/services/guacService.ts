import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';

import { guacUrlSuffix, defaultIntervalMs } from '../constants/constants';

type GuacResponse = {
  isEnabled?: boolean;
  rolloutPercentage?: number;
  intervalTimeMs?: number;
};

export type PulseGuacConfig = {
  isEnabled: boolean;
  rolloutPercentage: number;
  intervalTimeMs: number;
};

async function loadGuacConfig(): Promise<PulseGuacConfig> {
  const { apiGatewayUrl } = EnvironmentUrls;
  try {
    const config = await httpService.get({
      url: `${apiGatewayUrl}${guacUrlSuffix}`
    });

    const data = config?.data as GuacResponse;

    if (!data) {
      return {
        isEnabled: false,
        rolloutPercentage: 0,
        intervalTimeMs: defaultIntervalMs
      };
    }

    return {
      isEnabled: Boolean(data.isEnabled),
      rolloutPercentage: data.rolloutPercentage ?? 0,
      intervalTimeMs: data.intervalTimeMs ?? defaultIntervalMs
    };
  } catch (e) {
    console.error(e);

    return {
      isEnabled: false,
      rolloutPercentage: 0,
      intervalTimeMs: defaultIntervalMs
    };
  }
}

export default {
  loadGuacConfig
};
