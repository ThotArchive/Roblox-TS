"use strict";

import captchaV2 from '../captchaV2Module';

function captchaV2Service($q, httpService, captchaV2Constants, captchaIdCounter) {
    "ngInject";
    var metadataCache = null;

    var getMetadata = function () {
        return $q(function (resolve, reject) {
            if (metadataCache) {
                resolve(metadataCache);
            } else {
                var urlConfig = {
                    url: captchaV2Constants.urls.getMetadata
                };

                httpService.httpGet(urlConfig).then(function (response) {
                    metadataCache = response;
                    resolve(response);
                }, reject);
            }
        });
    };

    var getCaptchaId = function () {
        ++captchaIdCounter.id;
        return "captchaV2-" + captchaIdCounter.id;
    };
    
    return {
        getMetadata: getMetadata,
        getCaptchaId: getCaptchaId
    };
}

captchaV2.factory('captchaV2Service', captchaV2Service);
export default captchaV2Service;
