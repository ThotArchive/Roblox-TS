import angular from 'angular';
import chatModule from '../chatModule';

function linkCardMessagesController($scope, pinGameLayout) {
  'ngInject';

  $scope.pinGameLayout = angular.copy(pinGameLayout);
  $scope.linkCardMessages = $scope.message.linkCardMessages;
}

chatModule.controller('linkCardMessagesController', linkCardMessagesController);

export default linkCardMessagesController;
