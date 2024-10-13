import { Dialog, RobloxTranslationResourceProviderInstance } from 'Roblox';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import {
  COMMON_UI_CONTROLS_NAMESPACE,
  FEATURE_PREMIUM_NAMESPACE,
  LANG_KEYS,
  UPSELL_COUNTER_NAMES
} from '../constants/upsellConstants';
import { ItemDetailElementDataset } from '../constants/serviceTypeDefinitions';
import reportCounter from '../utils/common/reportCounter';

export default function openLeaveRobloxWarningModal(
  onContinueToPayment: () => void,
  intlProvider: RobloxTranslationResourceProviderInstance,
  itemPurchaseObj?: ItemDetailElementDataset
) {
  const featurePremiumTranslationResource = intlProvider.getTranslationResource(
    FEATURE_PREMIUM_NAMESPACE
  );
  const commonUiControlsTranslationResource = intlProvider.getTranslationResource(
    COMMON_UI_CONTROLS_NAMESPACE
  );
  const lineBreak = '<br /><br />';
  const translationParam = { lineBreak, linebreak: lineBreak };
  const bodyContent =
    featurePremiumTranslationResource.get(
      LANG_KEYS.insufficientRobuxAskToPurchasePackageMessage,
      translationParam
    ) ||
    'This purchase must be completed on our partner’s website. You will be returned to Roblox after the purchase is completed.<br /><br /> Proceed to partner website for payment?';

  Dialog.open({
    titleText:
      featurePremiumTranslationResource.get(LANG_KEYS.insufficientRobuxLeaveRobloxHeading, {}) ||
      'Leaving Roblox',
    bodyContent: `<div class='modal-message-block text-center'>${bodyContent}</div>`,
    declineText: commonUiControlsTranslationResource.get(LANG_KEYS.commonUiCancelAction, {}),
    acceptText:
      commonUiControlsTranslationResource.get(LANG_KEYS.commonUiContinueToPaymentAction, {}) ||
      'Continue to Payment',
    onAccept: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CONTINUE_TO_VNG
      );
      reportCounter(UPSELL_COUNTER_NAMES.ConfirmLeaveRobloxModal, itemPurchaseObj?.assetType);
      onContinueToPayment();
    },
    onDecline: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
      );
      reportCounter(UPSELL_COUNTER_NAMES.CancelledFromLeaveRobloxModal, itemPurchaseObj?.assetType);
    },
    onCancel: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
      );
      reportCounter(UPSELL_COUNTER_NAMES.CancelledFromLeaveRobloxModal, itemPurchaseObj?.assetType);
    },
    allowHtmlContentInBody: true,
    allowHtmlContentInFooter: false,
    fieldValidationRequired: true,
    dismissable: true,
    xToCancel: true
  });
}
