import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { numberFormat } from 'core-utilities';
import { paymentFlowAnalyticsService, localStorageService } from 'core-roblox-utilities';
import { Link } from 'react-style-guide';
import { CurrentUser } from 'Roblox';
import links from '../../constants/linkConstants';
import layoutConstant from '../../constants/layoutConstants';
import navigationService from '../../services/navigationService';

const { buyRobuxUrl, redeemUrl, buyGiftCardUrl } = links;

const conversionMetadataCache = new Map();
const expValueCache = new Map();

function RobuxMenu({
  creditAmount,
  creditDisplayConfig,
  creditError,
  currencyCode,
  isEligibleForVng,
  robuxAmount,
  robuxError,
  openConvertCreditModal,
  onBuyGiftCardClick,
  onBuyRobuxExternalClick,
  showRobuxBadge,
  translate
}) {
  const [isWalletDisplayed, setIsWalletDisplayed] = useState(true);
  const [isConvertCreditDisplayed, setIsConvertCreditDisplayed] = useState(false);
  const [isBuyGiftCardDisplayed, setIsBuyGiftCardDisplayed] = useState(false);

  const robuxAmountValue = robuxError
    ? layoutConstant.robuxOnEconomySystemOutage
    : numberFormat.getNumberFormat(robuxAmount);

  const sendViewMessageEvent = viewMessage => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.NAVIGATION_DROPDOWN_MENU,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage
    );
  };

  const onBuyRobuxClicked = () => {
    sendViewMessageEvent(paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX);
    // Set local storage to hide robux badge for current virtual item when badge is acknowledged.
    if (showRobuxBadge) {
      const currentEpochSeconds = Math.floor(Date.now() / 1000);
      localStorageService.setLocalStorage(
        `prevLocalVirtualItemStartTimeSeconds${CurrentUser.userId}`,
        currentEpochSeconds
      );
    }
  };

  useEffect(() => {
    // if none of creditAmount or robuxAmount is truncated, then don't display wallet balance
    // must display wallet if variant hideCreditAndRobux
    if (
      robuxAmount < layoutConstant.truncateThreshold.robuxTruncateThreshold &&
      creditAmount < layoutConstant.truncateThreshold.creditTruncateThreshold &&
      creditDisplayConfig !== layoutConstant.creditDisplayConfigVariants.hideCreditAndRobux
    ) {
      setIsWalletDisplayed(false);
    }
  }, [robuxAmount, creditAmount, creditDisplayConfig]);

  useEffect(() => {
    // Render PriceTag component
    window.dispatchEvent(
      new CustomEvent('price-tag:render', {
        detail: {
          targetSelector: '.dropdown-credit-balance'
        }
      })
    );
  }, [creditDisplayConfig]);

  useEffect(() => {
    // no conversion available if credit = 0
    if (creditAmount === 0) {
      setIsConvertCreditDisplayed(false);
    } else if (conversionMetadataCache.has(creditAmount)) {
      // cache the conversion metadata for credit amount
      setIsConvertCreditDisplayed(conversionMetadataCache.get(creditAmount));
    } else {
      navigationService.getConversionMetadata().then(({ data: conversionData }) => {
        if (conversionData.robuxConversionAmount > 0) {
          conversionMetadataCache.set(creditAmount, true);
          setIsConvertCreditDisplayed(true);
        } else {
          conversionMetadataCache.set(creditAmount, false);
          setIsConvertCreditDisplayed(false);
        }
      });
    }
  }, [creditAmount]);

  useEffect(() => {
    if (expValueCache.has(buyGiftCardUrl.cacheKey)) {
      setIsBuyGiftCardDisplayed(expValueCache.get(buyGiftCardUrl.cacheKey));
    } else {
      navigationService.getGiftCardVisibility().then(({ data: expData }) => {
        setIsBuyGiftCardDisplayed(expData.displayBuyGiftCardOption);
        expValueCache.set(buyGiftCardUrl.cacheKey, expData.displayBuyGiftCardOption);
      });
    }
  }, []);

  return (
    <Fragment>
      <div className={isWalletDisplayed ? '' : 'wallet-hidden'}>
        <li className='dropdown-wallet'>
          <Link className='dropdown-wallet-section'>
            <span className='icon-robux-28x28' id='nav-robux' />
            <span id='nav-robux-balance'>{robuxAmountValue}</span>
          </Link>
        </li>
        {/* credit balance not displayed in control variant */}
        {creditDisplayConfig !== layoutConstant.creditDisplayConfigVariants.control && (
          <li className='dropdown-wallet'>
            <Link className='dropdown-wallet-section'>
              <span className='icon-menu-wallet' />
              {!creditError ? (
                <span
                  className='dropdown-credit-balance'
                  data-amount={creditAmount}
                  data-currency-code={currencyCode}
                />
              ) : (
                layoutConstant.robuxOnEconomySystemOutage
              )}
            </Link>
          </li>
        )}
        <li className='rbx-divider' />
      </div>
      {isEligibleForVng ? (
        <li>
          <button type='button' cssClasses='rbx-menu-item' onClick={onBuyRobuxExternalClick}>
            {translate(buyRobuxUrl.buyRobux.label)}
          </button>
        </li>
      ) : (
        <li className='rbx-menu-item-container'>
          <Link
            cssClasses='rbx-menu-item buy-robux-button'
            url={buyRobuxUrl.buyRobux.url}
            onClick={onBuyRobuxClicked}>
            <span className='buy-robux-link-container'>
              {translate(buyRobuxUrl.buyRobux.label)}
              {showRobuxBadge && (
                <div className='new-item-pill small'>
                  <span className='new-item-pill-text'>{translate('Labels.NewItem')}</span>
                </div>
              )}
            </span>
          </Link>
        </li>
      )}

      {isBuyGiftCardDisplayed && (
        <li>
          <button type='button' cssClasses='rbx-menu-item' onClick={onBuyGiftCardClick}>
            {translate(buyGiftCardUrl.label) || 'Buy Gift Card'}
          </button>
        </li>
      )}

      <li>
        <Link cssClasses='rbx-menu-item' url={buyRobuxUrl.myTransactions.url}>
          {translate(buyRobuxUrl.myTransactions.label)}
        </Link>
      </li>

      <li>
        <Link cssClasses='rbx-menu-item' url={redeemUrl.url}>
          {translate(redeemUrl.label)}
        </Link>
      </li>

      {creditDisplayConfig !== layoutConstant.creditDisplayConfigVariants.control &&
        isConvertCreditDisplayed && (
          <li>
            <Link cssClasses='rbx-menu-item' onClick={openConvertCreditModal}>
              {translate('Label.ConvertCreditSuccess')}
            </Link>
          </li>
        )}
    </Fragment>
  );
}

RobuxMenu.defaultProps = {
  isEligibleForVng: false,
  robuxAmount: 0,
  robuxError: '',
  creditAmount: 0,
  currencyCode: '',
  creditError: '',
  showRobuxBadge: false
};

RobuxMenu.propTypes = {
  isEligibleForVng: PropTypes.bool,
  translate: PropTypes.func.isRequired,
  robuxAmount: PropTypes.number,
  robuxError: PropTypes.string,
  creditAmount: PropTypes.number,
  currencyCode: PropTypes.string,
  creditError: PropTypes.string,
  showRobuxBadge: PropTypes.bool,
  creditDisplayConfig: PropTypes.string.isRequired,
  openConvertCreditModal: PropTypes.func.isRequired,
  onBuyGiftCardClick: PropTypes.func.isRequired,
  onBuyRobuxExternalClick: PropTypes.func.isRequired
};

export default RobuxMenu;
