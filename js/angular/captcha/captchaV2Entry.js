import angular from "angular";
import { importFilesUnderPath, templateCacheGenerator } from "roblox-es6-migration-helper";

import "../../../css/captchaV2Bundle.scss";

import captchaV2Module from "./captchaV2Module";

import {Captcha, CaptchaConstants, CaptchaLogger, FunCaptcha, triggerCaptcha} from "../../jquery/captcha/appCaptchaEntry";

importFilesUnderPath(require.context("./constants/", true, /\.js$/));
importFilesUnderPath(require.context("./values/", true, /\.js$/));
importFilesUnderPath(require.context("./services/", true, /\.js$/));
importFilesUnderPath(require.context("./controllers/", true, /\.js$/));
importFilesUnderPath(require.context("./components/", true, /\.js$/));

let captchaV2TemplateContext = require.context("./", true, /\.html$/);

templateCacheGenerator(angular, "captchaV2Templates", captchaV2TemplateContext);
window.Roblox.CaptchaLogger = CaptchaLogger;
window.Roblox.FunCaptcha = FunCaptcha;
window.Roblox.CaptchaConstants = CaptchaConstants;
window.Roblox.triggerCaptcha = triggerCaptcha
window.Roblox.Captcha = Captcha;

export default captchaV2Module ;