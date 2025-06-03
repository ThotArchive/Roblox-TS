import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function batchRequestsService($q, batchRequestsConstants) {
  "ngInject";

  var createExponentialBackoffCooldown = function (minimumCooldown, maximumCooldown) {
    return function (attempts) {
      var exponentialCooldown = Math.pow(2, attempts - 1) * minimumCooldown;
      return Math.min(maximumCooldown, exponentialCooldown);
    };
  };

  var createRequestProcessor = function (itemsProcessor, itemSerializer, properties) {
    var completeItems = {};
    var requestQueue = [];
    var active = false;

    if (!properties.hasOwnProperty("processBatchWaitTime")) {
      properties.processBatchWaitTime = batchRequestsConstants.defaultProcessBatchWaitTime;
    }

    var getFailureCooldown = function (attempts) {
      if (properties.getFailureCooldown) {
        return properties.getFailureCooldown(attempts);
      }

      return batchRequestsConstants.defaultCooldown;
    };

    var handleBatchResult = function (batch, processQueue, error) {
      var minimumCooldown = 0;
      var currentDate = new Date().getTime();

      batch.forEach(function (request) {
        if (completeItems.hasOwnProperty(request.key)) {
          request.resolve(completeItems[request.key]);
        } else if (
          properties.maxRetryAttempts &&
          properties.maxRetryAttempts > 0 &&
          error !== batchRequestsConstants.errors.unretriableFailure
        ) {
          var itemCooldown = getFailureCooldown(request.retryAttempts);

          if (minimumCooldown > 0) {
            minimumCooldown = Math.min(minimumCooldown, itemCooldown);
          } else {
            minimumCooldown = itemCooldown;
          }

          if (++request.retryAttempts <= properties.maxRetryAttempts) {
            request.queueAfter = currentDate + itemCooldown;
            // Put in front of the queue to make sure duplicate items
            // don't get processed without the cooldown time.
            requestQueue.unshift(request);
          } else {
            request.reject(batchRequestsConstants.errors.maxAttemptsReached);
          }
        } else {
          request.reject(error);
        }
      });

      if (minimumCooldown > 0) {
        setTimeout(processQueue, minimumCooldown + properties.processBatchWaitTime);
      }

      active = false;
      processQueue();
    };

    var saveCompleteItem = function (key, data) {
      completeItems[key] = data;

      if (properties.getItemExpiration) {
        setTimeout(function () {
          delete completeItems[key];
        }, properties.getItemExpiration(key));
      }
    };

    var processQueue = function () {
      if (active) {
        return;
      }

      var batch = [];
      var batchKeys = {};
      var requeueRequests = [];
      var currentDate = new Date().getTime();

      while (batch.length < properties.batchSize && requestQueue.length > 0) {
        var request = requestQueue.shift();

        if (request.queueAfter > currentDate) {
          batchKeys[request.key] = request;
          requeueRequests.push(request);

          continue;
        } else if (completeItems.hasOwnProperty(request.key)) {
          request.resolve(completeItems[request.key]);
        } else {
          if (batchKeys.hasOwnProperty(request.key)) {
            // Requeue to make sure duplicate requests still get resolved once they're completed.
            requeueRequests.push(request);
          } else {
            batchKeys[request.key] = request;
            batch.push(request);
          }
        }
      }

      requeueRequests.forEach(function (request) {
        requestQueue.push(request);
      });

      if (batch.length <= 0) {
        return;
      }

      active = true;

      var batchItems = [];
      batch.forEach(function (request) {
        batchItems.push(request.item);
      });

      itemsProcessor(batchItems).then(
        function (data) {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              saveCompleteItem(key, data[key]);
            }
          }

          handleBatchResult(batch, processQueue, batchRequestsConstants.errors.processFailure);
        },
        function (error) {
          handleBatchResult(batch, processQueue, error);
        },
      );
    };

    var invalidateItem = function (item) {
      delete completeItems[itemSerializer(item)];
    };

    var queueItem = function (item) {
      return $q(function (resolve, reject) {
        requestQueue.push({
          key: itemSerializer(item),
          item: item,
          retryAttempts: 0,
          queueAfter: 0,
          resolve: resolve,
          reject: reject,
        });

        setTimeout(processQueue, properties.processBatchWaitTime);
      });
    };

    return {
      invalidateItem: invalidateItem,
      queueItem: queueItem,
    };
  };

  return {
    cooldowns: {
      createExponentialBackoffCooldown: createExponentialBackoffCooldown,
    },

    createRequestProcessor: createRequestProcessor,
  };
}

angularJsUtilitiesModule.factory("batchRequestsService", batchRequestsService);

export default batchRequestsService;
