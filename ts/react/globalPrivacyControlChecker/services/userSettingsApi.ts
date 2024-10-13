import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

export default {
  setGlobalPrivacyControl() {
    const urlConfig = urlConstants.setGlobalPrivacyControlConfig();
    return httpService.post(urlConfig);
  }
};
