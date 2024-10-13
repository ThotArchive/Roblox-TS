import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import { GET_USER_BALANCE_API } from '../../constants/upsellConstants';
import { UserBalance } from '../../constants/serviceTypeDefinitions';

export default async function fetchUserBalance(): Promise<number> {
  const { userId } = CurrentUser;

  const urlConfig = {
    url: `${EnvironmentUrls.economyApi}${GET_USER_BALANCE_API.replace('{userId}', userId)}`,
    withCredentials: true,
    retryable: false,
    noCache: true
  };

  try {
    const userBalanceResponse = await httpService.get<UserBalance>(urlConfig);
    if (userBalanceResponse.status === 200) {
      return userBalanceResponse.data.robux;
    }
    return Promise.reject();
  } catch (e) {
    return Promise.reject(e);
  }
}
