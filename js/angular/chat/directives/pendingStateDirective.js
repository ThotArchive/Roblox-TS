import chatModule from '../chatModule';

function pendingState(resources) {
  'ngInject';

  return {
    restrict: 'A',
    templateUrl: resources.templates.pendingStateTemplate
  };
}

chatModule.directive('pendingState', pendingState);

export default pendingState;
