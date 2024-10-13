"use strict";

import '../../../css/captchaCoreBundle.scss';
import Captcha from '../captcha/services/captchaService';
import CaptchaConstants from '../captcha/constants/captchaConstants';
import CaptchaLogger from '../captcha/services/captchaLogger';
import FunCaptcha from '../captcha/services/funCaptchaService';

/**
 *  Please refer to https://github.rbx.com/Roblox/web-platform/blob/7f8f347dd34bea64a2aab52f7c0f178b2615a954/WebApps/Roblox.Captcha.WebApp/Roblox.Captcha.WebApp/js/angular/services/captchaV2Service.js#L24
 * in the old web-platform version of this code. The below constant was initialized in the Roblox object
 * at the call-site. This is to ensure that multiple instances of the captcha modal have distinct IDs for
 * use with the third-party API (Arkos/FunCaptcha): it is necessary to have a single incremental ID spanning
 * multiple instances.
 */
window.Roblox.Captcha = Captcha;
window.Roblox.CaptchaLogger = CaptchaLogger;
window.Roblox.FunCaptcha = FunCaptcha;
window.Roblox.CaptchaV2ServiceCaptchaIdBase = 0;
window.Roblox.CaptchaConstants = CaptchaConstants;

export {
    Captcha,
    CaptchaConstants,
    CaptchaLogger,
    FunCaptcha,
};