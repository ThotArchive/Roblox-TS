import { TPlayabilityStatusWithUnplayableError } from '../types/playButtonTypes';

export const PlayabilityStatus = {
  UnplayableOtherReason: 'UnplayableOtherReason',
  Playable: 'Playable',
  GuestProhibited: 'GuestProhibited',
  GameUnapproved: 'GameUnapproved',
  IncorrectConfiguration: 'IncorrectConfiguration',
  UniverseRootPlaceIsPrivate: 'UniverseRootPlaceIsPrivate',
  InsufficientPermissionFriendsOnly: 'InsufficientPermissionFriendsOnly',
  InsufficientPermissionGroupOnly: 'InsufficientPermissionGroupOnly',
  DeviceRestricted: 'DeviceRestricted',
  UnderReview: 'UnderReview',
  PurchaseRequired: 'PurchaseRequired',
  AccountRestricted: 'AccountRestricted',
  TemporarilyUnavailable: 'TemporarilyUnavailable',
  ComplianceBlocked: 'ComplianceBlocked',
  ContextualPlayabilityRegionalAvailability: 'ContextualPlayabilityRegionalAvailability',
  ContextualPlayabilityRegionalCompliance: 'ContextualPlayabilityRegionalCompliance',
  ContextualPlayabilityAgeRecommendationParentalControls:
    'ContextualPlayabilityAgeRecommendationParentalControls',
  ContextualPlayabilityAgeGated: 'ContextualPlayabilityAgeGated',
  PlaceHasNoPublishedVersion: 'PlaceHasNoPublishedVersion',
  ContextualPlayabilityUnverifiedSeventeenPlusUser:
    'ContextualPlayabilityUnverifiedSeventeenPlusUser',
  FiatPurchaseRequired: 'FiatPurchaseRequired',
  ContextualPlayabilityUnrated: 'ContextualPlayabilityUnrated',
  ContextualPlayabilityAgeGatedByDescriptor: 'ContextualPlayabilityAgeGatedByDescriptor',
  ContextualPlayabilityExperienceBlockedParentalControls:
    'ContextualPlayabilityExperienceBlockedParentalControls'
} as const;

// NOTE: This does not override the true event name since it is set in:
// Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/services/playGames/playGameService.js
// Roblox.GameLaunch.WebApp/Roblox.GameLaunch.WebApp/js/gamePlayEvents.js
const eventStreamProperties = (
  placeId: string,
  eventProperties: Record<string, string | number | undefined>
): {
  eventName: string;
  ctx: string;
  properties: Record<string, any> & { placeId: string };
  gamePlayIntentEventCtx: string;
} => ({
  eventName: 'playGameClicked',
  ctx: 'click',
  properties: {
    ...eventProperties,
    placeId
  },
  gamePlayIntentEventCtx: 'PlayButton'
});

const playButtonErrorStatusTranslationMap: Record<TPlayabilityStatusWithUnplayableError, string> = {
  [PlayabilityStatus.UnplayableOtherReason]: 'UnplayableError.UnplayableOther',
  [PlayabilityStatus.TemporarilyUnavailable]: 'UnplayableError.TemporarilyUnavailable',
  [PlayabilityStatus.GameUnapproved]: 'UnplayableError.GameUnapproved',
  [PlayabilityStatus.IncorrectConfiguration]: 'UnplayableError.IncorrectConfiguration',
  [PlayabilityStatus.UniverseRootPlaceIsPrivate]: 'UnplayableError.UniverseRootPlaceIsPrivate',
  [PlayabilityStatus.InsufficientPermissionFriendsOnly]:
    'UnplayableError.InsufficientPermissionFriendsOnly',
  [PlayabilityStatus.InsufficientPermissionGroupOnly]:
    'UnplayableError.InsufficientPermissionGroupOnly',
  [PlayabilityStatus.DeviceRestricted]: 'UnplayableError.DeviceRestrictedDefault',
  [PlayabilityStatus.UnderReview]: 'UnplayableError.UnderReview',
  [PlayabilityStatus.AccountRestricted]: 'UnplayableError.AccountRestricted',
  [PlayabilityStatus.ComplianceBlocked]: 'UnplayableError.ComplianceBlocked',
  [PlayabilityStatus.ContextualPlayabilityRegionalAvailability]:
    'UnplayableError.ContextualPlayabilityRegionalAvailability',
  [PlayabilityStatus.ContextualPlayabilityRegionalCompliance]:
    'UnplayableError.ContextualPlayabilityRegionalCompliance',
  [PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls]:
    'UnplayableError.ContextualPlayabilityAgeRecommendationParentalControls',
  [PlayabilityStatus.ContextualPlayabilityAgeGated]:
    'UnplayableError.ContextualPlayabilityAgeGated',
  [PlayabilityStatus.PlaceHasNoPublishedVersion]: 'UnplayableError.PlaceHasNoPublishedVersion',
  [PlayabilityStatus.ContextualPlayabilityUnrated]: 'UnplayableError.ContextualPlayabilityUnrated',
  [PlayabilityStatus.ContextualPlayabilityAgeGatedByDescriptor]:
    'UnplayableError.ContextualPlayabilityAgeGatedByDescriptor',
  [PlayabilityStatus.ContextualPlayabilityExperienceBlockedParentalControls]:
    'UnplayableError.ContextualPlayabilityExperienceBlockedParentalControls'
};

const playButtonTextTranslationMap = {
  ActionNeeded: 'PlayButtonText.ActionNeeded',
  Unplayable: 'PlayButtonText.Unavailable',
  Buy: 'PlayButtonText.Buy'
};

const counterEvents = {
  ActionNeeded: 'ActionNeededButtonShown',
  Unplayable: 'UnplayableErrorShown',
  SeventeenPlusInPlayable: 'ReachedSeventeenPlusCaseInPlayable',
  PlayButtonIXPError: 'PlayButtonIXPIssueCaught',
  PlayButtonExposureError: 'PlayButtonExposureLoggingIssueCaught',
  PlayButtonUpsellSelfUpdateSettingTriggered: 'PlayButtonUpsellSelfUpdateSettingTriggered',
  PlayButtonUpsellAskYourParentTriggered: 'PlayButtonUpsellAskYourParentTriggered',
  PlayButtonUpsellRestrictedUnplayableTriggered: 'PlayButtonUpsellRestrictedUnplayableTriggered',
  PlayButtonUpsellAgeRestrictionVerificationTriggered:
    'PlayButtonUpsellAgeRestrictionVerificationTriggered',
  PlayButtonUpsellUnknownSettingOrAge: 'PlayButtonUpsellUnknownSettingOrAge',
  PlayButtonUpsellAgeNotInMapping: 'PlayButtonUpsellAgeNotInMapping',
  PlayButtonUpsellParentalConsentError: 'PlayButtonUpsellParentalConsentError',
  PlayButtonUpsellAgeRestrictionVerificationError:
    'PlayButtonUpsellAgeRestrictionVerificationError',
  PlayButtonUpsellUnknownRequirement: 'PlayButtonUpsellUnknownRequirement',
  PreparePurchaseUrlError: 'PreparePurchaseUrlError',
  PlayButtonShowIdentificationError: 'PlayButtonShowIdentificationIssueCaught'
};

const avatarChatUpsellLayer = 'Voice.AvatarChat.Upsell';
const avatarChatUpsellLayerU13 = 'Voice.AvatarChat.U13Upsell';
const playButtonLayer = 'Website.PlayButton';

const unlockPlayIntentConstants = {
  eventName: 'unlockPlayIntent',
  gameLaunchFallbackUpsellName: 'GameLaunch',
  restrictedUnplayableUpsellName: 'RestrictedUnplayableOptionNotFound',
  unverifiedSeventeenPlusUpsellName: 'AgeVerificationUnverifiedSeventeenPlusUser',
  fiatPurchaseUpsellName: 'FiatPurchase'
};

export default {
  playButtonErrorStatusTranslationMap,
  playButtonTextTranslationMap,
  eventStreamProperties,
  PlayabilityStatus,
  counterEvents,
  avatarChatUpsellLayer,
  avatarChatUpsellLayerU13,
  playButtonLayer,
  unlockPlayIntentConstants
};
