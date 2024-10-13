import landingPageModule from '../landingPageModule.js';

function signup() {
  return {
    restrict: 'A',
    replace: false,
    templateUrl: 'signup',
    controller: 'signupController',
    link(scope) {
      scope.isSignupFormDarkThemeEnabled = scope.$parent.isSignupFormDarkThemeEnabled;
      scope.birthdayToPrefill = scope.$parent.birthdayToPrefill;
      scope.isKoreaIdVerificationEnabled = scope.$parent.isKoreaIdVerificationEnabled;
      scope.returnUrl = scope.$parent.returnUrl;
    },
    scope: {
      showGenderIcons: '='
    }
  };
}

landingPageModule.directive('signup', signup);

export default signup;
