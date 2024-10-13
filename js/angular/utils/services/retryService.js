import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { Utilities } from "Roblox";

function retryService($log) {
    "ngInject";
    function isExponentialBackOffEnabled() {
        if (Utilities
            && Utilities.ExponentialBackoff
            && Utilities.ExponentialBackoffSpecification) {
            return true;
        }
        return false;
    }
    return {
        isExponentialBackOffEnabled : isExponentialBackOffEnabled(),
        exponentialBackOff: function () {
            if (isExponentialBackOffEnabled()) {
                var regularBackoffSpec = new Utilities.ExponentialBackoffSpecification({
                    firstAttemptDelay: 2000,
                    firstAttemptRandomnessFactor: 3,
                    subsequentDelayBase: 10000,
                    subsequentDelayRandomnessFactor: 0.5,
                    maximumDelayBase: 300000
                });
                return new Utilities.ExponentialBackoff(regularBackoffSpec);
            }
            else {
                return null;
            }

        }
    }
};

angularJsUtilitiesModule.factory("retryService", retryService);

export default retryService;