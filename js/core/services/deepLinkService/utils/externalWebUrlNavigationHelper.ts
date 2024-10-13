export type ZendeskDeepLinkParams = {
  articleId?: string;
  domain: string;
  locale?: string;
  type?: string;
};

const getExternalLocale = (locale: string): string => {
  // zendesk supported languages https://support.zendesk.com/hc/en-us/articles/4408821324826-Zendesk-language-support-by-product
  const specialCaseLocaleMap: { [key: string]: string } = {
    'zh-cn': 'zh-cn',
    zh_cn: 'zh-cn',
    'zh-cjv': 'zh-cn',
    zh_cjv: 'zh-cn',
    'zh-hans': 'zh-cn',
    zh_hans: 'zh-cn',
    'zh-tw': 'zh-tw',
    zh_tw: 'zh-tw',
    'zh-hant': 'zh-tw',
    zh_hant: 'zh-tw',
    'en-us': 'en-us',
    en_us: 'en-us',
    en: 'en-us',
    'en-gb': 'en-gb',
    en_gb: 'en-gb',
    'fr-ca': 'fr-ca',
    fr_ca: 'fr-ca',
    nb: 'no',
    'nb-no': 'no',
    nb_no: 'no'
  };

  if (specialCaseLocaleMap[locale]) {
    return specialCaseLocaleMap[locale];
  }

  const localeArray: string[] = locale.split(/[^a-zA-Z0-9]/).filter(Boolean);

  if (localeArray[0]) {
    return localeArray[0];
  }

  return 'en';
};
const isValidLocale = (locale?: string): boolean => {
  // valid if alphanumeric and hyphen or underscore
  if (locale) {
    return /^[a-zA-Z0-9-_]+$/.test(locale);
  }
  return false;
};

const isValidArticleId = (articleId?: string): boolean => {
  // valid if alphanumeric
  if (articleId) {
    return /^[a-zA-Z0-9]+$/.test(articleId);
  }
  return false;
};

const getZendeskUrl = (params: ZendeskDeepLinkParams): string => {
  // eslint-disable-next-line camelcase
  const { articleId, locale } = params;

  let url = 'https://en.help.roblox.com/hc/';
  if (isValidLocale(locale)) {
    url += getExternalLocale(locale);
  } else {
    url += 'en-us';
  }

  if (isValidArticleId(articleId)) {
    url += `/articles/${articleId}`;
  }
  return url;
};

export { getZendeskUrl, isValidLocale, isValidArticleId };
