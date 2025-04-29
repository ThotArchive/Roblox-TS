import chatModule from '../chatModule';

function contactCard(resources) {
  'ngInject';

  return {
    restrict: 'A',
    templateUrl: resources.templates.contactCardTemplate
  };
}

chatModule.directive('contactCard', contactCard);

export default contactCard;
