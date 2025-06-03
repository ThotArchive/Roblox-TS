import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function quote(text) {
  return `"${text}"`;
}

function quoteText() {
  "ngInject";

  return function (input) {
    return quote(input);
  };
}

angularJsUtilitiesModule.filter("quoteText", quoteText);
export default quoteText;
