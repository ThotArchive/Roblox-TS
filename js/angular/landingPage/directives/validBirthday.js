import landingPageModule from "../landingPageModule";
import { Resources } from "Roblox";

function rbxValidBirthday() {
    "ngInject";

    return {
        require: 'ngModel',
        link: function (scope, ele, attrs, ctrl) {
            scope.$watch(function () {
                return (!angular.isUndefined(ctrl.$modelValue) && ctrl.$modelValue !== "");
            }, function (currentValue) {
                ctrl.$setValidity('birthday', currentValue);
                ctrl.$validationMessage = Resources.AnimatedSignupFormValidator.invalidBirthday;
            });
        }
    }
}
landingPageModule.directive("rbxValidBirthday", rbxValidBirthday);

export default rbxValidBirthday;