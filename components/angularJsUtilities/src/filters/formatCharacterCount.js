import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function formatCharacterCount() {
  "ngInject";

  return function (numCharacters, maxCharacters) {
    return numCharacters + "/" + maxCharacters;
  };
}

angularJsUtilitiesModule.filter("formatCharacterCount", formatCharacterCount);
export default formatCharacterCount;
