import notificationStreamModule from "../notificationStreamModule";

function notificationContent(notificationStreamUtility, $log) {
    "ngInject";
    return {
        restrict: "A",
        replace: true,
        scope: true,
        templateUrl: notificationStreamUtility.templates.notificationContentTemplate
    }
}

notificationStreamModule.directive("notificationContent", notificationContent);

export default notificationContent;