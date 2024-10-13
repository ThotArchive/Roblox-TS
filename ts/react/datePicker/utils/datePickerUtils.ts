import { CustomLocale } from 'flatpickr/dist/types/locale';
import FlatpickrLanguages from 'flatpickr/dist/l10n';
import { languageCodeMap } from '../constants/datePickerConstants';

export const getDatePickerLocale = (languageCode: string): CustomLocale => {
  const flatPickrLocaleCode = languageCodeMap[languageCode];
  const locale: CustomLocale = FlatpickrLanguages[flatPickrLocaleCode];

  if (!locale) {
    return FlatpickrLanguages.default;
  }

  return locale;
};

export default {
  getDatePickerLocale
};
