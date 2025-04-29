import React, { JSX } from "react";
import { mapItemRestrictionIcons } from "../utils";

function ItemCardRestrictions({
  type,
  itemRestrictions,
}: {
  type: string;
  itemRestrictions: string[] | undefined;
}): JSX.Element {
  const itemRestrictionLabels = mapItemRestrictionIcons(itemRestrictions, type);
  return (
    <React.Fragment>
      {itemRestrictions !== undefined && itemRestrictions.length > 0 && (
        <span className={`restriction-icon ${itemRestrictionLabels.itemRestrictionIcon}`} />
      )}
    </React.Fragment>
  );
}

export default ItemCardRestrictions;
