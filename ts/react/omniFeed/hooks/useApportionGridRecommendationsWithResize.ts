import { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { usePrevious } from 'react-utilities';
import { fireEvent } from 'roblox-event-tracker';
import { isEqual } from 'lodash';
import {
  TComponentType,
  TOmniRecommendationGame,
  TOmniRecommendationGameSort,
  TGetOmniRecommendationsResponse,
  TTreatmentType,
  TOmniRecommendationSort
} from '../../common/types/bedev2Types';
import { homePage } from '../../common/constants/configConstants';
import { getNumTilesPerRow } from '../../common/components/GameTileUtils';

type TGridRecommendationsMap = Map<number, TOmniRecommendationGame[]>;
type TItemsPerRowMap = Map<number, number>;
type TStartingRowNumbersMap = Map<number, number>;

const useApportionGridRecommendationsWithResize = (
  recommendations: TGetOmniRecommendationsResponse | undefined,
  isExpandHomeContentEnabled: boolean | undefined,
  isCarouselHorizontalScrollEnabled: boolean | undefined
): {
  homeFeedRef: React.RefObject<HTMLDivElement>;
  gridRecommendationsMap: TGridRecommendationsMap;
  itemsPerRowMap: TItemsPerRowMap;
  startingRowNumbersMap: TStartingRowNumbersMap;
} => {
  const [gridRecommendationsMap, setGridRecommendationsMap] = useState<TGridRecommendationsMap>(
    new Map()
  );

  const [itemsPerRowMap, setItemsPerRowMap] = useState<TItemsPerRowMap>(new Map());

  const previousItemsPerRowMap = usePrevious(itemsPerRowMap);

  const previousSorts = usePrevious(recommendations?.sorts);

  useEffect(() => {
    const apportionGridRecommendations = () => {
      const gridRecsByTopic: Map<number, TOmniRecommendationGame[]> = new Map();
      const nextGridRecIndexByTopic: Map<number, number> = new Map();

      recommendations?.sorts.forEach(sort => {
        if (sort.treatmentType === TTreatmentType.SortlessGrid) {
          const gridRecs = gridRecsByTopic.get(sort.topicId) ?? [];
          gridRecs.push(...sort.recommendationList);

          gridRecsByTopic.set(sort.topicId, gridRecs);
        }
      });

      const gridRecsByPositionId: TGridRecommendationsMap = new Map();

      recommendations?.sorts.forEach((sort, positionId) => {
        if (sort.treatmentType === TTreatmentType.SortlessGrid) {
          const gridRecs = gridRecsByTopic.get(sort.topicId) ?? [];
          const nextGridRecIndex = nextGridRecIndexByTopic.get(sort.topicId) ?? 0;

          if (sort.numberOfRows !== undefined && sort.numberOfRows >= 0) {
            const itemsPerRow = itemsPerRowMap.get(positionId) ?? 0;

            const tilesNeeded = itemsPerRow * sort.numberOfRows;

            gridRecsByPositionId.set(
              positionId,
              gridRecs.slice(nextGridRecIndex, nextGridRecIndex + tilesNeeded)
            );
            nextGridRecIndexByTopic.set(sort.topicId, nextGridRecIndex + tilesNeeded);
          } else {
            // Fill the end grid with any remaining tiles
            gridRecsByPositionId.set(positionId, gridRecs.slice(nextGridRecIndex));
            nextGridRecIndexByTopic.set(sort.topicId, gridRecs.length);
          }
        }
      });
      setGridRecommendationsMap(gridRecsByPositionId);
    };

    if (
      previousItemsPerRowMap === undefined ||
      !isEqual(itemsPerRowMap, previousItemsPerRowMap) ||
      !isEqual(recommendations?.sorts, previousSorts)
    ) {
      // Only re-apportion grid recommendations if recommendations or any itemsPerRow changed
      apportionGridRecommendations();
    }
  }, [recommendations?.sorts, previousSorts, itemsPerRowMap, previousItemsPerRowMap]);

  const startingRowNumbersMap = useMemo(() => {
    const getTotalRowsForSort = (
      sort: TOmniRecommendationSort,
      positionId: number
    ): number | null => {
      if (sort.numberOfRows !== undefined) {
        if (sort.numberOfRows === 0 || sort.numberOfRows === 1) {
          return sort.numberOfRows;
        }

        const gridRecs = gridRecommendationsMap.get(positionId);
        const itemsPerRow = itemsPerRowMap.get(positionId);

        if (gridRecs && itemsPerRow) {
          return Math.ceil(gridRecs.length / itemsPerRow);
        }

        // We are still calculating the rows for this sort
        return null;
      }

      // BE did not send numberOfRows for this sort
      fireEvent(homePage.missingNumberOfRowsForLoggingErrorEvent);

      return 1;
    };

    const rowNumbersMap: TStartingRowNumbersMap = new Map();
    let currentStartingRow: number | undefined = 0;

    recommendations?.sorts.forEach((sort, positionId) => {
      if (currentStartingRow) {
        rowNumbersMap.set(positionId, currentStartingRow);
      }

      const totalRowsForSort = getTotalRowsForSort(sort, positionId);

      if (currentStartingRow !== undefined && totalRowsForSort !== null) {
        currentStartingRow += totalRowsForSort;
      } else {
        // Make this and all future row numbers invalid
        currentStartingRow = undefined;
      }
    });

    return rowNumbersMap;
  }, [gridRecommendationsMap, itemsPerRowMap, recommendations?.sorts]);

  const homeFeedRef = useRef<HTMLDivElement>(null);

  const getItemsPerRow = useCallback(
    (sort: TOmniRecommendationGameSort, homeFeedWidth: number) => {
      if (isExpandHomeContentEnabled || sort.treatmentType === TTreatmentType.InterestGrid) {
        const componentType = sort.topicLayoutData?.componentType;

        // Subtract one pixel buffer from homeFeedWidth due to Firefox calc() rounding issue
        const containerBufferWidth = 1;

        // Enable new horizontal scroll on EventTile carousels for all users
        const isHorizontalScrollEnabled =
          isCarouselHorizontalScrollEnabled || componentType === TComponentType.EventTile;

        return getNumTilesPerRow(
          homeFeedWidth,
          containerBufferWidth,
          componentType,
          isHorizontalScrollEnabled,
          sort?.treatmentType,
          sort?.recommendationList?.length
        );
      }

      const useWideGameTiles =
        sort.topicLayoutData?.componentType === TComponentType.GridTile ||
        sort.topicLayoutData?.componentType === TComponentType.EventTile;

      if (useWideGameTiles) {
        if (homeFeedWidth && homeFeedWidth < homePage.wideGameTileTilesPerRowBreakpointWidth) {
          return homePage.minWideGameTilesPerCarouselPage;
        }
        return homePage.maxWideGameTilesPerCarouselPage;
      }

      if (homeFeedWidth && homeFeedWidth < homePage.homeFeedMaxWidth) {
        return Math.max(1, Math.floor(homeFeedWidth / homePage.gameTileWidth));
      }

      return homePage.maxTilesPerCarouselPage;
    },
    [isExpandHomeContentEnabled, isCarouselHorizontalScrollEnabled]
  );

  const updateItemsPerRow = useCallback(
    (homeFeedWidth: number) => {
      const allItemsPerRow: Map<number, number> = new Map();

      recommendations?.sorts.forEach((sort, positionId) => {
        if (
          sort.treatmentType === TTreatmentType.SortlessGrid ||
          sort.treatmentType === TTreatmentType.InterestGrid ||
          (isExpandHomeContentEnabled && sort.treatmentType === TTreatmentType.Carousel)
        ) {
          allItemsPerRow.set(positionId, getItemsPerRow(sort, homeFeedWidth));
        }
      });

      setItemsPerRowMap(allItemsPerRow);
    },
    [recommendations?.sorts, getItemsPerRow, isExpandHomeContentEnabled]
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      const homeFeedWidth = homeFeedRef?.current?.getBoundingClientRect().width;

      if (homeFeedWidth) {
        document.documentElement.style.setProperty('--home-feed-width', `${homeFeedWidth}px`);

        updateItemsPerRow(homeFeedWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateItemsPerRow]);

  return { homeFeedRef, gridRecommendationsMap, itemsPerRowMap, startingRowNumbersMap };
};

export default useApportionGridRecommendationsWithResize;
