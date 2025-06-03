import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function reverse() {
  "ngInject";

  return function (items) {
    if (items && items.length > 0) {
      return items.slice().reverse();
    }
  };
}

angularJsUtilitiesModule.filter("reverse", reverse);
export default reverse;
