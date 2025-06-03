import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function toggleLoading() {
  "ngInject";
  return {
    restrict: "A",
    link(scope, element, attrs) {
      var displayInline = attrs.isInline;
      var loadingHtml =
        '<div class="spinner spinner-sm spinner-no-margin' +
        (displayInline ? "" : " spinner-block") +
        '"></div>';
      var loaderElement = angular.element(loadingHtml);
      element.after(loaderElement);
      loaderElement.hide();

      var unwatchIsLoading = scope.$watch(
        attrs.isLoading,
        function (newVal, oldVal) {
          if (newVal !== oldVal) {
            if (newVal) {
              var elementHeight = element[0].offsetHeight;
              var elementWidth = element[0].offsetWidth;
              loaderElement.css("height", elementHeight + "px");
              loaderElement.css("width", elementWidth + "px");
              element.hide();
              loaderElement.show();
            } else {
              element.show();
              loaderElement.hide();
            }
          }
        },
        true,
      );

      scope.$on("$destroy", function () {
        if (unwatchIsLoading) {
          unwatchIsLoading();
        }
      });
    },
  };
}

angularJsUtilitiesModule.directive("toggleLoading", toggleLoading);
export default toggleLoading;
