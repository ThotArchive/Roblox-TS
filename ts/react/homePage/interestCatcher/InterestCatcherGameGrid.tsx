import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { TranslateFunction } from 'react-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import { TOmniRecommendationGameSort } from '../../common/types/bedev2Types';
import GameGrid from '../../common/components/GameGrid';
import { useContentMetadata } from '../../omniFeed/utils/contentMetadataContextProvider';
import { TGameData } from '../../common/types/bedev1Types';
import { hydrateOmniRecommendationGames } from '../../omniFeed/utils/gameSortUtils';
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
  TInterestCatcherButton,
  TInterestCatcherClick
} from '../../common/constants/eventStreamConstants';
import { PageContext } from '../../common/types/pageContext';
import useGameImpressionsIntersectionTracker, {
  TBuildGridGameImpressionsEventProperties
} from '../../common/hooks/useGameImpressionsIntersectionTracker';
import {
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData
} from '../../common/utils/parsingUtils';

type TInterestCatcherGameGridProps = {
  sort: TOmniRecommendationGameSort;
  itemsPerRow: number | undefined;
  toggleInterest: (universeId: number) => void;
  interestedUniverses: Set<number>;
  homePageSessionInfo: string;
  translate: TranslateFunction;
};

const InterestCatcherGameGrid = ({
  sort,
  itemsPerRow,
  toggleInterest,
  interestedUniverses,
  homePageSessionInfo,
  translate
}: TInterestCatcherGameGridProps): JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);

  const { contentMetadata } = useContentMetadata();

  const gridData: TGameData[] = useMemo(() => {
    return hydrateOmniRecommendationGames(sort.recommendationList, contentMetadata);
  }, [sort.recommendationList, contentMetadata]);

  const buildInterestedClickEventProperties = useCallback(
    (universeId: number): TInterestCatcherClick | undefined => {
      const gameIndex = gridData?.findIndex(game => game.universeId === universeId);
      if (gameIndex === undefined || gameIndex === -1) {
        return undefined;
      }

      const gameData = gridData[gameIndex];
      return {
        [EventStreamMetadata.ButtonName]: TInterestCatcherButton.Interested,
        [EventStreamMetadata.PlaceId]: gameData.placeId,
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.Position]: gameIndex,
        [EventStreamMetadata.GameSetTypeId]: sort.topicId,
        [EventStreamMetadata.NumberOfLoadedTiles]: gridData?.length,
        [EventStreamMetadata.Page]: PageContext.InterestCatcher,
        [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
        // If the user is indicating interest, interestedUniverses will not have the universeId yet
        [EventStreamMetadata.IsInterested]: !interestedUniverses.has(universeId)
      };
    },
    [interestedUniverses, gridData, homePageSessionInfo, sort.topicId]
  );

  const handleInterestButtonClick = useCallback(
    (universeId: number) => {
      toggleInterest(universeId);

      const eventProperties = buildInterestedClickEventProperties(universeId);
      const eventParams = eventStreamConstants.interestCatcherClick(eventProperties);
      if (eventParams !== undefined) {
        eventStreamService.sendEvent(...eventParams);
      }
    },
    [toggleInterest, buildInterestedClickEventProperties]
  );

  const buildGameImpressionsProperties: TBuildGridGameImpressionsEventProperties = useCallback(
    (viewedIndexes: number[]) => {
      if (!gridData) {
        return undefined;
      }

      const parsedViewedIndexes = viewedIndexes.filter(id => id < gridData?.length);
      return {
        [EventStreamMetadata.RootPlaceIds]: parsedViewedIndexes.map(id => gridData[id].placeId),
        [EventStreamMetadata.UniverseIds]: parsedViewedIndexes.map(id => gridData[id].universeId),
        ...getThumbnailAssetIdImpressionsData(
          gridData,
          sort.topicId,
          parsedViewedIndexes,
          sort?.topicLayoutData?.componentType
        ),
        ...getTileBadgeContextsImpressionsData(
          gridData,
          sort.topicId,
          parsedViewedIndexes,
          sort?.topicLayoutData?.componentType
        ),
        [EventStreamMetadata.AbsPositions]: parsedViewedIndexes,
        [EventStreamMetadata.NumberOfLoadedTiles]: gridData?.length,
        [EventStreamMetadata.GameSetTypeId]: sort.topicId,
        [EventStreamMetadata.Page]: PageContext.InterestCatcher,
        [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo
      };
    },
    [gridData, homePageSessionInfo, sort.topicId, sort?.topicLayoutData?.componentType]
  );

  useGameImpressionsIntersectionTracker(
    gridRef,
    gridData?.length ?? 0,
    buildGameImpressionsProperties
  );

  useLayoutEffect(() => {
    if (itemsPerRow && gridRef?.current) {
      gridRef.current.style.setProperty('--items-per-row', itemsPerRow.toString());
    }
  }, [itemsPerRow]);

  return (
    <GameGrid
      ref={gridRef}
      tileRef={tileRef}
      gameData={gridData}
      emphasis={false}
      translate={translate}
      isHomeGameGrid
      isExpandHomeContentEnabled
      buildEventProperties={
        /* Function is never called, since we don't support clicks on the tile */
        () => ({})
      }
      componentType={sort?.topicLayoutData?.componentType}
      playerCountStyle={sort?.topicLayoutData?.playerCountStyle}
      playButtonStyle={sort?.topicLayoutData?.playButtonStyle}
      topicId={sort?.topicId?.toString()}
      shouldUseSentinelTile={false}
      interestedUniverses={interestedUniverses}
      toggleInterest={handleInterestButtonClick}
    />
  );
};

export default InterestCatcherGameGrid;
