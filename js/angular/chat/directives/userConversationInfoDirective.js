import chatModule from '../chatModule';

function userConversationInfo(resources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: resources.templates.userConversationInfoTemplate
  };
}

chatModule.directive('userConversationInfo', userConversationInfo);

export default userConversationInfo;
