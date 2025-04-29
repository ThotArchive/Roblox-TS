import BANNER_TYPES from "../constants/bannerTypes";

const determineTimeout = (overrideTimeout, defaultTimeout, bannerText) => {
  if (overrideTimeout && typeof overrideTimeout === "number") {
    return overrideTimeout;
  }

  if (typeof defaultTimeout === "number") {
    return defaultTimeout;
  }

  if (typeof defaultTimeout === "function") {
    return defaultTimeout(bannerText);
  }

  return null;
};

const buildBannerOptions = (
  type,
  message,
  overrideTimeoutShow,
  overrideTimeoutHide,
  fallbackOptions,
) => {
  // validate types
  const bannerType = Object.values(BANNER_TYPES).includes(type) ? type : null;

  // determine messages
  let bannerText = message;
  if (!message) {
    switch (type) {
      case BANNER_TYPES.loading:
        bannerText = fallbackOptions.loadingMessage;
        break;
      case BANNER_TYPES.success:
        bannerText = fallbackOptions.successMessage;
        break;
      case BANNER_TYPES.warning:
        bannerText = fallbackOptions.warningMessage;
        break;
      default:
        break;
    }
  }

  // determine timeouts
  const { timeoutShow: defaultTimeoutShow, timeoutHide: defaultTimeoutHide } = fallbackOptions;
  // normal logic for show
  const timeoutShow = determineTimeout(overrideTimeoutShow, defaultTimeoutShow, bannerText);
  // special casing for warning, that allows user to opt out auto hide
  // as by default there will be a close button for warning banner
  const timeoutHide =
    bannerType === BANNER_TYPES.warning && overrideTimeoutHide == null
      ? null
      : determineTimeout(overrideTimeoutHide, defaultTimeoutHide, bannerText);

  return {
    bannerText,
    bannerType,
    timeoutShow,
    timeoutHide,
  };
};

export default { buildBannerOptions };
