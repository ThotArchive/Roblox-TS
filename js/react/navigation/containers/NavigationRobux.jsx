import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-style-guide';
import { paymentFlowAnalyticsService as analytics } from 'core-roblox-utilities';
import { withTranslations } from 'react-utilities';
import { authenticatedUser } from 'header-scripts';
import links from '../constants/linkConstants';
import { translationConfig } from '../translation.config';
import navigationService from '../services/navigationService';
import LeaveRobloxPopupDisclaimer from '../components/robux-popover/LeaveRobloxPopupDisclaimer';

function NavigationRobux({ translate }) {
  const { buyRobuxUrl } = links;
  const { buyRobux, buyRobuxOnVng } = buyRobuxUrl;
  const { isAuthenticated } = authenticatedUser;
  const {
    ENUM_TRIGGERING_CONTEXT,
    ENUM_VIEW_NAME,
    ENUM_VIEW_MESSAGE,
    ENUM_PURCHASE_EVENT_TYPE
  } = analytics;

  const [isEligibleForVng, setIsEligibleForVng] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const cacheRef = useRef(new Map());

  const sendAnalyticsEvent = viewMessage => {
    analytics.sendUserPurchaseFlowEvent(
      ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      ENUM_VIEW_NAME.NAVIGATION_ROBUX_TEXT,
      ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage
    );
  };

  useEffect(() => {
    const cache = cacheRef.current;
    const { cacheKey } = buyRobuxOnVng;

    if (cache.has(cacheKey)) {
      setIsEligibleForVng(cache.get(cacheKey));
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    navigationService.getGuacBehavior().then(({ data: guacMetadata }) => {
      const { shouldShowVng } = guacMetadata;

      setIsEligibleForVng(shouldShowVng);
      cache.set(cacheKey, shouldShowVng);
    });
  }, [buyRobuxOnVng, buyRobuxOnVng.cacheKey, isAuthenticated]);

  const onBuyRobuxClick = () => sendAnalyticsEvent(ENUM_VIEW_MESSAGE.BUY_ROBUX);

  const onBuyRobuxExternalClick = () => {
    sendAnalyticsEvent(ENUM_VIEW_MESSAGE.EXTERNAL_LINK_MODAL);

    setIsPopupOpen(true);
  };

  const onBuyRobuxExternalCancel = () => {
    setIsPopupOpen(false);
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

    setIsPopupOpen(false);
  };

  return (
    <div>
      {isEligibleForVng ? (
        <React.Fragment>
          <LeaveRobloxPopupDisclaimer
            isOpen={isPopupOpen}
            onClose={onBuyRobuxExternalCancel}
            onContinue={onBuyRobuxExternalContinue}
          />
          <Link
            cssClasses='font-header-2 nav-menu-title text-header robux-menu-btn'
            onClick={onBuyRobuxExternalClick}>
            {translate(buyRobux.name)}
          </Link>
        </React.Fragment>
      ) : (
        <Link
          cssClasses='font-header-2 nav-menu-title text-header robux-menu-btn'
          url={buyRobux.url}
          onClick={onBuyRobuxClick}>
          {translate(buyRobux.name)}
        </Link>
      )}
    </div>
  );
}

NavigationRobux.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(NavigationRobux, translationConfig);
