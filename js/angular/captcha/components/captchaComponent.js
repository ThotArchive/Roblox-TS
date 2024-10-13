"use strict";
import captchaV2 from '../captchaV2Module';

const captchaV2Component = {
    templateUrl: "captcha",
    bindings: {
        "activated": "=",
        "captchaActionType": "<",
        "extraValidationParams": "<",
        "returnTokenInSuccessCb": "<",
        "inputParams": "<",
        "captchaPassed": "&",
        "captchaFailed": "&",
        "captchaDismissed": "&?"
    },
    controller: "captchaV2Controller"
};


captchaV2.component("captcha", captchaV2Component);

export default captchaV2Component;
