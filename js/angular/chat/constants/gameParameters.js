import chatModule from '../chatModule';

const gameParameters = {
  reasonProhibitedMessage: {
    None: 'None',
    Playable: 'Playable',
    AnonymousAccessProhibited: 'AnonymousAccessProhibited',
    AssetUnapproved: 'AssetUnapproved',
    IncorrectAssetType: 'IncorrectAssetType',
    IncorrectAssetConfiguration: 'IncorrectAssetConfiguration',
    PlaceHasNoUniverse: 'PlaceHasNoUniverse',
    UniverseDoesNotHaveARootPlace: 'This game has no root place.',
    UniverseRootPlaceIsNotAPlace: 'UniverseRootPlaceIsNotAPlace',
    UniverseRootPlaceIsNotActive: 'UniverseRootPlaceIsNotActive',
    InsufficientPermissionCopylocked: 'InsufficientPermissionCopylocked',
    InsufficientPermissionFriendsOnly: 'This game is friends only.',
    InsufficientPermissionGroupOnly: 'Group members only.',
    InsufficientPermissionOwnerOnly: 'InsufficientPermissionOwnerOnly',
    InsufficientPermissionMembershipLevel: 'InsufficientPermissionMembershipLevel',
    InsufficientPermissionRoleSet: 'InsufficientPermissionRoleSet',
    PermissionDenied: 'PermissionDenied',
    RequiredValueNotSet: 'RequiredValueNotSet',
    AssetUnavailable: 'AssetUnavailable',
    DeviceRestricted: 'DeviceRestricted',
    UnderReview: 'This game is under moderation review.',
    PurchaseRequired: 'PurchaseRequired',
    AccountRestricted: 'AccountRestricted',
    PlaceHasNoPublishedVersion: 'This place has no published version.'
  },
  sortNames: {
    myRecent: 'MyRecent'
  },
  maxRowsOfMyRecentGames: 1,
  gameIconMultiGetLimit: 30,
  gameUrl: '/games/{placeId}/robloxgame'
};

chatModule.constant('gameParameters', gameParameters);

export default gameParameters;
