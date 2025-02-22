import React from 'react';
import { renderToString } from 'react-dom/server';
import { withTranslations } from 'react-utilities';
import PropTypes from 'prop-types';
import PriceLabel from './PriceLabel';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import translationConfig from '../translation.config';
import { getMetaData } from '../util/itemPurchaseUtil';

const { resources } = itemPurchaseConstants;

function BalanceAfterSaleText({ translate, expectedPrice, currentRobuxBalance }) {
  const currentBalance = currentRobuxBalance ?? getMetaData().userRobuxBalance;
  const balanceAfterSale = currentBalance - expectedPrice;
  if (!currentRobuxBalance) {
    return <span />;
  }
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(resources.balanceAfterMessage, {
          robuxBalance: renderToString(
            <PriceLabel {...{ price: balanceAfterSale, color: 'gray', useFreeText: false }} />
          )
        })
      }}
    />
  );
}
BalanceAfterSaleText.propTypes = {
  expectedPrice: PropTypes.number.isRequired,
  currentRobuxBalance: PropTypes.number,
  translate: PropTypes.func.isRequired
};

BalanceAfterSaleText.defaultProps = {
  currentRobuxBalance: undefined
};

export default withTranslations(BalanceAfterSaleText, translationConfig.purchasingResources);
