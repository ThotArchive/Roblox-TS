import React, { useState, useEffect } from 'react';
import angular from 'angular';
import PropTypes from 'prop-types';
import { authenticatedUser } from 'header-scripts';
import { withTranslations } from 'react-utilities';
import { createSystemFeedback } from 'react-style-guide';
import { localStorageService } from 'core-roblox-utilities';
import navigationService from '../services/navigationService';
import NotificationStreamPopover from '../components/NotificationStreamPopover';
import SettingsPopover from '../components/SettingsPopover';
import BuyRobuxPopover from '../components/robux-popover/BuyRobuxPopover';
import UniverseSearchIcon from '../components/UniverseSearchIcon';
import navigationUtil from '../util/navigationUtil';
import AgeBracketDisplay from '../components/AgeBracketDisplay';
import useHeuristicCreditConversionModal from '../../../../../../Roblox.Payments.WebApp/Roblox.Payments.WebApp/ts/react/redeemGiftCard/hooks/useHeuristicCreditConversionModal';
import '../../../../../../Roblox.Payments.WebApp/Roblox.Payments.WebApp/css/redeemGiftCard/convertCredit.scss';
import { redeemTranslationConfig } from '../translation.config';
import layoutConstants from '../constants/layoutConstants';
import RobuxBadgeType from '../constants/robuxBadgeConstants';
import { getRobuxBadgeLocalStorage } from '../util/robuxBadgeUtil';

const { getAccountNotificationCount } = navigationUtil;
const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

function HeaderIconsGroup({ translate, toggleUniverseSearch }) {
  const { isAuthenticated, id: userId } = authenticatedUser;
  const [accountNotificationCount, setAccountNotificationCount] = useState(0);
  const [isGetCurrencyCallDone, setGetCurrencyCallDone] = useState(false);
  const [robuxAmount, setRobuxAmount] = useState(0);
  const [isEligibleForVng, setIsEligibleForVng] = useState(false);
  const [canAccessStream, setCanAccessStream] = useState(true);
  const [robuxBadgeType, setRobuxBadgeType] = useState(null);
  const [robuxError, setRobuxError] = useState('');
  const [creditDisplayConfig, setCreditDisplayConfig] = useState(
    layoutConstants.creditDisplayConfigVariants.control
  );
  const [creditAmount, setCreditAmount] = useState(null);
  const [currencyCode, setCurrencyCode] = useState(null);
  const [creditError, setCreditError] = useState('');
  // wait for experiment to load before loading Robux wallet icons
  const [isExperimentCallDone, setIsExperimentCallDone] = useState(false);
  // filler state variable, actual convertedRobuxAmount received when modal is opened.
  const [convertedRobuxAmount, setConvertedRobuxAmount] = useState(0);
  const [
    HeuristicCreditConversionModal,
    startCreditConversionFlow
  ] = useHeuristicCreditConversionModal({
    creditBalance: creditAmount,
    setCreditBalance: setCreditAmount,
    currencyCode,
    setCurrencyCode,
    convertedRobuxAmount,
    setConvertedRobuxAmount,
    systemFeedbackService,
    translate
  });
  const openConvertCreditModal = () => {
    startCreditConversionFlow();
  };

  const getUserCurrency = () => {
    if (isAuthenticated) {
      setGetCurrencyCallDone(false);
      // Set Robux amount
      navigationService
        .getUserCurrency(userId)
        .then(
          ({ data: usercurrencyData }) => {
            setRobuxAmount(usercurrencyData.robux);
          },
          () => {
            setRobuxError(translate(layoutConstants.economySystemOutageMessage));
          }
        )
        .finally(() => {
          setGetCurrencyCallDone(true);
        });
    }
  };
  const getVngMetadata = () => {
    if (isAuthenticated) {
      navigationService.getGuacBehavior().then(
        ({ data: guacData }) => {
          setIsEligibleForVng(guacData.shouldShowVng);
          setCanAccessStream(guacData.notificationsCanAccessStream);
        },
        () => {
          setRobuxError(translate(layoutConstants.economySystemOutageMessage));
        }
      );
    }
  };
  const getRobuxBadge = () => {
    if (isAuthenticated) {
      navigationService.getRobuxBadge().then(({ data: robuxBadgeData }) => {
        const shouldShowRobuxUpdateBadge =
          getRobuxBadgeLocalStorage(RobuxBadgeType.UPDATE) !== 'true';

        // interpret is_virtual_item_available as indicating we should
        // show the 'New Update' badge, overriding the virtual item badge in all cases.

        // const prevLocalVirtualItemStartTimeSeconds =
        //   getRobuxBadgeLocalStorage(RobuxBadgeType.VIRTUAL_ITEM) || -1;

        if (
          robuxBadgeData.is_virtual_item_available &&
          shouldShowRobuxUpdateBadge
          // prevLocalVirtualItemStartTimeSeconds <
          //   robuxBadgeData.active_virtual_item_start_time_seconds_utc
        ) {
          setRobuxBadgeType(RobuxBadgeType.UPDATE);
          // setRobuxBadgeType(RobuxBadgeType.VIRTUAL_ITEM);
        }
      });
    }
  };

  useEffect(() => {
    window.addEventListener(`navigation-update-user-currency`, event => {
      getUserCurrency();
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Set account notification count
      getAccountNotificationCount().then(setAccountNotificationCount);

      getUserCurrency();

      // Get vng metadata
      getVngMetadata();

      // Get Robux badge data
      getRobuxBadge();

      // Set credit amount
      navigationService
        .getCreditBalanceForNavigation()
        .then(
          ({ data: creditData }) => {
            if (
              creditData.creditDisplayConfig === null ||
              creditData.creditBalance === null ||
              creditData.currencyCode === null
            ) {
              // if user isn't enrolled in experiment, show control
              // if creditAmount and currencyCode null (for new users), don't show credit anywhere
              setCreditDisplayConfig(layoutConstants.creditDisplayConfigVariants.control);
            } else {
              setCreditDisplayConfig(
                creditData.creditDisplayConfig ??
                  layoutConstants.creditDisplayConfigVariants.control
              );
            }
            setCreditAmount(creditData.creditBalance);
            setCurrencyCode(creditData.currencyCode);
          },
          () => {
            setCreditError(translate(layoutConstants.economySystemOutageMessage));
          }
        )
        .finally(() => {
          setIsExperimentCallDone(true);
        });

      // Conditionally display account switched confirmation banner
      try {
        const accountSwitched = localStorageService.getLocalStorage(
          layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag
        );

        if (accountSwitched) {
          systemFeedbackService.success(
            translate(layoutConstants.accountSwitchConfirmationKeys.accountSwitchedMessage, {
              accountName: authenticatedUser.name
            }),
            0 /* show delay */,
            5000 /* banner duration */
          );
          localStorageService.removeLocalStorage(
            layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag
          );
        }
      } catch (err) {
        // no op
      }
    }
  }, [isAuthenticated, userId]);

  let notificationStream = (
    <li id='navbar-stream' className='navbar-icon-item navbar-stream'>
      <span className='nav-robux-icon rbx-menu-item'>
        <span id='notification-stream-icon-container' notification-stream-indicator='true' />
      </span>
    </li>
  );
  try {
    angular.module('notificationStreamIcon');
    angular.module('notificationStream');
    notificationStream = <NotificationStreamPopover />;
  } catch (err) {
    console.log(err);
  }

  return (
    <ul className='nav navbar-right rbx-navbar-icon-group'>
      <SystemFeedback />
      <AgeBracketDisplay />
      <UniverseSearchIcon translate={translate} toggleUniverseSearch={toggleUniverseSearch} />
      {canAccessStream && notificationStream}
      <BuyRobuxPopover
        translate={translate}
        robuxAmount={robuxAmount}
        robuxError={robuxError}
        creditAmount={creditAmount}
        currencyCode={currencyCode}
        creditError={creditError}
        creditDisplayConfig={creditDisplayConfig}
        isEligibleForVng={isEligibleForVng}
        isExperimentCallDone={isExperimentCallDone}
        isGetCurrencyCallDone={isGetCurrencyCallDone}
        openConvertCreditModal={openConvertCreditModal}
        robuxBadgeType={robuxBadgeType}
      />
      <SettingsPopover translate={translate} accountNotificationCount={accountNotificationCount} />
      <HeuristicCreditConversionModal />
    </ul>
  );
}

HeaderIconsGroup.propTypes = {
  translate: PropTypes.func.isRequired,
  toggleUniverseSearch: PropTypes.func.isRequired
};

export default withTranslations(HeaderIconsGroup, redeemTranslationConfig);
