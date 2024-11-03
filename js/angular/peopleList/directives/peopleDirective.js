import peopleListModule from '../peopleListModule';

function people(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    replace: true,
    templateUrl: resources.templateUrls.people
  };
}

peopleListModule.directive('people', people);

export default people;
