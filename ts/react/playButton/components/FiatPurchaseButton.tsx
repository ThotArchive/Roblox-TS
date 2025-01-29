import { TValidHttpUrl, urlService } from 'core-utilities';
import React, { useCallback, useState } from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { fireEvent } from 'roblox-event-tracker';
import playButtonConstants, { PlayabilityStatus } from '../constants/playButtonConstants';
import playButtonService from '../services/playButtonService';
import { TGetProductDetails, ValueOf } from '../types/playButtonTypes';
import { sendUnlockPlayIntentEvent } from '../utils/playButtonUtils';
import PurchaseButtonUI from './PurchaseButtonUI';

const {
  counterEvents,
  unlockPlayIntentConstants,
  playButtonTextTranslationMap
} = playButtonConstants;

const getPrice = (productDetails?: TGetProductDetails): string => {
  return productDetails?.fiatPurchaseData?.localizedFiatPrice ?? '';
};

type TFiatPurchaseButtonProps = {
  universeId: string;
  placeId: string;
  productDetails: TGetProductDetails;
  translate: TranslateFunction;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  hideButtonText?: boolean;
  redirectPurchaseUrl?: TValidHttpUrl;
  showDefaultPurchaseText?: boolean;
};

const FiatPurchaseButton: React.FC<TFiatPurchaseButtonProps> = ({
  universeId,
  placeId,
  productDetails,
  translate,
  iconClassName,
  buttonWidth,
  buttonClassName,
  hideButtonText,
  redirectPurchaseUrl,
  showDefaultPurchaseText = false
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const startFiatPurchase = useCallback(
    async (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      ev.preventDefault();
      ev.stopPropagation();
      const basePriceId = productDetails?.fiatPurchaseData?.basePriceId;
      if (!placeId || !basePriceId) {
        return;
      }
      setIsPurchasing(true);
      try {
        sendUnlockPlayIntentEvent(
          universeId,
          unlockPlayIntentConstants.fiatPurchaseUpsellName,
          PlayabilityStatus.FiatPurchaseRequired
        );
        const stripeUrl = await playButtonService.getFiatPurchaseUrl(placeId, basePriceId);
        if (stripeUrl && urlService.isValidStripeCheckoutUrl(stripeUrl)) {
          window.location.href = stripeUrl;
        }
      } catch (err) {
        fireEvent(counterEvents.PreparePurchaseUrlError);
        console.error('Error preparing purchase url');
      } finally {
        setIsPurchasing(false);
      }
    },
    [placeId, productDetails, universeId]
  );

  return (
    <PurchaseButtonUI
      buttonWidth={buttonWidth}
      buttonClassName={buttonClassName}
      iconClassName={iconClassName}
      hideButtonText={hideButtonText}
      hideButtonIcon
      buttonContent={
        showDefaultPurchaseText
          ? translate(playButtonTextTranslationMap.Buy)
          : getPrice(productDetails)
      }
      onClick={redirectPurchaseUrl ? undefined : startFiatPurchase}
      redirectUrl={redirectPurchaseUrl}
      isPurchasing={isPurchasing}
    />
  );
};

export default FiatPurchaseButton;
