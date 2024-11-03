import React, { useEffect, useCallback, useMemo } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import useFriendsPresence from '../common/hooks/useFriendsPresence';
import { TGameData } from '../common/types/bedev1Types';
import { TContentType, TGameSort, TOmniRecommendationGame } from '../common/types/bedev2Types';
import HomePageGridDiscoveryApi from '../homePage/discoveryApi/HomePageGridDiscoveryApi';
import bedev2Services from '../common/services/bedev2Services';
import { homePage } from '../common/constants/configConstants';
import { useContentMetadata } from './utils/contentMetadataContextProvider';
import { hydrateOmniRecommendationGames } from './utils/gameSortUtils';
import { usePageSession } from '../common/utils/PageSessionContext';

type THomePageDiscoveryApiProps = {
  translate: WithTranslationsProps['translate'];
  sort: TGameSort;
  positionId: number;
  itemsPerRow: number | undefined;
  startingRow: number | undefined;
  recommendations: TOmniRecommendationGame[];
  isExpandHomeContentEnabled?: boolean;
};

const { sortlessGridMaxTilesMetadataToFetch } = homePage;

export const GameGridFeedItem = ({
  translate,
  sort,
  positionId,
  itemsPerRow,
  startingRow,
  recommendations,
  isExpandHomeContentEnabled
}: THomePageDiscoveryApiProps): JSX.Element | null => {
  const friendsPresence = useFriendsPresence();

  const homePageSessionInfo = usePageSession();

  const { contentMetadata, appendContentMetadata } = useContentMetadata();

  const fetchAdditionalMetadata = useCallback(() => {
    const gamesWithoutMetadata = recommendations.filter(
      ({ contentType, contentId }: { contentType: TContentType.Game; contentId: number }) =>
        !contentMetadata?.[contentType]?.[contentId]
    );

    if (gamesWithoutMetadata.length > 0) {
      bedev2Services
        .getOmniRecommendationsMetadata(
          gamesWithoutMetadata.slice(0, sortlessGridMaxTilesMetadataToFetch),
          homePageSessionInfo
        )
        .then(additionalMetadata => appendContentMetadata(additionalMetadata.contentMetadata))
        .catch(() => {
          // empty catch block, as this is not blocking. we will show the games we already have metadata for
        });
    }
  }, [recommendations, homePageSessionInfo, contentMetadata, appendContentMetadata]);

  useEffect(() => {
    fetchAdditionalMetadata();
  }, [fetchAdditionalMetadata]);

  const gridData: TGameData[] = useMemo(() => {
    return hydrateOmniRecommendationGames(recommendations, contentMetadata);
  }, [recommendations, contentMetadata]);

  if (gridData?.length === 0) {
    return null;
  }

  return (
    <HomePageGridDiscoveryApi
      key={sort.topic}
      sort={sort}
      gameData={gridData}
      translate={translate}
      positionId={positionId}
      itemsPerRow={itemsPerRow}
      startingRow={startingRow}
      friendsPresence={friendsPresence}
      componentType={sort.topicLayoutData?.componentType}
      playerCountStyle={sort.topicLayoutData?.playerCountStyle}
      playButtonStyle={sort.topicLayoutData?.playButtonStyle}
      hoverStyle={sort.topicLayoutData?.hoverStyle}
      isSponsoredFooterAllowed={sort.topicLayoutData?.isSponsoredFooterAllowed === 'true'}
      isExpandHomeContentEnabled={isExpandHomeContentEnabled}
    />
  );
};

GameGridFeedItem.defaultProps = {
  isExpandHomeContentEnabled: undefined
};

export default GameGridFeedItem;
