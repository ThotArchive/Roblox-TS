import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import {
  EventStreamMetadata,
  SessionInfoType,
  TSortDetailReferral
} from '../../common/constants/eventStreamConstants';
import { TGameData } from '../../common/types/bedev1Types';
import {
  TComponentType,
  TExploreApiGameSort,
  TGameSort,
  TPlayerCountStyle,
  TPlayButtonStyle,
  TTreatmentType
} from '../../common/types/bedev2Types';
import { TBuildEventProperties } from '../../common/components/GameTileUtils';
import useGameImpressionsIntersectionTracker, {
  TBuildCarouselGameImpressionsEventProperties
} from '../../common/hooks/useGameImpressionsIntersectionTracker';
import { getSponsoredAdImpressionsData } from '../../common/utils/parsingUtils';
import {
  getSortTargetIdMetadata,
  parseAppliedFilters,
  getSortAppliedFiltersMetadata
} from '../../omniFeed/utils/gameSortUtils';
import GameCarouselHorizontalScroll from './GameCarouselHorizontalScroll';
import { buildSortDetailUrl } from '../../common/utils/browserUtils';
import { PageContext } from '../../common/types/pageContext';
import { usePageSession } from '../../common/utils/PageSessionContext';
import GameCarouselContainerHeader from '../../common/components/GameCarouselContainerHeader';
import { gamesPage } from '../../common/constants/configConstants';

type TGamesPageGameCarouselProps = {
  positionId: number;
  gameData: TGameData[];
  sort: TGameSort;
  page: PageContext.GamesPage;
  translate: WithTranslationsProps['translate'];
  loadMoreGames?: () => void;
  isLoadingMoreGames: boolean;
  tooltipInfoText?: string;
  hideSeeAll?: boolean;
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  itemsPerRow?: number;
  isChartsPageRenameEnabled?: boolean;
  subtitleLinkPath?: string;
};

export const GamesPageGameCarousel = ({
  translate,
  gameData,
  sort,
  page,
  positionId,
  isLoadingMoreGames,
  loadMoreGames,
  tooltipInfoText,
  hideSeeAll,
  componentType,
  playerCountStyle,
  playButtonStyle,
  itemsPerRow,
  isChartsPageRenameEnabled,
  subtitleLinkPath
}: TGamesPageGameCarouselProps): JSX.Element => {
  const gamesContainerRef = useRef<HTMLUListElement>(null);

  const discoverPageSessionInfo = usePageSession();

  const buildEventProperties: TBuildEventProperties = (data: TGameData, id: number) => ({
    [EventStreamMetadata.PlaceId]: data.placeId,
    [EventStreamMetadata.UniverseId]: data.universeId,
    [EventStreamMetadata.IsAd]: data.isSponsored,
    [EventStreamMetadata.NativeAdData]: data.nativeAdData,
    [EventStreamMetadata.Position]: id,
    [EventStreamMetadata.SortPos]: positionId,
    [EventStreamMetadata.GameSetTypeId]: sort.topicId,
    ...getSortTargetIdMetadata(sort),
    [EventStreamMetadata.NumberOfLoadedTiles]: (gameData || []).length,
    [EventStreamMetadata.Page]: page,
    ...getSortAppliedFiltersMetadata(sort),
    [SessionInfoType.DiscoverPageSessionInfo]: discoverPageSessionInfo,
    [EventStreamMetadata.PlayContext]: PageContext.GamesPage
  });

  const buildGameImpressionsProperties: TBuildCarouselGameImpressionsEventProperties = useCallback(
    (viewedIndexes: number[]) => {
      if (gameData !== undefined) {
        const filteredViewedIndexes = viewedIndexes.filter(id => id < gameData?.length);
        return {
          [EventStreamMetadata.RootPlaceIds]: filteredViewedIndexes.map(id => gameData[id].placeId),
          [EventStreamMetadata.UniverseIds]: filteredViewedIndexes.map(
            id => gameData[id].universeId
          ),
          ...getSponsoredAdImpressionsData(gameData, filteredViewedIndexes),
          [EventStreamMetadata.AbsPositions]: filteredViewedIndexes,
          [EventStreamMetadata.SortPos]: positionId,
          [EventStreamMetadata.GameSetTypeId]: sort.topicId,
          ...getSortTargetIdMetadata(sort),
          ...getSortAppliedFiltersMetadata(sort),
          [EventStreamMetadata.Page]: page,
          [EventStreamMetadata.NumberOfLoadedTiles]: (gameData || []).length,
          [SessionInfoType.DiscoverPageSessionInfo]: discoverPageSessionInfo
        };
      }

      return undefined;
    },
    [gameData, discoverPageSessionInfo, positionId, sort, page]
  );

  useGameImpressionsIntersectionTracker(
    gamesContainerRef,
    gameData.length,
    buildGameImpressionsProperties
  );

  useEffect(() => {
    if (itemsPerRow && gamesContainerRef?.current) {
      gamesContainerRef.current.style.setProperty('--items-per-row', itemsPerRow.toString());
    }
  }, [itemsPerRow]);

  const seeAllLink: string = useMemo(() => {
    const sortDetailReferralParams: TSortDetailReferral = {
      [EventStreamMetadata.Position]: positionId,
      [EventStreamMetadata.GameSetTypeId]: sort.topicId,
      ...getSortTargetIdMetadata(sort),
      [EventStreamMetadata.Page]: page,
      [EventStreamMetadata.TreatmentType]: TTreatmentType.Carousel,
      [SessionInfoType.DiscoverPageSessionInfo]: discoverPageSessionInfo
    };

    const filterUrlParams = parseAppliedFilters(sort);

    return buildSortDetailUrl(
      (sort as TExploreApiGameSort).sortId,
      page,
      sortDetailReferralParams,
      isChartsPageRenameEnabled,
      filterUrlParams
    );
  }, [discoverPageSessionInfo, page, positionId, sort, isChartsPageRenameEnabled]);

  return (
    <div
      className={classNames('games-list-container', {
        'wide-game-tile-container':
          componentType === TComponentType.GridTile || componentType === TComponentType.EventTile
      })}>
      <GameCarouselContainerHeader
        sortTitle={sort.topic}
        sortSubtitle={sort.subtitle}
        subtitleLink={subtitleLinkPath || seeAllLink}
        seeAllLink={seeAllLink}
        isSortLinkOverrideEnabled={false}
        shouldShowSeparateSubtitleLink={!!subtitleLinkPath}
        shouldShowSponsoredTooltip={sort.topicId === gamesPage.adSortDiscoverId}
        tooltipInfoText={tooltipInfoText}
        titleContainerClassName='container-header games-filter-changer'
        hideSeeAll={hideSeeAll}
        translate={translate}
      />

      <GameCarouselHorizontalScroll
        gamesContainerRef={gamesContainerRef}
        gameData={gameData}
        sort={sort}
        positionId={positionId}
        loadMoreGames={loadMoreGames}
        sortId={sort.topicId}
        isLoadingMoreGames={isLoadingMoreGames}
        buildEventProperties={buildEventProperties}
        translate={translate}
        page={page}
        componentType={componentType}
        playerCountStyle={playerCountStyle}
        playButtonStyle={playButtonStyle}
        itemsPerRow={itemsPerRow}
      />
    </div>
  );
};

GamesPageGameCarousel.defaultProps = {
  loadMoreGames: undefined,
  tooltipInfoText: undefined,
  hideSeeAll: undefined,
  componentType: undefined,
  itemsPerRow: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  isChartsPageRenameEnabled: undefined,
  subtitleLinkPath: undefined
};

export default GamesPageGameCarousel;
