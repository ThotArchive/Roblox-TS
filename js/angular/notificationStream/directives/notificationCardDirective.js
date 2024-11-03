import angular from "angular";
import notificationStreamModule from "../notificationStreamModule";


function notificationCard($log, notificationStreamService) {
    "ngInject";

    var transitions = {
        "transition": "transitionend",
        "OTransition": "oTransitionEnd",
        "MozTransition": "transitionend",
        "WebkitTransition": "webkitTransitionEnd"
    };

    var whichTransitionEvent = function () {
        var t;
        var el = document.createElement("supportedEvent");

        for (t in transitions) {
            if (angular.isDefined(el.style[t])) {
                return transitions[t];
            }
        }
    };

    var transitionEvent = whichTransitionEvent();
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            element.bind(transitionEvent, function (evt) {
                $log.debug('got a css transition event', evt);

                var slideOutTransition = evt.target.className.search("slide-out-left");
                if (slideOutTransition >= 0) {
                    scope.$evalAsync(function () { scope.removeNotification(scope.notification.id) });
                }
            });

            scope.updateNotificationSetting = function (isEnabled) {
                notificationStreamService.updateNotificationSettings(scope.notification.notificationSourceType, isEnabled)
                    .then(function (data) {
                        $log.debug('turnOffNotification -- success', data);
                        scope.notification.isTurnOff = !isEnabled;
                    }, function (error) {
                        $log.debug('turnOffNotification --fail');

                    });
            }
        }
    }
}

notificationStreamModule.directive("notificationCard", notificationCard);

export default notificationCard;