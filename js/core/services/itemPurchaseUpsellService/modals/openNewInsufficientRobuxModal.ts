import { urlService, escapeHtml } from 'core-utilities';
import {
  CurrentUser,
  Dialog,
  RobloxIntlInstance,
  RobloxTranslationResource,
  RobloxTranslationResourceProviderInstance
} from 'Roblox';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import {
  InsufficientFundsErrorObject,
  ItemDetailElementDataset,
  ItemDetailObject,
  ItemPurchaseAjaxDataObject,
  UpsellProduct
} from '../constants/serviceTypeDefinitions';
import formattingRobux from '../utils/common/formattingRobux';
import {
  LANG_KEYS,
  ROBLOX_TERMS_OF_USE_URL,
  UPGRADES_PAYMENT_METHODS_URL,
  UPSELL_COUNTER_NAMES
} from '../constants/upsellConstants';
import generateCookieForAutoPurchase from '../utils/startItemUpsell/generateCookieForAutoPurchase';
import checkOrStartPurchaseWarning from '../utils/startItemUpsell/checkOrStartPurchaseWarning';
import reportCounter from '../utils/common/reportCounter';

function prepareAndStartAutoPurchaseFlow(
  upsellProduct: UpsellProduct,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  itemPurchaseObj?: ItemDetailElementDataset
) {
  const upsellUuid = generateCookieForAutoPurchase(itemPurchaseAjaxData, itemPurchaseObj);

  reportCounter(UPSELL_COUNTER_NAMES.UpsellContinued, itemPurchaseObj?.assetType);
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
    true,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
    paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
    paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GO_TO_ROBUX_PURCHASE_PAGE
  );

  window.location.href = urlService.getAbsoluteUrl(
    `${UPGRADES_PAYMENT_METHODS_URL}?ap=${upsellProduct.roblox_product_id}&UpsellUuid=${upsellUuid}`
  );
}

function autoPurchaseFlow(
  avatarPreview: string,
  errorObj: InsufficientFundsErrorObject,
  itemDetail: ItemDetailObject,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  upsellProduct: UpsellProduct,
  intl: RobloxIntlInstance,
  translationResource: RobloxTranslationResource,
  intlProvider: RobloxTranslationResourceProviderInstance
) {
  const termsOfUseTag = `<a class='text-link-secondary terms-of-use-link' target='_blank' href='${urlService.getUrlWithLocale(
    ROBLOX_TERMS_OF_USE_URL,
    intl.getRobloxLocale()
  )}'>`;
  const robuxNeeded = formattingRobux(errorObj.shortfallPrice, false);
  const robuxPackageAmount = formattingRobux(upsellProduct.robux_amount);
  const dialogBody =
    avatarPreview +
    translationResource.get(LANG_KEYS.insufficientRobuxMessage, {
      divTagStart: "<div class='modal-message-block text-center border-top'>",
      divTagEnd: '</div>',
      robuxNeeded,
      robuxPackageAmount,
      lineBreak: '',
      aTagStart: termsOfUseTag,
      aTagEnd: '</a>'
    });
  Dialog.open({
    titleText: translationResource.get(LANG_KEYS.insufficientRobuxHeading, {}),
    bodyContent: dialogBody,
    declineText: translationResource.get(LANG_KEYS.cancelAction, {}),
    acceptText: translationResource.get(LANG_KEYS.buyRobuxAndItemAction, {}),
    acceptColor: 'btn-primary-md',
    onAccept: () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX_AND_ITEM
      );
      checkOrStartPurchaseWarning(
        // no await here, so that this modal field validation will be valid, and the current modal won't disappear until the next modal show up
        upsellProduct,
        // this isUnder13 logic is only works for the web/desktop.
        // it will only show for under 13 modals, no 13-17 modal, because we have a line of text on the payment method page for them
        // but for mobile, we will should pass in true all the time. but this openNewInsufficientRobuxModal file will only be called on web
        CurrentUser.isUnder13,
        () =>
          prepareAndStartAutoPurchaseFlow(
            upsellProduct,
            itemPurchaseAjaxData,
            itemDetail.buyButtonElementDataset
          ),
        intlProvider,
        itemDetail.buyButtonElementDataset
      ).catch(() => {
        reportCounter(
          UPSELL_COUNTER_NAMES.U13PaymentModalFailedToShow,
          itemDetail.buyButtonElementDataset?.assetType
        );
        prepareAndStartAutoPurchaseFlow(
          upsellProduct,
          itemPurchaseAjaxData,
          itemDetail.buyButtonElementDataset
        ); // failed purchase warning request, but we want to continue
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
    allowHtmlContentInFooter: false,
    fieldValidationRequired: true,
    dismissable: true,
    xToCancel: true
  });
}

export default function openNewInsufficientRobuxModal(
  errorObj: InsufficientFundsErrorObject,
  itemDetail: ItemDetailObject,
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  upsellProduct: UpsellProduct,
  intl: RobloxIntlInstance,
  translationResource: RobloxTranslationResource,
  intlProvider: RobloxTranslationResourceProviderInstance
): void {
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

  autoPurchaseFlow(
    avatarPreview,
    errorObj,
    itemDetail,
    itemPurchaseAjaxData,
    upsellProduct,
    intl,
    translationResource,
    intlProvider
  );
}
