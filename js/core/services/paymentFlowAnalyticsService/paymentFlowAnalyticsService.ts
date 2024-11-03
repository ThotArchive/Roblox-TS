// eslint-disable-next-line no-restricted-imports
import { uuidService } from '@rbx/core';
import { EnvironmentUrls, EventStream } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import PaymentFlowContext from './paymentFlowContext';
import {
  ASSET_TYPE,
  COUNTER_EVENTS,
  CUSTOM_EVENT,
  EVENT_NAME,
  PAGE_LOAD_TYPE,
  PURCHASE_EVENT_TYPE,
  PURCHASE_STATUS,
  TRIGGERING_CONTEXT,
  VIEW_MESSAGE,
  VIEW_NAME
} from './constants';
import setupExternalEventListeners from './externalEventListenerHelper';

export class PaymentFlowAnalyticsService {
  public purchaseFlowUuid: string | undefined = undefined;

  public triggerContext: TRIGGERING_CONTEXT | undefined = undefined;

  public readonly ENUM_TRIGGERING_CONTEXT = TRIGGERING_CONTEXT;

  public readonly ENUM_VIEW_NAME = VIEW_NAME;

  public readonly ENUM_PURCHASE_EVENT_TYPE = PURCHASE_EVENT_TYPE;

  public readonly ENUM_VIEW_MESSAGE = VIEW_MESSAGE;

  public readonly ENUM_PURCHASE_STATUS = PURCHASE_STATUS;

  public readonly ENUM_CUSTOM_EVENT = CUSTOM_EVENT;

  private isFlowAbandoned = true;

  private isPageRefreshed = false;

  private isReferrerValid = false;

  /**
   * Only run when there is redirection, go back/forward might not trigger the constructor if page loaded from cache
   */
  constructor() {
    this.loadPreExistingCtx();
    this.setupEventListeners();
  }

  /**
   * Call startPaymentFlow when (if call directly)
   *   1. item purchase upsell happens
   *   2. special button clicked like Buy Robux
   *   3. landed on a special page directly without ctx
   *   4. button, who send events, clicked without ctx
   *
   * Recommended calling the following methods instead of calling directly
   *   - sendUserPurchaseFlowEvent
   *   - sendUserPurchaseStatusEvent
   * By doing so, we could initiate the flow even it lands randomly on pages at any steps.
   *
   * @param triggerContext
   */
  public startPaymentFlow(triggerContext: TRIGGERING_CONTEXT) {
    try {
      this.startPaymentFlowOrThrow(triggerContext);
    } catch (e) {
      fireEvent(COUNTER_EVENTS.START_FLOW_ERROR);
    }
  }

  private startPaymentFlowOrThrow(triggerContext: TRIGGERING_CONTEXT) {
    const flowUuid = uuidService.generateRandomUuid();
    if (this.purchaseFlowUuid) {
      // should not check the referrer, because we want to record 2 connected flows for refresh/type
      // this.triggerContext is pre-existing also being handle here
      this.sendUserPurchaseStatusEvent(
        triggerContext,
        PURCHASE_STATUS.EXISTING_FLOW_OVERWRITTEN_BY,
        flowUuid
      );
      fireEvent(COUNTER_EVENTS.EXISTING_FLOW_OVERWRITTEN_TRIGGERED);
    }
    this.purchaseFlowUuid = flowUuid;
    this.triggerContext = triggerContext;
    this.writePaymentFlowContextIntoCookie();
    this.sendUserPurchaseStatusEvent(triggerContext, PURCHASE_STATUS.PAYMENT_FLOW_STARTED);
    fireEvent(COUNTER_EVENTS.NEW_FLOW_INITIATED_PREFIX + this.triggerContext);
  }

  /**
   * Helper method for the upsell process to start a new flow
   * When item purchase upsell happens, we could use this method to start the flow to add asset type info
   *
   * @param assetType
   * @param isReseller
   * @param isPrivateServer
   * @param isPlace
   */
  public startRobuxUpsellFlow(
    assetType: ASSET_TYPE | string,
    isReseller = false,
    isPrivateServer = false,
    isPlace = false
  ) {
    if (assetType === ASSET_TYPE.GAME_PASS) {
      this.startPaymentFlow(TRIGGERING_CONTEXT.WEB_GAME_PASS_ROBUX_UPSELL);
    } else if (assetType === ASSET_TYPE.DEVELOPER_PRODUCT) {
      this.startPaymentFlow(TRIGGERING_CONTEXT.WEB_DEVELOPER_PRODUCT_ROBUX_UPSELL);
    } else if (assetType === ASSET_TYPE.PLACE) {
      this.startPaymentFlow(TRIGGERING_CONTEXT.WEB_PAID_GAME_ROBUX_UPSELL);
    } else if (assetType === ASSET_TYPE.PRIVATE_SERVER) {
      this.startPaymentFlow(TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_ROBUX_UPSELL);
    } else if (assetType === ASSET_TYPE.BUNDLE || assetType === ASSET_TYPE.PACKAGE) {
      this.startPaymentFlow(TRIGGERING_CONTEXT.WEB_CATALOG_BUNDLE_ITEM_ROBUX_UPSELL);
    } else if (isReseller) {
      this.startPaymentFlow(TRIGGERING_CONTEXT.WEB_CATALOG_COLLECTIVE_ITEM_ROBUX_UPSELL);
    } else {
      this.startPaymentFlow(TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL);
    }
  }

  /**
   * Send a user purchase flow event
   * This method could used to generate a new flow and overwrite an old flow
   *
   * When user enter into 1 page, there are 2 possibilities:
   *    1. pre-existing:
   *      We need to use the isMidPurchaseStep and referrer params to check if we need to start a new flow or not
   *    2. not pre-existing
   *      Create a new one flow.
   *      For step in middle of purchase, we shall check if this is generally used cases, if so, we need to investigate why
   *
   * When use this method, for flow event, it could be:
   *    1. starter-indicating event
   *        For starter-indicating action, we will pass in a trigger context, and generate a new flow if it's not pre-exising,
   *        or pre-existing but not the same trigger events
   *    2. middle-purchase-step possible event
   *        For a middle purchase step, if pre-existing && referrer valid, then use the pre-existing flow.
   *        A step could be a starter also a middle purchase step
   *           For example if the robux package list one is a starter if it's landing on that page.
   *           But it's a middle purchase step for upsell and when click from Buy Robux button
   *        If not, this should not happen if user use the payment system in sequence.
   *        If not, the triggerContext is only serve as a fallback to create a new flow.
   *         But we need to check this is generally used cases, if so, we need to investigate why
   *
   * For the state of referrer
   *    1. normal click exists
   *    2. go back/forward exists
   *    3. after refresh, it becomes empty
   *
   * @param triggerContext
   * @param isMidPurchaseStep
   *    MidPurchaseStep = true means there ways outside of the regular flow to reach certain steps
   *    in the purchasing flow that wouldn't have context
   *    For example: payment methods selection button, they all are MidPurchaseStep. Because, basically,
   *     all flow will go through that page on web, but user could reach that page by entering the URL.
   *     If reach by entering the URL, and no valid referrer, we will start a new flow using the triggerCtx
   *     passed in as fallback
   * @param viewName
   * @param purchaseEventType
   * @param viewMessage
   */
  public sendUserPurchaseFlowEvent(
    triggerContext: TRIGGERING_CONTEXT,
    isMidPurchaseStep = false,
    viewName?: VIEW_NAME,
    purchaseEventType?: PURCHASE_EVENT_TYPE,
    viewMessage?: VIEW_MESSAGE | string
  ) {
    try {
      this.updateFlowContinueStatus(purchaseEventType);
      this.sendUserPurchaseFlowEventOrThrow(
        triggerContext,
        isMidPurchaseStep,
        viewName,
        purchaseEventType,
        viewMessage
      );
    } catch (e) {
      fireEvent(COUNTER_EVENTS.SEND_USER_EVENT_ERROR);
    }
  }

  private sendUserPurchaseFlowEventOrThrow(
    triggerContext: TRIGGERING_CONTEXT,
    isMidPurchaseStep = false,
    viewName?: VIEW_NAME,
    purchaseEventType?: PURCHASE_EVENT_TYPE,
    viewMessage?: VIEW_MESSAGE | string
  ) {
    if (!viewName && !purchaseEventType && !viewMessage) {
      fireEvent(COUNTER_EVENTS.WRONG_USAGE_OF_METHOD);
      return;
    }
    if (!this.purchaseFlowUuid || !this.triggerContext) {
      if (isMidPurchaseStep) {
        fireEvent(COUNTER_EVENTS.MID_PURCHASE_STEP_TRIGGERED_WITHOUT_VALID_CTX);
      }
      this.startPaymentFlow(triggerContext);
      this.sendEvent(EVENT_NAME.USER_PURCHASE_FLOW, viewName, purchaseEventType, viewMessage);
      return;
    }

    // when uuid and ctx exist, and it's possible a mid purchase step
    //   1. if valid referrer exists, use the pre-existing uuid and ctx
    //   2. if valid referrer doesn't exist, create a new flow using the new trigger context as fallback ctx
    if (isMidPurchaseStep) {
      if (!this.existsValidReferrer() && !this.isPageRefreshed) {
        // refresh, type the url, from outside of our website
        fireEvent(COUNTER_EVENTS.MID_PURCHASE_STEP_TRIGGERED_WITHOUT_VALID_REFERRER);
        this.startPaymentFlow(triggerContext);
      }
      this.sendEvent(EVENT_NAME.USER_PURCHASE_FLOW, viewName, purchaseEventType, viewMessage);
      return;
    }

    // the trigger context pre-exists, and it's not a middle purchase step, start a new flow
    this.startPaymentFlow(triggerContext);
    this.sendEvent(EVENT_NAME.USER_PURCHASE_FLOW, viewName, purchaseEventType, viewMessage);
  }

  /**
   * Send a user purchase status event
   * A status event should never be used as flow starter but a middle of purchase state indicator
   *
   * @param triggerContext
   * @param status
   * @param viewMessage
   * @param viewName
   */
  public sendUserPurchaseStatusEvent(
    triggerContext: TRIGGERING_CONTEXT,
    status?: PURCHASE_STATUS,
    viewMessage?: string,
    viewName?: VIEW_NAME
  ) {
    try {
      this.sendUserPurchaseStatusEventOrThrow(triggerContext, status, viewMessage, viewName);
    } catch (e) {
      fireEvent(COUNTER_EVENTS.SEND_STATUS_EVENT_ERROR);
    }
  }

  private sendUserPurchaseStatusEventOrThrow(
    triggerContext: TRIGGERING_CONTEXT,
    status?: PURCHASE_STATUS,
    viewMessage?: string,
    viewName?: VIEW_NAME
  ) {
    if (!status && !viewMessage && !viewName) {
      fireEvent(COUNTER_EVENTS.WRONG_USAGE_OF_METHOD);
      return;
    }
    if (!this.purchaseFlowUuid || !this.triggerContext) {
      fireEvent(COUNTER_EVENTS.STATUS_EVENT_TRIGGERED_WITHOUT_CTX);
      this.startPaymentFlow(triggerContext);
    }

    this.sendEvent(EVENT_NAME.USER_PURCHASE_STATUS, viewName, undefined, viewMessage, status);
  }

  private writePaymentFlowContextIntoCookie() {
    if (!this.triggerContext || !this.purchaseFlowUuid) {
      fireEvent(COUNTER_EVENTS.WRONG_DATA_IN_COOKIE);
      return;
    }
    const flowCtx = new PaymentFlowContext(this.purchaseFlowUuid, this.triggerContext);
    flowCtx.save();
  }

  private sendEvent(
    eventName: EVENT_NAME,
    viewName?: VIEW_NAME,
    purchaseEventType?: PURCHASE_EVENT_TYPE,
    viewMessage?: VIEW_MESSAGE | string,
    status?: PURCHASE_STATUS,
    eventPros: { [key: string]: unknown } = {}
  ) {
    if (!this.purchaseFlowUuid || !this.triggerContext) {
      fireEvent(COUNTER_EVENTS.SEND_EVENT_WITHOUT_UUID_OR_CTX);
      return;
    }

    EventStream.SendEventWithTarget(
      eventName,
      this.triggerContext,
      {
        purchase_flow_uuid: this.purchaseFlowUuid,
        view_name: viewName,
        purchase_event_type: purchaseEventType,
        view_message: viewMessage,
        status,
        ...eventPros
      },
      EventStream.TargetTypes.WWW
    );
  }

  private loadPreExistingCtx() {
    try {
      // load pre-existing one from cookie
      const flowCtx = PaymentFlowContext.loadFromCookie();

      if (flowCtx) {
        this.purchaseFlowUuid = flowCtx.purchaseFlowUuid;
        this.triggerContext = flowCtx.triggeringContext;
      }
    } catch (e) {
      fireEvent(COUNTER_EVENTS.LOAD_PRE_EXISTING_CTX_ERROR);
    }
  }

  private existsValidReferrer() {
    const validReferrerRegex = new RegExp(`^https://[\\w.]*${EnvironmentUrls.domain}/`);
    return (
      (document.referrer && validReferrerRegex.test(document.referrer.toLowerCase())) ||
      this.isReferrerValid
    );
  }

  /**
   * Update isFlowAbandoned variable
   *
   * When a view shown (purchaseEventType == view shown), reset the page abandon status to true
   * Because it's possible that multiple actions happens on one page.
   * If a user input cause the redirect, then, we should not consider this is ABANDONED
   *
   * This is not 100% accurate, but it is accurate when browser is refresh or navigate
   * using the click behavior.
   *
   * @param purchaseEventType
   * @private
   */
  private updateFlowContinueStatus(purchaseEventType: PURCHASE_EVENT_TYPE) {
    this.isFlowAbandoned = purchaseEventType === PURCHASE_EVENT_TYPE.VIEW_SHOWN;
  }

  /**
   * Custom Event payment-user-journey:continue handler
   * Use case:
   *  When there is an auto-redirect transition like the post-payment-process page from paypal
   *  before the checkout success page. There will be only a status event,
   *  the success/failure page redirection shall not abandon a flow.
   *
   * @private
   */
  private handleManuallyContinueFlow() {
    this.isFlowAbandoned = false;
  }

  /**
   * Custom Event payment-user-journey:referrer-valid handler
   * The basic use case would be the same as the payment-user-journey:continue handler
   * But it has more wide and general for setting referrer is valid. For example:
   *  The user is landing on a mid-purchase-step page, we could set this referral to be valid,
   *  so that it will keep the flow.
   *
   * @private
   */
  private handleManuallySetReferrerValid() {
    this.isReferrerValid = true;
  }

  /**
   * Beware: the window.performance.navigation.type won't change after reaching the page there.
   * Thus, we can use this to set isPageRefreshed variable for the current page,
   * should not be used as how the user leaves the page
   *
   * @param type
   * @private
   */
  private static wasPageLoadOfType(type: PAGE_LOAD_TYPE) {
    try {
      if (window.performance.getEntriesByType) {
        const performanceEntries = window.performance.getEntriesByType('navigation');

        return performanceEntries
          .map(nav => ((nav as unknown) as { [key: string]: unknown }).type)
          .includes(type);
      }
      return PaymentFlowAnalyticsService.tryDeprecatedPageLoadOfType(type);
    } catch (e) {
      fireEvent(COUNTER_EVENTS.PERFORMANCE_NAVIGATION_TYPE_ERROR);
      return false;
    }
  }

  /**
   * Safari WebView doesn't support window.performance.getEntriesByType
   * but only supports the deprecated window.performance.navigation.type
   *
   * @param type
   * @private
   */
  private static tryDeprecatedPageLoadOfType(type: PAGE_LOAD_TYPE) {
    if (!window.performance.navigation) {
      return false;
    }
    switch (type) {
      case PAGE_LOAD_TYPE.BACK_FORWARD:
        return (
          window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD
        );
      case PAGE_LOAD_TYPE.NAVIGATE:
        return window.performance.navigation.type === window.performance.navigation.TYPE_NAVIGATE;
      case PAGE_LOAD_TYPE.RELOAD:
        return window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD;
      default:
        return false;
    }
  }

  /**
   * Mark if the page is from a refresh
   * If so, we shall not start a new flow or abandon an old flow
   *
   * @private
   */
  private handleRefresh() {
    if (!this.purchaseFlowUuid) {
      return;
    }
    if (PaymentFlowAnalyticsService.wasPageLoadOfType(PAGE_LOAD_TYPE.RELOAD)) {
      this.isPageRefreshed = true;
      this.sendUserPurchaseStatusEvent(
        this.triggerContext,
        PURCHASE_STATUS.BROWSER_PAGE_CHANGED,
        VIEW_MESSAGE.PAGE_REFRESHED
      );
      fireEvent(COUNTER_EVENTS.PAGE_REFRESHED);
      return;
    }
    this.isPageRefreshed = false;
  }

  /**
   * Handle browser go back or go forward or load the page from bf cache
   * Modern browser will load page from bf cache when go back/forward by button/swipe
   *
   * When go back and forward, the flow is not abandoned, the isFlowAbandoned is set to false.
   * Thus, when user leave the page, the flow won't be clear
   * Then after, user go back / forward, if the user is still going through the middle steps,
   * then it will continue the original flow, because the referrer won't be cleared when go back / forward
   *
   * @param event
   * @private
   */
  private handleGoBackForward(event: { [key: string]: unknown }) {
    if (!this.purchaseFlowUuid) {
      return;
    }
    if (
      event.persisted ||
      PaymentFlowAnalyticsService.wasPageLoadOfType(PAGE_LOAD_TYPE.BACK_FORWARD)
    ) {
      this.sendUserPurchaseStatusEvent(
        this.triggerContext,
        PURCHASE_STATUS.BROWSER_PAGE_CHANGED,
        event.persisted
          ? VIEW_MESSAGE.PAGE_LOADED_FROM_BACK_FORWARD_CACHE
          : VIEW_MESSAGE.BACK_FORWARD_DETECTED
      );
      fireEvent(
        event.persisted
          ? COUNTER_EVENTS.PAGE_LOADED_FROM_BACK_FORWARD_CACHE
          : COUNTER_EVENTS.BACK_FORWARD_DETECTED
      );
    }
  }

  private handleLeavingThePage() {
    if (!this.purchaseFlowUuid) {
      return;
    }
    // Without existsValidReferrer checking here it would be problematic.
    // Because it might end a desired flow, when it's in the middle of the flow.
    // Example: flow started, user enter the next desired page, and user refresh,
    // the flow will be cleared instead of recorded as refresh.
    //
    // However, adding existsValidReferrer would also be a little bit problematic, but much less.
    // Problem is that refresh won't clear the referral. Thus, refresh on a non related page, it won't clear
    // the cookie as long as they have a valid referrer.
    // However, this could used for the case, user went to a different page, but didn't dispatch event to continue
    // the flow. then, it will abandon the flow when it leaves that page.
    if (this.isFlowAbandoned && !this.existsValidReferrer()) {
      PaymentFlowContext.stop();
      this.sendUserPurchaseStatusEvent(this.triggerContext, PURCHASE_STATUS.ABANDONED);
      fireEvent(COUNTER_EVENTS.FLOW_ABANDONED_DETECTED);
    }
  }

  private setupEventListeners() {
    try {
      window.addEventListener('load', this.handleRefresh.bind(this));
      window.addEventListener('pageshow', this.handleGoBackForward.bind(this));
      window.addEventListener('beforeunload', this.handleLeavingThePage.bind(this));
      window.addEventListener(
        CUSTOM_EVENT.FLOW_CONTINUE,
        this.handleManuallyContinueFlow.bind(this)
      );
      window.addEventListener(
        CUSTOM_EVENT.FLOW_REFERRER_VALID,
        this.handleManuallySetReferrerValid.bind(this)
      );
    } catch (e) {
      fireEvent(COUNTER_EVENTS.EVENTS_REGISTER_ERROR);
    }
  }

  /**
   * Dispatch Custom Event helper method
   * Make the event dispatch work in IE 11
   *
   * CustomEvent is half-supported by IE11 but it has been polyfill-ed
   * But to avoid misuse in the future, use this method to dispatch event
   *
   * @param eventName
   */
  // eslint-disable-next-line class-methods-use-this
  public dispatchCustomEvent(eventName: CUSTOM_EVENT) {
    window.dispatchEvent(new CustomEvent(eventName));
  }
}

const paymentFlowAnalyticsService = new PaymentFlowAnalyticsService();

setupExternalEventListeners(paymentFlowAnalyticsService);

export default paymentFlowAnalyticsService;
