import chatModule from '../chatModule';

function chatAvatarHeadshot(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      userId: '@',
      className: '@',
      layoutLibrary: '='
    },
    templateUrl: resources.templates.chatAvatarHeadshot
  };
}

chatModule.directive('chatAvatarHeadshot', chatAvatarHeadshot);

export default chatAvatarHeadshot;
