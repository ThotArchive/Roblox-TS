import { Presence } from 'Roblox';

// Common Types
export enum TPageType {
  Home = 'Home',
  Games = 'Games'
}

export enum TContentType {
  Games = 'Games'
}

export enum TTreatmentType {
  Carousel = 'Carousel'
}

export enum TMetainfoValue {
  Invalid = 'Invalid',
  HasLootBoxes = 'HasLootBoxes',
  HasInGameTrading = 'HasInGameTrading',
  IsUsingLootBoxApi = 'IsUsingLootBoxApi',
  IsUsingInGameTradingApi = 'IsUsingInGameTradingApi',
  HasAllowedExternalLinkReferences = 'HasAllowedExternalLinkReferences',
  IsUsingAllowedExternalLinkReferencesApi = 'IsUsingAllowedExternalLinkReferencesApi'
}

export enum TUniverseAvatarType {
  MorphToR6 = 'MorphToR6',
  PlayerChoice = 'PlayerChoice',
  MorphToR15 = 'MorphToR15'
}

export type TGamePassesResponse = {
  data: TGamePass[];
};

export type TGamePass = {
  id: number;
  name: string;
  displayName: string;
  productId: number;
  price: number;
  sellerName: string;
  sellerId: number;
  isOwned: boolean;
};

export type TSort = {
  token: string;
  name: string;
  displayName: string;
  gameSetTargetId?: number;
  gameSetTypeId: number;
  contextCountryRegionId: number;
  tokenExpiryInSeconds: number;
};

export type TMetaData = {
  suggestedKeyword?: string;
  correctedKeyword?: string;
  filteredKeyword?: string;
  nextPageExclusiveStartId?: number;
  featuredSearchUniverseId?: number;
  hasMoreRows: boolean;
  emphasis: boolean;
  algorithm: string;
  algorithmQueryType: string;
  suggestionAlgorithm: string;
};

export type TFriendVisits = {
  userId: number;
};

type TMediaAssetInfo = {
  wideImageAssetId?: string;
  wideImageListId?: string;
};

export type TMediaLayoutData = {
  primaryMediaAsset?: TMediaAssetInfo;
};

export enum TLayoutComponentType {
  TextLabel = 'TextLabel'
}

export type TGameTileTextFooter = {
  type: TLayoutComponentType.TextLabel;
  text: {
    textLiteral: string;
  };
};

type TGameTileFooter = TGameTileTextFooter;

export type TGameTilePillComponent = {
  types: string[];
};

export type TGameTilePillData = {
  id: string;
  text?: string;
  icons?: string[];
  animationClass?: string | null;
};

export type TLayoutMetadata = {
  footer?: TGameTileFooter;
  tileBadgesByPosition?: TTileBadgesByPosition;
  pill?: TGameTilePillComponent;
  title?: string;
  primaryMediaAsset?: TMediaAssetInfo;
};

export type TTileBadgesByPosition = {
  ImageTopLeft?: TTileBadge[];
};

export enum TGameTileBadgeType {
  Text = 'Text',
  Icon = 'Icon'
}

export type TTileBadge = {
  analyticsId: string;
  tileBadgeType: TGameTileBadgeType;
  text?: string;
  icons?: string[];
  isShimmerEnabled?: boolean;
};

type TLayoutDataBySort = {
  [topicId: string]: TLayoutMetadata;
};

export type TGameData = {
  totalUpVotes: number | undefined;
  totalDownVotes: number | undefined;
  universeId: number;
  name: string;
  placeId: number;
  rootPlaceId?: number;
  playerCount: number;
  isSponsored?: boolean;
  nativeAdData?: string;
  isShowSponsoredLabel?: boolean;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  creatorHasVerifiedBadge?: boolean;
  friendActivityTitle?: string;
  friendVisitedString?: string;
  minimumAge?: number;
  ageRecommendationDisplayName?: string;
  friendVisits?: TFriendVisits[];
  primaryMediaAsset?: TMediaAssetInfo;
  defaultLayoutData?: TLayoutMetadata;
  layoutDataBySort?: TLayoutDataBySort;
  navigationUid?: string;
};

export type TPresence = {
  gameId?: string;
  lastLocation: string;
  lastOnline: string;
  placeId?: number;
  placeUrl?: string;
  rootPlaceId?: number;
  universeId?: number;
  userId: number;
  userPresenceType: typeof Presence.PresenceTypes[keyof typeof Presence.PresenceTypes];
};

export type TGameCreator = {
  id: number;
  name: string;
  type: string;
};

export type TRatingInformation = {
  RatingValue: string;
  RatingDescriptors: string[];
  InteractiveElements: string[];
  MetainfoValues: TMetainfoValue[];
  ImageUrl: string;
  RatingValueDescription: string;
};

export type TRating = {
  RatingCountryCode?: string;
  RatingProvider: string;
  RatingInformation: TRatingInformation[];
  RatingProviderUrl: string;
};

// GetOmniRecommendations
export type TOmniRecommendation = {
  ContentType: TContentType.Games;
  ContentId: number;
};

export type TOmniRecommendationSort = {
  Topic: string;
  TopicId: number;
  TreatmentType: TTreatmentType;
  RecommendationList: TOmniRecommendation[];
};

export type TGetOmniRecommendationsMetadataResponse = {
  ContentMetadata: {
    [TContentType.Games]: Record<number, TGameData>;
  };
};

export type TRefundPolicy = {
  policyText: string;
  learnMoreBaseUrl?: string;
  locale: string;
  articleId: string;
};

// GetGameList
export type TGetGamesListResponse = {
  games: TGameData[];
  metaData: TMetaData;
};

// GetPlaceDetails
export type TGetPlaceDetails = {
  placeId: number;
  name: string;
  description: string;
  url: string;
  builder: string;
  builderId: number;
  isPlayable: boolean;
  reasonProhibited: string;
  universeId: number;
  universeRootPlaceId: number;
  price: number;
  imageToken: string;
};

// GetGameDetails
export type TGetGameDetails = {
  id: number;
  rootPlaceId?: number;
  name: string;
  description?: string;
  creator: TGameCreator;
  price?: number;
  isGenreEnforced: true;
  isAllGenre: boolean;
  playing: number;
  visits: number;
  maxPlayers: number;
  favoritedCount: number;
  created: string;
  updated: string;
  copyingAllowed: boolean;
  studioAccessToApisAllowed: boolean;
  createVipServersAllowed: boolean;
  universeAvatarType: TUniverseAvatarType;
  // Old genre value being replaced by genre_l1 and genre_l2
  genre: string;

  // Genre from Updated Taxonomy
  // eslint-disable-next-line camelcase
  genre_l1?: string;

  // Subgenre (level 2 genre) from Updated Taxonomy
  // eslint-disable-next-line camelcase
  genre_l2?: string;

  gameRating?: TRating;
  isFavoritedByUser: boolean;
  sourceName?: string;
  sourceDescription?: string;
  licenseDescription?: string;
  refundLink?: string;
  localizedFiatPrice?: string;
  refundPolicy?: TRefundPolicy;
};

// GetFriends
export type TGetFriendsResponse = {
  isOnline: boolean;
  isDeleted: boolean;
  description?: string;
  created: string;
  isBanned: boolean;
  id: number;
  name: string;
  displayName: string;
  presence?: TPresence;
  profileUrl?: string;
};

// GetPresenceUpdate
export type TPresenseUpdateEvent = CustomEvent<TPresence[] | undefined>;

// GetUniverseVoiceStatus
export type TGetUniverseVoiceStatus = {
  isUniverseEnabledForVoice: boolean;
  isUniverseEnabledForAvatarVideo: boolean;
};

export type TSupportedLocale = {
  id?: number;
  locale?: string;
  name?: string;
  nativeName?: string;
};

export type TGetUserLocaleResponse = {
  signupAndLogin?: TSupportedLocale;
  generalExperience?: TSupportedLocale;
  ugc?: TSupportedLocale;
};

// Types for fetching Asset CDN urls by assetId
type TAssetMetadata = {
  metadataType: number;
  value: string;
};

type TAssetLocation = {
  assetFormat: string;
  // Asset CDN URL
  location: string;
  assetMetadatas: TAssetMetadata[];
};

export type TAssetDataResponse = {
  locations: TAssetLocation[];
};
