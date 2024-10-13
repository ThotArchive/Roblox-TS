import { ReactSignupUtils } from 'Roblox';
import landingPageModule from '../landingPageModule.js';

function rbxValidUsername(languageResource) {
  'ngInject';

  return {
    require: 'ngModel',
    link(scope, ele, attrs, ctrl) {
      scope.signup.username = ele.val();
      scope.usernameValidationRequestNum = 0;

      scope.onChange = function () {
        const requestNum = ++scope.usernameValidationRequestNum;

        if (requestNum === 1) {
          if (scope.signupForm) {
            if (scope.signupForm.signupUsername && scope.signup.username) {
              scope.signupForm.signupUsername.$dirty = true;
            }
          } else if (scope.fbConnectForm) {
            if (scope.fbConnectForm.username && scope.signup.username) {
              scope.fbConnectForm.username.$dirty = true;
            }
          }
        }
        ReactSignupUtils.getUsernameValidationMessage(
          scope.signup.username,
          scope.signup.birthdayDay,
          scope.signup.birthdayMonth,
          scope.signup.birthdayYear
        ).then(function (result) {
          if (requestNum === scope.usernameValidationRequestNum) {
            if (result === '') {
              ctrl.$setValidity('validusername', true);
              ctrl.$validationMessage = '';
            } else {
              ctrl.$setValidity('validusername', false);
              ctrl.$validationMessage = languageResource.get(result);
            }
            scope.$apply();
          }
        });
      };
      // Validate on pageload
      scope.$evalAsync(function () {
        // Wait for angular to finish loading everything (like scope.signupForm.signupUsername) before checking inputs.
        scope.onChange();
      });
    }
  };
}

landingPageModule.directive('rbxValidUsername', rbxValidUsername);

export default rbxValidUsername;
