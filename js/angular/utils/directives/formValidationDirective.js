import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { FormEvents } from "Roblox";

function formValidation() {
    "ngInject";
    return {
        require: ['^form', 'ngModel'],
        restrict: 'A',
        link: function (scope, elems, attrs, ctrls) {
            scope.$watch(
                function () {
                    var model = ctrls[1];
                    return model.$viewValue;
                },
                function (newValue) {
                    if (typeof (FormEvents) !== 'undefined') {
                        var form = ctrls[0];
                        var model = ctrls[1];
                        if (model.$dirty && model.$invalid) {
                            var errors = [];
                            angular.forEach(model.$error, function (value, key) {
                                if (value === true)
                                    errors.push(key);
                            });
                            var inputToSend = model.redactedInput ? "[Redacted]" : newValue;
                            FormEvents.SendValidationFailed(form.$name, model.$name, inputToSend, errors.join(","));
                        }
                    }
                }
            );
        }
    }
};

angularJsUtilitiesModule.directive("formValidation", formValidation);
export default formValidation;