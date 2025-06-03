import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function performanceService($log) {
  "ngInject";
  function isPerformanceLibraryAvailable() {
    const { Performance } = window.Roblox;
    return Performance;
  }

  function logSinglePerformanceMark(markName) {
    const { Performance } = window.Roblox;
    if (isPerformanceLibraryAvailable()) {
      Performance.logSinglePerformanceMark(markName);
    }
  }

  return {
    logSinglePerformanceMark: logSinglePerformanceMark,
  };
}

angularJsUtilitiesModule.factory("performanceService", performanceService);

export default performanceService;
