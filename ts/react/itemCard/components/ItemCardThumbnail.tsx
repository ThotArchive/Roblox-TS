import React from 'react';
import { TranslateFunction } from 'react-utilities';
import ItemCardStatus from './ItemCardStatus';
import ItemCardRestrictions from './ItemCardRestrictions';

export interface TItemCardShoppingCardProps {
  isItemInCart: boolean;
  addItemToCart: (
    itemInfo: {
      itemId: number;
      collectibleItemId?: string | null;
      itemType: string;
      itemName: string;
      addedToCardAt?: number;
    },
    displaySystemFeedback?: boolean | undefined
  ) => Promise<void>;
  removeItemFromCart: (
    itemId: number,
    itemType: string,
    displaySystemFeedback?: boolean | undefined
  ) => Promise<void>;
}

export type TItemCardThumbnailProps = {
  itemId: number;
  itemType: string;
  itemName: string;
  itemStatus: Array<string> | undefined;
  itemRestrictions: Array<string> | undefined;
  thumbnail2d: React.ReactNode;
  translate: TranslateFunction;
  isHovered: boolean;
  shoppingCartProps?: TItemCardShoppingCardProps;
};

export function ItemCardThumbnail({
  itemId,
  itemType,
  itemName,
  itemStatus,
  itemRestrictions,
  thumbnail2d,
  translate,
  isHovered,
  shoppingCartProps
}: TItemCardThumbnailProps): JSX.Element {
  let shoppingCartButtons = null;
  if (shoppingCartProps && isHovered) {
    const { isItemInCart, addItemToCart, removeItemFromCart } = shoppingCartProps;
    shoppingCartButtons = (
      <React.Fragment>
        {!isItemInCart && (
          <div className='add-to-cart-btn-container'>
            <button
              type='button'
              className='btn-primary-md add-to-cart'
              onClick={evt => {
                evt?.preventDefault?.();
                evt?.stopPropagation?.();

                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                addItemToCart({ itemId, itemType, itemName }, true);
              }}>
              {translate('Action.Add')}
            </button>
          </div>
        )}
        {isItemInCart && (
          <div className='add-to-cart-btn-container'>
            <button
              type='button'
              className='btn-secondary-md remove-from-cart'
              onClick={evt => {
                evt?.preventDefault?.();
                evt?.stopPropagation?.();

                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                removeItemFromCart(itemId, itemType, true);
              }}>
              {translate('Action.Remove')}
            </button>
          </div>
        )}
      </React.Fragment>
    );
  }

  return (
    <div className='item-card-link'>
      <div className='item-card-thumb-container'>
        <div className='item-card-thumb-container-inner'>{thumbnail2d}</div>
        <ItemCardStatus itemStatus={itemStatus} translate={translate} />
        <ItemCardRestrictions type={itemType} itemRestrictions={itemRestrictions} />
        {shoppingCartButtons}
      </div>
    </div>
  );
}
export default ItemCardThumbnail;
