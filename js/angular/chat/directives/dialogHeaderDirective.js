import chatModule from '../chatModule';

function dialogHeader(resources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: resources.templates.dialogHeader
  };
}

chatModule.directive('dialogHeader', dialogHeader);

export default dialogHeader;
