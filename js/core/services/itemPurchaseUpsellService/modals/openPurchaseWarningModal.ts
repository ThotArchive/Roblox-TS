import { Dialog, RobloxTranslationResourceProviderInstance } from 'Roblox';
import {
  COMMON_UI_CONTROLS_NAMESPACE,
  FEATURE_PREMIUM_NAMESPACE,
  LANG_KEYS,
  PURCHASE_WARNING_ACTION_TYPES,
  UPSELL_COUNTER_NAMES
} from '../constants/upsellConstants';
import { ItemDetailElementDataset, UpsellProduct } from '../constants/serviceTypeDefinitions';
import { invalidateCurrentAutoPurchaseFlow } from '../utils/common/invalidationHelpers';
import acknowledgePurchaseWarning from '../api/acknowledgePurchaseWarning';
import reportCounter from '../utils/common/reportCounter';

export default function openPurchaseWarningModal(
  upsellProduct: UpsellProduct,
  purchaseWarningAction: string,
  onAcknowledgedCallback: () => void,
  intlProvider: RobloxTranslationResourceProviderInstance,
  itemPurchaseObj?: ItemDetailElementDataset
) {
  const featurePremiumTranslationResource = intlProvider.getTranslationResource(
    FEATURE_PREMIUM_NAMESPACE
  );
  const commonUiControlsTranslationResource = intlProvider.getTranslationResource(
    COMMON_UI_CONTROLS_NAMESPACE
  );
  const warningIcon = '<div class="text-center"><div class="icon-warning"></div></div>';
  const lineBreak = '<br /><br />';
  const translationParam = { lineBreak, linebreak: lineBreak }; // somehow the letter case of linebreak is not the same in translations
  let bodyContent = '';
  if (purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13PaymentModal) {
    bodyContent = featurePremiumTranslationResource.get(
      LANG_KEYS.featurePremiumScaryModalBodyNewDescription,
      translationParam
    );
  } else if (
    purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.ParentalConsentWarningPaymentModal13To17
  ) {
    bodyContent = featurePremiumTranslationResource.get(
      LANG_KEYS.featurePremiumScaryModalBody13To17Description,
      {}
    );
  } else if (purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold1Modal) {
    bodyContent = featurePremiumTranslationResource.get(
      LANG_KEYS.featurePremiumScaryModalThreshold1BodyDescription,
      translationParam
    );
  } else if (purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold2Modal) {
    bodyContent = featurePremiumTranslationResource.get(
      LANG_KEYS.featurePremiumScaryModalThreshold2BodyDescription,
      translationParam
    );
  }

  Dialog.open({
    titleText: featurePremiumTranslationResource.get(
      LANG_KEYS.featurePremiumScaryModalTitleHeading,
      {}
    ),
    bodyContent: `<div><span class="text-description">${bodyContent}</span></div>${warningIcon}`,
    declineText: commonUiControlsTranslationResource.get(LANG_KEYS.commonUiCancelAction, {}),
    acceptText: commonUiControlsTranslationResource.get(LANG_KEYS.commonUiOkAction, {}),
    onAccept: () => {
      acknowledgePurchaseWarning(purchaseWarningAction, onAcknowledgedCallback)
        .then(() => {
          if (purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13PaymentModal) {
            reportCounter(UPSELL_COUNTER_NAMES.ConfirmU13PaymentModal, itemPurchaseObj?.assetType);
          } else if (
            purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold1Modal
          ) {
            reportCounter(
              UPSELL_COUNTER_NAMES.ConfirmU13MonthlyThreshold1Modal,
              itemPurchaseObj?.assetType
            );
          } else if (
            purchaseWarningAction === PURCHASE_WARNING_ACTION_TYPES.U13MonthlyThreshold2Modal
          ) {
            reportCounter(
              UPSELL_COUNTER_NAMES.ConfirmU13MonthlyThreshold2Modal,
              itemPurchaseObj?.assetType
            );
          } else {
            reportCounter(
              UPSELL_COUNTER_NAMES.ConfirmParentalConsentWarningPaymentModal13To17Modal,
              itemPurchaseObj?.assetType
            ); // something went wrong on web
          }
        })
        .catch(() => {
          onAcknowledgedCallback();
        });
      return false;
    },
    onDecline: () => {
      reportCounter(UPSELL_COUNTER_NAMES.UpsellCancelledFromU13Modal, itemPurchaseObj?.assetType);
      invalidateCurrentAutoPurchaseFlow();
      return false;
    },
    onCancel: () => {
      reportCounter(UPSELL_COUNTER_NAMES.UpsellCancelledFromU13Modal, itemPurchaseObj?.assetType);
      invalidateCurrentAutoPurchaseFlow();
      return false;
    },
    allowHtmlContentInBody: true,
    allowHtmlContentInFooter: false,
    fieldValidationRequired: true,
    dismissable: true,
    xToCancel: true
  });
}
