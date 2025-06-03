import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function matchField() {
  "ngInject";
  return {
    require: "ngModel",
    link: function (scope, elem, attrs, ctrl) {
      scope.$watch(attrs.matchField, function (value) {
        if (ctrl.$viewValue !== undefined && ctrl.$viewValue !== "") {
          ctrl.$setValidity("matchField", value === ctrl.$viewValue);
        }
      });

      ctrl.$validators.matchField = function (value) {
        return value === scope.$eval(attrs.matchField);
      };
    },
  };
}

angularJsUtilitiesModule.directive("matchField", matchField);
export default matchField;
