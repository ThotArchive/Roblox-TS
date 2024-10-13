import { useRef, useEffect } from 'react';
import useRostileContext from './useRostileContext';
import {
  mousePositionThrottleInterval,
  maxMousePositionArrayLength
} from '../constants/challengeConfig';

const useMousePositionHistory = (): React.MutableRefObject<
  Array<{ x: number; y: number; timestamp: number }>
> => {
  const {
    state: { puzzleType }
  } = useRostileContext();

  const mousePositionHistory = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);

  useEffect(() => {
    // Throttled logging function.
    const updateMousePositionHistoryClosure = () => {
      let lastTimeStamp = 0;

      return (e: MouseEvent) => {
        if (e.timeStamp - lastTimeStamp > mousePositionThrottleInterval) {
          mousePositionHistory.current = [
            // Keep only up to most recent `maxMousePositionArrayLength - 1`
            // entries to bound total array size to
            // `maxMousePositionArrayLength`.
            ...mousePositionHistory.current.slice(-(maxMousePositionArrayLength - 1)),
            {
              x: e.clientX,
              y: e.clientY,
              // Note the behavior of `e.timestamp` may be browser-dependent.
              timestamp: e.timeStamp
            }
          ];
          lastTimeStamp = e.timeStamp;
        }
      };
    };

    // Register logging function as listener with automatic cleanup.
    const updateMousePositionHistory = updateMousePositionHistoryClosure();
    window.addEventListener('mousemove', updateMousePositionHistory);
    return () => {
      window.removeEventListener('mousemove', updateMousePositionHistory);
    };
  }, [puzzleType]);

  return mousePositionHistory;
};
export default useMousePositionHistory;
