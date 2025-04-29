import React, { JSX } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { formatNumber } from "@rbx/core-scripts/format/number";
import classNames from "classnames";
import itemCardConstants from "../constants/itemCardConstants";

function ItemCardPrice({
  creatorTargetId,
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  unitsAvailableForConsumption,
  enableThumbnailPrice,
}: {
  creatorTargetId: number;
  price: number | undefined;
  lowestPrice: number | undefined;
  priceStatus: string | undefined;
  premiumPricing: number | undefined;
  unitsAvailableForConsumption: number | undefined;
  enableThumbnailPrice: boolean;
}): JSX.Element {
  const hasSecondaryInfo = () =>
    creatorTargetId !== itemCardConstants.robloxSystemUserId ||
    (unitsAvailableForConsumption !== undefined && unitsAvailableForConsumption > 0) ||
    (price !== undefined && price > 0 && lowestPrice !== undefined && lowestPrice > 0);

  const getPriceForItem = () => {
    if (authenticatedUser()?.isPremiumUser && premiumPricing !== undefined && premiumPricing >= 0) {
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
    <div
      className={classNames("text-overflow item-card-price font-header-2 text-subheader", {
        "margin-top-none": hasSecondaryInfo(),
        "thumbnail-price": enableThumbnailPrice,
      })}
    >
      {priceStatus ? (
        <span className="text text-label text-robux-tile">{priceStatus}</span>
      ) : (
        <React.Fragment>
          <span className="icon icon-robux-16x16" />
          <span className="text-robux-tile">{formatNumber(getPriceForItem())}</span>
        </React.Fragment>
      )}
    </div>
  );
}

export default ItemCardPrice;
