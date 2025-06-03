import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function robloxImagesService($timeout, $log, httpService, retryService) {
  "ngInject";
  var imageRetryDataElement = angular.element("#image-retry-data");
  var retryTimer =
    (imageRetryDataElement.length > 0 && Number(imageRetryDataElement.data("image-retry-timer"))) ||
    1500;
  var httpFailureMsg = "Errors from http call: ";
  var maxTry =
    (imageRetryDataElement.length > 0 &&
      Number(imageRetryDataElement.data("image-retry-max-times"))) ||
    10;

  function setRetryTimer(value) {
    retryTimer = value;
  }
  function setMaxTry(value) {
    maxTry = value;
  }

  function imageRetry(promiseData, image, callback, count, exponentialBackOff) {
    if (retryService.isExponentialBackOffEnabled) {
      if (!exponentialBackOff) {
        exponentialBackOff = retryService.exponentialBackOff();
      }
      var delay = exponentialBackOff.StartNewAttempt();
      count = exponentialBackOff.GetAttemptCount();
      if (count >= maxTry || promiseData.Final) {
        exponentialBackOff.Reset();
        return callback(promiseData.Url, promiseData.Final);
      } else {
        // pass into the retryUrl
        promiseData["RetryUrl"] = image.RetryUrl;
        $timeout(function () {
          getImageUrl(promiseData, callback, count, exponentialBackOff);
        }, delay);
      }
    } else {
      $log.log(" --- old image retry logic count ---" + count);
      if (count >= maxTry || promiseData.Final) {
        count = 0;
        return callback(promiseData.Url, promiseData.Final);
      } else {
        count++;
        // pass into the retryUrl
        promiseData["RetryUrl"] = image.RetryUrl;
        $timeout(function () {
          getImageUrl(promiseData, callback, count);
        }, retryTimer);
      }
    }
    return false;
  }
  function getImageUrl(image, callback, count, exponentialBackOff) {
    if (!image.RetryUrl) {
      return false;
    }

    var urlConfig = {
      url: image.RetryUrl,
      withCredentials: true,
    };
    httpService.httpGet(urlConfig, null).then(
      function (data) {
        return imageRetry(data, image, callback, count, exponentialBackOff);
      },
      function (data, status) {
        $log.debug(httpFailureMsg + status);
        return false;
      },
    );
  }
  return {
    setRetryTimer: setRetryTimer,
    setMaxTry: setMaxTry,
    getImageUrl: getImageUrl,
  };
}
angularJsUtilitiesModule.factory("robloxImagesService", robloxImagesService);

export default robloxImagesService;
