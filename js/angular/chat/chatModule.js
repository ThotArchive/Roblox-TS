import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const dependencies = [
  'robloxApp',
  'monospaced.elastic',
  'modal',
  'ui.bootstrap.popover',
  'toast',
  'thumbnails',
  'userProfiles',
  'ngSanitize'
];
const contactsModule = 'contacts';

try {
  angular.module(contactsModule);
  dependencies.push(contactsModule);
} catch (err) {}

const chat = angular.module('chat', dependencies).config([
  'msdElasticConfig',
  'languageResourceProvider',
  function (msdElasticConfig, languageResourceProvider) {
    msdElasticConfig.append = '\n';
    const translationProvider = new TranslationResourceProvider();
    const chatResources = translationProvider.getTranslationResource('Feature.Chat');

    languageResourceProvider.setTranslationResources([chatResources]);
  }
]);

export default chat;
