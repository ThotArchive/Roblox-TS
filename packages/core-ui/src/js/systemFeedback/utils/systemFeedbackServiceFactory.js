// TODO: old, migrated code
/* eslint-disable no-underscore-dangle */

import showBanner from "../actions/showBanner";
import hideBanner from "../actions/hideBanner";
import systemFeedbackUtil from "./systemFeedbackUtil";
import BANNER_TYPES from "../constants/bannerTypes";

class SystemFeedbackService {
  constructor(store, getOptions) {
    this.store = store;
    this.getOptions = getOptions;
  }

  _showBanner(type, message, overrideTimeoutShow, overrideTimeoutHide) {
    const fallbackOptions = this.getOptions();

    const { bannerText, bannerType, timeoutShow, timeoutHide } =
      systemFeedbackUtil.buildBannerOptions(
        type,
        message,
        overrideTimeoutShow,
        overrideTimeoutHide,
        fallbackOptions,
      );

    this.store.dispatch(dispatch => {
      if (timeoutShow !== null) {
        setTimeout(() => {
          dispatch(showBanner(bannerText, bannerType, bannerType === BANNER_TYPES.warning));

          if (timeoutHide !== null) {
            setTimeout(() => {
              dispatch(hideBanner());
            }, timeoutHide);
          }
        }, timeoutShow);
      }
    });
  }

  loading(message, overrideTimeoutShow, overrideTimeoutHide) {
    this._showBanner(BANNER_TYPES.loading, message, overrideTimeoutShow, overrideTimeoutHide);
  }

  success(message, overrideTimeoutShow, overrideTimeoutHide) {
    this._showBanner(BANNER_TYPES.success, message, overrideTimeoutShow, overrideTimeoutHide);
  }

  warning(message, overrideTimeoutShow, overrideTimeoutHide) {
    this._showBanner(BANNER_TYPES.warning, message, overrideTimeoutShow, overrideTimeoutHide);
  }

  clear() {
    this.store.dispatch(hideBanner());
  }
}

const create = (store, getOptions) => new SystemFeedbackService(store, getOptions);

export default { create };
