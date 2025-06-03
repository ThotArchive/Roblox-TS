import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function onFinishRender($timeout) {
  "ngInject";
  return {
    restrict: "A",
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit(attr.onFinishRender);
        });
      }
    },
  };
}

angularJsUtilitiesModule.directive("onFinishRender", onFinishRender);
export default onFinishRender;
