import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function focusModel() {
    "ngInject";
    return function (scope, element, attrs) {
        var focusListener = function () {
            scope.$evalAsync(function () {
                scope.$eval(attrs.focusModel);
            });
        }
        element[0].addEventListener('focus', focusListener, true);
    }
};

angularJsUtilitiesModule.directive("focusModel", focusModel);
export default focusModel;