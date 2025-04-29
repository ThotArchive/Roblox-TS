import chatModule from '../chatModule';

function linkCard(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    replace: true,
    templateUrl: resources.templates.linkCard
  };
}

chatModule.directive('linkCard', linkCard);

export default linkCard;
