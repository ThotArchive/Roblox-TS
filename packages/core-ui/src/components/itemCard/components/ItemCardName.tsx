import { JSX } from "react";

function ItemCardName({
  name,
  premiumPricing,
}: {
  name: string;
  premiumPricing: number | undefined;
}): JSX.Element {
  const shouldShowPremiumIcon = () => premiumPricing !== undefined && premiumPricing >= 0;
  return (
    <div className="item-card-name-link">
      <div className="item-card-name" title={name}>
        {shouldShowPremiumIcon() && <span className="icon-premium-small" />}
        {name}
      </div>
    </div>
  );
}

export default ItemCardName;
