import { TranslationResourceProvider } from "@rbx/core-scripts/intl/translation";
import angular from "angular";

// Checks if an element is a descendant of an element with a specific class.
const isDescendantOfClass = (element, className) => {
  if (element.classList.contains(className)) {
    return true;
  }

  if (element.parentElement) {
    return isDescendantOfClass(element.parentElement, className);
  }

  return false;
};

const modal = angular
  .module("modal", ["ui.bootstrap", "modalHtmlTemplate"])
  .config([
    "$uibModalProvider",
    "$injector",
    ($uibModalProvider, $injector) => {
      $uibModalProvider.options.openedClass = "modal-open-noscroll";
      $uibModalProvider.options.animation = false;
      const languageResourceProvider = $injector.get("languageResourceProvider");
      const translationProvider = new TranslationResourceProvider();
      const controlsResources = translationProvider.getTranslationResource("CommonUI.Controls");

      languageResourceProvider.setTranslationResources([controlsResources]);
    },
  ])
  .run([
    "modalOptions",
    "$uibModalStack",
    "$rootScope",
    (modalOptions, $uibModalStack, $rootScope) => {
      const bindMousedownEventPerEachModal = $rootScope.$watch(
        () => document.querySelectorAll(modalOptions.layoutParams.modalSelector).length,
        val => {
          if (val > 0) {
            if (window.NodeList && !NodeList.prototype.forEach) {
              NodeList.prototype.forEach = Array.prototype.forEach;
            }
            document
              .querySelectorAll(modalOptions.layoutParams.modalSelector)
              .forEach(eachModal => {
                const topModal = $uibModalStack.getTop();
                if (topModal && topModal.value.backdrop !== modalOptions.backdropStatus.static) {
                  eachModal.addEventListener(modalOptions.userInteraction.mouseDown, e => {
                    if (
                      isDescendantOfClass(e.target, modalOptions.layoutParams.modalContentClass)
                    ) {
                      // mouse was clicked in the modal content itself, stop propagation
                      e.stopPropagation();
                    } else if (
                      e.button === modalOptions.mainButtonPressed &&
                      $uibModalStack.getTop().key
                    ) {
                      // bind mouse down event and only dismiss when click happens
                      $uibModalStack.getTop().key.dismiss();
                    }
                  });
                }
              });

            if ($uibModalStack.getTop()) {
              $uibModalStack.getTop().value.backdrop = modalOptions.backdropStatus.static; // disable dismiss
            }
          }
        },
      );
      $rootScope.$on("$destroy", () => {
        bindMousedownEventPerEachModal();
      });
    },
  ]);

export default modal;
