import modalModule from "../modalModule";

function modalController($log, $scope, $sce, $uibModalInstance, modalData, modalService) {
  "ngInject";

  $scope.modalData = modalData;

  $scope.closeActions = modalService.closeActions;

  // resolves modal instance promise.
  $scope.close = function close(isPositiveAction) {
    $uibModalInstance.close(isPositiveAction);
  };

  // rejects modal instance promise.
  $scope.dismiss = function dismiss() {
    $uibModalInstance.dismiss("dismissed");
  };
}

modalModule.controller("modalController", modalController);

export default modalController;
