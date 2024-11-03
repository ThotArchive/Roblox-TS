import React from 'react';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { ItemCard, ItemCardUtils, Link } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import {
  TCatalog,
  TAvatarShopHomepageRecommendationsCarousel
} from './AvatarShopHomepageRecommendationsCarouselTypes';
import urlConfigs from '../constants/urlConfigs';
import translationConfig from '../translation.config';

export const AvatarShopHomepageRecommendationsCarousel = ({
  recommendedItems,
  translate
}: {
  recommendedItems: Array<TCatalog>;
  translate: TranslateFunction;
}): JSX.Element | null => {
  if (recommendedItems === undefined || recommendedItems.length < 1) {
    return <div />;
  }
  return (
    <React.Fragment>
      <div
        className='avatar-shop-homepage-recommendations-container'
        id='populated-avatar-shop-homepage-recommendations'>
        <div className='avatar-shop-homepage-carousel-title'>
          <Link url={urlConfigs.avatarShopRecommendationUrl} className='font-header-1'>
            {translate('Label.AvatarItemsForYou')}
          </Link>
          <Link url={urlConfigs.avatarShopRecommendationUrl} className='see-all-link-icon'>
            {translate('Action.SeeAll')}
          </Link>
        </div>
        <div className='avatar-shop-homepage-carousel'>
          {recommendedItems.map((item: TCatalog) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <ItemCard
                id={item.itemId}
                name={item.name}
                type={item.itemType}
                creatorName={item.creatorName}
                creatorType={item.creatorType}
                creatorTargetId={item.creatorId}
                price={item.price}
                lowestPrice={item.lowestPrice}
                unitsAvailableForConsumption={item.numberRemaining}
                itemStatus={item.itemStatus}
                priceStatus={item.noPriceStatus}
                premiumPricing={item.premiumPrice}
                itemRestrictions={item.itemRestrictions}
                thumbnail2d={
                  <Thumbnail2d
                    type={
                      ItemCardUtils.checkIfBundle(item.itemType)
                        ? ThumbnailTypes.bundleThumbnail
                        : ThumbnailTypes.assetThumbnail
                    }
                    targetId={item.itemId}
                    size={DefaultThumbnailSize}
                  />
                }
              />
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

export default withTranslations<{ recommendedItems: Array<TCatalog> }>(
  AvatarShopHomepageRecommendationsCarousel,
  translationConfig
) as TAvatarShopHomepageRecommendationsCarousel;
