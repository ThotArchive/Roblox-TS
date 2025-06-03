import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { authenticatedUser } from 'header-scripts';
import { withTranslations } from 'react-utilities';
import { Button } from 'react-style-guide';
import batchLoadItemDetails from '../factories/batchLoadItemDetails';
import itemDetailsService from '../services/itemDetailsService';
import { BatchBuyItemsButton } from './BatchBuyItems';
import translationConfig from '../translation.config';

function PriceContainer({
  items,
  purchaseMetadata,
  onBuyButtonClick,
  systemFeedbackService,
  onConfirm,
  onCancel,
  onTransactionComplete,
  productSurface,
  displayPriceOnButton,
  translate,
  variant,
  size
}) {
  const [currentUserBalance, setCurrentUserBalance] = useState(undefined);

  const getCurrentUserBalance = () => {
    itemDetailsService
      .getCurrentUserBalance(authenticatedUser.id)
      .then(function handleResult(result) {
        setCurrentUserBalance(result.data.robux);
      })
      .catch(() => {
        setCurrentUserBalance(undefined);
      });
  };
  useEffect(() => {
    if (authenticatedUser.isAuthenticated) {
      getCurrentUserBalance();
    }
  }, []);

  const { itemDetails } = batchLoadItemDetails(items);

  return (
    <BatchBuyItemsButton
      currentUserBalance={currentUserBalance}
      items={items}
      itemDetails={itemDetails}
      purchaseMetadata={purchaseMetadata}
      systemFeedbackService={systemFeedbackService}
      onBuyButtonClick={onBuyButtonClick}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onTransactionComplete={onTransactionComplete}
      productSurface={productSurface}
      displayPriceOnButton={displayPriceOnButton}
      translate={translate}
      variant={variant}
      size={size}
    />
  );
}

PriceContainer.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  purchaseMetadata: PropTypes.instanceOf(Map).isRequired,
  onBuyButtonClick: PropTypes.func,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onTransactionComplete: PropTypes.func,
  systemFeedbackService: PropTypes.func.isRequired,
  productSurface: PropTypes.string,
  displayPriceOnButton: PropTypes.bool,
  translate: PropTypes.func.isRequired,
  variant: PropTypes.string,
  size: PropTypes.string
};

PriceContainer.defaultProps = {
  onBuyButtonClick: () => {},
  onConfirm: () => {},
  onCancel: () => {},
  onTransactionComplete: result => {},
  productSurface: 'SHOPPING_CART_WEB',
  displayPriceOnButton: false,
  variant: Button.variants.growth,
  size: Button.sizes.large
};

export default withTranslations(PriceContainer, translationConfig.purchasingResources);
