import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

/*
Service for code validation, or code related stuff.
Currently just verifies code
*/
function numericCodeService($log) {
    "ngInject";

    //js variables
    function checkCode(code, codeLength) {
        $log.debug(code, codeLength);
        return code && code.length === codeLength && /^\d+$/.test(code);
    }

    return {
        checkCode: checkCode
    };
};

angularJsUtilitiesModule.factory("numericCodeService", numericCodeService);

export default numericCodeService;