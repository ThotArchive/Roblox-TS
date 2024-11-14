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

  private viewName: string;

  private viewMessage: string;

  private eventMetadata: Record<string, string> = {};

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
    if (!this.purchaseFlowUuid) {
      // No existing flow Uuid, starting a new flow
      this.purchaseFlowUuid = uuidService.generateRandomUuid();
      this.triggerContext = triggerContext;
      this.writePaymentFlowContextIntoCookie();
      this.sendUserPurchaseStatusEvent(triggerContext, PURCHASE_STATUS.PAYMENT_FLOW_STARTED);
      fireEvent(COUNTER_EVENTS.NEW_FLOW_INITIATED_PREFIX + this.triggerContext);
    }
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
    isPlace = false,
    itemId = ''
  ) {
    this.eventMetadata.item_type = assetType;
    this.eventMetadata.item_id = itemId;

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
   * This method could used to generate a new flow, or continue the existing flow
   *
   * When user enter into 1 page, there are 2 possibilities:
   *    1. pre-existing:
   *      We will resume from the existing flow
   *    2. not pre-existing
   *      Create a new one flow
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
   * @param eventMetadata
   * @param isTerminalView
   */
  public sendUserPurchaseFlowEvent(
    triggerContext: TRIGGERING_CONTEXT,
    isMidPurchaseStep = false,
    viewName?: VIEW_NAME,
    purchaseEventType?: PURCHASE_EVENT_TYPE,
    viewMessage?: VIEW_MESSAGE | string,
    eventMetadata: Record<string, string> = {},
    isTerminalView = false
  ) {
    try {
      this.eventMetadata = { ...this.eventMetadata, ...eventMetadata };
      this.sendUserPurchaseFlowEventOrThrow(
        triggerContext,
        isMidPurchaseStep,
        viewName,
        purchaseEventType,
        viewMessage,
        isTerminalView
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
    viewMessage?: VIEW_MESSAGE | string,
    isTerminalView = false
  ) {
    if (!viewName && !purchaseEventType && !viewMessage) {
      fireEvent(COUNTER_EVENTS.WRONG_USAGE_OF_METHOD);
      return;
    }
    if ((!this.purchaseFlowUuid || !this.triggerContext) && isMidPurchaseStep) {
      fireEvent(COUNTER_EVENTS.MID_PURCHASE_STEP_TRIGGERED_WITHOUT_VALID_CTX);
    }

    this.startPaymentFlow(triggerContext);
    this.sendEvent(EVENT_NAME.USER_PURCHASE_FLOW, viewName, purchaseEventType, viewMessage);

    if (isTerminalView) {
      this.handleTerminalPage();
    }
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

    if (PaymentFlowAnalyticsService.isTerminalView(viewName)) {
      this.handleTerminalPage();
    }
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

    const referralUrl = window.document.referrer || window?.frames?.top?.document.referrer || '';
    const previousView = PaymentFlowAnalyticsService.extractView(referralUrl);
    const currentView = PaymentFlowAnalyticsService.extractView(window.location.href);
    const metadata = JSON.stringify(this.eventMetadata);
    this.viewName = viewName ?? this.viewName;
    this.viewMessage = viewMessage ?? this.viewMessage;

    EventStream.SendEventWithTarget(
      eventName,
      this.triggerContext,
      {
        purchase_flow_uuid: this.purchaseFlowUuid,
        view_name: this.viewName,
        purchase_event_type: purchaseEventType,
        view_message: this.viewMessage,
        status,
        refurl: referralUrl.substring(0, 200), // Max 200 should be sufficient for logging urls
        prev_view_path: previousView,
        current_view_path: currentView,
        event_metadata: metadata,
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

  private static extractView(referralUrl: string): string {
    if (!referralUrl) {
      return '';
    }

    const url = new URL(referralUrl);
    if (!url) {
      return '';
    }
    if (url.hostname.endsWith(`.${EnvironmentUrls.domain}`)) {
      return url.pathname;
    }

    return 'External';
  }

  /**
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
      this.sendUserPurchaseStatusEvent(
        this.triggerContext,
        PURCHASE_STATUS.BROWSER_PAGE_CHANGED,
        VIEW_MESSAGE.PAGE_REFRESHED
      );
      fireEvent(COUNTER_EVENTS.PAGE_REFRESHED);
    }
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

  private handleTerminalPage() {
    if (!this.purchaseFlowUuid) {
      return;
    }

    PaymentFlowContext.stop();
    this.sendUserPurchaseStatusEvent(this.triggerContext, PURCHASE_STATUS.PAYMENT_FLOW_ENDED);
    fireEvent(COUNTER_EVENTS.FLOW_ENDED);
  }

  private static isTerminalView(viewName: VIEW_NAME | string) {
    if (viewName && viewName === VIEW_NAME.CHECKOUT_SUCCESS) {
      return true;
    }

    return false;
  }

  private setupEventListeners() {
    try {
      window.addEventListener('load', this.handleRefresh.bind(this));
      window.addEventListener('pageshow', this.handleGoBackForward.bind(this));
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
