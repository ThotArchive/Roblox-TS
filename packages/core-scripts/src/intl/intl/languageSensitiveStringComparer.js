// private helper method for setting up language sensitive compare
const isIntlCollatorAvailable = () => typeof Intl.Collator !== "undefined";

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#Check_browser_support_for_extended_arguments
const isStringLocaleCompareAvailable = () => {
  if (typeof String.prototype.localeCompare !== "undefined") {
    try {
      "foo".localeCompare("bar", "i");
    } catch (e) {
      return e.name === "RangeError";
    }
  }
  return false;
};

const defaultStringCompare = (leftStr, rightStr) => {
  if (leftStr < rightStr) {
    return -1;
  }

  if (leftStr > rightStr) {
    return 1;
  }

  return 0;
};

const getLanguageSensitiveStringComparer = locale => {
  // always prefer Intl.Collator since it is faster and supports larger sets of language
  if (isIntlCollatorAvailable()) {
    return new Intl.Collator(locale).compare;
  }
  // if not, see if we can use String.prototype.localeCompare
  if (isStringLocaleCompareAvailable()) {
    return (leftStr, rightStr) => leftStr.localeCompare(rightStr, locale);
  }
  // default compare as fallback for old browsers or browsers that do not support
  // "locales" optional argument in its localeCompare implementation

  return defaultStringCompare;
};

export default getLanguageSensitiveStringComparer;
