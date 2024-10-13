"use strict";

import { EnvironmentUrls } from 'Roblox';

Roblox.EnvironmentUrls = Roblox.EnvironmentUrls || {};

const CaptchaConstants = {
    urls: {
        getMetadata: `${EnvironmentUrls.apiGatewayCdnUrl}/captcha/v1/metadata`,

        funCaptchaRedeem: {
            WebSignup: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/signup/web`,
            AppSignup: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/signup/app`,
            WebLogin: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/login/web`,
            AppLogin: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/login/app`,
            WebResetPassword: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/resetpassword/web`,
            UserAction: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/user`,
            WebGamecardRedemption: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/gamecardredemption/web`
        }
    },
    // There must be a key for each value in funCaptchaCaptchaTypes
    funCaptchaPublicKeyMap: {
        Login: 'ACTION_TYPE_WEB_LOGIN',
        AppLogin: 'ACTION_TYPE_WEB_LOGIN',
        Signup: 'ACTION_TYPE_WEB_SIGNUP',
        AppSignup: 'ACTION_TYPE_WEB_SIGNUP',
        JoinGroup: 'ACTION_TYPE_GROUP_JOIN',
        GroupWallPost: 'ACTION_TYPE_GROUP_WALL_POST',
        ResetPassword: 'ACTION_TYPE_WEB_RESET_PASSWORD',
        ToyCodeRedeem: 'ACTION_TYPE_WEB_GAMECARD_REDEMPTION',
        SupportRequest: 'ACTION_TYPE_SUPPORT_REQUEST',
        FollowUser: 'ACTION_TYPE_FOLLOW_USER',
        Generic: 'ACTION_TYPE_GENERIC_CHALLENGE',
        AssetComment: 'ACTION_TYPE_ASSET_COMMENT',
        Marketplace: 'ACTION_TYPE_MARKETPLACE'
    },

    endpoints: {
        sendMessage: '',
        addFriend: '',
        follow: '',
        signup: '',
        joinGroup: '',
        login: '',
        postComment: '',
        clothingUpload: '',
        favorite: '',
        appSignup: '',
        appLogin: '',
        resetPassword: ''
    },

    serviceData: {
        sitekey: '',
        successSuffix: "Captcha_Success",
        failSuffix: "Captcha_Failed",
        displayedSuffix: "Captcha_Displayed",
        captchaSolvedPrefix: "Captcha_User_Solved_InSeconds_",
        captchaSolveTimeIntervals: [
            { seconds: 1, suffix: "Less_Than_1" },
            { seconds: 3, suffix: "1_To_3" },
            { seconds: 10, suffix: "4_To_10" },
            { seconds: 20, suffix: "11_To_20" },
            { seconds: 30, suffix: "21_To_30" },
            { seconds: 40, suffix: "31_To_40" },
            { seconds: 50, suffix: "41_To_50" }
        ],
        captchaSolveTimeLarge: "Greater_Than_50",
        badgePosition: "bottomright",
        //later, we will refactor to just use the object below. So some things are duplicated.
        logConstants: {
            successSuffix: "_Success",
            failSuffix: "_Failed",
            maxFailSuffix: "_MaxFailed",
            retrySuffix: "_Retried",
            displayedSuffix: "_Displayed",
            triggeredSuffix: "_Triggered",
            initializedSuffix: "_Initialized",
            suppressedSuffix: "_Suppressed",
            providerErrorSuffix: "_FailedToLoad",
            metadataErrorSuffix: "_FailedToLoadMetadata",
            completedTimeSequenceSuffix: "_SolveTime",
            solvedPrefix: "_User_Solved_InSeconds_",
            solveTimeIntervals: [
                { seconds: 1, suffix: "Less_Than_1" },
                { seconds: 3, suffix: "1_To_3" },
                { seconds: 10, suffix: "4_To_10" },
                { seconds: 20, suffix: "11_To_20" },
                { seconds: 30, suffix: "21_To_30" },
                { seconds: 40, suffix: "31_To_40" },
                { seconds: 50, suffix: "41_To_50" }
            ],
            solveTimeLarge: "Greater_Than_50",
            eventStreamCaptchaEventName: "captcha",
            eventStreamCaptchaInitiatedEventName: "captchaInitiated",
            eventStreamCaptchaTokenReceivedEventName: "captchaTokenReceived",
            captchaInitiatedChallengeTypes: {
                visible: "visible",
                hidden: "hidden",
                error: "error"
            }
        }
    },

    types: {
        signup: 'signup',
        sendMessage: 'sendMessage',
        addFriend: 'addFriend',
        follow: 'follow',
        joinGroup: 'joinGroup',
        login: "login",
        postComment: "postComment",
        clothingUpload: "clothingUpload",
        favorite: "favorite",
        appSignup: 'appSignup',
        appLogin: 'appLogin',
        gameCardRedeem: 'gameCardRedeem',
        resetPassword: 'resetPassword'
    },

    ids: {
        defaultCaptcha: "captcha-container",
        signup: "signup-captcha",
        login: "login-captcha",
        friends: "friends-captcha",
        groups: "groups-captcha",
        profile: "profile-captcha",
        playerSearch: "player-search-captcha",
        appCaptcha: "app-captcha",
        gameCardRedeem: 'game-card-redeem-captcha',
        resetPassword: 'reset-password-captcha'
    },

    messageElementIds: {
        defaultError: "captcha-error"
    },

    // Used as a substitute for hybrid events when they
    // are not supported and the consumer has access to the
    // webview DOM (i.e. studio)
    eventElementIds: {
        shown: "captcha-event-shown",
        token: "captcha-event-token",
        provider: "captcha-event-provider",
    },

    hybridEvents: {
        shown: "CaptchaShown",
        success: "CaptchaSuccess"
    },

    //Note: we should translate the notes later
    messages: {
        error: "We currently cannot verify CAPTCHA, please try again later.",
        funCaptchaError: "We currently cannot verify FunCaptcha, please try again later."
    },

    translationRequestParams: {
        'consumerType': 'Web',
        'contentNamespace': 'Common.Captcha',
        'Keys': ['Response.CaptchaErrorFailedToVerify']
    },

    errorCodes: {
        failedToLoadProviderScript: 0,
        failedToVerify: 1
    },

    localeToFunCaptchaLanguageCodeMap: {
        "de-de": "de",
        "en-us": "en",
        "es-es": "es",
        "fr-fr": "fr",
        "pt-br": "pt-br",
        "ko-kr": "ko",
        "zh-cn": "zh",
        "zh-tw": "zh-tw",
        "ja-jp": "ja"
    },
    appTypes: {
        "android": "android",
        "ios": "ios",
        "xbox": "xbox",
        "uwp": "uwp",
        "studio-windows": "studio-windows",
        "studio-mac": "studio-mac",
        "studio-luobu-windows": "studio-luobu-windows",
        "studio-luobu-mac": "studio-luobu-mac",
        "unknown": "unknown"
    },
    captchaProviders: {
        arkoseLabs: "PROVIDER_ARKOSE_LABS"
    },
    metadataLoadParameters: {
        timeoutMilliseconds: 10000,
        waitIntervalMilliseconds: 100
    }
};

export default CaptchaConstants;
