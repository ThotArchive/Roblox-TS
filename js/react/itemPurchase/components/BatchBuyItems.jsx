import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Loading } from 'react-style-guide';
import { withTranslations } from 'react-utilities';
import { urlService, httpService } from 'core-utilities';
import { authenticatedUser } from 'header-scripts';
import createMultiItemPurchaseModal from '../factories/createMultiItemPurchaseModal';
import createInsufficientFundsModal from '../factories/createInsufficientFundsModal';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import translationConfig from '../translation.config';
import createLeaveRobloxWarningModal from '../factories/createLeaveRobloxWarningModal';
import urlConstants from '../constants/urlConstants';
import universalAppConfigurationService from '../services/universalAppConfigurationService';

const [InsufficientFundsModal, InsufficientFundsModalService] = createInsufficientFundsModal();
const [MultiItemPurchaseModal, MultiItemPurchaseModalService] = createMultiItemPurchaseModal();
const [LeaveRobloxWarningModal, LeaveRobloxWarningModalService] = createLeaveRobloxWarningModal();
const { resources } = itemPurchaseConstants;

export function BatchBuyItems({
  currentUserBalance,
  items,
  itemDetails,
  onBuyButtonClick,
  onConfirm,
  onCancel,
  onTransactionComplete,
  productSurface,
  systemFeedbackService,
  translate
}) {
  let shouldDisplayBuyButton = false;
  let price = 0;
  let premiumPrice = 0;
  const resaleItems = [];
  const [purchasePending, setPurchasePending] = useState(false);
  const [shouldRedirectToVng, setShouldRedirectToVng] = useState(false);

  const getLoginUrl = () => {
    const parsedParams = {
      ReturnUrl: window.location.pathname
    };
    const loginRedirUrl = urlService.getUrlWithQueries('/login', parsedParams);
    return loginRedirUrl;
  };

  useEffect(() => {
    universalAppConfigurationService
      .getVngBuyRobuxBehavior()
      .then(({ data }) => {
        const { shouldShowVng } = data;
        setShouldRedirectToVng(shouldShowVng);
      })
      .catch(errorRes => {
        console.debug(errorRes);
        setShouldRedirectToVng(false);
      });
  }, []);

  const isItemPurchasable = item => {
    if (item.collectibleItemId !== undefined) {
      return (item.isMarketPlaceEnabled && item.isPurchasable) || item.resellerAvailable;
    }
    return item.isMarketPlaceEnabled && (item.resellerAvailable || item.isPurchasable);
  };

  if (!authenticatedUser.isAuthenticated) {
    return (
      <div className='sign-in'>
        <Button
          className='action-button batch-buy-purchase-button sign-in-button'
          variant={Button.variants.growth}
          size={Button.sizes.large}
          onClick={() => {
            window.location = getLoginUrl();
          }}>
          {translate(resources.buyAction)}
        </Button>
      </div>
    );
  }

  if (
    itemDetails === undefined ||
    (itemDetails.length > 0 && itemDetails[0] && itemDetails[0].loading) ||
    currentUserBalance === undefined
  ) {
    return (
      <div className='loading'>
        <Button
          className='action-button batch-buy-purchase-button'
          variant={Button.variants.growth}
          size={Button.sizes.large}
          isDisabled>
          <Loading />
        </Button>
      </div>
    );
  }

  if (itemDetails.length === 0 || (itemDetails[0] && itemDetails[0].loadFailure)) {
    return (
      <Button
        className='action-button batch-buy-purchase-button'
        variant={Button.variants.growth}
        size={Button.sizes.large}
        isDisabled>
        {translate(resources.buyAction)}
      </Button>
    );
  }

  itemDetails.forEach(item => {
    if (isItemPurchasable(item)) {
      shouldDisplayBuyButton = true;
    }

    if (item.premiumPriceInRobux && authenticatedUser.isPremiumUser) {
      premiumPrice += item.premiumPriceInRobux;
    } else if (item.lowestPrice) {
      price += item.lowestPrice;
    } else if (item.price) {
      price += item.price;
    }

    if (item.resellerAvailable) {
      resaleItems.push(item);
    }
  });

  const robuxNeeded = price + premiumPrice - currentUserBalance;

  const getButtonType = () => {
    if (price === 0) {
      return translate(resources.getAction);
    }
    return translate(resources.buyAction);
  };

  const handleButtonClick = () => {
    if (robuxNeeded > 0) {
      InsufficientFundsModalService.open();
    } else {
      MultiItemPurchaseModalService.open();
    }
    onBuyButtonClick();
  };

  const handleInsufficientFundsButtonClick = () => {
    if (shouldRedirectToVng) {
      LeaveRobloxWarningModalService.open();
    } else {
      window.location = urlConstants.getRobuxUpgradesUrl('');
    }
  };

  const handleLeaveRobloxWarningButtonClick = () => {
    const urlConfig = {
      url: urlConstants.getVngShopUrl(),
      withCredentials: true
    };

    httpService
      .get(urlConfig)
      .then(({ data: { vngShopRedirectUrl } }) => {
        window.open(vngShopRedirectUrl, '_blank').focus();
      })
      .catch(() => {
        window.open(urlConstants.getVngShopFallbackUrl, '_blank').focus();
      });

    LeaveRobloxWarningModalService.close();
  };

  return (
    <React.Fragment>
      <div>
        <Button
          className='action-button batch-buy-purchase-button'
          variant={Button.variants.growth}
          size={Button.sizes.large}
          onClick={handleButtonClick}
          isDisabled={!shouldDisplayBuyButton}>
          {purchasePending ? <Loading /> : translate(resources.buyAction)}
        </Button>
      </div>
      {robuxNeeded > 0 && (
        <div id='insufficient-funds-modal'>
          <InsufficientFundsModal
            robuxNeeded={robuxNeeded}
            onAccept={handleInsufficientFundsButtonClick}
          />
        </div>
      )}
      {shouldRedirectToVng && (
        <div id='leave-roblox-warning-modal'>
          <LeaveRobloxWarningModal onContinueToPayment={handleLeaveRobloxWarningButtonClick} />
        </div>
      )}
      <div id='multi-item-purchase-modal'>
        <MultiItemPurchaseModal
          title={translate(resources.buyNowAction)}
          expectedTotalPrice={price + premiumPrice}
          items={items}
          itemDetails={itemDetails}
          resaleItems={resaleItems}
          currentRobuxBalance={currentUserBalance}
          onCancel={() => {
            MultiItemPurchaseModalService?.close?.();
            onCancel();
          }}
          onTransactionComplete={result => {
            setPurchasePending(false);
            onTransactionComplete(result);
          }}
          onAction={() => {
            MultiItemPurchaseModalService?.close?.();
            setPurchasePending(true);
            onConfirm();
          }}
          loading={false}
          productSurface={productSurface}
          systemFeedbackService={systemFeedbackService}
        />
      </div>
    </React.Fragment>
  );
}

BatchBuyItems.propTypes = {
  currentUserBalance: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      itemType: PropTypes.string.isRequired
    })
  ).isRequired,
  itemDetails: PropTypes.arrayOf(
    PropTypes.shape({
      productId: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      itemName: PropTypes.string.isRequired,
      itemType: PropTypes.string.isRequired,
      assetTypeDisplayName: PropTypes.string.isRequired,
      sellerName: PropTypes.string.isRequired,
      expectedSellerId: PropTypes.number.isRequired,
      isPurchasable: PropTypes.bool.isRequired,
      isOwned: PropTypes.bool.isRequired,
      isPlugin: PropTypes.bool.isRequired,
      itemDetailItemId: PropTypes.number.isRequired,
      loading: PropTypes.bool.isRequired,
      loadFailure: PropTypes.bool,
      userQualifiesForPremiumPrices: PropTypes.bool.isRequired,
      premiumPriceInRobux: PropTypes.number,
      isAuthenticated: PropTypes.bool.isRequired,
      resellerAvailable: PropTypes.bool.isRequired,
      firstReseller: PropTypes.shape({
        seller: {
          name: PropTypes.string.isRequired,
          id: PropTypes.number.isRequired
        },
        userAssetId: PropTypes.number.isRequired
      }),
      isMarketPlaceEnabled: PropTypes.bool.isRequired
    })
  ).isRequired,
  onBuyButtonClick: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onTransactionComplete: PropTypes.func.isRequired,
  productSurface: PropTypes.string.isRequired,
  systemFeedbackService: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};

// eslint-disable-next-line import/prefer-default-export
export const BatchBuyItemsButton = withTranslations(
  BatchBuyItems,
  translationConfig.purchasingResources
);
