import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Popover } from 'react-style-guide';
import { paymentFlowAnalyticsService as analytics } from 'core-roblox-utilities';
import BuyRobuxIcon from './BuyRobuxIcon';
import RobuxMenu from './RobuxMenu';
import navigationUtil from '../../util/navigationUtil';
import CreditIcon from '../CreditIcon';
import links from '../../constants/linkConstants';
import layoutConstants from '../../constants/layoutConstants';
import PopupDisclaimer from './PopupDisclaimer';
import LeaveRobloxPopupDisclaimer from './LeaveRobloxPopupDisclaimer';
import navigationService from '../../services/navigationService';

function BuyRobuxPopover({
  creditAmount,
  creditDisplayConfig,
  creditError,
  currencyCode,
  isEligibleForVng,
  isExperimentCallDone,
  isGetCurrencyCallDone,
  openConvertCreditModal,
  robuxAmount,
  robuxError,
  translate
}) {
  const { buyGiftCardUrl, buyRobuxUrl } = links;
  const { buyRobuxOnVng } = buyRobuxUrl;
  const {
    ENUM_TRIGGERING_CONTEXT,
    ENUM_VIEW_NAME,
    ENUM_VIEW_MESSAGE,
    ENUM_PURCHASE_EVENT_TYPE
  } = analytics;
  const containerRef = useRef();

  // buy gift card experiment pop up a disclaimer before redirecting
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  // vng buy robux pop up a disclaimer before redirecting
  const [isLeaveRobloxDisclaimerModalOpen, setIsLeaveRobloxDisclaimerModalOpen] = useState(false);

  const sendAnalyticsEvent = viewMessage => {
    analytics.sendUserPurchaseFlowEvent(
      ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      ENUM_VIEW_NAME.NAVIGATION_DROPDOWN_MENU,
      ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage
    );
  };

  const onBuyGiftCardClick = () => {
    sendAnalyticsEvent(ENUM_VIEW_MESSAGE.BUY_GIFT_CARD);

    setIsShopModalOpen(true);
  };

  const closeShopModal = () => {
    setIsShopModalOpen(false);
  };

  const onModalContinue = () => {
    sendAnalyticsEvent(ENUM_VIEW_MESSAGE.CONTINUE_TO_CASHSTAR);

    const decodedUrl = decodeURIComponent(buyGiftCardUrl.url);
    window.open(decodedUrl, '_blank');
  };

  const onBuyRobuxExternalClick = () => {
    sendAnalyticsEvent(ENUM_VIEW_MESSAGE.EXTERNAL_LINK_MODAL);

    setIsLeaveRobloxDisclaimerModalOpen(true);
  };

  const onBuyRobuxExternalClose = () => {
    setIsLeaveRobloxDisclaimerModalOpen(false);
  };

  const onBuyRobuxExternalContinue = () => {
    sendAnalyticsEvent(ENUM_VIEW_MESSAGE.CONTINUE_TO_VNG);

    navigationService.getVngShopSignedRedirectionUrl().then(
      ({ data: { vngShopRedirectUrl } }) => {
        window.open(vngShopRedirectUrl || buyRobuxOnVng.url, '_blank').focus();
      },
      () => {
        window.open(buyRobuxOnVng.url, '_blank').focus();
      }
    );

    setIsLeaveRobloxDisclaimerModalOpen(false);
  };

  // Wallet credit balance only shown on showCreditAndRobux variant
  return (
    <li
      id='navbar-robux'
      ref={containerRef}
      className={classNames('navbar-icon-item', {
        'robux-popover-margins':
          creditDisplayConfig === layoutConstants.creditDisplayConfigVariants.hideCreditAndRobux
      })}>
      <PopupDisclaimer
        {...{
          isShopModalOpen,
          closeShopModal,
          onModalContinue
        }}
      />
      {isEligibleForVng && (
        <LeaveRobloxPopupDisclaimer
          isOpen={isLeaveRobloxDisclaimerModalOpen}
          onClose={onBuyRobuxExternalClose}
          onContinue={onBuyRobuxExternalContinue}
        />
      )}
      {isExperimentCallDone && (
        <Popover
          id='buy-robux-popover'
          trigger='click'
          placement='bottom'
          button={
            <button type='button' className='btn-navigation-nav-robux-md'>
              <BuyRobuxIcon
                {...{ robuxAmount, isGetCurrencyCallDone, robuxError, creditDisplayConfig }}
              />
              {/* Wallet credit balance only shown on showCreditAndRobux variant */}
              {creditDisplayConfig ===
                layoutConstants.creditDisplayConfigVariants.showCreditAndRobux && (
                <CreditIcon {...{ creditAmount, currencyCode, creditError }} />
              )}
            </button>
          }
          role='menu'
          container={containerRef.current}>
          <div className={navigationUtil.getThemeClass()}>
            <ul id='buy-robux-popover-menu' className='dropdown-menu'>
              <RobuxMenu
                {...{
                  isEligibleForVng,
                  translate,
                  robuxAmount,
                  robuxError,
                  creditAmount,
                  currencyCode,
                  creditError,
                  creditDisplayConfig,
                  openConvertCreditModal,
                  onBuyGiftCardClick,
                  onBuyRobuxExternalClick
                }}
              />
            </ul>
          </div>
        </Popover>
      )}
    </li>
  );
}

BuyRobuxPopover.defaultProps = {
  robuxAmount: 0,
  robuxError: '',
  creditAmount: 0,
  creditError: '',
  currencyCode: 'USD',
  creditDisplayConfig: layoutConstants.creditDisplayConfigVariants.control,
  isExperimentCallDone: false,
  isEligibleForVng: false
};

BuyRobuxPopover.propTypes = {
  translate: PropTypes.func.isRequired,
  robuxAmount: PropTypes.number,
  robuxError: PropTypes.string,
  isGetCurrencyCallDone: PropTypes.bool.isRequired,
  creditAmount: PropTypes.number,
  currencyCode: PropTypes.string,
  creditError: PropTypes.string,
  creditDisplayConfig: PropTypes.string,
  isExperimentCallDone: PropTypes.bool,
  openConvertCreditModal: PropTypes.func.isRequired,
  isEligibleForVng: PropTypes.bool
};

export default BuyRobuxPopover;
