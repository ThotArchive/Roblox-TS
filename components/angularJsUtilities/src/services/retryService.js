import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function retryService($log) {
  "ngInject";
  function isExponentialBackOffEnabled() {
    const { Utilities } = window.Roblox;
    if (Utilities && Utilities.ExponentialBackoff && Utilities.ExponentialBackoffSpecification) {
      return true;
    }
    return false;
  }
  return {
    isExponentialBackOffEnabled: isExponentialBackOffEnabled(),
    exponentialBackOff: function () {
      if (isExponentialBackOffEnabled()) {
        const { Utilities } = window.Roblox;
        var regularBackoffSpec = new Utilities.ExponentialBackoffSpecification({
          firstAttemptDelay: 2000,
          firstAttemptRandomnessFactor: 3,
          subsequentDelayBase: 10000,
          subsequentDelayRandomnessFactor: 0.5,
          maximumDelayBase: 300000,
        });
        return new Utilities.ExponentialBackoff(regularBackoffSpec);
      } else {
        return null;
      }
    },
  };
}

angularJsUtilitiesModule.factory("retryService", retryService);

export default retryService;
