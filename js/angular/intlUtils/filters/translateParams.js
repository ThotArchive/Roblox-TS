import intlUtilsModule from '../intlUtilsModule';

function translateParamsFilter(languageResource, $log) {
  'ngInject';

  return function translateParams(langKey, params) {
    const translatedParams = {};
    // Params should be the language resource keys for the parameter in the main string
    // ie. Label.ItemType
    // eslint-disable-next-line no-restricted-syntax
    for (const item in params) {
      if (Object.prototype.hasOwnProperty.call(params, item)) {
        const translatedParam = languageResource.get(params[item]);
        if (!translatedParam) {
          $log.debug(`Unable to translate key:${params[item]}`);
          return '';
        }
        translatedParams[item] = translatedParam;
      }
    }

    const message = languageResource.get(langKey, translatedParams);
    if (!message) {
      $log.debug(`Unable to translate key:${langKey}`);
      return '';
    }
    return message;
  };
}

intlUtilsModule.filter('translateParams', translateParamsFilter);

export default translateParamsFilter;
