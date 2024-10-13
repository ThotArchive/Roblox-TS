import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

export default {
  getCooldownPeriodInMs() {
    const urlConfig = urlConstants.getCooldownPeriodInMsConfig();
    return httpService.get(urlConfig);
  }
};
