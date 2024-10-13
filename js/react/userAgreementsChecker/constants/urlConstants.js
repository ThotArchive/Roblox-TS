import { EnvironmentUrls } from 'Roblox';

const { userAgreementsServiceApi } = EnvironmentUrls;
const { universalAppConfigurationApi } = EnvironmentUrls;
// Needed as part of the agreement-resolution request to UAQS
const clientType = 'web';
// Used by GUAC; the specific behavior that drives the cooldown period
const behaviorName = 'user-agreements-policy';

export default {
  getAgreementResolutionConfig: () => {
    return {
      withCredentials: true,
      url: `${userAgreementsServiceApi}/v1/agreements-resolution/${clientType}`
    };
  },
  getInsertAcceptancesConfig: () => {
    return {
      withCredentials: true,
      url: `${userAgreementsServiceApi}/v1/acceptances`
    };
  },
  getCooldownPeriodInMsConfig: () => {
    return {
      withCredentials: true,
      url: `${universalAppConfigurationApi}/v1/behaviors/${behaviorName}/content`
    };
  }
};
