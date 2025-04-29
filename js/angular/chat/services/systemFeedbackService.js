import angular from 'angular';
import chatModule from '../chatModule';

function systemFeedbackService($timeout) {
  'ngInject';

  let timeout;

  return {
    showSystemFeedback(text, durationMs = 5000) {
      angular.element('#chat-system-feedback .alert-content').text(text);
      const alert = angular.element('#chat-system-feedback .alert');
      alert.addClass('alert-active');
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(function () {
        alert.removeClass('alert-active');
      }, durationMs);
    }
  };
}

chatModule.factory('systemFeedbackService', systemFeedbackService);

export default systemFeedbackService;
