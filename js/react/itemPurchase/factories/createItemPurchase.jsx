import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { createSystemFeedback } from 'react-style-guide';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { ItemPurchaseUpsellService, CurrentUser, AccountIntegrityChallengeService } from 'Roblox';
import { uuidService } from 'core-utilities';
import translationConfig from '../translation.config';
import { getMetaData } from '../util/itemPurchaseUtil';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import itemPurchaseService from '../services/itemPurchaseService';
import itemDetailsService from '../services/itemDetailsService';
import createPurchaseConfirmationModal from './createPurchaseConfirmationModal';
import createPurchaseVerificationModal from './createPurchaseVerificationModal';
import createInsufficientFundsModal from './createInsufficientFundsModal';
import createTransactionFailureModal from './createTransactionFailureModal';
import createPriceChangedModal from './createPriceChangedModal';
import TwoStepVerificationModal from '../components/TwoStepVerificationModal';

const { resources, errorTypeIds, errorStatusText, events } = itemPurchaseConstants;

export default function createItemPurchase({
  customPurchaseVerificationModal,
  customPurchaseVerificationModalService
} = {}) {
  const { userRobuxBalance } = getMetaData();
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  const [
    TwoStepVerificationSystemFeedback,
    twoStepVerificationSystemFeedbackService
  ] = createSystemFeedback();
  const [
    PurchaseVerificationModal,
    purchaseVerificationModalService
  ] = createPurchaseVerificationModal();
  const [InsufficientFundsModal, insufficientFundsModalService] = createInsufficientFundsModal();
  const [
    PurchaseConfirmationModal,
    purchaseConfirmationModalService
  ] = createPurchaseConfirmationModal();

  const [PriceChangedModal, priceChangedModalService] = createPriceChangedModal();

  const [TransactionFailureModal, transactionFailureModalService] = createTransactionFailureModal();

  let itemUpsellProcessParams = {
    errorObject: {},
    itemDetail: {},
    startOriginalFlowCallback: () => null
  };
  const startOriginalFlowWhenNewFlowFailed = () => {
    if (!itemUpsellProcessParams.itemDetail.buyButtonElementDataset) {
      return;
    }
    paymentFlowAnalyticsService.startRobuxUpsellFlow(
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.assetType,
      !!itemUpsellProcessParams.itemDetail.buyButtonElementDataset.userassetId,
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.isPrivateServer,
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.isPlace
    );
    insufficientFundsModalService.open();
  };
  const insufficientFundsModalServiceWrapper = (shortfallPrice, targetData) => () => {
    if (
      ItemPurchaseUpsellService &&
      ItemPurchaseUpsellService.showExceedLargestInsufficientRobuxModal
    ) {
      ItemPurchaseUpsellService.showExceedLargestInsufficientRobuxModal(
        shortfallPrice,
        targetData,
        startOriginalFlowWhenNewFlowFailed
      );
    } else {
      startOriginalFlowWhenNewFlowFailed();
    }
  };
  const openInsufficientRobuxModal = () => {
    if (ItemPurchaseUpsellService && itemUpsellProcessParams?.itemDetail?.expectedItemPrice) {
      if (userRobuxBalance - itemUpsellProcessParams?.itemDetail?.expectedItemPrice >= 0) {
        startOriginalFlowWhenNewFlowFailed();
        return;
      }
      try {
        ItemPurchaseUpsellService.startItemUpsellProcess(
          itemUpsellProcessParams.errorObject,
          itemUpsellProcessParams.itemDetail,
          itemUpsellProcessParams.startOriginalFlowCallback
        );
        window.EventTracker.fireEvent(events.NEW_UPSELL_FROM_REACT_BUY_BUTTON);
      } catch (e) {
        window.EventTracker.fireEvent(events.NEW_UPSELL_FAILED_DUE_TO_ERROR);
        startOriginalFlowWhenNewFlowFailed();
      }
    } else {
      window.EventTracker.fireEvent(events.NEW_UPSELL_FAILED_DUE_TO_LOADING);
      startOriginalFlowWhenNewFlowFailed();
    }
  };

  function ItemPurchase({
    translate,
    assetName,
    assetType,
    assetTypeDisplayName,
    productId,
    expectedCurrency,
    expectedPrice,
    expectedSellerId,
    expectedPromoId,
    userAssetId,
    thumbnail,
    sellerName,
    sellerType,
    showSuccessBanner,
    // for place purchase
    isPlace,
    isPrivateServer,
    handlePurchase,
    onPurchaseSuccess,
    collectibleItemId,
    collectibleItemInstanceId,
    collectibleProductId,
    isLimited,
    customProps,
    saleLocationId = null
  }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newPrice, setNewPrice] = useState(null);
    const [robuxNeeded, setRobuxNeeded] = useState(expectedPrice - userRobuxBalance);
    const [confirmData, setConfirmData] = useState(null);
    const [currentRobuxBalance, setCurrentRobuxBalance] = useState(undefined);

    const [isTwoStepVerificationActive, setIsTwoStepVerificationActive] = useState(false);
    const startTwoStepVerification = () => setIsTwoStepVerificationActive(true);
    const stopTwoStepVerification = () => setIsTwoStepVerificationActive(false);
    const [enableTwoStepVerificationBanner, setEnableTwoStepVerificationBanner] = useState(false);

    const getCurrentUserBalance = () => {
      itemDetailsService
        .getCurrentUserBalance(CurrentUser.userId)
        .then(function handleResult(result) {
          setCurrentRobuxBalance(result.data.robux);
        })
        .catch(() => {
          setCurrentRobuxBalance(undefined);
        });
    };
    useEffect(() => {
      if (CurrentUser.isAuthenticated && getMetaData().userRobuxBalance === undefined) {
        getCurrentUserBalance();
      }
    }, [productId, expectedPrice, expectedSellerId]);

    useEffect(() => {
      if (isTwoStepVerificationActive) {
        setEnableTwoStepVerificationBanner(true);
      }
    }, [isTwoStepVerificationActive]);

    const closeAll = () => {
      if (customPurchaseVerificationModalService) {
        customPurchaseVerificationModalService.close();
      } else {
        purchaseVerificationModalService.close();
      }
      priceChangedModalService.close();
    };

    const generateNewItemUpsellProcessParams = (shortfallPrice, price) => {
      const targetData = {
        assetType,
        assetTypeDisplayName,
        expectedCurrency,
        expectedPrice: price,
        expectedSellerId,
        itemName: assetName,
        itemType: assetType,
        productId,
        userassetId: userAssetId,
        placeproductpromotionId: expectedPromoId,
        isPrivateServer,
        isPlace
      };
      itemUpsellProcessParams = {
        errorObject: {
          shortfallPrice,
          currentCurrency: expectedCurrency,
          isPlace
        },
        itemDetail: {
          expectedItemPrice: price,
          assetName,
          isLimited,
          buyButtonElementDataset: targetData
        },
        startOriginalFlowCallback: insufficientFundsModalServiceWrapper(shortfallPrice, targetData)
      };
    };

    const handleError = ({
      showDivId,
      title,
      errorMsg: message,
      price: currentPrice,
      shortfallPrice,
      onDecline
    }) => {
      if (showDivId === errorTypeIds.transactionFailure) {
        setError({ title, message, onDecline });
        transactionFailureModalService.open();
      } else if (showDivId === errorTypeIds.insufficientFunds) {
        setRobuxNeeded(shortfallPrice);
        generateNewItemUpsellProcessParams(shortfallPrice, currentPrice);
        openInsufficientRobuxModal();
      } else if (showDivId === errorTypeIds.priceChanged) {
        setNewPrice(currentPrice);
        priceChangedModalService.open();
      }
    };

    const openConfirmation = data => {
      setConfirmData(data);
      purchaseConfirmationModalService.open();
    };

    const purchaseDeveloperProduct = price => {
      const request = {
        expectedPrice: price,
        saleLocationType: 'Website',
        saleLocationId
      };
      setLoading(true);
      itemPurchaseService
        .purchaseDeveloperProduct(productId, request)
        .then(response => {
          const { data } = response;
          if (!data.purchased && data.reason === 'TwoStepVerificationRequired') {
            startTwoStepVerification();
          } else if (!data.purchased) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else {
            onPurchaseSuccess();
            if (showSuccessBanner) {
              systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
              return;
            }
            openConfirmation({
              assetIsWearable: false,
              transactionVerb: '',
              onDecline: () => {
                window.location.reload();
              }
            });
          }
        })
        .catch(errorRes => {
          console.debug(errorRes);
          setLoading(false);
          closeAll();
          if (!errorRes || errorRes?.status === 400) {
            // bad request
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.purchasingUnavailableMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else if (errorRes.status === 429) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
              // We dont reload here since it's already rate limited
            });
          } else {
            // generic error
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          }
        });
    };

    const purchaseRegularItem = price => {
      const params = {
        expectedCurrency,
        expectedPrice: price,
        expectedSellerId
      };
      if (expectedPromoId > 0) {
        params.expectedPromoId = expectedPromoId;
      }
      if (userAssetId > 0) {
        params.userAssetId = userAssetId;
      }

      if (handlePurchase) {
        handlePurchase({ params, handleError, setLoading, openConfirmation, closeAll });
        return;
      }

      setLoading(true);
      itemPurchaseService
        .purchaseItem(productId, params)
        .then(({ data }) => {
          console.debug(data);
          const { statusCode, assetIsWearable, transactionVerb } = data;

          setLoading(false);
          closeAll();
          if (!data.purchased && data.reason === 'TwoStepVerificationRequired') {
            startTwoStepVerification();
          } else if (statusCode === 500) {
            handleError(data);
          } else {
            onPurchaseSuccess();
            if (showSuccessBanner) {
              systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
              return;
            }
            openConfirmation({
              assetIsWearable,
              transactionVerb,
              onDecline: () => {
                window.location.reload();
              }
            });
          }
        })
        .catch(errorRes => {
          console.debug(errorRes);
          setLoading(false);
          closeAll();
          if (!errorRes || errorRes?.statusText === errorStatusText.badRequest) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.purchasingUnavailableMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else {
            if (errorRes.status === 429) {
              handleError({
                title: translate(resources.errorOccuredHeading),
                errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
                showDivId: errorTypeIds.transactionFailure
                // We dont reload here since it's already rate limited
              });
            }
            try {
              handleError(JSON.parse(errorRes?.statusText));
            } catch (err) {
              handleError({ errorMsg: errorRes?.statusText });
            }
          }
        });
    };
    const purchaseCollectibleItem = async price => {
      const params = {
        collectibleItemId,
        expectedCurrency,
        expectedPrice: price,
        expectedPurchaserId: CurrentUser.userId,
        expectedPurchaserType: 'User',
        expectedSellerId,
        expectedSellerType: sellerType,
        idempotencyKey: uuidService.generateRandomUuid()
      };
      if (collectibleItemInstanceId) {
        params.collectibleItemInstanceId = collectibleItemInstanceId;
      }
      if (collectibleProductId) {
        params.collectibleProductId = collectibleProductId;
      }

      if (handlePurchase) {
        handlePurchase({ params, handleError, setLoading, openConfirmation, closeAll });
        return;
      }

      setLoading(true);
      const serviceHandler = collectibleItemInstanceId
        ? itemPurchaseService.purchaseCollectibleItemInstance
        : itemPurchaseService.purchaseCollectibleItem;
      try {
        const response = await serviceHandler(collectibleItemId, params);
        const { data } = response;
        const { transactionVerb } = data;
        setLoading(false);
        closeAll();
        // some APIs use different status code name
        const statusCode = data.statusCode ?? data.status;
        if ((typeof statusCode === 'number' && statusCode >= 400) || data?.purchased === false) {
          if (data?.purchased === false && data?.reason === 'TwoStepVerificationRequired') {
            startTwoStepVerification();
          } else if (data?.purchased === false && data?.purchaseResult === 'Flooded') {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
              // We dont reload here since it's already flooded
            });
          } else {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.purchasingUnavailableMessage),
              showDivId: errorTypeIds.transactionFailure,
              // Reload the page so user can see latest state
              onDecline: () => {
                window.location.reload();
              }
            });
          }
        } else {
          onPurchaseSuccess();
          if (showSuccessBanner) {
            systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
            return;
          }
          openConfirmation({
            assetIsWearable: true,
            transactionVerb,
            itemDelayed: data?.pending,
            onDecline: () => {
              window.location.reload();
            }
          });
        }
      } catch (errorRes) {
        console.debug(errorRes);

        if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
          // Show purchase dialogue again if captcha is abandoned
          setLoading(false);
          return;
        }

        setLoading(false);
        closeAll();

        if (!errorRes || errorRes?.statusText === errorStatusText.badRequest) {
          handleError({
            title: translate(resources.errorOccuredHeading),
            errorMsg: translate(resources.purchasingUnavailableMessage),
            showDivId: errorTypeIds.transactionFailure
          });
        } else {
          if (errorRes.status === 429) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
              // We dont reload here since it's already rate limited
            });
          }
          try {
            handleError(JSON.parse(errorRes?.statusText));
          } catch (err) {
            handleError({ errorMsg: errorRes?.statusText });
          }
        }
      }
    };

    const purchaseItem = price => {
      if (collectibleItemId) {
        purchaseCollectibleItem(price);
      } else if (assetType === 'Product') {
        purchaseDeveloperProduct(price);
      } else {
        purchaseRegularItem(price);
      }
    };

    const purchaseVerificationModal = customPurchaseVerificationModal ? (
      React.createElement(customPurchaseVerificationModal, {
        ...{
          assetName,
          assetType,
          expectedPrice,
          thumbnail,
          sellerName,
          loading,
          onAction: () => purchaseItem(expectedPrice),
          ...customProps
        }
      })
    ) : (
      <PurchaseVerificationModal
        {...{
          expectedPrice,
          thumbnail,
          assetName,
          assetType,
          assetTypeDisplayName,
          sellerName,
          isPlace,
          loading,
          collectibleItemId,
          collectibleItemInstanceId,
          currentRobuxBalance,
          onAction: () => {
            purchaseItem(expectedPrice);
            return false;
          }
        }}
      />
    );

    if (robuxNeeded > 0 && ItemPurchaseUpsellService) {
      generateNewItemUpsellProcessParams(robuxNeeded, newPrice ?? expectedPrice);
    }

    return (
      <React.Fragment>
        <TwoStepVerificationModal
          isTwoStepVerificationActive={isTwoStepVerificationActive}
          stopTwoStepVerification={stopTwoStepVerification}
          systemFeedbackService={twoStepVerificationSystemFeedbackService}
        />
        {robuxNeeded > 0 ? (
          <InsufficientFundsModal robuxNeeded={robuxNeeded} />
        ) : (
          purchaseVerificationModal
        )}
        {error && (
          <TransactionFailureModal
            title={error.title}
            message={error.message}
            onDecline={error.onDecline}
          />
        )}
        {newPrice != null && (
          <PriceChangedModal
            {...{
              expectedPrice,
              currentPrice: newPrice,
              loading,
              onAction: () => {
                purchaseItem(newPrice);
                return false;
              }
            }}
          />
        )}
        {confirmData && (
          <PurchaseConfirmationModal
            {...{
              thumbnail,
              assetName,
              assetType,
              assetTypeDisplayName,
              sellerName,
              isPlace,
              isPrivateServer,
              expectedPrice: newPrice || expectedPrice,
              currentRobuxBalance,
              ...confirmData
            }}
          />
        )}
        {showSuccessBanner && <SystemFeedback />}
        {enableTwoStepVerificationBanner && <TwoStepVerificationSystemFeedback />}
      </React.Fragment>
    );
  }

  ItemPurchase.defaultProps = {
    isPlace: false,
    isPrivateServer: false,
    productId: null,
    assetTypeDisplayName: '',
    expectedPromoId: 0,
    userAssetId: 0,
    showSuccessBanner: false,
    handlePurchase: null,
    onPurchaseSuccess: () => null,
    customProps: {},
    collectibleItemId: null,
    collectibleItemInstanceId: null,
    collectibleProductId: null,
    sellerType: null,
    isLimited: false,
    saleLocationId: null
  };

  ItemPurchase.propTypes = {
    translate: PropTypes.func.isRequired,
    productId(props, propName, componentName) {
      const { collectibleItemId, productId } = props;
      // productId only required if no `collectibleItemId`
      // if (props.collectibleItemId) return "";
      if (!collectibleItemId && typeof productId !== 'number') {
        return new Error(
          `Invalid prop ${propName} supplied to ${componentName}. Validation failed.`
        );
      }
      return null;
    },
    expectedCurrency: PropTypes.number.isRequired,
    expectedPrice: PropTypes.number.isRequired,
    thumbnail: PropTypes.node.isRequired,
    assetName: PropTypes.string.isRequired,
    assetType: PropTypes.string.isRequired,
    assetTypeDisplayName: PropTypes.string,
    expectedSellerId: PropTypes.number.isRequired,
    sellerName: PropTypes.string.isRequired,
    sellerType: PropTypes.string,
    isPlace: PropTypes.bool,
    isPrivateServer: PropTypes.bool,
    expectedPromoId: PropTypes.number,
    userAssetId: PropTypes.number,
    showSuccessBanner: PropTypes.bool,
    handlePurchase: PropTypes.func,
    onPurchaseSuccess: PropTypes.func,
    customProps: PropTypes.func,
    collectibleItemId: PropTypes.string,
    collectibleItemInstanceId: PropTypes.string,
    collectibleProductId: PropTypes.string,
    isLimited: PropTypes.bool,
    saleLocationId: PropTypes.number
  };
  return [
    withTranslations(ItemPurchase, translationConfig.purchasingResources),
    {
      start: () => {
        // try open verification view or insufficient funds
        // modal depending if user has enough robux
        if (customPurchaseVerificationModalService) {
          customPurchaseVerificationModalService.open();
        } else {
          purchaseVerificationModalService.open();
        }
        openInsufficientRobuxModal();
      }
    }
  ];
}
