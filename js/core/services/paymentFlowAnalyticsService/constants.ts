export const COOKIE_NAME = 'RBXPaymentsFlowContext';
export const COOKIE_TIMESPAN = 7200;
export const COOKIE_REGEX = new RegExp(`^(?:.*; |)${COOKIE_NAME}=([^,]+),([^;]+)(?:;.*|)$`);

export const enum EVENT_NAME {
  USER_PURCHASE_FLOW = 'UserPurchaseFlow',
  USER_PURCHASE_STATUS = 'UserPurchaseStatus'
}

export enum TRIGGERING_CONTEXT {
  WEB_ROBUX_PURCHASE = 'WebRobuxPurchase',
  WEB_PREMIUM_PURCHASE = 'WebPremiumPurchase',
  WEB_CATALOG_ROBUX_UPSELL = 'WebCatalogRobuxUpsell',
  WEB_CATALOG_PREMIUM_UPSELL = 'WebCatalogPremiumUpsell',
  WEB_CATALOG_COLLECTIVE_ITEM_ROBUX_UPSELL = 'WebCatalogCollectiveItemRobuxUpsell',
  WEB_CATALOG_BUNDLE_ITEM_ROBUX_UPSELL = 'WebCatalogBundleItemRobuxUpsell',
  WEB_PAID_GAME_ROBUX_UPSELL = 'WebPaidGameRobuxUpsell',
  WEB_GAME_PASS_ROBUX_UPSELL = 'WebGamePassRobuxUpsell',
  WEB_PRIVATE_SERVER_ROBUX_UPSELL = 'WebPrivateServerRobuxUpsell',
  WEB_CATALOG_CART_ROBUX_UPSELL = 'WebCatalogCartRobuxUpsell',
  WEBVIEW_ROBUX_PURCHASE = 'WebViewRobuxPurchase',
  WEBVIEW_PREMIUM_PURCHASE = 'WebViewPremiumPurchase'
}

export enum VIEW_NAME {
  ROBUX_UPSELL = 'RobuxUpsell',
  ROBUX_UPSELL_EXCEED_LARGEST_PACKAGE = 'RobuxUpsellExceedLargestPackage',
  PURCHASE_WARNING = 'PurchaseWarning',
  LEAVE_ROBLOX_WARNING = 'LeaveRobloxWarning',
  PREMIUM_DISCLOSURES = 'PremiumDisclosures',
  PRODUCT_PURCHASE = 'ProductPurchase',
  PRODUCT_PURCHASE_ONE_CLICK_PAY = 'ProductPurchaseOneClickPay',
  PREMIUM_PURCHASE = 'PremiumPurchase',
  MEMBERSHIP = 'Membership',
  MEMBERSHIP_ANGULAR = 'MembershipAngular',
  PREMIUM_UPSELL = 'PremiumUpsell',
  PAYMENT_METHOD = 'PaymentMethod',
  NAVIGATION_MENU = 'NavigationMenu',
  PREPARE_PAYMENT_ERROR_OCCURED = 'PreparePaymentErrorOccured',
  XSOLLA = 'Xsolla',
  XSOLLA_OTHER = 'Xsolla Other',
  XSOLLA_SAVED_PAYMENT_METHOD = 'Xsolla SavedCard',
  PAYPAL_POST_PROCESS = 'Paypal Post Process',
  BRAINTREE_POST_PROCESS = 'Braintree Post Process',
  ROBLOX_CREDIT = 'Roblox Credit',
  ROBLOX_CREDIT_CAPTCHA = 'Roblox Credit Captcha',
  LOADING = 'Loading',
  CHECKOUT_SUCCESS = 'Checkout Success',
  SUCCESS = 'Success',
  ERROR = 'Error',
  NAVIGATION_ROBUX_TEXT = 'NavigationRobuxText',
  NAVIGATION_DROPDOWN_MENU = 'NavigationDropdownMenu',
  LEFT_NAVIGATION_BAR = 'LeftNavigationBar',
  TRANSACTION_PAGE = 'TransactionPage',
  CATALOG_LIST_PAGE = 'CatalogListPage',
  ROBLOX_CREDIT_SETTING_BILLING_PAGE = 'RobloxCreditBillingPage',
  REDEEM_PAGE = 'RedeemPage'
}

export enum PURCHASE_EVENT_TYPE {
  VIEW_SHOWN = 'ViewShown',
  USER_INPUT = 'UserInput'
}

export enum VIEW_MESSAGE {
  SUBMIT_ORDER = 'Submit Order',
  REDEEM = 'Redeem',
  BUY_ROBUX = 'Buy Robux',
  BUY_ROBUX_AND_ITEM = 'Buy Robux and Item',
  BUY_GIFT_CARD = 'Buy Gift Card',
  CONTINUE_TO_CASHSTAR = 'Continue to Cashstar',
  CONTINUE_TO_VNG = 'Continue to Vng',
  EXTERNAL_LINK_MODAL = 'External Link Modal',
  CANCEL = 'Cancel',
  CONTINUE = 'Continue',
  BACK = 'Back',
  CARD_NUMBER_FORM = 'Card Number Form',
  PAY_NOW = 'Pay Now',
  PROCEED_TO_CHECKOUT = 'Proceed to Checkout',
  SEND_RECEIPT_TO_EMAIL = 'Send receipt to email',
  OPEN_EXTERNAL_LINK = 'External Link',
  PAYMENT_METHOD_LIST = 'Other payment method list',
  GIFT_CARD = 'Gift Card',
  OK = 'OK',
  PREMIUM = 'Premium',
  GET_PREMIUM = 'Get Premium',
  GO_TO_ROBUX_STORE = 'Go To Robux Store',
  U13_PAYMENT_MODAL = 'U13PaymentModal',
  U13_PARENTAL_CONSENT_WARNING = 'U13ParentalConsentWarning',
  PAYMENT_MODAL_13_TO_17 = 'PaymentModal13To17',
  U13_MONTHLY_THRESHOLD_1_MODAL = 'U13MonthlyThreshold1Modal',
  U13_MONTHLY_THRESHOLD_2_MODAL = 'U13MonthlyThreshold2Modal',
  REQUIRE_EMAIL_VERIFICATION = 'RequireEmailVerification',
  PURCHASE = 'PURCHASE',
  REQUIRE_TWO_STEP_VERIFICATION = 'RequireTwoStepVerification',
  ROBUX_ICON = 'Robux Icon',
  PAGE_REFRESHED = 'PageRefreshed',
  BACK_FORWARD_DETECTED = 'Back/Forward Triggered',
  PAGE_LOADED_FROM_BACK_FORWARD_CACHE = 'Back/Forward Triggered & Loaded From Cache',
  GO_TO_ROBUX_PURCHASE_PAGE = 'Go to Robux Purchase Page',
  BILLING_EMAIL_NOT_PREFILLED = 'Billing Email Not Prefilled',
  CREDIT_CONVERSION = 'Credit Conversion'
}

export enum PURCHASE_STATUS {
  ABANDONED = 'Abandoned',
  FAILED_PRECHECK = 'FailedPrecheck',
  EXISTING_FLOW_OVERWRITTEN_BY = 'ExistingFlowOverwrittenBy',
  PAYMENT_FLOW_STARTED = 'PaymentFlowStarted',
  BROWSER_PAGE_CHANGED = 'BrowserPageChanged',
  CAPTCHA = 'Captcha',
  SUCCESS = 'Success',
  ERROR = 'Error',
  CONTINUE = 'Continue',
  CANCEL = 'Cancel'
}

export const enum ASSET_TYPE {
  GAME_PASS = 'Game Pass',
  PRIVATE_SERVER = 'Private Server',
  BUNDLE = 'Bundle',
  PACKAGE = 'Package',
  PLACE = 'Place'
}

const COUNTER_PREFIX = 'UserPaymentFlow';
export const COUNTER_EVENTS = {
  WRONG_USAGE_OF_METHOD: `${COUNTER_PREFIX}WrongUsageOfMethod`,
  PRE_LOADED_FROM_COOKIE: `${COUNTER_PREFIX}PreLoadedFromCookie`,
  EXISTING_FLOW_OVERWRITTEN_TRIGGERED: `${COUNTER_PREFIX}ExistingFlowOverwrittenTriggered`,
  NEW_FLOW_INITIATED_PREFIX: `${COUNTER_PREFIX}NewFlowInitiatedFor`,
  WRONG_DATA_IN_COOKIE: `${COUNTER_PREFIX}WrongDataInCookie`,
  STATUS_EVENT_TRIGGERED_WITHOUT_CTX: `${COUNTER_PREFIX}StatusEventTriggeredWithoutCtx`,
  MID_PURCHASE_STEP_TRIGGERED_WITHOUT_VALID_REFERRER: `${COUNTER_PREFIX}MidPurchaseStepTriggeredWithoutValidReferrer`,
  MID_PURCHASE_STEP_TRIGGERED_WITH_REFRESH: `${COUNTER_PREFIX}MidPurchaseStepTriggeredWithRefresh`,
  MID_PURCHASE_STEP_TRIGGERED_WITHOUT_VALID_CTX: `${COUNTER_PREFIX}MidPurchaseStepTriggeredWithoutCtx`,
  SEND_EVENT_WITHOUT_UUID_OR_CTX: `${COUNTER_PREFIX}SendEventWithoutUuidOrCtx`,
  FLOW_ABANDONED_DETECTED: `${COUNTER_PREFIX}FlowAbandoned`,
  PAGE_REFRESHED: `${COUNTER_PREFIX}PageRefreshed`,
  BACK_FORWARD_DETECTED: `${COUNTER_PREFIX}BackForwardDetected`,
  PAGE_LOADED_FROM_BACK_FORWARD_CACHE: `${COUNTER_PREFIX}BackForwardDetectedLoadedFromCache`,
  LOAD_PRE_EXISTING_CTX_ERROR: `${COUNTER_PREFIX}LoadPreExistingCtxError`,
  SEND_STATUS_EVENT_ERROR: `${COUNTER_PREFIX}SendStatusEventError`,
  SEND_USER_EVENT_ERROR: `${COUNTER_PREFIX}SendUserEventError`,
  START_FLOW_ERROR: `${COUNTER_PREFIX}StartFlowError`,
  EVENTS_REGISTER_ERROR: `${COUNTER_PREFIX}EventsRegisterError`,
  PERFORMANCE_NAVIGATION_TYPE_ERROR: `${COUNTER_PREFIX}PerformanceNavigationTypeError`
};

export enum CUSTOM_EVENT {
  FLOW_CONTINUE = 'payment-user-journey:continue',
  FLOW_REFERRER_VALID = 'payment-user-journey:referrer-valid'
}

export enum PAGE_LOAD_TYPE {
  NAVIGATE = 'navigate',
  RELOAD = 'reload',
  BACK_FORWARD = 'back_forward'
}
