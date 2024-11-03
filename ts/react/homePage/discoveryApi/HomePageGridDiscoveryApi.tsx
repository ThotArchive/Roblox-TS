import React, { useRef, useCallback, useEffect } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { EventStreamMetadata, SessionInfoType } from '../../common/constants/eventStreamConstants';
import { PageContext } from '../../common/types/pageContext';
import { TGameData, TGetFriendsResponse } from '../../common/types/bedev1Types';
import {
  TComponentType,
  TGameSort,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle
} from '../../common/types/bedev2Types';
import { GameGrid } from '../../common/components/GameGrid';
import { TBuildEventProperties } from '../../common/components/GameTileUtils';
import useGameImpressionsIntersectionTracker, {
  TBuildGridGameImpressionsEventProperties
} from '../../common/hooks/useGameImpressionsIntersectionTracker';
import {
  getAbsoluteRowImpressionsData,
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData
} from '../../common/utils/parsingUtils';
import { usePageSession } from '../../common/utils/PageSessionContext';
import GamesInfoTooltip from '../../common/components/GamesInfoTooltip';
import { CommonGameSorts } from '../../common/constants/translationConstants';
import { homePage } from '../../common/constants/configConstants';

type THomePageGridDiscoveryApiProps = {
  gameData: TGameData[];
  sort: TGameSort;
  positionId: number;
  friendsPresence: TGetFriendsResponse[];
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  hoverStyle?: THoverStyle;
  itemsPerRow?: number;
  startingRow: number | undefined;
  isSponsoredFooterAllowed?: boolean;
  isExpandHomeContentEnabled?: boolean;
  translate: WithTranslationsProps['translate'];
};

export const HomePageGrid = ({
  gameData,
  sort,
  positionId,
  friendsPresence,
  componentType,
  playerCountStyle,
  playButtonStyle,
  hoverStyle,
  itemsPerRow,
  startingRow,
  isSponsoredFooterAllowed,
  isExpandHomeContentEnabled,
  translate
}: THomePageGridDiscoveryApiProps): JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
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

  const buildGameImpressionsProperties: TBuildGridGameImpressionsEventProperties = useCallback(
    (viewedIndex: number[]) => {
      if (gameData !== undefined && startingRow !== undefined) {
        const parsedViewedIndex = viewedIndex.filter(id => id < gameData?.length);
        return {
          [EventStreamMetadata.RootPlaceIds]: parsedViewedIndex.map(id => gameData[id].placeId),
          [EventStreamMetadata.UniverseIds]: parsedViewedIndex.map(id => gameData[id].universeId),
          ...getThumbnailAssetIdImpressionsData(
            gameData,
            sort.topicId,
            parsedViewedIndex,
            componentType
          ),
          ...getTileBadgeContextsImpressionsData(
            gameData,
            sort.topicId,
            parsedViewedIndex,
            componentType
          ),
          [EventStreamMetadata.NavigationUids]: parsedViewedIndex.map(
            id => gameData[id].navigationUid ?? '0'
          ),
          [EventStreamMetadata.AbsPositions]: parsedViewedIndex,
          ...getSponsoredAdImpressionsData(gameData, parsedViewedIndex),
          ...getAbsoluteRowImpressionsData(
            startingRow,
            itemsPerRow,
            gameData?.length,
            parsedViewedIndex
          ),
          [EventStreamMetadata.SortPos]: positionId,
          [EventStreamMetadata.NumberOfLoadedTiles]: gameData?.length,
          [EventStreamMetadata.GameSetTypeId]: sort.topicId,
          [EventStreamMetadata.Page]: PageContext.HomePage,
          [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo
        };
      }

      return undefined;
    },
    [
      gameData,
      homePageSessionInfo,
      positionId,
      sort.topicId,
      componentType,
      itemsPerRow,
      startingRow
    ]
  );

  useGameImpressionsIntersectionTracker(gridRef, gameData.length, buildGameImpressionsProperties);

  useEffect(() => {
    if (itemsPerRow && gridRef?.current) {
      gridRef.current.style.setProperty('--items-per-row', itemsPerRow.toString());
    }
  }, [itemsPerRow]);

  return (
    <div data-testid='home-page-game-grid'>
      <div className='container-header'>
        <h2>
          {sort.topic}
          {sort.topicId === homePage.adSortHomePageId && (
            <GamesInfoTooltip
              tooltipText={
                translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
                'Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics.'
              }
            />
          )}
        </h2>
      </div>
      <GameGrid
        ref={gridRef}
        tileRef={tileRef}
        gameData={gameData}
        emphasis={false}
        translate={translate}
        buildEventProperties={buildEventProperties}
        isHomeGameGrid
        friendsPresence={friendsPresence}
        componentType={componentType}
        playerCountStyle={playerCountStyle}
        playButtonStyle={playButtonStyle}
        isSponsoredFooterAllowed={isSponsoredFooterAllowed}
        hoverStyle={hoverStyle}
        topicId={sort.topicId?.toString()}
        isExpandHomeContentEnabled={isExpandHomeContentEnabled}
      />
    </div>
  );
};

HomePageGrid.defaultProps = {
  componentType: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  hoverStyle: undefined,
  itemsPerRow: undefined,
  isSponsoredFooterAllowed: undefined,
  isExpandHomeContentEnabled: undefined
};

export default HomePageGrid;
