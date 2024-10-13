import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import { VngGuacResponse } from '../constants/serviceTypeDefinitions';
import { GET_VNG_BUY_ROBUX_BEHAVIOR_URL } from '../constants/upsellConstants';

export default async function getShouldShowVng(): Promise<boolean> {
  const urlConfig = {
    url: `${EnvironmentUrls.universalAppConfigurationApi}${GET_VNG_BUY_ROBUX_BEHAVIOR_URL}`,
    withCredentials: true
  };

  try {
    const response = await httpService.get<VngGuacResponse>(urlConfig);

    return Promise.resolve(response.data.shouldShowVng);
  } catch (e) {
    return Promise.reject(e);
  }
}
