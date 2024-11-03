import { Window } from '../types/Window';

const baseUrl = (window as Window).Roblox?.EnvironmentUrls?.apiGatewayUrl ?? 'https://apis.roblox.com';

export default {
  userProfileApiUrl: `${baseUrl}/user-profile-api/v1/user/profiles/get-profiles`
};
