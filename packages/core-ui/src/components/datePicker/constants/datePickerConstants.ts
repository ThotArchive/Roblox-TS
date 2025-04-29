import FlatpickrLanguages from "flatpickr/dist/l10n";
import { Plugin } from "flatpickr/dist/types/options";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import weekSelectPlugin from "flatpickr/dist/plugins/weekSelect/weekSelect";
import PluginType from "../enums/PluginType";

export const languageCodeMap: Record<string, keyof typeof FlatpickrLanguages> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ko: "ko",
  "zh-hans": "zh",
  "zh-hant": "zh_tw",
  ja: "ja",
};

export const pluginMap: Record<PluginType, Plugin> = {
  [PluginType.MonthSelect]: monthSelectPlugin({
    shorthand: true,
  }),
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  [PluginType.WeekSelect]: weekSelectPlugin() as Plugin,
};

export default {
  languageCodeMap,
  pluginMap,
};
