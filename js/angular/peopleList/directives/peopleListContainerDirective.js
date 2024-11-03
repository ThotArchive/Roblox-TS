import peopleListModule from '../peopleListModule';

function peopleListContainer(resources, $rootScope) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    replace: true,
    templateUrl: resources.templateUrls.peopleListContainer,
    link() {
      $rootScope.isFriendsListLoaded = true;
    }
  };
}

peopleListModule.directive('peopleListContainer', peopleListContainer);

export default peopleListContainer;
