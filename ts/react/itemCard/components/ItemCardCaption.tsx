import React from 'react';
import { TranslateFunction } from 'react-utilities';
import ItemCardPrice from './ItemCardPrice';
import ItemCardCreatorName from './ItemCardCreatorName';
import ItemCardName from './ItemCardName';
import ItemCardLowestPrice from './ItemCardLowestPrice';
import ItemCardUnitsRemaining from './ItemCardUnitsRemaining';

export type TItemCardCaptionProps = {
  name: string;
  creatorName: string;
  creatorType: string;
  creatorTargetId: number;
  price: number | undefined;
  lowestPrice: number | undefined;
  priceStatus: string | undefined;
  premiumPricing: number | undefined;
  unitsAvailableForConsumption: number | undefined;
  translate: TranslateFunction;
  iconToRender?: JSX.Element;
};

export function ItemCardCaption({
  name,
  creatorName,
  creatorType,
  creatorTargetId,
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  unitsAvailableForConsumption,
  translate,
  iconToRender
}: TItemCardCaptionProps): JSX.Element {
  const hideCreatorName = creatorName === undefined;
  const hidePrice =
    price === undefined &&
    lowestPrice === undefined &&
    premiumPricing === undefined &&
    priceStatus === undefined;
  return (
    <div className='item-card-caption'>
      <ItemCardName name={name} premiumPricing={premiumPricing} />
      {!hideCreatorName && (
        <ItemCardCreatorName
          creatorName={creatorName}
          creatorType={creatorType}
          creatorTargetId={creatorTargetId}
          translate={translate}
          iconToRender={iconToRender}
        />
      )}
      {!hidePrice && (
        <ItemCardPrice
          creatorTargetId={creatorTargetId}
          price={price}
          lowestPrice={lowestPrice}
          priceStatus={priceStatus}
          premiumPricing={premiumPricing}
          unitsAvailableForConsumption={unitsAvailableForConsumption}
        />
      )}
    </div>
  );
}
export default ItemCardCaption;
