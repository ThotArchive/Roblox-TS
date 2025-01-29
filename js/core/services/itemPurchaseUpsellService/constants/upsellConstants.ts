export const GET_UPSELL_PRODUCT_API_URL = '/payments-gateway/v1/products/get-upsell-product';
export const UPGRADES_PAYMENT_METHODS_URL = '/upgrades/paymentmethods';
export const ROBLOX_TERMS_OF_USE_URL = '/info/terms';
export const ITEM_PURCHASE_AJAX_DATA_HTML_ELEMENT_ID = 'ItemPurchaseAjaxData';
export const GAMES_PAGE_PREFIX = '/games/';
export const CATALOG_ITEM_PAGE_PREFIX = '/catalog/';
export const BUNDLE_ITEM_PAGE_PREFIX = '/bundles/';
export const GAME_PASS_DETAIL_PAGE_PREFIX = '/game-pass/';
export const ITEM_CONTAINER_HTML_ELEMENT_ID = 'item-container';
export const GAME_PASS_STORE_TAB_ON_GAME_PAGE_HTML_ELEMENT_ID = 'tab-store';
export const PURCHASE_DIALOG_NAMESPACE = 'Purchasing.PurchaseDialog';
export const COMMON_UI_CONTROLS_NAMESPACE = 'CommonUI.Controls';
export const FEATURE_PREMIUM_NAMESPACE = 'Feature.Premium';
export const GET_USER_BALANCE_API = '/v1/users/{userId}/currency';
export const NEXT_GEN_PURCHASE_STATUS_API = '/v2/metadata/nextgen-purchase-status';
export const NEXT_GEN_PURCHASE_API = '/v1/products/{productId}/purchase';
export const GAME_PASS_PURCHASE_API = '/game-passes/v1/game-passes/{productId}/purchase';
export const ORIGINAL_PURCHASE_API = '/v1/purchases/products/{productId}';
export const GET_PRODUCT_INFO_API = '/v1/products/{productId}';
export const GET_PURCHASE_WARNING_API = '/purchase-warning/v1/purchase-warnings';
export const ACK_PURCHASE_WARNING_API = '/purchase-warning/v1/purchase-warnings/acknowledge';
export const COLLECTIBLE_ITEM_PURCHASE_API =
  '/marketplace-sales/v1/item/{collectibleItemId}/purchase-item';
export const COLLECTIBLE_ITEM_INSTANCE_PURCHASE_API =
  '/marketplace-sales/v1/item/{collectibleItemId}/purchase-resale';
export const PRODUCT_INFO_API_SUCCESS_REASON = 'Success';
export const PURCHASE_WARNING_REQUEST_TIMEOUT = 5000;

export const PERIODICAL_BALANCE_CHECK_INTERVAL_TIME = 1000;
export const PERIODICAL_BALANCE_CHECK_RETRY_TIMES = 5; // extend to 20 seconds polling, avoid failing on STx

export const ASSET_TYPE_ENUM = {
  GAME_PASS: 'Game Pass',
  BUNDLE: 'Bundle',
  BUNDLE_ALIAS: 'Package',
  PRIVATE_SERVER: 'Private Server'
  // the itemType of bundle item is Bundle, the assetType is Package in the cshtml
  // but in the product API, the asset type of bundle item is Bundle...
  // not gonna dig into it why, just check both for the bundle items whenever it's a package
};

export const THUMBNAIL_APIS = {
  GAME_PASS: '/v1/game-passes',
  BUNDLE: '/v1/bundles/thumbnails',
  ASSET: '/v1/assets'
};

export const THUMBNAIL_DEFAULT_REQUEST_PARAMS = {
  size: '150x150',
  format: 'Png',
  isCircular: false
};

export const LANG_KEYS = {
  backToShopAction: 'Action.BackToShop',
  buyRobuxAndItemAction: 'Action.BuyRobuxAndItem',
  buyRobux: 'Action.BuyRobux',
  cancelAction: 'Action.Cancel',
  equipMyAvatarAction: 'Action.EquipMyAvatar',
  goToRobuxStoreAction: 'Action.GoToRobuxStore',
  insufficientRobuxHeading: 'Heading.InsufficientRobux',
  insufficientRobuxMessage: 'Message.InsufficientRobux',
  insufficientRobuxLeaveRobloxHeading: 'Heading.InsufficientRobuxLeaveRoblox',
  insufficientRobuxAskToPurchasePackageMessage: 'Message.InsufficientRobuxAskToPurchasePackage',
  insufficientRobuxExceedLargestPackageMessage: 'Message.InsufficientRobuxExceedLargestPackage',
  insufficientRobuxRedirectToExternalPartner: 'Message.InsufficientRobuxRedirectToExternalPartner',
  purchaseSucceededHeading: 'Heading.PurchaseSucceeded',
  purchaseSucceededMessage: 'Message.PurchaseSucceeded',
  purchaseSucceededRobuxBalanceMessage: 'Message.PurchaseSucceededRobuxBalance',
  purchasingTheItemLabel: 'Label.PurchasingTheItem',
  waitingForRobuxLabel: 'Label.WaitingForRobux',
  errorOccuredHeading: 'Heading.ErrorOccured',
  purchasingUnavailableMessage: 'Message.PurchasingUnavailable',
  purchaseErrorOccuredMessage: 'Message.PurchaseErrorOccured',
  okAction: 'Action.Ok',
  commonUiOkAction: 'Action.OK',
  commonUiCancelAction: 'Action.Cancel',
  commonUiContinueToPaymentAction: 'Action.ContinueToPayment',
  featurePremiumScaryModalTitleHeading: 'Heading.ScaryModalTitle',
  featurePremiumScaryModalBodyNewDescription: 'Description.ScaryModalBodyNew',
  featurePremiumScaryModalBody13To17Description: 'Description.ScaryModalBody13To17',
  featurePremiumScaryModalThreshold1BodyDescription: 'Description.ScaryModalThreshold1Body',
  featurePremiumScaryModalThreshold2BodyDescription: 'Description.ScaryModalThreshold2Body'
};

export const PURCHASE_WARNING_ACTION_TYPES = {
  U13PaymentModal: 'U13PaymentModal',
  ParentalConsentWarningPaymentModal13To17: 'ParentalConsentWarningPaymentModal13To17',
  ParentalAuthorization13To17: 'ParentalAuthorization13To17',
  U13MonthlyThreshold1Modal: 'U13MonthlyThreshold1Modal',
  RequireEmailVerification: 'RequireEmailVerification',
  U13MonthlyThreshold2Modal: 'U13MonthlyThreshold2Modal',
  NoAction: 'NoAction'
};

export const ITEM_UPSELL_EVENTS = {
  EVENT_NAME: 'ItemPurchaseUpsellEvent',
  CONTEXT_NAME: {
    COOKIE_PARSE_FAILED: 'COOKIE_PARSE_FAILED',
    PRODUCT_INFO_REQUEST_FAILED: 'PRODUCT_INFO_REQUEST_FAILED',
    PRODUCT_INFO_EMPTY: 'PRODUCT_INFO_EMPTY',
    PRODUCT_ID_NOT_EXIST: 'PRODUCT_ID_NOT_EXIST',
    UPSELL_FAILED: 'UPSELL_FAILED'
  }
};

export const UPSELL_COUNTER_CATALOG_PREFIX = 'WebCatalog';
export const UPSELL_COUNTER_BUNDLE_PREFIX = 'WebBundle';
export const UPSELL_COUNTER_GAME_PASS_PREFIX = 'WebGamePass';
export const UPSELL_COUNTER_NO_TYPE_PARSED_PLACEHOLDER = 'NoTypeParsedYet';
export const UPSELL_COUNTER_NAMES = {
  UnknownError: 'UnknownError',
  UnknownErrorNoAsset: 'UnknownErrorNoAsset',

  UpsellShown: 'UpsellShown',
  UpsellCancelled: 'UpsellCancelled',
  UpsellCancelledFromU13Modal: 'UpsellCancelledFromU13Modal',
  UpsellContinued: 'UpsellContinued',
  UpsellThumbnailProcessFailed: 'UpsellThumbnailProcessFailed',

  ContinueBuyRobuxOnExternalSite: 'ContinueBuyRobuxOnExternalSite',
  LeaveRobloxFailedToShown: 'LeaveRobloxFailedToShown',
  CancelledFromLeaveRobloxModal: 'CancelledFromLeaveRobloxModal',
  ConfirmLeaveRobloxModal: 'ConfirmLeaveRobloxModal',

  UpsellExceedLargestEntryPoint: 'UpsellExceedLargestEntryPoint',
  UpsellExceedLargestShown: 'UpsellExceedLargestShown',
  UpsellExceedLargestCancelled: 'UpsellExceedLargestCancelled',
  UpsellExceedLargestGoToRobuxStoreClicked: 'UpsellExceedLargestGoToRobuxStoreClicked',
  UpsellExceedLargestModalExpTrue: 'UpsellExceedLargestModalExpTrue',
  UpsellExceedLargestModalExpFalse: 'UpsellExceedLargestModalExpTrue',
  UpsellExceedLargestModalExpError: 'UpsellExceedLargestModalExpError',
  UpsellExceedLargestMetadataError: 'UpsellExceedLargestMetadataError',
  UpsellExceedLargestNoThumbnailImage: 'UpsellExceedLargestNoThumbnailImage',

  UpsellFromGamesPage: 'UpsellFromGamesPage',

  UpsellFailed: 'UpsellFailed',
  UpsellFailedDueToNoAvailablePackage: 'UpsellFailedDueToNoAvailablePackage',
  UpsellFailedDueToFailedPackageRequest: 'UpsellFailedDueToFailedPackageRequest',

  AutoPurchaseEntryPoint: 'AutoPurchaseEntryPoint',
  AutoPurchaseStarted: 'AutoPurchaseStarted',
  AutoPurchaseSucceed: 'AutoPurchaseSucceed',
  AutoPurchaseSucceedClose: 'AutoPurchaseSucceedClose',
  AutoPurchaseSucceedBackToShop: 'AutoPurchaseSucceedBackToShop',
  AutoPurchaseSucceedEquipMyAvatar: 'AutoPurchaseSucceedEquipMyAvatar',
  AutoPurchaseFailed: 'AutoPurchaseFailed',
  AutoPurchaseErrorFromPurchaseApi: 'AutoPurchaseErrorFromPurchaseApi',
  AutoPurchaseFailedDueToStillLowBalance: 'AutoPurchaseFailedDueToStillLowBalance',
  AutoPurchasePotentialHackingActionSpotted: 'AutoPurchasePotentialHackingActionSpotted',
  AutoPurchasePotentialHackingActionSpotted2: 'AutoPurchasePotentialHackingActionSpotted2',
  AutoPurchasePotentialHackingActionSpotted3: 'AutoPurchasePotentialHackingActionSpotted3',
  AutoPurchasePotentialHackingActionSpotted4: 'AutoPurchasePotentialHackingActionSpotted4',

  ShowU13PaymentModal: 'ShowU13PaymentModal',
  ShowU13MonthlyThreshold1Modal: 'ShowU13MonthlyThreshold1Modal',
  ShowU13MonthlyThreshold2Modal: 'ShowU13MonthlyThreshold2Modal',
  ShowParentalConsentWarningPaymentModal13To17Modal:
    'ShowParentalConsentWarningPaymentModal13To17Modal',
  ConfirmU13PaymentModal: 'ConfirmU13PaymentModal',
  ConfirmU13MonthlyThreshold1Modal: 'ConfirmU13MonthlyThreshold1Modal',
  ConfirmU13MonthlyThreshold2Modal: 'ConfirmU13MonthlyThreshold2Modal',
  ConfirmParentalConsentWarningPaymentModal13To17Modal:
    'ConfirmParentalConsentWarningPaymentModal13To17Modal',
  U13PaymentModalEmailVerificationTriggered: 'U13PaymentModalEmailVerificationTriggered',
  U13PaymentModalFailedToShow: 'U13PaymentModalFailedToShow',
  U13PaymentModalNoAction: 'U13PaymentModalNoAction'
};

export const GET_VNG_BUY_ROBUX_BEHAVIOR_URL = '/v1/behaviors/vng-buy-robux/content';
export const GET_VNG_SHOP_URL_PATH = '/vng-payments/v1/getVngShopUrl';
