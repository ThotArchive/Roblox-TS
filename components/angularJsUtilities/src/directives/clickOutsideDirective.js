import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function clickOutside($document, $parse) {
  "ngInject";
  return {
    restrict: "A",
    link: function (scope, element, attr) {
      var anyOtherClickFunction = $parse(attr["clickOutside"]);
      var documentClickHandler = function (event) {
        var eventOutsideTarget =
          element[0] !== event.target && element.find(event.target).length === 0;
        if (eventOutsideTarget) {
          scope.$apply(function () {
            anyOtherClickFunction(scope, {});
          });
        }
      };

      $document.on("click", documentClickHandler);
      scope.$on("$destroy", function () {
        $document.off("click", documentClickHandler);
      });
    },
  };
}

angularJsUtilitiesModule.directive("clickOutside", clickOutside);
export default clickOutside;
