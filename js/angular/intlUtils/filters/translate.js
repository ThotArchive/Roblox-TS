import intlUtilsModule from '../intlUtilsModule';

function translateFilter(languageResource, $log) {
  'ngInject';

  return function translate(langKey, params) {
    const message = languageResource.get(langKey, params);
    if (!message) {
      $log.debug(`Unable to translate key:${langKey}`);
      return '';
    }
    return message;
  };
}

intlUtilsModule.filter('translate', translateFilter);

export default translateFilter;
