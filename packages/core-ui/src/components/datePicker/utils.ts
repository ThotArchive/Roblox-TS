import { CustomLocale } from "flatpickr/dist/types/locale";
import FlatpickrLanguages from "flatpickr/dist/l10n";
import { languageCodeMap } from "./constants/datePickerConstants";

export const getDatePickerLocale = (languageCode: string): CustomLocale => {
  const flatPickrLocaleCode = languageCodeMap[languageCode];
  const locale = flatPickrLocaleCode == null ? null : FlatpickrLanguages[flatPickrLocaleCode];

  if (locale == null) {
    return FlatpickrLanguages.default;
  }

  return locale;
};
