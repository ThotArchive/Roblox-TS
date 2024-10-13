"use strict";

import $ from 'jquery';

import { BootstrapWidgets, EventStream } from 'Roblox';
import CaptchaConstants from '../constants/captchaConstants';


var Captcha = (function () {
    function capitalize(val) {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }

    function deCapitalize(val) {
        return val.charAt(0).toLowerCase() + val.slice(1);
    }

    function timestamp() {
        return new Date().valueOf();
    }

    //this should have properties equal to the values of types
    //note: there might just be one endpoint for all verification in the future so this will be removed.
    var endpoints = CaptchaConstants.endpoints;

    var containerElemId, mainCaptchaId;

    var modes = {
        invisible: false
    };

    //relevant internal data to this service.
    var serviceData = CaptchaConstants.serviceData;

    var userStartedCaptchaTime;

    var captchaType;
    var captchaSuccessCb, captchaErrorCb, onResponse;

    var captchaCallback = function (captchaResponse) {
        if (typeof onResponse === "function") {
            onResponse();
        }

        var userSolveCaptchaTime = null;
        if (userStartedCaptchaTime) {
            userSolveCaptchaTime = timestamp() - userStartedCaptchaTime;
            logUserCaptchaSolveTime(userSolveCaptchaTime);
            userStartedCaptchaTime = null;
        }
        
        verify(captchaType, captchaResponse, userSolveCaptchaTime);
    }

    function getUserTimeBucketSuffix(userSolveCaptchaTime) {
        var milliseconds = 1000;
        var solvedPrefix = serviceData.captchaSolvedPrefix;
        var timeIntervals = serviceData.captchaSolveTimeIntervals;

        // find user's captcha solve time interval
        for (var i = 0; i < timeIntervals.length; i++) {
            var currentInterval = timeIntervals[i];
            if (userSolveCaptchaTime <= currentInterval.seconds * milliseconds) {
                return solvedPrefix + currentInterval.suffix;
            }
        }

        // solve time larger than all time intervals
        return solvedPrefix + serviceData.captchaSolveTimeLarge;
    }

    function logUserCaptchaSolveTime(userSolveCaptchaTime) {
        var userTimeBucketSuffix = getUserTimeBucketSuffix(userSolveCaptchaTime);
        window.EventTracker && window.EventTracker.fireEvent(capitalize(captchaType + userTimeBucketSuffix));
    }

    function logDataToEventStream(captchaType, solveDuration, isSuccessful) {
        if (EventStream) {
            solveDuration = solveDuration || 0;
            var success = isSuccessful ? "true" : "false";
            var context = captchaType;
            EventStream.SendEventWithTarget("captcha",
                context,
                { solveDuration: solveDuration, success: success, provider: "Google" },
                EventStream.TargetTypes.WWW);
        }
    }

    function verify(captchaType, captchaResponse, solveDuration) {
        var data = {
            'g-Recaptcha-Response': captchaResponse,
            'isInvisible': modes.invisible
        };

        $.ajax({
            method: 'POST',
            data: data,
            success: function success() {
                window.EventTracker && window.EventTracker.fireEvent(capitalize(captchaType + serviceData.successSuffix));
                logDataToEventStream(captchaType, solveDuration, true);
                if (captchaSuccessCb) {
                    captchaSuccessCb();
                    $("#" + containerElemId).empty();
                }
            },
            error: function error() {
                window.EventTracker && window.EventTracker.fireEvent(capitalize(captchaType + serviceData.failSuffix));
                logDataToEventStream(captchaType, solveDuration, false);
                if (captchaErrorCb) {
                    captchaErrorCb();
                }
                if (BootstrapWidgets) {
                    BootstrapWidgets.ToggleSystemMessage($(".alert-warning"), 100, 2000, CaptchaConstants.messages.error);
                }
            },
            url: endpoints[captchaType]
        });
    }

    return {
        ids: CaptchaConstants.ids,

        //currently supported.
        types: CaptchaConstants.types,

        setEndpoint: function setEndpoint(key, val) {
            endpoints[key] = val;
        },

        getEndpoint: function getEndpoint(key) {
            return endpoints[key];
        },

        setInvisibleMode: function (isInvisible) {
            modes.invisible = isInvisible;
        },

        getInvisibleMode: function () {
            return modes.invisible;
        },

        setSiteKey: function (sitekey) {
            serviceData.sitekey = sitekey;
        },

        verify: verify,

        reset: function reset(cType, successCb, errorCb, responseCb) {
            captchaType = cType;
            captchaSuccessCb = successCb;
            captchaErrorCb = errorCb;
            onResponse = responseCb;

            if (window.grecaptcha) {
                window.grecaptcha.reset(mainCaptchaId);
                if (modes.invisible) {
                    window.grecaptcha.execute(mainCaptchaId);
                }
            }
        },

        render: function (elemId, cType, successCb, errorCb, responseCb) {
            captchaType = cType;
            captchaSuccessCb = successCb;
            captchaErrorCb = errorCb;
            onResponse = responseCb;
            containerElemId = elemId;
            if (window.grecaptcha) {
                var setting = {
                    'sitekey': serviceData.sitekey,
                    'callback': captchaCallback,
                    'badge': serviceData.badgePosition
                }
                if (modes.invisible) {
                    setting.size = 'invisible';
                }
                mainCaptchaId = window.grecaptcha.render(elemId, setting);
                window.EventTracker && window.EventTracker.fireEvent(capitalize(captchaType + serviceData.displayedSuffix));
                userStartedCaptchaTime = timestamp();
            }
        },

        execute: function () {
            if (window.grecaptcha && modes.invisible) {
                window.grecaptcha.execute(mainCaptchaId);
            }
        },

        //the goal is that this is not even needed in the future since there
        //should be one endpoint for all types, but for now we need to be able to 
        //set an endpoint for multiple types.
        setMultipleEndpoints: function (types, url) {
            if (!types || !url) {
                return;
            }
            for (var i = 0; i < types.length; i++) {
                var type = deCapitalize(types[i]);
                endpoints[type] = url;
            }
        }
    };
}());


export default Captcha ;
