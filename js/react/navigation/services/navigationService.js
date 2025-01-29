import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

const {
  getEmailStatusUrl,
  getLogoutUrl,
  getSponsoredPageUrl,
  getUnreadPrivateMessagesCountUrl,
  getUserCurrencyUrl,
  getNavigationHeaderGuacUrl,
  getTradeStatusCountUrl,
  getFriendsRequestCountUrl,
  getAuthTokenMetaUrl,
  getCreditBalanceForNavigationUrl,
  getConversionMetadataUrl,
  getGiftCardVisibilityUrl,
  getSignedVngShopUrl,
  getRobuxBadgeUrl
} = urlConstants;

export default {
  getUnreadPrivateMessagesCount() {
    const urlConfig = { url: getUnreadPrivateMessagesCountUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },

  getUserCurrency(userId) {
    const urlConfig = { url: getUserCurrencyUrl(userId), withCredentials: true };
    return httpService.get(urlConfig);
  },

  getGuacBehavior() {
    const urlConfig = { url: getNavigationHeaderGuacUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },

  getTradeStatusCount() {
    const urlConfig = { url: getTradeStatusCountUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },

  getFriendsRequestCount() {
    const urlConfig = { url: getFriendsRequestCountUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },

  getEmailStatus() {
    const urlConfig = { url: getEmailStatusUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },

  getSponsoredPages() {
    const urlConfig = { url: getSponsoredPageUrl(), withCredentials: true };
    return httpService
      .get(urlConfig)
      .then(result => result?.data)
      .catch(e => {
        console.error(e);
      });
  },

  getAuthTokenMetadata() {
    const urlConfig = { url: getAuthTokenMetaUrl(), withCredentials: true };
    return httpService
      .get(urlConfig)
      .then(result => result?.data)
      .catch(e => {
        console.error(e);
      });
  },
  logout() {
    const urlConfig = { url: getLogoutUrl(), withCredentials: true };
    return httpService.post(urlConfig);
  },
  getCreditBalanceForNavigation() {
    const urlConfig = { url: getCreditBalanceForNavigationUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },
  getConversionMetadata() {
    const urlConfig = { url: getConversionMetadataUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },
  getGiftCardVisibility() {
    const urlConfig = { url: getGiftCardVisibilityUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },
  getVngShopSignedRedirectionUrl() {
    const urlConfig = { url: getSignedVngShopUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  },
  getRobuxBadge() {
    const urlConfig = { url: getRobuxBadgeUrl(), withCredentials: true };
    return httpService.get(urlConfig);
  }
};
