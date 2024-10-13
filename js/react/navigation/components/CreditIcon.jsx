import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-style-guide';
import layoutConstants from '../constants/layoutConstants';

function CreditIcon({ creditAmount, currencyCode, creditError }) {
  const icon = (
    <Fragment>
      <span className='icon-menu-wallet roblox-popover-close' id='nav-credit-icon' />
      <span className='rbx-text-navbar-right text-header' id='nav-robux-amount'>
        {!creditError ? (
          <div
            className='credit-balance'
            data-amount={creditAmount}
            data-currency-code={currencyCode}
          />
        ) : (
          <div className='nav-credit-text'>{layoutConstants.robuxOnEconomySystemOutage}</div>
        )}
      </span>
    </Fragment>
  );

  useEffect(() => {
    // Render PriceTag component
    window.dispatchEvent(
      new CustomEvent('price-tag:render', {
        detail: {
          targetSelector: '.credit-balance',
          tagClassName: 'navbar-compact nav-credit-text'
        }
      })
    );
  }, [creditAmount, currencyCode]);

  return (
    <Fragment>
      <span id='nav-robux-icon' className='nav-robux-icon rbx-menu-item nav-credit'>
        {icon}
      </span>
    </Fragment>
  );
}

CreditIcon.defaultProps = {
  creditAmount: 0,
  creditError: '',
  currencyCode: 'USD'
};

CreditIcon.propTypes = {
  creditAmount: PropTypes.number,
  creditError: PropTypes.string,
  currencyCode: PropTypes.string
};

export default CreditIcon;
