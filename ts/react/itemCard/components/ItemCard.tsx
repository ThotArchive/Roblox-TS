import React, { useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import itemCardUtils from '../utils/itemCardUtils';
import ItemCardThumbnail, { TItemCardShoppingCardProps } from './ItemCardThumbnail';
import ItemCardCaption from './ItemCardCaption';
import translationConfig from '../translation.config';

export type TItemCardProps = {
  id: number;
  name: string;
  type: string;
  creatorName: string;
  creatorType: string;
  creatorTargetId: number;
  price: number | undefined;
  lowestPrice: number | undefined;
  priceStatus: string | undefined;
  premiumPricing: number | undefined;
  unitsAvailableForConsumption: number | undefined;
  itemStatus: Array<string> | undefined;
  itemRestrictions: Array<string> | undefined;
  thumbnail2d: React.ReactElement;
  iconToRender?: JSX.Element;
  shoppingCartProps?: TItemCardShoppingCardProps;
};

export function ItemCard({
  id,
  name,
  type,
  creatorName,
  creatorType,
  creatorTargetId,
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  unitsAvailableForConsumption,
  itemStatus,
  itemRestrictions,
  thumbnail2d,
  translate,
  iconToRender,
  shoppingCartProps
}: TItemCardProps & WithTranslationsProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className='list-item item-card grid-item-container'
      key={name}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className='item-card-container'>
        <a
          href={itemCardUtils.getItemLink(id, name, type)}
          target='_self'
          className='item-card-link'>
          <ItemCardThumbnail
            itemId={id}
            itemType={type}
            itemName={name}
            itemStatus={itemStatus !== null ? itemStatus : undefined}
            itemRestrictions={itemRestrictions !== null ? itemRestrictions : undefined}
            thumbnail2d={thumbnail2d}
            translate={translate}
            isHovered={isHovered}
            shoppingCartProps={shoppingCartProps}
          />
          <ItemCardCaption
            name={name}
            creatorName={creatorName}
            creatorType={creatorType}
            creatorTargetId={creatorTargetId}
            price={price !== null ? price : undefined}
            lowestPrice={lowestPrice !== null ? lowestPrice : undefined}
            priceStatus={priceStatus !== null ? priceStatus : undefined}
            premiumPricing={premiumPricing !== null ? premiumPricing : undefined}
            unitsAvailableForConsumption={
              unitsAvailableForConsumption !== null ? unitsAvailableForConsumption : undefined
            }
            translate={translate}
            iconToRender={iconToRender}
          />
        </a>
      </div>
    </div>
  );
}
export default withTranslations<TItemCardProps>(ItemCard, translationConfig);
