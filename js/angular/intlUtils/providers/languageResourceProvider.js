import angular from 'angular';
import { Intl, TranslationResourceProvider } from 'Roblox';
import intlUtilsModule from '../intlUtilsModule';

function languageResourceProvider() {
  const intl = new Intl();
  let translationResources = null;

  const getFromTranslationResources = (resourceKey, params) => {
    if (translationResources === null) {
      throw new Error('Translation resources is not properly initialized');
    }

    // delegate to the combined translation resources
    return translationResources.get(resourceKey, params);
  };

  const getFromTranslationResourcesOrLangObject = (resourceKey, params) => {
    let translation = null;

    // Get from translation resources
    if (translationResources !== null) {
      translation = getFromTranslationResources(resourceKey, params);
      if (translation) {
        return translation;
      }
    }

    // Translation not found
    // eslint-disable-next-line no-console
    console.warn(
      `Language key '${resourceKey}' not found. Please check for any typo or a missing key.`
    );
    return '';
  };

  this.setTranslationResources = resources => {
    const combinedTranslationResources = TranslationResourceProvider.combineTranslationResources(
      intl,
      ...resources
    );

    if (translationResources !== null) {
      translationResources = TranslationResourceProvider.combineTranslationResources(
        intl,
        translationResources,
        combinedTranslationResources
      );
    } else {
      translationResources = combinedTranslationResources;
    }
  };

  this.$get = [
    function languageResource() {
      return {
        get: getFromTranslationResourcesOrLangObject,
        intl
      };
    }
  ];
}

intlUtilsModule.provider('languageResource', languageResourceProvider);

export default languageResourceProvider;
