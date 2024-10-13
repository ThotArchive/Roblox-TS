import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function errorMessageService() {
    "ngInject";

    this.createErrorMapper = function (errorMap, defaultErrorMsg) {
        var errorMapper = {
            defaultError: defaultErrorMsg
        };

        angular.extend(errorMapper, errorMap);

        errorMapper.getErrorMessage = function (code) {
            return this[code] || this["defaultError"];
        };

        errorMapper.getErrorMessageFromResponse = function (errorResponse) {
            // if errorResponse is not properly formatted with a code, the default error message will show.
            var code = "defaultError";
            if (errorResponse && errorResponse.errors && errorResponse.errors[0] && errorResponse.errors[0].hasOwnProperty("code")) {
                code = errorResponse.errors[0].code;
            }
            return errorMapper.getErrorMessage(code);
        };

        return errorMapper;
    }

    return this;
}

angularJsUtilitiesModule.factory("errorMessageService", errorMessageService);

export default errorMessageService;