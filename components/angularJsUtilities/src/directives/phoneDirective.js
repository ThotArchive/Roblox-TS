import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function phone() {
  "ngInject";
  return {
    require: "ngModel",
    link: function (scope, element, attrs, modelCtrl) {
      function transformInput(inputValue) {
        if (inputValue == undefined) return "";
        var transformedValue = inputValue.replace(/[^0-9-+()]/g, "");

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

angularJsUtilitiesModule.directive("phone", phone);
export default phone;
