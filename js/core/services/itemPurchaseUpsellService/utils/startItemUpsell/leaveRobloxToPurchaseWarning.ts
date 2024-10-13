import { ItemDetailElementDataset, RobloxTranslationResourceProviderInstance } from 'Roblox';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { UPSELL_COUNTER_NAMES } from '../../constants/upsellConstants';
import openPurchaseWarningModal from '../../modals/openPurchaseWarningModal';
import reportCounter from '../common/reportCounter';
import openLeaveRobloxWarningModal from '../../modals/openLeaveRobloxWarningModal';

function sendUserPurchaseFlowEvent(viewMessage: string) {
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.PURCHASE_WARNING,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
    viewMessage
  );
}

export default async function leaveRobloxToPurchaseWarning(
  onContinueToPayment: () => void,
  intlProvider: RobloxTranslationResourceProviderInstance,
  itemPurchaseObj?: ItemDetailElementDataset
) {
  try {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.EXTERNAL_LINK_MODAL
    );

    reportCounter(UPSELL_COUNTER_NAMES.ContinueBuyRobuxOnExternalSite, itemPurchaseObj?.assetType);
    openLeaveRobloxWarningModal(onContinueToPayment, intlProvider, itemPurchaseObj);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}
