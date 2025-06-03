import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function keyPressEnter() {
  "ngInject";
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.keyPressEnter);
        });
        event.preventDefault();
      }
    });
  };
}

angularJsUtilitiesModule.directive("keyPressEnter", keyPressEnter);
export default keyPressEnter;
