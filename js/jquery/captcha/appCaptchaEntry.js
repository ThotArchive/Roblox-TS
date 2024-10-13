"use strict";

import '../../../css/appCaptchaBundle.scss';
import { triggerCaptcha, AppCaptcha } from './appCaptcha';
import Captcha from './services/captchaService';
import CaptchaConstants from './constants/captchaConstants';
import CaptchaLogger from './services/captchaLogger';
import FunCaptcha from './services/funCaptchaService';


/**
 *  Please refer to https://github.rbx.com/Roblox/web-platform/blob/7f8f347dd34bea64a2aab52f7c0f178b2615a954/WebApps/Roblox.Captcha.WebApp/Roblox.Captcha.WebApp/js/angular/services/captchaV2Service.js#L24
 * in the old web-platform version of this code. The below constant was initialized in the Roblox object
 * at the call-site. This is to ensure that multiple instances of the captcha modal have distinct IDs for
 * use with the third-party API (Arkos/FunCaptcha): it is necessary to have a single incremental ID spanning
 * multiple instances.
 */
window.Roblox.triggerCaptcha = triggerCaptcha;
window.Roblox.Captcha = Captcha;
window.Roblox.AppCaptcha = AppCaptcha;
window.Roblox.CaptchaLogger = CaptchaLogger;
window.Roblox.FunCaptcha = FunCaptcha;
window.Roblox.CaptchaV2ServiceCaptchaIdBase = 0;
window.Roblox.CaptchaConstants = CaptchaConstants;
window.triggerCaptcha = triggerCaptcha;

export {
    triggerCaptcha,
    AppCaptcha,
    Captcha,
    CaptchaConstants,
    CaptchaLogger,
    FunCaptcha,
};