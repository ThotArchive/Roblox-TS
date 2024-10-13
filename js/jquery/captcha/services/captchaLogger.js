import $ from 'jquery';
import { DeviceMeta, EventStream, UrlParser } from 'Roblox';
import EventTimer from '../../../common/eventTimer';
import {
  EventCaptchaMetricName,
  FunCaptchaV1,
  recordMetric,
  SolveTimeCaptchaMetricName
} from '../../../common/request/apis/metrics';
import CaptchaConstants from '../constants/captchaConstants';

/*
 * This should be the logging service used by Captcha related code.
 * Google's recaptcha will be refactored to use this later.
 * Usage: logger = new Roblox.CaptchaLogger("FunCaptcha");
 */
function CaptchaLogger(provider) {
  const constants = CaptchaConstants;
  const serviceData = $.extend({}, constants.serviceData);
  const { logConstants } = serviceData;
  let perAppTypeLoggingEnabled = false;
  let appType;

  this.provider = provider;
  this.eventTimer = new EventTimer();

  this.setPerAppTypeLoggingEnabled = function (enabled, forceSetAppTypeValue = undefined) {
    // Only enable logging if we find a valid device type through a URL query
    // parameter or the device type meta tag
    let setAppType = null;
    if (forceSetAppTypeValue !== undefined) {
      appType = forceSetAppTypeValue;
      return;
    }
    if (UrlParser) {
      const queryAppType = UrlParser.getParameterValueByName('appType');
      if (constants && constants.appTypes && constants.appTypes.hasOwnProperty(queryAppType)) {
        setAppType = queryAppType;
      }
    }
    if (setAppType == null && DeviceMeta && DeviceMeta().isInApp) {
      setAppType = DeviceMeta().appType;
    }
    if (setAppType !== null) {
      perAppTypeLoggingEnabled = enabled;
      appType = setAppType;
    }
  };

  // fires a new Prometheus event
  this.fireEventCaptcha = function (cType, eventName) {
    recordMetric({
      name: EventCaptchaMetricName,
      value: 1,
      labelValues: {
        action_type: capitalize(cType),
        event_type: capitalize(this.provider + eventName),
        application_type: appType || 'unknown',
        version: FunCaptchaV1
      }
    })
      // Swallow errors if metrics failed to send; this should not be fatal.
      .catch(() => {});
  };

  // fires a new Prometheus event for solve time
  this.fireSolveTimeCaptcha = function (cType, eventName, eventTime) {
    recordMetric({
      name: SolveTimeCaptchaMetricName,
      value: eventTime,
      labelValues: {
        action_type: capitalize(cType),
        event_type: capitalize(this.provider + eventName),
        application_type: appType || 'unknown',
        version: FunCaptchaV1
      }
    })
      // Swallow errors if metrics failed to send; this should not be fatal.
      .catch(() => {});
  };

  // exposed for unit testing
  this.fireEvent = function (cType, eventName) {
    this.fireEventCaptcha(cType, eventName);
    eventName = capitalize(cType + this.provider + eventName);
    if (window.EventTracker) {
      window.EventTracker.fireEvent(appendAppTypeIfEnabled(eventName));
    }
  };

  this.startStatisticsSequence = function (eventName) {
    this.eventTimer.start(eventName);
    if (window.EventTracker) {
      // This will not log to an ephemeral statistics sequence until one of the
      // "end" functions is called
      window.EventTracker.start(appendAppTypeIfEnabled(eventName));
    }
  };

  this.endStatisticsSequenceWithSuccess = function (eventName) {
    if (window.EventTracker) {
      window.EventTracker.endSuccess(appendAppTypeIfEnabled(eventName));
    }
  };

  this.endStatisticsSequenceWithFailure = function (eventName) {
    if (window.EventTracker) {
      window.EventTracker.endFailure(appendAppTypeIfEnabled(eventName));
    }
  };

  this.logSuccess = function (cType) {
    const eventName = capitalize(cType + this.provider + logConstants.completedTimeSequenceSuffix);
    this.fireEvent(cType, logConstants.successSuffix);
    this.fireSolveTimeCaptcha(cType, logConstants.successSuffix, this.eventTimer.end(eventName));
    this.endStatisticsSequenceWithSuccess(eventName);
  };

  this.logFail = function (cType) {
    this.fireEvent(cType, logConstants.failSuffix);
  };

  this.logMaxFail = function (cType) {
    const eventName = capitalize(cType + this.provider + logConstants.completedTimeSequenceSuffix);
    this.fireEvent(cType, logConstants.maxFailSuffix);
    this.fireSolveTimeCaptcha(
      cType,
      logConstants.completedTimeSequenceSuffix,
      this.eventTimer.end(eventName)
    );
    this.endStatisticsSequenceWithFailure(eventName);
  };

  this.logRetried = function (cType) {
    this.fireEvent(cType, logConstants.retrySuffix);
  };

  this.logTriggered = function (cType) {
    this.fireEvent(cType, logConstants.triggeredSuffix);
    this.startStatisticsSequence(
      capitalize(cType + this.provider + logConstants.completedTimeSequenceSuffix)
    );
  };

  this.logInitialized = function (cType) {
    this.fireEvent(cType, logConstants.initializedSuffix);
  };

  this.logSuppressed = function (cType) {
    this.fireEvent(cType, logConstants.suppressedSuffix);
  };

  this.logDisplayed = function (cType) {
    this.fireEvent(cType, logConstants.displayedSuffix);
  };

  this.logProviderError = function (cType) {
    this.fireEvent(cType, logConstants.providerErrorSuffix);
  };

  this.logMetadataError = function (cType) {
    this.fireEvent(cType, logConstants.metadataErrorSuffix);
  };

  this.logCaptchaShownEventToEventStream = function (cType, sessionToken, captchaId) {
    this.logCaptchaInitiatedEventToEventStream(
      cType,
      logConstants.captchaInitiatedChallengeTypes.visible,
      sessionToken,
      captchaId
    );
  };

  this.logCaptchaSuppressedEventToEventStream = function (cType, sessionToken, captchaId) {
    this.logCaptchaInitiatedEventToEventStream(
      cType,
      logConstants.captchaInitiatedChallengeTypes.hidden,
      sessionToken,
      captchaId
    );
  };

  this.logCaptchaErrorEventToEventStream = function (cType, sessionToken, captchaId, exception) {
    this.logCaptchaInitiatedEventToEventStream(
      cType,
      logConstants.captchaInitiatedChallengeTypes.error,
      sessionToken,
      captchaId,
      exception.toString()
    );
  };

  this.logCaptchaInitiatedEventToEventStream = function (
    cType,
    captchaChallengeType,
    sessionToken,
    captchaId,
    message
  ) {
    if (EventStream) {
      const context = cType;
      const eventParams = { type: captchaChallengeType, provider: this.provider };

      if (sessionToken !== '' && typeof sessionToken !== 'undefined') {
        eventParams.session = sessionToken;
      }

      if (captchaId !== '' && typeof captchaId !== 'undefined') {
        eventParams.ucid = captchaId;
      }

      if (message !== '' && typeof message !== 'undefined') {
        eventParams.message = message;
      }

      EventStream.SendEventWithTarget(
        logConstants.eventStreamCaptchaInitiatedEventName,
        context,
        eventParams,
        EventStream.TargetTypes.WWW
      );
    }
  };

  this.logCaptchaTokenReceivedEventToEventStream = function (cType, sessionToken, captchaId) {
    if (EventStream) {
      const context = cType;
      EventStream.SendEventWithTarget(
        logConstants.eventStreamCaptchaTokenReceivedEventName,
        context,
        { provider: this.provider, session: sessionToken, ucid: captchaId || '' },
        EventStream.TargetTypes.WWW
      );
    }
  };

  this.logCaptchaEventToEventStream = function (
    cType,
    solveDuration,
    isSuccessful,
    sessionToken,
    captchaId
  ) {
    if (EventStream) {
      solveDuration = solveDuration || 0;
      const success = isSuccessful ? 'true' : 'false';
      const context = cType;
      EventStream.SendEventWithTarget(
        logConstants.eventStreamCaptchaEventName,
        context,
        {
          solveDuration,
          success,
          provider: this.provider,
          session: sessionToken || '',
          ucid: captchaId || ''
        },
        EventStream.TargetTypes.WWW
      );
    }
  };

  function appendAppTypeIfEnabled(eventName) {
    if (perAppTypeLoggingEnabled && typeof appType !== 'undefined') {
      return `${eventName}_${appType}`;
    }

    return eventName;
  }

  function capitalize(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
  }
}

export default CaptchaLogger;
