const deferredDeeplinkMacLayerName = 'ExperienceDetailsPage.ClientDownload';
const deferredDeeplinkWindowsLayerName = 'ExperienceDetailsPage.Windows.ClientDownload';
const isDeferredDeeplinkEnabledFlagName = 'isDeferredDeeplinkTokenCreationEnabled';

const deferredDeeplinkTokenQueryParameterKey = 'token';

// NOTE: This groupname must match the groupname where the token is redeemed (in this case, game engine), or deeplinks will break.
const deferredDeeplinkGroupName = 'deeplink';

// Supported deep link paths can be found https://roblox.atlassian.net/wiki/x/2YC4Xg
const supportedDeferredDeeplinkPaths = [
  '/games/{placeId}/{placeName}',
  '/share-links?code={linkId}&type=ExperienceInvite'
];
const supportedDeferredDeeplinkPathPatterns = supportedDeferredDeeplinkPaths.map(
  path => new RegExp(path.replace(/\{.*?\}/g, '([^/]+)'))
);

export {
  deferredDeeplinkMacLayerName,
  deferredDeeplinkWindowsLayerName,
  deferredDeeplinkGroupName,
  isDeferredDeeplinkEnabledFlagName,
  deferredDeeplinkTokenQueryParameterKey,
  supportedDeferredDeeplinkPathPatterns
};
