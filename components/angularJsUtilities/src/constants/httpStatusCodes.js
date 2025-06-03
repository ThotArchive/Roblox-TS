import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const httpStatusCodes = {
  conflict: 409,
  tooManyAttempts: 429,
};

angularJsUtilitiesModule.constant("httpStatusCodes", httpStatusCodes);
export default httpStatusCodes;
