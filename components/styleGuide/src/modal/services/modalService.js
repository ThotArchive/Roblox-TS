import angular from "angular";
import modalModule from "../modalModule";

function modalService($uibModal, modalOptions, modalStringService) {
  "ngInject";

  const defaults = angular.extend({}, modalStringService.params, modalOptions.params);

  function open(options) {
    const params = angular.extend({}, defaults, options);
    const modal = $uibModal.open({
      templateUrl: modalOptions.commonTemplateUrl,
      controller: modalOptions.commonController,
      windowClass: params.cssClass || "",
      animation: params.animation || modalOptions.defaults.animation,
      keyboard: params.keyboard || modalOptions.defaults.keyboard,
      backdrop: params.closeButtonShow ? true : "static",
      openedClass: params.openedClass || "modal-open-noscroll",
      resolve: {
        modalData: params,
      },
    });

    modal.result.then(angular.noop, angular.noop);

    return modal;
  }

  return {
    open,
  };
}

modalModule.service("modalService", modalService);

export default modalService;
