import { useState, useRef, useEffect, useCallback } from 'react';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

const ResizeObserverOrPolyfill = window.ResizeObserver ?? ResizeObserverPolyfill;

const useElementWidthResizeObserver = (): [(node: HTMLDivElement) => void, number | undefined] => {
  const [elementWidth, setElementWidth] = useState<number | undefined>(undefined);

  const updateElementWidth = useCallback((element: Element) => {
    const width = element?.getBoundingClientRect()?.width;
    if (width !== undefined) {
      setElementWidth(width);
    }
  }, []);

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries && entries[0] && entries[0].target) {
        updateElementWidth(entries[0].target);
      }
    },
    [updateElementWidth]
  );

  const observerRef = useRef<ResizeObserver>(new ResizeObserverOrPolyfill(handleResize));

  const elementRef = useCallback(
    (node: HTMLDivElement) => {
      if (node && observerRef?.current) {
        updateElementWidth(node);

        observerRef.current.disconnect();
        observerRef.current.observe(node);
      }
    },
    [updateElementWidth]
  );

  useEffect(() => {
    return () => {
      if (observerRef?.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [elementRef, elementWidth];
};

export default useElementWidthResizeObserver;
