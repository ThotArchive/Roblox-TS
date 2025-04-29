import chatModule from '../chatModule';

function chatTimeoutTimer(countdownTimerService) {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      expiresAt: '@',
      onExpiry: '&'
    },
    link: function (scope, element) {
      const update = function (remainingDuration) {
        element.text(countdownTimerService.format(remainingDuration));
        if (remainingDuration <= 0) {
          scope.onExpiry();
        }
      };

      let timerRef = countdownTimerService.start(parseInt(scope.expiresAt), update);

      const unwatch = scope.$watch('expiresAt', function (newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        countdownTimerService.cancel(timerRef);
        timerRef = countdownTimerService.start(parseInt(newValue), update);
      });

      scope.$on('$destroy', function () {
        countdownTimerService.cancel(timerRef);
        unwatch();
      });
    }
  };
}

chatModule.directive('chatTimeoutTimer', chatTimeoutTimer);

export default chatTimeoutTimer;
