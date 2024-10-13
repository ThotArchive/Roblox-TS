import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function hoverPopover($log, $document) {
    "ngInject";
    return {
        restrict: 'A',
        replace: true,
        scope: {
            hoverPopoverParams: "="
        },
        link: function (scope, element, attrs) {
            var popoverSelector = scope.hoverPopoverParams.hoverPopoverSelector;
            var triggerSelector = scope.hoverPopoverParams.triggerSelector;

            if (!scope.hoverPopoverParams.isDisabled) {
                element.on('hover', function () {
                    scope.$apply(function () {
                        scope.hoverPopoverParams.isOpen = true;
                        setupPopoverOnMouseLeave();
                    });
                });

                angular.element(triggerSelector).on('mouseleave', function (event) {
                    if (scope.hoverPopoverParams.isOpen) {
                        var target = angular.element(event.relatedTarget);
                        if (!insidePopover(target) && !insideTrigger(target)) {
                            scope.$apply(function () {
                                scope.hoverPopoverParams.isOpen = false;
                            });
                        }
                    }
                });

                $document.on("HoverPopover.EnableClose", function () {
                    if (scope.hoverPopoverParams.isOpen) {
                        scope.$apply(function () {
                            scope.hoverPopoverParams.isOpen = false;
                        });
                    }
                });
            }

            function setupPopoverOnMouseLeave () {
                angular.element(popoverSelector).on('mouseleave', function (event) {
                    if (scope.hoverPopoverParams.isOpen) {
                        var target = angular.element(event.relatedTarget);
                        if (!insideTrigger(target)) {
                            scope.$apply(function () {
                                scope.hoverPopoverParams.isOpen = false;
                            });
                        }
                    }
                });
            }

            function insideTrigger(target) {
                var trigger = angular.element(triggerSelector);
                return trigger.find(target) && trigger.find(target).length > 0;
            }

            function insidePopover(target) {
                var isIn = false;
                var popover = angular.element(popoverSelector);
                if (popover.find(target) && popover.find(target).length > 0) {
                    isIn = true;
                }
                return isIn;
            }
        }
    }
};

angularJsUtilitiesModule.directive("hoverPopover", hoverPopover);
export default hoverPopover;