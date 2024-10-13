import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

export default {
  getOutstandingUserAgreements() {
    const urlConfig = urlConstants.getAgreementResolutionConfig();
    return httpService.get(urlConfig);
  },
  insertAcceptances(agreementIds) {
    const urlConfig = urlConstants.getInsertAcceptancesConfig();
    const insertAcceptancesRequests = {
      acceptances: agreementIds.map(agreementId => ({ agreementId }))
    };
    return httpService.post(urlConfig, insertAcceptancesRequests);
  }
};
