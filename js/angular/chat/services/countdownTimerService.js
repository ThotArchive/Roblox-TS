import chatModule from '../chatModule';

function countdownTimerService($timeout) {
  'ngInject';

  return {
    start: function (endTimestamp, onTick) {
      const ref = {};

      const initialize = function () {
        const startTimestamp = Date.now();
        const durationMs = endTimestamp - startTimestamp;
        if (durationMs <= 0) {
          onTick(0);
          delete ref.timeout;
          return;
        }
        const msToNearestSec = durationMs % 1000;
        let remainingDuration = Math.ceil(durationMs / 1000);
        let expectedTimestamp = startTimestamp + msToNearestSec;
        onTick(remainingDuration);

        const tick = function () {
          // account for drift
          const nowTimestamp = Date.now();
          const deltaMs = nowTimestamp - expectedTimestamp;
          if (deltaMs > 1000) {
            // we have drifted a lot. this can happen when the tab goes idle for a while.
            // reinitialize the ticker state.
            initialize();
            return;
          }

          remainingDuration -= 1;
          expectedTimestamp += 1000;
          onTick(remainingDuration);
          if (remainingDuration <= 0) {
            delete ref.timeout;
            return;
          }

          ref.timeout = $timeout(tick, Math.max(0, 1000 - deltaMs));
        };

        ref.timeout = $timeout(tick, msToNearestSec);
      };

      initialize();

      return ref;
    },
    cancel: function (ref) {
      $timeout.cancel(ref?.timeout);
      delete ref?.timeout;
    },
    // formats a duration in hh:mm:ss format
    format: function (duration) {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      } else {
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
      }
    }
  };
}

chatModule.factory('countdownTimerService', countdownTimerService);

export default countdownTimerService;
