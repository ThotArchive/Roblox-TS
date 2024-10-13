/* eslint-disable */
import CaptchaConstants from '../../../jquery/captcha/constants/captchaConstants';
import FunCaptcha from '../../../jquery/captcha/services/funCaptchaService';
import captchaV2 from '../captchaV2Module';

function funCaptchaService($q, $log, $window, captchaV2Constants, captchaV2Service) {
  'ngInject';

  const events = {};

  const fireEvent = function (funCaptchaType, eventName, data) {
    if (!events.hasOwnProperty(funCaptchaType)) {
      return;
    }

    events[funCaptchaType].forEach(function (event) {
      if (event.name === eventName) {
        event.handle(data);
      }
    });
  };

  const addEvent = function (funCaptchaType, eventName, handler) {
    if (handler) {
      events[funCaptchaType] = events[funCaptchaType] || [];
      events[funCaptchaType].push({
        name: eventName,
        handle: handler
      });
    }
  };

  const clearEvents = function (funCaptchaType) {
    events[funCaptchaType] = [];
  };

  const mapFunCaptchaErrorCodeToCaptchaV2ErrorCode = function (funcaptchaErrorCode) {
    switch (funcaptchaErrorCode) {
      case CaptchaConstants.errorCodes.failedToLoadProviderScript:
        return captchaV2Constants.errorCodes.internal.failedToLoadProviderScript;
      case CaptchaConstants.errorCodes.failedToVerify:
        return captchaV2Constants.errorCodes.internal.failedToVerify;
      default:
        return captchaV2Constants.errorCodes.internal.unknown;
    }
  };

  const render = function (
    elementId,
    captchaActionType,
    shownEvent,
    returnTokenInSuccessCb,
    inputParams,
    extraValidationParams
  ) {
    // Breaking change that should not be triggered. This is sanity checking before removing the whole CAPI V1 module.
    throw new Error('CAPI V1 is deprecated');
    return $q(function (resolve, reject) {
      const funCaptchaType = captchaV2Constants.funCaptchaCaptchaTypes[captchaActionType];
      let captchaInfo = `\n\telementId: ${elementId}\n\tcaptchaActionType: ${captchaActionType}\n\tfunCaptchaType: ${funCaptchaType}`;

      $log.debug(`Render captcha${captchaInfo}`);

      if (!funCaptchaType) {
        $log.warn(`Missing funCaptchaType for ${captchaActionType}`);
        reject(captchaV2Constants.errorCodes.internal.missingActionType);
        return;
      }

      addEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve, resolve);
      addEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.reject, reject);
      addEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.shown, shownEvent);

      let successCb;
      if (returnTokenInSuccessCb) {
        successCb = function (fcToken, unifiedCaptchaId) {
          captchaInfo += `\ntoken: ${fcToken}`;
          $log.debug(`Passed captcha${captchaInfo}`);
          // Keep the backward compatibility with existing version of code.
          if (unifiedCaptchaId === null || unifiedCaptchaId === '') {
            fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve, fcToken);
          } else {
            fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve, {
              token: fcToken,
              unifiedCaptchaId
            });
          }
          clearEvents(funCaptchaType);
        };
      } else {
        successCb = function () {
          $log.debug(`Passed captcha${captchaInfo}`);
          fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve);
          clearEvents(funCaptchaType);
        };
      }

      FunCaptcha.render(elementId, {
        cType: funCaptchaType,

        inputParams,

        returnTokenInSuccessCb,

        // These methods are thrown away on subsequent calls.
        successCb,

        shownCb() {
          $log.debug(`Captcha shown${captchaInfo}`);
          fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.shown);
        },

        errorCb(errorCode, exception) {
          if (exception) {
            $log.error(`Failed captcha (${errorCode}:) ${exception}${captchaInfo}`);
          } else {
            $log.debug(`Failed captcha (${errorCode})${captchaInfo}`);
          }

          const externalErrorCode = mapFunCaptchaErrorCodeToCaptchaV2ErrorCode(errorCode);

          fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.reject, externalErrorCode);
          clearEvents(funCaptchaType);
        },

        extraValidationParams: extraValidationParams || {}
      });
    });
  };

  captchaV2Service.getMetadata().then(
    function (metadata) {
      const publicKeys = metadata.funCaptchaPublicKeys;
      const captchaTypes = [];

      for (const funCaptchaType in captchaV2Constants.funCaptchaPublicKeyMap) {
        if (!captchaV2Constants.funCaptchaPublicKeyMap.hasOwnProperty(funCaptchaType)) {
          return;
        }

        const publicKeyType = captchaV2Constants.funCaptchaPublicKeyMap[funCaptchaType];
        if (publicKeyType && publicKeys.hasOwnProperty(publicKeyType)) {
          captchaTypes.push({
            Type: funCaptchaType,
            ApiUrl: captchaV2Constants.urls.funCaptchaRedeem[publicKeyType], // this does not need to be defined for BEDEV2
            PublicKey: publicKeys[publicKeyType]
          });
        } else {
          $log.warn(`Missing public key for: ${funCaptchaType}\n\tpublicKeyType: ${publicKeyType}`);
        }
      }

      $log.debug('Add captcha types from new webapp:', captchaTypes);

      FunCaptcha.addCaptchaTypes(captchaTypes, false);
    },
    function () {
      $log.debug(
        'Failed to load captcha metadata for funCaptchaService. FunCaptcha will not work properly.'
      );
    }
  );

  return {
    render
  };
}

captchaV2.factory('funCaptchaService', funCaptchaService);

export default funCaptchaService;
