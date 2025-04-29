import chatModule from '../chatModule';

function confirmNegativeAction(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      chatLibrary: '=',
      dialogLayout: '=',
      confirmCallback: '&'
    },
    templateUrl: resources.templates.confirmNegativeActionTemplate
  };
}

chatModule.directive('confirmNegativeAction', confirmNegativeAction);

export default confirmNegativeAction;
