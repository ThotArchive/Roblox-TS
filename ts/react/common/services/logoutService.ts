import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';

const logoutService = {
  logout: (): Promise<unknown> => {
    const urlConfig = { url: `${EnvironmentUrls.authApi}/v2/logout`, withCredentials: true };
    return httpService
      .post(urlConfig)
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        throw error;
      });
  }
};

export default logoutService;
