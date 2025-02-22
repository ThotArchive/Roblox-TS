export const homePage = {
  // deprecated by homePageTileDisplayConfigConstants after home page expansion
  maxTilesPerCarouselPage: 6,
  maxWideGameTilesPerCarouselPage: 4,
  minWideGameTilesPerCarouselPage: 2,
  gameTileWidth: 150,
  homeFeedMaxWidth: 970,
  wideGameTileTilesPerRowBreakpointWidth: 738,

  sortlessGridMaxTilesMetadataToFetch: 300,
  adSortHomePageId: 400000000,
  topicIdsWithoutSeeAll: [500000000, 500000001],
  friendsCarouselAngularBootstrapErrorEvent: 'HomePageFriendsCarouselBootstrapError',
  missingNumberOfRowsForLoggingErrorEvent: 'HomePageMissingNumberOfRowsForLoggingError',
  omniRecommendationEndpointErrorEvent: 'HomePageOmniRecommendationEndpointError',
  omniRecommendationEndpointSuccessEvent: 'HomePageOmniRecommendationEndpointSuccess',
  linkStartDelimiter: '{linkStart}',
  linkEndDelimiter: '{linkEnd}'
};

export const gamesPage = {
  numGameCarouselLookAheadWindows: 3,
  adSortDiscoverId: 27,
  carouselContainerBufferWidth: 80,
  gameTileGutterWidth: 14,
  wideGameTileGutterWidth: 16
};

export const gameDetailsPage = {
  maxTilesPerCarouselPage: 6,
  visitsTruncationDigitsAfterDecimalPoint: 1,
  surveyImpressionsIntersectionThreshold: 0.5,
  eventsRedesignExposureLogError: 'EventsRedesignExposureLogError',
  eventsRedesignExposureLogServiceMissing: 'EventsRedesignExposureLogServiceMissing',
  requestRefundError: 'RequestRefundError',
  votingPanelLoadFailure: 'VotingPanelLoadFailure'
};

export const common = {
  maxTilesInGameImpressionsEvent: 25,
  gameImpressionsIntersectionThreshold: 0.5,
  filterImpressionsIntersectionThreshold: 0.5,
  wideTileHoverGrowWidthPx: 26,
  numberOfInGameAvatarIcons: 3,
  numberOfInGameNames: 1,
  maxFacepileFriendCountValue: 99,
  numberOfGameTilesPerLoad: 60,
  numberOfGamePassesPerLoad: 50,
  keyBoardEventCode: {
    enter: 'Enter',
    escape: 'Escape'
  },
  RatingPercentageText: 'Label.RatingPercentage'
};

export const gameSearchPage = {
  // when 10% of pixels on sentinel tile are visible, load more data
  sentinelTileIntersectionThreshold: 0.1
};

export const surveyLocation = {
  experienceDetails: 'experienceDetails'
};

export default {
  homePage,
  gamesPage,
  gameDetailsPage,
  common
};
