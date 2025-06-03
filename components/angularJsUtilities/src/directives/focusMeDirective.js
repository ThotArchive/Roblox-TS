import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function focusMe($timeout) {
  "ngInject";
  return {
    scope: {
      trigger: "@focusMe",
    },
    link: function (scope, element, attribute) {
      scope.$watch(
        function () {
          return attribute.focusMe;
        },
        function (value) {
          if (value) {
            $timeout(function () {
              if (value === "true") {
                element[0].focus();
              }
            }, 0);
          }
        },
      );
    },
  };
}

angularJsUtilitiesModule.directive("focusMe", focusMe);
export default focusMe;
