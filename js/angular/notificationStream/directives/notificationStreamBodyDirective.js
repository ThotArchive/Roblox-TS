import notificationStreamModule from "../notificationStreamModule";

function notificationStreamBody($document, $log) {
    "ngInject";
    return {
        restrict: "A",
        replace: true,
        scope: true,
        link: function (scope, element, attrs) {
            $document.on("click touchstart", function (event) {
                if (scope.layout) {
                    if (!scope.layout.isStreamBodyInteracted && element.has(event.target).length > 0) {
                        scope.layout.isStreamBodyInteracted = true;
                    } else if (scope.layout.isStreamBodyInteracted && !element.has(event.target).length > 0) {
                        scope.layout.isStreamBodyInteracted = false;
                    }
                    $log.debug(" ------------------scope.layout.isStreamBodyInteracted----------------- " + scope.layout.isStreamBodyInteracted);
                }
            });
        }
    }
}

notificationStreamModule.directive("notificationStreamBody", notificationStreamBody);

export default notificationStreamBody;