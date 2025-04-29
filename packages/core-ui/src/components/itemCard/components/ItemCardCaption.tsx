import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import ItemCardPrice from "./ItemCardPrice";
import ItemCardCreatorName from "./ItemCardCreatorName";
import ItemCardName from "./ItemCardName";

function ItemCardCaption({
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
  iconToRender,
  enableThumbnailPrice,
}: {
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
  enableThumbnailPrice?: boolean;
}): JSX.Element {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hideCreatorName = creatorName === undefined;
  const hidePrice =
    price === undefined &&
    lowestPrice === undefined &&
    premiumPricing === undefined &&
    priceStatus === undefined;
  return (
    <div className="item-card-caption">
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
      {!hidePrice && !enableThumbnailPrice && (
        <ItemCardPrice
          creatorTargetId={creatorTargetId}
          price={price}
          lowestPrice={lowestPrice}
          priceStatus={priceStatus}
          premiumPricing={premiumPricing}
          unitsAvailableForConsumption={unitsAvailableForConsumption}
          enableThumbnailPrice={enableThumbnailPrice ?? false}
        />
      )}
    </div>
  );
}

export default ItemCardCaption;
