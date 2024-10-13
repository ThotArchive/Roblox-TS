import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { fireEvent } from 'roblox-event-tracker';
import { TPriceTagProps } from '../constants/typeDefinitions';
import {
  ARABIC_LOCALE,
  COUNTERS,
  DEFAULT_LOCALE,
  MINUS_SIGN,
  NOTATION_COMPACT_APPLY_THRESHOLD,
  NOTATION_CURRENCY_CODE_EXCLUDE_LIST
} from '../constants/priceTagConstants';

function getLocale() {
  const systemLocale = Intl.NumberFormat().resolvedOptions().locale;
  if (systemLocale.startsWith(ARABIC_LOCALE)) {
    // we are not supporting Arabic very well on the other parts of the website,
    // it would be weird only the price is the one using Arabic, also it is not left aligned
    fireEvent(COUNTERS.ARABIC_LOCALE_TRIGGERED);
    return systemLocale.replace(ARABIC_LOCALE, DEFAULT_LOCALE);
  }
  return systemLocale;
}

function PriceTag({ amount, currencyCode, tagClassName }: TPriceTagProps): JSX.Element {
  const isNegative = amount < 0;
  const amountAbs = Math.abs(amount);
  let formattedAmount = `${amountAbs}${currencyCode}`;
  const className = classnames('price-tag', tagClassName);
  try {
    // Intl can throw errors if the locale is not recognizable
    const locale = getLocale();
    const formatOptions: Record<string, unknown> = {
      style: 'currency',
      currency: currencyCode,
      notation: 'standard'
    };
    if (
      amountAbs >= NOTATION_COMPACT_APPLY_THRESHOLD &&
      !NOTATION_CURRENCY_CODE_EXCLUDE_LIST.includes(currencyCode)
    ) {
      formatOptions.minimumFractionDigits = 0;
      formatOptions.maximumFractionDigits = 2;
      formatOptions.maximumSignificantDigits = 21;
      formatOptions.notation = 'compact';
    }
    formattedAmount = Intl.NumberFormat(locale, formatOptions as Intl.NumberFormatOptions).format(
      amountAbs
    );
  } catch (e) {
    fireEvent(COUNTERS.NUMBER_FORMAT_LOCALE_EXCEPTION);
  }
  return (
    <div className='d-flex-inline gap-1 justify-content-start align-items-center'>
      {isNegative && <span className={className}>{MINUS_SIGN}</span>}
      <span className={className}>{formattedAmount}</span>
    </div>
  );
}

PriceTag.propTypes = {
  amount: PropTypes.number.isRequired,
  currencyCode: PropTypes.string.isRequired
};

export default PriceTag;
