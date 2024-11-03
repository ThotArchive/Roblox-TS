import React, { useEffect, useRef } from 'react';

import { elementVisibilityService } from 'core-roblox-utilities';
import { gameSearchPage } from '../constants/configConstants';

type TSentinelTileProps = {
  loadData?: () => void;
};

export const SentinelTile = ({ loadData }: TSentinelTileProps): React.ReactElement | null => {
  const ref = useRef<HTMLDivElement>(null);
  const disconnectRef = useRef<VoidFunction | null>(null);

  useEffect(() => {
    const sentinelTile = ref.current;

    if (sentinelTile) {
      disconnectRef.current = elementVisibilityService.observeVisibility(
        {
          element: sentinelTile,
          threshold: gameSearchPage.sentinelTileIntersectionThreshold
        },
        visible => {
          if (visible && loadData) {
            loadData();
          }
        }
      );
    }

    return () => {
      if (disconnectRef?.current) {
        disconnectRef.current();
      }
    };
  }, [loadData]);

  if (!loadData) {
    return null;
  }

  return (
    <div
      ref={ref}
      data-testid='sentinel-tile'
      className='grid-item-container game-card-container invisible'
    />
  );
};
SentinelTile.displayName = 'SentinelTile';

SentinelTile.defaultProps = {
  loadData: null
};

export default SentinelTile;
