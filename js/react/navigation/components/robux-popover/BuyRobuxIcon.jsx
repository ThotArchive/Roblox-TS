import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-style-guide';
import { abbreviateNumber } from 'core-utilities';
import ClassNames from 'classnames';
import layoutConstant from '../../constants/layoutConstants';
import RobuxBadgeType from '../../constants/robuxBadgeConstants';

function BuyRobuxIcon({
  robuxAmount,
  isGetCurrencyCallDone,
  robuxError,
  creditDisplayConfig,
  robuxBadgeType
}) {
  const robuxAmountValue = robuxError
    ? layoutConstant.robuxOnEconomySystemOutage
    : abbreviateNumber.getTruncValue(robuxAmount);

  // Robux value not shown for experiment variant hideRobuxAndCredit
  const robuxBadgeClass = ClassNames('notification-red robux-badge', {
    hidden: !robuxBadgeType
  });
  const icon = (
    <Fragment>
      <span className='icon-robux-28x28 roblox-popover-close' id='nav-robux' />
      {creditDisplayConfig !== layoutConstant.creditDisplayConfigVariants.hideCreditAndRobux && (
        <span className='rbx-text-navbar-right text-header' id='nav-robux-amount'>
          {isGetCurrencyCallDone && robuxAmountValue}
        </span>
      )}
    </Fragment>
  );

  return (
    <span id='nav-robux-icon' className='nav-robux-icon rbx-menu-item'>
      {robuxError ? (
        <Tooltip
          id='current-error'
          content={robuxError}
          placement='bottom'
          containerClassName='nav-buy-robux-icon-tooltip-container'>
          {icon}
        </Tooltip>
      ) : (
        icon
      )}
      <span className={robuxBadgeClass} />
    </span>
  );
}

BuyRobuxIcon.defaultProps = {
  robuxAmount: 0,
  robuxError: '',
  robuxBadgeType: null
};

BuyRobuxIcon.propTypes = {
  robuxAmount: PropTypes.number,
  robuxError: PropTypes.string,
  isGetCurrencyCallDone: PropTypes.bool.isRequired,
  creditDisplayConfig: PropTypes.string.isRequired,
  robuxBadgeType: PropTypes.oneOf(Object.values(RobuxBadgeType))
};

export default BuyRobuxIcon;
