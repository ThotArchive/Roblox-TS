import { eventStreamService } from 'core-roblox-utilities';
import { parseEventParams } from '../utils/parsingUtils';
import { AttributionType, getAttributionId } from '../utils/attributionUtils';
import { getHttpReferrer } from '../utils/browserUtils';
import { PageContext } from '../types/pageContext';

const {
  eventTypes: { pageLoad, formInteraction }
} = eventStreamService;

export enum EventStreamMetadata {
  AbsPositions = 'absPositions',
  AdsPositions = 'adsPositions',
  AdFlags = 'adFlags',
  Algorithm = 'algorithm',
  AppliedFilters = 'appliedFilters',
  AttributionId = 'attributionId',
  Direction = 'direction',
  Distance = 'distance',
  HttpReferrer = 'httpReferrer',
  EmphasisFlag = 'emphasisFlag',
  FilterId = 'filterId',
  FilterIds = 'filterIds',
  GameSetTargetId = 'gameSetTargetId',
  GameSetTypeId = 'gameSetTypeId',
  InteractionType = 'interactionType',
  IsAd = 'isAd',
  NativeAdData = 'nativeAdData',
  AdIds = 'adIds',
  NumberOfLoadedTiles = 'numberOfLoadedTiles',
  Page = 'page',
  PageSession = 'pageSession',
  PlaceId = 'placeId',
  PlayContext = 'playContext',
  Position = 'position',
  PreviousOptionId = 'previousOptionId',
  PromptId = 'promptId',
  PromptText = 'promptText',
  ResourceId = 'resourceId',
  ResponseOptionIds = 'responseOptionIds',
  ResponseOptionTexts = 'responseOptionTexts',
  RootPlaceIds = 'rootPlaceIds',
  SelectedIds = 'selectedIds',
  SelectedTexts = 'selectedTexts',
  ScreenSizeX = 'screenSizeX',
  ScreenSizeY = 'screenSizeY',
  ScrollAreaSize = 'scrollAreaSize',
  ScrollDepth = 'scrollDepth',
  SelectedOptionId = 'selectedOptionId',
  SelectedOptionIds = 'selectedOptionIds',
  ShareLinkType = 'shareLinkType',
  ShareLinkId = 'shareLinkId',
  SortId = 'sortId',
  SortPos = 'sortPos',
  StartDepth = 'startDepth',
  StartPos = 'startPos',
  SuggestionKwd = 'suggestionKwd',
  SuggestionReplacedKwd = 'suggestionReplacedKwd',
  SuggestionCorrectedKwd = 'suggestionCorrectedKwd',
  SuggestionAlgorithm = 'suggestionAlgorithm',
  TimeToRespond = 'timeToRespond',
  Token = 'token',
  Topics = 'topics',
  TreatmentType = 'treatmentType',
  UniverseId = 'universeId',
  UniverseIds = 'universeIds',
  FriendId = 'friendId',
  ThumbnailAssetIds = 'thumbnailAssetIds',
  ThumbnailListIds = 'thumbnailListIds',
  LinkPath = 'linkPath',
  LocationName = 'locationName',
  RowsOnPage = 'rowsOnPage',
  PositionsInRow = 'positionsInRow',
  NavigationUids = 'navigationUids',
  TileBadgeContexts = 'tileBadgeContexts',
  ButtonName = 'buttonName',
  IsInterested = 'isInterested',
  InterestedUniverseIds = 'interestedUniverseIds'
}

export enum EventType {
  GameImpressions = 'gameImpressions',
  GameDetailReferral = 'gameDetailReferral',
  SortDetailReferral = 'sortDetailReferral',
  FeedScroll = 'feedScroll',
  NavigateToSortLink = 'navigateToSortLink',
  SurveyInteraction = 'surveyInteraction',
  SurveyImpression = 'surveyImpression',
  InterestCatcherClick = 'interestCatcherClick',
  FilterImpressions = 'filterImpressions',
  GamesFilterClick = 'gamesFilterClick'
}

export enum SessionInfoType {
  HomePageSessionInfo = 'homePageSessionInfo',
  GameSearchSessionInfo = 'gameSearchSessionInfo',
  DiscoverPageSessionInfo = 'discoverPageSessionInfo'
}

export enum TSurveyInteractionType {
  Submission = 'submission',
  Cancellation = 'cancellation'
}

export type TSurveyInteraction =
  | {
      [EventStreamMetadata.LocationName]: string;
      [EventStreamMetadata.ResourceId]?: string;
      [EventStreamMetadata.Token]: string;
      [EventStreamMetadata.PromptText]: string;
      [EventStreamMetadata.PromptId]: number;
      [EventStreamMetadata.TimeToRespond]: number;
      [EventStreamMetadata.ResponseOptionTexts]: string[];
      [EventStreamMetadata.ResponseOptionIds]: number[];
      [EventStreamMetadata.SelectedTexts]?: string[];
      [EventStreamMetadata.SelectedIds]?: number[];
      [EventStreamMetadata.InteractionType]: TSurveyInteractionType;
    }
  | Record<string, never>;

export type TSurveyImpression =
  | {
      [EventStreamMetadata.LocationName]: string;
      [EventStreamMetadata.ResourceId]?: string;
      [EventStreamMetadata.Token]: string;
      [EventStreamMetadata.PromptText]: string;
      [EventStreamMetadata.PromptId]: number;
      [EventStreamMetadata.ResponseOptionTexts]: string[];
      [EventStreamMetadata.ResponseOptionIds]: number[];
    }
  | Record<string, never>;

export type TEvent = [
  { name: string; type: EventType; context: string },
  Record<string, string | number>
];

export type TBuildNavigateToSortLinkEventProperties = () => TNavigateToSortLink | undefined;

type TBaseGameImpressions = {
  [EventStreamMetadata.RootPlaceIds]: number[];
  [EventStreamMetadata.AbsPositions]: number[];
  [EventStreamMetadata.UniverseIds]: number[];
  [EventStreamMetadata.GameSetTypeId]?: number;
  [EventStreamMetadata.AdsPositions]?: number[];
  [EventStreamMetadata.AdFlags]?: number[];
  [EventStreamMetadata.AdIds]?: string[];
  [EventStreamMetadata.ThumbnailAssetIds]?: string[];
  [EventStreamMetadata.ThumbnailListIds]?: string[];
  [EventStreamMetadata.NavigationUids]?: string[];
  [EventStreamMetadata.TileBadgeContexts]?: string[];
  [EventStreamMetadata.AppliedFilters]?: string;
};

export type TGridGameImpressions = TBaseGameImpressions & {
  [EventStreamMetadata.SuggestionKwd]?: string;
  [EventStreamMetadata.SuggestionReplacedKwd]?: string;
  [EventStreamMetadata.SuggestionCorrectedKwd]?: string;
  [EventStreamMetadata.SuggestionAlgorithm]?: string;
  [EventStreamMetadata.Algorithm]?: string;
  [SessionInfoType.GameSearchSessionInfo]?: string;
  [SessionInfoType.HomePageSessionInfo]?: string;
  [EventStreamMetadata.EmphasisFlag]?: boolean;
  [EventStreamMetadata.SortPos]?: number;
  [EventStreamMetadata.NumberOfLoadedTiles]?: number;
  [EventStreamMetadata.Page]:
    | PageContext.SearchPage
    | PageContext.SortDetailPageDiscover
    | PageContext.SortDetailPageHome
    | PageContext.HomePage
    | PageContext.InterestCatcher;
};

export enum ScrollDirection {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export type TFeedScroll = {
  [EventStreamMetadata.StartPos]: number;
  [EventStreamMetadata.Distance]: number;
  [EventStreamMetadata.Direction]: ScrollDirection;
  [EventStreamMetadata.PageSession]: string;
  [EventStreamMetadata.GameSetTypeId]?: number;
  [EventStreamMetadata.GameSetTargetId]?: number;
  [EventStreamMetadata.SortPos]?: number;
  [EventStreamMetadata.ScrollDepth]: number;
  [EventStreamMetadata.StartDepth]: number;
  [EventStreamMetadata.ScreenSizeX]: number;
  [EventStreamMetadata.ScreenSizeY]: number;
  [EventStreamMetadata.ScrollAreaSize]: number;
};

export type TNavigateToSortLink =
  | {
      [EventStreamMetadata.LinkPath]: string;
      [EventStreamMetadata.SortPos]: number;
      [EventStreamMetadata.GameSetTypeId]: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.Page]: PageContext.HomePage | PageContext.GamesPage;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [SessionInfoType.DiscoverPageSessionInfo]?: string;
    }
  | Record<string, never>;

export type TCarouselGameImpressions = TBaseGameImpressions & {
  [EventStreamMetadata.SortPos]: number;
  [SessionInfoType.HomePageSessionInfo]?: string;
  [SessionInfoType.DiscoverPageSessionInfo]?: string;
  [EventStreamMetadata.Page]:
    | PageContext.SortDetailPageDiscover
    | PageContext.SortDetailPageHome
    | PageContext.HomePage
    | PageContext.GamesPage
    | PageContext.GameDetailPage;
};

export type TGameImpressions = TCarouselGameImpressions | TGridGameImpressions;

export type TSortDetailReferral =
  | {
      [EventStreamMetadata.Position]: number;
      [EventStreamMetadata.SortId]?: number;
      [EventStreamMetadata.GameSetTypeId]?: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [SessionInfoType.DiscoverPageSessionInfo]?: string;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [EventStreamMetadata.TreatmentType]?: string;
      [EventStreamMetadata.Page]: PageContext.HomePage | PageContext.GamesPage;
    }
  | Record<string, never>;

export type TGameDetailReferral =
  | {
      [EventStreamMetadata.PlaceId]: number;
      [EventStreamMetadata.UniverseId]: number;
      [EventStreamMetadata.IsAd]?: boolean;
      [EventStreamMetadata.NativeAdData]?: string;
      [EventStreamMetadata.Position]: number;
      [EventStreamMetadata.SortPos]?: number;
      [EventStreamMetadata.NumberOfLoadedTiles]?: number;
      [EventStreamMetadata.GameSetTypeId]?: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.FriendId]?: number;
      [EventStreamMetadata.AttributionId]?: string;
      [EventStreamMetadata.AppliedFilters]?: string;
      [SessionInfoType.DiscoverPageSessionInfo]?: string;
      [SessionInfoType.GameSearchSessionInfo]?: string;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [EventStreamMetadata.Page]:
        | PageContext.SearchPage
        | PageContext.SortDetailPageDiscover
        | PageContext.SortDetailPageHome
        | PageContext.HomePage
        | PageContext.GamesPage
        | PageContext.GameDetailPage
        | PageContext.PeopleListInHomePage;
      [EventStreamMetadata.ShareLinkType]?: string;
      [EventStreamMetadata.ShareLinkId]?: string;
    }
  | Record<string, never>;

export enum TInterestCatcherButton {
  Skip = 'skip',
  Continue = 'continue',
  Interested = 'interested'
}

export type TInterestCatcherClick =
  | {
      [EventStreamMetadata.ButtonName]: TInterestCatcherButton;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [EventStreamMetadata.Page]: PageContext.HomePage;

      // Additional fields for Skip/Continue button clicks
      [EventStreamMetadata.InterestedUniverseIds]?: number[];

      // Additional fields for Interested button clicks
      [EventStreamMetadata.Position]?: number;
      [EventStreamMetadata.PlaceId]?: number;
      [EventStreamMetadata.UniverseId]?: number;
      [EventStreamMetadata.GameSetTypeId]?: number;
      [EventStreamMetadata.NumberOfLoadedTiles]?: number;
      [EventStreamMetadata.IsInterested]?: boolean;
    }
  | {};

export type TFilterImpressions =
  | {
      [EventStreamMetadata.AbsPositions]: number[];
      [EventStreamMetadata.FilterIds]: string[];
      [EventStreamMetadata.SelectedOptionIds]: string[];
      [EventStreamMetadata.GameSetTypeId]: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.SortPos]: number;
      [SessionInfoType.DiscoverPageSessionInfo]: string;
      [EventStreamMetadata.Page]: PageContext.GamesPage;
    }
  | {};

export enum TGamesFilterButton {
  OpenDropdown = 'openDropdown',
  CloseDropdown = 'closeDropdown',
  Apply = 'apply'
}

export type TGamesFilterClick =
  | {
      [EventStreamMetadata.ButtonName]: TGamesFilterButton;
      [EventStreamMetadata.GameSetTypeId]: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.SortPos]: number;
      [EventStreamMetadata.FilterId]: string;
      [EventStreamMetadata.SelectedOptionId]: string;
      [EventStreamMetadata.PreviousOptionId]?: string;
      [SessionInfoType.DiscoverPageSessionInfo]: string;
      [EventStreamMetadata.Page]: PageContext.GamesPage;
    }
  | {};

export default {
  [EventType.GameImpressions]: ({ ...params }: TGameImpressions): TEvent => [
    {
      name: EventType.GameImpressions,
      type: EventType.GameImpressions,
      context: formInteraction
    },
    parseEventParams({
      ...params
    })
  ],
  [EventType.GameDetailReferral]: (params: TGameDetailReferral = {}): TEvent => [
    {
      name: EventType.GameDetailReferral,
      type: EventType.GameDetailReferral,
      context: pageLoad
    },
    parseEventParams({
      [EventStreamMetadata.AttributionId]: getAttributionId(AttributionType.GameDetailReferral),
      [EventStreamMetadata.HttpReferrer]: getHttpReferrer(),
      ...params
    })
  ],
  [EventType.SortDetailReferral]: (params: TSortDetailReferral = {}): TEvent => [
    {
      name: EventType.SortDetailReferral,
      type: EventType.SortDetailReferral,
      context: pageLoad
    },
    parseEventParams({
      ...params
    })
  ],
  [EventType.NavigateToSortLink]: (params: TNavigateToSortLink = {}): TEvent => [
    {
      name: EventType.NavigateToSortLink,
      type: EventType.NavigateToSortLink,
      context: formInteraction
    },
    parseEventParams({
      ...params
    })
  ],
  [EventType.SurveyInteraction]: (params: TSurveyInteraction = {}): TEvent => [
    {
      name: EventType.SurveyInteraction,
      type: EventType.SurveyInteraction,
      context: formInteraction
    },
    parseEventParams({
      ...params
    })
  ],
  [EventType.SurveyImpression]: (params: TSurveyImpression = {}): TEvent => [
    {
      name: EventType.SurveyImpression,
      type: EventType.SurveyImpression,
      context: formInteraction
    },
    parseEventParams({
      ...params
    })
  ],
  [EventType.InterestCatcherClick]: (params: TInterestCatcherClick = {}): TEvent => [
    {
      name: EventType.InterestCatcherClick,
      type: EventType.InterestCatcherClick,
      context: formInteraction
    },
    parseEventParams({
      ...params
    })
  ],
  [EventType.FilterImpressions]: (params: TFilterImpressions = {}): TEvent => [
    {
      name: EventType.FilterImpressions,
      type: EventType.FilterImpressions,
      context: formInteraction
    },
    parseEventParams({
      ...params
    })
  ],
  [EventType.GamesFilterClick]: (params: TGamesFilterClick = {}): TEvent => [
    {
      name: EventType.GamesFilterClick,
      type: EventType.GamesFilterClick,
      context: formInteraction
    },
    parseEventParams({
      ...params
    })
  ]
};
