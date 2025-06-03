import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function camelCase($filter) {
  "ngInject";
  return function (string) {
    return string.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
      if (p2) {
        return p2.toUpperCase();
      }
      return p1.toLowerCase();
    });
  };
}

angularJsUtilitiesModule.filter("camelCase", camelCase);
export default camelCase;
