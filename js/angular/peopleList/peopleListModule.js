import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const peopleList = angular
  .module('peopleList', [
    'peopleListHtmlTemplateApp',
    'robloxApp',
    'ui.bootstrap',
    'thumbnails',
    'userProfiles'
  ])
  .config([
    'languageResourceProvider',
    languageResourceProvider => {
      const translationProvider = new TranslationResourceProvider();
      const peopleListResources = translationProvider.getTranslationResource('Feature.PeopleList');

      languageResourceProvider.setTranslationResources([peopleListResources]);
    }
  ]);

export default peopleList;
