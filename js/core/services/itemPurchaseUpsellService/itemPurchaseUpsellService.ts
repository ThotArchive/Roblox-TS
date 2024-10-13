import {
  Intl,
  RobloxIntlInstance,
  RobloxTranslationResource,
  RobloxTranslationResourceProviderInstance,
  TranslationResourceProvider
} from 'Roblox';
import { AxiosResponse } from 'core-utilities';
import { upsellUtil, paymentFlowAnalyticsService } from 'core-roblox-utilities';
import {
  InsufficientFundsErrorObject,
  ItemDetailElementDataset,
  ItemDetailObject,
  ItemPurchaseAjaxDataObject,
  ItemPurchaseObject,
  UpsellProduct,
  UpsellServiceState
} from './constants/serviceTypeDefinitions';
import {
  GAME_PASS_STORE_TAB_ON_GAME_PAGE_HTML_ELEMENT_ID,
  GAMES_PAGE_PREFIX,
  ITEM_CONTAINER_HTML_ELEMENT_ID,
  ITEM_PURCHASE_AJAX_DATA_HTML_ELEMENT_ID,
  ITEM_UPSELL_EVENTS,
  LANG_KEYS,
  PERIODICAL_BALANCE_CHECK_INTERVAL_TIME,
  PERIODICAL_BALANCE_CHECK_RETRY_TIMES,
  PURCHASE_DIALOG_NAMESPACE,
  UPSELL_COUNTER_NAMES,
  UPSELL_COUNTER_NO_TYPE_PARSED_PLACEHOLDER
} from './constants/upsellConstants';
import fetchAvailableUpsellProduct from './utils/startItemUpsell/fetchAvailableUpsellProduct';
import openNewInsufficientRobuxModal from './modals/openNewInsufficientRobuxModal';
import LoadingOverlay from './components/LoadingOverlay';
import {
  validateEnvSettings,
  preProcessData
} from './utils/autoPurchase/autoPurchaseProcessHelpers';
import initiateAutoPurchaseItem from './utils/autoPurchase/initiateAutoPurchaseItem';
import fetchUserBalance from './utils/autoPurchase/fetchUserBalance';
import openTryAgainLaterErrorModal from './modals/openTryAgainLaterErrorModal';
import { invalidateCurrentAutoPurchaseFlow } from './utils/common/invalidationHelpers';
import PreProcessThumbnailUrl from './utils/startItemUpsell/startItemUpsellHelpers';
import reportCounter from './utils/common/reportCounter';
import sendEvent from './utils/common/sendEvent';
import openInsufficientRobuxExceedLargestPackageModal from './modals/openInsufficientRobuxExceedLargestPackageModal';
import getShouldShowVng from './api/universalAppConfiguration';
import openVngInsufficientRobuxModal from './modals/openVngInsufficientRobuxModal';

export default class ItemPurchaseUpsellService {
  private readonly intl: RobloxIntlInstance;

  private readonly intlProvider: RobloxTranslationResourceProviderInstance;

  private readonly translationResource: RobloxTranslationResource;

  private readonly loadingOverlay: LoadingOverlay;

  private _state: UpsellServiceState = {
    purchased: false,
    retryRemainTimes: PERIODICAL_BALANCE_CHECK_RETRY_TIMES,
    timeoutHandle: null
  };

  constructor() {
    this.intl = new Intl();
    this.intlProvider = new TranslationResourceProvider(this.intl);
    this.translationResource = this.intlProvider.getTranslationResource(PURCHASE_DIALOG_NAMESPACE);
    this.loadingOverlay = new LoadingOverlay();
  }

  public async startItemUpsellProcess(
    errorObject: InsufficientFundsErrorObject,
    itemDetail: ItemDetailObject,
    startOriginalFlowCallback: (e?: InsufficientFundsErrorObject) => void,
    itemPurchaseDataElementMap = document.getElementById(ITEM_PURCHASE_AJAX_DATA_HTML_ELEMENT_ID)
      ?.dataset
  ): Promise<InsufficientFundsErrorObject | void> {
    const itemPurchaseAjaxData = itemPurchaseDataElementMap as
      | ItemPurchaseAjaxDataObject
      | undefined;
    if (!itemPurchaseAjaxData) {
      startOriginalFlowCallback(errorObject);
      return Promise.reject(errorObject);
    }
    const pathMatches: RegExpMatchArray | null = upsellUtil.constants.UPSELL_TARGET_ITEM_URL_REGEX.exec(
      window.location.pathname
    );

    upsellUtil.constants.UPSELL_TARGET_ITEM_URL_REGEX.lastIndex = 0; // regex pointer rewind

    if (Array.isArray(pathMatches)) {
      try {
        const shouldShowVng: boolean = await getShouldShowVng();
        if (shouldShowVng) {
          paymentFlowAnalyticsService.startRobuxUpsellFlow(
            itemDetail.buyButtonElementDataset?.assetType ?? '',
            !!itemDetail.buyButtonElementDataset?.userassetId,
            itemDetail.buyButtonElementDataset?.isPrivateServer ?? false,
            itemDetail.buyButtonElementDataset?.isPlace ?? false
          );
          itemPurchaseAjaxData.thumbnailImageUrl = PreProcessThumbnailUrl(
            itemPurchaseAjaxData,
            itemDetail.buyButtonElementDataset
          );
          openVngInsufficientRobuxModal(
            itemDetail,
            itemPurchaseAjaxData,
            this.translationResource,
            this.intlProvider
          );
          return Promise.resolve();
        }

        const upsellProductResponse: AxiosResponse<UpsellProduct> = await fetchAvailableUpsellProduct(
          itemPurchaseAjaxData,
          itemDetail
        );
        if (upsellProductResponse.status === 200) {
          paymentFlowAnalyticsService.startRobuxUpsellFlow(
            itemDetail.buyButtonElementDataset?.assetType ?? '',
            !!itemDetail.buyButtonElementDataset?.userassetId,
            itemDetail.buyButtonElementDataset?.isPrivateServer ?? false,
            itemDetail.buyButtonElementDataset?.isPlace ?? false
          );
          itemPurchaseAjaxData.thumbnailImageUrl = PreProcessThumbnailUrl(
            itemPurchaseAjaxData,
            itemDetail.buyButtonElementDataset
          );
          openNewInsufficientRobuxModal(
            errorObject,
            itemDetail,
            itemPurchaseAjaxData,
            upsellProductResponse.data,
            this.intl,
            this.translationResource,
            this.intlProvider
          );
          return Promise.resolve();
        }
        if (upsellProductResponse.status === 204) {
          reportCounter(
            UPSELL_COUNTER_NAMES.UpsellFailedDueToNoAvailablePackage,
            itemDetail.buyButtonElementDataset?.assetType
          );
        } else {
          reportCounter(
            UPSELL_COUNTER_NAMES.UpsellFailedDueToFailedPackageRequest,
            itemDetail.buyButtonElementDataset?.assetType
          );
        }
      } catch (e) {
        reportCounter(
          UPSELL_COUNTER_NAMES.UpsellFailed,
          itemDetail.buyButtonElementDataset?.assetType
        );
        startOriginalFlowCallback(errorObject);
        return Promise.reject(e);
      }
    }

    startOriginalFlowCallback(errorObject);
    return Promise.reject(errorObject);
  }

  public showExceedLargestInsufficientRobuxModal(
    robuxShortfallPrice: number,
    itemDetailDataset: ItemDetailElementDataset,
    startOriginalInsufficientFundsViewCallback: () => void,
    itemPurchaseDataElementMap = document.getElementById(ITEM_PURCHASE_AJAX_DATA_HTML_ELEMENT_ID)
      ?.dataset
  ) {
    reportCounter(UPSELL_COUNTER_NAMES.UpsellExceedLargestEntryPoint, itemDetailDataset?.assetType);
    const itemPurchaseAjaxData = itemPurchaseDataElementMap as
      | ItemPurchaseAjaxDataObject
      | undefined;
    if (!itemPurchaseAjaxData?.imageurl) {
      reportCounter(
        UPSELL_COUNTER_NAMES.UpsellExceedLargestNoThumbnailImage,
        itemDetailDataset?.assetType
      );
      startOriginalInsufficientFundsViewCallback();
      return;
    }
    try {
      paymentFlowAnalyticsService.startRobuxUpsellFlow(
        itemDetailDataset?.assetType ?? '',
        !!itemDetailDataset?.userassetId,
        itemDetailDataset?.isPrivateServer ?? false,
        itemDetailDataset?.isPlace ?? false
      );
      openInsufficientRobuxExceedLargestPackageModal(
        robuxShortfallPrice,
        itemPurchaseAjaxData.imageurl,
        itemDetailDataset,
        this.translationResource
      );
      reportCounter(
        UPSELL_COUNTER_NAMES.UpsellExceedLargestModalExpTrue,
        itemDetailDataset?.assetType
      );
    } catch (e) {
      reportCounter(
        UPSELL_COUNTER_NAMES.UpsellExceedLargestModalExpError,
        itemDetailDataset?.assetType
      );
      startOriginalInsufficientFundsViewCallback();
    }
  }

  public async initiateAutoPurchase(
    itemAbsolutePath: string,
    purchaseCallback: ((obj: { [k: string]: unknown }) => Promise<void>) | null | undefined,
    itemPurchaseDataElement = document.getElementById(ITEM_PURCHASE_AJAX_DATA_HTML_ELEMENT_ID),
    itemContainerElement = document.getElementById(ITEM_CONTAINER_HTML_ELEMENT_ID) // not such an element with id item container on the game page
  ): Promise<void> {
    // init state
    this._state = {
      purchased: false,
      retryRemainTimes: PERIODICAL_BALANCE_CHECK_RETRY_TIMES,
      timeoutHandle: null
    };

    this.loadingOverlay.show();
    reportCounter(
      UPSELL_COUNTER_NAMES.AutoPurchaseEntryPoint,
      UPSELL_COUNTER_NO_TYPE_PARSED_PLACEHOLDER // it will record as catalog, but this metric would serve the purpose of finding how many users redirected back
    );

    // Step 1. Process and collect pre-existing data from HTML element
    validateEnvSettings(itemAbsolutePath); // basic validation
    const itemPurchaseObj = await preProcessData(
      itemContainerElement,
      itemContainerElement?.dataset,
      itemPurchaseDataElement?.dataset,
      itemAbsolutePath
    );
    const purchasingItemLabel = this.translationResource.get(LANG_KEYS.purchasingTheItemLabel, {});
    const currentBalance = itemPurchaseObj.userBalance;
    const expectedItemPrice = itemPurchaseObj.expectedPrice;

    try {
      // Step 2. if game page, switch the tab
      if (itemAbsolutePath.startsWith(GAMES_PAGE_PREFIX)) {
        document.getElementById(GAME_PASS_STORE_TAB_ON_GAME_PAGE_HTML_ELEMENT_ID)?.click();
      }

      // Step 3. first attempt to purchase using the balance from the HTML Element dataset
      if (currentBalance > expectedItemPrice) {
        // purchase if already enough robux
        this.loadingOverlay.updateMessage(purchasingItemLabel);
        await initiateAutoPurchaseItem(
          itemPurchaseObj,
          purchaseCallback,
          this.loadingOverlay,
          this.translationResource
        );
        this._state.purchased = true;
        return Promise.resolve();
      }
      // Step 4. second attempt to purchase using the balance fetched from server
      // initiate periodical checking using recursive calls
      await this._checkBalanceAndPurchase(itemPurchaseObj, purchaseCallback);
    } catch (e) {
      reportCounter(UPSELL_COUNTER_NAMES.AutoPurchaseFailed, itemPurchaseObj?.assetType);
      sendEvent(ITEM_UPSELL_EVENTS.CONTEXT_NAME.UPSELL_FAILED, {
        itemPurchaseObj,
        error: e as unknown
      });
      invalidateCurrentAutoPurchaseFlow();
    }
    return Promise.resolve();
  }

  private _checkBalanceAndPurchase = async (
    itemPurchaseObj: ItemPurchaseObject,
    purchaseCallback: ((obj: { [k: string]: unknown }) => Promise<void>) | null | undefined
  ): Promise<void> => {
    if (this._state.purchased) {
      return Promise.resolve();
    }
    try {
      const waitingForRobuxGranted = this.translationResource.get(
        LANG_KEYS.waitingForRobuxLabel,
        {}
      );
      this.loadingOverlay.updateMessage(waitingForRobuxGranted);
      const balance = await fetchUserBalance();

      // eslint-disable-next-line no-param-reassign
      itemPurchaseObj.userBalance = balance;

      if (balance >= itemPurchaseObj.expectedPrice) {
        await initiateAutoPurchaseItem(
          itemPurchaseObj,
          purchaseCallback,
          this.loadingOverlay,
          this.translationResource
        );
        this._stopPeriodicChecking();
        this._state.purchased = true;
      }

      if (!this._state.purchased) {
        if (this._state.retryRemainTimes > 0) {
          // recursively check for remaining times
          this._state.timeoutHandle = setTimeout(async () => {
            await this._checkBalanceAndPurchase(itemPurchaseObj, purchaseCallback);
          }, PERIODICAL_BALANCE_CHECK_INTERVAL_TIME);

          this._state.retryRemainTimes -= 1;
        } else {
          // Make sure a try-again error show up if the auto-purchase failed after retry used up
          reportCounter(
            UPSELL_COUNTER_NAMES.AutoPurchaseFailedDueToStillLowBalance,
            itemPurchaseObj?.assetType
          );
          this._processGenericErrorState(itemPurchaseObj);
        }
      }
    } catch (e) {
      reportCounter(UPSELL_COUNTER_NAMES.AutoPurchaseFailed, itemPurchaseObj?.assetType);
      this._processGenericErrorState(itemPurchaseObj);
    }
    return Promise.resolve();
  };

  private _stopPeriodicChecking = () => {
    if (this._state.timeoutHandle) {
      clearTimeout(this._state.timeoutHandle);
      this._state.timeoutHandle = null;
    }
  };

  private _processGenericErrorState = (itemPurchaseObj: ItemPurchaseObject) => {
    this.loadingOverlay.hide();
    openTryAgainLaterErrorModal(itemPurchaseObj, this.translationResource);
    invalidateCurrentAutoPurchaseFlow();
  };
}
