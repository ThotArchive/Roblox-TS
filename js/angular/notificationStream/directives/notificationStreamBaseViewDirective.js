import notificationStreamModule from "../notificationStreamModule";

function notificationStreamBaseView(notificationStreamUtility, $log) {
    "ngInject";

    return {
        restrict: "A",
        replace: true,
        scope: true,
        templateUrl: notificationStreamUtility.templates.notificationStreamBaseViewTemplate
    }
}

notificationStreamModule.directive("notificationStreamBaseView", notificationStreamBaseView);

export default notificationStreamBaseView;