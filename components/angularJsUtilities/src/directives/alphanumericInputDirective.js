import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function alphanumericInput() {
  "ngInject";
  return {
    require: "ngModel",
    restrict: "A",
    link: function (scope, element, attrs, modelCtrl) {
      var regex = null;
      function transformInput(inputValue) {
        if (inputValue == undefined) return "";
        var transformedValue = inputValue.replace(/[^0-9a-zA-Z]/g, "");

        if (transformedValue !== inputValue) {
          modelCtrl.$setViewValue(transformedValue);
          modelCtrl.$render();
        }
        return transformedValue;
      }
      modelCtrl.$parsers.push(transformInput);
    },
  };
}

angularJsUtilitiesModule.directive("alphanumericInput", alphanumericInput);
export default alphanumericInput;
