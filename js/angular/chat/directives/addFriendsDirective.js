import chatModule from '../chatModule';

function addFriends(resources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    templateUrl: resources.templates.addFriendsTemplate
  };
}

chatModule.directive('addFriends', addFriends);

export default addFriends;
