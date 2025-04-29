import chatModule from '../chatModule';

function details(resources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: resources.templates.detailsTemplate
  };
}

chatModule.directive('details', details);

export default details;
