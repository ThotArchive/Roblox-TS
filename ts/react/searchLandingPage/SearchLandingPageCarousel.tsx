import React, { useCallback, useContext, useRef, useMemo } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { fireEvent } from 'roblox-event-tracker';
import { TBuildEventProperties } from '../common/components/GameTileUtils';
import { EventStreamMetadata, SessionInfoType } from '../common/constants/eventStreamConstants';
import { PageContext } from '../common/types/pageContext';
import useGameImpressionsIntersectionTracker, {
  TBuildCarouselGameImpressionsEventProperties
} from '../common/hooks/useGameImpressionsIntersectionTracker';
import GameCarouselContainerHeader from '../common/components/GameCarouselContainerHeader';
import GameCarouselHorizontalScroll from '../gamesPage/components/GameCarouselHorizontalScroll';
import {
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData
} from '../common/utils/parsingUtils';
import SearchLandingPageSessionContext from './SearchLandingPageSessionContext';
import useFriendsPresence from '../common/hooks/useFriendsPresence';
import { getSortTargetIdMetadata } from '../omniFeed/utils/gameSortUtils';
import { TGameSort } from '../common/types/bedev2Types';
import { TGameData } from '../common/types/bedev1Types';
import { searchLandingPage } from '../common/constants/configConstants';

type SearchLandingPageGamesCarouselProps = {
  positionId: number;
  sort: TGameSort;
  translate: WithTranslationsProps['translate'];
  itemsPerRow?: number;
  gameData: TGameData[];
};

const SearchLandingPageGamesCarousel = ({
  translate,
  sort,
  positionId,
  itemsPerRow,
  gameData
}: SearchLandingPageGamesCarouselProps): JSX.Element => {
  const sessionInfo = useContext(SearchLandingPageSessionContext);
  // Type union will be cleaned up with isCarouselHorizontalScrollEnabled
  const carouselRef = useRef<HTMLDivElement | HTMLUListElement>(null);
  const friendsPresence = useFriendsPresence();

  const sortId = useMemo(() => {
    // TODO CLIGROW-2294 Update this to be int sort id provided by BE
    return searchLandingPage.missingSortIdDefault;
  }, []);

  const buildEventProperties: TBuildEventProperties = useCallback(
    (data, id) => ({
      [EventStreamMetadata.PlaceId]: data.placeId,
      [EventStreamMetadata.UniverseId]: data.universeId,
      [EventStreamMetadata.IsAd]: data.isSponsored,
      [EventStreamMetadata.NativeAdData]: data.nativeAdData,
      [EventStreamMetadata.Position]: id,
      [EventStreamMetadata.SortPos]: positionId,
      [EventStreamMetadata.NumberOfLoadedTiles]: gameData.length,
      [EventStreamMetadata.GameSetTypeId]: sortId,
      ...getSortTargetIdMetadata(sort),
      [EventStreamMetadata.Page]: PageContext.SearchLandingPage,
      [SessionInfoType.SearchLandingPageSessionInfo]: sessionInfo,
      [EventStreamMetadata.PlayContext]: PageContext.SearchLandingPage
    }),
    [positionId, gameData.length, sortId, sort, sessionInfo]
  );

  const buildGameImpressionsProperties: TBuildCarouselGameImpressionsEventProperties = useCallback(
    (viewedIndexes: number[]) => {
      const filteredViewedIndexes = viewedIndexes.filter(id => id < gameData.length);
      return {
        [EventStreamMetadata.RootPlaceIds]: filteredViewedIndexes.map(id => gameData[id]?.placeId),
        [EventStreamMetadata.UniverseIds]: filteredViewedIndexes.map(
          id => gameData[id]?.universeId
        ),
        ...getThumbnailAssetIdImpressionsData(gameData, sortId, filteredViewedIndexes),
        ...getTileBadgeContextsImpressionsData(gameData, sortId, filteredViewedIndexes),
        ...getSponsoredAdImpressionsData(gameData, filteredViewedIndexes),
        ...getSortTargetIdMetadata(sort),
        [EventStreamMetadata.AbsPositions]: filteredViewedIndexes,
        [EventStreamMetadata.SortPos]: positionId,
        [EventStreamMetadata.NumberOfLoadedTiles]: gameData.length,
        [EventStreamMetadata.GameSetTypeId]: sortId,
        [EventStreamMetadata.Page]: PageContext.SearchLandingPage,
        [SessionInfoType.SearchLandingPageSessionInfo]: sessionInfo
      };
    },
    [gameData, sort, positionId, sessionInfo, sortId]
  );

  useGameImpressionsIntersectionTracker(
    carouselRef,
    gameData.length,
    buildGameImpressionsProperties
  );

  return (
    // TODO CLIGROW-2261 Support component type / wide (16:9) aspect ratio tiles
    <React.Fragment>
      <GameCarouselContainerHeader
        sortTitle={sort.topic}
        sortSubtitle={sort.subtitle}
        shouldShowSeparateSubtitleLink={false}
        isSortLinkOverrideEnabled={false}
        titleContainerClassName='container-header'
        hideSeeAll
        translate={translate}
        seeAllLink={undefined}
        subtitleLink={undefined}
        shouldShowSponsoredTooltip={undefined}
      />
      <GameCarouselHorizontalScroll
        gameData={gameData}
        sort={sort}
        positionId={positionId}
        hideScrollBackWhenDisabled
        sortId={sortId}
        page={PageContext.SearchLandingPage}
        gamesContainerRef={carouselRef}
        buildEventProperties={buildEventProperties}
        isLoadingMoreGames={false}
        itemsPerRow={itemsPerRow}
        friendData={friendsPresence}
        topicId={sort.topicId?.toString()}
        isExpandHomeContentEnabled={false}
        isCarouselHorizontalScrollEnabled
        isNewScrollArrowsEnabled={false}
        translate={translate}
      />
    </React.Fragment>
  );
};

SearchLandingPageGamesCarousel.defaultProps = {
  itemsPerRow: undefined
};

export default SearchLandingPageGamesCarousel;
