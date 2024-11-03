export interface DeepLinkParams {
  [param: string]: string;
}

export enum PathPart {
  GameDetails = 'game_details',
  Profile = 'profile',
  Home = 'home',
  Games = 'games',
  Avatar = 'avatar',
  Catalog = 'catalog',
  Friends = 'friends',
  ItemDetails = 'item_details',
  Navigation = 'navigation',
  PlaceId = 'placeId',
  UserId = 'userId',
  ShareLinks = 'share_links',
  Chat = 'chat',
  GiftCards = 'gift_cards',
  NotificationSettings = 'notification_settings',
  AccountInfo = 'account_info',
  PrivacySettings = 'privacy_settings',
  ParentalControls = 'parental_controls',
  SpendingSettings = 'spending_settings',
  Group = 'group',
  ExternalWebUrl = 'external_web_link'
}

export enum ItemType {
  Asset = 'Asset',
  Bundle = 'Bundle',
  Look = 'Look'
}

export const ItemTypePathMap: { [path: string]: string } = {
  [ItemType.Asset]: '/catalog',
  [ItemType.Bundle]: '/bundles',
  [ItemType.Look]: '/looks'
};

export type DeepLink = {
  path: Array<PathPart>;
  params: DeepLinkParams;
  url: string;
};

export const DeepLinkNavigationMap: { [path: string]: string } = {
  [PathPart.Home]: '/home',
  [PathPart.Games]: '/games',
  [PathPart.Catalog]: '/catalog',
  [PathPart.Friends]: '/users/friends',
  [PathPart.GiftCards]: '/giftcards',
  [PathPart.NotificationSettings]: '/my/account#!/notifications',
  [PathPart.AccountInfo]: '/my/account#!/info',
  [PathPart.PrivacySettings]: '/my/account#!/privacy',
  [PathPart.ParentalControls]: '/my/account#!/parental-controls',
  [PathPart.SpendingSettings]: '/my/account#!/billing',
  [PathPart.Group]: '/groups/{groupId}'
};

export const UrlPart = {
  Games: '/games',
  Users: '/users',
  Groups: '/groups',
  Profile: '/profile',
  GameStart: '/games/start',
  GiftCards: '/giftcards',
  ExperienceLauncher: 'roblox://experiences/start?',
  Asset: '/catalog',
  Bundle: '/bundles',
  Look: '/looks',
  AppLauncher: 'roblox://navigation',
  ContentPost: '/content_posts',
  Avatar: '/my/avatar'
};

export const buildResolveLinkEvent = (
  linkStatus: string,
  linkId: string,
  linkType: string
): {
  type: string;
  context: string;
  params: { linkType: string; linkStatus: string; linkId: string };
} => {
  return {
    type: 'linkResolved',
    context: 'deepLink',
    params: {
      linkType,
      linkStatus,
      linkId
    }
  };
};

export const CounterEvents = {
  NavigationFailed: 'DeeplinkParserNavigationFailed',
  InviteResolutionFailed: 'DeeplinkParserInviteResolutionFailed',
  NotificationInviteResolutionFailed: 'DeeplinkParserNotificationInviteResolutionFailed',
  FriendRequestResolutionFailed: 'DeeplinkParserFriendRequestResolutionFailed',
  ProfileShareResolutionFailed: 'DeeplinkParserProfileShareResolutionFailed',
  ScreenshotInviteShareResolutionFailed: 'DeeplinkParserScreenshotInviteShareResolutionFailed',
  PrivateServerLinkResolutionFailed: 'DeeplinkParserPrivateServerLinkResolutionFailed',
  ExperienceDetailsResolutionFailed: 'DeeplinkParserExperienceDetailsResolutionFailed',
  AvatarItemDetailsResolutionFailed: 'DeeplinkParserAvatarItemDetailsResolutionFailed',
  ExperienceAffiliateResolutionFailed: 'DeeplinkParserExperienceAffiliateResolutionFailed',
  ContentPostResolutionFailed: 'DeeplinkParserContentPostResolutionFailed',
  ExperienceEventResolutionFailed: 'DeeplinkParserExperienceEventResolutionFailed'
};

export const buildDeepLinkLaunchGameEvent = (
  placeId: string,
  linkId: string,
  linkStatus: string
): {
  eventName: string;
  ctx: string;
  gamePlayIntentEventCtx: string;
  properties: {
    linkStatus: string;
    linkType: string;
    placeId: string;
    linkId: string;
  };
} => {
  return {
    eventName: 'joinGameFromInviteLink',
    ctx: 'shareLinks',
    gamePlayIntentEventCtx: 'shareLinks',
    properties: {
      linkStatus,
      linkType: 'ExperienceInvite',
      placeId,
      linkId
    }
  };
};
