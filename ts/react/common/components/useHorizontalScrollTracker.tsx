import { useEffect, useRef, useMemo } from 'react';
import { debounce } from '../utils/helperUtils';
import { sendScrollEvent } from '../utils/scrollEvent';
import { ScrollDirection } from '../constants/eventStreamConstants';
import { usePageSession } from '../utils/PageSessionContext';

type HorizontalScrollTrackerProps = {
  scrollPosition: number;
  page: string;
  gameSetTypeId: number;
  gameSetTargetId?: number;
  sortPosition: number;
  wrapperRef: React.RefObject<HTMLDivElement>;
};

export const useHorizontalScrollTracker = ({
  scrollPosition,
  page,
  gameSetTypeId,
  gameSetTargetId,
  sortPosition,
  wrapperRef
}: HorizontalScrollTrackerProps): void => {
  const startPosition = useRef(scrollPosition);
  const pageSession = usePageSession();

  const onScrollEnd = useMemo(() => {
    const [debouncedScrollEnd] = debounce((stopPosition: number) => {
      if (stopPosition === startPosition.current) {
        return;
      }

      const width = Math.round(
        wrapperRef.current?.getBoundingClientRect().width || window.innerWidth
      );

      sendScrollEvent({
        distance: stopPosition - startPosition.current,
        scrollAreaSize: width,
        startingPosition: startPosition.current,
        currentPage: page,
        direction: ScrollDirection.Horizontal,
        gameSetTypeId,
        gameSetTargetId,
        sortPosition,
        pageSession
      });
      startPosition.current = stopPosition;
    }, 250);
    return debouncedScrollEnd;
  }, [page, gameSetTypeId, gameSetTargetId, sortPosition, pageSession]);

  useEffect(() => {
    onScrollEnd(scrollPosition);
  }, [onScrollEnd, scrollPosition]);
};

export default useHorizontalScrollTracker;
