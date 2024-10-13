import angularJsUtilitiesModule from '../angularJsUtilitiesModule';

function pairedName() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      displayName: '@',
      userName: '@'
    },
    templateUrl: 'paired-name'
  };
}

angularJsUtilitiesModule.directive('pairedName', pairedName);
export default pairedName;
