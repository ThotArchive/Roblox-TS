import React from 'react';
import itemCardUtils from '../utils/itemCardUtils';

export type TItemCardRestrictionsProps = {
  type: string;
  itemRestrictions: Array<string> | undefined;
};

export function ItemCardRestrictions({
  type,
  itemRestrictions
}: TItemCardRestrictionsProps): JSX.Element {
  const itemRestrictionLabels = itemCardUtils.mapItemRestrictionIcons(itemRestrictions, type);
  return (
    <React.Fragment>
      {itemRestrictions !== undefined &&
        itemRestrictions.length > 0 &&
        itemRestrictionLabels.itemRestrictionIcon !== undefined && (
          <span className={`restriction-icon ${itemRestrictionLabels.itemRestrictionIcon}`} />
        )}
    </React.Fragment>
  );
}
export default ItemCardRestrictions;
