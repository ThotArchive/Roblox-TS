import infiniteScrollModule from "../infiniteScrollModule";
/*
Taken from: https://sroze.github.io/ngInfiniteScroll/documentation.html
Additional options added:
- infinite-scroll-always-disabled = evaluates a scope variable and determines if infinite scroll should ever run.
*/

function infiniteScroll($rootScope, $window, $timeout, $parse) {
  "ngInject";

  return {
    link(scope, elem, attrs) {
      let checkWhenEnabled;
      let handler;
      let scrollDistance;
      let scrollEnabled;
      $window = angular.element($window);
      scrollDistance = 0;
      if (attrs.infiniteScrollDistance != null) {
        scope.$watch(attrs.infiniteScrollDistance, value => (scrollDistance = parseInt(value, 10)));
      }
      let shouldTriggerHandler = true;
      scrollEnabled = true;
      checkWhenEnabled = false;
      if (attrs.infiniteScrollDisabled != null) {
        scope.$watch(attrs.infiniteScrollDisabled, value => {
          scrollEnabled = !value;
          if (scrollEnabled && checkWhenEnabled) {
            checkWhenEnabled = false;
            return handler();
          }
        });
      }
      handler = function () {
        if (!shouldTriggerHandler) {
          return false;
        }
        let elementBottom;
        let remaining;
        let shouldScroll;
        let windowBottom;
        windowBottom = $window.height() + $window.scrollTop();
        elementBottom = elem.offset().top + elem.height();
        remaining = elementBottom - windowBottom;
        shouldScroll = remaining <= $window.height() * scrollDistance;
        if (shouldScroll && scrollEnabled) {
          if ($rootScope.$$phase) {
            return scope.$eval(attrs.infiniteScroll);
          }
          return scope.$apply(attrs.infiniteScroll);
        }
        if (shouldScroll) {
          return (checkWhenEnabled = true);
        }
      };

      let runHandlerWatcher;
      if (attrs.infiniteScrollAlwaysDisabled !== null) {
        runHandlerWatcher = scope.$watch(
          () => $parse(attrs.infiniteScrollAlwaysDisabled)(scope),
          newVal => {
            if (newVal !== null && typeof newVal !== "undefined") {
              shouldTriggerHandler = !newVal;
            }
          },
        );
      }
      $window.on("scroll", handler);
      scope.$on("manualInfiniteScrollCheck", handler);
      scope.$on("$destroy", () => {
        if (runHandlerWatcher) {
          runHandlerWatcher();
        }
        return $window.off("scroll", handler);
      });
      return $timeout(() => {
        if (attrs.infiniteScrollImmediateCheck && scope.$eval(attrs.infiniteScrollImmediateCheck)) {
          return handler();
        }
        return handler();
      }, 0);
    },
  };
}

infiniteScrollModule.directive("infiniteScroll", infiniteScroll);

export default infiniteScroll;
