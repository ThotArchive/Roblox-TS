import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function isEmpty() {
  "ngInject";

  return function (currentVal, replaceVal, validateVal) {
    if (validateVal === "" || validateVal === null || typeof validateVal === "undefined") {
      return replaceVal;
    } else {
      return currentVal;
    }
  };
}

angularJsUtilitiesModule.filter("isEmpty", isEmpty);
export default isEmpty;
