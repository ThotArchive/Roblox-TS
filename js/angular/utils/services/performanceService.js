import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { Performance } from "Roblox";

function performanceService($log) {
    "ngInject";
    function isPerformanceLibraryAvailable() {
        return Performance;
    }

    function logSinglePerformanceMark(markName) {
        if (isPerformanceLibraryAvailable()) {
            Performance.logSinglePerformanceMark(markName);
        }
    }

    return {
        logSinglePerformanceMark: logSinglePerformanceMark
    }
};

angularJsUtilitiesModule.factory("performanceService", performanceService);

export default performanceService;