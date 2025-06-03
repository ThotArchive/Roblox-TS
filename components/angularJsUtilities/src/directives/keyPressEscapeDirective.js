import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function keyPressEscape() {
  "ngInject";
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if (event.which === 27) {
        scope.$apply(function () {
          scope.$eval(attrs.keyPressEscape);
        });
        event.preventDefault();
      }
    });
  };
}

angularJsUtilitiesModule.directive("keyPressEscape", keyPressEscape);
export default keyPressEscape;
