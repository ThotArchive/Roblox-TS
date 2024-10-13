import React from 'react';

export type TItemCardNameProps = {
  name: string;
  premiumPricing: number | undefined;
};

export function ItemCardName({ name, premiumPricing }: TItemCardNameProps): JSX.Element {
  const shouldShowPremiumIcon = () => {
    return premiumPricing !== undefined && premiumPricing >= 0;
  };
  return (
    <div className='item-card-name-link'>
      <div className='item-card-name' title={name}>
        {shouldShowPremiumIcon() && <span className='icon-premium-small' />}
        {name}
      </div>
    </div>
  );
}
export default ItemCardName;
