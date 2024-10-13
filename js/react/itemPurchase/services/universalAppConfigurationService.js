import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

const { getVngBuyRobuxBehaviorUrl } = urlConstants;

export default {
  getVngBuyRobuxBehavior: () => {
    const urlConfig = {
      url: getVngBuyRobuxBehaviorUrl(),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  }
};
