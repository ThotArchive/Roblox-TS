import chatModule from '../chatModule';

function confirmRemoveMember(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      dialogLayout: '=',
      confirmCallback: '&'
    },
    templateUrl: resources.templates.confirmNegativeActionTemplate
  };
}

chatModule.directive('confirmRemoveMember', confirmRemoveMember);

export default confirmRemoveMember;
