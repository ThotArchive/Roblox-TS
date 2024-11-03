import { MutableRefObject, useState, useRef, useEffect, useCallback } from 'react';
import { elementVisibilityService, eventStreamService } from 'core-roblox-utilities';
import { common } from '../constants/configConstants';
import eventStreamConstants, {
  TCarouselGameImpressions,
  TGridGameImpressions
} from '../constants/eventStreamConstants';
import parsingUtils from '../utils/parsingUtils';
import { debounce } from '../utils/helperUtils';

export type TBuildGridGameImpressionsEventProperties = (
  impressedIndexes: number[]
) => TGridGameImpressions | undefined;

export type TBuildCarouselGameImpressionsEventProperties = (
  impressedIndexes: number[]
) => TCarouselGameImpressions | undefined;

export type TBuildGameImpressionsEventProperties =
  | TBuildGridGameImpressionsEventProperties
  | TBuildCarouselGameImpressionsEventProperties;

const useGameImpressionsIntersectionTracker = (
  containerRef: MutableRefObject<HTMLDivElement | HTMLUListElement | null>,
  childrenLength: number,
  buildEventProperties: TBuildGameImpressionsEventProperties
): void => {
  const [reportedImpressions, setReportedImpressions] = useState<Set<number>>(new Set());
  const [impressedRange, setImpressedRange] = useState<Set<number>>(new Set());

  const disconnectRef = useRef<VoidFunction | null>(null);

  const buildEventPropertiesRef = useRef<TBuildGameImpressionsEventProperties>(
    buildEventProperties
  );

  useEffect(() => {
    buildEventPropertiesRef.current = buildEventProperties;
  }, [buildEventProperties]);

  const sendImpressions = useCallback(() => {
    const subArrays = parsingUtils
      .splitArray(
        Array.from(impressedRange).filter(index => !reportedImpressions.has(index)),
        common.maxTilesInGameImpressionsEvent
      )
      .filter(indexes => indexes.length > 0);

    subArrays.forEach(indexesToSend => {
      const params = buildEventPropertiesRef.current(indexesToSend);

      if (params !== undefined && params.absPositions?.length > 0) {
        const eventStreamParams = eventStreamConstants.gameImpressions(params);
        eventStreamService.sendEvent(...eventStreamParams);

        setReportedImpressions(prevReportedImpressions => {
          const newReportedImpressions = prevReportedImpressions;
          indexesToSend.forEach(index => newReportedImpressions.add(index));
          return newReportedImpressions;
        });
      }
    });
  }, [reportedImpressions, impressedRange]);

  const [sendImpressionsDebounced, cancelSendImpressionsDebounced] = debounce(() =>
    sendImpressions()
  );

  useEffect(() => {
    const tileElements = Array.from(containerRef?.current?.children ?? []);

    const getSortedImpressedIndexes = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ): number[] => {
      const impressedIndexes: number[] = [];
      entries.forEach(entry => {
        if (entry?.isIntersecting) {
          const tileIndex = tileElements.findIndex(tileElement => tileElement === entry.target);
          if (tileIndex >= 0) {
            impressedIndexes.push(tileIndex);
            observer.unobserve(entry.target);
          }
        }
      });
      return impressedIndexes.sort((a, b) => a - b);
    };

    const onObserve = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      cancelSendImpressionsDebounced();

      const sortedImpressedIndexes = getSortedImpressedIndexes(entries, observer);

      setImpressedRange(prevImpressedRange => {
        const newImpressedRange = prevImpressedRange;
        sortedImpressedIndexes.forEach(index => newImpressedRange.add(index));
        return newImpressedRange;
      });

      sendImpressionsDebounced();
    };

    disconnectRef.current = elementVisibilityService.observeChildrenVisibility(
      {
        elements: tileElements,
        threshold: common.gameImpressionsIntersectionThreshold
      },
      onObserve
    );

    return () => {
      if (disconnectRef?.current) {
        disconnectRef.current();
      }
    };
  }, [
    containerRef,
    childrenLength,
    impressedRange,
    sendImpressionsDebounced,
    cancelSendImpressionsDebounced
  ]);
};

export default useGameImpressionsIntersectionTracker;
