export const DEFAULT_FIAT_PRICE_TAG_ELEMENT_ID_SELECTOR = '#fiat-price-tag';
export const DEFAULT_FIAT_PRICE_TAG_ELEMENTS_CLASSNAME_SELECTOR = '.fiat-price-tag';

export const RENDER_PRICE_TAGS_CUSTOM_EVT = 'price-tag:render';

export const ARABIC_LOCALE = 'ar-';
export const DEFAULT_LOCALE = 'en-';

export const MINUS_SIGN = '-';
export const NOTATION_COMPACT_APPLY_THRESHOLD = 10000;
export const NOTATION_CURRENCY_CODE_EXCLUDE_LIST = ['JPY'];

export const NAVBAR_COMPACT_CLASS = 'navbar-compact';
export const NAVBAR_COMPACT_MAX_SIG_FIG = 4;

const COUNTER_PREFIX = 'PriceTag';
export const COUNTERS = {
  PRICE_DATA_NOT_VALID: `${COUNTER_PREFIX}DataNotValid`,
  NUMBER_FORMAT_LOCALE_EXCEPTION: `${COUNTER_PREFIX}NumberFormatLocaleException`,
  ARABIC_LOCALE_TRIGGERED: `${COUNTER_PREFIX}ArabicLocale`
};
