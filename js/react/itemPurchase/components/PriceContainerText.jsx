import React from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'react-style-guide';
import { renderToString } from 'react-dom/server';
import { withTranslations } from 'react-utilities';
import { numberFormat } from 'core-utilities';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from './PriceLabel';
import PriceLabelText from './PriceLabelText';
import urlConstants from '../constants/urlConstants';
import translationConfig from '../translation.config';

const { resources, errorMessages } = itemPurchaseConstants;
const { getPremiumConversionUrl } = urlConstants;

function PriceContainerText({
  translate,
  price,
  itemType,
  itemDetailItemId,
  premiumPriceInRobux,
  premiumDiscountPercentage,
  userQualifiesForPremiumPrices,
  isOwned,
  loading,
  loadFailure,
  unitsAvailableForConsumption,
  isLimited,
  isPlugin,
  resellerAvailable,
  priceStatus,
  offSaleDeadline,
  isMarketPlaceEnabled
}) {
  const showRenderRobuxIcon = premiumPriceInRobux == null && price == null;
  let itemFirstLineDisplayEnabled = true;
  let firstLineText = '';

  const sendPaymentFlowEvent = event => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      event.target.innerText
    );
  };
  const renderPremiumPrice = () => {
    if (premiumPriceInRobux == null || isOwned) {
      return null;
    }
    if (price == null) {
      if (userQualifiesForPremiumPrices) {
        return (
          <span className='small text field-content empty-label wait-for-i18n-format-render'>
            {translate(resources.premiumExclusiveEligiblePromptLabel)}
          </span>
        );
      }
      return (
        <span className='small text field-content empty-label wait-for-i18n-format-render'>
          {translate(resources.premiumExclusiveIneligiblePromptLabel)}
        </span>
      );
    }
    const assetInfo = {
      originalPrice: renderToString(<PriceLabel {...{ price }} />),
      discountPercentage: premiumDiscountPercentage,
      premiumDiscountedPrice: renderToString(<PriceLabel {...{ price: premiumPriceInRobux }} />)
    };
    return (
      <React.Fragment>
        <div className='text-label field-label empty-label'>&nbsp;</div>
        <span className='premium-prompt small text field-content empty-label wait-for-i18n-format-render'>
          {userQualifiesForPremiumPrices ? (
            <a
              aria-label=' '
              href={getPremiumConversionUrl(itemDetailItemId, itemType)}
              dangerouslySetInnerHTML={{
                __html: translate(resources.premiumDiscountSavingsLabel, assetInfo)
              }}
              onClick={event => {
                sendPaymentFlowEvent(event);
                window.open(getPremiumConversionUrl(itemDetailItemId, itemType));
              }}
            />
          ) : (
            <a
              aria-label=' '
              href={getPremiumConversionUrl(itemDetailItemId, itemType)}
              dangerouslySetInnerHTML={{
                __html: translate(resources.premiumDiscountOpportunityPromptLabel, assetInfo)
              }}
              onClick={event => {
                sendPaymentFlowEvent(event);
                window.open(getPremiumConversionUrl(itemDetailItemId, itemType));
              }}
            />
          )}
        </span>
      </React.Fragment>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!loading && loadFailure) {
    firstLineText = errorMessages.retryErrorMessage;
  } else if (priceStatus === resources.offSale && offSaleDeadline === null) {
    firstLineText = translate(resources.itemNoLongerForSaleLabel);
  } else if (!isMarketPlaceEnabled && !isOwned) {
    firstLineText = translate(resources.purchasingTemporarilyUnavailableLabel);
  } else if (!isPlugin && isOwned && !isLimited) {
    firstLineText = translate(resources.itemAvailableInventoryLabel);
  } else if (isLimited && unitsAvailableForConsumption === 0 && !resellerAvailable) {
    firstLineText = translate(resources.noOneCurrentlySellingLabel);
  } else {
    itemFirstLineDisplayEnabled = false;
  }

  if (price === 0) {
    return null;
  }

  // checks if item is owned: owned item displays both itemFirstLine message
  if (itemFirstLineDisplayEnabled && !isOwned) {
    return (
      <div className='price-container-text'>
        <div className='item-first-line'> {firstLineText} </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className='price-container-text'>
        {itemFirstLineDisplayEnabled ? (
          <div className='item-first-line'> {firstLineText} </div>
        ) : null}
        <PriceLabelText {...{ translate, isLimited, resellerAvailable }} />
        <div className='price-info'>
          <div className='icon-text-wrapper clearfix icon-robux-price-container'>
            {showRenderRobuxIcon ? (
              <span className='icon-robux-16x16 icon-robux-gray-16x16 wait-for-i18n-format-render' />
            ) : (
              <span className='icon-robux-16x16 wait-for-i18n-format-render' />
            )}
            <span className='text-robux-lg wait-for-i18n-format-render'>
              {userQualifiesForPremiumPrices && premiumPriceInRobux != null
                ? numberFormat.getNumberFormat(premiumPriceInRobux)
                : numberFormat.getNumberFormat(price)}
            </span>
          </div>
        </div>
        {renderPremiumPrice()}
      </div>
    </React.Fragment>
  );
}

PriceContainerText.propTypes = {
  translate: PropTypes.func.isRequired,
  price: PropTypes.number.isRequired,
  itemType: PropTypes.string.isRequired,
  itemDetailItemId: PropTypes.number.isRequired,
  premiumPriceInRobux: PropTypes.number.isRequired,
  premiumDiscountPercentage: PropTypes.number.isRequired,
  userQualifiesForPremiumPrices: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  isOwned: PropTypes.bool.isRequired,
  loadFailure: PropTypes.bool.isRequired,
  unitsAvailableForConsumption: PropTypes.number.isRequired,
  isLimited: PropTypes.bool.isRequired,
  isPlugin: PropTypes.bool.isRequired,
  resellerAvailable: PropTypes.bool.isRequired,
  priceStatus: PropTypes.string.isRequired,
  offSaleDeadline: PropTypes.string.isRequired,
  isMarketPlaceEnabled: PropTypes.bool.isRequired
};

export default withTranslations(PriceContainerText, translationConfig.itemModelResources);
