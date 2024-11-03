import notificationStreamModule from "../notificationStreamModule";

function notificationStreamContainer(notificationStreamUtility, $log) {
    "ngInject";

    return {
        restrict: "A",
        replace: true,
        scope: true,
        templateUrl: notificationStreamUtility.templates.notificationStreamContainerTemplate
    }
}

notificationStreamModule.directive("notificationStreamContainer", notificationStreamContainer);

export default notificationStreamContainer;