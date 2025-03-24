import { TValidHttpUrl } from 'core-utilities';
import React, { useEffect, useState } from 'react';
import { Button, Loading } from 'react-style-guide';
import { TranslateFunction, withTranslations } from 'react-utilities';
import playButtonTranslationConfig from '../../../../translation.config';
import { PlayabilityStatus } from '../constants/playButtonConstants';
import playButtonService from '../services/playButtonService';
import {
  TGetProductDetails,
  TGetProductInfo,
  TPlayabilityStatusPurchaseRequired,
  ValueOf
} from '../types/playButtonTypes';
import FiatPurchaseButton from './FiatPurchaseButton';
import RobuxPurchaseButton from './RobuxPurchaseButton';

enum PurchaseType {
  Robux = 'Robux',
  Fiat = 'Fiat'
}

const getPurchaseType = (
  playabilityStatus: TPlayabilityStatusPurchaseRequired,
  productDetails?: TGetProductDetails
): PurchaseType => {
  if (
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired &&
    productDetails?.fiatPurchaseData
  ) {
    return PurchaseType.Fiat;
  }
  return PurchaseType.Robux;
};

export type TPurchaseButtonContainerProps = {
  universeId: string;
  placeId: string;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  refetchPlayabilityStatus: () => void;
  hideButtonText?: boolean;
  redirectPurchaseUrl?: TValidHttpUrl;
  playabilityStatus: TPlayabilityStatusPurchaseRequired;
  showDefaultPurchaseText?: boolean;
};

export const PurchaseButtonContainer = ({
  translate,
  universeId,
  placeId,
  iconClassName = 'icon-robux-white',
  buttonWidth = Button.widths.full,
  buttonClassName = 'btn-economy-robux-white-lg',
  refetchPlayabilityStatus,
  hideButtonText = false,
  redirectPurchaseUrl,
  playabilityStatus,
  showDefaultPurchaseText = false
}: TPurchaseButtonContainerProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  const [productInfo, setProductInfo] = useState<TGetProductInfo | undefined>(undefined);
  const [productDetails, setProductDetails] = useState<TGetProductDetails | undefined>(undefined);
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const response = await playButtonService.getProductInfo([universeId]);
        setProductInfo(response);
      } catch (e) {
        console.log(e);
      }
    };

    const fetchProductDetails = async () => {
      try {
        const response = await playButtonService.getProductDetails([placeId]);
        setProductDetails(response);
      } catch (e) {
        console.log(e);
      }
    };

    // eslint-disable-next-line no-void
    void fetchProductInfo();
    // eslint-disable-next-line no-void
    void fetchProductDetails();
  }, [placeId, universeId]);

  if (productInfo === undefined || productDetails === undefined) {
    return <Loading />;
  }

  return getPurchaseType(playabilityStatus, productDetails) === PurchaseType.Fiat ? (
    <FiatPurchaseButton
      universeId={universeId}
      placeId={placeId}
      iconClassName={iconClassName}
      buttonWidth={buttonWidth}
      buttonClassName={buttonClassName}
      hideButtonText={hideButtonText}
      redirectPurchaseUrl={redirectPurchaseUrl}
      productDetails={productDetails}
      translate={translate}
      showDefaultPurchaseText={showDefaultPurchaseText}
    />
  ) : (
    <RobuxPurchaseButton
      universeId={universeId}
      iconClassName={iconClassName}
      buttonWidth={buttonWidth}
      buttonClassName={buttonClassName}
      hideButtonText={hideButtonText}
      redirectPurchaseUrl={redirectPurchaseUrl}
      productDetails={productDetails}
      productInfo={productInfo}
      translate={translate}
      refetchPlayabilityStatus={refetchPlayabilityStatus}
    />
  );
};

export default withTranslations<TPurchaseButtonContainerProps>(
  PurchaseButtonContainer,
  playButtonTranslationConfig
);
