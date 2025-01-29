import { TValidHttpUrl } from 'core-utilities';
import React, { useCallback } from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { createItemPurchase } from 'roblox-item-purchase';
import {
  DefaultThumbnailSize,
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';
import { TGetProductDetails, TGetProductInfo, ValueOf } from '../types/playButtonTypes';
import PurchaseButtonUI from './PurchaseButtonUI';

const [ItemPurchase, itemPurchaseService] = createItemPurchase();

const getPrice = (productInfo?: TGetProductInfo): string => {
  return productInfo?.price?.toString() ?? '';
};

interface RobuxPurchaseButtonProps {
  universeId: string;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  hideButtonText?: boolean;
  redirectPurchaseUrl?: TValidHttpUrl;
  productDetails: TGetProductDetails;
  productInfo: TGetProductInfo;
  translate: TranslateFunction;
  refetchPlayabilityStatus: () => void;
}

const RobuxPurchaseButton: React.FC<RobuxPurchaseButtonProps> = ({
  universeId,
  iconClassName,
  buttonWidth,
  buttonClassName,
  hideButtonText,
  redirectPurchaseUrl,
  productDetails,
  productInfo,
  translate,
  refetchPlayabilityStatus
}) => {
  const startRobuxPurchase = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    itemPurchaseService.start();
  }, []);

  return (
    <React.Fragment>
      <PurchaseButtonUI
        buttonWidth={buttonWidth}
        buttonClassName={buttonClassName}
        iconClassName={iconClassName}
        hideButtonText={hideButtonText}
        buttonContent={getPrice(productInfo)}
        onClick={redirectPurchaseUrl ? undefined : startRobuxPurchase}
        redirectUrl={redirectPurchaseUrl}
      />
      <ItemPurchase
        {...{
          translate,
          productId: productInfo.productId,
          expectedPrice: productInfo.price,
          thumbnail: (
            <Thumbnail2d
              type={ThumbnailTypes.gameIcon}
              size={DefaultThumbnailSize}
              targetId={parseInt(universeId, 10)}
              imgClassName='game-card-thumb'
              format={ThumbnailFormat.jpeg}
            />
          ),
          assetName: productDetails.name,
          assetType: 'Place',
          sellerName: productDetails.builder,
          expectedCurrency: 1,
          expectedSellerId: productInfo.sellerId,
          onPurchaseSuccess: refetchPlayabilityStatus,
          isPlace: true
        }}
      />
    </React.Fragment>
  );
};

export default RobuxPurchaseButton;
