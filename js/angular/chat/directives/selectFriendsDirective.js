import angular from 'angular';
import chatModule from '../chatModule';

function selectFriends(chatUtility, resources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    templateUrl: resources.templates.selectFriendsTemplate,
    link(scope, element, attrs) {
      let setInviteBtnState = function() {
        if (
          angular.isUndefined(scope.dialogData) ||
          angular.isUndefined(scope.dialogData.selectedUserIds)
        ) {
          return false;
        }
        if (scope.dialogData.dialogType === chatUtility.dialogType.NEWGROUPCHAT) {
          scope.dialogLayout.inviteBtnDisabled = scope.dialogData.selectedUserIds.length < 2;
        } else {
          scope.dialogLayout.inviteBtnDisabled = scope.dialogData.selectedUserIds.length === 0;
        }
      };

      setInviteBtnState();

      scope.$watch(
        function() {
          return scope.dialogData && scope.dialogData.selectedUserIds;
        },
        function() {
          setInviteBtnState();
        },
        true
      );
    }
  };
}

chatModule.directive('selectFriends', selectFriends);

export default selectFriends;
