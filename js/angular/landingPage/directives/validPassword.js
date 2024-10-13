import { Resources, ReactSignupUtils, SignupFormValidatorGeneric } from 'Roblox';
import landingPageModule from '../landingPageModule';

function rbxValidPassword(languageResource) {
  'ngInject';

  return {
    require: 'ngModel',
    link(scope, ele, attrs, ctrl) {
      scope.$watch(
        function () {
          if (angular.isUndefined(ctrl.$modelValue)) {
            return false;
          }
          const invalidPasswordMessage = SignupFormValidatorGeneric.getInvalidPasswordMessage(
            ctrl.$modelValue,
            scope.signup.username
          );
          if (invalidPasswordMessage === null) {
            return false;
          }
          if (invalidPasswordMessage === '') {
            return invalidPasswordMessage;
          }
          if (ctrl.$modelValue === ctrl.$passwordThatFailedServerCheck) {
            return Resources.AnimatedSignupFormValidator.useDifferentPasswordCharactersOrNumbers;
          }
          return invalidPasswordMessage;
        },
        function (currentValue) {
          ctrl.$setValidity('password', angular.isString(ctrl.$modelValue) && currentValue === '');
          ctrl.$validationMessage = angular.isString(ctrl.$modelValue)
            ? currentValue
            : Resources.AnimatedSignupFormValidator.passwordRequired;
          scope.$unitTestValidationMessage = ctrl.$validationMessage; // For unit tests
        }
      );
    }
  };
}
landingPageModule.directive('rbxValidPassword', rbxValidPassword);

export default rbxValidPassword;
