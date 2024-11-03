import notificationStreamModule from "../notificationStreamModule";

function test(notificationStreamUtility, $log) {
    "ngInject";
    return {
        restrict: "A",
        replace: true,
        scope: true,
        templateUrl: notificationStreamUtility.templates.testTemplate,
        link: function (scope, element, attrs) {
            var metaData = scope.notification.metadataCollection;
            scope.notificationDisplayText = "";
            metaData.forEach(function (data) {
                scope.notificationDisplayText += data.Detail;
            });
        }
    }
}

notificationStreamModule.directive("test", test);

export default test;