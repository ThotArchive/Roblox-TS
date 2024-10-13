import {
  Dialog,
  RobloxTranslationResource,
  RobloxTranslationResourceProviderInstance
} from 'Roblox';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { escapeHtml } from 'core-utilities';
import { ItemDetailObject, ItemPurchaseAjaxDataObject } from '../constants/serviceTypeDefinitions';
import { LANG_KEYS, UPSELL_COUNTER_NAMES } from '../constants/upsellConstants';
import leaveRobloxToPurchaseWarning from '../utils/startItemUpsell/leaveRobloxToPurchaseWarning';
import { redirectToVngShop } from '../utils/common/redirectionHelpers';
import reportCounter from '../utils/common/reportCounter';
import formattingRobux from '../utils/common/formattingRobux';

export default function openVngInsufficientRobuxModal(
  itemDetail: ItemDetailObject,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  translationResource: RobloxTranslationResource,
  intlProvider: RobloxTranslationResourceProviderInstance
) {
  const robuxItemPrice = formattingRobux(itemDetail.expectedItemPrice);
  const avatarPreview = `<div class='item-card-container item-preview'>
        <div class='item-card-thumb'>
          <img alt='item preview' src='${itemPurchaseAjaxData.thumbnailImageUrl ?? ''}' />
        </div>
        <div class='item-info text-name'>
        <div class='text-overflow item-card-name'>${escapeHtml()(itemDetail.assetName)}</div>
          <div class='text-robux item-card-price'>${robuxItemPrice}</div>
        </div>
      </div>`;
  reportCounter(UPSELL_COUNTER_NAMES.UpsellShown, itemDetail.buyButtonElementDataset?.assetType);
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN
  );

  const dialogBodyForVNG =
    avatarPreview +
    (translationResource.get(LANG_KEYS.insufficientRobuxAskToPurchasePackageMessage, {}) ||
      `<div class='modal-message-block text-center border-top'>Sorry, you don't have enough Robux to buy this item. Would you like to purchase a Robux package?</div>`);
  const dialogFooterForVNG =
    translationResource.get(LANG_KEYS.insufficientRobuxRedirectToExternalPartner, {}) ||
    `<div class='text-footer modal-message-block text-center'> You will be taken to our partner’s page to complete the purchase.</div>`;
  Dialog.open({
    titleText:
      translationResource.get(LANG_KEYS.insufficientRobuxHeading, {}) || 'Insufficient Robux',
    bodyContent: dialogBodyForVNG,
    declineText: translationResource.get(LANG_KEYS.cancelAction, {}),
    acceptText: translationResource.get(LANG_KEYS.buyRobux, {}) || 'Buy Robux',
    onAccept: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX
      );
      leaveRobloxToPurchaseWarning(
        redirectToVngShop,
        intlProvider,
        itemDetail.buyButtonElementDataset
      ).catch(() => {
        reportCounter(
          UPSELL_COUNTER_NAMES.LeaveRobloxFailedToShown,
          itemDetail.buyButtonElementDataset?.assetType
        );
        // modal failed to show but we'd like to redirect to vng shop anyway
        redirectToVngShop();
      });
      return false;
    },
    onDecline: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
      );
      reportCounter(
        UPSELL_COUNTER_NAMES.UpsellCancelled,
        itemDetail.buyButtonElementDataset?.assetType
      );
    },
    onCancel: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
      );
      reportCounter(
        UPSELL_COUNTER_NAMES.UpsellCancelled,
        itemDetail.buyButtonElementDataset?.assetType
      );
    },
    allowHtmlContentInBody: true,
    allowHtmlContentInFooter: true,
    footerText: dialogFooterForVNG,
    fieldValidationRequired: true,
    dismissable: true,
    xToCancel: true
  });
}
