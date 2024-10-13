/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { Fragment, useState } from 'react';
import { TSystemFeedbackService } from 'react-style-guide';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { fireEvent } from 'roblox-event-tracker';
import { urlService } from 'core-utilities';
import { COUNTER_METRICS, TRANSLATION_KEYS } from '../constants/constants';
import redeemGiftCardTranslationConfig from '../translation.config';
import { getNextPurchasableMetadata, processPayment } from '../services/redeemGiftCardService';
import createPurchasePackageModal from '../components/HeuristicConvertedToCredit/createPurchasePackageModal';
import createConvertCreditModal from '../components/HeuristicConvertedToCredit/createConvertCreditModal';

type THeuristicCreditConversionModalProps = {
  creditBalance: number;
  setCreditBalance: (creditBalance: number) => void;
  currencyCode: string;
  setCurrencyCode: (currencyCode: string) => void;
  convertedRobuxAmount: number;
  setConvertedRobuxAmount: (setConvertedRobuxAmount: number) => void;
  systemFeedbackService: TSystemFeedbackService;
  translate: TranslateFunction;
};
const [PurchasePackageModal, purchasePackageModalService] = createPurchasePackageModal();
const [ConvertCreditModal, convertCreditModalService] = createConvertCreditModal();
function useHeuristicCreditConversionModal({
  creditBalance,
  setCreditBalance,
  currencyCode,
  setCurrencyCode,
  convertedRobuxAmount,
  setConvertedRobuxAmount,
  systemFeedbackService,
  translate
}: THeuristicCreditConversionModalProps): [React.FC, () => void] {
  const [productId, setProductId] = useState(0);
  const [numberOfPurchase, setNumberOfPurchase] = useState(0);
  const [totalBalanceDue, setTotalBalanceDue] = useState(0);
  const [robuxAmountInPackage, setRobuxAmountInPackage] = useState(0);
  const [loading, setLoading] = useState(false);

  const alertGenericErrorAndCloseModals = () => {
    systemFeedbackService.warning(
      translate(TRANSLATION_KEYS.GenericFailureAlert) ||
        'Something went wrong! Please try again later.'
    );
    purchasePackageModalService.close();
    convertCreditModalService.close();
    window.location.href = urlService.getAbsoluteUrl('/upgrades/robux');
  };

  const showAlert = (isSuccessful: boolean, productIdPassedIn: number) => {
    const isCreditConversion =
      productIdPassedIn === 0 || productIdPassedIn === undefined || productIdPassedIn === null;
    if (isSuccessful) {
      systemFeedbackService.success(
        translate(
          isCreditConversion
            ? TRANSLATION_KEYS.ConvertedCreditToRobuxSuccessAlert
            : TRANSLATION_KEYS.RobuxPackagePurchasedSuccessAlert
        )
      );
    } else {
      systemFeedbackService.warning(
        translate(
          isCreditConversion
            ? TRANSLATION_KEYS.ConvertedCreditToRobuxFailedAlert
            : TRANSLATION_KEYS.RobuxPackagePurchasedFailedAlert
        ) ||
          translate(TRANSLATION_KEYS.GenericFailureAlert) ||
          'Something went wrong! Please try again later.'
      );
    }
  };

  const getNextPurchasable = async () => {
    setLoading(true);
    try {
      const result = await getNextPurchasableMetadata();
      if (result.status !== 200) {
        systemFeedbackService.warning(
          translate(TRANSLATION_KEYS.GenericFailureAlert) ||
            'Something went wrong! Please try again later.'
        );
        setLoading(false);
        fireEvent(COUNTER_METRICS.GET_NEXT_PURCHASABLE_FAILED_STATUS_CODE_PREFIX);
        fireEvent(
          `${COUNTER_METRICS.GET_NEXT_PURCHASABLE_FAILED_STATUS_CODE_PREFIX}${result.status}`
        );
        return;
      }
      const metadata = result.data;
      // run out of credit balance
      if (
        metadata.creditBalance === 0 ||
        (metadata.productId === 0 && metadata.robuxConversionAmount === 0)
      ) {
        setLoading(false);
        convertCreditModalService.close();
        purchasePackageModalService.close();
        setCreditBalance(metadata.creditBalance);
        fireEvent(COUNTER_METRICS.GET_NEXT_PURCHASABLE_CREDIT_BALANCE_ZERO);
        return;
      }
      // update credit balance
      setCreditBalance(metadata.creditBalance);
      setCurrencyCode(metadata.currencyCode);
      setConvertedRobuxAmount(metadata.robuxConversionAmount);
      setProductId(metadata.productId);
      setTotalBalanceDue(metadata.balanceDue);
      setRobuxAmountInPackage(metadata.robuxAmountProductGrant);

      if (metadata.productId === 0) {
        convertCreditModalService.open();
        purchasePackageModalService.close();
        fireEvent(COUNTER_METRICS.GET_NEXT_PURCHASABLE_CONVERSION);
      } else {
        purchasePackageModalService.open();
        fireEvent(COUNTER_METRICS.GET_NEXT_PURCHASABLE_PRODUCT_PURCHASE);
      }
    } catch (e) {
      alertGenericErrorAndCloseModals();
      fireEvent(COUNTER_METRICS.GET_NEXT_PURCHASABLE_UNEXPECTED_EXCEPTION);
    } finally {
      setLoading(false);
    }
  };
  // Process Payment API request, either succeed or get next purchasable
  const buyOrConvertProcessPayment = async () => {
    setLoading(true);
    try {
      const result = await processPayment(productId);
      if (result.status !== 200) {
        showAlert(false, productId);
        setLoading(false);
        fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX); // just in case not all status codes included due to manual-counter-creation
        fireEvent(`${COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX}${result.status}`);
        return;
      }
      const processedResult = result.data;
      showAlert(processedResult.isSuccess, productId);
      if (processedResult.isSuccess && processedResult.providerPayload?.IsSuccessful) {
        await getNextPurchasable();
        setNumberOfPurchase(numberOfPurchase + 1);
        fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_NEXT_STEP);
      } else {
        purchasePackageModalService.close();
        convertCreditModalService.close();
        fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_NOT_SUCCESSFUL_PREFIX);
      }
      fireEvent(
        COUNTER_METRICS.PROCESS_PAYMENT_RESPONSE_MESSAGE_PREFIX +
          processedResult.providerPayload.ResponseMessage
      );
    } catch (e) {
      alertGenericErrorAndCloseModals();
      fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_UNEXPECTED_EXCEPTION);
    } finally {
      setLoading(false);
    }
  };

  const startCreditConversionFlow = () => {
    setNumberOfPurchase(0);
    void getNextPurchasable();
    setNumberOfPurchase(1);
  };

  function HeuristicCreditConversionModal(): JSX.Element {
    const onPurchaseBuyInModalClick = () => {
      void buyOrConvertProcessPayment(); // have to use non async method to make the loading work with modal
    };

    const onConvertToRobuxInModalClick = () => {
      void buyOrConvertProcessPayment(); // have to use non async method to make the loading work with modal
    };

    // GetNextPurchase API request and set states
    const onCancel = () => {
      if (productId === 0) {
        convertCreditModalService.close();
        fireEvent(COUNTER_METRICS.CONVERSION_CANCEL_CLICKED);
      } else {
        purchasePackageModalService.close();
        fireEvent(COUNTER_METRICS.PRODUCT_PURCHASE_CANCEL_CLICKED);
      }
    };
    return (
      <Fragment>
        <PurchasePackageModal
          availableBalance={creditBalance}
          totalBalanceDue={totalBalanceDue}
          currencyCode={currencyCode}
          numberOfPurchase={numberOfPurchase}
          robuxAmountInPackage={robuxAmountInPackage}
          onPurchase={onPurchaseBuyInModalClick}
          onNeutral={onCancel}
          loading={loading}
          translate={translate}
        />
        <ConvertCreditModal
          remainingCreditBalance={creditBalance}
          currencyCode={currencyCode}
          robuxConversionAmount={convertedRobuxAmount}
          numberOfPurchase={numberOfPurchase}
          onConvert={onConvertToRobuxInModalClick}
          onNeutral={onCancel}
          loading={loading}
          translate={translate}
        />
      </Fragment>
    );
  }

  return [
    withTranslations(HeuristicCreditConversionModal, redeemGiftCardTranslationConfig),
    startCreditConversionFlow
  ];
}
export default useHeuristicCreditConversionModal;
