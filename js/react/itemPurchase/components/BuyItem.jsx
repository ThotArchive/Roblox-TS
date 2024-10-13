import React from 'react';
import PropTypes from 'prop-types';
import { Button, Loading } from 'react-style-guide';
import { GameLauncher } from 'Roblox';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize
} from 'roblox-thumbnails';
import { withTranslations } from 'react-utilities';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import createItemPurchase from '../factories/createItemPurchase';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import urlConstants from '../constants/urlConstants';
import translationConfig from '../translation.config';

const [ItemPurchase, itemPurchaseService] = createItemPurchase();
const { resources } = itemPurchaseConstants;
const { getPremiumConversionUrl } = urlConstants;
const openPluginStudio = itemId => {
  GameLauncher.openPluginInStudio(itemId);
};

function BuyItem({
  translate,
  productId,
  price,
  itemName,
  itemType,
  assetTypeDisplayName,
  sellerName,
  expectedSellerId,
  isPurchasable,
  isOwned,
  isPlugin,
  itemDetailItemId,
  loading,
  userQualifiesForPremiumPrices,
  premiumPriceInRobux,
  isAuthenticated,
  resellerAvailable,
  firstReseller,
  isMarketPlaceEnabled
}) {
  const shouldDisplayBuyButton = isMarketPlaceEnabled && (resellerAvailable || isPurchasable);
  const getButtonType = () => {
    if (price === 0) {
      return translate(resources.getAction);
    }
    return translate(resources.buyAction);
  };
  if (loading) {
    return <Loading />;
  }
  if (!isAuthenticated) {
    if (premiumPriceInRobux != null) {
      return (
        <Button
          id='upgrade-button'
          className='btn-fixed-width-lg btn-primary-lg'
          onClick={() => {
            paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
              paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
              false,
              paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
              paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
              paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_PREMIUM
            );
            window.open(getPremiumConversionUrl(itemDetailItemId, itemType));
          }}>
          {translate(resources.getPremiumAction)}
        </Button>
      );
    }
    return (
      <Button
        className='btn-fixed-width-lg btn-growth-lg PurchaseButton'
        onClick={() => {
          window.location = '/login';
        }}>
        {getButtonType()}
      </Button>
    );
  }

  const thumbnail = (
    <Thumbnail2d
      type={itemType === 'bundle' ? ThumbnailTypes.bundleThumbnail : ThumbnailTypes.assetThumbnail}
      size={DefaultThumbnailSize}
      targetId={itemDetailItemId}
      format={ThumbnailFormat.webp}
      altName={itemName}
    />
  );

  if (isPlugin && (isOwned || price === 0)) {
    return (
      <React.Fragment>
        <Button
          className='btn-fixed-width-lg btn-primary-lg InstallButton'
          onClick={() => {
            openPluginStudio(itemDetailItemId);
          }}>
          <span>{translate(resources.installAction)}</span>
        </Button>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Button
        className='btn-fixed-width-lg btn-growth-lg PurchaseButton'
        onClick={itemPurchaseService.start}
        isDisabled={!shouldDisplayBuyButton}>
        {getButtonType()}
      </Button>
      <ItemPurchase
        {...{
          productId,
          expectedPrice:
            userQualifiesForPremiumPrices && premiumPriceInRobux != null
              ? premiumPriceInRobux
              : price,
          thumbnail,
          assetTypeDisplayName,
          assetName: itemName,
          sellerName: firstReseller ? firstReseller.seller.name : sellerName,
          expectedSellerId: firstReseller ? firstReseller.seller.id : expectedSellerId,
          userAssetId: firstReseller ? firstReseller.userAssetId : 0,
          showSuccessBanner: true
        }}
      />
    </React.Fragment>
  );
}

BuyItem.propTypes = {
  translate: PropTypes.func.isRequired,
  productId: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
  itemName: PropTypes.string.isRequired,
  itemType: PropTypes.string.isRequired,
  assetTypeDisplayName: PropTypes.string.isRequired,
  sellerName: PropTypes.string.isRequired,
  expectedSellerId: PropTypes.number.isRequired,
  isPurchasable: PropTypes.bool.isRequired,
  isOwned: PropTypes.bool.isRequired,
  isPlugin: PropTypes.bool.isRequired,
  itemDetailItemId: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  userQualifiesForPremiumPrices: PropTypes.bool.isRequired,
  premiumPriceInRobux: PropTypes.number.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  resellerAvailable: PropTypes.bool.isRequired,
  firstReseller: PropTypes.shape({
    seller: {
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired
    },
    userAssetId: PropTypes.number.isRequired
  }).isRequired,
  isMarketPlaceEnabled: PropTypes.bool.isRequired
};

export default withTranslations(BuyItem, translationConfig.itemResources);
