import React, { JSX, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import ItemCardThumbnail, { ItemCardShoppingCardProps } from "./ItemCardThumbnail";
import ItemCardCaption from "./ItemCardCaption";
import translationConfig from "../translation.config";
import { getItemLink } from "../utils";

export type Props = {
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
  itemStatus: string[] | undefined;
  itemRestrictions: string[] | undefined;
  thumbnail2d: React.ReactElement;
  iconToRender?: JSX.Element;
  shoppingCartProps?: ItemCardShoppingCardProps;
  containerClassName?: string;
  enableThumbnailPrice?: boolean;
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
  shoppingCartProps,
  containerClassName,
  enableThumbnailPrice,
}: Props & WithTranslationsProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className={containerClassName ?? "list-item item-card grid-item-container"}
      key={name}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <div className="item-card-container">
        <a href={getItemLink(id, name, type)} target="_self" className="item-card-link">
          <ItemCardThumbnail
            itemId={id}
            itemType={type}
            itemName={name}
            itemStatus={itemStatus ?? undefined}
            itemRestrictions={itemRestrictions ?? undefined}
            thumbnail2d={thumbnail2d}
            translate={translate}
            isHovered={isHovered}
            shoppingCartProps={shoppingCartProps}
            creatorTargetId={creatorTargetId}
            price={price ?? undefined}
            lowestPrice={lowestPrice ?? undefined}
            priceStatus={priceStatus ?? undefined}
            premiumPricing={premiumPricing ?? undefined}
            enableThumbnailPrice={enableThumbnailPrice}
          />
          <ItemCardCaption
            name={name}
            creatorName={creatorName}
            creatorType={creatorType}
            creatorTargetId={creatorTargetId}
            price={price ?? undefined}
            lowestPrice={lowestPrice ?? undefined}
            priceStatus={priceStatus ?? undefined}
            premiumPricing={premiumPricing ?? undefined}
            unitsAvailableForConsumption={unitsAvailableForConsumption ?? undefined}
            translate={translate}
            iconToRender={iconToRender}
            enableThumbnailPrice={enableThumbnailPrice}
          />
        </a>
      </div>
    </div>
  );
}
export default withTranslations(ItemCard, translationConfig);
