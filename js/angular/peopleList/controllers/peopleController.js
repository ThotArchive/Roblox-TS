import angular from 'angular';
import peopleListModule from '../peopleListModule';

function peopleController($scope, $log, resources) {
  'ngInject';

  $scope.setupHoverPopover = function() {
    $scope.peopleInfoCardPlacement = 'bottom';
    $scope.peopleInfoCardTemplateUrl = resources.templateUrls.peopleInfoCard;
    $scope.peopleInfoCardContainerClass =
      $scope.friend.presence && $scope.friend.presence.placeUrl
        ? resources.peopleInfoCardContainerClass
        : '';
    $scope.hoverPopoverParams = angular.copy(resources.hoverPopoverParams);
    $scope.hoverPopoverParams.triggerSelector = `#people-${$scope.friend.id}`;
    $scope.hoverPopoverParams.hoverPopoverSelector = `.people-info-${$scope.friend.id}`;
    $scope.hoverPopoverParams.isDisabled =
      $scope.hoverPopoverParams.isDisabled || !$scope.library.isForCurrentUsersFriends;
  };

  $scope.init = function() {
    $scope.setupHoverPopover();
  };

  $scope.init();
}

peopleListModule.controller('peopleController', peopleController);

export default peopleController;
