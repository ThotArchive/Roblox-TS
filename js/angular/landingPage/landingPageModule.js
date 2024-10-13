import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const landingPage = angular
  .module('landingPage', ['robloxApp', 'modal', 'captchaV2', 'roblox.formEvents'])
  .config([
    'languageResourceProvider',
    function (languageResourceProvider) {
      const translationProvider = new TranslationResourceProvider();
      const signUpResources = translationProvider.getTranslationResource('Authentication.SignUp');
      const captchaResources = translationProvider.getTranslationResource('Common.Captcha');
      const controlsResources = translationProvider.getTranslationResource('CommonUI.Controls');
      const landingResources = translationProvider.getTranslationResource('Feature.Landing');
      const idVerificationResources = translationProvider.getTranslationResource(
        'Feature.IdVerification'
      );

      languageResourceProvider.setTranslationResources([
        signUpResources,
        captchaResources,
        controlsResources,
        landingResources,
        idVerificationResources
      ]);
    }
  ]);

export default landingPage;
