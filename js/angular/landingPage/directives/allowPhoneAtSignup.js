import landingPageModule from '../landingPageModule';

function rbxAllowPhoneAtSignup() {
  'ngInject';

  return {
    require: 'ngModel',
    link(scope, ele, attrs, ctrl) {
      scope.$watch(
        () => {
          return scope.signup;
        },
        () => {
          if (!scope.contactMethodIsEmail && scope.isUnder13()) {
            scope.contactMethodIsEmail = true;
          }
        },
        true
      );
    }
  };
}
landingPageModule.directive('rbxAllowPhoneAtSignup', rbxAllowPhoneAtSignup);

export default rbxAllowPhoneAtSignup;
