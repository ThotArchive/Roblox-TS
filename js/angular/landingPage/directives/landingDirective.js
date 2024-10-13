import landingPageModule from '../landingPageModule';

function landingPageContainer(landingPageConstants) {
  'ngInject';

  return {
    restrict: 'A',
    replace: false,
    templateUrl: landingPageConstants.templates.landingPage,
    controller: 'landingPageController',
    link: function link(scope, element, attrs) {
      scope.landingParams = {};
      scope.isSignupFormDarkThemeEnabled = attrs.isSignupFormDarkThemeEnabled === 'true';
      scope.birthdayToPrefill = attrs.prefillBirthday;
      scope.isKoreaIdVerificationEnabled = attrs.isKoreaIdVerificationEnabled === 'true';
      scope.returnUrl = attrs.returnUrl;
    },
    scope: {}
  };
}
landingPageModule.directive('landingPageContainer', landingPageContainer);

export default landingPageModule;
