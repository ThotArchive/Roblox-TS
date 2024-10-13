import $ from 'jquery';

import { Hybrid, UrlParser } from 'Roblox';
import FunCaptcha from './services/funCaptchaService';
import CaptchaConstants from './constants/captchaConstants';

const AppCaptcha = (function () {
  const credentialsTypeParameterName = 'credentialstype';
  const credentialsValueParameterName = 'credentialsvalue';
  const hybridReturnTokenName = 'hybrid-return-token';
  const hybridReturnCaptchaIdName = 'hybrid-return-captcha-id';
  const dataExchangeBlobName = 'data-exchange-blob';

  const captchaParams = {
    shownCb: captchaShown,
    successCb: captchaSuccess,
    errorCb: displayErrorMessage,
    returnTokenInSuccessCb: false,
    inputParams: {
      dataExchange: '',
      unifiedCaptchaId: ''
    },
    extraValidationParams: {}
  };

  let metadataLoaded = false;
  // To ensure that we only make the "shown" native call
  // once
  let hasMadeShownNativeCall = false;
  const changeEvent = createChangeEvent();

  function triggerCaptcha() {
    if (FunCaptcha) {
      if (UrlParser) {
        const credentialsType = UrlParser.getParameterValueByName(
          credentialsTypeParameterName,
          false
        );
        const credentialsValue = UrlParser.getParameterValueByName(
          credentialsValueParameterName,
          false
        );
        if (credentialsType !== null && credentialsValue !== null) {
          captchaParams.extraValidationParams.credentialsType = credentialsType;
          captchaParams.extraValidationParams.credentialsValue = credentialsValue;
        }
        captchaParams.returnTokenInSuccessCb =
          UrlParser.getParameterValueByName(hybridReturnTokenName, false) === '1';

        const dataExchangeValue = UrlParser.getParameterValueByName(dataExchangeBlobName, false);
        if (dataExchangeValue !== null) {
          captchaParams.inputParams.dataExchange = dataExchangeValue;
        }

        const unifiedCaptchaIdValue = UrlParser.getParameterValueByName(
          hybridReturnCaptchaIdName,
          false
        );
        if (unifiedCaptchaIdValue !== null) {
          captchaParams.inputParams.unifiedCaptchaId = unifiedCaptchaIdValue;
        }
      }

      let triggerStartTime = new Date();
      let wait = setInterval(function() {
        if (metadataLoaded) {
          clearInterval(wait);
          FunCaptcha.render(CaptchaConstants.ids.appCaptcha, captchaParams);
        } else {
          if (new Date().getTime() - triggerStartTime.getTime() > CaptchaConstants.metadataLoadParameters.timeoutMilliseconds) {
            clearInterval(wait);
            displayErrorMessage();
          }
        }
      }, CaptchaConstants.metadataLoadParameters.waitIntervalMilliseconds);
    } else {
      displayErrorMessage();
    }
  }

  let metadataCache = null;
  function loadMetaData() {
    return new Promise((resolve, reject) => {
      if (metadataCache) {
        resolve(metadataCache);
      }
      $.ajax({
        method: 'GET',
        url: CaptchaConstants.urls.getMetadata,
        success: function success(response) {
          metadataCache = response;
          resolve(response);
        },
        error: function error(err) {
          reject(err);
        }
      });
    });
  }
  
  loadMetaData().then(
    metadata => {
      const publicKeys = metadata.funCaptchaPublicKeys;
      const captchaTypes = [];
      for (const funCaptchaType in CaptchaConstants.funCaptchaPublicKeyMap) {
        if (!CaptchaConstants.funCaptchaPublicKeyMap.hasOwnProperty(funCaptchaType)) {
          return;
        }
        const publicKeyType = CaptchaConstants.funCaptchaPublicKeyMap[funCaptchaType];
        if (publicKeyType && publicKeys.hasOwnProperty(publicKeyType)) {
          captchaTypes.push({
            Type: deCapitalize(funCaptchaType),
            ApiUrl: CaptchaConstants.urls.funCaptchaRedeem[publicKeyType],
            PublicKey: publicKeys[publicKeyType]
          });
        } else {
          console.warn(
            `Missing public key for: ${funCaptchaType}\n\tpublicKeyType: ${publicKeyType}`
          );
        }
      }
      console.debug('Add captcha types from new app:', captchaTypes);
      FunCaptcha.addCaptchaTypes(captchaTypes, false);
      metadataLoaded = true;
    },
    err => {
      console.debug(
        'Failed to load captcha metadata for funCaptchaService. FunCaptcha will not work properly.'
      );
    }
  );

  function setCaptchaType(captchaType) {
    captchaParams.cType = deCapitalize(captchaType);
  }

  function fetchLanguageResources(url) {
    $.ajax({
      method: 'GET',
      url,
      dataType: 'json',
      data: CaptchaConstants.translationRequestParams,
      success: function success(resources) {
        $(`#${CaptchaConstants.messageElementIds.defaultError}`).text(
          resources['Response.CaptchaErrorFailedToVerify']
        );
      }
    });
  }

  function captchaSuccess(captchaToken, captchaId) {
    let captchaDataPayload = null;
    if (captchaToken != null && captchaToken != '') {
      captchaDataPayload = {
        captchaId,
        captchaToken,
        captchaProvider: CaptchaConstants.captchaProviders.arkoseLabs
      };
    }

    if (Hybrid && Hybrid.Navigation) {
      if (captchaDataPayload !== null) {
        Hybrid.Navigation.navigateToFeature({
          feature: CaptchaConstants.hybridEvents.success,
          captchaData: captchaDataPayload
        });
      } else {
        Hybrid.Navigation.navigateToFeature({
          feature: CaptchaConstants.hybridEvents.success
        });
      }
    }

    // For Roblox Studio
    const successElement = document.getElementById(CaptchaConstants.eventElementIds.token);
    if (successElement != null) {
      if (captchaDataPayload !== null) {
        successElement.value = JSON.stringify(captchaDataPayload);
      }
      successElement.dispatchEvent(changeEvent);
    }
  }

  function captchaShown() {
    if (!hasMadeShownNativeCall) {
      if (Hybrid && Hybrid.Navigation) {
        Hybrid.Navigation.navigateToFeature({
          feature: CaptchaConstants.hybridEvents.shown
        });
      }

      const shownElement = document.getElementById(CaptchaConstants.eventElementIds.shown);
      if (shownElement !== null) {
        shownElement.value = CaptchaConstants.hybridEvents.shown;
        shownElement.dispatchEvent(changeEvent);
      }

      hasMadeShownNativeCall = true;
    }
  }

  function createChangeEvent() {
    const changeEvent = document.createEvent('HTMLEvents');
    changeEvent.initEvent('change', false, false);
    return changeEvent;
  }

  function displayErrorMessage() {
    $(`#${CaptchaConstants.messageElementIds.defaultError}`).show();
  }

  function deCapitalize(val) {
    return val.charAt(0).toLowerCase() + val.slice(1);
  }

  return {
    triggerCaptcha,

    setCaptchaType,

    displayErrorMessage,

    fetchLanguageResources,

    // exposed for unit testing
    captchaParams
  };
})();

// Need to expose this function to funCaptcha element to call once FunCaptcha loads
function triggerCaptcha() {
  AppCaptcha.triggerCaptcha();
}

export { triggerCaptcha, AppCaptcha };
