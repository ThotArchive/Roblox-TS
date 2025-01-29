import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import ValidEmailRegex from "../constants/regexConstants";

function regexService() {
    function getEmailRegex() {
        return Promise.resolve({ Regex: ValidEmailRegex });
    }
    
    return {
        getEmailRegex: getEmailRegex
    }
};

angularJsUtilitiesModule.factory("regexService", regexService);

export default regexService;