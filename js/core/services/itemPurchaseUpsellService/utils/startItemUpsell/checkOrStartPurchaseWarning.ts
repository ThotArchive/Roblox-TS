import { EmailVerificationService, RobloxTranslationResourceProviderInstance } from 'Roblox';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import getPurchaseWarningAction from '../../api/getPurchaseWarningAction';
import { ItemDetailElementDataset, UpsellProduct } from '../../constants/serviceTypeDefinitions';
import {
  PURCHASE_WARNING_ACTION_TYPES,
  UPSELL_COUNTER_NAMES
} from '../../constants/upsellConstants';
import openPurchaseWarningModal from '../../modals/openPurchaseWarningModal';
import reportCounter from '../common/reportCounter';

function sendUserPurchaseFlowEvent(viewMessage: string) {
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.PURCHASE_WARNING,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
    viewMessage
  );
}

export default async function checkOrStartPurchaseWarning(
  upsellProduct: UpsellProduct,
  isPurchaseWarningModalEnabled: boolean,
  onAcknowledgedOrFailedCallback: () => void,
  intlProvider: RobloxTranslationResourceProviderInstance,
  itemPurchaseObj?: ItemDetailElementDataset
) {
  if (!isPurchaseWarningModalEnabled) {
    onAcknowledgedOrFailedCallback();
    return Promise.resolve();
  }

  try {
    const purchaseWarningAction = await getPurchaseWarningAction(upsellProduct.roblox_product_id);

    if (
      purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13PaymentModal ||
      purchaseWarningAction ===
        PURCHASE_WARNING_ACTION_TYPES.ParentalConsentWarningPaymentModal13To17 ||
      purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold1Modal ||
      purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold2Modal
    ) {
      if (purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13PaymentModal) {
        sendUserPurchaseFlowEvent(paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.U13_PAYMENT_MODAL);
        reportCounter(UPSELL_COUNTER_NAMES.ShowU13PaymentModal, itemPurchaseObj?.assetType);
      } else if (
        purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold1Modal
      ) {
        sendUserPurchaseFlowEvent(
          paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.U13_MONTHLY_THRESHOLD_1_MODAL
        );
        reportCounter(
          UPSELL_COUNTER_NAMES.ShowU13MonthlyThreshold1Modal,
          itemPurchaseObj?.assetType
        );
      } else if (
        purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold2Modal
      ) {
        sendUserPurchaseFlowEvent(
          paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.U13_MONTHLY_THRESHOLD_2_MODAL
        );
        reportCounter(
          UPSELL_COUNTER_NAMES.ShowU13MonthlyThreshold2Modal,
          itemPurchaseObj?.assetType
        );
      } else {
        sendUserPurchaseFlowEvent(
          paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.PAYMENT_MODAL_13_TO_17
        );
        reportCounter(
          UPSELL_COUNTER_NAMES.ShowParentalConsentWarningPaymentModal13To17Modal,
          itemPurchaseObj?.assetType
        ); // something went wrong on web
      }
      openPurchaseWarningModal(
        upsellProduct,
        purchaseWarningAction,
        onAcknowledgedOrFailedCallback,
        intlProvider,
        itemPurchaseObj
      );
    } else if (purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.RequireEmailVerification) {
      reportCounter(
        UPSELL_COUNTER_NAMES.U13PaymentModalEmailVerificationTriggered,
        itemPurchaseObj?.assetType
      );
      EmailVerificationService.handleUserEmailVerificationRequiredByPurchaseWarning()?.then(
        data => {
          sendUserPurchaseFlowEvent(
            paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.REQUIRE_EMAIL_VERIFICATION
          );
          if (data?.emailAddress && data?.verified) {
            onAcknowledgedOrFailedCallback();
          }
        }
      );
    } else {
      reportCounter(UPSELL_COUNTER_NAMES.U13PaymentModalNoAction, itemPurchaseObj?.assetType);
      onAcknowledgedOrFailedCallback(); // no data or no action request, but we want to continue
    }
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}
