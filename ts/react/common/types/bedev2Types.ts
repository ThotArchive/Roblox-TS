import { TOmniRecommendationSduiTree } from '../../sdui/system/SduiTypes';
import { TGameData } from './bedev1Types';

export enum TContentType {
  Game = 'Game',
  CatalogAsset = 'CatalogAsset',
  CatalogBundle = 'CatalogBundle'
}

export enum TTreatmentType {
  Carousel = 'Carousel',
  AvatarCarousel = 'AvatarCarousel',
  SortlessGrid = 'SortlessGrid',
  FriendCarousel = 'FriendCarousel',
  InterestGrid = 'InterestGrid',
  Pills = 'Pills',
  Sdui = 'sdui'
}

export enum TSortTopic {
  Sponsored = 'Sponsored',
  SponsoredGame = 'SponsoredGame'
}

export enum TComponentType {
  AppGameTileNoMetadata = 'AppGameTileNoMetadata',
  GridTile = 'GridTile',
  EventTile = 'EventTile',
  InterestTile = 'InterestTile',
  ExperienceEventsTile = 'ExperienceEventsTile'
}

export enum TPlayerCountStyle {
  Always = 'Always',
  Hover = 'Hover',
  Footer = 'Footer'
}

export enum TPlayButtonStyle {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum THoverStyle {
  imageOverlay = 'imageOverlay'
}

export type TCatalog = {
  name: string;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  lowestPrice?: number;
  price?: number;
  premiumPrice?: number;
  numberRemaining?: number;
  noPriceStatus: string;
  itemStatus: string[];
  itemRestrictions: string[];
  itemId: number;
  itemType: string;
};

export type TOmniRecommendationGame = {
  contentType: TContentType.Game;
  contentId: number;
  contentMetadata: Record<string, string>;
};
export type TOmniRecommendationCatalog = {
  contentType: TContentType.CatalogAsset | TContentType.CatalogBundle;
  contentId: number;
};
export type TOmniRecommendation = TOmniRecommendationGame | TOmniRecommendationCatalog;

export type TTopicLayoutData = {
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  hoverStyle?: THoverStyle;
  infoText?: string;
  hideSeeAll?: 'true' | 'false';
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: 'true' | 'false';
  linkPath?: string;
  subtitleLinkPath?: string;
  endTimestamp?: string;
  countdownString?: string;
  backgroundImageAssetId?: string;
};

type TSharedGameSort = {
  topic: string;
  topicId: number;
  treatmentType:
    | TTreatmentType.Carousel
    | TTreatmentType.SortlessGrid
    | TTreatmentType.InterestGrid;
  subtitle?: string;
  topicLayoutData?: TTopicLayoutData;
};

export type TOmniRecommendationSduiSort = {
  topicId: number;
  treatmentType: TTreatmentType.Sdui;
  numberOfRows?: number;

  feedItemKey: string;
};

export type TOmniRecommendationGameSort = TSharedGameSort & {
  recommendationList: TOmniRecommendationGame[];
  numberOfRows?: number;
};

export type TOmniRecommendationCatalogSort = {
  topic: string;
  topicId: number;
  treatmentType: TTreatmentType.AvatarCarousel;
  recommendationList: TOmniRecommendationCatalog[];
  numberOfRows?: number;
};

export type TOmniRecommendationFriendSort = {
  topic: string;
  topicId: number;
  treatmentType: TTreatmentType.FriendCarousel;
  numberOfRows?: number;
};

export type TFilterOption = {
  optionId: string;
  optionDisplayName: string;
};

export type TFiltersData = {
  filterId: string;
  filterDisplayName: string;
  filterType: string;
  filterOptions: TFilterOption[];
  selectedOptionId: string;
};

type TSharedExploreApiSortResponse = {
  sortDisplayName: string;
  sortId: string;
  contentType: string;
  nextPageToken?: string;
  gameSetTypeId: number;
  gameSetTargetId?: number;
  subtitle?: string;
  topicLayoutData?: TTopicLayoutData;
};

export type TExploreApiGameSortResponse = TSharedExploreApiSortResponse & {
  treatmentType: TTreatmentType.Carousel;
  games: TGameData[];
  appliedFilters?: string;
};

export type TExploreApiFiltersSortResponse = TSharedExploreApiSortResponse & {
  treatmentType: TTreatmentType.Pills;
  filters: TFiltersData[];
};

export type TExploreApiSortResponse = TExploreApiGameSortResponse | TExploreApiFiltersSortResponse;

export type TExploreApiSortsResponse = {
  sorts: TExploreApiSortResponse[];
  nextSortsPageToken: string;
};

export type TExploreApiGameSort = TSharedGameSort & {
  games: TGameData[];
  sortId: string;
  contentType: string;
  nextPageToken: string;
  gameSetTargetId?: number;
  appliedFilters?: string;
};

export type TExploreApiFiltersSort = {
  topic: string;
  topicId: number;
  treatmentType: TTreatmentType.Pills;
  subtitle?: string;
  topicLayoutData?: TTopicLayoutData;
  filters: TFiltersData[];
  nextPageToken: string;
  sortId: string;
  contentType: string;
  gameSetTargetId?: number;
};

export type TExploreApiSort = TExploreApiGameSort | TExploreApiFiltersSort;

export type TExploreApiSorts = {
  sorts: TExploreApiSort[];
  nextSortsPageToken: string;
};

export type TGameSort = TExploreApiGameSort | TOmniRecommendationGameSort;

export type TOmniRecommendationSort =
  | TOmniRecommendationGameSort
  | TOmniRecommendationCatalogSort
  | TOmniRecommendationFriendSort
  | TOmniRecommendationSduiSort;

export type TSort =
  | TGameSort
  | TOmniRecommendationCatalogSort
  | TOmniRecommendationFriendSort
  | TExploreApiFiltersSort
  | TOmniRecommendationSduiSort;

export type TGetOmniRecommendationsMetadataResponse = {
  contentMetadata: TOmniRecommendationsContentMetadata;
};

export type TOmniRecommendationsContentMetadata = {
  [TContentType.Game]: Record<string, TGameData>;
  [TContentType.CatalogAsset]: Record<string, TCatalog>;
  [TContentType.CatalogBundle]: Record<string, TCatalog>;
};

export type TGetOmniRecommendationsResponse = {
  sorts: TOmniRecommendationSort[];
  sdui?: TOmniRecommendationSduiTree;
} & TGetOmniRecommendationsMetadataResponse;

export enum TOmniSearchPageType {
  All = 'all'
}

export enum TOmniSearchContentType {
  Game = 'Game'
}

export type TOmniSearchContentDataModel = {
  contentType: string;
  contentId: number;
};

export type TOmniSearchGameDataModel = {
  contentType: string; // 'Game'
  contentId: number; // universeId
  universeId: number;
  rootPlaceId: number;
  name: string;
  description: string;
  playerCount: number;
  totalUpVotes: number;
  totalDownVotes: number;
  emphasis: boolean;
  isSponsored: boolean;
  nativeAdData: string;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  creatorHasVerifiedBadge?: boolean;
};

export type TOmniSearchContentGroup = {
  contentGroupType: string;
  contents: TOmniSearchContentDataModel[];
};

export type TGetOmniSearchResponse = {
  searchResults: TOmniSearchContentGroup[];
  filteredSearchQuery: string;
  nextPageToken: string;
};

export type TGetOmniSearchParsedResponse = {
  filteredSearchQuery: string;
  nextPageToken: string;
  gamesList: TOmniSearchGameDataModel[];
};

export type TSurvey = {
  meta: TSurveyMeta;
  content: TSurveyContent;
};

export type TSurveyMeta = {
  token: string;
};

export type TSurveyContent = {
  container: TSurveyContainer;
  prompt: TSurveyPrompt;
};

export type TSurveyContainer = {
  iconKey?: string;
  responseType: string;
  isDismissible?: boolean;
};

export type TTextWithIdentifier = {
  text: string;
  id: number;
};

export type TSurveyPrompt = {
  promptText: TTextWithIdentifier;
  subtitleText: string;
  responseOptions: TTextWithIdentifier[];
};

export type TSurveyResponseBody = {
  selectedText?: string[];
  selectedIds?: number[];
  resourceId?: string;
  token: string;
};

export type TSendSurveyResultsResponse = {
  success: boolean;
};

export enum TSurveyIcon {
  helpIcon = 'helpIcon'
}

export type TGuacAppPolicyBehaviorResponse = {
  shouldShowVpcPlayButtonUpsells: boolean;
  EnableAggregateLikesFavoritesCount: boolean;
};

export type TProfile = {
  userId: number;
  names: { combinedName: string; username: string };
};

export type TGetProfilesResponse = {
  profileDetails: TProfile[];
};
