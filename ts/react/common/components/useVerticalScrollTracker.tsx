import { useEffect, useMemo, useState } from 'react';
import { debounce } from '../utils/helperUtils';
import { sendScrollEvent } from '../utils/scrollEvent';
import { ScrollDirection } from '../constants/eventStreamConstants';
import { usePageSession } from '../utils/PageSessionContext';

export const useVerticalScrollTracker = (currentPage: string): void => {
  const pageSession = usePageSession();

  useEffect(() => {
    let startingPositionY = window.scrollY;

    const [onScroll, cancelScroll] = debounce(() => {
      if (window.scrollY === startingPositionY) {
        return;
      }

      const headerArea = document.getElementById('header')?.getBoundingClientRect();
      const headerBottom = headerArea?.bottom ?? 0;

      sendScrollEvent({
        distance: window.scrollY - startingPositionY,
        scrollAreaSize: window.innerHeight - headerBottom,
        direction: ScrollDirection.Vertical,
        startingPosition: startingPositionY,
        currentPage,
        pageSession
      });
      startingPositionY = window.scrollY;
    }, 250);

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelScroll();
    };
  }, [currentPage, pageSession]);
};

export default useVerticalScrollTracker;
