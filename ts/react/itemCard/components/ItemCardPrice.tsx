import React from 'react';
import { authenticatedUser } from 'header-scripts';
import ClassNames from 'classnames';
import itemCardConstants from '../constants/itemCardConstants';
import { getNumberFormat } from '../utils/parsingUtils';

export type TItemCardPriceProps = {
  creatorTargetId: number;
  price: number | undefined;
  lowestPrice: number | undefined;
  priceStatus: string | undefined;
  premiumPricing: number | undefined;
  unitsAvailableForConsumption: number | undefined;
  enableThumbnailPrice: boolean;
};

export function ItemCardPrice({
  creatorTargetId,
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  unitsAvailableForConsumption,
  enableThumbnailPrice
}: TItemCardPriceProps): JSX.Element {
  const hasSecondaryInfo = () => {
    return (
      creatorTargetId !== itemCardConstants.robloxSystemUserId ||
      (unitsAvailableForConsumption !== undefined && unitsAvailableForConsumption > 0) ||
      (price !== undefined && price > 0 && lowestPrice !== undefined && lowestPrice > 0)
    );
  };

  const getPriceForItem = () => {
    if (authenticatedUser.isPremiumUser && premiumPricing !== undefined && premiumPricing >= 0) {
      return premiumPricing;
    }
    if (lowestPrice !== undefined && lowestPrice >= 0) {
      return lowestPrice;
    }
    if (price === undefined) {
      return 0;
    }
    return price;
  };
  return (
    <React.Fragment>
      <div
        className={ClassNames('text-overflow item-card-price font-header-2 text-subheader', {
          'margin-top-none': hasSecondaryInfo(),
          'thumbnail-price': enableThumbnailPrice
        })}>
        {priceStatus ? (
          <span className='text text-label text-robux-tile'>{priceStatus}</span>
        ) : (
          <React.Fragment>
            <span className='icon icon-robux-16x16' />
            <span className='text-robux-tile'>{getNumberFormat(getPriceForItem())}</span>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}
export default ItemCardPrice;
