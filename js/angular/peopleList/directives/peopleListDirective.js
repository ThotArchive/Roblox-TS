import peopleListModule from '../peopleListModule';

function peopleList(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    replace: true,
    templateUrl: resources.templateUrls.peopleList
  };
}

peopleListModule.directive('peopleList', peopleList);

export default peopleList;
