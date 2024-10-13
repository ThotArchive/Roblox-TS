import angularJsUtilitiesModule from '../angularJsUtilitiesModule';

function httpService($http, $q, $window, $log) {
  'ngInject';

  const methods = {
    get: 'GET',
    post: 'POST',
    delete: 'DELETE',
    patch: 'PATCH'
  };

  const cacheBustingType = {
    default: 0,
    subdomain: 1
  };

  function configForCors(urlConfig, config) {
    if (urlConfig.withCredentials) {
      config.withCredentials = urlConfig.withCredentials;
    }
  }

  function configForRetry(urlConfig, config) {
    if (urlConfig.retryable) {
      config.retryable = urlConfig.retryable;
    }
  }

  function configForNoCache(urlConfig, config) {
    if (urlConfig.noCache) {
      config.headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      };
    }
    if (urlConfig.noPragma && config.headers.Pragma) {
      delete config.headers.Pragma; // this is for backward-compatible, Pragma is deprecated, will remove in the future.
    }
  }

  function configForHeader(urlConfig, config) {
    if (urlConfig.headers) {
      config.headers = angular.extend(config.headers || {}, urlConfig.headers || {});
    }
  }

  function configForFileUploader(urlConfig, config) {
    // Use withFile param if you are sending a file along with other values to the server.
    // this is only if you want to send through ajax vs. form post.
    if (urlConfig.withFile) {
      config.transformRequest = function (data) {
        // we need to transform payload to formData object
        const formData = new FormData();
        angular.forEach(data, function (value, key) {
          formData.append(key, value);
        });
        return formData;
      };
      config.headers = angular.extend(config.headers || {}, {
        'Content-Type': undefined // needed so that browser makes it 'multipart/form-data' with boundary.
      });
    }
  }

  function configForCacheBusting(urlConfig, config) {
    if (urlConfig.cacheBusting) {
      switch (urlConfig.cacheBusting.type) {
        case cacheBustingType.subdomain:
        default:
          var host = $window && $window.location ? $window.location.host : window.location.host;
          var subdomain = '';
          if (host.indexOf('.') >= 0) {
            subdomain = `?subdomain=${host.split('.')[0]}`;
          }
          config.url += subdomain;
          break;
      }
    }
  }

  function configForTimeout(urlConfig, config) {
    if (urlConfig.timeout) {
      config.timeout = urlConfig.timeout;
    }
  }

  function configForTracerConfig(urlConfig, config) {
    if (urlConfig.tracerConfig) {
      config.tracerConfig = urlConfig.tracerConfig;
    }
  }

  function buildCustomizedConfig(config, urlConfig) {
    // set withCredentials
    configForCors(urlConfig, config);
    // enable retry logic for fail request
    configForRetry(urlConfig, config);
    // disable cache
    configForNoCache(urlConfig, config);
    // append header argument
    configForHeader(urlConfig, config);
    // set up for file uploader via ajax request
    configForFileUploader(urlConfig, config);
    // enable cache busting by different types
    configForCacheBusting(urlConfig, config);
    // {number|Promise} – timeout in milliseconds, or promise that should abort the request when resolved.
    configForTimeout(urlConfig, config);
    // setup configuration for robloxtracer
    configForTracerConfig(urlConfig, config);

    return config;
  }

  function buildGetConfig(urlConfig, params) {
    let config = {
      method: methods.get,
      url: urlConfig.url,
      params
    };
    config = buildCustomizedConfig(config, urlConfig);
    return config;
  }

  function buildPostConfig(urlConfig, data) {
    let config = {
      method: methods.post,
      url: urlConfig.url,
      data
    };
    config = buildCustomizedConfig(config, urlConfig);
    return config;
  }

  function buildDeleteConfig(urlConfig, data) {
    let config = {
      method: methods.delete,
      url: urlConfig.url,
      data
    };
    config = buildCustomizedConfig(config, urlConfig);
    return config;
  }

  function buildPatchConfig(urlConfig, data) {
    let config = {
      method: methods.patch,
      url: urlConfig.url,
      data
    };
    config = buildCustomizedConfig(config, urlConfig);
    return config;
  }

  function getDeferredPromise(config) {
    const deferred = $q.defer();
    $http(config).then(
      function onSuccess(response) {
        let jsonData = response.data;
        if (jsonData === 'null') {
          jsonData = null;
        }
        deferred.resolve(jsonData);
      },
      function onError(response) {
        const jsonData = response.data;
        $log.debug(`Error: unable to send ${config.url} request.`);
        deferred.reject(jsonData);
      }
    );
    return deferred.promise;
  }

  const getApiErrorCodes = function (responseJson) {
    const errorCodes = [];
    if (responseJson && responseJson.errors) {
      responseJson.errors.forEach(function (error) {
        if (error.code) {
          errorCodes.push(error.code);
        }
      });
    }
    return errorCodes;
  };

  const getPrimaryApiErrorCode = function (responseJson, errorCodeMap) {
    const errorCodes = getApiErrorCodes(responseJson);
    const primaryErrorCode = errorCodes[0] || 0;

    if (errorCodeMap) {
      return errorCodeMap[primaryErrorCode] || 0;
    }

    return primaryErrorCode;
  };

  const getApiErrorCodeHandler = function (reject, errorCodeMap) {
    return function (responseData) {
      reject(getPrimaryApiErrorCode(responseData, errorCodeMap));
    };
  };

  return {
    methods,

    cacheBustingType,

    httpGet(urlConfig, params, promiseOnly) {
      if (!urlConfig) {
        return false;
      }
      const config = buildGetConfig(urlConfig, params);
      if (promiseOnly) {
        return $http(config);
      }
      return getDeferredPromise(config);
    },

    httpPost(urlConfig, data, promiseOnly) {
      if (!urlConfig) {
        return false;
      }
      const config = buildPostConfig(urlConfig, data);
      if (promiseOnly) {
        return $http(config);
      }
      return getDeferredPromise(config);
    },

    httpDelete(urlConfig, data) {
      if (!urlConfig) {
        return false;
      }
      const config = buildDeleteConfig(urlConfig, data);
      return getDeferredPromise(config);
    },

    httpPatch(urlConfig, data) {
      if (!urlConfig) {
        return false;
      }
      const config = buildPatchConfig(urlConfig, data);
      return getDeferredPromise(config);
    },

    getApiErrorCodes,
    getPrimaryApiErrorCode,
    getApiErrorCodeHandler,

    buildBatchPromises(urlConfig, arrayNeedsBatch, cutOff, keyForParams, httpMethod) {
      if (!cutOff) {
        cutOff = 50;
      }
      const promises = [];
      let startIndex = 0;
      let subArray = arrayNeedsBatch.slice(startIndex, cutOff);
      while (subArray.length > 0) {
        const params = {};
        params[keyForParams] = subArray;
        switch (httpMethod) {
          case 'POST':
            promises.push(this.httpPost(urlConfig, params));
            break;
          case 'GET':
          default:
            promises.push(this.httpGet(urlConfig, params));
            break;
        }
        startIndex++;
        subArray = arrayNeedsBatch.slice(startIndex * cutOff, startIndex * cutOff + cutOff);
      }

      return $q.all(promises);
    }
  };
}
angularJsUtilitiesModule.factory('httpService', httpService);

export default httpService;
