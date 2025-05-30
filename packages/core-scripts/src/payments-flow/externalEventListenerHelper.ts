// TODO: old, migrated code
// eslint-disable-next-line import/no-cycle
import { PaymentFlowAnalyticsService } from "./index";

const BUY_ROBUX_MENU_BUTTON_SELECTOR = "#header li a.robux-menu-btn";
const REACT_BUY_BUTTON_CONTAINER_ELEMENT_ID = "display-price-container";
const GET_PREMIUM_BUTTON_ON_ITEM_DETAIL_SELECTOR = "#item-details #upgrade-button";
const PREMIUM_PROMPT_BUTTON_ON_ITEM_DETAIL_SELECTOR = "#item-details .premium-prompt a";

const setupBuyRobuxMenuBtn = (paymentFlowAnalyticsService: PaymentFlowAnalyticsService) => {
  document.querySelector(BUY_ROBUX_MENU_BUTTON_SELECTOR)?.addEventListener("click", event => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.NAVIGATION_MENU,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      (event.target as any).innerText as string,
    );
  });
};

/**
 * Check if the Get Premium button is from cshtml or from react app
 */
const isCsHtmlBuyButtonLoaded = () =>
  !document.getElementById(REACT_BUY_BUTTON_CONTAINER_ELEMENT_ID);

const setupPremiumUpsellBtnOnItemDetailPage = (
  paymentFlowAnalyticsService: PaymentFlowAnalyticsService,
) => {
  // This is the "Get Premium" upsell button from the item detail cshtml
  document
    .querySelector(GET_PREMIUM_BUTTON_ON_ITEM_DETAIL_SELECTOR)
    ?.addEventListener("click", () => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_PREMIUM,
      );
    });
  // This is the "Get Premium and buy for xx" upsell button from the item detail cshtml
  document
    .querySelector(PREMIUM_PROMPT_BUTTON_ON_ITEM_DETAIL_SELECTOR)
    ?.addEventListener("click", event => {
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        (event.target as any).innerText as string,
      );
    });
};

/**
 * Setup event listeners for external div
 * Only set up here when the div is a pure html tag and you need to add an onClick to the html tag
 *
 * @param paymentFlowAnalyticsService
 */
const setupExternalEventListeners = (
  paymentFlowAnalyticsService: PaymentFlowAnalyticsService,
): void => {
  // add event listeners for pure html buttons after document is ready
  document.addEventListener("DOMContentLoaded", () => {
    setupBuyRobuxMenuBtn(paymentFlowAnalyticsService);
    if (isCsHtmlBuyButtonLoaded()) {
      setupPremiumUpsellBtnOnItemDetailPage(paymentFlowAnalyticsService);
    }
  });
};

export default setupExternalEventListeners;
