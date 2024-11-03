import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { urlService } from 'core-utilities';
import { buildSortDetailUrl } from '../../common/utils/browserUtils';
import {
  EventStreamMetadata,
  SessionInfoType,
  TBuildNavigateToSortLinkEventProperties
} from '../../common/constants/eventStreamConstants';
import { PageContext } from '../../common/types/pageContext';
import { TGameData, TGetFriendsResponse } from '../../common/types/bedev1Types';
import {
  TComponentType,
  TGameSort,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle
} from '../../common/types/bedev2Types';
import { GameCarousel } from '../../common/components/GameCarousel';
import { TBuildEventProperties } from '../../common/components/GameTileUtils';
import useGameImpressionsIntersectionTracker, {
  TBuildCarouselGameImpressionsEventProperties
} from '../../common/hooks/useGameImpressionsIntersectionTracker';
import {
  getAbsoluteRowImpressionsData,
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData
} from '../../common/utils/parsingUtils';
import { usePageSession } from '../../common/utils/PageSessionContext';
import GameCarouselContainerHeader from '../../common/components/GameCarouselContainerHeader';
import { homePage } from '../../common/constants/configConstants';
import SortBackgroundMuralWrapper from './SortBackgroundMuralWrapper';
import GameCarouselHorizontalScroll from '../../gamesPage/components/GameCarouselHorizontalScroll';

type THomePageGameCarouselDiscoveryApiProps = {
  positionId: number;
  gameData: TGameData[];
  sort: TGameSort;
  friendsPresence: TGetFriendsResponse[];
  translate: WithTranslationsProps['translate'];
  startingRow: number | undefined;
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  hoverStyle?: THoverStyle;
  tooltipInfoText?: string;
  hideSeeAll?: boolean;
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: boolean;
  seeAllLinkPath?: string;
  itemsPerRow?: number;
  endTimestamp?: string;
  countdownString?: string;
  isExpandHomeContentEnabled?: boolean;
  isCarouselHorizontalScrollEnabled?: boolean;
  isNewScrollArrowsEnabled?: boolean;
};

export const HomePageCarousel = ({
  translate,
  friendsPresence,
  gameData,
  sort,
  positionId,
  componentType,
  playerCountStyle,
  playButtonStyle,
  hoverStyle,
  tooltipInfoText,
  hideSeeAll,
  navigationRootPlaceId,
  isSponsoredFooterAllowed,
  seeAllLinkPath,
  itemsPerRow,
  startingRow,
  endTimestamp,
  countdownString,
  isExpandHomeContentEnabled,
  isCarouselHorizontalScrollEnabled,
  isNewScrollArrowsEnabled
}: THomePageGameCarouselDiscoveryApiProps): JSX.Element => {
  // Type union will be cleaned up with isCarouselHorizontalScrollEnabled
  const carouselRef = useRef<HTMLDivElement | HTMLUListElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const homePageSessionInfo = usePageSession();
  const buildEventProperties: TBuildEventProperties = (data, id) => ({
    [EventStreamMetadata.PlaceId]: data.placeId,
    [EventStreamMetadata.UniverseId]: data.universeId,
    [EventStreamMetadata.IsAd]: data.isSponsored,
    [EventStreamMetadata.NativeAdData]: data.nativeAdData,
    [EventStreamMetadata.Position]: id,
    [EventStreamMetadata.SortPos]: positionId,
    [EventStreamMetadata.NumberOfLoadedTiles]: (gameData || []).length,
    [EventStreamMetadata.GameSetTypeId]: sort.topicId,
    [EventStreamMetadata.Page]: PageContext.HomePage,
    [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
    [EventStreamMetadata.PlayContext]: PageContext.HomePage
  });

  const buildGameImpressionsProperties: TBuildCarouselGameImpressionsEventProperties = useCallback(
    (viewedIndexes: number[]) => {
      if (gameData !== undefined && startingRow !== undefined) {
        const filteredViewedIndexes = viewedIndexes.filter(id => id < gameData?.length);
        return {
          [EventStreamMetadata.RootPlaceIds]: filteredViewedIndexes.map(id => gameData[id].placeId),
          [EventStreamMetadata.UniverseIds]: filteredViewedIndexes.map(
            id => gameData[id].universeId
          ),
          ...getThumbnailAssetIdImpressionsData(
            gameData,
            sort.topicId,
            filteredViewedIndexes,
            componentType
          ),
          ...getTileBadgeContextsImpressionsData(
            gameData,
            sort.topicId,
            filteredViewedIndexes,
            componentType
          ),
          ...getSponsoredAdImpressionsData(gameData, filteredViewedIndexes),
          ...getAbsoluteRowImpressionsData(
            startingRow,
            gameData?.length,
            gameData?.length,
            filteredViewedIndexes
          ),
          [EventStreamMetadata.NavigationUids]: filteredViewedIndexes.map(
            id => gameData[id].navigationUid ?? '0'
          ),
          [EventStreamMetadata.AbsPositions]: filteredViewedIndexes,
          [EventStreamMetadata.SortPos]: positionId,
          [EventStreamMetadata.GameSetTypeId]: sort.topicId,
          [EventStreamMetadata.Page]: PageContext.HomePage,
          [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo
        };
      }

      return undefined;
    },
    [gameData, homePageSessionInfo, positionId, sort.topicId, componentType, startingRow]
  );

  useGameImpressionsIntersectionTracker(
    carouselRef,
    gameData.length,
    buildGameImpressionsProperties
  );

  useEffect(() => {
    if (isExpandHomeContentEnabled) {
      if (itemsPerRow && carouselRef?.current) {
        carouselRef.current.style.setProperty('--items-per-row', itemsPerRow.toString());
      }
    }
  }, [isExpandHomeContentEnabled, itemsPerRow]);

  const seeAllLink: string = useMemo(() => {
    if (seeAllLinkPath) {
      return urlService.getAbsoluteUrl(seeAllLinkPath);
    }

    return buildSortDetailUrl(sort.topic, PageContext.HomePage, {
      position: positionId,
      sortId: sort.topicId,
      page: PageContext.HomePage,
      treatmentType: sort.treatmentType,
      homePageSessionInfo
    });
  }, [
    homePageSessionInfo,
    positionId,
    sort.topic,
    sort.topicId,
    sort.treatmentType,
    seeAllLinkPath
  ]);

  const buildNavigateToSortLinkEventProperties: TBuildNavigateToSortLinkEventProperties = useCallback(() => {
    if (seeAllLinkPath) {
      return {
        [EventStreamMetadata.LinkPath]: seeAllLinkPath,
        [EventStreamMetadata.SortPos]: positionId,
        [EventStreamMetadata.GameSetTypeId]: sort.topicId,
        [EventStreamMetadata.Page]: PageContext.HomePage,
        [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo
      };
    }
    return undefined;
  }, [homePageSessionInfo, positionId, seeAllLinkPath, sort.topicId]);

  return (
    <SortBackgroundMuralWrapper
      backgroundImageAssetId={
        sort.topicLayoutData?.backgroundImageAssetId
          ? parseInt(sort.topicLayoutData?.backgroundImageAssetId, 10)
          : undefined
      }>
      <GameCarouselContainerHeader
        sortTitle={sort.topic}
        sortSubtitle={sort.subtitle}
        seeAllLink={seeAllLink}
        isSortLinkOverrideEnabled={!!seeAllLinkPath}
        buildNavigateToSortLinkEventProperties={buildNavigateToSortLinkEventProperties}
        shouldShowSponsoredTooltip={sort.topicId === homePage.adSortHomePageId}
        tooltipInfoText={tooltipInfoText}
        titleContainerClassName='container-header'
        hideSeeAll={hideSeeAll}
        endTimestamp={endTimestamp}
        countdownString={countdownString}
        backgroundImageAssetId={
          sort.topicLayoutData?.backgroundImageAssetId
            ? parseInt(sort.topicLayoutData?.backgroundImageAssetId, 10)
            : undefined
        }
        translate={translate}
      />

      {isCarouselHorizontalScrollEnabled ? (
        <GameCarouselHorizontalScroll
          gameData={gameData}
          sort={sort}
          positionId={positionId}
          page={PageContext.HomePage}
          gamesContainerRef={carouselRef}
          buildEventProperties={buildEventProperties}
          loadMoreGames={undefined}
          isLoadingMoreGames={false}
          componentType={componentType}
          playerCountStyle={playerCountStyle}
          playButtonStyle={playButtonStyle}
          itemsPerRow={itemsPerRow}
          friendData={friendsPresence}
          navigationRootPlaceId={navigationRootPlaceId}
          isSponsoredFooterAllowed={isSponsoredFooterAllowed}
          hoverStyle={hoverStyle}
          topicId={sort.topicId?.toString()}
          isExpandHomeContentEnabled={isExpandHomeContentEnabled}
          isCarouselHorizontalScrollEnabled={isCarouselHorizontalScrollEnabled}
          isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
          translate={translate}
        />
      ) : (
        <GameCarousel
          // Type cast will be cleaned up with isCarouselHorizontalScrollEnabled
          ref={carouselRef as React.RefObject<HTMLDivElement>}
          tileRef={tileRef}
          gameData={gameData}
          friendData={friendsPresence}
          buildEventProperties={buildEventProperties}
          translate={translate}
          componentType={componentType}
          playerCountStyle={playerCountStyle}
          playButtonStyle={playButtonStyle}
          navigationRootPlaceId={navigationRootPlaceId}
          isSponsoredFooterAllowed={isSponsoredFooterAllowed}
          hoverStyle={hoverStyle}
          topicId={sort.topicId?.toString()}
          isExpandHomeContentEnabled={isExpandHomeContentEnabled}
        />
      )}
    </SortBackgroundMuralWrapper>
  );
};

HomePageCarousel.defaultProps = {
  componentType: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  hoverStyle: undefined,
  tooltipInfoText: undefined,
  hideSeeAll: undefined,
  navigationRootPlaceId: undefined,
  isSponsoredFooterAllowed: undefined,
  seeAllLinkPath: undefined,
  itemsPerRow: undefined,
  endTimestamp: undefined,
  countdownString: undefined,
  isExpandHomeContentEnabled: undefined,
  isCarouselHorizontalScrollEnabled: undefined,
  isNewScrollArrowsEnabled: undefined
};

export default HomePageCarousel;
