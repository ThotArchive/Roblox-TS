import infiniteScrollModule from "../infiniteScrollModule";
/*
Taken from: https://sroze.github.io/ngInfiniteScroll/documentation.html
Additional options added:
- infinite-scroll-always-disabled = evaluates a scope variable and determines if infinite scroll should ever run.
*/

function infiniteScroll($rootScope, $window, $timeout, $parse) {
    "ngInject";
      return {
          link: function (scope, elem, attrs) {
              var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
              $window = angular.element($window);
              scrollDistance = 0;
              if (attrs.infiniteScrollDistance != null) {
                  scope.$watch(attrs.infiniteScrollDistance, function (value) {
                      return scrollDistance = parseInt(value, 10);
                  });
              }
              var shouldTriggerHandler = true;
              scrollEnabled = true;
              checkWhenEnabled = false;
              if (attrs.infiniteScrollDisabled != null) {
                  scope.$watch(attrs.infiniteScrollDisabled, function (value) {
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
                  var elementBottom, remaining, shouldScroll, windowBottom;
                  windowBottom = $window.height() + $window.scrollTop();
                  elementBottom = elem.offset().top + elem.height();
                  remaining = elementBottom - windowBottom;
                  shouldScroll = remaining <= $window.height() * scrollDistance;
                  if (shouldScroll && scrollEnabled) {
                      if ($rootScope.$$phase) {
                          return scope.$eval(attrs.infiniteScroll);
                      } else {
                          return scope.$apply(attrs.infiniteScroll);
                      }
                  } else if (shouldScroll) {
                      return checkWhenEnabled = true;
                  }
              };

              var runHandlerWatcher;
              if (attrs.infiniteScrollAlwaysDisabled !== null) {
                  runHandlerWatcher = scope.$watch(function () {
                      return $parse(attrs.infiniteScrollAlwaysDisabled)(scope);
                  }, function (newVal) {
                      if (newVal !== null && typeof (newVal) !== 'undefined') {
                          shouldTriggerHandler = !newVal;
                      }
                  });
              }
              $window.on('scroll', handler);
              scope.$on('manualInfiniteScrollCheck', handler);
              scope.$on('$destroy', function () {
                  if (runHandlerWatcher) {
                      runHandlerWatcher();
                  }
                  return $window.off('scroll', handler);
              });
              return $timeout((function () {
                  if (attrs.infiniteScrollImmediateCheck && scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                      return handler();
                  } else {
                      return handler();
                  }
              }), 0);
          }
      };
  };


infiniteScrollModule.directive("infiniteScroll", infiniteScroll);

export default infiniteScroll;