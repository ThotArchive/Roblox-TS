import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function blurModel() {
    "ngInject";
    return function (scope, element, attrs) {
        var blurListener = function () {
            scope.$evalAsync(function () {
                scope.$eval(attrs.blurModel);
            });
        }

        element[0].addEventListener('blur', blurListener, true);
    }
};

angularJsUtilitiesModule.directive("blurModel", blurModel);
export default blurModel;