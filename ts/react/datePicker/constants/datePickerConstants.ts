import FlatpickrLanguages from 'flatpickr/dist/l10n';
import { Plugin } from 'flatpickr/dist/types/options';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import weekSelectPlugin from 'flatpickr/dist/plugins/weekSelect/weekSelect';
import PluginType from '../enums/PluginType';

export const languageCodeMap: { [key: string]: keyof typeof FlatpickrLanguages } = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  pt: 'pt',
  ko: 'ko',
  'zh-hans': 'zh',
  'zh-hant': 'zh_tw',
  ja: 'ja'
};

export const pluginMap: { [key in PluginType]: Plugin<{}> } = {
  [PluginType.MonthSelect]: monthSelectPlugin({
    shorthand: true
  }),
  [PluginType.WeekSelect]: weekSelectPlugin() as Plugin<{}>
};

export default {
  languageCodeMap,
  pluginMap
};
