import React, { useMemo } from 'react';
import { AvatarShopHomepageRecommendations } from 'Roblox';
import { homePage } from '../common/constants/configConstants';
import {
  TCatalog,
  TContentType,
  TOmniRecommendationCatalogSort
} from '../common/types/bedev2Types';
import { useContentMetadata } from './utils/contentMetadataContextProvider';

const { maxTilesPerCarouselPage } = homePage;

type THomePageDiscoveryApiProps = {
  sort: TOmniRecommendationCatalogSort;
};

export const AvatarCarouselFeedItem = ({
  sort
}: THomePageDiscoveryApiProps): JSX.Element | null => {
  const { contentMetadata } = useContentMetadata();

  const carouselData: TCatalog[] = useMemo(() => {
    return sort.recommendationList
      .map(({ contentType, contentId }: { contentType: TContentType; contentId: number }) => {
        const data = contentMetadata?.[contentType]?.[contentId];
        if (data) {
          const catalogData = data as TCatalog;
          catalogData.itemId = contentId;
          catalogData.itemType = contentType;
        }

        return data as TCatalog;
      })
      .filter(recommendation => recommendation)
      .slice(0, maxTilesPerCarouselPage);
  }, [sort.recommendationList, contentMetadata]);

  if (carouselData?.length === 0) {
    return null;
  }

  return <AvatarShopHomepageRecommendations recommendedItems={carouselData} />;
};

export default AvatarCarouselFeedItem;
