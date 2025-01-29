import { Endpoints, EnvironmentUrls } from 'Roblox';

const { getAbsoluteUrl } = Endpoints;
const {
  authApi,
  accountSettingsApi,
  websiteUrl,
  adsApi,
  economyApi,
  privateMessagesApi,
  tradesApi,
  friendsApi,
  apiGatewayUrl,
  universalAppConfigurationApi
} = EnvironmentUrls;
export default {
  getEmailStatusUrl: () => `${accountSettingsApi}/v1/email`,
  getSignupRedirUrl: () => getAbsoluteUrl('/account/signupredir'),
  getHomeUrl: () => getAbsoluteUrl('/home'),
  getWebsiteUrl: () => websiteUrl,
  getLogoutUrl: () => `${authApi}/v2/logout`,
  getRootUrl: () => getAbsoluteUrl('/'),
  getSponsoredPageUrl: () => `${adsApi}/v1/sponsored-pages`,
  getSponsoredEventUrl: (pageType, name) => getAbsoluteUrl(`/${pageType.toLowerCase()}/${name}`),
  getUnreadPrivateMessagesCountUrl: () => `${privateMessagesApi}/v1/messages/unread/count`,
  getUserCurrencyUrl: userId => `${economyApi}/v1/users/${userId}/currency`,
  getNavigationHeaderGuacUrl: () =>
    `${apiGatewayUrl}/universal-app-configuration/v1/behaviors/navigation-header-ui/content`,
  getTradeStatusCountUrl: () => `${tradesApi}/v1/trades/inbound/count`,
  getFriendsRequestCountUrl: () => `${friendsApi}/v1/user/friend-requests/count`,
  getAuthTokenMetaUrl: () => `${apiGatewayUrl}/auth-token-service/v1/login/metadata`,
  getLoginUrl: () => getAbsoluteUrl('/login'),
  getNewLoginUrl: () => getAbsoluteUrl('/newLogin'),
  getAccountSwitchingSignUpUrl: () => getAbsoluteUrl('/CreateAccount'),
  getCreditBalanceForNavigationUrl: () =>
    `${apiGatewayUrl}/credit-balance/v1/get-credit-balance-for-navigation`,
  getConversionMetadataUrl: () => `${apiGatewayUrl}/credit-balance/v1/get-conversion-metadata`,
  getGiftCardVisibilityUrl: () => `${apiGatewayUrl}/credit-balance/v1/get-gift-card-visibility`,
  getIntlAuthComplianceUrl: () =>
    `${universalAppConfigurationApi}/v1/behaviors/intl-auth-compliance/content`,
  getSignedVngShopUrl: () => `${apiGatewayUrl}/vng-payments/v1/getVngShopUrl`,
  getRobuxBadgeUrl: () => `${apiGatewayUrl}/robuxbadge/v1/robuxbadge`
};
