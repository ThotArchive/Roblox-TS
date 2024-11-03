const { location } = window;

function getDomainInfo(hostname: string) {
  const metaTag = document.querySelector<HTMLElement>('meta[name="environment-meta"]');
  if (metaTag?.dataset?.domain) {
    return {
      production: metaTag.dataset.isTestingSite === 'false',
      domainName: metaTag.dataset.domain.split('.')[0],
      rootDomain: metaTag.dataset.domain
    };
  }

  const split = hostname.split('.').reverse();

  const root = `${split[1]}.${split[0]}`;
  if (root === 'roblox.com' || root === 'simulprod.com' || root === 'rblx.org') {
    return {
      production: true,
      domainName: 'roblox',
      rootDomain: 'roblox.com'
    };
  }

  const subdomain = split[2];
  if (subdomain.indexOf('sitetest') === 0) {
    return {
      production: false,
      domainName: subdomain,
      rootDomain: `${subdomain}.robloxlabs.com`
    };
  }

  throw new Error(`Unknown environment for ${hostname}`);
}

const { production, domainName, rootDomain } = getDomainInfo(location.hostname);

const environmentUrls = {
  // Internal URLs
  abtestingApiSite: `https://abtesting.${rootDomain}`,
  accountInformationApi: `https://accountinformation.${rootDomain}`,
  accountSettingsApi: `https://accountsettings.${rootDomain}`,
  adConfigurationApi: `https://adconfiguration.${rootDomain}`,
  adsApi: `https://ads.${rootDomain}`,
  advertiseApi: `https://advertise.${rootDomain}`,
  apiGatewayUrl: `https://apis.${rootDomain}`,
  apiProxyUrl: `https://api.${rootDomain}`,
  assetDeliveryApi: `https://assetdelivery.${rootDomain}`,
  authApi: `https://auth.${rootDomain}`,
  avatarApi: `https://avatar.${rootDomain}`,
  badgesApi: `https://badges.${rootDomain}`,
  billingApi: `https://billing.${rootDomain}`,
  captchaApi: `https://captcha.${rootDomain}`,
  catalogApi: `https://catalog.${rootDomain}`,
  chargebackWizardApi: `https://apis.${rootDomain}/chargeback-wizard`,
  chatApi: `https://apis.${rootDomain}/platform-chat-api`,
  chatModerationApi: `https://chatmoderation.${rootDomain}`,
  contactsApi: `https://contacts.${rootDomain}`,
  contactsServiceApi: `https://apis.${rootDomain}/contacts-api`,
  contentStoreApi: `https://contentstore.${rootDomain}`,
  developApi: `https://develop.${rootDomain}`,
  domain: `${rootDomain}`,
  economyApi: `https://economy.${rootDomain}`,
  economycreatorstatsApi: `https://economycreatorstats.${rootDomain}`,
  engagementPayoutsApi: `https://engagementpayouts.${rootDomain}`,
  followingsApi: `https://followings.${rootDomain}`,
  friendsApi: `https://friends.${rootDomain}`,
  gameInternationalizationApi: `https://gameinternationalization.${rootDomain}`,
  gamesApi: `https://games.${rootDomain}`,
  gameJoinApi: `https://gamejoin.${rootDomain}`,
  gameUpdateNotificationsApi: `https://apis.${rootDomain}/game-update-notifications`,
  groupsApi: `https://groups.${rootDomain}`,
  groupsModerationApi: `https://groupsmoderation.${rootDomain}`,
  helpSite: `https://en.help.${rootDomain}`,
  inventoryApi: `https://inventory.${rootDomain}`,
  itemConfigurationApi: `https://itemconfiguration.${rootDomain}`,
  legacyChatApi: `https://chat.${rootDomain}`,
  localeApi: `https://locale.${rootDomain}`,
  localizationTablesApi: `https://localizationtables.${rootDomain}`,
  matchmakingApi: `https://apis.${rootDomain}/matchmaking-api`,
  metricsApi: `https://metrics.${rootDomain}`,
  midasApi: `https://midas.${rootDomain}`,
  notificationApi: `https://notifications.${rootDomain}`,
  passProductPurchasingApi: `https://apis.${rootDomain}/pass-product-purchasing`,
  bundlesProductPurchasingApi: `https://apis.${rootDomain}/bundles-product-purchasing`,
  premiumFeaturesApi: `https://premiumfeatures.${rootDomain}`,
  presenceApi: `https://presence.${rootDomain}`,
  privateMessagesApi: `https://privatemessages.${rootDomain}`,
  publishApi: `https://publish.${rootDomain}`,
  restrictedHoursServiceApi: `https://apis.${rootDomain}/restricted-hours-service`,
  screenTimeApi: 'https://apis.rcs.roblox.com/screen-time-api',
  shareApi: `https://share.${rootDomain}`,
  shareLinksApi: `https://apis.${rootDomain}/sharelinks`,
  showcasesApi: `https://apis.${rootDomain}/showcases-api`,
  thumbnailsApi: `https://thumbnails.${rootDomain}`,
  tradesApi: `https://trades.${rootDomain}`,
  translationRolesApi: `https://translationroles.${rootDomain}`,
  twoStepVerificationApi: `https://twostepverification.${rootDomain}`,
  universalAppConfigurationApi: `https://apis.${rootDomain}/universal-app-configuration`,
  userAgreementsServiceApi: `https://apis.${rootDomain}/user-agreements`,
  userModerationApi: `https://usermoderation.${rootDomain}`,
  usersApi: `https://users.${rootDomain}`,
  userSettingsApi: `https://apis.${rootDomain}/user-settings-api`,
  voiceApi: `https://voice.${rootDomain}`,
  websiteUrl: `https://www.${rootDomain}`,

  // Environment-specific URLs
  apiGatewayCdnUrl: production ? 'https://apis.rbxcdn.com' : `https://apis.${rootDomain}`,
  eduAuthenticationApi: production
    ? 'https://auth.rblx.org'
    : `https://auth.${domainName}.rblx.org`,
  eduWebsiteUrl: production ? 'https://www.rblx.org' : `https://www.${domainName}.rblx.org`,
  guildedBaseUrl: production ? 'https://guilded.gg' : 'https://tarobi-dev-test.com',
  vngGamesShopUrl: production
    ? 'https://shop.vnggames.com/vn/game/roblox'
    : 'https://sbx-shop.vnggames.com/vn/game/roblox',

  // External URLs
  amazonStoreLink: 'https://www.amazon.com/Roblox-Corporation/dp/B00NUF4YOA',
  // Not sure why this is URL encoded
  amazonWebStoreLink:
    'https%3a%2f%2fwww.amazon.com%2froblox%3f%26_encoding%3dUTF8%26tag%3dr05d13-20%26linkCode%3dur2%26linkId%3d5562fc29c05b45562a86358c198356eb%26camp%3d1789%26creative%3d9325',
  appProtocolUrl: 'robloxmobile://',
  appStoreLink: 'https://itunes.apple.com/us/app/roblox-mobile/id431946152',
  googlePlayStoreLink: 'https://play.google.com/store/apps/details?id=com.roblox.client&amp;hl=en',
  iosAppStoreLink: 'https://itunes.apple.com/us/app/roblox-mobile/id431946152',
  windowsStoreLink: 'https://www.microsoft.com/en-us/store/games/roblox/9nblgggzm6wm',
  xboxStoreLink: 'https://www.microsoft.com/en-us/p/roblox/bq1tn1t79v9k'
};

export default environmentUrls;
