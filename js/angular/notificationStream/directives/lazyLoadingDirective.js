import { Scrollbar } from "Roblox";
import angular from "angular";
import notificationStreamModule from "../notificationStreamModule";

function lazyLoading(notificationStreamService, $document, $log) {
    "ngInject";

    return {
        restrict: "A",
        scope: true,
        link: function (scope, element, attrs) {
            scope.callbackLazyLoad = function () {
                if (!scope.notificationApiParams || scope.layout.isNotificationsLoading) {
                    return false;
                }
                if (scope.notificationApiParams.loadMoreNotifications) {
                    scope.layout.isNotificationsLoading = true;
                    scope.layout.notiticationsLazyLoadingEnabled = true;
                    notificationStreamService.getRecentNotifications(
                        scope.notificationApiParams.startIndexOfNotifications,
                        scope.notificationApiParams.pageSizeOfNotifications)
                        .then(
                            function (data) {
                                scope.layout.notiticationsLazyLoadingEnabled = false;
                                if (data && data.length > 0) {
                                    scope.buildNotificationsList(data);
                                    scope.notificationApiParams.startIndexOfNotifications = scope.notificationApiParams.startIndexOfNotifications + scope.notificationApiParams.pageSizeOfNotifications;
                                } else {
                                    scope.notificationApiParams.loadMoreNotifications = false;
                                    scope.notificationApiParams.startIndexOfNotifications = 0;
                                }
                                scope.layout.isNotificationsLoading = false;
                            }, function () {
                                scope.layout.notiticationsLazyLoadingEnabled = false;
                                $log.debug("---error from get Notificaitons in lazyLoadingDirective.js---");
                                scope.layout.isNotificationsLoading = false;
                            });
                }
            };

            scope.setupScrollbar = function () {
                element.mCustomScrollbar({
                    autoExpandScrollbar: false,
                    scrollInertia: 5,
                    contentTouchScroll: 1,
                    mouseWheel: {
                        preventDefault: true
                    },
                    callbacks: {
                        onTotalScrollOffset: 100,
                        onTotalScroll: scope.callbackLazyLoad,
                        onOverflowYNone: scope.callbackLazyLoad
                    }
                });
            }

            scope.destroyScrollbar = function () {
                $log.debug("----- destroyScrollbar ----");
                element.mCustomScrollbar("destroy");
            }
            var init = function () {
                scope.setupScrollbar();
            }

            var watchPageDataInitialized = scope.$watch(
                function () {
                    return scope.layout && scope.layout.isLazyLoadingRequested;
                },
                function (newValue, oldValue) {
                    if (angular.isDefined(newValue) && newValue !== oldValue) {
                        $log.debug("----- initializeLayout ----");
                        if (newValue) {
                            init();
                        } else {
                            scope.destroyScrollbar();
                        }
                    }
                }, true
            );

            scope.$on("$destroy", function () {
                if (watchPageDataInitialized) {
                    watchPageDataInitialized();
                }
            });
        }
    }
}

notificationStreamModule.directive("lazyLoading", lazyLoading);

export default lazyLoading;