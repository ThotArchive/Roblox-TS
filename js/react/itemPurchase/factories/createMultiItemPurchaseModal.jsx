/* eslint-disable react/jsx-no-literals */
// Just for line 49 using '+' for thumbnails representing more than the 3 item thumbnail limit
import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { withTranslations } from 'react-utilities';
import { createModal } from 'react-style-guide';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize
} from 'roblox-thumbnails';
import { CurrentUser } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import { uuidService } from 'core-utilities';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';
import itemPurchaseService from '../services/itemPurchaseService';
import ItemType from '../../../../ts/react/enums/ItemType';
import BatchBuyPurchaseResults from '../../../../ts/react/enums/BatchBuyPurchaseResults';
import TwoStepVerificationModal from '../components/TwoStepVerificationModal';

const {
  resources,
  batchBuyMaxThumbnails,
  batchBuyPurchaseResults,
  floodcheckTime
} = itemPurchaseConstants;

function ItemThumbnail({ itemsCount, item, index }) {
  const itemName = item.name;

  const hasMoreItems = itemsCount > batchBuyMaxThumbnails;
  const moreItemsCount = itemsCount - batchBuyMaxThumbnails;
  const shouldShowOverlay = hasMoreItems && index === batchBuyMaxThumbnails - 1;

  return (
    <div className='modal-multi-item-image-container'>
      <Thumbnail2d
        type={
          item.itemType.toLowerCase() === ItemType.Bundle
            ? ThumbnailTypes.bundleThumbnail
            : ThumbnailTypes.assetThumbnail
        }
        size={DefaultThumbnailSize}
        targetId={item.id}
        containerClass='batch-buy-thumbnail'
        format={ThumbnailFormat.webp}
        altName={itemName}
      />

      {shouldShowOverlay && (
        <div className='thumb-overlay'>
          <div className='font-header-1'>＋{moreItemsCount}</div>
        </div>
      )}
    </div>
  );
}

export function handleResultFromPurchases(result, startTwoStepVerification) {
  // Error handling using systemFeedbackService returns the errors for handling within the feature itself
  let successCount = 0;
  const errorResults = [];

  if (result.status === 200) {
    result.data.fulfillmentGroups[0].lineItems.forEach(itemResult => {
      if (itemResult.status === 'SUCCEEDED') {
        successCount += 1;
      } else {
        const error = errorResults.find(err => {
          return err.error === itemResult.errorReason;
        });

        if (error) {
          error.count += 1;
        } else {
          errorResults.push({ error: itemResult.errorReason, count: 1 });
        }
      }
    });

    if (successCount === result.data.fulfillmentGroups[0].lineItems.length) {
      return { success: true, message: resources.purchaseCompleteHeading };
    }
    let predominantError = { error: '', count: 0 };
    errorResults.forEach(err => {
      if (err.count > predominantError.count) {
        predominantError = err;
      }
    });

    // Partial success, partial failure error messages
    if (successCount > 0) {
      switch (predominantError.error) {
        case BatchBuyPurchaseResults.AlreadyOwned:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessItemsOwnedFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.InsufficientFunds:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessInsufficientFundsFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.ExceptionOccured:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessNetworkErrorFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.TooManyPurchases:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessFloodcheckFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.PremiumNeeded:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessPremiumNeededFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.NoSellers:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessNoSellersFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.InExperienceOnly:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessInExperienceOnlyFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        default:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessGeneralFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
      }
    } else {
      // All purchases failed
      switch (predominantError.error) {
        case BatchBuyPurchaseResults.AlreadyOwned:
          return { success: false, message: resources.batchBuyItemsOwnedFailureMessage };
        case BatchBuyPurchaseResults.InsufficientFunds:
          return { success: false, message: resources.insufficientFundsFailureMessage };
        case BatchBuyPurchaseResults.ExceptionOccured:
          return { success: false, message: resources.networkErrroFailureMessage };
        case BatchBuyPurchaseResults.TooManyPurchases:
          return {
            success: false,
            message: resources.floodcheckFailureMessage,
            params: { throttleTime: floodcheckTime }
          };
        case BatchBuyPurchaseResults.PremiumNeeded:
          return { success: false, message: resources.premiumNeededFailureMessage };
        case BatchBuyPurchaseResults.NoSellers:
          return { success: false, message: resources.noSellersFailureMessage };
        case BatchBuyPurchaseResults.InExperienceOnly:
          return { success: false, message: resources.inExperienceOnlyFailureMessage };
        default:
          return { success: false, message: resources.purchaseErrorFailureMessage };
      }
    }
  } else if (result.status === 403 && result.data.message.includes('2sv')) {
    startTwoStepVerification();
  } else if (result.status === 400 && result.data.message.includes('InsufficientTotalBalance')) {
    return { success: false, message: resources.insufficientFundsFailureMessage };
  }

  return { success: false, message: resources.purchaseErrorFailureMessage };
}

export default function createMultiItemPurchaseModal() {
  const [Modal, modalService] = createModal();
  function MultiItemPurchaseModal({
    translate,
    title,
    expectedTotalPrice,
    itemDetails,
    currentRobuxBalance,
    onCancel,
    onTransactionComplete,
    onAction,
    loading,
    productSurface,
    systemFeedbackService
  }) {
    let defaultTitle;
    let actionButtonText;

    const [isTwoStepVerificationActive, setIsTwoStepVerificationActive] = useState(false);
    const startTwoStepVerification = () => {
      systemFeedbackService.loading(translate('Message.TwoStepVerificationBatchPurchase'));
      setIsTwoStepVerificationActive(true);
    };
    const stopTwoStepVerification = () => setIsTwoStepVerificationActive(false);
    const [hasTwoStepVerificationBeenCompleted, setHasTwoStepVerificationBeenCompleted] = useState(
      false
    );

    const assetInfo = {
      itemCount: itemDetails.length,
      robux: renderToString(
        <span className='robux-price'>
          <PriceLabel {...{ price: expectedTotalPrice }} />
        </span>
      )
    };
    const bodyMessageResource = resources.batchBuyPromptMessage;

    if (expectedTotalPrice === 0) {
      defaultTitle = translate(resources.getItemHeading);
      actionButtonText = translate(resources.getNowAction);
    } else {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyNowAction);
    }

    const itemsSlice = itemDetails?.slice(0, batchBuyMaxThumbnails);

    async function purchaseItem(item) {
      const params = {
        expectedPrice:
          item.premiumPriceInRobux && authenticatedUser.isPremiumUser
            ? item.premiumPriceInRobux
            : item.price,
        expectedSellerId: item.firstReseller ? item.firstReseller.seller.id : undefined,
        // For resellers
        userAssetId: item.firstReseller ? item.firstReseller.userAssetId : undefined
      };
      let result;
      try {
        result = await itemPurchaseService.purchaseItem(item.productId, params);
        result.data.itemData = {
          assetId: item.itemType.toLowerCase() === ItemType.Asset ? item.id : undefined,
          bundleId: item.itemType.toLowerCase() === ItemType.Bundle ? item.id : undefined
        };
      } catch (e) {
        result = {
          data: {
            itemData: {
              assetId: item.itemType.toLowerCase() === ItemType.Asset ? item.id : undefined,
              bundleId: item.itemType.toLowerCase() === ItemType.Bundle ? item.id : undefined
            },
            reason: BatchBuyPurchaseResults.CaughtError
          }
        };
      }
      return result;
    }

    const purchaseCollectibleItem = async item => {
      const { collectibleItemDetails } = item;
      const purchaseFromCreator =
        !item.itemRestrictions.includes('Collectible') ||
        (collectibleItemDetails.unitsAvailableForConsumption > 0 &&
          (!collectibleItemDetails.hasResellers ||
            collectibleItemDetails.price < collectibleItemDetails.lowestResalePrice));
      const price = collectibleItemDetails.lowestPrice;
      const params = {
        collectibleItemId: item.collectibleItemId,
        expectedCurrency: 1,
        expectedPrice: price,
        expectedPurchaserId: CurrentUser.userId,
        expectedPurchaserType: 'User',
        idempotencyKey: uuidService.generateRandomUuid()
      };
      if (!purchaseFromCreator && collectibleItemDetails.lowestAvailableResaleItemInstanceId) {
        params.collectibleItemInstanceId =
          collectibleItemDetails.lowestAvailableResaleItemInstanceId;
      }
      if (!purchaseFromCreator && collectibleItemDetails.lowestAvailableResaleProductId) {
        params.collectibleProductId = collectibleItemDetails.lowestAvailableResaleProductId;
      } else {
        params.collectibleProductId = collectibleItemDetails.collectibleProductId;
      }

      const serviceHandler = purchaseFromCreator
        ? itemPurchaseService.purchaseCollectibleItem
        : itemPurchaseService.purchaseCollectibleItemInstance;

      let result = { data: {} };
      try {
        const response = await serviceHandler(item.collectibleItemId, params);
        const { data } = response;
        const { transactionVerb } = data;
        result.data.itemData = {
          assetId: item.itemType.toLowerCase() === ItemType.Asset ? item.id : undefined,
          bundleId: item.itemType.toLowerCase() === ItemType.Bundle ? item.id : undefined
        };

        // some APIs use different status code name
        const statusCode = data.statusCode ?? data.status;
        if ((typeof statusCode === 'number' && statusCode >= 400) || data?.purchased === false) {
          if (data?.purchased === false && data?.reason === 'TwoStepVerificationRequired') {
            result.data.reason = BatchBuyPurchaseResults.TwoStepVerificationRequired;
          } else if (data?.purchased === false && data?.purchaseResult === 'Flooded') {
            result.data.reason = BatchBuyPurchaseResults.TooManyPurchases;
          } else {
            result.data.reason = BatchBuyPurchaseResults.ExceptionOccured;
          }
        } else {
          result.data.reason = BatchBuyPurchaseResults.Success;
        }
      } catch (errorRes) {
        result = {
          data: {
            itemData: {
              assetId: item.itemType.toLowerCase() === ItemType.Asset ? item.id : undefined,
              bundleId: item.itemType.toLowerCase() === ItemType.Bundle ? item.id : undefined
            },
            reason: BatchBuyPurchaseResults.CaughtError
          }
        };
      }

      return result;
    };

    function handleResult(result) {
      const resultFeedback = handleResultFromPurchases(result, startTwoStepVerification);
      let resultMessage;
      if (resultFeedback.params) {
        resultMessage = translate(resultFeedback.message, resultFeedback.params);
      } else {
        resultMessage = translate(resultFeedback.message);
      }

      if (resultFeedback.success) {
        systemFeedbackService.success(resultMessage);
      } else {
        systemFeedbackService.warning(resultMessage);
      }
    }

    async function purchaseItems() {
      const fulfillmentGroups = {
        strategy: 'BEST_EFFORT',
        lineItems: []
      };

      const lineItems = [];
      const itemResults = [];
      itemDetails.forEach(item => {
        const itemToPurchase = {};
        if (item.collectibleItemId !== undefined) {
          const purchaseFromCreator =
            item.collectibleItemDetails.saleLocationType !== 'ExperiencesDevApiOnly' &&
            (!item.itemRestrictions.includes('Collectible') ||
              (item.collectibleItemDetails.unitsAvailableForConsumption > 0 &&
                (!item.collectibleItemDetails.hasResellers ||
                  item.collectibleItemDetails.price <
                    item.collectibleItemDetails.lowestResalePrice)));
          if (!purchaseFromCreator && item.collectibleItemDetails.lowestAvailableResaleProductId) {
            itemToPurchase.collectibleProductId =
              item.collectibleItemDetails.lowestAvailableResaleProductId;
          } else {
            itemToPurchase.collectibleProductId = item.collectibleItemDetails.collectibleProductId;
          }
          itemToPurchase.agreedPriceRobux = item.collectibleItemDetails.lowestPrice;
        } else if (item.firstReseller !== undefined) {
          itemToPurchase.limitedV1InstanceId = `${item.firstReseller.userAssetId}`;
          itemToPurchase.agreedPriceRobux = item.firstReseller.price;
        } else {
          itemToPurchase.virtualEconomyProductId = `${item.productId}`;
          itemToPurchase.agreedPriceRobux =
            item.premiumPriceInRobux && authenticatedUser.isPremiumUser
              ? item.premiumPriceInRobux
              : item.price;
        }
        lineItems.push(itemToPurchase);

        const itemResultData = { data: { itemData: {}, reason: '' } };
        if (item.itemType === 'Asset') {
          itemResultData.data.itemData.assetId = item.id;
        } else {
          itemResultData.data.itemData.bundleId = item.id;
        }
        itemResults.push(itemResultData);
      });

      fulfillmentGroups.lineItems = lineItems;

      let result;
      try {
        result = await itemPurchaseService.bulkPurchaseItem(
          CurrentUser.userId,
          productSurface,
          fulfillmentGroups,
          uuidService.generateRandomUuid()
        );

        let count = 0;
        result.data.fulfillmentGroups[0].lineItems.forEach(item => {
          itemResults[count].data.reason =
            item.status === 'SUCCEEDED' ? 'Success' : item.errorReason;
          count += 1;
        });
      } catch (error) {
        result = error;

        let count = 0;
        itemResults.forEach(item => {
          itemResults[count].data.reason = result.data.message;
          count += 1;
        });
      }

      handleResult(result);
      onTransactionComplete(itemResults);
    }

    const onModalNeutral = () => {
      onCancel();
    };

    const onModalConfirm = () => {
      let twoStepVerificationRequired = false;
      itemDetails.forEach(item => {
        twoStepVerificationRequired =
          twoStepVerificationRequired || item.twoStepVerificationRequired;
      });
      if (twoStepVerificationRequired && !hasTwoStepVerificationBeenCompleted) {
        startTwoStepVerification();
      } else {
        purchaseItems();
        onAction();
      }
    };

    const onTwoStepVerificationChallengeComplete = () => {
      setHasTwoStepVerificationBeenCompleted(true);
      stopTwoStepVerification();
    };

    const body = (
      <Fragment>
        <div
          className='modal-message multi-item'
          // Used for formatting purchase text, hardcoded string value from translation service
          dangerouslySetInnerHTML={{
            __html: translate(bodyMessageResource, assetInfo)
          }}
        />
        {itemDetails !== undefined && itemDetails.length > 0 && (
          <div className='modal-multi-item-images-container'>
            {itemsSlice.map((item, i) => (
              <ItemThumbnail
                key={item.itemId}
                itemsCount={itemDetails.length}
                item={item}
                index={i}
              />
            ))}
          </div>
        )}
      </Fragment>
    );

    return (
      <React.Fragment>
        <TwoStepVerificationModal
          isTwoStepVerificationActive={isTwoStepVerificationActive}
          stopTwoStepVerification={onTwoStepVerificationChallengeComplete}
          systemFeedbackService={systemFeedbackService}
        />
        <Modal
          title={title || defaultTitle}
          body={body}
          neutralButtonText={translate(resources.cancelAction)}
          actionButtonText={actionButtonText}
          onAction={onModalConfirm}
          onNeutral={onModalNeutral}
          footerText={
            <BalanceAfterSaleText
              expectedPrice={expectedTotalPrice}
              currentRobuxBalance={currentRobuxBalance}
            />
          }
          loading={loading}
          actionButtonShow={itemDetails}
        />
      </React.Fragment>
    );
  }

  MultiItemPurchaseModal.defaultProps = {
    title: '',
    loading: false
  };

  MultiItemPurchaseModal.propTypes = {
    translate: PropTypes.func.isRequired,
    title: PropTypes.string,
    expectedTotalPrice: PropTypes.number.isRequired,
    currentRobuxBalance: PropTypes.number.isRequired,
    itemDetails: PropTypes.arrayOf(
      PropTypes.shape({
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
      })
    ).isRequired,
    onCancel: PropTypes.func.isRequired,
    onTransactionComplete: PropTypes.func.isRequired,
    onAction: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    productSurface: PropTypes.string.isRequired,
    systemFeedbackService: PropTypes.func.isRequired
  };
  return [
    withTranslations(MultiItemPurchaseModal, translationConfig.purchasingResources),
    modalService
  ];
}
