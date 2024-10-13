import React from 'react';
import PropTypes from 'prop-types';
import { authenticatedUser } from 'header-scripts';
import loadItemDetails from '../factories/loadItemDetails';
import itemDetailsService from '../services/itemDetailsService';
import itemDetailData from '../util/itemDetailData';
import BuyItem from './BuyItem';
import PriceContainerText from './PriceContainerText';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import Timer from './Timer';
import OwnedItemButton from './OwnedItemButton';

const { getCurrentitemDetail } = itemDetailData;
const { assetTypes } = itemPurchaseConstants;

function PriceContainer({ translate }) {
  const { itemDetailItemId, itemDetailItemType } = getCurrentitemDetail();
  const { itemDetail } = loadItemDetails(
    itemDetailsService.getItemDetails,
    itemDetailItemId,
    itemDetailItemType
  );

  const renderPurchaseButton = () => {
    if (
      itemDetail.owned &&
      (!itemDetail.isLimited || itemDetail.unitsAvailableForConsumption > 0)
    ) {
      return (
        <div className='action-button'>
          <OwnedItemButton
            {...{
              translate,
              assetType: itemDetail.assetType
            }}
          />
        </div>
      );
    }
    return (
      <div className='action-button'>
        <BuyItem
          {...{
            translate,
            productId: itemDetail.productId,
            price: itemDetail.price,
            itemType: itemDetail.itemType,
            assetTypeDisplayName: itemDetail.assetTypeDisplayName,
            itemName: itemDetail.name,
            sellerName: itemDetail.creatorName,
            expectedSellerId: itemDetail.expectedSellerId,
            isPurchasable: itemDetail.isPurchasable,
            isOwned: itemDetail.owned,
            isInstallable: itemDetail.assetType === assetTypes.Plugin,
            itemDetailItemId,
            loading: itemDetail.loading,
            hasLimitedPrivateSales: itemDetail.hasLimitedPrivateSales,
            userQualifiesForPremiumPrices: authenticatedUser.isPremiumUser,
            premiumPriceInRobux: itemDetail.premiumPriceInRobux,
            isAuthenticated: authenticatedUser.isAuthenticated,
            unitsAvailableForConsumption: itemDetail.unitsAvailableForConsumption,
            isLimited: itemDetail.isLimited,
            resellerAvailable: itemDetail.resellerAvailable,
            firstReseller: itemDetail.firstReseller,
            isMarketPlaceEnabled: itemDetail.isMarketPlaceEnabled
          }}
        />
        {itemDetail.offSaleDeadline !== null && (
          <Timer {...{ translate, offSaleDeadline: itemDetail.offSaleDeadline }} />
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <PriceContainerText
        {...{
          translate,
          price: itemDetail.price,
          itemType: itemDetail.itemType,
          itemDetailItemId,
          premiumPriceInRobux: itemDetail.premiumPriceInRobux,
          premiumDiscountPercentage: itemDetail.premiumDiscountPercentage,
          userQualifiesForPremiumPrices: authenticatedUser.isPremiumUser,
          isOwned: itemDetail.owned,
          loading: itemDetail.loading,
          loadFailure: itemDetail.loadFailure,
          unitsAvailableForConsumption: itemDetail.unitsAvailableForConsumption,
          isLimited: itemDetail.isLimited,
          isPlugin: itemDetail.assetType === assetTypes.Plugin,
          resellerAvailable: itemDetail.resellerAvailable,
          priceStatus: itemDetail.priceStatus,
          offSaleDeadline: itemDetail.offSaleDeadline,
          isMarketPlaceEnabled: itemDetail.isMarketPlaceEnabled
        }}
      />
      {!itemDetail.loadFailure && renderPurchaseButton()}
    </React.Fragment>
  );
}

PriceContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default PriceContainer;
