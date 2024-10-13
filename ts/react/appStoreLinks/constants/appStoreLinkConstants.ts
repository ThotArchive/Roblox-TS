import { EnvironmentUrls } from 'Roblox';
import { getClassNameWithLocale } from '../utils/appStoreLinksUtils';

export const experimentLayer = 'Website.LandingPage';

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
  playStationStore: 'Label.PlayStationStoreRobloxApp',
  playStationLink: 'Link.PlayStationStoreRobloxAppV2',
  metaQuestStore: 'Label.MetaQuestStoreRobloxApp',
  metaQuestStoreLink: 'Link.MetaQuestStoreRobloxApp',
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
    href: landingPageStrings.playStationLink,
    className: getClassNameWithLocale('playstation-badge'),
    name: 'playstation',
    title: landingPageStrings.playStationStore
  },
  {
    href: landingPageStrings.xboxStoreLink,
    className: 'xbox-badge',
    name: 'xbox',
    title: landingPageStrings.xbox
  },
  {
    href: landingPageStrings.metaQuestStoreLink,
    className: getClassNameWithLocale('meta-quest-badge'),
    name: 'meta-quest',
    title: landingPageStrings.metaQuestStore
  },
  {
    href: landingPageStrings.windowsStoreLink,
    className: getClassNameWithLocale('microsoft-badge'),
    name: 'microsoft',
    title: landingPageStrings.windowsStore
  },
  {
    href: landingPageStrings.amazonStoreLink,
    className: getClassNameWithLocale('amazon-badge'),
    name: 'amazon',
    title: landingPageStrings.amazonStore
  }
];
