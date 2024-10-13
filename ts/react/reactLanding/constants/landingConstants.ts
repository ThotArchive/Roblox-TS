import { EnvironmentUrls } from 'Roblox';
import { getClassNameWithLocale } from '../utils/landingUtils';

export const experimentLayer = 'Website.LandingPage';

export const urlConstants = {
  contentRatingLogoPolicy: `${EnvironmentUrls.universalAppConfigurationApi}/v1/behaviors/content-rating-logo/content`,
  loginLink: `${EnvironmentUrls.websiteUrl}/login`,
  brazilContentRatingGuide: 'https://www.justica.gov.br/seus-direitos/classificacao/guia-pratico',
  italyContentRatingGuide: 'https://pegi.info/'
};

export const landingPageStrings = {
  amazonStore: 'Label.RobloxAmazonStore',
  amazonStoreLink: 'Link.AmazonStoreRobloxApp',
  appStore: 'Label.RobloxAppStore',
  appStoreLink: 'Link.AppleAppStoreRobloxApp',
  brazilContentRatingTitle: 'Label.BrazilContentRatingLogoTitle',
  brazilContentRatingSubtitle: 'Label.BrazilContentRatingLogoSubtitle',
  continue: 'Action.Continue',
  cancel: 'Action.Cancel',
  externalWebsiteRedirect: 'Description.ExternalWebsiteRedirect',
  googlePlay: 'Label.GetOnGooglePlay',
  googlePlayStoreLink: 'Link.GooglePlayStoreRobloxApp',
  italyContentRatingTitle: 'Label.ItalyContentRatingLogoTitle',
  leavingRoblox: 'Heading.LeavingRoblox',
  logIn: 'Action.LogInCapitalized',
  robloxOnDevice: 'Heading.RobloxOnDevice',
  windowsStore: 'Label.RobloxWindowsStore',
  windowsStoreLink: 'Link.WindowsStoreRobloxApp',
  xbox: 'Label.RobloxOnXbox',
  xboxStoreLink: 'Link.XboxStoreRobloxApp'
};

type appStoreLinkStrings = {
  href: string;
  className: string;
  name: string;
  title: string;
};

export const appStoreLinkConstants: appStoreLinkStrings[] = [
  {
    href: landingPageStrings.appStoreLink,
    className: getClassNameWithLocale('apple-badge'),
    name: 'apple',
    title: landingPageStrings.appStore
  },
  {
    href: landingPageStrings.googlePlayStoreLink,
    className: getClassNameWithLocale('google-badge'),
    name: 'google',
    title: landingPageStrings.googlePlay
  },
  {
    href: landingPageStrings.amazonStoreLink,
    className: getClassNameWithLocale('amazon-badge'),
    name: 'amazon',
    title: landingPageStrings.amazonStore
  },
  {
    href: landingPageStrings.xboxStoreLink,
    className: 'xbox-badge',
    name: 'xbox',
    title: landingPageStrings.xbox
  },
  {
    href: landingPageStrings.windowsStoreLink,
    className: getClassNameWithLocale('microsoft-badge'),
    name: 'microsoft',
    title: landingPageStrings.windowsStore
  }
];
