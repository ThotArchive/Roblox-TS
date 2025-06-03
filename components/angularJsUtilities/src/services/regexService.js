import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function regexService() {
  "ngInject";

  function getEmailRegex() {
    return Promise.resolve({ Regex: "^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$" });
  }

  return {
    getEmailRegex: getEmailRegex,
  };
}

angularJsUtilitiesModule.factory("regexService", regexService);

export default regexService;
