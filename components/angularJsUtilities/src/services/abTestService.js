import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function abTestService($q, abTestConstants, httpService) {
  "ngInject";

  /*
   * data should be an array of objects
   * { SubjectType, SubjectTargetId, ExperimentName }
   */
  function checkAbTestEnrollments(data) {
    const { EnvironmentUrls } = window.Roblox;
    var urlConfig = {
      url: EnvironmentUrls.abtestingApiSite + abTestConstants.urls.checkEnrollment,
      retryable: false,
      withCredentials: true,
    };

    return httpService.httpPost(urlConfig, data);
  }

  /*
   * data should be an array of objects
   * { SubjectType, SubjectTargetId, ExperimentName }
   */
  function enrollInAbTests(data) {
    const { EnvironmentUrls } = window.Roblox;
    var urlConfig = {
      url: EnvironmentUrls.abtestingApiSite + abTestConstants.urls.enroll,
      retryable: false,
      withCredentials: true,
    };

    return httpService.httpPost(urlConfig, data);
  }

  function checkAbTestEnrollment(targetId, subjectType, experimentName, targetVariation) {
    var data = [
      {
        SubjectType: subjectType,
        SubjectTargetId: targetId,
        ExperimentName: experimentName,
      },
    ];

    var returnObject = {
      enrolled: false,
      success: false,
      variation: null,
    };

    return $q(function (resolve, reject) {
      checkAbTestEnrollments(data).then(
        function (response) {
          if (response.data) {
            response.data.forEach(enrollment => {
              if (enrollment.ExperimentName === experimentName) {
                returnObject.success = enrollment ? true : false;
                returnObject.variation = enrollment.Variation;
                returnObject.enrolled = enrollment.Variation === targetVariation;
                resolve(returnObject);
                return;
              }
            });
          }
          reject({
            code: abTestConstants.errorCode.noResultForExperiment,
            message: "No result for the specified experiment name.",
          });
        },
        function (error) {
          reject(error);
        },
      );
    });
  }

  function enrollInAbTest(targetId, subjectType, experimentName) {
    var data = [
      {
        SubjectType: subjectType,
        SubjectTargetId: targetId,
        ExperimentName: experimentName,
      },
    ];

    var returnObject = {
      enrolled: false,
      success: false,
      variation: null,
    };

    return $q(function (resolve, reject) {
      enrollInAbTests(data).then(
        function (response) {
          if (response.data) {
            response.data.forEach(enrollment => {
              if (enrollment.ExperimentName === experimentName) {
                returnObject.success = enrollment ? true : false;
                returnObject.variation = enrollment.Variation;
                returnObject.enrolled =
                  enrollment.Status === abTestConstants.response.status.enrolled;
                resolve(returnObject);
                return;
              }
            });
          }
          reject({
            code: abTestConstants.errorCode.noResultForExperiment,
            message: "No result for the specified experiment name.",
          });
        },
        function (error) {
          reject(error);
        },
      );
    });
  }

  return {
    checkAbTestEnrollments: checkAbTestEnrollments,
    enrollInAbTests: enrollInAbTests,
    // For single checks
    checkAbTestEnrollment: checkAbTestEnrollment,
    enrollInAbTest: enrollInAbTest,
  };
}

angularJsUtilitiesModule.factory("abTestService", abTestService);

export default abTestService;
