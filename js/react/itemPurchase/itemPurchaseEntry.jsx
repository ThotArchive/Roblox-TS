import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import createTransactionFailureModal from './factories/createTransactionFailureModal';
import createInsufficientFundsModal from './factories/createInsufficientFundsModal';
import createPriceChangedModal from './factories/createPriceChangedModal';
import createPurchaseVerificationModal from './factories/createPurchaseVerificationModal';
import createPurchaseConfirmationModal from './factories/createPurchaseConfirmationModal';
import createItemPurchase from './factories/createItemPurchase';
import itemPurchaseConstants from './constants/itemPurchaseConstants';
import { getMetaData } from './util/itemPurchaseUtil';
import BalanceAfterSaleText from './components/BalanceAfterSaleText';
import PriceLabel from './components/PriceLabel';
import AssetName from './components/AssetName';
import '../../../css/itemPurchase/itemPurchase.scss';
import PriceContainer from './components/PriceContainer';
import TransactionVerb from '../../../ts/react/enums/TransactionVerb';
import BatchBuyPriceContainer from './components/BatchBuyPriceContainer';

const { errorTypeIds } = itemPurchaseConstants;
const purchasebuttonId = 'display-price-container';

window.RobloxItemPurchase = {
  createTransactionFailureModal,
  createInsufficientFundsModal,
  createPriceChangedModal,
  createPurchaseVerificationModal,
  createPurchaseConfirmationModal,
  createItemPurchase,
  errorTypeIds,
  getMetaData,
  BalanceAfterSaleText,
  PriceLabel,
  AssetName,
  TransactionVerb,
  BatchBuyPriceContainer
};

ready(() => {
  const buyButtoncontainerElement = document.getElementById(purchasebuttonId);
  if (buyButtoncontainerElement) {
    render(<PriceContainer />, buyButtoncontainerElement);
  }
});
