import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function inputMaxLength() {
    "ngInject";
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var maxlength = Number(attrs.inputMaxLength);
            function fromUser(text) {
                if (text.length > maxlength) {
                    var transformedInput = text.substring(0, maxlength);
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    return transformedInput;
                }
                return text;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
};

angularJsUtilitiesModule.directive("inputMaxLength", inputMaxLength);
export default inputMaxLength;