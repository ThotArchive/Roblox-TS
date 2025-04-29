import chatModule from '../chatModule';

function chatGameIcon(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      universeId: '@',
      className: '@',
      layoutLibrary: '='
    },
    templateUrl: resources.templates.chatGameIcon
  };
}

chatModule.directive('chatGameIcon', chatGameIcon);

export default chatGameIcon;
