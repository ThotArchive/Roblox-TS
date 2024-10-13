import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function regexService(httpService, urlService) {
    "ngInject";
     var emailRegexUrl = "/regex/email";

    function getEmailRegex() {
        var url = emailRegexUrl;
        var urlConfig = {
            url: urlService.getAbsoluteUrl(url)
        }

        return httpService.httpGet(urlConfig, null);
    }
    
    return {
        getEmailRegex: getEmailRegex
    }
};

angularJsUtilitiesModule.factory("regexService", regexService);

export default regexService;