/* eslint-disable */
import $ from 'jquery';
import { Dialog, Intl } from 'Roblox';
import CaptchaConstants from '../constants/captchaConstants';
import CaptchaLogger from './captchaLogger';

const jqFunCaptchaService = (function () {
  const captchaTypes = [];
  const messages = $.extend({}, CaptchaConstants.messages);
  const funCaptchaTokenElem = '#FunCaptcha-Token';
  const funCaptchaIFrameElem = '#fc-iframe-wrap';
  const funCaptchaIFrameFocusTimeout = 500;
  let retryQueued = false;
  let maxRetriesOnValidationFailure = 0;
  let minRetryInterval = 500; // defined in milliseconds
  let maxRetryInterval = 1500; // defined in milliseconds
  const logger = new CaptchaLogger('FunCaptcha');
  const captchaTypeDedupe = {};

  let unifiedCaptchaId = '';
  let dataExchangeBlob = '';
  const captchaInstances = {};
  const defaultParams = {
    cType: null,
    tokenValidationRetries: 0,
    extraValidationParams: {},
    returnTokenInSuccessCb: false,
    inputParams: {
      dataExchange: '',
      unifiedCaptchaId
    },
    solvedCb: $.noop,
    loadedCb: $.noop,
    supressCb: $.noop,
    shownCb: $.noop,
    successCb: $.noop,
    errorCb: $.noop,
    fcInstance: null
  };
  let userStartedFunCaptchaTime;

  function getCaptcha(type) {
    for (let i = 0; i < captchaTypes.length; i++) {
      if (captchaTypes[i].Type === type) {
        return captchaTypes[i];
      }
    }

    return null;
  }

  // resets the funcaptcha instance associated with supplied id.
  function resetFunCaptcha(id) {
    if (captchaInstances[id]) {
      captchaInstances[id].fcInstance.refresh_session();
    }
  }

  /*
       elemId - Id of element to render FC on.
       Values inside params
          cType**: captcha action type to perform
          solvedCb: triggered when users solved FC
          loadedCb: triggered when users solved FC
          suppressCb: triggered when FC doesn't challenge user
          shownCb: triggered when FC shows challenge to user
          successCb**: when user is successful at passing all of Captcha flow
          returnTokenInSuccessCb: return captcha token and provider info if set to true
          inputParams: parameters are required for captcha, e.g. data exchange blob.
          errorCb: when there's an error with the captcha flow
          ** = required.
       */
  function renderFunCaptcha(elemId, params) {
    // Breaking change that should not be triggered. This is sanity checking before removing the whole CAPI V1 module.
    throw new Error('CAPI V1 is deprecated');
    retryQueued = false;
    logger.logTriggered(params.cType);
    if (params.inputParams) {
      dataExchangeBlob =
        params.inputParams.dataExchange == null ? '' : params.inputParams.dataExchange;
      unifiedCaptchaId =
        params.inputParams.unifiedCaptchaId == null ? '' : params.inputParams.unifiedCaptchaId;
    }
    if (captchaInstances[elemId] && captchaInstances[elemId].fcInstance) {
      // if we already rendered this before, just trigger again.
      captchaInstances[elemId].fcInstance.data = { blob: dataExchangeBlob };
      resetFunCaptcha(elemId);
      return elemId;
    }
    const fcParams = makeInstance(elemId, params);
    userStartedFunCaptchaTime = timestamp();
    logger.logInitialized(fcParams.cType);
    const captchaTypeInfo = getCaptcha(fcParams.cType);
    if (captchaTypeInfo == null) {
      logger.logMetadataError(fcParams.cType);
      if (fcParams.errorCb) {
        fcParams.errorCb(CaptchaConstants.errorCodes.failedToLoadProviderScript);
      }
      return elemId;
    }
    try {
      fcParams.fcInstance = new FunCaptcha({
        public_key: captchaTypeInfo.PublicKey,
        target_html: elemId,
        language: getFunCaptchaLanguageCodeFromCurrentLocale(),
        data: { blob: dataExchangeBlob },
        callback() {
          // this is where we do verification with server
          let userSolveFunCaptchaTime = null;
          if (userStartedFunCaptchaTime) {
            userSolveFunCaptchaTime = timestamp() - userStartedFunCaptchaTime;
            userStartedFunCaptchaTime = null;
          }

          const token = getSessionToken();
          logger.logCaptchaTokenReceivedEventToEventStream(fcParams.cType, token, unifiedCaptchaId);

          if (fcParams.returnTokenInSuccessCb === true) {
            logger.logSuccess(fcParams.cType);
            logger.logCaptchaEventToEventStream(
              fcParams.cType,
              userSolveFunCaptchaTime,
              true,
              token
            );
            fcParams.successCb(token, unifiedCaptchaId);
          } else {
            verifyWithServer(fcParams, elemId, token, userSolveFunCaptchaTime, unifiedCaptchaId);
            fcParams.solvedCb();
          }
        },
        loaded_callback() {
          fcLoaded(fcParams.cType);
          fcParams.loadedCb();
        },
        onsuppress() {
          fcSuppressed(fcParams.cType, unifiedCaptchaId);
          fcParams.suppressCb();
        },
        onshown() {
          fcShown(fcParams.cType, unifiedCaptchaId);
          fcParams.shownCb();
        }
      });
    } catch (e) {
      logger.logProviderError(fcParams.cType);
      logger.logCaptchaErrorEventToEventStream(
        fcParams.cType,
        getSessionToken(),
        unifiedCaptchaId,
        e
      );

      if (fcParams.errorCb) {
        fcParams.errorCb(CaptchaConstants.errorCodes.failedToLoadProviderScript, e);
      }
    }
    return elemId;
  }

  function showFunCaptchaInModal() {
    Dialog.open({
      bodyContent: '<div id="funcaptcha-modal-body" class="funcaptcha-modal-body"></div>',
      allowHtmlContentInBody: true,
      showAccept: false,
      showDecline: false,
      xToCancel: true,
      onCloseCallback: dismissFunCaptchaModal
    });
    const captchaElm = $('#game-card-redeem-captcha').removeClass('hidden').detach();
    $('#funcaptcha-modal-body').append(captchaElm);
  }

  function dismissFunCaptchaModal() {
    const captchaElm = $('#game-card-redeem-captcha').addClass('hidden').detach();
    $('#redeem-card-wrapper').append(captchaElm);
    Dialog.close();
  }

  function makeInstance(id, params) {
    const newParams = $.extend({}, defaultParams, params);
    captchaInstances[id] = newParams;
    return newParams;
  }

  // returns the FunCaptcha session token stored in an element
  // that is modified by Arkose Labs' JS API
  function getSessionToken() {
    return $(funCaptchaTokenElem).val();
  }

  function verifyWithServer(fcParams, elemId, token, solveDuration, captchaId) {
    let data = {
      fcToken: token
    };
    data = $.extend({}, data, fcParams.extraValidationParams);
    $.ajax({
      method: 'POST',
      data,
      url: getCaptcha(fcParams.cType).ApiUrl,
      success: function success() {
        logger.logSuccess(fcParams.cType);
        logger.logCaptchaEventToEventStream(fcParams.cType, solveDuration, true, token, captchaId);
        fcParams.successCb();
      },
      error: function error() {
        logger.logFail(fcParams.cType);

        if (fcParams.tokenValidationRetries < maxRetriesOnValidationFailure) {
          if (!retryQueued) {
            retryQueued = true;
            setTimeout(function () {
              retryFunCaptcha(fcParams, elemId);
            }, getRetryInterval());
          }
        } else {
          logger.logMaxFail(fcParams.cType);
          logger.logCaptchaEventToEventStream(
            fcParams.cType,
            solveDuration,
            false,
            token,
            captchaId
          );
          if (fcParams.errorCb) {
            fcParams.errorCb(CaptchaConstants.errorCodes.failedToVerify, null);
          }
        }
      }
    });
  }

  function retryFunCaptcha(fcParams, elemId) {
    if (retryQueued) {
      fcParams.tokenValidationRetries += 1;
      logger.logRetried(fcParams.cType);
      renderFunCaptcha(elemId, fcParams);
    }
  }

  function getRetryInterval() {
    return minRetryInterval + Math.floor(Math.random() * (maxRetryInterval - minRetryInterval));
  }

  function timestamp() {
    return new Date().valueOf();
  }

  function fcSuppressed(cType, captchaId) {
    logger.logSuppressed(cType);
    logger.logCaptchaSuppressedEventToEventStream(cType, getSessionToken(), captchaId);
  }

  function fcShown(cType, captchaId) {
    logger.logDisplayed(cType);
    logger.logCaptchaShownEventToEventStream(cType, getSessionToken(), captchaId);
  }

  function fcLoaded(cType) {
    // This is a fix specifically for iOS8 devices
    // There are several UI issues with forms and selection in iOS 8 Safari
    // FunCaptcha will not function properly if it is rendered immediately after
    // a text form input
    setTimeout(function () {
      $(funCaptchaIFrameElem).focus();
    }, funCaptchaIFrameFocusTimeout);
  }

  function deCapitalize(val) {
    return val.charAt(0).toLowerCase() + val.slice(1);
  }

  function getFunCaptchaLanguageCodeFromCurrentLocale() {
    if (Intl) {
      const intl = new Intl();
      if (CaptchaConstants.localeToFunCaptchaLanguageCodeMap.hasOwnProperty(intl.locale)) {
        return CaptchaConstants.localeToFunCaptchaLanguageCodeMap[intl.locale];
      }
    }

    return undefined;
  }

  return {
    types: $.extend({}, CaptchaConstants.types),

    setMaxRetriesOnTokenValidationFailure(value) {
      maxRetriesOnValidationFailure = value;
    },

    setRetryIntervalRange(min, max) {
      minRetryInterval = min;
      maxRetryInterval = max;
    },

    reset: resetFunCaptcha,

    render: renderFunCaptcha,

    addCaptchaTypes(types, camelCaseTypes) {
      if (!types) {
        return;
      }

      types.forEach(function (type) {
        const captchaType = {
          Type: camelCaseTypes ? deCapitalize(type.Type) : type.Type,
          ApiUrl: type.ApiUrl,
          PublicKey: type.PublicKey
        };

        const dedupeKey = JSON.stringify(captchaType);
        if (!captchaTypeDedupe.hasOwnProperty(dedupeKey)) {
          captchaTypeDedupe[dedupeKey] = captchaType;
          captchaTypes.push(captchaType);
        }
      });
    },

    setPerAppTypeLoggingEnabled(enabled, forceSetAppTypeValue = undefined) {
      logger.setPerAppTypeLoggingEnabled(enabled, forceSetAppTypeValue);
    },

    showFunCaptchaInModal,

    dismissFunCaptchaModal,

    // exposed for unit testing purpose.
    captchaInstances,
    loggerInstance: logger
  };
})();

export default jqFunCaptchaService;
